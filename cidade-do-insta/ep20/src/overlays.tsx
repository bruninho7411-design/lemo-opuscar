import React from 'react';
import {Img, staticFile, OffthreadVideo, Sequence} from 'remotion';
import {continueRender, delayRender} from 'remotion';
import {shotAt, pop, clamp, easeOut, ramp, Shot} from './timeline';
import words from './words.json';

export const LILITA = 'LilitaLocal';
export const INTER = 'Inter, sans-serif';
if (typeof document !== 'undefined' && !(window as any).__lilita) {
  (window as any).__lilita = true;
  const h = delayRender('lilita');
  const faces = [
    new FontFace(LILITA, `url(${staticFile('fonts/lilita-latin.woff2')})`, {unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'}),
    new FontFace(LILITA, `url(${staticFile('fonts/lilita-ext.woff2')})`, {unicodeRange: 'U+0100-02AF, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF'}),
  ];
  Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
}

const stroke = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #111`, paintOrder: 'stroke fill'});

export const Header: React.FC<{t: number}> = ({t}) => {
  const s: Shot = shotAt(t);
  // keep the header steady across consecutive shots with the same title
  const k = s.id === 'loop' || s.id === 'let' || s.id === 'hook' ? 1 : pop(t, s.start, 0.3);
  const big = s.titleBig;
  return (
    <div style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`}}>
      <div style={{fontFamily: LILITA, fontSize: big ? 170 : 112, lineHeight: 1, color: '#FFD21E', letterSpacing: 2, textAlign: 'center', ...stroke(big ? 22 : 16), textShadow: '0 8px 0 rgba(0,0,0,.35)'}}>{s.title}</div>
      {s.sub ? (
        <div style={{fontFamily: LILITA, fontSize: 54, marginTop: 6, color: '#fff', letterSpacing: 1.5, textAlign: 'center', ...stroke(11), textShadow: '0 5px 0 rgba(0,0,0,.35)'}}>{s.sub}</div>
      ) : null}
    </div>
  );
};

type W = {t: string; s: number; e: number; hl: boolean};
const WORDS0 = words as W[];
export const Caption: React.FC<{t: number; words?: W[]}> = ({t, words: WL}) => {
  const WORDS = WL ?? WORDS0;
  let idx = -1;
  for (let i = 0; i < WORDS.length; i++) if (WORDS[i].s <= t + 0.02) idx = i;
  if (idx < 0) return null;
  const w = WORDS[idx];
  const next = WORDS[idx + 1];
  const until = next ? Math.min(next.s, w.e + 0.6) : w.e + 0.5;
  if (t > until) return null;
  const k = pop(t, w.s - 0.02, 0.18);
  return (
    <div style={{position: 'absolute', top: 1150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: LILITA, fontSize: w.t.length > 9 ? 112 : 128, color: w.hl ? '#FFD21E' : '#fff', ...stroke(16), textShadow: '0 8px 0 rgba(0,0,0,.4)', transform: `scale(${0.7 + 0.3 * k}) rotate(${w.hl ? -3 : 0}deg)`}}>{w.t}</div>
    </div>
  );
};

const Hand: React.FC<{x: number; y: number; press: number; rot?: number}> = ({x, y, press, rot = -15}) => (
  <svg width={150} height={190} viewBox="0 0 60 76" style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${1 - press * 0.15})`, transformOrigin: '20px 6px', filter: 'drop-shadow(0 6px 4px rgba(0,0,0,.35))'}}>
    <path d="M20 4c3 0 5 2 5 5v22h2V24c0-3 2-5 5-5s5 2 5 5v8h1v-5c0-3 2-5 5-5s5 2 5 5v7h1v-3c0-3 2-5 4.5-5S58 28 58 31v18c0 14-9 25-23 25h-4C19 74 10 66 8 55L3 40c-1-3 1-6 4-6.5 2.5-.4 4.5 1 5.5 3.5L15 44V9c0-3 2-5 5-5z" fill="#fff" stroke="#111" strokeWidth={3} strokeLinejoin="round" />
  </svg>
);

const Ripple: React.FC<{x: number; y: number; t: number; t0: number}> = ({x, y, t, t0}) => {
  const k = ramp(t, t0, t0 + 0.45);
  if (k <= 0 || k >= 1) return null;
  return <div style={{position: 'absolute', left: x - 90 * k, top: y - 90 * k, width: 180 * k, height: 180 * k, borderRadius: '50%', border: `${8 * (1 - k)}px solid rgba(255,255,255,${1 - k})`}} />;
};

export const FollowCard: React.FC<{t: number; t0: number; t1: number; tap: number}> = ({t, t0, t1, tap}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const tapped = t >= tap;
  const hx = 640 + (1 - easeOut(ramp(t, t0 + 0.05, tap - 0.08))) * 260;
  const hy = 610 + (1 - easeOut(ramp(t, t0 + 0.05, tap - 0.08))) * 300;
  const press = t > tap - 0.08 && t < tap + 0.12 ? 1 : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 860, background: '#fff', borderRadius: 44, padding: '34px 38px', display: 'flex', alignItems: 'center', gap: 28, boxShadow: '0 18px 0 rgba(0,0,0,.25)', border: '6px solid #111', position: 'relative'}}>
        <div style={{width: 150, height: 150, borderRadius: '50%', padding: 7, background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)', flexShrink: 0}}>
          <Img src={staticFile('avatar.png')} style={{width: '100%', height: '100%', borderRadius: '50%', border: '6px solid #fff', boxSizing: 'border-box', objectFit: 'cover'}} />
        </div>
        <div style={{flex: 1, fontFamily: INTER}}>
          <div style={{fontSize: 44, fontWeight: 800, color: '#111'}}>cidade_do_insta</div>
          <div style={{fontSize: 32, fontWeight: 600, color: '#666', marginTop: 4}}>Prefeito Capivaldo</div>
          <div style={{marginTop: 18, background: tapped ? '#efefef' : '#0095f6', color: tapped ? '#111' : '#fff', fontSize: 38, fontWeight: 800, borderRadius: 18, padding: '14px 0', textAlign: 'center', transform: `scale(${1 - press * 0.06})`}}>
            {tapped ? 'Seguindo ✓' : 'Seguir'}
          </div>
        </div>
        <Ripple x={600} y={260} t={t} t0={tap} />
        <Hand x={hx} y={hy} press={press} />
        {tapped ? (
          <div style={{position: 'absolute', right: -20, top: -60, fontFamily: LILITA, fontSize: 64, color: '#FFD21E', ...stroke(10), transform: `scale(${pop(t, tap + 0.05, 0.3)}) rotate(8deg)`}}>+1 MORADOR</div>
        ) : null}
      </div>
    </div>
  );
};

