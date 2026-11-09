import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '../modules/shared/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (loading || typeof window === 'undefined') return;

    const path = router.pathname;
    // Fixed logic: detect staff by domain or by route (useful on Vercel)
    const isStaffDomain = window.location.hostname.startsWith('staff') || 
                          path.startsWith('/admin');

    if (path.startsWith('/_next') || path.startsWith('/api') || path === '/_error' || path === '/404') return;

    if (isStaffDomain) {
      // Staff domain: only staff allowed
      if (user && user.role === 'CLIENT') {
        signOut();
        router.replace('/login');
        return;
      }
      if (!user && path !== '/login') {
        router.replace('/login');
        return;
      }
      if (user && path === '/login') {
        router.replace('/admin/dashboard');
        return;
      }
      if (user && !path.startsWith('/admin')) {
        router.replace('/admin/dashboard');
        return;
      }
    } else {
      // Client domain: block admin routes
      if (path.startsWith('/admin')) {
        router.replace('/login');
        return;
      }
      if (!user && path.startsWith('/dashboard')) {
        router.replace('/login');
        return;
      }
    }
  }, [router.pathname, user, loading, router, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <RouteGuard>
        <Component {...pageProps} />
      </RouteGuard>
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '8px' } }} />
    </AuthProvider>
  );
}
