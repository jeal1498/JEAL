import { cpSync, rmSync, existsSync, lstatSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const projects = [
  { src: resolve(root, 'hotel-jireh'), dest: resolve(__dirname, '../public/projects/hotel-jireh') },
];

for (const { src, dest } of projects) {
  // Remove symlink or old copy
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  cpSync(src, dest, {
    recursive: true,
    filter: (path) => !path.includes('/.claude') && !path.includes('/node_modules'),
  });
  console.log(`✓ Copied ${src} → ${dest}`);
}
