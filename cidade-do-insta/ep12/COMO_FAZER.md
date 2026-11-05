# Cidade do Insta: como fazer os vídeos (guia para continuar em outro chat)

Cole este arquivo no começo de um chat novo e diga: "leia o COMO_FAZER.md e faça o próximo episódio".
O kit com o código fica em `cidade-do-insta-kit/` (19 MB). O episódio mais recente (ep. 11, vídeo do jogo) está em `src/`.

## 1. O canal

- **Perfil:** @cidade_do_insta. Bio: "Vocês decidem o rumo da cidade · Encomende personagens e construções · Aprenda a criar animações com IA".
- **Links na bio:** quadroaquadroonline.com.br (loja e jogo em /cidade/) e o curso.
- **Mascote:** **Prefeito Capivaldo**, uma capivara low-poly com capacete laranja (com casinha), camisa verde-azulada, faixa verde de prefeito e prancheta. O avatar fica em `public/avatar.png`.
- **Formato:** Reel 1080x1920, 30fps, de 30 a 50s. Narração com a voz do usuário, legenda palavra por palavra e título fixo no topo. Tem zoom em cada corte, "soco" de zoom nas palavras fortes, efeitos sonoros e trilha alegre. O vídeo termina em loop: a última cena corta para o mesmo quadro do começo.
- **Público:** jovem e brasileiro, que comenta muito. O tempo médio assistido fica entre 9 e 12s, então o gancho dos primeiros 2–3s é o que mais importa.

## 2. Mecânica da série (o que já foi prometido ao público)

- **Seguiu = 1 morador:** uma casa na avenida ou nas ruas, com o @ na placa.
- **Só comentou, sem seguir:** casinha "caída" nos arredores, cinza, com telhado torto.
- **Votação:** toda votação é feita por **enquete nos comentários (A ou B)**. A mais votada vira obra no episódio seguinte.
- **Vagas de emprego:** sorteadas entre comentaristas ou seguidores reais, sempre com `random.SystemRandom`, e o sorteio fica salvo em `historico/`.
- **Mansões:**
  - Mansão 1: @nicollas__033 (sorteio).
  - Mansão 2: @davi_206k (sorteio).
  - Mansão 3: reservada.
- **Dono do shopping:** sorteado **quando bater 10 MIL seguidores**. Para participar, a pessoa curte, comenta, republica e posta nos stories. Até agora a meta não foi batida (último número: 8.631 ou 8.700).
- **Sorteio do ep. 10:** **1 kit completo** (personagem + mansão) para quem curtir, republicar e postar nos stories.
- **Todo vídeo:** chamada para seguir e curtir. Depois do ep. 5 entrou também o curso ou a loja na bio.

### Episódios já feitos

| Ep | Resultado anunciado | Novidade | Enquete |
|---|---|---|---|
| 1 | cidade com 0 moradores | regras (seguiu = morador, comentou = terreno) | Pizzaria × Lagoa |
| 2 | Pizzaria (construída peça por peça) | | Calabresa × Frango c/ catupiry |
| 3 | Calabresa, 30 moradores com @ | | Casas × Campo de futebol |
| 4 | Casas: 261 casas com @, arredores, 3 mansões, mansão 1 sorteada | | Tatuagem × Mercadinho |
| 5 | Mercadinho 93%, 751 moradores, +4 ruas, mansão 2 | curso na bio | Parque × Shopping |
| 6 | Shopping 64%, 1978 moradores, 3 funcionários sorteados | dono do shopping via sorteio | Hospital × Escola |
| 7 | Hospital 63%, 3837 moradores, ambulância, equipe sorteada | meta 10 mil | Estádio × Aeroporto |
| 8 | Aeroporto 56%, 4456 moradores, avião pousando, tripulação | | Delegacia × Bombeiros |
| 9 | Delegacia, 8085 moradores, 3 policiais reais | loja | Água × Energia |
| 10 | vídeo de VENDAS da loja (preços, kit, sorteio, jogo) | | sem enquete |
| 11 | vídeo do JOGO 3D (gravação real do site) | | sem enquete |
| 12 | Água 66%: Estação de Água, cidade refeita em quarteirões (~8 mil casas), 3 funcionários sorteados | gancho da pedra caindo no reservatório; site "digita seu @" | Usina de energia × Bombeiros |

**Pendente:** o resultado da enquete Usina de energia × Bombeiros do ep. 12.

