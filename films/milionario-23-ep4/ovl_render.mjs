// The retention edit's 2D pass as transparent PNGs (main.js ?ovl=1, no 3D): node films/<ep>/ovl_render.mjs <out dir> [t1 t2 ...]
// With no times it renders every frame of the film (24 fps) as <out dir>/NNNNN.png, to composite over the first render.
import fs from 'fs'; import path from 'path'; import { openDemo, closeServer } from '../../core/render/page.mjs';
const HERE = path.dirname(new URL(import.meta.url).pathname), [out, ...times] = process.argv.slice(2), FPS = 24;
fs.mkdirSync(out, { recursive: true });
const { browser, page } = await openDemo(path.relative(process.cwd(), HERE), { w: 1080, h: 1920, q: 'ovl=1' });
page.setDefaultTimeout(240000);
const N = Math.ceil(await page.evaluate(() => window.DUR) * FPS);
const list = times.length ? times.map(Number) : [...Array(N).keys()].map(i => i / FPS);
for (const [k, t] of list.entries()) {
  const url = await page.evaluate(t => { window.render(t); return document.getElementById('ov').toDataURL('image/png'); }, t);
  fs.writeFileSync(path.join(out, times.length ? `t${t}.png` : `${String(k).padStart(5, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
  if (!times.length && k % 240 === 0) console.log(`${k}/${list.length}`);
}
await browser.close(); closeServer();