export const CommentCard: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const full = 'EU ACHEI! 🏠';
  const n = Math.floor(clamp((t - t0 - 0.15) / 0.35) * full.length);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 880, background: '#fff', borderRadius: 40, padding: '30px 36px', display: 'flex', gap: 24, alignItems: 'center', border: '6px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.25)', fontFamily: INTER, position: 'relative'}}>
        <div style={{width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg,#ffb347,#ff5f6d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 56, flexShrink: 0}}>@</div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 36, fontWeight: 800, color: '#111'}}>você <span style={{color: '#999', fontWeight: 600, fontSize: 30}}>agora</span></div>
          <div style={{fontSize: 42, fontWeight: 600, color: '#222', marginTop: 6}}>{full.slice(0, n)}<span style={{opacity: Math.floor(t * 4) % 2 ? 1 : 0}}>|</span></div>
        </div>
        <svg width={64} height={64} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#111" strokeWidth={2} /></svg>
        <div style={{position: 'absolute', right: -10, bottom: -70, fontFamily: LILITA, fontSize: 66, color: '#FFD21E', ...stroke(10), transform: `scale(${pop(t, t0 + 1.0, 0.3)}) rotate(-6deg)`}}>ACHOU SUA CASA?</div>
      </div>
    </div>
  );
};

const HEART = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
export const LikeHeart: React.FC<{t: number; t0: number; t1: number; tap: number}> = ({t, t0, t1, tap}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.25, t1)));
  const liked = t >= tap;
  const beat = liked ? 1 + 0.25 * Math.max(0, 1 - (t - tap) / 0.3) + 0.05 * Math.sin((t - tap) * 9) : 1;
  const hx = 640 + (1 - easeOut(ramp(t, t0, tap - 0.06))) * 220;
  const hy = 700 + (1 - easeOut(ramp(t, t0, tap - 0.06))) * 260;
  const press = t > tap - 0.08 && t < tap + 0.12 ? 1 : 0;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 540 - 190, top: 440, width: 380, height: 380, transform: `scale(${k * beat})`}}>
        <svg width={380} height={380} viewBox="0 0 24 24" style={{filter: 'drop-shadow(0 12px 0 rgba(0,0,0,.3))'}}>
          <path d={HEART} fill={liked ? '#ff3040' : '#ffffff'} stroke="#111" strokeWidth={1.3} />
        </svg>
      </div>
      {liked
        ? Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const d = easeOut(ramp(t, tap, tap + 0.7)) * 330;
            const o = 1 - ramp(t, tap + 0.4, tap + 0.9);
            return (
              <svg key={i} width={70} height={70} viewBox="0 0 24 24" style={{position: 'absolute', left: 505 + Math.cos(a) * d, top: 625 + Math.sin(a) * d, opacity: o, transform: `rotate(${a * 30}deg)`}}>
                <path d={HEART} fill={i % 2 ? '#ff3040' : '#FFD21E'} stroke="#111" strokeWidth={1.5} />
              </svg>
            );
          })
        : null}
      <Ripple x={560} y={660} t={t} t0={tap} />
      {t < tap + 0.6 ? <Hand x={hx} y={hy} press={press} /> : null}
    </div>
  );
};

