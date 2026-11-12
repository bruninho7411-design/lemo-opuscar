import React, {useMemo} from 'react';
import * as THREE from 'three';
import {G, P, mat, textTexture, texMat} from './parts';
import {Capy} from './Capy';
import {NameTag, Mansion} from './World';
import {Girl} from './Cinema';
import {pop, clamp, easeOut, D29, LOOP_AT, TOTAL_SEC} from '../timeline';

const Poof: React.FC<{tt: number; t0: number; y?: number; c?: string}> = ({tt, t0, y = 0.9, c = '#ffffff'}) => {
  const e = clamp((tt - t0) / 0.45);
  if (e <= 0 || e >= 1) return null;
  return <>{Array.from({length: 12}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2, d = 0.3 + easeOut(e) * 1.4;
    return <mesh key={i} geometry={G.ball} material={mat(i % 3 ? c : '#ffe066', {basic: true})} position={[Math.cos(a) * d, y + Math.sin(i * 1.7) * 0.5 * e, Math.sin(a) * d * 0.6]} scale={0.42 * (1 - e) + 0.12} />;
  })}</>;
};
const Tag: React.FC<{name: string; y?: number}> = ({name, y = 0.8}) => <group position={[0, y, 0]}><NameTag name={name} k={1} /></group>;
const Glasses: React.FC<{c?: string}> = ({c = '#14110c'}) => (
  <group position={[0, 1.9, 0.29]}>
    {[-0.1, 0.1].map((x) => <P key={x} geo={G.cyl12} color={c} p={[x, 0, 0]} r={[Math.PI / 2, 0, 0]} s={[0.075, 0.02, 0.075]} o={0} />)}
    <P geo={G.box} color={c} p={[0, 0.01, 0]} s={[0.08, 0.02, 0.02]} o={0} />
  </group>
);
const Hearts: React.FC<{tt: number; n?: number; c?: string; y?: number}> = ({tt, n = 6, c = '#ff3d7f', y = 1.8}) => (
  <>{Array.from({length: n}).map((_, i) => { const ph = (tt * 0.7 + i / n) % 1; return <mesh key={i} geometry={G.ballLo} material={mat(i % 2 ? c : '#ffe066', {basic: true})} position={[Math.cos(i * 2.2) * 0.8, y + ph * 1.6, Math.sin(i * 2.2) * 0.5]} scale={0.1 * (1 - ph) + 0.02} />; })}</>
);

export const S29: [number, number] = [-330, 184];

/** ground for the ep. 29 lot (between ep. 26 and ep. 27 sets) */
export const Lote29: React.FC = () => <mesh geometry={G.box} material={mat('#9fd86a')} position={[S29[0], 0.043, S29[1]]} scale={[64, 0.04, 22]} receiveShadow />;

