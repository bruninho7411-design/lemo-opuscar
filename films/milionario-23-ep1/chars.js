// chars.js — the cast: Você (deadpan, hoodie, round glasses), Caio (nervous friend, mustard bomber), Seu Arlindo (laundromat owner)
// One parametric rig for everybody. Local coords: origin between the feet, y down. P.turn ∈ [-1, 1] turns the face (3/4 view).
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const GOLD = '#ffc93a', GOLD2 = '#ffe58a', GOLDS = '#e09a12';
const WHITE = '#ffffff', MOUTH = '#4a1a2a', TONGUE = '#e8637a';

export const YOU = {
  skin: '#f1c9a2', skinS: '#d6a57d', top: '#545a69', topS: '#3d4250', pants: '#2c2b3a', pantsS: '#1f1e2b', shoe: '#f2efe8', shoeS: '#c9c4ba',
  hair: '#6b4630', hairS: '#4d311f', hip: 300, torso: 250, bodyW: 74, headRx: 82, headRy: 94, glasses: true, hood: true, lid: .46, brow: 0,
};
export const CAIO = {
  skin: '#a8714a', skinS: '#86553a', top: '#e3a72a', topS: '#b98418', pants: '#4a6fa5', pantsS: '#37557f', shoe: '#e8392b', shoeS: '#b5271b',
  hair: '#231815', hairS: '#231815', hip: 210, torso: 200, bodyW: 92, headRx: 92, headRy: 88, glasses: false, fade: true, lid: 0, brow: 1,
};
export const ARLINDO = {
  skin: '#ebbd92', skinS: '#cf9a70', top: '#7f8f5c', topS: '#606e42', pants: '#6b5a48', pantsS: '#544536', shoe: '#4a3426', shoeS: '#33241a',
  hair: '#f2f0ea', hairS: '#cfcac0', hip: 240, torso: 220, bodyW: 88, headRx: 84, headRy: 90, glasses: false, bald: true, stache: true, lid: .3, brow: .2,
};
export const FRIEND1 = { ...CAIO, skin: '#f0c49b', skinS: '#d4a077', top: '#ff5fa2', topS: '#d23f80', pants: '#2c2b3a', hair: '#e8b84a', hairS: '#c4952e', fade: false, bun: true, headRx: 84 };
export const FRIEND2 = { ...CAIO, skin: '#7a4a30', skinS: '#5e3622', top: '#3fd0c9', topS: '#2aa39d', pants: '#f2efe8', pantsS: '#c9c4ba', hair: '#1b1210', fade: false, afro: true };

// —— face parts ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 5, skin, closed = false, lw = 6, jitter = 0, wide = 1 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  rx *= wide; ry *= wide;
  shape(ell(cx, cy, rx, ry, 36), {
    fill: WHITE, lw, shade: () => {
      dot(cx + look[0] * rx * .5 + jitter, cy + look[1] * ry * .45, pupil);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.4, cy - ry * 1.5], [cx + rx * 1.4, cy - ry * 1.5], [cx + rx * 1.4, yl], [cx - rx * 1.4, yl + ry * .06]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .06], [cx + rx * 1.2, yl]], lw);
      }
    }
  });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, teeth = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  const P = [...quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), ...quad(rc, [cx, cy + h + sm * k * .6], lc, 14)];
  shape(P, {
    fill: MOUTH, lw, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), WHITE, { boil: .3 });
      fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), TONGUE, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r, col, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— props ——
