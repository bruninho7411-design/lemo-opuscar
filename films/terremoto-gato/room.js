// The world: a cutaway flat on the top floor of a block, the city around it, rain, you and the cat.
// Everything is a pure function of t (update(t)); sound events are collected in EVS.
import * as THREE from 'three';
import { clamp, seg, ss, eio, eo, ei, lerp, hash, TAU } from '/core/lib.js';
import { T, BEAT, E8 } from './story.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const matCache = {};
export function mat(c, o = {}) {
  const k = c + JSON.stringify(o);
  if (!o.unique && matCache[k]) return matCache[k];
  const m = new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: o.r ?? .9, metalness: 0, emissive: o.e ?? '#000000', emissiveIntensity: o.ei ?? 1, transparent: !!o.op, opacity: o.op ?? 1 });
  if (!o.unique) matCache[k] = m; return m;
}
function box(w, h, d, m, x = 0, y = 0, z = 0, par) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof m === 'string' ? mat(m) : m);
  o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (par) par.add(o); return o;
}
function mesh(geo, m, par) { const o = new THREE.Mesh(geo, typeof m === 'string' ? mat(m) : m); o.castShadow = o.receiveShadow = true; if (par) par.add(o); return o; }
const jit = (c, i, a = .04) => { const col = new THREE.Color(c); const hsl = {}; col.getHSL(hsl); col.setHSL(hsl.h, hsl.s, clamp(hsl.l * (1 + (hash(i) - .5) * 2 * a))); return '#' + col.getHexString(); };

// —— shaking ——
export function shakeAmp(t) {
  if (t < T.rumble) return 0;
  if (t < T.hit) return .1 * seg(t, T.rumble, T.hit);
  const a = 1 - .25 * seg(t, 13, 18);
  return a * (1 - ss(seg(t, 19, T.stop)));
}
const wav = (t, f, p) => Math.sin(TAU * f * t + p);
export function shakeVec(t, k = 1) {
  const a = shakeAmp(t);
  if (!a) return [0, 0, 0];
  const jolt = t >= T.hit ? 1 + 1.6 * Math.exp(-(t - T.hit) * 5) : 1;
  return [a * jolt * k * (.06 * wav(t, 4.3, 0) + .035 * wav(t, 7.1, 1) + .025 * wav(t, 2.2, 2)),
          a * jolt * k * (.025 * wav(t, 5.7, .5) + .015 * wav(t, 9.3, 3)),
          a * jolt * k * (.05 * wav(t, 3.7, 4) + .03 * wav(t, 6.3, 5) + .02 * wav(t, 1.9, 6))];
}

// keyframed values: [[t, v], ...] with ease in-out between keys
function keys(K, ease = eio) {
  return t => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) { const u = ease(seg(t, K[i][0], K[i + 1][0])); const a = K[i][1], b = K[i + 1][1]; return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], u)) : lerp(a, b, u); } return K[K.length - 1][1]; };
}
const blendPose = (A, B, u) => { const o = {}; for (const k in A) o[k] = lerp(A[k], B[k] ?? A[k], u); return o; };
function poseTrack(K) {   // [[t, poseObject], ...]
  return t => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return blendPose(K[i][1], K[i + 1][1], eio(seg(t, K[i][0], K[i + 1][0]))); return K[K.length - 1][1]; };
}

export const EVS = [];
const ev = (t, type, o = {}) => EVS.push({ t: +t.toFixed(3), type, ...o });

