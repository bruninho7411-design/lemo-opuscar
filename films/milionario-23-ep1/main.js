// POV: você ficou milionário aos 23 — EP 1 (Sci-Fi Sitcom Toon, vertical 1080×1920)
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, quad, dot, text, screenRect, reset, S } from './toon.js';
import { person, YOU, CAIO, ARLINDO, FRIEND1, FRIEND2, sofa, phone, bankScreen, noodleCup, coinPouch, coin, keys, GOLD, GOLD2, GOLDS } from './chars.js';
import { q, build } from './story.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {}, LIPS = (await J('voices/lips.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
for (const l of LINES) if (DURS[l.id] == null) DURS[l.id] = .5 + l.text.length * .062;
const { VO, T, DUR, SHOTS, WIPES, TAGS, GAINS, NET, CUES } = build(DURS);
const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

// —— acting helpers ——
function talk(who, t) {
  const tq = q(t);
  for (const [id, t0] of Object.entries(VO)) {
    if (LINE[id].who !== who) continue;
    if (tq >= t0 && tq < t0 + DURS[id]) {
      const k = Math.floor((tq - t0) * 24), lp = LIPS[id];
      const o = lp ? (lp.o[k] ?? 0) : .5 * (1 + Math.sin(tq * 20)) / 2, b = lp ? (lp.b[k] ?? .5) : .5;
      return { o, w: .8 + .45 * b - .2 * o, talking: true };
    }
  }
  return { o: 0, w: 1, talking: false };
}
const blinks = (t, seed) => { const k = Math.floor(t * 12), c = Math.floor(k / 34); return k % 34 < 2 && hash(c * 7.1 + seed) > .25; };
function Y(t, o = {}) {   // você
  const m = talk('y', t), tq = q(t);
  return { t, s: 1, lid: .5, blink: blinks(t, 3), mouth: { o: m.o, w: m.w, sm: -.2 }, sq: 1 + .008 * Math.sin(tq * 2.2), ...o };
}
function C(t, o = {}) {   // Caio
  const m = talk('c', t), tq = q(t);
  return { t, s: 1, nerv: .35, blink: blinks(t, 9), mouth: { o: m.o * 1.2, w: m.w, sm: -.3 }, sq: 1 + .012 * Math.sin(tq * 3), headTilt: m.talking ? (m.o - .3) * .1 : 0, ...o };
}
function cam(cx, cy, z, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}
const camLerp = (t, t0, t1, a, b, e = eio) => { const u = e(seg(t, t0, t1)); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; };
const fmt = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

