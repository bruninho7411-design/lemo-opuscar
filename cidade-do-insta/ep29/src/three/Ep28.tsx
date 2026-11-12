import React, {useMemo} from 'react';
import {G, P, mat, textTexture, texMat} from './parts';
import {Capy} from './Capy';
import {NameTag, Mansion} from './World';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, D28, LOOP_AT, TOTAL_SEC} from '../timeline';

const Poof: React.FC<{tt: number; t0: number; y?: number; c?: string; s?: number}> = ({tt, t0, y = 0.9, c = '#ffffff', s = 1}) => {
  const e = clamp((tt - t0) / 0.45);
  if (e <= 0 || e >= 1) return null;
  return <group scale={s}>{Array.from({length: 12}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2, d = 0.3 + easeOut(e) * 1.4;
    return <mesh key={i} geometry={G.ball} material={mat(i % 3 ? c : '#ffe066', {basic: true})} position={[Math.cos(a) * d, y + Math.sin(i * 1.7) * 0.5 * e, Math.sin(a) * d * 0.6]} scale={0.42 * (1 - e) + 0.12} />;
  })}</group>;
};
const Tag: React.FC<{name: string; y?: number}> = ({name, y = 0.8}) => <group position={[0, y, 0]}><NameTag name={name} k={1} /></group>;

/* ---------------- the queen on the castle (castle from ep. 27 at -342, 206) ---------------- */
const QX = -342, QY = 4.42, QZ = 207.3;
const Guard: React.FC<{tt: number; p: [number, number, number]; i: number; t0: number}> = ({tt, p, i, t0}) => {
  const k = pop(tt, t0 + i * 0.08, 0.4);
  if (k <= 0) return null;
  return (
    <group position={p} scale={k * 0.7}>
      <Capy scale={1} shirt="#c62828" cap={null} pose={{armL: [0, 0, 0.15], armR: [0, 0, -0.15], mouth: 0.1, brow: 0.2, blink: 0}} />
      <P geo={G.cyl12} color="#14110c" p={[0, 2.45, 0]} s={[0.36, 0.75, 0.36]} o={0.02} />
      <P geo={G.cyl} color="#cfd4da" p={[0.62, 1.4, 0.1]} s={[0.04, 2.2, 0.04]} o={0} />
      <P geo={G.cone4} color="#ffd21e" p={[0.62, 2.6, 0.1]} s={[0.1, 0.25, 0.1]} o={0} />
    </group>
  );
};
export const Rainha: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const kq = pop(rt, D28.RAINHA + 0.1, 0.45);
  const kt = pop(rt, D28.TRONO, 0.45);
  const throne = Math.max(kt, rt >= D28.RAINHA ? 1 : 0);
  const sign = useMemo(() => texMat(textTexture('👑 CASTELO DA RAINHA 👑', {bg: '#7a1f3d', fg: '#ffd21e', border: '#ffd21e', w: 1024, h: 180, size: 84})), []);
  return (
    <group>
      {/* throne (always there: empty before the raffle) */}
      <group position={[QX, QY, QZ - 0.5]}>
        <P geo={G.box} color="#b3122e" p={[0, 0.4, 0]} s={[1.3, 0.8, 1.0]} o={0.03} />
        <P geo={G.box} color="#b3122e" p={[0, 1.4, -0.42]} s={[1.3, 2.0, 0.2]} o={0.03} />
        <P geo={G.box} color="#ffd21e" p={[0, 2.45, -0.42]} s={[1.0, 0.25, 0.22]} o={0.02} />
        {[-0.62, 0.62].map((x) => <P key={x} geo={G.box} color="#ffd21e" p={[x, 0.95, 0.05]} s={[0.14, 0.3, 0.9]} o={0.02} />)}
        <mesh geometry={G.box} material={sign} position={[0, -0.9, 1.42]} scale={[5.4, 0.95 * Math.max(0.001, throne), 0.08]} />
        {rt >= D28.TRONO && tt < LOOP_AT ? Array.from({length: 6}).map((_, i) => { const ph = (tt * 0.8 + i / 6) % 1; return <mesh key={i} geometry={G.ballLo} material={mat('#ffe066', {basic: true})} position={[Math.cos(i * 2.1) * 1.1, 0.5 + ph * 2.6, Math.sin(i * 2.1) * 0.6]} scale={0.1 * (1 - ph)} />; }) : null}
      </group>
      <group position={[QX, QY + 0.55, QZ - 0.25]}>
        {kq > 0 ? (
          <group scale={kq}>
            <Girl tt={tt} wave={0.9} skin="#c98a5e" dress="#b3122e" hair="#14110c" />
            <P geo={G.box} color="#7a1f3d" p={[0, 1.0, -0.22]} r={[-0.12, 0, 0]} s={[0.7, 1.4, 0.05]} o={0.02} />
            <P geo={G.cyl12} color="#ffd21e" p={[0, 2.26, 0]} s={[0.27, 0.16, 0.27]} o={0.02} />
            {[0, 1, 2, 3, 4].map((i) => <P key={i} geo={G.cone4} color="#ffd21e" p={[Math.cos(i * 1.256) * 0.22, 2.42, Math.sin(i * 1.256) * 0.22]} s={[0.06, 0.18, 0.06]} o={0} />)}
            <mesh geometry={G.ballLo} material={mat('#ff3d7f', {basic: true})} position={[0, 2.28, 0.27]} scale={0.05} />
          </group>
        ) : null}
        <Poof tt={rt} t0={D28.RAINHA} c="#ffd21e" />
        {kq > 0 ? <Tag name="haruna_beatriz" y={0.9} /> : null}
      </group>
      {/* guards: two on the roof, four at the gate */}
      <Guard tt={rt} t0={D28.GUARDAS} i={0} p={[QX - 2.6, QY, QZ + 0.2]} />
      <Guard tt={rt} t0={D28.GUARDAS} i={1} p={[QX + 2.6, QY, QZ + 0.2]} />
      {[-5, -3.4, 3.4, 5].map((dx, i) => <Guard key={dx} tt={rt} t0={D28.GUARDAS} i={i + 2} p={[QX + dx, 0.1, 209.6]} />)}
    </group>
  );
};

