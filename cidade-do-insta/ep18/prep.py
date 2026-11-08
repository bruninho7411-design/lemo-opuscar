import json, re, difflib, subprocess, numpy as np, unicodedata
script_old = "Eu sou o prefeito de uma cidade com zero moradores. Prazer, Capivaldo! Aqui não tem casa... não tem rua... não tem nem gente. E a partir de hoje, quem manda nessa cidade é você. Seguiu o perfil? Você vira morador. Comentou? Ganha um terreno com o seu arroba na placa. E curte esse vídeo, pra ele chegar em mais gente pra ajudar a construir. Tudo aqui é decidido nos comentários. Primeira votação: o que a cidade ganha primeiro? A: Pizzaria. Ninguém constrói uma cidade com fome. B: Lagoa. Cidade de capivara sem lagoa? Não dá. Comenta só a letra. A mais votada vira obra no próximo vídeo. Segue agora pra garantir a sua casa... senão..."
script = "É HOJE! Seleção da Cidade do Insta contra o SANTOS! E a nossa seleção foi escalada nos comentários: goleiro, zagueiros, meia, ponta e atacantes, todos seguidores de verdade! Apita o juiz! O Santos sai na frente... um a zero! Mas a seleção não desiste... GOL! Empatou! E no último minuto... VIRAAADA! Dois a um pra Cidade do Insta! E na votação deu PRAIA, com oitenta e um por cento: ela chega no próximo episódio! Agora o desafio: comenta o seu palpite pro próximo jogo! Quem acertar o placar aparece no próximo episódio, e quem republicar concorre a capitão! Faltam só duzentos e trinta e oito pros dez mil: quando bater, alguém ganha uma arte personalizada do seu personagem com o camisa dez da seleção! Décima sexta votação: quem a seleção enfrenta agora? A, Flamengo, ou B, Corinthians? Comenta a letra! Senão, o goleiro sou eu!"
toks = script.split()
def norm(t): return ''.join(c for c in unicodedata.normalize('NFD',t.lower()) if c.isalnum())
W = json.load(open('/home/user/ep18/work/words.json'))
wn = [norm(w['w']) for w in W]; sn=[norm(t) for t in toks]
sm = difflib.SequenceMatcher(None, sn, wn, autojunk=False)
times=[None]*len(toks)
for tag,i1,i2,j1,j2 in sm.get_opcodes():
    if tag=='equal':
        for k in range(i2-i1): times[i1+k]=(W[j1+k]['s'],W[j1+k]['e'])
    elif tag=='replace':
        s=W[j1]['s']; e=W[j2-1]['e']; n=i2-i1
        for k in range(n): times[i1+k]=(s+(e-s)*k/n, s+(e-s)*(k+1)/n)
# fill gaps
for i,t in enumerate(times):
    if t is None:
        p=times[i-1][1] if i else 0
        times[i]=(p,p+0.2)
