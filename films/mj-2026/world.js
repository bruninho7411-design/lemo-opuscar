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

// ---------- the world: a concert stage with light-up floor tiles, beams, crowd with phones ----------
const BPM = 117, BEAT = 60 / BPM;
function screenTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 1024, 512); gr.addColorStop(0, '#2a0b3d'); gr.addColorStop(1, '#0b1c3d'); x.fillStyle = gr; x.fillRect(0, 0, 1024, 512);
  x.fillStyle = '#ffd23f'; x.font = 'bold 200px sans-serif'; x.textAlign = 'center'; x.fillText('2026', 512, 300);
  x.fillStyle = 'rgba(255,255,255,.8)'; x.font = 'bold 60px sans-serif'; x.fillText('★ KING OF POP ★', 512, 420);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function buildWorld(scene) {
  const root = grp(scene); const R = {};
  const stage = grp(root); R.stage = stage;
  box(12, .6, 9, '#1a1a1f', 0, -.3, 0, stage);
  const tiles = [];
  for (let i = -4; i <= 4; i++) for (let j = -3; j <= 3; j++) {
    const m = mat('#2a2a33', { e: '#ffffff', ei: 0, unique: true, r: .3 });
    const b = box(.96, .06, .96, m, i, .03, j, stage); b.ij = [i, j]; tiles.push(b);
  }
  // LED screen + truss + speakers
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshStandardMaterial({ map: screenTex(), emissive: '#ffffff', emissiveMap: screenTex(), emissiveIntensity: .6 }));
  scr.position.set(0, 3.2, -4.2); stage.add(scr); box(9.4, 4.9, .2, '#0d0d10', 0, 3.2, -4.35, stage);
  box(12, .25, .25, '#444', 0, 6.2, -2, stage); box(12, .25, .25, '#444', 0, 6.2, 2, stage); for (const x of [-6, 6]) box(.25, 6.3, .25, '#444', x, 3.1, 0, stage);
  for (const x of [-5.2, 5.2]) { box(1.2, 2.4, 1, '#111', x, 1.2, -3.2, stage); box(.7, .7, .05, '#2a2a2a', x, 1.7, -2.68, stage); }
  // beams: additive cones from the truss
  const beams = [];
  for (let k = 0; k < 6; k++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.0, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color: k % 2 ? '#ff5fd2' : '#5fd2ff', transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const g_ = grp(stage, -5 + k * 2, 6.1, k % 2 ? 2 : -2); cone.position.y = -3; g_.add(cone); beams.push(g_);
  }
  // crowd with phone lights (in front, z > 4.5)
  const crowd = [];
  const shirts = ['#e8553f', '#f2b134', '#3f8fd6', '#55b38a', '#b25bd0', '#ef7aa7', '#e9e3d2', '#2f2f36'];
  for (let i = 0; i < 24; i++) {
    const p = person({ skin: ['#f1c9a5', '#d7a57c', '#a9724e', '#7a4a2e'][i % 4], hair: ['#1d1410', '#5a3a22', '#c99a52', '#2b2b2b'][i % 4], long: i % 3 === 0, coat: shirts[i % 8], pants: '#2c3a55', shoes: '#eee', phone: i % 2 === 0, bigPhone: 1.4,
      par: stage, pos: [-5.5 + (i % 8) * 1.55 + (hash(i) - .5) * .4, -.6, 5.2 + Math.floor(i / 8) * 1.1], scale: .95 + hash(i + 3) * .12 });
    p.g.rotation.y = Math.PI; crowd.push(p);
  }
  // Michael: black fedora, black jacket with gold, white shirt, white socks, one white sequin glove
  const MJ = { skin: '#ead0b8', hair: '#151010', long: true, brow: '#151010', coat: '#141418', sleeve: '#141418', vest: '#f4f4f4', pants: '#141418', shoes: '#0b0b0b', collar: '#c9a23a', cuff: '#c9a23a', belt: '#c9a23a', hat: 'fedora' };
  const deco = p => {
    for (const L of [p.legL, p.legR]) box(.18, .1, .21, '#ffffff', 0, -.42, 0, L);                          // white socks
    box(.14, .14, .14, mat('#ffffff', { e: '#ffffff', ei: .6 }), 0, -.47, 0, p.armR);                          // the glove
    for (let i = 0; i < 4; i++) box(.02, .02, .02, mat('#ffffff', { e: '#ffffff', ei: 2 }), (hash(i) - .5) * .12, -.42 - hash(i + 1) * .1, .071, p.armR);
  };
  const lie = person({ ...MJ, par: stage, pos: [0, .2, .85] }); lie.g.rotation.x = -Math.PI / 2; deco(lie); R.lie = lie;
  const mj = person({ ...MJ, par: stage, pos: [0, .06, .6] }); deco(mj); R.mj = mj;

  function blink(p, t, open) { const b = (t * 1.3 + p.S * 7) % 4 < .12; p.eyes.open.visible = open && !b; p.eyes.closed.visible = !open || b; }
  function update(t, shot) {
    const beat = t / BEAT, pulse = Math.exp(-((beat % 1)) * 5);
    const awake = t >= at('h1', K.eyes), started = t >= at('v1', 'moonwalk') - .2;
    // tiles: dark until the eyes open, then a lit path under Michael + beat pulses
    const mx = R.mj.g.position.x, mz = R.mj.g.position.z;
    tiles.forEach(b => { const [i, j] = b.ij; let e = 0;
      if (awake) e = .25 * pulse * ((i + j + Math.floor(beat)) % 3 === 0 ? 1 : 0);
      if (started && Math.hypot(i - mx, j - mz) < .8) e = 1.1;
      b.material.emissiveIntensity = e; b.material.emissive.setHSL(((i * 7 + j * 3 + Math.floor(beat / 2)) % 6) / 6, .8, .6); });
    beams.forEach((b, k) => { b.rotation.z = Math.sin(t * .8 + k) * .5; b.rotation.x = Math.cos(t * .6 + k) * .3; b.visible = awake; });
    // lying -> stands up (cut) ; eyes open with the spotlight
    blink(lie, t, awake); if (awake && t < at('h1', K.eyes) + .5) lie.eyes.open.scale.set(1, 1.6, 1); else lie.eyes.open.scale.set(1, 1, 1);
    lie.g.visible = shot.nap === 'lie'; mj.g.visible = shot.nap === 'stand';
    // pose by time
    const tm = at('v1', 'moonwalk') - .2, tl = at('v4', 'inclinacao'), tlean = eo(seg(t, tl, tl + .5));
    mj.legL.rotation.x = mj.legR.rotation.x = 0; mj.armL.rotation.set(0, 0, 0); mj.armR.rotation.set(0, 0, 0); mj.torso.rotation.set(0, 0, 0); mj.g.rotation.set(0, 0, 0);
    mj.head.rotation.set(0, 0, 0); mj.hips.position.y = .62;
    if (t >= tm && t < at('v2', 0) + 1.5) {   // moonwalk: facing +x, gliding to -x, feet alternate flat/toe
      const u = t - tm, ph = (u * 2.2) % 1, side = Math.floor(u * 2.2) % 2;
      mj.g.rotation.y = Math.PI / 2; mj.g.position.set(1.8 - u * .9, .06, .6);
      (side ? mj.legL : mj.legR).rotation.x = -.25 * Math.sin(ph * Math.PI); mj.hips.position.y = .62 - .03 * Math.sin(ph * Math.PI);
      mj.armL.rotation.x = .3 * Math.sin(u * 4.4); mj.armR.rotation.x = -.3 * Math.sin(u * 4.4); mj.torso.rotation.x = .08;
    } else {
      mj.g.position.set(0, .06, .6);
      if (t >= tl && t < at('v5', 0)) { mj.g.rotation.x = .78 * tlean; mj.armL.rotation.z = .15; mj.armR.rotation.z = -.15; }   // the 45° lean, feet locked
      else if (t >= at('c1', 0) && t < at('v4', 0)) { mj.armR.rotation.x = -2.9; mj.armR.rotation.z = -.2; mj.head.rotation.z = .1; }  // hand up: like/follow
      else if (t >= at('v5', 0)) { const k = Math.sin(t / BEAT * Math.PI); mj.hips.position.y = .62 + .03 * Math.abs(k); mj.armL.rotation.x = -.6 * Math.max(0, k); mj.armR.rotation.x = -.6 * Math.max(0, -k); mj.head.rotation.y = .2 * k; mj.torso.rotation.z = .08 * k; }
      else { mj.armR.rotation.x = -.4 * pulse; mj.hips.position.y = .62 + .02 * pulse; }   // grooving on the beat
    }
    blink(mj, t, true);
    crowd.forEach((p, i) => { p.armR.rotation.x = -1.6 - .3 * Math.sin(t * 3 + i); p.armL.rotation.x = awake ? -2.6 * (i % 3 === 1 ? 1 : 0) : 0; p.hips.position.y = .62 + .05 * pulse * (i % 2); blink(p, t + i, true);
      if (p.phone) p.phone.screen.material.emissiveIntensity = 1.4; });
  }
  ev(at('h1', K.eyes), 'eyes'); ev(at('v1', 'moonwalk') - .2, 'glide'); ev(at('v4', 'inclinacao'), 'lean');
  return { root, R, update };
}
