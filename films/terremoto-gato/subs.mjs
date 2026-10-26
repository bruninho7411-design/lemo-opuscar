// VO (story.js) + voices/dur.json → cues.json for core/render/srt.py (same timing rule as the burned-in captions)
import { VO } from './story.js';
import fs from 'fs';
const D = JSON.parse(fs.readFileSync(new URL('./voices/dur.json', import.meta.url)));
const cues = VO.map((v, i) => { const nx = VO[i + 1]; let b = v.t + Math.max(1.8, D[v.id] + .6); if (nx) b = Math.min(b, nx.t - .05); return { t0: +(v.t - .05).toFixed(3), t1: +b.toFixed(3), text: v.text }; });
fs.writeFileSync(new URL('./cues.json', import.meta.url), JSON.stringify(cues, null, 1));
