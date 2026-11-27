import { expect, test } from '@playwright/test';
import { profile } from '../src/data/portfolio';

test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.headline);
  await page.evaluate(() => document.fonts.ready);
});

test('applies the editorial typography and local paper treatments without importing reference content', async ({
  page,
}) => {
  const typography = await page.evaluate(() => ({
    body: getComputedStyle(document.body).fontFamily,
    name: getComputedStyle(document.querySelector('.hero-name')!).fontFamily,
    heading: getComputedStyle(document.querySelector('#work-heading')!).fontFamily,
    background: getComputedStyle(document.querySelector('.site-shell')!).backgroundImage,
    artwork: getComputedStyle(document.querySelector('.project-artwork')!).backgroundImage,
  }));
  expect(typography.body).toContain('DM Sans Variable');
  expect(typography.name).toContain('Fraunces Variable');
  expect(typography.heading).toContain('Bricolage Grotesque Variable');
  expect(typography.background).toContain('/paper-grain.svg');
  expect(typography.artwork).toContain('/paper-grain.svg');
  await expect(page.locator('.studio-artwork')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#project-grid article')).toHaveCount(11);
  await expect(page.locator('.project-index').first()).toHaveText('01');
  await expect(page.locator('.project-index').last()).toHaveText('11');
  await expect(page.locator('#home img, #about-me img')).toHaveCount(0);
  const sources = await page
    .locator('img, script[src], link[href]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('src') ?? element.getAttribute('href')),
    );
  expect(sources.some((source) => source?.includes('enosh-portfolio'))).toBe(false);
});

test('reflows the project archive and paper spreads without clipping from 320px through 1920px', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
    const layout = await page.evaluate(() => {
      const grid = getComputedStyle(document.querySelector('#project-grid')!);
      const names = [...document.querySelectorAll('.hero-name-part')].map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      });
      const contact = document.querySelector('.contact-form-card')!.getBoundingClientRect();
      return {
        columns: grid.gridTemplateColumns.split(' ').length,
        names,
        contact: { left: contact.left, right: contact.right },
      };
    });
    expect(layout.columns).toBe(width <= 767 ? 1 : 2);
    for (const name of layout.names) {
      expect(name.left).toBeGreaterThanOrEqual(0);
      expect(name.right).toBeLessThanOrEqual(width);
    }
    expect(layout.contact.left).toBeGreaterThanOrEqual(0);
    expect(layout.contact.right).toBeLessThanOrEqual(width);
  }
});

test('keeps warm light/dark browser chrome and the saved theme in sync', async ({ page }) => {
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#211e1a');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f2e7d4');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.site-shell')).toHaveCSS('color', 'rgb(48, 37, 27)');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#211e1a');
  // The effect updates the attribute before the browser finishes inherited-color paint.
  await expect(page.locator('.site-shell')).toHaveCSS('color', 'rgb(242, 227, 199)');
  await expect(page.locator('.hero-role')).toHaveCSS('color', 'rgb(242, 227, 199)');
});
