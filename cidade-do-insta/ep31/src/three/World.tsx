import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {G, P, Sign, mat, rng, textTexture, texMat, stripeTexture, OUTLINE, V3} from './parts';
import {Capy} from './Capy';
import {pop, ramp, clamp, easeOut, CITIZEN_SPAWN, LOT_SPAWN, AB_SPAWN, PIZZA_START, PIZZA_PIECES, LAGOA_START, CROWD_START, HOUSES_START, CAMPO_START, ROAD_START, STREET_START, LONELY_START, MANSION_START, WINNER_T, NEW_START, MERC_T, NEW2_START, SHACK2_START, SHOP_T, WORKERS_T, NEW3_START, HOSP_T, AMB_T, STAFF_T, NEW4_START, AIR_T, LAND_T, CREW_T, NEW5_START, POL_T, CAR_T, COPS_T, CASTLE_T, SHOW_T} from '../timeline';

// river centre line x(z)
const RIVER_PTS: [number, number][] = [
  [17, -95], [16.5, -62], [15, -40], [12.5, -18], [14.5, 0], [12, 16], [13.5, 34], [12.5, 80],
];
const riverCurve = new THREE.CatmullRomCurve3(RIVER_PTS.map(([x, z]) => new THREE.Vector3(x, 0, z)));
const riverX = (z: number) => {
  let best = RIVER_PTS[0][0], bd = 1e9;
  for (let i = 0; i <= 200; i++) {
    const v = riverCurve.getPoint(i / 200);
    const d = Math.abs(v.z - z);
    if (d < bd) { bd = d; best = v.x; }
  }
  return best;
};

function ribbon(width: number, y: number) {
  const n = 160;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = riverCurve.getPoint(t);
    const tg = riverCurve.getTangent(t);
    const nx = -tg.z, nz = tg.x;
    const w = width * (0.85 + 0.15 * Math.sin(i * 0.7));
    pos.push(p.x + nx * w, y, p.z + nz * w, p.x - nx * w, y, p.z - nz * w);
    if (i < n) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

type Tree = {x: number; z: number; s: number; kind: number; c: string; ry: number};
function makeTrees(): Tree[] {
  const R = rng(7);
  const out: Tree[] = [];
  const greens = ['#3f9a3a', '#4cab3f', '#35863a', '#5bb847', '#2f7a35'];
  let tries = 0;
  while (out.length < 230 && tries < 6000) {
    tries++;
    const x = -75 + R() * 150;
    const z = -95 + R() * 140;
    const d = Math.hypot(x, z);
    if (d < 11) continue;
    if (Math.abs(x - riverX(z)) < 5) continue;
    if (x > -14 && x < -1 && z > 0 && z < 10.5) continue; // lots
    if (x > 1.5 && x < 10 && z > -6.5 && z < 7.5) continue; // A/B
    if (Math.abs(x) < 3 && z > 2 && z < 40) continue; // road
    if (Math.hypot(x + 5, z + 4) < 4) continue; // casa lot
    if (z > 18 && x > -12) continue; // keep aerial foreground open
    if (x > 8 && z > 3 && z < 30) continue;
    if (x > 1.5 && x < 17 && z > -9 && z < 18) continue; // option shots' camera paths
    if (x > -12 && x < -3 && z > 9 && z < 14) continue; // lots camera path
    if (x > -9 && x < 9 && z > 9 && z < 90) continue; // street
    if (x > -36 && x < -9 && z > 8 && z < 76) continue; // outskirts + mansions
    if (x > -560 && x < -9 && z > 72 && z < 200) continue; // new streets
    if (x > 15 && x < 33 && z > -28 && z < 12) continue; // hospital + camera paths
    if (x > 34 && x < 82 && z > -95 && z < 70) continue; // airport
    if (x > -40 && x < -10 && z > -30 && z < 6) continue; // police
    if (x > -66 && x < -36 && z > 22 && z < 62) continue; // castle
    if (x > -12 && x < 12 && z > -26 && z < -7) continue; // shopping
    if (x > -9 && x < 9 && z > 9 && z < 160) continue; // avenue
    out.push({x, z, s: 0.8 + R() * 0.9, kind: R() < 0.62 ? 0 : 1, c: greens[Math.floor(R() * greens.length)], ry: R() * 6});
  }
  return out;
}

const TreeM: React.FC<{t: Tree}> = ({t}) => (
  <group position={[t.x, 0, t.z]} scale={t.s} rotation={[0, t.ry, 0]}>
    <P geo={G.cyl} color="#6b4a2b" p={[0, 0.5, 0]} s={[0.14, 1.0, 0.14]} o={0.04} />
    {t.kind === 0 ? (
      <>
        <P geo={G.cone6} color={t.c} p={[0, 1.6, 0]} s={[1.0, 1.6, 1.0]} o={0.05} />
        <P geo={G.cone6} color={t.c} p={[0, 2.4, 0]} s={[0.72, 1.3, 0.72]} o={0.05} />
      </>
    ) : (
      <P geo={G.ballLo} color={t.c} p={[0, 1.7, 0]} s={[0.95, 1.0, 0.95]} o={0.05} />
    )}
  </group>
);

const Bench: React.FC<{p: V3; ry: number}> = ({p, ry}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <P geo={G.box} color="#b07a43" p={[0, 0.42, 0]} s={[1.3, 0.08, 0.4]} o={0.04} />
    <P geo={G.box} color="#b07a43" p={[0, 0.7, -0.18]} s={[1.3, 0.25, 0.06]} o={0.04} />
    <P geo={G.box} color="#4c4f55" p={[-0.5, 0.2, 0]} s={[0.08, 0.4, 0.36]} o={0.03} />
    <P geo={G.box} color="#4c4f55" p={[0.5, 0.2, 0]} s={[0.08, 0.4, 0.36]} o={0.03} />
  </group>
);

const Lot: React.FC<{p: V3; handle: string; t: number; t0: number; hot?: boolean}> = ({p, handle, t, t0, hot}) => {
  const k = pop(t, t0, 0.4);
  if (k <= 0) return null;
  const posts: V3[] = [[-1.15, 0, -1.15], [1.15, 0, -1.15], [1.15, 0, 1.15], [-1.15, 0, 1.15]];
  return (
    <group position={p} scale={[1, k, 1]}>
      <mesh geometry={G.box} material={mat('#c39565')} scale={[2.4, 0.06, 2.4]} position={[0, 0.03, 0]} receiveShadow />
      {posts.map((q, i) => (
        <P key={i} geo={G.box} color="#8a5a32" p={[q[0], 0.3, q[2]]} s={[0.1, 0.6, 0.1]} o={0.03} />
      ))}
      {/* ropes */}
      <P geo={G.box} color="#e0413a" p={[0, 0.45, -1.15]} s={[2.3, 0.04, 0.04]} o={0} />
      <P geo={G.box} color="#e0413a" p={[0, 0.45, 1.15]} s={[2.3, 0.04, 0.04]} o={0} />
      <P geo={G.box} color="#e0413a" p={[-1.15, 0.45, 0]} s={[0.04, 0.04, 2.3]} o={0} />
      <P geo={G.box} color="#e0413a" p={[1.15, 0.45, 0]} s={[0.04, 0.04, 2.3]} o={0} />
      <Sign text={handle} p={[0, 0, 1.25]} s={0.95} postH={0.55} bg={hot ? '#ffd23f' : '#f3e2bd'} fg={hot ? '#14110c' : '#28406b'} />
    </group>
  );
};

const ABMarker: React.FC<{p: V3; letter: string; k: number; bob: number}> = ({p, letter, k, bob}) => {
  const tex = useMemo(() => textTexture(letter, {bg: '#ffd23f', fg: '#111', w: 256, h: 256, size: 180, border: '#111', circle: true}), [letter]);
  const m = useMemo(() => new THREE.MeshBasicMaterial({map: tex, transparent: true}), [tex]);
  const camera = useThree((st) => st.camera);
  if (k <= 0) return null;
  return (
    <group position={[p[0], p[1] + bob, p[2]]} scale={k} quaternion={camera.quaternion.clone()}>
      <mesh geometry={G.plane} material={m} scale={[1.6, 1.6, 1]} />
    </group>
  );
};

const Pizzaria: React.FC<{t: number; p?: V3; ry?: number; sc?: number}> = ({t, p, ry, sc}) => {
  const st = (i: number) => pop(t, PIZZA_PIECES[i], 0.4);
  const awn = useMemo(() => texMat(stripeTexture('#e53a2f', '#ffffff', 10)), []);
  const word = useMemo(() => texMat(textTexture('PIZZARIA', {bg: '#fff3d6', fg: '#c62d22', border: '#2a1a10'})), []);
  if (t < PIZZA_START) return null;
  const spin = (t - PIZZA_START) * 1.5;
  return (
    <group position={p ?? [5.6, 0, 3.6]} rotation={[0, ry ?? -0.35, 0]} scale={sc ?? 1}>
      <group scale={[1, st(0), 1]}>
        <P geo={G.box} color="#d9c7a4" p={[0, 0.06, 0]} s={[3.2, 0.12, 2.8]} o={0.03} />
      </group>
      <group scale={[st(1), st(1), st(1)]}>
        <P geo={G.box} color="#f4e2bd" p={[0, 0.95, 0]} s={[2.6, 1.7, 2.2]} o={0.04} />
      </group>
      <group position={[0, 1.8, 0]} scale={st(2)}>
        <P geo={G.cone4} color="#d6402b" p={[0, 0.5, 0]} r={[0, Math.PI / 4, 0]} s={[2.25, 1.0, 2.0]} o={0.04} />
      </group>
      <group scale={st(3)} position={[0, 1.45, 1.25]}>
        <mesh geometry={G.box} material={awn} scale={[2.7, 0.08, 0.6]} rotation={[0.35, 0, 0]} castShadow />
        <mesh geometry={G.box} material={OUTLINE} scale={[2.74, 0.12, 0.64]} rotation={[0.35, 0, 0]} />
      </group>
      <group scale={st(4)}>
        <P geo={G.box} color="#7b4a28" p={[-0.6, 0.55, 1.11]} s={[0.55, 0.95, 0.05]} o={0.03} />
        <P geo={G.box} color="#8fd3ff" p={[0.55, 0.75, 1.11]} s={[0.75, 0.55, 0.05]} o={0.03} />
        <group position={[0, 1.95 - 0.25, 1.15]}>
          <mesh geometry={G.box} material={word} scale={[1.7, 0.42, 0.06]} />
        </group>
      </group>
      {/* giant spinning pizza sign */}
      <group position={[0, 3.35, 0.2]} scale={st(5)} rotation={[0, Math.sin(spin) * 0.5, 0]}>
        <P geo={G.cyl} color="#6b4423" p={[0, -0.55, 0]} s={[0.06, 0.6, 0.06]} o={0.02} />
        <group rotation={[Math.PI / 2, 0, 0]}>
          <P geo={G.cyl12} color="#e9a23b" s={[0.75, 0.12, 0.75]} o={0.04} />
          <P geo={G.cyl12} color="#ffcc3d" p={[0, 0.04, 0]} s={[0.62, 0.08, 0.62]} o={0} />
          {[[0.3, 0.1], [-0.25, 0.25], [0.05, -0.32], [-0.3, -0.15], [0.25, -0.25], [0.0, 0.0]].map(([x, z], i) => (
            <P key={i} geo={G.cyl12} color="#c92b20" p={[x, 0.09, z]} s={[0.11, 0.04, 0.11]} o={0} />
          ))}
        </group>
      </group>
    </group>
  );
};

const Lagoa: React.FC<{t: number}> = ({t}) => {
  if (t < LAGOA_START) return null;
  const k = easeOut(ramp(t, LAGOA_START, LAGOA_START + 0.45));
  const c1 = pop(t, LAGOA_START + 0.55, 0.4);
  const c2 = pop(t, LAGOA_START + 0.85, 0.4);
  const bob = (o: number) => Math.sin((t + o) * 4) * 0.04;
  return (
    <group position={[5.6, 0, -2.4]}>
      <mesh geometry={waterGeo} material={mat('#e8d39e')} scale={[2.25 * k, 1, 1.95 * k]} position={[0, 0.03, 0]} receiveShadow />
      <mesh geometry={waterGeo} material={mat('#4fb3ea', {emissive: '#1f6fa8'})} scale={[1.95 * k, 1, 1.65 * k]} position={[0, 0.06, 0]} receiveShadow />
      {k > 0.6 ? (
        <>
          {[[-1.2, 0.6], [1.1, 0.8], [0.9, -0.9]].map(([x, z], i) => (
            <P key={i} geo={G.cyl12} color="#4caf50" p={[x, 0.08, z]} s={[0.28, 0.02, 0.28]} o={0} />
          ))}
          {[[-1.9, -0.9], [-1.7, -1.2], [1.95, 0.6]].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <P geo={G.cyl} color="#3d8c3a" p={[0, 0.45, 0]} s={[0.03, 0.9, 0.03]} o={0} />
              <P geo={G.cyl} color="#6b4423" p={[0, 0.9, 0]} s={[0.06, 0.22, 0.06]} o={0.02} />
            </group>
          ))}
          <P geo={G.ballLo} color="#9aa0a6" p={[-2.0, 0.15, 0.7]} s={[0.35, 0.25, 0.3]} o={0.03} />
          <P geo={G.ballLo} color="#8a9096" p={[1.8, 0.12, -1.1]} s={[0.3, 0.2, 0.25]} o={0.03} />
        </>
      ) : null}
      <Capy p={[-0.45, -0.72 + bob(0), 0.25]} ry={0.35} scale={0.62 * c1} shirt="#a8683a" orange pose={{blink: 0, mouth: 0.15}} />
      <Capy p={[0.6, -0.78 + bob(1.3), -0.35]} ry={-0.5} scale={0.55 * c2} shirt="#a8683a" orange pose={{blink: 0, mouth: 0.1}} />
    </group>
  );
};
const waterGeo = (() => {
  const g = new THREE.CircleGeometry(1, 11);
  g.rotateX(-Math.PI / 2);
  return g;
})();

