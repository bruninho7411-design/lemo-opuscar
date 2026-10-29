"""Designs a voice with OmniVoice voice design: tries instructs × seeds on a test sentence, keeps every take Whisper reads back
exactly, and reports pitch (median f0) and duration so the deepest clear take can be picked.
usage: python design.py <name> "<instruct>|<instruct>" [seeds]"""
import os, sys, json, torch, torchaudio, numpy as np, re, unicodedata
from omnivoice.models.omnivoice import OmniVoice
from faster_whisper import WhisperModel
HERE = os.path.dirname(os.path.abspath(__file__))
name, insts = sys.argv[1], sys.argv[2].split('|')
seeds = [int(s) for s in sys.argv[3].split(',')] if len(sys.argv) > 3 else [1, 2, 3]
TEXT = {"narr": "Ninguém sabia. Nem a família, nem os amigos. E foi exatamente assim que tudo começou.",
        "suit": "Boa noite. Eu sei exatamente quem você é, e sei quanto você ganha por mês.",
        "arlindo": "Sentiu saudade, garoto? Eu sempre soube que você ia longe. Só não sabia que ia tão rápido."}[name]
def norm(s):
    s = unicodedata.normalize("NFKD", s.lower()); s = "".join(c for c in s if not unicodedata.combining(c)); return re.sub(r"[^a-z0-9 ]", " ", s).split()
def f0(y, sr=24000):
    fr, out = int(.04 * sr), []
    for i in range(0, len(y) - fr, fr // 2):
        x = y[i:i + fr]; x = x - x.mean()
        if np.sqrt((x ** 2).mean()) < .02: continue
        c = np.correlate(x, x, 'full')[fr - 1:]; lo, hi = sr // 400, sr // 60
        k = lo + np.argmax(c[lo:hi]);
        if c[k] > .3 * c[0]: out.append(sr / k)
    return float(np.median(out)) if out else 0
torch.set_num_threads(os.cpu_count())
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
w = WhisperModel("small", device="cpu", compute_type="int8")
res = []
for ins in insts:
    for seed in seeds:
        torch.manual_seed(seed)
        a = m.generate(text=TEXT, language="pt", instruct=ins)[0].numpy()[0]
        f = os.path.join(HERE, 'takes', f'{name}_{re.sub("[^a-z]", "", ins)}_{seed}.wav'); torchaudio.save(f, torch.from_numpy(a)[None], 24000)
        hyp = " ".join(s.text.strip() for s in w.transcribe(f, language="pt")[0])
        ok = norm(hyp) == norm(TEXT)
        res.append({'file': f, 'instruct': ins, 'seed': seed, 'ok': ok, 'f0': round(f0(a), 1), 'dur': round(len(a) / 24000, 2), 'asr': hyp})
        print(json.dumps(res[-1], ensure_ascii=False), flush=True)
json.dump(res, open(os.path.join(HERE, f'design_{name}.json'), 'w'), ensure_ascii=False, indent=1)
