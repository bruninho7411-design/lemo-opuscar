import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, BasePlateStuds, boxShell, Drop} from './Usina';
import {pop, ramp, clamp, easeOut, E} from '../timeline';
import PEOPLE from '../people.json';

/** block (0,1); the school is built in local coords facing +z and turned to face the plaza */
export const ESCOLA: [number, number] = [0, 30];
const TEACHERS: string[] = (PEOPLE as any).teachers;

const WALLS = boxShell(0, -4, 13, 6, 4.4, ['#ffd21e', '#ffbf1f', '#ffd21e'], E.PAREDES, 0.9, 0.4);
const TOWER = boxShell(0, -4, 2.6, 2.6, 2.75, ['#ffffff', '#eef1f4'], E.SINO, 0.45, 5.15);

const Kid: React.FC<{tt: number; i: number; p: V3; k: number}> = ({tt, i, p, k}) => {
  const hop = Math.max(0, Math.sin(tt * 7 + i * 1.3)) * 0.35;
  const run = Math.sin(tt * 1.3 + i) * 1.2;
  return (
    <group position={[p[0] + run, hop, p[2] + Math.cos(tt * 1.1 + i) * 0.6]}>
      <Capy scale={0.45 * k} shirt={['#e2483d', '#2f6fd6', '#2d9a5a', '#ff7aa8', '#7a4fd0', '#ff8f1f'][i % 6]} cap={i % 3 === 0 ? '#ffd21e' : null} ry={Math.sin(tt + i) * 0.8}
        pose={{armL: [0, 0, 0.4 + Math.max(0, Math.sin(tt * 7 + i)) * 2], armR: [0, 0, -0.4 - Math.max(0, Math.sin(tt * 7 + i + 1)) * 2], mouth: 0.5, blink: 0}} />
    </group>
  );
};

