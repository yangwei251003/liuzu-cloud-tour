import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const raw = process.env.PAGES_BASE_PATH ?? '/liuzu-cloud-tour/';
if (!/^\/(?:[a-zA-Z0-9._-]+\/)*$/.test(raw)) throw new Error('PAGES_BASE_PATH must be an absolute directory path.');
const env = { ...process.env, VITE_PAGES: 'true', PAGES_BASE_PATH: raw };
// Invoke the pinned workspace package manager through Node, including on Windows.
const pnpm = process.env.npm_execpath;
if (!pnpm) throw new Error('Run this script via pnpm build:pages.');
execFileSync(process.execPath, [pnpm, 'build'], { cwd: root, env, stdio: 'inherit' });
const out = resolve(root, 'pages-dist');
rmSync(out, { force: true, recursive: true }); mkdirSync(out, { recursive: true });
cpSync(resolve(root, 'apps/web/dist'), out, { recursive: true });
cpSync(resolve(root, 'apps/admin/dist'), resolve(out, 'admin'), { recursive: true });
writeFileSync(resolve(out, '.nojekyll'), '');
console.log(`Static demonstration prepared for ${raw}; no API, map key or user data configured.`);
