import React, {useMemo} from 'react';
import * as THREE from 'three';
import {G, P, mat, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, BasePlateStuds, boxShell, cylShell, Drop} from './Usina';
import {pop, ramp, clamp, easeOut, PQ, LOOP_AT, TOTAL_SEC} from '../timeline';
import {PARQUE, TRACK, trainU} from './coaster';
import PEOPLE from '../people.json';

const STAFF: string[] = (PEOPLE as any).park;
const PREF: string = (PEOPLE as any).prefeito_ep15;
const [CX, CZ] = PARQUE;

// LEGO pieces for the gate pillars and the carousel base
const GATE = [...boxShell(-3.4, -9.4, 1.2, 1.2, 3.85, ['#e2483d', '#ffd21e'], PQ.PORTAO, 0.35), ...boxShell(3.4, -9.4, 1.2, 1.2, 3.85, ['#e2483d', '#ffd21e'], PQ.PORTAO + 0.05, 0.35)];
const CAROUSEL_BASE = cylShell(5.2, -3.6, () => 2.8, 1.1, (L) => (L % 2 ? '#ff7aa8' : '#ffffff'), PQ.CARROSSEL, 0.35);

/** ring of bricks in a vertical plane (the Ferris wheel), built one by one */
const WheelRing: React.FC<{t: number; r: number; n: number; t0: number; dur: number}> = ({t, r, n, t0, dur}) => {
  const m = useMemo(() => {
    const body = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.5, 0.55), new THREE.MeshStandardMaterial({flatShading: true, roughness: 0.55}), n);
    const studs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 8), new THREE.MeshStandardMaterial({flatShading: true, roughness: 0.55}), n * 2);
    const cols = ['#2f6fd6', '#ffd21e', '#e2483d', '#2d9a5a'];
    for (let i = 0; i < n; i++) { const c = new THREE.Color(cols[i % 4]); body.setColorAt(i, c); studs.setColorAt(i * 2, c); studs.setColorAt(i * 2 + 1, c); }
    body.frustumCulled = false; studs.frustumCulled = false; body.castShadow = true;
    return {body, studs};
  }, [n]);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(), off = new THREE.Vector3();
  const chord = 2 * r * Math.sin(Math.PI / n) + 0.05;
  for (let i = 0; i < n; i++) {
    const k = clamp((t - (t0 + (i / n) * dur)) / 0.12);
    const v = k > 0 ? 1 : 0.0001;
    const a = (i / n) * Math.PI * 2;
    const rr = r + (1 - easeOut(k)) * 1.2;
    q.setFromEuler(e.set(0, 0, a + Math.PI / 2));
    M.compose(p.set(Math.cos(a) * rr, Math.sin(a) * rr, 0), q, s.set(chord * v, v, v)); m.body.setMatrixAt(i, M);
    for (const sg of [-1, 1]) {
      off.set(sg * chord * 0.25, 0.3, 0).applyQuaternion(q);
      M.compose(p.set(Math.cos(a) * rr + off.x, Math.sin(a) * rr + off.y, off.z), q, s.set(v, v, v));
      m.studs.setMatrixAt(i * 2 + (sg > 0 ? 1 : 0), M);
    }
  }
  m.body.instanceMatrix.needsUpdate = true; m.studs.instanceMatrix.needsUpdate = true;
  return (
    <>
      <primitive object={m.body} />
      <primitive object={m.studs} />
    </>
  );
};

