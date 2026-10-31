// story.js — EP 7 timeline, built from the voice durations (voices/dur.json).
export const q = t => Math.floor(t * 12 + 1e-6) / 12;    // drawings step on twos
export const EP = { n: 7, title: 'O CAIXA', next: 'EP 8', nextTitle: 'O INQUILINO' };

export function build(D) {
  const d = id => D[id] ?? 2;
  const VO = {}, T = {};
  let t = 0;
  const say = (id, gap = .3) => { VO[id] = +(t + gap).toFixed(3); t = VO[id] + d(id); return VO[id]; };
  const at = (k, v) => (T[k] = +v.toFixed(3));
  // the balance: into the phone, the app counts down
  say('n1', .15); at('app', Math.min(2.15, VO.n1 + d('n1') * .5)); at('land', VO.n1 + d('n1') * .78);
  at('cuCaio', t + .2); t = T.cuCaio; say('c1', .3);
  // the blow: four machines, the bill, nine left
  at('machines', t + .25); t = T.machines; say('n2', .15); at('billShot', VO.n2 + d('n2') * .6); at('bill', T.billShot + .1);
  at('nine', t + .25); t = T.nine; say('n3', .1); at('drop', VO.n3 + .05);
  at('cuYou', t + .25); t = T.cuYou; say('y1', .3);
  at('card', t + .25); t = T.card; say('n4', .15); at('neq', VO.n4 + d('n4') * .55);
  // the idle floors (a new loop) and the save/follow call while it is open
  at('floors', t + .3); t = T.floors; say('n5', .15); at('light', VO.n5 + d('n5') * .6);
  at('saveShot', t + .2); t = T.saveShot; say('n6', .1); at('save', VO.n6 + d('n6') * .55); at('click', VO.n6 + d('n6') - .25);
  // the fix, and what is left
  at('rent', t + .3); t = T.rent; say('n7', .15); at('rented', VO.n7 + d('n7') * .22); at('split', VO.n7 + d('n7') * .62);
  at('sum', t + .25); t = T.sum; say('n8', .1); at('plus', VO.n8 + d('n8') * .62);
  // the cliffhanger: the gold pen; the camera climbs from the shop to the window above it
  at('pen', t + .3); t = T.pen; say('n9', .15); at('gold', VO.n9 + d('n9') * .72);
  at('reveal', t + .3); t = T.reveal; say('n10', .35); at('face', VO.n10 + d('n10') * .72); say('a1', .25);
  at('end', t + .7); t = T.end; say('n11', .5);
  const DUR = +(t + 2.2).toFixed(3);

  const SHOTS = [
    [0, T.app, 'phone', 'office'], [T.app, T.cuCaio, 'app', 'office'], [T.cuCaio, T.machines, 'cuCaio', 'office'],
    [T.machines, T.billShot, 'chaos', 'shop'], [T.billShot, T.nine, 'machines', 'shop'], [T.nine, T.cuYou, 'nine', 'office'], [T.cuYou, T.card, 'cuYou', 'office'],
    [T.card, T.floors, 'card', 'office'], [T.floors, T.saveShot, 'floors', 'street'], [T.saveShot, T.rent, 'saveShot', 'street'],
    [T.rent, T.sum, 'rent', 'street'], [T.sum, T.pen, 'sum', 'street'], [T.pen, T.reveal, 'pen', 'office'],
    [T.reveal, T.end, 'window', 'street'], [T.end, DUR, 'end', 'end'],
  ];
  const WIPES = [];
  const CUES = [
    { id: 'A', t0: 0, t1: T.machines }, { id: 'B', t0: T.machines, t1: T.floors }, { id: 'C', t0: T.floors, t1: T.pen },
    { id: 'E', t0: T.pen, t1: T.end }, { id: 'F', t0: T.end, t1: DUR },
  ];
  return { VO, T, DUR, SHOTS, WIPES, CUES };
}
