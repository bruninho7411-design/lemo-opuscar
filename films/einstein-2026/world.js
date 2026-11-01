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

// ---------- the world: a 1955 pathology lab at Princeton (cutaway) ----------
function chalk() {   // the blackboard texture
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#25382f'; x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .04})`; x.fillRect(Math.random() * 1024, Math.random() * 512, 30, 2); }
  x.fillStyle = '#f4f1e6'; x.font = 'bold 150px serif'; x.textAlign = 'center'; x.fillText('E = mc²', 512, 230);
  x.font = 'italic 54px serif'; x.fillStyle = 'rgba(244,241,230,.75)';
  x.fillText('Rμν − ½ R gμν = 8πG Tμν', 512, 360); x.fillText('t′ = t / √(1 − v²/c²)', 512, 450);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function buildWorld(scene) {
  const root = grp(scene); const R = {};
  const lab = grp(root); R.lab = lab;
  // floor: black and white tiles, cutaway slab
  for (let i = -5; i < 5; i++) for (let j = -4; j < 5; j++) box(.98, .06, .98, (i + j) & 1 ? '#e9e6dc' : '#3b3f45', i + .5, -.03, j + .5, lab);
  box(10.2, .3, 9.2, '#5d5650', 0, -.2, .5, lab);
  // walls: back (-z) and left (-x), green tiles to waist, cream above
  box(10, 1.3, .2, '#7fa38f', 0, .65, -4.1, lab); box(10, 2.6, .2, '#e6dcc4', 0, 2.6, -4.1, lab);
  box(.2, 1.3, 9, '#7fa38f', -5.1, .65, .4, lab); box(.2, 2.6, 9, '#e6dcc4', -5.1, 2.6, .4, lab);
  // blackboard on the back wall
  const bb = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.1), new THREE.MeshStandardMaterial({ map: chalk(), roughness: .95 }));
  bb.position.set(1.4, 2.35, -3.98); lab.add(bb); box(4.4, 2.3, .06, '#6b4a2e', 1.4, 2.35, -4.01, lab); box(4.4, .08, .2, '#6b4a2e', 1.4, 1.25, -3.92, lab);
  // window with night-blue glass
  box(1.6, 1.6, .05, mat('#8fb6e8', { e: '#5f8fd0', ei: .6 }), -2.6, 2.6, -3.98, lab); box(1.7, .1, .12, '#f1ece0', -2.6, 1.8, -3.95, lab); box(.08, 1.6, .06, '#f1ece0', -2.6, 2.6, -3.95, lab);
  // shelves with jars on the left wall; one jar holds the brain
  for (const y of [1.0, 1.7, 2.4]) box(.5, .06, 4.4, '#7a5636', -4.75, y, -.4, lab);
  const glass = mat('#cfe8f0', { op: .16, r: .1 });
  const jars = [];
  for (let k = 0; k < 9; k++) {
    const y = [1.0, 1.7, 2.4][k % 3], z = -2.2 + Math.floor(k / 3) * 1.4 + (k % 3) * .2, big = k === 4;
    const jr = grp(lab, -4.72, y + .03, z);
    const h = big ? .62 : .32 + hash(k) * .2, r = big ? .26 : .13;
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), glass); cyl.position.y = h / 2; jr.add(cyl);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(r * .92, r * .92, h * .8, 12), mat(big ? '#e8d77a' : ['#c9e2a0', '#e8c890', '#b8d8e0'][k % 3], { op: big ? .18 : .4 })); liq.position.y = h * .4; jr.add(liq);
    box(r * 2.1, .05, r * 2.1, '#3a3a3a', 0, h + .025, 0, jr);
    if (big) {   // the brain: pink lumps
      for (let b = 0; b < 14; b++) box(.13, .11, .15, mat(jit('#ec8fa0', b, .1), { e: '#5a1f2a', ei: .5 }), (hash(b) - .5) * .26, .24 + (hash(b + 3) - .5) * .18, (hash(b + 7) - .5) * .26, jr);
      R.brainJar = jr;
      const lbl = box(.02, .12, .2, '#f4ecd2', .26, .38, 0, jr);
    }
    jars.push(jr);
  }
  // steel autopsy table + sheet
  box(1.0, .08, 2.6, mat('#b9c0c6', { m: .6, r: .35 }), 0, .9, 0, lab);
  for (const [x, z] of [[-.4, -1.1], [.4, -1.1], [-.4, 1.1], [.4, 1.1]]) box(.07, .86, .07, mat('#8c939a', { m: .6, r: .4 }), x, .45, z, lab);
  const sheet = box(1.04, .05, 1.7, '#f2f2ee', 0, .96, .45, lab); R.sheet = sheet;
  // desk with lamp + typewriter-ish blocks
  box(1.8, .08, .9, '#6b4a2e', 3.2, .82, -2.9, lab); box(.08, .8, .08, '#4d3420', 2.4, .41, -3.25, lab); box(.08, .8, .08, '#4d3420', 4.0, .41, -3.25, lab);
  box(.08, .8, .08, '#4d3420', 2.4, .41, -2.55, lab); box(.08, .8, .08, '#4d3420', 4.0, .41, -2.55, lab);
  box(.2, .05, .2, '#2e5d4a', 3.8, .87, -3.1, lab); box(.04, .45, .04, '#2e5d4a', 3.8, 1.1, -3.1, lab); box(.3, .14, .2, mat('#2e5d4a', { e: '#ffcc66', ei: .2 }), 3.7, 1.32, -3.1, lab);
  for (let i = 0; i < 5; i++) box(.3, .04, .4, '#f4ecd2', 2.9 + i * .05, .88 + i * .045, -2.9, lab);
  // lamp over the table
  box(.7, .12, .7, '#2a2a2a', 0, 3.4, 0, lab); box(.5, .03, .5, mat('#fff4d6', { e: '#fff4d6', ei: .8 }), 0, 3.33, 0, lab);

  const EIN = { skin: '#f0cfae', hair: '#f2f2f2', wild: '#f4f4f2', mustache: '#ececec', brow: '#d8d8d8', coat: '#7d7f86', vest: '#e9e4d8', pants: '#5a5048', shoes: '#3a2a20', collar: '#e9e4d8', cuff: '#6b6d74' };
  const einLie = person({ ...EIN, par: lab, pos: [0, .95, .85] }); R.einLie = einLie; einLie.g.rotation.x = -Math.PI / 2;
  const ein = person({ ...EIN, par: lab, pos: [.2, 0, 1.7] }); R.ein = ein;
  const stud = person({ skin: '#a9724e', hair: '#1d1410', coat: '#e8553f', pants: '#2c3a55', shoes: '#eeeeee', phone: true, bigPhone: 1.5, par: lab, pos: [1.2, 0, 1.9] }); R.stud = stud;
  stud.g.rotation.y = -1.2;
  // Einstein's own phone (appears in his hand when he takes it)
  const myPhone = grp(ein.armR, 0, -.5, .06); box(.12, .2, .025, '#111', 0, 0, 0, myPhone); box(.1, .17, .01, mat('#9fd0ff', { e: '#bfe2ff', ei: 1.2 }), 0, 0, .014, myPhone); myPhone.scale.setScalar(1.5); R.myPhone = myPhone;

  function walk(p, t, sp = 1, amp = .5) { const w = Math.sin(t * 7 * sp) * amp; p.legL.rotation.x = w; p.legR.rotation.x = -w; p.armL.rotation.x = -w * .8; p.armR.rotation.x = w * .8; }
  function still(p) { p.legL.rotation.x = p.legR.rotation.x = 0; p.armL.rotation.x = p.armR.rotation.x = 0; p.armL.rotation.z = p.armR.rotation.z = 0; }
  function blink(p, t, open) { const b = (t * 1.3 + p.S * 7) % 4 < .12; p.eyes.open.visible = open && !b; p.eyes.closed.visible = !open || b; }
  function talk(p, t, on) { const m = on && Math.sin(t * 22) > .1; p.mouth.open.visible = m; p.mouth.flat.visible = !m; }

  function update(t, shot) {
    // lying -> sitting up on "olhos"
    const awake = t >= at('h1', K.eyes);
    const sit = eio(seg(t, at('v1', 'olhos'), at('v1', 'olhos') + 1.0));
    einLie.torso.rotation.x = sit * Math.PI / 2 * .95; einLie.armL.rotation.x = einLie.armR.rotation.x = -sit * .3;
    blink(einLie, t, awake); talk(einLie, t, false);
    if (awake && t < at('h1', K.eyes) + .5) einLie.eyes.open.scale.set(1, 1.6, 1); else einLie.eyes.open.scale.set(1, 1, 1);
    einLie.head.rotation.y = sit > .9 ? Math.sin(t * 2.2) * .5 : 0;   // looking around for the missing brain
    einLie.g.visible = shot.nap === 'lie';
    R.sheet.position.y = .96 + (shot.nap === 'lie' && sit < .5 ? 0 : 0);
    // standing Einstein + student
    ein.g.visible = shot.nap === 'stand'; stud.g.visible = shot.nap === 'stand' && t < at('v7', 0);
    still(ein); blink(ein, t, true);
    const grab = t >= at('v3', K.phone);
    stud.phone.g = stud.phone; stud.phone.visible = !grab;
    R.myPhone.visible = grab && t < at('c1', 0);
    stud.armR.rotation.x = grab ? -.3 : -1.1; blink(stud, t, true);
    stud.mouth.open.visible = grab && t < at('v3', K.phone) + 1.2; stud.mouth.flat.visible = !stud.mouth.open.visible;
    if (grab && t < at('c1', 0)) { ein.armR.rotation.x = -1.3; ein.head.rotation.x = .35; } else ein.head.rotation.x = 0;
    // proud chest-out on "orgulhoso", tongue on "língua"
    const tongue = t >= at('v6', 'lingua') && t < at('c1', 0);
    ein.mouth.tongue.visible = tongue; ein.mouth.open.visible = tongue; ein.mouth.flat.visible = !tongue;
    if (t >= at('v5', 0) && t < at('v6', 0)) { ein.torso.rotation.x = -.08; ein.armL.rotation.z = .5; ein.armR.rotation.z = -.5; }
    else ein.torso.rotation.x = 0;
    if (tongue) { ein.armL.rotation.x = -.2; ein.head.rotation.z = Math.sin(t * 8) * .06; } else ein.head.rotation.z = 0;
    // like/follow: thumbs up
    if (t >= at('c1', 0) && t < at('v7', 0)) { const k = eo(seg(t, at('c1', 0), at('c1', 0) + .3)); ein.armR.rotation.x = -1.5 * k; ein.armR.rotation.z = -.3 * k; }
    // TikTok at the blackboard: selfie arm + talking
    if (t >= at('v7', 0)) {
      ein.g.position.set(1.4, 0, -2.7); ein.g.rotation.y = 0; R.myPhone.visible = true;
      ein.armR.rotation.x = -1.6; ein.armR.rotation.z = -.35; ein.armL.rotation.x = -1.2 + Math.sin(t * 5) * .4; ein.armL.rotation.z = .4;
      talk(ein, t, t < at('v8', 0)); if (t >= at('v8', 'gato')) { ein.head.rotation.x = .3; ein.armL.rotation.x = 0; }
    } else { ein.g.position.set(.2, 0, 1.7); ein.g.rotation.y = .15; }
  }
  ev(at('h1', K.eyes), 'eyes'); ev(at('v1', 'olhos'), 'situp'); ev(at('v3', K.phone), 'grab');
  return { root, R, update };
}
