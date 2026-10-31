"""Music (two Kevin MacLeod tracks, CC BY 4.0, edited to the cue sections in events.json) + foley + ambience + voices
→ out/mix.wav (48 kHz stereo). Run core/render/events.mjs and voice.py first.
  A (hook, briefcase): "Hitman" loud section · B (the maths): "Investigations", dead cut on "Não tá à venda"
  E (the suit's answer): "Hitman" suspense section · F (next morning, Ômega, end card): "Hitman" drop"""
import os, sys, json, subprocess, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, click, whoosh, pop, ding, thump, crash, compress, limit, add
from scipy.ndimage import uniform_filter1d

E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR) + SR
EV = E['ev']; rng = np.random.default_rng(31)
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
def tapestop(y, s0, d, at, g=1.):   # playback slows to a halt over d seconds (pitch falls with it)
    n = int(d * SR); rate = np.linspace(1, 0, n) ** 1.3; pos = s0 * SR + np.cumsum(rate)
    out = np.stack([np.interp(pos, np.arange(len(y)), y[:, c]) for c in (0, 1)], 1) * g * np.linspace(1, .2, n)[:, None]
    i = int(at * SR); e = min(len(music), i + n); music[i:e] += out[:e - i]

A, B, E1, F = CUE['A'], CUE['B'], CUE['E'], CUE['F']
place(HIT, 12.0, 12.0 + (A['t1'] - A['t']), A['t'], 1.0, .02, .015)          # hook: Hitman's loud section
place(INV, 0, B['t1'] - B['t'], B['t'], 1.25, .25, .02)                       # the maths: Investigations; dead cut on the refusal
place(HIT, 27.0, 27.0 + (E1['t1'] - E1['t']), E1['t'], .95, .3, .015)          # the suit's answer: suspense section
place(HIT, 51.0, 51.0 + (F['t1'] - F['t']), F['t'], 1.0, .005, 1.2)            # next morning: the drop lands on Ômega
# —— voices ——
for e in VO:
    p = os.path.join(HERE, 'voices', 'p', e['id'] + '.wav')
    if os.path.exists(p): y, _ = sf.read(p); add(vox, y, e['t'], 1.0, 0)
act = uniform_filter1d((np.abs(vox).max(1) > .02).astype(float), int(.25 * SR))
act = uniform_filter1d(np.minimum(1, act * 3), int(.15 * SR))
music *= (1 - .5 * act)[:, None]

# —— ambience ——
def crickets(d):
    tt = t_(d); x = np.zeros(len(tt))
    for k in range(5):
        f = 4200 + k * 330; ph = rng.random() * 6; env = (np.sin(2 * np.pi * (3.1 + k * .37) * tt + ph) > .3) * (np.sin(2 * np.pi * 40 * tt) > 0)
        x += np.sin(2 * np.pi * f * tt) * uniform_filter1d(env.astype(float), 60) * .05
    return x
def birds(d):
    x = np.zeros(int(round(d * SR)))   # same length as t_(d)
    for k in range(int(d * 1.2)):
        at = rng.random() * d; n = int(.18 * SR); tt = np.arange(n) / SR; f = 2600 + rng.random() * 1800
        ch = np.sin(2 * np.pi * np.cumsum(f + 900 * np.sin(2 * np.pi * 14 * tt)) / SR) * np.sin(np.pi * tt / tt[-1]) * .05
        i = int(at * SR); x[i:i + n] += ch[:len(x) - i]
    return x
for e in evs('amb'):
    d, t0, w = e['d'], e['t'], e['w']
    room = lp(brown(d), 260) * .05
    if w == 'night': x = room + crickets(d) + lp(brown(d), 120) * .04
    elif w == 'laund': tt = t_(d); x = room + lp(brown(d), 150) * (1 + .4 * np.sin(2 * np.pi * .9 * tt)) * .1 + hp(np.sin(2 * np.pi * 120 * tt) * .4 + np.sin(2 * np.pi * 240 * tt) * .25, 100) * .006
    elif w == 'street': x = room + lp(brown(d), 200) * .06 + birds(d)
    else: x = room + birds(d) * .6
    add(amb, x, t0, 1, 0)

