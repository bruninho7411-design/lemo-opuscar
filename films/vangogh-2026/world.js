// The world: the crypt under the Invalides dome (sarcophagus, balustrade, tourists) and a Paris street with the Eiffel tower.
// Voxel characters built from boxes. Everything is a pure function of t; sound cues go to EVS.
import * as THREE from 'three';
import { clamp, seg, ss, eio, eo, lerp, hash, TAU, back } from '/core/lib.js';
import { at, end, K } from './story.js';

const matCache = {};
export function mat(c, o = {}) {
  const k = c + JSON.stringify(o);
  if (!o.unique && matCache[k]) return matCache[k];
  const m = new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: o.r ?? .85, metalness: o.m ?? 0, emissive: o.e ?? '#000000', emissiveIntensity: o.ei ?? 1, transparent: !!o.op, opacity: o.op ?? 1 });
  if (!o.unique) matCache[k] = m; return m;
}
export function box(w, h, d, m, x = 0, y = 0, z = 0, par) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof m === 'string' ? mat(m) : m);
  o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (par) par.add(o); return o;
}
const grp = (par, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); if (par) par.add(g); return g; };
const jit = (c, i, a = .05) => { const col = new THREE.Color(c); const h = {}; col.getHSL(h); col.setHSL(h.h, h.s, clamp(h.l * (1 + (hash(i) - .5) * 2 * a))); return '#' + col.getHexString(); };

export const EVS = [];
const ev = (t, type, o = {}) => EVS.push({ t: +t.toFixed(3), type, ...o });

