// Resumable render: the film is cut into chunks of CH frames, each encoded to out/chunks/c_NNNN.mp4 as soon as it is done,
// so a crash or a container restart loses at most one chunk per worker. Run it again and it skips finished chunks.
// usage (from the library root): node films/milionario-23-ep2/render_chunks.mjs <worker index> <workers> [--q 'k=v']
//        node films/milionario-23-ep2/render_chunks.mjs join      → out/video.mp4
import fs from 'fs'; import path from 'path'; import { spawn, execFileSync } from 'child_process';
import { openDemo, closeServer } from '../../core/render/page.mjs';
const HERE = path.dirname(new URL(import.meta.url).pathname), FPS = 24, CH = 96, W = 1080, H = 1920;
const dir = path.relative(process.cwd(), HERE), cdir = path.join(HERE, 'out', 'chunks'); fs.mkdirSync(cdir, { recursive: true });
const args = process.argv.slice(2), qi = args.indexOf('--q'), Q = qi >= 0 ? args.splice(qi, 2)[1] : '';
const DUR = JSON.parse(fs.readFileSync(path.join(HERE, 'events.json'))).dur, TOTAL = Math.round(DUR * FPS), N = Math.ceil(TOTAL / CH);
const name = i => path.join(cdir, `c_${String(i).padStart(4, '0')}.mp4`);
if (args[0] === 'join') {
  const missing = [...Array(N).keys()].filter(i => !fs.existsSync(name(i)));
  if (missing.length) { console.error('missing chunks:', missing.join(' ')); process.exit(1); }
  fs.writeFileSync(path.join(cdir, 'list.txt'), [...Array(N).keys()].map(i => `file '${path.basename(name(i))}'`).join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', '../video.mp4'], { cwd: cdir, stdio: 'inherit' });
  console.log('joined', N, 'chunks →', path.join(HERE, 'out', 'video.mp4')); process.exit(0);
}
const wi = +args[0], wn = +args[1], t0 = Date.now();
const { browser, page } = await openDemo(dir, { w: W, h: H, q: Q });
page.setDefaultTimeout(180000);   // software GL: a frame can take tens of seconds when workers share the CPU
for (let i = wi; i < N; i += wn) {
  if (fs.existsSync(name(i))) continue;
  const a = i * CH, b = Math.min(TOTAL, a + CH), tmp = name(i) + '.part.mp4';
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', path.basename(tmp)], { cwd: cdir, stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise(r => ff.on('close', r));
  for (let f = a; f < b; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); const code = await closed;
  if (code !== 0) { console.error('ffmpeg failed on chunk', i); process.exit(1); }
  fs.renameSync(tmp, name(i));
  console.log(`w${wi} chunk ${i + 1}/${N} done  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close(); closeServer();
console.log(`w${wi} finished`);
