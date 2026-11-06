import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, pop, FPS, LOOP_AT, U} from './timeline';
import {GameClips, Callout, WorkersCard, PhoneCTA, Header, Caption, PollCard, Confetti, GoalBar, LILITA, INTER, BoltIcon, FireIcon, SchoolIcon} from './overlays';
import PPL from './people.json';

const PUNCH = [1.62, 3.18, 5.74, 8.84, 10.06, 10.98, 12.08, 12.64, 13.4, 14.22, 15.78, 19.4, 21.28, 24.24, 25.22, 26.2, 27.56, 30.04, 32.2, 33.36, 33.94, 36.78, 38.5, 39.92, 43.02]
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
        <div style={{textAlign: 'center'}}><span style={{background: 'linear-gradient(90deg,#962fbf,#d62976,#fa7e1e)', color: '#fff', fontFamily: LILITA, fontSize: 42, padding: '6px 28px', borderRadius: 40}}>RESULTADO · 11ª VOTAÇÃO</span></div>
        {row('A', 'BOMBEIROS 43%', <FireIcon />, false)}
        {row('B', 'ESCOLA 57%', <SchoolIcon />, true)}
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

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix14.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  const cut = ['sinal', 'loop'].includes(s.id) || s.id.startsWith('g_') ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const B0: Record<string, number> = {deu: 3.0, chamada: 23.44, prefeito: 28.14, bio: 35.5, enquete: 36.9};
  const blur = s.id in B0 ? 6 * easeOut(clamp((t - B0[s.id]) / 0.3)) : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f4'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, filter: blur ? `blur(${blur}px) brightness(.85)` : undefined}}>
        <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 38, position: [0, 5, 10]}}>
          <Scene t={t} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.25) 100%)'}} />
      <GameClips t={t} clips={[{src: 'g_search.mp4', t0: 31.64, t1: 34.52, from: 0.3, rate: 1.05, zoom: [1.05, 1.18]}]} />
      <Header t={t} />
      <Bell t={t} />
      <VoteResult t={t} t0={3.0} t1={5.2} />
      <Confetti t={t} t0={3.3} />
      <EpMayorCard t={t} t0={5.74} t1={8.58} name={(PPL as any).prefeito_ep14} />
      <Callout t={t} t0={9.3} t1={10.06} text="🧱 MODO LEGO!" top={1480} rot={-4} />
      <WorkersCard t={t} t0={14.3} t1={16.74} names={(PPL as any).teachers} title="PROFESSORES DA ESCOLA" roles={['DIRETORA', 'PROFESSOR', 'PROFESSOR']} color="#2f6fd6" />
      <Confetti t={t} t0={16.8} />
      <GoalBar t={t} t0={17.0} t1={20.26} cur={9476} goal={10000} />
      <Callout t={t} t0={20.5} t1={23.44} text="👑 DONO DO SHOPPING: SORTEIO NOS 10 MIL" top={1480} rot={-3} size={44} />
      <RollCall t={t} t0={23.6} t1={28.14} at={[25.22, 26.2, 27.56]} />
      <MayorCard t={t} t0={28.3} t1={31.64} />
      <Callout t={t} t0={32.2} t1={34.52} text="🔍 COLOCA SEU @" top={1480} rot={4} />
      <Callout t={t} t0={34.6} t1={35.5} text="👑 KIT PREFEITO NO SITE" top={1480} rot={-3} size={54} bg="#5ec26a" />
      <PhoneCTA t={t} t0={35.5} t1={36.78} tap={36.0} label="ENTROU NA CIDADE! 🏙️" />
      <PollCard t={t} t0={36.9} t1={42.16} />
      <Stamp t={t} t0={43.02} t1={LOOP_AT} />
      <Caption t={t} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
