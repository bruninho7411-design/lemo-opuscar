# Série "E se ___ acordasse em 2026?" — guia de produção

Perfil @o_que_aconteceria_se (meta: 10 mil seguidores). Reels 1080×1920, 45–55 s, pt-BR. Animação 3D em blocos (voxel) feita em código (three.js), sem gerar imagem/vídeo por IA. **Custo por vídeo: ~1,5 crédito Higgsfield (só a voz).**

Filmes prontos (branch `claude/napoleon-video-hooks-reuse-36ascj` do repo `lemo-opuscar`): `films/napoleao-2026`, `einstein-2026`, `epstein-2026`, `mj-2026`, `dumont-2026`, `cleopatra-2026`, `pedro2-2026`, **`vangogh-2026` (modelo mais recente — copie dele)**.

## Fórmula do roteiro (ordem fixa)
1. **h1** gancho: "E se ___... acordasse em dois mil e vinte e seis?"
2. **v1** acorda (X anos depois), onde e como, com um laço aberto.
3. **v2/v3** 2 fatos reais surpreendentes, específicos e com números (verificar!).
4. **c1** "Se você ___, curte e segue." (frase que gera identificação)
5. **v4** reação ao mundo de 2026 (celular, TikTok, exposição, etc.).
6. **v5** enquete polêmica: "E pra você: A ou B? Comenta."
7. **p1** promo: "E essas animações? Você pode aprender a fazer! O curso Quadro a Quadro tá com oferta de lançamento. Link na bio." (site: quadroaquadroonline.com.br)
8. **v6** sorteio + próximo: "E quem comentar, seguir e republicar... concorre pra aparecer nos próximos vídeos! Agora diz aí: quem a gente acorda no próximo?"

Tom: narrador animado. Personagens sensíveis (crimes reais): tom sério, sem humor sobre os crimes, sem acusar terceiros.

## Ganchos e edição (sempre)
- **Quadro 0 com ação** temática que bate na tela em ~1,5–2 s na palavra "em" do h1 (`TI = at('h1','em')`): avião caindo (Dumont), naja dando bote (Cleópatra), coroa caindo (Pedro II), vórtice da Noite Estrelada + respingo de tinta (Van Gogh). Título "E SE ___ ACORDASSE... EM 2026?" já no quadro 0.
- Depois do impacto: close de cima no rosto deitado, olhos abrem ("vinte") com flash; monitor cardíaco "MORTO DESDE ANO · 0 BPM" → "SINAIS VITAIS: DE VOLTA".
- Contador "ANOS DESDE A MORTE"; adesivos de laço aberto ("👀 ESPERA O FINAL", "🎁 SORTEIO NO FINAL", um adesivo temático); barra de progresso no topo.
- Transição em chicote (giro + borrão + whoosh) em todo corte; zoom-soco nos números; legenda palavra a palavra com destaque dourado.
- Congelamento com carimbo vermelho no fato mais forte (FRZ).
- Meio: coração + cartão "Seguir" do perfil com dedo tocando (ctaCard) + gesto do personagem.
- Enquete animada (COMENTA), bastidores em wireframe + timeline de edição + cartão do curso + "👆 LINK NA BIO", cartão de sorteio com ✅, cartão final "QUEM A GENTE ACORDA NO PRÓXIMO?" com 4 sugestões + COMENTA + SEGUE PRO PRÓXIMO.

## Pipeline (a partir de `films/vangogh-2026`)
Setup do container novo: `cd lemo-opuscar && git fetch origin claude/napoleon-video-hooks-reuse-36ascj && git checkout origin/claude/napoleon-video-hooks-reuse-36ascj -- films/` ; `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps` ; `pip install soundfile scipy faster-whisper`.

1. `mkdir films/NOME-2026/{src,out}` e copiar de `vangogh-2026`: `main.js world.js story.js post.js index.html mix.py avatar.png timing.py fonts/`.
2. Voz: Higgsfield `generate_audio`, model `elevenlabs_v4`, `stability 0.4`, `dialogue:[{voice_id:"f629c2d7-19cb-4b43-a067-8fce6e3804fb", voice_type:"element", text}]` (voz "Narrador Milionario 23"), um take só, com tags de emoção por trecho ([urgent, dramatic narrator], [leaning in]...). Baixar em `src/voice_raw.mp3`; `ffmpeg -i src/voice_raw.mp3 -af atempo=1.06 src/voice.mp3`.
3. `lines.json` = mesmo texto sem tags, dividido em h1,v1,v2,v3,c1,v4,v5,p1,v6; em `timing.py` ajustar `REP` (números falados → "2026", "135 ANOS"...). `python3 timing.py` → `timing.js`.
4. `world.js`: trocar só a parte "the world" (cenário, modelo do gancho, personagem com `person({...})` — opções: hair, beard, mustache, long, fringe, liner, hat: bicorne/fedora/panama/crown/straw/cap, coat, vest...). Manter `R.mj` = personagem em pé.
5. `main.js`: trocar `SH` (planos), câmera especial do gancho, `PUNCH`, título `L1`, texto do ECG, `phoneUI/ruler/euStars/live` (cartões dos fatos e enquete), adesivo/contador em `hud`, `FRZ` + texto do carimbo, luzes, `CH` (sugestões), eventos de som. `mix.py`: evento do gancho (`drop`) e som do impacto.
6. Testar: `node core/render/events.mjs films/NOME --size 1080x1920 --q "ssaa=1&sm=1024"` ; `python3 films/NOME/mix.py` ; stills com `node core/render/still.mjs films/NOME 0 1.5 ... --size 1080x1920 --q "ssaa=1&sm=1024" --out <scratch>` e conferir em contact sheet (`core/render/sheet.py`).
7. Render: `node core/render/video.mjs films/NOME --fps 30 --workers 4 --size 1080x1920 --q "ssaa=1&sm=1024" --out films/NOME/out/video.mp4` ; `sh films/napoleao/tools/mux.sh films/NOME/out/video.mp4 films/NOME/out/mix.wav films/NOME/NOME.mp4` (-14 LUFS).
8. Capa: `still.mjs ... --q "ssaa=1&sm=1024&cover=SEGUNDO"` (modo capa: só o título sobre o 3D) → `capa.jpg`. Legenda do post em `LEGENDA.txt` (gancho, fato, pergunta, sorteio, curso, 5 hashtags com #oqueaconteceriase).
9. Conferir o MP4 final (frames + duração), commitar com `git add -f films/NOME/...`, push, e enviar MP4 + capa + legenda.