Pessoas sorteadas:
- Funcionários do shopping: a.fernandozx, ericksanttos_10, dias_1353.
- Hospital: médico tiaguinho.thp, enfermeira sosoh124365, recepção lauraso_uza.
- Aeroporto: piloto deboragisella2026, comissário deassisverax.
- Polícia: delegado lifestayle_venna, policiais joao9860miguel e gabriel_rzt1221.
- Estação de água (ep. 12): chefe pedrohenriquegalvao.2025, operação sofiamanuelalandgrafmanuela, manutenção roseanelaura2023.

### Cidade em quarteirões (desde o ep. 12)
`src/three/City.tsx` substitui o World antigo: grade de quarteirões (PITCH 30), avenidas em volta da praça, casas instanciadas, casas com @ mais perto da praça, prédios antigos posicionados por bloco (`SPECIAL`), aeroporto a leste, arredores a oeste. Obra nova: adicionar um bloco em `SPECIAL` e o componente no `City`.

## 3. Ferramentas

- **Remotion 4 + three.js** (`@remotion/three`) para a cidade 3D e o personagem, feitos só com formas simples em código. Não usa imagem gerada por IA.
- **Voz:** Higgsfield MCP, `generate_audio`, modelo `seed_audio`, voz do usuário `voice_type: "element"`, `voice_id: "f629c2d7-19cb-4b43-a067-8fce6e3804fb"` ("Narrador Milionario 23"), `speech_rate` de 10 a 12, wav 44100. Custa uns 4 créditos por narração.
- **Legenda e tempo de cada palavra:** faster-whisper `small` (`scripts/tr.py`), depois `scripts/prep_template.py`. Ele alinha o roteiro escrito com o que o Whisper ouviu e grava `src/words.json` (palavras e destaques) e `src/mouth.json` (boca do prefeito).
- **Trilha e efeitos:** `scripts/audio_template.py` com `core/audio/sampler.py` e `sfx.py` do repositório **lemo-opuscar** (instrumentos CC0 das bibliotecas `vcsl` e `freepats`: `sh tools/fetch.sh instruments vcsl` e `... freepats`). Rode a partir da pasta do lemo-opuscar. Depois normalize: `ffmpeg -af loudnorm=I=-14:TP=-1.5:LRA=11`.
- **Render:** `npx remotion render src/index.ts Reel out.mp4 --gl=swangle --codec=h264 --crf=17 --audio-codec=aac --audio-bitrate=256k --concurrency=4 --timeout=120000`.
- **Capa:** `npx remotion still src/index.ts Cover capa.png --gl=swangle`. Todo o texto fica dentro da área 3:4 central, para aparecer inteiro no grid.
- **Conferir planos:** `scripts/stills.sh 0.5 3 7 ...` gera quadros pequenos, que você junta numa folha com ffmpeg xstack e olha antes de renderizar.
- **Loja e jogo:** `scripts/grab.js` lê o texto da loja com Playwright (a página é SPA e o WebFetch não lê). `scripts/rec2.js` grava o jogo em `quadroaquadroonline.com.br/cidade/jogo/` (540x960, depois sobe a escala para 1080x1920).
- **Dados do Instagram:** Windsor.ai (conector `instagram`). Traz número de seguidores, alcance e texto dos comentários, mas **não** traz a lista de seguidores nem o @ de quem comentou. O acesso caiu em 04/11 por troca de senha e precisa ser reconectado. As listas de nomes vieram de prints e gravações de tela do usuário; leia os @ com cuidado.

### Instalação num ambiente novo

```bash
cd cidade-do-insta-kit && npm i            # remotion 4.0.539, @remotion/three, three, @react-three/fiber, react 19
python3 -m venv venv && ./venv/bin/pip install faster-whisper numpy soundfile soxr scipy
git clone <lemo-opuscar> && cd lemo-opuscar && sh tools/fetch.sh instruments vcsl && sh tools/fetch.sh instruments freepats
```

O `faster-whisper` dá erro com `av` novo. Por isso o `tr.py` decodifica o áudio com ffmpeg para numpy.

## 4. Estrutura do código (`src/`)

