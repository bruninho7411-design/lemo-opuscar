import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag, Shack, MiniHouse, Mansion} from './World';
import {Bricks, boxShell, Drop} from './Usina';
import type {Brick} from './Usina';
import {pop, clamp, easeOut, CI, LOOP_AT, TOTAL_SEC} from '../timeline';
import PEOPLE from '../people.json';

const PPL = PEOPLE as any;

/* ---------------- girl character (for @haylla.lavigne: "não quero ser uma capivara") ---------------- */
export const Girl: React.FC<{tt: number; wave?: number; scale?: number; skin?: string; dress?: string; hair?: string}> = ({tt, wave = 1, scale = 1, skin: SKIN = '#8a5a3c', dress: DRESS = '#ff7aa8', hair: HAIR = '#2a1a12'}) => {
  const w = Math.sin(tt * 8) * 0.5 * wave;
  return (
    <group scale={scale}>
      {[-0.13, 0.13].map((x) => <P key={x} geo={G.cyl} color={SKIN} p={[x, 0.32, 0]} s={[0.07, 0.64, 0.07]} o={0.02} />)}
      {[-0.13, 0.13].map((x) => <P key={'s' + x} geo={G.box} color="#ffffff" p={[x, 0.04, 0.04]} s={[0.16, 0.08, 0.26]} o={0.02} />)}
      <P geo={G.cone6} color={DRESS} p={[0, 0.95, 0]} s={[0.48, 0.75, 0.48]} o={0.04} />
      <P geo={G.box} color={DRESS} p={[0, 1.38, 0]} s={[0.42, 0.34, 0.26]} o={0.03} />
      <P geo={G.box} color="#ffffff" p={[0, 1.24, 0.14]} s={[0.44, 0.06, 0.02]} o={0} />
      <group position={[-0.27, 1.48, 0]} rotation={[0, 0, 0.25]}><P geo={G.cyl} color={SKIN} p={[0, -0.25, 0]} s={[0.06, 0.5, 0.06]} o={0.02} /></group>
      <group position={[0.27, 1.48, 0]} rotation={[0, 0, -2.4 - w]}><P geo={G.cyl} color={SKIN} p={[0, -0.25, 0]} s={[0.06, 0.5, 0.06]} o={0.02} /></group>
      <group position={[0, 1.88, 0]}>
        <P geo={G.ball} color={SKIN} s={[0.3, 0.32, 0.29]} o={0.04} />
        <P geo={G.ball} color={HAIR} p={[0, 0.08, -0.06]} s={[0.33, 0.33, 0.3]} o={0.03} />
        <P geo={G.box} color={HAIR} p={[0, 0.22, 0.2]} s={[0.46, 0.12, 0.12]} o={0.02} />
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.34, 0.05, -0.05]}>
            <P geo={G.ball} color={HAIR} p={[sd * 0.06, -0.12, 0]} s={[0.13, 0.2, 0.13]} o={0.02} />
            <P geo={G.box} color="#ffd21e" p={[0, 0.06, 0]} r={[0, 0, 0.6 * sd]} s={[0.18, 0.08, 0.08]} o={0.02} />
          </group>
        ))}
        {[-0.1, 0.1].map((x) => <P key={x} geo={G.ballLo} color="#14110c" p={[x, 0.02, 0.27]} s={[0.04, 0.055, 0.03]} o={0} />)}
        {[-0.17, 0.17].map((x) => <P key={'c' + x} geo={G.ballLo} color="#ff9fb8" p={[x, -0.07, 0.24]} s={[0.05, 0.03, 0.02]} o={0} />)}
        <P geo={G.box} color="#c2384f" p={[0, -0.12, 0.28]} s={[0.1, 0.03, 0.02]} o={0} />
        <P geo={G.box} color="#ff3d7f" p={[0.12, 0.3, 0.12]} r={[0, 0, 0.4]} s={[0.16, 0.08, 0.06]} o={0.02} />
      </group>
    </group>
  );
};

/** hook: haylla's capybara goes POOF and becomes the girl (in front of the follower street, west of the city) */
export const HookSet: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  if (rt > CI.HOOK + 0.5) return null;
  const poof = clamp((rt - CI.POOF) / 0.45);
  const girlK = pop(rt, CI.POOF + 0.12, 0.45);
  return (
    <group position={[-330, 0.1, 42]}>
      {rt < CI.POOF + 0.1 ? (
        <group rotation={[0, Math.sin(rt * 3) * 0.15, 0]}>
          <Capy scale={0.85} shirt="#ff7aa8" cap={null} pose={{armL: [0, 0, 0.2], armR: [0, 0, -0.2], mouth: 0.2, brow: -0.4, blink: 0, head: [0.15, 0, 0]}} />
        </group>
      ) : null}
      {girlK > 0 ? <group scale={girlK}><Girl tt={tt} scale={1.0} /></group> : null}
      {poof > 0 && poof < 1 ? Array.from({length: 14}).map((_, i) => {
        const a = (i / 14) * Math.PI * 2, d = 0.4 + easeOut(poof) * 1.4;
        return <mesh key={i} geometry={G.ball} material={mat('#ffffff', {basic: true})} position={[Math.cos(a) * d, 1.0 + Math.sin(i * 1.7) * 0.6 * poof, Math.sin(a) * d * 0.5]} scale={0.5 * (1 - poof) + 0.15} />;
      }) : null}
      {girlK > 0 ? Array.from({length: 10}).map((_, i) => {
        const ph = (tt * 0.8 + i / 10) % 1;
        return <mesh key={'s' + i} geometry={G.ballLo} material={mat('#ffe066', {basic: true})} position={[Math.cos(i * 2.4) * 0.9, 0.4 + ph * 2.4, Math.sin(i * 2.4) * 0.5]} scale={0.07 * (1 - ph)} />;
      }) : null}
    </group>
  );
};

