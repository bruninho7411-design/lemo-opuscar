"""Original score + SFX + voice mix for the Cidade do Insta reel.
Run from the lemo-opuscar root (uses core/audio sampler + sfx)."""
import sys, json, subprocess
sys.path.insert(0, '.')
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add
def W(t): return t

PROJ = '/home/user/ep15'
DUR = 52.65
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
    if t < 52.05: return 1.0
    return 0.0

ev = []
nbars = int(np.ceil(52.05 / BAR))
for bi in range(nbars):
    name, (root, *tri), arp = CH[bi % 4]
    t0 = bi * BAR
    for k in range(8):  # eighth-note grid
        t = t0 + k * B / 2
        if t >= 52.05: break
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
for start in (3.42, 16.4, 34.76, 44.14):
    for bt, n in HOOK:
        ev.append((start + bt * B, 'glockenspiel', n, B, 0.55, 0.25, 0.5))
for i, n in enumerate(['C6', 'G5', 'E6', 'C6', 'G6']):
    ev.append((16.4 + i * 0.09, 'glockenspiel', n, 0.4, 0.6, 0.2, 0.55))
ev.append((0.58, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0)); ev.append((3.74, 'gran_cassa', 'hit', None, 0.8, 0.0, 0.8))
for i, n in enumerate(['G5', 'E5', 'C5', 'G4']):
    ev.append((50.8 + i * 0.09, 'xylophone', n, 0.3, 0.6, 0.0, 0.5))
music = S.render(ev, dur=DUR)
music = S.room(music, size=0.3, mix=0.12)

# ---- SFX ----
fx = np.zeros((int(DUR * SR), 2), np.float32)
_add = add
def add(buf, x, t, g):
    _add(buf, x, t + 9.65 if t >= 33.02 else t, g)
cuts = [1.4, 3.42, 6.28, 9.32, 11.74, 12.98, 13.9, 14.66, 16.74, 19.28, 26.38, 29.76, 31.02, 32.34, 33.18, 34.46, 39.92, 42.4]
for c in cuts:
    add(fx, X.whoosh(0.3, 0.5), c - 0.18, 0.24)
rng_ = np.random.default_rng(5)
def rumble(d, lp=60):
    n = rng_.standard_normal(int(d * SR)).astype(np.float32)
    n = np.convolve(n, np.ones(lp) / lp, mode='same')
    e = np.minimum(1, np.arange(len(n)) / SR * 6) * np.exp(-np.arange(len(n)) / SR * 1.2)
    return n * e * 6
# chain lift clicks, then the drop
for i in range(7):
    add(fx, X.click(0.9, 1.0), 0.0 + i * 0.08, 0.45)
for i in range(7):
    add(fx, X.click(0.9, 1.0), 42.4 + i * 0.085, 0.45)
add(fx, X.whoosh(1.6, 1.0), 0.55, 0.7); add(fx, rumble(1.8, 35), 0.6, 0.7)
add(fx, X.ding(1.0), 3.74, 0.45); add(fx, S.hit('claps', 'group', 0.9), 3.9, 0.5)
add(fx, X.pop(1.0), 7.46, 0.4); add(fx, X.ding(1.2), 7.5, 0.35)
snip = rng_.standard_normal(int(0.12 * SR)).astype(np.float32) * np.exp(-np.arange(int(0.12 * SR)) / SR * 40)
add(fx, snip, 10.7, 0.6); add(fx, X.pop(1.4), 10.72, 0.5); add(fx, S.hit('claps', 'group', 0.9), 10.8, 0.7)
add(fx, X.thump(0.9, 55), 11.86, 0.7)
r2 = np.random.default_rng(9)
for (a0, a1, n) in ((11.95, 12.3, 10), (12.4, 12.8, 16), (13.26, 13.96, 26), (13.96, 14.31, 14), (15.07, 16.4, 60)):
    for i in range(n):
        tc = a0 + (a1 - a0) * i / n + r2.uniform(0, 0.01)
        add(fx, X.click(1.3 + r2.uniform(0, 0.8), 0.6), tc, 0.22 + r2.uniform(0, 0.1))
for tl in (13.31, 14.53, 14.98):
    add(fx, X.thump(0.9, 60), tl, 0.5)
add(fx, X.ding(1.0), 16.4, 0.45); add(fx, S.hit('claps', 'group', 0.9), 16.5, 0.5); add(fx, rumble(1.5, 40), 16.4, 0.3)
for i in range(3):
    add(fx, X.pop(1.1), 17.3 + i * 0.3, 0.4)
for tb in (20.98, 23.54, 24.82):
    add(fx, X.pop(1.2), tb, 0.45); add(fx, X.ding(1.3), tb + 0.02, 0.3)
for i in range(13):
    add(fx, X.click(1.8, 0.5), 27.1 + i * 0.08, 0.18)
add(fx, X.pop(1.0), 31.05, 0.4)
add(fx, X.click(1.2, 1.0), 32.75, 0.6); add(fx, X.ding(1.0), 32.8, 0.4)
add(fx, X.ding(1.0), 34.0, 0.35)
for i in range(5):
    add(fx, X.click(1.8, 0.5), 35.9 + i * 0.8, 0.2)
add(fx, X.whoosh(1.4, 0.9), 40.9, 0.5); add(fx, rumble(1.4, 35), 41.0, 0.5)

# the inserted 'first resident' segment (real times)
_add(fx, X.whoosh(0.3, 0.5), 32.84, 0.24)
_add(fx, X.pop(1.0), 34.76, 0.45); _add(fx, X.ding(1.0), 34.8, 0.4); _add(fx, S.hit('claps', 'group', 0.9), 35.0, 0.45)
_add(fx, X.pop(1.2), 36.62, 0.45); _add(fx, X.ding(1.3), 36.66, 0.35)
_add(fx, X.pop(1.1), 39.8, 0.45)
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
