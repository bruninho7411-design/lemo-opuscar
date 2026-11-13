import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, BasePlateStuds, boxShell, Drop} from './Usina';
import {pop, ramp, clamp, easeOut, B, LOOP_AT, TOTAL_SEC} from '../timeline';
import PEOPLE from '../people.json';

/** block (-1,1); built facing +z in local coords, turned to face the avenue */
export const QUARTEL: [number, number] = [-30, 30];
const CREW: string[] = (PEOPLE as any).bombeiros;
const WALLS = boxShell(0, -1.5, 14, 8, 4.4, ['#e2483d', '#c9302a', '#e2483d'], B.PAREDES, 0.9, 0.4);
const TOWER = boxShell(5.6, -4.3, 2.4, 2.4, 3.3, ['#ffffff', '#e2483d'], B.TORRE, 0.4, 4.85);

export const FireTruck: React.FC<{tt: number; ladder?: number}> = ({tt, ladder = 0}) => {
  const on = Math.floor(tt * 8) % 2 === 0;
  return (
    <group>
      <P geo={G.box} color="#e2483d" p={[0, 1.0, -0.6]} s={[2.2, 1.5, 4.6]} o={0.05} />
      <P geo={G.box} color="#e2483d" p={[0, 1.15, 2.4]} s={[2.2, 1.8, 1.6]} o={0.05} />
      <P geo={G.box} color="#cdeeff" p={[0, 1.55, 3.22]} s={[1.9, 0.7, 0.04]} o={0} />
      <P geo={G.box} color="#ffffff" p={[0, 0.85, -0.6]} s={[2.24, 0.22, 4.64]} o={0} />
      <P geo={G.box} color="#9aa0a6" p={[0, 1.85, -0.6]} s={[1.9, 0.15, 4.2]} o={0.02} />
      <group position={[0, 2.05, -2.4]} rotation={[-ladder * 0.6, 0, 0]}>
        {[-0.45, 0.45].map((x) => <P key={x} geo={G.box} color="#cfd4da" p={[x, 0, 2.4]} s={[0.1, 0.1, 4.8]} o={0} />)}
        {Array.from({length: 9}).map((_, i) => <P key={i} geo={G.box} color="#cfd4da" p={[0, 0, 0.3 + i * 0.55]} s={[0.9, 0.06, 0.06]} o={0} />)}
      </group>
      <P geo={G.box} color={on ? '#ff2a2a' : '#5a0000'} p={[-0.5, 2.15, 2.4]} s={[0.5, 0.22, 0.3]} o={0.02} material={on ? mat('#ff2a2a', {basic: true}) : undefined} />
      <P geo={G.box} color={on ? '#00163a' : '#2a6bff'} p={[0.5, 2.15, 2.4]} s={[0.5, 0.22, 0.3]} o={0.02} material={!on ? mat('#2a6bff', {basic: true}) : undefined} />
      {[[-1.1, 2.3], [1.1, 2.3], [-1.1, -1.4], [1.1, -1.4], [-1.1, -2.4], [1.1, -2.4]].map(([x, z], i) => <P key={i} geo={G.cyl12} color="#222" p={[x, 0.38, z]} r={[0, 0, Math.PI / 2]} s={[0.38, 0.25, 0.38]} o={0} />)}
    </group>
  );
};

