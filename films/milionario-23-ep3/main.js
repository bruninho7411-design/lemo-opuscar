// POV: você ficou milionário aos 23 — EP 3 · A proposta (Brick Toy, vertical 1080×1920)
import * as THREE from 'three';
import { makePost } from './post.js';
import { clamp, seg, eio, eo, ei, ss, lerp, hash, back } from '/core/lib.js';
import { COL, BRICK, PLATE, brick, plate, mesh, roundGeo, brickGeo, plastic } from './bricks.js';
import { makeFig, walkPose, SHOULDER, HEAD_H } from './figs.js';
import { buildWorld, signTile, canvasTex, laundromat, L1, L2, L3, FLAT, PHONE, STREET_Z } from './world.js';
import { q, build, EP } from './story.js';

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
const TBL = V(L1.x, BRICK * 2.4 + PLATE, -4);   // folding-table top in laundromat 1

// —— the briefcase: lid opens on a hinge at the back, brick money inside (green and gold plates) ——
const brief = new THREE.Group(); brief.position.set(L1.x - 1.6, TBL.y, -4.1); scene.add(brief);
{
  const blk = '#1b1f27';
  const base = brick(6, 4, blk, { h: .9, tile: true }); brief.add(base);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const st = new THREE.Group(); st.position.set(-1.8 + i * 1.8, .9, -.85 + j * 1.7); brief.add(st);
    for (let k = 0; k < 3; k++) { const p = plate(1.6, 1.5, k % 2 ? '#2f9e4f' : '#f2cd37', { tile: true }); p.position.y = k * PLATE * .7 - .55; st.add(p); }
  }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.6, .14, 10, 24, Math.PI), plastic('#333')); handle.position.set(0, .45, 2.05); handle.rotation.x = Math.PI / 2; brief.add(handle);
}
const lidPivot = new THREE.Group(); lidPivot.position.set(0, .9, -2); brief.add(lidPivot);
{ const lid = brick(6, 4, '#1b1f27', { h: .6, tile: true }); lid.position.set(0, 0, 2); lidPivot.add(lid);
  for (const x of [-2.2, 2.2]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.5, .25, .2), plastic('#d9a21b')); l.position.set(x, .3, 4.02); lidPivot.add(l); } }
brief.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
// the business card
const card = signTile(2.6, 1.5, '#f4f4f1', (c, w, h) => {
  c.fillStyle = '#f4f4f1'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b1f27'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `700 ${h * .42}px Fredoka`; c.fillText('Ω', w * .2, h * .5); c.font = `700 ${h * .2}px Fredoka`; c.fillText('GRUPO', w * .62, h * .36); c.fillText('ÔMEGA', w * .62, h * .62);
}, { px: 160 });
card.rotation.x = -1.25; card.position.set(L1.x + 1.8, TBL.y + .05, -3.2); scene.add(card);

// —— Ômega: a rival laundromat across the street, half the price ——
const omega = laundromat('Ω', { accent: '#5b2bd6', name: 'ÔMEGA LAVANDERIA' }); omega.g.position.set(L1.x, 0, STREET_Z + 11.5); omega.g.rotation.y = Math.PI; scene.add(omega.g);
const omegaWalk = new THREE.Mesh(brickGeo(60, 3, .7, { tile: true }), new THREE.MeshPhysicalMaterial({ color: '#a0a5a9', roughness: .6 })); omegaWalk.position.set(L1.x, 0, STREET_Z + 10); omegaWalk.receiveShadow = true; scene.add(omegaWalk);
const banner = signTile(14, 3, '#c91a09', (c, w, h) => {
  c.fillStyle = '#c91a09'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff';
  c.font = `700 ${h * .42}px Fredoka`; c.fillText('LAVAGEM R$ 9,90', w / 2, h * .36); c.fillStyle = '#f2cd37'; c.font = `700 ${h * .3}px Fredoka`; c.fillText('METADE DO PREÇO', w / 2, h * .76);
}, { emissive: .25 });
banner.position.set(0, BRICK * 9 + PLATE, -.6); banner.rotation.y = 0; omega.front.add(banner);
const crowd = ['cA', 'cB', 'cC', 'cD'].map(k => { const f = makeFig(k); scene.add(f.root); return f; });

