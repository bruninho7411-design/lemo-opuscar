export const FPS = 30;
export const TOTAL_SEC = 28.6;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 28.0;

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

export const PEDRA: Cam = {pos: [-25, 1.75, 4.4], look: [-25, 5.0, -11.6], fov: 62};
export const OPEN: Cam = {pos: [0, 250, 70], look: [-8, 0, 4], fov: 50};
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const MAY2: Cam = {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36};
const ST: V3 = [-30, 0, 0]; // water station block centre
const at = (p: V3, d: V3): V3 => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
export const SHOTS: Shot[] = [
  {id: 'pedra', start: 0, end: 1.0, from: PEDRA, to: {pos: [-25, 1.7, 3.7], look: [-25, 4.6, -11.6], fov: 62}, ease: 'linear', title: 'CAIU NA ÁGUA!', titleBig: true},
  {id: 'sobe', start: 1.0, end: 2.44, from: {pos: [-25, 1.9, 3.7], look: [-25, 4.4, -11.6], fov: 62}, to: {pos: [-5, 150, 95], look: [-12, 0, 0], fov: 50}, ease: 'in', title: 'A CIDADE DO INSTA', sub: 'MUDOU TUDO!'},
  {id: 'avenidas', start: 2.44, end: 3.56, from: {pos: [15, 3.4, 78], look: [15, 2.2, 50], fov: 50}, to: {pos: [15, 3.0, 44], look: [15, 2.0, 14], fov: 50}, ease: 'linear', title: 'AVENIDAS', sub: 'DE VERDADE!'},
  {id: 'quarteiroes', start: 3.56, end: 4.9, from: {pos: [70, 120, 150], look: [0, 0, 18], fov: 44}, to: {pos: [45, 92, 118], look: [-4, 0, 8], fov: 44}, ease: 'out', title: 'RUAS E', sub: 'QUARTEIRÕES'},
  {id: 'tudo', start: 4.9, end: 5.9, from: {pos: [0, 3.2, 9.5], look: [0, 1.4, 0.4], fov: 40}, to: MAY, ease: 'out', title: 'TUDO QUE VOCÊS', sub: 'VOTARAM TÁ AQUI'},
  {id: 'm_pizza', start: 5.9, end: 6.26, from: {pos: [6.5, 5.2, -2.5], look: [22.5, 2.8, -5.5], fov: 44}, to: {pos: [8.5, 4.6, -3.5], look: [22.5, 2.8, -5.5], fov: 44}, ease: 'out', title: 'PIZZARIA ✓'},
  {id: 'm_merc', start: 6.26, end: 6.78, from: {pos: [6.5, 5.2, 9.5], look: [22.5, 2.8, 5.5], fov: 44}, to: {pos: [8.5, 4.6, 8.0], look: [22.5, 2.8, 5.5], fov: 44}, ease: 'out', title: 'MERCADINHO ✓'},
  {id: 'm_shop', start: 6.78, end: 7.08, from: {pos: [5, 8, -11], look: [0, 3, -31], fov: 46}, to: {pos: [4, 7, -14], look: [0, 3, -31], fov: 46}, ease: 'out', title: 'SHOPPING ✓'},
  {id: 'm_hosp', start: 7.08, end: 7.48, from: {pos: [37, 8, -11], look: [30, 3.5, -31], fov: 46}, to: {pos: [35, 7, -14], look: [30, 3.5, -31], fov: 46}, ease: 'out', title: 'HOSPITAL ✓'},
  {id: 'm_air', start: 7.48, end: 7.9, from: {pos: [222, 13, 34], look: [196, 3, 2], fov: 46}, to: {pos: [218, 11, 28], look: [196, 3, 2], fov: 46}, ease: 'out', title: 'AEROPORTO ✓'},
  {id: 'm_pol', start: 7.9, end: 8.48, from: {pos: [-24, 8, -11], look: [-30, 3, -31], fov: 46}, to: {pos: [-25, 7, -14], look: [-30, 3, -31], fov: 46}, ease: 'out', title: 'DELEGACIA ✓'},
  {id: 'agua', start: 8.48, end: 10.24, from: {pos: at(ST, [6, 24, 36]), look: at(ST, [0, 3, -1]), fov: 46}, to: {pos: at(ST, [10, 14, 24]), look: at(ST, [-1, 4, -1]), fov: 46}, ease: 'out', title: 'DEU ÁGUA!', titleBig: true},
  {id: 'pronta', start: 10.24, end: 12.0, from: {pos: at(ST, [20, 10, 24]), look: at(ST, [-1.5, 5.5, -1.5]), fov: 50}, to: {pos: at(ST, [-14, 11, 26]), look: at(ST, [-1.5, 5.5, -1.5]), fov: 50}, ease: 'inOut', title: 'ESTAÇÃO DE ÁGUA', sub: 'PRONTA!'},
  {id: 'func', start: 12.0, end: 13.58, from: {pos: at(ST, [0, 3.8, 26.5]), look: at(ST, [0, 3.6, 10.5]), fov: 44}, to: {pos: at(ST, [0, 3.6, 24]), look: at(ST, [0, 3.6, 10.5]), fov: 44}, ease: 'out', title: 'FUNCIONÁRIOS', sub: 'SORTEADOS!'},
  {id: 'aparecer', start: 13.58, end: 14.92, from: {pos: [28, 30, 78], look: [8, 0, 34], fov: 46}, to: {pos: [22, 18, 58], look: [10, 0, 30], fov: 46}, ease: 'out', title: 'QUER APARECER', sub: 'NA CIDADE?'},
  {id: 'curte', start: 14.92, end: 17.0, from: MAY, to: MAY2, ease: 'out', title: 'PRA APARECER', sub: 'NA CIDADE'},
  {id: 'g_site', start: 17.0, end: 20.5, from: MAY, to: MAY, ease: 'linear', title: 'NO SITE:', sub: 'VOCÊ DENTRO DA CIDADE'},
  {id: 'bio', start: 20.5, end: 21.72, from: MAY, to: MAY2, ease: 'out', title: 'LINK NA BIO'},
  {id: 'enquete', start: 21.72, end: 26.32, from: {pos: [90, 80, 120], look: [0, 0, 0], fov: 46}, to: {pos: [40, 70, 135], look: [0, 0, 0], fov: 46}, ease: 'linear', title: '10ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 26.32, end: LOOP_AT, from: {pos: [0.4, 1.75, 4.8], look: [0, 1.5, 0.4], fov: 34}, to: {pos: [0.2, 1.65, 3.8], look: [0, 1.5, 0.4], fov: 34}, ease: 'out', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: PEDRA, to: PEDRA, ease: 'linear', title: 'CAIU NA ÁGUA!', titleBig: true},
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
  const sh = t >= 0.82 && t < 1.3 ? Math.pow(1 - (t - 0.82) / 0.48, 2) : 0;
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
export const WATER_T = 8.9;
export const HOOK_END = 2.44;
export const FLOW_T = 10.6;
export const WATER_CREW_T = 11.8;
