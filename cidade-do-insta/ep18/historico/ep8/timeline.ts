export const FPS = 30;
export const TOTAL_SEC = 36.2;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 35.5;

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

const AERIAL: Cam = {pos: [20, 30, 46], look: [1, 0, -2], fov: 38};

const OPEN: Cam = {pos: [63, 2.2, 30], look: [56, 9, -40], fov: 50};
const DONO: V3 = [8.6, 1.4, -11.8];
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0, end: 3.9, from: OPEN, to: {pos: [64, 3.5, 34], look: [56, 2, 0], fov: 50}, ease: 'inOut', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 8'},
  {id: 'aero', start: 3.9, end: 6.2, from: {pos: [26, 28, 56], look: [50, 0, 0], fov: 46}, to: {pos: [30, 20, 46], look: [50, 0, 4], fov: 46}, ease: 'out', title: 'DEU AEROPORTO!', sub: '56% DOS VOTOS'},
  {id: 'crew', start: 6.2, end: 10.8, from: {pos: [43, 2.9, 31], look: [50.5, 1.1, 28.9], fov: 46}, to: {pos: [44.5, 2.6, 30], look: [50.5, 1.1, 28.9], fov: 46}, ease: 'out', title: 'TRIPULAÇÃO', sub: 'QUEM COMENTOU GANHOU VAGA'},
  {id: 'meta', start: 10.8, end: 19.6, from: {pos: [13, 2.6, -5], look: DONO, fov: 40}, to: {pos: [11.8, 2.1, -6.8], look: DONO, fov: 40}, ease: 'out', title: 'META: 10 MIL', sub: 'DONO DO SHOPPING'},
  {id: 'ruas', start: 19.6, end: 23.2, from: {pos: [-200, 50, 40], look: [-272, 0, 130], fov: 48}, to: {pos: [-185, 85, 15], look: [-265, 0, 140], fov: 52}, ease: 'inOut', title: '+3 RUAS NOVAS', sub: '4456 CASAS'},
  {id: 'curso', start: 23.2, end: 25.9, from: {pos: [0.0, 2.0, 6.4], look: [0, 1.55, 0.2], fov: 36}, to: {pos: [0.0, 1.9, 5.2], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'CURSO NA BIO', sub: 'APRENDA A ANIMAR'},
  {id: 'enquete', start: 25.9, end: 32.56, from: {pos: [30, 26, 40], look: [6, 0, 0], fov: 48}, to: {pos: [24, 19, 32], look: [6, 0, 0], fov: 48}, ease: 'linear', title: '8ª VOTAÇÃO', sub: 'QUEM CUIDA DA CIDADE?'},
  {id: 'letra', start: 32.56, end: 33.86, from: {pos: [24, 19, 32], look: [6, 0, 0], fov: 48}, to: {pos: [23.5, 18.6, 31.4], look: [6, 0, 0], fov: 48}, ease: 'linear', title: 'COMENTA A OU B', sub: 'SÓ A LETRA'},
  {id: 'senao', start: 33.86, end: LOOP_AT, from: {pos: [0.2, 1.65, 4.3], look: [0, 1.45, 0.4], fov: 32}, to: {pos: [0.1, 1.65, 3.7], look: [0, 1.5, 0.4], fov: 32}, ease: 'out', title: 'SENÃO...', sub: 'A CIDADE PEGA FOGO!', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: OPEN, to: OPEN, ease: 'linear', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 8'},
];

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
export const NEW4_START = 20.9;
export const AIR_T = -9;
export const LAND_T = 0.1;
export const CREW_T = 9.4;
