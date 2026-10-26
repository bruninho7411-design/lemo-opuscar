// One timeline for picture, sound, subtitles and checks. 128 BPM: beat 0.46875 s, eighth 0.234375 s; the countdown is 128 eighths = 30.0 s.
export const BPM = 128, BEAT = 60 / BPM, E8 = BEAT / 2;
export const T0 = 6.0;                 // countdown starts (0:30)
export const T1 = T0 + 128 * E8;       // 36.0 — 0:00
export const RISE = [T1, 38.6];        // scale reveal
export const STOP = [38.6, 39.4];      // tape-stop + silence
export const REW = [39.4, 42.4];       // rewind (plays film time backwards)
export const DUR = 53.0;               // last frame == first frame (loop)
export const HOOK_V = 0.1, VALENDO = 5.1;

// Proposal slots in eighths (each slot ≥ spoken line + 0.6 s)
const SLOT = [14, 12, 14, 12, 13, 13, 8, 14, 12, 16];
export const P = [];
{
  let e = 0;
  const TXT = [
    ['Tchau, escala 6×1.', '40 horas por semana.'],
    ['Ganha até R$ 5 mil?', 'Imposto de renda: zero.'],
    ['Cesta básica sem imposto,', 'e cashback pros mais pobres.'],
    ['Creche pública e escola', 'em tempo integral.'],
    ['Pé-de-Meia pros estudantes', 'e mais Institutos Federais.'],
    ['Mais Médicos, especialistas,', 'e a fila do SUS andando.'],
    ['Mais Farmácia Popular.'],
    ['Ministério da Segurança Pública,', 'mirando o dinheiro das facções.'],
    ['Entregador de app com INSS.'],
    ['Política de cuidados: pra quem cuida', 'e pra quem envelhece.'],
  ];
  for (let i = 0; i < 10; i++) { const t = T0 + e * E8; P.push({ i, t, t1: T0 + (e + SLOT[i]) * E8, id: 'p' + (i + 1), cap: TXT[i] }); e += SLOT[i]; }
}

// Voice: line start times
export const VO = [
  { id: 'h1', t: HOOK_V },
  { id: 'h2', t: VALENDO },
  ...P.map(p => ({ id: p.id, t: p.t + 0.06 })),
  { id: 'c1', t: 36.35 },
  { id: 'o1', t: 42.8 },
  { id: 'o2', t: 46.9 },
];

// Captions (burned in + .srt): each holds until the next one starts
export const CAPS = [
  { t0: HOOK_V, t1: VALENDO, id: 'h1', lines: ['E se todas as propostas do Lula', 'virassem realidade… por só 30 segundos?'] },
  ...P.map(p => ({ t0: p.t, t1: p.t1, id: p.id, lines: p.cap })),
  { t0: 36.3, t1: 38.6, id: 'c1', lines: ['Tudo. Ao mesmo tempo.'] },
  { t0: 42.8, t1: 46.9, id: 'o1', lines: ['Agora a pergunta é: quanto disso', 'sai do papel em 4 anos?'] },
  { t0: 46.9, t1: DUR, id: 'o2', lines: ['Qual dessas você mais quer', 'ver de verdade? Comenta aí!'] },
];

// Film time → "source time" (what the world shows). Rewind plays it backwards; the outro runs at negative source time so the last frame lands on frame 0.
export const SRC_END = 38.6, SRC_LAND = REW[1] - DUR;   // -10.6
export function srcTime(t) {
  if (t < STOP[0]) return t;
  if (t < REW[0]) return STOP[0];                       // frozen
  if (t < REW[1]) {                                      // rewind, stepped at 8 Hz, accelerating then braking
    const u = (t - REW[0]) / (REW[1] - REW[0]);
    const q = Math.floor(u * 24) / 24;                   // 8 Hz over 3 s
    const e = q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
    return SRC_END + (SRC_LAND - SRC_END) * e;
  }
  return t - DUR;                                        // outro: -10.6 → 0
}