// ———————————————— sets ————————————————
const BG = (col) => fillOnly(rect(-3000, -3000, 8000, 8000), col, { boil: 0 });
// 23: the beige living room (the suspiciously normal world)
function sofaSet(t, o = {}) {
  BG('#efe0c2');
  fillOnly(rect(-3000, 980, 8000, 300), '#e6d2ad', { boil: 0 }); stroke([[-3000, 980], [5000, 980]], 6);
  // window
  shape(rr(140, 300, 330, 400, 12), { fill: '#9fd0e8', lw: 7, shade: () => { fillOnly(rect(140, 300, 330, 130), '#b8dcec', { boil: .2 }); for (let i = 0; i < 5; i++) fillOnly(rect(150 + i * 66, 560 - hash(i) * 120, 50, 200), '#7fb0c8', { boil: .3 }); } });
  stroke([[305, 300], [305, 700]], 6); stroke([[140, 500], [470, 500]], 6);
  shape(rr(120, 690, 370, 30, 8), { fill: '#d8c19a', lw: 6 });
  // picture + clock
  shape(rr(650, 380, 250, 190, 8), { fill: '#fff6e0', lw: 7, shade: () => { fillOnly(rect(650, 500, 250, 80), '#8fc7c2', { boil: .3 }); fillOnly([[720, 500], [790, 420], [850, 500]], '#e2483d', { boil: .3 }); } });
  const cx = 930, cy = 250;
  shape(ell(cx, cy, 60, 60, 30), { fill: '#fff6e0', lw: 7 });
  const sec = Math.floor(t), am = sec / 60 * TAU;
  stroke([[cx, cy], [cx + Math.sin(am) * 44, cy - Math.cos(am) * 44]], 4); stroke([[cx, cy], [cx + 26, cy + 8]], 6);
  // plant
  for (let i = 0; i < 6; i++) { const a = -1.2 + i * .45; shape(spline([[1000, 1080], [1000 + Math.cos(a - .3) * 90, 1080 - 150 - i * 12 + Math.sin(a) * 30], [1000 + Math.cos(a) * 150, 1080 - 210 + Math.sin(a) * 60], [1000 + Math.cos(a + .3) * 80, 1080 - 120]], true), { fill: i % 2 ? '#7a9a5a' : '#94b56e', lw: 5 }); }
  shape([[950, 1080], [1050, 1080], [1035, 1190], [965, 1190]], { fill: '#c7703c', lw: 6 });
  // floor + rug
  fillOnly(rect(-3000, 1240, 8000, 3000), '#b89a74', { boil: 0 }); stroke([[-3000, 1240], [5000, 1240]], 6);
  shape(ell(540, 1620, 520, 120, 50), { fill: '#a27f5a', lw: 6, shade: () => stroke(ell(540, 1620, 440, 90, 40), 4, { line: '#c49a6c', closed: true }) });
}
function sofaScene(t, o = {}) {
  sofaSet(t);
  const front = sofa(540, 1180, 900, '#c9a77c', '#a8865c');
  person(CAIO, C(t, { x: 320, y: 1380, sit: 1, look: [.7, 0], turn: .4, ...o.caio }));
  person(YOU, Y(t, { x: 770, y: 1380, sit: 1, look: [-.5, .5], turn: -.3, ...o.you }));
  front();
  // coffee table
  shape(rr(230, 1500, 620, 44, 12), { fill: '#8a6142', lw: 7, shade: () => fillOnly(rect(230, 1525, 620, 20), '#6e4b32', { boil: .2 }) });
  for (const x of [270, 810]) shape(rect(x - 12, 1540, 24, 120), { fill: '#6e4b32', lw: 6 });
  if (o.cupOnTable !== false) noodleCup(400, 1500, .9, t);
  if (o.tablePhone) o.tablePhone();
}
// coin-op machine (front loader). x centre, y top
function machine(x, y, t, col, colS, { spin = 1, glass = '#bfe9ff', clothes = ['#ff5fa2', '#ffe066', '#3fd0c9'] } = {}) {
  shape(rr(x - 110, y, 220, 400, 18), { fill: col, lw: 7, shade: () => fillOnly(rect(x + 50, y, 70, 410), colS, { boil: .3 }) });
  stroke([[x - 110, y + 80], [x + 110, y + 80]], 6);
  for (const k of [-60, -20]) shape(ell(x + k, y + 40, 14, 14, 12), { fill: '#fff6e0', lw: 5 });
  shape(rr(x + 30, y + 26, 50, 30, 6), { fill: '#3b3546', lw: 5 }); stroke([[x + 45, y + 41], [x + 65, y + 41]], 4, { line: GOLD });
  shape(ell(x, y + 240, 86, 86, 40), { fill: '#e8e6ef', lw: 7 });
  shape(ell(x, y + 240, 64, 64, 36), {
    fill: glass, lw: 6, shade: () => {
      const a0 = q(t) * 5 * spin;
      clothes.forEach((c, i) => { const a = a0 + i * 2.1; fillOnly(ell(x + Math.cos(a) * 30, y + 260 + Math.sin(a) * 26, 30, 18, 14), c, { boil: .4 }); });
      fillOnly(rect(x - 70, y + 268, 140, 50), 'rgba(120,190,230,.6)', { boil: .3 });
      fillOnly(ell(x - 24, y + 214, 12, 20, 10), 'rgba(255,255,255,.7)', { boil: .2 });
    }
  });
}
// 18: teal + coral laundromat
function laundSet(t) {
  BG('#4fb3ad');
  fillOnly(rect(-3000, 1000, 8000, 400), '#2f8f8a', { boil: 0 }); stroke([[-3000, 1000], [5000, 1000]], 6);
  shape(rr(260, 590, 1500, 150, 20), { fill: '#ff7a6b', lw: 8, shade: () => fillOnly(rect(260, 700, 1500, 40), '#e05a4c', { boil: .3 }) });
  text('LAVANDERIA DO SEU ARLINDO', 1010, 666, { font: '800 74px "Baloo 2"', fill: '#fff6e0', outlineW: 12 });
  for (let i = 0; i < 6; i++) machine(140 + i * 250, 800, t + i * .3, '#ff7a6b', '#e05a4c', { spin: i % 2 ? 1 : -1.2 });
  fillOnly(rect(-3000, 1300, 8000, 3000), '#d9ece6', { boil: 0 }); stroke([[-3000, 1300], [5000, 1300]], 6);
  for (let i = -6; i < 16; i++) stroke([[i * 180, 1300], [i * 180 - 260, 1920]], 4, { line: '#b5d6cc' });
  stroke([[-3000, 1520], [5000, 1520]], 4, { line: '#b5d6cc' });
}
function foldTable(x, y, n = 4) {
  shape(rr(x - 230, y, 460, 40, 8), { fill: '#e9e2d0', lw: 7 });
  for (const sx of [-1, 1]) shape(rect(x + sx * 190 - 10, y + 40, 20, 260), { fill: '#9a9aa6', lw: 5 });
  const cols = ['#ff5fa2', '#ffe066', '#3fd0c9', '#9b7fd4', '#ff7a6b'];
  for (let i = 0; i < n; i++) shape(rr(x - 200, y - 26 - i * 26, 150, 28, 6), { fill: cols[i % 5], lw: 5 });
}
// 19: ultraviolet party (top) and the mint room (bottom)
function partyPanel(t) {
  BG('#5b2bd6');
  const tq = q(t);
  for (let i = 0; i < 7; i++) { const a = -1.9 + i * .26 + Math.sin(tq * 1.3) * .08; fillOnly([[540, -100], [540 + Math.cos(a) * 1600, -100 + Math.sin(-a) * -1600], [540 + Math.cos(a + .12) * 1600, -100 + Math.sin(-a - .12) * -1600]], i % 2 ? '#7a4cf0' : '#6a3ae6', { boil: .3 }); }
  for (let i = 0; i < 14; i++) dot(80 + hash(i) * 920, 60 + hash(i + 20) * 520, 6 + 4 * Math.sin(tq * 6 + i), ['#ff5fa2', '#3fd0c9', '#ffe066'][i % 3]);
  fillOnly(rect(-100, 800, 1300, 300), '#3f1aa8', { boil: 0 }); stroke([[-100, 800], [1300, 800]], 6);
  const bt = Math.abs(Math.sin(tq * Math.PI * 1.67));
  const up = (sx, k) => ({ h: [sx * 30, -150 - 20 * Math.sin(tq * 8 + k)], bend: sx * 20, hold: (hp) => phone(hp[0], hp[1] - 50, sx * .2, .55, { glow: 0 }) });
  person(FRIEND1, { t, x: 210, y: 900, s: .62, bob: -bt * 18, look: [.3, -.4], mouth: { o: .5, sm: 1 }, armR: up(1, 0), lid: 0 });
  person(FRIEND2, { t, x: 860, y: 900, s: .62, bob: -bt * 22, look: [-.3, -.4], mouth: { o: .6, sm: 1 }, armL: up(-1, 2) });
  person(CAIO, C(t, { x: 540, y: 920, s: .7, bob: -bt * 16, nerv: 0, look: [0, -.2], mouth: { o: .7, sm: 1.2 }, armR: up(1, 1), armL: up(-1, 3) }));
  // price tags of what they bought
  tagCard(250, 330, 'CELULAR NOVO', '12x', -.12, t);
  tagCard(820, 300, 'CARRO', '48x', .1, t);
}
function tagCard(x, y, a, b, rot, t) {
  push(); translate(x, y + Math.sin(t * 2 + x) * 8); rotate(rot);
  stroke([[0, -70], [0, -40]], 4);
  shape(rr(-120, -40, 240, 110, 14), { fill: '#fff6e0', lw: 6 });
  text(a, 0, -2, { font: '800 32px "Baloo 2"', fill: INK });
  text(b, 0, 40, { font: '800 36px "Baloo 2"', fill: '#e2483d' });
  pop();
}
function roomPanel(t, coinsIn) {
  BG('#8fe3c0');
  fillOnly(rect(-100, 1560, 1300, 600), '#6cc7a4', { boil: 0 }); stroke([[-100, 1560], [1300, 1560]], 6);
  shape(rr(700, 1060, 260, 200, 10), { fill: '#3b2e6b', lw: 7, shade: () => { for (let i = 0; i < 8; i++) dot(720 + hash(i) * 220, 1080 + hash(i + 9) * 160, 3, '#fff6e0'); } });   // window at night
  stroke([[830, 1060], [830, 1260]], 6);
  // desk
  shape(rr(120, 1470, 640, 40, 8), { fill: '#a8865c', lw: 7 });
  for (const x of [160, 720]) shape(rect(x - 12, 1510, 24, 260), { fill: '#7f6141', lw: 6 });
  // lamp
  stroke([[200, 1470], [230, 1330], [300, 1300]], 7); shape([[270, 1280], [350, 1290], [340, 1340], [260, 1330]], { fill: '#ffe066', lw: 6 });
  // jar with savings
  const lvl = clamp(coinsIn);
  shape(rr(390, 1290, 170, 190, 30), {
    fill: 'rgba(214,243,255,.55)', lw: 7, shade: () => {
      const top = 1470 - 170 * lvl;
      fillOnly(rect(380, top, 200, 200), '#e0a526', { boil: .3 });
      for (let i = 0; i < 12 * lvl; i++) fillOnly(ell(410 + hash(i) * 130, top + 14 + hash(i + 5) * 150 * lvl, 18, 8, 10), i % 3 ? GOLD : '#7cc68c', { boil: .3 });
      fillOnly(rect(400, 1300, 20, 160), 'rgba(255,255,255,.6)', { boil: .2 });
    }
  });
  shape(rr(380, 1270, 190, 34, 8), { fill: '#c9ccd6', lw: 6 });
  text('SONHO', 475, 1400, { font: '800 30px "Baloo 2"', fill: '#1b1422' });
}
// 21: tomato + sky-blue laundromat (now yours)
function l21Set(t, night = 0) {
  BG('#e2483d');
  fillOnly(rect(-3000, 980, 8000, 500), '#c23a30', { boil: 0 }); stroke([[-3000, 980], [5000, 980]], 6);
  shape(rr(200, 420, 680, 110, 18), { fill: '#7cc6f2', lw: 8 });
  text('LAVANDERIA', 540, 478, { font: '400 80px Bungee', fill: '#fff6e0', outlineW: 12 });
  shape(rr(900, 400, 150, 120, 14), { fill: night ? '#1d2a5a' : '#bfe9ff', lw: 7, shade: () => { if (night) dot(975, 440, 20, '#fff6e0'); } });
  for (let i = 0; i < 4; i++) machine(150 + i * 260, 580, t + i * .2, '#7cc6f2', '#58a8d6', { spin: i % 2 ? 1.3 : -1, clothes: ['#e2483d', '#fff6e0', '#ffe066'] });
  fillOnly(rect(-3000, 960, 8000, 3000), '#f2e2c9', { boil: 0 }); stroke([[-3000, 960], [5000, 960]], 6);
  for (let i = -6; i < 16; i++) stroke([[i * 160, 960], [i * 160 - 300, 1920]], 4, { line: '#e1cba9' });
  if (night) screenRectWorld('rgba(20,30,90,.28)');
}
const screenRectWorld = c => fillOnly(rect(-3000, -3000, 8000, 8000), c, { boil: 0 });
function counter(y = 1240) {
  shape(rr(40, y, 1000, 60, 10), { fill: '#f4efe4', lw: 7 });
  shape(rect(80, y + 60, 920, 520), { fill: '#8a6142', lw: 7, shade: () => { for (let i = 0; i < 6; i++) stroke([[80 + i * 160, y + 60], [80 + i * 160, y + 600]], 4, { line: '#6e4b32' }); } });
}
function storefront(t, n, awn) {
  BG('#7cc6f2');
  fillOnly(rect(-3000, -3000, 8000, 3300), '#a6dbf7', { boil: 0 });
  shape(rect(60, 420, 960, 1180), { fill: '#f4efe4', lw: 8 });
  shape(rr(120, 470, 840, 200, 18), { fill: '#e2483d', lw: 8 });
  text('LAVANDERIA ' + n, 540, 575, { font: '400 92px Bungee', fill: '#fff6e0', outlineW: 14 });
  const st = 9; for (let i = 0; i < st; i++) shape([[60 + i * 960 / st, 700], [60 + (i + 1) * 960 / st, 700], [60 + (i + 1) * 960 / st - 6, 830], [60 + i * 960 / st + 6, 830]], { fill: i % 2 ? '#fff6e0' : awn, lw: 6 });
  shape(rect(150, 880, 780, 520), { fill: '#bfe9ff', lw: 8, shade: () => { for (let i = 0; i < 3; i++) machine(290 + i * 250, 980, t + i, '#7cc6f2', '#58a8d6', { clothes: ['#e2483d', '#ffe066', '#3fd0c9'] }); fillOnly([[150, 880], [420, 880], [200, 1400], [150, 1400]], 'rgba(255,255,255,.35)', { boil: .2 }); } });
  stroke([[540, 880], [540, 1400]], 7);
  fillOnly(rect(-3000, 1600, 8000, 3000), '#9a9aa6', { boil: 0 }); stroke([[-3000, 1600], [5000, 1600]], 6);
  text('ABERTO 24H', 540, 1460, { font: '400 46px VT323', fill: '#e2483d' });
}

