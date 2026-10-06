// Модульные тесты без зависимостей: node tests/unit.test.js
// Загружает скрипты в общий контекст так же, как браузер (классические <script>).

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const files = ['js/util.js', 'js/data/vocab.js', 'js/data/verbs.js', 'js/data/grammar.js', 'js/data/stories.js', 'js/data/dialogues.js', 'js/data/culture.js'];
const code = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n;\n')
  + '\n;({ conjugate, numberToSpanish, timeToSpanish, checkAnswer, TOPICS, UNITS, ALL_WORDS, VERBS, GRAMMAR, STORIES, DIALOGUES, COUNTRIES, IDIOMS, participle, VERB_MAP, LOOKUP, stripAccents });';
const ctx = vm.createContext({ console });
const G = vm.runInContext(code, ctx);

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; } catch (e) { failed++; console.error('✗ ' + name + '\n   ' + e.message); }
}

// ---------- Спряжения: эталонные таблицы ----------
const EXPECTED = {
  hablar: {
    presente: 'hablo hablas habla hablamos habláis hablan',
    indefinido: 'hablé hablaste habló hablamos hablasteis hablaron',
    imperfecto: 'hablaba hablabas hablaba hablábamos hablabais hablaban',
    futuro: 'hablaré hablarás hablará hablaremos hablaréis hablarán',
    condicional: 'hablaría hablarías hablaría hablaríamos hablaríais hablarían',
    subjuntivo: 'hable hables hable hablemos habléis hablen',
  },
  comer: {
    presente: 'como comes come comemos coméis comen',
    indefinido: 'comí comiste comió comimos comisteis comieron',
    imperfecto: 'comía comías comía comíamos comíais comían',
    subjuntivo: 'coma comas coma comamos comáis coman',
  },
  vivir: {
    presente: 'vivo vives vive vivimos vivís viven',
    indefinido: 'viví viviste vivió vivimos vivisteis vivieron',
  },
  ser: { presente: 'soy eres es somos sois son', indefinido: 'fui fuiste fue fuimos fuisteis fueron', imperfecto: 'era eras era éramos erais eran', futuro: 'seré serás será seremos seréis serán', subjuntivo: 'sea seas sea seamos seáis sean' },
  estar: { presente: 'estoy estás está estamos estáis están', indefinido: 'estuve estuviste estuvo estuvimos estuvisteis estuvieron', imperfecto: 'estaba estabas estaba estábamos estabais estaban', subjuntivo: 'esté estés esté estemos estéis estén' },
  ir: { presente: 'voy vas va vamos vais van', imperfecto: 'iba ibas iba íbamos ibais iban', futuro: 'iré irás irá iremos iréis irán', subjuntivo: 'vaya vayas vaya vayamos vayáis vayan' },
  tener: { presente: 'tengo tienes tiene tenemos tenéis tienen', indefinido: 'tuve tuviste tuvo tuvimos tuvisteis tuvieron', futuro: 'tendré tendrás tendrá tendremos tendréis tendrán', subjuntivo: 'tenga tengas tenga tengamos tengáis tengan' },
  venir: { presente: 'vengo vienes viene venimos venís vienen', indefinido: 'vine viniste vino vinimos vinisteis vinieron', condicional: 'vendría vendrías vendría vendríamos vendríais vendrían' },
  hacer: { presente: 'hago haces hace hacemos hacéis hacen', indefinido: 'hice hiciste hizo hicimos hicisteis hicieron', futuro: 'haré harás hará haremos haréis harán', subjuntivo: 'haga hagas haga hagamos hagáis hagan', perfecto: 'he hecho has hecho ha hecho hemos hecho habéis hecho han hecho' },
  decir: { presente: 'digo dices dice decimos decís dicen', indefinido: 'dije dijiste dijo dijimos dijisteis dijeron', futuro: 'diré dirás dirá diremos diréis dirán', subjuntivo: 'diga digas diga digamos digáis digan' },
  poder: { presente: 'puedo puedes puede podemos podéis pueden', indefinido: 'pude pudiste pudo pudimos pudisteis pudieron', subjuntivo: 'pueda puedas pueda podamos podáis puedan' },
  querer: { presente: 'quiero quieres quiere queremos queréis quieren', indefinido: 'quise quisiste quiso quisimos quisisteis quisieron', futuro: 'querré querrás querrá querremos querréis querrán' },
  saber: { presente: 'sé sabes sabe sabemos sabéis saben', indefinido: 'supe supiste supo supimos supisteis supieron', subjuntivo: 'sepa sepas sepa sepamos sepáis sepan' },
  poner: { presente: 'pongo pones pone ponemos ponéis ponen', indefinido: 'puse pusiste puso pusimos pusisteis pusieron' },
  salir: { presente: 'salgo sales sale salimos salís salen', futuro: 'saldré saldrás saldrá saldremos saldréis saldrán' },
  dar: { presente: 'doy das da damos dais dan', indefinido: 'di diste dio dimos disteis dieron', subjuntivo: 'dé des dé demos deis den' },
  ver: { presente: 'veo ves ve vemos veis ven', imperfecto: 'veía veías veía veíamos veíais veían', subjuntivo: 'vea veas vea veamos veáis vean' },
  traer: { presente: 'traigo traes trae traemos traéis traen', indefinido: 'traje trajiste trajo trajimos trajisteis trajeron' },
  oír: { presente: 'oigo oyes oye oímos oís oyen', imperfecto: 'oía oías oía oíamos oíais oían', futuro: 'oiré oirás oirá oiremos oiréis oirán', subjuntivo: 'oiga oigas oiga oigamos oigáis oigan' },
  leer: { indefinido: 'leí leíste leyó leímos leísteis leyeron', presente: 'leo lees lee leemos leéis leen' },
  conocer: { presente: 'conozco conoces conoce conocemos conocéis conocen', subjuntivo: 'conozca conozcas conozca conozcamos conozcáis conozcan' },
  conducir: { indefinido: 'conduje condujiste condujo condujimos condujisteis condujeron' },
  pensar: { presente: 'pienso piensas piensa pensamos pensáis piensan', subjuntivo: 'piense pienses piense pensemos penséis piensen' },
  empezar: { presente: 'empiezo empiezas empieza empezamos empezáis empiezan', indefinido: 'empecé empezaste empezó empezamos empezasteis empezaron', subjuntivo: 'empiece empieces empiece empecemos empecéis empiecen' },
  volver: { presente: 'vuelvo vuelves vuelve volvemos volvéis vuelven', perfecto: 'he vuelto has vuelto ha vuelto hemos vuelto habéis vuelto han vuelto' },
  dormir: { presente: 'duermo duermes duerme dormimos dormís duermen', indefinido: 'dormí dormiste durmió dormimos dormisteis durmieron', subjuntivo: 'duerma duermas duerma durmamos durmáis duerman' },
  sentir: { indefinido: 'sentí sentiste sintió sentimos sentisteis sintieron', subjuntivo: 'sienta sientas sienta sintamos sintáis sientan' },
  preferir: { presente: 'prefiero prefieres prefiere preferimos preferís prefieren', indefinido: 'preferí preferiste prefirió preferimos preferisteis prefirieron' },
  pedir: { presente: 'pido pides pide pedimos pedís piden', indefinido: 'pedí pediste pidió pedimos pedisteis pidieron', subjuntivo: 'pida pidas pida pidamos pidáis pidan' },
  seguir: { presente: 'sigo sigues sigue seguimos seguís siguen', indefinido: 'seguí seguiste siguió seguimos seguisteis siguieron', subjuntivo: 'siga sigas siga sigamos sigáis sigan' },
  jugar: { presente: 'juego juegas juega jugamos jugáis juegan', indefinido: 'jugué jugaste jugó jugamos jugasteis jugaron', subjuntivo: 'juegue juegues juegue juguemos juguéis jueguen' },
  buscar: { indefinido: 'busqué buscaste buscó buscamos buscasteis buscaron', subjuntivo: 'busque busques busque busquemos busquéis busquen' },
  llegar: { indefinido: 'llegué llegaste llegó llegamos llegasteis llegaron', subjuntivo: 'llegue llegues llegue lleguemos lleguéis lleguen' },
  morir: { indefinido: 'morí moriste murió morimos moristeis murieron', perfecto: 'he muerto has muerto ha muerto hemos muerto habéis muerto han muerto' },
  haber: { presente: 'he has ha hemos habéis han', futuro: 'habré habrás habrá habremos habréis habrán', indefinido: 'hube hubiste hubo hubimos hubisteis hubieron' },
  escribir: { perfecto: 'he escrito has escrito ha escrito hemos escrito habéis escrito han escrito' },
};

