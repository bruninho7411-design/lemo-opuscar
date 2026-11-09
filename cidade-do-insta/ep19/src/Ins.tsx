import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {Bairro, BX, MZ} from './three/Bairro';
import {Caption, Callout, Confetti, LILITA} from './overlays';
import {easeOut, clamp, pop, ramp, FPS} from './timeline';
import IW from './ins_words.json';

/** ep19 insert after the surf hook: every follower is a house; comment only = shack, follow+like+repost = mansion */
export const INS = 14.5;
type C = {pos: [number, number, number]; look: [number, number, number]; fov: number};
const lerp = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
const L = (p: number[]): [number, number, number] => [p[0] + BX, p[1], p[2]];
const SH: {s: number; e: number; a: C; b: C}[] = [
  {s: 0, e: 3.6, a: {pos: [34, 30, 52], look: [0, 0, 14], fov: 50}, b: {pos: [24, 22, 44], look: [0, 0, 14], fov: 50}},
  {s: 3.6, e: 7.2, a: {pos: L([0, 3.0, 10.5]), look: L([0, 1.2, -1.5]), fov: 56}, b: {pos: L([0, 2.5, 8.2]), look: L([0, 1.2, -1.5]), fov: 56}},
  {s: 7.2, e: 11.4, a: {pos: L([0, 4.2, MZ + 21]), look: L([0, 2.2, MZ - 2]), fov: 58}, b: {pos: L([0, 5, MZ + 17]), look: L([0, 2.2, MZ - 2]), fov: 58}},
  {s: 11.4, e: 99, a: {pos: L([0, 6, MZ + 18]), look: L([0, 2, MZ - 4]), fov: 60}, b: {pos: L([0, 11, MZ + 17]), look: L([0, 1, MZ - 4]), fov: 60}},
];
const camIns = (u: number): C => {
  const sh = SH.find((x) => u >= x.s && u < x.e) ?? SH[SH.length - 1];
  const k = easeOut(clamp((u - sh.s) / Math.min(4, sh.e - sh.s)));
  return {pos: lerp(sh.a.pos, sh.b.pos, k), look: lerp(sh.a.look, sh.b.look, k), fov: sh.a.fov};
};
const stroke = (w: number) => ({WebkitTextStroke: `${w}px #111`, paintOrder: 'stroke fill'} as React.CSSProperties);
const Title: React.FC<{u: number; t0: number; t1: number; title: string; sub?: string; color?: string}> = ({u, t0, t1, title, sub, color = '#FFD21E'}) => {
  if (u < t0 || u >= t1) return null;
  const k = pop(u, t0, 0.3);
  return (
    <div style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`}}>
      <div style={{fontFamily: LILITA, fontSize: 118, lineHeight: 1, color, textAlign: 'center', ...stroke(16), textShadow: '0 8px 0 rgba(0,0,0,.35)'}}>{title}</div>
      {sub ? <div style={{fontFamily: LILITA, fontSize: 62, marginTop: 8, color: '#fff', textAlign: 'center', ...stroke(12), textShadow: '0 5px 0 rgba(0,0,0,.35)'}}>{sub}</div> : null}
    </div>
  );
};
const Chip: React.FC<{u: number; t0: number; t1: number; text: string; top: number; bg: string; rot: number}> = ({u, t0, t1, text, top, bg, rot}) => {
  if (u < t0 || u >= t1) return null;
  const k = pop(u, t0, 0.25);
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(${rot}deg)`}}>
      <div style={{fontFamily: LILITA, fontSize: 66, background: bg, color: '#fff', ...stroke(0), border: '7px solid #111', borderRadius: 30, padding: '6px 30px', boxShadow: '0 10px 0 rgba(0,0,0,.35)', whiteSpace: 'nowrap', textShadow: '0 4px 0 rgba(0,0,0,.35)'}}>{text}</div>
    </div>
  );
};

export const Ins: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const u = frame / FPS;
  const cutAt = SH.map((x) => x.s).filter((x) => x <= u).slice(-1)[0] ?? 0;
  const cut = 1 - easeOut(clamp((u - cutAt) / 0.28));
  const shake = u >= 6.35 && u < 6.8 ? Math.sin(u * 90) * 10 * (1 - (u - 6.35) / 0.45) : 0;
  const punch = [10.57, 12.51, 13.11, 13.51].reduce((m, p) => (u >= p && u < p + 0.3 ? Math.max(m, 1 - easeOut((u - p) / 0.3)) : m), 0);
  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f4'}}>
      <AbsoluteFill style={{transform: `translate(${shake}px, 0) scale(${1 + 0.09 * cut + 0.05 * punch})`}}>
        <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 50, position: [0, 5, 10]}}>
          <Scene t={16 + u * 0.4} cam={camIns(u)}>
            <Bairro u={u} tm={u} />
          </Scene>
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.25) 100%)'}} />
      <Title u={u} t0={0.2} t1={3.6} title="CADA SEGUIDOR" sub="VIRA UMA CASA! 🏠" />
      <Title u={u} t0={3.6} t1={7.2} title="SÓ COMENTOU?" sub="GANHOU CASINHA 😬" color="#d8cbb0" />
      <Callout t={u} t0={6.35} t1={7.15} text="💥 CAINDO AOS PEDAÇOS!" top={1480} rot={4} size={58} bg="#d8cbb0" />
      <Title u={u} t0={7.2} t1={10.15} title="SEGUIU + CURTIU" sub="+ REPUBLICOU..." />
      <Title u={u} t0={10.15} t1={11.4} title="MANSÃO! 🤑" sub="SEGUIDORES SORTEADOS" />
      <Chip u={u} t0={7.69} t1={10.15} text="➕ SEGUIU" top={1430} bg="#2f6fd6" rot={-4} />
      <Chip u={u} t0={8.33} t1={10.15} text="❤️ CURTIU" top={1530} bg="#ff3040" rot={3} />
      <Chip u={u} t0={8.85} t1={10.15} text="🔁 REPUBLICOU" top={1630} bg="#2d9a5a" rot={-3} />
      <Confetti t={u} t0={10.5} dur={1.8} />
      <Title u={u} t0={11.4} t1={99} title="QUER A SUA?" sub="A PRÓXIMA MANSÃO É SUA 🏰" />
      <Chip u={u} t0={12.51} t1={99} text="➕ SEGUE" top={1430} bg="#2f6fd6" rot={-4} />
      <Chip u={u} t0={13.11} t1={99} text="❤️ CURTE" top={1530} bg="#ff3040" rot={3} />
      <Chip u={u} t0={13.51} t1={99} text="🔁 REPUBLICA" top={1630} bg="#2d9a5a" rot={-3} />
      {u < 7.69 || (u >= 10.15 && u < 12.51) ? <Caption t={u} words={IW as any} /> : null}
    </AbsoluteFill>
  );
};
