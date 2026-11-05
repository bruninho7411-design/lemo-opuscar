export const FPS = 30;
export const TOTAL_SEC = 47.6;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 47.0;

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

/** episode 13 beats (seconds) */
export const U = {BOLT: 2.62, FUND: 7.5, HALL: 8.0, TORRES: 8.84, CHAMINE: 9.66, TURB: 10.52, PAINEIS: 11.54, CREW: 14.1, LEVER: 17.08, LIGHT: 19.6, OFF: 45.9};
export const OPEN: Cam = {pos: [118, 150, 175], look: [28, 0, 4], fov: 50};
export const PEDRA = OPEN;
const PL: V3 = [60, 0, 0]; // power plant block
const at = (d: V3, look = false): V3 => [PL[0] + d[0], PL[1] + d[1], PL[2] + d[2]];
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const MAY2: Cam = {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36};
export const SHOTS: Shot[] = [
  {id: 'escuro', start: 0, end: 2.62, from: OPEN, to: {pos: [100, 120, 140], look: [40, 0, 2], fov: 50}, ease: 'linear', title: 'A CIDADE', sub: 'NO ESCURO...'},
  {id: 'raio', start: 2.62, end: 3.12, from: {pos: at([0, 5, 42]), look: at([0, 16, 0]), fov: 58}, to: {pos: at([0, 5.5, 39]), look: at([0, 14, 0]), fov: 58}, ease: 'out', title: 'CAIU UM RAIO!', titleBig: true},
  {id: 'deu', start: 3.12, end: 5.6, from: {pos: at([22, 16, 30]), look: at([0, 1, 0]), fov: 48}, to: {pos: at([10, 12, 28]), look: at([0, 1, 0]), fov: 48}, ease: 'out', title: 'DEU USINA!', titleBig: true},
  {id: 'bora', start: 5.6, end: 6.82, from: {pos: [0, 3.0, 9.0], look: [0, 1.4, 0.4], fov: 40}, to: MAY, ease: 'out', title: 'BORA', sub: 'CONSTRUIR!'},
  {id: 'c_fund', start: 6.82, end: 8.34, from: {pos: at([20, 24, 30]), look: at([0, 0, 0]), fov: 50}, to: {pos: at([14, 20, 26]), look: at([-2, 1, -1]), fov: 50}, ease: 'out', title: 'FUNDAÇÃO', sub: '1/5'},
  {id: 'c_torres', start: 8.34, end: 9.6, from: {pos: at([21, 8, 17]), look: at([4.8, 6, -2]), fov: 54}, to: {pos: at([19, 7, 15]), look: at([4.8, 6, -2]), fov: 54}, ease: 'out', title: 'TORRES', sub: '2/5'},
  {id: 'c_chamine', start: 9.6, end: 10.42, from: {pos: at([-20, 5, 8]), look: at([-8.6, 9, -8]), fov: 56}, to: {pos: at([-19, 4.5, 7]), look: at([-8.6, 10, -8]), fov: 56}, ease: 'out', title: 'CHAMINÉ', sub: '3/5'},
  {id: 'c_turb', start: 10.42, end: 11.44, from: {pos: at([23, 3, 21]), look: at([9.6, 7.5, 8.8]), fov: 56}, to: {pos: at([22, 2.8, 20]), look: at([9.6, 8, 8.8]), fov: 56}, ease: 'out', title: 'TURBINAS', sub: '4/5'},
  {id: 'c_paineis', start: 11.44, end: 12.62, from: {pos: at([11, 5.5, 20]), look: at([5, 0.8, 7.6]), fov: 50}, to: {pos: at([10, 5, 18.5]), look: at([5, 0.8, 7.6]), fov: 50}, ease: 'out', title: 'PAINÉIS SOLARES', sub: '5/5'},
  {id: 'pronta', start: 12.62, end: 14.04, from: {pos: at([26, 14, 30]), look: at([0, 4, -1]), fov: 50}, to: {pos: at([-18, 15, 32]), look: at([0, 4, -1]), fov: 50}, ease: 'inOut', title: 'USINA', sub: 'PRONTA!'},
  {id: 'crew', start: 14.04, end: 17.08, from: {pos: at([0, 3.8, 26.5]), look: at([0, 3.4, 10.4]), fov: 44}, to: {pos: at([0, 3.6, 24]), look: at([0, 3.4, 10.4]), fov: 44}, ease: 'out', title: 'TRABALHADORES', sub: 'SORTEADOS!'},
  {id: 'alavanca', start: 17.08, end: 19.6, from: {pos: [1.2, 2.2, 6.4], look: [0.5, 1.4, 0.6], fov: 38}, to: {pos: [0.9, 1.9, 4.8], look: [0.5, 1.4, 0.6], fov: 38}, ease: 'out', title: 'PREFEITO,', sub: 'PODE LIGAR?'},
  {id: 'luz', start: 19.6, end: 21.1, from: {pos: [150, 130, 170], look: [30, 0, 0], fov: 52}, to: {pos: [130, 115, 150], look: [20, 0, 0], fov: 52}, ease: 'out', title: 'LUZ!', titleBig: true},
  {id: 'desafio', start: 21.1, end: 26.32, from: {pos: [40, 40, 70], look: [0, 0, 0], fov: 46}, to: {pos: [20, 36, 76], look: [0, 0, 0], fov: 46}, ease: 'linear', title: 'O DESAFIO', sub: 'ENCHE A BATERIA!'},
  {id: 'meta', start: 26.32, end: 29.88, from: {pos: [8, 9, -8], look: [0, 3, -31], fov: 48}, to: {pos: [5, 7, -12], look: [0, 3, -31], fov: 48}, ease: 'out', title: 'FALTA POUCO', sub: 'PROS 10 MIL!'},
  {id: 'prefeito', start: 29.88, end: 33.1, from: MAY, to: MAY2, ease: 'out', title: 'PREFEITO DO', sub: 'PRÓXIMO EPISÓDIO'},
  {id: 'g_site', start: 33.1, end: 36.2, from: MAY, to: MAY, ease: 'linear', title: 'NO SITE:', sub: 'COLOCA SEU @'},
  {id: 'personaliza', start: 36.2, end: 38.4, from: {pos: [-2.6, 2.0, -2.2], look: [-6.5, 1.25, -5.5], fov: 40}, to: {pos: [-3.3, 1.8, -2.8], look: [-6.5, 1.25, -5.5], fov: 40}, ease: 'out', title: 'PERSONALIZA', sub: 'SEU PERSONAGEM'},
  {id: 'bio', start: 38.4, end: 39.48, from: MAY, to: MAY2, ease: 'out', title: 'LINK NA BIO'},
  {id: 'enquete', start: 39.48, end: 45.28, from: {pos: [70, 60, 110], look: [0, 0, 0], fov: 46}, to: {pos: [30, 55, 120], look: [0, 0, 0], fov: 46}, ease: 'linear', title: '11ª VOTAÇÃO', sub: 'COMENTA A OU B'},
  {id: 'senao', start: 45.28, end: LOOP_AT, from: {pos: [0.4, 1.75, 4.8], look: [0, 1.5, 0.4], fov: 34}, to: {pos: [0.2, 1.65, 3.8], look: [0, 1.5, 0.4], fov: 34}, ease: 'out', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: OPEN, to: OPEN, ease: 'linear', title: 'A CIDADE', sub: 'NO ESCURO...'},
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
  const sh = t >= U.BOLT && t < U.BOLT + 0.5 ? Math.pow(1 - (t - U.BOLT) / 0.5, 2) : 0;
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
