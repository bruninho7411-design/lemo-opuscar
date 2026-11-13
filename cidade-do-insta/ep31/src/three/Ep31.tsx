import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, D31, LOOP_AT, TOTAL_SEC} from '../timeline';

const Poof: React.FC<{tt: number; t0: number; y?: number; c?: string}> = ({tt, t0, y = 0.9, c = '#ffffff'}) => {
  const e = clamp((tt - t0) / 0.45);
  if (e <= 0 || e >= 1) return null;
  return <>{Array.from({length: 12}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2, d = 0.3 + easeOut(e) * 1.4;
    return <mesh key={i} geometry={G.ball} material={mat(i % 3 ? c : '#ffe066', {basic: true})} position={[Math.cos(a) * d, y + Math.sin(i * 1.7) * 0.5 * e, Math.sin(a) * d * 0.6]} scale={0.42 * (1 - e) + 0.12} />;
  })}</>;
};
const Tag: React.FC<{name: string; y?: number}> = ({name, y = 0.8}) => <group position={[0, y, 0]}><NameTag name={name} k={1} /></group>;

/** stage i of the "wish street" (x from -318 to -246, z 150, all facing +z) */
export const SX = (i: number) => -306 + i * 8.5;
export const SZ = 150;

export const Rua31: React.FC = () => (
  <mesh geometry={G.box} material={mat('#a6dd6c')} position={[-277, 0.045, 150]} scale={[80, 0.04, 24]} receiveShadow />
);

/* ---------------- hook: two vampires ---------------- */
const Bats: React.FC<{tt: number; on: boolean}> = ({tt, on}) => !on ? null : (
  <>{Array.from({length: 7}).map((_, i) => {
    const a = tt * 1.3 + i * 0.9, flap = Math.sin(tt * 16 + i) * 0.7;
    return (
      <group key={i} scale={0.55} position={[Math.cos(a) * (4 + (i % 3)) , 5.5 + (i % 4) * 0.8 + Math.sin(tt * 2 + i) * 0.3, Math.sin(a) * 2 - 2]}>
        <P geo={G.ballLo} color="#1a0f24" p={[0, 0, 0]} s={0.18} o={0} />
        {[-1, 1].map((sd) => <group key={sd} rotation={[0, 0, sd * flap]}><P geo={G.box} color="#2a1745" p={[sd * 0.3, 0, 0]} s={[0.55, 0.04, 0.3]} o={0} /></group>)}
      </group>
    );
  })}</>
);
const Fangs: React.FC<{y: number; z: number}> = ({y, z}) => (
  <>{[-0.04, 0.04].map((x) => <P key={x} geo={G.cone4} color="#ffffff" p={[x, y, z]} r={[Math.PI, 0, 0]} s={[0.03, 0.08, 0.03]} o={0} shadow={false} />)}</>
);
export const Vampiros: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const k1 = pop(rt, D31.VAMP + 0.1, 0.45), k2 = pop(rt, D31.VAMPIRA + 0.1, 0.45);
  const x0 = SX(0);
  const night = rt >= D31.VAMP;
  const eyes = useMemo(() => mat('#ff3040', {basic: true}), []);
  return (
    <group position={[x0, 0, SZ]}>
      {/* moon */}
      {night ? <mesh geometry={G.ball} material={mat('#fff3c4', {basic: true})} position={[5, 9.5, -4]} scale={2.3} /> : null}
      <Bats tt={tt} on={night} />
      {/* bryanr8664 */}
      <group position={[-1.4, 0.1, 0]}>
        {rt < D31.VAMP + 0.08 ? <Capy scale={0.9} shirt="#7a8794" cap={null} pose={{brow: -0.3, mouth: 0.2, blink: 0}} /> : null}
        {k1 > 0 ? (
          <group scale={k1 * 0.95}>
            <P geo={G.box} color="#8e0e24" p={[0, 0.75, -0.32]} r={[-0.08, 0, 0]} s={[1.05, 1.25, 0.05]} o={0.03} />
            <Capy scale={1} shirt="#1a0f24" cap={null} pose={{armL: [0, 0, 0.5], armR: [0, 0, -0.5 - Math.max(0, Math.sin(tt * 5)) * 0.4], mouth: 0.9, brow: 0.5, blink: 0}} />
            <group position={[0, 1.2, 0.02]}><Fangs y={0.02} z={0.61} /></group>
            <P geo={G.box} color="#8e0e24" p={[0.28, 1.28, 0.1]} r={[0, 0.5, -0.5]} s={[0.35, 0.5, 0.05]} o={0.02} />
            <P geo={G.box} color="#8e0e24" p={[-0.28, 1.28, 0.1]} r={[0, -0.5, 0.5]} s={[0.35, 0.5, 0.05]} o={0.02} />
          </group>
        ) : null}
        <Poof tt={rt} t0={D31.VAMP} c="#8e0e24" />
        <group position={[0, rt < D31.VAMP + 0.08 ? 0.35 : 0.85, 0]}><NameTag name="bryanr8664" k={1} /></group>
      </group>
      {/* _anacxs01 */}
      <group position={[1.6, 0.1, 0]}>
        {k2 > 0 ? (
          <group scale={k2}>
            <P geo={G.box} color="#8e0e24" p={[0, 1.25, -0.2]} r={[-0.1, 0, 0]} s={[0.8, 1.5, 0.05]} o={0.03} />
            <Girl tt={tt} wave={0.9} skin="#f3e3e3" dress="#14110c" hair="#14110c" />
            <Fangs y={1.745} z={0.285} />
            <P geo={G.box} color="#8e0e24" p={[0, 1.58, 0.12]} s={[0.46, 0.08, 0.28]} o={0.02} />
          </group>
        ) : null}
        <Poof tt={rt} t0={D31.VAMPIRA} c="#8e0e24" />
        {k2 > 0 ? <Tag name="_anacxs01" y={0.9} /> : null}
      </group>
    </group>
  );
};

