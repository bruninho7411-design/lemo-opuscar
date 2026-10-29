// story.js — the timeline, built from the voice durations (voices/dur.json): every line follows the previous one plus a gap,
// and shots, snaps, gains and music sections hang off those times.
export const q = t => Math.floor(t * 12 + 1e-6) / 12;    // characters and bricks step on twos

export function build(D) {
  const d = id => D[id] ?? 2;
  const VO = {}, T = {};
  let t = 0;
  const say = (id, gap = .3) => { VO[id] = +(t + gap).toFixed(3); t = VO[id] + d(id); return VO[id]; };
  const at = (k, v) => (T[k] = +v.toFixed(3));
  // hook: the post
  say('n1', .35); say('n2', .3); at('views', VO.n2 - .2);
  at('rew', t + .55); t = T.rew; say('n3', .2);
  // recap and the question (night, 12 hours earlier)
  at('recap', t + .25); t = T.recap; say('n4', .3);
  at('sofa', t + .35); t = T.sofa; say('c1', .35);
  at('cuYou', t + .3); t = T.cuYou; say('n5', .25);
  // to the laundromat
  at('walk', t + .45); t = T.walk; say('n6', .35);
  at('inside', t + .3); t = T.inside; say('n7', .4);
  at('tile1', VO.n7 + d('n7') * .16); at('tile2', VO.n7 + d('n7') * .6); at('tile3', VO.n7 + d('n7') * .86);
  say('n8', .35); at('gain', VO.n8 + d('n8') * .62); at('total', VO.n8 + d('n8') + .15);
  at('cuCaio', t + .9); t = T.cuCaio; say('c2', .25);
  at('follow', t + .35); t = T.follow; say('n9', .2); at('click', VO.n9 + .85);
  at('promise', t + .35); t = T.promise; say('y1', .25); at('shake', VO.y1 + d('y1') - .5); say('c3', .3);
  at('orbit', t + .15); say('n10', .75);
  // morning: the consequence
  at('sil', t + .3); at('phone2', T.sil + .6); t = T.phone2; say('n11', .35);
  at('street', t + .45); t = T.street; say('n12', .3); at('carStop', VO.n12 + d('n12') * .7);
  at('cuSuit', t + .35); t = T.cuSuit; say('s1', .45);
  at('end', t + .55); t = T.end; say('n13', .6);
  const DUR = +(t + 2.0).toFixed(3);

  const SHOTS = [
    [0, T.rew, 'hook', 'morning'], [T.rew, T.recap, 'rewind', 'morning'], [T.recap, T.sofa, 'recap', 'night'],
    [T.sofa, T.cuYou, 'sofa', 'night'], [T.cuYou, T.walk, 'cuYou', 'night'], [T.walk, T.inside, 'walk', 'night'],
    [T.inside, T.cuCaio, 'inside', 'night'], [T.cuCaio, T.follow, 'cuCaio', 'night'], [T.follow, T.promise, 'follow', 'night'],
    [T.promise, T.sil, 'promise', 'night'], [T.sil, T.street, 'phone2', 'morning'], [T.street, T.cuSuit, 'street', 'morning'],
    [T.cuSuit, T.end, 'cuSuit', 'morning'], [T.end, DUR, 'end', 'morning'],
  ];
  // time stamps (toy tiles, top-left): [start, end, text]
  const STAMPS = [[T.recap + .2, T.sofa - .05, '12 HORAS ANTES'], [T.walk + .2, T.inside + 1.2, '23:00'], [T.phone2 + .2, T.street - .05, '07:00'], [T.street + .2, T.cuSuit - .05, '08:00']];
  const CUES = [
    { id: 'A', t0: 0, t1: T.rew }, { id: 'rew', t0: T.rew, t1: T.recap }, { id: 'B', t0: T.recap, t1: T.walk },
    { id: 'C', t0: T.walk, t1: T.cuCaio }, { id: 'D', t0: T.cuCaio, t1: T.sil }, { id: 'E', t0: T.phone2, t1: T.cuSuit }, { id: 'end', t0: T.end, t1: DUR },
  ];
  return { VO, T, DUR, SHOTS, STAMPS, CUES };
}
