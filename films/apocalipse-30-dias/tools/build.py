"""Build one episode: align script to the voice take, write timeline.json, mix audio.
usage: python3 tools/build.py ep01      (run from the series folder; needs epNN/ep.json, epNN/src/voice.mp3, epNN/src/words.json)
"""
import sys, os, json, re, unicodedata, difflib, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from sound import SFX, SR, norm, lp  # noqa: E402

EP = sys.argv[1]; HERE = os.path.abspath(EP); SERIES = os.path.dirname(HERE)
WEB = '/films/apocalipse-30-dias/'
ep = json.load(open(f'{HERE}/ep.json'))
asr = json.load(open(f'{HERE}/src/words.json'))

TAG = re.compile(r'\[[^\]]*\]')
def nrm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r"[^a-z0-9]", '', w)
NUM = {'um': '1', 'dois': '2', 'tres': '3', 'trinta': '30', 'oito': '8'}

# ---------- script tokens, tagged with their scene ----------
toks = []
for sc in ep['scenes']:
    for w in TAG.sub(' ', sc['say']).split():
        toks.append({'w': w, 'scene': sc['id'], 'n': nrm(w)})
S = [NUM.get(t['n'], t['n']) for t in toks]
A = [NUM.get(nrm(w['w']), nrm(w['w'])) for w in asr]

# ---------- align (difflib) and give every script token a time ----------
for t in toks: t['t0'] = t['t1'] = None
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, S, A, autojunk=False).get_opcodes():
    if op == 'equal' or (op == 'replace' and i2 - i1 == j2 - j1):
        for k in range(i2 - i1): toks[i1 + k]['t0'], toks[i1 + k]['t1'] = asr[j1 + k]['t0'], asr[j1 + k]['t1']
    elif op == 'replace':   # spread the script words over the heard span
        a, b = asr[j1]['t0'], asr[j2 - 1]['t1']
        for k in range(i2 - i1):
            toks[i1 + k]['t0'] = a + (b - a) * k / (i2 - i1); toks[i1 + k]['t1'] = a + (b - a) * (k + 1) / (i2 - i1)
for i, t in enumerate(toks):   # unmatched: interpolate between neighbours
    if t['t0'] is None:
        p = next((toks[k]['t1'] for k in range(i - 1, -1, -1) if toks[k]['t1'] is not None), 0)
        q = next((toks[k]['t0'] for k in range(i + 1, len(toks)) if toks[k]['t0'] is not None), p + .3)
        t['t0'], t['t1'] = p, max(p + .05, min(q, p + .3))
unmatched = sum(1 for op in difflib.SequenceMatcher(None, S, A, autojunk=False).get_opcodes() if op[0] != 'equal')
voice_end = asr[-1]['t1']

def find(scene, word, nth=1):
    c = 0
    for t in toks:
        if (scene is None or t['scene'] == scene) and t['n'] == nrm(word):
            c += 1
            if c == nth: return t
    raise SystemExit(f'word not found: {scene}:{word}#{nth}')

# ---------- scenes ----------
scenes = []
for sc in ep['scenes']:
    if 'at' in sc: st = find(sc.get('at_scene'), sc['at'])['t0'] - .05
    else: st = next(t['t0'] for t in toks if t['scene'] == sc['id']) - .15
    scenes.append({'id': sc['id'], 't0': max(0, st), 'motion': sc.get('motion', 'pushin'), 'fx': sc.get('fx', []),
                   'hud': sc['hud'], 'focus': sc.get('focus'), 'trans': sc.get('trans', 'cut'), 'blur': sc.get('blur', 0),
                   'img': f"{WEB}{EP}/img/{sc.get('reuse', sc['id'])}.jpg", 'sfx': sc.get('sfx', []),
                   'hud_t': find(sc['id'], sc['hud_at'])['t0'] if 'hud_at' in sc else None})
scenes[0]['t0'] = 0
co = ep.get('cold_open')
if co:   # flash-forward: the strongest shot of the episode under the hook question
    src = next(x for x in ep['scenes'] if x['id'] == co['src'])
    scenes.insert(0, dict(scenes[0], id='co', motion=co.get('motion', 'punch'), fx=co.get('fx', ['shake']), focus=src.get('focus'),
                          img=f"{WEB}{EP}/img/{co['src']}.jpg", sfx=[], trans='cut', blur=0, src=co['src']))
    scenes[1]['t0'] = co['dur']
