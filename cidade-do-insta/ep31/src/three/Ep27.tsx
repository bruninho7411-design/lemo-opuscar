import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Bricks, boxShell, Drop} from './Usina';
import type {Brick} from './Usina';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, D27, LOOP_AT, TOTAL_SEC} from '../timeline';

const Poof: React.FC<{tt: number; t0: number; y?: number; c?: string}> = ({tt, t0, y = 0.9, c = '#ffffff'}) => {
  const e = clamp((tt - t0) / 0.45);
  if (e <= 0 || e >= 1) return null;
  return <>{Array.from({length: 12}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2, d = 0.3 + easeOut(e) * 1.4;
    return <mesh key={i} geometry={G.ball} material={mat(i % 3 ? c : '#ffe066', {basic: true})} position={[Math.cos(a) * d, y + Math.sin(i * 1.7) * 0.5 * e, Math.sin(a) * d * 0.6]} scale={0.42 * (1 - e) + 0.12} />;
  })}</>;
};
const Glasses: React.FC = () => (
  <group position={[0, 1.9, 0.29]}>
    {[-0.1, 0.1].map((x) => <P key={x} geo={G.cyl12} color="#14110c" p={[x, 0, 0]} r={[Math.PI / 2, 0, 0]} s={[0.075, 0.02, 0.075]} o={0} />)}
    <P geo={G.box} color="#14110c" p={[0, 0.01, 0]} s={[0.08, 0.02, 0.02]} o={0} />
  </group>
);

export const S27: [number, number] = [-330, 212];
const X = (x: number) => S27[0] + x, Z = (z: number) => S27[1] + z;

/** ground for the ep. 27 lot */
export const Lote27: React.FC = () => <mesh geometry={G.box} material={mat('#9fd86a')} position={[X(0), 0.04, Z(4)]} scale={[64, 0.04, 34]} receiveShadow />;

/** hook: m0rt1fero_ didn't want to be a capybara: POOF, a princess with her pink castle */
export const Princesa: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const k = pop(rt, D27.POOF + 0.1, 0.45);
  const kc = pop(rt, D27.POOF + 0.25, 0.6);
  return (
    <group>
      <group position={[X(-12), 0.06, Z(-6)]} scale={Math.max(0.001, kc)}>
        <P geo={G.box} color="#ffc2dd" p={[0, 2, 0]} s={[7, 4, 4]} o={0.05} />
        <P geo={G.box} color="#ff7aa8" p={[0, 4.2, 0]} s={[7.2, 0.4, 4.2]} o={0.03} />
        {[-3.5, 3.5].map((x) => (
          <group key={x} position={[x, 0, 1.6]}>
            <P geo={G.cyl12} color="#ffd6e8" p={[0, 3, 0]} s={[1.1, 6, 1.1]} o={0.04} />
            <P geo={G.cone6} color="#c2185b" p={[0, 6.9, 0]} s={[1.35, 1.8, 1.35]} o={0.04} />
            <P geo={G.box} color="#ffd21e" p={[0, 8.0, 0]} s={[0.05, 0.5, 0.05]} o={0} />
            <P geo={G.box} color="#ff3d7f" p={[0.25, 8.1, 0]} s={[0.45, 0.28, 0.03]} o={0} />
          </group>
        ))}
        <P geo={G.cyl12} color="#ffd6e8" p={[0, 3.6, -1]} s={[1.4, 7.2, 1.4]} o={0.04} />
        <P geo={G.cone6} color="#c2185b" p={[0, 8.2, -1]} s={[1.7, 2.2, 1.7]} o={0.04} />
        <P geo={G.box} color="#7b2848" p={[0, 1.1, 2.02]} s={[1.6, 2.2, 0.06]} o={0.02} />
        {[-2, 2].map((x) => <P key={x} geo={G.box} color="#cdeeff" p={[x, 2.4, 2.02]} s={[0.8, 1.0, 0.05]} o={0.02} />)}
        {Array.from({length: 8}).map((_, i) => { const ph = (tt * 0.45 + i / 8) % 1; return <mesh key={i} geometry={G.ballLo} material={mat(i % 2 ? '#ffe066' : '#ffffff', {basic: true})} position={[-3 + i * 0.85, 4.8 + ph * 3, 2.2]} scale={0.13 * (1 - ph)} />; })}
      </group>
      <group position={[X(-12), 0.1, Z(0)]}>
        {rt < D27.POOF + 0.08 ? <Capy scale={0.85} shirt="#ff7aa8" cap={null} pose={{brow: -0.4, mouth: 0.2, blink: 0, head: [0.1, 0, 0]}} /> : null}
        {k > 0 ? (
          <group scale={k}>
            <Girl tt={tt} wave={0.7} skin="#f1d0b0" dress="#ff9fd0" hair="#6b3a1e" />
            <P geo={G.cone6} color="#ffd21e" p={[0, 2.3, 0]} s={[0.24, 0.3, 0.24]} o={0.02} />
            {[-0.16, 0, 0.16].map((x) => <mesh key={x} geometry={G.ballLo} material={mat('#ff3d7f', {basic: true})} position={[x, 2.22, 0.18]} scale={0.035} />)}
          </group>
        ) : null}
        <Poof tt={rt} t0={D27.POOF} c="#ff9fd0" />
        <group position={[0, rt < D27.POOF + 0.08 ? 0.35 : 0.8, 0]}><NameTag name="m0rt1fero_" k={1} /></group>
      </group>
    </group>
  );
};

