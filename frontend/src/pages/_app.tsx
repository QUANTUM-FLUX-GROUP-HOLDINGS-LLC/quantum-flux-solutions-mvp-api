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

    const hostname = window.location.hostname;
    const isStaffDomain = hostname.startsWith('staff');
    const path = router.pathname;

    // Ignoramos archivos estáticos y API
    if (path.startsWith('/_next') || path.startsWith('/api') || path === '/_error' || path === '/404') return;

    if (isStaffDomain) {
      // 🛑 DOMINIO DE STAFF (staff.local)
      
      // 1. Si hay un cliente logueado, lo expulsamos
      if (user && user.role === 'CLIENT') {
        signOut(); // Borra el token
        router.replace('/staff-login');
        return;
      }
      // 2. Si no hay usuario, lo mandamos al login de staff
      if (!user && path !== '/staff-login') {
        router.replace('/staff-login');
        return;
      }
      // 3. Si es Staff y está en una ruta de cliente, lo mandamos a su dashboard
      if (user && !path.startsWith('/admin') && path !== '/staff-login') {
        router.replace('/admin/dashboard');
        return;
      }

    } else {
      // 🛑 DOMINIO DE CLIENTE (localhost o client.local)

      // Si intenta entrar a rutas de admin o al login de staff, lo rebotamos
      if (path.startsWith('/admin') || path === '/staff-login') {
        router.replace('/login');
        return;
      }
    }
  }, [router.pathname, user, loading, signOut, router]);

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
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#333', color: '#fff', borderRadius: '8px' },
        }}
      />
    </AuthProvider>
  );
}
