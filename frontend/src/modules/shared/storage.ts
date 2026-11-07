export const getStoragePrefix = () => {
  if (typeof window === 'undefined') return 'client_';
  // Funciona en local (staff.local) y en producción (rutas /admin o /staff-login)
  const isStaff = window.location.hostname.startsWith('staff') || 
                  window.location.pathname.startsWith('/admin') || 
                  window.location.pathname === '/staff-login';
  return isStaff ? 'staff_' : 'client_';
};
