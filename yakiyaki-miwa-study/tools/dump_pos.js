// Lista as falas do caixa e da seção Molhos: node tools/dump_pos.js > pos_clips.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'pos.js'), 'utf8'), ctx);
const P = ctx.window.POS, out = new Map();
const add = (t, k) => { if (t && !out.has(t)) out.set(t, k || t); };
Object.values(P.tableSay).forEach(([t, k]) => add(k, k));
P.say.qty.forEach(x => x && add(x[0], x[1]));
add(P.say.uber[0], P.say.uber[1]); add(P.say.to[0], P.say.to[1]);
P.cats.forEach(c => c.items.forEach(it => {
  const f = it[2] || '0';
  if ((/[123]/.test(f[0]) || /[ut]/.test(f)) && it[3]) add(it[3], it[4]);
}));
const cp = path.join(__dirname, '..', 'cond.js');
if (fs.existsSync(cp)) {
  vm.runInContext(fs.readFileSync(cp, 'utf8'), ctx);
  const C = ctx.window.COND;
  C.rules.forEach(r => r.say && add(r.say[0], r.say[1]));
  C.phrases.forEach(p => add(p[0], p[1]));
}
process.stdout.write(JSON.stringify([...out].map(([text, kana]) => ({ text, kana }))));
