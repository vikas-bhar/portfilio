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

test('keeps page headings and the header compact without shrinking body copy or controls', async ({
  page,
}) => {
  for (const theme of ['dark', 'light']) {
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    for (const width of [320, 390, 767, 768, 960, 1024, 1199, 1200, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const layout = await page.evaluate(() => {
        const header = document.querySelector('.site-header')!.getBoundingClientRect();
        return {
          headerHeight: header.height,
          heroSize: parseFloat(getComputedStyle(document.querySelector('.hero h1')!).fontSize),
          names: [...document.querySelectorAll('.hero-name-part')].map((element) => ({
            size: parseFloat(getComputedStyle(element).fontSize),
            left: element.getBoundingClientRect().left,
            right: element.getBoundingClientRect().right,
          })),
          headings: [...document.querySelectorAll('.section h2')].map((element) =>
            parseFloat(getComputedStyle(element).fontSize),
          ),
          bodySize: getComputedStyle(document.querySelector('.hero-description')!).fontSize,
          scrollPadding: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
          controls: [...document.querySelectorAll('.site-header .icon-button')].map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              top: rect.top - header.top,
              bottom: rect.bottom - header.top,
            };
          }),
        };
      });
      const mobile = width <= 767;
      expect(layout.headerHeight).toBe(mobile ? 64 : 70);
      expect(layout.heroSize).toBeGreaterThanOrEqual(42);
      expect(layout.heroSize).toBeLessThanOrEqual(mobile ? 80 : 88);
      expect(layout.names[0]!.size).toBeCloseTo(layout.heroSize, 2);
      expect(layout.names[1]!.size).toBeCloseTo(layout.heroSize * 0.92, 2);
      for (const name of layout.names) {
        expect(name.left).toBeGreaterThanOrEqual(0);
        expect(name.right).toBeLessThanOrEqual(width);
      }
      for (const size of layout.headings) {
        expect(size).toBeGreaterThanOrEqual(28);
        expect(size).toBeLessThanOrEqual(mobile ? 42 : 56);
      }
      expect(layout.bodySize).toBe('14px');
      expect(layout.scrollPadding).toBeGreaterThanOrEqual(layout.headerHeight + 8);
      for (const control of layout.controls) {
        expect(control.width).toBeGreaterThanOrEqual(40);
        expect(control.height).toBeGreaterThanOrEqual(40);
        expect(control.top).toBeGreaterThanOrEqual(0);
        expect(control.bottom).toBeLessThanOrEqual(layout.headerHeight);
      }
    }
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to light theme' }).click();
  }
});

test('keeps rusty-gray light/dark browser chrome and the saved theme in sync', async ({ page }) => {
  await expect(page.locator('.site-shell')).toHaveCSS('background-color', 'rgb(53, 51, 50)');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#353332');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#e3dfd9');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.site-shell')).toHaveCSS('background-color', 'rgb(227, 223, 217)');
  await expect(page.locator('.site-header')).toHaveCSS(
    'background-color',
    'rgba(227, 223, 217, 0.94)',
  );
  await expect(page.locator('.site-shell')).toHaveCSS('color', 'rgb(48, 37, 27)');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#353332');
  // The effect updates the attribute before the browser finishes inherited-color paint.
  await expect(page.locator('.site-shell')).toHaveCSS('color', 'rgb(242, 227, 199)');
  await expect(page.locator('.site-shell')).toHaveCSS('background-color', 'rgb(53, 51, 50)');
  await expect(page.locator('.site-header')).toHaveCSS(
    'background-color',
    'rgba(53, 51, 50, 0.94)',
  );
  await expect(page.locator('.hero-role')).toHaveCSS('color', 'rgb(242, 227, 199)');
});

test('keeps the weathered rusty-gray wall separate from paper cards and the private workspace', async ({
  page,
  request,
}) => {
  const paper = () =>
    page
      .locator('.project-file')
      .first()
      .evaluate((element) => ({
        stock: getComputedStyle(element).getPropertyValue('--paper').trim(),
        backing: getComputedStyle(element, '::before').backgroundImage,
        ink: getComputedStyle(element).color,
      }));
  const originalPaper = await paper();
  expect(originalPaper.stock).toBe('#eadabd');
  expect(originalPaper.ink).toBe('rgb(48, 37, 27)');
  for (const theme of ['dark', 'light']) {
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const wall = await page.locator('.site-shell').evaluate((element) => ({
      texture: getComputedStyle(element).backgroundImage,
      repeat: getComputedStyle(element).backgroundRepeat,
      animation: getComputedStyle(element).animationName,
    }));
    expect(wall.texture).toContain('/paper-grain.svg');
    expect(wall.texture).toContain('closest-side');
    expect(wall.texture).toContain('rgba(149, 103, 79,');
    expect(wall.repeat).toBe('repeat, repeat, repeat');
    expect(wall.animation).toBe('none');
    expect(await paper()).toEqual(originalPaper);
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to light theme' }).click();
  }
  const manifest = await request.get('/site.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({
    background_color: '#353332',
    theme_color: '#353332',
  });
  await page.goto('/admin');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.admin-app')).toHaveCSS('background-color', 'rgb(13, 16, 19)');
  // The existing auth screen has its own green-tinted gradient, not the public wall texture.
  const adminBackground = await page
    .locator('.admin-app')
    .evaluate((element) => getComputedStyle(element).backgroundImage);
  expect(adminBackground).not.toContain('/paper-grain.svg');
  expect(adminBackground).not.toContain('rgba(149, 103, 79,');
  await expect(page.locator('.site-shell')).toHaveCount(0);
});
