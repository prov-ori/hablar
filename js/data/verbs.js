// Движок спряжения: правильные глаголы генерируются по правилам,
// неправильные описываются чередованиями (sc), особой формой yo, сильной основой претерита
// и, где нужно, полными таблицами (forms).

const PERSONS = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes'];
const PERSONS_SHORT = ['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos'];

const TENSES = [
  { id: 'presente', es: 'Presente', ru: 'Настоящее время', level: 'A1', hint: 'Действие сейчас или обычно: hablo — я говорю' },
  { id: 'indefinido', es: 'Pretérito indefinido', ru: 'Прошедшее завершённое', level: 'A2', hint: 'Законченное действие в прошлом: hablé — я сказал' },
  { id: 'imperfecto', es: 'Pretérito imperfecto', ru: 'Прошедшее незавершённое', level: 'A2', hint: 'Привычка или фон в прошлом: hablaba — я говорил (обычно)' },
  { id: 'perfecto', es: 'Pretérito perfecto', ru: 'Прошедшее, связанное с настоящим', level: 'A2', hint: 'haber + причастие: he hablado — я (уже) сказал' },
  { id: 'futuro', es: 'Futuro simple', ru: 'Будущее время', level: 'A2', hint: 'hablaré — я скажу / буду говорить' },
  { id: 'condicional', es: 'Condicional', ru: 'Условное наклонение', level: 'B1', hint: 'hablaría — я бы сказал' },
  { id: 'subjuntivo', es: 'Presente de subjuntivo', ru: 'Сослагательное наклонение', level: 'B1', hint: 'quiero que hables — хочу, чтобы ты говорил' },
];

const ENDINGS = {
  presente: { ar: ['o', 'as', 'a', 'amos', 'áis', 'an'], er: ['o', 'es', 'e', 'emos', 'éis', 'en'], ir: ['o', 'es', 'e', 'imos', 'ís', 'en'] },
  indefinido: { ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'], er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'], ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'] },
  imperfecto: { ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'], er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'], ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'] },
  subjuntivo: { ar: ['e', 'es', 'e', 'emos', 'éis', 'en'], er: ['a', 'as', 'a', 'amos', 'áis', 'an'], ir: ['a', 'as', 'a', 'amos', 'áis', 'an'] },
};
const FUT_END = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const COND_END = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];
const STRONG_PRET = ['e', 'iste', 'o', 'imos', 'isteis', 'ieron'];
const HABER_PRES = ['he', 'has', 'ha', 'hemos', 'habéis', 'han'];

