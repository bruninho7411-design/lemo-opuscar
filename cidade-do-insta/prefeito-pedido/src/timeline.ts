export const FPS = 30;
export const TOTAL_SEC = 38.6;
export const TOTAL_FRAMES = Math.round(TOTAL_SEC * FPS);
export const LOOP_AT = 38.05;
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
export const CI = {HOOK: -9, POOF: -9, RUIM: -9, LEGAL: -9, SUPER: -9, TRIZ: -9, PAREDES: -9, LETREIRO: -9, PIPOCA: -9, TAPETE: -9, STAFF: -9, EXPLODE: 999};
/** ep. 23 beats */
export const SV23 = {POOF: -9, JUIZA: -9, ZOO: -9, DONO: -9, BALCAO: -9, CASQUINHA: -9, BOLAS: -9, MELT: 999};
/** ep. 24 beats */
export const HB24 = {MEDICA: -9, AMARELA: -9, OFICINA: -9, DONA: -9, PAREDES: -9, PAO: -9, CARNE: -9, QUEIJO: -9, GIGANTE: -9, DESMONTA: 999};
/** ep. 25 beats */
export const D25 = {AERO: -9, COMERCIAL: -9, PASSARELA: -9, AMARELA: -9, VERDE: -9, DECOLA: 999};
/** ep. 26 beats */
export const D26 = {POOF: -9, POLICIAL: -9, MANSAO: -9, ROXA: -9, TRUCK: -9, PARQUE: -9, CLUBE: -9, ZAP: 999};
/** ep. 27 beats */
export const D27 = {POOF: -9, LET: -9, PAREDES: -9, TELHADO: -9, ESTANTE: -9, LIVROS: -9, DONA: -9, ROBO: -9, VET: -9, ROSA: -9, STOMP: 999};
/** ep. 28 beats */
export const D28 = {RAINHA: -9, GUARDAS: -9, TRONO: -9, DRAGAO: -9, SPA: -9, AZUL: -9, LOIRA: -9, PRETO: -9, FOGO_IN: 999, FOGO: 999};
/** ep. 29 beats */
export const D29 = {MEDICA: -9, IRMA: -9, VOZINHA: -9, ADRIAN: -9, GATO: -9, FUTEBOL: -9, MORANGA: -9, INJECAO: 999};
/** ep. 30 beats */
export const D30 = {LETREIRO: -9, FLIPER: -9, PAREDES: -9, TELHADO: -9, MAQUINAS: -9, NEON: -9, HENRIQUE: -9, FILHA: -9, LOBO: -9, MANICURE: -9, INFLU: -9, ROCK: -9, PROF: -9, UIVO: 999};
const HOOKC: Cam = {pos: [-340.2, 2.4, 221.5], look: [-342, 2.2, 210], fov: 50};
export const OPEN: Cam = HOOKC;
export const PEDRA = OPEN;
const MAY: Cam = {pos: [0.0, 2.1, 6.6], look: [0, 1.55, 0.4], fov: 36};
const MAYC: Cam = {pos: [0.0, 1.95, 4.9], look: [0, 1.6, 0.4], fov: 36};
const MAYS: Cam = {pos: [2.6, 2.2, 5.8], look: [0, 1.5, 0.4], fov: 38};
const M = (id: string, s0: number, s1: number, a: Cam, b: Cam, title: string, sub?: string): Shot => ({id, start: s0, end: s1, from: a, to: b, ease: 'inOut', title, sub});
export const SHOTS: Shot[] = [
  M('hook', 0, 2.5, HOOKC, {pos: [-340.6, 2.6, 219.5], look: [-342, 2.2, 210], fov: 50}, 'QUER O SEU PEDIDO', 'REALIZADO? ✨'),
  M('m_rainha', 2.5, 4.08, {pos: [-342, 6.7, 215.5], look: [-342, 5.9, 207], fov: 50}, {pos: [-342, 6.6, 214.2], look: [-342, 5.9, 207], fov: 50}, 'RAINHA 👑', 'PEDIDO DE SEGUIDORA'),
  M('m_dragao', 4.08, 4.84, {pos: [-331, 7.5, 223], look: [-338, 10, 211], fov: 56}, {pos: [-331.5, 7.6, 222], look: [-339, 10, 210], fov: 56}, 'DRAGÃO 🐉', 'PEDIDO DE SEGUIDOR'),
  M('m_medica', 4.84, 5.42, {pos: [-343, 2.8, 194], look: [-344, 2.0, 183], fov: 50}, {pos: [-343, 2.7, 193.4], look: [-344, 2.0, 183], fov: 50}, 'MÉDICA 🩺', 'PEDIDO DE SEGUIDORA'),
  M('m_tudo', 5.42, 7.2, {pos: [-300, 24, 250], look: [-322, 0, 205], fov: 55}, {pos: [-305, 18, 240], look: [-322, 0, 205], fov: 55}, 'TUDO ISSO', 'FOI PEDIDO DE SEGUIDOR! 😱'),
  M('prefeito', 7.2, 10.8, MAY, MAYC, 'PREFEITO', 'CAPIVALDO 🎩'),
  {id: 'g_passos', start: 10.8, end: 23.1, from: MAY, to: MAY, ease: 'linear', title: ''},
  M('regras', 23.1, 26.55, MAYS, MAYC, 'CADA PEDIDO', 'É LIDO ANTES ✅'),
  M('dias', 26.55, 31.5, MAYC, MAY, 'EM ATÉ 14 DIAS', 'NUM VÍDEO AQUI! 🎬'),
  M('vagas', 31.5, 33.2, MAYC, MAYS, 'SÓ 5 VAGAS', 'POR SEMANA! ⏳'),
  {id: 'bio', start: 33.2, end: 34.1, from: MAY, to: {pos: [0.0, 1.95, 5.2], look: [0, 1.6, 0.4], fov: 36}, ease: 'out', title: 'LINK NA BIO'},
  M('menor', 34.1, 37.0, MAYS, MAY, 'MENOR DE IDADE?', 'PEDE PRA UM ADULTO 🤝'),
  M('tchau', 37.0, LOOP_AT, MAY, MAYC, 'TE VEJO', 'NA CIDADE! 👋'),
  {id: 'loop', start: LOOP_AT, end: TOTAL_SEC, from: HOOKC, to: HOOKC, ease: 'linear', title: 'QUER O SEU PEDIDO', sub: 'REALIZADO? ✨'},
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
