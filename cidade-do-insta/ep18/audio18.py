"""Original score + SFX + voice mix for the Cidade do Insta reel.
Run from the lemo-opuscar root (uses core/audio sampler + sfx)."""
import sys, json, subprocess
sys.path.insert(0, '.')
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add
def W(t): return t

PROJ = '/home/user/ep18'
DUR = 49.2
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
    if t < 47.8: return 1.0
    return 0.0

ev = []
nbars = int(np.ceil(47.8 / BAR))
for bi in range(nbars):
    name, (root, *tri), arp = CH[bi % 4]
    t0 = bi * BAR
    for k in range(8):  # eighth-note grid
        t = t0 + k * B / 2
        if t >= 47.8: break
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
for start in (0.0, 16.46, 19.72, 40.1):
    for bt, n in HOOK:
        ev.append((start + bt * B, 'glockenspiel', n, B, 0.55, 0.25, 0.5))
for i, n in enumerate(['C6', 'G5', 'E6', 'C6', 'G6']):
    ev.append((19.72 + i * 0.09, 'glockenspiel', n, 0.4, 0.6, 0.2, 0.55))
ev.append((0.0, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0)); ev.append((19.14, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0))
for i, n in enumerate(['G5', 'E5', 'C5', 'G4']):
    ev.append((47.85 + i * 0.09, 'xylophone', n, 0.3, 0.6, 0.0, 0.5))
music = S.render(ev, dur=DUR)
music = S.room(music, size=0.3, mix=0.12)

# ---- SFX ----
fx = np.zeros((int(DUR * SR), 2), np.float32)
cuts = [3.56, 11.26, 12.5, 14.82, 17.98, 19.72, 21.68, 25.38, 32.48, 40.1, 46.6, 48.6]
for c in cuts:
    add(fx, X.whoosh(0.3, 0.5), c - 0.18, 0.24)
rng_ = np.random.default_rng(5)
def crowd(d, v=0.5):
    n = int(d * SR)
    w = np.convolve(rng_.standard_normal(n).astype(np.float32), np.ones(12) / 12, mode='same')
    tt = np.arange(n) / SR
    am = 1 + 0.25 * np.sin(2 * np.pi * 3.1 * tt) + 0.15 * np.sin(2 * np.pi * 5.3 * tt)
    return w * am * np.minimum(1, tt * 8) * np.minimum(1, (d - tt) * 2) * v * 3
def whistle(d=0.5, v=0.4):
    tt = np.arange(int(d * SR)) / SR
    f = 2800 + 120 * np.sin(2 * np.pi * 30 * tt)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * v * np.minimum(1, tt * 30) * np.minimum(1, (d - tt) * 20)
def kick():
    return X.thump(1.4, 90)
add(fx, crowd(3.6, 0.35), 0.0, 0.5); add(fx, X.thump(1.0, 50), 0.0, 0.6)
add(fx, crowd(0.6, 0.35), 48.6, 0.5)
for tb in (6.02, 6.76, 7.58, 8.2, 8.82):
    add(fx, X.pop(1.2), tb, 0.45); add(fx, X.ding(1.3), tb + 0.02, 0.25)
add(fx, whistle(0.25), 11.26, 0.6); add(fx, whistle(0.6), 11.6, 0.6)
add(fx, crowd(10.4, 0.25), 11.3, 0.35)
for tk in (12.2, 13.0, 13.45, 14.9, 15.5, 15.95, 16.15, 17.5, 18.2, 18.75, 46.9):
    add(fx, kick(), tk, 0.45)
for g in (13.9, 16.46, 19.14, 47.8):
    add(fx, X.thump(0.8, 50), g, 0.8); add(fx, crowd(2.2, 0.6), g, 0.7)
add(fx, S.hit('claps', 'group', 0.9), 16.6, 0.5); add(fx, S.hit('claps', 'group', 0.9), 19.3, 0.6)
add(fx, whistle(0.3), 19.6, 0.5); add(fx, whistle(0.3), 19.95, 0.5); add(fx, whistle(0.7), 20.3, 0.5)
add(fx, X.ding(1.0), 22.3, 0.45)
for i in range(10):
    add(fx, X.click(1.8, 0.5), 26.55 + i * 0.06, 0.18)
add(fx, X.pop(1.2), 28.4, 0.45); add(fx, X.pop(1.2), 30.92, 0.45)
add(fx, X.ding(1.0), 34.24, 0.4); add(fx, X.pop(1.0), 35.72, 0.45); add(fx, S.hit('claps', 'group', 0.9), 35.9, 0.4)
for i in range(5):
    add(fx, X.click(1.8, 0.5), 41.8 + i * 0.8, 0.2)

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
