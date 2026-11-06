import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css'; // Asegúrate de que esta ruta sea la correcta para tus estilos

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { background: '#333', color: '#fff', borderRadius: '8px' } 
        }} 
      />
    </>
  );
}
