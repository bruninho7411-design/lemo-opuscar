// POV: você ficou milionário aos 23 — EP 5 · O dono (Sci-Fi Sitcom Toon, vertical 1080×1920)
// The character shots are 2D animation from Wan 2.7 (ai/v_*.mp4, lip-synced to the VoiceStudio lines, from GPT Image keyframes in
// the EP 1 style; see CREDITS), drawn here frame by frame under a code camera. Inserts, graphics, captions and the line boil are drawn
// by the toon engine; the rooms are illustrated plates (bg/*.png) in three boiled drawings cycled at 12 fps. ?code=1 renders the
// earlier all-code version of every shot (chars.js rigs).
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, quad, dot, text, screenRect, reset, getM, S } from './toon.js';
import { person, YOU, CAIO, ARLINDO, ARL_BOSS, phone, coin, keys, hand, GOLD, GOLD2, GOLDS } from './chars.js';
import { q, build, EP } from './story.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {}, LIPS = (await J('voices/lips.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
for (const l of LINES) if (DURS[l.id] == null) DURS[l.id] = .5 + l.text.length * .062;
const { VO, T, DUR, SHOTS, WIPES, TAGS, CUES } = build(DURS);
const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
const Q = new URLSearchParams(location.search), CAPA = Q.get('capa') === '1';

// —— plates: 1520×2688 illustrations drawn into the 1080×1920 world ——
const PX = 1080 / 1520, PY = 1920 / 2688;
const IMG = {};
await Promise.all(['office', 'office_rev', 'wall', 'counter21', 'front', 'duo'].map(async n => {
  IMG[n] = await Promise.all([0, 1, 2].map(k => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = `bg/${n}_${k}.jpg`; })));
}));
function plate(name, from = 0) {   // from: first plate row of the front layer (desk, counter); 0 = the whole plate
  const img = IMG[name][S.boil], m = getM();
  g.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
  g.drawImage(img, 0, from, 1520, 2688 - from, 0, from * PY, 1080, (2688 - from) * PY);
  g.setTransform(1, 0, 0, 1, 0, 0);
}
// —— AI shots: each clip as 30 fps stills (ai/frames.sh → ai/f/<clip>/NNNN.jpg, 1086×1920) ——
const CODE = Q.get('code') === '1', AIN = (await J('ai/f/index.json')) || {}, FC = new Map();
function still(src) {
  if (!FC.has(src)) { FC.set(src, new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; })); if (FC.size > 48) FC.delete(FC.keys().next().value); }
  return FC.get(src);
}
const clipFrame = (clip, ct) => `ai/f/${clip}/${String(clamp(Math.round(ct * 30), 0, AIN[clip] - 1) + 1).padStart(4, '0')}.jpg`;
function aiDraw(img, [cx, cy, z, sh = 0], t) {
  cam(cx, cy, z, sh, t); const m = getM();
  g.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]); g.imageSmoothingQuality = 'high';
  g.drawImage(img, -3, 0, 1086, 1920); g.setTransform(1, 0, 0, 1, 0, 0);
}
const DESK = 1598, DESK_REV = 1948, COUNTER = 1550;   // plate rows where the front layers start
const BRASS = '#d4a640', VIOLET = '#4b2a86', MARK = '#ffe066', RED = '#e2483d', CREAM = '#fff6e0';

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
function Y(t, o = {}) { const m = talk('y', t), tq = q(t); return { t, s: 1, lid: .5, blink: blinks(t, 3), mouth: { o: m.o, w: m.w, sm: -.2 }, sq: 1 + .008 * Math.sin(tq * 2.2), ...o }; }
function C(t, o = {}) { const m = talk('c', t), tq = q(t); return { t, s: 1, nerv: .35, blink: blinks(t, 9), mouth: { o: m.o * 1.25, w: m.w, sm: -.3 }, sq: 1 + .012 * Math.sin(tq * 3), headTilt: m.talking ? (m.o - .3) * .1 : 0, ...o }; }
function A(t, o = {}) {   // Seu Arlindo: amused, slow, never blinks much
  const m = talk('a', t), tq = q(t);
  return { t, s: 1, lid: .38, blink: blinks(t, 21), brow: -.25, mouth: { o: m.o, w: m.w * .9, sm: m.talking ? .35 : .65 }, sq: 1 + .006 * Math.sin(tq * 1.6), headTilt: m.talking ? (m.o - .3) * .06 : 0, ...o };
}
function cam(cx, cy, z, shake = 0, t = 0) {   // never shows past the edge of the 1080×1920 world (the plates end there)
  cx = clamp(cx, W / 2 / z, W - W / 2 / z); cy = clamp(cy, H / 2 / z, H - H / 2 / z);
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}
const camLerp = (t, t0, t1, a, b, e = eio) => { const u = e(seg(t, t0, t1)); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; };
const star4 = (x, y, r) => [[x, y - r], [x + r * .28, y - r * .28], [x + r, y], [x + r * .28, y + r * .28], [x, y + r], [x - r * .28, y + r * .28], [x - r, y], [x - r * .28, y - r * .28]];
function burst(x, y, t, t0, n = 8, R = 160, col = MARK) {   // impact lines
  const k = seg(t, t0, t0 + .3); if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + .3, r0 = R * (.45 + .55 * eo(k)), r1 = r0 + 60 * (1 - k); stroke([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 7, { line: col }); }
}

