// story.js — EP 6 timeline, built from the voice durations (voices/dur.json).
export const q = t => Math.floor(t * 12 + 1e-6) / 12;    // drawings step on twos
export const EP = { n: 6, title: 'O DESPEJO', next: 'EP 7', nextTitle: 'O CAIXA' };

export function build(D) {
  const d = id => D[id] ?? 2;
  const VO = {}, T = {};
  let t = 0;
  const say = (id, gap = .3) => { VO[id] = +(t + gap).toFixed(3); t = VO[id] + d(id); return VO[id]; };
  const at = (k, v) => (T[k] = +v.toFixed(3));
  // the letter: Caio panics, you don't
  at('stamp', .25); say('c1', .35);
  at('cuYou', t + .2); t = T.cuYou; say('y1', .2); at('two', VO.y1 + d('y1') * .78);
  // mistake one: 90 days, not 30
  at('err1', t + .3); t = T.err1; say('n1', .15); at('x30', VO.n1 + d('n1') * .62);
  // mistake two is worth 900 mil
  at('err2', t + .25); t = T.err2; say('n2', .1); at('cash', VO.n2 + d('n2') * .5);
  at('pref', t + .3); t = T.pref; say('n3', .15); at('block', VO.n3 + d('n3') * .42); at('same', VO.n3 + d('n3') * .85);
  at('none', t + .25); t = T.none; say('n4', .1);
  at('cuCaio', t + .25); t = T.cuCaio; say('c2', .2);
  // the condition (a new loop) and the save/follow call while it is open
  at('reg', t + .3); t = T.reg; say('n5', .15); at('box', VO.n5 + d('n5') * .45);
  say('n6', .3); at('save', VO.n6 + d('n6') * .55); at('click', VO.n6 + d('n6') - .25);
  // the answer
  at('cuYou2', t + .3); t = T.cuYou2; say('y2', .25);
  at('stamped', t + .15); t = T.stamped + 1.1;
  at('deposit', t); say('n7', .25); at('slip', VO.n7 + d('n7') * .78);
  at('cuArl', t + .3); t = T.cuArl; say('a1', .2);
  at('owner', t + .35); t = T.owner; say('n8', .3); at('zero', VO.n8 + d('n8') * .8);
  // the cliffhanger
  at('cuArl2', t + .45); t = T.cuArl2; say('a2', .3);
  at('end', t + .55); t = T.end; say('n9', .5);
  const DUR = +(t + 2.2).toFixed(3);

  const SHOTS = [
    [0, T.cuYou, 'letter', 'street'], [T.cuYou, T.err1, 'cuYou', 'street'], [T.err1, T.err2, 'err1', 'street'],
    [T.err2, T.pref, 'err2', 'street'], [T.pref, T.none, 'pref', 'street'], [T.none, T.cuCaio, 'none', 'street'],
    [T.cuCaio, T.reg, 'cuCaio', 'shop'], [T.reg, T.cuYou2, 'reg', 'shop'], [T.cuYou2, T.stamped, 'cuYou2', 'shop'],
    [T.stamped, T.deposit, 'stamped', 'shop'], [T.deposit, T.cuArl, 'deposit', 'court'], [T.cuArl, T.owner, 'cuArl', 'office'],
    [T.owner, T.cuArl2, 'owner', 'street'], [T.cuArl2, T.end, 'cuArl2', 'office'], [T.end, DUR, 'end', 'end'],
  ];
  const WIPES = [[T.deposit, .35], [T.owner, .4]];
  const CUES = [
    { id: 'A', t0: 0, t1: T.err1 }, { id: 'B', t0: T.err1, t1: T.cuYou2 }, { id: 'C', t0: T.cuYou2, t1: T.cuArl2 },
    { id: 'E', t0: T.cuArl2, t1: T.end }, { id: 'F', t0: T.end, t1: DUR },
  ];
  return { VO, T, DUR, SHOTS, WIPES, CUES };
}
