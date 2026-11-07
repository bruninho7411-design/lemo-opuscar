#!/bin/sh
# Rebuild "E se Napoleão acordasse em 2026?": voice (local) → timing → events → mix → render → master → cover. 0 credits.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=$(cd "$HERE/../.." && pwd); cd "$LIB"
SIZE=1080x1920; Q=${Q:-"ssaa=1&sm=1024"}
# voice: /home/user/ovenv/bin/python films/napoleao-2026/voicestudio/lines.py   (OmniVoice clone of voicestudio/ref_voice.wav, CPU)
(cd "$HERE" && python3 timing.py)
node core/render/events.mjs "$HERE" --size $SIZE --q "$Q"
python3 "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 30 --workers 4 --size $SIZE --q "$Q" --out "$HERE/out/video.mp4"
sh films/napoleao/tools/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/napoleao-2026.mp4"
node core/render/still.mjs "$HERE" 2.2 --size $SIZE --q "$Q" --out "$HERE/out" --prefix capa_
cp "$HERE/out/capa_2.2.jpg" "$HERE/capa.jpg"
