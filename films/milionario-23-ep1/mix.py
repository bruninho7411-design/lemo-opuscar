"""Score (synthesized, from the cue sections in events.json) + foley + ambience + voices → out/mix.wav (48 kHz stereo).
Run core/render/events.mjs and voice.py first."""
import os, sys, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, click, whoosh, pop, ding, thump, crash, compress, limit, add
from scipy.ndimage import uniform_filter1d

E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(DUR * SR) + SR
EV = E['ev']; rng = np.random.default_rng(23)
def evs(tp): return [e for e in EV if e['type'] == tp]
CUE = {e['id']: e for e in evs('cue')}
VO = evs('vo'); VOT = {e['id']: e['t'] for e in VO}
def buf(): return np.zeros((N, 2))
music, sfx_, amb, vox = buf(), buf(), buf(), buf()
BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT
def f(m): return 440 * 2 ** ((m - 69) / 12)
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def mid(s):
    n = NOTE[s[0]]; i = 1
    if s[i] in '#b': n += 1 if s[i] == '#' else -1; i += 1
    return n + 12 * (int(s[i:]) + 1)
def fade(x, a=.004, r=.03):
    x = x.copy(); n = len(x); A, R = min(n, int(a * SR)), min(n, int(r * SR)); x[:A] *= np.linspace(0, 1, A); x[n - R:] *= np.linspace(1, 0, R); return x

# —— instruments ——
def theremin(m0, m1, d, v=1., vib=1.):
    tt = t_(d); fr = f(m1) + (f(m0) - f(m1)) * np.exp(-tt / .07)
    fr = fr * (1 + .012 * vib * np.sin(2 * np.pi * 5.6 * tt) * np.clip((tt - .15) / .2, 0, 1))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    x = np.sin(ph) + .18 * np.sin(2 * ph) + .08 * np.sin(3 * ph)
    return fade(x * v, .03, .12)
def abass(m, d, v=1.):
    tt = t_(d); ph = 2 * np.pi * f(m) * tt
    x = sum(np.sin(k * ph) / k for k in range(1, 7)) * env_exp(d, .5)
    return fade(lp(x, 900) * v, .003, .04)
def pluck(m, d=1.2, v=1.):
    tt = t_(d); ph = 2 * np.pi * f(m) * tt
    x = sum(np.sin(k * ph) * np.exp(-tt * (2.5 + k * 1.6)) / k ** 1.2 for k in range(1, 9))
    x[:int(.004 * SR)] += bp(noise(.004), 2000, 6000) * .3
    return fade(x * v, .001, .05)
def sq(m, d, v=1.):
    tt = t_(d); x = np.sign(np.sin(2 * np.pi * f(m) * tt)) * env_exp(d, .09)
    return fade(lp(x, 3500) * v * .35, .002, .02)
def kick(v=1.): d = .3; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-tt / .04)) / SR) * env_exp(d, .12) * v
def snare(v=1.): d = .2; return (bp(noise(d), 1200, 6000) * env_exp(d, .05) * .7 + np.sin(2 * np.pi * 190 * t_(d)) * env_exp(d, .04) * .5) * v
def hat(v=1.): d = .05; return hp(noise(d), 7000) * env_exp(d, .012) * v * .5
def rim(v=1.): d = .04; return bp(noise(d), 1500, 4000) * env_exp(d, .006) * v + np.sin(2 * np.pi * 900 * t_(d)) * env_exp(d, .01) * v * .5
def brush(v=1.): d = .25; return lp(hp(noise(d), 2000), 8000) * np.sin(np.pi * t_(d) / d) * v * .25
def put(x, at, g=1., pan=0.):
    if at < DUR + 1: add(music, x, at, g, pan)

# chords (i–VI–VII–V in D minor) and a theremin theme with a chromatic fall
PROG = [('D', [50, 53, 57, 62]), ('Bb', [46, 50, 53, 58]), ('C', [48, 52, 55, 60]), ('A', [45, 49, 52, 57])]
THEME = [(0, 74, 1.5), (1.5, 73, .5), (2, 72, 1), (3, 70, 1), (4, 69, 2), (6, 65, 1), (7, 67, 1), (8, 69, 1.5), (9.5, 70, .5), (10, 72, 1), (11, 74, 1), (12, 73, 3), (15, 69, 1)]
def section(t0, t1, fn):
    nb = int(np.ceil((t1 - t0) / BAR))
    for b in range(nb):
        tb = t0 + b * BAR
        if tb >= t1: break
        fn(b, tb, PROG[b % 4], t1)
def cut_tail(t1):   # hard cut: zero the music after t1 (reverb tails included)
    i = int(t1 * SR); n = int(.01 * SR); music[i:i + n] *= np.linspace(1, 0, n)[:, None]; music[i + n:] = 0

