// Главная, карта курса и прохождение урока.

function wordOfTheDay() {
  const d = todayKey();
  let hash = 0;
  for (const c of d) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return ALL_WORDS[hash % ALL_WORDS.length];
}

function lessonUnlocked(unitIdx, lessonIdx) {
  if (Store.settings.unlockAll) return true;
  if (unitIdx === 0 && lessonIdx === 0) return true;
  if (lessonIdx > 0) return Store.lessonDone(UNITS[unitIdx].id, lessonIdx - 1);
  const prev = UNITS[unitIdx - 1];
  // юнит открывается, когда пройдены все уроки предыдущего (кроме итогового повторения)
  return prev.lessons.every((l, i) => l.review || Store.lessonDone(prev.id, i));
}

function nextLesson() {
  for (let u = 0; u < UNITS.length; u++) {
    for (let l = 0; l < UNITS[u].lessons.length; l++) {
      if (!Store.lessonDone(UNITS[u].id, l) && lessonUnlocked(u, l)) return { u, l };
    }
  }
  return null;
}

function unitProgress(unit) {
  const done = unit.lessons.filter((_, i) => Store.lessonDone(unit.id, i)).length;
  return { done, total: unit.lessons.length };
}

// ---------- Главная ----------
Views.home = () => {
  const s = Store.state;
  const name = Store.settings.name;
  const goal = Store.settings.dailyGoal;
  const today = Store.todayXp();
  const due = Store.srsDue().length;
  const next = nextLesson();
  const w = wordOfTheDay();
  const hour = new Date().getHours();
  const greet = hour < 12 ? '¡Buenos días' : hour < 20 ? '¡Buenas tardes' : '¡Buenas noches';

  const goalPct = Math.min(1, today / goal);
  const ring = h('div', { class: 'ring', style: { '--p': goalPct } },
    h('div', { class: 'ring-inner' }, h('b', null, today), h('small', null, '/ ' + goal + ' XP')));

  const tiles = [
    { href: '#/review', icon: '🧠', title: 'Повторение', sub: due ? `${due} ${plural(due, 'карточка', 'карточки', 'карточек')} ждут` : 'Всё повторено', hot: due > 0 },
    { href: '#/verbs/train', icon: '⚙️', title: 'Тренажёр глаголов', sub: VERBS.length + ' глаголов, 7 времён' },
    { href: '#/games/speed', icon: '⚡', title: 'Контрольное время', sub: '60 секунд на скорость' },
    { href: '#/stories', icon: '📖', title: 'Чтение', sub: STORIES.length + ' рассказов A1–B1' },
    { href: '#/dialogues', icon: '💬', title: 'Диалоги', sub: 'Ролевые ситуации' },
    { href: '#/games', icon: '🎮', title: 'Игры', sub: 'Память, виселица, числа…' },
  ];

  return h('div', { class: 'home' },
    h('section', { class: 'hero card' },
      h('div', { class: 'hero-text' },
        h('h1', null, greet + (name ? ', ' + name : '') + '!'),
        h('p', { class: 'muted' }, s.streak ? `Серия: ${s.streak} ${plural(s.streak, 'день', 'дня', 'дней')} подряд. ¡Sigue así!` : 'Начните серию сегодня — достаточно одного урока.'),
        next
          ? h('a', { class: 'btn primary big', href: `#/lesson/${UNITS[next.u].id}/${next.l}` },
            '▶ Продолжить: ', UNITS[next.u].icon, ' ', UNITS[next.u].title, ' · ', UNITS[next.u].lessons[next.l].title)
          : h('a', { class: 'btn primary big', href: '#/path' }, '🎉 Курс пройден! Повторить уроки')),
      h('div', { class: 'hero-goal' }, ring, h('div', { class: 'muted small' }, 'Цель дня'))),

    h('section', { class: 'card wotd' },
      h('div', { class: 'wotd-label' }, '✨ Palabra del día'),
      h('div', { class: 'wotd-word' }, speakBtn(primaryEs(w.es)), primaryEs(w.es)),
      h('div', { class: 'wotd-ru' }, w.ru),
      h('button', {
        class: 'btn small', type: 'button',
        onclick: e => {
          if (Store.srsAdd(w.es, w.ru)) { UI.toast('Добавлено в повторение'); updateHeader(); }
          e.target.textContent = '✓ В колоде';
          e.target.disabled = true;
        },
        disabled: Store.srsHas(w.es),
      }, Store.srsHas(w.es) ? '✓ В колоде' : '+ В повторение')),

    h('section', { class: 'tiles' }, tiles.map(t =>
      h('a', { class: 'tile card' + (t.hot ? ' hot' : ''), href: t.href },
        h('div', { class: 'tile-icon' }, t.icon),
        h('div', null, h('div', { class: 'tile-title' }, t.title), h('div', { class: 'muted small' }, t.sub))))),

    h('section', { class: 'card' },
      h('h2', null, 'Активность за 12 недель'),
      activityHeatmap()),
  );
};

