import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat} from './parts';
import {Capy} from './Capy';
import {NameTag, MiniHouse} from './World';
import {Bricks, boxShell, Drop} from './Usina';
import type {Brick} from './Usina';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, HB24, LOOP_AT} from '../timeline';
import PEOPLE from '../people.json';

const PPL = PEOPLE as any;

/** wish: moniquinha_098 — girl doctor next to the hospital block */
export const Medica: React.FC<{tt: number}> = ({tt}) => {
  const k = pop(tt, HB24.MEDICA, 0.45);
  if (k <= 0) return null;
  return (
    <group position={[22, 0.1, -20.5]} scale={k}>
      <Girl tt={tt} skin="#6b4430" dress="#ffffff" hair="#1d130d" />
      <P geo={G.box} color="#e2483d" p={[0, 1.42, 0.14]} r={[0, 0, 0]} s={[0.12, 0.12, 0.02]} o={0} />
      <P geo={G.box} color="#e2483d" p={[0, 1.42, 0.14]} s={[0.04, 0.2, 0.02]} o={0} />
      <P geo={G.cyl} color="#3a3f47" p={[0.12, 1.33, 0.15]} r={[0, 0, 0.4]} s={[0.02, 0.32, 0.02]} o={0} />
      <P geo={G.ballLo} color="#cfd4da" p={[0.18, 1.18, 0.16]} s={0.05} o={0} />
      <group position={[0, 0.15, 0]}><NameTag name={PPL.medica} k={1} /></group>
    </group>
  );
};

/** wishes: neidinha's yellow house + kadoido's workshop, next to the follower neighbourhood */
export const Pedidos: React.FC<{tt: number}> = ({tt}) => {
  const k1 = pop(tt, HB24.AMARELA, 0.45), k2 = pop(tt, HB24.OFICINA, 0.45);
  const sign = useMemo(() => texMat(textTexture('OFICINA', {bg: '#2f6fd6', fg: '#ffffff', border: '#14110c', w: 800, h: 180, size: 120})), []);
  return (
    <group>
      <mesh geometry={G.box} material={mat('#9fd86a')} position={[-324, 0.04, 60]} scale={[30, 0.04, 14]} receiveShadow />
      {k1 > 0 ? (
        <group position={[-331, 0.06, 59]}>
          <group scale={2.6}>
            <group scale={k1}>
              <P geo={G.box} color="#ffd21e" p={[0, 0.55, 0]} s={[1.5, 1.1, 1.5]} o={0.04} />
              <P geo={G.cone4} color="#e2483d" p={[0, 1.45, 0]} r={[0, Math.PI / 4, 0]} s={[1.3, 0.7, 1.3]} o={0.04} />
              <P geo={G.box} color="#7b4a28" p={[0, 0.35, 0.76]} s={[0.34, 0.66, 0.04]} o={0.02} />
              <P geo={G.box} color="#cdeeff" p={[0.45, 0.72, 0.76]} s={[0.3, 0.28, 0.04]} o={0.02} />
              <P geo={G.box} color="#cdeeff" p={[-0.45, 0.72, 0.76]} s={[0.3, 0.28, 0.04]} o={0.02} />
            </group>
          </group>
          <group position={[1.4, 0.06, 2.6]}>
            <Capy scale={0.7 * k1} shirt="#ffd21e" cap={null} pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.7, brow: 0.4, blink: 0}} />
            <NameTag name={PPL.casa_amarela} k={k1} />
          </group>
        </group>
      ) : null}
      {k2 > 0 ? (
        <group position={[-318, 0.06, 59]} scale={k2}>
          <P geo={G.box} color="#8b949c" p={[0, 1.4, -0.5]} s={[4.4, 2.8, 3.4]} o={0.05} />
          <P geo={G.box} color="#3a3f47" p={[0, 1.1, 1.22]} s={[2.6, 2.1, 0.06]} o={0.02} />
          {[0.3, 0.7, 1.1, 1.5, 1.9].map((y) => <P key={y} geo={G.box} color="#4a4f57" p={[0, y, 1.26]} s={[2.6, 0.04, 0.02]} o={0} />)}
          <mesh geometry={G.box} material={sign} position={[0, 3.2, 1.2]} scale={[3.6, 0.8, 0.1]} />
          {[0, 0.36, 0.72].map((y) => <P key={y} geo={G.cyl12} color="#1c1f26" p={[2.6, 0.18 + y, 1.2]} s={[0.5, 0.32, 0.5]} o={0.02} />)}
          <group position={[-1.6, 0.06, 2.2]}>
            <Capy scale={0.7} shirt="#2f6fd6" cap="#e2483d" pose={{armL: [0, 0, 0.3], armR: [0, 0, -1.2 - Math.max(0, Math.sin(tt * 8)) * 1.2], mouth: 0.6, brow: 0.3, blink: 0}} />
            <P geo={G.box} color="#cfd4da" p={[0.55, 1.05 + Math.max(0, Math.sin(tt * 8)) * 0.2, 0.2]} r={[0, 0, 0.8]} s={[0.07, 0.5, 0.07]} o={0} />
            <NameTag name={PPL.oficina} k={1} />
          </group>
        </group>
      ) : null}
    </group>
  );
};