# —— foley ——
def S(x, at, g=1., pan=0.): add(sfx_, x, at, g, pan)
def mono(y, x, at): i = int(at * SR); n = min(len(x), len(y) - i); y[i:i + n] += x[:n]
def sweep(f0, f1, d): tt = t_(d); fr = f0 * (f1 / f0) ** (tt / d); return np.sin(2 * np.pi * np.cumsum(fr) / SR)
def ping(p=1.): d = .35; tt = t_(d); return (np.sin(2 * np.pi * 1760 * p * tt) + .4 * np.sin(2 * np.pi * 2640 * p * tt)) * np.exp(-tt / .08) * .5
def brickclick(p=1., v=1.):   # transient + resonances near 2.9 and 4.6 kHz
    d = .09; tt = t_(d); x = hp(noise(d), 1500) * np.exp(-tt / .004) * .6
    x += (np.sin(2 * np.pi * 2900 * p * tt) * .5 + np.sin(2 * np.pi * 4600 * p * tt) * .35) * np.exp(-tt / .018)
    return x * v
def rewind(): d = .9; tt = t_(d); return bp(noise(d), 800, 5000) * (.4 + .6 * (np.sin(2 * np.pi * (6 + 18 * tt / d) * tt) > 0)) * .35 + sweep(2000, 300, d) * .15
def sparkle(): y = np.zeros(int(.6 * SR)); [mono(y, np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * t_(.3)) * np.exp(-t_(.3) / .08) * .3, i * .05) for i, m in enumerate([84, 88, 91, 96])]; return y
def creak(): d = .4; tt = t_(d); return bp(noise(d), 600, 1800) * (np.sin(2 * np.pi * 38 * tt) > .6) * .35
def car(d): tt = t_(d); return lp(brown(d), 180) * (.6 + .4 * tt / d) * .4 + lp(noise(d), 600) * .05
def brake(): d = .5; tt = t_(d); return bp(noise(d), 1800, 4200) * np.exp(-tt / .2) * .2
def door(): y = np.zeros(int(.5 * SR)); mono(y, thump(.8, 90), 0); mono(y, brickclick(.7, .8), .01); return y
def step(p=1.): return brickclick(p * .55, .4)
def hit(): d = 1.6; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(45 + 40 * np.exp(-tt / .1)) / SR) * np.exp(-tt / .5) * .8 + lp(noise(d), 400) * np.exp(-tt / .3) * .2
def buzz(): d = .5; tt = t_(d); return np.sign(np.sin(2 * np.pi * 150 * tt)) * (np.sin(2 * np.pi * 7 * tt) > 0) * .12
for e in EV:
    t0, tp, v, p = e['t'], e['type'], e.get('v', 1), e.get('p', 1)
    if tp == 'title': S(brickclick(1, 1), t0, .8); S(whoosh(.3, .7), t0 - .1, .4)
    elif tp == 'ping': S(ping(p), t0, .5 * v, .2)
    elif tp == 'rewind': S(rewind(), t0, .9)
    elif tp == 'whoosh': S(whoosh(.35, 1), t0, .5 * v)
    elif tp == 'click': S(brickclick(p, 1), t0, .7 * v)
    elif tp == 'buzz': S(buzz(), t0, .6)
    elif tp == 'cut': S(whoosh(.18, .4), t0 - .06, .3)
    elif tp == 'step': S(step(p), t0, .6 * v)
    elif tp == 'ding': S(ding(1)[:int(1.2 * SR)], t0, .35 * v)
    elif tp == 'pop': S(pop(1), t0, .6 * v)
    elif tp == 'sparkle': S(sparkle(), t0, .5)
    elif tp == 'creak': S(creak(), t0, .6 * v)
    elif tp == 'sting': S(sweep(900, 240, .5) * np.exp(-t_(.5) / .15) * .3, t0, v)
    elif tp == 'car': S(car(e['d']), t0, .9)
    elif tp == 'brake': S(brake(), t0, .8)
    elif tp == 'door': S(door(), t0, .8)
    elif tp == 'hit': S(hit(), t0, .7 * v)
    elif tp == 'slam': S(hit(), t0, .6); S(brickclick(.8, 1), t0, .9)
    elif tp == 'latch': S(brickclick(.7, 1), t0, .8)
    elif tp == 'gulp': S(sweep(420, 110, .25) * env_exp(.25, .07) * .7, t0, .8)

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
