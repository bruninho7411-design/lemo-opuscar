export const FPS = 30;
export const TOTAL_SEC = 40.95;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 40.25;

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

const OPEN: Cam = {pos: [11, 9.5, 14], look: [0, 0.6, 0.5], fov: 40};
export const SHOTS: Shot[] = [
  {id: 'casas', start: 0, end: 2.3, from: OPEN, to: {pos: [9.8, 8.3, 12.6], look: [-1, 0.6, 1], fov: 40}, ease: 'out', title: 'DEU CASAS!', sub: 'QUASE UNÂNIME'},
  {id: 'rua', start: 2.3, end: 3.9, from: {pos: [0, 9, -8], look: [0, 0, 16], fov: 42}, to: {pos: [0, 8, -6], look: [0, 0, 18], fov: 42}, ease: 'out', title: 'A 1ª AVENIDA', sub: 'DA CIDADE DO INSTA'},
  {id: 'asfalto', start: 3.9, end: 5.0, from: {pos: [2.4, 2.4, 3.2], look: [0, 0, 22], fov: 42}, to: {pos: [2.0, 2.0, 5.0], look: [0, 0, 26], fov: 42}, ease: 'out', title: '1. ASFALTO', sub: 'PEÇA POR PEÇA'},
  {id: 'casas2', start: 5.0, end: 10.6, from: {pos: [0, 6, 3], look: [0, 0, 24], fov: 44}, to: {pos: [0, 34, -10], look: [0, 0, 60], fov: 44}, ease: 'inOut', title: '261 CASAS', sub: 'UMA PRA CADA SEGUIDOR'},
  {id: 'procura', start: 10.6, end: 12.4, from: {pos: [0.9, 1.7, 9.0], look: [-3.4, 0.7, 14.5], fov: 40}, to: {pos: [0.9, 1.7, 20], look: [-3.4, 0.7, 25.5], fov: 40}, ease: 'linear', title: 'SEU @ TÁ AQUI?', sub: 'PROCURA A SUA!'},
  {id: 'arredores', start: 12.4, end: 16.3, from: {pos: [-5.5, 6.0, 33], look: [-19, 0.4, 20], fov: 42}, to: {pos: [-8.0, 3.4, 27.5], look: [-18, 0.6, 20], fov: 42}, ease: 'out', title: 'SÓ COMENTOU?', sub: 'FICOU NOS ARREDORES'},
  {id: 'mudar', start: 16.3, end: 18.3, from: {pos: [0.0, 2.0, 6.4], look: [0, 1.55, 0.2], fov: 36}, to: {pos: [0.0, 1.9, 5.2], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'VEM PRA AVENIDA', sub: 'É SÓ SEGUIR!'},
  {id: 'mansoes', start: 18.25, end: 21.4, from: {pos: [-4, 9, 72], look: [-22, 1.6, 56], fov: 42}, to: {pos: [-6, 6.5, 66], look: [-22, 1.6, 56], fov: 42}, ease: 'inOut', title: '3 MEGA MANSÕES', sub: 'UMA JÁ TEM DONO!'},
  {id: 'sorteio', start: 21.4, end: 25.0, from: {pos: [-7, 4.2, 55], look: [-21, 1.8, 44], fov: 40}, to: {pos: [-9.5, 3.4, 51], look: [-21, 1.8, 44], fov: 40}, ease: 'linear', title: 'SORTEIO!', sub: 'UM SEGUIDOR ALEATÓRIO'},
  {id: 'placa', start: 25.0, end: 26.5, from: {pos: [-10.0, 2.6, 45.0], look: [-17.7, 1.3, 41.6], fov: 40}, to: {pos: [-11.2, 2.2, 44.0], look: [-17.7, 1.4, 41.6], fov: 40}, ease: 'out', title: 'MANSÃO 1', sub: 'JÁ TEM DONO!'},
  {id: 'regra', start: 26.5, end: 30.4, from: {pos: [-6, 6, 64], look: [-22, 1.6, 60], fov: 42}, to: {pos: [-7.5, 5, 62], look: [-22, 1.6, 60], fov: 42}, ease: 'linear', title: 'PRÓXIMA MANSÃO', sub: 'PODE SER SUA'},
  {id: 'enquete', start: 30.4, end: 36.85, from: {pos: [14, 12, 20], look: [0, 0, 12], fov: 44}, to: {pos: [12, 10, 17], look: [0, 0, 10], fov: 44}, ease: 'linear', title: '4ª VOTAÇÃO', sub: 'O QUE CONSTRUIR AGORA?'},
  {id: 'letra', start: 36.85, end: 38.04, from: {pos: [12, 10, 17], look: [0, 0, 10], fov: 44}, to: {pos: [11.6, 9.7, 16.4], look: [0, 0, 10], fov: 44}, ease: 'linear', title: 'COMENTA A OU B', sub: 'SÓ A LETRA'},
  {id: 'senao', start: 38.04, end: LOOP_AT, from: {pos: [0.2, 1.65, 4.3], look: [0, 1.45, 0.4], fov: 32}, to: {pos: [0.1, 1.65, 3.7], look: [0, 1.5, 0.4], fov: 32}, ease: 'out', title: 'SENÃO...', sub: 'A MANSÃO FICA VAZIA!', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: OPEN, to: OPEN, ease: 'linear', title: 'DEU CASAS!', sub: 'QUASE UNÂNIME'},
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
export const ROAD_START = 4.1;
export const STREET_START = 5.6;
export const LONELY_START = 13.0;
export const MANSION_START = 18.6;
export const WINNER_T = 24.3;
