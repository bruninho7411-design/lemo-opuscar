// POV: você ficou milionário aos 23 — EP 2 · O segredo vazou (Brick Toy, vertical 1080×1920)
import * as THREE from 'three';
import { makePost } from './post.js';
import { clamp, seg, eio, eo, ei, ss, lerp, hash, back } from '/core/lib.js';
import { COL, BRICK, PLATE, brick, plate, mesh, roundGeo, plastic } from './bricks.js';
import { makeFig, walkPose, SHOULDER, HEAD_H } from './figs.js';
import { buildWorld, signTile, canvasTex, L1, L2, L3, FLAT, PHONE, STREET_Z } from './world.js';
import { q, build } from './story.js';

const W = 1080, H = 1920, Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') ?? 1);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, .3, 3000);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, ao: Q.get('ao') !== '0', aoRadius: 3, aoThickness: 3, aoAmt: .85,
  msaa: +(Q.get('msaa') ?? 2), dofTaps: +(Q.get('taps') ?? 48), aoSamples: +(Q.get('aos') ?? 8) });   // software GL: lighter defaults
post.bloom.strength = .22; post.bloom.threshold = 1.1;
const VG = post.vig.uniforms; VG.amt.value = .38; VG.contrast.value = .24; VG.sat.value = 1.1;

const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = await J('lines.json'), DURS = (await J('voices/dur.json')) || {}, LIPS = (await J('voices/lips.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
for (const l of LINES) if (DURS[l.id] == null) DURS[l.id] = .6 + l.text.length * .065;
const { VO, T, DUR, SHOTS, STAMPS, CUES } = build(DURS);
const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

const world = await buildWorld(scene);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const you = makeFig('you'), caio = makeFig('caio'), suit = makeFig('suit');
scene.add(you.root, caio.root, suit.root);
// Caio's crossed fingers (only seen from behind in the promise shot)
const fingers = new THREE.Group(); caio.arms[0].hand.add(fingers);
for (const a of [.42, -.42]) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(.17, .85, 4, 12), plastic(caio.D.skin)); f.rotation.z = a; f.position.y = -.55; fingers.add(f); }

// —— gains and maths: printed tiles that snap onto laundromat 1's back wall and folding table ——
const tileMk = (w, h, bg, fg, txt, sub) => signTile(w, h, bg, (c, cw, ch) => {
  c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = fg;
  if (sub) { c.font = `700 ${ch * .46}px Fredoka`; c.fillText(txt, cw / 2, ch * .4); c.font = `600 ${ch * .22}px Fredoka`; c.fillText(sub, cw / 2, ch * .8); }
  else { c.font = `700 ${ch * .56}px Fredoka`; c.fillText(txt, cw / 2, ch * .54); }
});
const TILES = [
  { m: tileMk(4.6, 2.4, '#f4f4f1', '#1b2a34', '8×', 'POR DIA'), p: V(-5.2, 8.0, -10.7), t: () => T.tile1, u: () => T.gain - .15 },
  { m: tileMk(4.6, 2.4, '#36aebf', '#ffffff', '12', 'MÁQUINAS'), p: V(0, 8.0, -10.7), t: () => T.tile2, u: () => T.gain + .25 },
  { m: tileMk(4.6, 2.4, '#c91a09', '#ffffff', '3', 'LOJAS'), p: V(5.2, 8.0, -10.7), t: () => T.tile3, u: () => T.gain + .65 },
  { m: tileMk(4.6, 2.4, '#f2cd37', '#1b2a34', '+R$ 9 MIL', 'LOJA 1'), p: V(-5.2, 8.0, -10.6), t: () => T.gain, u: () => T.total - .1, gain: 1 },
  { m: tileMk(4.6, 2.4, '#f2cd37', '#1b2a34', '+R$ 9 MIL', 'LOJA 2'), p: V(0, 8.0, -10.6), t: () => T.gain + .4, u: () => T.total - .1, gain: 1 },
  { m: tileMk(4.6, 2.4, '#f2cd37', '#1b2a34', '+R$ 9 MIL', 'LOJA 3'), p: V(5.2, 8.0, -10.6), t: () => T.gain + .8, u: () => T.total - .1, gain: 1 },
  { m: tileMk(14, 2.6, '#1b2a34', '#f2cd37', 'R$ 27 MIL / MÊS'), p: V(0, 7.9, -10.5), t: () => T.total, u: () => T.sil, gain: 1 },
];
TILES.forEach(o => { world.L[0].g.add(o.m); o.m.visible = false; });
function tiles(t) {
  for (const o of TILES) {
    const t0 = o.t(), u = (t - t0) / .28;
    o.m.visible = t >= t0 - .28 && t < o.u();
    if (!o.m.visible) continue;
    const k = clamp(u + 1), y = u < 0 ? lerp(6, 0, ei(k)) : -.35 * Math.exp(-u * 4) * Math.cos(u * 8) * (u < 1.2 ? 1 : 0);
    o.m.position.copy(o.p).add(V(0, y, 0)); o.m.rotation.set(0, 0, u < 0 ? (1 - k) * .4 : 0);
  }
}

