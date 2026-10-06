// Мини-игры.

const GAMES = [
  { id: 'speed', icon: '⚡', title: 'Контрольное время', desc: '60 секунд: переводите как можно больше слов. Ошибка = −3 секунды.' },
  { id: 'memory', icon: '🃏', title: 'Мемори', desc: 'Найдите пары «испанское слово — перевод».' },
  { id: 'gender', icon: '⚥', title: '¿El o la?', desc: 'Угадайте род существительного. 20 слов.' },
  { id: 'truefalse', icon: '✅', title: 'Verdadero o falso', desc: 'Верный ли перевод? Решайте быстро — 45 секунд.' },
  { id: 'hangman', icon: '🪢', title: 'El ahorcado', desc: 'Виселица: угадайте испанское слово по буквам.' },
  { id: 'anagram', icon: '🔤', title: 'Анаграммы', desc: 'Соберите слово из перемешанных букв.' },
  { id: 'numbers', icon: '🔢', title: 'Числа', desc: 'Пишите числа словами или распознавайте на слух.' },
  { id: 'clock', icon: '🕰️', title: '¿Qué hora es?', desc: 'Определите время по часам.' },
  { id: 'dictation', icon: '✍️', title: 'Диктант', desc: 'Прослушайте фразу и запишите её.', needs: 'tts' },
  { id: 'speak', icon: '🎙️', title: 'Произношение', desc: 'Произнесите фразу — браузер проверит, насколько похоже.', needs: 'stt' },
  { id: 'capitals', icon: '🏛️', title: 'Столицы', desc: 'Викторина по испаноязычным странам.' },
];

Views.games = () => h('div', null,
  UI.pageHeader('Игры', 'Закрепляйте материал в игровой форме — за каждую игру начисляется XP'),
  h('div', { class: 'card-grid' }, GAMES.map(g => {
    const unavailable = (g.needs === 'tts' && !Speech.canSpeak) || (g.needs === 'stt' && !Speech.canListen);
    const best = Store.stats.gameBest[g.id];
    return h('a', { class: 'card topic-card game-card' + (unavailable ? ' disabled' : ''), href: '#/games/' + g.id },
      h('div', { class: 'topic-icon' }, g.icon),
      h('div', null,
        h('div', { class: 'tile-title' }, g.title),
        h('div', { class: 'muted small' }, g.desc),
        unavailable ? h('div', { class: 'small bad-text' }, 'Не поддерживается этим браузером') : null,
        best != null ? h('div', { class: 'small' }, '🏅 Рекорд: ' + best) : null));
  })));

Views.game = ([id], ctx) => {
  const g = GAMES.find(x => x.id === id);
  if (!g) return Views.notFound();
  const stage = h('div', { class: 'game-stage' });
  const root = h('div', null, UI.pageHeader(g.icon + ' ' + g.title, g.desc, '#/games'), stage);
  const timers = [];
  const cleanups = [];
  ctx.onCleanup(() => { timers.forEach(clearInterval); cleanups.forEach(f => f()); });
  const api = {
    stage, timers, cleanups,
    restart: () => { timers.forEach(clearInterval); timers.length = 0; cleanups.forEach(f => f()); cleanups.length = 0; stage.innerHTML = ''; GAME_IMPL[id](api); },
  };
  GAME_IMPL[id](api);
  return root;
};

function gameOver(api, gameId, score, { label = 'очков', xp, extra } = {}) {
  const prev = Store.stats.gameBest[gameId];
  const record = prev == null || score > prev;
  if (record) Store.stats.gameBest[gameId] = score;
  Store.stats.games++;
  const gained = xp ?? Math.max(2, Math.min(30, score));
  Store.addXp(gained);
  Store.save();
  SFX.finish();
  if (record && score > 0) UI.confetti();
  api.stage.innerHTML = '';
  api.stage.append(h('div', { class: 'card center result' },
    h('div', { class: 'big-emoji' }, record && score > 0 ? '🏆' : '🎮'),
    h('h2', null, score + ' ' + label),
    record && prev != null ? h('p', { class: 'ok-text' }, 'Новый рекорд! (было ' + prev + ')') : prev != null ? h('p', { class: 'muted' }, 'Рекорд: ' + prev) : null,
    extra || null,
    h('p', null, '+' + gained + ' XP'),
    h('div', { class: 'row center' },
      h('a', { class: 'btn', href: '#/games' }, 'Все игры'),
      h('button', { class: 'btn primary', type: 'button', onclick: api.restart }, 'Играть ещё'))));
}

