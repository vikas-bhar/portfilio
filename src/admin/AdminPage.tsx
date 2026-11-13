import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { getSession } from '../lib/admin-api';
import type { AdminSession } from '../lib/site-schema';
import AuthForm from './AuthForm';
import Editor from './Editor';
import './admin.css';

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [error, setError] = useState('');
  const [setupKey] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get('setup') ?? '',
  );
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    document.title = 'Site Admin — Vikas Bhardwaj';
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.append(robots);
    }
    robots.content = 'noindex, nofollow';
    if (window.location.hash.startsWith('#setup='))
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search,
      );
    let active = true;
    void getSession()
      .then((data) => {
        if (active) {
          setSession(data);
          setError('');
        }
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : 'The admin service is not available.',
          );
      });
    return () => {
      active = false;
    };
  }, [retry]);
  if (session?.authenticated)
    return (
      <Editor
        session={session}
        onLoggedOut={() => setSession({ ...session, authenticated: false })}
      />
    );
  return (
    <div className="admin-app admin-auth-screen">
      <header className="admin-auth-header">
        <a href="/" className="admin-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to portfolio
        </a>
        <span className="admin-brand">
          <span className="admin-brand-mark">v.</span> SITE ADMIN
        </span>
      </header>
      <main className="admin-auth-main">
        {error ? (
          <div className="admin-auth-form">
            <p className="admin-kicker">CONNECTION REQUIRED</p>
            <h1>Cannot reach the editor.</h1>
            <p className="admin-notice admin-notice-error" role="alert">
              {error}
            </p>
            <p className="admin-auth-description">
              Run the content server with <code>npm run dev</code>, or check your deployed server
              configuration. Static Vite preview alone cannot provide authentication or publishing.
            </p>
            <button
              className="admin-button admin-button-primary"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : !session ? (
          <p role="status">Connecting to your private workspace…</p>
        ) : session.storage === 'unconfigured' ? (
          <div className="admin-auth-form">
            <ShieldCheck size={28} aria-hidden="true" />
            <p className="admin-kicker">SECURE SETUP REQUIRED</p>
            <h1>Connect shared storage.</h1>
            <p className="admin-auth-description">
              Publishing is deliberately disabled until this deployment has a{' '}
              <strong>private Vercel Blob store</strong>. No browser-only saves or temporary
              serverless files will be used.
            </p>
            <ol className="admin-setup-steps">
              <li>
                Attach a <strong>private</strong> Blob store to this Vercel project.
              </li>
              <li>
                Set <code>ADMIN_SETUP_KEY</code> to a random secret of at least 32 characters.
              </li>
              <li>
                Redeploy, then visit <code>/admin#setup=YOUR_SETUP_KEY</code> to choose your
                password.
              </li>
            </ol>
            <a
              className="admin-button"
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Vercel dashboard
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <p className="admin-field-help">
              Full instructions are in docs/ADMIN.md. Never put server secrets in a VITE_ variable.
            </p>
          </div>
        ) : session.setupRequired && setupKey.length < 32 ? (
          <div className="admin-auth-form">
            <ShieldCheck size={28} aria-hidden="true" />
            <p className="admin-kicker">OWNER SETUP</p>
            <h1>Use your private setup link.</h1>
            <p className="admin-auth-description">
              An admin account has not been created yet. Open the one-time setup link printed in
              your content-server terminal. For a Vercel deployment, use the private setup key
              configured by the owner.
            </p>
            <p className="admin-field-help">
              Setup cannot be claimed from this public page without that secret link. No default
              password exists.
            </p>
          </div>
        ) : (
          <AuthForm
            setupKey={session.setupRequired ? setupKey : undefined}
            onAuthenticated={setSession}
          />
        )}
      </main>
      <footer className="admin-auth-footer">
        <ShieldCheck size={14} aria-hidden="true" />
        Private drafts. Deliberate publishing. Your site, your control.
      </footer>
    </div>
  );
}
