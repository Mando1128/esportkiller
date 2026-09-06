import { resolve, relative, isAbsolute, extname } from 'node:path';

export function publicPath(root, pathname) {
  let requested;
  try { requested = decodeURIComponent(pathname); } catch { return null; }
  const segments = requested.replace(/\\/g, '/').split('/').filter(Boolean);
  if (segments.some(s => s.startsWith('.') || ['server','node_modules','dist'].includes(s.toLowerCase()))) return null;
  const file = resolve(root, segments.length ? segments.join('/') : 'index.html');
  const rel = relative(root, file);
  if (rel.startsWith('..') || isAbsolute(rel)) return null;
  if (!['.html','.css','.js','.json','.webmanifest','.png','.jpg','.jpeg','.svg','.webp','.ico','.woff','.woff2','.part0','.part1','.part2','.part3'].includes(extname(file).toLowerCase())) return null;
  return file;
}
