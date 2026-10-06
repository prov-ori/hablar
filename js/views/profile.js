// Профиль, статистика, достижения и настройки.

Views.profile = () => {
  const s = Store.state;
  const lvl = Store.level();
  const st = s.stats;
  const total = st.correct + st.wrong;
  const deck = Object.values(s.srs);
  const learned = deck.filter(c => c.interval >= 21).length;
  const lessonsDone = Object.keys(s.lessons).length;
  const totalLessons = UNITS.reduce((a, u) => a + u.lessons.length, 0);
  const unlocked = ACHIEVEMENTS.filter(a => s.achievements[a.id]).length;

  // XP за последние 7 дней — столбчатая диаграмма
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: todayKey(d), label: d.toLocaleDateString('ru-RU', { weekday: 'short' }), xp: s.activity[todayKey(d)] || 0 };
  });
  const maxXp = Math.max(Store.settings.dailyGoal, ...days.map(d => d.xp));

  const stat = (value, label) => h('div', { class: 'stat' }, h('b', null, value), h('small', null, label));

  return h('div', null,
    UI.pageHeader('Профиль', Store.settings.name ? '¡Hola, ' + Store.settings.name + '!' : 'Ваш прогресс в испанском'),
    h('div', { class: 'card profile-head' },
      h('div', { class: 'level-circle' }, h('small', null, 'уровень'), h('b', null, lvl.level)),
      h('div', { class: 'grow' },
        h('div', null, `${lvl.into} / ${lvl.need} XP до уровня ${lvl.level + 1}`),
        UI.progressBar(lvl.into, lvl.need, 'thick'),
        h('div', { class: 'muted small' }, 'Всего: ' + s.xp + ' XP'))),
    h('div', { class: 'stats-grid' },
      stat('🔥 ' + s.streak, 'серия дней'),
      stat('🏅 ' + s.bestStreak, 'рекорд серии'),
      stat(lessonsDone + '/' + totalLessons, 'уроков'),
      stat(deck.length, 'слов в колоде'),
      stat(learned, 'слов выучено'),
      stat(total ? Math.round((st.correct / total) * 100) + '%' : '—', 'точность'),
      stat(st.conjugations, 'спряжений'),
      stat(Object.keys(st.stories).length + '/' + STORIES.length, 'рассказов'),
      stat(Object.keys(st.grammar).length + '/' + GRAMMAR.length, 'тем грамматики'),
      stat(Object.keys(st.dialogues).length + '/' + DIALOGUES.length, 'диалогов'),
      stat(st.games, 'игр сыграно'),
      stat(st.reviews, 'повторений')),
    h('div', { class: 'card' },
      h('h2', null, 'XP за неделю'),
      h('div', { class: 'bars' }, days.map(d => h('div', { class: 'bar-col', title: d.key + ': ' + d.xp + ' XP' },
        h('div', { class: 'bar-val small' }, d.xp || ''),
        h('div', { class: 'bar' + (d.xp >= Store.settings.dailyGoal ? ' goal' : ''), style: { height: Math.max(2, (d.xp / maxXp) * 100) + '%' } }),
        h('div', { class: 'bar-label small muted' }, d.label)))),
      h('div', { class: 'muted small' }, 'Цель дня: ' + Store.settings.dailyGoal + ' XP (зелёные столбцы — цель выполнена)')),
    h('div', { class: 'card' },
      h('h2', null, `Достижения · ${unlocked}/${ACHIEVEMENTS.length}`),
      h('div', { class: 'ach-grid' }, ACHIEVEMENTS.map(a => {
        const got = s.achievements[a.id];
        return h('div', { class: 'ach' + (got ? ' got' : ''), title: got ? 'Получено ' + new Date(got).toLocaleDateString('ru-RU') : 'Ещё не получено' },
          h('div', { class: 'ach-icon' }, got ? a.icon : '🔒'),
          h('div', null, h('b', { class: 'es' }, a.title), h('div', { class: 'small muted' }, a.desc)));
      }))));
};

