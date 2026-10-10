/* Лаборатории: интерактивные модели на canvas/SVG. render(el, K) — K: { tex, inline, md, esc, R }. */
(function () {
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
  const col = () => ({ ink: css('--ink'), muted: css('--muted'), line: css('--line'), paper: css('--paper'), acc: css('--accent'), ok: css('--ok'), bad: css('--bad'), gold: css('--gold'), est: css('--est') });
  const fmt = (x, k = 2) => { if (!isFinite(x)) return '—'; const v = Math.round(x * 10 ** k) / 10 ** k; return (v < 0 ? '−' : '') + String(Math.abs(v)).replace('.', ','); };
  const tn = (x, k = 2) => { const v = Math.round(x * 10 ** k) / 10 ** k; return (v < 0 ? '-' : '') + String(Math.abs(v)).replace('.', '{,}'); };
  const sg = (x, k = 2) => (x < 0 ? ' - ' : ' + ') + tn(Math.abs(x), k);

  // Ползунки: defs = [[key, подпись(TeX ок), min, max, step, value], …]
  function controls(el, defs, K, onChange) {
    const box = document.createElement('div'); box.className = 'ctrls';
    const vals = {};
    defs.forEach(([key, label, min, max, step, value]) => {
      vals[key] = value;
      const lab = document.createElement('label');
      lab.innerHTML = '<span>' + K.inline(label) + '</span><input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '" aria-label="' + K.esc(label.replace(/\$/g, '')) + '"><output>' + fmt(value) + '</output>';
      const inp = lab.querySelector('input'), out = lab.querySelector('output');
      inp.oninput = () => { vals[key] = +inp.value; out.textContent = fmt(+inp.value); onChange(); };
      box.appendChild(lab);
    });
    el.appendChild(box);
    return vals;
  }
  // Координатная плоскость на canvas
  function plane(el, opt) {
    const cv = document.createElement('canvas'); el.appendChild(cv);
    const ctx = cv.getContext('2d');
    const P = { cv, ctx, ...opt };
    P.size = () => {
      const w = Math.max(260, el.clientWidth || 600), h = Math.round(Math.min(opt.maxH || 460, w * (opt.ratio || 0.66)));
      const dpr = window.devicePixelRatio || 1; cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); P.w = w; P.h = h;
      if (opt.equal) { const cx = (opt.xmin + opt.xmax) / 2, cy = (opt.ymin + opt.ymax) / 2; const sx = (opt.xmax - opt.xmin) / w, sy = (opt.ymax - opt.ymin) / h; const s = Math.max(sx, sy); P.xmin = cx - s * w / 2; P.xmax = cx + s * w / 2; P.ymin = cy - s * h / 2; P.ymax = cy + s * h / 2; }
    };
    P.X = x => (x - P.xmin) / (P.xmax - P.xmin) * P.w;
    P.Y = y => P.h - (y - P.ymin) / (P.ymax - P.ymin) * P.h;
    P.ix = px => P.xmin + px / P.w * (P.xmax - P.xmin);
    P.iy = py => P.ymin + (P.h - py) / P.h * (P.ymax - P.ymin);
    P.clear = () => { const c = col(); P.c = c; ctx.clearRect(0, 0, P.w, P.h); };
    P.grid = (step = 1, labels = true) => {
      const c = P.c; ctx.lineWidth = 1; ctx.strokeStyle = c.line; ctx.beginPath();
      const st = step * Math.max(1, Math.ceil(30 / (P.X(step) - P.X(0))));
      for (let x = Math.ceil(P.xmin / st) * st; x <= P.xmax; x += st) { ctx.moveTo(P.X(x), 0); ctx.lineTo(P.X(x), P.h); }
      for (let y = Math.ceil(P.ymin / st) * st; y <= P.ymax; y += st) { ctx.moveTo(0, P.Y(y)); ctx.lineTo(P.w, P.Y(y)); }
      ctx.stroke();
      ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, P.Y(0)); ctx.lineTo(P.w, P.Y(0)); ctx.moveTo(P.X(0), 0); ctx.lineTo(P.X(0), P.h); ctx.stroke();
      if (labels) {
        ctx.fillStyle = c.muted; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        const lst = st * Math.max(1, Math.ceil(46 / (P.X(st) - P.X(0))));
        for (let x = Math.ceil(P.xmin / lst) * lst; x <= P.xmax; x += lst) if (Math.abs(x) > 1e-9) ctx.fillText(fmt(x), P.X(x), Math.min(P.h - 14, Math.max(2, P.Y(0) + 3)));
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let y = Math.ceil(P.ymin / lst) * lst; y <= P.ymax; y += lst) if (Math.abs(y) > 1e-9) ctx.fillText(fmt(y), Math.max(24, Math.min(P.w - 2, P.X(0) - 4)), P.Y(y));
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'; ctx.fillText('x', P.w - 12, Math.min(P.h - 4, P.Y(0) - 6)); ctx.fillText('y', Math.min(P.w - 12, P.X(0) + 6), 12);
      }
    };
    P.fn = (f, color, width = 2.5, from = P.xmin, to = P.xmax) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); let pen = false, py = null;
      const n = Math.ceil(P.w * 1.5);
      for (let i = 0; i <= n; i++) {
        const x = from + (to - from) * i / n, y = f(x), Y = P.Y(y);
        if (!isFinite(y) || Math.abs(Y) > 1e5 || (py != null && Math.abs(Y - py) > P.h * 1.5)) { pen = false; py = null; continue; }
        if (pen) ctx.lineTo(P.X(x), Y); else { ctx.moveTo(P.X(x), Y); pen = true; } py = Y;
      }
      ctx.stroke();
    };
    P.seg = (x1, y1, x2, y2, color, width = 2, dash) => { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(P.X(x1), P.Y(y1)); ctx.lineTo(P.X(x2), P.Y(y2)); ctx.stroke(); ctx.setLineDash([]); };
    P.arrow = (x1, y1, x2, y2, color, width = 2.5) => { P.seg(x1, y1, x2, y2, color, width); const a = Math.atan2(P.Y(y2) - P.Y(y1), P.X(x2) - P.X(x1)); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(P.X(x2), P.Y(y2)); ctx.lineTo(P.X(x2) - 11 * Math.cos(a - .4), P.Y(y2) - 11 * Math.sin(a - .4)); ctx.lineTo(P.X(x2) - 11 * Math.cos(a + .4), P.Y(y2) - 11 * Math.sin(a + .4)); ctx.closePath(); ctx.fill(); };
    P.dot = (x, y, color, r = 5, label) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(P.X(x), P.Y(y), r, 0, 7); ctx.fill(); if (label) P.text(x, y, label, color, 8, -8); };
    P.text = (x, y, s, color, dx = 0, dy = 0, align = 'left', size = 14) => { ctx.fillStyle = color || P.c.ink; ctx.font = '600 ' + size + 'px system-ui,sans-serif'; ctx.textAlign = align; ctx.fillText(s, P.X(x) + dx, P.Y(y) + dy); ctx.textAlign = 'start'; };
    P.poly = (pts, fill, stroke, width = 2) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(P.X(x), P.Y(y)) : ctx.moveTo(P.X(x), P.Y(y))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); } };
    P.circle = (x, y, r, color, width = 2) => { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.ellipse(P.X(x), P.Y(y), Math.abs(P.X(r) - P.X(0)), Math.abs(P.Y(r) - P.Y(0)), 0, 0, 7); ctx.stroke(); };
    // перетаскивание: onDrag(x, y) в мировых координатах
    P.drag = onDrag => {
      let on = false; const at = e => { const r = cv.getBoundingClientRect(); return [P.ix(e.clientX - r.left), P.iy(e.clientY - r.top)]; };
      cv.addEventListener('pointerdown', e => { on = true; cv.setPointerCapture(e.pointerId); onDrag(...at(e)); });
      cv.addEventListener('pointermove', e => { if (on) onDrag(...at(e)); });
      cv.addEventListener('pointerup', () => { on = false; });
    };
    P.size();
    return P;
  }
  const alpha = (hex, a) => { const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i); return m ? 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + a + ')' : hex; };
  // Общий цикл: создаёт readout, перерисовывает при изменениях и ресайзе
  function setup(el, draw) {
    const ro = document.createElement('div'); ro.className = 'readout';
    let raf = 0; const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (el.isConnected) draw(ro); }); };
    const onR = () => { if (!el.isConnected) { window.removeEventListener('resize', onR); return; } el.querySelectorAll('canvas').forEach(() => {}); redraw.resize && redraw.resize(); redraw(); };
    window.addEventListener('resize', onR);
    return { ro, redraw, onResize: f => { redraw.resize = f; } };
  }
  const L = (course, lesson, id, ico, title, desc, render, tags) => PLATFORM.labs.push({ course, lesson, id, ico, title, desc, render, tags });

  /* 1. Умножение как прямоугольник */
  L(1, 'mult', 'lab-mult', '🟦', 'Умножение — это прямоугольник', 'Задайте число рядов и клеток в ряду: произведение равно числу клеток.', (el, K) => {
    const s = setup(el, ro => {
      const { a, b } = v, c = col(), cell = Math.min(30, Math.floor((Math.max(260, el.clientWidth) - 20) / 10));
      fig.innerHTML = '<svg viewBox="0 0 ' + (10 * cell + 4) + ' ' + (10 * cell + 4) + '" style="max-width:' + (10 * cell + 4) + 'px;margin:0 auto">' +
        Array.from({ length: 100 }, (_, i) => { const r = Math.floor(i / 10), q = i % 10, on = r < a && q < b; return '<rect x="' + (2 + q * cell) + '" y="' + (2 + r * cell) + '" width="' + (cell - 3) + '" height="' + (cell - 3) + '" rx="4" fill="' + (on ? c.acc : c.line) + '" opacity="' + (on ? .9 : .45) + '"/>'; }).join('') + '</svg>';
      ro.innerHTML = '<div class="bigf">' + K.tex(a + ' \\cdot ' + b + ' = ' + a * b) + '</div>' + a + ' ' + (a === 1 ? 'ряд' : 'рядов') + ' по ' + b + ' клеток. Поверните прямоугольник — получится ' + K.tex(b + ' \\cdot ' + a) + ', клеток столько же: ' + K.tex('a \\cdot b = b \\cdot a') + '.' + (a * b % 2 === 0 ? '' : ' Обратите внимание: произведение нечётное, только если оба множителя нечётные.');
    });
    const fig = document.createElement('div'); el.appendChild(fig);
    const v = controls(el, [['a', 'Рядов', 1, 10, 1, 3], ['b', 'В ряду', 1, 10, 1, 7]], K, s.redraw);
    el.appendChild(s.ro); s.redraw();
  }, 'таблица умножения');

  /* 2. Числовая прямая */
  L(2, 'negative', 'lab-numline', '↔️', 'Прогулка по числовой прямой', 'Сложение — шаг вправо, вычитание и отрицательные числа — шаг влево.', (el, K) => {
    let P;
    const s = setup(el, ro => {
      const { a, b } = v; P.size(); P.clear(); const c = P.c, ctx = P.ctx;
      ctx.strokeStyle = c.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, P.Y(0)); ctx.lineTo(P.w, P.Y(0)); ctx.stroke();
      ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = c.muted;
      for (let x = -12; x <= 12; x++) { ctx.beginPath(); ctx.moveTo(P.X(x), P.Y(0) - 6); ctx.lineTo(P.X(x), P.Y(0) + 6); ctx.stroke(); if (x % 2 === 0 || P.w > 520) ctx.fillText(fmt(x), P.X(x), P.Y(0) + 20); }
      P.dot(a, 0, c.est, 7); P.text(a, 0, 'старт', c.est, 0, -14, 'center', 12);
      const r = a + b; if (b) { const ctx2 = P.ctx; ctx2.strokeStyle = b > 0 ? c.ok : c.bad; ctx2.lineWidth = 3; ctx2.beginPath(); const x1 = P.X(a), x2 = P.X(r), y = P.Y(0); ctx2.moveTo(x1, y - 4); ctx2.bezierCurveTo(x1, y - 60, x2, y - 60, x2, y - 8); ctx2.stroke(); P.arrow(r + (b > 0 ? -0.05 : 0.05), 0.35, r, 0.08, b > 0 ? c.ok : c.bad, 3); }
      P.dot(r, 0, c.acc, 7);
      ro.innerHTML = '<div class="bigf">' + K.tex(tn(a, 0) + (b < 0 ? ' + (' + tn(b, 0) + ')' : ' + ' + b) + ' = ' + tn(r, 0)) + '</div>' + (b > 0 ? 'Прибавить положительное число — шагнуть вправо на ' + b + '.' : b < 0 ? 'Прибавить отрицательное — то же, что вычесть: шаг влево на ' + (-b) + '. ' + K.tex(tn(a, 0) + ' + (' + tn(b, 0) + ') = ' + tn(a, 0) + ' - ' + (-b)) + '.' : 'Прибавить ноль — остаться на месте.') + (Math.abs(r) > 12 ? ' (Результат вышел за пределы рисунка.)' : '');
    });
    P = plane(el, { xmin: -12.5, xmax: 12.5, ymin: -0.6, ymax: 1.4, ratio: 0.28, maxH: 200 });
    const v = controls(el, [['a', 'Старт $a$', -10, 10, 1, -3], ['b', 'Шаг $b$', -10, 10, 1, 5]], K, s.redraw);
    el.appendChild(s.ro); s.redraw();
  }, 'отрицательные числа числовая прямая');

  /* 3. Дроби-пиццы */
  L(2, 'fractions', 'lab-fraction', '🍕', 'Дроби на пиццах', 'Сравните две дроби: разрежьте пиццы и закрасьте куски.', (el, K) => {
    const s = setup(el, ro => {
      const c = col(); const pie = (n, d, color) => { const R = 70; let out = '<svg viewBox="-80 -80 160 160" style="max-width:170px">'; for (let i = 0; i < d; i++) { const a0 = 2 * Math.PI * i / d - Math.PI / 2, a1 = 2 * Math.PI * (i + 1) / d - Math.PI / 2; const big = a1 - a0 > Math.PI ? 1 : 0; out += d === 1 ? '<circle r="' + R + '" fill="' + (i < n ? color : 'transparent') + '" stroke="' + c.ink + '" stroke-width="2"/>' : '<path d="M0 0 L' + (R * Math.cos(a0)).toFixed(2) + ' ' + (R * Math.sin(a0)).toFixed(2) + ' A' + R + ' ' + R + ' 0 ' + big + ' 1 ' + (R * Math.cos(a1)).toFixed(2) + ' ' + (R * Math.sin(a1)).toFixed(2) + ' Z" fill="' + (i < n ? color : 'transparent') + '" stroke="' + c.ink + '" stroke-width="2"/>'; } return out + '</svg>'; };
      const n1 = Math.min(v.n1, v.d1), n2 = Math.min(v.n2, v.d2);
      fig.innerHTML = '<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;text-align:center"><div>' + pie(n1, v.d1, c.acc) + '<div class="bigf">' + K.tex('\\frac{' + n1 + '}{' + v.d1 + '}') + '</div></div><div>' + pie(n2, v.d2, c.gold) + '<div class="bigf">' + K.tex('\\frac{' + n2 + '}{' + v.d2 + '}') + '</div></div></div>';
      const l = n1 * v.d2, r = n2 * v.d1, sign = l > r ? '>' : l < r ? '<' : '=';
      const g = (a, b) => b ? g(b, a % b) : a; const g1 = g(n1, v.d1) || 1, g2 = g(n2, v.d2) || 1;
      ro.innerHTML = '<div class="bigf">' + K.tex('\\frac{' + n1 + '}{' + v.d1 + '} ' + sign + ' \\frac{' + n2 + '}{' + v.d2 + '}') + '</div>Приводим к общему знаменателю: ' + K.tex('\\frac{' + n1 + '}{' + v.d1 + '} = \\frac{' + l + '}{' + v.d1 * v.d2 + '}') + ', ' + K.tex('\\frac{' + n2 + '}{' + v.d2 + '} = \\frac{' + r + '}{' + v.d1 * v.d2 + '}') + '.<br>Десятичная запись: ' + fmt(n1 / v.d1, 3) + ' и ' + fmt(n2 / v.d2, 3) + ' · в процентах: ' + fmt(100 * n1 / v.d1, 1) + '% и ' + fmt(100 * n2 / v.d2, 1) + '%.' + (g1 > 1 ? '<br>Первую дробь можно сократить на ' + g1 + ': ' + K.tex('\\frac{' + n1 / g1 + '}{' + v.d1 / g1 + '}') + '.' : '') + (g2 > 1 ? '<br>Вторую дробь можно сократить на ' + g2 + ': ' + K.tex('\\frac{' + n2 / g2 + '}{' + v.d2 / g2 + '}') + '.' : '');
    });
    const fig = document.createElement('div'); el.appendChild(fig);
    const v = controls(el, [['n1', 'Числитель 1', 0, 12, 1, 3], ['d1', 'Знаменатель 1', 1, 12, 1, 4], ['n2', 'Числитель 2', 0, 12, 1, 2], ['d2', 'Знаменатель 2', 1, 12, 1, 3]], K, s.redraw);
    el.appendChild(s.ro); s.redraw();
  }, 'дроби сравнение');

  /* 4. Линейная функция */
  L(3, 'linear', 'lab-linear', '📈', 'Линейная функция y = kx + b', 'Как наклон k и сдвиг b меняют прямую.', (el, K) => {
    let P;
    const s = setup(el, ro => {
      const { k, b } = v; P.size(); P.clear(); P.grid(1); const c = P.c;
      P.fn(x => k * x + b, c.acc, 3);
      P.dot(0, b, c.est, 5, '(0; ' + fmt(b, 1) + ')');
      if (k) { P.seg(1, k + b, 2, k + b, c.gold, 2, [5, 4]); P.seg(2, k + b, 2, 2 * k + b, c.gold, 2, [5, 4]); P.text(1.5, k + b, '1', c.gold, 0, k > 0 ? 16 : -6, 'center'); P.text(2, 1.5 * k + b, 'k = ' + fmt(k, 1), c.gold, 6, 4); P.dot(-b / k, 0, c.bad, 5); }
      ro.innerHTML = '<div class="bigf">' + K.tex('y = ' + K.R.poly([k, b])) + '</div>' +
        (k > 0 ? 'k > 0: функция возрастает — прямая идёт вверх слева направо.' : k < 0 ? 'k < 0: функция убывает — прямая идёт вниз.' : 'k = 0: прямая горизонтальна, функция постоянна.') +
        ' Точка пересечения с осью y: (0; ' + fmt(b, 1) + ').' + (k ? ' С осью x: x = ' + fmt(-b / k) + '.' : '') + ' При шаге вправо на 1 значение y меняется на k (жёлтый треугольник).';
    });
    P = plane(el, { xmin: -8, xmax: 8, ymin: -6, ymax: 6, equal: true });
    const v = controls(el, [['k', 'Наклон $k$', -4, 4, 0.5, 1], ['b', 'Сдвиг $b$', -5, 5, 0.5, 2]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'прямая наклон график');

  /* 5. Парабола */
  L(3, 'quadfunc', 'lab-parabola', '🏹', 'Парабола y = ax² + bx + c', 'Двигайте коэффициенты: вершина, ветви, дискриминант и корни.', (el, K) => {
    let P;
    const s = setup(el, ro => {
      const { a, b, c: cc } = v; P.size(); P.clear(); P.grid(1); const c = P.c;
      const f = x => a * x * x + b * x + cc; P.fn(f, c.acc, 3);
      const D = b * b - 4 * a * cc;
      let info = '';
      if (a) {
        const x0 = -b / (2 * a), y0 = f(x0); P.seg(x0, P.ymin, x0, P.ymax, c.muted, 1, [4, 4]); P.dot(x0, y0, c.gold, 6, 'вершина');
        if (D >= 0) { const r1 = (-b - Math.sqrt(D)) / (2 * a), r2 = (-b + Math.sqrt(D)) / (2 * a); P.dot(r1, 0, c.bad, 6); P.dot(r2, 0, c.bad, 6); }
        P.dot(0, cc, c.est, 5);
        info = 'Ветви ' + (a > 0 ? 'вверх (a > 0)' : 'вниз (a < 0)') + '. Вершина: ' + K.tex('x_0 = -\\frac{b}{2a} = ' + tn(x0)) + ', ' + K.tex('y_0 = ' + tn(y0)) + '. Ось симметрии — пунктир.<br>' +
          K.tex('D = b^2 - 4ac = ' + tn(D)) + (D > 0 ? ' > 0: два корня ' + K.tex('x_{1,2} = ' + tn((-b - Math.sqrt(D)) / (2 * a)) + ';\\ ' + tn((-b + Math.sqrt(D)) / (2 * a))) : D === 0 ? ' = 0: один корень (парабола касается оси x).' : ' < 0: корней нет — парабола не пересекает ось x.') + '<br>Синяя точка (0; ' + fmt(cc) + ') — пересечение с осью y, это всегда c.';
      } else info = 'При a = 0 это уже не парабола, а прямая ' + K.tex('y = ' + K.R.poly([b, cc])) + '.';
      ro.innerHTML = '<div class="bigf">' + K.tex('y = ' + K.R.poly([a, b, cc])) + '</div>' + info;
    });
    P = plane(el, { xmin: -8, xmax: 8, ymin: -7, ymax: 7, equal: true });
    const v = controls(el, [['a', '$a$', -3, 3, 0.25, 1], ['b', '$b$', -6, 6, 0.5, -2], ['c', '$c$', -6, 6, 0.5, -3]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'квадратичная функция дискриминант вершина');

  /* 6. Система уравнений */
  L(3, 'systems', 'lab-system', '✳️', 'Система — точка пересечения', 'Два уравнения — две прямые. Решение системы — их общая точка.', (el, K) => {
    let P;
    const s = setup(el, ro => {
      const { k1, b1, k2, b2 } = v; P.size(); P.clear(); P.grid(1); const c = P.c;
      P.fn(x => k1 * x + b1, c.acc, 3); P.fn(x => k2 * x + b2, c.gold, 3);
      let txt;
      if (k1 === k2) txt = b1 === b2 ? 'Прямые совпадают — бесконечно много решений.' : 'Прямые параллельны (одинаковый наклон) — решений нет.';
      else { const x = (b2 - b1) / (k1 - k2), y = k1 * x + b1; P.dot(x, y, c.bad, 7, '(' + fmt(x) + '; ' + fmt(y) + ')'); txt = 'Единственное решение: ' + K.tex('x = ' + tn(x) + ',\\ y = ' + tn(y)) + '. Проверка подстановкой: ' + K.tex(tn(k1, 1) + '\\cdot' + '(' + tn(x) + ')' + sg(b1, 1) + ' \\approx ' + tn(y)) + '.'; }
      ro.innerHTML = '<div class="bigf">' + K.tex('\\begin{cases} y = ' + K.R.poly([k1, b1]) + ' \\\\ y = ' + K.R.poly([k2, b2]) + ' \\end{cases}') + '</div>' + txt;
    });
    P = plane(el, { xmin: -8, xmax: 8, ymin: -6, ymax: 6, equal: true });
    const v = controls(el, [['k1', '$k_1$', -3, 3, 0.5, 1], ['b1', '$b_1$', -5, 5, 0.5, 1], ['k2', '$k_2$', -3, 3, 0.5, -0.5], ['b2', '$b_2$', -5, 5, 0.5, 4]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'система линейных уравнений');

  /* 7. Теорема Пифагора */
  L(4, 'pythagoras', 'lab-pythagoras', '📐', 'Квадраты Пифагора', 'Площади квадратов на катетах в сумме дают квадрат на гипотенузе.', (el, K) => {
    let P;
    const s = setup(el, ro => {
      const { a, b } = v; P.size(); P.clear(); const c = P.c;
      const A = [0, 0], B = [a, 0], Cc = [0, b];
      P.poly([[0, 0], [a, 0], [a, -a], [0, -a]], alpha(c.acc, .25), c.acc);
      P.poly([[0, 0], [0, b], [-b, b], [-b, 0]], alpha(c.gold, .3), c.gold);
      P.poly([B, Cc, [b, a + b], [a + b, a]], alpha(c.ok, .22), c.ok);
      P.poly([A, B, Cc], alpha(c.ink, .08), c.ink, 3);
      P.text(a / 2, -a / 2, 'a² = ' + fmt(a * a), c.acc, 0, 5, 'center');
      P.text(-b / 2, b / 2, 'b² = ' + fmt(b * b), c.gold, 0, 5, 'center');
      P.text((a + b) / 2, (a + b) / 2, 'c² = ' + fmt(a * a + b * b), c.ok, 0, 5, 'center');
      const cHyp = Math.sqrt(a * a + b * b);
      ro.innerHTML = '<div class="bigf">' + K.tex(tn(a, 1) + '^2 + ' + tn(b, 1) + '^2 = ' + tn(a * a + b * b) + ' \\Rightarrow c = \\sqrt{' + tn(a * a + b * b) + '} \\approx ' + tn(cHyp)) + '</div>' + (Number.isInteger(cHyp) ? '🎉 Целочисленный (пифагоров) треугольник: ' + a + ', ' + b + ', ' + cHyp + '! ' : 'Попробуйте найти катеты, при которых гипотенуза целая (например, 3 и 4, 5 и 12, 6 и 8). ') + 'Площадь зелёного квадрата всегда равна сумме двух других.';
    });
    P = plane(el, { xmin: -9, xmax: 13, ymin: -7, ymax: 13, equal: true, ratio: 0.8, maxH: 520 });
    const v = controls(el, [['a', 'Катет $a$', 1, 6, 0.5, 3], ['b', 'Катет $b$', 1, 6, 0.5, 4]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'теорема Пифагора гипотенуза катет');

  /* 8. Тригонометрия в прямоугольном треугольнике */
  L(4, 'trig-right', 'lab-triangle', '◺', 'Синус, косинус, тангенс угла', 'Меняйте угол и гипотенузу: отношения сторон зависят только от угла.', (el, K) => {
    let P;
    const s = setup(el, ro => {
      const { A, h } = v; P.size(); P.clear(); const c = P.c; const r = A * Math.PI / 180;
      const ax = h * Math.cos(r), ay = h * Math.sin(r);
      P.poly([[0, 0], [ax, 0], [ax, ay]], alpha(c.acc, .12), c.ink, 2.5);
      P.seg(0, 0, ax, 0, c.est, 4); P.seg(ax, 0, ax, ay, c.bad, 4); P.seg(0, 0, ax, ay, c.ink, 3);
      const q = Math.min(0.5, ax / 4); P.poly([[ax - q, 0], [ax - q, q], [ax, q], [ax, 0]], null, c.muted, 1.5);
      P.ctx.strokeStyle = c.gold; P.ctx.lineWidth = 2; P.ctx.beginPath(); P.ctx.arc(P.X(0), P.Y(0), 34, -r, 0); P.ctx.stroke(); P.text(0, 0, 'α', c.gold, 40, -6);
      P.text(ax / 2, 0, 'прилежащий ' + fmt(ax), c.est, 0, 18, 'center', 13); P.text(ax, ay / 2, 'противолежащий ' + fmt(ay), c.bad, 8, 0, 'left', 13); P.text(ax / 2, ay / 2, 'гипотенуза ' + fmt(h), c.ink, -8, -8, 'right', 13);
      ro.innerHTML = K.tex('\\sin ' + A + '^\\circ = \\frac{' + tn(ay) + '}{' + tn(h) + '} \\approx ' + tn(Math.sin(r), 3)) + ' &nbsp; ' + K.tex('\\cos ' + A + '^\\circ \\approx ' + tn(Math.cos(r), 3)) + ' &nbsp; ' + K.tex('\\tan ' + A + '^\\circ = \\frac{' + tn(ay) + '}{' + tn(ax) + '} \\approx ' + tn(Math.tan(r), 3)) + '<br>Меняйте гипотенузу: стороны растут, а синус, косинус и тангенс остаются прежними — они зависят только от угла (треугольники подобны).';
    });
    P = plane(el, { xmin: -1, xmax: 11, ymin: -1.2, ymax: 9, equal: true, ratio: 0.72 });
    const v = controls(el, [['A', 'Угол α, °', 5, 85, 1, 35], ['h', 'Гипотенуза', 3, 10, 0.5, 8]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'синус косинус тангенс');

  /* 9. Конструктор графиков и преобразования */
  L(5, 'functions', 'lab-graphs', '🧭', 'Конструктор графиков', 'Выберите функцию и сдвигайте, растягивайте, отражайте её график.', (el, K) => {
    const F = { 'x^2': [x => x * x, 'x^2'], 'x^3': [x => x ** 3, 'x^3'], 'sqrt': [Math.sqrt, '\\sqrt{x}'], 'abs': [Math.abs, '|x|'], 'inv': [x => 1 / x, '\\frac{1}{x}'], 'exp': [x => 2 ** x, '2^x'], 'log': [Math.log2, '\\log_2 x'], 'sin': [Math.sin, '\\sin x'] };
    const sel = document.createElement('div'); sel.className = 'row'; sel.innerHTML = '<span>Базовая функция:</span><select aria-label="Функция">' + Object.keys(F).map(k => '<option value="' + k + '">' + F[k][1].replace(/\\frac\{1\}\{x\}/, '1/x').replace('\\sqrt{x}', '√x').replace('\\log_2 x', 'log₂ x').replace('\\sin x', 'sin x').replace('^2', '²').replace('^3', '³').replace('^x', 'ˣ') + '</option>').join('') + '</select>';
    el.appendChild(sel);
    let P;
    const s = setup(el, ro => {
      const [f0, t0] = F[sel.querySelector('select').value]; const { A, h, k } = v; P.size(); P.clear(); P.grid(1); const c = P.c;
      P.fn(f0, alpha(c.muted, .7), 2); P.fn(x => A * f0(x - h) + k, c.acc, 3);
      const inner = h ? (t0.includes('x') ? t0.replace(/x/g, '(x' + sg(-h, 1) + ')') : t0) : t0;
      ro.innerHTML = '<div class="bigf">' + K.tex('y = ' + (A === 1 ? '' : A === -1 ? '-' : tn(A, 1) + '\\cdot ') + inner + (k ? sg(k, 1) : '')) + '</div>Серый — исходный график ' + K.tex('y = ' + t0) + ', синий — преобразованный.<br>' +
        (h ? 'Сдвиг на ' + fmt(Math.abs(h), 1) + ' ' + (h > 0 ? 'вправо' : 'влево') + ' (внимание: ' + K.tex('x - h') + ', поэтому «минус» сдвигает вправо). ' : '') + (k ? 'Сдвиг на ' + fmt(Math.abs(k), 1) + ' ' + (k > 0 ? 'вверх' : 'вниз') + '. ' : '') + (A < 0 ? 'Отражение относительно оси x. ' : '') + (Math.abs(A) !== 1 ? (Math.abs(A) > 1 ? 'Растяжение' : 'Сжатие') + ' вдоль оси y в ' + fmt(Math.abs(A), 2) + ' раза. ' : '');
    });
    sel.querySelector('select').onchange = s.redraw;
    P = plane(el, { xmin: -8, xmax: 8, ymin: -6, ymax: 6, equal: true });
    const v = controls(el, [['A', 'Множитель $a$', -3, 3, 0.5, 1], ['h', 'Сдвиг $h$ по x', -5, 5, 0.5, 0], ['k', 'Сдвиг $k$ по y', -5, 5, 0.5, 0]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'график преобразования сдвиг');

  /* 10. Показательная и логарифмическая */
  L(5, 'logarithm', 'lab-explog', '🌱', 'Показательная и логарифм — зеркала', 'Графики a^x и log_a x симметричны относительно прямой y = x.', (el, K) => {
    let P;
    const s = setup(el, ro => {
      const { a } = v; P.size(); P.clear(); P.grid(1); const c = P.c;
      P.fn(x => x, alpha(c.muted, .8), 1.5); P.fn(x => a ** x, c.acc, 3); P.fn(x => Math.log(x) / Math.log(a), c.gold, 3, 0.0001, P.xmax);
      P.dot(0, 1, c.acc, 5, '(0; 1)'); P.dot(1, 0, c.gold, 5, '(1; 0)'); P.dot(1, a, c.acc, 4); P.dot(a, 1, c.gold, 4);
      ro.innerHTML = '<div class="bigf">' + K.tex('y = ' + tn(a) + '^x') + ' и ' + K.tex('y = \\log_{' + tn(a) + '} x') + '</div>' + (a > 1 ? 'a > 1: обе функции возрастают.' : a < 1 ? '0 < a < 1: обе функции убывают.' : 'a = 1 не допускается: ' + K.tex('1^x = 1') + ' — прямая, а логарифма по основанию 1 нет.') + ' Показательная функция всегда положительна и проходит через (0; 1); логарифм определён только при x > 0 и проходит через (1; 0). Точки (1; a) и (a; 1) — отражения друг друга.';
    });
    P = plane(el, { xmin: -5, xmax: 7, ymin: -4, ymax: 7, equal: true });
    const v = controls(el, [['a', 'Основание $a$', 0.2, 4, 0.1, 2]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'логарифм показательная функция');

  /* 11. Единичная окружность */
  L(6, 'unitcircle', 'lab-unitcircle', '⭕', 'Единичная окружность', 'Тяните точку по окружности: синус — высота, косинус — сдвиг по x.', (el, K) => {
    let P, ang = 30;
    const s = setup(el, ro => {
      P.size(); P.clear(); P.grid(0.5, false); const c = P.c; const r = ang * Math.PI / 180, x = Math.cos(r), y = Math.sin(r);
      P.circle(0, 0, 1, c.ink, 2);
      [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330].forEach(d => P.dot(Math.cos(d * Math.PI / 180), Math.sin(d * Math.PI / 180), alpha(c.muted, .7), 2.5));
      P.ctx.strokeStyle = c.gold; P.ctx.lineWidth = 2; P.ctx.beginPath(); P.ctx.arc(P.X(0), P.Y(0), 26, 0, -r, r > 0); P.ctx.stroke();
      P.seg(0, 0, x, y, c.ink, 2.5); P.seg(x, 0, x, y, c.bad, 4); P.seg(0, 0, x, 0, c.est, 4);
      if (Math.abs(x) > 0.02) { const t = y / x; if (Math.abs(t) < 4) { P.seg(1, P.ymin, 1, P.ymax, alpha(c.muted, .5), 1, [4, 4]); P.seg(0, 0, 1, t, alpha(c.ok, .9), 1.5, [5, 3]); P.seg(1, 0, 1, t, c.ok, 4); } }
      P.dot(x, y, c.acc, 8); P.text(x, y, '(' + fmt(x, 2) + '; ' + fmt(y, 2) + ')', c.acc, x >= 0 ? 10 : -10, y >= 0 ? -10 : 20, x >= 0 ? 'left' : 'right', 13);
      const nice = { 0: '0', 30: '\\frac{\\pi}{6}', 45: '\\frac{\\pi}{4}', 60: '\\frac{\\pi}{3}', 90: '\\frac{\\pi}{2}', 120: '\\frac{2\\pi}{3}', 135: '\\frac{3\\pi}{4}', 150: '\\frac{5\\pi}{6}', 180: '\\pi', 210: '\\frac{7\\pi}{6}', 225: '\\frac{5\\pi}{4}', 240: '\\frac{4\\pi}{3}', 270: '\\frac{3\\pi}{2}', 300: '\\frac{5\\pi}{3}', 315: '\\frac{7\\pi}{4}', 330: '\\frac{11\\pi}{6}', 360: '2\\pi' };
      const q = ang === 0 || ang === 360 ? 'на оси' : ang < 90 ? 'I четверть: sin > 0, cos > 0' : ang === 90 ? 'на оси' : ang < 180 ? 'II четверть: sin > 0, cos < 0' : ang === 180 ? 'на оси' : ang < 270 ? 'III четверть: sin < 0, cos < 0' : ang === 270 ? 'на оси' : 'IV четверть: sin < 0, cos > 0';
      ro.innerHTML = '<div class="bigf">' + K.tex(ang + '^\\circ = ' + (nice[ang] || tn(r, 3)) + '\\ \\text{рад}') + '</div>' + K.tex('\\sin\\alpha \\approx ' + tn(y, 3)) + ' (красный), ' + K.tex('\\cos\\alpha \\approx ' + tn(x, 3)) + ' (синий), ' + K.tex('\\tan\\alpha ' + (Math.abs(x) < 1e-9 ? '\\text{ не существует}' : '\\approx ' + tn(y / x, 3))) + ' (зелёный — на линии тангенсов).<br>' + q + '. Всегда ' + K.tex('\\sin^2\\alpha + \\cos^2\\alpha = 1') + ' — это теорема Пифагора для треугольника с гипотенузой-радиусом 1.';
    });
    P = plane(el, { xmin: -1.6, xmax: 1.6, ymin: -1.35, ymax: 1.35, equal: true, ratio: 0.8, maxH: 480 });
    P.drag((x, y) => { let d = Math.round(Math.atan2(y, x) * 180 / Math.PI); if (d < 0) d += 360; ang = d; sl.querySelector('input').value = d; sl.querySelector('output').textContent = d; s.redraw(); });
    const v = controls(el, [['a', 'Угол α, °', 0, 360, 1, 30]], K, () => { ang = v.a; s.redraw(); });
    const sl = el.querySelector('.ctrls label');
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'единичная окружность радиан синус');

  /* 12. Синусоида */
  L(6, 'trig-graphs', 'lab-sine', '〰️', 'Синусоида y = A·sin(Bx + C) + D', 'Амплитуда, период, сдвиг фазы и средняя линия.', (el, K) => {
    let P;
    const s = setup(el, ro => {
      const { A, B, C, Dd } = v; P.size(); P.clear(); P.grid(1); const c = P.c;
      P.fn(Math.sin, alpha(c.muted, .6), 1.5); P.fn(x => A * Math.sin(B * x + C) + Dd, c.acc, 3); P.seg(P.xmin, Dd, P.xmax, Dd, c.gold, 1.5, [6, 4]);
      const T = 2 * Math.PI / Math.abs(B);
      ro.innerHTML = '<div class="bigf">' + K.tex('y = ' + (A === 1 ? '' : A === -1 ? '-' : tn(A, 1)) + '\\sin(' + (B === 1 ? '' : tn(B, 1)) + 'x' + (C ? sg(C, 2) : '') + ')' + (Dd ? sg(Dd, 1) : '')) + '</div>Амплитуда ' + K.tex('|A| = ' + tn(Math.abs(A), 1)) + ', период ' + K.tex('T = \\frac{2\\pi}{|B|} \\approx ' + tn(T)) + ', средняя линия ' + K.tex('y = ' + tn(Dd, 1)) + ' (пунктир), область значений ' + K.tex('[' + tn(Dd - Math.abs(A), 1) + ';\\ ' + tn(Dd + Math.abs(A), 1) + ']') + '. Сдвиг по x: ' + K.tex('-\\frac{C}{B} \\approx ' + tn(-C / B)) + '.';
    });
    P = plane(el, { xmin: -7, xmax: 7, ymin: -4.5, ymax: 4.5, ratio: 0.55 });
    const v = controls(el, [['A', '$A$', -3, 3, 0.5, 2], ['B', '$B$', 0.5, 4, 0.5, 1], ['C', '$C$', -3.14, 3.14, 0.01, 0], ['Dd', '$D$', -2, 2, 0.5, 0]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'синусоида период амплитуда');

  /* 13. Векторы */
  L(6, 'vectors', 'lab-vectors', '➡️', 'Сложение векторов', 'Тяните концы векторов: сумма, разность, длина и скалярное произведение.', (el, K) => {
    let P; const a = [3, 1], b = [1, 3];
    const s = setup(el, ro => {
      P.size(); P.clear(); P.grid(1); const c = P.c;
      const sum = [a[0] + b[0], a[1] + b[1]];
      P.seg(a[0], a[1], sum[0], sum[1], alpha(c.gold, .6), 1.5, [5, 4]); P.seg(b[0], b[1], sum[0], sum[1], alpha(c.acc, .6), 1.5, [5, 4]);
      P.arrow(0, 0, sum[0], sum[1], c.ok, 3); P.arrow(0, 0, a[0], a[1], c.acc, 3.5); P.arrow(0, 0, b[0], b[1], c.gold, 3.5);
      P.text(a[0], a[1], 'a', c.acc, 8, 4); P.text(b[0], b[1], 'b', c.gold, 8, 4); P.text(sum[0], sum[1], 'a+b', c.ok, 8, 4);
      const la = Math.hypot(...a), lb = Math.hypot(...b), dot = a[0] * b[0] + a[1] * b[1]; const cosv = la && lb ? dot / (la * lb) : NaN;
      ro.innerHTML = K.tex('\\vec a = (' + tn(a[0], 1) + ';\\ ' + tn(a[1], 1) + '),\\ \\vec b = (' + tn(b[0], 1) + ';\\ ' + tn(b[1], 1) + '),\\ \\vec a + \\vec b = (' + tn(sum[0], 1) + ';\\ ' + tn(sum[1], 1) + ')') + '<br>' + K.tex('|\\vec a| = \\sqrt{' + tn(a[0], 1) + '^2 + ' + tn(a[1], 1) + '^2} \\approx ' + tn(la)) + ', ' + K.tex('|\\vec b| \\approx ' + tn(lb)) + '<br>' + K.tex('\\vec a \\cdot \\vec b = ' + tn(a[0], 1) + '\\cdot' + tn(b[0], 1) + ' + ' + tn(a[1], 1) + '\\cdot' + tn(b[1], 1) + ' = ' + tn(dot)) + (isFinite(cosv) ? ', угол ≈ ' + fmt(Math.acos(Math.max(-1, Math.min(1, cosv))) * 180 / Math.PI, 1) + '°' : '') + (Math.abs(dot) < 1e-9 && la && lb ? ' — векторы перпендикулярны!' : '') + '<br>Правило параллелограмма: сумма — диагональ, построенная на векторах.';
    });
    P = plane(el, { xmin: -6, xmax: 8, ymin: -4, ymax: 7, equal: true });
    P.drag((x, y) => { x = Math.round(x * 2) / 2; y = Math.round(y * 2) / 2; const da = Math.hypot(x - a[0], y - a[1]), db = Math.hypot(x - b[0], y - b[1]); const t = da <= db ? a : b; t[0] = x; t[1] = y; s.redraw(); });
    const hint = document.createElement('p'); hint.className = 'muted'; hint.textContent = 'Нажмите или ведите по полю — ближайший конец вектора переместится в эту точку.'; el.appendChild(hint);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'вектор сумма скалярное произведение');

  /* 14. Касательная и производная */
  const FN = { 'x^2': [x => x * x, x => 2 * x, 'x^2'], 'x^3-3x': [x => x ** 3 - 3 * x, x => 3 * x * x - 3, 'x^3 - 3x'], 'sin': [Math.sin, Math.cos, '\\sin x'], 'exp': [Math.exp, Math.exp, 'e^x'], 'sqrt': [Math.sqrt, x => 1 / (2 * Math.sqrt(x)), '\\sqrt{x}'] };
  const fnSelect = (el, keys) => { const d = document.createElement('div'); d.className = 'row'; d.innerHTML = '<span>Функция:</span><select aria-label="Функция">' + keys.map(k => '<option value="' + k + '">' + ({ 'x^2': 'x²', 'x^3-3x': 'x³ − 3x', sin: 'sin x', exp: 'eˣ', sqrt: '√x', '4-x^2': '4 − x²', '1/x': '1/x' }[k] || k) + '</option>').join('') + '</select>'; el.appendChild(d); return d.querySelector('select'); };
  L(7, 'derivative', 'lab-tangent', '📉', 'От секущей к касательной', 'Уменьшайте h — секущая превращается в касательную, а наклон — в производную.', (el, K) => {
    const sel = fnSelect(el, Object.keys(FN)); let P;
    const s = setup(el, ro => {
      const [f, df, t] = FN[sel.value]; let { x0, h } = v; if (sel.value === 'sqrt' && x0 <= 0.05) x0 = 0.25; P.size(); P.clear(); P.grid(1); const c = P.c;
      P.fn(f, c.ink, 2.5, sel.value === 'sqrt' ? 0 : P.xmin);
      const y0 = f(x0), x1 = x0 + h, y1 = f(x1), ms = (y1 - y0) / h, mt = df(x0);
      P.fn(x => y0 + ms * (x - x0), c.gold, 2); P.fn(x => y0 + mt * (x - x0), c.acc, 2.5);
      P.dot(x0, y0, c.acc, 6); P.dot(x1, y1, c.gold, 6);
      ro.innerHTML = '<div class="bigf">' + K.tex('f(x) = ' + t) + '</div>Наклон секущей (жёлтая): ' + K.tex('\\frac{f(x_0 + h) - f(x_0)}{h} = ' + tn(ms, 4)) + '<br>Наклон касательной (синяя): ' + K.tex("f'(" + tn(x0, 2) + ') = ' + tn(mt, 4)) + '<br>Разница: ' + fmt(Math.abs(ms - mt), 4) + '. Чем меньше h, тем ближе секущая к касательной — это и есть определение производной: ' + K.tex("f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}") + '.';
    });
    sel.onchange = s.redraw;
    P = plane(el, { xmin: -4, xmax: 4, ymin: -3.5, ymax: 5, equal: true });
    const v = controls(el, [['x0', '$x_0$', -2.5, 2.5, 0.05, 1], ['h', '$h$', 0.01, 2, 0.01, 1.5]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'производная касательная секущая предел');

  /* 15. Интеграл: суммы Римана */
  L(7, 'integral', 'lab-riemann', '▥', 'Площадь под кривой', 'Прямоугольники приближают площадь; чем их больше, тем точнее интеграл.', (el, K) => {
    const F2 = { 'x^2': [x => x * x, x => x ** 3 / 3, 'x^2'], '4-x^2': [x => 4 - x * x, x => 4 * x - x ** 3 / 3, '4 - x^2'], 'sin': [Math.sin, x => -Math.cos(x), '\\sin x'], 'sqrt': [Math.sqrt, x => 2 / 3 * x ** 1.5, '\\sqrt{x}'], 'exp': [Math.exp, Math.exp, 'e^x'] };
    const sel = fnSelect(el, Object.keys(F2)); const mode = document.createElement('div'); mode.className = 'row'; mode.innerHTML = '<span>Высота прямоугольника:</span><select aria-label="Точка"><option value="0">левый край</option><option value="0.5" selected>середина</option><option value="1">правый край</option></select>'; el.appendChild(mode);
    let P;
    const s = setup(el, ro => {
      const [f, Fp, t] = F2[sel.value]; let { a, b, n } = v; if (sel.value === 'sqrt') a = Math.max(0, a); if (b <= a) b = a + 0.5; const w = (b - a) / n, m = +mode.querySelector('select').value;
      P.size(); P.clear(); P.grid(1); const c = P.c; let sum = 0;
      for (let i = 0; i < n; i++) { const x = a + i * w, hgt = f(x + m * w); sum += hgt * w; P.poly([[x, 0], [x + w, 0], [x + w, hgt], [x, hgt]], alpha(hgt >= 0 ? c.acc : c.bad, .28), alpha(hgt >= 0 ? c.acc : c.bad, .9), 1); }
      P.fn(f, c.ink, 2.5, sel.value === 'sqrt' ? 0 : P.xmin);
      const ex = Fp(b) - Fp(a);
      ro.innerHTML = '<div class="bigf">' + K.tex('\\int_{' + tn(a, 1) + '}^{' + tn(b, 1) + '} ' + t + '\\,dx = ' + tn(ex, 4)) + '</div>Сумма ' + n + ' прямоугольников: ' + K.tex('\\approx ' + tn(sum, 4)) + ', ошибка ' + fmt(Math.abs(sum - ex), 4) + '. Увеличивайте n — ошибка стремится к нулю. Точное значение даёт формула Ньютона — Лейбница: ' + K.tex('\\int_a^b f(x)\\,dx = F(b) - F(a)') + '. Красные прямоугольники (ниже оси) входят в интеграл со знаком минус.';
    });
    sel.onchange = s.redraw; mode.querySelector('select').onchange = s.redraw;
    P = plane(el, { xmin: -1, xmax: 4.5, ymin: -1.5, ymax: 5, equal: true });
    const v = controls(el, [['a', '$a$', -1, 3, 0.1, 0], ['b', '$b$', 0, 4, 0.1, 2], ['n', '$n$ прямоугольников', 1, 100, 1, 6]], K, s.redraw);
    el.appendChild(s.ro); s.redraw(); s.onResize(() => P.size());
  }, 'интеграл площадь сумма Римана');

  /* 16. Кубики: закон больших чисел */
  L(8, 'probability', 'lab-dice', '🎲', 'Бросаем кубики', 'Сотни бросков за секунду: частота приближается к вероятности.', (el, K) => {
    const st = { n: 0, cnt: {} };
    const mode = document.createElement('div'); mode.className = 'row'; mode.innerHTML = '<span>Что считаем:</span><select aria-label="Режим"><option value="1">один кубик</option><option value="2" selected>сумма двух кубиков</option></select><button class="btn" data-r="1">+1</button><button class="btn" data-r="10">+10</button><button class="btn primary" data-r="1000">+1000</button><button class="btn ghost" data-r="0">Сброс</button>';
    el.appendChild(mode);
    const fig = document.createElement('div'); el.appendChild(fig);
    const s = setup(el, ro => {
      const two = mode.querySelector('select').value === '2', c = col(); const vals = two ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6];
      const th = x => two ? (6 - Math.abs(7 - x)) / 36 : 1 / 6; const W = 560, H = 230, bw = W / vals.length; const top = two ? 0.25 : 0.4;
      let svg = '<svg viewBox="0 0 ' + W + ' ' + (H + 26) + '">';
      vals.forEach((x, i) => { const fr = st.n ? (st.cnt[x] || 0) / st.n : 0; const hh = Math.min(1, fr / top) * H, ht = th(x) / top * H; svg += '<rect x="' + (i * bw + 4) + '" y="' + (H - hh) + '" width="' + (bw - 8) + '" height="' + hh + '" rx="3" fill="' + c.acc + '" opacity=".8"/><line x1="' + (i * bw + 2) + '" x2="' + (i * bw + bw - 2) + '" y1="' + (H - ht) + '" y2="' + (H - ht) + '" stroke="' + c.gold + '" stroke-width="3"/><text x="' + (i * bw + bw / 2) + '" y="' + (H + 18) + '" text-anchor="middle" fill="' + c.ink + '" font-size="14" font-family="system-ui">' + x + '</text>'; });
      fig.innerHTML = svg + '</svg>';
      const best = two ? 7 : null; const mean = st.n ? Object.keys(st.cnt).reduce((s2, k) => s2 + k * st.cnt[k], 0) / st.n : 0;
      ro.innerHTML = 'Бросков: <b>' + st.n + '</b>. Синие столбики — частоты, жёлтые черты — теоретические вероятности' + (two ? ' ' + K.tex('P(\\text{сумма} = k) = \\frac{6 - |7 - k|}{36}') : ' ' + K.tex('\\frac{1}{6}')) + '.<br>Средний результат: ' + fmt(mean, 3) + ' (математическое ожидание ' + (two ? '7' : '3,5') + ').' + (two ? ' Сумма ' + best + ' выпадает чаще всего: её дают 6 комбинаций из 36.' : '') + ' Чем больше бросков, тем ближе частоты к вероятностям — это **закон больших чисел**.'.replace(/\*\*(.+?)\*\*/, '<b>$1</b>');
    });
    mode.querySelector('select').onchange = () => { st.n = 0; st.cnt = {}; s.redraw(); };
    mode.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const k = +b.dataset.r; if (!k) { st.n = 0; st.cnt = {}; } const two = mode.querySelector('select').value === '2'; for (let i = 0; i < k; i++) { const x = 1 + Math.floor(Math.random() * 6) + (two ? 1 + Math.floor(Math.random() * 6) : 0); st.cnt[x] = (st.cnt[x] || 0) + 1; st.n++; } s.redraw(); });
    el.appendChild(s.ro); s.redraw();
  }, 'вероятность кубик частота закон больших чисел');
  /* 17. Кредитный калькулятор */
  L(5, 'finance', 'lab-loan', '🏦', 'Кредитный калькулятор', 'Сумма, ставка и срок: ежемесячный платёж, переплата и как тает долг.', (el, K) => {
    let P;
    const s = setup(el, ro => {
      const S = v.S, i = v.r / 100 / 12, n = v.y * 12;
      const A = i ? S * i / (1 - (1 + i) ** -n) : S / n;
      P.xmin = -0.03 * v.y; P.xmax = v.y * 1.04; P.ymin = -S * 0.03; P.ymax = S * 1.12; P.size(); P.clear(); const c = P.c, ctx = P.ctx;
      ctx.strokeStyle = c.line; ctx.lineWidth = 1; ctx.fillStyle = c.muted; ctx.font = '12px system-ui'; ctx.textAlign = 'center';
      const stepY = v.y <= 10 ? 1 : 5; for (let t = 0; t <= v.y; t += stepY) { ctx.beginPath(); ctx.moveTo(P.X(t), 0); ctx.lineTo(P.X(t), P.h - 18); ctx.stroke(); ctx.fillText(t + (t ? ' г.' : ''), P.X(t), P.h - 4); }
      ctx.textAlign = 'left'; for (let q = 1; q <= 4; q++) { const y = S * q / 4; ctx.beginPath(); ctx.moveTo(0, P.Y(y)); ctx.lineTo(P.w, P.Y(y)); ctx.stroke(); ctx.fillText(Math.round(y).toLocaleString('ru-RU') + ' €', 4, P.Y(y) - 3); }
      let bal = S, paidInt = 0; const pb = [[0, S]], pi = [[0, 0]];
      for (let m = 1; m <= n; m++) { const int = bal * i; paidInt += int; bal -= A - int; if (m % 3 === 0 || m === n) { pb.push([m / 12, Math.max(0, bal)]); pi.push([m / 12, paidInt]); } }
      P.poly([...pb, [v.y, 0], [0, 0]], alpha(c.acc, .15), null);
      const line = (pts, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], k) => k ? ctx.lineTo(P.X(x), P.Y(y)) : ctx.moveTo(P.X(x), P.Y(y))); ctx.stroke(); };
      line(pb, c.acc, 3); line(pi, c.bad, 3);
      const total = A * n;
      ro.innerHTML = '<div class="bigf">' + K.tex('A = ' + tn(S, 0) + ' \\cdot \\frac{' + tn(i, 5) + '}{1 - ' + tn(1 + i, 5) + '^{-' + n + '}} \\approx ' + tn(A, 2) + '\\text{ €}') + '</div>Ежемесячный платёж <b>' + fmt(A, 2) + ' €</b>, всего выплатите <b>' + fmt(total, 0) + ' €</b>, из них проценты (переплата) <b style="color:var(--bad)">' + fmt(total - S, 0) + ' €</b> — это ' + fmt(100 * (total - S) / S, 1) + '% от суммы кредита.<br>Синяя линия — остаток долга, красная — уже выплаченные проценты. Попробуйте удвоить срок: платёж уменьшится, а переплата вырастет.';
    });
    P = plane(el, { xmin: 0, xmax: 5, ymin: 0, ymax: 11000, ratio: 0.5, maxH: 340 });
    const v = controls(el, [['S', 'Сумма, €', 1000, 50000, 500, 10000], ['r', 'Ставка, % годовых', 0, 20, 0.5, 6], ['y', 'Срок, лет', 1, 30, 1, 5]], K, s.redraw);
    el.appendChild(s.ro); s.redraw();
  }, 'кредит аннуитет проценты калькулятор');
})();