// ———————————————— the office (front: Arlindo behind the desk) ————————————————
// big violet chair: the back (turned away) or the front frame around whoever sits in it; kx = horizontal squash for the spin
function chair(x, y, kx, front) {
  push(); translate(x, y); scale(Math.max(.04, kx), 1);
  if (!front) {
    shape(rr(-200, -560, 400, 600, 90), { fill: '#5a2c86', lw: 8, shade: () => { fillOnly(rr(40, -560, 180, 620, 60), '#45206a', { boil: .3 }); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) dot(-100 + c * 100 + (r % 2) * 50, -470 + r * 120, 7, '#2d1347'); } });
    for (let c = 0; c < 3; c++) stroke([[-130 + c * 130, -520], [-130 + c * 130, 0]], 4, { line: '#2d1347' });
  } else {
    shape(rr(-215, -600, 430, 640, 96), { fill: '#5a2c86', lw: 8, shade: () => fillOnly(rr(60, -600, 180, 660, 60), '#45206a', { boil: .3 }) });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) dot(-110 + c * 110 + (r % 2) * 55, -520 + r * 120, 7, '#2d1347');
  }
  pop();
}
function armrests(x, y, kx) { push(); translate(x, y); scale(Math.max(.04, kx), 1); for (const sx of [-1, 1]) shape(rr(sx * 235 - 45, -170, 90, 200, 36), { fill: '#5a2c86', lw: 7, shade: () => fillOnly(rect(sx * 235 + 5, -180, 60, 220), '#45206a', { boil: .3 }) }); pop(); }
function omegaPlaque(x, y, s = 1) {
  push(); translate(x, y); scale(s);
  shape(ell(0, 0, 74, 74, 40), { fill: BRASS, lw: 7, shade: () => fillOnly(ell(26, 20, 60, 64, 30), '#b08530', { boil: .3 }) });
  shape(ell(0, 0, 56, 56, 34), { fill: null, lw: 4 });
  text('Ω', 0, 6, { font: '800 84px "Baloo 2"', fill: INK });
  pop();
}
// one function for every front office shot: o.spin (0..1 through the turn), o.arl (pose), o.you (pose or null), o.receipt (0..1)
function officeFront(t, o = {}) {
  plate('office');
  const sp = o.spin ?? 1, a = sp * Math.PI, turned = sp >= .5;
  const kx = turned ? Math.max(.06, -Math.cos(a)) * (1 + .1 * Math.sin(seg(sp, .5, 1) * Math.PI)) : Math.max(.06, Math.cos(a));
  push(); translate(540, 1200); scale(.9); translate(-540, -1200); chair(540, 1200, kx, turned); pop();
  if (turned) {
    push(); translate(540, 0); scale(kx, 1); translate(-540, 0);
    person(ARL_BOSS, A(t, { x: 540, y: 1330, s: 1.0, sit: 1, seat: 190, turn: 0, look: [0, .05],
      armL: { h: [70, 130], bend: -16 }, armR: { h: [-70, 130], bend: 16 }, ...o.arl }));
    pop();
    push(); translate(540, 1200); scale(.9); translate(-540, -1200); armrests(540, 1200, kx); pop();
  }
  plate('office', DESK);
  omegaPlaque(540, 1325, .95);
  if (o.receipt) receiptOnDesk(t, o.receipt);
  if (o.coinDown) { coin(600, 1158, 22, 0); }
  if (o.you) person(YOU, Y(t, o.you));
}
function receiptOnDesk(t, k) {
  push(); translate(650, 1150); rotate(-.06); scale(back(clamp(k, 0, 1), 2.2));
  shape([[-130, -20], [130, -28], [140, 22], [-140, 28]], { fill: '#fffdf4', lw: 6 });
  text('PARCELA 60/60', -10, -6, { font: '800 24px "Baloo 2"', fill: INK });
  push(); translate(80, 6); rotate(-.2); shape(rr(-50, -16, 100, 32, 6), { fill: null, lw: 5, line: '#1d7a4a' }); text('PAGO', 0, 2, { font: '400 24px Bungee', fill: '#1d7a4a' }); pop();
  pop();
}

// ———————————————— the office, reverse: você and Caio in front of the doors ————————————————
function officeRev(t, o = {}) {
  plate('office_rev');
  person(CAIO, C(t, { x: 360, y: 1640, s: .98, turn: .25, look: [.35, -.1], ...o.caio }));
  person(YOU, Y(t, { x: 730, y: 1650, s: 1.0, turn: -.15, look: [-.15, -.1], ...o.you }));
  plate('office_rev', DESK_REV);
}