# open: lazy sitcom underscore (bass + brushes + sparse theremin); drops out under "Claro."
c = CUE['open']
def s_open(b, tb, ch, t1):
    for k, bt in enumerate([0, 1.5, 2, 3]):
        if tb + bt * BEAT < t1: put(abass(ch[1][0] - 12 + (7 if k == 2 else 0), BEAT * .9, .6), tb + bt * BEAT)
    for k in range(4): put(brush(.8), tb + k * BEAT, 1, .3); put(rim(.35), tb + (k + .5) * BEAT, 1, -.3) if k % 2 else None
    if b in (0, 1): [put(theremin(m - 1, m, d * BEAT, .32), tb + (s - 8 * (b == 1)) * BEAT, 1, .1) for s, m, d in THEME if b * 4 <= s < b * 4 + 4]
section(c['t'], c['t1'], s_open)
# mute under "Claro." up to the swirl (room tone only), before the glide is laid in
i0, i1, n = int((VOT['y1'] - .35) * SR), int(c['t1'] * SR), int(.08 * SR)
music[i0:i0 + n] *= np.linspace(1, 0, n)[:, None]; music[i0 + n:i1] = 0
# swirl glide into the phone
rise = evs('rise')[0]
put(theremin(62, 86, rise['d'] + .3, .45, vib=0), rise['t'])
# l18: elevator bossa (plucked nylon, bass, rim) → hard cut at the silence
c = CUE['l18']
def s_l18(b, tb, ch, t1):
    for bt in [0, 1.5, 2.5, 3]:
        if tb + bt * BEAT < t1: [put(pluck(m + 12, 1.0, .25), tb + bt * BEAT + i * .012, 1, -.25) for i, m in enumerate(ch[1][1:])]
    for bt, dm in [(0, 0), (1.5, 7), (2, 7), (3.5, 0)]:
        if tb + bt * BEAT < t1: put(abass(ch[1][0] - 12 + dm, BEAT * .8, .55), tb + bt * BEAT)
    for k in [0, .75, 1.5, 2.5, 3.25]: put(rim(.4), tb + k * BEAT, 1, .3)
    for k in range(8): put(hat(.35), tb + k * BEAT / 2, 1, .2)
section(c['t'], c['t1'], s_l18)
cut_tail(c['t1'])
# y19: square arpeggio + drum machine + a muffled party bass
c = CUE['y19']
def s_y19(b, tb, ch, t1):
    for k in range(16):
        tk = tb + k * BEAT / 4
        if tk < t1: put(sq(ch[1][k % 4] + 12 + (12 if k % 8 > 5 else 0), BEAT / 4 * .9, .5), tk, 1, (-.4 if k % 2 else .4))
    for k in range(4):
        if tb + k * BEAT < t1: put(lp(kick(.9), 400), tb + k * BEAT); put(hat(.4), tb + (k + .5) * BEAT, 1, .2)
        if k % 2 and tb + k * BEAT < t1: put(snare(.5), tb + k * BEAT, 1, -.1)
    for bt in [0, .75, 2, 2.75]:
        if tb + bt * BEAT < t1: put(lp(abass(ch[1][0] - 12, BEAT * .6, .7), 220), tb + bt * BEAT)
section(c['t'], c['t1'], s_y19)
# l21: main theme, building; machine-gun stingers on the store cuts
c = CUE['l21']
def s_l21(b, tb, ch, t1):
    for k in range(8):
        tk = tb + k * BEAT / 2
        if tk < t1: put(abass(ch[1][0] - 12 + (12 if k % 4 == 3 else 0), BEAT * .45, .7), tk)
    for k in range(4):
        if tb + k * BEAT < t1: put(kick(.9), tb + k * BEAT); put(hat(.45), tb + (k + .5) * BEAT, 1, .2)
        if k % 2 and tb + k * BEAT < t1: put(snare(.6), tb + k * BEAT, 1, -.1)
    for k in range(8):
        tk = tb + k * BEAT / 2
        if tk < t1 and b >= 1: put(sq(ch[1][(k * 3) % 4] + 12, BEAT / 2 * .8, .35), tk, 1, .35)
    for s, m, d in THEME:
        ts = tb + (s - 4 * (b % 4)) * BEAT
        if 4 * (b % 4) <= s < 4 * (b % 4) + 4 and ts < t1: put(theremin(m - 2, m, min(d * BEAT, t1 - ts), .42), ts, 1, -.05)
section(c['t'], c['t1'], s_l21)
for e in evs('crash'):
    for m in [62, 65, 69, 74]: put(sq(m, .3, .8), e['t']); put(theremin(m, m, .3, .25), e['t'])
