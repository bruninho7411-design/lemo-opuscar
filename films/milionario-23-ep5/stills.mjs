// Review stills with a long timeout (software GL shared with a running render): [Q=capa=1] node films/<ep>/stills.mjs <out dir> <prefix> t1 t2 ...
import path from 'path'; import { openDemo, closeServer } from '../../core/render/page.mjs';
const HERE = path.dirname(new URL(import.meta.url).pathname), [out, prefix, ...times] = process.argv.slice(2);
const { browser, page } = await openDemo(path.relative(process.cwd(), HERE), { w: 1080, h: 1920, q: process.env.Q ?? '' });
page.setDefaultTimeout(240000);
for (const t of times) { await page.evaluate(t => window.render(t), +t); await page.screenshot({ path: path.join(out, `${prefix}${t}.jpg`), type: 'jpeg', quality: 90 }); console.log(t); }
await browser.close(); closeServer();
