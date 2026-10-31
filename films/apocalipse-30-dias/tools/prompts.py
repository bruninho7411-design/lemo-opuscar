"""Print the voice take and the image batch requests for an episode (to paste into the Higgsfield tools).
usage: python3 tools/prompts.py ep02 [direction]"""
import sys, json
REF = {'voce': '11a69955-4593-4a16-96c8-264265534d66', 'caramelo': '9bc2e7d8-aa75-4826-baa2-04028f25e3b3', 'zumbis': '215966e3-64be-441b-a89c-449714e9f99e'}
REF.update(json.load(open('refs/extra.json')) if __import__('os').path.exists('refs/extra.json') else {})
STYLE = ("Vertical 9:16 frame from a 2D cartoon web series. Clean flat 2D illustration, bold black outlines, flat colors with soft subtle shading, "
         "detailed cartoon background, muted desaturated apocalyptic palette (grey-green, dusty blue, brown) with the mustard-yellow bucket hat as the accent color. "
         "Humans are stick figures with big round white heads, black dot eyes, line mouths, thin black line limbs and small round hands, exactly like the reference character sheets. "
         "Zombies are stick figures with pale green round heads and torn everyday clothes; cartoonish, no blood, no gore. ")
ep = json.load(open(sys.argv[1] + '/ep.json'))
d = ep.get('direction', '[tense, gripping storyteller, brisk pace]')
take = d + ' ' + ' '.join(s['say'] for s in ep['scenes'] if s['say'])
for k, v in ep.get('tags', {}).items(): take = take.replace(k, v + ' ' + k, 1)
print('TAKE', len(take.split()), 'words'); print(take)
reqs = []
for i, s in enumerate(ep['scenes']):
    if 'reuse' in s or not s.get('prompt'): continue
    p = STYLE + ('' if s.get('text_ok') else 'No text, no captions, no watermark. ') + 'SCENE: ' + s['prompt']
    r = {'index': i + 1, 'params': {'model': 'nano_banana_pro', 'resolution': '2k', 'aspect_ratio': '9:16', 'prompt': p}}
    if s.get('refs'): r['params']['medias'] = [{'role': 'image_references', 'value': REF[x]} for x in s['refs']]
    reqs.append(r)
print('REQS'); print(json.dumps(reqs, ensure_ascii=False))