/** track pieces snapping along the path + brick support pillars */
const NSEG = 150;
const SEGS = (() => {
  const out: {p: THREE.Vector3; q: THREE.Quaternion; len: number}[] = [];
  for (let i = 0; i < NSEG; i++) {
    const a = TRACK.getPointAt(i / NSEG), b = TRACK.getPointAt((i + 1) / NSEG);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const m = new THREE.Matrix4().lookAt(a, b, new THREE.Vector3(0, 1, 0));
    out.push({p: a.clone().add(b).multiplyScalar(0.5), q: new THREE.Quaternion().setFromRotationMatrix(m), len});
  }
  return out;
})();
const PILLARS = SEGS.filter((_, i) => i % 6 === 0).map((s, i) => ({x: s.p.x, z: s.p.z, h: s.p.y - 0.5, i}));
const Track: React.FC<{t: number}> = ({t}) => {
  const m = useMemo(() => {
    const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1.15, 0.16, 1), new THREE.MeshStandardMaterial({color: '#e2483d', flatShading: true}), NSEG);
    const tie = new THREE.InstancedMesh(new THREE.BoxGeometry(1.35, 0.1, 0.22), new THREE.MeshStandardMaterial({color: '#3b3f46', flatShading: true}), NSEG);
    const nP = PILLARS.length * 24;
    const pil = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.52, 0.5), new THREE.MeshStandardMaterial({color: '#ffd21e', flatShading: true}), nP);
    for (const x of [rail, tie, pil]) { x.frustumCulled = false; x.castShadow = true; }
    return {rail, tie, pil};
  }, []);
  const M = new THREE.Matrix4(), p = new THREE.Vector3(), s = new THREE.Vector3(), q0 = new THREE.Quaternion();
  const t0 = PQ.MONTANHA, dur = 1.3;
  SEGS.forEach((g, i) => {
    const k = clamp((t - (t0 + 0.25 + (i / NSEG) * dur)) / 0.1);
    const v = k > 0 ? 1 : 0.0001;
    M.compose(p.copy(g.p).add(new THREE.Vector3(0, (1 - easeOut(k)) * 1.2, 0)), g.q, s.set(v, v, g.len * 1.04 * v)); m.rail.setMatrixAt(i, M);
    M.compose(p.copy(g.p).add(new THREE.Vector3(0, -0.12 + (1 - easeOut(k)) * 1.2, 0)), g.q, s.set(v, v, v)); m.tie.setMatrixAt(i, M);
  });
  let n = 0;
  PILLARS.forEach((pl) => {
    const layers = Math.max(1, Math.round(pl.h / 0.52));
    for (let L = 0; L < 24; L++) {
      const k = L < layers ? clamp((t - (t0 + (pl.i / PILLARS.length) * dur * 0.9 + L * 0.012)) / 0.08) : 0;
      const v = k > 0 ? 1 : 0.0001;
      M.compose(p.set(pl.x, 0.72 + L * 0.52 + (1 - easeOut(k)) * 0.6, pl.z), q0, s.set(v, v, v)); m.pil.setMatrixAt(n++, M);
    }
  });
  for (const x of [m.rail, m.tie, m.pil]) x.instanceMatrix.needsUpdate = true;
  return (
    <>
      <primitive object={m.rail} />
      <primitive object={m.tie} />
      <primitive object={m.pil} />
    </>
  );
};

const Car: React.FC<{c: string; riders: {shirt: string; cap: string | null; name?: string}[]; tt: number; scream: number}> = ({c, riders, tt, scream}) => (
  <group>
    <P geo={G.box} color={c} p={[0, 0.45, 0]} s={[1.3, 0.6, 1.7]} o={0.04} />
    <P geo={G.box} color="#ffd21e" p={[0, 0.5, 0.9]} s={[1.32, 0.5, 0.12]} o={0.02} />
    {riders.map((r, i) => (
      <group key={i} position={[(i - (riders.length - 1) / 2) * 0.62, 0.35, 0]}>
        <Capy scale={0.42} shirt={r.shirt} cap={r.cap} sash={!!r.name}
          pose={{armL: [0, 0, 0.4 + scream * 2.4 + Math.sin(tt * 9 + i) * 0.2], armR: [0, 0, -0.4 - scream * 2.4 - Math.sin(tt * 9 + i + 1) * 0.2], mouth: 0.3 + scream * 0.7, brow: 0.5 * scream, blink: 0}} />
        {r.name ? <group scale={0.75}><NameTag name={r.name} k={1} /></group> : null}
      </group>
    ))}
  </group>
);
const TRAIN = [
  {c: '#2f6fd6', riders: [{shirt: '#ffffff', cap: '#ffd21e', name: PREF}, {shirt: '#e2483d', cap: null}]},
  {c: '#2d9a5a', riders: [{shirt: '#7a4fd0', cap: '#2f6fd6'}, {shirt: '#ff8f1f', cap: null}]},
  {c: '#ff7aa8', riders: [{shirt: '#16a3a3', cap: null}, {shirt: '#f2b134', cap: '#e2483d'}]},
];
const Train: React.FC<{t: number; tt: number; hookMode: boolean}> = ({t, tt, hookMode}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const u0 = hookMode ? trainU(rt, false) : trainU(tt - PQ.RIDE, true);
  const scream = hookMode ? clamp((rt - 0.55) / 0.3) : 0.7;
  return (
    <>
      {TRAIN.map((car, i) => {
        const u = (((u0 - i * 0.022) % 1) + 1) % 1;
        const a = TRACK.getPointAt(u), b = TRACK.getPointAt((u + 0.004) % 1);
        const m = new THREE.Matrix4().lookAt(a, b, new THREE.Vector3(0, 1, 0));
        const q = new THREE.Quaternion().setFromRotationMatrix(m);
        return (
          <group key={i} position={[a.x, a.y + 0.1, a.z]} quaternion={q}>
            <group rotation={[0, Math.PI, 0]}>
              <Car c={car.c} riders={car.riders} tt={tt} scream={scream} />
            </group>
          </group>
        );
      })}
    </>
  );
};

