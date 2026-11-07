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

// ---------- the world: Getúlio's bedroom at the Catete (origin, "night") and a Rio street with delivery riders (x = 60, "expo") ----------
function stampTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#d4202a'; x.fillRect(0, 0, 512, 512); x.strokeStyle = '#fff'; x.lineWidth = 16; x.strokeRect(24, 24, 464, 464);
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '900 70px Overpass'; x.fillText('CARTEIRA', 256, 200); x.fillText('ASSINADA', 256, 290); x.font = '900 60px Overpass'; x.fillText('1943', 256, 390);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function wallTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#7a1f2b'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = '#9a3040'; x.beginPath(); x.arc(32 + i * 64, 32 + j * 64, 9, 0, 7); x.fill(); x.fillStyle = '#c9a23a'; x.fillRect(i * 64 + 28, j * 64 + 28, 8, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t;
}
export function buildWorld(scene) {
  const root = grp(scene); const R = {};
  const night = grp(root); R.night = night;
  // ===== bedroom =====
  box(26, .3, 22, '#6b4a2e', 0, -.15, -2, night);                       // wooden floor
  box(8, .04, 6, '#b8322e', 0, .02, 1.5, night);                         // rug
  const wm = new THREE.MeshStandardMaterial({ map: wallTex(), roughness: .9 });
  const bw = new THREE.Mesh(new THREE.BoxGeometry(26, 9, .4), wm); bw.position.set(0, 4.5, -7); bw.receiveShadow = true; night.add(bw);
  const sw1 = new THREE.Mesh(new THREE.BoxGeometry(.4, 9, 22), wm); sw1.position.set(-13, 4.5, -2); night.add(sw1);
  const sw2 = new THREE.Mesh(new THREE.BoxGeometry(.4, 9, 22), wm); sw2.position.set(13, 4.5, -2); night.add(sw2);
  box(26, .6, .5, '#e9dfc4', 0, .3, -6.8, night); box(26, .3, .5, '#c9a23a', 0, 8.6, -6.8, night);   // baseboard + cornice
  // tall window with warm light + curtains
  box(2.6, 4.4, .12, mat('#ffe9b0', { e: '#ffe3a0', ei: 1.4 }), 5, 4, -6.75, night); box(2.8, .2, .2, '#e9dfc4', 5, 6.3, -6.7, night); box(.12, 4.4, .16, '#e9dfc4', 5, 4, -6.7, night); box(2.6, .12, .16, '#e9dfc4', 5, 4, -6.7, night);
  box(.7, 4.8, .3, '#a02030', 3.3, 4, -6.6, night); box(.7, 4.8, .3, '#a02030', 6.7, 4, -6.6, night);
  // the bed (lie.g lies on it)
  const bed = grp(night, 0, 0, -1.6);
  box(2.6, .5, 4.2, '#4a2e1a', 0, .35, 0, bed); box(2.4, .45, 4.0, '#efe9dc', 0, .8, 0, bed); box(2.5, .12, 2.4, '#7a1f2b', 0, 1.05, 1.1, bed);
  box(2.8, 2.2, .3, '#4a2e1a', 0, 1.4, -2.1, bed); box(1.2, .3, .7, '#fff', 0, 1.15, -1.5, bed);
  // furniture + museum details
  box(1.4, 1.1, 1, '#5a3a20', -5, .55, -5.8, night); box(.5, .5, .5, mat('#ffd9a0', { e: '#ffcf80', ei: 1.5 }), -5, 1.4, -5.8, night);
  const portrait = box(1.6, 2, .1, '#c9a23a', -8, 5, -6.7, night); box(1.3, 1.7, .12, '#3a4a6a', -8, 5, -6.68, night);
  [[-4, 3.6], [4, 3.6], [-4, 6], [4, 6]].forEach(([x, z]) => { box(.14, 1, .14, '#c9a23a', x, .5, z, night); });
  box(8, .05, .05, '#b8322e', 0, .95, 3.6, night); box(.05, .05, 9.6 - 2, '#b8322e', -4, .95, -.2, night); box(.05, .05, 7.6, '#b8322e', 4, .95, -.2, night);
  box(1.4, .9, .08, '#f2f2f2', 7.5, 1.6, 2.2, night);   // museum sign
  // THE STAMP for the cold open: falls from the sky and slams
  const stamp = grp(night, 0, 15, 5); R.stamp = stamp;
  box(.9, 4, .9, '#6b4a2e', 0, 3.4, 0, stamp); box(2.2, .6, 2.2, '#8a5a30', 0, 5.7, 0, stamp);
  const sm = new THREE.MeshBasicMaterial({ map: stampTex() }), dk = mat('#8a5a30');
  const sb = new THREE.Mesh(new THREE.BoxGeometry(6, .6, 6), [dk, dk, dk, sm, dk, dk]); sb.position.set(0, 1.3, 0); stamp.add(sb);
  // ===== street (x = 60) =====
  const expo = grp(root, 60, 0, 0); R.expo = expo;
  box(60, .3, 40, '#3a3d44', 0, -.15, 0, expo); box(60, .32, 4, '#b9b6ac', 0, -.14, -8, expo); box(60, .02, .3, '#f2d24a', 0, .02, 1, expo);
  for (let i = 0; i < 14; i++) { const h = 6 + hash(i) * 10, w = 4 + hash(i + 3) * 2; const b = grp(expo, -28 + i * 4.4, 0, -13 - hash(i + 8) * 2);
    box(w, h, 4, jit(['#d9c9a0', '#9fb8c8', '#e0a890', '#b8c8a0'][i % 4], i, .06), 0, h / 2, 0, b);
    for (let r = 0; r < Math.floor(h / 2.2); r++) for (let k = -1; k <= 1; k++) box(.7, .9, .05, mat(hash(i * 9 + r * 3 + k) > .4 ? '#ffe9a0' : '#3a4a5a', { e: hash(i * 9 + r * 3 + k) > .4 ? '#ffd870' : '#000', ei: .8 }), k * 1.1, 1.8 + r * 2.2, 2.03, b); }
  // sunny sky sphere + palms
  for (let i = 0; i < 6; i++) { const p = grp(expo, -22 + i * 9, 0, -9.5); box(.4, 4, .4, '#6b4a2e', 0, 2, 0, p); for (let k = 0; k < 5; k++) { const l = box(2.4, .1, .5, '#2f8a3a', 0, 4.1, 0, p); l.rotation.y = k * 1.256; l.position.set(Math.cos(k * 1.256) * 1.0, 4.1, Math.sin(k * 1.256) * 1.0); } }
  const crowd = [];
  for (let i = 0; i < 10; i++) { const p = person({ skin: ['#f1c9a5', '#d7a57c', '#a9724e', '#7a4a2e'][i % 4], hair: ['#1d1410', '#5a3a22', '#c99a52', '#2b2b2b'][i % 4], long: i % 2 === 0, coat: ['#e84a4a', '#3a6cc0', '#2a8a4a', '#f2b51a'][i % 4], pants: '#2c3a55', shoes: '#eee', phone: i % 2 === 0, par: expo, pos: [-9 + i * 2 + hash(i) * .6, 0, -6.2 + hash(i + 2)], scale: .95 + hash(i + 5) * .1 }); p.g.rotation.y = hash(i + 9) * 6.28; crowd.push(p); }
  // delivery riders: bike + thermal backpack
  const riders = [];
  for (let i = 0; i < 4; i++) {
    const r = grp(expo, 0, 0, 0 + i * 1.6 - 1.4); const bike = grp(r, 0, 0, 0);
    for (const x of [-.45, .45]) { const w = box(.08, .6, .6, '#222', x, .32, 0, bike); } box(1.0, .08, .08, '#d22b2b', 0, .62, 0, bike); box(.08, .5, .08, '#d22b2b', -.45, .5, 0, bike); box(.08, .4, .08, '#d22b2b', .3, .85, 0, bike);
    const p = person({ skin: ['#d7a57c', '#a9724e', '#f1c9a5', '#7a4a2e'][i], hair: '#1d1410', coat: '#e0262a', pants: '#2a2a2a', shoes: '#eee', phone: true, hat: 'cap', hatC: '#e0262a', par: r, pos: [-.05, .38, 0], scale: .85 });
    p.g.rotation.y = Math.PI / 2; p.armL.rotation.x = -1.2; p.armR.rotation.x = -1.2; p.legL.rotation.x = -1.0; p.legR.rotation.x = -1.0;
    box(.6, .6, .6, '#ff3b30', -.25, 1.65, 0, r); box(.62, .08, .62, '#fff', -.25, 1.65, 0, r);
    r.userData = { ph: i * .9, sp: 1.8 + i * .35 }; riders.push(r); }
  // Getúlio: short, grey hair, dark suit, vest, cigar
  const GV = { skin: '#efcaa8', hair: '#cfcfcf', brow: '#9a9a9a', coat: '#22252e', sleeve: '#22252e', vest: '#e6e0cf', pants: '#2a2a30', shoes: '#111', collar: '#fff', scale: .88 };
  const lie = person({ ...GV, par: night, pos: [0, 1.2, -1.2] }); lie.g.rotation.x = -Math.PI / 2; R.lie = lie;
  const vg = person({ ...GV, par: night, pos: [0, 0, 1.8] }); R.vg = vg; R.mj = vg;
  const vgE = person({ ...GV, par: expo, pos: [0, 0, 2.2] }); R.vgE = vgE;
  for (const p of [vg, vgE]) { const c = box(.04, .04, .22, '#6b3a1a', .08, .1, .3, p.head); box(.05, .05, .03, mat('#ff6a1a', { e: '#ff5a10', ei: 2 }), .08, .1, .42, p.head); }
  const book = grp(vg.armR, 0, -.5, .1); box(.22, .3, .04, '#1d4fa8', 0, 0, .1, book); box(.14, .1, .05, '#f2f2f2', 0, .02, .13, book); R.book = book;

  function blink(p, t, open) { const b = (t * 1.3 + p.S * 7) % 4 < .12; p.eyes.open.visible = open && !b; p.eyes.closed.visible = !open || b; }
  function update(t, shot) {
    const TI = at('h1', 'em');
    night.visible = shot.loc === 'night'; expo.visible = shot.loc === 'expo';
    // stamp: falls on frame 0, hits the camera at TI
    const u = clamp(t / TI); R.stamp.visible = t < TI + .02; R.stamp.position.y = lerp(15, 0, Math.pow(u, 2.2)); R.stamp.scale.setScalar(1.5); R.stamp.rotation.y = t * .5;
    const awake = t >= at('h1', K.eyes), sit = eio(seg(t, at('v1', 'olhos'), at('v1', 'olhos') + 1.0));
    lie.torso.rotation.x = sit * Math.PI / 2 * .95; blink(lie, t, awake); lie.head.rotation.x = sit > .9 ? -.4 : 0; lie.head.rotation.y = sit > .9 ? Math.sin(t * 1.2) * .5 : 0;
    if (awake && t < at('h1', K.eyes) + .5) lie.eyes.open.scale.set(1, 1.6, 1); else lie.eyes.open.scale.set(1, 1, 1);
    lie.g.visible = shot.nap === 'lie'; vg.g.visible = shot.nap === 'stand' && shot.loc === 'night'; vgE.g.visible = shot.loc === 'expo';
    vg.armL.rotation.set(0, 0, 0); vg.armR.rotation.set(0, 0, 0); vg.head.rotation.set(0, 0, 0); blink(vg, t, true); blink(vgE, t, true);
    R.book.visible = t >= at('v3', 'assinou') && t < at('c1', 0);
    if (R.book.visible) { vg.armR.rotation.x = -1.5 + Math.sin(t * 5) * .1; vg.head.rotation.y = -.3; }
    if (t >= at('v2', 'dezoito') - .1 && t < at('v3', 0)) { vg.armL.rotation.z = .6; vg.armR.rotation.z = -.6; vg.armL.rotation.x = vg.armR.rotation.x = -.3; }   // "what?!"
    if (t >= at('c1', 0) && t < at('v4', 0)) { const k = eo(seg(t, at('c1', 0), at('c1', 0) + .3)); vg.armR.rotation.x = -2.6 * k; }
    vgE.head.rotation.y = Math.sin(t * .6) * .8; vgE.head.rotation.x = -.15; vgE.armL.rotation.z = .3; vgE.armR.rotation.z = -.3;
    riders.forEach((r, i) => { const x = ((t * r.userData.sp + r.userData.ph * 6) % 24) - 12; r.position.x = x; r.rotation.y = 0; r.children[0].children.slice(0, 2).forEach(w => w.rotation.x = t * 8); });
    crowd.forEach((p, i) => { blink(p, t + i, true); p.head.rotation.y = Math.sin(t * .4 + i) * .5; if (p.phone) p.armR.rotation.x = -1.6; });
  }
  ev(at('h1', 'em'), 'splat'); ev(at('h1', K.eyes), 'eyes');
  return { root, R, update };
}
