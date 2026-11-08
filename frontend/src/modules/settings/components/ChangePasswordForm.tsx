import { useMemo, useState } from 'react';
import { apiFetch } from '../../shared/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle } from 'lucide-react';

// Verified against backend/src/auth/auth.controller.ts (@Post('change-password')).
// The backend derives the user from the session token; only passwords travel in the body.
const CHANGE_PASSWORD_ENDPOINT = '/auth/change-password';

const MIN_PASSWORD_LENGTH = 8;

interface PasswordStrength {
  score: number; // 0-3
  label: string;
}

function getStrength(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= MIN_PASSWORD_LENGTH) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Weak', 'Weak', 'Good', 'Strong'];
  return { score, label: labels[score] };
}

/**
 * Shared password change form used by both the client portal
 * and the admin portal settings pages.
 */
export const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(newPassword), [newPassword]);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    Boolean(currentPassword) &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    passwordsMatch &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      await apiFetch(CHANGE_PASSWORD_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast.success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <input
          id="currentPassword"
          type={showPasswords ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full max-w-md border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          id="newPassword"
          type={showPasswords ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          className="w-full max-w-md border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {newPassword && (
          <div className="mt-2 flex items-center gap-2 max-w-md" aria-live="polite">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    strength.score >= level
                      ? strength.score === 1
                        ? 'bg-red-400'
                        : strength.score === 2
                          ? 'bg-yellow-400'
                          : 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 w-14">{strength.label}</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type={showPasswords ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          className="w-full max-w-md border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {confirmPassword && (
          <p
            className={`text-xs mt-1.5 flex items-center gap-1 ${
              passwordsMatch ? 'text-green-600' : 'text-red-600'
            }`}
            aria-live="polite"
          >
            {passwordsMatch ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" /> Passwords match
              </>
            ) : (
              'Passwords do not match yet.'
            )}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowPasswords((s) => !s)}
          className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1.5"
        >
          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPasswords ? 'Hide passwords' : 'Show passwords'}
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </form>
  );
};
