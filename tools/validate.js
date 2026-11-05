// Valida os dados: node tools/validate.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['data.js', 'kanji.js']) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
}
const { MENU, KANJI } = ctx.window;
const KANA = /^[぀-ゟ゠-ヿー・]+$/;
const isKanji = c => c >= "\u4e00" && c <= "\u9fff";
let errors = 0; const err = m => { errors++; console.log('✗', m); };
const rubyRe = /\{([^|}]+)\|([^}]+)\}/g;
const plain = s => s.replace(rubyRe, '$1');
const kana = s => s.replace(rubyRe, '$2');
const ids = new Set(); const kcount = {};
function checkJp(label, jp) {
  if (/[{}|]/.test(jp.replace(rubyRe, ''))) err(`${label}: markup quebrado → ${jp}`);
  let m; rubyRe.lastIndex = 0;
  while ((m = rubyRe.exec(jp))) {
    if (!KANA.test(m[2])) err(`${label}: furigana não é kana → ${m[0]}`);
    if (![...m[1]].some(isKanji)) err(`${label}: base sem kanji → ${m[0]}`);
  }
  for (const ch of plain(jp)) if (isKanji(ch)) kcount[ch] = (kcount[ch] || 0) + 1;
  // kanji fora de {}  (sem furigana)
  const outside = jp.replace(rubyRe, '');
  if ([...outside].some(isKanji)) err(`${label}: kanji sem furigana → ${jp}`);
}
const catIds = new Set(MENU.CATS.map(c => c.id));
for (const [k, v] of Object.entries(MENU.ING)) { checkJp('ING ' + k, v[0]); if (!v[1]) err('ING sem pt ' + k); }
for (const it of MENU.ITEMS) {
  const id = it.cat + ':' + plain(it.jp);
  if (ids.has(id)) err('id duplicado ' + id); ids.add(id);
  if (!catIds.has(it.cat)) err('cat inválida ' + it.cat);
  checkJp(id, it.jp);
  for (const g of it.ing || []) if (!g.startsWith('~') && !MENU.ING[g]) err(`${id}: ingrediente desconhecido ${g}`);
  if (it.p && (it.p[1] < it.p[0])) err(`${id}: preço com imposto menor`);
  if (it.p && Math.abs(it.p[0] * 1.1 - it.p[1]) > 1) console.log(`  ! ${id}: ${it.p[0]} → ${it.p[1]} (não é +10%)`);
}
for (const c of MENU.COURSES) for (const t of c.items) checkJp('curso ' + c.name, t.replace(/ ×\d| or |（.*?）/g, ' '));
const all = Object.keys(kcount);
console.log('itens:', MENU.ITEMS.length, '| ingredientes:', Object.keys(MENU.ING).length, '| kanji distintos:', all.length);
if (KANJI) {
  const miss = all.filter(k => !KANJI[k]);
  if (miss.length) err('kanji sem entrada (' + miss.length + '): ' + miss.join(''));
  for (const [k, v] of Object.entries(KANJI)) {
    if (!kcount[k]) console.log('  ! kanji não usado:', k);
    if (v.length < 3) err('kanji incompleto ' + k);
    if (v[0] && !KANA.test(v[0].replace(/[.\s、\-]/g, ''))) err('on inválido ' + k + ' ' + v[0]);
    if (v[1] && !KANA.test(v[1].replace(/[.\s、\-]/g, ''))) err('kun inválido ' + k + ' ' + v[1]);
  }
} else console.log('KANJI ausente. Kanji usados:\n' + all.sort((a, b) => kcount[b] - kcount[a]).join(''));
// vídeos, preparação e áudio
const V = MENU.VIDEOS || {};
for (const it of MENU.ITEMS) for (const k of it.vid || []) if (!V[k]) err('vídeo inexistente ' + k + ' em ' + it.jp);
for (const [cat, ks] of Object.entries(MENU.CATVID || {})) for (const k of ks) if (!V[k]) err('vídeo inexistente ' + k + ' em CATVID.' + cat);
const prepPath = path.join(__dirname, '..', 'prep.js');
if (fs.existsSync(prepPath)) {
  vm.runInContext(fs.readFileSync(prepPath, 'utf8'), ctx);
  const PR = ctx.window.PREP;
  for (const m of PR.modules) {
    for (const k of m.videos) if (!V[k]) err('vídeo inexistente ' + k + ' no módulo ' + m.id);
    for (const d of m.decks) if (!catIds.has(d)) err('baralho inexistente ' + d + ' no módulo ' + m.id);
  }
  for (const d of PR.plan) for (const id of d.m) if (!PR.modules.find(m => m.id === id)) err('módulo inexistente ' + id + ' no plano');
}
const audPath = path.join(__dirname, '..', 'audio', 'index.js');
if (fs.existsSync(audPath)) {
  vm.runInContext(fs.readFileSync(audPath, 'utf8'), ctx);
  const A = ctx.window.AUDIO || {};
  const missing = MENU.ITEMS.filter(it => !A[it.cat + ':' + plain(it.jp)]).length;
  const NP = ctx.window.AUDIO_PACKS || 0;
  for (let k = 0; k < NP; k++) if (!fs.existsSync(path.join(__dirname, '..', 'audio', 'p' + k + '.bin'))) err('pacote de áudio faltando: audio/p' + k + '.bin');
  for (const a of Object.values(A)) if (!(a.k < NP)) { err('áudio aponta para pacote inexistente ' + a.k); break; }
  if (missing) console.log('  ! ' + missing + ' item(ns) sem áudio — rode tools/gen_audio.py');
}
// caixa e drinks
const posPath = path.join(__dirname, '..', 'pos.js');
if (fs.existsSync(posPath)) {
  vm.runInContext(fs.readFileSync(posPath, 'utf8'), ctx);
  const PO = ctx.window.POS;
  const pa = path.join(__dirname, '..', 'audio', 'pos.js');
  if (fs.existsSync(pa)) vm.runInContext(fs.readFileSync(pa, 'utf8'), ctx);
  const PA = ctx.window.POS_AUDIO || {};
  let n = 0, targets = 0, ot = 0;
  for (const c of PO.cats) for (const it of c.items) {
    n++;
    if (typeof it[0] !== 'string' || typeof it[1] !== 'number') err('item do caixa inválido em ' + c.name);
    const f = it[2] || '0';
    if (f.includes('o')) ot++;
    if (/[123]/.test(f[0]) || /[ut]/.test(f)) { targets++; if (!it[3]) err('item sem fala: ' + it[0]); else if (Object.keys(PA).length && !PA[it[3]]) err('item sem áudio: ' + it[3]); }
  }
  if (ot !== 1) err('precisa de exatamente uma お通し');
  for (const t of PO.tables) if (PO.tableSay[t] && Object.keys(PA).length && !PA[PO.tableSay[t][1]]) err('mesa sem áudio ' + t);
  console.log('caixa: ' + PO.cats.length + ' categorias, ' + n + ' botões, ' + targets + ' podem cair no jogo');
}
const PA = ctx.window.POS_AUDIO || {}, hasPA = Object.keys(PA).length > 0;
const posLabels = new Set(ctx.window.POS ? ctx.window.POS.cats.flatMap(c => c.items.map(it => it[0])) : []);
if (ctx.window.POS) ctx.window.POS.say.qty.forEach(q => { if (q && hasPA && !PA[q[0]]) err('quantidade sem áudio: ' + q[0]); });
const drPath = path.join(__dirname, '..', 'drinks.js');
if (fs.existsSync(drPath)) {
  vm.runInContext(fs.readFileSync(drPath, 'utf8'), ctx);
  const D = ctx.window.DRINKS;
  if (!D || !D.drinks || !D.drinks.length) err('drinks.js vazio');
  else {
    for (const d of D.drinks) {
      if (!D.glasses[d.glass - 1]) err('bebida com copo inválido: ' + d.id);
      if (!D.alc[d.alc]) err('bebida com álcool inválido: ' + d.id);
      if (!D.mix[d.mix]) err('bebida com complemento inválido: ' + d.id);
      if (!D.groups.some(g => g[0] === d.group)) err('bebida sem grupo: ' + d.id);
      const tot = (d.layers || []).reduce((a, l) => a + l[1], 0); if (tot > 1.001) err('camadas passam de 100%: ' + d.id);
      if (!d.nopos && !posLabels.has(d.pos)) err('bebida não existe no caixa: ' + d.pos);
      if (d.say && hasPA && !PA[d.say]) err('bebida sem áudio: ' + d.say);
    }
    console.log('drinks: ' + D.drinks.length + ' cartões');
  }
}
const cdPath = path.join(__dirname, '..', 'cond.js');
if (fs.existsSync(cdPath)) {
  vm.runInContext(fs.readFileSync(cdPath, 'utf8'), ctx);
  const C = ctx.window.COND;
  if (!C || !C.rules || !C.rules.length) err('cond.js vazio');
  else {
    for (const r of C.rules) {
      const dsh = C.dishes[r.dish];
      if (!dsh) { err('pratinho inválido: ' + r.id); continue; }
      if (r.parts.length !== dsh.parts) err('número de divisões errado: ' + r.id);
      r.parts.flat().forEach(k => { if (!C.sauces[k]) err('condimento inválido ' + k + ' em ' + r.id); });
      (r.extra || []).forEach(x => { if (!C.dishes[x.dish]) err('pratinho extra inválido: ' + r.id); x.parts.flat().forEach(k => { if (!C.sauces[k]) err('condimento inválido ' + k + ' em ' + r.id); }); });
      (r.pos || []).forEach(l => { if (!posLabels.has(l)) err('prato não existe no caixa: ' + l + ' (' + r.id + ')'); });
      if (r.say && hasPA && !PA[r.say[0]]) err('frase sem áudio: ' + r.say[0]);
      if (r.k && hasPA && !PA[r.name]) err('nome sem áudio: ' + r.name);
    }
    (C.families || []).forEach(f => f.rules.forEach(id => { if (!C.rules.some(r => r.id === id)) err('família com prato inválido: ' + id); }));
    (C.phrases || []).forEach(p => { if (hasPA && !PA[p[0]]) err('frase sem áudio: ' + p[0]); });
    console.log('molhos: ' + C.rules.length + ' regras');
  }
}
console.log(errors ? `\n${errors} erro(s)` : '\nOK');
process.exit(errors ? 1 : 0);
