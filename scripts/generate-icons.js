const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

const sizes = [
  { name: 'favicon.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated ${name} (${size}x${size})`);
  }

  console.log('Done!');
}

generateIcons().catch(console.error);
