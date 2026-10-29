// The set: a walnut desk lit like a toy-photo studio, a brick town (three laundromats, a flat with a sofa, a street),
// a real-size smartphone leaning on a book, a black brick car. Moods: night (practicals on) and morning (sun).
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { COL, PLATE, BRICK, mesh, brick, plate, brickGeo, roundGeo, plastic } from './bricks.js';

const PH = '/core/assets/polyhaven/';
export const M = 125;                 // 1 m = 125 studs
export const L1 = { x: 0, z: 0 };     // laundromat 1 front-centre (front faces +z)
export const L2 = { x: 26, z: 0 }, L3 = { x: 52, z: 0 };
export const FLAT = { x: -34, z: 0 };
export const PHONE = { x: -66, z: -4 };
export const STREET_Z = 7;

// —— printed parts ——
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const redraw = (...a) => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); draw(g, w, h, ...a); t.needsUpdate = true; };
  redraw(); return { c, g, t, redraw };
}
// a printed tile standing up (sign): w × h studs, thickness .4, print on the front face (+z)
export function signTile(w, h, color, draw, { px = 64, emissive = 0 } = {}) {
  const T = canvasTex(Math.round(w * px), Math.round(h * px), draw);
  const g = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(w, h, .4), color); body.position.y = h / 2; g.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w - .1, h - .1), new THREE.MeshPhysicalMaterial({ map: T.t, roughness: .3, clearcoat: .8, clearcoatRoughness: .08, emissive: emissive ? '#ffffff' : '#000000', emissiveMap: emissive ? T.t : null, emissiveIntensity: emissive }));
  face.position.set(0, h / 2, .205); g.add(face);
  g.userData.tex = T; return g;
}
const FONT = (wt, px) => `${wt} ${px}px Fredoka`;

// —— instanced brick walls (running bond) ——
const instCache = new Map();
function inst(geo, color, list) {
  const m = new THREE.InstancedMesh(geo, plastic(color), list.length); const o = new THREE.Object3D();
  list.forEach((p, i) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(0, p[3] || 0, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
  m.castShadow = m.receiveShadow = true; return m;
}
// wall along x from x0 to x1 at depth z, rows of 1×4 / 1×2 bricks; skip(x,y) leaves openings
function wallX(grp, x0, x1, z, rows, color, skip = () => false, y0 = 0) {
  const b4 = [], b2 = [];
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * BRICK; let x = x0 + (r % 2 ? 2 : 0);
    if (r % 2) { if (!skip(x0 + 1, r)) b2.push([x0 + 1, y, z]); }
    while (x + 4 <= x1 + 1e-6) { if (!skip(x + 2, r)) b4.push([x + 2, y, z]); x += 4; }
    if (x1 - x >= 2 - 1e-6 && !skip(x + 1, r)) b2.push([x + 1, y, z]);
  }
  if (b4.length) grp.add(inst(brickGeo(4, 1), color, b4)); if (b2.length) grp.add(inst(brickGeo(2, 1), color, b2));
}
function wallZ(grp, z0, z1, x, rows, color, y0 = 0) {
  const b4 = [], b2 = [];
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * BRICK; let z = z0 + (r % 2 ? 2 : 0);
    if (r % 2) b2.push([x, y, z0 + 1, Math.PI / 2]);
    while (z + 4 <= z1 + 1e-6) { b4.push([x, y, z + 2, Math.PI / 2]); z += 4; }
    if (z1 - z >= 2 - 1e-6) b2.push([x, y, z + 1, Math.PI / 2]);
  }
  if (b4.length) grp.add(inst(brickGeo(4, 1), color, b4)); if (b2.length) grp.add(inst(brickGeo(2, 1), color, b2));
}

