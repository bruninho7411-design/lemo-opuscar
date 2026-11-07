"""Download generated assets. stdin: JSON {"voice": url, "s02": url, ..., "v_s01": video url} -> src/, img/*.jpg, frames/<sid>/"""
import sys, os, json, subprocess, urllib.request
from PIL import Image
m = json.load(sys.stdin); os.makedirs('src', exist_ok=True); os.makedirs('img', exist_ok=True)
jobs = json.load(open('jobs.json')) if os.path.exists('jobs.json') else {}
for k, u in m.items():
    jobs[k] = u.rsplit('_', 1)[-1].split('.')[0]
    if k == 'voice': urllib.request.urlretrieve(u, 'src/voice.mp3')
    elif k.startswith('v_'):
        sid = k[2:]; urllib.request.urlretrieve(u, f'src/{sid}.mp4'); os.makedirs(f'frames/{sid}', exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'src/{sid}.mp4', '-vf', 'fps=30,scale=1080:1920:flags=lanczos', '-q:v', '2', f'frames/{sid}/%04d.jpg'], check=True)
    else:
        urllib.request.urlretrieve(u, f'src/{k}.png'); Image.open(f'src/{k}.png').convert('RGB').save(f'img/{k}.jpg', quality=92)
json.dump(jobs, open('jobs.json', 'w'), indent=0)
print('ok', list(m))