export function buildWorld(scene) {
  const root = new THREE.Group(); scene.add(root);           // the ground (shakes with the quake)
  const house = new THREE.Group(); root.add(house);           // our block (sways a little more)
  const room = new THREE.Group(); house.add(room);

  // ——— the flat ———
  const RX0 = -3.0, RX1 = 3.1, RZ0 = -2.5, RZ1 = 3.0, WH = 2.7;
  // floor planks
  for (let i = 0, z = RZ0; z < RZ1 - .01; i++, z += .32) box(RX1 - RX0, .06, .3, jit(i % 2 ? '#c99c6e' : '#bf9264', i, .05), (RX0 + RX1) / 2, -.03, z + .16, room);
  box(RX1 - RX0 + .15, .32, RZ1 - RZ0 + .15, '#5d4c44', (RX0 + RX1) / 2 - .075, -.22, (RZ0 + RZ1) / 2 - .075, room);   // slab (cut section)
  const wallM = mat('#efe2cc'), capM = mat('#7c6a5c');
  const wall = (w, h, d, x, y, z) => { box(w, h, d, wallM, x, y, z, room); box(w + .002, .03, d + .002, capM, x, y + h / 2 + .015, z, room); };
  // back wall z = -2.5 (door hole x 1.9..2.7, h 2.1)
  wall(1.9 - (RX0 - .15), WH, .15, ((RX0 - .15) + 1.9) / 2, WH / 2, RZ0 - .075);
  wall(RX1 - 2.7, WH, .15, (2.7 + RX1) / 2, WH / 2, RZ0 - .075);
  box(.8, WH - 2.1, .15, wallM, 2.3, 2.1 + (WH - 2.1) / 2, RZ0 - .075, room); box(.802, .03, .152, capM, 2.3, WH + .015, RZ0 - .075, room);
  // door (hinged at x 1.9)
  const doorP = new THREE.Group(); doorP.position.set(1.92, 0, RZ0 - .03); room.add(doorP);
  box(.76, 2.06, .05, '#8a5a3c', .38, 1.03, 0, doorP); box(.05, .05, .06, '#e8c66a', .68, 1.0, .04, doorP);
  for (const x of [1.87, 2.73]) box(.06, 2.12, .2, '#f7f1e6', x, 1.06, RZ0 - .07, room);
  box(.92, .06, .2, '#f7f1e6', 2.3, 2.13, RZ0 - .07, room);
  // left wall x = -3 (window hole z -1.4..0.4, y 1.0..2.3)
  const WZ0 = -1.4, WZ1 = .4, WY0 = 1.0, WY1 = 2.3;
  wall(.15, WH, WZ0 - (RZ0 - .15), RX0 - .075, WH / 2, ((RZ0 - .15) + WZ0) / 2);
  wall(.15, WH, RZ1 - WZ1, RX0 - .075, WH / 2, (WZ1 + RZ1) / 2);
  box(.15, WY0, WZ1 - WZ0, wallM, RX0 - .075, WY0 / 2, (WZ0 + WZ1) / 2, room);
  wall(.15, WH - WY1, WZ1 - WZ0, RX0 - .075, WY1 + (WH - WY1) / 2, (WZ0 + WZ1) / 2);
  const frameM = mat('#f7f1e6');
  box(.2, .07, WZ1 - WZ0 + .1, frameM, RX0 - .06, WY0, (WZ0 + WZ1) / 2, room); box(.28, .05, WZ1 - WZ0 + .16, frameM, RX0 + .02, WY0 - .02, (WZ0 + WZ1) / 2, room);
  box(.2, .07, WZ1 - WZ0 + .1, frameM, RX0 - .06, WY1, (WZ0 + WZ1) / 2, room);
  for (const z of [WZ0, WZ1, (WZ0 + WZ1) / 2]) box(.2, WY1 - WY0, .06, frameM, RX0 - .06, (WY0 + WY1) / 2, z, room);
  const glassM = new THREE.MeshStandardMaterial({ color: '#9fb4e8', transparent: true, opacity: .16, roughness: .1, flatShading: true });
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(WZ1 - WZ0, WY1 - WY0), glassM); pane.rotation.y = Math.PI / 2; pane.position.set(RX0 - .07, (WY0 + WY1) / 2, (WZ0 + WZ1) / 2); room.add(pane);
  // cracks: thin dark sticks on the glass radiating from a point
  const cracks = []; { const cz = -.75, cy = 1.75, cM = mat('#e9f0ff', { e: '#c9d6ff', ei: .5 });
    for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + hash(i + 3) * .5, L = .25 + hash(i + 9) * .55;
      const s = box(.012, L, .012, cM, RX0 - .04, cy, cz, room); s.rotation.x = a; s.position.y += Math.cos(a) * L / 2; s.position.z += Math.sin(a) * L / 2 * -1; s.castShadow = false;
      cracks.push({ s, L, d: hash(i + 1) * .5 }); } }
  // shards (fall inside)
  const shards = []; for (let i = 0; i < 14; i++) { const g = new THREE.TetrahedronGeometry(.05 + hash(i + 40) * .05, 0); const s = mesh(g, mat('#b8c8f0', { e: '#6f7fb0', ei: .4 }), room);
    shards.push({ s, z0: lerp(WZ0 + .1, WZ1 - .1, hash(i + 50)), y0: lerp(WY0 + .1, 1.9, hash(i + 60)), x1: RX0 + .25 + hash(i + 70) * .7, z1: lerp(WZ0, WZ1, hash(i + 80)), d: hash(i + 90) * .5 }); }

  // ——— furniture ———
  // sofa (raised on legs: the cat fits underneath)
  const sofa = new THREE.Group(); sofa.position.set(-1.6, 0, -2.05); room.add(sofa);
  const sofaM = '#5f8e98', sofaD = '#4f7b85';
  box(2.0, .2, .8, sofaM, 0, .36, 0, sofa); box(2.0, .55, .2, sofaD, 0, .66, -.32, sofa);
  box(.2, .4, .8, sofaD, -1.0, .52, 0, sofa); box(.2, .4, .8, sofaD, 1.0, .52, 0, sofa);
  for (const x of [-.5, .5]) box(.92, .12, .66, jit(sofaM, x * 7, .06), x, .52, .04, sofa);
  for (const [x, z] of [[-1.02, -.34], [1.02, -.34], [-1.02, .34], [1.02, .34]]) box(.06, .26, .06, '#3b2f28', x, .13, z, sofa);
  box(.5, .28, .12, '#f2c879', -.62, .72, -.18, sofa).rotation.z = .12;    // cushion
  // rug
  box(2.6, .02, 1.7, '#d7a7b8', -1.4, .01, .95, room); box(2.3, .021, 1.4, '#e7c3cf', -1.4, .012, .95, room);
  // table (the cover)
  const table = new THREE.Group(); table.position.set(.6, 0, 0); room.add(table);
  box(1.6, .07, 1.0, '#a8774f', 0, .78, 0, table);
  for (const [x, z] of [[-.72, -.42], [.72, -.42], [-.72, .42], [.72, .42]]) box(.08, .75, .08, '#8a5f3e', x, .375, z, table);
  box(1.4, .05, .06, '#8a5f3e', 0, .68, -.42, table); box(1.4, .05, .06, '#8a5f3e', 0, .68, .42, table);
  // chairs
  for (const [x, z, r] of [[-.35, -.8, 0], [1.35, -.75, Math.PI]]) { const c = new THREE.Group(); c.position.set(.6 + x, 0, z); c.rotation.y = r; room.add(c);
    box(.42, .05, .42, '#c48a5a', 0, .45, 0, c); box(.42, .45, .05, '#c48a5a', 0, .7, -.19, c); for (const [a, b] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) box(.04, .45, .04, '#8a5f3e', a, .225, b, c); }
  // glass of water on the table
  const glassG = new THREE.Group(); room.add(glassG);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.045, .038, .13, 10, 1, true), new THREE.MeshStandardMaterial({ color: '#dfe9ff', transparent: true, opacity: .35, roughness: .1, side: THREE.DoubleSide, flatShading: true })); cup.position.y = .065; glassG.add(cup);
  const water = mesh(new THREE.CylinderGeometry(.042, .037, .09, 10), mat('#7fb6e6', { e: '#20406a', ei: .4 }), glassG); water.position.y = .047;
  const rings = []; for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1, .07, 3, 20), new THREE.MeshBasicMaterial({ color: '#eaf4ff', transparent: true, opacity: 0 })); r.rotation.x = Math.PI / 2; r.position.y = .093; glassG.add(r); rings.push(r); }
  // sideboard + clock + vase
  box(1.4, .7, .4, '#e2b07a', .9, .35, RZ0 + .2, room); box(1.42, .04, .42, '#c48a5a', .9, .72, RZ0 + .2, room);
  for (const x of [.5, 1.3]) box(.6, .5, .01, '#d8a06c', x, .38, RZ0 + .405, room);
  const vase = new THREE.Group(); room.add(vase); mesh(new THREE.CylinderGeometry(.06, .09, .26, 6), '#4f7fb8', vase).position.y = .13;
  for (let i = 0; i < 3; i++) { const f = mesh(new THREE.IcosahedronGeometry(.05, 0), i % 2 ? '#f5c2b0' : '#f7df8f', vase); f.position.set((i - 1) * .05, .3 + (i % 2) * .05, 0); }
  const clock = new THREE.Group(); clock.position.set(.9, 1.85, RZ0 + .02); room.add(clock);
  mesh(new THREE.CylinderGeometry(.24, .24, .05, 12), '#f7f1e6', clock).rotation.x = Math.PI / 2;
  mesh(new THREE.TorusGeometry(.24, .025, 4, 12), '#3b2f28', clock);
  const hH = box(.03, .13, .02, '#2a2230', 0, .065, .04, clock); const hM = box(.02, .19, .02, '#2a2230', 0, .095, .045, clock);
  const hHp = new THREE.Group(); clock.add(hHp); hHp.add(hH); hHp.rotation.z = -Math.PI / 2;   // 3 o'clock
  // frames on the back wall
  const frames = [[-2.15, 1.72, '#f7df8f', 8.75], [-1.1, 1.82, '#b5dccb', 11.85]].map(([x, y, c, tf], i) => {
    const g = new THREE.Group(); g.position.set(x, y, RZ0 + .03); room.add(g); box(.5, .4, .04, '#3b2f28', 0, 0, 0, g); box(.42, .32, .045, c, 0, 0, .002, g);
    mesh(new THREE.IcosahedronGeometry(.07, 0), i ? '#4f9c63' : '#d9644a', g).position.set(-.06, -.03, .04); ev(tf, 'fall', { what: 'frame' }); ev(tf + .5, 'land', { what: 'frame', mat: 'wood' });
    return { g, x, y, tf }; });
  // floor lamp (right of the sofa)
  const lamp = new THREE.Group(); lamp.position.set(-.3, 0, -2.15); room.add(lamp);
  mesh(new THREE.CylinderGeometry(.16, .18, .04, 8), '#3b2f28', lamp).position.y = .02; box(.03, 1.45, .03, '#3b2f28', 0, .74, 0, lamp);
  const shadeM = mat('#ffd9a0', { e: '#ffb35c', ei: 1.4, unique: true }); const shade = mesh(new THREE.CylinderGeometry(.14, .24, .3, 8, 1, true), shadeM, lamp); shade.position.y = 1.5; shade.material.side = THREE.DoubleSide;
  const lampL = new THREE.PointLight('#ffb05a', 6, 10, 1.0); lampL.position.set(0, 1.45, 0); lamp.add(lampL);
  // bookshelf on the left wall
  const shelf = new THREE.Group(); shelf.position.set(RX0 + .18, 0, 1.45); room.add(shelf);
  box(.36, 1.9, .05, '#9a6a45', 0, .95, -.65, shelf); box(.36, 1.9, .05, '#9a6a45', 0, .95, .65, shelf); box(.02, 1.9, 1.3, '#8a5f3e', -.17, .95, 0, shelf);
  const SHY = [.04, .5, .96, 1.42, 1.88]; SHY.forEach(y => box(.36, .04, 1.32, '#9a6a45', 0, y, 0, shelf));
  const BOOKC = ['#d9644a', '#4f7fb8', '#f7df8f', '#3f8f86', '#6a5a8e', '#e0874f', '#b5dccb', '#f5c2b0'];
  const books = []; let bi = 0;
  for (let s = 0; s < 4; s++) { let z = -.6; while (z < .55) { const th = .05 + hash(bi * 3.1) * .05, h = .26 + hash(bi * 1.7) * .1;
      const b = box(.24, h, th, BOOKC[bi % 8], 0, SHY[s] + .02 + h / 2, z + th / 2, shelf);
      // which ones fall: upper shelves mostly; a burst at T.frame lands near the cat
      const burst = s >= 2 && z > -.1 && bi % 2 === 0, falls = (s >= 2 && hash(bi + 7) > .35) || burst;
      const tf = burst ? T.frame + hash(bi + 11) * .25 : 8.25 + hash(bi + 13) * 5.5;
      books.push({ b, s, z0: z + th / 2, y0: SHY[s] + .02 + h / 2, h, th, falls, tf, x1: .35 + hash(bi + 17) * .6 + (burst ? .1 : 0), z1: z * .8 + (hash(bi + 19) - .5) * .5, ry: (hash(bi + 23) - .5) * 2.4 });
      if (falls) { ev(tf, 'fall', { what: 'book' }); ev(tf + .38, 'land', { what: 'book', mat: 'book', big: burst }); }
      z += th + .006; bi++; } }
  // plant in the back-left corner
  const plant = new THREE.Group(); plant.position.set(-2.72, 0, -2.2); room.add(plant);
  mesh(new THREE.CylinderGeometry(.15, .11, .3, 7), '#d9644a', plant).position.y = .15;
  for (let i = 0; i < 7; i++) { const l = mesh(new THREE.ConeGeometry(.08, .45 + hash(i) * .25, 3), i % 2 ? '#4f9c63' : '#3f8a5a', plant); const a = i / 7 * TAU; l.position.set(Math.cos(a) * .07, .5 + hash(i + 5) * .15, Math.sin(a) * .07); l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); }
  ev(12.6, 'fall', { what: 'plant' }); ev(13.15, 'land', { what: 'plant', mat: 'ceramic' });
  ev(9.7, 'fall', { what: 'vase' }); ev(10.05, 'land', { what: 'vase', mat: 'ceramic', big: true });
  ev(12.9, 'fall', { what: 'glass' }); ev(13.3, 'land', { what: 'glass', mat: 'glass' });
  ev(T.crack, 'crack'); ev(T.shards, 'shards');

  // ——— you ———
  const P = buildPerson(room);
  // ——— the cat ———
  const C = buildCat(room);

  // ——— the building below + city ———
  const bldg = new THREE.Group(); house.add(bldg);
  const FL = 3.0, NF = 6;
  box(RX1 - RX0 + .3, NF * FL, RZ1 - RZ0 + .3, '#d8c8b8', (RX0 + RX1) / 2, -.38 - NF * FL / 2, (RZ0 + RZ1) / 2, bldg);
  const winList = [];   // {x,y,z,ry,w,h,seed,kind}
  for (let f = 0; f < NF; f++) { const y = -.38 - FL * f - 1.4;
    for (let i = 0; i < 4; i++) { winList.push({ x: RX1 + .16, y, z: RZ0 + .5 + i * 1.35, ry: Math.PI / 2, w: .7, h: 1.1, own: true });
      winList.push({ x: RX0 + .4 + i * 1.5, y, z: RZ1 + .16, ry: 0, w: .7, h: 1.1, own: true }); } }
  // roof edge of our flat: a parapet-less cut, plus a little water tank behind
  const city = new THREE.Group(); root.add(city);
  const GY = -.38 - NF * FL; const ground = box(400, .2, 400, '#2c2a3a', 0, GY - .1, 0, city); ground.castShadow = false;
  const BC = ['#cfc3d6', '#bfc8dc', '#d8c8b8', '#c2d3cc', '#d6c9b0', '#b8b4c8'];
  for (let gx = -6; gx <= 6; gx++) for (let gz = -6; gz <= 6; gz++) {
    if (gx === 0 && gz === 0) continue; const s = gx * 13.1 + gz * 7.7;
    if (hash(s + 1) < .12) continue;   // a gap (square)
    const w = 5 + hash(s + 2) * 3.5, d = 5 + hash(s + 3) * 3.5, cx = gx * 10 + (hash(s + 4) - .5) * 1.5, cz = gz * 10 + (hash(s + 5) - .5) * 1.5;
    const depth = cx + cz;   // in front of our flat (towards the camera) → keep low so it never hides the flat
    let H = 8 + hash(s + 6) * 22; if (depth > -4) H = Math.min(H, 6 + hash(s + 8) * 9); if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1 && depth > -4) H = Math.min(H, 9);
    box(w, H, d, jit(BC[(gx * 7 + gz * 3 + 99) % 6], s, .06), cx, GY + H / 2, cz, city);
    box(w * .3, .8, d * .3, '#9a96a8', cx + (hash(s + 9) - .5) * w * .4, GY + H + .4, cz + (hash(s + 10) - .5) * d * .4, city);
    const nf = Math.floor((H - 1) / FL);
    for (let f = 0; f < nf; f++) { const y = GY + 1.6 + f * FL;
      for (let i = 0, n = Math.floor(d / 1.6); i < n; i++) winList.push({ x: cx + w / 2 + .03, y, z: cz - d / 2 + .8 + i * (d - 1.6) / Math.max(1, n - 1), ry: Math.PI / 2, w: .65, h: 1.0 });
      for (let i = 0, n = Math.floor(w / 1.6); i < n; i++) winList.push({ x: cx - w / 2 + .8 + i * (w - 1.6) / Math.max(1, n - 1), y, z: cz + d / 2 + .03, ry: 0, w: .65, h: 1.0 }); }
  }
  // streets: thin lighter strips
  for (let k = -6; k <= 6; k++) { box(.5, .02, 140, '#3d3a50', k * 10 + 5, GY + .01, 0, city).castShadow = false; box(140, .02, .5, '#3d3a50', 0, GY + .01, k * 10 + 5, city).castShadow = false; }
  // windows: one instanced mesh, colour per instance per frame
  const winGeo = new THREE.PlaneGeometry(1, 1), winMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const WIN = new THREE.InstancedMesh(winGeo, winMat, winList.length); WIN.castShadow = false; WIN.receiveShadow = false;
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), Pv = new THREE.Vector3(), E = new THREE.Euler();
  winList.forEach((w, i) => { Pv.set(w.x, w.y, w.z); Q.setFromEuler(E.set(0, w.ry, 0)); S.set(w.w, w.h, 1); M4.compose(Pv, Q, S); WIN.setMatrixAt(i, M4);
    w.lit = hash(i * 1.31 + 2) < .38; w.off = T.black + .05 + Math.hypot(w.x, w.z) * .012 + hash(i + 5) * .35; w.warm = hash(i + 8);
    w.torch = -1; });
  // neighbours' torches: 16 windows, one per eighth note from T.torches, spread over the view
  { const cand = winList.map((w, i) => i).filter(i => !winList[i].own && Math.hypot(winList[i].x, winList[i].z) < 34 && Math.hypot(winList[i].x, winList[i].z) > 6);
    const pick = []; for (let k = 0; k < 16 && cand.length; k++) { const j = Math.floor(hash(k * 5.3 + 1) * cand.length); pick.push(cand.splice(j, 1)[0]); }
    pick.sort((a, b) => Math.hypot(winList[a].x, winList[a].z) - Math.hypot(winList[b].x, winList[b].z));
    pick.forEach((i, k) => { winList[i].torch = T.torches + k * E8; ev(winList[i].torch, 'torchpop', { k }); }); }
  city.add(WIN);
  const winCol = new THREE.Color();
  // rain
  const RN = 2600, RAIN = new THREE.InstancedMesh(new THREE.BoxGeometry(.012, .42, .012), new THREE.MeshBasicMaterial({ color: '#8d9ad0', transparent: true, opacity: .55 }), RN); RAIN.castShadow = RAIN.receiveShadow = false; RAIN.frustumCulled = false; scene.add(RAIN);

  // torch beam (camera-facing ribbon) + spot light
  const beam = makeBeam(); room.add(beam.mesh); room.add(beam.halo);
  const spot = new THREE.SpotLight('#ffd8a0', 0, 9, .42, .6, 1.2); spot.castShadow = false; room.add(spot, spot.target);
  const phoneL = new THREE.PointLight('#9fc0ff', .5, 2, 1.5); room.add(phoneL);

  // ——— update ———
  const camBack = new THREE.Vector3();
  function update(t, o) {
    // quake offsets
    const [sx, sy, sz] = shakeVec(t);
    root.position.set(sx, sy, sz);
    const sway = shakeAmp(t) * .02; house.rotation.set(Math.sin(t * TAU * 1.1) * sway, 0, Math.sin(t * TAU * .9 + 1) * sway);
    const a = shakeAmp(t);
    const wob = (k, s = .03) => [a * s * Math.sin(t * TAU * (3.1 + k * .37) + k), a * s * Math.sin(t * TAU * (2.7 + k * .41) + k * 2)];
    { const [x, z] = wob(1); sofa.position.set(-1.6 + x * .6, 0, -2.05 + z * .4); }
    { const [x, z] = wob(2, .05); table.position.set(.6 + x + .12 * ss(seg(t, 8, 14)), 0, z + .06 * ss(seg(t, 9, 16))); table.rotation.y = -.05 * ss(seg(t, 8, 16)); }
    // glass: ripples before, slides and falls
    { const tp = table.position; let gx = tp.x + .35, gz = tp.z + .2, gy = .815, rx = 0, rz = 0;
      if (t > T.hit) { const u = seg(t, T.hit, 12.9); gx += .45 * u + a * .01 * Math.sin(t * 40); gz += .05 * Math.sin(u * 6); }
      if (t > 12.9) { const u = seg(t, 12.9, 13.3); gx = tp.x + .82 + .25 * u; gy = lerp(.815, .02, u * u); rz = -1.4 * eo(u); }
      glassG.position.set(gx, gy, gz); glassG.rotation.set(rx, 0, rz);
      rings.forEach((r, i) => { let s = 0, op = 0; for (let k = 0; k < 6; k++) { const t0 = T.ripple + (k * 4 + i) * BEAT / 4 * (k < 2 ? 4 / (i + 4) : 1); const u = (t - t0) / .6; if (t0 < T.hit && u > 0 && u < 1) { s = .005 + .04 * u; op = .7 * (1 - u); } } r.scale.setScalar(Math.max(s, .001)); r.material.opacity = op; r.visible = op > .01; });
      water.position.y = .047 + (t > T.ripple && t < 13 ? .004 * Math.sin(t * 30) * clamp((t - T.ripple) / 2) : 0); water.visible = t < 13.2; }
    // frames: slide down then tip off the wall
    frames.forEach(f => { const u = seg(t, f.tf, f.tf + .5); const k = ei(u); f.g.position.set(f.x, lerp(f.y, .55 - (f.x < -1.5 ? .1 : 0), k), RZ0 + .03 + .35 * k); f.g.rotation.set(-1.45 * k, 0, .3 * k * Math.sign(f.x + 1.6)); if (u >= 1) { const b = Math.exp(-(t - f.tf - .5) * 9) * Math.sin((t - f.tf - .5) * 30) * .06; f.g.rotation.x = -1.45 + b; } });
    // books
    books.forEach(B => { if (!B.falls || t < B.tf) { B.b.position.set(0 + (a * .015 * Math.sin(t * 31 + B.z0 * 9)), B.y0, B.z0); B.b.rotation.set(a * .05 * Math.sin(t * 23 + B.z0 * 7), 0, 0); return; }
      const u = seg(t, B.tf, B.tf + .38), x = lerp(0, B.x1, eo(u)), y = lerp(B.y0, B.th / 2 + .01, u * u), z = lerp(B.z0, B.z1, u);
      let rz = -Math.PI / 2 * ss(u), b = 0; if (u >= 1) b = Math.exp(-(t - B.tf - .38) * 10) * Math.sin((t - B.tf - .38) * 28) * .04;
      B.b.position.set(x, y + b, z); B.b.rotation.set(0, B.ry * ss(u), rz); });
    // vase off the sideboard
    { const u = seg(t, 9.7, 10.05); vase.position.set(.55 + .3 * eo(u), lerp(.74, .06, u * u), RZ0 + .2 + .45 * u); vase.rotation.set(1.5 * ss(u), 0, .4 * u); }
    // plant tips over (pivot at the pot's edge)
    { const u = seg(t, 12.6, 13.15); plant.rotation.set(1.45 * ei(u) + (a * .06 * Math.sin(t * 17)), 0, -.3 * ei(u)); plant.position.set(-2.72, 0, -2.2 + .1 * u); }
    // lamp sways, dies at blackout
    lamp.rotation.set(a * .08 * Math.sin(t * TAU * 1.3), 0, a * .1 * Math.sin(t * TAU * 1.1 + 1));
    const on = t < T.black ? (t > T.hit ? (Math.sin(t * 61) > -.2 ? 1 : .2) * (t > T.black - .25 ? hash(Math.floor(t * 24)) : 1) : 1) : 0;
    lampL.intensity = 6 * on; shadeM.emissiveIntensity = 1.4 * on + .02;
    clock.rotation.z = a * .25 * Math.sin(t * TAU * .8);
    // window cracks + shards
    cracks.forEach(c => { const u = eo(seg(t, T.crack + c.d * .3, T.crack + .3 + c.d * .5)); c.s.scale.set(1, Math.max(u, .001), 1); c.s.visible = u > .01; });
    shards.forEach(s => { const u = seg(t, T.shards + s.d, T.shards + s.d + .45); s.s.visible = t > T.shards + s.d - .01;
      s.s.position.set(lerp(RX0 - .05, s.x1, eo(u)), lerp(s.y0, .03, u * u), lerp(s.z0, s.z1, u)); s.s.rotation.set(u * 5 + s.d * 9, s.d * 7, u * 3); });
    pane.material.opacity = t > T.shards ? .08 : .16;
    // door
    doorP.rotation.y = -1.3 * ss(seg(t, T.door + .7, T.door + 1.4));
    // you & the cat
    const pp = P.update(t, a);
    C.update(t, a, pp);
    // phone torch
    const torchOn = t >= T.torch && t < T.reveal + 3;
    if (torchOn || t < T.hit + .5) { const ph = pp.phone; phoneL.position.copy(ph.pos).add(V3(0, .1, 0)); phoneL.intensity = t < T.hit + .5 ? .5 : 0; }
    else phoneL.intensity = 0;
    const tw = ss(seg(t, T.torch, T.torch + .12));
    if (torchOn) {
      const from = pp.phone.pos.clone(), to = pp.aim.clone();
      spot.position.copy(from); spot.target.position.copy(to); spot.intensity = 26 * tw;
      beam.set(from, to, o.camBack, tw * (1 - .4 * seg(t, T.door, T.reveal)));
    } else { spot.intensity = 0; beam.hide(); }
    // windows
    for (let i = 0; i < winList.length; i++) { const w = winList[i]; let c = null;
      if (w.torch >= 0 && t >= w.torch) { const u = seg(t, w.torch, w.torch + .15); c = winCol.setRGB(1.6 * u, 1.45 * u, 1.1 * u); }
      else if (w.lit && t < w.off && !w.own) c = winCol.setRGB(1.0, lerp(.62, .78, w.warm), lerp(.3, .5, w.warm)).multiplyScalar(t > w.off - .2 ? hash(Math.floor(t * 30) + i) : 1);
      else if (w.own && t < w.off && w.lit) c = winCol.setRGB(.95, .7, .4);
      if (!c) c = winCol.setRGB(.05, .055, .1);
      WIN.setColorAt(i, c); }
    WIN.instanceColor.needsUpdate = true;
    // rain around what the camera sees (never inside the flat)
    { const R = Math.max(4, o.fh * .75), Hh = Math.max(5, o.fh * 1.2), tg = o.tg;
      for (let i = 0; i < RN; i++) { const x = tg[0] + (hash(i * 1.13) - .5) * 2 * R, z = tg[2] + (hash(i * 2.71) - .5) * 2 * R;
        const ph = hash(i * 3.97), y = tg[1] + Hh / 2 - ((t * 7.5 + ph * Hh) % Hh);
        const inside = x > RX0 - .3 && z > RZ0 - .3 && y > -.5;   // the flat and everything between it and the camera
        Pv.set(x - .08 * y, y, z); S.set(inside ? 0 : Math.max(.12, o.fh / 12), inside ? 0 : Math.max(.12, o.fh / 12), inside ? 0 : Math.max(.12, o.fh / 12)); M4.compose(Pv, Q.identity(), S); RAIN.setMatrixAt(i, M4); }
      RAIN.instanceMatrix.needsUpdate = true; }
    return pp;
  }

  // sounds of you and the cat
  P.events(ev); C.events(ev);
  return { update, root, room, ROOM: { RX0, RX1, RZ0, RZ1, WH }, P, C, table, shelf, glassG, sofa };
}

