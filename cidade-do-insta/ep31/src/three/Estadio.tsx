import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, BasePlateStuds, Drop} from './Usina';
import type {Brick} from './Usina';
import {pop, ramp, clamp, easeOut, ST, LOOP_AT, TOTAL_SEC} from '../timeline';
import PEOPLE from '../people.json';
import {M, bulgeAt, scoreAt} from './match';

/** block (2,1) */
export const ESTADIO: [number, number] = [60, 30];
const TEAM: string[] = (PEOPLE as any).time;

const STANDS: Brick[] = (() => {
  const out: Brick[] = [];
  const cols = ['#2f6fd6', '#ffd21e', '#e2483d'];
  for (let k = 0; k < 3; k++) for (const side of [-1, 1]) for (let L = 0; L <= k; L++) for (let x = -8.4; x <= 8.41; x += 1.6) {
    out.push({x, y: 0.4 + 0.275 + L * 0.55, z: side * (6.5 + k * 1.0), w: 1.55, ry: 0, c: L === k ? cols[k] : '#cfd4da', t0: 0});
  }
  out.sort((a, b) => a.y - b.y || Math.abs(a.z) - Math.abs(b.z) || a.x - b.x);
  out.forEach((b, i) => (b.t0 = ST.ARQ + (i / out.length) * 1.0));
  return out;
})();

const Net: React.FC<{side: number; bulge: number}> = ({side, bulge}) => {
  const lines: React.ReactNode[] = [];
  const bx = side * (7.9 + bulge * 0.7);
  for (let z = -3.4; z <= 3.41; z += 0.42) lines.push(<mesh key={'v' + z} geometry={G.box} material={mat('#ffffff', {basic: true})} position={[bx, 1.1, z]} scale={[0.03, 2.2, 0.03]} />);
  for (let y = 0.05; y <= 2.21; y += 0.36) lines.push(<mesh key={'h' + y} geometry={G.box} material={mat('#ffffff', {basic: true})} position={[bx, y, 0]} scale={[0.03, 0.03, 6.8]} />);
  return <>{lines}</>;
};

const Goal: React.FC<{side: number; bulge?: number}> = ({side, bulge = 0}) => (
  <group>
    {[-3.4, 3.4].map((z) => <P key={z} geo={G.box} color="#ffffff" p={[side * 7.2, 1.1, z]} s={[0.18, 2.2, 0.18]} o={0.02} />)}
    <P geo={G.box} color="#ffffff" p={[side * 7.2, 2.2, 0]} s={[0.18, 0.18, 7.0]} o={0.02} />
    <Net side={side} bulge={bulge} />
  </group>
);

const Ball: React.FC<{p: V3; spin: number}> = ({p, spin}) => (
  <group position={p} rotation={[spin, spin * 0.7, 0]}>
    <P geo={G.ball} color="#ffffff" s={0.3} o={0.03} />
    {[[0.29, 0, 0], [-0.2, 0.2, 0], [0, -0.2, 0.2], [0, 0.1, -0.28]].map((q, i) => <mesh key={i} geometry={G.ballLo} material={mat('#14110c')} position={q as V3} scale={0.09} />)}
  </group>
);

