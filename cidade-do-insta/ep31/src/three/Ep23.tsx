import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, boxShell, Drop} from './Usina';
import type {Brick} from './Usina';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, SV23, LOOP_AT} from '../timeline';
import PEOPLE from '../people.json';

const PPL = PEOPLE as any;

/** wishes: three followers who asked "não quero ser capivara" turn into girls */
const GIRLS: {skin: string; dress: string; hair: string}[] = [
  {skin: '#8a5a3c', dress: '#7a4fd0', hair: '#2a1a12'},
  {skin: '#c68e5f', dress: '#2fb5ff', hair: '#5b3a1e'},
  {skin: '#f1d0b0', dress: '#ff7aa8', hair: '#8a5a32'},
];
export const Desejos: React.FC<{tt: number}> = ({tt}) => {
  const poof = clamp((tt - SV23.POOF) / 0.45);
  const names: string[] = PPL.meninas_ep23;
  return (
    <group position={[-330, 0.1, 42]}>
      {names.map((n, i) => {
        const x = (i - 1) * 1.35, z = i === 1 ? -0.4 : 0;
        const gk = pop(tt, SV23.POOF + 0.1 + i * 0.08, 0.45);
        return (
          <group key={n} position={[x, 0, z]}>
            {tt < SV23.POOF + 0.08 ? <Capy scale={0.62} shirt={GIRLS[i].dress} cap={null} pose={{brow: -0.4, mouth: 0.2, blink: 0, head: [0.15, 0, 0]}} /> : null}
            {gk > 0 ? <group scale={gk * 0.78}><Girl tt={tt + i} {...GIRLS[i]} /></group> : null}
            <group scale={0.72} position={[0, 0.15, 0]}><NameTag name={n} k={1} /></group>
            {poof > 0 && poof < 1 ? Array.from({length: 8}).map((_, k) => {
              const a = (k / 8) * Math.PI * 2, d = 0.25 + easeOut(poof) * 0.9;
              return <mesh key={k} geometry={G.ball} material={mat('#ffffff', {basic: true})} position={[Math.cos(a) * d, 0.8 + Math.sin(k * 1.7) * 0.4 * poof, Math.sin(a) * d * 0.5]} scale={0.35 * (1 - poof) + 0.1} />;
            }) : null}
          </group>
        );
      })}
    </group>
  );
};

/** the judge (sophya.nunes.121), at a little courtroom bench next to the wishes set */
export const Juiza: React.FC<{tt: number}> = ({tt}) => {
  const k = pop(tt, SV23.JUIZA, 0.45);
  if (k <= 0) return null;
  const bang = tt > SV23.JUIZA + 0.8 ? Math.max(0, Math.sin((tt - SV23.JUIZA) * 9)) : 0;
  return (
    <group position={[-342, 0.1, 42]} scale={k}>
      <P geo={G.box} color="#7b4a28" p={[0, 0.55, 0.9]} s={[2.4, 1.1, 0.7]} o={0.04} />
      <P geo={G.box} color="#e8b923" p={[0, 0.75, 1.27]} s={[1.2, 0.3, 0.04]} o={0.02} />
      <group position={[0, 0, -0.1]}><Girl tt={tt} wave={0} skin="#c68e5f" dress="#14110c" hair="#2a1a12" scale={0.85} /></group>
      <P geo={G.box} color="#ffffff" p={[0, 1.42, 0.12]} s={[0.36, 0.08, 0.04]} o={0} />
      <group position={[0.42, 1.25, 0.55]} rotation={[0, 0, -0.6 - bang * 0.7]}>
        <P geo={G.cyl} color="#5b3a1e" p={[0.18, 0, 0]} r={[0, 0, Math.PI / 2]} s={[0.035, 0.36, 0.035]} o={0} />
        <P geo={G.cyl} color="#5b3a1e" p={[0.38, 0, 0]} s={[0.09, 0.22, 0.09]} o={0.02} />
      </group>
      <group position={[0, 0.2, 0]}><NameTag name={PPL.juiza} k={1} /></group>
    </group>
  );
};

/** dona do zoológico: maite at the zoo gate (gate at x 0, z −249, facing +z) */
export const DonaZoo: React.FC<{tt: number}> = ({tt}) => {
  const k = pop(tt, SV23.ZOO, 0.45);
  if (k <= 0) return null;
  return (
    <group position={[2.2, 0.16, -244.5]}>
      <Capy scale={0.85 * k} shirt="#c9a86a" cap="#e8d7a8" sash pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.6, brow: 0.4, blink: 0}} />
      <NameTag name={PPL.dona_zoo} k={k} />
      <P geo={G.cone6} color="#ffd21e" p={[0, 2.25 * k, 0]} s={[0.22 * k, 0.28 * k, 0.22 * k]} o={0.02} />
    </group>
  );
};

/* ---------------- LEGO ice cream shop, east of the city (front faces −x) ---------------- */
export const SC2: [number, number] = [205, 62];
const X = (x: number) => SC2[0] + x, Z = (z: number) => SC2[1] + z;
const WALLS: Brick[] = boxShell(X(2), Z(0), 9, 10, 3.6, ['#ffd1e0', '#ffffff'], SV23.BALCAO - 0.8, 0.7, 0.3);
const SCOOPS = ['#ff7aa8', '#7fe0c0', '#7a4b26'];

