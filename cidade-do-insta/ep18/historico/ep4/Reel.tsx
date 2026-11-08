import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, getRemotionEnvironment} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, FPS} from './timeline';
import {Raffle, Rules} from './overlays';
import {Header, Caption, FollowCard, CommentCard, LikeHeart, PollCard, FlavorCard, Confetti} from './overlays';

const PUNCH = [0.58, 7.1, 9.78, 15.78, 20.84, 23.92, 31.12, 34.74, 36.02, 38.04];

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix4c.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  // zoom-in on every cut (not on the loop seam)
  const cut = s.id === 'casas' || s.id === 'loop' ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const B0: Record<string, number> = {sorteio: 21.4, regra: 26.5, enquete: 30.4, letra: 30.4};
  const blur = s.id in B0 ? 7 * easeOut(clamp((t - B0[s.id]) / 0.3)) : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f4'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, filter: blur ? `blur(${blur}px) brightness(.85)` : undefined}}>
        <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 38, position: [0, 5, 10]}}>
          <Scene t={t} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* soft vignette for text legibility */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.25) 100%)'}} />
      <Header t={t} />
      <Confetti t={t} t0={0.6} />
      <Confetti t={t} t0={8.1} />
      <FollowCard t={t} t0={16.4} t1={18.3} tap={17.88} />
      <Raffle t={t} t0={21.5} tStop={23.92} t1={25.0} />
      <Confetti t={t} t0={23.95} />
      <Rules t={t} t0={27.4} t1={30.4} />
      <PollCard t={t} t0={31.1} t1={38.04} />
      <Caption t={t} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
