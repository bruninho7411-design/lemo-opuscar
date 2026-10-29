// story.js — EP 3 timeline, built from the voice durations (voices/dur.json).
export const q = t => Math.floor(t * 12 + 1e-6) / 12;    // characters and bricks step on twos
export const EP = { n: 3, title: 'A PROPOSTA', next: 'EP 4', nextTitle: 'A GUERRA' };

export function build(D) {
  const d = id => D[id] ?? 2;
  const VO = {}, T = {};
  let t = 0;
  const say = (id, gap = .3) => { VO[id] = +(t + gap).toFixed(3); t = VO[id] + d(id); return VO[id]; };
  const at = (k, v) => (T[k] = +v.toFixed(3));
  // hook: the briefcase opens
  at('open', .25); say('s1', .35); at('tilt', VO.s1 + d('s1') - 1.0);
  at('cuYou', t + .3); t = T.cuYou; say('n1', .2);
  at('cuCaio', t + .25); t = T.cuCaio; say('c1', .15);
  // the maths on the wall
  at('maths', t + .3); t = T.maths; say('n2', .3);
  say('n3', .3); at('m1', VO.n3 + .1); at('m2', VO.n3 + d('n3') * .55);
  say('n4', .35); at('m3', VO.n4 + .2); at('m4', VO.n4 + d('n4') * .6);
  at('follow', t + .45); t = T.follow; say('n5', .2); at('click', VO.n5 + 1.0);
  // the answer
  at('refuse', t + .35); t = T.refuse; say('y1', .55);
  at('suit', t + .9); t = T.suit; say('s2', .3); at('close', VO.s2 + d('s2') - .4);
  at('card', t + .3); t = T.card; say('n6', .3);
  // next morning
  at('morning', t + .55); t = T.morning; say('n7', .45);
  at('cuCaio2', t + .3); t = T.cuCaio2; say('c2', .2);
  at('end', t + .7); t = T.end; say('n8', .6);
  const DUR = +(t + 2.0).toFixed(3);

  const SHOTS = [
    [0, T.cuYou, 'brief', 'morning'], [T.cuYou, T.cuCaio, 'cuYou', 'morning'], [T.cuCaio, T.maths, 'cuCaio', 'morning'],
    [T.maths, T.follow, 'maths', 'morning'], [T.follow, T.refuse, 'follow', 'morning'], [T.refuse, T.suit, 'refuse', 'morning'],
    [T.suit, T.card, 'suit', 'morning'], [T.card, T.morning, 'card', 'morning'], [T.morning, T.cuCaio2, 'omega', 'morning'],
    [T.cuCaio2, T.end, 'cuCaio2', 'morning'], [T.end, DUR, 'end', 'morning'],
  ];
  const STAMPS = [[T.morning + .2, T.cuCaio2 - .05, 'NA MANHÃ SEGUINTE']];
  const CUES = [
    { id: 'A', t0: 0, t1: T.maths }, { id: 'B', t0: T.maths, t1: T.refuse + .1 },
    { id: 'E', t0: T.suit, t1: T.morning }, { id: 'F', t0: T.morning, t1: DUR },
  ];
  return { VO, T, DUR, SHOTS, STAMPS, CUES };
}
