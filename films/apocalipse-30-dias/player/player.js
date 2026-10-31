// Episode player for "30 dias no apocalipse zumbi" (lemo-opuscar page contract: READY, DUR, render(t)).
// Reads /films/apocalipse-30-dias/<ep>/timeline.json (written by tools/build.py). ?ep=ep01
(() => {
const ROOT = '/films/apocalipse-30-dias/';
const EP = new URLSearchParams(location.search).get('ep') || 'ep01';
const W = 1080, H = 1920;
const YEL = '#FFD23F', RED = '#E5484D';
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; document.body.appendChild(cv);
const ctx = cv.getContext('2d');

// ---------- math ----------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eio = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const back = (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const vnoise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };

// ---------- loading ----------
let TL = null; const IMG = {}; const FR = new Map();
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('image ' + src)); i.src = src; });
async function frameImg(dir, k) {
  const key = dir + k; if (FR.has(key)) return FR.get(key);
  const im = await loadImg(dir + String(k + 1).padStart(4, '0') + '.jpg'); FR.set(key, im);
  if (FR.size > 90) FR.delete(FR.keys().next().value);
  return im;
}
async function init() {
  TL = await (await fetch(ROOT + EP + '/timeline.json')).json();
  for (const [fam, file] of [['Lucky', 'LuckiestGuy-Regular.ttf'], ['Lilita', 'LilitaOne-Regular.ttf']]) {
    const f = new FontFace(fam, `url(${ROOT}player/fonts/${file})`); await f.load(); document.fonts.add(f);
  }
  await Promise.all(TL.scenes.map(async s => { if (s.img && !IMG[s.img]) IMG[s.img] = await loadImg(s.img); }));
  if (TL.avatar) IMG.avatar = await loadImg(TL.avatar);
  window.DUR = TL.dur; window.READY = true;
}

// ---------- camera ----------
function camera(sc, t, first) {
  const d = Math.max(.01, sc.t1 - sc.t0), u = seg(t, sc.t0, sc.t1), e = eio(u);
  let s = 1, px = null, py = null, r = 0;
  switch (sc.motion) {
    case 'pushin': s = lerp(1.0, 1.13, e); break;
    case 'slowpush': s = lerp(1.0, 1.07, e); break;
    case 'pullback': s = lerp(1.16, 1.0, e); break;
    case 'pandown': s = 1.2; py = lerp(0, 1, e); break;
    case 'panup': s = 1.2; py = lerp(1, 0, e); break;
    case 'panright': s = 1.18; px = lerp(0, 1, e); break;
    case 'panleft': s = 1.18; px = lerp(1, 0, e); break;
    case 'zoomtv': s = lerp(1.0, 1.32, e); break;
    case 'punch': s = lerp(1.32, 1.1, eo(seg(t, sc.t0, sc.t0 + .35))) + .05 * e; break;
    case 'peephole': s = lerp(1.03, 1.16, e); r = Math.sin(t * 1.1) * .012; break;
    case 'video': s = lerp(1.0, 1.05, e); break;
    case 'end': s = 1.14; break;
    default: s = lerp(1.0, 1.08, e);
  }
  if (!first && sc.motion !== 'punch') s *= 1 + .06 * (1 - eo(seg(t, sc.t0, sc.t0 + .32)));   // cut punch
  if (first) s *= 1 + .16 * (1 - eo(seg(t, 0, .45)));   // frame-0 slam
  return { s, px, py, r };
}
function drawCover(im, sc, t, first) {
  const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
  const c = camera(sc, t, first), base = Math.max(W / iw, H / ih), k = base * c.s;
  const vw = W / k, vh = H / k, f = sc.focus || [.5, .5];
  let cx = c.px != null ? lerp(vw / 2, iw - vw / 2, c.px) : f[0] * iw;
  let cy = c.py != null ? lerp(vh / 2, ih - vh / 2, c.py) : f[1] * ih;
  cx = clamp(cx, vw / 2, iw - vw / 2); cy = clamp(cy, vh / 2, ih - vh / 2);
  ctx.save(); ctx.translate(W / 2, H / 2); if (c.r) ctx.rotate(c.r); ctx.scale(k, k); ctx.translate(-cx, -cy);
  ctx.drawImage(im, 0, 0); ctx.restore();
}
async function sceneImage(sc, t) {
  if (sc.frames) {
    const n = sc.frames.n, cd = n / sc.frames.fps, sd = sc.t1 - sc.t0, rate = cd < sd ? cd / sd : 1, k = clamp(Math.floor((t - sc.t0) * sc.frames.fps * rate), 0, n - 1);
    return frameImg(sc.frames.dir, k);
  }
  return IMG[sc.img];
}

