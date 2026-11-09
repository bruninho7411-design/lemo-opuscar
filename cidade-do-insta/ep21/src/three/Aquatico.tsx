import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, boxShell, Drop} from './Usina';
import type {Brick} from './Usina';
import {pop, clamp, easeOut, PK, LOOP_AT} from '../timeline';
import PEOPLE from '../people.json';

/** ep21 water park, east of the city (tree-free band past the last street) */
export const AC: [number, number] = [205, 120];
const X = (x: number) => AC[0] + x, Z = (z: number) => AC[1] + z;
const SV: string[] = (PEOPLE as any).salvavidas_parque;
const WATER = '#3fb6f0', WATER_E = '#1f6fa8';

/* pools: brick rims built stud by stud, then the water rises */
const POOL: [number, number, number, number] = [-9, 6, 18, 12]; // x, z, w, d
const WAVE: [number, number, number, number] = [10, 6, 14, 12];
const RIM: Brick[] = [
  ...boxShell(X(POOL[0]), Z(POOL[1]), POOL[2], POOL[3], 0.9, ['#ffffff', '#cdeeff'], PK.PISCINA, 0.5, 0.3),
  ...boxShell(X(WAVE[0]), Z(WAVE[1]), WAVE[2], WAVE[3], 0.9, ['#ffd21e', '#ffffff'], PK.ONDAS, 0.5, 0.3),
];
const TOWER: Brick[] = boxShell(X(10), Z(-11), 3.2, 3.2, 8.2, ['#ff7aa8', '#ffffff'], PK.TOBOGA, 0.6, 0.3);
const BUCKET_TOWER: Brick[] = [[-1, -1], [1, -1], [-1, 1], [1, 1]].flatMap(([sx, sz], k) => boxShell(X(-10 + sx * 2), Z(-11 + sz * 2), 0.8, 0.8, 9.5, ['#2f6fd6', '#ffd21e'], PK.BALDE + k * 0.06, 0.5, 0.3));

/** helix slide around the tower: tube segments drop in one by one */
const SLIDE = Array.from({length: 22}).map((_, i) => {
  const a = i * 0.55, y = 8.4 - i * 0.36, r = 3.4;
  return {p: [X(10) + Math.cos(a) * r, y, Z(-11) + Math.sin(a) * r] as V3, ry: -a, i};
});

