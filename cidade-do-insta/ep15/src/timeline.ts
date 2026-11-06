export const FPS = 30;
export const TOTAL_SEC = 52.65;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 52.05;
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
/** ep. 15 amusement park beats */
export const PQ = {HOOK: 3.42, BASE: 11.86, PORTAO: 12.4, RODA: 13.06, CARROSSEL: 13.96, MONTANHA: 14.82, RIDE: 16.4, STAFF: 17.0, CUT: 10.7};
const POVDUMMY: Cam = {pos: [0, 0, 0], look: [0, 0, 1], fov: 62};
export const OPEN: Cam = POVDUMMY;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const MAY2: Cam = {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36};
export const SHOTS: Shot[] = [
  {id: 'drop', start: 0, end: 1.4, from: POVDUMMY, to: POVDUMMY, ease: 'linear', title: 'SEGURA!', titleBig: true},
  {id: 'drop2', start: 1.4, end: 3.42, from: {pos: [13, 6, 47], look: [28, 5, 32], fov: 50}, to: {pos: [14, 5.5, 45], look: [28, 4.5, 32], fov: 50}, ease: 'linear', title: 'A PRIMEIRA', sub: 'MONTANHA-RUSSA!'},
  {id: 'deu', start: 3.42, end: 6.28, from: {pos: [44, 16, 10], look: [30, 0, 30], fov: 48}, to: {pos: [40, 13, 13], look: [30, 0, 30], fov: 48}, ease: 'out', title: 'DEU PARQUE!', titleBig: true},
  {id: 'dia', start: 6.28, end: 9.32, from: {pos: [2.6, 2.4, 7.6], look: [1.0, 1.4, 1.0], fov: 38}, to: {pos: [2.2, 2.1, 6.4], look: [1.0, 1.4, 1.0], fov: 38}, ease: 'out', title: 'DIA DO PREFEITO', sub: 'DO EPISÓDIO'},
  {id: 'inaugura', start: 9.32, end: 11.74, from: {pos: [1.8, 1.8, 6.6], look: [1.6, 1.2, 1.6], fov: 40}, to: {pos: [1.7, 1.7, 5.6], look: [1.6, 1.2, 1.6], fov: 40}, ease: 'out', title: 'ELE INAUGURA', sub: 'O PARQUE!'},
  {id: 'c_portao', start: 11.74, end: 12.98, from: {pos: [36, 6.5, 6], look: [30, 2.5, 21], fov: 50}, to: {pos: [35, 6, 8], look: [30, 2.5, 21], fov: 50}, ease: 'out', title: 'PORTÃO', sub: '1/4'},
  {id: 'c_roda', start: 12.98, end: 13.9, from: {pos: [19, 5, 11], look: [24.4, 6, 26.4], fov: 54}, to: {pos: [19.5, 5, 12.5], look: [24.4, 6, 26.4], fov: 54}, ease: 'out', title: 'RODA-GIGANTE', sub: '2/4'},
  {id: 'c_carrossel', start: 13.9, end: 14.66, from: {pos: [41, 5.5, 17], look: [35.2, 2, 26.4], fov: 50}, to: {pos: [40, 5, 18], look: [35.2, 2, 26.4], fov: 50}, ease: 'out', title: 'CARROSSEL', sub: '3/4'},
  {id: 'c_montanha', start: 14.66, end: 16.74, from: {pos: [50, 12, 52], look: [29, 3, 34], fov: 52}, to: {pos: [46, 10, 50], look: [29, 3.5, 34], fov: 52}, ease: 'linear', title: 'MONTANHA-RUSSA', sub: '4/4'},
  {id: 'staff', start: 16.74, end: 19.28, from: {pos: [30, 2.5, 13], look: [30, 2.3, 23.6], fov: 50}, to: {pos: [30, 2.4, 14.5], look: [30, 2.3, 23.6], fov: 50}, ease: 'out', title: 'FUNCIONÁRIOS', sub: 'SORTEADOS!'},
  {id: 'fila', start: 19.28, end: 26.38, from: {pos: [52, 15, 54], look: [29, 3, 33], fov: 50}, to: {pos: [44, 13, 56], look: [29, 3, 33], fov: 50}, ease: 'linear', title: 'DESAFIO', sub: 'DA FILA!'},
  {id: 'g_site', start: 26.38, end: 29.76, from: MAY, to: MAY, ease: 'linear', title: 'NO SITE:', sub: 'APAREÇA NA CIDADE'},
  {id: 'personaliza', start: 29.76, end: 31.02, from: {pos: [-2.6, 2.0, -2.2], look: [-6.5, 1.25, -5.5], fov: 40}, to: {pos: [-3.3, 1.8, -2.8], look: [-6.5, 1.25, -5.5], fov: 40}, ease: 'out', title: 'PERSONALIZA', sub: 'SEU PERSONAGEM'},
  {id: 'prefeito', start: 31.02, end: 32.34, from: MAY, to: MAY2, ease: 'out', title: 'PRÓXIMO', sub: 'PREFEITO?'},
  {id: 'bio', start: 32.34, end: 33.02, from: MAY, to: MAY2, ease: 'out', title: 'LINK NA BIO'},
  {id: 'morador', start: 33.02, end: 42.82, from: MAY, to: MAY, ease: 'linear', title: '1º MORADOR', sub: 'DENTRO DO SITE!'},
  {id: 'meta', start: 42.82, end: 44.14, from: {pos: [8, 9, -8], look: [0, 3, -31], fov: 48}, to: {pos: [5, 7, -12], look: [0, 3, -31], fov: 48}, ease: 'out', title: 'FALTA POUCO', sub: 'PROS 10 MIL!'},
  {id: 'enquete', start: 44.14, end: 49.56, from: {pos: [60, 55, 100], look: [10, 0, 20], fov: 46}, to: {pos: [25, 50, 110], look: [10, 0, 20], fov: 46}, ease: 'linear', title: '13ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 49.56, end: LOOP_AT, from: {pos: [40, 9, 46], look: [27, 5, 33], fov: 46}, to: {pos: [38, 8, 44], look: [27, 5, 33], fov: 46}, ease: 'out', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: POVDUMMY, to: POVDUMMY, ease: 'linear', title: 'SEGURA!', titleBig: true},
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
  if (s.id === 'drop' || s.id === 'loop') {
    const rt = s.id === 'loop' ? t - TOTAL_SEC : t;
    const tp = TRACK.getPointAt(trainU(rt, false));
    const push = clamp((rt + 0.6) / 2.0);
    cam = {pos: [42.5 - push * 1.5, 2.0 + push * 0.5, 43.5 - push * 1.5], look: [tp.x, tp.y + 0.8, tp.z], fov: 36};
  }
  // camera shake when the rock hits the water
  const sh = t >= 0.55 && t < 1.4 ? 0.35 * Math.min(1, (t - 0.55) / 0.15) : 0; // drop shake
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
