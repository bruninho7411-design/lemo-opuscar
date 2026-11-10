export const FPS = 30;
export const TOTAL_SEC = 46.9;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 46.3;
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
export const ZO = {HOOK: -9, CERCA: -9, LEAO: -9, GIRAFA: -9, ELEFANTE: -9, MACACOS: -9, TRAT: -9, FUGA: 999};
/** ep. 20 mansions / new houses */
export const BA = {LARA: -9, LET: -9, CASAS: -9, SHACK: 11.96};
/** ep. 21 water park beats */
export const PK = {BASE: 17.6, PISCINA: 18.9, TOBOGA: 19.7, ONDAS: 20.6, BALDE: 21.9, SV: 17.8, VIRA: 45.3};
const INTRO: Cam = {pos: [15, 11, 212], look: [15, 3, 150], fov: 52};
export const OPEN: Cam = INTRO;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const A0 = 205, A1 = 120; // water park centre
const PA: Cam = {pos: [A0 - 36, 28, A1 + 30], look: [A0, 0, A1], fov: 48};
export const SHOTS: Shot[] = [
  {id: 'intro', start: 0, end: 7.64, from: INTRO, to: {pos: [15, 7.5, 62], look: [15, 2, -10], fov: 54}, ease: 'linear', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 21'},
  {id: 'deu', start: 7.64, end: 10.18, from: PA, to: {pos: [A0 - 32, 25, A1 + 27], look: [A0, 0, A1], fov: 48}, ease: 'out', title: 'DEU PARQUE', sub: 'AQUÁTICO! 🌊'},
  {id: 'casinha', start: 10.18, end: 13.82, from: {pos: [-330, 3.0, 10.5], look: [-330, 1.2, -1.5], fov: 56}, to: {pos: [-330, 2.5, 8.2], look: [-330, 1.2, -1.5], fov: 56}, ease: 'out', title: 'SÓ COMENTOU?', sub: 'GANHOU CASINHA 😬'},
  {id: 'mansao', start: 13.82, end: 16.96, from: {pos: [-330, 4.6, -18], look: [-330, 2.2, -38], fov: 58}, to: {pos: [-330, 4.2, -21], look: [-330, 2.2, -38], fov: 58}, ease: 'out', title: 'FEZ TUDO?', sub: 'GANHOU MANSÃO! 🏰'},
  {id: 'c_base', start: 16.96, end: 19.18, from: {pos: [A0 - 34, 26, A1 + 26], look: [A0, 0, A1], fov: 50}, to: {pos: [A0 - 29, 21, A1 + 22], look: [A0, 0.5, A1], fov: 50}, ease: 'out', title: 'PARQUE AQUÁTICO', sub: 'MODO LEGO 🧱'},
  {id: 'c_piscina', start: 19.18, end: 20.02, from: {pos: [182, 8, 141], look: [196, 0.6, 126], fov: 52}, to: {pos: [183, 7.5, 140], look: [196, 0.6, 126], fov: 52}, ease: 'out', title: 'PISCINA', sub: '1/4'},
  {id: 'c_toboga', start: 20.02, end: 20.68, from: {pos: [199, 9, 129], look: [215, 5, 109], fov: 54}, to: {pos: [200, 8.6, 128], look: [215, 5, 109], fov: 54}, ease: 'out', title: 'TOBOGÃ', sub: '2/4'},
  {id: 'c_ondas', start: 20.68, end: 21.86, from: {pos: [203, 7.5, 143], look: [215, 0.6, 126], fov: 52}, to: {pos: [204, 7, 142], look: [215, 0.6, 126], fov: 52}, ease: 'out', title: 'PISCINA', sub: 'DE ONDAS 3/4'},
  {id: 'c_balde', start: 21.86, end: 23.38, from: {pos: [172, 13, 138], look: [195, 8, 109], fov: 56}, to: {pos: [174, 12, 136], look: [195, 8, 109], fov: 56}, ease: 'out', title: 'BALDE', sub: 'GIGANTE 4/4'},
  {id: 'g_ty', start: 23.38, end: 34.68, from: MAY, to: MAY, ease: 'linear', title: ''},
  {id: 'bio', start: 34.68, end: 35.74, from: MAY, to: {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36}, ease: 'out', title: 'LINK NA BIO'},
  {id: 'quer', start: 35.74, end: 39.72, from: {pos: [-330, 10, -12], look: [-330, 1.5, -44], fov: 58}, to: {pos: [-330, 8, -16], look: [-330, 1.5, -44], fov: 58}, ease: 'out', title: 'QUER UMA', sub: 'MANSÃO? 🏰'},
  {id: 'enquete', start: 39.72, end: 43.62, from: {pos: [A0 - 44, 36, A1 + 36], look: [A0, 0, A1], fov: 46}, to: {pos: [A0 - 36, 31, A1 + 31], look: [A0, 0, A1], fov: 46}, ease: 'linear', title: '19ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 43.62, end: LOOP_AT, from: {pos: [195, 5, 135], look: [195, 10, 109], fov: 58}, to: {pos: [195, 4.5, 132], look: [195, 10.5, 109], fov: 58}, ease: 'linear', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: INTRO, to: INTRO, ease: 'linear', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 21'},
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
  const sh = t >= 45.3 && t < LOOP_AT ? 0.35 : t >= 12.62 && t < 13.2 && false ? 0 : 0; // bucket tip shake
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
