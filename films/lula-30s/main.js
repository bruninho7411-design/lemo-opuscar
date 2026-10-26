// 30 Segundos — "E se todas as propostas do Lula virassem realidade por 30 segundos?" — Tilt-Shift Miniature, vertical 1080×1920
import * as THREE from 'three';
import { makePost } from './post.js';
import { clamp, seg, lerp, ss, eio, eo, back, hash, monotone } from '/core/lib.js';
import { buildCity, U, CURB, AVW, SWK, Z_START, Z_BEACH, crossZ } from './city.js';
import { buildSites, Pool } from './sites.js';
import { BPM, BEAT, E8, T0, T1, RISE, STOP, REW, DUR, P, VO, CAPS, srcTime, HOOK_V, VALENDO } from './story.js';

const QS = new URLSearchParams(location.search);
const W = innerWidth || 1080, H = innerHeight || 1920;
await Promise.all(['900 120px Overpass', '800 60px Overpass', '700 40px Overpass', '700 40px "Overpass Mono"'].map(f => document.fonts.load(f)));
let DURS = {}; try { DURS = await (await fetch('voices/dur.json')).json(); } catch (e) { }

// —— Renderer ——
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, W / H, 1, 9000);
const SSAA = +(QS.get('ssaa') || 2);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, ao: !QS.has('noao'), aoRadius: 2.5, aoThickness: 3, aoScale: 1.4, aoAmt: .7 });
post.bloom.strength = .2; post.bloom.threshold = 1.1; post.bloom.radius = .5;

