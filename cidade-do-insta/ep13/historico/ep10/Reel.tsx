import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, getRemotionEnvironment} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './three/Scene';
import {shotAt, easeOut, clamp, ramp, FPS} from './timeline';
import {GameCard} from './overlays';
import {Raffle, Rules, Counter, CourseCard, WorkersCard, Siren, GoalBar, ShopCard, Chips, PriceTag, KitCard, ProductGrid, Countdown, GiftCard, PhoneCTA} from './overlays';
import PPL from './people.json';
import {Header, Caption, FollowCard, CommentCard, LikeHeart, PollCard, FlavorCard, Confetti} from './overlays';

const PUNCH = [0.399, 2.522, 4.252, 8.848, 10.74, 11.64, 13.9, 15.22, 17.32, 23.96, 38.651, 41.211, 45.871, 48.971, 49.791];

export const Reel: React.FC<{audio?: string}> = ({audio = 'mix10c.wav'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / FPS;
  const s = shotAt(t);
  // zoom-in on every cut (not on the loop seam)
  const cut = s.id === 'hook' || s.id === 'loop' ? 0 : 1 - easeOut(clamp((t - s.start) / 0.28));
  let punch = 0;
  for (const p of PUNCH) if (t >= p && t < p + 0.3) punch = Math.max(punch, 1 - easeOut((t - p) / 0.3));
  const zoom = 1 + 0.09 * cut + 0.05 * punch;
  const B0: Record<string, number> = {vitrine: 18.78, corre: 23.78, sorteio: 38.171, regras: 38.171, meta: 44.451, cta: 48.091, jogo: 25.42};
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
      <Confetti t={t} t0={0.735} />
      <Confetti t={t} t0={2.452} />
      <Chips t={t} t0={4.85} t1={8.3} items={['ESPÉCIE', 'PROFISSÃO', 'ROUPA', 'APELIDO']} times={[5.28, 5.72, 6.24, 6.6]} />
      <PriceTag t={t} t0={8.3} t1={10.08} label="SEU PERSONAGEM" old="R$ 39,90" price="R$ 19,90" note="+ APARECE NO PRÓXIMO EPISÓDIO" top={480} />
      <PriceTag t={t} t0={13.38} t1={15.04} label="MANSÃO OU CASTELO" old="R$ 79,90" price="R$ 39,90" top={480} />
      <KitCard t={t} t0={15.119} t1={16.8} />
      <PriceTag t={t} t0={16.8} t1={18.78} label="KIT PREFEITO" old="R$ 89,90" price="R$ 49,90" top={480} />
      <ProductGrid t={t} t0={18.95} t1={23.78} />
      <Countdown t={t} t0={23.9} t1={25.42} />
      <GameCard t={t} t0={25.52} t1={38.131} />
      <GiftCard t={t} t0={38.331} t1={41.691} />
      <Confetti t={t} t0={38.857} />
      <Rules t={t} t0={42.029} t1={44.451} />
      <GoalBar t={t} t0={44.578} t1={48.091} cur={8631} goal={10000} />
      <PhoneCTA t={t} t0={48.141} t1={49.411} tap={48.899} />
      <Confetti t={t} t0={49.425} />
      <Caption t={t} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
