// Состояние пользователя: XP, серия дней, прогресс уроков, интервальное повторение (SRS), достижения, настройки.

const STORE_KEY = 'hablar.v1';

const DEFAULT_STATE = () => ({
  xp: 0,
  activity: {},          // 'YYYY-MM-DD' -> XP за день
  streak: 0,
  bestStreak: 0,
  lastDay: null,
  lessons: {},           // 'unitId:lessonIdx' -> { stars, best, times }
  srs: {},               // 'es' -> { ru, due, interval, ease, reps, lapses }
  achievements: {},      // id -> timestamp
  stats: {
    correct: 0, wrong: 0, lessons: 0, reviews: 0, conjugations: 0,
    games: 0, stories: {}, grammar: {}, dialogues: {}, perfectLessons: 0,
    spoken: 0, bestSpeed: 0, numbers: 0, gameBest: {},
  },
  settings: {
    dailyGoal: 50, ttsRate: 0.9, voice: '', strictAccents: false,
    sound: true, theme: 'auto', unlockAll: false, name: '',
  },
});

const Store = {
  state: null,

  load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { /* приватный режим */ }
    const base = DEFAULT_STATE();
    this.state = saved ? deepMerge(base, saved) : base;
    this.checkStreak();
  },

  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); } catch (e) { /* ignore */ }
  },

  get settings() { return this.state.settings; },
  get stats() { return this.state.stats; },

  reset() {
    this.state = DEFAULT_STATE();
    this.save();
  },

  exportJSON() { return JSON.stringify(this.state, null, 2); },

  importJSON(text) {
    const data = JSON.parse(text);
    if (typeof data !== 'object' || data == null || typeof data.xp !== 'number') throw new Error('Неверный формат');
    this.state = deepMerge(DEFAULT_STATE(), data);
    this.save();
  },

  // ---------- XP / уровни / серия ----------
  level() { return levelFromXp(this.state.xp); },

  todayXp() { return this.state.activity[todayKey()] || 0; },

  checkStreak() {
    const s = this.state;
    if (!s.lastDay) return;
    const gap = daysBetween(s.lastDay, todayKey());
    if (gap > 1) s.streak = 0;
  },

  addXp(amount, reason) {
    if (amount <= 0) return;
    const s = this.state;
    const today = todayKey();
    const prevLevel = this.level().level;
    const hadToday = (s.activity[today] || 0) > 0;
    s.xp += amount;
    s.activity[today] = (s.activity[today] || 0) + amount;
    if (!hadToday) {
      if (s.lastDay && daysBetween(s.lastDay, today) === 1) s.streak += 1;
      else if (s.lastDay !== today) s.streak = 1;
      s.lastDay = today;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
    }
    this.save();
    UI.xpPop(amount);
    const lvl = this.level().level;
    if (lvl > prevLevel) UI.toast(`🎉 Новый уровень: ${lvl}!`, 'gold');
    if (s.activity[today] >= s.settings.dailyGoal && s.activity[today] - amount < s.settings.dailyGoal) {
      UI.toast('🎯 Дневная цель выполнена!', 'gold');
    }
    this.checkAchievements();
    updateHeader();
  },

  answer(correct) {
    if (correct) this.stats.correct++; else this.stats.wrong++;
    this.save();
  },

  // ---------- Уроки ----------
  lessonKey(unitId, idx) { return unitId + ':' + idx; },

  lessonDone(unitId, idx) { return !!this.state.lessons[this.lessonKey(unitId, idx)]; },

  completeLesson(unitId, idx, accuracy) {
    const key = this.lessonKey(unitId, idx);
    const stars = accuracy >= 1 ? 3 : accuracy >= 0.8 ? 2 : 1;
    const prev = this.state.lessons[key] || { stars: 0, times: 0 };
    this.state.lessons[key] = { stars: Math.max(prev.stars, stars), times: prev.times + 1, last: Date.now() };
    this.stats.lessons++;
    if (accuracy >= 1) this.stats.perfectLessons++;
    this.save();
    return stars;
  },

  // ---------- SRS (упрощённый SM-2) ----------
  srsAdd(es, ru) {
    if (this.state.srs[es]) return false;
    this.state.srs[es] = { ru, due: Date.now(), interval: 0, ease: 2.5, reps: 0, lapses: 0 };
    this.save();
    return true;
  },

  srsHas(es) { return !!this.state.srs[es]; },

  srsRemove(es) { delete this.state.srs[es]; this.save(); },

  srsDue() {
    const now = Date.now();
    return Object.entries(this.state.srs)
      .filter(([, c]) => c.due <= now)
      .sort((a, b) => a[1].due - b[1].due)
      .map(([es, c]) => ({ es, ...c }));
  },

  // grade: 0 = снова, 1 = трудно, 2 = хорошо, 3 = легко
  srsGrade(es, grade) {
    const c = this.state.srs[es];
    if (!c) return;
    const DAY = 86400000;
    if (grade === 0) {
      c.reps = 0;
      c.lapses++;
      c.interval = 0;
      c.ease = Math.max(1.3, c.ease - 0.2);
      c.due = Date.now() + 60 * 1000;
    } else {
      c.reps++;
      if (c.reps === 1) c.interval = grade === 3 ? 3 : 1;
      else if (c.reps === 2) c.interval = grade === 3 ? 7 : grade === 1 ? 2 : 4;
      else c.interval = Math.round(c.interval * (grade === 1 ? 1.2 : grade === 3 ? c.ease * 1.3 : c.ease));
      c.ease = Math.max(1.3, c.ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0));
      c.due = Date.now() + c.interval * DAY;
    }
    this.stats.reviews++;
    this.save();
  },

  srsStrength(es) {
    const c = this.state.srs[es];
    if (!c) return 0;
    return Math.min(1, c.interval / 21);
  },

  // ---------- Достижения ----------
  unlock(id) {
    if (this.state.achievements[id]) return;
    this.state.achievements[id] = Date.now();
    this.save();
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a) {
      UI.toast(`${a.icon} Достижение: ${a.title}`, 'gold');
      SFX.achievement();
    }
  },

  checkAchievements() {
    for (const a of ACHIEVEMENTS) {
      if (!this.state.achievements[a.id] && a.test(this.state)) this.unlock(a.id);
    }
  },
};

