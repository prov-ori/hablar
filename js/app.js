// Роутер, шапка, навигация, запуск.

const Views = {};
let currentCleanup = null;

const NAV = [
  { href: '#/', icon: '🏠', label: 'Главная' },
  { href: '#/path', icon: '🗺️', label: 'Курс' },
  { href: '#/review', icon: '🧠', label: 'Повторение' },
  { href: '#/verbs', icon: '⚙️', label: 'Глаголы' },
  { href: '#/grammar', icon: '📐', label: 'Грамматика' },
  { href: '#/stories', icon: '📖', label: 'Чтение' },
  { href: '#/dialogues', icon: '💬', label: 'Диалоги' },
  { href: '#/games', icon: '🎮', label: 'Игры' },
  { href: '#/dictionary', icon: '🔎', label: 'Словарь' },
  { href: '#/culture', icon: '🌎', label: 'Культура' },
  { href: '#/profile', icon: '🏆', label: 'Профиль' },
  { href: '#/settings', icon: '⚙', label: 'Настройки' },
];

// Порядок важен: более конкретные шаблоны выше
const ROUTES = [
  [/^\/$/, 'home'],
  [/^\/path$/, 'path'],
  [/^\/lesson\/([\w-]+)\/(\d+)$/, 'lesson'],
  [/^\/review$/, 'review'],
  [/^\/verbs$/, 'verbs'],
  [/^\/verbs\/train$/, 'verbTrainer'],
  [/^\/verbs\/([^/]+)$/, 'verbTable'],
  [/^\/grammar$/, 'grammar'],
  [/^\/grammar\/([\w-]+)$/, 'grammarTopic'],
  [/^\/stories$/, 'stories'],
  [/^\/stories\/([\w-]+)$/, 'story'],
  [/^\/dialogues$/, 'dialogues'],
  [/^\/dialogues\/([\w-]+)$/, 'dialogue'],
  [/^\/games$/, 'games'],
  [/^\/games\/([\w-]+)$/, 'game'],
  [/^\/dictionary$/, 'dictionary'],
  [/^\/culture$/, 'culture'],
  [/^\/profile$/, 'profile'],
  [/^\/settings$/, 'settings'],
];

function navigate(hash) { location.hash = hash; }

function render() {
  const path = decodeURIComponent((location.hash || '#/').slice(1)) || '/';
  let view = null, params = [];
  for (const [re, name] of ROUTES) {
    const m = path.match(re);
    if (m) { view = name; params = m.slice(1); break; }
  }
  if (currentCleanup) { try { currentCleanup(); } catch (e) { console.error(e); } currentCleanup = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();

  const main = document.getElementById('main');
  main.innerHTML = '';
  const fn = Views[view] || Views.notFound;
  const ctx = { onCleanup: f => { currentCleanup = f; } };
  try {
    const node = fn(params, ctx);
    if (node) main.appendChild(node);
  } catch (e) {
    console.error(e);
    main.appendChild(h('div', { class: 'card' }, h('h2', null, 'Что-то пошло не так'), h('p', { class: 'muted' }, String(e.message || e))));
  }
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);

  // подсветка навигации
  const base = '#/' + path.split('/')[1];
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === '#/' ? path === '/' : base === href || (href === '#/path' && path.startsWith('/lesson')));
  });
  // уроки — полноэкранный режим без отвлекающей навигации
  document.body.classList.toggle('focus-mode', view === 'lesson');
  updateHeader();
}

function updateHeader() {
  const s = Store.state;
  const lvl = Store.level();
  const el = document.getElementById('header-stats');
  if (!el) return;
  el.innerHTML = '';
  el.append(
    h('span', { class: 'stat-chip', title: 'Серия дней' }, h('span', { class: s.streak ? 'flame on' : 'flame' }, '🔥'), s.streak),
    h('span', { class: 'stat-chip', title: 'Опыт' }, '⭐', s.xp),
    h('a', { class: 'stat-chip level', href: '#/profile', title: `Уровень ${lvl.level}: ${lvl.into}/${lvl.need} XP` },
      'Ур. ' + lvl.level,
      h('span', { class: 'mini-progress' }, h('span', { style: { width: (lvl.into / lvl.need) * 100 + '%' } }))),
  );
  const due = Store.srsDue().length;
  const badge = document.getElementById('review-badge');
  if (badge) { badge.textContent = due > 99 ? '99+' : due; badge.hidden = !due; }
}

function applyTheme() {
  const t = Store.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

function buildShell() {
  const nav = document.getElementById('nav');
  nav.append(...NAV.map(n => h('a', { href: n.href },
    h('span', { class: 'nav-icon' }, n.icon),
    h('span', { class: 'nav-label' }, n.label),
    n.href === '#/review' ? h('span', { class: 'badge', id: 'review-badge', hidden: true }) : null)));
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark'
      || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    Store.settings.theme = dark ? 'light' : 'dark';
    Store.save();
    applyTheme();
  });
}

Views.notFound = () => h('div', { class: 'card center' },
  h('div', { class: 'big-emoji' }, '🤷'),
  h('h2', null, 'Страница не найдена'),
  h('a', { class: 'btn primary', href: '#/' }, 'На главную'));

document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  applyTheme();
  Speech.init();
  buildShell();
  window.addEventListener('hashchange', render);
  render();
});
