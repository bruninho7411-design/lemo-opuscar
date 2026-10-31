// POV: você ficou milionário aos 23 — EP 6 · O despejo (vertical 1080×1920)
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
const clipSrc = (clip, ct, key) => clip !== '-' && AIN[clip] ? `ai/f/${clip}/${String(clamp(Math.round(ct * 30), 0, AIN[clip] - 1) + 1).padStart(4, '0')}.jpg` : `ai/${key}`;
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
// AI shots: shot → [clip, clip time, camera [cx, cy, z, shake], keyframe drawn until the clip exists]
// Each lip-synced clip starts .4 s before its line (the padded audio Wan was given). Clips named *x are EP 5's, reused: the
// line said over each has the voice and the rhythm of the one it was animated to (c1x is EP 5's own c2, its pad cut .25 s in;
// y2x shows you from behind), so no new generation was needed.
const AISH = {
  letter: t => ['c1x', t - (VO.c1 + .25), [540, 1000, 1.05 + t * .015, shk(t, T.stamp + .12, 10)], 'k_caio_st.png'],
  cuYou: t => ['y1', t - (VO.y1 - .4), [540, 900, 1.04 + (t - T.cuYou) * .03], 'k_you_st.png'],
  cuCaio: t => ['c2', t - (VO.c2 - .4), [540, 960, 1.05 + (t - T.cuCaio) * .03, shk(t, T.cuCaio, 8)], 'k_caio_in.png'],
  saveShot: t => ['-', 0, [540, 880, 1.04 + (t - T.saveShot) * .03], 'k_you_doc.png'],
  cuYou2: t => ['y2x', t - (VO.y2 - .4), [540, 960, 1.04 + (t - T.cuYou2) * .02, shk(t, VO.y2 + DURS.y2 * .82, 6, .2)], 'k_you_doc.png'],
  cuArl: t => ['a1', t - (VO.a1 - .4), [540, 960, 1.06 + (t - T.cuArl) * .04, shk(t, T.cuArl, 12)], 'k_arl_mad.png'],
  cuArl2: t => ['a2x', t - (VO.a2 - .4), [540, 900, 1.04 + (t - T.cuArl2) * .03], 'k_arl_cu2.png'],
  cuArl3: t => ['a3x', t - (VO.a3 - .4), [540, 960, 1.05, shk(t, T.coin, 12, .2)], 'k_arl_cu2.png'],
};
const AIX = {   // what the code draws over a clip (under the same camera first, then on screen)
  letter: t => {
    text('LAVANDERIA 1', 537, 390, { font: '400 80px Bungee', fill: RED });
    const s = pop_(t, T.stamp, 2.4, .18); if (s <= 0) return;
    reset(); stampBox(540, 1240, -.08, lerp(2.2, 1, Math.min(1, s)), [['DESOCUPAR', 76], ['EM 30 DIAS', 76]], RED, 640, 190, CREAM);
    burst(540, 1240, t, T.stamp + .18, 10, 360, RED);
  },
  saveShot: t => {   // the save + follow call, over you and the lease
    const sv = pop_(t, T.save);
    if (sv > 0) { reset(); push(); translate(880, 600); scale(sv); rotate(.08); shape([[-70, -90], [70, -90], [70, 100], [0, 50], [-70, 100]], { fill: t > T.save + .35 ? GOLD : '#fff', lw: 8 }); text('SALVA', 0, 170, { font: '400 46px Bungee', fill: '#fff', outlineW: 12 }); pop(); }
    followUI(t, 470, 300, VO.n6, T.click, .8);
  },
  cuArl3: t => { if (t >= T.coin) { reset(); screenRect('#ff7ad9', .18 * (1 - seg(t, T.coin, T.coin + .35))); } },
  cuYou: t => {   // "duas vezes": two fingers of chalk on screen
    text('LAVANDERIA 1', 537, 392, { font: '400 74px Bungee', fill: RED });   // the keyframe's blank sign, under the same camera
    const s = pop_(t, T.two); if (s <= 0) return;
    reset(); push(); translate(820, 560); rotate(.12); scale(s);
    shape(ell(0, 0, 110, 110, 40), { fill: MARK, lw: 8 }); text('2', 0, 8, { font: '400 130px Bungee', fill: INK });
    text('ERROS', 0, 150, { font: '400 54px Bungee', fill: '#fff', outlineW: 12 });
    pop();
  },
};
const SH = {};
SH.err1 = (t, tq) => {   // the letter: 30 crossed out, 90 written
  const u = t - T.err1;
  reset(); bands(MINT, 0, H);
  cam(540, 960, 1.0 + u * .02);
  push(); translate(540, 900); rotate(.025);
  shape(rr(-430, -470, 860, 940, 16), { fill: PAPER, lw: 8 });
  fillOnly(rect(-430, -470, 860, 150), VIOLET, { boil: .2 }); stroke([[-430, -320], [430, -320]], 8);
  shape(ell(-320, -395, 48, 48, 30), { fill: '#d4a640', lw: 6 }); text('Ω', -320, -389, { font: '800 60px "Baloo 2"', fill: INK });
  text('GRUPO ÔMEGA', 40, -392, { font: '400 56px Bungee', fill: '#fff' });
  text('NOTIFICAÇÃO', 0, -240, { font: '400 56px Bungee', fill: INK });
  ['O imóvel da LAVANDERIA 1', 'foi vendido.'].forEach((l, k) => text(l, 0, -150 + k * 60, { font: '800 46px "Baloo 2"', fill: INK }));
  stampBox(0, 160, -.1, 1, [['DESOCUPAR EM', 60], ['30 DIAS', 96]], RED, 620, 230);
  const xk = seg(t, T.x30, T.x30 + .3);
  if (xk > 0) stroke([[-250, 232], [lerp(-250, -60, eo(xk)), lerp(232, 196, eo(xk))]], 20, { line: INK });
  const nk = pop_(t, T.x30 + .3, 2.4, .2);
  if (nk > 0) { push(); translate(230, 335); rotate(-.12); scale(nk); shape(ell(0, 0, 150, 105, 40), { fill: MARK, lw: 8 }); text('90', 0, -8, { font: '400 112px Bungee', fill: GREEN }); text('DIAS', 0, 66, { font: '400 38px Bungee', fill: GREEN }); pop(); }
  pop();
  lawCard(t, VO.n1 + .2, 'ART. 8', 'quem compra tem que dar 90 dias', 270);
};
SH.err2 = (t, tq) => {   // "o erro dois vale novecentos mil"
  const u = t - T.err2;
  reset(); fillOnly(rect(0, 0, W, H), '#2a1838', { boil: 0 });
  vortex(540, 960, 900, t * .4, .3); screenRect('#2a1838', .5);
  cam(540, 960, 1 + u * .03);
  const s = pop_(t, T.err2 + .05, 2.4);
  if (s > 0) { push(); translate(540, 640); scale(s); rotate(-.05); text('ERRO 2', 10, 14, { font: '400 200px Bungee', fill: GOLDS, outlineW: 22 }); text('ERRO 2', 0, 0, { font: '400 200px Bungee', fill: '#fff', outlineW: 22 }); pop(); }
  const k = ss(seg(t, T.cash - .1, T.cash + .6)), v = Math.round(lerp(0, 900, k));
  if (k > 0) {
    push(); translate(540, 1000); rotate(.03); scale(pop_(t, T.cash - .1));
    shape(rr(-400, -110, 800, 220, 30), { fill: GOLD, lw: 9 });
    text(`R$ ${v}.000`, 0, 6, { font: '400 104px Bungee', fill: INK });
    pop();
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + .4, kk = seg(t, T.cash + .5, T.cash + 1.2); if (kk > 0 && kk < 1) coin(540 + Math.cos(a) * 470 * eo(kk), 1000 + Math.sin(a) * 300 * eo(kk) + 200 * kk * kk, 34, t * 20 + i); }
  }
};
SH.pref = (t, tq) => {   // the right to buy first: the sale has to pass by the tenant
  const u = t - T.pref;
  reset(); bands(['#ffe9c7', '#ffe0b3'], 0, H);
  cam(540, 1000, 1 + u * .015);
  const node = (x, y, col, top, bot, s = 1) => { push(); translate(x, y); scale(s); shape(rr(-200, -120, 400, 240, 30), { fill: col, lw: 8 }); text(top, 0, -26, { font: '400 50px Bungee', fill: '#fff', outlineW: 10 }); text(bot, 0, 44, { font: '800 36px "Baloo 2"', fill: '#fff', outlineW: 8 }); pop(); };
  // the building between them
  push(); translate(540, 560); shape(rr(-120, -130, 240, 260, 10), { fill: '#c9b8e8', lw: 8 }); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) shape(rr(-90 + c * 64, -100 + r * 70, 48, 48, 6), { fill: '#fff6d6', lw: 5 }); text('O PRÉDIO', 0, 172, { font: '400 40px Bungee', fill: INK }); pop();
  node(250, 880, '#7a6a5a', 'DONO', 'vende', pop_(t, T.pref + .05));
  node(830, 880, VIOLET, 'ÔMEGA', 'quer comprar', pop_(t, T.pref + .2));
  const tk = pop_(t, T.block - .25); node(330, 1230, '#2f9e6e', 'VOCÊ', 'quem aluga', tk);
  // the sale arrow: straight to Ômega, blocked; then down to you first
  const ak = seg(t, T.pref + .4, T.block);
  if (ak > 0) { const x1 = lerp(455, 590, ak); stroke([[455, 880], [x1, 880]], 14, { line: INK }); if (ak >= 1) shape([[590, 850], [630, 880], [590, 910]], { fill: INK, lw: 4 }); }
  const xk = seg(t, T.block, T.block + .2);
  if (xk > 0) { push(); translate(540, 880); scale(lerp(1.8, 1, eo(xk))); stroke([[-50, -50], [50, 50]], 20, { line: RED }); stroke([[50, -50], [-50, 50]], 20, { line: RED }); pop(); burst(540, 880, t, T.block, 8, 110, RED); }
  const dk = seg(t, T.block + .25, T.block + .7);
  if (dk > 0) { stroke(quadPts([240, 1005], [250, 1060], [300, 1100], dk), 16, { line: GREEN }); if (dk >= 1) { shape([[270, 1092], [318, 1112], [300, 1066]], { fill: GREEN, lw: 4 }); text('1º', 150, 1060, { font: '400 64px Bungee', fill: GREEN }); } }
  const sk = pop_(t, T.same); if (sk > 0) { reset(); push(); translate(790, 1240); rotate(.1); scale(sk); shape(rr(-190, -62, 380, 124, 20), { fill: MARK, lw: 7 }); text('MESMO PREÇO', 0, 4, { font: '400 42px Bungee', fill: INK }); pop(); }
  lawCard(t, VO.n3 + .1, 'ART. 27', 'quem aluga tem a preferência', 270);
};
function quadPts(a, c, b, k) { const P = []; for (let i = 0; i <= 20 * k; i++) { const s = i / 20, v = 1 - s; P.push([v * v * a[0] + 2 * v * s * c[0] + s * s * b[0], v * v * a[1] + 2 * v * s * c[1] + s * s * b[1]]); } return P.length > 1 ? P : [a, a]; }
SH.none = (t, tq) => {   // "ninguém te ofereceu nada": the phone, nothing
  const u = t - T.none;
  reset(); fillOnly(rect(0, 0, W, H), '#2b2240', { boil: 0 });
  cam(540, 960, 1.04 + u * .05);
  push(); translate(540, 960); rotate(-.04);
  shape(rr(-300, -560, 600, 1120, 70), { fill: '#16121f', lw: 10 });
  shape(rr(-260, -500, 520, 1000, 40), { fill: '#f4f0ff', lw: 0, line: null });
  text('Mensagens', 0, -430, { font: '800 50px "Baloo 2"', fill: INK });
  shape(ell(0, -120, 120, 120, 40), { fill: '#e6e0f5', lw: 6 }); text('0', 0, -112, { font: '400 120px Bungee', fill: '#9a90b0' });
  text('Nenhuma oferta', 0, 70, { font: '800 52px "Baloo 2"', fill: '#6b5f80' });
  text('de compra.', 0, 130, { font: '800 52px "Baloo 2"', fill: '#6b5f80' });
  pop();
};
SH.reg = (t, tq) => {   // the condition: the lease registered on the building's record, 30 days before the sale
  const u = t - T.reg;
  reset(); bands(MINT, 0, H);
  const pk = eio(seg(t, T.reg, T.box + .4));   // push onto the empty box
  cam(540, lerp(960, 1120, pk), lerp(1.0, 1.32, pk));
  doc(540, 860, 860, 900, -.02, 'CONTRATO DE', 'LOCAÇÃO · Lavanderia 1', 6);
  push(); translate(540, 1130); rotate(-.02);
  const bk = seg(t, T.box, T.box + .4);
  if (bk > 0) fillOnly(rr(-330, -100, 660, 200, 18), MARK, { boil: .3 });
  for (let i = 0; i < 18; i++) { const a = i / 18; stroke([[-330 + a * 660, -100], [-330 + (a + .028) * 660, -100]], 6); stroke([[-330 + a * 660, 100], [-330 + (a + .028) * 660, 100]], 6); }
  stroke([[-330, -100], [-330, 100]], 6); stroke([[330, -100], [330, 100]], 6);
  text('AVERBAÇÃO NA MATRÍCULA', 0, -40, { font: '400 40px Bungee', fill: '#8a8296' });
  text('(cartório de registro de imóveis)', 0, 30, { font: '700 34px "Baloo 2"', fill: '#8a8296' });
  pop();
  const fk = seg(q(t), VO.n5 + DURS.n5 * .74, VO.n5 + DURS.n5 * .74 + .16);   // "quase ninguém faz isso"
  if (fk > 0) { push(); translate(560, 1060); stampBox(0, 0, -.12, lerp(2.2, 1, eo(fk)), [['QUASE NINGUÉM', 50], ['FAZ ISSO', 50]], RED, 480, 150, CREAM); pop(); }
  lawCard(t, T.box, 'ART. 33', '30 dias antes da venda, no mínimo', 270);
};
SH.stamped = (t, tq) => {   // "registrei no dia que assinei": the empty box gets its stamp
  const u = t - T.stamped;
  reset(); bands(MINT, 0, H);
  cam(540, 1080, 1.2 + u * .05, shk(t, T.stamped + .15, 12), t);
  doc(540, 860, 860, 900, -.02, 'CONTRATO DE', 'LOCAÇÃO · Lavanderia 1', 6);
  const s = seg(q(t), T.stamped + .05, T.stamped + .2);
  if (s > 0) { stampBox(540, 1130, -.1, lerp(2.4, 1, eo(s)), [['AVERBADO', 84], ['MATRÍCULA Nº 48.213', 34]], GREEN, 640, 210, CREAM); burst(540, 1130, t, T.stamped + .2, 10, 360, GREEN); }
};
SH.deposit = (t, tq) => {   // the deposit in court
  const u = t - T.deposit;
  reset(); bands(['#d9e4f2', '#cfdbec'], 0, H);
  cam(540, 1000, 1 + u * .02);
  push(); translate(540, 1000); rotate(.02);
  shape(rr(-420, -600, 840, 1200, 14), { fill: PAPER, lw: 8 });
  fillOnly(rect(-420, -600, 840, 150), '#2b4c7e', { boil: .2 }); stroke([[-420, -450], [420, -450]], 8);
  text('PODER JUDICIÁRIO', 0, -525, { font: '400 50px Bungee', fill: '#fff' });
  text('DEPÓSITO JUDICIAL', 0, -370, { font: '400 52px Bungee', fill: INK });
  text('Ação de preferência · Lei 8.245/91, art. 33', 0, -300, { font: '700 32px "Baloo 2"', fill: '#5b5368' });
  for (let k = 0; k < 4; k++) fillOnly(rr(-340, -220 + k * 44, 680 - hash(k) * 200, 14, 7), '#d6ccb4', { boil: .2 });
  text('VALOR', -340, 40, { font: '400 40px Bungee', fill: '#5b5368', align: 'left' });
  const k = ss(seg(t, VO.n7 + DURS.n7 * .55, T.slip)), v = Math.round(lerp(0, 900, k));
  text(k <= 0 ? 'R$ ____' : `R$ ${v === 900 ? '900.000' : v + '.000'},00`, 0, 140, { font: '400 92px Bungee', fill: INK });
  const sk = seg(q(t), T.slip, T.slip + .16);
  if (sk > 0) stampBox(150, 380, -.2, lerp(2.4, 1, eo(sk)), [['DEPOSITADO', 64]], GREEN, 520, 130);
  pop();
};
SH.owner = (t, tq) => {   // months later: the building in your name, rent zero
  const u = t - T.owner, k = eio(seg(t, T.owner, T.owner + 1.4));
  cam(lerp(540, 540, k), lerp(960, 760, k), lerp(1.0, 1.25, k));
  plate('front');
  text('LAVANDERIA 1', 540, 226, { font: '400 70px Bungee', fill: RED });
  const pk = pop_(t, T.owner + .5);
  if (pk > 0) { reset(); push(); translate(540, 520); rotate(-.03); scale(pk); shape(rr(-400, -90, 800, 180, 22), { fill: CREAM, lw: 9 }); text('PROPRIETÁRIO:', 0, -30, { font: '400 40px Bungee', fill: '#6b5f80' }); text('VOCÊ', 0, 38, { font: '400 72px Bungee', fill: GREEN }); pop(); }
  const zk = seg(q(t), T.zero, T.zero + .16);
  if (zk > 0) { reset(); stampBox(540, 1180, -.08, lerp(2.4, 1, eo(zk)), [['ALUGUEL', 60], ['R$ 0', 110]], GREEN, 520, 250, CREAM); burst(540, 1180, t, T.zero + .16, 10, 330, GREEN); }
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
  shape(rr(-360, -66, 720, 132, 20), { fill: RED, lw: 8 });
  text(EP.nextTitle, 0, 6, { font: '800 74px "Baloo 2"', fill: CREAM, outlineW: 10 });
  pop();
  const c = pop_(t, T.end + 1.1, 2, .3);
  if (c > 0) { reset(); push(); translate(540, 270); scale(c); rotate(-.02); shape(rr(-400, -84, 800, 168, 26), { fill: MARK, lw: 8 }); text('VOCÊ SABIA DESSA LEI?', 0, -22, { font: '800 52px "Baloo 2"', fill: INK }); text('COMENTA AÍ!', 0, 38, { font: '800 44px "Baloo 2"', fill: INK }); pop(); }
  followUI(t, 540, 1200, T.end + .7, VO.n9 + DURS.n9 * .7);
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
  if (t > T.cuYou) return;
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
  text('DESPEJO EM 30 DIAS?', 0, -50, { font: '400 54px Bungee', fill: '#ff7ad9' });
  text('ELE ERROU 2 VEZES.', 0, 40, { font: '800 92px "Baloo 2"', fill: GOLD });
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
  add('title', .05); add('stamp', T.stamp + .12, { v: 1 }); add('hit', T.stamp + .12, { v: .6 });
  add('cut', T.cuYou, { v: .4 }); add('glint', T.two); add('pop', T.two + .02, { v: .7 });
  add('cut', T.err1, { v: .5 }); add('marker', T.x30, { d: .3 }); add('pop', T.x30 + .3, { v: .8 });
  add('whoosh', T.err2, { v: .6 }); add('kaching', T.cash + .5, { v: .9 }); add('sparkle', T.cash + .6);
  add('cut', T.pref, { v: .4 }); add('pop', T.pref + .05, { v: .5 }); add('pop', T.pref + .2, { v: .5 }); add('stamp', T.block, { v: .6 }); add('swirl', T.block + .2); add('pop', T.same, { v: .7 });
  add('cut', T.none, { v: .4 }); add('tick', T.none + .2, { d: T.cuCaio - T.none - .2 });
  add('cut', T.cuCaio, { v: .4 }); add('boing', T.cuCaio + .05, { v: .4 });
  add('cut', T.reg, { v: .4 }); add('marker', T.box, { d: .4 }); add('stamp', VO.n5 + DURS.n5 * .74, { v: .7 });
  add('pop', T.save, { v: .7 }); add('pop', VO.n6 + .05); add('click', T.click); add('sparkle', T.click + .02);
  add('cut', T.saveShot, { v: .4 }); add('cut', T.cuYou2, { v: .4 }); add('slap', VO.y2 + DURS.y2 * .82); add('stamp', T.stamped + .15, { v: 1 }); add('hit', T.stamped + .15, { v: .5 });
  for (const [tc] of WIPES) add('swirl', tc - .22);
  add('stamp', T.slip, { v: .9 }); add('kaching', T.slip + .1, { v: .6 });
  add('hit', T.cuArl, { v: .8 }); add('slap', T.cuArl + .05);
  add('stamp', T.zero, { v: 1 }); add('sparkle', T.zero + .1);
  add('sting', T.cuArl2, { v: .7 }); add('cut', T.cuArl3, { v: .4 }); add('coinslam', T.coin); add('gulp', T.coin + .45);
  add('sting', T.end); add('pop', T.end + .35); add('pop', T.end + 1.1, { v: .6 }); add('click', VO.n9 + DURS.n9 * .7); add('sparkle', VO.n9 + DURS.n9 * .7 + .02);
  return ev.sort((a, b) => a.t - b.t);
}

window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS; window.T = T; window.VO = VO;
window.TEXTS = t => { const s = SUBS.find(s => t >= s.t0 && t < s.t1); return s ? [{ id: s.id, text: s.text, x0: 90, y0: 1550, x1: 990, y1: 1720 }] : []; };
for (const f of ['800 60px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
await render(parseFloat(Q.get('t') ?? '1'));
window.READY = true;
