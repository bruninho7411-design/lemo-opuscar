# Cidade do Insta · Ep. 21 — renderizar no seu PC (Windows)

Saída: **MP4 vertical 1080x1920, H.264**, pronto para Reels, Shorts e TikTok.
Tudo roda no seu computador com Node.js + Remotion. Sem Blender e sem nuvem.

## 1. Conferir o que já existe (não instala nada)
Abra o **Prompt de Comando** dentro desta pasta e rode:
```
node -v
npm -v
```
- Precisa do **Node 18 ou mais novo** (o LTS do nodejs.org serve).
- Se o comando não for reconhecido, instale o Node.js LTS primeiro.

## 2. Instalar as dependências (só na primeira vez, ~300 MB)
```
npm install
```
Isso baixa o Remotion, o React, o three.js e um Chrome interno de renderização. Ele fica só dentro desta pasta, em `node_modules`.

## 3. (Opcional) Ver uma prévia antes de renderizar
```
npm run studio
```
Abre o editor no navegador, onde dá para assistir e pular entre as cenas. Feche com Ctrl+C.

## 4. Renderizar o vídeo e a capa
```
npm run render
npm run capa
```
Os arquivos saem na pasta **out\\**:
- `cidade_do_insta_ep21.mp4`
- `capa_ep21.png`

Se o vídeo sair preto ou der erro de GPU, use:
```
npm run render:seguro
```

## Atalho
Dê dois cliques em **RENDERIZAR.bat**. Ele confere o Node, **pergunta antes de instalar** e renderiza.

## Editar
- Número de moradores do contador: `src/config.json` → `"seguidores"`.
- Nomes sorteados: `src/people.json` (registro em `historico/sorteio_ep21.txt`).
- Áudio final (voz + música + efeitos): `public/mix21.wav`.