# home: theme reprise, softer, hard cut before the buzz
c = CUE['home']
def s_home(b, tb, ch, t1):
    for bt in [0, 2]:
        if tb + bt * BEAT < t1: put(abass(ch[1][0] - 12, BEAT * 1.8, .55), tb + bt * BEAT)
    for k in range(4): put(brush(.7), tb + k * BEAT, 1, .3)
    for s, m, d in THEME:
        ts = tb + (s - 4 * (b % 4)) * BEAT
        if 4 * (b % 4) <= s < 4 * (b % 4) + 4 and ts < t1: put(theremin(m - 1, m, min(d * BEAT, t1 - ts), .3), ts, 1, .05)
section(c['t'], c['t1'], s_home)
cut_tail(c['t1'])
# end: sting + soft pad
c = CUE['end']
put(theremin(50, 74, 1.4, .5), c['t']); [put(sq(m, .5, .6), c['t'] + .02) for m in [62, 66, 69, 74]]
for b in range(4):
    tb = c['t'] + 1.2 + b * BAR / 2
    if tb < DUR - .5: [put(pluck(m + 12, 1.6, .2), tb + i * .03, 1, (i - 1.5) * .2) for i, m in enumerate(PROG[b % 4][1])]

# —— voices ——
for e in VO:
    p = os.path.join(HERE, 'voices', 'p', e['id'] + '.wav')
    if os.path.exists(p): y, _ = sf.read(p); add(vox, y, e['t'], 1.0, -.03 if e['who'] == 'c' else 0)
# duck music ~7 dB under dialogue
act = uniform_filter1d((np.abs(vox).max(1) > .02).astype(float), int(.25 * SR))
act = uniform_filter1d(np.minimum(1, act * 3), int(.15 * SR))
music *= (1 - .55 * act)[:, None]

# —— ambience ——
def room(d, v=.05): return lp(brown(d), 300) * v
for e in evs('amb'):
    d, t0, w = e['d'], e['t'], e['w']
    if w in ('sofa', 'sofa2'):
        x = room(d, .06) + np.sin(2 * np.pi * 120 * t_(d)) * .006 + np.sin(2 * np.pi * 60 * t_(d)) * .01
        add(amb, x, t0, 1, 0)
        for k in range(int(d)):
            tt = np.ceil(t0) + k
            if tt < t0 + d: add(amb, click(1.6, .25), tt, .25, .45)
    elif w in ('l18', 'l21'):
        tt = t_(d); x = lp(brown(d), 160) * (1 + .4 * np.sin(2 * np.pi * .9 * tt)) * .12 + hp(np.sin(2 * np.pi * 120 * tt) * .5 + np.sin(2 * np.pi * 240 * tt) * .3, 100) * .008
        add(amb, x, t0, 1, 0)
    elif w == 'y19':
        add(amb, room(d, .04), t0, 1, 0)

# —— foley ——
def S(x, at, g=1., pan=0.): add(sfx_, x, at, g, pan)
def sweep(f0, f1, d): tt = t_(d); fr = f0 * (f1 / f0) ** (tt / d); return np.sin(2 * np.pi * np.cumsum(fr) / SR)
def shimmer(): d = .8; tt = t_(d); return sum(np.sin(2 * np.pi * fq * tt) * np.exp(-tt / .3) * (rng.random() * .5 + .5) for fq in [2093, 2637, 3136, 4186]) * .25
def kaching(v=1):
    x = np.zeros(int(1.6 * SR)); add_mono(x, ding(v) * .6, 0)
    for i, fq in enumerate([1568, 2093, 2637]): tt = t_(.6); s = np.sin(2 * np.pi * fq * tt) * np.exp(-tt / .18); j = int((.06 + i * .05) * SR); x[j:j + len(s)] += s * .4 * v
    c = click(1.2, v); x[:len(c)] += c * .5; return x
