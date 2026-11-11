import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, D25, LOOP_AT} from '../timeline';
import PEOPLE from '../people.json';

const PPL = PEOPLE as any;
const Crown: React.FC<{k: number; y?: number}> = ({k, y = 2.25}) => <P geo={G.cone6} color="#ffd21e" p={[0, y * k, 0]} s={[0.22 * k, 0.28 * k, 0.22 * k]} o={0.02} />;
const Poof: React.FC<{tt: number; t0: number; y?: number}> = ({tt, t0, y = 0.9}) => {
  const e = clamp((tt - t0) / 0.45);
  if (e <= 0 || e >= 1) return null;
  return <>{Array.from({length: 10}).map((_, i) => {
    const a = (i / 10) * Math.PI * 2, d = 0.3 + easeOut(e) * 1.3;
    return <mesh key={i} geometry={G.ball} material={mat('#ffffff', {basic: true})} position={[Math.cos(a) * d, y + Math.sin(i * 1.7) * 0.5 * e, Math.sin(a) * d * 0.6]} scale={0.45 * (1 - e) + 0.12} />;
  })}</>;
};

/** flux_tvv: owner of the airport (runway end, airport at x 197) */
export const DonoAeroporto: React.FC<{tt: number}> = ({tt}) => {
  const k = pop(tt, D25.AERO, 0.45);
  return (
    <group position={[201, 0.16, 22]}>
      {k > 0 ? (
        <group scale={1}>
          <Capy scale={0.95 * k} shirt="#2f6fd6" cap="#14110c" sash pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.7, brow: 0.4, blink: 0}} />
          <Crown k={k} y={2.45} />
          <NameTag name={PPL.dono_aeroporto} k={k} />
        </group>
      ) : null}
      <Poof tt={tt} t0={D25.AERO - 0.1} />
    </group>
  );
};

/* wishes set west of the city (x −330, z 120) */
export const W0: [number, number] = [-330, 120];
const X = (x: number) => W0[0] + x, Z = (z: number) => W0[1] + z;

