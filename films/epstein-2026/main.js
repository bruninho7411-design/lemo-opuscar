// E se Epstein acordasse em 2026? (sério, factual) — voxel diorama, vertical 1080x1920 (same family as the channel's "E SE…" films)
import * as THREE from 'three';
import { clamp, seg, ss, eio, eo, lerp, hash, TAU, back } from '/core/lib.js';
import { DUR, VO, CAPS, at, end, K } from './story.js';
import { makePost } from './post.js';
import { buildWorld, EVS } from './world.js';

const QS = new URLSearchParams(location.search);
const W = innerWidth || 1080, H = innerHeight || 1920, S = W / 1080;
const SSAA = +(QS.get('ssaa') ?? 1);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, .1, 400);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA });
post.comp.hz0.value = 1e6; post.comp.hz1.value = 2e6;   // no depth fog (perspective camera)
const world = buildWorld(scene);
post.bloom.threshold = .97; post.bloom.radius = .5;

// —— lights ——
const hemi = new THREE.HemisphereLight('#ffe9cf', '#3a2f28', 1.2); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1dc', 2.2); sun.castShadow = true;
sun.shadow.mapSize.set(+(QS.get('sm') || 2048), +(QS.get('sm') || 2048)); sun.shadow.bias = -.0005; sun.shadow.normalBias = .02; sun.shadow.radius = 3;
Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 120 }); sun.shadow.camera.updateProjectionMatrix();
scene.add(sun, sun.target);
const spot = new THREE.SpotLight('#ffd9a0', 60, 30, .45, .6, 1.2); spot.position.set(0, 14, 0); spot.target.position.set(0, 1, 0); spot.castShadow = false; scene.add(spot, spot.target);

// —— shots ——  [start time, name, loc, nap, A params, B params]  params: tg, az, el, dist, (near clip)
const P = (tg, az, el, dist, o = {}) => ({ tg, az, el, dist, ...o });
const SH = () => [
  [0, 'face', 'cell', 'lie', P([-1.6, .84, -.5], 0, 84, 2.3, { clip: 1.3 }), P([-1.6, .84, -.5], 0, 84, 1.9, { clip: 1.3 })],
  [at('v1', 0) - .1, 'wide', 'cell', 'lie', P([-.6, 1.0, .2], 38, 26, 9.5, { clip: 1.8 }), P([-.8, 1.1, .2], 26, 20, 7.5, { clip: 1.8 })],
  [at('v1', 'cameras') - .1, 'rec', 'cell', 'lie', P([-1.6, .9, -.2], 32, 17, 6.3), P([-1.6, .9, -.2], 32, 17, 5.6)],
  [at('v2', 0) - .1, 'bars', 'cell', 'stand', P([.3, 1.35, 1.7], 8, 6, 4.6, { clip: 2.6 }), P([.3, 1.4, 1.7], 2, 6, 3.6, { clip: 2.6 })],
  [at('v4', 0) - .1, 'guard', 'cell', 'stand', P([-.2, 1.3, 3.0], 95, 12, 7, { clip: 3.5 }), P([-.2, 1.3, 3.0], 85, 12, 6.2, { clip: 3.5 })],
  [at('c1', 0) - .1, 'cta', 'cell', 'stand', P([0, 1.2, 1.0], -15, 15, 7, { clip: 4 }), P([0, 1.2, 1.0], -5, 15, 6.2, { clip: 4 })],
  [at('v5', 0) - .1, 'files', 'cell', 'lie', P([0, 1.0, .4], 30, 45, 9, { clip: 5 }), P([0, 1.0, .4], 45, 50, 8, { clip: 5 })],
  [at('v7', 0) - .1, 'court', 'court', 'none', P([39.2, 1.4, -2.2], 18, 14, 12), P([39.2, 1.4, -2.2], 8, 12, 9)],
  [at('v7', 'tribunal') - .25, 'gavel', 'court', 'none', P([40, 2.2, -4.3], 10, 8, 3.2), P([40, 2.2, -4.3], 6, 8, 2.6)],
  [at('v8', 0) - .1, 'end', 'court', 'none', P([37.8, 1.4, -.5], 25, 5, 3.6), P([37.8, 1.4, -.5], 18, 5, 3.0)],
];
let SHOTS = SH();
function shotAt(t) { let i = 0; while (i < SHOTS.length - 1 && t >= SHOTS[i + 1][0]) i++; return { i, t0: SHOTS[i][0], t1: i < SHOTS.length - 1 ? SHOTS[i + 1][0] : DUR, name: SHOTS[i][1], loc: SHOTS[i][2], nap: SHOTS[i][3], A: SHOTS[i][4], B: SHOTS[i][5] }; }

