import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svgContent = readFileSync(join(publicDir, 'icon.svg'));

// Generate 192x192 icon
await sharp(svgContent)
  .resize(192, 192)
  .png()
  .toFile(join(publicDir, 'icon-192.png'));

console.log('Generated icon-192.png');

// Generate 512x512 icon
await sharp(svgContent)
  .resize(512, 512)
  .png()
  .toFile(join(publicDir, 'icon-512.png'));

console.log('Generated icon-512.png');

// Generate apple touch icon
await sharp(svgContent)
  .resize(180, 180)
  .png()
  .toFile(join(publicDir, 'apple-touch-icon.png'));

console.log('Generated apple-touch-icon.png');

// Generate favicon
await sharp(svgContent)
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, 'favicon.png'));

console.log('Generated favicon.png');

console.log('All icons generated successfully!');
