// Валидатор контента: загружает файлы платформы и проверяет схему, формулы и генераторы задач.
// Использование: node validate.js SITE_DIR   (первая строка вывода — JSON со статистикой)
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = process.argv[2]; const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => !f.startsWith('katex/') && f !== 'three.min.js');
const katex = { renderToString() { return ''; } };   // формул в этой платформе нет
const noop = () => {};
const ctx = { console, document: { addEventListener: noop, documentElement: { setAttribute: noop, removeAttribute: noop } }, localStorage: { getItem: () => null, setItem: noop }, matchMedia: () => ({ matches: false }), location: { hash: '' }, addEventListener: noop };
ctx.window = ctx; vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
const P = ctx.PLATFORM, E = ctx.EduEngine; const err = []; const ids = new Set();
const warn = [];

// ——— формулы ———
let texCount = 0;
const CMDS = /(^|[^\\a-zA-Z])(frac|sqrt|cdot|times|alpha|beta|gamma|pi|sin|cos|tan|cot|log|lg|ln|lim|int|infty|leq|geq|neq|pm|Rightarrow|text|left|right|vec|angle|circ|over|dfrac|approx|in|cup|cap|emptyset|mathbb|overline|triangle|parallel|perp|binom|sum)(?![a-zA-Z])/;
function checkTex(s, where) {
  if (typeof s !== 'string') return;
  const parts = s.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  if ((s.match(/\$/g) || []).length % 2) err.push('нечётное число $ в ' + where + ': ' + s.slice(0, 80));
  parts.forEach((p, i) => {
    if (!(i % 2)) return;
    const t = p.replace(/^\$\$?|\$\$?$/g, '');
    texCount++;
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\t\n\r]/.test(t)) err.push('управляющий символ в формуле (забыт двойной \\\\?) ' + where + ': ' + JSON.stringify(t));
    const m = t.replace(/\\(text|mathrm|operatorname)\{[^}]*\}/g, '').match(CMDS); if (m) err.push('команда без \\ в формуле ' + where + ': «' + m[2] + '» в ' + JSON.stringify(t));
    try { katex.renderToString(t, { throwOnError: true, strict: c => c === 'unicodeTextInMathMode' ? 'error' : 'ignore' }); } catch (e) { err.push('KaTeX ' + where + ': ' + e.message.slice(0, 120)); }
  });
}
const deep = (o, where) => { if (typeof o === 'string') checkTex(o, where); else if (Array.isArray(o)) o.forEach((x, i) => deep(x, where)); else if (o && typeof o === 'object') for (const k in o) if (typeof o[k] !== 'function') deep(o[k], where + '.' + k); };

let q = 0, c = 0, e = 0;
for (const l of P.lessons) {
  if (ids.has(l.id)) err.push('дубль id ' + l.id); ids.add(l.id);
  if (!l.body || l.body.length < 300) err.push('короткий урок ' + l.id);
  (l.quiz || []).forEach((x, i) => { q++; if (!Array.isArray(x[1]) || x[1].length < 2) err.push(l.id + ' q' + i + ' мало вариантов'); if (!(x[2] >= 0 && x[2] < x[1].length)) err.push(l.id + ' q' + i + ' индекс ответа'); if (new Set(x[1]).size !== x[1].length) err.push(l.id + ' q' + i + ' повтор вариантов'); });
  c += (l.cards || []).length; e += (l.events || []).length;
  if (!(l.quiz || []).length) err.push('нет вопросов ' + l.id);
  if ((l.quiz || []).length < 5) warn.push('мало вопросов (' + (l.quiz || []).length + ') ' + l.id);
  if ((l.cards || []).length < 4) warn.push('мало карточек ' + l.id);
  deep([l.title, l.sub, l.body, l.facts, l.cards, l.quiz, l.events], 'урок ' + l.id);
}
const drillIds = new Set(P.drills.map(d => d.id)), labIds = new Set(P.labs.map(d => d.id));
for (const l of P.lessons) {
  for (const m of l.body.matchAll(/^@drill\s+(\S+)/gm)) if (!drillIds.has(m[1])) err.push('нет генератора ' + m[1] + ' (' + l.id + ')');
  for (const m of l.body.matchAll(/^@lab\s+(\S+)/gm)) if (!labIds.has(m[1])) err.push('нет лаборатории ' + m[1] + ' (' + l.id + ')');
}
const bad = s => [...String(s).matchAll(/\[\[(.+?)\]\]/g)].map(m => m[1]);
for (const l of P.lessons) for (const t of bad(l.body)) if (!P.glossary.some(g => g[0].toLowerCase().startsWith(t.split('|')[0].toLowerCase().slice(0, 5)))) err.push('нет термина в словаре: ' + t + ' (' + l.id + ')');
for (const a of P.authors) if (a.lesson && !ids.has(a.lesson)) err.push('персона → нет урока ' + a.lesson);
for (const p of P.places) if (p.lesson && !ids.has(p.lesson)) err.push('место → нет урока ' + p.lesson);
let ti = 0; for (const k in P.tests) for (const it of P.tests[k].items) { ti++; if (it.lesson && !ids.has(it.lesson)) err.push('тест → нет урока ' + it.lesson); deep([it.q, it.a], 'тест ' + k + '#' + ti); }
if (P.heroes.length) { const heroWorks = new Set(P.heroes.map(h => h[1])); if (heroWorks.size < 4) err.push('мало категорий у «героев»'); }
if (P.works.length && new Set(P.works.map(w => w[1])).size < 6) err.push('мало уникальных правых частей у пар');
deep([P.glossary, P.works, P.heroes, P.authors.map(a => a.note), P.about], 'справочник');
const gl = new Set(); for (const g of P.glossary) { if (gl.has(g[0])) err.push('дубль термина ' + g[0]); gl.add(g[0]); }

let gens = 0;
const stat = { lessons: P.lessons.length, questions: q, cards: c + P.glossary.length, events: e, terms: P.glossary.length, works: P.works.length, heroes: P.heroes.length, authors: P.authors.length, places: P.places.length, testItems: ti, drills: P.drills.length, labs: P.labs.filter(l => !l.embed).length, formulas: texCount, generated: gens, perCourse: P.config.courses.map(c => P.lessons.filter(l => l.course === c.n).length) };
console.log(JSON.stringify(stat));
if (warn.length) console.log('ПРЕДУПРЕЖДЕНИЯ:\n' + warn.join('\n'));
if (err.length) { console.log('ОШИБКИ (' + err.length + '):\n' + [...new Set(err)].slice(0, 80).join('\n')); process.exit(1); } else console.log('OK');
