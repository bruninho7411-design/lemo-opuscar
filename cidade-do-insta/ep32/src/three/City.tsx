import React, {useMemo} from 'react';
import * as THREE from 'three';
import {G, P, Sign, mat, rng, textTexture, texMat, OUTLINE, V3} from './parts';
import {Capy} from './Capy';
import {pop, ramp, clamp, easeOut, WATER_T, FLOW_T, WATER_CREW_T, HOOK_END, LOOP_AT, TOTAL_SEC, U, E, NIGHT, PQ} from '../timeline';
import {Usina, Bolt, Lever, USINA} from './Usina';
import {Escola, Bus} from './Escola';
import {Parque} from './Parque';
import {Quartel, HookFire} from './Bombeiros';
import {Estadio} from './Estadio';
import {Praia} from './Praia';
import {Zoo, LionShow} from './Zoo';
import {Bairro} from './Bairro';
import {Aquatico} from './Aquatico';
import {Cinema, TierSet, HookSet, DonaMercado} from './Cinema';
import {Desejos, Juiza, DonaZoo, Sorveteria} from './Ep23';
import {Medica, Pedidos, Hamburgueria} from './Ep24';
import {DonoAeroporto, Desejos25, Decola} from './Ep25';
import {Bruxa, Casas26, Donos26} from './Ep26';
import {Lote27, Princesa, Biblioteca, Robo, Desejos27} from './Ep27';
import {Rainha, Dragao, Desejos28} from './Ep28';
import {Lote29, Medica29, Irma, Desejos29} from './Ep29';
import {Lote30, Letreiro, Fliperama, Desejos30} from './Ep30';
import {Rua31, Vampiros, Desejos31, Governadora} from './Ep31';
import {Rua32, Prefeitura, DonoFliper, Desejos32} from './Ep32';
import {Pizzaria, Mercadinho, Shopping, Hospital, Airport, Police, Castle, Showcase, Mansion, MiniHouse, Shack, NameTag, Bench, CROWD, WALLS, ROOFS, FOLLOWERS, ONLY_COMMENT, NEW} from './World';
import PEOPLE from '../people.json';

// ---------------- grid ----------------
export const PITCH = 30; // block centre to block centre
export const HALF = 11; // half size of a block (sidewalk edge)
export const IX: [number, number] = [-7, 5];
export const JZ: [number, number] = [-7, 7];
const AVENUE_X = new Set([-15, 15]); // street centre x that are avenues
const AVENUE_Z = new Set([-15, 15]);
const key = (i: number, j: number) => `${i},${j}`;
export const bc = (i: number, j: number): [number, number] => [i * PITCH, j * PITCH];

// special blocks (no automatic houses)
const SPECIAL: Record<string, string> = {
  [key(0, 0)]: 'praca',
  [key(0, -1)]: 'shopping',
  [key(1, -1)]: 'hospital',
  [key(-1, -1)]: 'policia',
  [key(-1, 0)]: 'agua',
  [key(1, 0)]: 'comercio',
  [key(-2, 0)]: 'castelo',
  [key(-2, -1)]: 'mansoes',
  [key(2, 0)]: 'usina',
  [key(0, 1)]: 'escola',
  [key(1, 1)]: 'parque',
  [key(-1, 1)]: 'bombeiros',
  [key(2, 1)]: 'estadio',
};

type Slot = {x: number; z: number; ry: number; d: number};
/** house slots of one block: outer ring facing the streets + inner ring */
function blockSlots(i: number, j: number, edges = [true, true, true, true]): Slot[] {
  const [cx, cz] = bc(i, j);
  const out: Slot[] = [];
  const ring = (off: number, n: number, sp: number) => {
    for (let k = 0; k < n; k++) {
      const a = (k - (n - 1) / 2) * sp;
      // south (+z), north (-z), east (+x), west (-x); house front is local +z
      if (edges[0]) out.push({x: cx + a, z: cz + off, ry: 0, d: 0});
      if (edges[1]) out.push({x: cx - a, z: cz - off, ry: Math.PI, d: 0});
      if (edges[2]) out.push({x: cx + off, z: cz - a, ry: Math.PI / 2, d: 0});
      if (edges[3]) out.push({x: cx - off, z: cz + a, ry: -Math.PI / 2, d: 0});
    }
  };
  ring(9.2, 7, 2.5);
  ring(5.0, 4, 2.5);
  out.forEach((s) => (s.d = Math.hypot(s.x, s.z)));
  return out;
}

const SLOTS: Slot[] = (() => {
  const all: Slot[] = [];
  for (let i = IX[0]; i <= IX[1]; i++)
    for (let j = JZ[0]; j <= JZ[1]; j++) {
      const sp = SPECIAL[key(i, j)];
      if (sp === 'comercio') all.push(...blockSlots(i, j, [true, true, true, false]));
      else if (!sp) all.push(...blockSlots(i, j));
    }
  return all;
})();
const NAMED: string[] = [...FOLLOWERS, ...NEW];
// named houses go to the slots closest to the plaza (sorted by distance)
const ORDER = SLOTS.map((s, n) => n).sort((a, b) => SLOTS[a].d - SLOTS[b].d);
const NAMED_SLOTS = ORDER.slice(0, NAMED.length).map((n, k) => ({...SLOTS[n], name: NAMED[k], i: k}));
const PLAIN_SLOTS = ORDER.slice(NAMED.length).map((n) => SLOTS[n]);
export const HOUSE_COUNT = SLOTS.length;

// ---------------- helpers ----------------
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const std = () => new THREE.MeshStandardMaterial({flatShading: true, roughness: 0.85});

