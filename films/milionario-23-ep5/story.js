// story.js — EP 5 timeline, built from the voice durations (voices/dur.json).
export const q = t => Math.floor(t * 12 + 1e-6) / 12;    // characters step on twos
export const EP = { n: 5, title: 'O DONO', next: 'EP 6', nextTitle: 'O DESPEJO' };

export function build(D) {
  const d = id => D[id] ?? 2;
  const VO = {}, T = {};
  let t = 0;
  const say = (id, gap = .3) => { VO[id] = +(t + gap).toFixed(3); t = VO[id] + d(id); return VO[id]; };
  const at = (k, v) => (T[k] = +v.toFixed(3));
  // the reveal: the chair turns on his name
  say('n1', .3); at('spin', .8);                      // the chair turns from the first second (the clip's turn starts .8 s in)
  at('cuArl', t + .25); t = T.cuArl; say('a1', .15); at('flip', VO.a1 + .1);
  at('cuCaio', t + .2); t = T.cuCaio; say('c1', .1);
  // back through the phone to the counter at 21
  at('phone', t + .3); t = T.phone; say('n2', .25); at('rush', VO.n2 + d('n2') * .32); at('sw1', T.rush + .55);
  at('keys', T.sw1 + .4); at('sixty', VO.n2 + d('n2') * .72);
  at('contract', t + .35); t = T.contract; say('n3', .2); at('lens', VO.n3 + d('n3') * .55);
  say('a2', .35); at('mark', VO.a2 + d('a2') * .4);
  // back to the office: the wall says it
  at('sw2', t + .35); t = T.sw2; at('wall', T.sw2); say('n4', .45); at('card', VO.n4 + d('n4') * .55);
  at('cuYou', t + .3); t = T.cuYou; say('y1', .25);
  at('follow', t + .35); t = T.follow; say('n5', .2); at('click', VO.n5 + 2.0);   // on "segue"
  // the reversal
  at('boletos', t + .35); t = T.boletos; say('n6', .2);
  at('pay', t + .35); t = T.pay; say('y2', .5); at('slap', VO.y2 + d('y2') * .7);
  at('dead', t + .25);                                 // dead air: a slow push-in, the music cut
  at('cuArl2', T.dead + .8); t = T.cuArl2; say('a3', .3); at('coin', VO.a3 + d('a3') + .05);
  at('morning', t + .6); t = T.morning; say('n7', .45);
  at('letter', t + .2); t = T.letter; say('c2', .5);
  at('end', t + .6); t = T.end; say('n8', .55);
  const DUR = +(t + 2.2).toFixed(3);

  const SHOTS = [
    [0, T.cuArl, 'reveal', 'office'], [T.cuArl, T.cuCaio, 'cuArl', 'office'], [T.cuCaio, T.phone, 'cuCaio', 'office'],
    [T.phone, T.sw1, 'phone', 'office'], [T.sw1, T.contract, 'deal', 'l21'], [T.contract, T.sw2, 'contract', 'l21'],
    [T.sw2, T.cuYou, 'wall', 'office'], [T.cuYou, T.follow, 'cuYou', 'office'], [T.follow, T.boletos, 'follow', 'office'],
    [T.boletos, T.pay, 'boletos', 'office'], [T.pay, T.cuArl2, 'pay', 'office'], [T.cuArl2, T.morning, 'cuArl2', 'office'],
    [T.morning, T.letter, 'morning', 'street'], [T.letter, T.end, 'letter', 'street'], [T.end, DUR, 'end', 'end'],
  ];
  const WIPES = [[T.sw1, .45], [T.sw2, .45]];
  const TAGS = [[T.sw1 + .2, T.contract - .05, '21 ANOS', 'O CONTRATO', '#1b1422', '#ff8a7a']];
  const CUES = [
    { id: 'A', t0: 0, t1: T.phone }, { id: 'B', t0: T.phone, t1: T.follow }, { id: 'B2', t0: T.follow, t1: T.dead },
    { id: 'E', t0: T.cuArl2, t1: T.end }, { id: 'F', t0: T.end, t1: DUR },
  ];
  return { VO, T, DUR, SHOTS, WIPES, TAGS, CUES };
}
