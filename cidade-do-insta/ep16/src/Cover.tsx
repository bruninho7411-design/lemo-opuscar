import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {LILITA, WaterIcon, BoltIcon, FireIcon, SchoolIcon, WheelIcon, StadiumIcon} from './overlays';

const st = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #111`, paintOrder: 'stroke fill'});

/** Reel cover 1080x1920. All text sits inside the centred 3:4 area (y 240–1680) so it survives the profile-grid crop. */
export const Cover: React.FC = () => {
  const {width, height} = useVideoConfig();
  const badge = (letter: string, label: string, icon: React.ReactNode, rot: number) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '6px solid #111', borderRadius: 30, padding: '8px 16px 8px 10px', boxShadow: '0 12px 0 rgba(0,0,0,.3)', transform: `rotate(${rot}deg)`}}>
      <div style={{width: 76, height: 76, borderRadius: '50%', background: '#FFD21E', border: '5px solid #111', fontFamily: LILITA, fontSize: 54, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{letter}</div>
      <div style={{fontFamily: LILITA, fontSize: 52, color: '#111'}}>{label}</div>
      <div style={{width: 78, height: 78, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{transform: 'scale(.7)'}}>{icon}</div></div>
    </div>
  );
  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f4'}}>
      <ThreeCanvas width={width} height={height} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}}>
        <Scene t={0.4} cam={{pos: [-41, 4.5, 11], look: [-49, 2.4, 20.8], fov: 50}} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,.5) 100%)'}} />
      {/* top: episode + hook */}
      <div style={{position: 'absolute', top: 265, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{background: 'linear-gradient(90deg,#962fbf,#d62976,#fa7e1e)', color: '#fff', fontFamily: LILITA, fontSize: 50, padding: '6px 34px', borderRadius: 40, border: '5px solid #111', letterSpacing: 2}}>EPISÓDIO 16</div>
        <div style={{fontFamily: LILITA, fontSize: 112, lineHeight: 0.95, color: '#FFD21E', textAlign: 'center', marginTop: 18, ...st(22), textShadow: '0 10px 0 rgba(0,0,0,.4)'}}>FOGO NA CIDADE! 🔥</div>
        <div style={{fontFamily: LILITA, fontSize: 92, lineHeight: 1, color: '#fff', textAlign: 'center', marginTop: 6, ...st(15), textShadow: '0 8px 0 rgba(0,0,0,.4)'}}>E DEU BOMBEIROS!</div>
      </div>
      <div style={{position: 'absolute', top: 1060, left: 70, width: 190, height: 190, borderRadius: '50%', padding: 8, background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf)', border: '6px solid #111', transform: 'rotate(-6deg)'}}>
        <Img src={staticFile('avatar.png')} style={{width: '100%', height: '100%', borderRadius: '50%', border: '6px solid #fff', boxSizing: 'border-box'}} />
      </div>
      {/* bottom: the vote */}
      <div style={{position: 'absolute', top: 1250, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{fontFamily: LILITA, fontSize: 70, color: '#FFD21E', ...st(13), textShadow: '0 7px 0 rgba(0,0,0,.4)'}}>14ª VOTAÇÃO · COMENTA!</div>
        {badge('A', 'ZOOLÓGICO', <div style={{fontSize: 60}}>🦁</div>, -2)}
        {badge('B', 'ESTÁDIO', <StadiumIcon />, 2)}
      </div>
    </AbsoluteFill>
  );
};
