// subtitle events in events.json → cues.json for core/render/srt.py
import { readFileSync, writeFileSync } from 'fs';
const E = JSON.parse(readFileSync(new URL('./events.json', import.meta.url)));
writeFileSync(new URL('./cues.json', import.meta.url), JSON.stringify(E.ev.filter(e => e.type === 'sub').map(s => ({ t0: s.t, t1: s.t1, text: s.text })), null, 1));
