// Глаголы: список, таблица спряжения, тренажёр.

function isIrregular(v) { return !!(v.forms || v.yo || v.pret || v.sc || v.fut || v.pp); }

Views.verbs = () => {
  let filter = 'all', q = '';
  const grid = h('div', { class: 'verb-grid' });
  const draw = () => {
    grid.innerHTML = '';
    const qq = stripAccents(q.toLowerCase());
    VERBS.filter(v => (filter === 'all' || (filter === 'irr') === isIrregular(v))
      && (!qq || stripAccents(v.inf).includes(qq) || v.ru.includes(qq)))
      .forEach(v => grid.append(h('a', { class: 'verb-card card', href: '#/verbs/' + encodeURIComponent(v.inf) },
        h('div', { class: 'es verb-inf' }, v.inf),
        h('div', { class: 'muted small' }, v.ru),
        isIrregular(v) ? h('span', { class: 'tag' }, v.sc ? v.sc : 'неправ.') : h('span', { class: 'tag ok' }, 'правильный'))));
  };
  const seg = h('div', { class: 'segmented' }, [['all', 'Все'], ['reg', 'Правильные'], ['irr', 'Неправильные']].map(([id, label]) =>
    h('button', {
      type: 'button', class: id === filter ? 'active' : '',
      onclick: e => { filter = id; seg.querySelectorAll('button').forEach(b => b.classList.remove('active')); e.currentTarget.classList.add('active'); draw(); },
    }, label)));
  draw();
  return h('div', null,
    UI.pageHeader('Глаголы', `${VERBS.length} глаголов · ${TENSES.length} времён · автоматические таблицы спряжения`),
    h('a', { class: 'card tile hot', href: '#/verbs/train' },
      h('div', { class: 'tile-icon' }, '⚙️'),
      h('div', null, h('div', { class: 'tile-title' }, 'Тренажёр спряжений'), h('div', { class: 'muted small' }, 'Выберите времена и глаголы — и вперёд! Лучший способ выучить формы.'))),
    h('div', { class: 'card' },
      h('h2', null, 'Времена'),
      h('div', { class: 'tense-list' }, TENSES.map(t => h('div', { class: 'tense-item' },
        h('span', { class: 'level-badge ' + t.level }, t.level), h('b', { class: 'es' }, t.es), ' — ', t.ru, h('div', { class: 'muted small' }, t.hint))))),
    h('div', { class: 'row between wrap' },
      h('input', { type: 'search', class: 'search', placeholder: 'Найти глагол…', oninput: e => { q = e.target.value; draw(); } }),
      seg),
    grid);
};

Views.verbTable = ([inf]) => {
  const v = VERB_MAP.get(inf);
  if (!v) return Views.notFound();
  return h('div', null,
    UI.pageHeader(h('span', null, h('span', { class: 'es' }, v.inf), ' ', speakBtn(v.inf)), v.ru + (isIrregular(v) ? ' · неправильный' : ' · правильный'), '#/verbs'),
    h('div', { class: 'row' },
      h('span', { class: 'muted' }, 'Причастие: '), h('b', { class: 'es' }, participle(v)),
      h('a', { class: 'btn small primary', href: '#/verbs/train', onclick: () => { sessionStorageSet('trainVerb', v.inf); } }, 'Тренировать этот глагол')),
    h('div', { class: 'conj-tables' }, TENSES.map(t => {
      const forms = conjugate(v, t.id);
      return h('div', { class: 'card conj-table' },
        h('h3', null, t.es, ' ', h('span', { class: 'level-badge ' + t.level }, t.level)),
        h('div', { class: 'muted small' }, t.ru),
        h('table', null, forms.map((f, i) => h('tr', null,
          h('td', { class: 'muted' }, PERSONS[i]),
          h('td', { class: 'es' }, highlightEnding(v, t.id, f, i)),
          h('td', null, speakBtn(f))))));
    })));
};

function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
function sessionStorageTake(k) { try { const v = sessionStorage.getItem(k); sessionStorage.removeItem(k); return v; } catch (e) { return null; } }

// Подсвечиваем отличие формы от «правильной» модели — так видно неправильности
function highlightEnding(v, tense, form, i) {
  if (!isIrregular(v)) return form;
  const reg = conjugate({ inf: v.inf }, tense)[i];
  if (reg === form) return form;
  return h('span', { class: 'irr', title: 'Обычная модель: ' + reg }, form);
}

