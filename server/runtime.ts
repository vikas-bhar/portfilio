import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createStore } from './store';
import { createApiHandler } from './api';

export const store = createStore();
export const apiHandler = createApiHandler(store, {
  setupKey: async () =>
    process.env.ADMIN_SETUP_KEY ??
    (store.mode === 'local'
      ? await readFile(
          resolve(process.env.PORTFOLIO_DATA_DIR ?? '.portfolio-data', 'setup-key'),
          'utf8',
        ).catch(() => '')
      : ''),
});
