import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, KeyRound, Loader2 } from 'lucide-react';
import { apiFetch } from '../modules/shared/api';

const MIN_PASSWORD_LENGTH = 8;

type Status = 'LOADING_TOKEN' | 'READY' | 'SUBMITTING' | 'DONE' | 'INVALID_TOKEN';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('LOADING_TOKEN');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // In the Pages Router, query params resolve asynchronously (router.isReady).
  useEffect(() => {
    if (!router.isReady) return;
    const t = typeof router.query.token === 'string' ? router.query.token : '';
    if (!t) {
      setErrorMsg('This link is missing its reset token. Please request a new one.');
      setStatus('INVALID_TOKEN');
      return;
    }
    setToken(t);
    setStatus('READY');
  }, [router.isReady, router.query.token]);

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match.');
      return;
    }

    setStatus('SUBMITTING');
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      toast.success('Password updated. You can now log in.');
      setStatus('DONE');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not reset password.');
      setStatus('INVALID_TOKEN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        {status === 'LOADING_TOKEN' && (
          <div className="flex flex-col items-center gap-3 py-8 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Validating reset link…</p>
          </div>
        )}

        {status === 'DONE' && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Password Updated</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been changed successfully.
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-indigo-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'INVALID_TOKEN' && (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Link Unavailable</h1>
            <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
            <Link
              href="/forgot-password"
              className="inline-block w-full bg-indigo-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Request a New Link
            </Link>
          </div>
        )}

        {(status === 'READY' || status === 'SUBMITTING') && (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 mb-6">
              <KeyRound className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Set a New Password</h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              This link is valid for 15 minutes from the moment it was requested.
            </p>

            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm mb-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {confirmPassword && (
              <p
                className={`text-xs mb-4 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}
                aria-live="polite"
              >
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match yet.'}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'SUBMITTING'}
              className="mt-2 w-full bg-indigo-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-colors"
            >
              {status === 'SUBMITTING' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'SUBMITTING' ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
