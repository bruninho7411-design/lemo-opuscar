// "E se seu pai guardasse R$10 toda noite enquanto você dormia?" (vertical 1080×1920)
// Each night is a Wan 2.7 clip of a GPT Image keyframe (ai/, see CREDITS), drawn frame by frame with a slow push and crossfades;
// the title, the counters, the father's words and the end card are drawn here, in the reference's quiet editorial type:
// Cormorant (serif) for the title, numbers and quotes, Inter in spaced capitals for the labels.
import { build, SCENES, XF, PER } from './story.js';

const c = document.getElementById('c'), g = c.getContext('2d'), W = 1080, H = 1920;
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
for (const l of LINES) if (DURS[l.id] == null) DURS[l.id] = .5 + l.text.length * .06;
const { VO, S, END, DUR } = build(DURS);
const Q = new URLSearchParams(location.search), CAPA = Q.get('capa') === '1';
const GOLD = '#f2c97a', CREAM = '#fff8ec';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eo = x => 1 - Math.pow(1 - x, 3), eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const brl = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// —— the clips: 30 fps stills (ai/frames.sh → ai/f/<clip>/NNNN.jpg, 1086×1920); no clip yet → its keyframe ——
const AIN = (await J('ai/f/index.json')) || {}, FC = new Map();
function still(src) {
  if (!FC.has(src)) { FC.set(src, new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; })); if (FC.size > 48) FC.delete(FC.keys().next().value); }
  return FC.get(src);
}
const SPEED = .78;   // a 3 s clip carries a ~3.9 s night
const clipSrc = (clip, ct, kf) => AIN[clip] ? `ai/f/${clip}/${String(clamp(Math.round(ct * 30), 0, AIN[clip] - 1) + 1).padStart(4, '0')}.jpg` : `ai/${kf}`;
function draw(img, z, a = 1) {   // cover the frame, push in around a point a little above the middle
  const w = 1086 * z, h = 1920 * z, cx = 540, cy = 900;
  g.globalAlpha = a; g.drawImage(img, cx - w * (cx / W), cy - h * (cy / H), w, h); g.globalAlpha = 1;
}
const sceneAt = t => S.findIndex(s => t >= s.t0 && t < s.t1);

// —— type ——
function txt(s, x, y, font, fill, { align = 'center', ls = 0, alpha = 1, shadow = 18 } = {}) {
  g.save(); g.font = font; g.textAlign = align; g.textBaseline = 'middle'; g.letterSpacing = ls + 'px'; g.globalAlpha = alpha;
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = shadow; g.shadowOffsetY = 2; g.fillStyle = fill; g.fillText(s, x, y); g.restore();
}
function runs(parts, x, y, size, alpha = 1) {   // one centred line made of [text, colour, font?] runs
  const F = p => p[2] ? `${p[2]} ${Math.round(size * .86)}px Playfair` : `500 ${size}px Cormorant`;
  const ws = parts.map(p => { g.save(); g.font = F(p); const w = g.measureText(p[0]).width; g.restore(); return w; }), tw = ws.reduce((a, b) => a + b, 0);
  let cx = x - tw / 2; parts.forEach((p, i) => { txt(p[0], cx, y, F(p), p[1], { align: 'left', alpha }); cx += ws[i]; });
}
function title(t) {
  const a = CAPA ? 1 : seg(t, .05, .45) * (1 - seg(t, END - .2, END + .3));
  if (a <= 0) return;
  runs([['E se seu pai guardasse', CREAM]], 540, 236, 90, a);
  runs([['R$10', GOLD, 500], [' toda noite', CREAM]], 540, 334, 90, a);
  runs([['enquanto você dormia?', CREAM]], 540, 432, 90, a);
}
function counters(t) {
  if (t >= END + .4) return;
  const i = Math.max(0, sceneAt(t) < 0 ? S.length - 1 : sceneAt(t)), s = S[i], prev = i ? S[i - 1].nights : 0;
  const k = eo(seg(t, s.t0, s.t0 + 1.2)), n = Math.round(prev + (s.nights - prev) * k), a = seg(t, .3, .7) * (1 - seg(t, END, END + .4));
  const x = 64, y = 1010;
  txt('NOITES QUE ELE GUARDOU', x, y, '600 27px Inter', CREAM, { align: 'left', ls: 5, alpha: .85 * a });
  txt(brl(n), x - 4, y + 72, '500 92px Playfair', CREAM, { align: 'left', alpha: a });
  txt(s.age === 0 ? 'VOCÊ ACABOU DE NASCER' : `VOCÊ TEM ${s.age} ANOS`, x, y + 142, '600 27px Inter', CREAM, { align: 'left', ls: 5, alpha: .85 * a });
  txt('NO POTE', x, y + 206, '600 22px Inter', GOLD, { align: 'left', ls: 5, alpha: .9 * a });
  txt('R$ ' + brl(n * PER), x - 2, y + 256, '500 58px Playfair', GOLD, { align: 'left', alpha: a });
}
function wrap(s, maxW, font) {
  g.save(); g.font = font; const out = []; let cur = '';
  for (const w of s.split(' ')) { const c2 = cur ? cur + ' ' + w : w; if (g.measureText(c2).width > maxW && cur) { out.push(cur); cur = w; } else cur = c2; }
  if (cur) out.push(cur); g.restore(); return out;
}
function quote(t) {   // the father's words (and the son's), as he says them
  for (const [id, t0] of Object.entries(VO)) {
    const ids = Object.keys(VO), nx = ids.indexOf(id) + 1, tEnd = Math.min(t0 + DURS[id] + .7, nx < ids.length ? VO[ids[nx]] - .05 : 1e9);
    if (t < t0 - .05 || t > tEnd + .25) continue;
    const a = seg(t, t0 - .05, t0 + .2) * (1 - seg(t, tEnd, tEnd + .25)), font = 'italic 500 60px Cormorant';
    const L = wrap(`“${LINE[id].sub}”`, 900, font), y0 = 1640 - (L.length - 1) * 36;
    L.forEach((l, k) => txt(l, 540, y0 + k * 72, font, LINE[id].who === 'y' ? '#dbe9ff' : CREAM, { alpha: a, shadow: 22 }));
  }
}
function heart(x, y, r, col) {
  g.save(); g.fillStyle = col; g.beginPath(); g.moveTo(x, y + r * .9);
  g.bezierCurveTo(x - r * 1.6, y - r * .1, x - r * .7, y - r * 1.25, x, y - r * .45);
  g.bezierCurveTo(x + r * .7, y - r * 1.25, x + r * 1.6, y - r * .1, x, y + r * .9); g.fill(); g.restore();
}
function endCard(t) {
  if (t < END) return;
  const u = t - END, last = S[S.length - 1];
  g.fillStyle = `rgba(8,6,10,${.72 * eo(seg(u, 0, .7))})`; g.fillRect(0, 0, W, H);
  const a1 = eo(seg(u, .2, .7)), pop = 1 + .12 * (1 - eo(seg(u, .3, .8)));
  txt(`18 ANOS · ${brl(last.nights)} NOITES`, 540, 600, '600 32px Inter', CREAM, { ls: 6, alpha: .9 * a1 });
  g.save(); g.translate(540, 760); g.scale(pop, pop); txt('R$ ' + brl(last.nights * PER), 0, 0, '500 150px Playfair', GOLD, { alpha: a1, shadow: 30 }); g.restore();
  txt('em notas de R$10, uma por noite.', 540, 900, 'italic 500 54px Cormorant', CREAM, { alpha: a1 });
  const a2 = eo(seg(u, 1.4, 1.9));
  runs([['E se ele tivesse ', CREAM], ['investido', GOLD], ['?', CREAM]], 540, 1130, 82, a2);
  const a3 = eo(seg(u, 2.0, 2.5));
  if (a3 > 0) { g.save(); g.globalAlpha = a3; g.fillStyle = 'rgba(255,248,236,.14)'; g.strokeStyle = 'rgba(255,248,236,.6)'; g.lineWidth = 2; g.beginPath(); g.roundRect(290, 1212, 500, 80, 40); g.fill(); g.stroke(); g.restore();
    txt('PARTE 2 · SEGUE PRA VER', 540, 1253, '600 30px Inter', CREAM, { ls: 4, alpha: a3, shadow: 0 }); }
  const a4 = eo(seg(u, 2.8, 3.3));
  txt('Manda pro seu pai', 520, 1500, 'italic 500 66px Cormorant', CREAM, { alpha: a4 });
  if (a4 > 0) { g.globalAlpha = a4; heart(790, 1500, 26 * (1 + .15 * Math.sin(u * 6)), '#ff6b81'); g.globalAlpha = 1; }
}