// —— a washing machine (3 wide, 1 brick deep front, 3 bricks tall): returns the drum to spin ——
const CLOTH = ['#ff5fa2', '#f2cd37', '#36aebf', '#ffffff', '#c91a09', '#237841'];
function machine(grp, x, y, z, k) {
  const b = brick(3, 3, '#f4f4f1', { h: BRICK * 3 - .02, tile: true }); b.position.set(x, y, z); grp.add(b);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, .16, 12, 36), plastic(COL.lgray)); ring.position.set(x, y + 1.65, z + 1.52); grp.add(ring);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(.95, 36), new THREE.MeshPhysicalMaterial({ color: '#9fd6ff', transparent: true, opacity: .45, roughness: .05, clearcoat: 1 })); glass.position.set(x, y + 1.65, z + 1.53); grp.add(glass);
  const drum = new THREE.Group(); drum.position.set(x, y + 1.65, z + 1.2); grp.add(drum);
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(.38, 12, 8), plastic(CLOTH[(k + i * 2) % 6])); c.scale.set(1, .6, .5); const a = i * 2.1; c.position.set(Math.cos(a) * .45, Math.sin(a) * .45, 0); drum.add(c); }
  const back = new THREE.Mesh(new THREE.CircleGeometry(.95, 24), new THREE.MeshStandardMaterial({ color: '#2a3340', roughness: .6 })); back.position.set(x, y + 1.65, z + .9); grp.add(back);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.6, .45, .05), plastic('#d7dde2')); panel.position.set(x, y + 3.1, z + 1.52); grp.add(panel);
  const led = new THREE.Mesh(new THREE.BoxGeometry(.5, .18, .06), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#4bff7a', emissiveIntensity: 2.2 })); led.position.set(x + .7, y + 3.1, z + 1.55); grp.add(led);
  return drum;
}

// —— a laundromat: 18 × 12 studs, front open glass, sign, 6 washers + 6 dryers stacked (12 machines) ——
export function laundromat(n, { accent = '#36aebf', name = null } = {}) {
  const g = new THREE.Group(), front = new THREE.Group(); g.add(front);
  const fl = plate(18, 12, '#e9e6dc', { tile: true }); fl.position.set(0, 0, -6); g.add(fl);
  wallX(g, -9, 9, -11.5, 9, '#f4f4f1');
  wallZ(g, -11, 0, -8.5, 9, '#f4f4f1'); wallZ(g, -11, 0, 8.5, 9, '#f4f4f1');
  const stripe = (x, z, w, d) => { const s = brick(w, d, accent, { tile: true }); s.position.set(x, 9 * BRICK, z); g.add(s); };
  stripe(0, -11.5, 18, 1); stripe(-8.5, -5.5, 1, 11); stripe(8.5, -5.5, 1, 11);
  const roof = plate(18, 12, '#6c6e68', { tile: true }); roof.position.set(0, 10 * BRICK, -6); g.add(roof);
  // ceiling light strips (emissive) + interior light
  for (const x of [-5, 0, 5]) { const l = new THREE.Mesh(new THREE.BoxGeometry(3, .1, 8), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#f4fbff', emissiveIntensity: 2.4 })); l.position.set(x, 10 * BRICK - .06, -6); g.add(l); }
  const drums = [];
  for (let i = 0; i < 6; i++) { const x = -7.5 + i * 3; drums.push(machine(g, x, 0, -10.5, i)); drums.push(machine(g, x, BRICK * 3, -10.5, i + 3)); }
  // folding table
  const tb = plate(8, 3, '#e4cd9e'); tb.position.set(0, BRICK * 2.4, -4); g.add(tb);
  for (const x of [-3.5, 3.5]) { const lg = mesh(roundGeo(.5, BRICK * 2.4), COL.lgray); lg.position.set(x, 0, -4); g.add(lg); }
  for (let i = 0; i < 3; i++) { const t = plate(2, 2, CLOTH[i + 1], { tile: true }); t.position.set(-2 + i * .2, BRICK * 2.4 + PLATE + i * PLATE, -4); t.rotation.y = i * .2; g.add(t); }
  // front: low brick, glass panels, door frame, sign band
  wallX(front, -9, 9, -.5, 1, '#f4f4f1');
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#cfe8ff', transparent: true, opacity: .22, roughness: .03, clearcoat: 1, side: THREE.DoubleSide });
  const gl = new THREE.Mesh(new THREE.BoxGeometry(17.6, 7.2, .2), glassMat); gl.position.set(0, BRICK + 3.6, -.5); front.add(gl);
  for (const x of [-9, -3, 3, 9]) { const f = brick(1, 1, COL.dgray, { h: 7.2, tile: true }); f.position.set(x === -9 ? -8.5 : x === 9 ? 8.5 : x, BRICK, -.5); front.add(f); }
  const band = brick(18, 1, accent, { h: BRICK * 2, tile: true }); band.position.set(0, BRICK * 7, -.5); front.add(band);
  const sign = signTile(14, 1.9, '#f4f4f1', (c, w, h) => {
    c.fillStyle = '#f4f4f1'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b2a34'; c.font = FONT(700, h * .62); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(name ?? `LAVANDERIA ${n}`, w / 2, h * .54);
  });
  sign.position.set(0, BRICK * 7 + .25, .05); front.add(sign);
  // light inside (night only; scaled by mood)
  const inside = new THREE.PointLight('#f2f8ff', 0, 40, 1.6); inside.position.set(0, 9, -5); g.add(inside);
  g.traverse(o => { if (o.isMesh && !o.material.transparent) { o.castShadow = o.receiveShadow = true; } });
  return { g, front, drums, inside, sign };
}

// —— the flat: floor, back wall with a window, sofa, coffee table, lamp, a small brick phone ——
function flat() {
  const g = new THREE.Group();
  const fl = plate(18, 12, '#b8916a', { tile: true }); fl.position.set(0, 0, -6); g.add(fl);
  wallX(g, -9, 9, -11.5, 8, '#e4cd9e', (x, r) => r >= 3 && r < 7 && Math.abs(x - 3) < 3.1);
  wallZ(g, -11, -3, -8.5, 8, '#e4cd9e');
  const win = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.8), new THREE.MeshStandardMaterial({ color: '#16224a', emissive: '#1b2b66', emissiveIntensity: .6 })); win.position.set(3, BRICK * 5, -11.6); g.add(win);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(.6, 24), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff8e0', emissiveIntensity: 1.5 })); moon.position.set(4.6, BRICK * 6.2, -11.55); g.add(moon);
  // sofa
  const S = '#a57850';
  const seat = brick(10, 4, S, { h: BRICK * 1.5, tile: true }); seat.position.set(-1, 0, -8); g.add(seat);
  const cush = plate(8, 4, '#c08d60', { tile: true }); cush.position.set(-1, BRICK * 1.5, -8); g.add(cush);
  const bk = brick(10, 1.4, S, { h: BRICK * 3.6, tile: true }); bk.position.set(-1, 0, -10.2); g.add(bk);
  for (const x of [-5.5, 3.5]) { const a = brick(1, 4, S, { h: BRICK * 2.4, tile: true }); a.position.set(x, 0, -8); g.add(a); }
  // coffee table + brick phone on it
  const tt = plate(5, 3, '#6e4b32'); tt.position.set(-1, BRICK * 1.6, -2.5); g.add(tt);
  for (const [x, z] of [[-3, -3.5], [1, -3.5], [-3, -1.5], [1, -1.5]]) { const l = mesh(roundGeo(.3, BRICK * 1.6), '#5a3d28'); l.position.set(x, 0, z); g.add(l); }
  const ph = plate(1, 2, '#1b1f27', { tile: true }); ph.position.set(.2, BRICK * 1.6 + PLATE, -2.6); ph.rotation.y = .3; g.add(ph);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.7), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffd36a', emissiveIntensity: 0 })); scr.rotation.set(-Math.PI / 2, 0, .3); scr.position.set(.2, BRICK * 1.6 + PLATE * 2 + .01, -2.6); g.add(scr);
  // lamp
  const lp = mesh(roundGeo(.5, BRICK * 5), COL.black); lp.position.set(6.5, 0, -9); g.add(lp);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.4, 1.6, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#f2cd37', emissive: '#ffcf70', emissiveIntensity: 1.2, side: THREE.DoubleSide })); shade.position.set(6.5, BRICK * 5 + .6, -9); g.add(shade);
  const bulb = new THREE.PointLight('#ffc98a', 0, 30, 1.8); bulb.position.set(6.5, BRICK * 5, -8); g.add(bulb);
  g.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
  return { g, phoneScreen: scr, bulb, win };
}

