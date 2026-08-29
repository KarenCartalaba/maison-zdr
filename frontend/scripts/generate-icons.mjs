import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

// Minimal valid PNG — a 1x1 green pixel, base64-encoded
// Replace these with real icons before production
const MINIMAL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(MINIMAL_PNG_BASE64, 'base64');

mkdirSync(iconsDir, { recursive: true });
writeFileSync(join(iconsDir, 'icon-192.png'), pngBuffer);
writeFileSync(join(iconsDir, 'icon-512.png'), pngBuffer);

console.log('Placeholder icons generated in', iconsDir);