/* ---------------- LEGO hamburgueria (west of the city, facade faces +z) ---------------- */
export const HC: [number, number] = [-250, -110];
const X = (x: number) => HC[0] + x, Z = (z: number) => HC[1] + z;
const WALLS: Brick[] = boxShell(X(0), Z(0), 12, 9, 3.8, ['#e2483d', '#ffd21e'], HB24.PAREDES - 0.75, 0.75, 0.3);
const ROOF = 4.2;
/** burger layers on the roof: [color, height, radius, t0 key] */
const LAYERS: [string, number, number, keyof typeof HB24][] = [
  ['#e0a35e', 0.9, 2.6, 'PAO'],
  ['#5b3a1e', 0.8, 2.75, 'CARNE'],
  ['#ffd21e', 0.18, 2.9, 'QUEIJO'],
  ['#5ec26a', 0.2, 2.95, 'GIGANTE'],
  ['#e2483d', 0.25, 2.5, 'GIGANTE'],
];
export const Hamburgueria: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const sign = useMemo(() => texMat(textTexture('HAMBURGUERIA', {bg: '#14110c', fg: '#ffd21e', border: '#ffd21e', w: 1024, h: 200, size: 120})), []);
  const base = easeOut(clamp((t - HB24.DONA + 0.6) / 0.4));
  const boom = tt >= HB24.DESMONTA && tt < LOOP_AT ? clamp((tt - HB24.DESMONTA) / 0.8) : 0;
  let y = ROOF;
  return (
    <group>
      <group position={[X(0), 0, Z(2)]} scale={[Math.max(0.0001, base), 1, Math.max(0.0001, base)]}>
        <mesh geometry={G.box} material={mat('#cfd4da')} position={[0, 0.07, 0]} scale={[24, 0.1, 22]} receiveShadow />
        {[-6, -2, 2, 6].map((x) => <mesh key={x} geometry={G.box} material={mat('#ffffff')} position={[x, 0.13, 9]} scale={[2, 0.03, 0.4]} />)}
      </group>
      <Bricks t={t} list={WALLS} />
      <Drop t={t} t0={HB24.PAREDES} h={7} dur={0.25} p={[X(0), 0.1, Z(0)]}>
        <P geo={G.box} color="#14110c" p={[0, ROOF - 0.15, 0]} s={[12.6, 0.3, 9.6]} o={0.04} />
        <mesh geometry={G.box} material={sign} position={[0, 3.3, 4.62]} scale={[8.4, 1.3, 0.1]} />
        <P geo={G.box} color="#c9e8ff" p={[0, 1.3, 4.58]} s={[6.5, 1.8, 0.06]} o={0.02} />
        {Array.from({length: 8}).map((_, i) => <P key={i} geo={G.box} color={i % 2 ? '#ffffff' : '#e2483d'} p={[-5.25 + i * 1.5, 2.55, 5.2]} r={[0.5, 0, 0]} s={[1.5, 0.08, 1.4]} o={0.02} />)}
        {/* fries box */}
        <group position={[4.8, 0.15, 6.4]}>
          <P geo={G.box} color="#e2483d" p={[0, 0.7, 0]} s={[1.2, 1.4, 0.8]} o={0.03} />
          {Array.from({length: 7}).map((_, i) => <P key={i} geo={G.box} color="#ffd21e" p={[-0.45 + i * 0.15, 1.6 + (i % 3) * 0.12, (i % 2) * 0.15 - 0.07]} r={[0, 0, (i - 3) * 0.06]} s={[0.1, 0.9, 0.1]} o={0.01} />)}
        </group>
      </Drop>
      {/* giant burger, layer by layer */}
      {LAYERS.map(([c, h, r, key], i) => {
        const t0 = HB24[key] + (i === 4 ? 0.12 : 0);
        const k = clamp((t - t0) / 0.3);
        const yy = y + h / 2; y += h;
        if (t < t0) return null;
        const drop = (1 - easeOut(k)) * 6;
        const fly = boom * (8 + i * 2);
        return <P key={i} geo={G.cyl12} color={c} p={[X(0) + Math.cos(i * 1.9) * fly, yy + drop + boom * (3 + i * 2.2) - boom * boom * 4, Z(0) + Math.sin(i * 1.9) * fly]} r={[boom * i, 0, boom * (i - 2)]} s={[r, h, r]} o={0.04} />;
      })}
      {t >= HB24.GIGANTE + 0.25 ? (() => {
        const fly = boom * 18;
        return (
          <group position={[X(0) + fly * 0.3, ROOF + 2.33 + boom * 14 - boom * boom * 5, Z(0) - fly * 0.4]} rotation={[boom * 2, 0, boom]}>
            <mesh geometry={G.dome} material={mat('#e0a35e')} scale={[2.7, 1.7, 2.7]} />
            {Array.from({length: 12}).map((_, i) => <P key={i} geo={G.ballLo} color="#fff4c8" p={[Math.cos(i * 2.4) * 1.6 * ((i % 3) / 3 + 0.4), 1.25 + (i % 3) * 0.12, Math.sin(i * 2.4) * 1.6 * ((i % 3) / 3 + 0.4)]} s={0.12} o={0} />)}
          </group>
        );
      })() : null}
      {/* owner */}
      {(() => {
        const kk = pop(t, HB24.DONA, 0.45);
        if (kk <= 0) return null;
        return (
          <group position={[X(-2.5), 0.16, Z(7.2)]}>
            <Girl tt={tt} skin="#8a5a3c" dress="#e2483d" hair="#2a1a12" scale={0.85 * kk} />
            <P geo={G.cone6} color="#ffd21e" p={[0, 2.2 * kk, 0]} s={[0.2 * kk, 0.26 * kk, 0.2 * kk]} o={0.02} />
            <group position={[0, 0.2, 0]}><NameTag name={PPL.dona_hamburgueria} k={kk} /></group>
          </group>
        );
      })()}
    </group>
  );
};