export const Escola: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const word = useMemo(() => texMat(textTexture('ESCOLA CIDADE DO INSTA', {bg: '#2f6fd6', fg: '#ffffff', border: '#14110c', w: 1024, h: 170, size: 80})), []);
  const lot = useMemo(() => texMat(textTexture('TERRENO DA ESCOLA', {bg: '#ffffff', fg: '#14110c', border: '#14110c', w: 1024, h: 180, size: 100})), []);
  // hook / loop seam: the finished school, bell ringing
  const hook = t < E.HOOK;
  const te = hook ? 999 : t;
  const built = te >= E.BASE;
  const ring = hook ? 1 : clamp(1 - Math.abs(t - E.SINO - 0.9) / 0.6);
  const bellSwing = Math.sin(tt * 18) * 0.5 * ring;
  const kidsK = (i: number) => pop(te, E.KIDS + i * 0.08, 0.35);
  return (
    <group position={[ESCOLA[0], 0.06, ESCOLA[1]]} rotation={[0, Math.PI, 0]}>
      <mesh geometry={G.box} material={mat('#b58b5a')} position={[0, 0.03, 0]} scale={[21, 0.05, 21]} receiveShadow />
      {!built ? (
        <group position={[0, 0, 9.5]}>
          {[-3.6, 3.6].map((x) => <P key={x} geo={G.box} color="#6b4423" p={[x, 1.0, 0]} s={[0.18, 2.0, 0.18]} o={0.02} />)}
          <mesh geometry={G.box} material={lot} position={[0, 2.0, 0.05]} scale={[7.6, 1.3, 0.1]} castShadow />
        </group>
      ) : null}
      {built ? (
        <group scale={[easeOut(ramp(te, E.BASE, E.BASE + 0.25)), 1, easeOut(ramp(te, E.BASE, E.BASE + 0.25))]}>
          <P geo={G.box} color="#4caf50" p={[0, 0.2, -0.5]} s={[20, 0.4, 19]} o={0.04} />
        </group>
      ) : null}
      <BasePlateStuds t={te} t0={E.BASE} />
      <Bricks t={te} list={WALLS} />
      {/* 2. roof + windows + door + sign */}
      <Drop t={te} t0={E.TELHADO} h={6} dur={0.3} p={[0, 0.4, -4]}>
        <P geo={G.box} color="#e2483d" p={[0, 4.65, 0]} s={[13.8, 0.35, 6.8]} o={0.04} />
        <P geo={G.cone4} color="#d6402b" p={[0, 5.75, 0]} r={[0, Math.PI / 4, 0]} s={[9.8, 1.9, 4.9]} o={0.05} />
      </Drop>
      <Drop t={te} t0={E.TELHADO + 0.25} h={3} dur={0.2} p={[0, 0.4, -4]}>
        {[-4.8, -2.6, 2.6, 4.8].map((x) => <P key={x} geo={G.box} color="#8fd3ff" p={[x, 2.4, 3.05]} s={[1.4, 1.3, 0.06]} o={0.02} />)}
        <P geo={G.box} color="#7b4a28" p={[0, 1.15, 3.05]} s={[1.6, 2.3, 0.08]} o={0.02} />
        <mesh geometry={G.box} material={word} position={[0, 3.55, 3.12]} scale={[8.4, 1.2, 0.1]} castShadow />
      </Drop>
      {/* 3. bell tower */}
      <Bricks t={te} list={TOWER} />
      <Drop t={te} t0={E.SINO + 0.45} h={5} dur={0.25} p={[0, 0.4, -4]}>
        <P geo={G.cone4} color="#2f6fd6" p={[0, 8.55, 0]} r={[0, Math.PI / 4, 0]} s={[2.4, 1.7, 2.4]} o={0.04} />
        <P geo={G.cyl12} color="#ffffff" p={[0, 6.5, 1.33]} r={[Math.PI / 2, 0, 0]} s={[0.75, 0.06, 0.75]} o={0.03} />
        <P geo={G.box} color="#14110c" p={[0, 6.7, 1.38]} s={[0.07, 0.45, 0.03]} o={0} />
        <P geo={G.box} color="#14110c" p={[0.15, 6.5, 1.38]} r={[0, 0, -1.2]} s={[0.06, 0.35, 0.03]} o={0} />
        <group position={[0, 9.9, 0]} rotation={[0, 0, bellSwing]}>
          <P geo={G.box} color="#6b4423" p={[0, 0.3, 0]} s={[0.1, 0.6, 0.1]} o={0} />
          <P geo={G.cone6} color="#f2b134" p={[0, -0.25, 0]} s={[0.55, 0.7, 0.55]} o={0.03} />
        </group>
        <P geo={G.box} color="#6b4423" p={[0, 10.3, 0]} s={[1.6, 0.12, 0.12]} o={0.02} />
        {[-0.75, 0.75].map((x) => <P key={x} geo={G.box} color="#6b4423" p={[x, 9.8, 0]} s={[0.12, 1.1, 0.12]} o={0.02} />)}
      </Drop>
      {/* 4. sports court */}
      <Drop t={te} t0={E.QUADRA} h={4} dur={0.25} p={[4.8, 0.4, 5.2]}>
        <P geo={G.box} color="#2f6fd6" p={[0, 0.06, 0]} s={[9, 0.12, 6]} o={0.03} />
        <mesh geometry={G.box} material={mat('#ffffff', {basic: true})} position={[0, 0.13, 0]} scale={[0.08, 0.01, 5.6]} />
        <mesh geometry={G.cyl12} material={mat('#ffffff', {basic: true})} position={[0, 0.13, 0]} scale={[1.1, 0.01, 1.1]} />
        <mesh geometry={G.cyl12} material={mat('#2f6fd6', {basic: true})} position={[0, 0.135, 0]} scale={[0.95, 0.01, 0.95]} />
      </Drop>
      {[-1, 1].map((sx, i) => (
        <Drop key={sx} t={te} t0={E.QUADRA + 0.2 + i * 0.12} h={8} dur={0.3} p={[4.8 + sx * 4.1, 0.4, 5.2]}>
          <P geo={G.cyl} color="#9aa0a6" p={[0, 1.4, 0]} s={[0.1, 2.8, 0.1]} o={0.02} />
          <P geo={G.box} color="#ffffff" p={[-sx * 0.3, 2.9, 0]} s={[0.08, 0.9, 1.3]} o={0.02} />
          <P geo={G.cyl12} color="#ff8f1f" p={[-sx * 0.65, 2.6, 0]} s={[0.32, 0.04, 0.32]} o={0} />
        </Drop>
      ))}
      {/* 5. playground: slide, swings, seesaw */}
      <Drop t={te} t0={E.PARQUINHO} h={9} dur={0.3} p={[-6.6, 0.4, 3.6]}>
        <P geo={G.box} color="#ff7aa8" p={[0, 1.0, 0]} s={[1.2, 2.0, 1.2]} o={0.03} />
        <P geo={G.box} color="#e2483d" p={[0, 1.05, 1.9]} r={[0.75, 0, 0]} s={[0.9, 0.12, 3.0]} o={0.03} />
        <P geo={G.box} color="#ffd21e" p={[0, 2.15, 0]} s={[1.3, 0.12, 1.3]} o={0.02} />
      </Drop>
      <Drop t={te} t0={E.PARQUINHO + 0.15} h={9} dur={0.3} p={[-6.4, 0.4, 7.6]}>
        {[-1.5, 1.5].map((x) => <P key={x} geo={G.box} color="#2d9a5a" p={[x, 1.3, 0]} s={[0.15, 2.6, 0.15]} o={0.02} />)}
        <P geo={G.box} color="#2d9a5a" p={[0, 2.6, 0]} s={[3.2, 0.15, 0.15]} o={0.02} />
        {[-0.7, 0.7].map((x, i) => (
          <group key={x} position={[x, 2.6, 0]} rotation={[Math.sin(tt * 3 + i * 1.6) * 0.5, 0, 0]}>
            <P geo={G.box} color="#3b3f46" p={[0, -0.8, 0]} s={[0.03, 1.6, 0.03]} o={0} />
            <P geo={G.box} color="#ffd21e" p={[0, -1.6, 0]} s={[0.6, 0.08, 0.35]} o={0.02} />
          </group>
        ))}
      </Drop>
      <Drop t={te} t0={E.PARQUINHO + 0.3} h={9} dur={0.3} p={[-2.8, 0.4, 8.2]}>
        <P geo={G.box} color="#7a4fd0" p={[0, 0.25, 0]} s={[0.4, 0.5, 0.4]} o={0.02} />
        <group position={[0, 0.55, 0]} rotation={[0, 0, Math.sin(tt * 2.5) * 0.25]}>
          <P geo={G.box} color="#ff8f1f" s={[3.0, 0.12, 0.45]} o={0.02} />
        </group>
      </Drop>
      {/* flagpole */}
      <Drop t={te} t0={E.PARQUINHO + 0.45} h={10} dur={0.3} p={[0.8, 0.4, 9.6]}>
        <P geo={G.cyl} color="#cfd4da" p={[0, 2.5, 0]} s={[0.06, 5, 0.06]} o={0.02} />
        <group position={[0.7, 4.4, 0]} rotation={[0, Math.sin(tt * 3) * 0.2, 0]}>
          <P geo={G.box} color="#2d9a5a" s={[1.3, 0.8, 0.03]} o={0.02} />
          <P geo={G.box} color="#ffd21e" p={[0, 0, 0.02]} r={[0, 0, Math.PI / 4]} s={[0.5, 0.5, 0.02]} o={0} />
        </group>
      </Drop>
      {/* school bus parked out front */}
      <Drop t={te} t0={E.PARQUINHO + 0.6} h={10} dur={0.35} p={[6, 0.05, 12.7]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <Bus />
        </group>
      </Drop>
      {/* kids */}
      {[[3, 4], [5.5, 6], [7, 4.2], [4.2, 6.8], [-6.6, 6.0], [-4.5, 4.5], [-2.8, 8.2], [1.6, 5.5]].map(([x, z], i) => {
        const k = kidsK(i);
        return k > 0 ? <Kid key={i} tt={tt} i={i} p={[x, 0.45, z]} k={k} /> : null;
      })}
      {/* the drawn teachers at the door */}
      {TEACHERS.map((w, i) => {
        const kk = pop(te, E.PROF + i * 0.25, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[-2.6 + i * 2.6, 0.45, 0.4 + (i === 1 ? 0.6 : 0)]}>
            <Capy scale={0.78 * kk} shirt={['#d62976', '#2f6fd6', '#2d9a5a'][i]} cap={null} clipboard pose={{armL: [-0.55, 0.1, 0.12], armR: [0, 0, -0.2 - Math.max(0, Math.sin(tt * 6 + i)) * 2.1], mouth: 0.35, brow: 0.3, blink: (Math.floor(tt * 30) + i * 17) % 100 < 4 ? 1 : 0, head: [0, 0, Math.sin(tt * 2 + i) * 0.08]}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};

export const Bus: React.FC = () => (
  <group>
    <P geo={G.box} color="#ffc21e" p={[0, 1.1, 0]} s={[2.2, 1.7, 6.4]} o={0.05} />
    <P geo={G.box} color="#ffc21e" p={[0, 0.8, 3.6]} s={[2.2, 1.1, 1.0]} o={0.04} />
    <P geo={G.box} color="#14110c" p={[0, 0.8, 0]} s={[2.24, 0.14, 6.44]} o={0} />
    {[-2.2, -1.0, 0.2, 1.4, 2.5].map((z) => [-1.12, 1.12].map((x) => <P key={z + '_' + x} geo={G.box} color="#cdeeff" p={[x, 1.5, z]} s={[0.04, 0.6, 0.9]} o={0} />))}
    <P geo={G.box} color="#cdeeff" p={[0, 1.55, 3.22]} s={[1.9, 0.6, 0.04]} o={0} />
    {[[-1.1, 2.6], [1.1, 2.6], [-1.1, -2.2], [1.1, -2.2]].map(([x, z], i) => <P key={i} geo={G.cyl12} color="#222" p={[x, 0.38, z]} r={[0, 0, Math.PI / 2]} s={[0.38, 0.25, 0.38]} o={0} />)}
  </group>
);
