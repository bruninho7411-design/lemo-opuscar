// story.js — EP 4 timeline, built from the voice durations (voices/dur.json).
export const q = t => Math.floor(t * 12 + 1e-6) / 12;    // characters and bricks step on twos
export const EP = { n: 4, title: 'A GUERRA', next: 'EP 5', nextTitle: 'O DONO' };

export function build(D) {
  const d = id => D[id] ?? 2;
  const VO = {}, T = {};
  let t = 0;
  const say = (id, gap = .3) => { VO[id] = +(t + gap).toFixed(3); t = VO[id] + d(id); return VO[id]; };
  const at = (k, v) => (T[k] = +v.toFixed(3));
  // hook: your shop empty, theirs with a queue
  say('n1', .35); at('minus', VO.n1 + d('n1') * .6);
  at('banner', t + .25); t = T.banner; say('n2', .2);
  at('cuCaio', t + .25); t = T.cuCaio; say('c1', .15);
  // price war: two stacks of money
  at('stacks', t + .3); t = T.stacks; say('n3', .3); at('grow', VO.n3 + d('n3') * .45);
  at('cuYou', t + .3); t = T.cuYou; say('y1', .3);
  // change the game
  at('plan', t + .45); t = T.plan; say('n4', .3); at('p1', VO.n4 + d('n4') * .3); at('p2', VO.n4 + d('n4') * .58); at('p3', VO.n4 + d('n4') * .8);
  say('n5', .3); at('p4', VO.n5 + d('n5') * .6);
  at('bike', t + .35); t = T.bike; say('c2', .4);
  at('phone', t + .4); t = T.phone; say('n6', .3); at('gain', VO.n6 + d('n6') * .62);
  at('follow', t + .4); t = T.follow; say('n7', .2); at('click', VO.n7 + 1.0);
  // the war is won; the owner
  at('closed', t + .4); t = T.closed; say('n8', .45); at('fechado', VO.n8 + d('n8') * .7);
  at('card', t + .35); t = T.card; say('n9', .25);
  at('silh', t + .55); t = T.silh; say('n10', .9);
  at('end', t + .9); t = T.end; say('n11', .6);
  const DUR = +(t + 2.0).toFixed(3);

  const SHOTS = [
    [0, T.banner, 'duel', 'morning'], [T.banner, T.cuCaio, 'banner', 'morning'], [T.cuCaio, T.stacks, 'cuCaio', 'morning'],
    [T.stacks, T.cuYou, 'stacks', 'morning'], [T.cuYou, T.plan, 'cuYou', 'morning'], [T.plan, T.bike, 'plan', 'morning'],
    [T.bike, T.phone, 'bike', 'morning'], [T.phone, T.follow, 'phone', 'morning'], [T.follow, T.closed, 'follow', 'morning'],
    [T.closed, T.card, 'closed', 'morning'], [T.card, T.silh, 'card', 'morning'], [T.silh, T.end, 'silh', 'night'], [T.end, DUR, 'end', 'night'],
  ];
  const STAMPS = [[.4, T.banner - .05, '1 SEMANA DEPOIS'], [T.phone + .2, T.follow - .05, '1 MÊS DEPOIS']];
  const CUES = [
    { id: 'A', t0: 0, t1: T.plan }, { id: 'B', t0: T.plan, t1: T.closed },
    { id: 'E', t0: T.closed, t1: T.silh + .2 }, { id: 'F', t0: T.end, t1: DUR },
  ];
  return { VO, T, DUR, SHOTS, STAMPS, CUES };
}