// —— Sky, sun, fill ——
const skyMat = new THREE.ShaderMaterial({
  uniforms: { zen: { value: new THREE.Color('#3f86dc') }, hor: { value: new THREE.Color('#cfe3f2') } },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.); gl_Position = p.xyww; }`,
  fragmentShader: `varying vec3 vD; uniform vec3 zen, hor; void main(){ float t = max(normalize(vD).y, 0.); gl_FragColor = vec4(mix(hor, zen, pow(t, .5)), 1.); }`,
  side: THREE.BackSide, depthWrite: false, fog: false,
});
const dome = new THREE.Mesh(new THREE.SphereGeometry(8000, 32, 16), skyMat); dome.frustumCulled = false; scene.add(dome);
const sun = new THREE.DirectionalLight('#fff1dc', 4); sun.castShadow = true;
sun.shadow.mapSize.set(+(QS.get('sm') || 4096), +(QS.get('sm') || 4096)); sun.shadow.bias = -.0003; sun.shadow.normalBias = .4; scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight('#b8cae0', '#8d7d66', .65); scene.add(hemi);
scene.fog = new THREE.FogExp2('#cfdbe8', .00028);
{ const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat)); const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, 0, .1, 200).texture; scene.environmentIntensity = .5; }
U.sky.value.set('#9cc0e0');

// —— City, sites, actors ——
const city = buildCity(scene);
const people = new Pool(scene, new THREE.CapsuleGeometry(.32, .7, 3, 8), new THREE.MeshPhysicalMaterial({ roughness: .55, sheen: 1, sheenRoughness: .5 }), 2600);
const coins = new Pool(scene, new THREE.CylinderGeometry(.9, .9, .22, 14), new THREE.MeshStandardMaterial({ roughness: .25, metalness: .8, emissive: '#5a4300', emissiveIntensity: .4 }), 400);
const S = buildSites(scene, city, people, coins);
const POPS = P.map(p => p.t);
const carB = new Pool(scene, new THREE.BoxGeometry(1.9, .9, 4.4).translate(0, .75, 0), new THREE.MeshStandardMaterial({ roughness: .35, metalness: .3 }), 500);
const carC = new Pool(scene, new THREE.BoxGeometry(1.7, .65, 2.3).translate(0, 1.5, -.2), new THREE.MeshStandardMaterial({ color: '#2a3036', roughness: .15, metalness: .5 }), 500);
const busW = new Pool(scene, new THREE.BoxGeometry(2.6, 3.0, 12).translate(0, 1.7, 0), new THREE.MeshStandardMaterial({ roughness: .5 }), 12);
const CARC = ['#f4f4f2', '#c9ccd1', '#1d1f24', '#b8261e', '#2a5aa8', '#e9e2d2', '#8c9096', '#f2c200', '#3b6b4b'];

// Bus stop of the hook: shelter + one tired commuter
const STOPP = new THREE.Vector3(AVW / 2 + 2.2, 0, 40);
{
  const g = new THREE.Group();
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, .15, 6), new THREE.MeshStandardMaterial({ color: '#2f6fb0' })); roof.position.set(0, 2.6, 0);
  const back2 = new THREE.Mesh(new THREE.BoxGeometry(.1, 2.4, 6), new THREE.MeshStandardMaterial({ color: '#cfe3ef', transparent: true, opacity: .6 })); back2.position.set(.8, 1.3, 0);
  for (const o of [roof, back2]) { o.castShadow = true; g.add(o); }
  g.position.copy(STOPP).setY(CURB); scene.add(g);
}

// —— Time ——
const popsDone = s => POPS.filter(t => s >= t).length;
// World time: real time in the hook and outro, ×60 stepped at 8 Hz while the countdown runs (the "4 years in 30 s" stutter)
function worldT(s) {
  if (s < T0) return s;
  const q = T0 + Math.floor((Math.min(s, STOP[0]) - T0) * 8) / 8;
  return T0 + (q - T0) * 60;
}

// —— Camera ——
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const HOOK_OFF = V(-14, 44, 58), TRACK_OFF = V(0, 96, 118);
const FOC = S.sites.map(st => st.focus.clone());
const keyT = P.map(p => p.t - .3);
// dwell on each site through its slot, travel in the last ~0.8 s before the next pop
const KEYS = P.flatMap((p, i) => i < 9 ? [[p.t - .3, i], [p.t1 - 1.0, i]] : [[p.t - .3, i]]);
const fx = monotone(KEYS.map(([t, i]) => [t, FOC[i].x])), fz = monotone(KEYS.map(([t, i]) => [t, FOC[i].z])), fy = monotone(KEYS.map(([t, i]) => [t, FOC[i].y]));
const sideOf = monotone(KEYS.map(([t, i]) => [t, S.sites[i].L.s]));
function cam(s) {
  let look, off, fov = 34;
  const hookLook = STOPP.clone().add(V(-1, 1, -10));   // look past the stop so it sits below the HUD, mid-frame
  if (s < 4.6) {
    const u = seg(s, -10.6, 4.6), k = lerp(1.12, 1.0, ss(u));
    look = hookLook; off = HOOK_OFF.clone().multiplyScalar(k); fov = 32;
  } else if (s < keyT[0]) {                    // crane + speed ramp into the track
    const u = eio(seg(s, 4.6, keyT[0]));
    look = hookLook.clone().lerp(FOC[0], u);
    const side = S.sites[0].L.s;
    const o2 = TRACK_OFF.clone().add(V(-side * 10, 0, 0));
    off = HOOK_OFF.clone().lerp(o2, u); off.y = Math.exp(lerp(Math.log(HOOK_OFF.y), Math.log(o2.y), u));
    fov = lerp(32, 34, u);
  } else if (s < T1) {                         // the oner down the avenue
    const tt = Math.min(s, keyT[9]);
    look = V(fx(tt), fy(tt), fz(tt));
    off = TRACK_OFF.clone().add(V(-sideOf(tt) * 10, 0, 0));
    if (s > keyT[9]) look.z -= (s - keyT[9]) * 4;  // keep drifting
  } else {                                     // rise: scale reveal of every proposal at once
    const tt = keyT[9], u = seg(Math.min(s, RISE[1]), RISE[0], RISE[1]), e = eio(u);
    const l0 = V(fx(tt), fy(tt), fz(tt) - (T1 - keyT[9]) * 4), l1 = V(0, 0, -300);
    look = l0.clone().lerp(l1, e);
    const o0 = TRACK_OFF.clone().add(V(-sideOf(tt) * 10, 0, 0));
    const h = Math.exp(lerp(Math.log(o0.y), Math.log(820), e));
    off = V(lerp(o0.x, 0, e), h, lerp(o0.z, 330, e));
    fov = lerp(34, 38, e);
  }
  // punch-in on every pop (Gen Z zoom), decays in ~0.3 s
  for (const t of POPS) if (s >= t && s < t + .6) fov *= 1 - .05 * Math.exp(-(s - t) * 9);
  return { pos: look.clone().add(off), look, fov };
}

// —— Overlay canvas (HUD, captions) ——
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const g = ov.getContext('2d');
const SX = W / 1080;
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function roadSign(x, y, w, h, bg = '#0b6e3a') {
  g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18 * SX; g.shadowOffsetY = 6 * SX;
  g.fillStyle = bg; rr(x, y, w, h, 22 * SX); g.fill(); g.restore();
  g.strokeStyle = '#ffffff'; g.lineWidth = 5 * SX; rr(x + 9 * SX, y + 9 * SX, w - 18 * SX, h - 18 * SX, 15 * SX); g.stroke();
}
const HEAD = ['E SE TODAS AS PROPOSTAS', 'DO LULA VIRASSEM', 'REALIDADE POR', '30 SEGUNDOS?'];
const HEAD_S = 'E SE TODAS AS PROPOSTAS DO LULA VIRASSEM REALIDADE?';
let TXT = [];
function bigHead(a, sc, y) {   // a: alpha, sc: scale, y: top
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; const w = 940 * SX * sc, h = 400 * SX * sc, x = (W - w) / 2;
  g.translate(0, 0); roadSign(x, y, w, h);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  HEAD.forEach((l, i) => {
    const last = i === 3; g.font = `900 ${(last ? 88 : 62) * SX * sc}px Overpass`; g.fillStyle = last ? '#ffd21f' : '#ffffff';
    g.fillText(l, W / 2, y + h * (.2 + i * .2) + (last ? 8 * SX * sc : 0));
  });
  g.restore();
  TXT.push({ id: 'head', text: HEAD.join(' '), x0: x, y0: y, x1: x + w, y1: y + h });
}
function smallHead(a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; const w = 1000 * SX, h = 118 * SX, x = (W - w) / 2, y = 70 * SX;
  roadSign(x, y, w, h);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
  g.font = `900 ${38 * SX}px Overpass`; g.fillText('E SE TODAS AS PROPOSTAS DO LULA', W / 2, y + h * .34);
  g.font = `900 ${38 * SX}px Overpass`; g.fillStyle = '#ffd21f'; g.fillText('VIRASSEM REALIDADE?', W / 2, y + h * .72);
  g.restore();
  TXT.push({ id: 'head2', text: HEAD_S, x0: x, y0: y, x1: x + w, y1: y + h });
}
function timerHud(t, s) {
  // countdown + time-lapse readout + 10 pips
  const y = 215 * SX;
  let secs = 30, mode = 'idle';
  if (t >= T0 && t < T1) { secs = Math.ceil(T1 - t - 1e-6); mode = 'run'; }
  else if (t >= T1 && t < REW[0]) { secs = 0; mode = 'end'; }
  else if (t >= REW[0] && t < REW[1]) mode = 'rew';
  const big = mode === 'run' || mode === 'end';
  const punch = mode === 'run' ? 1 + .08 * Math.exp(-((t - T0) % 1) * 10) : 1;
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
  // digits panel
  const pw = 330 * SX, ph = 150 * SX, px = (W - pw) / 2;
  g.fillStyle = mode === 'end' ? (Math.floor(t * 6) % 2 ? '#d62828' : '#1b1b1f') : 'rgba(18,20,24,.82)'; rr(px, y, pw, ph, 26 * SX); g.fill();
  g.font = `900 ${118 * SX * punch}px Overpass`; g.fillStyle = mode === 'idle' ? '#cfd3d8' : secs <= 5 && mode === 'run' ? '#ff5a4f' : '#ffffff';
  const txt = mode === 'rew' ? '◀◀' : `0:${String(secs).padStart(2, '0')}`;
  g.fillText(txt, W / 2, y + ph * .56);
  // readout
  g.font = `700 ${30 * SX}px "Overpass Mono"`;
  let rd = '×1 TEMPO REAL', rc = '#5be37d';
  if (mode === 'run') { rd = '4 ANOS EM 30 s  ·  ×4.204.800'; rc = '#ffb020'; }
  if (mode === 'end') { rd = 'TEMPO ESGOTADO'; rc = '#ff5a4f'; }
  if (mode === 'rew') { rd = '◀◀ VOLTANDO AO NORMAL'; rc = '#9ecbff'; }
  const tw = g.measureText(rd).width + 40 * SX;
  g.fillStyle = 'rgba(18,20,24,.82)'; rr((W - tw) / 2, y + ph + 12 * SX, tw, 50 * SX, 14 * SX); g.fill();
  g.fillStyle = rc; g.fillText(rd, W / 2, y + ph + 38 * SX);
  // pips
  const n = popsDone(s), pr = 17 * SX, gap = 50 * SX, y2 = y + ph + 100 * SX, x0 = W / 2 - gap * 4.5;
  for (let i = 0; i < 10; i++) {
    const on = i < n, k = on ? clamp((s - POPS[i]) / .25) : 0;
    g.beginPath(); g.arc(x0 + i * gap, y2, pr * (on ? back(k, 3) : .8), 0, Math.PI * 2);
    g.fillStyle = on ? '#2ee86f' : 'rgba(255,255,255,.55)'; g.fill();
    g.lineWidth = 3 * SX; g.strokeStyle = 'rgba(0,0,0,.45)'; g.stroke();
  }
  g.font = `900 ${34 * SX}px Overpass`; g.fillStyle = '#fff'; g.lineWidth = 6 * SX; g.strokeStyle = 'rgba(0,0,0,.6)';
  const lbl = `${n}/10`; g.strokeText(lbl, W / 2, y2 + 48 * SX); g.fillText(lbl, W / 2, y2 + 48 * SX);
  g.restore();
}
// Caption: Brazilian road-sign panel, active word in yellow (karaoke)
function caption(t) {
  const c = CAPS.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const vo = VO.find(v => v.id === c.id), d = DURS[c.id] || (c.t1 - c.t0 - .6);
  const words = c.lines.flatMap((l, li) => l.split(' ').map(w => ({ w, li })));
  const tot = words.reduce((a, w) => a + w.w.length + 1, 0);
  let acc = 0; const prog = vo ? (t - vo.t) / d : 1;
  for (const w of words) { w.a = acc / tot; acc += w.w.length + 1; w.b = acc / tot; }
  const intro = back(clamp((t - c.t0) / .18), 2.5);
  g.save(); let fs = 54 * SX; g.font = `800 ${fs}px Overpass`;
  const mw = Math.max(...c.lines.map(l => g.measureText(l).width)); if (mw > 900 * SX) { fs *= 900 * SX / mw; g.font = `800 ${fs}px Overpass`; }
  const lh = fs * 1.18;
  const lw = c.lines.map(l => g.measureText(l).width), w = Math.max(...lw) + 90 * SX, h = lh * c.lines.length + 60 * SX;
  const cx = W / 2, cy = 1450 * SX;
  g.translate(cx, cy); g.scale(intro, intro); g.translate(-cx, -cy);
  roadSign(cx - w / 2, cy - h / 2, w, h);
  g.textBaseline = 'middle'; g.textAlign = 'left';
  c.lines.forEach((l, li) => {
    let x = cx - lw[li] / 2; const y = cy - h / 2 + 30 * SX + lh * (li + .5) + 4 * SX;
    for (const wd of words.filter(q => q.li === li)) {
      const act = prog >= wd.a && prog < wd.b + .02, said = prog >= wd.b;
      g.fillStyle = act ? '#ffd21f' : said || prog > 1 ? '#ffffff' : 'rgba(255,255,255,.72)';
      g.fillText(wd.w, x, y); x += g.measureText(wd.w + ' ').width;
    }
  });
  g.restore();
}
function rewindFx(t) {
  if (t < REW[0] || t >= REW[1]) return;
  g.save(); g.globalAlpha = .18; g.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) { const y = ((hash(Math.floor(t * 24) + i) * H) | 0); g.fillRect(0, y, W, 3 + hash(i + t) * 8); }
  g.restore();
}
function hud(t, s) {
  g.clearRect(0, 0, W, H); TXT = [];
  // headline: big in the hook and again at the end (loop), compact in between
  if (t < 6.4) { const u = eio(seg(t, 5.95, 6.4)); bigHead(1 - u, lerp(1, .8, u), lerp(180, 110, u) * SX + 360 * SX * (0)); }
  else if (t < 46.6) smallHead(Math.min(seg(t, 6.25, 6.45), 1 - seg(t, 46.4, 46.6)));
  if (t >= 46.6) { const u = eio(seg(t, 46.6, 47.1)); bigHead(u, lerp(.8, 1, u), lerp(110, 180, u) * SX); }
  const tOff = t < 46.6 ? 410 * (1 - eio(seg(t, 5.95, 6.4))) : 410 * eio(seg(t, 46.6, 47.1));
  g.save(); g.translate(0, tOff * SX); timerHud(t, s); g.restore();
  caption(t);
  rewindFx(t);
}

// —— Render ——
const _v = new THREE.Vector3();
function render(t) {
  if (QS.has('hudonly')) { hud(t, srcTime(t)); return; }   // text checks without the 3D pass
  const s = srcTime(t), w = worldT(s);
  const n = popsDone(s), f = clamp(n / 10);
  // grade: grey Monday → full colour, one step per proposal (with a short ease after each pop)
  let fs = 0; for (const pt of POPS) fs += clamp((s - pt) / .35) / 10;
  post.grade.uniforms.sat.value = lerp(.42, 1.6, fs);
  post.grade.uniforms.contrast.value = lerp(.25, .45, fs);
  post.grade.uniforms.amt.value = .3;
  post.grade.uniforms.warm.value = lerp(0, .35, fs);
  sun.intensity = lerp(1.7, 4.4, fs); hemi.intensity = lerp(.9, .6, fs);
  skyMat.uniforms.zen.value.set('#8d9cb0').lerp(new THREE.Color('#3f86dc'), fs);
  skyMat.uniforms.hor.value.set('#d3d8de').lerp(new THREE.Color('#cfe3f2'), fs);

  // actors
  people.begin(); coins.begin(); carB.begin(); carC.begin(); busW.begin();
  const L = Z_START - Z_BEACH;
  for (const [li, lx] of [-10.5, -6.5, 6.5, 10.5].entries()) {
    const dir = lx > 0 ? -1 : 1, v = 11 + li;
    for (let k = 0; k < 34; k++) {
      const off = k * (L / 34) + hash(k * 7 + li) * 18;
      const z = Z_BEACH + ((((off + dir * v * w) % L) + L) % L);
      const c = CARC[Math.floor(hash(k * 13 + li * 3) * CARC.length)];
      carB.add(lx, 0, z, c, 1, 1, 1, dir > 0 ? Math.PI : 0); carC.add(lx, 0, z, c, 1, 1, 1, dir > 0 ? Math.PI : 0);
    }
  }
  for (let k = -1; k < 13; k++) {                     // a car or two on each cross street
    const zc = crossZ(k);
    for (let j = 0; j < 3; j++) { const x = ((hash(k * 5 + j) * 700 + w * 9 * (j % 2 ? 1 : -1)) % 700 + 700) % 700 - 350; if (Math.abs(x) < 20) continue; carB.add(x, 0, zc + (j % 2 ? 3 : -3), CARC[(k + j + 9) % CARC.length], 1, 1, 1, Math.PI / 2); carC.add(x, 0, zc + (j % 2 ? 3 : -3), '#222', 1, 1, 1, Math.PI / 2); }
  }
  // city buses
  for (let k = 0; k < 4; k++) { const z = Z_BEACH + (((k * 210 + w * 9 * (k % 2 ? 1 : -1)) % L) + L) % L; busW.add(k % 2 ? -10.5 : 10.5, 0, z, k % 2 ? '#e9e2d2' : '#2a9d8f'); }
  // pedestrians on the promenades
  const ped = 520 + Math.round(fs * 300);
  for (let k = 0; k < ped; k++) {
    const sd = k % 2 ? 1 : -1, x = sd * (AVW / 2 + .8 + hash(k * 3.1) * (SWK - 1.6));
    const dir = hash(k * 1.7) < .5 ? 1 : -1, z = Z_BEACH + ((((hash(k * 2.3) * L) + dir * 1.3 * w) % L) + L) % L;
    const grey = k > 520 ? false : hash(k * 9.1) > fs;
    people.add(x, CURB + .55, z, grey ? ['#8d8f94', '#6f7278', '#a6a8ad'][k % 3] : ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#457b9d', '#ff6fa8', '#8ac926', '#ffffff', '#ffca3a'][k % 9]);
  }
  // the hook's commuter at the stop (in orange: the one we follow)
  people.add(STOPP.x - .2, CURB + .55, STOPP.z + .8, '#ff7a1a', 1.15, 1.15, 1.15);
  S.update(s, w, POPS);
  people.end(); coins.end(); carB.end(); carC.end(); busW.end();

  // camera
  const c = cam(s);
  camera.position.copy(c.pos); camera.up.set(0, 1, 0); camera.lookAt(c.look); camera.fov = c.fov; camera.updateProjectionMatrix();
  // shadow frustum fitted to the shot, sun cheated to front-light +z facades
  const span = clamp(c.pos.y * 1.1, 90, 900);
  sun.position.copy(c.look).add(V(-420, 900, 640)); sun.target.position.copy(c.look); sun.target.updateMatrixWorld();
  Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 100, far: 3000 }); sun.shadow.camera.updateProjectionMatrix();
  // tilt-shift band on the focus (projected), wider during the rise
  const focus = s < 4.6 ? STOPP.clone().setY(1) : c.look;
  _v.copy(focus).project(camera);
  const dist = camera.position.distanceTo(focus);
  const rise = seg(s, RISE[0], RISE[1]);
  post.dof.focus = dist; post.dof.aper = lerp(s < 4.6 ? 2600 : 7000, 9000, rise); post.dof.maxCoc = 30;
  post.dof.band = { y: clamp((_v.y + 1) / 2, .2, .8), w: lerp(s < 4.6 ? .045 : .06, .1, rise), amp: 30, mix: .6, tilt: 0, pow: 1.2 };
  if (QS.has('nodof')) post.dof.maxCoc = 0;
  post.composer.render();
  hud(t, s);
}

// —— Events for the mixer ——
function events() {
  const ev = [];
  ev.push({ t: 0, type: 'hookAmb' }, { t: 1.2, type: 'busBrake' }, { t: VALENDO - .9, type: 'riser' });
  P.forEach((p, i) => ev.push({ t: p.t, type: 'pop', i }));
  for (let k = 0; k < 30; k++) ev.push({ t: T0 + k, type: 'tick', last: k >= 25 });
  ev.push({ t: T1, type: 'buzzer' }, { t: RISE[0], type: 'whooshUp' }, { t: STOP[0], type: 'tapeStop' }, { t: STOP[0] + .45, type: 'bird' }, { t: REW[0], type: 'rewind' }, { t: REW[1], type: 'busBrake' }, { t: REW[1], type: 'outroAmb' });
  VO.forEach(v => ev.push({ t: v.t, type: 'vo', id: v.id }));
  return ev;
}

// debug: render a slice (t0 / dur) for quick tests
const T0Q = +(QS.get('t0') || 0);
window.render = T0Q || QS.has('dur') ? (t => render(t + T0Q)) : render; window.DUR = +(QS.get('dur') || DUR);
window.EV = QS.has('noev') ? [] : events();
window.TEXTS = t => { const s = srcTime(t); render.__t = t; hud(t, s); return TXT; };
window.CAPS = CAPS;
window.READY = true;
