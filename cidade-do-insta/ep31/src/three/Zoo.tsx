import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, boxShell, Drop} from './Usina';
import type {Brick} from './Usina';
import {pop, clamp, easeOut, ZO, LOOP_AT, TOTAL_SEC} from '../timeline';
import PEOPLE from '../people.json';

/** ep20 zoo, north of the city, mountains behind */
export const ZC: [number, number] = [0, -262];
const TR: string[] = (PEOPLE as any).tratadores;
const X = (x: number) => ZC[0] + x, Z = (z: number) => ZC[1] + z;

/* ---------- animals (face +x) ---------- */
const MANE = '#9a5a22', LION = '#e3a94c';
export const Lion: React.FC<{roar?: number; run?: number; tt: number}> = ({roar = 0, run = 0, tt}) => {
  const leg = (ph: number) => Math.sin(tt * 14 + ph) * 0.6 * run;
  return (
    <group>
      <P geo={G.box} color={LION} p={[0, 1.05, 0]} s={[2.1, 0.95, 0.95]} o={0.04} />
      {[[0.75, 0.32, 0], [0.75, -0.32, Math.PI], [-0.75, 0.32, Math.PI], [-0.75, -0.32, 0]].map(([x, z, ph], i) => (
        <group key={i} position={[x, 0.75, z]} rotation={[0, 0, leg(ph)]}><P geo={G.cyl} color={LION} p={[0, -0.36, 0]} s={[0.17, 0.75, 0.17]} o={0.02} /></group>
      ))}
      <group position={[1.2, 1.55, 0]} rotation={[0, 0, -0.25 * roar]}>
        <P geo={G.ball} color={MANE} p={[-0.12, 0, 0]} s={[0.55, 0.85, 0.85]} o={0.04} />
        <P geo={G.ball} color={LION} p={[0.22, 0, 0]} s={0.48} o={0.04} />
        <P geo={G.box} color="#f3d08a" p={[0.6, -0.1, 0]} s={[0.3, 0.28, 0.4]} o={0.02} />
        <P geo={G.box} color="#3a2316" p={[0.76, 0.0, 0]} s={[0.06, 0.1, 0.16]} o={0} />
        <P geo={G.box} color="#7a1f1f" p={[0.62, -0.28 - 0.18 * roar, 0]} s={[0.26, 0.06 + 0.32 * roar, 0.3]} o={0} />
        {roar > 0.2 ? [-0.09, 0.09].map((z) => <P key={z} geo={G.cone4} color="#ffffff" p={[0.72, -0.2, z]} r={[Math.PI, 0, 0]} s={[0.04, 0.1, 0.04]} o={0} />) : null}
        {[-0.18, 0.18].map((z) => <P key={z} geo={G.ballLo} color="#14110c" p={[0.58, 0.16, z]} s={0.06} o={0} />)}
        {[-0.34, 0.34].map((z) => <P key={z} geo={G.ball} color={MANE} p={[0.05, 0.5, z]} s={0.16} o={0.02} />)}
      </group>
      <group position={[-1.05, 1.3, 0]} rotation={[0, 0, 0.6 + Math.sin(tt * 4) * 0.3]}>
        <P geo={G.cyl} color={LION} p={[-0.45, 0, 0]} r={[0, 0, Math.PI / 2]} s={[0.06, 0.9, 0.06]} o={0} />
        <P geo={G.ball} color={MANE} p={[-0.92, 0, 0]} s={0.14} o={0.02} />
      </group>
    </group>
  );
};
const GIR = '#f2c94c', SPOT = '#a8642a';
export const Giraffe: React.FC<{tt: number}> = ({tt}) => (
  <group>
    {[[0.7, 0.35], [0.7, -0.35], [-0.7, 0.35], [-0.7, -0.35]].map(([x, z], i) => <P key={i} geo={G.cyl} color={GIR} p={[x, 1.2, z]} s={[0.13, 2.4, 0.13]} o={0.02} />)}
    <P geo={G.box} color={GIR} p={[0, 2.75, 0]} s={[2.0, 0.9, 0.95]} o={0.04} />
    {[[-0.5, 0.3], [0.3, -0.2], [0.6, 0.25], [-0.2, -0.3]].map(([x, z], i) => <P key={i} geo={G.box} color={SPOT} p={[x, 3.21, z]} s={[0.32, 0.03, 0.3]} o={0} />)}
    {[0.36, 0.48].map((z) => [[-0.5], [0.4]].map(([x], j) => <P key={z + '' + j} geo={G.box} color={SPOT} p={[x, 2.75, z]} s={[0.32, 0.3, 0.02]} o={0} />))}
    <group position={[0.85, 3.0, 0]} rotation={[Math.sin(tt * 1.2) * 0.06, 0, -0.22]}>
      <P geo={G.cyl} color={GIR} p={[0, 1.6, 0]} s={[0.22, 3.2, 0.22]} o={0.03} />
      {[0.8, 1.6, 2.4].map((y) => <P key={y} geo={G.box} color={SPOT} p={[0, y, 0.21]} s={[0.22, 0.2, 0.03]} o={0} />)}
      <P geo={G.box} color={GIR} p={[0.25, 3.3, 0]} s={[0.75, 0.42, 0.44]} o={0.03} />
      <P geo={G.box} color="#e6b23a" p={[0.6, 3.25, 0]} s={[0.12, 0.3, 0.36]} o={0} />
      {[-0.13, 0.13].map((z) => <P key={z} geo={G.cyl} color={SPOT} p={[0.05, 3.65, z]} s={[0.04, 0.3, 0.04]} o={0} />)}
      {[-0.23, 0.23].map((z) => <P key={'e' + z} geo={G.ballLo} color="#14110c" p={[0.4, 3.38, z]} s={0.05} o={0} />)}
    </group>
    <P geo={G.cyl} color={GIR} p={[-1.05, 2.5, 0]} r={[0, 0, 0.3]} s={[0.04, 0.8, 0.04]} o={0} />
  </group>
);
const ELE = '#9aa3ab';
export const Elephant: React.FC<{tt: number}> = ({tt}) => (
  <group>
    {[[0.75, 0.5], [0.75, -0.5], [-0.75, 0.5], [-0.75, -0.5]].map(([x, z], i) => <P key={i} geo={G.cyl} color={ELE} p={[x, 0.7, z]} s={[0.36, 1.4, 0.36]} o={0.03} />)}
    <P geo={G.ball} color={ELE} p={[0, 1.95, 0]} s={[1.65, 1.2, 1.15]} o={0.05} />
    <group position={[1.55, 2.3, 0]}>
      <P geo={G.ball} color={ELE} s={0.78} o={0.04} />
      {[-1, 1].map((sd) => <P key={sd} geo={G.box} color="#8b949c" p={[-0.25, 0.05, sd * 0.85]} r={[0, sd * (0.3 + Math.sin(tt * 3) * 0.15), 0]} s={[0.9, 1.1, 0.08]} o={0.03} />)}
      <group position={[0.65, -0.3, 0]} rotation={[0, 0, -0.5 + Math.sin(tt * 2) * 0.35]}>
        <P geo={G.cyl} color={ELE} p={[0, -0.55, 0]} s={[0.17, 1.1, 0.17]} o={0.02} />
        <P geo={G.cyl} color={ELE} p={[0.15, -1.15, 0]} r={[0, 0, 0.6]} s={[0.13, 0.5, 0.13]} o={0.02} />
      </group>
      {[-0.32, 0.32].map((z) => <P key={z} geo={G.cone6} color="#fffaf0" p={[0.7, -0.45, z]} r={[0, 0, -2.2]} s={[0.07, 0.45, 0.07]} o={0} />)}
      {[-0.35, 0.35].map((z) => <P key={'e' + z} geo={G.ballLo} color="#14110c" p={[0.62, 0.25, z]} s={0.07} o={0} />)}
    </group>
  </group>
);
export const Monkey: React.FC<{swing: number}> = ({swing}) => (
  <group rotation={[0, 0, swing]}>
    <P geo={G.cyl} color="#6b4423" p={[0, -0.5, 0]} s={[0.05, 1.0, 0.05]} o={0} />
    <group position={[0, -1.1, 0]}>
      <P geo={G.ball} color="#7a4b26" s={[0.3, 0.36, 0.28]} o={0.03} />
      <P geo={G.ball} color="#7a4b26" p={[0, 0.48, 0]} s={0.26} o={0.03} />
      <P geo={G.ball} color="#e8c39a" p={[0.18, 0.44, 0]} s={[0.12, 0.16, 0.2]} o={0} />
      {[-0.1, 0.1].map((z) => <P key={z} geo={G.ballLo} color="#14110c" p={[0.25, 0.53, z]} s={0.04} o={0} />)}
      <P geo={G.cyl} color="#7a4b26" p={[-0.3, -0.1, 0]} r={[0, 0, 1.0]} s={[0.04, 0.6, 0.04]} o={0} />
    </group>
  </group>
);
const Tree: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => (
  <group position={p} scale={s}>
    <P geo={G.cyl} color="#7b4a28" p={[0, 1.4, 0]} s={[0.28, 2.8, 0.28]} o={0.02} />
    <P geo={G.ball} color="#3f9a4a" p={[0, 3.4, 0]} s={[1.6, 1.1, 1.6]} o={0.04} />
    <P geo={G.ball} color="#4fb35a" p={[0.6, 3.9, 0.3]} s={0.9} o={0.03} />
  </group>
);

