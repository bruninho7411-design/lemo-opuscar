export const FPS = 30;
export const TOTAL_SEC = 44.6;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 44.0;
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

/** ep. 13 power plant: already built, lights off by day */
export const U = {BOLT: -9, FUND: -9, HALL: -9, TORRES: -9, CHAMINE: -9, TURB: -9, PAINEIS: -9, CREW: -9, LEVER: 999, LIGHT: 999, OFF: 999};
/** ep. 14 school beats */
export const E = {HOOK: 2.76, BUS_END: 2.76, PREF: 5.74, BASE: 9.3, PAREDES: 10.06, TELHADO: 10.98, SINO: 12.08, QUADRA: 12.64, PARQUINHO: 13.4, KIDS: 14.3, PROF: 14.3};
export const OPEN: Cam = {pos: [1.6, 10.4, 29.4], look: [0, 10.1, 34], fov: 40};
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const MAY2: Cam = {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36};
export const SHOTS: Shot[] = [
  {id: 'sinal', start: 0, end: 1.5, from: OPEN, to: {pos: [1.3, 10.3, 30.2], look: [0, 10.1, 34], fov: 40}, ease: 'linear', title: 'ATENÇÃO!', titleBig: true},
  {id: 'onibus', start: 1.5, end: 2.76, from: {pos: [6, 1.4, 12.2], look: [-2, 4, 30], fov: 50}, to: {pos: [5, 1.6, 11.6], look: [-2, 4, 30], fov: 50}, ease: 'linear', title: 'BATEU O SINAL!'},
  {id: 'deu', start: 2.76, end: 5.2, from: {pos: [16, 16, 6], look: [0, 0, 30], fov: 48}, to: {pos: [10, 13, 9], look: [0, 0, 30], fov: 48}, ease: 'out', title: 'DEU ESCOLA!', titleBig: true},
  {id: 'prefeito_ep', start: 5.2, end: 8.58, from: {pos: [2.6, 2.4, 7.6], look: [0.8, 1.4, 0.8], fov: 38}, to: {pos: [2.2, 2.1, 6.2], look: [0.8, 1.4, 0.8], fov: 38}, ease: 'out', title: 'PREFEITO DO', sub: 'EPISÓDIO'},
  {id: 'c_base', start: 8.58, end: 10.06, from: {pos: [18, 22, 6], look: [0, 0, 29], fov: 50}, to: {pos: [14, 18, 9], look: [0, 1, 29], fov: 50}, ease: 'out', title: 'BORA', sub: 'CONSTRUIR!'},
  {id: 'c_paredes', start: 10.06, end: 10.98, from: {pos: [9, 6.5, 15], look: [0, 2.5, 32], fov: 50}, to: {pos: [8, 6, 16], look: [0, 2.5, 32], fov: 50}, ease: 'out', title: 'PAREDES', sub: '1/5'},
  {id: 'c_telhado', start: 10.98, end: 11.72, from: {pos: [-11, 9.5, 16], look: [0, 4, 33], fov: 50}, to: {pos: [-10, 9, 17], look: [0, 4, 33], fov: 50}, ease: 'out', title: 'TELHADO', sub: '2/5'},
  {id: 'c_sino', start: 11.72, end: 12.58, from: {pos: [3.5, 8, 21], look: [0, 8.2, 34], fov: 50}, to: {pos: [3, 8.4, 22.5], look: [0, 8.6, 34], fov: 50}, ease: 'out', title: 'TORRE DO SINO', sub: '3/5'},
  {id: 'c_quadra', start: 12.58, end: 13.32, from: {pos: [-13, 6.5, 15], look: [-4.8, 0.5, 24.8], fov: 50}, to: {pos: [-12, 6, 16], look: [-4.8, 0.5, 24.8], fov: 50}, ease: 'out', title: 'QUADRA', sub: '4/5'},
  {id: 'c_parquinho', start: 13.32, end: 14.04, from: {pos: [13, 5.5, 15], look: [5.2, 1.2, 24], fov: 50}, to: {pos: [12, 5, 16], look: [5.2, 1.2, 24], fov: 50}, ease: 'out', title: 'PARQUINHO', sub: '5/5'},
  {id: 'prof', start: 14.04, end: 16.74, from: {pos: [0, 3.8, 15.5], look: [0, 3.0, 29.4], fov: 44}, to: {pos: [0, 3.6, 18], look: [0, 3.0, 29.4], fov: 44}, ease: 'out', title: 'PROFESSORES', sub: 'SORTEADOS!'},
  {id: 'pronta', start: 16.74, end: 20.26, from: {pos: [24, 30, 4], look: [0, 0, 27], fov: 48}, to: {pos: [-18, 28, 6], look: [0, 0, 27], fov: 48}, ease: 'inOut', title: 'ESCOLA', sub: 'PRONTA!'},
  {id: 'meta', start: 20.26, end: 23.44, from: {pos: [8, 9, -8], look: [0, 3, -31], fov: 48}, to: {pos: [5, 7, -12], look: [0, 3, -31], fov: 48}, ease: 'out', title: 'FALTA POUCO', sub: 'PROS 10 MIL!'},
  {id: 'chamada', start: 23.44, end: 28.14, from: {pos: [0, 4.2, 14], look: [0, 3, 30], fov: 46}, to: {pos: [0, 3.8, 17], look: [0, 3, 30], fov: 46}, ease: 'linear', title: 'HORA DA', sub: 'CHAMADA!'},
  {id: 'prefeito', start: 28.14, end: 31.64, from: MAY, to: MAY2, ease: 'out', title: 'PREFEITO DO', sub: 'PRÓXIMO EPISÓDIO'},
  {id: 'g_site', start: 31.64, end: 34.52, from: MAY, to: MAY, ease: 'linear', title: 'NO SITE:', sub: 'COLOCA SEU @'},
  {id: 'personaliza', start: 34.52, end: 35.5, from: {pos: [-2.6, 2.0, -2.2], look: [-6.5, 1.25, -5.5], fov: 40}, to: {pos: [-3.3, 1.8, -2.8], look: [-6.5, 1.25, -5.5], fov: 40}, ease: 'out', title: 'PERSONALIZA', sub: 'SEU PERSONAGEM'},
  {id: 'bio', start: 35.5, end: 36.78, from: MAY, to: MAY2, ease: 'out', title: 'LINK NA BIO'},
  {id: 'enquete', start: 36.78, end: 42.16, from: {pos: [60, 55, 100], look: [0, 0, 10], fov: 46}, to: {pos: [25, 50, 110], look: [0, 0, 10], fov: 46}, ease: 'linear', title: '12ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 42.16, end: LOOP_AT, from: {pos: [0.4, 1.75, 4.8], look: [0, 1.5, 0.4], fov: 34}, to: {pos: [0.2, 1.65, 3.8], look: [0, 1.5, 0.4], fov: 34}, ease: 'out', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: OPEN, to: OPEN, ease: 'linear', title: 'ATENÇÃO!', titleBig: true},
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
  // camera shake when the rock hits the water
  const sh0 = t < 1.4 ? 1 - t / 1.4 : t >= LOOP_AT ? 1 : 0; // bell shake
  const sh = sh0 * 0.5;
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
