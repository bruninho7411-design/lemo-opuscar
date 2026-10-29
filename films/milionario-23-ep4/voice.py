"""voices/<id>.wav (24 kHz from VoiceStudio) → voices/p/<id>.wav (48 kHz, per-character colour, compressed)
+ voices/lips.json (mouth openness o and brightness b per 1/24 s) + voices/dur.json.
Narrator: chest and presence; você: low-mid warmth; Caio: presence boost; Homem de Terno: warm and dark."""
import json, os, sys, numpy as np, soundfile as sf, soxr
from scipy.signal import lfilter
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import compress
L = json.load(open(os.path.join(HERE, 'lines.json')))
os.makedirs(os.path.join(HERE, 'voices', 'p'), exist_ok=True)
def peq(x, f, gain_db, q=1.0):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], x)
dur, lips = {}, {}
for l in L:
    f = os.path.join(HERE, 'voices', l['id'] + '.wav')
    if not os.path.exists(f): continue
    y, sr = sf.read(f)
    if y.ndim > 1: y = y.mean(1)
    y = soxr.resample(y, sr, SR)
    y = y / (np.abs(y).max() + 1e-9) * .9
    if l['who'] == 'c': y = peq(y, 3200, 2.5, .9); y = peq(y, 220, -1.5, .8)
    elif l['who'] == 'n': y = peq(y, 110, 2.5, .7); y = peq(y, 3000, 1.5, .9)   # narrator: chest + presence
    elif l['who'] == 's': y = peq(y, 140, 2.0, .7); y = peq(y, 6000, -1.5, .9)
    else: y = peq(y, 160, 1.5, .8); y = peq(y, 4500, 1.0, .9)
    y = compress(y, thr=.22, ratio=3.0)
    y = y / (np.abs(y).max() + 1e-9) * .9
    sf.write(os.path.join(HERE, 'voices', 'p', l['id'] + '.wav'), y.astype(np.float32), SR)
    dur[l['id']] = round(len(y) / SR, 3)
    hop, win = SR // 24, int(.05 * SR); o, b = [], []
    frames = [y[max(0, i - win // 2):i + win // 2] for i in range(0, len(y), hop)]
    rms = np.array([np.sqrt((fr ** 2).mean()) if len(fr) else 0 for fr in frames]); p = np.percentile(rms, 95) + 1e-9
    for fr, r in zip(frames, rms):
        sp = np.abs(np.fft.rfft(fr * np.hanning(len(fr)), 4096)); fq = np.fft.rfftfreq(4096, 1 / SR)
        cen = (sp * fq).sum() / (sp.sum() + 1e-9)
        o.append(round(float(np.clip((r / p - .1) / .8, 0, 1)), 2)); b.append(round(float(np.clip((cen - 1200) / 2600, 0, 1)), 2))
    lips[l['id']] = {'o': o, 'b': b}
json.dump(dur, open(os.path.join(HERE, 'voices', 'dur.json'), 'w'), indent=0)
json.dump(lips, open(os.path.join(HERE, 'voices', 'lips.json'), 'w'))
print('voices', len(dur), 'total', round(sum(dur.values()), 2), 's')
