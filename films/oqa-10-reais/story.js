// story.js — the timeline, built from the voice durations (voices/dur.json): one night per age, then the end card.
export const NIGHTS = 365, PER = 10;   // the film counts 365 nights a year, R$10 a night
export const SCENES = [   // [key, clip, keyframe, age, line ids]
  ['s1', 'c1', 'k1_baby.png', 0, ['p1']], ['s2', 'c2', 'k2_toddler.png', 3, ['p2']], ['s3', 'c3', 'k3_drawing.png', 7, ['p3']],
  ['s4', 'c4', 'k4_kitchen.png', 10, ['p4']], ['s5', 'c5', 'k5_phone.png', 13, ['p5']], ['s6', 'c6', 'k6_door.png', 16, ['p6']],
  ['s7', 'c7', 'k7_box.png', 18, ['p7', 'y1']],
];
export const XF = .4;   // crossfade between nights

export function build(D) {
  const d = id => D[id] ?? 2.5;
  const VO = {}, S = [];
  let t = 0;
  for (const [key, clip, kf, age, ids] of SCENES) {
    const t0 = t; let u = t0 + .55;
    for (const [i, id] of ids.entries()) { VO[id] = +(u + (i ? .35 : 0)).toFixed(3); u = VO[id] + d(id); }
    const t1 = +Math.max(t0 + 3.6, u + (key === 's7' ? .6 : .85)).toFixed(3);
    S.push({ key, clip, kf, age, t0: +t0.toFixed(3), t1, nights: age === 0 ? 1 : age * NIGHTS });
    t = t1;
  }
  const END = t, DUR = +(END + 5.2).toFixed(3);
  return { VO, S, END, DUR };
}
