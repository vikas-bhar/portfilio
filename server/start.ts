import { startContentServer } from './app';

const index = process.argv.indexOf('--port');
const rawPort = index >= 0 ? process.argv[index + 1] : process.env.PORT;
const port = rawPort ? Number(rawPort) : undefined;
if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535))
  throw new Error('Choose a valid server port.');
const app = await startContentServer({ port, production: process.argv.includes('--production') });
for (const signal of ['SIGTERM', 'SIGINT'] as const)
  process.once(signal, () => {
    void app.close().finally(() => process.exit(0));
  });
