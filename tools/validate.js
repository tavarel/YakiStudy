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
console.log(errors ? `\n${errors} erro(s)` : '\nOK');
process.exit(errors ? 1 : 0);
