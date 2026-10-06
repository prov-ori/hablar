// Браузерный smoke-тест: открывает каждый экран, проходит урок и пару игр, ловит ошибки консоли.
// Запуск: node tests/smoke.test.js  (нужен playwright; путь к модулю можно задать через NODE_PATH)

const path = require('path');
const { chromium } = require('playwright');

const url = 'file://' + path.join(__dirname, '..', 'index.html');
const shotsDir = process.env.SHOTS_DIR;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text()) && !/ERR_/.test(m.text())) errors.push('console: ' + m.text()); });

  await page.goto(url + '#/');
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();

  const routes = ['#/', '#/path', '#/review', '#/verbs', '#/verbs/tener', '#/verbs/train', '#/grammar', '#/grammar/ser-estar',
    '#/stories', '#/stories/cafe', '#/dialogues', '#/dialogues/cafeteria', '#/games', '#/dictionary', '#/culture', '#/profile', '#/settings', '#/nope',
    ...['speed', 'memory', 'gender', 'truefalse', 'hangman', 'anagram', 'numbers', 'clock', 'dictation', 'speak', 'capitals'].map(g => '#/games/' + g)];
  for (const r of routes) {
    await page.goto(url + r);
    await page.waitForTimeout(150);
    const text = await page.locator('main').innerText();
    if (/Что-то пошло не так/.test(text)) errors.push(`${r}: render error — ${text.slice(0, 200)}`);
    if (shotsDir && ['#/', '#/path', '#/verbs/train', '#/stories/cafe', '#/games', '#/profile'].includes(r)) {
      await page.screenshot({ path: path.join(shotsDir, r.replace(/[#/]/g, '_') + '.png') });
    }
  }

  // Проходим первый урок: правильные ответы берём из данных упражнения
  await page.goto(url + '#/lesson/saludos/0');
  await page.click('text=Начать урок');
  let guard = 0;
  while (guard++ < 60) {
    if (await page.locator('.result').count()) break;
    const ex = page.locator('.exercise');
    const cls = await ex.getAttribute('class');
    if (/ex-(pick_ru|pick_es|listen|gap|translate_sentence)/.test(cls)) {
      await page.locator('.exercise .option').first().click(); // может быть неверно — урок повторит упражнение
    } else if (/ex-(type_es|dictation)/.test(cls)) {
      await page.fill('.answer-input', 'xxx');
      await page.click('.check-btn');
    } else if (/ex-match/.test(cls)) {
      // кликаем все комбинации, пока всё не совпадёт
      const n = await page.locator('.match-col').first().locator('.match-item').count();
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const l = page.locator('.match-col').nth(0).locator('.match-item').nth(i);
        const r = page.locator('.match-col').nth(1).locator('.match-item').nth(j);
        if (await l.evaluate(e => e.classList.contains('done'))) break;
        if (await r.evaluate(e => e.classList.contains('done'))) continue;
        await l.click(); await r.click();
        await page.waitForTimeout(420);
      }
    } else if (/ex-build/.test(cls)) {
      await page.locator('.build-bank .chip').first().click();
      await page.click('.check-btn');
    }
    await page.waitForSelector('.lesson-footer .btn, .result', { timeout: 3000 });
    if (await page.locator('.result').count()) break;
    await page.click('.lesson-footer .btn');
  }
  if (!(await page.locator('.result').count())) errors.push('lesson did not finish');
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('hablar.v1')));
  if (!state || state.xp <= 0) errors.push('xp not saved');
  if (!state.lessons['saludos:0']) errors.push('lesson completion not saved');
  if (Object.keys(state.srs).length < 4) errors.push('srs words not added');
  if (shotsDir) await page.screenshot({ path: path.join(shotsDir, 'lesson_result.png') });

  // Повторение карточек
  await page.goto(url + '#/review');
  await page.click('.flashcard');
  await page.click('.grade-btn.good');
  if (!(await page.locator('.flashcard, .card.center').count())) errors.push('review broken');

  // Тренажёр глаголов
  await page.goto(url + '#/verbs/train');
  await page.fill('.answer-input', 'zzz');
  await page.keyboard.press('Enter');
  if (!(await page.locator('.bad-text').count())) errors.push('trainer feedback missing');

  // Грамматика: отвечаем на все вопросы
  await page.goto(url + '#/grammar/ser-estar');
  const items = await page.locator('.quiz-item').count();
  for (let i = 0; i < items; i++) await page.locator('.quiz-item').nth(i).locator('.option').first().click();
  if (!(await page.locator('.result-inline').count())) errors.push('grammar quiz result missing');

  // Рассказ: всплывающая подсказка слова
  await page.goto(url + '#/stories/cafe');
  await page.locator('.word').nth(3).click();
  if (!(await page.locator('.popover').count())) errors.push('word popover missing');

  // Диалог: всегда выбираем, пока не дойдём до конца
  await page.goto(url + '#/dialogues/cafeteria');
  for (let i = 0; i < 20; i++) {
    const opts = page.locator('.choices .option:not([disabled])');
    if (!(await opts.count())) break;
    await opts.first().click();
    await page.waitForTimeout(650);
  }
  if (!(await page.locator('text=Диалог завершён').count())) errors.push('dialogue did not finish');

  // Мобильная ширина: нет горизонтального скролла
  await page.setViewportSize({ width: 375, height: 800 });
  for (const r of ['#/', '#/path', '#/verbs/train', '#/dictionary', '#/games/memory', '#/profile']) {
    await page.goto(url + r);
    await page.waitForTimeout(100);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) errors.push(`${r}: horizontal overflow ${overflow}px at 375px`);
  }
  if (shotsDir) { await page.goto(url + '#/'); await page.screenshot({ path: path.join(shotsDir, 'mobile_home.png'), fullPage: true }); }

  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('Smoke test OK: ' + routes.length + ' routes, lesson, review, trainer, grammar, story, dialogue, mobile layout');
})().catch(e => { console.error(e); process.exit(1); });