// —— shake: punches at the hook, lid, sting ——
const PUNCH = () => [[at('h1', K.eyes), 1], [at('v1', 'cameras'), .4], [at('v3', 'quarenta'), .9], [at('v4', 'condenada'), .5], [at('v7', 'tribunal'), 1]];
function shake(t) { let a = 0; for (const [pt, v] of PUNCH()) if (t >= pt && t < pt + .6) a += v * Math.exp(-(t - pt) * 9); return [Math.sin(t * 73) * a, Math.cos(t * 61) * a, a]; }

const DEG = Math.PI / 180;
let CAM = {};
function cam(t) {
  const s = shotAt(t), u = seg(t, s.t0, s.t1), e = eio(u);
  const A = s.A, B = s.B;
  let tg = A.follow ? (() => { const p = world.R.napSt.g.position; return [60 + p.x, 1.4, p.z]; })() : A.tg.map((v, i) => lerp(v, B.tg[i], e));
  let az = lerp(A.az, B.az, e), el = lerp(A.el, B.el, e), dist = lerp(A.dist, B.dist, e);
  // cut punch: every new shot lands 8% tighter and settles
  dist *= 1 - .08 * (1 - eo(seg(t, s.t0, s.t0 + .35)));
  if (s.i > 0) { const w = 1 - eo(seg(t, s.t0, s.t0 + .2)); az += (s.i % 2 ? 1 : -1) * 32 * w; }   // whip-in on every cut
  for (const c of CAPS) if (c.big && t >= c.t0 && t < c.t0 + .6) dist *= 1 - .09 * Math.exp(-(t - c.t0) * 7);   // punch on the numbers
  if (s.name === 'face') { const k = eo(seg(t, at('h1', K.eyes), at('h1', K.eyes) + .25)); dist *= lerp(1, .72, k) * lerp(2.0, 1, eo(seg(t, 0, .5))); }   // frame 0 already rushing in   // crash-in when the eyes open
  
  const [sx, sy, sa] = shake(t);
  const ce = Math.cos(el * DEG);
  camera.position.set(tg[0] + dist * ce * Math.sin(az * DEG), tg[1] + dist * Math.sin(el * DEG), tg[2] + dist * ce * Math.cos(az * DEG));
  if (s.name === 'face') camera.up.set(0, 0, -1); else camera.up.set(0, 1, 0);
  camera.lookAt(tg[0], tg[1], tg[2]);
  camera.translateX(sx * .03 * dist); camera.translateY(sy * .03 * dist);
  camera.near = A.clip ? Math.max(.1, dist - A.clip) : .1; camera.far = 400; camera.fov = 30; camera.updateProjectionMatrix();
  post.tilt.fy.value = .5; post.tilt.band.value = .26; post.tilt.maxR.value = (s.name === 'files' || s.name === 'guard' ? 10 : 4) * SSAA;
  { const w = s.i > 0 ? 1 - seg(t, s.t0, s.t0 + .2) : 1 - seg(t, 0, .35); if (w > 0) { post.tilt.band.value *= 1 - w; post.tilt.maxR.value += 22 * w * SSAA; } }   // motion blur on the whip
  CAM = { s, tg, dist };
}

