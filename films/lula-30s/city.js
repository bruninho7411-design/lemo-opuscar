// The miniature Brazilian city: one long seaside avenue (along z, camera travels toward -z), cross streets, generic blocks,
// a wave-pattern promenade, palms, a beach and the sea at the far end. Proposal sites sit on the avenue's first row of lots.
import * as THREE from 'three';
import { GB } from './geo.js';
import { mulberry, clamp } from '/core/lib.js';

export const CURB = .16;
export const U = { night: { value: 0 }, sky: { value: new THREE.Color('#8fb4d8') }, sun: { value: 1 }, lit: { value: 1 } };
export const AVW = 26;                      // avenue width (x ∈ [-13, 13]), median 4 m
export const SWK = 6;                       // promenade width
export const LOT0 = AVW / 2 + SWK;          // lots start at |x| = 19
export const BLK = 62, STW = 12;            // block pitch along z, cross-street width
export const SITE_Z = i => -31 - i * BLK;   // site centres (block centres)
export const SITE_SIDE = i => (i % 2 === 0 ? 1 : -1);
export const Z_START = 140, Z_BEACH = -700;
export const crossZ = k => -31 + BLK / 2 - k * BLK;   // cross streets at z = 0, -62, -124, …

const FACADE = ['#f2e6cf', '#f4d27a', '#e98b6d', '#7cc3b4', '#f2b6a0', '#9fc6e8', '#f6efe2', '#e9c46a', '#d97b5a', '#a8d5ba', '#f3a7b9', '#cfe3ef', '#f0dcb4', '#e2725b'];
const ROOF = ['#8b8a86', '#a09c94', '#6e6c69', '#b7b2a8', '#c2bcb0', '#9a8f80'];
const TILE = ['#b4553c', '#c26a48', '#a8543f'];
export function buildingMaterial() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .86, metalness: 0 });
  m.onBeforeCompile = sh => {
    sh.uniforms.uNight = U.night; sh.uniforms.uSky = U.sky; sh.uniforms.uLit = U.lit;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 wp; varying vec3 vWp; varying vec2 vFac; varying vec3 vWP;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvWp = wp; vFac = uv; vWP = (modelMatrix * vec4(position, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWp; varying vec2 vFac; varying vec3 vWP; uniform float uNight; uniform vec3 uSky; uniform float uLit;
      float hh(vec3 p){ p = fract(p*vec3(.1031,.1030,.0973)); p += dot(p, p.yxz+33.33); return fract((p.x+p.y)*p.z); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); float a = hh(vec3(i,1.)), b = hh(vec3(i+vec2(1,0),1.)), c = hh(vec3(i+vec2(0,1),1.)), d = hh(vec3(i+vec2(1,1),1.)); return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
      float gWin = 0.; float gLit = 0.; const float CURB_Y = ${CURB.toFixed(2)};`)
      .replace('#include <color_fragment>', `#include <color_fragment>
      { float gn = vn(vWP.xz * .7 + vWP.y * .13) * .6 + vn(vWP.xz * 3.1 - vWP.y * .9) * .4; diffuseColor.rgb *= .9 + .18 * gn; diffuseColor.rgb *= mix(.62, 1., smoothstep(CURB_Y, CURB_Y + 2.6, vWP.y)); }
      if (vFac.x >= 0. && vWp.x > 0.) {
        vec2 cs = vWp.xy; vec2 q = vFac / cs; vec2 id = floor(q); vec2 f = fract(q);
        float gf = step(vFac.y, vWp.y + ${CURB.toFixed(2)});
        float ty = floor(vWp.z / 1000.);
        float wx = .24, wy0 = .32, wy1 = .82;
        if (ty == 1.) { wx = .03; wy0 = .36; wy1 = .78; }
        else if (ty == 2.) { wx = .05; wy0 = .07; wy1 = .95; }
        else if (ty == 3.) { wx = .32; wy0 = .34; wy1 = .76; }
        if (gf > .5) { wx = .06; wy0 = .06; wy1 = .8; }
        vec2 fw = fwidth(q) * 1.2;
        float win = smoothstep(wx-fw.x, wx+fw.x, f.x) * (1.-smoothstep(1.-wx-fw.x, 1.-wx+fw.x, f.x))
                  * smoothstep(wy0-fw.y, wy0+fw.y, f.y) * (1.-smoothstep(wy1-fw.y, wy1+fw.y, f.y));
        float lod = clamp(max(fw.x, fw.y) * 2.5 - .35, 0., 1.);
        win = mix(win, (1.-2.*wx)*(wy1-wy0), lod);
        float r = hh(vec3(id, fract(vWp.z / 1000.) * 97.));
        vec3 glass = mix(vec3(.05,.07,.10), uSky * .8, .2 + .4*r);
        if (gf > .5) glass = mix(vec3(.06,.06,.07), vec3(.42,.36,.3), .35*r);
        gWin = win;
        float inY = (f.y - wy0) / (wy1 - wy0), inX = (f.x - wx) / (1. - 2.*wx);
        glass *= mix(1., .55 + .45 * smoothstep(.72, 1., 1. - inY) , 1. - lod) * mix(1., .75 + .25 * smoothstep(0., .18, inX), 1. - lod);
        float frame = win * (1. - smoothstep(0., fw.y * 2.5 + .03, min(min(inY, 1. - inY) * (wy1-wy0) * cs.y, min(inX, 1.-inX) * (1.-2.*wx) * cs.x) - .06));
        diffuseColor.rgb = mix(diffuseColor.rgb, glass, win);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.92, .91, .88), frame * (1. - lod) * .7);
        // A dark line for the parapet at the top, a string course between storeys
        float band = 1. - smoothstep(0., fw.y*2., abs(f.y - .02)) * .12 * (1.-lod);
        diffuseColor.rgb *= band;
        gLit = win * step(r, .2) * step(.55, hh(vec3(vWp.z, id.y, id.x*.37))) * (1. - lod * .6) * step(hh(vec3(id.yx, 3.3)), uLit);
      }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, floor(vWp.z / 1000.) == 2. ? .08 : .22, gWin);`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
      metalnessFactor = mix(metalnessFactor, .35, gWin);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += gLit * uNight * vec3(1.0, .72, .42) * 1.25;`);
  };
  return m;
}