// —— lip sync + faces ——
function talk(who, t) {
  const tq = q(t);
  for (const [id, t0] of Object.entries(VO)) {
    if (LINE[id].who !== who) continue;
    if (tq >= t0 && tq < t0 + DURS[id]) { const k = Math.floor((tq - t0) * 24), lp = LIPS[id]; const o = lp ? lp.o[k] ?? 0 : .5, b = lp ? lp.b[k] ?? .5 : .5; return { o, w: .8 + .4 * b - .2 * o, talking: true }; }
  }
  return { o: 0, w: 1, talking: false };
}
const blink = (t, seed) => { const k = Math.floor(t * 12), c = Math.floor(k / 40); return k % 40 < 2 && hash(c * 3.7 + seed) > .2; };
const face = (who, t, o = {}) => { const m = talk(who, t); return { blink: blink(t, who.charCodeAt(0)), mouth: { o: m.o * 1.1, w: m.w, sm: o.sm ?? 0 }, look: o.look || [0, 0], lid: o.lid ?? 0, brow: o.brow ?? 0, wide: o.wide ?? 1 }; };

// —— performance per shot ——
const OFF = { x: 0, y: -100, z: 0, vis: false };
const flatW = (x, z) => V(FLAT.x + x, 0, FLAT.z + z);
const SEAT_Y = BRICK * 1.5 + PLATE - .7;
function act(t, name) {
  const tq = q(t), P = {};
  const nodTalk = (who) => talk(who, t).talking ? (talk(who, t).o - .3) * .08 : 0;
  if (name === 'hook' || name === 'rewind' || name === 'phone2') {
    const b = world.phone, rel = V(-3.6, 0, 12).applyAxisAngle(V(0, 1, 0), b.rotation.y).add(b.position);
    const look = name === 'phone2' ? ss(seg(t, T.phone2 + 1.5, T.phone2 + 2.2)) : 0;
    P.you = { x: rel.x, y: 0, z: rel.z, ry: b.rotation.y + .55 - look * .5, nod: -.42 + look * .38, turn: -.35 + look * .35, armL: [-.1, .12], armR: name === 'phone2' ? [-.1, .1] : [-1.6 + Math.sin(tq * 3) * .04, .25], face: face('y', t, { look: [.4 - look * .4, -.6 + look * .5], wide: name === 'phone2' ? 1.15 : 1.05, brow: .8 }) };
    P.caio = OFF; P.suit = OFF;
  } else if (name === 'recap') {
    P.you = { ...OFF }; P.caio = OFF; P.suit = OFF;
  } else if (name === 'sofa' || name === 'cuYou') {
    const ask = talk('c', t).talking;
    P.caio = { ...flatW(-3.6, -8.4), y: SEAT_Y + .7, sit: 1, ry: .3, turn: .35, nod: .05 + nodTalk('c'), armR: ask ? [-1.1, .35] : [-.6, .1], armL: [-.5, .05],
      face: face('c', t, { look: [.5, .2], wide: 1.12, brow: 1, sm: -.2 }) };
    const glance = name === 'cuYou' ? ss(seg(t, T.cuYou + .3, T.cuYou + .8)) : 0;
    P.you = { ...flatW(1.6, -8.4), y: SEAT_Y + .7, sit: 1, ry: -.3, turn: lerp(-.45, .2, glance), nod: lerp(.15, -.05, glance), armL: [-.55, .05], armR: [-.55, .05],
      face: face('y', t, { look: [lerp(-.6, 0, glance), lerp(.4, 0, glance)], lid: .3, brow: glance * -.3 }) };
    P.suit = OFF;
  } else if (name === 'walk') {
    const u = seg(t, T.walk, T.inside), x = lerp(-27, -5, u), z = 2.2;
    const wp = walkPose(x / 2.6 * Math.PI * 2, .5), wp2 = walkPose(x / 2.6 * Math.PI * 2 + 1.2, .5);
    P.you = { x, y: .7, z, ry: Math.PI / 2, ...wp, face: face('y', t, { lid: .2 }) };
    P.caio = { x: x - 3.2, y: .7, z: z + .4, ry: Math.PI / 2, ...wp2, turn: -.2, face: face('c', t, { look: [.6, 0], wide: 1.05 }) };
    P.suit = OFF;
  } else if (['inside', 'cuCaio', 'follow', 'promise'].includes(name)) {
    const inF = L1, y = PLATE;
    const awe = name === 'inside' ? ss(seg(t, T.tile1, T.tile1 + .5)) : 1;
    if (name === 'promise') {
      const sh = seg(t, T.shake - .3, T.shake) * (1 - seg(t, T.orbit + 1.6, T.orbit + 2.0)), shk = Math.sin(tq * 20) * .12 * sh;
      P.you = { x: inF.x + 2.2, y, z: -1.2, ry: -Math.PI / 2 + .25, turn: -.1, armR: [lerp(-.1, -1.4, sh) + shk, .1], face: face('y', t, { look: [-.4, 0], lid: .25, brow: -.2 }) };
      P.caio = { x: inF.x - 2.2, y, z: -1.2, ry: Math.PI / 2 - .25, turn: .1, armR: [lerp(-.1, -1.4, sh) - shk, -.1], armL: [lerp(0, .7, ss(seg(t, VO.c3 - .3, VO.c3))), -.45],
        face: face('c', t, { look: [.4, 0], wide: 1.05, sm: talk('c', t).talking ? .2 : .6 }) };
    } else if (name === 'inside') {   // over the shoulders: both backs in the foreground corners, the wall of machines and numbers ahead
      P.you = { x: inF.x + 5.4, y, z: -2.2, ry: Math.PI + .35, nod: -.22, armL: [-.1, .1], armR: [-.1, .1], face: face('y', t) };
      P.caio = { x: inF.x - 5.4, y, z: -2.2, ry: Math.PI - .35, nod: -.25 - .1 * awe, armL: [-.1, .1 + awe * .3], armR: [-.1, .1 + awe * .3], face: face('c', t) };
    } else {
      P.you = { x: inF.x + (name === 'follow' ? 2.6 : 5.6), y, z: name === 'follow' ? -4.6 : -1.6, ry: name === 'follow' ? .15 : -.6, turn: name === 'follow' ? 0 : .3, armL: [-.2, .1], armR: name === 'inside' ? [lerp(-.2, -1.9, ss(seg(t, T.tile1 - .5, T.tile1))) * (1 - ss(seg(t, T.tile3 + .6, T.tile3 + 1))), .2] : [-.2, .1],
        face: face('y', t, { look: name === 'follow' ? [0, 0] : [-.4, -.3], lid: name === 'follow' ? .15 : .25, sm: name === 'follow' ? .5 : 0 }) };
      P.caio = { x: inF.x - (name === 'inside' ? 5.6 : 2.4), y, z: name === 'inside' ? -1.6 : -4.4, ry: name === 'cuCaio' ? .45 : name === 'inside' ? .6 : .2, turn: .2, nod: -.2 * awe + nodTalk('c'), armL: [-.1, .1 + awe * .2], armR: [-.1, .1 + awe * .2],
        face: face('c', t, { look: [.2, -.7 * awe], wide: 1 + .25 * awe, brow: 1.2 * awe, sm: -.1 }) };
    }
    P.suit = OFF;
  } else if (name === 'street' || name === 'cuSuit') {
    P.you = OFF; P.caio = OFF;
    const st = T.carStop, u = seg(t, st + .4, st + 1.6), walking = t > st + .4 && t < st + 1.6;
    const x = lerp(9.4, 2.4, u), z = lerp(6.4, 2.6, u);
    P.suit = { x, y: walking ? lerp(.3, .7, u) : u >= 1 ? .7 : .3, z, ry: name === 'cuSuit' ? .1 : lerp(-.6, .25, u), vis: t > st + .3, ...(walking ? walkPose(u * 9, .45) : {}), armL: [-.05, .06], armR: [-.05, .06],
      nod: name === 'cuSuit' ? .05 + (talk('s', t).talking ? (talk('s', t).o - .3) * .06 : 0) : 0, face: face('s', t, { sm: .25 }) };
  } else { P.you = OFF; P.caio = OFF; P.suit = OFF; }
  return P;
}

