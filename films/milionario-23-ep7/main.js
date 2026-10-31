// POV: você ficou milionário aos 23 — EP 7 · O caixa (vertical 1080×1920)
// The character shots are 2D animation from Wan 2.7 (ai/v_*.mp4, lip-synced to the VoiceStudio lines, from GPT Image keyframes in
// the EP 1 designs; see CREDITS), drawn frame by frame under a code camera; until a clip exists its keyframe is drawn as a
// still (the animatic). Inserts, law cards, graphics and captions are drawn by the toon engine; the shop front and the office
// are the EP 5 plates (bg/*.png) in three boiled drawings cycled at 12 fps.
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset, getM, S } from './toon.js';
import { coin, GOLD, GOLD2, GOLDS } from './chars.js';
import { q, build, EP } from './story.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
for (const l of LINES) if (DURS[l.id] == null) DURS[l.id] = .5 + l.text.length * .062;
const { VO, T, DUR, SHOTS, WIPES, CUES } = build(DURS);
const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
const Q = new URLSearchParams(location.search), CAPA = Q.get('capa') === '1';

// —— plates: 1520×2688 illustrations drawn into the 1080×1920 world ——
const IMG = {};
await Promise.all(['office', 'front'].map(async n => {
  IMG[n] = await Promise.all([0, 1, 2].map(k => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = `bg/${n}_${k}.jpg`; })));
}));
function plate(name) {
  const img = IMG[name][S.boil], m = getM();
  g.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]); g.drawImage(img, 0, 0, 1080, 1920); g.setTransform(1, 0, 0, 1, 0, 0);
}
// —— AI shots: each clip as 30 fps stills (ai/frames.sh → ai/f/<clip>/NNNN.jpg, 1086×1920); no clip yet → its keyframe ——
const AIN = (await J('ai/f/index.json')) || {}, FC = new Map();
function still(src) {
  if (!FC.has(src)) { FC.set(src, new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; })); if (FC.size > 48) FC.delete(FC.keys().next().value); }
  return FC.get(src);
}
const clipSrc = (clip, ct, key) => clip !== '-' && AIN[clip] && ct >= 0 ?   // before its first frame: the (sharper) keyframe
  `ai/f/${clip}/${String(clamp(Math.round(ct * 30), 0, AIN[clip] - 1) + 1).padStart(4, '0')}.jpg` : `ai/${key}`;
function aiDraw(img, [cx, cy, z, sh = 0], t) {
  cam(cx, cy, z, sh, t); const m = getM();
  g.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]); g.imageSmoothingQuality = 'high';
  g.drawImage(img, -3, 0, 1086, 1920); g.setTransform(1, 0, 0, 1, 0, 0);
}
const VIOLET = '#4b2a86', MARK = '#ffe066', RED = '#e2483d', CREAM = '#fff6e0', PAPER = '#fffdf4', GREEN = '#1d7a4a', MINT = ['#8fe3c0', '#7fd6b2'];

function cam(cx, cy, z, shake = 0, t = 0) {   // never shows past the edge of the 1080×1920 world
  cx = clamp(cx, W / 2 / z, W - W / 2 / z); cy = clamp(cy, H / 2 / z, H - H / 2 / z);
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}
const star4 = (x, y, r) => [[x, y - r], [x + r * .28, y - r * .28], [x + r, y], [x + r * .28, y + r * .28], [x, y + r], [x - r * .28, y + r * .28], [x - r, y], [x - r * .28, y - r * .28]];
function burst(x, y, t, t0, n = 8, R = 160, col = MARK) {   // impact lines
  const k = seg(t, t0, t0 + .3); if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + .3, r0 = R * (.45 + .55 * eo(k)), r1 = r0 + 60 * (1 - k); stroke([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 7, { line: col }); }
}
const shk = (t, t0, a, d = .25) => t >= t0 && t < t0 + d ? a * (1 - (t - t0) / d) : 0;
const pop_ = (t, t0, k = 2.2, d = .25) => back(seg(q(t), t0, t0 + d), k);
function stampBox(x, y, rot, s, lines, col = RED, w = 640, h = 190, bg = null) {   // a rubber stamp: outline + text (bg: on a card)
  push(); translate(x, y); rotate(rot); scale(s);
  if (bg) shape(rr(-w / 2 - 22, -h / 2 - 22, w + 44, h + 44, 26), { fill: bg, lw: 8 });
  shape(rr(-w / 2, -h / 2, w, h, 18), { fill: null, lw: 12, line: col });
  lines.forEach(([str, size], i) => text(str, 0, (i - (lines.length - 1) / 2) * size * 1.05, { font: `400 ${size}px Bungee`, fill: col }));
  pop();
}
function lawCard(t, t0, art, what, y = 300) {   // the article on screen, as the narrator says it
  const s = pop_(t, t0); if (s <= 0) return;
  reset(); push(); translate(540, y); scale(s); rotate(-.025);
  shape(rr(-440, -92, 880, 184, 24), { fill: INK, lw: 8 });
  text(`LEI 8.245/91 · ${art}`, 0, -34, { font: '400 44px Bungee', fill: GOLD });
  text(what, 0, 36, { font: '800 46px "Baloo 2"', fill: '#fff' });
  pop();
}
function doc(x, y, w, h, rot, head, sub, nLines = 10) {   // a sheet of paper with a heading and grey lines
  push(); translate(x, y); rotate(rot);
  shape(rr(-w / 2, -h / 2, w, h, 14), { fill: PAPER, lw: 8 });
  text(head, 0, -h / 2 + 80, { font: '400 46px Bungee', fill: INK });
  if (sub) text(sub, 0, -h / 2 + 136, { font: '700 34px "Baloo 2"', fill: '#5b5368' });
  for (let k = 0; k < nLines; k++) fillOnly(rr(-w / 2 + 70, -h / 2 + 200 + k * 46, w - 140 - hash(k) * 160, 14, 7), '#d6ccb4', { boil: .2 });
  pop();
}

