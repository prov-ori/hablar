// Генерация и отрисовка упражнений. Каждое упражнение — объект { type, ... },
// renderExercise(ex, done) возвращает DOM-узел и вызывает done(ok, { answer, note }) после ответа.

const EX_TITLES = {
  pick_ru: 'Выберите перевод',
  pick_es: 'Как это по-испански?',
  listen: 'Что вы слышите?',
  type_es: 'Напишите по-испански',
  dictation: 'Напишите то, что слышите',
  match: 'Соедините пары',
  build: 'Соберите фразу',
  gap: 'Вставьте пропущенное слово',
  translate_sentence: 'Что означает эта фраза?',
};

function wordDistractors(word, pool, n, field) {
  const seen = new Set([field === 'es' ? primaryEs(word.es) : word.ru]);
  const out = [];
  for (const w of shuffle(pool)) {
    const v = field === 'es' ? primaryEs(w.es) : w.ru;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= n) break;
  }
  if (out.length < n) {
    for (const w of shuffle(ALL_WORDS)) {
      const v = field === 'es' ? primaryEs(w.es) : w.ru;
      if (seen.has(v)) continue;
      seen.add(v);
      out.push(v);
      if (out.length >= n) break;
    }
  }
  return out;
}

function tokenize(sentence) {
  return sentence.split(/\s+/).map(t => t.replace(/[¿?¡!.,;:«»—"]/g, '')).filter(Boolean);
}

// ---------- Генераторы ----------
function makeWordExercise(type, word, pool) {
  if ((type === 'listen' || type === 'dictation') && !Speech.canSpeak) type = type === 'listen' ? 'pick_es' : 'type_es';
  switch (type) {
    case 'pick_ru':
      return { type, word, prompt: primaryEs(word.es), options: shuffle([word.ru, ...wordDistractors(word, pool, 3, 'ru')]), answer: word.ru };
    case 'pick_es':
      return { type, word, prompt: word.ru, options: shuffle([primaryEs(word.es), ...wordDistractors(word, pool, 3, 'es')]), answer: primaryEs(word.es) };
    case 'listen':
      return { type, word, options: shuffle([primaryEs(word.es), ...wordDistractors(word, pool, 3, 'es')]), answer: primaryEs(word.es) };
    case 'type_es':
      return { type, word, prompt: word.ru, answer: word.es };
    case 'dictation':
      return { type, word, answer: word.es };
  }
}

function makeMatch(words) {
  const uniq = [];
  const seenEs = new Set(), seenRu = new Set();
  for (const w of words) {
    const es = primaryEs(w.es);
    if (seenEs.has(es) || seenRu.has(w.ru)) continue;
    seenEs.add(es); seenRu.add(w.ru);
    uniq.push(w);
  }
  return { type: 'match', pairs: uniq.slice(0, 5) };
}

function makeSentenceExercise(sentence, allSentences) {
  const tokens = tokenize(sentence.es);
  const otherTokens = [...new Set(allSentences.filter(s => s !== sentence).flatMap(s => tokenize(s.es)))]
    .filter(t => !tokens.map(x => x.toLowerCase()).includes(t.toLowerCase()));
  const kind = tokens.length >= 3 && Math.random() < 0.6 ? 'build' : 'gap';
  if (kind === 'build') {
    return { type: 'build', sentence, tokens, bank: shuffle([...tokens, ...sample(otherTokens, Math.min(3, otherTokens.length))]) };
  }
  const candidates = tokens.map((t, i) => ({ t, i })).filter(x => x.t.length > 2);
  const target = candidates.length ? pick(candidates) : { t: tokens[0], i: 0 };
  const distract = sample(otherTokens.filter(t => t.length > 2), 3);
  while (distract.length < 3) {
    const w = stripArticle(primaryEs(pick(ALL_WORDS).es));
    if (w.toLowerCase() !== target.t.toLowerCase() && !distract.includes(w)) distract.push(w);
  }
  return { type: 'gap', sentence, tokens, gapIndex: target.i, answer: target.t, options: shuffle([target.t, ...distract]) };
}

function makeTranslateSentence(sentence, allSentences) {
  const others = sample(allSentences.filter(s => s !== sentence), 3).map(s => s.ru);
  return { type: 'translate_sentence', sentence, options: shuffle([sentence.ru, ...others]), answer: sentence.ru };
}

// ---------- Отрисовка ----------
function renderExercise(ex, done) {
  const box = h('div', { class: 'exercise ex-' + ex.type });
  box.appendChild(h('div', { class: 'ex-title' }, EX_TITLES[ex.type]));
  let answered = false;
  const finish = (ok, info = {}) => {
    if (answered) return;
    answered = true;
    box.classList.add('answered');
    done(ok, info);
  };

  const optionButtons = (options, answer, opts = {}) => {
    const grid = h('div', { class: 'options' + (opts.wide ? ' wide' : '') });
    options.forEach((o, i) => {
      const b = h('button', {
        class: 'option', type: 'button', 'data-key': i + 1,
        onclick: () => {
          if (answered) return;
          const ok = o === answer;
          b.classList.add(ok ? 'correct' : 'wrong');
          if (!ok) grid.querySelectorAll('.option').forEach(x => { if (x.dataset.value === answer) x.classList.add('correct'); });
          if (opts.speakEs) Speech.speak(o);
          finish(ok, { answer });
        },
      }, h('span', { class: 'key-hint' }, i + 1), o);
      b.dataset.value = o;
      grid.appendChild(b);
    });
    box.keyHandler = e => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= options.length) grid.children[n - 1].click();
    };
    return grid;
  };

  switch (ex.type) {
    case 'pick_ru':
      box.append(
        h('div', { class: 'prompt es' }, speakBtn(ex.prompt), ex.prompt),
        optionButtons(ex.options, ex.answer));
      setTimeout(() => Speech.speak(ex.prompt), 200);
      break;

    case 'pick_es':
      box.append(h('div', { class: 'prompt' }, ex.prompt), optionButtons(ex.options, ex.answer, { speakEs: true }));
      break;

    case 'listen': {
      const play = () => Speech.speak(ex.answer);
      box.append(
        h('div', { class: 'listen-row' },
          h('button', { class: 'listen-btn', onclick: play, type: 'button' }, '🔊'),
          h('button', { class: 'listen-btn small', onclick: () => Speech.speak(ex.answer, { rate: 0.5 }), type: 'button' }, '🐢')),
        optionButtons(ex.options, ex.answer));
      setTimeout(play, 250);
      break;
    }

    case 'type_es':
    case 'dictation': {
      const field = UI.input({ placeholder: 'По-испански…', onEnter: v => check(v) });
      const check = v => {
        if (answered || !v.trim()) return;
        const res = checkAnswer(v, ex.answer);
        field.input.disabled = true;
        field.input.classList.add(res.ok ? 'correct' : 'wrong');
        if (res.ok) Speech.speak(primaryEs(ex.answer));
        finish(res.ok, { answer: ex.answer, note: res.note });
      };
      if (ex.type === 'dictation') {
        const play = () => Speech.speak(primaryEs(ex.answer));
        box.append(h('div', { class: 'listen-row' },
          h('button', { class: 'listen-btn', onclick: play, type: 'button' }, '🔊'),
          h('button', { class: 'listen-btn small', onclick: () => Speech.speak(primaryEs(ex.answer), { rate: 0.5 }), type: 'button' }, '🐢')));
        setTimeout(play, 250);
      } else {
        box.append(h('div', { class: 'prompt' }, ex.prompt));
      }
      box.append(field, h('button', { class: 'btn primary check-btn', type: 'button', onclick: () => check(field.input.value) }, 'Проверить'));
      box.focusTarget = field.input;
      break;
    }

    case 'match': {
      const left = shuffle(ex.pairs.map(p => ({ id: p.es, text: primaryEs(p.es), side: 'es' })));
      const right = shuffle(ex.pairs.map(p => ({ id: p.es, text: p.ru, side: 'ru' })));
      let selected = null, matched = 0, mistakes = 0;
      const mk = item => {
        const b = h('button', { class: 'match-item', type: 'button' }, item.text);
        b.onclick = () => {
          if (b.classList.contains('done')) return;
          if (item.side === 'es') Speech.speak(item.text);
          if (!selected || selected.item.side === item.side) {
            if (selected) selected.b.classList.remove('selected');
            selected = { item, b };
            b.classList.add('selected');
            return;
          }
          if (selected.item.id === item.id) {
            [b, selected.b].forEach(x => { x.classList.remove('selected'); x.classList.add('done'); });
            SFX.correct();
            matched++;
            if (matched === ex.pairs.length) finish(mistakes === 0, { answer: 'Все пары найдены', silent: true });
          } else {
            mistakes++;
            const prev = selected.b;
            [b, prev].forEach(x => x.classList.add('shake'));
            SFX.wrong();
            setTimeout(() => [b, prev].forEach(x => x.classList.remove('shake', 'selected')), 400);
          }
          selected = null;
        };
        return b;
      };
      box.append(h('div', { class: 'match-grid' },
        h('div', { class: 'match-col' }, left.map(mk)),
        h('div', { class: 'match-col' }, right.map(mk))));
      break;
    }

    case 'build': {
      const answerZone = h('div', { class: 'build-answer' });
      const bankZone = h('div', { class: 'build-bank' });
      const chips = ex.bank.map(t => {
        const c = h('button', { class: 'chip', type: 'button' }, t);
        c.onclick = () => {
          if (answered) return;
          if (c.parentElement === bankZone) { answerZone.appendChild(c); Speech.speak(t, { rate: 1 }); }
          else bankZone.appendChild(c);
        };
        return c;
      });
      bankZone.append(...chips);
      const check = () => {
        if (answered) return;
        const got = [...answerZone.children].map(c => c.textContent).join(' ');
        if (!got) return;
        const ok = stripAccents(normalizeAnswer(got)) === stripAccents(normalizeAnswer(ex.tokens.join(' ')));
        answerZone.classList.add(ok ? 'correct' : 'wrong');
        Speech.speak(ex.sentence.es);
        finish(ok, { answer: ex.sentence.es });
      };
      box.append(
        h('div', { class: 'prompt' }, ex.sentence.ru),
        answerZone, bankZone,
        h('button', { class: 'btn primary check-btn', type: 'button', onclick: check }, 'Проверить'));
      box.submit = check;
      break;
    }

    case 'gap': {
      const parts = ex.tokens.map((t, i) => i === ex.gapIndex ? h('span', { class: 'gap' }, '_____') : h('span', null, t));
      const sentenceEl = h('div', { class: 'prompt es sentence' }, parts.flatMap((p, i) => i ? [' ', p] : [p]));
      box.append(sentenceEl, h('div', { class: 'muted center' }, ex.sentence.ru));
      const grid = optionButtons(ex.options, ex.answer);
      grid.addEventListener('click', () => {
        if (answered) {
          sentenceEl.querySelector('.gap').textContent = ex.answer;
          Speech.speak(ex.sentence.es);
        }
      });
      box.append(grid);
      break;
    }

    case 'translate_sentence':
      box.append(
        h('div', { class: 'prompt es sentence' }, speakBtn(ex.sentence.es), ex.sentence.es),
        optionButtons(ex.options, ex.answer, { wide: true }));
      setTimeout(() => Speech.speak(ex.sentence.es), 250);
      break;
  }
  return box;
}
