// Общие утилиты: DOM-хелпер, нормализация ответов, случайности, числа и время по-испански.

function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') {
        for (const [prop, val] of Object.entries(v)) {
          if (prop.startsWith('--')) el.style.setProperty(prop, val); else el.style[prop] = val;
        }
      }
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) appendChildren(el, c);
    else if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function sample(arr, n) { return shuffle(arr).slice(0, n); }

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function normalizeAnswer(s) {
  return String(s)
    .toLowerCase()
    .replace(/[¿?¡!.,;:«»"()…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ARTICLE_RE = /^(el|la|los|las|un|una|unos|unas)\s+/;

function stripArticle(s) { return s.replace(ARTICLE_RE, ''); }

// Сравнивает ответ с эталоном (эталон может содержать варианты через « / »).
// Возвращает { ok, note }: ok=true при точном совпадении или «почти» (без ударений / без артикля).
function checkAnswer(input, expected, opts = {}) {
  const strict = opts.strict ?? (typeof Store !== 'undefined' && Store.settings.strictAccents);
  const variants = String(expected).split('/').map(normalizeAnswer).filter(Boolean);
  const got = normalizeAnswer(input);
  if (!got) return { ok: false };
  for (const v of variants) {
    if (got === v) return { ok: true };
  }
  for (const v of variants) {
    if (stripAccents(got) === stripAccents(v)) {
      return strict
        ? { ok: false, note: 'Проверьте ударения и ñ' }
        : { ok: true, note: 'Почти! Обратите внимание на ударения: ' + v };
    }
    if (ARTICLE_RE.test(v) && stripAccents(got) === stripAccents(stripArticle(v))) {
      return { ok: true, note: 'Верно, но не забывайте артикль: ' + v };
    }
  }
  return { ok: false };
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  a = stripAccents(normalizeAnswer(a));
  b = stripAccents(normalizeAnswer(b));
  if (!a && !b) return 1;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

function todayKey(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

// ---------- Числа по-испански ----------
const ES_UNITS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const ES_TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const ES_HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function below100(n) {
  if (n < 30) return ES_UNITS[n];
  const t = Math.floor(n / 10), u = n % 10;
  return ES_TENS[t] + (u ? ' y ' + ES_UNITS[u] : '');
}

function below1000(n) {
  if (n === 100) return 'cien';
  const c = Math.floor(n / 100), r = n % 100;
  const parts = [];
  if (c) parts.push(ES_HUNDREDS[c]);
  if (r || !c) parts.push(below100(r));
  return parts.join(' ');
}

// «uno» перед существительным/тысячей сокращается до «un»
function apocope(s) { return s.replace(/veintiuno$/, 'veintiún').replace(/(^| )uno$/, '$1un'); }

function numberToSpanish(n) {
  if (n < 0) return 'menos ' + numberToSpanish(-n);
  if (n < 1000) return below1000(n);
  if (n < 1000000) {
    const th = Math.floor(n / 1000), r = n % 1000;
    const head = th === 1 ? 'mil' : apocope(below1000(th)) + ' mil';
    return r ? head + ' ' + below1000(r) : head;
  }
  const mi = Math.floor(n / 1000000), r = n % 1000000;
  const head = mi === 1 ? 'un millón' : apocope(numberToSpanish(mi)) + ' millones';
  return r ? head + ' ' + numberToSpanish(r) : head;
}

// ---------- Время по-испански ----------
function timeToSpanish(hh, mm) {
  let hour = hh % 12;
  let mins = mm;
  let joiner = 'y';
  if (mm > 30) { hour = (hour + 1) % 12; mins = 60 - mm; joiner = 'menos'; }
  const hourWord = hour === 0 ? 'doce' : hour === 1 ? 'una' : numberToSpanish(hour);
  const verb = hour === 1 ? 'Es la' : 'Son las';
  let minWord = '';
  if (mins === 0) minWord = '';
  else if (mins === 15) minWord = ' ' + joiner + ' cuarto';
  else if (mins === 30) minWord = ' y media';
  else minWord = ' ' + joiner + ' ' + numberToSpanish(mins);
  return `${verb} ${hourWord}${minWord}`;
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
