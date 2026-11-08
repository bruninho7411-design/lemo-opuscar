export const FPS = 30;
export const TOTAL_SEC = 49.7;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 49.0;

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

const OPEN: Cam = {pos: [-30, 120, -50], look: [-45, 0, 100], fov: 52};
const DONO: V3 = [8.6, 1.4, -11.8];
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0, end: 3.3, from: OPEN, to: {pos: [-12, 8, 5], look: [0, 2, -13], fov: 44}, ease: 'in', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 6'},
  {id: 'shop', start: 3.3, end: 8.2, from: {pos: [-12, 8, 5], look: [0, 2, -13], fov: 44}, to: {pos: [-9, 6, 1], look: [0, 2.2, -13], fov: 44}, ease: 'out', title: 'DEU SHOPPING!', sub: '64% DOS VOTOS'},
  {id: 'workers', start: 8.2, end: 14.0, from: {pos: [1.0, 2.9, -2.2], look: [0, 1.1, -9.6], fov: 48}, to: {pos: [0.5, 2.6, -3.2], look: [0, 1.1, -9.6], fov: 48}, ease: 'inOut', title: 'CONTRATADOS!', sub: '3 SEGUIDORES SORTEADOS'},
  {id: 'dono', start: 14.0, end: 21.2, from: {pos: [13, 2.6, -5], look: DONO, fov: 40}, to: {pos: [11.8, 2.1, -6.8], look: DONO, fov: 40}, ease: 'out', title: 'SEM DONO!', sub: 'ENTRA NO SORTEIO'},
  {id: 'ruas', start: 21.2, end: 26.4, from: {pos: [-50, 30, 60], look: [-92, 0, 130], fov: 46}, to: {pos: [-38, 62, 38], look: [-90, 0, 135], fov: 48}, ease: 'inOut', title: '+4 RUAS NOVAS', sub: '1978 CASAS'},
  {id: 'procura', start: 26.4, end: 27.8, from: {pos: [-17.1, 1.7, 80], look: [-21.4, 0.7, 86], fov: 40}, to: {pos: [-17.1, 1.7, 92], look: [-21.4, 0.7, 98], fov: 40}, ease: 'linear', title: 'SEU @ TÁ AQUI?', sub: 'PROCURA A SUA!'},
  {id: 'arredores', start: 27.8, end: 31.6, from: {pos: [-3, 11, 37], look: [-24, 0, 20], fov: 44}, to: {pos: [-6, 7.5, 32], look: [-24, 0.4, 20], fov: 44}, ease: 'out', title: 'SÓ COMENTOU?', sub: 'OS ARREDORES LOTARAM'},
  {id: 'curso', start: 31.6, end: 35.5, from: {pos: [0.0, 2.0, 6.4], look: [0, 1.55, 0.2], fov: 36}, to: {pos: [0.0, 1.9, 5.2], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'CURSO NA BIO', sub: 'APRENDA A ANIMAR'},
  {id: 'enquete', start: 35.5, end: 45.0, from: {pos: [16, 14, 22], look: [0, 0, 6], fov: 46}, to: {pos: [12, 10, 17], look: [0, 0, 6], fov: 46}, ease: 'linear', title: '6ª VOTAÇÃO', sub: 'VAGAS DE EMPREGO'},
  {id: 'letra', start: 45.0, end: 46.74, from: {pos: [12, 10, 17], look: [0, 0, 6], fov: 46}, to: {pos: [11.6, 9.7, 16.4], look: [0, 0, 6], fov: 46}, ease: 'linear', title: 'COMENTA A OU B', sub: 'SÓ A LETRA'},
  {id: 'senao', start: 46.74, end: LOOP_AT, from: {pos: [0.2, 1.65, 4.3], look: [0, 1.45, 0.4], fov: 32}, to: {pos: [0.1, 1.65, 3.7], look: [0, 1.5, 0.4], fov: 32}, ease: 'out', title: 'SENÃO...', sub: 'VOCÊ FICA DESEMPREGADO!', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: OPEN, to: OPEN, ease: 'linear', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 6'},
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
export const NEW2_START = 22.6;
export const SHACK2_START = 29.9;
export const SHOP_T = 3.7;
export const WORKERS_T = 10.9;
