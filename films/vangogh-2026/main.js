// E se Van Gogh acordasse em 2026? — voxel diorama, vertical 1080x1920 (same family as the channel's "E SE…" films)
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
const TI = () => at('h1', 'em');   // the paint splat
const SH = () => [
  [0, 'vortex', 'night', 'none', P([0, 0, 0], 0, 0, 1), P([0, 0, 0], 0, 0, 1)],
  [TI() + .04, 'face', 'night', 'lie', P([0, .33, -.54], 0, 84, 2.3, { clip: 1.3 }), P([0, .33, -.54], 0, 84, 1.9, { clip: 1.3 })],
  [at('v1', 0) - .1, 'wide', 'night', 'lie', P([0, 5, -12], 0, 2, 24), P([0, 6, -14], -4, 4, 22)],
  [at('v2', 0) - .1, 'money', 'night', 'stand', P([0, 1.4, 1.8], 12, 6, 4.8), P([0, 1.45, 1.8], 4, 6, 4.0)],
  [at('v3', 0) - .1, 'easel', 'night', 'stand', P([.8, 1.3, 1.6], -30, 8, 5.2), P([.8, 1.3, 1.6], -22, 8, 4.6)],
  [at('c1', 0) - .1, 'cta', 'night', 'stand', P([0, 1.35, 1.8], 14, 8, 4.8), P([0, 1.35, 1.8], 6, 8, 4.2)],
  [at('v4', 0) - .1, 'expo', 'expo', 'stand', P([60, 1.8, 0], 22, 12, 11), P([60, 1.8, 0], 8, 10, 9)],
  [at('v5', 0) - .1, 'poll', 'expo', 'stand', P([60, 1.6, 0], 30, 25, 10), P([60, 1.6, 0], 40, 30, 9)],
  [at('p1', 0) - .1, 'promo', 'night', 'stand', P([0, 2, -3], 20, 16, 16), P([0, 2, -3], 50, 20, 14)],
  [at('v6', 0) - .1, 'end', 'night', 'stand', P([0, 3, -6], 0, 6, 18), P([0, 3, -6], 0, 4, 16)],
];
let SHOTS = SH();
function shotAt(t) { let i = 0; while (i < SHOTS.length - 1 && t >= SHOTS[i + 1][0]) i++; return { i, t0: SHOTS[i][0], t1: i < SHOTS.length - 1 ? SHOTS[i + 1][0] : DUR, name: SHOTS[i][1], loc: SHOTS[i][2], nap: SHOTS[i][3], A: SHOTS[i][4], B: SHOTS[i][5] }; }

// —— shake: punches at the hook, lid, sting ——
const PUNCH = () => [[TI(), 1.6], [at('h1', K.eyes), .6], [at('v2', 'dolares'), .8], [at('v3', 'theo'), .5], [at('v4', 'milhares'), .5], [at('v5', 'comenta'), .4], [at('p1', 'curso'), .4], [at('v6', 'comentar'), .5]];
function shake(t) { let a = 0; for (const [pt, v] of PUNCH()) if (t >= pt && t < pt + .6) a += v * Math.exp(-(t - pt) * 9); return [Math.sin(t * 73) * a, Math.cos(t * 61) * a, a]; }

