// Интервальное повторение карточек и словарь.

function intervalLabel(days) {
  if (days < 1) return '< 1 дн';
  if (days < 30) return days + ' дн';
  return Math.round(days / 30) + ' мес';
}

Views.review = (_, ctx) => {
  const root = h('div', { class: 'review' });
  const deckSize = Object.keys(Store.state.srs).length;
  let queue = Store.srsDue();
  let reverse = false, practice = false;
  let doneCount = 0, sessionXp = 0;

  const header = UI.pageHeader('Повторение', 'Интервальное повторение: карточки возвращаются как раз тогда, когда вы начинаете их забывать.');
  root.append(header);
  const area = h('div');
  root.append(area);

  const keyHandler = e => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === ' ') { e.preventDefault(); area.querySelector('.flashcard')?.click(); }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) area.querySelectorAll('.grade-btn')[n - 1]?.click();
  };
  document.addEventListener('keydown', keyHandler);
  ctx.onCleanup(() => document.removeEventListener('keydown', keyHandler));

  const empty = () => {
    area.innerHTML = '';
    if (!deckSize) {
      area.append(h('div', { class: 'card center' },
        h('div', { class: 'big-emoji' }, '🗃️'),
        h('h2', null, 'Колода пуста'),
        h('p', { class: 'muted' }, 'Слова попадают сюда после уроков. Ещё можно добавлять их из словаря.'),
        h('div', { class: 'row center' },
          h('a', { class: 'btn primary', href: '#/path' }, 'К урокам'),
          h('a', { class: 'btn', href: '#/dictionary' }, 'Открыть словарь'))));
      return;
    }
    const all = Object.values(Store.state.srs);
    const mature = all.filter(c => c.interval >= 21).length;
    const learning = all.filter(c => c.interval > 0 && c.interval < 21).length;
    const nextDue = Math.min(...all.map(c => c.due));
    area.append(h('div', { class: 'card center' },
      h('div', { class: 'big-emoji' }, doneCount ? '🎉' : '✅'),
      h('h2', null, doneCount ? `Готово! Повторено: ${doneCount}` : 'На сегодня всё повторено'),
      h('p', { class: 'muted' }, 'Следующая карточка: ' + new Date(nextDue).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })),
      h('div', { class: 'result-stats' },
        h('div', null, h('b', null, all.length), h('small', null, 'в колоде')),
        h('div', null, h('b', null, learning), h('small', null, 'изучаются')),
        h('div', null, h('b', null, mature), h('small', null, 'выучены'))),
      h('button', {
        class: 'btn primary', type: 'button',
        onclick: () => { practice = true; queue = shuffle(Object.keys(Store.state.srs)).slice(0, 20).map(es => ({ es, ...Store.state.srs[es] })); next(); },
      }, 'Дополнительная практика (20 случайных)')));
  };

  const next = () => {
    area.innerHTML = '';
    if (!queue.length) {
      if (sessionXp) Store.addXp(sessionXp);
      sessionXp = 0;
      return empty();
    }
    const card = queue[0];
    const front = reverse ? card.ru : primaryEs(card.es);
    const back = reverse ? primaryEs(card.es) : card.ru;
    let flipped = false;

    const fc = h('div', { class: 'flashcard', tabindex: '0', role: 'button', 'aria-label': 'Перевернуть карточку' },
      h('div', { class: 'fc-inner' },
        h('div', { class: 'fc-face fc-front' }, h('div', { class: reverse ? '' : 'es' }, front), h('small', { class: 'muted' }, 'нажмите, чтобы перевернуть')),
        h('div', { class: 'fc-face fc-back' },
          h('div', { class: 'muted small' }, front),
          h('div', { class: reverse ? 'es' : '' }, back),
          h('div', null, speakBtn(primaryEs(card.es))))));
    const grades = h('div', { class: 'grades', hidden: true });
    const c = Store.state.srs[card.es];
    const preview = g => {
      if (g === 0) return '1 мин';
      if (c.reps === 0) return intervalLabel(g === 3 ? 3 : 1);
      if (c.reps === 1) return intervalLabel(g === 3 ? 7 : g === 1 ? 2 : 4);
      return intervalLabel(Math.round(c.interval * (g === 1 ? 1.2 : g === 3 ? c.ease * 1.3 : c.ease)));
    };
    [['Снова', 'again'], ['Трудно', 'hard'], ['Хорошо', 'good'], ['Легко', 'easy']].forEach(([label, cls], g) => {
      grades.append(h('button', {
        class: 'grade-btn ' + cls, type: 'button',
        onclick: () => {
          if (!practice) Store.srsGrade(card.es, g);
          queue.shift();
          if (g === 0) queue.push(card);
          else { doneCount++; sessionXp += 1; }
          Store.answer(g > 0);
          updateHeader();
          next();
        },
      }, h('b', null, label), h('small', null, practice ? (g + 1) + '' : preview(g))));
    });
    fc.onclick = () => {
      if (flipped) return;
      flipped = true;
      fc.classList.add('flipped');
      grades.hidden = false;
      Speech.speak(primaryEs(card.es));
    };
    if (!reverse) setTimeout(() => Speech.speak(primaryEs(card.es)), 200);

    area.append(
      h('div', { class: 'review-bar' },
        h('span', { class: 'muted' }, (practice ? 'Практика · ' : '') + 'Осталось: ' + queue.length),
        h('label', { class: 'switch' },
          h('input', { type: 'checkbox', checked: reverse, onchange: e => { reverse = e.target.checked; next(); } }),
          ' Русский → испанский')),
      fc, grades,
      h('p', { class: 'muted small center' }, 'Пробел — перевернуть, 1–4 — оценка'));
  };

  if (queue.length) next(); else empty();
  return root;
};