/* ---------------- metaphysical dragon (arcanjo_0125) ---------------- */
const DC: [number, number, number] = [-330, 9.5, 214];
const SEG = 16;
const dragonAt = (tt: number, i: number): [number, number, number, number] => {
  const end = tt >= D28.FOGO_IN && tt < LOOP_AT;
  if (end) {
    const e = easeOut(clamp((tt - D28.FOGO_IN) / 0.8));
    const z = 222.5 - i * 0.75, x = -350 + Math.sin(tt * 3 - i * 0.5) * 0.6 * (i / SEG), y = 6.4 + Math.sin(tt * 2.5 - i * 0.4) * 0.3 + i * 0.12;
    const a = tt * 0.8 - i * 0.13, R = 9;
    const fx = DC[0] + Math.cos(a) * R, fy = DC[1] + Math.sin(2 * a) * 1.2, fz = DC[2] + Math.sin(a) * R;
    return [fx + (x - fx) * e, fy + (y - fy) * e, fz + (z - fz) * e, 0];
  }
  const a = tt * 0.8 - i * 0.13, R = 9;
  return [DC[0] + Math.cos(a) * R, DC[1] + Math.sin(2 * a) * 1.2, DC[2] + Math.sin(a) * R, -a];
};
const COLS = ['#b388ff', '#9c6bff', '#7c4dff', '#5e8bff', '#4fc3ff', '#4ff0ff'];
export const Dragao: React.FC<{tt: number}> = ({tt}) => {
  const k = pop(tt, D28.DRAGAO, 0.6);
  const fire = tt >= D28.FOGO && tt < LOOP_AT ? clamp((tt - D28.FOGO) / 0.3) : 0;
  if (k <= 0) {
    return tt > 21 ? (
      <group position={[-322, 0.1, 223]}>
        <Capy scale={0.8} shirt="#7c4dff" cap={null} pose={{brow: 0.3, mouth: 0.5, blink: 0}} />
        <NameTag name="arcanjo_0125" k={1} />
        <Poof tt={tt} t0={D28.DRAGAO - 0.05} c="#b388ff" />
      </group>
    ) : null;
  }
  const head = dragonAt(tt, 0);
  const flap = Math.sin(tt * 7) * 0.6;
  const w = dragonAt(tt, 4);
  return (
    <group>
      {Array.from({length: SEG}).map((_, i) => {
        const [x, y, z] = dragonAt(tt, i + 1);
        const r = (0.75 - i * 0.035) * k;
        return <mesh key={i} geometry={G.ball} material={mat(COLS[Math.floor((i / SEG) * COLS.length)], {basic: true})} position={[x, y, z]} scale={r} />;
      })}
      {/* sparkles along the body */}
      {Array.from({length: 10}).map((_, i) => { const [x, y, z] = dragonAt(tt, i * 1.5 + 1); const ph = (tt * 1.5 + i * 0.37) % 1; return <mesh key={'s' + i} geometry={G.ballLo} material={mat(i % 2 ? '#ffffff' : '#ffe066', {basic: true})} position={[x + Math.sin(i) * 0.9, y + ph * 1.6, z + Math.cos(i) * 0.9]} scale={0.12 * (1 - ph) * k} />; })}
      <group position={[w[0], w[1] + 0.3, w[2]]} rotation={[0, w[3], 0]} scale={k}>
        {[-1, 1].map((sd) => <group key={sd} rotation={[0, 0, sd * (0.3 + flap)]}><P geo={G.box} color="#e1d4ff" p={[sd * 1.6, 0, 0]} s={[3.0, 0.06, 1.5]} o={0.02} /></group>)}
      </group>
      <group position={[head[0], head[1], head[2]]} rotation={[0, head[3], 0]} scale={k}>
        <P geo={G.box} color="#9c6bff" p={[0, 0, 0.3]} s={[1.0, 0.8, 1.3]} o={0.03} />
        <P geo={G.box} color="#b388ff" p={[0, -0.18, 1.05]} s={[0.8, 0.45, 0.7]} o={0.03} />
        {[-0.3, 0.3].map((x) => <mesh key={x} geometry={G.ballLo} material={mat('#4ff0ff', {basic: true})} position={[x, 0.18, 0.92]} scale={0.12} />)}
        {[-0.32, 0.32].map((x) => <P key={'h' + x} geo={G.cone6} color="#ffd21e" p={[x, 0.6, 0.0]} r={[-0.5, 0, 0]} s={[0.12, 0.6, 0.12]} o={0} />)}
        <group position={[0, 1.05, 0]}><NameTag name="arcanjo_0125" k={1} /></group>
        {fire > 0 ? Array.from({length: 18}).map((_, i) => {
          const ph = (tt * 2.2 + i / 18) % 1;
          return <mesh key={'f' + i} geometry={G.ball} material={mat(ph < 0.3 ? '#ffe066' : ph < 0.6 ? '#ff8f1f' : '#e2483d', {basic: true})} position={[Math.sin(i * 2.3) * ph * 1.1, -0.3 + Math.cos(i * 1.7) * ph * 0.7 - ph * 1.2, 1.4 + ph * 5.5 * fire]} scale={0.12 + ph * 0.32} />;
        }) : null}
      </group>
    </group>
  );
};

