// POV: você ficou milionário aos 23 — EP 4 · A guerra (Brick Toy, vertical 1080×1920)
import * as THREE from 'three';
import { makePost } from './post.js';
import { clamp, seg, eio, eo, ei, ss, lerp, hash, back } from '/core/lib.js';
import { COL, BRICK, PLATE, brick, plate, mesh, roundGeo, brickGeo, plastic } from './bricks.js';
import { makeFig, walkPose, SHOULDER, HEAD_H } from './figs.js';
import { buildWorld, signTile, canvasTex, laundromat, L1, L2, L3, FLAT, PHONE, STREET_Z } from './world.js';
import { q, build, EP } from './story.js';

const W = 1080, H = 1920, Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') ?? 1);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, .3, 3000);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, ao: Q.get('ao') !== '0', aoRadius: 3, aoThickness: 3, aoAmt: .85,
  msaa: +(Q.get('msaa') ?? 2), dofTaps: +(Q.get('taps') ?? 48), aoSamples: +(Q.get('aos') ?? 8) });   // software GL: lighter defaults
post.bloom.strength = .22; post.bloom.threshold = 1.1;
const VG = post.vig.uniforms; VG.amt.value = .38; VG.contrast.value = .24; VG.sat.value = 1.1;

const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {}, LIPS = (await J('voices/lips.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
for (const l of LINES) if (DURS[l.id] == null) DURS[l.id] = .6 + l.text.length * .065;
const { VO, T, DUR, SHOTS, STAMPS, CUES } = build(DURS);
const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

const world = await buildWorld(scene);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const you = makeFig('you'), caio = makeFig('caio'), owner = makeFig('arlindo');
scene.add(you.root, caio.root, owner.root);
const TBL = V(L1.x, BRICK * 2.4 + PLATE, -4);   // folding-table top in laundromat 1

// —— Ômega across the street (from EP 3), its price banner, a queue, a FECHADO sign ——
const omega = laundromat('Ω', { accent: '#5b2bd6', name: 'ÔMEGA LAVANDERIA' }); omega.g.position.set(L1.x, 0, STREET_Z + 11.5); omega.g.rotation.y = Math.PI; scene.add(omega.g);
const omegaWalk = new THREE.Mesh(brickGeo(60, 3, .7, { tile: true }), new THREE.MeshPhysicalMaterial({ color: '#a0a5a9', roughness: .6 })); omegaWalk.position.set(L1.x, 0, STREET_Z + 10); omegaWalk.receiveShadow = true; scene.add(omegaWalk);
const banner = signTile(14, 3, '#c91a09', (c, w, h) => {
  c.fillStyle = '#c91a09'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff';
  c.font = `700 ${h * .42}px Fredoka`; c.fillText('LAVAGEM R$ 9,90', w / 2, h * .36); c.fillStyle = '#f2cd37'; c.font = `700 ${h * .3}px Fredoka`; c.fillText('METADE DO PREÇO', w / 2, h * .76);
}, { emissive: .25 });
banner.position.set(0, BRICK * 9 + PLATE, -.6); omega.front.add(banner);
const fechado = signTile(6, 2.2, '#f4f4f1', (c, w, h) => { c.fillStyle = '#f4f4f1'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c91a09'; c.lineWidth = h * .08; c.strokeRect(h * .08, h * .08, w - h * .16, h - h * .16); c.fillStyle = '#c91a09'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${h * .5}px Fredoka`; c.fillText('FECHADO', w / 2, h * .54); });
fechado.position.set(0, 4.2, -.3); omega.front.add(fechado);
const crowd = ['cA', 'cB', 'cC', 'cD'].map(k => { const f = makeFig(k); scene.add(f.root); return f; });
const card = signTile(2.6, 1.5, '#f4f4f1', (c, w, h) => {
  c.fillStyle = '#f4f4f1'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b1f27'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `700 ${h * .42}px Fredoka`; c.fillText('Ω', w * .2, h * .5); c.font = `700 ${h * .2}px Fredoka`; c.fillText('GRUPO', w * .62, h * .36); c.fillText('ÔMEGA', w * .62, h * .62);
}, { px: 160 });
card.rotation.x = -1.25; card.position.set(L1.x + 1.8, TBL.y + .05, -3.2); scene.add(card);

// —— two stacks of money on the table: yours and Ômega's ——
const stackY = [], stackO = [];
for (let i = 0; i < 3; i++) { const p = plate(2, 2, '#f2cd37', { tile: i === 2 }); p.position.set(-2.2, TBL.y + i * PLATE, -4); scene.add(p); stackY.push(p); }
for (let i = 0; i < 20; i++) { const p = plate(2, 2, i % 4 === 3 ? '#5b2bd6' : '#f2cd37', { tile: i === 19 }); p.position.set(2.2, TBL.y + i * PLATE, -4); scene.add(p); stackO.push(p); }
const labMk = (txt, bg) => signTile(2.6, .9, bg, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 ${h * .55}px Fredoka`; c.fillText(txt, w / 2, h * .55); });
const labY = labMk('VOCÊ', '#555b6a'), labO = labMk('ÔMEGA', '#5b2bd6');
labY.position.set(-2.2, TBL.y, -2.7); labO.position.set(2.2, TBL.y, -2.7); scene.add(labY, labO);

// —— the delivery bike: two wheels, a frame, a box with a laundry bag ——
const bike = new THREE.Group(); scene.add(bike);
const wheels = [];
for (const x of [-2.2, 2.2]) { const w = new THREE.Group(); w.position.set(x, 1.1, 0); bike.add(w); const tyre = new THREE.Mesh(new THREE.TorusGeometry(.85, .28, 12, 28), new THREE.MeshStandardMaterial({ color: '#141414', roughness: .8 })); w.add(tyre); const hub = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .4, 16), plastic(COL.lgray)); hub.rotation.x = Math.PI / 2; w.add(hub); wheels.push(w); }
{ const fr = brick(4, 1, '#c91a09', { h: .5, tile: true }); fr.position.set(0, 1.4, 0); bike.add(fr);
  const post_ = brick(1, 1, '#c91a09', { h: 1.6, tile: true }); post_.position.set(1.9, 1.4, 0); bike.add(post_);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 2.2, 10), plastic('#333')); bar.rotation.x = Math.PI / 2; bar.position.set(1.9, 3.1, 0); bike.add(bar);
  const seat = plate(2, 1, '#1b1f27', { tile: true }); seat.position.set(-.6, 1.9, 0); bike.add(seat);
  const box = brick(2, 2, '#0055bf', { h: BRICK * 1.5, tile: true }); box.position.set(-2.4, 1.9, 0); bike.add(box);
  const bag = new THREE.Mesh(new THREE.SphereGeometry(.9, 16, 12), plastic('#f4f4f1')); bag.scale.set(1, .8, 1); bag.position.set(-2.4, 4.1, 0); bike.add(bag); }
bike.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });

const tileMk = (w, h, bg, fg, txt, sub) => signTile(w, h, bg, (c, cw, ch) => {
  c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = fg;
  const fit = px => { c.font = `700 ${px}px Fredoka`; return Math.min(px, px * cw * .86 / c.measureText(txt).width); };   // long words shrink to fit the tile
  if (sub) { c.font = `700 ${fit(ch * .46)}px Fredoka`; c.fillText(txt, cw / 2, ch * .4); c.font = `600 ${ch * .22}px Fredoka`; c.fillText(sub, cw / 2, ch * .8); }
  else { c.font = `700 ${ch * .56}px Fredoka`; c.fillText(txt, cw / 2, ch * .54); }
});
// the new plan, snapped onto laundromat 1's back wall; the red loss tile on the roof billboard spot
const TILES = [
  { m: tileMk(5, 2.4, '#f4f4f1', '#1b2a34', 'COLETA', 'EM CASA'), p: V(-5.4, 8.0, -10.7), t: () => T.p1, u: () => T.bike, host: 'L1' },
  { m: tileMk(5, 2.4, '#36aebf', '#ffffff', 'PRONTO', 'EM 24H'), p: V(0, 8.0, -10.7), t: () => T.p2, u: () => T.bike, host: 'L1' },
  { m: tileMk(5, 2.4, '#237841', '#ffffff', 'ENTREGUE', 'DOBRADA'), p: V(5.4, 8.0, -10.7), t: () => T.p3, u: () => T.bike, host: 'L1' },
  { m: tileMk(10.6, 1.6, '#f2cd37', '#1b2a34', '+R$ 15 POR ENTREGA'), p: V(0, 6.2, -10.6), t: () => T.p4, u: () => T.bike, host: 'L1', gain: 1 },
  { m: tileMk(8, 2.2, '#c91a09', '#ffffff', '-50% CLIENTES'), p: V(0, 10 * BRICK + PLATE, -2), t: () => T.minus, u: () => T.banner, host: 'L1', loss: 1 },
];
TILES.forEach(o => { world.L[0].g.add(o.m); o.m.visible = false; });
function tiles(t) {
  for (const o of TILES) {
    const t0 = o.t(), u = (t - t0) / .28;
    o.m.visible = t >= t0 - .28 && t < o.u();
    if (!o.m.visible) continue;
    const k = clamp(u + 1), y = u < 0 ? lerp(6, 0, ei(k)) : -.35 * Math.exp(-u * 4) * Math.cos(u * 8) * (u < 1.2 ? 1 : 0);
    o.m.position.copy(o.p).add(V(0, y, 0)); o.m.rotation.set(0, 0, u < 0 ? (1 - k) * .4 : 0);
  }
}


// —— lip sync + faces ——
function talk(who, t) {
  const tq = q(t);
  for (const [id, t0] of Object.entries(VO)) {
    if (LINE[id].who !== who) continue;
    if (tq >= t0 && tq < t0 + DURS[id]) { const k = Math.floor((tq - t0) * 24), lp = LIPS[id]; const o = lp ? lp.o[k] ?? 0 : .5, b = lp ? lp.b[k] ?? .5 : .5; return { o, w: .8 + .4 * b - .2 * o, talking: true }; }
  }
  return { o: 0, w: 1, talking: false };
}
const blink = (t, seed) => { const k = Math.floor(t * 12), c = Math.floor(k / 40); return k % 40 < 2 && hash(c * 3.7 + seed) > .2; };
const face = (who, t, o = {}) => { const m = talk(who, t); return { blink: blink(t, who.charCodeAt(0)), mouth: { o: m.o * 1.1, w: m.w, sm: o.sm ?? 0 }, look: o.look || [0, 0], lid: o.lid ?? 0, brow: o.brow ?? 0, wide: o.wide ?? 1 }; };

// —— performance per shot ——
const OFF = { x: 0, y: -100, z: 0, vis: false };
const Y = PLATE;
const INSIDE = ['cuCaio', 'stacks', 'cuYou', 'plan', 'follow', 'card'];
function act(t, name) {
  const tq = q(t), P = { you: OFF, caio: OFF, owner: OFF, crowd: [OFF, OFF, OFF, OFF] };
  const nodTalk = (who) => talk(who, t).talking ? (talk(who, t).o - .3) * .08 : 0;
  if (name === 'duel' || name === 'banner') {
    P.crowd = [0, 1, 2, 3].map(i => ({ x: L1.x + 3.4 + i * 2.2, y: .7, z: STREET_Z + 10.2, ry: -Math.PI / 2, nod: -.05, armL: [-.1, .06], armR: [-.1, .06], face: face('x', t + i * .7, { look: [.3, 0] }) }));
    // you alone at your door, arms crossed-ish, looking across
    P.you = name === 'duel' ? { x: L1.x + 4.6, y: .7, z: 8.6, ry: .1,   // the opening standoff: out in the street, back to the camera, facing the queue
      nod: .05, armL: [-.5, .3], armR: [-.5, -.3], face: face('y', t, { look: [0, -.1], lid: .35, sm: -.4, brow: -.4 }) } : { x: L1.x + 1.6, y: .7, z: 2.0, ry: .15, nod: .05, armL: [-.5, .3], armR: [-.5, -.3], face: face('y', t, { look: [0, -.1], lid: .35, sm: -.4, brow: -.4 }) };
  } else if (INSIDE.includes(name)) {
    const side = name === 'plan';
    if (name !== 'card' && name !== 'stacks') {
      P.you = { x: L1.x + (side ? 5.4 : 2.6), y: Y, z: name === 'follow' ? -1.2 : side ? -1.2 : -.6, ry: name === 'follow' ? .1 : side ? Math.PI + .3 : Math.PI - .35,
        nod: name === 'cuYou' ? .05 : 0, armL: [-.1, .08], armR: [-.1, .08],
        face: face('y', t, { look: name === 'follow' ? [0, 0] : [-.3, .2], lid: name === 'cuYou' ? .3 : name === 'follow' ? .15 : 0, sm: name === 'follow' || name === 'cuYou' ? .45 : 0, brow: name === 'cuYou' ? -.5 : 0 }) };
      const shout = name === 'cuCaio' ? 1 : 0;
      P.caio = { x: L1.x + (side ? -5.4 : -1.2), y: Y, z: side ? -1.2 : -.4, ry: side ? Math.PI - .3 : Math.PI + .3, nod: nodTalk('c'), armL: shout ? [-1.6, .5 + Math.sin(tq * 8) * .2] : [-.1, .1], armR: shout ? [-1.6, -.5] : [-.1, .1],
        face: face('c', t, { look: [.2, .3], wide: 1.15, brow: shout ? -.6 : 1, sm: shout ? -.3 : 0 }) };
    }
  } else if (name === 'bike') {
    const u = seg(t, T.bike - .2, T.phone + .2), x = lerp(-34, 30, u);
    bikeX = x;
    P.caio = { x: x - .4, y: .3 + 1.9 - (PLATE + 2 * BRICK) + 1.4, z: STREET_Z + .5, ry: Math.PI / 2, sit: .55, legs: [Math.sin(tq * 12) * .5 - .6, -Math.sin(tq * 12) * .5 - .6], armL: [-1.5, .1], armR: [-1.5, -.1], nod: -.1,
      face: face('c', t, { look: [0, -.1], wide: 1.1, sm: .8 }) };
  } else if (name === 'phone') {
    const b = world.phone, rel = V(-3.6, 0, 12).applyAxisAngle(V(0, 1, 0), b.rotation.y).add(b.position);
    P.you = { x: rel.x, y: 0, z: rel.z, ry: b.rotation.y + .55, nod: -.42, turn: -.35, armL: [-.1, .12], armR: [-1.2, .25], face: face('y', t, { look: [.4, -.6], sm: .6, lid: .1 }) };
  } else if (name === 'silh') {
    P.owner = { x: L1.x + .4, y: .7, z: STREET_Z + 9.6, ry: Math.PI, armL: [-.05, .06], armR: [-.05, .06], face: { look: [0, 0], mouth: { o: 0 } } };
  }
  return P;
}
let bikeX = -40;


// —— camera per shot ——
const headW = fig => { fig.root.updateMatrixWorld(true); const h = fig.head.getWorldPosition(V(0, 0, 0)).add(V(0, HEAD_H / 2, 0)); h.isHead = true; return h; };
function cam(t, st) {
  const [t0, t1, name] = st, u = seg(t, t0, t1);
  let pos, look, fov = 40, focus, aper = 600, span = 28;
  const ph = world.phone, PR = (x, y, z) => V(x, y, z).applyAxisAngle(V(0, 1, 0), ph.rotation.y).add(ph.position);
  switch (name) {
    case 'duel': {   // a vertical stack: you alone at your door (bottom), the empty street, Ômega's queue across it (top)
      pos = V(L1.x + 5, 36, -9).lerp(V(L1.x + 5.4, 31, -5.5), eio(u)); look = V(L1.x + 5.5, 0, STREET_Z + 7.4).lerp(V(L1.x + 5.6, 0, STREET_Z + 7.8), eio(u)); fov = 44;
      focus = V(L1.x + 6, 2.5, STREET_Z + 10.2); aper = 300; span = 40; break;
    }
    case 'banner': { const B = V(L1.x, BRICK * 9 + PLATE + 1.5, STREET_Z + 12); pos = B.clone().add(V(-1.5, -6.4, -16)).lerp(B.clone().add(V(-1.2, -5.8, -14)), eio(u)); look = B.clone().add(V(0, -1.6, 0)); fov = 44; focus = B; aper = 420; span = 24; break; }
    case 'cuCaio': { const h = headW(caio); pos = h.clone().add(V(1.6, -.8, -7.9)).lerp(h.clone().add(V(1.4, -.8, -7.2)), u); look = h.clone().add(V(0, -.6, 0)); fov = 46; focus = h; aper = 650; span = 18; break; }
    case 'stacks': { const C = TBL.clone().add(V(0, 2.4, 0)); pos = C.clone().add(V(.4, 4.0, 20)).lerp(C.clone().add(V(.3, 4.6, 17)), eio(u)); look = C.clone().add(V(0, .7, 0)); fov = 40; focus = C.clone().add(V(0, 0, 1)); aper = 420; span = 18; break; }
    case 'cuYou': { const h = headW(you); pos = h.clone().add(V(1.4, .1, -7.8)).lerp(h.clone().add(V(1.1, 0, -6.6)), eio(u)); look = h.clone().add(V(0, -.8, 0)); fov = 40; focus = h; aper = 720; span = 16; break; }
    case 'plan': {   // the vertical frame is narrower than the three tiles: follow each one as it is named, then pull back on +R$ 15
      const TW = i => TILES[i].m.parent.localToWorld(TILES[i].p.clone()), [A, B, C, D] = [0, 1, 2, 3].map(TW);
      const M0 = B.clone().add(V(0, -1.6, 0)), M = B.clone().lerp(D, .45);
      const k0 = eio(seg(t, T.plan, T.p1 - .1)), k1 = eio(seg(t, T.p2 - .45, T.p2 + .1)), k2 = eio(seg(t, T.p3 - .45, T.p3 + .1)), k3 = eio(seg(t, T.p3 + .7, T.p4 + .1));
      const L = M0.clone().lerp(A, k0).lerp(B, k1).lerp(C, k2).lerp(M, k3);
      const dist = lerp(lerp(28, 20, k0), 40, k3) - u * .8, ox = lerp(lerp(lerp(lerp(1.4, 3, k0), 1, k1), -3, k2), .6, k3);   // high and off to the side, over the heads in front of the wall
      pos = L.clone().add(V(ox, lerp(lerp(1, 4.5, k0), 2.5, k3), dist)); look = L; fov = 50;
      focus = L.clone(); aper = 340; span = 24; break;
    }
    case 'bike': { pos = V(bikeX + 4, 5.6, STREET_Z + 10.8); look = V(bikeX + 2, 5.6, STREET_Z + .5); fov = 58; focus = V(bikeX, 4, STREET_Z + .5); aper = 420; span = 30; break; }
    case 'phone': pos = PR(-.5, 2.2, 44).lerp(PR(-1, 2.6, 38), eio(u)); look = PR(-1.4, 9.4, 3); fov = 42; focus = PR(0, 12, 3); aper = 420; span = 34; break;
    case 'follow': { const h = headW(you); pos = h.clone().add(V(.8, -1.2, 16)).lerp(h.clone().add(V(.6, -1, 14)), u); look = h.clone().add(V(0, -3.2, 0)); fov = 40; focus = h; aper = 650; span = 18; break; }
    case 'closed': pos = V(L1.x - 14, 4.4, 1.8).lerp(V(L1.x - 11.5, 5.4, 1.4), eio(u)); look = V(L1.x + 1.5, lerp(7.4, 6.4, eio(u)), STREET_Z + 11); fov = 50; focus = V(L1.x, 5, STREET_Z + 11.5); aper = 380; span = 40; break;
    case 'card': { const C = card.position.clone(); pos = C.clone().add(V(2.2, 3.4, 6.8)).lerp(C.clone().add(V(.2, 1.7, 3.6)), eio(u)); look = C.clone().add(V(-.2, .2, 0)).lerp(C.clone().add(V(-.6, .1, 0)), eio(u)); fov = 38; focus = C.clone().add(V(-.5, 0, 0)); aper = 700; span = 14; break; }   // "quem era o dono": a slow orbit and push onto the Ω
    case 'silh': { const h = headW(owner); pos = h.clone().add(V(.4, -3.6, -17)).lerp(h.clone().add(V(.3, -2.8, -12)), eio(u)); look = h.clone().add(V(0, -1.4, 0)); fov = 40; focus = h; aper = 520; span = 24; break; }   // whole head in frame: the hair is the hint
    default: { const c = V(L1.x, 5, STREET_Z + 2); pos = V(L1.x + 30, 12, STREET_Z + 2).lerp(V(L1.x + 40, 30, STREET_Z + 2), eio(u)); look = c; fov = 44; focus = c; aper = 300; span = 50; }
  }
  if (focus && focus.isHead) focus = focus.clone().add(pos.clone().sub(focus).normalize());   // the printed face is 1 stud in front of the centre
  camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look);
  world.aimKey(focus || look, span, world.isNight ? [50, 120, 40] : [-70, 100, 60]);
  post.dof.focus = camera.position.distanceTo(focus || look); post.dof.aper = aper; post.dof.maxCoc = 14;
}

// —— the phone's screen: the orders app ——
const fmtN = n => n.toLocaleString('pt-BR');
function drawScreen(g, w, h, t) {
  const n = Math.round(lerp(0, 800, eo(seg(t, T.phone + .3, T.gain))));
  g.fillStyle = '#0d0f14'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.font = '600 26px Fredoka'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('18:40', 34, 34); g.textAlign = 'right'; g.fillText('5G ▮▮▮', w - 34, 34);
  g.fillStyle = '#0055bf'; g.fillRect(0, 70, w, 150); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '700 46px Fredoka'; g.fillText('LAVANDERIA 1', w / 2, 128); g.font = '600 26px Fredoka'; g.fillText('coleta e entrega', w / 2, 180);
  g.fillStyle = '#f4f4f1'; g.font = '600 30px Fredoka'; g.fillText('PEDIDOS NO MÊS', w / 2, 290);
  g.fillStyle = '#f2cd37'; g.font = '700 150px Fredoka'; g.fillText(fmtN(n), w / 2, 420);
  const gain = t >= T.gain; g.fillStyle = gain ? '#2f9e4f' : '#2b3040'; g.beginPath(); g.roundRect(40, 520, w - 80, 110, 55); g.fill();
  g.fillStyle = '#fff'; g.font = '700 48px Fredoka'; g.fillText(gain ? '+R$ 12 MIL / MÊS' : 'R$ 15 por entrega', w / 2, 577);
  for (let i = 0; i < 5; i++) { const y = 690 + i * 86; g.fillStyle = '#1b2030'; g.beginPath(); g.roundRect(40, y, w - 80, 70, 16); g.fill(); g.fillStyle = '#9fd6ff'; g.textAlign = 'left'; g.font = '600 26px Fredoka'; g.fillText(`#${fmtN(Math.max(1, n - i))}  coleta · apto ${101 + ((n - i) * 37) % 900}`, 70, y + 36); g.fillStyle = '#2f9e4f'; g.textAlign = 'right'; g.fillText('✓', w - 70, y + 36); g.textAlign = 'center'; }
}
let lastScr = '';
function screen(t) { const key = Math.round(lerp(0, 800, eo(seg(t, T.phone + .3, T.gain)))) + (t >= T.gain ? 'g' : ''); if (key !== lastScr) { const { g, c } = world.SCR; g.setTransform(1, 0, 0, 1, 0, 0); drawScreen(g, c.width, c.height, t); world.SCR.t.needsUpdate = true; lastScr = key; } }


// —— 2D layer: subtitles, title, stamps, follow, end card ——
const ov = document.getElementById('ov'), g = ov.getContext('2d');
const WHO = { n: null, y: ['VOCÊ', '#8a93a6'], c: ['CAIO', '#e3a72a'], s: ['???', '#f2cd37'] };
function wrap(str, maxW, font) { g.font = font; const words = str.split(' '), out = []; let cur = ''; for (const w of words) { const c = cur ? cur + ' ' + w : w; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = w; } else cur = c; } if (cur) out.push(cur); return out; }
function brickIcon(x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.roundRect(0, 8, 58, 26, 5); g.fill();
  g.beginPath(); g.roundRect(7, 0, 18, 10, 3); g.roundRect(33, 0, 18, 10, 3); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 28, 58, 6); g.restore();
}
const CUTS = SHOTS.map(s => s[0]).filter(x => x > 0);
const SUBS = Object.entries(VO).map(([id, t0]) => {
  const d = DURS[id]; let t1 = t0 + Math.max(d + .6, 1.8);
  const nxt = Object.values(VO).filter(v => v > t0 + .05).sort((a, b) => a - b)[0];
  if (nxt != null && t1 > nxt - .03) t1 = Math.max(nxt - .03, t0 + d + .1);
  return { id, t0, t1: +t1.toFixed(3), who: LINE[id].who, text: LINE[id].sub, hi: LINE[id].hi || [] };
});
function hiMask(text, hi) {   // per word: true when it belongs to one of the highlighted phrases
  const w = text.split(' '), m = w.map(() => false);
  for (const p of hi) { const pw = p.split(' '); for (let i = 0; i + pw.length <= w.length; i++) if (pw.every((x, k) => w[i + k] === x)) pw.forEach((_, k) => m[i + k] = true); }
  return m;
}
function subs(t) {
  const s = SUBS.find(s => t >= s.t0 && t < s.t1); if (!s) return;
  const font = '600 54px Fredoka', lines = wrap(s.text, 780, font), lh = 66, ph = lines.length * lh + 40, y = 1560 - ph;
  const pw = Math.max(...lines.map(l => g.measureText(l).width)) + 150, x = (W - pw) / 2, pop = back(seg(t, s.t0, s.t0 + .14), 2);
  g.save(); g.translate(W / 2, y + ph / 2); g.scale(lerp(.92, 1, pop), lerp(.92, 1, pop)); g.translate(-W / 2, -(y + ph / 2));
  g.fillStyle = OVL ? '#16181e' : 'rgba(16,18,24,.72)'; g.beginPath(); g.roundRect(x - (OVL ? 2 : 0), y - (OVL ? 2 : 0), pw + (OVL ? 4 : 0), ph + (OVL ? 4 : 0), 37); g.fill();
  const who = WHO[s.who];
  brickIcon(x + 32, y + ph / 2 - 17, .9, who ? who[1] : '#ffffff');
  if (who) { g.font = '700 26px Fredoka'; const tw = g.measureText(who[0]).width + 40; g.fillStyle = who[1]; g.beginPath(); g.roundRect(x + 30, y - 22, tw, 40, 20); g.fill(); g.fillStyle = '#12141a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(who[0], x + 30 + tw / 2, y - 1); }
  g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = font;
  const mask = hiMask(s.text, s.hi); let wi = 0;
  lines.forEach((l, k) => { let cx = x + 112; for (const w of l.split(' ')) { g.fillStyle = mask[wi++] ? '#f2cd37' : '#fff'; g.fillText(w, cx, y + 20 + lh / 2 + k * lh + 2); cx += g.measureText(w + ' ').width; } });
  g.restore();
}
function seriesBadge(t) {   // top: series + episode
  if (t >= T.end) return;
  const big = t < T.banner;
  if (!big) { g.save(); g.fillStyle = 'rgba(16,18,24,.66)'; g.beginPath(); g.roundRect(W - 250, 56, 196, 56, 28); g.fill(); g.fillStyle = '#c91a09'; g.beginPath(); g.roundRect(W - 246, 60, 86, 48, 24); g.fill();
    g.fillStyle = '#fff'; g.font = '700 28px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`EP ${EP.n}`, W - 203, 85); g.font = '600 24px Fredoka'; g.fillText('/ 30', W - 100, 85); g.restore(); return; }
  const s = back(seg(q(t), 0, .3), 2), a = 1 - ss(seg(t, T.banner - .3, T.banner));
  g.save(); g.globalAlpha = a; g.translate(W / 2, 380); g.scale(s, s);
  g.fillStyle = 'rgba(16,18,24,.78)'; g.beginPath(); g.roundRect(-430, -96, 860, 192, 40); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = '600 40px Fredoka'; g.fillText('POV: VOCÊ FICOU MILIONÁRIO AOS 23', 0, -36);
  g.fillStyle = '#f2cd37'; g.font = '700 74px Fredoka'; g.fillText(EP.title, 0, 34);
  g.fillStyle = '#c91a09'; g.beginPath(); g.roundRect(300, -130, 150, 60, 18); g.fill(); g.fillStyle = '#fff'; g.font = '700 38px Fredoka'; g.fillText(`EP ${EP.n}`, 375, -98);
  g.restore();
}

function stamps(t) {
  for (const [a, b, txt] of STAMPS) {
    if (t < a || t >= b) continue;
    const s = back(seg(q(t), a, a + .25), 2.4), big = txt.length > 6;
    g.save(); g.translate(60, 150); g.scale(s, s);
    g.font = `700 ${big ? 50 : 64}px Fredoka`; const tw = g.measureText(txt).width + 110;
    g.fillStyle = '#f2cd37'; g.beginPath(); g.roundRect(0, 0, tw, big ? 82 : 96, 18); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, (big ? 82 : 96) - 10, tw, 10);
    g.fillStyle = '#1b2a34'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(txt, 82, (big ? 82 : 96) / 2 + 2);
    g.beginPath(); g.arc(44, (big ? 82 : 96) / 2, 18, 0, 7); g.lineWidth = 6; g.strokeStyle = '#1b2a34'; g.stroke(); g.beginPath(); g.moveTo(44, (big ? 82 : 96) / 2); g.lineTo(44, (big ? 82 : 96) / 2 - 11); g.moveTo(44, (big ? 82 : 96) / 2); g.lineTo(53, (big ? 82 : 96) / 2 + 4); g.stroke();
    g.restore();
  }
}
function followTile(t, x, y, t0, tc) {
  const s = back(seg(q(t), t0, t0 + .3), 2); if (s <= 0) return;
  const done = t >= tc;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#f4f4f1'; g.beginPath(); g.roundRect(-400, -70, 800, 140, 26); g.fill(); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-400, 56, 800, 14);
  for (const sx of [-300, -150, 0, 150, 300]) { g.fillStyle = '#e4e4de'; g.beginPath(); g.roundRect(sx - 40, -92, 80, 26, 8); g.fill(); }
  brickIcon(-370, -20, .8, '#f2cd37');
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#1b2a34'; g.font = '700 40px Fredoka'; g.fillText('MILIONÁRIO AOS 23', -300, -16); g.font = '500 28px Fredoka'; g.fillStyle = '#6c6e68'; g.fillText('série · 30 episódios', -300, 26);
  const pb = done ? back(seg(t, tc, tc + .2), 3) : 1;
  g.save(); g.translate(250, 0); g.scale(lerp(.85, 1, pb), lerp(.85, 1, pb));
  g.fillStyle = done ? '#6c6e68' : '#c91a09'; g.beginPath(); g.roundRect(-125, -44, 250, 88, 22); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '700 36px Fredoka'; g.fillText(done ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3); g.restore();
  if (t > tc - .7 && t < tc + .6) {   // a brick hand presses the button
    const k = eo(seg(t, tc - .7, tc - .1)), hx = lerp(560, 280, k), hy = lerp(260, 30, k) + (Math.abs(t - tc) < .1 ? 10 : 0);
    g.fillStyle = '#f3c9a1'; g.beginPath(); g.arc(hx, hy, 38, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.arc(hx + 8, hy + 8, 30, 0, 7); g.fill();
    g.fillStyle = '#555b6a'; g.beginPath(); g.roundRect(hx - 30, hy + 28, 60, 140, 20); g.fill();
  }
  g.restore();
}
function endCard(t) {
  const a = ss(seg(t, T.end, T.end + .4)), last = Object.keys(VO).at(-1);
  g.fillStyle = `rgba(10,12,16,${.55 * a})`; g.fillRect(0, 0, W, H);
  const s1 = back(seg(q(t), T.end + .1, T.end + .4), 2.2), s2 = back(seg(q(t), T.end + .5, T.end + .8), 2.2);
  g.save(); g.translate(W / 2, 640); g.scale(s1, s1); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#c91a09'; g.beginPath(); g.roundRect(-300, -150, 600, 300, 34); g.fill();
  g.fillStyle = '#e0301c'; for (const x of [-200, -70, 70, 200]) { g.beginPath(); g.roundRect(x - 50, -190, 100, 50, 14); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-300, 110, 600, 40);
  g.fillStyle = '#fff'; g.font = '700 200px Fredoka'; g.fillText(EP.next, 0, 10); g.restore();
  g.save(); g.translate(W / 2, 900); g.scale(s2, s2); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#f2cd37'; g.beginPath(); g.roundRect(-330, -60, 660, 120, 24); g.fill(); g.fillStyle = '#1b2a34'; g.font = '700 76px Fredoka'; g.fillText(EP.nextTitle, 0, 4); g.restore();
  followTile(t, W / 2, 1180, T.end + .9, VO[last] + DURS[last] * .6);
}
const CAPA = Q.get('capa') === '1', CLEAN = Q.get('clean') === '1';   // clean: no 2D layer (source stills for image-to-video)
// ovl: the retention edit's 2D pass, composited over the first render (ovl_render.mjs): subtitles with highlighted words,
// the hook question, the comment question, and the full 2D layer over any AI insert (INS) that replaces part of a shot
const OVL = Q.get('ovl') === '1', INS = [];
function askTile(t, y, t0, l1, l2) {
  const s = back(seg(q(t), t0, t0 + .3), 2.2); if (s <= 0) return;
  g.save(); g.translate(W / 2, y); g.scale(s, s); g.textAlign = 'center'; g.textBaseline = 'middle';
  const h = l2 ? 170 : 104; g.font = '700 60px Fredoka'; const tw = Math.max(g.measureText(l1).width, l2 ? g.measureText(l2).width : 0) + 90;
  g.fillStyle = '#f2cd37'; g.beginPath(); g.roundRect(-tw / 2, -h / 2, tw, h, 26); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-tw / 2 + 12, h / 2 - 10, tw - 24, 10);
  g.fillStyle = '#1b2a34'; if (l2) { g.fillText(l1, 0, -34); g.fillText(l2, 0, 38); } else g.fillText(l1, 0, 3);
  g.restore();
}
function overlay(t, name) {
  g.clearRect(0, 0, W, H); if (CLEAN) return;
  const ins = INS.some(([a, b]) => t >= a && t < b);
  if (!OVL || ins) { seriesBadge(t); stamps(t); }
  if (!OVL && name === 'follow') followTile(t, W / 2, 1150, T.follow + .3, T.click);
  if (!OVL && name === 'end') endCard(t);
  if (OVL && t < T.banner) { g.save(); g.globalAlpha = 1 - ss(seg(t, T.banner - .3, T.banner)); askTile(t, 1290, .9, 'VOCÊ BAIXARIA O PREÇO?'); g.restore(); }
  if (OVL && name === 'end') askTile(t, 290, T.end + 1.2, 'QUEM VOCÊ ACHA', 'QUE É O DONO?');
  if (OVL && t >= T.p4 - .1 && t < T.bike) askTile(t, 600, T.p4, '+R$ 15 POR ENTREGA');   // the 3D tile sits behind the machines in the vertical frame
  if (!CAPA) subs(t);
}

// —— render ——
const darkened = new Map();
function silhouette(on) {   // the owner as a black shape against the lit shop (his white hair stays: a hint)
  owner.root.traverse(m => {
    if (!m.isMesh || m.material.color.getHexString() === 'f2f0ea' && !darkened.has(m)) return;
    const M = m.material;
    if (!darkened.has(m)) darkened.set(m, { c: M.color.clone(), r: M.roughness, e: M.envMapIntensity ?? 1, cc: M.clearcoat ?? 0, sp: M.specularIntensity ?? 1 });
    const o = darkened.get(m);   // matte, no clear coat: the lights leave no highlights, a true silhouette against the lit shop
    M.color.copy(on ? new THREE.Color('#050507') : o.c); M.roughness = on ? 1 : o.r; M.envMapIntensity = on ? 0 : o.e;
    if ('clearcoat' in M) M.clearcoat = on ? 0 : o.cc; if ('specularIntensity' in M) M.specularIntensity = on ? 0 : o.sp;
  });
}
function render(t0) {
  if (OVL) return overlay(t0, shotAt(t0)[2]);
  const t = q(t0), st = shotAt(t0), name = st[2], night = st[3] === 'night';
  world.isNight = night; world.mood(st[3]);
  const P = act(t, name);
  you.pose(P.you); caio.pose(P.caio); owner.pose(P.owner); crowd.forEach((f, i) => f.pose(P.crowd[i]));
  silhouette(name === 'silh'); if (name === 'silh') world.softRim.intensity = 0;   // no front light on the owner
  const inside = INSIDE.includes(name);
  world.L[0].front.visible = !inside; world.bill.visible = !inside;
  omega.g.visible = omegaWalk.visible = !inside;
  const shut = t0 >= T.closed;
  banner.visible = !shut; fechado.visible = t0 >= T.fechado - .28;
  if (fechado.visible) { const u = (t0 - T.fechado) / .28, k = clamp(u + 1); fechado.position.y = 4.2 + (u < 0 ? lerp(5, 0, ei(k)) : -.25 * Math.exp(-u * 4) * Math.cos(u * 8) * (u < 1.2 ? 1 : 0)); }
  omega.inside.intensity = night ? 160 : 0;
  world.L.forEach(l => l.drums.forEach((d, k) => d.rotation.z = -(t * (3 + (k % 3)) + k) * (t0 < T.plan ? .05 : .4)));
  omega.drums.forEach((d, k) => d.rotation.z = -(t * (3 + (k % 3)) + k) * (shut ? 0 : .6));
  const g2 = seg(t0, T.grow, T.grow + 1.6);
  const st_ = name === 'stacks'; stackO.forEach((p, i) => p.visible = st_ && i < 3 + Math.floor(g2 * 17)); [...stackY, labY, labO].forEach(p => p.visible = st_);
  bike.visible = name === 'bike'; bike.position.set(bikeX, .3, STREET_Z + .5); bike.rotation.y = 0; wheels.forEach(w => w.rotation.z = -bikeX / .85);
  card.visible = inside;
  world.CAR.g.visible = false;
  tiles(t0);
  if (name === 'phone') screen(t0);
  cam(t0, st);
  post.composer.render();
  overlay(t0, name);
}


// —— sound events (mix.py) ——
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of Object.entries(VO)) add('vo', t0, { id, who: LINE[id].who, d: DURS[id] });
  for (const c of CUES) add('cue', c.t0, { id: c.id, t1: +c.t1.toFixed(3) });
  for (const s of SUBS) add('sub', s.t0, { t1: s.t1, text: s.text });
  for (const [a, b, name, mood] of SHOTS) add('amb', a, { w: mood === 'night' ? 'night' : INSIDE.includes(name) ? 'laund' : 'street', d: +(b - a).toFixed(3) });
  add('title', .05);
  for (const o of TILES) { add('whoosh', o.t() - .3, { v: .35 }); add('click', o.t(), { v: o.gain ? .9 : 1, p: o.gain ? 1.15 : o.loss ? .7 : 1 }); if (o.gain) add('ding', o.t() + .02, { v: .55 }); if (o.loss) add('hit', o.t(), { v: .5 }); }
  add('cut', T.cuCaio);
  for (let k = 0; k < 17; k++) add('click', T.grow + k * 1.6 / 17, { v: .5 + k * .02, p: 1 + k * .03 });
  add('hit', T.grow + 1.7, { v: .5 });
  add('whoosh', T.bike - .1, { v: .7 }); add('bell', T.bike + .4); add('bell', T.bike + .65);
  for (let k = 0; k < 12; k++) add('ping', T.phone + .4 + k * .2, { v: .3 + k * .04, p: 1 + k * .03 });
  add('ding', T.gain, { v: .8 }); add('sparkle', T.gain + .05);
  add('pop', T.follow + .3); add('click', T.click, { v: .9 }); add('sparkle', T.click + .02);
  add('whoosh', T.fechado - .3, { v: .4 }); add('click', T.fechado, { v: 1, p: .8 });
  add('hit', T.silh + .2, { v: .8 });
  add('slam', T.end + .1); add('click', T.end + .5, { v: 1 });
  add('pop', .95, { v: .45 }); add('pop', T.end + 1.2, { v: .6 });   // the retention edit: hook question, comment question
  const last = Object.keys(VO).at(-1); add('click', VO[last] + DURS[last] * .6, { v: .9 }); add('sparkle', VO[last] + DURS[last] * .6 + .02);
  return ev.sort((a, b) => a.t - b.t);
}

window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS; window.T = T; window.VO = VO;
window.TEXTS = t => { const s = SUBS.find(s => t >= s.t0 && t < s.t1); return s ? [{ id: s.id, text: s.text, x0: 90, y0: 1380, x1: 990, y1: 1560 }] : []; };
for (const f of ['600 54px Fredoka', '700 74px Fredoka', '500 28px Fredoka']) await document.fonts.load(f);
render(parseFloat(Q.get('t') ?? '1'));
window.READY = true;