// sc: тип чередования гласной в корне (e>ie, o>ue, e>i, u>ue)
// yo: особая форма 1-го лица в presente; pret: сильная основа претерита; fut: основа будущего; pp: причастие
const VERBS = [
  { inf: 'hablar', ru: 'говорить' },
  { inf: 'trabajar', ru: 'работать' },
  { inf: 'estudiar', ru: 'учиться' },
  { inf: 'escuchar', ru: 'слушать' },
  { inf: 'mirar', ru: 'смотреть' },
  { inf: 'comprar', ru: 'покупать' },
  { inf: 'cocinar', ru: 'готовить' },
  { inf: 'bailar', ru: 'танцевать' },
  { inf: 'cantar', ru: 'петь' },
  { inf: 'viajar', ru: 'путешествовать' },
  { inf: 'llamar', ru: 'звать, звонить' },
  { inf: 'necesitar', ru: 'нуждаться' },
  { inf: 'esperar', ru: 'ждать, надеяться' },
  { inf: 'ayudar', ru: 'помогать' },
  { inf: 'tomar', ru: 'брать, пить' },
  { inf: 'llevar', ru: 'нести, носить' },
  { inf: 'buscar', ru: 'искать' },
  { inf: 'tocar', ru: 'трогать, играть (на инструм.)' },
  { inf: 'llegar', ru: 'прибывать' },
  { inf: 'pagar', ru: 'платить' },
  { inf: 'comer', ru: 'есть' },
  { inf: 'beber', ru: 'пить' },
  { inf: 'aprender', ru: 'учить' },
  { inf: 'comprender', ru: 'понимать' },
  { inf: 'vender', ru: 'продавать' },
  { inf: 'correr', ru: 'бегать' },
  { inf: 'deber', ru: 'быть должным' },
  { inf: 'vivir', ru: 'жить' },
  { inf: 'escribir', ru: 'писать', pp: 'escrito' },
  { inf: 'abrir', ru: 'открывать', pp: 'abierto' },
  { inf: 'recibir', ru: 'получать' },
  { inf: 'decidir', ru: 'решать' },
  { inf: 'subir', ru: 'подниматься' },
  { inf: 'pensar', ru: 'думать', sc: 'e>ie' },
  { inf: 'cerrar', ru: 'закрывать', sc: 'e>ie' },
  { inf: 'empezar', ru: 'начинать', sc: 'e>ie' },
  { inf: 'entender', ru: 'понимать', sc: 'e>ie' },
  { inf: 'perder', ru: 'терять', sc: 'e>ie' },
  { inf: 'preferir', ru: 'предпочитать', sc: 'e>ie' },
  { inf: 'sentir', ru: 'чувствовать', sc: 'e>ie' },
  { inf: 'volver', ru: 'возвращаться', sc: 'o>ue', pp: 'vuelto' },
  { inf: 'encontrar', ru: 'находить', sc: 'o>ue' },
  { inf: 'recordar', ru: 'помнить', sc: 'o>ue' },
  { inf: 'contar', ru: 'считать, рассказывать', sc: 'o>ue' },
  { inf: 'dormir', ru: 'спать', sc: 'o>ue' },
  { inf: 'morir', ru: 'умирать', sc: 'o>ue', pp: 'muerto' },
  { inf: 'jugar', ru: 'играть', sc: 'u>ue' },
  { inf: 'pedir', ru: 'просить, заказывать', sc: 'e>i' },
  { inf: 'repetir', ru: 'повторять', sc: 'e>i' },
  { inf: 'servir', ru: 'служить, подавать', sc: 'e>i' },
  {
    inf: 'seguir', ru: 'следовать, продолжать', sc: 'e>i', yo: 'sigo',
    forms: { subjuntivo: ['siga', 'sigas', 'siga', 'sigamos', 'sigáis', 'sigan'] },
  },
  {
    inf: 'ser', ru: 'быть (сущность)',
    forms: {
      presente: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
      indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
      imperfecto: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
      subjuntivo: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
    },
  },
  {
    inf: 'estar', ru: 'быть (состояние, место)', pret: 'estuv',
    forms: {
      presente: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
      subjuntivo: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
    },
  },
  {
    inf: 'ir', ru: 'идти, ехать',
    forms: {
      presente: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
      indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
      imperfecto: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
      subjuntivo: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
    },
  },
  {
    inf: 'haber', ru: 'иметь (вспомогательный)', pret: 'hub', fut: 'habr',
    forms: {
      presente: HABER_PRES,
      subjuntivo: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
    },
  },
  { inf: 'tener', ru: 'иметь', sc: 'e>ie', yo: 'tengo', pret: 'tuv', fut: 'tendr' },
  { inf: 'venir', ru: 'приходить', sc: 'e>ie', yo: 'vengo', pret: 'vin', fut: 'vendr' },
  {
    inf: 'hacer', ru: 'делать', yo: 'hago', fut: 'har', pp: 'hecho',
    forms: { indefinido: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'] },
  },
  { inf: 'poder', ru: 'мочь', sc: 'o>ue', pret: 'pud', fut: 'podr' },
  { inf: 'querer', ru: 'хотеть, любить', sc: 'e>ie', pret: 'quis', fut: 'querr' },
  { inf: 'decir', ru: 'говорить, сказать', sc: 'e>i', yo: 'digo', pret: 'dij', fut: 'dir', pp: 'dicho' },
  { inf: 'poner', ru: 'класть, ставить', yo: 'pongo', pret: 'pus', fut: 'pondr', pp: 'puesto' },
  {
    inf: 'saber', ru: 'знать', pret: 'sup', fut: 'sabr',
    forms: {
      presente: ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
      subjuntivo: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'],
    },
  },
  { inf: 'salir', ru: 'выходить', yo: 'salgo', fut: 'saldr' },
  {
    inf: 'dar', ru: 'давать',
    forms: {
      presente: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
      indefinido: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'],
      subjuntivo: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
    },
  },
  {
    inf: 'ver', ru: 'видеть', yo: 'veo', pp: 'visto',
    forms: {
      presente: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
      indefinido: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
      imperfecto: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
    },
  },
  { inf: 'traer', ru: 'приносить', yo: 'traigo', pret: 'traj', pp: 'traído' },
  {
    inf: 'oír', ru: 'слышать', yo: 'oigo', fut: 'oir', pp: 'oído',
    forms: {
      presente: ['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen'],
      indefinido: ['oí', 'oíste', 'oyó', 'oímos', 'oísteis', 'oyeron'],
    },
  },
  {
    inf: 'leer', ru: 'читать', pp: 'leído',
    forms: { indefinido: ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron'] },
  },
  {
    inf: 'creer', ru: 'верить', pp: 'creído',
    forms: { indefinido: ['creí', 'creíste', 'creyó', 'creímos', 'creísteis', 'creyeron'] },
  },
  { inf: 'conocer', ru: 'знать (быть знакомым)', yo: 'conozco' },
  { inf: 'conducir', ru: 'водить машину', yo: 'conduzco', pret: 'conduj' },
  { inf: 'traducir', ru: 'переводить', yo: 'traduzco', pret: 'traduj' },
  { inf: 'romper', ru: 'ломать', pp: 'roto' },
];

const VERB_MAP = new Map(VERBS.map(v => [v.inf, v]));

function verbGroup(inf) {
  return stripAccents(inf).slice(-2);
}

// Чередование: меняем последнюю подходящую гласную корня
function changeStem(stem, sc, mode = 'full') {
  if (!sc) return stem;
  const [from, to] = sc.split('>');
  const idx = stem.lastIndexOf(from);
  if (idx < 0) return stem;
  // mode 'short': ослабленное чередование для -ir глаголов (e>i, o>u)
  const repl = mode === 'short' ? (from === 'o' ? 'u' : 'i') : to;
  return stem.slice(0, idx) + repl + stem.slice(idx + from.length);
}

// Орфографические изменения перед -e: c->qu, g->gu, z->c (buscar → busqué, busque)
function orthoBeforeE(stem) {
  if (stem.endsWith('c')) return stem.slice(0, -1) + 'qu';
  if (stem.endsWith('g')) return stem.slice(0, -1) + 'gu';
  if (stem.endsWith('z')) return stem.slice(0, -1) + 'c';
  return stem;
}

function participle(v) {
  if (v.pp) return v.pp;
  const g = verbGroup(v.inf);
  return v.inf.slice(0, -2) + (g === 'ar' ? 'ado' : 'ido');
}

function conjugate(inf, tense) {
  const v = typeof inf === 'string' ? VERB_MAP.get(inf) : inf;
  if (!v) throw new Error('Unknown verb ' + inf);
  if (v.forms && v.forms[tense]) return v.forms[tense].slice();
  const g = verbGroup(v.inf);
  const stem = stripAccents(v.inf).slice(0, -2);
  const shortChange = g === 'ir' && v.sc && v.sc !== 'u>ue';

  switch (tense) {
    case 'presente': {
      const out = ENDINGS.presente[g].map((e, i) => (i === 3 || i === 4 ? stem : changeStem(stem, v.sc)) + e);
      if (v.yo) out[0] = v.yo;
      return out;
    }
    case 'indefinido': {
      if (v.pret) {
        const out = STRONG_PRET.map(e => v.pret + e);
        if (v.pret.endsWith('j')) out[5] = v.pret + 'eron';
        return out;
      }
      const out = ENDINGS.indefinido[g].map(e => stem + e);
      if (g === 'ar') out[0] = orthoBeforeE(stem) + 'é';
      if (shortChange) {
        out[2] = changeStem(stem, v.sc, 'short') + ENDINGS.indefinido[g][2];
        out[5] = changeStem(stem, v.sc, 'short') + ENDINGS.indefinido[g][5];
      }
      return out;
    }
    case 'imperfecto':
      return ENDINGS.imperfecto[g].map(e => stem + e);
    case 'futuro':
      return FUT_END.map(e => (v.fut || stripAccents(v.inf)) + e);
    case 'condicional':
      return COND_END.map(e => (v.fut || stripAccents(v.inf)) + e);
    case 'perfecto': {
      const pp = participle(v);
      return HABER_PRES.map(a => a + ' ' + pp);
    }
    case 'subjuntivo': {
      const yo = conjugate(v, 'presente')[0];
      const yoBase = yo.endsWith('o') ? yo.slice(0, -1) : changeStem(stem, v.sc);
      const ends = ENDINGS.subjuntivo[g];
      return ends.map((e, i) => {
        let base;
        if (i === 3 || i === 4) {
          if (v.yo) base = yoBase;
          else base = shortChange ? changeStem(stem, v.sc, 'short') : stem;
        } else {
          base = yoBase;
        }
        if (g === 'ar') base = orthoBeforeE(base);
        return base + e;
      });
    }
    default:
      throw new Error('Unknown tense ' + tense);
  }
}

function tenseById(id) { return TENSES.find(t => t.id === id); }
