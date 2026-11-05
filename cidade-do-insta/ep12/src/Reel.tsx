import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, FPS, LOOP_AT} from './timeline';
import {GameClips, Callout, Rules, Counter, WorkersCard, Siren, PhoneCTA, Header, Caption, PollCard, Confetti, LILITA} from './overlays';
import PPL from './people.json';

const PUNCH = [0.82, 1.9, 2.88, 3.94, 5.9, 6.26, 6.78, 7.08, 7.48, 7.9, 9.0, 11.54, 12.55, 14.92, 15.4, 16.3, 20.22, 21.72, 23.28, 24.92, 27.08];

/** "senão a cidade fica no escuro": the lights go out */
const Blackout: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t >= t1) return null;
  const k = easeOut(ramp(t, t0, t0 + 0.25));
  const flick = t < t0 + 0.4 && Math.floor(t * 20) % 2 ? 0.5 : 1;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 44%, rgba(5,8,30,${0.55 * k * flick}) 0%, rgba(2,3,12,${0.95 * k * flick}) 55%)`}}>
      <div style={{position: 'absolute', top: 1420, left: 0, right: 0, textAlign: 'center', fontFamily: LILITA, fontSize: 96, color: '#FFD21E', WebkitTextStroke: '14px #111', paintOrder: 'stroke fill', transform: `scale(${easeOut(ramp(t, t0 + 0.15, t0 + 0.4))}) rotate(-4deg)`}}>🔌 SEM LUZ!</div>
    </AbsoluteFill>
  );
};

/** blue water splash wipe on the vote result */
const Splash: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const k = ramp(t, t0, t0 + 0.55);
  if (k <= 0 || k >= 1) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 18}).map((_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const d = easeOut(k) * (420 + (i % 3) * 140);
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * d - 40, top: 760 + Math.sin(a) * d - 55, width: 80, height: 110, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: i % 2 ? '#2fb5ff' : '#9fe6ff', border: '5px solid #111', opacity: 1 - k, transform: `rotate(${(a * 180) / Math.PI + 90}deg)`}} />;
      })}
      <AbsoluteFill style={{background: '#7fd8ff', opacity: 0.55 * (1 - k)}} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix12.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  // zoom-in on every cut (not on the loop seam / hook)
  const cut = ['pedra', 'sobe', 'loop'].includes(s.id) || s.id.startsWith('g_') ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const B0: Record<string, number> = {curte: 14.92, bio: 20.5, enquete: 21.9};
  const blur = s.id in B0 ? 7 * easeOut(clamp((t - B0[s.id]) / 0.3)) : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f4'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, filter: blur ? `blur(${blur}px) brightness(.85)` : undefined}}>
        <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 38, position: [0, 5, 10]}}>
          <Scene t={t} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.25) 100%)'}} />
      <GameClips t={t} clips={[{src: 'g_search.mp4', t0: 17.0, t1: 20.5, from: 0.3, rate: 1.0, zoom: [1.05, 1.18]}]} />
      <Blackout t={t} t0={27.08} t1={LOOP_AT} />
      <Header t={t} />
      {/* hook */}
      <Siren t={t} t0={0.82} t1={2.44} text="🚨 CIDADE NOVA!" top={1460} />
      <Splash t={t} t0={0.82} />
      <Callout t={t} t0={2.88} t1={3.56} text="🛣️ AVENIDAS" top={1480} rot={-4} />
      <Callout t={t} t0={3.94} t1={4.9} text="🏘️ QUARTEIRÕES" top={1480} rot={4} />
      {/* the vote */}
      <Splash t={t} t0={9.0} />
      <Counter t={t} t0={9.3} t1={10.24} to={66} suffix="%" label="DEU ÁGUA! 💧" color="#5fd0ff" />
      <Confetti t={t} t0={10.3} />
      <Callout t={t} t0={11.0} t1={12.0} text="💧 ÁGUA NA CIDADE TODA" top={1480} rot={-3} size={54} bg="#7fdcff" />
      <WorkersCard t={t} t0={12.15} t1={13.58} names={(PPL as any).water} title="FUNCIONÁRIOS DA ÁGUA" roles={['CHEFE DA ESTAÇÃO', 'OPERAÇÃO', 'MANUTENÇÃO']} color="#1677c9" />
      <Callout t={t} t0={13.9} t1={14.92} text="🏠 SEU @ NA PLACA" top={1480} rot={4} />
      {/* CTA */}
      <Rules t={t} t0={14.92} t1={17.0} title="PRA APARECER NA CIDADE:" items={['CURTIR ❤️', 'REPUBLICAR 🔁', 'COMENTAR 💬']} at={[14.95, 15.42, 16.32]} />
      <Callout t={t} t0={17.6} t1={20.5} text="🔍 DIGITA SEU @" top={1320} rot={-4} />
      <Callout t={t} t0={19.1} t1={20.5} text="🟢 AO VIVO" top={1490} rot={5} bg="#5ec26a" />
      <PhoneCTA t={t} t0={20.5} t1={21.72} tap={21.1} label="ENTROU NA CIDADE! 🏙️" />
      <PollCard t={t} t0={21.9} t1={26.32} />
      <Caption t={t} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