/* ---------------- wishes ---------------- */
const Stage: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => <group position={[SX(i), 0.1, SZ]}>{children}</group>;
export const Desejos31: React.FC<{tt: number}> = ({tt}) => {
  const kL = pop(tt, D31.LUNA, 0.5), kP = pop(tt, D31.POLICIAL, 0.45), kR = pop(tt, D31.ROCK, 0.5), kB = pop(tt, D31.BASQUETE, 0.45), kF = pop(tt, D31.FUTSAL, 0.45), kM = pop(tt, D31.RICO, 0.45), kMae = pop(tt, D31.MAE, 0.45);
  const cafe = useMemo(() => texMat(textTexture('☕ CAFETERIA', {bg: '#4a2c17', fg: '#ffe9c8', border: '#ffd21e', w: 800, h: 180, size: 96})), []);
  const hoopBack = useMemo(() => texMat(textTexture('NBA', {bg: '#ffffff', fg: '#e2483d', border: '#14110c', w: 256, h: 160, size: 80})), []);
  const bounce = Math.abs(Math.sin(tt * 5));
  const strum = Math.sin(tt * 12) * 0.25;
  return (
    <group>
      {/* luna2442636: café owner, purple dress */}
      <Stage i={1}>
        {kL > 0 ? (
          <group scale={kL}>
            <P geo={G.box} color="#fff1dc" p={[0, 1.6, -1.8]} s={[6.4, 3.2, 3.4]} o={0.05} />
            {Array.from({length: 8}).map((_, i) => <P key={i} geo={G.box} color={i % 2 ? '#ffffff' : '#7b4a28'} p={[-2.8 + i * 0.8, 3.0, -0.1]} r={[0.5, 0, 0]} s={[0.8, 0.08, 1.2]} o={0.02} />)}
            <mesh geometry={G.box} material={cafe} position={[0, 3.75, -0.1]} scale={[4.6, 0.8, 0.1]} />
            <P geo={G.box} color="#7b4a28" p={[0, 1.0, -0.08]} s={[1.2, 2.0, 0.05]} o={0.02} />
            {[-2.2, 2.2].map((x) => <P key={x} geo={G.box} color="#cdeeff" p={[x, 1.5, -0.08]} s={[1.3, 1.1, 0.05]} o={0.02} />)}
            <group position={[0, 4.6, -1.8]}>
              <P geo={G.cyl12} color="#ffffff" p={[0, 0.45, 0]} s={[0.55, 0.9, 0.55]} o={0.03} />
              <P geo={G.cyl12} color="#4a2c17" p={[0, 0.9, 0]} s={[0.5, 0.05, 0.5]} o={0} />
              <P geo={G.box} color="#ffffff" p={[0.62, 0.5, 0]} s={[0.25, 0.4, 0.12]} o={0.02} />
              {Array.from({length: 4}).map((_, i) => { const ph = (tt * 0.9 + i / 4) % 1; return <mesh key={i} geometry={G.ballLo} material={mat('#ffffff', {basic: true})} position={[Math.sin(i * 2) * 0.12, 1.0 + ph * 1.3, 0]} scale={0.1 * (1 - ph) + 0.03} />; })}
            </group>
            {/* tables */}
            {[-2.2, 2.2].map((x) => (
              <group key={x} position={[x, 0, 1.6]}>
                <P geo={G.cyl} color="#7b4a28" p={[0, 0.45, 0]} s={[0.06, 0.9, 0.06]} o={0} />
                <P geo={G.cyl12} color="#ffffff" p={[0, 0.92, 0]} s={[0.6, 0.05, 0.6]} o={0.02} />
                <P geo={G.cyl12} color="#e2483d" p={[0, 1.0, 0]} s={[0.12, 0.12, 0.12]} o={0} />
              </group>
            ))}
            <group position={[0, 0, 1.9]}>
              <Girl tt={tt} wave={0.9} skin="#b07a52" dress="#7a4fd0" hair="#1d130d" />
              <P geo={G.cyl12} color="#ffffff" p={[0.4, 1.0, 0.25]} s={[0.1, 0.14, 0.1]} o={0} />
              <Tag name="luna2442636" />
            </group>
          </group>
        ) : null}
        <Poof tt={tt} t0={D31.LUNA - 0.1} c="#7a4fd0" />
      </Stage>
      {/* manda_santanna_macha: police officer */}
      <Stage i={2}>
        {kP > 0 ? (
          <group scale={kP}>
            <Girl tt={tt} wave={0.7} skin="#f1d0b0" dress="#1f3a7a" hair="#3a2414" />
            <P geo={G.cyl12} color="#14234d" p={[0, 2.18, 0]} s={[0.3, 0.14, 0.3]} o={0.02} />
            <P geo={G.box} color="#14110c" p={[0, 2.1, 0.22]} s={[0.34, 0.03, 0.2]} o={0} />
            <P geo={G.ball} color="#ffd21e" p={[0.13, 1.44, 0.15]} s={0.05} o={0} />
            <Tag name="manda_santanna_macha" y={1.05} />
            <group position={[2.2, 0, 0.8]} rotation={[0, -0.5, 0]}>
              <P geo={G.box} color="#ffffff" p={[0, 0.6, 0]} s={[1.5, 0.6, 3.2]} o={0.04} />
              <P geo={G.box} color="#14110c" p={[0, 0.62, 0]} s={[1.52, 0.18, 3.0]} o={0} />
              <P geo={G.box} color="#cdeeff" p={[0, 1.1, 0.2]} s={[1.3, 0.45, 1.3]} o={0.03} />
              <mesh geometry={G.box} material={mat(Math.floor(tt * 6) % 2 ? '#e2483d' : '#2f6fd6', {basic: true})} position={[-0.3, 1.4, 0.2]} scale={[0.5, 0.12, 0.25]} />
              <mesh geometry={G.box} material={mat(Math.floor(tt * 6) % 2 ? '#2f6fd6' : '#e2483d', {basic: true})} position={[0.3, 1.4, 0.2]} scale={[0.5, 0.12, 0.25]} />
              {[[-0.75, 1.0], [0.75, 1.0], [-0.75, -1.0], [0.75, -1.0]].map(([x, z], i) => <P key={i} geo={G.cyl12} color="#1c1f26" p={[x, 0.3, z]} r={[0, 0, Math.PI / 2]} s={[0.32, 0.28, 0.32]} o={0.02} />)}
            </group>
          </group>
        ) : null}
        <Poof tt={tt} t0={D31.POLICIAL - 0.1} c="#2f6fd6" />
      </Stage>
      {/* anthony_olivsouza: rocker with a famous band */}
      <Stage i={3}>
        {kR > 0 ? (
          <group scale={kR}>
            <P geo={G.box} color="#2a2f3a" p={[0, 0.2, -0.6]} s={[7.4, 0.4, 3.6]} o={0.04} />
            {[-3.2, 3.2].map((x) => <P key={x} geo={G.box} color="#14110c" p={[x, 1.2, -1.8]} s={[1.1, 1.6, 0.8]} o={0.03} />)}
            {['#ff3d7f', '#4ff0ff', '#ffe066'].map((c, i) => <mesh key={c} geometry={G.cone4} material={mat(c, {basic: true})} position={[-2.6 + i * 2.6, 3.6, -1.5]} rotation={[Math.PI, 0, 0]} scale={[0.5 + 0.1 * Math.sin(tt * 6 + i), 1.2, 0.5]} />)}
            {/* drummer */}
            <group position={[0, 0.4, -1.6]}>
              <Capy scale={0.72} shirt="#e2483d" cap={null} pose={{armL: [-1.0 - Math.abs(Math.sin(tt * 14)) * 0.5, 0, 0.2], armR: [-1.0 - Math.abs(Math.cos(tt * 14)) * 0.5, 0, -0.2], mouth: 0.6, brow: 0.4, blink: 0}} />
              {[-0.55, 0, 0.55].map((x, i) => <P key={x} geo={G.cyl12} color={['#2f6fd6', '#e2483d', '#2f6fd6'][i]} p={[x, 0.55 + (i === 1 ? 0.1 : 0), 0.65]} s={[0.3, 0.22, 0.3]} o={0.02} />)}
            </group>
            {/* bassist */}
            <group position={[2.4, 0.4, -0.3]} rotation={[0, -0.35, 0]}>
              <Capy scale={0.8} shirt="#7a4fd0" cap={null} pose={{armL: [-0.9, 0, 0.3], armR: [-0.7, 0, -0.3], mouth: 0.5, brow: 0.3, blink: 0}} />
              <P geo={G.box} color="#2a1745" p={[0.2, 0.7, 0.45]} r={[0, 0, 0.4]} s={[0.9, 0.12, 0.08]} o={0.02} />
            </group>
            {/* anthony, the star */}
            <group position={[-1.7, 0.4, 0.2]} rotation={[0, 0.3, 0]}>
              <Capy scale={0.9} shirt="#14110c" cap="#e2483d" pose={{armL: [-0.7, 0, 0.3], armR: [-0.9 + strum, 0, -0.35], head: [0, 0, Math.sin(tt * 6) * 0.15], mouth: 0.9, brow: 0.5, blink: 0}} />
              <group position={[0.15, 0.78, 0.5]} rotation={[0, 0, 0.5]}>
                <P geo={G.box} color="#e2483d" p={[0, 0, 0]} s={[0.55, 0.42, 0.1]} o={0.03} />
                <P geo={G.box} color="#3a2414" p={[0.6, 0.12, 0]} s={[0.85, 0.09, 0.06]} o={0} />
              </group>
              <Tag name="anthony_olivsouza" y={0.9} />
            </group>
            {Array.from({length: 8}).map((_, i) => { const ph = (tt * 0.9 + i / 8) % 1; return <mesh key={i} geometry={G.ballLo} material={mat(['#ff3d7f', '#4ff0ff', '#ffe066', '#ffffff'][i % 4], {basic: true})} position={[-3 + i * 0.85, 1.5 + ph * 3, 1.8]} scale={0.12 * (1 - ph)} />; })}
          </group>
        ) : null}
        <Poof tt={tt} t0={D31.ROCK - 0.1} c="#ff3d7f" />
      </Stage>
      {/* sobreirajuliia: basketball */}
      <Stage i={4}>
        {kB > 0 ? (
          <group scale={kB}>
            <mesh geometry={G.box} material={mat('#e08a3c')} position={[0, 0.02, 0]} scale={[8, 0.04, 6.4]} />
            <mesh geometry={G.cyl12} material={mat('#ffffff', {basic: true})} position={[0, 0.045, 0.4]} scale={[1.2, 0.01, 1.2]} />
            <mesh geometry={G.cyl12} material={mat('#e08a3c')} position={[0, 0.05, 0.4]} scale={[1.1, 0.012, 1.1]} />
            <group position={[0, 0, -2.6]}>
              <P geo={G.cyl} color="#3a3f47" p={[0, 1.6, -0.4]} s={[0.09, 3.2, 0.09]} o={0} />
              <mesh geometry={G.box} material={hoopBack} position={[0, 3.5, -0.3]} scale={[1.9, 1.2, 0.08]} />
              <mesh geometry={G.cyl12} material={mat('#ff6a1f', {basic: true})} position={[0, 3.15, 0.1]} scale={[0.45, 0.04, 0.45]} />
            </group>
            <group position={[0, 0, 0.9]}>
              <Girl tt={tt} wave={0.2} skin="#c98a5e" dress="#ffd21e" hair="#2a1a12" />
              <P geo={G.box} color="#14110c" p={[0, 1.38, 0.15]} s={[0.3, 0.2, 0.03]} o={0} />
              <P geo={G.ball} color="#ff7a1f" p={[0.45, 0.25 + bounce * 0.8, 0.35]} s={0.2} o={0.03} />
              <Tag name="sobreirajuliia" />
            </group>
          </group>
        ) : null}
        <Poof tt={tt} t0={D31.BASQUETE - 0.1} c="#ffd21e" />
      </Stage>
      {/* misael_fyppp: futsal */}
      <Stage i={5}>
        {kF > 0 ? (
          <group scale={kF}>
            <mesh geometry={G.box} material={mat('#2f6fd6')} position={[0, 0.02, 0]} scale={[8, 0.04, 6]} />
            <mesh geometry={G.box} material={mat('#ffffff', {basic: true})} position={[0, 0.05, 0]} scale={[7.7, 0.01, 0.08]} />
            <mesh geometry={G.cyl12} material={mat('#ffffff', {basic: true})} position={[0, 0.05, 0]} scale={[1.1, 0.01, 1.1]} />
            <mesh geometry={G.cyl12} material={mat('#2f6fd6')} position={[0, 0.06, 0]} scale={[1.0, 0.012, 1.0]} />
            {[-1, 1].map((sd) => (
              <group key={sd} position={[0, 0, sd * 2.9]}>
                {[-0.9, 0.9].map((x) => <P key={x} geo={G.cyl} color="#ffffff" p={[x, 0.65, 0]} s={[0.06, 1.3, 0.06]} o={0} />)}
                <P geo={G.cyl} color="#ffffff" p={[0, 1.3, 0]} r={[0, 0, Math.PI / 2]} s={[0.06, 1.8, 0.06]} o={0} />
              </group>
            ))}
            <group position={[-0.6, 0, 0.8]}>
              <Capy scale={0.82} shirt="#2d9a5a" cap={null} pose={{armL: [0, 0, 0.5], armR: [0, 0, -0.5], mouth: 0.8, brow: 0.4, blink: 0, lean: 0.12}} />
              <P geo={G.ball} color="#ffffff" p={[0.6 + Math.sin(tt * 4) * 0.2, 0.15 + Math.abs(Math.sin(tt * 6)) * 0.25, 0.55]} s={0.17} o={0.03} />
              <P geo={G.box} color="#14110c" p={[0, 0.8, 0.45]} s={[0.22, 0.2, 0.03]} o={0} />
              <Tag name="misael_fyppp" y={0.4} />
            </group>
          </group>
        ) : null}
        <Poof tt={tt} t0={D31.FUTSAL - 0.1} c="#2d9a5a" />
      </Stage>
      {/* antonio_f._rapozi: richest in town */}
      <Stage i={6}>
        {kM > 0 ? (
          <group scale={kM}>
            {/* gold car */}
            <group position={[2.4, 0, 0.2]} rotation={[0, -0.6, 0]}>
              <P geo={G.box} color="#ffd21e" p={[0, 0.55, 0]} s={[1.6, 0.6, 3.4]} o={0.04} />
              <P geo={G.box} color="#ffe066" p={[0, 1.1, -0.1]} s={[1.4, 0.55, 1.6]} o={0.04} />
              <P geo={G.box} color="#9fd3ff" p={[0, 1.12, 0.72]} s={[1.2, 0.4, 0.05]} o={0} />
              {[[-0.8, 1.1], [0.8, 1.1], [-0.8, -1.1], [0.8, -1.1]].map(([x, z], i) => <P key={i} geo={G.cyl12} color="#1c1f26" p={[x, 0.32, z]} r={[0, 0, Math.PI / 2]} s={[0.34, 0.3, 0.34]} o={0.02} />)}
            </group>
            {/* money piles */}
            {[[-2.4, 0.3], [-3.0, -0.4]].map(([x, z], i) => (
              <group key={i} position={[x, 0, z]}>
                {[0, 1, 2, 3].map((j) => <P key={j} geo={G.box} color="#3fae5a" p={[0, 0.12 + j * 0.2, 0]} r={[0, j * 0.3, 0]} s={[0.9, 0.16, 0.5]} o={0.02} />)}
                {i === 0 ? [0, 1, 2].map((j) => <P key={'g' + j} geo={G.box} color="#ffd21e" p={[0.9, 0.12 + j * 0.2, 0.2]} s={[0.7, 0.16, 0.3]} o={0.02} />) : null}
              </group>
            ))}
            {/* coin rain */}
            {Array.from({length: 14}).map((_, i) => { const ph = (tt * 0.7 + i / 14) % 1; return <mesh key={i} geometry={G.cyl12} material={mat('#ffd21e', {basic: true})} position={[Math.sin(i * 2.3) * 2.8, 4.5 - ph * 4.4, Math.cos(i * 1.7) * 1.2]} rotation={[Math.PI / 2, tt * 6 + i, 0]} scale={[0.18, 0.03, 0.18]} />; })}
            <group position={[-0.2, 0, 0.9]}>
              <Capy scale={0.9} shirt="#14110c" cap={null} pose={{armL: [0, 0, 0.5], armR: [0, 0, -0.4 - Math.max(0, Math.sin(tt * 6)) * 2.0], mouth: 0.9, brow: 0.5, blink: 0}} />
              <group position={[0, 1.78, 0.0]}>
                <P geo={G.cyl12} color="#14110c" p={[0, 0.3, 0]} s={[0.3, 0.6, 0.3]} o={0.02} />
                <P geo={G.cyl12} color="#14110c" p={[0, 0.02, 0]} s={[0.46, 0.04, 0.46]} o={0.02} />
                <P geo={G.cyl12} color="#ffd21e" p={[0, 0.08, 0]} s={[0.31, 0.07, 0.31]} o={0} />
              </group>
              <P geo={G.cyl12} color="#ffd21e" p={[0, 1.02, 0.42]} s={[0.28, 0.03, 0.28]} o={0} />
              <Tag name="antonio_f._rapozi" y={1.1} />
            </group>
          </group>
        ) : null}
        <Poof tt={tt} t0={D31.RICO - 0.1} c="#ffd21e" />
      </Stage>
      {/* manuelamsilvav: mother with a 1-year-old daughter */}
      <Stage i={7}>
        {kMae > 0 ? (
          <group scale={kMae}>
            <group position={[-0.6, 0, 0]}>
              <Girl tt={tt} wave={0.5} skin="#f1d0b0" dress="#ff7aa8" hair="#4a2c17" />
              <P geo={G.box} color="#ff7aa8" p={[0, 1.38, 0]} s={[0.44, 0.36, 0.28]} o={0.03} />
              <Tag name="manuelamsilvav" y={0.95} />
            </group>
            <group position={[0.8, 0, 0.3]}>
              <Girl tt={tt} wave={0.3} scale={0.45} skin="#f1d0b0" dress="#b39ddb" hair="#4a2c17" />
              {[-0.06, 0.06].map((x) => <P key={x} geo={G.cyl} color="#ffffff" p={[x, 0.02, 0.03]} s={[0.04, 0.04, 0.05]} o={0} />)}
              <P geo={G.cyl12} color="#ff9fd0" p={[0, 1.02, 0]} s={[0.12, 0.05, 0.12]} o={0} />
            </group>
            {Array.from({length: 6}).map((_, i) => { const ph = (tt * 0.6 + i / 6) % 1; return <mesh key={i} geometry={G.ballLo} material={mat(i % 2 ? '#ff3d7f' : '#ffe066', {basic: true})} position={[-1 + i * 0.4, 1.8 + ph * 1.4, 0.2]} scale={0.09 * (1 - ph) + 0.02} />; })}
          </group>
        ) : null}
        <Poof tt={tt} t0={D31.MAE - 0.1} c="#ff9fd0" />
      </Stage>
    </group>
  );
};

