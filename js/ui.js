// Общие UI-компоненты: тосты, модальные окна, конфетти, панель испанских символов, поле ввода.

const UI = {
  toast(msg, kind = '') {
    const box = document.getElementById('toasts');
    const t = h('div', { class: 'toast ' + kind }, msg);
    box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3100);
  },

  xpPop(n) {
    const el = h('div', { class: 'xp-pop' }, '+' + n + ' XP');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  },

  modal(title, body, actions = []) {
    const close = () => overlay.remove();
    const overlay = h('div', { class: 'modal-overlay', onclick: e => { if (e.target === overlay) close(); } },
      h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
        h('div', { class: 'modal-head' }, h('h3', null, title), h('button', { class: 'icon-btn', onclick: close, 'aria-label': 'Закрыть' }, '✕')),
        h('div', { class: 'modal-body' }, body),
        actions.length ? h('div', { class: 'modal-actions' }, actions.map(a =>
          h('button', { class: 'btn ' + (a.kind || ''), onclick: () => { if (a.onclick?.() !== false) close(); } }, a.label))) : null,
      ));
    document.body.appendChild(overlay);
    return close;
  },

  confirm(title, text, onYes) {
    this.modal(title, h('p', null, text), [
      { label: 'Отмена' },
      { label: 'Да', kind: 'danger', onclick: onYes },
    ]);
  },

  confetti() {
    const canvas = h('canvas', { class: 'confetti' });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const colors = ['#e63946', '#f4a261', '#ffd166', '#2a9d8f', '#457b9d', '#c1121f'];
    const parts = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4,
      r: 4 + Math.random() * 6, c: pick(colors), a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.3,
    }));
    let frame = 0;
    const step = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.a += p.va;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      }
      if (++frame < 180) requestAnimationFrame(step); else canvas.remove();
    };
    step();
  },

  // Поле ввода с панелью испанских символов
  input(opts = {}) {
    const input = h('input', {
      type: 'text', class: 'answer-input', placeholder: opts.placeholder || 'Ваш ответ…',
      autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', lang: 'es',
    });
    if (opts.onEnter) input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); opts.onEnter(input.value); } });
    const keys = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];
    const bar = h('div', { class: 'accent-bar' }, keys.map(k => h('button', {
      type: 'button', class: 'accent-key', tabindex: '-1',
      onmousedown: e => e.preventDefault(),
      onclick: () => {
        const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? input.value.length;
        input.value = input.value.slice(0, s) + k + input.value.slice(e);
        input.setSelectionRange(s + 1, s + 1);
        input.focus();
      },
    }, k)));
    const wrap = h('div', { class: 'input-wrap' }, input, bar);
    wrap.input = input;
    return wrap;
  },

  progressBar(value, max, cls = '') {
    const pct = max ? Math.min(100, (value / max) * 100) : 0;
    return h('div', { class: 'progress ' + cls }, h('div', { class: 'progress-fill', style: { width: pct + '%' } }));
  },

  pageHeader(title, subtitle, back) {
    return h('div', { class: 'page-header' },
      back ? h('a', { class: 'back-link', href: back }, '← Назад') : null,
      h('h1', null, title),
      subtitle ? h('p', { class: 'muted' }, subtitle) : null);
  },
};

// Горячие клавиши испанских символов: Alt+буква (a e i o u n) в любом поле ввода
document.addEventListener('keydown', e => {
  if (!e.altKey || e.ctrlKey || e.metaKey) return;
  const t = e.target;
  if (!(t instanceof HTMLInputElement) || t.type !== 'text') return;
  const map = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', n: 'ñ', '?': '¿', '!': '¡' };
  const ch = map[e.key.toLowerCase()];
  if (!ch) return;
  e.preventDefault();
  const s = t.selectionStart, en = t.selectionEnd;
  t.value = t.value.slice(0, s) + ch + t.value.slice(en);
  t.setSelectionRange(s + 1, s + 1);
});