// ———————————————— shots ————————————————
const SH = {};
SH.two = (t, tq) => {
  const [cx, cy, z] = camLerp(t, 0, T.cuCaio, [540, 1080, 1.3], [540, 1050, 1.4], ss);
  cam(cx, cy, z);
  const ph = (hp) => phone(hp[0] - 8, hp[1] - 64, -.12, .78, { glow: 1, scr: bankScreen('PATRIMÔNIO', 'R$ 1.000.000') });
  sofaScene(t, { you: { look: [-.4, .6], armL: { h: [-70, 120], bend: -10, hold: ph } }, caio: { look: [.6, .1], armR: { h: [20, 150], bend: 18, hold: (hp) => phone(hp[0] + 6, hp[1] - 44, .1, .55, { cracked: true }) } } });
};
SH.cuCaio = (t, tq) => {
  const u = t - T.cuCaio;
  cam(330, 900 - u * 6, 2.15 + u * .03);
  const plead = { h: [60, 120], bend: 20, fist: true }, plead2 = { h: [-50, 128], bend: -20, fist: true };
  sofaScene(t, { caio: { look: [.75, -.1], turn: .5, nerv: .7, brow: 1.2, sweat: t * .8, armR: plead2, armL: plead }, you: { look: [-.4, .6] } });
};
SH.cuYou = (t, tq) => {
  const u = t - T.cuYou;
  cam(760, 880, 2.25 + u * .02);
  const ph = (hp) => phone(hp[0] - 8, hp[1] - 64, -.12, .78, { glow: 1, scr: bankScreen('PATRIMÔNIO', 'R$ 1.000.000') });
  const glance = seg(tq, T.cuYou + .2, T.cuYou + .5);
  sofaScene(t, { you: { look: [lerp(-.4, -.9, glance), lerp(.6, 0, glance)], turn: -.35, lid: .55, armL: { h: [-70, 120], bend: -10, hold: ph } } });
};
SH.phone = (t, tq) => {
  // insert: the phone fills the frame; then a rush into its screen
  reset(); BG('#e6d2ad');
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + t * .2; fillOnly([[540, 900], [540 + Math.cos(a) * 1800, 900 + Math.sin(a) * 1800], [540 + Math.cos(a + .12) * 1800, 900 + Math.sin(a + .12) * 1800]], '#efe0c2', { boil: .2 }); }
  const k = seg(t, T.rush, T.sw1 + .1), s = 5.4 * Math.pow(9, ei(k)), pin = s / 5.4;
  const intro = back(seg(q(t), T.phone, T.phone + .25), 1.6);
  push(); translate(540, 900 - 20 * (1 - intro) + 36 * (pin - 1)); scale(lerp(.7, 1, intro));
  // hand holding it
  shape(spline([[-170, 420], [-260, 200], [-240, 60], [-150, 30], [-60, 120], [-30, 420]]).map(p => [p[0] * pin, p[1] * pin]), { fill: YOU.skin, lw: 7 });
  phone(0, 0, 0, s, { glow: 1, scr: bankScreen('PATRIMÔNIO', 'R$ 1.000.000', 'SÓ VOCÊ VÊ ISSO') });
  shape(spline([[-300, 260], [-250, 200], [-226, 300], [-280, 340]]).map(p => [p[0] * pin, p[1] * pin]), { fill: YOU.skin, lw: 7 });   // thumb
  pop();
};
SH.laund = (t, tq) => {
  const [cx, cy, z] = camLerp(t, T.sw1, T.coins, [620, 1060, .95], [1560, 1040, 1.02]);
  cam(cx, cy, z);
  laundSet(t);
  foldTable(1600, 1240, 4);
  you18(t, tq);
};
function you18(t, tq, o = {}) {
  const ph = (tq * 1.1) % 1, up = Math.sin(ph * Math.PI);   // folding cycle
  const shirt = (hp) => { if (o.noShirt) return; fillOnly(rr(hp[0] - 10, hp[1] - 20, 150 - 60 * up, 70, 10), '#3fd0c9', { boil: .4 }); };
  const holdShirt = (hp) => shape(rr(hp[0] - 6, hp[1] - 26 - up * 30, 130 - 50 * up, 60 + up * 30, 10), { fill: '#3fd0c9', lw: 6 });
  person(YOU, Y(t, { x: 1860, y: 1510, face: -1, turn: .2, look: o.look || [.4, .3], lid: o.lid ?? .55, apron: '#ff7a6b',
    armR: o.armR || { h: [-120 - 30 * up, 40 - 60 * up], bend: 10, hold: o.noShirt ? null : holdShirt }, armL: o.armL || { h: [-110 - 30 * up, 60 - 60 * up], bend: -20 }, ...o.p }));
}
SH.coins = (t, tq) => {
  const u = t - T.coins;
  const z0 = [1500, 1020, 1.0], z1 = [1820, 900, 2.1];
  const [cx, cy, z] = camLerp(t, T.sil - .2, T.sil + .7, z0, z1);
  cam(cx, cy, z);
  laundSet(t);
  foldTable(1600, 1240, 5);
  // Arlindo walks in to machine 4 (x 890) and empties the coin box into his pouch
  const ax = lerp(1000, 1130, ss(seg(t, T.coins, T.coins + .9))), walking = t < T.coins + .9;
  const pour = seg(t, T.coins + 1.0, T.coins + 2.6);
  const pouchHold = (hp) => coinPouch(hp[0] + 10, hp[1] + 40, .8);
  person(ARLINDO, { t, x: ax, y: 1500, face: -1, turn: .3, look: [.6, .4], lid: .35, mouth: { o: 0, sm: .6 }, legs: walking ? [[Math.sin(q(t) * 12) * 18, 0], [-Math.sin(q(t) * 12) * 18, 0]] : null,
    armR: { h: [-70, 60], bend: 20, hold: pouchHold }, armL: { h: [-30, 160], bend: 10 } });
  if (pour > 0 && pour < 1) for (let i = 0; i < 6; i++) { const k = (pour * 4 + i / 6) % 1; coin(ax - 110 + Math.sin(i) * 10, 1060 + k * 160, 13, t * 9 + i); }
  const stare = seg(tq, T.coins + 1.4, T.coins + 1.8);
  const ficha = seg(t, VO.n7 + .25, VO.n7 + .75), bonk = t > VO.n7 + .75 && t < VO.n7 + 1.4;
  you18(t, tq, { look: [lerp(.4, .9, stare), lerp(.3, .1, stare)], lid: bonk ? .1 : lerp(.55, .4, stare), p: { wide: bonk ? 1.25 : 1, mouth: { o: bonk ? .35 : 0, sm: bonk ? .2 : -.2 }, brow: bonk ? 1 : 0 } });
  // "caiu a ficha": a coin drops on your head
  if (t > VO.n7 + .25 && t < VO.n7 + 2) {
    const hy = 1510 - 635, fy = ficha < 1 ? lerp(hy - 900, hy - 110, ei(ficha)) : hy - 110 - Math.sin(seg(t, VO.n7 + .75, VO.n7 + 1.3) * Math.PI) * 120;
    const fx = ficha < 1 ? 1860 : 1860 - seg(t, VO.n7 + .75, VO.n7 + 1.3) * 120;
    coin(fx, fy, 30, t * 14);
    if (bonk) for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + t * 3; shape(star4(1860 + Math.cos(a) * 110, hy - 120 + Math.sin(a) * 30, 16), { fill: GOLD2, lw: 4 }); }
  }
};
const star4 = (x, y, r) => [[x, y - r], [x + r * .28, y - r * .28], [x + r, y], [x + r * .28, y + r * .28], [x, y + r], [x - r * .28, y + r * .28], [x - r, y], [x - r * .28, y - r * .28]];
SH.split = (t, tq) => {
  const [cx, cy, z] = t < VO.n9 ? camLerp(t, T.sw2, VO.n9, [540, 560, 1.3], [540, 960, 1.0]) : camLerp(t, VO.n9, VO.n9 + 1.2, [540, 960, 1.0], [520, 1320, 1.25]);
  cam(cx, cy, z); CAMV = [cx, cy, z];
  const tl = worldToScreenY;
  // top panel
  push(); g.save(); g.beginPath(); g.rect(0, 0, W, Math.max(0, tl(940))); g.clip();
  partyPanel(t); g.restore(); pop();
  // bottom panel
  push(); g.save(); g.beginPath(); g.rect(0, tl(980), W, H); g.clip();
  const fill = seg(t, T.jar - .2, T.jar + 1.6);
  roomPanel(t, .15 + fill * .7);
  const drop = (tq - T.jar) % .55, dropping = t > T.jar - .1 && t < T.jar + 1.6;
  person(YOU, Y(t, { x: 700, y: 1900, s: .82, face: -1, turn: .3, look: [.6, .6], lid: .5, armR: { h: [-170, -10 + (dropping ? Math.max(0, .3 - drop) * 100 : 60)], bend: -20, fist: true }, armL: { h: [-20, 170], bend: -10 } }));
  if (dropping && drop < .35) coin(475, lerp(1200, 1300, drop / .35), 16, t * 10);
  g.restore(); pop();
  reset(); fillOnly(rect(-50, tl(940), W + 100, tl(980) - tl(940)), INK, { boil: 0 });
};
// screen y of a world y for the current camera (one world→screen function)
let CAMV = [540, 960, 1];
function worldToScreenY(y) { return H / 2 + (y - CAMV[1]) * CAMV[2]; }
SH.follow = (t, tq) => {
  reset(); BG('#8fe3c0');
  fillOnly(rect(0, 1500, W, 500), '#6cc7a4', { boil: 0 });
  const u = t - T.follow;
  cam(540, 960 - u * 8, 1 + u * .012);
  shape(rr(720, 300, 300, 230, 10), { fill: '#3b2e6b', lw: 7, shade: () => { for (let i = 0; i < 8; i++) dot(740 + hash(i) * 260, 320 + hash(i + 9) * 190, 3, '#fff6e0'); } });
  const talking = t > VO.n10 && t < VO.n10 + DURS.n10;
  person(YOU, Y(t, { x: 540, y: 1960, s: 1.45, turn: 0, look: [0, 0], lid: .38, mouth: { o: 0, sm: .35 }, armR: { h: [40, 150], bend: 20 }, armL: { h: [-30, 160], bend: -20 } }));
  followUI(t, 540, 1420, T.follow + .3, T.click);
};
function followUI(t, x, y, t0, tc) {
  const s = back(seg(q(t), t0, t0 + .3), 2), done = t >= tc;
  if (s <= 0) return;
  reset(); push(); translate(x, y); scale(s);
  shape(rr(-420, -70, 840, 140, 70), { fill: '#fff6e0', lw: 7 });
  shape(ell(-345, 0, 50, 50, 30), { fill: GOLD, lw: 6 });
  text('$', -345, 4, { font: '400 60px Bungee', fill: INK });
  text('POV MILIONÁRIO', -280, -16, { font: '800 40px "Baloo 2"', fill: INK, align: 'left' });
  text('EP 1 de muitos', -280, 26, { font: '800 28px "Baloo 2"', fill: '#6b5f80', align: 'left' });
  const pb = done ? back(seg(t, tc, tc + .2), 3) : 1;
  push(); translate(250, 0); scale(lerp(.85, 1, pb));
  shape(rr(-140, -46, 280, 92, 46), { fill: done ? '#9a9aa6' : '#ff2e4d', lw: 6 });
  text(done ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 4, { font: '800 40px "Baloo 2"', fill: '#fff' });
  pop();
  // hand cursor
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
SH.deal = (t, tq) => {
  const [cx, cy, z] = camLerp(t, T.sw3, T.sleep, [540, 1000, 1.08], [540, 1010, .96], ss);
  cam(cx, cy, z);
  l21Set(t);
  // Arlindo (left) gives the keys; você (right)
  const kt = seg(t, T.keys, T.keys + .55), sh = seg(t, T.shake, T.shake + .25) * (1 - seg(t, T.shake + 1.4, T.shake + 1.7));
  const shk = Math.sin(q(t) * 22) * 14 * sh;
  const giveA = kt < 1 ? { h: [lerp(40, 150, ss(seg(t, T.keys - .5, T.keys))), lerp(140, 40, ss(seg(t, T.keys - .5, T.keys)))], bend: 10, fist: true } : { h: [40, 150], bend: 10 };
  const armA = sh > 0 ? { h: [lerp(40, 158, sh), lerp(150, 46 + shk, sh)], bend: 10, fist: true } : giveA;
  const armY = sh > 0 ? { h: [lerp(-40, -170, sh), lerp(150, 136 + shk, sh)], bend: -10, fist: true } : kt >= 1 ? { h: [-60, 110], bend: -10, fist: true, hold: (hp) => keys(hp[0], hp[1] + 10, 1.5, Math.sin(t * 9) * .3) } : { h: [-40, 150], bend: -10 };
  person(ARLINDO, { t, x: 330, y: 1580, turn: .45, look: [.6, 0], lid: .3, mouth: { o: 0, sm: .7 }, armR: armA });
  const m = talk('y', t);
  person(YOU, Y(t, { x: 760, y: 1580, turn: -.35, look: [-.6, 0], lid: .48, mouth: { o: 0, sm: kt >= 1 ? .3 : -.1 }, armL: armY }));
  if (kt > 0 && kt < 1) { const p = [lerp(330 + 120, 760 - 120, kt), lerp(980, 1000, kt) - Math.sin(kt * Math.PI) * 140]; keys(p[0], p[1], 1.5, kt * 9); }
  counter(1330);
  shape(rr(400, 1302, 220, 40, 6), { fill: '#fff', lw: 5 });   // contract
  text('CONTRATO · 60x', 510, 1324, { font: '800 22px "Baloo 2"', fill: INK });
  if (kt >= 1) { push(); translate(800, 430); rotate(.18); const s = back(seg(q(t), T.keys + .55, T.keys + .8), 2.4); scale(s); shape(rr(-110, -36, 220, 72, 10), { fill: '#ffe066', lw: 6 }); text('NOVO DONO', 0, 3, { font: '800 36px "Baloo 2"', fill: INK }); pop(); }
};
SH.sleep = (t, tq) => {
  const u = t - T.sleep;
  cam(540, 1060 - u * 10, 1.0 + u * .03);
  l21Set(t, 1);
  // chair
  shape(rr(400, 1260, 280, 40, 10), { fill: '#8a6142', lw: 7 }); for (const x of [420, 660]) shape(rect(x - 10, 1300, 20, 200), { fill: '#6e4b32', lw: 5 });
  shape(rr(410, 1020, 260, 60, 14), { fill: '#8a6142', lw: 7 });
  person(YOU, Y(t, { x: 540, y: 1500, sit: 1, seat: 230, turn: .1, closed: true, headTilt: .28 + Math.sin(tq * 1.5) * .03, mouth: { o: .12 + .08 * Math.sin(tq * 3), sm: 0 }, armR: { h: [-60, 170], bend: 20 }, armL: { h: [60, 170], bend: -20 } }));
  for (let i = 0; i < 3; i++) { const k = ((t - T.sleep) * .6 + i / 3) % 1; text('Z', 680 + k * 120 + i * 10, 760 - k * 220, { font: `400 ${40 + k * 40}px Bungee`, fill: `rgba(255,246,224,${1 - k})`, outlineW: 6 }); }
  // coins flying from the machines into a growing pile
  for (let i = 0; i < 8; i++) { const k = ((t - T.sleep) * 1.2 + i / 8) % 1, m = i % 4, x0 = 150 + m * 260, x1 = 820 + (i % 3) * 30; coin(lerp(x0, x1, k), lerp(820, 1460, k) - Math.sin(k * Math.PI) * 260, 16, t * 8 + i); }
  const pile = 1 + seg(t, T.sleep, T.mg1) * 1.4;
  shape(spline([[700, 1500], [760, 1500 - 50 * pile], [860, 1500 - 70 * pile], [960, 1500 - 40 * pile], [1000, 1500]]), { fill: GOLD, lw: 7, shade: () => { for (let i = 0; i < 10; i++) stroke(arc(720 + hash(i) * 260, 1500 - hash(i + 3) * 60 * pile, 20, 8, 0, Math.PI, 8), 3, { line: GOLDS }); } });
};
function storeShot(t, tq, t0, n, awn) {
  const u = t - t0, k = eo(seg(t, t0, t0 + .28));
  cam(540, lerp(560, 1040, k), lerp(2.2, 1.0, k), u < .35 ? 14 * (1 - u / .35) : 0, t);
  storefront(t, n, awn);
  person(YOU, Y(t, { x: 540, y: 1700, turn: 0, look: [0, 0], lid: .5, mouth: { o: 0, sm: .2 }, armR: { h: [-40, 120], bend: 30, fist: true }, armL: { h: [40, 120], bend: -30, fist: true } }));
}
SH.store2 = (t, tq) => storeShot(t, tq, T.mg1, 2, '#e2483d');
SH.store3 = (t, tq) => storeShot(t, tq, T.mg2, 3, '#3b6fd6');
const tablePhone = (t, o = {}) => () => phone(690, 1436, -.08, .62, { glow: o.glow ?? 0, buzz: o.buzz ?? 0, t, scr: o.glow ? bankScreen('PIX RECEBIDO', '+R$ 27.400', 'LAVANDERIAS', { col: '#e09a12' }) : null });
SH.home = (t, tq) => {
  const [cx, cy, z] = camLerp(t, T.sw4, T.buzz, [540, 1040, 1.12], [540, 1060, 1.26], ss);
  cam(cx, cy, z);
  const eat = (q(t) * .8) % 1 < .3;
  sofaScene(t, { cupOnTable: false, tablePhone: tablePhone(t),
    you: { look: [-.3, .2], lid: .55, armL: { h: [-50, 70 - (eat ? 50 : 0)], bend: -40, hold: (hp) => noodleCup(hp[0] + 10, hp[1] + 40, .7, t) } },
    caio: { look: [.3, .7], turn: .3, nerv: .1, armR: { h: [30, 140], bend: 18, hold: (hp) => phone(hp[0] + 6, hp[1] - 44, .1, .55, { cracked: true }) } } });
};
SH.buzz = (t, tq) => {
  const u = t - T.buzz;
  cam(690, 1420, 4.0 + u * .1);
  const bz = (u > .05 && u < .45) || (u > .7 && u < 1.05) ? 1 : 0;
  sofaScene(t, { cupOnTable: false, tablePhone: tablePhone(t, { glow: 1, buzz: bz }), you: { armL: { h: [-50, 70], bend: -40, hold: (hp) => noodleCup(hp[0] + 10, hp[1] + 40, .7, t) } } });
};
SH.eyes = (t, tq) => {
  const u = t - T.eyes;
  cam(320, 880, 3.3 + u * .05);
  sofaScene(t, { cupOnTable: false, tablePhone: tablePhone(t, { glow: 1 }), caio: { look: [.55, .75], turn: .3, nerv: .9, wide: lerp(1, 1.28, eo(seg(t, T.eyes + .1, T.eyes + .35))), brow: 1.4, sweat: t, mouth: { o: 0, sm: -.6 } } });
};
SH.cuYou2 = (t, tq) => {
  cam(770, 880, 2.25);
  sofaScene(t, { cupOnTable: false, tablePhone: tablePhone(t, { glow: 1 }), you: { look: [-.9, .1], turn: -.35, lid: .58, blink: Math.abs(t - (T.cuYou2 + .3)) < .1, armL: { h: [-50, 70], bend: -40, hold: (hp) => noodleCup(hp[0] + 10, hp[1] + 40, .7, t) } } });
};
SH.cuCaio2 = (t, tq) => {
  const u = t - T.cuCaio2;
  cam(330, 900, 2.15 + u * .1);
  sofaScene(t, { cupOnTable: false, tablePhone: tablePhone(t, { glow: 1 }), caio: { look: [.85, 0], turn: .5, nerv: 1, wide: 1.25, brow: 1.4, sweat: t, armR: { h: [80, -40], bend: 30 } } });
};
SH.end = (t, tq) => {
  reset(); BG('#2a1838');
  vortex(540, 760, 900, t * .5, .35);
  screenRect('#2a1838', .55);
  const s = back(seg(q(t), T.end, T.end + .3), 2.4);
  reset(); push(); translate(540, 620); scale(s); rotate(-.06);
  text('EP 2', 14, 18, { font: '400 300px Bungee', fill: GOLDS, outlineW: 26 });
  text('EP 2', 0, 0, { font: '400 300px Bungee', fill: GOLD, outlineW: 26 });
  pop();
  const b = back(seg(q(t), T.end + .35, T.end + .6), 2);
  reset(); push(); translate(540, 900); scale(b); rotate(.03);
  shape(rr(-420, -66, 840, 132, 20), { fill: '#e2483d', lw: 8 });
  text('O SEGREDO VAZOU', 0, 6, { font: '800 74px "Baloo 2"', fill: '#fff6e0', outlineW: 10 });
  pop();
  followUI(t, 540, 1180, T.end + .7, VO.n17 + 1.3);
};
// gold vortex (the phone's swirl): rotating spiral arms, flat colours, ink outline
function vortex(cx, cy, R, t, a = 1) {
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

// ———————————————— screen layer ————————————————
function wipe(t) {
  for (const [tc, hw] of WIPES) {
    const d = Math.abs(t - tc); if (d > hw) continue;
    const u = 1 - d / hw;
    reset(); vortex(540, 960, 1500 * Math.pow(u, .6), t);
    if (d < .03) screenRect('#fff6d6', .6);
  }
}
function titleCard(t) {
  if (t > T.cuCaio) return;
  const s = back(seg(q(t), 0, .25), 2.2);
  reset(); push(); translate(540, 250); scale(s); rotate(-.03);
  shape(rr(-470, -120, 940, 240, 30), { fill: '#fff6e0', lw: 9 });
  text('POV:', -400, -52, { font: '400 64px Bungee', fill: '#e2483d', align: 'left' });
  text('você ficou', -228, -50, { font: '800 64px "Baloo 2"', fill: INK, align: 'left' });
  text('MILIONÁRIO AOS 23', 0, 50, { font: '400 76px Bungee', fill: GOLD, outlineW: 14 });
  push(); translate(370, -60); rotate(.14); shape(rr(-70, -32, 140, 64, 16), { fill: '#e2483d', lw: 6 }); text('EP 1', 0, 4, { font: '400 40px Bungee', fill: '#fff' }); pop();
  pop();
}
function tag(t) {
  for (const [a, b, id, desc, bg, fg] of TAGS) {
    if (t < a || t >= b) continue;
    const n = Math.floor((t - a) * 40), s1 = id.slice(0, n), s2 = desc.slice(0, Math.max(0, n - id.length));
    reset(); push(); translate(50, 250); scale(back(seg(t, a, a + .18), 2.2));
    shape(rr(0, 0, 360, 116, 12), { fill: bg, lw: 7 });
    text('▶ ' + s1 + (n < id.length && Math.floor(t * 6) % 2 ? '█' : ''), 22, 38, { font: '400 56px VT323', fill: fg, align: 'left' });
    text(s2, 24, 86, { font: '400 38px VT323', fill: fg, align: 'left' });
    pop();
  }
}
function netAt(t) {
  if (t <= NET[0][0]) return NET[0][1];
  for (let i = 1; i < NET.length; i++) if (t < NET[i][0]) { const [a, va] = NET[i - 1], [b, vb] = NET[i]; return lerp(va, vb, eo((t - a) / (b - a))); }
  return NET[NET.length - 1][1];
}
function netHUD(t) {
  const a0 = T.sw1 + .3, a1 = T.buzz;
  if (t < a0 || t > a1) return;
  const v = netAt(t), s = back(seg(t, a0, a0 + .25), 2);
  const mil = seg(t, T.million, T.million + .6), flash = t > T.million && t < T.million + .5;
  if (t > T.million && t < T.million + 1) for (let i = 0; i < 10; i++) { const k = seg(t, T.million, T.million + 1), a = i / 10 * TAU; reset(); shape(star4(540 + Math.cos(a) * 380 * eo(k), 150 + Math.sin(a) * 160 * eo(k), 26 * (1 - k)), { fill: GOLD2, lw: 4 }); }
  reset(); push(); translate(540, 150); scale(s * (1 + .18 * Math.sin(mil * Math.PI)));
  shape(rr(-300, -78, 600, 156, 24), { fill: flash ? GOLD : '#1b1422', lw: 8 });
  text('PATRIMÔNIO', 0, -42, { font: '400 44px VT323', fill: flash ? INK : GOLD2 });
  text(fmt(v), 0, 24, { font: '800 78px "Baloo 2"', fill: flash ? '#fff' : GOLD, outlineW: flash ? 10 : 0 });
  pop();
}
function gains(t) {
  for (const [t0, x, y, str, big] of GAINS) {
    const u = t - t0; if (u < 0 || u > 1.8) continue;
    const s = back(seg(u, 0, .22), 2.6), a = 1 - seg(u, 1.4, 1.8), yy = y - eo(seg(u, 0, 1.8)) * 120;
    reset(); push(); translate(x, yy); scale(s * (big ? 1 : .8)); rotate(-.05);
    g.globalAlpha = a;
    shape(ell(-g_w(str) / 2 - 40, 0, 34, 34, 24), { fill: GOLD, lw: 6, alpha: a });
    text('$', -g_w(str) / 2 - 40, 3, { font: '400 44px Bungee', fill: INK });
    text(str, 10, 4, { font: '800 74px "Baloo 2"', fill: GOLD, outlineW: 14 });
    g.globalAlpha = 1;
    pop();
  }
}
const g_w = s => { g.save(); g.font = '800 74px "Baloo 2"'; const w = g.measureText(s).width; g.restore(); return w; };
// subtitles
const WHO = { c: ['CAIO', '#e3a72a'], y: ['VOCÊ', '#545a69'] };
const CUTS = [T.sw1, T.sil, T.sw2, T.follow, T.sw3, T.mg1, T.mg2, T.sw4, T.buzz, T.end];
const SUBS = Object.entries(VO).map(([id, t0]) => {
  const L = LINE[id], d = DURS[id];
  let t1 = t0 + Math.max(d + .8, 1.8);
  const nxt = Object.values(VO).filter(v => v > t0 + .05).sort((a, b) => a - b)[0];
  if (nxt != null && t1 > nxt - .02) t1 = Math.max(nxt - .02, t0 + d + .1);
  const cut = CUTS.find(c => c > t0 + .1); if (cut && t1 > cut) t1 = Math.max(cut - .02, t0 + d + .05);
  return { id, t0, t1: +t1.toFixed(3), who: L.who, text: L.sub };
});
function wrap(str, maxW, font) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = font;
  const words = str.split(' '), out = []; let cur = '';
  for (const w of words) { const c = cur ? cur + ' ' + w : w; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = w; } else cur = c; }
  if (cur) out.push(cur); return out;
}
function subs(t) {
  const s = SUBS.find(s => t >= s.t0 && t < s.t1); if (!s) return;
  const font = '800 60px "Baloo 2"', lines = wrap(s.text, 900, font), pop_ = back(seg(t, s.t0, s.t0 + .12), 2);
  const y0 = 1690 - (lines.length - 1) * 74;
  reset();
  if (WHO[s.who]) {
    const [nm, col] = WHO[s.who];
    push(); translate(540, y0 - 76); scale(pop_);
    shape(rr(-80, -26, 160, 52, 16), { fill: col, lw: 5 });
    text(nm, 0, 3, { font: '800 32px "Baloo 2"', fill: '#fff' });
    pop();
  }
  lines.forEach((l, k) => { push(); translate(540, y0 + k * 74); scale(lerp(.9, 1, pop_)); text(l, 0, 0, { font, fill: '#fff', outlineW: 13 }); pop(); });
}

