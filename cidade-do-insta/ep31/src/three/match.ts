/** ep. 18 match script: Seleção da Cidade do Insta x Santos (local stadium coords, world = local + [60, 0, 30]) */
export const SC: [number, number] = [60, 30];
export const PITCH_Y = 0.6;
export const M = {KICK: 11.26, G1: 13.9, G2: 16.46, G3: 19.14, PARTY: 19.72, RESET: 21.68, MAYOR: 46.6, MG: 47.8};

type K = [number, number, number, number]; // t, x, z, y
const KEYS: K[] = [
  [0, 0, 0, 0.3], [M.KICK, 0, 0, 0.3],
  [12.2, 2.5, 1.0, 0.3], [13.0, 4.6, -0.8, 0.3], [13.45, 5.4, -0.3, 0.35], [M.G1, 7.6, 0.4, 1.0], [14.3, 7.6, 0.4, 0.3],
  [14.31, 0, 0, 0.3], [14.9, -0.6, 0.6, 0.3], [15.5, -2.4, 1.3, 0.3], [15.95, -4.4, -0.4, 0.3], [16.15, -5.3, 0.2, 0.35], [M.G2, -7.6, -0.6, 1.2], [16.9, -7.6, -0.6, 0.3],
  [16.91, 0, 0, 0.3], [17.5, -1.4, -1.6, 0.3], [18.2, -3.6, 1.0, 0.3], [18.75, -5.4, 0.3, 0.35], [M.G3, -7.6, 0.8, 0.95], [M.RESET, -7.6, 0.8, 0.3],
  [M.RESET + 0.01, 0, 0, 0.3], [M.MAYOR + 0.3, -2.0, 0, 0.3], [M.MG, -7.6, 0.5, 1.1], [M.MG + 0.8, -7.6, 0.5, 0.3],
];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** ball position (world) */
export function ballAt(t: number): [number, number, number] {
  let a = KEYS[0], b = KEYS[KEYS.length - 1];
  for (let i = 0; i < KEYS.length - 1; i++) if (t >= KEYS[i][0] && t < KEYS[i + 1][0]) { a = KEYS[i]; b = KEYS[i + 1]; break; }
  if (t >= KEYS[KEYS.length - 1][0]) a = b;
  const k = b[0] > a[0] ? Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]))) : 1;
  const shot = b[3] > 0.6 ? Math.sin(k * Math.PI) * 0.6 : 0;
  return [SC[0] + lerp(a[1], b[1], k), PITCH_Y + lerp(a[3], b[3], k) + shot, SC[1] + lerp(a[2], b[2], k)];
}
/** net bulge for a goal scored at tg */
export const bulgeAt = (t: number, tg: number) => (t > tg && t < tg + 1.5 ? Math.exp(-(t - tg) * 4) * Math.abs(Math.cos((t - tg) * 10)) : 0);
/** score at time t: [cidade, santos] */
export const scoreAt = (t: number): [number, number] => [(t >= M.G2 ? 1 : 0) + (t >= M.G3 ? 1 : 0), t >= M.G1 ? 1 : 0];
