/* ============================================================
   Receitas das bebidas — transcritas do papel colado na geladeira (foto de 03/11/2026)
   Doses em ml. Todo soft drink vai com gelo.
   check:true = parte do papel difícil de ler na foto; confirme
   ============================================================ */
window.DRINKS = {
  codes: [
    ['ソ', 'ソーダ', 'soda (com gás)'],
    ['水', '水割り', 'com água'],
    ['R', 'ロック', 'só com gelo (on the rocks)'],
    ['湯', 'お湯割り', 'com água quente']
  ],

  /* サワー・カクテル: a linha "基本" do papel = サワーベース 45 ml */
  sours: [
    { pos: 'レモンサワー', sheet: 'レモンサワー', k: 'レモンサワー', base: 'サワーベース 45',
      steps: ['Copo com gelo até a boca', 'サワーベース 45 ml', 'レモン果汁 (suco de limão) 30 ml', 'Completar com ソーダ'] },
    { pos: '手絞りグレープフルーツサワー', sheet: 'グレフルサワー', k: 'グレフルサワー', base: 'サワーベース 45',
      steps: ['Copo com gelo até a boca', 'サワーベース 45 ml', 'GFJ = suco de grapefruit', 'Completar com ソーダ', 'Servir com マドラー (bastão) no copo'] },
    { pos: 'フレッシュスダチサワー', sheet: 'スダチサワー', k: 'スダチサワー', base: 'サワーベース 45',
      steps: ['Copo com gelo até a boca', 'サワーベース 45 ml', 'スダチ: 2 pushes (2プッシュ)', 'Completar com ソーダ'] },
    { pos: '国産葡萄サワー', sheet: 'ブドウサワー', k: 'ぶどうサワー', base: 'サワーベース 45',
      steps: ['Copo com gelo até a boca', 'サワーベース 45 ml', 'ブドウJ = suco de uva', 'Completar com ソーダ'] },
    { pos: '紀州梅サワー', sheet: '梅サワー', k: 'うめサワー', base: 'サワーベース 45',
      steps: ['Copo com gelo até a boca', 'サワーベース 45 ml', '1 梅干し (umeboshi) ANTES de pôr o líquido (水入れる前に梅干1個)', 'Completar com ソーダ', 'Servir com マドラー'] },
    { pos: '国産フルーツトマトサワー', sheet: 'トマトサワー', k: 'トマトサワー', base: 'サワーベース 45',
      steps: ['Copo com gelo até a boca', 'サワーベース 45 ml', 'トマトJ = suco de tomate', 'Espremer レモン (レモン絞る)', 'Completar com ソーダ', 'Servir com マドラー'] }
  ],

  hai: [
    { pos: '黒ウーロンハイ', sheet: 'ウーハイ', k: 'ウーハイ', base: 'base 45',
      steps: ['Copo com gelo até a boca', '45 ml da base', 'Completar com 黒ウーロン茶 (oolong preto)'] },
    { pos: '緑茶ハイ', sheet: '緑ハイ', k: '', base: 'base 45',
      steps: ['Copo com gelo até a boca', '45 ml da base', 'Completar com 緑茶 (chá verde)'] },
    { pos: '三輪ハイ', sheet: 'ミワハイ', k: 'みわハイ', base: '吉四六 60',
      steps: ['Copo com gelo até a boca', '吉四六 (きっちょむ) 60 ml', 'Completar com 午後ティー = 午後の紅茶 (chá preto Kirin)'] },
    { pos: 'オリジナルジントニック', sheet: 'ジントニ', k: 'ジントニ', base: 'gin 1 concha',
      steps: ['Copo com gelo até a boca', '1 レードル (concha) do gin, junto com as frutas (フルーツと一緒に)', 'Completar com トニック (água tônica)'] }
  ],

  /* 焼酎・梅酒 (焼酎 = 吉四六, 二階堂, 黒霧島 etc.; 梅酒 = あらごし梅) */
  shochu: {
    cols: [['ソーダ', 'ソ'], ['水割り', '水'], ['ロック', 'R'], ['湯割', '湯']],
    rows: [
      ['焼酎', 'しょうちゅう', ['45', '45', '45+30', 'お湯を先に, depois 45']],
      ['梅酒', 'うめしゅ', ['45', '45', '45+30', 'お湯を先に, depois 45']]
    ],
    note: 'ロック 45+30 = as duas medidas do copinho (45 e 30). No 湯割, a água quente entra primeiro (先にお湯).'
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
    note: 'Os nomes das linhas estão borrados na foto. As doses (30/45/60) estão legíveis. A ロック foi corrigida à mão de 45 para 60 em todas.'
  },

  beer: [
    ['ジョッキ生ビール', 'ジョッキなまビール', 'Chope na caneca grande (alavanca do meio). Caneca limpa, 45°, 7 cerveja : 3 espuma.'],
    ['グラス生ビール', 'グラスなまビール', 'O mesmo chope, no copo menor.'],
    ['白穂乃香', 'しろほのか', 'Chope sem filtro (turvo). Provavelmente a alavanca da esquerda.'],
    ['サッポロ赤星', 'あかぼし', 'Garrafa: leve a garrafa, o abridor (栓抜き) e copos.'],
    ['ノンアルコール', 'ノンアルコール', 'Sem álcool: garrafa + copo.']
  ],

  soft: 'Todos os soft drinks (ジュース, ウーロン茶, コーラ, ジンジャーエール…) vão no copo com gelo. Água em garrafa: garrafa + copo.'
};
