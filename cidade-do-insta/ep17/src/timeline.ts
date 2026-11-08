export const FPS = 30;
export const TOTAL_SEC = 47.74;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 47.14;
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
/** ep. 17 stadium beats */
export const ST = {HOOK: 2.24, BASE: 8.06, GRAMADO: 8.72, TRAVES: 9.58, ARQ: 10.32, REFL: 11.44, TORCIDA: 12.0, TIME: 13.1, OWN: 46.3};
const GOL: Cam = {pos: [68.7, 1.25, 30.5], look: [62.5, 1.0, 30.0], fov: 54};
export const OPEN: Cam = GOL;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const MAY2: Cam = {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36};
export const SHOTS: Shot[] = [
  {id: 'gol', start: 0, end: 2.24, from: GOL, to: {pos: [68.4, 1.3, 30.4], look: [62.5, 1.1, 30.0], fov: 54}, ease: 'linear', title: 'GOOOOL!', titleBig: true},
  {id: 'deu', start: 2.24, end: 4.14, from: {pos: [76, 16, 12], look: [60, 0, 30], fov: 48}, to: {pos: [73, 13, 14], look: [60, 0, 30], fov: 48}, ease: 'out', title: 'DEU ESTÁDIO!', titleBig: true},
  {id: 'prefeito_ep', start: 4.14, end: 7.88, from: {pos: [2.6, 2.4, 7.6], look: [0.8, 1.4, 0.8], fov: 38}, to: {pos: [2.2, 2.1, 6.2], look: [0.8, 1.4, 0.8], fov: 38}, ease: 'out', title: 'PREFEITA DO', sub: 'EPISÓDIO'},
  {id: 'c_gramado', start: 7.88, end: 9.38, from: {pos: [75, 19, 12], look: [60, 0, 30], fov: 50}, to: {pos: [72, 16, 14], look: [60, 0.5, 30], fov: 50}, ease: 'out', title: 'GRAMADO', sub: '1/4'},
  {id: 'c_traves', start: 9.38, end: 10.28, from: {pos: [49, 3.2, 23], look: [52.8, 1.4, 30], fov: 52}, to: {pos: [49.5, 3, 24], look: [52.8, 1.4, 30], fov: 52}, ease: 'out', title: 'TRAVES', sub: '2/4'},
  {id: 'c_arq', start: 10.28, end: 11.32, from: {pos: [71, 6.5, 13], look: [60, 1.5, 24], fov: 52}, to: {pos: [70, 6, 14], look: [60, 1.5, 24], fov: 52}, ease: 'out', title: 'ARQUIBANCADA', sub: '3/4'},
  {id: 'c_refl', start: 11.32, end: 12.3, from: {pos: [43, 11, 7], look: [56, 3.5, 27], fov: 54}, to: {pos: [44, 10, 8.5], look: [56, 3.5, 27], fov: 54}, ease: 'out', title: 'REFLETORES', sub: '4/4'},
  {id: 'time', start: 12.3, end: 15.34, from: {pos: [60, 4.4, 42.5], look: [60, 2.2, 31.6], fov: 44}, to: {pos: [60, 4.0, 41], look: [60, 2.2, 31.6], fov: 44}, ease: 'out', title: 'TIME DA CIDADE', sub: 'SORTEADO!'},
  {id: 'escalacao', start: 15.34, end: 21.6, from: {pos: [80, 15, 50], look: [60, 0, 30], fov: 46}, to: {pos: [74, 13, 54], look: [60, 0, 30], fov: 46}, ease: 'linear', title: 'ESCALAÇÃO', sub: 'COMENTA SUA POSIÇÃO!'},
  {id: 'prefeito', start: 21.6, end: 24.68, from: MAY, to: MAY2, ease: 'out', title: 'CAPITÃO E', sub: 'PRÓXIMO PREFEITO'},
  {id: 'g_jogo', start: 24.68, end: 28.96, from: MAY, to: MAY, ease: 'linear', title: 'O JOGO', sub: 'CONTINUA EM TESTES'},
  {id: 'meta', start: 28.96, end: 30.66, from: {pos: [8, 9, -8], look: [0, 3, -31], fov: 48}, to: {pos: [5, 7, -12], look: [0, 3, -31], fov: 48}, ease: 'out', title: 'FALTA MUITO POUCO', sub: 'PROS 10 MIL!'},
  {id: 'vagas', start: 30.66, end: 41.0, from: {pos: [80, 15, 50], look: [60, 0, 30], fov: 46}, to: {pos: [72, 12, 55], look: [60, 0, 30], fov: 46}, ease: 'linear', title: 'QUER SER', sub: 'ALGUMA COISA?'},
  {id: 'enquete', start: 41.0, end: 45.6, from: {pos: [60, 55, 100], look: [20, 0, 20], fov: 46}, to: {pos: [35, 50, 110], look: [20, 0, 20], fov: 46}, ease: 'linear', title: '15ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 45.6, end: LOOP_AT, from: {pos: [51.3, 1.25, 29.5], look: [57.5, 1.0, 30.0], fov: 54}, to: {pos: [51.6, 1.3, 29.6], look: [57.5, 1.0, 30.0], fov: 54}, ease: 'linear', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: GOL, to: GOL, ease: 'linear', title: 'GOOOOL!', titleBig: true},
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
  if (s.id === 'fila_off') {
    const tp = TRACK.getPointAt(trainU(t - PQ.RIDE, true));
    cam = {...cam, look: [tp.x, tp.y + 0.8, tp.z]};
  }
  // camera shake when the rock hits the water
  const sh = (t >= 0.28 && t < 0.9) ? 0.3 * (1 - (t - 0.28) / 0.62) : 0; // net hit shake
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
