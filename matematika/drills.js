/* Генераторы задач (задачник). gen(уровень, R) → { q, a | opts, sol, hint, show, unit, ordered, tol, svg }.
   a: число | массив чисел (несколько ответов, порядок не важен; ordered:true — важен) | строка.
   opts: варианты, верный — первый (движок перемешивает). В строках обратная косая черта удваивается. */
(function () {
  const D = (course, lesson, id, ico, title, desc, levels, gen, tags) => PLATFORM.drills.push({ course, lesson, id, ico, title, desc, levels, gen, tags });
  const svgOpen = (w, h) => '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" font-family="system-ui,sans-serif" font-size="14">';
  const txt = (x, y, s, anchor) => '<text x="' + x + '" y="' + y + '" fill="currentColor" stroke="none" text-anchor="' + (anchor || 'middle') + '">' + s + '</text>';
  PLATFORM.drawKit = { svgOpen, txt };
  const clock = (h, m) => {
    let s = svgOpen(160, 160) + '<circle cx="80" cy="80" r="72"/>';
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, r1 = i % 5 ? 66 : 60; s += '<line x1="' + (80 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (80 - r1 * Math.cos(a)).toFixed(1) + '" x2="' + (80 + 70 * Math.sin(a)).toFixed(1) + '" y2="' + (80 - 70 * Math.cos(a)).toFixed(1) + '" stroke-width="' + (i % 5 ? 1 : 2.5) + '"/>'; }
    for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6; s += txt((80 + 48 * Math.sin(a)).toFixed(1), (85 - 48 * Math.cos(a)).toFixed(1), i); }
    const ha = ((h % 12) + m / 60) * Math.PI / 6, ma = m * Math.PI / 30;
    s += '<line x1="80" y1="80" x2="' + (80 + 34 * Math.sin(ha)).toFixed(1) + '" y2="' + (80 - 34 * Math.cos(ha)).toFixed(1) + '" stroke-width="6" stroke-linecap="round"/>';
    s += '<line x1="80" y1="80" x2="' + (80 + 56 * Math.sin(ma)).toFixed(1) + '" y2="' + (80 - 56 * Math.cos(ma)).toFixed(1) + '" stroke-width="3" stroke-linecap="round"/><circle cx="80" cy="80" r="4" fill="currentColor"/></svg>';
    return s;
  };
  const pad = n => (n < 10 ? '0' : '') + n;

  /* ——— Курс I ——— */
  D(1, 'numbers', 'd-place', '🔢', 'Разряды числа', 'Единицы, десятки, сотни: что означает каждая цифра.', ['Двузначные', 'Трёхзначные', 'Сборка числа'], (lv, R) => {
    if (lv === 1) { const n = R.int(10, 99); const k = R.int(0, 1); return { q: 'Сколько ' + (k ? 'десятков' : 'единиц') + ' в разряде ' + (k ? 'десятков' : 'единиц') + ' числа ' + n + '?', a: k ? Math.floor(n / 10) : n % 10, sol: n + ' = ' + Math.floor(n / 10) * 10 + ' + ' + n % 10 }; }
    if (lv === 2) { const n = R.int(100, 999); const k = R.int(0, 3); if (k === 3) return { q: 'Сколько всего десятков в числе ' + n + '?', a: Math.floor(n / 10), sol: 'Отбросим единицы: ' + n + ' содержит ' + Math.floor(n / 10) + ' десятков (и ' + n % 10 + ' единиц).' }; const nm = ['единиц', 'десятков', 'сотен'][k]; return { q: 'Какая цифра стоит в разряде ' + nm + ' числа ' + n + '?', a: Math.floor(n / 10 ** k) % 10, sol: 'Разряды справа налево: единицы, десятки, сотни.' }; }
    const s = R.int(1, 9), d = R.pick([0, R.int(1, 9)]), u = R.int(0, 9);
    return { q: 'Запишите число: ' + s + ' сотен, ' + d + ' десятков и ' + u + ' единиц.', a: s * 100 + d * 10 + u, sol: s * 100 + ' + ' + d * 10 + ' + ' + u + ' = ' + (s * 100 + d * 10 + u) };
  }, 'разряд десятки сотни');

  D(1, 'numbers', 'd-compare', '⚖️', 'Сравнение чисел', 'Поставьте знак <, > или =.', ['До 20', 'До 1000', 'Выражения'], (lv, R) => {
    let a, b, qa, qb;
    if (lv === 1) { a = R.int(0, 20); b = R.int(0, 20); qa = a; qb = b; }
    else if (lv === 2) { a = R.int(100, 999); b = R.pick([a, a + R.nz(-30, 30), R.int(100, 999), Number(String(a).split('').reverse().join('')) || a + 1]); qa = a; qb = b; }
    else { const x = R.int(12, 60), y = R.int(5, 40); a = x + y; b = R.pick([a, a + R.nz(-3, 3), R.int(20, 99)]); qa = x + ' + ' + y; qb = b; }
    const sign = a > b ? '>' : a < b ? '<' : '=';
    return { q: 'Сравните: $' + qa + ' \\;\\square\\; ' + qb + '$', opts: ['$' + sign + '$', ...['>', '<', '='].filter(s => s !== sign).map(s => '$' + s + '$')], sol: lv === 3 ? '$' + qa + ' = ' + a + '$' : '' };
  }, 'больше меньше');

  D(1, 'addsub', 'd-add', '➕', 'Сложение', 'От счёта до 10 до сложения в столбик.', ['До 10', 'До 20 с переходом', 'Трёхзначные'], (lv, R) => {
    let a, b;
    if (lv === 1) { a = R.int(0, 9); b = R.int(0, 10 - a); }
    else if (lv === 2) { a = R.int(3, 9); b = R.int(11 - a, 9); }
    else { a = R.int(100, 899); b = R.int(20, 999 - a); }
    return { q: '$' + a + ' + ' + b + ' = \\;?$', a: a + b, kb: 'numeric', sol: lv === 2 ? '$' + a + ' + ' + (10 - a) + ' = 10$, ещё $' + (b - 10 + a) + '$ — получаем $' + (a + b) + '$.' : '' };
  }, 'сумма плюс');

  D(1, 'addsub', 'd-sub', '➖', 'Вычитание', 'Разность чисел — с заниманием и без.', ['До 10', 'До 20 с переходом', 'Трёхзначные'], (lv, R) => {
    let a, b;
    if (lv === 1) { a = R.int(1, 10); b = R.int(0, a); }
    else if (lv === 2) { a = R.int(11, 18); b = R.int(a - 9, 9); }
    else { a = R.int(200, 999); b = R.int(100, a - 1); }
    return { q: '$' + a + ' - ' + b + ' = \\;?$', a: a - b, kb: 'numeric', sol: 'Проверка: $' + (a - b) + ' + ' + b + ' = ' + a + '$.' };
  }, 'разность минус');

  D(1, 'addsub', 'd-missing', '❓', 'Найди неизвестное', 'Окошко вместо числа: слагаемое, уменьшаемое, вычитаемое.', ['До 20', 'До 100', 'До 1000'], (lv, R) => {
    const M = [20, 100, 1000][lv - 1]; const a = R.int(1, M / 2), b = R.int(1, M / 2); const k = R.int(0, 2);
    if (k === 0) return { q: '$\\square + ' + b + ' = ' + (a + b) + '$', a, kb: 'numeric', sol: 'Неизвестное слагаемое: $' + (a + b) + ' - ' + b + ' = ' + a + '$.' };
    if (k === 1) return { q: '$\\square - ' + b + ' = ' + a + '$', a: a + b, kb: 'numeric', sol: 'Неизвестное уменьшаемое: $' + a + ' + ' + b + ' = ' + (a + b) + '$.' };
    return { q: '$' + (a + b) + ' - \\square = ' + a + '$', a: b, kb: 'numeric', sol: 'Неизвестное вычитаемое: $' + (a + b) + ' - ' + a + ' = ' + b + '$.' };
  }, 'окошко уравнение');

  D(1, 'mult', 'd-mult', '✖️', 'Таблица умножения', 'Тренировка таблицы до автоматизма.', ['На 2, 3, 4, 5, 10', 'Вся таблица', 'Двузначное на однозначное'], (lv, R) => {
    let a, b;
    if (lv === 1) { a = R.pick([2, 3, 4, 5, 10]); b = R.int(1, 10); }
    else if (lv === 2) { a = R.int(2, 9); b = R.int(2, 9); }
    else { a = R.int(11, 49); b = R.int(3, 9); }
    if (R.int(0, 1)) [a, b] = [b, a];
    return { q: '$' + a + ' \\cdot ' + b + ' = \\;?$', a: a * b, kb: 'numeric', sol: lv === 3 ? 'Распределительный закон: $' + Math.max(a, b) + ' \\cdot ' + Math.min(a, b) + ' = ' + Math.floor(Math.max(a, b) / 10) * 10 + ' \\cdot ' + Math.min(a, b) + ' + ' + Math.max(a, b) % 10 + ' \\cdot ' + Math.min(a, b) + '$.' : '' };
  }, 'умножение таблица');

  D(1, 'div', 'd-div', '➗', 'Деление', 'Деление как обратное умножению.', ['На 2, 3, 4, 5, 10', 'Вся таблица', 'Двузначное на однозначное'], (lv, R) => {
    let a, b;
    if (lv === 1) { b = R.pick([2, 3, 4, 5, 10]); a = R.int(1, 10); }
    else if (lv === 2) { b = R.int(2, 9); a = R.int(2, 9); }
    else { b = R.int(3, 9); a = R.int(11, Math.floor(99 / b)); }
    return { q: '$' + a * b + ' : ' + b + ' = \\;?$', a, kb: 'numeric', sol: 'Потому что $' + a + ' \\cdot ' + b + ' = ' + a * b + '$.' };
  }, 'деление частное');

  D(1, 'div', 'd-divrem', '🧺', 'Деление с остатком', 'Найдите частное и остаток.', ['До 50', 'До 100', 'Трёхзначное делимое'], (lv, R) => {
    const b = R.int(2, 9), qn = lv === 3 ? R.int(12, 99) : R.int(2, lv === 1 ? 5 : 11), r = R.int(1, b - 1), a = b * qn + r;
    return { q: '$' + a + ' : ' + b + '$. Введите частное и остаток через «;».', a: [qn, r], ordered: true, ph: 'частное; остаток', show: qn + ' (ост. ' + r + ')', sol: '$' + b + ' \\cdot ' + qn + ' + ' + r + ' = ' + a + '$, остаток $' + r + ' < ' + b + '$.' };
  }, 'остаток');

  D(1, 'measures', 'd-units', '📏', 'Перевод единиц', 'Метры, граммы, минуты: крупные в мелкие и обратно.', ['Простые', 'Составные', 'Обратные'], (lv, R) => {
    const U = [['м', 'см', 100], ['кг', 'г', 1000], ['км', 'м', 1000], ['ч', 'мин', 60], ['мин', 'с', 60], ['дм', 'см', 10], ['см', 'мм', 10], ['л', 'мл', 1000], ['€', 'центов', 100]];
    const [big, sm, k] = R.pick(U);
    if (lv === 1) { const n = R.int(2, 9); return { q: n + ' ' + big + ' = ? ' + sm, a: n * k, unit: sm, kb: 'numeric', sol: '1 ' + big + ' = ' + k + ' ' + sm + ', поэтому $' + n + ' \\cdot ' + k + ' = ' + n * k + '$.' }; }
    if (lv === 2) { const n = R.int(1, 9), m = R.int(1, k - 1); return { q: n + ' ' + big + ' ' + m + ' ' + sm + ' = ? ' + sm, a: n * k + m, unit: sm, kb: 'numeric', sol: '$' + n + ' \\cdot ' + k + ' + ' + m + ' = ' + (n * k + m) + '$.' }; }
    const n = R.int(2, 9); return { q: n * k + ' ' + sm + ' = ? ' + big, a: n, unit: big, kb: 'numeric', sol: 'Из мелких в крупные — делим: $' + n * k + ' : ' + k + ' = ' + n + '$.' };
  }, 'метр грамм минута');

  D(1, 'measures', 'd-clock', '🕒', 'Который час?', 'Определите время по циферблату (ответ вида 4:30).', ['Ровно и половина', 'Каждые 5 минут', 'Сколько прошло'], (lv, R) => {
    if (lv < 3) { const h = R.int(1, 12), m = lv === 1 ? R.pick([0, 30]) : R.int(0, 11) * 5; const s = h + ':' + pad(m); return { q: 'Который час показывают часы?', svg: clock(h, m), a: s, alt: [pad(h) + ':' + pad(m), (h + 12) + ':' + pad(m), h + '.' + pad(m), (h % 12 === 0 ? 0 : h) + ':' + pad(m)], ph: 'например 4:30', show: s, sol: 'Короткая стрелка — часы, длинная — минуты (одно большое деление = 5 мин).' }; }
    const h = R.int(7, 18), m = R.int(0, 11) * 5, d = R.int(2, 15) * 5; const e = h * 60 + m + d;
    return { q: 'Фильм начался в ' + h + ':' + pad(m) + ' и закончился в ' + Math.floor(e / 60) + ':' + pad(e % 60) + '. Сколько минут он шёл?', a: d, unit: 'мин', kb: 'numeric', sol: 'Посчитайте до ближайшего целого часа и прибавьте остаток.' };
  }, 'часы время циферблат');

  D(1, 'shapes', 'd-perim1', '▭', 'Периметр', 'Периметр прямоугольника и квадрата, сторона по периметру.', ['Прямоугольник', 'Квадрат и треугольник', 'Обратная задача'], (lv, R) => {
    if (lv === 1) { const a = R.int(2, 20), b = R.int(2, 20); return { q: 'Найдите периметр прямоугольника со сторонами ' + a + ' см и ' + b + ' см.', a: 2 * (a + b), unit: 'см', kb: 'numeric', sol: '$P = 2(' + a + ' + ' + b + ') = ' + 2 * (a + b) + '$ см.' }; }
    if (lv === 2) { if (R.int(0, 1)) { const a = R.int(2, 25); return { q: 'Найдите периметр квадрата со стороной ' + a + ' м.', a: 4 * a, unit: 'м', kb: 'numeric', sol: '$P = 4 \\cdot ' + a + '$.' }; } const a = R.int(3, 15), b = R.int(3, 15), c = R.int(Math.abs(a - b) + 1, a + b - 1); return { q: 'Стороны треугольника ' + a + ', ' + b + ' и ' + c + ' см. Найдите периметр.', a: a + b + c, unit: 'см', kb: 'numeric' }; }
    const a = R.int(3, 20), b = R.int(2, a); const k = R.int(0, 1);
    if (k) return { q: 'Периметр квадрата ' + 4 * a + ' см. Найдите его сторону.', a, unit: 'см', kb: 'numeric', sol: '$' + 4 * a + ' : 4 = ' + a + '$.' };
    return { q: 'Периметр прямоугольника ' + 2 * (a + b) + ' см, одна сторона ' + a + ' см. Найдите другую.', a: b, unit: 'см', kb: 'numeric', sol: 'Полупериметр $' + (a + b) + '$, вычитаем $' + a + '$.' };
  }, 'периметр');

  const pl = (n, f) => n + ' ' + f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];
  PLATFORM.drawKit.pl = pl;
  D(1, 'word1', 'd-word1', '📖', 'Текстовые задачи', 'Короткие истории в одно-два действия.', ['Одно действие', 'Два действия', 'Покупки и путь'], (lv, R) => {
    const names = [['Аня', 'Ани'], ['Марк', 'Марка'], ['Лиза', 'Лизы'], ['Тимо', 'Тимо'], ['Кертту', 'Кертту'], ['Саша', 'Саши'], ['Эмма', 'Эммы'], ['Ян', 'Яна']];
    const items = [['яблоко', 'яблока', 'яблок'], ['марка', 'марки', 'марок'], ['наклейка', 'наклейки', 'наклеек'], ['шишка', 'шишки', 'шишек'], ['карандаш', 'карандаша', 'карандашей']];
    const n1 = R.pick(names), n2 = R.pick(names.filter(x => x !== n1)), it = R.pick(items);
    if (lv === 1) {
      const a = R.int(6, 40), b = R.int(2, 9), k = R.int(0, 3);
      if (k === 0) return { q: 'У ' + n1[1] + ' ' + pl(a, it) + ', у ' + n2[1] + ' на ' + b + ' больше. Сколько ' + it[2] + ' у ' + n2[1] + '?', a: a + b, kb: 'numeric', sol: '«На ' + b + ' больше» — прибавляем: $' + a + ' + ' + b + '$.' };
      if (k === 1) return { q: 'У ' + n1[1] + ' ' + pl(a * b, it) + ', у ' + n2[1] + ' в ' + b + ' раза меньше. Сколько ' + it[2] + ' у ' + n2[1] + '?', a, kb: 'numeric', sol: '«В ' + b + ' раза меньше» — делим: $' + a * b + ' : ' + b + '$.' };
      if (k === 2) return { q: n1[0] + ' раскладывает ' + pl(a * b, it) + ' поровну в ' + pl(b, ['коробку', 'коробки', 'коробок']) + '. Сколько ' + it[2] + ' окажется в каждой коробке?', a, kb: 'numeric', sol: '$' + a * b + ' : ' + b + ' = ' + a + '$.' };
      return { q: 'Было ' + pl(a + b * 3, it) + ', ' + b * 3 + ' отдали. Сколько ' + it[2] + ' осталось?', a, kb: 'numeric' };
    }
    if (lv === 2) {
      const a = R.int(10, 40), b = R.int(3, 9);
      if (R.int(0, 1)) return { q: 'В первом классе ' + pl(a, ['ученик', 'ученика', 'учеников']) + ', во втором на ' + b + ' меньше. Сколько учеников в двух классах?', a: 2 * a - b, kb: 'numeric', sol: '$' + a + ' - ' + b + ' = ' + (a - b) + '$; $' + a + ' + ' + (a - b) + ' = ' + (2 * a - b) + '$.' };
      const c = R.int(2, 4); return { q: 'В саду ' + pl(a, ['яблоня', 'яблони', 'яблонь']) + ', а груш в ' + c + ' раза больше. Сколько всего деревьев?', a: a + a * c, kb: 'numeric', sol: 'Груш $' + a + ' \\cdot ' + c + ' = ' + a * c + '$; всего $' + (a + a * c) + '$.' };
    }
    if (R.int(0, 1)) { const p = R.int(2, 9) * 10, n = R.int(2, 9), pay = Math.ceil(p * n / 100) * 100 + 100; return { q: 'Булочка стоит ' + p + ' центов. Купили ' + pl(n, ['булочку', 'булочки', 'булочек']) + ' и заплатили ' + pay / 100 + ' €. Сколько центов сдачи получили?', a: pay - p * n, unit: 'центов', kb: 'numeric', sol: 'Стоимость $' + p + ' \\cdot ' + n + ' = ' + p * n + '$ центов; сдача $' + pay + ' - ' + p * n + '$.' }; }
    const v = R.int(3, 18), t = R.int(2, 6); return { q: 'Велосипедист едет со скоростью ' + v + ' км/ч. Какое расстояние он проедет за ' + t + ' ч?', a: v * t, unit: 'км', kb: 'numeric', sol: '$s = v \\cdot t = ' + v + ' \\cdot ' + t + '$.' };
  }, 'задача');
  /* ——— Курс II ——— */
  const fr = (n, d) => { const g = PLATFORM.R.gcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return [n, d]; };
  const ftex = (n, d) => PLATFORM.R.frac(n, d);
  D(2, 'order', 'd-order', '🧮', 'Порядок действий', 'Скобки, степени, умножение и деление слева направо.', ['Два действия', 'Скобки', 'Степени'], (lv, R) => {
    const a = R.int(2, 12), b = R.int(2, 9), c = R.int(2, 9);
    if (lv === 1) { const k = R.int(0, 2); if (k === 0) return { q: '$' + a + ' + ' + b + ' \\cdot ' + c + '$', a: a + b * c, kb: 'numeric', sol: 'Сначала умножение: $' + b + ' \\cdot ' + c + ' = ' + b * c + '$.' }; if (k === 1) return { q: '$' + (b * c + a) + ' - ' + b * c + ' : ' + c + '$', a: b * c + a - b, kb: 'numeric', sol: 'Сначала деление: $' + b * c + ' : ' + c + ' = ' + b + '$.' }; return { q: '$' + b * c + ' : ' + c + ' \\cdot ' + a + '$', a: b * a, kb: 'numeric', sol: 'Слева направо: $' + b * c + ' : ' + c + ' = ' + b + '$, затем $\\cdot ' + a + '$.' }; }
    if (lv === 2) { const d = R.int(2, 6); return { q: '$' + d + ' \\cdot (' + a + ' + ' + b + ') - ' + c + '$', a: d * (a + b) - c, kb: 'numeric', sol: 'Скобки: $' + (a + b) + '$; умножение: $' + d * (a + b) + '$; вычитание.' }; }
    const e = R.int(2, 5), m = R.int(2, 4); return { q: '$' + (m * e * e + a) + ' - ' + m + ' \\cdot ' + e + '^2 + (' + b + ' - ' + (b - 1) + ')^3$', a: a + 1, kb: 'numeric', sol: 'Степени: $' + e + '^2 = ' + e * e + '$, $1^3 = 1$; умножение: $' + m * e * e + '$; затем слева направо.' };
  }, 'скобки порядок');

  D(2, 'order', 'd-round', '≈', 'Округление', 'Округлите до указанного разряда.', ['Целые', 'Десятичные', 'Большие числа'], (lv, R) => {
    if (lv === 1) { const n = R.int(101, 9999); const [nm, k] = R.pick([['десятков', 10], ['сотен', 100]]); return { q: 'Округлите ' + n + ' до ' + nm + '.', a: Math.round(n / k) * k, kb: 'numeric', sol: 'Смотрим на цифру справа от разряда ' + nm + '.' }; }
    if (lv === 2) { const x = R.int(1000, 99999) / 1000; const [nm, k] = R.pick([['десятых', 1], ['сотых', 2], ['целых', 0]]); const v = Math.round(x * 10 ** k) / 10 ** k; return { q: 'Округлите ' + R.num(x) + ' до ' + nm + '.', a: v, kb: 'decimal', sol: 'Ответ: ' + R.num(v) + '.' }; }
    const n = R.int(1000000, 99999999); const [nm, k] = R.pick([['тысяч', 1e3], ['миллионов', 1e6], ['сотен тысяч', 1e5]]); return { q: 'Округлите ' + n.toLocaleString('ru-RU') + ' до ' + nm + '.', a: Math.round(n / k) * k, kb: 'numeric', show: (Math.round(n / k) * k).toLocaleString('ru-RU') };
  }, 'округление');

  D(2, 'divisibility', 'd-divis', '🔍', 'Признаки делимости', 'Делится ли число? Простое или составное?', ['На 2, 5, 10', 'На 3, 9, 4', 'Простое или нет'], (lv, R) => {
    if (lv === 3) { const pr = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]; const comp = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 99, 119, 133]; const isP = R.int(0, 1); const n = isP ? R.pick(pr) : R.pick(comp); let f = 0; for (let k = 2; k < n; k++) if (n % k === 0) { f = k; break; } return { q: 'Число ' + n + ' — простое или составное?', opts: isP ? ['простое', 'составное'] : ['составное', 'простое'], sol: isP ? n + ' делится только на 1 и на себя.' : n + ' = ' + f + ' · ' + n / f + '.' }; }
    const d = lv === 1 ? R.pick([2, 5, 10]) : R.pick([3, 9, 4]); const yes = R.int(0, 1); let n; do { n = R.int(100, 9999); } while ((n % d === 0) !== !!yes);
    const ds = String(n).split('').reduce((s, c) => s + +c, 0);
    return { q: 'Делится ли ' + n + ' на ' + d + '?', opts: yes ? ['да', 'нет'] : ['нет', 'да'], sol: d === 3 || d === 9 ? 'Сумма цифр ' + ds + (ds % d ? ' не делится' : ' делится') + ' на ' + d + '.' : d === 4 ? 'Число из двух последних цифр: ' + n % 100 + '.' : 'Смотрим на последнюю цифру: ' + n % 10 + '.' };
  }, 'делимость простое число');

  D(2, 'divisibility', 'd-gcd', '🤝', 'НОД и НОК', 'Наибольший общий делитель и наименьшее общее кратное.', ['Небольшие числа', 'Двузначные', 'Задачи'], (lv, R) => {
    const g = R.int(2, lv === 1 ? 6 : 12); let x, y; do { x = R.int(1, lv === 1 ? 6 : 9); y = R.int(1, lv === 1 ? 6 : 9); } while (x === y || R.gcd(x, y) !== 1);
    const a = g * x, b = g * y, l = g * x * y;
    if (lv === 3) { if (R.int(0, 1)) return { q: 'Из ' + a + ' красных и ' + b + ' белых роз составили одинаковые букеты, использовав все розы. Какое наибольшее число букетов?', a: g, kb: 'numeric', sol: 'НОД(' + a + ', ' + b + ') = ' + g + '.' }; return { q: 'Автобусы отходят от вокзала каждые ' + a + ' и ' + b + ' минут. Сейчас ушли оба. Через сколько минут они снова уйдут одновременно?', a: l, unit: 'мин', kb: 'numeric', sol: 'НОК(' + a + ', ' + b + ') = ' + l + '.' }; }
    return R.int(0, 1) ? { q: 'Найдите НОД(' + a + ', ' + b + ').', a: g, kb: 'numeric', sol: a + ' = ' + g + ' · ' + x + ', ' + b + ' = ' + g + ' · ' + y + '.' } : { q: 'Найдите НОК(' + a + ', ' + b + ').', a: l, kb: 'numeric', sol: 'НОК = ' + a + ' · ' + b + ' : НОД = ' + a * b + ' : ' + g + ' = ' + l + '.' };
  }, 'НОД НОК');

  D(2, 'fractions', 'd-simplify', '✂️', 'Сокращение дробей', 'Сократите дробь до несократимой (ответ вида 3/4).', ['Простые', 'Двузначные', 'В смешанное число'], (lv, R) => {
    if (lv === 3) { const d = R.int(2, 9), w = R.int(1, 5), n = w * d + R.int(1, d - 1); const [nn, dd] = fr(n % d, d); return { q: 'Запишите $\\frac{' + n + '}{' + d + '}$ смешанным числом. Введите целую часть и дробь через пробел, например: 2 1/3', a: w + ' ' + nn + '/' + dd, alt: [w + nn + '/' + dd], show: '$' + w + '\\frac{' + nn + '}{' + dd + '}$', sol: '$' + n + ' : ' + d + ' = ' + w + '$ (ост. ' + n % d + ').' }; }
    let n0, d0; do { d0 = R.int(2, lv === 1 ? 9 : 15); n0 = R.int(1, d0 - 1); } while (R.gcd(n0, d0) !== 1);
    const k = R.int(2, lv === 1 ? 6 : 9);
    return { q: 'Сократите $\\frac{' + n0 * k + '}{' + d0 * k + '}$', a: n0 + '/' + d0, ph: 'например 3/4', show: '$\\frac{' + n0 + '}{' + d0 + '}$', sol: 'Делим числитель и знаменатель на НОД = ' + k + '.' };
  }, 'сократить дробь');

  D(2, 'fractions', 'd-fraccmp', '⚖️', 'Сравнение дробей', 'Какая дробь больше?', ['Общий знаменатель', 'Общий числитель', 'Разные'], (lv, R) => {
    let a, b, c, d;
    if (lv === 1) { b = d = R.int(3, 12); a = R.int(1, b - 1); c = R.int(1, b - 1); }
    else if (lv === 2) { a = c = R.int(1, 5); b = R.int(a + 1, 12); d = R.int(a + 1, 12); }
    else { b = R.int(2, 9); d = R.int(2, 9); a = R.int(1, b); c = R.int(1, d); }
    const s = a * d > b * c ? '>' : a * d < b * c ? '<' : '=';
    return { q: 'Сравните: $\\frac{' + a + '}{' + b + '} \;\\square\; \\frac{' + c + '}{' + d + '}$', opts: ['$' + s + '$', ...['>', '<', '='].filter(x => x !== s).map(x => '$' + x + '$')], sol: 'Общий знаменатель ' + b * d + ': $\\frac{' + a * d + '}{' + b * d + '}$ и $\\frac{' + c * b + '}{' + b * d + '}$.' };
  }, 'сравнение дробей');

  D(2, 'fracops', 'd-fracadd', '➕', 'Сложение и вычитание дробей', 'Приведите к общему знаменателю. Ответ — дробью (5/6) или смешанным.', ['Одинаковые знаменатели', 'Разные знаменатели', 'Смешанные числа'], (lv, R) => {
    let a, b, c, d, w1 = 0, w2 = 0;
    if (lv === 1) { b = d = R.int(3, 15); a = R.int(1, b - 1); c = R.int(1, b - 1); }
    else { b = R.int(2, 10); d = R.int(2, 10); a = R.int(1, b - 1); c = R.int(1, d - 1); if (lv === 3) { w1 = R.int(1, 5); w2 = R.int(1, w1); } }
    const plus = lv === 1 ? R.int(0, 1) : R.int(0, 1);
    let x1 = w1 * b + a, x2 = w2 * d + c; if (!plus && x1 * d < x2 * b) { [x1, x2] = [x2, x1]; [b, d] = [d, b]; [w1, w2] = [w2, w1]; [a, c] = [c, a]; }
    const num = plus ? x1 * d + x2 * b : x1 * d - x2 * b, den = b * d; const L = R.lcm(b, d);
    const t = (w, n, dd) => (w ? w : '') + '\\frac{' + n + '}{' + dd + '}';
    return { q: '$' + t(w1, a, b) + (plus ? ' + ' : ' - ') + t(w2, c, d) + ' = \;?$', a: num / den, show: '$' + R.frac(num, den) + '$', sol: 'Общий знаменатель ' + L + (lv === 3 ? '; смешанные числа удобно перевести в неправильные дроби' : '') + '. Ответ: $' + R.frac(num, den) + '$.' };
  }, 'сложение дробей');

  D(2, 'fracops', 'd-fracmul', '✖️', 'Умножение и деление дробей', 'Умножение и деление дробей, часть от числа.', ['Умножение', 'Деление', 'Часть и целое'], (lv, R) => {
    const a = R.int(1, 9), b = R.int(2, 10), c = R.int(1, 9), d = R.int(2, 10);
    if (lv === 1) return { q: '$\\frac{' + a + '}{' + b + '} \\cdot \\frac{' + c + '}{' + d + '}$', a: a * c / (b * d), show: '$' + R.frac(a * c, b * d) + '$', sol: '$\\frac{' + a + ' \\cdot ' + c + '}{' + b + ' \\cdot ' + d + '} = ' + R.frac(a * c, b * d) + '$' };
    if (lv === 2) return { q: '$\\frac{' + a + '}{' + b + '} : \\frac{' + c + '}{' + d + '}$', a: a * d / (b * c), show: '$' + R.frac(a * d, b * c) + '$', sol: 'Умножаем на обратную: $\\frac{' + a + '}{' + b + '} \\cdot \\frac{' + d + '}{' + c + '} = ' + R.frac(a * d, b * c) + '$' };
    const [n, m] = fr(R.int(1, 7), R.int(2, 8)); if (n >= m) return null; const k = R.int(2, 12) * m;
    if (R.int(0, 1)) return { q: 'Найдите $\\frac{' + n + '}{' + m + '}$ от ' + k + '.', a: k * n / m, kb: 'decimal', sol: '$' + k + ' \\cdot \\frac{' + n + '}{' + m + '} = ' + k * n / m + '$' };
    return { q: '$\\frac{' + n + '}{' + m + '}$ числа равны ' + k * n / m + '. Найдите число.', a: k, kb: 'decimal', sol: '$' + k * n / m + ' : \\frac{' + n + '}{' + m + '} = ' + k + '$' };
  }, 'умножение деление дробей');

  D(2, 'decimals', 'd-dec', '🔟', 'Десятичные дроби', 'Четыре действия с десятичными дробями.', ['Сложение и вычитание', 'Умножение', 'Деление'], (lv, R) => {
    const x = R.int(1, 999) / R.pick([10, 100]), y = R.int(1, 999) / R.pick([10, 100]);
    if (lv === 1) { const plus = R.int(0, 1); const [p, q] = plus || x >= y ? [x, y] : [y, x]; return { q: '$' + R.tn(p) + (plus ? ' + ' : ' - ') + R.tn(q) + '$', a: R.round(plus ? p + q : p - q), kb: 'decimal', sol: 'Запятая под запятой.' }; }
    if (lv === 2) { const p = R.int(1, 99) / R.pick([10, 100]), q = R.pick([R.int(2, 9), R.int(1, 99) / 10, 10, 100]); return { q: '$' + R.tn(p) + ' \\cdot ' + R.tn(q) + '$', a: R.round(p * q), kb: 'decimal', sol: 'Перемножаем как целые и отделяем столько знаков, сколько у множителей вместе.' }; }
    const q = R.pick([R.int(2, 9), R.int(2, 9) / 10, R.int(2, 25) / 100]), r = R.int(2, 60); return { q: '$' + R.tn(R.round(q * r)) + ' : ' + R.tn(q) + '$', a: r, kb: 'decimal', sol: 'Переносим запятую в обоих числах, чтобы делитель стал целым.' };
  }, 'десятичные дроби');

  D(2, 'percent', 'd-percent', '％', 'Проценты', 'Процент от числа, число по проценту, доля в процентах, скидки.', ['Процент от числа', 'Три типа задач', 'Скидки и рост'], (lv, R) => {
    const p = R.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 12, 8]), base = R.int(2, 40) * 20;
    if (lv === 1) return { q: 'Найдите ' + p + '% от ' + base + '.', a: base * p / 100, kb: 'decimal', sol: '$' + base + ' \\cdot ' + R.tn(p / 100) + ' = ' + R.tn(base * p / 100) + '$' };
    if (lv === 2) { const k = R.int(0, 1); const part = base * p / 100; if (k) return { q: p + '% числа равны ' + R.num(part) + '. Найдите число.', a: base, kb: 'decimal', sol: '$' + R.tn(part) + ' : ' + R.tn(p / 100) + ' = ' + base + '$' }; return { q: 'Сколько процентов составляет ' + R.num(part) + ' от ' + base + '?', a: p, unit: '%', kb: 'decimal', sol: '$\\frac{' + R.tn(part) + '}{' + base + '} \\cdot 100\\% = ' + p + '\\%$' }; }
    const price = R.int(4, 40) * 5, up = R.int(0, 1);
    return { q: 'Товар стоил ' + price + ' €. Цену ' + (up ? 'повысили' : 'снизили') + ' на ' + p + '%. Новая цена?', a: R.round(price * (1 + (up ? 1 : -1) * p / 100)), unit: '€', kb: 'decimal', sol: '$' + price + ' \\cdot ' + R.tn(1 + (up ? 1 : -1) * p / 100) + '$' };
  }, 'проценты скидка');

  D(2, 'negative', 'd-neg', '±', 'Отрицательные числа', 'Сложение, вычитание, умножение чисел с разными знаками.', ['Сложение и вычитание', 'Умножение и деление', 'Смешанные'], (lv, R) => {
    const a = R.nz(-20, 20), b = R.nz(-20, 20);
    if (lv === 1) { const plus = R.int(0, 1); return { q: '$' + R.tn(a) + (plus ? ' + ' : ' - ') + R.signed(b) + '$', a: plus ? a + b : a - b, sol: plus ? '' : 'Вычесть — прибавить противоположное: $' + R.tn(a) + ' + ' + R.signed(-b) + '$' }; }
    const x = R.nz(-12, 12), y = R.nz(-9, 9);
    if (lv === 2) return R.int(0, 1) ? { q: '$' + R.signed(x) + ' \\cdot ' + R.signed(y) + '$', a: x * y, sol: 'Знаки ' + (x * y > 0 ? 'одинаковые — плюс.' : 'разные — минус.') } : { q: '$' + R.signed(x * y) + ' : ' + R.signed(y) + '$', a: x, sol: 'Знаки ' + (x > 0 ? 'одинаковые — плюс.' : 'разные — минус.') };
    const c = R.nz(-6, 6); return { q: '$' + R.tn(a) + ' - ' + R.signed(x) + ' \\cdot ' + R.signed(c) + '$', a: a - x * c, sol: 'Сначала умножение: $' + R.signed(x) + ' \\cdot ' + R.signed(c) + ' = ' + x * c + '$.' };
  }, 'отрицательные числа');

  D(2, 'ratio', 'd-proportion', '⚗️', 'Пропорции', 'Неизвестный член пропорции, прямая и обратная пропорциональность.', ['Член пропорции', 'Прямая', 'Обратная'], (lv, R) => {
    if (lv === 1) { const x = R.int(2, 20), b = R.int(2, 12), k = R.int(2, 6); return { q: 'Найдите $x$: $\\frac{x}{' + b + '} = \\frac{' + x * k + '}{' + b * k + '}$', a: x, kb: 'decimal', sol: '$x = \\frac{' + b + ' \\cdot ' + x * k + '}{' + b * k + '} = ' + x + '$' }; }
    if (lv === 2) { const n1 = R.int(2, 6), price = R.int(2, 15) * 10, n2 = R.int(2, 12); if (n1 === n2) return null; return { q: n1 + ' кг товара стоят ' + R.num(n1 * price / 100) + ' €. Сколько стоят ' + n2 + ' кг?', a: R.round(n2 * price / 100), unit: '€', kb: 'decimal', sol: '1 кг стоит ' + R.num(price / 100) + ' €.' }; }
    const w1 = R.int(2, 8), t = R.int(2, 6) * R.pick([2, 3, 4, 6]), w2 = R.pick([2, 3, 4, 6, 8, 12].filter(x => x !== w1 && (w1 * t) % x === 0)); if (!w2) return null;
    return { q: w1 + ' рабочих выполняют работу за ' + t + ' дней. За сколько дней выполнят её ' + w2 + ' рабочих?', a: w1 * t / w2, unit: 'дн.', kb: 'decimal', sol: 'Обратная пропорциональность: $' + w1 + ' \\cdot ' + t + ' = ' + w2 + ' \\cdot x$.' };
  }, 'пропорция');

  D(2, 'area', 'd-area', '⬛', 'Площадь и объём', 'Прямоугольник, треугольник, трапеция, параллелепипед.', ['Прямоугольник и треугольник', 'Параллелограмм и трапеция', 'Объём'], (lv, R) => {
    const a = R.int(2, 20), b = R.int(2, 20), h = R.int(2, 15);
    const { svgOpen, txt } = PLATFORM.drawKit;
    if (lv === 1) { if (R.int(0, 1)) return { q: 'Площадь прямоугольника ' + a + ' см × ' + b + ' см?', a: a * b, unit: 'см²', kb: 'numeric' }; return { q: 'Основание треугольника ' + a + ' см, высота к нему ' + h + ' см. Площадь?', a: a * h / 2, unit: 'см²', kb: 'decimal', svg: svgOpen(200, 120) + '<polygon points="20,100 180,100 70,20"/><line x1="70" y1="20" x2="70" y2="100" stroke-dasharray="4 3"/>' + txt(100, 116, a) + txt(80, 66, h, 'start') + '</svg>', sol: '$S = \\frac{' + a + ' \\cdot ' + h + '}{2}$' }; }
    if (lv === 2) { if (R.int(0, 1)) return { q: 'Сторона параллелограмма ' + a + ' м, высота к ней ' + h + ' м. Площадь?', a: a * h, unit: 'м²', kb: 'numeric' }; const c = R.int(2, 20); return { q: 'Основания трапеции ' + a + ' и ' + c + ' см, высота ' + h + ' см. Площадь?', a: (a + c) * h / 2, unit: 'см²', kb: 'decimal', sol: '$S = \\frac{' + a + ' + ' + c + '}{2} \\cdot ' + h + '$' }; }
    const c = R.int(2, 12); if (R.int(0, 2) === 0) return { q: 'Объём куба с ребром ' + c + ' дм? Сколько это литров?', a: c ** 3, unit: 'л', kb: 'numeric', sol: '$V = ' + c + '^3$ дм³, 1 дм³ = 1 л.' };
    return { q: 'Коробка ' + a + ' см × ' + b + ' см × ' + c + ' см. Объём?', a: a * b * c, unit: 'см³', kb: 'numeric' };
  }, 'площадь объём');

  D(2, 'circle', 'd-circle', '◯', 'Окружность и круг', 'Длина окружности и площадь круга. Можно отвечать с π: 10π.', ['Длина окружности', 'Площадь круга', 'Обратные задачи'], (lv, R) => {
    const r = R.int(1, 15);
    if (lv === 1) { const byD = R.int(0, 1); return { q: (byD ? 'Диаметр ' + 2 * r : 'Радиус ' + r) + ' см. Найдите длину окружности.', a: 2 * Math.PI * r, tol: 0.006 * 2 * Math.PI * r, unit: 'см', show: '$' + 2 * r + '\\pi \\approx ' + R.tn(R.round(2 * Math.PI * r, 2)) + '$', sol: '$C = 2\\pi r = ' + 2 * r + '\\pi$' }; }
    if (lv === 2) return { q: 'Радиус круга ' + r + ' м. Найдите площадь.', a: Math.PI * r * r, tol: 0.006 * Math.PI * r * r, unit: 'м²', show: '$' + r * r + '\\pi \\approx ' + R.tn(R.round(Math.PI * r * r, 2)) + '$', sol: '$S = \\pi r^2 = ' + r * r + '\\pi$' };
    return R.int(0, 1) ? { q: 'Длина окружности $' + 2 * r + '\\pi$ см. Найдите радиус.', a: r, unit: 'см', kb: 'decimal', sol: '$r = \\frac{C}{2\\pi}$' } : { q: 'Площадь круга $' + r * r + '\\pi$ см². Найдите радиус.', a: r, unit: 'см', kb: 'decimal', sol: '$r^2 = ' + r * r + '$' };
  }, 'окружность круг пи');

  D(2, 'circle', 'd-angles1', '∠', 'Углы', 'Смежные, вертикальные углы, сумма углов треугольника.', ['Смежные и вертикальные', 'Треугольник', 'Четырёхугольник и сектор'], (lv, R) => {
    if (lv === 1) { const a = R.int(15, 165); return R.int(0, 1) ? { q: 'Один из смежных углов ' + a + '°. Найдите другой.', a: 180 - a, unit: '°', kb: 'numeric', sol: '$180° - ' + a + '°$' } : { q: 'Один из вертикальных углов ' + a + '°. Найдите другой.', a, unit: '°', kb: 'numeric', sol: 'Вертикальные углы равны.' }; }
    if (lv === 2) { const a = R.int(20, 100), b = R.int(10, 160 - a); return { q: 'Два угла треугольника ' + a + '° и ' + b + '°. Найдите третий.', a: 180 - a - b, unit: '°', kb: 'numeric', sol: '$180° - ' + a + '° - ' + b + '°$' }; }
    if (R.int(0, 1)) { const a = R.int(50, 120), b = R.int(50, 120), c = R.int(40, Math.min(150, 340 - a - b)); return { q: 'Три угла четырёхугольника ' + a + '°, ' + b + '°, ' + c + '°. Найдите четвёртый.', a: 360 - a - b - c, unit: '°', kb: 'numeric', sol: 'Сумма углов четырёхугольника 360°.' }; }
    const p = R.pick([5, 10, 15, 20, 25, 30, 40, 45, 60, 75]); return { q: 'Доля на круговой диаграмме — ' + p + '%. Сколько градусов в секторе?', a: 3.6 * p, unit: '°', kb: 'decimal', sol: '1% = 3,6°.' };
  }, 'углы смежные');

  D(2, 'data', 'd-mean', '📊', 'Среднее, медиана, мода', 'Характеристики ряда данных.', ['Среднее', 'Медиана и мода', 'Обратные задачи'], (lv, R) => {
    const n = R.int(4, 7); let xs = Array.from({ length: n }, () => R.int(1, 20));
    const sum = xs.reduce((s, x) => s + x, 0), list = xs.join('; ');
    if (lv === 1) { const k = R.int(0, 1); if (k) return { q: 'Найдите размах ряда: ' + list + '.', a: Math.max(...xs) - Math.min(...xs), kb: 'numeric' }; return { q: 'Найдите среднее арифметическое: ' + list + '.', a: R.round(sum / n, 6), tol: 0.006, kb: 'decimal', show: R.num(R.round(sum / n, 2)), sol: '$\\frac{' + sum + '}{' + n + '}$ (можно округлить до сотых)' }; }
    if (lv === 2) { const s = xs.slice().sort((a, b) => a - b); if (R.int(0, 1)) { const m = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; return { q: 'Найдите медиану ряда: ' + list + '.', a: m, kb: 'decimal', sol: 'Упорядочим: ' + s.join('; ') + '.' }; } const v = R.int(1, 9); xs = [v, v, v, ...Array.from({ length: n - 3 }, () => R.int(10, 20))]; xs = R.shuffle(xs); if (new Set(xs).size < xs.length - 2) return null; return { q: 'Найдите моду ряда: ' + xs.join('; ') + '.', a: v, kb: 'numeric' }; }
    const m = R.int(3, 8), k = R.int(3, 6), cur = Array.from({ length: k }, () => R.int(2, 10)); const need = m * (k + 1) - cur.reduce((s, x) => s + x, 0); if (need < 0 || need > 20) return null;
    return { q: 'Ряд: ' + cur.join('; ') + '. Какое число нужно добавить, чтобы среднее стало равно ' + m + '?', a: need, kb: 'numeric', sol: 'Нужная сумма $' + m + ' \\cdot ' + (k + 1) + ' = ' + m * (k + 1) + '$.' };
  }, 'среднее медиана мода');
  /* ——— Курс III ——— */
  D(3, 'powers', 'd-pow', '⁴', 'Степени', 'Вычисление степеней и свойства: показатели складываются и умножаются.', ['Вычисление', 'Свойства', 'Ноль и минус'], (lv, R) => {
    if (lv === 1) { const a = R.nz(-5, 10), n = R.int(2, a > 5 || a < -3 ? 2 : 4); return { q: '$' + R.signed(a) + '^{' + n + '}$', a: a ** n, sol: a < 0 ? 'Отрицательное основание в ' + (n % 2 ? 'нечётной' : 'чётной') + ' степени: знак ' + (n % 2 ? 'минус' : 'плюс') + '.' : '' }; }
    if (lv === 2) { const m = R.int(2, 9), n = R.int(2, 9), k = R.int(0, 2); if (k === 0) return { q: '$a^{' + m + '} \\cdot a^{' + n + '} = a^{\\square}$', a: m + n, kb: 'numeric', sol: 'Показатели складываются.' }; if (k === 1) return { q: '$(a^{' + m + '})^{' + n + '} = a^{\\square}$', a: m * n, kb: 'numeric', sol: 'Показатели перемножаются.' }; return { q: '$a^{' + (m + n) + '} : a^{' + n + '} = a^{\\square}$', a: m, kb: 'numeric', sol: 'Показатели вычитаются.' }; }
    const a = R.int(2, 5), n = R.int(1, 3); const k = R.int(0, 2);
    if (k === 0) return { q: '$' + a + '^{-' + n + '}$ (ответ дробью)', a: 1 / a ** n, show: '$\\frac{1}{' + a ** n + '}$', sol: '$a^{-n} = \\frac{1}{a^n}$' };
    if (k === 1) return { q: '$' + a + '^{0} + ' + a + '^{-1}$', a: 1 + 1 / a, show: '$' + R.frac(a + 1, a) + '$', sol: '$a^0 = 1$' };
    return { q: '$\\left(\\frac{1}{' + a + '}\\right)^{-' + n + '}$', a: a ** n, sol: 'Отрицательный показатель переворачивает дробь.' };
  }, 'степень показатель');

  D(3, 'powers', 'd-sci', '🔬', 'Стандартный вид числа', 'Найдите показатель n в записи a · 10ⁿ.', ['Большие числа', 'Малые числа', 'Произведение'], (lv, R) => {
    if (lv < 3) { const n = lv === 1 ? R.int(3, 9) : -R.int(2, 8); const m = R.int(11, 99) / 10; const x = m * 10 ** n; const s = lv === 1 ? Math.round(x).toLocaleString('ru-RU') : x.toFixed(-n + 1).replace('.', ','); return { q: 'Запишите ' + s + ' в стандартном виде: $' + R.tn(m) + ' \\cdot 10^{n}$. Найдите $n$.', a: n, sol: 'Запятую перенесли на ' + Math.abs(n) + ' знаков ' + (n > 0 ? 'влево' : 'вправо') + '.' }; }
    const a = R.int(2, 9), b = R.int(2, 9), p = R.int(-5, 8), q = R.int(-5, 8); const prod = a * b; const e = p + q + (prod >= 10 ? 1 : 0);
    return { q: '$(' + a + ' \\cdot 10^{' + p + '}) \\cdot (' + b + ' \\cdot 10^{' + q + '}) = c \\cdot 10^{n}$, где $1 \\le c < 10$. Найдите $n$.', a: e, sol: '$' + prod + ' \\cdot 10^{' + (p + q) + '}' + (prod >= 10 ? ' = ' + R.tn(prod / 10) + ' \\cdot 10^{' + e + '}' : '') + '$' };
  }, 'стандартный вид');

  D(3, 'polynomials', 'd-like', '🧲', 'Подобные слагаемые', 'Упростите до вида kx + b и введите k; b.', ['Без скобок', 'Со скобками', 'Минус перед скобками'], (lv, R) => {
    const a = R.nz(-9, 9), b = R.nz(-9, 9), c = R.nz(-9, 9), d = R.nz(-9, 9), m = R.nz(-5, 5);
    if (lv === 1) return { q: 'Упростите: $' + R.term(a, 'x', true) + R.term(b, '') + R.term(c, 'x') + R.term(d, '') + '$', a: [a + c, b + d], ordered: true, ph: 'k; b', show: '$' + R.poly([a + c, b + d]) + '$', sol: 'Коэффициенты при $x$: $' + a + ' + (' + c + ')$; числа: $' + b + ' + (' + d + ')$.' };
    if (lv === 2) return { q: 'Упростите: $' + m + '(' + R.term(a, 'x', true) + R.term(b, '') + ')' + R.term(c, 'x') + '$', a: [m * a + c, m * b], ordered: true, ph: 'k; b', show: '$' + R.poly([m * a + c, m * b]) + '$', sol: 'Раскрываем скобки: $' + R.poly([m * a, m * b]) + '$.' };
    return { q: 'Упростите: $' + R.term(c, 'x', true) + ' - (' + R.term(a, 'x', true) + R.term(b, '') + ')' + R.term(d, '') + '$', a: [c - a, d - b], ordered: true, ph: 'k; b', show: '$' + R.poly([c - a, d - b]) + '$', sol: 'Минус перед скобками меняет знаки: $' + R.poly([-a, -b]) + '$.' };
  }, 'подобные упростить');

  D(3, 'polynomials', 'd-expand', '📦', 'Раскрытие скобок', 'Перемножьте многочлены; введите коэффициенты через «;».', ['$(x+a)(x+b)$', '$(px+a)(qx+b)$', '$k(x+a)^2$ и разность'], (lv, R) => {
    const a = R.nz(-9, 9), b = R.nz(-9, 9);
    if (lv === 1) return { q: '$(x' + R.term(a, '') + ')(x' + R.term(b, '') + ') = x^2 + \\square x + \\square$', a: [a + b, a * b], ordered: true, ph: 'b; c', show: '$' + R.poly([1, a + b, a * b]) + '$', sol: 'Средний коэффициент $' + a + ' + (' + b + ')$, свободный $' + a + ' \\cdot (' + b + ')$.' };
    const p = R.nz(-4, 4), q = R.nz(-4, 4);
    if (lv === 2) return { q: '$(' + R.term(p, 'x', true) + R.term(a, '') + ')(' + R.term(q, 'x', true) + R.term(b, '') + ') = \\square x^2 + \\square x + \\square$', a: [p * q, p * b + q * a, a * b], ordered: true, ph: 'a; b; c', show: '$' + R.poly([p * q, p * b + q * a, a * b]) + '$', sol: 'Каждый на каждый: $' + p * q + 'x^2$, $' + p * b + 'x$, $' + q * a + 'x$, $' + a * b + '$.' };
    const k = R.nz(-3, 3); return { q: '$' + k + '(x' + R.term(a, '') + ')^2 - ' + R.signed(b) + 'x = \\square x^2 + \\square x + \\square$', a: [k, 2 * a * k - b, k * a * a], ordered: true, ph: 'a; b; c', show: '$' + R.poly([k, 2 * a * k - b, k * a * a]) + '$', sol: '$(x' + R.term(a, '') + ')^2 = ' + R.poly([1, 2 * a, a * a]) + '$, умножаем на ' + k + '.' };
  }, 'раскрыть скобки умножение многочленов');

  D(3, 'shortmult', 'd-sqformula', '²', 'Формулы сокращённого умножения', 'Квадрат суммы/разности, разность квадратов, счёт в уме.', ['Квадрат двучлена', 'Счёт в уме', 'Разность квадратов'], (lv, R) => {
    if (lv === 1) { const a = R.nz(-12, 12); return { q: '$(x' + R.term(a, '') + ')^2 = x^2 + \\square x + \\square$', a: [2 * a, a * a], ordered: true, ph: 'b; c', show: '$' + R.poly([1, 2 * a, a * a]) + '$', sol: 'Удвоенное произведение: $2 \\cdot ' + R.signed(a) + ' = ' + 2 * a + '$; квадрат: $' + a * a + '$.' }; }
    if (lv === 2) { const b = R.pick([20, 30, 40, 50, 60, 70, 80, 90, 100]), d = R.nz(-3, 3); const n = b + d; if (R.int(0, 1)) return { q: '$' + n + '^2 = \;?$', a: n * n, kb: 'numeric', sol: '$(' + b + R.term(d, '') + ')^2 = ' + b * b + R.term(2 * b * d, '') + ' + ' + d * d + '$' }; const e = Math.abs(d); return { q: '$' + (b - e) + ' \\cdot ' + (b + e) + ' = \;?$', a: b * b - e * e, kb: 'numeric', sol: '$(' + b + ' - ' + e + ')(' + b + ' + ' + e + ') = ' + b * b + ' - ' + e * e + '$' }; }
    const x = R.int(30, 99), y = R.int(10, x - 1); return { q: '$' + x + '^2 - ' + y + '^2 = \;?$', a: x * x - y * y, kb: 'numeric', sol: '$(' + x + ' - ' + y + ')(' + x + ' + ' + y + ') = ' + (x - y) + ' \\cdot ' + (x + y) + '$' };
  }, 'квадрат суммы разность квадратов');

  D(3, 'factoring', 'd-factor', '🧩', 'Разложение на множители', 'Выберите верное разложение.', ['Общий множитель', 'Формулы', 'Трёхчлен'], (lv, R) => {
    const a = R.int(1, 9), b = R.int(1, 9);
    if (lv === 1) { const k = R.int(2, 6); return { q: 'Разложите: $' + R.poly([k * a, k * b, 0]) + '$', opts: ['$' + k + 'x(' + a + 'x + ' + b + ')$', '$' + k + '(' + a + 'x^2 + ' + b + ')$', '$x(' + k * a + 'x + ' + b + ')$', '$' + k + 'x(' + a + 'x + ' + k * b + ')$'].filter((v, i, s) => s.indexOf(v) === i) }; }
    if (lv === 2) { if (R.int(0, 1)) return { q: 'Разложите: $' + (a * a === 1 ? '' : a * a) + 'x^2 - ' + b * b + '$', opts: ['$(' + (a === 1 ? '' : a) + 'x - ' + b + ')(' + (a === 1 ? '' : a) + 'x + ' + b + ')$', '$(' + (a === 1 ? '' : a) + 'x - ' + b + ')^2$', '$(' + (a === 1 ? '' : a) + 'x + ' + b + ')^2$', '$(' + (a * a === 1 ? '' : a * a) + 'x - ' + b + ')(x + ' + b + ')$', '$(' + (a === 1 ? '' : a) + 'x - ' + b * b + ')(' + (a === 1 ? '' : a) + 'x + 1)$'].filter((v, i, s2) => s2.indexOf(v) === i).slice(0, 4) }; return { q: 'Разложите: $x^2 + ' + 2 * b + 'x + ' + b * b + '$', opts: ['$(x + ' + b + ')^2$', '$(x - ' + b + ')(x + ' + b + ')$', '$(x + ' + 2 * b + ')^2$', '$(x + ' + b * b + ')(x + 1)$'] }; }
    const p = R.nz(-7, 7); let q; do q = R.nz(-7, 7); while (q === p || q === -p);
    const t = v => v < 0 ? ' - ' + (-v) : ' + ' + v;
    return { q: 'Разложите: $' + R.poly([1, -(p + q), p * q]) + '$', opts: ['$(x' + t(-p) + ')(x' + t(-q) + ')$', '$(x' + t(p) + ')(x' + t(q) + ')$', '$(x' + t(-p) + ')(x' + t(q) + ')$', '$(x' + t(p) + ')(x' + t(-q) + ')$'], sol: 'Корни трёхчлена ' + p + ' и ' + q + ' (по Виету: сумма ' + (p + q) + ', произведение ' + p * q + ').' };
  }, 'разложение на множители');

  D(3, 'lineq', 'd-lineq', '⚖️', 'Линейные уравнения', 'Найдите корень уравнения.', ['$ax + b = c$', 'Неизвестное с двух сторон', 'Дроби и скобки'], (lv, R) => {
    const x = R.int(-10, 10);
    if (lv === 1) { const a = R.nz(-9, 9), b = R.int(-20, 20); return { q: 'Решите: $' + R.term(a, 'x', true) + R.term(b, '') + ' = ' + (a * x + b) + '$', a: x, sol: '$' + R.term(a, 'x', true) + ' = ' + (a * x) + '$, $x = ' + x + '$' }; }
    if (lv === 2) { const a = R.nz(-9, 9); let c; do c = R.nz(-9, 9); while (c === a); const b = R.int(-15, 15), d = (a - c) * x + b; return { q: 'Решите: $' + R.term(a, 'x', true) + R.term(b, '') + ' = ' + R.term(c, 'x', true) + R.term(d, '') + '$', a: x, sol: '$' + (a - c) + 'x = ' + (d - b) + '$' }; }
    const p = R.int(2, 5), q = R.int(2, 5); if (p === q) return null; const m = R.int(-12, 12) * p * q / R.gcd(p, q) ** 0; const xx = m;
    const k = R.int(1, 9), rhs = R.round(xx / p - (xx - k) / q, 6); if (!Number.isInteger(rhs * p * q)) return null;
    return { q: 'Решите: $\\frac{x}{' + p + '} - \\frac{x - ' + k + '}{' + q + '} = ' + R.frac(Math.round(rhs * p * q), p * q) + '$', a: xx, sol: 'Умножаем всё на ' + p * q + '.' };
  }, 'линейное уравнение');

  D(3, 'wordeq', 'd-wordeq', '🧠', 'Задачи на уравнения', 'Составьте уравнение и решите.', ['Числа и возраст', 'Движение', 'Работа и смеси'], (lv, R) => {
    if (lv === 1) { if (R.int(0, 1)) { const x = R.int(5, 40), d = R.int(2, 20); return { q: 'Сумма двух чисел ' + (2 * x + d) + ', одно больше другого на ' + d + '. Найдите меньшее.', a: x, kb: 'numeric', sol: '$x + x + ' + d + ' = ' + (2 * x + d) + '$' }; } const s = R.int(5, 15), k = R.int(2, 5), y = R.int(2, 12); const f = k * (s + y) - y; if (f - s < 18) return null; return { q: 'Отцу ' + f + ' лет, сыну ' + s + '. Через сколько лет отец будет старше сына в ' + k + ' раза?', a: y, unit: 'лет', kb: 'numeric', sol: '$' + f + ' + x = ' + k + '(' + s + ' + x)$' }; }
    if (lv === 2) { const v1 = R.int(4, 12) * 5, v2 = R.int(4, 12) * 5, t = R.int(1, 5); if (R.int(0, 1)) return { q: 'Из двух городов, расстояние между которыми ' + (v1 + v2) * t + ' км, навстречу выехали машины со скоростями ' + v1 + ' и ' + v2 + ' км/ч. Через сколько часов они встретятся?', a: t, unit: 'ч', kb: 'decimal', sol: 'Скорость сближения $' + (v1 + v2) + '$ км/ч.' }; const v = R.int(8, 20), c = R.int(1, 4), T = R.int(2, 5); return { q: 'Лодка проходит ' + (v + c) * T + ' км по течению за ' + T + ' ч. Скорость течения ' + c + ' км/ч. Какова собственная скорость лодки?', a: v, unit: 'км/ч', kb: 'decimal', sol: '$(x + ' + c + ') \\cdot ' + T + ' = ' + (v + c) * T + '$' }; }
    if (R.int(0, 1)) { const [a, b] = R.pick([[3, 6], [4, 12], [6, 12], [6, 3], [10, 15], [12, 4], [20, 30], [5, 20]]); return { q: 'Одна труба наполняет бассейн за ' + a + ' ч, другая — за ' + b + ' ч. За сколько часов наполнят обе вместе?', a: a * b / (a + b), unit: 'ч', kb: 'decimal', sol: '$\\frac{1}{' + a + '} + \\frac{1}{' + b + '} = ' + R.frac(a + b, a * b) + '$ бассейна в час.' }; }
    const m = R.int(2, 8) * 50, p1 = R.pick([20, 30, 40, 50]), p2 = R.pick([5, 10, 15].filter(v => v < p1)); const w = m * p1 / p2 - m; if (!Number.isInteger(w)) return null;
    return { q: 'Сколько граммов воды нужно добавить к ' + m + ' г ' + p1 + '%-го раствора соли, чтобы получить ' + p2 + '%-й раствор?', a: w, unit: 'г', kb: 'numeric', sol: 'Соли $' + m * p1 / 100 + '$ г: $' + R.tn(p2 / 100) + '(' + m + ' + x) = ' + m * p1 / 100 + '$.' };
  }, 'задача уравнение');

  D(3, 'systems', 'd-system', '✳️', 'Системы уравнений', 'Найдите решение (x; y). Ответ вводите так: 2; −3.', ['Простые', 'Общий вид', 'Задачи'], (lv, R) => {
    const x = R.int(-8, 8), y = R.int(-8, 8);
    if (lv === 1) return { q: 'Решите систему: $\\begin{cases} x + y = ' + (x + y) + ' \\\\ x - y = ' + (x - y) + ' \\end{cases}$', a: [x, y], ordered: true, ph: 'x; y', show: '(' + x + '; ' + y + ')', sol: 'Сложим: $2x = ' + 2 * x + '$.' };
    if (lv === 2) { const a = R.nz(-5, 5), b = R.nz(-5, 5), c = R.nz(-5, 5), d = R.nz(-5, 5); if (a * d === b * c) return null; return { q: 'Решите систему: $\\begin{cases} ' + R.term(a, 'x', true) + R.term(b, 'y') + ' = ' + (a * x + b * y) + ' \\\\ ' + R.term(c, 'x', true) + R.term(d, 'y') + ' = ' + (c * x + d * y) + ' \\end{cases}$', a: [x, y], ordered: true, ph: 'x; y', show: '(' + x + '; ' + y + ')', sol: 'Способ сложения или подстановки; проверьте ответ в обоих уравнениях.' }; }
    const t = R.int(2, 9) * 10, r = R.int(3, 15) * 10, n1 = R.int(2, 5), m1 = R.int(1, 4), n2 = R.int(1, 4), m2 = R.int(2, 5); if (n1 * m2 === n2 * m1) return null;
    return { q: n1 + ' тетрадей и ' + m1 + ' ручек стоят ' + R.num((n1 * t + m1 * r) / 100) + ' €, а ' + n2 + ' тетрадей и ' + m2 + ' ручек — ' + R.num((n2 * t + m2 * r) / 100) + ' €. Сколько стоят тетрадь и ручка (в центах)?', a: [t, r], ordered: true, ph: 'тетрадь; ручка', show: t + '; ' + r + ' центов', sol: 'Система: $' + n1 + 't + ' + m1 + 'r = ' + (n1 * t + m1 * r) + '$, $' + n2 + 't + ' + m2 + 'r = ' + (n2 * t + m2 * r) + '$.' };
  }, 'система уравнений');

  D(3, 'sqrt', 'd-sqrt', '√', 'Квадратные корни', 'Извлечение и упрощение. Ответ можно писать с корнем: 3√2.', ['Точные корни', 'Вынести множитель', 'Действия с корнями'], (lv, R) => {
    if (lv === 1) { const n = R.int(1, 20), k = R.pick([1, 1, 10]); return { q: '$\\sqrt{' + R.tn(n * n / (k * k)) + '}$', a: n / k, kb: 'decimal' }; }
    if (lv === 2) { const k = R.int(2, 9), m = R.pick([2, 3, 5, 6, 7, 10, 11]); return { q: 'Упростите: $\\sqrt{' + k * k * m + '}$ (вид $a\\sqrt{b}$)', a: k * Math.sqrt(m), show: '$' + k + '\\sqrt{' + m + '}$', sol: '$' + k * k * m + ' = ' + k * k + ' \\cdot ' + m + '$' }; }
    const m = R.pick([2, 3, 5]), a = R.int(1, 5), b = R.int(1, 4), k = R.int(0, 2);
    if (k === 0) return { q: '$' + a + '\\sqrt{' + m + '} + \\sqrt{' + b * b * m + '}$', a: (a + b) * Math.sqrt(m), show: '$' + (a + b) + '\\sqrt{' + m + '}$', sol: '$\\sqrt{' + b * b * m + '} = ' + b + '\\sqrt{' + m + '}$' };
    if (k === 1) { const p = R.int(1, 6); return { q: '$\\sqrt{' + p * m + '} \\cdot \\sqrt{' + p * m * b * b + '}$', a: p * m * b, kb: 'numeric', sol: '$\\sqrt{' + p * m + ' \\cdot ' + p * m * b * b + '} = \\sqrt{' + (p * m * b) ** 2 + '}$' }; }
    return { q: '$(' + a + '\\sqrt{' + m + '})^2$', a: a * a * m, kb: 'numeric', sol: '$' + a * a + ' \\cdot ' + m + '$' };
  }, 'корень');

  D(3, 'quadeq', 'd-quadeq', '🎯', 'Квадратные уравнения', 'Найдите все корни через «;». Нет корней — напишите «нет».', ['Неполные', 'Приведённые', 'Общий вид'], (lv, R) => {
    if (lv === 1) { const k = R.int(0, 2); if (k === 0) { const r = R.nz(-9, 9); return { q: 'Решите: $x^2 ' + (r < 0 ? '+ ' + (-r) : '- ' + r) + 'x = 0$', a: [0, r], sol: '$x(x ' + (r < 0 ? '+ ' + (-r) : '- ' + r) + ') = 0$' }; } if (k === 1) { const r = R.int(1, 12), m = R.int(1, 3); return { q: 'Решите: $' + (m === 1 ? '' : m) + 'x^2 - ' + m * r * r + ' = 0$', a: [r, -r], sol: '$x^2 = ' + r * r + '$' }; } const r = R.int(1, 9); return { q: 'Решите: $x^2 + ' + r * r + ' = 0$', a: [], sol: 'Квадрат не бывает отрицательным.' }; }
    if (lv === 2) { const p = R.int(-9, 9), q = R.int(-9, 9); const b = -(p + q), c = p * q; return { q: 'Решите: $' + R.poly([1, b, c]) + ' = 0$', a: p === q ? [p] : [p, q], sol: '$D = ' + (b * b - 4 * c) + '$; по Виету: сумма ' + (p + q) + ', произведение ' + c + '.' }; }
    if (R.int(0, 4) === 0) { const a = R.int(1, 4), b = R.int(-4, 4), c = R.int(1, 6); if (b * b - 4 * a * c >= 0) return null; return { q: 'Решите: $' + R.poly([a, b, c]) + ' = 0$', a: [], sol: '$D = ' + (b * b - 4 * a * c) + ' < 0$' }; }
    const a = R.int(2, 5), r1 = R.int(-6, 6), n = R.nz(-5, 5); if (R.gcd(n, a) !== 1) return null; // корни r1 и n/a
    const A = a, B = -(a * r1 + n), C = r1 * n; const D2 = B * B - 4 * A * C;
    return { q: 'Решите: $' + R.poly([A, B, C]) + ' = 0$', a: [r1, n / a], show: r1 + '; ' + R.num(R.round(n / a, 4)) + ' (то есть $' + R.frac(n, a) + '$)', sol: '$D = ' + D2 + '$, $x = \\frac{' + (-B) + ' \\pm ' + Math.sqrt(D2) + '}{' + 2 * A + '}$' };
  }, 'квадратное уравнение дискриминант');

  D(3, 'quadeq', 'd-vieta', 'Σ', 'Теорема Виета', 'Сумма и произведение корней без решения уравнения.', ['Сумма и произведение', 'Подбор корней', 'Второй корень'], (lv, R) => {
    const p = R.int(-9, 9), q = R.int(-9, 9); const b = -(p + q), c = p * q;
    if (lv === 1) return R.int(0, 1) ? { q: 'Найдите сумму корней $' + R.poly([1, b, c]) + ' = 0$.', a: p + q, sol: '$x_1 + x_2 = ' + (-b) + '$' } : { q: 'Найдите произведение корней $' + R.poly([1, b, c]) + ' = 0$.', a: c, sol: '$x_1 x_2 = ' + c + '$' };
    if (lv === 2) return { q: 'Подберите корни: $' + R.poly([1, b, c]) + ' = 0$', a: p === q ? [p] : [p, q], sol: 'Два числа с суммой ' + (p + q) + ' и произведением ' + c + '.' };
    return { q: 'Один корень уравнения $x^2 ' + (b < 0 ? '- ' + (-b) : '+ ' + b) + 'x + c = 0$ равен ' + p + '. Найдите второй корень.', a: q, sol: '$x_2 = ' + (-b) + ' - (' + p + ')$' };
  }, 'Виет');

  D(3, 'linear', 'd-linfunc', '📈', 'Линейная функция', 'Наклон, значение, нуль функции, уравнение прямой.', ['Значение и нуль', 'Наклон по точкам', 'Уравнение прямой'], (lv, R) => {
    const k = R.nz(-5, 5), b = R.int(-9, 9);
    if (lv === 1) { if (R.int(0, 1)) { const x = R.int(-6, 6); return { q: 'Найдите $f(' + x + ')$, если $f(x) = ' + R.poly([k, b]) + '$.', a: k * x + b, sol: '$' + k + ' \\cdot ' + R.signed(x) + R.term(b, '') + '$' }; } return { q: 'Найдите нуль функции $y = ' + R.poly([k, b]) + '$.', a: -b / k, show: '$' + R.frac(-b, k) + '$', sol: '$' + R.poly([k, b]) + ' = 0$' }; }
    const x1 = R.int(-6, 4), x2 = x1 + R.int(1, 5);
    if (lv === 2) return { q: 'Найдите угловой коэффициент прямой через точки $(' + x1 + ';\\ ' + (k * x1 + b) + ')$ и $(' + x2 + ';\\ ' + (k * x2 + b) + ')$.', a: k, sol: '$k = \\frac{' + (k * x2 + b) + ' - ' + R.signed(k * x1 + b) + '}{' + x2 + ' - ' + R.signed(x1) + '}$' };
    return { q: 'Прямая проходит через $(' + x1 + ';\\ ' + (k * x1 + b) + ')$ и $(' + x2 + ';\\ ' + (k * x2 + b) + ')$. Запишите $y = kx + b$: введите $k$; $b$.', a: [k, b], ordered: true, ph: 'k; b', show: '$y = ' + R.poly([k, b]) + '$', sol: 'Сначала $k$, затем $b = y_1 - kx_1$.' };
  }, 'линейная функция наклон');

  D(3, 'quadfunc', 'd-vertex', '🏹', 'Вершина параболы', 'Найдите вершину (x₀; y₀) или экстремальное значение.', ['$y = x^2 + bx + c$', 'Общий вид', 'Наибольшее/наименьшее'], (lv, R) => {
    const x0 = R.int(-6, 6), y0 = R.int(-9, 9), a = lv === 1 ? 1 : R.nz(-3, 3);
    const B = -2 * a * x0, C = a * x0 * x0 + y0;
    if (lv < 3) return { q: 'Найдите вершину параболы $y = ' + R.poly([a, B, C]) + '$.', a: [x0, y0], ordered: true, ph: 'x₀; y₀', show: '(' + x0 + '; ' + y0 + ')', sol: '$x_0 = -\\frac{' + B + '}{' + 2 * a + '} = ' + x0 + '$, $y_0 = f(' + x0 + ') = ' + y0 + '$' };
    return { q: 'Найдите ' + (a > 0 ? 'наименьшее' : 'наибольшее') + ' значение функции $y = ' + R.poly([a, B, C]) + '$.', a: y0, sol: 'Ветви ' + (a > 0 ? 'вверх' : 'вниз') + ', значение в вершине $x_0 = ' + x0 + '$.' };
  }, 'парабола вершина');

  D(3, 'ineq', 'd-ineq', '⋚', 'Линейные неравенства', 'Найдите наименьшее или наибольшее целое решение.', ['$ax > b$', 'Деление на минус', 'Системы'], (lv, R) => {
    if (lv < 3) { const a = lv === 1 ? R.int(2, 9) : -R.int(2, 9), b = R.int(-9, 9), c = R.int(-20, 20); const strict = R.int(0, 1); const bound = (c - b) / a; // ax + b (>|>=) c
      const gt = a > 0; let ans; if (gt) ans = strict ? Math.floor(bound) + 1 : Math.ceil(bound); else ans = strict ? Math.ceil(bound) - 1 : Math.floor(bound);
      return { q: 'Найдите ' + (gt ? 'наименьшее' : 'наибольшее') + ' целое решение: $' + R.poly([a, b]) + (strict ? ' > ' : ' \\ge ') + c + '$', a: ans, sol: '$' + a + 'x ' + (strict ? '>' : '\\ge') + ' ' + (c - b) + '$ ⇒ $x ' + (gt ? (strict ? '>' : '\\ge') : (strict ? '<' : '\\le')) + ' ' + R.frac(c - b, a) + '$' + (gt ? '' : ' (делили на отрицательное — знак сменился)') };
    }
    const lo = R.int(-8, 4), hi = lo + R.int(1, 7); const p = R.int(2, 4);
    return { q: 'Сколько целых решений у системы $\\begin{cases} ' + p + 'x > ' + p * lo + ' \\\\ x \\le ' + hi + ' \\end{cases}$?', a: hi - lo, kb: 'numeric', sol: '$x \\in (' + lo + ';\\ ' + hi + ']$: целые от ' + (lo + 1) + ' до ' + hi + '.' };
  }, 'неравенство');
})();

