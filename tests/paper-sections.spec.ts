import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { defaultContent } from '../src/data/portfolio';

const publicCards = [
  '.hero-build-details',
  '.skill-card',
  '.learning-note',
  '.about-stat-row',
  '.focus-area',
  '.about-copy',
  '.experience-card',
  '.contact-copy',
  '.contact-form-card',
  '.footer-top',
].join(', ');

test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(defaultContent.profile.headline);
  await page.evaluate(() => document.fonts.ready);
});

test('shares the Projects stationery, mounted prints, labels and chips across public sections in both themes', async ({
  page,
}) => {
  for (const theme of ['dark', 'light']) {
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const reference = await page
      .locator('.project-file')
      .first()
      .evaluate((element) => ({
        background: getComputedStyle(element, '::before').backgroundImage,
        edge: getComputedStyle(element, '::before').clipPath,
        ink: getComputedStyle(element).color,
      }));
    const cards = await page.locator(publicCards).evaluateAll((elements) =>
      elements.map((element) => ({
        name: element.className,
        background: getComputedStyle(element, '::before').backgroundImage,
        edge: getComputedStyle(element, '::before').clipPath,
        ink: getComputedStyle(element).color,
        scheme: getComputedStyle(element).colorScheme,
        pointerEvents: getComputedStyle(element, '::before').pointerEvents,
      })),
    );
    expect(reference.background).toContain('/paper-grain.svg');
    expect(reference.edge).toMatch(/^polygon\(/);
    for (const card of cards) {
      expect(card.background, card.name).toBe(reference.background);
      expect(card.edge, card.name).toBe(reference.edge);
      expect(card.ink, card.name).toBe(reference.ink);
      expect(card.scheme, card.name).toBe('light');
      expect(card.pointerEvents, card.name).toBe('none');
    }
    const backing = await page
      .locator('.project-file-visual')
      .first()
      .evaluate((element) => getComputedStyle(element, '::before').backgroundImage);
    const prints = await page.locator('.paper-illustration').evaluateAll((elements) =>
      elements.map((element) => ({
        hidden: element.getAttribute('aria-hidden'),
        backing: getComputedStyle(element, '::before').backgroundImage,
        images: element.querySelectorAll('img').length,
      })),
    );
    expect(prints).toHaveLength(
      defaultContent.skillGroups.length +
        defaultContent.focusAreas.length +
        defaultContent.milestones.length +
        1,
    );
    for (const print of prints) {
      expect(print.hidden).toBe('true');
      expect(print.backing).toBe(backing);
      expect(print.images).toBe(0);
    }
    for (const selector of ['.paper-label', '.paper-chips > li']) {
      const swatches = await page.locator(selector).evaluateAll((elements) =>
        elements.map((element) => ({
          background: getComputedStyle(element).backgroundColor,
          color: getComputedStyle(element).color,
        })),
      );
      expect(new Set(swatches.map((swatch) => JSON.stringify(swatch))).size).toBe(1);
    }
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to light theme' }).click();
  }
});

test('keeps the expanded build path and every paper card inside narrow, tablet and wide viewports', async ({
  page,
}) => {
  await page.locator('.hero-build-details > summary').click();
  await expect(page.locator('.hero-build-details')).toHaveAttribute('open', '');
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
    const cards = await page.locator(publicCards).evaluateAll((elements) =>
      elements.map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          name: element.className,
          left: bounds.left,
          right: bounds.right,
          content: element.scrollWidth,
          width: element.clientWidth,
        };
      }),
    );
    for (const card of cards) {
      expect(card.left, `${width}px: ${card.name}`).toBeGreaterThanOrEqual(-1);
      expect(card.right, `${width}px: ${card.name}`).toBeLessThanOrEqual(width + 1);
      expect(card.content, `${width}px: ${card.name}`).toBeLessThanOrEqual(card.width + 1);
    }
    const form = page.getByRole('form', { name: 'Contact Vikas' });
    await expect(form.getByLabel('First name')).toBeVisible();
    await expect(form.getByRole('button', { name: 'Open email draft' })).toBeVisible();
  }
});

test('matches the menu and résumé to the public paper cards without restyling the private editor', async ({
  page,
}) => {
  const menuToggle = page.getByRole('button', { name: 'Open navigation menu' });
  await menuToggle.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('navigation', { name: 'Menu navigation' });
  await expect(menu).toHaveClass(/paper-card/);
  await expect(menu).toHaveCSS('color', 'rgb(48, 37, 27)');
  await expect(menu.getByRole('link', { name: 'Admin login' })).toHaveAttribute('href', '/admin');
  await page.keyboard.press('Escape');
  await expect(menuToggle).toBeFocused();
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);

  const resumeTrigger = page.getByRole('button', { name: 'View résumé', exact: true });
  await resumeTrigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveClass(/paper-colors/);
  await expect(dialog).toHaveCSS('color', 'rgb(48, 37, 27)');
  await expect(dialog.locator('.resume-skills > .paper-card')).toHaveCount(
    defaultContent.skillGroups.length,
  );
  await expect(dialog.locator('.resume-projects > .paper-card')).toHaveCount(
    defaultContent.projects.length,
  );
  await expect(dialog.locator('.resume-milestones > .paper-card')).toHaveCount(
    defaultContent.milestones.length,
  );
  await dialog.locator('.resume-milestones > article').last().scrollIntoViewIfNeeded();
  await expect(dialog.locator('.resume-milestones > article').last()).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(resumeTrigger).toBeFocused();

  await page.goto('/admin');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.site-shell, .paper-card, .paper-illustration')).toHaveCount(0);
});

test('keeps the optional build-path paper readable and keyboard-accessible in both themes', async ({
  page,
}) => {
  for (const theme of ['dark', 'light']) {
    const summary = page.locator('.hero-build-details > summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.hero-build-details')).toHaveAttribute('open', '');
    const accessibility = await new AxeBuilder({ page })
      .include('#home')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations, `${theme} expanded build path`).toEqual([]);
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.hero-build-details')).not.toHaveAttribute('open');
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to light theme' }).click();
  }
});
