import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, getRemotionEnvironment} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, FPS} from './timeline';
import {Header, Caption, FollowCard, CommentCard, LikeHeart, PollCard, FlavorCard, Confetti} from './overlays';

const PUNCH = [2.3, 5.1, 6.5, 9.5, 11.26, 15.98, 20.9, 22.08, 26.84];

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix2.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  // zoom-in on every cut (not on the loop seam)
  const cut = s.id === 'aerial' || s.id === 'loop' ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const blur = ['calabresa', 'frango', 'enquete'].includes(s.id) ? 7 * easeOut(ramp(t, 20.4, 20.7)) : 0;
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
      <Confetti t={t} t0={2.25} />
      <Confetti t={t} t0={11.3} />
      <CommentCard t={t} t0={14.4} t1={16.6} />
      <FlavorCard t={t} t0={20.45} t1={21.7} kind="cala" letter="A" label="CALABRESA" />
      <FlavorCard t={t} t0={21.7} t1={23.2} kind="frango" letter="B" label="FRANGO" />
      <PollCard t={t} t0={23.2} t1={24.65} />
      <FollowCard t={t} t0={24.7} t1={26.25} tap={25.1} />
      <LikeHeart t={t} t0={26.2} t1={26.84} tap={26.44} />
      <Caption t={t} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
