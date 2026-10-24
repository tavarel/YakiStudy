/* ============================================================
   やきやき三輪 — dados do cardápio
   Markup de furigana: {漢字|かんじ}  (o resto do texto é impresso como está)
   Preços: p:[sem imposto, com imposto]  (valores do cardápio, em ienes)
   chk:true  = leitura/tradução que vale confirmar com o staff
   ============================================================ */
(function () {
  const CATS = [
    { id: 'ingredientes', name: 'Ingredientes', emoji: '🧄', kind: 'vocab' },
    { id: 'palavras', name: 'Palavras do cardápio', emoji: '📖', kind: 'vocab' },
    { id: 'cursos', name: 'Cursos (set menu)', emoji: '🍱', kind: 'food' },
    { id: 'entradas', name: 'Entradas', emoji: '🥗', kind: 'food' },
    { id: 'mar', name: 'Frutos do mar', emoji: '🦑', kind: 'food' },
    { id: 'legumes', name: 'Legumes grelhados', emoji: '🍆', kind: 'food' },
    { id: 'okonomiyaki', name: 'Okonomiyaki', emoji: '🥞', kind: 'food' },
    { id: 'negiyaki', name: 'Negiyaki', emoji: '🧅', kind: 'food' },
    { id: 'modan', name: 'Modan-yaki', emoji: '🍜', kind: 'food' },
    { id: 'yakisoba', name: 'Yakisoba', emoji: '🍝', kind: 'food' },
    { id: 'horumon', name: 'Horumon (miúdos)', emoji: '🥩', kind: 'food' },
    { id: 'teppan', name: 'Teppan-yaki da casa', emoji: '🔥', kind: 'food' },
    { id: 'korokoro', name: 'Korokoro-yaki', emoji: '🎲', kind: 'food' },
    { id: 'steak', name: 'Steaks', emoji: '🥩', kind: 'food' },
    { id: 'sobremesas', name: 'Sobremesas', emoji: '🍨', kind: 'food' },
    { id: 'cerveja', name: 'Cerveja', emoji: '🍺', kind: 'drink' },
    { id: 'sour', name: 'Sour (shochu + fruta)', emoji: '🍋', kind: 'drink' },
    { id: 'coquetel', name: 'Coquetéis / Hai', emoji: '🍸', kind: 'drink' },
    { id: 'soft', name: 'Sem álcool', emoji: '🥤', kind: 'drink' },
    { id: 'vinho', name: 'Vinhos (garrafa)', emoji: '🍷', kind: 'drink' },
    { id: 'champagne', name: 'Champagne (garrafa)', emoji: '🍾', kind: 'drink' },
    { id: 'atendimento', name: 'Frases de atendimento', emoji: '🙇', kind: 'vocab' }
  ];

  /* ---------- ingredientes: chave: [japonês, português, wiki?] ---------- */
  const ING = {
    buta: ['{豚|ぶた}', 'porco'],
    gyuu: ['{牛肉|ぎゅうにく}', 'carne bovina'],
    gyusuji: ['{牛|ぎゅう}スジ', 'tendão/músculo bovino cozido por horas ("shank meat" no menu)'],
    aburakasu: ['{油|あぶら}かす', 'pedacinhos crocantes de gordura/entranha bovina frita ("fried beef" no menu)'],
    horumon: ['ホルモン', 'miúdos / entranhas bovinas (offal)', ['ja:ホルモン_(料理)']],
    tan: ['タン', 'língua bovina'],
    reba: ['レバー', 'fígado'],
    harami: ['ハラミ', 'fraldinha (diafragma bovino) — skirt steak', ['en:Skirt steak']],
    firei: ['フィレ', 'filé mignon (tenderloin)', ['en:Filet mignon']],
    ribuai: ['リブアイ', 'ancho / olho do contrafilé (ribeye)', ['en:Ribeye steak']],
    wagyu: ['{和牛|わぎゅう}', 'wagyu (gado japonês)', ['en:Wagyu']],
    kurokewagyu: ['{黒毛和牛|くろげわぎゅう}', 'wagyu de pelagem preta (raça Japanese Black)', ['en:Wagyu']],
    spf: ['{林|はやし}SPF', 'marca de porco usada pela casa (SPF = livre de patógenos específicos)'],
    ebi: ['エビ', 'camarão', ['en:Shrimp']],
    ika: ['イカ', 'lula', ['en:Squid']],
    tako: ['タコ', 'polvo', ['en:Octopus']],
    hotate: ['ホタテ', 'vieira', ['en:Scallop']],
    kaki: ['カキ', 'ostra (mês de safra: out–mar)', ['en:Oyster']],
    awabi: ['あわび', 'abalone', ['en:Abalone']],
    asari: ['あさり', 'amêijoa (Manila clam)', ['en:Manila clam']],
    tai: ['{鯛|たい}', 'pargo / sea bream (peixe nobre)', ['en:Sea bream']],
    shirako: ['{白子|しらこ}', 'sêmen de peixe ("leite" de bacalhau)', ['ja:白子']],
    hamo: ['{鱧|はも}', 'hamo (pike conger — enguia-do-mar, verão)', ['ja:ハモ']],
    shiromi: ['{白身魚|しろみざかな}', 'peixe de carne branca'],
    tofu: ['{豆腐|とうふ}', 'tofu', ['en:Tofu']],
    yamaimo: ['{山芋|やまいも}', 'inhame-de-montanha ralado (dá liga à massa)', ['en:Dioscorea polystachya']],
    nagaimo: ['{長芋|ながいも}', 'nagaimo (inhame chinês)', ['en:Dioscorea polystachya']],
    tamago: ['{玉子|たまご}', 'ovo'],
    negi: ['ネギ', 'cebolinha / cebolinha-verde', ['en:Welsh onion']],
    onion: ['オニオン', 'cebola'],
    kyabetsu: ['キャベツ', 'repolho'],
    kyuri: ['キュウリ', 'pepino'],
    tomato: ['フルーツトマト', 'tomate-fruta (tomate pequeno e bem doce)'],
    rukkora: ['ルッコラ', 'rúcula'],
    nira: ['ニラ', 'nira (cebolinha-chinesa)', ['en:Allium tuberosum']],
    moyashi: ['もやし', 'broto de feijão'],
    ninniku: ['ニンニク', 'alho'],
    jagaimo: ['じゃがいも', 'batata'],
    kabocha: ['かぼちゃ', 'abóbora japonesa (kabocha)'],
    kimchi: ['キムチ', 'kimchi (conserva coreana picante)', ['en:Kimchi']],
    katsuobushi: ['{鰹節|かつおぶし}', 'lascas de bonito seco', ['en:Katsuobushi']],
    ponzu: ['ポン{酢|ず}', 'ponzu (shoyu com cítricos)', ['en:Ponzu']],
    shoyu: ['{醤油|しょうゆ}', 'shoyu (molho de soja)', ['en:Soy sauce']],
    miso: ['{味噌|みそ}', 'missô (pasta de soja fermentada)', ['en:Miso']],
    mayo: ['マヨネーズ', 'maionese (a da casa é caseira)'],
    sauce: ['ソース', 'molho (estilo okonomiyaki)'],
    butter: ['バター', 'manteiga'],
    shio: ['{塩|しお}', 'sal'],
    su: ['{酢|す}', 'vinagre'],
    togarashi: ['{唐辛子|とうがらし}', 'pimenta vermelha / caiena'],
    oliveoil: ['オリーブオイル', 'azeite'],
    gomaabura: ['ごま{油|あぶら}', 'óleo de gergelim'],
    cheese: ['チーズ', 'queijo'],
    konnyaku: ['こんにゃく', 'konjac (gel de inhame-konjac)', ['en:Konjac']],
    soba: ['そば', 'macarrão (aqui: o macarrão frito do yakisoba)'],
    spam: ['スパム', 'spam (carne enlatada, muito usada no Havaí)'],
    jalapeno: ['ハラペーニョ', 'jalapeño'],
    mustard: ['マスタード', 'mostarda'],
    pickles: ['ピクルス', 'picles'],
    shochu: ['{焼酎|しょうちゅう}', 'shochu (destilado japonês)', ['en:Shōchū']],
    ume: ['{梅|うめ}', 'ume (ameixa japonesa)', ['en:Ume']],
    budo: ['{葡萄|ぶどう}', 'uva'],
    sudachi: ['スダチ', 'sudachi (cítrico verde de Tokushima)', ['en:Sudachi']],
    grapefruit: ['グレープフルーツ', 'toranja'],
    lemon: ['レモン', 'limão-siciliano'],
    lime: ['ライム', 'lima'],
    hachimitsu: ['ハチミツ', 'mel'],
    oolong: ['{黒|くろ}ウーロン{茶|ちゃ}', 'chá oolong preto', ['en:Oolong']],
    ryokucha: ['{緑茶|りょくちゃ}', 'chá verde', ['en:Green tea']],
    darjeeling: ['ダージリンティー', 'chá Darjeeling'],
    gin: ['ジン', 'gin'],
    tonic: ['トニック', 'água tônica'],
    kintoki: ['{鳴門金時|なるときんとき}', 'batata-doce Naruto Kintoki (de Tokushima)'],
    vanilla: ['バニラアイス', 'sorvete de baunilha'],
    espresso: ['エスプレッソ', 'espresso'],
    macadamia: ['マカダミアナッツ', 'macadâmia']
  };

  const ITEMS = [];
  function A(cat, jp, pt, o) { ITEMS.push(Object.assign({ cat, jp, pt }, o || {})); }

  /* ---------- palavras do cardápio ---------- */
  A('palavras', '{税込価格|ぜいこみかかく}', 'preço com imposto incluso (os valores entre parênteses no cardápio)', { note: 'No cardápio: ※( )内は税込価格です = os valores entre parênteses incluem imposto.' });
  A('palavras', '{増量|ぞうりょう}', 'porção extra / aumentar a quantidade', { note: 'Ex.: そば増量 = macarrão extra (+¥400).' });
  A('palavras', '{単品|たんぴん}', 'porção individual / item avulso');
  A('palavras', '{盛|も}り{合|あ}わせ', 'sortido / combinado de vários itens');
  A('palavras', '{季節|きせつ}', 'estação do ano / sazonal');
  A('palavras', '{本日|ほんじつ}', 'hoje (formal) — ex.: 本日のおすすめ = recomendação do dia');
  A('palavras', 'おすすめ', 'recomendação (no cardápio aparece como オススメ)');
  A('palavras', '{自家製|じかせい}', 'feito na casa / caseiro');
  A('palavras', '{国産|こくさん}', 'produzido no Japão (nacional)');
  A('palavras', '{産|さん}', 'sufixo "produzido em…" — ex.: 淡路島産 = de Awaji-shima');
  A('palavras', '{特製|とくせい}', 'especial da casa / receita especial');
  A('palavras', '{特撰|とくせん}', 'selecionado a dedo / premium (também escrito 特選)');
  A('palavras', '{厳選|げんせん}', 'rigorosamente selecionado');
  A('palavras', '{名様|めいさま}', 'contador de pessoas (formal) — 2名様 = 2 pessoas', { note: '2名様 = にめいさま; 3〜4名様 = さん〜よんめいさま.' });
  A('palavras', '{追加|ついか}オーダー', 'pedido adicional');
  A('palavras', 'サービス{料|りょう}', 'taxa de serviço (aqui 5% a mais na conta)');
  A('palavras', '{別途|べっと}', 'à parte / cobrado separadamente');
  A('palavras', '{人気|にんき}', 'popular / favorito');
  A('palavras', '{塩焼|しおやき}', 'grelhado só no sal');
  A('palavras', 'タレ{焼|やき}', 'grelhado com molho doce de shoyu (tare)');
  A('palavras', '{鉄板|てっぱん}', 'chapa de ferro (teppan)');
  A('palavras', '{使用|しよう}', 'uso / utilizando (ex.: 林SPF使用 = usa porco 林SPF)');
  A('palavras', '{白|しろ}ワイン', 'vinho branco');
  A('palavras', '{赤|あか}ワイン', 'vinho tinto');
  A('palavras', 'グラス', 'taça / copo (cerveja "グラス700" = uma taça por ¥700)');
  A('palavras', 'ノンアルコール', 'sem álcool');

  /* ---------- cursos ---------- */
  A('cursos', '{前菜|ぜんさい}', 'entrada / aperitivo', { en: 'Appetizer', note: '前菜1品 = ぜんさい いっぴん (1 entrada); 前菜2品 = にひん.', ing: [] });
  A('cursos', '{本日|ほんじつ}のオススメ', 'prato recomendado do dia', { en: "Today's Special Dish" });
  A('cursos', '{活|いき}タコ', 'polvo vivo/fresquíssimo', { en: 'Fresh Octopus (Tako)', ing: ['tako'], chk: true, w: ['en:Octopus'], note: '活 aqui = "vivo/fresco do tanque". Leitura い(き)ダコ: confirme com o staff.' });
  A('cursos', 'ホルモン{焼|やき}', 'miúdos bovinos grelhados', { en: 'Grilled Beef innards', ing: ['horumon'], w: ['ja:ホルモン_(料理)'] });
  A('cursos', '{豚|ぶた}キムチ', 'porco salteado com kimchi', { en: 'Pork Kimchi', ing: ['buta', 'kimchi'], w: ['en:Kimchi'] });
  A('cursos', 'コロコロ{焼|やき}', 'cubos de carne grelhados (korokoro = rolando/em cubinhos)', { en: 'Korokoro-yaki', ing: ['gyuu'], w: ['ja:サイコロステーキ'] });
  A('cursos', 'お{好|この}み{焼|やき}', 'okonomiyaki (panqueca japonesa recheada)', { en: 'Okonomiyaki', ing: ['kyabetsu', 'tamago', 'yamaimo'], w: ['en:Okonomiyaki'], yt: 'お好み焼き 作り方' });
  A('cursos', 'ネギ{焼|やき}', 'negiyaki (panqueca fina de cebolinha)', { en: 'Negiyaki', ing: ['negi', 'konnyaku'], w: ['ja:ねぎ焼'] });
  A('cursos', 'そばめし', 'arroz frito com macarrão yakisoba picado', { en: 'Soba-meshi', ing: ['soba'], w: ['ja:そばめし'], yt: 'そばめし 作り方' });
  A('cursos', '{焼|やき}めし', 'arroz frito (yakimeshi)', { en: 'Fried Rice', w: ['ja:炒飯'], yt: '焼きめし 作り方' });
  A('cursos', '{本日|ほんじつ}のジェラート', 'gelato do dia', { en: "Today's Gelato (Affogato or Pistachio)", w: ['en:Gelato'] });
  A('cursos', 'アフォガード', 'affogato (sorvete com espresso por cima)', { en: 'Affogato', ing: ['vanilla', 'espresso'], w: ['en:Affogato'], note: 'No cardápio de bebidas/sobremesas aparece escrito アフォガート.' });
  A('cursos', 'ピスタチオ', 'pistache (gelato de pistache)', { en: 'Pistachio', w: ['en:Pistachio'] });
  A('cursos', '{天然|てんねん}{明石鯛|あかしだい}のカルパッチョ', 'carpaccio de pargo selvagem de Akashi', { en: 'Carpaccio of Wild Akashi Sea Bream', ing: ['tai'], w: ['en:Carpaccio'] });
  A('cursos', '{盛|も}り{合|あ}わせ{野菜|やさい}の{鉄板焼|てっぱんやき}', 'legumes variados na chapa', { en: 'Teppan-Grilled Assorted Vegetables', w: ['en:Teppanyaki'] });
  A('cursos', '{特選|とくせん}シーフードの{盛|も}り{合|あ}わせ', 'seleção premium de frutos do mar', { en: 'Assorted Premium Seafood', ing: ['ebi', 'ika', 'tako', 'hotate'] });
  A('cursos', '{活|いき}あわびステーキ', 'bife de abalone vivo', { en: 'Live Abalone Steak', ing: ['awabi', 'butter'], chk: true, w: ['en:Abalone'] });
  A('cursos', 'ダイナマイトチーズ{焼|やき}', 'gratinado "dinamite" com queijo (creme de inhame + queijo)', { en: 'Dynamite Cheese Grill', ing: ['yamaimo', 'cheese'] });
  A('cursos', 'なにわ{黒牛|くろうし}A5フィレステーキ', 'filé de wagyu "Naniwa" grau A5', { en: 'Naniwa Wagyu A5 Filet Steak', ing: ['kurokewagyu', 'firei'], w: ['en:Wagyu'], note: 'A5 = a mais alta classificação de qualidade/marmoreio.' });
  A('cursos', 'リブアイステーキ', 'bife de ancho (ribeye)', { en: 'Ribeye Steak (120g)', ing: ['ribuai'], w: ['en:Ribeye steak'] });

  /* ---------- entradas ---------- */
  A('entradas', '{自家製|じかせい}ピリ{辛|から}キュウリ', 'picles de pepino da casa, levemente picante', { en: 'Original cucumber pickles — cucumber with vinegar and cayenne pepper powder', ing: ['kyuri', 'su', 'togarashi'], p: [400, 440], yt: 'ピリ辛きゅうり 作り方' });
  A('entradas', 'キムチの{盛|も}り{合|あ}わせ', 'sortido de kimchi', { en: 'Mixed kimchi', ing: ['kimchi'], p: [750, 825], note: 'Prato (盛り) ¥750 (825). Porção individual (単品) ¥500 (550) — vale para cada tipo de kimchi.', w: ['en:Kimchi'] });
  A('entradas', '{白菜|はくさい}キムチ', 'kimchi de acelga-chinesa (o clássico)', { en: 'Kimchi of chinese cabbage', ing: ['kimchi'], p: [500, 550], w: ['en:Kimchi'] });
  A('entradas', '{山芋|やまいも}キムチ', 'kimchi de inhame-de-montanha', { en: 'Yam kimchi', ing: ['kimchi', 'yamaimo'], p: [500, 550] });
  A('entradas', 'チャンジャ', 'chanja: entranha de bacalhau temperada com molho de kimchi', { en: 'Spicy cod innards with kimchi sauce', ing: ['kimchi'], p: [700, 770], w: ['ja:チャンジャ'], note: 'Petisco coreano, textura crocante e picante, muito comum em yakiniku/izakaya.' });
  A('entradas', '{淡路島産|あわじしまさん}スウィートオニオンのスライス', 'cebola doce de Awaji-shima fatiada com ponzu, katsuobushi e ovo cru', { en: 'Sliced onion salad — sliced onion with ponzu sauce, topped with katsuobushi & raw egg', ing: ['onion', 'ponzu', 'katsuobushi', 'tamago'], p: [500, 550], w: ['ja:淡路島玉ねぎ'] });
  A('entradas', 'フルーツトマトとルッコラのサラダ', 'salada de tomate-fruta e rúcula com molho salgado e azeite', { en: 'Fresh tomato and rocket salad', ing: ['tomato', 'rukkora', 'oliveoil', 'shio'], p: [900, 990] });
  A('entradas', 'オリジナルポテトサラダを{自家製|じかせい}タルタルソースで', 'salada de batata da casa com molho tártaro caseiro', { en: 'Original potato salad — crushed boiled potato with mayonnaise, vinegar, mustard, egg, onions, pickles and smoked meat', ing: ['jagaimo', 'mayo', 'su', 'mustard', 'tamago', 'onion', 'pickles', '~carne defumada'], p: [700, 770], w: ['en:Potato salad'] });
  A('entradas', '{季節|きせつ}の{野菜|やさい}に12{種|しゅ}を{使|つか}ったスペシャルサラダ', 'salada especial com 12 tipos de vegetais da estação', { en: 'Seasonal fresh salad — 12 kinds of fresh vegetables with original vinegar dressing', ing: ['su'], p: [1200, 1320], note: '(2〜3名様) = para 2 a 3 pessoas.' });
  A('entradas', 'ピリ{辛|から}ネギをのせた{韓国風|かんこくふう}{冷奴|ひややっこ}', 'tofu gelado estilo coreano com cebolinha picante', { en: 'Spicy Tofu salad — Korean-style tofu salad with chopped green onions, spicy miso paste and sesame oil', ing: ['tofu', 'negi', 'miso', 'gomaabura'], p: [700, 770], w: ['en:Hiyayakko'] });
  A('entradas', '{天然|てんねん}{明石鯛|あかしだい}の{特選|とくせん}カルパッチョ', 'carpaccio especial de pargo selvagem de Akashi', { en: 'Carpaccio of Wild Akashi Sea Bream (Special Selection)', ing: ['tai'], p: [1400, 1540], w: ['en:Carpaccio'] });
  A('entradas', '{希少|きしょう}な{鯛|たい}の{頬身|ほおみ}を{使|つか}ったスプラウトサラダ', 'salada de brotos com bochecha rara de pargo, katsuobushi e ponzu', { en: 'Sprout salad with rare sea bream cheek — bean sprout and cheek meat of sea bream with katsuobushi & ponzu', ing: ['tai', 'moyashi', 'katsuobushi', 'ponzu'], p: [1200, 1320], chk: true, note: '頬身: leitura ほおみ (confirme).' });

  /* ---------- frutos do mar ---------- */
  A('mar', '{活|いき}たこ', 'polvo vivo (Akashi / Awaji-shima)', { en: 'Octopus', ing: ['tako'], px: 'Small (2 pessoas) ¥1,500 (1,650) · Regular (3~4) ¥2,300 (2,530)', chk: true, w: ['en:Octopus'], note: 'Origem: 明石 あかし, 淡路島 あわじしま.' });
  A('mar', 'いか', 'lula (kensaki: Nagasaki · aori: Kishu)', { en: 'Squid', ing: ['ika'], px: 'Small ¥1,500 (1,650) · Regular ¥2,300 (2,530)', w: ['en:Squid'], note: '剣先いか(けんさきいか) = Nagasaki; あおりいか = Kishu (Wakayama).' });
  A('mar', 'ほたて{貝|がい}', 'vieira (de Hokkaido)', { en: 'Scallops', ing: ['hotate'], px: 'Small ¥1,500 (1,650) · Regular ¥2,300 (2,530)', w: ['en:Scallop'] });
  A('mar', 'たいらぎ{貝|がい}', 'tairagi — concha-leque (6~9月, Okayama/Aichi)', { en: 'Bamboo shells (pen shell)', px: 'Small ¥1,600 (1,760) · Regular ¥2,500 (2,750)', w: ['ja:タイラギ'], note: 'O menu traduz como "bamboo shells", mas tairagi é a pen shell.' });
  A('mar', '{大粒|おおつぶ}あさり', 'amêijoas grandes (Hamana-ko / Chiba, mar–jul)', { en: 'Manila clams', ing: ['asari'], p: [1500, 1650], w: ['en:Manila clam'] });
  A('mar', '{活|いき}あわび', 'abalone vivo (Sanriku, Chiba, Tokushima)', { en: 'Avalone [sic: Abalone]', ing: ['awabi'], px: '¥4,500~ / 100g~ (4,950~)', chk: true, w: ['en:Abalone'] });
  A('mar', '{鱧|はも}', 'hamo (pike conger), de Awaji-shima, jul–set', { en: 'Pike conger', ing: ['hamo'], p: [1800, 1980], w: ['ja:ハモ'], note: 'Peixe típico de Kansai no verão.' });
  A('mar', 'たらの{白子|しらこ}', 'sêmen de bacalhau (Hokkaido, nov–fev)', { en: 'Cod milt', ing: ['shirako'], p: [1800, 1980], w: ['ja:白子'] });
  A('mar', '{大粒|おおつぶ}かき', 'ostras grandes (Hiroshima/Sanriku, out–mar)', { en: 'Oysters', ing: ['kaki'], px: 'Small ¥1,600 (1,760) · Regular ¥2,500 (2,750)', w: ['en:Oyster'] });
  A('mar', '{足赤|あしあか}えび', 'camarão ashiaka (Kishu / Austrália), mínimo 2 unidades', { en: 'Shrimps (two for each)', ing: ['ebi'], p: [1800, 1980], w: ['en:Shrimp'], note: '※2尾より〜 = a partir de 2 unidades.' });
  A('mar', '{本日|ほんじつ}の{白身魚|しろみざかな}の{鉄板焼|てっぱんやき}', 'peixe branco do dia na chapa com manteiga', { en: "Today's grilled local fish with butter roasted sauce", ing: ['shiromi', 'butter'], p: [1800, 1980], note: '真鯛(まだい), 甘鯛(あまだい), マナガツオ, サワラ, ヒラメ — conforme a estação.' });

  /* ---------- legumes ---------- */
  A('legumes', '{万願寺唐辛子|まんがんじとうがらし}', 'pimentão-japonês de Kyoto (Manganji)', { en: 'Green peppers', p: [450, 495], pf: true, note: 'Qualquer legume da lista: a partir de ¥450 (495).', w: ['ja:万願寺とうがらし'] });
  A('legumes', '{長芋|ながいも}', 'nagaimo (inhame chinês), de Aomori', { en: 'Chinese yams', ing: ['nagaimo'], p: [450, 495], pf: true });
  A('legumes', 'グリーンアスパラ', 'aspargo verde', { en: 'Asparagus', p: [450, 495], pf: true });
  A('legumes', 'ほうれん{草|そう}', 'espinafre (Gifu)', { en: 'Spinach', p: [450, 495], pf: true });
  A('legumes', 'グリルドオニオン', 'cebola grelhada (Awaji-shima)', { en: 'Onions', ing: ['onion'], p: [450, 495], pf: true });
  A('legumes', 'こんにゃく', 'konjac', { en: 'Konjac', ing: ['konnyaku'], p: [450, 495], pf: true });
  A('legumes', 'レンコン', 'raiz de lótus (Yamaguchi / Tokushima)', { en: 'Lotus roots', p: [450, 495], pf: true, note: 'Também se escreve 蓮根 (れんこん).', w: ['en:Nelumbo nucifera'] });
  A('legumes', '{加茂|かも}なす', 'berinjela de Kamo (Kyoto)', { en: 'Eggplants', p: [450, 495], pf: true });
  A('legumes', '{白|しろ}なす', 'berinjela branca (Senshu, jul–set)', { en: 'White eggplants', p: [450, 495], pf: true });
  A('legumes', 'ズッキーニ', 'abobrinha', { en: 'Zucchini', p: [450, 495], pf: true });
  A('legumes', '{肉厚|にくあつ}しいたけ', 'shiitake gordinho (Kyoto)', { en: 'Shiitake mushrooms', p: [450, 495], pf: true, w: ['en:Shiitake'] });
  A('legumes', 'かぼちゃ', 'abóbora kabocha (Kumamoto, jul–set)', { en: 'Pumpkins', ing: ['kabocha'], p: [450, 495], pf: true });
  A('legumes', '{鳴門金時|なるときんとき}', 'batata-doce Naruto Kintoki (Tokushima, out–mar)', { en: 'Sweet potatoes', ing: ['kintoki'], p: [450, 495], pf: true, w: ['ja:鳴門金時'] });
  A('legumes', 'ジャンボ{舞茸|まいたけ}', 'maitake gigante (Hokkaido)', { en: 'Maitake mushrooms', p: [450, 495], pf: true, w: ['en:Grifola frondosa'] });
  A('legumes', 'たけのこ', 'broto de bambu (fim de mar–abr)', { en: 'Bamboo shoots', p: [450, 495], pf: true, w: ['en:Bamboo shoot'] });
  A('legumes', 'カリカリにんにく', 'alho crocante (chips de alho, Aomori)', { en: 'Garlic chips', ing: ['ninniku'], p: [450, 495], pf: true });
  A('legumes', '{盛|も}り{合|あ}わせ{野菜|やさい}7{種|しゅ}の{鉄板焼|てっぱんやき}', '7 legumes da estação na chapa (escolha do chef)', { en: "Chef's selection grilled 7 seasonal vegetables", p: [1700, 1870], note: '※野菜はおまかせになります = os legumes ficam a critério do chef.' });
  A('legumes', 'ニラもやし{炒|いた}め', 'nira e broto de feijão salteados (com aburakasu/horumon)', { en: 'Stir-fried Chinese chive and soy sprout', ing: ['nira', 'moyashi', 'aburakasu', 'horumon'], p: [1600, 1760], note: '黄ニラ(きニラ) = nira amarela, usada no prato.' });

  /* ---------- okonomiyaki ---------- */
  const OKO_BASE = ['~massa de farinha', 'yamaimo', 'kyabetsu', 'tamago', 'mayo', 'sauce'];
  A('okonomiyaki', 'スーパー{豚玉|ぶたたま}', 'okonomiyaki simples: porco e ovo (porco 林SPF)', { en: 'Pork & Egg okonomiyaki', ing: ['buta', 'spf'].concat(OKO_BASE), p: [1400, 1540], w: ['en:Okonomiyaki'], yt: '豚玉 お好み焼き 作り方', note: '玉 (たま) = ovo. 豚玉 = porco + ovo.' });
  A('okonomiyaki', '{三輪|みわ}ミックス{玉|たま}', 'okonomiyaki mix: porco, ovo, camarão, lula e polvo', { en: "Miwa's Mix okonomiyaki — pork, egg, shrimp, squid & octopus", ing: ['buta', 'tamago', 'ebi', 'ika', 'tako', 'kyabetsu', 'yamaimo'], p: [1900, 2090], w: ['en:Okonomiyaki'], yt: 'ミックス玉 お好み焼き 作り方' });
  A('okonomiyaki', '{三輪|みわ}スペシャル', 'okonomiyaki especial: gyusuji, aburakasu, batata, camarão e lula', { en: "Miwa's Special okonomiyaki — shank meat, fried beef, crashed potato, shrimp & squid", ing: ['gyusuji', 'aburakasu', 'jagaimo', 'ebi', 'ika', 'kyabetsu', 'yamaimo'], p: [2300, 2530], w: ['en:Okonomiyaki'] });
  A('okonomiyaki', 'シーフード{玉|たま}', 'okonomiyaki de frutos do mar: polvo, lula, camarão, vieira e ovo', { en: 'Seafood okonomiyaki — octopus, squid, shrimp, scallop & egg', ing: ['tako', 'ika', 'ebi', 'hotate', 'tamago', 'kyabetsu', 'yamaimo'], p: [1900, 2090], w: ['en:Okonomiyaki'] });
  A('okonomiyaki', 'チーズ{玉|たま}', 'okonomiyaki de queijo e porco', { en: 'Cheese & Pork okonomiyaki', ing: ['buta', 'cheese', 'tamago', 'kyabetsu', 'yamaimo'], p: [1600, 1760], w: ['en:Okonomiyaki'] });
  A('okonomiyaki', '{豚|ぶた}カキ{玉|たま}', 'okonomiyaki de porco e ostra (só de out a mar)', { en: 'Pork & Oyster okonomiyaki', ing: ['buta', 'kaki', 'tamago', 'kyabetsu', 'yamaimo'], p: [2200, 2420], w: ['en:Okonomiyaki'], note: 'Sazonal: 10〜3月 (じゅうがつ〜さんがつ).' });
  A('okonomiyaki', '{三輪|みわ}のスペシャルとん{平焼|ぺいや}き', 'tonpeiyaki: omelete recheada de porco 林SPF', { en: 'Miwa special tonpeiyaki (pork omelet)', ing: ['buta', 'spf', 'tamago', 'kyabetsu'], p: [1600, 1760], w: ['ja:とん平焼き'], yt: 'とん平焼き 作り方', chk: true, note: 'Menu escreve とん平焼き: 平 pode ser lido へい/ぺい. Prato: とんぺいやき.' });

  /* ---------- negiyaki ---------- */
  const NEGI_BASE = ['negi', '~bolinho de peixe (fishcake)', 'konnyaku', '~camarãozinho seco', 'shoyu', 'lemon', 'mayo'];
  A('negiyaki', '{豚|ぶた}ネギ', 'negiyaki simples de porco (林SPF)', { en: 'Shank meat negiyaki [sic — o japonês diz porco]', ing: ['buta', 'spf'].concat(NEGI_BASE), p: [1500, 1650], w: ['ja:ねぎ焼'], note: 'A tradução em inglês do cardápio diz "Shank meat", mas o japonês é 豚 (porco).' });
  A('negiyaki', '{牛|ぎゅう}スジネギ', 'negiyaki com tendão bovino cozido da casa, bem leve', { en: 'Shank meat negiyaki', ing: ['gyusuji'].concat(NEGI_BASE), p: [1800, 1980], w: ['ja:ねぎ焼'] });
  A('negiyaki', '{豚|ぶた}スジネギ', 'negiyaki de porco + tendão — a "aposta" da casa (三輪イチオシ)', { en: 'Pork & Shank meat negiyaki', ing: ['buta', 'gyusuji'].concat(NEGI_BASE), p: [2000, 2200], w: ['ja:ねぎ焼'], note: 'イチオシ = "o número 1 que recomendamos".' });
  A('negiyaki', '{三輪|みわ}ミックスネギ', 'negiyaki mix: porco, camarão, lula e polvo', { en: "Miwa's Mix negiyaki — pork, shrimp, squid & octopus", ing: ['buta', 'ebi', 'ika', 'tako'].concat(NEGI_BASE), p: [2100, 2310], w: ['ja:ねぎ焼'] });
  A('negiyaki', '{三輪|みわ}スペシャルネギ', 'negiyaki especial: gyusuji, aburakasu, batata, camarão e lula', { en: "Miwa's Special negiyaki", ing: ['gyusuji', 'aburakasu', 'jagaimo', 'ebi', 'ika'].concat(NEGI_BASE), p: [2500, 2750], w: ['ja:ねぎ焼'] });
  A('negiyaki', 'シーフードネギ', 'negiyaki de frutos do mar: polvo, lula, camarão, vieira', { en: 'Seafood negiyaki', ing: ['tako', 'ika', 'ebi', 'hotate'].concat(NEGI_BASE), p: [2100, 2310], w: ['ja:ねぎ焼'] });
  A('negiyaki', '{豚|ぶた}カキネギ', 'negiyaki de porco e ostra (out–mar)', { en: 'Pork & Oyster negiyaki', ing: ['buta', 'kaki'].concat(NEGI_BASE), p: [2500, 2750], w: ['ja:ねぎ焼'] });

  /* ---------- modan-yaki ---------- */
  A('modan', '{豚|ぶた}モダン', 'okonomiyaki com macarrão frito dentro; versão simples de porco (林SPF)', { en: 'Pork modan-yaki', ing: ['buta', 'spf', 'soba', 'tamago', 'kyabetsu', 'mayo', 'sauce'], p: [1800, 1980], w: ['ja:モダン焼き'], yt: 'モダン焼き 作り方' });
  A('modan', '{三輪|みわ}ミックスモダン', 'modan-yaki mix: porco, macarrão, camarão, lula e polvo', { en: "Miwa's Mix modan-yaki — pork, shrimp, squid & octopus", ing: ['buta', 'soba', 'ebi', 'ika', 'tako', 'mayo', 'sauce'], p: [2300, 2530], w: ['ja:モダン焼き'] });
  A('modan', 'シーフードモダン', 'modan-yaki de frutos do mar: macarrão, polvo, lula, camarão e vieira', { en: 'Seafood modan-yaki', ing: ['soba', 'tako', 'ika', 'ebi', 'hotate', 'mayo', 'sauce'], p: [2300, 2530], w: ['ja:モダン焼き'], note: 'O menu japonês escreve ポタテ por engano — é ホタテ (vieira).' });

  /* ---------- yakisoba ---------- */
  A('yakisoba', '{特撰豚|とくせんぶた}{焼|や}きそば', 'yakisoba simples de porco (林SPF)', { en: 'Pork fried noodles', ing: ['buta', 'spf', 'soba'], p: [1400, 1540], px: '+ そば増量 (macarrão extra) ¥400 (440)', w: ['en:Yakisoba'], yt: '焼きそば 作り方' });
  A('yakisoba', '{三輪|みわ}ミックス{焼|や}きそば', 'yakisoba mix: porco, camarão, lula, polvo e vieira', { en: "Miwa's Mix fried noodles — pork, shrimp, squid, octopus & scallops", ing: ['buta', 'ebi', 'ika', 'tako', 'hotate', 'soba'], p: [2000, 2200], px: '+ そば増量 ¥400 (440)', w: ['en:Yakisoba'] });
  A('yakisoba', '{特製塩|とくせいしお}そば', 'yakisoba no sal, leve, com alho e azeite', { en: 'Salt fried noodles — garlic, spam, Chinese chive, soy sprout, onion', ing: ['ninniku', 'oliveoil', 'spam', 'nira', 'moyashi', 'onion', 'soba', 'shio'], p: [1800, 1980], w: ['en:Yakisoba'] });
  A('yakisoba', 'オムそば', 'omusoba: yakisoba de porco enrolado em omelete', { en: 'Omelette pork fried noodles', ing: ['buta', 'soba', 'tamago'], p: [1800, 1980], w: ['ja:オムそば'] });

  /* ---------- horumon ---------- */
  A('horumon', '{特製豚|とくせいぶた}キムチ', 'porco salteado com kimchi, "vicia"', { en: 'Addictive fried pork & kimchi [sic: kirsch]', ing: ['buta', 'kimchi'], p: [1100, 1210], note: 'O menu inglês escreve "kirsch" por engano — é kimchi.' });
  A('horumon', 'ホルモンキムチ', 'miúdos bovinos salteados com kimchi', { en: 'Addictive fried beef innards and kimchi', ing: ['horumon', 'kimchi'], p: [1500, 1650], w: ['ja:ホルモン_(料理)'] });
  A('horumon', 'オリジナルホルモンキムチ{豆腐焼|とうふや}き', 'horumon + kimchi + tofu e legumes na chapa', { en: 'Fried beef innards, kimchi, tofu and some vegetables', ing: ['horumon', 'kimchi', 'tofu'], p: [1700, 1870] });
  A('horumon', '{新鮮|しんせん}ホルモンの{塩焼|しおやき} or タレ{焼|やき}', 'miúdos frescos grelhados no sal ou no molho doce de shoyu', { en: 'Grilled beef innards with salty sauce or soy sauce based sweet sauce', ing: ['horumon', 'shio', 'shoyu'], p: [1400, 1540], w: ['ja:ホルモン_(料理)'] });
  A('horumon', '{特上厚切|とくじょうあつぎ}り{黒|くろ}タンの{塩焼|しおやき}', 'língua bovina premium em fatia grossa, grelhada no sal', { en: 'Salt-grilled tongue of beef [sic: beet]', ing: ['tan', 'shio'], p: [2000, 2200], w: ['en:Beef tongue'], note: '特上 = qualidade "extra"; 厚切り = fatia grossa.' });
  A('horumon', '{新鮮|しんせん}レバーのレアステーキ', 'fígado fresco levemente selado (mal passado)', { en: 'Lightly Seared Fresh Liver Steak', ing: ['reba'], p: [1500, 1650], w: ['en:Liver (food)'] });

  /* ---------- teppan da casa ---------- */
  A('teppan', '{三輪|みわ}のグラタン{風|ふう}ダイナマイトチーズ{焼|やき}', 'gratin cremoso de frutos do mar com creme de inhame e queijo', { en: 'Creamy seafood gratin with grated yam paste and cheese on top', ing: ['yamaimo', 'cheese', 'ebi', 'ika', 'hotate'], p: [1100, 1210], w: ['en:Gratin'], note: 'Ingredientes de frutos do mar: o inglês só diz "seafood" — confirme com o staff.' });
  A('teppan', 'タルタルじゃがいもステーキ チーズのせ', 'purê de batata cozido em dashi com shoyu, coberto de queijo', { en: 'Tasty mashed potatoes — stewed in soy-flavored dashi broth, with cheese on top', ing: ['jagaimo', 'shoyu', 'cheese'], px: 'Medium (2 pessoas) ¥800 (880) · Large (3~4) ¥1,000 (1,100)' });
  A('teppan', '{豆腐|とうふ}ステーキ', 'tofu selado na chapa (com aburakasu/horumon)', { en: 'Seared tofu steak', ing: ['tofu', 'aburakasu', 'horumon'], p: [1400, 1540] });
  A('teppan', 'ガーリックシュリンプ', 'camarão ao alho com molho picante de jalapeño (2 un.) — sucesso da loja do Havaí', { en: 'Garlic shrimp from yakiyaki MIWA Hawaii — grilled shrimp with spicy jalapeno sauce', ing: ['ebi', 'ninniku', 'jalapeno'], p: [1600, 1760], note: 'ハワイ店人気メニュー = prato popular da loja do Havaí.', w: ['en:Garlic shrimp'] });

  /* ---------- korokoro ---------- */
  A('korokoro', 'コロコロ{焼|やき}（{黒毛和牛|くろげわぎゅう}100g）', 'cubos de wagyu 100g com alho', { en: 'Korokoro yaki — diced selected beef steak', ing: ['kurokewagyu', 'ninniku'], p: [2900, 3190], px: 'Carne extra +100g: ¥2,500~ (2,750~)', w: ['ja:サイコロステーキ'], note: 'Todos os pratos korokoro vêm com tofu selado + muitos legumes, e molho ponzu da casa.' });
  A('korokoro', 'コロコロシーフード{焼|やき}', 'cubos de camarão, polvo, lula e vieira na manteiga', { en: 'Korokoro seafood — grilled shrimps, octopus, squid and scallops with butter', ing: ['ebi', 'tako', 'ika', 'hotate', 'butter'], p: [3200, 3520] });
  A('korokoro', 'コロコロミックスチャンポン{焼|やき}', 'combo de carne + frutos do mar', { en: 'Korokoro steak & seafood combo', ing: ['gyuu', 'ebi', 'tako', 'ika', 'hotate'], p: [3800, 4180], note: 'チャンポン = mistura.' });
  A('korokoro', '{特撰|とくせん}コロコロ{焼|やき}', 'cubos de corte premium, cortado na hora (a partir de 100g)', { en: 'Special korokoro yaki — diced prime beef steak (100g~)', ing: ['gyuu'], p: [3800, 4180], pf: true, px: '¥3,800~ / 100g~ (4,180~)', note: '100gよりオーダーカット = cortado sob encomenda a partir de 100g.' });
  A('korokoro', '{特撰豚|とくせんぶた}ロースステーキのコロコロ{焼|やき}120g', 'cubos de lombo de porco 林SPF, 120g', { en: 'Korokoro pork — diced pork loin steak', ing: ['buta', 'spf'], p: [2800, 3080] });

  /* ---------- steaks ---------- */
  A('steak', '{特撰黒毛和牛|とくせんくろげわぎゅう}（{雌|めす}のみ）フィレステーキ100g', 'filé mignon de wagyu fêmea (só vacas), 100g', { en: 'Naniwa Wagyu Filet Steak', ing: ['kurokewagyu', 'firei'], p: [4200, 4620], pf: true, w: ['en:Wagyu'], note: '雌 = fêmea. Preço "a partir de" (〜).' });
  A('steak', '{特撰|とくせん}ハラミの{塩|しお}だれステーキ100g', 'fraldinha premium com molho de sal, 100g', { en: 'Premium Harami Steak with Salt Sauce', ing: ['harami', 'shio'], p: [3000, 3300], w: ['en:Skirt steak'] });

  /* ---------- sobremesas ---------- */
  A('sobremesas', 'なるきん{塩|しお}アイス', 'sorvete de baunilha com batata-doce Naruto Kintoki assada (out–mar)', { en: 'Sweet potato with vanilla ice cream', ing: ['kintoki', 'vanilla'], p: [600, 660], w: ['ja:鳴門金時'] });
  A('sobremesas', 'ピスタチオのジェラート', 'gelato de pistache', { en: 'Pistachio gelato', p: [400, 440], w: ['en:Gelato'] });
  A('sobremesas', 'ハワイアンエスプレッソの{冷|つめ}たいアフォガート', 'affogato havaiano: sorvete de baunilha, macadâmia gelada e espresso', { en: 'Hawaiian affogato — vanilla ice cream with frozen Hawaiian macadamia nuts, flavored espresso on top', ing: ['vanilla', 'macadamia', 'espresso'], p: [500, 550], w: ['en:Affogato'] });

  /* ---------- cerveja ---------- */
  A('cerveja', '{生|なま}ビール（サッポロ{黒|くろ}ラベル）', 'chope (draft) Sapporo Black Label — preço por taça', { en: 'Draft Beer (Sapporo Black Label)', p: [700, 770], w: ['ja:サッポロ生ビール黒ラベル'], note: '生 = "cru/fresco", chope não pasteurizado. グラス = taça.' });
  A('cerveja', '{白穂乃香|しろほのか}（ピルスナー）', 'Sapporo "Shiro Honoka", cerveja pilsner — taça', { en: '"SHIRO HONOKA" pilsner', p: [800, 880], w: ['en:Pilsner'] });
  A('cerveja', 'サッポロ{赤星|あかぼし}', 'Sapporo Lager "Akaboshi" (garrafa clássica, amarga e encorpada)', { en: 'SAPPORO AKABOSHI', p: [700, 770], w: ['ja:サッポロラガービール'] });
  A('cerveja', 'サッポロプレミアム ノンアルコール', 'cerveja Sapporo Premium sem álcool', { en: 'SAPPORO PREMIUM Alcohol-free', p: [700, 770], note: 'Aparece também na lista de bebidas sem álcool.' });

  /* ---------- sour ---------- */
  const SOUR = 'Sour = shochu misturado com suco/refrigerante.';
  A('sour', 'ハニーレモンサワー', 'sour de limão em conserva de mel — leve e pouco doce', { en: 'Honey lemon', ing: ['shochu', 'lemon', 'hachimitsu'], p: [750, 825], note: SOUR, w: ['en:Chūhai'] });
  A('sour', '{手搾|てしぼ}りグレープフルーツサワー', 'sour de toranja espremida na hora', { en: 'Squeezed grapefruit', ing: ['shochu', 'grapefruit'], p: [750, 825], w: ['en:Chūhai'] });
  A('sour', 'フレッシュスダチサワー', 'sour de sudachi (cítrico #1 de Tokushima) — o popular da casa', { en: 'Fresh sudachi (Japanese citrus)', ing: ['shochu', 'sudachi'], p: [750, 825], w: ['en:Sudachi'] });
  A('sour', '{国産|こくさん}フルーツトマトサワー', 'sour de suco de tomate-fruta, encorpado', { en: 'Fruit Tomato', ing: ['shochu', 'tomato'], p: [800, 880] });
  A('sour', '{国産葡萄|こくさんぶどう}サワー', 'sour de uva nacional (Katsunuma, Yamanashi)', { en: 'Rich grape', ing: ['shochu', 'budo'], p: [800, 880], note: '山梨県 やまなしけん · 勝沼醸造 かつぬまじょうぞう.' });
  A('sour', '{紀州梅|きしゅううめ}サワー', 'sour de ume Nankō-ume de Kishu — agridoce', { en: 'Ume (Japanese plum)', ing: ['shochu', 'ume'], p: [800, 880], w: ['en:Ume'] });
  A('sour', 'あらごし{梅|うめ}', 'licor de ume com polpa: on the rocks, com soda ou com água', { en: 'Roughly grated plums — on the rocks, with soda, or with water', ing: ['ume'], p: [800, 880], note: 'ロック = com gelo; ソーダ = com soda; 水割り(みずわり) = com água.', w: ['en:Umeshu'] });

  /* ---------- coquetéis ---------- */
  A('coquetel', 'オリジナルジントニック', 'gin tônica da casa com frutas cítricas curtidas no gin', { en: 'Citrus gin & tonic — steeped grapefruit, lime and lemon in gin', ing: ['gin', 'tonic', 'grapefruit', 'lime', 'lemon'], p: [900, 990], w: ['en:Gin and tonic'] });
  A('coquetel', '{三輪|みわ}ハイ', 'hai da casa: chá Darjeeling + shochu "Kicchomu"', { en: 'Miwa-hai — darjeeling tea and Japanese shochu "Kicchomu"', ing: ['darjeeling', 'shochu'], p: [750, 825], note: '二階堂吉四六 (にかいどうきっちょむ) é a marca do shochu.' });
  A('coquetel', '{黒|くろ}ウーロンハイ', 'oolong-hai com chá oolong preto exclusivo da casa', { en: 'Black Oolong-hai', ing: ['oolong', 'shochu'], p: [700, 770], w: ['en:Oolong'], note: 'ハイ = abreviação de ハイボール (shochu + bebida sem açúcar).' });
  A('coquetel', '{緑茶|りょくちゃ}ハイ', 'shochu com chá verde', { en: 'Green Tea-hai', ing: ['ryokucha', 'shochu'], p: [700, 770], w: ['en:Green tea'] });

  /* ---------- sem álcool ---------- */
  A('soft', '{手搾|てしぼ}りグレープフルーツジュース', 'suco de toranja espremido na hora', { en: 'Fresh grapefruit juice', p: [750, 825] });
  A('soft', 'オレンジジュース', 'suco de laranja', { en: 'Orange juice', p: [750, 825] });
  A('soft', '{国産|こくさん}フルーツトマトジュース', 'suco de tomate-fruta nacional', { en: 'Fruit tomato juice', ing: ['tomato'], p: [750, 825] });
  A('soft', '{国産葡萄|こくさんぶどう}ジュース', 'suco de uva nacional', { en: 'Grape juice', ing: ['budo'], p: [850, 935] });
  A('soft', 'ジンジャーエール', 'ginger ale (Wilkinson)', { en: 'WILKINSON ginger ale', p: [500, 550], w: ['en:Ginger ale'] });
  A('soft', 'コカ・コーラ', 'Coca-Cola', { en: 'Coca-cola coke', p: [500, 550] });
  A('soft', '{黒|くろ}ウーロン{茶|ちゃ}', 'chá oolong preto', { en: 'Black oolong tea', ing: ['oolong'], p: [500, 550], w: ['en:Oolong'] });
  A('soft', 'ミネラルウォーター', 'água mineral', { en: 'Mineral water', p: [500, 550] });
  A('soft', 'サンペレグリノ', 'água com gás San Pellegrino', { en: 'S. Pellegrino sparkling water', p: [600, 660], w: ['en:Sanpellegrino S.p.A.'] });

  /* ---------- vinhos ---------- */
  A('vinho', 'ロスヴァスコスソーヴィニヨンブラン', 'Los Vascos — Sauvignon Blanc do Chile (branco)', { en: 'Los Vascos Sauvignon Blanc', p: [4500, 4950], w: ['en:Sauvignon blanc'], note: 'Branco fresco e cítrico.' });
  A('vinho', 'テラザスデロスアンデスレゼルバシャルドネ', 'Terrazas de los Andes Reserva — Chardonnay argentino (branco)', { en: 'Terrazas de Los Andes Reserva Chardonnay', p: [6000, 6600], w: ['en:Chardonnay'] });
  A('vinho', 'ラシャブリジェンヌシャブリレヴェネラブル', 'La Chablisienne — Chablis (Borgonha, França), branco mineral', { en: 'La Chablisienne Chablis Les Vénérables Vieilles [Vignes]', p: [8000, 8800], w: ['en:Chablis wine region'] });
  A('vinho', 'ドメーヌフアシェサンセールレグランシャン2023', 'Fouassier — Sancerre (Loire, França), branco 2023', { en: 'Dom. Fouassier Sancerre Les Grands Champs 2023', p: [15000, 16500], w: ['en:Sancerre'], note: 'O menu escreve フアシェ (sic).' });
  A('vinho', 'ルイラトゥールシャサーニュモンラッシェブラン2023', 'Louis Latour — Chassagne-Montrachet Blanc 2023 (Borgonha)', { en: 'Louis Latour Chassagne Montrachet Blanc 2023', p: [40000, 44000], w: ['en:Chassagne-Montrachet'] });
  A('vinho', 'スモーキングルーンザオリジナルオールドヴァインジンファンデル', 'Smoking Loon — Zinfandel de vinhas velhas, Califórnia (tinto)', { en: 'Smoking Loon The Original Old Vine Zinfandel California', p: [4500, 4950], w: ['en:Zinfandel'] });
  A('vinho', 'ルパート&ロートシルトクラシック', 'Rupert & Rothschild Classique (tinto, África do Sul)', { en: 'Rupert & Rothschild Classique', p: [9000, 9900], chk: true, note: 'Origem: de memória (África do Sul) — confirme no rótulo/staff.' });
  A('vinho', 'ルマルキドカロンセギュール2021', 'Le Marquis de Calon Ségur 2021 (Bordeaux, tinto)', { en: 'Le Marquis de Calon Ségur 2021', p: [20000, 22000], w: ['en:Château Calon-Ségur'] });
  A('vinho', 'ロバートモンダヴィカベルネ・ソーヴィニヨンナパヴァレー', 'Robert Mondavi — Cabernet Sauvignon, Napa Valley (tinto)', { en: 'Robert Mondavi Winery Cabernet Sauvignon Napa Valley', p: [30000, 33000], w: ['en:Cabernet Sauvignon'] });
  A('vinho', 'ブシャールペール・エ・フィスジュヴレシャンベルタン2020', 'Bouchard Père & Fils — Gevrey-Chambertin 2020 (Borgonha, tinto)', { en: 'Bouchard Père & Fils Gevrey Chambertin 2020', p: [40000, 44000], w: ['en:Gevrey-Chambertin'] });
  A('vinho', 'シャトーカロンセギュール2021', 'Château Calon Ségur 2021 (Bordeaux, tinto)', { en: 'Ch. Calon Ségur 2021', p: [80000, 88000], w: ['en:Château Calon-Ségur'] });

  /* ---------- champagne ---------- */
  A('champagne', 'ヴーヴクリコイエローラベルハーフ', 'Veuve Clicquot Yellow Label — meia garrafa', { en: 'Veuve Clicquot Yellow Label Half Bottle', p: [11000, 12100], w: ['en:Veuve Clicquot'] });
  A('champagne', 'ヴーヴクリコイエローラベル', 'Veuve Clicquot Yellow Label — garrafa', { en: 'Veuve Clicquot Yellow Label', p: [18000, 19800], w: ['en:Veuve Clicquot'] });
  A('champagne', 'モエエシャンドンアイスアンペリアル', 'Moët & Chandon Ice Impérial (feito para servir com gelo)', { en: 'Moët & Chandon Ice Impérial', p: [21000, 23100], w: ['en:Moët & Chandon'] });
  A('champagne', 'ドンペリニヨン', 'Dom Pérignon', { en: 'Dom Pérignon', p: [74000, 81400], w: ['en:Dom Pérignon (champagne)'] });
  A('champagne', 'ペリエジュエベルエポック', 'Perrier-Jouët Belle Epoque', { en: 'Perrier Jouët Belle Epoque', p: [65000, 71500], w: ['en:Perrier-Jouët'] });
  A('champagne', 'クリュッググランドキュヴェ', 'Krug Grande Cuvée Brut', { en: 'Krug Grande Cuvée Brut', p: [88000, 96800], w: ['en:Krug (champagne)'] });

  /* ---------- atendimento (extra, não está no cardápio) ---------- */
  A('atendimento', 'いらっしゃいませ', 'bem-vindo(a)! (saudação ao cliente que entra)');
  A('atendimento', '{何名様|なんめいさま}ですか', 'quantas pessoas são?');
  A('atendimento', 'こちらへどうぞ', 'por aqui, por favor');
  A('atendimento', 'ご{注文|ちゅうもん}はお{決|き}まりですか', 'já decidiu o pedido?');
  A('atendimento', 'かしこまりました', 'certo, entendido (muito formal)');
  A('atendimento', '{少々|しょうしょう}お{待|ま}ちください', 'aguarde um momento, por favor');
  A('atendimento', 'お{待|ま}たせいたしました', 'obrigado por esperar / aqui está (ao servir)');
  A('atendimento', '{以上|いじょう}でよろしいでしょうか', 'seria só isso? (ao fechar o pedido)');
  A('atendimento', '{失礼|しつれい}いたします', 'com licença (ao servir ou retirar pratos)');
  A('atendimento', 'アレルギーはございますか', 'tem alguma alergia?', { note: 'Pergunta essencial — o cardápio tem ovo cru, frutos do mar, trigo, soja…' });
  A('atendimento', '{焼|や}き{加減|かげん}はいかがなさいますか', 'qual ponto da carne deseja?');
  A('atendimento', '{取|と}り{皿|ざら}', 'pratinho individual para dividir a comida');
  A('atendimento', 'おしぼり', 'toalhinha úmida de mão');
  A('atendimento', 'お{会計|かいけい}', 'conta / pagamento');
  A('atendimento', 'ありがとうございました', 'muito obrigado (ao cliente sair)');
  A('atendimento', '{申|もう}し{訳|わけ}ございません', 'sinto muitíssimo');

  /* ---------- cursos e regras (referência) ---------- */
  const COURSES = [
    { name: 'Basic Course', p: [6500, 7150], items: ['{前菜|ぜんさい} ×1', '{本日|ほんじつ}のオススメ ×1', '{活|いき}タコ', 'ホルモン{焼|やき} or {豚|ぶた}キムチ', 'コロコロ{焼|やき}', 'お{好|この}み{焼|やき} or ネギ{焼|やき}', 'そばめし or {焼|やき}めし', '{本日|ほんじつ}のジェラート（アフォガード or ピスタチオ）'] },
    { name: 'Premium Course', p: [12000, 13200], items: ['{前菜|ぜんさい} ×2', '{天然|てんねん}{明石鯛|あかしだい}のカルパッチョ or オススメ ×1', '{盛|も}り{合|あ}わせ{野菜|やさい}の{鉄板焼|てっぱんやき}', '{特選|とくせん}シーフードの{盛|も}り{合|あ}わせ or {活|いき}あわびステーキ', 'ホルモン{焼|やき} or ダイナマイトチーズ{焼|やき}', 'なにわ{黒牛|くろうし}A5フィレステーキ or リブアイステーキ120g', 'お{好|この}み{焼|やき}・ネギ{焼|やき}・そばめし・{焼|やき}めしから1{品|ぴん}', '{本日|ほんじつ}のジェラート（アフォガード or ピスタチオ）'] }
  ];
  const RULES = [
    ['Cursos', 'Os cursos são para no mínimo 2 pessoas. Para 4 ou mais o conteúdo pode mudar — consultar o staff. (コースは2名様より承っております。4名様以上の場合は内容が変わることがございます。)'],
    ['Preços', 'O primeiro valor é sem imposto; o valor entre parênteses já inclui imposto (※( )内は税込価格です).'],
    ['Taxa de serviço', 'Cobra-se 5% de taxa de serviço na conta (別途サービス料として5%頂戴いたします).'],
    ['Tempo de preparo', 'Tudo é feito depois do pedido; em horário cheio, pedidos adicionais demoram bastante (当店はすべてオーダーを頂いてから調理しています).'],
    ['Okonomiyaki', 'Panqueca japonesa de farinha mista, inhame ralado, repolho e ovo, com maionese caseira e molho. Dá para pedir com os ingredientes que o cliente quiser.'],
    ['Negiyaki', 'Variação mais fina do okonomiyaki, feita só de cebolinha, bolinho de peixe, konjac e camarãozinho seco na massa; vai com shoyu, limão e maionese caseira (sem molho extra — o sabor é limão-shoyu).'],
    ['Modan-yaki', 'Okonomiyaki com macarrão frito dobrado dentro da massa, coberto de maionese caseira e molho.'],
    ['Korokoro-yaki', 'Todo prato korokoro vem com tofu selado e bastante legume grelhado; comer com o ponzu da casa.']
  ];

  window.MENU = { CATS, ING, ITEMS, COURSES, RULES };
})();
