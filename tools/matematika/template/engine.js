/* EduEngine — универсальный движок учебной платформы (SPA на hash-роутинге, без сборки).
   Данные: window.PLATFORM (config.js + файлы контента). Прогресс: localStorage.
   Расширения: формулы $…$ (KaTeX, если подключён), генераторы задач (PLATFORM.drills),
   интерактивные лаборатории (PLATFORM.labs), подписи тренажёров из config.labels. */
(function () {
  'use strict';
  const P = window.PLATFORM, C = P.config;
  P.drills = P.drills || []; P.labs = P.labs || [];
  const DEF = { hero: { title: C.name, lead: '' }, monogram: (C.name || '?')[0], searchHint: 'Введите слово для поиска', places: { route: 'places', title: 'Карта', lead: 'Нажмите точку на схеме.', teaser: '' }, people: { title: 'Персоналии', one: 'Персона', teaser: 'имён с краткими справками.' } };
  for (const k in DEF) C[k] = typeof DEF[k] === 'object' ? Object.assign({}, DEF[k], C[k] || {}) : (C[k] || DEF[k]);
  /* Подписи, зависящие от предмета. Значения по умолчанию — литературные; проект переопределяет их в config.labels. */
  const L = (() => {
    const d = {
      tests: { title: 'Тесты преподавателя', short: 'Тесты', desc: 'Все вопросы итоговых тестов с образцами ответов и самооценкой.', lead: 'Вопросы итоговых тестов по каждому курсу. Сначала ответьте сами (устно или в поле), затем откройте образец и честно оцените себя — так считается готовность.', ready: 'готовность по тесту преподавателя', ach: 'Готовность 80%+ по тесту преподавателя' },
      pairs: { title: 'Автор и произведение', lead: 'Нажмите произведение, затем его автора.', desc: 'Соедините {n} произведений с авторами.', q1: '«', q2: '»', item: 'Произведение', ico: '🔗', achName: 'Сводник', achDesc: 'Собрать все пары «автор — произведение»' },
      heroes: { title: 'Чей это герой?', desc: '{n} персонажей — угадайте произведение.', q1: '«', q2: '»', ico: '🎭', achName: 'Театрал', achDesc: 'Угадать 10 героев подряд' },
      chrono: { title: 'Хронология', desc: 'Расставьте события в правильном порядке.', ico: '⏳', achName: 'Летописец', achDesc: 'Расставить хронологию без ошибок' },
      timeline: { title: 'Лента времени', desc: '{n} событий из всех уроков в хронологическом порядке.' },
      allDone: 'Вся летопись', lessonWord: 'урок', notFoundHint: 'Ничего не найдено. Попробуйте другое слово.',
      drills: { title: 'Задачник', desc: 'Бесконечные задачи из генератора: три уровня, проверка и разбор.', ph: 'Ответ' },
      labs: { title: 'Лаборатория', desc: 'Интерактивные модели: двигайте ползунки и смотрите, что меняется.' }
    };
    const u = C.labels || {};
    for (const k in u) d[k] = (typeof d[k] === 'object' && typeof u[k] === 'object') ? Object.assign({}, d[k], u[k]) : u[k];
    return d;
  })();
  const PL = C.places.route;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let rnd = Math.random;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const today = () => new Date().toISOString().slice(0, 10);
  const plural = (n, f) => { const m10 = n % 10, m100 = n % 100; return f[(m10 === 1 && m100 !== 11) ? 0 : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) ? 1 : 2]; };
  const fill = (s, n) => String(s).replace('{n}', n);

  /* ——— Хранилище ——— */
  const KEY = C.storageKey;
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const S = Object.assign({ xp: 0, done: {}, quiz: {}, cards: {}, ach: {}, tests: {}, best: {}, days: [], visits: {}, last: null, theme: null, drills: {}, daily: {}, lv: {}, calc: { hist: [], deg: true } }, load());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* приватный режим */ } };

  /* ——— Подготовка данных ——— */
  const courses = C.courses;
  const courseOf = n => courses.find(c => c.n === n);
  const lessonsOf = n => P.lessons.filter(l => l.course === n);
  const byId = {}; P.lessons.forEach((l, i) => { byId[l.id] = l; l.idx = i; });
  const drillById = {}; P.drills.forEach(d => { drillById[d.id] = d; });
  const labById = {}; P.labs.forEach(d => { labById[d.id] = d; });
  const Q = []; // общий банк вопросов
  P.lessons.forEach(l => (l.quiz || []).forEach((q, i) => Q.push({ id: l.id + '#' + i, q: q[0], a: q[1], c: q[2], e: q[3] || '', lesson: l.id, course: l.course })));
  const CARDS = [];
  P.lessons.forEach(l => (l.cards || []).forEach((c, i) => CARDS.push({ id: l.id + '#' + i, f: c[0], b: c[1], lesson: l.id, course: l.course })));
  P.glossary.forEach((g, i) => CARDS.push({ id: 'gl#' + i, f: g[0], b: g[1], lesson: null, course: 0 }));
  const EVENTS = [];
  P.lessons.forEach(l => (l.events || []).forEach(e => EVENTS.push({ y: e[0], label: e[2] || String(e[0]), t: e[1], lesson: l.id, course: l.course })));
  EVENTS.sort((a, b) => a.y - b.y);

  /* ——— Формулы ——— */
  function tex(s, display) {
    if (window.katex) { try { return window.katex.renderToString(s, { throwOnError: false, displayMode: !!display }); } catch (e) { /* ниже — запасной вид */ } }
    return '<code class="tex">' + esc(s) + '</code>';
  }

  /* ——— Мини-разметка уроков ——— */
  function inlineText(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(«])\*(?!\s)(.+?)\*(?=[\s.,;:!?)»]|$)/g, '$1<em>$2</em>')
      .replace(/\[\[(.+?)\]\]/g, (m, t) => '<a href="#/glossary?q=' + encodeURIComponent(t) + '">' + t + '</a>')
      .replace(/\[(.+?)\]\(#(.+?)\)/g, '<a href="#$2">$1</a>');
  }
  function inline(s) {
    return String(s == null ? '' : s).split(/(\$[^$]+\$)/g).map((p, i) => i % 2 ? tex(p.slice(1, -1)) : inlineText(p)).join('');
  }
  // делит строку таблицы по «|», не трогая «|» внутри формул $…$
  function cellsOf(line) {
    const out = []; let cur = '', m = false;
    for (const ch of line) { if (ch === '$') m = !m; if (ch === '|' && !m) { out.push(cur); cur = ''; } else cur += ch; }
    out.push(cur);
    return out.slice(line.startsWith('|') ? 1 : 0, line.endsWith('|') ? -1 : undefined).map(c => c.trim());
  }
  function md(src) {
    const lines = String(src).replace(/\r/g, '').split('\n');
    let out = '', para = [], list = null, table = null;
    const flushP = () => { if (para.length) { out += '<p>' + inline(para.join(' ')) + '</p>'; para = []; } };
    const flushL = () => { if (list) { out += '<' + list.t + '>' + list.items.map(i => '<li>' + inline(i) + '</li>').join('') + '</' + list.t + '>'; list = null; } };
    const flushT = () => { if (table) { const [h, ...r] = table; out += '<div class="tbl-wrap"><table><thead><tr>' + h.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' + r.map(row => '<tr>' + row.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'; table = null; } };
    const flush = () => { flushP(); flushL(); flushT(); };
    for (let raw of lines) {
      const line = raw.trim();
      if (!line) { flush(); continue; }
      let m;
      if ((m = line.match(/^\$\$(.+)\$\$$/))) { flush(); out += '<div class="math-d">' + tex(m[1], true) + '</div>'; continue; }
      if ((m = line.match(/^@lab\s+(\S+)/))) { flush(); out += '<div class="lab-slot" data-lab="' + esc(m[1]) + '"></div>'; continue; }
      if ((m = line.match(/^@drill\s+(\S+)/))) { flush(); const d = drillById[m[1]]; if (d) out += '<a class="drill-link" href="#/drill/' + esc(d.id) + '"><span class="ico">' + esc(d.ico || '✎') + '</span><span><small>' + esc(L.drills.title) + '</small><b>' + esc(d.title) + '</b></span><span class="go">›</span></a>'; continue; }
      if ((m = line.match(/^(#{2,3})\s+(.*)/))) { flush(); out += '<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>'; continue; }
      if ((m = line.match(/^>(!|e|i|\?)\s+(.*)/))) {
        flush();
        if (m[1] === '?') { const [sum, ...rest] = m[2].split(' :: '); out += '<details class="alt"><summary>' + inline(sum) + '</summary><p>' + inline(rest.join(' :: ')) + '</p></details>'; }
        else { const cls = { '!': 'exam', e: 'est', i: 'info' }[m[1]]; const lab = Object.assign({ '!': 'На экзамене: ', e: 'Важно: ', i: '' }, C.calloutLabels || {})[m[1]]; out += '<div class="note ' + cls + '"><strong>' + lab + '</strong>' + inline(m[2]) + '</div>'; }
        continue;
      }
      if (line.startsWith('|')) { flushP(); flushL(); const cells = cellsOf(line); if (cells.every(c => /^:?-+:?$/.test(c))) continue; (table = table || []).push(cells); continue; }
      if ((m = line.match(/^(-|\d+\.)\s+(.*)/))) { flushP(); flushT(); const t = m[1] === '-' ? 'ul' : 'ol'; if (!list || list.t !== t) { flushL(); list = { t, items: [] }; } list.items.push(m[2]); continue; }
      flushL(); flushT(); para.push(line);
    }
    flush();
    return out;
  }
  const strip = s => String(s || '').replace(/\$([^$]+)\$/g, '$1').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}]/g, '');

  /* ——— Опыт, ранги, достижения ——— */
  const rankOf = xp => { let r = C.ranks[0], next = null; for (const x of C.ranks) { if (xp >= x[0]) r = x; else { next = x; break; } } return { name: r[1], min: r[0], next }; };
  function toast(msg, cls) { const t = document.createElement('div'); t.className = 'toast ' + (cls || ''); t.textContent = msg; $('#toasts').appendChild(t); setTimeout(() => t.remove(), 2600); }
  let xpBuf = 0, xpT = null;
  function addXP(n) { if (!n) return; S.xp += n; markDay(); save(); renderChip(); xpBuf += n; clearTimeout(xpT); xpT = setTimeout(() => { toast('+' + xpBuf + ' опыта'); xpBuf = 0; }, 400); checkAch(); }
  function markDay() { const d = today(); if (!S.days.includes(d)) { S.days.push(d); if (S.days.length > 400) S.days.shift(); } }
  function streak() { let n = 0; const d = new Date(); for (;;) { const k = d.toISOString().slice(0, 10); if (S.days.includes(k)) { n++; d.setDate(d.getDate() - 1); } else if (n === 0 && k === today()) { d.setDate(d.getDate() - 1); } else break; } return n; }
  const doneIn = n => lessonsOf(n).filter(l => S.done[l.id]).length;
  const testPct = n => { const t = P.tests[n]; if (!t) return 0; const r = S.tests[n] || {}; const pts = t.items.reduce((s, _, i) => s + (r[i] === 2 ? 1 : r[i] === 1 ? .5 : 0), 0); return Math.round(100 * pts / t.items.length); };
  const correctCount = () => Object.values(S.quiz).filter(Boolean).length;
  const solved = () => S.best.solved || 0;
  const mastered = id => (S.drills[id] && S.drills[id].m) || 0;
  const ACH = [
    ['first', '📖', 'Первая страница', 'Завершить первый урок', () => Object.keys(S.done).length >= 1],
    ['ten', '📚', 'Десять глав', 'Завершить 10 уроков', () => Object.keys(S.done).length >= 10],
    ['half', '🏛', 'Полпути', 'Завершить половину всех уроков', () => Object.keys(S.done).length >= P.lessons.length / 2],
    ['all', '👑', L.allDone, 'Завершить все уроки', () => Object.keys(S.done).length >= P.lessons.length],
    ...courses.map(c => ['course' + c.n, '✦', 'Курс ' + c.roman, 'Пройти все уроки курса «' + c.title + '»', () => doneIn(c.n) === lessonsOf(c.n).length && lessonsOf(c.n).length > 0]),
    ['q50', '🎯', 'Меткий', '50 верных ответов', () => correctCount() >= 50],
    ['q200', '🏹', 'Снайпер', '200 верных ответов', () => correctCount() >= 200],
    ['perfect', '💯', 'Без единой ошибки', 'Пройти тест урока на 100%', () => !!S.ach._perfect],
    ['cards50', '🗂', 'Картотека', 'Повторить 50 карточек', () => (S.best.cardsSeen || 0) >= 50],
    ['cards300', '🧠', 'Долгая память', 'Повторить 300 карточек', () => (S.best.cardsSeen || 0) >= 300],
    ...(EVENTS.length ? [['chrono', L.chrono.ico, L.chrono.achName, L.chrono.achDesc, () => !!S.ach._chrono]] : []),
    ...(P.works.length ? [['pairs', L.pairs.ico, L.pairs.achName, L.pairs.achDesc, () => !!S.ach._pairs]] : []),
    ['blitz', '⚡', 'Скорострел', 'Набрать 15 очков в блице', () => (S.best.blitz || 0) >= 15],
    ...(P.heroes.length ? [['heroes', L.heroes.ico, L.heroes.achName, L.heroes.achDesc, () => (S.best.heroes || 0) >= 10]] : []),
    ['exam', '🎓', 'Экзаменуемый', 'Сдать пробный экзамен на 80%+', () => !!S.ach._exam],
    ['ready', '✅', 'Готов к сдаче', L.tests.ach, () => Object.keys(P.tests).some(n => testPct(n) >= 80)],
    ...(P.drills.length ? [
      ['solve10', '✏️', 'Первые задачи', 'Решить 10 задач в задачнике', () => solved() >= 10],
      ['solve100', '📝', 'Сотня', 'Решить 100 задач', () => solved() >= 100],
      ['solve500', '🏔', 'Пятьсот', 'Решить 500 задач', () => solved() >= 500],
      ['master', '🥇', 'Мастер', 'Освоить любой генератор на 3-м уровне', () => P.drills.some(d => mastered(d.id) >= 3)],
      ['master10', '🏅', 'Многостаночник', 'Освоить 10 разных генераторов', () => P.drills.filter(d => mastered(d.id) >= 1).length >= 10],
      ['sprint', '⏱', 'Спринтер', 'Решить 15 задач в спринте за 60 секунд', () => (S.best.sprint || 0) >= 15],
      ['daily', '☀️', 'Разминка', 'Пройти разминку дня', () => Object.keys(S.daily).length >= 1],
      ['daily7', '📅', 'Режим', 'Пройти разминку 7 разных дней', () => Object.keys(S.daily).length >= 7]
    ] : []),
    ...(P.labs.length ? [['labs', '🔬', 'Экспериментатор', 'Открыть 5 лабораторий', () => Object.keys(S.visits).filter(k => k.startsWith('lab:')).length >= Math.min(5, P.labs.length)]] : []),
    ...(P.places.length ? [['places', '◆', 'Краевед', 'Открыть все места на карте', () => Object.keys(S.visits).filter(k => k.startsWith('pl:')).length >= P.places.length]] : []),
    ['streak3', '🔥', 'Три дня подряд', 'Заниматься 3 дня подряд', () => streak() >= 3],
    ['streak7', '🌋', 'Неделя', 'Заниматься 7 дней подряд', () => streak() >= 7]
  ];
  function checkAch() { for (const [id, ico, name, , fn] of ACH) { if (!S.ach[id] && fn()) { S.ach[id] = today(); save(); toast(ico + ' Достижение: ' + name, 'ach-t'); } } }

  /* ——— Оболочка ——— */
  function renderChip() {
    const r = rankOf(S.xp);
    const el = $('#rankChip'); if (el) el.innerHTML = '<span aria-hidden="true">✦</span><span class="rn">' + esc(r.name) + '</span> <span class="xp">' + S.xp + '</span>';
  }
  function setTheme(t) { S.theme = t; save(); if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
  if (S.theme) document.documentElement.setAttribute('data-theme', S.theme);
  function toggleTheme() { const dark = S.theme ? S.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; setTheme(dark ? 'light' : 'dark'); }

  const main = () => $('#main');
  function mount(html, title) { main().onclick = null; main().innerHTML = html; document.title = (title ? title + ' — ' : '') + C.name; window.scrollTo(0, 0); markNav(); }
  function markNav() { const h = location.hash || '#/'; $$('[data-nav]').forEach(a => { const k = a.getAttribute('data-nav'); const on = k === '#/' ? (h === '#/' || h === '') : h.startsWith(k); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); }
  const cs = n => 'style="--c:' + (courseOf(n) ? courseOf(n).color : 'var(--accent)') + '"';
  const srcBadge = l => { const s = C.sourceLabels[l.src || 'teacher']; return '<span class="badge-src ' + (l.src === 'extra' || l.src === 'mixed' ? 'extra' : '') + '" title="' + esc(s[1]) + '">' + esc(s[0]) + '</span>'; };
  const stars = id => { const m = mastered(id); return '<span class="stars" title="Освоено уровней: ' + m + ' из 3">' + [1, 2, 3].map(k => k <= m ? '★' : '☆').join('') + '</span>'; };
  const drillTile = d => `<a class="tile drill-tile" href="#/drill/${esc(d.id)}" ${cs(d.course)}><span class="ico">${esc(d.ico || '✎')}</span><b>${esc(d.title)}</b><p>${esc(d.desc || '')}</p>${stars(d.id)}</a>`;
  const labTile = d => `<a class="tile lab-tile" href="#/lab/${esc(d.id)}" ${cs(d.course)}><span class="ico">${esc(d.ico || '🔬')}</span><b>${esc(d.title)}</b><p>${esc(d.desc || '')}</p>${S.visits['lab:' + d.id] ? '<small class="muted">✓ открыта</small>' : ''}</a>`;

  /* ——— Экраны ——— */
  const V = {};

  V.home = () => {
    const total = P.lessons.length, done = Object.keys(S.done).length;
    const last = S.last && byId[S.last];
    const nextL = last ? (P.lessons[last.idx + 1] && !S.done[last.id] ? last : P.lessons[last.idx + 1] || last) : P.lessons[0];
    const dailyDone = S.daily[today()] != null;
    mount(`<div class="home"><div class="home-top">
      <section class="hero">
        <h1>${esc(C.hero.title)}</h1>
        <p class="lead">${esc(C.hero.lead)}</p>
      </section>
      <div class="shelf-wrap" aria-label="Курсы">
        <nav class="shelf">${courses.map(c => {
          const n = lessonsOf(c.n).length, d = doneIn(c.n);
          return `<a class="spine" href="#/c/${c.n}" style="--c:${c.color}" aria-label="Курс ${c.roman}: ${esc(c.title)}, пройдено ${d} из ${n}">
            <span class="num">${c.roman}</span><span class="t">${esc(c.title)}</span>
            <span class="band"><i style="width:${n ? Math.round(100 * d / n) : 0}%"></i></span><span class="gr">${esc(c.grade)}</span></a>`;
        }).join('')}</nav>
        <div class="plank"></div>
      </div></div>
      <div class="home-actions">
      ${nextL ? `<a class="continue" href="#/l/${nextL.id}" ${cs(nextL.course)}><div><small>${S.last ? 'Продолжить' : 'Начать с первого урока'}</small><b>${esc(nextL.title)}</b></div><span style="margin-left:auto">›</span></a>` : ''}
      ${P.drills.length ? `<a class="continue daily" href="#/daily"><div><small>${dailyDone ? 'Разминка дня пройдена · ' + S.daily[today()] + ' из 5' : 'Разминка дня · 5 задач · +20 опыта'}</small><b>${dailyDone ? 'Решить ещё раз' : 'Пять задач на сегодня'}</b></div><span style="margin-left:auto">☀</span></a>` : ''}
      </div>
      <h2 class="m-only">Курсы</h2>
      <nav class="ccards" aria-label="Курсы">${courses.map(c => { const n = lessonsOf(c.n).length, d = doneIn(c.n); return `<a class="ccard" href="#/c/${c.n}" style="--c:${c.color}"><b>${c.roman}</b><span>${esc(c.title)}<small>${esc(c.grade)} · ${d}/${n}</small></span><i style="width:${n ? Math.round(100 * d / n) : 0}%"></i></a>`; }).join('')}</nav>
      <div class="shelf-legend">${courses.map(c => `<a href="#/c/${c.n}" style="--c:${c.color}"><b>${c.roman}</b><div>${esc(c.title)}<span>${esc(c.grade)} · ${doneIn(c.n)}/${lessonsOf(c.n).length}</span></div></a>`).join('')}</div>
      <div class="stats">
        <div class="stat"><b>${done}/${total}</b><span>уроков пройдено</span></div>
        ${P.drills.length ? `<div class="stat"><b>${solved()}</b><span>задач решено</span></div>` : ''}
        <div class="stat opt"><b>${correctCount()}</b><span>верных ответов из ${Q.length}</span></div>
        <div class="stat"><b>${streak()}</b><span>${plural(streak(), ['день', 'дня', 'дней'])} подряд</span></div>
        <div class="stat opt"><b>${dueCards().length}</b><span>карточек к повторению</span></div>
      </div>
      ${P.labs.length ? `<h2>${esc(L.labs.title)}</h2><p class="muted d-only">${esc(L.labs.desc)}</p><div class="grid rail">${P.labs.slice(0, 8).map(labTile).join('')}</div><p><a href="#/labs">Все ${P.labs.length} ${plural(P.labs.length, ['лаборатория', 'лаборатории', 'лабораторий'])} ›</a></p>` : ''}
      ${P.drills.length ? `<h2>${esc(L.drills.title)}</h2><p class="muted">${P.drills.length} генераторов задач. ${esc(L.drills.desc)}</p><div class="chips">${courses.map(c => `<a class="chip" href="#/drills?c=${c.n}" ${cs(c.n)}>${c.roman}. ${esc(c.title)} · ${P.drills.filter(d => d.course === c.n).length}</a>`).join('')}</div>` : ''}
      <h2>Тренажёры</h2>
      <div class="grid rail">${trainTiles().slice(0, 6).join('')}</div>
      <h2>Справочники</h2>
      <div class="grid">
        ${P.places.length ? `<a class="tile" href="#/${PL}"><span class="ico">◆</span><b>${esc(C.places.title)}</b><p>${esc(C.places.teaser)} ${P.places.length} мест на карте.</p></a>` : ''}
        ${EVENTS.length ? `<a class="tile" href="#/timeline"><span class="ico">⏳</span><b>${esc(L.timeline.title)}</b><p>${esc(fill(L.timeline.desc, EVENTS.length))}</p></a>` : ''}
        ${P.authors.length ? `<a class="tile" href="#/authors"><span class="ico">✒</span><b>${esc(C.people.title)}</b><p>${P.authors.length} ${esc(C.people.teaser)}</p></a>` : ''}
        ${P.glossary.length ? `<a class="tile" href="#/glossary"><span class="ico">Аа</span><b>Словарь терминов</b><p>${P.glossary.length} понятий с определениями.</p></a>` : ''}
      </div></div>`);
  };

  function trainTiles() {
    return [
      P.drills.length ? `<a class="tile" href="#/drill/mix"><span class="ico">🎲</span><b>Смешанная тренировка</b><p>10 задач из разных генераторов — как на контрольной.</p></a>` : '',
      Object.keys(P.tests).length ? `<a class="tile" href="#/tests"><span class="ico">✎</span><b>${esc(L.tests.title)}</b><p>${esc(L.tests.desc)}</p></a>` : '',
      `<a class="tile" href="#/train/exam/all"><span class="ico">🎓</span><b>Пробный экзамен</b><p>20 случайных вопросов, без подсказок до конца.</p></a>`,
      `<a class="tile" href="#/train/cards/all"><span class="ico">🗂</span><b>Карточки</b><p>${CARDS.length} карточек с интервальным повторением.</p></a>`,
      `<a class="tile" href="#/train/blitz"><span class="ico">⚡</span><b>Блиц «Верно или нет»</b><p>60 секунд, как можно больше ответов.</p></a>`,
      P.works.length ? `<a class="tile" href="#/train/pairs"><span class="ico">${L.pairs.ico}</span><b>${esc(L.pairs.title)}</b><p>${esc(fill(L.pairs.desc, P.works.length))}</p></a>` : '',
      P.heroes.length ? `<a class="tile" href="#/train/heroes"><span class="ico">${L.heroes.ico}</span><b>${esc(L.heroes.title)}</b><p>${esc(fill(L.heroes.desc, P.heroes.length))}</p></a>` : '',
      EVENTS.length ? `<a class="tile" href="#/train/chrono"><span class="ico">${L.chrono.ico}</span><b>${esc(L.chrono.title)}</b><p>${esc(L.chrono.desc)}</p></a>` : ''
    ].filter(Boolean);
  }

  V.course = n => {
    n = +n; const c = courseOf(n); if (!c) return V.notfound();
    const ls = lessonsOf(n), d = doneIn(n), dr = P.drills.filter(x => x.course === n), lb = P.labs.filter(x => x.course === n);
    mount(`<div class="narrow" ${cs(n)}>
      <nav class="crumbs"><a href="#/">Главная</a> / <span>Курс ${c.roman}</span></nav>
      <header class="course-head"><span class="roman">Курс ${c.roman} · ${esc(c.grade)}</span><h1>${esc(c.title)}</h1><p class="lead">${esc(c.short)}</p></header>
      <div class="bar" aria-label="Прогресс курса"><i style="width:${Math.round(100 * d / Math.max(1, ls.length))}%"></i></div>
      <p class="muted">Пройдено ${d} из ${ls.length} ${plural(ls.length, ['урока', 'уроков', 'уроков'])}${P.tests[n] ? ' · ' + esc(L.tests.ready) + ' ' + testPct(n) + '%' : ''}</p>
      <ol class="lessons">${ls.map(l => `<li><a href="#/l/${l.id}" class="${S.done[l.id] ? 'done' : ''}"><span><b>${esc(l.title)}</b><small>${esc(l.sub || '')}</small></span>${srcBadge(l)}</a></li>`).join('')}</ol>
      <div class="btn-row">
        <a class="btn primary" href="#/train/exam/${n}">Экзамен по курсу</a>
        ${dr.length ? `<a class="btn" href="#/drill/mix?c=${n}">Смешанные задачи</a>` : ''}
        <a class="btn" href="#/train/cards/${n}">Карточки курса</a>
        ${P.tests[n] ? `<a class="btn" href="#/tests/${n}">${esc(L.tests.short)}</a>` : ''}
      </div>
      ${lb.length ? `<h2>${esc(L.labs.title)}</h2><div class="grid">${lb.map(labTile).join('')}</div>` : ''}
      ${dr.length ? `<h2>${esc(L.drills.title)}</h2><div class="grid">${dr.map(drillTile).join('')}</div>` : ''}
      </div>`, 'Курс ' + c.roman);
  };

  V.lesson = id => {
    const l = byId[id]; if (!l) return V.notfound();
    const c = courseOf(l.course), ls = lessonsOf(l.course), i = ls.indexOf(l);
    const prev = ls[i - 1], next = ls[i + 1];
    S.last = id; save();
    const facts = l.facts && l.facts.length ? '<h2>Главное в таблице</h2><dl class="facts">' + l.facts.map(f => '<dt>' + inline(f[0]) + '</dt><dd>' + inline(f[1]) + '</dd>').join('') + '</dl>' : '';
    const body = md(l.body);
    const own = P.drills.filter(d => d.lesson === id && !body.includes('#/drill/' + d.id + '"'));
    const practice = own.length ? '<h2>Практика</h2>' + own.map(d => '<a class="drill-link" href="#/drill/' + esc(d.id) + '"><span class="ico">' + esc(d.ico || '✎') + '</span><span><small>' + esc(L.drills.title) + '</small><b>' + esc(d.title) + '</b></span>' + stars(d.id) + '<span class="go">›</span></a>').join('') : '';
    mount(`<article class="narrow" ${cs(l.course)}>
      <nav class="crumbs"><a href="#/">Главная</a> / <a href="#/c/${l.course}">Курс ${c.roman}</a> / <span>${i + 1} из ${ls.length}</span></nav>
      <h1>${esc(l.title)}</h1>
      <div class="lesson-meta">${srcBadge(l)}<span>${esc(l.sub || '')}</span>${S.done[id] ? '<span style="color:var(--ok)">✓ пройдено</span>' : ''}</div>
      <div class="lesson"><div class="md">${body}</div>${facts}${practice}</div>
      <div class="section-tools">
        ${l.quiz && l.quiz.length ? `<button class="btn primary" data-act="quiz">Проверить себя · ${l.quiz.length} ${plural(l.quiz.length, ['вопрос', 'вопроса', 'вопросов'])}</button>` : ''}
        ${l.cards && l.cards.length ? `<button class="btn" data-act="cards">Карточки урока · ${l.cards.length}</button>` : ''}
        ${S.done[id] ? '' : '<button class="btn ghost" data-act="done">Отметить прочитанным</button>'}
      </div>
      <div id="activity"></div>
      <nav class="pager">${prev ? `<a href="#/l/${prev.id}"><small>‹ Назад</small>${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="next" href="#/l/${next.id}"><small>Дальше ›</small>${esc(next.title)}</a>` : `<a class="next" href="#/c/${l.course}"><small>Курс завершён ›</small>К списку уроков</a>`}</nav>
    </article>`, l.title);
    mountLabs(main());
    const act = $('#activity');
    const finish = () => { if (!S.done[id]) { S.done[id] = today(); save(); addXP(15); } };
    main().onclick = e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.getAttribute('data-act');
      if (a === 'quiz') { quiz(act, Q.filter(q => q.lesson === id), { title: 'Вопросы по уроку', onEnd: (sc, tot) => { if (sc === tot) { S.ach._perfect = 1; save(); } if (sc / tot >= .6) finish(); } }); act.scrollIntoView({ behavior: 'smooth' }); }
      if (a === 'cards') { cards(act, CARDS.filter(c => c.lesson === id), { all: true }); act.scrollIntoView({ behavior: 'smooth' }); }
      if (a === 'done') { finish(); b.remove(); }
    };
  };

  /* ——— Квиз ——— */
  function quiz(root, qs, opt = {}) {
    if (!qs.length) { root.innerHTML = '<div class="panel">Вопросов пока нет.</div>'; return; }
    const exam = !!opt.exam; let i = 0, score = 0; const log = [];
    const items = (opt.noShuffle ? qs : shuffle(qs)).map(q => ({ q, order: shuffle(q.a.map((_, k) => k)) }));
    const show = () => {
      const { q, order } = items[i];
      root.innerHTML = `<div class="panel" aria-live="polite"><div class="q-top"><span>${esc(opt.title || 'Тест')}</span><span>${i + 1} / ${items.length}</span></div>
        <div class="bar" style="margin-bottom:14px"><i style="width:${100 * i / items.length}%"></i></div>
        <p class="q-text">${inline(q.q)}</p><div class="opts">${order.map(k => `<button class="opt" data-k="${k}">${inline(q.a[k])}</button>`).join('')}</div><div class="fb"></div></div>`;
      $$('.opt', root).forEach(b => b.onclick = () => answer(+b.dataset.k));
    };
    const answer = k => {
      const { q } = items[i]; const ok = k === q.c;
      if (ok) score++;
      log.push({ q, k, ok });
      const first = !(q.id in S.quiz);
      if (ok && !S.quiz[q.id]) { S.quiz[q.id] = 1; S.xp += first ? 4 : 2; } else if (!ok && first) S.quiz[q.id] = 0;
      save();
      $$('.opt', root).forEach(b => { b.disabled = true; const kk = +b.dataset.k; if (!exam) { if (kk === q.c) b.classList.add('right'); if (kk === k && !ok) b.classList.add('wrong'); } else if (kk === k) b.style.borderColor = 'var(--accent)'; });
      const fb = $('.fb', root);
      fb.innerHTML = (exam ? '' : `<div class="explain"><strong>${ok ? 'Верно.' : 'Неверно.'}</strong> ${q.e ? inline(q.e) : (ok ? '' : 'Правильный ответ: ' + inline(q.a[q.c]))}${q.lesson && opt.linkLessons ? ` <a href="#/l/${q.lesson}">К уроку</a>` : ''}</div>`) +
        `<div class="btn-row"><button class="btn primary" data-n>${i + 1 < items.length ? 'Дальше' : 'Итог'}</button></div>`;
      const nb = $('[data-n]', root); nb.focus({ preventScroll: true }); nb.onclick = () => { i++; i < items.length ? show() : end(); };
      if (exam) setTimeout(() => { if (nb.isConnected) nb.click(); }, 350);
    };
    const end = () => {
      renderChip(); const pct = Math.round(100 * score / items.length);
      const wrong = log.filter(x => !x.ok);
      root.innerHTML = `<div class="panel result"><div class="big">${pct}%</div><p>${score} из ${items.length} верно. ${pct >= 90 ? 'Отлично.' : pct >= 70 ? 'Хорошо — повторите ошибки.' : 'Стоит перечитать урок.'}</p>
        ${wrong.length ? `<div class="review"><b>Разбор ошибок</b><ol>${wrong.map(x => `<li>${inline(x.q.q)}<br><span style="color:var(--bad)">Ваш ответ: ${inline(x.q.a[x.k])}</span><br><span style="color:var(--ok)">Верно: ${inline(x.q.a[x.q.c])}</span>${x.q.e ? '<br><small class="muted">' + inline(x.q.e) + '</small>' : ''}${x.q.lesson ? ` <a href="#/l/${x.q.lesson}">урок</a>` : ''}</li>`).join('')}</ol></div>` : ''}
        <div class="btn-row" style="justify-content:center"><button class="btn primary" data-r>Ещё раз</button>${wrong.length ? '<button class="btn" data-w>Только ошибки</button>' : ''}</div></div>`;
      $('[data-r]', root).onclick = () => quiz(root, qs, opt);
      const w = $('[data-w]', root); if (w) w.onclick = () => quiz(root, wrong.map(x => x.q), Object.assign({}, opt, { onEnd: null }));
      addXP(Math.round(score * 1.5));
      if (opt.onEnd) opt.onEnd(score, items.length);
      checkAch();
    };
    show();
  }

  /* ——— Карточки (система Лейтнера) ——— */
  const GAP = [0, 1, 2, 4, 8, 16]; // дни для коробок 0..5
  const dueCards = (pool = CARDS) => pool.filter(c => { const s = S.cards[c.id]; return !s || s.due <= today(); });
  function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function cards(root, pool, opt = {}) {
    let deck = opt.all ? shuffle(pool) : shuffle(dueCards(pool)).slice(0, 20);
    if (!deck.length) { root.innerHTML = `<div class="panel result"><p>На сегодня всё повторено. Следующие карточки появятся завтра.</p><div class="btn-row" style="justify-content:center"><button class="btn" data-all>Повторить всё равно</button></div></div>`; $('[data-all]', root).onclick = () => cards(root, pool, { all: true }); return; }
    let i = 0, known = 0;
    const show = () => {
      const c = deck[i], s = S.cards[c.id] || { box: 0 };
      root.innerHTML = `<div class="panel"><div class="q-top"><span>Карточка ${i + 1} из ${deck.length}</span><span class="leitner" title="Уровень запоминания">${[1, 2, 3, 4, 5].map(k => `<i class="${s.box >= k ? 'on' : ''}"></i>`).join('')}</span></div>
        <div class="flash" tabindex="0" role="button" aria-label="Перевернуть карточку"><div class="flash-in"><div class="face"><small>вопрос</small>${inline(c.f)}</div><div class="face back"><small>ответ</small>${inline(c.b)}</div></div></div>
        <div class="btn-row" style="justify-content:center"><button class="btn" data-k="0">Не помню</button><button class="btn primary" data-k="1">Помню</button></div>
        <p class="muted" style="text-align:center;font-size:13px;margin:8px 0 0">Нажмите на карточку, чтобы перевернуть</p></div>`;
      const f = $('.flash', root); const flip = () => f.classList.toggle('flipped'); f.onclick = flip; f.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } };
      $$('[data-k]', root).forEach(b => b.onclick = () => grade(+b.dataset.k));
    };
    const grade = ok => {
      const c = deck[i], s = S.cards[c.id] || { box: 0 };
      s.box = ok ? Math.min(5, s.box + 1) : 0; s.due = addDays(ok ? GAP[s.box] : 0);
      S.cards[c.id] = s; S.best.cardsSeen = (S.best.cardsSeen || 0) + 1; if (ok) known++;
      save(); i++;
      if (i < deck.length) show(); else { root.innerHTML = `<div class="panel result"><div class="big">${known}/${deck.length}</div><p>Карточки, которые вы не вспомнили, вернутся в этой же сессии завтра; выученные — через 1, 2, 4, 8 и 16 дней.</p><div class="btn-row" style="justify-content:center"><button class="btn primary" data-a>Ещё порция</button></div></div>`; $('[data-a]', root).onclick = () => cards(root, pool, opt); addXP(known); }
    };
    show();
  }

  /* ——— Генераторы задач ——— */
  const R = {
    rand: () => rnd(),
    int: (a, b) => a + Math.floor(rnd() * (b - a + 1)),
    nz: (a, b) => { let x; do x = R.int(a, b); while (x === 0); return x; },
    pick: a => a[Math.floor(rnd() * a.length)],
    shuffle: a => shuffle(a),
    sample: (a, n) => pick(a, n),
    gcd: (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; },
    lcm: (a, b) => Math.abs(a * b) / R.gcd(a, b),
    round: (x, k = 6) => Math.round(x * 10 ** k) / 10 ** k,
    // число по-русски: десятичная запятая, минус «−»
    num: x => { const v = R.round(x, 6); return (v < 0 ? '−' : '') + String(Math.abs(v)).replace('.', ','); },
    // число для TeX: {,} — запятая без пробела
    tn: x => { const v = R.round(x, 6); return (v < 0 ? '-' : '') + String(Math.abs(v)).replace('.', '{,}'); },
    // несократимая дробь в TeX
    frac: (n, d) => { if (d < 0) { n = -n; d = -d; } const g = R.gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; },
    // одночлен со знаком: R.term(-1,'x',false) → "- x"
    term: (k, v, first) => { if (k === 0) return ''; const s = k < 0 ? '-' : (first ? '' : '+'); const a = Math.abs(k); const body = v ? ((a === 1 ? '' : R.tn(a)) + v) : R.tn(a); return (first ? s : ' ' + s + ' ') + body; },
    // многочлен по коэффициентам от старшего: R.poly([1,-3,2]) → "x^{2} - 3x + 2"
    poly: (cs, v = 'x') => { const n = cs.length - 1; let out = ''; cs.forEach((k, i) => { const p = n - i; const vv = p === 0 ? '' : p === 1 ? v : v + '^{' + p + '}'; const t = R.term(k, vv, out === ''); out += t; }); return out || '0'; },
    signed: x => x < 0 ? '(' + R.tn(x) + ')' : R.tn(x)
  };
  P.R = R;

  // Разбор ответа: числа (запятая или точка), дроби, √, π, ^, скобки, неявное умножение.
  function evalExpr(src) {
    const mx = String(src).trim().replace(/[−–—]/g, '-').match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/); // смешанное число «2 1/3»
    if (mx) return (mx[1] ? -1 : 1) * (+mx[2] + mx[3] / mx[4]);
    let s = String(src).toLowerCase().replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/[×·*]/g, '*').replace(/[:÷]/g, '/').replace(/,/g, '.').replace(/pi|пи/g, 'π').replace(/sqrt|корень/g, '√');
    let i = 0;
    const peek = () => s[i];
    function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const o = s[i++]; const r = term(); v = o === '+' ? v + r : v - r; } return v; }
    function term() { let v = unary(); for (;;) { const c = peek(); if (c === '*' || c === '/') { i++; const r = unary(); v = c === '*' ? v * r : v / r; } else if (c && /[\d.(√π]/.test(c)) { v *= unary(); } else return v; } }
    function unary() { if (peek() === '-') { i++; return -unary(); } if (peek() === '+') { i++; return unary(); } return power(); }
    function power() { const b = atom(); if (peek() === '^') { i++; return Math.pow(b, unary()); } return b; }
    function atom() {
      const c = peek();
      if (c === '(') { i++; const v = expr(); if (peek() !== ')') throw 0; i++; return v; }
      if (c === '√') { i++; return Math.sqrt(power()); }
      if (c === 'π') { i++; return Math.PI; }
      const m = s.slice(i).match(/^\d*\.?\d+/); if (!m) throw 0; i += m[0].length; return parseFloat(m[0]);
    }
    try { const v = expr(); if (i !== s.length || !isFinite(v)) return NaN; return v; } catch (e) { return NaN; }
  }
  const normTxt = s => String(s).toLowerCase().replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/,/g, '.').replace(/ё/g, 'е');
  function splitList(raw) {
    let s = String(raw).trim().replace(/^[({[]|[)}\]]$/g, '');
    let parts = s.split(/\s*;\s*|\s+и\s+|\s+or\s+/);
    if (parts.length === 1 && /,\s/.test(s)) parts = s.split(/,\s+/);
    return parts.map(x => x.trim()).filter(Boolean);
  }
  function checkAnswer(t, raw) {
    if (!String(raw).trim()) return null;
    const near = (v, a) => Math.abs(v - a) <= (t.tol != null ? t.tol : 1e-6 * Math.max(1, Math.abs(a)));
    if (typeof t.a === 'string') return [t.a, ...(t.alt || [])].some(x => normTxt(x) === normTxt(raw));
    if (Array.isArray(t.a)) {
      if (!t.a.length) return /^(нет|∅|0корней|нетрешений|нетрешения|нет корней)$/.test(normTxt(raw)) || normTxt(raw).startsWith('нет');
      const vs = splitList(raw).map(evalExpr); if (vs.length !== t.a.length || vs.some(isNaN)) return false;
      if (t.ordered) return vs.every((v, k) => near(v, t.a[k]));
      const a = t.a.slice().sort((x, y) => x - y), b = vs.slice().sort((x, y) => x - y);
      return b.every((v, k) => near(v, a[k]));
    }
    const v = evalExpr(raw); if (isNaN(v)) return false;
    return near(v, t.a);
  }
  const showAns = t => t.show != null ? t.show : typeof t.a === 'number' ? R.num(t.a) : Array.isArray(t.a) ? (t.a.length ? t.a.map(R.num).join('; ') : 'нет корней') : t.a;
  const genTask = (d, lv) => { for (let k = 0; k < 30; k++) { try { const t = d.gen(lv, R); if (t) { t.drill = d; t.lv = lv; return t; } } catch (e) { console.error(d.id, e); } } return null; };

  function taskHTML(t) {
    const opts = t.opts ? shuffle(t.opts.map((o, k) => ({ o, k }))) : null;
    return { opts, html: `<p class="q-text">${inline(t.q)}</p>${t.svg ? '<div class="task-fig">' + t.svg + '</div>' : ''}
      ${opts ? `<div class="opts">${opts.map(x => `<button class="opt" data-k="${x.k}">${inline(x.o)}</button>`).join('')}</div>` :
        `<form class="ans-form" autocomplete="off"><div class="ans-row"><input class="ans-in" type="text" inputmode="${t.kb || 'text'}" aria-label="Ответ" placeholder="${esc(t.ph || L.drills.ph)}" enterkeyhint="done" autocapitalize="off" spellcheck="false">${t.unit ? '<span class="unit">' + inline(t.unit) + '</span>' : ''}<button class="btn primary" type="submit">Проверить</button></div>
        <div class="keys">${['−', '/', ',', ';', '√', 'π', '^', '(', ')'].map(k => `<button type="button" data-key="${k === '−' ? '-' : k}">${k}</button>`).join('')}${calcOK(t.drill) ? '<button type="button" class="calc-key" data-calc aria-label="Калькулятор">🧮</button>' : ''}</div>${calcOK(t.drill) ? '' : '<p class="muted calc-off">🧮 Здесь считаем в уме — калькулятор выключен.</p>'}</form>`}
      ${t.hint ? `<details class="hint"><summary>Подсказка</summary><p>${inline(t.hint)}</p></details>` : ''}<div class="fb"></div>` };
  }
  // Один экземпляр задачи: рисует, принимает ответ, вызывает done(ok)
  function runTask(box, t, opt, done) {
    const { html } = taskHTML(t);
    box.innerHTML = html;
    Calc.allow(calcOK(t.drill));
    const ck = $('[data-calc]', box); if (ck) ck.onclick = () => Calc.open();
    Calc.fabOnly(!$('.ans-form', box));
    const fin = ok => {
      $$('.opt', box).forEach(b => { b.disabled = true; if (+b.dataset.k === 0) b.classList.add('right'); });
      const inp = $('.ans-in', box); if (inp) { inp.disabled = true; inp.classList.add(ok ? 'ok' : 'bad'); }
      $$('.ans-form button', box).forEach(b => { b.disabled = true; });
      if (opt.quick) { done(ok); return; }
      $('.fb', box).innerHTML = `<div class="explain ${ok ? 'good' : 'badx'}"><strong>${ok ? 'Верно!' : 'Неверно.'}</strong> ${ok && !t.sol ? '' : 'Ответ: ' + inline(showAns(t))}${t.sol ? '<div class="sol">' + md(t.sol) + '</div>' : ''}</div><div class="btn-row"><button class="btn primary" data-next>${opt.last ? 'Итог' : 'Дальше'}</button></div>`;
      const nb = $('[data-next]', box); nb.focus({ preventScroll: true }); nb.onclick = () => done(ok);
    };
    $$('.opt', box).forEach(b => b.onclick = () => { const ok = +b.dataset.k === 0; if (!ok) b.classList.add('wrong'); fin(ok); });
    const form = $('.ans-form', box);
    if (form) {
      const inp = $('.ans-in', box);
      if (!opt.noFocus) setTimeout(() => inp.focus({ preventScroll: true }), 30);
      form.onsubmit = e => { e.preventDefault(); const r = checkAnswer(t, inp.value); if (r === null) { inp.focus(); return; } fin(r); };
      $$('[data-key]', box).forEach(b => b.onclick = () => { const k = b.dataset.key; const p = inp.selectionStart != null ? inp.selectionStart : inp.value.length; inp.value = inp.value.slice(0, p) + k + inp.value.slice(inp.selectionEnd != null ? inp.selectionEnd : p); inp.focus(); inp.setSelectionRange(p + k.length, p + k.length); });
    }
  }
  function countSolved(ok) { if (ok) { S.best.solved = (S.best.solved || 0) + 1; } save(); }

  // Сессия из N задач. src: () => задача
  function session(root, src, opt) {
    const N = opt.n || 10; let i = 0, score = 0; const log = [];
    const step = () => {
      const t = src(i); if (!t) { root.innerHTML = '<div class="panel">Не удалось создать задачу.</div>'; return; }
      root.innerHTML = `<div class="panel" aria-live="polite"><div class="q-top"><span>${esc(opt.title || t.drill.title)}${opt.showDrill ? ' · <a href="#/drill/' + esc(t.drill.id) + '">' + esc(t.drill.title) + '</a>' : ''}</span><span>${i + 1} / ${N}</span></div><div class="bar" style="margin-bottom:14px"><i style="width:${100 * i / N}%"></i></div><div class="task"></div></div>`;
      runTask($('.task', root), t, { last: i + 1 === N }, ok => { if (ok) score++; log.push({ t, ok }); countSolved(ok); if (ok) { S.xp += 2; save(); renderChip(); } i++; i < N ? step() : end(); });
    };
    const end = () => {
      const wrong = log.filter(x => !x.ok);
      root.innerHTML = `<div class="panel result"><div class="big">${score}/${N}</div><p>${score === N ? 'Безупречно!' : score >= .8 * N ? 'Отлично — уровень засчитан.' : score >= .5 * N ? 'Неплохо. Для зачёта уровня нужно 8 из 10.' : 'Посмотрите разбор и попробуйте ещё раз.'}</p>
        ${wrong.length ? `<div class="review"><b>Разбор ошибок</b><ol>${wrong.map(x => `<li>${inline(x.t.q)}<br><span style="color:var(--ok)">Ответ: ${inline(showAns(x.t))}</span>${x.t.sol ? '<div class="sol">' + md(x.t.sol) + '</div>' : ''}</li>`).join('')}</ol></div>` : ''}
        <div class="btn-row" style="justify-content:center"><button class="btn primary" data-r>Ещё ${N} задач</button>${opt.after || ''}</div></div>`;
      $('[data-r]', root).onclick = () => session(root, src, opt);
      if (opt.onEnd) opt.onEnd(score, N);
      addXP(score >= .8 * N ? 10 : 3);
    };
    step();
  }
  function sprint(root, d, lv) {
    root.innerHTML = `<div class="panel result"><p>60 секунд: решите как можно больше задач. Ошибка не штрафуется, но время идёт. Рекорд: ${S.drills[d.id] && S.drills[d.id].sp || 0}.</p><button class="btn primary" id="go">Старт</button></div>`;
    $('#go', root).onclick = () => {
      let score = 0, left = 60;
      root.innerHTML = `<div class="panel"><div class="q-top"><span class="timer" id="tm">60</span><span>Решено: <b id="sc">0</b></span></div><div class="task"></div></div>`;
      const next = () => { const t = genTask(d, lv); runTask($('.task', root), t, { quick: true }, ok => { if (ok) { score++; $('#sc', root).textContent = score; } countSolved(ok); setTimeout(() => { if (left > 0 && $('.task', root)) next(); }, ok ? 250 : 900); }); };
      next();
      const tm = setInterval(() => {
        if (!$('#tm', root) || !root.isConnected) { clearInterval(tm); return; }
        left--; $('#tm', root).textContent = left;
        if (left <= 0) {
          clearInterval(tm); const st = S.drills[d.id] = S.drills[d.id] || {}; const rec = score > (st.sp || 0); if (rec) st.sp = score; if (score > (S.best.sprint || 0)) S.best.sprint = score; save();
          root.innerHTML = `<div class="panel result"><div class="big">${score}</div><p>${rec ? 'Новый рекорд!' : 'Рекорд: ' + st.sp}</p><div class="btn-row" style="justify-content:center"><button class="btn primary" id="again">Ещё раз</button></div></div>`;
          $('#again', root).onclick = () => sprint(root, d, lv); addXP(score);
        }
      }, 1000);
    };
  }

  V.drills = () => {
    const f = new URLSearchParams(location.hash.split('?')[1] || '').get('c') || 'all';
    const list = P.drills.filter(d => f === 'all' || d.course === +f);
    const groups = courses.filter(c => f === 'all' || c.n === +f).map(c => ({ c, ds: list.filter(d => d.course === c.n) })).filter(g => g.ds.length);
    mount(`<h1>${esc(L.drills.title)}</h1><p class="lead">${esc(L.drills.desc)} <span class="d-only">Уровень засчитывается за 8 верных из 10 — так зажигаются звёзды ★.</span> Решено задач: ${solved()}.</p>
      <div class="btn-row"><a class="btn primary" href="#/daily">☀ Разминка дня</a><a class="btn" href="#/drill/mix${f === 'all' ? '' : '?c=' + f}">🎲 Смешанные задачи</a></div>
      <div class="chips">${['all', ...courses.map(c => c.n)].map(s => `<a class="chip" href="#/drills?c=${s}" aria-pressed="${String(s) === f}">${s === 'all' ? 'Все' : 'Курс ' + courseOf(s).roman}</a>`).join('')}</div>
      ${groups.map(g => `<details class="grp" ${cs(g.c.n)} ${f !== 'all' ? 'open' : ''}><summary><span class="r">${g.c.roman}</span><span class="t">${esc(g.c.title)}<small>${esc(g.c.grade)} · ${g.ds.length} ${plural(g.ds.length, ['генератор', 'генератора', 'генераторов'])} · ★ ${g.ds.reduce((s2, d) => s2 + mastered(d.id), 0)}/${g.ds.length * 3}</small></span></summary><div class="grid">${g.ds.map(drillTile).join('')}</div></details>`).join('')}`, L.drills.title);
  };

  V.drill = id => {
    const qs = new URLSearchParams(location.hash.split('?')[1] || '');
    if (id === 'mix') {
      const f = qs.get('c') || 'all'; const pool = P.drills.filter(d => f === 'all' || d.course === +f);
      mount(`<div class="narrow"><nav class="crumbs"><a href="#/drills">${esc(L.drills.title)}</a> / <span>Смешанные задачи</span></nav><h1>Смешанные задачи</h1><p class="lead">${f === 'all' ? 'Вся программа' : 'Курс ' + courseOf(+f).roman + '. ' + esc(courseOf(+f).title)}: 10 задач из разных генераторов.</p>
        <div class="chips">${['all', ...courses.map(c => c.n)].map(s => `<a class="chip" href="#/drill/mix?c=${s}" aria-pressed="${String(s) === f}">${s === 'all' ? 'Все' : 'Курс ' + courseOf(s).roman}</a>`).join('')}</div><div id="act"></div></div>`, 'Смешанные задачи');
      const bag = shuffle(pool);
      return session($('#act'), i => { const d = bag[i % bag.length]; return genTask(d, Math.min(3, Math.max(1, mastered(d.id) + 1 - (rnd() < .5 ? 1 : 0)))); }, { title: 'Смешанные', showDrill: true });
    }
    const d = drillById[id]; if (!d) return V.notfound();
    const levels = d.levels || ['Уровень 1', 'Уровень 2', 'Уровень 3'];
    const lv = Math.min(levels.length, Math.max(1, +(qs.get('lv') || S.lv[id] || 1)));
    const mode = qs.get('m') === 'sprint' ? 'sprint' : 'set';
    S.lv[id] = lv; save();
    const c = courseOf(d.course);
    mount(`<div class="narrow" ${cs(d.course)}><nav class="crumbs"><a href="#/drills">${esc(L.drills.title)}</a> / <a href="#/drills?c=${d.course}">Курс ${c ? c.roman : ''}</a></nav>
      <h1>${esc(d.title)} ${stars(id)}</h1><p class="lead">${esc(d.desc || '')}${d.lesson && byId[d.lesson] ? ` Теория: <a href="#/l/${d.lesson}">${esc(byId[d.lesson].title)}</a>.` : ''}</p>
      <div class="chips">${levels.map((n, k) => `<a class="chip" href="#/drill/${id}?lv=${k + 1}&m=${mode}" aria-pressed="${k + 1 === lv}">${k + 1 <= mastered(id) ? '★ ' : ''}${esc(n)}</a>`).join('')}</div>
      <div class="chips"><a class="chip" href="#/drill/${id}?lv=${lv}&m=set" aria-pressed="${mode === 'set'}">10 задач</a><a class="chip" href="#/drill/${id}?lv=${lv}&m=sprint" aria-pressed="${mode === 'sprint'}">⏱ Спринт 60 с</a></div>
      <div id="act"></div>
      <p class="muted small-help">Ответ можно вводить дробью (3/4), десятичной (0,75), с корнем (2√3) или π. Несколько ответов — через точку с запятой: 2; −3.</p></div>`, d.title);
    if (mode === 'sprint') return sprint($('#act'), d, lv);
    const nxt = lv < levels.length ? `<a class="btn" href="#/drill/${id}?lv=${lv + 1}">Уровень ${lv + 1} ›</a>` : '';
    session($('#act'), () => genTask(d, lv), { title: levels[lv - 1], after: nxt, onEnd: (sc, n) => { const st = S.drills[id] = S.drills[id] || {}; st.b = Math.max(st.b || 0, sc); if (sc >= .8 * n && (st.m || 0) < lv) { st.m = lv; toast('★ Уровень ' + lv + ' освоен'); } save(); checkAch(); } });
  };

  // Разминка дня: одинаковые 5 задач для всех в этот день (детерминированный генератор)
  V.daily = () => {
    const d0 = today(); let seed = 0; for (const ch of d0) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const mul = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const prev = rnd; rnd = mul;
    const pool = shuffle(P.drills).slice(0, 5); const tasks = pool.map((d, k) => genTask(d, 1 + (k >= 2) + (k >= 4)));
    rnd = prev;
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/drills">${esc(L.drills.title)}</a> / <span>Разминка дня</span></nav><h1>Разминка дня</h1><p class="lead">${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}: пять задач из разных тем, от простой к сложной. Завтра будут новые.</p><div id="act"></div></div>`, 'Разминка дня');
    session($('#act'), i => tasks[i], { n: 5, title: 'Разминка', showDrill: true, onEnd: sc => { const first = S.daily[d0] == null; S.daily[d0] = Math.max(sc, S.daily[d0] || 0); save(); if (first) addXP(20); checkAch(); } });
  };

  /* ——— Калькулятор ——— */
  // Калькулятор разрешён по умолчанию с курса 3; генератор может переопределить флагом calc.
  const calcOK = d => !d ? true : d.calc != null ? !!d.calc : d.course >= 3;
  function calcEval(src, deg, ans) {
    let s = String(src).toLowerCase().replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/[×·*]/g, '*').replace(/[÷:]/g, '/').replace(/,/g, '.').replace(/π/g, 'pi').replace(/²/g, '^2').replace(/³/g, '^3').replace(/∛/g, 'cbrt');
    const open = (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length; let i = 0; const tr = deg ? Math.PI / 180 : 1;
    const F = { sin: x => Math.sin(x * tr), cos: x => Math.cos(x * tr), tan: x => { const c = Math.cos(x * tr); return Math.abs(c) < 1e-14 ? NaN : Math.sin(x * tr) / c; }, asin: x => Math.asin(x) / tr, acos: x => Math.acos(x) / tr, atan: x => Math.atan(x) / tr, ln: Math.log, log: Math.log10, lg: Math.log10, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp };
    const fact = n => { if (n < 0 || !Number.isInteger(n) || n > 170) return NaN; let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; };
    const peek = () => s[i];
    const startsAtom = c => c && /[\d.(√a-z]/.test(c);
    function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const o = s[i++]; const r = term(); v = o === '+' ? v + r : v - r; } return v; }
    function term() { let v = unary(); for (;;) { const c = peek(); if (c === '*' || c === '/') { i++; const r = unary(); v = c === '*' ? v * r : v / r; } else if (startsAtom(c)) v *= unary(); else return v; } }
    function unary() { if (peek() === '-') { i++; return -unary(); } if (peek() === '+') { i++; return unary(); } return power(); }
    function power() { const b = postfix(); if (peek() === '^') { i++; return Math.pow(b, unary()); } return b; }
    function postfix() { let v = atom(); for (;;) { if (peek() === '!') { i++; v = fact(v); } else if (peek() === '%') { i++; v /= 100; } else return v; } }
    function args() { const out = [expr()]; while (peek() === ';') { i++; out.push(expr()); } if (peek() !== ')') throw 0; i++; return out; }
    function atom() {
      const c = peek();
      if (c === '(') { i++; const v = expr(); if (peek() === ')') i++; return v; }
      if (c === '√') { i++; return Math.sqrt(power()); }
      let m = s.slice(i).match(/^\d*\.?\d+(e[+-]?\d+)?/); if (m) { i += m[0].length; return parseFloat(m[0]); }
      m = s.slice(i).match(/^[a-z]+/); if (!m) throw 0;
      let name = m[0];
      // разбор слитных имён: «pie» → pi·e, «ans2» и т. п.
      const known = ['asin', 'acos', 'atan', 'sqrt', 'cbrt', 'sin', 'cos', 'tan', 'abs', 'exp', 'ans', 'ln', 'log', 'lg', 'pi', 'c', 'e'];
      name = known.find(k => name.startsWith(k)); if (!name) throw 0;
      i += name.length;
      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;
      if (name === 'ans') return ans || 0;
      if (name === 'c') { if (peek() !== '(') throw 0; i++; const [n, k] = args(); return fact(n) / (fact(k) * fact(n - k)); }
      if (peek() === '(') { i++; const a = args(); return F[name](a[0]); }
      return F[name](power());
    }
    s += ')'.repeat(Math.max(0, open));
    try { if (!s) return NaN; const v = expr(); if (i !== s.length) return NaN; return v; } catch (e) { return NaN; }
  }
  function cfrac(x, maxD) { const sg = x < 0 ? -1 : 1; x = Math.abs(x); let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x; for (let it = 0; it < 32; it++) { const a = Math.floor(b); [h1, h0] = [a * h1 + h0, h1]; [k1, k0] = [a * k1 + k0, k1]; if (k1 > maxD) return null; if (Math.abs(x - h1 / k1) < 1e-10 * Math.max(1, x)) return [sg * h1, k1]; const r = b - a; if (r < 1e-12) break; b = 1 / r; } return null; }
  // Точная форма: дробь, кратное π или корень. Возвращает { tex, txt } или null.
  function exactForm(x) {
    if (!isFinite(x) || Number.isInteger(R.round(x, 10)) || Math.abs(x) > 1e9) return null;
    const fr = cfrac(x, 2000);
    if (fr) return { tex: R.frac(fr[0], fr[1]), txt: fr[0] + '/' + fr[1] };
    const fp = cfrac(x / Math.PI, 60);
    if (fp) { const [p, q] = fp; const num = (p === 1 ? '' : p === -1 ? '-' : p) + '\\pi'; return { tex: q === 1 ? num : (p < 0 ? '-' : '') + '\\frac{' + (Math.abs(p) === 1 ? '' : Math.abs(p)) + '\\pi}{' + q + '}', txt: (p === 1 ? '' : p === -1 ? '-' : p) + 'π' + (q === 1 ? '' : '/' + q) }; }
    const f2 = cfrac(x * x, 200);
    if (f2 && f2[1] <= 60) { let [n, q] = f2; let N = n * q; let a = 1; for (let k = 2; k * k <= N; k++) while (N % (k * k) === 0) { N /= k * k; a *= k; } if (N === 1) return null; const g = R.gcd(a, q); a /= g; q /= g; const sg = x < 0 ? '-' : ''; const rad = (a === 1 ? '' : a) + '\\sqrt{' + N + '}'; return { tex: sg + (q === 1 ? rad : '\\frac{' + rad + '}{' + q + '}'), txt: sg + (a === 1 ? '' : a) + '√' + N + (q === 1 ? '' : '/' + q) }; }
    return null;
  }
  const fmtNum = x => { if (!isFinite(x)) return isNaN(x) ? 'ошибка' : (x > 0 ? '∞' : '−∞'); if (Math.abs(x) < 1e-12) return '0'; const a = Math.abs(x); let t = (a >= 1e12 || a < 1e-6) ? x.toExponential(8).replace(/\.?0+e/, 'e') : String(+x.toPrecision(12)); return t.replace('-', '−').replace('.', ','); };
  const Calc = (() => {
    let el, fab, inp, res, ex, hist, ins, inv = false, just = false, allowed = true, last = null;
    const keys = [['inv', '@inv', 'fn'], ['sin', 'sin(', 'fn', 'asin('], ['cos', 'cos(', 'fn', 'acos('], ['tan', 'tan(', 'fn', 'atan('], ['π', 'π', 'fn'],
      ['ln', 'ln(', 'fn', 'exp('], ['log', 'log(', 'fn', '10^('], ['√', '√(', 'fn', '∛('], ['x²', '^2', 'fn', '^3'], ['xʸ', '^', 'fn'],
      ['(', '(', 'op'], [')', ')', 'op'], ['n!', '!', 'op'], ['C(n;k)', 'C(', 'op'], [';', ';', 'op'],
      ['7', '7'], ['8', '8'], ['9', '9'], ['÷', '÷', 'op'], ['⌫', '@del', 'act'],
      ['4', '4'], ['5', '5'], ['6', '6'], ['×', '×', 'op'], ['AC', '@ac', 'act'],
      ['1', '1'], ['2', '2'], ['3', '3'], ['−', '−', 'op'], ['Ans', 'Ans', 'fn'],
      ['0', '0'], [',', ','], ['e', 'e', 'fn'], ['+', '+', 'op'], ['=', '@eq', 'eq']];
    const invLab = { sin: 'sin⁻¹', cos: 'cos⁻¹', tan: 'tan⁻¹', ln: 'eˣ', log: '10ˣ', '√': '∛', 'x²': 'x³' };
    const st = () => S.calc = S.calc || { hist: [], deg: true };
    const ansVal = () => { const h = st().hist; return h.length ? h[0].v : 0; };
    function update() {
      const v = calcEval(inp.value, st().deg, ansVal());
      res.textContent = inp.value ? (isNaN(v) ? '…' : '= ' + fmtNum(v)) : '0';
      const f = isFinite(v) ? exactForm(v) : null; ex.innerHTML = f ? '= ' + tex('\\displaystyle ' + f.tex) : '';
      last = isFinite(v) ? { v, f } : null;
      ins.hidden = !last || !target();
    }
    const target = () => { const t = $('.ans-in'); return t && !t.disabled && t.isConnected ? t : null; };
    function put(txt) {
      const ops = /^[+−×÷^!;)]|^\^/;
      if (just) { inp.value = ops.test(txt) ? 'Ans' : ''; just = false; }
      const p = inp.selectionStart != null && document.activeElement === inp ? inp.selectionStart : inp.value.length;
      const q = inp.selectionEnd != null && document.activeElement === inp ? inp.selectionEnd : p;
      inp.value = inp.value.slice(0, p) + txt + inp.value.slice(q);
      if (!coarse()) { inp.focus(); inp.setSelectionRange(p + txt.length, p + txt.length); }
      update();
    }
    const coarse = () => matchMedia('(pointer: coarse)').matches;
    function equals() {
      if (!last) return;
      const h = st().hist; h.unshift({ e: inp.value, v: last.v }); h.length = Math.min(h.length, 10); save();
      drawHist(); just = true; res.classList.add('pop'); setTimeout(() => res.classList.remove('pop'), 250);
    }
    function drawHist() { hist.innerHTML = st().hist.slice(0, 4).reverse().map((h, k) => `<button type="button" data-h="${st().hist.length > 4 ? st().hist.slice(0, 4).length - 1 - k : st().hist.length - 1 - k}">${esc(h.e)} = <b>${esc(fmtNum(h.v))}</b></button>`).join(''); }
    function press(b) {
      const k = b.dataset.k, alt = b.dataset.alt;
      if (k === '@inv') { inv = !inv; b.classList.toggle('on', inv); $$('[data-alt]', el).forEach(x => { x.textContent = inv ? (invLab[x.dataset.lab] || x.dataset.lab) : x.dataset.lab; }); return; }
      if (k === '@del') { just = false; inp.value = inp.value.slice(0, -1); update(); return; }
      if (k === '@ac') { just = false; inp.value = ''; update(); return; }
      if (k === '@eq') { equals(); return; }
      put(inv && alt ? alt : k);
      if (inv && alt) { inv = false; $('[data-k="@inv"]', el).classList.remove('on'); $$('[data-alt]', el).forEach(x => { x.textContent = x.dataset.lab; }); }
    }
    function build() {
      el = document.createElement('div'); el.className = 'calc'; el.id = 'calc'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Калькулятор');
      el.innerHTML = `<div class="calc-head"><b>🧮 Калькулятор</b><button type="button" class="calc-mode" data-k="@mode" title="Градусы или радианы"></button><button type="button" class="calc-x" aria-label="Закрыть">✕</button></div>
        <div class="calc-screen"><div class="calc-hist"></div><input class="calc-in" aria-label="Выражение" autocomplete="off" spellcheck="false" placeholder="например 2√3 + sin(30)"><div class="calc-out"><span class="calc-ex"></span><span class="calc-res">0</span></div></div>
        <button type="button" class="btn primary calc-ins" hidden>↵ Вставить в ответ</button>
        <div class="calc-keys">${keys.map(([l, k, cl, alt]) => `<button type="button" class="${cl || 'num'}" data-k="${esc(k)}"${alt ? ` data-alt="${esc(alt)}" data-lab="${esc(l)}"` : ''}>${esc(l)}</button>`).join('')}</div>`;
      document.body.appendChild(el);
      fab = document.createElement('button'); fab.className = 'calc-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Открыть калькулятор'); fab.innerHTML = '<span aria-hidden="true">🧮</span>'; document.body.appendChild(fab);
      inp = $('.calc-in', el); res = $('.calc-res', el); ex = $('.calc-ex', el); hist = $('.calc-hist', el); ins = $('.calc-ins', el);
      const mode = $('.calc-mode', el); const showMode = () => { mode.textContent = st().deg ? 'DEG' : 'RAD'; }; showMode();
      mode.onclick = () => { st().deg = !st().deg; save(); showMode(); update(); };
      fab.onclick = () => el.hidden ? open() : close();
      $('.calc-x', el).onclick = close;
      $('.calc-keys', el).addEventListener('click', e => { const b = e.target.closest('button'); if (b) press(b); });
      hist.onclick = e => { const b = e.target.closest('[data-h]'); if (!b) return; const h = st().hist[+b.dataset.h]; if (h) { inp.value = h.e; just = false; update(); } };
      inp.addEventListener('input', () => { just = false; update(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); equals(); } if (e.key === 'Escape') close(); });
      ins.onclick = () => { const t = target(); if (!t || !last) return; const txt = last.f ? last.f.txt : fmtNum(last.v).replace(/^−/, '-'); t.value = txt; close(); t.focus(); };
      drawHist(); update();
    }
    function open() { if (!allowed) return; el.hidden = false; document.body.classList.add('calc-open'); fab.setAttribute('aria-expanded', 'true'); if (coarse()) { inp.readOnly = true; inp.setAttribute('inputmode', 'none'); const tk = $('.task'); if (tk) tk.scrollIntoView({ block: 'start', behavior: 'smooth' }); } else { inp.readOnly = false; inp.focus(); } update(); }
    function close() { if (!el) return; el.hidden = true; document.body.classList.remove('calc-open'); fab.setAttribute('aria-expanded', 'false'); }
    function allow(ok) { allowed = ok; if (!fab) return; fab.classList.toggle('off', !ok); if (!ok) close(); }
    function show(v) { if (fab) fab.hidden = !v; if (!v) close(); }
    function fabOnly(v) { if (fab) fab.hidden = !v; }
    return { build, open, close, allow, show, fabOnly };
  })();

  /* ——— Лаборатории ——— */
  const K = { tex, inline, md, esc, R, $, $$, toast };
  function mountLabs(root) {
    $$('.lab-slot', root).forEach(el => {
      const lab = labById[el.dataset.lab]; if (!lab) return;
      el.innerHTML = `<div class="lab-head"><span>${esc(lab.ico || '🔬')} ${esc(L.labs.title)}: <b>${esc(lab.title)}</b></span><a href="#/lab/${esc(lab.id)}">на весь экран ›</a></div><div class="lab"></div>`;
      try { lab.render($('.lab', el), K); } catch (e) { console.error(e); el.remove(); }
    });
  }
  V.labs = () => mount(`<h1>${esc(L.labs.title)}</h1><p class="lead">${esc(L.labs.desc)}</p>
    ${courses.map(c => { const ls = P.labs.filter(x => x.course === c.n); return ls.length ? `<h2 ${cs(c.n)}><span style="color:var(--c)">${c.roman}.</span> ${esc(c.title)}</h2><div class="grid">${ls.map(labTile).join('')}</div>` : ''; }).join('')}`, L.labs.title);
  V.lab = id => {
    const lab = labById[id]; if (!lab) return V.notfound();
    S.visits['lab:' + id] = 1; save();
    mount(`<div class="narrow wide-lab" ${cs(lab.course)}><nav class="crumbs"><a href="#/labs">${esc(L.labs.title)}</a> / <span>${esc(lab.title)}</span></nav><h1>${esc(lab.title)}</h1><p class="lead">${esc(lab.desc || '')}</p><div class="lab" id="lab"></div>
      ${lab.lesson && byId[lab.lesson] ? `<p>Теория: <a href="#/l/${lab.lesson}">${esc(byId[lab.lesson].title)}</a></p>` : ''}</div>`, lab.title);
    lab.render($('#lab'), K);
    checkAch();
  };

  /* ——— Хаб тренажёров ——— */
  V.train = () => mount(`<h1>Тренажёры</h1><p class="lead">Режимы, которые берут вопросы, карточки и задачи из всех уроков.</p><div class="grid">${trainTiles().join('')}</div>
    <h2>По курсам</h2><div class="grid">${courses.map(c => `<div class="tile" ${cs(c.n)}><b style="color:var(--c)">Курс ${c.roman}</b><p>${esc(c.title)}</p><div class="btn-row"><a class="btn" href="#/train/exam/${c.n}">Экзамен</a><a class="btn" href="#/train/cards/${c.n}">Карточки</a>${P.drills.some(d => d.course === c.n) ? `<a class="btn" href="#/drill/mix?c=${c.n}">Задачи</a>` : ''}</div></div>`).join('')}</div>`, 'Тренажёры');

  const scopeName = s => s === 'all' ? 'вся программа' : 'курс ' + (courseOf(+s) || {}).roman;
  const scopeFilter = s => x => s === 'all' || x.course === +s;

  V.exam = scope => {
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/train">Тренажёры</a> / <span>Пробный экзамен</span></nav><h1>Пробный экзамен</h1><p class="lead">${esc(scopeName(scope))}. 20 вопросов, правильные ответы — только в конце.</p>
      <div class="chips">${['all', ...courses.map(c => c.n)].map(s => `<a class="chip" href="#/train/exam/${s}" aria-pressed="${String(s) === String(scope)}">${s === 'all' ? 'Все курсы' : 'Курс ' + courseOf(s).roman}</a>`).join('')}</div><div id="act"></div></div>`, 'Пробный экзамен');
    quiz($('#act'), pick(Q.filter(scopeFilter(scope)), 20), { exam: true, title: 'Экзамен', linkLessons: true, onEnd: (s, t) => { if (s / t >= .8) { S.ach._exam = 1; save(); } } });
  };

  V.cards = scope => {
    const pool = CARDS.filter(c => scope === 'all' || (scope === 'terms' ? c.course === 0 : c.course === +scope));
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/train">Тренажёры</a> / <span>Карточки</span></nav><h1>Карточки</h1><p class="lead">К повторению сегодня: ${dueCards(pool).length} из ${pool.length}. Помните — карточка уходит дальше, не помните — возвращается.</p>
      <div class="chips">${['all', ...courses.map(c => c.n), 'terms'].map(s => `<a class="chip" href="#/train/cards/${s}" aria-pressed="${String(s) === String(scope)}">${s === 'all' ? 'Все' : s === 'terms' ? 'Термины' : 'Курс ' + courseOf(s).roman}</a>`).join('')}</div><div id="act"></div></div>`, 'Карточки');
    cards($('#act'), pool);
  };

  V.chrono = () => {
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/train">Тренажёры</a> / <span>${esc(L.chrono.title)}</span></nav><h1>${esc(L.chrono.title)}</h1><p class="lead">Расставьте события от раннего к позднему кнопками ↑ ↓.</p><div id="act"></div></div>`, L.chrono.title);
    const root = $('#act');
    const round = () => {
      const pool = shuffle(EVENTS); const set = []; const years = new Set();
      for (const e of pool) { if (!years.has(e.y)) { years.add(e.y); set.push(e); } if (set.length === 5) break; }
      let order = shuffle(set);
      const draw = (checked) => {
        const sorted = set.slice().sort((a, b) => a.y - b.y);
        root.innerHTML = `<div class="panel"><ol class="order-list">${order.map((e, k) => `<li class="${checked ? (sorted[k] === e ? 'right' : 'wrong') : ''}"><span>${checked ? `<span class="yr">${esc(e.label)}</span>` : ''}${inline(e.t)}</span>${checked ? '' : `<span class="mv"><button data-u="${k}" aria-label="Выше">↑</button><button data-d="${k}" aria-label="Ниже">↓</button></span>`}</li>`).join('')}</ol>
          <div class="btn-row">${checked ? '<button class="btn primary" data-new>Новый раунд</button>' : '<button class="btn primary" data-chk>Проверить</button>'}</div></div>`;
        $$('[data-u]', root).forEach(b => b.onclick = () => { const k = +b.dataset.u; if (k > 0) { [order[k - 1], order[k]] = [order[k], order[k - 1]]; draw(); $$('[data-u]', root)[k - 1].focus(); } });
        $$('[data-d]', root).forEach(b => b.onclick = () => { const k = +b.dataset.d; if (k < order.length - 1) { [order[k + 1], order[k]] = [order[k], order[k + 1]]; draw(); $$('[data-d]', root)[k + 1].focus(); } });
        const chk = $('[data-chk]', root); if (chk) chk.onclick = () => { const ok = order.every((e, k) => e === sorted[k]); draw(true); if (ok) { S.ach._chrono = 1; addXP(10); toast('Всё по порядку!'); } else addXP(2); };
        const nw = $('[data-new]', root); if (nw) nw.onclick = round;
      };
      draw();
    };
    round();
  };

  V.pairs = () => {
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/train">Тренажёры</a> / <span>${esc(L.pairs.title)}</span></nav><h1>${esc(L.pairs.title)}</h1><p class="lead">${esc(L.pairs.lead)}</p><div id="act"></div></div>`, L.pairs.title);
    const root = $('#act');
    const round = () => {
      const set = []; const used = new Set();
      for (const w of shuffle(P.works)) { if (!used.has(w[1])) { used.add(w[1]); set.push(w); } if (set.length === 6) break; }
      const left = shuffle(set), right = shuffle(set); let sel = null, done = 0, miss = 0;
      root.innerHTML = `<div class="panel"><div class="pairs"><div class="col">${left.map((w, k) => `<button class="pair" data-l="${k}">${esc(L.pairs.q1)}${inline(w[0])}${esc(L.pairs.q2)}</button>`).join('')}</div><div class="col">${right.map((w, k) => `<button class="pair" data-r="${k}">${inline(w[1])}</button>`).join('')}</div></div><p class="muted" id="pmsg" style="margin:12px 0 0">Ошибок: 0</p></div>`;
      $$('[data-l]', root).forEach(b => b.onclick = () => { if (b.classList.contains('done')) return; $$('[data-l]', root).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = +b.dataset.l; });
      $$('[data-r]', root).forEach(b => b.onclick = () => {
        if (sel == null || b.classList.contains('done')) return;
        const lw = left[sel], rw = right[+b.dataset.r];
        if (lw[1] === rw[1]) { b.classList.add('done'); const lb = $(`[data-l="${sel}"]`, root); lb.classList.remove('sel'); lb.classList.add('done'); lb.disabled = b.disabled = true; sel = null; done++; if (done === set.length) { if (!miss) S.ach._pairs = 1; addXP(miss ? 5 : 12); root.insertAdjacentHTML('beforeend', '<div class="btn-row"><button class="btn primary" id="again">Новый набор</button></div>'); $('#again').onclick = round; } }
        else { miss++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); $('#pmsg').textContent = 'Ошибок: ' + miss; }
      });
    };
    round();
  };

  V.heroes = () => {
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/train">Тренажёры</a> / <span>${esc(L.heroes.title)}</span></nav><h1>${esc(L.heroes.title)}</h1><p class="lead">Серия правильных ответов подряд — ваш рекорд: ${S.best.heroes || 0}.</p><div id="act"></div></div>`, L.heroes.title);
    const root = $('#act'); let run = 0; const worksAll = Array.from(new Set(P.heroes.map(h => h[1])));
    const next = () => {
      const h = P.heroes[Math.floor(Math.random() * P.heroes.length)];
      const opts = shuffle([h[1], ...pick(worksAll.filter(w => w !== h[1]), 3)]);
      root.innerHTML = `<div class="panel"><div class="q-top"><span>Серия: ${run}</span><span>Рекорд: ${S.best.heroes || 0}</span></div><p class="q-text">${inline(h[0])}</p>${h[2] ? `<p class="muted" style="margin-top:-6px">${inline(h[2])}</p>` : ''}<div class="opts">${opts.map(o => `<button class="opt">${esc(L.heroes.q1)}${inline(o)}${esc(L.heroes.q2)}</button>`).join('')}</div><div class="fb"></div></div>`;
      $$('.opt', root).forEach((b, k) => b.onclick = () => {
        const ok = opts[k] === h[1]; $$('.opt', root).forEach((x, j) => { x.disabled = true; if (opts[j] === h[1]) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
        if (ok) { run++; if (run > (S.best.heroes || 0)) { S.best.heroes = run; save(); } S.xp += 1; save(); renderChip(); } else run = 0;
        $('.fb', root).innerHTML = `<div class="btn-row"><button class="btn primary">${ok ? 'Дальше' : 'Начать серию заново'}</button></div>`; $('.fb button', root).onclick = next; $('.fb button', root).focus(); checkAch();
      });
    };
    next();
  };

  V.blitz = () => {
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/train">Тренажёры</a> / <span>Блиц</span></nav><h1>Блиц «Верно или нет»</h1><p class="lead">60 секунд. Верный ответ +1, ошибка −1. Рекорд: ${S.best.blitz || 0}.</p><div id="act"><div class="panel result"><button class="btn primary" id="go">Начать</button></div></div></div>`, 'Блиц');
    const root = $('#act');
    $('#go').onclick = () => {
      let score = 0, left = 60, cur; const pool = shuffle(Q.filter(q => q.a.length > 1 && q.q.length < 160));
      let qi = 0;
      const next = () => { const q = pool[qi++ % pool.length]; const truth = Math.random() < .5; const k = truth ? q.c : shuffle(q.a.map((_, i) => i).filter(i => i !== q.c))[0]; cur = { truth }; $('#bc').innerHTML = inline(q.q) + '<span class="ans">' + inline(q.a[k]) + '</span>'; };
      root.innerHTML = `<div class="panel"><div class="q-top"><span class="timer" id="tm">60</span><span>Очки: <b id="sc">0</b></span></div><div class="blitz-card" id="bc"></div><div class="selfrate" style="grid-template-columns:1fr 1fr"><button class="btn" data-v="0">Неверно</button><button class="btn primary" data-v="1">Верно</button></div></div>`;
      const ans = v => { if (left <= 0) return; if ((v === 1) === cur.truth) score++; else score = Math.max(0, score - 1); $('#sc').textContent = score; next(); };
      $$('[data-v]', root).forEach(b => b.onclick = () => ans(+b.dataset.v));
      const key = e => { if (e.key === 'ArrowLeft') ans(0); if (e.key === 'ArrowRight') ans(1); }; document.addEventListener('keydown', key);
      next();
      const t = setInterval(() => {
        if (!$('#tm')) { clearInterval(t); document.removeEventListener('keydown', key); return; }
        left--; $('#tm').textContent = left;
        if (left <= 0) { clearInterval(t); document.removeEventListener('keydown', key); if (score > (S.best.blitz || 0)) S.best.blitz = score; save(); root.innerHTML = `<div class="panel result"><div class="big">${score}</div><p>Рекорд: ${S.best.blitz}</p><div class="btn-row" style="justify-content:center"><button class="btn primary" id="again">Ещё раз</button></div></div>`; $('#again').onclick = V.blitz; addXP(score); }
      }, 1000);
    };
  };

  /* ——— Тесты / контрольные ——— */
  V.tests = n => {
    if (!n) {
      return mount(`<div class="narrow"><h1>${esc(L.tests.title)}</h1><p class="lead">${esc(L.tests.lead)}</p>
        ${Object.keys(P.tests).map(k => { const t = P.tests[k], c = courseOf(+t.course) || {}; return `<a class="continue" href="#/tests/${k}" style="--c:${c.color || 'var(--accent)'}"><div><small>${esc(t.course ? 'Курс ' + t.label : t.label)} · ${t.items.length} ${plural(t.items.length, ['задание', 'задания', 'заданий'])}</small><b>${esc(t.title)}</b><div class="bar" style="margin-top:8px;width:220px;max-width:100%"><i style="width:${testPct(k)}%"></i></div></div><span style="margin-left:auto;font:700 20px var(--serif)">${testPct(k)}%</span></a>`; }).join('')}</div>`, L.tests.title);
    }
    const t = P.tests[n]; if (!t) return V.notfound();
    const r = S.tests[n] = S.tests[n] || {};
    let parts = [], cur = null; t.items.forEach((it, i) => { if (it.part && (!cur || cur.name !== it.part)) { cur = { name: it.part, items: [] }; parts.push(cur); } if (!cur) { cur = { name: '', items: [] }; parts.push(cur); } cur.items.push(i); });
    mount(`<div class="narrow tq"><nav class="crumbs"><a href="#/tests">${esc(L.tests.title)}</a> / <span>${esc(t.label)}</span></nav><h1>${esc(t.title)}</h1>
      ${t.intro ? `<p class="lead">${inline(t.intro)}</p>` : ''}
      <div class="ready"><div class="bar"><i id="rbar" style="width:${testPct(n)}%"></i></div><b id="rpct">${testPct(n)}%</b></div>
      <p class="muted">Готовность: «решил» = 1, «частично» = ½. <button class="btn ghost" id="onlyWeak" style="min-height:32px;padding:4px 10px">Показать только нерешённые</button></p>
      ${parts.map(p => `${p.name ? `<h2>${esc(p.name)}</h2>` : ''}${p.items.map(i => { const it = t.items[i]; return `<div class="panel tqi" data-i="${i}" style="margin:12px 0" data-r="${r[i] == null ? '' : r[i]}"><div class="q-top"><span>Задание ${i + 1}${it.pts ? ' · ' + it.pts + ' ' + plural(it.pts, ['балл', 'балла', 'баллов']) : ''}</span><span class="st">${r[i] === 2 ? '✓ решил' : r[i] === 1 ? '◐ частично' : r[i] === 0 ? '✗ не решил' : ''}</span></div><div class="q-text md" style="font-size:17px">${md(it.q)}</div>
        <button class="btn" data-show>Показать решение</button><div class="ans" hidden><div class="model md">${md(it.a)}</div>${it.lesson ? `<a href="#/l/${it.lesson}" style="font-size:14px">Перечитать урок</a>` : ''}
        <div class="selfrate"><button class="btn" data-s="0">Не решил</button><button class="btn" data-s="1">Частично</button><button class="btn primary" data-s="2">Решил</button></div></div></div>`; }).join('')}`).join('')}
    </div>`, t.title);
    main().onclick = e => {
      const box = e.target.closest('.tqi'); if (box) {
        const i = +box.dataset.i;
        if (e.target.closest('[data-show]')) { $('.ans', box).hidden = false; e.target.closest('[data-show]').remove(); }
        const s = e.target.closest('[data-s]'); if (s) { const v = +s.dataset.s; const first = r[i] == null; r[i] = v; box.dataset.r = v; $('.st', box).textContent = v === 2 ? '✓ решил' : v === 1 ? '◐ частично' : '✗ не решил'; save(); if (first) addXP(v === 2 ? 3 : 1); $('#rbar').style.width = testPct(n) + '%'; $('#rpct').textContent = testPct(n) + '%'; checkAch(); const nx = box.nextElementSibling; if (nx && nx.classList.contains('tqi')) nx.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
      if (e.target.id === 'onlyWeak') { const on = e.target.dataset.on !== '1'; e.target.dataset.on = on ? '1' : '0'; e.target.textContent = on ? 'Показать все' : 'Показать только нерешённые'; $$('.tqi').forEach(b => { b.style.display = on && b.dataset.r === '2' ? 'none' : ''; }); }
    };
  };

  /* ——— Лента времени ——— */
  V.timeline = () => {
    const f = new URLSearchParams(location.hash.split('?')[1] || '').get('c') || 'all';
    const list = EVENTS.filter(e => f === 'all' || e.course === +f);
    const cent = y => y < 0 ? Math.ceil(-y / 100) + ' век до н. э.' : Math.floor((y - 1) / 100 + 1) + ' век';
    let html = '', curC = '';
    for (const e of list) { const c = cent(e.y); if (c !== curC) { html += `<h3>${c}</h3>`; curC = c; } html += `<div class="ev" ${cs(e.course)}><b>${esc(e.label)}</b> — ${inline(e.t)} <a href="#/l/${e.lesson}">${esc(L.lessonWord)}</a></div>`; }
    mount(`<div class="narrow"><h1>${esc(L.timeline.title)}</h1><p class="lead">${EVENTS.length} событий из всех уроков. Фильтр по курсу:</p><div class="chips">${['all', ...courses.map(c => c.n)].map(s => `<a class="chip" href="#/timeline?c=${s}" aria-pressed="${String(s) === f}">${s === 'all' ? 'Все' : 'Курс ' + courseOf(s).roman}</a>`).join('')}</div><div class="tl">${html || '<p class="muted">В этом курсе событий нет.</p>'}</div></div>`, L.timeline.title);
  };

  /* ——— Карта мест ——— */
  V.places = () => {
    if (!P.places.length || !P.outline) return V.notfound();
    S.visits.places = 1; save();
    const o = P.outline; const W = 600, H = 380;
    const pr = (lon, lat) => [((lon - o.box[0]) / (o.box[2] - o.box[0])) * W, ((o.box[3] - lat) / (o.box[3] - o.box[1])) * H];
    const poly = pts => pts.map(p => pr(p[0], p[1]).map(v => v.toFixed(1)).join(',')).join(' ');
    const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(C.places.title)}: схема">
      ${o.land.map(p => `<polygon class="map-land" points="${poly(p)}"/>`).join('')}${o.lakes.map(p => `<polygon class="map-lake" points="${poly(p)}"/>`).join('')}
      ${P.places.map((p, i) => { const [x, y] = pr(p.lon, p.lat); return `<g class="map-pt" data-p="${i}" tabindex="0" role="button" aria-label="${esc(p.name)}"><circle cx="${x}" cy="${y}" r="10"/><text x="${x + (p.dx != null ? p.dx : 14)}" y="${y + (p.dy != null ? p.dy : 7)}" text-anchor="${p.anchor || 'start'}">${esc(p.name)}</text></g>`; }).join('')}</svg>`;
    mount(`<h1>${esc(C.places.title)}</h1><p class="lead">${esc(C.places.lead)}</p>
      <div class="map-wrap">${svg}</div><p class="muted" style="font-size:13px">Схема условная, масштаб приблизительный.</p>
      <div class="grid" style="margin-top:16px">${P.places.map((p, i) => `<div class="tile place" id="pl${i}"><b>◆ ${esc(p.name)}</b><small class="muted">${esc(p.alt || '')}</small>${p.items.map(it => `<p style="color:var(--ink)">${inline(it)}</p>`).join('')}${p.lesson ? `<a href="#/l/${p.lesson}" style="font-size:14px">К уроку</a>` : ''}</div>`).join('')}</div>`, C.places.title);
    const open = i => { $$('.map-pt').forEach(g => g.classList.toggle('on', g.dataset.p == i)); $$('.place').forEach(x => x.classList.remove('on')); const el = $('#pl' + i); el.classList.add('on'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); S.visits['pl:' + i] = 1; save(); checkAch(); };
    $$('.map-pt').forEach(g => { g.onclick = () => open(+g.dataset.p); g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(+g.dataset.p); } }; });
  };

  /* ——— Словарь ——— */
  V.glossary = () => {
    const q0 = new URLSearchParams(location.hash.split('?')[1] || '').get('q') || '';
    const items = P.glossary.slice().sort((a, b) => a[0].localeCompare(b[0], 'ru'));
    const letters = Array.from(new Set(items.map(g => g[0][0].toUpperCase())));
    mount(`<div class="narrow"><h1>Словарь терминов</h1><input class="filter" id="gf" type="search" placeholder="Найти термин" value="${esc(q0)}" aria-label="Фильтр терминов">
      <div class="az">${letters.map(l => `<a href="#/glossary" data-l="${esc(l)}">${esc(l)}</a>`).join('')}</div><dl class="gl" id="gl"></dl>
      <a class="btn" href="#/train/cards/terms">Учить термины карточками</a></div>`, 'Словарь');
    const draw = q => { q = q.toLowerCase(); $('#gl').innerHTML = items.filter(g => !q || (g[0] + ' ' + g[1]).toLowerCase().includes(q)).map(g => `<dt id="g-${esc(g[0])}">${inline(g[0])}</dt><dd>${inline(g[1])}</dd>`).join('') || '<p class="muted">Ничего не найдено.</p>'; };
    $('#gf').oninput = e => draw(e.target.value); draw(q0);
    $$('.az a').forEach(a => a.onclick = e => { e.preventDefault(); $('#gf').value = ''; draw(''); const t = $$('#gl dt').find(d => d.textContent[0].toUpperCase() === a.dataset.l); if (t) t.scrollIntoView({ behavior: 'smooth' }); });
  };

  /* ——— Персоналии ——— */
  V.authors = () => {
    mount(`<h1>${esc(C.people.title)}</h1><input class="filter" id="af" type="search" placeholder="Имя, открытие, эпоха" aria-label="Фильтр"><div class="grid" id="al"></div>`, C.people.title);
    const draw = q => { q = q.toLowerCase(); $('#al').innerHTML = P.authors.filter(a => !q || JSON.stringify(a).toLowerCase().includes(q)).map(a => `<a class="tile author" href="${a.lesson ? '#/l/' + a.lesson : '#/authors'}" ${cs(a.course)}><b>${esc(a.name)}</b><span class="yrs">${esc(a.years)}</span><p>${inline(a.note)}</p></a>`).join(''); };
    $('#af').oninput = e => draw(e.target.value); draw('');
  };

  /* ——— Профиль ——— */
  V.me = () => {
    const r = rankOf(S.xp);
    mount(`<div class="narrow"><h1>Мой прогресс</h1>
      <div class="panel rank-card"><div class="seal" aria-hidden="true">${esc(C.monogram)}</div><div><b style="font:700 22px var(--serif)">${esc(r.name)}</b><p class="muted" style="margin:4px 0 8px">${S.xp} опыта${r.next ? ' · до звания «' + esc(r.next[1]) + '» осталось ' + (r.next[0] - S.xp) : ' · высшее звание'}</p><div class="bar"><i style="width:${r.next ? Math.round(100 * (S.xp - r.min) / (r.next[0] - r.min)) : 100}%"></i></div></div></div>
      <div class="stats"><div class="stat"><b>${Object.keys(S.done).length}</b><span>уроков</span></div>${P.drills.length ? `<div class="stat"><b>${solved()}</b><span>задач решено</span></div><div class="stat"><b>${P.drills.reduce((s, d) => s + mastered(d.id), 0)}</b><span>звёзд из ${P.drills.length * 3}</span></div>` : ''}<div class="stat"><b>${correctCount()}</b><span>верных ответов</span></div><div class="stat"><b>${S.best.cardsSeen || 0}</b><span>повторений карточек</span></div><div class="stat"><b>${streak()}</b><span>дней подряд</span></div></div>
      <h2>Готовность по курсам</h2>${courses.map(c => `<div style="margin:10px 0" ${cs(c.n)}><div style="display:flex;justify-content:space-between;gap:10px"><span>Курс ${c.roman}. ${esc(c.title)}</span><span class="muted">${doneIn(c.n)}/${lessonsOf(c.n).length}${P.tests[c.n] ? ' · ' + esc(L.tests.short.toLowerCase()) + ' ' + testPct(c.n) + '%' : ''}</span></div><div class="bar"><i style="width:${Math.round(100 * doneIn(c.n) / Math.max(1, lessonsOf(c.n).length))}%"></i></div></div>`).join('')}
      <h2>Достижения · ${ACH.filter(a => S.ach[a[0]]).length} из ${ACH.length}</h2>
      <div class="ach">${ACH.map(a => `<div class="${S.ach[a[0]] ? '' : 'off'}"><i>${a[1]}</i><span><b>${esc(a[2])}</b><small>${esc(a[3])}</small></span></div>`).join('')}</div>
      <h2>Звания</h2><ol>${C.ranks.map(x => `<li>${esc(x[1])} — от ${x[0]} опыта</li>`).join('')}</ol>
      <h2>Данные</h2><p class="muted">Прогресс хранится только в этом браузере. Перенесите его на другое устройство через файл.</p>
      <div class="btn-row"><button class="btn" id="exp">Скачать прогресс</button><label class="btn">Загрузить прогресс<input type="file" id="imp" accept="application/json" hidden></label><button class="btn ghost" id="rst">Сбросить всё</button></div></div>`, 'Мой прогресс');
    $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = KEY.replace(/\W+/g, '-') + '-progress.json'; a.click(); };
    $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const d = JSON.parse(t); if (typeof d.xp !== 'number') throw 0; Object.keys(S).forEach(k => delete S[k]); Object.assign(S, { drills: {}, daily: {}, lv: {} }, d); save(); toast('Прогресс загружен'); route(); } catch (err) { toast('Файл не подходит: это не файл прогресса «' + C.name + '»'); } }); };
    $('#rst').onclick = () => { if (confirm('Удалить весь прогресс? Это нельзя отменить.')) { localStorage.removeItem(KEY); location.hash = '#/'; location.reload(); } };
  };

  V.about = () => mount(`<div class="narrow lesson"><h1>О платформе</h1><div class="md">${md(P.about || '')}</div></div>`, 'О платформе');
  V.notfound = () => mount('<div class="narrow"><h1>Страница не найдена</h1><p>Такой страницы нет. <a href="#/">Вернуться на главную</a>.</p></div>', 'Не найдено');

  /* ——— Поиск ——— */
  const IDX = [];
  P.lessons.forEach(l => IDX.push({ t: l.title, s: 'Урок · курс ' + courseOf(l.course).roman, h: '#/l/' + l.id, x: (l.title + ' ' + (l.sub || '') + ' ' + strip(l.body)).toLowerCase() }));
  P.drills.forEach(d => IDX.push({ t: d.title, s: L.drills.title + ' · курс ' + (courseOf(d.course) || {}).roman, h: '#/drill/' + d.id, x: (d.title + ' ' + (d.desc || '') + ' ' + (d.tags || '')).toLowerCase() }));
  P.labs.forEach(d => IDX.push({ t: d.title, s: L.labs.title, h: '#/lab/' + d.id, x: (d.title + ' ' + (d.desc || '') + ' ' + (d.tags || '')).toLowerCase() }));
  P.authors.forEach(a => IDX.push({ t: a.name, s: C.people.one + ' · ' + a.years, h: a.lesson ? '#/l/' + a.lesson : '#/authors', x: (a.name + ' ' + a.note).toLowerCase() }));
  P.glossary.forEach(g => IDX.push({ t: strip(g[0]), s: 'Термин', h: '#/glossary?q=' + encodeURIComponent(g[0]), x: strip(g[0] + ' ' + g[1]).toLowerCase() }));
  P.works.forEach(w => IDX.push({ t: strip(w[1]), s: L.pairs.item + ' · ' + strip(w[0]), h: '#/train/pairs', x: strip(w[0] + ' ' + w[1]).toLowerCase() }));
  [[L.tests.title, '#/tests'], [L.timeline.title, '#/timeline'], ['Тренажёры', '#/train'], ['Мой прогресс', '#/me'], ...(P.drills.length ? [[L.drills.title, '#/drills'], ['Разминка дня', '#/daily']] : []), ...(P.labs.length ? [[L.labs.title, '#/labs']] : []), ...(P.places.length ? [[C.places.title, '#/' + PL]] : [])].forEach(([t, h]) => IDX.push({ t, s: 'Раздел', h, x: t.toLowerCase() }));
  let act = 0;
  function search(q) {
    q = q.trim().toLowerCase(); const ul = $('#sres');
    if (!q) { ul.innerHTML = '<li class="empty">' + esc(C.searchHint) + '</li>'; return; }
    const words = q.split(/\s+/);
    const res = IDX.map(it => { let sc = 0; for (const w of words) { if (!it.x.includes(w)) return null; if (it.t.toLowerCase().includes(w)) sc += 5; sc += 1; } return { it, sc }; }).filter(Boolean).sort((a, b) => b.sc - a.sc).slice(0, 25);
    act = 0;
    ul.innerHTML = res.length ? res.map((r, i) => `<li><a href="${r.it.h}" class="${i === 0 ? 'act' : ''}">${esc(r.it.t)}<small>${esc(r.it.s)}</small></a></li>`).join('') : '<li class="empty">' + esc(L.notFoundHint) + '</li>';
  }
  function openSearch() { $('#search').classList.add('open'); const i = $('#sin'); i.value = ''; search(''); setTimeout(() => i.focus(), 20); }
  function closeSearch() { $('#search').classList.remove('open'); }

  /* ——— Роутер ——— */
  function route() {
    const h = (location.hash || '#/').slice(1).split('?')[0]; const p = h.split('/').filter(Boolean);
    closeSearch(); markDay(); save(); const tw = $('#toasts'); if (tw) tw.innerHTML = '';
    Calc.show(p.length > 0); Calc.allow(!(p[0] === 'tests' && p[1] && (courseOf(+p[1]) || {}).n <= 2));
    try {
      if (!p.length) V.home();
      else if (p[0] === 'c') V.course(p[1]);
      else if (p[0] === 'l') V.lesson(p[1]);
      else if (p[0] === 'train' && !p[1]) V.train();
      else if (p[0] === 'train' && p[1] === 'exam') V.exam(p[2] || 'all');
      else if (p[0] === 'train' && p[1] === 'cards') V.cards(p[2] || 'all');
      else if (p[0] === 'train' && ['chrono', 'pairs', 'heroes', 'blitz'].includes(p[1])) V[p[1]]();
      else if (p[0] === 'tests') V.tests(p[1]);
      else if (p[0] === 'drill' && p[1]) V.drill(p[1]);
      else if (p[0] === 'lab' && p[1]) V.lab(p[1]);
      else if (p[0] === PL) V.places();
      else if (['timeline', 'glossary', 'authors', 'me', 'about', 'drills', 'labs', 'daily'].includes(p[0])) V[p[0]]();
      else V.notfound();
    } catch (err) { console.error(err); mount('<div class="narrow"><h1>Ошибка отображения</h1><p>Не удалось открыть страницу. <a href="#/">На главную</a></p></div>'); }
    renderChip(); checkAch();
  }

  /* ——— Запуск ——— */
  document.addEventListener('DOMContentLoaded', () => {
    Calc.build();
    $('#searchBtn').onclick = openSearch;
    const ts = $('#tabSearch'); if (ts) ts.onclick = e => { e.preventDefault(); openSearch(); };
    $('#themeBtn').onclick = toggleTheme;
    $('#search').onclick = e => { if (e.target.id === 'search') closeSearch(); };
    $('#sin').oninput = e => search(e.target.value);
    $('#sin').onkeydown = e => {
      const as = $$('#sres a'); if (!as.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); as[act].classList.remove('act'); act = (act + (e.key === 'ArrowDown' ? 1 : -1) + as.length) % as.length; as[act].classList.add('act'); as[act].scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter') { e.preventDefault(); location.hash = as[act].getAttribute('href'); closeSearch(); }
    };
    $('#sres').onclick = e => { if (e.target.closest('a')) closeSearch(); };
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
      else if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
      else if (e.key === 'Escape') closeSearch();
    });
    $('#year').textContent = new Date().getFullYear();
    window.addEventListener('hashchange', route);
    route();
  });
  window.EduEngine = { md, inline, tex, Q, CARDS, EVENTS, state: S, R, evalExpr, checkAnswer, genTask, calcEval, exactForm, Calc };
})();
