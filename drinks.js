/* ============================================================
   Bebidas — papel da geladeira (foto de 03/11/2026) + o que você viu no 1º dia
   Toda bebida segue a mesma ordem: copo → gelo → álcool → complemento → servir.
   check:true = suposição ou parte difícil de ler; confirme na loja
   ============================================================ */
window.DRINKS = {
  /* os 3 copos (de cima para baixo na prateleira) */
  glasses: [
    { n: 1, shape: 'pils', where: 'o de cima', use: 'só 白穂乃香' },
    { n: 2, shape: 'mug', where: 'o do meio', use: 'só cerveja (生ビール)' },
    { n: 3, shape: 'tumbler', where: 'o de baixo', use: 'todo o resto: ハイボール, ハイ, サワー e soft drinks' }
  ],

  /* a máquina: o que sai de cada alavanca */
  levers: [
    { id: 'L', name: 'esquerda', a: ['白穂乃香', ''], check: true },
    { id: 'M', name: 'meio', a: ['生ビール', 'um lado'], b: ['espuma (泡)', 'o outro lado'] },
    { id: 'R', name: 'direita', a: ['サワーベース', 'para frente'], b: ['ソーダ', 'para trás'] }
  ],

  /* de onde vem o álcool (para o cartão e para o treino) */
  alc: {
    kaku: { t: '角 (whisky)', how: 'bico dosador da garrafa: 1 dose', c: '#c98a2e' },
    sour: { t: 'サワーベース', how: 'alavanca direita → para frente', c: '#efe9d8' },
    base: { t: 'base da ハイ', how: 'o papel só diz 45', c: '#efe9d8', check: true },
    kicchomu: { t: '吉四六 (きっちょむ)', how: 'copinho medidor', c: '#e7d3a6' },
    gin: { t: 'gin', how: '1 concha (レードル), com as frutas', c: '#eef3ee' },
    beer: { t: '生ビール', how: 'alavanca do meio (lado da cerveja)', c: '#e8ae2c' },
    shiro: { t: '白穂乃香', how: 'alavanca da esquerda', c: '#f0d27e' },
    none: { t: 'sem álcool', how: '', c: '' }
  },

  /* complementos */
  mix: {
    soda: { t: 'ソーダ', how: 'alavanca direita → para trás', c: '#e3f1f6' },
    foam: { t: 'espuma (泡)', how: 'alavanca do meio, o outro lado', c: '#fffaf0' },
    lemon: { t: 'レモン果汁 30 + ソーダ', how: 'suco de limão, depois a soda', c: '#f3e27a' },
    gfj: { t: 'suco de grapefruit + ソーダ', how: 'GFJ no papel', c: '#f4b3a0' },
    sudachi: { t: 'スダチ 2 pushes + ソーダ', how: '2プッシュ', c: '#cfe39a' },
    grape: { t: 'suco de uva + ソーダ', how: 'ブドウJ no papel', c: '#8e3b6e' },
    ume: { t: 'ソーダ', how: 'o 梅干し já está no copo', c: '#e3f1f6' },
    tomato: { t: 'suco de tomate + limão + ソーダ', how: 'トマトJ, espremer レモン', c: '#d9462f' },
    honey: { t: 'mel com limão + ソーダ', how: '2 colherinhas de mel do potinho', c: '#e8b84a', check: true },
    tea: { t: '午後の紅茶', how: 'chá preto da Kirin, até a boca', c: '#b5652b' },
    oolong: { t: '黒ウーロン茶', how: 'até a boca', c: '#5a3518' },
    green: { t: '緑茶', how: 'chá verde, até a boca', c: '#a9c062' },
    tonic: { t: 'トニック', how: 'água tônica, até a boca', c: '#eef4f0' },
    juice: { t: 'o suco ou refri pedido', how: 'até a boca', c: '#f5a623' }
  },

  /* cada bebida: copo, gelo, álcool (+dose), complemento, final, camadas do desenho [cor, fração] de baixo para cima */
  drinks: [
    { id: 'kaku', pos: '角ハイ', say: '角ハイ', group: 'top', glass: 3, ice: true, alc: 'kaku', dose: '45', mix: 'soda', end: '',
      tip: 'A mais pedida. O bico da garrafa já mede a dose (o papel diz 45).', layers: [['#c98a2e', .2], ['#e3f1f6', .7]], bubbles: true },
    { id: 'nama', pos: 'ジョッキ生ビール（サッポ…', say: '生ビール', group: 'top', glass: 2, ice: false, alc: 'beer', dose: '', mix: 'foam', end: '8 de cerveja : 2 de espuma', beer: true,
      tip: 'Copo inclinado embaixo da torneira; endireite no fim e complete com espuma.', layers: [['#e8ae2c', .78], ['#fffaf0', .2]] },
    { id: 'shiro', pos: '白穂乃果（ピルスナー）', say: '白穂乃香', group: 'top', glass: 1, ice: false, alc: 'shiro', dose: '', mix: 'foam', end: '8 de cerveja : 2 de espuma', beer: true,
      tip: 'Igual ao chope, mas no copo ① e na alavanca da esquerda (confirme a alavanca).', layers: [['#f0d27e', .78], ['#fffaf0', .2]] },
    { id: 'lemon', pos: 'レモンサワー', say: 'レモンサワー', group: 'top', glass: 3, ice: true, alc: 'sour', dose: '45', mix: 'lemon', end: '',
      tip: 'O modelo de todas as sours: base 45 + o sabor + soda.', layers: [['#efe9d8', .18], ['#f3e27a', .12], ['#e3f1f6', .6]], bubbles: true },
    { id: 'miwa', pos: '三輪ハイ', say: '三輪ハイ', group: 'top', glass: 3, ice: true, alc: 'kicchomu', dose: '60', mix: 'tea', end: '',
      tip: 'A bebida da casa: shochu 吉四六 + chá preto 午後の紅茶.', layers: [['#e7d3a6', .2], ['#b5652b', .7]] },

    { id: 'gf', pos: '手絞りグレープフルーツサ…', say: 'グレフルサワー', group: 'sour', glass: 3, ice: true, alc: 'sour', dose: '45', mix: 'gfj', end: 'マドラー (bastão) no copo',
      layers: [['#efe9d8', .18], ['#f4b3a0', .2], ['#e3f1f6', .52]], bubbles: true },
    { id: 'sudachi', pos: 'フレッシュスダチサワー', say: 'スダチサワー', group: 'sour', glass: 3, ice: true, alc: 'sour', dose: '45', mix: 'sudachi', end: '',
      layers: [['#efe9d8', .18], ['#cfe39a', .08], ['#e3f1f6', .64]], bubbles: true },
    { id: 'grape', pos: '国産葡萄サワー', say: 'ぶどうサワー', group: 'sour', glass: 3, ice: true, alc: 'sour', dose: '45', mix: 'grape', end: '',
      layers: [['#efe9d8', .18], ['#8e3b6e', .22], ['#c9a6c0', .5]], bubbles: true },
    { id: 'ume', pos: '紀州梅サワー', say: '梅サワー', group: 'sour', glass: 3, ice: true, alc: 'sour', dose: '45', mix: 'ume', end: 'マドラー no copo', first: '1 梅干し no fundo, ANTES do líquido',
      layers: [['#e8a0a8', .08], ['#efe9d8', .18], ['#e3f1f6', .64]], bubbles: true },
    { id: 'tomato', pos: '国産フルーツトマトサワー', say: 'トマトサワー', group: 'sour', glass: 3, ice: true, alc: 'sour', dose: '45', mix: 'tomato', end: 'マドラー no copo',
      layers: [['#efe9d8', .18], ['#d9462f', .3], ['#eaa08f', .42]], bubbles: true },
    { id: 'honey', pos: 'ハニーレモンサワー', say: '', group: 'sour', glass: 3, ice: true, alc: 'sour', dose: '45', mix: 'honey', end: '', check: true, nopos: true,
      tip: 'Não achei botão no caixa. Pelo que você lembra: potinho com limão no mel, 2 colherinhas de mel, depois a sour. Tem álcool, sim: a "サワー" da alavanca é a base alcoólica. Confirme se completa com soda.',
      layers: [['#e8b84a', .1], ['#efe9d8', .18], ['#f6e6a8', .62]], bubbles: true },

    { id: 'oolong', pos: '黒ウーロンハイ', say: 'ウーロンハイ', group: 'hai', glass: 3, ice: true, alc: 'base', dose: '45', mix: 'oolong', end: '',
      layers: [['#efe9d8', .18], ['#5a3518', .72]] },
    { id: 'green', pos: '緑茶ハイ', say: '緑茶ハイ', group: 'hai', glass: 3, ice: true, alc: 'base', dose: '45', mix: 'green', end: '',
      layers: [['#efe9d8', .18], ['#a9c062', .72]] },
    { id: 'gin', pos: 'オリジナルジントニック', say: 'ジントニック', group: 'hai', glass: 3, ice: true, alc: 'gin', dose: '', mix: 'tonic', end: '',
      tip: 'O gin fica num pote com frutas: 1 concha, com as frutas.', layers: [['#eef3ee', .2], ['#eef4f0', .7]], bubbles: true, fruit: true },

    { id: 'soft', pos: 'ソフトドリンク', say: '', group: 'soft', glass: 3, ice: true, alc: 'none', dose: '', mix: 'juice', end: '', nopos: true,
      tip: 'Todo soft drink vai com gelo: ジュース, ウーロン茶, コーラ, ジンジャーエール… Água em garrafa: garrafa + copo.', layers: [['#f5a623', .9]] }
  ],
  groups: [['top', '⭐ As mais pedidas'], ['sour', 'Sours (サワー)'], ['hai', 'ハイ e gin'], ['soft', 'Sem álcool']],

  /* códigos do papel (e de como o cliente pede 焼酎・梅酒・whisky) */
  codes: [
    ['ソ', 'ソーダ', 'com soda'],
    ['水', '水割り', 'com água'],
    ['R', 'ロック', 'só com gelo'],
    ['湯', 'お湯割り', 'com água quente']
  ],

  /* 焼酎・梅酒 (焼酎 = 吉四六, 二階堂, 黒霧島 etc.; 梅酒 = あらごし梅) */
  shochu: {
    cols: [['ソーダ', 'ソ'], ['水割り', '水'], ['ロック', 'R'], ['湯割', '湯']],
    rows: [
      ['焼酎', 'しょうちゅう', ['45', '45', '45+30', '45']],
      ['梅酒', 'うめしゅ', ['45', '45', '45+30', '45']]
    ],
    note: 'No 湯割, a água quente entra PRIMEIRO (先にお湯) e o álcool depois. ロック = os dois lados do copinho (45 + 30).'
  },

  /* ウィスキー: nomes das linhas lidos de uma foto escura — confirme */
  whisky: {
    cols: [['ハイボール', 'ソ'], ['水割', '水'], ['ロック', 'R']],
    rows: [
      ['角', 'かく', ['45', '45', '60']],
      ['白州12年', 'はくしゅう12ねん', ['30', '45', '60']],
      ['山崎12年', 'やまざき12ねん', ['45', '45', '60']],
      ['響 J/H', 'ひびき', ['30', '45', '60']],
      ['知多', 'ちた', ['30', '45', '60']]
    ],
    check: true,
    note: 'Os nomes das linhas estão borrados na foto; as doses estão legíveis. A ロック foi corrigida à mão de 45 para 60 em todas.'
  },

  bottle: 'Garrafa (サッポロ赤星, ノンアルコール, água): leve a garrafa, o abridor (栓抜き) e o copo.'
};
