// The world: the crypt under the Invalides dome (sarcophagus, balustrade, tourists) and a Paris street with the Eiffel tower.
// Voxel characters built from boxes. Everything is a pure function of t; sound cues go to EVS.
import * as THREE from 'three';
import { clamp, seg, ss, eio, eo, lerp, hash, TAU, back } from '/core/lib.js';
import { at, K } from './story.js';

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
  // face
  const eyes = { open: grp(head, 0, 0, 0), closed: grp(head, 0, 0, 0) };
  for (const s of [-1, 1]) {
    box(.09, .08, .02, '#ffffff', s * .1, .23, .205, eyes.open);
    box(.045, .07, .02, '#15110e', s * .1 + .015 * s * 0, .225, .212, eyes.open);
    box(.1, .025, .02, '#3a2418', s * .1, .215, .205, eyes.closed);
    box(.1, .025, .02, o.brow || o.hair || '#3a2418', s * .1, .31, .205, head);   // brows
  }
  eyes.closed.visible = false;
  const mouth = grp(head, 0, .1, .205);
  mouth.flat = box(.14, .025, .02, '#6b2b22', 0, 0, 0, mouth);
  mouth.open = box(.12, .07, .02, '#3d120d', 0, -.01, 0, mouth); mouth.open.visible = false;
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