const CITIZENS: {p: V3; shirt: string; cap: string | null; ry: number}[] = [
  {p: [-1.7, 0, -1.0], shirt: '#e2483d', cap: null, ry: 0.4},
  {p: [1.8, 0, -0.9], shirt: '#f2b134', cap: '#2f6fd6', ry: -0.4},
  {p: [-2.7, 0, 0.7], shirt: '#7a4fd0', cap: null, ry: 0.6},
  {p: [2.8, 0, 0.8], shirt: '#2d9a5a', cap: null, ry: -0.6},
  {p: [-0.9, 0, -2.2], shirt: '#ff7aa8', cap: '#ffffff', ry: 0.15},
  {p: [0.9, 0, -2.3], shirt: '#2f6fd6', cap: null, ry: -0.15},
  {p: [-2.6, 0, -2.0], shirt: '#16a3a3', cap: '#e2483d', ry: 0.5},
  {p: [2.7, 0, -2.0], shirt: '#ff8f1f', cap: null, ry: -0.5},
  {p: [0.0, 0, -3.0], shirt: '#5ec26a', cap: '#f2b134', ry: 0},
  {p: [-3.3, 0, -0.5], shirt: '#d04f9a', cap: null, ry: 0.8},
];

export const World: React.FC<{t: number; wt: number; mayorPose: any; cheer: number}> = ({t, wt, mayorPose, cheer}) => {
  const trees = useMemo(makeTrees, []);
  const riverW = useMemo(() => ribbon(2.1, 0.05), []);
  const riverB = useMemo(() => ribbon(3.2, 0.03), []);
  const flagTex = useMemo(() => texMat(textTexture('CIDADE DO INSTA', {bg: '#e1306c', fg: '#ffffff', border: '#833ab4', w: 512, h: 300, size: 64})), []);
  const tumble = clamp((t - 6.0) / 1.15);
  return (
    <group>
      {/* ground */}
      <mesh geometry={G.plane} material={mat('#8fcf4f', {flat: false})} rotation={[-Math.PI / 2, 0, 0]} scale={[400, 400, 1]} receiveShadow />
      {/* river */}
      <mesh geometry={riverB} material={mat('#e3cd93', {flat: false})} receiveShadow />
      <mesh geometry={riverW} material={mat('#4aa8ea', {flat: false, emissive: '#1d6db0'})} receiveShadow />
      {/* mountains + waterfall */}
      {[[-40, -95, 30, 42], [-12, -100, 26, 50], [18, -92, 22, 36], [45, -98, 30, 44], [-70, -85, 26, 30], [70, -85, 24, 34]].map(([x, z, r, h], i) => (
        <P key={i} geo={G.cone6} color={i % 2 ? '#9fb7ad' : '#8eaa9c'} p={[x, h / 2, z]} r={[0, i, 0]} s={[r, h, r]} o={0} />
      ))}
      <P geo={G.box} color="#6f8a78" p={[17, 6, -70]} s={[16, 12, 8]} o={0} />
      <mesh geometry={G.plane} material={mat('#cfeeff', {basic: true})} position={[16.8, 6, -65.9]} scale={[2.6, 12, 1]} />
      <mesh geometry={G.plane} material={mat('#8fd2ff', {basic: true})} position={[16.2, 6, -65.85]} scale={[0.5, 12, 1]} />
      <P geo={G.ballLo} color="#ffffff" p={[16.6, 0.4, -65]} s={[2.6, 0.7, 1.4]} o={0} />

      {trees.map((tr, i) => (
        <TreeM key={i} t={tr} />
      ))}

      {/* plaza */}
      <mesh geometry={G.cyl12} material={mat('#e9d3a6')} position={[0, 0.03, 0]} scale={[3.9, 0.06, 3.9]} receiveShadow />
      <mesh geometry={G.cyl12} material={OUTLINE} position={[0, 0.02, 0]} scale={[4.0, 0.05, 4.0]} />
      <mesh geometry={G.cyl12} material={mat('#d8bd8a')} position={[0, 0.07, 0]} scale={[2.0, 0.02, 2.0]} receiveShadow />
      {[0.6, 2.2, 3.85, 5.4].map((a, i) => (
        <Bench key={i} p={[Math.sin(a) * 3.1, 0, Math.cos(a) * 3.1 - 0.2]} ry={a + Math.PI} />
      ))}
      {/* flag */}
      <group position={[-2.0, 0, -1.9]}>
        <P geo={G.cyl} color="#cfd4da" p={[0, 2.2, 0]} s={[0.05, 4.4, 0.05]} o={0.02} />
        <P geo={G.ball} color="#ffcf2e" p={[0, 4.45, 0]} s={0.09} o={0.02} />
        <group position={[0.68, 3.85, 0]} rotation={[0, Math.sin(t * 3) * 0.15, Math.sin(t * 5) * 0.03]}>
          <mesh geometry={G.box} material={flagTex} scale={[1.3, 0.76, 0.02]} castShadow />
        </group>
      </group>
      <Sign text="CIDADE DO INSTA" p={[2.5, 0, 1.6]} ry={-0.5} postH={0.7} w={1.5} />

      {/* empty "casa" lot */}
      <group position={[-5, 0, -4]}>
        <mesh geometry={G.box} material={mat('#b98a5c')} scale={[3, 0.05, 3]} position={[0, 0.025, 0]} receiveShadow />
        <Sign text="SEU PERSONAGEM" p={[1.4, 0, -1.2]} postH={0.9} ry={-0.3} />
        <P geo={G.ballLo} color="#9aa0a6" p={[-0.8, 0.12, -0.6]} s={[0.25, 0.18, 0.22]} o={0.03} />
        <P geo={G.ballLo} color="#8a9096" p={[0.9, 0.1, -0.9]} s={[0.2, 0.14, 0.2]} o={0.03} />
      </group>

      <Street t={wt} />
      <NewStreets t={wt} />
      <Mercadinho t={wt} />
      <Shopping t={wt} tt={t} />
      <Hospital t={wt} tt={t} />
      <Airport t={wt} tt={t} />
      <Police t={wt} tt={t} />
      <Castle t={wt} tt={t} />
      <Showcase t={wt} tt={t} />

      {/* tumbleweed */}
      {tumble > 0 && tumble < 1 ? (
        <group position={[-6 + 12 * tumble, 0.35 + Math.abs(Math.sin(tumble * 18)) * 0.25, 4.5]} rotation={[0, 0, -tumble * 20]}>
          <mesh geometry={G.ballLo} scale={0.35}>
            <meshBasicMaterial color="#9b7a46" wireframe />
          </mesh>
          <mesh geometry={G.ball} scale={0.3}>
            <meshBasicMaterial color="#b8955a" wireframe />
          </mesh>
        </group>
      ) : null}

      {/* comment lots */}
      {['@primeiro_lote', '@vizinho_02', '@voce_aqui', '@morador_01', '@cidadao_07', '@seu_arroba'].map((h, i) => {
        const col = [0, 1, 2, 0, 2, 1][i];
        const row = [0, 0, 0, 1, 1, 1][i];
        return <Lot key={h} handle={h} p={[-11 + col * 2.8, 0, 3 + row * 2.9]} t={wt} t0={LOT_SPAWN[i]} hot={h === '@seu_arroba'} />;
      })}

      {/* A / B lots */}
      {wt >= AB_SPAWN ? (
        <>
          {[3.6, -2.4].map((z, i) => (
            <group key={z} position={[5.6, 0, z]} scale={[1, pop(wt, AB_SPAWN + i * 0.2), 1]}>
              <mesh geometry={G.box} material={mat('#c39565')} scale={[4, 0.05, 4]} position={[0, 0.025, 0]} receiveShadow />
            </group>
          ))}
        </>
      ) : null}
      <Pizzaria t={wt} />
      <Lagoa t={wt} />

      {/* citizens */}
      <Crowd t={t} wt={wt} cheer={cheer} />
      <Houses t={wt} />
      <Campo t={wt} />

      {/* the mayor */}
      <Capy p={[0, 0, 0.4]} hat sash clipboard={mayorPose.clipboard} pose={mayorPose} />
    </group>
  );
};

