import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = 'output/playwright/screenshots';

test.describe.configure({ mode: 'serial' });

test('capture desktop comparison targets', async ({ page }) => {
  mkdirSync(out, { recursive: true });
  await page.setViewportSize({ width: 1487, height: 1058 });
  const publicTargets = [
    ['P01', '/'],
    ['P05', '/map'],
    ['P06', '/spots'],
    ['P09', '/spots/guo-en-temple/3d'],
    ['P17', '/stamps'],
    ['P19', '/achievements'],
  ] as const;
  for (const [id, route] of publicTargets) {
    await page.goto(route);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `${out}/${id}-implementation-1487x1058.png`,
    });
  }

  await page.goto('http://127.0.0.1:17474/admin/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.screenshot({ path: `${out}/P27-implementation-1487x1058.png` });
  await page.evaluate(() =>
    localStorage.setItem('liuzu-admin:session', 'true'),
  );
  const adminTargets = [
    ['P28', '/admin/stats'],
    ['P29', '/admin/spots'],
    ['P30', '/admin/spots/new'],
    ['P31', '/admin/routes'],
    ['P32', '/admin/achievements'],
  ] as const;
  for (const [id, route] of adminTargets) {
    await page.goto(`http://127.0.0.1:17474${route}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(350);
    await page.screenshot({
      path: `${out}/${id}-implementation-1487x1058.png`,
    });
  }
});

test('capture responsive evidence', async ({ page }) => {
  mkdirSync(out, { recursive: true });
  const viewports = [
    ['1440x1024', 1440, 1024],
    ['768x1024', 768, 1024],
    ['390x844', 390, 844],
    ['1920x1080', 1920, 1080],
  ] as const;
  for (const [name, width, height] of viewports) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${out}/home-${name}.png` });
    await page.goto('/spots');
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${out}/spots-${name}.png` });
  }
});
