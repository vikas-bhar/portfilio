import type { IncomingMessage, ServerResponse } from 'node:http';
import { servePage } from '../server/page';
import { store } from '../server/runtime';

export default async function page(req: IncomingMessage, res: ServerResponse) {
  return servePage(req, res, store);
}
