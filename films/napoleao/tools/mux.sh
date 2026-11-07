#!/bin/sh
# mux.sh video.mp4 mix.wav out.mp4 — two-pass loudnorm to -14 LUFS / -1.5 dBTP, H.264 high, AAC 192k, faststart (Instagram-ready)
set -e
V="$1"; A="$2"; O="$3"
J=$(ffmpeg -hide_banner -nostats -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
F="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000"
ffmpeg -v error -y -i "$V" -i "$A" -map 0:v -map 1:a -af "$F" -c:v libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$O.tmp.mp4"
mv "$O.tmp.mp4" "$O"
ffmpeg -hide_banner -nostats -i "$O" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|True peak|Peak):" | tr -s ' ' | paste -sd' '
echo "$O"
