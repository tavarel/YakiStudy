# 三輪 · Cardápio JP

App de estudo (estilo Anki) para aprender o cardápio do **やきやき三輪 (yakiyaki Miwa)**, em Asakusa:
nomes em japonês, kanji, leituras, ingredientes, preços, áudio e links para vídeos/fotos de cada prato ou bebida.

Funciona no navegador do celular, instala na tela inicial e roda offline. Não tem build nem dependências.

## O que tem

- **Estudar**: flashcards com repetição espaçada (Errei / Difícil / Bom / Fácil), limite diário de cartas novas, direção japonês→português, português→japonês ou misto.
- **Baralhos**: ingredientes, palavras do cardápio, cursos, entradas, frutos do mar, okonomiyaki, negiyaki, modan-yaki, yakisoba, horumon, teppan-yaki, korokoro-yaki, steaks, sobremesas, cervejas, sours, coquetéis, sem álcool, vinhos, champagnes, frases de atendimento e os **141 kanji** do cardápio.
- **Cardápio**: lista com busca (japonês, romaji, português, inglês). Toque em um item para ver leitura, romaji, áudio, ingredientes, kanji (on/kun/significado), foto + resumo da Wikipédia e links para vídeos (japonês e português), fotos, Jisho e jpdb.
- **Kanji**: os kanji do cardápio ordenados pelos mais frequentes, com as palavras do menu em que aparecem.
- **Quiz**: 10 perguntas de múltipla escolha (significado, japonês ou leitura).
- **Mais**: configurações, backup do progresso, exportação de palavras (.txt/.csv), cursos e regras da casa, e a lista de itens para confirmar com o staff.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `yakiyaki-miwa-study`) e envie estes arquivos para a branch `main`.
2. No repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. O workflow `.github/workflows/pages.yml` valida os dados e publica. O endereço fica em `https://SEU-USUARIO.github.io/yakiyaki-miwa-study/`.
4. No celular, abra o endereço e use *Adicionar à tela inicial*.

Para testar no computador: `python3 -m http.server` dentro da pasta e abra `http://localhost:8000`.

## Editar o cardápio

- `data.js`: itens, ingredientes, preços. Furigana usa a marcação `{漢字|かんじ}`.
- `kanji.js`: dicionário dos kanji (on, kun, significado).
- Depois de editar, rode `node tools/validate.js` (também roda no deploy). Ele confere furigana, kanji sem leitura, ids duplicados e ingredientes inexistentes.
- Se mudar arquivos do app, troque `VERSION` em `sw.js` para o celular baixar a versão nova.

## Observações

- O progresso fica no `localStorage` do aparelho. Use **Mais → Exportar progresso** para fazer backup.
- Fotos e resumos vêm da API pública da Wikipédia e precisam de internet; o resto funciona offline.
- Os links de vídeo abrem **buscas** no YouTube (não vídeos fixos, que podem sair do ar).
- Itens marcados com ⚠️ têm leitura ou tradução que vale confirmar com o staff.
- O app não usa nenhuma chave de API e não se conecta ao jpdb; só tem links e exportação de palavras.
- O cardápio original tem alguns erros de digitação em inglês (ex.: "kirsch" = kimchi, "tongue of beet" = beef); estão anotados nos itens.