export const DownArrows: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.3);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1330, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`}}>
      {[0, 1, 2].map((i) => (
        <svg key={i} width={160} height={90} viewBox="0 0 40 22" style={{marginTop: -18, opacity: 0.5 + 0.5 * Math.max(0, Math.sin(t * 10 - i * 1.2)), transform: `translateY(${Math.sin(t * 10 - i) * 8}px)`}}>
          <path d="M4 4 L20 18 L36 4" fill="none" stroke="#111" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 4 L20 18 L36 4" fill="none" stroke="#FFD21E" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
};

export const PizzaIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40">
    <path d="M20 37 L4 8 Q20 0 36 8 Z" fill="#ffcc3d" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" />
    <path d="M4 8 Q20 0 36 8 L34 11 Q20 4 6 11 Z" fill="#e9a23b" stroke="#111" strokeWidth={2} />
    <circle cx={16} cy={15} r={3} fill="#c92b20" /><circle cx={24} cy={17} r={3} fill="#c92b20" /><circle cx={20} cy={25} r={2.6} fill="#c92b20" />
  </svg>
);
export const LakeIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40">
    <ellipse cx={20} cy={26} rx={17} ry={10} fill="#4fb3ea" stroke="#111" strokeWidth={2.5} />
    <path d="M9 26 q4 -3 8 0 t8 0 t8 0" fill="none" stroke="#dff4ff" strokeWidth={2} />
    <circle cx={20} cy={13} r={7} fill="#a8683a" stroke="#111" strokeWidth={2} />
    <circle cx={20} cy={5} r={3.2} fill="#ff9d1a" stroke="#111" strokeWidth={1.5} />
    <circle cx={17.5} cy={12} r={1.2} fill="#111" /><circle cx={22.5} cy={12} r={1.2} fill="#111" />
  </svg>
);

export const PollCard: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.4) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const sway = Math.sin((t - t0) * 2.6) * 0.12;
  const a = 0.5 + sway, b = 0.5 - sway;
  const typed = t > t0 + 0.9 ? (Math.floor((t - t0 - 0.9) / 0.9) % 2 ? 'B' : 'A') : '';
  const opt = (letter: string, label: string, icon: React.ReactNode, frac: number, color: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 20, background: '#f3f3f3', borderRadius: 30, padding: '16px 22px', border: '5px solid #111', position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${frac * 100}%`, background: color, opacity: 0.55}} />
      <div style={{position: 'relative', width: 88, height: 88, borderRadius: '50%', background: '#FFD21E', border: '5px solid #111', fontFamily: LILITA, fontSize: 60, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{letter}</div>
      <div style={{position: 'relative', fontFamily: LILITA, fontSize: label.length > 10 ? 50 : 70, color: '#111', flex: 1}}>{label}</div>
      <div style={{position: 'relative'}}>{icon}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(${Math.sin(t * 2) * 0.6}deg)`}}>
      <div style={{width: 900, background: '#fff', borderRadius: 48, padding: '34px 36px 30px', border: '7px solid #111', boxShadow: '0 20px 0 rgba(0,0,0,.28)', display: 'flex', flexDirection: 'column', gap: 22}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div style={{background: 'linear-gradient(90deg,#962fbf,#d62976,#fa7e1e)', color: '#fff', fontFamily: LILITA, fontSize: 44, padding: '8px 34px', borderRadius: 40, letterSpacing: 2}}>ENQUETE · 18ª VOTAÇÃO</div>
        </div>
        <div style={{fontFamily: LILITA, fontSize: 60, textAlign: 'center', color: '#111', lineHeight: 1.05}}>O QUE A CIDADE<br />GANHA AGORA?</div>
        {opt('A', 'CINEMA', <div style={{fontSize: 86, lineHeight: 1}}>🎬</div>, a, '#e2483d')}
        {opt('B', 'PARQUE AQUÁTICO', <div style={{fontSize: 86, lineHeight: 1}}>🌊</div>, b, '#2fb5ff')}
        <div style={{display: 'flex', alignItems: 'center', gap: 16, border: '4px solid #ddd', borderRadius: 40, padding: '14px 26px', fontFamily: INTER, fontSize: 36, color: typed ? '#111' : '#999', fontWeight: 600}}>
          <Img src={staticFile('avatar.png')} style={{width: 60, height: 60, borderRadius: '50%'}} />
          <div style={{flex: 1}}>{typed ? `${typed}` : 'Comente A ou B...'}<span style={{opacity: Math.floor(t * 4) % 2 ? 1 : 0}}>|</span></div>
          <div style={{color: '#0095f6', fontWeight: 800}}>Publicar</div>
        </div>
      </div>
    </div>
  );
};

/** whole pizza, top view: calabresa (sausage + onion) or frango com catupiry */
export const Pie: React.FC<{kind: 'cala' | 'frango'; size: number}> = ({kind, size}) => {
  const R = (n: number) => Array.from({length: n}).map((_, i) => [Math.cos(i * 2.399) * (6 + (i % 4) * 4.2), Math.sin(i * 2.399) * (6 + (i % 4) * 4.2)]);
  return (
    <svg width={size} height={size} viewBox="-26 -26 52 52">
      <circle r={24} fill="#e9a23b" stroke="#111" strokeWidth={2.5} />
      <circle r={19.5} fill={kind === 'cala' ? '#d9482b' : '#f4d26a'} />
      {kind === 'cala'
        ? R(12).map(([x, y], i) => (
            <g key={i}><circle cx={x} cy={y} r={3.2} fill="#9b2a1a" stroke="#5a160c" strokeWidth={0.8} /><circle cx={x} cy={y} r={1.2} fill="#c9563f" /></g>
          )).concat(R(6).map(([x, y], i) => <ellipse key={'o' + i} cx={-y * 0.8} cy={x * 0.8} rx={4} ry={1.6} fill="none" stroke="#f3e9ff" strokeWidth={1.2} />))
        : R(14).map(([x, y], i) => (i % 2 ? <circle key={i} cx={x} cy={y} r={3.4} fill="#fffaf0" stroke="#e8dcc0" strokeWidth={0.6} /> : <rect key={i} x={x - 2} y={y - 1.5} width={4} height={3} rx={1} fill="#d9a35b" />))}
      <path d="M0 0 L24 0" stroke="#c78a2c" strokeWidth={0.8} /><path d="M0 0 L-12 20.8" stroke="#c78a2c" strokeWidth={0.8} /><path d="M0 0 L-12 -20.8" stroke="#c78a2c" strokeWidth={0.8} />
    </svg>
  );
};

export const FlavorCard: React.FC<{t: number; t0: number; t1: number; kind: 'cala' | 'frango'; letter: string; label: string}> = ({t, t0, t1, kind, letter, label}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`}}>
      <div style={{transform: `rotate(${(t - t0) * 40}deg)`, filter: 'drop-shadow(0 18px 0 rgba(0,0,0,.3))'}}><Pie kind={kind} size={520} /></div>
      {letter ? <div style={{position: 'absolute', top: -10, left: 150, width: 130, height: 130, borderRadius: '50%', background: '#FFD21E', border: '8px solid #111', fontFamily: LILITA, fontSize: 92, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{letter}</div> : null}
    </div>
  );
};

export const Confetti: React.FC<{t: number; t0: number; dur?: number}> = ({t, t0, dur = 1.8}) => {
  if (t < t0 || t > t0 + dur) return null;
  const e = t - t0;
  const cols = ['#FFD21E', '#ff3040', '#2fb5ff', '#5ec26a', '#d62976', '#ffffff'];
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {Array.from({length: 70}).map((_, i) => {
        const r1 = Math.sin(i * 12.9898) * 43758.5453, r = r1 - Math.floor(r1);
        const r2 = Math.sin(i * 78.233) * 12345.678, q = r2 - Math.floor(r2);
        const x = 540 + (r - 0.5) * 1300 * Math.min(1, e * 3);
        const y = 900 - (500 + q * 700) * e + 1400 * e * e;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 22, height: 34, background: cols[i % cols.length], border: '3px solid #111', transform: `rotate(${(i * 47 + e * 720 * (q + 0.3)) % 360}deg)`, opacity: 1 - Math.max(0, (e - dur + 0.4) / 0.4)}} />;
      })}
    </div>
  );
};