// —— black brick car: 4 wide, 8 long, faces +x ——
function car() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const ch = plate(8, 4, '#2b2c30'); ch.position.y = .9; body.add(ch);
  const lo = brick(8, 4, '#15171c', { tile: true }); lo.position.y = .9 + PLATE; body.add(lo);
  const cab = brick(4, 4, '#15171c', { tile: true }); cab.position.set(-.5, .9 + PLATE + BRICK, 0); body.add(cab);
  const roof = plate(4, 4, '#15171c', { tile: true }); roof.position.set(-.5, .9 + PLATE + BRICK * 2, 0); body.add(roof);
  const tint = new THREE.MeshPhysicalMaterial({ color: '#0a0d14', roughness: .05, clearcoat: 1, metalness: .2 });
  for (const sz of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(3.4, .9, .05), tint); w.position.set(-.5, .9 + PLATE + BRICK * 1.5, sz * 2.01); body.add(w); }
  const ws = new THREE.Mesh(new THREE.BoxGeometry(.05, .9, 3.4), tint); ws.position.set(1.51, .9 + PLATE + BRICK * 1.5, 0); body.add(ws);
  for (const sz of [-1.4, 1.4]) { const hl = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .1, 16), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff4d0', emissiveIntensity: 1.6 })); hl.rotation.z = Math.PI / 2; hl.position.set(4.02, .9 + PLATE + .6, sz); body.add(hl); }
  for (const sz of [-1.4, 1.4]) { const tl = new THREE.Mesh(new THREE.BoxGeometry(.1, .3, .6), new THREE.MeshStandardMaterial({ color: '#600', emissive: '#ff2020', emissiveIntensity: 1 })); tl.position.set(-4.02, .9 + PLATE + .6, sz); body.add(tl); }
  const wheels = [];
  for (const x of [-2.6, 2.6]) for (const z of [-2.1, 2.1]) {
    const w = new THREE.Group(); w.position.set(x, .9, z); g.add(w);
    const tyre = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .7, 28), new THREE.MeshStandardMaterial({ color: '#141414', roughness: .8 })); tyre.rotation.x = Math.PI / 2; w.add(tyre);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .74, 16), plastic(COL.lgray)); hub.rotation.x = Math.PI / 2; w.add(hub);
    wheels.push(w);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  return { g, body, wheels };
}

