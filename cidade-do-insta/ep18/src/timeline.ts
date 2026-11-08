export const FPS = 30;
export const TOTAL_SEC = 49.2;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 48.6;
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
const VS: Cam = {pos: [65.2, 1.7, 30.0], look: [60, 1.35, 30], fov: 50};
export const OPEN: Cam = VS;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const MAY2: Cam = {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36};
const BALLCAM: Cam = {pos: [60, 8.5, 45], look: [60, 0.6, 30], fov: 46};
export const SHOTS: Shot[] = [
  {id: 'vs', start: 0, end: 3.56, from: VS, to: {pos: [64.4, 1.6, 30.0], look: [60, 1.35, 30], fov: 50}, ease: 'linear', title: 'É HOJE!', titleBig: true},
  {id: 'escala', start: 3.56, end: 11.26, from: {pos: [60, 3.6, 24.6], look: [60, 1.5, 31.3], fov: 52}, to: {pos: [60, 3.3, 25.6], look: [60, 1.5, 31.3], fov: 52}, ease: 'linear', title: 'SELEÇÃO DA', sub: 'CIDADE DO INSTA'},
  {id: 'm_kick', start: 11.26, end: 12.5, from: BALLCAM, to: {...BALLCAM, pos: [60, 8, 44]}, ease: 'linear', title: 'APITA O JUIZ!'},
  {id: 'm_g1', start: 12.5, end: 14.82, from: {pos: [70, 2.8, 35.5], look: [64, 1, 30], fov: 54}, to: {pos: [69.6, 2.7, 35], look: [64, 1, 30], fov: 54}, ease: 'linear', title: 'SANTOS', sub: 'SAI NA FRENTE...'},
  {id: 'm_g2', start: 14.82, end: 17.98, from: {pos: [50, 2.8, 24.5], look: [56, 1, 30], fov: 54}, to: {pos: [50.4, 2.7, 25], look: [56, 1, 30], fov: 54}, ease: 'linear', title: 'NÃO DESISTE!'},
  {id: 'm_g3', start: 17.98, end: 19.72, from: {pos: [55, 1.3, 37], look: [55, 1, 30], fov: 50}, to: {pos: [54.6, 1.25, 36.2], look: [55, 1, 30], fov: 50}, ease: 'linear', title: 'ÚLTIMO MINUTO...'},
  {id: 'festa', start: 19.72, end: 21.68, from: {pos: [60, 2.6, 38.5], look: [55.5, 1.4, 31.5], fov: 46}, to: {pos: [59.2, 2.3, 37.2], look: [55.5, 1.4, 31.5], fov: 46}, ease: 'out', title: 'VIRADA!', titleBig: true},
  {id: 'praia', start: 21.68, end: 25.38, from: MAY, to: MAY2, ease: 'out', title: 'DEU PRAIA!', sub: 'NO PRÓXIMO EP'},
  {id: 'palpite', start: 25.38, end: 32.48, from: {pos: [80, 15, 50], look: [60, 0, 30], fov: 46}, to: {pos: [72, 12, 55], look: [60, 0, 30], fov: 46}, ease: 'linear', title: 'DESAFIO', sub: 'DO PALPITE!'},
  {id: 'meta', start: 32.48, end: 40.1, from: {pos: [8, 9, -8], look: [0, 3, -31], fov: 48}, to: {pos: [5, 7, -12], look: [0, 3, -31], fov: 48}, ease: 'out', title: 'FALTAM 238', sub: 'PROS 10 MIL!'},
  {id: 'enquete', start: 40.1, end: 46.6, from: {pos: [60, 55, 100], look: [30, 0, 20], fov: 46}, to: {pos: [35, 50, 110], look: [30, 0, 20], fov: 46}, ease: 'linear', title: '16ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 46.6, end: LOOP_AT, from: {pos: [57.6, 2.0, 33.2], look: [53, 1.3, 30], fov: 50}, to: {pos: [57.2, 1.9, 32.8], look: [53, 1.3, 30], fov: 50}, ease: 'linear', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: VS, to: VS, ease: 'linear', title: 'É HOJE!', titleBig: true},
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
  if (s.id.startsWith('m_')) {
    const bp = ballAt(t);
    cam = {...cam, look: [cam.look[0] * 0.35 + bp[0] * 0.65, bp[1] + 0.4, cam.look[2] * 0.35 + bp[2] * 0.65]};
  }
  if (s.id === 'fila_off') {
    const tp = TRACK.getPointAt(trainU(t - PQ.RIDE, true));
    cam = {...cam, look: [tp.x, tp.y + 0.8, tp.z]};
  }
  // camera shake when the rock hits the water
  const sh = [13.9, 16.46, 19.14, 47.8].reduce((m, g) => (t >= g && t < g + 0.5 ? Math.max(m, 0.3 * (1 - (t - g) / 0.5)) : m), 0); // goal shake
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