/* ---------------- spa (daily_niqueelima), girls, black dress + mansion ---------------- */
export const Desejos28: React.FC<{tt: number}> = ({tt}) => {
  const kS = pop(tt, D28.SPA, 0.45), kA = pop(tt, D28.AZUL, 0.45), kL = pop(tt, D28.LOIRA, 0.45), kP = pop(tt, D28.PRETO, 0.5);
  const ssign = useMemo(() => texMat(textTexture('✨ SPA ✨', {bg: '#4fc3c3', fg: '#ffffff', border: '#14110c', w: 800, h: 200, size: 120})), []);
  return (
    <group>
      <mesh geometry={G.box} material={mat('#9fd86a')} position={[-353, 0.045, 210]} scale={[14, 0.04, 14]} receiveShadow />
      {kS > 0 ? (
        <group position={[-356, 0.06, 206]}>
          <group scale={kS}>
            <P geo={G.box} color="#e8fbf8" p={[0, 1.6, -1]} s={[6, 3.2, 3.6]} o={0.05} />
            <P geo={G.box} color="#4fc3c3" p={[0, 3.3, -1]} s={[6.2, 0.25, 3.8]} o={0.03} />
            <mesh geometry={G.box} material={ssign} position={[0, 2.5, 0.84]} scale={[3.8, 0.95, 0.08]} />
            <P geo={G.box} color="#9fd3ff" p={[0, 0.95, 0.82]} s={[1.2, 1.8, 0.05]} o={0.02} />
            {/* hot tub with bubbles */}
            <group position={[2.6, 0, 2.8]}>
              <P geo={G.cyl12} color="#ffffff" p={[0, 0.3, 0]} s={[1.2, 0.6, 1.2]} o={0.03} />
              <mesh geometry={G.cyl12} material={mat('#5fd9ff', {basic: true})} position={[0, 0.58, 0]} scale={[1.05, 0.06, 1.05]} />
              {Array.from({length: 7}).map((_, i) => { const ph = (tt * 1.3 + i / 7) % 1; return <mesh key={i} geometry={G.ballLo} material={mat('#ffffff', {basic: true})} position={[Math.cos(i * 2.4) * 0.6, 0.65 + ph * 0.8, Math.sin(i * 2.4) * 0.6]} scale={0.09 * (1 - ph)} />; })}
            </group>
            {[-2.4, -1.9].map((x, i) => <P key={x} geo={G.box} color={i ? '#ffd6e8' : '#cdeeff'} p={[x, 0.2 + i * 0.12, 2.6]} s={[0.5, 0.12, 0.35]} o={0.01} />)}
          </group>
          <group position={[-0.6, 0.06, 4.6]} scale={kS}>
            <Girl tt={tt} wave={0.8} skin="#8a5a3c" dress="#ffffff" hair="#1d130d" />
            <P geo={G.ball} color="#ff9fd0" p={[0, 2.12, -0.02]} s={[0.36, 0.22, 0.34]} o={0.02} />
            <Tag name="daily_niqueelima" />
          </group>
          <group position={[-0.6, 0, 4.6]}><Poof tt={tt} t0={D28.SPA - 0.1} c="#5fd9ff" /></group>
        </group>
      ) : null}
      {kA > 0 ? (
        <group position={[-337, 0.1, 218]} scale={kA}>
          <Girl tt={tt} wave={0.8} skin="#f1d0b0" dress="#2f6fd6" hair="#4a2c17" />
          <P geo={G.cone6} color="#cfe8ff" p={[0, 2.28, 0]} s={[0.22, 0.28, 0.22]} o={0.02} />
          <Tag name="anajuliamdtglit" />
        </group>
      ) : null}
      <group position={[-337, 0.1, 218]}><Poof tt={tt} t0={D28.AZUL - 0.1} c="#9fd3ff" /></group>
      {kL > 0 ? (
        <group position={[-333.5, 0.1, 218]} scale={kL}>
          <Girl tt={tt} wave={0.8} skin="#f1d0b0" dress="#ffd6e8" hair="#f2c94c" />
          {Array.from({length: 8}).map((_, i) => <P key={i} geo={G.ballLo} color="#e8b923" p={[Math.cos(i * 0.8 + 2.4) * 0.3, 1.78 - (i % 3) * 0.12, -0.1 + Math.sin(i * 0.8 + 2.4) * 0.22]} s={0.1} o={0} />)}
          <Tag name="larissasant12345" />
        </group>
      ) : null}
      <group position={[-333.5, 0.1, 218]}><Poof tt={tt} t0={D28.LOIRA - 0.1} c="#ffe066" /></group>
      {kP > 0 ? (
        <group position={[-298, 0.06, 205]}>
          <Mansion k={kP} />
          <group position={[-2.6, 0.08, 4.2]} scale={kP}>
            <Girl tt={tt} wave={0.8} skin="#c98a5e" dress="#14110c" hair="#14110c" />
            <Tag name="rayzoca.a" />
          </group>
        </group>
      ) : null}
    </group>
  );
};
