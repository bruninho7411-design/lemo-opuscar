#!/bin/sh
cd /home/user/cidade-do-insta
npx remotion bundle ep11/src/index.ts --out-dir ep11/work/bundle --public-dir=public --log=error >/dev/null 2>&1 || npx remotion bundle ep11/src/index.ts --out-dir ep11/work/bundle --public-dir=public --log=error
for s in "$@"; do f=$(python3 -c "print(round($s*30))"); npx remotion still ep11/work/bundle Reel ep11/work/s_$s.jpg --image-format=jpeg --scale=0.25 --frame=$f --gl=swangle --log=error 2>&1 | tail -3; done
