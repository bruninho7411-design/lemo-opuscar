#!/bin/sh
# Wan 2.7 clips (v_<name>.mp4, 722×1276 30 fps, see CREDITS) → f/<name>/NNNN.jpg at 1086×1920 for main.js, + f/index.json (frame counts)
cd "$(dirname "$0")"; set -e
mkdir -p f; echo "{" > f.json.tmp; first=1
for v in v_*.mp4; do [ -e "$v" ] || continue; n=${v#v_}; n=${n%.mp4}; rm -rf f/$n; mkdir -p f/$n
  ffmpeg -v error -y -i $v -an -vf "scale=1086:1920:flags=lanczos,unsharp=5:5:0.5" -q:v 3 f/$n/%04d.jpg
  c=$(ls f/$n | wc -l); [ $first = 1 ] || echo ',' >> f.json.tmp; printf '"%s": %s' $n $c >> f.json.tmp; first=0; done
echo '}' >> f.json.tmp; mv f.json.tmp f/index.json; cat f/index.json
