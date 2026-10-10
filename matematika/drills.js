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
  /* ——— Курс IV ——— */
  const rtri = (la, lb, lc) => svgOpen(220, 150) + '<polygon points="30,125 190,125 30,25"/><polyline points="30,113 42,113 42,125" stroke-width="1.5"/>' + txt(110, 143, la) + txt(18, 80, lb, 'end').replace('x="18"', 'x="24"') + txt(120, 68, lc, 'start') + '</svg>';
  D(4, 'triangles', 'd-tri', '△', 'Углы треугольника', 'Равнобедренный треугольник, внешний угол, неравенство треугольника.', ['Сумма углов', 'Равнобедренный и внешний угол', 'Существует ли треугольник'], (lv, R) => {
    if (lv === 1) { const a = R.int(20, 100), b = R.int(10, 170 - a); return { q: 'Два угла треугольника ' + a + '° и ' + b + '°. Найдите третий.', a: 180 - a - b, unit: '°', kb: 'numeric' }; }
    if (lv === 2) { const k = R.int(0, 2); if (k === 0) { const t = R.int(10, 80) * 2; return { q: 'Угол при вершине равнобедренного треугольника ' + t + '°. Найдите угол при основании.', a: (180 - t) / 2, unit: '°', kb: 'decimal', sol: '$(180° - ' + t + '°) : 2$' }; } if (k === 1) { const b = R.int(20, 85); return { q: 'Угол при основании равнобедренного треугольника ' + b + '°. Найдите угол при вершине.', a: 180 - 2 * b, unit: '°', kb: 'numeric' }; } const a = R.int(20, 80), b = R.int(20, 80); return { q: 'Два угла треугольника ' + a + '° и ' + b + '°. Найдите внешний угол при третьей вершине.', a: a + b, unit: '°', kb: 'numeric', sol: 'Внешний угол равен сумме двух несмежных внутренних.' }; }
    const a = R.int(2, 12), b = R.int(2, 12), c = R.int(1, 25); const ok = a + b > c && a + c > b && b + c > a;
    return { q: 'Существует ли треугольник со сторонами ' + a + ', ' + b + ' и ' + c + '?', opts: ok ? ['да', 'нет'] : ['нет', 'да'], sol: 'Проверяем: наибольшая сторона ' + Math.max(a, b, c) + (ok ? ' меньше' : ' не меньше') + ' суммы двух других.' };
  }, 'треугольник углы');

  D(4, 'pythagoras', 'd-pyth', '📐', 'Теорема Пифагора', 'Гипотенуза, катет, диагональ, расстояние. Ответ можно с корнем: 2√13.', ['Гипотенуза', 'Катет', 'Применения'], (lv, R) => {
    const T = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [12, 16, 20]];
    if (lv === 1) { if (R.int(0, 2)) { const [a, b, c] = R.pick(T); return { q: 'Катеты ' + a + ' и ' + b + '. Найдите гипотенузу.', svg: rtri(a, b, '?'), a: c, kb: 'decimal', sol: '$\\sqrt{' + a * a + ' + ' + b * b + '} = \\sqrt{' + c * c + '}$' }; } const a = R.int(1, 9), b = R.int(1, 9); return { q: 'Катеты ' + a + ' и ' + b + '. Найдите гипотенузу.', svg: rtri(a, b, '?'), a: Math.sqrt(a * a + b * b), show: '$\\sqrt{' + (a * a + b * b) + '} \\approx ' + R.tn(R.round(Math.sqrt(a * a + b * b), 2)) + '$', tol: 0.006 * Math.sqrt(a * a + b * b) }; }
    if (lv === 2) { const [a, b, c] = R.pick(T); return { q: 'Гипотенуза ' + c + ', один катет ' + a + '. Найдите другой катет.', svg: rtri(a, '?', c), a: b, kb: 'decimal', sol: '$\\sqrt{' + c * c + ' - ' + a * a + '} = \\sqrt{' + b * b + '}$' }; }
    const k = R.int(0, 2);
    if (k === 0) { const s = R.int(2, 12); return { q: 'Найдите диагональ квадрата со стороной ' + s + '.', a: s * Math.SQRT2, show: '$' + s + '\\sqrt{2}$', tol: 0.006 * s * Math.SQRT2 }; }
    if (k === 1) { const s = R.int(1, 6) * 2; return { q: 'Найдите высоту равностороннего треугольника со стороной ' + s + '.', a: s * Math.sqrt(3) / 2, show: '$' + s / 2 + '\\sqrt{3}$', tol: 0.006 * s, sol: '$h = \\sqrt{' + s * s + ' - ' + s * s / 4 + '}$' }; }
    const [a, b, c] = R.pick(T); return { q: 'Лестница длиной ' + c + ' м стоит на расстоянии ' + a + ' м от стены. На какой высоте её верхний конец?', a: b, unit: 'м', kb: 'decimal' };
  }, 'Пифагор гипотенуза катет');

  D(4, 'quadrilaterals', 'd-quad', '▱', 'Четырёхугольники', 'Углы параллелограмма, средняя линия трапеции, ромб.', ['Углы', 'Средняя линия и площадь', 'Ромб'], (lv, R) => {
    if (lv === 1) { const a = R.int(30, 150); if (a === 90) return null; return { q: 'Один угол параллелограмма ' + a + '°. Найдите больший из его углов.', a: Math.max(a, 180 - a), unit: '°', kb: 'numeric', sol: 'Соседние углы в сумме 180°.' }; }
    if (lv === 2) { const a = R.int(2, 20), b = R.int(2, 20), h = R.int(2, 12); return R.int(0, 1) ? { q: 'Основания трапеции ' + a + ' и ' + b + '. Найдите среднюю линию.', a: (a + b) / 2, kb: 'decimal' } : { q: 'Средняя линия трапеции ' + R.num((a + b) / 2) + ', высота ' + h + '. Найдите площадь.', a: (a + b) / 2 * h, kb: 'decimal', sol: '$S = m h$' }; }
    const [p, q, s] = R.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]]);
    return R.int(0, 1) ? { q: 'Диагонали ромба ' + 2 * p + ' и ' + 2 * q + '. Найдите площадь.', a: 2 * p * q, kb: 'numeric', sol: '$\\frac{' + 2 * p + ' \\cdot ' + 2 * q + '}{2}$' } : { q: 'Диагонали ромба ' + 2 * p + ' и ' + 2 * q + '. Найдите сторону.', a: s, kb: 'numeric', sol: 'Половины диагоналей — катеты: $\\sqrt{' + p * p + ' + ' + q * q + '}$' };
  }, 'параллелограмм трапеция ромб');

  D(4, 'similarity', 'd-similar', '🔍', 'Подобие', 'Коэффициент подобия, стороны, площади, высота по тени.', ['Стороны', 'Площади и объёмы', 'Тени'], (lv, R) => {
    const k = R.pick([2, 3, 4, 1.5, 2.5]);
    if (lv === 1) { const a = R.int(2, 12); return { q: 'Треугольники подобны с коэффициентом ' + R.num(k) + '. Сторона меньшего ' + a + ' см. Найдите соответствующую сторону большего.', a: a * k, unit: 'см', kb: 'decimal' }; }
    if (lv === 2) { const S = R.int(2, 20); if (R.int(0, 1)) return { q: 'Подобные фигуры: коэффициент ' + R.num(k) + ', площадь меньшей ' + S + ' см². Площадь большей?', a: S * k * k, unit: 'см²', kb: 'decimal', sol: 'Площади относятся как $k^2 = ' + R.tn(k * k) + '$.' }; const m = R.pick([2, 3, 5, 10]); return { q: 'Модель в масштабе 1 : ' + m + '. Во сколько раз её объём меньше объёма оригинала?', a: m ** 3, kb: 'numeric', sol: 'Объёмы относятся как $k^3$.' }; }
    const h = R.pick([1.5, 1.6, 1.8, 2]), s = R.pick([1, 1.2, 2, 2.4, 3]), T = R.int(4, 20); return { q: 'Человек ростом ' + R.num(h) + ' м отбрасывает тень ' + R.num(s) + ' м, а дерево — тень ' + T + ' м. Найдите высоту дерева.', a: R.round(h * T / s, 6), tol: 0.01, show: R.num(R.round(h * T / s, 2)), unit: 'м', kb: 'decimal', sol: '$\\frac{H}{' + T + '} = \\frac{' + R.tn(h) + '}{' + R.tn(s) + '}$' };
  }, 'подобие');

  D(4, 'circlegeo', 'd-inscribed', '◔', 'Углы в окружности', 'Центральный и вписанный углы, вписанный четырёхугольник.', ['Вписанный и центральный', 'Диаметр и касательная', 'Вписанный четырёхугольник'], (lv, R) => {
    if (lv === 1) { const c = R.int(10, 170) * 2; if (c >= 360) return null; return R.int(0, 1) ? { q: 'Центральный угол ' + c + '°. Найдите вписанный угол, опирающийся на ту же дугу.', a: c / 2, unit: '°', kb: 'numeric' } : { q: 'Вписанный угол ' + c / 2 + '°. Найдите центральный угол на ту же дугу.', a: c, unit: '°', kb: 'numeric' }; }
    if (lv === 2) { const a = R.int(15, 75); return R.int(0, 1) ? { q: 'Треугольник $ABC$ вписан в окружность, $AB$ — диаметр, $\\angle A = ' + a + '°$. Найдите $\\angle B$.', a: 90 - a, unit: '°', kb: 'numeric', sol: '$\\angle C = 90°$ (опирается на диаметр).' } : (() => { const [p, q, c] = R.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]]); return { q: 'Из точки $A$ к окружности с центром $O$ и радиусом ' + p + ' проведена касательная $AB$ ($B$ — точка касания). $OA = ' + c + '$. Найдите $AB$.', a: q, kb: 'numeric', sol: 'Радиус $OB \\perp AB$, поэтому $AB = \\sqrt{' + c * c + ' - ' + p * p + '}$.' }; })(); }
    const a = R.int(40, 140); return { q: 'Четырёхугольник вписан в окружность, один из его углов ' + a + '°. Найдите противолежащий угол.', a: 180 - a, unit: '°', kb: 'numeric', sol: 'Сумма противолежащих углов — 180°.' };
  }, 'вписанный угол окружность');

  D(4, 'trig-right', 'd-trigright', '∡', 'Синус, косинус, тангенс', 'Табличные значения и решение прямоугольного треугольника.', ['Таблица значений', 'Найти сторону', 'Найти угол'], (lv, R) => {
    if (lv === 1) { const V = { 30: ['\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}', '\\frac{\\sqrt{3}}{3}'], 45: ['\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{2}}{2}', '1'], 60: ['\\frac{\\sqrt{3}}{2}', '\\frac{1}{2}', '\\sqrt{3}'] }; const ang = R.pick([30, 45, 60]), f = R.int(0, 2), nm = ['\\sin', '\\cos', '\\tan'][f]; const all = ['\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}', '\\frac{\\sqrt{2}}{2}', '\\sqrt{3}', '1', '\\frac{\\sqrt{3}}{3}']; const right = V[ang][f]; return { q: '$' + nm + ' ' + ang + '° = \;?$', opts: ['$' + right + '$', ...R.sample(all.filter(x => x !== right), 3).map(x => '$' + x + '$')] }; }
    const A = R.int(15, 75), c = R.int(4, 30), r = A * Math.PI / 180;
    if (lv === 2) { const k = R.int(0, 2); const nm = ['противолежащий катет', 'прилежащий катет', 'противолежащий катет (известен прилежащий ' + c + ')'][k]; const ans = k === 0 ? c * Math.sin(r) : k === 1 ? c * Math.cos(r) : c * Math.tan(r); return { q: (k === 2 ? 'Прилежащий катет ' + c : 'Гипотенуза ' + c) + ', острый угол ' + A + '°. Найдите ' + nm.replace(/ \(.*/, '') + ' (до сотых).', a: ans, tol: 0.011, show: R.num(R.round(ans, 2)), kb: 'decimal', sol: '$' + (k === 0 ? c + ' \\cdot \\sin ' + A + '°' : k === 1 ? c + ' \\cdot \\cos ' + A + '°' : c + ' \\cdot \\tan ' + A + '°') + '$ (калькулятор в режиме DEG).' }; }
    const a = R.int(2, 15), b = R.int(2, 15); const ang = Math.atan(a / b) * 180 / Math.PI;
    return { q: 'Катеты ' + a + ' и ' + b + '. Найдите угол, противолежащий катету ' + a + ' (в градусах, до десятых).', a: ang, tol: 0.06, show: R.num(R.round(ang, 1)) + '°', kb: 'decimal', sol: '$\\tan\\alpha = \\frac{' + a + '}{' + b + '}$, $\\alpha = \\tan^{-1}(' + R.tn(R.round(a / b, 4)) + ')$' };
  }, 'синус косинус тангенс');

  D(4, 'polygons', 'd-polyangles', '⬡', 'Углы многоугольников', 'Сумма углов, угол правильного многоугольника, число сторон.', ['Сумма углов', 'Правильный многоугольник', 'Число сторон'], (lv, R) => {
    const n = R.pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20]);
    if (lv === 1) return { q: 'Найдите сумму углов выпуклого ' + n + '-угольника.', a: 180 * (n - 2), unit: '°', kb: 'numeric', sol: '$180° \\cdot (' + n + ' - 2)$' };
    if (lv === 2) return R.int(0, 1) ? { q: 'Найдите угол правильного ' + n + '-угольника.', a: 180 * (n - 2) / n, unit: '°', kb: 'decimal', sol: '$\\frac{180° \\cdot ' + (n - 2) + '}{' + n + '}$' } : { q: 'Найдите внешний угол правильного ' + n + '-угольника.', a: 360 / n, unit: '°', kb: 'decimal', sol: '$360° : ' + n + '$' };
    return R.int(0, 1) ? { q: 'Сумма углов многоугольника ' + 180 * (n - 2) + '°. Сколько у него сторон?', a: n, kb: 'numeric' } : { q: 'Внешний угол правильного многоугольника ' + R.num(360 / n) + '°. Сколько у него сторон?', a: n, kb: 'numeric' };
  }, 'многоугольник углы');

  D(4, 'polygons', 'd-dist', '📍', 'Координаты: длина и середина', 'Расстояние между точками и середина отрезка.', ['Середина отрезка', 'Длина отрезка', 'Найти конец отрезка'], (lv, R) => {
    const x1 = R.int(-8, 8), y1 = R.int(-8, 8);
    if (lv === 1) { const x2 = x1 + 2 * R.int(-5, 5), y2 = y1 + 2 * R.int(-5, 5); return { q: 'Найдите середину отрезка $A(' + x1 + ';\\ ' + y1 + ')$, $B(' + x2 + ';\\ ' + y2 + ')$.', a: [(x1 + x2) / 2, (y1 + y2) / 2], ordered: true, ph: 'x; y', show: '(' + (x1 + x2) / 2 + '; ' + (y1 + y2) / 2 + ')' }; }
    if (lv === 2) { const [p, q, c] = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5], [12, 5, 13], [1, 1, Math.SQRT2], [2, 1, Math.sqrt(5)]]); const sx = R.pick([1, -1]), sy = R.pick([1, -1]); return { q: 'Найдите длину отрезка $A(' + x1 + ';\\ ' + y1 + ')$, $B(' + (x1 + sx * p) + ';\\ ' + (y1 + sy * q) + ')$.', a: c, tol: 0.006 * c, show: Number.isInteger(c) ? String(c) : '$\\sqrt{' + (p * p + q * q) + '}$', sol: '$\\sqrt{' + p * p + ' + ' + q * q + '}$' }; }
    const mx = R.int(-6, 6), my = R.int(-6, 6); return { q: '$M(' + mx + ';\\ ' + my + ')$ — середина отрезка $AB$, $A(' + x1 + ';\\ ' + y1 + ')$. Найдите $B$.', a: [2 * mx - x1, 2 * my - y1], ordered: true, ph: 'x; y', show: '(' + (2 * mx - x1) + '; ' + (2 * my - y1) + ')', sol: '$x_B = 2x_M - x_A$' };
  }, 'координаты расстояние середина');

  D(4, 'solids', 'd-solids', '🧊', 'Объёмы тел', 'Цилиндр, конус, шар, пирамида. Можно отвечать с π: 36π.', ['Цилиндр и призма', 'Конус и пирамида', 'Шар'], (lv, R) => {
    const r = R.int(1, 10), h = R.int(1, 15);
    if (lv === 1) { if (R.int(0, 1)) return { q: 'Цилиндр: $r = ' + r + '$, $h = ' + h + '$. Найдите объём.', a: Math.PI * r * r * h, tol: 0.006 * Math.PI * r * r * h, show: '$' + r * r * h + '\\pi$', sol: '$V = \\pi r^2 h$' }; const a = R.int(2, 10), b = R.int(2, 10); return { q: 'Прямая призма, в основании прямоугольный треугольник с катетами ' + a + ' и ' + b + ', высота ' + h + '. Объём?', a: a * b / 2 * h, kb: 'decimal', sol: '$V = \\frac{' + a + ' \\cdot ' + b + '}{2} \\cdot ' + h + '$' }; }
    if (lv === 2) { if (R.int(0, 1)) { const hh = 3 * R.int(1, 5); return { q: 'Конус: $r = ' + r + '$, $h = ' + hh + '$. Найдите объём.', a: Math.PI * r * r * hh / 3, tol: 0.006 * Math.PI * r * r * hh / 3, show: '$' + r * r * hh / 3 + '\\pi$', sol: '$V = \\frac{1}{3}\\pi r^2 h$' }; } const a = R.int(2, 10), hh = 3 * R.int(1, 6); return { q: 'Пирамида с квадратным основанием ' + a + ' × ' + a + ' и высотой ' + hh + '. Объём?', a: a * a * hh / 3, kb: 'numeric', sol: '$\\frac{1}{3} \\cdot ' + a * a + ' \\cdot ' + hh + '$' }; }
    const rr = 3 * R.int(1, 4); return R.int(0, 1) ? { q: 'Шар радиуса ' + rr + '. Найдите объём.', a: 4 / 3 * Math.PI * rr ** 3, tol: 0.006 * 4 / 3 * Math.PI * rr ** 3, show: '$' + 4 * rr ** 3 / 3 + '\\pi$', sol: '$V = \\frac{4}{3}\\pi r^3$' } : { q: 'Шар радиуса ' + rr + '. Найдите площадь поверхности.', a: 4 * Math.PI * rr * rr, tol: 0.006 * 4 * Math.PI * rr * rr, show: '$' + 4 * rr * rr + '\\pi$', sol: '$S = 4\\pi r^2$' };
  }, 'объём цилиндр конус шар');
  /* ——— Курс V ——— */
  D(5, 'rootn', 'd-ratpow', 'ⁿ√', 'Корни и дробные степени', 'Вычислите корень n-й степени или степень с дробным показателем.', ['Корни', 'Дробный показатель', 'Отрицательный показатель'], (lv, R) => {
    const base = R.pick([2, 3, 4, 5]), n = R.pick(base === 2 ? [2, 3, 4, 5] : base === 3 ? [2, 3, 4] : [2, 3]), m = R.int(1, 3);
    if (lv === 1) { const neg = n % 2 && R.int(0, 1); return { q: '$\\sqrt[' + n + ']{' + (neg ? -1 : 1) * base ** n + '}$', a: (neg ? -1 : 1) * base, sol: '$' + R.signed((neg ? -1 : 1) * base) + '^{' + n + '} = ' + (neg ? -1 : 1) * base ** n + '$' }; }
    if (lv === 2) return { q: '$' + base ** n + '^{\\frac{' + m + '}{' + n + '}}$', a: base ** m, sol: '$(\\sqrt[' + n + ']{' + base ** n + '})^{' + m + '} = ' + base + '^{' + m + '}$' };
    return { q: '$' + base ** n + '^{-\\frac{' + m + '}{' + n + '}}$ (ответ дробью)', a: 1 / base ** m, show: '$\\frac{1}{' + base ** m + '}$', sol: '$\\frac{1}{' + base + '^{' + m + '}}$' };
  }, 'корень степень');

  D(5, 'intervals', 'd-quadineq', '⇔', 'Квадратные и дробные неравенства', 'Сколько целых решений? Или выберите промежуток.', ['Выбор промежутка', 'Число целых решений', 'Метод интервалов'], (lv, R) => {
    const p = R.int(-6, 3), q = p + R.int(1, 7); const P = R.poly([1, -(p + q), p * q]);
    if (lv === 1) { const less = R.int(0, 1), st = R.int(0, 1); const L = st ? '(' : '[', Rr = st ? ')' : ']'; const op = less ? (st ? '<' : '\\le') : (st ? '>' : '\\ge'); const inside = '$' + L + p + ';\\ ' + q + Rr + '$', outside = '$(-\\infty;\\ ' + p + Rr + ' \\cup ' + L + q + ';\\ \\infty)$'; return { q: 'Решите: $' + P + ' ' + op + ' 0$', opts: less ? [inside, outside, '$(' + (-q) + ';\\ ' + (-p) + ')$', '$[' + p + ';\\ \\infty)$', '$(' + (p - 1) + ';\\ ' + (q + 1) + ')$'].filter((v, i, s2) => s2.indexOf(v) === i).slice(0, 4) : [outside, inside, '$(-\\infty;\\ ' + (-q) + ') \\cup (' + (-p) + ';\\ \\infty)$', '$(' + q + ';\\ \\infty)$', '$[' + (p - 1) + ';\\ ' + (q + 1) + ']$'].filter((v, i, s2) => s2.indexOf(v) === i).slice(0, 4), sol: 'Корни ' + p + ' и ' + q + ', ветви вверх: ' + (less ? 'между корнями.' : 'вне корней.') }; }
    if (lv === 2) return { q: 'Сколько целых решений у неравенства $' + P + ' \\le 0$?', a: q - p + 1, kb: 'numeric', sol: 'Решение $[' + p + ';\\ ' + q + ']$: целые от ' + p + ' до ' + q + '.' };
    const a = R.int(-5, 2), b = a + R.int(2, 7); return { q: 'Сколько целых решений у неравенства $\\frac{x' + R.term(-a, '') + '}{x' + R.term(-b, '') + '} \\le 0$?', a: b - a, kb: 'numeric', sol: 'Решение $[' + a + ';\\ ' + b + ')$ — знаменатель не может быть нулём.' };
  }, 'неравенство метод интервалов');

  D(5, 'abs', 'd-abs', '| |', 'Уравнения с модулем', 'Корни через «;». Нет решений — «нет».', ['$|x - a| = b$', '$|kx + m| = b$', 'Неравенства'], (lv, R) => {
    const a = R.int(-9, 9), b = R.int(0, 9);
    if (lv === 1) { if (R.int(0, 6) === 0) return { q: 'Решите: $|x' + R.term(-a, '') + '| = ' + (-b - 1) + '$', a: [], sol: 'Модуль не бывает отрицательным.' }; return { q: 'Решите: $|x' + R.term(-a, '') + '| = ' + b + '$', a: b ? [a - b, a + b] : [a], sol: 'Точки на расстоянии ' + b + ' от ' + a + '.' }; }
    if (lv === 2) { const k = R.int(2, 4), x1 = R.int(-6, 6), x2 = x1 + R.int(1, 4); const m = -(k * (x1 + x2)) / 2; if (!Number.isInteger(m) && !Number.isInteger(2 * m)) return null; const bb = k * (x2 - x1) / 2; return { q: 'Решите: $|' + k + 'x' + R.term(m, '') + '| = ' + R.tn(bb) + '$', a: [x1, x2], sol: '$' + k + 'x' + R.term(m, '') + ' = \\pm ' + R.tn(bb) + '$' }; }
    const lt = R.int(0, 1); const bb = R.int(1, 7);
    return lt ? { q: 'Сколько целых решений у $|x' + R.term(-a, '') + '| \\le ' + bb + '$?', a: 2 * bb + 1, kb: 'numeric', sol: '$' + (a - bb) + ' \\le x \\le ' + (a + bb) + '$' } : { q: 'Найдите наибольшее целое отрицательное решение $|x' + R.term(-a, '') + '| > ' + bb + '$.', a: Math.min(-1, a - bb - 1), sol: '$x < ' + (a - bb) + '$ или $x > ' + (a + bb) + '$' };
  }, 'модуль');

  D(5, 'irrational', 'd-irr', '√=', 'Иррациональные уравнения', 'Не забудьте проверку — посторонние корни отбрасываются.', ['$\\sqrt{ax + b} = c$', '$\\sqrt{f} = x + m$', 'Два корня'], (lv, R) => {
    if (lv === 1) { const x = R.int(-5, 15), a = R.int(1, 4); const c = R.int(1, 7); const b = c * c - a * x; return { q: 'Решите: $\\sqrt{' + R.poly([a, b]) + '} = ' + c + '$', a: [x], sol: '$' + R.poly([a, b]) + ' = ' + c * c + '$' }; }
    if (lv === 2) { const r = R.int(0, 8), m = R.int(-4, 3); if (r + m < 0) return null; const s = R.int(-9, 9); // x + m = sqrt(f), f = (x+m)^2 with extra root s: f(x) = (x+m)^2 + ... use quadratic with roots r and s
      // уравнение: sqrt(px + t) = x + m, где (x + m)^2 = px + t имеет корни r и s
      const p = (r + m) ** 2 - (s + m) ** 2; if (r === s || p % (r - s)) return null; const pp = p / (r - s), t = (r + m) ** 2 - pp * r; if ((s + m) ** 2 !== pp * s + t) return null;
      const good = [r, ...(s + m >= 0 ? [s] : [])];
      return { q: 'Решите: $\\sqrt{' + R.poly([pp, t]) + '} = x' + R.term(m, '') + '$', a: good, sol: 'Возводим в квадрат: $' + R.poly([1, 2 * m - pp, m * m - t]) + ' = 0$, корни ' + r + ' и ' + s + '. ' + (s + m < 0 ? 'Корень ' + s + ' посторонний (правая часть отрицательна).' : 'Оба подходят.') };
    }
    const x = R.int(1, 12), a = R.int(2, 4), b = R.int(-5, 5), c = a * x + b - x; if (a * x + b < 0) return null;
    return { q: 'Решите: $\\sqrt{' + R.poly([a, b]) + '} = \\sqrt{x' + R.term(c, '') + '}$', a: [x], sol: '$' + R.poly([a, b]) + ' = x' + R.term(c, '') + '$, проверяем, что подкоренные выражения $\\ge 0$.' };
  }, 'иррациональное уравнение');

  D(5, 'functions', 'd-func', 'ƒ', 'Свойства функций', 'Значение, сложная и обратная функция, область определения.', ['Значение функции', 'Сложная функция', 'Обратная функция'], (lv, R) => {
    const a = R.nz(-4, 4), b = R.int(-6, 6), c = R.nz(-3, 3), d = R.int(-5, 5), x = R.int(-4, 4);
    if (lv === 1) { if (R.int(0, 1)) return { q: '$f(x) = ' + R.poly([1, a, b]) + '$. Найдите $f(' + x + ')$.', a: x * x + a * x + b }; const k = R.int(1, 9); return { q: 'Найдите наименьшее целое $x$ из области определения $f(x) = \\sqrt{' + R.poly([1, -k]) + '}$.', a: k, sol: '$x - ' + k + ' \\ge 0$' }; }
    if (lv === 2) return { q: '$f(x) = ' + R.poly([a, b]) + '$, $g(x) = ' + R.poly([c, 0, d]) + '$. Найдите $f(g(' + x + '))$.', a: a * (c * x * x + d) + b, sol: '$g(' + x + ') = ' + (c * x * x + d) + '$' };
    const y = R.int(-10, 10); const k = R.nz(-5, 5), m = R.int(-9, 9); return { q: '$f(x) = ' + R.poly([k, m]) + '$. Найдите $f^{-1}(' + (k * y + m) + ')$.', a: y, sol: 'Решаем $' + R.poly([k, m]) + ' = ' + (k * y + m) + '$.' };
  }, 'функция область определения обратная');

  D(5, 'exponential', 'd-expeq', 'aˣ', 'Показательные уравнения', 'Приведите к одному основанию.', ['$a^x = b$', 'Разные основания', 'Замена переменной'], (lv, R) => {
    const base = R.pick([2, 3, 5]), x = R.int(-3, 6);
    if (lv === 1) { const sh = R.int(-3, 3); const e = x + sh; if (e < -3 || e > 7) return null; const v = base ** e; return { q: 'Решите: $' + base + '^{x' + R.term(sh, '') + '} = ' + (e >= 0 ? v : '\\frac{1}{' + base ** -e + '}') + '$', a: x, sol: '$' + base + '^{x' + R.term(sh, '') + '} = ' + base + '^{' + e + '}$' }; }
    if (lv === 2) { const [p, k1, k2] = R.pick([[2, 2, 3], [2, 3, 2], [3, 2, 3], [2, 4, 3], [3, 3, 2]]); const A = p ** k1, B = p ** k2; const xx = R.int(-3, 3) * k2; const rhs = k1 * xx / k2; if (!Number.isInteger(rhs)) return null; return { q: 'Решите: $' + A + '^{x} = ' + B + '^{' + rhs + '}$', a: xx, sol: '$' + p + '^{' + k1 + 'x} = ' + p + '^{' + k2 * rhs + '}$' }; }
    const t1 = R.int(0, 3), t2 = R.int(0, 3); const s = 2 ** t1 + 2 ** t2, pr = 2 ** (t1 + t2);
    return { q: 'Решите: $4^x - ' + s + ' \\cdot 2^x + ' + pr + ' = 0$', a: t1 === t2 ? [t1] : [t1, t2], sol: '$t = 2^x$: $t^2 - ' + s + 't + ' + pr + ' = 0$, $t = ' + 2 ** t1 + '$ или $' + 2 ** t2 + '$.' };
  }, 'показательное уравнение');

  D(5, 'logarithm', 'd-log', 'log', 'Вычисление логарифмов', 'Определение и свойства логарифма.', ['По определению', 'Свойства', 'Новое основание'], (lv, R) => {
    const b = R.pick([2, 3, 5, 10]), k = R.int(-3, b === 10 ? 4 : 5);
    const val = b ** k, vs = k >= 0 ? String(val) : '\\frac{1}{' + b ** -k + '}';
    if (lv === 1) return { q: '$' + (b === 10 ? '\\lg ' : '\\log_{' + b + '} ') + vs + '$', a: k, sol: '$' + b + '^{' + k + '} = ' + vs + '$' };
    if (lv === 2) { const t = R.int(0, 2); if (t === 0) { const [x, y] = R.pick([[2, 5], [4, 25], [20, 5], [2, 50], [8, 125]]); return { q: '$\\lg ' + x + ' + \\lg ' + y + '$', a: Math.log10(x * y), sol: '$\\lg ' + x * y + '$' }; } if (t === 1) { const m = R.int(2, 9); return { q: '$\\log_{' + b + '} ' + b ** 2 * m + ' - \\log_{' + b + '} ' + m + '$', a: 2, sol: '$\\log_{' + b + '} ' + b * b + '$' }; } return { q: '$' + b + '^{\\log_{' + b + '} ' + (k + 9) + '}$', a: k + 9, sol: 'Основное логарифмическое тождество.' }; }
    const [p, m, n] = R.pick([[2, 3, 2], [2, 2, 3], [3, 3, 2], [2, 4, 2], [2, 5, 2], [3, 1, 2]]); return { q: '$\\log_{' + p ** n + '} ' + p ** m + '$', a: m / n, show: '$' + R.frac(m, n) + '$', sol: '$\\frac{\\log_' + p + ' ' + p ** m + '}{\\log_' + p + ' ' + p ** n + '} = \\frac{' + m + '}{' + n + '}$' };
  }, 'логарифм');

  D(5, 'logeq', 'd-logeq', 'log=', 'Логарифмические уравнения', 'Помните про ОДЗ: аргумент логарифма > 0.', ['$\\log_a f = c$', 'Сумма логарифмов', 'Неравенства'], (lv, R) => {
    const b = R.pick([2, 3, 5]), c = R.int(0, b === 2 ? 5 : 3);
    if (lv === 1) { const k = R.int(1, 3), m = R.int(-6, 6); const v = b ** c - m; if (v % k) return null; return { q: 'Решите: $\\log_{' + b + '}(' + R.poly([k, m]) + ') = ' + c + '$', a: v / k, sol: '$' + R.poly([k, m]) + ' = ' + b + '^{' + c + '} = ' + b ** c + '$' }; }
    if (lv === 2) { const [bb, x, sh, rhs] = R.pick([[2, 1, 1, 1], [2, 2, 2, 3], [2, 1, 3, 2], [2, 2, 6, 4], [2, 4, 4, 5], [2, 4, 12, 6], [3, 1, 2, 1], [3, 1, 8, 2], [3, 3, 6, 3], [5, 1, 4, 1], [5, 1, 24, 2], [5, 5, 20, 3], [2, 8, 8, 7], [3, 3, 24, 4]]);
      return { q: 'Решите: $\\log_{' + bb + '} x + \\log_{' + bb + '}(x + ' + sh + ') = ' + rhs + '$', a: [x], sol: 'ОДЗ: $x > 0$. $x(x + ' + sh + ') = ' + bb ** rhs + '$, корни ' + x + ' и ' + (-sh - x) + '; отрицательный не входит в ОДЗ.' }; }
    const k = R.int(1, 4); return { q: 'Сколько целых решений у неравенства $\\log_{' + b + '} x \\le ' + k + '$?', a: b ** k, kb: 'numeric', sol: '$0 < x \\le ' + b ** k + '$' };
  }, 'логарифмическое уравнение');

  D(5, 'arithseq', 'd-arith', '➕…', 'Арифметическая прогрессия', 'n-й член, разность, сумма.', ['n-й член', 'Разность и номер', 'Сумма'], (lv, R) => {
    const a1 = R.int(-10, 15), d = R.nz(-6, 7), n = R.int(5, 30);
    const seq = [0, 1, 2].map(i => a1 + i * d).join(';\\ ');
    if (lv === 1) return { q: 'Найдите $a_{' + n + '}$ прогрессии $' + seq + ';\\ \\ldots$', a: a1 + (n - 1) * d, sol: '$a_{' + n + '} = ' + a1 + ' + ' + (n - 1) + ' \\cdot ' + R.signed(d) + '$' };
    if (lv === 2) { const m = n + R.int(2, 8); if (R.int(0, 1)) return { q: '$a_{' + n + '} = ' + (a1 + (n - 1) * d) + '$, $a_{' + m + '} = ' + (a1 + (m - 1) * d) + '$. Найдите разность $d$.', a: d, sol: '$' + (m - n) + 'd = ' + (m - n) * d + '$' }; return { q: 'Какой номер у члена ' + (a1 + (n - 1) * d) + ' в прогрессии $' + seq + ';\\ \\ldots$?', a: n, kb: 'numeric', sol: '$' + a1 + ' + (n - 1) \\cdot ' + R.signed(d) + ' = ' + (a1 + (n - 1) * d) + '$' }; }
    if (R.int(0, 2) === 0) { const N = R.pick([10, 20, 50, 100, 30, 40]); return { q: 'Найдите сумму $1 + 2 + 3 + \\ldots + ' + N + '$.', a: N * (N + 1) / 2, kb: 'numeric', sol: '$\\frac{' + N + ' \\cdot ' + (N + 1) + '}{2}$' }; }
    const an = a1 + (n - 1) * d; return { q: 'Найдите сумму первых ' + n + ' членов прогрессии $' + seq + ';\\ \\ldots$', a: (a1 + an) * n / 2, sol: '$a_{' + n + '} = ' + an + '$, $S = \\frac{(' + a1 + ' + ' + R.signed(an) + ') \\cdot ' + n + '}{2}$' };
  }, 'арифметическая прогрессия');

  D(5, 'geomseq', 'd-geom', '✖…', 'Геометрическая прогрессия', 'n-й член, сумма, бесконечная сумма.', ['n-й член', 'Сумма', 'Бесконечная сумма'], (lv, R) => {
    const b1 = R.nz(-5, 6), q = R.pick([2, 3, -2, -3, 2]), n = R.int(3, 7);
    const seq = [0, 1, 2].map(i => b1 * q ** i).join(';\\ ');
    if (lv === 1) return { q: 'Найдите $b_{' + n + '}$ прогрессии $' + seq + ';\\ \\ldots$', a: b1 * q ** (n - 1), sol: '$b_{' + n + '} = ' + b1 + ' \\cdot ' + R.signed(q) + '^{' + (n - 1) + '}$' };
    if (lv === 2) return { q: 'Найдите сумму первых ' + n + ' членов прогрессии $' + seq + ';\\ \\ldots$', a: b1 * (q ** n - 1) / (q - 1), sol: '$S = \\frac{' + b1 + '(' + R.signed(q) + '^{' + n + '} - 1)}{' + q + ' - 1}$' };
    const [qn, qd] = R.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [-1, 2], [-1, 3]]); const B = R.int(1, 9) * qd;
    return { q: 'Найдите сумму бесконечно убывающей прогрессии: $b_1 = ' + B + '$, $q = ' + R.frac(qn, qd) + '$.', a: B / (1 - qn / qd), show: '$' + R.frac(B * qd, qd - qn) + '$', sol: '$S = \\frac{' + B + '}{1 - (' + R.frac(qn, qd) + ')}$' };
  }, 'геометрическая прогрессия');
  /* ——— Курс VI ——— */
  const ANG = [[0, '0'], [30, '\\frac{\\pi}{6}'], [45, '\\frac{\\pi}{4}'], [60, '\\frac{\\pi}{3}'], [90, '\\frac{\\pi}{2}'], [120, '\\frac{2\\pi}{3}'], [135, '\\frac{3\\pi}{4}'], [150, '\\frac{5\\pi}{6}'], [180, '\\pi'], [210, '\\frac{7\\pi}{6}'], [225, '\\frac{5\\pi}{4}'], [240, '\\frac{4\\pi}{3}'], [270, '\\frac{3\\pi}{2}'], [300, '\\frac{5\\pi}{3}'], [315, '\\frac{7\\pi}{4}'], [330, '\\frac{11\\pi}{6}'], [360, '2\\pi']];
  const exact = v => { const t = [[0, '0'], [0.5, '\\frac{1}{2}'], [Math.SQRT2 / 2, '\\frac{\\sqrt{2}}{2}'], [Math.sqrt(3) / 2, '\\frac{\\sqrt{3}}{2}'], [1, '1'], [Math.sqrt(3), '\\sqrt{3}'], [Math.sqrt(3) / 3, '\\frac{\\sqrt{3}}{3}']]; for (const [x, s] of t) { if (Math.abs(Math.abs(v) - x) < 1e-9) return (v < -1e-12 ? '-' : '') + s; } return PLATFORM.R.tn(PLATFORM.R.round(v, 4)); };
  D(6, 'unitcircle', 'd-rad', '◜', 'Градусы и радианы', 'Перевод мер угла и длина дуги. Ответ можно с π: 3π/4.', ['Градусы → радианы', 'Радианы → градусы', 'Длина дуги'], (lv, R) => {
    const [d, t] = R.pick(ANG.slice(1));
    if (lv === 1) return { q: 'Запишите ' + d + '° в радианах.', a: d * Math.PI / 180, show: '$' + t + '$', sol: '$' + d + '° \\cdot \\frac{\\pi}{180°}$' };
    if (lv === 2) return { q: 'Запишите $' + t + '$ в градусах.', a: d, unit: '°', kb: 'numeric', sol: '$\\pi = 180°$' };
    const r = R.int(2, 12); return { q: 'Радиус ' + r + ' см, центральный угол $' + t + '$. Найдите длину дуги.', a: r * d * Math.PI / 180, tol: 0.006 * r * d * Math.PI / 180, show: '$' + R.frac(r * d, 180).replace(/^(\d+)$/, '$1') + '\\pi$', unit: 'см', sol: '$l = r\\alpha$' };
  }, 'радиан градус');

  D(6, 'unitcircle', 'd-unit', '⭕', 'Значения sin, cos, tan', 'Табличные значения для любых углов. Пишите с корнем: −√3/2.', ['Первая четверть', 'Все четверти', 'Радианы и отрицательные углы'], (lv, R) => {
    const pool = lv === 1 ? ANG.slice(0, 5) : ANG; const [d, t] = R.pick(pool); const f = R.int(0, 2);
    const rad = d * Math.PI / 180; const v = [Math.sin(rad), Math.cos(rad), Math.tan(rad)][f];
    if (f === 2 && Math.abs(Math.cos(rad)) < 1e-9) return null;
    const nm = ['\\sin', '\\cos', '\\tan'][f]; const neg = lv === 3 && R.int(0, 1);
    const arg = lv === 3 ? (neg ? '\\left(-' + t + '\\right)' : t) : d + '°'; const val = neg ? (f === 1 ? v : -v) : v;
    return { q: '$' + nm + ' ' + arg + ' = \;?$', a: R.round(val, 9), tol: 1e-4, show: '$' + exact(val) + '$', sol: lv > 1 ? 'Найдите точку на единичной окружности и определите знак по четверти.' : '' };
  }, 'синус косинус значения');

  D(6, 'trigformulas', 'd-trigid', '≡', 'Тригонометрические тождества', 'По одной функции найдите другую с учётом четверти.', ['Острый угол', 'Любая четверть', 'Двойной угол'], (lv, R) => {
    const [p, q, h] = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]); const s0 = p / h, c0 = q / h;
    if (lv === 1) return { q: '$\\sin\\alpha = ' + R.frac(p, h) + '$, $\\alpha$ — острый угол. Найдите $\\cos\\alpha$.', a: c0, show: '$' + R.frac(q, h) + '$', sol: '$\\cos\\alpha = \\sqrt{1 - ' + R.frac(p * p, h * h) + '}$' };
    const quad = R.int(2, 4); const sx = quad === 2 ? -1 : quad === 3 ? -1 : 1, sy = quad === 4 ? -1 : quad === 3 ? -1 : 1; const qn = ['', 'I', 'II', 'III', 'IV'][quad];
    if (lv === 2) { if (R.int(0, 1)) return { q: '$\\sin\\alpha = ' + R.frac(sy * p, h) + '$, $\\alpha$ в ' + qn + ' четверти. Найдите $\\cos\\alpha$.', a: sx * c0, show: '$' + R.frac(sx * q, h) + '$', sol: 'В ' + qn + ' четверти косинус ' + (sx > 0 ? 'положителен' : 'отрицателен') + '.' }; return { q: '$\\cos\\alpha = ' + R.frac(sx * q, h) + '$, $\\alpha$ в ' + qn + ' четверти. Найдите $\\tan\\alpha$.', a: sy * p / (sx * q), show: '$' + R.frac(sy * p, sx * q) + '$', sol: '$\\sin\\alpha = ' + R.frac(sy * p, h) + '$' }; }
    return R.int(0, 1) ? { q: '$\\sin\\alpha = ' + R.frac(p, h) + '$, $\\cos\\alpha = ' + R.frac(q, h) + '$. Найдите $\\sin 2\\alpha$.', a: 2 * s0 * c0, show: '$' + R.frac(2 * p * q, h * h) + '$', sol: '$2\\sin\\alpha\\cos\\alpha$' } : { q: '$\\sin\\alpha = ' + R.frac(p, h) + '$, $\\cos\\alpha = ' + R.frac(q, h) + '$. Найдите $\\cos 2\\alpha$.', a: c0 * c0 - s0 * s0, show: '$' + R.frac(q * q - p * p, h * h) + '$', sol: '$\\cos^2\\alpha - \\sin^2\\alpha$' };
  }, 'тождество двойной угол');

  const piFrac = (n, B) => { const [nn, dd] = B === 0.5 ? [2 * n, 1] : [n, B]; const g = PLATFORM.R.gcd(nn, dd); const a = nn / g, b = dd / g; return b === 1 ? (a === 1 ? '' : a) + '\\pi' : '\\frac{' + (a === 1 ? '' : a) + '\\pi}{' + b + '}'; };
  D(6, 'trig-graphs', 'd-trigfunc', '〰️', 'Свойства тригонометрических функций', 'Период, наибольшее и наименьшее значения. Ответ с π: 2π/3.', ['Период', 'Наибольшее/наименьшее', 'Амплитуда и средняя линия'], (lv, R) => {
    const A = R.nz(-5, 5), B = R.pick([1, 2, 3, 4, 0.5, 6]), Dd = R.int(-4, 4), f = R.pick(['\\sin', '\\cos']);
    const ex = '$y = ' + (A === 1 ? '' : A === -1 ? '-' : A) + f + '(' + (B === 1 ? '' : R.tn(B)) + 'x)' + R.term(Dd, '') + '$';
    if (lv === 1) { const tanq = R.int(0, 3) === 0; if (tanq) return { q: 'Найдите период $y = \\tan ' + (B === 1 ? '' : R.tn(B)) + 'x$.', a: Math.PI / B, show: '$' + piFrac(1, B) + '$', sol: 'Период тангенса $\\frac{\\pi}{|B|}$.' }; return { q: 'Найдите период ' + ex, a: 2 * Math.PI / B, show: '$' + piFrac(2, B) + '$', sol: '$T = \\frac{2\\pi}{' + R.tn(B) + '}$' }; }
    if (lv === 2) { const mx = R.int(0, 1); return { q: 'Найдите ' + (mx ? 'наибольшее' : 'наименьшее') + ' значение ' + ex, a: mx ? Math.abs(A) + Dd : Dd - Math.abs(A), sol: 'Синус и косинус меняются от −1 до 1.' }; }
    return R.int(0, 1) ? { q: 'Найдите амплитуду ' + ex, a: Math.abs(A) } : { q: 'Найдите среднюю линию $y = c$ для ' + ex + ' (введите $c$).', a: Dd };
  }, 'период амплитуда');

  D(6, 'trigeq', 'd-trigeq', '⟲', 'Тригонометрические уравнения', 'Все решения на [0°; 360°) в градусах через «;».', ['sin x = a, cos x = a', 'tan x = a', 'Квадратные'], (lv, R) => {
    const deg = x => ((Math.round(x) % 360) + 360) % 360;
    const sols = (f, v) => { const out = []; for (let d = 0; d < 360; d += 15) { const r = d * Math.PI / 180; const y = f === 's' ? Math.sin(r) : f === 'c' ? Math.cos(r) : (Math.abs(Math.cos(r)) < 1e-9 ? NaN : Math.tan(r)); if (Math.abs(y - v) < 1e-9) out.push(d); } return out; };
    const V = [[0, '0'], [0.5, '\\frac{1}{2}'], [-0.5, '-\\frac{1}{2}'], [Math.SQRT2 / 2, '\\frac{\\sqrt{2}}{2}'], [-Math.SQRT2 / 2, '-\\frac{\\sqrt{2}}{2}'], [Math.sqrt(3) / 2, '\\frac{\\sqrt{3}}{2}'], [-Math.sqrt(3) / 2, '-\\frac{\\sqrt{3}}{2}'], [1, '1'], [-1, '-1']];
    if (lv === 1) { const f = R.pick(['s', 'c']); const [v, t] = R.pick(V); return { q: 'Решите на $[0°;\\ 360°)$: $' + (f === 's' ? '\\sin' : '\\cos') + ' x = ' + t + '$', a: sols(f, v), unit: '°', sol: 'По единичной окружности: ' + (f === 's' ? 'горизонталь $y = ' + t + '$' : 'вертикаль $x = ' + t + '$') + '.' }; }
    if (lv === 2) { const [v, t] = R.pick([[1, '1'], [-1, '-1'], [Math.sqrt(3), '\\sqrt{3}'], [-Math.sqrt(3), '-\\sqrt{3}'], [Math.sqrt(3) / 3, '\\frac{\\sqrt{3}}{3}'], [0, '0']]); return { q: 'Решите на $[0°;\\ 360°)$: $\\tan x = ' + t + '$', a: sols('t', v), unit: '°', sol: 'Период тангенса 180°: второе решение на 180° больше первого.' }; }
    const [t1, t2, tex] = R.pick([[1, -0.5, '2\\sin^2 x - \\sin x - 1 = 0'], [0, 0.5, '2\\sin^2 x - \\sin x = 0'], [0, 1, '\\cos^2 x - \\cos x = 0'], [0.5, -1, '2\\cos^2 x + \\cos x - 1 = 0']]); const f = tex.includes('sin') ? 's' : 'c';
    return { q: 'Решите на $[0°;\\ 360°)$: $' + tex + '$', a: [...new Set([...sols(f, t1), ...sols(f, t2)])], unit: '°', sol: 'Замена $t = ' + (f === 's' ? '\\sin x' : '\\cos x') + '$: $t = ' + R.tn(t1) + '$ или $t = ' + R.tn(t2) + '$.' };
  }, 'тригонометрическое уравнение');

  D(6, 'sinecosine', 'd-sincos', '◭', 'Теоремы синусов и косинусов', 'Сторона, угол и площадь произвольного треугольника.', ['Теорема косинусов', 'Площадь', 'Теорема синусов'], (lv, R) => {
    const a = R.int(2, 12), b = R.int(2, 12);
    if (lv === 1) { const [g, cg] = R.pick([[60, 0.5], [120, -0.5], [90, 0]]); const c2 = a * a + b * b - 2 * a * b * cg; const c = Math.sqrt(c2); return { q: '$a = ' + a + '$, $b = ' + b + '$, $\\gamma = ' + g + '°$. Найдите $c$.', a: c, tol: 0.006 * c, show: Number.isInteger(c) ? String(c) : '$\\sqrt{' + c2 + '} \\approx ' + R.tn(R.round(c, 2)) + '$', sol: '$c^2 = ' + a * a + ' + ' + b * b + ' - 2 \\cdot ' + a + ' \\cdot ' + b + ' \\cdot ' + R.tn(cg) + ' = ' + c2 + '$' }; }
    if (lv === 2) { const [g, sgn] = R.pick([[30, 0.5], [150, 0.5], [90, 1]]); return { q: 'Найдите площадь треугольника: стороны ' + a + ' и ' + b + ', угол между ними ' + g + '°.', a: a * b * sgn / 2, kb: 'decimal', sol: '$S = \\frac{1}{2} \\cdot ' + a + ' \\cdot ' + b + ' \\cdot \\sin ' + g + '°$' }; }
    const [A, sA] = R.pick([[30, 0.5], [90, 1], [150, 0.5]]); return { q: 'В треугольнике $a = ' + a + '$, $\\alpha = ' + A + '°$. Найдите радиус описанной окружности $R$.', a: a / (2 * sA), kb: 'decimal', sol: '$2R = \\frac{a}{\\sin\\alpha}$' };
  }, 'теорема косинусов синусов');

  D(6, 'vectors', 'd-vec', '→', 'Векторы', 'Координаты, длина, скалярное произведение.', ['Координаты и длина', 'Скалярное произведение', 'Перпендикулярность'], (lv, R) => {
    const ax = R.int(-6, 6), ay = R.int(-6, 6), bx = R.int(-6, 6), by = R.int(-6, 6);
    if (lv === 1) { if (R.int(0, 1)) return { q: 'Найдите координаты $\\overrightarrow{AB}$: $A(' + ax + ';\\ ' + ay + ')$, $B(' + bx + ';\\ ' + by + ')$.', a: [bx - ax, by - ay], ordered: true, ph: 'x; y', show: '(' + (bx - ax) + '; ' + (by - ay) + ')' }; const [p, q, c] = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [1, 1, Math.SQRT2], [2, 3, Math.sqrt(13)]]); const s1 = R.pick([1, -1]), s2 = R.pick([1, -1]); return { q: 'Найдите длину вектора $(' + s1 * p + ';\\ ' + s2 * q + ')$.', a: c, tol: 1e-4, show: Number.isInteger(c) ? String(c) : '$\\sqrt{' + (p * p + q * q) + '}$' }; }
    if (lv === 2) return { q: '$\\vec a = (' + ax + ';\\ ' + ay + ')$, $\\vec b = (' + bx + ';\\ ' + by + ')$. Найдите $\\vec a \\cdot \\vec b$.', a: ax * bx + ay * by, sol: '$' + ax + ' \\cdot ' + R.signed(bx) + ' + ' + R.signed(ay) + ' \\cdot ' + R.signed(by) + '$' };
    const p = R.nz(-6, 6), q = R.nz(-6, 6), m = R.nz(-4, 4); const k = -p * m / q; if (!Number.isInteger(k * 2)) return null;
    return { q: 'При каком $k$ векторы $(' + p + ';\\ ' + q + ')$ и $(' + m + ';\\ k)$ перпендикулярны?', a: k, kb: 'decimal', sol: '$' + p + ' \\cdot ' + R.signed(m) + ' + ' + R.signed(q) + 'k = 0$' };
  }, 'вектор');

  D(6, 'lineeq', 'd-line', '╱', 'Уравнение прямой', 'Наклон, перпендикуляр, расстояние от точки до прямой.', ['Через две точки', 'Перпендикулярная прямая', 'Расстояние'], (lv, R) => {
    const k = R.nz(-4, 4), b = R.int(-6, 6), x1 = R.int(-5, 3), x2 = x1 + R.int(1, 4);
    if (lv === 1) return { q: 'Прямая проходит через $(' + x1 + ';\\ ' + (k * x1 + b) + ')$ и $(' + x2 + ';\\ ' + (k * x2 + b) + ')$. Запишите её как $y = kx + b$: введите $k$; $b$.', a: [k, b], ordered: true, ph: 'k; b', show: '$y = ' + R.poly([k, b]) + '$' };
    if (lv === 2) { const x0 = R.int(-4, 4) * Math.abs(k), y0 = R.int(-5, 5); const kk = -1 / k; const bb = y0 - kk * x0; return { q: 'Прямая проходит через $(' + x0 + ';\\ ' + y0 + ')$ перпендикулярно $y = ' + R.poly([k, b]) + '$. Найдите её $b$ в записи $y = kx + b$.', a: bb, kb: 'decimal', sol: 'Наклон $' + R.frac(-1, k) + '$, $b = ' + y0 + ' - (' + R.frac(-1, k) + ') \\cdot ' + R.signed(x0) + '$' }; }
    const [A, B, N] = R.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10]]); const sA = R.pick([1, -1]); const x0 = R.int(-5, 5), y0 = R.int(-5, 5), dd = R.int(1, 6); const C = -(sA * A * x0 + B * y0) + dd * N * R.pick([1, -1]);
    return { q: 'Найдите расстояние от точки $(' + x0 + ';\\ ' + y0 + ')$ до прямой $' + R.term(sA * A, 'x', true) + R.term(B, 'y') + R.term(C, '') + ' = 0$.', a: dd, kb: 'decimal', sol: '$d = \\frac{|' + sA * A * x0 + ' + ' + R.signed(B * y0) + ' + ' + R.signed(C) + '|}{\\sqrt{' + A * A + ' + ' + B * B + '}}$' };
  }, 'прямая уравнение');

  D(6, 'circleeq', 'd-circleeq', '◯', 'Уравнение окружности', 'Центр и радиус: введите a; b; r.', ['Канонический вид', 'Выделение квадратов', 'Положение точки'], (lv, R) => {
    const a = R.int(-6, 6), b = R.int(-6, 6), r = R.int(1, 8);
    const sq = (v, s) => v === 0 ? s + '^2' : '(' + s + R.term(-v, '') + ')^2';
    if (lv === 1) return { q: 'Найдите центр и радиус: $' + sq(a, 'x') + ' + ' + sq(b, 'y') + ' = ' + r * r + '$', a: [a, b, r], ordered: true, ph: 'a; b; r', show: 'центр (' + a + '; ' + b + '), r = ' + r };
    if (lv === 2) return { q: 'Найдите центр и радиус: $x^2 + y^2' + R.term(-2 * a, 'x') + R.term(-2 * b, 'y') + R.term(a * a + b * b - r * r, '') + ' = 0$', a: [a, b, r], ordered: true, ph: 'a; b; r', show: 'центр (' + a + '; ' + b + '), r = ' + r, sol: 'Выделяем полные квадраты: $' + sq(a, 'x') + ' + ' + sq(b, 'y') + ' = ' + r * r + '$' };
    const px = a + R.int(-r - 2, r + 2), py = b + R.int(-r - 2, r + 2); const dd = (px - a) ** 2 + (py - b) ** 2; const pos = dd < r * r ? 'внутри' : dd === r * r ? 'на окружности' : 'снаружи';
    return { q: 'Где лежит точка $(' + px + ';\\ ' + py + ')$ относительно окружности $' + sq(a, 'x') + ' + ' + sq(b, 'y') + ' = ' + r * r + '$?', opts: [pos, ...['внутри', 'на окружности', 'снаружи'].filter(x => x !== pos)], sol: '$(' + px + R.term(-a, '') + ')^2 + (' + py + R.term(-b, '') + ')^2 = ' + dd + '$, сравниваем с $' + r * r + '$.' };
  }, 'окружность уравнение');
  /* ——— Курс VII ——— */
  const polyVal = (cs, x) => cs.reduce((s, c) => s * x + c, 0);
  const polyDer = cs => { const n = cs.length - 1; return cs.slice(0, -1).map((c, i) => c * (n - i)); };
  D(7, 'limit', 'd-limit', '→∞', 'Пределы', 'Подстановка, сокращение 0/0, предел на бесконечности.', ['Подстановка', 'Неопределённость 0/0', 'На бесконечности'], (lv, R) => {
    if (lv === 1) { const cs = [R.int(-3, 3), R.int(-5, 5), R.int(-9, 9)], a = R.int(-4, 4); return { q: '$\\lim_{x \\to ' + a + '}(' + R.poly(cs) + ')$', a: polyVal(cs, a), sol: 'Многочлен непрерывен — подставляем $x = ' + a + '$.' }; }
    if (lv === 2) { const a = R.nz(-6, 6), b = R.int(-6, 6); if (a === b) return null; return { q: '$\\lim_{x \\to ' + a + '}\\frac{' + R.poly([1, -(a + b), a * b]) + '}{x' + R.term(-a, '') + '}$', a: a - b, sol: 'Числитель $= (x' + R.term(-a, '') + ')(x' + R.term(-b, '') + ')$, сокращаем и подставляем.' }; }
    const p = R.nz(-9, 9), q = R.nz(-9, 9), deg = R.int(0, 2);
    if (deg === 0) return { q: '$\\lim_{x \\to \\infty}\\frac{' + R.poly([p, R.int(-9, 9), R.int(-9, 9)]) + '}{' + R.poly([q, R.int(-9, 9), R.nz(-9, 9)]) + '}$', a: p / q, show: '$' + R.frac(p, q) + '$', sol: 'Степени равны — отношение старших коэффициентов.' };
    return { q: '$\\lim_{x \\to \\infty}\\frac{' + R.poly([p, R.int(-9, 9)]) + '}{' + R.poly([q, R.int(-9, 9), R.nz(-9, 9)]) + '}$', a: 0, sol: 'Степень знаменателя больше — предел 0.' };
  }, 'предел');

  D(7, 'derivative', 'd-deriv1', "f'", 'Производная многочлена', 'Найдите значение производной в точке, скорость, наклон.', ['$ax^n$', 'Многочлен', 'Скорость и ускорение'], (lv, R) => {
    const x0 = R.int(-3, 3);
    if (lv === 1) { const a = R.nz(-5, 5), n = R.int(2, 5); return { q: "$f(x) = " + R.poly([a, ...Array(n).fill(0)]) + "$. Найдите $f'(" + x0 + ")$.", a: a * n * x0 ** (n - 1), sol: "$f'(x) = " + R.poly([a * n, ...Array(n - 1).fill(0)]) + '$' }; }
    if (lv === 2) { const cs = [R.int(-3, 3), R.int(-5, 5), R.int(-9, 9), R.int(-9, 9)]; const d = polyDer(cs); return { q: "$f(x) = " + R.poly(cs) + "$. Найдите $f'(" + x0 + ")$.", a: polyVal(d, x0), sol: "$f'(x) = " + R.poly(d) + '$' }; }
    const a = R.int(1, 5), b = R.int(-6, 6), c = R.int(0, 9), t = R.int(1, 5); if (R.int(0, 1)) return { q: 'Тело движется по закону $s(t) = ' + R.poly([a, b, c]) + '$ (м). Найдите скорость при $t = ' + t + '$ с.', a: 2 * a * t + b, unit: 'м/с', sol: "$v = s' = " + R.poly([2 * a, b]) + '$' };
    const k = R.int(1, 3); return { q: 'Тело движется по закону $s(t) = ' + R.poly([k, a, b, c]) + '$. Найдите ускорение при $t = ' + t + '$.', a: 6 * k * t + 2 * a, unit: 'м/с²', sol: "$a = s'' = " + R.poly([6 * k, 2 * a]) + '$' };
  }, 'производная скорость');

  D(7, 'diffrules', 'd-deriv', '∂', 'Правила дифференцирования', 'Выберите производную или вычислите её значение.', ['Таблица', 'Произведение и частное', 'Сложная функция'], (lv, R) => {
    if (lv === 1) { const T = [['x^{7}', '7x^{6}', ['x^{6}', '7x^{7}', '6x^{7}']], ['\\sqrt{x}', '\\frac{1}{2\\sqrt{x}}', ['\\frac{1}{\\sqrt{x}}', '2\\sqrt{x}', '\\frac{\\sqrt{x}}{2}']], ['\\frac{1}{x}', '-\\frac{1}{x^2}', ['\\ln x', '\\frac{1}{x^2}', '-\\frac{1}{x}']], ['e^x', 'e^x', ['xe^{x-1}', 'e^{x-1}', '\\ln x']], ['\\ln x', '\\frac{1}{x}', ['e^x', '\\frac{1}{\\ln x}', 'x\\ln x']], ['\\sin x', '\\cos x', ['-\\cos x', '-\\sin x', '\\tan x']], ['\\cos x', '-\\sin x', ['\\sin x', '-\\cos x', '\\cos x']], ['2^x', '2^x\\ln 2', ['x \\cdot 2^{x-1}', '2^x', '\\frac{2^x}{\\ln 2}']]]; const [f, d, w] = R.pick(T); return { q: "$(" + f + ")' = \;?$", opts: ['$' + d + '$', ...w.map(x => '$' + x + '$')] }; }
    const x0 = R.int(1, 3);
    if (lv === 2) { const a = R.int(1, 4), b = R.int(-3, 3); if (R.int(0, 1)) return { q: "$f(x) = (" + R.poly([1, b]) + ')(' + R.poly([a, 0, 1]) + ")$. Найдите $f'(" + x0 + ")$.", a: (a * x0 * x0 + 1) + (x0 + b) * 2 * a * x0, sol: "$f' = 1 \\cdot (" + R.poly([a, 0, 1]) + ') + (' + R.poly([1, b]) + ') \\cdot ' + 2 * a + 'x$' }; const c = R.int(1, 4); return { q: "$f(x) = \\frac{x}{x + " + c + "}$. Найдите $f'(" + x0 + ")$.", a: c / (x0 + c) ** 2, show: '$' + R.frac(c, (x0 + c) ** 2) + '$', sol: "$f' = \\frac{(x + " + c + ') - x}{(x + ' + c + ')^2}$' }; }
    const k = R.int(2, 5), m = R.int(-3, 3), n = R.int(2, 4); return { q: "$f(x) = (" + R.poly([k, m]) + ')^{' + n + "}$. Найдите $f'(" + (x0 - 1) + ")$.", a: n * (k * (x0 - 1) + m) ** (n - 1) * k, sol: "$f' = " + n + '(' + R.poly([k, m]) + ')^{' + (n - 1) + '} \\cdot ' + k + '$' };
  }, 'правила дифференцирования');

  D(7, 'tangent', 'd-tangent', '⟋', 'Уравнение касательной', 'Касательная y = kx + b: введите k; b.', ['Парабола', 'Кубическая', 'Наклон касательной'], (lv, R) => {
    const cs = lv === 2 ? [R.nz(-2, 2), R.int(-3, 3), R.int(-5, 5), R.int(-5, 5)] : [R.nz(-3, 3), R.int(-6, 6), R.int(-9, 9)];
    const x0 = R.int(-3, 3), y0 = polyVal(cs, x0), k = polyVal(polyDer(cs), x0), b = y0 - k * x0;
    if (lv < 3) return { q: 'Касательная к $y = ' + R.poly(cs) + '$ в точке $x_0 = ' + x0 + '$. Введите $k$; $b$.', a: [k, b], ordered: true, ph: 'k; b', show: '$y = ' + R.poly([k, b]) + '$', sol: "$f(" + x0 + ') = ' + y0 + "$, $f'(" + x0 + ') = ' + k + '$, $y = ' + y0 + ' + ' + R.signed(k) + '(x - ' + R.signed(x0) + ')$' };
    const a = R.nz(-3, 3), bb = R.int(-6, 6), kk = R.int(-8, 8); const xx = (kk - bb) / (2 * a); if (!Number.isInteger(2 * xx)) return null;
    return { q: 'В какой точке $x_0$ касательная к $y = ' + R.poly([a, bb, R.int(-5, 5)]) + '$ параллельна прямой $y = ' + R.poly([kk, R.int(-5, 5)]) + '$?', a: xx, kb: 'decimal', sol: "$f'(x) = " + R.poly([2 * a, bb]) + ' = ' + kk + '$' };
  }, 'касательная');

  D(7, 'extrema', 'd-extrema', '⛰', 'Экстремумы', 'Критические точки, максимум и минимум.', ['Критические точки', 'Точка максимума/минимума', 'Значение экстремума'], (lv, R) => {
    const p = R.int(-4, 3), q = p + R.int(1, 5); // f' = 3(x-p)(x-q) → f = x^3 - 3/2(p+q)x^2 + 3pq x + c
    const A = 2, B = -3 * (p + q), C = 6 * p * q, c0 = R.int(-9, 9); const cs = [A, B, C, c0];
    if (lv === 1) return { q: 'Найдите критические точки $f(x) = ' + R.poly(cs) + '$.', a: [p, q], sol: "$f'(x) = " + R.poly([6, 2 * B, C]) + ' = 6(x' + R.term(-p, '') + ')(x' + R.term(-q, '') + ')$' };
    if (lv === 2) { const mx = R.int(0, 1); return { q: 'Найдите точку ' + (mx ? 'максимума' : 'минимума') + ' $f(x) = ' + R.poly(cs) + '$.', a: mx ? p : q, sol: "$f'$ положительна вне $[" + p + ';\\ ' + q + ']$ и отрицательна внутри: максимум в ' + p + ', минимум в ' + q + '.' }; }
    const mx = R.int(0, 1); return { q: 'Найдите ' + (mx ? 'максимум' : 'минимум') + ' (значение функции) $f(x) = ' + R.poly(cs) + '$.', a: polyVal(cs, mx ? p : q), sol: 'Критические точки ' + p + ' и ' + q + '; $f(' + (mx ? p : q) + ') = ' + polyVal(cs, mx ? p : q) + '$' };
  }, 'экстремум максимум минимум');

  D(7, 'optimization', 'd-optim', '🎯', 'Задачи на оптимизацию', 'Наибольшее/наименьшее значение на отрезке и прикладные задачи.', ['На отрезке', 'Числа и прямоугольники', 'Забор и коробка'], (lv, R) => {
    if (lv === 1) { const v = R.int(-3, 3), a = R.int(v - 4, v - 1), b = R.int(v + 1, v + 5), k = R.nz(-2, 2), c = R.int(-5, 5); const f = x => k * (x - v) ** 2 + c; const vals = [f(a), f(b), f(v)]; const mx = R.int(0, 1); return { q: 'Найдите ' + (mx ? 'наибольшее' : 'наименьшее') + ' значение $f(x) = ' + R.poly([k, -2 * k * v, k * v * v + c]) + '$ на $[' + a + ';\\ ' + b + ']$.', a: mx ? Math.max(...vals) : Math.min(...vals), sol: 'Сравниваем $f(' + a + ') = ' + f(a) + '$, $f(' + b + ') = ' + f(b) + '$ и значение в вершине $f(' + v + ') = ' + c + '$.' }; }
    if (lv === 2) { const s = R.int(4, 30) * 2; return R.int(0, 1) ? { q: 'Сумма двух положительных чисел ' + s + '. Каково наибольшее их произведение?', a: s * s / 4, kb: 'numeric', sol: '$x(' + s + ' - x)$, максимум при $x = ' + s / 2 + '$' } : { q: 'Периметр прямоугольника ' + 2 * s + ' м. Какова наибольшая площадь?', a: s * s / 4, unit: 'м²', kb: 'numeric', sol: 'Квадрат со стороной ' + s / 2 + '.' }; }
    if (R.int(0, 1)) { const L = R.int(5, 40) * 4; return { q: 'Прямоугольный участок у реки огораживают с трёх сторон сеткой длиной ' + L + ' м. Какова наибольшая площадь?', a: L * L / 8, unit: 'м²', kb: 'decimal', sol: '$S = x(' + L + ' - 2x)$, $x = ' + L / 4 + '$' }; }
    const a = R.int(2, 10) * 6; return { q: 'Из квадратного листа ' + a + ' × ' + a + ' см вырезают по углам квадраты и сгибают открытую коробку. Какой длины сторона вырезаемого квадрата даёт наибольший объём?', a: a / 6, unit: 'см', kb: 'decimal', sol: '$V = x(' + a + ' - 2x)^2$, $V\' = 0$ при $x = \\frac{' + a + '}{6}$' };
  }, 'оптимизация наибольшее значение');

  D(7, 'analysis', 'd-second', "f''", 'Вторая производная и перегиб', 'Вторая производная, точка перегиба, выпуклость.', ['$f\'\'(x_0)$', 'Точка перегиба', 'Выпуклость'], (lv, R) => {
    const a = R.nz(-2, 2), x1 = R.int(-4, 4), b = -3 * a * x1, c = R.int(-6, 6), d = R.int(-9, 9); const cs = [a, b, c, d];
    if (lv === 1) { const x0 = R.int(-3, 3); return { q: "$f(x) = " + R.poly(cs) + "$. Найдите $f''(" + x0 + ")$.", a: 6 * a * x0 + 2 * b, sol: "$f''(x) = " + R.poly([6 * a, 2 * b]) + '$' }; }
    if (lv === 2) return { q: 'Найдите абсциссу точки перегиба $f(x) = ' + R.poly(cs) + '$.', a: x1, sol: "$f''(x) = " + R.poly([6 * a, 2 * b]) + ' = 0$' };
    const x0 = x1 + R.nz(-3, 3); const up = 6 * a * x0 + 2 * b > 0; return { q: 'Как выпукл график $f(x) = ' + R.poly(cs) + '$ в точке $x = ' + x0 + '$?', opts: up ? ['вниз (∪), $f\'\' > 0$', 'вверх (∩), $f\'\' < 0$'] : ['вверх (∩), $f\'\' < 0$', 'вниз (∪), $f\'\' > 0$'], sol: "$f''(" + x0 + ') = ' + (6 * a * x0 + 2 * b) + '$' };
  }, 'вторая производная перегиб');

  D(7, 'antiderivative', 'd-antider', '∫', 'Первообразная', 'Выберите первообразную или найдите её по начальному условию.', ['Таблица', 'Многочлен', 'Начальное условие'], (lv, R) => {
    if (lv === 1) { const T = [['x^4', '\\frac{x^5}{5}', ['4x^3', 'x^5', '5x^5']], ['\\cos x', '\\sin x', ['-\\sin x', '-\\cos x', '\\cos x']], ['\\sin x', '-\\cos x', ['\\cos x', '-\\sin x', '\\sin x']], ['e^{x}', 'e^{x}', ['xe^x', 'e^{x+1}', '\\ln x']], ['\\frac{1}{x}', '\\ln|x|', ['-\\frac{1}{x^2}', '\\frac{1}{x^2}', 'x^{-1}']], ['\\sqrt{x}', '\\frac{2}{3}x\\sqrt{x}', ['\\frac{1}{2\\sqrt{x}}', 'x\\sqrt{x}', '\\frac{3}{2}\\sqrt{x}']], ['e^{2x}', '\\frac{1}{2}e^{2x}', ['2e^{2x}', 'e^{2x}', 'e^{x^2}']]]; const [f, F, w] = R.pick(T); return { q: 'Первообразная функции $' + f + '$ (с точностью до $C$):', opts: ['$' + F + '$', ...w.map(x => '$' + x + '$')] }; }
    const cs = [R.int(-3, 3) * 3, R.int(-4, 4) * 2, R.int(-6, 6)]; const F = x => cs[0] / 3 * x ** 3 + cs[1] / 2 * x * x + cs[2] * x;
    if (lv === 2) { const x1 = R.int(1, 3); return { q: '$F$ — первообразная $f(x) = ' + R.poly(cs) + '$, причём $F(0) = 0$. Найдите $F(' + x1 + ')$.', a: F(x1), sol: '$F(x) = ' + R.poly([cs[0] / 3, cs[1] / 2, cs[2], 0]) + '$' }; }
    const x0 = R.int(-2, 2), y0 = R.int(-9, 9), x1 = R.int(-2, 3); const C = y0 - F(x0); return { q: 'Первообразная $f(x) = ' + R.poly(cs) + '$ проходит через $(' + x0 + ';\\ ' + y0 + ')$. Найдите её значение при $x = ' + x1 + '$.', a: F(x1) + C, sol: '$F(x) = ' + R.poly([cs[0] / 3, cs[1] / 2, cs[2], 0]) + ' + C$, $C = ' + C + '$' };
  }, 'первообразная интеграл');

  D(7, 'integral', 'd-integral', '∫ₐᵇ', 'Определённый интеграл', 'Ньютон — Лейбниц и площади фигур. Ответ можно дробью: 4/3.', ['Многочлен', 'Площадь под графиком', 'Площадь между графиками'], (lv, R) => {
    if (lv === 1) { const cs = [R.int(-2, 3) * 3, R.int(-3, 3) * 2, R.int(-5, 5)], a = R.int(-2, 1), b = a + R.int(1, 3); const F = x => cs[0] / 3 * x ** 3 + cs[1] / 2 * x * x + cs[2] * x; return { q: '$\\int_{' + a + '}^{' + b + '}(' + R.poly(cs) + ')\\,dx$', a: F(b) - F(a), sol: '$F(x) = ' + R.poly([cs[0] / 3, cs[1] / 2, cs[2], 0]) + '$, $F(' + b + ') - F(' + R.signed(a) + ')$' }; }
    if (lv === 2) { const r = R.int(1, 4); const k = R.int(1, 3); return { q: 'Найдите площадь фигуры между графиком $y = ' + R.poly([-k, 0, k * r * r]) + '$ и осью $x$.', a: 4 * k * r ** 3 / 3, show: '$' + R.frac(4 * k * r ** 3, 3) + '$', sol: 'Нули $\\pm' + r + '$: $\\int_{-' + r + '}^{' + r + '}(' + R.poly([-k, 0, k * r * r]) + ')\\,dx$' }; }
    const m = R.int(1, 4); return { q: 'Найдите площадь между $y = x^2$ и $y = ' + m + 'x$.', a: m ** 3 / 6, show: '$' + R.frac(m ** 3, 6) + '$', sol: 'Пересечения $x = 0$ и $x = ' + m + '$: $\\int_0^{' + m + '}(' + m + 'x - x^2)\\,dx = ' + R.frac(m ** 3, 6) + '$' };
  }, 'интеграл площадь');
  /* ——— Курс VIII ——— */
  const fact = n => n <= 1 ? 1 : n * fact(n - 1);
  const C = (n, k) => fact(n) / (fact(k) * fact(n - k));
  D(8, 'combinatorics', 'd-comb', '🔀', 'Комбинаторика', 'Перестановки, размещения, сочетания — важен ли порядок?', ['Факториал и правило произведения', 'Формулы', 'Задачи'], (lv, R) => {
    if (lv === 1) { if (R.int(0, 1)) { const n = R.int(3, 7); return { q: 'Сколькими способами можно расставить ' + n + ' разных книг на полке?', a: fact(n), kb: 'numeric', sol: '$' + n + '! = ' + fact(n) + '$' }; } const a = R.int(2, 6), b = R.int(2, 6), c = R.int(2, 4); return { q: 'В кафе ' + a + ' супов, ' + b + ' вторых блюд и ' + c + ' десерта. Сколько разных обедов «суп + второе + десерт»?', a: a * b * c, kb: 'numeric', sol: 'Правило произведения: $' + a + ' \\cdot ' + b + ' \\cdot ' + c + '$' }; }
    const n = R.int(5, 12), k = R.int(2, Math.min(4, n - 1));
    if (lv === 2) return R.int(0, 1) ? { q: 'Вычислите $C_{' + n + '}^{' + k + '}$.', a: C(n, k), kb: 'numeric', sol: '$\\frac{' + n + '!}{' + k + '! \\cdot ' + (n - k) + '!}$' } : { q: 'Вычислите $A_{' + n + '}^{' + k + '}$.', a: fact(n) / fact(n - k), kb: 'numeric', sol: '$\\frac{' + n + '!}{' + (n - k) + '!}$' };
    const t = R.int(0, 2);
    if (t === 0) return { q: 'Из ' + n + ' учеников выбирают ' + k + ' для участия в олимпиаде. Сколько способов?', a: C(n, k), kb: 'numeric', sol: 'Порядок не важен — сочетания $C_{' + n + '}^{' + k + '}$.' };
    if (t === 1) return { q: 'Из ' + n + ' бегунов определяют призёров: золото, серебро и бронзу. Сколько вариантов?', a: n * (n - 1) * (n - 2), kb: 'numeric', sol: 'Порядок важен — размещения $A_{' + n + '}^{3}$.' };
    return { q: 'Сколько рукопожатий, если каждый из ' + n + ' человек пожал руку каждому?', a: C(n, 2), kb: 'numeric', sol: '$C_{' + n + '}^{2}$' };
  }, 'комбинаторика сочетания');

  D(8, 'probability', 'd-prob', '🎲', 'Классическая вероятность', 'Кубики, монеты, урны. Ответ дробью: 1/6.', ['Один опыт', 'Два кубика', 'С сочетаниями'], (lv, R) => {
    if (lv === 1) { const t = R.int(0, 2); if (t === 0) { const w = R.int(1, 9), b = R.int(1, 9); return { q: 'В урне ' + w + ' белых и ' + b + ' чёрных шаров. Найдите вероятность вынуть белый.', a: w / (w + b), show: '$' + R.frac(w, w + b) + '$' }; } if (t === 1) { const [d, k] = R.pick([['чётное', 3], ['больше 4', 2], ['меньше 3', 2], ['кратное 3', 2], ['простое', 3], ['не меньше 2', 5]]); return { q: 'Бросают кубик. Вероятность, что выпадет число ' + d + '?', a: k / 6, show: '$' + R.frac(k, 6) + '$' }; } const n = R.int(10, 40), m = R.int(1, n - 1); return { q: 'Из ' + n + ' билетов ' + m + ' выигрышных. Вероятность, что взятый наугад билет — без выигрыша?', a: (n - m) / n, show: '$' + R.frac(n - m, n) + '$', sol: '$1 - ' + R.frac(m, n) + '$' }; }
    if (lv === 2) { const s = R.int(2, 12); const m = 6 - Math.abs(7 - s); if (R.int(0, 1)) return { q: 'Бросают два кубика. Вероятность, что сумма равна ' + s + '?', a: m / 36, show: '$' + R.frac(m, 36) + '$', sol: m + ' благоприятных пар из 36.' }; const s2 = R.int(3, 11); let cnt = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j >= s2) cnt++; return { q: 'Бросают два кубика. Вероятность, что сумма не меньше ' + s2 + '?', a: cnt / 36, show: '$' + R.frac(cnt, 36) + '$', sol: cnt + ' благоприятных пар из 36.' }; }
    const w = R.int(3, 7), b = R.int(2, 6), k = 2; const ww = R.int(0, 1); const fav = ww ? C(w, 2) : w * b; return { q: 'В урне ' + w + ' белых и ' + b + ' чёрных шаров. Наугад вынимают два. Вероятность, что ' + (ww ? 'оба белые?' : 'они разного цвета?'), a: fav / C(w + b, k), show: '$' + R.frac(fav, C(w + b, k)) + '$', sol: '$\\frac{' + (ww ? 'C_{' + w + '}^2' : w + ' \\cdot ' + b) + '}{C_{' + (w + b) + '}^2} = \\frac{' + fav + '}{' + C(w + b, 2) + '}$' };
  }, 'вероятность');

  D(8, 'probrules', 'd-probrules', '🌳', 'Сложение и умножение вероятностей', 'Независимые события, «хотя бы один», формула Бернулли (до тысячных).', ['Независимые события', 'Хотя бы один', 'Формула Бернулли'], (lv, R) => {
    const p = R.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]), q2 = R.pick([0.2, 0.5, 0.6, 0.7, 0.8, 0.9]);
    if (lv === 1) return { q: 'Два стрелка попадают с вероятностями ' + R.num(p) + ' и ' + R.num(q2) + '. Вероятность, что попадут оба?', a: R.round(p * q2), kb: 'decimal', sol: '$' + R.tn(p) + ' \\cdot ' + R.tn(q2) + '$' };
    if (lv === 2) { const n = R.int(2, 4); return { q: 'Вероятность попадания ' + R.num(p) + '. Сделано ' + pl(n, ['выстрел', 'выстрела', 'выстрелов']) + '. Вероятность хотя бы одного попадания (до тысячных)?', a: 1 - (1 - p) ** n, tol: 0.0011, show: R.num(R.round(1 - (1 - p) ** n, 4)), kb: 'decimal', sol: '$1 - ' + R.tn(R.round(1 - p)) + '^{' + n + '}$' }; }
    const n = R.int(3, 6), k = R.int(1, n - 1), pp = R.pick([0.5, 0.2, 0.3, 0.4]); const v = C(n, k) * pp ** k * (1 - pp) ** (n - k);
    return { q: 'Вероятность успеха в каждом испытании ' + R.num(pp) + '. Найдите вероятность ровно ' + k + ' успехов в ' + n + ' испытаниях (до тысячных).', a: v, tol: 0.0011, show: R.num(R.round(v, 4)), kb: 'decimal', sol: '$C_{' + n + '}^{' + k + '} \\cdot ' + R.tn(pp) + '^{' + k + '} \\cdot ' + R.tn(R.round(1 - pp)) + '^{' + (n - k) + '}$' };
  }, 'независимые события Бернулли');

  D(8, 'randomvar', 'd-expect', 'E', 'Математическое ожидание', 'Ожидание, недостающая вероятность, биномиальное распределение.', ['Недостающая вероятность', 'Ожидание', 'Биномиальное'], (lv, R) => {
    const xs = R.sample([0, 1, 2, 3, 4, 5, 10], 3).sort((a, b) => a - b); const ps = [R.int(1, 5), R.int(1, 4)].map(x => x / 10); const p3 = R.round(1 - ps[0] - ps[1]); const all = [...ps, p3];
    const tbl = '$\\begin{array}{c|ccc} x & ' + xs.join(' & ') + ' \\\\ \\hline p & ' + all.map(R.tn).join(' & ') + ' \\end{array}$';
    if (lv === 1) return { q: 'Найдите недостающую вероятность: $\\begin{array}{c|ccc} x & ' + xs.join(' & ') + ' \\\\ \\hline p & ' + R.tn(ps[0]) + ' & ' + R.tn(ps[1]) + ' & ? \\end{array}$', a: p3, kb: 'decimal', sol: 'Сумма вероятностей равна 1.' };
    if (lv === 2) return { q: 'Найдите $E(X)$: ' + tbl, a: R.round(xs.reduce((s, x, i) => s + x * all[i], 0)), kb: 'decimal', sol: '$\\sum x_i p_i$' };
    const n = R.pick([10, 20, 50, 100, 30]), p = R.pick([0.1, 0.2, 0.25, 0.5]); return R.int(0, 1) ? { q: 'Биномиальное распределение: $n = ' + n + '$, $p = ' + R.tn(p) + '$. Найдите $E(X)$.', a: n * p, kb: 'decimal', sol: '$np$' } : { q: 'Биномиальное распределение: $n = ' + n + '$, $p = ' + R.tn(p) + '$. Найдите дисперсию $D(X)$.', a: R.round(n * p * (1 - p)), kb: 'decimal', sol: '$np(1 - p)$' };
  }, 'математическое ожидание');

  D(8, 'statistics', 'd-stat', '📈', 'Описательная статистика', 'Среднее по таблице частот, стандартное отклонение, медиана.', ['Таблица частот', 'Стандартное отклонение', 'Квартили'], (lv, R) => {
    if (lv === 1) { const xs = R.sample([1, 2, 3, 4, 5], 3).sort(); const fs = xs.map(() => R.int(1, 6)); const n = fs.reduce((s, f) => s + f, 0); const m = xs.reduce((s, x, i) => s + x * fs[i], 0) / n; return { q: 'Найдите среднее (до сотых): $\\begin{array}{c|ccc} x & ' + xs.join(' & ') + ' \\\\ \\hline f & ' + fs.join(' & ') + ' \\end{array}$', a: m, tol: 0.006, show: R.num(R.round(m, 2)), kb: 'decimal', sol: '$\\frac{\\sum x_i f_i}{\\sum f_i} = \\frac{' + xs.reduce((s, x, i) => s + x * fs[i], 0) + '}{' + n + '}$' }; }
    if (lv === 2) { const m = R.int(3, 10), d = R.pick([[1, 1], [2, 2], [3, 3], [1, 3], [2, 4]]); const xs = R.shuffle([m - d[0], m + d[0], m - d[1], m + d[1]]); const sd = Math.sqrt((2 * d[0] ** 2 + 2 * d[1] ** 2) / 4); return { q: 'Найдите стандартное отклонение $\\sigma$ (делим на $n$, до сотых): ' + xs.join('; '), a: sd, tol: 0.006, show: R.num(R.round(sd, 2)), kb: 'decimal', sol: 'Среднее ' + m + '; $\\sigma = \\sqrt{\\frac{' + (2 * d[0] ** 2 + 2 * d[1] ** 2) + '}{4}}$' }; }
    const xs = Array.from({ length: 7 }, () => R.int(1, 30)).sort((a, b) => a - b); return R.int(0, 1) ? { q: 'Найдите медиану: ' + R.shuffle(xs).join('; '), a: xs[3], kb: 'numeric', sol: 'Упорядоченный ряд: ' + xs.join('; ') } : { q: 'Ряд из 7 чисел: ' + xs.join('; ') + '. Найдите межквартильный размах $Q_3 - Q_1$ (квартили — медианы нижней и верхней трёх значений).', a: xs[5] - xs[1], kb: 'numeric', sol: '$Q_1 = ' + xs[1] + '$, $Q_3 = ' + xs[5] + '$' };
  }, 'статистика среднее отклонение');

  D(8, 'correlation', 'd-corr', '⋰', 'Корреляция и регрессия', 'Прогноз по регрессии, параметр b, сила связи.', ['Прогноз', 'Найти b', 'Сила связи'], (lv, R) => {
    const a = R.pick([0.5, 1.2, 2, -1.5, 3, 0.8]), b = R.int(-5, 20);
    if (lv === 1) { const x = R.int(1, 20); return { q: 'Регрессия $y = ' + R.tn(a) + 'x' + R.term(b, '') + '$. Найдите прогноз $y$ при $x = ' + x + '$.', a: R.round(a * x + b), kb: 'decimal' }; }
    if (lv === 2) { const mx = R.int(2, 20), my = R.round(a * mx + b); return { q: 'Средние: $\\bar x = ' + mx + '$, $\\bar y = ' + R.tn(my) + '$. Регрессия $y = ' + R.tn(a) + 'x + b$. Найдите $b$.', a: b, kb: 'decimal', sol: 'Прямая проходит через $(\\bar x;\\ \\bar y)$: $b = \\bar y - a\\bar x$.' }; }
    const r = R.pick([-0.95, -0.8, -0.5, -0.1, 0.05, 0.4, 0.75, 0.9]); const s = Math.abs(r) >= 0.7 ? 'сильная' : Math.abs(r) >= 0.3 ? 'умеренная' : 'слабая или отсутствует'; const sign = Math.abs(r) < 0.3 ? '' : r > 0 ? ' положительная' : ' отрицательная';
    const right = s + sign; const opts = ['сильная положительная', 'сильная отрицательная', 'умеренная положительная', 'умеренная отрицательная', 'слабая или отсутствует'];
    return { q: 'Коэффициент корреляции $r = ' + R.tn(r) + '$. Какая линейная связь?', opts: [right, ...R.sample(opts.filter(o => o !== right), 3)] };
  }, 'корреляция регрессия');

  D(8, 'stereo', 'd-space', '🧭', 'Координаты в пространстве', 'Расстояние между точками, диагонали куба и параллелепипеда.', ['Расстояние', 'Диагональ', 'Середина отрезка'], (lv, R) => {
    if (lv === 1) { const [p, q, r, d] = R.pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15]]); const A = [R.int(-5, 5), R.int(-5, 5), R.int(-5, 5)]; const B = [A[0] + p * R.pick([1, -1]), A[1] + q * R.pick([1, -1]), A[2] + r * R.pick([1, -1])]; return { q: 'Найдите расстояние между $(' + A.join(';\\ ') + ')$ и $(' + B.join(';\\ ') + ')$.', a: d, kb: 'numeric', sol: '$\\sqrt{' + p * p + ' + ' + q * q + ' + ' + r * r + '}$' }; }
    if (lv === 2) { if (R.int(0, 1)) { const a = R.int(1, 10); return { q: 'Найдите диагональ куба с ребром ' + a + '.', a: a * Math.sqrt(3), tol: 1e-3, show: '$' + a + '\\sqrt{3}$' }; } const a = R.int(1, 8), b = R.int(1, 8), c = R.int(1, 8); const d = Math.sqrt(a * a + b * b + c * c); return { q: 'Найдите диагональ прямоугольного параллелепипеда ' + a + ' × ' + b + ' × ' + c + '.', a: d, tol: 1e-3, show: Number.isInteger(d) ? String(d) : '$\\sqrt{' + (a * a + b * b + c * c) + '}$' }; }
    const A = [R.int(-6, 6), R.int(-6, 6), R.int(-6, 6)], B = A.map(v => v + 2 * R.int(-4, 4)); return { q: 'Найдите середину отрезка $A(' + A.join(';\\ ') + ')$, $B(' + B.join(';\\ ') + ')$.', a: A.map((v, i) => (v + B[i]) / 2), ordered: true, ph: 'x; y; z', show: '(' + A.map((v, i) => (v + B[i]) / 2).join('; ') + ')' };
  }, 'пространство координаты');

  D(8, 'polyhedra', 'd-polyh', '🔺', 'Призма и пирамида', 'Апофема, площадь поверхности, объём.', ['Призма', 'Апофема и боковая поверхность', 'Объём пирамиды'], (lv, R) => {
    if (lv === 1) { const a = R.int(2, 10), h = R.int(2, 15); return R.int(0, 1) ? { q: 'Правильная четырёхугольная призма: сторона основания ' + a + ', высота ' + h + '. Найдите полную поверхность.', a: 4 * a * h + 2 * a * a, kb: 'numeric', sol: '$4 \\cdot ' + a + ' \\cdot ' + h + ' + 2 \\cdot ' + a + '^2$' } : { q: 'Правильная четырёхугольная призма: сторона основания ' + a + ', высота ' + h + '. Найдите объём.', a: a * a * h, kb: 'numeric' }; }
    const [hh, half, m] = R.pick([[4, 3, 5], [12, 5, 13], [3, 4, 5], [8, 6, 10], [15, 8, 17], [6, 8, 10]]); const a = 2 * half;
    if (lv === 2) return R.int(0, 1) ? { q: 'Правильная четырёхугольная пирамида: сторона основания ' + a + ', высота ' + hh + '. Найдите апофему.', a: m, kb: 'numeric', sol: '$\\sqrt{' + hh + '^2 + ' + half + '^2}$' } : { q: 'Правильная четырёхугольная пирамида: сторона основания ' + a + ', апофема ' + m + '. Найдите боковую поверхность.', a: 2 * a * m, kb: 'numeric', sol: '$\\frac{1}{2} \\cdot ' + 4 * a + ' \\cdot ' + m + '$' };
    return { q: 'Правильная четырёхугольная пирамида: сторона основания ' + a + ', апофема ' + m + '. Найдите объём.', a: a * a * hh / 3, kb: 'numeric', sol: 'Высота $\\sqrt{' + m + '^2 - ' + half + '^2} = ' + hh + '$, $V = \\frac{1}{3} \\cdot ' + a * a + ' \\cdot ' + hh + '$' };
  }, 'пирамида призма апофема');
  /* ——— Финансы и термины ——— */
  D(5, 'finance', 'd-finance', '🏦', 'Финансовая математика', 'Простые и сложные проценты, эффективная ставка, кредит. Ответ до сотых.', ['Простые и сложные', 'Эффективная ставка и удвоение', 'Ежемесячный платёж'], (lv, R) => {
    if (lv === 1) { const S = R.int(2, 40) * 100, r = R.pick([2, 3, 4, 5, 6, 8, 10]), t = R.int(2, 8), cmp = R.int(0, 1); const v = cmp ? S * (1 + r / 100) ** t : S * (1 + r * t / 100); return { q: 'Вклад ' + S + ' € под ' + r + '% годовых, ' + (cmp ? 'сложные' : 'простые') + ' проценты. Сколько будет через ' + t + ' лет?', a: R.round(v, 2), tol: 0.011, show: R.num(R.round(v, 2)) + ' €', unit: '€', kb: 'decimal', sol: cmp ? '$' + S + ' \\cdot ' + R.tn(1 + r / 100) + '^{' + t + '}$' : '$' + S + '(1 + ' + R.tn(r / 100) + ' \\cdot ' + t + ')$' }; }
    if (lv === 2) { const r = R.pick([3, 4, 5, 6, 8, 9, 12]); if (R.int(0, 1)) { const v = 100 * ((1 + r / 1200) ** 12 - 1); return { q: 'Ставка ' + r + '% годовых, проценты начисляются ежемесячно. Найдите эффективную годовую ставку (в %, до сотых).', a: R.round(v, 4), tol: 0.011, show: R.num(R.round(v, 2)) + '%', unit: '%', kb: 'decimal', sol: '$\\left(1 + \\frac{' + R.tn(r / 100) + '}{12}\\right)^{12} - 1$' }; } const t = Math.ceil(Math.log(2) / Math.log(1 + r / 100)); return { q: 'Через сколько полных лет вклад под ' + r + '% годовых (сложные проценты) впервые станет больше чем вдвое?', a: t, unit: 'лет', kb: 'numeric', sol: '$t > \\frac{\\ln 2}{\\ln ' + R.tn(1 + r / 100) + '} \\approx ' + R.tn(R.round(Math.log(2) / Math.log(1 + r / 100), 2)) + '$ (правило 72: ' + R.tn(R.round(72 / r, 1)) + ')' }; }
    const S = R.int(2, 40) * 500, r = R.pick([3, 4, 5, 6, 7.2, 9, 12]), y = R.int(1, 10); const i = r / 1200, n = 12 * y; const A = S * i / (1 - (1 + i) ** -n);
    return { q: 'Кредит ' + S + ' € на ' + y + ' ' + (y === 1 ? 'год' : y < 5 ? 'года' : 'лет') + ' под ' + R.num(r) + '% годовых, равные ежемесячные платежи. Найдите платёж (до сотых).', a: R.round(A, 2), tol: 0.011, show: R.num(R.round(A, 2)) + ' €', unit: '€', kb: 'decimal', sol: '$i = ' + R.tn(R.round(i, 6)) + '$, $n = ' + n + '$, $A = ' + S + ' \\cdot \\frac{i}{1 - (1 + i)^{-' + n + '}}$' };
  }, 'кредит проценты вклад инфляция');

  // Эстонские термины: пары собираются из строк «По-эстонски» всех уроков
  const TERMS = (() => { const seen = new Set(), out = []; for (const l of PLATFORM.lessons) for (const m of l.body.matchAll(/^>e\s+(.*)$/gm)) { let t = m[1]; const k = t.indexOf('Термины:'); if (k >= 0) t = t.slice(k + 8); for (const ch of t.replace(/\.$/, '').split(/,\s+/)) { const p = ch.split(' — '); if (p.length !== 2) continue; const ru = p[0].trim(), et = p[1].trim(); if (!/[а-яё]/i.test(ru) || /[а-яё]/i.test(et) || ru.length > 40 || et.length > 45 || /\$/.test(ru + et) || seen.has(ru) || seen.has('et:' + et)) continue; seen.add(ru); seen.add('et:' + et); out.push({ ru, et, c: l.course }); } } return out; })();
  PLATFORM.estTerms = TERMS;
  D(5, null, 'd-terms', '🇪🇪', 'Термины по-эстонски', 'Математические термины всех курсов: ' + TERMS.length + ' пар «русский — эстонский».', ['Курсы I–IV: рус → эст', 'Курсы V–VIII: рус → эст', 'Все курсы: эст → рус'], (lv, R) => {
    const pool = lv === 1 ? TERMS.filter(t => t.c <= 4) : lv === 2 ? TERMS.filter(t => t.c >= 5) : TERMS;
    const t = R.pick(pool); const others = R.sample(pool.filter(x => x !== t), 3);
    if (lv < 3) return { q: 'Как по-эстонски «' + t.ru + '»?', opts: [t.et, ...others.map(x => x.et)], sol: t.ru + ' — **' + t.et + '**' };
    return { q: 'Что означает «' + t.et + '»?', opts: [t.ru, ...others.map(x => x.ru)], sol: t.et + ' — **' + t.ru + '**' };
  }, 'эстонский термины eesti keel');
})();


/* Калькулятор: по умолчанию разрешён с курса III. Исключения: */
(function () {
  const set = (id, v) => { const d = PLATFORM.drills.find(x => x.id === id); if (d) d.calc = v; };
  set('d-circle', true);      // длина окружности и площадь с π — счёт не цель задачи
  set('d-sqformula', false);  // формулы сокращённого умножения тренируют счёт в уме
  set('d-pow', false);        // степени и их свойства — без калькулятора
  set('d-sqrt', false);       // упрощение корней — калькулятор даст лишь десятичную дробь
})();
