"""Napoleão: align the script to the voice take, write timeline.json, mix audio.
Adapted from films/apocalipse-30-dias/tools/build.py (same alignment, captions and mix; hook stamp, year badge,
ruler and end card replace the day/HUD logic).
usage (from films/napoleao): python3 tools/build.py   needs ep.json, src/voice.mp3, src/words.json, assets/theme.wav
"""
import sys, os, json, re, unicodedata, difflib, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from sound import SFX, SR, norm, lp  # noqa: E402

HERE = os.path.abspath('.'); WEB = '/films/napoleao/'
ep = json.load(open(f'{HERE}/ep.json'))
asr = json.load(open(f'{HERE}/src/words.json'))

TAG = re.compile(r'\[[^\]]*\]')
def nrm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r"[^a-z0-9]", '', w)

toks = []
for sc in ep['scenes']:
    for w in TAG.sub(' ', sc['say']).split():
        toks.append({'w': w, 'scene': sc['id'], 'n': nrm(w)})
S = [t['n'] for t in toks]
A = [nrm(w['w']) for w in asr]
for t in toks: t['t0'] = t['t1'] = None
ops = difflib.SequenceMatcher(None, S, A, autojunk=False).get_opcodes()
for op, i1, i2, j1, j2 in ops:
    if op == 'equal' or (op == 'replace' and i2 - i1 == j2 - j1):
        for k in range(i2 - i1): toks[i1 + k]['t0'], toks[i1 + k]['t1'] = asr[j1 + k]['t0'], asr[j1 + k]['t1']
    elif op == 'replace':
        a, b = asr[j1]['t0'], asr[j2 - 1]['t1']
        for k in range(i2 - i1):
            toks[i1 + k]['t0'] = a + (b - a) * k / (i2 - i1); toks[i1 + k]['t1'] = a + (b - a) * (k + 1) / (i2 - i1)
for i, t in enumerate(toks):
    if t['t0'] is None:
        p = next((toks[k]['t1'] for k in range(i - 1, -1, -1) if toks[k]['t1'] is not None), 0)
        q = next((toks[k]['t0'] for k in range(i + 1, len(toks)) if toks[k]['t0'] is not None), p + .3)
        t['t0'], t['t1'] = p, max(p + .05, min(q, p + .3))
unmatched = sum(1 for o in ops if o[0] != 'equal')
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
    st = next(t['t0'] for t in toks if t['scene'] == sc['id']) - .15
    s = {'id': sc['id'], 't0': max(0, st), 'motion': sc.get('motion', 'pushin'), 'fx': sc.get('fx', []), 'year': sc.get('year'),
         'focus': sc.get('focus'), 'blur': sc.get('blur', 0), 'img': f"{WEB}img/{sc.get('reuse', sc['id'])}.jpg"}
    if 'label' in sc: s['label'] = {'t': find(sc['id'], sc['label']['at'])['t0'], 'text': sc['label']['text']}
    if 'doc' in sc: s['doc'] = {'t': find(sc['id'], sc['doc']['at'])['t0'], 'text': sc['doc']['text']}
    if 'ruler' in sc:
        r = sc['ruler']; s['ruler'] = {'t': find(sc['id'], r['at'])['t0'], 'to': r['to'], 'avg': r['avg'],
                                       'avgT': find(sc['id'], r['avg_at'])['t0'], 'hitT': find(sc['id'], 'nove')['t1']}
    fd = f"{HERE}/frames/{sc['id']}"
    if os.path.isdir(fd): s['frames'] = {'dir': f"{WEB}frames/{sc['id']}/", 'n': len(os.listdir(fd)), 'fps': 30}
    scenes.append(s)
scenes[0]['t0'] = 0
DUR = round(voice_end + ep.get('tail', 2.4), 2)
for i, s in enumerate(scenes): s['t1'] = scenes[i + 1]['t0'] if i + 1 < len(scenes) else DUR

# ---------- captions ----------
rep = sorted(((k.split(), v) for k, v in ep.get('replace', {}).items()), key=lambda kv: -len(kv[0]))
disp, i = [], 0
while i < len(toks):
    for ks, v in rep:
        if [nrm(t['w']) for t in toks[i:i + len(ks)]] == [nrm(k) for k in ks]:
            tail = re.sub(r'^[\wÀ-ÿ\'-]+', '', toks[i + len(ks) - 1]['w'])
            disp.append({'w': v + tail, 't0': toks[i]['t0'], 't1': toks[i + len(ks) - 1]['t1'], 'scene': toks[i]['scene'], 'big': True}); i += len(ks); break
    else:
        disp.append({'w': toks[i]['w'], 't0': toks[i]['t0'], 't1': toks[i]['t1'], 'scene': toks[i]['scene']}); i += 1
for d in disp: d['w'] = d['w'].replace('...', '').upper()
hook_id = ep['scenes'][0]['id']; cta_id = 's08'
end_t0 = find('s09', ep['scenes'][-1]['end_at'])['t0'] - .1
_s01 = [d for d in disp if d['scene'] == hook_id]; _cut = next(k for k, d in enumerate(_s01) if d['w'].endswith('.')) + 1
body = [d for d in disp if d not in _s01[:_cut] and d['scene'] != cta_id and d['t0'] < end_t0]
STOP = {'e','a','o','os','as','de','da','do','na','no','um','uma','com','que','pra','por','em','se','ele','eu','mas','pela','pelo'}
caps, cur = [], []
for d in body:
    if d.get('big') and cur: caps.append(cur); cur = []
    cur.append(d)
    if d.get('big') or len(cur) >= 3 or sum(len(x['w']) for x in cur) >= 15 or re.search(r'[.,?!:]$', d['w']):
        if len(cur) > 1 and nrm(cur[-1]['w']) in STOP and not re.search(r'[.,?!:]$', cur[-1]['w']):
            caps.append(cur[:-1]); cur = [cur[-1]]
        else:
            caps.append(cur); cur = []
