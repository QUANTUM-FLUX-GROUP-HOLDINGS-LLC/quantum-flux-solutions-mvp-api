import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '8px' } }} />;
}
