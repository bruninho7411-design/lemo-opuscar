export const FPS = 30;
export const TOTAL_SEC = 56.9;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 56.3;
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

export const U = {BOLT: -9, FUND: -9, HALL: -9, TORRES: -9, CHAMINE: -9, TURB: -9, PAINEIS: -9, CREW: -9, LEVER: 999, LIGHT: 999, OFF: 999};
export const E = {HOOK: -9, BUS_END: -9, PREF: -9, BASE: -9, PAREDES: -9, TELHADO: -9, SINO: -9, QUADRA: -9, PARQUINHO: -9, KIDS: -9, PROF: -9};
export const PQ = {HOOK: -9, BASE: -9, PORTAO: -9, RODA: -9, CARROSSEL: -9, MONTANHA: -9, RIDE: -9, STAFF: -9, CUT: -9};
export const B = {HOOK: -9, BASE: -9, PAREDES: -9, GARAGEM: -9, TORRE: -9, CAMINHAO: -9, CREW: -9, REIGNITE: 999};
export const ST = {HOOK: -9, BASE: -9, GRAMADO: -9, TRAVES: -9, ARQ: -9, REFL: -9, TORCIDA: -9, TIME: 999, OWN: 999};
/** ep. 19 beach beats */
export const PR = {HOOK: -9, AREIA: -9, QUIOSQUE: -9, TORRE: -9, GUARDASOL: -9, SV: -9, TSUNAMI: 999};
/** ep. 20 zoo beats */
export const ZO = {HOOK: -9, CERCA: -9, LEAO: -9, GIRAFA: -9, ELEFANTE: -9, MACACOS: -9, TRAT: -9, FUGA: 999};
/** ep. 20 mansions / new houses */
export const BA = {LARA: -9, LET: -9, CASAS: -9, SHACK: -9};
/** ep. 21 water park beats */
export const PK = {BASE: -9, PISCINA: -9, TOBOGA: -9, ONDAS: -9, BALDE: -9, SV: -9, VIRA: 999};
/** ep. 22 beats */
export const CI = {HOOK: -9, POOF: -9, RUIM: 12.84, LEGAL: 14.3, SUPER: 17.16, TRIZ: -9, PAREDES: -9, LETREIRO: -9, PIPOCA: -9, TAPETE: -9, STAFF: -9, EXPLODE: 999};
/** ep. 23 beats */
export const SV23 = {POOF: -9, JUIZA: -9, ZOO: -9, DONO: -9, BALCAO: -9, CASQUINHA: -9, BOLAS: -9, MELT: 999};
/** ep. 24 beats */
export const HB24 = {MEDICA: -9, AMARELA: -9, OFICINA: -9, DONA: -9, PAREDES: -9, PAO: -9, CARNE: -9, QUEIJO: -9, GIGANTE: -9, DESMONTA: 999};
/** ep. 25 beats */
export const D25 = {AERO: -9, COMERCIAL: -9, PASSARELA: -9, AMARELA: -9, VERDE: -9, DECOLA: 999};
/** ep. 26 beats */
export const D26 = {POOF: 4.4, POLICIAL: 20.02, MANSAO: 21.18, ROXA: 22.76, TRUCK: 23.7, PARQUE: 26.12, CLUBE: 27.6, ZAP: 54.6};
const INTRO: Cam = {pos: [15, 11, 212], look: [15, 3, 150], fov: 52};
const HOOKC: Cam = {pos: [-329.2, 1.75, 164.8], look: [-330, 1.3, 160], fov: 44};
export const OPEN: Cam = HOOKC;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0, end: 6.42, from: HOOKC, to: {pos: [-329.4, 1.9, 166], look: [-330, 1.6, 159], fov: 46}, ease: 'linear', title: 'VOCÊS PEDIRAM...', sub: 'EU REALIZEI! ✨'},
  {id: 'intro', start: 6.42, end: 10.82, from: INTRO, to: {pos: [15, 8.5, 110], look: [15, 2, 30], fov: 54}, ease: 'linear', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 26'},
  {id: 't_ruim', start: 10.82, end: 13.62, from: {pos: [-340, 3.8, 89], look: [-340, 1.3, 78], fov: 50}, to: {pos: [-340, 3.4, 87], look: [-340, 1.3, 78], fov: 50}, ease: 'out', title: 'SÓ COMENTOU', sub: '= CASA RUIM 😬'},
  {id: 't_legal', start: 13.62, end: 15.16, from: {pos: [-331, 4.4, 90], look: [-331, 2, 78], fov: 50}, to: {pos: [-331, 4.1, 89], look: [-331, 2, 78], fov: 50}, ease: 'out', title: 'SEGUIU', sub: '= CASA LEGAL 🏠'},
  {id: 't_super', start: 15.16, end: 18.4, from: {pos: [-319, 6, 96], look: [-319, 2.6, 77], fov: 52}, to: {pos: [-321, 8, 99], look: [-322, 2.2, 77], fov: 54}, ease: 'out', title: 'COMENTOU + CURTIU', sub: '+ REPUBLICOU = DESEJO REALIZADO ✨'},
  {id: 'policial', start: 18.4, end: 21.1, from: {pos: [-336.2, 1.9, 169.8], look: [-337, 1.25, 165], fov: 44}, to: {pos: [-336.4, 1.8, 169.2], look: [-337, 1.25, 165], fov: 44}, ease: 'out', title: 'POLICIAL', sub: 'DA CIDADE 🚓'},
  {id: 'mansao', start: 21.1, end: 22.64, from: {pos: [-311, 5, 173], look: [-316, 2.2, 159], fov: 52}, to: {pos: [-311.5, 4.6, 171.5], look: [-316, 2.2, 159], fov: 52}, ease: 'out', title: 'MANSÃO', sub: 'BRANCA 🤍'},
  {id: 'roxa', start: 22.64, end: 25.44, from: {pos: [-339.5, 3.6, 171], look: [-343, 1.7, 160], fov: 52}, to: {pos: [-340, 3.3, 169.5], look: [-343, 1.7, 160], fov: 52}, ease: 'out', title: 'CASA ROXA', sub: '+ CAMINHONETE 🛻'},
  {id: 'parque', start: 25.44, end: 27.04, from: {pos: [17.6, 2.5, 15.8], look: [21, 1.6, 21.5], fov: 46}, to: {pos: [17.9, 2.4, 16.4], look: [21, 1.6, 21.5], fov: 46}, ease: 'out', title: 'DONA DO', sub: 'PARQUE 🎡'},
  {id: 'clube', start: 27.04, end: 28.58, from: {pos: [47.6, 2.5, 15.9], look: [51, 1.6, 21.6], fov: 46}, to: {pos: [47.9, 2.4, 16.5], look: [51, 1.6, 21.6], fov: 46}, ease: 'out', title: 'DONO DO', sub: 'CLUBE ⚽'},
  {id: 'g_loja', start: 28.58, end: 44.16, from: MAY, to: MAY, ease: 'linear', title: ''},
  {id: 'bio', start: 44.16, end: 45.4, from: MAY, to: {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36}, ease: 'out', title: 'LINK NA BIO'},
  {id: 'enquete', start: 45.4, end: 51.84, from: {pos: [60, 60, 120], look: [0, 0, 0], fov: 50}, to: {pos: [45, 52, 110], look: [0, 0, 0], fov: 50}, ease: 'linear', title: '22ª VOTAÇÃO', sub: 'EMPATADA! 50 x 50'},
  {id: 'senao', start: 51.84, end: LOOP_AT, from: {pos: [-329.4, 1.9, 165.5], look: [-330, 1.5, 160], fov: 46}, to: {pos: [-329.7, 1.7, 163.4], look: [-330, 1.5, 160], fov: 42}, ease: 'linear', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: HOOKC, to: HOOKC, ease: 'linear', title: 'VOCÊS PEDIRAM...', sub: 'EU REALIZEI! ✨'},
];

import {povCam, trainU, TRACK} from './three/coaster';
import {ballAt} from './three/match';
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
  if (s.id.startsWith('m_off')) {
    const bp = ballAt(t);
    cam = {...cam, look: [cam.look[0] * 0.35 + bp[0] * 0.65, bp[1] + 0.4, cam.look[2] * 0.35 + bp[2] * 0.65]};
  }
  if (s.id === 'fila_off') {
    const tp = TRACK.getPointAt(trainU(t - PQ.RIDE, true));
    cam = {...cam, look: [tp.x, tp.y + 0.8, tp.z]};
  }
  // camera shake when the rock hits the water
  const sh = t >= 54.6 && t < LOOP_AT ? 0.15 : t >= 4.3 && t < 4.8 ? 0.12 : 0; // zap / poof
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
