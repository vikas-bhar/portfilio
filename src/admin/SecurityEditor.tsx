import { useState, type FormEvent } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { changePassword, getSession, ApiError } from '../lib/admin-api';
import type { AdminSession } from '../lib/site-schema';
import { Field, Panel } from './Fields';

export default function SecurityEditor({
  session,
  onLoggedOut,
  allowChange,
}: {
  session: AdminSession;
  onLoggedOut: () => void;
  allowChange: () => boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 14 || newPassword.length > 128) {
      setError('Use a new passphrase between 14 and 128 characters.');
      return;
    }
    if (newPassword !== confirmation) {
      setError('Your new passwords do not match.');
      return;
    }
    if (!allowChange()) return;
    setBusy(true);
    try {
      const active = await getSession();
      if (!active.authenticated)
        throw new ApiError('Sign in again before changing the password.', 401);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      onLoggedOut();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Password could not be changed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Panel
        title="Security & storage"
        description="Single-owner admin with a real server-verified password—not a client-side password check."
      >
        <div className="admin-security-facts">
          <p>
            <ShieldCheck size={17} aria-hidden="true" />
            <span>
              Passwords are stored as salted scrypt hashes. Sessions use signed, HttpOnly, SameSite
              cookies.
            </span>
          </p>
          <p>
            <ShieldCheck size={17} aria-hidden="true" />
            <span>
              Mutations require a same-origin request and CSRF token. Login attempts are
              rate-limited in shared storage.
            </span>
          </p>
          <p>
            <ShieldCheck size={17} aria-hidden="true" />
            <span>
              {session.storage === 'vercel-blob'
                ? 'Published content, drafts, and authentication live in private Vercel Blob storage.'
                : 'This preview uses private local server files. Attach private Vercel Blob storage for a durable Vercel deployment.'}
            </span>
          </p>
        </div>
        <p className="admin-inline-note">
          No contact submissions or visitor messages are stored. Content backups exclude
          authentication records and server secrets.
        </p>
      </Panel>
      <Panel
        title="Change your password"
        description="This signs out every admin session. You will sign in again with the new password."
      >
        <form onSubmit={(event) => void submit(event)} aria-label="Change admin password">
          <fieldset disabled={busy} className="admin-fieldset">
            <Field
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={setCurrentPassword}
              required
            />
            <Field
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
              required
              help="14–128 characters. Use a unique passphrase and keep it in your password manager."
            />
            <Field
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={setConfirmation}
              required
            />
            {error && (
              <p className="admin-notice admin-notice-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="admin-button admin-button-primary" disabled={busy}>
              {busy ? 'Changing…' : 'Change password & sign out'}
              <KeyRound size={15} aria-hidden="true" />
            </button>
          </fieldset>
        </form>
      </Panel>
    </>
  );
}