/* ---------------- 3-tier showroom: casa ruim / casa legal / super casa ---------------- */
export const TierSet: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const k1 = pop(t, CI.RUIM, 0.45), k2 = pop(t, CI.LEGAL, 0.45), k3 = pop(t, CI.SUPER, 0.5);
  return (
    <group position={[-330, 0, 78]}>
      <mesh geometry={G.box} material={mat('#9fd86a')} position={[0, 0.04, 0]} scale={[36, 0.04, 16]} receiveShadow />
      <mesh geometry={G.box} material={mat('#c9a876')} position={[-10, 0.06, 0]} scale={[8, 0.04, 8]} receiveShadow />
      <mesh geometry={G.box} material={mat('#e9e1cf')} position={[11, 0.06, 0]} scale={[12, 0.04, 11]} receiveShadow />
      <group position={[-10, 0.08, -0.5]} rotation={[0, 0, Math.sin(tt * 7) * 0.04]} scale={2.2}><Shack k={k1} i={1} /></group>
      <group position={[-1, 0.08, -0.5]} scale={2.4}><MiniHouse i={4} k={k2} /></group>
      <group position={[11, 0.08, -1]} scale={1.0}><Mansion k={k3} /></group>
      {k3 > 0 ? Array.from({length: 16}).map((_, i) => {
        const ph = (tt * 0.6 + i / 16) % 1;
        return <mesh key={i} geometry={G.ballLo} material={mat('#ffe066', {basic: true})} position={[11 + ((i * 37) % 10) - 5, 1 + ph * 7, ((i * 13) % 8) - 4]} scale={0.16 * (1 - ph)} />;
      }) : null}
    </group>
  );
};

/* ---------------- triz_12_: dona do Mercadinho (Mercadinho at x 22.5, z 5.5, facing −x) ---------------- */
export const DonaMercado: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const k = pop(t, CI.TRIZ, 0.45);
  if (k <= 0) return null;
  return (
    <group position={[17.4, 0.1, 5.5]} rotation={[0, -Math.PI / 2, 0]}>
      <Capy scale={0.85 * k} shirt="#2d9a5a" cap="#ffd21e" sash pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.6, brow: 0.4, blink: 0}} />
      <NameTag name={PPL.dona_mercado} k={k} />
      <P geo={G.cone6} color="#ffd21e" p={[0, 2.25 * k, 0]} s={[0.22 * k, 0.28 * k, 0.22 * k]} o={0.02} />
    </group>
  );
};

/* ---------------- LEGO cinema, east of the city (facade faces −x, toward the city) ---------------- */
export const CC: [number, number] = [205, 186];
const X = (x: number) => CC[0] + x, Z = (z: number) => CC[1] + z;
const WALLS: Brick[] = boxShell(X(3), Z(0), 14, 18, 7.2, ['#7a1f3d', '#8e2a4b'], CI.PAREDES, 0.9, 0.3);
const BOOTH: Brick[] = boxShell(X(-8), Z(-6.5), 2.4, 2.4, 2.6, ['#ffd21e', '#ffffff'], CI.PAREDES + 0.3, 0.5, 0.3);

