import { expect, test, type Page, type BrowserContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { defaultContent } from '../src/data/portfolio';
import type { AdminSession, ContentRecord, DraftRecord } from '../src/lib/site-schema';

// Only the isolated server/test-server.ts fixture knows this setup key/password.
// These are never used by the owner's preview or a deployment.
const setupKey = 'isolated-playwright-setup-key-not-for-production-2026';
const password = 'isolated browser fixture passphrase';
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ mode: 'serial' });
async function signIn(page: Page) {
  await page.goto(`/admin#setup=${setupKey}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  if (await page.getByLabel('Create password', { exact: true }).isVisible()) {
    await page.getByLabel('Create password', { exact: true }).fill(password);
    await page.getByLabel('Confirm password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Create secure admin' }).click();
  } else {
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  }
  await expect(
    page.getByRole('heading', { name: 'A little care. A better portfolio.' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save draft', exact: true })).toBeEnabled();
  await expect(page).not.toHaveURL(/#setup=/);
}
async function navigate(page: Page, label: RegExp) {
  await page
    .getByRole('navigation', { name: 'Admin sections' })
    .getByRole('button', { name: label })
    .click();
}
async function restoreFactory(context: BrowserContext) {
  let session = (await (await context.request.get('/api/admin/session')).json()) as AdminSession;
  if (!session.authenticated) {
    const response = await context.request.post('/api/admin/login', {
      data: { password },
      headers: { 'X-Requested-With': 'portfolio-admin' },
    });
    if (!response.ok()) return;
    session = (await response.json()) as AdminSession;
  }
  const headers = { 'X-Requested-With': 'portfolio-admin', 'X-CSRF-Token': session.csrfToken! };
  const current = (await (await context.request.get('/api/site')).json()) as ContentRecord;
  const publishedResponse = await context.request.post('/api/admin/publish', {
    headers,
    data: { content: defaultContent, expectedRevision: current.revision },
  });
  expect(publishedResponse.ok()).toBe(true);
  const published = (await publishedResponse.json()) as ContentRecord;
  const editor = (await (await context.request.get('/api/admin/content')).json()) as {
    draft: DraftRecord | null;
  };
  const saved = await context.request.put('/api/admin/draft', {
    headers,
    data: {
      content: defaultContent,
      baseRevision: published.revision,
      expectedRevision: editor.draft?.revision ?? 'initial',
    },
  });
  expect(saved.ok()).toBe(true);
  await context.request.post('/api/admin/logout', { headers });
}

test.afterEach(async ({ context }) => {
  await restoreFactory(context);
});

test('rejects anonymous admin and draft access without hiding the public portfolio', async ({
  page,
  request,
}) => {
  for (const path of ['/api/admin/content', '/api/admin/draft', '/api/resume/html?preview=draft'])
    expect((await request.get(path)).status()).toBe(401);
  for (const path of [
    '/.portfolio-data/setup-key',
    '/.portfolio-test-data/auth.json',
    '/.git/config',
    '/.env',
  ])
    expect((await request.get(path)).status()).toBe(404);
  await page.goto('/?preview=draft');
  await expect(page.getByRole('heading', { name: 'Sign in to preview your draft.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open admin', exact: true })).toBeVisible();
  await page.goto('/');
  await expect(page.locator('#project-grid article')).toHaveCount(11);
});

test('supports protected whole-site editing, private preview, conflict recovery, and publishing', async ({
  page,
  context,
  browser,
}, testInfo) => {
  test.setTimeout(150_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await signIn(page);
  await page.screenshot({
    path: `test-results/admin-overview-${testInfo.project.name}.png`,
    fullPage: true,
  });
  const overviewA11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(overviewA11y.violations).toEqual([]);
  for (const [label, heading] of [
    [/^Profile & home/, 'Profile & home'],
    [/^Sections & copy/, 'Sections & copy'],
    [/^Capabilities/, 'Capabilities'],
    [/^About & experience/, 'About & experience'],
    [/^Appearance/, 'Appearance'],
    [/^Security/, 'Security'],
  ] as const) {
    await navigate(page, label);
    await expect(page.locator('.admin-main h1')).toHaveText(heading);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      testInfo.project.name === 'mobile' ? 390 : 1440,
    );
  }
  await navigate(page, /^Profile & home/);
  await page.getByLabel('Full name', { exact: true }).fill('Preview Builder');
  await page.getByLabel('Contact email', { exact: true }).fill('builder-test@example.com');
  await page
    .getByLabel('Hero summary', { exact: true })
    .fill('A private draft summary for the isolated browser test.');
  const before = (await (await context.request.get('/api/site')).json()) as ContentRecord;
  expect(before.content.profile.name).toBe(defaultContent.profile.name);
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(
    page.getByText('Draft saved securely. Your public site has not changed.'),
  ).toBeVisible();

  // Both tabs load the same revision; only the first writer can save it.
  const other = await context.newPage();
  await other.goto('/admin');
  await expect(other.getByRole('button', { name: 'Save draft', exact: true })).toBeEnabled();
  await navigate(other, /^Profile & home/);
  await other
    .getByLabel('Hero summary', { exact: true })
    .fill('This private draft was saved from another admin tab.');
  await other.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(
    other.getByText('Draft saved securely. Your public site has not changed.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('changed in another session');
  await page.getByRole('button', { name: 'Reload latest content', exact: true }).click();
  await expect(page.getByText('Loaded the latest server version.')).toBeVisible();
  await expect(page.getByLabel('Hero summary', { exact: true })).toHaveValue(
    'This private draft was saved from another admin tab.',
  );
  await other.close();

  await navigate(page, /^Projects/);
  await expect(page.getByLabel('Project title', { exact: true })).toHaveValue('Kisan Sathi');
  await page.getByLabel('Visible on the site', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Add project', exact: true }).first().click();
  const newTitle = 'Isolated browser-test project';
  await page.getByLabel('Project title', { exact: true }).fill(newTitle);
  await page
    .getByLabel('Short description', { exact: true })
    .fill('An isolated test record, never an external product claim.');
  await page.getByLabel('Visible on the site', { exact: true }).check();
  await page.getByLabel('Use a custom project image', { exact: true }).check();
  await page.getByLabel('Project image URL', { exact: true }).fill('/projects/prepstudy.svg');
  await page
    .getByLabel('Project image description', { exact: true })
    .fill('An illustrated open book for the isolated test project.');
  await page.getByRole('button', { name: `Move ${newTitle} up`, exact: true }).click();
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(
    page.getByText('Draft saved securely. Your public site has not changed.'),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/admin-projects-${testInfo.project.name}.png`,
    fullPage: true,
  });
  const projectsA11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(projectsA11y.violations).toEqual([]);
  await navigate(page, /^Sections & copy/);
  await page.getByLabel('Show Experience', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Move Contact section up', exact: true }).click();
  await navigate(page, /^Appearance/);
  await page.getByLabel('Enable original animations', { exact: true }).uncheck();
  await page.getByLabel('Default theme for new visitors', { exact: true }).selectOption('light');
  await page
    .getByLabel('Meta description', { exact: true })
    .fill('Published metadata from the isolated browser test.');

  const previewPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = await previewPromise;
  await expect(preview.locator('.draft-preview-banner')).toContainText('PRIVATE DRAFT PREVIEW');
  await expect(preview.getByRole('heading', { level: 1 })).toContainText('Preview Builder');
  await expect(preview.getByRole('heading', { name: newTitle, exact: true })).toBeAttached();
  await expect(
    preview.getByRole('article', { name: newTitle, exact: true }).getByRole('img'),
  ).toHaveAttribute('src', '/projects/prepstudy.svg');
  await expect(
    preview.locator('#project-grid').getByRole('article', { name: 'Kisan Sathi', exact: true }),
  ).toHaveCount(0);
  await expect(preview.locator('#experience')).toHaveCount(0);
  await expect(preview.locator('html')).toHaveAttribute('data-animations', 'off');
  await expect(preview.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(preview.locator('.floating-wrapper[data-motion="floating"]')).toHaveCount(0);
  await preview.close();
  const stillPublic = (await (await context.request.get('/api/site')).json()) as ContentRecord;
  expect(stillPublic.content.profile.name).toBe(defaultContent.profile.name);

  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  const confirm = page.getByRole('dialog', { name: 'Ready to publish?' });
  await expect(confirm).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(confirm).not.toBeVisible();
  expect(((await (await context.request.get('/api/site')).json()) as ContentRecord).revision).toBe(
    before.revision,
  );
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await confirm.getByRole('button', { name: 'Publish changes', exact: true }).click();
  await expect(page.getByText(/^Published\. New visitors/)).toBeVisible();

  const visitor = await browser.newContext({ reducedMotion: 'reduce' });
  try {
    const publicPage = await visitor.newPage();
    await publicPage.goto(testInfo.project.use.baseURL ?? 'http://127.0.0.1:3100');
    await expect(publicPage.getByRole('heading', { level: 1 })).toContainText('Preview Builder');
    await expect(publicPage.locator('#project-grid article')).toHaveCount(11);
    await expect(publicPage.getByRole('heading', { name: newTitle, exact: true })).toBeAttached();
    await expect(
      publicPage.getByRole('article', { name: newTitle, exact: true }).getByRole('img'),
    ).toHaveAttribute('alt', 'An illustrated open book for the isolated test project.');
    await expect(publicPage.locator('#experience')).toHaveCount(0);
    await expect(
      publicPage.locator('#home').getByRole('link', { name: 'builder-test@example.com' }),
    ).toHaveAttribute('href', 'mailto:builder-test@example.com');
    const html = await (await visitor.request.get('http://127.0.0.1:3100/')).text();
    expect(html).toContain('<title>Preview Builder —');
    expect(html).toContain('Published metadata from the isolated browser test.');
    const resume = await (
      await visitor.request.get('http://127.0.0.1:3100/api/resume/text')
    ).text();
    expect(resume).toContain('PREVIEW BUILDER');
    expect(resume).toContain(newTitle);
    expect((await visitor.request.get('http://127.0.0.1:3100/api/admin/draft')).status()).toBe(401);
  } finally {
    await visitor.close();
  }
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  expect((await context.request.get('/api/admin/content')).status()).toBe(401);
  expect(errors).toEqual([]);
});