export const HouseIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M6 19 L20 7 L34 19 Z" fill="#d6402b" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" /><rect x={10} y={19} width={20} height={15} fill="#f6d36b" stroke="#111" strokeWidth={2.5} /><rect x={17} y={25} width={6} height={9} fill="#7b4a28" stroke="#111" strokeWidth={1.5} /></svg>
);
export const BallIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><circle cx={20} cy={20} r={15} fill="#fff" stroke="#111" strokeWidth={2.5} /><path d="M20 13 l6 4 -2 7 h-8 l-2 -7 z" fill="#111" /><path d="M20 5 v8 M26 17 l8 -3 M24 24 l5 7 M16 24 l-5 7 M14 17 l-8 -3" stroke="#111" strokeWidth={1.8} /></svg>
);

export const TattooIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M20 33 C8 25 5 19 7 13 C9 8 15 8 20 13 C25 8 31 8 33 13 C35 19 32 25 20 33 Z" fill="#e2483d" stroke="#111" strokeWidth={2.5} /><path d="M3 30 L37 10" stroke="#111" strokeWidth={3} /><path d="M33 8 l5 1 -3 4 z" fill="#111" /><rect x={6} y={19} width={28} height={7} rx={2} fill="#fff3d6" stroke="#111" strokeWidth={2} transform="rotate(-8 20 22)" /></svg>
);
export const CartIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M3 7 h6 l4 18 h18 l4 -13 H11" fill="#ffd21e" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" /><circle cx={15} cy={31} r={3} fill="#111" /><circle cx={28} cy={31} r={3} fill="#111" /><rect x={15} y={7} width={6} height={6} fill="#5ec26a" stroke="#111" strokeWidth={1.5} /><circle cx={26} cy={9} r={3.5} fill="#e2483d" stroke="#111" strokeWidth={1.5} /></svg>
);

import PEOPLE2 from './people.json';
const POOL: string[] = [...(PEOPLE2 as any).followers, ...(PEOPLE2 as any).new].filter((x: string) => !x.includes('…'));
export const WINNER: string = (PEOPLE2 as any).winner2;

/** slot-machine draw that lands on the winner */
export const Raffle: React.FC<{t: number; t0: number; tStop: number; t1: number}> = ({t, t0, tStop, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35);
  const stopped = t >= tStop;
  // decelerating index
  const e = Math.min(1, (t - t0) / (tStop - t0));
  const idx = Math.floor((1 - Math.pow(1 - e, 2.2)) * 90 + 0.5);
  const name = stopped ? WINNER : POOL[(idx * 37) % POOL.length];
  const flash = stopped ? pop(t, tStop, 0.3) : 1;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 920, background: '#fff', borderRadius: 44, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.28)', padding: '26px 30px', textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: 'linear-gradient(90deg,#e8b923,#ffd21e)', border: '5px solid #111', borderRadius: 40, padding: '6px 30px', fontFamily: LILITA, fontSize: 46}}>SORTEIO · MANSÃO 2</div>
        <div style={{marginTop: 22, background: stopped ? '#ffd21e' : '#f1f1f1', border: '5px solid #111', borderRadius: 26, padding: '18px 10px', fontFamily: INTER, fontWeight: 900, fontSize: name.length > 18 ? 52 : 64, color: '#111', transform: `scale(${stopped ? 0.9 + 0.1 * flash : 1})`}}>@{name}</div>
        <div style={{marginTop: 14, fontFamily: LILITA, fontSize: 44, color: stopped ? '#2d9a5a' : '#888'}}>{stopped ? 'GANHOU A MANSÃO!' : 'sorteando entre ' + POOL.length + ' seguidores...'}</div>
      </div>
    </div>
  );
};

export const Rules: React.FC<{t: number; t0: number; t1: number; items?: string[]; title?: string; at?: number[]}> = ({t, t0, t1, items: it0, title = 'PRA CONCORRER:', at}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35);
  const items = it0 ?? ['CURTIR', 'REPUBLICAR', 'POSTAR NOS STORIES'];
  const when = (i: number) => (at ? at[i] : t0 + 0.1 + i * 0.45);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 880, background: '#fff', borderRadius: 44, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.28)', padding: '26px 34px'}}>
        <div style={{fontFamily: LILITA, fontSize: 56, textAlign: 'center', marginBottom: 14}}>{title}</div>
        {items.map((it, i) => {
          const on = t > when(i);
          return (
            <div key={it} style={{display: 'flex', alignItems: 'center', gap: 20, margin: '12px 0'}}>
              <div style={{width: 74, height: 74, borderRadius: 18, border: '6px solid #111', background: on ? '#5ec26a' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LILITA, fontSize: 60, color: '#fff', transform: `scale(${on ? pop(t, when(i), 0.25) : 1})`}}>{on ? '✓' : ''}</div>
              <div style={{fontFamily: LILITA, fontSize: 58, color: '#111'}}>{it}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const WheelIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><circle cx={20} cy={17} r={13} fill="none" stroke="#111" strokeWidth={2.5} />{[0, 45, 90, 135].map((a) => <path key={a} d="M20 4 V30" stroke="#d62976" strokeWidth={2} transform={`rotate(${a} 20 17)`} />)}{[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={20} cy={4} r={3} fill="#ffd21e" stroke="#111" strokeWidth={1.5} transform={`rotate(${a} 20 17)`} />)}<path d="M12 37 L20 17 L28 37" fill="none" stroke="#111" strokeWidth={2.5} /></svg>
);
export const BagIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M8 13 h24 l-2 23 h-20 z" fill="#2f6fd6" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" /><path d="M14 16 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="#111" strokeWidth={2.5} /><path d="M15 25 h10" stroke="#fff" strokeWidth={2.5} /></svg>
);

/** hook: big rolling counter */
export const Counter: React.FC<{t: number; t0: number; t1: number; to: number; suffix?: string; label?: string; color?: string}> = ({t, t0, t1, to, suffix = '', label = 'MORADORES!', color = '#FFD21E'}) => {
  if (t < t0 || t > t1) return null;
  const e = clamp((t - t0) / 1.2);
  const n = Math.round(to * (1 - Math.pow(1 - e, 3)));
  const done = e >= 1;
  const k = pop(t, t0, 0.3) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k * (done ? 1 + 0.12 * (1 - clamp((t - t0 - 1.2) / 0.3)) : 1)}) rotate(-4deg)`}}>
      <div style={{fontFamily: LILITA, fontSize: 300, lineHeight: 0.9, color, WebkitTextStroke: '26px #111', paintOrder: 'stroke fill', textShadow: '0 16px 0 rgba(0,0,0,.4)'}}>{n}{suffix}</div>
      <div style={{fontFamily: LILITA, fontSize: 90, color: '#fff', WebkitTextStroke: '15px #111', paintOrder: 'stroke fill', marginTop: -10}}>{label}</div>
    </div>
  );
};

export const CourseCard: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 480, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(${Math.sin(t * 2) * 0.8}deg)`}}>
      <div style={{width: 900, background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', borderRadius: 44, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '30px 34px', textAlign: 'center', color: '#fff'}}>
        <div style={{display: 'inline-block', background: '#FFD21E', color: '#111', borderRadius: 30, padding: '6px 26px', fontFamily: LILITA, fontSize: 40, border: '4px solid #111'}}>CURSO DE ANIMAÇÃO</div>
        <div style={{fontFamily: LILITA, fontSize: 74, lineHeight: 1.05, marginTop: 18}}>APRENDA A FAZER<br />ANIMAÇÕES ASSIM</div>
        <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 38, marginTop: 18, background: '#fff', color: '#4c1d95', borderRadius: 20, padding: '12px 0'}}>quadroaquadroonline.com.br</div>
        <div style={{fontFamily: LILITA, fontSize: 56, marginTop: 16, color: '#FFD21E'}}>LINK NA BIO ↑</div>
      </div>
    </div>
  );
};