export const Cinema: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const sign = useMemo(() => texMat(textTexture('CINEMA', {bg: '#14110c', fg: '#ffd21e', border: '#ffd21e', w: 1024, h: 260, size: 200})), []);
  const base = easeOut(clamp((t - CI.PAREDES + 0.5) / 0.4));
  const carpet = easeOut(clamp((t - CI.TAPETE) / 0.6));
  const staff: string[] = PPL.cinema_staff;
  const boom = tt >= CI.EXPLODE && tt < LOOP_AT ? clamp((tt - CI.EXPLODE) / 0.9) : 0;
  return (
    <group>
      <group position={[X(0), 0, Z(0)]} scale={[Math.max(0.0001, base), 1, Math.max(0.0001, base)]}>
        <mesh geometry={G.box} material={mat('#cfd4da')} position={[-2, 0.07, 0]} scale={[30, 0.1, 26]} receiveShadow />
      </group>
      <Bricks t={t} list={WALLS} />
      <Bricks t={t} list={BOOTH} />
      <Drop t={t} t0={CI.PAREDES + 0.9} h={7} dur={0.25} p={[X(3), 7.6, Z(0)]}>
        <P geo={G.box} color="#3a1426" p={[0, 0, 0]} s={[14.6, 0.4, 18.6]} o={0.04} />
      </Drop>
      {/* marquee with chasing bulbs */}
      <Drop t={t} t0={CI.LETREIRO} h={8} dur={0.28} p={[X(-4.6), 0.1, Z(0)]}>
        <P geo={G.box} color="#14110c" p={[0, 6.2, 0]} s={[1.0, 2.6, 12]} o={0.04} />
        <mesh geometry={G.box} material={sign} position={[-0.55, 6.2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[10.4, 2.4, 0.1]} />
        {Array.from({length: 26}).map((_, i) => {
          const zz = -6 + (i % 13) * 1.0, yy = i < 13 ? 7.65 : 4.75;
          const on = (Math.floor(tt * 8) + i) % 3 === 0;
          return <mesh key={i} geometry={G.ballLo} material={mat(on ? '#fff6b0' : '#ffb21e', {basic: true})} position={[-0.6, yy, zz]} scale={0.17} />;
        })}
        <P geo={G.box} color="#e2483d" p={[-0.4, 3.0, 0]} s={[0.3, 0.4, 13]} o={0.02} />
        {[-4.2, 4.2].map((zz) => <P key={zz} geo={G.box} color="#ffd21e" p={[-0.5, 2.1, zz]} s={[0.15, 2.4, 1.7]} o={0.02} />)}
        <P geo={G.box} color="#2a2a2a" p={[-0.45, 1.5, 0]} s={[0.1, 3.0, 3.2]} o={0} />
      </Drop>
      {/* giant popcorn on the roof */}
      <Drop t={t} t0={CI.PIPOCA} h={10} dur={0.3} p={[X(4), 7.8, Z(0)]}>
        <group rotation={[0, 0, boom * 0.3]}>
          {Array.from({length: 8}).map((_, i) => <P key={i} geo={G.box} color={i % 2 ? '#ffffff' : '#e2483d'} p={[Math.cos(i * 0.785) * 2.1, 2.2, Math.sin(i * 0.785) * 2.1]} r={[0, -i * 0.785, 0]} s={[0.25, 4.4, 1.7]} o={0.02} />)}
          <P geo={G.cyl12} color="#e2483d" p={[0, 0.1, 0]} s={[2.1, 0.2, 2.1]} o={0.02} />
          {Array.from({length: 16}).map((_, i) => <P key={'p' + i} geo={G.ballLo} color={i % 3 ? '#fff4c8' : '#ffe08a'} p={[Math.cos(i * 1.3) * 1.4 * ((i % 4) / 4 + 0.3), 4.6 + (i % 3) * 0.5 + Math.sin(tt * 3 + i) * 0.05, Math.sin(i * 1.3) * 1.4 * ((i % 4) / 4 + 0.3)]} s={0.55} o={0.02} />)}
        </group>
      </Drop>
      {/* popcorn bursting (loop ending) */}
      {boom > 0 ? Array.from({length: 40}).map((_, i) => {
        const a = i * 2.39, sp = 6 + (i % 5) * 2.5, e = boom;
        return <mesh key={'b' + i} geometry={G.ballLo} material={mat(i % 3 ? '#fff4c8' : '#ffe08a', {basic: true})} position={[X(4) + Math.cos(a) * sp * e - 6 * e, 12.5 + 9 * e - 12 * e * e + (i % 4), Z(0) + Math.sin(a) * sp * e]} scale={0.6} />;
      }) : null}
      {/* red carpet rolling out toward the city */}
      {carpet > 0 ? (
        <group position={[X(-4.4), 0.14, Z(0)]}>
          <mesh geometry={G.box} material={mat('#c2182b')} position={[-6 * carpet, 0, 0]} scale={[12 * carpet, 0.04, 3]} receiveShadow />
          {carpet > 0.95 ? [-3, -6, -9, -12].flatMap((x) => [-2, 2].map((z) => <P key={x + '_' + z} geo={G.cyl} color="#ffd21e" p={[x, 0.55, z]} s={[0.09, 1.1, 0.09]} o={0.02} />)) : null}
          {carpet > 0.95 ? [-2, 2].map((z) => <P key={'r' + z} geo={G.cyl} color="#7a1f3d" p={[-7.5, 0.95, z]} r={[0, 0, Math.PI / 2]} s={[0.05, 9, 0.05]} o={0} />) : null}
        </group>
      ) : null}
      {/* staff */}
      {staff.map((w, i) => {
        const kk = pop(t, CI.STAFF + i * 0.22, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[X(-9 + (i - 1) * 0.0), 0.16, Z(-3.2 + i * 3.2)]} rotation={[0, -Math.PI / 2, 0]}>
            <Capy scale={0.8 * kk} shirt="#7a1f3d" cap="#14110c" pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6 + i)) * 2.2], mouth: 0.5, brow: 0.3, blink: 0}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};
