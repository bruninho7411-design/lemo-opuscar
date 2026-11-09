export const FPS = 30;
export const TOTAL_SEC = 46.0;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 45.3;
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
export const PR = {HOOK: -9, AREIA: -9, QUIOSQUE: -9, TORRE: -9, GUARDASOL: -9, SV: -9, TSUNAMI: 999};
/** ep. 20 zoo beats */
export const ZO = {HOOK: 2.1, CERCA: 21.2, LEAO: 23.16, GIRAFA: 23.78, ELEFANTE: 24.58, MACACOS: 25.52, TRAT: 27.28, FUGA: 43.8};
/** ep. 20 mansions / new houses */
export const BA = {LARA: 10.42, LET: 13.08, CASAS: 14.26};
const HOOKC: Cam = {pos: [0.4, 1.8, -233.6], look: [0, 2.3, -240], fov: 50};
export const OPEN: Cam = HOOKC;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const ZA: Cam = {pos: [30, 34, -212], look: [0, 0, -262], fov: 46};
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0, end: 2.1, from: HOOKC, to: {pos: [0.3, 1.75, -234.4], look: [0, 2.3, -240], fov: 50}, ease: 'linear', title: ''},
  {id: 'deu', start: 2.1, end: 3.38, from: ZA, to: {pos: [26, 30, -216], look: [0, 0, -262], fov: 46}, ease: 'out', title: 'DEU ZOO!', titleBig: true},
  {id: 'antes', start: 3.38, end: 5.86, from: {pos: [-330, 7, -12], look: [-330, 2, -42], fov: 56}, to: {pos: [-330, 5.5, -16], look: [-330, 2, -42], fov: 56}, ease: 'out', title: 'MAS ANTES...', titleBig: true},
  {id: 'lara', start: 5.86, end: 11.32, from: {pos: [-330, 4.6, -18], look: [-330, 2.2, -38], fov: 58}, to: {pos: [-330, 4.2, -21], look: [-330, 2.2, -38], fov: 58}, ease: 'out', title: 'FEZ TUDO E...'},
  {id: 'let', start: 11.32, end: 13.68, from: {pos: [-329, 4.6, -19], look: [-330, 2.2, -38], fov: 58}, to: {pos: [-330, 4.4, -21.5], look: [-330, 2.2, -38], fov: 58}, ease: 'out', title: 'FEZ TUDO E...'},
  {id: 'casas', start: 13.68, end: 16.98, from: {pos: [-316, 13, 47], look: [-330, 0.5, 29], fov: 52}, to: {pos: [-319, 10, 43], look: [-330, 0.5, 29], fov: 52}, ease: 'out', title: 'CADA SEGUIDOR', sub: 'VIRA UMA CASA! 🏠'},
  {id: 'prefeito_ep', start: 16.98, end: 20.76, from: {pos: [2.6, 2.4, 7.6], look: [0.8, 1.4, 0.8], fov: 38}, to: {pos: [2.2, 2.1, 6.2], look: [0.8, 1.4, 0.8], fov: 38}, ease: 'out', title: 'PREFEITO DO', sub: 'EPISÓDIO'},
  {id: 'c_cerca', start: 20.76, end: 23.08, from: {pos: [24, 24, -224], look: [0, 0, -262], fov: 50}, to: {pos: [20, 20, -228], look: [0, 0.5, -262], fov: 50}, ease: 'out', title: 'CERCA', sub: '1/5'},
  {id: 'c_leao', start: 23.08, end: 23.72, from: {pos: [-5.5, 4.6, -250], look: [-12, 1.5, -261], fov: 50}, to: {pos: [-6, 4.3, -251], look: [-12, 1.5, -261], fov: 50}, ease: 'out', title: 'LEÃO', sub: '2/5'},
  {id: 'c_girafa', start: 23.72, end: 24.54, from: {pos: [5.5, 5, -249], look: [12, 3.6, -261], fov: 52}, to: {pos: [6, 5, -250], look: [12, 3.6, -261], fov: 52}, ease: 'out', title: 'GIRAFA', sub: '3/5'},
  {id: 'c_elefante', start: 24.54, end: 25.42, from: {pos: [-3.5, 5.2, -266], look: [-12.5, 2, -276], fov: 52}, to: {pos: [-4, 5, -267], look: [-12.5, 2, -276], fov: 52}, ease: 'out', title: 'ELEFANTE', sub: '4/5'},
  {id: 'c_macacos', start: 25.42, end: 26.24, from: {pos: [5, 4.2, -263], look: [11, 2.8, -272], fov: 52}, to: {pos: [5.5, 4.0, -264], look: [11, 2.8, -272], fov: 52}, ease: 'out', title: 'MACACOS', sub: '5/5'},
  {id: 'trat', start: 26.24, end: 29.06, from: {pos: [0, 2.8, -244.5], look: [0, 1.7, -253], fov: 46}, to: {pos: [0, 2.6, -246], look: [0, 1.7, -253], fov: 46}, ease: 'out', title: 'TRATADORES', sub: 'SORTEADOS!'},
  {id: 'quer', start: 29.06, end: 34.6, from: {pos: [-330, 10, -12], look: [-330, 1.5, -44], fov: 58}, to: {pos: [-330, 8, -16], look: [-330, 1.5, -44], fov: 58}, ease: 'out', title: 'QUER UMA', sub: 'MANSÃO? 🏰'},
  {id: 'g_bio', start: 34.6, end: 36.48, from: MAY, to: MAY, ease: 'linear', title: ''},
  {id: 'meta', start: 36.48, end: 39.06, from: {pos: [8, 9, -8], look: [0, 3, -31], fov: 48}, to: {pos: [5, 7, -12], look: [0, 3, -31], fov: 48}, ease: 'out', title: 'FALTAM 155', sub: 'PROS 10 MIL!'},
  {id: 'enquete', start: 39.06, end: 42.8, from: {pos: [40, 40, -208], look: [0, 0, -262], fov: 46}, to: {pos: [22, 36, -214], look: [0, 0, -262], fov: 46}, ease: 'linear', title: '18ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 42.8, end: LOOP_AT, from: {pos: [0, 2.2, -229], look: [0, 1.8, -248], fov: 52}, to: {pos: [0, 1.9, -231.5], look: [0, 1.8, -246], fov: 52}, ease: 'linear', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: HOOKC, to: HOOKC, ease: 'linear', title: ''},
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
  const sh = (t >= 0.3 && t < 1.9) ? 0.35 : t >= LOOP_AT ? 0.05 : t >= 44.48 && t < LOOP_AT ? 0.3 : 0; // roar shake
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
