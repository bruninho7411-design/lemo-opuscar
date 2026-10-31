"""Transcribe audio with faster-whisper; prints text, writes words JSON if out path given.
usage: python3 asr.py audio [words_out.json] [model]"""
import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else None
model = sys.argv[3] if len(sys.argv) > 3 else 'small'
pcm = subprocess.run(['ffmpeg','-v','quiet','-i',src,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32)/32768
m = WhisperModel(model, compute_type='int8')
segs, info = m.transcribe(audio, language='pt', word_timestamps=True, vad_filter=False)
words = []
for s in segs:
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text}")
    for w in s.words: words.append({'w': w.word.strip(), 't0': round(w.start,3), 't1': round(w.end,3)})
print('DUR', len(audio)/16000)
if out: json.dump(words, open(out,'w'), ensure_ascii=False, indent=0)