// ---------- Словарь ----------
Views.dictionary = () => {
  let topic = 'all', query = '';
  const list = h('div', { class: 'dict-list' });
  const counter = h('span', { class: 'muted small' });

  const draw = () => {
    list.innerHTML = '';
    const q = stripAccents(query.toLowerCase().trim());
    const words = ALL_WORDS.filter(w => (topic === 'all' || w.topic === topic)
      && (!q || stripAccents(w.es.toLowerCase()).includes(q) || w.ru.toLowerCase().includes(q)));
    counter.textContent = words.length + ' ' + plural(words.length, 'слово', 'слова', 'слов');
    const frag = document.createDocumentFragment();
    for (const w of words.slice(0, 400)) {
      const inDeck = Store.srsHas(w.es);
      const strength = Store.srsStrength(w.es);
      const btn = h('button', { class: 'icon-btn' + (inDeck ? ' on' : ''), type: 'button', title: inDeck ? 'Убрать из повторения' : 'Добавить в повторение' }, inDeck ? '✓' : '+');
      btn.onclick = () => {
        if (Store.srsHas(w.es)) Store.srsRemove(w.es); else Store.srsAdd(w.es, w.ru);
        Store.checkAchievements();
        updateHeader();
        const on = Store.srsHas(w.es);
        btn.classList.toggle('on', on);
        btn.textContent = on ? '✓' : '+';
      };
      frag.append(h('div', { class: 'dict-row' },
        speakBtn(primaryEs(w.es)),
        h('div', { class: 'dict-es es' }, w.es),
        h('div', { class: 'dict-ru' }, w.ru),
        h('div', { class: 'strength', title: 'Прочность запоминания' }, h('span', { style: { width: strength * 100 + '%' } })),
        btn));
    }
    list.append(frag);
  };

  const search = h('input', { type: 'search', class: 'search', placeholder: 'Поиск по-испански или по-русски…', oninput: debounce(e => { query = e.target.value; draw(); }, 120) });
  const chips = h('div', { class: 'chips' },
    [{ id: 'all', icon: '📚', title: 'Все' }, ...TOPICS].map(t => h('button', {
      class: 'chip' + (t.id === topic ? ' active' : ''), type: 'button',
      onclick: e => {
        topic = t.id;
        chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        addAll.hidden = topic === 'all';
        draw();
      },
    }, t.icon + ' ' + t.title)));
  const addAll = h('button', {
    class: 'btn small', type: 'button', hidden: true,
    onclick: () => {
      let n = 0;
      for (const w of ALL_WORDS) if (w.topic === topic && Store.srsAdd(w.es, w.ru)) n++;
      Store.checkAchievements();
      UI.toast(n ? `Добавлено слов: ${n}` : 'Все слова темы уже в колоде');
      updateHeader();
      draw();
    },
  }, '+ Всю тему в повторение');

  const root = h('div', null,
    UI.pageHeader('Словарь', `${ALL_WORDS.length} слов и выражений по ${TOPICS.length} темам`),
    search, chips, h('div', { class: 'row between' }, counter, addAll), list);
  draw();
  setTimeout(() => search.focus(), 50);
  return root;
};