// ---------- a voxel person ----------
// returns { g, hips, torso, head, armL, armR, legL, legR, eyes:{open, closed}, mouth, top } ; unit ≈ metres, chunky proportions
function person(o) {
  const g = grp(o.par, ...(o.pos || [0, 0, 0])), S = o.scale || 1;
  g.scale.setScalar(S);
  const hips = grp(g, 0, .62, 0);
  const legL = grp(hips, -.1, 0, 0), legR = grp(hips, .1, 0, 0);
  for (const [L, s] of [[legL, -1], [legR, 1]]) {
    box(.17, .44, .2, o.pants, 0, -.25, 0, L);
    box(.19, .2, .26, o.shoes, 0, -.52, .02, L);
  }
  const torso = grp(hips, 0, 0, 0);
  box(.44, .5, .26, o.coat, 0, .25, 0, torso);
  if (o.vest) box(.2, .42, .02, o.vest, 0, .23, .135, torso);
  if (o.tails) box(.44, .28, .06, o.coat, 0, -.06, -.12, torso);
  if (o.belt) box(.45, .06, .27, o.belt, 0, .02, 0, torso);
  if (o.collar) { box(.3, .1, .28, o.collar, 0, .52, 0, torso); box(.06, .08, .02, o.collar, -.17, .44, .135, torso); box(.06, .08, .02, o.collar, .17, .44, .135, torso); }
  if (o.sash) box(.45, .05, .27, o.sash, 0, .1, 0, torso);
  const armL = grp(torso, -.29, .46, 0), armR = grp(torso, .29, .46, 0);
  for (const A of [armL, armR]) {
    box(.14, .42, .16, o.sleeve || o.coat, 0, -.2, 0, A);
    if (o.cuff) box(.15, .05, .17, o.cuff, 0, -.38, 0, A);
    box(.12, .12, .12, o.skin, 0, -.47, 0, A);
  }
  const head = grp(torso, 0, .56, 0);
  box(.42, .42, .4, o.skin, 0, .21, 0, head);
  // hair
  if (o.hair) {
    box(.44, .1, .42, o.hair, 0, .4, -.01, head);
    box(.44, .3, .08, o.hair, 0, .27, -.18, head);
    if (o.fringe) { box(.18, .08, .04, o.hair, -.06, .33, .21, head); box(.08, .12, .04, o.hair, .06, .31, .21, head); }
    if (o.long) { box(.44, .28, .1, o.hair, 0, .08, -.17, head); }
  }
  if (o.wild) {   // Einstein's hair: white tufts sticking out everywhere
    const H = o.wild;
    [[-.27, .3, 0, .14, .2, .3], [.27, .3, 0, .14, .2, .3], [-.31, .42, -.05, .14, .14, .22], [.31, .42, -.05, .14, .14, .22], [0, .47, -.02, .46, .12, .4], [-.15, .55, -.05, .16, .12, .18], [.14, .56, 0, .16, .14, .16],
     [0, .3, -.24, .5, .34, .1], [-.2, .18, -.22, .14, .2, .1], [.2, .18, -.22, .14, .2, .1], [-.34, .2, .05, .1, .14, .16], [.34, .2, .05, .1, .14, .16]].forEach(([x, y, z, w, h, d], i) => box(w, h, d, jit(H, i, .06), x, y, z, head));
  }
  if (o.beard) { box(.44, .3, .1, o.beard, 0, .02, .2, head); box(.34, .2, .1, o.beard, 0, -.2, .2, head); box(.22, .14, .1, o.beard, 0, -.36, .2, head); box(.08, .24, .38, o.beard, -.21, .1, .02, head); box(.08, .24, .38, o.beard, .21, .1, .02, head); }
  if (o.liner) for (const sx of [-1, 1]) { box(.05, .025, .02, '#111', sx * .17, .25, .207, head); box(.11, .02, .02, '#111', sx * .1, .27, .207, head); }
  if (o.mustache) box(.26, .06, .03, o.mustache, 0, .135, .215, head);
  // face
  const eyes = { open: grp(head, 0, 0, 0), closed: grp(head, 0, 0, 0) };
  for (const s of [-1, 1]) {
    box(.09, .08, .02, '#dcd6cb', s * .1, .23, .205, eyes.open);
    box(.045, .07, .02, '#15110e', s * .1 + .015 * s * 0, .225, .212, eyes.open);
    box(.1, .025, .02, '#3a2418', s * .1, .215, .205, eyes.closed);
    box(.1, .025, .02, o.brow || o.hair || '#3a2418', s * .1, .31, .205, head);   // brows
  }
  eyes.closed.visible = false;
  const mouth = grp(head, 0, .1, .205);
  mouth.flat = box(.14, .025, .02, '#6b2b22', 0, 0, 0, mouth);
  mouth.open = box(.12, .07, .02, '#3d120d', 0, -.01, 0, mouth); mouth.open.visible = false;
  mouth.tongue = box(.09, .12, .05, '#e35d74', 0, -.07, .02, mouth); mouth.tongue.visible = false;
  box(.06, .06, .05, jit(o.skin, 3, .12), 0, .17, .215, head);   // nose
  if (o.hat === 'bicorne') {
    const hat = grp(head, 0, .47, 0);
    box(.86, .18, .26, '#111215', 0, 0, 0, hat);          // the wide brim, worn sideways
    box(.66, .12, .2, '#111215', 0, .12, 0, hat);
    box(.4, .08, .16, '#111215', 0, .2, 0, hat);
    box(.6, .03, .27, '#c9a23a', 0, -.07, 0, hat);         // gold edge
    box(.08, .08, .03, '#2c48b8', .2, .08, .14, hat); box(.05, .05, .03, '#ffffff', .2, .08, .155, hat); box(.025, .025, .03, '#d22b2b', .2, .08, .17, hat);   // cockade
    hat.rotation.z = .04;
  } else if (o.hat === 'straw') {
    box(.72, .04, .7, '#e8c54a', 0, .42, .02, head); box(.42, .2, .4, '#f0d060', 0, .53, 0, head); box(.43, .05, .41, '#2a3a6a', 0, .46, 0, head);
  } else if (o.hat === 'crown') {   // Cleopatra: gold band + uraeus cobra on the forehead
    box(.46, .06, .44, '#e1b23a', 0, .36, 0, head); const u = box(.06, .14, .04, '#e1b23a', 0, .45, .22, head); box(.08, .05, .04, '#1d6fb8', 0, .4, .22, head);
  } else if (o.hat === 'panama') {   // Santos Dumont's hat: brim turned down all round
    box(.6, .04, .58, '#e9dfc4', 0, .41, .02, head); box(.66, .04, .64, '#e9dfc4', 0, .38, .02, head);
    box(.42, .2, .4, '#efe6cf', 0, .52, 0, head); box(.43, .05, .41, '#3a2c22', 0, .45, 0, head);
  } else if (o.hat === 'fedora') {
    box(.62, .04, .56, '#111', 0, .43, .02, head); box(.44, .2, .4, '#111', 0, .55, 0, head); box(.45, .05, .41, '#f2f2f2', 0, .47, 0, head);
    head.children[head.children.length - 1].rotation.z = 0;
  } else if (o.hat === 'cap') {
    box(.45, .12, .44, o.hatC, 0, .46, 0, head); box(.3, .03, .2, o.hatC, 0, .41, .3, head);
  }
  let phone = null;
  if (o.phone) {   // held in the right hand, screen glowing
    phone = grp(armR, 0, -.5, .06); phone.scale.setScalar(o.bigPhone || 1);
    box(.12, .2, .025, '#111', 0, 0, 0, phone);
    phone.screen = box(.1, .17, .01, mat('#9fd0ff', { e: '#bfe2ff', ei: 1.2, unique: true }), 0, 0, -.014, phone);
    phone.flash = box(.03, .03, .01, mat('#ffffff', { e: '#ffffff', ei: 0, unique: true }), .035, .07, .016, phone);
  }
  return { g, hips, torso, head, armL, armR, legL, legR, eyes, mouth, phone, S };
}

