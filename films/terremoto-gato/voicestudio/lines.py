"""Narration with VoiceStudio's OmniVoice: clone voicestudio/ref_voice.wav for every line, 2 takes each,
pick the take whose Whisper transcript is closest to the script. Writes voices/<id>.wav + voices/dur.json + voicestudio/report.json.
usage: <VoiceStudio>/.venv/bin/python voicestudio/lines.py [ids...]"""
import sys, os, json, re, unicodedata, torch, torchaudio, numpy as np
from scipy.signal import butter, sosfiltfilt
from omnivoice.models.omnivoice import OmniVoice
from faster_whisper import WhisperModel
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = json.load(open(os.path.join(HERE, 'lines.json')))
REF_TEXT = "Olha, sinceramente? Achei que ia ser simples. Não foi."
def norm(s):
    s = unicodedata.normalize("NFKD", s.lower()); s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]", " ", s).split()
def wer(ref, hyp):
    r, h = norm(ref), norm(hyp); d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            p, d[j] = d[j], min(d[j] + 1, d[j-1] + 1, p + (r[i-1] != h[j-1]))
    return d[-1] / max(1, len(r))
def trim(y, sr):
    y = sosfiltfilt(butter(4, 40, 'hp', fs=sr, output='sos'), y)
    e = np.convolve(np.abs(y), np.ones(240) / 240, 'same'); i = np.where(e > np.abs(y).max() * .02)[0]
    y = y[max(0, i[0] - int(.03 * sr)):min(len(y), i[-1] + int(.1 * sr))].copy()
    n, m = int(.005 * sr), int(.03 * sr); y[:n] *= np.linspace(0, 1, n); y[-m:] *= np.linspace(1, 0, m)
    return y.astype(np.float32)
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
w = WhisperModel("small", device="cpu", compute_type="int8")
prompt = m.create_voice_clone_prompt(ref_audio=os.path.join(HERE, 'voicestudio', 'ref_voice.wav'), ref_text=REF_TEXT)
tmp = os.path.join(HERE, 'voicestudio', 'takes'); os.makedirs(tmp, exist_ok=True)
rp = os.path.join(HERE, 'voicestudio', 'report.json'); report = json.load(open(rp)) if os.path.exists(rp) else {}
only = sys.argv[1:]
for l in L:
    if only and l['id'] not in only: continue
    takes = []
    for seed in (1, 2):
        torch.manual_seed(seed)
        kw = {'speed': l['speed']} if 'speed' in l else {}
        a = m.generate(text=l['text'], language="pt", voice_clone_prompt=prompt, **kw)[0].numpy()[0].astype('float64')
        y = trim(a - a.mean(), 24000); f = os.path.join(tmp, f"{l['id']}_s{seed}.wav"); torchaudio.save(f, torch.from_numpy(y)[None], 24000)
        hyp = " ".join(s.text.strip() for s in w.transcribe(f, language="pt", beam_size=5)[0])
        takes.append((wer(l.get('asr', l['text']), hyp), seed, f, len(y) / 24000, hyp))
        print(l['id'], seed, f"{takes[-1][3]:.2f}s wer {takes[-1][0]:.2f} | {hyp}", flush=True)
    b = min(takes)
    torchaudio.save(os.path.join(HERE, 'voices', l['id'] + '.wav'), torchaudio.load(b[2])[0], 24000)
    report[l['id']] = {'take': os.path.basename(b[2]), 'dur': round(b[3], 3), 'wer': round(b[0], 2), 'asr': b[4]}
    json.dump(report, open(rp, 'w'), ensure_ascii=False, indent=1)
json.dump({k: v['dur'] for k, v in report.items()}, open(os.path.join(HERE, 'voices', 'dur.json'), 'w'), indent=1)