Views.verbTrainer = (_, ctx) => {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('hablar.trainer')) || {}; } catch (e) { return {}; } })();
  const onlyVerb = sessionStorageTake('trainVerb');
  const cfg = {
    tenses: saved.tenses || ['presente'],
    set: onlyVerb ? 'one' : saved.set || 'all',
    mode: saved.mode || 'type',
    vosotros: saved.vosotros ?? true,
  };
  const persist = () => { try { localStorage.setItem('hablar.trainer', JSON.stringify({ ...cfg, set: cfg.set === 'one' ? 'all' : cfg.set })); } catch (e) { /* ignore */ } };

  let score = 0, streak = 0, best = 0, pendingXp = 0, current = null, locked = false;
  const scoreEl = h('div', { class: 'trainer-score' });
  const stage = h('div', { class: 'card trainer-stage' });

  const verbPool = () => {
    if (cfg.set === 'one' && onlyVerb) return [VERB_MAP.get(onlyVerb)];
    if (cfg.set === 'reg') return VERBS.filter(v => !isIrregular(v));
    if (cfg.set === 'irr') return VERBS.filter(isIrregular);
    if (cfg.set === 'top') return ['ser', 'estar', 'tener', 'hacer', 'ir', 'poder', 'querer', 'decir', 'venir', 'saber', 'dar', 'ver', 'poner', 'salir', 'hablar', 'comer', 'vivir'].map(i => VERB_MAP.get(i));
    return VERBS;
  };

  const updateScore = () => {
    scoreEl.innerHTML = '';
    scoreEl.append(
      h('span', null, '✓ ', h('b', null, score)),
      h('span', null, '🔥 ', h('b', null, streak)),
      h('span', null, '🏅 ', h('b', null, best)));
  };

  const flushXp = () => { if (pendingXp) { Store.addXp(pendingXp); pendingXp = 0; } };

  const nextQ = () => {
    locked = false;
    const persons = cfg.vosotros ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 5];
    const v = pick(verbPool());
    const t = tenseById(pick(cfg.tenses));
    const p = pick(persons);
    const forms = conjugate(v, t.id);
    current = { v, t, p, answer: forms[p], forms };
    stage.innerHTML = '';
    const pronoun = ['yo', 'tú', pick(['él', 'ella', 'usted']), 'nosotros', 'vosotros', pick(['ellos', 'ellas', 'ustedes'])][p];
    stage.append(
      h('div', { class: 'trainer-tense' }, h('span', { class: 'level-badge ' + t.level }, t.level), ' ', t.es, h('span', { class: 'muted small' }, ' · ' + t.ru)),
      h('div', { class: 'trainer-prompt' },
        h('span', { class: 'pronoun' }, pronoun),
        h('span', { class: 'es verb-inf' }, v.inf),
        h('span', { class: 'muted' }, '(' + v.ru + ')')));
    if (cfg.mode === 'type') {
      const field = UI.input({ placeholder: 'Форма глагола…', onEnter: val => check(val, field.input) });
      stage.append(field, h('button', { class: 'btn primary', type: 'button', onclick: () => check(field.input.value, field.input) }, 'Проверить'));
      setTimeout(() => field.input.focus(), 30);
    } else {
      // варианты: правильный ответ + формы других лиц/времён этого глагола + «правильная» модель
      const pool = new Set([current.answer]);
      const others = shuffle([
        ...forms,
        ...TENSES.map(tt => conjugate(v, tt.id)[p]),
        conjugate({ inf: v.inf }, t.id)[p],
      ]);
      for (const o of others) { if (pool.size >= 4) break; pool.add(o); }
      const grid = h('div', { class: 'options' }, shuffle([...pool]).map((o, i) => h('button', {
        class: 'option', type: 'button',
        onclick: e => check(o, e.currentTarget),
      }, h('span', { class: 'key-hint' }, i + 1), o)));
      stage.append(grid);
    }
    stage.append(h('div', { class: 'trainer-feedback' }));
  };

  const check = (val, el) => {
    if (locked || !val.trim()) return;
    locked = true;
    const res = checkAnswer(val, current.answer);
    const fb = stage.querySelector('.trainer-feedback');
    Store.answer(res.ok);
    if (res.ok) {
      SFX.correct();
      score++; streak++; best = Math.max(best, streak);
      Store.stats.conjugations++;
      pendingXp++;
      if (pendingXp >= 5) flushXp();
      el.classList.add('correct');
      Speech.speak(current.answer);
      fb.append(h('div', { class: 'ok-text' }, '✓ ', res.note || pick(['¡Correcto!', '¡Muy bien!', '¡Eso es!'])));
      setTimeout(nextQ, res.note ? 1600 : 900);
    } else {
      SFX.wrong();
      streak = 0;
      el.classList.add('wrong');
      if (el.disabled !== undefined && el.tagName === 'INPUT') el.disabled = true;
      fb.append(
        h('div', { class: 'bad-text' }, '✗ Правильно: ', h('b', { class: 'es' }, current.answer), ' ', speakBtn(current.answer)),
        res.note ? h('div', { class: 'small muted' }, res.note) : null,
        h('details', { class: 'mini-table' }, h('summary', null, 'Показать всю таблицу'),
          h('table', null, current.forms.map((f, i) => h('tr', { class: i === current.p ? 'hl' : '' }, h('td', { class: 'muted' }, PERSONS[i]), h('td', { class: 'es' }, f))))),
        h('button', { class: 'btn primary', type: 'button', onclick: nextQ }, 'Дальше →'));
      fb.querySelector('.btn').focus();
    }
    Store.save();
    Store.checkAchievements();
    updateScore();
  };

  const keyHandler = e => {
    if (cfg.mode !== 'choose' || locked) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) stage.querySelectorAll('.option')[n - 1]?.click();
  };
  document.addEventListener('keydown', keyHandler);
  ctx.onCleanup(() => { flushXp(); document.removeEventListener('keydown', keyHandler); });

  // ---- настройки ----
  const tenseBox = h('div', { class: 'chips' }, TENSES.map(t => h('label', { class: 'chip check' },
    h('input', {
      type: 'checkbox', checked: cfg.tenses.includes(t.id),
      onchange: e => {
        if (e.target.checked) cfg.tenses.push(t.id);
        else if (cfg.tenses.length > 1) cfg.tenses = cfg.tenses.filter(x => x !== t.id);
        else { e.target.checked = true; UI.toast('Нужно хотя бы одно время'); return; }
        persist(); nextQ();
      },
    }), t.es)));
  const setOptions = [['all', 'Все глаголы'], ['top', 'Топ-17 частых'], ['reg', 'Правильные'], ['irr', 'Неправильные']];
  if (onlyVerb) setOptions.unshift(['one', 'Только ' + onlyVerb]);
  const setSel = h('select', { onchange: e => { cfg.set = e.target.value; persist(); nextQ(); } },
    setOptions.map(([id, l]) => h('option', { value: id, selected: cfg.set === id }, l)));
  const modeSel = h('select', { onchange: e => { cfg.mode = e.target.value; persist(); nextQ(); } },
    [['type', '✍️ Ввод с клавиатуры'], ['choose', '👆 Выбор из вариантов']].map(([id, l]) => h('option', { value: id, selected: cfg.mode === id }, l)));
  const vosBox = h('label', { class: 'chip check' }, h('input', { type: 'checkbox', checked: cfg.vosotros, onchange: e => { cfg.vosotros = e.target.checked; persist(); nextQ(); } }), 'vosotros');

  updateScore();
  nextQ();
  return h('div', null,
    UI.pageHeader('Тренажёр спряжений', 'Подсказка: Alt+a/e/i/o/u/n вводит á é í ó ú ñ', '#/verbs'),
    h('details', { class: 'card settings-panel', open: !saved.tenses },
      h('summary', null, '⚙ Настройки тренировки'),
      h('div', { class: 'field' }, h('div', { class: 'label' }, 'Времена'), tenseBox),
      h('div', { class: 'row wrap' },
        h('div', { class: 'field' }, h('div', { class: 'label' }, 'Глаголы'), setSel),
        h('div', { class: 'field' }, h('div', { class: 'label' }, 'Режим'), modeSel),
        h('div', { class: 'field' }, h('div', { class: 'label' }, 'Лица'), vosBox))),
    scoreEl, stage);
};