const DEG = Math.PI / 180;
let CAM = {};
function cam(t) {
  const s = shotAt(t), u = seg(t, s.t0, s.t1), e = eio(u);
  const A = s.A, B = s.B;
  let tg = A.follow ? (() => { const p = world.R.mj.g.position; return [p.x, 1.0, p.z]; })() : A.tg.map((v, i) => lerp(v, B.tg[i], e));
  let az = lerp(A.az, B.az, e), el = lerp(A.el, B.el, e), dist = lerp(A.dist, B.dist, e);
  // cut punch: every new shot lands 8% tighter and settles
  dist *= 1 - .08 * (1 - eo(seg(t, s.t0, s.t0 + .35)));
  if (s.i > 0) { const w = 1 - eo(seg(t, s.t0, s.t0 + .2)); az += (s.i % 2 ? 1 : -1) * 32 * w; }   // whip-in on every cut
  for (const c of CAPS) if (c.big && t >= c.t0 && t < c.t0 + .6) dist *= 1 - .09 * Math.exp(-(t - c.t0) * 7);   // punch on the numbers
  if (s.name === 'face') { const k = eo(seg(t, at('h1', K.eyes), at('h1', K.eyes) + .25)); dist *= lerp(1, .72, k) * lerp(2.0, 1, eo(seg(t, 0, .5))); }   // frame 0 already rushing in   // crash-in when the eyes open
  
  const [sx, sy, sa] = shake(t);
  if (s.name === 'vortex') {   // looking up into the swirling sky, rolling and zooming in
    const r = t * 1.6 + 2 * eo(seg(t, TI() - .5, TI())); camera.position.set(0, 1, 2); camera.up.set(Math.sin(r), Math.cos(r), 0); camera.lookAt(6, 40, -40);
    camera.near = .1; camera.far = 600; camera.fov = lerp(75, 22, eo(seg(t, 0, TI()))); camera.updateProjectionMatrix();
    post.tilt.band.value = .1; post.tilt.maxR.value = 6 * SSAA; CAM = { s, tg: [0, 40, -40], dist: 40 }; return;
  }
  const ce = Math.cos(el * DEG);
  camera.position.set(tg[0] + dist * ce * Math.sin(az * DEG), tg[1] + dist * Math.sin(el * DEG), tg[2] + dist * ce * Math.cos(az * DEG));
  if (s.name === 'face') camera.up.set(0, 0, -1); else camera.up.set(0, 1, 0);
  camera.lookAt(tg[0], tg[1], tg[2]);
  camera.translateX(sx * .03 * dist); camera.translateY(sy * .03 * dist);
  camera.near = A.clip ? Math.max(.1, dist - A.clip) : .1; camera.far = 400; camera.fov = 30; camera.updateProjectionMatrix();
  post.tilt.fy.value = .5; post.tilt.band.value = .26; post.tilt.maxR.value = (s.name === 'poll' ? 10 : 4) * SSAA;
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
  const L1 = ['E SE VAN GOGH', 'ACORDASSE...'];
  L1.forEach((l, i) => { const p = lerp(.75, 1, back(seg(t, i * .04, i * .04 + .2), 2.2)); g.save(); g.translate(W / 2, y0 + i * 92 * S); g.scale(p, p); txt(l, 0, 0, 86 * S, '#fff', { max: 980 * S }); g.restore(); });
  const p2 = lerp(.7, 1, back(seg(t, .06, .3), 2.4));
  g.save(); g.translate(W / 2, y0 + 245 * S); g.scale(p2, p2);
  g.font = `900 ${150 * S}px Overpass`; const wa = g.measureText('EM ').width, wb = g.measureText('2026?').width, x = -(wa + wb) / 2;
  txt('EM ', x, 0, 150 * S, '#fff', { align: 'left' }); txt('2026?', x + wa, 0, 150 * S, GOLD, { align: 'left' });
  g.restore(); g.restore();
  TXT.push({ id: 'hook', text: 'E SE VAN GOGH ACORDASSE... EM 2026?', x0: 50, y0: y0 - 60, x1: W - 50, y1: y0 + 330 });
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
  if (t < end('h1') + .1 || t >= at('v6', 'agora') - .1) return;
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
function phoneUI(t) {   // v2: 1 painting sold in life vs 100 million dollars today
  const t0 = at('v2', 0), t1 = at('v3', 0) - .1, th = at('v2', 'hoje') - .1; if (t < t0 || t > t1) return;
  const a = seg(t, t0, t0 + .25) * (1 - seg(t, t1 - .2, t1));
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(14,22,48,.86)'; rr(60 * S, 280 * S, 960 * S, 460 * S, 30 * S); g.fill();
  txt('EM VIDA', 120 * S, 350 * S, 36 * S, '#aab4c3', { align: 'left', sw: 0, f: '"Overpass Mono"', w: 700 });
  const p1 = back(seg(t, at('v2', 'quadro') - .1, at('v2', 'quadro') + .2), 2.4); if (p1 > 0) { g.save(); g.translate(180 * S, 440 * S); g.scale(p1, p1); g.font = `${80 * S}px "Noto Color Emoji"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🖼️', 0, 0); g.restore(); txt('1 QUADRO VENDIDO', 270 * S, 440 * S, 50 * S, '#fff', { align: 'left', sw: 0 }); }
  if (t >= th) { txt('HOJE', 120 * S, 560 * S, 36 * S, '#ffd9a0', { align: 'left', sw: 0, f: '"Overpass Mono"', w: 700 });
    const u = Math.pow(seg(t, th + .1, at('v2', 'dolares') + .2), 2); txt('US$ ' + fmt(lerp(0, 100000000, u)) + '+', W / 2, 650 * S, 78 * S, GOLD, { sw: .1 }); }
  g.restore();
}
function ruler(t) {   // v3: 2,000 works in 10 years, only Theo believed
  const t0 = at('v3', 'pintou') - .1, t1 = at('c1', 0) - .1; if (t < t0 || t > t1) return;
  const a = seg(t, t0, t0 + .2) * (1 - seg(t, t1 - .2, t1));
  g.save(); g.globalAlpha = a;
  for (let i = 0; i < 18; i++) { const u = ((t - t0) * .5 + hash(i)) % 1; g.save(); g.translate((hash(i + 4) * 900 + 90) * S, lerp(-150, 1300, u) * S); g.rotate(t + i); g.fillStyle = ['#f2b51a', '#3a6cc0', '#2a8a4a', '#d84a2a'][i % 4]; g.fillRect(-40 * S, -50 * S, 80 * S, 100 * S); g.strokeStyle = '#6b4a2e'; g.lineWidth = 6 * S; g.strokeRect(-40 * S, -50 * S, 80 * S, 100 * S); g.restore(); }
  const n = Math.round(lerp(0, 2000, eo(seg(t, t0, at('v3', 'trabalhos') + .3))));
  g.fillStyle = 'rgba(14,22,48,.85)'; rr(140 * S, 300 * S, 800 * S, 200 * S, 26 * S); g.fill();
  txt(fmt(n) + ' OBRAS', W / 2, 375 * S, 84 * S, GOLD, { sw: 0 }); if (t >= at('v3', 'dez') - .1) txt('EM SÓ 10 ANOS', W / 2, 455 * S, 44 * S, '#fff', { sw: 0 });
  if (t >= at('v3', 'theo') - .2) { const p = back(seg(t, at('v3', 'theo') - .2, at('v3', 'theo') + .15), 2.2); g.translate(W / 2, 640 * S); g.scale(p, p); g.fillStyle = '#f4ecd2'; rr(-380 * S, -70 * S, 760 * S, 140 * S, 18 * S); g.fill(); txt('✉️ THEO, O IRMÃO', 0, -14 * S, 50 * S, '#3a2a1a', { sw: 0 }); txt('o único que acreditou', 0, 40 * S, 34 * S, '#6b4a2e', { sw: 0, w: 700 }); }
  g.restore();
}
function star(x, y, r, col) { g.beginPath(); for (let i = 0; i < 10; i++) { const rr_ = i % 2 ? r * .45 : r, an = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(x + Math.cos(an) * rr_, y + Math.sin(an) * rr_); } g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 4 * S; g.strokeStyle = '#14110f'; g.stroke(); }
function euStars(t) {   // v4: the immersive exhibition
  const t0 = at('v4', 'exposicao') - .1, t1 = at('v5', 0) - .1; if (t < t0 || t > t1) return;
  const p = back(seg(t, t0, t0 + .35), 1.8), a = 1 - seg(t, t1 - .2, t1);
  g.save(); g.globalAlpha = a; g.translate(W / 2, 380 * S); g.scale(p, p); g.fillStyle = '#ffffff'; rr(-400 * S, -80 * S, 800 * S, 160 * S, 80 * S); g.fill();
  txt('🎟️ EXPOSIÇÃO IMERSIVA', 0, 6 * S, 56 * S, '#14110f', { sw: 0 }); g.restore();
  if (t >= at('v4', 'milhares') - .1) { g.save(); g.globalAlpha = a; for (let i = 0; i < 12; i++) { const u = ((t - t0) * .7 + hash(i)) % 1; g.globalAlpha = a * (1 - u); g.font = `${54 * S}px "Noto Color Emoji"`; g.fillText(['😍', '📸', '❤️'][i % 3], (hash(i + 2) * 900 + 90) * S, (1300 - u * 700) * S); } g.restore(); }
}
const COMMENTS = ['não entendi nada kkk', 'cadê o gato?', 'explica de novo 🤯', 'sigma físico 🗿'];
function live(t) {   // v5: poll — art that sells or art that moves?
  const t0 = at('v5', 0) - .05, t1 = at('p1', 0) - .1; if (t < t0 || t > t1) return;
  const p = back(seg(t, t0, t0 + .3), 1.8), a = 1 - seg(t, t1 - .2, t1);
  g.save(); g.globalAlpha = a; g.translate(W / 2, 660 * S); g.scale(p, p);
  g.fillStyle = 'rgba(255,255,255,.96)'; rr(-450 * S, -300 * S, 900 * S, 600 * S, 34 * S); g.fill();
  txt('ARTE BOA É A QUE...', 0, -190 * S, 60 * S, '#14110f', { sw: 0 });
  [['💰 VENDE', '#0b8a4a', -40], ['❤️ EMOCIONA', '#d22b4a', 90]].forEach(([tx, c, y], i) => {
    g.fillStyle = '#eef0f3'; rr(-380 * S, (y - 45) * S, 760 * S, 90 * S, 45 * S); g.fill();
    const f = .5 + .45 * Math.sin(t * 3 + i * 2.2); g.fillStyle = c; g.globalAlpha = a * .3; rr(-380 * S, (y - 45) * S, 760 * S * f, 90 * S, 45 * S); g.fill(); g.globalAlpha = a;
    txt(tx, 0, (y + 4) * S, 50 * S, '#14110f', { sw: 0 }); });
  const pul = 1 + .06 * Math.sin(t * 8); g.save(); g.translate(0, 220 * S); g.scale(pul, pul); g.fillStyle = GOLD; rr(-240 * S, -50 * S, 480 * S, 100 * S, 50 * S); g.fill(); txt('💬 COMENTA', 0, 5 * S, 54 * S, '#14110f', { sw: 0 }); g.restore();
  g.restore();
}
let AVATAR = null; { const im = new Image(); im.src = 'avatar.png'; AVATAR = im; }
function ctaCard(t) {   // c1: like + follow
  const t0 = at('c1', 0), t1 = at('v4', 0) - .05; if (t < t0 || t > t1 + .3) return;
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
  const t0 = at('v6', 'agora') - .1; if (t < t0) return;
  const a = seg(t, t0, t0 + .3);
  g.fillStyle = `rgba(8,10,20,${.55 * a})`; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = a; const p = back(seg(t, t0, t0 + .3), 2);
  g.translate(W / 2, 640 * S); g.scale(p, p);
  txt('QUEM A GENTE', 0, 0, 104 * S, '#fff'); txt('ACORDA NO', 0, 112 * S, 104 * S, '#fff'); txt('PRÓXIMO?', 0, 236 * S, 132 * S, GOLD);
  g.restore();
  const CH = ['TIRADENTES?', 'DA VINCI?', 'FRIDA KAHLO?', 'MARIE CURIE?'];
  CH.forEach((c, i) => { const u = back(seg(t, t0 + .4 + i * .12, t0 + .7 + i * .12), 2.2); const x = W / 2 + ((i % 2) ? 1 : -1) * 225 * S, y = 1060 * S + Math.floor(i / 2) * 110 * S;
    g.save(); g.globalAlpha = a * clamp(u); g.translate(x, y); g.scale(u, u); g.fillStyle = 'rgba(255,255,255,.95)'; rr(-205 * S, -42 * S, 410 * S, 84 * S, 42 * S); g.fill(); txt(c, 0, 3 * S, 48 * S, '#14110f', { sw: 0 }); g.restore(); });
  const pa = seg(t, t0 + .9, t0 + 1.2), pul = 1 + .05 * Math.sin(t * 7);
  g.save(); g.globalAlpha = pa; g.translate(W / 2, 1330 * S); g.scale(pul, pul); g.fillStyle = GOLD; rr(-260 * S, -60 * S, 520 * S, 120 * S, 60 * S); g.fill(); g.lineWidth = 6 * S; g.strokeStyle = '#14110f'; g.stroke();
  txt('💬 COMENTA', 0, 6 * S, 64 * S, '#14110f', { sw: 0 }); g.restore();
  const pf = back(seg(t, at('v6', 'proximo') - .05, at('v6', 'proximo') + .3), 2);
  if (t >= at('v6', 'proximo') - .05) { g.save(); g.translate(W / 2, 1480 * S); g.scale(pf, pf); g.fillStyle = '#4f5bf7'; rr(-330 * S, -50 * S, 660 * S, 100 * S, 50 * S); g.fill(); txt('➕ SEGUE PRO PRÓXIMO', 0, 5 * S, 48 * S, '#fff', { sw: 0 }); g.restore(); }
  TXT.push({ id: 'end', text: 'QUEM A GENTE ACORDA NO PRÓXIMO?', x0: 60, y0: 560, x1: W - 60, y1: 1400 });
}
function progress(t) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, 12 * S); g.fillStyle = GOLD; g.fillRect(0, 0, W * t / DUR, 12 * S); }
function ecg(t) {   // flatline -> heartbeat when the eyes open (cold open only)
  const t1 = end('h1') + .15; if (t > t1 + .2 || t < TI()) return;
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
  txt(alive ? 'SINAIS VITAIS: DE VOLTA' : 'MORTO DESDE 1890', x0 + 10 * S, y0 - 58 * S, 32 * S, '#fff', { align: 'left', f: '"Overpass Mono"', w: 700, sw: 0 });
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
  g.lineWidth = 14 * S; g.strokeStyle = '#e8262e'; rr(-400 * S, -95 * S, 800 * S, 190 * S, 18 * S); g.stroke();
  txt('💰 US$ 100 MI+', 0, 8 * S, 100 * S, '#e8262e', { sw: 0 }); g.restore();
  TXT.push({ id: 'frz', text: 'BAIXINHO', x0: 200, y0: 660, x1: 880, y1: 860 });
}
function raffle(t) {   // v6: comment + follow + repost = chance to appear in the next videos
  const t0 = at('v6', 'comentar') - .15, t1 = at('v6', 'agora') - .1; if (t < t0 || t > t1) return;
  const p = back(seg(t, t0, t0 + .35), 1.8), a = 1 - seg(t, t1 - .2, t1);
  g.save(); g.globalAlpha = a; g.translate(W / 2, 640 * S); g.scale(p, p);
  g.fillStyle = '#ffffff'; rr(-450 * S, -320 * S, 900 * S, 640 * S, 34 * S); g.fill(); g.lineWidth = 8 * S; g.strokeStyle = GOLD; g.stroke();
  txt('🎁 SORTEIO', 0, -240 * S, 80 * S, '#14110f', { sw: 0 });
  [['💬 COMENTA', 'comentar'], ['➕ SEGUE', 'seguir'], ['🔁 REPUBLICA', 'republicar']].forEach(([tx, wd], i) => { const on = t >= at('v6', wd) - .05, q = on ? back(seg(t, at('v6', wd) - .05, at('v6', wd) + .2), 2.4) : 0;
    txt(tx, -120 * S, (-110 + i * 95) * S, 52 * S, '#14110f', { sw: 0, align: 'left' }); if (q > 0) { g.save(); g.translate(-190 * S, (-110 + i * 95) * S); g.scale(q, q); g.font = `${56 * S}px "Noto Color Emoji"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✅', 0, 0); g.restore(); } });
  if (t >= at('v6', 'concorre') - .1) { g.fillStyle = '#ff2d55'; rr(-410 * S, 175 * S, 820 * S, 110 * S, 30 * S); g.fill(); txt('PODE APARECER NO', 0, 210 * S, 40 * S, '#fff', { sw: 0 }); txt('PRÓXIMO VÍDEO! 🎬', 0, 258 * S, 40 * S, '#fff', { sw: 0 }); }
  g.restore(); TXT.push({ id: 'raffle', text: 'SORTEIO', x0: 90, y0: 320, x1: W - 90, y1: 960 });
}
function promo(t) {   // p1: the course — behind-the-scenes look + offer card + editor timeline
  const t0 = at('p1', 0) - .1, t1 = at('v6', 0) - .1; if (t < t0 || t > t1) return;
  const a = seg(t, t0, t0 + .2) * (1 - seg(t, t1 - .2, t1)), p = back(seg(t, at('p1', 'curso') - .1, at('p1', 'curso') + .25), 1.8);
  g.save(); g.globalAlpha = a;
  // editor timeline at the bottom: tracks, keyframes, a moving playhead
  const y0 = 1500 * S; g.fillStyle = 'rgba(18,20,26,.92)'; rr(40 * S, y0, W - 80 * S, 230 * S, 20 * S); g.fill();
  ['CÂMERA', 'PERSONAGEM', 'LUZES'].forEach((n, i) => { const yy = y0 + (45 + i * 62) * S; txt(n, 70 * S, yy, 26 * S, '#9aa3b2', { align: 'left', sw: 0, f: '"Overpass Mono"', w: 700 });
    g.fillStyle = ['#4f8cff', '#ffd23f', '#ff5fd2'][i]; for (let k = 0; k < 9; k++) { const kx = (260 + k * 85 + (i * 23) % 40) * S; g.save(); g.translate(kx, yy); g.rotate(Math.PI / 4); g.fillRect(-9 * S, -9 * S, 18 * S, 18 * S); g.restore(); } });
  const ph = (260 + ((t - t0) / (t1 - t0)) * 720) * S; g.fillStyle = '#ff3b3b'; g.fillRect(ph, y0 + 10 * S, 5 * S, 210 * S);
  if (t >= at('p1', 'curso') - .1) {
    g.save(); g.translate(W / 2, 640 * S); g.scale(p, p); g.fillStyle = '#ffffff'; rr(-450 * S, -250 * S, 900 * S, 500 * S, 34 * S); g.fill(); g.lineWidth = 8 * S; g.strokeStyle = '#14110f'; g.stroke();
    txt('🎬 QUADRO A QUADRO', 0, -170 * S, 64 * S, '#14110f', { sw: 0 }); txt('APRENDA A FAZER', 0, -85 * S, 50 * S, '#14110f', { sw: 0 }); txt('ESSAS ANIMAÇÕES', 0, -30 * S, 50 * S, '#14110f', { sw: 0 });
    g.fillStyle = '#ff2d55'; rr(-330 * S, 20 * S, 660 * S, 90 * S, 45 * S); g.fill(); txt('🔥 OFERTA DE LANÇAMENTO', 0, 68 * S, 44 * S, '#fff', { sw: 0 });
    txt('quadroaquadroonline.com.br', 0, 165 * S, 36 * S, '#4f5bf7', { sw: 0, w: 800 });
    g.restore();
    if (t >= at('p1', 'link') - .1) { const q = back(seg(t, at('p1', 'link') - .1, at('p1', 'link') + .2), 2.4), bob = Math.sin(t * 8) * 10 * S;
      g.save(); g.translate(W / 2, 1030 * S + bob); g.scale(q, q); g.fillStyle = GOLD; rr(-280 * S, -55 * S, 560 * S, 110 * S, 55 * S); g.fill(); g.lineWidth = 6 * S; g.strokeStyle = '#14110f'; g.stroke(); txt('👆 LINK NA BIO', 0, 5 * S, 56 * S, '#14110f', { sw: 0 }); g.restore(); }
  }
  g.restore(); TXT.push({ id: 'promo', text: 'QUADRO A QUADRO LINK NA BIO', x0: 90, y0: 390, x1: W - 90, y1: 1090 });
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
function splat(t) {
  const ti = TI(); if (t < ti - .05 || t > ti + .6) return;
  const u = seg(t, ti - .05, ti + .08), fade = 1 - seg(t, ti + .25, ti + .6);
  g.save(); g.globalAlpha = fade;
  [['#f2c21a', 540, 900, 700], ['#2a5fc0', 300, 600, 380], ['#f2a01a', 820, 1300, 420], ['#ffffff', 640, 700, 160]].forEach(([c, x, y, r], i) => {
    g.fillStyle = c; g.beginPath(); for (let k = 0; k <= 24; k++) { const an = k / 24 * TAU, rr_ = r * S * eo(u) * (.75 + .35 * hash(k + i * 31)); g.lineTo(x * S + Math.cos(an) * rr_, y * S + Math.sin(an) * rr_); } g.closePath(); g.fill();
    for (let d = 0; d < 6; d++) { const an = hash(d + i * 9) * TAU, dist = r * S * eo(u) * 1.4; g.beginPath(); g.arc(x * S + Math.cos(an) * dist, y * S + Math.sin(an) * dist, 26 * S * eo(u), 0, TAU); g.fill(); } });
  g.restore();
}
function embers(t) {   // fire shot: orange glow + embers rising
  if (CAM.s.loc !== 'mus') return;
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,90,20,.28)'); gr.addColorStop(.6, 'rgba(255,60,10,.08)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) { const u = ((t * (.25 + hash(i) * .3)) + hash(i + 9)) % 1, x = (hash(i + 3) * W) + Math.sin(t * 2 + i) * 30 * S, y = H * (1 - u); g.fillStyle = `rgba(255,${120 + hash(i) * 100 | 0},40,${.8 * (1 - u)})`; g.beginPath(); g.arc(x, y, (2 + hash(i + 5) * 4) * S, 0, TAU); g.fill(); }
  g.restore();
}
function hud(t) {
  g.clearRect(0, 0, W, H); TXT.length = 0;
  embers(t); splat(t);
  cctv(t); promo(t); raffle(t);
  if (QS.has('cover')) { g.save(); g.translate(0, 270 * S); hook(.8); g.restore(); return; }
  flashes(t);
  counter(t, 'ANOS DESDE A MORTE', 0, 136, at('v1', 0), at('v1', 'depois'), at('v2', 0) - .1);
  sticker(t, '🎨 NA NOITE ESTRELADA', at('v1', 'noite') - .1, at('v2', 0) - .1, 1650, '#3a6cc0');
  phoneUI(t); ruler(t); euStars(t); live(t); ctaCard(t);
  captions(t); hook(t); ecg(t); freezeStamp(t);
  sticker(t, '👀 ESPERA O FINAL', end('h1') + .3, at('v2', 0) - .1, 470);
  sticker(t, '🎁 SORTEIO NO FINAL', at('c1', 'segue') + .3, at('v4', 0) + .8, 1650, '#ff6b4a');
  endCard(t); progress(t);
}

// —— render ——
const SKY = { zen: new THREE.Color('#6fa8e8'), hor: new THREE.Color('#f3dcc0') };
const WIRE = new THREE.MeshBasicMaterial({ color: '#7CF29A', wireframe: true });
const FRZ = () => [at('v2', 'dolares') + .15, at('v2', 'dolares') + .95];
function render(t) {
  if (QS.has('cover')) t = +QS.get('cover');
  const [f0, f1] = FRZ(), t3 = t >= f0 && t < f1 ? f0 : t;   // the 3D world freezes, the overlay keeps going
  cam(t3);
  world.update(t3, CAM.s);
  const face = CAM.s.name === 'face', ex = CAM.s.loc === 'expo';
  hemi.intensity = ex ? 1.0 : face ? 1.1 : 1.35; hemi.color.set(ex ? '#cfe0ff' : '#9fb8ff');
  sun.intensity = ex ? .6 : 1.6; sun.color.set(ex ? '#ffffff' : '#ffe9a0');
  if (ex) { sun.position.set(60, 10, 8); sun.target.position.set(60, 0, 0); } else { sun.position.set(6, 12, 16); sun.target.position.set(0, 0, 0); }
  spot.intensity = 0;
  post.comp.zen.value.set('#0e1a40'); post.comp.hor.value.set('#22346a');
  scene.overrideMaterial = t >= at('p1', 0) - .1 && t < at('p1', 'curso') - .1 ? WIRE : null;
  const gd = post.grade; gd.sat.value = 1.12; gd.contrast.value = .12; gd.lift.value.setRGB(.01, .01, .02); gd.vig.value = .32; gd.fade.value = 1;
  // hook: the first frame is darker, the eyes open with a light hit
  if (CAM.s.name === 'face') gd.fade.value = t < at('h1', K.eyes) ? .82 : 1 + .3 * Math.exp(-(t - at('h1', K.eyes)) * 8);
  post.bloom.strength = .45;
  if (t >= TI() && t < TI() + .3) gd.fade.value = 1 + 1.6 * (1 - seg(t, TI(), TI() + .3));
  if (t >= f0 && t < f1) { gd.sat.value = .15; gd.contrast.value = .35; }
  post.composer.render();
  hud(t);
}
function events() {
  const ev = EVS.slice();
  VO.forEach(v => ev.push({ t: v.t, type: 'vo', id: v.id }));
  SHOTS.slice(1).forEach(s => ev.push({ t: s[0], type: 'cut', name: s[1] }));
  PUNCH().forEach(([t, v]) => ev.push({ t, type: 'punch', v }));
  ev.push({ t: TI(), type: 'flat', d: at('h1', K.eyes) - TI() }, { t: FRZ()[0], type: 'freeze' }, { t: end('h1') + .3, type: 'stick' }, { t: at('c1', 'segue') + .3, type: 'stick' });
  for (let k = 0; at('h1', K.eyes) + k * .5 < end('h1') + .2; k++) ev.push({ t: at('h1', K.eyes) + k * .5, type: 'beep' });
  CAPS.filter(c => c.big).forEach(c => ev.push({ t: c.t0, type: 'numpunch' }));
  ev.push({ t: at('v6', 'agora') - .1, type: 'end' }, { t: at('v2', 'quadro'), type: 'phone' }, { t: at('v3', 'pintou'), type: 'ruler' }, { t: at('v3', 'theo'), type: 'phone' }, { t: at('v4', 'exposicao'), type: 'phone' }, { t: at('v5', 0), type: 'live' }, { t: at('v1', 'noite'), type: 'stick' },
    { t: at('p1', 'curso'), type: 'promo' }, { t: at('p1', 'link'), type: 'like' }, { t: at('c1', 'curte'), type: 'like' }, { t: at('c1', 'segue') + .1, type: 'follow' }, { t: at('v6', 'proximo'), type: 'follow' },
    { t: at('v6', 'comentar'), type: 'tick' }, { t: at('v6', 'seguir'), type: 'tick' }, { t: at('v6', 'republicar'), type: 'tick' });
  return ev.sort((a, b) => a.t - b.t);
}
window.render = render; window.DUR = DUR; window.EV = events(); window.TEXTS = t => { render(t); return TXT; };
window.DBG = { camera, world, scene, post };
await document.fonts.load(`900 80px Overpass`); await document.fonts.load(`800 36px Overpass`); await document.fonts.load(`700 30px Overpass`); await document.fonts.load(`700 30px "Overpass Mono"`);
render(parseFloat(QS.get('t') ?? '1'));
window.READY = true;
