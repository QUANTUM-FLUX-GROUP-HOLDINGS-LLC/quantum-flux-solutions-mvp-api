import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';
import { apiFetch } from '../../modules/shared/api';
import toast from 'react-hot-toast';
import { Users, FileText, ShieldAlert, RefreshCw } from 'lucide-react';

interface Metrics {
  totalClients: number;
  activeDisputes: number;
  totalDocs: number;
}

const EMPTY_METRICS: Metrics = { totalClients: 0, activeDisputes: 0, totalDocs: 0 };

interface MetricCardProps {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ReactNode;
  iconClasses: string;
}

function MetricCard({ label, value, loading, icon, iconClasses }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {label}
          </p>
          {loading ? (
            <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse" aria-hidden="true" />
          ) : (
            <h2 className="text-3xl font-bold text-gray-900 tabular-nums">{value ?? 0}</h2>
          )}
        </div>
        <div className={`p-3 rounded-lg shrink-0 ${iconClasses}`}>{icon}</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Metrics>('/admin/metrics');
      setMetrics(data ?? EMPTY_METRICS);
      setLastUpdated(new Date());
    } catch {
      setError('Could not load metrics. Please try again.');
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  return (
    <AdminLayout>
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of your organization&rsquo;s activity and performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && !loading && (
            <span className="text-xs text-gray-400">
              Last updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={() => void loadMetrics()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between gap-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3"
        >
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={() => void loadMetrics()}
            className="text-sm font-semibold underline underline-offset-2 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Clients"
              value={metrics.totalClients}
              loading={false}
              icon={<Users className="w-6 h-6" />}
              iconClasses="bg-blue-50 text-blue-600"
            />
            <MetricCard
              label="Active Disputes"
              value={metrics.activeDisputes}
              loading={false}
              icon={<ShieldAlert className="w-6 h-6" />}
              iconClasses="bg-red-50 text-red-600"
            />
            <MetricCard
              label="Total Documents"
              value={metrics.totalDocs}
              loading={false}
              icon={<FileText className="w-6 h-6" />}
              iconClasses="bg-emerald-50 text-emerald-600"
            />
          </>
        )}
      </div>

      {/* Future charts placeholder */}
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Client Status Breakdown</h3>
        <p className="text-gray-500">
          More detailed charts will appear here as your client base grows.
        </p>
      </div>
    </AdminLayout>
  );
}
