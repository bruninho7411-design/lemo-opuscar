export const FPS = 30;
export const TOTAL_SEC = 51.361;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 50.661;

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

const OPEN: Cam = {pos: [-20, 70, 110], look: [-50, 0, 40], fov: 50};
const DONO: V3 = [8.6, 1.4, -11.8];
const CAS: V3 = [-50, 4, 40];
const MAY: Cam = {pos: [0.0, 2.0, 6.4], look: [0, 1.55, 0.2], fov: 36};
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0.0, end: 2.1, from: OPEN, to: {pos: [-44, 6, 58], look: CAS, fov: 46}, ease: 'in', title: 'AGORA VOCÊ PODE', sub: 'MORAR NA CIDADE!'},
  {id: 'loja', start: 2.1, end: 3.56, from: {pos: [18, 30, 40], look: [-6, 0, 0], fov: 50}, to: {pos: [14, 24, 32], look: [-6, 0, 0], fov: 50}, ease: 'out', title: 'ABRIU A LOJA!', sub: 'LOJA OFICIAL DA CIDADE'},
  {id: 'perso', start: 3.56, end: 10.08, from: {pos: [-5, 2.7, 3.4], look: [-5, 1.3, -4], fov: 42}, to: {pos: [-5, 2.4, 2.4], look: [-5, 1.3, -4], fov: 42}, ease: 'inOut', title: 'SEU PERSONAGEM', sub: 'DO SEU JEITO'},
  {id: 'castelo', start: 10.08, end: 15.04, from: {pos: [-34, 8, 62], look: CAS, fov: 44}, to: {pos: [-62, 7, 64], look: CAS, fov: 44}, ease: 'inOut', title: 'MANSÃO OU CASTELO', sub: 'COM SEU NOME E SUAS CORES'},
  {id: 'kit', start: 15.04, end: 18.78, from: {pos: [-30, 16, 70], look: [-50, 3, 40], fov: 50}, to: {pos: [-31, 14, 67], look: [-50, 3, 40], fov: 50}, ease: 'linear', title: 'KIT PREFEITO', sub: 'MANSÃO + PERSONAGEM'},
  {id: 'vitrine', start: 18.78, end: 23.78, from: {pos: [24, 20, 26], look: [4, 0, -4], fov: 50}, to: {pos: [-10, 22, 30], look: [-4, 0, -4], fov: 50}, ease: 'linear', title: 'E TEM MUITO MAIS', sub: 'PREÇO DE LANÇAMENTO'},
  {id: 'corre', start: 23.78, end: 25.42, from: MAY, to: {pos: [0.0, 1.9, 5.2], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'CORRE!', sub: 'DESCONTO ATÉ 11/11'},
  {id: 'jogo', start: 25.42, end: 38.131, from: {pos: [0.0, 2.0, 6.4], look: [0, 1.55, 0.2], fov: 36}, to: {pos: [0.0, 1.9, 5.2], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'TEM JOGO!', sub: 'GRÁTIS NA LOJINHA'},
  {id: 'sorteio', start: 38.131, end: 41.691, from: {pos: [-66, 16, 70], look: CAS, fov: 48}, to: {pos: [-64, 14, 67], look: CAS, fov: 48}, ease: 'linear', title: 'SORTEIO!', sub: 'KIT COMPLETO DE GRAÇA'},
  {id: 'regras', start: 41.691, end: 44.451, from: {pos: [-64, 14, 67], look: CAS, fov: 48}, to: {pos: [-63, 13, 65], look: CAS, fov: 48}, ease: 'linear', title: 'COMO PARTICIPAR', sub: 'NESSE VÍDEO'},
  {id: 'meta', start: 44.451, end: 48.091, from: {pos: [13, 2.6, -5], look: DONO, fov: 40}, to: {pos: [11.8, 2.1, -6.8], look: DONO, fov: 40}, ease: 'out', title: 'FALTA POUCO!', sub: 'META DOS 10 MIL'},
  {id: 'cta', start: 48.091, end: 49.411, from: MAY, to: {pos: [0.0, 1.9, 5.2], look: [0, 1.6, 0.2], fov: 36}, ease: 'out', title: 'LINK NA BIO', sub: 'É SÓ CLICAR'},
  {id: 'tchau', start: 49.411, end: LOOP_AT, from: {pos: [0.4, 1.7, 4.6], look: [0, 1.45, 0.4], fov: 34}, to: {pos: [0.2, 1.65, 3.9], look: [0, 1.5, 0.4], fov: 34}, ease: 'out', title: 'TE VEJO', sub: 'NA CIDADE!', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: OPEN, to: OPEN, ease: 'linear', title: 'AGORA VOCÊ PODE', sub: 'MORAR NA CIDADE!'},
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
export const NEW5_START = -9;
export const POL_T = -9;
export const CAR_T = -9;
export const COPS_T = -9;
export const CASTLE_T = 0.63;
export const SHOW_T = 3.591;
