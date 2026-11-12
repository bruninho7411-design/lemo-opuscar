import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, pop, FPS, LOOP_AT, TOTAL_SEC, U} from './timeline';
import {GameClips, Callout, WorkersCard, PhoneCTA, Header, Caption, PollCard, Confetti, GoalBar, Siren, Counter, LILITA, INTER, BoltIcon, FireIcon, SchoolIcon, WheelIcon, StadiumIcon} from './overlays';
import PPL from './people.json';
import CFG from './config.json';

const PUNCH_OLD = [1.62, 3.18, 5.74, 8.84, 10.06, 10.98, 12.08, 12.64, 13.4, 14.22, 15.78, 19.4, 21.28, 24.24, 25.22, 26.2, 27.56, 30.04, 32.2, 33.36, 33.94, 36.78, 38.5, 39.92, 43.02]
const st = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #111`, paintOrder: 'stroke fill'});

const Flash: React.FC<{t: number; t0: number; dur?: number; color?: string; max?: number}> = ({t, t0, dur = 0.35, color = '#ffffff', max = 0.9}) => {
  const k = ramp(t, t0, t0 + dur);
  if (t < t0 || k >= 1) return null;
  return <AbsoluteFill style={{background: color, opacity: max * (1 - k) * (Math.floor((t - t0) * 30) % 3 === 1 ? 0.4 : 1)}} />;
};

const VoteResult: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const row = (l: string, label: string, icon: React.ReactNode, win: boolean) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, background: win ? '#ffd21e' : '#eee', border: '6px solid #111', borderRadius: 30, padding: '12px 20px', opacity: win ? 1 : 0.55, transform: win ? `scale(${1 + 0.06 * Math.sin(t * 8)})` : undefined}}>
      <div style={{width: 80, height: 80, borderRadius: '50%', background: '#fff', border: '5px solid #111', fontFamily: LILITA, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{l}</div>
      <div style={{fontFamily: LILITA, fontSize: 60, flex: 1}}>{label}</div>
      <div style={{transform: 'scale(.8)'}}>{icon}</div>
      {win ? <div style={{fontFamily: LILITA, fontSize: 80, color: '#2d9a5a', ...st(8)}}>✓</div> : null}
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(-2deg)`}}>
      <div style={{width: 900, background: '#fff', borderRadius: 44, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{textAlign: 'center'}}><span style={{background: 'linear-gradient(90deg,#962fbf,#d62976,#fa7e1e)', color: '#fff', fontFamily: LILITA, fontSize: 42, padding: '6px 28px', borderRadius: 40}}>RESULTADO · 22ª VOTAÇÃO</span></div>
        {row('A', 'OFICINA 23%', <div style={{fontSize: 70}}>🔧</div>, false)}
        {row('B', 'BIBLIOTECA 77%', <div style={{fontSize: 70}}>📚</div>, true)}
      </div>
    </div>
  );
};

const Parcial: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const fa = 0.58 * easeOut(clamp((t - 35.7) / 0.6)), fb = 0.42 * easeOut(clamp((t - 37.12) / 0.6));
  const row = (l: string, label: string, icon: string, frac: number, pct: string, col: string, at: number) => (
    <div style={{position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 16, background: '#f3f3f3', border: '6px solid #111', borderRadius: 30, padding: '12px 20px'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${frac * 100}%`, background: col, opacity: 0.55}} />
      <div style={{position: 'relative', width: 76, height: 76, borderRadius: '50%', background: '#fff', border: '5px solid #111', fontFamily: LILITA, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{l}</div>
      <div style={{position: 'relative', fontFamily: LILITA, fontSize: 54, flex: 1}}>{label} {icon}</div>
      <div style={{position: 'relative', fontFamily: LILITA, fontSize: 70, transform: `scale(${pop(t, at, 0.3)})`}}>{pct}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k}) rotate(-2deg)`}}>
      <div style={{width: 920, background: '#fff', borderRadius: 44, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{textAlign: 'center'}}><span style={{background: 'linear-gradient(90deg,#962fbf,#d62976,#fa7e1e)', color: '#fff', fontFamily: LILITA, fontSize: 40, padding: '6px 26px', borderRadius: 40}}>PARCIAL · 23ª VOTAÇÃO</span></div>
        {row('A', 'FLIPERAMA', '🕹️', fa, '58%', '#2f6fd6', 35.7)}
        {row('B', 'PISTA DE SKATE', '🛹', fb, '42%', '#d62976', 37.12)}
        <div style={{textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 38, transform: `scale(${pop(t, 38.9, 0.3)})`}}>122 votos neste post · termina em 2 dias</div>
      </div>
      <div style={{marginTop: 26, fontFamily: LILITA, fontSize: 86, color: '#FFD21E', ...st(14), transform: `scale(${pop(t, 35.12, 0.3)}) rotate(-4deg)`}}>🔄 VIROU!</div>
    </div>
  );
};

const BigNum: React.FC<{t: number; items: [number, string][]}> = ({t, items}) => {
  let cur: [number, string] | null = null;
  for (const it of items) if (t >= it[0] && t < it[0] + 0.5) cur = it;
  if (!cur) return null;
  const k = pop(t, cur[0], 0.2);
  return (
    <div style={{position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', fontFamily: LILITA, fontSize: cur[1].length > 2 ? 260 : 380, color: '#FFD21E', ...st(26), textShadow: '0 18px 0 rgba(0,0,0,.4)', transform: `scale(${k * (1.25 - 0.25 * clamp((t - cur[0]) / 0.5))}) rotate(-4deg)`}}>{cur[1]}</div>
  );
};

/** the "city battery": likes / comments / reposts fill it */
const Battery: React.FC<{t: number; t0: number; t1: number; at: number[]}> = ({t, t0, t1, at}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const fill = 0.06 + 0.12 * easeOut(ramp(t, at[0], at[0] + 0.4)) + 0.22 * easeOut(ramp(t, at[1], at[1] + 0.4)) + 0.4 * easeOut(ramp(t, at[2], at[2] + 0.5)) + 0.2 * easeOut(ramp(t, at[3], at[3] + 0.8));
  const items: [string, string, string][] = [['❤️', 'CURTIU', '+1 W'], ['💬', 'COMENTOU', '+10 W'], ['🔁', 'REPUBLICOU', '+100 W']];
  const full = t > at[3] + 0.8;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`}}>
      <div style={{width: 860, background: '#fff', borderRadius: 44, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '22px 30px 26px'}}>
        <div style={{textAlign: 'center', fontFamily: LILITA, fontSize: 54}}>⚡ BATERIA DA CIDADE ⚡</div>
        <div style={{display: 'flex', alignItems: 'center', marginTop: 14}}>
          <div style={{flex: 1, height: 120, border: '8px solid #111', borderRadius: 26, position: 'relative', overflow: 'hidden', background: '#2a2f3a'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: full ? 'linear-gradient(90deg,#5ec26a,#b6f36a)' : 'linear-gradient(90deg,#ff8f1f,#ffd21e)'}} />
            {Array.from({length: 9}).map((_, i) => <div key={i} style={{position: 'absolute', left: `${(i + 1) * 10}%`, top: 0, bottom: 0, width: 5, background: 'rgba(0,0,0,.25)'}} />)}
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LILITA, fontSize: 60, color: '#fff', ...st(9)}}>{Math.round(fill * 100)}%</div>
          </div>
          <div style={{width: 26, height: 56, background: '#111', borderRadius: '0 10px 10px 0'}} />
        </div>
        {items.map(([e, l, w], i) => (
          <div key={l} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, transform: `scale(${pop(t, at[i], 0.3)})`, transformOrigin: 'left center'}}>
            <div style={{fontSize: 64}}>{e}</div>
            <div style={{fontFamily: LILITA, fontSize: 56, flex: 1}}>{l}</div>
            <div style={{fontFamily: LILITA, fontSize: 64, color: '#ff8f1f', ...st(6)}}>{w}</div>
          </div>
        ))}
      </div>
      {full ? <div style={{marginTop: 26, fontFamily: LILITA, fontSize: 84, color: '#FFD21E', ...st(13), transform: `scale(${pop(t, at[3] + 0.8, 0.3)}) rotate(-4deg)`}}>CIDADE 100% ACESA!</div> : null}
    </div>
  );
};