const tileMk = (w, h, bg, fg, txt, sub) => signTile(w, h, bg, (c, cw, ch) => {
  c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = fg;
  if (sub) { c.font = `700 ${ch * .46}px Fredoka`; c.fillText(txt, cw / 2, ch * .4); c.font = `600 ${ch * .22}px Fredoka`; c.fillText(sub, cw / 2, ch * .8); }
  else { c.font = `700 ${ch * .56}px Fredoka`; c.fillText(txt, cw / 2, ch * .54); }
});
// the maths, snapped onto the back wall (right of the suit)
const TILES = [
  { m: tileMk(4.6, 2.4, '#f4f4f1', '#1b2a34', 'R$ 27 MIL', 'POR MÊS'), p: V(-2.7, 8.0, -10.7), t: () => T.m1, u: () => T.m3 - .1 },
  { m: tileMk(5.4, 2.4, '#36aebf', '#ffffff', 'R$ 324 MIL', '× 12 = POR ANO'), p: V(2.9, 8.0, -10.7), t: () => T.m2, u: () => T.m3 - .1 },
  { m: tileMk(10.6, 2.6, '#f2cd37', '#1b2a34', 'R$ 3,2 MI', 'EM 10 ANOS'), p: V(0, 8.0, -10.6), t: () => T.m3, u: () => T.refuse, gain: 1 },
  { m: tileMk(10.6, 1.4, '#237841', '#ffffff', '+ AS LOJAS CONTINUAM SUAS'), p: V(0, 6.3, -10.6), t: () => T.m4, u: () => T.refuse, gain: 1 },
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
const Y = PLATE;
function act(t, name) {
  const tq = q(t), P = { crowd: [OFF, OFF, OFF, OFF] };
  const nodTalk = (who) => talk(who, t).talking ? (talk(who, t).o - .3) * .08 : 0;
  if (name === 'card' || name === 'brief') { P.you = OFF; P.caio = OFF; }
  if (name !== 'omega' && name !== 'cuCaio2' && name !== 'end') {
    // inside laundromat 1: the suit behind the table (left), you and Caio in front of it
    const leave = seg(t, T.card + .4, T.morning - .2), wk = leave > 0 && leave < 1;
    const sx = name === 'maths' ? -6.9 : -4.2, sz = lerp(-6.6, 4, leave);
    const closing = ss(seg(t, T.close, T.close + .4));
    P.suit = { x: L1.x + sx, y: Y, z: sz, ry: leave > 0 ? 0 : .35, ...(wk ? walkPose(leave * 14, .45) : {}), armL: [-.1, .06], armR: name === 'brief' ? [lerp(-.2, -.9, ss(seg(t, T.tilt, T.tilt + .5))), .15] : name === 'suit' ? [lerp(-.2, -1.0, closing), .15] : [-.1, .06],
      nod: talk('s', t).talking ? (talk('s', t).o - .3) * .06 : 0, face: face('s', t, { sm: name === 'suit' ? .7 : .3 }) };
    const see = name === 'brief' ? ss(seg(t, T.open + .2, T.open + .8)) : 1;
    const side = name === 'maths';
    if (name !== 'card' && name !== 'brief') P.you = { x: L1.x + (side ? 5.4 : 2.6), y: Y, z: name === 'follow' ? -1.2 : side ? -1.2 : -.6, ry: name === 'follow' ? .1 : name === 'maths' ? Math.PI + .3 : Math.PI - .35, nod: name === 'cuYou' ? .25 : 0, turn: name === 'refuse' ? -.15 : 0,
      armL: [-.1, .08], armR: [-.1, .08],
      face: face('y', t, { look: name === 'cuYou' ? [-.3, .7] : name === 'follow' ? [0, 0] : [-.3, .2], wide: name === 'cuYou' ? 1.22 : 1, lid: name === 'refuse' ? .35 : name === 'follow' ? .15 : 0, sm: name === 'follow' ? .5 : name === 'refuse' ? -.1 : 0, brow: name === 'cuYou' ? 1 : name === 'refuse' ? -.3 : 0 }) };
    const hype = name === 'cuCaio' ? 1 : 0, j = hype ? Math.abs(Math.sin(tq * 9)) * .5 : 0;
    if (name !== 'card' && name !== 'brief') P.caio = { x: L1.x + (side ? -5.4 : -1.2), y: Y + j, z: side ? -1.2 : -.4, ry: name === 'maths' ? Math.PI - .3 : Math.PI + .3, nod: nodTalk('c'), armL: hype ? [-2.7, .35] : [-.1, .1], armR: hype ? [-2.7, -.35] : [-.1, .1],
      face: face('c', t, { look: [.2, .5 * see], wide: 1 + .25 * see, brow: 1.2, sm: hype ? .6 : 0 }) };
  } else {
    // outside, the next morning: you and Caio at the door of laundromat 1, looking across at Ômega
    const turn = name === 'cuCaio2' ? 1 : 0;
    P.you = name === 'omega' ? OFF : { x: L1.x + 2.2, y: .7, z: 2.2, ry: Math.PI * 0 + (turn ? -.4 : 0), face: face('y', t, { look: [0, -.2], lid: .2 }) };
    P.caio = name === 'omega' ? OFF : { x: L1.x - 1.4 + turn * .8, y: turn ? .3 : .7, z: turn ? 8.0 : 2.4, ry: turn ? Math.PI + .15 : 0, nod: turn ? -.05 : 0, armL: turn ? [-2.2, .5] : [-.1, .1], armR: turn ? [-2.2, -.5] : [-.1, .1], face: face('c', t, { look: [0, -.2], wide: 1.3, brow: 1.4, sm: -.4 }) };
    P.suit = OFF;
    P.crowd = [0, 1, 2, 3].map(i => ({ x: L1.x + 3.4 + i * 2.2, y: .7, z: STREET_Z + 10.2, ry: -Math.PI / 2, nod: -.05, armL: [-.1, .06], armR: [-.1, .06], face: face('x', t + i * .7, { look: [.3, 0] }) }));
  }
  return P;
}


// —— camera per shot ——
const headW = fig => { fig.root.updateMatrixWorld(true); const h = fig.head.getWorldPosition(V(0, 0, 0)).add(V(0, HEAD_H / 2, 0)); h.isHead = true; return h; };
function cam(t, st) {
  const [t0, t1, name] = st, u = seg(t, t0, t1);
  let pos, look, fov = 40, focus, aper = 600, span = 28;
  const B = brief.position.clone().add(V(0, 1.4, 0));
  switch (name) {
    case 'brief': {
      const tl = ss(seg(t, T.tilt, t1));
      pos = B.clone().add(V(.5, 5.6, 11.5)).lerp(B.clone().add(V(.4, 4.8, 9.6)), eio(u)).add(V(0, tl * 1.2, 0));
      look = B.clone().add(V(0, -.2, 0)).lerp(headW(suit).add(V(0, -1, 0)), tl); fov = 38;
      focus = B.clone().lerp(headW(suit), tl); aper = 700; span = 16; break;
    }
    case 'cuYou': { const h = headW(you); pos = h.clone().add(V(1.4, .1, -7.8)).lerp(h.clone().add(V(1.2, 0, -7)), u); look = h.clone().add(V(0, -.9, 0)); fov = 40; focus = h; aper = 700; span = 16; break; }
    case 'cuCaio': { const h = headW(caio); pos = h.clone().add(V(1.6, -.8, -7.9)).lerp(h.clone().add(V(1.4, -.8, -7.2)), u); look = h.clone().add(V(0, -.2, 0)); fov = 50; focus = h; aper = 650; span = 18; break; }
    case 'maths': {
      const a = lerp(.1, -.08, eio(u)), r = lerp(27, 24, eio(u)); pos = V(L1.x + Math.sin(a) * r, lerp(7.4, 7.8, u), L1.z - 5.5 + Math.cos(a) * r); look = V(L1.x, lerp(6.4, 6.8, u), -8); fov = 50;
      focus = V(0, 7.4, -10.4); aper = 340; span = 24; break;
    }
    case 'follow': { const h = headW(you); pos = h.clone().add(V(.8, -1.2, 16)).lerp(h.clone().add(V(.6, -1, 14)), u); look = h.clone().add(V(0, -3.2, 0)); fov = 40; focus = h; aper = 650; span = 18; break; }
    case 'refuse': { const h = headW(you); pos = h.clone().add(V(1.2, -.1, -7.8)).lerp(h.clone().add(V(.9, -.1, -6.2)), eio(u)); look = h.clone().add(V(0, -.7, 0)); fov = 40; focus = h; aper = 760; span = 16; break; }
    case 'suit': { const h = headW(suit); pos = h.clone().add(V(1.6, -.6, 10.5)).lerp(h.clone().add(V(1.3, -.5, 8.6)), eio(u)); look = h.clone().add(V(0, -1.4, 0)); fov = 40; focus = h; aper = 720; span = 16; break; }
    case 'card': {
      const C = card.position.clone(); pos = C.clone().add(V(.9, 3.0, 6.6)).lerp(C.clone().add(V(.7, 2.6, 5.6)), eio(u)); look = C.clone().add(V(-.2, .2, 0)); fov = 38;
      focus = C; aper = 700; span = 14; break;
    }
    case 'omega': {   // from behind you and Caio, across the street to Ômega
      pos = V(L1.x - 14, 4.4, 1.8).lerp(V(L1.x - 11.5, 5.4, 1.4), eio(u)); look = V(L1.x + 1.5, lerp(7.4, 8.4, eio(u)), STREET_Z + 11); fov = 50;
      focus = V(L1.x, 6, STREET_Z + 10.5); aper = 360; span = 40; break;
    }
    case 'cuCaio2': { const h = headW(caio); pos = h.clone().add(V(.9, -.6, -7.6)).lerp(h.clone().add(V(.7, -.5, -6.8)), u); look = h.clone().add(V(0, -.5, 0)); fov = 46; focus = h; aper = 640; span = 20; break; }
    default: { const c = V(L1.x, 5, STREET_Z + 2); pos = V(L1.x + 30, 12, STREET_Z + 2).lerp(V(L1.x + 40, 30, STREET_Z + 2), eio(u)); look = c; fov = 44; focus = c; aper = 300; span = 50; }
  }
  if (focus && focus.isHead) focus = focus.clone().add(pos.clone().sub(focus).normalize());   // the printed face is 1 stud in front of the centre
  camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look);
  world.aimKey(focus || look, span, world.isNight ? [50, 120, 40] : [-70, 100, 60]);
  post.dof.focus = camera.position.distanceTo(focus || look); post.dof.aper = aper; post.dof.maxCoc = 14;
}


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
  return { id, t0, t1: +t1.toFixed(3), who: LINE[id].who, text: LINE[id].sub, hi: LINE[id].hi || [] };
});
function hiMask(text, hi) {   // per word: true when it belongs to one of the highlighted phrases
  const w = text.split(' '), m = w.map(() => false);
  for (const p of hi) { const pw = p.split(' '); for (let i = 0; i + pw.length <= w.length; i++) if (pw.every((x, k) => w[i + k] === x)) pw.forEach((_, k) => m[i + k] = true); }
  return m;
}
function subs(t) {
  const s = SUBS.find(s => t >= s.t0 && t < s.t1); if (!s) return;
  const font = '600 54px Fredoka', lines = wrap(s.text, 780, font), lh = 66, ph = lines.length * lh + 40, y = 1560 - ph;
  const pw = Math.max(...lines.map(l => g.measureText(l).width)) + 150, x = (W - pw) / 2, pop = back(seg(t, s.t0, s.t0 + .14), 2);
  g.save(); g.translate(W / 2, y + ph / 2); g.scale(lerp(.92, 1, pop), lerp(.92, 1, pop)); g.translate(-W / 2, -(y + ph / 2));
  g.fillStyle = OVL ? '#16181e' : 'rgba(16,18,24,.72)'; g.beginPath(); g.roundRect(x - (OVL ? 2 : 0), y - (OVL ? 2 : 0), pw + (OVL ? 4 : 0), ph + (OVL ? 4 : 0), 37); g.fill();
  const who = WHO[s.who];
  brickIcon(x + 32, y + ph / 2 - 17, .9, who ? who[1] : '#ffffff');
  if (who) { g.font = '700 26px Fredoka'; const tw = g.measureText(who[0]).width + 40; g.fillStyle = who[1]; g.beginPath(); g.roundRect(x + 30, y - 22, tw, 40, 20); g.fill(); g.fillStyle = '#12141a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(who[0], x + 30 + tw / 2, y - 1); }
  g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = font;
  const mask = hiMask(s.text, s.hi); let wi = 0;
  lines.forEach((l, k) => { let cx = x + 112; for (const w of l.split(' ')) { g.fillStyle = mask[wi++] ? '#f2cd37' : '#fff'; g.fillText(w, cx, y + 20 + lh / 2 + k * lh + 2); cx += g.measureText(w + ' ').width; } });
  g.restore();
}
function seriesBadge(t) {   // top: series + episode
  if (t >= T.end) return;
  const big = t < T.cuYou;
  if (!big) { g.save(); g.fillStyle = 'rgba(16,18,24,.66)'; g.beginPath(); g.roundRect(W - 250, 56, 196, 56, 28); g.fill(); g.fillStyle = '#c91a09'; g.beginPath(); g.roundRect(W - 246, 60, 86, 48, 24); g.fill();
    g.fillStyle = '#fff'; g.font = '700 28px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`EP ${EP.n}`, W - 203, 85); g.font = '600 24px Fredoka'; g.fillText('/ 30', W - 100, 85); g.restore(); return; }
  const s = back(seg(q(t), 0, .3), 2), a = 1 - ss(seg(t, T.cuYou - .3, T.cuYou));
  g.save(); g.globalAlpha = a; g.translate(W / 2, 230); g.scale(s, s);
  g.fillStyle = 'rgba(16,18,24,.78)'; g.beginPath(); g.roundRect(-430, -96, 860, 192, 40); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = '600 40px Fredoka'; g.fillText('POV: VOCÊ FICOU MILIONÁRIO AOS 23', 0, -36);
  g.fillStyle = '#f2cd37'; g.font = '700 74px Fredoka'; g.fillText(EP.title, 0, 34);
  g.fillStyle = '#c91a09'; g.beginPath(); g.roundRect(300, -130, 150, 60, 18); g.fill(); g.fillStyle = '#fff'; g.font = '700 38px Fredoka'; g.fillText(`EP ${EP.n}`, 375, -98);
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
  const a = ss(seg(t, T.end, T.end + .4)), last = Object.keys(VO).at(-1);
  g.fillStyle = `rgba(10,12,16,${.55 * a})`; g.fillRect(0, 0, W, H);
  const s1 = back(seg(q(t), T.end + .1, T.end + .4), 2.2), s2 = back(seg(q(t), T.end + .5, T.end + .8), 2.2);
  g.save(); g.translate(W / 2, 640); g.scale(s1, s1); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#c91a09'; g.beginPath(); g.roundRect(-300, -150, 600, 300, 34); g.fill();
  g.fillStyle = '#e0301c'; for (const x of [-200, -70, 70, 200]) { g.beginPath(); g.roundRect(x - 50, -190, 100, 50, 14); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-300, 110, 600, 40);
  g.fillStyle = '#fff'; g.font = '700 200px Fredoka'; g.fillText(EP.next, 0, 10); g.restore();
  g.save(); g.translate(W / 2, 900); g.scale(s2, s2); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#f2cd37'; g.beginPath(); g.roundRect(-330, -60, 660, 120, 24); g.fill(); g.fillStyle = '#1b2a34'; g.font = '700 76px Fredoka'; g.fillText(EP.nextTitle, 0, 4); g.restore();
  followTile(t, W / 2, 1180, T.end + .9, VO[last] + DURS[last] * .6);
}
const CAPA = Q.get('capa') === '1', CLEAN = Q.get('clean') === '1';   // clean: no 2D layer (source stills for image-to-video)
// ovl: the retention edit's 2D pass, composited over the first render (ovl_render.mjs): subtitles with highlighted words,
// the hook question, the comment question, and the full 2D layer over the AI insert (INS) that replaces part of a shot
const OVL = Q.get('ovl') === '1', INS = [[5.3, T.cuCaio]];
function askTile(t, y, t0, l1, l2) {
  const s = back(seg(q(t), t0, t0 + .3), 2.2); if (s <= 0) return;
  g.save(); g.translate(W / 2, y); g.scale(s, s); g.textAlign = 'center'; g.textBaseline = 'middle';
  const h = l2 ? 170 : 104; g.font = '700 60px Fredoka'; const tw = Math.max(g.measureText(l1).width, l2 ? g.measureText(l2).width : 0) + 90;
  g.fillStyle = '#f2cd37'; g.beginPath(); g.roundRect(-tw / 2, -h / 2, tw, h, 26); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-tw / 2 + 12, h / 2 - 10, tw - 24, 10);
  g.fillStyle = '#1b2a34'; if (l2) { g.fillText(l1, 0, -34); g.fillText(l2, 0, 38); } else g.fillText(l1, 0, 3);
  g.restore();
}
function overlay(t, name) {
  g.clearRect(0, 0, W, H); if (CLEAN) return;
  const ins = INS.some(([a, b]) => t >= a && t < b);
  if (!OVL || ins) { seriesBadge(t); stamps(t); }
  if (!OVL && name === 'follow') followTile(t, W / 2, 1150, T.follow + .3, T.click);
  if (!OVL && name === 'end') endCard(t);
  if (OVL && t < T.cuYou) { g.save(); g.globalAlpha = 1 - ss(seg(t, T.cuYou - .3, T.cuYou)); askTile(t, 410, .9, 'VOCÊ ACEITARIA?'); g.restore(); }
  if (OVL && name === 'end') askTile(t, 290, T.end + 1.2, 'E VOCÊ, ACEITARIA', 'OS R$ 3 MILHÕES?');
  if (!CAPA) subs(t);
}

// —— render ——
function render(t0) {
  if (OVL) return overlay(t0, shotAt(t0)[2]);
  const t = q(t0), st = shotAt(t0), name = st[2], night = st[3] === 'night';
  world.isNight = night; world.mood(st[3]);
  const P = act(t, name);
  you.pose(P.you); caio.pose(P.caio); suit.pose(P.suit); crowd.forEach((f, i) => f.pose(P.crowd[i]));
  const inside = !['omega', 'cuCaio2', 'end'].includes(name);
  world.L[0].front.visible = !inside; world.bill.visible = !inside;
  omega.g.visible = omegaWalk.visible = !inside;
  world.L.forEach(l => l.drums.forEach((d, k) => d.rotation.z = -(t * (3 + (k % 3)) + k) * .3));
  omega.drums.forEach((d, k) => d.rotation.z = -(t * (3 + (k % 3)) + k) * .6);
  const op = name === 'brief' ? eo(seg(t0, T.open, T.open + .7)) : 1, cl = ss(seg(t0, T.close, T.close + .4));
  lidPivot.rotation.x = -lerp(0, 2.45, op) * (1 - cl) - (op < 1 && op > .8 ? Math.sin((op - .8) * 15) * .05 : 0);
  brief.visible = inside && t0 < T.morning; card.visible = t0 >= T.close + .3 && inside;
  world.CAR.g.visible = false;
  tiles(t0);
  cam(t0, st);
  post.composer.render();
  overlay(t0, name);
}

// —— sound events (mix.py) ——
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of Object.entries(VO)) add('vo', t0, { id, who: LINE[id].who, d: DURS[id] });
  for (const c of CUES) add('cue', c.t0, { id: c.id, t1: +c.t1.toFixed(3) });
  for (const s of SUBS) add('sub', s.t0, { t1: s.t1, text: s.text });
  for (const [a, b, name] of SHOTS) add('amb', a, { w: ['omega', 'cuCaio2', 'end'].includes(name) ? 'street' : 'laund', d: +(b - a).toFixed(3) });
  add('title', .05);
  add('latch', T.open - .1); add('latch', T.open + .02); add('creak', T.open + .1, { v: .6 }); add('ding', T.open + .55, { v: .6 }); add('sparkle', T.open + .6);
  add('cut', T.cuYou); add('gulp', VO.n1 + DURS.n1 + .1);
  for (let k = 0; k < 4; k++) add('step', T.cuCaio + .1 + k * .17, { v: .5, p: 1.2 });
  for (const o of TILES) { add('whoosh', o.t() - .3, { v: .35 }); add('click', o.t(), { v: o.gain ? .9 : 1, p: o.gain ? 1.15 : 1 }); if (o.gain) add('ding', o.t() + .02, { v: .55 }); }
  add('pop', T.follow + .3); add('click', T.click, { v: .9 }); add('sparkle', T.click + .02);
  add('hit', VO.y1 - .05, { v: .55 });
  add('latch', T.close + .3); add('click', T.close + .5, { v: .7 });
  for (let k = 0; k < 6; k++) add('step', T.card + .45 + k * .3, { v: .45, p: .85 });
  add('rewind', T.morning - .3); add('hit', T.morning + .1, { v: .8 });
  add('slam', T.end + .1); add('click', T.end + .5, { v: 1 });
  add('pop', .95, { v: .45 }); add('whoosh', INS[0][0] - .15, { v: .3 }); add('pop', T.end + 1.2, { v: .6 });   // the retention edit: hook question, AI insert, comment question
  const last = Object.keys(VO).at(-1); add('click', VO[last] + DURS[last] * .6, { v: .9 }); add('sparkle', VO[last] + DURS[last] * .6 + .02);
  return ev.sort((a, b) => a.t - b.t);
}


window.render = render; window.DUR = DUR; window.EV = events(); window.SUBS = SUBS; window.T = T; window.VO = VO;
window.TEXTS = t => { const s = SUBS.find(s => t >= s.t0 && t < s.t1); return s ? [{ id: s.id, text: s.text, x0: 90, y0: 1380, x1: 990, y1: 1560 }] : []; };
for (const f of ['600 54px Fredoka', '700 74px Fredoka', '500 28px Fredoka']) await document.fonts.load(f);
render(parseFloat(Q.get('t') ?? '1'));
window.READY = true;
