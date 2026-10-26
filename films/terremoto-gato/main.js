// POV: um terremoto 8.0 — Low-poly Isometric, vertical
import * as THREE from 'three';
import { clamp, seg, ss, eio, eo, lerp, hash, TAU } from '/core/lib.js';
import { DUR, T, VO, TILES, TITLE, BEAT, shotAt } from './story.js';
import { makePost } from './post.js';
import { buildWorld, shakeAmp, shakeVec, EVS } from './room.js';

const QS = new URLSearchParams(location.search);
const W = innerWidth || 1080, H = innerHeight || 1920;
const SSAA = +(QS.get('ssaa') ?? 2);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 1600);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, aoRadius: .5, aoScale: 1.4, aoThickness: .8 });
post.bloom.threshold = .9; post.bloom.radius = .5;

const world = buildWorld(scene);

// —— lights: moonlight through the window, a cool sky fill ——
const hemi = new THREE.HemisphereLight('#56609c', '#221d30', 1.0); scene.add(hemi);
const moon = new THREE.DirectionalLight('#a3adf0', 1.5); moon.castShadow = true;
moon.shadow.mapSize.set(+(QS.get('sm') || 2048), +(QS.get('sm') || 2048)); moon.shadow.bias = -.0005; moon.shadow.normalBias = .02; moon.shadow.radius = 3;
Object.assign(moon.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 120 }); moon.shadow.camera.updateProjectionMatrix();
moon.position.set(-32, 34, -8); moon.target.position.set(0, 0, 0); scene.add(moon, moon.target);

// —— cameras ——
const DEG = Math.PI / 180;
let CAM = {};
const camBack = new THREE.Vector3();
function cam(t) {
  const [t0, t1, name] = shotAt(t), u = seg(t, t0, t1);
  let tg = [-.2, .9, .2], az = 45, el = 32, fh = 12, roll = 0;
  const C = world.C.g.position;
  switch (name) {
    case 'wide': az = lerp(48, 42, u); el = 32; fh = lerp(11.6, 9.6, eio(u)); break;
    case 'cat': tg = [-2.0, .3, 1.15]; az = lerp(36, 42, u); el = 18; fh = lerp(1.55, 1.4, u); break;
    case 'glass': { const g = world.glassG.position; tg = [g.x, .87, g.z]; az = lerp(54, 50, u); el = 20; fh = lerp(1.25, .8, eio(u)); break; }
    case 'quake': { const k = ss(seg(t, 9.7, 11.3)); tg = [lerp(-.2, .55, k), lerp(.9, .6, k), lerp(.2, .15, k)]; az = lerp(45, 38, u); el = lerp(33, 14, k); fh = lerp(9.8, 4.6, k); roll = .012; break; }
    case 'catrun': { const k = ss(seg(t, T.catRun - .1, T.catHid + .3)), z = eio(seg(t, T.catHid + .1, t1 - .2)); tg = [lerp(-1.95, -1.75, k), lerp(.25, .16, z), lerp(1.1, lerp(-1.75, -1.72, z), k)]; az = lerp(lerp(98, 88, u), 8, z); el = lerp(38, 7, z); fh = lerp(4.0, 1.35, z); roll = .01; break; }
    case 'window': tg = [-2.4, 1.3, -.45]; az = lerp(78, 38, eio(u)); el = 21; fh = lerp(5.4, 6.2, u); roll = .006; break;
    case 'still': tg = [-.1, .6, 0]; az = 44; el = 18; fh = lerp(7.6, 7.2, u); break;
    case 'torch': { const k = ss(seg(t, T.door - .2, t1)); tg = [lerp(-1.25, 1.0, k), lerp(.45, .6, k), lerp(-1.45, -1.9, k)]; az = lerp(72, 58, u); el = lerp(20, 28, u); fh = lerp(4.2, 6.2, u); break; }
    default: { const z = ss(seg(t, T.reveal, DUR - 1.2)), zz = Math.pow(z, 1.35);
      tg = [lerp(.8, 0, z), lerp(.7, -5, z), lerp(-1.2, 0, z)]; az = lerp(50, 40, z); el = lerp(30, 40, z); fh = 6.4 * Math.pow(70 / 6.4, zz); }
  }
  // handheld feel + quake jolt on the camera too
  const a = shakeAmp(t), [sx, sy] = shakeVec(t + .37, .35);
  const D = Math.max(80, fh * 3), ce = Math.cos(el * DEG);
  camera.position.set(tg[0] + D * ce * Math.sin(az * DEG), tg[1] + D * Math.sin(el * DEG), tg[2] + D * ce * Math.cos(az * DEG));
  camera.up.set(Math.sin(roll * a * Math.sin(t * 13)), 1, 0); camera.lookAt(tg[0], tg[1], tg[2]);
  const k = fh / 12;   // shake scaled to the frame, so close-ups shake as hard as wides
  camera.position.x += sx * k; camera.position.y += sy * k;
  const fw = fh * W / H; camera.left = -fw / 2; camera.right = fw / 2; camera.top = fh / 2; camera.bottom = -fh / 2; camera.near = 1; camera.far = D + fh * 5 + 900; camera.updateProjectionMatrix();
  const cot = 1 / Math.tan(el * DEG), fhz = Math.max(fh, 16);
  post.comp.camDist.value = D; post.comp.hz0.value = .45 * fhz * cot; post.comp.hz1.value = 1.1 * fhz * cot;
  post.tilt.fy.value = .5; post.tilt.band.value = name === 'reveal' ? .22 + .1 * seg(t, T.reveal, DUR) : .3;
  camBack.subVectors(camera.position, new THREE.Vector3(...tg)).normalize();
  CAM = { tg, az, el, fh, name };
}

