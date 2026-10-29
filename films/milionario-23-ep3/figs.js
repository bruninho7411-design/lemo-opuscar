// The cast, built from bricks: 1×1 brick legs, a 2×2 brick torso, round-brick arms, a round 2×2 brick head with a printed face.
// The face is a printed decal (canvas texture) redrawn every frame: eyes, brows, mouth (lip sync), glasses, sunglasses.
import * as THREE from 'three';
import { COL, BRICK, PLATE, brick, plate, mesh, roundGeo, brickGeo, plastic } from './bricks.js';

export const HIP = PLATE + 2 * BRICK;              // 2.8
export const SHOULDER = HIP + PLATE + 2 * BRICK;   // 5.6
export const HEAD_H = 2.0;                          // round 2×2 head, a little shorter than two bricks
const ARM_L = 3 * BRICK;
const SKIN = { light: '#f3c9a1', tan: '#d9a07a', brown: '#8a5a3c', old: '#eebd95' };

export const DESIGNS = {
  you: { skin: SKIN.light, top: '#555b6a', pants: '#2b2c38', shoe: '#f2f2ee', hair: '#6b4630', hood: true, glasses: true },
  caio: { skin: SKIN.brown, top: '#e3a72a', pants: '#3f68a8', shoe: '#c91a09', hair: '#1d1716', fade: true, bomber: true },
  suit: { skin: SKIN.tan, top: '#1b1f27', pants: '#1b1f27', shoe: '#111', hair: '#141414', slick: true, shades: true, tie: true },
  arlindo: { skin: SKIN.old, top: '#7f8f5c', pants: '#6b5a48', shoe: '#4a3426', hair: '#f2f0ea', bald: true, stache: true },
  // customers (crowds, queues)
  cA: { skin: SKIN.light, top: '#c91a09', pants: '#3f68a8', shoe: '#f2f2ee', hair: '#e8b84a', fade: true },
  cB: { skin: SKIN.tan, top: '#36aebf', pants: '#2b2c38', shoe: '#1b2a34', hair: '#2a1d1a', fade: true },
  cC: { skin: SKIN.brown, top: '#237841', pants: '#6b5a48', shoe: '#f2f2ee', hair: '#141414', slick: true },
  cD: { skin: SKIN.light, top: '#ff8fc0', pants: '#f2f2ee', shoe: '#c91a09', hair: '#6b4630', fade: true },
};

function faceTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 390;   // same px per stud on both axes of the head wrap
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return { c, g: c.getContext('2d'), t };
}
// face state: {look:[x,y], blink, lid, brow, mouth:{o,w,sm}, wide}
function drawFace(F, D, s) {
  const g = F.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 512, 390);
  g.setTransform(1.9, 0, 0, 1.9, -230.4, -41);   // features drawn in a 512×256 design space, scaled onto the head
  const cx = 256, ey = 108, ex = 46, lw = 7;
  g.lineCap = g.lineJoin = 'round';
  const ink = '#1b1414';
  // eyes
  const wide = s.wide ?? 1, lid = s.blink ? 1 : (s.lid ?? 0);
  for (const sx of [-1, 1]) {
    const x = cx + sx * ex, rx = 15 * wide, ry = 21 * wide;
    if (D.shades) continue;
    if (lid >= .95) { g.strokeStyle = ink; g.lineWidth = lw; g.beginPath(); g.moveTo(x - rx, ey + 4); g.quadraticCurveTo(x, ey + 10, x + rx, ey + 4); g.stroke(); continue; }
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, ey, rx + 5, ry + 5, 0, 0, 7); g.fill();
    const px = x + (s.look?.[0] ?? 0) * 8, py = ey + (s.look?.[1] ?? 0) * 8;
    g.fillStyle = ink; g.beginPath(); g.ellipse(px, py, rx * .62, ry * .62, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(px - 4, py - 6, 4, 0, 7); g.fill();
    if (lid > 0) { g.fillStyle = D.skin; g.fillRect(x - rx - 8, ey - ry - 8, 2 * rx + 16, (2 * ry + 10) * lid); g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.moveTo(x - rx - 4, ey - ry - 6 + (2 * ry + 10) * lid); g.lineTo(x + rx + 4, ey - ry - 6 + (2 * ry + 10) * lid); g.stroke(); }
  }
  if (D.shades) {   // sunglasses
    g.fillStyle = '#0d0f14'; g.beginPath(); g.roundRect(cx - 96, ey - 24, 84, 46, 14); g.roundRect(cx + 12, ey - 24, 84, 46, 14); g.fill();
    g.fillRect(cx - 14, ey - 18, 28, 8); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(cx - 84, ey - 16, 22, 8); g.fillRect(cx + 24, ey - 16, 22, 8);
  }
  if (D.glasses) {
    g.strokeStyle = ink; g.lineWidth = 6;
    for (const sx of [-1, 1]) { g.beginPath(); g.arc(cx + sx * ex, ey, 34, 0, 7); g.stroke(); }
    g.beginPath(); g.moveTo(cx - 12, ey - 4); g.lineTo(cx + 12, ey - 4); g.stroke();
  }
  // brows
  const br = s.brow ?? 0;
  if (!D.shades) {
    g.strokeStyle = D.stache ? '#bdb6aa' : ink; g.lineWidth = D.stache ? 11 : 8;
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * 22, ey - 50 - br * 10); g.lineTo(cx + sx * 70, ey - 46 + br * 3 + (br < 0 ? br * 10 : 0)); g.stroke(); }
  }
  // mouth
  const m = s.mouth || {}, o = m.o ?? 0, mw = 34 * (m.w ?? 1), sm = m.sm ?? 0, my = 188;
  g.strokeStyle = ink; g.lineWidth = lw;
  if (o < .08) { g.beginPath(); g.moveTo(cx - mw, my - sm * 8); g.quadraticCurveTo(cx, my + sm * 12, cx + mw, my - sm * 8); g.stroke(); }
  else {
    const h = 6 + o * 34;
    g.fillStyle = '#4a1a22'; g.beginPath(); g.moveTo(cx - mw, my - sm * 6); g.quadraticCurveTo(cx, my - 6, cx + mw, my - sm * 6); g.quadraticCurveTo(cx, my + h + sm * 6, cx - mw, my - sm * 6); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.fillRect(cx - mw * .7, my - 5, mw * 1.4, Math.min(8, h * .25));
  }
  if (D.stache) { g.fillStyle = '#f2f0ea'; g.beginPath(); g.ellipse(cx - 26, my - 22, 34, 14, .15, 0, 7); g.ellipse(cx + 26, my - 22, 34, 14, -.15, 0, 7); g.fill(); }
  F.t.needsUpdate = true;
}

