import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, D32, LOOP_AT, TOTAL_SEC} from '../timeline';

const Poof: React.FC<{tt: number; t0: number; y?: number; c?: string}> = ({tt, t0, y = 0.9, c = '#ffffff'}) => {
  const e = clamp((tt - t0) / 0.45);
  if (e <= 0 || e >= 1) return null;
  return <>{Array.from({length: 12}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2, d = 0.3 + easeOut(e) * 1.4;
    return <mesh key={i} geometry={G.ball} material={mat(i % 3 ? c : '#ffe066', {basic: true})} position={[Math.cos(a) * d, y + Math.sin(i * 1.7) * 0.5 * e, Math.sin(a) * d * 0.6]} scale={0.42 * (1 - e) + 0.12} />;
  })}</>;
};
const Tag: React.FC<{name: string; y?: number}> = ({name, y = 0.8}) => <group position={[0, y, 0]}><NameTag name={name} k={1} /></group>;
const Sash: React.FC<{c1?: string; c2?: string}> = ({c1 = '#2d9a5a', c2 = '#ffd21e'}) => (
  <group position={[0, 1.2, 0.02]} rotation={[0, 0, -0.75]}>
    <P geo={G.box} color={c1} p={[0, 0.1, 0.16]} s={[0.1, 0.8, 0.03]} o={0.01} />
    <P geo={G.box} color={c2} p={[0.1, 0.1, 0.16]} s={[0.04, 0.8, 0.032]} o={0} />
  </group>
);
const Hat: React.FC<{y?: number}> = ({y = 2.08}) => (
  <group position={[0, y, 0]}>
    <P geo={G.dome} color="#f2862a" s={[0.3, 0.24, 0.3]} o={0.03} />
    <P geo={G.cyl12} color="#e3741b" p={[0, 0.0, 0.04]} s={[0.34, 0.03, 0.36]} o={0.02} />
  </group>
);

/** wish row #2: x from -298 to -242, z = 104 (north of the ep. 31 row, behind the governor's palace) */
export const SX = (i: number) => -298 + i * 8;
export const SZ = 104;
const Stage: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => <group position={[SX(i), 0.1, SZ]}>{children}</group>;

export const Rua32: React.FC = () => (
  <mesh geometry={G.box} material={mat('#a6dd6c')} position={[-270, 0.046, 104]} scale={[70, 0.04, 22]} receiveShadow />
);