// —— camera per shot ——
const headW = fig => { fig.root.updateMatrixWorld(true); return fig.head.getWorldPosition(V(0, 0, 0)).add(V(0, HEAD_H / 2, 0)); };
function cam(t, st) {
  const [t0, t1, name] = st, u = seg(t, t0, t1);
  let pos, look, fov = 40, focus, aper = 600, span = 40;
  const ph = world.phone, PR = (x, y, z) => V(x, y, z).applyAxisAngle(V(0, 1, 0), ph.rotation.y).add(ph.position);
  switch (name) {
    case 'hook': {
      pos = PR(-.5, 2.2, 44).lerp(PR(-1, 2.6, 38), eio(u)); look = PR(-1.4, 9.4, 3); fov = 42;
      const rack = ss(seg(t, VO.n2 + .35, VO.n2 + .9)); focus = PR(0, 12, 3).lerp(headW(you), rack); aper = 420; span = 34; break;
    }
    case 'rewind': { const k = ei(u); pos = PR(-1, 2.6, 38).lerp(PR(30, 60, 100), k); look = PR(-1.4, 9.4, 3).lerp(V(-10, 0, -6), k); fov = 44 + k * 8; focus = look; aper = 300; span = 60; break; }
    case 'recap': { pos = V(30, 95, 105).lerp(V(14, 26, 44), eio(u)); look = V(8, 2, -6).lerp(V(4, 6, -6), u); fov = 42; focus = V(L1.x, 8, L1.z - 4); aper = lerp(250, 450, u); span = 80; break; }
    case 'sofa': pos = flatW(-1, 17).add(V(0, 9.5, 0)).lerp(flatW(-1, 14.5).add(V(0, 8.8, 0)), eio(u)); look = flatW(-1, -6).add(V(0, 4.2, 0)); fov = 40; focus = flatW(-1, -8).add(V(0, 5.4, 0)); aper = 560; span = 24; break;
    case 'cuYou': { const h = headW(you); pos = h.clone().add(V(-2.2, .2, 10)).lerp(h.clone().add(V(-1.9, .1, 8.8)), u); look = h.clone().add(V(0, -.9, 0)); fov = 40; focus = h; aper = 700; span = 16; break; }
    case 'walk': { const x = lerp(-27, -5, u); pos = V(x - .5, 3.6, 27); look = V(x - 2.2, 4.6, 1); fov = 40; focus = V(x - 1, 5.5, 2.4); aper = 520; span = 30; break; }
    case 'inside': {
      const a = lerp(.16, -.1, eio(u)), r = lerp(27, 24, eio(u)); pos = V(L1.x + Math.sin(a) * r, lerp(6.6, 7.0, u), L1.z - 5.5 + Math.cos(a) * r); look = V(L1.x, lerp(6.0, 6.4, u), -8); fov = 50;
      focus = V(0, 7, -10.4); aper = 360; span = 24; break;
    }
    case 'cuCaio': { const h = headW(caio); pos = h.clone().add(V(2.4, .3, 10)).lerp(h.clone().add(V(2.1, .2, 8.6)), u); look = h.clone().add(V(0, -.9, 0)); fov = 40; focus = h; aper = 720; span = 16; break; }
    case 'follow': { const h = headW(you); pos = h.clone().add(V(.8, -1.2, 16)).lerp(h.clone().add(V(.6, -1, 14)), u); look = h.clone().add(V(0, -3.2, 0)); fov = 40; focus = h; aper = 650; span = 18; break; }
    case 'promise': {
      const c = V(L1.x, 0, -1.2);
      if (t < T.orbit) { pos = c.clone().add(V(0, 6.6, 24)).lerp(c.clone().add(V(0, 6.2, 20.5)), eio(seg(t, t0, T.orbit))); look = c.clone().add(V(0, 4.6, 0)); fov = 40; focus = c.clone().add(V(0, 5.8, 0)); aper = 520; }
      else {   // the reveal: low behind Caio, pushing in on the crossed fingers, You's face soft beyond
        const k = eio(seg(t, T.orbit, t1)), hw = caio.arms[0].hand.getWorldPosition(V(0, 0, 0));
        pos = V(L1.x - 13, 3.6, 10).lerp(V(L1.x - 11.5, 3.3, 8.6), k); look = hw.clone().add(V(.8, .45, 0)); fov = 32;
        focus = hw; aper = 600;
      }
      span = 22; break;
    }
    case 'phone2': pos = PR(-3.5, 2.4, 43).lerp(PR(-2.5, 2.8, 36), eio(u)); look = PR(-1.6, 9.4, 3); fov = 42; focus = t < T.phone2 + 1.6 ? PR(0, 12, 3) : headW(you); aper = 420; span = 34; break;
    case 'street': {
      const cx = lerp(24, 12, eio(seg(t, T.street, T.carStop + .4)));
      pos = V(cx + 4, 2.2, 34).lerp(V(4.5, 2.4, 25), eio(seg(t, T.carStop, t1))); look = V(cx - 4, 5, 2).lerp(V(3, 5.4, 2), eio(seg(t, T.carStop, t1)));
      fov = 42; focus = t < T.carStop + .5 ? world.CAR.g.position.clone().add(V(0, 2, 0)) : headW(suit); aper = 480; span = 36; break;
    }
    case 'cuSuit': { const h = headW(suit); pos = h.clone().add(V(.5, -.6, 11)).lerp(h.clone().add(V(.4, -.5, 8.4)), eio(u)); look = h.clone().add(V(0, -1, 0)); fov = 40; focus = h; aper = 750; span = 16; break; }
    default: { const h = V(L1.x, 6, L1.z); pos = V(8, 5, 34).lerp(V(4, 22, 70), eio(u)); look = h; fov = 42; focus = h; aper = 300; span = 50; }
  }
  camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look);
  world.aimKey(focus || look, span, world.isNight ? [50, 120, 40] : [-70, 100, 60]);
  post.dof.focus = camera.position.distanceTo(focus || look); post.dof.aper = aper; post.dof.maxCoc = 14;
}