const NAMES: string[] = [];
const SHIRTS = ['#e2483d', '#f2b134', '#7a4fd0', '#2d9a5a', '#ff7aa8', '#2f6fd6', '#16a3a3', '#ff8f1f', '#5ec26a', '#d04f9a'];
const CAPS = [null, '#2f6fd6', null, '#ffffff', null, '#e2483d', null, '#f2b134'];
const CROWD = (() => {
  const out: {p: V3; ry: number; shirt: string; cap: string | null; name: string | null}[] = [];
  const rings: [number, number, number][] = [[2.1, 9, 0.3], [3.0, 12, 0.0], [3.9, 14, 0.2], [4.8, 16, 0.1]];
  for (const [r, n, off] of rings) for (let i = 0; i < n; i++) {
    const a = off + (i / n) * Math.PI * 2;
    const x = Math.sin(a) * r, z = Math.cos(a) * r - 0.3;
    if (Math.abs(x) < 1.5 && z > -0.2) continue;
    out.push({p: [x, 0, z], ry: Math.atan2(-x * 0.3, 1), shirt: '', cap: null, name: null});
  }
  const pick = out.slice(0, 30);
  pick.forEach((c, i) => { c.shirt = SHIRTS[i % SHIRTS.length]; c.cap = CAPS[i % CAPS.length]; });
  [...pick].sort((a, b) => b.p[2] - a.p[2]).slice(0, NAMES.length).forEach((c, i) => (c.name = NAMES[i]));
  return pick;
})();

const NameTag: React.FC<{name: string; k: number}> = ({name, k}) => {
  const camera = useThree((st) => st.camera);
  const tex = useMemo(() => textTexture('@' + name, {bg: '#ffffff', fg: '#111111', border: '#111111', w: 640, h: 120, size: 64}), [name]);
  const m = useMemo(() => new THREE.MeshBasicMaterial({map: tex, transparent: true, depthTest: true}), [tex]);
  if (k <= 0) return null;
  return (
    <group position={[0, 1.85, 0]} scale={k} quaternion={camera.quaternion.clone()}>
      <mesh geometry={G.plane} material={m} scale={[2.3, 0.43, 1]} />
    </group>
  );
};

const Crowd: React.FC<{t: number; wt: number; cheer: number}> = ({t, wt, cheer}) => (
  <>
    {CROWD.map((c, i) => {
      const k = pop(wt, CROWD_START + (i % 30) * 0.035, 0.35);
      if (k <= 0) return null;
      const hop = cheer * Math.max(0, Math.sin(t * 9 + i * 1.7)) * 0.18;
      return (
        <group key={i} position={[c.p[0], hop, c.p[2]]}>
          <Capy ry={c.ry} scale={0.62 * k} shirt={c.shirt} cap={c.cap}
            pose={{armL: [0, 0, 0.2 + cheer * 2.2], armR: [0, 0, -0.2 - cheer * 2.2], blink: (Math.floor(t * 30) + i * 11) % 110 < 4 ? 1 : 0, mouth: cheer * 0.6, head: [0, 0, Math.sin(t * 2 + i) * 0.08]}} />
          {c.name ? <NameTag name={c.name} k={pop(wt, CROWD_START + 0.6 + i * 0.02, 0.3)} /> : null}
        </group>
      );
    })}
  </>
);