export const HospitalIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><rect x={6} y={10} width={28} height={26} fill="#fff" stroke="#111" strokeWidth={2.5} /><rect x={17} y={14} width={6} height={14} fill="#e2483d" /><rect x={13} y={18} width={14} height={6} fill="#e2483d" /><rect x={16} y={30} width={8} height={6} fill="#8fd3ff" stroke="#111" strokeWidth={1.5} /></svg>
);
export const SchoolIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M4 18 L20 8 L36 18 Z" fill="#e2483d" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" /><rect x={7} y={18} width={26} height={18} fill="#f2b134" stroke="#111" strokeWidth={2.5} /><rect x={17} y={26} width={6} height={10} fill="#7b4a28" /><rect x={10} y={22} width={5} height={5} fill="#8fd3ff" /><rect x={25} y={22} width={5} height={5} fill="#8fd3ff" /><circle cx={20} cy={14} r={2.2} fill="#fff" stroke="#111" /></svg>
);

export const WorkersCard: React.FC<{t: number; t0: number; t1: number; names: string[]; title?: string; roles?: string[]; color?: string}> = ({t, t0, t1, names, title = 'POLICIAIS DA CIDADE', roles = ['DELEGADO', 'POLICIAL', 'POLICIAL'], color = '#d62976'}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 880, background: '#fff', borderRadius: 40, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.28)', padding: '22px 30px', textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: color, color: '#fff', borderRadius: 30, padding: '6px 26px', fontFamily: LILITA, fontSize: 42, border: '4px solid #111'}}>{title}</div>
        {names.map((n, i) => (
          <div key={n} style={{fontFamily: INTER, fontWeight: 900, fontSize: n.length > 20 ? 34 : 42, marginTop: 12, transform: `scale(${pop(t, t0 + 0.3 + i * 0.3, 0.3)})`}}><span style={{fontFamily: LILITA, fontWeight: 400, color: ['#e2483d', '#16a3a3', '#2f6fd6'][i]}}>{roles[i]}</span><br />@{n}</div>
        ))}
      </div>
    </div>
  );
};

export const StadiumIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><ellipse cx={20} cy={22} rx={17} ry={11} fill="#5ec26a" stroke="#111" strokeWidth={2.5} /><ellipse cx={20} cy={22} rx={10} ry={5.5} fill="#3fae4a" stroke="#fff" strokeWidth={1.5} /><path d="M20 16.5 V27.5" stroke="#fff" strokeWidth={1.5} /><circle cx={20} cy={22} r={2} fill="none" stroke="#fff" strokeWidth={1.2} /></svg>
);
export const PlaneIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M20 3 C22 3 23 5 23 8 V15 L36 22 V26 L23 22 V31 L27 34 V37 L20 35 L13 37 V34 L17 31 V22 L4 26 V22 L17 15 V8 C17 5 18 3 20 3 Z" fill="#fff" stroke="#111" strokeWidth={2} strokeLinejoin="round" /><path d="M17 15 L4 22" stroke="#2f6fd6" strokeWidth={2} /></svg>
);

/** flashing police-style siren frame + URGENTE banner */
export const Siren: React.FC<{t: number; t0: number; t1: number; text?: string; top?: number}> = ({t, t0, t1, text = 'MÃOS AO ALTO!', top = 1250}) => {
  if (t < t0 || t > t1) return null;
  const on = Math.floor(t * 8) % 2 === 0;
  const k = pop(t, t0, 0.25);
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 140px 40px ${on ? 'rgba(255,40,40,.75)' : 'rgba(40,90,255,.75)'}`}} />
      <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(-5deg)`}}>
        <div style={{background: on ? '#ff2a2a' : '#ffffff', color: on ? '#fff' : '#ff2a2a', fontFamily: LILITA, fontSize: 110, padding: '6px 50px', border: '10px solid #111', borderRadius: 24, boxShadow: '0 14px 0 rgba(0,0,0,.35)'}}>{text}</div>
      </div>
    </div>
  );
};

