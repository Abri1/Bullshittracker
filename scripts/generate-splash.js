const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const splashDir = path.join(__dirname, '../public/splash');

// iPhone splash screen sizes
const sizes = [
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796.png' },
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556.png' },
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778.png' },
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532.png' },
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' },
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688.png' },
  { width: 828, height: 1792, name: 'apple-splash-828-1792.png' },
  { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },
];

async function generateSplash() {
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }

  for (const size of sizes) {
    // Create a dark background with centered poop emoji and app name
    const iconSize = Math.min(size.width, size.height) * 0.15;

    // Create SVG with centered content
    const svg = `
      <svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0a0a0a"/>
        <text x="50%" y="45%"
              font-size="${iconSize}"
              text-anchor="middle"
              dominant-baseline="middle">
          💩
        </text>
        <text x="50%" y="58%"
              font-family="-apple-system, BlinkMacSystemFont, sans-serif"
              font-size="${iconSize * 0.35}"
              font-weight="bold"
              fill="white"
              text-anchor="middle"
              dominant-baseline="middle">
          BULLSHIT TRACKER
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(splashDir, size.name));

    console.log(`Generated ${size.name}`);
  }

  console.log('All splash screens generated!');
}

generateSplash().catch(console.error);
