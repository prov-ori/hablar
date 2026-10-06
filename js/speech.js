// Синтез речи (TTS), распознавание (STT) и звуковые эффекты.

const Speech = {
  voices: [],

  init() {
    if (!('speechSynthesis' in window)) return;
    const load = () => {
      this.voices = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
    };
    load();
    speechSynthesis.addEventListener?.('voiceschanged', load);
  },

  get canSpeak() { return 'speechSynthesis' in window; },

  get canListen() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },

  speak(text, opts = {}) {
    if (!this.canSpeak) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.rate = opts.rate ?? Store.settings.ttsRate;
    const chosen = this.voices.find(v => v.name === Store.settings.voice) || this.voices.find(v => v.lang === 'es-ES') || this.voices[0];
    if (chosen) { u.voice = chosen; u.lang = chosen.lang; }
    if (opts.onend) u.onend = opts.onend;
    speechSynthesis.speak(u);
  },

  listen({ onResult, onError, onEnd }) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onError?.('Распознавание речи не поддерживается этим браузером'); return null; }
    const r = new SR();
    r.lang = 'es-ES';
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onresult = e => onResult([...e.results[0]].map(a => a.transcript));
    r.onerror = e => onError?.(e.error === 'not-allowed' ? 'Нет доступа к микрофону' : 'Ошибка: ' + e.error);
    r.onend = () => onEnd?.();
    r.start();
    return r;
  },
};

// Небольшой кнопочный помощник «озвучить»
function speakBtn(text, opts = {}) {
  return h('button', {
    class: 'speak-btn' + (opts.big ? ' big' : ''), type: 'button', title: 'Озвучить',
    'aria-label': 'Озвучить',
    onclick: e => { e.stopPropagation(); Speech.speak(text, opts); },
  }, opts.slow ? '🐢' : '🔊');
}

const SFX = {
  ctx: null,
  tone(freqs, dur = 0.12, type = 'sine', gap = 0.09) {
    if (!Store.settings.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = this.ctx.currentTime;
      freqs.forEach((f, i) => {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + i * gap);
        g.gain.exponentialRampToValueAtTime(0.18, t0 + i * gap + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * gap + dur);
        o.connect(g).connect(this.ctx.destination);
        o.start(t0 + i * gap);
        o.stop(t0 + i * gap + dur + 0.02);
      });
    } catch (e) { /* без звука */ }
  },
  correct() { this.tone([660, 880]); },
  wrong() { this.tone([220, 180], 0.18, 'square', 0.12); },
  finish() { this.tone([523, 659, 784, 1047], 0.18); },
  achievement() { this.tone([784, 988, 1175, 1568], 0.2, 'triangle', 0.1); },
  click() { this.tone([440], 0.05); },
};
