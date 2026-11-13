import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, boxShell, Drop} from './Usina';
import type {Brick} from './Usina';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, D30, LOOP_AT, TOTAL_SEC} from '../timeline';

const Poof: React.FC<{tt: number; t0: number; y?: number; c?: string}> = ({tt, t0, y = 0.9, c = '#ffffff'}) => {
  const e = clamp((tt - t0) / 0.45);
  if (e <= 0 || e >= 1) return null;
  return <>{Array.from({length: 12}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2, d = 0.3 + easeOut(e) * 1.4;
    return <mesh key={i} geometry={G.ball} material={mat(i % 3 ? c : '#ffe066', {basic: true})} position={[Math.cos(a) * d, y + Math.sin(i * 1.7) * 0.5 * e, Math.sin(a) * d * 0.6]} scale={0.42 * (1 - e) + 0.12} />;
  })}</>;
};
const Tag: React.FC<{name: string; y?: number}> = ({name, y = 0.8}) => <group position={[0, y, 0]}><NameTag name={name} k={1} /></group>;

/** ground east of the ep. 27 lot */
export const Lote30: React.FC = () => (
  <>
    <mesh geometry={G.box} material={mat('#9fd86a')} position={[-277, 0.042, 203]} scale={[42, 0.04, 48]} receiveShadow />
    <mesh geometry={G.box} material={mat('#9fd86a')} position={[-330, 0.041, 197]} scale={[66, 0.04, 6]} receiveShadow />
  </>
);

/* ---------------- hook: the biggest sign in town (fornodebarroo) ---------------- */
const BX = -264, BZ = 210;
export const Letreiro: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const on = rt >= D30.LETREIRO;
  const name = '@fornodebarroo';
  const letters = useMemo(() => name.split('').map((ch) => texMat(textTexture(ch, {bg: '#14110c', fg: '#ffd21e', border: '#14110c', w: 160, h: 220, size: 190}))), []);
  const off = useMemo(() => texMat(textTexture('', {bg: '#2a2f3a', fg: '#2a2f3a', border: '#14110c', w: 64, h: 64, size: 10})), []);
  const W = 1.25;
  return (
    <group>
      <group position={[BX, 0, BZ]}>
        {[-8, 8].map((x) => <P key={x} geo={G.box} color="#3a3f47" p={[x, 3.5, -0.3]} s={[0.5, 7, 0.5]} o={0.03} />)}
        <P geo={G.box} color="#14110c" p={[0, 9.2, -0.2]} s={[19.6, 4.8, 0.4]} o={0.05} />
        {name.split('').map((_, i) => {
          const k = on ? pop(rt, D30.LETREIRO + i * 0.07, 0.3) : 0;
          return <mesh key={i} geometry={G.box} material={k > 0 ? letters[i] : off} position={[(i - (name.length - 1) / 2) * W, 9.2, 0.02]} scale={[W * 0.96, 2.4 * Math.max(0.15, k), 0.05]} />;
        })}
        {/* bulbs around the frame */}
        {Array.from({length: 36}).map((_, i) => {
          const top = i < 18, x = -9.4 + (i % 18) * 1.1, y = top ? 11.45 : 6.95;
          const lit = on && Math.floor(tt * 6 + i) % 2 === 0;
          return <mesh key={'b' + i} geometry={G.ballLo} material={mat(lit ? '#fff3a0' : '#7a6a2a', {basic: true})} position={[x, y, 0.1]} scale={0.16} />;
        })}
        {on && tt < LOOP_AT ? Array.from({length: 10}).map((_, i) => { const ph = (tt * 0.9 + i / 10) % 1; return <mesh key={'s' + i} geometry={G.ballLo} material={mat(i % 2 ? '#ffffff' : '#ffe066', {basic: true})} position={[-9 + i * 2, 12 + ph * 3, 0.5]} scale={0.18 * (1 - ph)} />; }) : null}
      </group>
      <group position={[BX - 2.2, 0.1, BZ + 8]} rotation={[0, 0.2, 0]}>
        <Capy scale={0.85} shirt="#e2483d" cap={null} pose={on ? {armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.9, brow: 0.5, blink: 0, head: [-0.35, 0, 0]} : {brow: -0.5, mouth: 0.1, blink: 0, head: [0.2, 0, 0]}} />
        <NameTag name="fornodebarroo" k={1} />
      </group>
    </group>
  );
};