// —— the phone's screen: Caio's post going viral ——
const CAPA = Q.get('capa') === '1';   // cover: no caption, the counter at a million
const viewsAt = t => {
  if (CAPA) return 1000000;
  if (t < T.rew) { const k = seg(t, T.views, T.rew - .1); return Math.round(lerp(1204, 312000, Math.pow(k, 2.2))); }
  if (t < T.recap) return Math.round(lerp(312000, 0, ei(seg(t, T.rew, T.recap))));
  return Math.round(lerp(312000, 1000000, eo(seg(t, T.phone2 + .3, VO.n11 + DURS.n11 * .8))));
};
const fmtN = n => n.toLocaleString('pt-BR');
function drawScreen(g, w, h, t, views) {
  g.fillStyle = '#0d0f14'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.font = '600 26px Fredoka'; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText(t < T.recap ? '07:12' : '07:00', 34, 34); g.textAlign = 'right'; g.fillText('5G ▮▮▮', w - 34, 34);
  // video frame
  const gr = g.createLinearGradient(0, 80, 0, 1010); gr.addColorStop(0, '#2b3a5a'); gr.addColorStop(1, '#141824'); g.fillStyle = gr; g.fillRect(0, 80, w, 930);
  // the photo: a brick figure with round glasses (you) and a money stack
  g.save(); g.translate(0, 150);
  g.fillStyle = '#f3c9a1'; g.beginPath(); g.roundRect(170, 300, 200, 190, 40); g.fill();
  g.fillStyle = '#6b4630'; g.beginPath(); g.roundRect(160, 270, 220, 70, 30); g.fill();
  g.strokeStyle = '#1b1414'; g.lineWidth = 9; for (const x of [230, 310]) { g.beginPath(); g.arc(x, 395, 30, 0, 7); g.stroke(); }
  g.fillStyle = '#555b6a'; g.beginPath(); g.roundRect(130, 500, 280, 240, 30); g.fill();
  g.fillStyle = '#f2cd37'; for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(380, 680 - i * 34, 120, 30, 6); g.fill(); }
  g.restore();
  // headline + views
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 80, w, 170);
  g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '700 44px Fredoka'; g.fillText('MEU AMIGO É', w / 2, 132);
  g.fillStyle = '#f2cd37'; g.font = '700 52px Fredoka'; g.fillText('MILIONÁRIO AOS 23', w / 2, 196);
  g.fillStyle = '#ff3b5c'; g.beginPath(); g.roundRect(40, 268, w - 80, 104, 52); g.fill();
  g.fillStyle = '#fff'; g.font = '700 58px Fredoka'; g.fillText(`◉ ${fmtN(views)}`, w / 2, 322);
  g.font = '600 22px Fredoka'; g.fillStyle = '#dfe3ea'; g.fillText('VISUALIZAÇÕES', w / 2, 398);
  g.fillStyle = '#fff'; g.font = '600 30px Fredoka'; g.fillText('e ninguém sabe...', w / 2, 960);
  // creator row
  g.fillStyle = '#e3a72a'; g.beginPath(); g.arc(70, 1066, 34, 0, 7); g.fill();
  g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = '700 32px Fredoka'; g.fillText('@caio.oficial', 120, 1056); g.font = '500 24px Fredoka'; g.fillStyle = '#aab'; g.fillText('agora mesmo', 120, 1090);
}
let lastViews = -1, lastScr = '';
function screen(t, name) {
  const v = viewsAt(t), key = name + v;
  if (key !== lastScr) { world.SCR.redraw(t, v); lastScr = key; }
}
world.SCR.redraw = (t, v) => { const { g, c } = world.SCR; g.setTransform(1, 0, 0, 1, 0, 0); drawScreen(g, c.width, c.height, t, v); world.SCR.t.needsUpdate = true; };

