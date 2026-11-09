import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, pop, FPS, LOOP_AT, U} from './timeline';
import {GameClips, Callout, WorkersCard, PhoneCTA, Header, Caption, PollCard, Confetti, GoalBar, Siren, Counter, LILITA, INTER, BoltIcon, FireIcon, SchoolIcon, WheelIcon, StadiumIcon} from './overlays';
import PPL from './people.json';

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
        <div style={{textAlign: 'center'}}><span style={{background: 'linear-gradient(90deg,#962fbf,#d62976,#fa7e1e)', color: '#fff', fontFamily: LILITA, fontSize: 42, padding: '6px 28px', borderRadius: 40}}>RESULTADO · 17ª VOTAÇÃO</span></div>
        {row('A', 'ZOOLÓGICO 67%', <div style={{fontSize: 70}}>🦁</div>, true)}
        {row('B', 'PISTA DE SKATE 33%', <div style={{fontSize: 70}}>🛹</div>, false)}
      </div>
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

const PUNCH20 = [0.3, 2.1, 6.1, 6.92, 7.64, 9.06, 10.42, 13.08, 14.26, 17.2, 22.4, 23.16, 23.78, 24.58, 25.52, 27.28, 31.04, 31.58, 32.2, 33.28, 37.0, 40.7, 41.9, 44.54];
const Check: React.FC<{t: number; at: number; e: string; label: string}> = ({t, at, e, label}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, transform: `scale(${pop(t, at, 0.3)})`, transformOrigin: 'left center'}}>
    <div style={{fontSize: 54, width: 66, textAlign: 'center'}}>{e}</div>
    <div style={{fontFamily: LILITA, fontSize: 52, flex: 1}}>{label}</div>
    <div style={{fontFamily: LILITA, fontSize: 60, color: '#2d9a5a', ...st(5)}}>✓</div>
  </div>
);
const Bubble: React.FC<{name: string; text: string}> = ({name, text}) => (
  <div style={{display: 'flex', gap: 14, alignItems: 'flex-start', textAlign: 'left', background: '#1c1f26', borderRadius: 26, padding: '16px 20px', border: '5px solid #111'}}>
    <div style={{width: 74, height: 74, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#feda75,#d62976,#962fbf)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: INTER, fontWeight: 900, fontSize: 40}}>@</div>
    <div style={{fontFamily: INTER, color: '#fff'}}>
      <div style={{fontWeight: 900, fontSize: 36}}>{name}</div>
      <div style={{fontSize: 42, fontWeight: 600, marginTop: 4}}>{text}</div>
    </div>
  </div>
);
const Win: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = clamp((t - t0) / 0.15);
  return (
    <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: `scale(${2.2 - 1.2 * easeOut(k)}) rotate(-8deg)`, opacity: k, fontFamily: LILITA, fontSize: 150, color: '#FFD21E', ...st(20), textShadow: '0 12px 0 rgba(0,0,0,.4)'}}>🏰 MANSÃO!</div>
    </div>
  );
};

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix20.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  const cut = ['hook', 'loop', 'let'].includes(s.id) || s.id.startsWith('g_') ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH20) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const B0: Record<string, number> = {deu: 2.2, enquete: 39.12};
  const blur = s.id in B0 ? 6 * easeOut(clamp((t - B0[s.id]) / 0.3)) : 0;
  const P = PPL as any;
  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f4'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, filter: blur ? `blur(${blur}px) brightness(.85)` : undefined}}>
        <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 38, position: [0, 5, 10]}}>
          <Scene t={t} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.25) 100%)'}} />
      <GameClips t={t} clips={[{src: 'g_tycoon.webm', t0: 34.6, t1: 36.48, from: 9, zoom: [1.05, 1.18]}]} />
      <Header t={t} />
      <Callout t={t} t0={0.3} t1={2.0} text="🦁 ROOOAR!" top={1440} rot={-5} size={92} bg="#ff8f1f" />
      <VoteResult t={t} t0={2.2} t1={3.38} />
      <Confetti t={t} t0={2.3} />
      <Callout t={t} t0={3.5} t1={5.86} text="👀 OLHA O QUE ACONTECEU..." top={1480} rot={3} size={56} />
      {/* proof: lara */}
      <Card t={t} t0={5.86} t1={10.3} top={400}>
        <div style={{...box, padding: '20px 26px'}}>
          <div style={{fontFamily: LILITA, fontSize: 52}}>📸 A PROVA</div>
          <div style={{display: 'flex', gap: 18, marginTop: 12, alignItems: 'flex-start'}}>
            <div style={{flex: 1}}>
              <Bubble name="laracarvalho190" text="Euuuu" />
              <Check t={t} at={6.1} e="❤️" label="CURTIU" />
              <Check t={t} at={6.92} e="💬" label="COMENTOU" />
              <Check t={t} at={7.64} e="🔁" label="REPUBLICOU" />
              <Check t={t} at={9.06} e="📸" label="MANDOU PRINT" />
            </div>
            <div style={{display: 'flex', gap: 8, transform: `scale(${pop(t, 8.62, 0.3)})`}}>
              <Img src={staticFile('print_lara1.png')} style={{width: 150, borderRadius: 14, border: '5px solid #111', transform: 'rotate(-4deg)'}} />
              <Img src={staticFile('print_lara2.png')} style={{width: 150, borderRadius: 14, border: '5px solid #111', transform: 'rotate(4deg)'}} />
            </div>
          </div>
        </div>
      </Card>
      <Win t={t} t0={10.42} t1={11.32} />
      <Confetti t={t} t0={10.42} />
      <Callout t={t} t0={10.6} t1={11.32} text="@laracarvalho190 ✅" top={1300} rot={-3} size={62} bg="#ffffff" />
      {/* let */}
      <Card t={t} t0={11.4} t1={13.0} top={460}>
        <div style={{width: 900}}><Bubble name="let_noglima" text="Primeiraaa fiz tudo posso ter uma mansão?" /></div>
        <div style={{marginTop: 18, fontFamily: LILITA, fontSize: 70, color: '#FFD21E', ...st(12), transform: `scale(${pop(t, 12.16, 0.3)}) rotate(-3deg)`}}>FEZ TUDO? ENTÃO...</div>
      </Card>
      <Win t={t} t0={13.08} t1={13.68} />
      <Confetti t={t} t0={13.08} />
      <Callout t={t} t0={13.1} t1={13.68} text="@let_noglima ✅" top={1300} rot={3} size={62} bg="#ffffff" />
      <Callout t={t} t0={14.4} t1={16.98} text={`🏠 +${P.casas_ep20.length} CASAS NOVAS!`} top={1480} rot={-3} size={64} />
      <EpMayorCard t={t} t0={17.5} t1={20.76} name={P.prefeito_ep20} />
      <Callout t={t} t0={19.74} t1={20.76} text="🦁 DE SAFÁRI!" top={1100} rot={4} size={64} bg="#c9a86a" />
      <Callout t={t} t0={20.9} t1={22.4} text="🧱 MODO LEGO!" top={1480} rot={-4} />
      <Confetti t={t} t0={26.24} />
      <WorkersCard t={t} t0={27.28} t1={29.06} names={P.tratadores} title="TRATADORES DO ZOO" roles={['EQUIPE DO ZOO', 'EQUIPE DO ZOO', 'EQUIPE DO ZOO']} color="#5c7a3a" />
      {/* how to win a mansion */}
      <Card t={t} t0={29.2} t1={34.6} top={420}>
        <div style={{...box, padding: '20px 30px'}}>
          <div style={{fontFamily: LILITA, fontSize: 56}}>🏰 COMO GANHAR MANSÃO</div>
          <Check t={t} at={31.04} e="❤️" label="CURTE" />
          <Check t={t} at={31.58} e="💬" label="COMENTA" />
          <Check t={t} at={32.2} e="🔁" label="REPUBLICA" />
          <Check t={t} at={33.28} e="📸" label="MANDA O PRINT AQUI" />
        </div>
        <div style={{marginTop: 20, fontFamily: LILITA, fontSize: 64, color: '#FFD21E', ...st(12), transform: `scale(${pop(t, 33.8, 0.3)}) rotate(-3deg)`}}>= MANSÃO NO PRÓXIMO EP!</div>
      </Card>
      <PhoneCTA t={t} t0={34.6} t1={36.48} tap={35.66} label="🎮 JOGO NA BIO!" />
      <GoalBar t={t} t0={36.56} t1={39.06} cur={9845} goal={10000} />
      <PollCard t={t} t0={39.15} t1={42.8} />
      <Siren t={t} t0={44.48} t1={LOOP_AT} text="O LEÃO FUGIU!" />
      <Caption t={t} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
