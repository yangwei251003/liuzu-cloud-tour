export function publicAssetPath(path: string): string {
  const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  return path.replace(/(^|,\s*)\/(media|brand)\//g, `$1${base}$2/`);
}
