export const FPS = 30;
export const TOTAL_SEC = 64.2;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 63.6;
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
export const CI = {HOOK: -9, POOF: -9, RUIM: 13.4, LEGAL: 14.9, SUPER: 17.74, TRIZ: -9, PAREDES: -9, LETREIRO: -9, PIPOCA: -9, TAPETE: -9, STAFF: -9, EXPLODE: 999};
/** ep. 23 beats */
export const SV23 = {POOF: -9, JUIZA: -9, ZOO: -9, DONO: -9, BALCAO: -9, CASQUINHA: -9, BOLAS: -9, MELT: 999};
/** ep. 24 beats */
export const HB24 = {MEDICA: -9, AMARELA: -9, OFICINA: -9, DONA: -9, PAREDES: -9, PAO: -9, CARNE: -9, QUEIJO: -9, GIGANTE: -9, DESMONTA: 999};
/** ep. 25 beats */
export const D25 = {AERO: -9, COMERCIAL: -9, PASSARELA: -9, AMARELA: -9, VERDE: -9, DECOLA: 999};
/** ep. 26 beats */
export const D26 = {POOF: -9, POLICIAL: -9, MANSAO: -9, ROXA: -9, TRUCK: -9, PARQUE: -9, CLUBE: -9, ZAP: 999};
/** ep. 27 beats */
export const D27 = {POOF: 3.0, LET: 22.55, PAREDES: 24.6, TELHADO: 24.95, ESTANTE: 25.45, LIVROS: 26.05, DONA: 27.0, ROBO: 33.3, VET: 34.95, ROSA: 36.95, STOMP: 62.65};
const INTRO: Cam = {pos: [15, 11, 212], look: [15, 3, 150], fov: 52};
const HOOKC: Cam = {pos: [-341.3, 1.75, 216.6], look: [-342, 1.3, 212], fov: 44};
export const OPEN: Cam = HOOKC;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const LIB: Cam = {pos: [-306, 9, 234], look: [-318, 2.5, 206], fov: 50};
export const SHOTS: Shot[] = [
  {id: 'hook', start: 0, end: 6.0, from: HOOKC, to: {pos: [-340.5, 2.7, 220.5], look: [-342, 2.2, 210], fov: 50}, ease: 'inOut', title: 'ELA PEDIU...', sub: 'E EU REALIZEI! ✨'},
  {id: 'intro', start: 6.0, end: 12.2, from: INTRO, to: {pos: [15, 8.5, 100], look: [15, 2, 20], fov: 54}, ease: 'linear', title: 'CIDADE DO INSTA', sub: 'EPISÓDIO 27'},
  {id: 't_ruim', start: 12.2, end: 14.1, from: {pos: [-340, 3.8, 89], look: [-340, 1.3, 78], fov: 50}, to: {pos: [-340, 3.4, 87], look: [-340, 1.3, 78], fov: 50}, ease: 'out', title: 'SÓ COMENTOU', sub: '= CASA RUIM 😬'},
  {id: 't_legal', start: 14.1, end: 15.6, from: {pos: [-331, 4.4, 90], look: [-331, 2, 78], fov: 50}, to: {pos: [-331, 4.1, 89], look: [-331, 2, 78], fov: 50}, ease: 'out', title: 'SEGUIU', sub: '= CASA LEGAL 🏠'},
  {id: 't_super', start: 15.6, end: 19.1, from: {pos: [-319, 6, 96], look: [-319, 2.6, 77], fov: 52}, to: {pos: [-321, 8, 99], look: [-322, 2.2, 77], fov: 54}, ease: 'out', title: 'COMENTOU + CURTIU', sub: '+ REPUBLICOU = DESEJO REALIZADO ✨'},
  {id: 'vota', start: 19.1, end: 21.7, from: {pos: [-300, 22, 240], look: [-318, 1, 206], fov: 50}, to: {pos: [-303, 18, 236], look: [-318, 1, 206], fov: 50}, ease: 'linear', title: 'DEU BIBLIOTECA!', sub: '📚 77% DOS VOTOS'},
  {id: 'let', start: 21.7, end: 24.5, from: {pos: [-320.2, 2.6, 221.2], look: [-322.5, 1.6, 214], fov: 46}, to: {pos: [-320.6, 2.4, 220.2], look: [-322.5, 1.6, 214], fov: 46}, ease: 'out', title: 'CONSTRUTORA', sub: 'DA CIDADE 🧱'},
  {id: 'obra', start: 24.5, end: 26.95, from: LIB, to: {pos: [-307, 11, 238], look: [-318, 3.5, 206], fov: 52}, ease: 'out', title: 'BIBLIOTECA', sub: 'EM MODO LEGO 🧱'},
  {id: 'dona', start: 26.95, end: 30.8, from: {pos: [-315.2, 2.3, 220.2], look: [-316.4, 1.7, 214.4], fov: 46}, to: {pos: [-314.5, 3.2, 222.5], look: [-316.4, 2.2, 210], fov: 50}, ease: 'inOut', title: 'DONA DA', sub: 'BIBLIOTECA 📚'},
  {id: 'robo', start: 30.8, end: 34.85, from: {pos: [-328, 1.4, 240], look: [-332, 4.5, 228], fov: 58}, to: {pos: [-327.5, 1.2, 238], look: [-332, 5.6, 228], fov: 60}, ease: 'out', title: 'ROBOZÃO', sub: 'GIGANTE 🤖'},
  {id: 'vet', start: 34.85, end: 36.85, from: {pos: [-353.5, 2.6, 232], look: [-357.6, 1.4, 224], fov: 48}, to: {pos: [-353.8, 2.4, 231], look: [-357.6, 1.4, 224], fov: 48}, ease: 'out', title: 'DONA DO', sub: 'VETERINÁRIO 🐾'},
  {id: 'rosa', start: 36.85, end: 39.0, from: {pos: [-299, 3.6, 236], look: [-305, 1.8, 224], fov: 50}, to: {pos: [-299.5, 3.3, 234.5], look: [-305, 1.8, 224], fov: 50}, ease: 'out', title: 'CASINHA', sub: 'COR DE ROSA 💗'},
  {id: 'g_loja', start: 39.0, end: 55.7, from: MAY, to: MAY, ease: 'linear', title: ''},
  {id: 'bio', start: 55.7, end: 56.45, from: MAY, to: {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36}, ease: 'out', title: 'LINK NA BIO'},
  {id: 'enquete', start: 56.45, end: 61.0, from: {pos: [60, 60, 120], look: [0, 0, 0], fov: 50}, to: {pos: [45, 52, 110], look: [0, 0, 0], fov: 50}, ease: 'linear', title: '23ª VOTAÇÃO', sub: 'O QUE A CIDADE GANHA?'},
  {id: 'senao', start: 61.0, end: LOOP_AT, from: {pos: [-329, 2.0, 242], look: [-332, 4, 228], fov: 58}, to: {pos: [-329.5, 1.6, 237], look: [-332, 3.5, 228], fov: 62}, ease: 'in', title: 'SENÃO...', titleBig: true},
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: HOOKC, to: HOOKC, ease: 'linear', title: 'ELA PEDIU...', sub: 'E EU REALIZEI! ✨'},
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