function activityHeatmap() {
  const grid = h('div', { class: 'heatmap' });
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 7 * 12 + 1);
  // выравниваем по понедельнику
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const goal = Store.settings.dailyGoal;
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const key = todayKey(d);
    const xp = Store.state.activity[key] || 0;
    const lvl = xp === 0 ? 0 : xp < goal / 2 ? 1 : xp < goal ? 2 : xp < goal * 2 ? 3 : 4;
    grid.appendChild(h('div', { class: 'hm-cell l' + lvl, title: `${key}: ${xp} XP` }));
  }
  return h('div', { class: 'heatmap-wrap' }, grid,
    h('div', { class: 'hm-legend muted small' }, 'меньше ', [0, 1, 2, 3, 4].map(l => h('span', { class: 'hm-cell l' + l })), ' больше'));
}

// ---------- Карта курса ----------
Views.path = () => {
  const totalLessons = UNITS.reduce((a, u) => a + u.lessons.length, 0);
  const doneLessons = UNITS.reduce((a, u) => a + unitProgress(u).done, 0);
  const levels = ['A1', 'A2', 'B1'];
  return h('div', null,
    UI.pageHeader('Курс испанского', `${UNITS.length} тем · ${totalLessons} уроков · ${ALL_WORDS.length} слов. Пройдено: ${doneLessons}/${totalLessons}`),
    UI.progressBar(doneLessons, totalLessons, 'thick'),
    levels.map(lv => {
      const units = UNITS.map((u, i) => ({ u, i })).filter(x => x.u.level === lv);
      if (!units.length) return null;
      return h('section', { class: 'level-block' },
        h('h2', { class: 'level-title' }, h('span', { class: 'level-badge ' + lv }, lv),
          { A1: ' Начальный', A2: ' Элементарный', B1: ' Средний' }[lv]),
        h('div', { class: 'units' }, units.map(({ u, i }) => unitCard(u, i))));
    }));
};

function unitCard(unit, ui) {
  const prog = unitProgress(unit);
  const open = lessonUnlocked(ui, 0);
  return h('div', { class: 'unit card' + (open ? '' : ' locked') + (prog.done === prog.total ? ' complete' : '') },
    h('div', { class: 'unit-head' },
      h('div', { class: 'unit-icon' }, unit.icon),
      h('div', { class: 'unit-info' },
        h('h3', null, unit.title),
        h('div', { class: 'muted small' }, unit.ru + ' · ' + unit.words.length + ' слов')),
      h('div', { class: 'unit-count' }, prog.done + '/' + prog.total)),
    UI.progressBar(prog.done, prog.total),
    h('div', { class: 'lesson-dots' }, unit.lessons.map((l, li) => {
      const unlocked = lessonUnlocked(ui, li);
      const rec = Store.state.lessons[Store.lessonKey(unit.id, li)];
      const stars = rec ? '★'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars) : '';
      return unlocked
        ? h('a', { class: 'lesson-dot' + (rec ? ' done' : '') + (l.review ? ' review' : ''), href: `#/lesson/${unit.id}/${li}`, title: l.title },
          h('span', null, l.review ? '🏁' : li + 1), stars ? h('small', { class: 'stars' }, stars) : null)
        : h('span', { class: 'lesson-dot locked', title: 'Сначала пройдите предыдущие уроки' }, '🔒');
    })));
}

