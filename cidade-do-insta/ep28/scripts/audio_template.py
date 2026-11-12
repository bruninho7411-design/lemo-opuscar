"""Original score + SFX + voice mix for the Cidade do Insta reel.
Run from the lemo-opuscar root (uses core/audio sampler + sfx)."""
import sys, json, subprocess
sys.path.insert(0, '.')
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add
def W(t): return t

PROJ = '/home/user/cidade-do-insta'
DUR = 31.2
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
    if t < 28.66: return 1.0
    return 0.0

ev = []
nbars = int(np.ceil(30.5 / BAR))
for bi in range(nbars):
    name, (root, *tri), arp = CH[bi % 4]
    t0 = bi * BAR
    for k in range(8):  # eighth-note grid
        t = t0 + k * B / 2
        if t >= 30.5: break
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
for start in (1.72, 5.62, 18.62, 26.62):
    for bt, n in HOOK:
        ev.append((start + bt * B, 'glockenspiel', n, B, 0.55, 0.25, 0.5))
# sad little phrase under "sem casa / sem rua / sem gente"
for tt, n in [(13.0, 'E5'), (13.4, 'D5'), (15.6, 'C5'), (15.8, 'B4')]:  # outskirts
    ev.append((tt, 'xylophone', n, 0.5, 0.55, 0.0, 0.55))
# "SENÃO..." sting
ev.append((1.72, 'gran_cassa', 'hit', None, 0.9, 0.0, 1.0))
for i, n in enumerate(['G5', 'E5', 'C5', 'G4']):
    ev.append((28.66 + i * 0.07, 'xylophone', n, 0.3, 0.6, 0.0, 0.5))

music = S.render(ev, dur=DUR)
music = S.room(music, size=0.3, mix=0.12)

# ---- SFX ----
fx = np.zeros((int(DUR * SR), 2), np.float32)
cuts = [1.72, 2.6, 4.88, 8.72, 12.0, 14.82, 17.52, 23.4, 26.4, 28.66, 30.5]
for c in cuts:
    add(fx, X.whoosh(0.3, 0.5), c - 0.18, 0.28)
add(fx, X.whoosh(1.4, 0.8), 0.7, 0.35)  # the dive
# siren (two-tone) under the hook and the ambulance
def siren(d, v=0.35):
    tt = np.arange(int(d * SR)) / SR
    f = np.where((tt * 2.5) % 1 < 0.5, 960, 770)
    ph = np.cumsum(2 * np.pi * f / SR)
    return (np.sin(ph) * 0.6 + np.sin(2 * ph) * 0.2) * v * np.minimum(1, tt * 8) * np.minimum(1, (d - tt) * 4)
add(fx, X.whoosh(1.6, 1.0), 0.05, 0.45); add(fx, X.thump(1.0, 55), 1.72, 0.7); add(fx, X.ding(1.0), 1.75, 0.45)
add(fx, S.hit('claps', 'group', 0.9), 1.8, 0.5)
for tt2 in (3.02, 3.94, 5.62, 7.46, 10.72, 13.42, 16.02, 19.74):
    add(fx, X.pop(1.0), tt2, 0.45); add(fx, X.ding(0.8), tt2 + 0.02, 0.2)
for i in range(13):
    add(fx, X.click(1.8, 0.5), 5.3 + i * 0.09, 0.18)
add(fx, siren(1.3, 0.25), 10.6, 0.45)
for i in range(6):
    add(fx, X.click(1.8, 0.5), 25.45 + i * 0.07, 0.2)
add(fx, X.click(1.2, 1.0), 28.12, 0.6); add(fx, X.ding(1.0), 28.2, 0.45)
add(fx, S.hit('claps', 'group', 0.9), 28.7, 0.5)

# ---- voice ----
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{PROJ}/ep11/work/vo_raw.wav', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
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
sf.write(f'{PROJ}/ep11/work/mix_pre.wav', mix, SR)
sf.write(f'{PROJ}/ep11/work/music.wav', music, SR)
print('ok', mix.shape, float(np.abs(mix).max()))
print(S.credits(['marimba', 'glockenspiel', 'xylophone', 'ukulele', 'electric_bass', 'cajon', 'claps', 'shaker', 'gran_cassa']))