/** progress to 10k followers */
export const GoalBar: React.FC<{t: number; t0: number; t1: number; cur: number; goal: number}> = ({t, t0, t1, cur, goal}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const f = (cur / goal) * easeOut(ramp(t, t0 + 0.2, t0 + 1.4));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 900, background: '#fff', borderRadius: 40, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.28)', padding: '24px 30px', textAlign: 'center'}}>
        <div style={{fontFamily: LILITA, fontSize: 50}}>SORTEIO DO DONO DO SHOPPING</div>
        <div style={{fontFamily: LILITA, fontSize: 40, color: '#666', marginTop: 4}}>QUANDO A CIDADE BATER</div>
        <div style={{fontFamily: LILITA, fontSize: 110, color: '#FFD21E', WebkitTextStroke: '12px #111', paintOrder: 'stroke fill', lineHeight: 1}}>10 MIL</div>
        <div style={{marginTop: 14, height: 58, borderRadius: 30, border: '5px solid #111', background: '#eee', overflow: 'hidden', position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${f * 100}%`, background: 'linear-gradient(90deg,#fa7e1e,#d62976,#962fbf)'}} />
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LILITA, fontSize: 36}}>{Math.round(f * goal).toLocaleString('pt-BR')} / 10.000</div>
        </div>
      </div>
    </div>
  );
};

export const PoliceIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M20 3 L34 9 V20 C34 29 27 34 20 37 C13 34 6 29 6 20 V9 Z" fill="#2f6fd6" stroke="#111" strokeWidth={2.5} /><path d="M20 11 L22.5 17 H29 L24 21 L26 28 L20 24 L14 28 L16 21 L11 17 H17.5 Z" fill="#ffd21e" stroke="#111" strokeWidth={1.2} /></svg>
);
export const FireIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M20 37 C10 37 6 30 8 22 C10 15 16 13 15 4 C22 8 25 14 24 19 C26 17 27 15 27 12 C32 17 34 24 31 30 C29 34 25 37 20 37 Z" fill="#ff8f1f" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" /><path d="M20 35 C15 35 13 31 14 27 C15 23 19 22 19 18 C23 21 25 25 24 29 C24 32 22 35 20 35 Z" fill="#ffd21e" /></svg>
);

export const WaterIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M20 3 C26 12 32 18 32 25 A12 12 0 0 1 8 25 C8 18 14 12 20 3 Z" fill="#2fb5ff" stroke="#111" strokeWidth={2.5} /><path d="M14 26 a6 6 0 0 0 6 6" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" /></svg>
);
export const BoltIcon = () => (
  <svg width={110} height={110} viewBox="0 0 40 40"><path d="M23 2 L8 23 H18 L15 38 L32 15 H21 Z" fill="#ffd21e" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" /></svg>
);

export const ShopCard: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const items: [string, string, string][] = [['🦫', 'SEU PERSONAGEM', 'R$ 19,90'], ['🏠', 'SUA CASA', 'R$ 29,90'], ['🌆', 'SEU UNIVERSO', 'R$ 49,90']];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(${Math.sin(t * 2) * 0.8}deg)`}}>
      <div style={{width: 920, background: 'linear-gradient(160deg,#fff7e0,#ffe2f0)', borderRadius: 44, border: '7px solid #111', boxShadow: '0 18px 0 rgba(0,0,0,.3)', padding: '26px 30px', textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: 'linear-gradient(90deg,#fa7e1e,#d62976,#962fbf)', color: '#fff', borderRadius: 30, padding: '6px 30px', fontFamily: LILITA, fontSize: 48, border: '5px solid #111'}}>NOVIDADE: LOJA DA CIDADE</div>
        <div style={{fontFamily: LILITA, fontSize: 52, marginTop: 14, lineHeight: 1.05}}>ENCOMENDE A ARTE DO<br />SEU PERSONAGEM E DA SUA CASA</div>
        {items.map(([e, n, p], i) => (
          <div key={n} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, background: '#fff', border: '5px solid #111', borderRadius: 24, padding: '8px 20px', transform: `scale(${pop(t, t0 + 0.4 + i * 0.25, 0.3)})`}}>
            <div style={{fontSize: 54}}>{e}</div>
            <div style={{flex: 1, textAlign: 'left', fontFamily: LILITA, fontSize: 46}}>{n}</div>
            <div style={{fontFamily: LILITA, fontSize: 46, color: '#2d9a5a'}}>{p}</div>
          </div>
        ))}
        <div style={{fontFamily: LILITA, fontSize: 56, marginTop: 14, color: '#d62976'}}>LINK NA BIO ↑</div>
      </div>
    </div>
  );
};

const STK = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #111`, paintOrder: 'stroke fill'});

/** chips that light up one by one (species/profession/outfit/nickname) */
export const Chips: React.FC<{t: number; t0: number; t1: number; items: string[]; times: number[]}> = ({t, t0, t1, items, times}) => {
  if (t < t0 || t > t1) return null;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 520, display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center'}}>
      {items.map((it, i) => {
        const on = t >= times[i];
        return (
          <div key={it} style={{fontFamily: LILITA, fontSize: 56, padding: '10px 30px', borderRadius: 40, border: '6px solid #111', background: on ? '#ffd21e' : 'rgba(255,255,255,.85)', color: '#111', transform: `scale(${on ? 0.85 + 0.15 * pop(t, times[i], 0.3) : 0.85}) rotate(${(i % 2 ? 3 : -3)}deg)`, boxShadow: '0 8px 0 rgba(0,0,0,.3)'}}>{on ? '✓ ' : ''}{it}</div>
        );
      })}
    </div>
  );
};