/** next episode's mayor: comment + repost raffle */
const MayorCard: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(${Math.sin(t * 2) * 0.8}deg)`}}>
      <div style={{width: 880, background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', borderRadius: 44, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '26px 30px', textAlign: 'center', color: '#fff'}}>
        <div style={{fontSize: 110, lineHeight: 1, transform: `translateY(${Math.sin(t * 6) * 6}px)`}}>👑</div>
        <div style={{fontFamily: LILITA, fontSize: 64, lineHeight: 1.05, marginTop: 6}}>PREFEITO DO<br />PRÓXIMO EPISÓDIO</div>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, marginTop: 18, background: '#fff', color: '#111', borderRadius: 26, padding: '10px 22px', border: '5px solid #111'}}>
          <div style={{width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#ffb347,#ff5f6d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 44, color: '#fff'}}>@</div>
          <div style={{fontFamily: LILITA, fontSize: 56}}>VOCÊ?</div>
        </div>
        <div style={{fontFamily: LILITA, fontSize: 46, marginTop: 18, color: '#FFD21E'}}>SORTEIO: 💬 COMENTA + 🔁 REPUBLICA</div>
      </div>
    </div>
  );
};

/** episode mayor reveal */
const EpMayorCard: React.FC<{t: number; t0: number; t1: number; name: string}> = ({t, t0, t1, name}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(-2deg)`}}>
      <div style={{background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', borderRadius: 36, border: '7px solid #111', boxShadow: '0 14px 0 rgba(0,0,0,.3)', padding: '14px 34px', textAlign: 'center', color: '#fff'}}>
        <div style={{fontFamily: LILITA, fontSize: 44, color: '#FFD21E'}}>👑 SORTEADO NOS COMENTÁRIOS</div>
        <div style={{fontFamily: INTER, fontWeight: 900, fontSize: name.length > 18 ? 46 : 54, marginTop: 4}}>@{name}</div>
      </div>
    </div>
  );
};

