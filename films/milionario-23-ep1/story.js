// story.js — the timeline, built from the voice durations (voices/dur.json): every line starts after the previous one plus a gap,
// and every shot, wipe, tag, gain and music section hangs off those times. Picture, subtitles, foley and score all read it.
export const ANIM_FPS = 12;
export const q = t => Math.floor(t * ANIM_FPS + 1e-6) / ANIM_FPS;

export function build(D) {
  const d = id => D[id] ?? 2;
  const VO = {}, T = {};
  let t = 0;
  const say = (id, gap = .3) => { VO[id] = +(t + gap).toFixed(3); t = VO[id] + d(id); return VO[id]; };
  const at = (k, v) => (T[k] = +v.toFixed(3));
  // —— 23: cold open on the sofa ——
  say('n1', .35); say('n2', .3);
  at('cuCaio', t + .25); t = T.cuCaio; say('c1', .2);
  at('cuYou', t + .35); t = T.cuYou; say('y1', .45);
  at('phone', t + .3); t = T.phone; say('n3', .25);
  at('rush', t + .05); at('sw1', t + .45); t = T.sw1;
  // —— 18: laundromat ——
  say('n4', .45); say('n5', .3); at('gain18', VO.n5 + .15);
  at('coins', t + .2); t = T.coins; say('n6', .1);
  at('sil', t + .15); t = T.sil + .85; say('n7', 0);
  at('sw2', t + .35); t = T.sw2;
  // —— 19: split ——
  say('n8', .45); say('n9', .3);
  at('jar', VO.n9 + .6);
  at('follow', t + .45); t = T.follow; say('n10', .25); at('click', VO.n10 + .9);
  at('sw3', t + .35); t = T.sw3;
  // —— 21: the deal ——
  say('n11', .45); at('keys', VO.n11 + d('n11') - 1.3); say('n12', .45); at('shake', VO.n12 + .1);
  at('sleep', t + .55); t = T.sleep; say('n13', .2); at('gain21', VO.n13 + 1.0);
  at('mg1', t + .65); t = T.mg1; say('n14', .15);
  at('mg2', t + .5); t = T.mg2; say('n15', .1);
  at('sw4', t + .75); t = T.sw4;
  // —— 23: back home ——
  say('n16', .45); at('million', VO.n16 + d('n16') * .38);
  at('buzz', t + .8); at('eyes', T.buzz + 1.2); at('cuYou2', T.buzz + 2.1); t = T.buzz + 2.8;
  at('cuCaio2', t - .15); say('c2', 0);
  at('end', t + 1.2); t = T.end; say('n17', .55);
  const DUR = +(t + 2.2).toFixed(3);

  // shots: [start, end, name, world]
  const SHOTS = [
    [0, T.cuCaio, 'two', 'sofa'], [T.cuCaio, T.cuYou, 'cuCaio', 'sofa'], [T.cuYou, T.phone, 'cuYou', 'sofa'], [T.phone, T.sw1, 'phone', 'sofa'],
    [T.sw1, T.coins, 'laund', 'l18'], [T.coins, T.sw2, 'coins', 'l18'],
    [T.sw2, T.follow, 'split', 'y19'], [T.follow, T.sw3, 'follow', 'y19'],
    [T.sw3, T.sleep, 'deal', 'l21'], [T.sleep, T.mg1, 'sleep', 'l21'], [T.mg1, T.mg2, 'store2', 'l21'], [T.mg2, T.sw4, 'store3', 'l21'],
    [T.sw4, T.buzz, 'home', 'sofa2'], [T.buzz, T.eyes, 'buzz', 'sofa2'], [T.eyes, T.cuYou2, 'eyes', 'sofa2'], [T.cuYou2, T.cuCaio2, 'cuYou2', 'sofa2'], [T.cuCaio2, T.end, 'cuCaio2', 'sofa2'],
    [T.end, DUR, 'end', 'end'],
  ];
  // swirl wipes: [centre time, half width]
  const WIPES = [[T.sw1, .22], [T.sw2, .2], [T.sw3, .2], [T.sw4, .22]];
  // year tags: [start, end, label, sub, bg, fg]
  const TAGS = [
    [T.cuCaio + .1, T.phone, '23 ANOS', 'HOJE', '#a8865c', '#fff6e0'],
    [T.sw1 + .25, T.sw2 - .1, '18 ANOS', '1º EMPREGO', '#2f8f8a', '#fff'],
    [T.sw2 + .25, T.follow, '19 ANOS', 'MODO ECONOMIA', '#5b2bd6', '#fff'],
    [T.sw3 + .25, T.mg1, '21 ANOS', 'O NEGÓCIO', '#e2483d', '#fff'],
    [T.sw4 + .25, T.buzz, '23 ANOS', 'DE VOLTA AO SOFÁ', '#a8865c', '#fff6e0'],
  ];
  // gains: [time, screen x, screen y, text, big]
  const GAINS = [
    [T.gain18, 400, 1150, '+R$ 1.500/mês', 1],
    [T.jar, 330, 1180, '+R$ 1.200', 0], [T.jar + .55, 330, 1100, '+R$ 1.200', 0], [T.jar + 1.1, 330, 1020, '+R$ 1.200', 0],
    [T.gain21, 540, 700, '+R$ 9.000/mês', 1],
    [T.mg1 + .3, 540, 1250, '+R$ 9.000/mês', 1], [T.mg2 + .25, 540, 1250, '+R$ 9.000/mês', 1],
    [T.buzz + .25, 540, 640, '+R$ 27.400', 1],
  ];
  // patrimônio counter keys [t, value]; shown from sw1 to buzz
  const NET = [
    [T.sw1, 0], [T.gain18, 0], [T.gain18 + .6, 1500], [T.sw2 - .3, 3800],
    [T.sw2 + .2, 3800], [T.jar, 3800], [T.jar + 1.6, 28800], [T.sw3, 28800],
    [T.keys, 28800], [T.keys + .6, 180000], [T.gain21, 180000], [T.gain21 + .8, 215000],
    [T.mg1 + .3, 215000], [T.mg1 + .8, 430000], [T.mg2 + .25, 430000], [T.mg2 + .7, 690000],
    [T.sw4 + .3, 690000], [T.million - .9, 690000], [T.million, 1000000],
  ];
  // music sections (first beat of each = its cut)
  const CUES = [
    { id: 'open', t0: 0, t1: T.sw1 - .25 },
    { id: 'l18', t0: T.sw1, t1: T.sil },
    { id: 'y19', t0: T.sw2, t1: T.sw3 - .2 },
    { id: 'l21', t0: T.sw3, t1: T.sw4 - .2 },
    { id: 'home', t0: T.sw4, t1: T.buzz - .05 },
    { id: 'end', t0: T.end, t1: DUR },
  ];
  return { VO, T, DUR, SHOTS, WIPES, TAGS, GAINS, NET, CUES };
}