// ———————————————— shots ————————————————
// AI shots: shot → [clip, clip time, camera [cx, cy, z, shake], keyframe drawn while there is no clip]. Clips named *x are EP 5's,
// reused: c1x and y1x were lip-synced to EP 5's c1 and y1, and this episode's lines are written to their rhythm, so each starts .4 s
// before its new line just as it did before its old one. chaos and window are new (Wan 2.7, see CREDITS); the window clip is
// lip-synced to a1 and held on its first frame (= its keyframe) while the camera climbs to it.
const AISH = {
  phone: t => ['phonex', .75 + t, [540, 960, 1.0], 'k_phone.png'],
  cuCaio: t => ['c1x', t - (VO.c1 - .4), [540, 960, 1.05 + (t - T.cuCaio) * .03, shk(t, T.cuCaio, 10)], 'k_caio_cu.png'],
  cuYou: t => ['y1x', t - (VO.y1 - .4), [540, 900, 1.0 + (t - T.cuYou) * .035], 'k_you_cu.png'],
  saveShot: t => ['-', 0, [540, 900, 1.04 + (t - T.saveShot) * .03], 'k_you_st.png'],
  chaos: t => ['chaos', t - T.machines, [540, 960, 1.05 + (t - T.machines) * .03, shk(t, T.machines, 10, .4)], 'k_chaos.png'],
  window: t => { const k = eio(seg(t, T.reveal, T.face)); return ['window', t < T.face ? -1 : Math.max(0, t - (VO.a1 - .4)), [540, lerp(1600, 860, k), lerp(2.2, 1.06, k) + Math.max(0, t - T.face) * .02], 'k_arl_window.png']; },
};
const AIX = {   // what the code draws over a clip (under the same camera first, then on screen)
  saveShot: t => {
    text('LAVANDERIA 1', 537, 392, { font: '400 74px Bungee', fill: RED });   // the keyframe's blank sign, under the same camera
    const sv = pop_(t, T.save);
    if (sv > 0) { reset(); push(); translate(880, 600); scale(sv); rotate(.08); shape([[-70, -90], [70, -90], [70, 100], [0, 50], [-70, 100]], { fill: t > T.save + .35 ? GOLD : '#fff', lw: 8 }); text('SALVA', 0, 170, { font: '400 46px Bungee', fill: '#fff', outlineW: 12 }); pop(); }
    followUI(t, 540, 1330, VO.n6, T.click, .8);
  },
  phone: t => { const k = seg(t, T.app - .5, T.app); if (k > 0) { reset(); screenRect('#fff6d6', .7 * k * k); } },   // into the screen
  window: t => { text('LAVANDERIA 1', 540, 1338, { font: '400 78px Bungee', fill: RED }); burst(540, 640, t, T.face, 10, 360, '#ff7ad9'); },   // the sign band under the window
};
const brl = v => 'R$ ' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');   // 41000 → R$ 41.000
function bankApp(t, from, to, t0, t1, rows) {   // a phone, a generic bank app: the balance counts from → to between t0 and t1
  reset(); fillOnly(rect(0, 0, W, H), '#2b2240', { boil: 0 });
  const k = ss(seg(t, t0, t1)), v = lerp(from, to, k), low = v < 50000;
  push(); translate(540, 940); rotate(-.03); scale(1 + Math.max(0, t - t0) * .025);   // a slow push, so the held balance never freezes
  shape(rr(-330, -640, 660, 1280, 76), { fill: '#16121f', lw: 10 });
  shape(rr(-290, -580, 580, 1160, 44), { fill: '#f4f0ff', lw: 0, line: null });
  fillOnly(rr(-290, -580, 580, 190, 44), '#5b3fb0', { boil: .2 }); fillOnly(rect(-290, -440, 580, 50), '#5b3fb0', { boil: .2 });
  text('MEU BANCO', 0, -505, { font: '400 46px Bungee', fill: '#fff' });
  text('Saldo disponível', 0, -300, { font: '800 44px "Baloo 2"', fill: '#6b5f80' });
  push(); translate(0, -180); scale(1 + .06 * Math.sin(Math.PI * k));
  text(brl(v), 0, 0, { font: '400 92px Bungee', fill: low ? RED : GREEN });
  pop();
  if (low && t > t1) { const bl = Math.floor((t - t1) * 3) % 2 === 0; push(); translate(0, 300); rotate(-.06); shape(rr(-210, -50, 420, 100, 20), { fill: bl ? RED : '#ff8a7a', lw: 7 }); text('SALDO BAIXO', 0, 4, { font: '400 46px Bungee', fill: '#fff' }); pop(); }
  rows.forEach(([label, val], i) => { const y = -20 + i * 120, rk = pop_(t, t0 + .1 + i * .25); if (rk <= 0) return;
    push(); translate(0, y); scale(rk); shape(rr(-250, -48, 500, 96, 18), { fill: '#fff', lw: 5 });
    text(label, -225, 0, { font: '800 32px "Baloo 2"', fill: INK, align: 'left' }); text(val, 225, 0, { font: '800 34px "Baloo 2"', fill: RED, align: 'right' }); pop(); });
  pop();
}
const SH = {};
SH.app = (t, tq) => bankApp(t, 941000, 41000, T.app + .1, T.land, [['Depósito judicial', '−900.000']]);
SH.nine = (t, tq) => bankApp(t, 41000, 9000, T.drop, T.drop + .9, [['Conserto · 4 máquinas', '−32.000']]);
function washer(x, y, s, broken, t, t0) {
  push(); translate(x, y); scale(s);
  shape(rr(-120, -150, 240, 300, 18), { fill: '#e8eef6', lw: 8 });
  fillOnly(rr(-100, -132, 200, 40, 8), '#c9d4e2', { boil: .2 }); dot(60, -112, 9, broken ? RED : GREEN);
  shape(ell(0, 40, 82, 82, 40), { fill: '#9fd0f2', lw: 8 }); shape(ell(0, 40, 56, 56, 30), { fill: broken ? '#5a6472' : '#cfe9fb', lw: 6 });
  if (broken) {
    const k = seg(q(t), t0, t0 + .15);
    push(); translate(0, 20); scale(lerp(1.8, 1, eo(k))); stroke([[-90, -90], [90, 90]], 22, { line: RED }); stroke([[90, -90], [-90, 90]], 22, { line: RED }); pop();
    for (let i = 0; i < 3; i++) { const u = ((t - t0) * .8 + i / 3) % 1; if (t > t0) shape(ell(-30 + i * 30 + Math.sin(u * 6 + i) * 14, -170 - u * 140, 22 + u * 26, 22 + u * 26, 16), { fill: '#b8b2c2', lw: 5, alpha: 1 - u }); }
  }
  pop();
}
SH.machines = (t, tq) => {   // four washers die, the bill
  const u = t - T.machines;
  reset(); bands(['#bfe3f7', '#aed8ef'], 0, H);
  cam(540, 900, 1.0 + u * .02);
  const P = [[300, 470], [780, 470], [300, 880], [780, 880]];
  P.forEach(([x, y], i) => washer(x, y, 1.0, true, t, T.machines - .5 + i * .2));   // all four already dead: the clip showed it
  const bk = pop_(t, T.bill, 2.2, .3);
  if (bk > 0) { reset(); push(); translate(540, 1300); rotate(-.05); scale(bk);
    shape(rr(-380, -150, 760, 300, 18), { fill: PAPER, lw: 8 });
    text('ORÇAMENTO · CONSERTO', 0, -90, { font: '400 40px Bungee', fill: INK });
    text('4 máquinas · peças + mão de obra', 0, -36, { font: '700 32px "Baloo 2"', fill: '#5b5368' });
    text('TOTAL  R$ 32.000', 0, 60, { font: '400 70px Bungee', fill: RED });
    pop(); }
};
SH.card = (t, tq) => {   // profit is not cash
  const u = t - T.card;
  reset(); fillOnly(rect(0, 0, W, H), '#1f1830', { boil: 0 });
  cam(540, 960, 1 + u * .02);
  const a = pop_(t, T.card + .05), b = pop_(t, T.card + .3), n = pop_(t, T.neq, 2.6, .2);
  if (a > 0) { push(); translate(540, 520); scale(a); rotate(-.04); shape(rr(-330, -110, 660, 220, 30), { fill: '#2f9e6e', lw: 9 }); text('LUCRO', 0, 8, { font: '400 120px Bungee', fill: '#fff' }); pop(); }
  if (n > 0) { push(); translate(540, 790); scale(n); text('≠', 0, 0, { font: '800 220px "Baloo 2"', fill: MARK, outlineW: 18 }); pop(); }
  if (b > 0) { push(); translate(540, 1060); scale(b); rotate(.04); shape(rr(-330, -110, 660, 220, 30), { fill: RED, lw: 9 }); text('CAIXA', 0, 8, { font: '400 120px Bungee', fill: '#fff' }); pop(); }
};
const BY = 830, BS = .8;   // where the building stands, and its size (clear of four lines of captions)
function building(t, lit, rented, rk) {   // the building in section: the shop below, two floors above
  push(); translate(540, BY); scale(BS);
  shape(rr(-360, -620, 720, 1220, 10), { fill: '#d9cfe8', lw: 9 });
  fillOnly(rect(-360, -620, 720, 40), '#b9aed0', { boil: .2 });
  for (let f = 0; f < 2; f++) {   // floors 3 and 2
    const y = -540 + f * 360, on = rented[f];
    shape(rr(-320, y, 640, 300, 10), { fill: on ? '#fff3c4' : '#3a3346', lw: 7 });
    for (let w = 0; w < 3; w++) shape(rr(-270 + w * 190, y + 50, 150, 130, 8), { fill: on ? '#ffe58a' : '#4b445a', lw: 6 });
    if (!on) { stroke([[-300, y + 20], [-240, y + 20], [-300, y + 80]], 4, { line: '#7a7290' }); text('VAZIO', 0, y + 240, { font: '400 44px Bungee', fill: lit ? MARK : '#8a8296' }); }
    else { const s = rk[f]; if (s > 0) stampBox(0, y + 225, -.08, lerp(2.2, 1, Math.min(1, s)), [['ALUGADO', 50]], GREEN, 380, 90, CREAM); }
  }
  shape(rr(-320, 180, 640, 380, 10), { fill: '#9fe0c9', lw: 7 });   // the shop
  fillOnly(rr(-320, 180, 640, 70, 10), '#ff9e8a', { boil: .2 });
  text('LAVANDERIA 1', 0, 218, { font: '400 44px Bungee', fill: '#fff', outlineW: 8 });
  for (let m = 0; m < 4; m++) { shape(rr(-280 + m * 145, 300, 120, 160, 10), { fill: '#e8eef6', lw: 5 }); shape(ell(-220 + m * 145, 390, 36, 36, 24), { fill: '#9fd0f2', lw: 5 }); }
  pop();
}
SH.floors = (t, tq) => {
  const u = t - T.floors, k = eio(seg(t, T.floors, T.light + .3));
  reset(); bands(['#9fd4f5', '#b5def7'], 0, H);
  cam(540, lerp(1150, 960, k), lerp(1.2, 1.0, k));
  const lit = t >= T.light;
  building(t, lit, [false, false], [0, 0]);
  if (lit) { reset(); for (let f = 0; f < 2; f++) { const y = BY + (-540 + f * 360 + 150) * BS; push(); translate(900, y); scale(pop_(t, T.light + f * .15)); shape([[-60, 0], [20, -50], [20, -20], [70, -20], [70, 20], [20, 20], [20, 50]], { fill: MARK, lw: 6 }); pop(); } }
};
SH.rent = (t, tq) => {
  const u = t - T.rent;
  reset(); bands(['#9fd4f5', '#b5def7'], 0, H);
  cam(540, 900, 1.0 + u * .015);
  const r1 = t >= T.rented, r2 = t >= T.rented + .45;
  building(t, false, [r2, r1], [pop_(t, T.rented + .45, 2.2, .16), pop_(t, T.rented, 2.2, .16)]);
  const ck = seg(t, T.rented + .2, T.rented + 1.2);
  for (let i = 0; i < 6; i++) { const kk = clamp(ck * 1.4 - i * .08, 0, 1); if (kk > 0 && kk < 1) coin(lerp(600, 900, kk), lerp(BY + (-390 + (i % 2) * 360) * BS, 1450, kk * kk), 30, t * 20 + i); }
  const sk = pop_(t, T.split, 2.2, .25);
  if (sk > 0) { reset(); push(); translate(540, 1380); rotate(-.04); scale(sk); shape(rr(-360, -80, 720, 160, 20), { fill: PAPER, lw: 8 }); text('CONSERTO: 8x R$ 4.000', 0, 6, { font: '400 52px Bungee', fill: INK }); pop(); }
  const rk2 = pop_(t, T.rented + .3, 2.2, .25);
  if (rk2 > 0) { reset(); push(); translate(540, 250); rotate(.03); scale(rk2); shape(rr(-360, -80, 720, 160, 20), { fill: '#2f9e6e', lw: 8 }); text('+ R$ 6.000 / MÊS', 0, 6, { font: '400 58px Bungee', fill: '#fff' }); pop(); }
};
SH.sum = (t, tq) => {   // the building pays the repair, and leaves 2 mil
  const u = t - T.sum;
  reset(); fillOnly(rect(0, 0, W, H), '#fff6e0', { boil: 0 });
  cam(540, 960, 1 + u * .02);
  const row = (y, sign, val, what, col, t0) => { const s = pop_(t, t0); if (s <= 0) return; push(); translate(540, y); scale(s);
    text(`${sign} ${val}`, 120, 0, { font: '400 96px Bungee', fill: col, align: 'right' }); text(what, 160, 6, { font: '800 50px "Baloo 2"', fill: '#5b5368', align: 'left' }); pop(); };
  row(520, '+', 'R$ 6.000', 'aluguel', GREEN, T.sum + .05);
  row(700, '−', 'R$ 4.000', 'conserto', RED, T.sum + .35);
  const lk = seg(t, T.sum + .6, T.sum + .9); if (lk > 0) stroke([[150, 820], [lerp(150, 930, eo(lk)), 820]], 12);
  const pk = pop_(t, T.plus, 2.6, .25);
  if (pk > 0) { push(); translate(540, 1000); scale(pk); rotate(-.03); shape(rr(-420, -110, 840, 220, 30), { fill: MARK, lw: 9 }); text('+ R$ 2.000 / MÊS', 0, 6, { font: '400 84px Bungee', fill: INK }); pop(); burst(540, 1000, t, T.plus + .1, 12, 460, GOLD); }
};
SH.pen = (t, tq) => {   // the lease of the 2nd floor, signed with a gold pen
  const u = t - T.pen;
  reset(); bands(['#3a2f52', '#33294a'], 0, H);
  const zk = eio(seg(t, T.gold - .3, T.gold + .5));
  cam(lerp(540, 700, zk), lerp(960, 1180, zk), lerp(1.0, 1.7, zk));
  doc(540, 900, 800, 1040, -.03, 'CONTRATO DE', 'LOCAÇÃO · 2º andar', 6);
  push(); translate(540, 900); rotate(-.03);
  stroke([[-300, 380], [300, 380]], 4, { line: '#8a8296' }); text('Locatário', -300, 420, { font: '700 30px "Baloo 2"', fill: '#6b6b80', align: 'left' });
  const sk = seg(t, T.pen + .3, T.gold);   // the signature, written as the pen moves
  const S_ = []; for (let i = 0; i <= 60 * sk; i++) { const a = i / 60; S_.push([-280 + a * 520, 340 - Math.sin(a * 18) * 30 * (1 - a * .5) - a * 20]); }
  if (S_.length > 1) stroke(S_, 6, { line: '#2a2a70' });
  const pe = S_.length ? S_[S_.length - 1] : [-280, 340];
  push(); translate(pe[0] + 40, pe[1] - 150); rotate(.55);
  shape(rr(-26, -220, 52, 300, 22), { fill: GOLD, lw: 7 }); shape([[-26, 80], [26, 80], [0, 150]], { fill: GOLD2, lw: 6 });
  shape(ell(0, -110, 30, 30, 20), { fill: VIOLET, lw: 5 }); text('Ω', 0, -106, { font: '800 40px "Baloo 2"', fill: GOLD });
  pop();
  pop();
  if (t >= T.gold) { const gk = seg(t, T.gold, T.gold + .5); reset(); const [cx, cy] = [700, 760]; if (gk < 1) shape(star4(cx, cy, 90 * Math.sin(Math.PI * gk)), { fill: '#fff', lw: 5 }); }
};
SH.end = (t, tq) => {
  reset(); fillOnly(rect(0, 0, W, H), '#2a1838', { boil: 0 });
  vortex(540, 760, 900, t * .5, .35);
  screenRect('#2a1838', .55);
  const s = pop_(t, T.end, 2.4, .3);
  reset(); push(); translate(540, 640); scale(s); rotate(-.06);
  text(EP.next, 14, 18, { font: '400 300px Bungee', fill: GOLDS, outlineW: 26 });
  text(EP.next, 0, 0, { font: '400 300px Bungee', fill: GOLD, outlineW: 26 });
  pop();
  const b = pop_(t, T.end + .35, 2);
  reset(); push(); translate(540, 920); scale(b); rotate(.03);
  shape(rr(-380, -66, 760, 132, 20), { fill: RED, lw: 8 });
  text(EP.nextTitle, 0, 6, { font: '800 74px "Baloo 2"', fill: CREAM, outlineW: 10 });
  pop();
  const c = pop_(t, T.end + 1.1, 2, .3);
  if (c > 0) { reset(); push(); translate(540, 270); scale(c); rotate(-.02); shape(rr(-420, -84, 840, 168, 26), { fill: MARK, lw: 8 }); text('POR QUE ELE QUER FICAR', 0, -22, { font: '800 48px "Baloo 2"', fill: INK }); text('TÃO PERTO? COMENTA AÍ!', 0, 38, { font: '800 44px "Baloo 2"', fill: INK }); pop(); }
  followUI(t, 540, 1200, T.end + .7, VO.n11 + DURS.n11 * .7);
};

