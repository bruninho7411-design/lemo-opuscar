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

// ---------- the world: the imperial throne hall (origin) and the Museu Nacional on fire (x = 60) ----------
function crownModel(par) {
  const c = grp(par), gold = mat('#e1b23a', { m: .6, r: .3 });
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .22, 16, 1, true), gold); ring.material.side = THREE.DoubleSide; c.add(ring); ring.castShadow = true;
  box(.6, .3, .6, '#1f6b3a', 0, .18, 0, c);                                                          // velvet cap
  for (let k = 0; k < 4; k++) { const a_ = grp(c); a_.rotation.y = k * Math.PI / 4; box(.06, .06, .86, gold, 0, .42, 0, a_); }
  box(.12, .12, .12, gold, 0, .5, 0, c); box(.05, .24, .05, gold, 0, .68, 0, c); box(.16, .05, .05, gold, 0, .68, 0, c);   // orb + cross
  for (let k = 0; k < 8; k++) { const an = k / 8 * TAU; box(.07, .07, .04, mat(k % 2 ? '#d22b2b' : '#2bd25a', { e: k % 2 ? '#d22b2b' : '#2bd25a', ei: .6 }), Math.cos(an) * .43, 0, Math.sin(an) * .43, c); }
  return c;
}
function flagTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 360; const x = c.getContext('2d');
  x.fillStyle = '#0b7a3b'; x.fillRect(0, 0, 512, 360); x.fillStyle = '#f4c20d'; x.beginPath(); x.moveTo(256, 30); x.lineTo(480, 180); x.lineTo(256, 330); x.lineTo(32, 180); x.closePath(); x.fill();
  x.fillStyle = '#0b4fa0'; x.beginPath(); x.arc(256, 190, 70, 0, 7); x.fill(); x.fillStyle = '#e1b23a'; x.fillRect(216, 80, 80, 40); x.fillRect(236, 60, 40, 20);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function buildWorld(scene) {
  const root = grp(scene); const R = {};
  // ===== throne hall =====
  const hall = grp(root); R.hall = hall;
  for (let i = -5; i < 5; i++) for (let j = -5; j < 5; j++) box(.98, .06, .98, (i + j) & 1 ? '#e9e6dc' : '#2f5d4a', i + .5, -.03, j + .5, hall);
  box(1.6, .02, 10, '#9b1c22', 0, .02, 0, hall);
  box(10, 5, .3, '#e8dcc0', 0, 2.5, -5, hall); box(.3, 5, 10, '#e2d4b4', -5, 2.5, 0, hall);
  for (const x of [-3.6, 3.6]) for (const z of [-4, 0, 3.6]) { box(.6, 4.6, .6, '#f2ece0', x, 2.3, z, hall); box(.8, .3, .8, '#e1b23a', x, 4.7, z, hall); }
  box(3, .4, 2, '#7a1c22', 0, .2, -3.6, hall); box(3.2, .1, 2.2, '#e1b23a', 0, .42, -3.6, hall);         // dais
  const th = grp(hall, 0, .45, -3.9); box(1.3, .9, 1, '#e1b23a', 0, .45, 0, th); box(1.0, .2, .8, '#1f6b3a', 0, .95, .05, th); box(1.3, 2.0, .2, '#e1b23a', 0, 1.6, -.45, th); box(.9, 1.5, .1, '#1f6b3a', 0, 1.6, -.33, th); box(.5, .4, .2, '#e1b23a', 0, 2.8, -.45, th);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), new THREE.MeshStandardMaterial({ map: flagTex() })); flag.position.set(0, 3.6, -4.83); hall.add(flag);
  const ch = grp(hall, 0, 4.4, -.5); box(1.4, .2, 1.4, '#e1b23a', 0, 0, 0, ch); box(.06, .8, .06, '#e1b23a', 0, .5, 0, ch);
  for (let k = 0; k < 8; k++) { const an = k / 8 * TAU; box(.08, .2, .08, mat('#fff3c4', { e: '#ffe08a', ei: 2 }), Math.cos(an) * .65, .2, Math.sin(an) * .65, ch); }
  // the bier with the pillow of Brazilian earth
  box(1.2, .8, 2.6, '#3a1c1c', 0, .4, .3, hall); box(1.3, .1, 2.7, '#e1b23a', 0, .82, .3, hall); box(1.1, .06, 2.4, '#1f6b3a', 0, .9, .3, hall);
  box(.6, .14, .4, '#7a5636', 0, .98, -.7, hall);
  const crown = crownModel(hall); R.crown = crown;
  // ===== Museu Nacional on fire (x = 60), night =====
  const mus = grp(root, 60, 0, 0); R.mus = mus;
  box(80, .3, 60, '#3d4a32', 0, -.15, 0, mus);
  box(26, 7, 6, '#d8b76a', 0, 3.5, -12, mus); box(27, .5, 6.5, '#efe4c8', 0, 7.2, -12, mus);
  for (let i = 0; i < 13; i++) { box(.4, 6.6, .3, '#f2ece0', -12 + i * 2, 3.3, -8.9, mus); if (i < 12) for (const y of [2, 5]) box(1, 1.5, .1, mat('#ff9a3a', { e: '#ff6a1a', ei: 1.5 }), -11 + i * 2, y, -8.95, mus); }
  const ped = grp(mus, 0, 7.4, -9.2); for (let k = 0; k < 5; k++) box(10 - k * 2, .5, .6, '#efe4c8', 0, k * .5, 0, ped);
  const flames = []; for (let i = 0; i < 70; i++) { const f = box(1.3, 1.6, 1.3, mat('#ffb03a', { e: '#ff6a1a', ei: 3, unique: true, op: .9 }), -12 + hash(i) * 24, 7.6, -12 + (hash(i + 3) - .5) * 4, mus); f.castShadow = false; f.base = f.position.clone(); flames.push(f); }
  const smoke = []; for (let i = 0; i < 30; i++) { const d = box(1.4, 1.4, 1.4, mat('#2a2a2a', { op: .6, unique: true }), 0, 0, 0, mus); d.castShadow = false; smoke.push(d); }
  // Dom Pedro II: white beard, green coat with gold, yellow feather cape (murça de papo de tucano)
  const DP = { skin: '#efcfb4', hair: '#e9e9e9', beard: '#f2f2f0', brow: '#dcdcdc', coat: '#1f5a3a', sleeve: '#1f5a3a', vest: '#f4f1e6', pants: '#f4f1e6', shoes: '#151515', collar: '#e1b23a', cuff: '#e1b23a', sash: '#e1b23a' };
  const cape = p => { box(.66, .2, .38, '#f2a91a', 0, .42, 0, p.torso); box(.5, .12, .32, '#e8941a', 0, .3, .02, p.torso); };
  const lie = person({ ...DP, par: hall, pos: [0, .95, .85] }); lie.g.rotation.x = -Math.PI / 2; cape(lie); R.lie = lie;
  const dp = person({ ...DP, par: hall, pos: [0, .06, 1.8] }); cape(dp); R.dp = dp; R.mj = dp;
  const dpM = person({ ...DP, par: mus, pos: [0, 0, 6] }); cape(dpM); dpM.g.rotation.y = Math.PI; R.dpM = dpM;
  const myPhone = grp(dp.armR, 0, -.5, .08); box(.12, .2, .025, '#111', 0, 0, 0, myPhone); box(.1, .17, .01, mat('#9fd0ff', { e: '#bfe2ff', ei: 1.2 }), 0, 0, .014, myPhone); myPhone.scale.setScalar(1.5); R.myPhone = myPhone;

  function blink(p, t, open) { const b = (t * 1.3 + p.S * 7) % 4 < .12; p.eyes.open.visible = open && !b; p.eyes.closed.visible = !open || b; }
  const TI = () => at('h1', 'em');
  function update(t, shot) {
    hall.visible = shot.loc === 'hall'; mus.visible = shot.loc === 'mus';
    // the crown falls in slow motion, hits the floor at TI, bounces and rolls
    const ti = TI();
    if (t < ti) { const u = seg(t, 0, ti); crown.position.set(.1, lerp(2.2, .25, u * u), 2.4); crown.rotation.set(.5 * Math.sin(t * 2), t * 2.5, .3); }
    else { const d = t - ti, b = Math.abs(Math.sin(d * 9)) * .5 * Math.exp(-d * 4); crown.position.set(.1 + Math.min(d, 1.2) * .5, .25 + b, 2.4 + Math.min(d, 1.2) * .3); crown.rotation.set(.5, ti * 2.5 + d * 1.5 * Math.exp(-d), lerp(.3, 1.35, eo(seg(d, 0, .8)))); }
    // flames + smoke on the museum roof
    flames.forEach((f, i) => { const k = .8 + .5 * Math.abs(Math.sin(t * (7 + hash(i) * 5) + i)); f.scale.set(k, k * 2.2, k); f.position.y = f.base.y + 1.2 * k; f.material.emissiveIntensity = 2 + 2 * k; });
    smoke.forEach((d, i) => { const u = ((t * .25 + hash(i)) % 1); d.position.set(-12 + hash(i + 7) * 24 + u * 3, 8 + u * 12, -12 + (hash(i + 2) - .5) * 4); d.scale.setScalar(1 + u * 3); d.material.opacity = .55 * (1 - u); });
    const awake = t >= at('h1', K.eyes), sit = eio(seg(t, at('v1', 'olhos'), at('v1', 'olhos') + 1.0));
    lie.torso.rotation.x = sit * Math.PI / 2 * .95; blink(lie, t, awake); lie.head.rotation.y = sit > .9 ? Math.sin(t * 1.4) * .4 : 0;
    if (awake && t < at('h1', K.eyes) + .5) lie.eyes.open.scale.set(1, 1.6, 1); else lie.eyes.open.scale.set(1, 1, 1);
    lie.g.visible = shot.nap === 'lie'; dp.g.visible = shot.nap === 'stand' && shot.loc === 'hall'; dpM.g.visible = shot.loc === 'mus';
    dp.armL.rotation.set(0, 0, 0); dp.armR.rotation.set(0, 0, 0); dp.head.rotation.set(0, 0, 0); blink(dp, t, true); blink(dpM, t, true);
    R.myPhone.visible = t >= at('v3', 'celular') - .1 && t < at('c1', 0);
    if (R.myPhone.visible) { dp.armR.rotation.x = -1.3; dp.head.rotation.x = .3; if (t >= at('v3', 'meu') - .1) { dp.armR.rotation.x = -1.7; dp.armR.rotation.z = -.5; dp.head.rotation.x = -.1; dp.armL.rotation.z = .6; } }   // phone to the ear: "isto fala!"
    if (t >= at('c1', 0) && t < at('v4', 0)) { const k = eo(seg(t, at('c1', 0), at('c1', 0) + .3)); dp.armR.rotation.x = -2.6 * k; dp.armR.rotation.z = -.2; }
    if (t >= at('v5', 0)) { dp.armL.rotation.z = .3; dp.armR.rotation.x = -.8; }
    dpM.head.rotation.x = -.2;
  }
  ev(at('h1', 'em'), 'crownhit'); ev(at('h1', K.eyes), 'eyes'); ev(at('v4', 'fogo'), 'fire');
  return { root, R, update };
}