const PlainHouses: React.FC = () => {
  const {walls, roofs, doors} = useMemo(() => {
    const n = PLAIN_SLOTS.length;
    const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 1.1, 1.5), std(), n);
    const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(1.3, 0.7, 4), std(), n);
    const doors = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.66, 0.04), new THREE.MeshStandardMaterial({color: '#7b4a28', flatShading: true}), n);
    const R = rng(3);
    PLAIN_SLOTS.forEach((h, j) => {
      const ry = h.ry;
      walls.setColorAt(j, new THREE.Color(WALLS[Math.floor(R() * WALLS.length)]));
      roofs.setColorAt(j, new THREE.Color(ROOFS[Math.floor(R() * ROOFS.length)]));
      _q.setFromEuler(_e.set(0, ry, 0));
      _m.compose(_p.set(h.x, 0.55, h.z), _q, _s.set(1, 1, 1)); walls.setMatrixAt(j, _m);
      _q.setFromEuler(_e.set(0, ry + Math.PI / 4, 0));
      _m.compose(_p.set(h.x, 1.45, h.z), _q, _s.set(0.92, 1, 0.92)); roofs.setMatrixAt(j, _m);
      _q.setFromEuler(_e.set(0, ry, 0));
      _m.compose(_p.set(h.x + Math.sin(ry) * 0.76, 0.35, h.z + Math.cos(ry) * 0.76), _q, _s.set(1, 1, 1)); doors.setMatrixAt(j, _m);
    });
    for (const m of [walls, roofs, doors]) { m.castShadow = true; m.receiveShadow = true; m.instanceMatrix.needsUpdate = true; }
    return {walls, roofs, doors};
  }, []);
  return (
    <>
      <primitive object={walls} />
      <primitive object={roofs} />
      <primitive object={doors} />
    </>
  );
};

const NamedHouses: React.FC = () => (
  <>
    {NAMED_SLOTS.map((h) => (
      <group key={h.i} position={[h.x, 0, h.z]} rotation={[0, h.ry, 0]}>
        <MiniHouse i={h.i} k={1} />
        <Sign text={'@' + h.name} p={[0.55, 0, 1.05]} s={0.62} postH={0.45} w={1.9} bg="#ffffff" fg="#14110c" />
      </group>
    ))}
  </>
);

// ---------------- streets ----------------
const X0 = IX[0] * PITCH - PITCH / 2, X1 = IX[1] * PITCH + PITCH / 2;
const Z0 = JZ[0] * PITCH - PITCH / 2, Z1 = JZ[1] * PITCH + PITCH / 2;
const STREET_XS = Array.from({length: IX[1] - IX[0] + 2}, (_, k) => X0 + k * PITCH);
const STREET_ZS = Array.from({length: JZ[1] - JZ[0] + 2}, (_, k) => Z0 + k * PITCH);

const Streets: React.FC = () => {
  const dashes = useMemo(() => {
    const list: [number, number, boolean][] = [];
    for (const x of STREET_XS) for (let z = Z0; z < Z1; z += 3) list.push([x, z, false]);
    for (const z of STREET_ZS) for (let x = X0; x < X1; x += 3) list.push([x, z, true]);
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: '#ffffff'}), list.length);
    list.forEach(([x, z, h], k) => {
      const av = h ? AVENUE_Z.has(z) : AVENUE_X.has(x);
      _m.compose(_p.set(x + (av && !h ? 0 : 0), 0.085, z), _q.identity(), h ? _s.set(1.3, 0.01, av ? 0.0 : 0.12) : _s.set(av ? 0.0 : 0.12, 0.01, 1.3));
      m.setMatrixAt(k, _m);
    });
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, []);
  const W = X1 - X0, D = Z1 - Z0;
  return (
    <group>
      {/* sidewalk / concrete under the whole grid, blocks sit on top */}
      <mesh geometry={G.box} material={mat('#d9d2c3')} position={[(X0 + X1) / 2, 0.02, (Z0 + Z1) / 2]} scale={[W + 8, 0.04, D + 8]} receiveShadow />
      {STREET_XS.map((x) => {
        const av = AVENUE_X.has(x);
        return (
          <group key={'x' + x}>
            <mesh geometry={G.box} material={mat('#3b3f46')} position={[x, 0.05, (Z0 + Z1) / 2]} scale={[av ? 6.6 : 3.6, 0.05, D + 4]} receiveShadow />
            {av ? <mesh geometry={G.box} material={mat('#6fbf4a')} position={[x, 0.1, (Z0 + Z1) / 2]} scale={[0.9, 0.12, D + 4]} receiveShadow /> : null}
          </group>
        );
      })}
      {STREET_ZS.map((z) => {
        const av = AVENUE_Z.has(z);
        return (
          <group key={'z' + z}>
            <mesh geometry={G.box} material={mat('#3b3f46')} position={[(X0 + X1) / 2, 0.051, z]} scale={[W + 4, 0.05, av ? 6.6 : 3.6]} receiveShadow />
            {av ? <mesh geometry={G.box} material={mat('#6fbf4a')} position={[(X0 + X1) / 2, 0.1, z]} scale={[W + 4, 0.12, 0.9]} receiveShadow /> : null}
          </group>
        );
      })}
      {/* crosswalk-free intersections: repaint asphalt squares over the medians */}
      {STREET_XS.filter((x) => AVENUE_X.has(x)).flatMap((x) => STREET_ZS.map((z) => <mesh key={x + '_' + z} geometry={G.box} material={mat('#3b3f46')} position={[x, 0.11, z]} scale={[6.6, 0.12, AVENUE_Z.has(z) ? 6.6 : 3.6]} />))}
      {STREET_ZS.filter((z) => AVENUE_Z.has(z)).flatMap((z) => STREET_XS.map((x) => <mesh key={'b' + x + '_' + z} geometry={G.box} material={mat('#3b3f46')} position={[x, 0.112, z]} scale={[AVENUE_X.has(x) ? 6.6 : 3.6, 0.12, 6.6]} />))}
      <primitive object={dashes} />
    </group>
  );
};

