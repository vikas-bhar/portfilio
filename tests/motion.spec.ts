import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

async function openPortfolio(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.cyber-matrix-wires [data-target]')).toHaveCount(4);
}

async function withoutWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return type === 'webgl2' ? null : Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
}

async function computed(locator: Locator, property: string) {
  return locator.evaluate(
    (element, name) => getComputedStyle(element).getPropertyValue(name),
    property,
  );
}

async function expectEndpointAligned(page: Page, id: string) {
  await expect
    .poll(
      async () =>
        page.evaluate((targetId) => {
          const target = document.getElementById(targetId)!;
          const root = document.querySelector('.site-shell')!;
          const terminal = document.querySelector(
            `.cyber-matrix-wires [data-target="${targetId}"] > g`,
          )!;
          const coordinates = terminal
            .getAttribute('transform')!
            .match(/translate\(([^,]+),\s*([^)]+)\)/)!;
          const expectedY =
            target.getBoundingClientRect().top - root.getBoundingClientRect().top + 70;
          return Math.abs(Number(coordinates[2]) - expectedY);
        }, id),
      { timeout: 15_000 },
    )
    .toBeLessThan(1);
}

test('restores the original global scene, continuous floats, wire streams and spinning rings', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openPortfolio(page);
  const scene = page.locator('.site-shell > .ambient-background');
  await expect(scene).toHaveAttribute('data-webgl', 'ready');
  await expect(scene).toHaveAttribute('data-polyhedra', '10');
  await expect(scene).toHaveAttribute('data-nodes', '65');
  await expect(scene).toHaveAttribute('data-dust', '120');
  expect(await computed(scene, 'position')).toBe('fixed');
  expect(await computed(scene, 'pointer-events')).toBe('none');
  await expect(scene.locator('canvas')).toHaveCount(1);
  await expect(scene.locator('.ambient-fallback')).not.toBeVisible();

  // Continuous motion must remain enabled even on touch devices without hover.
  const float = page.locator('.hero-copy .floating-motion').first();
  const firstFloat = await computed(float, 'transform');
  await expect.poll(() => computed(float, 'transform')).not.toBe(firstFloat);
  const stream = page.locator('.circuit-pulse').first();
  const firstDash = await computed(stream, 'stroke-dashoffset');
  await expect.poll(() => computed(stream, 'stroke-dashoffset')).not.toBe(firstDash);
  const ring = page.locator('.orbit-outer');
  const firstRotation = await computed(ring, 'transform');
  await expect.poll(() => computed(ring, 'transform')).not.toBe(firstRotation);
  for (const section of ['home', 'about-me', 'project', 'my-skill', 'experience', 'contact']) {
    expect(
      await page.locator(`#${section} .floating-wrapper[data-motion="floating"]`).count(),
    ).toBeGreaterThan(0);
  }

  // Rendering, rather than just a mounted canvas, is required.
  const pixels = await scene.locator('canvas').evaluate(
    (canvas: HTMLCanvasElement) =>
      new Promise<number>((resolve) => {
        requestAnimationFrame(() => {
          const gl = canvas.getContext('webgl2')!;
          const buffer = new Uint8Array(canvas.width * canvas.height * 4);
          gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
          let visible = 0;
          for (let index = 3; index < buffer.length; index += 16) if (buffer[index]) visible++;
          resolve(visible);
        });
      }),
  );
  expect(pixels).toBeGreaterThan(0);

  // Keyboard activation works without needing a perpetually floating button to stop.
  const resume = page.getByRole('button', { name: 'View résumé', exact: true });
  await resume.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(scene).toHaveAttribute('data-playback', 'paused');
  await page.keyboard.press('Escape');
  await expect(scene).toHaveAttribute('data-playback', 'running');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.ambient-background canvas')).toHaveCount(0);
  await expect(page.locator('.floating-wrapper[data-motion="floating"]')).toHaveCount(0);
  expect(await computed(stream, 'animation-name')).toBe('none');
  expect(errors).toEqual([]);
});

test('keeps all four circuit endpoints aligned after filtering, note expansion and resizing', async ({
  page,
}) => {
  await withoutWebGL(page);
  await openPortfolio(page);
  const wire = page.locator('.cyber-matrix-wires [data-target="contact"] > path').first();
  const originalPath = await wire.getAttribute('d');
  for (const id of ['about-me', 'project', 'my-skill', 'contact'])
    await expectEndpointAligned(page, id);

  await page.getByRole('button', { name: /^Applied AI/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#project-grid article')).toHaveCount(3);
  await expect(wire).not.toHaveAttribute('d', originalPath!);
  await expectEndpointAligned(page, 'contact');

  await page.getByRole('button', { name: /^Featured/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#project-grid article')).toHaveCount(4);
  for (const toggle of await page.locator('#project-grid .project-read-more').all()) {
    await toggle.focus();
    await page.keyboard.press('Enter');
  }
  await expect(page.locator('#project-grid button[aria-expanded="true"]')).toHaveCount(4);
  await expectEndpointAligned(page, 'contact');

  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect
    .poll(
      () =>
        page.locator('.matrix-svg').evaluate((svg: SVGSVGElement) => {
          const rootTop = document.querySelector('.site-shell')!.getBoundingClientRect().top;
          return Math.abs(svg.viewBox.baseVal.y + rootTop);
        }),
      { timeout: 15_000 },
    )
    .toBeLessThan(1);

  await page.setViewportSize({ width: 768, height: 900 });
  for (const id of ['about-me', 'project', 'my-skill', 'contact'])
    await expectEndpointAligned(page, id);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});

test('preserves floating controls and pointer tilt when WebGL is unavailable', async ({
  page,
}, testInfo) => {
  await withoutWebGL(page);
  await openPortfolio(page);
  await expect(page.locator('.ambient-fallback')).toBeVisible();
  await expect(page.locator('.ambient-background canvas')).toHaveCount(0);
  const float = page.locator('.hero-copy .floating-motion').first();
  const before = await computed(float, 'transform');
  await expect.poll(() => computed(float, 'transform')).not.toBe(before);

  if (testInfo.project.name === 'desktop') {
    const wrapper = page.locator('#project-grid .tilt-card').first();
    await wrapper.scrollIntoViewIfNeeded();
    const inner = wrapper.locator('.tilt-card-inner');
    const rect = await wrapper.boundingBox();
    await page.mouse.move(rect!.x + rect!.width * 0.8, rect!.y + rect!.height * 0.2);
    await expect.poll(() => computed(inner, 'transform')).toContain('matrix3d');
    await expect.poll(() => computed(wrapper.locator('.tilt-card-glare'), 'opacity')).toBe('0.22');
  }

  const resume = page.getByRole('button', { name: 'View résumé', exact: true });
  await resume.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(resume).toBeFocused();
});
