"""Original score + SFX + voice mix for the Cidade do Insta reel.
Run from the lemo-opuscar root (uses core/audio sampler + sfx)."""
import sys, json, subprocess
sys.path.insert(0, '.')
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add
def W(t): return t

PROJ = '/home/user/ep17'
DUR = 47.74
S.seed(11)

BPM = 116
B = 60 / BPM
BAR = 4 * B
CH = [  # (root midi, chord tones)
    ('C', [48, 'C4', 'E4', 'G4'], ['C5', 'E5', 'G5', 'E5']),
    ('G', [43, 'B3', 'D4', 'G4'], ['B4', 'D5', 'G5', 'D5']),
    ('Am', [45, 'C4', 'E4', 'A4'], ['A4', 'C5', 'E5', 'C5']),
    ('F', [41, 'C4', 'F4', 'A4'], ['A4', 'C5', 'F5', 'C5']),
]

def level(t):
    """section energy 0..1"""
    if t < 46.3: return 1.0
    return 0.0

ev = []
nbars = int(np.ceil(46.3 / BAR))
for bi in range(nbars):
    name, (root, *tri), arp = CH[bi % 4]
    t0 = bi * BAR
    for k in range(8):  # eighth-note grid
        t = t0 + k * B / 2
        if t >= 46.3: break
        L = level(t)
        if L <= 0: continue
        beat = k / 2
        # bass
        if k in (0, 3, 4, 7):
            p = root + (12 if k == 7 else 0) + (7 if k == 3 else 0)
            ev.append((t, 'electric_bass', p, B * 0.45, 0.75, 0.0, 0.9 * max(L, 0.5)))
        # cajon kick on 1 and 3, claps on 2 and 4
        if L >= 0.6 and k in (0, 4):
            ev.append((t, 'cajon', 'bass', None, 0.8, 0.0, 0.9))
        if L >= 0.6 and k in (2, 6):
            ev.append((t, 'claps', 'solo', None, 0.55, 0.1, 0.55))
        # shaker on every eighth
        ev.append((t, 'shaker', 'down' if k % 2 == 0 else 'up', None, 0.35 if k % 2 else 0.5, -0.3, 0.45 * max(L, 0.4)))
        # ukulele off-beat skank
        if L >= 0.6 and k % 2 == 1:
            ev.append(dict(t=t, inst='ukulele', pitch=tri[0], dur=0.22, vel=0.6, pan=0.35, gain=0.55))
            ev.append(dict(t=t + 0.012, inst='ukulele', pitch=tri[1], dur=0.22, vel=0.6, pan=0.35, gain=0.5))
            ev.append(dict(t=t + 0.024, inst='ukulele', pitch=tri[2], dur=0.22, vel=0.6, pan=0.35, gain=0.5))
        # marimba arpeggio
        if L >= 0.6 or (L > 0 and k in (0, 4)):
            ev.append((t, 'marimba', arp[k % 4], B * 0.5, 0.55 if k % 2 == 0 else 0.42, -0.2, 0.7 * L + 0.2))

# glockenspiel hook (intro, first vote, poll)
HOOK = [(0, 'G5'), (0.5, 'C6'), (1.0, 'E6'), (1.5, 'G6'), (2.0, 'E6'), (3.0, 'C6')]
for start in (0.3, 12.3, 30.78, 41.0):
    for bt, n in HOOK:
        ev.append((start + bt * B, 'glockenspiel', n, B, 0.55, 0.25, 0.5))
for i, n in enumerate(['C6', 'G5', 'E6', 'C6', 'G6']):
    ev.append((12.3 + i * 0.09, 'glockenspiel', n, 0.4, 0.6, 0.2, 0.55))
ev.append((0.28, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0)); ev.append((2.44, 'gran_cassa', 'hit', None, 0.8, 0.0, 0.8))
for i, n in enumerate(['G5', 'E5', 'C5', 'G4']):
    ev.append((46.34 + i * 0.09, 'xylophone', n, 0.3, 0.6, 0.0, 0.5))
music = S.render(ev, dur=DUR)
music = S.room(music, size=0.3, mix=0.12)

# ---- SFX ----
fx = np.zeros((int(DUR * SR), 2), np.float32)
_add = add
def add(buf, x, t, g):
    _add(buf, x, t + 10.14 if t >= 30.66 else t, g)
cuts = [2.24, 4.14, 7.88, 9.38, 10.28, 11.32, 12.3, 15.34, 21.6, 24.68, 28.96, 30.86, 35.46, 37.0]
for c in cuts:
    add(fx, X.whoosh(0.3, 0.5), c - 0.18, 0.24)
rng_ = np.random.default_rng(5)
def crowd(d, v=0.5, swell=True):
    n = int(d * SR)
    w = rng_.standard_normal(n).astype(np.float32)
    w = np.convolve(w, np.ones(12) / 12, mode='same')
    tt = np.arange(n) / SR
    am = 1 + 0.25 * np.sin(2 * np.pi * 3.1 * tt) + 0.15 * np.sin(2 * np.pi * 5.3 * tt)
    env = np.minimum(1, tt * (8 if swell else 30)) * np.minimum(1, (d - tt) * 2)
    return w * am * env * v * 3
