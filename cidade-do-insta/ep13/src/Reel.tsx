import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, pop, FPS, LOOP_AT, U} from './timeline';
import {GameClips, Callout, WorkersCard, PhoneCTA, Header, Caption, PollCard, Confetti, GoalBar, LILITA, INTER, BoltIcon, FireIcon} from './overlays';
import PPL from './people.json';

const PUNCH = [1.28, 2.62, 4.16, 6.4, 7.6, 8.84, 9.66, 10.52, 11.54, 14.88, 18.56, 18.82, 19.08, 19.6, 21.88, 23.04, 24.58, 27.12, 31.62, 33.92, 35.7, 36.24, 39.48, 41.5, 42.84, 44.78, 45.76];
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
        <div style={{textAlign: 'center'}}><span style={{background: 'linear-gradient(90deg,#962fbf,#d62976,#fa7e1e)', color: '#fff', fontFamily: LILITA, fontSize: 42, padding: '6px 28px', borderRadius: 40}}>RESULTADO · 10ª VOTAÇÃO</span></div>
        {row('A', 'USINA DE ENERGIA', <BoltIcon />, true)}
        {row('B', 'BOMBEIROS', <FireIcon />, false)}
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

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix13.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  const cut = ['escuro', 'loop'].includes(s.id) || s.id.startsWith('g_') ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const B0: Record<string, number> = {deu: 3.4, desafio: 21.1, prefeito: 29.88, bio: 38.4, enquete: 39.6};
  const blur = s.id in B0 ? 6 * easeOut(clamp((t - B0[s.id]) / 0.3)) : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#0e1a3a'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, filter: blur ? `blur(${blur}px) brightness(.8)` : undefined}}>
        <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 38, position: [0, 5, 10]}}>
          <Scene t={t} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.3) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.25) 100%)'}} />
      <GameClips t={t} clips={[{src: 'g_search.mp4', t0: 33.1, t1: 36.2, from: 0.3, rate: 1.05, zoom: [1.05, 1.18]}]} />
      {/* lightning */}
      <Flash t={t} t0={0.3} dur={0.25} color="#cfe6ff" max={0.35} />
      <Flash t={t} t0={U.BOLT} dur={0.45} color="#ffffff" max={0.95} />
      <Flash t={t} t0={LOOP_AT + 0.3} dur={0.25} color="#cfe6ff" max={0.35} />
      <Header t={t} />
      <VoteResult t={t} t0={3.4} t1={5.6} />
      <Confetti t={t} t0={5.0} />
      <Callout t={t} t0={7.6} t1={8.34} text="🏗️ OBRA COMEÇOU!" top={1480} rot={-4} />
      <Confetti t={t} t0={12.7} />
      <WorkersCard t={t} t0={14.3} t1={17.08} names={(PPL as any).power} title="TRABALHADORES DA USINA" roles={['CHEFE DA USINA', 'ELETRICISTA', 'TÉCNICO']} color="#ff8f1f" />
      <BigNum t={t} items={[[18.56, '3'], [18.82, '2'], [19.08, '1']]} />
      <Flash t={t} t0={U.LIGHT} dur={0.5} color="#ffe27a" max={0.85} />
      <Confetti t={t} t0={19.7} />
      <Battery t={t} t0={21.1} t1={26.32} at={[21.22, 22.42, 23.82, 25.14]} />
      <GoalBar t={t} t0={26.4} t1={29.88} cur={9388} goal={10000} />
      <MayorCard t={t} t0={30.0} t1={33.1} />
      <Callout t={t} t0={33.2} t1={34.5} text="🍀 SEM DEPENDER DA SORTE" top={1320} rot={-4} size={52} />
      <Callout t={t} t0={35.0} t1={36.2} text="🔍 COLOCA SEU @" top={1480} rot={4} />
      <Callout t={t} t0={36.9} t1={38.4} text="👑 KIT PREFEITO NO SITE" top={1480} rot={-3} size={54} bg="#5ec26a" />
      <PhoneCTA t={t} t0={38.4} t1={39.48} tap={38.95} label="ENTROU NA CIDADE! 🏙️" />
      <PollCard t={t} t0={39.6} t1={45.28} />
      <Callout t={t} t0={44.3} t1={45.28} text="👥 MARCA UM AMIGO!" top={1500} rot={4} bg="#ff7aa8" />
      <Callout t={t} t0={46.0} t1={LOOP_AT} text="🔌 DESLIGOU!" top={1460} rot={-4} size={80} />
      <Caption t={t} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