/** big price sticker with optional strike-through "de" price */
export const PriceTag: React.FC<{t: number; t0: number; t1: number; label: string; price: string; old?: string; note?: string; top?: number}> = ({t, t0, t1, label, price, old, note, top = 1290}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.15, t1)));
  const sk = old ? pop(t, t0 + 0.5, 0.3) : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(-4deg)`}}>
      <div style={{background: '#fff', border: '8px solid #111', borderRadius: 36, padding: '14px 40px', boxShadow: '0 14px 0 rgba(0,0,0,.3)', textAlign: 'center'}}>
        <div style={{fontFamily: LILITA, fontSize: 46, color: '#d62976'}}>{label}</div>
        {old ? <div style={{fontFamily: LILITA, fontSize: 52, color: '#888', position: 'relative', display: 'inline-block'}}>DE {old}<div style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 8, background: '#e2483d', transform: `scaleX(${sk})`, transformOrigin: 'left'}} /></div> : null}
        <div style={{fontFamily: LILITA, fontSize: 130, lineHeight: 1, color: '#2d9a5a', ...STK(12)}}>{old ? 'POR ' : ''}{price}</div>
        {note ? <div style={{fontFamily: LILITA, fontSize: 40, color: '#111', marginTop: 6}}>{note}</div> : null}
      </div>
    </div>
  );
};

export const KitCard: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.15, t1)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 480, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 900, background: 'linear-gradient(160deg,#fff7e0,#ffe2f0)', border: '8px solid #111', borderRadius: 44, padding: '24px 30px', boxShadow: '0 18px 0 rgba(0,0,0,.3)', textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: '#d62976', color: '#fff', fontFamily: LILITA, fontSize: 46, padding: '6px 30px', borderRadius: 30, border: '5px solid #111'}}>KIT PREFEITO · ECONOMIZE R$ 40</div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 16, fontFamily: LILITA, fontSize: 64}}>
          <div style={{transform: `scale(${pop(t, t0 + 0.3, 0.3)})`}}>🏰 MANSÃO OU CASTELO</div>
        </div>
        <div style={{fontFamily: LILITA, fontSize: 80, lineHeight: 1}}>+</div>
        <div style={{fontFamily: LILITA, fontSize: 64, transform: `scale(${pop(t, t0 + 0.6, 0.3)})`}}>🦫 SEU PERSONAGEM</div>
      </div>
    </div>
  );
};

export const ProductGrid: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.3) * (1 - easeOut(ramp(t, t1 - 0.15, t1)));
  const items: [string, string, string][] = [['🏠', 'CASA 2 ANDARES', '9,90'], ['🍕', 'PIZZARIA', '29,90'], ['🛒', 'MERCADINHO', '29,90'], ['🚗', 'CARRO', '19,90'], ['🏍️', 'MOTO', '12,90'], ['🏊', 'PISCINA', '14,90'], ['🌳', 'JARDIM', '14,90'], ['🏰', 'MANSÃO', '39,90']];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 960, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
        {items.map(([e, n, p], i) => (
          <div key={n} style={{background: '#fff', border: '6px solid #111', borderRadius: 26, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 0 rgba(0,0,0,.3)', transform: `scale(${pop(t, t0 + 0.12 * i, 0.3)})`}}>
            <div style={{fontSize: 60}}>{e}</div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: LILITA, fontSize: 40, lineHeight: 1}}>{n}</div>
              <div style={{fontFamily: LILITA, fontSize: 42, color: '#2d9a5a', lineHeight: 1.1}}>R$ {p}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Countdown: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.3) * (1 - easeOut(ramp(t, t1 - 0.15, t1)));
  const shake = Math.sin(t * 40) * 4;
  const sec = 59 - (Math.floor((t - t0) * 6) % 60);
  const box = (v: string, l: string) => (
    <div style={{background: '#111', color: '#ffd21e', borderRadius: 20, padding: '8px 16px', textAlign: 'center', minWidth: 150}}>
      <div style={{fontFamily: LILITA, fontSize: 90, lineHeight: 1}}>{v}</div>
      <div style={{fontFamily: LILITA, fontSize: 30, color: '#fff'}}>{l}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', transform: `scale(${k}) translateX(${shake}px)`}}>
      <div style={{background: '#e2483d', border: '8px solid #111', borderRadius: 40, padding: '20px 26px', textAlign: 'center', boxShadow: '0 16px 0 rgba(0,0,0,.3)'}}>
        <div style={{fontFamily: LILITA, fontSize: 60, color: '#fff', ...STK(8)}}>⏰ DESCONTO ACABA</div>
        <div style={{display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center'}}>{box('11/11', 'DIA')}{box('23H59', 'HORA')}{box(String(sec).padStart(2, '0'), 'SEG')}</div>
        <div style={{fontFamily: LILITA, fontSize: 46, color: '#fff', marginTop: 12}}>SEMANA DE LANÇAMENTO</div>
      </div>
    </div>
  );
};

export const GiftCard: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35) * (1 - easeOut(ramp(t, t1 - 0.15, t1)));
  const open = easeOut(ramp(t, t0 + 0.4, t0 + 0.9));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 900, background: '#fff', border: '8px solid #111', borderRadius: 44, padding: '22px 30px', boxShadow: '0 18px 0 rgba(0,0,0,.3)', textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: 'linear-gradient(90deg,#fa7e1e,#d62976,#962fbf)', color: '#fff', fontFamily: LILITA, fontSize: 54, padding: '6px 34px', borderRadius: 30, border: '5px solid #111'}}>🎁 SORTEIO</div>
        <div style={{position: 'relative', height: 200, marginTop: 10}}>
          <div style={{position: 'absolute', left: '50%', top: 40, fontSize: 150, transform: `translateX(-50%) translateY(${-60 * open}px) scale(${0.6 + 0.4 * open})`, opacity: open}}>🦫🏰</div>
          <div style={{position: 'absolute', left: '50%', top: 60, fontSize: 140, transform: `translateX(-50%) rotate(${(1 - open) * Math.sin(t * 30) * 8}deg)`, opacity: 1 - open * 0.9}}>🎁</div>
        </div>
        <div style={{fontFamily: LILITA, fontSize: 60, lineHeight: 1.05}}>1 KIT COMPLETO</div>
        <div style={{fontFamily: LILITA, fontSize: 44, color: '#d62976'}}>PERSONAGEM PERSONALIZADO + MANSÃO</div>
      </div>
    </div>
  );
};

/** phone mock: profile bio with the link, hand taps it */
export const PhoneCTA: React.FC<{t: number; t0: number; t1: number; tap: number; label?: string}> = ({t, t0, t1, tap, label = 'ABRIU A LOJA! 🛍️'}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.35);
  const tapped = t >= tap;
  const hp = 1 - easeOut(ramp(t, t0 + 0.1, tap - 0.05));
  const press = t > tap - 0.06 && t < tap + 0.15 ? 1 : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{width: 640, height: 900, background: '#0e1116', border: '14px solid #111', borderRadius: 70, boxShadow: '0 20px 0 rgba(0,0,0,.35)', padding: '60px 36px', position: 'relative', overflow: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{width: 130, height: 130, borderRadius: '50%', padding: 6, background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf)'}}>
            <Img src={staticFile('avatar.png')} style={{width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #0e1116', boxSizing: 'border-box'}} />
          </div>
          <div style={{fontFamily: INTER, color: '#fff', fontWeight: 800, fontSize: 34}}>cidade_do_insta</div>
        </div>
        <div style={{fontFamily: INTER, color: '#e5e7eb', fontSize: 28, marginTop: 26, lineHeight: 1.5}}>🏙️ Vocês decidem o rumo da cidade<br />🎨 Encomende personagens e construções<br />👇 Escolha seu caminho</div>
        <div style={{marginTop: 14, fontFamily: INTER, fontWeight: 800, fontSize: 32, color: '#7db3ff', background: tapped ? 'rgba(125,179,255,.25)' : 'transparent', borderRadius: 10, padding: '4px 8px', display: 'inline-block'}}>🔗 quadroaquadroonline.com.br</div>
        <div style={{position: 'absolute', left: 36, right: 36, bottom: 60, background: '#ffd21e', border: '6px solid #111', borderRadius: 30, padding: '16px 0', textAlign: 'center', fontFamily: LILITA, fontSize: 58, transform: `scale(${tapped ? pop(t, tap + 0.1, 0.3) : 0})`}}>{label}</div>
        <div style={{position: 'absolute', left: 230 + hp * 180, top: 380 + hp * 320}}>
          <svg width={150} height={190} viewBox="0 0 60 76" style={{transform: `rotate(-15deg) scale(${1 - press * 0.15})`, transformOrigin: '20px 6px', filter: 'drop-shadow(0 6px 4px rgba(0,0,0,.35))'}}>
            <path d="M20 4c3 0 5 2 5 5v22h2V24c0-3 2-5 5-5s5 2 5 5v8h1v-5c0-3 2-5 5-5s5 2 5 5v7h1v-3c0-3 2-5 4.5-5S58 28 58 31v18c0 14-9 25-23 25h-4C19 74 10 66 8 55L3 40c-1-3 1-6 4-6.5 2.5-.4 4.5 1 5.5 3.5L15 44V9c0-3 2-5 5-5z" fill="#fff" stroke="#111" strokeWidth={3} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/** phone showing the real 3D game recording, with callouts */
export const GameCard: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.4) * (1 - easeOut(ramp(t, t1 - 0.2, t1)));
  const call = (txt: string, at: number, top: number, left: number, rot: number) => (
    <div style={{position: 'absolute', top, left, fontFamily: LILITA, fontSize: 46, background: '#ffd21e', border: '6px solid #111', borderRadius: 26, padding: '6px 22px', transform: `scale(${pop(t, at, 0.3)}) rotate(${rot}deg)`, boxShadow: '0 8px 0 rgba(0,0,0,.3)', whiteSpace: 'nowrap'}}>{txt}</div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${k})`}}>
      <div style={{position: 'absolute', left: 230, top: 400, width: 620, height: 1102, borderRadius: 70, border: '16px solid #111', overflow: 'hidden', background: '#000', boxShadow: '0 24px 0 rgba(0,0,0,.35)'}}>
        <Sequence from={Math.round(t0 * 30)} layout="none">
          <OffthreadVideo src={staticFile('game.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Sequence>
      </div>
      {call('GRÁTIS!', t0 + 2.2, 760, 40, -8)}
      {call('🔍 ACHE SEU @', t0 + 4.2, 1000, 640, 6)}
      {call('🦫 SEU PERSONAGEM NO JOGO', t0 + 6.5, 1460, 150, -3)}
      {call('🛍️ NA LOJINHA · LINK NA BIO', t0 + 10.0, 1600, 150, 3)}
    </div>
  );
};