// ---------- Урок ----------
function buildLessonExercises(unit, lesson) {
  const pool = unit.words;
  const exs = [];
  if (!lesson.review) {
    const types = ['pick_ru', 'pick_es', 'listen'];
    lesson.words.forEach((w, i) => exs.push(makeWordExercise(types[i % 3], w, pool)));
    sample(lesson.words, 3).forEach(w => exs.push(makeWordExercise(Math.random() < 0.3 ? 'dictation' : 'type_es', w, pool)));
    exs.push(makeMatch(shuffle(lesson.words)));
    sample(unit.sentences, 2).forEach(s => exs.push(makeSentenceExercise(s, unit.sentences)));
    // перемешиваем, но match оставляем ближе к середине
    return shuffle(exs);
  }
  const words = sample(lesson.words, 10);
  const types = ['pick_ru', 'pick_es', 'listen', 'type_es', 'type_es', 'dictation'];
  words.forEach(w => exs.push(makeWordExercise(pick(types), w, pool)));
  exs.push(makeMatch(sample(lesson.words, 6)));
  sample(unit.sentences, 3).forEach(s => exs.push(makeSentenceExercise(s, unit.sentences)));
  exs.push(makeTranslateSentence(pick(unit.sentences), unit.sentences));
  return shuffle(exs);
}