// ---------- the world: the Starry Night hill (origin) and an immersive exhibition (x = 60) ----------
function swirlTex(seed = 1) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const x = c.getContext('2d');
  x.fillStyle = '#16306a'; x.fillRect(0, 0, 2048, 1024);
  const R = n => { const v = Math.sin(n * 91.7 + seed) * 4375.5; return v - Math.floor(v); };
  const C = [[620, 380, 260], [1300, 300, 300], [1750, 520, 200], [300, 700, 220]];   // swirl centres
  const flow = (px, py) => { let ax = .3, ay = .05; for (const [cx, cy, r] of C) { const dx = px - cx, dy = py - cy, d2 = dx * dx + dy * dy, k = Math.exp(-d2 / (2 * r * r)) * 2.2; ax += -dy / Math.sqrt(d2 + 1) * k; ay += dx / Math.sqrt(d2 + 1) * k; } const l = Math.hypot(ax, ay) || 1; return [ax / l, ay / l]; };
  const pal = ['#2a4fa0', '#3d6cc0', '#6f9ad8', '#a9c6ee', '#1d3a80', '#e8e0a0', '#f2d45a'];
  for (let i = 0; i < 9000; i++) {
    let px = R(i) * 2048, py = R(i + .5) * 1024; const col = pal[(i % 11 === 0) ? 5 + (i % 2) : i % 5];
    x.strokeStyle = col; x.lineWidth = 6 + R(i + 2) * 8; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, py);
    for (let k = 0; k < 6; k++) { const [fx, fy] = flow(px, py); px += fx * 14; py += fy * 14; x.lineTo(px, py); }
    x.stroke();
  }
  for (const [cx, cy, r] of C) { for (let k = 0; k < 4; k++) { x.strokeStyle = k % 2 ? '#f2e6a0' : '#a9c6ee'; x.lineWidth = 12; x.beginPath(); x.arc(cx, cy, r * (.3 + k * .18), 0, 6.1); x.stroke(); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function sunflowerTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320; const x = c.getContext('2d');
  x.fillStyle = '#d9c26a'; x.fillRect(0, 0, 256, 320); x.fillStyle = '#c98a2a'; x.fillRect(60, 200, 136, 110);
  for (const [cx, cy] of [[90, 120], [170, 100], [128, 170], [70, 190], [190, 170]]) { for (let k = 0; k < 14; k++) { const a = k / 14 * 6.28; x.fillStyle = '#f2b51a'; x.beginPath(); x.ellipse(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26, 14, 6, a, 0, 7); x.fill(); } x.fillStyle = '#7a4a1a'; x.beginPath(); x.arc(cx, cy, 18, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function buildWorld(scene) {
  const root = grp(scene); const R = {};
  const night = grp(root); R.night = night;
  const skyTex = swirlTex(1); R.skyTex = skyTex;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })); sky.position.y = -10; night.add(sky);
  box(140, .3, 140, '#1f3a2a', 0, -.15, -30, night);
  for (let i = 0; i < 18; i++) box(14 + hash(i) * 14, 1 + hash(i + 1) * 3, 10, jit(i % 2 ? '#24406a' : '#2a4a3a', i, .1), -60 + i * 7, .5, -25 - hash(i + 4) * 30, night);   // hills
  // village: houses with lit windows + church steeple
  for (let i = 0; i < 9; i++) { const hx = -14 + i * 3.2, hz = -20 - (i % 3) * 2; box(2.2, 1.6, 2, i % 2 ? '#3a4a6a' : '#4a5a7a', hx, .8, hz, night); box(2.4, .6, 2.2, '#2a2a3a', hx, 1.9, hz, night); box(.4, .4, .05, mat('#ffd23f', { e: '#ffc23f', ei: 2 }), hx, .9, hz + 1.02, night); }
  box(1.2, 4, 1.2, '#3a4a6a', -2, 2, -24, night); box(.5, 3, .5, '#2a2a3a', -2, 5.5, -24, night);
  // cypress: dark flame-shaped stack
  const cyp = grp(night, -4.5, 0, -2); for (let k = 0; k < 12; k++) box(lerp(1.3, .2, k / 12), .9, lerp(1.3, .2, k / 12), jit('#14321e', k, .2), Math.sin(k) * .12, .45 + k * .8, 0, cyp);
  // big stars with halos + crescent moon
  const stars = [];
  for (let i = 0; i < 9; i++) { const s_ = grp(night, -30 + i * 7.5, 22 + hash(i) * 14, -50 - hash(i + 3) * 10); const core = new THREE.Mesh(new THREE.SphereGeometry(.8, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff2a0' })); s_.add(core);
    for (let k = 1; k <= 2; k++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2 * k, .18, 6, 24), new THREE.MeshBasicMaterial({ color: k % 2 ? '#f2d45a' : '#cfe0ff' })); s_.add(ring); } stars.push(s_); }
  const moon = new THREE.Mesh(new THREE.TorusGeometry(3, 1.2, 8, 24, 4.2), new THREE.MeshBasicMaterial({ color: '#ffd23f' })); moon.position.set(30, 34, -60); moon.rotation.z = .6; night.add(moon);
  // easel with a sunflowers canvas
  const easel = grp(night, 1.6, 0, 1.4); box(.06, 1.8, .06, '#6b4a2e', -.4, .9, 0, easel); box(.06, 1.8, .06, '#6b4a2e', .4, .9, 0, easel); box(.06, 1.9, .06, '#6b4a2e', 0, .95, -.4, easel);
  const can = new THREE.Mesh(new THREE.BoxGeometry(.9, 1.1, .05), [mat('#eee'), mat('#eee'), mat('#eee'), mat('#eee'), new THREE.MeshStandardMaterial({ map: sunflowerTex() }), mat('#eee')]); can.position.set(0, 1.35, .05); easel.add(can); easel.rotation.y = -.5;
  // ===== immersive exhibition =====
  const expo = grp(root, 60, 0, 0); R.expo = expo;
  const ex1 = swirlTex(7), ex2 = swirlTex(13); R.ex = [ex1, ex2];
  const wm = new THREE.MeshBasicMaterial({ map: ex1 }), fm = new THREE.MeshBasicMaterial({ map: ex2 });
  const wb = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), wm); wb.position.set(0, 3, -6); expo.add(wb);
  const wl = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wm); wl.position.set(-8, 3, 1); wl.rotation.y = Math.PI / 2; expo.add(wl);
  const wr = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wm); wr.position.set(8, 3, 1); wr.rotation.y = -Math.PI / 2; expo.add(wr);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), fm); fl.rotation.x = -Math.PI / 2; fl.position.set(0, .01, 1); expo.add(fl);
  const crowd = [];
  for (let i = 0; i < 16; i++) { const p = person({ skin: ['#f1c9a5', '#d7a57c', '#a9724e', '#7a4a2e'][i % 4], hair: ['#1d1410', '#5a3a22', '#c99a52', '#2b2b2b'][i % 4], long: i % 2 === 0, coat: '#222', pants: '#2c3a55', shoes: '#eee', phone: i % 3 === 0, par: expo, pos: [-6 + (i % 6) * 2.3 + hash(i) * .6, 0, -3 + Math.floor(i / 6) * 2.4 + hash(i + 2)], scale: .95 + hash(i + 5) * .1 }); p.g.rotation.y = hash(i + 9) * 6.28; crowd.push(p); }
  // Van Gogh: red beard, straw hat, blue smock
  const VG = { skin: '#efcfb4', hair: '#c4572a', beard: '#c4572a', brow: '#b04a22', coat: '#3a5f9a', sleeve: '#3a5f9a', vest: '#e6e0cf', pants: '#4a4a5a', shoes: '#5a3a20', collar: '#2a4a7a', hat: 'straw' };
  const lie = person({ ...VG, par: night, pos: [0, .14, .85] }); lie.g.rotation.x = -Math.PI / 2; R.lie = lie;
  const vg = person({ ...VG, par: night, pos: [0, 0, 1.8] }); R.vg = vg; R.mj = vg;
  const vgE = person({ ...VG, par: expo, pos: [0, 0, 2] }); R.vgE = vgE;
  const brush = grp(vg.armR, 0, -.5, .1); box(.03, .03, .4, '#6b4a2e', 0, 0, .15, brush); box(.05, .05, .08, '#f2b51a', 0, 0, .38, brush); R.brush = brush;

  function blink(p, t, open) { const b = (t * 1.3 + p.S * 7) % 4 < .12; p.eyes.open.visible = open && !b; p.eyes.closed.visible = !open || b; }
  function update(t, shot) {
    night.visible = shot.loc === 'night'; expo.visible = shot.loc === 'expo';
    skyTex.offset.set(t * .006, Math.sin(t * .2) * .01); ex1.offset.set(t * .02, 0); ex2.offset.set(-t * .015, t * .01);
    stars.forEach((s_, i) => { s_.rotation.z = t * (.6 + i * .1); s_.scale.setScalar(1 + .12 * Math.sin(t * 3 + i)); });
    const awake = t >= at('h1', K.eyes), sit = eio(seg(t, at('v1', 'olhos'), at('v1', 'olhos') + 1.0));
    lie.torso.rotation.x = sit * Math.PI / 2 * .95; blink(lie, t, awake); lie.head.rotation.x = sit > .9 ? -.4 : 0; lie.head.rotation.y = sit > .9 ? Math.sin(t * 1.2) * .5 : 0;
    if (awake && t < at('h1', K.eyes) + .5) lie.eyes.open.scale.set(1, 1.6, 1); else lie.eyes.open.scale.set(1, 1, 1);
    lie.g.visible = shot.nap === 'lie'; vg.g.visible = shot.nap === 'stand' && shot.loc === 'night'; vgE.g.visible = shot.loc === 'expo';
    vg.armL.rotation.set(0, 0, 0); vg.armR.rotation.set(0, 0, 0); vg.head.rotation.set(0, 0, 0); blink(vg, t, true); blink(vgE, t, true);
    R.brush.visible = t >= at('v3', 0) && t < at('c1', 0);
    if (R.brush.visible) { vg.armR.rotation.x = -1.4 + Math.sin(t * 9) * .2; vg.armR.rotation.z = Math.sin(t * 6) * .25; vg.head.rotation.y = -.5; }   // painting
    if (t >= at('v2', 'hoje') - .1 && t < at('v3', 0)) { vg.armL.rotation.z = .6; vg.armR.rotation.z = -.6; vg.armL.rotation.x = vg.armR.rotation.x = -.3; }   // "what?!"
    if (t >= at('c1', 0) && t < at('v4', 0)) { const k = eo(seg(t, at('c1', 0), at('c1', 0) + .3)); vg.armR.rotation.x = -2.6 * k; }
    vgE.head.rotation.y = Math.sin(t * .6) * .8; vgE.head.rotation.x = -.15; vgE.armL.rotation.z = .3; vgE.armR.rotation.z = -.3;
    crowd.forEach((p, i) => { blink(p, t + i, true); p.head.rotation.y = Math.sin(t * .4 + i) * .5; if (p.phone) p.armR.rotation.x = -1.6; });
  }
  ev(at('h1', 'em'), 'splat'); ev(at('h1', K.eyes), 'eyes');
  return { root, R, update };
}