function topicPicker(onPick, { label = 'Выберите тему', filter } = {}) {
  const topics = filter ? TOPICS.filter(filter) : TOPICS;
  return h('div', { class: 'card' },
    h('h3', null, label),
    h('div', { class: 'chips' },
      h('button', { class: 'chip active', type: 'button', onclick: () => onPick(null) }, '🎲 Все темы'),
      topics.map(t => h('button', { class: 'chip', type: 'button', onclick: () => onPick(t) }, t.icon + ' ' + t.title))));
}

function timerBar(seconds) {
  const fill = h('div', { class: 'progress-fill' });
  const label = h('span', { class: 'timer-label' }, seconds + ' с');
  const el = h('div', { class: 'timer' }, h('div', { class: 'progress thick grow' }, fill), label);
  el.set = (left) => { fill.style.width = (left / seconds) * 100 + '%'; label.textContent = Math.ceil(left) + ' с'; el.classList.toggle('low', left <= 10); };
  el.set(seconds);
  return el;
}

const GAME_IMPL = {
  // ---------- Контрольное время ----------
  speed(api) {
    api.stage.append(topicPicker(topic => {
      const pool = topic ? topic.words : ALL_WORDS;
      let left = 60, score = 0, streak = 0;
      api.stage.innerHTML = '';
      const tb = timerBar(60);
      const scoreEl = h('div', { class: 'trainer-score' });
      const q = h('div', { class: 'card' });
      api.stage.append(tb, scoreEl, q);
      const draw = () => {
        scoreEl.innerHTML = '';
        scoreEl.append(h('span', null, '✓ ', h('b', null, score)), h('span', null, '🔥 ', h('b', null, streak)));
        q.innerHTML = '';
        const w = pick(pool);
        const ex = makeWordExercise(Math.random() < 0.5 ? 'pick_ru' : 'pick_es', w, pool);
        q.append(renderExercise(ex, ok => {
          Store.answer(ok);
          if (ok) { SFX.correct(); score++; streak++; if (streak % 5 === 0) left = Math.min(60, left + 2); }
          else { SFX.wrong(); streak = 0; left -= 3; }
          setTimeout(draw, ok ? 250 : 700);
        }));
      };
      const keyHandler = e => q.querySelector('.exercise')?.keyHandler?.(e);
      document.addEventListener('keydown', keyHandler);
      api.cleanups.push(() => document.removeEventListener('keydown', keyHandler));
      api.timers.push(setInterval(() => {
        left -= 0.1;
        tb.set(Math.max(0, left));
        if (left <= 0) {
          api.timers.forEach(clearInterval);
          api.cleanups.forEach(f => f());
          Store.stats.bestSpeed = Math.max(Store.stats.bestSpeed, score);
          gameOver(api, 'speed', score, { label: 'слов за минуту' });
        }
      }, 100));
      draw();
    }));
  },

  // ---------- Мемори ----------
  memory(api) {
    api.stage.append(topicPicker(topic => {
      const words = sample((topic ? topic.words : ALL_WORDS).filter(w => primaryEs(w.es).length < 22), 6);
      const cards = shuffle(words.flatMap((w, i) => [{ id: i, text: primaryEs(w.es), es: true }, { id: i, text: w.ru, es: false }]));
      let open = [], found = 0, moves = 0, lock = false;
      const t0 = Date.now();
      api.stage.innerHTML = '';
      const info = h('div', { class: 'trainer-score' });
      const upd = () => { info.innerHTML = ''; info.append(h('span', null, 'Ходы: ', h('b', null, moves)), h('span', null, 'Пары: ', h('b', null, found + '/6'))); };
      upd();
      const grid = h('div', { class: 'memory-grid' }, cards.map(c => {
        const el = h('button', { class: 'memory-card', type: 'button' },
          h('div', { class: 'mc-inner' }, h('div', { class: 'mc-face mc-back' }, '¿?'), h('div', { class: 'mc-face mc-front' + (c.es ? ' es' : '') }, c.text)));
        el.onclick = () => {
          if (lock || el.classList.contains('flipped')) return;
          el.classList.add('flipped');
          if (c.es) Speech.speak(c.text);
          open.push({ c, el });
          if (open.length === 2) {
            moves++;
            const [a, b] = open;
            open = [];
            if (a.c.id === b.c.id) {
              found++;
              SFX.correct();
              a.el.classList.add('matched'); b.el.classList.add('matched');
              if (found === 6) {
                const secs = Math.round((Date.now() - t0) / 1000);
                const score = Math.max(1, 30 - (moves - 6) * 2);
                setTimeout(() => gameOver(api, 'memory', score, { extra: h('p', { class: 'muted' }, `${moves} ходов за ${secs} с`) }), 700);
              }
            } else {
              lock = true;
              setTimeout(() => { a.el.classList.remove('flipped'); b.el.classList.remove('flipped'); lock = false; }, 900);
            }
            upd();
          }
        };
        return el;
      }));
      api.stage.append(info, grid);
    }));
  },

  // ---------- Род существительных ----------
  gender(api) {
    const nouns = ALL_WORDS
      .map(w => ({ ...w, p: primaryEs(w.es) }))
      .filter(w => /^(el|la) [a-záéíóúñü]+$/.test(w.p));
    const round = sample(nouns, 20);
    let i = 0, score = 0;
    const card = h('div', { class: 'card center gender-card' });
    api.stage.append(card);
    const draw = () => {
      if (i >= round.length) return gameOver(api, 'gender', score, { label: 'из 20', xp: score });
      const w = round[i];
      const [art, noun] = w.p.split(' ');
      card.innerHTML = '';
      const fb = h('div', { class: 'trainer-feedback' });
      const choose = a => {
        if (fb.textContent) return;
        const ok = a === art;
        Store.answer(ok);
        ok ? (SFX.correct(), score++) : SFX.wrong();
        Speech.speak(w.p);
        fb.append(h('div', { class: ok ? 'ok-text' : 'bad-text' }, (ok ? '✓ ' : '✗ ') + w.p + ' — ' + w.ru));
        i++;
        setTimeout(draw, ok ? 900 : 1600);
      };
      card.append(
        h('div', { class: 'muted' }, (i + 1) + ' / 20 · ✓ ' + score),
        h('div', { class: 'big-word es' }, noun),
        h('div', { class: 'muted' }, w.ru),
        h('div', { class: 'row center' },
          h('button', { class: 'btn big el', type: 'button', onclick: () => choose('el') }, 'el'),
          h('button', { class: 'btn big la', type: 'button', onclick: () => choose('la') }, 'la')),
        fb);
    };
    const keyHandler = e => { if (e.key === 'ArrowLeft' || e.key === '1') card.querySelector('.el')?.click(); if (e.key === 'ArrowRight' || e.key === '2') card.querySelector('.la')?.click(); };
    document.addEventListener('keydown', keyHandler);
    api.cleanups.push(() => document.removeEventListener('keydown', keyHandler));
    draw();
  },

  // ---------- Верно / неверно ----------
  truefalse(api) {
    let left = 45, score = 0, wrong = 0, current;
    const tb = timerBar(45);
    const card = h('div', { class: 'card center tf-card' });
    api.stage.append(tb, card);
    const draw = () => {
      const w = pick(ALL_WORDS);
      const truth = Math.random() < 0.5;
      const ru = truth ? w.ru : pick(ALL_WORDS.filter(x => x.ru !== w.ru)).ru;
      current = { truth };
      card.innerHTML = '';
      card.append(
        h('div', { class: 'muted' }, '✓ ' + score + '   ✗ ' + wrong),
        h('div', { class: 'big-word es' }, primaryEs(w.es)),
        h('div', { class: 'tf-eq' }, '='),
        h('div', { class: 'big-word' }, ru),
        h('div', { class: 'row center' },
          h('button', { class: 'btn big danger tf-no', type: 'button', onclick: () => answer(false) }, '✗ Неверно'),
          h('button', { class: 'btn big primary tf-yes', type: 'button', onclick: () => answer(true) }, '✓ Верно')),
        h('div', { class: 'muted small' }, '← / → на клавиатуре'));
    };
    const answer = v => {
      const ok = v === current.truth;
      Store.answer(ok);
      if (ok) { SFX.correct(); score++; } else { SFX.wrong(); wrong++; }
      card.classList.remove('flash-ok', 'flash-bad');
      void card.offsetWidth;
      card.classList.add(ok ? 'flash-ok' : 'flash-bad');
      draw();
    };
    const keyHandler = e => { if (e.key === 'ArrowLeft') answer(false); if (e.key === 'ArrowRight') answer(true); };
    document.addEventListener('keydown', keyHandler);
    api.cleanups.push(() => document.removeEventListener('keydown', keyHandler));
    api.timers.push(setInterval(() => {
      left -= 0.1;
      tb.set(Math.max(0, left));
      if (left <= 0) {
        api.timers.forEach(clearInterval);
        api.cleanups.forEach(f => f());
        gameOver(api, 'truefalse', Math.max(0, score - wrong), { label: 'очков', extra: h('p', { class: 'muted' }, `Верно: ${score}, ошибок: ${wrong} (очки = верно − ошибки)`) });
      }
    }, 100));
    draw();
  },

  // ---------- Виселица ----------
  hangman(api) {
    api.stage.append(topicPicker(topic => {
      const words = (topic ? topic.words : ALL_WORDS).map(w => ({ ...w, word: stripArticle(primaryEs(w.es)) }))
        .filter(w => /^[a-záéíóúñü]{4,12}$/.test(w.word));
      let wins = 0, round = 0;
      const play = () => {
        if (round >= 5) return gameOver(api, 'hangman', wins, { label: 'из 5 слов', xp: wins * 4 + 2 });
        round++;
        const target = pick(words);
        const letters = target.word.split('');
        const guessed = new Set();
        let errors = 0;
        const MAX = 7;
        api.stage.innerHTML = '';
        const fig = h('div', { class: 'hangman-fig' });
        const wordEl = h('div', { class: 'hangman-word es' });
        const kb = h('div', { class: 'keyboard' });
        const info = h('div', { class: 'muted center' });
        const drawState = () => {
          fig.innerHTML = hangmanSvg(errors);
          wordEl.innerHTML = '';
          letters.forEach(l => wordEl.append(h('span', { class: 'hm-letter' }, guessed.has(stripAccents(l)) ? l : '')));
          info.textContent = `Слово ${round}/5 · подсказка: ${target.ru} · ошибок ${errors}/${MAX}`;
        };
        const solved = () => letters.every(l => guessed.has(stripAccents(l)));
        const guess = (ch, btn) => {
          if (guessed.has(ch) || errors >= MAX || solved()) return;
          guessed.add(ch);
          const hit = letters.some(l => stripAccents(l) === ch);
          btn?.classList.add(hit ? 'hit' : 'miss');
          if (btn) btn.disabled = true;
          if (!hit) { errors++; SFX.wrong(); } else SFX.click();
          drawState();
          if (solved()) {
            wins++;
            Store.answer(true);
            Speech.speak(target.word);
            info.innerHTML = '';
            info.append(h('div', { class: 'ok-text' }, '¡Correcto! ' + target.word + ' — ' + target.ru), h('button', { class: 'btn primary', type: 'button', onclick: play }, 'Дальше →'));
          } else if (errors >= MAX) {
            Store.answer(false);
            wordEl.innerHTML = '';
            letters.forEach(l => wordEl.append(h('span', { class: 'hm-letter reveal' }, l)));
            info.innerHTML = '';
            info.append(h('div', { class: 'bad-text' }, 'Слово: ' + target.word + ' — ' + target.ru), h('button', { class: 'btn primary', type: 'button', onclick: play }, 'Дальше →'));
          }
        };
        'abcdefghijklmnñopqrstuvwxyz'.split('').forEach(ch => {
          const b = h('button', { class: 'key', type: 'button', 'data-ch': ch }, ch);
          b.onclick = () => guess(ch, b);
          kb.append(b);
        });
        const keyHandler = e => {
          const ch = e.key.toLowerCase();
          const b = kb.querySelector(`[data-ch="${ch}"]`);
          if (b && !b.disabled) guess(ch, b);
          else if (e.key === 'Enter') info.querySelector('.btn')?.click();
        };
        api.cleanups.forEach(f => f());
        api.cleanups.length = 0;
        document.addEventListener('keydown', keyHandler);
        api.cleanups.push(() => document.removeEventListener('keydown', keyHandler));
        api.stage.append(h('div', { class: 'card hangman' }, fig, wordEl, info, kb));
        drawState();
      };
      play();
    }));
  },

  // ---------- Анаграммы ----------
  anagram(api) {
    const words = ALL_WORDS.map(w => ({ ...w, word: stripArticle(primaryEs(w.es)) }))
      .filter(w => /^[a-záéíóúñü]{4,9}$/.test(w.word));
    let round = 0, score = 0;
    const play = () => {
      if (round >= 8) return gameOver(api, 'anagram', score, { label: 'из 8', xp: score * 2 + 2 });
      round++;
      const target = pick(words);
      let letters;
      do { letters = shuffle(target.word.split('')); } while (letters.join('') === target.word && target.word.length > 1);
      let usedHint = false;
      api.stage.innerHTML = '';
      const answer = h('div', { class: 'build-answer es anagram-answer' });
      const bank = h('div', { class: 'build-bank' });
      const fb = h('div', { class: 'trainer-feedback' });
      letters.forEach(l => {
        const c = h('button', { class: 'chip letter', type: 'button' }, l);
        c.onclick = () => {
          if (fb.textContent) return;
          (c.parentElement === bank ? answer : bank).appendChild(c);
          if (bank.children.length === 0) check();
        };
        bank.append(c);
      });
      const check = () => {
        const got = [...answer.children].map(c => c.textContent).join('');
        const ok = got === target.word;
        Store.answer(ok);
        if (ok) { SFX.correct(); score += usedHint ? 0.5 : 1; Speech.speak(target.word); }
        else SFX.wrong();
        answer.classList.add(ok ? 'correct' : 'wrong');
        fb.append(h('div', { class: ok ? 'ok-text' : 'bad-text' }, (ok ? '✓ ' : '✗ Правильно: ') + target.word), h('button', { class: 'btn primary', type: 'button', onclick: play }, 'Дальше →'));
      };
      api.stage.append(h('div', { class: 'card center' },
        h('div', { class: 'muted' }, `${round} / 8 · очки: ${score}`),
        h('h2', null, target.ru),
        answer, bank,
        h('div', { class: 'row center' },
          h('button', { class: 'btn small', type: 'button', onclick: () => { usedHint = true; Speech.speak(target.word); } }, '🔊 Подсказка'),
          h('button', { class: 'btn small', type: 'button', onclick: () => { [...answer.children].forEach(c => bank.appendChild(c)); answer.classList.remove('wrong'); } }, '↺ Сбросить')),
        fb));
    };
    play();
  },

  // ---------- Числа ----------
  numbers(api) {
    const ranges = [[0, 20, '0–20'], [20, 100, '20–100'], [100, 1000, '100–1000'], [1000, 1000000, '1000+']];
    api.stage.append(h('div', { class: 'card' },
      h('h3', null, 'Диапазон и режим'),
      h('div', { class: 'chips' }, ranges.flatMap(([a, b, l]) => [
        h('button', { class: 'chip', type: 'button', onclick: () => start(a, b, 'write') }, '✍️ ' + l + ': написать словами'),
        Speech.canSpeak ? h('button', { class: 'chip', type: 'button', onclick: () => start(a, b, 'listen') }, '🎧 ' + l + ': на слух') : null,
      ]))));
    const start = (min, max, mode) => {
      let round = 0, score = 0;
      const play = () => {
        if (round >= 10) return gameOver(api, 'numbers', score, { label: 'из 10', xp: score * 2 });
        round++;
        let n = randInt(min, max);
        if (max >= 1000 && Math.random() < 0.5) n = Math.round(n / 100) * 100;
        const words = numberToSpanish(n);
        api.stage.innerHTML = '';
        const fb = h('div', { class: 'trainer-feedback' });
        const field = UI.input({ placeholder: mode === 'write' ? 'Например: veintitrés' : 'Цифрами…', onEnter: v => check(v) });
        const check = v => {
          if (fb.textContent || !v.trim()) return;
          const ok = mode === 'write' ? checkAnswer(v, words).ok : parseInt(v.replace(/\D/g, ''), 10) === n;
          Store.answer(ok);
          if (ok) { SFX.correct(); score++; Store.stats.numbers++; }
          else SFX.wrong();
          Speech.speak(words);
          field.input.disabled = true;
          fb.append(h('div', { class: ok ? 'ok-text' : 'bad-text' }, (ok ? '✓ ' : '✗ ') + n.toLocaleString('ru-RU') + ' = ', h('b', { class: 'es' }, words)),
            h('button', { class: 'btn primary', type: 'button', onclick: play }, 'Дальше →'));
          fb.querySelector('.btn').focus();
          Store.checkAchievements();
        };
        api.stage.append(h('div', { class: 'card center' },
          h('div', { class: 'muted' }, `${round} / 10 · ✓ ${score}`),
          mode === 'write'
            ? h('div', { class: 'big-word' }, n.toLocaleString('ru-RU'))
            : h('div', { class: 'listen-row' },
              h('button', { class: 'listen-btn', type: 'button', onclick: () => Speech.speak(words) }, '🔊'),
              h('button', { class: 'listen-btn small', type: 'button', onclick: () => Speech.speak(words, { rate: 0.5 }) }, '🐢')),
          field,
          h('button', { class: 'btn primary', type: 'button', onclick: () => check(field.input.value) }, 'Проверить'),
          fb));
        if (mode === 'listen') setTimeout(() => Speech.speak(words), 250);
        field.input.focus();
      };
      play();
    };
  },

  // ---------- Часы ----------
  clock(api) {
    let round = 0, score = 0;
    const play = () => {
      if (round >= 10) return gameOver(api, 'clock', score, { label: 'из 10', xp: score * 2 });
      round++;
      const hh = randInt(1, 12), mm = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
      const answer = timeToSpanish(hh, mm);
      const opts = new Set([answer]);
      while (opts.size < 4) {
        const alt = Math.random() < 0.5 ? [hh % 12 + 1, mm] : [hh, pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])];
        opts.add(timeToSpanish(alt[0], alt[1]));
      }
      api.stage.innerHTML = '';
      const ex = { type: 'pick_ru', options: shuffle([...opts]), answer };
      const card = h('div', { class: 'card center' },
        h('div', { class: 'muted' }, `${round} / 10 · ✓ ${score}`),
        h('div', { class: 'clock', html: clockSvg(hh, mm) }),
        h('div', { class: 'digital' }, `${hh}:${String(mm).padStart(2, '0')}`));
      const box = h('div', { class: 'options wide' });
      ex.options.forEach(o => box.append(h('button', {
        class: 'option', type: 'button',
        onclick: e => {
          if (box.dataset.done) return;
          box.dataset.done = 1;
          const ok = o === answer;
          Store.answer(ok);
          e.currentTarget.classList.add(ok ? 'correct' : 'wrong');
          if (!ok) [...box.children].find(b => b.textContent === answer).classList.add('correct');
          ok ? (SFX.correct(), score++) : SFX.wrong();
          Speech.speak(answer);
          setTimeout(play, ok ? 1200 : 2200);
        },
      }, o)));
      card.append(box);
      api.stage.append(card);
    };
    play();
  },

  // ---------- Диктант ----------
  dictation(api) {
    const sentences = TOPICS.flatMap(t => t.sentences.map(s => ({ ...s, level: t.level })));
    let round = 0, total = 0;
    const play = () => {
      if (round >= 5) return gameOver(api, 'dictation', Math.round(total), { label: '% — средняя точность', xp: Math.round(total / 25) + 2 });
      round++;
      const s = pick(sentences);
      api.stage.innerHTML = '';
      const fb = h('div', { class: 'trainer-feedback' });
      const field = UI.input({ placeholder: 'Запишите услышанное…', onEnter: v => check(v) });
      const check = v => {
        if (fb.textContent || !v.trim()) return;
        const sim = similarity(v, s.es);
        const pct = Math.round(sim * 100);
        total += pct / 5;
        Store.answer(pct >= 85);
        pct >= 85 ? SFX.correct() : SFX.wrong();
        field.input.disabled = true;
        fb.append(
          h('div', { class: pct >= 85 ? 'ok-text' : 'bad-text' }, `Совпадение: ${pct}%`),
          h('div', null, 'Оригинал: ', h('b', { class: 'es' }, s.es)),
          h('div', { class: 'muted' }, s.ru),
          h('button', { class: 'btn primary', type: 'button', onclick: play }, 'Дальше →'));
        fb.querySelector('.btn').focus();
      };
      api.stage.append(h('div', { class: 'card center' },
        h('div', { class: 'muted' }, `${round} / 5`),
        h('div', { class: 'listen-row' },
          h('button', { class: 'listen-btn', type: 'button', onclick: () => Speech.speak(s.es) }, '🔊'),
          h('button', { class: 'listen-btn small', type: 'button', onclick: () => Speech.speak(s.es, { rate: 0.55 }) }, '🐢')),
        field,
        h('button', { class: 'btn primary', type: 'button', onclick: () => check(field.input.value) }, 'Проверить'),
        fb));
      setTimeout(() => Speech.speak(s.es), 300);
      field.input.focus();
    };
    play();
  },

  // ---------- Произношение ----------
  speak(api) {
    if (!Speech.canListen) {
      api.stage.append(h('div', { class: 'card center' }, h('div', { class: 'big-emoji' }, '🎙️'),
        h('p', null, 'Ваш браузер не поддерживает распознавание речи. Попробуйте Chrome или Edge.')));
      return;
    }
    const phrases = TOPICS.flatMap(t => t.sentences).filter(s => s.es.split(' ').length <= 6);
    let round = 0, good = 0, rec = null;
    api.cleanups.push(() => rec?.abort?.());
    const play = () => {
      if (round >= 6) return gameOver(api, 'speak', good, { label: 'из 6', xp: good * 3 + 2 });
      round++;
      const s = pick(phrases);
      api.stage.innerHTML = '';
      const fb = h('div', { class: 'trainer-feedback' });
      const mic = h('button', { class: 'mic-btn', type: 'button' }, '🎙️');
      mic.onclick = () => {
        if (mic.classList.contains('rec')) return;
        mic.classList.add('rec');
        fb.innerHTML = '';
        fb.append(h('div', { class: 'muted' }, 'Говорите…'));
        rec = Speech.listen({
          onResult: alts => {
            const best = alts.reduce((a, t) => (similarity(t, s.es) > similarity(a, s.es) ? t : a), alts[0]);
            const pct = Math.round(similarity(best, s.es) * 100);
            fb.innerHTML = '';
            const ok = pct >= 80;
            if (ok) { SFX.correct(); good++; Store.stats.spoken++; Store.checkAchievements(); } else SFX.wrong();
            fb.append(
              h('div', { class: ok ? 'ok-text' : 'bad-text' }, `${ok ? '¡Muy bien!' : 'Попробуйте ещё'} — ${pct}%`),
              h('div', null, 'Распознано: «', h('span', { class: 'es' }, best), '»'),
              h('div', { class: 'row center' },
                h('button', { class: 'btn', type: 'button', onclick: () => mic.click() }, '↺ Ещё раз'),
                h('button', { class: 'btn primary', type: 'button', onclick: play }, 'Дальше →')));
          },
          onError: msg => { fb.innerHTML = ''; fb.append(h('div', { class: 'bad-text' }, msg)); },
          onEnd: () => mic.classList.remove('rec'),
        });
      };
      api.stage.append(h('div', { class: 'card center' },
        h('div', { class: 'muted' }, `${round} / 6 · удачно: ${good}`),
        h('div', { class: 'big-word es' }, s.es),
        h('div', { class: 'muted' }, s.ru),
        h('div', { class: 'row center' }, speakBtn(s.es, { big: true }), mic),
        h('p', { class: 'muted small' }, 'Сначала прослушайте, затем нажмите на микрофон и произнесите фразу.'),
        fb));
    };
    play();
  },

  // ---------- Столицы ----------
  capitals(api) {
    const round = sample(COUNTRIES, 10);
    let i = 0, score = 0;
    const play = () => {
      if (i >= round.length) return gameOver(api, 'capitals', score, { label: 'из 10', xp: score * 2 });
      const c = round[i++];
      const reverse = Math.random() < 0.3;
      const answer = reverse ? c.es : c.capital;
      const opts = shuffle([answer, ...sample(COUNTRIES.filter(x => x !== c), 3).map(x => reverse ? x.es : x.capital)]);
      api.stage.innerHTML = '';
      const box = h('div', { class: 'options wide' });
      const fact = h('div', { class: 'muted small', hidden: true }, c.fact);
      opts.forEach(o => box.append(h('button', {
        class: 'option', type: 'button',
        onclick: e => {
          if (box.dataset.done) return;
          box.dataset.done = 1;
          const ok = o === answer;
          Store.answer(ok);
          e.currentTarget.classList.add(ok ? 'correct' : 'wrong');
          if (!ok) [...box.children].find(b => b.textContent === answer).classList.add('correct');
          ok ? (SFX.correct(), score++) : SFX.wrong();
          fact.hidden = false;
          box.after(h('button', { class: 'btn primary', type: 'button', onclick: play }, 'Дальше →'));
        },
      }, o)));
      api.stage.append(h('div', { class: 'card center' },
        h('div', { class: 'muted' }, `${i} / 10 · ✓ ${score}`),
        h('div', { class: 'flag big' }, c.flag),
        h('h2', null, reverse ? `Столица какой страны — ${c.capital}?` : `¿Cuál es la capital de ${c.es}?`),
        box, fact));
    };
    play();
  },
};