// ———————————————— shared graphics ————————————————
function bands(cols, y0, y1) { const n = cols.length; for (let i = 0; i < n; i++) fillOnly(rect(-100, lerp(y0, y1, i / n), W + 200, (y1 - y0) / n + 2), cols[i], { boil: 0 }); }
function followUI(t, x, y, t0, tc, sc = 1) {
  const s = back(seg(q(t), t0, t0 + .3), 2) * sc, done = t >= tc;
  if (s <= 0) return;
  reset(); push(); translate(x, y); scale(s);
  shape(rr(-420, -70, 840, 140, 70), { fill: CREAM, lw: 7 });
  shape(ell(-345, 0, 50, 50, 30), { fill: GOLD, lw: 6 });
  text('$', -345, 4, { font: '400 60px Bungee', fill: INK });
  text('POV MILIONÁRIO', -280, -16, { font: '800 40px "Baloo 2"', fill: INK, align: 'left' });
  text('série · 30 episódios', -280, 26, { font: '800 28px "Baloo 2"', fill: '#6b5f80', align: 'left' });
  const pb = done ? back(seg(t, tc, tc + .2), 3) : 1;
  push(); translate(250, 0); scale(lerp(.85, 1, pb));
  shape(rr(-140, -46, 280, 92, 46), { fill: done ? '#9a9aa6' : '#ff2e4d', lw: 6 });
  text(done ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, { font: '800 40px "Baloo 2"', fill: '#fff' });
  pop();
  const hc = seg(t, tc - .7, tc - .1), press = t > tc - .1 && t < tc + .12;
  if (t > tc - .7 && t < tc + .8) {
    const hx = lerp(520, 280, eo(hc)), hy = lerp(260, 40, eo(hc)) + (press ? 10 : 0);
    push(); translate(hx, hy); rotate(-.35);
    shape(spline([[-20, -70], [0, -86], [20, -70], [22, -10], [50, -6], [56, 40], [30, 80], [-30, 80], [-46, 20], [-22, 0]]), { fill: '#fff', lw: 6 });
    pop();
  }
  if (done) for (let i = 0; i < 6; i++) { const k = seg(t, tc, tc + .5), a = i / 6 * TAU; if (k < 1) shape(star4(250 + Math.cos(a) * 190 * eo(k), Math.sin(a) * 110 * eo(k), 18 * (1 - k)), { fill: GOLD, lw: 4 }); }
  pop();
}
function vortex(cx, cy, R, t, a = 1) {   // the swirl of the time jumps: rotating gold arms, flat colours, ink outline
  if (R < 4) return;
  push(); translate(cx, cy);
  const n = 6, cols = [GOLD, '#ffb020', GOLD2];
  shape(ell(0, 0, R, R, 60), { fill: '#ffb020', lw: 8, alpha: a });
  for (let k = 0; k < n; k++) {
    const P = [];
    for (let i = 0; i <= 16; i++) { const r = R * i / 16, th = k * TAU / n + t * 2.4 + i * .22; P.push([Math.cos(th) * r, Math.sin(th) * r]); }
    for (let i = 16; i >= 0; i--) { const r = R * i / 16, th = k * TAU / n + t * 2.4 + i * .22 + .42; P.push([Math.cos(th) * r, Math.sin(th) * r]); }
    shape(P, { fill: cols[k % 3], lw: 6, alpha: a });
  }
  shape(ell(0, 0, R * .18, R * .18, 30), { fill: '#fff6d6', lw: 6, alpha: a });
  pop();
}
function wipe(t) {
  for (const [tc, hw] of WIPES) {
    const d = Math.abs(t - tc); if (d > hw) continue;
    reset(); vortex(540, 960, 1500 * Math.pow(1 - d / hw, .6), t);
    if (d < .03) screenRect('#fff6d6', .6);
  }
}
function titleCard(t) {
  if (t > T.app && !CAPA) return;
  const s = back(seg(q(t), 0, .25), 2.2);
  reset(); push(); translate(540, 250); scale(s); rotate(-.03);
  shape(rr(-470, -120, 940, 240, 30), { fill: CREAM, lw: 9 });
  text('POV:', -400, -52, { font: '400 64px Bungee', fill: RED, align: 'left' });
  text('você ficou', -228, -50, { font: '800 64px "Baloo 2"', fill: INK, align: 'left' });
  text('MILIONÁRIO AOS 23', 0, 50, { font: '400 76px Bungee', fill: GOLD, outlineW: 14 });
  push(); translate(330, -70); rotate(.12); shape(rr(-140, -34, 280, 68, 16), { fill: VIOLET, lw: 6 }); text(`EP ${EP.n} · ${EP.title}`, 0, 4, { font: '400 30px Bungee', fill: '#fff' }); pop();
  pop();
}
// subtitles: the cartoon's own captions (white, thick black outline), speaker pill, key words in yellow
const WHO = { c: ['CAIO', '#e3a72a'], y: ['VOCÊ', '#545a69'], a: ['SEU ARLINDO', VIOLET] };
const SUBS = Object.entries(VO).map(([id, t0]) => {
  const L = LINE[id], d = DURS[id];
  let t1 = t0 + Math.max(d + .8, 1.8);
  const nxt = Object.values(VO).filter(v => v > t0 + .05).sort((a, b) => a - b)[0];
  if (nxt != null && t1 > nxt - .02) t1 = Math.max(nxt - .02, t0 + d + .1);
  return { id, t0, t1: +t1.toFixed(3), who: L.who, text: L.sub, hi: L.hi || [] };
});
function hiMask(text_, hi) { const w = text_.split(' '), m = w.map(() => false); for (const p of hi) { const pw = p.split(' '); for (let i = 0; i + pw.length <= w.length; i++) if (pw.every((x, k) => w[i + k] === x)) pw.forEach((_, k) => m[i + k] = true); } return m; }
function wrap(str, maxW, font) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = font;
  const words = str.split(' '), out = []; let cur = '';
  for (const w of words) { const c = cur ? cur + ' ' + w : w; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = w; } else cur = c; }
  if (cur) out.push(cur); return out;
}
function subs(t) {
  const s = SUBS.find(s => t >= s.t0 && t < s.t1); if (!s) return;
  const font = '800 60px "Baloo 2"', lines = wrap(s.text, 900, font), p_ = back(seg(t, s.t0, s.t0 + .12), 2);
  const y0 = 1640 - (lines.length - 1) * 74, mask = hiMask(s.text, s.hi);
  reset();
  if (WHO[s.who]) { const [nm, col] = WHO[s.who]; push(); translate(540, y0 - 76); scale(p_); g.font = '800 32px "Baloo 2"'; const w = g.measureText(nm).width + 50; shape(rr(-w / 2, -26, w, 52, 16), { fill: col, lw: 5 }); text(nm, 0, 3, { font: '800 32px "Baloo 2"', fill: '#fff' }); pop(); }
  let wi = 0;
  lines.forEach((l, k) => {
    g.setTransform(1, 0, 0, 1, 0, 0); g.font = font; const ws = l.split(' '), sp = g.measureText(' ').width, tw = g.measureText(l).width;
    let x = 540 - tw / 2;
    push(); translate(540, y0 + k * 74); scale(lerp(.9, 1, p_)); translate(-540, -(y0 + k * 74));
    for (const w of ws) { g.font = font; const ww = g.measureText(w).width; text(w, x + ww / 2, y0 + k * 74, { font, fill: mask[wi++] ? MARK : '#fff', outlineW: 13 }); x += ww + sp; }
    pop();
  });
}
function capaBadge(t) {   // cover
  reset(); push(); translate(540, 1600); rotate(-.03);
  shape(rr(-440, -120, 880, 240, 30), { fill: INK, lw: 9 });
  text('SOBRARAM R$ 41 MIL...', 0, -50, { font: '400 54px Bungee', fill: '#ff7ad9' });
  text('E ELE SABIA.', 0, 40, { font: '800 100px "Baloo 2"', fill: GOLD });
  pop();
}