/** block lawns: every block gets a green base, residential ones a tree in the middle */
const Lawns: React.FC = () => {
  const {lawn, trunks, crowns} = useMemo(() => {
    const blocks: [number, number, string | undefined][] = [];
    for (let i = IX[0]; i <= IX[1]; i++) for (let j = JZ[0]; j <= JZ[1]; j++) blocks.push([i, j, SPECIAL[key(i, j)]]);
    const lawn = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(), blocks.length);
    blocks.forEach(([i, j, sp], k) => {
      const [cx, cz] = bc(i, j);
      _m.compose(_p.set(cx, 0.06, cz), _q.identity(), _s.set(HALF * 2 - 1.2, 0.04, HALF * 2 - 1.2));
      lawn.setMatrixAt(k, _m);
      lawn.setColorAt(k, new THREE.Color(sp === 'usina' || sp === 'escola' || sp === 'parque' || sp === 'bombeiros' || sp === 'estadio' ? '#b58b5a' : sp && sp !== 'praca' && sp !== 'castelo' && sp !== 'mansoes' && sp !== 'comercio' ? '#c9cfd4' : '#8fcf4f'));
    });
    lawn.receiveShadow = true;
    lawn.instanceMatrix.needsUpdate = true;
    // trees: centre of residential blocks + ring around the plaza + forest around the city
    const R = rng(5);
    const trees: [number, number, number][] = [];
    for (const [i, j, sp] of blocks) if (!sp) {
      const [cx, cz] = bc(i, j);
      trees.push([cx + (R() - 0.5) * 1.5, cz + (R() - 0.5) * 1.5, 1.2 + R() * 0.5]);
    }
    for (let a = 0; a < 16; a++) {
      const r = 8.5;
      const tx = Math.cos((a / 16) * Math.PI * 2) * r, tz = Math.sin((a / 16) * Math.PI * 2) * r;
      if (Math.hypot(tx + 6.5, tz + 5.5) < 4) continue;
      trees.push([tx, tz, 1.1 + R() * 0.4]);
    }
    let n = 0;
    while (n < 900) {
      const x = -320 + R() * 560, z = -330 + R() * 650;
      if (x > X0 - 50 && x < X1 + 75 && z > Z0 - 8 && z < Z1 + 8) continue;
      if (z > Z1) continue; // beach + ocean
      if (Math.abs(x) < 34 && z < -226 && z > -300) continue; // zoo
      if (x > 160 && x < 250 && z > 38 && z < 215) continue; // ice cream + water park + cinema
      if (x < -250 && x > -372 && z > 50 && z < 250) continue; // tier showroom + wishes
      if (x < -300 && x > -360 && z > -70 && z < 50) continue; // follower neighbourhood
      trees.push([x, z, 1.4 + R() * 1.6]);
      n++;
    }
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.14, 1, 6), new THREE.MeshStandardMaterial({color: '#6b4a2b', flatShading: true}), trees.length);
    const crowns = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 2.4, 6), std(), trees.length);
    const greens = ['#3f9a3a', '#4cab3f', '#35863a', '#5bb847', '#2f7a35'];
    trees.forEach(([x, z, s], k) => {
      _m.compose(_p.set(x, 0.5 * s, z), _q.identity(), _s.set(s, s, s)); trunks.setMatrixAt(k, _m);
      _m.compose(_p.set(x, 2.0 * s, z), _q.setFromEuler(_e.set(0, R() * 6, 0)), _s.set(s, s, s)); crowns.setMatrixAt(k, _m);
      crowns.setColorAt(k, new THREE.Color(greens[k % greens.length]));
    });
    for (const m of [trunks, crowns]) { m.castShadow = true; m.instanceMatrix.needsUpdate = true; }
    return {lawn, trunks, crowns};
  }, []);
  return (
    <>
      <primitive object={lawn} />
      <primitive object={trunks} />
      <primitive object={crowns} />
    </>
  );
};