/* ---------------- LEGO library (poll 22: 77%) ---------------- */
const LX = X(12), LZ = Z(-6);
const WALLS: Brick[] = boxShell(LX, LZ, 12, 9, 3.8, ['#b5562e', '#f2e3c6'], D27.PAREDES - 0.75, 0.75, 0.3);
const ROOF = 4.2;
const BOOKS = ['#e2483d', '#2f6fd6', '#2d9a5a', '#ffd21e', '#7a4fd0', '#ff8f1f'];
export const Biblioteca: React.FC<{tt: number}> = ({tt}) => {
  const sign = useMemo(() => texMat(textTexture('📚 BIBLIOTECA', {bg: '#3b2414', fg: '#ffd21e', border: '#ffd21e', w: 1024, h: 200, size: 112})), []);
  const base = easeOut(clamp((tt - D27.LET + 0.3) / 0.4));
  const fly = clamp((tt - D27.LIVROS) / 0.6);
  return (
    <group>
      <group position={[LX, 0, LZ + 2]} scale={[Math.max(0.0001, base), 1, Math.max(0.0001, base)]}>
        <mesh geometry={G.box} material={mat('#cfd4da')} position={[0, 0.07, 0]} scale={[22, 0.1, 18]} receiveShadow />
      </group>
      <Bricks t={tt} list={WALLS} />
      <Drop t={tt} t0={D27.TELHADO} h={7} dur={0.25} p={[LX, 0.1, LZ]}>
        <P geo={G.box} color="#f2e3c6" p={[0, ROOF - 0.1, 0]} s={[12.8, 0.4, 9.8]} o={0.04} />
        <P geo={G.cone4} color="#7a1f3d" p={[0, ROOF + 1.1, 0]} r={[0, Math.PI / 4, 0]} s={[9.4, 1.9, 7.4]} o={0.05} />
        <mesh geometry={G.box} material={sign} position={[0, 3.25, 4.62]} scale={[8.4, 1.3, 0.1]} />
        {[-4.5, -1.5, 1.5, 4.5].map((x) => <P key={x} geo={G.cyl12} color="#ffffff" p={[x, 1.5, 5.1]} s={[0.35, 3, 0.35]} o={0.03} />)}
        <P geo={G.box} color="#5b3a1e" p={[0, 1.1, 4.58]} s={[1.8, 2.2, 0.06]} o={0.02} />
        {[0.25, 0.1, -0.05].map((y, i) => <P key={i} geo={G.box} color="#e8e1d6" p={[0, y, 5.3 + i * 0.35]} s={[5 - i * 0.5, 0.15, 0.35]} o={0.02} />)}
      </Drop>
      {/* giant bookshelf next to it */}
      <Drop t={tt} t0={D27.ESTANTE} h={9} dur={0.3} p={[LX + 8.5, 0.1, LZ + 1]}>
        <P geo={G.box} color="#7b4a28" p={[0, 3, 0]} s={[3.2, 6, 1.2]} o={0.05} />
        {[0, 1, 2, 3].map((r) => (
          <group key={r}>
            <P geo={G.box} color="#5b3a1e" p={[0, 0.5 + r * 1.45, 0.45]} s={[3.0, 0.12, 0.5]} o={0} />
            {Array.from({length: 7}).map((_, i) => <P key={i} geo={G.box} color={BOOKS[(i + r) % 6]} p={[-1.2 + i * 0.4, 1.05 + r * 1.45, 0.45]} s={[0.3, 0.9 + ((i * 3 + r) % 3) * 0.1, 0.45]} o={0.01} />)}
          </group>
        ))}
      </Drop>
      {/* flying books */}
      {fly > 0 && tt < LOOP_AT ? Array.from({length: 10}).map((_, i) => {
        const a = tt * 1.3 + i * 0.63, r = 4 + (i % 3) * 1.4;
        const flap = Math.sin(tt * 12 + i) * 0.6;
        return (
          <group key={i} position={[LX + Math.cos(a) * r * fly, ROOF + 2.6 + (i % 4) * 0.9 + Math.sin(tt * 3 + i) * 0.4, LZ + Math.sin(a) * r * fly]} rotation={[0, -a, 0]} scale={fly}>
            <P geo={G.box} color={BOOKS[i % 6]} p={[-0.25, 0, 0]} r={[0, 0, flap]} s={[0.5, 0.06, 0.7]} o={0.01} />
            <P geo={G.box} color={BOOKS[(i + 2) % 6]} p={[0.25, 0, 0]} r={[0, 0, -flap]} s={[0.5, 0.06, 0.7]} o={0.01} />
          </group>
        );
      }) : null}
      {/* builder: let_noglima */}
      {(() => {
        const kk = pop(tt, D27.LET, 0.45);
        return (
          <group position={[LX - 4.5, 0.16, LZ + 8]}>
            {kk > 0 ? (
              <group scale={kk}>
                <Girl tt={tt} wave={0} skin="#8a5a3c" dress="#ff8f1f" hair="#1d130d" />
                <mesh geometry={G.dome} material={mat('#ffd21e')} position={[0, 2.03, 0]} scale={[0.36, 0.26, 0.36]} />
                <group position={[0.27, 1.48, 0]} rotation={[0, 0, -2.4 - Math.max(0, Math.sin(tt * 9)) * 0.6]}>
                  <P geo={G.cyl} color="#5b3a1e" p={[0, -0.55, 0]} s={[0.03, 0.4, 0.03]} o={0} />
                  <P geo={G.box} color="#8b949c" p={[0, -0.78, 0]} s={[0.24, 0.1, 0.1]} o={0} />
                </group>
                <group position={[0, 0.8, 0]}><NameTag name="let_noglima" k={1} /></group>
              </group>
            ) : null}
            <Poof tt={tt} t0={D27.LET - 0.1} c="#ffd21e" />
          </group>
        );
      })()}
      {/* owner: isabella173linda (beige dress + glasses) */}
      {(() => {
        const kk = pop(tt, D27.DONA, 0.45);
        return (
          <group position={[LX + 1.6, 0.16, LZ + 8.4]}>
            {kk > 0 ? (
              <group scale={kk}>
                <Girl tt={tt} wave={0.8} skin="#f1d0b0" dress="#e3c9a0" hair="#4a2c17" />
                <Glasses />
                <P geo={G.box} color="#2f6fd6" p={[-0.34, 1.12, 0.12]} r={[0, 0, 0.2]} s={[0.26, 0.34, 0.08]} o={0.01} />
                <group position={[0, 0.8, 0]}><NameTag name="isabella173linda" k={1} /></group>
              </group>
            ) : null}
            <Poof tt={tt} t0={D27.DONA - 0.1} c="#e3c9a0" />
          </group>
        );
      })()}
    </group>
  );
};