for (const [verb, tenses] of Object.entries(EXPECTED)) {
  for (const [tense, forms] of Object.entries(tenses)) {
    test(`${verb} · ${tense}`, () => {
      const got = G.conjugate(verb, tense);
      const exp = tense === 'perfecto'
        ? forms.match(/\S+ \S+/g)
        : forms.split(' ');
      assert.deepStrictEqual(Array.from(got), exp);
    });
  }
}

test('every verb conjugates in every tense without errors', () => {
  for (const v of G.VERBS) for (const t of ['presente', 'indefinido', 'imperfecto', 'perfecto', 'futuro', 'condicional', 'subjuntivo']) {
    const forms = G.conjugate(v.inf, t);
    assert.strictEqual(forms.length, 6, v.inf + ' ' + t);
    forms.forEach(f => assert.ok(f && !/undefined/.test(f), `${v.inf} ${t}: ${f}`));
  }
});

// ---------- Числа и время ----------
const NUMS = {
  0: 'cero', 1: 'uno', 15: 'quince', 16: 'dieciséis', 21: 'veintiuno', 22: 'veintidós', 30: 'treinta', 31: 'treinta y uno',
  99: 'noventa y nueve', 100: 'cien', 101: 'ciento uno', 115: 'ciento quince', 200: 'doscientos', 500: 'quinientos',
  777: 'setecientos setenta y siete', 1000: 'mil', 1001: 'mil uno', 2024: 'dos mil veinticuatro', 21000: 'veintiún mil',
  100000: 'cien mil', 101000: 'ciento un mil', 999999: 'novecientos noventa y nueve mil novecientos noventa y nueve',
  1000000: 'un millón', 2500000: 'dos millones quinientos mil',
};
for (const [n, w] of Object.entries(NUMS)) test('number ' + n, () => assert.strictEqual(G.numberToSpanish(+n), w));