/* ---------------- LEGO arcade (fliperama) ---------------- */
const FX = -282, FZ = 194;
const WALLS: Brick[] = boxShell(FX, FZ, 12, 9, 3.8, ['#2a1745', '#4c1d95'], D30.PAREDES - 0.75, 0.75, 0.3);
const ROOF = 4.2;
const NEON = ['#ff3d7f', '#4ff0ff', '#ffe066', '#7cff6b'];
const Cabinet: React.FC<{tt: number; c: string; i: number}> = ({tt, c, i}) => (
  <group>
    <P geo={G.box} color={c} p={[0, 0.9, 0]} s={[0.9, 1.8, 0.8]} o={0.03} />
    <P geo={G.box} color={c} p={[0, 2.0, 0.08]} s={[0.9, 0.4, 0.95]} o={0.02} />
    <mesh geometry={G.box} material={mat(NEON[(i + Math.floor(tt * 3)) % 4], {basic: true})} position={[0, 1.45, 0.41]} scale={[0.7, 0.5, 0.02]} />
    <P geo={G.box} color="#14110c" p={[0, 1.05, 0.45]} r={[-0.5, 0, 0]} s={[0.8, 0.06, 0.3]} o={0} />
    <mesh geometry={G.ballLo} material={mat('#e2483d', {basic: true})} position={[-0.2, 1.12, 0.55]} scale={0.06} />
    <mesh geometry={G.ballLo} material={mat('#ffe066', {basic: true})} position={[0.15, 1.12, 0.55]} scale={0.05} />
  </group>
);
export const Fliperama: React.FC<{tt: number}> = ({tt}) => {
  const sign = useMemo(() => texMat(textTexture('🕹️ FLIPERAMA', {bg: '#14110c', fg: '#4ff0ff', border: '#ff3d7f', w: 1024, h: 200, size: 120})), []);
  const base = easeOut(clamp((tt - D30.FLIPER + 0.3) / 0.4));
  const neonOn = tt >= D30.NEON;
  const kH = pop(tt, D30.HENRIQUE, 0.45);
  return (
    <group>
      <group position={[FX, 0, FZ + 2]} scale={[Math.max(0.0001, base), 1, Math.max(0.0001, base)]}>
        <mesh geometry={G.box} material={mat('#cfd4da')} position={[0, 0.07, 0]} scale={[20, 0.1, 18]} receiveShadow />
      </group>
      <Bricks t={tt} list={WALLS} />
      <Drop t={tt} t0={D30.TELHADO} h={7} dur={0.25} p={[FX, 0.1, FZ]}>
        <P geo={G.box} color="#14110c" p={[0, ROOF - 0.1, 0]} s={[12.6, 0.4, 9.6]} o={0.04} />
        <mesh geometry={G.box} material={sign} position={[0, 3.25, 4.95]} scale={[8.4, 1.3, 0.1]} />
        <P geo={G.box} color="#0d0b14" p={[0, 1.15, 4.9]} s={[2, 2.3, 0.06]} o={0.02} />
        {[-3.8, 3.8].map((x) => <P key={x} geo={G.box} color="#1c2a4a" p={[x, 1.5, 4.9]} s={[2.4, 1.6, 0.05]} o={0.02} />)}
      </Drop>
      {/* neon strips */}
      {neonOn ? [0, 1, 2, 3].map((i) => {
        const c = NEON[(i + Math.floor(tt * 4)) % 4];
        return <mesh key={i} geometry={G.box} material={mat(c, {basic: true})} position={[FX, ROOF + 0.2 + i * 0.001, FZ + 5.05]} scale={[12.6 - i * 0.001, 0.12, 0.12]} />;
      })[0] : null}
      {neonOn ? [-6.25, 6.25].map((x, i) => <mesh key={x} geometry={G.box} material={mat(NEON[(i + Math.floor(tt * 4)) % 4], {basic: true})} position={[FX + x, 2.1, FZ + 5.0]} scale={[0.12, 4.0, 0.12]} />) : null}
      {neonOn && tt < LOOP_AT ? Array.from({length: 8}).map((_, i) => { const ph = (tt * 0.8 + i / 8) % 1; return <mesh key={'p' + i} geometry={G.ballLo} material={mat(NEON[i % 4], {basic: true})} position={[FX - 5 + i * 1.4, ROOF + 0.6 + ph * 2.4, FZ + 4]} scale={0.14 * (1 - ph)} />; }) : null}
      {/* arcade cabinets in front */}
      {[-3.2, -1.6, 1.6, 3.2].map((x, i) => (
        <Drop key={x} t={tt} t0={D30.MAQUINAS + i * 0.1} h={6} dur={0.25} p={[FX + x, 0.12, FZ + 6.6]}>
          <Cabinet tt={tt} c={['#e2483d', '#2f6fd6', '#2d9a5a', '#7a4fd0'][i]} i={i} />
        </Drop>
      ))}
      {/* first player: henrique_____sp */}
      <group position={[FX - 1.6, 0.12, FZ + 8.0]} rotation={[0, Math.PI, 0]}>
        {kH > 0 ? (
          <group scale={kH}>
            <Capy scale={0.75} shirt="#4ff0ff" cap="#ff3d7f" pose={{armL: [-1.2, 0, 0.2 + Math.sin(tt * 14) * 0.15], armR: [-1.2, 0, -0.2 - Math.sin(tt * 14 + 1) * 0.15], mouth: 0.6, brow: 0.5, blink: 0}} />
          </group>
        ) : null}
        <Poof tt={tt} t0={D30.HENRIQUE - 0.1} c="#4ff0ff" />
      </group>
      {kH > 0 ? <group position={[FX - 1.6, 0.12, FZ + 8.0]}><NameTag name="henrique_____sp" k={kH} /></group> : null}
    </group>
  );
};

