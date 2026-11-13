import * as THREE from 'three';

/** amusement park block (1,1) */
export const PARQUE: [number, number] = [30, 30];
const L = (x: number, y: number, z: number) => new THREE.Vector3(PARQUE[0] + x, 0.46 + y, PARQUE[1] + z);
// closed coaster loop in the south half of the block (local coords, front gate at -z)
export const TRACK = new THREE.CatmullRomCurve3([
  L(-8.6, 1.0, 9.2), L(-9.0, 1.4, 4.0), L(-7.6, 5.5, 1.6), L(-5.4, 9.6, 0.8), L(-3.6, 9.8, 0.9),
  L(-1.4, 4.0, 1.6), L(0.4, 1.0, 2.6), L(2.6, 3.8, 2.6), L(5.0, 5.0, 2.4), L(7.8, 2.6, 3.2),
  L(9.0, 2.0, 6.4), L(7.4, 3.2, 9.0), L(3.8, 2.6, 9.6), L(0.0, 1.4, 9.6), L(-4.6, 1.0, 9.8),
], true, 'catmullrom', 0.5);
// parameter of the top of the lift hill
export const U_TOP = (() => {
  let best = 0, by = -1;
  for (let i = 0; i <= 400; i++) { const u = i / 400; const y = TRACK.getPointAt(u).y; if (y > by) { by = y; best = u; } }
  return best;
})();
const wrap = (u: number) => ((u % 1) + 1) % 1;
/** train position along the track (0..1) for a given time; the hook drop starts at t=0 */
export function trainU(rt: number, cruise: boolean) {
  if (!cruise) {
    // hook: crawl over the crest, then drop
    if (rt < 0.55) return wrap(U_TOP - 0.03 + rt * 0.03);
    const k = rt - 0.55;
    return wrap(U_TOP - 0.0135 + k * 0.05 + k * k * 0.16);
  }
  return wrap(U_TOP + rt * 0.085);
}
export function povCam(u: number) {
  const len = TRACK.getLength();
  const p = TRACK.getPointAt(wrap(u - 0.044 - 4.5 / len));
  const a = TRACK.getPointAt(wrap(u + 7 / len));
  return {pos: [p.x, p.y + 3.4, p.z] as [number, number, number], look: [a.x, a.y + 0.4, a.z] as [number, number, number]};
}