const HOUSE_COLS = ['#f6d36b', '#8fd0ff', '#ff9fb3', '#b6e38a', '#ffb36b', '#c9a8ff'];
const Houses: React.FC<{t: number}> = ({t}) => (
  <>
    {HOUSE_COLS.map((c, i) => {
      const col = [0, 1, 2, 0, 2, 1][i], row = [0, 0, 0, 1, 1, 1][i];
      const k = pop(t, HOUSES_START + i * 0.15, 0.4);
      if (k <= 0) return null;
      return (
        <group key={i} position={[-11 + col * 2.8, 0, 3 + row * 2.9 - 0.2]} scale={k}>
          <P geo={G.box} color={c} p={[0, 0.6, 0]} s={[1.6, 1.2, 1.4]} o={0.04} />
          <P geo={G.cone4} color={i % 2 ? '#d6402b' : '#7a4fd0'} p={[0, 1.55, 0]} r={[0, Math.PI / 4, 0]} s={[1.35, 0.75, 1.2]} o={0.04} />
          <P geo={G.box} color="#7b4a28" p={[0, 0.38, 0.71]} s={[0.36, 0.7, 0.04]} o={0.02} />
          <P geo={G.box} color="#cdeeff" p={[0.5, 0.75, 0.71]} s={[0.32, 0.3, 0.04]} o={0.02} />
        </group>
      );
    })}
  </>
);

const Campo: React.FC<{t: number}> = ({t}) => {
  const k = pop(t, CAMPO_START, 0.45);
  if (k <= 0) return null;
  const line = (p: V3, s: V3) => <mesh geometry={G.box} material={mat('#ffffff', {basic: true})} position={p} scale={s} />;
  return (
    <group position={[5.6, 0, -2.6]} scale={[k, 1, k]}>
      <mesh geometry={G.box} material={mat('#3fae4a')} position={[0, 0.06, 0]} scale={[5.2, 0.04, 3.6]} receiveShadow />
      {[-1.95, -1.3, -0.65, 0, 0.65, 1.3, 1.95].map((x, i) => (i % 2 ? <mesh key={i} geometry={G.box} material={mat('#36a043')} position={[x, 0.085, 0]} scale={[0.65, 0.01, 3.5]} /> : null))}
      {line([0, 0.09, 1.7], [5.0, 0.01, 0.06])}{line([0, 0.09, -1.7], [5.0, 0.01, 0.06])}
      {line([2.5, 0.09, 0], [0.06, 0.01, 3.4])}{line([-2.5, 0.09, 0], [0.06, 0.01, 3.4])}{line([0, 0.09, 0], [0.06, 0.01, 3.4])}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[2.55 * sx, 0, 0]}>
          <P geo={G.box} color="#ffffff" p={[0, 0.4, -0.55]} s={[0.07, 0.8, 0.07]} o={0.02} />
          <P geo={G.box} color="#ffffff" p={[0, 0.4, 0.55]} s={[0.07, 0.8, 0.07]} o={0.02} />
          <P geo={G.box} color="#ffffff" p={[0, 0.8, 0]} s={[0.07, 0.07, 1.17]} o={0.02} />
        </group>
      ))}
      <P geo={G.ball} color="#ffffff" p={[0.3, 0.22, 0.2]} s={0.14} o={0.03} />
    </group>
  );
};

import PEOPLE from '../people.json';
const FOLLOWERS: string[] = (PEOPLE as any).followers;
const ONLY_COMMENT: string[] = (PEOPLE as any).commenters;
const WALLS = ['#f6d36b', '#8fd0ff', '#ff9fb3', '#b6e38a', '#ffb36b', '#c9a8ff', '#f4e2bd', '#9ee6d8'];
const ROOFS = ['#d6402b', '#7a4fd0', '#2f6fd6', '#2d9a5a', '#c2571a'];
const ROWS = Math.ceil(FOLLOWERS.length / 4);
const AV_LEN = 12 + ROWS * 2.05;
// one house per follower: 4 rows (front/back on each side of the avenue)
const STREET_HOUSES = (() => {
  const out: {x: number; z: number; ry: number; name: string; i: number}[] = [];
  let n = 0;
  for (let k = 0; k < ROWS; k++) for (const [x, ry] of [[-3.4, Math.PI / 2], [3.4, -Math.PI / 2], [-6.2, Math.PI / 2], [6.2, -Math.PI / 2]] as [number, number][]) {
    if (n >= FOLLOWERS.length) break;
    out.push({x, z: 12 + k * 2.05, ry, name: FOLLOWERS[n], i: n});
    n++;
  }
  return out;
})();

const MiniHouse: React.FC<{i: number; k: number}> = ({i, k}) => (
  <group scale={k}>
    <P geo={G.box} color={WALLS[i % WALLS.length]} p={[0, 0.55, 0]} s={[1.5, 1.1, 1.5]} o={0.04} />
    <P geo={G.cone4} color={ROOFS[i % ROOFS.length]} p={[0, 1.45, 0]} r={[0, Math.PI / 4, 0]} s={[1.3, 0.7, 1.3]} o={0.04} />
    <P geo={G.box} color="#7b4a28" p={[0, 0.35, 0.76]} s={[0.34, 0.66, 0.04]} o={0.02} />
    <P geo={G.box} color="#cdeeff" p={[0.45, 0.72, 0.76]} s={[0.3, 0.28, 0.04]} o={0.02} />
  </group>
);

/** the "worse" house for people who only commented */
const Shack: React.FC<{k: number; i: number}> = ({k, i}) => (
  <group scale={k} rotation={[0, (i % 3 - 1) * 0.15, 0]}>
    <P geo={G.box} color={i % 2 ? '#a89f92' : '#9b8f7e'} p={[0, 0.4, 0]} r={[0, 0, 0.04]} s={[1.1, 0.8, 1.0]} o={0.04} />
    <P geo={G.box} color="#6e6255" p={[0.05, 0.9, 0]} r={[0, 0, 0.16]} s={[1.35, 0.08, 1.2]} o={0.03} />
    <P geo={G.box} color="#5c4630" p={[-0.2, 0.28, 0.51]} s={[0.28, 0.5, 0.03]} o={0.02} />
    <P geo={G.box} color="#3b3026" p={[0.28, 0.5, 0.51]} s={[0.24, 0.2, 0.03]} o={0.02} />
    <P geo={G.box} color="#8a6a45" p={[0.28, 0.5, 0.53]} r={[0, 0, 0.6]} s={[0.32, 0.05, 0.02]} o={0} />
  </group>
);

const Mansion: React.FC<{k: number}> = ({k}) => (
  <group scale={k}>
    <mesh geometry={G.box} material={mat('#9fd86a')} position={[0, 0.03, 0]} scale={[9, 0.06, 8]} receiveShadow />
    <P geo={G.box} color="#fbf6ea" p={[0, 1.3, -0.8]} s={[6, 2.6, 4]} o={0.05} />
    <P geo={G.box} color="#f3ead2" p={[0.4, 3.3, -1.2]} s={[4, 1.4, 3]} o={0.05} />
    <P geo={G.box} color="#e8b923" p={[0, 2.66, -0.8]} s={[6.3, 0.14, 4.3]} o={0.03} />
    <P geo={G.box} color="#e8b923" p={[0.4, 4.06, -1.2]} s={[4.3, 0.14, 3.3]} o={0.03} />
    {[-2.4, -0.8, 0.8, 2.4].map((x) => <P key={x} geo={G.cyl} color="#ffffff" p={[x, 1.3, 1.35]} s={[0.15, 2.6, 0.15]} o={0.02} />)}
    <P geo={G.box} color="#6b3e1f" p={[0, 0.75, 1.21]} s={[0.9, 1.5, 0.05]} o={0.02} />
    {[-1.8, 1.8].map((x) => <P key={x} geo={G.box} color="#8fd3ff" p={[x, 1.6, 1.21]} s={[0.8, 0.7, 0.05]} o={0.02} />)}
    <mesh geometry={G.box} material={mat('#3fb6f0', {emissive: '#1f6fa8'})} position={[2.6, 0.08, 3.0]} scale={[2.6, 0.06, 1.6]} />
    <P geo={G.box} color="#ffffff" p={[2.6, 0.06, 3.0]} s={[2.9, 0.08, 1.9]} o={0.02} />
    <P geo={G.box} color="#e8b923" p={[-3.5, 0.6, 3.6]} s={[0.15, 1.2, 0.15]} o={0.02} />
    <P geo={G.box} color="#e8b923" p={[-1.5, 0.6, 3.6]} s={[0.15, 1.2, 0.15]} o={0.02} />
    <P geo={G.box} color="#e8b923" p={[-2.5, 1.15, 3.6]} s={[2.1, 0.1, 0.1]} o={0.02} />
  </group>
);

