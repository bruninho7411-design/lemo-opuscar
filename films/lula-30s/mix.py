"""Score + foley + voice → out/mix.wav (48 kHz stereo). Reads events.json (film events) and voices/ (TTS)."""
import os, sys, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
import sampler as S
from sfx import SR, add, compress, limit, lp, hp, bp, noise, brown, env_exp, t_, thump, pop, ding, click, whoosh, crash, norm

EV = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EV['dur']; N = int(DUR * SR)
BPM = 128; BEAT = 60 / BPM; E16 = BEAT / 4; BAR = BEAT * 4
T0, T1, STOP0, STOP1, REW0, REW1 = 6.0, 36.0, 38.6, 39.4, 39.4, 42.4
POPS = [e['t'] for e in EV['ev'] if e['type'] == 'pop']
rng = np.random.default_rng(26)

def buf(): return np.zeros((N, 2), np.float32)

# ——— Score ———
CH = [('D', ['D3', 'F#3', 'A3', 'D4', 'F#4', 'A4']), ('B', ['B2', 'D3', 'F#3', 'B3', 'D4', 'F#4']), ('G', ['G2', 'B2', 'D3', 'G3', 'B3', 'D4']), ('A', ['A2', 'C#3', 'E3', 'A3', 'C#4', 'E4'])]
ROOT = {'D': 'D2', 'B': 'B1', 'G': 'G1', 'A': 'A1'}
OST_A = [3, 4, 5, 4, 3, 5, 4, 2, 3, 4, 5, 4, 2, 4, 3, 5]      # chord-tone indices per 16th (marimba A)
OST_B = [5, 3, 4, 2, 5, 3, 4, 3, 5, 2, 4, 3, 5, 3, 4, 2]      # marimba B, answers A (enters bar 5)
SCALE = ['D6', 'E6', 'F#6', 'A6', 'B6', 'D7', 'E7', 'F#7', 'A7', 'B7']
ev = []      # (t, inst, pitch, dur, vel, pan)
music = buf(); drums = buf()

def bars(t0, nb):
    for b in range(nb):
        yield b, t0 + b * BAR, CH[b % 4]

# J-cut into the drop: filtered ostinato from 4.6
pre = []
for k in range(int((T0 - 4.6) / E16) + 1):
    t = T0 - (k + 1) * E16
    if t < 4.6: break
    pre.append((t, 'marimba', CH[3][1][OST_A[(15 - k) % 16]], .3, .25 + .35 * (t - 4.6) / 1.4, -.2))
# Timer: 16 bars
for b, tb, (cn, notes) in bars(T0, 16):
    for k in range(16):
        t = tb + k * E16
        ev.append((t, 'marimba', notes[OST_A[k]], .35, .55 + .15 * (k % 4 == 0), -.35))
        if b >= 4: ev.append((t + .012, 'marimba', notes[OST_B[k]], .35, .42 + .1 * (k % 4 == 0), .35))
    # bass: tamborzão-ish syncopation on the root
    for k, v in [(0, .9), (3, .7), (6, .75), (10, .8), (12, .7)]:
        ev.append((tb + k * E16, 'electric_bass', ROOT[cn], E16 * 2.2, v, 0))
    if b >= 2:   # vibraphone stabs on the off-beats
        for k in [2, 6, 10, 14]: ev.append((tb + k * E16, 'vibraphone_hard', notes[3], .3, .32, .15))
    if b >= 14:  # final two bars: pulsing chords
        for k in range(0, 16, 2):
            for p in notes[2:5]: ev.append((tb + k * E16, 'vibraphone', p, .25, .4, .0))
# pop glock: each proposal one step up the scale
for i, t in enumerate(POPS): ev.append((t, 'glockenspiel', SCALE[i], 1.2, .8, .1 * (1 if i % 2 else -1)))
# final chord at 0:00
for p in ['D3', 'A3', 'D4', 'F#4', 'A4', 'D5']: ev.append((T1, 'vibraphone_bowed', p, STOP0 - T1 + .4, .6, 0))
for k in range(int((STOP0 - T1) / E16)): ev.append((T1 + k * E16, 'marimba', ['D4', 'F#4', 'A4', 'D5'][k % 4], .2, .45, (-1) ** k * .3))
ev.append((T1, 'glockenspiel', 'D7', 2.5, .9, 0))
# outro: music-box version of the ostinato (glockenspiel, sparse, fades before the loop point)
for b, tb, (cn, notes) in bars(REW1 + .4, 5):
    for k in range(0, 16, 2):
        t = tb + k * E16
        if t > DUR - 1.2: break
        p = notes[OST_A[k]]; p = p[:-1] + str(int(p[-1]) + 2)
        if 'B' in cn or k % 4 == 0 or b < 4: ev.append((t, 'glockenspiel', p if int(p[-1]) <= 7 else p[:-1] + '7', .6, .28, (-1) ** k * .25))

