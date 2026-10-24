/* 三輪 · Cardápio JP — app de estudo (sem build, sem dependências) */
(function () {
  'use strict';
  const M = window.MENU, KJ = window.KANJI;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const q = encodeURIComponent;

  /* ---------- furigana {漢字|かんじ} ---------- */
  const RB_SRC = '\\{([^|{}]+)\\|([^{}]+)\\}';
  const plain = m => m.replace(new RegExp(RB_SRC, 'g'), '$1');
  const reading = m => m.replace(new RegExp(RB_SRC, 'g'), '$2');
  function ruby(m, show) {
    if (show === undefined) show = true;
    const re = new RegExp(RB_SRC, 'g'); let o = '', last = 0, x;
    while ((x = re.exec(m))) {
      o += esc(m.slice(last, x.index));
      o += show ? '<ruby>' + esc(x[1]) + '<rt>' + esc(x[2]) + '</rt></ruby>' : esc(x[1]);
      last = re.lastIndex;
    }
    return o + esc(m.slice(last));
  }
  const isKanji = c => c >= '一' && c <= '鿿';
  const kanjiOf = s => { const o = []; for (const ch of s) if (isKanji(ch) && !o.includes(ch)) o.push(ch); return o; };
  const short = pt => (pt.split(/\s—\s|;\s|:\s/)[0] || pt).trim();
  const yen = n => '¥' + n.toLocaleString('en-US');

  /* ---------- kana → romaji (Hepburn) ---------- */
  const ROMA = (() => {
    const t = {};
    const a = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split('');
    const b = 'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa o n'.split(' ');
    a.forEach((k, i) => t[k] = b[i]);
    const v = 'がga ぎgi ぐgu げge ごgo ざza じji ずzu ぜze ぞzo だda ぢji づzu でde どdo ばba びbi ぶbu べbe ぼbo ぱpa ぴpi ぷpu ぺpe ぽpo ゔvu ぁa ぃi ぅu ぇe ぉo'.split(' ');
    v.forEach(x => t[x[0]] = x.slice(1));
    return t;
  })();
  const MAC = { a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' };
  const k2h = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const PUNCT = { '、': ', ', '。': '. ', '・': ' · ', '（': '(', '）': ')', '！': '!', '？': '?', '～': '~', '〜': '~', '　': ' ' };
  function cons(r) {
    if (r === 'u') return 'w';
    if (r === 'shi') return 'sh'; if (r === 'chi') return 'ch'; if (r === 'ji') return 'j';
    if (r === 'fu') return 'f'; if (r === 'tsu') return 'ts';
    return r.slice(0, -1);
  }
  function toRomaji(src) {
    const s = k2h(src); let out = '', i = 0, soku = false;
    while (i < s.length) {
      const ch = s[i], nx = s[i + 1];
      if (ch === 'っ') { soku = true; i++; continue; }
      if (ch === 'ー') { out = out.replace(/([aiueo])$/, m => MAC[m]); i++; continue; }
      let r = ROMA[ch];
      if (r === undefined || 'ぁぃぅぇぉ'.includes(ch)) { out += (PUNCT[ch] !== undefined ? PUNCT[ch] : (r !== undefined ? r : ch)); soku = false; i++; continue; }
      let used = 1;
      if (nx && 'ゃゅょ'.includes(nx)) {
        const c = cons(r), vw = { 'ゃ': 'a', 'ゅ': 'u', 'ょ': 'o' }[nx];
        r = (['sh', 'ch', 'j'].includes(c) ? c : c + 'y') + vw; used = 2;
      } else if (nx && 'ぁぃぅぇぉ'.includes(nx)) { r = cons(r) + ROMA[nx]; used = 2; }
      else if (r === 'n') { const r2 = ROMA[s[i + 1]]; r = (r2 && /^[aiueoy]/.test(r2)) ? "n'" : 'n'; }
      if (soku) { r = (r.startsWith('ch') ? 't' : r[0]) + r; soku = false; }
      out += r; i += used;
    }
    return out;
  }

  /* ---------- armazenamento ---------- */
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const DEF = { newPerDay: 15, furiFront: false, romaji: true, dir: 'jp', auto: false, theme: 'auto', rate: 0.85 };
  let S = LS.get('ym.srs', {});          // estado SRS por carta
  let LOG = LS.get('ym.log', {});        // dia → nº de respostas
  let DAILY = LS.get('ym.daily', { d: 0, n: 0 });
  let SET = Object.assign({}, DEF, LS.get('ym.set', {}));
  const save = () => { LS.set('ym.srs', S); LS.set('ym.log', LOG); LS.set('ym.daily', DAILY); LS.set('ym.set', SET); };
  const dayNum = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
  const dateStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  /* ---------- cartas ---------- */
  const CAT = {}; M.CATS.forEach(c => CAT[c.id] = c);
  CAT.kanji = { id: 'kanji', name: 'Kanji do cardápio', emoji: '漢', kind: 'vocab' };
  const cards = [], byId = {};
  const add = c => { c.kind = CAT[c.cat].kind; cards.push(c); byId[c.id] = c; };
  M.CATS.forEach(cat => {
    if (cat.id === 'ingredientes') {
      Object.keys(M.ING).forEach(key => { const g = M.ING[key]; add({ id: 'ing:' + key, cat: 'ingredientes', key, jp: g[0], pt: g[1], w: g[2] || [], isIng: true }); });
    } else {
      M.ITEMS.filter(it => it.cat === cat.id).forEach(it => add(Object.assign({ id: it.cat + ':' + plain(it.jp), w: [] }, it)));
    }
  });
  const kcount = {}, kwords = {}, ingUsers = {};
  cards.forEach(c => {
    kanjiOf(plain(c.jp)).forEach(k => { kcount[k] = (kcount[k] || 0) + 1; (kwords[k] = kwords[k] || []).push(c.id); });
    (c.ing || []).forEach(g => { if (g[0] !== '~') (ingUsers[g] = ingUsers[g] || []).push(c.id); });
  });
  const KLIST = Object.keys(KJ).sort((a, b) => (kcount[b] || 0) - (kcount[a] || 0));
  KLIST.forEach(k => { const v = KJ[k]; add({ id: 'kanji:' + k, cat: 'kanji', kanji: k, jp: k, pt: v[2], on: v[0], kun: v[1], w: [] }); });

  const norm = s => k2h(String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
  function hay(c) {
    if (!c._h) {
      const ingn = (c.ing || []).map(g => g[0] === '~' ? g.slice(1) : (M.ING[g] ? plain(M.ING[g][0]) + ' ' + M.ING[g][1] : '')).join(' ');
      c._h = norm([plain(c.jp), reading(c.jp), toRomaji(reading(c.jp)), c.pt, c.en || '', ingn, c.kun || '', c.on || ''].join(' '));
    }
    return c._h;
  }
  const cardReading = c => c.kanji ? (c.kun || c.on).split('、')[0].replace(/[.\-]/g, '') : reading(c.jp);

  /* ---------- SRS (SM-2 simplificado) ---------- */
  function nextState(s, g) {
    const n = s ? Object.assign({}, s) : { r: 0, i: 0, e: 2.5, l: 0, p: 0, d: 0 };
    delete n.k;
    const first = n.r === 0;
    if (g === 0) { if (n.r > 0) { n.l++; n.p = n.i; } n.e = Math.max(1.3, n.e - 0.2); n.r = 0; n.i = 0; n.d = dayNum(); return n; }
    const base = first && n.p ? Math.max(1, Math.round(n.p * 0.4)) : 1;
    let i;
    if (g === 1) { i = first ? base : Math.max(n.i + 1, Math.round(n.i * 1.2)); n.e = Math.max(1.3, n.e - 0.15); }
    else if (g === 2) { i = first ? base : (n.i <= 1 ? 3 : Math.round(n.i * n.e)); }
    else { i = first ? Math.max(4, base * 2) : Math.round(Math.max(n.i, 1) * n.e * 1.3) + 1; n.e = Math.min(3, n.e + 0.15); }
    if (first) n.p = 0;
    n.r++; n.i = Math.min(365, i); n.d = dayNum() + n.i; return n;
  }
  const ilabel = d => d <= 0 ? 'agora' : d < 30 ? d + ' d' : d < 365 ? Math.round(d / 30) + ' mês' : '1 ano';
  function status(c) {
    const s = S[c.id];
    if (!s) return 'new';
    if (s.k) return 'known';
    return s.i >= 21 ? 'mature' : (s.r >= 2 || s.i >= 3) ? 'young' : 'learn';
  }
  const STXT = { new: 'Novo', learn: 'Aprendendo', young: 'Em revisão', mature: 'Bem fixado', known: 'Marcado como "já sei"' };
  function newLeft() { if (DAILY.d !== dayNum()) { DAILY = { d: dayNum(), n: 0 }; } return Math.max(0, SET.newPerDay - DAILY.n); }
  function streak() {
    let d = dayNum(), n = 0;
    if (!LOG[d]) d--;
    while (LOG[d]) { n++; d--; }
    return n;
  }
  const dueCards = pool => { const t = dayNum(); return pool.filter(c => S[c.id] && S[c.id].d <= t); };
  function filterFn(key) {
    if (key === 'all') return () => true;
    const [t, v] = key.split(':');
    return t === 'kind' ? c => c.kind === v : c => c.cat === v;
  }

  /* ---------- voz ---------- */
  let voice = null;
  function pickVoice() { try { voice = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang)) || null; } catch (e) { } }
  if (typeof speechSynthesis !== 'undefined') { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function say(text) {
    if (typeof speechSynthesis === 'undefined') { toast('Este navegador não tem voz japonesa.'); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = SET.rate; if (voice) u.voice = voice;
      speechSynthesis.speak(u);
    } catch (e) { toast('Não consegui tocar o áudio.'); }
  }
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }

  /* ---------- links de estudo ---------- */
  function links(c) {
    const p = c.kanji ? c.kanji : plain(c.jp);
    const out = [];
    const isFood = c.kind === 'food', isDrink = c.kind === 'drink';
    const en = (c.en || '').replace(/["“”]/g, '');
    if (!c.kanji && (isFood || isDrink || c.isIng)) {
      const jpQ = c.yt || (isFood ? p + ' 作り方' : p + ' とは');
      const ptQ = isFood ? 'como fazer ' + (en || short(c.pt)) : 'o que é ' + (en || short(c.pt));
      out.push(['▶️ Vídeos em japonês', 'https://www.youtube.com/results?search_query=' + q(jpQ)]);
      out.push(['▶️ Vídeos em português', 'https://www.youtube.com/results?search_query=' + q(ptQ)]);
      out.push(['🖼️ Fotos', 'https://www.google.com/search?tbm=isch&q=' + q(p + (en ? ' ' + en : '') + (isFood ? ' 料理' : ''))]);
    }
    out.push(['📖 Jisho', 'https://jisho.org/search/' + q(c.kanji ? c.kanji + ' #kanji' : p)]);
    out.push(['🈶 jpdb.io', 'https://jpdb.io/search?q=' + q(p)]);
    return out;
  }

  /* ---------- Wikipedia (foto + resumo) ---------- */
  async function wikiGet(spec) {
    const cache = LS.get('ym.wiki', {});
    if (cache[spec]) return cache[spec];
    const i = spec.indexOf(':'), lang = spec.slice(0, i), title = spec.slice(i + 1);
    const r = await fetch('https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + q(title.replace(/ /g, '_')), { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('http');
    const j = await r.json();
    if (j.type === 'disambiguation' || !j.extract) throw new Error('vazio');
    const v = { t: j.title, x: j.extract, img: (j.thumbnail && j.thumbnail.source) || '', l: lang, u: (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) || ('https://' + lang + '.wikipedia.org/wiki/' + q(title)) };
    cache[spec] = v; LS.set('ym.wiki', cache);
    return v;
  }
  async function loadWiki(c, el) {
    for (const spec of c.w) {
      try {
        const v = await wikiGet(spec);
        if (!el.isConnected) return;
        el.innerHTML = (v.img ? '<img loading="lazy" alt="' + esc(v.t) + '" src="' + esc(v.img) + '">' : '') +
          '<p lang="' + esc(v.l) + '">' + esc(v.x) + '</p>' +
          '<p class="small muted">Fonte: <a target="_blank" rel="noopener" href="' + esc(v.u) + '">Wikipédia (' + esc(v.l) + ') — ' + esc(v.t) + '</a></p>';
        return;
      } catch (e) { /* tenta o próximo */ }
    }
    if (el.isConnected) el.innerHTML = '<p class="muted small">Sem foto/resumo agora (offline ou página não encontrada). Use os links abaixo.</p>';
  }

  /* ---------- estado de interface ---------- */
  const ui = { tab: 'study', sess: null, mcat: 'all', mq: '', kq: '', quiz: null, qsel: { f: 'all', m: 'jp2pt' } };
  const stack = [];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const hash = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };

  /* ---------- blocos de carta ---------- */
  function ingChips(c) {
    if (!c.ing || !c.ing.length) return '';
    return '<div>' + c.ing.map(g => {
      if (g[0] === '~') return '<span class="chip">' + esc(g.slice(1)) + '</span>';
      const x = M.ING[g]; if (!x) return '';
      return '<button class="chip" data-act="open" data-id="ing:' + esc(g) + '"><b>' + esc(plain(x[0])) + '</b> ' + esc(short(x[1]).split(' (')[0]) + '</button>';
    }).join('') + '</div>';
  }
  function kanjiChips(c) {
    const ks = kanjiOf(plain(c.jp)).filter(k => KJ[k]);
    if (!ks.length || c.kanji) return '';
    return '<div>' + ks.map(k => '<button class="chip" data-act="kanji" data-k="' + k + '"><b>' + k + '</b> ' + esc((KJ[k][1] || KJ[k][0]).split('、')[0]) + ' · ' + esc(KJ[k][2].split(/[,;(]/)[0]) + '</button>').join('') + '</div>';
  }
  function priceHtml(c) {
    if (!c.p) return '';
    return '<div>' + (c.pf ? 'a partir de ' : '') + '<b>' + yen(c.p[0]) + '</b> <span class="muted">(' + yen(c.p[1]) + ' com imposto)</span>' + (c.px ? ' <span class="muted">' + esc(c.px) + '</span>' : '') + '</div>';
  }
  function jpBlock(c, rb) {
    if (c.kanji) return '<div class="kbig">' + c.kanji + '</div>';
    return '<div class="big jp">' + ruby(c.jp, rb) + '</div>';
  }
  function romajiLine(c) {
    if (c.kanji) return '<div class="rd small">' + esc(toRomaji(cardReading(c))) + '</div>';
    return SET.romaji ? '<div class="rd small">' + esc(toRomaji(reading(c.jp))) + '</div>' : '';
  }
  function kanjiInfo(c) {
    return '<div class="panel" style="text-align:left"><div><b>音 on:</b> <span class="jp">' + esc(c.on || '—') + '</span></div><div><b>訓 kun:</b> <span class="jp">' + esc(c.kun || '—') + '</span></div>' +
      '<div class="small muted">Em kun, o “.” separa a parte escrita em kana (okurigana).</div></div>';
  }
  function wordsChips(k) {
    const ids = kwords[k] || [];
    return ids.slice(0, 14).map(id => '<button class="chip" data-act="open" data-id="' + esc(id) + '"><b>' + ruby(byId[id].jp, false) + '</b></button>').join('') +
      (ids.length > 14 ? '<span class="muted small"> +' + (ids.length - 14) + '</span>' : '');
  }
  const flipOf = c => SET.dir === 'pt' || (SET.dir === 'mix' && hash(c.id + dayNum()) % 2 === 1);

  /* ---------- tela: estudar ---------- */
  function renderStudy() {
    if (ui.sess) return renderSession();
    const t = dayNum();
    const allDue = dueCards(cards).length;
    const nl = newLeft();
    const unseen = cards.filter(c => !S[c.id]).length;
    const learned = cards.filter(c => S[c.id] && S[c.id].r > 0).length;
    let h = '<div class="panel hero"><div class="nums"><div><b>' + allDue + '</b><span class="small muted">para revisar</span></div><div><b>' + Math.min(nl, unseen) + '</b><span class="small muted">novos hoje</span></div><div><b>' + learned + '/' + cards.length + '</b><span class="small muted">vistos</span></div></div>' +
      '<button class="btn primary" data-act="deck" data-f="all">Estudar agora</button></div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="deck" data-f="kind:food">🍽️ Só comidas</button><button class="btn sm" data-act="deck" data-f="kind:drink">🍺 Só bebidas</button><button class="btn sm" data-act="deck" data-f="kind:vocab">📖 Só vocabulário</button></div>';
    h += '<h2>Baralhos</h2>';
    const decks = M.CATS.map(c => c.id).concat('kanji');
    decks.forEach(id => {
      const cs = cards.filter(c => c.cat === id), cat = CAT[id];
      const seen = cs.filter(c => S[c.id] && S[c.id].r > 0).length, due = dueCards(cs).length, nw = cs.filter(c => !S[c.id]).length;
      h += '<button class="deck" data-act="deck" data-f="cat:' + id + '"><span class="em">' + cat.emoji + '</span><span class="nm">' + esc(cat.name) +
        '<div class="bar"><i style="width:' + Math.round(100 * seen / cs.length) + '%"></i></div></span><span class="ct"><b>' + due + '</b> rev · ' + nw + ' novos<br>' + seen + '/' + cs.length + '</span></button>';
    });
    h += '<p class="small muted">Limite de ' + SET.newPerDay + ' cartas novas por dia (muda em “Mais”). Ordem: ingredientes → palavras → pratos → bebidas → kanji.</p>';
    return h;
  }
  function startSession(key) {
    const pool = cards.filter(filterFn(key));
    const due = dueCards(pool).sort((a, b) => S[a.id].d - S[b.id].d);
    const nw = pool.filter(c => !S[c.id]).slice(0, newLeft());
    const queue = due.concat(nw).map(c => c.id);
    if (!queue.length) { toast('Nada para estudar aqui agora. Volte amanhã ou escolha outro baralho.'); return; }
    ui.sess = { queue, total: queue.length, done: 0, show: false, key, spoken: '' };
    render();
  }
  function renderSession() {
    const s = ui.sess;
    if (!s.queue.length) {
      return '<div class="panel" style="text-align:center"><h2>🎉 Sessão concluída</h2><p>' + s.total + ' carta(s) revisada(s). Ótimo trabalho!</p><button class="btn primary block" data-act="quit">Voltar</button></div>';
    }
    const c = byId[s.queue[0]], flip = flipOf(c), st = S[c.id];
    let h = '<div class="sess-top"><button class="btn sm" data-act="quit">✕</button><div class="bar"><i style="width:' + Math.round(100 * s.done / s.total) + '%"></i></div><span class="small muted">' + s.queue.length + '</span></div>';
    h += '<div class="card"' + (s.show ? '' : ' data-act="reveal"') + '>';
    h += '<span class="cat">' + CAT[c.cat].emoji + ' ' + esc(CAT[c.cat].name) + (st ? '' : ' · <b>novo</b>') + '</span>';
    h += '<button class="btn sm say" data-act="say" data-id="' + esc(c.id) + '">🔊</button>';
    if (!flip) { h += jpBlock(c, SET.furiFront || s.show); if (s.show) h += romajiLine(c); }
    else h += '<div class="ptbig">' + esc(c.pt) + '</div>';
    if (!s.show) h += '<div class="hint">toque para ver a resposta</div>';
    else {
      h += '<hr>';
      if (flip) { h += jpBlock(c, true) + romajiLine(c); }
      else h += '<div class="ptbig">' + esc(c.pt) + '</div>';
      if (c.kanji) {
        h += kanjiInfo(c) + '<div class="small muted">Aparece no cardápio em:</div><div>' + wordsChips(c.kanji) + '</div>';
      } else {
        if (c.en) h += '<div class="rd small"><i>menu: ' + esc(c.en) + '</i></div>';
        h += priceHtml(c);
        if (c.note) h += '<div class="small muted">' + esc(c.note) + '</div>';
        if (c.chk) h += '<div><span class="badge warn">⚠️ confirme leitura/tradução com o staff</span></div>';
        h += ingChips(c) + kanjiChips(c);
      }
      h += '<button class="btn block" data-act="open" data-id="' + esc(c.id) + '">🔎 Saber mais (vídeo, foto, detalhes)</button>';
    }
    h += '</div>';
    if (s.show) {
      const names = ['Errei', 'Difícil', 'Bom', 'Fácil'];
      h += '<div class="answers">' + names.map((n, g) => '<button class="a' + g + '" data-act="grade" data-g="' + g + '">' + n + '<small>' + ilabel(nextState(st, g).i) + '</small></button>').join('') + '</div>';
    } else h += '<button class="btn primary block" style="margin-top:12px" data-act="reveal">Mostrar resposta</button>';
    return h;
  }
  function grade(g) {
    const s = ui.sess; if (!s || !s.show) return;
    const id = s.queue.shift(), old = S[id];
    if (!old) { if (DAILY.d !== dayNum()) DAILY = { d: dayNum(), n: 0 }; DAILY.n++; }
    S[id] = nextState(old, g);
    LOG[dayNum()] = (LOG[dayNum()] || 0) + 1;
    if (g === 0) s.queue.splice(Math.min(3, s.queue.length), 0, id); else s.done++;
    s.show = false;
    save(); render();
  }

  /* ---------- tela: cardápio ---------- */
  function menuList() {
    const qn = norm(ui.mq.trim());
    let list = cards.filter(c => !c.kanji && (ui.mcat === 'all' || c.cat === ui.mcat) && (!qn || hay(c).includes(qn)));
    if (!list.length) return '<p class="muted">Nada encontrado.</p>';
    let h = '', cur = '';
    list.forEach(c => {
      if (c.cat !== cur) { cur = c.cat; h += '<div class="catH">' + CAT[cur].emoji + ' ' + esc(CAT[cur].name) + '</div>'; }
      h += '<button class="row" data-act="open" data-id="' + esc(c.id) + '"><span class="rj">' + ruby(c.jp) + '<span class="dot ' + status(c) + '"></span></span>' +
        (c.p ? '<span class="rr">' + (c.pf ? '~' : '') + yen(c.p[0]) + '<br>(' + yen(c.p[1]) + ')</span>' : '') +
        '<span class="rp">' + esc(c.pt) + '</span></button>';
    });
    return h;
  }
  function renderMenu() {
    const cats = M.CATS;
    return '<input class="search" id="mq" type="search" placeholder="Buscar: japonês, romaji, português, inglês…" value="' + esc(ui.mq) + '" autocomplete="off">' +
      '<div class="chips"><button data-act="mcat" data-c="all" class="' + (ui.mcat === 'all' ? 'on' : '') + '">Tudo</button>' +
      cats.map(c => '<button data-act="mcat" data-c="' + c.id + '" class="' + (ui.mcat === c.id ? 'on' : '') + '">' + c.emoji + ' ' + esc(c.name) + '</button>').join('') + '</div>' +
      '<div id="mlist">' + menuList() + '</div>';
  }

  /* ---------- tela: kanji ---------- */
  function kanjiGrid() {
    const qn = norm(ui.kq.trim());
    const list = KLIST.filter(k => !qn || norm(k + ' ' + KJ[k].join(' ')).includes(qn));
    if (!list.length) return '<p class="muted">Nada encontrado.</p>';
    return '<div class="kgrid">' + list.map(k => '<button class="kcell" data-act="kanji" data-k="' + k + '"><div class="k">' + k + '</div><div class="m">' + esc(KJ[k][2].split(/[,;(]/)[0]) + '</div></button>').join('') + '</div>';
  }
  function renderKanji() {
    return '<div class="panel"><b>' + KLIST.length + ' kanji</b> que aparecem no cardápio, dos mais frequentes aos mais raros. Toque em um para ver leituras, palavras do menu e ordem dos traços.' +
      '<button class="btn primary block" style="margin-top:10px" data-act="deck" data-f="cat:kanji">Estudar kanji (flashcards)</button></div>' +
      '<input class="search" id="kq" type="search" placeholder="Buscar kanji, leitura ou significado" value="' + esc(ui.kq) + '" autocomplete="off">' +
      '<div id="klist" style="margin-top:10px">' + kanjiGrid() + '</div>';
  }

  /* ---------- tela: quiz ---------- */
  function renderQuiz() {
    const z = ui.quiz;
    if (!z) {
      const opts = [['all', 'Tudo (sem kanji)'], ['kind:food', 'Comidas'], ['kind:drink', 'Bebidas'], ['kind:vocab', 'Vocabulário']].concat(M.CATS.map(c => ['cat:' + c.id, c.emoji + ' ' + c.name])).concat([['cat:kanji', '漢 Kanji']]);
      return '<div class="panel"><h2 style="margin-top:0">Quiz rápido (10 perguntas)</h2>' +
        '<label class="set">Baralho<select id="qf">' + opts.map(o => '<option value="' + o[0] + '"' + (ui.qsel.f === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select></label>' +
        '<label class="set">Tipo<select id="qm">' + [['jp2pt', 'Japonês → significado'], ['pt2jp', 'Significado → japonês'], ['read', 'Kanji → leitura']].map(o => '<option value="' + o[0] + '"' + (ui.qsel.m === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
        '<button class="btn primary block" style="margin-top:12px" data-act="qstart">Começar</button></div>';
    }
    if (z.i >= z.qs.length) {
      return '<div class="panel" style="text-align:center"><h2>Resultado: ' + z.score + ' / ' + z.qs.length + '</h2><p>' + (z.score === z.qs.length ? 'Perfeito! 🎉' : 'Continue revisando no modo Estudar.') + '</p>' +
        (z.wrong.length ? '<div style="text-align:left"><b>Para rever:</b><div>' + z.wrong.map(id => '<button class="chip" data-act="open" data-id="' + esc(id) + '"><b>' + ruby(byId[id].jp, false) + '</b> ' + esc(short(byId[id].pt).split(' (')[0]) + '</button>').join('') + '</div></div>' : '') +
        '<button class="btn primary block" style="margin-top:12px" data-act="qquit">Novo quiz</button></div>';
    }
    const it = z.qs[z.i];
    let h = '<div class="sess-top"><button class="btn sm" data-act="qquit">✕</button><div class="bar"><i style="width:' + Math.round(100 * z.i / z.qs.length) + '%"></i></div><span class="small muted">' + (z.i + 1) + '/' + z.qs.length + '</span></div>';
    h += '<div class="panel"><div class="q">' + it.q + '</div>';
    it.opts.forEach((o, i) => {
      let cls = '';
      if (z.picked !== null) cls = i === it.ans ? ' ok' : (i === z.picked ? ' bad' : '');
      h += '<button class="opt' + cls + '"' + (z.picked === null ? ' data-act="qpick" data-i="' + i + '"' : '') + '>' + esc(o) + '</button>';
    });
    if (z.picked !== null) h += '<button class="btn block" data-act="open" data-id="' + esc(it.id) + '">🔎 Saber mais</button><button class="btn primary block" style="margin-top:8px" data-act="qnext">' + (z.i + 1 >= z.qs.length ? 'Ver resultado' : 'Próxima') + '</button>';
    return h + '</div>';
  }
  function startQuiz(f, m) {
    let pool = cards.filter(filterFn(f)).filter(c => f === 'all' ? !c.kanji : true);
    if (m === 'read') pool = pool.filter(c => c.kanji || /\{/.test(c.jp));
    if (pool.length < 4) { toast('Poucas cartas nesse baralho para esse tipo de quiz.'); return; }
    const ans = c => m === 'jp2pt' ? short(c.pt) : m === 'pt2jp' ? (c.kanji || plain(c.jp)) : cardReading(c);
    const qs = shuffle(pool).slice(0, 10).map(c => {
      const right = ans(c), seen = new Set([right]), ds = [];
      const same = shuffle(pool.filter(x => x.cat === c.cat && x.id !== c.id)).concat(shuffle(pool));
      for (const x of same) { const a = ans(x); if (!seen.has(a)) { seen.add(a); ds.push(a); if (ds.length === 3) break; } }
      const opts = shuffle([right].concat(ds));
      const qh = m === 'pt2jp' ? esc(short(c.pt)) : (c.kanji ? c.kanji : '<span class="jp">' + ruby(c.jp, false) + '</span>');
      return { id: c.id, q: qh, opts, ans: opts.indexOf(right) };
    });
    ui.quiz = { qs, i: 0, score: 0, picked: null, wrong: [] };
    render();
  }

  /* ---------- tela: mais ---------- */
  function renderMore() {
    const chk = cards.filter(c => c.chk);
    const chkH = chk.map(c => '<li><button class="chip" data-act="open" data-id="' + esc(c.id) + '"><b>' + ruby(c.jp, false) + '</b></button> ' + esc(short(c.pt)) + '</li>').join('');
    const ck = (k, label) => '<label class="set">' + label + '<input type="checkbox" data-set="' + k + '"' + (SET[k] ? ' checked' : '') + '></label>';
    const sel = (k, label, opts) => '<label class="set">' + label + '<select data-set="' + k + '">' + opts.map(o => '<option value="' + o[0] + '"' + (String(SET[k]) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>';
    let h = '<div class="panel"><h2 style="margin-top:0">Configurações</h2>' +
      '<label class="set">Cartas novas por dia<input type="number" min="0" max="100" data-set="newPerDay" value="' + SET.newPerDay + '"></label>' +
      sel('dir', 'Direção das cartas', [['jp', 'Japonês → português'], ['pt', 'Português → japonês'], ['mix', 'Misto']]) +
      ck('furiFront', 'Mostrar furigana na frente') + ck('romaji', 'Mostrar romaji') + ck('auto', 'Tocar áudio automaticamente') +
      sel('rate', 'Velocidade da voz', [['0.7', 'Lenta'], ['0.85', 'Normal'], ['1', 'Rápida']]) +
      sel('theme', 'Tema', [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']]) + '</div>';
    h += '<div class="panel"><h2 style="margin-top:0">Progresso</h2><div style="display:grid;gap:8px">' +
      '<button class="btn block" data-act="exportJSON">⬇️ Exportar progresso (.json)</button>' +
      '<button class="btn block" data-act="importJSON">⬆️ Importar progresso</button><input type="file" id="imp" accept="application/json,.json" hidden>' +
      '<button class="btn block" data-act="resetAll">🗑️ Apagar todo o progresso</button></div>' +
      '<p class="small muted">O progresso fica só neste aparelho. Exporte de vez em quando se quiser levar para outro celular.</p></div>';
    h += '<div class="panel"><h2 style="margin-top:0">jpdb.io e kanji</h2>' +
      '<p>Cada item tem um atalho para buscar a palavra no <a href="https://jpdb.io" target="_blank" rel="noopener">jpdb.io</a> e no Jisho. Você também pode exportar as palavras do cardápio e tentar importá-las no jpdb (confira no site quais formatos de importação ele aceita).</p>' +
      '<div style="display:grid;gap:8px"><button class="btn block" data-act="exportTxt">⬇️ Palavras (.txt, uma por linha)</button><button class="btn block" data-act="exportCsv">⬇️ Tudo com leitura e tradução (.csv)</button></div>' +
      '<p class="small muted">Este app não se conecta ao jpdb e não usa nenhuma chave de API.</p></div>';
    h += '<details><summary>🈚 Como estudar kanji (método)</summary><ul class="tight">' +
      '<li><b>Aprenda no contexto:</b> cada kanji aparece aqui dentro de palavras do cardápio — decore a palavra inteira (焼き = やき) e só depois separe o kanji.</li>' +
      '<li><b>Leitura primeiro:</b> no trabalho você precisa <i>ler e ouvir</i>, não desenhar. Use a carta com furigana escondido e tente ler antes de virar.</li>' +
      '<li><b>Frequência:</b> a aba Kanji vem ordenada pelos que mais aparecem (焼, 豚, 牛…). Comece pelos de cima.</li>' +
      '<li><b>Reconheça as partes:</b> muitos kanji de peixe têm 魚 / 鱼 ao lado, de carne 肉; isso ajuda a adivinhar a categoria.</li>' +
      '<li><b>Traços:</b> abra o Jisho pelo botão na página do kanji para ver a ordem dos traços — útil se for escrever comanda à mão.</li>' +
      '<li><b>Pouco por dia:</b> 10–15 cartas novas e revisão diária valem mais que maratona.</li></ul></details>';
    h += '<details><summary>🍱 Cursos e regras da casa</summary>';
    M.COURSES.forEach(co => { h += '<h3>' + esc(co.name) + ' — ' + yen(co.p[0]) + ' (' + yen(co.p[1]) + ')</h3><ul class="tight">' + co.items.map(x => '<li class="jp">' + ruby(x) + '</li>').join('') + '</ul>'; });
    h += '<h3>Regras</h3><ul class="tight">' + M.RULES.map(r => '<li><b>' + esc(r[0]) + ':</b> ' + esc(r[1]) + '</li>').join('') + '</ul></details>';
    if (chk.length) h += '<details><summary>⚠️ Confirmar com o staff (' + chk.length + ')</summary><p class="small muted">Leituras ou traduções que não tenho certeza. Pergunte no primeiro dia.</p><ul class="tight">' + chkH + '</ul></details>';
    h += '<details><summary>📱 Instalar no celular</summary><p>Abra o endereço do site no navegador do celular e use “Adicionar à tela inicial” (iPhone: Compartilhar → Adicionar à Tela de Início; Android/Chrome: menu ⋮ → Instalar app). Depois da primeira visita ele funciona offline; só fotos e resumos da Wikipédia precisam de internet.</p></details>';
    h += '<p class="small muted" style="text-align:center;margin-top:18px">Dados transcritos do cardápio; erros do cardápio original estão anotados nos itens.</p>';
    return h;
  }

  /* ---------- sheet (detalhe) ---------- */
  function sheetHtml(c) {
    let h = '<div class="sheet-top"><button class="btn sm" data-act="back">← Voltar</button><span class="muted small">' + CAT[c.cat].emoji + ' ' + esc(CAT[c.cat].name) + '</span></div>';
    if (c.kanji) {
      h += '<div class="dk">' + c.kanji + '</div>' + kanjiInfo(c) +
        '<h3>Significado</h3><p>' + esc(c.pt) + '</p><div class="rd small muted">' + esc(toRomaji(cardReading(c))) + '</div>' +
        '<button class="btn sm" data-act="say" data-id="' + esc(c.id) + '">🔊 Ouvir</button>' +
        '<h3>No cardápio</h3><div>' + (wordsChips(c.kanji) || '<span class="muted">—</span>') + '</div>' +
        '<h3>Estudar mais</h3><div class="links">' + links(c).map(l => '<a target="_blank" rel="noopener" href="' + esc(l[1]) + '">' + l[0] + '</a>').join('') + '</div>';
    } else {
      h += '<div class="dj jp">' + ruby(c.jp) + '</div><div class="muted">' + esc(toRomaji(reading(c.jp))) + '</div>' +
        '<div style="margin:8px 0"><button class="btn sm" data-act="say" data-id="' + esc(c.id) + '">🔊 Ouvir</button></div>' +
        '<h3>Significado</h3><p>' + esc(c.pt) + '</p>';
      if (c.en) h += '<p class="muted"><i>No menu em inglês: ' + esc(c.en) + '</i></p>';
      h += priceHtml(c);
      if (c.note) h += '<div class="panel small">' + esc(c.note) + '</div>';
      if (c.chk) h += '<p><span class="badge warn">⚠️ confirme leitura/tradução com o staff</span></p>';
      if (c.ing && c.ing.length) h += '<h3>Ingredientes</h3>' + ingChips(c);
      const ks = kanjiOf(plain(c.jp)).filter(k => KJ[k]);
      if (ks.length) h += '<h3>Kanji</h3><div class="tiles">' + ks.map(k => '<button class="tile" data-act="kanji" data-k="' + k + '"><span class="k">' + k + '</span><span class="i">' + esc(KJ[k][0] ? KJ[k][0] : '') + (KJ[k][0] && KJ[k][1] ? ' / ' : '') + esc(KJ[k][1]) + '<br>' + esc(KJ[k][2].split(/[;(]/)[0]) + '</span></button>').join('') + '</div>';
      if (c.isIng && ingUsers[c.key]) h += '<h3>Usado em</h3><div>' + ingUsers[c.key].slice(0, 30).map(id => '<button class="chip" data-act="open" data-id="' + esc(id) + '"><b>' + ruby(byId[id].jp, false) + '</b></button>').join('') + '</div>';
      if (c.w && c.w.length) h += '<h3>Foto e resumo</h3><div class="panel wiki" id="wk"><p class="muted small">Carregando…</p></div>';
      h += '<h3>Vídeos, fotos e dicionários</h3><div class="links">' + links(c).map(l => '<a target="_blank" rel="noopener" href="' + esc(l[1]) + '">' + l[0] + '</a>').join('') + '</div>';
    }
    const st = status(c), s = S[c.id];
    h += '<h3>Seu estudo</h3><div class="panel"><div>' + STXT[st] + (s && s.r > 0 ? ' · intervalo ' + ilabel(s.i) + (s.l ? ' · ' + s.l + ' erro(s)' : '') : '') + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" data-act="known" data-id="' + esc(c.id) + '">✅ Já sei</button>' + (s ? '<button class="btn sm" data-act="reset" data-id="' + esc(c.id) + '">↺ Reiniciar</button>' : '') + '</div></div>';
    return h;
  }
  function drawSheet() {
    const el = $('#sheet');
    if (!stack.length) { el.hidden = true; el.innerHTML = ''; document.body.style.overflow = ''; return; }
    const c = byId[stack[stack.length - 1]];
    el.hidden = false; document.body.style.overflow = 'hidden';
    el.innerHTML = '<div class="in">' + sheetHtml(c) + '</div>';
    el.scrollTop = 0;
    const wk = $('#wk', el);
    if (wk) loadWiki(c, wk);
  }
  function openCard(id) { if (!byId[id]) return; stack.push(id); try { history.pushState({ s: stack.length }, ''); } catch (e) { } drawSheet(); }
  window.addEventListener('popstate', () => { if (stack.length) { stack.pop(); drawSheet(); } });
  function closeAll() { while (stack.length) stack.pop(); drawSheet(); }

  /* ---------- render geral ---------- */
  function applyTheme() { const r = document.documentElement; if (SET.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', SET.theme); }
  function render() {
    document.body.dataset.tab = ui.tab;
    const v = ui.tab === 'study' ? renderStudy() : ui.tab === 'menu' ? renderMenu() : ui.tab === 'kanji' ? renderKanji() : ui.tab === 'quiz' ? renderQuiz() : renderMore();
    $('#view').innerHTML = v;
    $('#statline').textContent = dueCards(cards).length + ' p/ revisar · 🔥 ' + streak();
    if (ui.tab === 'study' && ui.sess && ui.sess.queue.length && SET.auto) {
      const id = ui.sess.queue[0], tag = id + ':' + ui.sess.show;
      if (ui.sess.spoken !== tag) { ui.sess.spoken = tag; if (ui.sess.show || !flipOf(byId[id])) say(sayText(byId[id])); }
    }
  }
  const sayText = c => c.kanji ? cardReading(c) : reading(c.jp);

  /* ---------- exportar / importar ---------- */
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  const csvc = s => '"' + String(s).replace(/"/g, '""') + '"';
  function vocabList(onlyVocab) {
    const seen = new Set(), out = [];
    cards.filter(c => !c.kanji && (!onlyVocab || c.kind === 'vocab')).forEach(c => {
      const p = plain(c.jp);
      if (/[A-Za-z0-9（）()\s]/.test(p) || seen.has(p)) return;
      seen.add(p); out.push(c);
    });
    return out;
  }

  /* ---------- eventos ---------- */
  const ACT = {
    tab(t) { ui.tab = t.dataset.tab; closeAll(); window.scrollTo(0, 0); render(); },
    deck(t) { startSession(t.dataset.f); },
    reveal() { if (ui.sess) { ui.sess.show = true; render(); } },
    grade(t) { grade(+t.dataset.g); },
    quit() { ui.sess = null; render(); },
    say(t) { const c = byId[t.dataset.id]; if (c) say(sayText(c)); },
    open(t) { openCard(t.dataset.id); },
    kanji(t) { openCard('kanji:' + t.dataset.k); },
    back() { try { history.back(); } catch (e) { stack.pop(); drawSheet(); } },
    known(t) { S[t.dataset.id] = { r: 3, i: 60, e: 2.6, l: 0, p: 0, d: dayNum() + 60, k: 1 }; save(); drawSheet(); render(); toast('Marcado como “já sei”.'); },
    reset(t) { delete S[t.dataset.id]; save(); drawSheet(); render(); },
    mcat(t) { ui.mcat = t.dataset.c; render(); },
    qstart() { ui.qsel = { f: $('#qf').value, m: $('#qm').value }; startQuiz(ui.qsel.f, ui.qsel.m); },
    qpick(t) {
      const z = ui.quiz, it = z.qs[z.i]; if (z.picked !== null) return;
      z.picked = +t.dataset.i;
      if (z.picked === it.ans) z.score++; else z.wrong.push(it.id);
      render();
    },
    qnext() { ui.quiz.i++; ui.quiz.picked = null; render(); },
    qquit() { ui.quiz = null; render(); },
    exportJSON() { download('yakiyaki-progresso-' + dateStr() + '.json', JSON.stringify({ v: 1, S, LOG, DAILY, SET }), 'application/json'); },
    importJSON() { $('#imp').click(); },
    resetAll() { if (confirm('Apagar todo o progresso deste aparelho?')) { S = {}; LOG = {}; DAILY = { d: 0, n: 0 }; save(); render(); toast('Progresso apagado.'); } },
    exportTxt() { download('cardapio-palavras.txt', vocabList(true).map(c => plain(c.jp)).join('\n') + '\n', 'text/plain'); },
    exportCsv() {
      const rows = [['japones', 'leitura', 'romaji', 'portugues', 'categoria']].concat(vocabList(false).map(c => [plain(c.jp), reading(c.jp), toRomaji(reading(c.jp)), c.pt, CAT[c.cat].name]));
      download('cardapio-completo.csv', '﻿' + rows.map(r => r.map(csvc).join(',')).join('\n'), 'text/csv');
    }
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act]');
    if (!t || !ACT[t.dataset.act]) return;
    ACT[t.dataset.act](t, e);
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'mq') { ui.mq = e.target.value; $('#mlist').innerHTML = menuList(); }
    else if (e.target.id === 'kq') { ui.kq = e.target.value; $('#klist').innerHTML = kanjiGrid(); }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'imp' && t.files && t.files[0]) {
      const fr = new FileReader();
      fr.onload = () => {
        try {
          const j = JSON.parse(fr.result);
          if (!j || typeof j.S !== 'object') throw new Error('formato');
          S = j.S; LOG = j.LOG || {}; DAILY = j.DAILY || { d: 0, n: 0 }; SET = Object.assign({}, DEF, j.SET || {});
          save(); applyTheme(); render(); toast('Progresso importado.');
        } catch (err) { toast('Arquivo inválido.'); }
      };
      fr.readAsText(t.files[0]); return;
    }
    const k = t.dataset && t.dataset.set; if (!k) return;
    SET[k] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? Math.max(0, Math.min(100, parseInt(t.value, 10) || 0)) : (k === 'rate' ? parseFloat(t.value) : t.value);
    save(); applyTheme();
  });
  document.addEventListener('keydown', e => {
    if (ui.tab !== 'study' || !ui.sess || stack.length || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if ((e.key === ' ' || e.key === 'Enter') && !ui.sess.show && ui.sess.queue.length) { e.preventDefault(); ACT.reveal(); }
    else if (ui.sess.show && '1234'.includes(e.key) && e.key) grade(+e.key - 1);
  });

  /* ---------- início ---------- */
  applyTheme();
  render();
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  }
  window.YM = { cards, byId, toRomaji, ruby, plain, reading, nextState, S: () => S };
})();
