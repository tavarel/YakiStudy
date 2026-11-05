# 三輪 · Cardápio JP

App de estudo (estilo Anki) para aprender o cardápio e o dia a dia de trabalho no **やきやき三輪 (yakiyaki Miwa)**, em Asakusa.
Funciona no navegador do celular, instala na tela inicial e roda offline. Não tem build nem dependências.

## O que tem

- **Estudar:** flashcards com repetição espaçada (Errei / Difícil / Bom / Fácil) e limite diário de cartas novas.
- **Baralhos:**
  - Frases do trabalho (後ろ通ります, オーダー入ります…) e de atendimento.
  - Cortes (千切り, 小口切り…), verbos e termos de cozinha, utensílios.
  - Ingredientes, palavras do cardápio, todos os pratos e bebidas.
  - 256 kanji.
- **Cozinha:** contagem regressiva até o 1º turno, plano por dia e módulos com vídeos e práticas (com checklist). Também há treinos:
  - "Ponha na ordem" (lavar as mãos, chope, champagne, okonomiyaki, yakisoba, steak).
  - Quiz de ouvido.
  - Cronômetro para treinos em casa.
  - Checklist do 1º dia.
- **Caixa:** simulador do caixa da loja (Sunmi), com テーブル → categorias → itens → 登録. O jogo fala a mesa e o pedido. O número de pessoas **aparece desenhado** (bonequinhos), não é falado. Você registra a mesa, **お通し × pessoas** primeiro e depois os itens.
  - Os pedidos seguem a loja: ¾ no balcão (C), quase sempre 2 pessoas, cada uma com 1 bebida e 1 comida. Os itens mais pedidos (角ハイ, 生ビール…) saem mais vezes (`pop` em `pos.js`).
  - Níveis: 1 = só bebidas; 2 = bebida + comida; 3 = pedido grande. Também há um modo personalizado (lugar, pessoas, tamanho), um modo entrega (配達 / ウーバー e T,O) e um modo livre.
  - **?** pisca o botão certo da tela atual; 🔊 repete o pedido. KOROKORO YAKI, ソフドリ e ボトル赤 ainda usam os nomes do cardápio.
- **Drinks** (`drinks.js`): toda bebida na mesma ordem (copo → gelo → álcool → complemento → servir), com desenhos.
  - Desenhos: os 3 copos da prateleira, as 3 alavancas da máquina, o copinho medidor (lado grande 45, lado pequeno 30) e a cerveja 8:2.
  - Um cartão por bebida e as tabelas 焼酎・梅酒 e ウィスキー.
  - Treinos "monte a bebida" (copo, gelo, álcool e complemento) e "esconder doses".
- **Molhos** (`cond.js`): os pratinhos que acompanham os pratos, da folha escrita à mão da loja.
  - Os pratinhos: 小皿, 薬皿, 二連皿, 三連皿 e メガネ皿, cada um desenhado com o que vai em cada divisão.
  - Frase com áudio para pôr na mesa e versão em inglês.
  - Para decorar:
    - "A lógica": os pratos em 3 famílias (frutos do mar, carne/chapa, トンペイ), com uma dica de memória para cada prato.
    - Rodada com os 10 pratos, alternando "monte o pratinho" e "de qual prato é este pratinho?". O que errar volta até acertar todos.
    - Baralho de flashcards "🥢 Molhos" no Estudar, com repetição espaçada.
- **Áudio gravado:** voz japonesa para todas as cartas, funciona offline e em qualquer celular. A voz do aparelho fica como opção.
- **Pitch accent:** linha de tom alto/baixo em cada palavra ("do dicionário" ou "estimado").
- **Cardápio:** busca (japonês, romaji, português, inglês) e página de cada item com leitura, ingredientes, kanji, vídeos recomendados, foto/resumo da Wikipédia e links (YouTube, Jisho, jpdb).
- **Kanji** e **Quiz** (significado, japonês, leitura, ouvido): botões na tela Estudar. **Mais**: configurações, áudio, backup e exportação.

## Publicar / atualizar no GitHub Pages

1. Envie todos os arquivos para a branch `main`, incluindo as pastas `audio/`, `icons/`, `tools/` e `.github/`.
2. Em **Settings → Pages → Source**, use **GitHub Actions**.
3. O workflow `.github/workflows/pages.yml` valida os dados e publica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.
4. Depois de atualizar, se o celular mostrar a versão antiga, feche e abra o app de novo. O service worker troca a versão na segunda abertura.

Para testar no computador: `python3 -m http.server` dentro da pasta e abra `http://localhost:8000`.

## Editar

- `data.js`: itens, ingredientes, preços, frases, cortes, verbos, utensílios e vídeos (`VIDEOS`, `CATVID`). A furigana usa a marcação `{漢字|かんじ}`.
- `kanji.js`: dicionário dos kanji (on, kun, significado).
- `prep.js`: plano até o 1º turno, módulos, rotinas, treinos e checklist.
- `pos.js` (caixa), `drinks.js` (bebidas) e `cond.js` (molhos). Itens marcados `check` ainda precisam ser confirmados na loja.
- Depois de editar, rode `node tools/validate.js` (ele também roda no deploy).
- Se mudar arquivos do app, troque `VERSION` em `sw.js`.

### Regerar o áudio (só se mudar palavras)

Precisa de Python 3.11 e ffmpeg:

```
pip install pyopenjtalk-prebuilt "numpy<2" scipy "setuptools<70"
git clone https://github.com/icn-lab/htsvoice-tohoku-f01
curl -LO https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt
node tools/dump_cards.js > cards.json
python tools/gen_audio.py cards.json htsvoice-tohoku-f01/tohoku-f01-neutral.htsvoice accents.txt
```

O áudio fica em 7 pacotes (`audio/p*.bin`) mais `audio/index.js`. As falas do caixa e dos molhos ficam em `audio/pos.bin` + `audio/pos.js`: `node tools/dump_pos.js > pos_clips.json` e `python tools/gen_pos_audio.py pos_clips.json htsvoice-tohoku-f01/tohoku-f01-neutral.htsvoice`. Assim o upload pelo site do GitHub continua abaixo do limite de 100 arquivos.

## Observações

- O progresso fica no `localStorage` do aparelho. Use **Mais → Exportar progresso** para fazer backup.
- O pitch accent segue o padrão de Tóquio. "Do dicionário" vem do kanjium; "estimado" é calculado pelo OpenJTalk e pode errar em nomes, palavras estrangeiras e frases longas.
- Os vídeos foram escolhidos pelo título e pelo canal. Rotinas e passos são gerais: no trabalho, vale o jeito da casa.
- O app não usa nenhuma chave de API e não se conecta ao jpdb.

## Créditos e licenças

- Voz: [HTS voice tohoku-f01](https://github.com/icn-lab/htsvoice-tohoku-f01), Intelligent Communication Network Laboratory, Tohoku University ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)), sintetizada com [Open JTalk](https://open-jtalk.sourceforge.net/) via [pyopenjtalk](https://github.com/r9y9/pyopenjtalk).
- Acentos do dicionário: [kanjium](https://github.com/mifunetoshiro/kanjium) ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)). Os dados de pitch em `audio/index.js` derivam dele e seguem a mesma licença.
- Fotos e resumos: Wikipédia (carregados ao vivo).
