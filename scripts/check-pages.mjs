import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..');
const dir = resolve(root, 'pages-dist');
const prefix = '/liuzu-cloud-tour/';
const origin = 'http://127.0.0.1:17475';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.webm': 'video/webm', '.mp4': 'video/mp4' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    if (!url.pathname.startsWith(prefix)) { res.writeHead(404); res.end(); return; }
    const name = decodeURIComponent(url.pathname.slice(prefix.length));
    const target = resolve(dir, name.endsWith('/') || !name ? `${name}index.html` : name);
    if (!(target === dir || target.startsWith(dir + sep))) { res.writeHead(403); res.end(); return; }
    const body = await readFile(target); res.writeHead(200, { 'content-type': types[extname(target)] ?? 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((ok) => server.listen(17475, '127.0.0.1', ok));
const errors = [], requests = [], checks = [];
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { if (!r.url().startsWith(origin)) requests.push(r.url()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  const images = resolve(root, 'docs/images'); mkdirSync(images, { recursive: true });
  async function healthy() {
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.demo-boundary')).toBeVisible();
    await page.evaluate(() => Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
    const missing = await page.evaluate(() => [...document.images].filter(i => i.getBoundingClientRect().width && (!i.complete || !i.naturalWidth)).map(i => i.getAttribute('src')));
    expect(missing).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  for (const route of ['/', '/spots', '/routes', '/map', '/spots/guo-en-temple/3d', '/stamps', '/about']) {
    const response = await page.goto(`${origin}${prefix}#${route}`);
    if (response) expect(response.status()).toBe(200); await page.waitForLoadState('networkidle'); await healthy();
    expect((await page.reload()).status()).toBe(200); await page.waitForLoadState('networkidle'); await healthy(); checks.push(`prefixed route + reload: ${route}`);
    if (route === '/') await page.screenshot({ path: resolve(images, 'home-desktop.png') });
    if (route === '/map') await page.screenshot({ path: resolve(images, 'map-desktop.png') });
  }
  await page.goto(`${origin}${prefix}`); await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: '禅踪地图', exact: true }).click();
  await expect(page).toHaveURL(/#\/map$/); checks.push('real navigation stays under repository prefix');
  await page.getByRole('button', { name: '唤醒禅小荔智能助手，双击查看对话记录' }).click();
  await page.getByPlaceholder('想了解什么？').fill('如何体验网站');
  const before = requests.length;
  await page.getByPlaceholder('想了解什么？').press('Enter');
  await expect(page.getByText(/这是静态导览演示/).first()).toBeVisible();
  expect(requests.length).toBe(before); checks.push('static assistant explains no online AI and sends no external request');
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/map', '/spots', '/stamps']) {
    await page.goto(`${origin}${prefix}#${route}`); await page.waitForLoadState('networkidle'); await healthy(); checks.push(`mobile: ${route}`);
    if (route === '/') await page.screenshot({ path: resolve(images, 'home-mobile.png') });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}${prefix}admin/`); await page.getByLabel('账号', { exact: true }).fill('demo'); await page.getByLabel('密码', { exact: true }).fill('demo');
  await page.getByRole('button', { name: '登录演示后台' }).click();
  await expect(page.getByRole('heading', { name: '数据概览', exact: true })).toBeVisible();
  await page.reload(); await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: '数据概览', exact: true })).toBeVisible();
  checks.push('local demo admin login and hash reload');
  await page.screenshot({ path: resolve(images, 'admin-desktop.png'), mask: [page.locator('input[type="password"]')] });
  for (const label of ['景点管理', '路线管理', '内容成果', '数据概览']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('main')).toBeVisible(); checks.push(`admin: ${label}`);
  }
  expect(errors).toEqual([]); expect(requests).toEqual([]);
  writeFileSync(resolve(root, '../pages-browser-evidence.json'), JSON.stringify({ checks, count: checks.length, errors, externalRequests: requests, source: 'Actual sanitized production Pages build in isolated system Chrome; fresh browser storage; no accounts or map/model keys.' }, null, 2));
  console.log(JSON.stringify({ passed: checks.length, errors: errors.length, externalRequests: requests.length }));
} finally { await browser?.close(); await new Promise(ok => server.close(ok)); }
