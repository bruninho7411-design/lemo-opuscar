import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {LILITA, INTER} from './overlays';

/** Story background (1080x1920) with an empty slot for Instagram's native poll sticker */
export const StoryPoll: React.FC = () => {
  const st = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #111`, paintOrder: 'stroke fill'});
  return (
    <AbsoluteFill>
      <Img src={staticFile('story_bg.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,.35))'}} />
      <div style={{position: 'absolute', top: 230, left: 0, right: 0, textAlign: 'center', fontFamily: LILITA}}>
        <div style={{fontSize: 120, color: '#FFD21E', ...st(18), textShadow: '0 8px 0 rgba(0,0,0,.35)'}}>1ª VOTAÇÃO</div>
        <div style={{fontSize: 62, color: '#fff', ...st(12), marginTop: 8}}>O QUE A CIDADE GANHA PRIMEIRO?</div>
      </div>
      <div style={{position: 'absolute', top: 760, left: 140, right: 140, height: 330, border: '6px dashed rgba(255,255,255,.85)', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 800, fontSize: 40, color: 'rgba(255,255,255,.95)', textShadow: '0 3px 6px rgba(0,0,0,.6)', textAlign: 'center'}}>
        cole aqui o sticker<br />ENQUETE: A) PIZZARIA · B) LAGOA
      </div>
      <div style={{position: 'absolute', bottom: 300, left: 0, right: 0, textAlign: 'center', fontFamily: LILITA, fontSize: 64, color: '#fff', ...st(12)}}>
        PREFEITO CAPIVALDO · @cidade_do_insta
      </div>
    </AbsoluteFill>
  );
};
