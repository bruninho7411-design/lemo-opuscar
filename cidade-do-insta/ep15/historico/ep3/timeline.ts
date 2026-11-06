export const FPS = 30;
export const TOTAL_SEC = 25.9;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 25.2;

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

const CALA: Cam = {pos: [11.8, 4.4, 12.0], look: [5.6, 1.8, 3.6], fov: 40};
export const SHOTS: Shot[] = [
  {id: 'cala', start: 0, end: 2.4, from: CALA, to: {pos: [10.8, 3.9, 11.0], look: [5.6, 1.8, 3.6], fov: 40}, ease: 'out', title: 'DEU CALABRESA!', sub: 'VENCEU A 2ª VOTAÇÃO'},
  {id: 'forno', start: 2.4, end: 4.1, from: {pos: [8.6, 2.6, 9.6], look: [5.6, 2.6, 3.6], fov: 40}, to: {pos: [9.6, 3.2, 10.6], look: [5.6, 2.8, 3.6], fov: 40}, ease: 'out', title: '1º SABOR', sub: 'JÁ TÁ NO FORNO'},
  {id: 'trinta', start: 4.1, end: 6.9, from: {pos: [0, 7.5, 13.5], look: [0, 0.6, 0], fov: 40}, to: {pos: [0, 5.6, 10.5], look: [0, 0.8, 0.3], fov: 40}, ease: 'out', title: '30 MORADORES!', sub: 'A CIDADE CRESCEU'},
  {id: 'procura', start: 6.9, end: 8.6, from: {pos: [-9.5, 4.6, 9.0], look: [-1.8, 1.0, 0.6], fov: 40}, to: {pos: [-6.0, 4.4, 10.5], look: [-1.0, 1.0, 0.8], fov: 40}, ease: 'inOut', title: 'SEU @ TÁ AQUI?', sub: 'PROCURA AÍ!'},
  {id: 'problema', start: 8.6, end: 11.0, from: {pos: [0.9, 1.7, 6.0], look: [0, 1.3, 0.4], fov: 34}, to: {pos: [0.35, 1.65, 4.7], look: [0, 1.38, 0.4], fov: 34}, ease: 'inOut', title: 'MAS...', sub: 'TEM UM PROBLEMA'},
  {id: 'nenhuma', start: 11.0, end: 13.9, from: {pos: [0, 16, 5.5], look: [0, 0, 0], fov: 40}, to: {pos: [0, 12.5, 4.2], look: [0, 0, 0], fov: 40}, ease: 'out', title: 'NENHUMA CASA', sub: 'TODO MUNDO NA PRAÇA'},
  {id: 'votacao', start: 13.9, end: 15.3, from: {pos: [-1, 7, 14], look: [-2, 0, 2.5], fov: 42}, to: {pos: [2, 11, 16], look: [-1.5, 0, 1.5], fov: 42}, ease: 'inOut', title: '3ª VOTAÇÃO', sub: 'O QUE CONSTRUIR AGORA?'},
  {id: 'casas', start: 15.3, end: 18.3, from: {pos: [-2.5, 5.5, 12.5], look: [-8.2, 0.5, 4.4], fov: 40}, to: {pos: [-5.0, 3.6, 11.5], look: [-8.2, 0.9, 4.6], fov: 40}, ease: 'inOut', title: 'A) CASAS', sub: 'CADA UMA COM SEU @'},
  {id: 'campo', start: 18.3, end: 21.1, from: {pos: [13.5, 7.5, 5.0], look: [5.6, 0.2, -2.6], fov: 40}, to: {pos: [12.0, 6.0, 3.6], look: [5.6, 0.3, -2.6], fov: 40}, ease: 'out', title: 'B) CAMPO', sub: 'PRA CIDADE TER TIME'},
  {id: 'enquete', start: 21.1, end: 22.15, from: {pos: [12, 12, 15], look: [0, 0, 1], fov: 42}, to: {pos: [11.5, 11.4, 14.4], look: [0, 0, 1], fov: 42}, ease: 'linear', title: 'COMENTA A OU B', sub: 'SÓ A LETRA'},
  {id: 'segue', start: 22.15, end: 23.45, from: {pos: [0.0, 2.0, 6.4], look: [0, 1.55, 0.2], fov: 36}, to: {pos: [0.0, 1.9, 5.2], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'SEGUE AGORA', sub: 'VIRE MORADOR'},
  {id: 'senao', start: 23.45, end: LOOP_AT, from: {pos: [0.2, 1.65, 4.3], look: [0, 1.45, 0.4], fov: 32}, to: {pos: [0.1, 1.65, 3.7], look: [0, 1.5, 0.4], fov: 32}, ease: 'out', title: 'SENÃO...', sub: 'VOCÊ DORME NA PRAÇA!', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: CALA, to: CALA, ease: 'linear', title: 'DEU CALABRESA!', sub: 'VENCEU A 2ª VOTAÇÃO'},
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
export const CROWD_START = 5.0;
export const HOUSES_START = 15.75;
export const CAMPO_START = 18.9;