if cur: caps.append(cur)
CAPS = []
for k, c in enumerate(caps):
    nxt = caps[k + 1][0]['t0'] if k + 1 < len(caps) else None
    t1 = nxt if nxt is not None and nxt - c[-1]['t1'] < .6 else c[-1]['t1'] + .25
    CAPS.append({'t0': c[0]['t0'] - .04, 't1': min(t1, end_t0), 'big': any(x.get('big') for x in c),
                 'words': [{'w': x['w'].rstrip('.,:'), 't0': x['t0']} for x in c]})

# ---------- hook / stamp / cta / end ----------
s01w = [d for d in disp if d['scene'] == hook_id]
cut = next(k for k, d in enumerate(s01w) if d['w'].endswith('.')) + 1
hook_words = s01w[:cut]
hi = {nrm(w) for w in ep.get('hook_hi', [])}
stamp_t = find(ep['stamp_at']['scene'], ep['stamp_at']['word'])['t0']
HOOK = {'t1': hook_words[-1]['t1'] + .1, 'stampAt': stamp_t, 'stamp': ep['stamp_text'],
        'words': [{'w': d['w'].rstrip('.,'), 't0': d['t0'], 'hi': nrm(d['w']) in hi} for d in hook_words]}
c0 = find(ep['cta_from']['scene'], ep['cta_from']['word']); c1 = find(ep['cta_to']['scene'], ep['cta_to']['word'])
CTA = {'t0': c0['t0'], 't1': c1['t1'] + .3, 'handle': ep['handle'], 'sub': ep['cta_sub']}
END = {'t0': end_t0, 'lines': ep['end_lines'], 'pill': ep['end_pill']}

EVENTS = []
for e in ep.get('events', []):
    t = find(e.get('scene'), e['word'], e.get('nth', 1))['t0'] + e.get('off', 0)
    EVENTS.append({'t': round(t, 3), 'type': e['type'], 'v': e.get('v', 1)})
for s in scenes[1:]: EVENTS.append({'t': s['t0'] - .12, 'type': 'whoosh', 'v': .4})
for s in scenes:
    if 'label' in s: EVENTS.append({'t': s['label']['t'] + .05, 'type': 'pop', 'v': .4})
    if 'doc' in s: EVENTS.append({'t': s['doc']['t'], 'type': 'scratch', 'v': .35})
    if 'ruler' in s: EVENTS += [{'t': s['ruler']['t'], 'type': 'riser', 'v': .45}]
    if s['year'] and (s is scenes[0] or s['year'] != scenes[scenes.index(s) - 1]['year']): EVENTS.append({'t': s['t0'] + .3, 'type': 'tick', 'v': .5})
EVENTS += [{'t': 0, 'type': 'impact', 'v': .9}, {'t': 0, 'type': 'whooshin', 'v': .7}, {'t': stamp_t, 'type': 'stamp', 'v': 1.0},
           {'t': stamp_t, 'type': 'impact', 'v': .6},
           {'t': CTA['t0'] + (CTA['t1'] - CTA['t0']) * .55, 'type': 'tap', 'v': .6}, {'t': END['t0'], 'type': 'impact', 'v': .5}]
EVENTS.sort(key=lambda e: e['t'])

TL = {'title': ep['title'], 'dur': DUR, 'scenes': scenes, 'caps': CAPS, 'hook': HOOK, 'cta': CTA, 'end': END,
      'events': EVENTS, 'avatar': WEB + 'assets/avatar.png', 'capY': ep.get('capY', 1300)}
json.dump(TL, open(f'{HERE}/timeline.json', 'w'), ensure_ascii=False, indent=1)

# ---------- mix ----------
def load(path):
    pcm = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(pcm, np.float32).copy()
n = int(DUR * SR) + SR
voice = load(f'{HERE}/src/voice.mp3')
env = np.sqrt(lp(voice ** 2, 20).clip(1e-9)); g = np.minimum(1, (0.12 / np.maximum(env, 1e-4)) ** .35)
voice = norm(voice * g, .95)
mus = sf.read(f'{HERE}/assets/theme.wav')[0].astype(np.float32)
mus = np.tile(mus, int(np.ceil(n / len(mus))))[:n]
venv = np.zeros(n); venv[:len(voice)] = np.abs(voice); venv = lp(venv, 6); duck = 1 - .5 * np.clip(venv / (venv.max() * .3), 0, 1)
fade = np.ones(n); fo = int(1.4 * SR); end_i = int(DUR * SR); fade[end_i - fo:end_i] = np.linspace(1, 0, fo); fade[end_i:] = 0
mix = mus * .24 * duck * fade
mix[:len(voice)] += voice
for e in EVENTS:
    x = SFX[e['type']](e['v']) * .5; s = int(max(0, e['t']) * SR); m = min(n, s + len(x)); mix[s:m] += x[:m - s]
for s in scenes:
    if 'rain' in s['fx']: x = SFX['rainbed'](s['t1'] - s['t0'] + .5, .2); a = int(s['t0'] * SR); mix[a:a + len(x)] += x[:n - a]
mix = mix[:int(DUR * SR)]
peak = np.abs(mix).max(); mix = mix / peak * .89 if peak > .89 else mix
sf.write(f'{HERE}/mix.wav', mix.astype(np.float32), SR)
print(f'dur {DUR}s, scenes', ' '.join(f"{s['id']}@{s['t0']:.2f}" for s in scenes))
print(f'  align: {len(toks)} script words, {len(asr)} heard, {unmatched} non-equal blocks; caps {len(CAPS)}; events {len(EVENTS)}')