// ——— beam: camera-facing ribbon + halo (Gaussian across, fading along) ———
function makeBeam() {
  const mk = (w, k) => { const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { a: { value: 0 }, col: { value: new THREE.Color('#ffcf8a') } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: `varying vec2 vUv; uniform float a; uniform vec3 col; void main(){ float x = (vUv.x - .5) * 2.; float g = exp(-x * x * 3.2); float l = pow(vUv.y, 1.6) * smoothstep(1., .97, vUv.y); gl_FragColor = vec4(col * g * l * a * ${k.toFixed(2)}, 1.); }` });
    const o = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); o.castShadow = o.receiveShadow = false; o.frustumCulled = false; o.userData.w = w; return o; };
  const mesh = mk(1, .55), halo = mk(2.4, .2);
  const up = new THREE.Vector3(), side = new THREE.Vector3(), dir = new THREE.Vector3(), M = new THREE.Matrix4();
  function place(o, from, to, camBack, a) {
    dir.subVectors(to, from); const L = dir.length() * 1.15; dir.normalize();
    side.crossVectors(dir, camBack).normalize(); const nrm = new THREE.Vector3().crossVectors(side, dir);
    const wid = (.18 + .0) * o.userData.w;
    // plane: x = across (side, widening along the beam), y = along (dir)
    M.makeBasis(side.clone().multiplyScalar(wid * 2.2), dir.clone().multiplyScalar(-L), nrm);
    o.matrixAutoUpdate = false; o.matrix.copy(M); o.matrix.setPosition(from.clone().addScaledVector(dir, L / 2));
    o.material.uniforms.a.value = a; o.visible = a > .01;
  }
  // a cone-ish widening: use a trapezoid geometry
  for (const o of [mesh, halo]) { const g = o.geometry, p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) * (y > 0 ? .12 : 1)); } p.needsUpdate = true; }
  return { mesh, halo, set: (f, t, cb, a) => { place(mesh, f, t, cb, a); place(halo, f, t, cb, a); }, hide: () => { mesh.visible = halo.visible = false; } };
}

