import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, getRemotionEnvironment} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, FPS} from './timeline';
import {Header, Caption, FollowCard, CommentCard, LikeHeart, PollCard, FlavorCard, Confetti} from './overlays';

const PUNCH = [0.58, 5.9, 11.48, 15.7, 18.94, 23.46];

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix3.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  // zoom-in on every cut (not on the loop seam)
  const cut = s.id === 'cala' || s.id === 'loop' ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const blur = s.id === 'enquete' ? 7 * easeOut(ramp(t, 21.1, 21.35)) : 0;
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
      <FlavorCard t={t} t0={0.15} t1={2.4} kind="cala" letter="" label="CALABRESA" />
      <PollCard t={t} t0={21.1} t1={22.15} />
      <FollowCard t={t} t0={22.2} t1={23.45} tap={22.6} />
      <Caption t={t} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
