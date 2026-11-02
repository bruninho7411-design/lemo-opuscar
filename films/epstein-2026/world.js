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

// ---------- the world: MCC New York cell + corridor camera, and a federal courtroom (x = 40) ----------
export function buildWorld(scene) {
  const root = grp(scene); const R = {};
  const cell = grp(root); R.cell = cell;
  box(6, .3, 7, '#8d8d88', 0, -.15, 1, cell);                                     // concrete floor
  for (let i = 0; i < 6; i++) box(.02, .01, 7, '#7b7b77', -2.5 + i, .01, 1, cell);
  box(4.4, 3.2, .25, '#c9c4b2', 0, 1.6, -1.6, cell); box(.25, 3.2, 3.8, '#bdb8a6', -2.2, 1.6, .3, cell); box(.25, 3.2, 3.8, '#bdb8a6', 2.2, 1.6, .3, cell);
  box(4.4, .6, .26, '#9fa79a', 0, .3, -1.58, cell);                               // painted dado
  box(.9, .5, .1, mat('#8fb0d8', { e: '#6d8fc0', ei: .5 }), 0, 2.6, -1.5, cell); for (let i = 0; i < 4; i++) box(.05, .5, .12, '#3a3a3a', -.3 + i * .2, 2.6, -1.46, cell);
  // bunk (steel + thin mattress) along the left wall
  box(.9, .08, 2.2, mat('#9aa3aa', { m: .5, r: .4 }), -1.6, .5, -.25, cell); box(.85, .1, 2.1, '#e8e2cf', -1.6, .59, -.25, cell);
  for (const z of [-1.3, .8]) box(.9, .5, .06, mat('#9aa3aa', { m: .5 }), -1.6, .25, z, cell);
  box(.4, .12, .3, '#f4f1e6', -1.6, .7, -1.1, cell);                               // pillow
  box(.45, .5, .5, mat('#b9c0c6', { m: .6, r: .3 }), 1.7, .25, -1.1, cell); box(.4, .2, .3, mat('#b9c0c6', { m: .6 }), 1.7, .8, -1.35, cell);   // steel toilet/sink
  // the cell front: bars at z = 2.1, door
  for (let i = 0; i < 22; i++) box(.06, 3.0, .06, mat('#4a4f55', { m: .6, r: .4 }), -2.1 + i * .2, 1.5, 2.1, cell);
  for (const y of [.1, 1.5, 2.95]) box(4.4, .08, .1, mat('#4a4f55', { m: .6 }), 0, y, 2.1, cell);
  // corridor + security camera with a REC light
  box(6, .02, 3, '#6f6f6b', 0, .01, 3.8, cell); box(6, 3.2, .25, '#a8a395', 0, 1.6, 5.3, cell);
  const camG = grp(cell, 1.6, 2.7, 4.9); box(.12, .12, .4, '#ddd', 0, .1, 0, camG); box(.34, .24, .5, '#2b2b2b', 0, -.1, -.25, camG); box(.12, .12, .05, '#111', 0, -.1, -.52, camG);
  R.rec = box(.06, .06, .03, mat('#ff2a2a', { e: '#ff2a2a', ei: 3, unique: true }), .12, .02, -.52, camG); camG.rotation.y = .5; camG.rotation.x = .35; R.camG = camG;
  box(.5, .05, 2.2, mat('#fff6dc', { e: '#fff6dc', ei: 1 }), 0, 3.1, 3.8, cell);  // corridor strip light
  const guard = person({ skin: '#7a4a2e', hair: '#1d1410', coat: '#2b3a55', pants: '#22283a', shoes: '#111', belt: '#111', collar: '#2b3a55', hat: 'cap', hatC: '#1e2638', par: cell, pos: [-.9, 0, 3.9] }); R.guard = guard; guard.g.rotation.y = Math.PI;

  const EP = { skin: '#efc9b0', hair: '#a7a7a7', brow: '#3a3330', coat: '#f07a1a', sleeve: '#f07a1a', vest: '#e86e10', pants: '#f07a1a', shoes: '#eeeeee', collar: '#e86e10' };
  const lie = person({ ...EP, par: cell, pos: [-1.6, .64, .85] }); R.lie = lie; lie.g.rotation.x = -Math.PI / 2;
  const ep = person({ ...EP, par: cell, pos: [.3, 0, 1.55] }); R.ep = ep;

  // ===== courtroom (x = 40) =====
  const court = grp(root, 40, 0, 0); R.court = court;
  box(14, .3, 12, '#7a5636', 0, -.15, 0, court); box(14, 5, .3, '#c9b48e', 0, 2.5, -5.5, court);
  box(14, 1.2, .32, '#6b4a2e', 0, .6, -5.45, court);
  box(4, 1.6, 1.4, '#4d3420', 0, .8, -4.2, court); box(4.2, .12, 1.6, '#5f412a', 0, 1.65, -4.2, court);   // the bench
  box(.6, 1.2, .3, '#3a2a1a', 0, 2.3, -5.25, court); box(1.8, .9, .05, '#d7c08a', 0, 3.4, -5.3, court);     // chair back + seal plate
  const judge = person({ skin: '#d7a57c', hair: '#e6e6e6', coat: '#111111', sleeve: '#111111', pants: '#111', shoes: '#111', collar: '#f2f2f2', par: court, pos: [0, .9, -4.6] }); R.judge = judge;
  const gavel = grp(judge.armR, 0, -.5, .1); box(.06, .06, .35, '#5a3a20', 0, 0, .1, gavel); box(.12, .12, .2, '#5a3a20', 0, 0, .27, gavel); R.gavel = gavel;
  const flag = grp(court, -3, 0, -5); box(.06, 3.6, .06, '#c9a23a', 0, 1.8, 0, flag);
  for (let i = 0; i < 7; i++) box(1.4, .13, .03, i % 2 ? '#ffffff' : '#c8102e', .75, 3.4 - i * .13, 0, flag); box(.6, .5, .04, '#0a3161', .35, 3.15, .01, flag);
  for (const [x, w] of [[-2.2, 2.6], [2.2, 2.6]]) box(w, .1, 1.1, '#6b4a2e', x, .8, -1.2, court);       // counsel tables
  for (let r = 0; r < 3; r++) box(10, .5, .5, '#5f412a', 0, .25, 2 + r * 1.3, court);                       // gallery benches
  const courtEp = person({ ...EP, coat: '#2f3238', sleeve: '#2f3238', vest: '#f2f2f2', pants: '#2f3238', shoes: '#111', collar: '#f2f2f2', par: court, pos: [-2.2, 0, -.5] }); R.courtEp = courtEp;
  const crowd = [];
  for (let i = 0; i < 12; i++) { const p = person({ skin: ['#f1c9a5', '#d7a57c', '#a9724e', '#7a4a2e'][i % 4], hair: ['#1d1410', '#5a3a22', '#c99a52', '#2b2b2b'][i % 4], long: i % 3 === 0, coat: ['#3d4a5a', '#5a3d3d', '#2e5d4a', '#6b5a45'][i % 4], pants: '#2c3a55', shoes: '#222', par: court, pos: [-4.4 + (i % 6) * 1.7, 0, 2.4 + Math.floor(i / 6) * 1.3], scale: .95 + hash(i) * .1 }); p.g.rotation.y = Math.PI; crowd.push(p); }

  function blink(p, t, open) { const b = (t * 1.3 + p.S * 7) % 4 < .12; p.eyes.open.visible = open && !b; p.eyes.closed.visible = !open || b; }
  function update(t, shot) {
    cell.visible = shot.loc === 'cell'; court.visible = shot.loc === 'court';
    const awake = t >= at('h1', K.eyes), sit = eio(seg(t, at('v1', 'olhos'), at('v1', 'olhos') + 1.0));
    lie.torso.rotation.x = sit * Math.PI / 2 * .95; blink(lie, t, awake);
    if (awake && t < at('h1', K.eyes) + .5) lie.eyes.open.scale.set(1, 1.6, 1); else lie.eyes.open.scale.set(1, 1, 1);
    lie.head.rotation.y = sit > .9 ? Math.sin(t * 1.6) * .45 : 0;
    lie.g.visible = shot.nap === 'lie'; ep.g.visible = shot.nap === 'stand';
    // at the bars: hands on the bars, looks at the camera; slumps when the sentence lands
    ep.armL.rotation.x = ep.armR.rotation.x = -1.35; ep.armL.rotation.z = .25; ep.armR.rotation.z = -.25; blink(ep, t, true);
    ep.head.rotation.x = t >= at('v3', 'pena') ? .3 : 0; ep.head.rotation.y = t < at('v2', 0) ? -.4 : 0;
    R.rec.material.emissiveIntensity = (t * 1.2) % 1 < .55 ? 4 : 0;
    blink(R.guard, t, true); R.guard.head.rotation.y = Math.sin(t * .7) * .3;
    // court: the gavel falls on "tribunal"
    const tg = at('v7', 'tribunal'), gu = seg(t, tg - .25, tg), back_ = seg(t, tg, tg + .3);
    R.judge.armR.rotation.x = -1.2 - 1.2 * (1 - gu) * (t < tg ? 1 : 0) + (t >= tg ? -1.2 * back_ : 0);
    blink(R.judge, t, true); blink(R.courtEp, t, true); R.courtEp.head.rotation.x = .2;
    crowd.forEach((p, i) => { blink(p, t + i, true); p.head.rotation.y = Math.sin(t * .5 + i) * .15; });
  }
  ev(at('h1', K.eyes), 'eyes'); ev(at('v7', 'tribunal'), 'gavel');
  return { root, R, update };
}
