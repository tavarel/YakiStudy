/* ============================================================
   Molhos e temperos que acompanham os pratos (pratinhos)
   Transcrito da folha escrita à mão da loja (foto de 03/11/2026).
   parts: o que vai em cada divisão do pratinho, de cima para baixo.
   check: parte da folha difícil de ler, ou suposição minha; confirme
   ============================================================ */
window.COND = {
  dishes: {
    kozara: { t: '小皿', k: 'こざら', pt: 'pratinho pequeno, redondo', parts: 1, shape: 'round' },
    yaku: { t: '薬皿', k: '', pt: 'pratinho de condimentos (deve ser o 薬味皿, やくみざら)', parts: 1, shape: 'yaku', check: true },
    niren: { t: '二連皿', k: 'にれんざら', pt: 'pratinho com 2 divisões', parts: 2, shape: 'oval2' },
    sanren: { t: '三連皿', k: 'さんれんざら', pt: 'pratinho com 3 divisões', parts: 3, shape: 'rect3' },
    megane: { t: 'メガネ皿', k: 'めがねざら', pt: 'pratinho "óculos": dois círculos juntos', parts: 2, shape: 'megane' }
  },
  sauces: {
    oroshi: { t: '大根おろし', k: 'だいこんおろし', s: 'おろし', pt: 'nabo ralado', c: '#f6f3ec', ink: '#333' },
    ponzu: { t: 'ポン酢', k: 'ぽんず', s: 'ポン酢', pt: 'molho de shoyu com cítrico (o "vinagre")', c: '#8a5a2b', ink: '#fff' },
    negi: { t: '青ネギ', k: 'あおねぎ', s: 'ネギ', pt: 'cebolinha', c: '#6aa84f', ink: '#fff' },
    karashi: { t: 'からし', k: 'からし', s: 'からし', pt: 'mostarda japonesa', c: '#e8c22e', ink: '#333' },
    ninniku: { t: 'にんにく醤油', k: 'にんにくじょうゆ', s: '醤油', pt: 'shoyu com alho', c: '#3b2414', ink: '#fff' },
    shio: { t: '塩', k: 'しお', s: '塩', pt: 'sal', c: '#ffffff', ink: '#333', grain: true },
    bainiku: { t: '梅肉', k: 'ばいにく', s: '梅肉', pt: 'pasta de ameixa ume (azeda)', c: '#c94f5b', ink: '#fff' },
    tartar: { t: 'タルタル', k: 'タルタル', s: 'タルタル', pt: 'molho tártaro', c: '#f1e7c6', ink: '#333' },
    uzura: { t: 'うずら卵', k: 'うずらたまご', s: 'うずら', pt: 'ovo de codorna (vai na ポン酢)', c: '#f2b632', ink: '#333' }
  },
  rules: [
    { id: 'tako', hook: '鱧 com 梅肉 é dupla clássica; o polvo cozido fica vermelho como o 梅肉.', name: 'タコ・ハモ', k: 'たこ、はも', pt: 'polvo e hamo', dish: 'niren', parts: [['bainiku'], ['shio']],
      pos: ['2名様 活たこ(明石、淡路…', '3~4名様 活たこ(明石、淡…', '鱧(淡路島産)'],
      say: ['梅肉と塩です', 'ばいにくとしおです'], en: 'Plum paste and salt, for dipping.' },
    { id: 'sea', hook: 'São os que você comeria fritos com molho tártaro.', name: 'イカ・ホタテ・エビ・カキ・柱', rb: 'イカ・ホタテ・エビ・カキ・{柱|はしら}', k: 'いか、ほたて、えび、かき、はしら', pt: 'lula, vieira, camarão, ostra e "柱"', dish: 'niren', parts: [['tartar'], ['shio']],
      pos: ['2名様いか(剣先いか:長崎…', '3~4名様いか(剣先いか:長…', '2名様ほたて貝(北海道産)', '3~4名様ほたて貝(北海道産)', '足赤えび(紀州産、オースト…', '2名様大粒かき(広島産、三…', '3~4名様大粒かき(広島産、…', '2名様たいらぎ貝(岡山産、…', '3~4名様たいらぎ貝(岡山産…'],
      say: ['タルタルと塩です', 'タルタルとしおです'], en: 'Tartar sauce and salt, for dipping.', check: '柱 deve ser o たいらぎ (o que se come dele é o 貝柱). Confirme.' },
    { id: 'both', hook: '3 molhos, 3 divisões.', name: 'タコ・ハモ＋イカ・ホタテ…', k: 'たこ はも と いか ほたて', pt: 'os dois grupos no mesmo pedido (na folha: 両方入ってたら)', dish: 'sanren', parts: [['tartar'], ['shio'], ['bainiku']],
      say: ['タルタルと塩と梅肉です', 'タルタルとしおとばいにくです'], en: 'Tartar sauce, salt and plum paste.', note: 'Em vez de dois 二連皿, um 三連皿 só.' },
    { id: 'awabi', hook: 'O mais caro: só sal.', name: 'アワビ', k: 'あわび', pt: 'abalone', dish: 'kozara', parts: [['shio']], pos: ['活あわび100g'],
      say: ['塩です', 'しおです'], en: 'Salt, for dipping.' },
    { id: 'steak', hook: 'Tudo num prato só (メガネ皿), com ネギ em cima da おろし.', name: 'ステーキ', k: 'ステーキ', pt: 'steaks (na folha: ヘレ・モモ・ロース)', dish: 'megane', parts: [['negi', 'oroshi', 'ponzu'], ['karashi', 'ninniku']],
      pos: ['フィレ', 'フィレ150g', 'イチボorラムシン100g', 'イチボorラムシン150g'],
      say: ['おろしポン酢と、からしとにんにく醤油です', 'おろしぽんずと、からしとにんにくじょうゆです'], en: 'Grated radish with ponzu, and mustard with garlic soy sauce.',
      notes: ['ネギは おろしの上に: a cebolinha vai em cima do nabo.', 'Primeiro おろし e からし; ポン酢 e 醤油 por último.'],
      check: 'ヘレ = フィレ (nome usado em Kansai); モモ = イチボ / ラムシン. ハラミ e ロース não têm botão igual no caixa: confirme.' },
    { id: 'buta', hook: 'Porco ganha o 2º pratinho (からし + にんにく醤油), sem ネギ.', name: '豚', rb: '{豚|ぶた}', k: 'ぶた', pt: 'porco (豚ロース)', dish: 'yaku', parts: [['oroshi', 'ponzu']], extra: [{ dish: 'kozara', parts: [['karashi', 'ninniku']] }],
      pos: ['特撰豚ロースステーキのコロコロ焼120g'],
      say: ['おろしポン酢と、からしとにんにく醤油です', 'おろしぽんずと、からしとにんにくじょうゆです'], en: 'Grated radish with ponzu, and mustard with garlic soy sauce.',
      note: 'Dois pratinhos: 薬皿 + 小皿.', check: 'Na folha só está "豚". Deve ser o 豚ロース: confirme.' },
    { id: 'koro', hook: 'Só a base: おろしポン酢.', name: 'コロコロ・コロM・コロSF', k: 'ころころ、ころえむ、ころえすえふ', pt: 'korokoro, korokoro mix e korokoro seafood', dish: 'yaku', parts: [['oroshi', 'ponzu']],
      pos: ['コロコロ焼（黒毛和牛100g）', 'コロコロミックスチャンポン焼', 'コロコロシーフード焼'],
      say: ['おろしポン酢です', 'おろしぽんずです'], en: 'Grated radish with ponzu sauce.' },
    { id: 'tokukoro', hook: 'O especial: base + ネギ + うずら, e mais o 2º pratinho.', name: '特コロ', rb: '{特|とく}コロ', k: 'とくころ', pt: 'korokoro premium (特撰コロコロ)', dish: 'yaku', parts: [['negi', 'oroshi', 'ponzu', 'uzura']], extra: [{ dish: 'kozara', parts: [['karashi', 'ninniku']] }],
      pos: ['特撰コロコロ焼'],
      say: ['おろしポン酢と、からしとにんにく醤油です', 'おろしぽんずと、からしとにんにくじょうゆです'], en: 'Grated radish with ponzu and quail egg, and mustard with garlic soy sauce.',
      note: 'Dois pratinhos: 薬皿 (ネギ, おろし, ポン酢 com うずら) + 小皿 (からし, 醤油).' },
    { id: 'tofu', hook: 'Igual à コロコロ, mas tudo em menor quantidade.', name: 'トーフS', k: 'とうふステーキ', pt: 'tofu steak (豆腐ステーキ)', dish: 'yaku', parts: [['oroshi', 'ponzu']], pos: ['豆腐ステーキ(油かす/ホル…'],
      say: ['おろしポン酢です', 'おろしぽんずです'], en: 'Grated radish with ponzu sauce.', notes: ['全体的に少なめで: tudo em quantidade menor.'] },
    { id: 'tonpei', hook: 'O único que leva só からし.', name: 'トンペイ', k: 'とんぺい', pt: 'tonpei-yaki (とん平焼き)', dish: 'kozara', parts: [['karashi']], pos: ['三輪のスペシャルとん平焼…'],
      say: ['からしです', 'からしです'], en: 'Japanese mustard.' },
    { id: 'faded', name: '(título apagado)', pt: 'o desenho do canto da folha, desbotado', dish: 'niren', parts: [['oroshi', 'ponzu'], ['shio']], drill: false,
      check: 'O nome deste prato está apagado na foto. Pergunte para qual prato é おろしポン酢 + 塩.' }
  ],
  /* como decorar: 3 famílias, com ganchos de memória */
  families: [
    { icon: '🐟', t: 'Frutos do mar: sempre 塩 + 1 molho', rules: ['tako', 'sea', 'awabi', 'both'],
      hooks: [
        'タコ・ハモ → 梅肉. 鱧 com 梅肉 é uma dupla clássica do Japão, e o polvo cozido fica vermelho como o 梅肉.',
        'イカ・ホタテ・エビ・カキ・柱 → タルタル. São os que você comeria fritos com molho tártaro (カキフライ, エビフライ…).',
        'アワビ, o mais caro de todos → só 塩, num 小皿.',
        'Os dois grupos no mesmo pedido → 三連皿: 3 molhos, 3 divisões.'
      ] },
    { icon: '🥩', t: 'Carne e chapa: a base é おろしポン酢 no 薬皿', rules: ['koro', 'tofu', 'buta', 'tokukoro', 'steak'],
      hooks: [
        'コロコロ, コロM, コロSF e トーフS → só a base (na トーフS, tudo em menor quantidade).',
        'Os de porco e os premium ganham um 2º pratinho: 小皿 com からし + にんにく醤油. São o 豚, o 特コロ e a ステーキ.',
        '特コロ é o especial, então a base ainda ganha ネギ e うずら.',
        'ステーキ: tudo num prato só, a メガネ皿, com ネギ em cima da おろし.'
      ] },
    { icon: '🍳', t: 'トンペイ: só からし', rules: ['tonpei'],
      hooks: ['O único que leva só からし, num 小皿.'] }
  ],
  /* regra geral da folha */
  rule: '※ ステーキとコロ類が同時に入ったら 特コロダレで出す! Se steak e korokoro entram juntos no mesmo pedido, sirva com o conjunto do 特コロ.',
  /* frases para pôr o pratinho na mesa */
  phrases: [
    ['これをつけて食べてください', 'これをつけてたべてください', 'Coma molhando nisto. (a frase que te ensinaram)'],
    ['こちらをつけてお召し上がりください', 'こちらをつけておめしあがりください', 'A mesma, mais educada.']
  ],
  en: 'For foreign customers: "Please dip it in this sauce."'
};
