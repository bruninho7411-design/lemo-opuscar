#!/bin/sh
# Rebuilds "POV: você ficou milionário aos 23 — EP 2": voice → lip sync → events → subtitles → music/foley/mix → render → master → cover.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
SIZE=1080x1920
[ -f core/assets/polyhaven/photo_studio_loft_hall_2k.hdr ] || sh tools/fetch.sh hdri
# voice: VoiceStudio / OmniVoice (needs a VoiceStudio checkout with its venv: VS=/path/to/VoiceStudio)
[ -n "$VS" ] && PYTHONPATH="$VS" "$VS/.venv/bin/python" "$HERE/voicestudio/lines.py"
"$LIB/.venv/bin/python" "$HERE/voice.py"
node core/render/events.mjs "$HERE" --size $SIZE
node "$HERE/subs.mjs" && "$LIB/.venv/bin/python" core/render/srt.py "$HERE/cues.json" "$HERE/milionario-23-ep2.srt"
"$LIB/.venv/bin/python" "$HERE/mix.py"
# software GL: resumable chunked render, 2 workers (5–25 s a frame); on a GPU core/render/video.mjs with --q "msaa=4&taps=96&aos=16" is faster
node "$HERE/render_chunks.mjs" 0 2 & node "$HERE/render_chunks.mjs" 1 2 & wait
node "$HERE/render_chunks.mjs" join
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/milionario-23-ep2.mp4" 24 0
ffmpeg -v error -y -ss 2.2 -i "$HERE/milionario-23-ep2.mp4" -frames:v 1 -q:v 2 "$HERE/poster.jpg"
node core/render/still.mjs "$HERE" 2.2 --size $SIZE --q capa=1 --out "$HERE/out" --prefix capa_ && cp "$HERE/out/capa_2.2.jpg" "$HERE/capa.jpg"