- **`timeline.ts`:** `TOTAL_SEC`, `LOOP_AT` e **`SHOTS`**: a lista de planos com início e fim, câmera de/para (pos, look, fov), título e subtítulo do topo. Também guarda os tempos em que cada coisa surge no mundo (`*_START`, `*_T`; usa -9 quando a coisa já existe e 999 quando não deve aparecer).
- **`three/World.tsx`:** a cidade inteira.
  - Rio, árvores, praça, pizzaria, mercadinho, lagoa.
  - Avenida com uma casa por seguidor (`people.json` → `followers`) e ruas extras feitas com InstancedMesh (`TOTAL_FOLLOWERS`, `STREET_X`).
  - Casinhas dos arredores (`commenters`) e as 3 mansões.
  - Shopping, hospital com ambulância, aeroporto com avião, delegacia com viatura, castelo, e o pedestal com personagem personalizável.
  - `NameTag` (o @ flutuando em cima da cabeça).
  - Árvores ficam de fora das áreas listadas em `makeTrees`. Se uma câmera ficar "preta", provavelmente está dentro de uma árvore: adicione a área ali.
- **`three/Capy.tsx`:** a capivara (prefeito e moradores): pelo, camisa, boné, capacete, faixa, laranja na cabeça, pose e boca.
- **`three/Scene.tsx`:** câmera, luz, poses do prefeito por plano (`ALIAS` reaproveita poses) e `cheer` (moradores pulando).
- **`overlays.tsx`:** os elementos 2D.
  - Header e Caption, FollowCard (botão Seguir sendo tocado), CommentCard, LikeHeart, PollCard (enquete A/B), Confetti, Counter (contador gigante).
  - Siren (tela piscando vermelho e azul), GoalBar (meta dos 10 mil), Rules (checklist), WorkersCard (vagas sorteadas), Raffle (sorteio tipo caça-níquel).
  - CourseCard, ShopCard, Chips, PriceTag (preço "de" riscado e "por"), KitCard, ProductGrid, Countdown, GiftCard, PhoneCTA (celular com mão tocando no link da bio).
  - GameClips (gravação do jogo em tela cheia) e Callout (etiquetas).
  - Ícones das enquetes.
- **`Reel.tsx`:** junta tudo. `PUNCH` (tempos do soco de zoom), `B0` (planos com fundo desfocado) e a lista de overlays com seus tempos t0/t1.
- **`Cover.tsx`:** a capa. **`people.json`:** seguidores, novos, comentaristas e sorteados.

## 5. Passo a passo de um episódio novo

1. **Melhorar o pedido** e mostrar ao usuário um briefing curto: gancho, resultado da votação, novidade, sorteio, meta, CTA e nova enquete. Depois disso, fazer sem parar.
2. Se houver números ou nomes novos (prints de seguidores ou comentários), atualizar `people.json`. Sortear vagas com `random.SystemRandom().sample` e salvar num `.txt`.
3. Se o vídeo citar preços ou ofertas, **ler a loja de novo com `grab.js`**. Os preços mudam: o ep. 10 precisou ser refeito por isso.
4. Escrever o roteiro: gancho forte no primeiro segundo ("URGENTE!", "PARADO AÍ!", "Um avião acabou de pousar…"), resultado, novidade, sorteio/meta, curso ou loja, enquete A/B e um "senão…" engraçado. Gerar a voz com o Higgsfield.
5. Transcrever com `tr.py`, rodar `prep` (gera words.json e mouth.json) e escrever **`SHOTS`** com os cortes nas palavras-chave.
6. Adicionar a obra nova em `World.tsx` (aparecendo com `pop`) e os overlays em `Reel.tsx`.
7. Conferir planos com `stills.sh`. Corrigir câmeras dentro de árvores ou paredes e textos sobrepostos.
8. Montar a trilha e os efeitos: copiar o `audio_template.py` e mudar DUR, `cuts`, as entradas da trilha e os efeitos sonoros. Depois `loudnorm` para -14 LUFS.
9. Renderizar o vídeo e a capa, e escrever a legenda (5 hashtags + enquete + chamada) com o comentário para fixar.
10. Entregar o vídeo, a capa e a legenda, e avisar o que conferir (nomes incertos, promessas, sorteio).

## 6. Regras aprendidas

- **Economizar tokens:** quase todo episódio é cópia do anterior com mudanças pontuais (`cp -r epN/src epN+1/src`).
- **Não prometer o que a loja ou o jogo não fazem.** Conferir no site antes.
- **Sorteios ficam registrados** (quem, entre quantos, como).
- **Quem republicou ou postou nos stories só aparece nas notificações do usuário:** pedir a ele.
- **Melhor horário para postar:** 19h–21h (Brasília), em dia de semana.
- **Sempre entregar:** vídeo, capa (`capa_epN.png`) e `LEGENDA_EPN.md` (legenda + comentário fixado).