/* ---------- builds ---------- */
const PENS: [number, number, number, number][] = [[-12, 2, 14, 12], [12, 2, 14, 12], [-12, -15, 14, 12], [12, -15, 14, 12]];
const FENCE: Brick[] = PENS.flatMap(([x, z, w, d], i) => boxShell(X(x), Z(z), w, d, 1.1, ['#c98a4b', '#e0a35e'], ZO.CERCA + i * 0.12, 0.55, 0.3));
const GATE: Brick[] = [-4.2, 4.2].flatMap((x, k) => boxShell(X(x), Z(13), 1.1, 1.1, 4.4, ['#2d9a5a', '#5ec26a'], ZO.CERCA + 0.2 + k * 0.08, 0.5, 0.3));

export const Zoo: React.FC<{t: number; tt: number}> = ({t: t0, tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const t = rt < ZO.HOOK ? 999 : t0;
  const loose = tt >= ZO.FUGA && tt < LOOP_AT;
  const sign = useMemo(() => texMat(textTexture('ZOOLÓGICO DA CIDADE', {bg: '#ffd21e', fg: '#14110c', border: '#14110c', w: 1024, h: 170, size: 80})), []);
  const ground = easeOut(clamp((t - ZO.CERCA + 0.6) / 0.5));
  return (
    <group>
      {/* grounds */}
      <group position={[X(0), 0, Z(-1)]} scale={[1, 1, Math.max(0.0001, ground)]}>
        <mesh geometry={G.box} material={mat('#8fc85a')} position={[0, 0.07, 0]} scale={[44, 0.1, 36]} receiveShadow />
        <mesh geometry={G.box} material={mat('#e8cf98')} position={[0, 0.13, 0]} scale={[6, 0.04, 36]} receiveShadow />
        <mesh geometry={G.box} material={mat('#e8cf98')} position={[0, 0.13, -6.5]} scale={[44, 0.04, 4]} receiveShadow />
        {/* pen floors */}
        <mesh geometry={G.box} material={mat('#e3c27a')} position={[-12, 0.14, 3]} scale={[13, 0.04, 11]} receiveShadow />
        <mesh geometry={G.box} material={mat('#a6d86a')} position={[12, 0.14, 3]} scale={[13, 0.04, 11]} receiveShadow />
        <mesh geometry={G.box} material={mat('#b9a27a')} position={[-12, 0.14, -14]} scale={[13, 0.04, 11]} receiveShadow />
        <mesh geometry={G.box} material={mat('#7fc66a')} position={[12, 0.14, -14]} scale={[13, 0.04, 11]} receiveShadow />
        <mesh geometry={G.box} material={mat('#3fb6f0', {emissive: '#1f6fa8'})} position={[-9, 0.17, -16]} scale={[5, 0.04, 4]} />
      </group>
      <Bricks t={t} list={FENCE} />
      <Bricks t={t} list={GATE} />
      <Drop t={t} t0={ZO.CERCA + 0.75} h={7} dur={0.25} p={[X(0), 0.3, Z(13)]}>
        <P geo={G.box} color="#2d9a5a" p={[0, 4.55, 0]} s={[10, 0.5, 1.3]} o={0.04} />
        <mesh geometry={G.box} material={sign} position={[0, 5.3, 0.2]} scale={[8.6, 1.4, 0.12]} />
        {[-3, 0, 3].map((x) => <P key={x} geo={G.ball} color={['#e2483d', '#ffd21e', '#2f6fd6'][(x / 3 + 1) | 0]} p={[x, 6.2, 0.2]} s={0.35} o={0.02} />)}
      </Drop>
      {/* lion pen: rocks + lion */}
      <Drop t={t} t0={ZO.LEAO} h={9} dur={0.3} p={[X(-12), 0.15, Z(1)]}>
        <P geo={G.ballLo} color="#9b8f7e" p={[-3.5, 0.8, -2.5]} s={[2.2, 1.4, 1.8]} o={0.04} />
        <P geo={G.ballLo} color="#8a7f70" p={[-1.5, 0.5, -3.2]} s={[1.4, 0.9, 1.2]} o={0.03} />
        {loose ? null : <group position={[0.8, 0, 1]} rotation={[0, -0.6, 0]}><Lion tt={tt} roar={Math.max(0, Math.sin(tt * 2.2)) > 0.8 ? 1 : 0.15} /></group>}
      </Drop>
      {/* giraffe pen */}
      <Drop t={t} t0={ZO.GIRAFA} h={11} dur={0.3} p={[X(12), 0.15, Z(1)]}>
        <Tree p={[3.5, 0, -2.5]} s={1.4} />
        <group position={[-1, 0, 1]} rotation={[0, -2.4, 0]}><Giraffe tt={tt} /></group>
      </Drop>
      {/* elephant pen */}
      <Drop t={t} t0={ZO.ELEFANTE} h={10} dur={0.3} p={[X(-12), 0.15, Z(-14)]}>
        <group position={[-0.5, 0, 1]} rotation={[0, -0.9, 0]}><Elephant tt={tt} /></group>
      </Drop>
      {/* monkey island */}
      <Drop t={t} t0={ZO.MACACOS} h={10} dur={0.3} p={[X(12), 0.15, Z(-14)]}>
        <Tree p={[2.5, 0, -2.5]} s={1.5} />
        {[-3, 1].map((x) => <P key={x} geo={G.cyl} color="#7b4a28" p={[x, 1.8, 2]} s={[0.14, 3.6, 0.14]} o={0.02} />)}
        <P geo={G.cyl} color="#7b4a28" p={[-1, 3.55, 2]} r={[0, 0, Math.PI / 2]} s={[0.1, 4.2, 0.1]} o={0.02} />
        {[-2.3, -1, 0.3].map((x, i) => <group key={x} position={[x, 3.55, 2]}><Monkey swing={Math.sin(tt * 3 + i * 1.7) * 0.5} /></group>)}
      </Drop>
      {/* zookeepers */}
      {TR.map((w, i) => {
        const kk = pop(t, ZO.TRAT + i * 0.25, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[X(-2.2 + i * 2.2), 0.16, Z(9)]}>
            <Capy scale={0.8 * kk} shirt="#5c7a3a" cap="#c9a86a" pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6 + i)) * 2.2], mouth: 0.5, brow: 0.3, blink: 0}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};

/** hook + ending: lion close-up roar / lion running loose down the avenue */
export const LionShow: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  if (rt < ZO.HOOK) {
    const roar = clamp((rt - 0.25) / 0.25) * (rt < ZO.HOOK - 0.15 ? 1 : 0);
    return <group position={[X(0), 0.16, Z(22)]} rotation={[0, -Math.PI / 2, 0]}><Lion tt={tt} roar={roar} /></group>;
  }
  if (tt >= ZO.FUGA && tt < LOOP_AT) {
    const k = (tt - ZO.FUGA) / (LOOP_AT - ZO.FUGA);
    return <group position={[X(0), 0.16 + Math.abs(Math.sin(tt * 14)) * 0.25, Z(14) + k * 9]} rotation={[0, -Math.PI / 2, 0]}><Lion tt={tt} run={1} roar={k > 0.6 ? 1 : 0} /></group>;
  }
  return null;
};
