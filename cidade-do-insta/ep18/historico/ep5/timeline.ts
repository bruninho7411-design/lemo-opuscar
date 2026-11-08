export const FPS = 30;
export const TOTAL_SEC = 41.1;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 40.4;

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

const OPEN: Cam = {pos: [0, 75, -35], look: [0, 0, 60], fov: 50};
const M2: V3 = [-21, 1.8, 56];
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0, end: 2.2, from: OPEN, to: {pos: [0.5, 5, 2], look: [0, 0.5, 30], fov: 44}, ease: 'in', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 5'},
  {id: 'merc', start: 2.2, end: 7.9, from: {pos: [13, 5.5, 7], look: [5.6, 1.2, -2.4], fov: 40}, to: {pos: [10.5, 3.6, 4], look: [5.6, 1.4, -2.4], fov: 40}, ease: 'out', title: 'DEU MERCADINHO!', sub: '93% DOS VOTOS'},
  {id: 'lotou', start: 7.9, end: 10.7, from: {pos: [0, 6, 2], look: [0, 0, 40], fov: 44}, to: {pos: [0, 14, -4], look: [0, 0, 70], fov: 44}, ease: 'inOut', title: 'A AVENIDA LOTOU', sub: '261 CASAS'},
  {id: 'ruas', start: 10.7, end: 15.4, from: {pos: [-8, 22, 66], look: [-38, 0, 112], fov: 46}, to: {pos: [0, 48, 52], look: [-38, 0, 116], fov: 46}, ease: 'inOut', title: '4 RUAS NOVAS', sub: 'UMA CASA PRA CADA SEGUIDOR'},
  {id: 'procura', start: 15.4, end: 16.3, from: {pos: [-17.1, 1.7, 80], look: [-21.4, 0.7, 86], fov: 40}, to: {pos: [-17.1, 1.7, 90], look: [-21.4, 0.7, 96], fov: 40}, ease: 'linear', title: 'SEU @ TÁ AQUI?', sub: 'PROCURA A SUA!'},
  {id: 'arredores', start: 16.3, end: 19.0, from: {pos: [-5.5, 6.0, 33], look: [-19, 0.4, 20], fov: 42}, to: {pos: [-8.0, 3.4, 27.5], look: [-18, 0.6, 20], fov: 42}, ease: 'out', title: 'SÓ COMENTOU?', sub: 'FICOU NOS ARREDORES'},
  {id: 'sorteio', start: 19.0, end: 22.7, from: {pos: [-6, 5, 66], look: M2, fov: 40}, to: {pos: [-8.5, 4, 63], look: M2, fov: 40}, ease: 'linear', title: 'MANSÃO 2', sub: 'SORTEIO!'},
  {id: 'placa', start: 22.7, end: 23.6, from: {pos: [-10.0, 2.6, 57.0], look: [-17.7, 1.3, 53.6], fov: 40}, to: {pos: [-11.2, 2.2, 56.0], look: [-17.7, 1.4, 53.6], fov: 40}, ease: 'out', title: 'MANSÃO 2', sub: 'JÁ TEM DONO!'},
  {id: 'regra', start: 23.6, end: 26.9, from: {pos: [-6, 6, 76], look: [-22, 1.6, 68], fov: 42}, to: {pos: [-7.5, 5, 74], look: [-22, 1.6, 68], fov: 42}, ease: 'linear', title: 'ÚLTIMA MANSÃO', sub: 'PODE SER SUA'},
  {id: 'curso', start: 26.9, end: 30.95, from: {pos: [0.0, 2.0, 6.4], look: [0, 1.55, 0.2], fov: 36}, to: {pos: [0.0, 1.9, 5.2], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'CURSO NA BIO', sub: 'APRENDA A ANIMAR'},
  {id: 'enquete', start: 30.95, end: 36.4, from: {pos: [14, 12, 20], look: [0, 0, 12], fov: 44}, to: {pos: [12, 10, 17], look: [0, 0, 10], fov: 44}, ease: 'linear', title: '5ª VOTAÇÃO', sub: 'O QUE A CIDADE GANHA?'},
  {id: 'letra', start: 36.4, end: 37.78, from: {pos: [12, 10, 17], look: [0, 0, 10], fov: 44}, to: {pos: [11.6, 9.7, 16.4], look: [0, 0, 10], fov: 44}, ease: 'linear', title: 'COMENTA A OU B', sub: 'SÓ A LETRA'},
  {id: 'senao', start: 37.78, end: LOOP_AT, from: {pos: [0.2, 1.65, 4.3], look: [0, 1.45, 0.4], fov: 32}, to: {pos: [0.1, 1.65, 3.7], look: [0, 1.5, 0.4], fov: 32}, ease: 'out', title: 'SENÃO...', sub: 'A MANSÃO FICA VAZIA!', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: OPEN, to: OPEN, ease: 'linear', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 5'},
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
export const WINNER_T = 22.3;
export const NEW_START = 11.4;
export const MERC_T = 4.2;
