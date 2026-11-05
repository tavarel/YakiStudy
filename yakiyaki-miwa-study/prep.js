/* ============================================================
   Preparação para o 1º turno — módulos, plano, rotinas e treinos
   videos: chaves de MENU.VIDEOS (data.js)
   ============================================================ */
window.PREP = {
  shift: '2026-11-02',

  modules: [
    {
      id: 'frases', emoji: '🗣️', title: 'Japonês do turno',
      why: 'No primeiro dia o mais importante é cumprimentar, avisar quando passa atrás de alguém e pedir para repetir. Isso vale tanto na cozinha quanto no salão.',
      decks: ['trabalho', 'atendimento'],
      videos: [],
      practice: [
        ['f1', 'Faça o baralho "Frases do trabalho" todos os dias até o dia 02.'],
        ['f2', 'Shadowing: toque o 🔊 e repita junto, imitando a melodia (linha do pitch).'],
        ['f3', 'Treine a autoapresentação em voz alta: 本日からお世話になります、〇〇と申します。日本語はまだ勉強中ですが、精一杯頑張ります。よろしくお願いいたします。'],
        ['f4', 'Mande no LINE a pergunta sobre o que levar e a roupa do primeiro dia (está no baralho).']
      ]
    },
    {
      id: 'faca', emoji: '🔪', title: 'Faca e postura (包丁の基本)',
      why: 'Postura e a mão de gato (猫の手) vêm antes de velocidade. É o que evita corte no dedo no primeiro dia.',
      decks: ['cortes'],
      videos: ['hotelknife', 'washoku', 'stance', 'lefthand'],
      practice: [
        ['k1', 'Postura: pés afastados, corpo a um punho da bancada, levemente de lado.'],
        ['k2', '猫の手: dedos dobrados; a lâmina encosta nos nós dos dedos, nunca nas pontas.'],
        ['k3', 'Corte empurrando a lâmina para a frente (ou puxando), sem esmagar para baixo.'],
        ['k4', 'Faca sempre afiada e tábua firme (pano úmido embaixo para não escorregar).']
      ]
    },
    {
      id: 'cortes', emoji: '🥬', title: 'Cortes do cardápio',
      why: 'O pré-preparo (仕込み) é o serviço mais comum de quem está começando: repolho para okonomiyaki, cebolinha para negiyaki, legumes para a chapa.',
      decks: ['cortes'],
      videos: ['cabbage', 'aonegi', 'naganegi', 'nanamegiri', 'shiraga', 'tamanegi3', 'tamanegiKaku', 'sainome', 'ninniku'],
      practice: [
        ['c1', 'Repolho em 千切り: 10–15 min. Primeiro fios uniformes, depois velocidade.'],
        ['c2', 'Cebolinha em 小口切り: as rodelas devem sair soltas.'],
        ['c3', 'Batata ou pepino em 角切り / さいの目 (todos do mesmo tamanho).'],
        ['c4', 'Alho em 薄切り bem fino (lascas para fritar).']
      ]
    },
    {
      id: 'sal', emoji: '🧂', title: 'Sal e tempero (塩加減)',
      why: 'Saber quanto sal usar se aprende provando e medindo algumas vezes, até a mão aprender a quantidade.',
      decks: ['verbos'],
      videos: ['salt1', 'salt2'],
      practice: [
        ['s1', 'Calibre o paladar: 3 copos com 200 ml de água morna + 1 g, 2 g e 3 g de sal (0,5%, 1%, 1,5%). Prove e note qual parece "certo".'],
        ['s2', 'Regra prática: algo em torno de 0,8–1% do peso total costuma parecer bem temperado.'],
        ['s3', 'Faça 10 pitadas de 少々 (2 dedos) e 10 de ひとつまみ (3 dedos) e pese: ~0,5 g e ~1 g.'],
        ['s4', 'Salpique o sal de uns 20–30 cm de altura para cair espalhado por igual.'],
        ['s5', 'Hábito: 味見 (provar) antes de servir sempre que for você temperando.']
      ]
    },
    {
      id: 'higiene', emoji: '🧼', title: 'Higiene e segurança',
      why: 'No Japão higiene é levada muito a sério. Lavar as mãos do jeito certo é regra em qualquer restaurante.',
      decks: [],
      videos: ['hands'],
      practice: [
        ['h1', 'Treine a lavagem completa das mãos (rotina "Lavar as mãos" em Treinos).'],
        ['h2', 'Unhas curtas, cabelo preso, sem anel/relógio e sem perfume forte.'],
        ['h3', 'Avise sempre: 後ろ通ります / 熱いの通ります.'],
        ['h4', 'Na dúvida sobre alergia de cliente, nunca chute: pergunte a um colega.']
      ]
    },
    {
      id: 'chapa', emoji: '🥞', title: 'Chapa: okonomiyaki, negiyaki, yakisoba',
      why: 'É o coração da casa. Mesmo que você não vá cozinhar logo, entender a ordem dos passos ajuda a ajudar (e a explicar ao cliente).',
      decks: ['utensilios', 'okonomiyaki', 'negiyaki', 'modan', 'yakisoba'],
      videos: ['otafuku', 'oko35', 'flip', 'negiyaki1', 'negiyaki2', 'soba8', 'sobaChuka', 'temp', 'clean'],
      practice: [
        ['p1', 'Faça um okonomiyaki em casa na frigideira e vire com 2 espátulas (lojas de 100 ienes costumam vender コテ/ヘラ).'],
        ['p2', 'Não aperte a massa com a espátula: ela fica dura.'],
        ['p3', 'Faça a rotina "Okonomiyaki" e "Yakisoba" em Treinos até acertar sem erro.']
      ]
    },
    {
      id: 'carnes', emoji: '🥩', title: 'Carnes na chapa',
      why: 'Steaks de wagyu, harami, língua, horumon e korokoro. O ponto (焼き加減) é perguntado ao cliente.',
      decks: ['steak', 'horumon', 'korokoro'],
      videos: ['garlic', 'sirloin', 'wagyu', 'doneness', 'horumon'],
      practice: [
        ['m1', 'Decore a ordem dos pontos: レア → ミディアムレア → ミディアム → ウェルダン.'],
        ['m2', 'Lascas de alho em casa: fatias finas em óleo frio, fogo baixo, tirar quando dourar claro (escurecem depois).'],
        ['m3', 'Faça a rotina "Steak na chapa" em Treinos.']
      ]
    },
    {
      id: 'mar', emoji: '🦐', title: 'Frutos do mar (下処理)',
      why: 'Camarão, lula, vieira, ostra e amêijoa precisam de limpeza antes da chapa.',
      decks: ['mar'],
      videos: ['ebi', 'ebi2', 'ika', 'hotate', 'asari', 'kaki'],
      practice: [
        ['r1', 'Compre camarão com casca e treine tirar o 背わた.'],
        ['r2', 'Faça 砂抜き de amêijoas em água salgada (veja o vídeo).']
      ]
    },
    {
      id: 'bebidas', emoji: '🍺', title: 'Bebidas: chope, vinho, champagne',
      why: 'Se você ficar no salão, vai tirar chope e possivelmente abrir garrafas caras (Dom Pérignon, Krug). Abrir com segurança é o essencial.',
      decks: ['cerveja', 'sour', 'coquetel', 'vinho', 'champagne'],
      videos: ['beer', 'champ', 'champ2', 'sommelier', 'highball'],
      practice: [
        ['b1', 'Faça as rotinas "Chope" e "Champagne" em Treinos.'],
        ['b2', 'Se puder, treine abrir um espumante barato com pano sobre a rolha.'],
        ['b3', 'Treine a proporção do chope com cerveja de garrafa em casa: ~7 de cerveja para 3 de espuma.']
      ]
    }
  ],

  plan: [
    { d: '2026-10-27', t: 'Frases e faca', m: ['frases', 'faca'] },
    { d: '2026-10-28', t: 'Cortes', m: ['cortes'] },
    { d: '2026-10-29', t: 'Sal e higiene', m: ['sal', 'higiene'] },
    { d: '2026-10-30', t: 'Chapa', m: ['chapa'] },
    { d: '2026-10-31', t: 'Carnes e frutos do mar', m: ['carnes', 'mar'] },
    { d: '2026-11-01', t: 'Bebidas + revisão geral', m: ['bebidas', 'frases'] }
  ],

  day1: [
    ['d1', 'Perguntar no LINE o que levar e que roupa usar (frase pronta no baralho).'],
    ['d2', 'Chegar 10 minutos antes.'],
    ['d3', 'Levar caderninho e caneta (メモ帳) para anotar.'],
    ['d4', 'Cabelo preso, unhas curtas, sem anel/relógio, sem perfume forte.'],
    ['d5', 'Sapato fechado e antiderrapante (confirme com a casa).'],
    ['d6', 'Levar os documentos que a casa pedir.'],
    ['d7', 'Autoapresentação treinada em voz alta.'],
    ['d8', 'Ao chegar: おはようございます. Ao sair: お先に失礼します / お疲れ様でした.']
  ],

  /* rotinas para pôr em ordem — gerais; a casa pode ter o próprio jeito */
  routines: [
    {
      id: 'maos', emoji: '🧼', title: 'Lavar as mãos', note: 'Sequência recomendada para quem manipula alimentos (padrão do Ministério da Saúde do Japão).',
      steps: [
        ['Molhar as mãos em água corrente', '流水で手をぬらす'],
        ['Sabão e esfregar as palmas', '石けんで手のひらをこする'],
        ['Esfregar as costas das mãos', '手の甲をこする'],
        ['Pontas dos dedos e unhas', '指先・爪の間'],
        ['Entre os dedos', '指の間'],
        ['Polegares (girando na outra mão)', '親指のねじり洗い'],
        ['Pulsos', '手首'],
        ['Enxaguar bem em água corrente', '流水ですすぐ'],
        ['Secar com papel-toalha limpo', 'ペーパータオルで拭く'],
        ['Álcool para desinfetar', 'アルコール消毒']
      ]
    },
    {
      id: 'chope', emoji: '🍺', title: 'Tirar chope na chopeira', note: 'Jeito geral de chopeira japonesa. Siga o treinamento da casa se for diferente.',
      steps: [
        ['Caneca bem lavada (sem gordura, que mata a espuma)', 'きれいなジョッキ'],
        ['Inclinar a caneca ~45° sob a torneira', 'ジョッキを45度に傾ける'],
        ['Abrir a torneira de uma vez, toda', 'コックを一気に全開'],
        ['Endireitar a caneca aos poucos enquanto enche (~70–80%)', '7〜8割まで注ぐ'],
        ['Completar com a espuma (alavanca da espuma)', '泡を乗せる'],
        ['Conferir a proporção ~7 cerveja : 3 espuma', 'ビール7：泡3'],
        ['Servir na hora', 'すぐに提供']
      ]
    },
    {
      id: 'champ', emoji: '🍾', title: 'Abrir champagne', note: 'Nunca aponte a garrafa para pessoas. O ideal é abrir sem estouro.',
      steps: [
        ['Garrafa bem gelada, sem sacudir', 'よく冷やす・振らない'],
        ['Tirar o lacre de alumínio', 'キャップシールを外す'],
        ['Polegar sobre a rolha e afrouxar a gaiola de arame', '親指で押さえてミュズレを緩める'],
        ['Pano sobre a rolha, garrafa a ~45°, longe das pessoas', 'ナプキンをかぶせ45度に'],
        ['Segurar a rolha firme e girar a GARRAFA, não a rolha', '瓶を回す'],
        ['Soltar devagar, com um "suspiro" sem estouro', '音を立てずに抜く'],
        ['Servir em duas vezes (esperar a espuma baixar)', '2回に分けて注ぐ']
      ]
    },
    {
      id: 'oko', emoji: '🥞', title: 'Okonomiyaki (estilo Kansai)', note: 'Ordem geral. A casa tem a própria receita e tempos.',
      steps: [
        ['Preparar a massa (farinha, dashi, inhame ralado)', '生地を作る'],
        ['Na tigela: massa + repolho + ovo, misturar leve incorporando ar', '空気を含ませて混ぜる'],
        ['Chapa quente com óleo', '鉄板に油をひく'],
        ['Despejar e formar um círculo alto, sem apertar', '丸く形を整える'],
        ['Colocar o porco por cima', '豚肉を乗せる'],
        ['Base dourada: virar com as duas espátulas', 'コテ2本で返す'],
        ['Assar o outro lado sem apertar', '押さえない'],
        ['Molho, maionese, aonori e katsuobushi', 'ソース・マヨ・青のり・かつお節']
      ]
    },
    {
      id: 'soba', emoji: '🍝', title: 'Yakisoba na chapa', note: 'Ordem geral; varia de casa para casa.',
      steps: [
        ['Óleo na chapa e grelhar o porco', '豚肉を焼く'],
        ['Juntar repolho e legumes', 'キャベツ・野菜を炒める'],
        ['Colocar o macarrão e soltar com um pouco de água', '麺をほぐす'],
        ['Deixar o macarrão tostar um pouco', '麺に焼き目をつける'],
        ['Misturar tudo e colocar o molho', 'ソースを絡める'],
        ['Servir (aonori, gengibre vermelho)', '盛り付ける']
      ]
    },
    {
      id: 'steak', emoji: '🥩', title: 'Steak na chapa', note: 'Ordem geral de teppanyaki; o chef decide tempos e ponto.',
      steps: [
        ['Tirar a carne da geladeira um pouco antes', '常温に戻す'],
        ['Sal e pimenta logo antes de grelhar', '直前に塩コショウ'],
        ['Chapa quente com gordura/óleo', '鉄板に牛脂・油'],
        ['Selar um lado até dourar', '焼き色をつける'],
        ['Virar e selar o outro lado', '返して焼く'],
        ['Deixar descansar um pouco', '休ませる'],
        ['Cortar em pedaços e servir com alho crocante', 'カットしてガーリックチップを添える']
      ]
    }
  ],

  /* treinos com cronômetro */
  drills: [
    { id: 'sengiri', title: 'Repolho em 千切り', min: 10, tip: 'Um repolho rende vários treinos. Guarde em água gelada e use em salada.' },
    { id: 'koguchi', title: 'Cebolinha em 小口切り', min: 5, tip: 'Rodelas soltas = corte atravessando até a tábua.' },
    { id: 'kaku', title: 'Cubos (角切り / さいの目)', min: 5, tip: 'Batata ou pepino. Mesmo tamanho > velocidade.' },
    { id: 'flip', title: 'Virar com 2 espátulas', min: 10, tip: 'Panqueca grossa ou okonomiyaki na frigideira.' },
    { id: 'shadow', title: 'Shadowing das frases', min: 5, tip: 'Sem cozinha (metrô): ouça e repita baixinho, imitando a melodia.' }
  ]
};
