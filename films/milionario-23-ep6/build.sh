#!/bin/sh
# Rebuilds "POV: você ficou milionário aos 23 — EP 6": voice → lip sync → events → subtitles → music/foley/mix → render → master → poster.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
SIZE=1080x1920
# voice: VoiceStudio / OmniVoice (needs a VoiceStudio checkout with its venv: VS=/path/to/VoiceStudio)
[ -n "$VS" ] && PYTHONPATH="$VS" "$VS/.venv/bin/python" "$HERE/voicestudio/lines.py"
"$LIB/.venv/bin/python" "$HERE/bg/boil.py" office front
sh "$HERE/ai/frames.sh"   # the Wan 2.7 clips as stills for main.js
"$LIB/.venv/bin/python" "$HERE/voice.py"
node core/render/events.mjs "$HERE" --size $SIZE
node "$HERE/subs.mjs" && "$LIB/.venv/bin/python" core/render/srt.py "$HERE/cues.json" "$HERE/milionario-23-ep6.srt"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size $SIZE --out "$HERE/out/video.mp4"
sh "$HERE/mux.sh" "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/milionario-23-ep6.mp4" 24 0
# backgrounds: bg/<name>_v1.png are generated plates (Higgsfield, GPT Image 2.5, see CREDITS); bg/boil.py makes their three boiled drawings
# character shots: ai/v_*.mp4 are Wan 2.7 clips (Higgsfield) from the ai/k_*.png keyframes, lip-synced to the voice lines (see CREDITS, ai/PROMPTS.md); until a clip exists main.js draws its keyframe
