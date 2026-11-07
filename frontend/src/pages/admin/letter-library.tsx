import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LetterLibraryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/credit');
  }, [router]);
  return <div>Redirecting to Credit Repair...</div>;
}