/** hook: agatha.sophya24 ("vou parar de te seguir... queria ser médica") becomes the city doctor */
export const Medica29: React.FC<{tt: number}> = ({tt}) => {
  const rt = tt >= LOOP_AT ? tt - TOTAL_SEC : tt;
  const k = pop(rt, D29.MEDICA + 0.1, 0.45);
  const kc = pop(rt, D29.MEDICA + 0.25, 0.5);
  const sign = useMemo(() => texMat(textTexture('🩺 CLÍNICA DA CIDADE', {bg: '#ffffff', fg: '#e2483d', border: '#e2483d', w: 1024, h: 200, size: 96})), []);
  const inj = tt >= D29.INJECAO && tt < LOOP_AT ? clamp((tt - D29.INJECAO) / 0.4) : 0;
  return (
    <group position={[-344, 0.06, 180]}>
      <group scale={Math.max(0.001, kc)}>
        <P geo={G.box} color="#f4f6fb" p={[0, 1.7, 0]} s={[7, 3.4, 4]} o={0.05} />
        <P geo={G.box} color="#e2483d" p={[0, 3.5, 0]} s={[7.2, 0.25, 4.2]} o={0.03} />
        <mesh geometry={G.box} material={sign} position={[0, 2.7, 2.04]} scale={[5.6, 1.0, 0.08]} />
        <P geo={G.box} color="#9fd3ff" p={[0, 1.0, 2.03]} s={[1.4, 2.0, 0.05]} o={0.02} />
        <group position={[0, 4.4, 0]}>
          <P geo={G.box} color="#e2483d" p={[0, 0, 0]} s={[0.4, 1.3, 0.3]} o={0.02} />
          <P geo={G.box} color="#e2483d" p={[0, 0, 0]} s={[1.3, 0.4, 0.3]} o={0.02} />
        </group>
      </group>
      <group position={[0, 0.04, 6]}>
        {rt < D29.MEDICA + 0.08 ? <Capy scale={0.85} shirt="#7a8794" cap={null} pose={{brow: -0.6, mouth: 0.1, blink: 0, head: [0.15, 0, 0]}} /> : null}
        {k > 0 ? (
          <group scale={k}>
            <Girl tt={tt} wave={0.8} skin="#c98a5e" dress="#ffffff" hair="#2a1a12" />
            <P geo={G.box} color="#e2483d" p={[0, 1.42, 0.14]} s={[0.12, 0.12, 0.02]} o={0} />
            <P geo={G.box} color="#e2483d" p={[0, 1.42, 0.14]} s={[0.04, 0.2, 0.02]} o={0} />
            <P geo={G.cyl} color="#3a3f47" p={[0.12, 1.33, 0.15]} r={[0, 0, 0.4]} s={[0.02, 0.32, 0.02]} o={0} />
            <P geo={G.ballLo} color="#cfd4da" p={[0.18, 1.18, 0.16]} s={0.05} o={0} />
            {/* giant syringe for the ending */}
            {inj > 0 ? (
              <group position={[-0.45, 1.3, 0.3 + inj * 0.4]} rotation={[Math.PI / 2, 0, 0]} scale={inj}>
                <P geo={G.cyl12} color="#d6f1ff" p={[0, 0, 0]} s={[0.12, 0.7, 0.12]} o={0.02} />
                <P geo={G.cyl12} color="#5fd9ff" p={[0, -0.05, 0]} s={[0.1, 0.45, 0.1]} o={0} />
                <P geo={G.cyl} color="#cfd4da" p={[0, 0.55, 0]} s={[0.015, 0.4, 0.015]} o={0} />
                <P geo={G.box} color="#e2483d" p={[0, -0.42, 0]} s={[0.3, 0.05, 0.3]} o={0.01} />
              </group>
            ) : null}
          </group>
        ) : null}
        <Poof tt={rt} t0={D29.MEDICA} c="#ffffff" />
        <group position={[0, rt < D29.MEDICA + 0.08 ? 0.35 : 0.8, 0]}><NameTag name="agatha.sophya24" k={1} /></group>
      </group>
    </group>
  );
};

/** the queen's sister on the castle roof (lorennasoph_348) */
export const Irma: React.FC<{tt: number}> = ({tt}) => {
  const k = pop(tt, D29.IRMA, 0.45);
  return (
    <group position={[-343.55, 4.47, 207.6]}>
      {k > 0 ? (
        <group scale={k * 0.92}>
          <Girl tt={tt} wave={0.9} skin="#f1d0b0" dress="#7a4fd0" hair="#4a2c17" />
          <P geo={G.cyl12} color="#ffd21e" p={[0, 2.24, 0]} s={[0.22, 0.1, 0.22]} o={0.02} />
          {[0, 1, 2].map((i) => <P key={i} geo={G.cone4} color="#ffd21e" p={[-0.12 + i * 0.12, 2.35, 0.14]} s={[0.05, 0.13, 0.05]} o={0} />)}
          <Tag name="lorennasoph_348" y={1.15} />
        </group>
      ) : null}
      <Poof tt={tt} t0={D29.IRMA - 0.1} c="#c9a0ff" />
    </group>
  );
};