mel = S.render(pre + ev, DUR, master=False)
mel = np.asarray(mel, np.float32)[:N]
music[:len(mel)] += mel

# drums (sampled + synthesized kick), timer only; bar 9 drops for a breath
def kick():
    d = .35; tt = t_(d); f = 52 + 90 * np.exp(-tt / .03); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-tt / .11) + .3 * np.sin(2 * ph) * np.exp(-tt / .05)).astype(np.float32)
KICK = kick()
for b, tb, _ in bars(T0, 16):
    if b == 8: continue
    for k in [0, 3, 6, 10, 12]: add(drums, KICK, tb + k * E16, .8 if k in (0, 10) else .6)
    for k in [4, 12]: add(drums, S.hit('claps', None, .8), tb + k * E16, .55, .05)
    for k in range(16): add(drums, S.hit('shaker', None, .5 + .3 * (k % 2 == 0)), tb + k * E16, .22, .3)
    for k in [3, 7, 11, 14]: add(drums, S.hit('woodblock', None, .5), tb + k * E16, .16, -.4)   # woodblock accents (agogô feel)
    if b >= 14:
        for k in range(0, 16, 2): add(drums, S.hit('shaker', None, .9), tb + k * E16, .25, -.2)
add(drums, crash(1.0), T1, .5)
music += drums

# tape-stop at STOP0: varispeed the last 0.6 s of music down to nothing, then silence
def tapestop(x, t0, d=.6):
    s0 = int(t0 * SR); seg = x[s0:s0 + int(d * SR * 2)].copy()
    u = np.linspace(0, 1, int(d * SR)); rate = (1 - u) ** 1.6
    pos = np.cumsum(rate); pos = np.clip(pos, 0, len(seg) - 2)
    i = pos.astype(int); f = (pos - i)[:, None]
    y = seg[i] * (1 - f) + seg[i + 1] * f
    y *= (1 - u[:, None] ** 2)
    x[s0:] = 0; x[s0:s0 + len(y)] = y
    return x
music = tapestop(music, STOP0)
# rewind: the countdown's music reversed and sped up ×4
seg_ = music[int(T0 * SR):int(T1 * SR)][::-1]
fast = soxr.resample(seg_, SR, SR / 4.2).astype(np.float32)
fast = fast[:int((REW1 - REW0) * SR)]
fade = np.minimum(1, np.minimum(np.arange(len(fast)) / (.15 * SR), (len(fast) - np.arange(len(fast))) / (.4 * SR)))[:, None]
add(music, (lp(fast[:, 0] * fade[:, 0], 5000)), REW0, .5, -.2); add(music, (lp(fast[:, 1] * fade[:, 0], 5000)), REW0, .5, .2)

# ——— Foley & ambience ———
fx = buf()
def city_bed(d, v=1.0):
    x = lp(brown(d), 600) * .5 + bp(noise(d), 300, 2500) * .05
    return norm(x, .25 * v)
def bird(v=1.0):
    out = np.zeros(int(.5 * SR), np.float32)
    for k in range(3):
        d = .07 + rng.random() * .05; tt = t_(d); f = 3400 + 1800 * np.sin(np.pi * tt / d) + rng.random() * 500
        ch = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d)
        s = int((.03 + k * .13) * SR); out[s:s + len(ch)] += ch[:len(out) - s]
    return out * .3 * v
def brake(v=1.0):
    d = 1.1; tt = t_(d); x = bp(noise(d), 2500, 7000) * np.exp(-tt / .35) * .4 + np.sin(2 * np.pi * 180 * tt) * np.exp(-tt / .2) * .1
    return (x * v).astype(np.float32)
def beeps(n=6):
    out = np.zeros(int(n * .5 * SR), np.float32)
    for k in range(n): d = .08; s = int(k * .5 * SR); out[s:s + int(d * SR)] += np.sin(2 * np.pi * 2800 * t_(d)) * .15
    return out
def cheer(d=1.6):
    tt = t_(d); return (bp(noise(d), 600, 4000) * np.sin(np.pi * tt / d) ** 2 * .35).astype(np.float32)
