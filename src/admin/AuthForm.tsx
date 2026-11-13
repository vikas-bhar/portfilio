import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { authenticate } from '../lib/admin-api';
import type { AdminSession } from '../lib/site-schema';

export default function AuthForm({
  setupKey,
  onAuthenticated,
  reauthenticate = false,
}: {
  setupKey?: string;
  onAuthenticated: (session: AdminSession) => void;
  reauthenticate?: boolean;
}) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isSetup = Boolean(setupKey);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (isSetup && password !== confirmation) {
      setError('Your passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const session = await authenticate(password, setupKey);
      setPassword('');
      setConfirmation('');
      onAuthenticated(session);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign-in could not be completed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      className="admin-auth-form"
      onSubmit={(event) => void submit(event)}
      aria-label={isSetup ? 'Create admin password' : 'Admin sign in'}
    >
      <span className="admin-auth-icon">
        <LockKeyhole size={22} aria-hidden="true" />
      </span>
      <p className="admin-kicker">{isSetup ? 'ONE-TIME OWNER SETUP' : 'PRIVATE WORKSPACE'}</p>
      <h1>
        {isSetup
          ? 'Create your admin password.'
          : reauthenticate
            ? 'Sign in to continue.'
            : 'Admin login'}
      </h1>
      <p className="admin-auth-description">
        {isSetup
          ? 'Create a strong password for your site admin. This setup link stops working as soon as your account is created.'
          : reauthenticate
            ? 'Your unsaved edits are still in this tab. Sign in again, then retry your save.'
            : 'Manage your projects, content, and site appearance. Only published changes reach your visitors.'}
      </p>
      <div className="admin-field">
        <label htmlFor="admin-password">{isSetup ? 'Create password' : 'Password'}</label>
        <div className="admin-password-input">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isSetup ? 'new-password' : 'current-password'}
            minLength={isSetup ? 14 : 1}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={isSetup ? 'admin-password-help' : undefined}
          />
          <button
            type="button"
            className="admin-icon-button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((show) => !show)}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {isSetup && (
          <p id="admin-password-help" className="admin-field-help">
            Use a unique passphrase of at least 14 characters. A password manager is recommended.
          </p>
        )}
      </div>
      {isSetup && (
        <div className="admin-field">
          <label htmlFor="admin-password-confirmation">Confirm password</label>
          <input
            id="admin-password-confirmation"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            minLength={14}
            maxLength={128}
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>
      )}
      {error && (
        <p className="admin-notice admin-notice-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="admin-button admin-button-primary admin-auth-submit"
        disabled={busy}
      >
        {busy ? 'Verifying…' : isSetup ? 'Create secure admin' : 'Sign in'}
        <ArrowRight size={17} aria-hidden="true" />
      </button>
      <p className="admin-auth-footnote">
        Protected server session · no password is stored in your browser
      </p>
    </form>
  );
}
