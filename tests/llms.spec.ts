import { expect, test } from '@playwright/test';
import { defaultContent } from '../src/data/portfolio';

test.use({ reducedMotion: 'reduce' });

test('discovers AI text from public HTML and the footer, and reads the full portfolio without JavaScript', async ({
  page,
  request,
  browser,
}, testInfo) => {
  const response = await request.get('/');
  const html = await response.text();
  expect(response.headers()['link']).toContain('</llms.txt>; rel="describedby"');
  expect(html).toContain('rel="describedby" type="text/plain" href="/llms.txt"');
  expect(html).toContain('rel="alternate" type="text/markdown" href="/index.md"');
  await page.goto('/');
  const entry = page.getByRole('contentinfo').getByRole('link', { name: 'AI text' });
  await expect(entry).toHaveAttribute('href', '/llms.txt');
  await entry.click();
  await expect(page).toHaveURL(/\/llms\.txt$/);
  await expect(page.locator('body')).toContainText('# Vikas Bhardwaj');
  await expect(page.locator('body')).toContainText('[Complete portfolio text](/llms-full.txt)');
  await expect(page.locator('#root')).toHaveCount(0);

  const reader = await browser.newContext({ javaScriptEnabled: false });
  try {
    const plainPage = await reader.newPage();
    const base = testInfo.project.use.baseURL ?? 'http://127.0.0.1:3100';
    const full = await plainPage.goto(`${base}/llms-full.txt?preview=draft`);
    expect(full?.status()).toBe(200);
    expect(full?.headers()['content-type']).toBe('text/plain; charset=utf-8');
    const body = await plainPage.locator('body').innerText();
    expect(body).toContain('11 visible projects; 4 featured.');
    for (const project of defaultContent.projects) expect(body).toContain(`### ${project.title}`);
    expect(body).toContain('## Capabilities');
    expect(body).toContain('## About');
    expect(body).toContain('## Experience and milestones');
    expect(body).toContain('not an official restaurant site');
    expect(body).not.toMatch(/passwordHash|sessionSecret|csrfToken|portfolio-content|<script/);
  } finally {
    await reader.close();
  }
});

test('offers anonymous read-only UTF-8 resources with Markdown parity and useful HEAD responses', async ({
  request,
}) => {
  const full = await request.get('/llms-full.txt');
  expect(full.ok()).toBe(true);
  const fullText = await full.text();
  const markdown = await request.get('/index.md');
  expect(markdown.ok()).toBe(true);
  expect(markdown.headers()['content-type']).toBe('text/markdown; charset=utf-8');
  expect(await markdown.text()).toBe(fullText);
  for (const path of ['/llms.txt', '/llms-full.txt', '/index.md']) {
    const get = await request.get(path, { headers: { Origin: 'https://reader.example.com' } });
    expect(get.ok()).toBe(true);
    expect(get.headers()['access-control-allow-origin']).toBe('*');
    expect(get.headers()['access-control-allow-credentials']).toBeUndefined();
    expect(get.headers()['cache-control']).toContain('no-store');
    expect(get.headers()['content-disposition']).toBe('inline');
    const head = await request.head(path);
    expect(head.ok()).toBe(true);
    expect(Number(head.headers()['content-length'])).toBe(Buffer.byteLength(await get.text()));
    expect(await head.text()).toBe('');
    const write = await request.post(path, { data: { content: 'not allowed' } });
    expect(write.status()).toBe(405);
    expect(write.headers()['allow']).toBe('GET, HEAD');
  }
  expect((await request.get('/api/admin/draft')).status()).toBe(401);
});