Views.settings = () => {
  const st = Store.settings;
  const save = () => { Store.save(); updateHeader(); };
  const field = (label, control, hint) => h('div', { class: 'field' }, h('div', { class: 'label' }, label), control, hint ? h('div', { class: 'muted small' }, hint) : null);
  const toggle = (key, label) => h('label', { class: 'switch' },
    h('input', { type: 'checkbox', checked: st[key], onchange: e => { st[key] = e.target.checked; save(); } }), ' ' + label);

  const voiceSel = h('select', { onchange: e => { st.voice = e.target.value; save(); Speech.speak('Hola, ¿qué tal?'); } },
    h('option', { value: '' }, 'Автоматически (es-ES)'),
    Speech.voices.map(v => h('option', { value: v.name, selected: st.voice === v.name }, `${v.name} (${v.lang})`)));
  // голоса могут подгрузиться позже
  if (!Speech.voices.length && Speech.canSpeak) {
    setTimeout(() => {
      Speech.init();
      Speech.voices.forEach(v => voiceSel.append(h('option', { value: v.name, selected: st.voice === v.name }, `${v.name} (${v.lang})`)));
    }, 600);
  }

  const rate = h('input', { type: 'range', min: '0.5', max: '1.3', step: '0.05', value: st.ttsRate });
  const rateVal = h('span', null, st.ttsRate + '×');
  rate.oninput = () => { st.ttsRate = +rate.value; rateVal.textContent = rate.value + '×'; };
  rate.onchange = () => { save(); Speech.speak('Me encanta aprender español.'); };

  const fileInput = h('input', {
    type: 'file', accept: 'application/json', hidden: true,
    onchange: async e => {
      const f = e.target.files[0];
      if (!f) return;
      try { Store.importJSON(await f.text()); UI.toast('Прогресс восстановлен'); applyTheme(); render(); }
      catch (err) { UI.toast('Ошибка импорта: ' + err.message, 'bad'); }
    },
  });

  return h('div', null,
    UI.pageHeader('Настройки'),
    h('div', { class: 'card' },
      h('h2', null, 'Профиль'),
      field('Имя', h('input', { type: 'text', value: st.name, placeholder: 'Как к вам обращаться?', oninput: debounce(e => { st.name = e.target.value.trim(); save(); }, 300) })),
      field('Цель дня', h('select', { onchange: e => { st.dailyGoal = +e.target.value; save(); } },
        [[20, 'Лёгкая — 20 XP'], [50, 'Обычная — 50 XP'], [100, 'Серьёзная — 100 XP'], [200, 'Интенсив — 200 XP']].map(([v, l]) => h('option', { value: v, selected: st.dailyGoal === v }, l))))),
    h('div', { class: 'card' },
      h('h2', null, 'Звук и речь'),
      Speech.canSpeak
        ? [field('Голос', voiceSel, Speech.voices.length ? null : 'Испанские голоса не найдены — браузер использует голос по умолчанию.'),
          field('Скорость речи', h('div', { class: 'row' }, rate, rateVal))]
        : h('p', { class: 'bad-text' }, 'Ваш браузер не поддерживает синтез речи — упражнения на слух будут заменены.'),
      toggle('sound', 'Звуковые эффекты')),
    h('div', { class: 'card' },
      h('h2', null, 'Обучение'),
      toggle('strictAccents', 'Строгая проверка ударений (á, é, ñ…)'),
      h('div', { class: 'muted small' }, 'Без строгого режима ответ без ударений засчитывается с подсказкой.'),
      toggle('unlockAll', 'Открыть все уроки (без последовательного прохождения)'),
      field('Тема оформления', h('select', { onchange: e => { st.theme = e.target.value; save(); applyTheme(); } },
        [['auto', 'Как в системе'], ['light', 'Светлая'], ['dark', 'Тёмная']].map(([v, l]) => h('option', { value: v, selected: st.theme === v }, l))))),
    h('div', { class: 'card' },
      h('h2', null, 'Данные'),
      h('p', { class: 'muted small' }, 'Прогресс хранится только в этом браузере. Сделайте резервную копию, чтобы перенести его на другое устройство.'),
      h('div', { class: 'row wrap' },
        h('button', {
          class: 'btn', type: 'button',
          onclick: () => {
            const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
            const a = h('a', { href: URL.createObjectURL(blob), download: 'hablar-progress-' + todayKey() + '.json' });
            document.body.append(a); a.click(); a.remove();
          },
        }, '⬇ Экспорт прогресса'),
        h('button', { class: 'btn', type: 'button', onclick: () => fileInput.click() }, '⬆ Импорт'),
        fileInput,
        h('button', {
          class: 'btn danger', type: 'button',
          onclick: () => UI.confirm('Сбросить прогресс?', 'Весь прогресс, XP, колода и достижения будут удалены без возможности восстановления.', () => { Store.reset(); applyTheme(); navigate('#/'); render(); UI.toast('Прогресс сброшен'); }),
        }, '🗑 Сбросить всё'))),
    h('div', { class: 'card muted small' },
      h('h2', null, 'Горячие клавиши'),
      h('ul', null,
        h('li', null, 'Alt + a / e / i / o / u / n — á é í ó ú ñ в любом поле ввода'),
        h('li', null, '1–4 — выбор варианта ответа'),
        h('li', null, 'Enter — проверить / далее'),
        h('li', null, 'Пробел — перевернуть карточку в повторении'))));
};