/* ---------------- hook: the first prefeita ---------------- */
export const Prefeitura: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const kb = pop(rt, D32.PREF + 0.2, 0.6);
  const k1 = pop(rt, D32.PREF + 0.1, 0.45), k2 = pop(rt, D32.PREF2, 0.45);
  const sign = useMemo(() => texMat(textTexture('PREFEITURA', {bg: '#14308a', fg: '#ffffff', border: '#ffd21e', w: 800, h: 150, size: 90})), []);
  const clock = useMemo(() => texMat(textTexture('12', {bg: '#ffffff', fg: '#14110c', border: '#14110c', w: 128, h: 128, size: 80})), []);
  return (
    <Stage i={0}>
      <group scale={Math.max(0.001, kb)}>
        <P geo={G.box} color="#f6e7c8" p={[0, 1.7, -1.6]} s={[7, 3.4, 3.4]} o={0.05} />
        <P geo={G.box} color="#8e2a2a" p={[0, 3.55, -1.6]} s={[7.4, 0.3, 3.8]} o={0.03} />
        <P geo={G.box} color="#f6e7c8" p={[0, 5.0, -1.6]} s={[1.6, 3.0, 1.6]} o={0.04} />
        <mesh geometry={G.box} material={clock} position={[0, 5.2, -0.78]} scale={[1.0, 1.0, 0.06]} />
        <P geo={G.cone4} color="#8e2a2a" p={[0, 6.9, -1.6]} r={[0, Math.PI / 4, 0]} s={[1.8, 1.4, 1.8]} o={0.04} />
        <mesh geometry={G.box} material={sign} position={[0, 2.85, 0.14]} scale={[4.4, 0.55, 0.08]} />
        <P geo={G.box} color="#7b4a28" p={[0, 1.1, 0.1]} s={[1.3, 2.2, 0.08]} o={0.02} />
        {[-2.2, 2.2].map((x) => <P key={x} geo={G.box} color="#9fd3ff" p={[x, 1.8, 0.1]} s={[1.1, 1.2, 0.06]} o={0.02} />)}
        {[-1.4, 1.4].map((x) => <P key={x} geo={G.cyl12} color="#ffffff" p={[x, 1.5, 0.5]} s={[0.22, 3, 0.22]} o={0.03} />)}
        <group position={[3.6, 0, 1.2]}>
          <P geo={G.cyl} color="#cfd4da" p={[0, 2.4, 0]} s={[0.05, 4.8, 0.05]} o={0} />
          <mesh geometry={G.box} material={mat('#2d9a5a')} position={[0.55 , 4.3 + Math.sin(tt * 4) * 0.03, 0]} scale={[1.1, 0.7, 0.03]} />
        </group>
      </group>
      {/* antonellaguercio2023 */}
      <group position={[-1.3, 0.2, 3.8]}>
        {rt < D32.PREF + 0.08 ? <Capy scale={0.85} shirt="#8d8478" cap={null} pose={{brow: -0.5, mouth: 0.2, blink: 0, head: [0.15, 0, 0]}} /> : null}
        {k1 > 0 ? <group scale={k1}><Girl tt={tt} wave={0.9} skin="#f1d0b0" dress="#14308a" hair="#4a2c17" /><Sash /><Hat /></group> : null}
        <Poof tt={rt} t0={D32.PREF} c="#ffd21e" />
        <group position={[0, rt < D32.PREF + 0.08 ? 0.35 : 0.8, 0]}><NameTag name="antonellaguercio2023" k={1} /></group>
      </group>
      {/* fakedlay_da_anna: the second prefeita */}
      <group position={[1.5, 0.2, 3.8]}>
        {k2 > 0 ? <group scale={k2}><Girl tt={tt} wave={0.9} skin="#c98a5e" dress="#ff7aa8" hair="#14110c" /><Sash /><Hat /><Tag name="fakedlay_da_anna" y={0.8} /></group> : null}
        <Poof tt={rt} t0={D32.PREF2 - 0.1} c="#ff9fd0" />
      </group>
    </Stage>
  );
};

/* ---------------- fliperama owner (kzinn_artes.123) at the ep. 30 arcade ---------------- */
export const DonoFliper: React.FC<{tt: number}> = ({tt}) => {
  const k = pop(tt, D32.FLIP, 0.45);
  const crown = pop(tt, D32.FLIP + 0.2, 0.4);
  return (
    <group position={[-279, 0.12, 202.6]} rotation={[0, 0.2, 0]}>
      {k > 0 ? (
        <>
          <Capy scale={0.85 * k} shirt="#ff3d7f" cap="#14110c" sash pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.8, brow: 0.4, blink: 0}} />
          <P geo={G.box} color="#ffd21e" p={[0.55, 0.9, 0.25]} s={[0.12, 0.35, 0.05]} o={0.01} />
          <P geo={G.cyl12} color="#ffd21e" p={[0.55, 1.12, 0.25]} r={[Math.PI / 2, 0, 0]} s={[0.11, 0.04, 0.11]} o={0} />
          <P geo={G.cone4} color="#ffd21e" p={[0, 2.1 * crown, 0]} s={[0.22 * crown, 0.28 * crown, 0.22 * crown]} o={0.02} />
          <NameTag name="kzinn_artes.123" k={k} />
        </>
      ) : null}
      <Poof tt={tt} t0={D32.FLIP - 0.1} c="#4ff0ff" />
    </group>
  );
};

