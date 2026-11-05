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
  const DEF = { newPerDay: 15, furiFront: false, romaji: true, dir: 'jp', auto: false, theme: 'auto', rate: 0.85, voice: 'rec', pitch: true, shift: P.shift || '', posText: false, drinkQuiz: false, posSeat: 'mix', posPeople: 'auto', posItems: 'pair' };
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
  CAT.cond = { id: 'cond', name: 'Molhos: o pratinho de cada prato', emoji: '🥢', kind: 'cond' };
  const cards = [], byId = {};
  const add = c => { c.kind = CAT[c.cat].kind; cards.push(c); byId[c.id] = c; };
  M.CATS.forEach(cat => {
    if (cat.id === 'ingredientes') {
      Object.keys(M.ING).forEach(key => { const g = M.ING[key]; add({ id: 'ing:' + key, cat: 'ingredientes', key, jp: g[0], pt: g[1], w: g[2] || [], isIng: true }); });
    } else {
      M.ITEMS.filter(it => it.cat === cat.id).forEach(it => add(Object.assign({ id: it.cat + ':' + plain(it.jp), w: [] }, it)));
    }
  });
  // uma carta por prato da seção Molhos: frente = o prato, verso = o pratinho montado
  if (window.COND) window.COND.rules.filter(r => r.drill !== false).forEach(r => add({ id: 'cond:' + r.id, cat: 'cond', jp: r.rb || r.name, pt: r.pt, cond: r.id, w: [] }));
  const kcount = {}, kwords = {}, ingUsers = {};
  cards.forEach(c => {
    if (c.cond) return;
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
    if (c.cond) { const r = window.COND.rules.find(x => x.id === c.cond); posSpeak([r.name]); return; }
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
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="tab" data-tab="quiz">❓ Quiz</button><button class="btn sm" data-act="tab" data-tab="kanji">漢 Kanji</button><button class="btn sm" data-act="deck" data-f="kind:vocab">📖 Só vocabulário</button><button class="btn sm" data-act="deck" data-f="kind:food">🍽️ Só comidas</button><button class="btn sm" data-act="deck" data-f="kind:drink">🍺 Só bebidas</button></div>';
    h += '<h2>Baralhos</h2>';
    M.CATS.map(c => c.id).concat(cards.some(c => c.cond) ? ['cond'] : [], 'kanji').forEach(id => {
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
    if (c.cond) {
      const r = CD.rules.find(x => x.id === c.cond);
      h += '<div class="small muted">Qual pratinho, e o que vai nele?</div><div class="big jp">' + ruby(c.jp, true) + '</div><div class="small muted">' + esc(c.pt) + '</div>';
      if (!s.show) h += '<div class="hint">pense na resposta e toque para conferir</div>';
      else h += '<hr>' + condAnswer(r);
      h += '</div>';
      if (s.show) { const names = ['Errei', 'Difícil', 'Bom', 'Fácil']; h += '<div class="answers">' + names.map((n, g) => '<button class="a' + g + '" data-act="grade" data-g="' + g + '">' + n + '<small>' + ilabel(nextState(st, g).i) + '</small></button>').join('') + '</div>'; }
      else h += '<button class="btn primary block" style="margin-top:12px" data-act="reveal">Mostrar resposta</button>';
      return h;
    }
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
    const list = cards.filter(c => !c.kanji && !c.cond && (ui.mcat === 'all' || c.cat === ui.mcat) && (!qn || hay(c).includes(qn)));
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
    let pool = cards.filter(filterFn(f)).filter(c => !c.cond && (f === 'all' ? !c.kanji : true));
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

  /* ---------- simulador do caixa ---------- */
  const PO = window.POS || null, PA = window.POS_AUDIO || {}, DR = window.DRINKS || null;
  const POSI = [], POSK = {};
  if (PO) PO.cats.forEach((c, ci) => c.items.forEach((it, ii) => {
    const f = it[2] || '0';
    const x = { ci, ii, key: ci + ':' + ii, l: it[0], p: it[1], s: it[3] || it[0], k: it[4] || '', pt: it[5] || '', lv: +f[0] || 0,
      red: f.includes('r'), g: f.includes('g34') ? 34 : f.includes('g2') ? 2 : 0, course: f.includes('c'), otoshi: f.includes('o'), to: f.includes('t'), uber: f.includes('u') };
    POSI.push(x); POSK[x.key] = x;
  }));
  const OTOSHI = POSI.find(x => x.otoshi);
  const DRINK_CATS = ['ビール', 'ウィスキー', 'サワー', 'カクテル', 'ソフドリ', '日本酒、焼酎、ワイン'];
  const isDrink = x => DRINK_CATS.includes(PO.cats[x.ci].name);
  const rint = n => Math.floor(Math.random() * n);
  const pick = a => a[rint(a.length)];
  const NOT_FOOD = ['DESSERT', 'SET MENU', 'ボトル白', 'ボトル赤', '泡', 'その他', '紐付け触らない', 'ウーバー、ロケットナウ'];
  const isFood = x => !isDrink(x) && !NOT_FOOD.includes(PO.cats[x.ci].name);
  const POP = (PO && PO.pop) || {};
  const wpick = arr => { let r = Math.random() * arr.reduce((a, x) => a + (POP[x.s] || 1), 0); for (const x of arr) { r -= POP[x.s] || 1; if (r <= 0) return x; } return arr[arr.length - 1]; };
  const wchoice = pairs => { let r = Math.random() * pairs.reduce((a, p) => a + p[1], 0); for (const p of pairs) { r -= p[1]; if (r <= 0) return p[0]; } return pairs[0][0]; };

  let posBuf = null, posSrcs = [];
  const posDec = {};
  function posPack() {
    if (!posBuf) posBuf = fetch('audio/pos.bin').then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); }).catch(e => { posBuf = null; throw e; });
    return posBuf;
  }
  async function posClip(text) {
    const a = PA[text], ctx = ctxGet();
    if (!a || !ctx) throw new Error('sem clipe');
    if (posDec[text]) return posDec[text];
    const ab = (await posPack()).slice(a[0], a[0] + a[1]);
    const b = await new Promise((res, rej) => { const p = ctx.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); });
    posDec[text] = b; return b;
  }
  async function posSpeak(seq) {
    const ctx = ctxGet();
    posSrcs.forEach(s => { try { s.stop(); } catch (e) { } }); posSrcs = [];
    try {
      const bufs = await Promise.all(seq.map(posClip));
      let t = ctx.currentTime + 0.05;
      bufs.forEach(b => { const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(t); posSrcs.push(s); t += b.duration + 0.22; });
    } catch (e) { ttsSay(seq.join('、')); }
  }

  function posNewOrder(kind, level) {
    if (kind === 'delivery') {
      if (Math.random() < 0.7) {
        const items = shuffle(POSI.filter(x => x.uber)).slice(0, 1 + rint(3)).map(x => ({ key: x.key, n: Math.random() < 0.25 ? 2 : 1 }));
        return { table: '配達', guests: 0, items, intro: PO.say.uber[0] };
      }
      return { table: 'T,O', guests: 0, items: [{ key: POSI.find(x => x.to).key, n: 1 + rint(3) }], intro: PO.say.to[0] };
    }
    // como na loja: a maioria é balcão (C), quase sempre 2 pessoas, cada uma pede 1 bebida + 1 comida
    const cu = kind === 'custom';
    const seat = cu ? SET.posSeat : 'mix';
    const isC = seat === 'C' ? true : seat === 'T' ? false : Math.random() < 0.75;
    const table = pick(PO.tables.filter(t => PO.tableSay[t] && t[0] === (isC ? 'C' : 'T')));
    const guests = cu && +SET.posPeople ? +SET.posPeople : isC ? wchoice([[2, 78], [1, 12], [3, 10]]) : wchoice([[2, 40], [3, 30], [4, 30]]);
    const style = cu ? SET.posItems : level === 1 ? 'drink' : level === 2 ? 'pair' : 'more';
    const maxLv = cu ? (style === 'more' ? 3 : 2) : level;
    const fit = x => x.lv > 0 && x.lv <= maxLv && !x.course && (x.g === 0 || (x.g === 2 ? guests === 2 : guests >= 3));
    const drinks = POSI.filter(x => fit(x) && isDrink(x)), foods = POSI.filter(x => fit(x) && isFood(x));
    const bag = [];
    let course = null;
    if (style === 'more' && Math.random() < 0.15) {
      course = pick(POSI.filter(x => x.course && x.lv > 0 && x.lv <= 3 && x.s !== '飲み放題'));
      for (let i = 0; i < guests; i++) bag.push(course);
    }
    for (let i = 0; i < guests; i++) bag.push(wpick(drinks));
    if (style !== 'drink' && !course) {
      let left = guests;
      while (left > 0) { const f = wpick(foods.filter(x => !x.g || left >= (x.g === 34 ? 3 : 2))); bag.push(f); left -= f.g === 34 ? 3 : f.g === 2 ? 2 : 1; }
    }
    if (style === 'more' && !course) { const ex = POSI.filter(x => fit(x) && x.lv >= 2 && !bag.includes(x)); for (let i = 1 + rint(2); i > 0 && ex.length; i--) bag.push(wpick(ex)); }
    const items = [];
    bag.forEach(x => { const it = items.find(y => y.key === x.key); if (it) it.n++; else items.push({ key: x.key, n: 1 }); });
    return { table, guests, items };
  }
  const posExpected = o => (o.guests && OTOSHI ? [{ key: OTOSHI.key, n: o.guests }] : []).concat(o.items);
  // fala só a mesa e os itens; o número de pessoas aparece desenhado na tela
  function posSeq(o) {
    const seq = [o.intro || PO.tableSay[o.table][1]];
    o.items.forEach(it => { seq.push(POSK[it.key].s); seq.push(PO.say.qty[Math.min(it.n, PO.say.qty.length - 1)][0]); });
    return seq;
  }
  const personSvg = '<svg viewBox="0 0 20 24" width="20" height="24" aria-hidden="true"><circle cx="10" cy="6" r="5" fill="currentColor"/><path d="M1 23c0-6 4-9.5 9-9.5s9 3.5 9 9.5z" fill="currentColor"/></svg>';
  const peopleHtml = n => '<span class="who" title="' + n + ' pessoa' + (n > 1 ? 's' : '') + '">' + personSvg.repeat(n) + '<b>' + n + '</b><span class="small">pessoa' + (n > 1 ? 's' : '') + '</span></span>';
  function posStart(kind, level) {
    const ord = kind === 'free' ? null : posNewOrder(kind, level);
    ui.pos = { kind, level, ord, screen: 'tables', cat: null, table: null, lines: [], seq: [], hints: 0, errs: 0, locked: 0, t0: Date.now(), res: null, showText: !!SET.posText, hintSel: null, badSel: null };
    render();
    if (ord) posSpeak(posSeq(ord));
  }
  const posLineMap = z => { const m = {}; z.lines.forEach(l => m[l.key] = l.n); return m; };
  const posSum = z => z.lines.reduce((a, l) => a + POSK[l.key].p * l.n, 0);
  function posTarget(z) {
    if (!z.ord) return null;
    if (z.screen === 'tables') return '[data-act="postable"][data-t="' + z.ord.table + '"]';
    const exp = posExpected(z.ord), em = {}; exp.forEach(e => em[e.key] = e.n);
    const got = posLineMap(z);
    const extra = z.lines.find(l => !(l.key in em) || l.n > em[l.key]);
    if (extra) return '[data-act="posminus"][data-k="' + extra.key + '"]';
    const need = exp.find(e => (got[e.key] || 0) < e.n);
    if (!need) return '[data-act="posreg"]';
    const it = POSK[need.key];
    if (z.screen === 'cats') return '[data-act="poscat"][data-c="' + it.ci + '"]';
    return z.cat === it.ci ? '[data-act="positem"][data-k="' + need.key + '"]' : '[data-act="posback"]';
  }
  function posEvaluate(z) {
    const exp = posExpected(z.ord), em = {}, got = posLineMap(z), rows = [];
    exp.forEach(e => { em[e.key] = e.n; rows.push({ key: e.key, want: e.n, got: got[e.key] || 0 }); });
    z.lines.forEach(l => { if (!(l.key in em)) rows.push({ key: l.key, want: 0, got: l.n }); });
    rows.forEach(r => r.ok = r.want === r.got);
    let orderOk = true;
    if (z.ord.guests && OTOSHI) { const firstOther = z.seq.findIndex(k => k !== OTOSHI.key), firstOt = z.seq.indexOf(OTOSHI.key); orderOk = firstOt !== -1 && (firstOther === -1 || firstOt < firstOther); }
    const allOk = rows.every(r => r.ok);
    const perfect = allOk && orderOk && !z.errs && !z.hints && !z.locked;
    const st = PS.pos = Object.assign({ n: 0, ok: 0, perfect: 0, streak: 0, best: 0 }, PS.pos || {});
    st.n++; if (allOk) st.ok++; if (perfect) { st.perfect++; st.streak++; st.best = Math.max(st.best, st.streak); } else st.streak = 0;
    save();
    return { rows, orderOk, allOk, perfect, secs: Math.round((Date.now() - z.t0) / 1000) };
  }
  const yenP = n => n.toLocaleString('en-US') + '円';
  function posOrderText(o) {
    let h = '<div class="pos-ord"><b>' + esc(o.intro ? o.intro : o.table + ' · ' + o.guests + ' pessoa' + (o.guests > 1 ? 's' : '') + ' → お通し ×' + o.guests) + '</b><ul class="tight">';
    o.items.forEach(it => { const x = POSK[it.key]; h += '<li><span class="jp">' + esc(x.s) + '</span>' + (x.k && x.k !== x.s ? ' <span class="muted">（' + esc(x.k) + '）</span>' : '') + ' ×' + it.n + ' <span class="muted small">' + esc(x.pt) + '</span></li>'; });
    return h + '</ul></div>';
  }
  function posMenu() {
    const st = Object.assign({ n: 0, ok: 0, perfect: 0, streak: 0, best: 0 }, PS.pos || {});
    let h = '<div class="panel"><h2 style="margin-top:0">🧾 Prática do caixa</h2>' +
      '<p>Você ouve a mesa e o pedido, e <b>vê quantas pessoas são</b> (os bonequinhos ' + peopleHtml(2) + '). Registre como no trabalho:</p><ol class="tight"><li>Toque na mesa certa.</li><li><b>その他 → お通し</b>, uma vez por pessoa (a taxa da mesa vem primeiro).</li><li>Os itens, na quantidade pedida.</li><li><b>登録</b> para registrar.</li></ol>' +
      '<p class="small muted">Como na loja: a maioria dos pedidos é no balcão (C1–C5), quase sempre de 2 pessoas, e cada uma pede 1 bebida e 1 comida. Bebidas iguais viram uma linha só (角ハイ ふたつ = 角ハイ ×2).</p>' +
      '<p class="small muted">🔊 repete o pedido. <b>?</b> pisca o botão certo só na tela em que você está: na tela das categorias mostra a categoria; dentro dela, o item. Tocar numa linha do pedido (à direita) tira uma unidade.</p></div>';
    h += '<div class="pos-levels">' +
      '<button class="deck" data-act="posgo" data-kind="hall" data-lv="1"><span class="em">1</span><span class="nm">Nível 1: a 1ª rodada<div class="small muted">Só bebidas, 1 por pessoa</div></span></button>' +
      '<button class="deck" data-act="posgo" data-kind="hall" data-lv="2"><span class="em">2</span><span class="nm">Nível 2: pedido normal<div class="small muted">1 bebida + 1 comida por pessoa</div></span></button>' +
      '<button class="deck" data-act="posgo" data-kind="hall" data-lv="3"><span class="em">3</span><span class="nm">Nível 3: pedido grande<div class="small muted">Mais itens, porções 2名様 / 3〜4名様, R, garrafas e cursos</div></span></button>' +
      '<button class="deck" data-act="posgo" data-kind="delivery" data-lv="0"><span class="em">🛵</span><span class="nm">Entrega e para viagem<div class="small muted">配達 + categoria ウーバー · T,O</div></span></button>' +
      '<button class="deck" data-act="posgo" data-kind="free" data-lv="0"><span class="em">🧭</span><span class="nm">Explorar o caixa<div class="small muted">Sem pedido: navegue pelas telas à vontade</div></span></button></div>';
    const opt = (k, v, l) => '<option value="' + v + '"' + (String(SET[k]) === String(v) ? ' selected' : '') + '>' + l + '</option>';
    h += '<div class="panel"><h3 style="margin-top:0">🎛 Pedido personalizado</h3><p class="small muted">Escolha você o lugar, as pessoas e o tamanho do pedido.</p><div class="pos-cu">' +
      '<label>Lugar<select data-set="posSeat">' + opt('posSeat', 'mix', 'Como na loja (¾ balcão)') + opt('posSeat', 'C', 'Só balcão (C)') + opt('posSeat', 'T', 'Só mesa (T)') + '</select></label>' +
      '<label>Pessoas<select data-set="posPeople">' + opt('posPeople', 'auto', 'Como na loja') + [1, 2, 3, 4, 5, 6].map(n => opt('posPeople', n, n)).join('') + '</select></label>' +
      '<label>Pedido<select data-set="posItems">' + opt('posItems', 'drink', '1 bebida por pessoa') + opt('posItems', 'pair', '1 bebida + 1 comida por pessoa') + opt('posItems', 'more', 'Pedido grande') + '</select></label>' +
      '</div><button class="btn primary" data-act="posgo" data-kind="custom" data-lv="0">Jogar personalizado</button></div>';
    h += '<label class="set">Mostrar o texto do pedido desde o início<input type="checkbox" data-set="posText"' + (SET.posText ? ' checked' : '') + '></label>';
    h += '<p class="small muted">Jogados: ' + st.n + ' · certos: ' + st.ok + ' · perfeitos (sem dica e sem erro): ' + st.perfect + ' · sequência: ' + st.streak + ' (recorde ' + st.best + ')</p>';
    h += '<p class="small muted">Montado a partir das fotos do caixa de 03/11. KOROKORO YAKI, ソフドリ e ボトル赤 ainda não têm foto: usam os nomes do cardápio. A fala dos itens com R / Half / Regular / 2名様 é uma suposição minha de como a equipe fala.</p>';
    return h;
  }
  function posBoard() {
    const z = ui.pos, cats = PO.cats;
    let h = '<div class="pos-bar">';
    if (z.ord) h += '<button class="btn sm primary" data-act="posplay">🔊 Ouvir de novo</button><button class="btn sm" data-act="poshint">? Dica</button><button class="btn sm" data-act="postext">👁 ' + (z.showText ? 'Esconder' : 'Ver') + ' texto</button>';
    if (z.ord && z.ord.guests) h += peopleHtml(z.ord.guests);
    h += '<span class="small muted">' + (z.kind === 'free' ? 'Modo livre' : z.kind === 'delivery' ? 'Entrega' : z.kind === 'custom' ? 'Personalizado' : 'Nível ' + z.level) + (z.ord ? ' · dicas ' + z.hints + ' · erros ' + (z.errs + z.locked) : '') + '</span><button class="btn sm" data-act="posquit">Sair</button></div>';
    if (z.ord && z.showText) h += posOrderText(z.ord);
    let title, grid = '', back = z.screen !== 'tables';
    if (z.screen === 'tables') {
      title = 'テーブル';
      grid = PO.tables.map(t => '<button class="pt" data-act="postable" data-t="' + esc(t) + '"><span class="pl">' + esc(t) + '</span><span class="pp">' + (t === z.table ? yenP(posSum(z)) : '0円') + '</span></button>').join('');
    } else if (z.screen === 'cats') {
      title = z.table || '';
      grid = cats.map((c, ci) => '<button class="pt cat' + (c.empty ? ' empty' : '') + '" data-act="poscat" data-c="' + ci + '"><span class="pl">' + (ci === 0 ? '<span class="star">★</span>' : esc(c.name)) + '</span><span class="pp">' + (ci === 1 ? '' : c.items.length + '品') + '</span></button>').join('');
    } else {
      const c = cats[z.cat]; title = c.name;
      grid = c.items.map((it, ii) => { const x = POSK[z.cat + ':' + ii]; return '<button class="pt' + (x.red ? ' red' : '') + '" data-act="positem" data-k="' + x.key + '"><span class="pl">' + esc(x.l) + '</span><span class="pp">' + yenP(x.p) + '</span></button>'; }).join('');
      if (c.foto === false) grid += '<div class="pos-note small">Sem foto do caixa: nomes do cardápio.</div>';
      if (c.locked) grid += '<div class="pos-note small">紐付け触らない = itens ligados aos cursos. Não mexa.</div>';
    }
    const sum = posSum(z), svc = Math.floor(sum * 0.05), pts = z.lines.reduce((a, l) => a + l.n, 0);
    h += '<div class="pos"><div class="pos-main"><div class="pos-head">' + (back ? '<button class="pos-ic" data-act="posback" aria-label="voltar">←</button>' : '<span></span>') +
      '<span class="pos-title">' + esc(title) + '</span><span class="pos-icons">' + (z.screen === 'tables' ? '<span class="pos-ic">⟳</span>' : '<span class="pos-ic">⏱</span><span class="pos-ic">👤<small>0</small></span><span class="pos-ic">🖨</span>') + '</span></div>' +
      '<div class="pos-grid">' + grid + '</div>' +
      '<div class="pos-foot"><button data-act="postables">▦<br>テーブル</button><button data-act="posnoop">👤<br>管理者</button><span></span><button data-act="posnoop">⚙<br>設定</button></div></div>' +
      '<div class="pos-side"><div class="pos-lines">' + (z.lines.length ? z.lines.map(l => { const x = POSK[l.key]; return '<button class="pos-line" data-act="posminus" data-k="' + l.key + '"><span>' + esc(x.l) + '</span><span>×' + l.n + '</span><span>' + yenP(x.p * l.n) + '</span></button>'; }).join('') : '') + '</div>' +
      '<button class="pos-reg" data-act="posreg">登録</button>' +
      '<div class="pos-tot"><div><span>小計 (' + pts + '点)</span><span>' + yenP(sum) + '</span></div><div><span>サービス料 (5%)</span><span>' + yenP(svc) + '</span></div><div><span>消費税</span><span>込</span></div><div><span>値引</span><span>0円</span></div><div class="sum"><span>合計</span><span>' + yenP(sum + svc) + '</span></div></div></div></div>';
    return h;
  }
  function posResult() {
    const z = ui.pos, r = z.res;
    let h = '<div class="panel"><h2 style="margin-top:0">' + (r.perfect ? '⭐ Perfeito!' : r.allOk ? '✅ Pedido certo' : '❌ Tem diferença') + '</h2>';
    h += '<p class="small muted">' + r.secs + ' s · dicas ' + z.hints + ' · erros ' + (z.errs + z.locked) + '</p>';
    h += posOrderText(z.ord);
    h += '<table class="pos-res"><tr><th></th><th>Botão</th><th>Pedido</th><th>Você</th></tr>' + r.rows.map(x => '<tr class="' + (x.ok ? 'ok' : 'bad') + '"><td>' + (x.ok ? '✓' : '✗') + '</td><td class="jp">' + esc(POSK[x.key].l) + '<div class="small muted">' + esc(PO.cats[POSK[x.key].ci].name) + '</div></td><td>' + x.want + '</td><td>' + x.got + '</td></tr>').join('') + '</table>';
    if (!r.orderOk) h += '<p class="badge warn">A お通し precisa ser registrada antes dos outros itens.</p>';
    h += '<div class="drills" style="margin-top:10px"><button class="btn primary" data-act="posnext">Próximo pedido</button><button class="btn" data-act="posplay">🔊 Ouvir este de novo</button><button class="btn" data-act="posquit">Sair</button></div></div>';
    return h;
  }
  function renderPos() {
    if (!PO) return '<p class="muted">Dados do caixa não encontrados (pos.js).</p>';
    if (!ui.pos) return posMenu();
    if (ui.pos.res) return posResult();
    return posBoard();
  }

  /* ---------- desenhos (SVG) ---------- */
  let svgN = 0;
  const GL = {
    pils: { o: 'M19 8 H41 L36.5 90 Q30 93 23.5 90 Z', top: 14, bot: 91 },
    mug: { o: 'M11 16 H43 V87 Q43 92 38 92 H16 Q11 92 11 87 Z', top: 21, bot: 92, h: 'M43 30 H50 Q55 30 55 35 V64 Q55 69 50 69 H43' },
    tumbler: { o: 'M13 12 H47 L44 90 Q30 93 16 90 Z', top: 18, bot: 91 }
  };
  const ICE = [[17, 66], [31, 70], [23, 50], [33, 46], [18, 32], [31, 26]];
  // conteúdo de um copo: camadas [cor, fração] de baixo para cima; o.ice / o.bubbles / o.fruit; o.rot inclina o copo (o líquido fica nivelado)
  function glassG(shape, layers, o) {
    o = o || {};
    const g = GL[shape], id = 'gc' + (++svgN), H = g.bot - g.top, rot = o.rot ? ' transform="rotate(' + o.rot + ' 30 60)"' : '';
    let y = o.rot ? 100 : g.bot, fill = '';
    (layers || []).forEach(([c, f]) => { const h = (o.rot ? 70 : H) * f; y -= h; fill += '<rect x="-20" y="' + y.toFixed(1) + '" width="100" height="' + (h + .6).toFixed(1) + '" fill="' + c + '"/>'; });
    const lvl = y;
    if (o.ice) ICE.forEach(([x, yy], i) => { if (yy + 6 < lvl - 4 && !(o.iceAll)) return; fill += '<rect x="' + x + '" y="' + yy + '" width="12" height="12" rx="2.5" transform="rotate(' + (i * 23 % 40 - 20) + ' ' + (x + 6) + ' ' + (yy + 6) + ')" fill="rgba(255,255,255,.28)" stroke="rgba(80,120,150,.7)" stroke-width="1"/>'; });
    if (o.bubbles) [[20, 80], [38, 66], [26, 50], [40, 36], [22, 30], [35, 84]].forEach(([x, yy]) => { if (yy > lvl) fill += '<circle cx="' + x + '" cy="' + yy + '" r="1.4" fill="none" stroke="rgba(255,255,255,.95)" stroke-width=".9"/>'; });
    if (o.fruit) fill += '<circle cx="36" cy="' + (lvl + 9) + '" r="7" fill="#f6e27a" stroke="#c9a400" stroke-width="1"/><path d="M36 ' + (lvl + 2) + 'v14M29 ' + (lvl + 9) + 'h14" stroke="#c9a400" stroke-width=".8"/>';
    return '<defs><clipPath id="' + id + '"><path d="' + g.o + '"' + rot + '/></clipPath></defs><g clip-path="url(#' + id + ')">' + fill + '</g>' +
      '<path d="' + g.o + '"' + rot + ' fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' + (g.h ? '<path d="' + g.h + '"' + rot + ' fill="none" stroke="currentColor" stroke-width="2.4"/>' : '');
  }
  const glassSvg = (shape, layers, o, w) => '<svg class="glass" viewBox="0 0 60 100" width="' + (w || 54) + '" height="' + Math.round((w || 54) * 100 / 60) + '" aria-hidden="true">' + glassG(shape, layers, o) + '</svg>';
  // copinho medidor: lado grande (45) em cima, lado pequeno (30) embaixo
  const jigSvg = (big, small) => '<svg class="jig" viewBox="0 0 24 30" width="17" height="21" aria-hidden="true"><path d="M2 2 H22 L13.6 15 H10.4 Z" fill="' + (big ? 'var(--accent)' : 'none') + '" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10.4 16.5 H13.6 L18.5 28 H5.5 Z" fill="' + (small ? 'var(--accent)' : 'none') + '" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const doseIcon = d => d === '45' ? jigSvg(1, 0) : d === '30' ? jigSvg(0, 1) : d === '45+30' ? jigSvg(1, 0) + jigSvg(0, 1) : d === '60' ? jigSvg(0, 1) + jigSvg(0, 1) : '';
  const doseChip = d => d ? '<span class="dose" data-act="dose">' + doseIcon(d) + '<b>' + esc(d) + '</b></span>' : '';
  const GN = ['', '①', '②', '③'];

  /* ---------- tela: drinks ---------- */
  function leverSvg() {
    const tap = (x, top, bot, lab) => '<rect x="' + (x - 8) + '" y="6" width="16" height="44" rx="5" fill="' + top + '" stroke="currentColor" stroke-width="1.8"/>' +
      (bot ? '<rect x="' + (x - 8) + '" y="28" width="16" height="22" rx="0" fill="' + bot + '" stroke="currentColor" stroke-width="1.8"/><rect x="' + (x - 8) + '" y="6" width="16" height="44" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/>' : '') +
      '<rect x="' + (x - 5) + '" y="96" width="10" height="20" rx="2" fill="currentColor"/><text x="' + x + '" y="78" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">' + lab + '</text>';
    return '<svg class="lever" viewBox="0 0 300 140" role="img" aria-label="Máquina com 3 alavancas: esquerda, meio e direita">' +
      '<rect x="20" y="50" width="260" height="46" rx="10" fill="var(--soft)" stroke="currentColor" stroke-width="1.8"/>' +
      tap(70, '#f0d27e', '', 'esq.') + tap(150, '#e8ae2c', '#fffaf0', 'meio') + tap(230, '#efe9d8', '#9fd3e6', 'dir.') +
      '<rect x="20" y="124" width="260" height="10" rx="4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 3"/></svg>';
  }
  function shelfSvg() {
    const G = DR.glasses;
    let s = '<svg class="shelf" viewBox="0 0 300 250" role="img" aria-label="Prateleira com os 3 copos">';
    G.forEach((g, i) => {
      const y = 8 + i * 80;
      s += '<line x1="10" x2="290" y1="' + (y + 74) + '" y2="' + (y + 74) + '" stroke="currentColor" stroke-width="3"/>';
      [0, 1, 2].forEach(k => { s += '<g transform="translate(' + (20 + k * 44) + ' ' + y + ') scale(.72)">' + glassG(g.shape, [], {}) + '</g>'; });
      s += '<text x="160" y="' + (y + 38) + '" font-size="26" font-weight="800" fill="var(--accent)">' + GN[g.n] + '</text><text x="200" y="' + (y + 34) + '" font-size="13" fill="currentColor">' + esc(g.where) + '</text>';
    });
    return s + '</svg>';
  }
  function beerSvg() {
    const p = (tx, inner, cap) => '<g transform="translate(' + tx + ' 0)"><rect x="24" y="0" width="12" height="10" rx="2" fill="currentColor"/>' + inner + '<text x="30" y="128" text-anchor="middle" font-size="11" fill="currentColor">' + cap + '</text></g>';
    const g = (layers, o) => '<g transform="translate(0 20)">' + glassG('mug', layers, o) + '</g>';
    return '<svg class="beer" viewBox="-16 0 332 134" role="img" aria-label="Cerveja em 3 passos: copo inclinado, endireitar, espuma 8 para 2">' +
      p(10, '<path d="M30 10 V40" stroke="#e8ae2c" stroke-width="3"/>' + g([['#e8ae2c', .35]], { rot: -35 }), '1. copo inclinado') +
      p(110, '<path d="M30 10 V28" stroke="#e8ae2c" stroke-width="3"/>' + g([['#e8ae2c', .8]], {}), '2. endireite: 8') +
      p(210, g([['#e8ae2c', .78], ['#fffaf0', .2]], {}) + '<text x="64" y="44" font-size="12" font-weight="700" fill="var(--accent)">2</text><text x="64" y="84" font-size="12" font-weight="700" fill="var(--accent)">8</text>', '3. espuma: 2') +
      '</svg>';
  }
  function drinkCard(d) {
    const A = DR.alc[d.alc], X = DR.mix[d.mix], gl = DR.glasses[d.glass - 1];
    const dot = c => c ? '<i class="dot" style="background:' + c + '"></i>' : '';
    const can = d.say && PA[d.say];
    let h = '<div class="panel dcard' + (d.check ? ' chk' : '') + '"><div class="dc-top"><div class="dc-gl">' + glassSvg(gl.shape, d.layers, { ice: d.ice, bubbles: d.bubbles, fruit: d.fruit }, 66) + '<span class="gn">' + GN[d.glass] + '</span></div>' +
      '<div class="dc-nm"><b class="jp">' + esc(d.say || d.pos) + '</b>' + (can ? ' <button class="btn sm" data-act="dsay" data-s="' + esc(d.say) + '" aria-label="ouvir">🔊</button>' : '') +
      (d.nopos ? '' : '<div class="small muted">caixa: ' + esc(d.pos) + '</div>') + (d.check ? '<div><span class="badge warn">confirme</span></div>' : '') + '</div></div>';
    h += '<ol class="steps5">' +
      '<li><span class="sn">1</span><span class="sv"><b>Copo ' + GN[d.glass] + '</b> <span class="muted">' + esc(gl.where) + '</span></span></li>' +
      '<li><span class="sn">2</span><span class="sv">' + (d.ice ? '🧊 <b>gelo até a boca</b>' : '<b>sem gelo</b>') + (d.first ? '<br>' + esc(d.first) : '') + '</span></li>' +
      '<li><span class="sn">3</span><span class="sv">' + (d.alc === 'none' ? '<span class="muted">sem álcool</span>' : dot(A.c) + '<b class="jp">' + esc(A.t) + '</b> ' + doseChip(d.dose) + '<br><span class="muted small">' + esc(A.how) + '</span>') + '</span></li>' +
      '<li><span class="sn">4</span><span class="sv">' + dot(X.c) + '<b class="jp">' + esc(X.t) + '</b><br><span class="muted small">' + esc(X.how) + '</span></span></li>' +
      '<li><span class="sn">5</span><span class="sv">' + (d.end ? esc(d.end) : '<span class="muted">servir</span>') + '</span></li></ol>';
    if (d.tip) h += '<p class="small" style="margin:6px 0 0">' + esc(d.tip) + '</p>';
    return h + '</div>';
  }
  function dqNew() {
    const pool = DR.drinks.filter(d => !d.check && (!ui.dq || d.id !== ui.dq.id));
    const d = pick(pool);
    const alt = (obj, right, ban) => shuffle([right].concat(shuffle(Object.keys(obj).filter(k => k !== right && !ban.includes(k) && obj[k].t !== obj[right].t)).slice(0, 3)));
    const same = { sour: ['base'], base: ['sour'], soda: ['ume'], ume: ['soda'] };
    ui.dq = { id: d.id, sel: {}, done: false, opts: { glass: [1, 2, 3], ice: [true, false], alc: alt(DR.alc, d.alc, same[d.alc] || []), mix: alt(DR.mix, d.mix, (same[d.mix] || []).concat('honey')) } };
    render();
    if (d.say && PA[d.say]) posSpeak([d.say]);
  }
  function dqHtml() {
    const z = ui.dq, d = DR.drinks.find(x => x.id === z.id);
    const want = { glass: d.glass, ice: d.ice, alc: d.alc, mix: d.mix };
    const rows = [['glass', 'Copo'], ['ice', 'Gelo'], ['alc', 'Álcool'], ['mix', 'Complemento']];
    const lab = (k, v) => k === 'glass' ? glassSvg(DR.glasses[v - 1].shape, [], {}, 26) + '<b>' + GN[v] + '</b>' : k === 'ice' ? (v ? '🧊 com gelo' : 'sem gelo') : esc((k === 'alc' ? DR.alc : DR.mix)[v].t);
    let h = '<div class="panel dq"><div class="dq-head"><div><div class="small muted">Monte a bebida</div><b class="jp dq-name">' + esc(d.say || d.pos) + '</b></div>' +
      (d.say && PA[d.say] ? '<button class="btn sm" data-act="dsay" data-s="' + esc(d.say) + '">🔊</button>' : '') + '<button class="btn sm" data-act="dqquit">Fechar</button></div>';
    rows.forEach(([k, t]) => {
      h += '<div class="dq-row"><span class="dq-k">' + t + '</span><div class="dq-opts">' + z.opts[k].map(v => {
        const on = z.sel[k] === v, ok = z.done && v === want[k], bad = z.done && on && v !== want[k];
        return '<button class="dq-o' + (on ? ' on' : '') + (ok ? ' ok' : '') + (bad ? ' no' : '') + '" data-act="dqpick" data-k="' + k + '" data-v="' + esc(String(v)) + '"' + (z.done ? ' disabled' : '') + '>' + lab(k, v) + '</button>';
      }).join('') + '</div></div>';
    });
    const all = rows.every(([k]) => k in z.sel);
    if (!z.done) h += '<button class="btn primary" data-act="dqcheck"' + (all ? '' : ' disabled') + '>Conferir</button>';
    else {
      const n = rows.filter(([k]) => z.sel[k] === want[k]).length;
      h += '<p><b>' + (n === 4 ? '✅ Perfeito!' : n + ' de 4 certos') + '</b></p>' + drinkCard(d) + '<button class="btn primary" data-act="dqnext">Próxima bebida</button>';
    }
    const st = PS.dq || { n: 0, ok: 0 };
    return h + '<p class="small muted">Montadas: ' + st.n + ' · perfeitas: ' + st.ok + '</p></div>';
  }
  function renderDrinks() {
    if (!DR) return '<p class="muted">Receitas não encontradas (drinks.js).</p>';
    if (ui.dq) return dqHtml();
    let h = '<div class="panel"><h2 style="margin-top:0">🍹 Drinks: como fazer</h2><p>Toda bebida segue a <b>mesma ordem</b>. Decore a ordem e, para cada bebida, só o que muda:</p>' +
      '<ol class="flow"><li><span>1</span>Copo<small>①②③</small></li><li><span>2</span>Gelo<small>🧊 até a boca</small></li><li><span>3</span>Álcool<small>' + jigSvg(1, 0) + ' copinho, alavanca ou bico</small></li><li><span>4</span>Comple&shy;mento<small>soda, chá, suco</small></li><li><span>5</span>Servir</li></ol>' +
      '<button class="btn primary" data-act="dqnext">🎯 Treinar: monte a bebida</button></div>';
    h += '<div class="dvis">';
    h += '<div class="panel"><h3 style="margin-top:0">Os 3 copos</h3>' + shelfSvg() + '<ul class="tight">' + DR.glasses.map(g => '<li><b class="gnum">' + GN[g.n] + '</b> ' + esc(g.where) + ': <b>' + esc(g.use) + '</b></li>').join('') + '</ul><p class="small muted">Desenho ilustrativo: o formato real pode ser outro. O que importa é a prateleira.</p></div>';
    h += '<div class="panel"><h3 style="margin-top:0">A máquina: 3 alavancas</h3>' + leverSvg() + '<div class="levers">' + DR.levers.map(l => '<div class="lv"><b>' + esc(l.name) + '</b>' +
      (l.b ? '<div>' + esc(l.a[1]) + ' → <b class="jp">' + esc(l.a[0]) + '</b></div><div>' + esc(l.b[1]) + ' → <b class="jp">' + esc(l.b[0]) + '</b></div>' : '<div><b class="jp">' + esc(l.a[0]) + '</b></div>') +
      (l.check ? '<span class="badge warn">confirme</span>' : '') + '</div>').join('') + '</div><p class="small muted">A サワーベース é alcoólica: toda サワー tem álcool.</p></div>';
    h += '<div class="panel"><h3 style="margin-top:0">O copinho medidor (em vez de decorar ml)</h3><div class="jigs">' +
      '<div><span class="ji">' + jigSvg(1, 0) + '</span><span><b>lado grande cheio</b> = 45<br><span class="muted">a dose da maioria (焼酎, 梅酒, ハイ)</span></span></div>' +
      '<div><span class="ji">' + jigSvg(0, 1) + '</span><span><b>lado pequeno cheio</b> = 30<br><span class="muted">alguns whiskies na ハイボール</span></span></div>' +
      '<div><span class="ji">' + jigSvg(1, 0) + jigSvg(0, 1) + '</span><span><b>os dois lados</b> = 45+30<br><span class="muted">焼酎 / 梅酒 na ロック</span></span></div>' +
      '<div><span class="ji">' + jigSvg(0, 1) + jigSvg(0, 1) + '</span><span><b>lado pequeno 2×</b> = 60 <span class="badge warn">confirme</span><br><span class="muted">三輪ハイ, whisky na ロック</span></span></div></div>' +
      '<p class="small muted">O papel diz 45 e 30, então o copinho deve ter esses dois lados. Se ele tiver uma marca de 60, use a marca.</p></div>';
    h += '<div class="panel"><h3 style="margin-top:0">Cerveja: 8 de cerveja, 2 de espuma</h3>' + beerSvg() + '<p class="small">Sem gelo. 生ビール no copo ②, alavanca do meio. 白穂乃香 no copo ①, alavanca da esquerda. グラス生ビール: o mesmo chope, num copo menor.</p></div>';
    h += '</div>';
    h += '<label class="set">Modo treino: esconder as doses (toque para ver)<input type="checkbox" data-set="drinkQuiz"' + (SET.drinkQuiz ? ' checked' : '') + '></label>';
    h += '<div class="' + (SET.drinkQuiz ? 'dquiz' : '') + '">';
    DR.groups.forEach(([g, t]) => { h += '<h2>' + esc(t) + '</h2><div class="dgrid">' + DR.drinks.filter(d => d.group === g).map(drinkCard).join('') + '</div>'; });
    const table = (t, title) => '<h3 style="margin-top:0">' + title + '</h3><table class="dtab"><tr><th></th>' + t.cols.map(c => '<th>' + esc(c[0]) + '<div class="code">' + esc(c[1]) + '</div></th>').join('') + '</tr>' +
      t.rows.map(r => '<tr><th class="jp">' + esc(r[0]) + '<div class="small muted">' + esc(r[1]) + '</div></th>' + r[2].map(v => '<td>' + doseChip(v) + '</td>').join('') + '</tr>').join('') + '</table><p class="small muted">' + esc(t.note) + '</p>';
    h += '<h2>Pedidos com ソ / 水 / R / 湯</h2><div class="panel"><p class="small">O cliente escolhe como quer: <span class="codes">' + DR.codes.map(c => '<span class="chip"><b class="code">' + esc(c[0]) + '</b> ' + esc(c[1]) + ' · ' + esc(c[2]) + '</span>').join('') + '</span></p>' +
      '<p class="small">Mesma ordem de sempre: gelo → álcool no copinho → soda (ソ) ou água (水); na ロック, só gelo. Exceção: no 湯 não vai gelo e a água quente entra antes do álcool.</p>' + table(DR.shochu, '焼酎・梅酒 (shochu e licor de ume)') + '</div>';
    h += '<div class="panel">' + table(DR.whisky, 'ウィスキー') + '</div>';
    h += '</div><p class="small muted">' + esc(DR.bottle) + '</p>';
    return h;
  }

  /* ---------- tela: molhos (pratinhos) ---------- */
  const CD = window.COND || null;
  const PL = {
    round: { vb: '0 0 100 100', comp: [[50, 50, 31]], draw: '<circle cx="50" cy="50" r="46" class="pf"/><circle cx="50" cy="50" r="39" class="pr"/>' },
    yaku: { vb: '0 0 100 100', comp: [[50, 50, 32]], draw: '<circle cx="50" cy="50" r="47" class="pf"/><circle cx="50" cy="50" r="42" class="pr"/><circle cx="50" cy="50" r="38" class="pr"/>' },
    oval2: { vb: '0 0 160 100', comp: [[43, 50, 30], [117, 50, 30]], draw: '<ellipse cx="80" cy="50" rx="76" ry="46" class="pf"/><path d="M80 6 V94" class="pd"/>' },
    megane: { vb: '0 0 170 100', comp: [[47, 50, 31], [123, 50, 31]], draw: '<circle cx="47" cy="50" r="44" class="pf"/><circle cx="123" cy="50" r="44" class="pf"/><rect x="80" y="38" width="10" height="24" class="pb"/>' },
    rect3: { vb: '0 0 210 84', comp: [[38, 42, 27], [105, 42, 27], [172, 42, 27]], draw: '<rect x="4" y="4" width="202" height="76" rx="12" class="pf"/><path d="M71 8 V76 M139 8 V76" class="pd"/>' }
  };
  const BLOB = { 1: [[0, 0, .66]], 2: [[0, -.46, .44], [0, .46, .44]], 3: [[0, -.64, .34], [0, 0, .34], [0, .64, .34]], 4: [[-.42, -.42, .38], [.42, -.42, .38], [-.42, .42, .38], [.42, .42, .38]] };
  function plateSvg(dk, parts, w) {
    const D = CD.dishes[dk], P = PL[D.shape], vb = P.vb.split(' ').map(Number);
    let s = '<svg class="plate" viewBox="' + P.vb + '" width="' + (w || 120) + '" height="' + Math.round((w || 120) * vb[3] / vb[2]) + '" role="img" aria-label="' + esc(D.t) + '">' + P.draw;
    (parts || []).forEach((list, i) => {
      const [cx, cy, R] = P.comp[i] || P.comp[0], L = BLOB[Math.min(list.length, 4)];
      list.forEach((k, j) => {
        const c = CD.sauces[k], [dx, dy, rf] = L[j], x = cx + dx * R, y = cy + dy * R, r = rf * R;
        const fs = Math.min(r * .62, 1.9 * r / Math.max(2, [...c.s].length));
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + c.c + '" stroke="rgba(0,0,0,.4)" stroke-width="1"/>';
        if (c.grain) [[-.35, -.2], [.3, -.35], [.1, .3], [-.3, .35], [.4, .2]].forEach(([a, b]) => { s += '<circle cx="' + (x + a * r).toFixed(1) + '" cy="' + (y + b * r).toFixed(1) + '" r=".9" fill="#9aa"/>'; });
        s += '<text x="' + x.toFixed(1) + '" y="' + (y + fs * .36).toFixed(1) + '" text-anchor="middle" font-size="' + fs.toFixed(1) + '" fill="' + c.ink + '">' + esc(c.s) + '</text>';
      });
    });
    return s + '</svg>';
  }
  const dishFig = (dk, parts, w) => { const D = CD.dishes[dk]; return '<figure class="pfig">' + plateSvg(dk, parts, w) + '<figcaption><b class="jp">' + esc(D.t) + '</b>' + (D.k ? ' <span class="muted small">' + esc(D.k) + '</span>' : '') + '</figcaption></figure>'; };
  const sauceName = k => { const c = CD.sauces[k]; return kanjiOf(c.t).length ? '<ruby>' + esc(c.t) + '<rt>' + esc(c.k) + '</rt></ruby>' : esc(c.t); };
  const sauceChip = k => { const c = CD.sauces[k]; return '<span class="chip"><i class="dot" style="background:' + c.c + '"></i><b>' + sauceName(k) + '</b> <span class="muted">' + esc(c.pt) + '</span></span>'; };
  const ruleSauces = r => [...new Set(r.parts.flat().concat((r.extra || []).flatMap(x => x.parts.flat())))];
  const ruleDishes = r => [r.dish].concat((r.extra || []).map(x => x.dish));
  const ruleSig = r => ruleDishes(r).slice().sort().join(',') + '/' + ruleSauces(r).slice().sort().join(',');
  const ruleName = r => ruby(r.rb || r.name, true);
  const plates = (r, big) => dishFig(r.dish, r.parts, r.dish === 'sanren' ? (big ? 210 : 150) : r.dish === 'megane' || r.dish === 'niren' ? (big ? 180 : 130) : (big ? 124 : 90)) +
    (r.extra || []).map(x => '<span class="plus">+</span>' + dishFig(x.dish, x.parts, big ? 100 : 76)).join('');
  // a composição em texto: 薬皿: おろし + ポン酢 · 小皿: からし + 醤油 ( | separa as divisões)
  const compText = r => [{ dish: r.dish, parts: r.parts }].concat(r.extra || []).map(x => '<b class="jp">' + esc(CD.dishes[x.dish].t) + '</b>: ' + x.parts.map(p => p.map(k => '<span class="jp">' + esc(CD.sauces[k].t) + '</span>').join(' + ')).join(' <b class="sep">|</b> ')).join('<br>');
  function condAnswer(r) {
    let h = '<div class="cc-pl">' + plates(r, true) + '</div><div class="comp">' + compText(r) + '</div>';
    (r.notes || []).forEach(n => { h += '<p class="small" style="margin:4px 0">👉 ' + esc(n) + '</p>'; });
    if (r.note) h += '<p class="small" style="margin:4px 0">' + esc(r.note) + '</p>';
    const fam = CD.families.find(f => f.rules.includes(r.id));
    if (fam || r.hook) h += '<p class="hookp">🧠 ' + (fam ? fam.icon + ' <b>' + esc(fam.t) + '</b>' : '') + (r.hook ? '<br>' + esc(r.hook) : '') + '</p>';
    if (r.say) h += '<div class="cc-say"><button class="btn sm" data-act="dsay" data-s="' + esc(r.say[0]) + '">🔊</button><span><b class="jp">' + esc(r.say[0]) + '</b>' + (r.en ? '<br><span class="small muted">EN: ' + esc(r.en) + '</span>' : '') + '</span></div>';
    return h;
  }
  function condCard(r) {
    let h = '<div class="panel ccard' + (r.check ? ' chk' : '') + '"><div class="cc-pl">' + plates(r, true) + '</div>';
    h += '<div class="cc-nm"><b class="jp">' + ruleName(r) + '</b>' + (r.k ? ' <button class="btn sm" data-act="dsay" data-s="' + esc(r.name) + '" aria-label="ouvir">🔊</button>' : '') + ' <span class="muted small">' + esc(r.pt) + '</span></div>';
    h += '<div class="comp small">' + compText(r) + '</div>' + (r.hook ? '<p class="hookp small">🧠 ' + esc(r.hook) + '</p>' : '');
    (r.notes || []).forEach(n => { h += '<p class="small" style="margin:4px 0">👉 ' + esc(n) + '</p>'; });
    if (r.note) h += '<p class="small" style="margin:4px 0">' + esc(r.note) + '</p>';
    if (r.say) h += '<div class="cc-say"><button class="btn sm" data-act="dsay" data-s="' + esc(r.say[0]) + '">🔊</button><span><b class="jp">' + esc(r.say[0]) + '</b>' + (r.en ? '<br><span class="small muted">EN: ' + esc(r.en) + '</span>' : '') + '</span></div>';
    if (r.pos && r.pos.length) h += '<details class="small"><summary class="muted">botões no caixa (' + r.pos.length + ')</summary>' + r.pos.map(l => '<span class="chip jp">' + esc(l) + '</span>').join('') + '</details>';
    if (r.check) h += '<p class="small"><span class="badge warn">confirme</span> ' + esc(r.check) + '</p>';
    return h + '</div>';
  }
  // "a lógica": as 3 famílias com os ganchos de memória e os pratinhos pequenos
  function famHtml() {
    return '<div class="panel"><h2 style="margin-top:0">🧠 Como decorar: a lógica</h2><p class="small">Não decore 10 coisas soltas. São 3 famílias, e dentro de cada uma só muda um detalhe:</p>' +
      CD.families.map(f => '<div class="fam"><h3>' + f.icon + ' ' + esc(f.t) + '</h3><div class="fam-pl">' + f.rules.map(id => { const r = CD.rules.find(x => x.id === id); return '<div class="fam-it"><div class="cc-pl sm">' + plates(r, false) + '</div><b class="jp">' + ruleName(r) + '</b></div>'; }).join('') + '</div>' +
        '<ul class="tight small">' + f.hooks.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>').join('') +
      '<p class="small muted" style="margin-bottom:0">' + esc(CD.rule) + '</p></div>';
  }

  /* treino: rodada com todos os pratos; o que errar volta até acertar */
  const condPool = () => CD.rules.filter(r => r.drill !== false);
  function cdRound() { ui.cr = { queue: shuffle(condPool().map(r => r.id)), total: condPool().length, first: {}, last: {} }; cdNew(); }
  function cdNew() {
    const R = ui.cr;
    if (R && !R.queue.length) { ui.cd = { end: true }; render(); return; }
    const id = R ? R.queue[0] : pick(condPool().filter(r => !ui.cd || r.id !== ui.cd.id)).id;
    const r = CD.rules.find(x => x.id === id);
    // alterna o tipo: "monte o pratinho" e "de qual prato é este pratinho?"
    const type = R && R.last[id] ? (R.last[id] === 'build' ? 'which' : 'build') : (Math.random() < .5 ? 'build' : 'which');
    if (R) R.last[id] = type;
    const z = { id, type, dishes: [], sauces: [], done: false };
    if (type === 'which') {
      // as opções erradas vêm primeiro da mesma família (mais difícil), depois das outras
      const fam = CD.families.find(f => f.rules.includes(id)), other = condPool().filter(x => ruleSig(x) !== ruleSig(r));
      const near = shuffle(other.filter(x => fam && fam.rules.includes(x.id))), far = shuffle(other.filter(x => !(fam && fam.rules.includes(x.id))));
      z.opts = shuffle([id].concat(near.concat(far).slice(0, 3).map(x => x.id)));
    }
    ui.cd = z; render();
    if (type === 'build' && r.k) posSpeak([r.name]);
  }
  function cdAfter(ok) {
    const st = PS.cd = Object.assign({ n: 0, ok: 0 }, PS.cd || {}); st.n++; if (ok) st.ok++; save();
    const R = ui.cr, id = ui.cd.id; if (!R) return;
    if (!(id in R.first)) R.first[id] = ok;
    R.queue = R.queue.filter(x => x !== id);
    if (!ok) R.queue.splice(Math.min(2, R.queue.length), 0, id);
  }
  function cdTop() {
    const R = ui.cr;
    let h = '<div class="dq-head"><div class="dq-prog">';
    if (R) { const done = R.total - new Set(R.queue).size; h += '<div class="bar"><i style="width:' + Math.round(100 * done / R.total) + '%"></i></div><span class="small muted">' + done + ' de ' + R.total + ' decorados</span>'; }
    return h + '</div><button class="btn sm" data-act="cdquit">Fechar</button></div>';
  }
  function cdHtml() {
    const z = ui.cd;
    if (z.end) {
      const R = ui.cr, first = Object.keys(R.first).filter(k => R.first[k]).length, miss = Object.keys(R.first).filter(k => !R.first[k]);
      return '<div class="panel dq"><h2 style="margin-top:0">🎉 Rodada completa</h2><p>Você acertou os ' + R.total + ' pratos. De primeira: <b>' + first + ' de ' + R.total + '</b>.</p>' +
        (miss.length ? '<p class="small">Revise estes:</p><div class="cgrid">' + miss.map(id => condCard(CD.rules.find(x => x.id === id))).join('') + '</div>' : '<p>⭐ Sem nenhum erro!</p>') +
        '<div class="drills"><button class="btn primary" data-act="cdround">Nova rodada</button><button class="btn" data-act="deck" data-f="cat:cond">🎴 Flashcards (repetição espaçada)</button><button class="btn" data-act="cdquit">Voltar</button></div></div>';
    }
    const r = CD.rules.find(x => x.id === z.id);
    let h = '<div class="panel dq">' + cdTop();
    if (z.type === 'which') {
      h += '<div class="small muted">De qual prato é este pratinho?</div><div class="cc-pl">' + plates(r, true) + '</div><div class="dq-opts dq-big">' + z.opts.map(id => {
        const o = CD.rules.find(x => x.id === id), right = ruleSig(o) === ruleSig(r), on = z.pick === id;
        return '<button class="dq-o' + (z.done && right ? ' ok' : '') + (z.done && on && !right ? ' no' : '') + '" data-act="cdwhich" data-v="' + id + '"' + (z.done ? ' disabled' : '') + '><b>' + ruleName(o) + '</b></button>';
      }).join('') + '</div>';
      if (z.done) h += '<p><b>' + (z.ok ? '✅ Certo!' : '❌ É ' + esc(r.name)) + '</b></p><div class="comp">' + compText(r) + '</div>' + (r.hook ? '<p class="hookp">🧠 ' + esc(r.hook) + '</p>' : '') + '<button class="btn primary" data-act="cdnext">Próximo</button>';
    } else {
      const wd = ruleDishes(r), ws = ruleSauces(r);
      const cls = (on, right) => (on ? ' on' : '') + (z.done && right ? ' ok' : '') + (z.done && on && !right ? ' no' : '') + (z.done && right && !on ? ' miss' : '');
      h += '<div class="small muted">Monte o pratinho de</div><div class="dq-title"><b class="jp dq-name">' + ruleName(r) + '</b>' + (r.k ? '<button class="btn sm" data-act="dsay" data-s="' + esc(r.name) + '">🔊</button>' : '') + '</div><div class="small muted">' + esc(r.pt) + '</div>';
      h += '<div class="dq-row"><span class="dq-k">Pratinho</span><div class="dq-opts">' + Object.keys(CD.dishes).map(k => '<button class="dq-o' + cls(z.dishes.includes(k), wd.includes(k)) + '" data-act="cdpick" data-g="dishes" data-v="' + k + '"' + (z.done ? ' disabled' : '') + '>' + plateSvg(k, [], 34) + esc(CD.dishes[k].t) + '</button>').join('') + '</div></div>';
      h += '<div class="dq-row"><span class="dq-k">O que vai</span><div class="dq-opts">' + Object.keys(CD.sauces).map(k => '<button class="dq-o' + cls(z.sauces.includes(k), ws.includes(k)) + '" data-act="cdpick" data-g="sauces" data-v="' + k + '"' + (z.done ? ' disabled' : '') + '><i class="dot" style="background:' + CD.sauces[k].c + '"></i>' + sauceName(k) + '</button>').join('') + '</div></div>';
      h += '<p class="small muted">Pode marcar mais de um. Alguns pratos levam dois pratinhos.</p>';
      if (!z.done) h += '<button class="btn primary" data-act="cdcheck"' + (z.dishes.length && z.sauces.length ? '' : ' disabled') + '>Conferir</button>';
      else h += '<p><b>' + (z.ok ? '✅ Certo!' : '❌ Veja o certo:') + '</b> <span class="small muted">verde = certo, vermelho = sobrou, tracejado = faltou</span></p>' + condCard(r) + '<button class="btn primary" data-act="cdnext">Próximo</button>';
    }
    const st = PS.cd || { n: 0, ok: 0 };
    return h + '<p class="small muted">Total de treinos: ' + st.n + ' · certos: ' + st.ok + '</p></div>';
  }
  function renderCond() {
    if (!CD) return '<p class="muted">Dados não encontrados (cond.js).</p>';
    if (ui.cd) return cdHtml();
    const fc = cards.filter(c => c.cond), due = dueCards(fc).length, seen = fc.filter(c => S[c.id] && S[c.id].r > 0).length;
    let h = '<div class="panel"><h2 style="margin-top:0">🥢 Molhos: os pratinhos dos pratos</h2><p>Alguns pratos vão para a mesa com um pratinho de molho ou tempero. A folha da loja diz <b>qual pratinho</b> e <b>o que vai em cada divisão</b>.</p>' +
      '<div class="drills"><button class="btn primary" data-act="cdround">🎯 Rodada: decorar os ' + condPool().length + ' pratos</button><button class="btn" data-act="deck" data-f="cat:cond">🎴 Flashcards · ' + due + ' p/ revisar · ' + seen + '/' + fc.length + ' vistos</button></div>' +
      '<p class="small muted">Na rodada, o que você errar volta depois de 2 pratos, até acertar todos. Os flashcards entram nas revisões do Estudar e voltam nos dias certos para não esquecer.</p>' +
      '<h3>Ao pôr na mesa</h3>' + CD.phrases.map(p => '<div class="cc-say"><button class="btn sm" data-act="dsay" data-s="' + esc(p[0]) + '">🔊</button><span><b class="jp">' + esc(p[0]) + '</b><br><span class="small muted">' + esc(p[1]) + ' · ' + esc(p[2]) + '</span></span></div>').join('') +
      '<p class="small muted">' + esc(CD.en) + '</p></div>';
    h += famHtml();
    h += '<div class="panel"><h3 style="margin-top:0">Os pratinhos</h3><div class="cc-legend">' + Object.keys(CD.dishes).map(k => '<div>' + dishFig(k, [], k === 'rect3' ? 120 : k === 'kozara' || k === 'yaku' ? 64 : 100) + '<div class="small muted">' + esc(CD.dishes[k].pt) + '</div></div>').join('') + '</div>' +
      '<h3>O que vai neles</h3><div>' + Object.keys(CD.sauces).map(sauceChip).join('') + '</div></div>';
    h += '<h2>Prato por prato</h2><div class="cgrid">' + CD.rules.map(condCard).join('') + '</div>';
    return h;
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
    const v = ui.tab === 'study' ? renderStudy() : ui.tab === 'prep' ? renderPrep() : ui.tab === 'pos' ? renderPos() : ui.tab === 'drinks' ? renderDrinks() : ui.tab === 'cond' ? renderCond() : ui.tab === 'menu' ? renderMenu() : ui.tab === 'kanji' ? renderKanji() : ui.tab === 'quiz' ? renderQuiz() : renderMore();
    $('#view').innerHTML = v;
    document.body.classList.toggle('wide', ui.tab === 'pos' && !!ui.pos && !ui.pos.res);
    if (ui.tab === 'pos' && ui.pos) {
      [['hintSel', 'blink'], ['badSel', 'bad']].forEach(([k, cls]) => { const s = ui.pos[k]; const el = s && $(s); if (el) { el.classList.add(cls); if (cls === 'blink') el.scrollIntoView({ block: 'nearest' }); } });
    }
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
    cards.filter(c => !c.kanji && !c.cond && (!onlyVocab || c.kind === 'vocab')).forEach(c => {
      const p = plain(c.jp);
      if (/[A-Za-z0-9（）()\s、〜]/.test(p) || seen.has(p)) return;
      seen.add(p); out.push(c);
    });
    return out;
  }

  /* ---------- eventos ---------- */
  const ACT = {
    tab(t) { ui.tab = t.dataset.tab; closeAll(); window.scrollTo(0, 0); render(); },
    deck(t) { if (ui.tab === 'cond') { ui.cd = null; ui.cr = null; } startSession(t.dataset.f); window.scrollTo(0, 0); },
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
    posgo(t) { ctxGet(); posStart(t.dataset.kind, +t.dataset.lv); window.scrollTo(0, 0); },
    posquit() { posSrcs.forEach(s => { try { s.stop(); } catch (e) { } }); ui.pos = null; render(); },
    posnext() { const z = ui.pos; posStart(z.kind, z.level); window.scrollTo(0, 0); },
    posplay() { const z = ui.pos; if (z && z.ord) posSpeak(posSeq(z.ord)); },
    postext() { const z = ui.pos; z.showText = !z.showText; z.hintSel = z.badSel = null; render(); },
    posnoop() { toast('Não usado no jogo.'); },
    poshint() { const z = ui.pos; const sel = posTarget(z); if (!sel) return; z.hints++; z.badSel = null; z.hintSel = sel; render(); setTimeout(() => { if (ui.pos === z && z.hintSel === sel) { z.hintSel = null; const el = $(sel); if (el) el.classList.remove('blink'); } }, 2600); },
    postable(t) {
      const z = ui.pos; z.hintSel = z.badSel = null;
      const tb = t.dataset.t;
      if (z.ord && tb !== z.ord.table) { z.errs++; z.badSel = '[data-act="postable"][data-t="' + tb + '"]'; toast('Mesa errada. Ouça de novo (🔊).'); render(); return; }
      if (z.table && z.table !== tb) z.lines = [];
      z.table = tb; z.screen = 'cats'; render();
    },
    poscat(t) {
      const z = ui.pos, c = PO.cats[+t.dataset.c]; z.hintSel = z.badSel = null;
      if (c.empty) { toast('Categoria vazia.'); return; }
      z.screen = 'items'; z.cat = +t.dataset.c; render();
    },
    positem(t) {
      const z = ui.pos, x = POSK[t.dataset.k]; z.hintSel = z.badSel = null;
      if (PO.cats[x.ci].locked) { z.locked++; z.badSel = '[data-act="positem"][data-k="' + x.key + '"]'; toast('紐付け触らない: não mexa nesta categoria.'); render(); return; }
      const l = z.lines.find(y => y.key === x.key);
      if (l) l.n++; else z.lines.push({ key: x.key, n: 1 });
      z.seq.push(x.key); render();
    },
    posminus(t) {
      const z = ui.pos, l = z.lines.find(y => y.key === t.dataset.k); z.hintSel = z.badSel = null;
      if (!l) return; l.n--; if (l.n <= 0) z.lines = z.lines.filter(y => y !== l); render();
    },
    posback() { const z = ui.pos; z.hintSel = z.badSel = null; z.screen = z.screen === 'items' ? 'cats' : 'tables'; render(); },
    postables() { const z = ui.pos; z.hintSel = z.badSel = null; z.screen = 'tables'; render(); },
    posreg() {
      const z = ui.pos; z.hintSel = z.badSel = null;
      if (!z.table) { toast('Escolha a mesa primeiro.'); return; }
      if (!z.lines.length) { toast('Nada para registrar.'); return; }
      if (!z.ord) { toast('Registrado (modo livre).'); z.lines = []; z.seq = []; z.screen = 'tables'; z.table = null; render(); return; }
      z.res = posEvaluate(z); render(); window.scrollTo(0, 0);
    },
    dose(t) { t.classList.toggle('shown'); },
    dsay(t) { ctxGet(); posSpeak([t.dataset.s]); },
    dqnext() { ctxGet(); dqNew(); window.scrollTo(0, 0); },
    dqquit() { ui.dq = null; render(); },
    dqpick(t) { const z = ui.dq; if (!z || z.done) return; const k = t.dataset.k, v = t.dataset.v; z.sel[k] = k === 'glass' ? +v : k === 'ice' ? v === 'true' : v; render(); },
    cdnext() { ctxGet(); cdNew(); window.scrollTo(0, 0); },
    cdround() { ctxGet(); cdRound(); window.scrollTo(0, 0); },
    cdquit() { ui.cd = null; ui.cr = null; render(); },
    cdwhich(t) {
      const z = ui.cd; if (!z || z.done) return;
      const r = CD.rules.find(x => x.id === z.id), o = CD.rules.find(x => x.id === t.dataset.v);
      z.pick = o.id; z.done = true; z.ok = ruleSig(o) === ruleSig(r); cdAfter(z.ok); render();
    },
    cdpick(t) { const z = ui.cd; if (!z || z.done) return; const a = z[t.dataset.g], v = t.dataset.v, i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); render(); },
    cdcheck() {
      const z = ui.cd; if (!z || z.done) return;
      const r = CD.rules.find(x => x.id === z.id), same = (a, b) => a.length === b.length && a.every(x => b.includes(x));
      z.done = true; z.ok = same(z.dishes, ruleDishes(r)) && same(z.sauces, ruleSauces(r));
      cdAfter(z.ok); render(); if (r.say) posSpeak([r.say[0]]);
    },
    dqcheck() {
      const z = ui.dq, d = DR.drinks.find(x => x.id === z.id); if (!z || z.done) return;
      z.done = true; const st = PS.dq = Object.assign({ n: 0, ok: 0 }, PS.dq || {}); st.n++;
      if (z.sel.glass === d.glass && z.sel.ice === d.ice && z.sel.alc === d.alc && z.sel.mix === d.mix) st.ok++;
      save(); render();
    },
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
    if (k === 'drinkQuiz') render();
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
  window.YM = { cards, byId, toRomaji, ruby, plain, reading, nextState, S: () => S, AUD, posNewOrder, posSeq, POSK };
})();
