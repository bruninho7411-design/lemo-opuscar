import React, {useMemo} from 'react';
import * as THREE from 'three';
import {G, P, mat, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, boxShell, Drop} from './Usina';
import type {Brick} from './Usina';
import {pop, ramp, clamp, easeOut, PR, LOOP_AT, TOTAL_SEC} from '../timeline';
import PEOPLE from '../people.json';

/** beach along the south edge of the city */
export const BZ = 240; // beach centre z
const SV: string[] = (PEOPLE as any).salvavidas;
const MAYOR: string = (PEOPLE as any).prefeito_ep19;

const KIOSK = boxShell(-12, BZ - 2, 5, 4, 2.75, ['#c8894a', '#e0a35e'], PR.QUIOSQUE, 0.55, 0.3);
const TOWER: Brick[] = [[-1, -1], [1, -1], [-1, 1], [1, 1]].flatMap(([sx, sz], k) => boxShell(9 + sx * 1.1, BZ + 4 + sz * 1.1, 0.5, 0.5, 3.3, ['#ffffff', '#e2483d'], PR.TORRE + k * 0.08, 0.35, 0.3));

/** the curling wave: hook (surf) and ending (tsunami) */
const waveGeo = (() => {
  const g = new THREE.CylinderGeometry(1, 1, 1, 18, 1, true, 0, Math.PI);
  g.rotateZ(Math.PI / 2);
  return g;
})();
export const waveZ = (rt: number) => 286 - (rt + 0.6) * 6;
const Wave: React.FC<{z: number; scale: number; tt: number}> = ({z, scale, tt}) => (
  <group position={[0, 0.1, z]} scale={[1, scale, scale]}>
    <mesh geometry={waveGeo} material={mat('#0b5fa8', {emissive: '#06345e'})} scale={[60, 3.6, 3.6]} />
    <mesh geometry={waveGeo} material={mat('#5fd0ff', {emissive: '#2a8fc8'})} position={[0, 0, -0.25]} scale={[60.2, 2.2, 3.4]} />
    <mesh geometry={G.box} material={mat('#ffffff', {basic: true})} position={[0, 3.55, 0.4]} scale={[60, 0.35, 1.4]} />
    {Array.from({length: 24}).map((_, i) => (
      <mesh key={i} geometry={G.ballLo} material={mat('#ffffff', {basic: true})} position={[-28 + i * 2.4, 3.7 + Math.sin(tt * 6 + i) * 0.2, -0.6]} scale={0.55 + 0.25 * Math.sin(tt * 4 + i * 2)} />
    ))}
  </group>
);

const Umbrella: React.FC<{c: string}> = ({c}) => (
  <group>
    <P geo={G.cyl} color="#ffffff" p={[0, 1.2, 0]} s={[0.06, 2.4, 0.06]} o={0.02} />
    <P geo={G.cone6} color={c} p={[0, 2.5, 0]} s={[1.6, 0.6, 1.6]} o={0.04} />
    <P geo={G.box} color={c} p={[1.0, 0.1, 0.4]} s={[1.0, 0.04, 1.9]} o={0.02} />
  </group>
);