export const Aquatico: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const sign = useMemo(() => texMat(textTexture('PARQUE AQUÁTICO', {bg: '#2fb5ff', fg: '#ffffff', border: '#14110c', w: 1024, h: 170, size: 92})), []);
  const base = easeOut(clamp((t - PK.BASE) / 0.5));
  const fillP = easeOut(clamp((t - PK.PISCINA - 0.6) / 0.5));
  const fillW = easeOut(clamp((t - PK.ONDAS - 0.6) / 0.5));
  // giant bucket: fills, tips every ~5 s, dumps water; at the ending it tips straight at the camera
  const end = tt >= PK.VIRA && tt < LOOP_AT;
  const cyc = (((tt - PK.BALDE + 3.4) % 5.2) + 5.2) % 5.2 / 5.2;
  const tip = end ? easeOut(clamp((tt - PK.VIRA) / 0.5)) * 2.0 : cyc > 0.82 ? Math.sin(((cyc - 0.82) / 0.18) * Math.PI) * 1.9 : 0;
  const pour = tip > 1.2 ? (tip - 1.2) / 0.8 : 0;
  return (
    <group>
      {/* base plate */}
      <group position={[X(0), 0, Z(0)]} scale={[Math.max(0.0001, base), 1, Math.max(0.0001, base)]}>
        <mesh geometry={G.box} material={mat('#e9e1cf')} position={[0, 0.07, 0]} scale={[48, 0.12, 40]} receiveShadow />
        <mesh geometry={G.box} material={mat('#8fcf4f')} position={[0, 0.05, 0]} scale={[54, 0.08, 46]} receiveShadow />
      </group>
      {/* pools */}
      <Bricks t={t} list={RIM} />
      {fillP > 0 ? <mesh geometry={G.box} material={mat(WATER, {emissive: WATER_E})} position={[X(POOL[0]), 0.15 + 0.5 * fillP, Z(POOL[1])]} scale={[POOL[2] - 1, 0.04 + fillP * 0.9, POOL[3] - 1]} /> : null}
      {fillW > 0 ? (
        <group>
          <mesh geometry={G.box} material={mat('#2fa0e8', {emissive: WATER_E})} position={[X(WAVE[0]), 0.15 + 0.5 * fillW, Z(WAVE[1])]} scale={[WAVE[2] - 1, 0.04 + fillW * 0.9, WAVE[3] - 1]} />
          {[0, 1, 2, 3].map((k) => {
            const ph = (tt * 0.35 + k / 4) % 1;
            return <mesh key={k} geometry={G.box} material={mat('#e8fbff', {basic: true})} position={[X(WAVE[0]), 1.08 + Math.sin(ph * Math.PI) * 0.15, Z(WAVE[1] - 5.2 + ph * 10.4)]} scale={[WAVE[2] - 1.4, 0.06, 0.35]} />;
          })}
        </group>
      ) : null}
      {/* floats + swimmers once the water is in */}
      {fillP > 0.9 ? [[-14, 4, '#ff3040'], [-6, 8, '#ffd21e'], [-10, 2, '#5ec26a']].map(([x, z, c], i) => (
        <group key={i} position={[X(x as number), 1.05 + Math.sin(tt * 2 + i) * 0.08, Z(z as number)]}>
          <P geo={G.cyl12} color={c as string} s={[0.75, 0.22, 0.75]} o={0.02} />
          <Capy p={[0, -0.55, 0]} scale={0.5} shirt="#2fb5ff" pose={{armL: [0, 0, 1.6 + Math.sin(tt * 5 + i) * 0.4], armR: [0, 0, -1.6], mouth: 0.8, blink: 0}} />
        </group>
      )) : null}
      {/* slide tower + helix */}
      <Bricks t={t} list={TOWER} />
      <Drop t={t} t0={PK.TOBOGA + 0.6} h={6} dur={0.25} p={[X(10), 8.5, Z(-11)]}>
        <P geo={G.cone4} color="#ffd21e" p={[0, 1.0, 0]} r={[0, Math.PI / 4, 0]} s={[3.0, 1.6, 3.0]} o={0.04} />
      </Drop>
      {SLIDE.map((s) => {
        const k = pop(t, PK.TOBOGA + 0.7 + s.i * 0.03, 0.25);
        if (k <= 0) return null;
        return (
          <group key={s.i} position={s.p} rotation={[0.18, s.ry, 0]} scale={k}>
            <P geo={G.cyl} color={s.i % 2 ? '#ff7aa8' : '#ffd21e'} r={[0, 0, Math.PI / 2]} s={[0.55, 1.5, 0.55]} o={0.02} />
          </group>
        );
      })}
      {/* rider coming down the slide */}
      {t > PK.TOBOGA + 1.5 ? (() => {
        const u = ((tt * 0.45) % 1) * (SLIDE.length - 1);
        const a = u * 0.55, y = 8.4 - u * 0.36 + 0.5;
        return <group position={[X(10) + Math.cos(a) * 3.4, y, Z(-11) + Math.sin(a) * 3.4]} rotation={[0, -a + Math.PI / 2, 0]}><Capy scale={0.5} shirt="#ff7aa8" pose={{armL: [0, 0, 2.6], armR: [0, 0, -2.6], mouth: 0.9, blink: 0}} /></group>;
      })() : null}
      {/* giant bucket */}
      <Bricks t={t} list={BUCKET_TOWER} />
      <Drop t={t} t0={PK.BALDE + 0.6} h={8} dur={0.3} p={[X(-10), 9.9, Z(-11)]}>
        <P geo={G.box} color="#2f6fd6" p={[0, 0.1, 0]} s={[5.4, 0.3, 5.4]} o={0.03} />
        <group position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
          <group rotation={[tip, 0, 0]} position={[0, 0.2, 0]}>
            <P geo={G.cyl12} color="#ffd21e" p={[0, 1.4, 0]} s={[2.2, 2.6, 2.2]} o={0.05} />
            <mesh geometry={G.cyl12} material={mat(WATER, {emissive: WATER_E})} position={[0, 2.55, 0]} scale={[1.95, 0.2, 1.95]} />
            <P geo={G.cyl12} color="#e2483d" p={[0, 2.75, 0]} s={[2.35, 0.25, 2.35]} o={0.03} />
          </group>
        </group>
      </Drop>
      {pour > 0 ? (
        <group position={[X(-10), 0, Z(-11) + 3.2]}>
          <mesh geometry={G.cyl12} material={mat(WATER, {emissive: WATER_E})} position={[0, 5.5, 0]} scale={[1.6 * pour, 11, 1.6 * pour]} />
          {Array.from({length: 10}).map((_, i) => <mesh key={i} geometry={G.ballLo} material={mat('#e8fbff', {basic: true})} position={[Math.cos(i * 0.63) * 2.6 * pour, 0.6 + ((tt * 3 + i * 0.37) % 1) * 1.6, Math.sin(i * 0.63) * 2.6 * pour]} scale={0.45} />)}
        </group>
      ) : null}
      {/* entrance arch facing the city (−x) */}
      <Drop t={t} t0={PK.BASE + 0.4} h={7} dur={0.25} p={[X(-23), 0.1, Z(6)]}>
        {[-4, 4].map((z) => <P key={z} geo={G.box} color="#2fb5ff" p={[0, 2.2, z]} s={[1, 4.4, 1]} o={0.04} />)}
        <P geo={G.box} color="#ffd21e" p={[0, 4.7, 0]} s={[1.2, 0.6, 9.6]} o={0.04} />
        <mesh geometry={G.box} material={sign} position={[-0.4, 5.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[8.6, 1.45, 0.12]} />
      </Drop>
      {/* palms */}
      {[[-21, -6], [-21, 17], [21, 17], [21, -17], [0, 17]].map(([x, z], i) => (
        <Drop key={i} t={t} t0={PK.BASE + 0.3 + i * 0.06} h={6} dur={0.25} p={[X(x), 0.1, Z(z)]}>
          <P geo={G.cyl} color="#8a5a32" p={[0, 2, 0]} r={[0, 0, 0.12]} s={[0.22, 4, 0.22]} o={0.02} />
          {[0, 1, 2, 3, 4].map((k) => <P key={k} geo={G.box} color="#3f9a4a" p={[Math.cos(k * 1.26) * 1.1, 4.1, Math.sin(k * 1.26) * 1.1]} r={[0, -k * 1.26, -0.4]} s={[2.2, 0.12, 0.6]} o={0.02} />)}
        </Drop>
      ))}
      {/* park lifeguards */}
      {SV.map((w, i) => {
        const kk = pop(t, PK.SV + i * 0.22, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[X(-19), 0.16, Z(1 + i * 2.6)]} rotation={[0, -Math.PI / 2, 0]}>
            <Capy scale={0.8 * kk} shirt="#e2483d" cap="#ffd21e" pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6 + i)) * 2.2], mouth: 0.5, brow: 0.3, blink: 0}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};