def kids(d=1.2):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(10):
        dd = .12 + rng.random() * .1; tt = t_(dd); f = 600 + rng.random() * 500 + 300 * np.sin(np.pi * tt / dd)
        s = int(rng.random() * (d - dd) * SR); out[s:s + len(tt)] += (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * tt / dd) * .05
    return lp(out, 3500)
def siren(d=1.2):
    tt = t_(d); f = np.where((tt * 3 % 1) < .5, 950, 750); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * .12 * np.minimum(1, (d - tt) / .2)).astype(np.float32)
def buzz(d=1.2):
    tt = t_(d); f = 110 + 10 * np.sin(tt * 30); ph = np.cumsum(f) / SR; return lp(((ph % 1) * 2 - 1) * .15 * np.sin(np.pi * tt / d), 1800)
def coins(n=8):
    out = np.zeros(int(1.2 * SR), np.float32)
    for k in range(n): s = int(rng.random() * .9 * SR); c = ding(.4) * .5; out[s:s + len(c)] += c[:len(out) - s]
    return hp(out, 2500)
def buzzer(d=.6):
    tt = t_(d); return lp(np.sign(np.sin(2 * np.pi * 220 * tt)) * .25 * np.minimum(1, (d - tt) / .05), 3000)
def hiss_bed(d):
    tt = t_(d); return (bp(noise(d), 1500, 9000) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 8 * tt))) * .035).astype(np.float32)

# hook and outro ambience: morning city, birds, a bus braking, crosswalk beeps
add(fx, city_bed(T0 + .3), 0, 1.0); add(fx, city_bed(DUR - REW1), REW1, 1.0)
for t in [.4, 2.2, 3.6]: add(fx, bird(), t, .6, .3)
for t in [REW1 + .8, REW1 + 4.0, REW1 + 7.5, REW1 + 9.3]: add(fx, bird(), t, .55, -.3)
for t in [2.6, REW1 + 2.5]: add(fx, beeps(4), t, .7, .4)
for e in EV['ev']:
    t, ty = e['t'], e['type']
    if ty == 'busBrake': add(fx, brake(), t, .8, .5)
    if ty == 'riser':
        d = T0 - t; tt = t_(d); add(fx, bp(noise(d), 800, 9000) * (tt / d) ** 2.5 * .3, t, 1.0)
    if ty == 'pop':
        i = e['i']; add(fx, thump(.9, 90), t, .7); add(fx, pop(1.0), t + .01, .5)
        extra = {0: cheer(), 1: coins(), 2: coins(10), 3: kids(), 4: coins(6), 5: cheer(1.2) * .6, 7: siren(), 8: buzz(), 9: cheer(1.4) * .5}.get(i)
        if extra is not None: add(fx, extra, t + .15, .9, .2 * (1 if i % 2 else -1))
    if ty == 'tick': add(fx, click(1.6 if e.get('last') else 1.2, .7 if e.get('last') else .35), t, .5)
    if ty == 'buzzer': add(fx, buzzer(), t, .7)
    if ty == 'whooshUp': add(fx, whoosh(1.6, 1.0), t + .1, .5)
    if ty == 'bird': add(fx, bird(), t, .9, -.2)
    if ty == 'rewind':
        d = REW1 - REW0; w = whoosh(d, 1.0)[::-1].copy(); add(fx, w, t, .6)
        tt = t_(d); add(fx, bp(noise(d), 2000, 8000) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 8 * tt))) * .08, t, 1.0)
add(fx, hiss_bed(T1 - T0), T0, 1.0)

# ——— Voice ———
vo = buf()
for e in EV['ev']:
    if e['type'] != 'vo': continue
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav'), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = soxr.resample(x, sr, SR).astype(np.float32)
    x = compress(x / (np.abs(x).max() + 1e-9) * .9, .2, 3.5)
    add(vo, x, e['t'], 1.0, 0)
# music ducked ~8 dB under the voice (smooth envelope)
venv = np.abs(vo[:, 0]); k = int(.12 * SR)
venv = np.convolve(venv, np.ones(k) / k, 'same'); duck = 1 - .6 * np.clip(venv / (venv.max() * .15 + 1e-9), 0, 1)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2)) if np.any(np.abs(x) > 1e-4) else 1
music *= (.32 / rms(music))
vo *= (.32 * 10 ** (10 / 20) / rms(vo)) * .34
mix = music * duck[:, None] + fx * .8 + vo
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix, SR)
sf.write(os.path.join(HERE, 'out', 'music.wav'), music, SR)
print('mix', mix.shape, 'peak', float(np.abs(mix).max()))