/* ---------------- wishes ---------------- */
const Wolf: React.FC<{tt: number; howl: number}> = ({tt, howl}) => {
  const fur = '#5b5f66', dark = '#3a3d42';
  const hd = -0.5 * howl;
  return (
    <group>
      {[-0.18, 0.18].map((x) => <P key={x} geo={G.box} color={dark} p={[x, 0.4, 0]} s={[0.22, 0.8, 0.26]} o={0.03} />)}
      <P geo={G.box} color={fur} p={[0, 1.2, 0]} s={[0.75, 0.95, 0.5]} o={0.04} />
      <P geo={G.box} color="#8a6a4a" p={[0, 1.15, 0.2]} s={[0.55, 0.7, 0.14]} o={0.02} />
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.48, 1.55, 0]} rotation={[0, 0, sd * (0.3 + 0.2 * Math.sin(tt * 5))]}>
          <P geo={G.box} color={fur} p={[0, -0.38, 0]} s={[0.2, 0.75, 0.2]} o={0.02} />
          {[-0.06, 0, 0.06].map((cx) => <P key={cx} geo={G.cone4} color="#ffffff" p={[cx, -0.8, 0.05]} r={[Math.PI, 0, 0]} s={[0.03, 0.12, 0.03]} o={0} />)}
        </group>
      ))}
      <group position={[0, 1.95, 0]} rotation={[hd, 0, 0]}>
        <P geo={G.box} color={fur} p={[0, 0, 0]} s={[0.6, 0.5, 0.55]} o={0.04} />
        <P geo={G.box} color={dark} p={[0, -0.08, 0.38]} s={[0.32, 0.25, 0.35]} o={0.03} />
        <P geo={G.ballLo} color="#14110c" p={[0, 0.0, 0.56]} s={0.06} o={0} />
        {[-0.18, 0.18].map((x) => <P key={x} geo={G.cone4} color={dark} p={[x, 0.38, -0.05]} s={[0.12, 0.3, 0.1]} o={0.02} />)}
        {[-0.14, 0.14].map((x) => <mesh key={'e' + x} geometry={G.ballLo} material={mat('#ffe066', {basic: true})} position={[x, 0.1, 0.28]} scale={0.055} />)}
      </group>
      <P geo={G.cone6} color={fur} p={[0, 0.9, -0.42]} r={[-1.1, 0, 0]} s={[0.18, 0.7, 0.18]} o={0.02} />
    </group>
  );
};
export const Desejos30: React.FC<{tt: number}> = ({tt}) => {
  const kF = pop(tt, D30.FILHA, 0.45), kL = pop(tt, D30.LOBO, 0.45), kM = pop(tt, D30.MANICURE, 0.45), kI = pop(tt, D30.INFLU, 0.45), kR = pop(tt, D30.ROCK, 0.45), kP = pop(tt, D30.PROF, 0.45);
  const howl = tt >= D30.UIVO && tt < LOOP_AT ? Math.min(1, (tt - D30.UIVO) / 0.3) : tt >= D30.LOBO + 0.4 && tt < D30.LOBO + 1.6 ? 1 : 0;
  const board = useMemo(() => texMat(textTexture('A B C 1+1', {bg: '#1f4d2e', fg: '#ffffff', border: '#7b4a28', w: 512, h: 256, size: 90})), []);
  const fam = useMemo(() => texMat(textTexture('⭐ FAMOSA', {bg: '#ff3d7f', fg: '#ffffff', border: '#ffd21e', w: 512, h: 128, size: 80})), []);
  const skX = Math.sin(tt * 1.6) * 1.4;
  return (
    <group>
      {/* queen's daughter, on the castle roof right of the throne */}
      <group position={[-340.4, 4.47, 207.7]}>
        {kF > 0 ? (
          <group scale={kF * 0.8}>
            <Girl tt={tt} wave={0.9} skin="#c98a5e" dress="#ff9fd0" hair="#14110c" />
            <P geo={G.cyl12} color="#ffd21e" p={[0, 2.22, 0]} s={[0.2, 0.09, 0.2]} o={0.02} />
            {[0, 1, 2].map((i) => <P key={i} geo={G.cone4} color="#ffd21e" p={[-0.1 + i * 0.1, 2.32, 0.13]} s={[0.045, 0.12, 0.045]} o={0} />)}
            <Tag name="laralealbraga" y={1.2} />
          </group>
        ) : null}
        <Poof tt={tt} t0={D30.FILHA - 0.1} c="#ff9fd0" />
      </group>
      {/* werewolf */}
      <group position={[-352, 0.1, 196.5]} rotation={[0, 0.2, 0]}>
        {kL > 0 ? <group scale={kL * 1.1}><Wolf tt={tt} howl={howl} /><Tag name="felipemuniz5882" y={0.55} /></group> : null}
        <Poof tt={tt} t0={D30.LOBO - 0.1} c="#9aa3ad" />
        {howl > 0 && tt < LOOP_AT ? Array.from({length: 4}).map((_, i) => { const ph = (tt * 1.4 + i / 4) % 1; return <mesh key={i} geometry={G.cyl12} material={mat('#ffffff', {basic: true})} position={[0, 2.9 + ph * 1.5, 0.2]} rotation={[Math.PI / 2, 0, 0]} scale={[0.2 + ph * 0.8, 0.02, 0.2 + ph * 0.8]} />; }) : null}
      </group>
      {/* manicure */}
      <group position={[-312, 0.1, 196.5]}>
        {kM > 0 ? (
          <group scale={kM}>
            <Girl tt={tt} wave={0.6} skin="#f1d0b0" dress="#0d2a6b" hair="#6b3a1e" />
            <P geo={G.box} color="#4fa3ff" p={[0, 1.38, 0]} s={[0.46, 0.36, 0.3]} o={0.03} />
            {Array.from({length: 6}).map((_, i) => <P key={i} geo={G.ballLo} color="#6b3a1e" p={[(i % 2 ? 0.3 : -0.3), 1.62 - Math.floor(i / 2) * 0.13, -0.05 + (i % 3) * 0.02]} s={0.11} o={0} />)}
            <group position={[0.9, 0, 0.1]}>
              <P geo={G.box} color="#ffffff" p={[0, 0.75, 0]} s={[0.9, 0.08, 0.6]} o={0.02} />
              <P geo={G.box} color="#ff9fd0" p={[0, 0.37, 0]} s={[0.12, 0.74, 0.12]} o={0} />
              {['#e2483d', '#ff3d7f', '#7a4fd0', '#2f6fd6'].map((c, i) => <P key={c} geo={G.cyl12} color={c} p={[-0.3 + i * 0.2, 0.88, 0.1]} s={[0.05, 0.16, 0.05]} o={0} />)}
            </group>
            <Tag name="cecilirebecam17" />
          </group>
        ) : null}
        <Poof tt={tt} t0={D30.MANICURE - 0.1} c="#4fa3ff" />
      </group>
      {/* influencer */}
      <group position={[-305, 0.1, 196.5]}>
        {kI > 0 ? (
          <group scale={kI}>
            <Girl tt={tt} wave={0} skin="#c98a5e" dress="#ff7aa8" hair="#2a1a12" />
            <group position={[0.27, 1.48, 0]} rotation={[0.9, 0, -0.4]}>
              <P geo={G.box} color="#14110c" p={[0, -0.5, 0.05]} s={[0.16, 0.28, 0.03]} o={0} />
            </group>
            <group position={[-1.0, 0, 0.6]}>
              <P geo={G.cyl} color="#3a3f47" p={[0, 0.85, 0]} s={[0.03, 1.7, 0.03]} o={0} />
              <mesh geometry={G.cyl12} material={mat('#ffffff', {basic: true})} position={[0, 1.85, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.4, 0.04, 0.4]} />
              <mesh geometry={G.cyl12} material={mat('#3a3f47')} position={[0, 1.85, 0.01]} rotation={[Math.PI / 2, 0, 0]} scale={[0.3, 0.05, 0.3]} />
            </group>
            <mesh geometry={G.box} material={fam} position={[0, 2.6, 0]} scale={[1.2, 0.3, 0.04]} />
            {Array.from({length: 7}).map((_, i) => { const ph = (tt * 0.8 + i / 7) % 1; return <mesh key={i} geometry={G.ballLo} material={mat(i % 2 ? '#ff3040' : '#ffffff', {basic: true})} position={[0.6 + Math.sin(i * 2) * 0.4, 1.4 + ph * 1.8, 0.2]} scale={0.1 * (1 - ph) + 0.03} />; })}
            <Tag name="helenacaetano2015" y={1.15} />
          </group>
        ) : null}
        <Poof tt={tt} t0={D30.INFLU - 0.1} c="#ff7aa8" />
      </group>
      {/* rock girl on a skateboard */}
      <group position={[-356 + (kR > 0 ? skX : 0), 0.1, 187]}>
        {kR > 0 ? (
          <group scale={kR}>
            <group position={[0, 0.12, 0]}>
              <P geo={G.box} color="#e2483d" p={[0, 0, 0]} s={[0.4, 0.05, 1.0]} o={0.01} />
              {[-0.35, 0.35].map((z) => <P key={z} geo={G.cyl12} color="#ffe066" p={[0, -0.07, z]} r={[0, 0, Math.PI / 2]} s={[0.06, 0.4, 0.06]} o={0} />)}
            </group>
            <group position={[0, 0.16, 0]} rotation={[0, Math.PI / 2, 0]}>
              <Girl tt={tt} wave={0.4} skin="#f1d0b0" dress="#14110c" hair="#7a1f3d" />
              <group position={[0, 1.15, 0.28]} rotation={[0, 0, 0.6]}>
                <P geo={G.box} color="#e2483d" p={[0, 0, 0]} s={[0.32, 0.4, 0.08]} o={0.01} />
                <P geo={G.box} color="#3a2414" p={[0, 0.45, 0]} s={[0.06, 0.6, 0.05]} o={0} />
              </group>
            </group>
            <Tag name="bebe_cbjrr" y={0.95} />
          </group>
        ) : null}
        <Poof tt={tt} t0={D30.ROCK - 0.1} c="#e2483d" />
      </group>
      {/* teacher */}
      <group position={[-364, 0.1, 196]}>
        {kP > 0 ? (
          <group scale={kP}>
            <Girl tt={tt} wave={0.8} skin="#8a5a3c" dress="#2d9a5a" hair="#14110c" />
            <group position={[-1.3, 0, -0.4]}>
              {[-0.9, 0.9].map((x) => <P key={x} geo={G.box} color="#7b4a28" p={[x, 0.9, 0]} s={[0.08, 1.8, 0.08]} o={0} />)}
              <mesh geometry={G.box} material={board} position={[0, 1.45, 0.02]} scale={[1.9, 1.0, 0.06]} />
            </group>
            <Tag name="mayra26309" />
          </group>
        ) : null}
        <Poof tt={tt} t0={D30.PROF - 0.1} c="#5ec26a" />
      </group>
    </group>
  );
};
