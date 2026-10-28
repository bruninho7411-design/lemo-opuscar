#!/bin/sh
# Rebuilds "POV: você ficou milionário aos 23 — EP 1": voice → lip sync → events → subtitles → score/foley/mix → render → master → poster.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
SIZE=1080x1920
# voice: VoiceStudio / OmniVoice (needs a VoiceStudio checkout with its venv: VS=/path/to/VoiceStudio)
[ -n "$VS" ] && PYTHONPATH="$VS" "$VS/.venv/bin/python" "$HERE/voicestudio/lines.py"
"$LIB/.venv/bin/python" "$HERE/voice.py"
node core/render/events.mjs "$HERE" --size $SIZE
node "$HERE/subs.mjs" && "$LIB/.venv/bin/python" core/render/srt.py "$HERE/cues.json" "$HERE/milionario-23-ep1.srt"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size $SIZE --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/milionario-23-ep1.mp4" 24 0
