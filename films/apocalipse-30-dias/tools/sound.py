"""Procedural sound for the series: SFX library + the series theme (dark survival pulse). mono float32 @ 48 kHz."""
import sys, os, numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, whoosh, brown, crash, creak  # noqa: E402

rng = np.random.default_rng(11)


def tone(f, d, a=1.0):
    return a * np.sin(2 * np.pi * np.cumsum(np.full(int(d * SR), f) if np.isscalar(f) else f) / SR)


def sweep(f0, f1, d, a=1.0, curve=2.0):
    n = int(d * SR); f = f0 + (f1 - f0) * (np.linspace(0, 1, n) ** curve)
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR)


def impact(v=1.0):
    d = 1.6; boom = sweep(110, 32, d, 1, .5) * env_exp(d, .45)
    crack = lp(noise(.25), 2500) * env_exp(.25, .03)
    out = boom.copy(); out[:len(crack)] += crack * .7
    return norm(lp(out, 900)) * v


def knock(v=1.0):
    d = .18; tt = t_(d)
    body = sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(165, 1, .05), (330, .5, .03), (720, .25, .015)])
    return norm(body + bp(noise(d), 300, 2500) * env_exp(d, .01) * .8) * v


def knocks(n=3, gap=.2, v=1.0):
    out = np.zeros(int((gap * n + .3) * SR))
    for i in range(n):
        k = knock(v * (1 - .1 * i) * (.9 + .2 * rng.random())); s = int((i * gap + rng.random() * .02) * SR); out[s:s + len(k)] += k
    return out


def siren(d=4.0, v=1.0):
    tt = t_(d); f = 700 + 250 * np.sign(np.sin(2 * np.pi * .75 * tt))           # two-tone, like a Brazilian police car far away
    f = lp(f, 8)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
    s = lp(s, 1800) * np.minimum(1, tt / .5) * np.minimum(1, (d - tt) / .8)
    return norm(s) * v


def notif(v=1.0):
    out = np.zeros(int(1.0 * SR))
    for i in range(3):
        d = .12; p = (tone(1760, d) + .5 * tone(2640, d)) * env_exp(d, .035); s = int(i * .22 * SR); out[s:s + len(p)] += p
    return norm(out) * v


def static(d=.5, v=1.0):
    return norm(bp(noise(d), 1500, 7000) * np.minimum(1, (d - t_(d)) / .1)) * v


def scratch(d=2.8, v=1.0):
    tt = t_(d); n = bp(noise(d), 2200, 6500)
    am = np.clip(np.sin(2 * np.pi * .55 * tt) * .6 + .5 + .2 * lp(noise(d), 12) * 5, 0, 1)
    return norm(n * am * np.minimum(1, tt / .2) * np.minimum(1, (d - tt) / .3)) * v


def blackout(v=1.0):
    d = 1.4; hum = (tone(100, d) + .4 * tone(200, d)) * np.exp(-t_(d) / .25) * .4
    down = sweep(240, 25, d, 1, .6) * env_exp(d, .5)
    clk = hp(noise(.03), 2000) * env_exp(.03, .004)
    out = down + hum; out[:len(clk)] += clk * 1.2
    return norm(out) * v


def heartbeat(d=6.0, bpm=70, v=1.0):
    out = np.zeros(int(d * SR)); per = 60 / bpm
    for i in range(int(d / per)):
        for off, a in [(0, 1), (.28, .7)]:
            dd = .22; th = sweep(70, 35, dd, a) * env_exp(dd, .06); s = int((i * per + off) * SR)
            if s + len(th) < len(out): out[s:s + len(th)] += th
    return norm(lp(out, 200)) * v


def riser(d=1.6, v=1.0):
    tt = t_(d); n = bp(noise(d), 800, 6000) * (tt / d) ** 2
    s = sweep(180, 900, d, .5, 2) * (tt / d) ** 2
    return norm(n + s) * v


def stamp(v=1.0):
    i = impact(1); c = hp(noise(.06), 1500) * env_exp(.06, .01)
    i[:len(c)] += c * .8
    return norm(i) * v


def pop(v=1.0):
    d = .09; return norm(sweep(500, 1100, d, 1, 1) * env_exp(d, .03)) * v


def tap(v=1.0):
    d = .05; return norm(hp(noise(d), 1800) * env_exp(d, .006) + tone(1200, d, .5) * env_exp(d, .01)) * v


def groan(d=2.2, v=1.0):
    """low wet zombie moan: formant-filtered buzz with wobble"""
    tt = t_(d); f0 = 85 + 12 * np.sin(2 * np.pi * 1.3 * tt) + 6 * lp(noise(d), 6) * 20
    saw = 2 * ((np.cumsum(f0) / SR) % 1) - 1
    v_ = sum(a * bp(saw, f * .8, f * 1.2) for f, a in [(450, 1), (900, .6), (2400, .25)])
    return norm(v_ * np.sin(np.pi * tt / d) ** .7 + bp(noise(d), 300, 1500) * .15) * v