/** the roll call: comment PRESENTE + tag a friend */
const RollCall: React.FC<{t: number; t0: number; t1: number; at: number[]}> = ({t, t0, t1, at}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const row = (who: string, i: number) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, borderBottom: '4px solid #9cc7ff', padding: '12px 4px', transform: `scale(${pop(t, at[i], 0.3)})`, transformOrigin: 'left center'}}>
      <div style={{fontFamily: INTER, fontWeight: 900, fontSize: 46, flex: 1, color: '#1e3a8a'}}>{who}</div>
      <div style={{fontFamily: LILITA, fontSize: 50, background: '#5ec26a', color: '#fff', borderRadius: 18, padding: '4px 18px', border: '4px solid #111'}}>PRESENTE ✓</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k}) rotate(${Math.sin(t * 2) * 0.6}deg)`}}>
      <div style={{width: 860, background: '#fffdf2', borderRadius: 30, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '22px 34px 28px', borderLeft: '22px solid #e2483d'}}>
        <div style={{fontFamily: LILITA, fontSize: 60, textAlign: 'center'}}>📋 LISTA DE CHAMADA</div>
        {row('@você', 0)}
        {row('@seu_amigo', 1)}
        <div style={{fontFamily: LILITA, fontSize: 56, textAlign: 'center', marginTop: 18, color: '#d62976', transform: `scale(${pop(t, at[2], 0.3)})`}}>🏫 NA MESMA SALA!</div>
      </div>
      <div style={{marginTop: 22, fontFamily: LILITA, fontSize: 72, color: '#FFD21E', ...st(12), transform: `scale(${pop(t, at[0] + 0.1, 0.3)}) rotate(-3deg)`}}>COMENTA "PRESENTE" 👇</div>
    </div>
  );
};

const Bell: React.FC<{t: number}> = ({t}) => {
  const rt = t >= LOOP_AT ? t - LOOP_AT : t;
  if (rt > 1.45) return null;
  const sx = Math.sin(t * 70) * 10, rot = Math.sin(t * 55) * 6;
  return (
    <div style={{position: 'absolute', top: 1380, left: 0, right: 0, textAlign: 'center', fontFamily: LILITA, fontSize: 170, color: '#FFD21E', ...st(22), textShadow: '0 14px 0 rgba(0,0,0,.4)', transform: `translateX(${sx}px) rotate(${-6 + rot}deg) scale(${t >= LOOP_AT ? 1 : pop(t, 0, 0.2)})`}}>TRRRIM! 🔔</div>
  );
};

const Stamp: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t >= t1) return null;
  const k = clamp((t - t0) / 0.15);
  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${2.6 - 1.6 * easeOut(k)}) rotate(-14deg)`, opacity: k, fontFamily: LILITA, fontSize: 210, color: '#e2483d', border: '18px solid #e2483d', borderRadius: 30, padding: '0 40px', background: 'rgba(255,255,255,.85)', boxShadow: '0 16px 0 rgba(0,0,0,.3)'}}>FALTA!</div>
    </AbsoluteFill>
  );
};

const SH = (x: number) => (x >= 33.02 ? x + 9.65 : x);
const PUNCH_15 = [35.0, 36.92, 37.36, 39.16, 40.2, ...[0.58, 1.76, 3.74, 5.3, 7.2, 10.7, 12.4, 13.06, 13.96, 14.82, 15.72, 16.12, 18.6, 20.04, 20.98, 23.54, 25.22, 27.72, 28.38, 29.76, 31.64, 32.74, 34.03, 34.46, 36.66, 38.22, 41.16].map(SH)];

