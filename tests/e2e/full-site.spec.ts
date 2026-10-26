import { expect, test, type Page } from '@playwright/test';

const publicRoutes = [
  '/',
  '/map',
  '/spots',
  '/spots/guo-en-temple',
  '/spots/guo-en-temple/3d',
  '/routes',
  '/routes/zen-one-day',
  '/stamps',
  '/stamps/certificate',
  '/achievements',
  '/achievements/livestream',
  '/about',
];

const viewports = [
  { name: 'prototype', width: 1487, height: 1058 },
  { name: 'desktop', width: 1440, height: 1024 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'wide', width: 1920, height: 1080 },
];

async function assertHealthyPage(page: Page) {
  await expect(page.locator('main')).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
      ) - innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator('body')).not.toContainText('页面未找到');
}

test.describe('public production smoke', () => {
  for (const route of publicRoutes) {
    test(`${route} renders without overflow`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await assertHealthyPage(page);
    });
  }

  for (const viewport of viewports) {
    test(`responsive shell ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const route of ['/', '/map', '/spots', '/stamps', '/achievements']) {
        await page.goto(route);
        await assertHealthyPage(page);
      }
    });
  }

  test('core navigation, filtering and gallery modal are operable', async ({
    page,
  }) => {
    await page.goto('/spots');
    await page.getByLabel('按类别筛选').selectOption('禅文化');
    await expect(page.getByText('国恩寺').first()).toBeVisible();
    await page.goto('/');
    const galleryButton = page
      .getByRole('button', { name: '放大查看' })
      .first();
    await galleryButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('offline map and unavailable 3D disclose their status', async ({
    page,
  }) => {
    await page.goto('/map');
    await expect(page.locator('.offline-map, .online-map').first()).toBeVisible();
    await page.goto('/spots/guo-en-temple/3d');
    await expect(page.getByText(/模型|规划中|不可用/).first()).toBeVisible();
  });

  test('hero media metadata and browser console are healthy', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    const video = page.locator('video');
    await expect(video).toHaveCount(1);
    await video.evaluate((element: HTMLVideoElement) => {
      if (element.readyState < 1) {
        return new Promise<void>((resolve) =>
          element.addEventListener('loadedmetadata', () => resolve(), {
            once: true,
          }),
        );
      }
    });
    const metadata = await video.evaluate((element: HTMLVideoElement) => ({
      duration: element.duration,
      muted: element.muted,
      width: element.videoWidth,
      height: element.videoHeight,
      currentSrc: element.currentSrc,
    }));
    expect(metadata.duration).toBeGreaterThanOrEqual(9.9);
    expect(metadata.duration).toBeLessThanOrEqual(10.1);
    expect(metadata.muted).toBe(true);
    expect(metadata.width).toBeGreaterThan(0);
    expect(metadata.height).toBeGreaterThan(0);
    expect(metadata.currentSrc).toContain('/media/hero/hero-cloud-loop.mp4');
    expect(errors).toEqual([]);
  });
});

test.describe('admin production smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:17474/admin/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('login validation and all admin routes work', async ({ page }) => {
    await page.getByRole('button', { name: '登录演示后台' }).click();
    await expect(page.getByText('请输入账号和密码')).toBeVisible();
    await page.getByLabel('账号').fill('demo');
    await page.getByLabel('密码').fill('demo');
    await page.getByRole('button', { name: '登录演示后台' }).click();
    await expect(page.getByRole('heading', { name: '数据概览' })).toBeVisible();
    for (const label of ['景点管理', '路线管理', '内容成果', '数据概览']) {
      await page.getByRole('button', { name: label }).click();
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('admin mobile layout has no horizontal page overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel('账号').fill('demo');
    await page.getByLabel('密码').fill('demo');
    await page.getByRole('button', { name: '登录演示后台' }).click();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