test('time', () => {
  assert.strictEqual(G.timeToSpanish(1, 0), 'Es la una');
  assert.strictEqual(G.timeToSpanish(3, 15), 'Son las tres y cuarto');
  assert.strictEqual(G.timeToSpanish(12, 45), 'Es la una menos cuarto');
  assert.strictEqual(G.timeToSpanish(7, 30), 'Son las siete y media');
  assert.strictEqual(G.timeToSpanish(9, 40), 'Son las diez menos veinte');
  assert.strictEqual(G.timeToSpanish(12, 0), 'Son las doce');
});

// ---------- Проверка ответов ----------
test('checkAnswer variants and accents', () => {
  assert.ok(G.checkAnswer('el coche', 'el coche / el carro', { strict: false }).ok);
  assert.ok(G.checkAnswer('El Carro', 'el coche / el carro', { strict: false }).ok);
  const loose = G.checkAnswer('cafe', 'el café', { strict: false });
  assert.ok(loose.ok && loose.note);
  assert.ok(!G.checkAnswer('cafe', 'café', { strict: true }).ok);
  assert.ok(G.checkAnswer('¿Qué tal?', '¿qué tal?', { strict: true }).ok);
  assert.ok(!G.checkAnswer('perro', 'gato', { strict: false }).ok);
  assert.ok(!G.checkAnswer('', 'gato', { strict: false }).ok);
});

// ---------- Целостность данных ----------
test('topics have words and sentences', () => {
  const ids = new Set();
  for (const t of G.TOPICS) {
    assert.ok(!ids.has(t.id), 'duplicate topic id ' + t.id);
    ids.add(t.id);
    assert.ok(t.words.length >= 15, t.id + ' has too few words');
    assert.ok(t.sentences.length >= 6, t.id + ' has too few sentences');
    for (const w of [...t.words, ...t.sentences]) assert.ok(w.es && w.ru, t.id + ': malformed line ' + JSON.stringify(w));
  }
});

test('no duplicate spanish words inside a topic', () => {
  for (const t of G.TOPICS) {
    const seen = new Set();
    for (const w of t.words) { assert.ok(!seen.has(w.es), `${t.id}: duplicate ${w.es}`); seen.add(w.es); }
  }
});

test('units have lessons of reasonable size', () => {
  for (const u of G.UNITS) {
    assert.ok(u.lessons.length >= 2);
    u.lessons.filter(l => !l.review).forEach(l => assert.ok(l.words.length >= 4 && l.words.length <= 10, `${u.id}: lesson size ${l.words.length}`));
  }
});

test('quiz items have >=2 unique options', () => {
  const all = [...G.GRAMMAR.flatMap(g => g.quiz), ...G.STORIES.flatMap(s => s.questions)];
  for (const q of all) {
    assert.ok(q.options.length >= 2, q.q);
    assert.strictEqual(new Set(q.options).size, q.options.length, 'duplicate options: ' + q.q);
  }
});

test('dialogue turns have one correct + wrong options with explanations', () => {
  for (const d of G.DIALOGUES) for (const t of d.turns) {
    assert.ok(t.options.length >= 2);
    assert.ok(!t.options[0].why, d.id + ': correct option should not have why');
    t.options.slice(1).forEach(o => assert.ok(o.why, d.id + ': missing why for ' + o.es));
  }
});

test('stories have lines and questions', () => {
  for (const s of G.STORIES) { assert.ok(s.lines.length >= 8, s.id); assert.ok(s.questions.length >= 3, s.id); }
});

test('content volume', () => {
  assert.ok(G.ALL_WORDS.length >= 700, 'words: ' + G.ALL_WORDS.length);
  assert.ok(G.VERBS.length >= 60, 'verbs: ' + G.VERBS.length);
  assert.ok(G.GRAMMAR.length >= 20);
});

console.log(`\n${passed} passed, ${failed} failed`);
console.log(`Content: ${G.TOPICS.length} topics, ${G.ALL_WORDS.length} words, ${G.TOPICS.reduce((a, t) => a + t.sentences.length, 0)} sentences, ${G.UNITS.reduce((a, u) => a + u.lessons.length, 0)} lessons, ${G.VERBS.length} verbs, ${G.GRAMMAR.length} grammar topics, ${G.STORIES.length} stories, ${G.DIALOGUES.length} dialogues, ${G.COUNTRIES.length} countries, ${G.IDIOMS.length} idioms`);
process.exit(failed ? 1 : 0);
