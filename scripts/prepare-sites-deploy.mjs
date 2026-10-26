import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'apps', 'web', 'dist');
const destination = resolve(root, 'dist');

await rm(destination, { force: true, recursive: true });
await mkdir(resolve(destination, 'server'), { recursive: true });
await cp(source, destination, { recursive: true });
await writeFile(
  resolve(destination, 'server', 'index.js'),
  `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isNavigation = request.method === 'GET' && !/\\.[a-z0-9]+$/i.test(url.pathname);
    if (isNavigation) url.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(url, request));
  }
};
`,
);