// ———————————————— shots ————————————————
const SH = {};
SH.reveal = (t, tq) => {
  const [cx, cy, z] = camLerp(t, 0, T.cuArl, [540, 980, 1.0], [540, 930, 1.14], ss);
  cam(cx, cy, z, t > T.spin + .35 && t < T.spin + .6 ? 6 : 0, t);
  const sp = seg(t, T.spin, T.spin + .5);
  officeFront(t, { spin: eo(sp), arl: { mouth: { o: 0, sm: .75 }, look: [0, .1] } });
  burst(540, 860, t, T.spin + .45, 10, 330, '#ff7ad9');
};
SH.cuArl = (t, tq) => {
  const u = t - T.cuArl;
  cam(540, 840, 1.9 + u * .04);
  // the coin goes up from his right hand and comes back
  const k = seg(t, T.flip, T.flip + .9), up = Math.sin(k * Math.PI);
  officeFront(t, { arl: { brow: lerp(-.25, .3, ss(seg(t, VO.a1, VO.a1 + .4))), look: [0, .1],
    armR: k > 0 && k < 1 ? { h: [-40, -10], bend: 30, fist: true } : { h: [-62, 120], bend: 16 } } });
  if (k > 0 && k < 1) { cam(540, 840, 1.9 + u * .04); coin(470, 760 - up * 260, 24, t * 30); }
};
SH.cuCaio = (t, tq) => {
  const u = t - T.cuCaio;
  cam(372, 1150, 2.05 + u * .05, u < .25 ? 10 * (1 - u / .25) : 0, t);
  officeRev(t, { caio: { nerv: 1, wide: 1.3, brow: 1.5, sweat: t * 1.4, look: [.1, -.15], turn: .1, armR: { h: [130, -80], bend: 30 } } });
};
SH.phone = (t, tq) => {
  const u = t - T.phone, rk = seg(t, T.rush, T.sw1), z = lerp(1.7, 9, ei(rk));
  const P = [730 + 120, 1010];   // the phone in your right hand (world)
  cam(lerp(700, P[0], ei(rk)), lerp(960, P[1], ei(rk)), z + u * .02);
  officeRev(t, { you: { look: [.55, .55], turn: -.05, lid: .5,
    armR: { h: [-30, -150], bend: 40, hold: (hp) => phone(hp[0] + 30, hp[1] - 40, .08, .8, { glow: 1, t, scr: contractScreen }) } },
    caio: { look: [.9, .3], turn: .5, nerv: .5 } });
};
const contractScreen = () => {
  fillOnly(rect(-44, -84, 88, 30), VIOLET, { boil: .2 }); text('PDF', 0, -68, { font: '800 16px "Baloo 2"', fill: '#fff' });
  text('CONTRATO', 0, -34, { font: '800 14px "Baloo 2"', fill: INK });
  for (let k = 0; k < 6; k++) fillOnly(rr(-34, -18 + k * 13, 68 - (k % 3) * 12, 6, 3), '#d6ccb4', { boil: .2 });
  fillOnly(rr(-34, 64, 68, 8, 3), MARK, { boil: .2 });
};
SH.deal = (t, tq) => {
  const [cx, cy, z] = camLerp(t, T.sw1, T.contract, [540, 900, 1.22], [540, 880, 1.32], ss);
  cam(cx, cy, z);
  plate('counter21');
  text('LAVANDERIA DO SEU ARLINDO', 540, 352, { font: '800 40px "Baloo 2"', fill: '#1f4fa8' });
  const kt = seg(t, T.keys, T.keys + .55);
  const giveA = kt < 1 ? { h: [lerp(40, 150, ss(seg(t, T.keys - .5, T.keys))), lerp(140, 40, ss(seg(t, T.keys - .5, T.keys)))], bend: 10, fist: true } : { h: [40, 150], bend: 10 };
  person(ARLINDO, A(t, { x: 330, y: 1345, s: .9, turn: .45, look: [.6, 0], lid: .3, mouth: { o: 0, sm: .7 }, brow: .2, armR: giveA }));
  person(YOU, Y(t, { x: 760, y: 1345, s: .92, turn: -.35, look: [-.6, 0], lid: .48, mouth: { o: 0, sm: kt >= 1 ? .3 : -.1 },
    armL: kt >= 1 ? { h: [-60, 110], bend: -10, fist: true, hold: (hp) => keys(hp[0], hp[1] + 10, 1.4, Math.sin(t * 9) * .3) } : { h: [-40, 150], bend: -10 } }));
  if (kt > 0 && kt < 1) { const p = [lerp(450, 640, kt), lerp(925, 945, kt) - Math.sin(kt * Math.PI) * 140]; keys(p[0], p[1], 1.4, kt * 9); }
  plate('counter21', COUNTER);
  // the contract on the counter, "60x" stamped on "parcelado"
  push(); translate(540, 1190); rotate(-.04);
  shape([[-170, -50], [170, -58], [180, 46], [-180, 52]], { fill: '#fffdf4', lw: 6 });
  text('CONTRATO', 0, -22, { font: '800 34px "Baloo 2"', fill: INK });
  for (let k = 0; k < 2; k++) fillOnly(rr(-140, 4 + k * 18, 280 - k * 60, 8, 4), '#d6ccb4', { boil: .2 });
  const sk = seg(q(t), T.sixty, T.sixty + .18);
  if (sk > 0) { push(); translate(110, 4); rotate(-.25); scale(lerp(2.2, 1, eo(sk))); shape(rr(-62, -30, 124, 60, 10), { fill: null, lw: 6, line: RED }); text('60x', 0, 4, { font: '400 40px Bungee', fill: RED }); pop(); }
  pop();
};
SH.contract = (t, tq) => {
  const u = t - T.contract;
  reset(); fillOnly(rect(0, 0, W, H), '#a8703f', { boil: 0 });
  for (let i = 0; i < 9; i++) stroke(spline([[-50, 120 + i * 220], [400, 150 + i * 220 + hash(i) * 40], [1130, 110 + i * 220]], false), 4, { line: '#8e5c32' });
  cam(540, 960 + u * 6, 1.0 + u * .015);
  push(); translate(540, 980); rotate(-.035);
  shape([[-430, -760], [430, -780], [450, 760], [-440, 780]], { fill: '#fffdf4', lw: 8, shade: () => fillOnly([[250, -800], [480, -800], [480, 800], [300, 800]], '#efe9da', { boil: .3 }) });
  text('CONTRATO DE COMPRA E VENDA', 0, -660, { font: '800 46px "Baloo 2"', fill: INK });
  text('Lavanderia do Seu Arlindo · 60 parcelas', 0, -600, { font: '700 34px "Baloo 2"', fill: '#5b5368' });
  for (let k = 0; k < 16; k++) fillOnly(rr(-360, -520 + k * 44, 720 - hash(k) * 160, 14, 7), '#d6ccb4', { boil: .2 });
  // fine print block (what you never read)
  for (let k = 0; k < 4; k++) fillOnly(rr(-360, 230 + k * 22, 700 - k * 40, 6, 3), '#e2dccb', { boil: .2 });
  stroke(spline([[-340, 520], [-300, 470], [-260, 530], [-210, 480], [-170, 520]], false), 5, { line: '#3b3b7a' });
  stroke(spline([[120, 520], [170, 480], [200, 530], [260, 470], [320, 515]], false), 5, { line: '#3b3b7a' });
  text('Arlindo', -255, 580, { font: '700 28px "Baloo 2"', fill: '#6b6b80' }); text('Você', 220, 580, { font: '700 28px "Baloo 2"', fill: '#6b6b80' });
  pop();
  // the magnifier slides in over the fine print; inside it the clause is readable
  const lk = eo(seg(t, T.lens - .45, T.lens + .15)), LX = lerp(1300, 520, lk), LY = lerp(1400, 1110, lk), R = 290;
  if (lk > 0) {
    const Pc = shape(ell(LX, LY, R, R, 70), { fill: '#fffdf4', lw: 0, line: null });
    g.save(); g.clip(Pc);
    push(); translate(LX, LY); rotate(-.035);
    text('CLÁUSULA 7', 0, -150, { font: '400 52px Bungee', fill: RED });
    const mk = seg(t, T.mark, T.mark + .55);
    if (mk > 0) fillOnly(rr(-250, -10, 500 * eo(mk), 92, 10), MARK, { boil: .3 });
    ['Atrasou 1 parcela,', 'a lavanderia volta', 'para o VENDEDOR.'].forEach((l, k) => text(l, 0, -70 + k * 74, { font: '800 56px "Baloo 2"', fill: INK }));
    pop(); g.restore();
    shape(ell(LX, LY, R, R, 70), { fill: null, lw: 14 }); shape(ell(LX, LY, R + 22, R + 22, 70), { fill: null, lw: 8 });
    stroke(arc(LX - 90, LY - 90, 150, 150, Math.PI * 1.05, Math.PI * 1.4, 10), 10, { line: 'rgba(255,255,255,.8)' });
    shape(noodleRect(LX + R * .72, LY + R * .72, LX + R * 1.45, LY + R * 1.45, 64), { fill: '#3b2a1a', lw: 8 });
  }
};
const noodleRect = (x0, y0, x1, y1, w) => { const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * w / 2, ny = Math.cos(a) * w / 2; return [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]; };
SH.wall = (t, tq) => {
  const k = eio(seg(t, T.wall, T.card)), u = t - T.card;
  cam(lerp(300, 540, k), lerp(560, 790, k), lerp(1.55, 1.95, k) + Math.max(0, u) * .04);
  plate('wall');
  // the centre card: written on as it is said
  push(); translate(540, 778); rotate(-.03);
  const wk = seg(t, T.card, T.card + .7), lines = ['META:', '1 PARCELA', 'ATRASADA'];
  lines.forEach((l, i) => { const n = Math.floor(clamp(wk * 3 - i, 0, 1) * l.length); if (n) text(l.slice(0, n), 0, -30 + i * 29, { font: '400 22px Bungee', fill: RED }); });
  const ck = seg(t, T.card + .7, T.card + 1.1);
  if (ck > 0) { const P = []; for (let i = 0; i <= 40 * ck; i++) { const a = -2.6 + i / 40 * TAU * 1.05; P.push([Math.cos(a) * 112 + Math.sin(i * .7) * 3, Math.sin(a) * 72]); } if (P.length > 1) stroke(P, 7, { line: RED }); }
  pop();
};
SH.cuYou = (t, tq) => {
  const u = t - T.cuYou;
  cam(728, 1000, 2.05 + u * .06);
  officeRev(t, { you: { look: [-.02, -.05], turn: -.05, lid: .58, brow: -.3 } });
  // glasses glint sweeps across both lenses after the line
  const gk = seg(t, VO.y1 + DURS.y1 - .1, VO.y1 + DURS.y1 + .35);
  if (gk > 0 && gk < 1) for (const sx of [-1, 1]) { const x = 728 - 4 + sx * 31 * .98 + lerp(-26, 26, gk), y = 1650 - 300 - 250 - 94 * .9 - 4 - 6; stroke([[x - 10, y + 16], [x + 10, y - 16]], 6, { line: '#fff' }); }
};
SH.follow = (t, tq) => {
  const u = t - T.follow;
  cam(560, 940, 1.12 + u * .015);
  officeRev(t, { you: { look: [-.1, -.1], lid: .5, mouth: { o: 0, sm: .25 } }, caio: { look: [.4, -.1], nerv: .4 } });
  followUI(t, 540, 1260, T.follow + .3, T.click);
};
SH.boletos = (t, tq) => {
  const u = t - T.boletos, D = T.pay - T.boletos;
  reset(); bands(['#8fe3c0', '#7fd6b2', '#6cc7a4'], 0, H);
  cam(540, 960, 1.0 + u * .02);
  // stamps in a machine-gun: each faster than the last
  const times = [], nums = [1, 2, 3, 12, 24, 36, 48, 55, 59, 60]; let s = .35, gap = .62;
  for (let i = 0; i < nums.length; i++) { times.push(s); s += gap; gap *= .74; }
  const sc = D / (s + .5) < 1 ? D / (s + .5) : 1;
  let cur = -1; for (let i = 0; i < times.length; i++) if (u >= times[i] * sc) cur = i;
  for (let i = Math.max(0, cur - 3); i <= Math.max(0, cur); i++) {
    const age = u - times[i] * sc, y = 940 + (cur - i) * -26, rot = (hash(i) - .5) * .12;
    push(); translate(540 + (hash(i + 4) - .5) * 40, y); rotate(rot);
    shape(rr(-360, -230, 720, 460, 18), { fill: '#fffdf4', lw: 8 });
    text('BOLETO', -330, -170, { font: '400 40px Bungee', fill: INK, align: 'left' });
    text(`PARCELA ${nums[i]}/60`, -330, -100, { font: '800 52px "Baloo 2"', fill: '#5b5368', align: 'left' });
    for (let b = 0; b < 34; b++) fillOnly(rect(-330 + b * 19, 60, 6 + (hash(b * 3 + i) > .5 ? 6 : 0), 120), INK, { boil: .2 });
    if (i <= cur && age >= 0) { const k = seg(age, 0, .14); push(); translate(150, -10); rotate(-.28); scale(lerp(2.4, 1, eo(k))); shape(rr(-170, -64, 340, 128, 16), { fill: null, lw: 10, line: '#1d7a4a' }); text('PAGO', 0, 6, { font: '400 92px Bungee', fill: '#1d7a4a' }); pop(); }
    pop();
  }
  // the deliveries paying for it
  const gk = back(seg(u, .1, .4), 2);
  reset(); push(); translate(540, 330); scale(gk); rotate(-.04);
  shape(rr(-360, -74, 720, 148, 30), { fill: INK, lw: 8 });
  text('ENTREGAS: +R$ 12 MIL/MÊS', 0, 6, { font: '800 52px "Baloo 2"', fill: GOLD });
  pop();
  if (cur >= 0) burst(690, 930, t, T.boletos + times[cur] * sc, 8, 220, '#1d7a4a');
};
SH.pay = (t, tq) => {
  const deadU = seg(t, T.dead, T.cuArl2);
  const [cx, cy, z] = t < T.dead ? camLerp(t, T.pay, T.dead, [610, 1010, 1.25], [600, 1000, 1.3], ss) : [600 - deadU * 30, 1000 - deadU * 60, 1.3 + deadU * .32];
  cam(cx, cy, z);
  const sl = seg(t, T.slap - .3, T.slap), hit = t >= T.slap;
  officeFront(t, { receipt: hit ? seg(t, T.slap, T.slap + .2) : 0,
    arl: { look: [.45, .25], turn: .15, mouth: { o: talk('a', t).o, sm: lerp(.65, -.1, ss(seg(t, T.slap, T.slap + .4))) }, lid: lerp(.38, .15, ss(seg(t, T.slap, T.slap + .3))), brow: lerp(-.25, .5, ss(seg(t, T.slap, T.slap + .3))) },
    you: { x: 930, y: 1960, s: 1.22, turn: -.75, look: [-.8, -.2], lid: .5, brow: -.2, armL: hit ? { h: [-210, 30], bend: -20 } : { h: [lerp(-40, -210, ss(sl)), lerp(160, 30, ss(sl))], bend: -20 } } });
  if (hit) burst(800, 1150, t, T.slap, 8, 120, CREAM);
};
SH.cuArl2 = (t, tq) => {
  const u = t - T.cuArl2, ck = t >= T.coin;
  cam(540, 840, 2.05 + u * .05, ck && t < T.coin + .2 ? 12 : 0, t);
  officeFront(t, { coinDown: ck, receipt: 1, arl: { lid: .5, brow: -.7, look: [0, .05], mouth: { o: talk('a', t).o, sm: .45, skew: .25 },
    armR: ck ? { h: [-90, 150], bend: 10, fist: true } : { h: [-62, 120], bend: 16 } } });
  if (ck) { reset(); screenRect('#ff7ad9', .18 * (1 - seg(t, T.coin, T.coin + .35))); }
};
SH.morning = (t, tq) => {
  const u = t - T.morning, k = eio(seg(t, T.morning, T.letter));
  cam(lerp(540, 860, k), lerp(960, 1080, k), lerp(1.0, 1.55, k));
  plate('front');
  text('LAVANDERIA 1', 540, 226, { font: '400 70px Bungee', fill: '#e2483d' });
  // the letter in the mailbox: violet envelope with the Ω seal
  const lk = back(seg(t, T.morning + .4, T.morning + .7), 2);
  if (lk > 0) { push(); translate(1036, 1000); rotate(-.18); scale(lk);
    shape(rr(-70, -46, 140, 92, 8), { fill: '#efe7ff', lw: 6 }); stroke([[-70, -46], [0, 6], [70, -46]], 5);
    shape(ell(0, 6, 20, 20, 18), { fill: VIOLET, lw: 4 }); text('Ω', 0, 8, { font: '800 24px "Baloo 2"', fill: '#fff' }); pop(); }
};
SH.letter = (t, tq) => {
  const u = t - T.letter, toCaio = t >= VO.c2 + 1.05;
  if (!toCaio) {
    reset(); bands(['#8fe3c0', '#7fd6b2'], 0, H);
    cam(540, 980 - u * 10, 1.0 + u * .03);
    push(); translate(540, 980); rotate(.025);
    shape(rr(-440, -700, 880, 1400, 16), { fill: '#fffdf4', lw: 8 });
    fillOnly(rect(-440, -700, 880, 190), VIOLET, { boil: .2 }); stroke([[-440, -510], [440, -510]], 8);
    shape(ell(-320, -605, 58, 58, 30), { fill: BRASS, lw: 6 }); text('Ω', -320, -598, { font: '800 72px "Baloo 2"', fill: INK });
    text('GRUPO ÔMEGA', 40, -600, { font: '400 64px Bungee', fill: '#fff' });
    text('NOTIFICAÇÃO', 0, -400, { font: '400 64px Bungee', fill: INK });
    ['O imóvel da LAVANDERIA 1', 'foi vendido.', '', 'Novo proprietário:', 'GRUPO ÔMEGA'].forEach((l, k) => text(l, 0, -270 + k * 70, { font: '800 52px "Baloo 2"', fill: k > 2 ? VIOLET : INK }));
    const sk = seg(q(t), T.letter + .45, T.letter + .62);
    if (sk > 0) { push(); translate(0, 330); rotate(-.12); scale(lerp(2.4, 1, eo(sk))); shape(rr(-360, -100, 720, 200, 18), { fill: null, lw: 12, line: RED }); text('DESOCUPAR', 0, -32, { font: '400 72px Bungee', fill: RED }); text('EM 30 DIAS', 0, 50, { font: '400 72px Bungee', fill: RED }); pop(); }
    pop();
    burst(540, 1310, t, T.letter + .5, 10, 330, RED);
  } else {
    const v = t - (VO.c2 + 1.05);
    cam(560, 1160, 2.0 + v * .08, v < .25 ? 12 * (1 - v / .25) : 0, t);
    plate('front');
    text('LAVANDERIA 1', 540, 226, { font: '400 70px Bungee', fill: '#e2483d' });
    person(CAIO, C(t, { x: 560, y: 1680, s: 1.0, turn: 0, nerv: 1, wide: 1.32, brow: 1.6, sweat: t * 1.6, look: [0, -.1], armL: { h: [-120, -150], bend: -40 }, armR: { h: [120, -150], bend: 40 } }));
  }
};
SH.end = (t, tq) => {
  reset(); fillOnly(rect(0, 0, W, H), '#2a1838', { boil: 0 });
  vortex(540, 760, 900, t * .5, .35);
  screenRect('#2a1838', .55);
  const s = back(seg(q(t), T.end, T.end + .3), 2.4);
  reset(); push(); translate(540, 640); scale(s); rotate(-.06);
  text(EP.next, 14, 18, { font: '400 300px Bungee', fill: GOLDS, outlineW: 26 });
  text(EP.next, 0, 0, { font: '400 300px Bungee', fill: GOLD, outlineW: 26 });
  pop();
  const b = back(seg(q(t), T.end + .35, T.end + .6), 2);
  reset(); push(); translate(540, 920); scale(b); rotate(.03);
  shape(rr(-360, -66, 720, 132, 20), { fill: RED, lw: 8 });
  text(EP.nextTitle, 0, 6, { font: '800 74px "Baloo 2"', fill: CREAM, outlineW: 10 });
  pop();
  const c = back(seg(q(t), T.end + 1.1, T.end + 1.4), 2);
  if (c > 0) { reset(); push(); translate(540, 270); scale(c); rotate(-.02); shape(rr(-400, -84, 800, 168, 26), { fill: MARK, lw: 8 }); text('E VOCÊ, O QUE FARIA?', 0, -22, { font: '800 52px "Baloo 2"', fill: INK }); text('COMENTA AÍ!', 0, 38, { font: '800 44px "Baloo 2"', fill: INK }); pop(); }
  followUI(t, 540, 1200, T.end + .7, VO.n8 + DURS.n8 * .7);
};