/** queue challenge */
const FilaCard: React.FC<{t: number; t0: number; t1: number; at: number[]}> = ({t, t0, t1, at}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const row = (n: string, who: string, tag: string, col: string, i: number) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '10px 6px', borderBottom: '4px dashed #ddd', transform: `scale(${pop(t, at[i], 0.3)})`, transformOrigin: 'left center'}}>
      <div style={{width: 64, height: 64, borderRadius: '50%', background: col, border: '5px solid #111', fontFamily: LILITA, fontSize: 40, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
      <div style={{fontFamily: INTER, fontWeight: 900, fontSize: 42, flex: 1}}>{who}</div>
      <div style={{fontFamily: LILITA, fontSize: 40, background: col, color: '#fff', borderRadius: 16, padding: '4px 14px', border: '4px solid #111'}}>{tag}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k}) rotate(${Math.sin(t * 2) * 0.6}deg)`}}>
      <div style={{width: 880, background: '#fff', borderRadius: 40, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '20px 30px 26px'}}>
        <div style={{fontFamily: LILITA, fontSize: 58, textAlign: 'center'}}>🎢 FILA DA MONTANHA-RUSSA</div>
        {row('1', '@você', '🔁 FUROU A FILA!', '#d62976', 1)}
        {row('2', '@você_também', '💬 COMENTOU FILA', '#2f6fd6', 0)}
        {row('3', '@seu_amigo', '❤️ CURTIU', '#2d9a5a', 0)}
        <div style={{fontFamily: LILITA, fontSize: 48, textAlign: 'center', marginTop: 16, color: '#d62976', transform: `scale(${pop(t, at[2], 0.3)})`}}>OS PRIMEIROS ANDAM NO PRÓXIMO EP! 🎢</div>
      </div>
      <div style={{marginTop: 22, fontFamily: LILITA, fontSize: 76, color: '#FFD21E', ...st(12), transform: `scale(${pop(t, at[0] + 0.1, 0.3)}) rotate(-3deg)`}}>COMENTA "FILA" 👇</div>
    </div>
  );
};

/** the real site screenshot: first resident inside the 3D city */
const SiteShot: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t >= t1) return null;
  const k = (t - t0) / (t1 - t0);
  const z = 1.0 + 0.55 * easeOut(clamp((t - 35.4) / 2.2));
  const ring = pop(t, 36.62, 0.35);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg,#1e1b4b,#d62976)'}}>
      <div style={{position: 'absolute', left: 140, top: 430, width: 800, height: 1060, borderRadius: 60, border: '14px solid #111', overflow: 'hidden', background: '#000', boxShadow: '0 24px 0 rgba(0,0,0,.35)', transform: `scale(${pop(t, t0, 0.35)}) rotate(${-2 + k * 2}deg)`}}>
        <Img src={staticFile('site_morador.png')} style={{position: 'absolute', left: 0, top: 0, width: 800, height: 1738, transform: `translateY(${-300 * easeOut(clamp((t - 33.4) / 1.6))}px) scale(${z})`, transformOrigin: '50% 53%'}} />
        {ring > 0 ? <div style={{position: 'absolute', left: 400 - 260, top: 927 - 300 - 70, width: 520, height: 140, borderRadius: 70, border: `10px solid #FFD21E`, boxShadow: '0 0 40px #FFD21E', transform: `scale(${ring * (1 + 0.05 * Math.sin(t * 8))})`, opacity: 0.95}} /> : null}
      </div>
    </AbsoluteFill>
  );
};

const PUNCH = [32.26, 32.92, 33.56, 34.22, 34.9, 35.38, 36.74, 38.78, ...[0.0, 0.96, 2.44, 4.22, 6.88, 8.72, 9.58, 10.32, 11.44, 12.46, 14.44, 15.74, 17.48, 17.96, 18.48, 20.3, 22.72, 23.22, 25.92, 27.42, 30.36, 30.86, 32.68, 34.06, 36.16].map((x) => (x >= 30.66 ? x + 10.14 : x))];

const Card: React.FC<{t: number; t0: number; t1: number; top?: number; children: React.ReactNode}> = ({t, t0, t1, top = 440, children}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k}) rotate(${Math.sin(t * 2) * 0.6}deg)`}}>{children}</div>;
};
const box: React.CSSProperties = {width: 880, background: '#fff', borderRadius: 40, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '22px 30px 26px', textAlign: 'center'};

/** new test version of the game: real screenshot + feature chips */
const GameNews: React.FC<{t: number; t0: number; t1: number; feats: [number, string][]}> = ({t, t0, t1, feats}) => {
  if (t < t0 || t >= t1) return null;
  const k = (t - t0) / (t1 - t0);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg,#0f3b35,#16a3a3 55%,#5ec26a)'}}>
      <div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', fontFamily: LILITA, fontSize: 104, color: '#FFD21E', ...st(16), transform: `scale(${pop(t, t0, 0.3)})`}}>NOVIDADE NO JOGO!</div>
      <div style={{position: 'absolute', top: 340, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: '#fff', border: '5px solid #111', borderRadius: 30, padding: '6px 26px', fontFamily: LILITA, fontSize: 44, transform: `scale(${pop(t, 26.7, 0.3)}) rotate(-3deg)`}}>🧪 VERSÃO NOVA · EM TESTES</div>
      </div>
      <div style={{position: 'absolute', left: 200, top: 440, width: 680, height: 860, borderRadius: 54, border: '14px solid #111', overflow: 'hidden', background: '#000', boxShadow: '0 24px 0 rgba(0,0,0,.35)', transform: `scale(${pop(t, t0 + 0.1, 0.35)}) rotate(${-2 + k * 4}deg)`}}>
        <Img src={staticFile('jogo_novo.webp')} style={{position: 'absolute', left: 0, top: 0, width: 680, height: 856, objectFit: 'cover', transform: `scale(${1.05 + 0.25 * k})`, transformOrigin: '50% 55%'}} />
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 1340, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16}}>
        {feats.map(([at, label], i) => (
          <div key={label} style={{fontFamily: LILITA, fontSize: 46, background: i % 2 ? '#ffd21e' : '#fff', border: '6px solid #111', borderRadius: 26, padding: '6px 20px', boxShadow: '0 8px 0 rgba(0,0,0,.3)', transform: `scale(${pop(t, at, 0.3)}) rotate(${i % 2 ? 3 : -3}deg)`}}>{label}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** jobs board: like + comment what you want to be + repost; more comments = more jobs */
const VagasCard: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const jobs: [number, string, string][] = [[32.26, '👑 PREFEITO', '#7a4fd0'], [32.92, '⚽ JOGADOR', '#2d9a5a'], [33.56, '🚒 BOMBEIRO', '#e2483d'], [34.22, '📚 PROFESSOR', '#2f6fd6']];
  const acts: [number, string][] = [[34.9, '❤️ CURTE'], [35.38, '💬 COMENTA O QUE QUER SER'], [36.74, '🔁 REPUBLICA']];
  const fill = 0.15 + 0.85 * easeOut(clamp((t - 37.5) / 2.4));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k}) rotate(${Math.sin(t * 2) * 0.5}deg)`}}>
      <div style={{width: 900, background: '#fff', borderRadius: 40, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '20px 28px 24px', textAlign: 'center'}}>
        <div style={{fontFamily: LILITA, fontSize: 58}}>📌 PAINEL DE VAGAS DA CIDADE</div>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 12}}>
          {jobs.map(([at, l, c]) => <div key={l} style={{fontFamily: LILITA, fontSize: 46, background: c, color: '#fff', border: '5px solid #111', borderRadius: 22, padding: '4px 18px', transform: `scale(${pop(t, at, 0.3)})`}}>{l}</div>)}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16}}>
          {acts.map(([at, l]) => <div key={l} style={{fontFamily: LILITA, fontSize: 48, background: '#ffd21e', border: '5px solid #111', borderRadius: 22, padding: '4px 0', transform: `scale(${pop(t, at, 0.3)})`}}>{l}</div>)}
        </div>
        <div style={{marginTop: 18, opacity: t > 37.4 ? 1 : 0}}>
          <div style={{fontFamily: LILITA, fontSize: 40}}>VAGAS ABERTAS NO PRÓXIMO EP</div>
          <div style={{marginTop: 8, height: 54, borderRadius: 28, border: '5px solid #111', background: '#eee', overflow: 'hidden', position: 'relative'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: 'linear-gradient(90deg,#5ec26a,#ffd21e,#fa7e1e)'}} />
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LILITA, fontSize: 34}}>💬 MAIS COMENTÁRIOS = MAIS VAGAS 📈</div>
          </div>
        </div>
      </div>
      <div style={{marginTop: 20, fontFamily: LILITA, fontSize: 70, color: '#FFD21E', ...st(12), transform: `scale(${pop(t, 35.4, 0.3)}) rotate(-3deg)`}}>COMENTA O QUE QUER SER 👇</div>
    </div>
  );
};

