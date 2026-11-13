import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat} from './parts';
import {Capy} from './Capy';
import {NameTag, Mansion} from './World';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, D26, LOOP_AT, TOTAL_SEC} from '../timeline';
import PEOPLE from '../people.json';

const PPL = PEOPLE as any;
const Crown: React.FC<{k: number; y?: number}> = ({k, y = 2.25}) => <P geo={G.cone6} color="#ffd21e" p={[0, y * k, 0]} s={[0.22 * k, 0.28 * k, 0.22 * k]} o={0.02} />;
const Poof: React.FC<{tt: number; t0: number; y?: number; c?: string}> = ({tt, t0, y = 0.9, c = '#ffffff'}) => {
  const e = clamp((tt - t0) / 0.45);
  if (e <= 0 || e >= 1) return null;
  return <>{Array.from({length: 12}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2, d = 0.3 + easeOut(e) * 1.4;
    return <mesh key={i} geometry={G.ball} material={mat(i % 3 ? c : '#ffe066', {basic: true})} position={[Math.cos(a) * d, y + Math.sin(i * 1.7) * 0.5 * e, Math.sin(a) * d * 0.6]} scale={0.42 * (1 - e) + 0.12} />;
  })}</>;
};
export const S26: [number, number] = [-330, 160];
const X = (x: number) => S26[0] + x, Z = (z: number) => S26[1] + z;

/** hook: brunacostta_ofc becomes a little witch, owner of the magic studio */
export const Bruxa: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const girlK = pop(rt, D26.POOF + 0.1, 0.45);
  const sign = useMemo(() => texMat(textTexture('✨ ESTÚDIO DE MAGIA ✨', {bg: '#3b1a5a', fg: '#ffd21e', border: '#c9a0ff', w: 1024, h: 200, size: 92})), []);
  const zap = tt >= D26.ZAP && tt < LOOP_AT ? clamp((tt - D26.ZAP) / 0.6) : 0;
  return (
    <group>
      <mesh geometry={G.box} material={mat('#9fd86a')} position={[X(-2), 0.04, Z(-2)]} scale={[40, 0.04, 22]} receiveShadow />
      {/* studio behind her */}
      <group position={[X(0), 0.06, Z(-4.5)]}>
        <P geo={G.box} color="#6b3fa0" p={[0, 1.7, 0]} s={[6, 3.4, 3.6]} o={0.05} />
        <P geo={G.cone4} color="#2a1745" p={[0, 4.2, 0]} r={[0, Math.PI / 4, 0]} s={[4.6, 1.8, 3.2]} o={0.04} />
        <mesh geometry={G.box} material={sign} position={[0, 2.85, 1.83]} scale={[5.2, 1.0, 0.08]} />
        <P geo={G.box} color="#2a1745" p={[0, 0.9, 1.82]} s={[1.2, 1.8, 0.05]} o={0.02} />
        {[-2, 2].map((x) => <P key={x} geo={G.box} color="#c9a0ff" p={[x, 1.3, 1.82]} s={[0.9, 0.8, 0.05]} o={0.02} />)}
        {Array.from({length: 8}).map((_, i) => { const ph = (tt * 0.5 + i / 8) % 1; return <mesh key={i} geometry={G.ballLo} material={mat(i % 2 ? '#ffe066' : '#c9a0ff', {basic: true})} position={[-2.5 + (i * 0.7), 3.8 + ph * 2.5, 1.5]} scale={0.12 * (1 - ph)} />; })}
      </group>
      <group position={[X(0), 0.1, Z(0)]}>
        {rt < D26.POOF + 0.08 ? <Capy scale={0.85} shirt="#7a4fd0" cap={null} pose={{brow: -0.3, mouth: 0.3, blink: 0, head: [0.1, 0, 0]}} /> : null}
        {girlK > 0 ? (
          <group scale={girlK}>
            <Girl tt={tt} wave={0.6} skin="#f1d0b0" dress="#7a4fd0" hair="#2a1a12" />
            <group position={[0, 2.12, 0]}>
              <P geo={G.cyl12} color="#1c1426" p={[0, 0, 0]} s={[0.48, 0.04, 0.48]} o={0.02} />
              <P geo={G.cone6} color="#1c1426" p={[0, 0.34, -0.02]} r={[-0.15, 0, 0]} s={[0.26, 0.7, 0.26]} o={0.03} />
              <P geo={G.cyl12} color="#ffd21e" p={[0, 0.06, 0]} s={[0.29, 0.05, 0.29]} o={0} />
            </group>
            <group position={[0.3, 1.5, 0.1]} rotation={[0, 0, -2.2 - Math.sin(tt * 6) * 0.3 - zap * 0.6]}>
              <P geo={G.cyl} color="#5b3a1e" p={[0, -0.32, 0]} s={[0.025, 0.6, 0.025]} o={0} />
              <mesh geometry={G.ballLo} material={mat('#ffe066', {basic: true})} position={[0, -0.64, 0]} scale={0.08 + zap * 0.2} />
            </group>
          </group>
        ) : null}
        <Poof tt={rt} t0={D26.POOF} c="#c9a0ff" />
        <group position={[0, 0.35, 0]}><NameTag name={PPL.bruxa} k={1} /></group>
      </group>
    </group>
  );
};