/* ---------------- giant robot (bj2_711) ---------------- */
export const RX = X(-2), RZ = Z(16);
export const Robo: React.FC<{tt: number}> = ({tt}) => {
  const k = pop(tt, D27.ROBO, 0.6);
  if (k <= 0) return tt > 30 ? (
    <group position={[RX + 1.5, 0.06, RZ + 3]}>
      <Capy scale={0.8} shirt="#2f6fd6" cap="#e2483d" pose={{brow: -0.5, mouth: 0.1, blink: 0, head: [0.25, 0, 0]}} />
      <NameTag name="bj2_711" k={1} />
      <Poof tt={tt} t0={D27.ROBO - 0.05} />
    </group>
  ) : null;
  const st = tt >= D27.STOMP - 1.0 && tt < LOOP_AT ? tt - (D27.STOMP - 1.0) : -1;
  const lift = st < 0 ? 0 : st < 0.8 ? easeOut(st / 0.8) : Math.max(0, 1 - (st - 0.8) / 0.12);
  const lean = st < 0 ? 0 : 0.12 * lift;
  const eye = mat('#ffe066', {basic: true});
  const wave = Math.sin(tt * 4) * 0.4;
  return (
    <group position={[RX, 0.06, RZ]} rotation={[lean, -0.25, 0]} scale={k}>
      {[-0.9, 0.9].map((x, i) => (
        <group key={x} position={[x, i === 1 ? lift * 1.6 : 0, i === 1 ? lift * 1.2 : 0]}>
          <P geo={G.box} color="#5b6b7a" p={[0, 1.2, 0]} s={[1.1, 2.4, 1.1]} o={0.04} />
          <P geo={G.box} color="#2f6fd6" p={[0, 0.25, 0.25]} s={[1.4, 0.5, 1.8]} o={0.04} />
        </group>
      ))}
      <P geo={G.box} color="#8b9cab" p={[0, 3.9, 0]} s={[3.4, 3.0, 2.0]} o={0.05} />
      <P geo={G.box} color="#2f6fd6" p={[0, 4.2, 1.02]} s={[1.6, 1.0, 0.06]} o={0.02} />
      {[-0.4, 0, 0.4].map((x, i) => <mesh key={x} geometry={G.ballLo} material={mat(['#e2483d', '#ffd21e', '#5ec26a'][i], {basic: true})} position={[x, 4.2, 1.08]} scale={0.13 + 0.03 * Math.sin(tt * 6 + i)} />)}
      <group position={[-2.1, 5.0, 0]} rotation={[0, 0, 0.3 + wave]}><P geo={G.box} color="#5b6b7a" p={[0, -1.1, 0]} s={[0.7, 2.4, 0.7]} o={0.03} /><P geo={G.box} color="#ffd21e" p={[0, -2.45, 0]} s={[0.9, 0.5, 0.9]} o={0.03} /></group>
      <group position={[2.1, 5.0, 0]} rotation={[0, 0, -0.3]}><P geo={G.box} color="#5b6b7a" p={[0, -1.1, 0]} s={[0.7, 2.4, 0.7]} o={0.03} /><P geo={G.box} color="#ffd21e" p={[0, -2.45, 0]} s={[0.9, 0.5, 0.9]} o={0.03} /></group>
      <P geo={G.box} color="#8b9cab" p={[0, 6.15, 0]} s={[2.0, 1.5, 1.6]} o={0.05} />
      <P geo={G.box} color="#14110c" p={[0, 6.2, 0.81]} s={[1.6, 0.6, 0.04]} o={0} />
      {[-0.42, 0.42].map((x) => <mesh key={x} geometry={G.box} material={eye} position={[x, 6.2, 0.84]} scale={[0.4, 0.22 + 0.1 * Math.max(0, Math.sin(tt * 3)), 0.04]} />)}
      <P geo={G.cyl} color="#3a3f47" p={[0, 7.2, 0]} s={[0.06, 0.6, 0.06]} o={0} />
      <mesh geometry={G.ballLo} material={mat('#e2483d', {basic: true})} position={[0, 7.55, 0]} scale={0.16 + 0.05 * Math.sin(tt * 10)} />
      {/* bj2_711 rides on the shoulder */}
      <group position={[1.15, 5.42, 0.2]}>
        <Capy scale={0.62} shirt="#2f6fd6" cap="#e2483d" pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.9, brow: 0.5, blink: 0}} />
        <NameTag name="bj2_711" k={1} />
      </group>
    </group>
  );
};