const Street: React.FC<{t: number}> = ({t}) => {
  const len = (AV_LEN + 2) * easeOut(ramp(t, ROAD_START, ROAD_START + 1.3));
  return (
    <group>
      {len > 0.1 ? (
        <group>
          <mesh geometry={G.box} material={mat('#e3d8c4')} position={[0, 0.03, 3.6 + len / 2]} scale={[4.2, 0.05, len]} receiveShadow />
          <mesh geometry={G.box} material={mat('#3b3f46')} position={[0, 0.05, 3.6 + len / 2]} scale={[2.8, 0.05, len]} receiveShadow />
          {Array.from({length: Math.floor(len / 2)}).map((_, i) => (
            <mesh key={i} geometry={G.box} material={mat('#ffd21e', {basic: true})} position={[0, 0.08, 4.6 + i * 2]} scale={[0.12, 0.01, 0.9]} />
          ))}
        </group>
      ) : null}
      {STREET_HOUSES.map((h) => {
        const k = pop(t, STREET_START + (h.z - 12) * 0.012 + (Math.abs(h.x) > 4 ? 0.12 : 0) + (h.x > 0 ? 0.05 : 0), 0.35);
        if (k <= 0) return null;
        return (
          <group key={h.i} position={[h.x, 0, h.z]} rotation={[0, h.ry, 0]}>
            <MiniHouse i={h.i} k={k} />
            <Sign text={'@' + h.name} p={[0.55, 0, 1.05]} s={0.75 * k} postH={0.5} w={1.9} bg="#ffffff" fg="#14110c" />
          </group>
        );
      })}
      {/* outskirts: people who only commented */}
      {[...ONLY_COMMENT, ...Array(48 - ONLY_COMMENT.length).fill('')].map((name: string, i: number) => {
        const k = pop(t, i < 24 ? LONELY_START + i * 0.05 : SHACK2_START + (i - 24) * 0.04, 0.4);
        if (k <= 0) return null;
        const col = i % 8, row = Math.floor(i / 8);
        return (
          <group key={i} position={[-14 - col * 2.85 + (row % 2) * 0.6, 0, 12.5 + row * 3.2]} rotation={[0, Math.PI / 2, 0]}>
            <mesh geometry={G.box} material={mat('#b38a5e')} position={[0, 0.02, 0.2]} scale={[2.2, 0.04, 2.4]} receiveShadow />
            <Shack k={k} i={i} />
            {name ? <Sign text={'@' + name} p={[0.5, 0, 1.0]} s={0.65 * k} postH={0.45} w={1.9} bg="#d8cbb0" fg="#3a2d20" /> : null}
          </group>
        );
      })}
      {/* three empty mega mansions, reserved */}
      {[44, 56, 68].map((z, i) => {
        const k = pop(t, MANSION_START + i * 0.25, 0.5);
        if (k <= 0) return null;
        return (
          <group key={z} position={[-22, 0, z]} rotation={[0, Math.PI / 2, 0]}>
            <Mansion k={k} />
            {i === 0 ? (
              <Sign text="@nicollas__033" p={[2.4, 0, 4.3]} s={1.1 * k} postH={0.8} w={2.6} bg="#ffffff" fg="#14110c" />
            ) : i === 1 && t >= WINNER_T ? (
              <Sign text={'@' + (PEOPLE as any).winner2} p={[2.4, 0, 4.3]} s={1.1 * k * (0.6 + 0.4 * pop(t, WINNER_T, 0.35))} postH={0.8} w={2.6} bg="#ffffff" fg="#14110c" />
            ) : (
              <Sign text="RESERVADA" p={[2.4, 0, 4.3]} s={1.1 * k} postH={0.8} w={1.8} bg="#ffd21e" fg="#14110c" />
            )}
          </group>
        );
      })}
    </group>
  );
};

const NEW: string[] = (PEOPLE as any).new;
const TOTAL_FOLLOWERS = 8085;
const STREET_X = Array.from({length: 37}, (_, i) => -18 - i * 14);
const NEW_SLOTS = (() => {
  const out: {x: number; z: number; ry: number; name: string | null; i: number; d: number; st: number}[] = [];
  const need = TOTAL_FOLLOWERS - FOLLOWERS.length;
  let n = 0;
  for (const sx of STREET_X) for (let k = 0; k < 54 && n < need; k++) for (const [dx, ry] of [[-3.4, Math.PI / 2], [3.4, -Math.PI / 2], [-6.2, Math.PI / 2], [6.2, -Math.PI / 2]] as [number, number][]) {
    if (n >= need) break;
    const si = STREET_X.indexOf(sx);
    out.push({x: sx + dx, z: 82 + k * 2.05, ry, name: null, i: n, d: (si < 8 ? (si % 4) * 0.3 : si < 17 ? (si - 8) * 0.18 : si < 20 ? (si - 17) * 0.3 : (si - 20) * 0.09) + k * 0.006, st: si < 4 ? NEW_START : si < 8 ? NEW2_START : si < 17 ? NEW3_START : si < 20 ? NEW4_START : NEW5_START});
    n++;
  }
  out.filter((h) => Math.abs(h.x - STREET_X[0]) < 4).slice(0, NEW.length).forEach((h, i) => (h.name = NEW[i]));
  return out;
})();

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const NewStreets: React.FC<{t: number}> = ({t}) => {
  const plain = NEW_SLOTS.filter((h) => !h.name);
  const {walls, roofs} = useMemo(() => {
    const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 1.1, 1.5), new THREE.MeshStandardMaterial({flatShading: true, roughness: 0.85}), plain.length);
    const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(1.3, 0.7, 4), new THREE.MeshStandardMaterial({flatShading: true, roughness: 0.85}), plain.length);
    plain.forEach((h, j) => {
      walls.setColorAt(j, new THREE.Color(WALLS[(h.i * 7) % WALLS.length]));
      roofs.setColorAt(j, new THREE.Color(ROOFS[(h.i * 3) % ROOFS.length]));
    });
    walls.castShadow = roofs.castShadow = true;
    walls.receiveShadow = true;
    return {walls, roofs};
  }, []);
  plain.forEach((h, j) => {
    const k = Math.max(0.0001, pop(t, h.st + h.d, 0.35));
    _q.setFromEuler(_e.set(0, h.ry, 0));
    _m.compose(_p.set(h.x, 0.55 * k, h.z), _q, _s.set(k, k, k)); walls.setMatrixAt(j, _m);
    _q.setFromEuler(_e.set(0, h.ry + Math.PI / 4, 0));
    _m.compose(_p.set(h.x, 1.45 * k, h.z), _q, _s.set(k * 0.92, k, k * 0.92)); roofs.setMatrixAt(j, _m);
  });
  walls.instanceMatrix.needsUpdate = true; roofs.instanceMatrix.needsUpdate = true;
  const roadK = easeOut(ramp(t, NEW_START - 0.6, NEW_START));
  const roadK2 = easeOut(ramp(t, NEW2_START - 0.6, NEW2_START));
  const roadK3 = easeOut(ramp(t, NEW3_START - 0.6, NEW3_START));
  const roadK4 = easeOut(ramp(t, NEW4_START - 0.6, NEW4_START));
  const roadK5 = easeOut(ramp(t, NEW5_START - 0.6, NEW5_START));
  return (
    <group>
      {roadK > 0.01 ? (
        <group>
          <mesh geometry={G.box} material={mat('#3b3f46')} position={[-31, 0.05, 78]} scale={[62 * roadK, 0.05, 2.8]} receiveShadow />
          {roadK2 > 0.01 ? <mesh geometry={G.box} material={mat('#3b3f46')} position={[-62 - 30 * roadK2, 0.05, 78]} scale={[60 * roadK2, 0.05, 2.8]} receiveShadow /> : null}
          {roadK3 > 0.01 ? <mesh geometry={G.box} material={mat('#3b3f46')} position={[-122 - 64 * roadK3, 0.05, 78]} scale={[128 * roadK3, 0.05, 2.8]} receiveShadow /> : null}
          {roadK4 > 0.01 ? <mesh geometry={G.box} material={mat('#3b3f46')} position={[-250 - 21 * roadK4, 0.05, 78]} scale={[42 * roadK4, 0.05, 2.8]} receiveShadow /> : null}
          {roadK5 > 0.01 ? <mesh geometry={G.box} material={mat('#3b3f46')} position={[-292 - 119 * roadK5, 0.05, 78]} scale={[238 * roadK5, 0.05, 2.8]} receiveShadow /> : null}
          {STREET_X.map((x, si) => { const rk = si < 4 ? roadK : si < 8 ? roadK2 : si < 17 ? roadK3 : si < 20 ? roadK4 : roadK5; if (rk <= 0.01) return null; return (
            <group key={x}>
              <mesh geometry={G.box} material={mat('#e3d8c4')} position={[x, 0.03, 78 + 56 * rk]} scale={[4.2, 0.05, 112 * rk]} receiveShadow />
              <mesh geometry={G.box} material={mat('#3b3f46')} position={[x, 0.05, 78 + 56 * rk]} scale={[2.8, 0.05, 112 * rk]} receiveShadow />
            </group>
          ); })}
        </group>
      ) : null}
      <primitive object={walls} />
      <primitive object={roofs} />
      {NEW_SLOTS.filter((h) => h.name).map((h) => {
        const k = pop(t, h.st + h.d, 0.35);
        if (k <= 0) return null;
        return (
          <group key={h.i} position={[h.x, 0, h.z]} rotation={[0, h.ry, 0]}>
            <MiniHouse i={h.i + 3} k={k} />
            <Sign text={'@' + h.name} p={[0.55, 0, 1.05]} s={0.75 * k} postH={0.5} w={1.9} bg="#ffffff" fg="#14110c" />
          </group>
        );
      })}
    </group>
  );
};