// —— 2D layer: title, captions, safety tiles ——
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const g = ov.getContext('2d');
const S = W / 1080;
let DURS = {};
try { const r = await fetch('voices/dur.json'); if (r.ok) DURS = await r.json(); } catch (e) { }
const voDur = v => DURS[v.id] ?? v.text.length * .06;
const subSpan = v => { const i = VO.indexOf(v), nx = VO[i + 1]; let b = v.t + Math.max(1.8, voDur(v) + .6); if (nx) b = Math.min(b, nx.t - .05); return [v.t - .05, b]; };
function wrap(text, maxW) { const ws = text.split(' '), lines = []; let cur = ''; for (const w of ws) { const tst = cur ? cur + ' ' + w : w; if (g.measureText(tst).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tst; } if (cur) lines.push(cur); return lines; }
function hexIcon(x, y, s, top) {
  const P = a => [x + Math.cos(a) * s, y + Math.sin(a) * s * .58];
  const pts = [0, 1, 2, 3, 4, 5].map(i => P(i * Math.PI / 3)); const dy = s * .55;
  g.save();
  g.fillStyle = '#5d4c44'; g.beginPath(); g.moveTo(...pts[0]); g.lineTo(pts[0][0], pts[0][1] + dy); g.lineTo(pts[1][0], pts[1][1] + dy); g.lineTo(pts[2][0], pts[2][1] + dy); g.lineTo(pts[3][0], pts[3][1] + dy); g.lineTo(...pts[3]); g.closePath(); g.fill();
  g.fillStyle = top; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(x, y); g.lineTo(...pts[3]); g.lineTo(...pts[4]); g.lineTo(...pts[5]); g.closePath(); g.fill();
  g.restore();
}
const iconTop = t => t < T.black ? '#ffc676' : t < T.torch ? '#7f8fd0' : '#fff0cf';
const TXT = [];
function riseText(text, x, y, t0, t, size, track, color, align = 'center', alpha = 1) {   // letters rise one by one like tiles, overshoot, settle
  g.font = `700 ${size}px "Josefin Sans"`; const ws = [...text].map(ch => g.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0) + track * (text.length - 1);
  let cx = align === 'center' ? x - tot / 2 : x;
  g.save(); g.beginPath(); g.rect(0, y - size * 1.1, W, size * 1.32); g.clip();
  [...text].forEach((ch, i) => { const s = t - (t0 + i * .022);
    if (s >= 0) { const off = s < .22 ? size * 1.1 * Math.pow(1 - s / .22, 2) : -Math.sin((s - .22) * 16) * Math.exp(-(s - .22) * 9) * size * .12;
      g.globalAlpha = alpha; g.shadowColor = 'rgba(10,14,40,.6)'; g.shadowBlur = 16 * S; g.shadowOffsetY = 4 * S; g.fillStyle = color; g.fillText(ch, cx, y + off); }
    cx += ws[i] + track; });
  g.restore();
}
function hud(t) {
  g.clearRect(0, 0, W, H); TXT.length = 0;
  if (QS.has('nohud')) return;
  // POV title, top: three lines
  { const size = 58 * S, lh = 70 * S; g.font = `700 ${size}px "Josefin Sans"`;
    const lines = wrap(TITLE, 960 * S); let k = 0; const dim = 1 - .12 * seg(t, T.black, T.black + .3) + .12 * seg(t, T.torch, T.torch + 1);
    lines.forEach((ln, i) => { riseText(ln, W / 2, 210 * S + i * lh, .05 + k * .022, t, size, 3 * S, '#fffaf0', 'center', dim); k += ln.length; });
    TXT.push({ id: 'title', text: TITLE, x0: 60, y0: 150 * S, x1: W - 60, y1: 210 * S + lines.length * lh }); }
  // safety tiles over the table
  for (const [i, tl] of TILES.entries()) {
    const a = 1 - ss(seg(t, 14.0, 14.4)); if (t < tl.t || a <= 0) continue;
    const p = new THREE.Vector3(.75, 1.35, 0).applyMatrix4(world.room.matrixWorld).project(camera);
    const x = (p.x * .5 + .5) * W, y = (-p.y * .5 + .5) * H - (2 - i) * 74 * S - 40 * S;
    hexIcon(x - 0 * S, y - 66 * S, 0, '#ffd36a');
    riseText(tl.text, x, y, tl.t, t, 62 * S, 5 * S, i === 1 ? '#ffd36a' : '#ffffff', 'center', a);
    TXT.push({ id: 'tile' + i, text: tl.text, x0: x - 200, y0: y - 60, x1: x + 200, y1: y });
  }
  // captions (low, no box)
  const v = VO.find(v => { const [a, b] = subSpan(v); return t >= a && t < b; });
  if (v) {
    const [a, b] = subSpan(v), al = ss(seg(t, a, a + .15)) * (1 - ss(seg(t, b - .18, b)));
    const size = 50 * S; g.save(); g.globalAlpha = al; g.font = `600 ${size}px Quicksand`; g.textBaseline = 'middle'; g.textAlign = 'center';
    const lines = wrap(v.text, 880 * S), lh = 66 * S, y0 = 1500 * S - (lines.length - 1) * lh;
    const w0 = g.measureText(lines[0]).width;
    hexIcon(W / 2 - w0 / 2 - 36 * S, y0 - 4 * S, 17 * S, iconTop(t));
    g.shadowColor = 'rgba(8,12,40,.8)'; g.shadowBlur = 16 * S; g.shadowOffsetY = 3 * S; g.fillStyle = '#fffdf8';
    lines.forEach((ln, i) => g.fillText(ln, W / 2, y0 + i * lh));
    g.restore();
    TXT.push({ id: v.id, text: v.text, x0: 80, y0: y0 - lh / 2, x1: W - 80, y1: y0 + (lines.length - .5) * lh });
  }
}

// —— render ——
const SKY = { zen: new THREE.Color('#0d1030'), hor: new THREE.Color('#3b3a6e') };
function render(t) {
  cam(t);
  const dark = ss(seg(t, T.black, T.black + .15));
  hemi.intensity = lerp(1.7, 1.45, dark) + (t > T.torch ? .15 : 0); hemi.color.set(dark > .5 ? '#5662a6' : '#5a64a0');
  moon.intensity = 2.4;
  post.comp.zen.value.copy(SKY.zen); post.comp.hor.value.copy(SKY.hor);
  post.comp.stars.value = .5; post.comp.starOff.value = CAM.az / 60; post.comp.time.value = t;
  const gd = post.grade; gd.sat.value = lerp(1.08, .98, dark); gd.contrast.value = .1; gd.lift.value.setRGB(.012, .014, .04); gd.vig.value = .3;
  post.bloom.strength = .5;
  // a tiny flash at the hit, then a sub-frame dip at the blackout
  gd.fade.value = 1 + .25 * Math.exp(-Math.max(0, t - T.hit) * 12) * (t >= T.hit ? 1 : 0) - .35 * (t > T.black - .04 && t < T.black + .08 ? 1 : 0);
  world.update(t, { camBack, fh: CAM.fh, tg: CAM.tg });
  post.composer.render();
  hud(t);
}

function events() {
  const ev = EVS.slice();
  VO.forEach(v => ev.push({ t: v.t, type: 'vo', id: v.id, text: v.text }));
  for (const k of Object.keys(T)) ev.push({ t: T[k], type: 'cue', name: k });
  TILES.forEach((tl, i) => ev.push({ t: tl.t, type: 'tile', i }));
  return ev.sort((a, b) => a.t - b.t);
}
window.render = render; window.DUR = DUR; window.EV = events(); window.TEXTS = t => { render(t); return TXT; };
window.DBG = { camera, world, scene, post };
await document.fonts.load(`700 58px "Josefin Sans"`); await document.fonts.load(`600 50px Quicksand`);
render(parseFloat(QS.get('t') ?? '1'));
window.READY = true;