// —— 2D layer: subtitles, title, stamps, follow, end card ——
const ov = document.getElementById('ov'), g = ov.getContext('2d');
const WHO = { n: null, y: ['VOCÊ', '#8a93a6'], c: ['CAIO', '#e3a72a'], s: ['???', '#f2cd37'] };
function wrap(str, maxW, font) { g.font = font; const words = str.split(' '), out = []; let cur = ''; for (const w of words) { const c = cur ? cur + ' ' + w : w; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = w; } else cur = c; } if (cur) out.push(cur); return out; }
function brickIcon(x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.roundRect(0, 8, 58, 26, 5); g.fill();
  g.beginPath(); g.roundRect(7, 0, 18, 10, 3); g.roundRect(33, 0, 18, 10, 3); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 28, 58, 6); g.restore();
}
const CUTS = SHOTS.map(s => s[0]).filter(x => x > 0);
const SUBS = Object.entries(VO).map(([id, t0]) => {
  const d = DURS[id]; let t1 = t0 + Math.max(d + .6, 1.8);
  const nxt = Object.values(VO).filter(v => v > t0 + .05).sort((a, b) => a - b)[0];
  if (nxt != null && t1 > nxt - .03) t1 = Math.max(nxt - .03, t0 + d + .1);
  return { id, t0, t1: +t1.toFixed(3), who: LINE[id].who, text: LINE[id].sub };
});
function subs(t) {
  const s = SUBS.find(s => t >= s.t0 && t < s.t1); if (!s) return;
  const font = '600 54px Fredoka', lines = wrap(s.text, 780, font), lh = 66, ph = lines.length * lh + 40, y = 1560 - ph;
  const pw = Math.max(...lines.map(l => g.measureText(l).width)) + 150, x = (W - pw) / 2, pop = back(seg(t, s.t0, s.t0 + .14), 2);
  g.save(); g.translate(W / 2, y + ph / 2); g.scale(lerp(.92, 1, pop), lerp(.92, 1, pop)); g.translate(-W / 2, -(y + ph / 2));
  g.fillStyle = 'rgba(16,18,24,.72)'; g.beginPath(); g.roundRect(x, y, pw, ph, 36); g.fill();
  const who = WHO[s.who];
  brickIcon(x + 32, y + ph / 2 - 17, .9, who ? who[1] : '#ffffff');
  if (who) { g.font = '700 26px Fredoka'; const tw = g.measureText(who[0]).width + 40; g.fillStyle = who[1]; g.beginPath(); g.roundRect(x + 30, y - 22, tw, 40, 20); g.fill(); g.fillStyle = '#12141a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(who[0], x + 30 + tw / 2, y - 1); }
  g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = font;
  lines.forEach((l, k) => g.fillText(l, x + 112, y + 20 + lh / 2 + k * lh + 2));
  g.restore();
}
function seriesBadge(t) {   // top: series + episode
  if (t >= T.end) return;
  if (t >= T.rew) { g.save(); g.fillStyle = 'rgba(16,18,24,.66)'; g.beginPath(); g.roundRect(W - 250, 56, 196, 56, 28); g.fill(); g.fillStyle = '#c91a09'; g.beginPath(); g.roundRect(W - 246, 60, 86, 48, 24); g.fill();
    g.fillStyle = '#fff'; g.font = '700 28px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EP 2', W - 203, 85); g.font = '600 24px Fredoka'; g.fillText('/ 30', W - 100, 85); g.restore(); return; }
  const s = back(seg(q(t), 0, .3), 2), a = 1 - ss(seg(t, T.rew - .3, T.rew));
  g.save(); g.globalAlpha = a; g.translate(W / 2, 230); g.scale(s, s);
  g.fillStyle = 'rgba(16,18,24,.78)'; g.beginPath(); g.roundRect(-430, -96, 860, 192, 40); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = '600 40px Fredoka'; g.fillText('POV: VOCÊ FICOU MILIONÁRIO AOS 23', 0, -36);
  g.fillStyle = '#f2cd37'; g.font = '700 74px Fredoka'; g.fillText('O SEGREDO VAZOU', 0, 34);
  g.fillStyle = '#c91a09'; g.beginPath(); g.roundRect(300, -130, 150, 60, 18); g.fill(); g.fillStyle = '#fff'; g.font = '700 38px Fredoka'; g.fillText('EP 2', 375, -98);
  g.restore();
}
function stamps(t) {
  for (const [a, b, txt] of STAMPS) {
    if (t < a || t >= b) continue;
    const s = back(seg(q(t), a, a + .25), 2.4), big = txt.length > 6;
    g.save(); g.translate(60, 150); g.scale(s, s);
    g.font = `700 ${big ? 50 : 64}px Fredoka`; const tw = g.measureText(txt).width + 110;
    g.fillStyle = '#f2cd37'; g.beginPath(); g.roundRect(0, 0, tw, big ? 82 : 96, 18); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, (big ? 82 : 96) - 10, tw, 10);
    g.fillStyle = '#1b2a34'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(txt, 82, (big ? 82 : 96) / 2 + 2);
    g.beginPath(); g.arc(44, (big ? 82 : 96) / 2, 18, 0, 7); g.lineWidth = 6; g.strokeStyle = '#1b2a34'; g.stroke(); g.beginPath(); g.moveTo(44, (big ? 82 : 96) / 2); g.lineTo(44, (big ? 82 : 96) / 2 - 11); g.moveTo(44, (big ? 82 : 96) / 2); g.lineTo(53, (big ? 82 : 96) / 2 + 4); g.stroke();
    g.restore();
  }
}
function followTile(t, x, y, t0, tc) {
  const s = back(seg(q(t), t0, t0 + .3), 2); if (s <= 0) return;
  const done = t >= tc;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#f4f4f1'; g.beginPath(); g.roundRect(-400, -70, 800, 140, 26); g.fill(); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-400, 56, 800, 14);
  for (const sx of [-300, -150, 0, 150, 300]) { g.fillStyle = '#e4e4de'; g.beginPath(); g.roundRect(sx - 40, -92, 80, 26, 8); g.fill(); }
  brickIcon(-370, -20, .8, '#f2cd37');
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#1b2a34'; g.font = '700 40px Fredoka'; g.fillText('MILIONÁRIO AOS 23', -300, -16); g.font = '500 28px Fredoka'; g.fillStyle = '#6c6e68'; g.fillText('série · 30 episódios', -300, 26);
  const pb = done ? back(seg(t, tc, tc + .2), 3) : 1;
  g.save(); g.translate(250, 0); g.scale(lerp(.85, 1, pb), lerp(.85, 1, pb));
  g.fillStyle = done ? '#6c6e68' : '#c91a09'; g.beginPath(); g.roundRect(-125, -44, 250, 88, 22); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '700 36px Fredoka'; g.fillText(done ? 'SEGUINDO ✓' : '+ SEGUIR', 0, 3); g.restore();
  if (t > tc - .7 && t < tc + .6) {   // a brick hand presses the button
    const k = eo(seg(t, tc - .7, tc - .1)), hx = lerp(560, 280, k), hy = lerp(260, 30, k) + (Math.abs(t - tc) < .1 ? 10 : 0);
    g.fillStyle = '#f3c9a1'; g.beginPath(); g.arc(hx, hy, 38, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.arc(hx + 8, hy + 8, 30, 0, 7); g.fill();
    g.fillStyle = '#555b6a'; g.beginPath(); g.roundRect(hx - 30, hy + 28, 60, 140, 20); g.fill();
  }
  g.restore();
}
function endCard(t) {
  const a = ss(seg(t, T.end, T.end + .4));
  g.fillStyle = `rgba(10,12,16,${.55 * a})`; g.fillRect(0, 0, W, H);
  const s1 = back(seg(q(t), T.end + .1, T.end + .4), 2.2), s2 = back(seg(q(t), T.end + .5, T.end + .8), 2.2);
  g.save(); g.translate(W / 2, 640); g.scale(s1, s1); g.textAlign = 'center'; g.textBaseline = 'middle';
  // "EP 3" as a red brick
  g.fillStyle = '#c91a09'; g.beginPath(); g.roundRect(-300, -150, 600, 300, 34); g.fill();
  g.fillStyle = '#e0301c'; for (const x of [-200, -70, 70, 200]) { g.beginPath(); g.roundRect(x - 50, -190, 100, 50, 14); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-300, 110, 600, 40);
  g.fillStyle = '#fff'; g.font = '700 200px Fredoka'; g.fillText('EP 3', 0, 10); g.restore();
  g.save(); g.translate(W / 2, 900); g.scale(s2, s2); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#f2cd37'; g.beginPath(); g.roundRect(-330, -60, 660, 120, 24); g.fill(); g.fillStyle = '#1b2a34'; g.font = '700 76px Fredoka'; g.fillText('A PROPOSTA', 0, 4); g.restore();
  followTile(t, W / 2, 1180, T.end + .9, VO.n13 + DURS.n13 * .6);
}
function overlay(t, name) {
  g.clearRect(0, 0, W, H);
  if (name === 'rewind') { const k = seg(t, T.rew, T.recap); g.fillStyle = `rgba(255,255,255,${.12 * Math.sin(k * Math.PI)})`; g.fillRect(0, 0, W, H); for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, ((t * 1900 + i * 230) % H), W, 6); } g.save(); g.translate(W / 2, 760); g.fillStyle = 'rgba(16,18,24,.7)'; g.beginPath(); g.roundRect(-150, -80, 300, 160, 30); g.fill(); g.fillStyle = '#fff'; for (const dx of [-60, 20]) { g.beginPath(); g.moveTo(dx + 50, -45); g.lineTo(dx + 50, 45); g.lineTo(dx - 20, 0); g.fill(); } g.restore(); }
  seriesBadge(t); stamps(t);
  if (name === 'follow') followTile(t, W / 2, 1150, T.follow + .3, T.click);
  if (name === 'end') endCard(t);
  if (!CAPA) subs(t);
}