export const Desejos29: React.FC<{tt: number}> = ({tt}) => {
  const kV = pop(tt, D29.VOZINHA, 0.45), kA = pop(tt, D29.ADRIAN, 0.45), kG = pop(tt, D29.GATO, 0.45), kF = pop(tt, D29.FUTEBOL, 0.5), kM = pop(tt, D29.MORANGA, 0.5);
  const shield = useMemo(() => new THREE.MeshBasicMaterial({color: '#5fd9ff', transparent: true, opacity: 0.28, depthWrite: false}), []);
  const ghost = 0.55 + 0.45 * Math.sin(tt * 5);
  const miss = useMemo(() => texMat(textTexture('MISS CIDADE', {bg: '#ff3d7f', fg: '#ffffff', border: '#ffd21e', w: 512, h: 96, size: 64})), []);
  return (
    <group>
      {/* grandma */}
      <group position={[-334, 0.1, 187]}>
        {kV > 0 ? (
          <group scale={kV}>
            <Girl tt={tt} wave={1} skin="#f1d0b0" dress="#b39ddb" hair="#e6e8ec" />
            <Glasses c="#7b4a28" />
            <P geo={G.box} color="#ffffff" p={[0, 1.28, 0.02]} s={[0.5, 0.18, 0.3]} o={0.01} />
            <P geo={G.cyl} color="#7b4a28" p={[-0.42, 0.55, 0.12]} s={[0.03, 1.1, 0.03]} o={0} />
            <Hearts tt={tt} />
            <Tag name="mahhdilvass" />
          </group>
        ) : null}
        <Poof tt={tt} t0={D29.VOZINHA - 0.1} c="#ffd6e8" />
      </group>
      {/* force field + invisibility */}
      <group position={[-327, 0.1, 187]}>
        {kA > 0 ? (
          <group scale={kA}>
            <group scale={[1, 1, 1]} visible={tt < D29.ADRIAN + 0.8 || Math.sin(tt * 9) > -0.6}>
              <Capy scale={0.82} shirt="#2f6fd6" cap="#14110c" pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.7, brow: 0.4, blink: 0}} />
            </group>
            <mesh geometry={G.ballHi} material={shield} position={[0, 1.05, 0]} scale={1.45 + 0.05 * Math.sin(tt * 6)} />
            {Array.from({length: 8}).map((_, i) => { const a = tt * 2 + i * 0.785; return <mesh key={i} geometry={G.ballLo} material={mat('#5fd9ff', {basic: true})} position={[Math.cos(a) * 1.5, 1.05 + Math.sin(a * 1.3) * 0.8, Math.sin(a) * 1.5]} scale={0.06 * ghost + 0.02} />; })}
            <Tag name="adrian179439" y={0.95} />
          </group>
        ) : null}
        <Poof tt={tt} t0={D29.ADRIAN - 0.1} c="#5fd9ff" />
      </group>
      {/* cat with a moustache, vet (next to the ep. 27 vet clinic) */}
      <group position={[-354.2, 0.1, 228]} rotation={[0, 0.3, 0]}>
        {kG > 0 ? (
          <group scale={kG}>
            <P geo={G.box} color="#9aa3ad" p={[0, 0.35, 0]} s={[0.36, 0.7, 0.3]} o={0.03} />
            <P geo={G.box} color="#ffffff" p={[0, 0.85, 0]} s={[0.62, 0.6, 0.4]} o={0.03} />
            <P geo={G.box} color="#e2483d" p={[0.12, 0.95, 0.21]} s={[0.1, 0.1, 0.02]} o={0} />
            <P geo={G.box} color="#9aa3ad" p={[0, 1.45, 0]} s={[0.62, 0.55, 0.5]} o={0.03} />
            {[-0.2, 0.2].map((x) => <P key={x} geo={G.cone4} color="#9aa3ad" p={[x, 1.83, 0]} s={[0.13, 0.26, 0.1]} o={0.02} />)}
            {[-0.12, 0.12].map((x) => <mesh key={'e' + x} geometry={G.ballLo} material={mat('#5ec26a', {basic: true})} position={[x, 1.52, 0.26]} scale={0.055} />)}
            <P geo={G.ballLo} color="#ff9fb8" p={[0, 1.4, 0.27]} s={0.04} o={0} />
            {[-1, 1].map((sd) => <P key={'m' + sd} geo={G.box} color="#14110c" p={[sd * 0.12, 1.33, 0.27]} r={[0, 0, sd * -0.35]} s={[0.22, 0.05, 0.02]} o={0} />)}
            <P geo={G.cyl} color="#9aa3ad" p={[0.2, 0.5, -0.25]} r={[0.5 + Math.sin(tt * 4) * 0.3, 0, 0.3]} s={[0.05, 0.7, 0.05]} o={0} />
            <P geo={G.cyl} color="#3a3f47" p={[0.12, 0.95, 0.22]} r={[0, 0, 0.4]} s={[0.02, 0.3, 0.02]} o={0} />
            <Tag name="talvez_valentina" y={0.55} />
          </group>
        ) : null}
        <Poof tt={tt} t0={D29.GATO - 0.1} />
      </group>
      {/* football pitch (miguel.ph16) */}
      {kF > 0 ? (
        <group position={[-314, 0.06, 184]}>
          <group scale={[kF, 1, kF]}>
            <mesh geometry={G.box} material={mat('#3fa34d')} position={[0, 0.03, 0]} scale={[14, 0.06, 9]} />
            {[-4.6, -2.3, 0, 2.3, 4.6].map((x, i) => <mesh key={x} geometry={G.box} material={mat(i % 2 ? '#47b357' : '#3fa34d')} position={[x, 0.065, 0]} scale={[2.3, 0.01, 9]} />)}
            <mesh geometry={G.box} material={mat('#ffffff', {basic: true})} position={[0, 0.08, 0]} scale={[0.1, 0.02, 9]} />
            <mesh geometry={G.cyl12} material={mat('#ffffff', {basic: true})} position={[0, 0.075, 0]} scale={[1.4, 0.01, 1.4]} />
            <mesh geometry={G.cyl12} material={mat('#3fa34d')} position={[0, 0.08, 0]} scale={[1.3, 0.012, 1.3]} />
            {[-7, 7].map((x) => (
              <group key={x} position={[x, 0, 0]}>
                {[-1.3, 1.3].map((z) => <P key={z} geo={G.cyl} color="#ffffff" p={[0, 0.8, z]} s={[0.07, 1.6, 0.07]} o={0} />)}
                <P geo={G.cyl} color="#ffffff" p={[0, 1.6, 0]} r={[Math.PI / 2, 0, 0]} s={[0.07, 2.6, 0.07]} o={0} />
              </group>
            ))}
          </group>
          <group position={[-1.5, 0.06, 2.8]} scale={kF}>
            <Capy scale={0.82} shirt="#ffffff" cap={null} pose={{armL: [0, 0, 0.3], armR: [0, 0, -0.3 - Math.max(0, Math.sin(tt * 6)) * 2.2], mouth: 0.8, brow: 0.4, blink: 0}} />
            <P geo={G.ball} color="#ffffff" p={[0.6, 0.18 + Math.abs(Math.sin(tt * 5)) * 0.5, 0.5]} s={0.18} o={0.01} />
            <Tag name="miguel.ph16" y={0.35} />
          </group>
        </group>
      ) : null}
      {/* the prettiest in town + mansion (moranga_6) */}
      {kM > 0 ? (
        <group position={[-298.5, 0.06, 182]}>
          <Mansion k={kM} />
          <group position={[-2.4, 0.08, 4.4]} scale={kM}>
            <Girl tt={tt} wave={0.9} skin="#f1d0b0" dress="#ff3d7f" hair="#2a1a12" />
            <mesh geometry={G.box} material={miss} position={[0, 1.22, 0.27]} rotation={[0, 0, -0.35]} scale={[0.55, 0.12, 0.02]} />
            <P geo={G.cyl12} color="#ffd21e" p={[0, 2.26, 0]} s={[0.25, 0.14, 0.25]} o={0.02} />
            {[0, 1, 2, 3, 4].map((i) => <P key={i} geo={G.cone4} color="#ffd21e" p={[Math.cos(i * 1.256) * 0.2, 2.42, Math.sin(i * 1.256) * 0.2]} s={[0.06, 0.2, 0.06]} o={0} />)}
            <Hearts tt={tt} n={10} c="#ffffff" y={1.2} />
            <Tag name="moranga_6" y={0.95} />
          </group>
        </group>
      ) : null}
    </group>
  );
};
