// Napoleão: Reels player (lemo-opuscar page contract: READY, DUR, render(t)).
// Built on the films/apocalipse-30-dias player (camera, captions, CTA); reads /films/napoleao/timeline.json from tools/build.py.
(() => {
const ROOT = '/films/napoleao/';
const W = 1080, H = 1920;
const GOLD = '#FFC94A', RED = '#D7262E', INK = '#0d0b09';
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; document.body.appendChild(cv);
const ctx = cv.getContext('2d');

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eio = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const eo5 = t => 1 - Math.pow(1 - t, 5);
const back = (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const vnoise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };

let TL = null; const IMG = {}; const FR = new Map(); let GRAIN = [];
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('image ' + src)); i.src = src; });
async function frameImg(dir, k) {
  const key = dir + k; if (FR.has(key)) return FR.get(key);
  const im = await loadImg(dir + String(k + 1).padStart(4, '0') + '.jpg'); FR.set(key, im);
  if (FR.size > 90) FR.delete(FR.keys().next().value);
  return im;
}
async function init() {
  TL = await (await fetch(ROOT + 'timeline.json')).json();
  for (const [fam, file, desc] of [['Anton', 'Anton-Regular.ttf', {}], ['Play', 'playfair.woff2', {}], ['Corm', 'cormorant-italic.woff2', { style: 'italic' }]]) {
    const f = new FontFace(fam, `url(${ROOT}player/fonts/${file})`, desc); await f.load(); document.fonts.add(f);
  }
  await Promise.all(TL.scenes.map(async s => { if (s.img && !IMG[s.img]) IMG[s.img] = await loadImg(s.img); }));
  IMG.avatar = await loadImg(TL.avatar);
  // film grain: a few pre-rendered noise tiles, cycled per frame
  for (let g = 0; g < 4; g++) {
    const c = document.createElement('canvas'); c.width = 360; c.height = 640; const x = c.getContext('2d'), d = x.createImageData(360, 640);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (hash(i * .37 + g * 991) - .5) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); GRAIN.push(c);
  }
  window.DUR = TL.dur; window.READY = true;
}

// ---------- camera ----------
let XF = null;   // last image->screen transform, for overlays pinned to the picture
function camera(sc, t, first) {
  const u = seg(t, sc.t0, sc.t1), e = eio(u);
  let s = 1, px = null, py = null, r = 0, f = sc.focus;
  switch (sc.motion) {
    case 'crash': {   // frame 0: extreme close-up on the eyes, crash zoom out to the face, then a slow creep in
      const z = eo5(seg(t, sc.t0, sc.t0 + .55));
      s = lerp(2.6, 1.05, z) + .08 * e; f = [lerp(.44, .5, z), lerp(.36, .4, z)]; break;
    }
    case 'pushin': s = lerp(1.0, 1.14, e); break;
    case 'slowpush': s = lerp(1.02, 1.1, e); break;
    case 'pullback': s = lerp(1.2, 1.0, eo(u)); break;
    case 'pullsoft': s = lerp(1.05, 1.0, e); break;
    case 'zoomout': s = lerp(1.35, 1.0, eo(u)); break;
    case 'panright': s = 1.22; px = lerp(.1, .9, e); break;
    case 'panleft': s = 1.25; px = lerp(.9, .1, e); break;
    case 'punch': s = lerp(1.4, 1.06, eo(seg(t, sc.t0, sc.t0 + .35))) + .06 * e; break;
    default: s = lerp(1.0, 1.08, e);
  }
  if (!first && sc.motion !== 'punch') s *= 1 + .07 * (1 - eo(seg(t, sc.t0, sc.t0 + .3)));   // cut punch
  return { s, px, py, r, f };
}
function drawCover(im, sc, t, first) {
  const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
  const c = camera(sc, t, first), base = Math.max(W / iw, H / ih), k = base * c.s;
  const vw = W / k, vh = H / k, f = c.f || [.5, .5];
  let cx = c.px != null ? lerp(vw / 2, iw - vw / 2, c.px) : f[0] * iw;
  let cy = c.py != null ? lerp(vh / 2, ih - vh / 2, c.py) : f[1] * ih;
  cx = clamp(cx, vw / 2, iw - vw / 2); cy = clamp(cy, vh / 2, ih - vh / 2);
  ctx.save(); ctx.translate(W / 2, H / 2); if (c.r) ctx.rotate(c.r); ctx.scale(k, k); ctx.translate(-cx, -cy);
  ctx.drawImage(im, 0, 0); ctx.restore();
  XF = (ix, iy) => [W / 2 + (ix * iw - cx) * k, H / 2 + (iy * ih - cy) * k];
}
async function sceneImage(sc, t) {
  if (sc.frames) {
    const n = sc.frames.n, k = clamp(Math.floor((t - sc.t0) * sc.frames.fps * 1.12), 0, n - 1);   // a touch faster than real time
    return frameImg(sc.frames.dir, k);
  }
  return IMG[sc.img];
}

