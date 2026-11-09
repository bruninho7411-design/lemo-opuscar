import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {easeOut, clamp, ramp, pop, FPS} from './timeline';
import {GameClips, Callout, PhoneCTA, Caption, Confetti, LILITA, INTER} from './overlays';

export const TY_SEC = 36.6;
const st = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #111`, paintOrder: 'stroke fill'});
const MAY = {pos: [0.0, 2.0, 5.4] as [number, number, number], look: [0, 1.6, 0.4] as [number, number, number], fov: 36};
const MAN = {pos: [-330, 8, -15] as [number, number, number], look: [-330, 1.5, -44] as [number, number, number], fov: 58};
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];

/** 3D segments (everything else is real gameplay) */
const cam3d = (t: number) => {
  if (t < 1.82) return {...MAY, pos: lerp3([0, 2.1, 6.4], MAY.pos, easeOut(clamp(t / 0.5)))};
  if (t >= 27.82 && t < 29.86) return {...MAY, pos: lerp3([0, 2.1, 6.2], MAY.pos, easeOut(clamp((t - 27.82) / 2)))};
  if (t >= 31.4) {
    const k = easeOut(clamp((t - 31.4) / 4));
    return {pos: lerp3(MAN.pos, [-330, 6, -19], k), look: MAN.look, fov: 58};
  }
  return null;
};
const Chip: React.FC<{t: number; t0: number; t1: number; text: string; top: number; bg?: string; rot?: number; color?: string}> = ({t, t0, t1, text, top, bg = '#ffffff', rot = -3, color = '#111'}) => {
  if (t < t0 || t >= t1) return null;
  const k = pop(t, t0, 0.25) * (1 - easeOut(ramp(t, t1 - 0.1, t1)));
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(${rot}deg)`}}>
      <div style={{fontFamily: LILITA, fontSize: 66, background: bg, color, border: '7px solid #111', borderRadius: 30, padding: '8px 30px', boxShadow: '0 10px 0 rgba(0,0,0,.35)', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};
const Title: React.FC<{t: number; t0: number; t1: number; a: string; b?: string}> = ({t, t0, t1, a, b}) => {
  if (t < t0 || t >= t1) return null;
  const k = pop(t, t0, 0.3);
  return (
    <div style={{position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`}}>
      <div style={{fontFamily: LILITA, fontSize: 120, lineHeight: 1, color: '#FFD21E', textAlign: 'center', ...st(17), textShadow: '0 9px 0 rgba(0,0,0,.4)'}}>{a}</div>
      {b ? <div style={{fontFamily: LILITA, fontSize: 60, marginTop: 6, color: '#fff', textAlign: 'center', ...st(12), textShadow: '0 5px 0 rgba(0,0,0,.4)'}}>{b}</div> : null}
    </div>
  );
};
const Check: React.FC<{t: number; at: number; e: string; label: string}> = ({t, at, e, label}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, transform: `scale(${pop(t, at, 0.3)})`, transformOrigin: 'left center'}}>
    <div style={{fontSize: 56, width: 70, textAlign: 'center'}}>{e}</div>
    <div style={{fontFamily: LILITA, fontSize: 56, flex: 1, textAlign: 'left'}}>{label}</div>
    <div style={{fontFamily: LILITA, fontSize: 62, color: '#2d9a5a', ...st(5)}}>✓</div>
  </div>
);