HL={'hoje','santos','selecao','escalada','apita','juiz','frente','empatou','viraaada','virada','palpite','placar','acertar','flamengo','corinthians','sexta','camisa','dez','goleiro','vagas','curte','republica','prefeito','jogador','bombeiro','professor','goooool','gol','estadio','sessenta','oito','prefeita','pontape','gramado','traves','arquibancada','refletores','time','escalacao','goleiro','zagueiro','atacante','capitao','praia','contra','quinta','fogo','bombeiros','quatro','finalmente','garagem','torre','caminhao','promessa','cumprida','novidade','jogo','testes','avatar','gratis','graca','planta','colhe','terreno','pizza','pet','obras','lancar','estadio','quarta','morador','melhores','proximo','sobrado','placa','garante','seguraaa','montanharussa','portao','rodagigante','carrossel','peca','fila','fura','dia','inaugura','zoologico','terceira','setenta','cinco','dentro','atencao','sinal','escola','paredes','telhado','sino','quadra','parquinho','professores','presente','chamada','sala','falta','diversoes','parque','segunda','cinquenta','sete','raio','fundacao','torres','chamine','turbinas','paineis','solares','luz','watt','cem','bateria','prefeito','sorte','personaliza','amigo','desligo','tres','um','construir','desafio','primeira','urgente','tudo','avenidas','quarteiroes','ruas','pizzaria','estacao','pronta','sorteados','republica','site','vivo','decima','usina','bombeiros','escuro','dentro','jogo','graca','celular','arroba','lote','delegacia','blitz','obras','outdoor','vip','mapa','achei','bio','jogo','gratis','lojinha','novidade','proximo','gigante','prefeito','quarenta','setenta','trinta','voce','morar','loja','oficial','especie','profissao','roupa','apelido','episodio','dezenove','castelo','mansao','nome','cores','sessenta','kit','oitenta','corre','onze','sorteio','clicar','bio','falta','pouco','parado','policia','oito','oitenta','delegacia','policiais','verdade','loja','personagem','dois','nona','sede','escuro','agua','usina','energia','aviao','pousar','quatro','quatrocentos','cinquenta','seis','aeroporto','tripulacao','piloto','comissario','meta','cinco','oitava','delegacia','policial','bombeiros','bombeiro','fogo','urgente','tres','oitocentos','trinta','sete','ambulancia','equipe','enfermeira','recepcionista','dez','stories','nove','setima','estadio','jogador','aeroporto','piloto','aviao','decola','mil','novecentos','oito','shopping','sessenta','trabalhando','sorteados','dono','republicar','sorteio','lotaram','sexta','emprego','hospital','escola','medico','professor','desempregado','setecentos','cinquenta','explodiu','mercadinho','lavada','noventa','lotou','quatro','ruas','novas','novo','segunda','ultima','animacao','curso','bio','quinta','parque','diversoes','shopping','dono','sorteei','aleatorio','placa','repostar','curtir','comentar','quarta','tatuagem','mercadinho','letra','avenida','duzentas','sessenta','uma','arredores','caida','mega','mansoes','mansao','reservadas','especiais','ninguem','ainda','comenta','casas','unanime','rua','asfalto','cento','trinta','seis','procura','arroba','casinha','longe','seguiu','seguir','quarta','tatuagem','mercadinho','vazia','deu','trinta','procura','problema','nenhuma','dormindo','terceira','casas','campo','futebol','time','praca','votaram','pizzaria','fundacao','paredes','telhado','toldo','gigante','pronto','insta','calabresa','frango','catupiry','forno','sabor','curte','esfria','zero','capivaldo','voce','morador','moradores','terreno','arroba','curte','comentarios','votacao','primeiro','pizzaria','lagoa','letra','segue','senao','casa','rua','gente','fome','obra','perfil','comentou','seguiu','manda'}
out=[]
for t,(s,e) in zip(toks,times):
    clean=re.sub(r'[.,!?:]+$','',t).rstrip('.')
    out.append(dict(t=clean.upper(), s=round(s,3), e=round(e,3), hl=norm(t) in HL))
json.dump(out,open('/home/user/ep18/kit/src/words.json','w'),ensure_ascii=False,indent=0)
# mouth envelope 30fps
raw=subprocess.run(["ffmpeg","-v","error","-i","work/vo.wav","-ac","1","-ar","48000","-f","f32le","-"],capture_output=True).stdout
a=np.frombuffer(raw,np.float32); hop=1600
env=[float(np.sqrt(np.mean(a[i:i+hop]**2))) for i in range(0,len(a),hop)]
m=max(env); env=[round(min(1,(v/m)*1.6),3) for v in env]
json.dump(env,open('/home/user/ep18/kit/src/mouth.json','w'))
print(len(out),'words; last',out[-3:],'frames',len(env))
for o in out: print(o['s'],o['t'],end=' | ')
