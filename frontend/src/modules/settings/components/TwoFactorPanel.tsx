import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { API_URL } from '../../shared/api';
import { getSessionToken } from '../../shared/storage';

type PanelStep = 'idle' | 'scan' | 'activated';

function authHeaders(extra?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function TwoFactorPanel() {
  const [step, setStep] = useState<PanelStep>('idle');
  const [otpauth, setOtpauth] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function startSetup() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/2fa/setup`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.status >= 400) throw new Error('Could not start 2FA setup. Staff accounts only.');
      const data: { otpauth: string; secret: string } = await res.json();
      setOtpauth(data.otpauth);
      setSecret(data.secret);
      setCode('');
      setStep('scan');
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function activate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch(`${API_URL}/auth/2fa/activate`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ code }),
      });
      if (res.status >= 400) throw new Error('Invalid verification code. Try again or restart setup.');
      const data: { recoveryCodes?: string[] } = await res.json();
      setRecoveryCodes(Array.isArray(data.recoveryCodes) ? data.recoveryCodes : []);
      setStep('activated');
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function finish() {
    setStep('idle');
    setOtpauth('');
    setSecret('');
    setCode('');
    setRecoveryCodes([]);
    setCopied(false);
    setError(null);
  }

  if (step === 'activated') {
    return (
      <div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-sm font-semibold text-amber-800">
            Save these recovery codes now — they are shown only once.
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Each code redeems exactly one 2FA challenge. If you lose them and your authenticator,
            you will be locked out.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {recoveryCodes.map((c) => (
            <code key={c} className="block bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-mono text-center">
              {c}
            </code>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={copyCodes}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {copied ? 'Copied to clipboard' : 'Copy all codes'}
          </button>
          <button
            type="button"
            onClick={finish}
            className="bg-[#0f4c81] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#0a3a63]"
          >
            I saved my codes
          </button>
        </div>
      </div>
    );
  }

  if (step === 'scan') {
    return (
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password...),
          then enter the 6-digit code it shows to confirm.
        </p>
        <div className="flex justify-center mb-4">
          <QRCodeSVG value={otpauth} size={180} />
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Cannot scan? Enter this key manually:{' '}
          <code className="font-mono bg-gray-50 border border-gray-200 rounded px-2 py-0.5">{secret}</code>
        </p>
        <form onSubmit={activate} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 tracking-wide"
            placeholder="6-digit code"
            required
          />
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="bg-[#0f4c81] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#0a3a63] disabled:opacity-50"
            >
              {busy ? 'Verifying...' : 'Verify & enable 2FA'}
            </button>
            <button
              type="button"
              onClick={finish}
              className="text-sm text-gray-500 hover:text-[#0f4c81] hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Protect your account with a second factor (authenticator app). Enabling 2FA issues eight
        single-use recovery codes. If 2FA is already enabled, running setup again and confirming a
        code rotates your recovery codes.
      </p>
      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded mb-4">{error}</p>}
      <button
        type="button"
        onClick={startSetup}
        disabled={busy}
        className="bg-[#0f4c81] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#0a3a63] disabled:opacity-50"
      >
        {busy ? 'Starting...' : 'Start 2FA setup'}
      </button>
    </div>
  );
}
