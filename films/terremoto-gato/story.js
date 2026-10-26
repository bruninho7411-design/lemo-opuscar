// One timeline for picture, sound and captions. 90 BPM: beat 0.667 s, bar 2.667 s.
export const BPM = 90, BEAT = 60 / BPM, BAR = BEAT * 4, E8 = BEAT / 2;
export const DUR = 40.0;

// Key moments (s)
export const T = {
  wake: 4.0,        // the cat lifts its head (bell)
  ripple: 6.0,      // first ring in the glass (then one per beat)
  rumble: 6.8,      // J-cut: sub rumble before the hit
  zero: 7.6,        // music bus to digital zero
  hit: 8.0,         // the main shock
  black: 9.0,       // power out
  up: 8.5,          // you get up from the sofa
  under: 10.3,      // you are under the table
  frame: 14.4,      // a frame falls next to the cat
  catRun: 14.7,     // the cat bolts
  catHid: 15.9,     // the cat is under the sofa
  crack: 19.4,      // the window cracks
  shards: 20.6,     // glass falls inside
  stop: 23.6,       // the shaking stops
  out: 26.2,        // you crawl out
  torch: 27.0,      // phone torch on
  bell: 28.2,       // the bell under the sofa
  eyes: 28.5,       // two eyes in the beam
  kneel: 29.4,      // you kneel by the sofa
  catOut: 30.2,     // the cat comes out to you
  pick: 31.0,       // you pick it up
  door: 32.2,       // to the door
  reveal: 33.6,     // pull back to the city
  torches: 34.0,    // neighbours' torches, one per eighth
};

// Shots: [start, name]
export const SHOTS = [
  [0, 'wide'], [3.6, 'cat'], [5.6, 'glass'], [8.0, 'quake'], [14.4, 'catrun'],
  [18.4, 'window'], [23.6, 'still'], [27.0, 'torch'], [33.6, 'reveal'],
];
export const shotAt = t => { let i = 0; while (i < SHOTS.length - 1 && t >= SHOTS[i + 1][0]) i++; return [SHOTS[i][0], i < SHOTS.length - 1 ? SHOTS[i + 1][0] : DUR, SHOTS[i][1]]; };

// Voice: start time + caption text (digits in captions, words in the TTS text: lines.json)
export const VO = [
  { id: 'v1', t: 0.35, text: 'Três da manhã. Chuva lá fora. Só você… e o seu gato.' },
  { id: 'v2', t: 3.75, text: 'Aí ele acorda. Do nada.' },
  { id: 'v3', t: 5.7, text: 'E o copo d’água… começa a tremer.' },
  { id: 'v4', t: 8.85, text: 'Não corre pra porta! Abaixa, se protege debaixo da mesa e segura firme!' },
  { id: 'v5', t: 14.5, text: 'E o gato? Não tenta pegar ele. Ele vai se esconder sozinho.' },
  { id: 'v6', t: 19.3, text: 'Longe da janela. Fica aí até parar.' },
  { id: 'v7', t: 25.0, text: 'Parou. Respira.' },
  { id: 'v8', t: 29.0, text: 'Agora sim: calça um sapato, pega o gato e desce pela escada. Nunca de elevador.' },
  { id: 'v9', t: 35.6, text: 'Salva esse vídeo. Pode salvar vocês dois.' },
];

// Safety words as tiles above the table (timed to the words in v4)
export const TILES = [
  { t: 10.2, text: 'ABAIXE' }, { t: 10.75, text: 'PROTEJA-SE' }, { t: 11.8, text: 'SEGURE' },
];

export const TITLE = 'POV: UM TERREMOTO 8.0 CHEGA ENQUANTO VOCÊ ESTÁ EM CASA COM SEU GATO';