export function makeFig(kind) {
  const D = DESIGNS[kind];
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const legs = [-.5, .5].map(x => {
    const g = new THREE.Group(); g.position.set(x, HIP, 0); body.add(g);
    for (let i = 0; i < 2; i++) { const b = brick(1, 1, D.pants, { tile: i === 1 }); b.position.y = -HIP + PLATE + i * BRICK; g.add(b); }
    const f = plate(1, 2, D.shoe, { tile: true }); f.position.set(0, -HIP, .35); g.add(f);
    return g;
  });
  const hip = plate(2, 2, D.pants, { tile: true }); hip.position.y = HIP; body.add(hip);
  for (let i = 0; i < 2; i++) { const b = brick(2, 2, D.top, { tile: true }); b.position.y = HIP + PLATE + i * BRICK; body.add(b); }
  // torso details
  const det = (w, h, col, y, z = 1.005, x = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .04), plastic(col)); m.position.set(x, y, z); body.add(m); return m; };
  if (D.hood) { det(1.3, .55, '#474c59', HIP + PLATE + .5); for (const sx of [-1, 1]) det(.07, .9, '#e8e8e2', HIP + PLATE + 1.75, 1.01, sx * .22); }
  if (D.bomber) { det(.06, 2.3, '#3a2a10', HIP + PLATE + 1.2); det(2.02, .25, '#2b2b2b', HIP + PLATE + .12); }
  if (D.tie) { det(.7, 2.2, '#f2f2ee', HIP + PLATE + 1.3); det(.22, 1.8, '#d9a21b', HIP + PLATE + 1.25, 1.03); }
  if (kind === 'arlindo') for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .06, 12), plastic('#e8dcc0')); b.rotation.x = Math.PI / 2; b.position.set(0, HIP + PLATE + .5 + k * .7, 1.03); body.add(b); }
  const arms = [-1.5, 1.5].map(x => {
    const g = new THREE.Group(); g.position.set(x, SHOULDER - .1, 0); body.add(g);
    for (let i = 0; i < 3; i++) { const b = mesh(roundGeo(.5), i === 0 ? D.top : D.top); b.position.y = -ARM_L + i * BRICK; g.add(b); }
    const hnd = mesh(roundGeo(.42, PLATE * 1.4), D.skin); hnd.position.y = -ARM_L - PLATE * 1.2; g.add(hnd);
    const hand = new THREE.Group(); hand.position.y = -ARM_L - .4; g.add(hand);
    return { g, hand };
  });
  const collar = plate(2, 2, kind === 'suit' ? '#f2f2ee' : D.top, { tile: true }); collar.position.y = SHOULDER; body.add(collar);
  const head = new THREE.Group(); head.position.set(0, SHOULDER + PLATE, 0); body.add(head);
  const hd = mesh(roundGeo(1, HEAD_H), D.skin); head.add(hd);
  // printed face: a decal wrapped on the front of the round head
  const F = faceTexture();
  const decal = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, HEAD_H - .1, 48, 1, true, -1.25, 2.5),
    new THREE.MeshPhysicalMaterial({ map: F.t, transparent: true, roughness: .35, clearcoat: .6, clearcoatRoughness: .1, depthWrite: false }));
  decal.position.y = HEAD_H / 2; decal.scale.set(1.004, 1, 1.004); head.add(decal);
  // hair / hood / headwear
  if (D.hood) {
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.3, 2.0, 40, 1, true, Math.PI * .62, Math.PI * .76), plastic('#4a4f5c')); hood.material.side = THREE.DoubleSide;
    hood.position.y = .75; head.add(hood);
  }
  if (D.hair && !D.bald) {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, .55, 40), plastic(D.hair)); top.position.y = HEAD_H + .12; head.add(top);
    if (D.fade) { const band = new THREE.Mesh(new THREE.CylinderGeometry(1.025, 1.025, .7, 40, 1, true, Math.PI * .55, Math.PI * .9), plastic(D.hair)); band.position.y = HEAD_H - .3; band.material.side = THREE.DoubleSide; head.add(band); }
    if (D.slick) { const back = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 1.06, 1.4, 40, 1, true, Math.PI * .5, Math.PI), plastic(D.hair)); back.position.y = HEAD_H - .6; back.material.side = THREE.DoubleSide; head.add(back); }
    if (kind === 'you') {   // messy hair: tufts of round plates and cones
      const tufts = [[-.5, .45, .3, .4], [.45, .5, .25, -.5], [0, .55, -.45, .2], [-.6, .3, -.3, .6], [.6, .35, -.2, -.6], [.1, .62, .4, -.2], [-.2, .5, .7, .3]];
      for (const [x, y, z, r] of tufts) { const c = new THREE.Mesh(new THREE.ConeGeometry(.42, .9, 6), plastic(D.hair)); c.position.set(x, HEAD_H + y, z); c.rotation.set(z * .9, 0, -x * 1.4 + r * .3); head.add(c); }
      const fr = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 1.06, .5, 40, 1, true, -1.0, 2.0), plastic(D.hair)); fr.position.y = HEAD_H - .05; fr.material.side = THREE.DoubleSide; head.add(fr);
    }
  }
  if (D.bald) for (const sx of [-1, 1]) { const tuft = new THREE.Mesh(new THREE.SphereGeometry(.42, 16, 10), plastic(D.hair)); tuft.scale.set(.6, .8, 1); tuft.position.set(sx * .98, HEAD_H * .62, -.1); head.add(tuft); }
  root.traverse(o => { if (o.isMesh && o !== decal) o.castShadow = o.receiveShadow = true; });
  const face = { look: [0, 0], blink: false, lid: 0, brow: 0, mouth: { o: 0 } };
  let lastKey = '';
  // pose: arm = [forward/back x, side raise z]; legs swing; sit 0..1; face state merged
  function pose(p) {
    root.position.set(p.x, p.y ?? 0, p.z); root.rotation.y = p.ry ?? 0; root.visible = p.vis !== false;
    const sit = p.sit ?? 0;
    body.position.y = (p.bob ?? 0) - sit * (HIP - .7);
    body.rotation.x = p.lean ?? 0;
    legs[0].rotation.x = (p.legs?.[0] ?? 0) - sit * 1.5; legs[1].rotation.x = (p.legs?.[1] ?? 0) - sit * 1.5;
    const aL = p.armL ?? [0, .05], aR = p.armR ?? [0, .05];
    arms[0].g.rotation.set(aL[0], aL[2] ?? 0, -aL[1]); arms[1].g.rotation.set(aR[0], aR[2] ?? 0, aR[1]);
    head.rotation.set(p.nod ?? 0, p.turn ?? 0, p.tilt ?? 0);
    const s = { ...face, ...(p.face || {}) }, key = JSON.stringify(s);
    if (key !== lastKey) { drawFace(F, D, s); lastKey = key; }
  }
  pose({ x: 0, z: 0 });
  return { root, body, arms, head, legs, pose, D };
}

export function walkPose(phi, amp = .55) {
  const s = Math.sin(phi);
  return { legs: [s * amp, -s * amp], armL: [-s * amp * .6, .06], armR: [s * amp * .6, .06], bob: Math.abs(Math.cos(phi)) * .16 };
}
