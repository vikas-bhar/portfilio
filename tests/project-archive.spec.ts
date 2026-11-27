import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#project-grid article')).toHaveCount(11);
});

test('searches the numbered collection within categories and recovers from an empty result', async ({
  page,
}) => {
  const search = page.getByRole('searchbox', { name: 'Search projects' });
  const grid = page.locator('#project-grid');
  const result = page.locator('#project-result-count');
  await expect(search).toHaveAttribute('aria-controls', 'project-grid');
  await expect(result).toHaveText('11 projects');
  await search.fill('  rEaCt   Native  ');
  await expect(grid.getByRole('article')).toHaveCount(1);
  await expect(grid.getByRole('heading', { name: 'Kisan Sathi' })).toBeVisible();
  await expect(result).toHaveText('1 project');
  await expect(grid.locator('.project-index')).toHaveText('01');
  await page.getByRole('button', { name: 'Clear project search' }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(grid.getByRole('article')).toHaveCount(11);

  await page.getByRole('button', { name: /^Full-stack/ }).click();
  await search.fill('Rasa');
  await expect(grid.getByRole('article')).toHaveCount(1);
  await expect(grid.locator('.project-index')).toHaveText('04');
  const rasa = grid.getByRole('article');
  await rasa.getByRole('button', { name: /^Show more about/ }).click();
  await expect(rasa.getByText('not an official restaurant site', { exact: false })).toBeVisible();
  await expect(rasa.getByRole('link', { name: /^Live Demo/ })).toHaveAttribute(
    'href',
    'https://rasa-by-gulab.vercel.app',
  );
  await search.fill('no-such-project');
  await expect(grid.getByRole('article')).toHaveCount(0);
  await expect(result).toHaveText('0 projects');
  await expect(page.getByRole('heading', { name: 'No matching projects' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset project filters' }).click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  await expect(page.getByRole('button', { name: /^All projects/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(grid.getByRole('article')).toHaveCount(11);
  await search.fill('FocusPulse');
  await search.press('Escape');
  await expect(search).toHaveValue('');
  await expect(grid.getByRole('article')).toHaveCount(11);
});

test('keeps mounted artwork beside each caption and all actions inside the paper at narrow widths', async ({
  page,
}) => {
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
    const search = await page.getByRole('searchbox', { name: 'Search projects' }).boundingBox();
    expect(search!.x).toBeGreaterThanOrEqual(0);
    expect(search!.x + search!.width).toBeLessThanOrEqual(width);
    await expect(page.locator('#project-result-count')).toBeVisible();
    for (const card of await page.locator('#project-grid article').all()) {
      const layout = await card.evaluate((element) => {
        const paper = element.getBoundingClientRect();
        const visual = element.querySelector('.project-file-visual')!.getBoundingClientRect();
        const caption = element.querySelector('.project-card-content')!.getBoundingClientRect();
        const actions = [...element.querySelectorAll('.project-actions > *')].map((action) => {
          const rect = action.getBoundingClientRect();
          return { left: rect.left, right: rect.right, bottom: rect.bottom };
        });
        return {
          left: paper.left,
          right: paper.right,
          bottom: paper.bottom,
          visualRight: visual.right,
          captionLeft: caption.left,
          actions,
          background: getComputedStyle(element, '::before').backgroundImage,
        };
      });
      expect(layout.visualRight).toBeLessThan(layout.captionLeft);
      expect(layout.background).toContain('/paper-grain.svg');
      for (const action of layout.actions) {
        expect(action.left).toBeGreaterThanOrEqual(layout.left);
        expect(action.right).toBeLessThanOrEqual(layout.right);
        expect(action.bottom).toBeLessThanOrEqual(layout.bottom);
      }
    }
  }
});