export const Desejos25: React.FC<{tt: number}> = ({tt}) => {
  const bill = useMemo(() => texMat(textTexture('✨ THAILA ✨', {bg: '#14110c', fg: '#ffd21e', border: '#ff7aa8', w: 1024, h: 360, size: 210})), []);
  const kB = pop(tt, D25.COMERCIAL, 0.5), kP = pop(tt, D25.PASSARELA, 0.5);
  const kA = pop(tt, D25.AMARELA, 0.45), kV = pop(tt, D25.VERDE, 0.45);
  const walk = ((tt * 0.35) % 1);
  const zWalk = -4.5 + Math.abs(walk * 2 - 1) * 9;
  return (
    <group>
      <mesh geometry={G.box} material={mat('#9fd86a')} position={[X(0), 0.04, Z(0)]} scale={[44, 0.04, 26]} receiveShadow />
      {/* commercial billboard for Thaila */}
      {kB > 0 ? (
        <group position={[X(-12), 0.06, Z(-3)]} scale={[1, kB, 1]}>
          {[-3.6, 3.6].map((x) => <P key={x} geo={G.cyl} color="#3a3f47" p={[x, 2.5, 0]} s={[0.22, 5, 0.22]} o={0.02} />)}
          <P geo={G.box} color="#14110c" p={[0, 6.4, -0.12]} s={[9.4, 3.8, 0.3]} o={0.04} />
          <mesh geometry={G.box} material={bill} position={[0, 6.4, 0.06]} scale={[8.8, 3.2, 0.06]} />
          {Array.from({length: 22}).map((_, i) => {
            const top = i < 11, x = -4.4 + (i % 11) * 0.88;
            const on = (Math.floor(tt * 8) + i) % 3 === 0;
            return <mesh key={i} geometry={G.ballLo} material={mat(on ? '#fff6b0' : '#ff7aa8', {basic: true})} position={[x, top ? 8.35 : 4.45, 0.12]} scale={0.16} />;
          })}
          <group position={[1.5, 0.08, 2.4]}>
            <Capy scale={0.8} shirt="#ff7aa8" cap={null} pose={{armL: [0, 0, 2.2 + Math.sin(tt * 6) * 0.3], armR: [0, 0, -2.2 - Math.sin(tt * 6) * 0.3], mouth: 0.9, brow: 0.5, blink: 0}} />
            <NameTag name={PPL.comercial} k={1} />
          </group>
        </group>
      ) : null}
      {/* fashion runway (passarela) for ana clara */}
      {kP > 0 ? (
        <group position={[X(0), 0.06, Z(0)]} scale={kP}>
          <P geo={G.box} color="#ff7aa8" p={[0, 0.35, 0]} s={[2.6, 0.7, 11]} o={0.04} />
          <P geo={G.box} color="#ffffff" p={[0, 0.72, 0]} s={[1.2, 0.04, 10.8]} o={0} />
          {Array.from({length: 12}).map((_, i) => <mesh key={i} geometry={G.ballLo} material={mat((Math.floor(tt * 6) + i) % 2 ? '#fff6b0' : '#ffd21e', {basic: true})} position={[i % 2 ? 1.35 : -1.35, 0.78, -5 + Math.floor(i / 2) * 2]} scale={0.12} />)}
          <group position={[0, 0.72, zWalk]} rotation={[0, walk < 0.5 ? 0 : Math.PI, 0]}>
            <Girl tt={tt} wave={0.4} skin="#c68e5f" dress="#d62976" hair="#5b3a1e" scale={0.95} />
            <group position={[0, 0.2, 0]}><NameTag name={PPL.passarela} k={1} /></group>
          </group>
          {[-1, 1].flatMap((sd) => [-3, 0, 3].map((z, i) => {
            const flash = (Math.floor(tt * 5 + i * 1.7 + sd) % 4) === 0;
            return (
              <group key={sd + '_' + z} position={[sd * 3.2, 0, z]} rotation={[0, sd > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
                <Capy scale={0.55} shirt={['#2fb5ff', '#ffd21e', '#5ec26a'][i]} cap={null} pose={{armL: [0, 0, 1.2], armR: [0, 0, -1.2], mouth: 0.5, blink: 0}} />
                {flash ? <mesh geometry={G.ballLo} material={mat('#ffffff', {basic: true})} position={[0, 1.15, 0.45]} scale={0.25} /> : null}
              </group>
            );
          }))}
        </group>
      ) : null}
      {/* yellow house (no name: the @ was unreadable) + green house for arthurfenamdo */}
      {[[kA, '#ffd21e', 11, null], [kV, '#5ec26a', 17, PPL.casa_verde]].map(([k, c, x, who]: any, n) => k > 0 ? (
        <group key={n} position={[X(x), 0.06, Z(-1)]}>
          <group scale={2.6 * k}>
            <P geo={G.box} color={c} p={[0, 0.55, 0]} s={[1.5, 1.1, 1.5]} o={0.04} />
            <P geo={G.cone4} color={n ? '#2d6a4f' : '#e2483d'} p={[0, 1.45, 0]} r={[0, Math.PI / 4, 0]} s={[1.3, 0.7, 1.3]} o={0.04} />
            <P geo={G.box} color="#7b4a28" p={[0, 0.35, 0.76]} s={[0.34, 0.66, 0.04]} o={0.02} />
            {[-0.45, 0.45].map((wx) => <P key={wx} geo={G.box} color="#cdeeff" p={[wx, 0.72, 0.76]} s={[0.3, 0.28, 0.04]} o={0.02} />)}
          </group>
          {who ? (
            <group position={[1.6, 0.06, 2.8]}>
              <Capy scale={0.7 * k} shirt="#5ec26a" cap={null} pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.7, brow: 0.4, blink: 0}} />
              <NameTag name={who} k={k} />
            </group>
          ) : null}
        </group>
      ) : null)}
    </group>
  );
};

/** ending gag: a plane takes off over the airport ("o avião decola sem você!") */
export const Decola: React.FC<{tt: number}> = ({tt}) => {
  if (tt < D25.DECOLA - 1.5 || tt >= LOOP_AT) return null;
  const e = clamp((tt - (D25.DECOLA - 1.5)) / 2.6);
  const z = 28 - e * 60, y = 0.9 + Math.max(0, e - 0.35) * 18;
  return (
    <group position={[197, y, z]} rotation={[-Math.max(0, e - 0.35) * 0.5, Math.PI, 0]}>
      <P geo={G.cyl12} color="#ffffff" r={[Math.PI / 2, 0, 0]} s={[0.9, 9, 0.9]} o={0.04} />
      <P geo={G.cone6} color="#e2483d" p={[0, 0, 5]} r={[Math.PI / 2, 0, 0]} s={[0.9, 1.6, 0.9]} o={0.03} />
      <P geo={G.box} color="#2f6fd6" p={[0, 0, 0.5]} s={[11, 0.18, 2.2]} o={0.03} />
      <P geo={G.box} color="#2f6fd6" p={[0, 1.2, -4]} s={[0.18, 2.2, 1.6]} o={0.03} />
      <P geo={G.box} color="#2f6fd6" p={[0, 0.2, -4]} s={[4, 0.14, 1.2]} o={0.03} />
      {[-2, -1, 0, 1, 2].map((zz) => <P key={zz} geo={G.box} color="#cdeeff" p={[0.9, 0.25, zz]} s={[0.04, 0.3, 0.45]} o={0} />)}
    </group>
  );
};