export const Tycoon: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const c3 = cam3d(t);
  const punchAt = [0.24, 2.38, 5.04, 7.52, 9.64, 14.92, 16.42, 20.34, 22.4, 26.44, 29.38, 31.76, 32.38, 33.08, 34.22, 34.76];
  let punch = 0;
  for (const p of punchAt) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const shake = t < 1.6 ? Math.sin(t * 70) * 6 * (1 - t / 1.6) : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f4'}}>
      <AbsoluteFill style={{transform: `translate(${shake}px,0) scale(${1 + 0.05 * punch})`}}>
        {c3 ? (
          <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 38, position: [0, 5, 10]}}>
            <Scene t={t} cam={c3} />
          </ThreeCanvas>
        ) : null}
        <GameClips t={t} clips={[
          {src: 'takeA.webm', t0: 1.82, t1: 5.64, from: 1.0, zoom: [1.0, 1.06]},
          {src: 'takeA.webm', t0: 5.64, t1: 8.14, from: 6.0, zoom: [1.0, 1.05]},
          {src: 'takeB.webm', t0: 8.14, t1: 11.32, from: 14.2, zoom: [1.0, 1.1]},
          {src: 'takeA.webm', t0: 11.32, t1: 15.62, from: 19.9, zoom: [1.0, 1.12]},
          {src: 'takeA.webm', t0: 15.62, t1: 17.32, from: 24.2, zoom: [1.15, 1.3], oy: -60},
          {src: 'takeB.webm', t0: 17.32, t1: 20.98, from: 17.6, zoom: [1.0, 1.1]},
          {src: 'takeC.webm', t0: 20.98, t1: 22.16, from: 12.5, zoom: [1.0, 1.05]},
          {src: 'takeD1.webm', t0: 22.16, t1: 22.86, from: 22.0, zoom: [1.1, 1.2], oy: 80},
          {src: 'takeC.webm', t0: 22.86, t1: 25.06, from: 23.6, zoom: [1.0, 1.05]},
          {src: 'takeD2.webm', t0: 25.06, t1: 27.82, from: 28.4, zoom: [1.0, 1.08]},
          {src: 'takeD1.webm', t0: 29.86, t1: 31.4, from: 23.6, zoom: [1.05, 1.15]},
        ]} />
      </AbsoluteFill>
      {c3 ? <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.3) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,0,0,.25) 100%)'}} /> : null}
      {/* hook */}
      {t < 1.82 ? (
        <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${2.3 - 1.3 * easeOut(clamp((t - 0.2) / 0.18))}) rotate(-8deg)`, opacity: clamp((t - 0.2) / 0.1), fontFamily: LILITA, fontSize: 130, color: '#fff', background: '#e2483d', border: '12px solid #111', borderRadius: 34, padding: '0 36px', whiteSpace: 'nowrap', boxShadow: '0 16px 0 rgba(0,0,0,.35)'}}>✋ PARA TUDO!</div>
        </div>
      ) : null}
      <Title t={t} t0={1.82} t1={5.64} a="VIROU JOGO! 🎮" b="TYCOON DA CIDADE DO INSTA" />
      <Chip t={t} t0={5.04} t1={8.14} text="💸 GRÁTIS" top={1440} bg="#5ec26a" color="#fff" />
      <Chip t={t} t0={6.2} t1={8.14} text="🌐 NO NAVEGADOR" top={1550} rot={3} />
      <Title t={t} t0={8.14} t1={11.32} a="PISA NO VERDE" b="E CONSTRÓI A FÁBRICA 🏭" />
      <Title t={t} t0={11.32} t1={15.62} a="ESTEIRA ➜ FORNO" b="➜ DINHEIRO 💵" />
      <Chip t={t} t0={14.92} t1={15.62} text="💵 COLETA!" top={1460} bg="#5ec26a" color="#fff" />
      {t >= 16.42 && t < 17.32 ? (
        <div style={{position: 'absolute', top: 520, left: 0, right: 0, textAlign: 'center', fontFamily: LILITA, fontSize: 230, color: '#5ec26a', ...st(24), textShadow: '0 16px 0 rgba(0,0,0,.4)', transform: `scale(${pop(t, 16.42, 0.25)}) rotate(-6deg)`}}>+$105</div>
      ) : null}
      <Confetti t={t} t0={16.42} />
      <Title t={t} t0={17.32} t1={20.98} a="COMPRA MÁQUINAS" b="E A FÁBRICA CRESCE 📈" />
      <Chip t={t} t0={20.98} t1={22.16} text="📜 MISSÕES TODO DIA" top={1460} />
      <Chip t={t} t0={22.16} t1={22.86} text="✨ PEÇA DOURADA" top={1460} bg="#ffd21e" />
      <Chip t={t} t0={22.86} t1={25.06} text="🎨 PERSONALIZA" top={1460} bg="#d62976" color="#fff" />
      <Chip t={t} t0={25.06} t1={27.82} text="♻️ REBIRTH: x1 ➜ x1,5" top={1460} bg="#7a4fd0" color="#fff" />
      <PhoneCTA t={t} t0={27.82} t1={29.86} tap={29.18} label="🎮 JOGA AGORA!" />
      {/* comment challenge */}
      {t >= 29.86 && t < 31.4 ? (
        <div style={{position: 'absolute', top: 430, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 29.86, 0.3)})`}}>
          <div style={{width: 900, background: '#fff', border: '7px solid #111', borderRadius: 40, padding: '22px 28px', boxShadow: '0 16px 0 rgba(0,0,0,.3)'}}>
            <div style={{fontFamily: LILITA, fontSize: 56, textAlign: 'center'}}>💬 COMENTA QUANTO FEZ</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, fontFamily: INTER}}>
              <div style={{width: 86, height: 86, borderRadius: '50%', background: 'linear-gradient(135deg,#ffb347,#ff5f6d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 46, flexShrink: 0}}>@</div>
              <div style={{flex: 1, fontSize: 48, fontWeight: 900, background: '#f3f3f3', border: '4px solid #111', borderRadius: 20, padding: '8px 16px'}}>{'fiz $ 538 💵'.slice(0, Math.floor(clamp((t - 30.0) / 0.7) * 12))}<span style={{opacity: Math.floor(t * 4) % 2 ? 1 : 0}}>|</span></div>
            </div>
          </div>
        </div>
      ) : null}
      {/* mansion rule */}
      {t >= 31.4 ? (
        <div style={{position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${pop(t, 31.4, 0.3)})`}}>
          <div style={{width: 880, background: '#fff', border: '7px solid #111', borderRadius: 40, padding: '20px 32px 24px', boxShadow: '0 16px 0 rgba(0,0,0,.3)'}}>
            <div style={{fontFamily: LILITA, fontSize: 58, textAlign: 'center'}}>🏰 GANHE UMA MANSÃO</div>
            <Check t={t} at={31.76} e="❤️" label="CURTE" />
            <Check t={t} at={32.38} e="💬" label="COMENTA" />
            <Check t={t} at={33.08} e="🔁" label="REPUBLICA" />
            <Check t={t} at={34.22} e="📸" label="MANDA O PRINT" />
          </div>
          <div style={{marginTop: 22, fontFamily: LILITA, fontSize: 96, color: '#FFD21E', ...st(15), textShadow: '0 10px 0 rgba(0,0,0,.4)', transform: `scale(${pop(t, 34.76, 0.3)}) rotate(-4deg)`}}>= MANSÃO! 🏰</div>
        </div>
      ) : null}
      <Confetti t={t} t0={34.76} />
      <Caption t={t} />
      <Audio src={staticFile('mixty.wav')} />
    </AbsoluteFill>
  );
};