const PUNCH19 = [0.9, 3.36, 5.16, 7.6, 9.18, 9.84, 10.62, 11.92, 13.8, 16.14, 18.26, 18.94, 20.46, 22.72, 24.1, 25.12, 26.02, 27.17, 28.86, 31.52, 33.86, 35.96, 36.42, 38.58, 40.26, 42.84];

/** splash wipe when a wave hits the camera */
const WaveHit: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const k = ramp(t, t0, t0 + 0.5);
  if (t < t0 || k >= 1) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#bfeeff', opacity: 0.85 * (1 - k)}} />
      {Array.from({length: 16}).map((_, i) => {
        const a = (i / 16) * Math.PI * 2, d = easeOut(k) * (380 + (i % 3) * 160);
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * d - 45, top: 900 + Math.sin(a) * d - 60, width: 90, height: 120, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: i % 2 ? '#2fb5ff' : '#ffffff', border: '5px solid #111', opacity: 1 - k}} />;
      })}
    </AbsoluteFill>
  );
};

const PUNCH29 = [0.0, 1.18, 2.26, 3.4, 4.06, 4.86, 6.14, 6.95, 8.6, 10.04, 11.84, 13.34, 15.42, 16.24, 17.4, 18.82, 19.6, 21.3, 23.66, 24.5, 26.1, 27.24, 28.48, 30.0, 31.16, 32.0, 33.2, 35.12, 35.7, 37.12, 38.9, 40.28, 42.62, 44.02, 45.42, 46.32, 47.3, 49.66, 50.9, 52.12, 54.7];
const PUNCH28 = [0.0, 1.2, 2.16, 3.08, 5.42, 6.22, 7.0, 7.98, 8.9, 11.38, 13.66, 14.54, 16.04, 17.56, 18.02, 19.44, 20.64, 22.5, 24.04, 25.82, 27.16, 29.02, 30.58, 31.66, 33.94, 35.1, 36.52, 37.66, 38.72, 39.72, 41.58, 44.3, 46.76, 48.52, 49.76, 51.78, 53.02, 55.82];
const PUNCH27 = [3.0, 6.0, 8.95, 12.28, 13.7, 15.3, 17.74, 20.12, 22.58, 24.6, 25.4, 26.05, 27.0, 30.86, 33.9, 34.95, 36.95, 39.06, 40.46, 43.0, 46.44, 49.48, 51.08, 53.72, 55.76, 58.6, 59.56, 62.6];
const PUNCH26 = [2.18, 4.4, 5.28, 8.47, 9.5, 13.06, 14.54, 16.44, 17.52, 20.3, 21.48, 22.98, 24.16, 26.5, 27.98, 31.54, 32.84, 33.52, 34.26, 35.52, 37.38, 39.04, 41.68, 43.56, 44.58, 47.02, 49.6, 51.04, 54.6];
const PUNCH25 = [1.36, 2.96, 4.94, 7.82, 10.63, 11.82, 15.22, 16.7, 18.8, 20.08, 23.74, 25.3, 28.7, 30.44, 31.66, 32.5, 33.06, 35.04, 37.0, 38.0, 41.54, 42.8, 45.5];
const PUNCH24 = [2.0, 3.48, 5.44, 7.8, 12.16, 14.8, 16.98, 18.51, 21.64, 24.04, 25.5, 29.96, 31.64, 32.48, 33.1, 34.1, 34.94, 38.34, 41.06, 42.2, 43.52, 44.6, 45.76, 48.38, 49.7, 52.46];
const PUNCH23 = [0.54, 2.82, 5.96, 7.46, 9.12, 10.3, 12.64, 14.24, 16.02, 17.88, 19.18, 20.1, 24.66, 26.42, 28.28, 29.72, 31.56, 33.16, 34.88, 35.72, 37.16, 41.2, 42.24, 46.84, 48.42, 51.34];
const PUNCH22 = [1.18, 2.6, 5.26, 9.15, 10.76, 15.5, 17.08, 20.06, 21.7, 23.94, 25.86, 28.2, 29.12, 29.9, 31.44, 33.54, 34.08, 34.7, 35.82, 37.72, 39.9, 41.3, 43.96];
const PUNCH21 = [1.44, 4.38, 6.58, 8.78, 11.96, 12.62, 16.36, 17.54, 19.28, 20.02, 21.26, 22.1, 26.94, 28.82, 29.82, 31.16, 32.1, 34.02, 35.04, 36.98, 37.52, 38.14, 39.2, 41.6, 42.98, 45.34];
const Check: React.FC<{t: number; at: number; e: string; label: string}> = ({t, at, e, label}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, transform: `scale(${pop(t, at, 0.3)})`, transformOrigin: 'left center'}}>
    <div style={{fontSize: 54, width: 66, textAlign: 'center'}}>{e}</div>
    <div style={{fontFamily: LILITA, fontSize: 54, flex: 1, textAlign: 'left'}}>{label}</div>
    <div style={{fontFamily: LILITA, fontSize: 60, color: '#2d9a5a', ...st(5)}}>✓</div>
  </div>
);
/** residents counter: climbs while the camera flies down the avenue (followers = residents) */
const Moradores: React.FC<{t: number; t0: number; t1: number; to: number}> = ({t, t0, t1, to}) => {
  if (t < t0 || t > t1) return null;
  const e = easeOut(clamp((t - t0) / 2.6));
  const n = Math.round(to * (0.25 + 0.75 * e));
  const done = e >= 1;
  const k = pop(t, t0, 0.3) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const bump = done ? 1 + 0.14 * (1 - clamp((t - t0 - 2.6) / 0.35)) : 1 + 0.03 * Math.sin(t * 40);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k * bump}) rotate(-4deg)`}}>
      <div style={{fontFamily: LILITA, fontSize: 250, lineHeight: 0.9, color: '#FFD21E', ...st(24), textShadow: '0 16px 0 rgba(0,0,0,.4)'}}>{n.toLocaleString('pt-BR')}</div>
      <div style={{fontFamily: LILITA, fontSize: 92, color: '#fff', ...st(15), marginTop: -6}}>MORADORES!</div>
    </div>
  );
};
const Step: React.FC<{t: number; t0: number; t1: number; n: string; text: string; bg: string}> = ({t, t0, t1, n, text, bg}) => {
  if (t < t0 || t >= t1) return null;
  const k = pop(t, t0, 0.25);
  return (
    <div style={{position: 'absolute', top: 1400, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(-3deg)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, background: bg, border: '7px solid #111', borderRadius: 32, padding: '8px 30px 8px 12px', boxShadow: '0 10px 0 rgba(0,0,0,.35)'}}>
        <div style={{width: 86, height: 86, borderRadius: '50%', background: '#fff', border: '6px solid #111', fontFamily: LILITA, fontSize: 58, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
        <div style={{fontFamily: LILITA, fontSize: 62, color: '#fff', ...st(8), whiteSpace: 'nowrap'}}>{text}</div>
      </div>
    </div>
  );
};

const Bubble: React.FC<{name: string; text: string}> = ({name, text}) => (
  <div style={{display: 'flex', gap: 14, alignItems: 'flex-start', textAlign: 'left', background: '#1c1f26', borderRadius: 26, padding: '16px 20px', border: '5px solid #111', boxShadow: '0 12px 0 rgba(0,0,0,.35)'}}>
    <div style={{width: 74, height: 74, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#feda75,#d62976,#962fbf)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: INTER, fontWeight: 900, fontSize: 40}}>@</div>
    <div style={{fontFamily: INTER, color: '#fff'}}>
      <div style={{fontWeight: 900, fontSize: 36}}>{name}</div>
      <div style={{fontSize: 42, fontWeight: 600, marginTop: 4, lineHeight: 1.2}}>{text}</div>
    </div>
  </div>
);
const Names: React.FC<{t: number; t0: number; t1: number; title: string; names: string[]; bg: string}> = ({t, t0, t1, title, names, bg}) => {
  if (t < t0 || t >= t1) return null;
  const k = pop(t, t0, 0.3) * (1 - easeOut(ramp(t, t1 - 0.15, t1)));
  return (
    <div style={{position: 'absolute', top: 1330, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(-2deg)`}}>
      <div style={{width: 900, background: '#fff', border: '7px solid #111', borderRadius: 34, padding: '12px 22px 16px', boxShadow: '0 12px 0 rgba(0,0,0,.3)'}}>
        <div style={{textAlign: 'center'}}><span style={{background: bg, color: '#fff', fontFamily: LILITA, fontSize: 40, padding: '4px 22px', borderRadius: 30, border: '4px solid #111'}}>{title}</span></div>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 14px', marginTop: 10}}>
          {names.map((n, i) => <div key={n} style={{fontFamily: INTER, fontWeight: 900, fontSize: 32, transform: `scale(${pop(t, t0 + 0.1 + i * 0.08, 0.25)})`}}>@{n}</div>)}
        </div>
      </div>
    </div>
  );
};