// —— moods, practicals, render ——
function render(t0) {
  const t = q(t0), st = shotAt(t0), name = st[2], night = st[3] === 'night';
  world.isNight = night; world.mood(st[3]);
  const P = act(t, name);
  you.pose(P.you); caio.pose(P.caio); suit.pose(P.suit);
  fingers.visible = name === 'promise' && t > VO.c3 - .3;
  // laundromat: front off for the interior shots, drums spin (on twos)
  world.L[0].front.visible = !['inside', 'cuCaio', 'follow', 'promise'].includes(name);
  world.bill.visible = world.L[0].front.visible;
  world.L.forEach((l, i) => l.drums.forEach((d, k) => d.rotation.z = -(t * (3 + (k % 3)) + k) * (night ? 1 : .15)));
  // the car rolls in along the street and stops at laundromat 1
  const cu = seg(t0, T.street - .2, T.carStop), cx = lerp(80, 12, eo(cu));
  world.CAR.g.position.set(cx, .3, STREET_Z + 2.3); world.CAR.g.rotation.y = Math.PI; world.CAR.g.visible = name === 'street' || name === 'cuSuit' || name === 'end';
  world.CAR.wheels.forEach(w => w.rotation.z = -cx / .9);
  world.F.phoneScreen.material.emissiveIntensity = name === 'sofa' || name === 'cuYou' ? 1.6 + .4 * Math.sin(t0 * 6) : 0;
  tiles(t0);
  screen(t0, name);
  cam(t0, st);
  if (fingers.visible) fingers.lookAt(camera.position);   // the cross faces the lens
  post.composer.render();
  overlay(t0, name);
}

