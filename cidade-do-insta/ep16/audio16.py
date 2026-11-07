"""Original score + SFX + voice mix for the Cidade do Insta reel.
Run from the lemo-opuscar root (uses core/audio sampler + sfx)."""
import sys, json, subprocess
sys.path.insert(0, '.')
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add
def W(t): return t

PROJ = '/home/user/ep16'
DUR = 49.1
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
    if t < 47.2: return 1.0
    return 0.0

ev = []
nbars = int(np.ceil(47.2 / BAR))
for bi in range(nbars):
    name, (root, *tri), arp = CH[bi % 4]
    t0 = bi * BAR
    for k in range(8):  # eighth-note grid
        t = t0 + k * B / 2
        if t >= 47.2: break
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
for start in (2.78, 14.5, 23.1, 41.78):
    for bt, n in HOOK:
        ev.append((start + bt * B, 'glockenspiel', n, B, 0.55, 0.25, 0.5))
for i, n in enumerate(['C6', 'G5', 'E6', 'C6', 'G6']):
    ev.append((14.5 + i * 0.09, 'glockenspiel', n, 0.4, 0.6, 0.2, 0.55))
ev.append((0.0, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0)); ev.append((5.36, 'gran_cassa', 'hit', None, 0.8, 0.0, 0.8))
for i, n in enumerate(['G5', 'E5', 'C5', 'G4']):
    ev.append((47.3 + i * 0.09, 'xylophone', n, 0.3, 0.6, 0.0, 0.5))
music = S.render(ev, dur=DUR)
music = S.room(music, size=0.3, mix=0.12)

# ---- SFX ----
fx = np.zeros((int(DUR * SR), 2), np.float32)
cuts = [1.34, 2.78, 6.38, 10.3, 11.36, 12.22, 13.06, 13.82, 14.5, 17.18, 20.42, 22.48, 35.04, 37.0, 39.76, 41.78, 46.56, 48.5]
for c in cuts:
    add(fx, X.whoosh(0.3, 0.5), c - 0.18, 0.24)
rng_ = np.random.default_rng(5)
def siren(d, v=0.35):
    tt = np.arange(int(d * SR)) / SR
    f = np.where((tt * 2.5) % 1 < 0.5, 960, 770)
    ph = np.cumsum(2 * np.pi * f / SR)
    return (np.sin(ph) * 0.6 + np.sin(2 * ph) * 0.2) * v * np.minimum(1, tt * 8) * np.minimum(1, (d - tt) * 4)
def crackle(d, v=0.6):
    n = int(d * SR); out = np.zeros(n, np.float32)
    for i in range(int(d * 40)):
        p = rng_.integers(0, n - 400); out[p:p + 400] += rng_.standard_normal(400).astype(np.float32) * np.exp(-np.arange(400) / 60) * rng_.uniform(0.3, 1)
    low = np.convolve(rng_.standard_normal(n).astype(np.float32), np.ones(200) / 200, mode='same') * 4
    return (out * 0.5 + low) * v
def hiss(d, v=0.4):
    n = rng_.standard_normal(int(d * SR)).astype(np.float32)
    n = n - np.convolve(n, np.ones(8) / 8, mode='same')
    tt = np.arange(len(n)) / SR
    return n * v * np.minimum(1, tt * 6) * np.minimum(1, (d - tt) * 6)
add(fx, crackle(2.2), 0.0, 0.6); add(fx, siren(2.6, 0.3), 0.2, 0.35); add(fx, X.thump(1.0, 50), 0.0, 0.6)
add(fx, X.whoosh(1.0, 0.9), 0.7, 0.55)
add(fx, hiss(1.5), 1.4, 0.5)
add(fx, crackle(0.6), 48.5, 0.6); add(fx, siren(0.6, 0.3), 48.5, 0.3)
add(fx, crackle(1.3), 47.2, 0.6); add(fx, X.thump(0.8, 45), 47.2, 0.7)
add(fx, X.ding(1.0), 5.36, 0.45); add(fx, S.hit('claps', 'group', 0.9), 5.5, 0.5)
add(fx, X.pop(1.0), 7.74, 0.4); add(fx, X.ding(1.2), 7.78, 0.35)
add(fx, X.thump(0.9, 55), 10.46, 0.7)
r2 = np.random.default_rng(9)
for (a0, a1, n) in ((10.56, 10.9, 10), (11.36, 12.26, 36), (13.14, 13.54, 16)):
    for i in range(n):
        tc = a0 + (a1 - a0) * i / n + r2.uniform(0, 0.01)
        add(fx, X.click(1.3 + r2.uniform(0, 0.8), 0.6), tc, 0.22 + r2.uniform(0, 0.1))
for tl in (12.55, 13.78, 13.97, 14.07):
    add(fx, X.thump(0.9, 60), tl, 0.55); add(fx, X.click(1.0, 0.8), tl, 0.3)
add(fx, siren(0.8, 0.25), 13.8, 0.3)
add(fx, X.ding(1.0), 14.5, 0.45); add(fx, S.hit('claps', 'group', 0.9), 14.55, 0.5)
for i in range(3):
    add(fx, X.pop(1.1), 15.3 + i * 0.3, 0.4)
add(fx, X.whoosh(1.2, 0.8), 17.3, 0.4); add(fx, X.ding(1.2), 18.6, 0.4)
for i in range(12):
    add(fx, X.pop(1.3), 20.7 + i * 0.07, 0.22)
add(fx, X.ding(1.0), 23.1, 0.45)
for tb in (28.32, 29.38, 30.8, 32.08, 33.12, 34.0):
    add(fx, X.pop(1.2), tb, 0.45); add(fx, X.ding(1.3), tb + 0.02, 0.25)
for i in range(6):
    add(fx, X.click(1.8, 0.5), 35.3 + i * 0.07, 0.2)
add(fx, X.ding(1.0), 35.9, 0.4)
add(fx, X.pop(1.0), 37.1, 0.4); add(fx, X.ding(1.0), 41.3, 0.35)
for i in range(5):
    add(fx, X.click(1.8, 0.5), 43.2 + i * 0.7, 0.2)

# ---- voice ----
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{PROJ}/work/vo.wav', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
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