/** quick roulette between two names, lands on the winner at `stop` */
const Roleta: React.FC<{t: number; t0: number; stop: number; t1: number; names: string[]; winner: string; title?: string; top?: number}> = ({t, t0, stop, t1, names, winner, title = '👑 DONA DA HAMBURGUERIA', top = 1180}) => {
  if (t < t0 || t >= t1) return null;
  const spinning = t < stop;
  const idx = spinning ? Math.floor((t - t0) * (14 - 10 * clamp((t - t0) / (stop - t0)))) % names.length : names.indexOf(winner);
  const k = pop(t, t0, 0.3);
  const win = !spinning;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${k * (win ? 1 + 0.1 * (1 - clamp((t - stop) / 0.3)) : 1)}) rotate(-2deg)`}}>
      <div style={{background: win ? '#ffd21e' : '#ffffff', border: '7px solid #111', borderRadius: 34, padding: '14px 34px', boxShadow: '0 12px 0 rgba(0,0,0,.35)', textAlign: 'center'}}>
        <div style={{fontFamily: LILITA, fontSize: 40}}>{win ? title : '🎲 SORTEANDO...'}</div>
        <div style={{fontFamily: INTER, fontWeight: 900, fontSize: 60, color: win ? '#e2483d' : '#111'}}>@{names[idx]}</div>
      </div>
    </div>
  );
};

/** still screenshots as full-screen clips (store sections) */
const ImgClips: React.FC<{t: number; clips: {src: string; t0: number; t1: number; zoom?: [number, number]; oy?: number}[]}> = ({t, clips}) => {
  const c = clips.find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const k = (t - c.t0) / (c.t1 - c.t0);
  const [z0, z1] = c.zoom ?? [1.0, 1.1];
  const z = z0 + (z1 - z0) * k + 0.08 * (1 - easeOut(clamp((t - c.t0) / 0.25)));
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#fdfaf2'}}>
      <Img src={staticFile(c.src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: '50% 86%', transform: `scale(${z})`}} />
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: Math.max(0, 1 - (t - c.t0) / 0.12) * 0.7}} />
    </div>
  );
};

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix29.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  const cut = ['intro', 'loop', 'hook'].includes(s.id) || s.id.startsWith('g_') ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH29) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const B0: Record<string, number> = {enquete: 50.25, parcial: 34.65};
  const blur = s.id in B0 ? 6 * easeOut(clamp((t - B0[s.id]) / 0.3)) : 0;
  const P = PPL as any;
  const rt = t >= LOOP_AT ? t - TOTAL_SEC : t;
  const bubble = (t0: number, t1: number, name: string, text: string, rot = -2) => (rt >= t0 && rt < t1 ? (
    <div style={{position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${pop(rt, t0, 0.3) * 0.86}) rotate(${rot}deg)`}}><div style={{width: 960}}><Bubble name={name} text={text} /></div></div>
  ) : null);
  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f4'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, filter: blur ? `blur(${blur}px) brightness(.85)` : undefined}}>
        <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 38, position: [0, 5, 10]}}>
          <Scene t={t} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.25) 100%)'}} />
      <ImgClips t={t} clips={[
        {src: 'l27_n_Video.png', t0: 40.2, t1: 44.6, zoom: [1.0, 1.12]},
        {src: 'l27_n1.png', t0: 44.6, t1: 47.28, zoom: [1.0, 1.12]},
        {src: 'l27_n_c2.png', t0: 47.28, t1: 49.3, zoom: [1.02, 1.08]},
      ]} />
      <Header t={t} />
      {/* hook: "vou parar de te seguir... queria ser médica" */}
      {bubble(-0.6, 4.0, 'agatha.sophya24', 'Vou parar de te seguir você nunca me escolhe queria ser médica')}
      <Flash t={t} t0={4.06} dur={0.3} color="#ffffff" max={0.85} />
      <Callout t={t} t0={4.1} t1={6.95} text="🩺 PEDIDO REALIZADO!" top={1400} rot={-3} size={74} bg="#ffffff" />
      <Confetti t={t} t0={4.6} />
      <Moradores t={t} t0={7.9} t1={10.85} to={(CFG as any).seguidores} />
      <Names t={t} t0={11.84} t1={12.5} title="😬 SÓ COMENTARAM" names={['meu_deily_alee09', 'gabrielle__correa22']} bg="#8d8478" />
      <Names t={t} t0={13.34} t1={14.0} title="🏠 SEGUIRAM = CASA LEGAL" names={P.casa_legal_ep29} bg="#2f6fd6" />
      <Card t={t} t0={14.05} t1={16.2} top={1180}>
        <div style={{...box, width: 760, padding: '14px 26px'}}>
          <Check t={t} at={14.28} e="💬" label="COMENTOU" />
          <Check t={t} at={14.96} e="❤️" label="CURTIU" />
          <Check t={t} at={15.42} e="🔁" label="REPUBLICOU" />
        </div>
      </Card>
      <Callout t={t} t0={16.24} t1={17.35} text="✨ DESEJO REALIZADO!" top={1400} rot={-3} size={70} bg="#ffd21e" />
      <Confetti t={t} t0={16.5} />
      <Callout t={t} t0={17.45} t1={19.4} text="😭 → 😍 HOJE EU ESCOLHI!" top={1400} rot={3} size={66} bg="#ff9fd0" />
      {bubble(19.45, 21.15, 'lorennasoph_348', 'quero ser a irmã da rainhaaaaa fiz tudoo')}
      {bubble(21.25, 24.15, 'mahhdilvass', 'Quero ser uma vozinha gente boa que todo mundo gosta (fiz tudo)', 2)}
      {bubble(24.25, 27.0, 'adrian179439', 'Eu não quero ser capivara, eu quero ter o poder de campo de força e invisibilidade 😍 eu também fiz tudo!')}
      {bubble(27.1, 29.65, 'talvez_valentina', 'Eu quero ser um gato com bigode que é veterinário', 2)}
      {bubble(29.75, 31.7, 'miguel.ph16', 'EUUUUUUUUU quero um campo de futebol fiz tudoooooo')}
      {bubble(31.8, 34.55, 'moranga_6', 'Você nunca escolhe a mim eu quero ser a mais bonita da cidade... a minha casa quero uma mansão por favor', 2)}
      <Confetti t={t} t0={32.2} />
      <Parcial t={t} t0={34.7} t1={40.15} />
      {/* store: wish first */}
      {t >= 40.28 && t < 44.6 ? (
        <div style={{position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 40.28, 0.3)}) rotate(-2deg)`}}>
          <div style={{...box, width: 920, padding: '16px 26px'}}>
            <div style={{fontFamily: LILITA, fontSize: 62}}>🌟 PEÇA O SEU DESEJO!</div>
            <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 36, marginTop: 6, transform: `scale(${pop(t, 42.6, 0.3)})`}}>📹 "Pedido no vídeo": ele aparece num próximo vídeo do @cidade_do_insta</div>
            <div style={{marginTop: 10, display: 'flex', gap: 12, justifyContent: 'center', transform: `scale(${pop(t, 43.6, 0.3)})`}}>
              <span style={{background: '#14110c', color: '#ffd21e', fontFamily: LILITA, fontSize: 36, padding: '4px 16px', borderRadius: 18, border: '4px solid #111'}}>5 vagas por semana</span>
              <span style={{background: '#ffd21e', color: '#111', fontFamily: LILITA, fontSize: 36, padding: '4px 16px', borderRadius: 18, border: '4px solid #111'}}>sai em até 14 dias</span>
            </div>
          </div>
        </div>
      ) : null}
      <Callout t={t} t0={44.64} t1={47.28} text="🏠 ESCOLHA A SUA CASA COM SEU @" top={300} rot={-3} size={54} bg="#ffd21e" />
      {t >= 47.3 && t < 49.3 ? (
        <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${pop(t, 47.3, 0.3)}) rotate(-3deg)`}}>
          <div style={{background: '#ff3040', color: '#fff', fontFamily: LILITA, fontSize: 76, padding: '10px 34px', borderRadius: 34, border: '7px solid #111', boxShadow: '0 12px 0 rgba(0,0,0,.35)', textAlign: 'center', lineHeight: 1.05}}>⏰ PREÇO DE LANÇAMENTO<br />SÓ ATÉ 30/11</div>
          <div style={{marginTop: 14, background: '#fff', fontFamily: INTER, fontWeight: 800, fontSize: 30, padding: '6px 20px', borderRadius: 18, border: '4px solid #111'}}>compras opcionais · desejos nos comentários continuam grátis</div>
        </div>
      ) : null}
      <PhoneCTA t={t} t0={49.3} t1={50.25} tap={49.66} label="🛒 LINK NA BIO!" />
      <PollCard t={t} t0={50.3} t1={53.95} />
      <Callout t={t} t0={54.3} t1={55.95} text="💉 INJEÇÃO!" top={1440} rot={-4} size={80} bg="#ffffff" />
      <Flash t={t} t0={54.7} dur={0.4} color="#ffffff" max={0.8} />
      <Caption t={t} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