// ---------------- water network: blue pulse spreading through the streets ----------------
const STATION: [number, number] = bc(-1, 0);
const PIPE_SEGS = (() => {
  const out: {x: number; z: number; len: number; h: boolean; d: number}[] = [];
  for (const x of STREET_XS) for (let k = 0; k < STREET_ZS.length - 1; k++) {
    const z = (STREET_ZS[k] + STREET_ZS[k + 1]) / 2;
    out.push({x: x + (AVENUE_X.has(x) ? 2.4 : 1.4), z, len: PITCH, h: false, d: Math.hypot(x - STATION[0], z - STATION[1])});
  }
  for (const z of STREET_ZS) for (let k = 0; k < STREET_XS.length - 1; k++) {
    const x = (STREET_XS[k] + STREET_XS[k + 1]) / 2;
    out.push({x, z: z + (AVENUE_Z.has(z) ? 2.4 : 1.4), len: PITCH, h: true, d: Math.hypot(x - STATION[0], z - STATION[1])});
  }
  return out;
})();
const SPEED = 95; // units per second
const WaterNet: React.FC<{t: number}> = ({t}) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: '#3fd0ff'}), PIPE_SEGS.length);
    m.frustumCulled = false;
    return m;
  }, []);
  PIPE_SEGS.forEach((s, k) => {
    const k0 = clamp((t - FLOW_T - s.d / SPEED) / 0.35);
    const L = Math.max(0.0001, s.len * easeOut(k0));
    const w = k0 > 0 ? 0.45 : 0.0001;
    _m.compose(_p.set(s.x, 0.13, s.z), _q.identity(), s.h ? _s.set(L, 0.04, w) : _s.set(w, 0.04, L));
    mesh.setMatrixAt(k, _m);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

// ---------------- night: windows, street lamps, power lines ----------------
const LSPEED = 120;
const lightDelay = (x: number, z: number) => Math.hypot(x - USINA[0], z - USINA[1]) / LSPEED;
const WIN = (() => {
  const all = [...PLAIN_SLOTS, ...NAMED_SLOTS];
  return all.map((h) => {
    const c = Math.cos(h.ry), s2 = Math.sin(h.ry);
    const lx = 0.45, lz = 0.77;
    return {x: h.x + lx * c + lz * s2, z: h.z - lx * s2 + lz * c, ry: h.ry, d: lightDelay(h.x, h.z)};
  });
})();
const LAMPS = (() => {
  const out: {x: number; z: number; d: number}[] = [];
  for (const x of STREET_XS) for (let z = Z0 + 5; z < Z1; z += 10) out.push({x: x + (AVENUE_X.has(x) ? 3.6 : 2.3), z, d: 0});
  for (const z of STREET_ZS) for (let x = X0 + 10; x < X1; x += 10) out.push({x, z: z - (AVENUE_Z.has(z) ? 3.6 : 2.3), d: 0});
  out.forEach((l) => (l.d = lightDelay(l.x, l.z)));
  return out;
})();
const litK = (t: number, d: number) => (t >= U.OFF ? clamp(1 - (t - U.OFF) / 0.12) : clamp((t - U.LIGHT - d) / 0.12));
const NightLights: React.FC<{t: number}> = ({t}) => {
  const m = useMemo(() => {
    const win = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.3, 0.05), new THREE.MeshBasicMaterial({color: '#ffd96a'}), WIN.length);
    const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 5), new THREE.MeshStandardMaterial({color: '#3b3f46', flatShading: true}), LAMPS.length);
    const bulbs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.3, 0), new THREE.MeshBasicMaterial({color: '#fff1b0'}), LAMPS.length);
    const pools = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 16), new THREE.MeshBasicMaterial({color: '#ffcf5a', transparent: true, opacity: 0.32, depthWrite: false}), LAMPS.length);
    LAMPS.forEach((l, k) => {
      _m.compose(_p.set(l.x, 1.3, l.z), _q.identity(), _s.set(1, 1, 1)); posts.setMatrixAt(k, _m);
    });
    posts.instanceMatrix.needsUpdate = true;
    for (const x of [win, bulbs, pools]) x.frustumCulled = false;
    return {win, posts, bulbs, pools};
  }, []);
  WIN.forEach((w, k) => {
    const v = Math.max(0.0001, litK(t, w.d));
    _q.setFromEuler(_e.set(0, w.ry, 0));
    _m.compose(_p.set(w.x, 0.72, w.z), _q, _s.set(v, v, 1)); m.win.setMatrixAt(k, _m);
  });
  const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  LAMPS.forEach((l, k) => {
    const v = Math.max(0.0001, litK(t, l.d));
    _m.compose(_p.set(l.x, 2.7, l.z), _q.identity(), _s.set(v, v, v)); m.bulbs.setMatrixAt(k, _m);
    _m.compose(_p.set(l.x, 0.14, l.z), flat, _s.set(3.2 * v, 3.2 * v, 1)); m.pools.setMatrixAt(k, _m);
  });
  for (const x of [m.win, m.bulbs, m.pools]) x.instanceMatrix.needsUpdate = true;
  // the big buildings' glass glows once the light wave reached the centre
  const g = litK(t, 0.35);
  for (const c of ['#8fd3ff', '#cdeeff']) {
    const mm = mat(c) as THREE.MeshStandardMaterial;
    mm.emissive.set('#ffcf5a');
    mm.emissiveIntensity = 0.95 * g;
  }
  return (
    <>
      <primitive object={m.posts} />
      <primitive object={m.bulbs} />
      <primitive object={m.pools} />
      <primitive object={m.win} />
    </>
  );
};
const POWER_SEGS = (() => {
  const out: {x: number; z: number; len: number; h: boolean; d: number}[] = [];
  for (const x of STREET_XS) for (let k = 0; k < STREET_ZS.length - 1; k++) {
    const z = (STREET_ZS[k] + STREET_ZS[k + 1]) / 2, xx = x - (AVENUE_X.has(x) ? 2.4 : 1.4);
    out.push({x: xx, z, len: PITCH, h: false, d: Math.hypot(xx - USINA[0], z - USINA[1])});
  }
  for (const z of STREET_ZS) for (let k = 0; k < STREET_XS.length - 1; k++) {
    const x = (STREET_XS[k] + STREET_XS[k + 1]) / 2, zz = z - (AVENUE_Z.has(z) ? 2.4 : 1.4);
    out.push({x, z: zz, len: PITCH, h: true, d: Math.hypot(x - USINA[0], zz - USINA[1])});
  }
  return out;
})();
const PowerNet: React.FC<{t: number}> = ({t}) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: '#ffd21e'}), POWER_SEGS.length);
    m.frustumCulled = false;
    return m;
  }, []);
  POWER_SEGS.forEach((s, k) => {
    const k0 = t >= U.OFF ? 0 : clamp((t - U.LIGHT + 0.15 - s.d / LSPEED) / 0.3);
    const L = Math.max(0.0001, s.len * easeOut(k0));
    const w = k0 > 0 ? 0.4 : 0.0001;
    _m.compose(_p.set(s.x, 0.14, s.z), _q.identity(), s.h ? _s.set(L, 0.04, w) : _s.set(w, 0.04, L));
    mesh.setMatrixAt(k, _m);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};
const Sky: React.FC = () => {
  const stars = useMemo(() => {
    const R = rng(77);
    const n = 260;
    const m = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshBasicMaterial({color: '#ffffff', fog: false}), n);
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2, el = 0.08 + R() * 1.2, r = 1700;
      _m.compose(_p.set(Math.cos(a) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(a) * Math.cos(el) * r), _q.identity(), _s.setScalar(2 + R() * 3.5));
      m.setMatrixAt(i, _m);
    }
    m.instanceMatrix.needsUpdate = true;
    m.frustumCulled = false;
    return m;
  }, []);
  const moon = useMemo(() => new THREE.MeshBasicMaterial({color: '#fff6d8', fog: false}), []);
  return (
    <>
      <primitive object={stars} />
      <mesh geometry={G.ball} material={moon} position={[-520, 520, -1300]} scale={60} />
    </>
  );
};

// ---------------- the new build: ESTAÇÃO DE ÁGUA ----------------
const WATER_WORKERS: string[] = (PEOPLE as any).water;
const Spray: React.FC<{tt: number; on: number; p: V3}> = ({tt, on, p}) => {
  if (on <= 0) return null;
  return (
    <group position={p}>
      {Array.from({length: 26}).map((_, i) => {
        const ph = ((tt * 0.9 + i / 26) % 1);
        const a = (i * 2.399) % (Math.PI * 2);
        const r = ph * 2.2;
        const y = 4.8 * ph * (1 - ph) * 4 * 0.6 * on;
        return <mesh key={i} geometry={G.ballLo} material={mat(i % 3 ? '#7fdcff' : '#ffffff', {basic: true})} position={[Math.cos(a) * r, 0.4 + y, Math.sin(a) * r]} scale={0.14 * (1 - ph * 0.5) * on} />;
      })}
    </group>
  );
};