// —— 2D layer ——
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const g = ov.getContext('2d');
const TXT = [];
const GOLD = '#FFD23F', RED = '#FF4D4D';
function txt(s, x, y, size, color = '#fff', o = {}) {
  g.save(); g.font = `${o.w || 900} ${size}px ${o.f || 'Overpass'}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  if (o.max) { const m = g.measureText(s).width; if (m > o.max) { const k = o.max / m; g.translate(x, y); g.scale(k, k); x = 0; y = 0; } }
  g.lineJoin = 'round'; g.lineWidth = size * (o.sw ?? .16); g.strokeStyle = o.stroke || '#14110f'; if (o.sw !== 0) g.strokeText(s, x, y);
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 14 * S; g.shadowOffsetY = 5 * S;
  g.fillStyle = color; g.fillText(s, x, y); g.restore();
}
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
const proj = (x, y, z) => { const p = new THREE.Vector3(x, y, z).project(camera); return [(p.x * .5 + .5) * W, (-p.y * .5 + .5) * H]; };
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function hook(t) {   // the title card of the channel: on frame 0, gone when the hook line ends
  const t1 = end('h1') + .15; if (t > t1 + .2) return;
  const a = 1 - seg(t, t1, t1 + .2), y0 = 1060 * S;
  g.save(); g.globalAlpha = a;
  const L1 = ['E SE EPSTEIN', 'ACORDASSE...'];
  L1.forEach((l, i) => { const p = lerp(.75, 1, back(seg(t, i * .04, i * .04 + .2), 2.2)); g.save(); g.translate(W / 2, y0 + i * 92 * S); g.scale(p, p); txt(l, 0, 0, 86 * S, '#fff', { max: 980 * S }); g.restore(); });
  const p2 = lerp(.7, 1, back(seg(t, .06, .3), 2.4));
  g.save(); g.translate(W / 2, y0 + 245 * S); g.scale(p2, p2);
  g.font = `900 ${150 * S}px Overpass`; const wa = g.measureText('EM ').width, wb = g.measureText('2026?').width, x = -(wa + wb) / 2;
  txt('EM ', x, 0, 150 * S, '#fff', { align: 'left' }); txt('2026?', x + wa, 0, 150 * S, GOLD, { align: 'left' });
  g.restore(); g.restore();
  TXT.push({ id: 'hook', text: 'E SE EPSTEIN ACORDASSE... EM 2026?', x0: 50, y0: y0 - 60, x1: W - 50, y1: y0 + 330 });
}
function counter(t, label, from, to, t0, t1, tEnd, color = RED) {   // the channel's mono label + big number, top-left
  if (t < t0 || t > tEnd) return;
  const a = seg(t, t0, t0 + .2) * (1 - seg(t, tEnd - .2, tEnd)), v = lerp(from, to, eo(seg(t, t0 + .1, t1)));
  g.save(); g.globalAlpha = a;
  txt(label, 64 * S, 250 * S, 30 * S, '#fff', { align: 'left', f: '"Overpass Mono"', w: 700, sw: .2 });
  const pop = t > t1 && t < t1 + .3 ? 1 + .12 * Math.sin(seg(t, t1, t1 + .3) * Math.PI) : 1;
  g.translate(64 * S, 318 * S); g.scale(pop, pop); txt(fmt(v), 0, 0, 92 * S, color, { align: 'left', f: '"Overpass Mono"', w: 700, sw: .12 });
  g.restore(); TXT.push({ id: 'cnt', text: label, x0: 60, y0: 220, x1: 700, y1: 370 });
}
function captions(t) {
  if (t < end('h1') + .1 || t >= at('v8', 0) - .1) return;
  const c = CAPS.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const size = (c.big ? 112 : 88) * S, pop = back(seg(t, c.t0, c.t0 + .12), 2.2);
  g.save(); g.font = `900 ${size}px Overpass`;
  const sp = size * .28, ws = c.words.map(w => g.measureText(w.w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  const fit = Math.min(1, 960 * S / tot), y = 1440 * S;
  g.translate(W / 2, y); g.scale(fit * (.86 + .14 * pop), fit * (.86 + .14 * pop));
  let x = -tot / 2;
  c.words.forEach((w, i) => { const on = t >= w.t0 && t < (c.words[i + 1]?.t0 ?? c.t1); txt(w.w, x + ws[i] / 2, 0, size, on || c.big ? GOLD : '#fff', { sw: .17 }); x += ws[i] + sp; });
  g.restore(); TXT.push({ id: 'cap', text: c.words.map(w => w.w).join(' '), x0: 60, y0: y - 60, x1: W - 60, y1: y + 60 });
}
function flashes(t) { }
function phoneUI(t) {   // v2–v3: 13 months in 2008 vs 45 years now
  const t0 = at('v2', 0), t1 = at('v4', 0) - .1, tp = at('v3', 'pena'); if (t < t0 || t > t1) return;
  const a = seg(t, t0, t0 + .25) * (1 - seg(t, t1 - .2, t1)), x = 110 * S, w = 860 * S;
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(10,12,16,.82)'; rr(x - 30 * S, 300 * S, w + 60 * S, 520 * S, 30 * S); g.fill();
  txt('2008 · ACORDO NA FLÓRIDA', x, 360 * S, 40 * S, '#aab4c3', { align: 'left', sw: 0, f: '"Overpass Mono"', w: 700 });
  const b1 = eo(seg(t, t0 + .3, t0 + .9)) * w * (13 / 540) * 4;   // drawn ×4 so it is visible at all
  g.fillStyle = '#7fd1ff'; rr(x, 400 * S, Math.max(8 * S, b1), 70 * S, 12 * S); g.fill(); txt('13 MESES', x + b1 + 20 * S, 437 * S, 52 * S, '#7fd1ff', { align: 'left', sw: 0 });
  if (t >= at('v2', 'trabalhar') - .2) txt('🏢 SAÍA PRA TRABALHAR', x, 520 * S, 40 * S, '#fff', { align: 'left', sw: 0 });
  if (t >= tp) { txt('HOJE · TRÁFICO SEXUAL DE MENORES', x, 610 * S, 36 * S, '#ffb3b3', { align: 'left', sw: 0, f: '"Overpass Mono"', w: 700 });
    const b2 = eo(seg(t, tp + .2, at('v3', 'quarenta') + .4)) * w; g.fillStyle = '#ff3b3b'; rr(x, 650 * S, b2, 90 * S, 14 * S); g.fill();
    if (t > at('v3', 'quarenta')) txt('PENA MÁX: 45 ANOS', x + 20 * S, 697 * S, 56 * S, '#fff', { align: 'left', sw: 0 }); }
  g.restore();
}
function ruler(t) {   // v4: the accomplice, convicted
  const t0 = at('v4', 'ghislaine') - .1, t1 = at('c1', 0) - .1; if (t < t0 || t > t1) return;
  const inn = back(seg(t, t0, t0 + .35), 1.8), out = 1 - seg(t, t1 - .2, t1), cw = 860 * S, ch = 420 * S, x = (W - cw) / 2, y = 420 * S;
  g.save(); g.globalAlpha = out; g.translate(W / 2, y + ch / 2); g.scale(inn, inn); g.translate(-W / 2, -(y + ch / 2));
  g.fillStyle = 'rgba(12,12,16,.9)'; rr(x, y, cw, ch, 28 * S); g.fill(); g.lineWidth = 4 * S; g.strokeStyle = '#c9a23a'; g.stroke();
  g.font = `${110 * S}px "Noto Color Emoji"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⚖️', x + 130 * S, y + ch / 2);
  txt('GHISLAINE MAXWELL', x + 250 * S, y + 120 * S, 54 * S, '#fff', { align: 'left', sw: 0 });
  txt('CONDENADA EM 2021', x + 250 * S, y + 200 * S, 40 * S, '#aab4c3', { align: 'left', sw: 0, f: '"Overpass Mono"', w: 700 });
  if (t >= at('v4', 'vinte') - .1) txt('20 ANOS DE PRISÃO', x + 250 * S, y + 300 * S, 58 * S, GOLD, { align: 'left', sw: 0 });
  g.restore();
}
function star(x, y, r, col) { g.beginPath(); for (let i = 0; i < 10; i++) { const rr_ = i % 2 ? r * .45 : r, an = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(x + Math.cos(an) * rr_, y + Math.sin(an) * rr_); } g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 4 * S; g.strokeStyle = '#14110f'; g.stroke(); }
function euStars(t) {   // v5: the case files, pages flying in with redactions
  const t0 = at('v5', 'arquivos') - .1, t1 = at('v6', 0) - .1; if (t < t0 || t > t1) return;
  const a = seg(t, t0, t0 + .2) * (1 - seg(t, t1 - .2, t1));
  g.save(); g.globalAlpha = a;
  for (let i = 0; i < 7; i++) { const u = eo(seg(t, t0 + i * .18, t0 + i * .18 + .4)); if (u <= 0) continue;
    g.save(); g.translate(W / 2 + (i - 3) * 26 * S, lerp(-500, 760, u) * S + i * 6 * S); g.rotate((hash(i) - .5) * .35);
    g.fillStyle = '#f4f1e8'; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20 * S; rr(-260 * S, -340 * S, 520 * S, 680 * S, 8 * S); g.fill(); g.shadowBlur = 0;
    for (let l = 0; l < 14; l++) { const ww = (180 + hash(i * 20 + l) * 280) * S, yy = (-270 + l * 40) * S; g.fillStyle = hash(i * 9 + l) > .55 ? '#111' : '#9aa0a8'; g.fillRect(-220 * S, yy, ww, (hash(i * 9 + l) > .55 ? 24 : 8) * S); }
    g.restore(); }
  txt('ARQUIVOS DO CASO', W / 2, 330 * S, 74 * S, '#fff'); txt('MILHARES DE PÁGINAS', W / 2, 410 * S, 48 * S, GOLD);
  [['✈️ VOOS', 'voos', -1], ['📇 CONTATOS', 'contatos', 0], ['⭐ NOMES FAMOSOS', 'nomes', 1]].forEach(([tx, wd, k]) => { const p = back(seg(t, at('v5', wd) - .05, at('v5', wd) + .25), 2.4); if (p <= 0) return;
    g.save(); g.translate(W / 2, (1130 + k * 100) * S); g.scale(p, p); g.font = `900 ${48 * S}px Overpass`; const tw = g.measureText(tx).width + 60 * S;
    g.fillStyle = '#ffffff'; rr(-tw / 2, -42 * S, tw, 84 * S, 42 * S); g.fill(); txt(tx, 0, 4 * S, 48 * S, '#111', { sw: 0 }); g.restore(); });
  g.restore();
}
const COMMENTS = ['não entendi nada kkk', 'cadê o gato?', 'explica de novo 🤯', 'sigma físico 🗿'];
function live(t) {   // v6: not proof of a crime
  const t0 = at('v6', 0) - .05, t1 = at('v7', 0) - .1; if (t < t0 || t > t1) return;
  const p = back(seg(t, t0, t0 + .35), 1.8), a = 1 - seg(t, t1 - .2, t1);
  g.save(); g.globalAlpha = a; g.translate(W / 2, 700 * S); g.scale(p, p);
  g.fillStyle = 'rgba(10,10,14,.92)'; rr(-450 * S, -260 * S, 900 * S, 520 * S, 30 * S); g.fill(); g.lineWidth = 6 * S; g.strokeStyle = GOLD; g.stroke();
  txt('⚠️ ATENÇÃO', 0, -170 * S, 64 * S, GOLD, { sw: 0 }); txt('APARECER NOS', 0, -60 * S, 70 * S, '#fff', { sw: 0 }); txt('ARQUIVOS', 0, 20 * S, 70 * S, '#fff', { sw: 0 });
  txt('≠ PROVA DE CRIME', 0, 130 * S, 76 * S, '#ff6b6b', { sw: 0 }); g.restore();
}
let AVATAR = null; { const im = new Image(); im.src = 'avatar.png'; AVATAR = im; }
function ctaCard(t) {   // c1: like + follow
  const t0 = at('c1', 0), t1 = at('v5', 0) - .05; if (t < t0 || t > t1 + .3) return;
  const tl = at('c1', 'curte'), tf = at('c1', 'segue');
  // the like heart pops on "curte"
  if (t >= tl - .05) { const u = seg(t, tl - .05, tl + .3), p = back(u, 2.6), a = 1 - seg(t, tl + 1.0, tl + 1.4);
    g.save(); g.globalAlpha = a; g.translate(W / 2, 560 * S); g.scale(p * 1.0, p * 1.0); g.font = `${300 * S}px "Noto Color Emoji"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('❤️', 0, 0); g.restore();
    for (let i = 0; i < 10; i++) { const k = seg(t, tl + .05, tl + .9), ang = i / 10 * TAU; g.save(); g.globalAlpha = a * (1 - k); g.font = `${60 * S}px "Noto Color Emoji"`; g.textAlign = 'center'; g.fillText('❤️', W / 2 + Math.cos(ang) * k * 330 * S, 560 * S + Math.sin(ang) * k * 330 * S); g.restore(); } }
  // follow card slides in, the finger taps "Seguir" on "segue"
  const inn = back(seg(t, tl + .6, tl + 1.0), 1.8), out = 1 - seg(t, t1 - .35, t1 - .1), tap = tf + .1, tapped = t >= tap;
  if (t < tl + .6) return;
  const cw = 900 * S, ch = 160 * S, x = (W - cw) / 2, y = 930 * S;
  g.save(); g.globalAlpha = out; g.translate(W / 2, y + ch / 2); g.scale(inn, inn); g.translate(-W / 2, -(y + ch / 2));
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30 * S; g.fillStyle = '#fff'; rr(x, y, cw, ch, 42 * S); g.fill(); g.shadowBlur = 0;
  const ax = x + 84 * S, ay = y + ch / 2; g.save(); g.beginPath(); g.arc(ax, ay, 56 * S, 0, 7); g.clip(); if (AVATAR.complete) g.drawImage(AVATAR, ax - 56 * S, ay - 56 * S, 112 * S, 112 * S); g.restore();
  g.lineWidth = 5 * S; g.strokeStyle = GOLD; g.beginPath(); g.arc(ax, ay, 58 * S, 0, 7); g.stroke();
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#111'; g.font = `900 ${40 * S}px Overpass`; g.fillText('o_que_aconteceria_se', x + 160 * S, y + 60 * S);
  g.fillStyle = '#666'; g.font = `700 ${30 * S}px Overpass`; g.fillText('toda semana, alguém acorda', x + 160 * S, y + 106 * S);
  const bw = 200 * S, bh = 78 * S, bx = x + cw - bw - 26 * S, by = y + (ch - bh) / 2, press = tapped ? 1 - .08 * Math.exp(-(t - tap) * 10) : 1;
  g.save(); g.translate(bx + bw / 2, by + bh / 2); g.scale(press, press); g.fillStyle = tapped ? '#e9e9ec' : '#4f5bf7'; rr(-bw / 2, -bh / 2, bw, bh, 20 * S); g.fill();
  g.fillStyle = tapped ? '#111' : '#fff'; g.font = `900 ${34 * S}px Overpass`; g.textAlign = 'center'; g.fillText(tapped ? 'Seguindo ✓' : 'Seguir', 0, 4 * S); g.restore();
  const fu = seg(t, tl + .8, tap), fx = lerp(W + 80 * S, bx + bw * .6, eo(fu)), fy = lerp(y + 380 * S, by + bh * .7, eo(fu));
  g.font = `${100 * S}px "Noto Color Emoji"`; g.textAlign = 'center'; g.fillText('👆', fx, fy + 74 * S);
  if (tapped && t < tap + .5) { const u = seg(t, tap, tap + .5); g.strokeStyle = `rgba(79,91,247,${1 - u})`; g.lineWidth = 6 * S; g.beginPath(); g.arc(bx + bw * .6, by + bh / 2, (20 + u * 90) * S, 0, 7); g.stroke(); }
  g.restore();
  TXT.push({ id: 'cta', text: 'o_que_aconteceria_se Seguir', x0: x, y0: y, x1: x + cw, y1: y + ch });
}
function endCard(t) {
  const t0 = at('v8', 0) - .1; if (t < t0) return;
  const a = seg(t, t0, t0 + .3);
  g.fillStyle = `rgba(8,10,20,${.55 * a})`; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = a; const p = back(seg(t, t0, t0 + .3), 2);
  g.translate(W / 2, 640 * S); g.scale(p, p);
  txt('ELE IA', 0, 0, 120 * S, '#fff'); txt('CONTAR', 0, 124 * S, 120 * S, '#fff'); txt('TUDO?', 0, 260 * S, 150 * S, GOLD);
  g.restore();
  const CH = ['SIM 👍', 'NÃO 👎'];
  CH.forEach((c, i) => { const u = back(seg(t, t0 + .4 + i * .12, t0 + .7 + i * .12), 2.2); const x = W / 2 + ((i % 2) ? 1 : -1) * 225 * S, y = 1060 * S + Math.floor(i / 2) * 110 * S;
    g.save(); g.globalAlpha = a * clamp(u); g.translate(x, y); g.scale(u, u); g.fillStyle = 'rgba(255,255,255,.95)'; rr(-205 * S, -42 * S, 410 * S, 84 * S, 42 * S); g.fill(); txt(c, 0, 3 * S, 48 * S, '#14110f', { sw: 0 }); g.restore(); });
  const pa = seg(t, t0 + .9, t0 + 1.2), pul = 1 + .05 * Math.sin(t * 7);
  g.save(); g.globalAlpha = pa; g.translate(W / 2, 1330 * S); g.scale(pul, pul); g.fillStyle = GOLD; rr(-260 * S, -60 * S, 520 * S, 120 * S, 60 * S); g.fill(); g.lineWidth = 6 * S; g.strokeStyle = '#14110f'; g.stroke();
  txt('💬 COMENTA', 0, 6 * S, 64 * S, '#14110f', { sw: 0 }); g.restore();
  const pf = back(seg(t, at('v8', 'segue') - .05, at('v8', 'segue') + .3), 2);
  if (t >= at('v8', 'segue') - .05) { g.save(); g.translate(W / 2, 1480 * S); g.scale(pf, pf); g.fillStyle = '#4f5bf7'; rr(-330 * S, -50 * S, 660 * S, 100 * S, 50 * S); g.fill(); txt('➕ SEGUE PRO PRÓXIMO', 0, 5 * S, 48 * S, '#fff', { sw: 0 }); g.restore(); }
  TXT.push({ id: 'end', text: 'ELE IA CONTAR TUDO?', x0: 60, y0: 560, x1: W - 60, y1: 1400 });
}
function progress(t) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, 12 * S); g.fillStyle = GOLD; g.fillRect(0, 0, W * t / DUR, 12 * S); }
function ecg(t) {   // flatline -> heartbeat when the eyes open (cold open only)
  const t1 = end('h1') + .15; if (t > t1 + .2) return;
  const te = at('h1', K.eyes), a = 1 - seg(t, t1, t1 + .2), y0 = 1590 * S, x0 = 90 * S, w = 900 * S;
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,10,4,.55)'; rr(x0 - 20 * S, y0 - 95 * S, w + 40 * S, 190 * S, 24 * S); g.fill();
  g.strokeStyle = '#3dff7a'; g.lineWidth = 6 * S; g.shadowColor = '#3dff7a'; g.shadowBlur = 18 * S; g.beginPath();
  const head = (t * 520 * S) % w;   // the sweep
  for (let px = 0; px <= head; px += 4 * S) {
    const tp = t - (head - px) / (520 * S); let y = 0;
    if (tp > te) { const ph = ((tp - te) / .5) % 1; y = ph < .06 ? -Math.sin(ph / .06 * Math.PI) * 70 * S : ph < .1 ? Math.sin((ph - .06) / .04 * Math.PI) * 30 * S : 0; }
    px ? g.lineTo(x0 + px, y0 + y) : g.moveTo(x0 + px, y0 + y);
  }
  g.stroke(); g.shadowBlur = 0;
  const alive = t > te; txt(alive ? '♥ ' + Math.round(lerp(40, 128, seg(t, te, te + 1))) + ' BPM' : '♥ 0 BPM', x0 + w - 10 * S, y0 - 58 * S, 40 * S, alive ? '#3dff7a' : '#ff4d4d', { align: 'right', f: '"Overpass Mono"', w: 700, sw: 0 });
  txt(alive ? 'SINAIS VITAIS: DE VOLTA' : 'MORTO DESDE 2019', x0 + 10 * S, y0 - 58 * S, 32 * S, '#fff', { align: 'left', f: '"Overpass Mono"', w: 700, sw: 0 });
  g.restore();
}
function sticker(t, text, t0, t1, y, color = GOLD) {   // open-loop sticker
  if (t < t0 || t > t1) return;
  const p = back(seg(t, t0, t0 + .3), 2.4), a = 1 - seg(t, t1 - .2, t1), wob = Math.sin(t * 6) * .025;
  g.save(); g.globalAlpha = a; g.translate(W / 2, y * S); g.rotate(-.05 + wob); g.scale(p, p);
  g.font = `900 ${56 * S}px Overpass`; const tw = g.measureText(text).width + 70 * S;
  g.fillStyle = color; rr(-tw / 2, -50 * S, tw, 100 * S, 50 * S); g.fill(); g.lineWidth = 6 * S; g.strokeStyle = '#14110f'; g.stroke();
  txt(text, 0, 5 * S, 56 * S, '#14110f', { sw: 0 }); g.restore();
}
function freezeStamp(t) {
  const [f0, f1] = FRZ(); if (t < f0 || t > f1 + .1) return;
  const sl = eo(seg(t, f0, f0 + .12)), sc = lerp(2.6, 1, sl);
  g.save(); g.globalAlpha = Math.min(1, sl * 1.5) * (1 - seg(t, f1 - .05, f1 + .1)); g.translate(W / 2, 1060 * S); g.rotate(-.14); g.scale(sc, sc);
  g.lineWidth = 14 * S; g.strokeStyle = '#e8262e'; rr(-380 * S, -95 * S, 760 * S, 190 * S, 18 * S); g.stroke();
  txt('45 ANOS', 0, 8 * S, 130 * S, '#e8262e', { sw: 0 }); g.restore();
  TXT.push({ id: 'frz', text: 'BAIXINHO', x0: 200, y0: 660, x1: 880, y1: 860 });
}
function cctv(t) {   // security-camera look on the REC shot
  if (CAM.s.name !== 'rec') return;
  g.save(); g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += 6 * S) g.fillRect(0, y, W, 2 * S);
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 6 * S; const m = 70 * S, L = 90 * S;
  [[m, m + 60 * S, 1, 1], [W - m, m + 60 * S, -1, 1], [m, H - m - 200 * S, 1, -1], [W - m, H - m - 200 * S, -1, -1]].forEach(([x, y, sx, sy]) => { g.beginPath(); g.moveTo(x + sx * L, y); g.lineTo(x, y); g.lineTo(x, y + sy * L); g.stroke(); });
  if ((t * 1.2) % 1 < .55) { g.fillStyle = '#ff2a2a'; g.beginPath(); g.arc(130 * S, 230 * S, 16 * S, 0, TAU); g.fill(); }
  txt('REC', 160 * S, 232 * S, 44 * S, '#fff', { align: 'left', sw: 0, f: '"Overpass Mono"', w: 700 });
  const ss_ = String(Math.floor(14 + t % 60)).padStart(2, '0');
  txt('02/11/2026  03:14:' + ss_, W - 120 * S, 232 * S, 38 * S, '#fff', { align: 'right', sw: 0, f: '"Overpass Mono"', w: 700 });
  txt('CAM 04 · CORREDOR', 130 * S, H - 330 * S, 36 * S, '#fff', { align: 'left', sw: 0, f: '"Overpass Mono"', w: 700 });
  g.restore();
}
function hud(t) {
  g.clearRect(0, 0, W, H); TXT.length = 0;
  cctv(t);
  if (QS.has('cover')) { g.save(); g.translate(0, 270 * S); hook(.8); g.restore(); return; }
  flashes(t);
  counter(t, 'ANOS DESDE A MORTE', 0, 7, at('v1', 0), at('v1', 'dezenove') + .3, at('v1', 'cameras') - .1);
  phoneUI(t); ruler(t); euStars(t); live(t); ctaCard(t);
  captions(t); hook(t); ecg(t); freezeStamp(t);
  sticker(t, '👀 ESPERA O FINAL', end('h1') + .3, at('v2', 0) - .1, 470);
  sticker(t, 'MAS O PIOR AINDA VEM...', at('v5', 0) - .15, at('v5', 0) + 1.6, 1650, '#ff6b4a');
  endCard(t); progress(t);
}

// —— render ——
const SKY = { zen: new THREE.Color('#6fa8e8'), hor: new THREE.Color('#f3dcc0') };
const FRZ = () => [at('v3', 'quarenta') + .1, at('v3', 'quarenta') + .9];
function render(t) {
  if (QS.has('cover')) t = +QS.get('cover');
  const [f0, f1] = FRZ(), t3 = t >= f0 && t < f1 ? f0 : t;   // the 3D world freezes, the overlay keeps going
  cam(t3);
  world.update(t3, CAM.s);
  const face = CAM.s.name === 'face', court = CAM.s.loc === 'court';
  hemi.intensity = face ? .9 : 1.1; hemi.color.set(court ? '#ffe8cc' : '#dfe8ff');
  sun.intensity = court ? 1.8 : 1.3; if (court) { sun.position.set(46, 10, 6); sun.target.position.set(40, 0, -2); } else { sun.position.set(1, 8, 9); sun.target.position.set(0, 0, 1); }
  spot.intensity = 0;
  post.comp.zen.value.set('#0e1118'); post.comp.hor.value.set('#1a1f2a');
  const gd = post.grade; gd.sat.value = 1.12; gd.contrast.value = .12; gd.lift.value.setRGB(.01, .01, .02); gd.vig.value = .32; gd.fade.value = 1;
  // hook: the first frame is darker, the eyes open with a light hit
  if (CAM.s.name === 'face') gd.fade.value = t < at('h1', K.eyes) ? .82 : 1 + .3 * Math.exp(-(t - at('h1', K.eyes)) * 8);
  post.bloom.strength = .45;
  if (CAM.s.name === 'rec') { gd.sat.value = .25; gd.contrast.value = .3; }
  if (t >= f0 && t < f1) { gd.sat.value = .15; gd.contrast.value = .35; }
  post.composer.render();
  hud(t);
}
function events() {
  const ev = EVS.slice();
  VO.forEach(v => ev.push({ t: v.t, type: 'vo', id: v.id }));
  SHOTS.slice(1).forEach(s => ev.push({ t: s[0], type: 'cut', name: s[1] }));
  PUNCH().forEach(([t, v]) => ev.push({ t, type: 'punch', v }));
  ev.push({ t: 0, type: 'flat', d: at('h1', K.eyes) }, { t: FRZ()[0], type: 'freeze' }, { t: end('h1') + .3, type: 'stick' }, { t: at('v5', 0) - .15, type: 'stick' });
  for (let k = 0; at('h1', K.eyes) + k * .5 < end('h1') + .2; k++) ev.push({ t: at('h1', K.eyes) + k * .5, type: 'beep' });
  CAPS.filter(c => c.big).forEach(c => ev.push({ t: c.t0, type: 'numpunch' }));
  ev.push({ t: at('v8', 0) - .1, type: 'end' }, { t: at('v2', 0), type: 'phone' }, { t: at('v4', 'ghislaine'), type: 'phone' }, { t: at('v5', 'arquivos'), type: 'ruler' },
    { t: at('v6', 0), type: 'phone' }, { t: at('c1', 'curte'), type: 'like' }, { t: at('c1', 'segue') + .1, type: 'follow' }, { t: at('v8', 'segue'), type: 'follow' });
  return ev.sort((a, b) => a.t - b.t);
}
window.render = render; window.DUR = DUR; window.EV = events(); window.TEXTS = t => { render(t); return TXT; };
window.DBG = { camera, world, scene, post };
await document.fonts.load(`900 80px Overpass`); await document.fonts.load(`800 36px Overpass`); await document.fonts.load(`700 30px Overpass`); await document.fonts.load(`700 30px "Overpass Mono"`);
render(parseFloat(QS.get('t') ?? '1'));
window.READY = true;
