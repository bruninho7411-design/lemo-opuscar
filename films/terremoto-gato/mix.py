"""Score + foley + voice → out/mix.wav (48 kHz stereo). Reads events.json (exported from the page) and voices/."""
import os, sys, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
import sampler as S
from sfx import SR, add, compress, limit, lp, hp, bp, noise, brown, env_exp, t_, thump, ding, click, clack, whoosh, creak, step, norm

EV = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EV['dur']; N = int(DUR * SR); E = EV['ev']
CUE = {e['name']: e['t'] for e in E if e['type'] == 'cue'}
BPM = 90; BEAT = 60 / BPM; BAR = BEAT * 4
HIT, BLACK, STOP, TORCH, REVEAL = CUE['hit'], CUE['black'], CUE['stop'], CUE['torch'], CUE['reveal']
rng = np.random.default_rng(8)
def buf(): return np.zeros((N, 2), np.float32)
def ss(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
def seg(t, a, b): return np.clip((t - a) / (b - a), 0, 1)
tt = np.arange(N) / SR

# the quake envelope (same as shakeAmp in room.js)
def shake_amp(t):
    a = np.where(t < CUE['rumble'], 0, np.where(t < HIT, .1 * seg(t, CUE['rumble'], HIT), (1 - .25 * seg(t, 13, 18)) * (1 - ss(seg(t, 19, STOP)))))
    return a
SH = shake_amp(tt).astype(np.float32)

# ——— Score ———
ev = []   # (t, inst, pitch, dur, vel, pan)
# hook: bowed vibraphone pad (D minor), kalimba ostinato thinning, a clock woodblock on every beat
for k, (ch, d) in enumerate([(['D4', 'F4', 'A4'], BAR), (['Bb3', 'D4', 'F4'], BAR), (['A3', 'C#4', 'E4'], CUE['zero'] - 2 * BAR)]):
    t0 = k * BAR
    for p in ch: ev.append((t0 + .05, 'vibraphone_bowed', p, d + .2, .32, (-.3, 0, .3)[ch.index(p)]))
OST = ['D5', 'A4', 'F5', 'A4', 'E5', 'A4', 'F5', 'C5']
for i in range(int(CUE['zero'] / (BEAT / 2))):
    t = i * BEAT / 2
    if t >= CUE['zero'] - .05: break
    if t > 4.0 and i % 2: continue          # thins out as the cat wakes
    if t > 6.0 and i % 4: continue
    ev.append((t, 'kalimba', OST[i % 8], .5, .3 + .05 * (i % 4 == 0), .25 * (1 if i % 2 else -1)))
# after the quake: the bell answered by a soft glock, pad returns
ev.append((CUE['bell'] + .25, 'glockenspiel', 'A5', 1.5, .3, .2))
ev.append((CUE['bell'] + .8, 'glockenspiel', 'D6', 1.8, .26, -.2))
for p in ['D4', 'F4', 'A4']: ev.append((TORCH + .2, 'vibraphone_bowed', p, REVEAL - TORCH + .4, .24, 0))
# reveal: torches = notes (D major pentatonic, rising), pad resolves to D major
PENT = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6', 'B6', 'D7', 'B6', 'A6', 'F#6', 'E6', 'D6']
for e in E:
    if e['type'] == 'torchpop':
        k = e['k']; ev.append((e['t'], 'glockenspiel', PENT[k % 16], 1.2, .34 - .008 * k, .35 * np.sin(k * 1.7)))
for p in ['D4', 'F#4', 'A4', 'D5']: ev.append((REVEAL + .1, 'vibraphone_bowed', p, DUR - REVEAL - .3, .3, 0))
ev.append((REVEAL + .1, 'tubular_bells', 'D4', 4.0, .3, 0))
# the safety tiles knock like wooden tiles (one note each)
for e in E:
    if e['type'] == 'tile': ev.append((e['t'], 'marimba', ['D4', 'F4', 'A4'][e['i']], .6, .55, 0))
mel = np.asarray(S.render(ev, DUR, master=False), np.float32)[:N]
music = buf(); music[:len(mel)] += mel
music[int(CUE['zero'] * SR):int(HIT * SR)] = 0   # digital zero before the hit

# struggling pulse during the quake: a soft kick that skips
pulse = buf()
def kick(f=55, d=.4):
    x = t_(d); return (np.sin(2 * np.pi * f * x * (1 - .35 * x)) * np.exp(-x / .12)).astype(np.float32)
KK = kick()
for i in range(int((STOP - HIT) / BEAT)):
    t = HIT + i * BEAT + (.06 if i % 3 == 2 else 0)
    if i % 5 == 4: continue
    add(pulse, KK, t, .28 * (1 - .5 * seg(t, 19, STOP)))
# tense bowed cluster swelling in the quake (no notes below MIDI 48)
cl = np.asarray(S.render([(HIT + .3, 'vibraphone_bowed', p, STOP - HIT - .3, .2, pn) for p, pn in [('D4', -.4), ('Eb4', .4), ('A4', 0)]], DUR, master=False), np.float32)[:N]
music[:len(cl)] += cl * (.6 + .4 * SH[:len(cl), None]) * .4
music += pulse

# ——— Foley & ambience ———
fx = buf()
def rain_bed(d):
    x = bp(noise(d), 1500, 9000) * .5 + lp(noise(d), 900) * .3
    drops = np.zeros(int(d * SR)); idx = rng.integers(0, len(drops) - 400, int(d * 60))
    for i in idx: drops[i:i + 300] += np.sin(np.arange(300) * (.5 + rng.random() * .4)) * np.exp(-np.arange(300) / 40) * rng.random()
    return (norm(x) * .5 + norm(hp(drops, 1500)) * .35).astype(np.float32)
RB = rain_bed(DUR)
rain_g = np.ones(N) * .55; rain_g[int(HIT * SR):int(STOP * SR)] = .35; rain_g[int(REVEAL * SR):] = .55 + .25 * seg(tt[int(REVEAL * SR):], REVEAL, DUR)
rain_g = np.convolve(rain_g, np.ones(4800) / 4800, 'same')
fx[:, 0] += RB * rain_g * .8; fx[:, 1] += np.roll(RB, 3000) * rain_g * .8
# fridge/city hum until the blackout (its sudden stop is the blackout)
hum = (np.sin(2 * np.pi * 120 * tt) * .5 + np.sin(2 * np.pi * 240 * tt) * .2 + lp(noise(DUR), 300) * .3) * (tt < BLACK)
add(fx, (lp(hum, 400) * .05).astype(np.float32), 0, 1.0)
add(fx, click(.6, .6), BLACK, .5)
# the rumble: sub + earth growl following the shake envelope
rmb = lp(brown(DUR), 90) * 1.0 + lp(brown(DUR), 300) * .4
rmb = norm(rmb) * SH * (1 + .4 * np.sin(2 * np.pi * 1.3 * tt))
add(fx, rmb.astype(np.float32), 0, 1.4)
# the hit: a deep boom
boom = (np.sin(2 * np.pi * 38 * t_(2.5) * (1 - .2 * t_(2.5))) * env_exp(2.5, .6) + lp(noise(2.5), 500) * env_exp(2.5, .25)).astype(np.float32)
add(fx, norm(boom), HIT, .9)
add(fx, np.asarray(S.hit('bass_drum', None, 1.0), np.float32), HIT, .8)
# creaks of the building, random during the quake
for k in range(26):
    t = HIT + .3 + rng.random() * (STOP - HIT - 1.5); add(fx, creak(1.0), t, .25 * float(shake_amp(np.array([t]))[0]) + .05, rng.random() * 1.6 - .8)
# a car alarm far away (two-tone, low-passed)
ca = t_(STOP - 10.5); alarm = np.sin(2 * np.pi * np.where((ca * 2.2) % 1 < .5, 1050, 800) * ca) * (1 - seg(ca, STOP - 12, STOP - 10.5))
add(fx, lp(alarm, 2500).astype(np.float32), 10.5, .03, .7)
# a drip in the silence
for k in range(4): add(fx, ding(.4) * np.exp(-t_(1.6) / .08).astype(np.float32), STOP + .5 + k * 1.05, .12, -.3)

def bell(v=1.0, jingle=0):
    d = .9; x = t_(d); out = np.zeros(int(d * SR))
    n = 6 if jingle else 1
    for k in range(n):
        s = int((k * .07 + rng.random() * .03) * SR) if jingle else 0; f = 3600 * (1 + (rng.random() - .5) * .05)
        b = sum(a * np.sin(2 * np.pi * f * m * x) * np.exp(-x / tau) for m, a, tau in [(1, 1, .18), (1.48, .5, .1), (2.7, .3, .05), (.52, .25, .25)])
        out[s:] += b[:len(out) - s] * (1 - .1 * k)
    return norm(out) * v
def land(mat, big=False):
    if mat == 'book': return norm(lp(noise(.15), 1800) * env_exp(.15, .025) + thump(.6, 110)[:int(.15 * SR)] * .6) * (1.2 if big else .8)
    if mat == 'wood': return norm(clack(.5, 1) + np.pad(clack(.45, .5), (int(.08 * SR), 0))[:len(clack(.5, 1))])
    if mat == 'ceramic':
        d = .6; x = t_(d); sh = hp(noise(d), 3000) * env_exp(d, .08) * .6
        rings = sum(np.sin(2 * np.pi * f * x) * np.exp(-x / .05) * .3 for f in [2100, 3300, 4700, 6100])
        th = np.zeros(len(x)); tb = thump(.5, 140)[:len(x)]; th[:len(tb)] = tb
        return norm(sh + rings + th * .4)
    if mat == 'glass':
        d = .8; x = t_(d); out = hp(noise(d), 4000) * env_exp(d, .05) * .7
        for k in range(9): s = int(rng.random() * .4 * SR); f = 4000 + rng.random() * 4000; out[s:] += (np.sin(2 * np.pi * f * x) * np.exp(-x / .06))[:len(out) - s] * .3
        return norm(out)
    return thump(.6)
for e in E:
    t, ty = e['t'], e['type']
    pan = .3 * np.sin(t * 3.1)
    if ty == 'land': add(fx, land(e.get('mat'), e.get('big')).astype(np.float32), t, .75 if e.get('big') else .5, pan)
    if ty == 'fall': add(fx, whoosh(.25, .3), t, .12, pan)
    if ty == 'crack':
        d = .5; x = t_(d); cr = hp(noise(d), 2500) * (rng.random(len(x)) > .985) * 4 * env_exp(d, .2) + np.sin(2 * np.pi * 5200 * x) * np.exp(-x / .01) * .5
        add(fx, norm(cr).astype(np.float32), t, .6, -.5)
    if ty == 'shards': add(fx, land('glass').astype(np.float32), t, .55, -.5); add(fx, land('glass').astype(np.float32), t + .25, .4, -.4)
    if ty == 'step': add(fx, (lp(thump(.6, 90), 600) + step(.2)[:1] * 0).astype(np.float32), t, .22, .1)
    if ty == 'drop': add(fx, thump(1, 75), t, .55); add(fx, norm(lp(noise(.3), 1200) * env_exp(.3, .06)).astype(np.float32), t + .05, .2)
    if ty == 'crawl':
        for k in range(4): add(fx, norm(bp(noise(.18), 600, 3000) * np.sin(np.pi * t_(.18) / .18)).astype(np.float32), t + k * .2, .08)
    if ty == 'whoosh': add(fx, whoosh(.4, .5), t, .2)
    if ty == 'torch':
        add(fx, click(1.3, .8), t, .35); d = 1.4; x = t_(d)
        add(fx, (norm(np.sin(2 * np.pi * 52 * x) * np.exp(-x / .25) + lp(noise(d), 400) * np.exp(-x / .15)) * .5).astype(np.float32), t + .02, .4)
    if ty == 'bell': add(fx, bell(1, e.get('jingle', 0)).astype(np.float32), t, .28 * e.get('v', 1), -.25)
    if ty == 'paw': add(fx, norm(lp(noise(.04), 1500) * env_exp(.04, .008)).astype(np.float32), t, .07)
    if ty == 'purr':
        d = 2.2; x = t_(d); pr = lp(brown(d), 250) * (.5 + .5 * np.sin(2 * np.pi * 26 * x)) * np.sin(np.pi * x / d)
        add(fx, norm(pr).astype(np.float32), t, .25)
    if ty == 'door':
        add(fx, creak(.8), t, .25, .4); add(fx, clack(.7, .8), t - .3, .3, .4)
    if ty == 'torchpop': add(fx, click(1.6, .4), t, .12, .4 * np.sin(e['k']))
    if ty == 'tile': add(fx, clack(.6, .8), t, .25)

# ——— Voice ———
vo = buf()
for e in E:
    if e['type'] != 'vo': continue
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav'), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = soxr.resample(x, sr, SR).astype(np.float32)
    x = compress(x / (np.abs(x).max() + 1e-9) * .9, .2, 3.5)
    add(vo, x, e['t'], 1.0, 0)
venv = np.abs(vo[:, 0]); k = int(.12 * SR)
venv = np.convolve(venv, np.ones(k) / k, 'same'); duck = 1 - .55 * np.clip(venv / (venv.max() * .15 + 1e-9), 0, 1)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2)) if np.any(np.abs(x) > 1e-4) else 1
music *= (.3 / rms(music))
mg = np.ones(N); mg[int(HIT * SR):int(STOP * SR)] = .45; mg[int(REVEAL * SR):] = .75; mg = np.convolve(mg, np.ones(2400) / 2400, 'same'); music *= mg[:, None]
vo *= (.3 * 10 ** (10 / 20) / rms(vo)) * .36
fxd = fx * (1 - .35 * (1 - duck))[:, None]
mix = music * duck[:, None] * .8 + fxd * .9 + vo
mix[-int(.5 * SR):] *= np.linspace(1, 0, int(.5 * SR))[:, None]
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix, SR)
if os.environ.get('STEMS'):
    for n, x in [('music', music * duck[:, None] * .8), ('fx', fxd * .9), ('vo', vo)]: sf.write(os.path.join(HERE, 'out', n + '.wav'), x, SR)
print('mix', mix.shape, 'peak', float(np.abs(mix).max()))
