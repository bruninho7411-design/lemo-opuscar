export const FPS = 30;
export const TOTAL_SEC = 49.1;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 48.5;
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
/** ep. 16 fire station beats */
export const B = {HOOK: 2.78, BASE: 10.46, PAREDES: 11.36, GARAGEM: 12.3, TORRE: 13.14, CAMINHAO: 13.62, CREW: 15.0, REIGNITE: 47.2};
const FOGO: Cam = {pos: [-45.5, 2.0, 13.2], look: [-50, 2.4, 20.8], fov: 50};
export const OPEN: Cam = FOGO;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const MAY2: Cam = {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36};
export const SHOTS: Shot[] = [
  {id: 'fogo', start: 0, end: 1.34, from: FOGO, to: {pos: [-46, 2.1, 14.2], look: [-50, 2.4, 20.8], fov: 50}, ease: 'linear', title: 'FOGO', sub: 'NA CIDADE!', titleBig: true},
  {id: 'agua', start: 1.34, end: 2.78, from: {pos: [-39, 6, 9], look: [-49, 2, 19], fov: 50}, to: {pos: [-40, 5.5, 10.5], look: [-49, 2, 19], fov: 50}, ease: 'out', title: 'CHAMA OS', sub: 'BOMBEIROS!'},
  {id: 'deu', start: 2.78, end: 6.38, from: {pos: [-14, 16, 9], look: [-30, 0, 30], fov: 48}, to: {pos: [-18, 13, 11], look: [-30, 0, 30], fov: 48}, ease: 'out', title: 'FINALMENTE', sub: 'DEU BOMBEIROS!'},
  {id: 'prefeito_ep', start: 6.38, end: 10.3, from: {pos: [2.6, 2.4, 7.6], look: [0.8, 1.4, 0.8], fov: 38}, to: {pos: [2.2, 2.1, 6.2], look: [0.8, 1.4, 0.8], fov: 38}, ease: 'out', title: 'PREFEITO DO', sub: 'EPISÓDIO'},
  {id: 'c_base', start: 10.3, end: 11.36, from: {pos: [-15, 21, 7], look: [-30, 0, 29], fov: 50}, to: {pos: [-17, 18, 9], look: [-30, 1, 29], fov: 50}, ease: 'out', title: 'BORA', sub: 'CONSTRUIR!'},
  {id: 'c_paredes', start: 11.36, end: 12.22, from: {pos: [-21, 6.5, 15], look: [-30, 2.5, 31.5], fov: 50}, to: {pos: [-22, 6, 16], look: [-30, 2.5, 31.5], fov: 50}, ease: 'out', title: 'PAREDES', sub: '1/4'},
  {id: 'c_garagem', start: 12.22, end: 13.06, from: {pos: [-30, 3.8, 16.5], look: [-30, 2.3, 27.5], fov: 50}, to: {pos: [-30, 3.5, 17.5], look: [-30, 2.3, 27.5], fov: 50}, ease: 'out', title: 'GARAGEM', sub: '2/4'},
  {id: 'c_torre', start: 13.06, end: 13.82, from: {pos: [-25, 7.5, 20], look: [-35.6, 7, 34], fov: 52}, to: {pos: [-25.5, 7.2, 21], look: [-35.6, 7.2, 34], fov: 52}, ease: 'out', title: 'TORRE', sub: '3/4'},
  {id: 'c_caminhao', start: 13.82, end: 14.5, from: {pos: [-20.5, 4.5, 13.5], look: [-26.8, 1.2, 22], fov: 50}, to: {pos: [-21, 4, 14.5], look: [-26.8, 1.2, 22], fov: 50}, ease: 'out', title: 'CAMINHÃO', sub: '4/4'},
  {id: 'crew', start: 14.5, end: 17.18, from: {pos: [-32.7, 3.6, 12], look: [-32.7, 3.0, 23.8], fov: 46}, to: {pos: [-32.7, 3.4, 13.5], look: [-32.7, 3.0, 23.8], fov: 46}, ease: 'out', title: 'BOMBEIROS', sub: 'SORTEADOS!'},
  {id: 'fila', start: 17.18, end: 20.42, from: {pos: [42.5, 6, 43.5], look: [30, 4, 32], fov: 40}, to: {pos: [41.5, 6, 42.5], look: [30, 4, 32], fov: 40}, ease: 'linear', title: 'PROMESSA', sub: 'CUMPRIDA!'},
  {id: 'novos', start: 20.42, end: 22.48, from: {pos: [26, 34, 70], look: [6, 0, 34], fov: 46}, to: {pos: [20, 26, 62], look: [6, 0, 34], fov: 46}, ease: 'out', title: 'MORADORES', sub: 'NOVOS!'},
  {id: 'g_jogo', start: 22.48, end: 35.04, from: MAY, to: MAY, ease: 'linear', title: 'NOVIDADE', sub: 'NO JOGO!'},
  {id: 'comenta', start: 35.04, end: 37.0, from: MAY, to: MAY2, ease: 'out', title: 'COMENTA', sub: '"JOGO"'},
  {id: 'prefeito', start: 37.0, end: 39.76, from: MAY, to: MAY2, ease: 'out', title: 'PRÓXIMO', sub: 'PREFEITO?'},
  {id: 'meta', start: 39.76, end: 41.78, from: {pos: [8, 9, -8], look: [0, 3, -31], fov: 48}, to: {pos: [5, 7, -12], look: [0, 3, -31], fov: 48}, ease: 'out', title: 'FALTA POUCO', sub: 'PROS 10 MIL!'},
  {id: 'enquete', start: 41.78, end: 46.56, from: {pos: [60, 55, 100], look: [0, 0, 20], fov: 46}, to: {pos: [25, 50, 110], look: [0, 0, 20], fov: 46}, ease: 'linear', title: '14ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 46.56, end: LOOP_AT, from: {pos: [-43, 3.4, 11], look: [-50, 2.4, 20.8], fov: 50}, to: {pos: [-45, 2.4, 12.8], look: [-50, 2.4, 20.8], fov: 50}, ease: 'out', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: FOGO, to: FOGO, ease: 'linear', title: 'FOGO', sub: 'NA CIDADE!', titleBig: true},
];

import {povCam, trainU, TRACK} from './three/coaster';
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
  if (s.id === 'fila') {
    const tp = TRACK.getPointAt(trainU(t - PQ.RIDE, true));
    cam = {...cam, look: [tp.x, tp.y + 0.8, tp.z]};
  }
  // camera shake when the rock hits the water
  const sh = t < 1.34 || t >= LOOP_AT ? 0.12 : t >= 47.2 && t < 47.7 ? 0.3 : 0; // fire shake
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
