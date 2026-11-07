// One timeline: voice lines (timing.js, generated from the takes) + named moments as words inside a line.
import { VO, CAPS, DUR } from './timing.js';
export { VO, CAPS, DUR };
const byId = Object.fromEntries(VO.map(v => [v.id, v]));
const nrm = w => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
// at('v1', 'tampa') -> absolute time of that word; at('v1', 0.5) -> line start + 0.5 s
export function at(id, x = 0) {
  const v = byId[id]; if (!v) return 1e9;
  if (typeof x === 'number') return v.t + x;
  const w = v.words.find(w => w.n === nrm(x)); return v.t + (w ? w.t0 : 0);
}
export const end = id => byId[id].t + byId[id].d;
export const K = { eyes: 'acordasse' };
