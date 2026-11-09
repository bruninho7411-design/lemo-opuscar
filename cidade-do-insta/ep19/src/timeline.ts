export const FPS = 30;
export const TOTAL_SEC = 44.5;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 43.9;
export const NIGHT = false;

export type V3 = [number, number, number];
export type Cam = {pos: V3; look: V3; fov: number};
export type Shot = {
  id: string;
  start: number;
  end: number;
  from: Cam;
  to: Cam;
  ease?: 'inOut' | 'out' | 'in' | 'linear';
  title: string;
  sub?: string;
  titleBig?: boolean;
};

export const U = {BOLT: -9, FUND: -9, HALL: -9, TORRES: -9, CHAMINE: -9, TURB: -9, PAINEIS: -9, CREW: -9, LEVER: 999, LIGHT: 999, OFF: 999};
export const E = {HOOK: -9, BUS_END: -9, PREF: -9, BASE: -9, PAREDES: -9, TELHADO: -9, SINO: -9, QUADRA: -9, PARQUINHO: -9, KIDS: -9, PROF: -9};
export const PQ = {HOOK: -9, BASE: -9, PORTAO: -9, RODA: -9, CARROSSEL: -9, MONTANHA: -9, RIDE: -9, STAFF: -9, CUT: -9};
export const B = {HOOK: -9, BASE: -9, PAREDES: -9, GARAGEM: -9, TORRE: -9, CAMINHAO: -9, CREW: -9, REIGNITE: 999};
export const ST = {HOOK: -9, BASE: -9, GRAMADO: -9, TRAVES: -9, ARQ: -9, REFL: -9, TORCIDA: -9, TIME: 999, OWN: 999};
/** ep. 19 beach beats */
export const PR = {HOOK: 2.2, AREIA: 9.18, QUIOSQUE: 9.84, TORRE: 10.62, GUARDASOL: 11.92, SV: 13.24, TSUNAMI: 42.3};
const SURF: Cam = {pos: [0, 1.6, 252.5], look: [0, 2.9, 292], fov: 54};
export const OPEN: Cam = SURF;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const MAY2: Cam = {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36};
export const SHOTS: Shot[] = [
  {id: 'surf', start: 0, end: 2.2, from: SURF, to: {pos: [0, 1.7, 251.5], look: [0, 3.2, 292], fov: 54}, ease: 'linear', title: 'BORA PRA', sub: 'PRAIA!', titleBig: true},
  {id: 'deu', start: 2.2, end: 5.1, from: {pos: [20, 15, 220], look: [0, 0, 246], fov: 48}, to: {pos: [16, 12, 223], look: [0, 0, 246], fov: 48}, ease: 'out', title: 'DEU PRAIA!', titleBig: true},
  {id: 'prefeito_ep', start: 5.1, end: 8.16, from: {pos: [2.6, 2.4, 7.6], look: [0.8, 1.4, 0.8], fov: 38}, to: {pos: [2.2, 2.1, 6.2], look: [0.8, 1.4, 0.8], fov: 38}, ease: 'out', title: 'PREFEITO DO', sub: 'EPISÓDIO'},
  {id: 'c_areia', start: 8.16, end: 9.84, from: {pos: [26, 19, 216], look: [0, 0, 244], fov: 50}, to: {pos: [22, 16, 219], look: [0, 0.5, 244], fov: 50}, ease: 'out', title: 'AREIA', sub: '1/4'},
  {id: 'c_quiosque', start: 9.84, end: 10.58, from: {pos: [-5.5, 3.8, 227.5], look: [-12, 1.8, 238], fov: 50}, to: {pos: [-6, 3.5, 228.5], look: [-12, 1.8, 238], fov: 50}, ease: 'out', title: 'QUIOSQUE', sub: '2/4'},
  {id: 'c_torre', start: 10.58, end: 11.82, from: {pos: [-1, 5.5, 227], look: [9, 4, 244], fov: 52}, to: {pos: [0, 5.2, 228], look: [9, 4.2, 244], fov: 52}, ease: 'out', title: 'TORRE DO', sub: 'SALVA-VIDAS 3/4'},
  {id: 'c_guardasol', start: 11.82, end: 12.5, from: {pos: [0, 7, 226], look: [0, 1, 247], fov: 54}, to: {pos: [0, 6.5, 227], look: [0, 1, 247], fov: 54}, ease: 'out', title: 'GUARDA-SÓIS', sub: '4/4'},
  {id: 'sv', start: 12.5, end: 15.42, from: {pos: [9, 2.9, 230.5], look: [9, 2.2, 241.2], fov: 46}, to: {pos: [9, 2.7, 232], look: [9, 2.2, 241.2], fov: 46}, ease: 'out', title: 'SALVA-VIDAS', sub: 'SORTEADOS!'},
  {id: 'g_jogo', start: 15.42, end: 33.36, from: MAY, to: MAY, ease: 'linear', title: ''},
  {id: 'bio', start: 33.36, end: 34.32, from: MAY, to: MAY2, ease: 'out', title: 'LINK NA BIO'},
  {id: 'meta', start: 34.32, end: 36.42, from: {pos: [8, 9, -8], look: [0, 3, -31], fov: 48}, to: {pos: [5, 7, -12], look: [0, 3, -31], fov: 48}, ease: 'out', title: 'FALTAM 180', sub: 'PROS 10 MIL!'},
  {id: 'enquete', start: 36.42, end: 41.86, from: {pos: [40, 40, 200], look: [0, 0, 240], fov: 46}, to: {pos: [20, 36, 205], look: [0, 0, 240], fov: 46}, ease: 'linear', title: '17ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 41.86, end: LOOP_AT, from: {pos: [0, 2.4, 246], look: [0, 4, 290], fov: 56}, to: {pos: [0, 2.0, 248], look: [0, 6, 290], fov: 56}, ease: 'linear', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: SURF, to: SURF, ease: 'linear', title: 'BORA PRA', sub: 'PRAIA!', titleBig: true},
];

import {povCam, trainU, TRACK} from './three/coaster';
import {ballAt} from './three/match';
export const shotAt = (t: number) => SHOTS.find((s) => t >= s.start && t < s.end) ?? SHOTS[SHOTS.length - 1];

// ---- easing helpers ----
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeOutBack = (x: number) => {
  const c1 = 2.2, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** 0 before t0, springy pop to 1 over dur */
export const pop = (t: number, t0: number, dur = 0.35) => {
  if (t < t0) return 0;
  const k = clamp((t - t0) / dur);
  return Math.max(0, easeOutBack(k));
};
export const ramp = (t: number, t0: number, t1: number) => clamp((t - t0) / (t1 - t0));

export function camAt(t: number): Cam {
  const s = shotAt(t);
  const k0 = clamp((t - s.start) / (s.end - s.start));
  const k = s.ease === 'out' ? easeOut(k0) : s.ease === 'in' ? easeIn(k0) : s.ease === 'linear' ? k0 : easeInOut(k0);
  const L = (a: V3, b: V3): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  let cam: Cam = {pos: L(s.from.pos, s.to.pos), look: L(s.from.look, s.to.look), fov: lerp(s.from.fov, s.to.fov, k)};
  if (s.id.startsWith('m_off')) {
    const bp = ballAt(t);
    cam = {...cam, look: [cam.look[0] * 0.35 + bp[0] * 0.65, bp[1] + 0.4, cam.look[2] * 0.35 + bp[2] * 0.65]};
  }
  if (s.id === 'fila_off') {
    const tp = TRACK.getPointAt(trainU(t - PQ.RIDE, true));
    cam = {...cam, look: [tp.x, tp.y + 0.8, tp.z]};
  }
  // camera shake when the rock hits the water
  const sh = t < 2.2 || t >= LOOP_AT ? 0.12 : t >= 43.2 && t < 43.9 ? 0.4 : 0; // surf / tsunami shake
  if (sh > 0) cam = {...cam, pos: [cam.pos[0] + Math.cos(t * 53) * 0.22 * sh, cam.pos[1] + Math.sin(t * 61) * 0.28 * sh, cam.pos[2]], look: [cam.look[0] + Math.sin(t * 47) * 0.4 * sh, cam.look[1] + Math.cos(t * 59) * 0.5 * sh, cam.look[2]]};
  return cam;
}

/** time used for world spawns: after LOOP_AT the world is reset to its starting state */
export const worldTime = (t: number) => (t >= LOOP_AT ? 0 : t);

export const CITIZEN_SPAWN = [999, 999, 999, 999, 999, 999, 999, 999, 999, 999];
export const LOT_SPAWN = [-9, -9, -9, -9, -9, -9];
export const AB_SPAWN = -9;
export const PIZZA_START = -9;
export const PIZZA_PIECES = [-9, -9, -9, -9, -9, -9];
export const LAGOA_START = 999;
export const CROWD_START = -9;
export const HOUSES_START = -9;
export const CAMPO_START = 999;
export const ROAD_START = -9;
export const STREET_START = -9;
export const LONELY_START = -9;
export const MANSION_START = -9;
export const WINNER_T = -9;
export const NEW_START = -9;
export const MERC_T = -9;
export const NEW2_START = -9;
export const SHACK2_START = -9;
export const SHOP_T = -9;
export const WORKERS_T = -9;
export const NEW3_START = -9;
export const HOSP_T = -9;
export const AMB_T = -9;
export const STAFF_T = -9;
export const NEW4_START = -9;
export const AIR_T = -9;
export const LAND_T = -9;
export const CREW_T = -9;
export const NEW5_START = -9;
export const POL_T = -9;
export const CAR_T = -9;
export const COPS_T = -9;
export const CASTLE_T = -9;
export const SHOW_T = -9;
export const WATER_T = -9;
export const HOOK_END = -9;
export const FLOW_T = -9;
export const WATER_CREW_T = -9;
