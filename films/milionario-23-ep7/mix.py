"""Music (two Kevin MacLeod tracks, CC BY 4.0, edited to the cue sections in events.json) + foley + ambience + voices
→ out/mix.wav (48 kHz stereo). Run core/render/events.mjs and voice.py first.
  A (the letter, "ele errou duas vezes"): "Hitman", its driving section · B (the two mistakes, the law, the condition, the save
  call): "Investigations" · C (registered, the deposit, Arlindo, the building yours): "Hitman", the big section · E (the
  cliffhanger): "Hitman" suspense · F (end card): "Hitman" drop"""
import os, sys, json, subprocess, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, click, whoosh, pop, ding, thump, crash, compress, limit, add
from scipy.ndimage import uniform_filter1d

E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR) + SR
EV = E['ev']; rng = np.random.default_rng(37)
evs = lambda tp: [e for e in EV if e['type'] == tp]
CUE = {e['id']: e for e in evs('cue')}
VO = evs('vo')
buf = lambda: np.zeros((N, 2))
music, sfx_, amb, vox = buf(), buf(), buf(), buf()

def load(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'music', name), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
HIT, INV = load('Hitman.mp3'), load('Investigations.mp3')
def place(y, s0, s1, at, g=1., fin=.01, fout=.04):
    seg = y[int(s0 * SR):int(s1 * SR)].copy() * g; n = len(seg)
    a, b = min(n, int(fin * SR)), min(n, int(fout * SR))
    if a: seg[:a] *= np.linspace(0, 1, a)[:, None]
    if b: seg[n - b:] *= np.linspace(1, 0, b)[:, None]
    i = int(at * SR); e = min(len(music), i + n); music[i:e] += seg[:e - i]

A, B, C, E1, F = CUE['A'], CUE['B'], CUE['C'], CUE['E'], CUE['F']
place(HIT, 12.0, 12.0 + (A['t1'] - A['t']), A['t'], .85, .02, .03)            # Caio's panic, the two mistakes promised
place(INV, 0, B['t1'] - B['t'], B['t'], 1.2, .05, .02)                       # the law, explained; cut on "Registrei"
place(HIT, 52.0, 52.0 + (C['t1'] - C['t']), C['t'], .9, .005, .03)           # registered → deposit → the building is yours
place(HIT, 27.0, 27.0 + (E1['t1'] - E1['t']), E1['t'], .95, .02, .015)        # "quanto sobrou na sua conta?"
place(HIT, 51.0, 51.0 + (F['t1'] - F['t']), F['t'], 1.0, .005, 1.2)            # end card
# —— voices ——
for e in VO:
    p = os.path.join(HERE, 'voices', 'p', e['id'] + '.wav')
    if os.path.exists(p): y, _ = sf.read(p); add(vox, y, e['t'], 1.0, 0)
act = uniform_filter1d((np.abs(vox).max(1) > .02).astype(float), int(.25 * SR))
act = uniform_filter1d(np.minimum(1, act * 3), int(.15 * SR))
music *= (1 - .5 * act)[:, None]

# —— ambience ——
def birds(d):
    x = np.zeros(int(round(d * SR)))
    for k in range(int(d * 1.4)):
        at = rng.random() * d; n = int(.18 * SR); tt = np.arange(n) / SR; f = 2600 + rng.random() * 1800
        ch = np.sin(2 * np.pi * np.cumsum(f + 900 * np.sin(2 * np.pi * 14 * tt)) / SR) * np.sin(np.pi * tt / tt[-1]) * .05
        i = int(at * SR); x[i:i + n] += ch[:len(x) - i]
    return x
for e in evs('amb'):
    d, t0, w = e['d'], e['t'], e['w']; tt = t_(d)
    room = lp(brown(d), 260) * .05
    if w in ('office', 'court'): x = room + lp(brown(d), 90) * .07 + hp(np.sin(2 * np.pi * 60 * tt) * .3, 50) * .004   # sealed glass, the city far below
    elif w in ('l21', 'shop'): x = room + lp(brown(d), 150) * (1 + .4 * np.sin(2 * np.pi * .9 * tt)) * .1
    elif w == 'street': x = room + lp(brown(d), 200) * .05 + birds(d)
    else: continue
    add(amb, x, t0, 1, 0)

# —— foley ——
def S(x, at, g=1., pan=0.): add(sfx_, x, at, g, pan)
def mono(y, x, at): i = int(at * SR); n = min(len(x), len(y) - i); y[i:i + n] += x[:n]
def sweep(f0, f1, d): tt = t_(d); fr = f0 * (f1 / f0) ** (tt / d); return np.sin(2 * np.pi * np.cumsum(fr) / SR)
def sparkle(): y = np.zeros(int(.6 * SR)); [mono(y, np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * t_(.3)) * np.exp(-t_(.3) / .08) * .3, i * .05) for i, m in enumerate([84, 88, 91, 96])]; return y
def shimmer(): d = .8; tt = t_(d); return sum(np.sin(2 * np.pi * fq * tt) * np.exp(-tt / .3) * (rng.random() * .5 + .5) for fq in [2093, 2637, 3136, 4186]) * .25
def clink(v=1): d = .25; tt = t_(d); return sum(np.sin(2 * np.pi * fq * tt) * np.exp(-tt / .05) for fq in [3200, 4700, 6100]) * .3 * v
def jangle(v=1): y = np.zeros(int(.4 * SR)); [mono(y, clink(.7 * v), rng.random() * .25) for _ in range(6)]; return y
def kaching(v=1):
    x = np.zeros(int(1.6 * SR)); mono(x, ding(v) * .6, 0)
    for i, fq in enumerate([1568, 2093, 2637]): tt = t_(.6); s = np.sin(2 * np.pi * fq * tt) * np.exp(-tt / .18); j = int((.06 + i * .05) * SR); x[j:j + len(s)] += s * .4 * v
    c = click(1.2, v); x[:len(c)] += c * .5; return x
