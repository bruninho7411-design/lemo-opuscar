export const FPS = 30;
export const TOTAL_SEC = 45.4;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 44.8;
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
export const BA = {LARA: -9, LET: -9, CASAS: -9, SHACK: -9};
/** ep. 21 water park beats */
export const PK = {BASE: -9, PISCINA: -9, TOBOGA: -9, ONDAS: -9, BALDE: -9, SV: -9, VIRA: 999};
/** ep. 22 beats */
export const CI = {HOOK: 3.34, POOF: 1.8, RUIM: 15.02, LEGAL: 16.52, SUPER: 20.96, TRIZ: 25.52, PAREDES: 27.0, LETREIRO: 29.12, PIPOCA: 29.9, TAPETE: 31.14, STAFF: 30.85, EXPLODE: 43.62};
const HOOKC: Cam = {pos: [-329.2, 1.7, 46.4], look: [-330, 1.25, 42], fov: 42};
const INTRO: Cam = {pos: [15, 11, 212], look: [15, 3, 150], fov: 52};
export const OPEN: Cam = HOOKC;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const C0 = 205, C1 = 186; // cinema
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0, end: 3.34, from: HOOKC, to: {pos: [-329.4, 1.6, 45.6], look: [-330, 1.25, 42], fov: 42}, ease: 'linear', title: ''},
  {id: 'intro', start: 3.34, end: 10.42, from: INTRO, to: {pos: [15, 7.5, 62], look: [15, 2, -10], fov: 54}, ease: 'linear', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 22'},
  {id: 'deu', start: 10.42, end: 12.94, from: {pos: [C0 - 36, 28, C1 + 28], look: [C0, 0, C1], fov: 48}, to: {pos: [C0 - 32, 25, C1 + 25], look: [C0, 0, C1], fov: 48}, ease: 'out', title: 'DEU CINEMA! 🎬', titleBig: false},
  {id: 't_ruim', start: 12.94, end: 16.06, from: {pos: [-340, 3.8, 89], look: [-340, 1.3, 78], fov: 50}, to: {pos: [-340, 3.4, 87], look: [-340, 1.3, 78], fov: 50}, ease: 'out', title: 'SÓ COMENTOU', sub: '= CASA RUIM 😬'},
  {id: 't_legal', start: 16.06, end: 17.78, from: {pos: [-331, 4.4, 90], look: [-331, 2, 78], fov: 50}, to: {pos: [-331, 4.1, 89], look: [-331, 2, 78], fov: 50}, ease: 'out', title: 'CURTIU', sub: '= CASA LEGAL 🏠'},
  {id: 't_super', start: 17.78, end: 22.62, from: {pos: [-319, 6, 96], look: [-319, 2.6, 77], fov: 52}, to: {pos: [-321, 8, 99], look: [-322, 2.2, 77], fov: 54}, ease: 'out', title: 'REPUBLICOU', sub: '= SUPER CASA 🏰'},
  {id: 'triz', start: 22.62, end: 26.64, from: {pos: [8, 3.4, 9], look: [19, 2.0, 5.5], fov: 44}, to: {pos: [10, 3.0, 8], look: [19, 2.0, 5.5], fov: 44}, ease: 'out', title: 'DONA DO', sub: 'MERCADINHO 🛒'},
  {id: 'c_base', start: 26.64, end: 28.2, from: {pos: [C0 - 34, 24, C1 + 26], look: [C0, 0, C1], fov: 50}, to: {pos: [C0 - 30, 21, C1 + 23], look: [C0, 0.5, C1], fov: 50}, ease: 'out', title: 'CINEMA', sub: 'MODO LEGO 🧱'},
  {id: 'c_paredes', start: 28.2, end: 29.02, from: {pos: [186, 9, 205], look: [208, 3, 186], fov: 52}, to: {pos: [187, 8.5, 204], look: [208, 3, 186], fov: 52}, ease: 'out', title: 'PAREDES', sub: '1/4'},
  {id: 'c_letreiro', start: 29.02, end: 29.82, from: {pos: [180, 7, 193], look: [200, 6, 186], fov: 52}, to: {pos: [181, 6.8, 192.5], look: [200, 6, 186], fov: 52}, ease: 'out', title: 'LETREIRO', sub: '2/4'},
  {id: 'c_pipoca', start: 29.82, end: 30.7, from: {pos: [190, 13, 201], look: [209, 10.5, 186], fov: 52}, to: {pos: [191, 12.6, 200], look: [209, 10.5, 186], fov: 52}, ease: 'out', title: 'PIPOCA', sub: 'GIGANTE 3/4'},
  {id: 'c_tapete', start: 30.7, end: 32.38, from: {pos: [180, 4.6, 197], look: [196, 1.6, 186], fov: 52}, to: {pos: [181.5, 4.3, 196], look: [196, 1.6, 186], fov: 52}, ease: 'out', title: 'TAPETE', sub: 'VERMELHO 4/4'},
  {id: 'quer', start: 32.38, end: 36.38, from: {pos: [-321, 8, 99], look: [-322, 2.2, 77], fov: 54}, to: {pos: [-320, 7, 96], look: [-321, 2.4, 77], fov: 54}, ease: 'out', title: 'QUER A', sub: 'SUPER CASA? 🏰'},
  {id: 'g_bio', start: 36.38, end: 38.16, from: MAY, to: MAY, ease: 'linear', title: ''},
  {id: 'enquete', start: 38.16, end: 42.0, from: {pos: [C0 - 44, 36, C1 + 38], look: [C0, 0, C1], fov: 46}, to: {pos: [C0 - 36, 31, C1 + 32], look: [C0, 0, C1], fov: 46}, ease: 'linear', title: '20ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 42.0, end: LOOP_AT, from: {pos: [186, 9, 203], look: [209, 11, 186], fov: 54}, to: {pos: [187.5, 8.6, 201.5], look: [209, 11.5, 186], fov: 54}, ease: 'linear', title: 'SENÃO...', titleBig: true},
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
  const sh = t >= 43.62 && t < LOOP_AT ? 0.35 : t >= 1.8 && t < 2.3 ? 0.2 : 0; // popcorn burst / poof
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
