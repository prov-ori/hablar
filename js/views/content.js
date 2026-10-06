// Грамматика, рассказы, диалоги, культура.

// ---------- Грамматика ----------
Views.grammar = () => {
  const levels = ['A1', 'A2', 'B1'];
  return h('div', null,
    UI.pageHeader('Грамматика', `${GRAMMAR.length} тем с объяснениями на русском и тестами`),
    levels.map(lv => h('section', { class: 'level-block' },
      h('h2', { class: 'level-title' }, h('span', { class: 'level-badge ' + lv }, lv)),
      h('div', { class: 'card-grid' }, GRAMMAR.filter(g => g.level === lv).map(g => {
        const res = Store.stats.grammar[g.id];
        return h('a', { class: 'card topic-card' + (res ? ' done' : ''), href: '#/grammar/' + g.id },
          h('div', { class: 'topic-icon' }, g.icon),
          h('div', null, h('div', { class: 'tile-title' }, g.title),
            h('div', { class: 'muted small' }, res ? `✓ Тест: ${res}%` : g.quiz.length + ' вопросов')));
      })))));
};

function attachSpeakToEs(container) {
  container.querySelectorAll('.es').forEach(el => {
    el.classList.add('speakable');
    el.title = 'Нажмите, чтобы услышать';
    el.addEventListener('click', () => Speech.speak(el.textContent));
  });
}

function quizBlock(questions, onFinish) {
  const box = h('div', { class: 'quiz' });
  let correct = 0, answered = 0;
  const items = questions.map((q, qi) => {
    const answer = q.options[0];
    const opts = shuffle(q.options);
    const fb = h('div', { class: 'quiz-fb' });
    const row = h('div', { class: 'options compact' });
    opts.forEach(o => row.append(h('button', {
      class: 'option', type: 'button',
      onclick: e => {
        if (row.dataset.done) return;
        row.dataset.done = '1';
        const ok = o === answer;
        e.currentTarget.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) [...row.children].find(b => b.textContent === answer)?.classList.add('correct');
        ok ? SFX.correct() : SFX.wrong();
        Store.answer(ok);
        if (ok) correct++;
        answered++;
        if (q.q.includes('___')) {
          const fills = answer.split(' / ');
          let k = 0;
          const filled = q.q.replace(/___/g, () => fills[Math.min(k++, fills.length - 1)].replace('—', '')).replace(/\s+/g, ' ');
          fb.append(h('span', { class: 'es speakable', onclick: () => Speech.speak(filled.replace(/\(.*?\)/g, '')) }, '🔊 ' + filled));
        }
        if (answered === questions.length) onFinish(Math.round((correct / questions.length) * 100), correct);
      },
    }, o)));
    return h('div', { class: 'quiz-item' }, h('div', { class: 'quiz-q' }, h('b', null, qi + 1 + '. '), q.q), row, fb);
  });
  box.append(...items);
  return box;
}

Views.grammarTopic = ([id]) => {
  const idx = GRAMMAR.findIndex(x => x.id === id);
  const g = GRAMMAR[idx];
  if (!g) return Views.notFound();
  const body = h('div', { class: 'card prose', html: g.html });
  attachSpeakToEs(body);
  const result = h('div');
  const quiz = quizBlock(g.quiz, (pct, n) => {
    const prev = Store.stats.grammar[g.id];
    result.innerHTML = '';
    if (pct >= 80) {
      Store.stats.grammar[g.id] = Math.max(prev || 0, pct);
      Store.addXp(prev ? 3 : 10);
      if (pct === 100) UI.confetti();
    } else {
      Store.save();
    }
    result.append(h('div', { class: 'card center result-inline ' + (pct >= 80 ? 'ok' : 'bad') },
      h('h3', null, `${n} из ${g.quiz.length} (${pct}%)`),
      h('p', null, pct >= 80 ? '¡Muy bien! Тема засчитана.' : 'Для зачёта нужно 80%. Перечитайте объяснение и попробуйте снова.'),
      h('div', { class: 'row center' },
        h('button', { class: 'btn', type: 'button', onclick: () => render() }, 'Пройти заново'),
        GRAMMAR[idx + 1] ? h('a', { class: 'btn primary', href: '#/grammar/' + GRAMMAR[idx + 1].id }, 'Следующая тема →') : null)));
  });
  return h('div', null,
    UI.pageHeader(g.icon + ' ' + g.title, 'Уровень ' + g.level + ' · нажимайте на испанские примеры, чтобы их услышать', '#/grammar'),
    body,
    h('div', { class: 'card' }, h('h2', null, '✏️ Проверьте себя'), quiz, result));
};

