import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/staff-login'); return; }
    const user = JSON.parse(u);
    
    if (user.role === 'ADMIN') router.push('/admin/dashboard');
    else if (user.role === 'CREDIT_REPAIR') router.push('/admin/credit');
    else if (user.role === 'TAX_PERSONAL') router.push('/admin/tax-personal');
    else if (user.role === 'TAX_BUSINESS') router.push('/admin/tax-business');
    else if (user.role === 'BOOKKEEPING') router.push('/admin/bookkeeping');
    else router.push('/dashboard');
  }, [router]);
  return <div>Redirecting...</div>;
}