def clink(v=1): d = .25; tt = t_(d); return sum(np.sin(2 * np.pi * fq * tt) * np.exp(-tt / .05) for fq in [3200, 4700, 6100]) * .3 * v
def slurp(): d = .7; tt = t_(d); return bp(noise(d), 600, 2500) * (.5 + .5 * np.sin(2 * np.pi * 9 * tt)) * np.sin(np.pi * tt / d) * .4
def squeak(): d = .12; tt = t_(d); return np.sin(2 * np.pi * (1500 + 400 * np.sin(2 * np.pi * 25 * tt)) * tt) * np.sin(np.pi * tt / d) * .3
def swirl(): d = .7; tt = t_(d); w = whoosh(.6, 1.0); s = sweep(200, 1400, d) * np.sin(np.pi * tt / d) * .3; y = np.zeros(int(d * SR)); y[:len(w)] += w; return y + s
def boing(): d = .45; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(300 + 120 * np.sin(2 * np.pi * 12 * tt) * np.exp(-tt / .15)) / SR) * np.exp(-tt / .15) * .6
def tlim(): d = .9; tt = t_(d); return (np.sin(2 * np.pi * 2349 * tt) + .5 * np.sin(2 * np.pi * 3520 * tt)) * np.exp(-tt / .25) * .6
def jangle(v=1): d = .4; y = np.zeros(int(d * SR)); [add_mono(y, clink(.7 * v), rng.random() * .25) for _ in range(6)]; return y
def add_mono(y, x, at): i = int(at * SR); n = min(len(x), len(y) - i); y[i:i + n] += x[:n]
def squeeze(): d = .3; tt = t_(d); return bp(noise(d), 300, 1200) * np.sin(np.pi * tt / d) * .4
def snore(d): tt = t_(d); return lp(brown(d), 250) * np.maximum(0, np.sin(2 * np.pi * .45 * tt)) ** 2 * .5
def buzz(d): tt = t_(d); return np.sign(np.sin(2 * np.pi * 150 * tt)) * lp(np.abs(np.sin(2 * np.pi * 6 * tt)), 50) * .25
def gulp(): d = .25; return sweep(420, 110, d) * env_exp(d, .07) * .7
def sparkle(): y = np.zeros(int(.6 * SR)); [add_mono(y, np.sin(2 * np.pi * f(m) * t_(.3)) * np.exp(-t_(.3) / .08) * .3, i * .05) for i, m in enumerate([84, 88, 91, 96])]; return y
def steps(d): y = np.zeros(int((d + .3) * SR)); [add_mono(y, thump(.4, 120), k * .32) for k in range(int(d / .32) + 1)]; return y
for e in EV:
    t0, tp, v = e['t'], e['type'], e.get('v', 1)
    if tp == 'slurp': S(slurp(), t0, v)
    elif tp == 'shimmer': S(shimmer(), t0, .6 * v, .2)
    elif tp == 'cut': S(whoosh(.18, .5), t0 - .06, .5 * v)
    elif tp == 'squeak': S(squeak(), t0, v, -.3)
    elif tp == 'whoosh': S(whoosh(.35, 1), t0 - .1, .6 * v)
    elif tp == 'rise': S(sweep(300, 2400, e['d']) * np.linspace(0, 1, int(round(e['d'] * SR))) * .15, t0, 1)
    elif tp == 'swirl': S(swirl(), t0, .8)
    elif tp == 'kaching': S(kaching(v), t0, .38, .15)
    elif tp == 'steps': S(steps(e['d']), t0, .7, -.3)
    elif tp == 'clink': S(clink(v), t0, 1, -.2)
    elif tp == 'tlim': S(tlim(), t0, .5)
    elif tp == 'boing': S(boing(), t0, v)
    elif tp == 'jarcoin': S(clink(.8), t0, 1, -.2); S(thump(.2, 300), t0, .5)
    elif tp == 'pop': S(pop(v), t0, .8)
    elif tp == 'click': S(click(1.0, 1), t0, .9)
    elif tp == 'sparkle': S(sparkle(), t0, .6)
    elif tp == 'jangle': S(jangle(v), t0, .8)
    elif tp == 'squeeze': S(squeeze(), t0, .7)
    elif tp == 'snore': S(snore(e['d']), t0, .5)
    elif tp == 'crash': S(thump(1, 60), t0, .6); S(whoosh(.25, 1), t0 - .2, .6)
    elif tp == 'ding': S(kaching(1.2), t0, .55); S(shimmer(), t0, .45)
    elif tp == 'buzz': S(buzz(e['d']), t0, .8)
    elif tp == 'gulp': S(gulp(), t0, .8)
    elif tp == 'sting': S(whoosh(.4, 1), t0 - .15, .5)

# —— balance: voice ~10 dB over music ——
def rms(x): return np.sqrt((x ** 2).mean() + 1e-12)
vm = vox[np.abs(vox).max(1) > .02]
vr = rms(vm) if len(vm) else .1
mm = music[np.abs(music).max(1) > .005]
music *= (vr / 3.2) / (rms(mm) + 1e-9)
amb *= 1.0
mix = vox + music + sfx_ * .55 + amb
mix = mix[:int(DUR * SR)]
mix = limit(mix / (np.abs(mix).max() + 1e-9) * .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
for nm, x in [('music', music), ('sfx', sfx_), ('amb', amb), ('vox', vox)]: print(nm, round(20 * np.log10(rms(x[:int(DUR * SR)]) + 1e-9), 1), 'dBFS rms')
print('mix', DUR, 's')