// Portuguese-pavement wave pattern (black/white), as a repeated canvas texture
function waveTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#f1ede4'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#2b2b2e';
  for (let band = -1; band < 3; band++) {
    g.beginPath();
    for (let y = 0; y <= 256; y += 4) { const x = 64 + band * 128 + Math.sin(y / 256 * Math.PI * 2) * 34; y === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    for (let y = 256; y >= 0; y -= 4) { const x = 64 + band * 128 + 40 + Math.sin(y / 256 * Math.PI * 2) * 34; g.lineTo(x, y); }
    g.closePath(); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildCity(scene) {
  const R = mulberry(20261026);
  const bld = new GB(), plain = new GB(), grass = new GB();
  const trees = [], palms = [], bl = [];

  // —— Ground: asphalt base, sea, beach ——
  const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1200).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4a4d52', roughness: .95 }));
  asphalt.position.set(0, 0, -260); asphalt.receiveShadow = true; scene.add(asphalt);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(4000, 3000).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#1f8fa8', roughness: .18, metalness: .1 }));
  sea.position.set(0, -.3, Z_BEACH - 60 - 1500); scene.add(sea);
  grass.flat(-700, 700, Z_BEACH - 62, Z_BEACH - 6, .05, '#ead9b0');                          // sand
  grass.flat(-700, 700, Z_BEACH - 66, Z_BEACH - 62, .02, '#bfe3e0');                          // surf line
  // Lane markings on the avenue
  for (let z = Z_START; z > Z_BEACH; z -= 9) for (const x of [-8.5, -4.6, 4.6, 8.5]) grass.flat(x - .12, x + .12, z - 4.5, z, .03, '#f2f0e8');
  // Median with palms
  plain.box(-2, 2, 0, .25, Z_BEACH, Z_START, '#bfb9ad', '#7fae5a');
  for (let z = Z_START - 6; z > Z_BEACH + 6; z -= 14) palms.push([0, .25, z, 8 + R() * 3]);

  // Promenades with the wave pattern
  const wt = waveTex(); wt.repeat.set(1, (Z_START - Z_BEACH) / 6);
  const wm = new THREE.MeshStandardMaterial({ map: wt, roughness: .85 });
  for (const s of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(SWK, Z_START - Z_BEACH).rotateX(-Math.PI / 2), wm);
    m.position.set(s * (AVW / 2 + SWK / 2), CURB + .01, (Z_START + Z_BEACH) / 2); m.receiveShadow = true; scene.add(m);
    plain.box(s > 0 ? AVW / 2 : -AVW / 2 - SWK, s > 0 ? AVW / 2 + SWK : -AVW / 2, 0, CURB, Z_BEACH, Z_START, '#d8d3c8', '#d8d3c8');
    for (let z = Z_START - 9; z > Z_BEACH; z -= 18) trees.push([s * (AVW / 2 + SWK - 1.2), CURB, z, 4 + R() * 1.5]);
  }

  // —— Blocks ——
  const sites = [];
  function building(x0, x1, z0, z1, floors, o = {}) {
    const fh = o.fh || 3.1 + R() * .4, h = floors * fh + CURB;
    const ty = o.ty ?? (floors > 9 ? 2 : R() < .55 ? 0 : R() < .5 ? 3 : 1);
    const bay = o.bay || (ty === 2 ? 1.6 + R() * .5 : ty === 3 ? 2.6 + R() * .8 : 1.9 + R() * .9);
    const wall = o.wall || FACADE[Math.floor(R() * FACADE.length)], roof = o.roof || ROOF[Math.floor(R() * ROOF.length)];
    const B = o.gb || bld;
    B.box(x0, x1, CURB, h, z0, z1, wall, roof, { facade: true, wp: [bay, fh, ty * 1000 + R() * 97] });
    bl.push({ x0, x1, z0, z1, h });
    const P2 = o.pgb || plain;
    if (floors >= 2 && R() < .45) {   // awnings
      const AW = ['#d8412f', '#2f8a5a', '#2b6cb0', '#f2b705', '#e07b39', '#1f6b6b'][Math.floor(R() * 6)], y = CURB + fh * .95;
      P2.box(x0 + .5, x1 - .5, y, y + .35, z1, z1 + 1.4, AW); P2.box(x0 + .5, x1 - .5, y, y + .35, z0 - 1.4, z0, AW);
    }
    if (x1 - x0 > 6 && z1 - z0 > 6) {
      const w = x1 - x0, d = z1 - z0, n = 1 + Math.floor(R() * 3);
      P2.box(x0, x1, h, h + .6, z0, z0 + .3, wall); P2.box(x0, x1, h, h + .6, z1 - .3, z1, wall); P2.box(x0, x0 + .3, h, h + .6, z0, z1, wall); P2.box(x1 - .3, x1, h, h + .6, z0, z1, wall);
      for (let k = 0; k < n; k++) { const s = 1 + R() * 1.5, px = x0 + 1.2 + R() * (w - 2.4 - s), pz = z0 + 1.2 + R() * (d - 2.4 - s); P2.box(px, px + s, h, h + .8 + R() * .7, pz, pz + s, R() < .5 ? '#d9d9d6' : '#9ea3a8'); }
      if (R() < .3) { const px = x0 + 2 + R() * (w - 4), pz = z0 + 2 + R() * (d - 4); P2.cyl(px, pz, 1.1, h, h + 1.6, '#2f6fb0', 10); }   // blue water tank (very Brazilian)
      if (R() < .15) grass.box(x0 + .8, x1 - .8, h + .02, h + .12, z0 + .8, z1 - .8, '#6f9a4a', '#77a352', { noSides: true });
    }
    return h;
  }
  function fillLot(x0, x1, z0, z1, fmin, fmax) {
    let a = z0;
    while (a < z1 - 4) {
      let w = 9 + R() * 12; if (z1 - (a + w) < 8) w = z1 - a;
      const depth = Math.min(x1 - x0, 14 + R() * 10);
      const floors = fmin + Math.floor(R() * (fmax - fmin + 1));
      // street-facing rows on both long sides of the block
      building(x0, x0 + depth, a, a + w - .4, floors);
      if (x1 - x0 > depth + 12) building(x1 - Math.min(depth, x1 - x0 - depth - 6), x1, a, a + w - .4, Math.max(2, floors - 2));
      a += w;
    }
  }
  const NB = Math.floor((Z_START - Z_BEACH) / BLK) + 2;
  for (let k = -2; k < NB; k++) {
    const zc = crossZ(k);                       // street at zc, block between zc-STW/2 and zc-BLK+STW/2
    const z1 = zc - STW / 2, z0 = zc - BLK + STW / 2;
    if (z0 < Z_BEACH) continue;
    grass.flat(-700, 700, zc - STW / 2, zc + STW / 2, .015, '#45484d');
    for (const s of [-1, 1]) {
      for (let col = 0; col < 6; col++) {
        const xa = LOT0 + col * 58, xb = xa + 50;      // block depth 50, 8 m back streets
        const x0 = s > 0 ? xa : -xb, x1 = s > 0 ? xb : -xa;
        plain.box(x0, x1, 0, CURB, z0, z1, '#cfcac0', '#cfcac0');
        const siteIdx = col === 0 ? [...Array(10).keys()].find(i => SITE_SIDE(i) === s && Math.abs(SITE_Z(i) - (z0 + z1) / 2) < 1) : undefined;
        if (siteIdx !== undefined) { sites[siteIdx] = { x0, x1, z0, z1, s }; continue; }
        // beachfront row (last block before the sand) is taller: the skyline people know from seaside cities
        const front = z0 - Z_BEACH < BLK;
        if (col === 0) fillLot(x0 + (s > 0 ? 0 : 0), x1, z0 + 1, z1 - 1, front ? 9 : 3, front ? 14 : 8);
        else if (R() < .12) { grass.flat(x0 + 2, x1 - 2, z0 + 2, z1 - 2, CURB + .01, '#6fa24a'); for (let q = 0; q < 10; q++) trees.push([x0 + 5 + R() * (x1 - x0 - 10), CURB, z0 + 5 + R() * (z1 - z0 - 10), 3.5 + R() * 2]); }
        else fillLot(x0, x1, z0 + 1, z1 - 1, 2, col < 2 ? 7 : 5);
      }
    }
  }

  // —— Meshes ——
  const bm = buildingMaterial();
  const vm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 });
  for (const [g, m] of [[bld, bm], [plain, vm], [grass, vm]]) { const mesh = new THREE.Mesh(g.build(), m); mesh.castShadow = g !== grass; mesh.receiveShadow = true; scene.add(mesh); }
  addTrees(scene, trees, palms);
  return { sites, bl, building, buildingMaterial: bm, vm, FACADE };
}