const Mercadinho: React.FC<{t: number; p?: V3; ry?: number; sc?: number}> = ({t, p, ry, sc}) => {
  const k = pop(t, MERC_T, 0.5);
  const awn = useMemo(() => texMat(stripeTexture('#2d9a5a', '#ffffff', 10)), []);
  const word = useMemo(() => texMat(textTexture('MERCADINHO', {bg: '#ffffff', fg: '#2d9a5a', border: '#14110c'})), []);
  if (k <= 0) return null;
  return (
    <group position={p ?? [5.6, 0, -2.4]} rotation={[0, ry ?? -0.35, 0]} scale={k * (sc ?? 1)}>
      <P geo={G.box} color="#d9c7a4" p={[0, 0.06, 0]} s={[3.6, 0.12, 3.0]} o={0.03} />
      <P geo={G.box} color="#fff6e0" p={[0, 1.0, 0]} s={[3.0, 1.8, 2.4]} o={0.04} />
      <P geo={G.box} color="#2d9a5a" p={[0, 2.0, 0]} s={[3.2, 0.25, 2.6]} o={0.04} />
      <group position={[0, 1.45, 1.35]}>
        <mesh geometry={G.box} material={awn} scale={[3.1, 0.08, 0.7]} rotation={[0.35, 0, 0]} castShadow />
        <mesh geometry={G.box} material={OUTLINE} scale={[3.14, 0.12, 0.74]} rotation={[0.35, 0, 0]} />
      </group>
      <mesh geometry={G.box} material={word} position={[0, 2.5, 1.0]} scale={[2.4, 0.6, 0.08]} />
      <P geo={G.box} color="#8fd3ff" p={[-0.7, 0.8, 1.21]} s={[1.1, 0.9, 0.05]} o={0.02} />
      <P geo={G.box} color="#7b4a28" p={[0.8, 0.55, 1.21]} s={[0.6, 1.0, 0.05]} o={0.02} />
      {[[-1.2, '#e2483d'], [-0.9, '#ff9d1a'], [1.4, '#5ec26a']].map(([x, c], i) => (
        <P key={i} geo={G.ball} color={c as string} p={[x as number, 0.35, 1.6]} s={0.22} o={0.03} />
      ))}
    </group>
  );
};

