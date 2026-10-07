/* EduEngine — универсальный движок учебной платформы (SPA на hash-роутинге, без сборки).
   Данные: window.PLATFORM (config.js + файлы контента). Прогресс: localStorage. */
(function () {
  'use strict';
  const P = window.PLATFORM, C = P.config;
  const DEF = { hero: { title: C.name, lead: '' }, monogram: (C.name || '?')[0], searchHint: 'Введите слово для поиска', places: { route: 'places', title: 'Карта', lead: 'Нажмите точку на схеме.', teaser: '' }, people: { title: 'Персоналии', one: 'Персона', teaser: 'имён с краткими справками.' } };
  for (const k in DEF) C[k] = typeof DEF[k] === 'object' ? Object.assign({}, DEF[k], C[k] || {}) : (C[k] || DEF[k]);
  const PL = C.places.route;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const today = () => new Date().toISOString().slice(0, 10);
  const plural = (n, f) => { const m10 = n % 10, m100 = n % 100; return f[(m10 === 1 && m100 !== 11) ? 0 : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) ? 1 : 2]; };

  /* ——— Хранилище ——— */
  const KEY = C.storageKey;
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const S = Object.assign({ xp: 0, done: {}, quiz: {}, cards: {}, ach: {}, tests: {}, best: {}, days: [], visits: {}, last: null, theme: null }, load());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* приватный режим */ } };

  /* ——— Подготовка данных ——— */
  const courses = C.courses;
  const courseOf = n => courses.find(c => c.n === n);
  const lessonsOf = n => P.lessons.filter(l => l.course === n);
  const byId = {}; P.lessons.forEach((l, i) => { byId[l.id] = l; l.idx = i; });
  const Q = []; // общий банк вопросов
  P.lessons.forEach(l => (l.quiz || []).forEach((q, i) => Q.push({ id: l.id + '#' + i, q: q[0], a: q[1], c: q[2], e: q[3] || '', lesson: l.id, course: l.course })));
  const CARDS = [];
  P.lessons.forEach(l => (l.cards || []).forEach((c, i) => CARDS.push({ id: l.id + '#' + i, f: c[0], b: c[1], lesson: l.id, course: l.course })));
  P.glossary.forEach((g, i) => CARDS.push({ id: 'gl#' + i, f: g[0], b: g[1], lesson: null, course: 0 }));
  const EVENTS = [];
  P.lessons.forEach(l => (l.events || []).forEach(e => EVENTS.push({ y: e[0], label: e[2] || String(e[0]), t: e[1], lesson: l.id, course: l.course })));
  EVENTS.sort((a, b) => a.y - b.y);

  /* ——— Мини-разметка уроков ——— */
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(«])\*(?!\s)(.+?)\*(?=[\s.,;:!?)»]|$)/g, '$1<em>$2</em>')
      .replace(/\[\[(.+?)\]\]/g, (m, t) => '<a href="#/glossary?q=' + encodeURIComponent(t) + '">' + t + '</a>')
      .replace(/\[(.+?)\]\(#(.+?)\)/g, '<a href="#$2">$1</a>');
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
      if ((m = line.match(/^(#{2,3})\s+(.*)/))) { flush(); out += '<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>'; continue; }
      if ((m = line.match(/^>(!|e|i|\?)\s+(.*)/))) {
        flush();
        if (m[1] === '?') { const [sum, ...rest] = m[2].split(' :: '); out += '<details class="alt"><summary>' + inline(sum) + '</summary><p>' + inline(rest.join(' :: ')) + '</p></details>'; }
        else { const cls = { '!': 'exam', e: 'est', i: 'info' }[m[1]]; const lab = Object.assign({ '!': 'На экзамене: ', e: 'Важно: ', i: '' }, C.calloutLabels || {})[m[1]]; out += '<div class="note ' + cls + '"><strong>' + lab + '</strong>' + inline(m[2]) + '</div>'; }
        continue;
      }
      if (line.startsWith('|')) { flushP(); flushL(); const cells = line.replace(/^\||\|$/g, '').split('|').map(c => c.trim()); if (cells.every(c => /^-+$/.test(c))) continue; (table = table || []).push(cells); continue; }
      if ((m = line.match(/^(-|\d+\.)\s+(.*)/))) { flushP(); flushT(); const t = m[1] === '-' ? 'ul' : 'ol'; if (!list || list.t !== t) { flushL(); list = { t, items: [] }; } list.items.push(m[2]); continue; }
      flushL(); flushT(); para.push(line);
    }
    flush();
    return out;
  }

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
  const ACH = [
    ['first', '📖', 'Первая страница', 'Завершить первый урок', () => Object.keys(S.done).length >= 1],
    ['ten', '📚', 'Десять глав', 'Завершить 10 уроков', () => Object.keys(S.done).length >= 10],
    ['half', '🏛', 'Полпути', 'Завершить половину всех уроков', () => Object.keys(S.done).length >= P.lessons.length / 2],
    ['all', '👑', 'Вся летопись', 'Завершить все уроки', () => Object.keys(S.done).length >= P.lessons.length],
    ...courses.map(c => ['course' + c.n, '✦', 'Курс ' + c.roman, 'Пройти все уроки курса «' + c.title + '»', () => doneIn(c.n) === lessonsOf(c.n).length && lessonsOf(c.n).length > 0]),
    ['q50', '🎯', 'Меткий', '50 верных ответов', () => correctCount() >= 50],
    ['q200', '🏹', 'Снайпер', '200 верных ответов', () => correctCount() >= 200],
    ['perfect', '💯', 'Без единой ошибки', 'Пройти тест урока на 100%', () => !!S.ach._perfect],
    ['cards50', '🗂', 'Картотека', 'Повторить 50 карточек', () => (S.best.cardsSeen || 0) >= 50],
    ['cards300', '🧠', 'Долгая память', 'Повторить 300 карточек', () => (S.best.cardsSeen || 0) >= 300],
    ['chrono', '⏳', 'Летописец', 'Расставить хронологию без ошибок', () => !!S.ach._chrono],
    ['pairs', '🔗', 'Сводник', 'Собрать все пары «автор — произведение»', () => !!S.ach._pairs],
    ['blitz', '⚡', 'Скорострел', 'Набрать 15 очков в блице', () => (S.best.blitz || 0) >= 15],
    ['heroes', '🎭', 'Театрал', 'Угадать 10 героев подряд', () => (S.best.heroes || 0) >= 10],
    ['exam', '🎓', 'Экзаменуемый', 'Сдать пробный экзамен на 80%+', () => !!S.ach._exam],
    ['ready', '✅', 'Готов к сдаче', 'Готовность 80%+ по тесту преподавателя', () => Object.keys(P.tests).some(n => testPct(n) >= 80)],
    ['places', '◆', 'Краевед', 'Открыть все места на карте', () => P.places.length > 0 && Object.keys(S.visits).filter(k => k.startsWith('pl:')).length >= P.places.length],
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

  /* ——— Экраны ——— */
  const V = {};

  V.home = () => {
    const total = P.lessons.length, done = Object.keys(S.done).length;
    const last = S.last && byId[S.last];
    const nextL = last ? (P.lessons[last.idx + 1] && !S.done[last.id] ? last : P.lessons[last.idx + 1] || last) : P.lessons[0];
    mount(`<div class="home-top">
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
      <div class="shelf-legend">${courses.map(c => `<a href="#/c/${c.n}" style="--c:${c.color}"><b>${c.roman}</b><div>${esc(c.title)}<span>${esc(c.short)} · ${doneIn(c.n)}/${lessonsOf(c.n).length}</span></div></a>`).join('')}</div>
      ${nextL ? `<a class="continue" href="#/l/${nextL.id}" ${cs(nextL.course)}><div><small>${S.last ? 'Продолжить' : 'Начать с первого урока'}</small><b>${esc(nextL.title)}</b></div><span style="margin-left:auto">›</span></a>` : ''}
      <div class="stats">
        <div class="stat"><b>${done}/${total}</b><span>уроков пройдено</span></div>
        <div class="stat"><b>${correctCount()}</b><span>верных ответов из ${Q.length}</span></div>
        <div class="stat"><b>${streak()}</b><span>${plural(streak(), ['день', 'дня', 'дней'])} подряд</span></div>
        <div class="stat"><b>${dueCards().length}</b><span>карточек к повторению</span></div>
      </div>
      <h2>Тренажёры</h2>
      <div class="grid">${trainTiles().slice(0, 6).join('')}</div>
      <h2>Справочники</h2>
      <div class="grid">
        ${P.places.length ? `<a class="tile" href="#/${PL}"><span class="ico">◆</span><b>${esc(C.places.title)}</b><p>${esc(C.places.teaser)} ${P.places.length} мест на карте.</p></a>` : ''}
        ${EVENTS.length ? `<a class="tile" href="#/timeline"><span class="ico">⏳</span><b>Лента времени</b><p>${EVENTS.length} событий из всех уроков в хронологическом порядке.</p></a>` : ''}
        ${P.authors.length ? `<a class="tile" href="#/authors"><span class="ico">✒</span><b>${esc(C.people.title)}</b><p>${P.authors.length} ${esc(C.people.teaser)}</p></a>` : ''}
        ${P.glossary.length ? `<a class="tile" href="#/glossary"><span class="ico">Аа</span><b>Словарь терминов</b><p>${P.glossary.length} понятий с определениями.</p></a>` : ''}
      </div>`);
  };

  function trainTiles() {
    return [
      `<a class="tile" href="#/tests"><span class="ico">✎</span><b>Тесты преподавателя</b><p>Все вопросы итоговых тестов с образцами ответов и самооценкой.</p></a>`,
      `<a class="tile" href="#/train/exam/all"><span class="ico">🎓</span><b>Пробный экзамен</b><p>20 случайных вопросов, без подсказок до конца.</p></a>`,
      `<a class="tile" href="#/train/cards/all"><span class="ico">🗂</span><b>Карточки</b><p>${CARDS.length} карточек с интервальным повторением.</p></a>`,
      `<a class="tile" href="#/train/chrono"><span class="ico">⏳</span><b>Хронология</b><p>Расставьте события в правильном порядке.</p></a>`,
      `<a class="tile" href="#/train/pairs"><span class="ico">🔗</span><b>Автор и произведение</b><p>Соедините ${P.works.length} произведений с авторами.</p></a>`,
      `<a class="tile" href="#/train/heroes"><span class="ico">🎭</span><b>Чей это герой?</b><p>${P.heroes.length} персонажей — угадайте произведение.</p></a>`,
      `<a class="tile" href="#/train/blitz"><span class="ico">⚡</span><b>Блиц «Верно или нет»</b><p>60 секунд, как можно больше ответов.</p></a>`
    ];
  }

  V.course = n => {
    n = +n; const c = courseOf(n); if (!c) return V.notfound();
    const ls = lessonsOf(n), d = doneIn(n);
    mount(`<div class="narrow" ${cs(n)}>
      <nav class="crumbs"><a href="#/">Главная</a> / <span>Курс ${c.roman}</span></nav>
      <header class="course-head"><span class="roman">Курс ${c.roman} · ${esc(c.grade)}</span><h1>${esc(c.title)}</h1><p class="lead">${esc(c.short)}</p></header>
      <div class="bar" aria-label="Прогресс курса"><i style="width:${Math.round(100 * d / Math.max(1, ls.length))}%"></i></div>
      <p class="muted">Пройдено ${d} из ${ls.length} ${plural(ls.length, ['урока', 'уроков', 'уроков'])}${P.tests[n] ? ' · готовность по тесту преподавателя ' + testPct(n) + '%' : ''}</p>
      <ol class="lessons">${ls.map(l => `<li><a href="#/l/${l.id}" class="${S.done[l.id] ? 'done' : ''}"><span><b>${esc(l.title)}</b><small>${esc(l.sub || '')}</small></span>${srcBadge(l)}</a></li>`).join('')}</ol>
      <div class="btn-row">
        <a class="btn primary" href="#/train/exam/${n}">Экзамен по курсу</a>
        <a class="btn" href="#/train/cards/${n}">Карточки курса</a>
        ${P.tests[n] ? `<a class="btn" href="#/tests/${n}">Тест преподавателя</a>` : ''}
      </div></div>`, 'Курс ' + c.roman);
  };

  V.lesson = id => {
    const l = byId[id]; if (!l) return V.notfound();
    const c = courseOf(l.course), ls = lessonsOf(l.course), i = ls.indexOf(l);
    const prev = ls[i - 1], next = ls[i + 1];
    S.last = id; save();
    const facts = l.facts && l.facts.length ? '<h2>Главное в таблице</h2><dl class="facts">' + l.facts.map(f => '<dt>' + inline(f[0]) + '</dt><dd>' + inline(f[1]) + '</dd>').join('') + '</dl>' : '';
    mount(`<article class="narrow" ${cs(l.course)}>
      <nav class="crumbs"><a href="#/">Главная</a> / <a href="#/c/${l.course}">Курс ${c.roman}</a> / <span>${i + 1} из ${ls.length}</span></nav>
      <h1>${esc(l.title)}</h1>
      <div class="lesson-meta">${srcBadge(l)}<span>${esc(l.sub || '')}</span>${S.done[id] ? '<span style="color:var(--ok)">✓ пройдено</span>' : ''}</div>
      <div class="lesson"><div class="md">${md(l.body)}</div>${facts}</div>
      <div class="section-tools">
        ${l.quiz && l.quiz.length ? `<button class="btn primary" data-act="quiz">Проверить себя · ${l.quiz.length} ${plural(l.quiz.length, ['вопрос', 'вопроса', 'вопросов'])}</button>` : ''}
        ${l.cards && l.cards.length ? `<button class="btn" data-act="cards">Карточки урока · ${l.cards.length}</button>` : ''}
        ${S.done[id] ? '' : '<button class="btn ghost" data-act="done">Отметить прочитанным</button>'}
      </div>
      <div id="activity"></div>
      <nav class="pager">${prev ? `<a href="#/l/${prev.id}"><small>‹ Назад</small>${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="next" href="#/l/${next.id}"><small>Дальше ›</small>${esc(next.title)}</a>` : `<a class="next" href="#/c/${l.course}"><small>Курс завершён ›</small>К списку уроков</a>`}</nav>
    </article>`, l.title);
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
      root.innerHTML = `<div class="panel result"><div class="big">${pct}%</div><p>${score} из ${items.length} верно. ${pct >= 90 ? 'Отлично.' : pct >= 70 ? 'Хорошо — повторите ошибки.' : 'Стоит перечитать конспект.'}</p>
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

  /* ——— Хаб тренажёров ——— */
  V.train = () => mount(`<h1>Тренажёры</h1><p class="lead">Семь режимов, которые берут вопросы, карточки и события из всех уроков.</p><div class="grid">${trainTiles().join('')}</div>
    <h2>По курсам</h2><div class="grid">${courses.map(c => `<div class="tile" ${cs(c.n)}><b style="color:var(--c)">Курс ${c.roman}</b><p>${esc(c.title)}</p><div class="btn-row"><a class="btn" href="#/train/exam/${c.n}">Экзамен</a><a class="btn" href="#/train/cards/${c.n}">Карточки</a></div></div>`).join('')}</div>`, 'Тренажёры');

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
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/train">Тренажёры</a> / <span>Хронология</span></nav><h1>Хронология</h1><p class="lead">Расставьте события от раннего к позднему кнопками ↑ ↓.</p><div id="act"></div></div>`, 'Хронология');
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
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/train">Тренажёры</a> / <span>Автор и произведение</span></nav><h1>Автор и произведение</h1><p class="lead">Нажмите произведение, затем его автора.</p><div id="act"></div></div>`, 'Пары');
    const root = $('#act');
    const round = () => {
      const set = []; const used = new Set();
      for (const w of shuffle(P.works)) { if (!used.has(w[1])) { used.add(w[1]); set.push(w); } if (set.length === 6) break; }
      const left = shuffle(set), right = shuffle(set); let sel = null, done = 0, miss = 0;
      root.innerHTML = `<div class="panel"><div class="pairs"><div class="col">${left.map((w, k) => `<button class="pair" data-l="${k}">«${esc(w[0])}»</button>`).join('')}</div><div class="col">${right.map((w, k) => `<button class="pair" data-r="${k}">${esc(w[1])}</button>`).join('')}</div></div><p class="muted" id="pmsg" style="margin:12px 0 0">Ошибок: 0</p></div>`;
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
    mount(`<div class="narrow"><nav class="crumbs"><a href="#/train">Тренажёры</a> / <span>Чей это герой?</span></nav><h1>Чей это герой?</h1><p class="lead">Серия правильных ответов подряд — ваш рекорд: ${S.best.heroes || 0}.</p><div id="act"></div></div>`, 'Герои');
    const root = $('#act'); let run = 0; const worksAll = Array.from(new Set(P.heroes.map(h => h[1])));
    const next = () => {
      const h = P.heroes[Math.floor(Math.random() * P.heroes.length)];
      const opts = shuffle([h[1], ...pick(worksAll.filter(w => w !== h[1]), 3)]);
      root.innerHTML = `<div class="panel"><div class="q-top"><span>Серия: ${run}</span><span>Рекорд: ${S.best.heroes || 0}</span></div><p class="q-text">${esc(h[0])}</p>${h[2] ? `<p class="muted" style="margin-top:-6px">${esc(h[2])}</p>` : ''}<div class="opts">${opts.map(o => `<button class="opt">«${esc(o)}»</button>`).join('')}</div><div class="fb"></div></div>`;
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
        if (left <= 0) { clearInterval(t); document.removeEventListener('keydown', key); if (score > (S.best.blitz || 0)) S.best.blitz = score; save(); root.innerHTML = `<div class="panel result"><div class="big">${score}</div><p>Рекорд: ${S.best.blitz}</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/train/blitz" onclick="location.reload()">Ещё раз</a></div></div>`; addXP(score); }
      }, 1000);
    };
  };

  /* ——— Тесты преподавателя ——— */
  V.tests = n => {
    if (!n) {
      return mount(`<div class="narrow"><h1>Тесты преподавателя</h1><p class="lead">Вопросы итоговых тестов по каждому курсу. Сначала ответьте сами (устно или в поле), затем откройте образец и честно оцените себя — так считается готовность.</p>
        ${Object.keys(P.tests).map(k => { const t = P.tests[k], c = courseOf(+t.course) || {}; return `<a class="continue" href="#/tests/${k}" style="--c:${c.color || 'var(--accent)'}"><div><small>${esc(t.course ? 'Курс ' + t.label : t.label)} · ${t.items.length} вопросов</small><b>${esc(t.title)}</b><div class="bar" style="margin-top:8px;width:220px"><i style="width:${testPct(k)}%"></i></div></div><span style="margin-left:auto;font:700 20px var(--serif)">${testPct(k)}%</span></a>`; }).join('')}</div>`, 'Тесты преподавателя');
    }
    const t = P.tests[n]; if (!t) return V.notfound();
    const r = S.tests[n] = S.tests[n] || {};
    let parts = [], cur = null; t.items.forEach((it, i) => { if (it.part && (!cur || cur.name !== it.part)) { cur = { name: it.part, items: [] }; parts.push(cur); } if (!cur) { cur = { name: '', items: [] }; parts.push(cur); } cur.items.push(i); });
    mount(`<div class="narrow tq"><nav class="crumbs"><a href="#/tests">Тесты преподавателя</a> / <span>${esc(t.label)}</span></nav><h1>${esc(t.title)}</h1>
      <div class="ready"><div class="bar"><i id="rbar" style="width:${testPct(n)}%"></i></div><b id="rpct">${testPct(n)}%</b></div>
      <p class="muted">Готовность: «знал» = 1, «частично» = ½. <button class="btn ghost" id="onlyWeak" style="min-height:32px;padding:4px 10px">Показать только неуверенные</button></p>
      ${parts.map(p => `${p.name ? `<h2>${esc(p.name)}</h2>` : ''}${p.items.map(i => { const it = t.items[i]; return `<div class="panel tqi" data-i="${i}" style="margin:12px 0" data-r="${r[i] == null ? '' : r[i]}"><div class="q-top"><span>Вопрос ${i + 1}</span><span class="st">${r[i] === 2 ? '✓ знаю' : r[i] === 1 ? '◐ частично' : r[i] === 0 ? '✗ не знаю' : ''}</span></div><p class="q-text" style="font-size:17px">${inline(it.q)}</p>
        <button class="btn" data-show>Показать ответ</button><div class="ans" hidden><div class="model">${inline(it.a)}</div>${it.lesson ? `<a href="#/l/${it.lesson}" style="font-size:14px">Перечитать урок</a>` : ''}
        <div class="selfrate"><button class="btn" data-s="0">Не знал</button><button class="btn" data-s="1">Частично</button><button class="btn primary" data-s="2">Знал</button></div></div></div>`; }).join('')}`).join('')}
    </div>`, t.title);
    main().onclick = e => {
      const box = e.target.closest('.tqi'); if (box) {
        const i = +box.dataset.i;
        if (e.target.closest('[data-show]')) { $('.ans', box).hidden = false; e.target.closest('[data-show]').remove(); }
        const s = e.target.closest('[data-s]'); if (s) { const v = +s.dataset.s; const first = r[i] == null; r[i] = v; box.dataset.r = v; $('.st', box).textContent = v === 2 ? '✓ знаю' : v === 1 ? '◐ частично' : '✗ не знаю'; save(); if (first) addXP(v === 2 ? 3 : 1); $('#rbar').style.width = testPct(n) + '%'; $('#rpct').textContent = testPct(n) + '%'; checkAch(); const nx = box.nextElementSibling; if (nx && nx.classList.contains('tqi')) nx.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
      if (e.target.id === 'onlyWeak') { const on = e.target.dataset.on !== '1'; e.target.dataset.on = on ? '1' : '0'; e.target.textContent = on ? 'Показать все' : 'Показать только неуверенные'; $$('.tqi').forEach(b => { b.style.display = on && b.dataset.r === '2' ? 'none' : ''; }); }
    };
  };

  /* ——— Лента времени ——— */
  V.timeline = () => {
    const f = new URLSearchParams(location.hash.split('?')[1] || '').get('c') || 'all';
    const list = EVENTS.filter(e => f === 'all' || e.course === +f);
    const cent = y => y < 0 ? Math.ceil(-y / 100) + ' век до н. э.' : Math.floor((y - 1) / 100 + 1) + ' век';
    let html = '', curC = '';
    for (const e of list) { const c = cent(e.y); if (c !== curC) { html += `<h3>${c}</h3>`; curC = c; } html += `<div class="ev" ${cs(e.course)}><b>${esc(e.label)}</b> — ${inline(e.t)} <a href="#/l/${e.lesson}">урок</a></div>`; }
    mount(`<div class="narrow"><h1>Лента времени</h1><p class="lead">${EVENTS.length} событий из всех уроков. Фильтр по курсу:</p><div class="chips">${['all', ...courses.map(c => c.n)].map(s => `<a class="chip" href="#/timeline?c=${s}" aria-pressed="${String(s) === f}">${s === 'all' ? 'Все' : 'Курс ' + courseOf(s).roman}</a>`).join('')}</div><div class="tl">${html}</div></div>`, 'Лента времени');
  };

  /* ——— Карта мест ——— */
  V.places = () => {
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
      <div class="az">${letters.map(l => `<a href="#/glossary" data-l="${l}">${l}</a>`).join('')}</div><dl class="gl" id="gl"></dl>
      <a class="btn" href="#/train/cards/terms">Учить термины карточками</a></div>`, 'Словарь');
    const draw = q => { q = q.toLowerCase(); $('#gl').innerHTML = items.filter(g => !q || (g[0] + ' ' + g[1]).toLowerCase().includes(q)).map(g => `<dt id="g-${esc(g[0])}">${esc(g[0])}</dt><dd>${inline(g[1])}</dd>`).join('') || '<p class="muted">Ничего не найдено.</p>'; };
    $('#gf').oninput = e => draw(e.target.value); draw(q0);
    $$('.az a').forEach(a => a.onclick = e => { e.preventDefault(); $('#gf').value = ''; draw(''); const t = $$('#gl dt').find(d => d.textContent[0].toUpperCase() === a.dataset.l); if (t) t.scrollIntoView({ behavior: 'smooth' }); });
  };

  /* ——— Писатели ——— */
  V.authors = () => {
    mount(`<h1>${esc(C.people.title)}</h1><input class="filter" id="af" type="search" placeholder="Имя, направление, произведение" aria-label="Фильтр писателей"><div class="grid" id="al"></div>`, C.people.title);
    const draw = q => { q = q.toLowerCase(); $('#al').innerHTML = P.authors.filter(a => !q || JSON.stringify(a).toLowerCase().includes(q)).map(a => `<a class="tile author" href="${a.lesson ? '#/l/' + a.lesson : '#/authors'}" ${cs(a.course)}><b>${esc(a.name)}</b><span class="yrs">${esc(a.years)}</span><p>${inline(a.note)}</p></a>`).join(''); };
    $('#af').oninput = e => draw(e.target.value); draw('');
  };

  /* ——— Профиль ——— */
  V.me = () => {
    const r = rankOf(S.xp);
    mount(`<div class="narrow"><h1>Мой прогресс</h1>
      <div class="panel rank-card"><div class="seal" aria-hidden="true">${esc(C.monogram)}</div><div><b style="font:700 22px var(--serif)">${esc(r.name)}</b><p class="muted" style="margin:4px 0 8px">${S.xp} опыта${r.next ? ' · до звания «' + esc(r.next[1]) + '» осталось ' + (r.next[0] - S.xp) : ' · высшее звание'}</p><div class="bar"><i style="width:${r.next ? Math.round(100 * (S.xp - r.min) / (r.next[0] - r.min)) : 100}%"></i></div></div></div>
      <div class="stats"><div class="stat"><b>${Object.keys(S.done).length}</b><span>уроков</span></div><div class="stat"><b>${correctCount()}</b><span>верных ответов</span></div><div class="stat"><b>${S.best.cardsSeen || 0}</b><span>повторений карточек</span></div><div class="stat"><b>${streak()}</b><span>дней подряд</span></div></div>
      <h2>Готовность по курсам</h2>${courses.map(c => `<div style="margin:10px 0" ${cs(c.n)}><div style="display:flex;justify-content:space-between"><span>Курс ${c.roman}. ${esc(c.title)}</span><span class="muted">${doneIn(c.n)}/${lessonsOf(c.n).length} · тест ${testPct(c.n)}%</span></div><div class="bar"><i style="width:${Math.round(100 * doneIn(c.n) / Math.max(1, lessonsOf(c.n).length))}%"></i></div></div>`).join('')}
      <h2>Достижения · ${ACH.filter(a => S.ach[a[0]]).length} из ${ACH.length}</h2>
      <div class="ach">${ACH.map(a => `<div class="${S.ach[a[0]] ? '' : 'off'}"><i>${a[1]}</i><span><b>${esc(a[2])}</b><small>${esc(a[3])}</small></span></div>`).join('')}</div>
      <h2>Звания</h2><ol>${C.ranks.map(x => `<li>${esc(x[1])} — от ${x[0]} опыта</li>`).join('')}</ol>
      <h2>Данные</h2><p class="muted">Прогресс хранится только в этом браузере. Перенесите его на другое устройство через файл.</p>
      <div class="btn-row"><button class="btn" id="exp">Скачать прогресс</button><label class="btn">Загрузить прогресс<input type="file" id="imp" accept="application/json" hidden></label><button class="btn ghost" id="rst">Сбросить всё</button></div></div>`, 'Мой прогресс');
    $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = KEY.replace(/\W+/g, '-') + '-progress.json'; a.click(); };
    $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const d = JSON.parse(t); if (typeof d.xp !== 'number') throw 0; Object.keys(S).forEach(k => delete S[k]); Object.assign(S, d); save(); toast('Прогресс загружен'); route(); } catch (err) { toast('Файл не подходит: это не файл прогресса «' + C.name + '»'); } }); };
    $('#rst').onclick = () => { if (confirm('Удалить весь прогресс? Это нельзя отменить.')) { localStorage.removeItem(KEY); location.hash = '#/'; location.reload(); } };
  };

  V.about = () => mount(`<div class="narrow lesson"><h1>О платформе</h1><div class="md">${md(P.about || '')}</div></div>`, 'О платформе');
  V.notfound = () => mount('<div class="narrow"><h1>Страница не найдена</h1><p>Такой страницы нет. <a href="#/">Вернуться на главную</a>.</p></div>', 'Не найдено');

  /* ——— Поиск ——— */
  const IDX = [];
  P.lessons.forEach(l => IDX.push({ t: l.title, s: 'Урок · курс ' + courseOf(l.course).roman, h: '#/l/' + l.id, x: (l.title + ' ' + (l.sub || '') + ' ' + l.body).toLowerCase() }));
  P.authors.forEach(a => IDX.push({ t: a.name, s: C.people.one + ' · ' + a.years, h: a.lesson ? '#/l/' + a.lesson : '#/authors', x: (a.name + ' ' + a.note).toLowerCase() }));
  P.glossary.forEach(g => IDX.push({ t: g[0], s: 'Термин', h: '#/glossary?q=' + encodeURIComponent(g[0]), x: (g[0] + ' ' + g[1]).toLowerCase() }));
  P.works.forEach(w => IDX.push({ t: '«' + w[0] + '»', s: 'Произведение · ' + w[1], h: '#/authors', x: (w[0] + ' ' + w[1]).toLowerCase() }));
  [['Тесты', '#/tests'], [C.places.title, '#/' + PL], ['Лента времени', '#/timeline'], ['Тренажёры', '#/train'], ['Мой прогресс', '#/me']].forEach(([t, h]) => IDX.push({ t, s: 'Раздел', h, x: t.toLowerCase() }));
  let act = 0;
  function search(q) {
    q = q.trim().toLowerCase(); const ul = $('#sres');
    if (!q) { ul.innerHTML = '<li class="empty">' + esc(C.searchHint) + '</li>'; return; }
    const words = q.split(/\s+/);
    const res = IDX.map(it => { let sc = 0; for (const w of words) { if (!it.x.includes(w)) return null; if (it.t.toLowerCase().includes(w)) sc += 5; sc += 1; } return { it, sc }; }).filter(Boolean).sort((a, b) => b.sc - a.sc).slice(0, 25);
    act = 0;
    ul.innerHTML = res.length ? res.map((r, i) => `<li><a href="${r.it.h}" class="${i === 0 ? 'act' : ''}">${esc(r.it.t)}<small>${esc(r.it.s)}</small></a></li>`).join('') : '<li class="empty">Ничего не найдено. Попробуйте фамилию автора или название произведения.</li>';
  }
  function openSearch() { $('#search').classList.add('open'); const i = $('#sin'); i.value = ''; search(''); setTimeout(() => i.focus(), 20); }
  function closeSearch() { $('#search').classList.remove('open'); }

  /* ——— Роутер ——— */
  function route() {
    const h = (location.hash || '#/').slice(1).split('?')[0]; const p = h.split('/').filter(Boolean);
    closeSearch(); markDay(); save(); const tw = $('#toasts'); if (tw) tw.innerHTML = '';
    try {
      if (!p.length) V.home();
      else if (p[0] === 'c') V.course(p[1]);
      else if (p[0] === 'l') V.lesson(p[1]);
      else if (p[0] === 'train' && !p[1]) V.train();
      else if (p[0] === 'train' && p[1] === 'exam') V.exam(p[2] || 'all');
      else if (p[0] === 'train' && p[1] === 'cards') V.cards(p[2] || 'all');
      else if (p[0] === 'train' && V[p[1]]) V[p[1]]();
      else if (p[0] === 'tests') V.tests(p[1]);
      else if (p[0] === PL) V.places();
      else if (['timeline', 'glossary', 'authors', 'me', 'about'].includes(p[0])) V[p[0]]();
      else V.notfound();
    } catch (err) { console.error(err); mount('<div class="narrow"><h1>Ошибка отображения</h1><p>Не удалось открыть страницу. <a href="#/">На главную</a></p></div>'); }
    renderChip(); checkAch();
  }

  /* ——— Запуск ——— */
  document.addEventListener('DOMContentLoaded', () => {
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
  window.EduEngine = { md, Q, CARDS, EVENTS, state: S };
})();