def kick():
    return X.thump(1.4, 90)
# hook: kick, net, roar
add(fx, kick(), 0.0, 0.6); add(fx, X.whoosh(0.5, 0.9), 0.02, 0.4)
add(fx, X.thump(0.8, 50), 0.28, 0.9); add(fx, crowd(2.4), 0.25, 0.75)
add(fx, kick(), 37.0, 0.5); add(fx, crowd(0.6), 37.0, 0.4)
add(fx, X.ding(1.0), 2.44, 0.45); add(fx, S.hit('claps', 'group', 0.9), 2.6, 0.5)
add(fx, X.pop(1.0), 5.24, 0.4); add(fx, X.ding(1.2), 5.28, 0.35); add(fx, kick(), 7.2, 0.5)
add(fx, X.thump(0.9, 55), 8.06, 0.7)
r2 = np.random.default_rng(9)
for (a0, a1, n) in ((8.16, 8.5, 10), (10.32, 11.32, 44)):
    for i in range(n):
        tc = a0 + (a1 - a0) * i / n + r2.uniform(0, 0.01)
        add(fx, X.click(1.3 + r2.uniform(0, 0.8), 0.6), tc, 0.22 + r2.uniform(0, 0.1))
for tl in (8.97, 9.86, 9.98, 11.74, 11.84, 11.94, 12.04, 12.19):
    add(fx, X.thump(0.9, 60), tl, 0.5); add(fx, X.click(1.0, 0.8), tl, 0.3)
add(fx, crowd(3.0, 0.4), 12.0, 0.5)
add(fx, X.ding(1.0), 12.3, 0.45)
for i in range(3):
    add(fx, X.pop(1.1), 13.4 + i * 0.3, 0.4)
for tb in (17.48, 17.96, 18.48, 20.3):
    add(fx, X.pop(1.2), tb, 0.45); add(fx, X.ding(1.3), tb + 0.02, 0.25)
add(fx, X.pop(1.0), 21.7, 0.4); add(fx, X.ding(1.0), 22.72, 0.35)
for i in range(6):
    add(fx, X.click(1.8, 0.5), 27.25 + i * 0.07, 0.2)
add(fx, X.ding(1.0), 28.0, 0.4)
for i in range(5):
    add(fx, X.click(1.8, 0.5), 32.3 + i * 0.7, 0.2)
# own goal: kick + groan
add(fx, kick(), 35.46, 0.5); add(fx, X.thump(0.8, 50), 36.16, 0.8)
tt_ = np.arange(int(0.9 * SR)) / SR
groan = np.convolve(np.random.default_rng(2).standard_normal(len(tt_)).astype(np.float32), np.ones(60) / 60, mode='same') * 6 * np.exp(-tt_ * 2.5)
add(fx, groan, 36.2, 0.5)

_add(fx, X.whoosh(0.3, 0.5), 30.48, 0.24)
for tb in (32.26, 32.92, 33.56, 34.22):
    _add(fx, X.pop(1.2), tb, 0.45); _add(fx, X.ding(1.3), tb + 0.02, 0.25)
for tb in (34.9, 35.38, 36.74):
    _add(fx, X.pop(1.0), tb, 0.5); _add(fx, X.click(1.2, 1.0), tb, 0.3)
for i in range(12):
    _add(fx, X.click(1.6, 0.5), 37.5 + i * 0.2, 0.15)
_add(fx, X.ding(1.0), 39.9, 0.45); _add(fx, S.hit('claps', 'group', 0.9), 40.0, 0.45)
add = _add
# ---- voice ----
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{PROJ}/work/vo2.wav', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
vo = np.frombuffer(raw, np.float32).copy()
vo = X.compress(vo / (np.abs(vo).max() + 1e-9) * 0.9, thr=0.3, ratio=3)
vbuf = np.zeros((int(DUR * SR), 2), np.float32)
add(vbuf, vo, 0.0, 1.0)

# duck music under the voice
env = np.abs(vbuf[:, 0])
win = int(0.12 * SR)
env = np.convolve(env, np.ones(win) / win, mode='same')
env = env / (env.max() + 1e-9)
duck = 1 - 0.62 * np.clip(env * 4, 0, 1)
music = music[: len(duck)] * duck[:, None] * 0.36

mix = vbuf + music + fx * 0.9
mix = X.limit(mix, ceil=0.95)
sf.write(f'{PROJ}/work/mix_pre.wav', mix, SR)
sf.write(f'{PROJ}/work/music.wav', music, SR)
print('ok', mix.shape, float(np.abs(mix).max()))
print(S.credits(['marimba', 'glockenspiel', 'xylophone', 'ukulele', 'electric_bass', 'cajon', 'claps', 'shaker', 'gran_cassa']))
