export const FPS = 30;
export const TOTAL_SEC = 29.0;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 28.3;

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

export const SHOTS: Shot[] = [
  {id: 'aerial', start: 0, end: 2.2, from: AERIAL, to: {pos: [0.6, 1.9, 5.6], look: [0, 1.4, 0.4], fov: 36}, ease: 'inOut', title: 'RESULTADO', sub: 'VOCÊS VOTARAM...'},
  {id: 'win', start: 2.2, end: 3.15, from: {pos: [0.4, 2.3, 6.4], look: [0, 1.4, 0], fov: 38}, to: {pos: [0.2, 2.1, 5.6], look: [0, 1.45, 0], fov: 38}, ease: 'out', title: 'PIZZARIA!', sub: 'VENCEU A 1ª VOTAÇÃO', titleBig: true},
  {id: 'chao', start: 3.15, end: 4.42, from: {pos: [9.0, 1.2, 9.5], look: [5.6, 0.2, 3.6], fov: 40}, to: {pos: [8.4, 1.0, 8.6], look: [5.6, 0.2, 3.6], fov: 40}, ease: 'out', title: 'MAS...', sub: 'NÃO BROTA DO CHÃO'},
  {id: 'fund', start: 4.42, end: 5.5, from: {pos: [10.5, 4.0, 10.5], look: [5.6, 0.9, 3.6], fov: 40}, to: {pos: [10.0, 3.6, 9.8], look: [5.6, 0.9, 3.6], fov: 40}, ease: 'out', title: '1. FUNDAÇÃO', sub: 'PEÇA POR PEÇA'},
  {id: 'paredes', start: 5.5, end: 7.0, from: {pos: [-0.5, 5.0, 13.0], look: [5.6, 0.9, 3.6], fov: 40}, to: {pos: [0.6, 4.5, 12.0], look: [5.6, 0.9, 3.6], fov: 40}, ease: 'out', title: '2. PAREDES', sub: 'PEÇA POR PEÇA'},
  {id: 'telhado', start: 7.0, end: 9.2, from: {pos: [12.5, 5.5, 8.5], look: [5.6, 1.4, 3.6], fov: 40}, to: {pos: [11.2, 4.4, 10.8], look: [5.6, 1.4, 3.6], fov: 40}, ease: 'inOut', title: '3. TELHADO', sub: 'E TOLDO LISTRADO'},
  {id: 'pizza', start: 9.2, end: 11.2, from: {pos: [8.6, 2.0, 9.6], look: [5.6, 2.2, 3.6], fov: 40}, to: {pos: [9.6, 3.2, 10.6], look: [5.6, 2.8, 3.6], fov: 40}, ease: 'out', title: '4. PIZZA GIGANTE', sub: 'PRA CIDADE INTEIRA VER'},
  {id: 'pronto', start: 11.2, end: 14.1, from: AERIAL, to: AERIAL, ease: 'inOut', title: 'PRONTO!', sub: '1ª OBRA DA CIDADE DO INSTA'},
  {id: 'terreno', start: 14.1, end: 16.7, from: {pos: [-2.5, 5.5, 12.5], look: [-8.2, 0, 4.4], fov: 38}, to: {pos: [-7.7, 1.45, 10.3], look: [-8.2, 0.75, 7.1], fov: 36}, ease: 'inOut', title: 'QUEM COMENTOU', sub: 'JÁ TEM TERRENO COM SEU @'},
  {id: 'forno', start: 16.7, end: 20.4, from: {pos: [0.9, 1.7, 6.0], look: [0, 1.3, 0.4], fov: 34}, to: {pos: [0.35, 1.65, 4.7], look: [0, 1.38, 0.4], fov: 34}, ease: 'inOut', title: 'FORNO QUENTE', sub: 'FALTA O 1º SABOR'},
  {id: 'calabresa', start: 20.4, end: 21.7, from: {pos: [11, 4.5, 11.5], look: [5.6, 1.6, 3.6], fov: 40}, to: {pos: [10.6, 4.3, 11.0], look: [5.6, 1.6, 3.6], fov: 40}, ease: 'linear', title: 'A) CALABRESA', sub: '2ª VOTAÇÃO'},
  {id: 'frango', start: 21.7, end: 23.2, from: {pos: [10.6, 4.3, 11.0], look: [5.6, 1.6, 3.6], fov: 40}, to: {pos: [10.2, 4.1, 10.5], look: [5.6, 1.6, 3.6], fov: 40}, ease: 'linear', title: 'B) FRANGO', sub: 'COM CATUPIRY'},
  {id: 'enquete', start: 23.2, end: 24.65, from: {pos: [10.2, 4.1, 10.5], look: [5.6, 1.6, 3.6], fov: 40}, to: {pos: [9.9, 4.0, 10.1], look: [5.6, 1.6, 3.6], fov: 40}, ease: 'linear', title: 'COMENTA A OU B', sub: 'SÓ A LETRA'},
  {id: 'segue', start: 24.65, end: 26.84, from: {pos: [0.0, 2.0, 6.4], look: [0, 1.55, 0.2], fov: 36}, to: {pos: [0.0, 1.9, 5.0], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'SEGUE E CURTE', sub: 'VIRE MORADOR'},
  {id: 'senao', start: 26.84, end: LOOP_AT, from: {pos: [0.2, 1.65, 4.3], look: [0, 1.45, 0.4], fov: 32}, to: {pos: [0.1, 1.65, 3.7], look: [0, 1.5, 0.4], fov: 32}, ease: 'out', title: 'SENÃO...', sub: 'A PIZZA ESFRIA!', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: AERIAL, to: AERIAL, ease: 'linear', title: 'RESULTADO', sub: 'VOCÊS VOTARAM...'},
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
  if (s.id === 'pronto') {
    const a = lerp(-0.2, 0.9, easeInOut(k0));
    cam = {pos: [3 + Math.sin(a) * 14, 8.5, 1.5 + Math.cos(a) * 14], look: [3, 0.6, 1.5], fov: 40};
  }
  return cam;
}

/** time used for world spawns: after LOOP_AT the world is reset to its starting state */
export const worldTime = (t: number) => (t >= LOOP_AT ? 0 : t);

export const CITIZEN_SPAWN = [-9, -9, -9, -9, -9, -9, -9, -9, -9, -9];
export const LOT_SPAWN = [-9, -9, -9, -9, -9, -9];
export const AB_SPAWN = -9;
export const PIZZA_START = 5.1;
export const PIZZA_PIECES = [5.1, 6.5, 7.1, 8.3, 8.6, 9.35];
export const LAGOA_START = 999;