// —— the AI version of the character shots: shot → [clip, clip time, camera [cx, cy, z, shake]] (null: the code shot) ——
// Each lip-synced clip starts .4 s before its line (the padded audio Wan was given); c2's was trimmed to start .25 s after VO.c2.
const shk = (t, t0, a, d = .25) => t >= t0 && t < t0 + d ? a * (1 - (t - t0) / d) : 0;
const AISH = {
  reveal: t => ['reveal', t - (T.spin - .8), [540, 960, lerp(1.0, 1.08, ss(seg(t, 0, T.cuArl))), shk(t, T.spin + .5, 8)]],
  cuArl: t => ['a1', t - (VO.a1 - .4), [540, 900, 1.04 + (t - T.cuArl) * .03]],
  cuCaio: t => ['c1', t - (VO.c1 - .4), [540, 960, 1.05 + (t - T.cuCaio) * .03, shk(t, T.cuCaio, 12)]],
  phone: t => ['phone', .75 + (t - T.phone), [540, 960, 1.0]],
  deal: t => ['deal', (t - T.sw1) * .85, [540, 960, 1.0]],
  cuYou: t => ['y1', t - (VO.y1 - .4), [540, 900, 1.0 + (t - T.cuYou) * .035]],
  pay: t => { const u = ss(seg(t, T.dead, T.cuArl2)); return ['y2', t - (VO.y2 - .4), [lerp(540, 340, u), lerp(960, 720, u), lerp(1.04, 1.5, u), shk(t, T.slap, 6, .2)]]; },
  cuArl2: t => ['a3', t - (VO.a3 - .4), [540, 960, 1.05, shk(t, T.coin, 12, .2)]],
  letter: t => t >= VO.c2 + 1.05 ? ['c2', t - (VO.c2 + .25), [540, 1000, 1.05 + (t - VO.c2 - 1.05) * .05, shk(t, VO.c2 + 1.05, 12)]] : null,
};
const AIX = {   // what the code still draws over a clip
  deal: t => {   // "60x" stamped as he says "parcelado"
    const sk = seg(q(t), T.sixty, T.sixty + .18); if (sk <= 0) return;
    reset(); push(); translate(760, 250); rotate(-.14); scale(lerp(2.2, 1, eo(sk)));
    shape(rr(-170, -86, 340, 172, 18), { fill: CREAM, lw: 8 }); shape(rr(-150, -66, 300, 132, 12), { fill: null, lw: 7, line: RED });
    text('60x', 0, -6, { font: '400 84px Bungee', fill: RED }); text('PARCELAS', 0, 46, { font: '800 32px "Baloo 2"', fill: RED });
    pop();
  },
  cuArl2: t => { if (t >= T.coin) { reset(); screenRect('#ff7ad9', .18 * (1 - seg(t, T.coin, T.coin + .35))); } },
  letter: () => text('LAVANDERIA 1', 537, 390, { font: '400 80px Bungee', fill: '#e2483d' }),   // the clip's blank sign, under the same camera
};
SH.followAI = (t, tq) => {   // the two of them, still (GPT Image keyframe, boiled like the plates) under the follow card
  cam(540, 900, 1.06 + (t - T.follow) * .015);
  plate('duo');
  followUI(t, 540, 1290, T.follow + .3, T.click);
};

