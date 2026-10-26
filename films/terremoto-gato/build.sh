#!/bin/sh
# Rebuilds "POV: terremoto 8.0" from scratch: voice → events → subtitles → score/foley/mix → render → master → poster.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
SIZE=1080x1920
Q=${Q:-"ssaa=1&sm=2048"}          # software GL; on a GPU use Q="ssaa=2&sm=4096"
# voice: VoiceStudio / OmniVoice (needs a VoiceStudio checkout with its venv: VS=/path/to/VoiceStudio)
[ -n "$VS" ] && "$VS/.venv/bin/python" "$HERE/voicestudio/lines.py"
node core/render/events.mjs "$HERE" --size $SIZE
node "$HERE/subs.mjs" && "$LIB/.venv/bin/python" core/render/srt.py "$HERE/cues.json" "$HERE/terremoto-gato.srt"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size $SIZE --q "$Q" --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/terremoto-gato.mp4" 24 0
node core/render/still.mjs "$HERE" 18.2 --size $SIZE --q "$Q" --out "$HERE/out" --prefix poster_
cp "$HERE/out/poster_18.2.jpg" "$HERE/poster.jpg"