def alarm(d=4.5, v=1.0):
    """car alarm: fast whooping tone, then a two-tone honk pattern"""
    tt = t_(d); f = np.where((tt % 1.5) < .9, 900 + 700 * ((tt * 4) % 1), np.where(((tt * 5) % 1) < .5, 1300, 900))
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .6 + np.sin(2 * np.pi * np.cumsum(f) / SR)
    return norm(lp(s, 3500) * np.minimum(1, tt / .03) * np.minimum(1, (d - tt) / .4)) * v


def rattle(v=1.0):
    """steel roll-up door being shaken: a burst of metallic clanks"""
    d = 1.6; out = np.zeros(int(d * SR))
    for k in range(14):
        dd = .12; tt = t_(dd); f = 380 + rng.random() * 500
        c = (bp(noise(dd), 900, 6000) * env_exp(dd, .015) + sum(a * np.sin(2 * np.pi * f * m * tt) * env_exp(dd, .05) for m, a in [(1, .6), (2.76, .4), (5.4, .2)]))
        s0 = int((k * .1 + rng.random() * .04) * SR); out[s0:s0 + len(c)] += c[:len(out) - s0] * (1 - k / 18)
    return norm(out) * v


def bark(v=1.0):
    """two short woofs"""
    out = np.zeros(int(.7 * SR))
    for i, st in enumerate([0, .3]):
        dd = .16; f = np.linspace(520, 300, int(dd * SR)); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        w = (bp(saw, 400, 2600) + bp(noise(dd), 600, 3000) * .5) * np.sin(np.pi * t_(dd) / dd) ** .5
        s0 = int(st * SR); out[s0:s0 + len(w)] += w
    return norm(out) * v


SFX = dict(crash=crash, creak=lambda v=1: np.concatenate([creak(v) for _ in range(4)]), alarm=alarm, rattle=rattle, bark=bark, whoosh=lambda v=1: whoosh(.4, v), impact=impact, knock=lambda v=1: knocks(3, .2, v), siren=siren, notif=notif,
           static=static, scratch=scratch, blackout=blackout, heartbeat=heartbeat, riser=riser, stamp=stamp, pop=pop, tap=tap,
           groan=groan, bang=impact)


def theme(d=80.0, bpm=92):
    """Series theme: low drone + heartbeat kick + ticking clock + dark pad. Loops every 8 bars."""
    n = int(d * SR); tt = np.arange(n) / SR; beat = 60 / bpm; out = np.zeros(n)
    # drone: A1 + E2, detuned saws through a slowly moving low-pass
    for f, a in [(55, 1), (55.4, .8), (82.4, .45), (110.2, .25)]:
        out += a * (2 * ((tt * f) % 1) - 1)
    lfo = 180 + 120 * (.5 + .5 * np.sin(2 * np.pi * tt / (beat * 16)))
    drone = np.zeros(n); blk = 2400
    for i in range(0, n, blk):
        j = min(n, i + blk); drone[i:j] = lp(out[max(0, i - 6000):j], float(lfo[i]))[-(j - i):]
    music = norm(drone) * .5
    # pad: A minor with a b2 rub, slow swell per 4 bars
    pad = np.zeros(n)
    for f in [220, 261.6, 329.6, 233.1]:
        pad += np.sin(2 * np.pi * f * tt + 3 * np.sin(2 * np.pi * .2 * tt))
    sw = .5 - .5 * np.cos(2 * np.pi * tt / (beat * 16))
    music += lp(pad, 1200) * sw * .06
    # heartbeat kick on every beat, accent on 1
    for k in range(int(d / beat)):
        dd = .3; kk = sweep(90, 38, dd, 1, .5) * env_exp(dd, .09) * (1 if k % 4 == 0 else .55)
        s = int(k * beat * SR); e = min(n, s + len(kk)); music[s:e] += kk[:e - s] * .55
    # ticking on 8ths
    for k in range(int(d / (beat / 2))):
        dd = .03; c = hp(noise(dd), 3500) * env_exp(dd, .004) * (.16 if k % 2 == 0 else .09)
        s = int(k * beat / 2 * SR); e = min(n, s + len(c)); music[s:e] += c[:e - s]
    # low boom every 8 bars
    for k in range(0, int(d / beat), 32):
        b = impact(.35); s = int(k * beat * SR); e = min(n, s + len(b)); music[s:e] += b[:e - s]
    fade = np.minimum(1, tt / 1.5)
    return (norm(music) * .9 * fade).astype(np.float32)


if __name__ == '__main__':
    import soundfile as sf
    out = sys.argv[1]
    sf.write(out, theme(), SR); print('theme ->', out)
