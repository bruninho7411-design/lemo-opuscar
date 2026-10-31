"""Download an episode's generated assets. stdin: JSON {"voice": url, "s01": url, ..., "v_s05": video url}
usage: python3 tools/fetch.py ep02 < urls.json   -> src/, img/*.jpg, frames/<sid>/, contact sheet in scratch"""
import sys, os, json, subprocess, urllib.request
from PIL import Image
EP = sys.argv[1]; m = json.load(sys.stdin); os.makedirs(f'{EP}/src', exist_ok=True); os.makedirs(f'{EP}/img', exist_ok=True)
jobs = json.load(open(f'{EP}/jobs.json')) if os.path.exists(f'{EP}/jobs.json') else {}
for k, u in m.items():
    jobs[k] = u.rsplit('_', 1)[-1].split('.')[0]
    if k == 'voice': urllib.request.urlretrieve(u, f'{EP}/src/voice.mp3')
    elif k.startswith('v_'):
        sid = k[2:]; urllib.request.urlretrieve(u, f'{EP}/src/{sid}.mp4'); os.makedirs(f'{EP}/frames/{sid}', exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{EP}/src/{sid}.mp4', '-vf', 'fps=30,scale=1080:1920:flags=lanczos', '-q:v', '3', f'{EP}/frames/{sid}/%04d.jpg'], check=True)
    else:
        urllib.request.urlretrieve(u, f'{EP}/src/{k}.png'); Image.open(f'{EP}/src/{k}.png').convert('RGB').save(f'{EP}/img/{k}.jpg', quality=92)
json.dump(jobs, open(f'{EP}/jobs.json', 'w'), indent=0)
imgs = sorted(f for f in os.listdir(f'{EP}/img') if f.endswith('.jpg'))
if imgs and any(not k.startswith('v_') and k != 'voice' for k in m):
    th = [Image.open(f'{EP}/img/{f}').resize((216, 384)) for f in imgs]; cols = 5
    sh = Image.new('RGB', (222 * cols, 390 * ((len(th) + cols - 1) // cols)), 'white')
    for i, im in enumerate(th): sh.paste(im, ((i % cols) * 222, (i // cols) * 390))
    out = f'/tmp/claude-0/-home-user/1c3c7979-f69b-55c1-a274-40f8a410bc74/scratchpad/{EP}_sheet.jpg'; sh.save(out, quality=80); print(out)
print('ok', list(m))
