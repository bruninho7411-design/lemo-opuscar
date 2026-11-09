import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Reel} from './Reel';
import {Ins, INS} from './Ins';
import {FPS, TOTAL_FRAMES} from './timeline';

/** ep19 final cut: surf hook (0-2.2s), then the shack/mansion insert, then the rest of the episode */
export const HOOK_F = 43; // right after "bora pra praia!" (1.43s)
export const INS_F = Math.round(INS * FPS);
export const REEL19_FRAMES = TOTAL_FRAMES + INS_F;
export const Reel19: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={HOOK_F}><Reel audio="" /></Sequence>
    <Sequence from={HOOK_F} durationInFrames={INS_F}><Ins /></Sequence>
    <Sequence from={HOOK_F + INS_F}><Sequence from={-HOOK_F}><Reel audio="" /></Sequence></Sequence>
    <Audio src={staticFile('mix19b.wav')} />
  </AbsoluteFill>
);