export const Estadio: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const boards = useMemo(() => ['0 x 0', '0 x 1', '1 x 1', '2 x 1'].map((s) => texMat(textTexture('CIDADE ' + s + ' SANTOS', {bg: '#14110c', fg: '#ffd21e', border: '#14110c', w: 1024, h: 300, size: 92}))), []);
  const sc = scoreAt(tt >= LOOP_AT ? 0 : tt);
  const board = boards[sc[0] === 0 ? sc[1] : sc[0] + 1];
  const lot = useMemo(() => texMat(textTexture('TERRENO DO ESTÁDIO', {bg: '#ffffff', fg: '#14110c', border: '#14110c', w: 1024, h: 180, size: 96})), []);
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const hook = rt < ST.HOOK;
  const te = hook ? 999 : t;
  const built = te >= ST.BASE;
  // hook kick: ball flies into the +x goal and bulges the net
  const HIT = 0.28;
  const bx = Math.min(7.5, 2.5 + (rt + 0.3) * 8.6);
  const by = 0.35 + Math.sin(clamp((rt + 0.3) / (HIT + 0.3)) * Math.PI) * 0.6 + clamp((rt + 0.3) / (HIT + 0.3)) * 0.6;
  const bulge = rt > HIT ? Math.exp(-(rt - HIT) * 4) * Math.abs(Math.cos((rt - HIT) * 10)) : 0;
  const own = tt >= ST.OWN - 0.7 && tt < LOOP_AT;
  const ownBulge = own && tt > ST.OWN ? Math.exp(-(tt - ST.OWN) * 4) * Math.abs(Math.cos((tt - ST.OWN) * 10)) : 0;
  const ownX = -Math.min(7.5, 3.0 + (tt - (ST.OWN - 0.7)) * 6.4);
  const cheer = hook ? 1 : 0.6;
  const crowdK = (i: number) => (hook ? 1 : pop(te, ST.TORCIDA + (i % 16) * 0.03, 0.3));
  return (
    <group position={[ESTADIO[0], 0.06, ESTADIO[1]]}>
      <mesh geometry={G.box} material={mat('#b58b5a')} position={[0, 0.03, 0]} scale={[21, 0.05, 21]} receiveShadow />
      {!built ? (
        <group position={[0, 0, -9.5]} rotation={[0, Math.PI, 0]}>
          {[-3.6, 3.6].map((x) => <P key={x} geo={G.box} color="#6b4423" p={[x, 1.0, 0]} s={[0.18, 2.0, 0.18]} o={0.02} />)}
          <mesh geometry={G.box} material={lot} position={[0, 2.0, 0.05]} scale={[7.6, 1.3, 0.1]} castShadow />
        </group>
      ) : null}
      {built ? (
        <group scale={[easeOut(ramp(te, ST.BASE, ST.BASE + 0.25)), 1, easeOut(ramp(te, ST.BASE, ST.BASE + 0.25))]}>
          <P geo={G.box} color="#9aa0a6" p={[0, 0.2, -0.5]} s={[20, 0.4, 19]} o={0.04} />
        </group>
      ) : null}
      <BasePlateStuds t={te} t0={ST.BASE} />
      {/* 1. pitch */}
      <Drop t={te} t0={ST.GRAMADO} h={4} dur={0.25} p={[0, 0.42, 0]}>
        <P geo={G.box} color="#3fae4a" p={[0, 0.06, 0]} s={[15.2, 0.12, 10.2]} o={0.03} />
        {[-6, -3.6, -1.2, 1.2, 3.6, 6].map((x) => <mesh key={x} geometry={G.box} material={mat('#36a043')} position={[x, 0.125, 0]} scale={[1.2, 0.01, 10]} />)}
        {[[0, 4.8, 14.6, 0.08], [0, -4.8, 14.6, 0.08]].map(([x, z, w, d], i) => <mesh key={'l' + i} geometry={G.box} material={mat('#ffffff', {basic: true})} position={[x, 0.13, z]} scale={[w, 0.01, d]} />)}
        {[-7.25, 0, 7.25].map((x) => <mesh key={'c' + x} geometry={G.box} material={mat('#ffffff', {basic: true})} position={[x, 0.13, 0]} scale={[0.08, 0.01, 9.6]} />)}
        <mesh geometry={G.cyl12} material={mat('#ffffff', {basic: true})} position={[0, 0.128, 0]} scale={[1.5, 0.01, 1.5]} />
        <mesh geometry={G.cyl12} material={mat('#3fae4a')} position={[0, 0.132, 0]} scale={[1.4, 0.01, 1.4]} />
        {[-1, 1].map((sd) => (
          <group key={sd}>
            <mesh geometry={G.box} material={mat('#ffffff', {basic: true})} position={[sd * 5.4, 0.13, 0]} scale={[0.08, 0.01, 5]} />
            <mesh geometry={G.box} material={mat('#ffffff', {basic: true})} position={[sd * 6.3, 0.13, 2.5]} scale={[1.9, 0.01, 0.08]} />
            <mesh geometry={G.box} material={mat('#ffffff', {basic: true})} position={[sd * 6.3, 0.13, -2.5]} scale={[1.9, 0.01, 0.08]} />
          </group>
        ))}
      </Drop>
      {/* 2. goals */}
      <Drop t={te} t0={ST.TRAVES} h={8} dur={0.28} p={[0, 0.54, 0]}><Goal side={-1} bulge={ownBulge + bulgeAt(tt, M.G2) + bulgeAt(tt, M.G3) + bulgeAt(tt, M.MG)} /></Drop>
      <Drop t={te} t0={ST.TRAVES + 0.12} h={8} dur={0.28} p={[0, 0.54, 0]}><Goal side={1} bulge={hook ? bulge : bulgeAt(tt, M.G1)} /></Drop>
      {/* 3. stands, brick by brick */}
      <Bricks t={te} list={STANDS} />
      {/* 4. floodlights + scoreboard */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <Drop key={i} t={te} t0={ST.REFL + i * 0.1} h={14} dur={0.3} p={[sx * 9.6, 0.4, sz * 9.6]}>
          <P geo={G.box} color="#9aa0a6" p={[0, 4.5, 0]} s={[0.4, 9, 0.4]} o={0.03} />
          <group position={[0, 9.2, 0]} rotation={[sz * 0.5, Math.atan2(-sx, -sz), 0]}>
            <P geo={G.box} color="#3b3f46" s={[2.4, 1.4, 0.3]} o={0.03} />
            {[-0.7, 0, 0.7].map((x) => [-0.35, 0.35].map((y) => <mesh key={x + '_' + y} geometry={G.box} material={mat('#fff6c8', {basic: true})} position={[x, y, 0.17]} scale={[0.55, 0.5, 0.02]} />))}
          </group>
        </Drop>
      ))}
      <Drop t={te} t0={ST.REFL + 0.45} h={10} dur={0.3} p={[-10.1, 0.4, 0]}>
        {[-1.6, 1.6].map((z) => <P key={z} geo={G.box} color="#3b3f46" p={[0, 1.8, z]} s={[0.25, 3.6, 0.25]} o={0.02} />)}
        <P geo={G.box} color="#3b3f46" p={[0, 4.4, 0]} s={[0.3, 2.0, 5.2]} o={0.03} />
        <group rotation={[0, Math.PI / 2, 0]}><mesh geometry={G.box} material={board} position={[0, 4.4, 0.18]} scale={[4.8, 1.6, 0.05]} /></group>
      </Drop>
      {/* crowd on the stands */}
      {[-1, 1].flatMap((side) => [0, 1, 2].flatMap((k) => Array.from({length: 8}).map((_, j) => {
        const i = (side > 0 ? 24 : 0) + k * 8 + j;
        const kk = crowdK(i);
        if (kk <= 0) return null;
        const hop = cheer * Math.max(0, Math.sin(tt * 9 + i * 1.3)) * 0.25;
        return (
          <group key={i} position={[-7.6 + j * 2.15, 0.4 + (k + 1) * 0.55 + hop, side * (6.5 + k * 1.0)]} rotation={[0, side > 0 ? Math.PI : 0, 0]}>
            <Capy scale={0.4 * kk} shirt={['#e2483d', '#2f6fd6', '#ffd21e', '#2d9a5a', '#ff7aa8', '#ffffff'][i % 6]} cap={i % 4 === 0 ? '#ffd21e' : null}
              pose={{armL: [0, 0, 0.4 + cheer * 2.2], armR: [0, 0, -0.4 - cheer * 2.2], mouth: 0.4 + cheer * 0.5, blink: 0}} />
          </group>
        );
      })))}
      {/* hook: kicker, ball and a diving keeper */}
      {hook ? (
        <>
          <group position={[1.6, 0.54, 0.3]} rotation={[0, Math.PI / 2, 0]}>
            <Capy scale={0.75} shirt="#ffd21e" cap="#2d9a5a" pose={{armL: [0, 0, 1.0], armR: [0, 0, -1.0], mouth: 0.9, brow: 0.5}} />
          </group>
          <group position={[6.6, 0.54 + clamp((rt + 0.1) / 0.3) * 0.6, -1.3 - 1.4 * clamp((rt + 0.1) / 0.3)]} rotation={[clamp((rt + 0.1) / 0.3) * -1.2, -Math.PI / 2, 0]}>
            <Capy scale={0.75} shirt="#e2483d" cap={null} pose={{armL: [0, 0, 2.6], armR: [0, 0, -2.6], mouth: 0.6, brow: -0.3}} />
          </group>
          <Ball p={[bx, 0.54 + by, 0.2 * clamp(rt + 0.3)]} spin={rt * 14} />
        </>
      ) : null}
      {/* the drawn team at midfield */}
      {TEAM.map((w, i) => {
        const kk = hook ? 0 : pop(te, ST.TIME + i * 0.25, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[-2.6 + i * 2.6, 0.55, 1.6 + (i === 1 ? 0.5 : 0)]}>
            <Capy scale={0.78 * kk} shirt={['#e2483d', '#2f6fd6', '#2d9a5a'][i]} cap={i === 2 ? '#14110c' : null} pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.2 - Math.max(0, Math.sin(tt * 6 + i)) * 2.1], mouth: 0.4, brow: 0.3, blink: (Math.floor(tt * 30) + i * 17) % 100 < 4 ? 1 : 0}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
      {!hook && !own && te >= ST.TIME ? <Ball p={[0, 0.85, 0.2]} spin={0} /> : null}
      {own ? <Ball p={[ownX, 0.9 + Math.sin(clamp((tt - ST.OWN + 0.7) / 0.7) * Math.PI) * 0.5, -0.3]} spin={-tt * 14} /> : null}
    </group>
  );
};