/** alicekellymoreira: girl + vet clinic; moniquinha_098: pink house */
export const Desejos27: React.FC<{tt: number}> = ({tt}) => {
  const kV = pop(tt, D27.VET, 0.45), kR = pop(tt, D27.ROSA, 0.45);
  const vsign = useMemo(() => texMat(textTexture('🐾 VETERINÁRIO', {bg: '#2d9a5a', fg: '#ffffff', border: '#14110c', w: 1024, h: 200, size: 104})), []);
  return (
    <group>
      {kV > 0 ? (
        <group position={[X(-27), 0.06, Z(12)]} rotation={[0, 0.35, 0]}>
          <group scale={kV}>
            <P geo={G.box} color="#ffffff" p={[0, 1.5, -1.5]} s={[5.6, 3, 3.4]} o={0.05} />
            <P geo={G.box} color="#2d9a5a" p={[0, 3.1, -1.5]} s={[5.8, 0.25, 3.6]} o={0.03} />
            <mesh geometry={G.box} material={vsign} position={[0, 2.45, 0.24]} scale={[4.6, 0.9, 0.08]} />
            <P geo={G.box} color="#9fd3ff" p={[0, 0.95, 0.22]} s={[1.2, 1.8, 0.05]} o={0.02} />
          </group>
          <group position={[-1.2, 0.06, 2]} scale={kV}>
            <Girl tt={tt} wave={0.8} skin="#f1d0b0" dress="#7fd3ff" hair="#2a1a12" />
            <group position={[0, 0.8, 0]}><NameTag name="alicekellymoreira" k={1} /></group>
          </group>
          {/* puppy */}
          <group position={[0.6, 0.06, 2.2]} scale={kV} rotation={[0, -0.5, 0]}>
            <P geo={G.box} color="#c98a4a" p={[0, 0.38, 0]} s={[0.4, 0.34, 0.7]} o={0.03} />
            <P geo={G.box} color="#c98a4a" p={[0, 0.66, 0.36]} s={[0.36, 0.34, 0.34]} o={0.03} />
            {[-0.14, 0.14].map((x) => <P key={x} geo={G.box} color="#7b4a28" p={[x, 0.86, 0.3]} r={[0, 0, x > 0 ? -0.3 : 0.3]} s={[0.1, 0.2, 0.08]} o={0} />)}
            <P geo={G.ballLo} color="#14110c" p={[0, 0.62, 0.54]} s={0.05} o={0} />
            <P geo={G.box} color="#7b4a28" p={[0, 0.5, -0.4]} r={[0.6 + Math.sin(tt * 18) * 0.4, 0, 0]} s={[0.06, 0.06, 0.3]} o={0} />
            {[[-0.13, 0.25], [0.13, 0.25], [-0.13, -0.25], [0.13, -0.25]].map(([x, z], i) => <P key={i} geo={G.box} color="#c98a4a" p={[x, 0.12, z]} s={[0.1, 0.24, 0.1]} o={0} />)}
          </group>
          <Poof tt={tt} t0={D27.VET - 0.1} />
        </group>
      ) : null}
      {kR > 0 ? (
        <group position={[X(27), 0.06, Z(12)]} rotation={[0, -0.35, 0]}>
          <group scale={2.7 * kR}>
            <P geo={G.box} color="#ff9fd0" p={[0, 0.55, 0]} s={[1.5, 1.1, 1.5]} o={0.04} />
            <P geo={G.cone4} color="#e0457b" p={[0, 1.45, 0]} r={[0, Math.PI / 4, 0]} s={[1.3, 0.7, 1.3]} o={0.04} />
            <P geo={G.box} color="#ffffff" p={[0, 0.35, 0.76]} s={[0.34, 0.66, 0.04]} o={0.02} />
            {[-0.45, 0.45].map((wx) => <P key={wx} geo={G.box} color="#cdeeff" p={[wx, 0.72, 0.76]} s={[0.3, 0.28, 0.04]} o={0.02} />)}
            {[-0.5, -0.2, 0.2, 0.5].map((fx) => <mesh key={fx} geometry={G.ballLo} material={mat('#ff3d7f')} position={[fx, 0.08, 0.95]} scale={0.08} />)}
          </group>
          <group position={[-1.8, 0.06, 3.2]} scale={kR}>
            <Girl tt={tt} wave={0.8} skin="#6b4430" dress="#ff7aa8" hair="#1d130d" />
            <group position={[0, 0.8, 0]}><NameTag name="moniquinha_098" k={1} /></group>
          </group>
          <Poof tt={tt} t0={D27.ROSA - 0.1} c="#ff9fd0" />
        </group>
      ) : null}
    </group>
  );
};