export const Parque: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const word = useMemo(() => texMat(textTexture('PARQUE DE DIVERSÕES', {bg: '#d62976', fg: '#ffffff', border: '#14110c', w: 1024, h: 170, size: 86})), []);
  const lot = useMemo(() => texMat(textTexture('TERRENO DO PARQUE', {bg: '#ffffff', fg: '#14110c', border: '#14110c', w: 1024, h: 180, size: 100})), []);
  const hook = t < PQ.HOOK;
  const te = hook ? 999 : t;
  const built = te >= PQ.BASE;
  const wheelSpin = te >= PQ.RODA + 1.4 ? (tt - PQ.RODA) * 0.5 : 0;
  const carSpin = te >= PQ.CARROSSEL + 0.9 ? (tt - PQ.CARROSSEL) * 1.2 : 0;
  const rideOn = hook || te >= PQ.RIDE;
  return (
    <>
      <group position={[CX, 0.06, CZ]}>
        <mesh geometry={G.box} material={mat('#b58b5a')} position={[0, 0.03, 0]} scale={[21, 0.05, 21]} receiveShadow />
        {!built ? (
          <group position={[0, 0, -9.5]} rotation={[0, Math.PI, 0]}>
            {[-3.6, 3.6].map((x) => <P key={x} geo={G.box} color="#6b4423" p={[x, 1.0, 0]} s={[0.18, 2.0, 0.18]} o={0.02} />)}
            <mesh geometry={G.box} material={lot} position={[0, 2.0, 0.05]} scale={[7.6, 1.3, 0.1]} castShadow />
          </group>
        ) : null}
        {built ? (
          <group scale={[easeOut(ramp(te, PQ.BASE, PQ.BASE + 0.25)), 1, easeOut(ramp(te, PQ.BASE, PQ.BASE + 0.25))]}>
            <P geo={G.box} color="#5ec26a" p={[0, 0.2, -0.5]} s={[20, 0.4, 19]} o={0.04} />
          </group>
        ) : null}
        <BasePlateStuds t={te} t0={PQ.BASE} />
        {/* 1. gate */}
        <Bricks t={te} list={GATE} />
        <Drop t={te} t0={PQ.PORTAO + 0.4} h={5} dur={0.22} p={[0, 0.4, -9.4]}>
          <P geo={G.box} color="#7a4fd0" p={[0, 4.25, 0]} s={[8.4, 0.5, 1.3]} o={0.04} />
          <group rotation={[0, Math.PI, 0]}><mesh geometry={G.box} material={word} position={[0, 5.15, 0]} scale={[7.8, 1.3, 0.14]} castShadow /></group>
          {[-3.4, 3.4].map((x) => <P key={x} geo={G.ball} color="#ffd21e" p={[x, 4.75, 0]} s={0.5} o={0.03} />)}
        </Drop>
        {/* 2. Ferris wheel */}
        <Drop t={te} t0={PQ.RODA} h={8} dur={0.25} p={[-5.6, 0.4, -3.6]}>
          {[-1, 1].map((sz) => [-1, 1].map((sx) => <P key={sz + '_' + sx} geo={G.box} color="#9aa0a6" p={[sx * 1.4, 2.9, sz * 0.7]} r={[0, 0, -sx * 0.42]} s={[0.25, 6.1, 0.25]} o={0.02} />))}
        </Drop>
        <group position={[-5.6, 6.2, -3.6]} rotation={[0, 0, wheelSpin]}>
          <WheelRing t={te} r={4.1} n={26} t0={PQ.RODA + 0.2} dur={0.7} />
          {te >= PQ.RODA + 0.9 ? Array.from({length: 8}).map((_, i) => (
            <P key={i} geo={G.box} color="#cfd4da" p={[Math.cos((i / 8) * Math.PI * 2) * 2.05, Math.sin((i / 8) * Math.PI * 2) * 2.05, 0]} r={[0, 0, (i / 8) * Math.PI * 2]} s={[4.1, 0.12, 0.12]} o={0} />
          )) : null}
          <P geo={G.cyl12} color="#ffd21e" r={[Math.PI / 2, 0, 0]} s={[0.5, 0.9, 0.5]} o={0.03} />
          {Array.from({length: 8}).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const k = pop(te, PQ.RODA + 0.95 + i * 0.05, 0.25);
            if (k <= 0) return null;
            return (
              <group key={i} position={[Math.cos(a) * 4.1, Math.sin(a) * 4.1, 0]} rotation={[0, 0, -wheelSpin]} scale={k}>
                <P geo={G.box} color={['#e2483d', '#2f6fd6', '#2d9a5a', '#ff8f1f', '#7a4fd0', '#ff7aa8', '#16a3a3', '#ffd21e'][i]} p={[0, -0.75, 0]} s={[0.95, 0.85, 0.95]} o={0.03} />
                <P geo={G.box} color="#3b3f46" p={[0, -0.2, 0]} s={[0.05, 0.45, 0.05]} o={0} />
              </group>
            );
          })}
        </group>
        {/* 3. carousel */}
        <Bricks t={te} list={CAROUSEL_BASE} />
        <group position={[5.2, 1.5, -3.6]} rotation={[0, carSpin, 0]}>
          <Drop t={te} t0={PQ.CARROSSEL + 0.35} h={6} dur={0.22}>
            <P geo={G.cyl12} color="#ffffff" p={[0, 0, 0]} s={[2.75, 0.12, 2.75]} o={0.03} />
            <P geo={G.cyl} color="#ffd21e" p={[0, 1.6, 0]} s={[0.25, 3.2, 0.25]} o={0.02} />
          </Drop>
          {Array.from({length: 6}).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const bob = Math.sin(tt * 4 + i) * 0.2;
            return (
              <Drop key={i} t={te} t0={PQ.CARROSSEL + 0.5 + i * 0.05} h={4} dur={0.18} p={[Math.cos(a) * 1.9, 0, Math.sin(a) * 1.9]}>
                <P geo={G.cyl} color="#cfd4da" p={[0, 1.6, 0]} s={[0.05, 3.2, 0.05]} o={0} />
                <group position={[0, 0.9 + bob, 0]} rotation={[0, -a, 0]}>
                  <P geo={G.box} color={['#ffffff', '#ffd21e', '#ff7aa8', '#8fd3ff', '#b6e38a', '#c9a8ff'][i]} s={[0.35, 0.5, 1.0]} o={0.03} />
                  <P geo={G.box} color={['#ffffff', '#ffd21e', '#ff7aa8', '#8fd3ff', '#b6e38a', '#c9a8ff'][i]} p={[0, 0.4, 0.45]} s={[0.3, 0.5, 0.3]} o={0.03} />
                </group>
              </Drop>
            );
          })}
          <Drop t={te} t0={PQ.CARROSSEL + 0.8} h={6} dur={0.22}>
            <P geo={G.cone6} color="#e2483d" p={[0, 3.8, 0]} s={[3.2, 1.4, 3.2]} o={0.05} />
            <P geo={G.ball} color="#ffd21e" p={[0, 4.6, 0]} s={0.3} o={0.02} />
          </Drop>
        </group>
        {/* popcorn stand */}
        <Drop t={te} t0={PQ.CARROSSEL + 0.95} h={6} dur={0.22} p={[2.6, 0.4, -7.2]}>
          <P geo={G.box} color="#ffffff" p={[0, 0.6, 0]} s={[1.4, 1.2, 1.0]} o={0.03} />
          <P geo={G.box} color="#e2483d" p={[0, 1.45, 0]} s={[1.6, 0.25, 1.2]} o={0.03} />
          {[-0.4, 0, 0.4].map((x) => <P key={x} geo={G.ball} color="#fff6d8" p={[x, 1.25, 0]} s={0.18} o={0} />)}
        </Drop>
      </group>
      {/* 4. roller coaster */}
      <Track t={te} />
      {rideOn ? <Train t={te} tt={tt} hookMode={hook} /> : null}
      {/* staff */}
      {STAFF.map((w, i) => {
        const kk = pop(te, PQ.STAFF + i * 0.25, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[CX - 2.0 + i * 2.0, 0.5, CZ - 6.4 - (i === 1 ? 0.6 : 0)]} rotation={[0, Math.PI, 0]}>
            <Capy scale={0.78 * kk} shirt={['#d62976', '#ffd21e', '#2f6fd6'][i]} cap="#e2483d" pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.2 - Math.max(0, Math.sin(tt * 6 + i)) * 2.1], mouth: 0.35, brow: 0.3, blink: (Math.floor(tt * 30) + i * 17) % 100 < 4 ? 1 : 0, head: [0, 0, Math.sin(tt * 2 + i) * 0.08]}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </>
  );
};
