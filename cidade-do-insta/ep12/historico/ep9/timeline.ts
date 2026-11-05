export const FPS = 30;
export const TOTAL_SEC = 30.1;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 29.4;

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

const OPEN: Cam = {pos: [-26.6, 1.3, 8.0], look: [-27.4, 0.9, 5.6], fov: 44};
const DONO: V3 = [8.6, 1.4, -11.8];
const DEL: V3 = [-25, 2.4, -14];
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0, end: 2.5, from: OPEN, to: {pos: [-26.8, 1.6, 9.5], look: [-27.6, 1.0, 5.0], fov: 46}, ease: 'out', title: 'PARADO AÍ!', sub: 'POLÍCIA DA CIDADE DO INSTA', titleBig: true},
  {id: 'del', start: 2.5, end: 4.72, from: {pos: [-12, 9, 10], look: DEL, fov: 46}, to: {pos: [-15, 6, 6], look: DEL, fov: 46}, ease: 'out', title: 'DEU DELEGACIA!', sub: '8085 MORADORES'},
  {id: 'cops', start: 4.72, end: 7.98, from: {pos: [-24.6, 3.4, 1.5], look: [-25, 1.2, -9], fov: 50}, to: {pos: [-24.8, 3.1, 0.2], look: [-25, 1.2, -9], fov: 50}, ease: 'out', title: 'POLICIAIS REAIS', sub: 'SEGUIDORES SORTEADOS'},
  {id: 'loja', start: 7.98, end: 14.24, from: {pos: [0.0, 2.0, 6.4], look: [0, 1.55, 0.2], fov: 36}, to: {pos: [0.0, 1.9, 5.2], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'TEM LOJA!', sub: 'LINK NA BIO'},
  {id: 'meta', start: 14.24, end: 19.62, from: {pos: [13, 2.6, -5], look: DONO, fov: 40}, to: {pos: [11.8, 2.1, -6.8], look: DONO, fov: 40}, ease: 'out', title: 'FALTAM 2 MIL', sub: 'PRA BATER 10 MIL'},
  {id: 'ruas', start: 19.62, end: 22.78, from: {pos: [-230, 70, 20], look: [-400, 0, 130], fov: 52}, to: {pos: [-200, 150, -40], look: [-380, 0, 150], fov: 56}, ease: 'inOut', title: '+17 RUAS NOVAS', sub: '8085 CASAS'},
  {id: 'enquete', start: 22.78, end: 26.82, from: {pos: [10, 26, 40], look: [-6, 0, 0], fov: 50}, to: {pos: [6, 20, 32], look: [-6, 0, 0], fov: 50}, ease: 'linear', title: '9ª VOTAÇÃO', sub: 'ÁGUA OU ENERGIA?'},
  {id: 'letra', start: 26.82, end: 27.92, from: {pos: [6, 20, 32], look: [-6, 0, 0], fov: 50}, to: {pos: [5.6, 19.6, 31.4], look: [-6, 0, 0], fov: 50}, ease: 'linear', title: 'COMENTA A OU B', sub: 'SÓ A LETRA'},
  {id: 'senao', start: 27.92, end: LOOP_AT, from: {pos: [0.2, 1.65, 4.3], look: [0, 1.45, 0.4], fov: 32}, to: {pos: [0.1, 1.65, 3.7], look: [0, 1.5, 0.4], fov: 32}, ease: 'out', title: 'SENÃO...', sub: 'A CIDADE FICA NO ESCURO!', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: OPEN, to: OPEN, ease: 'linear', title: 'PARADO AÍ!', sub: 'POLÍCIA DA CIDADE DO INSTA', titleBig: true},
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
export const NEW4_START = -9;
export const AIR_T = -9;
export const LAND_T = -9;
export const CREW_T = -9;
export const NEW5_START = 20.6;
export const POL_T = -9;
export const CAR_T = -9;
export const COPS_T = 5.3;
