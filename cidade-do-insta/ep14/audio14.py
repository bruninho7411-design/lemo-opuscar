"""Original score + SFX + voice mix for the Cidade do Insta reel.
Run from the lemo-opuscar root (uses core/audio sampler + sfx)."""
import sys, json, subprocess
sys.path.insert(0, '.')
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add
def W(t): return t

PROJ = '/home/user/ep14'
DUR = 44.6
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
    if t < 43.02: return 1.0
    return 0.0

ev = []
nbars = int(np.ceil(43.0 / BAR))
for bi in range(nbars):
    name, (root, *tri), arp = CH[bi % 4]
    t0 = bi * BAR
    for k in range(8):  # eighth-note grid
        t = t0 + k * B / 2
        if t >= 43.0: break
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
for start in (2.76, 16.74, 36.78):
    for bt, n in HOOK:
        ev.append((start + bt * B, 'glockenspiel', n, B, 0.55, 0.25, 0.5))
for i, n in enumerate(['C6', 'G5', 'E6', 'C6', 'G6']):
    ev.append((16.74 + i * 0.09, 'glockenspiel', n, 0.4, 0.6, 0.2, 0.55))
ev.append((3.18, 'gran_cassa', 'hit', None, 0.9, 0.0, 0.9))
for i, n in enumerate(['G5', 'E5', 'C5', 'G4']):
    ev.append((43.02 + i * 0.09, 'xylophone', n, 0.3, 0.6, 0.0, 0.5))
music = S.render(ev, dur=DUR)
music = S.room(music, size=0.3, mix=0.12)

# ---- SFX ----
fx = np.zeros((int(DUR * SR), 2), np.float32)
cuts = [1.5, 2.76, 5.2, 8.58, 10.06, 10.98, 11.72, 12.58, 13.32, 14.04, 16.74, 20.26, 23.44, 28.14, 31.64, 34.52, 35.5, 36.78, 42.16, 44.0]
for c in cuts:
    add(fx, X.whoosh(0.3, 0.5), c - 0.18, 0.24)
rng_ = np.random.default_rng(5)
def bell(d=1.4, v=0.5):
    tt = np.arange(int(d * SR)) / SR
    out = np.zeros_like(tt)
    for k in range(int(d / 0.09)):
        t0 = k * 0.09
        m = tt >= t0
        x = tt[m] - t0
        out[m] += (np.sin(2 * np.pi * 1850 * x) * 0.6 + np.sin(2 * np.pi * 2900 * x) * 0.3 + np.sin(2 * np.pi * 4100 * x) * 0.15) * np.exp(-x * 30)
    return out * v * np.minimum(1, (d - tt) * 5)
add(fx, bell(1.45), 0.0, 0.55); add(fx, bell(0.6), 44.0, 0.55)
# bus: whoosh + two-tone horn
add(fx, X.whoosh(1.0, 0.9), 1.7, 0.6)
tt_ = np.arange(int(0.45 * SR)) / SR
horn = (np.sign(np.sin(2 * np.pi * 330 * tt_)) * 0.5 + np.sign(np.sin(2 * np.pi * 415 * tt_)) * 0.5) * np.minimum(1, tt_ * 30) * np.minimum(1, (0.45 - tt_) * 20) * 0.25
add(fx, np.convolve(horn, np.ones(30) / 30, mode='same'), 1.85, 0.5)
add(fx, X.ding(1.0), 3.18, 0.45); add(fx, S.hit('claps', 'group', 0.9), 3.3, 0.5)
add(fx, X.pop(1.0), 5.74, 0.4); add(fx, X.ding(1.2), 5.78, 0.35); add(fx, S.hit('claps', 'group', 0.9), 5.9, 0.4)
# LEGO build
add(fx, X.thump(0.9, 55), 9.3, 0.7)
r2 = np.random.default_rng(9)
for (a0, a1, n) in ((9.4, 9.75, 10), (10.06, 10.96, 36), (12.08, 12.53, 18)):
    for i in range(n):
        tc = a0 + (a1 - a0) * i / n + r2.uniform(0, 0.01)
        add(fx, X.click(1.3 + r2.uniform(0, 0.8), 0.6), tc, 0.22 + r2.uniform(0, 0.1))
for tl in (11.28, 11.43, 12.78, 12.89, 13.08, 13.2, 13.7, 13.85, 14.0, 14.15, 14.35):
    add(fx, X.thump(0.9, 60), tl, 0.5); add(fx, X.click(1.0, 0.8), tl, 0.3)
add(fx, bell(0.9, 0.35), 12.6, 0.4)
for i in range(8):
    add(fx, X.pop(1.3), 14.3 + i * 0.08, 0.25)
for i in range(3):
    add(fx, X.pop(1.1), 14.6 + i * 0.3, 0.4)
add(fx, X.ding(1.0), 16.74, 0.45); add(fx, S.hit('claps', 'group', 0.9), 16.8, 0.5)
for tb in (25.22, 26.2, 27.56):
    add(fx, X.pop(1.2), tb, 0.45); add(fx, X.ding(1.3), tb + 0.02, 0.3)
add(fx, X.pop(1.0), 28.3, 0.4)
for i in range(13):
    add(fx, X.click(1.8, 0.5), 32.3 + i * 0.08, 0.18)
add(fx, X.click(1.2, 1.0), 36.0, 0.6); add(fx, X.ding(1.0), 36.05, 0.4)
for i in range(5):
    add(fx, X.click(1.8, 0.5), 38.2 + i * 0.8, 0.2)
add(fx, X.thump(1.0, 45), 43.02, 0.9); add(fx, X.thump(0.7, 80), 43.05, 0.5)

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