export const Praia: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const kioskWord = useMemo(() => texMat(textTexture('QUIOSQUE DA CIDADE', {bg: '#ffd21e', fg: '#14110c', border: '#14110c', w: 1024, h: 170, size: 82})), []);
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const hook = rt < PR.HOOK;
  const te = hook ? 999 : t;
  const sand = easeOut(ramp(te, PR.AREIA, PR.AREIA + 0.5));
  const tsunami = tt >= PR.TSUNAMI && tt < LOOP_AT;
  const tsK = clamp((tt - PR.TSUNAMI) / 1.4);
  return (
    <group>
      {/* ocean + moving foam lines */}
      <mesh geometry={G.box} material={mat('#2fb5ff', {emissive: '#1f6fa8'})} position={[0, 0.02, BZ + 250]} scale={[900, 0.04, 480]} receiveShadow />
      {Array.from({length: 10}).map((_, i) => {
        const ph = (tt * 0.25 + i / 10) % 1;
        return <mesh key={i} geometry={G.box} material={mat('#e8fbff', {basic: true})} position={[((i * 37) % 60) - 30, 0.06, BZ + 60 - ph * 46]} scale={[24, 0.02, 0.5]} />;
      })}
      {/* 1. sand */}
      <group scale={[1, 1, Math.max(0.0001, sand)]} position={[0, 0, BZ]}>
        <mesh geometry={G.box} material={mat('#f2d99c')} position={[0, 0.08, 0]} scale={[90, 0.16, 32]} receiveShadow />
        <mesh geometry={G.box} material={mat('#e8fbff', {basic: true})} position={[0, 0.1, 15.6 + Math.sin(tt * 1.4) * 0.5]} scale={[90, 0.02, 1.2]} />
      </group>
      {/* 2. kiosk */}
      <Bricks t={te} list={KIOSK} />
      <Drop t={te} t0={PR.QUIOSQUE + 0.55} h={6} dur={0.25} p={[-12, 0.3, BZ - 2]}>
        <P geo={G.cone4} color="#d9b36a" p={[0, 3.55, 0]} r={[0, Math.PI / 4, 0]} s={[4.4, 1.5, 3.6]} o={0.04} />
        <group rotation={[0, 0, 0]}><mesh geometry={G.box} material={kioskWord} position={[0, 2.1, 2.05]} scale={[4.4, 0.75, 0.08]} /></group>
        <P geo={G.box} color="#8a5a32" p={[0, 1.1, 2.3]} s={[4.6, 0.15, 0.6]} o={0.02} />
        {[-1.4, 0, 1.4].map((x) => <P key={x} geo={G.ball} color="#5b3a1e" p={[x, 1.35, 2.3]} s={0.22} o={0.02} />)}
      </Drop>
      {/* 3. lifeguard tower */}
      <Bricks t={te} list={TOWER} />
      <Drop t={te} t0={PR.TORRE + 0.5} h={6} dur={0.25} p={[9, 0.3, BZ + 4]}>
        <P geo={G.box} color="#ffffff" p={[0, 3.45, 0]} s={[3.2, 0.25, 3.2]} o={0.03} />
        <P geo={G.box} color="#e2483d" p={[0, 4.5, -0.4]} s={[2.6, 1.9, 2.2]} o={0.04} />
        <P geo={G.box} color="#cdeeff" p={[0, 4.6, 0.72]} s={[2.2, 0.9, 0.04]} o={0} />
        <P geo={G.cone4} color="#ffd21e" p={[0, 5.9, -0.4]} r={[0, Math.PI / 4, 0]} s={[2.2, 0.9, 1.9]} o={0.03} />
        <P geo={G.cyl} color="#cfd4da" p={[1.3, 6.4, -0.4]} s={[0.05, 2.0, 0.05]} o={0} />
        <group position={[1.75, 7.0, -0.4]} rotation={[0, Math.sin(tt * 3) * 0.3, 0]}><P geo={G.box} color="#e2483d" s={[0.9, 0.55, 0.03]} o={0.02} /></group>
      </Drop>
      {/* 4. umbrellas */}
      {[[-22, BZ + 6, '#e2483d'], [-17, BZ + 9, '#2f6fd6'], [-4, BZ + 7, '#ffd21e'], [2, BZ + 10, '#2d9a5a'], [15, BZ + 8, '#ff7aa8'], [21, BZ + 5, '#7a4fd0']].map(([x, z, c], i) => (
        <Drop key={i} t={te} t0={PR.GUARDASOL + i * 0.08} h={8} dur={0.25} p={[x as number, 0.16, z as number]}>
          <Umbrella c={c as string} />
        </Drop>
      ))}
      {/* beach-goers */}
      {Array.from({length: 10}).map((_, i) => {
        const k = hook ? 1 : pop(te, PR.GUARDASOL + 0.6 + i * 0.05, 0.3);
        if (k <= 0) return null;
        const x = -24 + i * 5.2, z = BZ + 6 + (i % 3) * 2.5;
        return (
          <group key={i} position={[x, 0.16 + Math.max(0, Math.sin(tt * 6 + i)) * 0.25, z]} rotation={[0, Math.sin(tt + i) * 0.6, 0]}>
            <Capy scale={0.55 * k} shirt={['#ff8f1f', '#2fb5ff', '#ff7aa8', '#ffd21e', '#5ec26a'][i % 5]} cap={i % 3 === 0 ? '#ffffff' : null}
              pose={{armL: [0, 0, 0.4 + Math.max(0, Math.sin(tt * 6 + i)) * 2], armR: [0, 0, -0.4], mouth: 0.5, blink: 0}} />
          </group>
        );
      })}
      {/* episode mayor on the sand */}
      <group position={[-8, 0.16, BZ + 6]}>
        <Capy scale={0.8} shirt="#2fb5ff" cap="#ffd21e" sash pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.5, brow: 0.4, blink: 0}} />
        <NameTag name={MAYOR} k={1} />
      </group>
      {/* lifeguards */}
      {SV.map((w, i) => {
        const kk = pop(te, PR.SV + i * 0.25, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[7.4 + i * 3.2, 0.16, BZ + 1.2]} rotation={[0, Math.PI, 0]}>
            <Capy scale={0.8 * kk} shirt="#e2483d" cap="#ffd21e" pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6 + i)) * 2.2], mouth: 0.4, brow: 0.3, blink: 0}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
      {/* hook: Capivaldo surfing the wave */}
      {hook ? (
        <group>
          <Wave z={waveZ(rt)} scale={1.6} tt={tt} />
          <group position={[Math.sin(tt * 1.6) * 2, 4.9, waveZ(rt) - 3.4]} rotation={[0.25, Math.PI + Math.sin(tt * 1.6) * 0.4, Math.sin(tt * 2.2) * 0.15]}>
            <P geo={G.box} color="#ffd21e" p={[0, 0, 0]} s={[1.0, 0.12, 3.0]} o={0.03} />
            <P geo={G.box} color="#e2483d" p={[0, 0.07, 0]} s={[0.2, 0.02, 2.8]} o={0} />
            <Capy p={[0, 0.06, 0]} scale={1.2} hat sash pose={{armL: [0, 0, 1.6], armR: [0, 0, -1.6], mouth: 0.8, brow: 0.5, lean: -0.2}} />
          </group>
        </group>
      ) : null}
      {tsunami ? <Wave z={292 - tsK * 22} scale={1.5 + tsK * 3.5} tt={tt} /> : null}
    </group>
  );
};