// —— a brick street lamp ——
function streetLamp(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const p = mesh(roundGeo(.5, BRICK * 9), COL.dgray); g.add(p);
  const arm = plate(1, 3, COL.dgray, { tile: true }); arm.position.set(0, BRICK * 9, -1); g.add(arm);
  const bulb = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .4, 16), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffd28a', emissiveIntensity: 0 })); bulb.position.set(0, BRICK * 9 - .2, -2); g.add(bulb);
  g.userData.bulb = bulb; return g;
}

export async function buildWorld(scene) {
  const hdr = await new RGBELoader().loadAsync(PH + 'photo_studio_loft_hall_2k.hdr');
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr; scene.background = hdr;
  scene.backgroundBlurriness = .5; scene.environmentRotation.y = scene.backgroundRotation.y = 1.2;
  const tl = new THREE.TextureLoader(), tex = (f, srgb) => { const t = tl.load(PH + f); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshStandardMaterial({ map: tex('walnut_diff.jpg', true), normalMap: tex('walnut_nor.jpg'), roughnessMap: tex('walnut_rough.jpg'), roughness: 1 }));
  desk.rotation.x = -Math.PI / 2; desk.position.set(0, -.01, -60); desk.receiveShadow = true; scene.add(desk);

  // lights
  const key = new THREE.DirectionalLight('#fff4e8', 3.0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -.0004; key.shadow.normalBias = .03; key.shadow.radius = 4; Object.assign(key.shadow.camera, { near: 10, far: 400 }); scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#cfe0ff', .45); fill.position.set(60, 40, -50); scene.add(fill);
  RectAreaLightUniformsLib.init();
  const box = (col, I, w, h, p, at) => { const l = new THREE.RectAreaLight(col, I, w, h); l.position.set(...p); l.lookAt(...at); scene.add(l); return l; };
  const softKey = box('#fff6ee', 5, 80, 50, [-40, 60, 70], [0, 4, 0]);
  const softRim = box('#e4eeff', 7, 70, 30, [40, 45, -75], [0, 6, 0]);

  // town
  const street = new THREE.Mesh(brickGeo(130, 12, .3, { tile: true }), new THREE.MeshPhysicalMaterial({ color: '#4a4d52', roughness: .7, clearcoat: .1 }));
  street.position.set(-6, 0, STREET_Z + 2); street.receiveShadow = true; scene.add(street);
  for (let i = 0; i < 26; i++) { const d = plate(2, .5, '#f2cd37', { tile: true }); d.position.set(-68 + i * 5, .3, STREET_Z + 2); scene.add(d); }
  const walk = new THREE.Mesh(brickGeo(130, 3, .7, { tile: true }), new THREE.MeshPhysicalMaterial({ color: '#a0a5a9', roughness: .6, clearcoat: .1 }));
  walk.position.set(-6, 0, 1.5); walk.receiveShadow = true; scene.add(walk);
  const L = [laundromat(1), laundromat(2, { accent: '#c91a09' }), laundromat(3, { accent: '#237841' })];
  [L1, L2, L3].forEach((p, i) => { L[i].g.position.set(p.x, 0, p.z); scene.add(L[i].g); });
  const F = flat(); F.g.position.set(FLAT.x, 0, FLAT.z); scene.add(F.g);
  const lamps = [-20, 13, 39, 64].map(x => { const l = streetLamp(x, 2.4); scene.add(l); return l; });
  const lampLights = [new THREE.PointLight('#ffcf8a', 0, 26, 1.7), new THREE.PointLight('#ffcf8a', 0, 26, 1.7)];
  lampLights[0].position.set(13, BRICK * 8, .4); lampLights[1].position.set(-20, BRICK * 8, .4); scene.add(...lampLights);
  const CAR = car(); scene.add(CAR.g);
  // patrimônio billboard on laundromat 1's roof
  const bill = signTile(12, 3.2, '#1b2a34', (c, w, h) => {
    c.fillStyle = '#1b2a34'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#f2cd37'; c.font = FONT(600, h * .22); c.fillText('PATRIMÔNIO', w / 2, h * .24);
    c.fillStyle = '#ffffff'; c.font = FONT(700, h * .48); c.fillText('R$ 1.000.000', w / 2, h * .64);
  }, { emissive: .35 });
  bill.position.set(L1.x, 10 * BRICK + PLATE, L1.z - 6); scene.add(bill);

  // the real smartphone, leaning on a book
  const phone = new THREE.Group(); phone.position.set(PHONE.x, 0, PHONE.z); phone.rotation.y = .38; scene.add(phone);
  const book = new THREE.Mesh(new THREE.BoxGeometry(30, 4.5, 22), new THREE.MeshStandardMaterial({ color: '#274b6d', roughness: .75 })); book.position.set(0, 2.25, -9); phone.add(book);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(29.4, 3.8, 21.6), new THREE.MeshStandardMaterial({ color: '#efe6d2', roughness: .9 })); pages.position.set(.4, 2.25, -9); phone.add(pages);
  const tilt = new THREE.Group(); tilt.position.z = 3.6; tilt.rotation.x = -.2; phone.add(tilt);   // leans back on the book
  const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
  const shell = new THREE.Mesh(new RoundedBoxGeometry(9.6, 20, .95, 6, .9), new THREE.MeshPhysicalMaterial({ color: '#16171b', roughness: .25, metalness: .4, clearcoat: 1, clearcoatRoughness: .05 }));
  shell.position.set(0, 10, 0); tilt.add(shell);
  const SCR = canvasTex(540, 1140, () => { });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 19.0), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffffff', emissiveMap: SCR.t, emissiveIntensity: 1.0, roughness: .15 }));
  screen.position.set(0, 10, .49); tilt.add(screen);
  phone.traverse(o => { if (o.isMesh && o !== screen) o.castShadow = o.receiveShadow = true; });
  const screenW = new THREE.Vector3(); screen.getWorldPosition(screenW);

  // real props: tea cup (background landscape) and the desk lamp
  const gl = new GLTFLoader(), load = async n => (await gl.loadAsync(`${PH}${n}/${n}.gltf`)).scene;
  const lampM = await load('desk_lamp_arm_01'); lampM.scale.setScalar(M); lampM.position.set(95, 0, -70); lampM.rotation.y = -1.1; scene.add(lampM);
  const tea = await load('tea_set_01'); const keep = { tea_set_01_cup_small_01: [0, 0], tea_set_01_saucer_circular_04: [0, 0] }; const dead = [];
  tea.traverse(o => { if (!o.name.startsWith('tea_set_01_')) return; if (!keep[o.name]) dead.push(o); else o.position.set(0, o.position.y + (o.name.includes('cup') ? .012 : 0), 0); });
  dead.forEach(o => o.parent.remove(o)); tea.scale.setScalar(M); tea.position.set(-28, 0, -48); scene.add(tea);
  for (const o of [lampM, tea]) o.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; });

  // moods
  function mood(name, k = 1) {
    const night = name === 'night';
    scene.environmentIntensity = night ? .07 : name === 'morning' ? .55 : .45;
    scene.backgroundIntensity = night ? .025 : name === 'morning' ? .28 : .22;
    key.color.set(night ? '#8fa8ff' : name === 'morning' ? '#ffe2b8' : '#fff4e8'); key.intensity = night ? .55 : name === 'morning' ? 3.6 : 3.0;
    fill.intensity = night ? .12 : .45; softKey.intensity = night ? .6 : 5; softRim.intensity = night ? 2.2 : 7;
    const pr = night ? 1 : 0;
    L.forEach(l => l.inside.intensity = pr * 110);
    F.bulb.intensity = pr * 60; lampLights.forEach(l => l.intensity = pr * 70);
    lamps.forEach(l => l.userData.bulb.material.emissiveIntensity = pr * 3);
    return night;
  }
  function aimKey(focus, span, dir = [-60, 110, 50]) {
    key.target.position.copy(focus); key.position.copy(focus).add(new THREE.Vector3(...dir)); key.target.updateMatrixWorld();
    Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span }); key.shadow.camera.updateProjectionMatrix();
  }
  return { L, F, CAR, phone, SCR, screenW, bill, mood, aimKey, key, softRim };
}