// ---------- Рассказы ----------
Views.stories = () => h('div', null,
  UI.pageHeader('Чтение', 'Нажимайте на слова, чтобы увидеть перевод. Нажмите на 💬, чтобы перевести предложение.'),
  h('div', { class: 'card-grid' }, STORIES.map(s => {
    const res = Store.stats.stories[s.id];
    return h('a', { class: 'card topic-card' + (res ? ' done' : ''), href: '#/stories/' + s.id },
      h('div', { class: 'topic-icon' }, s.icon),
      h('div', null,
        h('div', { class: 'tile-title es' }, s.title),
        h('div', { class: 'muted small' }, s.ru),
        h('div', { class: 'small' }, h('span', { class: 'level-badge ' + s.level }, s.level), ' ', s.lines.length + ' предложений', res ? ' · ✓ ' + res + '%' : '')));
  })));

let popover = null;
function showWordPopover(target, word, translation) {
  hidePopover();
  popover = h('div', { class: 'popover' },
    h('div', { class: 'pop-head' }, h('b', { class: 'es' }, word), speakBtn(word)),
    h('div', null, translation || h('span', { class: 'muted' }, 'нет в словаре')),
    translation ? h('button', {
      class: 'btn small', type: 'button',
      onclick: () => { if (Store.srsAdd(word, translation)) { UI.toast('Добавлено в повторение'); updateHeader(); } hidePopover(); },
    }, '+ В повторение') : null);
  document.body.appendChild(popover);
  const r = target.getBoundingClientRect();
  const pw = popover.offsetWidth;
  popover.style.left = Math.max(8, Math.min(innerWidth - pw - 8, r.left + r.width / 2 - pw / 2)) + 'px';
  popover.style.top = (r.bottom + scrollY + 6) + 'px';
  Speech.speak(word);
}
function hidePopover() { popover?.remove(); popover = null; }
document.addEventListener('click', e => {
  if (popover && !popover.contains(e.target) && !e.target.classList.contains('word')) hidePopover();
});

function lookupWord(word, glossary) {
  const lw = word.toLowerCase();
  if (glossary[lw]) return glossary[lw];
  const k = stripAccents(lw);
  if (LOOKUP.has(k)) return LOOKUP.get(k);
  // простая «лемматизация»: множественное число, женский род
  const tries = [k.replace(/es$/, ''), k.replace(/s$/, ''), k.replace(/as?$/, 'o'), k.replace(/os$/, 'o')];
  for (const t of tries) if (t !== k && LOOKUP.has(t)) return LOOKUP.get(t);
  return null;
}

