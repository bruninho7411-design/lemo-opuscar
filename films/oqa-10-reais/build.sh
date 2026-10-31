#!/bin/sh
# Rebuilds "E se seu pai guardasse R$10 toda noite enquanto você dormia?": voice → events → mix → render → master.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
cd "$LIB"
[ -n "$VS" ] && PYTHONPATH="$VS" "$VS/.venv/bin/python" "$HERE/voicestudio/lines.py"   # VS=/path/to/VoiceStudio
sh "$HERE/ai/frames.sh"   # the Wan 2.7 clips (ai/v_c*.mp4) as stills for main.js
"$LIB/.venv/bin/python" "$HERE/voice.py"
node core/render/events.mjs "$HERE" --size 1080x1920
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
sh "$HERE/mux.sh" "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/oqa-10-reais.mp4" 24 0
