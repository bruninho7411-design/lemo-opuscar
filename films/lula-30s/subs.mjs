// CAPS (story.js) → cues.json for core/render/srt.py
import { CAPS } from './story.js';
import fs from 'fs';
fs.writeFileSync(new URL('./cues.json', import.meta.url), JSON.stringify(CAPS.map(c => ({ t0: +c.t0.toFixed(3), t1: +c.t1.toFixed(3), text: c.lines.join('\n') })), null, 1));