// Разбивает предложение на кликабельные слова, склеивая многословные фразы из глоссария
function renderSentenceWords(text, glossary) {
  const out = [];
  const parts = text.split(/(\s+)/);
  const words = [];
  parts.forEach(p => { if (p.trim()) words.push(p); });
  const phrases = Object.keys(glossary).filter(k => k.includes(' '));
  let i = 0;
  while (i < words.length) {
    let matched = false;
    for (let len = 4; len >= 2; len--) {
      if (i + len > words.length) continue;
      const chunk = words.slice(i, i + len);
      const clean = chunk.map(w => w.replace(/[¿?¡!.,;:«»—"]/g, '').toLowerCase()).join(' ');
      if (phrases.includes(clean)) {
        out.push(wordSpan(chunk.join(' '), clean, glossary[clean]));
        i += len;
        matched = true;
        break;
      }
    }
    if (matched) { out.push(' '); continue; }
    const raw = words[i];
    const m = raw.match(/^([¿¡«—"]*)(.*?)([?!.,;:»"]*)$/);
    const [, pre, core, post] = m;
    if (pre) out.push(pre);
    if (core) out.push(wordSpan(core, core, lookupWord(core, glossary)));
    if (post) out.push(post);
    out.push(' ');
    i++;
  }
  return out;
}

function wordSpan(display, key, translation) {
  const s = h('span', { class: 'word' + (translation ? '' : ' unknown') }, display);
  s.addEventListener('click', e => { e.stopPropagation(); showWordPopover(s, key.replace(/[¿?¡!.,;:«»—"]/g, ''), translation); });
  return s;
}

Views.story = ([id], ctx) => {
  const s = STORIES.find(x => x.id === id);
  if (!s) return Views.notFound();
  let reading = false;
  ctx.onCleanup(() => { reading = false; hidePopover(); });

  const lineEls = s.lines.map((l, i) => {
    const tr = h('div', { class: 'line-tr', hidden: true }, l.ru);
    return h('div', { class: 'story-line', 'data-i': i },
      h('div', { class: 'line-es es' }, renderSentenceWords(l.es, s.glossary || {})),
      h('div', { class: 'line-tools' },
        speakBtn(l.es),
        h('button', { class: 'speak-btn', type: 'button', title: 'Перевод', onclick: () => { tr.hidden = !tr.hidden; } }, '💬')),
      tr);
  });

  const readAll = (btn) => {
    if (reading) { reading = false; speechSynthesis.cancel(); btn.textContent = '▶ Слушать весь текст'; return; }
    reading = true;
    btn.textContent = '⏹ Остановить';
    let i = 0;
    const step = () => {
      lineEls.forEach(el => el.classList.remove('reading'));
      if (!reading || i >= s.lines.length) { reading = false; btn.textContent = '▶ Слушать весь текст'; return; }
      lineEls[i].classList.add('reading');
      lineEls[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
      Speech.speak(s.lines[i].es, { onend: () => { i++; setTimeout(step, 250); } });
    };
    step();
  };

  const allTr = h('label', { class: 'switch' }, h('input', {
    type: 'checkbox', onchange: e => lineEls.forEach(el => { el.querySelector('.line-tr').hidden = !e.target.checked; }),
  }), ' Показать весь перевод');

  const result = h('div');
  const quiz = quizBlock(s.questions, (pct, n) => {
    const prev = Store.stats.stories[s.id];
    Store.stats.stories[s.id] = Math.max(prev || 0, pct);
    Store.addXp(prev ? 3 : 10 + n * 2);
    result.innerHTML = '';
    result.append(h('div', { class: 'card center result-inline ' + (pct >= 60 ? 'ok' : 'bad') },
      h('h3', null, `Понимание: ${n} из ${s.questions.length}`),
      h('a', { class: 'btn primary', href: '#/stories' }, 'Другие рассказы')));
  });

  return h('div', null,
    UI.pageHeader(h('span', { class: 'es' }, s.icon + ' ' + s.title), s.ru + ' · уровень ' + s.level, '#/stories'),
    h('div', { class: 'row wrap' },
      Speech.canSpeak ? h('button', { class: 'btn', type: 'button', onclick: e => readAll(e.currentTarget) }, '▶ Слушать весь текст') : null,
      allTr),
    h('div', { class: 'card story' }, lineEls),
    h('div', { class: 'card' }, h('h2', null, '❓ Вопросы к тексту'), quiz, result));
};

// ---------- Диалоги ----------
Views.dialogues = () => h('div', null,
  UI.pageHeader('Диалоги', 'Ролевые ситуации из жизни: выбирайте уместную реплику. Ошибки объясняются.'),
  h('div', { class: 'card-grid' }, DIALOGUES.map(d => {
    const res = Store.stats.dialogues[d.id];
    return h('a', { class: 'card topic-card' + (res != null ? ' done' : ''), href: '#/dialogues/' + d.id },
      h('div', { class: 'topic-icon' }, d.icon),
      h('div', null,
        h('div', { class: 'tile-title es' }, d.title),
        h('div', { class: 'muted small' }, d.ru),
        h('div', { class: 'small' }, h('span', { class: 'level-badge ' + d.level }, d.level), res != null ? ' ✓ ' + res + '/' + d.turns.length : '')));
  })));

Views.dialogue = ([id]) => {
  const d = DIALOGUES.find(x => x.id === id);
  if (!d) return Views.notFound();
  const chat = h('div', { class: 'chat' });
  const choices = h('div', { class: 'choices' });
  let turn = 0, firstTry = 0, mistakeThisTurn = false;

  const bubble = (who, es, ru) => {
    const tr = h('div', { class: 'bubble-tr', hidden: who === 'me' }, ru);
    const b = h('div', { class: 'bubble ' + who },
      who === 'npc' ? h('div', { class: 'bubble-name' }, d.npcIcon + ' ' + d.npc) : null,
      h('div', { class: 'es' }, es),
      who === 'npc' ? h('div', { class: 'bubble-tools' }, speakBtn(es),
        h('button', { class: 'speak-btn', type: 'button', title: 'Перевод', onclick: () => { tr.hidden = !tr.hidden; } }, '💬')) : null,
      tr);
    chat.append(b);
    b.scrollIntoView({ block: 'end', behavior: 'smooth' });
    return b;
  };

  const showTurn = () => {
    choices.innerHTML = '';
    if (turn >= d.turns.length) return finish();
    const t = d.turns[turn];
    mistakeThisTurn = false;
    bubble('npc', t.npc, t.ru);
    setTimeout(() => Speech.speak(t.npc), 300);
    const correct = t.options[0];
    shuffle(t.options).forEach(o => {
      const b = h('button', { class: 'option wide', type: 'button' }, o.es);
      b.onclick = () => {
        if (b.disabled) return;
        if (o === correct) {
          SFX.correct();
          Store.answer(true);
          if (!mistakeThisTurn) firstTry++;
          bubble('me', o.es, o.ru);
          turn++;
          setTimeout(showTurn, 500);
        } else {
          SFX.wrong();
          Store.answer(false);
          mistakeThisTurn = true;
          b.disabled = true;
          b.classList.add('wrong');
          b.append(h('div', { class: 'why small' }, '💡 ' + (o.why || 'Не подходит по смыслу.')));
        }
      };
      choices.append(b);
    });
  };

  const finish = () => {
    const prev = Store.stats.dialogues[d.id];
    Store.stats.dialogues[d.id] = Math.max(prev ?? 0, firstTry);
    Store.addXp(prev != null ? 3 : 8 + firstTry * 2);
    if (firstTry === d.turns.length) UI.confetti();
    choices.append(h('div', { class: 'card center' },
      h('h3', null, `Диалог завершён! С первой попытки: ${firstTry}/${d.turns.length}`),
      h('div', { class: 'row center' },
        h('button', { class: 'btn', type: 'button', onclick: () => render() }, 'Ещё раз'),
        h('a', { class: 'btn primary', href: '#/dialogues' }, 'Другие диалоги'))));
  };

  showTurn();
  return h('div', null,
    UI.pageHeader(d.icon + ' ' + d.title, d.ru + ' · нажмите 💬, чтобы увидеть перевод реплики', '#/dialogues'),
    h('div', { class: 'card chat-card' }, chat),
    choices);
};

// ---------- Культура ----------
Views.culture = () => {
  let tab = 'countries';
  const area = h('div');
  const tabs = h('div', { class: 'segmented' }, [['countries', '🌎 Страны'], ['idioms', '💬 Идиомы'], ['notes', '☕ Обычаи']].map(([id, l]) =>
    h('button', {
      type: 'button', class: id === tab ? 'active' : '',
      onclick: e => { tab = id; tabs.querySelectorAll('button').forEach(b => b.classList.remove('active')); e.currentTarget.classList.add('active'); draw(); },
    }, l)));
  const draw = () => {
    area.innerHTML = '';
    if (tab === 'countries') {
      area.append(
        h('p', { class: 'muted' }, `Испанский — родной язык для ~500 млн человек в ${COUNTRIES.length} странах и территориях. Нажмите на карточку, чтобы узнать факт.`),
        h('a', { class: 'btn small', href: '#/games/capitals' }, '🎯 Викторина «Столицы»'),
        h('div', { class: 'country-grid' }, COUNTRIES.map(c => {
          const card = h('button', { class: 'country card', type: 'button' },
            h('div', { class: 'flag' }, c.flag),
            h('div', { class: 'tile-title es' }, c.es),
            h('div', { class: 'muted small' }, c.ru),
            h('div', { class: 'small' }, '🏛 ', h('span', { class: 'es' }, c.capital)),
            h('div', { class: 'country-fact small', hidden: true }, h('div', { class: 'muted' }, c.people), c.fact));
          card.onclick = () => { const f = card.querySelector('.country-fact'); f.hidden = !f.hidden; Speech.speak(c.es); };
          return card;
        })));
    } else if (tab === 'idioms') {
      area.append(h('div', { class: 'idioms' }, IDIOMS.map(i => h('div', { class: 'card idiom' },
        h('div', { class: 'idiom-es es' }, speakBtn(i.es), i.es),
        h('div', { class: 'muted small' }, 'Дословно: ' + i.lit),
        h('div', null, '→ ', h('b', null, i.ru))))));
    } else {
      area.append(h('div', { class: 'card-grid' }, CULTURE_NOTES.map(n => h('div', { class: 'card' },
        h('div', { class: 'topic-icon' }, n.icon), h('h3', null, n.title), h('p', null, n.text)))));
    }
  };
  draw();
  return h('div', null, UI.pageHeader('Культура', 'Испаноязычный мир: страны, выражения и обычаи'), tabs, area);
};
