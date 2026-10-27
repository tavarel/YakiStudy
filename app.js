/* 三輪 · Cardápio JP — app de estudo (sem build, sem dependências) */
(function () {
  'use strict';
  const M = window.MENU, KJ = window.KANJI, P = window.PREP || { modules: [], plan: [], day1: [], routines: [], drills: [] };
  const AUD = window.AUDIO || {};
  const VID = M.VIDEOS || {}, CATVID = M.CATVID || {};
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
    'がga ぎgi ぐgu げge ごgo ざza じji ずzu ぜze ぞzo だda ぢji づzu でde どdo ばba びbi ぶbu べbe ぼbo ぱpa ぴpi ぷpu ぺpe ぽpo ゔvu ぁa ぃi ぅu ぇe ぉo'.split(' ').forEach(x => t[x[0]] = x.slice(1));
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
  const DEF = { newPerDay: 15, furiFront: false, romaji: true, dir: 'jp', auto: false, theme: 'auto', rate: 0.85, voice: 'rec', pitch: true, shift: P.shift || '' };
  let S = LS.get('ym.srs', {});
  let LOG = LS.get('ym.log', {});
  let DAILY = LS.get('ym.daily', { d: 0, n: 0 });
  let SET = Object.assign({}, DEF, LS.get('ym.set', {}));
  let PS = Object.assign({ c: {}, r: {}, t: {} }, LS.get('ym.prep', {}));
  const save = () => { LS.set('ym.srs', S); LS.set('ym.log', LOG); LS.set('ym.daily', DAILY); LS.set('ym.set', SET); LS.set('ym.prep', PS); };
  const dayNum = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
  const dateStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const dayOf = iso => { const [y, m, d] = iso.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 864e5); };
  const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const fmtDay = iso => { const [y, m, d] = iso.split('-').map(Number); return WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] + ' ' + String(d).padStart(2, '0') + '/' + String(m).padStart(2, '0'); };

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
  function streak() { let d = dayNum(), n = 0; if (!LOG[d]) d--; while (LOG[d]) { n++; d--; } return n; }
  const dueCards = pool => { const t = dayNum(); return pool.filter(c => S[c.id] && S[c.id].d <= t); };
  function filterFn(key) {
    if (key === 'all') return () => true;
    const [t, v] = key.split(':');
    return t === 'kind' ? c => c.kind === v : c => c.cat === v;
  }

  /* ---------- áudio: gravado (padrão) + voz do aparelho ---------- */
  let actx = null, curSrc = null;
  const abuf = {};
  function ctxGet() {
    try {
      if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); }
      if (actx.state === 'suspended') actx.resume();
      return actx;
    } catch (e) { return null; }
  }
  /* os mp3 ficam em poucos pacotes (audio/p<k>.bin); cada carta guarda k (pacote), o (início) e n (tamanho) */
  const packs = {};
  function loadPack(k) {
    if (!packs[k]) packs[k] = fetch('audio/p' + k + '.bin').then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); }).catch(e => { delete packs[k]; throw e; });
    return packs[k];
  }
  async function playEntry(a) {
    const ctx = ctxGet(), key = a.k + ':' + a.o;
    let b = abuf[key];
    if (!b) {
      const sl = (await loadPack(a.k)).slice(a.o, a.o + a.n);
      if (!ctx) { const u = URL.createObjectURL(new Blob([sl], { type: 'audio/mpeg' })); await new Audio(u).play(); return; }
      b = await new Promise((res, rej) => { const p = ctx.decodeAudioData(sl, res, rej); if (p && p.then) p.then(res, rej); });
      abuf[key] = b;
    }
    try { if (curSrc) curSrc.stop(); } catch (e) { }
    const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); curSrc = s;
  }
  const prefetch = ids => { const ks = new Set(); ids.forEach(id => { const a = AUD[id]; if (a) ks.add(a.k); }); ks.forEach(k => loadPack(k).catch(() => { })); };
  function beep() {
    const ctx = ctxGet(); if (!ctx) return;
    [0, 0.25, 0.5].forEach(t => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.15); });
    try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { }
  }
  let voice = null;
  const jaVoices = () => { try { return speechSynthesis.getVoices().filter(v => /^ja/i.test(v.lang)); } catch (e) { return []; } };
  function pickVoice() { const v = jaVoices(); voice = v.find(x => x.localService) || v[0] || null; }
  if (typeof speechSynthesis !== 'undefined') { pickVoice(); try { speechSynthesis.onvoiceschanged = pickVoice; } catch (e) { } }
  function ttsSay(text) {
    if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') { toast('Este navegador não tem voz sintetizada.'); return; }
    pickVoice();
    if (!voice) toast('Nenhuma voz japonesa no aparelho. Veja Mais → Áudio.');
    const ss = speechSynthesis;
    try { if (ss.speaking || ss.pending) ss.cancel(); ss.resume(); } catch (e) { }
    setTimeout(() => {
      try {
        const u = new SpeechSynthesisUtterance(text.replace(/[〜～〇]/g, ''));
        u.lang = 'ja-JP'; u.rate = SET.rate; if (voice) u.voice = voice;
        window.__ymUtt = u; // evita que o Chrome descarte a fala no meio
        ss.speak(u);
      } catch (e) { toast('Não consegui tocar a voz do aparelho.'); }
    }, 80);
  }
  const sayText = c => c.kanji ? [(c.on || '').split('、')[0], (c.kun || '').split('、')[0].replace(/[.\-]/g, '')].filter(Boolean).join('、') : reading(c.jp);
  function speakCard(c) {
    const a = AUD[c.id];
    if (SET.voice === 'device' || !a) { ttsSay(sayText(c)); return; }
    playEntry(a).catch(() => { toast('Áudio gravado indisponível (offline?) — usando a voz do aparelho.'); ttsSay(sayText(c)); });
  }
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

  /* ---------- pitch accent ---------- */
  function pitchHtml(c, big) {
    const a = AUD[c.id];
    if (!SET.pitch || !a || !a.p) return '';
    const aps = a.p.map(([m, p, acc]) => {
      const ms = m.split('.');
      let s = '<span class="ap">';
      ms.forEach((x, i) => { s += '<span class="pm ' + p[i] + (i > 0 && p[i - 1] !== p[i] ? ' ch' : '') + '">' + esc(x) + '</span>'; });
      if (acc > 0 && acc === ms.length) s += '<span class="pm dn" title="queda depois da última mora"></span>';
      return s + '</span>';
    }).join('');
    return '<div class="pitchbox"><div class="pitch' + (big ? ' big' : '') + '">' + aps + '</div><div class="pitch-src">' + (a.s === 'd' ? 'pitch do dicionário' : 'pitch estimado') + ' · linha de cima = tom alto</div></div>';
  }

  /* ---------- links e vídeos ---------- */
  function links(c) {
    const p = c.kanji ? c.kanji : plain(c.jp);
    const out = [];
    const isFood = c.kind === 'food', isDrink = c.kind === 'drink';
    const en = (c.en || '').replace(/["“”]/g, '');
    if (!c.kanji && (isFood || isDrink || c.isIng)) {
      const jpQ = c.yt || (isFood ? p + ' 作り方' : p + ' とは');
      const ptQ = isFood ? 'como fazer ' + (en || short(c.pt)) : 'o que é ' + (en || short(c.pt));
      out.push(['▶️ Buscar vídeos (japonês)', 'https://www.youtube.com/results?search_query=' + q(jpQ)]);
      out.push(['▶️ Buscar vídeos (português)', 'https://www.youtube.com/results?search_query=' + q(ptQ)]);
      out.push(['🖼️ Fotos', 'https://www.google.com/search?tbm=isch&q=' + q(p + (en ? ' ' + en : '') + (isFood ? ' 料理' : ''))]);
    } else if (c.yt) {
      out.push(['▶️ Buscar vídeos (japonês)', 'https://www.youtube.com/results?search_query=' + q(c.yt)]);
    }
    out.push(['📖 Jisho', 'https://jisho.org/search/' + q(c.kanji ? c.kanji + ' #kanji' : p)]);
    out.push(['🈶 jpdb.io', 'https://jpdb.io/search?q=' + q(p)]);
    return out;
  }
  function vidKeys(c) {
    const ks = (c.vid || []).concat(CATVID[c.cat] || []);
    return ks.filter((k, i) => ks.indexOf(k) === i && VID[k]);
  }
  const vidRow = k => '<a class="vrow" target="_blank" rel="noopener" href="' + esc(VID[k][1]) + '">▶️ ' + esc(VID[k][0]) + '</a>';

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
  const ui = { tab: 'study', sess: null, mcat: 'all', mq: '', kq: '', quiz: null, qsel: { f: 'all', m: 'jp2pt' }, rout: null, timer: null, open: {} };
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
  const shiftDays = () => SET.shift ? dayOf(SET.shift) - dayNum() : null;

  /* ---------- tela: estudar ---------- */
  function renderStudy() {
    if (ui.sess) return renderSession();
    const allDue = dueCards(cards).length, nl = newLeft();
    const unseen = cards.filter(c => !S[c.id]).length;
    const learned = cards.filter(c => S[c.id] && S[c.id].r > 0).length;
    let h = '';
    const sd = shiftDays();
    if (sd !== null && sd >= 0) h += '<button class="banner" data-act="tab" data-tab="prep">🔪 ' + (sd === 0 ? '<b>Hoje é o 1º turno!</b> がんばって！' : '1º turno em <b>' + sd + ' dia' + (sd > 1 ? 's' : '') + '</b> — abrir o plano da cozinha') + ' ›</button>';
    h += '<div class="panel hero"><div class="nums"><div><b>' + allDue + '</b><span class="small muted">para revisar</span></div><div><b>' + Math.min(nl, unseen) + '</b><span class="small muted">novos hoje</span></div><div><b>' + learned + '/' + cards.length + '</b><span class="small muted">vistos</span></div></div>' +
      '<button class="btn primary" data-act="deck" data-f="all">Estudar agora</button></div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="deck" data-f="kind:vocab">📖 Só vocabulário</button><button class="btn sm" data-act="deck" data-f="kind:food">🍽️ Só comidas</button><button class="btn sm" data-act="deck" data-f="kind:drink">🍺 Só bebidas</button></div>';
    h += '<h2>Baralhos</h2>';
    M.CATS.map(c => c.id).concat('kanji').forEach(id => {
      const cs = cards.filter(c => c.cat === id), cat = CAT[id];
      const seen = cs.filter(c => S[c.id] && S[c.id].r > 0).length, due = dueCards(cs).length, nw = cs.filter(c => !S[c.id]).length;
      h += '<button class="deck" data-act="deck" data-f="cat:' + id + '"><span class="em">' + cat.emoji + '</span><span class="nm">' + esc(cat.name) +
        '<div class="bar"><i style="width:' + Math.round(100 * seen / cs.length) + '%"></i></div></span><span class="ct"><b>' + due + '</b> rev · ' + nw + ' novos<br>' + seen + '/' + cs.length + '</span></button>';
    });
    h += '<p class="small muted">Limite de ' + SET.newPerDay + ' cartas novas por dia (muda em “Mais”). “Estudar agora” segue a ordem dos baralhos acima: primeiro frases, cortes e termos de cozinha.</p>';
    return h;
  }
  function startSession(key) {
    const pool = cards.filter(filterFn(key));
    const due = dueCards(pool).sort((a, b) => S[a.id].d - S[b.id].d);
    const nw = pool.filter(c => !S[c.id]).slice(0, newLeft());
    const queue = due.concat(nw).map(c => c.id);
    if (!queue.length) { toast('Nada para estudar aqui agora. Volte amanhã, aumente o limite de novas em Mais ou escolha outro baralho.'); return; }
    ui.tab = 'study'; closeAll();
    ui.sess = { queue, total: queue.length, done: 0, show: false, key, spoken: '' };
    prefetch(queue.slice(0, 20));
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
    h += '<button class="btn sm say" data-act="say" data-id="' + esc(c.id) + '" aria-label="ouvir">🔊</button>';
    if (!flip) { h += jpBlock(c, SET.furiFront || s.show); if (s.show) h += romajiLine(c) + pitchHtml(c); }
    else h += '<div class="ptbig">' + esc(c.pt) + '</div>';
    if (!s.show) h += '<div class="hint">toque para ver a resposta</div>';
    else {
      h += '<hr>';
      if (flip) { h += jpBlock(c, true) + romajiLine(c) + pitchHtml(c); }
      else h += '<div class="ptbig">' + esc(c.pt) + '</div>';
      if (c.kanji) {
        h += kanjiInfo(c) + '<div class="small muted">Aparece em:</div><div>' + wordsChips(c.kanji) + '</div>';
      } else {
        if (c.en) h += '<div class="rd small"><i>menu: ' + esc(c.en) + '</i></div>';
        h += priceHtml(c);
        if (c.note) h += '<div class="small muted">' + esc(c.note) + '</div>';
        if (c.chk) h += '<div><span class="badge warn">⚠️ confirme leitura/tradução com o staff</span></div>';
        h += ingChips(c) + kanjiChips(c);
      }
      const nv = vidKeys(c).length;
      h += '<button class="btn block" data-act="open" data-id="' + esc(c.id) + '">🔎 Saber mais' + (nv ? ' · 🎬 ' + nv + ' vídeo' + (nv > 1 ? 's' : '') : '') + '</button>';
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

  /* ---------- tela: cozinha (preparação) ---------- */
  const chk = (k, label, extra) => '<button class="ck' + (PS.c[k] ? ' on' : '') + '" data-act="pchk" data-k="' + esc(k) + '"><span class="box">' + (PS.c[k] ? '✓' : '') + '</span><span>' + label + '</span></button>' + (extra || '');
  function modProgress(m) {
    const keys = m.videos.map(v => 'v:' + v).concat(m.practice.map(p => 'p:' + p[0]));
    return [keys.filter(k => PS.c[k]).length, keys.length];
  }
  function renderPrep() {
    if (ui.rout) return renderRoutine();
    if (ui.timer) return renderTimer();
    const sd = shiftDays(), today = dateStr();
    let h = '<div class="panel prep-hero">';
    if (sd === null) h += '<b>Defina a data do 1º turno em Mais.</b>';
    else if (sd > 0) h += '<div class="bigday">' + sd + '</div><div>dia' + (sd > 1 ? 's' : '') + ' para o 1º turno<br><span class="muted">' + fmtDay(SET.shift) + '</span></div>';
    else if (sd === 0) h += '<div class="bigday">今日</div><div><b>Hoje é o 1º turno!</b><br>がんばって！ Veja o checklist no fim.</div>';
    else h += '<div><b>O 1º turno já passou.</b><br><span class="muted">Continue usando os módulos e treinos.</span></div>';
    const all = P.modules.map(modProgress).reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
    h += '<div class="prep-pg"><div class="bar"><i style="width:' + (all[1] ? Math.round(100 * all[0] / all[1]) : 0) + '%"></i></div><span class="small muted">' + all[0] + '/' + all[1] + ' itens feitos</span></div></div>';

    h += '<h2>Plano até o dia</h2><div class="plan">';
    P.plan.forEach(d => {
      const cls = d.d === today ? ' today' : (d.d < today ? ' past' : '');
      const done = d.m.every(id => { const m = P.modules.find(x => x.id === id); const pr = m ? modProgress(m) : [0, 0]; return pr[1] && pr[0] === pr[1]; });
      h += '<div class="pday' + cls + '"><div class="pd">' + fmtDay(d.d) + (d.d === today ? ' · <b>hoje</b>' : '') + (done ? ' ✅' : '') + '</div><div class="pt"><b>' + esc(d.t) + '</b><div>' +
        d.m.map(id => { const m = P.modules.find(x => x.id === id); return m ? '<button class="chip" data-act="pmod" data-m="' + id + '">' + m.emoji + ' ' + esc(m.title) + '</button>' : ''; }).join('') + '</div></div></div>';
    });
    if (SET.shift) h += '<div class="pday' + (SET.shift === today ? ' today' : '') + '"><div class="pd">' + fmtDay(SET.shift) + '</div><div class="pt"><b>🎌 1º turno</b><div><button class="chip" data-act="pmod" data-m="day1">✅ Checklist do dia</button></div></div></div>';
    h += '</div><p class="small muted">Dica: até o dia do turno, aumente as cartas novas para 25/dia em Mais e use “📖 Só vocabulário”.</p>';

    h += '<h2>Módulos</h2>';
    const todayMods = (P.plan.find(d => d.d === today) || { m: [] }).m;
    P.modules.forEach(m => {
      const pr = modProgress(m), open = ui.open[m.id] !== undefined ? ui.open[m.id] : todayMods.includes(m.id);
      h += '<details class="mod" id="mod-' + m.id + '" data-mod="' + m.id + '"' + (open ? ' open' : '') + '><summary>' + m.emoji + ' ' + esc(m.title) + ' <span class="muted small">' + pr[0] + '/' + pr[1] + '</span></summary>';
      h += '<p>' + esc(m.why) + '</p>';
      if (m.decks.length) h += '<div class="decks">' + m.decks.filter(d => CAT[d]).map(d => '<button class="btn sm" data-act="deck" data-f="cat:' + d + '">' + CAT[d].emoji + ' Estudar ' + esc(CAT[d].name) + '</button>').join('') + '</div>';
      if (m.videos.length) h += '<h3>🎬 Vídeos</h3>' + m.videos.filter(k => VID[k]).map(k => '<div class="vline">' + chk('v:' + k, '') + '<a target="_blank" rel="noopener" href="' + esc(VID[k][1]) + '">' + esc(VID[k][0]) + ' ↗</a></div>').join('');
      if (m.practice.length) h += '<h3>🏋️ Prática</h3>' + m.practice.map(p => chk('p:' + p[0], esc(p[1]))).join('');
      h += '</details>';
    });

    h += '<h2>Treinos</h2><div class="panel"><b>🧩 Ponha na ordem</b><p class="small muted">Toque nos passos na ordem certa. Bom para o metrô.</p><div class="drills">' +
      P.routines.map(r => '<button class="btn sm" data-act="rout" data-r="' + r.id + '">' + r.emoji + ' ' + esc(r.title) + (PS.r[r.id] !== undefined ? ' · ' + (PS.r[r.id] === 0 ? '⭐' : PS.r[r.id] + ' erro(s)') : '') + '</button>').join('') + '</div></div>';
    h += '<div class="panel"><b>👂 Quiz de ouvido</b><p class="small muted">Ouça e escolha o significado (use fone no metrô).</p><div class="drills">' +
      ['trabalho', 'atendimento', 'cortes', 'verbos', 'utensilios'].map(d => '<button class="btn sm" data-act="listen" data-f="cat:' + d + '">' + CAT[d].emoji + ' ' + esc(CAT[d].name) + '</button>').join('') +
      '<button class="btn sm" data-act="listen" data-f="kind:vocab">📖 Todo o vocabulário</button></div></div>';
    h += '<div class="panel"><b>⏱️ Treino com cronômetro (em casa)</b><div class="drills">' +
      P.drills.map(d => '<button class="btn sm" data-act="tmr" data-d="' + d.id + '">' + esc(d.title) + ' · ' + d.min + ' min' + (PS.t[d.id] ? ' · ✅×' + PS.t[d.id] : '') + '</button>').join('') + '</div></div>';

    const d1open = ui.open.day1 !== undefined ? ui.open.day1 : (sd !== null && sd <= 1);
    h += '<details class="mod" id="mod-day1" data-mod="day1"' + (d1open ? ' open' : '') + '><summary>🎌 Checklist do 1º turno <span class="muted small">' + P.day1.filter(x => PS.c['d:' + x[0]]).length + '/' + P.day1.length + '</span></summary>' +
      P.day1.map(x => chk('d:' + x[0], esc(x[1]))).join('') + '</details>';
    h += '<p class="small muted">Os vídeos foram escolhidos pelo título e pelo canal. Se algum não ajudar, use “Buscar vídeos” na página de cada item. Rotinas e passos são gerais: no trabalho, siga sempre o jeito da casa.</p>';
    return h;
  }
  function renderRoutine() {
    const z = ui.rout, r = P.routines.find(x => x.id === z.id);
    let h = '<div class="sess-top"><button class="btn sm" data-act="rquit">✕</button><div class="bar"><i style="width:' + Math.round(100 * z.done.length / r.steps.length) + '%"></i></div><span class="small muted">' + z.done.length + '/' + r.steps.length + '</span></div>';
    h += '<div class="panel"><h2 style="margin-top:0">' + r.emoji + ' ' + esc(r.title) + '</h2><p class="small muted">' + esc(r.note) + '</p>';
    h += '<ol class="seq">' + z.done.map(i => '<li><b>' + esc(r.steps[i][0]) + '</b><br><span class="jp small muted">' + esc(r.steps[i][1]) + '</span></li>').join('') + '</ol>';
    if (z.done.length < r.steps.length) {
      h += '<p class="small"><b>Qual é o passo ' + (z.done.length + 1) + '?</b></p>';
      h += z.order.filter(i => !z.done.includes(i)).map(i => '<button class="opt' + (z.flash === i ? ' bad' : '') + '" data-act="rpick" data-i="' + i + '">' + esc(r.steps[i][0]) + '</button>').join('');
    } else {
      h += '<p><b>' + (z.err === 0 ? '⭐ Perfeito, sem erros!' : 'Concluído com ' + z.err + ' erro(s).') + '</b></p>' +
        '<button class="btn primary block" data-act="rout" data-r="' + r.id + '">De novo</button><button class="btn block" style="margin-top:8px" data-act="rquit">Voltar</button>';
    }
    return h + '</div>';
  }
  let tmrInt = null;
  const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function tmrLeft() { const z = ui.timer; return z.running ? Math.max(0, (z.end - Date.now()) / 1000) : z.left; }
  function renderTimer() {
    const z = ui.timer, d = P.drills.find(x => x.id === z.id);
    return '<div class="sess-top"><button class="btn sm" data-act="tquit">✕</button><span class="small muted">' + esc(d.title) + '</span></div>' +
      '<div class="panel" style="text-align:center"><div class="timer" id="tmr">' + mmss(Math.ceil(tmrLeft())) + '</div><p class="small muted">' + esc(d.tip) + '</p>' +
      '<div class="drills" style="justify-content:center">' + (z.running ? '<button class="btn primary" data-act="tpause">⏸ Pausar</button>' : '<button class="btn primary" data-act="tstart">▶ ' + (z.left < d.min * 60 ? 'Continuar' : 'Começar') + '</button>') +
      '<button class="btn" data-act="treset">↺ Zerar</button><button class="btn" data-act="tdone">✅ Concluí</button></div>' +
      '<p class="small muted">Feito ' + (PS.t[z.id] || 0) + ' vez(es).</p></div>';
  }
  function tick() {
    if (!ui.timer || !ui.timer.running) { clearInterval(tmrInt); tmrInt = null; return; }
    const left = tmrLeft(), el = $('#tmr');
    if (el) el.textContent = mmss(Math.ceil(left));
    if (left <= 0) { ui.timer.running = false; ui.timer.left = 0; PS.t[ui.timer.id] = (PS.t[ui.timer.id] || 0) + 1; save(); beep(); toast('Tempo! Treino registrado ✅'); render(); }
  }

  /* ---------- tela: cardápio ---------- */
  function menuList() {
    const qn = norm(ui.mq.trim());
    const list = cards.filter(c => !c.kanji && (ui.mcat === 'all' || c.cat === ui.mcat) && (!qn || hay(c).includes(qn)));
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
    return '<input class="search" id="mq" type="search" placeholder="Buscar: japonês, romaji, português, inglês…" value="' + esc(ui.mq) + '" autocomplete="off">' +
      '<div class="chips"><button data-act="mcat" data-c="all" class="' + (ui.mcat === 'all' ? 'on' : '') + '">Tudo</button>' +
      M.CATS.map(c => '<button data-act="mcat" data-c="' + c.id + '" class="' + (ui.mcat === c.id ? 'on' : '') + '">' + c.emoji + ' ' + esc(c.name) + '</button>').join('') + '</div>' +
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
    return '<div class="panel"><b>' + KLIST.length + ' kanji</b> do cardápio e da cozinha, dos mais frequentes aos mais raros. Toque em um para ver leituras, palavras e ordem dos traços.' +
      '<button class="btn primary block" style="margin-top:10px" data-act="deck" data-f="cat:kanji">Estudar kanji (flashcards)</button></div>' +
      '<input class="search" id="kq" type="search" placeholder="Buscar kanji, leitura ou significado" value="' + esc(ui.kq) + '" autocomplete="off">' +
      '<div id="klist" style="margin-top:10px">' + kanjiGrid() + '</div>';
  }

  /* ---------- tela: quiz ---------- */
  const QMODES = [['jp2pt', 'Japonês → significado'], ['pt2jp', 'Significado → japonês'], ['read', 'Kanji → leitura'], ['listen', '👂 Ouvir → significado']];
  function renderQuiz() {
    const z = ui.quiz;
    if (!z) {
      const opts = [['all', 'Tudo (sem kanji)'], ['kind:vocab', 'Vocabulário'], ['kind:food', 'Comidas'], ['kind:drink', 'Bebidas']].concat(M.CATS.map(c => ['cat:' + c.id, c.emoji + ' ' + c.name])).concat([['cat:kanji', '漢 Kanji']]);
      return '<div class="panel"><h2 style="margin-top:0">Quiz rápido (10 perguntas)</h2>' +
        '<label class="set">Baralho<select id="qf">' + opts.map(o => '<option value="' + o[0] + '"' + (ui.qsel.f === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select></label>' +
        '<label class="set">Tipo<select id="qm">' + QMODES.map(o => '<option value="' + o[0] + '"' + (ui.qsel.m === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
        '<button class="btn primary block" style="margin-top:12px" data-act="qstart">Começar</button></div>';
    }
    if (z.i >= z.qs.length) {
      return '<div class="panel" style="text-align:center"><h2>Resultado: ' + z.score + ' / ' + z.qs.length + '</h2><p>' + (z.score === z.qs.length ? 'Perfeito! 🎉' : 'Continue revisando no modo Estudar.') + '</p>' +
        (z.wrong.length ? '<div style="text-align:left"><b>Para rever:</b><div>' + z.wrong.map(id => '<button class="chip" data-act="open" data-id="' + esc(id) + '"><b>' + ruby(byId[id].jp, false) + '</b> ' + esc(short(byId[id].pt).split(' (')[0]) + '</button>').join('') + '</div></div>' : '') +
        '<button class="btn primary block" style="margin-top:12px" data-act="qquit">Novo quiz</button></div>';
    }
    const it = z.qs[z.i], c = byId[it.id];
    let h = '<div class="sess-top"><button class="btn sm" data-act="qquit">✕</button><div class="bar"><i style="width:' + Math.round(100 * z.i / z.qs.length) + '%"></i></div><span class="small muted">' + (z.i + 1) + '/' + z.qs.length + '</span></div>';
    h += '<div class="panel"><div class="q">' + it.q + '</div>';
    if (z.picked !== null && z.mode === 'listen') h += '<div class="big jp" style="text-align:center;font-size:1.6rem">' + ruby(c.jp) + '</div>' + pitchHtml(c);
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
    if (m === 'listen') pool = pool.filter(c => !c.kanji);
    if (pool.length < 4) { toast('Poucas cartas nesse baralho para esse tipo de quiz.'); return false; }
    const ans = c => (m === 'jp2pt' || m === 'listen') ? short(c.pt) : m === 'pt2jp' ? (c.kanji || plain(c.jp)) : cardReading(c);
    const qs = shuffle(pool).slice(0, 10).map(c => {
      const right = ans(c), seen = new Set([right]), ds = [];
      const same = shuffle(pool.filter(x => x.cat === c.cat && x.id !== c.id)).concat(shuffle(pool));
      for (const x of same) { const a = ans(x); if (!seen.has(a)) { seen.add(a); ds.push(a); if (ds.length === 3) break; } }
      const opts = shuffle([right].concat(ds));
      const qh = m === 'listen' ? '<button class="btn primary" data-act="qplay">🔊 Ouvir de novo</button>' :
        m === 'pt2jp' ? esc(short(c.pt)) : (c.kanji ? c.kanji : '<span class="jp">' + ruby(c.jp, false) + '</span>');
      return { id: c.id, q: qh, opts, ans: opts.indexOf(right) };
    });
    ui.quiz = { qs, i: 0, score: 0, picked: null, wrong: [], mode: m };
    render();
    if (m === 'listen') { prefetch(qs.map(x => x.id)); speakCard(byId[qs[0].id]); }
    return true;
  }

  /* ---------- tela: mais ---------- */
  function renderMore() {
    const chkc = cards.filter(c => c.chk);
    const ck = (k, label) => '<label class="set">' + label + '<input type="checkbox" data-set="' + k + '"' + (SET[k] ? ' checked' : '') + '></label>';
    const sel = (k, label, opts) => '<label class="set">' + label + '<select data-set="' + k + '">' + opts.map(o => '<option value="' + o[0] + '"' + (String(SET[k]) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>';
    let h = '<div class="panel"><h2 style="margin-top:0">Configurações</h2>' +
      '<label class="set">Cartas novas por dia<input type="number" min="0" max="100" data-set="newPerDay" value="' + SET.newPerDay + '"></label>' +
      sel('dir', 'Direção das cartas', [['jp', 'Japonês → português'], ['pt', 'Português → japonês'], ['mix', 'Misto']]) +
      ck('furiFront', 'Mostrar furigana na frente') + ck('romaji', 'Mostrar romaji') + ck('pitch', 'Mostrar pitch accent') + ck('auto', 'Tocar áudio automaticamente') +
      sel('theme', 'Tema', [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']]) +
      '<label class="set">Data do 1º turno<input type="date" data-set="shift" value="' + esc(SET.shift) + '"></label></div>';
    const jv = jaVoices();
    h += '<div class="panel" id="audiop"><h2 style="margin-top:0">🔊 Áudio</h2>' +
      sel('voice', 'Fonte da voz', [['rec', 'Áudio gravado (recomendado)'], ['device', 'Voz do aparelho']]) +
      sel('rate', 'Velocidade (voz do aparelho)', [['0.7', 'Lenta'], ['0.85', 'Normal'], ['1', 'Rápida']]) +
      '<div class="drills" style="margin-top:8px"><button class="btn sm" data-act="testRec">▶️ Testar áudio gravado</button><button class="btn sm" data-act="testDev">▶️ Testar voz do aparelho</button><button class="btn sm" data-act="dlAudio">⬇️ Baixar áudios p/ offline</button></div>' +
      '<p class="small muted" id="dlst"></p>' +
      '<ul class="tight small"><li>Áudio gravado: ' + Object.keys(AUD).length + ' cartas, funciona em qualquer celular.</li>' +
      '<li>Vozes japonesas do aparelho: ' + (jv.length ? esc(jv.map(v => v.name).join(', ')) : '<b>nenhuma encontrada</b>') + '.</li>' +
      '<li>Sem som? Suba o volume de <b>mídia</b> (não o de toque) e tire o celular do modo silencioso.</li>' +
      '<li>Para usar a voz do aparelho no Android: em Configurações, procure “Conversão de texto em voz” (ou “Texto para fala”), escolha o mecanismo do Google e instale o idioma japonês.</li></ul>' +
      '<p class="small muted">Pitch accent (padrão de Tóquio): “do dicionário” vem do kanjium; “estimado” é calculado pelo OpenJTalk e pode errar em nomes, palavras estrangeiras e frases longas. Linha em cima = tom alto; embaixo = tom baixo; o traço vertical marca a subida ou a queda.</p></div>';
    h += '<div class="panel"><h2 style="margin-top:0">Progresso</h2><div style="display:grid;gap:8px">' +
      '<button class="btn block" data-act="exportJSON">⬇️ Exportar progresso (.json)</button>' +
      '<button class="btn block" data-act="importJSON">⬆️ Importar progresso</button><input type="file" id="imp" accept="application/json,.json" hidden>' +
      '<button class="btn block" data-act="resetAll">🗑️ Apagar todo o progresso</button></div>' +
      '<p class="small muted">O progresso fica só neste aparelho. Exporte de vez em quando se quiser levar para outro celular.</p></div>';
    h += '<div class="panel"><h2 style="margin-top:0">jpdb.io e kanji</h2>' +
      '<p>Cada item tem um atalho para buscar a palavra no <a href="https://jpdb.io" target="_blank" rel="noopener">jpdb.io</a> e no Jisho. Você também pode exportar as palavras e tentar importá-las no jpdb (confira no site os formatos aceitos).</p>' +
      '<div style="display:grid;gap:8px"><button class="btn block" data-act="exportTxt">⬇️ Palavras (.txt, uma por linha)</button><button class="btn block" data-act="exportCsv">⬇️ Tudo com leitura e tradução (.csv)</button></div>' +
      '<p class="small muted">Este app não se conecta ao jpdb e não usa nenhuma chave de API.</p></div>';
    h += '<details><summary>🈚 Como estudar kanji (método)</summary><ul class="tight">' +
      '<li><b>Aprenda no contexto:</b> decore a palavra inteira (焼き = やき) e só depois separe o kanji.</li>' +
      '<li><b>Leitura primeiro:</b> no trabalho você precisa ler e ouvir, não desenhar. Tente ler antes de virar a carta.</li>' +
      '<li><b>Frequência:</b> a aba Kanji vem ordenada pelos mais frequentes. Comece pelos de cima.</li>' +
      '<li><b>Partes:</b> muitos kanji de peixe têm 魚 ao lado, de carne 肉; isso ajuda a adivinhar.</li>' +
      '<li><b>Traços:</b> o Jisho mostra a ordem dos traços (botão na página do kanji).</li>' +
      '<li><b>Pouco por dia:</b> 10–25 cartas novas e revisão diária valem mais que maratona.</li></ul></details>';
    h += '<details><summary>🍱 Cursos e regras da casa</summary>';
    M.COURSES.forEach(co => { h += '<h3>' + esc(co.name) + ' — ' + yen(co.p[0]) + ' (' + yen(co.p[1]) + ')</h3><ul class="tight">' + co.items.map(x => '<li class="jp">' + ruby(x) + '</li>').join('') + '</ul>'; });
    h += '<h3>Regras</h3><ul class="tight">' + M.RULES.map(r => '<li><b>' + esc(r[0]) + ':</b> ' + esc(r[1]) + '</li>').join('') + '</ul></details>';
    if (chkc.length) h += '<details><summary>⚠️ Confirmar com o staff (' + chkc.length + ')</summary><p class="small muted">Leituras ou traduções que não tenho certeza. Pergunte no primeiro dia.</p><ul class="tight">' +
      chkc.map(c => '<li><button class="chip" data-act="open" data-id="' + esc(c.id) + '"><b>' + ruby(c.jp, false) + '</b></button> ' + esc(short(c.pt)) + '</li>').join('') + '</ul></details>';
    h += '<details><summary>📱 Instalar no celular</summary><p>Abra o site no navegador do celular e use “Adicionar à tela inicial” (Android/Chrome: menu ⋮ → Instalar app; iPhone: Compartilhar → Adicionar à Tela de Início). Depois da primeira visita o app funciona offline; para ter todos os áudios offline, toque em “Baixar áudios”.</p></details>';
    h += '<details><summary>ℹ️ Créditos</summary><ul class="tight small"><li>Voz: HTS voice tohoku-f01, Tohoku University (CC BY 4.0), sintetizada com Open JTalk.</li><li>Pitch do dicionário: kanjium (CC BY-SA 4.0).</li><li>Fotos e resumos: Wikipédia.</li><li>Cardápio transcrito das fotos; erros do original estão anotados nos itens.</li></ul></details>';
    return h;
  }

  /* ---------- sheet (detalhe) ---------- */
  function sheetHtml(c) {
    let h = '<div class="sheet-top"><button class="btn sm" data-act="back">← Voltar</button><span class="muted small">' + CAT[c.cat].emoji + ' ' + esc(CAT[c.cat].name) + '</span></div>';
    if (c.kanji) {
      h += '<div class="dk">' + c.kanji + '</div>' + kanjiInfo(c) +
        '<h3>Significado</h3><p>' + esc(c.pt) + '</p><div class="rd small muted">' + esc(toRomaji(sayText(c))) + '</div>' +
        '<button class="btn sm" data-act="say" data-id="' + esc(c.id) + '">🔊 Ouvir</button>' +
        '<h3>Onde aparece</h3><div>' + (wordsChips(c.kanji) || '<span class="muted">—</span>') + '</div>' +
        '<h3>Estudar mais</h3><div class="links">' + links(c).map(l => '<a target="_blank" rel="noopener" href="' + esc(l[1]) + '">' + l[0] + '</a>').join('') + '</div>';
    } else {
      h += '<div class="dj jp">' + ruby(c.jp) + '</div><div class="muted">' + esc(toRomaji(reading(c.jp))) + '</div>' + pitchHtml(c, true) +
        '<div style="margin:8px 0"><button class="btn sm" data-act="say" data-id="' + esc(c.id) + '">🔊 Ouvir</button></div>' +
        '<h3>Significado</h3><p>' + esc(c.pt) + '</p>';
      if (c.en) h += '<p class="muted"><i>No menu em inglês: ' + esc(c.en) + '</i></p>';
      h += priceHtml(c);
      if (c.note) h += '<div class="panel small">' + esc(c.note) + '</div>';
      if (c.chk) h += '<p><span class="badge warn">⚠️ confirme leitura/tradução com o staff</span></p>';
      if (c.ing && c.ing.length) h += '<h3>Ingredientes</h3>' + ingChips(c);
      const ks = kanjiOf(plain(c.jp)).filter(k => KJ[k]);
      if (ks.length) h += '<h3>Kanji</h3><div class="tiles">' + ks.map(k => '<button class="tile" data-act="kanji" data-k="' + k + '"><span class="k">' + k + '</span><span class="i">' + esc(KJ[k][0] || '') + (KJ[k][0] && KJ[k][1] ? ' / ' : '') + esc(KJ[k][1]) + '<br>' + esc(KJ[k][2].split(/[;(]/)[0]) + '</span></button>').join('') + '</div>';
      if (c.isIng && ingUsers[c.key]) h += '<h3>Usado em</h3><div>' + ingUsers[c.key].slice(0, 30).map(id => '<button class="chip" data-act="open" data-id="' + esc(id) + '"><b>' + ruby(byId[id].jp, false) + '</b></button>').join('') + '</div>';
      const vk = vidKeys(c);
      if (vk.length) h += '<h3>🎬 Vídeos recomendados</h3><div class="vlist">' + vk.map(vidRow).join('') + '</div>';
      if (c.w && c.w.length) h += '<h3>Foto e resumo</h3><div class="panel wiki" id="wk"><p class="muted small">Carregando…</p></div>';
      h += '<h3>Buscar mais</h3><div class="links">' + links(c).map(l => '<a target="_blank" rel="noopener" href="' + esc(l[1]) + '">' + l[0] + '</a>').join('') + '</div>';
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
    const v = ui.tab === 'study' ? renderStudy() : ui.tab === 'prep' ? renderPrep() : ui.tab === 'menu' ? renderMenu() : ui.tab === 'kanji' ? renderKanji() : ui.tab === 'quiz' ? renderQuiz() : renderMore();
    $('#view').innerHTML = v;
    $('#statline').textContent = dueCards(cards).length + ' p/ revisar · 🔥 ' + streak();
    if (ui.tab === 'study' && ui.sess && ui.sess.queue.length && SET.auto) {
      const id = ui.sess.queue[0], tag = id + ':' + ui.sess.show;
      if (ui.sess.spoken !== tag) { ui.sess.spoken = tag; if (ui.sess.show || !flipOf(byId[id])) speakCard(byId[id]); }
    }
  }

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
      if (/[A-Za-z0-9（）()\s、〜]/.test(p) || seen.has(p)) return;
      seen.add(p); out.push(c);
    });
    return out;
  }

  /* ---------- eventos ---------- */
  const ACT = {
    tab(t) { ui.tab = t.dataset.tab; closeAll(); window.scrollTo(0, 0); render(); },
    deck(t) { startSession(t.dataset.f); window.scrollTo(0, 0); },
    reveal() { if (ui.sess) { ui.sess.show = true; render(); } },
    grade(t) { grade(+t.dataset.g); },
    quit() { ui.sess = null; render(); },
    say(t) { const c = byId[t.dataset.id]; if (c) speakCard(c); },
    open(t) { openCard(t.dataset.id); },
    kanji(t) { openCard('kanji:' + t.dataset.k); },
    back() { try { history.back(); } catch (e) { stack.pop(); drawSheet(); } },
    known(t) { S[t.dataset.id] = { r: 3, i: 60, e: 2.6, l: 0, p: 0, d: dayNum() + 60, k: 1 }; save(); drawSheet(); render(); toast('Marcado como “já sei”.'); },
    reset(t) { delete S[t.dataset.id]; save(); drawSheet(); render(); },
    mcat(t) { ui.mcat = t.dataset.c; render(); },
    qstart() { ui.qsel = { f: $('#qf').value, m: $('#qm').value }; startQuiz(ui.qsel.f, ui.qsel.m); },
    qplay() { const z = ui.quiz; if (z && z.qs[z.i]) speakCard(byId[z.qs[z.i].id]); },
    qpick(t) {
      const z = ui.quiz, it = z.qs[z.i]; if (z.picked !== null) return;
      z.picked = +t.dataset.i;
      if (z.picked === it.ans) z.score++; else z.wrong.push(it.id);
      render();
    },
    qnext() { const z = ui.quiz; z.i++; z.picked = null; render(); if (z.mode === 'listen' && z.qs[z.i]) speakCard(byId[z.qs[z.i].id]); },
    qquit() { ui.quiz = null; render(); },
    listen(t) { ui.tab = 'quiz'; ui.qsel = { f: t.dataset.f, m: 'listen' }; window.scrollTo(0, 0); if (!startQuiz(t.dataset.f, 'listen')) render(); },
    pchk(t) { const k = t.dataset.k; if (PS.c[k]) delete PS.c[k]; else PS.c[k] = dateStr(); save(); render(); },
    pmod(t) {
      const id = t.dataset.m; ui.open[id] = true; render();
      const el = document.getElementById('mod-' + id); if (el) { el.open = true; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    },
    rout(t) { const r = P.routines.find(x => x.id === t.dataset.r); let order = shuffle(r.steps.map((_, i) => i)); if (order.every((v, i) => v === i)) order = order.reverse(); ui.rout = { id: r.id, order, done: [], err: 0, flash: null }; window.scrollTo(0, 0); render(); },
    rpick(t) {
      const z = ui.rout, r = P.routines.find(x => x.id === z.id), i = +t.dataset.i;
      if (i === z.done.length) { z.done.push(i); z.flash = null; } else { z.err++; z.flash = i; try { navigator.vibrate && navigator.vibrate(80); } catch (e) { } }
      if (z.done.length === r.steps.length) { PS.r[z.id] = PS.r[z.id] === undefined ? z.err : Math.min(PS.r[z.id], z.err); save(); }
      render();
    },
    rquit() { ui.rout = null; render(); },
    tmr(t) { const d = P.drills.find(x => x.id === t.dataset.d); ui.timer = { id: d.id, left: d.min * 60, running: false, end: 0 }; window.scrollTo(0, 0); render(); },
    tstart() { const z = ui.timer; ctxGet(); z.end = Date.now() + z.left * 1000; z.running = true; render(); if (!tmrInt) tmrInt = setInterval(tick, 250); },
    tpause() { const z = ui.timer; z.left = tmrLeft(); z.running = false; render(); },
    treset() { const z = ui.timer, d = P.drills.find(x => x.id === z.id); z.running = false; z.left = d.min * 60; render(); },
    tdone() { const z = ui.timer; z.running = false; PS.t[z.id] = (PS.t[z.id] || 0) + 1; save(); toast('Treino registrado ✅'); ui.timer = null; render(); },
    tquit() { if (ui.timer) ui.timer.running = false; ui.timer = null; render(); },
    testRec() {
      const id = Object.keys(AUD).find(k => k.startsWith('atendimento:')) || Object.keys(AUD)[0];
      if (!id) { toast('Nenhum áudio gravado encontrado (pasta audio/ não publicada?).'); return; }
      playEntry(AUD[id]).then(() => toast('Tocando: ' + plain(byId[id] ? byId[id].jp : id))).catch(e => toast('Falhou: ' + e.message + '. A pasta audio/ foi enviada ao GitHub?'));
    },
    testDev() { ttsSay('いらっしゃいませ'); const n = jaVoices().length; if (n) toast('Vozes japonesas: ' + n); },
    async dlAudio() {
      const n = window.AUDIO_PACKS || 0, el = $('#dlst'); let ok = 0, bad = 0;
      for (let k = 0; k < n; k++) {
        try { await loadPack(k); ok++; } catch (e) { bad++; }
        if (el && el.isConnected) el.textContent = 'Baixando… ' + (ok + bad) + '/' + n + ' pacotes';
      }
      if (el && el.isConnected) el.textContent = bad ? ok + ' pacotes baixados, ' + bad + ' falharam (sem internet?).' : 'Pronto: todos os áudios disponíveis offline.';
    },
    exportJSON() { download('yakiyaki-progresso-' + dateStr() + '.json', JSON.stringify({ v: 2, S, LOG, DAILY, SET, PS }), 'application/json'); },
    importJSON() { $('#imp').click(); },
    resetAll() { if (confirm('Apagar todo o progresso deste aparelho?')) { S = {}; LOG = {}; DAILY = { d: 0, n: 0 }; PS = { c: {}, r: {}, t: {} }; save(); render(); toast('Progresso apagado.'); } },
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
  document.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.mod) ui.open[d.dataset.mod] = d.open; }, true);
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
          S = j.S; LOG = j.LOG || {}; DAILY = j.DAILY || { d: 0, n: 0 }; SET = Object.assign({}, DEF, j.SET || {}); PS = Object.assign({ c: {}, r: {}, t: {} }, j.PS || {});
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
  window.YM = { cards, byId, toRomaji, ruby, plain, reading, nextState, S: () => S, AUD };
})();