function levelFromXp(xp) {
  // Каждый следующий уровень требует на 50 XP больше: 100, 150, 200…
  let level = 1, need = 100, rest = xp;
  while (rest >= need) { rest -= need; level++; need += 50; }
  return { level, into: rest, need };
}

function deepMerge(base, extra) {
  for (const [k, v] of Object.entries(extra)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') base[k] = deepMerge(base[k], v);
    else base[k] = v;
  }
  return base;
}

const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: '🌱', title: 'Primer paso', desc: 'Пройти первый урок', test: s => s.stats.lessons >= 1 },
  { id: 'lessons10', icon: '📗', title: 'Estudiante', desc: 'Пройти 10 уроков', test: s => s.stats.lessons >= 10 },
  { id: 'lessons50', icon: '📚', title: 'Erudito', desc: 'Пройти 50 уроков', test: s => s.stats.lessons >= 50 },
  { id: 'perfect', icon: '💎', title: 'Perfección', desc: 'Пройти урок без ошибок', test: s => s.stats.perfectLessons >= 1 },
  { id: 'perfect10', icon: '👑', title: 'Impecable', desc: '10 уроков без ошибок', test: s => s.stats.perfectLessons >= 10 },
  { id: 'streak3', icon: '🔥', title: 'En racha', desc: 'Серия 3 дня', test: s => s.bestStreak >= 3 },
  { id: 'streak7', icon: '🌋', title: 'Imparable', desc: 'Серия 7 дней', test: s => s.bestStreak >= 7 },
  { id: 'streak30', icon: '☀️', title: 'Constancia', desc: 'Серия 30 дней', test: s => s.bestStreak >= 30 },
  { id: 'xp500', icon: '⭐', title: 'Quinientos', desc: 'Набрать 500 XP', test: s => s.xp >= 500 },
  { id: 'xp2000', icon: '🌟', title: 'Dos mil', desc: 'Набрать 2000 XP', test: s => s.xp >= 2000 },
  { id: 'xp10000', icon: '🏆', title: 'Leyenda', desc: 'Набрать 10 000 XP', test: s => s.xp >= 10000 },
  { id: 'srs50', icon: '🧠', title: 'Memoria', desc: '50 слов в колоде повторения', test: s => Object.keys(s.srs).length >= 50 },
  { id: 'srs200', icon: '🗃️', title: 'Diccionario vivo', desc: '200 слов в колоде', test: s => Object.keys(s.srs).length >= 200 },
  { id: 'reviews100', icon: '🔁', title: 'Repaso', desc: '100 повторений карточек', test: s => s.stats.reviews >= 100 },
  { id: 'conj50', icon: '⚙️', title: 'Conjugador', desc: '50 верных спряжений', test: s => s.stats.conjugations >= 50 },
  { id: 'conj300', icon: '🛠️', title: 'Maestro verbal', desc: '300 верных спряжений', test: s => s.stats.conjugations >= 300 },
  { id: 'story1', icon: '📖', title: 'Lector', desc: 'Прочитать рассказ', test: s => Object.keys(s.stats.stories).length >= 1 },
  { id: 'story5', icon: '📜', title: 'Bibliófilo', desc: 'Прочитать 5 рассказов', test: s => Object.keys(s.stats.stories).length >= 5 },
  { id: 'grammar5', icon: '📐', title: 'Gramático', desc: 'Сдать 5 тем грамматики', test: s => Object.keys(s.stats.grammar).length >= 5 },
  { id: 'dialog3', icon: '💬', title: 'Conversador', desc: 'Пройти 3 диалога', test: s => Object.keys(s.stats.dialogues).length >= 3 },
  { id: 'games10', icon: '🎮', title: 'Jugador', desc: 'Сыграть 10 игр', test: s => s.stats.games >= 10 },
  { id: 'speed20', icon: '⚡', title: 'Rayo', desc: '20+ очков в «Контрольном времени»', test: s => s.stats.bestSpeed >= 20 },
  { id: 'speak10', icon: '🎙️', title: 'Pronunciación', desc: '10 удачных произношений', test: s => s.stats.spoken >= 10 },
  { id: 'numbers20', icon: '🔢', title: 'Matemático', desc: '20 верно названных чисел', test: s => s.stats.numbers >= 20 },
  { id: 'correct1000', icon: '🎯', title: 'Mil aciertos', desc: '1000 правильных ответов', test: s => s.stats.correct >= 1000 },
];