DUR = round(voice_end + ep.get('tail', 2.2), 2)
for i, s in enumerate(scenes): s['t1'] = scenes[i + 1]['t0'] if i + 1 < len(scenes) else DUR
for s in scenes:
    sid = s.get('src', s['id']); fd = f"{HERE}/frames/{sid}"
    if (s['motion'] == 'video' or s.get('src')) and os.path.isdir(fd):
        s['frames'] = {'dir': f"{WEB}{EP}/frames/{sid}/", 'n': len(os.listdir(fd)), 'fps': 30}

# ---------- captions ----------
rep = sorted(((k.split(), v) for k, v in ep.get('replace', {}).items()), key=lambda kv: -len(kv[0]))
hook_ids, end_id = {ep['scenes'][0]['id']}, ep['scenes'][-1]['id']
disp, i = [], 0
while i < len(toks):
    for ks, v in rep:
        if [nrm(t['w']) for t in toks[i:i + len(ks)]] == [nrm(k) for k in ks]:
            tail = re.sub(r'^[\wÀ-ÿ\'-]+', '', toks[i + len(ks) - 1]['w'])
            disp.append({'w': v + tail, 't0': toks[i]['t0'], 't1': toks[i + len(ks) - 1]['t1'], 'scene': toks[i]['scene']}); i += len(ks); break
    else:
        disp.append({'w': toks[i]['w'], 't0': toks[i]['t0'], 't1': toks[i]['t1'], 'scene': toks[i]['scene']}); i += 1
for d in disp: d['w'] = d['w'].replace('...', '').upper()
body = [d for d in disp if d['scene'] not in hook_ids and d['scene'] != end_id]
STOP = {'e','a','o','os','as','de','da','do','na','no','um','uma','com','que','pra','por','em','se','ele','eu','voce','mas','e'}
caps, cur = [], []
for d in body:
    cur.append(d)
    if len(cur) >= 3 or sum(len(x['w']) for x in cur) >= 15 or re.search(r'[.,?!:]$', d['w']):
        if len(cur) > 1 and nrm(cur[-1]['w']) in STOP and not re.search(r'[.,?!:]$', cur[-1]['w']):
            caps.append(cur[:-1]); cur = [cur[-1]]
        else:
            caps.append(cur); cur = []
if cur: caps.append(cur)
CAPS = []
for k, c in enumerate(caps):
    nxt = caps[k + 1][0]['t0'] if k + 1 < len(caps) else None
    t1 = nxt if nxt is not None and nxt - c[-1]['t1'] < .6 else c[-1]['t1'] + .25
    CAPS.append({'t0': c[0]['t0'] - .04, 't1': t1, 'words': [{'w': x['w'], 't0': x['t0']} for x in c]})

# ---------- hook / cta / end ----------
hook_words = [d for d in disp if d['scene'] in hook_ids]
day_tok = [d for d in hook_words if nrm(d['w']) == 'dia'][-1]
hi = {nrm(w) for w in ep.get('hook_hi', [])}
HOOK = {'t1': hook_words[-1]['t1'], 'dayAt': day_tok['t0'],
        'words': [{'w': d['w'], 't0': d['t0'], 'hi': nrm(d['w']) in hi} for d in hook_words if d['t0'] < day_tok['t0'] - .01]}
c0 = find(ep['cta_from']['scene'], ep['cta_from']['word'], ep['cta_from'].get('nth', 1))
c1 = find(ep['cta_to']['scene'], ep['cta_to']['word'], ep['cta_to'].get('nth', 1))
CTA = {'t0': c0['t0'], 't1': c1['t1'] + .3, 'left': 30 - ep['day']}
END = {'t0': scenes[-1]['t0'], 'lines': ep['end_lines'], 'next': ep.get('next', f"DIA {ep['day'] + 1}: SEGUE PRA NÃO PERDER")}

# ---------- events (sound + visual sync) ----------
EVENTS = []
for e in ep.get('events', []):
    t = find(e.get('scene'), e['word'], e.get('nth', 1))['t0'] + e.get('off', 0)
    EVENTS.append({'t': round(t, 3), 'type': e['type'], 'v': e.get('v', 1)})
for s in scenes[1:]:
    if s['trans'] != 'none': EVENTS.append({'t': s['t0'] - .12, 'type': 'whoosh', 'v': .35})
    for x in s['sfx']: EVENTS.append({'t': s['t0'] + x.get('off', 0), 'type': x['type'], 'v': x.get('v', 1)})
