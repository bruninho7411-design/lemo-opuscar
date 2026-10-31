// E se Napoleão acordasse em 2026? — voxel diorama, vertical 1080x1920 (same family as the channel's "E SE…" films)
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
  [0, 'face', 'crypt', 'lie', P([0, 1.52, -.5], 0, 84, 2.3), P([0, 1.52, -.5], 0, 84, 1.9)],
  [at('v1', 0) - .1, 'tomb', 'crypt', 'lie', P([0, 1.3, 0], 38, 34, 13), P([0, 1.6, .2], 22, 26, 9.5)],
  [at('v2', 0) - .1, 'phones', 'crypt', 'none', P([0, 1.9, 5.6], 180, 9, 17, { clip: 7 }), P([0, 1.9, 5.6], 174, 8, 14, { clip: 7 })],
  [at('v3', 0) - .1, 'hands', 'crypt', 'stand', P([0, 1.25, 2.6], 6, 9, 5.2, { clip: 3.2 }), P([0, 1.3, 2.6], -4, 9, 4.2, { clip: 3.2 })],
  [at('v4', 0) - .1, 'viral', 'crypt', 'stand', P([0, 1.2, 2.6], 25, 18, 7, { clip: 3.4 }), P([0, 1.2, 2.6], 35, 22, 7.6, { clip: 3.4 })],
  [at('v5', 0) - .1, 'measure', 'crypt', 'stand', P([.45, 1.05, 2.6], 0, 5, 8.6, { clip: 3.0 }), P([.45, 1.05, 2.6], 0, 5, 8.2, { clip: 3.0 })],
  [at('v7', 0) - .1, 'sad', 'crypt', 'stand', P([0, 1.55, 2.6], -8, 4, 3.6, { clip: 2.0 }), P([0, 1.55, 2.6], -8, 4, 3.2, { clip: 2.0 })],
  [at('v8', 0) - .1, 'march', 'street', 'st', P(null, 12, 9, 6.5, { follow: 1 }), P(null, -6, 7, 6.0, { follow: 1 })],
  [at('v9', K.border) - .15, 'border', 'street', 'st', P([60, 1.6, -6.5], 205, 12, 9), P([60, 1.6, -6.5], 195, 10, 8)],
  [at('v10', K.live) - .1, 'live', 'street', 'st', P([60, 1.45, -4.8], 172, 6, 3.6), P([60, 1.45, -4.8], 178, 6, 3.0)],
];
let SHOTS = SH();
function shotAt(t) { let i = 0; while (i < SHOTS.length - 1 && t >= SHOTS[i + 1][0]) i++; return { i, t0: SHOTS[i][0], t1: i < SHOTS.length - 1 ? SHOTS[i + 1][0] : DUR, name: SHOTS[i][1], loc: SHOTS[i][2], nap: SHOTS[i][3], A: SHOTS[i][4], B: SHOTS[i][5] }; }

