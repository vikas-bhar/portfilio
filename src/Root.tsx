import { lazy, Suspense } from 'react';
import App from './App';
import SiteProvider from './components/SiteProvider';

const AdminPage = lazy(() => import('./admin/AdminPage'));
export default function Root() {
  const isAdmin =
    window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
  if (isAdmin)
    return (
      <Suspense
        fallback={
          <main className="admin-loading" role="status">
            Loading site administration…
          </main>
        }
      >
        <AdminPage />
      </Suspense>
    );
  return (
    <SiteProvider>
      <App />
    </SiteProvider>
  );
}