/** full-screen gameplay clips with ken-burns + punch on cut */
export const GameClips: React.FC<{t: number; clips: {src: string; t0: number; t1: number; from?: number; rate?: number; zoom?: [number, number]; ox?: number; oy?: number}[]}> = ({t, clips}) => {
  const c = clips.find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const k = (t - c.t0) / (c.t1 - c.t0);
  const [z0, z1] = c.zoom ?? [1.0, 1.12];
  const z = z0 + (z1 - z0) * k + 0.08 * (1 - easeOut(clamp((t - c.t0) / 0.25)));
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
      <Sequence from={Math.round(c.t0 * 30)} layout="none">
        <OffthreadVideo src={staticFile(c.src)} muted playbackRate={c.rate ?? 1} startFrom={Math.round((c.from ?? 0) * 30)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z}) translate(${c.ox ?? 0}px, ${c.oy ?? 0}px)`}} />
      </Sequence>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 70%, rgba(0,0,0,.35) 100%)'}} />
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: Math.max(0, 1 - (t - c.t0) / 0.12) * 0.7}} />
    </div>
  );
};

export const Callout: React.FC<{t: number; t0: number; t1: number; text: string; top: number; left?: number; rot?: number; size?: number; bg?: string}> = ({t, t0, t1, text, top, left, rot = -4, size = 58, bg = '#ffd21e'}) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0, 0.3) * (1 - easeOut(ramp(t, t1 - 0.12, t1)));
  return (
    <div style={{position: 'absolute', top, left: left ?? 0, right: left === undefined ? 0 : undefined, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(${rot}deg)`}}>
      <div style={{fontFamily: LILITA, fontSize: size, background: bg, border: '7px solid #111', borderRadius: 30, padding: '8px 28px', boxShadow: '0 10px 0 rgba(0,0,0,.35)', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};
