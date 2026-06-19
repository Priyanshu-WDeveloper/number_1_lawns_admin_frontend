import { getMediaBaseUrl } from '@/lib/config';

export function resolveFileUrl(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const base = getMediaBaseUrl().replace(/\/+$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