export const POOL = {x: 5.0, z: -2.2, w: 9.6, d: 14.4};
export const POOL_Y = 1.25; // water surface height (station local)
export const ROCK_HIT = 0.82; // impact time
const RING = new THREE.RingGeometry(0.85, 1, 28);
const RING_MAT = new THREE.MeshBasicMaterial({color: '#e8fbff', transparent: true, opacity: 0.8});
const ROCK_GEO = (() => {
  const g = new THREE.IcosahedronGeometry(1, 1);
  const p = g.attributes.position;
  // displacement is a function of the vertex position, so shared corners stay welded
  const h = (x: number, y: number, z: number) => { const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return v - Math.floor(v); };
  for (let i = 0; i < p.count; i++) {
    const x = +p.getX(i).toFixed(4), y = +p.getY(i).toFixed(4), z = +p.getZ(i).toFixed(4);
    const k = 0.78 + h(x, y, z) * 0.4;
    p.setXYZ(i, x * k * 1.25, y * k * 0.85, z * k);
  }
  g.computeVertexNormals();
  return g;
})();
/** a giant rock falls from the sky into the reservoir (hook) */
const RockSplash: React.FC<{rt: number}> = ({rt}) => {
  const g = 15;
  const dt = ROCK_HIT - rt;
  const wy = POOL_Y + 0.1;
  const y = dt > 0 ? wy + 1.6 + 0.5 * g * dt * dt : wy + 1.6 - 9 * (rt - ROCK_HIT);
  const s = rt - ROCK_HIT; // time since impact
  const R = rng(21);
  const drops = Array.from({length: 46}, (_, i) => ({a: (i / 46) * Math.PI * 2 + R() * 0.2, v: 4 + R() * 6, up: 7 + R() * 9, sz: 0.12 + R() * 0.2}));
  return (
    <group position={[POOL.x, 0, POOL.z - 4.5]}>
      {s < 0.35 ? (
        <group position={[0, y, 0]} rotation={[rt * 1.3 + 0.4, rt * 0.9, rt * 0.6]}>
          <mesh geometry={ROCK_GEO} material={mat('#8d8a84')} scale={2.1} castShadow />
          <mesh geometry={ROCK_GEO} material={OUTLINE} scale={2.18} />
        </group>
      ) : null}
      {s > 0 && s < 1.6 ? (
        <group>
          {/* central column */}
          <mesh geometry={G.cyl12} material={mat('#e8fbff', {basic: true})} position={[0, wy + 3.2 * Math.sin(Math.min(1, s / 0.7) * Math.PI) , 0]} scale={[1.3 - 0.5 * s, Math.max(0.01, 6.4 * Math.sin(Math.min(1, s / 0.7) * Math.PI)), 1.3 - 0.5 * s]} />
          {/* crown droplets */}
          {drops.map((d, i) => {
            const r = d.v * s;
            const yy = wy + d.up * s - 0.5 * 22 * s * s;
            if (yy < wy - 0.2) return null;
            return <mesh key={i} geometry={G.ballLo} material={mat(i % 3 ? '#9fe6ff' : '#ffffff', {basic: true})} position={[Math.cos(d.a) * r, yy, Math.sin(d.a) * r]} scale={d.sz * (1.4 - s * 0.5)} />;
          })}
          {/* ripples */}
          {[0, 0.15, 0.3].map((o) => (s > o ? <mesh key={o} geometry={RING} material={RING_MAT} position={[0, wy + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.8 + (s - o) * 7} /> : null))}
        </group>
      ) : null}
    </group>
  );
};

export const WaterStation: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const word = useMemo(() => texMat(textTexture('ESTAÇÃO DE ÁGUA', {bg: '#ffffff', fg: '#1677c9', border: '#14110c', w: 1024, h: 180, size: 104})), []);
  const tankWord = useMemo(() => texMat(textTexture('ÁGUA', {bg: '#2fb5ff', fg: '#ffffff', border: '#2fb5ff', w: 512, h: 200, size: 150})), []);
  // the hook (and the loop seam) show the finished station with the rock falling in
  const hook = t < HOOK_END;
  if (!hook && t < WATER_T) return null;
  const te = hook ? WATER_T + 20 : t;
  const st = (d: number, dur = 0.45) => pop(te, WATER_T + d, dur);
  const fill = easeOut(ramp(te, WATER_T + 0.7, WATER_T + 2.2));
  const k5 = st(0.5, 0.6);
  const [cx, cz] = STATION;
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt; // rock clock, continuous across the loop seam
  return (
    <group position={[cx, 0, cz]}>
      {/* concrete pad */}
      <group scale={[st(0), 1, st(0)]}>
        <mesh geometry={G.box} material={mat('#cfd6dc')} position={[0, 0.1, 0]} scale={[21, 0.06, 21]} receiveShadow />
      </group>
      {/* big reservoir */}
      <group position={[POOL.x, 0, POOL.z]} scale={[1, st(0.15), 1]}>
        <P geo={G.box} color="#b9c2ca" p={[0, 0.7, -POOL.d / 2]} s={[POOL.w + 0.8, 1.4, 0.4]} o={0.04} />
        <P geo={G.box} color="#b9c2ca" p={[0, 0.7, POOL.d / 2]} s={[POOL.w + 0.8, 1.4, 0.4]} o={0.04} />
        <P geo={G.box} color="#b9c2ca" p={[-POOL.w / 2, 0.7, 0]} s={[0.4, 1.4, POOL.d]} o={0.04} />
        <P geo={G.box} color="#b9c2ca" p={[POOL.w / 2, 0.7, 0]} s={[0.4, 1.4, POOL.d]} o={0.04} />
        <mesh geometry={G.box} material={mat('#2fb5ff', {emissive: '#1f6fa8'})} position={[0, 0.15 + (POOL_Y - 0.15) * fill, 0]} scale={[POOL.w - 0.1, 0.05, POOL.d - 0.1]} receiveShadow />
        {fill > 0.2 ? [0, 1, 2].map((i) => {
          const ph = (tt * 0.45 + i / 3) % 1;
          return <mesh key={i} geometry={RING} material={RING_MAT} position={[0, POOL_Y + 0.04, -1]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5 + ph * 4} />;
        }) : null}
      </group>
      {hook ? <RockSplash rt={rt} /> : null}
      {/* water tower (caixa d'água) */}
      <group position={[-4.8, 0, -4.6]} scale={[k5, k5, k5]}>
        {[[-1.7, -1.7], [1.7, -1.7], [1.7, 1.7], [-1.7, 1.7]].map(([x, z], i) => (
          <P key={i} geo={G.cyl} color="#8a96a3" p={[x, 4.6, z]} s={[0.25, 9.2, 0.25]} o={0.03} />
        ))}
        {[2.6, 5.6].map((y) => (
          <group key={y}>
            <P geo={G.box} color="#8a96a3" p={[0, y, -1.7]} s={[3.4, 0.14, 0.14]} o={0} />
            <P geo={G.box} color="#8a96a3" p={[0, y, 1.7]} s={[3.4, 0.14, 0.14]} o={0} />
            <P geo={G.box} color="#8a96a3" p={[-1.7, y, 0]} s={[0.14, 0.14, 3.4]} o={0} />
            <P geo={G.box} color="#8a96a3" p={[1.7, y, 0]} s={[0.14, 0.14, 3.4]} o={0} />
          </group>
        ))}
        <P geo={G.cyl12} color="#2fb5ff" p={[0, 10.8, 0]} s={[3.2, 3.4, 3.2]} o={0.06} />
        <P geo={G.cyl12} color="#ffffff" p={[0, 10.0, 0]} s={[3.25, 0.4, 3.25]} o={0} />
        <P geo={G.dome} color="#1f8fd6" p={[0, 12.5, 0]} s={[3.2, 1.3, 3.2]} o={0.05} />
        <P geo={G.ball} color="#ffd21e" p={[0, 13.95, 0]} s={0.3} o={0.02} />
        <group position={[0, 11.2, 0]} rotation={[0, Math.PI / 4, 0]}>
          <mesh geometry={G.box} material={tankWord} position={[0, 0, 3.4]} scale={[3.4, 1.3, 0.06]} />
        </group>
        {/* pipe up the leg */}
        <P geo={G.cyl} color="#1f8fd6" p={[1.7, 4.6, 1.95]} s={[0.22, 9.2, 0.22]} o={0.02} />
      </group>
      {/* pump house */}
      <group position={[-4.8, 0, 4.4]} scale={st(0.3)}>
        <P geo={G.box} color="#f4f6fb" p={[0, 1.5, 0]} s={[6.2, 3, 4]} o={0.05} />
        <P geo={G.box} color="#1677c9" p={[0, 3.15, 0]} s={[6.5, 0.35, 4.3]} o={0.04} />
        <P geo={G.box} color="#1677c9" p={[0, 1.0, 2.02]} s={[1.3, 2.0, 0.06]} o={0.02} />
        {[-2.0, 2.0].map((x) => <P key={x} geo={G.box} color="#8fd3ff" p={[x, 1.7, 2.02]} s={[1.2, 0.9, 0.05]} o={0.02} />)}
        <P geo={G.cyl12} color="#ffd21e" p={[2.2, 3.6, -0.8]} r={[0, 0, 0]} s={[0.35, 0.6, 0.35]} o={0.02} />
      </group>
      {/* pipes linking everything */}
      {fill > 0 ? (
        <group>
          <P geo={G.cyl} color="#1f8fd6" p={[-1.6, 0.55, -4.6]} r={[0, 0, Math.PI / 2]} s={[0.3, 3.6, 0.3]} o={0.02} />
          <P geo={G.cyl} color="#1f8fd6" p={[-1.6, 0.55, 3.0]} r={[0, 0, Math.PI / 2]} s={[0.3, 3.6, 0.3]} o={0.02} />
        </group>
      ) : null}
      {/* front sign */}
      <group position={[0, 0, 9.6]} scale={st(0.6)}>
        {[-3.6, 3.6].map((x) => <P key={x} geo={G.box} color="#6b4423" p={[x, 1.1, 0]} s={[0.18, 2.2, 0.18]} o={0.02} />)}
        <mesh geometry={G.box} material={word} position={[0, 2.2, 0.05]} scale={[8, 1.4, 0.1]} castShadow />
      </group>
      {/* fountain in front of the station */}
      <group position={[3.6, 0, 7.6]} scale={st(0.75)}>
        <P geo={G.cyl12} color="#b9c2ca" p={[0, 0.25, 0]} s={[1.4, 0.5, 1.4]} o={0.04} />
        <mesh geometry={G.cyl12} material={mat('#2fb5ff', {emissive: '#1f6fa8'})} position={[0, 0.48, 0]} scale={[1.2, 0.04, 1.2]} />
      </group>
      <Spray tt={tt} on={easeOut(ramp(te, WATER_T + 1.2, WATER_T + 1.8))} p={[3.6, 0.3, 7.6]} />
      {/* the three drawn workers */}
      {WATER_WORKERS.map((w, i) => {
        const kk = hook ? 0 : pop(t, WATER_CREW_T + i * 0.25, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[-2.8 + i * 2.8, 0.12, 10.3 + (i === 1 ? 0.9 : 0)]}>
            <Capy scale={0.75 * kk} shirt={i === 0 ? '#1677c9' : '#2fb5ff'} cap="#ffd21e"
              pose={{armL: [0, 0, 0.3 + Math.max(0, Math.sin(tt * 6 + i)) * 1.9], armR: [0, 0, -0.2], mouth: 0.35, brow: 0.3, blink: (Math.floor(tt * 30) + i * 17) % 100 < 4 ? 1 : 0, head: [0, 0, Math.sin(tt * 2 + i) * 0.08]}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};

// ---------------- traffic ----------------
const CAR_COLS = ['#e2483d', '#2f6fd6', '#ffd21e', '#ffffff', '#2d9a5a', '#ff8f1f'];
const Car: React.FC<{c: string}> = ({c}) => (
  <group>
    <P geo={G.box} color={c} p={[0, 0.5, 0]} s={[1.4, 0.6, 2.8]} o={0.04} />
    <P geo={G.box} color="#cdeeff" p={[0, 0.98, -0.1]} s={[1.2, 0.45, 1.4]} o={0.03} />
    {[[-0.7, 0.9], [0.7, 0.9], [-0.7, -0.9], [0.7, -0.9]].map(([x, z], i) => <P key={i} geo={G.cyl12} color="#222" p={[x, 0.26, z]} r={[0, 0, Math.PI / 2]} s={[0.26, 0.18, 0.26]} o={0} />)}
  </group>
);
const CARS = Array.from({length: 22}, (_, i) => {
  const R = rng(40 + i);
  const vertical = i % 2 === 0;
  const line = vertical ? [-15, 15, -45, 45, -75][i % 5] : [-15, 15, 45, -45, 75][i % 5];
  const dir = R() < 0.5 ? 1 : -1;
  return {vertical, line, dir, off: R() * 300, sp: 9 + R() * 5, c: CAR_COLS[i % CAR_COLS.length]};
});
const Traffic: React.FC<{tt: number}> = ({tt}) => (
  <>
    {CARS.map((c, i) => {
      const span = c.vertical ? Z1 - Z0 : X1 - X0;
      const s = (((c.off + tt * c.sp) % span) + span) % span;
      const along = (c.vertical ? Z0 : X0) + (c.dir > 0 ? s : span - s);
      const lane = (AVENUE_X.has(c.line) || AVENUE_Z.has(c.line) ? 1.9 : 0.9) * c.dir;
      const pos: V3 = c.vertical ? [c.line - lane, 0, along] : [along, 0, c.line + lane];
      const ry = c.vertical ? (c.dir > 0 ? 0 : Math.PI) : c.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      // keep cars out of the plaza close-ups
      if (Math.hypot(pos[0], pos[2]) < 12) return null;
      return (
        <group key={i} position={pos} rotation={[0, ry, 0]}>
          <Car c={c.c} />
        </group>
      );
    })}
  </>
);

/** the mayor of this episode, drawn from the comments */
const EP_MAYOR: string = (PEOPLE as any).prefeito_ep20;
const EpMayor: React.FC<{t: number}> = ({t}) => {
  const k = t >= LOOP_AT || t < E.HOOK ? 1 : pop(t, E.PREF, 0.4);
  if (k <= 0) return null;
  return (
    <group position={[1.55, 0.1, 1.0]}>
      <Capy ry={-0.35} scale={0.78 * k} shirt="#ffffff" cap="#ffd21e" sash
        pose={{armR: [0, 0, -0.2 - Math.max(0, Math.sin(t * 6)) * 2.2], armL: [0, 0, 0.2], mouth: 0.4, brow: 0.35, blink: Math.floor(t * 30) % 97 < 4 ? 1 : 0, head: [0, Math.sin(t * 2) * 0.1, 0]}} />
      <NameTag name={EP_MAYOR} k={k} />
    </group>
  );
};
/** inauguration ribbon cut by the episode mayor */
const Ribbon: React.FC<{t: number}> = ({t}) => {
  if (t < 6 || t > 12.2 || PQ.CUT < 0) return null;
  const cut = clamp((t - PQ.CUT) / 0.35);
  return (
    <group position={[1.6, 0.1, 2.4]}>
      {[-1.05, 1.05].map((x) => <P key={x} geo={G.cyl} color="#ffd21e" p={[x, 0.5, 0]} s={[0.07, 1.0, 0.07]} o={0.02} />)}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 1.05, 0.9, 0]} rotation={[0, 0, sd * -cut * 1.3]}>
          <P geo={G.box} color="#e2483d" p={[-sd * 0.52, 0, 0]} s={[1.04, 0.16, 0.03]} o={0.01} />
        </group>
      ))}
      {cut === 0 ? <P geo={G.box} color="#ffd21e" p={[0, 0.9, 0.02]} r={[0, 0, Math.PI / 4]} s={[0.28, 0.28, 0.04]} o={0.01} /> : null}
    </group>
  );
};
/** hook: the school bus zooms past the camera */
const HookBus: React.FC<{t: number}> = ({t}) => {
  const rt = t >= LOOP_AT ? t - TOTAL_SEC : t;
  if (rt < 1.2 || rt > E.BUS_END) return null;
  const x = 48 - (rt - 1.2) * 55;
  return (
    <group position={[x, 0.06, 15.6]} rotation={[0, -Math.PI / 2, 0]}>
      <Bus />
    </group>
  );
};