// ---------- the world ----------
export function buildWorld(scene) {
  const root = grp(scene);
  const R = {};

  // ===== CRYPT (origin) =====
  const crypt = grp(root); R.crypt = crypt;
  // floor: marble disc with a radial star mosaic (low-poly)
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, .3, 40), mat('#d9cdb4')); disc.position.y = -.15; disc.receiveShadow = true; crypt.add(disc);
  for (let i = 0; i < 24; i++) {   // star rays in two stones
    const a = i / 24 * TAU, r = grp(crypt); r.rotation.y = a;
    box(.34, .02, 3.2, i % 2 ? '#7b3d2b' : '#2f4f45', 0, .01, 2.7, r);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.6, .1, 4, 40), mat('#b88a3a', { m: .3, r: .5 })); ring.rotation.x = Math.PI / 2; ring.position.y = .02; crypt.add(ring);
  // plinth (green granite) + sarcophagus (red quartzite)
  box(2.0, .5, 3.4, '#2f4a3a', 0, .25, 0, crypt);
  box(1.6, .7, 2.9, '#7a2e24', 0, .85, 0, crypt);
  box(1.75, .12, 3.05, '#8c3a2c', 0, 1.24, 0, crypt);
  for (const s of [-1, 1]) box(.12, .5, 2.7, '#5f2119', s * .82, .85, 0, crypt);   // side scrolls
  const lid = grp(crypt, 0, 1.3, 0); R.lid = lid;
  box(1.7, .16, 3.0, '#8c3a2c', 0, .08, 0, lid); box(1.4, .16, 2.7, '#933f30', 0, .24, 0, lid); box(1.0, .12, 2.3, '#9b4535', 0, .38, 0, lid);
  // balustrade ring
  for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; box(.12, .7, .12, '#e6dcc6', Math.cos(a) * 5.4, .35, Math.sin(a) * 5.4, crypt); }
  const rail = new THREE.Mesh(new THREE.TorusGeometry(5.4, .1, 4, 44), mat('#efe6d2')); rail.rotation.x = Math.PI / 2; rail.position.y = .74; rail.castShadow = true; crypt.add(rail);
  // columns + gallery wall
  for (let i = 0; i < 12; i++) {
    const a = (i + .5) / 12 * TAU, x = Math.cos(a) * 8.2, z = Math.sin(a) * 8.2;
    box(.8, 6, .8, '#d8ccb2', x, 3, z, crypt); box(1.1, .3, 1.1, '#cbbd9f', x, .15, z, crypt); box(1.1, .3, 1.1, '#cbbd9f', x, 6.1, z, crypt);
  }
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(9.3, 9.3, 7, 24, 1, true), mat('#b9ab8e', { side: 'b' })); wall.material.side = THREE.BackSide; wall.position.y = 3.3; crypt.add(wall);
  // dust puffs for the lid
  const dust = []; for (let i = 0; i < 40; i++) { const d = box(.08, .08, .08, mat('#cdbfa2', { op: .8, unique: true }), 0, 0, 0, crypt); d.visible = false; d.castShadow = false; dust.push(d); }

  // Napoleon in the sarcophagus (lying, then sitting up)
  const NAP = { skin: '#f0c8a4', hair: '#3b2618', fringe: true, coat: '#1f2c5c', vest: '#efe9dc', pants: '#efe9dc', shoes: '#141414', collar: '#d9aa38', cuff: '#d9aa38', sash: '#c62f2f', hat: 'bicorne', tails: true, brow: '#2a1a10' };
  const napLie = person({ ...NAP, par: crypt, pos: [0, 1.3, .75] }); R.napLie = napLie;
  napLie.g.rotation.x = -Math.PI / 2;   // lying face up, head toward -z
  napLie.g.position.set(0, 1.32, .85);
  // Napoleon standing in front of the tomb (phones, hands up, height)
  const napStand = person({ ...NAP, par: crypt, pos: [0, 0, 2.6] }); R.napStand = napStand;
  // a modern tall French tourist for the height gag
  const tall = person({ skin: '#e9c2a0', hair: '#6b4a2e', coat: '#3d7a5a', pants: '#2c3a55', shoes: '#eeeeee', par: crypt, pos: [.75, 0, 2.6], scale: 1.75 / 1.69 * 1.0, phone: true });
  R.tall = tall; tall.g.visible = false;
  // tourists around the balustrade with phones up
  const TOUR = [];
  const shirts = ['#e8553f', '#f2b134', '#3f8fd6', '#55b38a', '#b25bd0', '#ef7aa7', '#e9e3d2', '#2f2f36', '#f08b3e', '#5bc0c9'];
  const hairs = ['#1d1410', '#5a3a22', '#c99a52', '#2b2b2b', '#8a4b2a', '#d9d0c0'];
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI / 2 + (i - 12.5) / 26 * Math.PI * 1.55 + Math.PI, r = 6.0 + (i % 2) * .7;
    const p = person({ skin: ['#f1c9a5', '#d7a57c', '#a9724e', '#7a4a2e', '#f3d2b8'][i % 5], hair: hairs[i % 6], long: i % 3 === 0, coat: shirts[i % 10], pants: ['#2c3a55', '#3b3b40', '#6b5a45', '#25304a'][i % 4], shoes: ['#eeeeee', '#222', '#8a4b2a'][i % 3],
      hat: i % 7 === 3 ? 'cap' : null, hatC: shirts[(i + 3) % 10], phone: true, bigPhone: 1.7, par: crypt, pos: [Math.cos(a) * r, 0, Math.sin(a) * r], scale: .92 + hash(i) * .16 });
    p.g.rotation.y = Math.atan2(-p.g.position.x, -p.g.position.z);   // face the tomb
    p.ph = hash(i + 11); TOUR.push(p);
  }
  R.TOUR = TOUR;

  // ===== PARIS STREET (x = 60) =====
  const street = grp(root, 60, 0, 0); R.street = street;
  box(40, .3, 60, '#8e8a84', 0, -.15, 0, street);                 // asphalt
  for (const s of [-1, 1]) box(4, .4, 60, '#c9c2b4', s * 6, -.1, 0, street);   // pavements
  for (let z = -28; z < 28; z += 3) box(.25, .02, 1.4, '#f2efe6', 0, .02, z, street);   // lane dashes
  // Haussmann blocks: cream stone, blue-grey zinc roofs, balconies
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) {
    const z = -26 + i * 6.2, h = 9 + (i % 3) * .8, x = s * 11;
    box(6, h, 6, jit('#e5d8bd', i * 7 + s, .05), x, h / 2, z, street);
    box(6.4, 1.8, 6.4, '#6f7e8c', x, h + .9, z, street); box(4.6, 1.2, 4.6, '#62717f', x, h + 2.2, z, street);
    for (let f = 0; f < 4; f++) for (let w = -1; w <= 1; w++) {
      box(.05, 1.0, .7, '#3d4a5a', x - s * 3.01, 2.0 + f * 2, z + w * 1.8, street);   // windows
      if (f === 1 || f === 3) box(.3, .08, 5.4, '#2a2a2a', x - s * 3.15, 1.4 + f * 2, z, street);   // iron balconies
    }
    box(.4, .3, 6.2, '#f1e6cf', x - s * 3.05, 1.0, z, street);   // shopfront line
    box(.05, 1.4, 4.4, ['#8c2f39', '#2e5d4a', '#2c3d6b'][i % 3], x - s * 3.03, .8, z, street);
  }
  // Eiffel tower at the end of the avenue (low-poly lattice)
  const eif = grp(street, 0, 0, -60); R.eif = eif;
  const iron = mat('#6b5a48');
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    for (let k = 0; k < 14; k++) { const y = k * 1.0, d = lerp(6, 1.4, Math.pow(k / 14, .8)); box(1.1, 1.05, 1.1, iron, sx * d, y + .5, sz * d, eif); }
  }
  for (const s2 of [-1, 1]) { box(12.5, .5, .5, iron, 0, 4.2, s2 * 4.6, eif); box(.5, .5, 9.6, iron, s2 * 4.6, 4.2, 0, eif); }
  box(10, .6, 10, iron, 0, 5, 0, eif); box(4.2, .5, 4.2, iron, 0, 14.2, 0, eif);
  for (let k = 0; k < 12; k++) box(lerp(2.8, .5, k / 12), 2.0, lerp(2.8, .5, k / 12), iron, 0, 15.3 + k * 1.9, 0, eif);
  box(1.6, .4, 1.6, iron, 0, 26, 0, eif);
  box(.2, 3, .2, iron, 0, 39, 0, eif);
  // EU banner on a pole + a border booth with the barrier up
  const flag = grp(street, -3.6, 0, -6); R.flag = flag;
  box(.12, 5.5, .12, '#d0d0d0', 0, 2.75, 0, flag);
  const cloth = grp(flag, .9, 4.7, 0); box(1.8, 1.2, .04, '#1d3fa0', 0, 0, 0, cloth);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; box(.09, .09, .05, '#ffd31a', Math.cos(a) * .38, Math.sin(a) * .38, .02, cloth); }
  R.cloth = cloth;
  const booth = grp(street, 3.4, 0, -10); box(1.6, 2.4, 1.6, '#f1efe8', 0, 1.2, 0, booth); box(1.8, .2, 1.8, '#2a4fa3', 0, 2.5, 0, booth); box(1.62, .7, .05, '#8fb6d9', 0, 1.6, .81, booth);
  const bar = grp(booth, -1.0, 1.0, .2); const barArm = box(4.5, .14, .14, '#d43c32', -2.2, 0, 0, bar); for (let i = 0; i < 5; i++) box(.4, .15, .15, '#ffffff', -.6 - i * .9, 0, 0, bar);
  bar.rotation.z = -1.35; R.bar = bar;
  // scooters, café tables, pigeons
  for (let i = 0; i < 4; i++) { const sc = grp(street, 5.2, 0, -2 + i * 1.1); box(.15, .06, .9, '#1fbf7a', 0, .12, 0, sc); box(.05, .9, .05, '#333', 0, .55, .42, sc); box(.4, .05, .05, '#333', 0, .98, .42, sc); }
  for (let i = 0; i < 3; i++) { const c = grp(street, -5.4, 0, 4 + i * 2.2); box(.6, .05, .6, '#eae4d6', 0, .75, 0, c); box(.08, .75, .08, '#2a2a2a', 0, .37, 0, c); for (const s of [-1, 1]) box(.35, .45, .35, '#a52a2a', s * .55, .22, 0, c); }
  const napSt = person({ ...NAP, par: street, pos: [0, 0, 6] }); R.napSt = napSt;
  // pedestrians on the pavements (walk loops)
  const PED = [];
  for (let i = 0; i < 12; i++) {
    const s = i % 2 ? 1 : -1;
    const p = person({ skin: ['#f1c9a5', '#d7a57c', '#a9724e', '#7a4a2e'][i % 4], hair: hairs[i % 6], long: i % 3 === 1, coat: shirts[(i * 3) % 10], pants: '#2c3a55', shoes: '#eee', phone: i % 3 !== 2, par: street, pos: [s * (5 + hash(i) * 1.2), 0, -20 + i * 3.4], scale: .95 + hash(i + 4) * .12 });
    p.dir = i % 4 < 2 ? 1 : -1; p.g.rotation.y = p.dir > 0 ? 0 : Math.PI; p.z0 = p.g.position.z; PED.push(p);
  }
  R.PED = PED;

  // ---------- animation ----------
  function walk(p, t, speed = 1, amp = .5) {
    const w = Math.sin(t * 7 * speed) * amp;
    p.legL.rotation.x = w; p.legR.rotation.x = -w; p.armL.rotation.x = -w * .8; p.armR.rotation.x = w * .8; p.hips.position.y = .62 + Math.abs(Math.cos(t * 7 * speed)) * .03;
  }
  function blink(p, t, open) { const b = (t * 1.3 + p.S * 7) % 4 < .12; p.eyes.open.visible = open && !b; p.eyes.closed.visible = !open || b; }
  function talk(p, t, on) { const m = on && Math.sin(t * 22) > .1; p.mouth.open.visible = m; p.mouth.flat.visible = !m; }

  function update(t, shot) {
    crypt.visible = shot.loc === 'crypt'; street.visible = shot.loc === 'street';
    // —— lid slides off, Napoleon sits up ——
    const lidU = eio(seg(t, at('v1', K.lid), at('v1', K.lid) + 1.2));
    lid.visible = shot.name !== 'face';
    lid.position.set(lerp(0, 1.9, lidU), 1.3 + Math.sin(lidU * Math.PI) * .25 - lidU * 1.0, 0); lid.rotation.z = -lidU * .5;
    if (lidU > 0 && lidU < 1 && !R._lidEv) { R._lidEv = 1; }
    const dt = t - at('v1', K.lid);
    dust.forEach((d, i) => {
      const u = (dt - hash(i) * .5) / 1.6; d.visible = u > 0 && u < 1 && crypt.visible;
      if (d.visible) { const a = hash(i + 3) * TAU, r = 1.1 + u * (1 + hash(i + 5) * 1.6); d.position.set(Math.cos(a) * r * .8, 1.3 + u * (.5 + hash(i + 8)) , Math.sin(a) * r); d.material.opacity = .8 * (1 - u); d.scale.setScalar(1 + u * 2); }
    });
    // lying → sitting (torso pivots at the hips)
    const sit = eio(seg(t, at('v1', K.lid) + .8, at('v1', K.lid) + 2.0));
    napLie.torso.rotation.x = sit * Math.PI / 2 * .95;
    napLie.armL.rotation.x = napLie.armR.rotation.x = -sit * .3;
    const awake = t >= at('h1', K.eyes);
    blink(napLie, t, awake); talk(napLie, t, false);
    napLie.head.rotation.y = awake ? Math.sin(t * 1.7) * .25 * sit : 0;
    if (awake && t < at('h1', K.eyes) + .5) { napLie.eyes.open.scale.set(1, 1.6, 1); } else napLie.eyes.open.scale.set(1, 1, 1);
    napLie.g.visible = shot.nap === 'lie';
    // standing Napoleon
    napStand.g.visible = shot.nap === 'stand';
    const hands = t >= at('v3', K.hands) && t < at('v4', 0) + .2 ? eo(seg(t, at('v3', K.hands), at('v3', K.hands) + .25)) : 0;
    const hip = (t >= at('v5', 0) && t < at('v7', 0)) || (t >= at('v4', 0) && t < at('v5', 0));
    napStand.armL.rotation.x = napStand.armR.rotation.x = -hands * 2.9;
    napStand.armL.rotation.z = hands * .25; napStand.armR.rotation.z = -hands * .25;
    if (!hands) {   // the famous hand-in-waistcoat pose, other arm behind the back
      napStand.armR.rotation.x = -.6; napStand.armR.rotation.z = -.95; napStand.armL.rotation.x = .3;
    }
    blink(napStand, t, true); talk(napStand, t, false);
    napStand.head.rotation.y = hands ? Math.sin(t * 9) * .12 : Math.sin(t * .9) * .15;
    napStand.head.rotation.x = t >= at('v7', 0) && t < at('v8', 0) ? .28 : 0;   // looks down at the end of the height gag
    napStand.g.rotation.y = hip ? .25 : 0;
    // the tall modern Frenchman walks in on v6
    tall.g.visible = shot.loc === 'crypt' && t >= at('v6', 0) - .1 && t < at('v8', 0);
    const tin = eo(seg(t, at('v6', 0), at('v6', 0) + 1.0));
    tall.g.position.set(lerp(3.2, .78, tin), 0, 2.6); tall.g.rotation.y = tin < 1 ? -Math.PI / 2 : -.2;
    if (tin < 1) walk(tall, t, 1, .5); else { tall.legL.rotation.x = tall.legR.rotation.x = 0; tall.armL.rotation.x = 0; tall.armR.rotation.x = -1.2; }
    blink(tall, t, true);
    if (tall.phone) tall.phone.screen.material.emissiveIntensity = 1.2;
    // tourists: phones up from v2, flash bursts
    const up = eo(seg(t, at('v2', K.phonesUp), at('v2', K.phonesUp) + .6));
    TOUR.forEach((p, i) => {
      p.armR.rotation.x = -up * (1.35 + .2 * hash(i)); p.armL.rotation.x = -up * .4;
      p.head.rotation.y = Math.sin(t * .8 + i) * .1;
      blink(p, t + i, true);
      const fl = (t > at('v2', K.phonesUp) + .3 && t < at('v5', 0)) && ((t * 2.3 + p.ph * 7) % 1.7 < .07);
      p.phone.flash.material.emissiveIntensity = fl ? 9 : 0;
      p.g.visible = crypt.visible;
    });
    // —— street ——
    napSt.g.visible = shot.loc === 'street';
    const march = t < at('v9', K.border) + .3;
    const z = march ? lerp(6, -4.8, seg(t, at('v8', 0) - .3, at('v9', K.border) + .3)) : -4.8;
    napSt.g.position.set(march ? 0 : 0, 0, z); napSt.g.rotation.y = Math.PI;
    if (march) walk(napSt, t, 1.25, .6);
    else { napSt.legL.rotation.x = napSt.legR.rotation.x = 0; napSt.armL.rotation.x = 0; napSt.armR.rotation.x = 0; }
    if (march) { napSt.armR.rotation.x = -2.6; napSt.armR.rotation.z = -.1; }   // arm up: "à l'attaque"
    const live = t >= at('v10', K.live);
    if (live) {   // selfie stick: arm out front, turns to camera
      napSt.g.rotation.y = 0; napSt.armR.rotation.x = -1.6; napSt.armR.rotation.z = -.35; napSt.armL.rotation.x = -.4;
      napSt.head.rotation.x = Math.sin(t * 6) * .05;
    } else napSt.head.rotation.x = 0;
    blink(napSt, t, true); talk(napSt, t, live);
    bar.rotation.z = -1.35;
    R.cloth.rotation.y = Math.sin(t * 2.2) * .18; R.cloth.position.x = .9;
    PED.forEach((p, i) => { const zz = p.z0 + p.dir * ((t * .9 + hash(i) * 10) % 14) - p.dir * 7; p.g.position.z = zz; walk(p, t + i, .8, .4); blink(p, t + i, true); });
  }

  // sound cues collected from the timeline
  ev(at('h1', K.eyes), 'eyes'); ev(at('v1', K.lid), 'lid'); ev(at('v2', K.phonesUp) + .3, 'shutters'); ev(at('v3', K.hands), 'gasp');
  return { root, R, update };
}
