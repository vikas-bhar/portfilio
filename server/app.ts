import express from 'express';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { createApiHandler } from './api';
import { createStore, FileStore, type Store } from './store';
import { randomSecret } from './auth';
import { defaultContent } from '../src/data/portfolio';
import { readPublished } from './content';
import { renderMetadata, servePage } from './page';

interface Options {
  port?: number;
  production?: boolean;
  store?: Store;
  setupKey?: string;
  loginLimit?: number;
}
export async function startContentServer(options: Options = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    let pathname: string;
    try {
      pathname = decodeURIComponent(req.path);
    } catch {
      res.status(400).type('text/plain').send('Invalid path');
      return;
    }
    if (
      pathname.split('/').some((segment) => segment.startsWith('.') && segment !== '.well-known')
    ) {
      res.status(404).type('text/plain').send('Not found');
      return;
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
  const server = createServer(app);
  const store = options.store ?? createStore();
  let setupKey = options.setupKey ?? process.env.ADMIN_SETUP_KEY ?? '';
  if (store instanceof FileStore) {
    await mkdir(store.directory, { recursive: true, mode: 0o700 });
    const setupFile = join(store.directory, 'setup-key');
    if (!setupKey) {
      setupKey = await readFile(setupFile, 'utf8').catch(() => '');
      if (!setupKey) {
        setupKey = randomSecret();
        await writeFile(setupFile, setupKey, { mode: 0o600, flag: 'wx' });
      }
    }
  }
  const api = createApiHandler(store, { setupKey: () => setupKey, loginLimit: options.loginLimit });
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) void api(req, res);
    else next();
  });
  const pageRedirects: Record<string, string> = {
    '/index.html': '/',
    '/resume/Vikas_Bhardwaj_Resume.html': '/api/resume/html',
    '/Vikas_Bhardwaj_Resume.html': '/api/resume/html',
    '/resume/Vikas_Bhardwaj_Resume.txt': '/api/resume/text',
    '/Vikas_Bhardwaj_Resume.txt': '/api/resume/text',
  };
  app.use((req, res, next) => {
    const destination = pageRedirects[req.path];
    if (destination) res.redirect(302, destination);
    else next();
  });
  let closeVite: (() => Promise<void>) | undefined;
  if (options.production) {
    app.use(
      express.static(resolve('dist'), {
        index: false,
        dotfiles: 'deny',
        setHeaders: (res, path) => {
          res.setHeader('X-Content-Type-Options', 'nosniff');
          if (path.includes('/assets/'))
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        },
      }),
    );
    app.use((req, res) => {
      if (extname(req.path)) {
        res.status(404).type('text/plain').send('Not found');
        return;
      }
      void servePage(req, res, store).catch(() => {
        res
          .status(503)
          .type('text/plain')
          .send('Build the portfolio before starting the production server.');
      });
    });
  } else {
    const { createServer: createVite } = await import('vite');
    const vite = await createVite({
      server: {
        middlewareMode: true,
        hmr: { server },
        fs: {
          deny: [
            '.env',
            '.env.*',
            '**/.git/**',
            '**/.portfolio-data/**',
            '**/.portfolio-test-data/**',
            ...(store instanceof FileStore ? [`${store.directory}/**`] : []),
            '**/*.{crt,pem,key}',
          ],
        },
      },
      appType: 'custom',
    });
    closeVite = () => vite.close();
    app.use(async (req, res, next) => {
      if (req.method !== 'GET' || extname(req.path) || req.path.startsWith('/@')) return next();
      try {
        const template = await readFile(resolve('index.html'), 'utf8');
        const content = req.path.startsWith('/admin')
          ? defaultContent
          : (await readPublished(store)).content;
        const html = await vite.transformIndexHtml(
          req.originalUrl,
          renderMetadata(template, content, req.path.startsWith('/admin')),
        );
        res.type('html').setHeader('Cache-Control', 'no-store');
        res.end(html);
      } catch {
        res
          .status(503)
          .type('text/plain')
          .send('The portfolio content is temporarily unavailable. Please try again shortly.');
      }
    });
    app.use(vite.middlewares);
  }
  const port = options.port ?? (options.production ? 4173 : 3000);
  await new Promise<void>((done, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', () => done());
  });
  console.log(`Portfolio website: http://0.0.0.0:${port}`);
  console.log(
    `Content storage: ${store.mode === 'local' ? 'local server files (shared by visitors to this server)' : store.mode}`,
  );
  try {
    if (store.mode !== 'unconfigured' && !(await store.read('auth')) && setupKey.length >= 32)
      console.log(`Private one-time admin setup: /admin#setup=${setupKey}`);
  } catch {
    // Do not take the recovery UI down just because the private store is offline.
    console.warn('Content storage is unavailable. The admin recovery screen remains reachable.');
  }
  const close = async () => {
    await closeVite?.();
    await new Promise<void>((done) => server.close(() => done()));
  };
  return { server, store, close };
}