// ---------- shake ----------
function shake(t, sc) {
  let a = 0;
  const fx = sc.fx || [];
  if (fx.includes('shake')) a += 26 * Math.exp(-(t - sc.t0) * 4);
  if (fx.includes('shake_soft')) a += 3;
  for (const ev of TL.events) if ((ev.type === 'knock' || ev.type === 'impact' || ev.type === 'bang') && t >= ev.t && t < ev.t + .5)
    a += (ev.type === 'knock' ? 12 : 30) * Math.exp(-(t - ev.t) * 12);
  return [vnoise(t * 31) * a, vnoise(t * 29 + 50) * a];
}

// ---------- fx ----------
function vignette(str) {
  const g = ctx.createRadialGradient(W / 2, H * .48, H * .22, W / 2, H * .5, H * .78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${str})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function dust(t, n = 46, col = '235,230,215') {
  for (let i = 0; i < n; i++) {
    const sp = .3 + hash(i) * .7, x = (hash(i + 9) * W + t * 22 * sp + Math.sin(t * .7 + i) * 30) % W;
    const y = (hash(i + 3) * H - t * 35 * sp + H * 4) % H, r = 1.5 + hash(i + 5) * 3.5;
    ctx.fillStyle = `rgba(${col},${.18 + .25 * hash(i + 7)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
}
function rain(t) {
  ctx.strokeStyle = 'rgba(200,215,230,.28)'; ctx.lineWidth = 2.5;
  for (let i = 0; i < 140; i++) {
    const x = (hash(i) * W * 1.2 + t * 260) % (W * 1.2) - 100, y = (hash(i + 40) * H + t * 2100 * (.8 + hash(i + 2) * .4)) % H;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 14, y - 70); ctx.stroke();
  }
}
function applyFx(sc, t) {
  const fx = sc.fx || [];
  if (fx.includes('siren')) {
    const ph = Math.floor(t * 2.4) % 2, p = .5 + .5 * Math.sin(t * 2.4 * Math.PI * 2);
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .55 * p;
    ctx.fillStyle = ph ? '#ff2a2a' : '#2a6bff'; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  if (fx.includes('flicker')) {
    const f = Math.max(0, vnoise(t * 9)) * .35 + (hash(Math.floor(t * 12)) > .93 ? .3 : 0);
    ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, W, H);
  }
  if (fx.includes('dust')) dust(t);
  if (fx.includes('ash')) dust(t, 70, '120,120,120');
  if (fx.includes('rain')) rain(t);
  if (fx.includes('red')) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,60,60,${.25 + .15 * Math.sin(t * 6)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  vignette(fx.includes('dark') ? .82 : .5);
  for (const ev of TL.events) if (ev.type === 'blackout' && t >= ev.t) {   // the city goes dark: a hard dip, then a darker scene
    const u = t - ev.t; ctx.fillStyle = `rgba(0,0,0,${u < .12 ? .95 : clamp(.95 - (u - .12) * 1.6, .25, .95)})`; ctx.fillRect(0, 0, W, H);
  }
  for (const ev of TL.events) if (ev.type === 'flash' && t >= ev.t && t < ev.t + .25) {
    ctx.fillStyle = `rgba(255,255,255,${.85 * (1 - (t - ev.t) / .25)})`; ctx.fillRect(0, 0, W, H);
  }
}

// ---------- text helpers ----------
function strokeText(txt, x, y, size, fill = '#fff', sw = .15, font = 'Lucky') {
  ctx.font = `${size}px ${font}`; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  ctx.lineWidth = size * sw; ctx.strokeStyle = '#111'; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ---------- captions ----------
function captions(t) {
  if (t < TL.hook.t1 || t >= TL.end.t0) return;
  const c = TL.caps.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const pop = back(seg(t, c.t0, c.t0 + .12), 2.2), size = 94;
  ctx.save(); ctx.font = `${size}px Lucky`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const sp = size * .36, ws = c.words.map(w => ctx.measureText(w.w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  const fit = Math.min(1, 940 / tot), y = TL.capY || 1290;
  ctx.translate(W / 2, y); ctx.scale(fit * (.85 + .15 * pop), fit * (.85 + .15 * pop));
  let x = -tot / 2;
  c.words.forEach((w, i) => {
    const on = t >= w.t0 && t < (c.words[i + 1]?.t0 ?? c.t1), sc = on ? 1.06 : 1;
    ctx.save(); ctx.translate(x + ws[i] / 2, 0); ctx.scale(sc, sc); ctx.textAlign = 'center';
    strokeText(w.w, 0, 6, size, on ? YEL : '#fff', .17); ctx.restore(); x += ws[i] + sp;
  });
  ctx.restore();
}

// ---------- hook ----------
function hook(t) {
  const h = TL.hook; if (t >= h.dayAt + .2) return;
  const fade = 1 - seg(t, h.dayAt - .02, h.dayAt + .14);
  ctx.save(); ctx.globalAlpha = fade; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // the question builds word by word, big, in the upper third
  const size = 100; ctx.font = `${size}px Lucky`;
  if (!h.lines) {   // wrap once with the real font metrics
    h.lines = []; let cur = [];
    for (const w of h.words) {
      const test = [...cur, w].reduce((a, x) => a + ctx.measureText(x.w).width + size * .28, 0);
      if (cur.length && test > 1010) { h.lines.push(cur); cur = []; }
      cur.push(w);
    }
    if (cur.length) h.lines.push(cur);
  }
  let y = 1240 - (h.lines.length - 1) * size * .56;
  for (const line of h.lines) {
    ctx.font = `${size}px Lucky`;
    const sp = size * .3, shown = line, full = shown.reduce((a, w) => a + ctx.measureText(w.w).width, 0) + sp * Math.max(0, shown.length - 1);
    let x = W / 2 - full / 2; ctx.textAlign = 'left';
    for (const w of line) {
      const ww = ctx.measureText(w.w).width + sp;
      { const wi = h.words.indexOf(w), p = back(seg(t, wi * .025, wi * .025 + .16), 2.5);
        ctx.save(); ctx.translate(x + ctx.measureText(w.w).width / 2, y); ctx.scale(p, p); ctx.textAlign = 'center';
        strokeText(w.w, 0, 0, size, w.hi ? YEL : '#fff', .16); ctx.restore();
      }
      x += ww;
    }
    y += size * 1.12;
  }
  ctx.restore();
}
// "DIA X" stamp: slams in the middle, then flies into the HUD badge
function badgeRect() { return { x: 54, y: 150, w: 270, h: 104 }; }
function dayStamp(t) {
  const h = TL.hook, t0 = h.dayAt; if (t < t0) return false;
  const b = badgeRect(), fly = eio(seg(t, t0 + .5, t0 + .82));
  if (fly >= 1) return false;
  const slam = seg(t, t0, t0 + .18), s0 = lerp(2.6, 1, eo(slam));
  const cx = lerp(W / 2, b.x + b.w / 2, fly), cy = lerp(H * .44, b.y + b.h / 2, fly), s = lerp(s0 * 2.2, 1, fly);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.rotate(lerp(-.06, 0, fly));
  drawBadge(-b.w / 2, -b.h / 2, b.w, b.h, 1);
  ctx.restore(); return true;
}
function drawBadge(x, y, w, h, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(15,15,15,.82)'; rrect(x, y, w, h, 22); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = YEL; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = '70px Lucky'; ctx.fillStyle = YEL; const dt = 'DIA ' + TL.day; ctx.fillText(dt, x + 24, y + h / 2 + 6);
  const dw = ctx.measureText(dt).width; ctx.font = '38px Lucky'; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillText('/30', x + 30 + dw, y + h / 2 + 12);
  ctx.restore();
}

// ---------- HUD ----------
const STATS = [['vida', '❤', '#E5484D'], ['comida', '🍞', '#F5A524'], ['agua', '💧', '#3DA5F4']];
function statAt(name, t) {
  let prev = TL.scenes[0].hud[name], cur = prev, tc = 0;
  for (const s of TL.scenes) { const ht = s.hud_t ?? s.t0; if (ht > t) break; if (s.hud[name] !== cur) { prev = cur; cur = s.hud[name]; tc = ht; } }
  const u = eo(seg(t, tc + .35, tc + 1.0));
  return { v: lerp(prev, cur, u), drop: cur < prev ? prev - cur : 0, tc };
}
function hud(t) {
  if (t < TL.hook.dayAt + .82) return;
  const a = seg(t, TL.hook.dayAt + .8, TL.hook.dayAt + 1.0);
  const b = badgeRect(); drawBadge(b.x, b.y, b.w, b.h, a);
  ctx.save(); ctx.globalAlpha = a;
  const x0 = 640, w = 270, h = 22;
  STATS.forEach(([name, icon, col], i) => {
    const y = 160 + i * 40, st = statAt(name, t), flash = st.drop && t < st.tc + 1.6 ? .5 + .5 * Math.sin(t * 22) : 0;
    ctx.font = '30px "Noto Color Emoji"'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(icon, x0 - 30, y + h / 2 + 2);
    ctx.fillStyle = 'rgba(15,15,15,.75)'; rrect(x0, y, w + 8, h + 8, 12); ctx.fill();
    ctx.fillStyle = col; rrect(x0 + 4, y + 4, Math.max(8, w * st.v / 100), h, 9); ctx.fill();
    if (flash) { ctx.fillStyle = `rgba(255,255,255,${flash * .6})`; rrect(x0 + 4, y + 4, Math.max(8, w * st.v / 100), h, 9); ctx.fill(); }
    if (st.drop && t > st.tc + .2 && t < st.tc + 1.9) {   // floating "-45"
      const u = seg(t, st.tc + .2, st.tc + 1.9);
      ctx.save(); ctx.globalAlpha = a * (1 - u); ctx.textAlign = 'left'; strokeText('-' + Math.round(st.drop), x0 + w + 22, y + 14 - u * 30, 40, RED, .18); ctx.restore();
    }
  });
  ctx.restore();
}

// ---------- CTA: follow card ----------
function cta(t) {
  const c = TL.cta; if (!c || t < c.t0 || t > c.t1 + .4) return;
  const inn = back(seg(t, c.t0, c.t0 + .35), 1.8), out = 1 - seg(t, c.t1, c.t1 + .3), tap = c.t0 + (c.t1 - c.t0) * .55;
  const tapped = t >= tap, cw = 860, ch = 150, x = (W - cw) / 2, y = 930;
  ctx.save(); ctx.globalAlpha = out; ctx.translate(W / 2, y + ch / 2); ctx.scale(inn, inn); ctx.translate(-W / 2, -(y + ch / 2));
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fff'; rrect(x, y, cw, ch, 40); ctx.fill(); ctx.shadowBlur = 0;
  // avatar
  const ax = x + 80, ay = y + ch / 2;
  ctx.save(); ctx.beginPath(); ctx.arc(ax, ay, 52, 0, 7); ctx.clip();
  if (IMG.avatar) ctx.drawImage(IMG.avatar, ax - 52, ay - 52, 104, 104); else { ctx.fillStyle = '#1d2333'; ctx.fillRect(ax - 52, ay - 52, 104, 104); }
  ctx.restore(); ctx.lineWidth = 5; ctx.strokeStyle = YEL; ctx.beginPath(); ctx.arc(ax, ay, 54, 0, 7); ctx.stroke();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#111'; ctx.font = '40px Lilita';
  ctx.fillText('o_que_aconteceria_se', x + 152, y + 56);
  ctx.fillStyle = '#666'; ctx.font = '31px Lilita'; ctx.fillText(`faltam ${c.left} dias`, x + 152, y + 102);
  // button
  const bw = 210, bh = 76, bx = x + cw - bw - 28, by = y + (ch - bh) / 2, press = tapped ? 1 - .08 * Math.exp(-(t - tap) * 10) : 1;
  ctx.save(); ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(press, press);
  ctx.fillStyle = tapped ? '#e9e9ec' : '#4f5bf7'; rrect(-bw / 2, -bh / 2, bw, bh, 20); ctx.fill();
  ctx.fillStyle = tapped ? '#111' : '#fff'; ctx.font = '36px Lilita'; ctx.textAlign = 'center'; ctx.fillText(tapped ? 'Seguindo ✓' : 'Seguir', 0, 3);
  ctx.restore();
  // finger
  const fu = seg(t, c.t0 + .3, tap), fx = lerp(W + 80, bx + bw * .62, eo(fu)), fy = lerp(y + 360, by + bh * .7, eo(fu)) + (tapped ? 0 : 0);
  ctx.font = '96px "Noto Color Emoji"'; ctx.textAlign = 'center'; ctx.fillText('👆', fx, fy + 70);
  if (tapped && t < tap + .5) { const u = seg(t, tap, tap + .5); ctx.strokeStyle = `rgba(79,91,247,${1 - u})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(bx + bw * .62, by + bh / 2, 20 + u * 90, 0, 7); ctx.stroke(); }
  ctx.restore();
}

// ---------- end card ----------
function endCard(t) {
  const e = TL.end; if (t < e.t0) return;
  const a = seg(t, e.t0, e.t0 + .35);
  ctx.fillStyle = `rgba(8,10,14,${.55 * a})`; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const p = back(seg(t, e.t0, e.t0 + .3), 2), lines = e.lines;
  ctx.translate(W / 2, 760); ctx.scale(p, p);
  lines.forEach((ln, i) => strokeText(ln, 0, i * 118, 108, i === lines.length - 1 ? YEL : '#fff', .16));
  ctx.restore();
  // comment pill
  const pa = seg(t, e.t0 + .4, e.t0 + .7), pul = 1 + .05 * Math.sin(t * 7);
  ctx.save(); ctx.globalAlpha = pa; ctx.translate(W / 2, 1180); ctx.scale(pul, pul);
  ctx.fillStyle = YEL; rrect(-250, -58, 500, 116, 58); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#111'; ctx.stroke();
  ctx.font = '62px Lucky'; ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💬 COMENTA', 0, 6);
  ctx.restore();
  const na = seg(t, e.t0 + .8, e.t0 + 1.1);
  ctx.save(); ctx.globalAlpha = na; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  strokeText(e.next, W / 2, 1340, 54, '#fff', .18); ctx.restore();
}

// ---------- frame ----------
window.render = async t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const i = Math.max(0, TL.scenes.findLastIndex(s => t >= s.t0)), sc = TL.scenes[i];
  const [sx, sy] = shake(t, sc);
  ctx.save(); ctx.translate(sx, sy);
  if (sc.trans === 'fade' && i > 0 && t < sc.t0 + .35) {
    const pv = TL.scenes[i - 1]; drawCover(await sceneImage(pv, Math.min(t, pv.t1 - .001)), pv, t, i - 1 === 0);
    ctx.globalAlpha = seg(t, sc.t0, sc.t0 + .35);
  }
  if (sc.blur) ctx.filter = `blur(${sc.blur}px)`;
  drawCover(await sceneImage(sc, t), sc, t, i === 0);
  ctx.filter = 'none'; ctx.globalAlpha = 1;
  applyFx(sc, t);
  ctx.restore();
  hook(t); captions(t); cta(t); endCard(t); hud(t); dayStamp(t);
};
window.TEXTS = () => [];
init().catch(e => { console.error(e.message); throw e; });
})();
