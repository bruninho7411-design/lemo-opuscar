import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, getRemotionEnvironment} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, FPS} from './timeline';
import {Raffle, Rules, Counter, CourseCard, WorkersCard, Siren, GoalBar} from './overlays';
import PPL from './people.json';
import {Header, Caption, FollowCard, CommentCard, LikeHeart, PollCard, FlavorCard, Confetti} from './overlays';

const PUNCH = [0.0, 2.42, 3.5, 5.68, 9.28, 13.06, 19.2, 24.74, 25.8, 28.38, 30.68];

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix7.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  // zoom-in on every cut (not on the loop seam)
  const cut = s.id === 'hook' || s.id === 'loop' ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const B0: Record<string, number> = {dono: 10.8, enquete: 23.9, letra: 23.9};
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
      <Siren t={t} t0={0} t1={3.0} />
      <Counter t={t} t0={0.6} t1={3.0} to={3837} />
      <Confetti t={t} t0={3.45} />
      <WorkersCard t={t} t0={8.5} t1={10.8} names={(PPL as any).workers} />
      <GoalBar t={t} t0={11.0} t1={14.3} cur={3837} goal={10000} />
      <Rules t={t} t0={14.4} t1={17.36} />
      <Confetti t={t} t0={19.2} />
      <CourseCard t={t} t0={21.0} t1={23.9} />
      <PollCard t={t} t0={24.5} t1={30.68} />
      <Caption t={t} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
