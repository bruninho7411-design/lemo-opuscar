import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';

/** clean 3D frame (no text) at time t, used as the Story background */
export const CityBg: React.FC<{t: number}> = ({t}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f4'}}>
      <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}}>
        <Scene t={t} cam={{pos: [12, 15, 19], look: [2.5, 0, 0.5], fov: 42}} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