// ———————————————— shared graphics ————————————————
function bands(cols, y0, y1) { const n = cols.length; for (let i = 0; i < n; i++) fillOnly(rect(-100, lerp(y0, y1, i / n), W + 200, (y1 - y0) / n + 2), cols[i], { boil: 0 }); }
function followUI(t, x, y, t0, tc) {
  const s = back(seg(q(t), t0, t0 + .3), 2), done = t >= tc;
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
function vortex(cx, cy, R, t, a = 1) {   // the phone's swirl: rotating gold arms, flat colours, ink outline
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
  if (t > T.cuArl) return;
  const s = back(seg(q(t), 0, .25), 2.2);
  reset(); push(); translate(540, 250); scale(s); rotate(-.03);
  shape(rr(-470, -120, 940, 240, 30), { fill: CREAM, lw: 9 });
  text('POV:', -400, -52, { font: '400 64px Bungee', fill: RED, align: 'left' });
  text('você ficou', -228, -50, { font: '800 64px "Baloo 2"', fill: INK, align: 'left' });
  text('MILIONÁRIO AOS 23', 0, 50, { font: '400 76px Bungee', fill: GOLD, outlineW: 14 });
  push(); translate(330, -70); rotate(.12); shape(rr(-120, -34, 240, 68, 16), { fill: VIOLET, lw: 6 }); text(`EP ${EP.n} · ${EP.title}`, 0, 4, { font: '400 32px Bungee', fill: '#fff' }); pop();
  pop();
}
function tag(t) {
  for (const [a, b, id, desc, bg, fg] of TAGS) {
    if (t < a || t >= b) continue;
    const n = Math.floor((t - a) * 40), s1 = id.slice(0, n), s2 = desc.slice(0, Math.max(0, n - id.length));
    reset(); push(); translate(50, 360); scale(back(seg(t, a, a + .18), 2.2));
    shape(rr(0, 0, 380, 116, 12), { fill: bg, lw: 7 });
    text('▶ ' + s1 + (n < id.length && Math.floor(t * 6) % 2 ? '█' : ''), 22, 38, { font: '400 56px VT323', fill: fg, align: 'left' });
    text(s2, 24, 86, { font: '400 38px VT323', fill: fg, align: 'left' });
    pop();
  }
}
// subtitles: the cartoon's own captions (white, thick black outline), speaker pill, key words in yellow
const WHO = { c: ['CAIO', '#e3a72a'], y: ['VOCÊ', '#545a69'], a: ['SEU ARLINDO', VIOLET] };
const CUTS = SHOTS.map(s => s[0]).filter(x => x > 0);
const SUBS = Object.entries(VO).map(([id, t0]) => {
  const L = LINE[id], d = DURS[id];
  let t1 = t0 + Math.max(d + .8, 1.8);
  const nxt = Object.values(VO).filter(v => v > t0 + .05).sort((a, b) => a - b)[0];
  if (nxt != null && t1 > nxt - .02) t1 = Math.max(nxt - .02, t0 + d + .1);
  if (id === 'y2') t1 = t0 + d + .15;   // the dead air plays on a clean screen
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
function capaBadge(t) {   // cover: the reveal on screen
  reset(); push(); translate(540, 1600); rotate(-.03);
  shape(rr(-440, -120, 880, 240, 30), { fill: INK, lw: 9 });
  text('O DONO DA ÔMEGA', 0, -50, { font: '400 58px Bungee', fill: '#ff7ad9' });
  text('ERA ELE.', 0, 40, { font: '800 104px "Baloo 2"', fill: GOLD });
  pop();
}

async function render(t) {
  const [, , name] = shotAt(t), tq = q(t), ai = !CODE && AISH[name] ? AISH[name](t) : null;
  const img = ai ? await still(clipFrame(ai[0], ai[1])) : null;
  frame(t);
  screenRect('#000');
  if (ai) { aiDraw(img, ai[2], t); AIX[name]?.(t); }
  else SH[!CODE && name === 'follow' ? 'followAI' : name](t, tq);
  wipe(t);
  titleCard(t);
  tag(t);
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
  add('title', .05);
  add('creak', T.spin - .05); add('whoosh', T.spin, { v: .8 }); add('hit', T.spin + .45, { v: .7 });
  if (CODE) { add('tlim', T.flip + .05); add('tlim', T.flip + .9, { v: .6 }); }   // the coin flip of the code shot
  add('cut', T.cuCaio, { v: .4 }); add('boing', T.cuCaio + .05, { v: .5 });
  add('shimmer', T.phone + .2); add('rise', T.rush, { d: T.sw1 - T.rush });
  for (const [tc] of WIPES) add('swirl', tc - .22);
  add('jangle', T.keys + .1); add('jangle', T.keys + .55, { v: .6 }); add('stamp', T.sixty, { v: .7 });
  add('whoosh', T.lens - .45, { v: .5 }); add('marker', T.mark, { d: .55 });
  add('marker', T.card, { d: .7 }); add('marker', T.card + .7, { d: .4 });
  if (CODE) add('glint', VO.y1 + DURS.y1 - .05);
  add('pop', T.follow + .3); add('click', T.click); add('sparkle', T.click + .02);
  { const D = T.pay - T.boletos; const ts = []; let s = .35, gap = .62; for (let i = 0; i < 10; i++) { ts.push(s); s += gap; gap *= .74; } const sc = D / (s + .5) < 1 ? D / (s + .5) : 1; ts.forEach((x, i) => add('stamp', T.boletos + x * sc, { v: i === 9 ? 1 : .7 })); add('kaching', T.boletos + .15, { v: .8 }); }
  add('slap', T.slap); add('tick', T.dead + .2, { d: T.cuArl2 - T.dead - .2 });
  add('coinslam', T.coin); add('sting', T.coin + .05, { v: .8 });
  add('mail', T.morning + .45); add('stamp', T.letter + .5, { v: 1 }); add('gulp', VO.c2 + .95);
  add('sting', T.end); add('pop', T.end + .35); add('pop', T.end + 1.1, { v: .6 }); add('click', VO.n8 + DURS.n8 * .7); add('sparkle', VO.n8 + DURS.n8 * .7 + .02);
  return ev.sort((a, b) => a.t - b.t);
}

window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS; window.T = T; window.VO = VO;
window.TEXTS = t => { const s = SUBS.find(s => t >= s.t0 && t < s.t1); return s ? [{ id: s.id, text: s.text, x0: 90, y0: 1550, x1: 990, y1: 1720 }] : []; };
for (const f of ['800 60px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
await render(parseFloat(Q.get('t') ?? '1'));
window.READY = true;