/* ---------------- the row ---------------- */
export const Desejos32: React.FC<{tt: number}> = ({tt}) => {
  const kPo = pop(tt, D32.POLI, 0.45), kFu = pop(tt, D32.FUT, 0.45), kMo = pop(tt, D32.MONSTRO, 0.6), kMe = pop(tt, D32.MENINA, 0.45), kEn = pop(tt, D32.ENG, 0.45), kGa = pop(tt, D32.GATA, 0.45), kPr = pop(tt, D32.PRES, 0.45);
  const sign3 = useMemo(() => texMat(textTexture('3º PEDIDO!', {bg: '#14110c', fg: '#ff3040', border: '#ffd21e', w: 600, h: 150, size: 90})), []);
  const craque = useMemo(() => texMat(textTexture('⚽ CRAQUES', {bg: '#2d9a5a', fg: '#ffffff', border: '#ffd21e', w: 700, h: 150, size: 90})), []);
  const flag = useMemo(() => texMat(textTexture('⭐', {bg: '#14308a', fg: '#ffffff', border: '#ffd21e', w: 256, h: 160, size: 90})), []);
  const bounce = Math.abs(Math.sin(tt * 5));
  return (
    <group>
      {/* guilherme_fidelis2: police officer */}
      <Stage i={1}>
        {kPo > 0 ? (
          <group scale={kPo}>
            <group position={[-0.8, 0.1, 2]}>
              <Capy scale={0.9} shirt="#1f3a7a" cap="#14234d" pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 1.6], mouth: 0.7, brow: 0.4, blink: 0}} />
              <P geo={G.ball} color="#ffd21e" p={[0.18, 0.95, 0.42]} s={0.05} o={0} />
              <Tag name="guilherme_fidelis2" y={0.9} />
            </group>
            <group position={[2.6, 0, 0.8]} rotation={[0, -0.6, 0]}>
              <P geo={G.box} color="#ffffff" p={[0, 0.6, 0]} s={[1.5, 0.6, 3.2]} o={0.04} />
              <P geo={G.box} color="#14110c" p={[0, 0.62, 0]} s={[1.52, 0.18, 3.0]} o={0} />
              <P geo={G.box} color="#cdeeff" p={[0, 1.1, 0.2]} s={[1.3, 0.45, 1.3]} o={0.03} />
              <mesh geometry={G.box} material={mat(Math.floor(tt * 6) % 2 ? '#e2483d' : '#2f6fd6', {basic: true})} position={[-0.3, 1.4, 0.2]} scale={[0.5, 0.12, 0.25]} />
              <mesh geometry={G.box} material={mat(Math.floor(tt * 6) % 2 ? '#2f6fd6' : '#e2483d', {basic: true})} position={[0.3, 1.4, 0.2]} scale={[0.5, 0.12, 0.25]} />
              {[[-0.75, 1.0], [0.75, 1.0], [-0.75, -1.0], [0.75, -1.0]].map(([x, z], i) => <P key={i} geo={G.cyl12} color="#1c1f26" p={[x, 0.3, z]} r={[0, 0, Math.PI / 2]} s={[0.32, 0.28, 0.32]} o={0.02} />)}
            </group>
          </group>
        ) : null}
        <Poof tt={tt} t0={D32.POLI - 0.1} c="#2f6fd6" />
      </Stage>
      {/* victorzin._.010 + nikolis_pk: famous footballers */}
      <Stage i={2}>
        {kFu > 0 ? (
          <group scale={kFu}>
            <mesh geometry={G.box} material={craque} position={[0, 3.6, -1.6]} scale={[5, 0.9, 0.1]} />
            {[-2.4, 2.4].map((x) => <P key={x} geo={G.cyl} color="#3a3f47" p={[x, 1.5, -1.6]} s={[0.09, 3, 0.09]} o={0} />)}
            {[[-1.2, '#ffd21e', 'victorzin._.010'], [1.2, '#2f6fd6', 'nikolis_pk']].map(([x, c, n], i) => (
              <group key={n as string} position={[x as number, 0.1, 1.6]}>
                <Capy scale={0.9} shirt={c as string} cap={null} pose={{armL: [0, 0, 0.6 + (i ? 0 : 1.6)], armR: [0, 0, -0.6 - (i ? 1.6 : 0)], mouth: 0.9, brow: 0.5, blink: 0, lean: 0.06}} />
                <P geo={G.box} color="#ffffff" p={[0, 0.82, 0.45]} s={[0.22, 0.22, 0.03]} o={0} />
                <Tag name={n as string} y={0.95} />
              </group>
            ))}
            <P geo={G.ball} color="#ffd21e" p={[0, 0.3 + bounce * 1.2, 2.2]} s={0.28} o={0.03} />
            {Array.from({length: 10}).map((_, i) => { const ph = (tt * 0.8 + i / 10) % 1; return <mesh key={i} geometry={G.ballLo} material={mat(i % 2 ? '#ffd21e' : '#ffffff', {basic: true})} position={[-3 + i * 0.7, 1 + ph * 3, 0.4]} scale={0.12 * (1 - ph)} />; })}
          </group>
        ) : null}
        <Poof tt={tt} t0={D32.FUT - 0.1} c="#ffd21e" />
      </Stage>
      {/* thalles_0live1ra: the forest monster (3rd request!) */}
      <Stage i={3}>
        {kMo > 0 ? (
          <group scale={kMo}>
            <mesh geometry={G.box} material={mat('#26402c')} position={[0, 0.03, -0.5]} scale={[7.6, 0.06, 8]} />
            {[[-3, -2.8, 1.3], [-1.6, -3.4, 1.0], [1.7, -3.2, 1.2], [3, -2.6, 1.4], [-3.2, 0.6, 1.1], [3.2, 0.9, 1.0]].map(([x, z, s], i) => (
              <group key={i} position={[x, 0, z]} scale={s}>
                <P geo={G.cyl} color="#3a2a1a" p={[0, 0.6, 0]} s={[0.16, 1.2, 0.16]} o={0.02} />
                <P geo={G.cone6} color="#14301f" p={[0, 1.9, 0]} s={[0.9, 2.2, 0.9]} o={0.03} />
              </group>
            ))}
            <mesh geometry={G.ball} material={mat('#fff3c4', {basic: true})} position={[2.4, 6.2, -3.6]} scale={1.3} />
            {Array.from({length: 8}).map((_, i) => <mesh key={'s' + i} geometry={G.ballLo} material={mat('#ffffff', {basic: true})} position={[-3.5 + i * 1.0, 5.6 + (i % 3) * 0.7, -3.8]} scale={0.07 + 0.03 * Math.sin(tt * 4 + i)} />)}
            <mesh geometry={G.box} material={sign3} position={[0, 4.1, -1.4]} scale={[3.2, 0.8, 0.1]} />
            <group position={[0, 0, -0.4]}>
              <P geo={G.ball} color="#2a2a36" p={[0, 1.5, 0]} s={[1.0, 1.25, 0.8]} o={0.05} />
              <P geo={G.ball} color="#34344a" p={[0, 2.95, 0.1]} s={[0.7, 0.6, 0.6]} o={0.05} />
              {[-0.55, 0.55].map((x) => <P key={x} geo={G.cone6} color="#f4ecd8" p={[x, 3.6, 0.0]} r={[0, 0, x * -0.6]} s={[0.13, 0.6, 0.13]} o={0.02} />)}
              {[-0.25, 0.25].map((x) => <mesh key={'e' + x} geometry={G.ballLo} material={mat(Math.floor(tt * 3) % 4 === 0 ? '#2a2a36' : '#ffe066', {basic: true})} position={[x, 3.0, 0.62]} scale={0.1} />)}
              <P geo={G.box} color="#14110c" p={[0, 2.78, 0.58]} s={[0.4, 0.08, 0.05]} o={0} />
              {[-1, 1].map((sd) => (
                <group key={sd} position={[sd * 1.1, 2.2, 0]} rotation={[0, 0, sd * (-0.7 - 0.25 * Math.sin(tt * 3))]}>
                  <P geo={G.cyl} color="#2a2a36" p={[0, -0.55, 0]} s={[0.22, 1.2, 0.22]} o={0.03} />
                  {[-0.1, 0, 0.1].map((x) => <P key={x} geo={G.cone4} color="#f4ecd8" p={[x, -1.25, 0.05]} r={[Math.PI, 0, 0]} s={[0.05, 0.22, 0.05]} o={0} />)}
                </group>
              ))}
              {[-0.45, 0.45].map((x) => <P key={'l' + x} geo={G.cyl} color="#2a2a36" p={[x, 0.45, 0]} s={[0.28, 0.9, 0.28]} o={0.03} />)}
            </group>
            <group position={[2.6, 0, 2.2]}>
              <Capy scale={0.6} shirt="#c98a5e" cap={null} pose={{brow: -0.4, mouth: 0.8, blink: 0}} />
              <Tag name="thalles_0live1ra" y={0.6} />
            </group>
            {Array.from({length: 6}).map((_, i) => { const ph = (tt * 0.5 + i / 6) % 1; return <mesh key={'f' + i} geometry={G.ball} material={mat('#dfe9e2', {basic: true})} position={[-3 + i * 1.2, 0.35 + ph * 0.4, 1.8 + Math.sin(i) * 0.8]} scale={[0.7, 0.18, 0.5]} />; })}
          </group>
        ) : null}
        <Poof tt={tt} t0={D32.MONSTRO - 0.1} c="#5b5f66" />
      </Stage>
      {/* amanzoca_: girl, puppy, pink house */}
      <Stage i={4}>
        {kMe > 0 ? (
          <group scale={kMe}>
            <group position={[0, 0, -1.2]} scale={2.6}>
              <P geo={G.box} color="#ff9fd0" p={[0, 0.55, 0]} s={[1.5, 1.1, 1.5]} o={0.04} />
              <P geo={G.cone4} color="#e0457b" p={[0, 1.45, 0]} r={[0, Math.PI / 4, 0]} s={[1.3, 0.7, 1.3]} o={0.04} />
              <P geo={G.box} color="#ffffff" p={[0, 0.35, 0.76]} s={[0.34, 0.66, 0.04]} o={0.02} />
              {[-0.45, 0.45].map((wx) => <P key={wx} geo={G.box} color="#cdeeff" p={[wx, 0.72, 0.76]} s={[0.3, 0.28, 0.04]} o={0.02} />)}
              {[-0.5, -0.2, 0.2, 0.5].map((fx) => <mesh key={fx} geometry={G.ballLo} material={mat('#ff3d7f')} position={[fx, 0.08, 0.95]} scale={0.08} />)}
            </group>
            <group position={[-1.3, 0, 3.2]}>
              <Girl tt={tt} wave={0.9} skin="#f1d0b0" dress="#ff7aa8" hair="#6b3a1e" />
              <Tag name="amanzoca_" />
            </group>
            <group position={[0.9, 0, 3.4]} rotation={[0, -0.4, 0]}>
              <P geo={G.box} color="#e8c9a0" p={[0, 0.38, 0]} s={[0.4, 0.34, 0.7]} o={0.03} />
              <P geo={G.box} color="#e8c9a0" p={[0, 0.66, 0.36]} s={[0.36, 0.34, 0.34]} o={0.03} />
              {[-0.14, 0.14].map((x) => <P key={x} geo={G.box} color="#b98a5a" p={[x, 0.86, 0.3]} r={[0, 0, x > 0 ? -0.3 : 0.3]} s={[0.1, 0.2, 0.08]} o={0} />)}
              <P geo={G.ballLo} color="#14110c" p={[0, 0.62, 0.54]} s={0.05} o={0} />
              <P geo={G.box} color="#ff7aa8" p={[0, 0.5, 0.0]} s={[0.42, 0.06, 0.06]} o={0} />
              <P geo={G.box} color="#b98a5a" p={[0, 0.5, -0.4]} r={[0.6 + Math.sin(tt * 18) * 0.4, 0, 0]} s={[0.06, 0.06, 0.3]} o={0} />
              {[[-0.13, 0.25], [0.13, 0.25], [-0.13, -0.25], [0.13, -0.25]].map(([x, z], i) => <P key={i} geo={G.box} color="#e8c9a0" p={[x, 0.12, z]} s={[0.1, 0.24, 0.1]} o={0} />)}
            </group>
            {Array.from({length: 6}).map((_, i) => { const ph = (tt * 0.6 + i / 6) % 1; return <mesh key={i} geometry={G.ballLo} material={mat('#ff3d7f', {basic: true})} position={[-1.5 + i * 0.7, 1.8 + ph * 1.6, 3]} scale={0.1 * (1 - ph) + 0.02} />; })}
          </group>
        ) : null}
        <Poof tt={tt} t0={D32.MENINA - 0.1} c="#ff9fd0" />
      </Stage>
      {/* mariaraynaradesousa: engineer */}
      <Stage i={5}>
        {kEn > 0 ? (
          <group scale={kEn}>
            {/* building under construction */}
            <group position={[1.4, 0, -1.6]}>
              <P geo={G.box} color="#cfd4da" p={[0, 1.1, 0]} s={[3, 2.2, 2.4]} o={0.04} />
              {[-1.4, 1.4].map((x) => [-1.1, 1.1].map((z) => <P key={x + '_' + z} geo={G.cyl} color="#e2a02a" p={[x, 3.0, z]} s={[0.06, 1.6, 0.06]} o={0} />))}
              <P geo={G.box} color="#e2a02a" p={[0, 3.8, 0]} s={[3, 0.06, 2.4]} o={0} />
            </group>
            <group position={[-1.8, 0, -2]}>
              <P geo={G.box} color="#e2a02a" p={[0, 0.2, 0]} s={[0.9, 0.4, 0.9]} o={0.03} />
              <P geo={G.cyl} color="#e2a02a" p={[0, 3, 0]} s={[0.14, 6, 0.14]} o={0.02} />
              <group position={[0, 5.8, 0]} rotation={[0, Math.sin(tt * 0.8) * 0.4, 0]}>
                <P geo={G.box} color="#e2a02a" p={[1.6, 0, 0]} s={[4.2, 0.18, 0.18]} o={0.02} />
                <P geo={G.cyl} color="#3a3f47" p={[3.0, -0.8, 0]} s={[0.02, 1.6, 0.02]} o={0} />
                <P geo={G.box} color="#b3122e" p={[3.0, -1.7, 0]} s={[0.6, 0.35, 0.5]} o={0.02} />
              </group>
            </group>
            <group position={[-0.4, 0, 2.6]}>
              <Girl tt={tt} wave={0.6} skin="#c98a5e" dress="#ff8f1f" hair="#14110c" />
              <P geo={G.box} color="#ffe066" p={[0, 1.4, 0.15]} s={[0.45, 0.34, 0.04]} o={0.01} />
              <Hat />
              <P geo={G.cyl12} color="#ffffff" p={[0.45, 0.95, 0.25]} r={[0, 0, Math.PI / 2]} s={[0.07, 0.5, 0.07]} o={0.01} />
              <Tag name="mariaraynaradesousa" y={1.0} />
            </group>
          </group>
        ) : null}
        <Poof tt={tt} t0={D32.ENG - 0.1} c="#ff8f1f" />
      </Stage>
      {/* as_aventurasda_tete: the cat girl */}
      <Stage i={6}>
        {kGa > 0 ? (
          <group scale={kGa}>
            <group position={[-0.6, 0, 2.6]}>
              <Girl tt={tt} wave={0.9} skin="#f1d0b0" dress="#b39ddb" hair="#2a1a12" />
              {[-1, 1].map((sd) => <P key={sd} geo={G.cone4} color="#2a1a12" p={[sd * 0.17, 2.18, -0.02]} s={[0.12, 0.22, 0.1]} o={0.02} />)}
              <group position={[0, 0.9, -0.3]} rotation={[0.9, 0, Math.sin(tt * 5) * 0.3]}>
                <P geo={G.cyl} color="#2a1a12" p={[0, 0.3, 0]} s={[0.05, 0.7, 0.05]} o={0} />
              </group>
              <Tag name="as_aventurasda_tete" y={1.0} />
            </group>
            <group position={[1.4, 0, 2.8]} rotation={[0, -0.5, 0]}>
              <P geo={G.box} color="#f2862a" p={[0, 0.4, 0]} s={[0.45, 0.4, 0.8]} o={0.03} />
              <P geo={G.box} color="#f2862a" p={[0, 0.8, 0.42]} s={[0.4, 0.36, 0.34]} o={0.03} />
              {[-0.14, 0.14].map((x) => <P key={x} geo={G.cone4} color="#f2862a" p={[x, 1.08, 0.4]} s={[0.1, 0.18, 0.08]} o={0} />)}
              {[-0.1, 0.1].map((x) => <mesh key={'e' + x} geometry={G.ballLo} material={mat('#5ec26a', {basic: true})} position={[x, 0.85, 0.62]} scale={0.04} />)}
              <P geo={G.cyl} color="#f2862a" p={[0, 0.7, -0.5]} r={[-0.8 + Math.sin(tt * 4) * 0.3, 0, 0]} s={[0.06, 0.6, 0.06]} o={0} />
            </group>
            <group position={[0, 0, -1.2]}>
              <P geo={G.box} color="#ffd6e8" p={[0, 1.2, 0]} s={[3.6, 0.1, 1.6]} o={0.02} />
              {[-1.6, 1.6].map((x) => <P key={x} geo={G.cyl} color="#e0457b" p={[x, 0.6, 0]} s={[0.1, 1.2, 0.1]} o={0} />)}
              {Array.from({length: 5}).map((_, i) => <mesh key={i} geometry={G.box} material={mat('#5fd9ff', {basic: true})} position={[-1.2 + i * 0.6, 0.9 + Math.sin(tt * 3 + i) * 0.05, 0]} scale={[0.3, 0.14, 0.04]} />)}
            </group>
          </group>
        ) : null}
        <Poof tt={tt} t0={D32.GATA - 0.1} c="#b39ddb" />
      </Stage>
      {/* manuellaamonteiro_ + arthurmanoeldemorais: presidents */}
      <Stage i={7}>
        {kPr > 0 ? (
          <group scale={kPr}>
            <group position={[0, 0, -1.2]}>
              <P geo={G.box} color="#8a5a2b" p={[0, 0.6, 0]} s={[1.6, 1.2, 0.9]} o={0.04} />
              <P geo={G.box} color="#ffd21e" p={[0, 1.25, 0]} s={[1.8, 0.1, 1.0]} o={0.02} />
              <P geo={G.cyl} color="#cfd4da" p={[2.2, 2.0, 0]} s={[0.05, 4, 0.05]} o={0} />
              <mesh geometry={G.box} material={flag} position={[2.9, 3.5 + Math.sin(tt * 4) * 0.03, 0]} scale={[1.4, 0.9, 0.04]} />
            </group>
            <group position={[-1.2, 0, 2.4]}>
              <Girl tt={tt} wave={0.9} skin="#f1d0b0" dress="#14308a" hair="#6b3a1e" />
              <Sash />
              <Tag name="manuellaamonteiro_" y={1.0} />
            </group>
            <group position={[1.3, 0, 2.6]}>
              <Capy scale={0.9} shirt="#14110c" cap={null} pose={{armL: [0, 0, 0.5], armR: [0, 0, -0.4 - Math.max(0, Math.sin(tt * 6)) * 2.0], mouth: 0.9, brow: 0.5, blink: 0}} />
              <group position={[0, 1.78, 0.0]}>
                <P geo={G.cyl12} color="#14110c" p={[0, 0.3, 0]} s={[0.3, 0.6, 0.3]} o={0.02} />
                <P geo={G.cyl12} color="#14110c" p={[0, 0.02, 0]} s={[0.46, 0.04, 0.46]} o={0.02} />
                <P geo={G.cyl12} color="#ffd21e" p={[0, 0.08, 0]} s={[0.31, 0.07, 0.31]} o={0} />
              </group>
              <group position={[0, 0.82, 0.01]} rotation={[0, 0, 0.72]}>
                <P geo={G.box} color="#2d9a5a" p={[0, 0, 0.4]} s={[0.1, 0.9, 0.03]} o={0.01} />
              </group>
              {[0, 1, 2].map((j) => <P key={j} geo={G.box} color="#ffd21e" p={[1.0, 0.12 + j * 0.2, 0.2]} s={[0.7, 0.16, 0.3]} o={0.02} />)}
              <Tag name="arthurmanoeldemorais" y={1.1} />
            </group>
            {Array.from({length: 10}).map((_, i) => { const ph = (tt * 0.7 + i / 10) % 1; return <mesh key={i} geometry={G.cyl12} material={mat('#ffd21e', {basic: true})} position={[Math.sin(i * 2.3) * 2.6, 4.2 - ph * 4.1, 2.6 + Math.cos(i * 1.7) * 0.8]} rotation={[Math.PI / 2, tt * 6 + i, 0]} scale={[0.16, 0.03, 0.16]} />; })}
          </group>
        ) : null}
        <Poof tt={tt} t0={D32.PRES - 0.1} c="#2d9a5a" />
      </Stage>
    </group>
  );
};