/* ---------------- hook: the paid order (lilica_444 becomes the governor) ---------------- */
export const GX = -282, GZ = 118;
export const Governadora: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const kp = pop(rt, D31.GOV + 0.2, 0.6);
  const kg = pop(rt, D31.GOV + 0.1, 0.45);
  const sign = useMemo(() => texMat(textTexture('🏛️ PALÁCIO DA GOVERNADORA', {bg: '#14308a', fg: '#ffd21e', border: '#ffd21e', w: 1024, h: 170, size: 74})), []);
  const flag = useMemo(() => texMat(textTexture('✨', {bg: '#14308a', fg: '#ffd21e', border: '#ffffff', w: 256, h: 160, size: 90})), []);
  return (
    <group position={[GX, 0, GZ]}>
      <mesh geometry={G.box} material={mat('#a6dd6c')} position={[0, 0.045, 5]} scale={[34, 0.04, 20]} receiveShadow />
      <group scale={[Math.max(0.001, kp), Math.max(0.001, kp), Math.max(0.001, kp)]}>
        {/* main block + wings */}
        <P geo={G.box} color="#f3ead2" p={[0, 2.4, -1]} s={[10, 4.8, 5]} o={0.05} />
        {[-1, 1].map((sd) => <P key={sd} geo={G.box} color="#efe3c6" p={[sd * 8.2, 1.8, -1.4]} s={[6.4, 3.6, 4.2]} o={0.05} />)}
        <P geo={G.box} color="#ffd21e" p={[0, 4.9, -1]} s={[10.4, 0.25, 5.4]} o={0.03} />
        {[-1, 1].map((sd) => <P key={'r' + sd} geo={G.box} color="#14308a" p={[sd * 8.2, 3.75, -1.4]} s={[6.8, 0.3, 4.6]} o={0.03} />)}
        {/* portico */}
        {[-3.6, -1.2, 1.2, 3.6].map((x) => <P key={x} geo={G.cyl12} color="#ffffff" p={[x, 2.1, 2.0]} s={[0.4, 4.2, 0.4]} o={0.03} />)}
        <P geo={G.box} color="#ffffff" p={[0, 4.35, 2.0]} s={[9.2, 0.45, 1.2]} o={0.03} />
        <P geo={G.cone4} color="#ffffff" p={[0, 5.4, 2.0]} r={[0, Math.PI / 4, 0]} s={[7.4, 1.6, 1.2]} o={0.03} />
        <mesh geometry={G.box} material={sign} position={[0, 4.35, 2.65]} scale={[6.6, 0.6, 0.08]} />
        <P geo={G.box} color="#7b4a28" p={[0, 1.2, 1.55]} s={[1.8, 2.4, 0.08]} o={0.02} />
        {[-3.2, 3.2].map((x) => <P key={'w' + x} geo={G.box} color="#9fd3ff" p={[x, 2.4, 1.55]} s={[1.3, 1.5, 0.06]} o={0.02} />)}
        {[-8.2, 8.2].map((x) => <P key={'ww' + x} geo={G.box} color="#9fd3ff" p={[x, 1.9, 0.72]} s={[2.4, 1.3, 0.06]} o={0.02} />)}
        {/* flag pole */}
        <group position={[-5.8, 0, 4]}>
          <P geo={G.cyl} color="#cfd4da" p={[0, 3.2, 0]} s={[0.06, 6.4, 0.06]} o={0} />
          <mesh geometry={G.box} material={flag} position={[0.7, 5.8 + Math.sin(tt * 4) * 0.04, 0]} scale={[1.4, 0.9, 0.04]} />
        </group>
        {/* steps + red carpet */}
        {[0, 1, 2].map((i) => <P key={i} geo={G.box} color="#d9d2c0" p={[0, 0.1 + i * 0.1, 4.4 - i * 0.9]} s={[8.6 + i * 0.6, 0.12, 2.6 - i * 0.7]} o={0.02} />)}
        <P geo={G.box} color="#b3122e" p={[0, 0.34, 5.0]} s={[1.6, 0.04, 6]} o={0} />
        {[-2.6, 2.6].map((x) => <P key={'sh' + x} geo={G.cyl12} color="#2d9a5a" p={[x, 0.5, 6.2]} s={[0.6, 1, 0.6]} o={0.02} />)}
        {/* guards */}
        {[-1.8, 1.8].map((x, i) => (
          <group key={'g' + x} position={[x, 0.3, 3.5]}>
            <Capy scale={0.78} shirt="#14308a" cap="#14110c" pose={{armL: [0, 0, 0.12], armR: [0, 0, -0.12], mouth: 0.1, brow: 0.2, blink: 0}} />
          </group>
        ))}
      </group>
      {/* the person: a capybara before the POOF, the governor after */}
      <group position={[0, 0.3, 8.2]}>
        {rt < D31.GOV + 0.08 ? <Capy scale={0.9} shirt="#8d8478" cap={null} pose={{brow: -0.2, mouth: 0.3, blink: 0, head: [0.1, 0, 0]}} /> : null}
        {kg > 0 ? (
          <group scale={kg}>
            <Girl tt={tt} wave={0.9} skin="#c98a5e" dress="#14308a" hair="#2a1a12" />
            <P geo={G.box} color="#ffffff" p={[0, 1.4, 0.15]} s={[0.12, 0.22, 0.03]} o={0} />
            <group position={[0, 1.2, 0.02]} rotation={[0, 0, -0.75]}>
              <P geo={G.box} color="#2d9a5a" p={[0, 0.1, 0.16]} s={[0.1, 0.8, 0.03]} o={0.01} />
              <P geo={G.box} color="#ffd21e" p={[0.1, 0.1, 0.16]} s={[0.04, 0.8, 0.032]} o={0} />
            </group>
            <P geo={G.ball} color="#ffd21e" p={[0.16, 1.5, 0.16]} s={0.05} o={0} />
          </group>
        ) : null}
        <Poof tt={rt} t0={D31.GOV} c="#ffd21e" />
        <group position={[0, rt < D31.GOV + 0.08 ? 0.35 : 0.8, 0]}><NameTag name="lilica_444" k={1} /></group>
      </group>
    </group>
  );
};
