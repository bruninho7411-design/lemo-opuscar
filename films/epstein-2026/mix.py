"""Voice + march score + SFX -> out/mix.wav. Reads events.json (exported from the page by core/render/events.mjs) and voices/.
Reuses the procedural march and SFX from films/napoleao/tools/sound.py."""
import os, sys, json, numpy as np, soundfile as sf, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'napoleao', 'tools'))
from sound import SFX, SR, epic, theme, norm, lp, hp, bp, noise, t_, env_exp, tone, sweep, impact, riser  # noqa: E402

EV = json.load(open(os.path.join(HERE, 'events.json'))); DUR = EV['dur']; E = EV['ev']; N = int(DUR * SR)
def put(buf, x, t, g=1.0):
    s = int(max(0, t) * SR); m = min(len(buf), s + len(x))
    if m > s: buf[s:m] += x[:m - s] * g
def load(p):
    pcm = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(pcm, np.float32).copy()
T = {}
for e in E:
    T.setdefault(e['type'], []).append(e)

# —— voice ——
voice = np.zeros(N)
put(voice, load(os.path.join(HERE, 'src', 'voice.mp3')), 0)   # one take
env = np.sqrt(lp(voice ** 2, 20).clip(1e-9)); voice = norm(voice * np.minimum(1, (0.12 / np.maximum(env, 1e-4)) ** .35), .95)

# —— score: low drone under the cold open, the march drops on v1, a dead stop for the height gag ——
v1 = next(e['t'] for e in T['vo'] if e['id'] == 'v1')
sting = T.get('sting', [{'t': -9}])[0]['t']; endt = T['end'][0]['t']
music = np.zeros(N)
m = theme(DUR - v1 + 2)
put(music, m, v1)
_d = round(v1 + .5, 2); _n = int(_d * SR); _tt = np.arange(_n) / SR
dr = (np.sin(2 * np.pi * 36.7 * _tt) + .5 * np.sin(2 * np.pi * 55 * _tt)) * np.minimum(1, _tt / .2) * np.minimum(1, (_d - _tt) / .4)
put(music, lp(dr, 200) * .5, 0)
tt = np.arange(N) / SR
gate = np.ones(N); gate[(tt > sting - .1) & (tt < sting + 1.4)] = .25          # dip for the trombone
gate = lp(gate, 30)
venv = lp(np.abs(voice), 6); duck = 1 - .55 * np.clip(venv / (venv.max() * .3), 0, 1)
fade = np.ones(N); fo = int(1.6 * SR); fade[-fo:] = np.linspace(1, 0, fo)
music = music * .28 * duck * gate * fade

# —— sfx ——
def shutter(v=1.0):
    d = .09; c = hp(noise(d), 2500) * env_exp(d, .01); c2 = np.zeros(int(.16 * SR)); c2[:len(c)] += c; c2[int(.06 * SR):int(.06 * SR) + len(c)] += c * .7
    return norm(c2) * v
def scrape(d=1.3, v=1.0):
    x = lp(noise(d), 900) * (.6 + .4 * np.sin(2 * np.pi * 7 * t_(d))) * np.minimum(1, t_(d) / .1) * np.minimum(1, (d - t_(d)) / .3)
    return norm(x) * v
def trombone(v=1.0):
    out = []
    for f, d in [(233, .42), (220, .42), (207.6, .42), (196, 1.3)]:
        tt_ = t_(d); vib = 1 + (.012 * np.sin(2 * np.pi * 6 * tt_) if d > 1 else 0)
        saw = sum(np.sin(2 * np.pi * f * k * np.cumsum(np.full(len(tt_), vib)) / SR) / k for k in range(1, 9))
        out.append(lp(saw, 1400) * np.minimum(1, tt_ / .03) * np.minimum(1, (d - tt_) / .08))
    return norm(np.concatenate(out)) * v
def notif(v=1.0):
    return norm(np.concatenate([tone(1318, .08) * env_exp(.08, .03), tone(1760, .16) * env_exp(.16, .06)])) * v
def chime(v=1.0):
    out = np.zeros(int(1.4 * SR))
    for i, f in enumerate([1046, 1318, 1568, 2093]): put(out, tone(f, 1.0) * env_exp(1.0, .25), i * .08)
    return norm(out) * v
sfx = np.zeros(N)
for e in E:
    k, t = e['type'], e['t']
    if k == 'eyes': put(sfx, impact(1), t, .55); put(sfx, SFX['whooshin'](1), t - .45, .35)
    elif k == 'lid': put(sfx, scrape(1.3), t, .35); put(sfx, impact(.6), t + 1.1, .4)
    elif k == 'shutters':
        for i in range(26): put(sfx, shutter(.5 + .5 * np.random.default_rng(i).random()), t + i * .11 + np.random.default_rng(i + 50).random() * .08, .22)
    elif k == 'gasp': put(sfx, impact(.8), t, .4)
    elif k == 'cut': put(sfx, SFX['whoosh'](.5), t - .12, .3)
    elif k == 'sting': put(sfx, trombone(1), t + .15, .3)
    elif k == 'stars': put(sfx, chime(1), t, .25)
    elif k in ('live', 'phone'): put(sfx, notif(1), t, .3); put(sfx, SFX['pop'](1), t, .25)
    elif k == 'ruler': put(sfx, riser(1.0, 1), t, .2); put(sfx, SFX['ding'](1), t + .9, .3)
    elif k == 'flat': x = np.sin(2 * np.pi * 1000 * t_(e['d'])) * .5; x[-int(.01 * SR):] *= np.linspace(1, 0, int(.01 * SR)); put(sfx, x, t, .12)
    elif k == 'beep': put(sfx, np.sin(2 * np.pi * 1000 * t_(.09)) * env_exp(.09, .05), t, .16)
    elif k == 'freeze': put(sfx, SFX['scratch'](1), t - .05, .35); put(sfx, SFX['stamp'](1), t + .05, .45)
    elif k == 'stick': put(sfx, SFX['pop'](1), t, .35)
    elif k == 'numpunch': put(sfx, impact(.4), t, .18)
    elif k == 'gavel': put(sfx, impact(1), t, .5); put(sfx, SFX['knock'](1)[:int(.2 * SR)], t, .5)
    elif k == 'like': put(sfx, SFX['pop'](1), t, .35); put(sfx, chime(1), t + .05, .15)
    elif k == 'follow': put(sfx, SFX['tap'](1), t, .5); put(sfx, notif(1), t + .05, .25)
    elif k == 'end': put(sfx, impact(.7), t, .4); put(sfx, SFX['pop'](1), t + .4, .3)
    elif k == 'punch' and e.get('v', 1) < .9: put(sfx, impact(.5), t, .25 * e['v'])
put(sfx, impact(1), 0, .5)
mix = voice + music + sfx
pk = np.abs(mix).max(); mix = mix / pk * .89 if pk > .89 else mix
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix', round(DUR, 2), 's')