Views.lesson = ([unitId, idxStr], ctx) => {
  const unitIdx = UNITS.findIndex(u => u.id === unitId);
  const unit = UNITS[unitIdx];
  const idx = +idxStr;
  const lesson = unit?.lessons[idx];
  if (!lesson) return Views.notFound();
  if (!lessonUnlocked(unitIdx, idx)) {
    return h('div', { class: 'card center' }, h('div', { class: 'big-emoji' }, '🔒'),
      h('h2', null, 'Урок пока закрыт'), h('p', { class: 'muted' }, 'Пройдите предыдущие уроки или включите «Открыть все уроки» в настройках.'),
      h('a', { class: 'btn primary', href: '#/path' }, 'К курсу'));
  }

  const root = h('div', { class: 'lesson' });
  const top = h('div', { class: 'lesson-top' },
    h('a', { class: 'icon-btn', href: '#/path', title: 'Выйти', 'aria-label': 'Выйти из урока' }, '✕'));
  const bar = h('div', { class: 'progress thick grow' }, h('div', { class: 'progress-fill' }));
  const comboEl = h('div', { class: 'combo' });
  top.append(bar, comboEl);
  const stage = h('div', { class: 'lesson-stage' });
  const footer = h('div', { class: 'lesson-footer' });
  root.append(top, stage, footer);

  let queue = [], total = 0, completed = 0, firstTryCorrect = 0, combo = 0, maxCombo = 0;
  const retried = new Set();
  let current = null, waitingNext = false;

  const setProgress = () => { bar.firstChild.style.width = (completed / total) * 100 + '%'; };

  const keyHandler = e => {
    if (e.target instanceof HTMLInputElement && !waitingNext) return;
    if (e.key === 'Enter' && waitingNext) { e.preventDefault(); footer.querySelector('.btn')?.click(); return; }
    if (e.key === 'Enter' && current?.box?.submit) { e.preventDefault(); current.box.submit(); return; }
    if (!waitingNext) current?.box?.keyHandler?.(e);
  };
  document.addEventListener('keydown', keyHandler);
  ctx.onCleanup(() => document.removeEventListener('keydown', keyHandler));

  // Вводная карточка с новыми словами
  const showIntro = () => {
    stage.innerHTML = '';
    footer.innerHTML = '';
    stage.append(h('div', { class: 'intro' },
      h('h2', null, unit.icon, ' ', unit.title, ' — ', lesson.title),
      h('p', { class: 'muted' }, 'Новые слова. Нажмите на карточку, чтобы услышать произношение.'),
      h('div', { class: 'intro-grid' }, lesson.words.map(w =>
        h('button', { class: 'intro-card', type: 'button', onclick: () => Speech.speak(primaryEs(w.es)) },
          h('div', { class: 'es' }, w.es), h('div', { class: 'muted' }, w.ru))))));
    footer.append(h('button', { class: 'btn primary big', type: 'button', onclick: start }, 'Начать урок →'));
    waitingNext = true;
  };

  const start = () => {
    queue = buildLessonExercises(unit, lesson);
    total = queue.length;
    setProgress();
    nextExercise();
  };

  const nextExercise = () => {
    waitingNext = false;
    footer.innerHTML = '';
    footer.className = 'lesson-footer';
    if (!queue.length) return finish();
    current = { ex: queue.shift() };
    stage.innerHTML = '';
    current.box = renderExercise(current.ex, onAnswer);
    stage.appendChild(current.box);
    current.box.focusTarget?.focus();
  };

  const onAnswer = (ok, info) => {
    const ex = current.ex;
    const isRetry = retried.has(ex);
    Store.answer(ok);
    if (ok) {
      SFX.correct();
      completed++;
      if (!isRetry) firstTryCorrect++;
      combo++;
      maxCombo = Math.max(maxCombo, combo);
    } else {
      SFX.wrong();
      combo = 0;
      // ошибку повторим в конце урока (один раз)
      if (!isRetry) { retried.add(ex); queue.push(ex); } else completed++;
    }
    comboEl.textContent = combo >= 3 ? '🔥 ×' + combo : '';
    setProgress();
    showFeedback(ok, info);
  };

  const showFeedback = (ok, info) => {
    waitingNext = true;
    footer.className = 'lesson-footer ' + (ok ? 'ok' : 'bad');
    const praise = pick(['¡Muy bien!', '¡Excelente!', '¡Perfecto!', '¡Genial!', '¡Correcto!', '¡Fantástico!']);
    footer.append(
      h('div', { class: 'feedback' },
        h('div', { class: 'fb-title' }, ok ? '✓ ' + praise : '✗ Неверно'),
        !ok && info.answer && !info.silent ? h('div', null, 'Правильно: ', h('b', { class: 'es' }, info.answer)) : null,
        info.note ? h('div', { class: 'small' }, info.note) : null),
      h('button', { class: 'btn ' + (ok ? 'primary' : 'danger') + ' big', type: 'button', onclick: nextExercise }, 'Далее →'));
    footer.querySelector('.btn').focus({ preventScroll: true });
  };

  const finish = () => {
    footer.innerHTML = '';
    footer.className = 'lesson-footer';
    const accuracy = firstTryCorrect / total;
    const wasDone = Store.lessonDone(unit.id, idx);
    const stars = Store.completeLesson(unit.id, idx, accuracy);
    let xp = (lesson.review ? 15 : 10) + (accuracy >= 1 ? 5 : 0) + Math.floor(maxCombo / 5);
    if (wasDone) xp = Math.ceil(xp / 2);
    let added = 0;
    for (const w of lesson.words) if (Store.srsAdd(w.es, w.ru)) added++;
    Store.addXp(xp);
    SFX.finish();
    if (stars === 3) UI.confetti();

    const ni = idx + 1 < unit.lessons.length ? { u: unitIdx, l: idx + 1 } : unitIdx + 1 < UNITS.length ? { u: unitIdx + 1, l: 0 } : null;
    stage.innerHTML = '';
    stage.append(h('div', { class: 'result' },
      h('div', { class: 'big-emoji' }, stars === 3 ? '🏆' : stars === 2 ? '🎉' : '👍'),
      h('h2', null, stars === 3 ? '¡Perfecto!' : stars === 2 ? '¡Muy bien!' : '¡Bien hecho!'),
      h('div', { class: 'result-stars' }, '★'.repeat(stars) + '☆'.repeat(3 - stars)),
      h('div', { class: 'result-stats' },
        h('div', null, h('b', null, '+' + xp), h('small', null, 'XP')),
        h('div', null, h('b', null, Math.round(accuracy * 100) + '%'), h('small', null, 'точность')),
        h('div', null, h('b', null, maxCombo), h('small', null, 'лучшая серия'))),
      added ? h('p', { class: 'muted' }, `${added} ${plural(added, 'слово добавлено', 'слова добавлены', 'слов добавлено')} в колоду повторения 🧠`) : null,
      h('div', { class: 'row center' },
        h('a', { class: 'btn', href: '#/path' }, 'К курсу'),
        h('button', { class: 'btn', type: 'button', onclick: () => render() }, 'Ещё раз'),
        ni && lessonUnlocked(ni.u, ni.l) ? h('a', { class: 'btn primary', href: `#/lesson/${UNITS[ni.u].id}/${ni.l}` }, 'Следующий урок →') : null)));
    bar.firstChild.style.width = '100%';
  };

  if (lesson.review) start(); else showIntro();
  return root;
};
