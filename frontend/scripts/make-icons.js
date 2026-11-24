const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const src = path.join(__dirname, '..', 'public', 'icons', 'brand.svg');
const out = path.join(__dirname, '..', 'public', 'icons');
const svg = fs.readFileSync(src);

async function render(size, name, innerScale = 1) {
  // Skala < 1 daje margines bezpieczeństwa dla ikon maskowalnych.
  let buffer = svg;
  if (innerScale !== 1) {
    const scaled = svg
      .toString('utf8')
      .replace(
        'transform="translate(96,96) scale(13.3333)"',
        `transform="translate(96,96) scale(${(13.3333 * innerScale).toFixed(4)})"`
      )
      .replace('rx="96"', 'rx="0"');
    buffer = Buffer.from(scaled);
  }

  await sharp(buffer, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 37, g: 99, b: 235, alpha: 1 } })
    .png()
    .toFile(path.join(out, name));
  console.log('ok', name, size);
}

(async () => {
  // Ikona maskowalna: tło pełnoekranowe, logo w strefie bezpieczeństwa (60%).
  const maskable = svg
    .toString('utf8')
    .replace('rx="96"', 'rx="0"')
    .replace(
      'transform="translate(96,96) scale(13.3333)"',
      'transform="translate(166,166) scale(7.5)"'
    );

  await sharp(svg, { density: 384 }).resize(512, 512).png().toFile(path.join(out, 'icon-512.png'));
  await sharp(svg, { density: 384 }).resize(192, 192).png().toFile(path.join(out, 'icon-192.png'));
  await sharp(Buffer.from(maskable), { density: 384 })
    .resize(512, 512)
    .png()
    .toFile(path.join(out, 'icon-maskable-512.png'));
  await sharp(svg, { density: 384 })
    .resize(180, 180)
    .png()
    .toFile(path.join(out, 'apple-touch-icon.png'));
  console.log('done');
})();
