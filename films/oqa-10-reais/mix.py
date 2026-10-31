"""Music (Satie, Gymnopédie No. 1, recorded by Kevin MacLeod, CC BY 4.0) + the father's voice in a small room + soft foley
→ out/mix.wav (48 kHz stereo). Run core/render/events.mjs and voice.py first."""
import os, sys, json, subprocess, numpy as np, soundfile as sf
from scipy.signal import fftconvolve
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, noise, whoosh, pop, add, limit

E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR) + SR; EV = E['ev']
rng = np.random.default_rng(10)
buf = lambda: np.zeros((N, 2))
music, sfx_, vox = buf(), buf(), buf()
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'music', 'Gymnopedie No 1.mp3'), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
m = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)[:int(DUR * SR)]
m[:int(.4 * SR)] *= np.linspace(0, 1, int(.4 * SR))[:, None]
f = int(2.5 * SR); m[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.5
music[:len(m)] += m
# —— voices, in a small dark room ——
ir = noise(.35) * np.exp(-t_(.35) / .07); ir = lp(ir, 5000); ir /= np.abs(ir).sum() / 6
for e in EV:
    if e['type'] != 'vo': continue
    y, _ = sf.read(os.path.join(HERE, 'voices', 'p', e['id'] + '.wav'))
    wet = fftconvolve(y, ir)[:len(y) + int(.35 * SR)] * .12
    yy = np.zeros(len(wet)); yy[:len(y)] += y; yy += wet
    add(vox, yy, e['t'], .9 if e['who'] == 'p' else .95, 0)
act = np.convolve((np.abs(vox).max(1) > .02).astype(float), np.ones(int(.3 * SR)) / int(.3 * SR), 'same')
music *= (1 - .38 * np.minimum(1, act * 2))[:, None]
# —— foley: soft ——
def S(x, at, g=1., pan=0.): add(sfx_, x, at, g, pan)
def rustle(): d = .35; tt = t_(d); return bp(noise(d), 1500, 7000) * np.exp(-tt / .07) * (1 + .5 * np.sin(2 * np.pi * 40 * tt)) * .3
def chime(v=1): d = 2.2; tt = t_(d); return sum(np.sin(2 * np.pi * fq * tt) * np.exp(-tt / dk) * a for fq, dk, a in [(1046.5, .9, .35), (1568, .7, .22), (2093, .5, .14), (3136, .35, .06)]) * v
def coins():
    y = np.zeros(int(.8 * SR))
    for k in range(5):
        d = .2; tt = t_(d); s = sum(np.sin(2 * np.pi * fq * tt) for fq in [3100 + rng.random() * 600, 4700, 6200]) * np.exp(-tt / .05) * .12
        i = int(rng.random() * .55 * SR); y[i:i + len(s)] += s[:len(y) - i]
    return y
for e in EV:
    t0, tp, v = e['t'], e['type'], e.get('v', 1)
    if tp == 'drop': S(rustle(), t0, .5 * v, .15)
    elif tp == 'swish': S(whoosh(.5, .5), t0, .22)
    elif tp == 'coins': S(coins(), t0, .6, -.2)
    elif tp == 'chime': S(chime(v), t0, .55)
    elif tp == 'pop': S(pop(v), t0, .25)
rms = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
vm = vox[np.abs(vox).max(1) > .02]; vr = rms(vm) if len(vm) else .1
mm = music[np.abs(music).max(1) > .005]; music *= (vr / 2.0) / (rms(mm) + 1e-9)   # the music close under the voice (~6 dB)
mix = (vox + music + sfx_ * .6)[:int(DUR * SR)]
mix = limit(mix / (np.abs(mix).max() + 1e-9) * .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
for nm, x in [('music', music), ('sfx', sfx_), ('vox', vox)]: print(nm, round(20 * np.log10(rms(x[:int(DUR * SR)]) + 1e-9), 1), 'dBFS rms')
print('mix', DUR, 's')
