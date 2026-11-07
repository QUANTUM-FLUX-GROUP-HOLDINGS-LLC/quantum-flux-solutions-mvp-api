import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../modules/shared/auth-context';

export default function AdminIndex() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role === 'CLIENT') {
      router.replace('/staff-login');
      return;
    }
    router.replace('/admin/dashboard');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