// ---------- shake ----------
function shake(t) {
  let a = 0;
  for (const ev of TL.events) if ((ev.type === 'impact' || ev.type === 'stamp') && t >= ev.t && t < ev.t + .5)
    a += (ev.type === 'stamp' ? 34 : 22) * ev.v * Math.exp(-(t - ev.t) * 11);
  return [vnoise(t * 31) * a, vnoise(t * 29 + 50) * a];
}

// ---------- atmosphere ----------
function particles(t, n, col, rise, size, seed = 0) {
  for (let i = 0; i < n; i++) {
    const sp = .3 + hash(i + seed) * .7, x = (hash(i + 9 + seed) * W + Math.sin(t * .7 + i) * 40 + t * 10 * sp) % W;
    const y = ((hash(i + 3 + seed) * H - t * rise * sp) % H + H) % H, r = size * (.5 + hash(i + 5 + seed));
    const a = (.25 + .5 * hash(i + 7 + seed)) * (.6 + .4 * Math.sin(t * 3 + i));
    ctx.fillStyle = `rgba(${col},${a})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
}
function rain(t) {
  ctx.strokeStyle = 'rgba(190,215,230,.22)'; ctx.lineWidth = 2;
  for (let i = 0; i < 120; i++) {
    const x = (hash(i) * W * 1.2 + t * 200) % (W * 1.2) - 100, y = (hash(i + 40) * H + t * 1900 * (.8 + hash(i + 2) * .4)) % H;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y - 60); ctx.stroke();
  }
}
function applyFx(sc, t) {
  const fx = sc.fx || [];
  if (fx.includes('dust')) particles(t, 40, '255,235,200', 25, 2.4);
  if (fx.includes('embers')) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; particles(t, 60, '255,150,50', 160, 3.2, 40); ctx.restore(); }
  if (fx.includes('smoke')) {
    ctx.save(); ctx.globalAlpha = .18;
    for (let i = 0; i < 6; i++) {
      const x = ((hash(i) * W + t * 40 * (1 + i * .2)) % (W + 600)) - 300, y = H * (.3 + .5 * hash(i + 4));
      const g = ctx.createRadialGradient(x, y, 0, x, y, 420); g.addColorStop(0, 'rgba(230,220,200,1)'); g.addColorStop(1, 'rgba(230,220,200,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 420, y - 420, 840, 840);
    }
    ctx.restore();
  }
  if (fx.includes('candle')) {
    const fl = .1 + .08 * vnoise(t * 7) + .05 * vnoise(t * 17);
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,160,60,${fl})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  if (fx.includes('rain')) rain(t);
}
function grade(t) {
  // warm grade, vignette, grain: one look over every picture
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,190,120,.16)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .5, H * .8);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.62)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .12; ctx.drawImage(GRAIN[Math.floor(t * 24) % 4], 0, 0, W, H); ctx.restore();
  for (const ev of TL.events) if (ev.type === 'impact' && t >= ev.t && t < ev.t + .18) {
    ctx.fillStyle = `rgba(255,245,225,${.5 * ev.v * (1 - (t - ev.t) / .18)})`; ctx.fillRect(0, 0, W, H);
  }
}

// ---------- text ----------
function strokeText(txt, x, y, size, fill = '#fff', sw = .14, font = 'Anton') {
  ctx.font = `${size}px ${font}`; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  ctx.lineWidth = size * sw; ctx.strokeStyle = INK; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

function captions(t) {
  if (t < TL.hook.t1 || t >= TL.end.t0) return;
  const c = TL.caps.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  if (Math.abs(c.t0 - TL.hook.stampAt) < .25) return;   // the stamp says it
  const pop = back(seg(t, c.t0, c.t0 + .12), 2.2), size = c.big ? 128 : 96;
  ctx.save(); ctx.font = `${size}px Anton`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const sp = size * .3, ws = c.words.map(w => ctx.measureText(w.w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  const fit = Math.min(1, 960 / tot), y = TL.capY;
  ctx.translate(W / 2, y); ctx.scale(fit * (.85 + .15 * pop), fit * (.85 + .15 * pop));
  let x = -tot / 2;
  c.words.forEach((w, i) => {
    const on = t >= w.t0 && t < (c.words[i + 1]?.t0 ?? c.t1), s = on ? 1.06 : 1;
    ctx.save(); ctx.translate(x + ws[i] / 2, 0); ctx.scale(s, s); ctx.textAlign = 'center';
    strokeText(w.w, 0, 6, size, (on || c.big) ? GOLD : '#fff', .16); ctx.restore(); x += ws[i] + sp;
  });
  ctx.restore();
}

// ---------- hook: the claim on frame 0, then the FAKE NEWS stamp ----------
function hook(t) {
  const h = TL.hook; if (t >= h.t1 + .15) return;
  const fade = 1 - seg(t, h.t1, h.t1 + .15), size = 150;
  ctx.save(); ctx.globalAlpha = fade; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  const lines = [h.words.slice(0, 1), h.words.slice(1)];   // NAPOLEÃO / NÃO ERA BAIXINHO
  let y = 1180;
  lines.forEach((ln, li) => {
    ctx.font = `${size}px Anton`;
    const sp = size * .28, ws = ln.map(w => ctx.measureText(w.w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ln.length - 1);
    const fit = Math.min(1, 1000 / tot); let x = W / 2 - tot * fit / 2;
    ln.forEach((w, i) => {
      const wi = h.words.indexOf(w), p = back(seg(t, wi * .06, wi * .06 + .18), 2.6), on = t >= w.t0;
      ctx.save(); ctx.translate(x + ws[i] * fit / 2, y); ctx.scale(p * fit * (on ? 1.04 : 1), p * fit);
      strokeText(w.w, 0, 0, size, w.hi ? GOLD : '#fff', .14); ctx.restore(); x += (ws[i] + sp) * fit;
    });
    y += size * 1.08;
  });
  ctx.restore();
}
function stamp(t) {
  const h = TL.hook, t0 = h.stampAt, sc0 = TL.scenes[0]; if (t < t0 || t > sc0.t1 + .1) return;
  const slam = eo(seg(t, t0, t0 + .14)), s = lerp(3, 1, slam), out = 1 - seg(t, sc0.t1 - .2, sc0.t1 + .1);
  ctx.save(); ctx.globalAlpha = Math.min(1, slam * 1.4) * out; ctx.translate(W / 2, 760); ctx.rotate(-.12); ctx.scale(s, s);
  ctx.font = '170px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(h.stamp).width, bw = tw + 90, bh = 230;
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = 16; ctx.strokeStyle = RED; rrect(-bw / 2, -bh / 2, bw, bh, 20); ctx.stroke();
  ctx.lineWidth = 5; rrect(-bw / 2 + 18, -bh / 2 + 18, bw - 36, bh - 36, 12); ctx.stroke();
  ctx.fillStyle = RED; ctx.fillText(h.stamp, 0, 8);
  // worn ink: knock out speckles
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(0,0,0,${.4 + .6 * hash(i + 3)})`; ctx.beginPath(); ctx.arc((hash(i) - .5) * bw, (hash(i + 77) - .5) * bh, 1 + hash(i + 5) * 5, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- year badge (top left) ----------
function yearBadge(t) {
  if (t < TL.hook.t1) return;
  const i = Math.max(0, TL.scenes.findLastIndex(s => t >= s.t0)), sc = TL.scenes[i]; if (!sc.year) return;
  let since = sc.t0; for (let k = i; k > 0 && TL.scenes[k - 1].year === sc.year; k--) since = TL.scenes[k - 1].t0;
  const p = back(seg(t, since + .2, since + .5), 2), x = 60, y = 160, w = 250, h = 96;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(p, p); ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.fillStyle = 'rgba(12,10,8,.78)'; rrect(x, y, w, h, 14); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.stroke();
  ctx.fillStyle = GOLD; ctx.font = '70px Play'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // rolling digits when it first appears
  const roll = seg(t, since + .2, since + .75), shown = roll < 1 ? String(Math.round(lerp(+sc.year - 25, +sc.year, eo(roll)))) : sc.year;
  ctx.fillText(shown, x + w / 2, y + h / 2 + 4); ctx.restore();
}

// ---------- labels, doc, ruler ----------
function label(sc, t) {
  const l = sc.label; if (!l || t < l.t) return;
  const p = back(seg(t, l.t, l.t + .3), 2), a = 1 - seg(t, sc.t1 - .25, sc.t1);
  ctx.save(); ctx.globalAlpha = a; ctx.font = '60px Anton'; const tw = ctx.measureText(l.text).width, bw = tw + 70, bh = 104, y = 330;
  ctx.translate(W / 2, y); ctx.scale(p, p);
  ctx.fillStyle = GOLD; rrect(-bw / 2, -bh / 2, bw, bh, 14); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(l.text, 0, 4); ctx.restore();
}
function doc(sc, t) {
  const d = sc.doc; if (!d || t < d.t - .1) return;
  const a = seg(t, d.t - .1, d.t + .15), wr = eio(seg(t, d.t, d.t + 1.1)), y = 820;
  ctx.save(); ctx.globalAlpha = a;
  ctx.translate(W / 2, y); ctx.rotate(-.04);
  ctx.fillStyle = 'rgba(240,226,196,.96)'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; rrect(-430, -120, 860, 240, 8); ctx.fill(); ctx.shadowBlur = 0;
  ctx.font = 'italic 128px Corm'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(d.text).width;
  ctx.save(); ctx.beginPath(); ctx.rect(-tw / 2 - 10, -110, (tw + 20) * wr, 220); ctx.clip();
  ctx.fillStyle = '#3b2412'; ctx.fillText(d.text, -tw / 2, 4); ctx.restore();
  // red circle around "pieds" / "pouces" once written, on "francesa"
  const ev = TL.events.find(e => e.type === 'stamp' && e.t > d.t && e.t < sc.t1);
  if (ev && t > ev.t) {
    const u = eo(seg(t, ev.t, ev.t + .4));
    ctx.strokeStyle = RED; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.ellipse(0, 4, tw / 2 + 50, 105, -.03, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2.1 * u); ctx.stroke();
    ctx.save(); ctx.translate(0, 190); ctx.rotate(-.02); ctx.globalAlpha = u; ctx.textAlign = 'center'; strokeText('MEDIDA FRANCESA', 0, 0, 70, GOLD, .16); ctx.restore();
  }
  ctx.restore();
}
function ruler(sc, t) {
  const r = sc.ruler; if (!r || t < r.t || !XF) return;
  const FOOT = .958, HEAD = .226, RX = .79;
  const grow = eio(seg(t, r.t, r.hitT)), val = r.to * grow;
  const [x, yF] = XF(RX, FOOT), [, yH] = XF(RX, HEAD), yNow = lerp(yF, yH, grow);
  const a = seg(t, r.t, r.t + .2) * (1 - seg(t, sc.t1 - .25, sc.t1));
  ctx.save(); ctx.globalAlpha = a;
  // tape
  ctx.fillStyle = 'rgba(255,201,74,.92)'; ctx.fillRect(x - 22, yNow, 44, yF - yNow);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(x - 22, yNow, 44, yF - yNow);
  const per = (yF - yH) / 16.9;   // a tick every 10 cm
  for (let k = 0; k * per <= yF - yNow; k++) { const yy = yF - k * per; ctx.beginPath(); ctx.moveTo(x - 22, yy); ctx.lineTo(x + (k % 5 ? -4 : 10), yy); ctx.stroke(); }
  // head line + value
  ctx.setLineDash([]); ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(XF(.3, 0)[0], yNow); ctx.lineTo(x + 22, yNow); ctx.stroke();
  const hit = t >= r.hitT, pop = hit ? back(seg(t, r.hitT, r.hitT + .3), 2.4) : 1;
  ctx.save(); ctx.translate(x - 40, yNow - 70); ctx.scale(pop, pop); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  strokeText(val.toFixed(2).replace('.', ',') + ' M', 0, 0, hit ? 110 : 90, hit ? GOLD : '#fff', .14); ctx.restore();
  // the average Frenchman, dashed, just under his head
  if (t >= r.avgT) {
    const u = eo(seg(t, r.avgT, r.avgT + .4)), yA = lerp(yF, yH, r.avg / r.to);
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 5; ctx.setLineDash([22, 14]);
    ctx.beginPath(); ctx.moveTo(lerp(x + 22, XF(.08, 0)[0], u), yA); ctx.lineTo(x + 22, yA); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = a * u; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    strokeText('FRANCÊS MÉDIO 1,65', XF(.06, 0)[0], yA + 52, 50, '#fff', .16);
  }
  ctx.restore();
}

// ---------- CTA (follow card, from the series player) ----------
function cta(t) {
  const c = TL.cta; if (!c || t < c.t0 || t > c.t1 + .4) return;
  const inn = back(seg(t, c.t0, c.t0 + .35), 1.8), out = 1 - seg(t, c.t1, c.t1 + .3), tap = c.t0 + (c.t1 - c.t0) * .55;
  const tapped = t >= tap, cw = 880, ch = 150, x = (W - cw) / 2, y = 900;
  ctx.save(); ctx.globalAlpha = out; ctx.translate(W / 2, y + ch / 2); ctx.scale(inn, inn); ctx.translate(-W / 2, -(y + ch / 2));
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fff'; rrect(x, y, cw, ch, 40); ctx.fill(); ctx.shadowBlur = 0;
  const ax = x + 80, ay = y + ch / 2;
  ctx.save(); ctx.beginPath(); ctx.arc(ax, ay, 52, 0, 7); ctx.clip(); ctx.drawImage(IMG.avatar, ax - 52, ay - 52, 104, 104); ctx.restore();
  ctx.lineWidth = 5; ctx.strokeStyle = GOLD; ctx.beginPath(); ctx.arc(ax, ay, 54, 0, 7); ctx.stroke();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#111'; ctx.font = 'bold 40px sans-serif';
  ctx.fillText(c.handle, x + 152, y + 56);
  ctx.fillStyle = '#666'; ctx.font = '31px sans-serif'; ctx.fillText(c.sub, x + 152, y + 102);
  const bw = 200, bh = 76, bx = x + cw - bw - 28, by = y + (ch - bh) / 2, press = tapped ? 1 - .08 * Math.exp(-(t - tap) * 10) : 1;
  ctx.save(); ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(press, press);
  ctx.fillStyle = tapped ? '#e9e9ec' : '#4f5bf7'; rrect(-bw / 2, -bh / 2, bw, bh, 20); ctx.fill();
  ctx.fillStyle = tapped ? '#111' : '#fff'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(tapped ? 'Seguindo ✓' : 'Seguir', 0, 3);
  ctx.restore();
  const fu = seg(t, c.t0 + .3, tap), fx = lerp(W + 80, bx + bw * .62, eo(fu)), fy = lerp(y + 360, by + bh * .7, eo(fu));
  ctx.font = '96px "Noto Color Emoji"'; ctx.textAlign = 'center'; ctx.fillText('👆', fx, fy + 70);
  if (tapped && t < tap + .5) { const u = seg(t, tap, tap + .5); ctx.strokeStyle = `rgba(79,91,247,${1 - u})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(bx + bw * .62, by + bh / 2, 20 + u * 90, 0, 7); ctx.stroke(); }
  ctx.restore();
}

// ---------- end card ----------
function endCard(t) {
  const e = TL.end; if (t < e.t0) return;
  const a = seg(t, e.t0, e.t0 + .35);
  ctx.fillStyle = `rgba(6,8,6,${.5 * a})`; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const p = back(seg(t, e.t0, e.t0 + .3), 2);
  ctx.translate(W / 2, 700); ctx.scale(p, p);
  e.lines.forEach((ln, i) => strokeText(ln, 0, i * 150, 140, i === e.lines.length - 1 ? '#5CFF7A' : '#fff', .14));
  ctx.restore();
  const pa = seg(t, e.t0 + .4, e.t0 + .7), pul = 1 + .05 * Math.sin(t * 7);
  ctx.save(); ctx.globalAlpha = pa; ctx.translate(W / 2, 1200); ctx.scale(pul, pul);
  ctx.font = '66px Anton'; const tw = ctx.measureText('💬 ' + e.pill).width + 90;
  ctx.fillStyle = GOLD; rrect(-tw / 2, -62, tw, 124, 62); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💬 ' + e.pill, 0, 6);
  ctx.restore();
}

// ---------- frame ----------
window.render = async t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const i = Math.max(0, TL.scenes.findLastIndex(s => t >= s.t0)), sc = TL.scenes[i];
  const [sx, sy] = shake(t);
  ctx.save(); ctx.translate(sx, sy);
  if (sc.blur) ctx.filter = `blur(${sc.blur}px) brightness(.7)`;
  drawCover(await sceneImage(sc, t), sc, t, i === 0);
  ctx.filter = 'none';
  applyFx(sc, t);
  ruler(sc, t);
  ctx.restore();
  grade(t);
  doc(sc, t); label(sc, t);
  hook(t); stamp(t); captions(t); yearBadge(t); cta(t); endCard(t);
};
window.TEXTS = () => [];
init().catch(e => { console.error(e.message); throw e; });
})();