export const Sorveteria: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const sign = useMemo(() => texMat(textTexture('SORVETERIA', {bg: '#ff7aa8', fg: '#ffffff', border: '#14110c', w: 1024, h: 200, size: 130})), []);
  const base = easeOut(clamp((t - SV23.DONO + 0.5) / 0.4));
  const melt = tt >= SV23.MELT && tt < LOOP_AT ? clamp((tt - SV23.MELT) / 0.9) : 0;
  return (
    <group>
      <group position={[X(0), 0, Z(0)]} scale={[Math.max(0.0001, base), 1, Math.max(0.0001, base)]}>
        <mesh geometry={G.box} material={mat('#e9e1cf')} position={[0, 0.07, 0]} scale={[22, 0.1, 20]} receiveShadow />
        {[-6, -3, 0, 3, 6].map((z, i) => <mesh key={z} geometry={G.box} material={mat(i % 2 ? '#ffd1e0' : '#ffffff')} position={[-6, 0.13, z]} scale={[6, 0.03, 3]} receiveShadow />)}
      </group>
      <Bricks t={t} list={WALLS} />
      <Drop t={t} t0={SV23.BALCAO - 0.1} h={7} dur={0.25} p={[X(2), 3.9, Z(0)]}>
        <P geo={G.box} color="#ffffff" p={[0, 0, 0]} s={[9.6, 0.35, 10.6]} o={0.04} />
      </Drop>
      {/* striped awning + counter (balcão) + sign */}
      <Drop t={t} t0={SV23.BALCAO} h={7} dur={0.25} p={[X(-2.7), 0.1, Z(0)]}>
        <P geo={G.box} color="#c9e8ff" p={[-0.45, 1.0, 0]} s={[0.9, 1.4, 6.5]} o={0.03} />
        <P geo={G.box} color="#ff7aa8" p={[-0.5, 1.75, 0]} s={[1.1, 0.12, 6.8]} o={0.02} />
        {Array.from({length: 4}).map((_, i) => <P key={i} geo={G.ball} color={SCOOPS[i % 3]} p={[-0.45, 1.85, -2.2 + i * 1.45]} s={0.28} o={0.02} />)}
        {Array.from({length: 7}).map((_, i) => <P key={'a' + i} geo={G.box} color={i % 2 ? '#ffffff' : '#ff7aa8'} p={[-1.2, 3.25, -3 + i]} r={[0, 0, 0.45]} s={[2.0, 0.08, 1.0]} o={0.02} />)}
        <mesh geometry={G.box} material={sign} position={[-0.25, 2.55, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[6.4, 1.25, 0.1]} />
      </Drop>
      {/* giant cone on the roof, scoops drop one by one */}
      <Drop t={t} t0={SV23.CASQUINHA} h={10} dur={0.3} p={[X(2), 4.1, Z(0)]}>
        <group rotation={[Math.PI, 0, 0]} position={[0, 2.6, 0]}>
          <P geo={G.cone6} color="#d9a05b" s={[1.6, 5.2, 1.6]} o={0.05} />
        </group>
        {[0.2, 1.4, 2.6].map((y) => <P key={y} geo={G.cyl12} color="#b97f3e" p={[0, y + 1.4, 0]} s={[0.4 + y * 0.3, 0.06, 0.4 + y * 0.3]} o={0} />)}
      </Drop>
      {SCOOPS.map((c, i) => {
        const k = pop(t, SV23.BOLAS + i * 0.28, 0.35);
        if (k <= 0) return null;
        const y = 4.1 + 5.6 + i * 1.5;
        return (
          <group key={c} position={[X(2), y - 3 * (1 - clamp((t - SV23.BOLAS - i * 0.28) / 0.25)) * -1, Z(0)]} scale={[k * (1 + 0.5 * melt), k * (1 - 0.45 * melt), k * (1 + 0.5 * melt)]}>
            <P geo={G.ball} color={c} s={1.45 - i * 0.12} o={0.05} />
            {melt > 0 ? [0, 1, 2, 3].map((d) => <P key={d} geo={G.cyl} color={c} p={[Math.cos(d * 1.6) * 1.2, -0.9 - melt * 1.5, Math.sin(d * 1.6) * 1.2]} s={[0.18, 1.2 + melt * 3, 0.18]} o={0} />) : null}
          </group>
        );
      })}
      {t > SV23.BOLAS + 0.9 ? <P geo={G.ball} color="#e2183b" p={[X(2), 4.1 + 5.6 + 2 * 1.5 + 1.4, Z(0)]} s={0.32} o={0.02} /> : null}
      {/* owner: dark_sus98 */}
      {(() => {
        const kk = pop(t, SV23.DONO, 0.45);
        if (kk <= 0) return null;
        return (
          <group position={[X(-5.2), 0.16, Z(0.5)]} rotation={[0, -Math.PI / 2, 0]}>
            <Capy scale={0.85 * kk} shirt="#ff7aa8" cap="#ffffff" sash pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.7, brow: 0.4, blink: 0}} />
            <NameTag name={PPL.dono_sorveteria} k={kk} />
            <P geo={G.cone6} color="#ffd21e" p={[0, 2.25 * kk, 0]} s={[0.22 * kk, 0.28 * kk, 0.22 * kk]} o={0.02} />
          </group>
        );
      })()}
    </group>
  );
};
