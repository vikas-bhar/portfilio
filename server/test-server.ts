// Isolated fixture server: never reads or changes the owner's .portfolio-data.
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startContentServer } from './app';
import { FileStore } from './store';

const directory = resolve('.portfolio-test-data');
await rm(directory, { recursive: true, force: true });
const app = await startContentServer({
  port: 3100,
  production: true,
  store: new FileStore(directory),
  setupKey: 'isolated-playwright-setup-key-not-for-production-2026',
  loginLimit: 200,
});
for (const signal of ['SIGTERM', 'SIGINT'] as const)
  process.once(signal, () => {
    void app.close().finally(() => process.exit(0));
  });