// Phone: screen glows gold (the film's only glowing thing). scr(): draws the screen content in local coords (w 90 × h 170, centre 0,0)
export function phone(x, y, a = 0, s = 1, { glow = 0, cracked = false, scr = null, buzz = 0, t = 0 } = {}) {
  push(); translate(x + (buzz ? Math.sin(t * 90) * 4 * buzz : 0), y); rotate(a + (buzz ? Math.sin(t * 70) * .05 * buzz : 0)); scale(s);
  if (glow > 0) for (const [r, al] of [[1.9, .18], [1.45, .28]]) fillOnly(rr(-52 * r, -96 * r, 104 * r, 192 * r, 30 * r), `rgba(255,201,58,${al * glow})`, { boil: .6 });
  shape(rr(-52, -96, 104, 192, 18), { fill: '#24212c', lw: 6 });
  shape(rr(-44, -84, 88, 168, 10), {
    fill: glow > 0 ? '#fff6d6' : '#3a4358', lw: 3, shade: () => {
      if (scr) scr();
      if (cracked) { stroke([[-40, -60], [-6, -22], [-20, 10], [10, 40]], 3, { line: '#d8dde8' }); stroke([[-6, -22], [30, -30]], 3, { line: '#d8dde8' }); }
    }
  });
  pop();
}
export function bankScreen(label, value, sub = '', { col = '#1d7a4a' } = {}) {
  return () => {
    fillOnly(rect(-44, -84, 88, 34), col, { boil: .2 });
    text('BANCO', 0, -66, { font: '800 14px "Baloo 2"', fill: '#fff' });
    text(label, 0, -30, { font: '800 11px "Baloo 2"', fill: '#5b5368' });
    text(value, 0, -6, { font: '800 15px "Baloo 2"', fill: '#1b1422' });
    if (sub) text(sub, 0, 22, { font: '800 11px "Baloo 2"', fill: col });
    for (let k = 0; k < 3; k++) fillOnly(rr(-34, 40 + k * 13, 68, 7, 3), '#e6dcc0', { boil: .2 });
  };
}
export function noodleCup(x, y, s = 1, t = 0) {
  push(); translate(x, y); scale(s);
  shape([[-46, -86], [46, -86], [34, 0], [-34, 0]], { fill: '#f7f1e3', lw: 6, shade: () => { fillOnly(rect(-60, -62, 120, 26), '#e8392b', { boil: .3 }); fillOnly([[18, -90], [60, -90], [44, 6], [10, 6]], '#ddd3bd', { boil: .3 }); } });
  shape(ell(0, -86, 48, 11, 24), { fill: '#e8b85a', lw: 5 });
  for (let k = 0; k < 3; k++) stroke(quad([-30 + k * 22, -86], [-20 + k * 22, -98], [-10 + k * 22, -86], 6), 3, { line: '#c4923a' });
  stroke([[-8, -86], [30, -150]], 5, { line: '#c9a46a' }); stroke([[4, -86], [44, -146]], 5, { line: '#c9a46a' });
  for (let k = 0; k < 2; k++) { const ph = (t * .9 + k * .5) % 1, x0 = -16 + k * 30, y0 = -110 - ph * 50; stroke(spline([[x0, y0], [x0 + 9, y0 - 16], [x0 - 5, y0 - 32]], false), 4, { line: `rgba(255,255,255,${.8 * (1 - ph)})` }); }
  pop();
}
export function coinPouch(x, y, s = 1, fill = .5) {
  push(); translate(x, y); scale(s);
  shape(spline([[-36, -40], [36, -40], [50, 10], [30, 44], [-30, 44], [-50, 10]]), { fill: '#a0703c', lw: 6, shade: () => fillOnly(ell(24, 14, 26, 34, 16), '#7f5428', { boil: .3 }) });
  stroke(quad([-36, -40], [0, -26], [36, -40], 10), 5);
  text('R$', 0, 8, { font: '800 26px "Baloo 2"', fill: GOLD, outlineW: 5 });
  pop();
}
export function coin(x, y, r = 16, a = 0) {
  push(); translate(x, y); scale(Math.max(.15, Math.abs(Math.cos(a))), 1);
  shape(ell(0, 0, r, r, 18), { fill: GOLD, lw: 4, shade: () => fillOnly(ell(r * .35, r * .25, r * .7, r * .8, 14), GOLDS, { boil: .2 }) });
  pop();
}
export function keys(x, y, s = 1, a = 0) {
  push(); translate(x, y); rotate(a); scale(s);
  stroke(ell(0, 0, 18, 18, 18), 6, { closed: true });
  for (const [k, ang] of [[0, .5], [1, -.3]]) { push(); rotate(ang); shape([[-5, 14], [5, 14], [5, 62], [12, 62], [12, 70], [5, 70], [5, 78], [-5, 78]], { fill: k ? '#c9ccd6' : GOLD, lw: 4 }); pop(); }
  pop();
}

