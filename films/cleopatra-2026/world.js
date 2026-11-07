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

// ---------- the world: a hidden tomb (origin) and the Giza desert at night (x = 60) ----------
function glyphTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#d9b77c'; x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(120,80,40,.5)'; x.fillRect(i * 114 + 50, 0, 4, 512); }
  const R = n => { const v = Math.sin(n * 91.7) * 4375.5; return v - Math.floor(v); };
  for (let col = 0; col < 9; col++) for (let row = 0; row < 7; row++) {
    const cx = col * 114 + 108, cy = row * 70 + 40, k = Math.floor(R(col * 13 + row) * 6); x.strokeStyle = x.fillStyle = ['#1d4f8a', '#8a2a1d', '#1d1d1d', '#2a6b4a'][(col + row) % 4]; x.lineWidth = 6;
    x.beginPath();
    if (k === 0) { x.ellipse(cx, cy, 22, 11, 0, 0, 7); x.stroke(); x.beginPath(); x.arc(cx, cy, 6, 0, 7); x.fill(); }          // eye
    else if (k === 1) { x.arc(cx, cy - 10, 10, 0, 7); x.moveTo(cx, cy); x.lineTo(cx, cy + 26); x.moveTo(cx - 14, cy + 6); x.lineTo(cx + 14, cy + 6); x.stroke(); }   // ankh
    else if (k === 2) { for (let w = 0; w < 3; w++) { x.moveTo(cx - 24, cy - 10 + w * 10); for (let z = 0; z < 6; z++) x.lineTo(cx - 24 + z * 9 + 4.5, cy - 10 + w * 10 + (z % 2 ? -5 : 5)); } x.stroke(); }   // water
    else if (k === 3) { x.moveTo(cx - 20, cy + 20); x.lineTo(cx - 6, cy - 18); x.lineTo(cx + 8, cy - 12); x.lineTo(cx + 20, cy + 20); x.stroke(); }   // bird-ish
    else if (k === 4) { x.arc(cx, cy, 16, 0, 7); x.stroke(); x.beginPath(); x.arc(cx, cy, 4, 0, 7); x.fill(); }   // sun
    else { x.fillRect(cx - 18, cy - 4, 36, 8); x.fillRect(cx - 4, cy - 18, 8, 36); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function buildWorld(scene) {
  const root = grp(scene); const R = {};
  // ===== tomb =====
  const tomb = grp(root); R.tomb = tomb;
  box(10, .3, 10, '#b8925a', 0, -.15, 0, tomb);
  const gm = new THREE.MeshStandardMaterial({ map: glyphTex(), roughness: .95 });
  const wb = new THREE.Mesh(new THREE.BoxGeometry(10, 4, .3), gm); wb.position.set(0, 2, -4); wb.receiveShadow = true; tomb.add(wb);
  const wl = new THREE.Mesh(new THREE.BoxGeometry(.3, 4, 10), gm); wl.position.set(-4.5, 2, 0); tomb.add(wl);
  for (const x of [-3.2, 3.2]) { box(.8, 4, .8, '#c9a46a', x, 2, -3.2, tomb); box(1, .3, 1, '#e1b23a', x, 3.9, -3.2, tomb); }
  const flames = [];
  for (const [x, z] of [[-3.9, -1.5], [3.9, -1.5]]) { box(.12, 1.6, .12, '#5a3a20', x, .8, z, tomb); box(.3, .2, .3, '#3a2a1a', x, 1.65, z, tomb); const f = box(.22, .35, .22, mat('#ffb03a', { e: '#ff8a1a', ei: 3, unique: true }), x, 1.92, z, tomb); f.castShadow = false; flames.push(f); }
  // golden sarcophagus (nemes stripes) on a plinth
  box(1.4, .5, 2.8, '#7a5a30', 0, .25, .2, tomb);
  for (let i = 0; i < 7; i++) box(1.12, .7, .36, i % 2 ? '#1d4f8a' : '#e1b23a', 0, .85, -1.0 + i * .4, tomb);
  box(1.2, .06, 2.8, '#e1b23a', 0, 1.22, .2, tomb);
  for (let i = 0; i < 10; i++) box(.3 + hash(i) * .3, .3 + hash(i + 3) * .4, .3, i % 3 ? '#e1b23a' : '#c9a23a', -3 + hash(i + 7) * 6, .2, 2.2 + hash(i + 9) * 1.5, tomb);   // treasure
  // the cobra: a chain of segments + hood + head
  const cobra = grp(tomb, .4, 0, 2.2); cobra.scale.setScalar(1.7); R.cobra = cobra;
  const segs = []; for (let i = 0; i < 12; i++) { const s_ = box(.16, .16, .16, i % 2 ? '#1e2a14' : '#2c3a1c', 0, 0, 0, cobra); segs.push(s_); }
  const hood = grp(cobra); box(.56, .5, .06, '#24321a', 0, 0, 0, hood); box(.32, .34, .07, '#d8c27a', 0, -.02, .01, hood); for (const sx of [-1, 1]) box(.08, .08, .075, '#14140c', sx * .1, .08, .015, hood);
  const chead = grp(cobra); box(.22, .12, .3, '#3a3a1a', 0, 0, 0, chead); for (const sx of [-1, 1]) box(.05, .05, .05, mat('#ffd23f', { e: '#ffd23f', ei: 2 }), sx * .08, .05, .1, chead);
  const tongue = box(.03, .01, .16, '#d22b2b', 0, -.02, .22, chead); const jaw = box(.2, .04, .26, '#e88a9a', 0, -.07, .02, chead); for (const sx of [-1, 1]) box(.02, .07, .02, '#ffffff', sx * .06, -.04, .14, chead); R.jaw = jaw; R.cobraParts = { segs, hood, chead, tongue };
  // ===== desert (x = 60) =====
  const des = grp(root, 60, 0, 0); R.des = des;
  box(400, .3, 400, '#c9a46a', 0, -.15, -100, des);
  for (let i = 0; i < 14; i++) box(20 + hash(i) * 30, 1 + hash(i + 1) * 2, 14, jit('#c49e62', i, .06), -120 + i * 18, .4, -40 - hash(i + 5) * 60, des);
  const pyr = (x, z, n, sz) => { for (let k = 0; k < n; k++) { const w = sz * (1 - k / n); box(w, sz / n, w, jit('#d8b273', k, .04), x, (k + .5) * sz / n, z, des); } };
  pyr(-30, -90, 14, 46); pyr(16, -120, 14, 40); pyr(48, -80, 10, 22);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 16), new THREE.MeshBasicMaterial({ color: '#f4f0dc' })); moon.position.set(25, 70, -200); des.add(moon); R.moon = moon;
  // Cleopatra
  const CL = { skin: '#c99a72', hair: '#0e0b0a', long: true, fringe: true, brow: '#0e0b0a', liner: true, coat: '#f4f1e6', sleeve: '#c99a72', vest: '#f4f1e6', pants: '#f4f1e6', shoes: '#e1b23a', collar: '#e1b23a', cuff: '#e1b23a', belt: '#1d4f8a', hat: 'crown' };
  const collar = p => { box(.5, .1, .3, '#1d4f8a', 0, .47, .01, p.torso); box(.54, .06, .3, '#e1b23a', 0, .4, .01, p.torso); };
  const lie = person({ ...CL, par: tomb, pos: [0, 1.25, 1.15], scale: .95 }); lie.g.rotation.x = -Math.PI / 2; collar(lie); R.lie = lie;
  const cl = person({ ...CL, par: tomb, pos: [.3, 0, 1.9], scale: .95 }); collar(cl); R.cl = cl;
  const clD = person({ ...CL, par: des, pos: [0, 0, 0], scale: .95 }); collar(clD); R.clD = clD;
  R.mj = cl;   // camera follow hook

  function blink(p, t, open) { const b = (t * 1.3 + p.S * 7) % 4 < .12; p.eyes.open.visible = open && !b; p.eyes.closed.visible = !open || b; }
  const TI = () => at('h1', 'em');
  function update(t, shot) {
    tomb.visible = shot.loc === 'tomb'; des.visible = shot.loc === 'des';
    flames.forEach((f, i) => { const k = 1 + .25 * Math.sin(t * 17 + i * 3) + .15 * Math.sin(t * 29 + i); f.scale.set(k, k * 1.2, k); f.material.emissiveIntensity = 2.5 * k; });
    // cobra: rises, flares the hood, strikes at the camera at TI
    const ti = TI(), rise = lerp(.55, 1, eo(seg(t, 0, ti * .6))), strike = seg(t, ti - .2, ti); R.jaw.rotation.x = .1 + .7 * eo(seg(t, ti - .5, ti - .1));
    const { segs, hood, chead, tongue } = R.cobraParts;
    segs.forEach((s_, i) => { const u = i / 11, h = rise * (u * u) * 1.1, sway = Math.sin(t * 3 - i * .5) * .08 * (1 - strike);
      s_.position.set(Math.cos(u * 6) * .3 * (1 - u) + sway, .08 + h, Math.sin(u * 6) * .3 * (1 - u) + strike * u * u * 1.6); });
    const top = segs[11].position;
    hood.position.set(top.x, top.y + .15, top.z - .02); hood.scale.set(.5 + .5 * eo(seg(t, 0, ti * .5)), 1, 1);
    chead.position.set(top.x, top.y + .3, top.z + .05 + strike * 1.0); chead.rotation.x = -.2 - strike * .3; tongue.visible = Math.sin(t * 25) > 0;
    cobra.visible = t < ti + 2 && shot.loc === 'tomb';
    // Cleopatra: lying -> sits up on "sai"
    const awake = t >= at('h1', K.eyes), sit = eio(seg(t, at('v1', 'sai'), at('v1', 'sai') + 1.0));
    lie.torso.rotation.x = sit * Math.PI / 2 * .95; blink(lie, t, awake); lie.head.rotation.y = sit > .9 ? Math.sin(t * 1.5) * .45 : 0;
    if (awake && t < at('h1', K.eyes) + .5) lie.eyes.open.scale.set(1, 1.6, 1); else lie.eyes.open.scale.set(1, 1, 1);
    lie.g.visible = shot.nap === 'lie'; cl.g.visible = shot.nap === 'stand' && shot.loc === 'tomb'; clD.g.visible = shot.loc === 'des';
    for (const p of [cl, clD]) { p.armL.rotation.set(0, 0, 0); p.armR.rotation.set(0, 0, 0); p.head.rotation.set(0, 0, 0); blink(p, t, true); }
    clD.head.rotation.x = -.35; clD.head.rotation.y = .3;                                                             // looks up at the moon
    if (t >= at('c1', 0) && t < at('v4', 0)) { const k = eo(seg(t, at('c1', 0), at('c1', 0) + .3)); cl.armR.rotation.x = -2.4 * k; cl.armR.rotation.z = -.2 + Math.sin(t * 6) * .25 * k; }   // royal wave
    if (t >= at('v4', 0) && t < at('v5', 0)) { cl.armR.rotation.x = -1.3; cl.head.rotation.x = .35; }               // looks at the phone
    if (t >= at('v5', 0)) { cl.armL.rotation.z = .4; cl.armR.rotation.z = -.4; cl.head.rotation.x = -.1; }           // proud pose
  }
  ev(at('h1', 'em'), 'strike'); ev(at('h1', K.eyes), 'eyes');
  return { root, R, update };
}
