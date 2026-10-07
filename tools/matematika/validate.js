// Валидатор контента: загружает файлы платформы и проверяет схему, формулы и генераторы задач.
// Использование: node validate.js SITE_DIR   (первая строка вывода — JSON со статистикой)
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = process.argv[2]; const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => !f.startsWith('katex/'));
const katex = require(path.resolve(dir, 'katex/katex.min.js'));
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

// ——— генераторы ———
const numStr = x => { const v = Math.round(x * 1e6) / 1e6; return String(v).replace('.', ','); };
let gens = 0;
for (const d of P.drills) {
  if (!d.id || typeof d.gen !== 'function') { err.push('генератор без id/gen'); continue; }
  if (d.lesson && !ids.has(d.lesson)) err.push('генератор ' + d.id + ' → нет урока ' + d.lesson);
  if (!P.config.courses.some(c => c.n === d.course)) err.push('генератор ' + d.id + ' без курса');
  const nl = (d.levels || [1, 2, 3]).length; const seen = new Set(); let tex1 = 0;
  for (let lv = 1; lv <= nl; lv++) for (let k = 0; k < 150; k++) {
    const t = E.genTask(d, lv); gens++;
    if (!t) { err.push(d.id + ' L' + lv + ': gen вернул пусто'); break; }
    seen.add(t.q + JSON.stringify(t.a || t.opts));
    if (typeof t.q !== 'string') { err.push(d.id + ': q не строка'); break; }
    if (tex1 < 40) { tex1++; deep([t.q, t.sol, t.hint, t.show, t.opts, t.unit], 'генератор ' + d.id); }
    if (t.opts) { if (t.opts.length < 2 || new Set(t.opts.map(String)).size !== t.opts.length) { err.push(d.id + ' L' + lv + ': повтор вариантов ' + JSON.stringify(t.opts)); break; } continue; }
    let probe;
    if (typeof t.a === 'number') { if (!isFinite(t.a)) { err.push(d.id + ': ответ не число ' + t.q); break; } probe = numStr(t.a); }
    else if (Array.isArray(t.a)) { if (t.a.some(x => !isFinite(x))) { err.push(d.id + ': ответ не число ' + t.q); break; } probe = t.a.length ? t.a.map(numStr).join('; ') : 'нет'; }
    else if (typeof t.a === 'string') probe = t.a;
    else { err.push(d.id + ': нет ответа ' + t.q); break; }
    if (!E.checkAnswer(t, probe)) { err.push(d.id + ' L' + lv + ': собственный ответ не принят: ' + probe + ' | ' + t.q); break; }
    if (typeof t.a === 'number' && Math.abs(t.a) > 1e-9 && E.checkAnswer(t, numStr(t.a + Math.max(0.5, Math.abs(t.a) * 0.1)))) { err.push(d.id + ': принимает неверный ответ | ' + t.q); break; }
  }
  if (seen.size < 8) warn.push('генератор ' + d.id + ' даёт мало разных задач: ' + seen.size);
}
const lids = new Set(); for (const l of P.labs) { if (lids.has(l.id)) err.push('дубль лаборатории ' + l.id); lids.add(l.id); if (typeof l.render !== 'function') err.push('лаборатория без render ' + l.id); if (l.lesson && !ids.has(l.lesson)) err.push('лаборатория ' + l.id + ' → нет урока ' + l.lesson); }

// ——— проверка парсера ответов ———
const T = (a, raw, extra = {}) => E.checkAnswer(Object.assign({ a }, extra), raw);
[[0.75, '3/4'], [0.75, '0,75'], [-2, '−2'], [2 * Math.sqrt(3), '2√3'], [Math.PI / 2, 'π/2'], [8, '2^3'], [[2, -3], '-3; 2'], [[1, 2], '(1; 2)', { ordered: true }], [0.5, '1:2'], [Math.sqrt(2) / 2, '√2/2'], [6, '2(1+2)'], [7/3, '2 1/3'], [-7/3, '−2 1/3']].forEach(([a, r, x]) => { if (!T(a, r, x)) err.push('парсер не принял ' + r); });
[[0.75, '3/5'], [[1, 2], '(2; 1)', { ordered: true }]].forEach(([a, r, x]) => { if (T(a, r, x)) err.push('парсер принял неверное ' + r); });

const stat = { lessons: P.lessons.length, questions: q, cards: c + P.glossary.length, events: e, terms: P.glossary.length, works: P.works.length, heroes: P.heroes.length, authors: P.authors.length, places: P.places.length, testItems: ti, drills: P.drills.length, labs: P.labs.length, formulas: texCount, generated: gens, perCourse: P.config.courses.map(c => P.lessons.filter(l => l.course === c.n).length) };
console.log(JSON.stringify(stat));
if (warn.length) console.log('ПРЕДУПРЕЖДЕНИЯ:\n' + warn.join('\n'));
if (err.length) { console.log('ОШИБКИ (' + err.length + '):\n' + [...new Set(err)].slice(0, 80).join('\n')); process.exit(1); } else console.log('OK');
