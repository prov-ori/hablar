// Рендерит assets/og-source.html → assets/og-image.png (1200×630) и assets/icon.svg → apple-touch-icon.png / icon-192.png.
// Запуск: NODE_PATH=$(npm root -g) node tools/render-og.js
const path = require('path');
// После рендера og-image.png сожмите до <300 КБ (WhatsApp): PIL Image.quantize(colors=128) даёт ~70 КБ без видимой потери.
const fs = require('fs');
const { chromium } = require('playwright');
const dir = path.join(__dirname, '..', 'assets');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + path.join(dir, 'og-source.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  const ok = await p.evaluate(() => document.fonts.check('900 40px Nunito'));
  if (!ok) console.warn('WARNING: Nunito did not load; image uses fallback font');
  await p.screenshot({ path: path.join(dir, 'og-image.png') });
  const svg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
  for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    const q = await b.newPage({ viewport: { width: size, height: size } });
    await q.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`);
    await q.screenshot({ path: path.join(dir, name), omitBackground: true });
  }
  await b.close();
})();