async function render(t) {
  const i = sceneAt(t), cur = i >= 0 ? S[i] : S[S.length - 1], u = i >= 0 ? t - cur.t0 : cur.t1 - cur.t0 + (t - END);
  const img = await still(clipSrc(cur.clip, u * SPEED, cur.kf));
  const pi = i > 0 && u < XF ? S[i - 1] : null, pimg = pi ? await still(clipSrc(pi.clip, (pi.t1 - pi.t0) * SPEED, pi.kf)) : null;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (pimg) draw(pimg, 1 + (pi.t1 - pi.t0) * .012);
  draw(img, 1 + u * .012, pimg ? eio(u / XF) : 1);
  let gr = g.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(0,0,0,.62)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 760);   // the title sits on the dark
  gr = g.createLinearGradient(0, 1380, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = gr; g.fillRect(0, 1380, W, H - 1380);
  if (!CAPA) { gr = g.createLinearGradient(0, 0, 520, 0); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 900, 520, 420); }   // and the counters
  title(t);
  if (CAPA) return;
  counters(t);
  quote(t);
  endCard(t);
}

function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of Object.entries(VO)) add('vo', t0, { id, who: LINE[id].who, d: DURS[id] });
  for (const s of S) { add('drop', s.t0 + .9); if (s.key !== 's1') add('swish', s.t0 - .15); }
  add('coins', S[3].t0 + .3);
  add('chime', END + .25); add('chime', END + 1.45, { v: .6 }); add('pop', END + 2.0); add('pop', END + 2.8, { v: .7 });
  const subs = Object.entries(VO).map(([id, t0]) => ({ t0, t1: +(t0 + DURS[id] + .6).toFixed(3), text: LINE[id].sub }));
  for (const s of subs) add('sub', s.t0, { t1: s.t1, text: s.text });
  return ev.sort((a, b) => a.t - b.t);
}

window.render = render; window.DUR = DUR; window.EV = events(); window.VO = VO;
window.TEXTS = () => [];
for (const f of ['500 60px Cormorant', 'italic 500 60px Cormorant', '600 30px Inter', '500 60px Playfair']) await document.fonts.load(f);
await render(parseFloat(Q.get('t') ?? '1'));
window.READY = true;
