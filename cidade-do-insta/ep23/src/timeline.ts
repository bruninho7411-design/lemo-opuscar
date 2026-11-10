export const FPS = 30;
export const TOTAL_SEC = 52.5;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 51.9;
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
export const CI = {HOOK: -9, POOF: -9, RUIM: 5.74, LEGAL: 7.22, SUPER: 9.94, TRIZ: -9, PAREDES: -9, LETREIRO: -9, PIPOCA: -9, TAPETE: -9, STAFF: -9, EXPLODE: 999};
/** ep. 23 beats */
export const SV23 = {POOF: 24.34, JUIZA: 25.9, ZOO: 27.7, DONO: 31.56, BALCAO: 34.88, CASQUINHA: 35.72, BOLAS: 37.16, MELT: 50.92};
const INTRO: Cam = {pos: [15, 11, 212], look: [15, 3, 150], fov: 52};
export const OPEN: Cam = INTRO;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const S0 = 205, S1 = 62; // ice cream shop
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0, end: 3.96, from: INTRO, to: {pos: [15, 8.5, 120], look: [15, 2, 40], fov: 54}, ease: 'linear', title: '🎉 BATEMOS', sub: '10 MIL!', titleBig: true},
  {id: 't_ruim', start: 3.96, end: 6.44, from: {pos: [-340, 3.8, 89], look: [-340, 1.3, 78], fov: 50}, to: {pos: [-340, 3.4, 87], look: [-340, 1.3, 78], fov: 50}, ease: 'out', title: 'SÓ COMENTA', sub: '= CASA RUIM 😬'},
  {id: 't_boa', start: 6.44, end: 8.06, from: {pos: [-331, 4.4, 90], look: [-331, 2, 78], fov: 50}, to: {pos: [-331, 4.1, 89], look: [-331, 2, 78], fov: 50}, ease: 'out', title: 'SEGUE', sub: '= CASA BOA 🏠'},
  {id: 't_super', start: 8.06, end: 10.98, from: {pos: [-319, 6, 96], look: [-319, 2.6, 77], fov: 52}, to: {pos: [-321, 8, 99], look: [-322, 2.2, 77], fov: 54}, ease: 'out', title: 'SEGUE + CURTE', sub: '+ REPUBLICA = SUPER CASA 🏰'},
  {id: 'g_jogo', start: 10.98, end: 20.88, from: MAY, to: MAY, ease: 'linear', title: ''},
  {id: 'desejos', start: 20.88, end: 25.44, from: {pos: [-330, 2.0, 50.5], look: [-330, 1.15, 42], fov: 46}, to: {pos: [-330, 1.8, 49], look: [-330, 1.15, 42], fov: 46}, ease: 'out', title: 'DESEJOS', sub: 'REALIZADOS ✨'},
  {id: 'juiza', start: 25.44, end: 27.12, from: {pos: [-340.6, 2.6, 49.5], look: [-342, 1.35, 42.3], fov: 46}, to: {pos: [-341, 2.5, 48.8], look: [-342, 1.35, 42.3], fov: 46}, ease: 'out', title: 'JUÍZA', sub: 'DA CIDADE ⚖️'},
  {id: 'zoo', start: 27.12, end: 28.84, from: {pos: [0.6, 2.8, -237.5], look: [1.8, 1.6, -245], fov: 46}, to: {pos: [0.9, 2.6, -238.5], look: [1.8, 1.6, -245], fov: 46}, ease: 'out', title: 'DONA DO', sub: 'ZOOLÓGICO 🦁'},
  {id: 'deu', start: 28.84, end: 30.68, from: {pos: [S0 - 34, 26, S1 + 26], look: [S0, 0, S1], fov: 48}, to: {pos: [S0 - 31, 24, S1 + 23], look: [S0, 0, S1], fov: 48}, ease: 'out', title: 'DEU', sub: 'SORVETERIA! 🍦'},
  {id: 'dono', start: 30.68, end: 33.74, from: {pos: [191, 2.7, 65.5], look: [200, 1.6, 62.5], fov: 44}, to: {pos: [192, 2.5, 64.8], look: [200, 1.6, 62.5], fov: 44}, ease: 'out', title: 'DONO DA', sub: 'SORVETERIA 👑'},
  {id: 'c_balcao', start: 33.74, end: 35.62, from: {pos: [187, 6.5, 73], look: [205, 2, 62], fov: 52}, to: {pos: [188, 6, 72], look: [205, 2, 62], fov: 52}, ease: 'out', title: 'BALCÃO', sub: '1/3'},
  {id: 'c_casquinha', start: 35.62, end: 36.88, from: {pos: [185, 9, 73], look: [207, 8, 62], fov: 52}, to: {pos: [186, 9, 72], look: [207, 8, 62], fov: 52}, ease: 'out', title: 'CASQUINHA', sub: 'GIGANTE 2/3'},
  {id: 'c_bolas', start: 36.88, end: 38.54, from: {pos: [185, 11, 71], look: [207, 11.5, 62], fov: 54}, to: {pos: [186, 11, 70], look: [207, 11.5, 62], fov: 54}, ease: 'out', title: 'BOLAS', sub: 'DE SORVETE 3/3'},
  {id: 'premios', start: 38.54, end: 44.84, from: {pos: [8, 9, -8], look: [0, 3, -31], fov: 48}, to: {pos: [5, 7, -12], look: [0, 3, -31], fov: 48}, ease: 'out', title: '🏆 PRÊMIOS', sub: 'DOS 10 MIL'},
  {id: 'enquete', start: 44.84, end: 49.2, from: {pos: [S0 - 44, 36, S1 + 36], look: [S0, 0, S1], fov: 46}, to: {pos: [S0 - 36, 31, S1 + 31], look: [S0, 0, S1], fov: 46}, ease: 'linear', title: '21ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 49.2, end: LOOP_AT, from: {pos: [185, 11, 71], look: [207, 11.5, 62], fov: 54}, to: {pos: [187, 10.6, 69.5], look: [207, 11.5, 62], fov: 54}, ease: 'linear', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: INTRO, to: INTRO, ease: 'linear', title: '🎉 BATEMOS', sub: '10 MIL!', titleBig: true},
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
  const sh = t >= 50.92 && t < LOOP_AT ? 0.25 : t >= 24.34 && t < 24.8 ? 0.12 : 0; // melt / poof
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
