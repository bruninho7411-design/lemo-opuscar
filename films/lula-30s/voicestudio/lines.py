import sys, json, re, unicodedata, torch, torchaudio, numpy as np
from omnivoice.models.omnivoice import OmniVoice
from faster_whisper import WhisperModel
# usage: <VoiceStudio>/.venv/bin/python lines.py <work dir with ref_voice.wav as cand14.wav> <out dir>
D, OUT = sys.argv[1], sys.argv[2]
# (id, start s, max s, text spoken, expected words for the check)
L = [
 ("h1", 0.1, 4.8, "E se todas as propostas do Lula virassem realidade... por só trinta segundos?"),
 ("h2", 5.1, 0.9, "Valendo!"),
 ("p1", 6.06, 3.0, "Tchau, escala seis por um. Quarenta horas por semana."),
 ("p2", 9.34125, 2.6, "Ganha até cinco mil? Imposto de renda: zero."),
 ("p3", 12.15375, 3.0, "Cesta básica sem imposto. E cashback pros mais pobres."),
 ("p4", 15.435, 2.6, "Creche pública. E escola em tempo integral."),
 ("p5", 18.2475, 2.85, "Pé-de-Meia pros estudantes, e mais Institutos Federais."),
 ("p6", 21.294375, 2.85, "Mais Médicos, especialistas... e a fila do sus andando."),
 ("p7", 24.34125, 1.7, "Mais Farmácia Popular."),
 ("p8", 26.21625, 3.05, "Ministério da Segurança Pública, mirando o dinheiro das facções."),
 ("p9", 29.4975, 2.6, "Entregador de app... com i, ene, esse, esse."),
 ("p10", 32.31, 3.6, "Política de cuidados: pra quem cuida, e pra quem envelhece."),
 ("c1", 36.35, 2.2, "Tudo. Ao mesmo tempo."),
 ("o1", 42.8, 3.9, "Agora a pergunta é... quanto disso sai do papel em quatro anos?"),
 ("o2", 46.9, 4.5, "Qual dessas você mais quer ver de verdade? Comenta aí."),
]
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
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
w = WhisperModel("small", device="cpu", compute_type="int8")
prompt = m.create_voice_clone_prompt(ref_audio=f"{D}/cand14.wav", ref_text="Olha, sinceramente? Achei que ia ser simples. Não foi.")
report = {}
FIX = json.load(open("/home/user/lemo-opuscar/films/lula-30s/voices/dur.json")); FIX["p5"] = 2.45
only = sys.argv[3:] 
for lid, t0, mx, text in L:
    if only and lid not in only: continue
    takes = []
    for seed in (1, 2):
        torch.manual_seed(seed)
        a = m.generate(text=text, language="pt", voice_clone_prompt=prompt, duration=FIX[lid])[0]
        a = a - a.mean()
        f = f"{D}/{lid}_s{seed}.wav"; torchaudio.save(f, a, 24000)
        hyp = " ".join(s.text.strip() for s in w.transcribe(f, language="pt", beam_size=5)[0])
        takes.append((wer(text, hyp), -seed, f, a.shape[-1] / 24000, hyp))
        print(lid, seed, f"{takes[-1][3]:.2f}s/{mx}", f"wer {takes[-1][0]:.2f}", "|", hyp, flush=True)
    best = min(takes)
    torchaudio.save(f"{OUT}/{lid}.wav", torchaudio.load(best[2])[0], 24000)
    report[lid] = {"take": best[2].split('/')[-1], "dur": round(best[3], 3), "wer": round(best[0], 2), "asr": best[4]}
    print("  ->", lid, report[lid]["take"], flush=True)
json.dump(report, open(f"{OUT}/report.json", "w"), ensure_ascii=False, indent=1)
