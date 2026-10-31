# EP 6 — the one list of generations (Higgsfield), prepared before any is made

Generate once each; regenerate only on a concrete problem. Prices as quoted by Higgsfield on 2026-10-29 (get_cost):
GPT Image 2.5 medium 2k ≈ 1 credit; Wan 2.7 720p = 1.5 credits per second.

References already on Higgsfield (EP 5): cast `ece45c89-456d-4739-a5fc-211d68d30059` (k_duo), Arlindo `69e6a6fe-3e12-4fc2-bcda-c2c0e2f8ba0b`
(k_arl), shop front plate `cdbec47c-e867-44b5-b3e3-59c00fb53d4e`, Caio at the shop `8e12e457-4185-4f51-969e-5d159d8bc150` (k_caio_st),
Arlindo close-up `ff6be1bd-24dc-440e-8c4f-00ccf9a6f418` (k_arl_cu2).

## Keyframes (4 new, 4 credits) — gpt_image_2_5, 9:16, medium, 2k — made 2026-10-29: k_you_st `cd8b4877-9859-4858-8771-6b8510b729e1`, k_caio_in `e479dc53-3e0d-4790-8bbb-7bdbb898017b`, k_you_doc `d5a55d28-0ea9-4252-8a99-6459125e4216`, k_arl_mad `35d8e89a-e3de-4243-8b60-92ee27b87599`

| key | refs | prompt |
|---|---|---|
| k_you_st | cast + shop front | Same 2D animated series style and same character as the references: VOCÊ (lanky young man, messy brown hair, round black glasses, dark grey hoodie) stands on the sidewalk in front of the small laundromat of the second reference (mint green facade, striped coral awning, blank cream sign), morning light. Close-up from the chest up: completely calm, a small confident half-smile, one eyebrow slightly raised, looking straight at the viewer, a white glint on one lens. Polished professional 2D animation frame: clean dark outlines, flat colours, cel shading. Vertical 9:16, his face in the upper-middle third. No text. |
| k_caio_in | cast | Same 2D animated series style and same character as the reference: CAIO (dark brown skin, short black hair, mustard yellow bomber jacket over a white t-shirt) inside a bright laundromat, a row of front-loading washing machines behind him. Close-up from the chest up: sudden hope and excitement, eyes wide and sparkling, big open smile, both fists raised near his chin. Polished professional 2D animation frame: clean dark outlines, flat colours, cel shading. Vertical 9:16, his face in the upper-middle third. No text. |
| k_you_doc | cast | Same 2D animated series style and same character as the reference: VOCÊ (messy brown hair, round black glasses, dark grey hoodie) inside the same bright laundromat, washing machines behind him. Medium close-up: he calmly holds up a printed contract with one hand next to his face, a quiet, satisfied smile, looking at the viewer. Polished professional 2D animation frame: clean dark outlines, flat colours, cel shading. Vertical 9:16. No readable text on the paper. |
| k_arl_mad | Arlindo | Same 2D animated series style and same character as the reference: SEU ARLINDO (bald, white side hair, big white moustache, violet suit, red tie, gold pin) in the same office at night, standing behind his desk. Close-up from the chest up: furious, face red, eyes bulging, moustache bristling, mouth open shouting, crumpling an official paper in his fist. Polished professional 2D animation frame: clean dark outlines, flat colours, cel shading. Vertical 9:16, his face in the upper-middle third. No readable text. |

## Clips (6, ≈ 25.5 credits; a1 made 2026-10-30, 3 credits — 5 left: c1, y1, c2, y2 at 3 s each, a2 at 4 s = 24) — wan2_7, 720p, 9:16, `declined_preset_id` 24bae836-2c4a-48e0-89b6-49fcc0b21612

Each line goes in as audio_references, padded with .4 s of silence in front (the clip is placed .4 s before the line, main.js AISH);
the clip length is the padded line rounded up to whole seconds.

| clip | start image | audio | length | prompt |
|---|---|---|---|---|
| c1 | k_caio_st (EP 5) | c1 | 3 s | 2D cartoon animation, adult animated sitcom style. In front of the laundromat, the young man in the yellow jacket shakes the open letter and shouts the line from the audio in panic: his mouth moves in sync with the speech, eyes wide, sweat drops, he looks up from the letter at the viewer. Keep the exact 2D style of the image: clean dark outlines, flat colours, cel shading, the same character design. No morphing, no extra characters, no text. |
| y1 | k_you_st | y1 | 3 s | 2D cartoon animation, adult animated sitcom style. The young man with round glasses and a dark hoodie says the line from the audio, completely calm, with a small confident smile: his mouth moves in sync with the speech, he raises two fingers on "duas", a glint crosses his glasses. Slow camera push-in. Keep the exact 2D style of the image … No morphing, no extra characters, no text. |
| c2 | k_caio_in | c2 | 3 s | 2D cartoon animation, adult animated sitcom style. The young man in the yellow jacket says the line from the audio with growing hope and excitement: his mouth moves in sync with the speech, eyes widen and sparkle, he grins and shakes his raised fists. Keep the exact 2D style of the image … |
| y2 | k_you_doc | y2 | 3 s | 2D cartoon animation, adult animated sitcom style. The young man with round glasses holds up the contract and says the line from the audio calmly, with a quiet satisfied smile: his mouth moves in sync with the speech, he taps the paper once. Keep the exact 2D style … |
| a1 | k_arl_mad | a1 | 2 s | 2D cartoon animation, adult animated sitcom style. The bald old man with the white moustache and violet suit shouts the line from the audio in fury: his mouth moves in sync with the speech under the moustache, his face shakes, he crushes the paper in his fist. Keep the exact 2D style … |
| a2 | k_arl_cu2 (EP 5) | a2 | 4 s | 2D cartoon animation, adult animated sitcom style. The old man in the violet suit leans towards the viewer and says the line from the audio slowly, with a cold, menacing smile: his mouth moves in sync with the speech under the white moustache, his eyes narrow, his finger slides the gold coin forward on the desk. Slow camera push-in. Keep the exact 2D style … |

After download: `sh ai/frames.sh` (clips → ai/f/), then the normal build; main.js swaps each keyframe for its clip by itself.

**Not generated (2026-10-30):** the film was finished from the EP 5 clips instead (TREATMENT.md, last section). The list above stays as
the recipe if the user later wants every EP 6 line on its own clip.