function render(t) {
  frame(t);
  screenRect('#000');
  const [, , name] = shotAt(t), tq = q(t);
  CAMV = [540, 960, 1];
  SH[name](t, tq);
  wipe(t);
  titleCard(t);
  tag(t);
  netHUD(t);
  gains(t);
  if (CAPA) { capaBadge(t); return; }
  subs(t);
}
const CAPA = new URLSearchParams(location.search).get('capa') === '1';
function capaBadge(t) {   // cover: the secret on screen instead of a caption
  reset(); push(); translate(540, 1640); rotate(-.04);
  shape(rr(-430, -110, 860, 220, 30), { fill: '#1b1422', lw: 9 });
  text('PATRIMÔNIO', 0, -52, { font: '400 54px VT323', fill: GOLD2 });
  text('R$ 1.000.000', 0, 26, { font: '800 112px "Baloo 2"', fill: GOLD });
  pop();
  push(); translate(880, 1460); rotate(.12); shape(rr(-150, -40, 300, 80, 20), { fill: '#e2483d', lw: 7 }); text('E NINGUÉM SABE', 0, 4, { font: '800 38px "Baloo 2"', fill: '#fff' }); pop();
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
  add('slurp', 1.1, { v: .6 }); add('shimmer', .2, { v: .5 });
  add('cut', T.cuCaio, { v: .4 }); add('squeak', T.cuCaio + .1, { v: .5 }); add('cut', T.cuYou, { v: .4 });
  add('shimmer', T.phone + .05); add('whoosh', T.phone, { v: .5 }); add('rise', T.rush, { d: T.sw1 - T.rush });
  for (const [tc] of WIPES) add('swirl', tc - .22);
  for (const [t0, , , , big] of GAINS) add('kaching', t0, { v: big ? 1 : .7 });
  add('steps', T.coins, { d: .9 }); for (let i = 0; i < 7; i++) add('clink', T.coins + 1.0 + i * .22, { v: .6 });
  add('tlim', VO.n7 + .75); add('boing', VO.n7 + .78, { v: .5 });
  for (let i = 0; i < 3; i++) add('jarcoin', T.jar + i * .55 + .3);
  add('pop', T.follow + .3); add('click', T.click); add('sparkle', T.click + .02);
  add('jangle', T.keys + .1); add('jangle', T.keys + .55, { v: .6 }); add('pop', T.keys + .6, { v: .6 }); add('squeeze', T.shake + .2);
  add('snore', T.sleep + .2, { d: T.mg1 - T.sleep - .2 });
  add('crash', T.mg1); add('crash', T.mg2);
  add('ding', T.million, { v: 1 });
  add('buzz', T.buzz + .05, { d: .4 }); add('buzz', T.buzz + .7, { d: .35 });
  add('gulp', T.eyes + .5); add('cut', T.eyes, { v: .3 });
  add('sting', T.end); add('pop', T.end + .35); add('pop', T.end + .7, { v: .6 }); add('click', VO.n17 + 1.3); add('sparkle', VO.n17 + 1.32);
  return ev.sort((a, b) => a.t - b.t);
}

window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS; window.T = T; window.VO = VO;
window.TEXTS = t => { const s = SUBS.find(s => t >= s.t0 && t < s.t1); return s ? [{ id: s.id, text: s.text, x0: 90, y0: 1600, x1: 990, y1: 1760 }] : []; };
for (const f of ['800 60px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
window.READY = true;