// ---------------- plaza ----------------
const Plaza: React.FC<{t: number; wt: number; cheer: number; mayorPose: any}> = ({t, wt, cheer, mayorPose}) => {
  const flagTex = useMemo(() => texMat(textTexture('CIDADE DO INSTA', {bg: '#e1306c', fg: '#ffffff', border: '#833ab4', w: 512, h: 300, size: 64})), []);
  return (
    <group>
      {/* paths crossing the park */}
      <mesh geometry={G.box} material={mat('#e9d3a6')} position={[0, 0.09, 0]} scale={[21, 0.03, 2.2]} receiveShadow />
      <mesh geometry={G.box} material={mat('#e9d3a6')} position={[0, 0.091, 0]} scale={[2.2, 0.03, 21]} receiveShadow />
      <mesh geometry={G.cyl12} material={mat('#e9d3a6')} position={[0, 0.1, 0]} scale={[6.0, 0.06, 6.0]} receiveShadow />
      <mesh geometry={G.cyl12} material={mat('#d8bd8a')} position={[0, 0.13, 0]} scale={[2.0, 0.02, 2.0]} receiveShadow />
      {[0.6, 2.2, 3.85, 5.4].map((a, i) => (
        <Bench key={i} p={[Math.sin(a) * 5.4, 0, Math.cos(a) * 5.4 - 0.2]} ry={a + Math.PI} />
      ))}
      <group position={[-2.0, 0, -1.9]}>
        <P geo={G.cyl} color="#cfd4da" p={[0, 2.2, 0]} s={[0.05, 4.4, 0.05]} o={0.02} />
        <P geo={G.ball} color="#ffcf2e" p={[0, 4.45, 0]} s={0.09} o={0.02} />
        <group position={[0.68, 3.85, 0]} rotation={[0, Math.sin(t * 3) * 0.15, Math.sin(t * 5) * 0.03]}>
          <mesh geometry={G.box} material={flagTex} scale={[1.3, 0.76, 0.02]} castShadow />
        </group>
      </group>
      <Sign text="CIDADE DO INSTA" p={[2.5, 0, 1.6]} ry={-0.5} postH={0.7} w={1.5} />
      {CROWD.map((c, i) => {
        if (Math.hypot(c.p[0] - 1.55, c.p[2] - 1.0) < 1.1) return null;
        const hop = cheer * Math.max(0, Math.sin(t * 9 + i * 1.7)) * 0.18;
        return (
          <group key={i} position={[c.p[0], hop + 0.1, c.p[2]]}>
            <Capy ry={c.ry} scale={0.62} shirt={c.shirt} cap={c.cap}
              pose={{armL: [0, 0, 0.2 + cheer * 2.2], armR: [0, 0, -0.2 - cheer * 2.2], blink: (Math.floor(t * 30) + i * 11) % 110 < 4 ? 1 : 0, mouth: cheer * 0.6, head: [0, 0, Math.sin(t * 2 + i) * 0.08]}} />
          </group>
        );
      })}
      <Showcase t={wt} tt={t} p={[-6.5, 0.05, -5.5]} />
      <Lever t={wt} />
      <EpMayor t={t} />
      <Ribbon t={t} />
      <Capy p={[0, 0.1, 0.4]} hat sash clipboard={mayorPose.clipboard} pose={mayorPose} />
    </group>
  );
};

