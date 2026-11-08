import type { AdminClient } from '../CreditModule';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const CreditMetrics = ({ clients }: { clients: AdminClient[] }) => {
  const total = clients.length;
  const newEnrollments = clients.filter(
    (c) => c.createdAt && new Date(c.createdAt).getTime() > Date.now() - THIRTY_DAYS_MS,
  ).length;
  const active = clients.filter((c) => c.role === 'CLIENT').length;

  const stats = [
    { label: 'TOTAL CLIENTS', value: total, sub: '' },
    { label: 'NEW ENROLLMENTS (30D)', value: newEnrollments, sub: '' },
    { label: 'ACTIVE', value: active, sub: '' },
    { label: 'NEEDS ATTENTION', value: 0, sub: 'All Clear' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
            {stat.label}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums">{stat.value}</p>
          {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
        </div>
      ))}
    </div>
  );
};