export function addTrees(scene, trees, palms) {
  const n = trees.length;
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .25, 1, 6), new THREE.MeshStandardMaterial({ color: '#6b4f3a', roughness: .9 }), Math.max(1, n));
  const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ roughness: .95 }), Math.max(1, n));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  trees.forEach(([x, y, z, h], i) => {
    trunk.setMatrixAt(i, m.compose(new THREE.Vector3(x, y + h * .25, z), q, new THREE.Vector3(1, h * .5, 1)));
    crown.setMatrixAt(i, m.compose(new THREE.Vector3(x, y + h * .65, z), q, new THREE.Vector3(h * .42, h * .38, h * .42)));
    crown.setColorAt(i, c.setHSL(.27 + Math.sin(i * 12.9) * .04, .55, .3 + Math.sin(i * 7.7) * .05));
  });
  for (const o of [trunk, crown]) { o.castShadow = true; o.receiveShadow = true; scene.add(o); }
  // Palms: trunk + 7 fronds
  const np = palms.length;
  const pt = new THREE.InstancedMesh(new THREE.CylinderGeometry(.16, .26, 1, 6), new THREE.MeshStandardMaterial({ color: '#8a6e52', roughness: .9 }), Math.max(1, np));
  const fr = new THREE.InstancedMesh(new THREE.BoxGeometry(3.2, .08, .7).translate(1.6, 0, 0), new THREE.MeshStandardMaterial({ color: '#3f8a3a', roughness: .8 }), Math.max(1, np * 7));
  palms.forEach(([x, y, z, h], i) => {
    pt.setMatrixAt(i, m.compose(new THREE.Vector3(x, y + h / 2, z), q, new THREE.Vector3(1, h, 1)));
    for (let k = 0; k < 7; k++) {
      const e = new THREE.Euler(0, k / 7 * Math.PI * 2 + i, -.45, 'YXZ');
      fr.setMatrixAt(i * 7 + k, m.compose(new THREE.Vector3(x, y + h, z), new THREE.Quaternion().setFromEuler(e), new THREE.Vector3(1, 1, 1)));
    }
  });
  for (const o of [pt, fr]) { o.castShadow = true; scene.add(o); }
}
