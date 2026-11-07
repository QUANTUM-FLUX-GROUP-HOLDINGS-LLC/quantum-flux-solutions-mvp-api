export const getStoragePrefix = () => {
  if (typeof window === 'undefined') return 'client_';
  return window.location.hostname.startsWith('staff') ? 'staff_' : 'client_';
};