async function render(t) {
  const [, , name] = shotAt(t), tq = q(t), ai = AISH[name] ? AISH[name](t) : null;
  const img = ai ? await still(clipSrc(ai[0], ai[1], ai[3])) : null;
  frame(t);
  screenRect('#000');
  if (ai) { aiDraw(img, ai[2], t); AIX[name]?.(t); }
  else SH[name](t, tq);
  wipe(t);
  titleCard(t);
  if (CAPA) { capaBadge(t); return; }
  subs(t);
}

// —— sound events (mix.py) ——
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of Object.entries(VO)) add('vo', t0, { id, who: LINE[id].who, d: DURS[id] });
  for (const c of CUES) add('cue', c.t0, { id: c.id, t1: +c.t1.toFixed(3) });
  for (const s of SUBS) add('sub', s.t0, { t1: s.t1, text: s.text });
  let cur = null;
  for (const [a, b, , w] of SHOTS) { if (cur && cur.w === w && Math.abs(cur.b - a) < .01) cur.b = b; else { if (cur) add('amb', cur.a, { w: cur.w, d: +(cur.b - cur.a).toFixed(3) }); cur = { a, b, w }; } }
  add('amb', cur.a, { w: cur.w, d: +(cur.b - cur.a).toFixed(3) });
  add('title', .05); add('shimmer', .2); add('rise', T.app - .55, { d: .55 });
  add('cut', T.app, { v: .4 }); add('sting', T.land - .1, { v: .9 });
  add('cut', T.cuCaio, { v: .4 }); add('boing', T.cuCaio + .05, { v: .5 });
  add('cut', T.machines, { v: .4 }); add('hit', T.machines, { v: .8 }); add('foam', T.machines + .05, { d: T.billShot - T.machines }); for (let i = 0; i < 5; i++) add('spark', T.machines + .2 + i * .45);
  add('cut', T.billShot, { v: .4 });
  add('pop', T.bill, { v: .8 }); add('kaching', T.bill + .1, { v: .5 });
  add('cut', T.nine, { v: .4 }); add('sting', T.drop + .6, { v: .8 }); add('tick', T.drop + .9, { d: T.cuYou - T.drop - .9 });
  add('cut', T.cuYou, { v: .4 });
  add('cut', T.card, { v: .4 }); add('pop', T.card + .05, { v: .6 }); add('pop', T.card + .3, { v: .6 }); add('stamp', T.neq, { v: .7 });
  add('whoosh', T.floors, { v: .5 }); add('sparkle', T.light); add('pop', T.light + .02, { v: .6 }); add('pop', T.light + .17, { v: .5 });
  add('cut', T.saveShot, { v: .4 }); add('pop', T.save, { v: .7 }); add('pop', VO.n6 + .05); add('click', T.click); add('sparkle', T.click + .02);
  add('cut', T.rent, { v: .4 }); add('stamp', T.rented, { v: .9 }); add('stamp', T.rented + .45, { v: .9 }); add('kaching', T.rented + .3, { v: .8 }); add('pop', T.split, { v: .7 });
  add('cut', T.sum, { v: .4 }); add('pop', T.sum + .05, { v: .6 }); add('pop', T.sum + .35, { v: .6 }); add('kaching', T.plus, { v: .9 }); add('sparkle', T.plus + .1);
  add('cut', T.pen, { v: .4 }); add('marker', T.pen + .3, { d: T.gold - T.pen - .3 }); add('glint', T.gold);
  add('cut', T.reveal, { v: .4 }); add('rise', T.reveal + .1, { d: T.face - T.reveal - .1 }); add('hit', T.face, { v: .8 }); add('sting', T.face + .05, { v: .7 }); add('pop', VO.a1 + .1, { v: .5 });
  add('sting', T.end); add('pop', T.end + .35); add('pop', T.end + 1.1, { v: .6 }); add('click', VO.n11 + DURS.n11 * .7); add('sparkle', VO.n11 + DURS.n11 * .7 + .02);
  return ev.sort((a, b) => a.t - b.t);
}

window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS; window.T = T; window.VO = VO;
window.TEXTS = t => { const s = SUBS.find(s => t >= s.t0 && t < s.t1); return s ? [{ id: s.id, text: s.text, x0: 90, y0: 1550, x1: 990, y1: 1720 }] : []; };
for (const f of ['800 60px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
await render(parseFloat(Q.get('t') ?? '1'));
window.READY = true;
