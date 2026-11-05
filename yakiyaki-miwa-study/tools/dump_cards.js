// Lista todas as cartas (mesmos ids do app) em JSON: node tools/dump_cards.js > cards.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['data.js', 'kanji.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
const M = ctx.window.MENU, K = ctx.window.KANJI;
const plain = m => m.replace(/\{([^|{}]+)\|([^{}]+)\}/g, '$1');
const reading = m => m.replace(/\{([^|{}]+)\|([^{}]+)\}/g, '$2');
const out = [];
for (const key of Object.keys(M.ING)) out.push({ id: 'ing:' + key, plain: plain(M.ING[key][0]), reading: reading(M.ING[key][0]) });
for (const it of M.ITEMS) out.push({ id: it.cat + ':' + plain(it.jp), plain: plain(it.jp), reading: reading(it.jp) });
for (const k of Object.keys(K)) {
  const on = (K[k][0] || '').split('、')[0], kun = (K[k][1] || '').split('、')[0].replace(/[.\-]/g, '');
  out.push({ id: 'kanji:' + k, kanji: true, plain: [on, kun].filter(Boolean).join('、'), reading: [on, kun].filter(Boolean).join('、') });
}
process.stdout.write(JSON.stringify(out));
