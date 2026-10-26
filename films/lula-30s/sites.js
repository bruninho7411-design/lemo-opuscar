// The ten proposal sites. Each builds a "before" and an "after" set on its lot and animates its own tiny actors.
// update(s, w, k): s = source time, w = world (time-lapse) time, k = seconds since its pop (negative before).
import * as THREE from 'three';
import { GB } from './geo.js';
import { CURB, AVW } from './city.js';
import { clamp, lerp, back, eo, ss, mulberry, hash } from '/core/lib.js';

// —— Signs: canvas text on a board, leaning back toward the high camera ——
export function signTex(lines, o = {}) {
  const W = o.W || 1024, H = o.H || 512, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const r = H * .12;
  g.fillStyle = o.edge || '#ffffff'; g.beginPath(); g.roundRect(0, 0, W, H, r); g.fill();
  g.fillStyle = o.bg || '#0b6e3a'; g.beginPath(); g.roundRect(H * .05, H * .05, W - H * .1, H - H * .1, r * .8); g.fill();
  g.fillStyle = o.fg || '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const n = lines.length, fs = o.fs || Math.min(H * .78 / n, W * 1.6 / Math.max(...lines.map(l => l.length)));
  g.font = `900 ${fs}px Overpass`;
  lines.forEach((l, i) => g.fillText(l, W / 2, H / 2 + (i - (n - 1) / 2) * fs * 1.02 + fs * .08));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export function signMesh(lines, w, h, o = {}) {
  const tex = signTex(lines, { ...o, H: 512, W: Math.round(512 * w / h) });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: o.glow ?? .45, roughness: .5, side: THREE.DoubleSide }));
  m.castShadow = true;
  const legs = new THREE.Mesh(new THREE.BoxGeometry(w * .8, h * .5, .3), new THREE.MeshStandardMaterial({ color: '#5a5f66' })); legs.position.set(0, -h * .5, -.4);
  const grp = new THREE.Group(); const tilt = new THREE.Group(); tilt.add(m, legs); tilt.rotation.x = o.lean ?? -.55; grp.add(tilt);
  grp.userData.tex = tex; grp.userData.mesh = m;
  return grp;
}

// —— Shared actors: one instanced pool each, filled per frame ——
export class Pool {
  constructor(scene, geo, mat, cap, shadow = true) {
    this.m = new THREE.InstancedMesh(geo, mat, cap); this.m.castShadow = shadow; this.m.receiveShadow = false; this.m.frustumCulled = false;
    this.cap = cap; this.n = 0; this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._s = new THREE.Vector3(); this._p = new THREE.Vector3(); this._c = new THREE.Color();
    this.m.setColorAt(0, this._c.set('#fff')); scene.add(this.m);
  }
  begin() { this.n = 0; }
  add(x, y, z, col, sx = 1, sy = 1, sz = 1, ry = 0, rx = 0) {
    if (this.n >= this.cap) return;
    this._e.set(rx, ry, 0, 'YXZ'); this._q.setFromEuler(this._e);
    this.m.setMatrixAt(this.n, this._m.compose(this._p.set(x, y, z), this._q, this._s.set(sx, sy, sz)));
    this.m.setColorAt(this.n, this._c.set(col)); this.n++;
  }
  end() { this.m.count = this.n; this.m.instanceMatrix.needsUpdate = true; if (this.m.instanceColor) this.m.instanceColor.needsUpdate = true; }
}

const REPLACE = new Set([2, 3, 4, 7, 9]);
const popK = (k, d = .55) => k <= 0 ? 0 : back(clamp(k / d), 2.2);       // pop-up with overshoot
const step12 = k => Math.floor(k * 12) / 12;                              // toy-like 12 Hz pops
const GREY = ['#8d8f94', '#7b7e84', '#9a9ca1', '#6f7278'];
const SHIRT = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#457b9d', '#ff6fa8', '#8ac926', '#ffffff', '#ffca3a', '#6a4c93', '#1982c4', '#ff924c'];