/** flames + smoke on a house, strength f */
export const Fire: React.FC<{tt: number; f: number; p: V3}> = ({tt, f, p}) => {
  if (f <= 0.01) return null;
  return (
    <group position={p}>
      {Array.from({length: 16}).map((_, i) => {
        const fl = 0.75 + 0.35 * Math.sin(tt * 17 + i * 2.3) + 0.15 * Math.sin(tt * 31 + i);
        const x = ((i * 0.618) % 1 - 0.5) * 1.7, z = (((i * 0.37) % 1) - 0.5) * 1.5;
        return <mesh key={i} geometry={G.cone6} material={mat(['#ff8f1f', '#ffd21e', '#e2483d'][i % 3], {basic: true})} position={[x, 1.2 + (i % 4) * 0.25 + fl * 0.4 * f, z]} scale={[0.35 * f, 1.2 * fl * f, 0.35 * f]} />;
      })}
      {Array.from({length: 9}).map((_, i) => {
        const ph = (tt * 0.45 + i / 9) % 1;
        return <mesh key={'s' + i} geometry={G.ballLo} material={mat(i % 2 ? '#4a4a52' : '#6b6b74', {basic: true})} position={[Math.sin(i * 2 + tt * 0.7) * 0.6 + ph * 1.5, 2.6 + ph * 7, Math.cos(i) * 0.4]} scale={(0.5 + ph * 1.6) * f * (1 - ph * 0.5)} />;
      })}
      <pointLight position={[0, 2.5, -1.5]} intensity={60 * f * (0.8 + 0.2 * Math.sin(tt * 23))} distance={14} color="#ff8f1f" />
    </group>
  );
};

/** water arc from the hose */
export const Spray: React.FC<{tt: number; on: number; a: V3; b: V3}> = ({tt, on, a, b}) => {
  if (on <= 0) return null;
  return (
    <>
      {Array.from({length: 26}).map((_, i) => {
        const u = (tt * 1.8 + i / 26) % 1;
        const x = a[0] + (b[0] - a[0]) * u, z = a[2] + (b[2] - a[2]) * u;
        const y = a[1] + (b[1] - a[1]) * u + Math.sin(u * Math.PI) * 1.6;
        return <mesh key={i} geometry={G.ballLo} material={mat(i % 3 ? '#8fdcff' : '#ffffff', {basic: true})} position={[x, y, z]} scale={0.17 * on * (0.7 + u * 0.6)} />;
      })}
    </>
  );
};