EVENTS += [{'t': 0, 'type': 'impact', 'v': .7}, {'t': HOOK['dayAt'] - 1.5, 'type': 'riser', 'v': .5}, {'t': HOOK['dayAt'], 'type': 'stamp', 'v': .8},
           {'t': CTA['t0'] + (CTA['t1'] - CTA['t0']) * .55, 'type': 'tap', 'v': .6}, {'t': END['t0'], 'type': 'impact', 'v': .5}]
prev = scenes[0]['hud']
for s in scenes:
    if s['hud_t'] is None: s['hud_t'] = s['t0']
for s in scenes[1:]:
    if s['hud'] != prev: EVENTS.append({'t': s['hud_t'] + .35, 'type': 'pop', 'v': .35})
    prev = s['hud']
EVENTS.sort(key=lambda e: e['t'])

TL = {'day': ep['day'], 'title': ep['title'], 'dur': DUR, 'scenes': scenes, 'caps': CAPS, 'hook': HOOK, 'cta': CTA,
      'end': END, 'events': EVENTS, 'avatar': WEB + 'assets/avatar.png', 'capY': ep.get('capY', 1290)}
json.dump(TL, open(f'{HERE}/timeline.json', 'w'), ensure_ascii=False, indent=1)

# ---------- mix ----------
def load(path):
    pcm = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(pcm, np.float32).copy()
n = int(DUR * SR) + SR
voice = load(f'{HERE}/src/voice.mp3')
from sound import bp as _bp
for vf in ep.get('voice_fx', []):   # e.g. a radio transmission: band-limited, crunchy, with static
    a = int((find(vf['from']['scene'], vf['from']['word'])['t0'] - .05) * SR); b = int((find(vf['to']['scene'], vf['to']['word'], vf['to'].get('nth', 1))['t1'] + .1) * SR)
    seg_ = voice[a:b]; r = np.tanh(_bp(seg_, 450, 2800) * 4) * .35 + _bp(np.random.default_rng(3).standard_normal(len(seg_)), 1500, 6000) * .02
    fade = np.minimum(1, np.minimum(np.arange(len(seg_)), np.arange(len(seg_))[::-1]) / (.02 * SR)); voice[a:b] = seg_ * (1 - fade) + r * fade
# gentle compression on the voice: RMS follower
env = np.sqrt(lp(voice ** 2, 20) .clip(1e-9)); g = np.minimum(1, (0.12 / np.maximum(env, 1e-4)) ** .35)
voice = norm(voice * g, .95)
mus = sf.read(f'{SERIES}/assets/theme.wav')[0].astype(np.float32)
mus = np.tile(mus, int(np.ceil(n / len(mus))))[:n]
venv = np.zeros(n); venv[:len(voice)] = np.abs(voice); venv = lp(venv, 6); duck = 1 - .55 * np.clip(venv / (venv.max() * .3), 0, 1)
fade = np.ones(n); fo = int(1.2 * SR); end_i = int(DUR * SR); fade[end_i - fo:end_i] = np.linspace(1, 0, fo); fade[end_i:] = 0
mix = mus * .22 * duck * fade
mix[:len(voice)] += voice
for e in EVENTS:
    x = SFX[e['type']](e['v']) * .5; s = int(max(0, e['t']) * SR); m = min(n, s + len(x)); mix[s:m] += x[:m - s]
for s in scenes:   # scene-long beds
    if 'siren' in s['fx']: x = SFX['siren'](s['t1'] - s['t0'] + .5, .18); a = int(s['t0'] * SR); mix[a:a + len(x)] += x[:n - a]
    if 'heartbeat' in s['fx']: x = SFX['heartbeat'](s['t1'] - s['t0'], 72, .35); a = int(s['t0'] * SR); mix[a:a + len(x)] += x[:n - a]
mix = mix[:int(DUR * SR)]
peak = np.abs(mix).max(); mix = mix / peak * .89 if peak > .89 else mix
sf.write(f'{HERE}/mix.wav', mix.astype(np.float32), SR)
print(f'{EP}: dur {DUR}s, scenes', ' '.join(f"{s['id']}@{s['t0']:.2f}" for s in scenes))
print(f'  align: {len(toks)} script words, {len(asr)} heard, {unmatched} non-equal blocks; caps {len(CAPS)}; events {len(EVENTS)}')
