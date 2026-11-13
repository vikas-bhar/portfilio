import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { profile, projects } from '../src/data/portfolio';

// Functional checks use reduced motion so perpetual floats do not need to become
// stationary for Playwright clicks. motion.spec.ts separately exercises the motion.
// Tests are entirely local; external project and social URLs are never opened.
test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('renders all sections without developer photos, empty image frames or browser errors', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const failedAssets: string[] = [];
  page.on('response', (response) => {
    if (new URL(response.url()).hostname === '127.0.0.1' && response.status() >= 400)
      failedAssets.push(response.url());
  });
  await page.reload();
  await expect(page).toHaveTitle(profile.headline);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.headline);
  await expect(page.locator('#home img, #about-me img')).toHaveCount(0);
  await expect(page.locator('.hero-portrait-frame, .about-portrait-frame')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  // Load below-the-fold covers before the full-page visual record; normal visitors still get lazy loading.
  for (const image of await page.locator('#project-grid .project-cover img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
  }
  for (const id of ['home', 'project', 'my-skill', 'about-me', 'experience', 'contact'])
    await expect(page.locator(`#${id}`)).toBeAttached();
  expect(errors).toEqual([]);
  expect(failedAssets).toEqual([]);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({
    path: `test-results/portfolio-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test('shows a lightweight, descriptive image for every project and recovers from a missing illustration', async ({
  page,
}) => {
  const cards = page.locator('#project-grid article');
  await expect(cards).toHaveCount(11);
  const sources = new Set<string>();
  for (const card of await cards.all()) {
    const image = card.locator('.project-cover img');
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
    expect(await image.getAttribute('alt')).toBeTruthy();
    sources.add((await image.getAttribute('src'))!);
    await expect(card.getByText('Illustration', { exact: true })).toBeVisible();
  }
  expect(sources.size).toBe(11);
  await page.route('**/projects/kisan-sathi.svg', (route) => route.abort());
  await page.reload();
  const fallback = page
    .getByRole('article', { name: 'Kisan Sathi', exact: true })
    .locator('.project-cover img');
  await fallback.scrollIntoViewIfNeeded();
  await expect(fallback).toHaveAttribute('src', '/projects/venus-ai.svg');
  await expect
    .poll(() => fallback.evaluate((element: HTMLImageElement) => element.naturalWidth))
    .toBeGreaterThan(0);
});

test('keeps admin hidden until the three-line menu opens on desktop and mobile', async ({
  page,
  context,
}, testInfo) => {
  const details = page.locator('.hero-build-details');
  await expect(details).not.toHaveAttribute('open');
  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
  await details.locator('summary').click();
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
  const toggle = page.getByRole('button', { name: 'Open navigation menu' });
  await expect(toggle).toBeVisible();
  await toggle.click();
  const menu = page.getByRole('navigation', { name: 'Menu navigation' });
  const login = menu.getByRole('link', { name: 'Admin login', exact: true });
  await expect(login).toBeVisible();
  await expect(login).toHaveAttribute('href', '/admin');
  await expect(login).toHaveAttribute('target', '_blank');
  await expect(page.locator('a[href="/admin"]')).toHaveCount(1);
  await expect(page.getByRole('contentinfo').locator('a[href="/admin"]')).toHaveCount(0);
  const menuAccessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(menuAccessibility.violations).toEqual([]);
  await page.screenshot({ path: `test-results/navigation-menu-${testInfo.project.name}.png` });
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
  await toggle.click();
  await page.mouse.click(5, (page.viewportSize()?.height ?? 844) - 5);
  await expect(menu).not.toBeVisible();
  await toggle.click();
  const opened = context.waitForEvent('page');
  await login.click();
  const admin = await opened;
  await expect(admin).toHaveURL(/\/admin$/);
  await expect(admin.getByRole('heading', { level: 1 })).toBeVisible();
  await admin.close();
  await expect(menu).not.toBeVisible();
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
});

test('shows eleven concise projects, filters the four flagships, and expands cards independently', async ({
  page,
}) => {
  const grid = page.locator('#project-grid');
  await expect(grid.getByRole('article')).toHaveCount(11);
  await expect(grid.getByRole('heading', { name: 'Venus AI' })).toBeAttached();
  const kisan = grid.getByRole('article', { name: 'Kisan Sathi' });
  const aeo = grid.getByRole('article', { name: 'AEO Pulse' });
  await expect(kisan.getByText('Problem', { exact: true })).not.toBeVisible();
  await kisan.getByRole('button', { name: 'Show more about Kisan Sathi' }).click();
  await expect(kisan.getByText('Problem', { exact: true })).toBeVisible();
  await expect(kisan.getByText(/Offline and ML behavior have not/)).toBeVisible();
  await expect(aeo.getByText('Problem', { exact: true })).not.toBeVisible();
  await expect(kisan.getByRole('button', { name: 'Show less about Kisan Sathi' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await kisan.getByRole('button', { name: 'Show less about Kisan Sathi' }).click();
  await expect(kisan.getByText('Problem', { exact: true })).not.toBeVisible();
  await page.getByRole('button', { name: /^Featured/ }).click();
  await expect(grid.getByRole('article')).toHaveCount(4);
  for (const project of projects.filter((project) => project.featured))
    await expect(grid.getByRole('heading', { name: project.title })).toBeAttached();
  await page.getByRole('button', { name: /^Applied AI/ }).click();
  await expect(grid.getByRole('article')).toHaveCount(3);
  await page.getByRole('button', { name: /^Systems/ }).click();
  await expect(grid.getByRole('article')).toHaveCount(1);
  await expect(grid.getByRole('heading', { name: 'FocusPulse' })).toBeVisible();
  await page.getByRole('button', { name: /^Full-stack/ }).click();
  await expect(grid.getByRole('article')).toHaveCount(4);
  await page.getByRole('button', { name: /Show all 11 projects/ }).click();
  await expect(grid.getByRole('article')).toHaveCount(11);
});

test('keeps missing captures and unavailable links honest, including older projects', async ({
  page,
}) => {
  const grid = page.locator('#project-grid');
  await expect(grid.getByRole('figure', { name: /not a UI screenshot/ })).toHaveCount(0);
  const card = grid.getByRole('article', { name: 'Kisan Sathi' });
  await card.getByRole('button', { name: 'Show more about Kisan Sathi' }).click();
  await expect(card.getByRole('figure', { name: /not a UI screenshot/ })).toBeVisible();
  await expect(card.getByText('Working-UI capture pending')).toBeVisible();
  for (const project of projects) {
    const projectCard = grid.getByRole('article', { name: project.title });
    await expect(projectCard.getByRole('button', { name: /GitHub/ })).toBeDisabled();
    await expect(projectCard.getByRole('link', { name: /^GitHub/ })).toHaveCount(0);
    const request = await projectCard
      .getByRole('link', { name: `Request source access for ${project.title}` })
      .getAttribute('href');
    expect(new URL(request!).searchParams.get('subject')).toContain(project.title);
    if (project.demo.availability !== 'unavailable')
      await expect(
        projectCard.getByRole('link', { name: `Live Demo: ${project.title}` }),
      ).toHaveAttribute('href', project.demo.url);
    else await expect(projectCard.getByRole('button', { name: /Live Demo/ })).toBeDisabled();
  }
});

test('keeps email and GitHub one click away in both hero and footer', async ({ page }) => {
  const hero = page.locator('#home');
  const footer = page.getByRole('contentinfo');
  for (const region of [hero, footer]) {
    await expect(region.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
      'href',
      profile.github,
    );
    await expect(region.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
  }
  await expect(hero.getByRole('link', { name: 'View Featured Projects' })).toHaveAttribute(
    'href',
    '#project',
  );
  await expect(hero.getByRole('link', { name: 'Get in Touch' })).toHaveAttribute(
    'href',
    '#contact',
  );
  await expect(page.locator('#my-skill article')).toHaveCount(4);
  await expect(page.locator('#experience article')).toHaveCount(3);
});

test('persists the theme across a reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('navigates to real, unobscured section anchors', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'mobile') {
    const toggle = page.getByRole('button', { name: 'Open navigation menu' });
    await toggle.click();
    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await page
      .getByRole('navigation', { name: 'Menu navigation' })
      .getByRole('link', { name: /Capabilities/ })
      .click();
    await expect(page.getByRole('navigation', { name: 'Menu navigation' })).not.toBeVisible();
  } else {
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Capabilities' })
      .click();
  }
  await expect(page).toHaveURL(/#my-skill$/);
  await expect(
    page.getByRole('heading', { name: 'Four engineering pillars. One product mindset.' }),
  ).toBeInViewport();
});

test('traps focus in the résumé dialog and restores focus on Escape', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'View résumé', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'TXT', exact: true })).toHaveAttribute(
    'download',
    'Vikas_Bhardwaj_Resume.txt',
  );
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('serves real printable and text résumés', async ({ request, page }) => {
  const text = await request.get('/resume/Vikas_Bhardwaj_Resume.txt');
  expect(text.ok()).toBe(true);
  expect(await text.text()).toContain('VIKAS BHARDWAJ');
  expect(await text.text()).toContain(profile.role);
  expect(await text.text()).toContain('FocusPulse');
  expect(await text.text()).toContain('Vision Start / Zenastra Industries');
  await page.goto('/resume/Vikas_Bhardwaj_Resume.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vikas Bhardwaj');
  await expect(page.getByRole('button', { name: 'Print / Save as PDF' })).toBeVisible();
  await expect(page.locator('article.project')).toHaveCount(11);
  await expect(page.locator('article.milestone')).toHaveCount(3);
  await expect(page.getByText(profile.role, { exact: true })).toBeVisible();
});

test('validates contact fields and clearly hands off an email draft', async ({ page }) => {
  const form = page.getByRole('form', { name: 'Contact Vikas' });
  await form.getByRole('button', { name: 'Open email draft' }).click();
  expect(
    await form
      .getByLabel('First name')
      .evaluate((element) => (element as HTMLInputElement).checkValidity()),
  ).toBe(false);
  await form.getByLabel('First name').fill('Asha');
  await form.getByLabel('Last name').fill('Sharma');
  await form.getByLabel('Email address').fill('asha+work@example.com');
  await form
    .getByLabel('What are you thinking?')
    .fill('Let’s build an AI & systems product together.');
  await form.getByRole('button', { name: 'Open email draft' }).click();
  await expect(form.getByText('Your draft is ready.')).toBeVisible();
  const draft = await form.getByRole('link', { name: 'Try the email link' }).getAttribute('href');
  expect(draft).toBeTruthy();
  const url = new URL(draft!);
  expect(url.protocol).toBe('mailto:');
  expect(url.pathname).toBe('vbvoxe@gmail.com');
  expect(url.searchParams.get('body')).toContain('AI & systems product');
  await expect(form.getByText(/Nothing is sent or stored/)).toBeVisible();
});

test('respects reduced motion and remains usable without WebGL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.ambient-background')).toBeAttached();
  await expect(page.locator('.ambient-background canvas')).toHaveCount(0);
  expect(
    await page.locator('html').evaluate((element) => getComputedStyle(element).scrollBehavior),
  ).toBe('auto');
});

test('has no horizontal overflow at narrow and wide viewport widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth).toBeLessThanOrEqual(width);
  }
});

test('checks accessibility in both themes and the résumé viewer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['dark', 'light']) {
    // Let the theme effect and inherited-color paint finish before axe samples
    // the page; the attribute/custom properties can update one frame earlier.
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, `${theme} theme accessibility`).toEqual([]);
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to light theme' }).click();
  }
  await page.getByRole('button', { name: 'View résumé', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const dialogResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(dialogResults.violations, 'résumé viewer accessibility').toEqual([]);
});