// ——— you: a low-poly figure with a pose rig ———
function buildPerson(par) {
  const skin = '#e0a77f', shirt = '#e7b84f', pants = '#3f4f7a', hair = '#3b2a22';
  const g = new THREE.Group(); par.add(g);
  const hips = new THREE.Group(); g.add(hips);
  box(.3, .14, .18, pants, 0, 0, 0, hips);
  const torso = new THREE.Group(); hips.add(torso); torso.position.y = .06;
  box(.32, .44, .19, shirt, 0, .22, 0, torso);
  const neck = new THREE.Group(); neck.position.y = .46; torso.add(neck); box(.07, .06, .07, skin, 0, .02, 0, neck);
  const head = new THREE.Group(); head.position.y = .06; neck.add(head);
  mesh(new THREE.IcosahedronGeometry(.115, 0), skin, head).position.y = .1;
  const hairM = mesh(new THREE.IcosahedronGeometry(.122, 0), hair, head); hairM.position.set(0, .14, -.025); hairM.scale.set(1, .75, 1);
  for (const x of [-.04, .04]) box(.022, .022, .01, '#2a2230', x, .11, .105, head);
  const arm = (sx) => { const sh = new THREE.Group(); sh.position.set(sx * .2, .41, 0); torso.add(sh);
    box(.085, .28, .085, shirt, 0, -.13, 0, sh); const el = new THREE.Group(); el.position.y = -.27; sh.add(el);
    box(.07, .25, .07, skin, 0, -.12, 0, el); const hand = new THREE.Group(); hand.position.y = -.26; el.add(hand); box(.08, .08, .05, skin, 0, -.02, 0, hand);
    return { sh, el, hand }; };
  const L = arm(-1), R = arm(1);
  const leg = (sx) => { const hp = new THREE.Group(); hp.position.set(sx * .085, -.04, 0); hips.add(hp);
    box(.12, .42, .13, pants, 0, -.2, 0, hp); const kn = new THREE.Group(); kn.position.y = -.41; hp.add(kn);
    box(.1, .4, .11, pants, 0, -.2, 0, kn); box(.11, .06, .2, '#f2f2f2', 0, -.41, .04, kn); return { hp, kn }; };
  const LL = leg(-1), RL = leg(1);
  // phone in the right hand
  const phone = new THREE.Group(); R.hand.add(phone); phone.position.set(0, -.05, .03);
  box(.07, .13, .015, '#22222c', 0, 0, 0, phone); const scr = box(.06, .11, .004, new THREE.MeshBasicMaterial({ color: '#a8c8ff' }), 0, 0, .009, phone); scr.castShadow = false;
  const torchDot = box(.02, .02, .004, new THREE.MeshBasicMaterial({ color: '#ffffff' }), 0, .04, -.009, phone); torchDot.castShadow = false;

  // poses (radians). flex: + forward. hipH: height of the hip joint.
  const Z = { hipH: .86, lean: 0, twist: 0, nod: 0, lF: 0, lA: .08, lE: .1, rF: 0, rA: .08, rE: .1, lH: 0, lK: 0, rH: 0, rK: 0 };
  const POSE = {
    sit: { ...Z, hipH: .5, lean: -.12, nod: .45, lF: .55, lA: .15, lE: 1.55, rF: .6, rA: .1, rE: 1.6, lH: 1.5, lK: 1.5, rH: 1.5, rK: 1.5 },
    stand: { ...Z, lF: .1, rF: .3, rE: .8 },
    brace: { ...Z, hipH: .76, lean: .25, nod: .2, lF: .3, lA: .5, lE: .4, rF: .5, rA: .4, rE: .6, lH: .35, lK: .55, rH: .2, rK: .45 },
    cover: { ...Z, hipH: .36, lean: 1.35, nod: .6, lF: 1.35, lA: .1, lE: .25, rF: 2.75, rA: -.25, rE: 1.75, lH: .55, lK: 2.15, rH: .55, rK: 2.15 },
    kneel: { ...Z, hipH: .45, lean: .1, nod: .1, lF: .2, lA: .15, lE: .3, rF: 1.25, rA: .05, rE: .35, lH: .05, lK: 1.6, rH: .05, rK: 1.6 },
    reach: { ...Z, hipH: .42, lean: .7, nod: -.1, lF: 1.1, lA: .05, lE: .2, rF: 1.0, rA: .1, rE: .5, lH: .1, lK: 1.7, rH: .1, rK: 1.7 },
    hold: { ...Z, hipH: .45, lean: .15, nod: .3, lF: .85, lA: .2, lE: 1.35, rF: .85, rA: .2, rE: 1.35, lH: .05, lK: 1.6, rH: .05, rK: 1.6 },
    holdStand: { ...Z, nod: .3, lF: .85, lA: .2, lE: 1.35, rF: .85, rA: .2, rE: 1.35 },
  };
  const H2 = Math.PI / 2;
  // root path [t, x, z, heading]; heading 0 = facing +z
  const path = keys([[0, [-1.5, -1.95, 0]], [T.up, [-1.5, -1.95, 0]], [T.up + .45, [-1.45, -1.55, .55]], [9.55, [-.7, -.3, .55]], [9.85, [-.6, -.1, H2]], [T.under, [.15, 0, H2]], [T.out - .1, [.15, 0, H2]],
    [T.out + .7, [-.55, -.3, -1.97]], [T.kneel - .5, [-.6, -.55, -2.5]], [T.kneel, [-1.05, -.95, -2.6]], [T.door - .1, [-1.05, -.95, -2.6]], [T.door + .4, [-.4, -1.5, -4.0]], [T.reveal, [1.95, -2.05, -4.48]], [40, [2.35, -2.75, -3.66]]]);
  const pose = poseTrack([[0, POSE.sit], [T.up, POSE.sit], [T.up + .45, POSE.brace], [9.5, POSE.brace], [9.95, POSE.cover], [T.out - .1, POSE.cover], [T.out + .5, POSE.kneel],
    [T.kneel - .4, POSE.kneel], [T.kneel, POSE.reach], [T.pick - .2, POSE.reach], [T.pick + .3, POSE.hold], [T.door - .3, POSE.hold], [T.door + .2, POSE.holdStand], [40, POSE.holdStand]]);
  const walking = t => (t > T.up + .4 && t < T.under - .4) || (t > T.door + .1 && t < T.reveal + 1.2);
  const tmp = new THREE.Vector3();
  function update(t, a) {
    const [x, z, h] = path(t); const p = { ...pose(t) };
    g.position.set(x, 0, z); g.rotation.y = h;
    // walk cycle (stagger while shaking)
    let wk = 0; if (walking(t)) { const ph = t * TAU * 1.9; wk = Math.sin(ph); p.lH += .45 * wk; p.rH -= .45 * wk; p.lK += .5 * Math.max(0, -wk); p.rK += .5 * Math.max(0, wk); p.lF -= .3 * wk * (p.lE > 1 ? 0 : 1); p.rF += .3 * wk * (p.rE > 1 ? 0 : 1); }
    const quiver = a * .05 * Math.sin(t * 29);
    hips.position.y = p.hipH + (walking(t) ? .02 * Math.abs(Math.cos(t * TAU * 1.9)) : 0); hips.rotation.set(0, 0, quiver);
    torso.rotation.set(p.lean, p.twist, 0); neck.rotation.set(p.nod, 0, 0);
    L.sh.rotation.set(-p.lF, 0, -p.lA); L.el.rotation.set(-p.lE, 0, 0);
    R.sh.rotation.set(-p.rF, 0, p.rA); R.el.rotation.set(-p.rE, 0, 0);
    LL.hp.rotation.set(-p.lH, 0, 0); LL.kn.rotation.set(p.lK, 0, 0); RL.hp.rotation.set(-p.rH, 0, 0); RL.kn.rotation.set(p.rK, 0, 0);
    // phone screen light / torch dot
    scr.material.color.set(t < T.hit + .4 ? '#b8d4ff' : '#1b1f2e'); torchDot.material.color.setScalar(t >= T.torch ? 4 : .2);
    g.updateMatrixWorld(true);
    const pos = new THREE.Vector3(); phone.getWorldPosition(pos);
    // where the torch points (in room coordinates; the room is the parent)
    const aimK = [[T.torch, [.6, .2, -1.8]], [T.torch + .7, [-.4, .05, -2.3]], [T.bell, [-1.3, .1, -1.9]], [T.eyes, [-1.72, .12, -1.72]], [T.catOut, [-1.6, .1, -1.6]], [T.pick, [-1.3, .1, -1.3]], [T.door + .3, [.9, .05, -2.0]], [T.reveal, [2.3, .3, -2.6]]];
    const aim = V3(...keys(aimK)(t));
    par.updateMatrixWorld(true); par.worldToLocal(pos);
    // chest point for the held cat (room coords)
    const chest = new THREE.Vector3(0, .32, .2); torso.localToWorld(chest); par.worldToLocal(chest);
    return { phone: { pos }, aim, chest, heading: h, x, z };
  }
  function events(ev) {
    ev(T.up, 'whoosh', { k: .5 }); for (let k = 0; k < 6; k++) ev(T.up + .45 + k * .26, 'step', { k });
    ev(T.under - .15, 'drop'); ev(T.out + .1, 'crawl'); ev(T.torch, 'torch');
    for (let k = 0; k < 7; k++) ev(T.door + .15 + k * .26, 'step', { k: k + 6 });
    ev(T.door + .8, 'door');
  }
  return { update, events, g };
}

