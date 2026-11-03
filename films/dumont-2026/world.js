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

// ---------- the world: Santos Dumont airport (Rio) runway, Sugarloaf, terminal, an airliner, the 14-bis ----------
function signTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 160; const x = c.getContext('2d');
  x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, 1024, 160); x.fillStyle = '#1d3fa0'; x.font = 'bold 74px sans-serif'; x.textAlign = 'center'; x.fillText('AEROPORTO SANTOS DUMONT', 512, 108);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function plane14(par) {   // the 14-bis: bamboo frame, box-kite canard in front, two cellular box wings, pusher prop at the back
  const g = grp(par), cloth = mat('#efe6cf', { r: .9 }), bam = mat('#c8a46b');
  box(.08, .08, 4.2, bam, 0, 0, 0, g);                                            // fuselage spar
  const cell = (cx, cy, cz, w, h, d) => { box(w, .03, d, cloth, cx, cy + h / 2, cz, g); box(w, .03, d, cloth, cx, cy - h / 2, cz, g); box(.03, h, d, cloth, cx - w / 2, cy, cz, g); box(.03, h, d, cloth, cx + w / 2, cy, cz, g); };
  cell(0, 0, 2.0, .7, .5, .7);                                                       // canard box kite (front, +z)
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) cell(sx * (.5 + k * .62), .25, -.6, .6, .9, .9);   // cellular wings
  box(4.3, .04, .9, cloth, 0, .72, -.6, g); box(4.3, .04, .9, cloth, 0, -.22, -.6, g);
  box(.3, .3, .4, '#3a3a3a', 0, .25, -1.6, g);                                       // engine
  const prop = grp(g, 0, .25, -1.85); box(1.6, .1, .04, '#7a5636', 0, 0, 0, prop); box(.1, 1.6, .04, '#7a5636', 0, 0, 0, prop);
  box(.4, .4, .4, mat('#a07a48', { r: .9 }), 0, -.15, -.2, g);                       // the basket
  for (const z of [-.2, .8]) box(.04, .6, .04, bam, 0, -.4, z, g); box(.6, .04, .04, bam, 0, -.7, .3, g);   // landing legs + wheels
  for (const x of [-.25, .25]) box(.08, .25, .25, '#222', x, -.75, .3, g);
  g.prop = prop; return g;
}
export function buildWorld(scene) {
  const root = grp(scene); const R = {};
  const air = grp(root); R.air = air;
  box(60, .3, 120, '#6e8a57', 0, -.16, -20, air);                                   // grass
  box(12, .1, 120, '#4b4d52', 0, -.02, -20, air);                                    // runway
  for (let z = 30; z > -80; z -= 6) box(.4, .02, 3, '#f2f2ee', 0, .04, z, air);       // centre line
  for (const x of [-5.6, 5.6]) box(.25, .02, 120, '#f2f2ee', x, .04, -20, air);
  for (let i = 0; i < 6; i++) { box(.5, .02, 4, '#f2f2ee', -4 + i * 1.6, .04, 26, air); }   // threshold stripes
  box(200, .2, 120, mat('#2f7fb8', { r: .3 }), 0, -.3, -140, air);                    // Guanabara bay
  // Sugarloaf + Urca
  const sl = grp(air, 34, 0, -110);
  for (let k = 0; k < 9; k++) { const r = lerp(10, 3, k / 9); box(r * 2, 4.2, r * 1.7, jit('#5f7d4c', k, .1), 0, 2.1 + k * 4, 0, sl); }
  for (let k = 0; k < 4; k++) { const r = lerp(9, 4, k / 4); box(r * 2, 3.5, r * 1.6, jit('#6b8a54', k + 9, .1), -24, 1.75 + k * 3.5, 8, sl); }
  box(1.5, 1.5, 1.5, '#c9c9c9', 0, 39, 0, sl);
  // terminal with the sign
  const term = grp(air, -16, 0, -6); box(14, 5, 6, '#e9e6dc', 0, 2.5, 0, term); box(14.4, .4, 6.4, '#9aa3aa', 0, 5.2, 0, term);
  box(13, 2.2, .05, mat('#7fb3d8', { e: '#4f7fa8', ei: .2 }), 0, 2.2, 3.02, term);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.9), new THREE.MeshStandardMaterial({ map: signTex() })); sign.position.set(0, 4.3, 3.05); term.add(sign);
  // control tower
  const tw = grp(air, -26, 0, -16); box(2, 14, 2, '#e9e6dc', 0, 7, 0, tw); box(3.4, 2, 3.4, mat('#4f7fa8', { e: '#4f7fa8', ei: .2 }), 0, 15, 0, tw); box(3.8, .4, 3.8, '#9aa3aa', 0, 16.2, 0, tw);
  // airliner (taxi -> takeoff on v2)
  const jet = grp(air, 0, 0, 60); R.jet = jet;
  box(2.2, 2.2, 16, '#f4f4f4', 0, 2.2, 0, jet); box(1.6, 1.6, 2, '#f4f4f4', 0, 2.2, 8.6, jet); box(2.24, .5, 16, '#1d3fa0', 0, 1.5, 0, jet);
  box(18, .3, 3.2, '#e8e8e8', 0, 1.6, -.5, jet); box(.3, 4, 3, '#1d3fa0', 0, 4.8, -7, jet); box(6, .25, 2, '#e8e8e8', 0, 3.2, -7, jet);
  for (const x of [-4, 4]) box(1.1, 1.1, 2.6, '#c9c9c9', x, 1.1, .3, jet);
  for (let i = 0; i < 10; i++) for (const x of [-1.11, 1.11]) box(.02, .35, .35, '#2a3a55', x, 2.6, 6 - i * 1.2, jet);
  // the 14-bis
  const pl = plane14(air); R.pl = pl;
  const debris = []; for (let i = 0; i < 30; i++) { const d = box(.15 + hash(i) * .3, .04, .2 + hash(i + 2) * .4, i % 3 ? mat('#efe6cf') : mat('#c8a46b'), 0, 0, 0, air); d.visible = false; debris.push(d); }
  const smoke = []; for (let i = 0; i < 18; i++) { const d = box(.6, .6, .6, mat('#8a8a8a', { op: .5, unique: true }), 0, 0, 0, air); d.castShadow = false; d.visible = false; smoke.push(d); }
  // Santos Dumont: slim, dark suit, high white collar, moustache, the panama hat, a wristwatch
  const SD = { skin: '#efcfb4', hair: '#2a1c14', brow: '#2a1c14', mustache: '#2a1c14', coat: '#2c2a33', sleeve: '#2c2a33', vest: '#f4f4f0', pants: '#2c2a33', shoes: '#151515', collar: '#f4f4f0', hat: 'panama' };
  const watch = p => { box(.15, .06, .17, '#3a2a1a', 0, -.38, 0, p.armL); box(.1, .02, .1, mat('#e8d27a', { e: '#e8d27a', ei: .3 }), 0, -.38, .09, p.armL); };
  const lie = person({ ...SD, par: air, pos: [.6, .14, 3.4], scale: .95 }); lie.g.rotation.x = -Math.PI / 2; watch(lie); R.lie = lie;
  const sd = person({ ...SD, par: air, pos: [.6, 0, 2.2], scale: .95 }); watch(sd); R.sd = sd;
  // passengers walking by with watches/phones
  const crowd = [];
  for (let i = 0; i < 8; i++) { const p = person({ skin: ['#f1c9a5', '#d7a57c', '#a9724e', '#7a4a2e'][i % 4], hair: ['#1d1410', '#5a3a22', '#c99a52', '#2b2b2b'][i % 4], long: i % 2 === 0, coat: ['#e8553f', '#3f8fd6', '#55b38a', '#f2b134'][i % 4], pants: '#2c3a55', shoes: '#eee', phone: i % 2 === 1, par: air, pos: [-3.5 + i * .9, 0, -1 - (i % 3)], scale: .95 + hash(i) * .1 }); p.g.visible = false; crowd.push(p); }

  const TI = () => at('h1', 'em');   // impact time
  function blink(p, t, open) { const b = (t * 1.3 + p.S * 7) % 4 < .12; p.eyes.open.visible = open && !b; p.eyes.closed.visible = !open || b; }
  function update(t, shot) {
    const ti = TI();
    // the dive: from high and far, nose down, spinning, straight at the camera
    if (t < ti) { const u = seg(t, 0, ti), e = u * u; pl.position.set(lerp(-3, .2, e), lerp(13, 1.0, e), lerp(-8, 3.6, e)); pl.rotation.set(lerp(.4, .9, u), Math.PI, t * 4.5); pl.visible = true; }
    else { pl.position.set(-.8, .25, 1.0); pl.rotation.set(.15, Math.PI + .5, -.6); }   // the wreck
    pl.prop.rotation.z = t < ti ? t * 40 : .4;
    const dt = t - ti;
    debris.forEach((d, i) => { d.visible = dt > 0 && shot.loc === 'air'; if (!d.visible) return; const a = hash(i) * TAU, sp = 2 + hash(i + 5) * 5, tt = Math.min(dt, 1.2);
      d.position.set(.2 + Math.cos(a) * sp * tt, Math.max(.05, 1 + 5 * tt - 9 * tt * tt), 3.6 + Math.sin(a) * sp * tt); d.rotation.set(tt * 9 * hash(i), tt * 7, 0); });
    if (t < ti) smoke.forEach((d, i) => { const tb = t - (i + 2) * .05; d.visible = tb > 0; if (!d.visible) return; const u = seg(tb, 0, ti), e = u * u;   // black trail while diving
      d.position.set(lerp(-3, .2, e) + Math.sin(i) * .15, lerp(13, 1.0, e) + .15, lerp(-8, 3.6, e)); d.scale.setScalar(.35 + (t - tb) * 1.4); d.material.color.set('#2b2b2b'); d.material.opacity = .55 * (1 - (t - tb)); });
    else smoke.forEach((d, i) => { d.material.color.set('#8a8a8a'); const u = ((dt - i * .15) % 4) / 4; d.visible = dt > 0 && shot.loc === 'air' && dt < 14; if (!d.visible) return; d.position.set(-.8 + Math.sin(i) * .4, .4 + u * 4, 1.0 + Math.cos(i) * .3); d.scale.setScalar(.5 + u * 2.5); d.material.opacity = .45 * (1 - u); });
    // Santos Dumont: lying -> sits up on "olhos"
    const awake = t >= at('h1', K.eyes), sit = eio(seg(t, at('v1', 'olhos'), at('v1', 'olhos') + 1.0));
    lie.torso.rotation.x = sit * Math.PI / 2 * .95; blink(lie, t, awake); lie.head.rotation.y = sit > .9 ? Math.sin(t * 1.8) * .5 : 0;
    if (awake && t < at('h1', K.eyes) + .5) lie.eyes.open.scale.set(1, 1.6, 1); else lie.eyes.open.scale.set(1, 1, 1);
    lie.g.visible = shot.nap === 'lie'; sd.g.visible = shot.nap === 'stand';
    sd.armL.rotation.set(0, 0, 0); sd.armR.rotation.set(0, 0, 0); sd.head.rotation.set(0, 0, 0); blink(sd, t, true);
    if (t >= at('v2', 0) && t < at('v3', 0)) sd.head.rotation.y = -.6;                                     // watches the jet
    if (t >= at('v3', 'pulso') - .2 && t < at('c1', 0)) { sd.armL.rotation.x = -1.5; sd.armL.rotation.z = -.6; sd.head.rotation.x = .35; }   // checks his watch
    if (t >= at('c1', 0) && t < at('v4', 0)) { const k = eo(seg(t, at('c1', 0), at('c1', 0) + .3)); sd.armR.rotation.x = -2.7 * k; sd.armR.rotation.z = .35 * k; }   // tips his hat
    if (t >= at('v4', 0) && t < at('p1', 0)) { sd.armL.rotation.z = .5; sd.armR.rotation.z = -.5; sd.armL.rotation.x = sd.armR.rotation.x = -.4; }   // "what?!"
    // the jet: taxi then takeoff during v2
    const tj = at('v2', 0), uj = seg(t, tj - 1, tj + 6);
    jet.position.set(-9, Math.max(0, (uj - .55) * 30), lerp(40, -60, uj)); jet.rotation.x = uj > .55 ? -.18 : 0; jet.visible = shot.loc === 'air';
    crowd.forEach((p, i) => { p.g.visible = shot.loc === 'air' && t >= at('v3', 0) && t < at('c1', 0); blink(p, t + i, true); p.armL.rotation.x = -1.5; p.armL.rotation.z = -.5; p.head.rotation.x = .3; });
  }
  ev(at('h1', 'em'), 'crash'); ev(at('h1', K.eyes), 'eyes'); ev(at('v2', 0) - .5, 'jet');
  return { root, R, update };
}
