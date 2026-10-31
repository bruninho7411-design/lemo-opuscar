# 30 dias no apocalipse zumbi: produção

Série de Reels (1080×1920, 50–60 s, pt-BR) para @o_que_aconteceria_se. A história e o formato estão em [`SERIE.md`](SERIE.md).
Mídia gerada (imagens, voz, vídeos) fica fora do git; aqui ficam roteiros, ferramentas e o player.

## Pipeline de um episódio (`epNN/`)

1. **Roteiro**: `epNN/ep.json` (cenas com `say`, `prompt`, `refs`, `motion`, `fx`, `hud`; `cold_open`, `events`, `cover`).
2. **Prompts**: `python3 tools/prompts.py epNN` imprime o take de voz e os pedidos de imagem.
3. **Higgsfield**: voz `elevenlabs_v4` com a voz do usuário "Narrador Milionario 23" (`f629c2d7-19cb-4b43-a067-8fce6e3804fb`, element, stability 0.45); imagens `nano_banana_pro` 2k 9:16 com as fichas de personagem como `image_references` (ids em `tools/prompts.py` e `refs/extra.json`); uma cena animada por episódio com `kling3_0` std 6 s sem som (`start_image` = job da imagem).
4. **Download**: `python3 tools/fetch.py epNN < urls.json` (`{"voice": url, "s01": url, "v_s07": url_do_video}`).
5. **Alinhamento**: `python3 tools/asr.py epNN/src/voice.mp3 epNN/src/words.json small`.
6. **Montagem + mix**: `python3 tools/build.py epNN` → `timeline.json`, `mix.wav` (trilha `assets/theme.wav`, efeitos de `tools/sound.py`).
7. **Render**: da raiz do repo, `node core/render/video.mjs films/apocalipse-30-dias/player --size 1080x1920 --fps 30 --workers 4 --q ep=epNN --out films/apocalipse-30-dias/epNN/out/video.mp4`, depois `sh films/apocalipse-30-dias/tools/mux.sh <video> <mix.wav> <final.mp4>`.
8. **Capa**: `python3 tools/cover.py epNN`; **legenda**: `epNN/out/LEGENDA_EPNN.txt`.

Custo médio por episódio: ~35 créditos Higgsfield (9–10 imagens × 2, voz ~4, Kling ~9).

## Regras aprendidas

- Previsor de viralização (Higgsfield, só aceita ≤ 16 s): gancho 25/100 com abertura lenta. Por isso todo episódio abre com o texto inteiro do gancho no quadro 0, impacto sonoro e uma **abertura fria** (a cena mais forte do episódio nos primeiros ~2,4 s).
- Conferir toda imagem: o modelo às vezes põe um chapéu amarelo em lugar errado ou veste o boneco palito; refazer essas.