// —— shake: punches at the hook, lid, sting ——
const PUNCH = () => [[at('h1', K.eyes), 1], [at('v1', K.lid), .5], [at('v7', 'baixinho'), .8], [at('v9', 'tiro'), .5]];
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
  if (s.name === 'face') { const k = eo(seg(t, at('h1', K.eyes), at('h1', K.eyes) + .25)); dist *= lerp(1, .72, k); }   // crash-in when the eyes open
  if (s.name === 'sad') { const k = eo(seg(t, at('v7', 'baixinho'), at('v7', 'baixinho') + .2)); dist *= lerp(1, .78, k); }
  const [sx, sy, sa] = shake(t);
  const ce = Math.cos(el * DEG);
  camera.position.set(tg[0] + dist * ce * Math.sin(az * DEG), tg[1] + dist * Math.sin(el * DEG), tg[2] + dist * ce * Math.cos(az * DEG));
  if (s.name === 'face') camera.up.set(0, 0, -1); else camera.up.set(0, 1, 0);
  camera.lookAt(tg[0], tg[1], tg[2]);
  camera.translateX(sx * .03 * dist); camera.translateY(sy * .03 * dist);
  camera.near = A.clip ? Math.max(.1, dist - A.clip) : .1; camera.far = 400; camera.fov = 30; camera.updateProjectionMatrix();
  post.tilt.fy.value = .5; post.tilt.band.value = s.loc === 'street' ? .22 : .26; post.tilt.maxR.value = (s.name === 'viral' ? 9 : 4) * SSAA;
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
  const L1 = ['E SE NAPOLEÃO', 'ACORDASSE...'];
  L1.forEach((l, i) => { const p = back(seg(t, i * .05, i * .05 + .2), 2.2); g.save(); g.translate(W / 2, y0 + i * 92 * S); g.scale(p, p); txt(l, 0, 0, 86 * S, '#fff', { max: 980 * S }); g.restore(); });
  const p2 = back(seg(t, .12, .36), 2.4);
  g.save(); g.translate(W / 2, y0 + 245 * S); g.scale(p2, p2);
  g.font = `900 ${150 * S}px Overpass`; const wa = g.measureText('EM ').width, wb = g.measureText('2026?').width, x = -(wa + wb) / 2;
  txt('EM ', x, 0, 150 * S, '#fff', { align: 'left' }); txt('2026?', x + wa, 0, 150 * S, GOLD, { align: 'left' });
  g.restore(); g.restore();
  TXT.push({ id: 'hook', text: 'E SE NAPOLEÃO ACORDASSE... EM 2026?', x0: 50, y0: y0 - 60, x1: W - 50, y1: y0 + 330 });
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
  if (t < end('h1') + .1 || t >= at('v11', 0) - .05) return;
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
function flashes(t) {   // camera flashes from the crowd
  if (CAM.s.loc !== 'crypt' || t < at('v2', K.phonesUp) + .3 || t > at('v5', 0)) return;
  for (let i = 0; i < 6; i++) { const k = Math.floor(t * 3 + i * .37), u = (t * 3 + i * .37) % 1; if (hash(k * 7 + i) > .55 && u < .12) { g.fillStyle = `rgba(255,255,255,${.35 * (1 - u / .12)})`; g.fillRect(0, 0, W, H); } }
}
function phoneUI(t) {   // v4: the viral post, with the live picture inside the phone
  const t0 = at('v4', 0), t1 = at('v5', 0) - .1; if (t < t0 || t > t1) return;
  const inn = back(seg(t, t0, t0 + .35), 1.6), out = 1 - seg(t, t1 - .2, t1);
  const pw = 600 * S, ph = 1100 * S, x = (W - pw) / 2, y = 330 * S;
  g.save(); g.globalAlpha = out; g.translate(W / 2, y + ph / 2); g.scale(inn, inn); g.rotate(-.03); g.translate(-W / 2, -(y + ph / 2));
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 50 * S; g.fillStyle = '#0d0d0f'; rr(x - 18 * S, y - 18 * S, pw + 36 * S, ph + 36 * S, 70 * S); g.fill(); g.shadowBlur = 0;
  g.save(); rr(x, y, pw, ph, 54 * S); g.clip();
  const src = renderer.domElement, sw = src.width * .5, sh = sw * ph / pw; g.drawImage(src, (src.width - sw) / 2, (src.height - sh) * .42, sw, sh, x, y, pw, ph);
  const gr = g.createLinearGradient(0, y + ph * .55, 0, y + ph); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.8)'); g.fillStyle = gr; g.fillRect(x, y, pw, ph);
  txt('IMPERADOR BAIXINHO', x + 34 * S, y + ph - 190 * S, 44 * S, '#fff', { align: 'left', sw: 0 });
  txt('RESSUSCITA 😂😂', x + 34 * S, y + ph - 138 * S, 44 * S, '#fff', { align: 'left', sw: 0 });
  txt('▶ ' + fmt(lerp(0, 10000000, Math.pow(seg(t, t0 + .3, at('v4', 'milhoes') + .3), 2.2))) + ' views', x + 34 * S, y + ph - 70 * S, 36 * S, GOLD, { align: 'left', w: 700, f: '"Overpass Mono"', sw: 0 });
  // floating hearts on the right
  for (let i = 0; i < 14; i++) { const u = ((t - t0) * .8 + hash(i)) % 1; g.globalAlpha = out * (1 - u); g.font = `${46 * S}px "Noto Color Emoji"`; g.fillText(['❤️', '😂', '🔥', '🤏'][i % 4], x + pw - 90 * S + Math.sin(u * 8 + i) * 20 * S, y + ph - 140 * S - u * 600 * S); }
  g.restore(); g.restore();
}
function ruler(t) {   // v5–v6: heights
  if (CAM.s.name !== 'measure') return;
  const R = world.R;
  const draw = (who, val, color, t0, ttl) => {
    if (t < t0) return; const p = who.g.position, sc = who.g.scale.y, top = (0.62 + .56 + .42) * sc;
    const [x, yTop] = proj(p.x, top, p.z), [, yF] = proj(p.x, 0, p.z), grow = eio(seg(t, t0, t0 + .9)), yNow = lerp(yF, yTop, grow);
    const lx = x + (who === R.napStand ? -190 : 190) * S;
    g.save(); g.fillStyle = color; g.fillRect(lx - 14 * S, yNow, 28 * S, yF - yNow); g.strokeStyle = '#111'; g.lineWidth = 3 * S; g.strokeRect(lx - 14 * S, yNow, 28 * S, yF - yNow);
    const per = (yF - yTop) / 17; for (let k = 0; k * per <= yF - yNow; k++) { g.beginPath(); g.moveTo(lx - 14 * S, yF - k * per); g.lineTo(lx + (k % 5 ? 0 : 12) * S, yF - k * per); g.stroke(); }
    g.setLineDash([16 * S, 10 * S]); g.strokeStyle = color; g.lineWidth = 5 * S; g.beginPath(); g.moveTo(lx, yNow); g.lineTo(x, yNow); g.stroke(); g.setLineDash([]);
    const pop = back(seg(t, t0 + .8, t0 + 1.1), 2.4);
    g.translate(lx, yNow - 60 * S); g.scale(pop, pop); txt(ttl, 0, 0, 74 * S, color, { sw: .16 }); g.restore();
  };
  draw(R.napStand, 1.69, GOLD, at('v5', 'metro'), '1,69 M');
  if (t >= at('v5', 'acima')) { const a = seg(t, at('v5', 'acima'), at('v5', 'acima') + .3) * (1 - seg(t, at('v6', 0), at('v6', 0) + .2)); g.save(); g.globalAlpha = a; txt('MÉDIA EM 1800: 1,65 M', W / 2, 420 * S, 54 * S, '#fff'); g.restore(); }
  draw(R.tall, 1.75, '#7CF29A', at('v6', 'setenta'), '1,75 M+');
}
function euStars(t) {   // v9: the border is gone
  const t0 = at('v9', K.border); if (t < t0 || t > at('v10', K.live) - .1) return;
  const a = seg(t, t0, t0 + .3), cx = W / 2, cy = 640 * S, r = 210 * S;
  g.save(); g.globalAlpha = a;
  for (let i = 0; i < 12; i++) { const ang = i / 12 * TAU + t * .6, p = back(seg(t, t0 + i * .05, t0 + i * .05 + .3), 2.5); g.save(); g.translate(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); g.scale(p, p); g.font = `${58 * S}px "Noto Color Emoji"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⭐', 0, 0); g.restore(); }
  const p2 = back(seg(t, t0 + .4, t0 + .7), 2);
  g.translate(cx, cy); g.scale(p2, p2); txt('SEM FRONTEIRA', 0, -20 * S, 70 * S, '#fff'); txt('SEM UM TIRO', 0, 60 * S, 52 * S, GOLD);
  g.restore();
}
const COMMENTS = ['volta pro caixão kkkk', 'IMPERADOR DO TIKTOK 👑', 'baixinho 🤏', 'cadê a Josefina?', 'faz o code civil 2', 'skibidi bonaparte'];
function live(t) {   // v10–v11: Napoleon goes live
  const t0 = at('v10', K.live); if (t < t0) return;
  const a = seg(t, t0, t0 + .25);
  g.save(); g.globalAlpha = a;
  g.fillStyle = '#ff2d55'; rr(60 * S, 170 * S, 170 * S, 64 * S, 12 * S); g.fill(); txt('AO VIVO', 145 * S, 204 * S, 36 * S, '#fff', { sw: 0 });
  g.fillStyle = 'rgba(0,0,0,.55)'; rr(245 * S, 170 * S, 230 * S, 64 * S, 12 * S); g.fill();
  txt('👁 ' + fmt(lerp(3, 1800000, Math.pow(seg(t, t0, DUR), 1.6))), 360 * S, 204 * S, 34 * S, '#fff', { sw: 0, f: '"Overpass Mono"', w: 700 });
  const n = Math.floor((t - t0) * 1.6);
  for (let k = 0; k < Math.min(4, n + 1); k++) {
    const i = n - k; if (i < 0) break; const u = seg(t, t0 + i / 1.6, t0 + i / 1.6 + .25), y = 1160 * S - k * 72 * S - (1 - u) * 30 * S;
    g.globalAlpha = a * u * (1 - k * .2); g.fillStyle = 'rgba(0,0,0,.45)'; const s = '@fã' + (100 + i * 37) + '  ' + COMMENTS[i % COMMENTS.length];
    g.font = `800 ${36 * S}px Overpass`; const w = g.measureText(s).width; rr(56 * S, y - 30 * S, w + 40 * S, 60 * S, 30 * S); g.fill(); txt(s, 76 * S, y + 2 * S, 36 * S, '#fff', { align: 'left', sw: 0, w: 800 });
  }
  g.globalAlpha = a; for (let i = 0; i < 10; i++) { const u = ((t - t0) * .7 + hash(i + 3)) % 1; g.globalAlpha = a * (1 - u); g.font = `${50 * S}px "Noto Color Emoji"`; g.fillText(['❤️', '👑', '😂'][i % 3], W - 120 * S + Math.sin(u * 7 + i) * 24 * S, 1300 * S - u * 700 * S); }
  g.restore();
}
function endCard(t) {
  const t0 = at('v11', 0) - .05; if (t < t0) return;
  const a = seg(t, t0, t0 + .3);
  g.fillStyle = `rgba(8,10,20,${.55 * a})`; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = a; const p = back(seg(t, t0, t0 + .3), 2);
  g.translate(W / 2, 640 * S); g.scale(p, p);
  txt('QUEM A GENTE', 0, 0, 104 * S, '#fff'); txt('ACORDA NO', 0, 112 * S, 104 * S, '#fff'); txt('PRÓXIMO?', 0, 236 * S, 132 * S, GOLD);
  g.restore();
  const CH = ['CLEÓPATRA', 'EINSTEIN', 'DOM PEDRO I', 'JÚLIO CÉSAR'];
  CH.forEach((c, i) => { const u = back(seg(t, t0 + .4 + i * .12, t0 + .7 + i * .12), 2.2); const x = W / 2 + ((i % 2) ? 1 : -1) * 225 * S, y = 1060 * S + Math.floor(i / 2) * 110 * S;
    g.save(); g.globalAlpha = a * clamp(u); g.translate(x, y); g.scale(u, u); g.fillStyle = 'rgba(255,255,255,.95)'; rr(-205 * S, -42 * S, 410 * S, 84 * S, 42 * S); g.fill(); txt(c + '?', 0, 3 * S, 44 * S, '#14110f', { sw: 0 }); g.restore(); });
  const pa = seg(t, t0 + .9, t0 + 1.2), pul = 1 + .05 * Math.sin(t * 7);
  g.save(); g.globalAlpha = pa; g.translate(W / 2, 1330 * S); g.scale(pul, pul); g.fillStyle = GOLD; rr(-260 * S, -60 * S, 520 * S, 120 * S, 60 * S); g.fill(); g.lineWidth = 6 * S; g.strokeStyle = '#14110f'; g.stroke();
  txt('💬 COMENTA', 0, 6 * S, 64 * S, '#14110f', { sw: 0 }); g.restore();
  TXT.push({ id: 'end', text: 'QUEM A GENTE ACORDA NO PRÓXIMO?', x0: 60, y0: 560, x1: W - 60, y1: 1400 });
}
function hud(t) {
  g.clearRect(0, 0, W, H); TXT.length = 0;
  flashes(t);
  counter(t, 'ANOS DESDE A MORTE', 0, 205, at('v1', 0), at('v1', 'depois'), at('v2', 0) - .1);
  counter(t, 'CELULARES APONTADOS', 0, 50, at('v2', K.phonesUp), at('v2', K.phonesUp) + .9, at('v3', 0) - .1, GOLD);
  phoneUI(t); ruler(t); euStars(t); live(t);
  captions(t); hook(t); endCard(t);
}

// —— render ——
const SKY = { zen: new THREE.Color('#6fa8e8'), hor: new THREE.Color('#f3dcc0') };
function render(t) {
  cam(t);
  world.update(t, CAM.s);
  const street = CAM.s.loc === 'street';
  hemi.intensity = street ? 1.5 : 1.25; hemi.color.set(street ? '#dfeeff' : '#ffe2bf');
  sun.intensity = street ? 2.6 : 1.7; spot.intensity = street ? 0 : CAM.s.name === 'face' ? 14 : 120;
  if (CAM.s.name === 'face') { hemi.intensity = .9; sun.intensity = 1.1; }
  if (street) { sun.position.set(60 + 20, 30, 10); sun.target.position.set(60, 0, -4); } else if (CAM.s.name === 'phones') { sun.position.set(-3, 14, -10); sun.target.position.set(0, 0, 5); } else { sun.position.set(4, 18, 14); sun.target.position.set(0, 0, 2); }
  post.comp.zen.value.copy(street ? SKY.zen : new THREE.Color('#2a2118')); post.comp.hor.value.copy(street ? SKY.hor : new THREE.Color('#4a3b2c'));
  const gd = post.grade; gd.sat.value = 1.12; gd.contrast.value = .12; gd.lift.value.setRGB(.01, .01, .02); gd.vig.value = .32; gd.fade.value = 1;
  // hook: the first frame is darker, the eyes open with a light hit
  if (CAM.s.name === 'face') gd.fade.value = t < at('h1', K.eyes) ? .82 : 1 + .3 * Math.exp(-(t - at('h1', K.eyes)) * 8);
  post.bloom.strength = .45;
  post.composer.render();
  hud(t);
}
function events() {
  const ev = EVS.slice();
  VO.forEach(v => ev.push({ t: v.t, type: 'vo', id: v.id }));
  SHOTS.slice(1).forEach(s => ev.push({ t: s[0], type: 'cut', name: s[1] }));
  PUNCH().forEach(([t, v]) => ev.push({ t, type: 'punch', v }));
  ev.push({ t: at('v7', 'baixinho'), type: 'sting' }, { t: at('v9', K.border), type: 'stars' }, { t: at('v10', K.live), type: 'live' }, { t: at('v11', 0), type: 'end' },
    { t: at('v4', 0), type: 'phone' }, { t: at('v5', 'metro'), type: 'ruler' }, { t: at('v6', 'setenta'), type: 'ruler' });
  return ev.sort((a, b) => a.t - b.t);
}
window.render = render; window.DUR = DUR; window.EV = events(); window.TEXTS = t => { render(t); return TXT; };
window.DBG = { camera, world, scene, post };
await document.fonts.load(`900 80px Overpass`); await document.fonts.load(`700 30px "Overpass Mono"`);
render(parseFloat(QS.get('t') ?? '1'));
window.READY = true;
