"""Original score + SFX + voice mix for the Cidade do Insta reel.
Run from the lemo-opuscar root (uses core/audio sampler + sfx)."""
import sys, json, subprocess
sys.path.insert(0, '.')
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add
def W(t): return t

PROJ = '/home/user/ep12'
DUR = 28.6
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
    if t < 27.08: return 1.0
    return 0.0

ev = []
nbars = int(np.ceil(27.1 / BAR))
for bi in range(nbars):
    name, (root, *tri), arp = CH[bi % 4]
    t0 = bi * BAR
    for k in range(8):  # eighth-note grid
        t = t0 + k * B / 2
        if t >= 27.1: break
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
for start in (1.0, 8.9, 21.72):
    for bt, n in HOOK:
        ev.append((start + bt * B, 'glockenspiel', n, B, 0.55, 0.25, 0.5))
# drops when the water arrives
for i, n in enumerate(['C6', 'G5', 'E6', 'C6', 'G6']):
    ev.append((10.24 + i * 0.09, 'glockenspiel', n, 0.4, 0.6, 0.2, 0.55))
ev.append((0.82, 'gran_cassa', 'hit', None, 0.9, 0.0, 1.0))
ev.append((9.0, 'gran_cassa', 'hit', None, 0.8, 0.0, 0.8))
# 'escuro' power-down
for i, n in enumerate(['G5', 'E5', 'C5', 'G4']):
    ev.append((27.08 + i * 0.09, 'xylophone', n, 0.3, 0.6, 0.0, 0.5))
music = S.render(ev, dur=DUR)
music = S.room(music, size=0.3, mix=0.12)

# ---- SFX ----
fx = np.zeros((int(DUR * SR), 2), np.float32)
cuts = [2.44, 3.56, 4.9, 5.9, 6.26, 6.78, 7.08, 7.48, 7.9, 8.48, 10.24, 12.0, 13.58, 14.92, 17.0, 20.5, 21.72, 26.32, 28.0]
for c in cuts:
    add(fx, X.whoosh(0.3, 0.5), c - 0.18, 0.26)
def siren(d, v=0.35):
    tt = np.arange(int(d * SR)) / SR
    f = np.where((tt * 2.5) % 1 < 0.5, 960, 770)
    ph = np.cumsum(2 * np.pi * f / SR)
    return (np.sin(ph) * 0.6 + np.sin(2 * ph) * 0.2) * v * np.minimum(1, tt * 8) * np.minimum(1, (d - tt) * 4)
add(fx, siren(1.6, 0.3), 0.85, 0.3)
# rock falling + huge splash
add(fx, X.whoosh(0.9, 0.9), 0.0, 0.5)
nb = np.random.default_rng(7).standard_normal(int(1.6 * SR)).astype(np.float32)
envb = np.exp(-np.arange(len(nb)) / SR * 3.2)
big = np.convolve(nb * envb, np.ones(10) / 10, mode='same')
add(fx, big, 0.82, 0.9); add(fx, X.thump(1.0, 42), 0.82, 1.0); add(fx, X.thump(0.8, 70), 0.84, 0.6)
add(fx, X.whoosh(1.5, 0.8), 1.05, 0.4)
for tt2 in (5.9, 6.26, 6.78, 7.08, 7.48, 7.9):
    add(fx, X.pop(1.0), tt2, 0.4); add(fx, X.ding(1.1), tt2 + 0.02, 0.22)
# splash (filtered noise burst) on 'agua'
n = np.random.default_rng(3).standard_normal(int(0.9 * SR)).astype(np.float32)
env_s = np.exp(-np.arange(len(n)) / SR * 5)
splash = np.convolve(n * env_s, np.ones(18) / 18, mode='same') * 0.8
add(fx, splash, 9.0, 0.55); add(fx, X.thump(1.0, 70), 9.0, 0.5)
for i in range(10):
    add(fx, X.click(1.6, 0.4), 9.3 + i * 0.08, 0.15)
add(fx, X.ding(1.0), 10.24, 0.45); add(fx, S.hit('claps', 'group', 0.9), 10.3, 0.5)
for i in range(3):
    add(fx, X.pop(1.1), 12.15 + 0.3 + i * 0.3, 0.4)
for tt2 in (14.95, 15.42, 16.32):
    add(fx, X.pop(1.2), tt2, 0.45); add(fx, X.ding(1.2), tt2 + 0.02, 0.25)
for i in range(13):
    add(fx, X.click(1.8, 0.5), 17.7 + i * 0.09, 0.18)
add(fx, X.click(1.2, 1.0), 21.1, 0.6); add(fx, X.ding(1.0), 21.15, 0.4)
for i in range(4):
    add(fx, X.click(1.8, 0.5), 22.9 + i * 0.9, 0.2)
add(fx, X.thump(0.7, 45), 27.08, 0.7)

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