export function buildSites(scene, city, people, coins) {
  const out = [];
  const vm = city.vm, bmat = city.buildingMaterial;
  const mk = (gb, mat = vm, shadow = true) => { const m = new THREE.Mesh(gb.build(), mat); m.castShadow = shadow; m.receiveShadow = true; return m; };

  city.sites.forEach((L, i) => {
    const s = L.s, ax = s > 0 ? L.x0 : L.x1;               // avenue-side edge
    const X = u => ax + s * u, Z = v => L.z1 - v;          // lot coords: u from the avenue inward, v from the near (+z) edge
    const R = mulberry(777 + i * 31);
    const before = new THREE.Group(), after = new THREE.Group(); scene.add(before, after);
    const anchor = new THREE.Vector3(X(25), 0, Z(25));
    const site = { i, L, X, Z, before, after, anchor, focus: anchor.clone(), items: [] };
    // Pop-able parts of "after": each its own pivot on the ground so it grows from the ground up
    const part = (obj, delay = 0, pivot = null) => { const g = new THREE.Group(); const p = pivot || new THREE.Vector3(); g.position.copy(p); obj.position.sub(p); g.add(obj); after.add(g); site.items.push({ g, delay }); return g; };
    const B = (x0u, x1u, z0v, z1v) => [Math.min(X(x0u), X(x1u)), Math.max(X(x0u), X(x1u)), Math.min(Z(z0v), Z(z1v)), Math.max(Z(z0v), Z(z1v))];
    const dirt = (gb) => { const [a, b, c, d] = B(1, 49, 1, 49); gb.flat(a, b, c, d, CURB + .02, '#a88b64'); };
    const fence = (gb) => { const [a, b, c, d] = B(.5, 49.5, .5, 49.5); for (const [x0, x1, z0, z1] of [[a, b, c, c + .2], [a, b, d - .2, d], [a, a + .2, c, d], [b - .2, b, c, d]]) gb.box(x0, x1, CURB, CURB + 1.6, z0, z1, '#c9ccd1'); };
    const bldg = (gbB, gbP, u0, u1, v0, v1, floors, o) => { const [a, b, c, d] = B(u0, u1, v0, v1); return city.building(a, b, c, d, floors, { gb: gbB, pgb: gbP, ...o }); };
    const sign = (lines, w, h, u, v, y, o = {}) => { w *= 1.45; h *= 1.45; const g = signMesh(lines, w, h, o); g.position.set(X(u), y + h * .5 + .6, Z(v)); return g; };
    const crowdSpots = (n, u0, u1, v0, v1) => Array.from({ length: n }, (_, k) => ({ u: lerp(u0, u1, R()), v: lerp(v0, v1, R()), c: SHIRT[Math.floor(R() * SHIRT.length)], ph: R() * 6.28, sp: .5 + R() }));

    switch (i) {
      case 0: { // fim da 6×1 → factory lets people out to a park
        const gb = new GB(), gp = new GB();
        const fh = bldg(gb, gp, 22, 48, 4, 46, 3, { wall: '#9fb0bf', roof: '#7d8790', ty: 3 });
        for (let k = 0; k < 5; k++) { const [a, b, c, d] = B(23, 47, 5 + k * 8, 13 + k * 8); gp.gable(a, b, c, d, fh + .6, 2.4, '#b8c0c8', '#9fb0bf', true); }
        { const [a, , c] = B(44, 46, 40, 42); gp.cyl(a + s, c + 1, 1.1, fh, fh + 14, '#b44a3a', 12); }
        before.add(mk(gb, bmat)); before.add(mk(gp));
        const db = new GB(); dirt(db); before.add(mk(db, vm, false));
        const pk = new GB(); { const [a, b, c, d] = B(2, 20, 3, 47); pk.flat(a, b, c, d, CURB + .04, '#5fae4a'); pk.disc((a + b) / 2, (c + d) / 2, 5, 9, CURB + .06, '#4fa3c7'); }
        part(mk(pk, vm, false), 0, new THREE.Vector3(X(11), 0, Z(25)));
        for (let k = 0; k < 7; k++) { const tg = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 1), new THREE.MeshStandardMaterial({ color: '#3f9a3a', roughness: .9 })); tg.position.set(X(4 + (k % 2) * 13), CURB + 3.6, Z(6 + k * 6)); tg.castShadow = true; part(tg, .1 + k * .04, new THREE.Vector3(tg.position.x, 0, tg.position.z)); }
        const cal0 = sign(['6×1'], 12, 6, 35, 18, fh + 3, { bg: '#c0392b' }); before.add(cal0);
        const cal1 = sign(['5×2'], 12, 6, 35, 18, fh + 3, { bg: '#0b6e3a' }); part(cal1, 0, cal1.position.clone().setY(fh + 3));
        site.focus.set(X(20), 4, Z(24));
        const crowd = crowdSpots(70, 3, 19, 4, 46);
        site.update = (s0, w, k) => {
          for (const [j, p] of crowd.entries()) {
            const go = clamp((k - .15 - j * .006) / .9);               // out of the factory door (u=22, v=25) to the park
            if (go <= 0 && k < 0) continue;
            const x = lerp(X(22), X(p.u), eo(go)), z = lerp(Z(25), Z(p.v), eo(go));
            const hop = Math.abs(Math.sin(w * .9 + p.ph)) * .25 * (go >= 1 ? 1 : 0);
            people.add(x, CURB + .55 + hop, z, p.c);
          }
        };
        break;
      }
      case 1: { // IR zero até 5 mil → bank tower sign + coins out of rooftops
        const gb = new GB(), gp = new GB();
        const h = bldg(gb, gp, 8, 32, 12, 38, 14, { wall: '#9fb3c8', ty: 2, fh: 3.4 });
        bldg(gb, gp, 34, 48, 4, 46, 4, {});
        before.add(mk(gb, bmat), mk(gp));
        const sg = sign(['IR  R$ 0', 'ATÉ R$ 5 MIL'], 16, 8, 20, 25, h); part(sg, 0, sg.position.clone().setY(h));
        site.focus.set(X(20), h * .8, Z(25));
        const src = Array.from({ length: 60 }, () => { const b = city.bl[Math.floor(R() * city.bl.length)]; return b; }).filter(b => Math.abs((b.z0 + b.z1) / 2 - L.z0 - 25) < 120).slice(0, 36);
        site.update = (s0, w, k) => {
          if (k < 0) return;
          src.forEach((b, j) => {
            const kk = (k - j * .03) % 1.6; if (kk < 0 || k > 6) return;
            const x = (b.x0 + b.x1) / 2, z = (b.z0 + b.z1) / 2, y = b.h + 1 + 22 * Math.sin(Math.PI * clamp(kk / 1.4));
            coins.add(x, y, z, '#f5c518', 1, 1, 1, w * 3 + j, Math.PI / 2);
          });
        };
        break;
      }
      case 2: { // cesta básica sem imposto + cashback → market + coins flying back to homes
        const db = new GB(); dirt(db); fence(db); before.add(mk(db, vm, false));
        const pv = new GB(); { const [a, b, c, d] = B(1, 49, 1, 49); pv.flat(a, b, c, d, CURB + .03, '#d9cdb5'); } part(mk(pv, vm, false), 0, new THREE.Vector3(X(25), 0, Z(25)));
        const AWN = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#457b9d', '#ff6fa8', '#8ac926', '#ffca3a'];
        let q = 0;
        for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 3; c2++) {
          const g = new GB(), u = 6 + c2 * 14, v = 8 + r * 10;
          const [a, b, c, d] = B(u, u + 9, v, v + 5);
          g.box(a, b, CURB, CURB + 1.1, c, d, '#c8a27a', '#e9d9b8');
          g.gable(a - .4, b + .4, c - .4, d + .4, CURB + 2.6, 1.0, AWN[q % AWN.length], '#f6efe2', true);
          for (const x of [a, b - .15]) for (const z of [c, d - .15]) g.box(x, x + .15, CURB, CURB + 2.6, z, z + .15, '#ececec');
          part(mk(g), .04 * q, new THREE.Vector3((a + b) / 2, 0, (c + d) / 2)); q++;
        }
        const sg = sign(['CESTA BÁSICA', 'SEM IMPOSTO'], 16, 7, 25, 47, CURB + 2); part(sg, .2, sg.position.clone().setY(0));
        site.focus.set(X(25), 2, Z(28));
        const crowd = crowdSpots(45, 4, 46, 6, 46);
        const homes = city.bl.filter(b => Math.abs((b.z0 + b.z1) / 2 - (L.z0 + L.z1) / 2) < 110 && Math.abs((b.x0 + b.x1) / 2 - X(25)) < 120).slice(0, 30);
        site.update = (s0, w, k) => {
          if (k < 0) return;
          for (const [j, p] of crowd.entries()) { if (k < .3 + j * .01) continue; people.add(X(p.u) + Math.sin(w * .3 + p.ph) * 1.5, CURB + .55, Z(p.v), p.c); }
          homes.forEach((b, j) => {
            const kk = (k - .3 - j * .05) % 1.4; if (kk < 0 || k > 6.5) return;
            const u = clamp(kk / 1.1), x0 = X(6 + (j % 3) * 14), z0 = Z(10 + (j % 4) * 10), x1 = (b.x0 + b.x1) / 2, z1 = (b.z0 + b.z1) / 2;
            coins.add(lerp(x0, x1, u), lerp(4, b.h + 2, u) + 18 * Math.sin(Math.PI * u), lerp(z0, z1, u), '#f5c518', 1, 1, 1, w * 2 + j, Math.PI / 2);
          });
        };
        break;
      }
      case 3: { // creche + escola em tempo integral
        const db = new GB(); dirt(db); fence(db); before.add(mk(db, vm, false));
        const g1 = new GB(), p1 = new GB(); const h1 = bldg(g1, p1, 4, 22, 4, 24, 2, { wall: '#f7c6d9', roof: '#f7c6d9', ty: 0 });
        { const [a, b, c, d] = B(4, 22, 4, 24); p1.gable(a, b, c, d, h1, 3, '#e8487a', '#f7c6d9', false); }
        part(mk(g1, bmat), 0, new THREE.Vector3(X(13), 0, Z(14))); part(mk(p1), 0, new THREE.Vector3(X(13), 0, Z(14)));
        const g2 = new GB(), p2 = new GB(); const h2 = bldg(g2, p2, 26, 48, 4, 44, 3, { wall: '#ffd45c', roof: '#7b8a94', ty: 3 });
        part(mk(g2, bmat), .12, new THREE.Vector3(X(37), 0, Z(24))); part(mk(p2), .12, new THREE.Vector3(X(37), 0, Z(24)));
        const pg = new GB(); { const [a, b, c, d] = B(4, 22, 28, 46); pg.flat(a, b, c, d, CURB + .04, '#3d8fd6'); for (let k = 0; k < 4; k++) { const [x0, x1, z0, z1] = B(6 + k * 4, 8 + k * 4, 32, 40); pg.box(x0, x1, CURB, CURB + 1.4 + k * .3, z0, z1, ['#ff4d4d', '#ffd23f', '#3ddc97', '#ff7ab6'][k]); } }
        part(mk(pg), .2, new THREE.Vector3(X(13), 0, Z(37)));
        const sa = sign(['CRECHE'], 10, 4, 13, 14, h1 + 3, { bg: '#e8487a' }); part(sa, .1, sa.position.clone().setY(h1));
        const sb = sign(['ESCOLA', 'INTEGRAL 7H'], 13, 7, 37, 22, h2, { bg: '#1f5fbf' }); part(sb, .2, sb.position.clone().setY(h2));
        site.focus.set(X(24), 4, Z(24));
        const kids = Array.from({ length: 36 }, (_, j) => ({ c: SHIRT[j % SHIRT.length], j }));
        site.update = (s0, w, k) => {
          if (k < .3) return;
          for (const p of kids) {
            const u = clamp((k - .3 - p.j * .035) / 1.2); if (u <= 0) continue;
            const x = lerp(X(-2), X(24), eo(u)), z = Z(4 + (p.j % 12) * 3.2) + (p.j / 12 | 0) * 1.4;
            people.add(x, CURB + .38 + Math.abs(Math.sin(w * 2 + p.j)) * .2, z, p.c, .65, .65, .65);
          }
        };
        break;
      }
      case 4: { // Pé-de-Meia + Institutos Federais
        const db = new GB(); dirt(db); fence(db); before.add(mk(db, vm, false));
        const lawn = new GB(); { const [a, b, c, d] = B(1, 49, 1, 49); lawn.flat(a, b, c, d, CURB + .03, '#62b04f'); } part(mk(lawn, vm, false), 0, new THREE.Vector3(X(25), 0, Z(25)));
        const gb = new GB(), gp = new GB(); const h = bldg(gb, gp, 14, 48, 6, 30, 4, { wall: '#c96f4e', roof: '#8b8a86', ty: 3 });
        part(mk(gb, bmat), .08, new THREE.Vector3(X(31), 0, Z(18))); part(mk(gp), .08, new THREE.Vector3(X(31), 0, Z(18)));
        const sg = sign(['INSTITUTO', 'FEDERAL'], 15, 7, 31, 16, h, { bg: '#0b6e3a' }); part(sg, .16, sg.position.clone().setY(h));
        site.focus.set(X(24), 3, Z(28));
        const st = crowdSpots(34, 6, 44, 33, 47);
        site.update = (s0, w, k) => {
          if (k < .25) return;
          for (const [j, p] of st.entries()) {
            const gold = k > .6 + j * .03;
            people.add(X(p.u) + Math.sin(w * .4 + p.ph), CURB + .55, Z(p.v), gold ? '#ffcc00' : p.c);
            const kk = k - (.6 + j * .03);
            if (kk > 0 && kk < .7) coins.add(X(p.u) + Math.sin(w * .4 + p.ph), CURB + 2 + kk * 3, Z(p.v), '#f5c518', .7, .7, .7, w * 3, Math.PI / 2);
          }
        };
        break;
      }
      case 5: { // Mais Médicos, especialistas, fila do SUS
        const gb = new GB(), gp = new GB(); const h = bldg(gb, gp, 10, 44, 8, 40, 4, { wall: '#f4f6f8', roof: '#b7b2a8', ty: 1 });
        before.add(mk(gb, bmat), mk(gp));
        const s1 = sign(['SUS'], 9, 4.5, 22, 14, h, { bg: '#1f5fbf' }); before.add(s1);
        const s2 = sign(['MAIS MÉDICOS'], 14, 4.5, 24, 34, h + .6, { bg: '#0b6e3a' }); part(s2, 0, s2.position.clone().setY(h));
        site.focus.set(X(17), 3, Z(26));
        const Q = 46;
        site.update = (s0, w, k) => {
          // the queue: grey people along the promenade, shrinking into the door after the pop
          const gone = k < 0 ? 0 : Math.floor(clamp(k / 2.2) * Q);
          for (let j = gone; j < Q; j++) { const v = 24 + (j - gone) * 1.25; people.add(X(-2.5) + Math.sin(j * 3.1) * .25, CURB + .55, Z(v) + (v > 50 ? 0 : 0), GREY[j % 4]); }
          // a bus of doctors pulls in, doctors walk in
          if (k > 0) {
            const bz = Z(14) + lerp(80, 0, eo(clamp(k / .8)));
            buses.push([X(-7.5), bz, s]);
            for (let j = 0; j < 10; j++) { const u = clamp((k - .8 - j * .06) / .9); if (u <= 0) continue; people.add(lerp(X(-5), X(10), u), CURB + .55, Z(12 + j * 1.3), '#ffffff'); }
          }
        };
        break;
      }
      case 6: { // Farmácia Popular → pharmacies pop along the block
        const gbB = new GB(), gpB = new GB(); bldg(gbB, gpB, 22, 48, 4, 46, 5, {}); before.add(mk(gbB, bmat), mk(gpB));
        const db = new GB(); { const [a, b, c, d] = B(1, 20, 1, 49); db.flat(a, b, c, d, CURB + .02, '#a88b64'); } before.add(mk(db, vm, false));
        for (let k2 = 0; k2 < 3; k2++) {
          const gb = new GB(), gp = new GB(); const h = bldg(gb, gp, 3, 17, 3 + k2 * 16, 14 + k2 * 16, 2, { wall: '#ffffff', roof: '#cfd6d1', ty: 1 });
          const [a, b, c, d] = B(3, 17, 3 + k2 * 16, 14 + k2 * 16);
          gp.box(Math.min(a, b) - .2, Math.max(a, b) + .2, CURB + 3, CURB + 3.6, Math.max(c, d), Math.max(c, d) + .3, '#19a35b');
          // green cross on the roof
          const cx = (a + b) / 2, cz = (c + d) / 2;
          gp.box(cx - 2.4, cx + 2.4, h + .6, h + 2, cz - .8, cz + .8, '#19c36b'); gp.box(cx - .8, cx + .8, h + .6, h + 2, cz - 2.4, cz + 2.4, '#19c36b');
          part(mk(gb, bmat), k2 * .2, new THREE.Vector3(cx, 0, cz)); part(mk(gp), k2 * .2, new THREE.Vector3(cx, 0, cz));
        }
        const sg = sign(['FARMÁCIA', 'POPULAR'], 12, 6, 10, 26, 8, { bg: '#19a35b' }); part(sg, .45, sg.position.clone().setY(6));
        site.focus.set(X(13), 3, Z(25));
        site.update = (s0, w, k) => {
          if (k < .3) return;
          for (let j = 0; j < 24; j++) { const k2 = j % 3; people.add(X(-1.5 - (j / 3 | 0) * .2), CURB + .55, Z(7 + k2 * 16 + (j / 3 | 0) * 1.1), SHIRT[j % SHIRT.length]); }
        };
        break;
      }
      case 7: { // Ministério da Segurança Pública + dinheiro das facções
        const db = new GB(); dirt(db); fence(db); before.add(mk(db, vm, false));
        const gb = new GB(), gp = new GB(); const h = bldg(gb, gp, 14, 46, 8, 42, 5, { wall: '#eef0f2', roof: '#9aa3ab', ty: 1, fh: 3.8 });
        for (let k2 = 0; k2 < 9; k2++) { const [a, b, c, d] = B(10.6, 11.6, 9 + k2 * 4, 10 + k2 * 4); gp.box(a, b, CURB, h - 3, c, d, '#ffffff'); }
        { const [a, b, c, d] = B(9.5, 14, 8, 42); gp.box(a, b, h - 3, h - 2, c, d, '#ffffff'); }
        part(mk(gb, bmat), 0, new THREE.Vector3(X(30), 0, Z(25))); part(mk(gp), 0, new THREE.Vector3(X(30), 0, Z(25)));
        const sg = sign(['SEGURANÇA', 'PÚBLICA'], 15, 7, 21, 24, h, { bg: '#13294b' }); part(sg, .12, sg.position.clone().setY(h));
        site.focus.set(X(7), 3, Z(25));
        site.update = (s0, w, k) => {
          if (k < 0) return;
          const vx = X(-9.5), vz = Z(25);
          vans.push([vx, vz, 0]);
          for (let j = 0; j < 6; j++) {
            const a = j / 6 * Math.PI * 2, r = lerp(70, 7, eo(clamp((k - .2) / 1.0)));
            police.push([vx + Math.cos(a) * r * .5, vz + Math.sin(a) * r, a + Math.PI / 2, (Math.floor(w * 2 + j) % 2)]);
          }
          // the cash van's money is "asphyxiated": coins sink into the ground
          if (k > 1) for (let j = 0; j < 8; j++) { const kk = (k - 1 - j * .08); if (kk > 0 && kk < 1.2) coins.add(vx + Math.sin(j) * 2, 3 - kk * 3, vz + Math.cos(j) * 3, '#8a8f99', .8, .8, .8, j, Math.PI / 2); }
        };
        break;
      }
      case 8: { // entregador de app com INSS → delivery bikes along the avenue get a shield
        const gb = new GB(), gp = new GB(); bldg(gb, gp, 4, 26, 6, 44, 2, { wall: '#ffb03b' }); bldg(gb, gp, 30, 48, 4, 46, 6, {});
        before.add(mk(gb, bmat), mk(gp));
        const sg = sign(['INSS'], 9, 4.5, 10, 25, 8, { bg: '#1f5fbf' }); part(sg, 0, sg.position.clone().setY(8));
        site.focus.set(X(3), 2, Z(25));
        const bikes = Array.from({ length: 14 }, (_, j) => ({ lane: [-10.5, -6.5, 6.5, 10.5][j % 4], off: j * 9.3, c: ['#e63946', '#ff7a00', '#2a9d8f', '#ffd60a'][j % 4] }));
        site.update = (s0, w, k) => {
          const zc = Z(25);
          for (const [j, b] of bikes.entries()) {
            const dir = b.lane > 0 ? -1 : 1;
            const z = zc + ((((b.off + w * 4 * dir) % 70) + 70) % 70) - 35;
            motos.push([b.lane, z, dir, b.c]);
            if (k > .1 + j * .03) shields.push([b.lane, z, popK(k - .1 - j * .03, .4)]);
          }
        };
        break;
      }
      case 9: { // política de cuidados + envelhecimento ativo → a care plaza
        const db = new GB(); dirt(db); fence(db); before.add(mk(db, vm, false));
        const pv = new GB(); { const [a, b, c, d] = B(1, 49, 1, 49); pv.flat(a, b, c, d, CURB + .03, '#e8dcc6'); }
        // heart flowerbed
        const hx = X(25), hz = Z(25);
        for (let k2 = 0; k2 < 60; k2++) { const t = k2 / 60 * Math.PI * 2, x = 16 * Math.pow(Math.sin(t), 3), z = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); pv.cyl(hx + x * .9 * s, hz + z * .9, 1.4, CURB, CURB + .5, '#e5383b', 6); }
        part(mk(pv, vm, false), 0, new THREE.Vector3(hx, 0, hz));
        for (let k2 = 0; k2 < 8; k2++) { const tg = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 1), new THREE.MeshStandardMaterial({ color: '#3f9a3a', roughness: .9 })); const a = k2 / 8 * Math.PI * 2; tg.position.set(hx + Math.cos(a) * 21, CURB + 3.4, hz + Math.sin(a) * 21); tg.castShadow = true; part(tg, .05 + k2 * .03, new THREE.Vector3(tg.position.x, 0, tg.position.z)); }
        const sg = sign(['CUIDADOS'], 11, 4.5, 25, 46, 1.2, { bg: '#c2185b' }); part(sg, .2, sg.position.clone().setY(0));
        site.focus.set(hx, 2, hz);
        const el = Array.from({ length: 28 }, (_, j) => { const a = j / 28 * Math.PI * 2; return { x: hx + Math.cos(a) * 11 * s, z: hz + Math.sin(a) * 9 }; });
        site.update = (s0, w, k) => {
          if (k < .25) return;
          el.forEach((p, j) => {
            const up = Math.max(0, Math.sin(w * 1.2 + (j % 2) * Math.PI)) * .35;    // stretching in pairs
            people.add(p.x, CURB + .55 + up, p.z, j % 3 === 0 ? '#ff7ab6' : '#e9e4ff');
            if (j % 3 !== 0) heads.push([p.x, CURB + 1.35 + up, p.z]);
          });
        };
        break;
      }
    }
    out.push(site);
  });

  // —— Per-frame lists for special vehicles (filled by sites) ——
  const buses = [], vans = [], police = [], motos = [], shields = [], heads = [];
  const busP = new Pool(scene, new THREE.BoxGeometry(2.6, 3.0, 12).translate(0, 1.7, 0), new THREE.MeshStandardMaterial({ roughness: .5 }), 8);
  const vanP = new Pool(scene, new THREE.BoxGeometry(2.2, 2.4, 5.4).translate(0, 1.4, 0), new THREE.MeshStandardMaterial({ roughness: .4 }), 4);
  const polP = new Pool(scene, new THREE.BoxGeometry(1.9, 1.4, 4.4).translate(0, .9, 0), new THREE.MeshStandardMaterial({ roughness: .4 }), 12);
  const litP = new Pool(scene, new THREE.BoxGeometry(1.2, .35, .5).translate(0, 1.8, 0), new THREE.MeshStandardMaterial({ roughness: .3, emissive: '#ffffff', emissiveIntensity: 1, vertexColors: false }), 12, false);
  const motP = new Pool(scene, new THREE.BoxGeometry(.7, 1.6, 2.0).translate(0, .8, 0), new THREE.MeshStandardMaterial({ roughness: .5 }), 24);
  const shieldTex = signTex(['INSS'], { W: 512, H: 512, bg: '#1f5fbf', fs: 190 });
  const shP = new Pool(scene, new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshStandardMaterial({ map: shieldTex, emissiveMap: shieldTex, emissive: '#fff', emissiveIntensity: .6, side: THREE.DoubleSide }), 24, false);
  const headP = new Pool(scene, new THREE.SphereGeometry(.32, 8, 6), new THREE.MeshStandardMaterial({ roughness: .6 }), 40);

  function update(s0, w, pops) {
    buses.length = vans.length = police.length = motos.length = shields.length = heads.length = 0;
    for (const site of out) {
      const k = s0 - pops[site.i];
      for (const it of site.items) { const q = popK(step12(Math.max(0, k - it.delay))); it.g.scale.set(1, Math.max(q, 1e-4), 1); it.g.visible = q > .001; }
      site.before.visible = REPLACE.has(site.i) ? k < .05 : true;
      if (site.i === 0) site.before.children.forEach(c => { if (c.userData.tex) c.visible = k < .05; });   // the 6×1 board flips away
      site.update?.(s0, w, k);
    }
    busP.begin(); for (const [x, z] of buses) busP.add(x, 0, z, '#f2b705'); busP.end();
    vanP.begin(); for (const [x, z] of vans) vanP.add(x, 0, z, '#1d1f24'); vanP.end();
    polP.begin(); litP.begin(); for (const [x, z, a, f] of police) { polP.add(x, 0, z, '#f4f6f8', 1, 1, 1, a); litP.add(x, 0, z, f ? '#2f6bff' : '#ff2a2a', 1, 1, 1, a); } polP.end(); litP.end();
    motP.begin(); for (const [x, z, d, c] of motos) motP.add(x, 0, z, c); motP.end();
    shP.begin(); for (const [x, z, q] of shields) shP.add(x, 4.2, z, '#ffffff', q, q, q, 0, -.55); shP.end();
    headP.begin(); for (const [x, y, z] of heads) headP.add(x, y, z, '#f2f2f2'); headP.end();
  }
  return { sites: out, update };
}