const WORKERS: string[] = ['a.fernandozx', 'ericksanttos_10', 'dias_1353'];
const STAFF: string[] = ['tiaguinho.thp', 'sosoh124365', 'lauraso_uza'];
const CREW: string[] = ['deboragisella2026', 'deassisverax'];
const POLICE: string[] = (PEOPLE as any).police;
const Shopping: React.FC<{t: number; tt: number; p?: V3; ry?: number; sc?: number}> = ({t, tt, p, ry, sc}) => {
  const k = pop(t, SHOP_T, 0.55);
  const word = useMemo(() => texMat(textTexture('SHOPPING CIDADE DO INSTA', {bg: '#1e3a8a', fg: '#ffffff', border: '#14110c', w: 1024, h: 160, size: 80})), []);
  const owner = useMemo(() => texMat(textTexture('DONO: ???', {bg: '#ffd21e', fg: '#14110c', border: '#14110c'})), []);
  if (k <= 0) return null;
  return (
    <group position={p ?? [0, 0, -15]} rotation={[0, ry ?? 0, 0]} scale={sc ?? 1}>
      <group scale={k}>
        <mesh geometry={G.box} material={mat('#9aa0a6')} position={[0, 0.03, 4.2]} scale={[18, 0.05, 5]} receiveShadow />
        {[-7, -4.5, -2, 2, 4.5, 7].map((x, i) => (
          <group key={x} position={[x, 0, 4.6 + (i % 2) * 0.4]}>
            <P geo={G.box} color={['#e2483d', '#2f6fd6', '#f2b134', '#5ec26a', '#ffffff', '#7a4fd0'][i]} p={[0, 0.35, 0]} s={[0.9, 0.4, 1.6]} o={0.03} />
            <P geo={G.box} color="#cdeeff" p={[0, 0.7, -0.1]} s={[0.75, 0.35, 0.9]} o={0.03} />
          </group>
        ))}
        <P geo={G.box} color="#f4f6fb" p={[0, 2.0, -1]} s={[16, 4, 6]} o={0.05} />
        <P geo={G.box} color="#2f6fd6" p={[0, 4.15, -1]} s={[16.4, 0.4, 6.4]} o={0.04} />
        <P geo={G.box} color="#8fd3ff" p={[0, 1.7, 2.02]} s={[12, 2.6, 0.06]} o={0.02} />
        {[-4, -2, 0, 2, 4].map((x) => <P key={x} geo={G.box} color="#ffffff" p={[x, 1.7, 2.06]} s={[0.12, 2.6, 0.04]} o={0} />)}
        <P geo={G.box} color="#1e3a8a" p={[0, 0.9, 2.1]} s={[2.2, 1.8, 0.08]} o={0.02} />
        <mesh geometry={G.box} material={word} position={[0, 3.4, 2.08]} scale={[11, 1.7, 0.1]} />
        <group position={[0, 5.4, 0]} rotation={[0, Math.sin(tt * 1.5) * 0.3, 0]}>
          <P geo={G.box} color="#d62976" p={[0, 0, 0]} s={[1.6, 1.8, 0.6]} o={0.04} />
          <P geo={G.box} color="#14110c" p={[0, 1.1, 0]} s={[0.9, 0.12, 0.12]} o={0} />
        </group>
        <group position={[8.6, 0, 3.2]}>
          <P geo={G.box} color="#6b4423" p={[0, 0.6, 0]} s={[0.1, 1.2, 0.1]} o={0.02} />
          <mesh geometry={G.box} material={owner} position={[0, 1.4, 0.06]} scale={[2.0, 0.6, 0.06]} />
        </group>
      </group>
      {WORKERS.map((w, i) => {
        const kk = pop(t, WORKERS_T + i * 0.25, 0.4);
        if (kk <= 0) return null;
        const x = -1.5 + i * 1.5;
        return (
          <group key={w} position={[x, 0, 5.4]}>
            <Capy scale={0.7 * kk} shirt="#d62976" cap="#1e3a8a" pose={{armL: [0, 0, 0.3 + Math.max(0, Math.sin(tt * 6 + i)) * 1.8], armR: [0, 0, -0.2], mouth: 0.3, head: [0, 0, Math.sin(tt * 2 + i) * 0.08]}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};

const Hospital: React.FC<{t: number; tt: number; p?: V3; ry?: number; sc?: number}> = ({t, tt, p, ry, sc}) => {
  const k = pop(t, HOSP_T, 0.55);
  const word = useMemo(() => texMat(textTexture('HOSPITAL', {bg: '#ffffff', fg: '#e2483d', border: '#14110c', w: 512, h: 150, size: 96})), []);
  if (k <= 0) return null;
  const on = Math.floor(tt * 6) % 2 === 0;
  const ambK = easeOut(ramp(t, AMB_T, AMB_T + 1.6));
  return (
    <group position={p ?? [24, 0, -14]} rotation={[0, ry ?? 0, 0]} scale={sc ?? 1}>
      <group scale={k}>
        <mesh geometry={G.box} material={mat('#9aa0a6')} position={[0, 0.03, 5]} scale={[14, 0.05, 5]} receiveShadow />
        <P geo={G.box} color="#f4f6fb" p={[0, 2.6, -1]} s={[12, 5.2, 6]} o={0.05} />
        <P geo={G.box} color="#f4f6fb" p={[0, 6.1, -1.5]} s={[6, 1.8, 4]} o={0.05} />
        <P geo={G.box} color="#e2483d" p={[0, 5.3, -1]} s={[12.3, 0.3, 6.3]} o={0.03} />
        {[-4, -2, 2, 4].map((x) => [1.4, 3.4].map((y) => <P key={x + '_' + y} geo={G.box} color="#8fd3ff" p={[x, y, 2.02]} s={[1.2, 0.9, 0.05]} o={0.02} />))}
        <P geo={G.box} color="#8fd3ff" p={[0, 1.0, 2.02]} s={[2.2, 2.0, 0.05]} o={0.02} />
        <mesh geometry={G.box} material={word} position={[0, 4.4, 2.08]} scale={[4.6, 1.3, 0.1]} />
        <group position={[0, 7.6, -1.5]}>
          <P geo={G.box} color="#e2483d" s={[0.5, 1.6, 0.3]} o={0.03} />
          <P geo={G.box} color="#e2483d" s={[1.6, 0.5, 0.3]} o={0.03} />
        </group>
      </group>
      {/* ambulance */}
      {t >= AMB_T ? (
        <group position={[-3.2, 0, 22 - 16.5 * ambK]} rotation={[0, Math.PI, 0]}>
          <P geo={G.box} color="#ffffff" p={[0, 0.85, 0]} s={[1.6, 1.4, 3.2]} o={0.04} />
          <P geo={G.box} color="#ffffff" p={[0, 0.65, -2.0]} s={[1.6, 1.0, 1.0]} o={0.04} />
          <P geo={G.box} color="#8fd3ff" p={[0, 0.95, -2.45]} s={[1.4, 0.45, 0.1]} o={0.02} />
          <P geo={G.box} color="#e2483d" p={[0, 0.85, 0]} s={[1.62, 0.25, 3.22]} o={0} />
          <P geo={G.box} color={on ? '#ff2a2a' : '#5a0000'} p={[-0.4, 1.65, -1.2]} s={[0.4, 0.2, 0.3]} o={0.02} material={on ? mat('#ff2a2a', {basic: true}) : undefined} />
          <P geo={G.box} color={on ? '#00163a' : '#2a6bff'} p={[0.4, 1.65, -1.2]} s={[0.4, 0.2, 0.3]} o={0.02} material={!on ? mat('#2a6bff', {basic: true}) : undefined} />
          {[[-0.8, 1.0], [0.8, 1.0], [-0.8, -1.8], [0.8, -1.8]].map(([x, z], i) => <P key={i} geo={G.cyl12} color="#222" p={[x, 0.3, z]} r={[0, 0, Math.PI / 2]} s={[0.3, 0.2, 0.3]} o={0.02} />)}
        </group>
      ) : null}
      {STAFF.map((w, i) => {
        const kk = pop(t, STAFF_T + i * 0.3, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[-1.6 + i * 1.6, 0, 5]}>
            <Capy scale={0.7 * kk} shirt={i === 0 ? '#ffffff' : i === 1 ? '#7fd1c7' : '#2f6fd6'} cap={i === 1 ? '#ffffff' : null} pose={{armL: [0, 0, 0.3 + Math.max(0, Math.sin(tt * 6 + i)) * 1.8], armR: [0, 0, -0.2], mouth: 0.3, head: [0, 0, Math.sin(tt * 2 + i) * 0.08]}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};

const Plane: React.FC = () => (
  <group>
    <P geo={G.cyl12} color="#ffffff" r={[Math.PI / 2, 0, 0]} s={[0.9, 9, 0.9]} o={0.05} />
    <P geo={G.ball} color="#ffffff" p={[0, 0, 4.5]} s={[0.9, 0.9, 1.4]} o={0.05} />
    <P geo={G.cone6} color="#ffffff" p={[0, 0.2, -5.2]} r={[-Math.PI / 2, 0, 0]} s={[0.85, 1.8, 0.85]} o={0.05} />
    <P geo={G.box} color="#2f6fd6" p={[0, 0, 0.5]} s={[12, 0.2, 2.0]} o={0.04} />
    <P geo={G.box} color="#2f6fd6" p={[0, 0.2, -5.0]} s={[4.4, 0.16, 1.1]} o={0.03} />
    <P geo={G.box} color="#e2483d" p={[0, 1.4, -5.3]} s={[0.18, 2.2, 1.3]} o={0.03} />
    <P geo={G.box} color="#2f6fd6" p={[0, 0, 0]} s={[1.84, 0.25, 9.02]} o={0} />
    <P geo={G.box} color="#1e3a8a" p={[0, 0.45, 4.7]} s={[1.1, 0.3, 0.6]} o={0} />
    {[-3.2, 3.2].map((x) => <P key={x} geo={G.cyl12} color="#9aa0a6" p={[x, -0.5, 1.2]} r={[Math.PI / 2, 0, 0]} s={[0.45, 1.6, 0.45]} o={0.03} />)}
  </group>
);

const Airport: React.FC<{t: number; tt: number; p?: V3; ry?: number; sc?: number}> = ({t, tt, p, ry, sc}) => {
  const k = pop(t, AIR_T, 0.55);
  const word = useMemo(() => texMat(textTexture('AEROPORTO CIDADE DO INSTA', {bg: '#ffffff', fg: '#1e3a8a', border: '#14110c', w: 1024, h: 160, size: 78})), []);
  if (k <= 0) return null;
  // landing: descend along -z → +z over the runway, then roll
  const lk = clamp((t - LAND_T) / 3.2);
  const z = -90 + 110 * easeOut(lk);
  const y = lk < 0.55 ? 22 * (1 - lk / 0.55) + 1.4 : 1.4;
  const pitch = lk < 0.55 ? 0.12 : 0;
  return (
    <group position={p ?? [56, 0, 0]} rotation={[0, ry ?? 0, 0]} scale={sc ?? 1}>
      <group scale={[1, k, 1]}>
        <mesh geometry={G.box} material={mat('#3b3f46')} position={[0, 0.06, -15]} scale={[8, 0.06, 130]} receiveShadow />
        {Array.from({length: 26}).map((_, i) => <mesh key={i} geometry={G.box} material={mat('#ffffff', {basic: true})} position={[0, 0.1, -75 + i * 5]} scale={[0.35, 0.01, 2.4]} />)}
      </group>
      <group scale={k}>
        <P geo={G.box} color="#e8eef6" p={[-12, 2.2, 2]} s={[8, 4.4, 20]} o={0.05} />
        <P geo={G.box} color="#8fd3ff" p={[-7.95, 2.2, 2]} s={[0.1, 3, 18]} o={0.02} />
        <mesh geometry={G.box} material={word} position={[-7.85, 4.9, 2]} rotation={[0, Math.PI / 2, 0]} scale={[16, 1.6, 0.1]} />
        <P geo={G.cyl12} color="#e8eef6" p={[-12, 6, 16]} s={[1.2, 12, 1.2]} o={0.04} />
        <P geo={G.cyl12} color="#8fd3ff" p={[-12, 12.6, 16]} s={[2.4, 1.4, 2.4]} o={0.04} />
        <P geo={G.cone6} color="#e2483d" p={[-12, 13.8, 16]} s={[2.6, 1, 2.6]} o={0.04} />
        <P geo={G.ball} color={Math.floor(tt * 3) % 2 ? '#ff2a2a' : '#5a0000'} p={[-12, 14.5, 16]} s={0.35} o={0} material={Math.floor(tt * 3) % 2 ? mat('#ff2a2a', {basic: true}) : undefined} />
      </group>
      {t >= LAND_T - 0.1 ? (
        <group position={[0, y, z]} rotation={[pitch, 0, 0]}>
          <Plane />
        </group>
      ) : null}
      {CREW.map((w, i) => {
        const kk = pop(t, CREW_T + i * 0.3, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[-5.5, 0, 28 + i * 1.7]} rotation={[0, -Math.PI / 2, 0]}>
            <Capy scale={0.75 * kk} shirt={i === 0 ? '#1e3a8a' : '#e2483d'} cap={i === 0 ? '#1e3a8a' : null} pose={{armL: [0, 0, 0.3 + Math.max(0, Math.sin(tt * 6 + i)) * 1.8], armR: [0, 0, -0.2], mouth: 0.3, head: [0, 0, Math.sin(tt * 2 + i) * 0.08]}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};

const Police: React.FC<{t: number; tt: number; p?: V3; ry?: number; sc?: number}> = ({t, tt, p, ry, sc}) => {
  const k = pop(t, POL_T, 0.55);
  const word = useMemo(() => texMat(textTexture('DELEGACIA', {bg: '#1e3a8a', fg: '#ffffff', border: '#14110c', w: 512, h: 150, size: 92})), []);
  if (k <= 0) return null;
  const on = Math.floor(tt * 7) % 2 === 0;
  const ck = easeOut(ramp(t, CAR_T, CAR_T + 1.4));
  return (
    <group position={p ?? [-25, 0, -14]} rotation={[0, ry ?? 0, 0]} scale={sc ?? 1}>
      <group scale={k}>
        <mesh geometry={G.box} material={mat('#9aa0a6')} position={[0, 0.03, 5]} scale={[13, 0.05, 6]} receiveShadow />
        <P geo={G.box} color="#dfe6ef" p={[0, 2.2, -1]} s={[11, 4.4, 6]} o={0.05} />
        <P geo={G.box} color="#1e3a8a" p={[0, 4.55, -1]} s={[11.3, 0.4, 6.3]} o={0.04} />
        {[-3.6, 3.6].map((x) => <P key={x} geo={G.box} color="#8fd3ff" p={[x, 2.2, 2.02]} s={[2.2, 1.4, 0.05]} o={0.02} />)}
        <P geo={G.box} color="#1e3a8a" p={[0, 1.1, 2.02]} s={[2.0, 2.2, 0.06]} o={0.02} />
        <mesh geometry={G.box} material={word} position={[0, 3.7, 2.08]} scale={[5.2, 1.4, 0.1]} />
        <group position={[0, 5.9, -1]}>
          <P geo={G.cyl12} color="#ffd21e" s={[0.9, 0.25, 0.9]} o={0.03} />
          <P geo={G.cone6} color="#ffd21e" p={[0, 0.5, 0]} s={[0.6, 0.7, 0.6]} o={0.03} />
        </group>
      </group>
      {t >= CAR_T ? (
        <group position={[-4.2 + 0 * ck, 0, 26 - 20 * ck]} rotation={[0, Math.PI, 0]}>
          <P geo={G.box} color="#ffffff" p={[0, 0.55, 0]} s={[1.6, 0.7, 3.2]} o={0.04} />
          <P geo={G.box} color="#14110c" p={[0, 1.1, 0.1]} s={[1.4, 0.55, 1.7]} o={0.04} />
          <P geo={G.box} color="#1e3a8a" p={[0, 0.55, 0]} s={[1.62, 0.3, 3.22]} o={0} />
          <P geo={G.box} color={on ? '#ff2a2a' : '#5a0000'} p={[-0.35, 1.45, 0.1]} s={[0.5, 0.2, 0.3]} o={0.02} material={on ? mat('#ff2a2a', {basic: true}) : undefined} />
          <P geo={G.box} color={on ? '#00163a' : '#2a6bff'} p={[0.35, 1.45, 0.1]} s={[0.5, 0.2, 0.3]} o={0.02} material={!on ? mat('#2a6bff', {basic: true}) : undefined} />
          {[[-0.8, 1.0], [0.8, 1.0], [-0.8, -1.0], [0.8, -1.0]].map(([x, z], i) => <P key={i} geo={G.cyl12} color="#222" p={[x, 0.3, z]} r={[0, 0, Math.PI / 2]} s={[0.3, 0.2, 0.3]} o={0.02} />)}
        </group>
      ) : null}
      {POLICE.map((w, i) => {
        const kk = pop(t, COPS_T + i * 0.3, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[-1.6 + i * 1.6, 0, 5]}>
            <Capy scale={0.7 * kk} shirt="#1e3a8a" cap="#1e3a8a" pose={{armL: [0, 0, 0.3 + Math.max(0, Math.sin(tt * 6 + i)) * 1.8], armR: [-1.2, 0, -0.3], mouth: 0.3, brow: -0.2, head: [0, 0, Math.sin(tt * 2 + i) * 0.08]}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};

const Castle: React.FC<{t: number; tt: number; p?: V3; ry?: number; sc?: number}> = ({t, tt, p, ry, sc}) => {
  const k = pop(t, CASTLE_T, 0.6);
  const sign = useMemo(() => texMat(textTexture('SEU NOME AQUI', {bg: '#ffd21e', fg: '#14110c', border: '#14110c'})), []);
  if (k <= 0) return null;
  const towers: [number, number][] = [[-5, -5], [5, -5], [-5, 5], [5, 5]];
  return (
    <group position={p ?? [-50, 0, 40]} rotation={[0, ry ?? 0, 0]} scale={k * (sc ?? 1)}>
      <mesh geometry={G.cyl12} material={mat('#4fb3ea', {emissive: '#1f6fa8'})} position={[0, 0.05, 0]} scale={[10, 0.06, 10]} />
      <mesh geometry={G.cyl12} material={mat('#9fd86a')} position={[0, 0.08, 0]} scale={[8.2, 0.06, 8.2]} receiveShadow />
      <P geo={G.box} color="#e9dcc3" p={[0, 2.2, 0]} s={[9, 4.4, 9]} o={0.06} />
      {[-3.6, -1.2, 1.2, 3.6].map((x) => <P key={x} geo={G.box} color="#e9dcc3" p={[x, 4.75, 4.4]} s={[0.9, 0.7, 0.4]} o={0.03} />)}
      <P geo={G.box} color="#f2e6cf" p={[0, 6.0, 0]} s={[4.6, 3.6, 4.6]} o={0.05} />
      <P geo={G.cone4} color="#7a4fd0" p={[0, 8.9, 0]} r={[0, Math.PI / 4, 0]} s={[3.6, 2.4, 3.6]} o={0.05} />
      {towers.map(([x, z]) => (
        <group key={x + '_' + z} position={[x, 0, z]}>
          <P geo={G.cyl12} color="#f2e6cf" p={[0, 3.6, 0]} s={[1.3, 7.2, 1.3]} o={0.05} />
          <P geo={G.cone6} color="#d62976" p={[0, 8.2, 0]} s={[1.6, 2.2, 1.6]} o={0.05} />
          <P geo={G.box} color="#ffd21e" p={[0, 9.6, 0]} r={[0, tt, 0]} s={[0.05, 0.9, 0.05]} o={0} />
          <P geo={G.box} color="#ffd21e" p={[0.35, 9.9, 0]} r={[0, 0, Math.sin(tt * 4) * 0.2]} s={[0.7, 0.4, 0.04]} o={0.02} />
        </group>
      ))}
      <P geo={G.box} color="#6b3e1f" p={[0, 1.2, 4.52]} s={[1.8, 2.4, 0.06]} o={0.03} />
      <P geo={G.box} color="#8a6a45" p={[0, 0.1, 7.2]} s={[1.8, 0.12, 4]} o={0.03} />
      <group position={[3.2, 0, 8.6]}>
        <P geo={G.box} color="#6b4423" p={[0, 0.7, 0]} s={[0.12, 1.4, 0.12]} o={0.02} />
        <mesh geometry={G.box} material={sign} position={[0, 1.7, 0.08]} scale={[2.8, 0.8, 0.08]} />
      </group>
    </group>
  );
};

const FURS = ['#a8683a', '#d9a066', '#7a4826', '#c9c2b8', '#e8b07a'];
const SC_SHIRTS = ['#2f6fd6', '#e2483d', '#ffffff', '#d62976', '#2d9a5a', '#1e3a8a'];
const SC_CAPS = ['#e2483d', null, '#ffffff', '#1e3a8a', null, '#ffd21e'];
/** customizable character on a spinning pedestal */
const Showcase: React.FC<{t: number; tt: number; p?: V3; ry?: number; sc?: number}> = ({t, tt, p, ry, sc}) => {
  const k = pop(t, SHOW_T, 0.5);
  if (k <= 0) return null;
  const step = Math.floor(Math.max(0, tt - SHOW_T) / 0.55);
  const sw = pop(tt, SHOW_T + step * 0.55, 0.25);
  return (
    <group position={p ?? [-5, 0, -4]} rotation={[0, ry ?? 0, 0]} scale={sc ?? 1}>
      <P geo={G.cyl12} color="#ffd21e" p={[0, 0.2, 0]} s={[1.3, 0.4, 1.3]} o={0.04} />
      <P geo={G.cyl12} color="#ffffff" p={[0, 0.42, 0]} s={[1.15, 0.06, 1.15]} o={0} />
      <group position={[0, 0.45, 0]} rotation={[0, tt * 1.4, 0]} scale={k * (0.9 + 0.1 * sw)}>
        <Capy scale={0.9} fur={FURS[step % FURS.length]} shirt={SC_SHIRTS[step % SC_SHIRTS.length]} cap={SC_CAPS[step % SC_CAPS.length]} hat={step % 6 === 4} orange={step % 7 === 3}
          pose={{armL: [0, 0, 0.3 + Math.max(0, Math.sin(tt * 5)) * 1.6], armR: [0, 0, -0.3], mouth: 0.35, brow: 0.3, blink: Math.floor(tt * 30) % 90 < 4 ? 1 : 0}} />
      </group>
      {Array.from({length: 10}).map((_, i) => {
        const a = tt * 1.5 + (i / 10) * Math.PI * 2;
        return <mesh key={i} geometry={G.ballLo} material={mat(['#ffd21e', '#ffffff', '#d62976'][i % 3], {basic: true})} position={[Math.cos(a) * 1.7, 0.8 + ((i * 0.37 + tt * 0.6) % 2.2), Math.sin(a) * 1.7]} scale={0.07} />;
      })}
    </group>
  );
};

export {Pizzaria, Mercadinho, Shopping, Hospital, Airport, Police, Castle, Showcase, Mansion, MiniHouse, Shack, NameTag, TreeM, Bench, CROWD, WALLS, ROOFS, FOLLOWERS, ONLY_COMMENT, NEW};
