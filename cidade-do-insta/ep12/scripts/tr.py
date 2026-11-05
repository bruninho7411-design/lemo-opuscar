import sys, subprocess, numpy as np, json
from faster_whisper import WhisperModel
def load(p):
    raw=subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).copy()
m=WhisperModel(sys.argv[2] if len(sys.argv)>2 else "small",device="cpu",compute_type="int8")
wt=len(sys.argv)>3
segs,info=m.transcribe(load(sys.argv[1]),language="pt",word_timestamps=wt)
words=[]
for s in segs:
    print(f"[{s.start:5.2f}-{s.end:5.2f}] {s.text}")
    if wt: words+=[dict(w=w.word.strip(),s=round(w.start,3),e=round(w.end,3)) for w in s.words]
if wt: json.dump(words,open(sys.argv[3],"w"),ensure_ascii=False,indent=0)