function hangmanSvg(errors) {
  const parts = [
    '<line x1="10" y1="140" x2="110" y2="140"/>',
    '<line x1="30" y1="140" x2="30" y2="10"/><line x1="30" y1="10" x2="90" y2="10"/><line x1="90" y1="10" x2="90" y2="28"/>',
    '<circle cx="90" cy="40" r="12"/>',
    '<line x1="90" y1="52" x2="90" y2="95"/>',
    '<line x1="90" y1="62" x2="72" y2="80"/>',
    '<line x1="90" y1="62" x2="108" y2="80"/>',
    '<line x1="90" y1="95" x2="75" y2="120"/><line x1="90" y1="95" x2="105" y2="120"/>',
  ];
  return `<svg viewBox="0 0 120 150" class="hangman-svg" aria-hidden="true">${parts.slice(0, errors).join('')}</svg>`;
}

function clockSvg(hh, mm) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * Math.PI / 180;
    return `<line x1="${60 + 46 * Math.cos(a)}" y1="${60 + 46 * Math.sin(a)}" x2="${60 + 52 * Math.cos(a)}" y2="${60 + 52 * Math.sin(a)}" class="tick"/>`;
  }).join('');
  const ha = ((hh % 12) * 30 + mm * 0.5 - 90) * Math.PI / 180;
  const ma = (mm * 6 - 90) * Math.PI / 180;
  return `<svg viewBox="0 0 120 120" aria-label="Часы">
    <circle cx="60" cy="60" r="56" class="face"/>${ticks}
    <line x1="60" y1="60" x2="${60 + 28 * Math.cos(ha)}" y2="${60 + 28 * Math.sin(ha)}" class="hand-h"/>
    <line x1="60" y1="60" x2="${60 + 42 * Math.cos(ma)}" y2="${60 + 42 * Math.sin(ma)}" class="hand-m"/>
    <circle cx="60" cy="60" r="3" class="pin"/></svg>`;
}
