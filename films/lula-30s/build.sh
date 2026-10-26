#!/bin/sh
# Rebuilds "30 Segundos" from scratch: voice → events → subtitles → score/foley/mix → render → master → poster.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
SIZE=1080x1920
Q=${Q:-"noev&ssaa=1&noao&sm=2048"}          # software-GL settings; on a GPU use Q="noev" (2× supersampling, GTAO, 4096 shadows)
# voice: VoiceStudio/OmniVoice, see voicestudio/lines.py (run with the VoiceStudio venv)
# "$LIB/.venv/bin/python" core/tts/tts.py "$HERE/lines.json" "$HERE/voices/"
node core/render/events.mjs "$HERE" --size $SIZE
node "$HERE/subs.mjs" && "$LIB/.venv/bin/python" core/render/srt.py "$HERE/cues.json" "$HERE/lula-30s.srt"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size $SIZE --q "$Q" --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/lula-30s.mp4" 24 1
node core/render/still.mjs "$HERE" 37.4 --size $SIZE --q "$Q" --out "$HERE/out" --prefix poster_
cp "$HERE/out/poster_37.4.jpg" "$HERE/poster.jpg"
