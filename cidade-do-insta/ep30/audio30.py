"""Original score + SFX + voice mix for the Cidade do Insta reel.
Run from the lemo-opuscar root (uses core/audio sampler + sfx)."""
import sys, json, subprocess
sys.path.insert(0, '.')
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add, lp, bp, noise, env_exp, t_, norm
def W(t): return t

PROJ = '/home/user/ep30'
DUR = 58.05
S.seed(30)

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
    if t < 56.44: return 1.0
    return 0.0

ev = []
END = 56.44
nbars = int(np.ceil(END / BAR))
for bi in range(nbars):
    name, (root, *tri), arp = CH[bi % 4]
    t0 = bi * BAR
    for k in range(8):
        t = t0 + k * B / 2
        if t >= END: break
        L = level(t)
        if k in (0, 3, 4, 7):
            p = root + (12 if k == 7 else 0) + (7 if k == 3 else 0)
            ev.append((t, 'electric_bass', p, B * 0.45, 0.75, 0.0, 0.9))
        if k in (0, 4): ev.append((t, 'cajon', 'bass', None, 0.8, 0.0, 0.9))
        if k in (2, 6): ev.append((t, 'claps', 'solo', None, 0.55, 0.1, 0.5))
        ev.append((t, 'shaker', 'down' if k % 2 == 0 else 'up', None, 0.35 if k % 2 else 0.5, -0.3, 0.45))
        if k % 2 == 1:
            for j in range(3):
                ev.append(dict(t=t + 0.012 * j, inst='ukulele', pitch=tri[j], dur=0.22, vel=0.6, pan=0.35, gain=0.5))
        ev.append((t, 'marimba', arp[k % 4], B * 0.5, 0.55 if k % 2 == 0 else 0.42, -0.2, 0.85))
HOOK = [(0, 'G5'), (0.5, 'C6'), (1.0, 'E6'), (1.5, 'G6'), (2.0, 'E6'), (3.0, 'C6')]
for start in (3.68, 16.66, 35.04):
    for bt, n in HOOK:
        ev.append((start + bt * B, 'glockenspiel', n, B, 0.55, 0.25, 0.5))
for i, n in enumerate(['C6', 'G5', 'E6', 'C6', 'G6']):
    ev.append((3.68 + i * 0.09, 'glockenspiel', n, 0.4, 0.6, 0.2, 0.55))
ev.append((0.0, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0)); ev.append((6.95, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0)); ev.append((16.66, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0)); ev.append((35.04, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0))
ev.append((56.44, 'gran_cassa', 'hit', None, 0.95, 0.0, 1.0))
music = S.render(ev, dur=DUR)
music = S.room(music, size=0.3, mix=0.12)

# ---- SFX (no crowd noise) ----

def splash(d=1.1, v=1.0):
    n = noise(d); e = env_exp(d, 0.28) * np.minimum(1, t_(d) * 60)
    return norm(bp(n, 250, 4000) * e, 0.8 * v)
def wash(d, v=0.3):
    n = lp(noise(d), 700); tt = t_(d)
    e = (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * tt)) * np.minimum(1, tt * 3) * np.minimum(1, (d - tt) * 3)
    return norm(n * e, v)
fx = np.zeros((int(DUR * SR), 2), np.float32)
for c in [3.6, 6.95, 10.55, 12.1, 13.4, 16.5, 21.1, 23.7, 25.8, 27.7, 29.5, 31.4, 33.3, 35.0, 41.62, 42.85, 43.52, 44.16, 45.5, 46.2, 46.98, 47.55, 49.5, 50.4, 55.15]:
    add(fx, X.whoosh(0.3, 0.5), c - 0.18, 0.22)
add(fx, X.pop(1.1), 0.0, 0.35)
add(fx, X.thump(0.8, 60), 2.92, 0.3)
for i in range(14): add(fx, X.click(1.2 + 0.05 * (i % 4), 0.7), 3.68 + i * 0.07, 0.25)
for i in range(7): add(fx, X.ding(1.3 + 0.1 * i), 4.7 + i * 0.07, 0.2)
for i in range(18): add(fx, X.click(1.5 + 0.04 * (i % 5), 0.35), 7.3 + i * 0.13, 0.12)
add(fx, X.ding(1.2), 9.9, 0.45)
add(fx, X.pop(0.8), 11.5, 0.4); add(fx, X.creak(0.9), 11.65, 0.35)
add(fx, X.pop(1.1), 12.82, 0.45); add(fx, X.ding(1.2), 12.85, 0.3)
for tp in (13.7, 14.3, 14.7): add(fx, X.pop(1.2), tp, 0.42)
add(fx, X.thump(1.0, 55), 15.42, 0.5); add(fx, X.ding(1.0), 15.45, 0.45)
add(fx, X.ding(1.1), 16.66, 0.5); add(fx, X.ding(1.4), 16.74, 0.35)
for i in range(10): add(fx, X.click(1.2 + 0.05 * (i % 4), 0.6), 17.67 + i * 0.075, 0.25)
add(fx, X.thump(0.9, 70), 19.04, 0.45)
for i in range(4): add(fx, X.thump(0.8, 65 + i * 5), 19.66 + i * 0.1, 0.3)
for i in range(6): add(fx, X.ding(1.5 + 0.12 * i), 20.6 + i * 0.05, 0.15)
add(fx, X.pop(0.8), 22.16, 0.45)
for tp in (21.15, 23.75, 25.85, 27.75, 29.55, 31.45, 33.35): add(fx, X.pop(1.1), tp, 0.34)
for tp in (24.68, 26.12, 27.74, 29.54, 31.64, 33.42): add(fx, X.pop(0.8), tp, 0.48); add(fx, X.ding(1.2), tp + 0.04, 0.3)
add(fx, X.ding(1.1), 35.04, 0.45)
for tp in (36.2, 37.44, 38.52, 41.66, 42.88, 43.56, 44.2, 45.54, 46.24, 47.02): add(fx, X.pop(1.2), tp, 0.36)
add(fx, X.thump(0.9, 60), 47.58, 0.45); add(fx, X.click(1.4, 0.8), 49.8, 0.4)
for i in range(4): add(fx, X.click(1.8, 0.5), 51.6 + i * 0.8, 0.2)
add(fx, X.whoosh(0.5, 0.9), 55.9, 0.35); add(fx, X.thump(1.0, 45), 56.44, 0.5)
add(fx, X.pop(0.7), 57.45, 0.5)

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
print(S.credits(['marimba', 'glockenspiel', 'ukulele', 'electric_bass', 'cajon', 'claps', 'shaker', 'gran_cassa']))