// —— sound events (mix.py) ——
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of Object.entries(VO)) add('vo', t0, { id, who: LINE[id].who, d: DURS[id] });
  for (const c of CUES) add('cue', c.t0, { id: c.id, t1: +c.t1.toFixed(3) });
  for (const s of SUBS) add('sub', s.t0, { t1: s.t1, text: s.text });
  for (const [a, b, , w] of SHOTS) add('amb', a, { w: w === 'night' ? (['inside', 'cuCaio', 'follow', 'promise'].includes(SHOTS.find(s => s[0] === a)[2]) ? 'laund' : 'night') : SHOTS.find(s => s[0] === a)[2] === 'street' || SHOTS.find(s => s[0] === a)[2] === 'cuSuit' ? 'street' : 'day', d: +(b - a).toFixed(3) });
  add('title', .05);
  // view counter: pings speeding up
  for (let k = 0; k < 14; k++) add('ping', T.views + Math.pow(k / 14, .7) * (T.rew - T.views - .2), { v: .4 + k * .03, p: 1 + k * .04 });
  add('rewind', T.rew); add('whoosh', T.recap - .15);
  add('click', T.recap + .3, { v: .5 }); add('buzz', T.sofa + .2); add('cut', T.cuYou);
  for (let x = -27, k = 0; x < -5; x += 1.3, k++) add('step', T.walk + (x + 27) / 22 * (T.inside - T.walk), { v: .35, p: k % 2 ? 1.1 : .95 });
  for (const o of TILES) { add('whoosh', o.t() - .3, { v: .35 }); add('click', o.t(), { v: o.gain ? .9 : 1, p: o.gain ? 1.15 : 1 }); if (o.gain) add('ding', o.t() + .02, { v: .55 }); }
  add('pop', T.follow + .3); add('click', T.click, { v: .9 }); add('sparkle', T.click + .02);
  add('creak', T.shake, { v: .5 }); add('sting', T.orbit + 1.2, { v: .6 });
  add('ping', T.phone2 + .05, { v: .9, p: 1 }); for (let k = 0; k < 10; k++) add('ping', T.phone2 + .4 + k * .18, { v: .3 + k * .05, p: 1 + k * .05 });
  add('car', T.street - .2, { d: T.carStop - T.street + .2 }); add('brake', T.carStop - .3); add('door', T.carStop + .3);
  for (let k = 0; k < 4; k++) add('step', T.carStop + .45 + k * .3, { v: .5, p: .85 });
  add('hit', VO.s1 - .25, { v: .7 }); add('slam', T.end + .1); add('click', T.end + .5, { v: 1 }); add('click', VO.n13 + DURS.n13 * .6, { v: .9 }); add('sparkle', VO.n13 + DURS.n13 * .6 + .02);
  return ev.sort((a, b) => a.t - b.t);
}

window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS; window.T = T; window.VO = VO;
window.TEXTS = t => { const s = SUBS.find(s => t >= s.t0 && t < s.t1); return s ? [{ id: s.id, text: s.text, x0: 90, y0: 1380, x1: 990, y1: 1560 }] : []; };
for (const f of ['600 54px Fredoka', '700 74px Fredoka', '500 28px Fredoka']) await document.fonts.load(f);
render(parseFloat(Q.get('t') ?? '1'));
window.READY = true;