// —— the rig ——
// P: {x,y,s,face(±1 mirror),turn,sit(0/1),lean,sq,bob,look,lid,brow,blink,wide,mouth:{o,w,sm},armL,armR:{h:[dx,dy],bend,fist,hold},nerv,t,sweat,legs,apron,headTilt,closed}
export function person(D, P) {
  const f = P.face ?? 1, ner = P.nerv ?? 0;
  const jit = ner ? (hash(Math.floor((P.t || 0) * 12) * 3.3) - .5) * 8 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  const sit = P.sit ?? 0, hipY = sit ? -(P.seat ?? 190) : -D.hip, shY = hipY - D.torso, bw = D.bodyW;
  // legs
  const legs = P.legs || [[0, 0], [0, 0]];
  [-1, 1].forEach((sx, i) => {
    const lg = legs[i], hip = [sx * bw * .42, hipY + 10];
    if (sit) {
      const knee = [sx * bw * .58, hipY + 30], ank = [sx * bw * .56 + lg[0], -22 + lg[1]];
      shape(noodle(knee, ank, 0, 44, 38), { fill: D.pants, lw: 7 });
      shape(ell(knee[0], knee[1] - 4, 30, 36, 20), { fill: D.pants, lw: 7, shade: () => fillOnly(ell(knee[0] + 12, knee[1] + 6, 20, 26, 12), D.pantsS, { boil: .3 }) });
      shoe(D, ank);
    } else {
      const ank = [sx * bw * .45 + lg[0], -22 + lg[1]];
      shape(noodle(hip, ank, sx * -4, 46, 38), { fill: D.pants, lw: 7 });
      shoe(D, ank);
    }
  });
  push(); translate(0, hipY); rotate(P.lean ?? 0); translate(0, -hipY);
  const shL = [-bw * .82, shY + 26], shR = [bw * .82, shY + 26];
  const armL = P.armL || { h: [-16, D.torso * .8], bend: -14 }, armR = P.armR || { h: [16, D.torso * .8], bend: 14 };
  const drawArm = (sh, arm) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]], ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    shape(noodle(sh, hp, arm.bend ?? 0, 44, 36), { fill: D.top, lw: 7 });
    if (arm.behind) arm.behind(hp);
    hand(hp[0] + Math.cos(ang) * 8, hp[1] + Math.sin(ang) * 8, ang, 19, D.skin, { fist: !!arm.fist });
    if (arm.hold) arm.hold(hp, ang);
  };
  if (D.hood) shape(spline([[-bw * .9, shY + 30], [-bw * 1.05, shY - 60], [-bw * .6, shY - 150], [0, shY - 175], [bw * .6, shY - 150], [bw * 1.05, shY - 60], [bw * .9, shY + 30]]), { fill: D.topS, lw: 7 });
  drawArm(shL, armL);
  // torso
  const body = spline([[0, shY - 4], [bw * .9, shY + 14], [bw * 1.04, shY + 110], [bw * 1.0, hipY + 16], [0, hipY + 26], [-bw * 1.0, hipY + 16], [-bw * 1.04, shY + 110], [-bw * .9, shY + 14]]);
  shape(body, {
    fill: D.top, lw: 7, shade: () => {
      fillOnly(spline([[bw * .3, shY - 10], [bw * 1.2, shY], [bw * 1.2, hipY + 40], [bw * .5, hipY + 40], [bw * .62, shY + 120]]), D.topS, { boil: .4 });
      if (D.hood) { stroke([[-14, shY + 30], [-18, shY + 110]], 4); stroke([[14, shY + 30], [18, shY + 110]], 4); shape(rr(-bw * .55, hipY - 90, bw * 1.1, 56, 14), { fill: D.topS, lw: 5 }); }
      if (D === CAIO || D.fade !== undefined && !D.hood && !D.bald) { stroke([[0, shY + 4], [0, hipY + 20]], 4); fillOnly(rect(-bw * 1.2, hipY - 10, bw * 2.4, 36), D.topS, { boil: .3 }); }
      if (D.bald) { for (let k = 0; k < 4; k++) dot(4, shY + 60 + k * 40, 6, '#e8dcc0'); stroke([[0, shY + 20], [0, hipY + 20]], 4); }
      if (P.apron) { fillOnly(spline([[-bw * .7, shY + 70], [bw * .7, shY + 70], [bw * .8, hipY + 30], [-bw * .8, hipY + 30]]), P.apron, { boil: .4 }); }
    }
  });
  if (P.apron) { stroke([[-bw * .7, shY + 70], [-bw * .5, shY + 4]], 4); stroke([[bw * .7, shY + 70], [bw * .5, shY + 4]], 4); }
  // neck + head
  const hx = (P.turn ?? 0) * 6;
  shape(noodle([hx, shY + 14], [hx, shY - 40], 0, 46, 46), { fill: D.skin, lw: 6 });
  push(); translate(hx, shY - D.headRy * .9); rotate(P.headTilt ?? 0);
  head(D, P);
  pop();
  drawArm(shR, armR);
  pop();
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-D.headRx - 20, shY - D.headRy * 1.4 + u * 40, 1.1); sweat(D.headRx + 26, shY - D.headRy * 1.2 + ((u + .5) % 1) * 40, .9); }
  pop();
}
function shoe(D, a) {
  shape(spline([[a[0] - 30, a[1] + 22], [a[0] - 26, a[1] - 4], [a[0] + 12, a[1] - 6], [a[0] + 40, a[1] + 8], [a[0] + 36, a[1] + 22]]), { fill: D.shoe, lw: 6, shade: () => fillOnly(rect(a[0] - 40, a[1] + 14, 100, 20), D.shoeS, { boil: .3 }) });
}
function head(D, P) {
  const rx = D.headRx, ry = D.headRy, tr = P.turn ?? 0, fx = tr * rx * .22;
  const lw = 7;
  // back hair / hood
  if (D.afro) shape(spline([[-rx * 1.3, -ry * .2], [-rx * 1.1, -ry * 1.2], [0, -ry * 1.55], [rx * 1.1, -ry * 1.2], [rx * 1.3, -ry * .2], [rx, ry * .1], [-rx, ry * .1]]), { fill: D.hair, lw });
  if (D.bun) shape(ell(-rx * .2, -ry * 1.15, rx * .42, ry * .36, 20), { fill: D.hair, lw });
  // ears
  for (const sx of [-1, 1]) shape(ell(sx * rx * .98 + fx * .3, 8, 16, 24, 16), { fill: D.skin, lw: 6, shade: () => fillOnly(ell(sx * rx * .98 + fx * .3, 10, 6, 12, 10), D.skinS, { boil: .3 }) });
  shape(ell(0, 0, rx, ry, 60), {
    fill: D.skin, lw, shade: () => {
      fillOnly(ell(rx * .55 - fx * .5, ry * .3, rx * .7, ry * .9, 30), D.skinS, { boil: .3 });
      if (D.fade) { fillOnly(spline([[-rx * 1.2, -ry * .3], [-rx * .9, -ry * .9], [0, -ry * 1.15], [rx * .9, -ry * .9], [rx * 1.2, -ry * .4], [rx * .7, -ry * .74], [0, -ry * .86], [-rx * .7, -ry * .74]]), D.hair, { boil: .3 });
        fillOnly(rect(-rx * 1.3, -ry * .5, rx * 2.6, ry * .22), 'rgba(35,24,21,.35)', { boil: .2 });
        stroke([[rx * .35, -ry * .78], [rx * .55, -ry * .62]], 4, { line: D.skin }); }
      if (D.bald) { fillOnly(ell(-rx * .3, -ry * .55, rx * .25, ry * .12, 14), 'rgba(255,255,255,.45)', { boil: .2 }); }
    }
  });
  if (D.bald) for (const sx of [-1, 1]) shape(spline([[sx * rx * .8, -ry * .35], [sx * rx * 1.12, -ry * .2], [sx * rx * 1.08, ry * .25], [sx * rx * .86, ry * .15]]), { fill: D.hair, lw: 5 });
  // messy hair (você)
  if (D.hood) {
    const H = [[-rx * 1.04, -ry * .1], [-rx * 1.12, -ry * .62], [-rx * .82, -ry * .78], [-rx * .9, -ry * 1.08], [-rx * .4, -ry * .98], [-rx * .3, -ry * 1.22], [rx * .1, -ry * 1.04], [rx * .4, -ry * 1.2], [rx * .55, -ry * .94], [rx * .98, -ry * .98], [rx * .92, -ry * .62], [rx * 1.12, -ry * .4], [rx * .96, -ry * .18], [rx * .6, -ry * .5], [rx * .2, -ry * .36], [-rx * .3, -ry * .5], [-rx * .7, -ry * .3]];
    shape(spline(H.map(p => [p[0] + fx * .3, p[1]])), { fill: D.hair, lw, shade: () => fillOnly(ell(rx * .5, -ry * .7, rx * .5, ry * .3, 16), D.hairS, { boil: .3 }) });
  }
  // eyes
  const look = P.look || [0, 0], lid = P.blink ? 1 : clamp(P.lid ?? D.lid, 0, 1), wide = P.wide ?? 1;
  const shake = P.nerv ? (hash(Math.floor((P.t || 0) * 24) * 1.7) - .5) * 3 * P.nerv : 0;
  const er = D.glasses ? [28, 32] : D === ARLINDO ? [20, 22] : [30, 34], ex = rx * .38, ey = -4;
  for (const sx of [-1, 1]) {
    const sz = 1 + sx * tr * .1;
    eye(sx * ex + fx, ey, er[0] * sz, er[1] * sz, { lid, look, skin: D.skin, closed: P.closed, jitter: shake, wide, pupil: D === CAIO ? 4.4 : 5 });
  }
  if (D.glasses) {
    for (const sx of [-1, 1]) { const P2 = ell(sx * ex + fx, ey, 40, 38, 34); shape(P2, { line: INK, lw: 7 }); stroke(arc(sx * ex + fx - 12, ey - 12, 20, 18, Math.PI * 1.1, Math.PI * 1.45, 6), 4, { line: '#ffffff' }); }
    stroke([[-ex + 40 + fx, ey - 4], [ex - 40 + fx, ey - 4]], 6);
    stroke([[-ex - 40 + fx, ey - 6], [-rx * .98, ey - 10]], 5); stroke([[ex + 40 + fx, ey - 6], [rx * .98, ey - 10]], 5);
  }
  // brows
  const br = P.brow ?? D.brow, by = ey - (D.glasses ? 54 : 42);
  for (const sx of [-1, 1]) stroke([[sx * ex * .35 + fx, by - br * (D.glasses ? 10 : 6)], [sx * ex * 1.45 + fx, by + br * 4 - (br < 0 ? -br * 12 : 0)]], D === ARLINDO ? 9 : 7, { line: D === ARLINDO ? D.hairS : INK });
  // nose
  shape(spline([[fx + 2, 18], [fx + 16, 38], [fx + 6, 48], [fx - 10, 44]]), { fill: D.skin, lw: 5, shade: () => fillOnly(ell(fx + 8, 44, 10, 6, 10), D.skinS, { boil: .3 }) });
  // moustache
  const m = P.mouth || {};
  const my = ry * .66;
  mouth(fx * 1.1, my, D === CAIO ? 52 : 46, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? (D === YOU ? -.2 : 0), skew: m.skew || 0, lw: 6, teeth: true });
  if (D.stache) shape(spline([[fx - 50, my - 2], [fx - 30, my - 26], [fx, my - 18], [fx + 30, my - 26], [fx + 50, my - 2], [fx + 20, my - 10], [fx, my - 6], [fx - 20, my - 10]]), { fill: D.hair, lw: 5 });
}

// Sofa (front view, seat top at y=0, centred at x); w = width
export function sofa(x, y, w, col, colS, { back = true } = {}) {
  push(); translate(x, y);
  if (back) shape(rr(-w / 2, -250, w, 260, 40), { fill: col, lw: 7, shade: () => fillOnly(rect(-w / 2, -60, w, 80), colS, { boil: .3 }) });
  shape(rr(-w / 2 + 40, -10, w - 80, 120, 26), { fill: col, lw: 7, shade: () => fillOnly(rect(-w / 2, 60, w, 80), colS, { boil: .3 }) });
  stroke([[0, -8], [0, 104]], 5);
  for (const sx of [-1, 1]) shape(rect(sx * (w / 2 - 50) - 10, 128, 20, 40), { fill: '#5a3d28', lw: 5 });
  pop();
  return () => {   // front part drawn after the characters: the armrests
    push(); translate(x, y);
    for (const sx of [-1, 1]) shape(rr(sx > 0 ? w / 2 - 90 : -w / 2 - 10, -120, 100, 250, 40), { fill: col, lw: 7, shade: () => fillOnly(rect(sx > 0 ? w / 2 - 40 : -w / 2 - 20, -130, 60, 280), colS, { boil: .3 }) });
    pop();
  };
}