// ——— the cat ———
function buildCat(par) {
  const fur = '#e8913f', furD = '#c8722c', white = '#f6eee2';
  const g = new THREE.Group(); par.add(g);
  const body = new THREE.Group(); g.add(body);
  const torso = mesh(new THREE.IcosahedronGeometry(1, 0), fur, body); torso.scale.set(.12, .1, .21);
  const chestW = mesh(new THREE.IcosahedronGeometry(1, 0), white, body); chestW.scale.set(.085, .075, .08); chestW.position.set(0, -.02, .15);
  const saddle = mesh(new THREE.IcosahedronGeometry(1, 0), furD, body); saddle.scale.set(.09, .05, .15); saddle.position.set(0, .065, -.03);
  const headP = new THREE.Group(); headP.position.set(0, .07, .2); body.add(headP);
  const head = mesh(new THREE.IcosahedronGeometry(1, 0), fur, headP); head.scale.set(.095, .085, .085); head.position.set(0, .03, .05);
  const muzzle = mesh(new THREE.IcosahedronGeometry(1, 0), white, headP); muzzle.scale.set(.05, .035, .04); muzzle.position.set(0, 0, .12);
  box(.02, .015, .015, '#e38a9a', 0, .02, .155, headP);
  const ears = [-1, 1].map(s => { const e = mesh(new THREE.ConeGeometry(.035, .07, 4), fur, headP); e.position.set(s * .05, .1, .04); return e; });
  const eyeM = new THREE.MeshBasicMaterial({ color: '#c8e85a' });
  const eyes = [-1, 1].map(s => { const e = box(.021, .02, .01, eyeM, s * .038, .05, .126, headP); e.castShadow = false; box(.006, .019, .004, '#141018', 0, 0, .006, e).castShadow = false; return e; });
  const collar = mesh(new THREE.TorusGeometry(.052, .016, 4, 10), '#d9544a', headP); collar.rotation.x = Math.PI / 2 - .5; collar.position.set(0, -.035, .0);
  const bell = mesh(new THREE.IcosahedronGeometry(.018, 0), mat('#f2c84a', { r: .4, e: '#6a4a10', ei: .5 }), headP); bell.position.set(0, -.085, .05);
  const legs = [[-.06, .13], [.06, .13], [-.06, -.13], [.06, -.13]].map(([x, z], i) => { const p = new THREE.Group(); p.position.set(x, -.04, z); body.add(p); box(.045, .14, .05, i < 2 ? white : fur, 0, -.07, 0, p); return p; });
  const tail = []; { let parent = body, pos = [0, .02, -.2]; for (let i = 0; i < 5; i++) { const s = new THREE.Group(); s.position.set(...pos); parent.add(s); box(.035 - i * .003, .035 - i * .003, .08, i === 4 ? furD : fur, 0, 0, -.04, s); tail.push(s); parent = s; pos = [0, 0, -.08]; } }

  const Z = { y: .17, pitch: 0, hp: 0, hy: 0, ear: 0, fold: 0, rearFold: 0, curl: 0, tailUp: .4, eye: 1, run: 0, roll: 0 };
  const POSE = {
    sleep: { ...Z, y: .075, hp: .45, ear: .2, fold: 1, rearFold: 1, curl: 1, tailUp: 0, eye: .15 },
    alert: { ...Z, y: .12, pitch: -.45, hp: -.25, ear: -.15, fold: 0, rearFold: 1, curl: .3, tailUp: .1, eye: 1.2 },
    crouch: { ...Z, y: .07, pitch: .05, hp: .1, ear: 1.1, fold: .9, rearFold: .9, curl: -.3, tailUp: -.1, eye: 1.4 },
    run: { ...Z, y: .15, pitch: .05, hp: .15, ear: 1.0, run: 1, curl: -.6, tailUp: .1, eye: 1.3 },
    hide: { ...Z, y: .065, pitch: 0, hp: 0, ear: .8, fold: .9, rearFold: .9, curl: -.2, tailUp: 0, eye: 1.6 },
    walk: { ...Z, y: .16, run: .4, ear: .2, curl: .1, tailUp: .8, eye: 1.1 },
    held: { ...Z, y: 0, pitch: 0, hp: -.2, ear: .3, fold: .2, rearFold: .3, curl: .6, tailUp: -.3, eye: 1 },
  };
  const H2 = Math.PI / 2;
  const path = keys([[0, [-2.0, 1.15, .69]], [T.frame + .2, [-2.0, 1.15, .69]], [T.catRun, [-1.85, .95, -2.9]], [T.catRun + .5, [-1.4, -.2, -3.3]], [T.catRun + .85, [-1.55, -1.3, -3.0]], [T.catHid, [-1.75, -1.95, -2.95]], [T.catHid + .55, [-1.75, -1.88, -6.0]],
    [T.catOut, [-1.75, -1.88, -6.0]], [T.catOut + .6, [-1.45, -1.35, -5.9]], [T.pick, [-1.25, -1.15, -5.7]]], t => t);
  const pose = poseTrack([[0, POSE.sleep], [T.wake - .1, POSE.sleep], [T.wake + .5, POSE.alert], [T.hit, POSE.alert], [T.hit + .3, POSE.crouch], [T.frame + .2, POSE.crouch], [T.catRun, POSE.run], [T.catHid - .2, POSE.run], [T.catHid + .2, POSE.hide],
    [T.catOut, POSE.hide], [T.catOut + .2, POSE.walk], [T.pick - .1, POSE.walk], [T.pick + .3, POSE.held], [40, POSE.held]]);
  function update(t, a, pp) {
    const p = { ...pose(t) }; let [x, z, h] = path(t);
    if (t >= T.pick) { const u = ss(seg(t, T.pick, T.pick + .4)); const c = pp.chest; x = lerp(x, c.x, u); z = lerp(z, c.z, u); h = lerp(h, pp.heading + H2, u); p.y = lerp(p.y, c.y - .05, u); }
    g.position.set(x, 0, z); g.rotation.y = h;
    const fear = a * .015 * Math.sin(t * 47);
    body.position.y = p.y + (p.run ? .02 * Math.abs(Math.sin(t * TAU * 4.2)) * p.run : 0); body.rotation.set(p.pitch, 0, p.roll + fear);
    headP.rotation.set(p.hp + (t > T.wake && t < T.hit ? .05 * Math.sin(t * 2.3) : 0), p.hy + (t > T.wake + .5 && t < T.hit ? .5 * Math.sin((t - T.wake) * 1.3) : 0), 0);
    ears.forEach((e, i) => e.rotation.set(-p.ear * .9, 0, (i ? -1 : 1) * p.ear * .6));
    legs.forEach((l, i) => { const front = i < 2, f = front ? p.fold : p.rearFold; const ph = t * TAU * 4.2 + (i % 2 ? Math.PI : 0) + (front ? 0 : Math.PI / 2);
      l.rotation.set((front ? -1 : 1) * f * 1.45 + p.run * .9 * Math.sin(ph) - (front ? p.pitch : 0), 0, 0); l.position.y = -.04 + f * .03; });
    tail.forEach((s, i) => s.rotation.set(i === 0 ? -p.tailUp : 0, p.curl * .55 + (i > 2 ? .15 * Math.sin(t * 2 + i) : 0), 0));
    const blink = (t > T.wake && t < T.hit && (t % 2.6) < .1) ? .1 : 1;
    eyes.forEach(e => e.scale.set(1, Math.max(.1, Math.min(p.eye, 1)) * blink, 1));
    // eyes glow in the dark (brightest in the torch beam)
    const glow = t > T.black ? 2.4 + 2.4 * ss(seg(t, T.eyes - .1, T.eyes + .2)) * (1 - ss(seg(t, T.pick, T.pick + 1))) : 1;
    eyeM.color.set('#c8e85a').multiplyScalar(glow);
    bell.rotation.z = Math.sin(t * 9) * .3;
  }
  function events(ev) {
    ev(T.wake, 'bell', { v: .5 }); ev(T.wake + .15, 'meow', { v: .0 });
    for (let k = 0; k < 7; k++) ev(T.catRun + k * .17, 'paw', { k });
    ev(T.catRun + .02, 'bell', { v: .8, jingle: 1 }); ev(T.bell, 'bell', { v: 1 }); ev(T.bell + .55, 'bell', { v: .6 });
    ev(T.catOut + .2, 'bell', { v: .7 }); ev(T.pick + .1, 'purr');
  }
  return { update, events, g };
}