export const Quartel: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const word = useMemo(() => texMat(textTexture('BOMBEIROS', {bg: '#ffffff', fg: '#e2483d', border: '#14110c', w: 1024, h: 180, size: 120})), []);
  const lot = useMemo(() => texMat(textTexture('TERRENO DOS BOMBEIROS', {bg: '#ffffff', fg: '#14110c', border: '#14110c', w: 1024, h: 180, size: 84})), []);
  const built = t >= B.BASE;
  const on = Math.floor(tt * 7) % 2 === 0;
  return (
    <group position={[QUARTEL[0], 0.06, QUARTEL[1]]} rotation={[0, Math.PI, 0]}>
      <mesh geometry={G.box} material={mat('#b58b5a')} position={[0, 0.03, 0]} scale={[21, 0.05, 21]} receiveShadow />
      {!built ? (
        <group position={[0, 0, 9.5]}>
          {[-3.6, 3.6].map((x) => <P key={x} geo={G.box} color="#6b4423" p={[x, 1.0, 0]} s={[0.18, 2.0, 0.18]} o={0.02} />)}
          <mesh geometry={G.box} material={lot} position={[0, 2.0, 0.05]} scale={[7.6, 1.3, 0.1]} castShadow />
        </group>
      ) : null}
      {built ? (
        <group scale={[easeOut(ramp(t, B.BASE, B.BASE + 0.25)), 1, easeOut(ramp(t, B.BASE, B.BASE + 0.25))]}>
          <P geo={G.box} color="#9aa0a6" p={[0, 0.2, -0.5]} s={[20, 0.4, 19]} o={0.04} />
        </group>
      ) : null}
      <BasePlateStuds t={t} t0={B.BASE} />
      <Bricks t={t} list={WALLS} />
      {/* 2. garage doors + roof + sign */}
      <Drop t={t} t0={B.GARAGEM} h={5} dur={0.25} p={[0, 0.4, -1.5]}>
        <P geo={G.box} color="#3b3f46" p={[0, 4.62, 0]} s={[14.6, 0.3, 8.6]} o={0.04} />
        {[-4.3, 0, 4.3].map((x, i) => (
          <group key={x} position={[x, 0, 4.03]}>
            <P geo={G.box} color="#f4f6fb" p={[0, 1.55, 0]} s={[3.2, 3.1, 0.08]} o={0.02} />
            {[0.6, 1.2, 1.8, 2.4].map((y) => <P key={y} geo={G.box} color="#cfd4da" p={[0, y, 0.05]} s={[3.1, 0.06, 0.02]} o={0} />)}
          </group>
        ))}
        <mesh geometry={G.box} material={word} position={[0, 3.75, 4.1]} scale={[6.4, 1.1, 0.1]} castShadow />
      </Drop>
      {/* 3. tower + siren */}
      <Bricks t={t} list={TOWER} />
      <Drop t={t} t0={B.TORRE + 0.42} h={5} dur={0.22} p={[5.6, 0.4, -4.3]}>
        <P geo={G.box} color="#3b3f46" p={[0, 8.3, 0]} s={[2.8, 0.25, 2.8]} o={0.03} />
        <P geo={G.cyl12} color={on ? '#ff2a2a' : '#7a0000'} p={[0, 8.75, 0]} s={[0.45, 0.6, 0.45]} o={0.03} material={on ? mat('#ff2a2a', {basic: true}) : undefined} />
      </Drop>
      {/* 4. truck + hydrant */}
      <Drop t={t} t0={B.CAMINHAO} h={12} dur={0.35} p={[-3.2, 0.4, 8.0]}>
        <FireTruck tt={tt} />
      </Drop>
      <Drop t={t} t0={B.CAMINHAO + 0.25} h={6} dur={0.2} p={[3.8, 0.4, 8.6]}>
        <P geo={G.cyl12} color="#e2483d" p={[0, 0.45, 0]} s={[0.3, 0.9, 0.3]} o={0.03} />
        <P geo={G.ball} color="#e2483d" p={[0, 0.95, 0]} s={0.3} o={0.02} />
        <P geo={G.cyl12} color="#ffd21e" p={[0.3, 0.6, 0]} r={[0, 0, Math.PI / 2]} s={[0.12, 0.2, 0.12]} o={0} />
      </Drop>
      {/* the drawn firefighters */}
      {CREW.map((w, i) => {
        const kk = pop(t, B.CREW + i * 0.25, 0.4);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[0.4 + i * 2.3, 0.45, 6.2 + (i === 1 ? 0.6 : 0)]}>
            <Capy scale={0.78 * kk} shirt="#3b3f46" cap="#ffd21e" pose={{armL: [0, 0, 0.3], armR: [-0.2, 0, -0.2 - Math.max(0, Math.sin(tt * 6 + i)) * 2.1], mouth: 0.35, brow: 0.2, blink: (Math.floor(tt * 30) + i * 17) % 100 < 4 ? 1 : 0, head: [0, 0, Math.sin(tt * 2 + i) * 0.08]}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};

/** hook + ending: a house on fire on the avenue, the truck arrives and puts it out */
export const FIRE_HOUSE: V3 = [-50, 0, 20.8];
export const HookFire: React.FC<{t: number}> = ({t}) => {
  const rt = t >= LOOP_AT ? t - TOTAL_SEC : t;
  const inHook = rt < B.HOOK;
  const reignite = t >= B.REIGNITE && t < LOOP_AT ? easeOut(clamp((t - B.REIGNITE) / 0.5)) : 0;
  const f = inHook ? 1 - easeOut(clamp((rt - 1.7) / 0.9)) : reignite;
  const truckK = easeOut(clamp((rt - 0.35) / 1.0));
  const showTruck = inHook && rt > 0.3;
  const water = inHook ? clamp((rt - 1.4) / 0.2) * (1 - clamp((rt - 2.8) / 0.3)) : 0;
  return (
    <>
      <Fire tt={t} f={f} p={[FIRE_HOUSE[0], 0.06, FIRE_HOUSE[2]]} />
      {showTruck ? (
        <group position={[-14 - 33 * truckK, 0.06, 16.4]} rotation={[0, -Math.PI / 2, 0]}>
          <FireTruck tt={t} ladder={clamp((rt - 1.2) / 0.3)} />
        </group>
      ) : null}
      <Spray tt={t} on={water} a={[-47.2, 3.4, 16.6]} b={[FIRE_HOUSE[0], 1.6, FIRE_HOUSE[2] - 0.6]} />
    </>
  );
};