/** white mansion (051_pelegrini) and purple house + black pickup (stefany76675) */
export const Casas26: React.FC<{tt: number}> = ({tt}) => {
  const kM = pop(tt, D26.MANSAO, 0.5), kR = pop(tt, D26.ROXA, 0.45), kT = pop(tt, D26.TRUCK, 0.45);
  return (
    <group>
      {kM > 0 ? (
        <group position={[X(14), 0.06, Z(-1)]}>
          <Mansion k={kM} />
          <group position={[-3.2, 0.06, 3.6]}>
            <Capy scale={0.8 * kM} shirt="#ffffff" cap="#ffd21e" sash pose={{armL: [0, 0, 0.4], armR: [0, 0, -0.4 - Math.max(0, Math.sin(tt * 6)) * 2], mouth: 0.8, brow: 0.4, blink: 0}} />
            <NameTag name={PPL.mansao_branca} k={kM} />
          </group>
        </group>
      ) : null}
      {kR > 0 ? (
        <group position={[X(-14), 0.06, Z(-1)]}>
          <group scale={2.7 * kR}>
            <P geo={G.box} color="#7a4fd0" p={[0, 0.55, 0]} s={[1.5, 1.1, 1.5]} o={0.04} />
            <P geo={G.cone4} color="#3b1a5a" p={[0, 1.45, 0]} r={[0, Math.PI / 4, 0]} s={[1.3, 0.7, 1.3]} o={0.04} />
            <P geo={G.box} color="#ffffff" p={[0, 0.35, 0.76]} s={[0.34, 0.66, 0.04]} o={0.02} />
            {[-0.45, 0.45].map((wx) => <P key={wx} geo={G.box} color="#cdeeff" p={[wx, 0.72, 0.76]} s={[0.3, 0.28, 0.04]} o={0.02} />)}
          </group>
          <group position={[-1.6, 0.06, 3.2]}>
            <Capy scale={0.75 * kR} shirt="#7a4fd0" cap={null} pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.7, brow: 0.4, blink: 0}} />
            <NameTag name={PPL.casa_roxa} k={kR} />
          </group>
          {kT > 0 ? (
            <group position={[3.2, 0.1, 2.6]} rotation={[0, -0.4, 0]} scale={kT}>
              <P geo={G.box} color="#14110c" p={[0, 0.65, 0]} s={[1.6, 0.6, 3.6]} o={0.04} />
              <P geo={G.box} color="#14110c" p={[0, 1.2, 0.45]} s={[1.5, 0.6, 1.5]} o={0.04} />
              <P geo={G.box} color="#9fd3ff" p={[0, 1.22, 1.22]} s={[1.3, 0.42, 0.04]} o={0} />
              <P geo={G.box} color="#3a3f47" p={[0, 1.0, -1.1]} s={[1.5, 0.12, 1.3]} o={0} />
              {[[-0.8, 1.15], [0.8, 1.15], [-0.8, -1.1], [0.8, -1.1]].map(([x, z], i) => <P key={i} geo={G.cyl12} color="#1c1f26" p={[x, 0.36, z]} r={[0, 0, Math.PI / 2]} s={[0.36, 0.28, 0.36]} o={0.02} />)}
              <P geo={G.box} color="#cfd4da" p={[0, 0.6, 1.82]} s={[1.4, 0.14, 0.06]} o={0} />
            </group>
          ) : null}
        </group>
      ) : null}
    </group>
  );
};

/** single-capy wishes placed around the city */
const Owner: React.FC<{tt: number; t0: number; p: [number, number, number]; ry?: number; name: string; shirt: string; cap: string | null; crown?: boolean}> = ({tt, t0, p, ry = 0, name, shirt, cap, crown}) => {
  const k = pop(tt, t0, 0.45);
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {k > 0 ? (
        <>
          <Capy scale={0.85 * k} shirt={shirt} cap={cap} sash={crown} pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.7, brow: 0.4, blink: 0}} />
          {crown ? <Crown k={k} /> : null}
          <NameTag name={name} k={k} />
        </>
      ) : null}
      <Poof tt={tt} t0={t0 - 0.1} />
    </group>
  );
};
export const Donos26: React.FC<{tt: number}> = ({tt}) => (
  <>
    <Owner tt={tt} t0={D26.POLICIAL} p={[-337, 0.16, 165]} name={PPL.policial} shirt="#2f6fd6" cap="#14110c" />
    <Owner tt={tt} t0={D26.PARQUE} p={[20.5, 0.16, 20.5]} name={PPL.dona_parque} shirt="#ff7aa8" cap={null} crown />
    <Owner tt={tt} t0={D26.CLUBE} p={[50.5, 0.16, 20.8]} name={PPL.dono_clube} shirt="#ffd21e" cap="#2d9a5a" crown />
  </>
);