def swirl(): d = .7; tt = t_(d); w = whoosh(.6, 1.0); s = sweep(200, 1400, d) * np.sin(np.pi * tt / d) * .3; y = np.zeros(int(d * SR)); y[:len(w)] += w; return y + s
def boing(): d = .45; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(300 + 120 * np.sin(2 * np.pi * 12 * tt) * np.exp(-tt / .15)) / SR) * np.exp(-tt / .15) * .6
def tlim(): d = .9; tt = t_(d); return (np.sin(2 * np.pi * 2349 * tt) + .5 * np.sin(2 * np.pi * 3520 * tt)) * np.exp(-tt / .25) * .6
def hit(): d = 1.6; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(45 + 40 * np.exp(-tt / .1)) / SR) * np.exp(-tt / .5) * .8 + lp(noise(d), 400) * np.exp(-tt / .3) * .2
def creak(): d = .5; tt = t_(d); return bp(noise(d), 500, 1600) * (np.sin(2 * np.pi * 30 * tt) > .5) * np.sin(np.pi * tt / d) * .4
def paper(d=.12): tt = t_(d); return bp(noise(d), 900, 6000) * np.exp(-tt / .03)
def stamp(v=1): x = np.zeros(int(.5 * SR)); mono(x, thump(.9, 85) * .9, 0); mono(x, paper(.1) * .5, 0); return x * v
def marker(d): tt = t_(d); return bp(noise(d), 2500, 6500) * (.55 + .45 * np.sin(2 * np.pi * 13 * tt)) * np.sin(np.pi * tt / d) * .22
def tick(d): y = np.zeros(int(round(d * SR))); [mono(y, bp(noise(.02), 2000, 6000) * env_exp(.02, .004) * .35, k * .5) for k in range(int(d / .5) + 1)]; return y
def gulp(): d = .25; return sweep(420, 110, d) * env_exp(d, .07) * .7
for e in EV:
    t0, tp, v = e['t'], e['type'], e.get('v', 1)
    if tp == 'title': S(click(1.0, 1), t0, .7); S(whoosh(.3, .7), t0 - .1, .4)
    elif tp == 'creak': S(creak(), t0, .7)
    elif tp == 'whoosh': S(whoosh(.35, 1), t0 - .05, .55 * v)
    elif tp == 'hit': S(hit(), t0, .7 * v)
    elif tp == 'tlim': S(tlim(), t0, .5 * v)
    elif tp == 'cut': S(whoosh(.18, .5), t0 - .06, .5 * v)
    elif tp == 'boing': S(boing(), t0, v)
    elif tp == 'shimmer': S(shimmer(), t0, .6 * v, .2)
    elif tp == 'rise': S(sweep(300, 2400, e['d']) * np.linspace(0, 1, int(round(e['d'] * SR))) * .15, t0, 1)
    elif tp == 'swirl': S(swirl(), t0, .8)
    elif tp == 'jangle': S(jangle(v), t0, .8)
    elif tp == 'stamp': S(stamp(v), t0, .8)
    elif tp == 'marker': S(marker(e['d']), t0, .9)
    elif tp == 'glint': S(sparkle(), t0, .4)
    elif tp == 'pop': S(pop(v), t0, .6)
    elif tp == 'click': S(click(1.0, 1), t0, .8)
    elif tp == 'sparkle': S(sparkle(), t0, .5)
    elif tp == 'kaching': S(kaching(v), t0, .38, .15)
    elif tp == 'slap': S(stamp(1), t0, .9); S(hit(), t0, .35)
    elif tp == 'tick': S(tick(e['d']), t0, .8, .3)
    elif tp == 'coinslam': S(hit(), t0, .7); S(clink(1), t0, .9, -.2)
    elif tp == 'sting': S(sweep(900, 240, .5) * np.exp(-t_(.5) / .15) * .3, t0, v)
    elif tp == 'mail': S(paper(.35) * .5, t0, .8, .3)
    elif tp == 'gulp': S(gulp(), t0, .8)
    elif tp == 'foam': d = e['d']; tt = t_(d); S(bp(noise(d), 700, 4500) * (.6 + .4 * np.sin(2 * np.pi * 7 * tt)) * np.minimum(1, tt / .1) * np.minimum(1, (d - tt) / .3) * .35, t0, .9)
    elif tp == 'spark': S(bp(noise(.08), 3000, 9000) * env_exp(.08, .015) * .8, t0, .6, rng.random() - .5)

# —— balance: voice ~9 dB over music ——
rms = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
vm = vox[np.abs(vox).max(1) > .02]; vr = rms(vm) if len(vm) else .1
mm = music[np.abs(music).max(1) > .005]; music *= (vr / 2.8) / (rms(mm) + 1e-9)
mix = (vox + music + sfx_ * .55 + amb)[:int(DUR * SR)]
mix = limit(mix / (np.abs(mix).max() + 1e-9) * .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
for nm, x in [('music', music), ('sfx', sfx_), ('amb', amb), ('vox', vox)]: print(nm, round(20 * np.log10(rms(x[:int(DUR * SR)]) + 1e-9), 1), 'dBFS rms')
print('mix', DUR, 's')