// ---------------- outskirts: only commented ----------------
const Outskirts: React.FC = () => (
  <group position={[X0 - 22, 0, 0]}>
    <mesh geometry={G.box} material={mat('#c9a876')} position={[0, 0.03, 0]} scale={[30, 0.04, 70]} receiveShadow />
    <mesh geometry={G.box} material={mat('#a88a5c')} position={[0, 0.05, 0]} scale={[2.6, 0.04, 70]} receiveShadow />
    {ONLY_COMMENT.map((name: string, i: number) => {
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      return (
        <group key={i} position={[side * (4 + (row % 3) * 3.4), 0, -31 + row * 2.7]} rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <Shack k={1} i={i} />
          <Sign text={'@' + name} p={[0.5, 0, 1.0]} s={0.6} postH={0.45} w={1.9} bg="#d8cbb0" fg="#3a2d20" />
        </group>
      );
    })}
  </group>
);

// ---------------- world ----------------
export const City: React.FC<{t: number; wt: number; mayorPose: any; cheer: number}> = ({t, wt, mayorPose, cheer}) => {
  return (
    <group>
      <mesh geometry={G.plane} material={mat('#8fcf4f', {flat: false})} rotation={[-Math.PI / 2, 0, 0]} scale={[1600, 1600, 1]} receiveShadow />
      {[[-160, -360, 70, 110], [-40, -380, 60, 130], [80, -360, 66, 100], [190, -370, 70, 120], [-260, -330, 60, 80], [300, -320, 60, 90]].map(([x, z, r, h], i) => (
        <P key={i} geo={G.cone6} color={i % 2 ? '#9fb7ad' : '#8eaa9c'} p={[x, h / 2, z]} r={[0, i, 0]} s={[r, h, r]} o={0} />
      ))}
      <Streets />
      <Lawns />
      <PlainHouses />
      <NamedHouses />
      <WaterNet t={wt} />
      <Traffic tt={t} />
      <Plaza t={t} wt={wt} cheer={cheer} mayorPose={mayorPose} />
      {/* earlier builds, spread over the blocks */}
      <Shopping t={wt} tt={t} p={[0, 0.06, -31.3]} />
      <Hospital t={wt} tt={t} p={[30, 0.06, -31.5]} />
      <Police t={wt} tt={t} p={[-30, 0.06, -31.5]} />
      <Pizzaria t={wt} p={[22.5, 0.06, -5.5]} ry={-Math.PI / 2} sc={1.7} />
      <Mercadinho t={wt} p={[22.5, 0.06, 5.5]} ry={-Math.PI / 2} sc={1.7} />
      <Castle t={wt} tt={t} p={[-60, 0.06, 0]} sc={0.95} />
      {[-7.3, 0, 7.3].map((dx, i) => (
        <group key={i} position={[-60 + dx, 0.06, -30]} rotation={[0, 0, 0]} scale={0.78}>
          <Mansion k={1} />
          <Sign text={i === 0 ? '@nicollas__033' : i === 1 ? '@' + (PEOPLE as any).winner2 : 'RESERVADA'} p={[2.4, 0, 4.6]} s={1.1} postH={0.8} w={i === 2 ? 1.8 : 2.6} bg={i === 2 ? '#ffd21e' : '#ffffff'} fg="#14110c" />
        </group>
      ))}
      <Airport t={wt} tt={t} p={[X1 + 32, 0.04, -15]} />
      <WaterStation t={wt} tt={t} />
      <Usina t={wt} tt={t} />
      <Bolt t={wt} />
      {NIGHT ? <><NightLights t={wt} /><PowerNet t={wt} /><Sky /></> : null}
      <Escola t={wt} tt={t} />
      <Parque t={wt} tt={t} />
      <Quartel t={wt} tt={t} />
      <HookFire t={t} />
      <Estadio t={wt} tt={t} />
      <Praia t={wt} tt={t} />
      <Zoo t={wt} tt={t} />
      <LionShow tt={t} />
      <Bairro t={wt} tt={t} />
      <Aquatico t={wt} tt={t} />
      <Cinema t={wt} tt={t} />
      <TierSet t={wt} tt={t} />
      <HookSet tt={t} />
      <DonaMercado t={wt} tt={t} />
      <Desejos tt={t} />
      <Juiza tt={t} />
      <DonaZoo tt={t} />
      <Sorveteria t={wt} tt={t} />
      <Medica tt={t} />
      <Pedidos tt={t} />
      <Hamburgueria t={wt} tt={t} />
      <DonoAeroporto tt={t} />
      <Desejos25 tt={t} />
      <Decola tt={t} />
      <Bruxa tt={t} />
      <Casas26 tt={t} />
      <Donos26 tt={t} />
      <Lote27 />
      <Princesa tt={t} />
      <Biblioteca tt={t} />
      <Robo tt={t} />
      <Desejos27 tt={t} />
      <Rainha tt={t} />
      <Dragao tt={t} />
      <Desejos28 tt={t} />
      <Lote29 />
      <Medica29 tt={t} />
      <Irma tt={t} />
      <Desejos29 tt={t} />
      <Lote30 />
      <Letreiro tt={t} />
      <Fliperama tt={t} />
      <Desejos30 tt={t} />
      <Rua31 />
      <Governadora tt={t} />
      <Vampiros tt={t} />
      <Desejos31 tt={t} />
      <Rua32 />
      <Prefeitura tt={t} />
      <DonoFliper tt={t} />
      <Desejos32 tt={t} />
      <HookBus t={t} />
      <Outskirts />
    </group>
  );
};
