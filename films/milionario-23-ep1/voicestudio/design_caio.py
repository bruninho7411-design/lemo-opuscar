"""Designs Caio's voice: tries OmniVoice voice-design instructs × seeds, keeps the first take Whisper reads back exactly → ref_caio.wav."""
import os, torch, torchaudio, numpy as np
from omnivoice.models.omnivoice import OmniVoice
from faster_whisper import WhisperModel
HERE = os.path.dirname(os.path.abspath(__file__))
TEXT = "Mano, sério, você não vai acreditar no que aconteceu hoje."
torch.set_num_threads(os.cpu_count())
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
w = WhisperModel("small", device="cpu", compute_type="int8")
for ins in ["male, young adult, high pitch", "male, teenager, moderate pitch", "male, young adult, moderate pitch"]:
    for seed in (11, 12, 13):
        torch.manual_seed(seed)
        a = m.generate(text=TEXT, language="pt", instruct=ins)[0].numpy()[0]
        f = os.path.join(HERE, 'takes', f'caio_{ins.replace(", ", "_").replace(" ", "")}_{seed}.wav'); torchaudio.save(f, torch.from_numpy(a)[None], 24000)
        hyp = " ".join(s.text.strip() for s in w.transcribe(f, language="pt")[0])
        print(ins, seed, '|', hyp, flush=True)
        if hyp.lower().startswith("mano") and "acreditar" in hyp.lower() and "hoje" in hyp.lower():
            torchaudio.save(os.path.join(HERE, 'ref_caio.wav'), torch.from_numpy(a)[None], 24000); print('KEEP', f); raise SystemExit
