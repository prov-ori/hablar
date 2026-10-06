// Справочник грамматики. В quiz первый вариант в options — правильный (перемешивается при показе).

const GRAMMAR = [
{
  id: 'pronunciacion', icon: '🗣️', level: 'A1', title: 'Алфавит и произношение',
  html: `
<p>Испанский читается почти так же, как пишется. Ударение подчиняется трём правилам — выучив их, вы сможете прочитать любое слово.</p>
<h3>Особые буквы и сочетания</h3>
<table>
<tr><th>Буква</th><th>Звук</th><th>Пример</th></tr>
<tr><td>ñ</td><td>нь</td><td><span class="es">España</span> [эспанья]</td></tr>
<tr><td>ll</td><td>й / дж (зависит от региона)</td><td><span class="es">llamar</span> [ямар]</td></tr>
<tr><td>h</td><td>не читается</td><td><span class="es">hola</span> [ола]</td></tr>
<tr><td>j, g перед e/i</td><td>гортанное х</td><td><span class="es">jamón, gente</span></td></tr>
<tr><td>c перед e/i, z</td><td>θ (как англ. th) в Испании, «с» в Латинской Америке</td><td><span class="es">cena, zapato</span></td></tr>
<tr><td>qu</td><td>к</td><td><span class="es">queso</span> [кесо]</td></tr>
<tr><td>gu перед e/i</td><td>г</td><td><span class="es">guitarra</span> [гитарра]</td></tr>
<tr><td>v</td><td>почти как «б»</td><td><span class="es">vino</span> [бино]</td></tr>
<tr><td>rr / r в начале</td><td>раскатистое р</td><td><span class="es">perro, rojo</span></td></tr>
</table>
<h3>Правила ударения</h3>
<ul>
<li>Слово оканчивается на <b>гласную, -n или -s</b> → ударение на <b>предпоследний</b> слог: <span class="es">casa, hablan, libros</span>.</li>
<li>Оканчивается на <b>другую согласную</b> → ударение на <b>последний</b> слог: <span class="es">hablar, ciudad, español</span>.</li>
<li>Всё, что нарушает эти правила, получает <b>знак ударения</b>: <span class="es">café, árbol, música</span>.</li>
</ul>
<p class="tip">Безударные гласные в испанском <b>не редуцируются</b>: «o» всегда звучит как «о», даже без ударения. <span class="es">Como</span> — [кОмо], а не [кама].</p>`,
  quiz: [
    { q: 'Как читается «h» в слове «hotel»?', options: ['не читается', 'как «х»', 'как «г»', 'как «ш»'] },
    { q: 'Где ударение в слове «ciudad»?', options: ['на последнем слоге', 'на первом слоге', 'на предпоследнем слоге'] },
    { q: 'Как читается «queso»?', options: ['кесо', 'квесо', 'куэсо', 'кьюсо'] },
    { q: 'Какое слово требует знака ударения?', options: ['música', 'casa', 'hablar', 'libro'] },
    { q: 'Как звучит «ñ» в «niño»?', options: ['нь', 'н', 'нг', 'й'] },
  ],
},
{
  id: 'articulos', icon: '🏷️', level: 'A1', title: 'Род и артикли',
  html: `
<p>Все существительные в испанском — <b>мужского</b> или <b>женского</b> рода. Среднего рода нет.</p>
<table>
<tr><th></th><th>Мужской</th><th>Женский</th></tr>
<tr><td>Определённый (ед.)</td><td><span class="es">el</span> libro</td><td><span class="es">la</span> casa</td></tr>
<tr><td>Определённый (мн.)</td><td><span class="es">los</span> libros</td><td><span class="es">las</span> casas</td></tr>
<tr><td>Неопределённый (ед.)</td><td><span class="es">un</span> libro</td><td><span class="es">una</span> casa</td></tr>
<tr><td>Неопределённый (мн.)</td><td><span class="es">unos</span> libros</td><td><span class="es">unas</span> casas</td></tr>
</table>
<h3>Как угадать род</h3>
<ul>
<li><b>-o</b> → обычно мужской: <span class="es">el perro</span>. <b>-a</b> → обычно женский: <span class="es">la mesa</span>.</li>
<li><b>-ción, -sión, -dad, -tad, -tud</b> → женский: <span class="es">la canción, la ciudad, la libertad</span>.</li>
<li><b>-ma</b> греческого происхождения → мужской: <span class="es">el problema, el idioma, el tema</span>.</li>
<li>Исключения: <span class="es">la mano, la radio, el día, el mapa</span>.</li>
</ul>
<p class="tip">Перед ударным <b>a-/ha-</b> женские слова в единственном числе берут <span class="es">el</span>: <span class="es">el agua fría</span>, но <span class="es">las aguas</span>.</p>
<h3>Слияния</h3>
<p><span class="es">a + el = al</span> (voy al cine), <span class="es">de + el = del</span> (la casa del profesor).</p>`,
  quiz: [
    { q: '___ problema es difícil.', options: ['El', 'La', 'Los', 'Un'] },
    { q: '___ canción es bonita.', options: ['La', 'El', 'Las', 'Los'] },
    { q: 'Voy ___ parque.', options: ['al', 'a el', 'del', 'a la'] },
    { q: '___ agua está fría.', options: ['El', 'La', 'Los', 'Una'] },
    { q: 'Es ___ día precioso.', options: ['un', 'una', 'la', 'unos'] },
    { q: 'Tengo ___ manos frías.', options: ['las', 'los', 'el', 'unos'] },
  ],
},
{
  id: 'plural', icon: '➕', level: 'A1', title: 'Множественное число',
  html: `
<ul>
<li>Оканчивается на гласную → <b>+s</b>: <span class="es">casa → casas, café → cafés</span>.</li>
<li>Оканчивается на согласную → <b>+es</b>: <span class="es">ciudad → ciudades, árbol → árboles</span>.</li>
<li><b>-z → -ces</b>: <span class="es">lápiz → lápices, luz → luces</span>.</li>
<li>Ударные <b>-ión</b> теряют знак ударения: <span class="es">canción → canciones</span>.</li>
<li>Слова на безударный слог с <b>-s</b> не меняются: <span class="es">el lunes → los lunes, la crisis → las crisis</span>.</li>
</ul>
<p class="tip">Мужской род во множественном числе может обозначать смешанную группу: <span class="es">los padres</span> — родители, <span class="es">los hermanos</span> — братья и сёстры.</p>`,
  quiz: [
    { q: 'Множественное число от «lápiz»:', options: ['lápices', 'lápizes', 'lápizs', 'lápiz'] },
    { q: 'Множественное число от «canción»:', options: ['canciones', 'cancións', 'canciónes', 'cancion'] },
    { q: 'Множественное число от «ciudad»:', options: ['ciudades', 'ciudads', 'ciudadas', 'ciudad'] },
    { q: 'Множественное число от «el martes»:', options: ['los martes', 'los marteses', 'las martes', 'los martés'] },
    { q: '«Los hermanos» может значить…', options: ['братья и сёстры', 'только сёстры', 'кузены', 'брат'] },
  ],
},
{
  id: 'adjetivos', icon: '🎯', level: 'A1', title: 'Согласование прилагательных',
  html: `
<p>Прилагательное согласуется с существительным в роде и числе и обычно стоит <b>после</b> него.</p>
<table>
<tr><th></th><th>Ед.</th><th>Мн.</th></tr>
<tr><td>муж.</td><td>el gato negr<b>o</b></td><td>los gatos negr<b>os</b></td></tr>
<tr><td>жен.</td><td>la casa negr<b>a</b></td><td>las casas negr<b>as</b></td></tr>
</table>
<ul>
<li>Прилагательные на <b>-e</b> или согласную не меняют род: <span class="es">un chico inteligente, una chica inteligente</span>; <span class="es">azul → azules</span>.</li>
<li>Национальности на согласную получают -a: <span class="es">español → española</span>.</li>
<li>Перед существительным мужского рода ед. ч. сокращаются: <span class="es">bueno → buen, malo → mal, primero → primer, grande → gran</span>.</li>
</ul>
<p class="tip">Положение меняет смысл: <span class="es">un gran hombre</span> — великий человек; <span class="es">un hombre grande</span> — крупный мужчина.</p>`,
  quiz: [
    { q: 'Las flores son muy ___.', options: ['bonitas', 'bonito', 'bonita', 'bonitos'] },
    { q: 'Es un ___ amigo.', options: ['buen', 'bueno', 'buena', 'buenos'] },
    { q: 'Mi profesora es ___.', options: ['española', 'español', 'españolo', 'españoles'] },
    { q: 'Tengo dos coches ___.', options: ['azules', 'azul', 'azuls', 'azulas'] },
    { q: 'Una chica muy ___.', options: ['inteligente', 'inteligenta', 'inteligentes', 'inteligento'] },
  ],
},
{
  id: 'ser-estar', icon: '⚖️', level: 'A1', title: 'Ser или estar',
  html: `
<p>Оба глагола переводятся как «быть», но выражают разное.</p>
<div class="cols">
<div><h3>SER — что это / кто это</h3>
<ul>
<li>Описание, сущность: <span class="es">Ella es alta.</span></li>
<li>Профессия: <span class="es">Soy médico.</span></li>
<li>Происхождение: <span class="es">Somos de México.</span></li>
<li>Время, даты: <span class="es">Son las tres. Hoy es lunes.</span></li>
<li>Материал, принадлежность: <span class="es">La mesa es de madera. Es mío.</span></li>
<li>Где проходит событие: <span class="es">La fiesta es en mi casa.</span></li>
</ul></div>
<div><h3>ESTAR — как / где</h3>
<ul>
<li>Местоположение: <span class="es">Madrid está en España.</span></li>
<li>Состояние, настроение: <span class="es">Estoy cansado.</span></li>
<li>Результат: <span class="es">La puerta está abierta.</span></li>
<li>Длительное действие: <span class="es">Estoy comiendo.</span></li>
</ul></div>
</div>
<p class="tip">Смысл может меняться! <span class="es">Es aburrido</span> — он скучный (человек). <span class="es">Está aburrido</span> — ему скучно. <span class="es">Es listo</span> — умный; <span class="es">está listo</span> — готов.</p>`,
  quiz: [
    { q: 'Mi hermano ___ ingeniero.', options: ['es', 'está'] },
    { q: 'Hoy ___ muy cansada.', options: ['estoy', 'soy'] },
    { q: 'Barcelona ___ en Cataluña.', options: ['está', 'es'] },
    { q: '___ las cinco de la tarde.', options: ['Son', 'Están'] },
    { q: 'La sopa ___ fría.', options: ['está', 'es'] },
    { q: 'Nosotros ___ de Rusia.', options: ['somos', 'estamos'] },
    { q: 'El concierto ___ en el teatro.', options: ['es', 'está'] },
    { q: 'Ya ___ listo, vamos.', options: ['estoy', 'soy'] },
  ],
},
{
  id: 'hay', icon: '📍', level: 'A1', title: 'Hay или está',
  html: `
<p><span class="es">Hay</span> (от haber) — «есть, имеется». Сообщает о <b>существовании</b> чего-то неизвестного собеседнику. Не меняется по числам.</p>
<ul>
<li><span class="es">Hay un banco en esta calle.</span> — На этой улице есть банк.</li>
<li><span class="es">Hay muchos turistas.</span> — Много туристов.</li>
</ul>
<p><span class="es">Está / están</span> — указывает <b>местоположение</b> чего-то конкретного, уже известного.</p>
<ul>
<li><span class="es">El banco está en esta calle.</span> — Банк (тот самый) находится на этой улице.</li>
</ul>
<p class="tip">После <span class="es">hay</span>: un/una, числа, mucho, nada или существительное без артикля. После <span class="es">está</span>: el/la, имена, mi/tu…</p>`,
  quiz: [
    { q: '¿___ una farmacia cerca?', options: ['Hay', 'Está', 'Es'] },
    { q: '¿Dónde ___ mi móvil?', options: ['está', 'hay', 'es'] },
    { q: 'En la nevera ___ leche.', options: ['hay', 'está', 'son'] },
    { q: 'Los niños ___ en el parque.', options: ['están', 'hay', 'son'] },
    { q: '___ tres libros en la mesa.', options: ['Hay', 'Están', 'Son'] },
  ],
},
{
  id: 'presente', icon: '⏱️', level: 'A1', title: 'Настоящее время (presente)',
  html: `
<p>Отбросьте окончание инфинитива (-ar, -er, -ir) и добавьте личные окончания:</p>
<table>
<tr><th></th><th>hablar</th><th>comer</th><th>vivir</th></tr>
<tr><td>yo</td><td>habl<b>o</b></td><td>com<b>o</b></td><td>viv<b>o</b></td></tr>
<tr><td>tú</td><td>habl<b>as</b></td><td>com<b>es</b></td><td>viv<b>es</b></td></tr>
<tr><td>él/ella/usted</td><td>habl<b>a</b></td><td>com<b>e</b></td><td>viv<b>e</b></td></tr>
<tr><td>nosotros</td><td>habl<b>amos</b></td><td>com<b>emos</b></td><td>viv<b>imos</b></td></tr>
<tr><td>vosotros</td><td>habl<b>áis</b></td><td>com<b>éis</b></td><td>viv<b>ís</b></td></tr>
<tr><td>ellos/ustedes</td><td>habl<b>an</b></td><td>com<b>en</b></td><td>viv<b>en</b></td></tr>
</table>
<p class="tip">Личные местоимения обычно опускают: окончание уже показывает лицо. <span class="es">Hablo español</span> = Я говорю по-испански.</p>
<p><span class="es">Usted/ustedes</span> — вежливое «вы», спрягается как 3-е лицо. В Латинской Америке <span class="es">vosotros</span> не используют: там всегда <span class="es">ustedes</span>.</p>`,
  quiz: [
    { q: 'Nosotros ___ (vivir) en Sevilla.', options: ['vivimos', 'vivemos', 'vivamos', 'viven'] },
    { q: 'Tú ___ (hablar) muy bien.', options: ['hablas', 'hables', 'habla', 'hablás'] },
    { q: 'Ellos ___ (comer) mucho.', options: ['comen', 'coman', 'comes', 'comemos'] },
    { q: 'Usted ___ (trabajar) aquí?', options: ['trabaja', 'trabajas', 'trabajo', 'trabajan'] },
    { q: 'Vosotros ___ (escribir) cartas.', options: ['escribís', 'escribéis', 'escribáis', 'escriben'] },
  ],
},
{
  id: 'irregulares', icon: '🔀', level: 'A1', title: 'Отклоняющиеся глаголы',
  html: `
<p>Многие частые глаголы меняют гласную корня под ударением — во всех лицах, <b>кроме nosotros и vosotros</b> («глаголы-ботинки»).</p>
<table>
<tr><th>e → ie</th><th>o → ue</th><th>e → i</th><th>u → ue</th></tr>
<tr><td>qu<b>ie</b>ro</td><td>p<b>ue</b>do</td><td>p<b>i</b>do</td><td>j<b>ue</b>go</td></tr>
<tr><td>qu<b>ie</b>res</td><td>p<b>ue</b>des</td><td>p<b>i</b>des</td><td>j<b>ue</b>gas</td></tr>
<tr><td>qu<b>ie</b>re</td><td>p<b>ue</b>de</td><td>p<b>i</b>de</td><td>j<b>ue</b>ga</td></tr>
<tr><td>queremos</td><td>podemos</td><td>pedimos</td><td>jugamos</td></tr>
<tr><td>queréis</td><td>podéis</td><td>pedís</td><td>jugáis</td></tr>
<tr><td>qu<b>ie</b>ren</td><td>p<b>ue</b>den</td><td>p<b>i</b>den</td><td>j<b>ue</b>gan</td></tr>
</table>
<h3>Особая форма «yo»</h3>
<p><span class="es">hacer → hago, poner → pongo, salir → salgo, tener → tengo, venir → vengo, decir → digo, conocer → conozco, saber → sé, ver → veo, dar → doy</span>.</p>
<h3>Полностью неправильные</h3>
<p><span class="es">ser: soy, eres, es…</span> · <span class="es">ir: voy, vas, va…</span> · <span class="es">estar: estoy, estás, está…</span></p>`,
  quiz: [
    { q: 'Yo ___ (tener) dos hermanos.', options: ['tengo', 'teno', 'tieno', 'tiengo'] },
    { q: 'Ella ___ (querer) un café.', options: ['quiere', 'quere', 'quiera', 'quire'] },
    { q: 'Nosotros ___ (poder) ir.', options: ['podemos', 'puedemos', 'pudemos', 'podimos'] },
    { q: 'Yo no ___ (saber) nada.', options: ['sé', 'sabo', 'sepo', 'sabe'] },
    { q: '¿Qué ___ (pedir) tú?', options: ['pides', 'pedes', 'piedes', 'pidas'] },
    { q: 'Yo ___ (hacer) los deberes.', options: ['hago', 'haco', 'hazo', 'hace'] },
    { q: 'Ellos ___ (jugar) al tenis.', options: ['juegan', 'jugan', 'juegen', 'jogan'] },
  ],
},
{
  id: 'gustar', icon: '❤️', level: 'A1', title: 'Gustar и похожие глаголы',
  html: `
<p><span class="es">Gustar</span> устроен как русское «нравиться»: тот, кому нравится, — в дательном падеже, а то, что нравится, — подлежащее.</p>
<table>
<tr><th>Кому</th><th></th><th>Что</th></tr>
<tr><td>(a mí) <b>me</b></td><td rowspan="6"><b>gusta</b> + ед. ч. / инфинитив<br><b>gustan</b> + мн. ч.</td><td rowspan="6">el café<br>bailar<br>los perros</td></tr>
<tr><td>(a ti) <b>te</b></td></tr>
<tr><td>(a él/ella/usted) <b>le</b></td></tr>
<tr><td>(a nosotros) <b>nos</b></td></tr>
<tr><td>(a vosotros) <b>os</b></td></tr>
<tr><td>(a ellos/ustedes) <b>les</b></td></tr>
</table>
<ul>
<li><span class="es">Me gusta el chocolate.</span> — Мне нравится шоколад.</li>
<li><span class="es">Me gustan los gatos.</span> — Мне нравятся кошки.</li>
<li><span class="es">A María le gusta bailar.</span> — Марии нравится танцевать.</li>
</ul>
<p>Так же работают: <span class="es">encantar</span> (очень нравиться), <span class="es">interesar, molestar</span> (раздражать), <span class="es">doler</span> (болеть), <span class="es">importar, parecer</span>.</p>
<p class="tip">Согласие: <span class="es">A mí también</span> (мне тоже) / <span class="es">A mí tampoco</span> (мне тоже нет).</p>`,
  quiz: [
    { q: 'Me ___ las películas de terror.', options: ['gustan', 'gusta', 'gusto', 'gustas'] },
    { q: 'A mi padre ___ gusta el fútbol.', options: ['le', 'lo', 'se', 'les'] },
    { q: '¿Te ___ cocinar?', options: ['gusta', 'gustan', 'gustas', 'gusto'] },
    { q: 'A nosotros ___ encanta viajar.', options: ['nos', 'les', 'os', 'me'] },
    { q: 'Me ___ los pies.', options: ['duelen', 'duele', 'dolen', 'duelo'] },
    { q: '— No me gusta el té. — A mí ___.', options: ['tampoco', 'también', 'sí', 'nunca'] },
  ],
},
{
  id: 'posesivos', icon: '🔑', level: 'A1', title: 'Притяжательные и указательные',
  html: `
<h3>Притяжательные (перед существительным)</h3>
<table>
<tr><th></th><th>ед.</th><th>мн.</th></tr>
<tr><td>мой</td><td>mi</td><td>mis</td></tr>
<tr><td>твой</td><td>tu</td><td>tus</td></tr>
<tr><td>его/её/ваш (usted)</td><td>su</td><td>sus</td></tr>
<tr><td>наш</td><td>nuestro/a</td><td>nuestros/as</td></tr>
<tr><td>ваш (vosotros)</td><td>vuestro/a</td><td>vuestros/as</td></tr>
<tr><td>их/ваш (ustedes)</td><td>su</td><td>sus</td></tr>
</table>
<p>После существительного или отдельно используются полные формы: <span class="es">mío, tuyo, suyo, nuestro</span>: <span class="es">Es amigo mío. Este libro es tuyo.</span></p>
<h3>Указательные</h3>
<ul>
<li><span class="es">este, esta, estos, estas</span> — этот (рядом со мной)</li>
<li><span class="es">ese, esa, esos, esas</span> — тот (рядом с собеседником)</li>
<li><span class="es">aquel, aquella, aquellos, aquellas</span> — вон тот (далеко от обоих)</li>
<li>Средний род для идей и неизвестных предметов: <span class="es">esto, eso, aquello</span>: <span class="es">¿Qué es esto?</span></li>
</ul>`,
  quiz: [
    { q: '___ hermanos viven en Lima. (мои)', options: ['Mis', 'Mi', 'Mios', 'Míos'] },
    { q: '___ casa es grande. (наш)', options: ['Nuestra', 'Nuestro', 'Nuestras', 'Nos'] },
    { q: '¿Qué es ___? (что это?)', options: ['esto', 'este', 'esta', 'estos'] },
    { q: '___ montañas a lo lejos son preciosas.', options: ['Aquellas', 'Estas', 'Esos', 'Aquella'] },
    { q: 'Este libro es ___. (твой)', options: ['tuyo', 'tu', 'tus', 'tuya'] },
  ],
},
{
  id: 'preguntas', icon: '❓', level: 'A1', title: 'Вопросы и отрицание',
  html: `
<p>Вопрос в письме обрамляется знаками <span class="es">¿…?</span>, восклицание — <span class="es">¡…!</span>. Вопросительные слова всегда пишутся с ударением.</p>
<table>
<tr><td>¿Qué?</td><td>что? какой?</td><td>¿Dónde?</td><td>где?</td></tr>
<tr><td>¿Quién(es)?</td><td>кто?</td><td>¿Adónde?</td><td>куда?</td></tr>
<tr><td>¿Cómo?</td><td>как?</td><td>¿De dónde?</td><td>откуда?</td></tr>
<tr><td>¿Cuándo?</td><td>когда?</td><td>¿Por qué?</td><td>почему?</td></tr>
<tr><td>¿Cuánto/a/os/as?</td><td>сколько?</td><td>¿Cuál(es)?</td><td>который? какой?</td></tr>
</table>
<p class="tip"><span class="es">¿Por qué?</span> (почему?) — раздельно и с ударением. <span class="es">Porque</span> (потому что) — слитно.</p>
<h3>Отрицание</h3>
<p>Ставим <span class="es">no</span> перед глаголом: <span class="es">No hablo alemán.</span> Двойное отрицание в испанском — норма: <span class="es">No veo nada. No viene nadie. No voy nunca.</span></p>`,
  quiz: [
    { q: '¿___ vives? — En Valencia.', options: ['Dónde', 'Cuándo', 'Quién', 'Cómo'] },
    { q: '¿___ estás? — Bien, gracias.', options: ['Cómo', 'Qué', 'Cuál', 'Dónde'] },
    { q: '¿___ cuesta? — Diez euros.', options: ['Cuánto', 'Cuántos', 'Qué', 'Cómo'] },
    { q: 'No veo ___ en la calle.', options: ['a nadie', 'a alguien', 'nada nadie', 'ninguno'] },
    { q: '¿___ no vienes? — ___ estoy enfermo.', options: ['Por qué / Porque', 'Porque / Por qué', 'Por qué / Por qué', 'Porqué / Porque'] },
  ],
},
{
  id: 'preposiciones', icon: '🧭', level: 'A2', title: 'Предлоги a, en, de',
  html: `
<ul>
<li><b>a</b> — направление, время, «личное a»: <span class="es">Voy a Madrid. A las tres. Veo a mi madre.</span></li>
<li><b>en</b> — место, транспорт, месяцы/годы: <span class="es">Estoy en casa. Voy en tren. En mayo.</span></li>
<li><b>de</b> — происхождение, принадлежность, материал: <span class="es">Soy de Kiev. El coche de Juan. Una mesa de madera.</span></li>
<li><b>con</b> — с; <span class="es">conmigo, contigo</span> — со мной, с тобой.</li>
<li><b>desde … hasta</b> — от … до: <span class="es">desde las nueve hasta las cinco</span>.</li>
</ul>
<p class="tip">«Личное a»: если прямое дополнение — <b>человек</b> (или любимый питомец), перед ним ставится <span class="es">a</span>: <span class="es">Busco a mi hermano</span>, но <span class="es">Busco mi libro</span>.</p>`,
  quiz: [
    { q: 'Voy ___ trabajo ___ bicicleta.', options: ['al / en', 'en / a', 'a el / con', 'al / de'] },
    { q: 'Visito ___ mis abuelos.', options: ['a', 'en', 'de', '—'] },
    { q: 'Mi cumpleaños es ___ julio.', options: ['en', 'a', 'de', 'por'] },
    { q: '¿Quieres venir ___?', options: ['conmigo', 'con mí', 'con yo', 'a mí'] },
    { q: 'Es el libro ___ Pedro.', options: ['de', 'a', 'en', 'con'] },
  ],
},
{
  id: 'reflexivos', icon: '🪞', level: 'A2', title: 'Возвратные глаголы',
  html: `
<p>Возвратные глаголы (с <span class="es">-se</span>) обозначают действие, направленное на себя — как русское «-ся».</p>
<table>
<tr><th colspan="2">levantarse — вставать</th></tr>
<tr><td>yo</td><td><b>me</b> levanto</td></tr>
<tr><td>tú</td><td><b>te</b> levantas</td></tr>
<tr><td>él/ella/usted</td><td><b>se</b> levanta</td></tr>
<tr><td>nosotros</td><td><b>nos</b> levantamos</td></tr>
<tr><td>vosotros</td><td><b>os</b> levantáis</td></tr>
<tr><td>ellos/ustedes</td><td><b>se</b> levantan</td></tr>
</table>
<p>Частые: <span class="es">llamarse, despertarse (ie), ducharse, vestirse (i), acostarse (ue), sentarse (ie), irse, quedarse, sentirse</span>.</p>
<p class="tip">С инфинитивом местоимение можно присоединить к концу: <span class="es">Voy a ducharme = Me voy a duchar.</span></p>`,
  quiz: [
    { q: 'Yo ___ levanto a las siete.', options: ['me', 'se', 'te', 'nos'] },
    { q: '¿Cómo ___ llamas?', options: ['te', 'se', 'me', 'tu'] },
    { q: 'Nosotros ___ acostamos tarde.', options: ['nos', 'se', 'os', 'me'] },
    { q: 'Mis hijos ___ duchan por la mañana.', options: ['se', 'les', 'los', 'nos'] },
    { q: 'Voy a ___ ahora. (duchar + me)', options: ['ducharme', 'meducharme', 'duchar me', 'duchome'] },
  ],
},
{
  id: 'objetos', icon: '🎁', level: 'A2', title: 'Местоимения-дополнения',
  html: `
<table>
<tr><th></th><th>Прямое (кого? что?)</th><th>Косвенное (кому?)</th></tr>
<tr><td>yo</td><td>me</td><td>me</td></tr>
<tr><td>tú</td><td>te</td><td>te</td></tr>
<tr><td>él / ella / usted</td><td>lo / la</td><td>le</td></tr>
<tr><td>nosotros</td><td>nos</td><td>nos</td></tr>
<tr><td>vosotros</td><td>os</td><td>os</td></tr>
<tr><td>ellos / ellas / ustedes</td><td>los / las</td><td>les</td></tr>
</table>
<ul>
<li>Стоят <b>перед</b> спрягаемым глаголом: <span class="es">Lo compro. Le escribo una carta.</span></li>
<li>Присоединяются к инфинитиву, герундию и утвердительному повелению: <span class="es">Quiero comprarlo. Dímelo.</span></li>
<li>Порядок: косвенное → прямое: <span class="es">Te lo doy.</span></li>
<li><b>le/les + lo/la → se lo/la</b>: <span class="es">Le doy el libro → Se lo doy.</span></li>
</ul>`,
  quiz: [
    { q: '¿Tienes el libro? — Sí, ___ tengo.', options: ['lo', 'la', 'le', 'los'] },
    { q: '¿Ves a María? — Sí, ___ veo.', options: ['la', 'le', 'lo', 'se'] },
    { q: '___ escribo un mensaje a mi madre.', options: ['Le', 'La', 'Lo', 'Se'] },
    { q: 'Le doy las flores → ___ doy.', options: ['Se las', 'Le las', 'Las le', 'Se les'] },
    { q: 'Quiero ___. (comprar + lo)', options: ['comprarlo', 'lo comprarlo', 'comprar lo', 'comprolo'] },
  ],
},
{
  id: 'comparativos', icon: '📊', level: 'A2', title: 'Сравнения',
  html: `
<ul>
<li>Больше: <span class="es">más + прил. + que</span> — <span class="es">Ana es más alta que Luis.</span></li>
<li>Меньше: <span class="es">menos + прил. + que</span> — <span class="es">Es menos caro que el otro.</span></li>
<li>Равенство: <span class="es">tan + прил. + como</span> — <span class="es">Soy tan alto como tú.</span></li>
<li>С существительными: <span class="es">tanto/a/os/as + сущ. + como</span> — <span class="es">Tengo tantos libros como tú.</span></li>
</ul>
<h3>Неправильные формы</h3>
<p><span class="es">bueno → mejor, malo → peor, grande (возраст) → mayor, pequeño (возраст) → menor</span>.</p>
<h3>Превосходная степень</h3>
<p><span class="es">el/la/los/las + más + прил. + de</span>: <span class="es">Es la ciudad más bonita del mundo.</span></p>
<p>Абсолютная: <span class="es">-ísimo</span> — <span class="es">guapísimo, carísimo, riquísimo</span> (очень-очень).</p>`,
  quiz: [
    { q: 'Mi casa es ___ grande ___ la tuya.', options: ['más / que', 'más / como', 'tan / que', 'tanto / como'] },
    { q: 'Ella es ___ inteligente ___ su hermano.', options: ['tan / como', 'tan / que', 'tanto / como', 'más / como'] },
    { q: 'Este vino es ___ que aquel. (лучше)', options: ['mejor', 'más bueno', 'buenísimo', 'más mejor'] },
    { q: 'Es el río ___ largo ___ Europa.', options: ['más / de', 'más / que', 'tan / como', 'menos / que'] },
    { q: 'Tengo ___ amigos como tú.', options: ['tantos', 'tan', 'tantas', 'tanto'] },
  ],
},
{
  id: 'por-para', icon: '🔄', level: 'A2', title: 'Por или para',
  html: `
<div class="cols">
<div><h3>PARA — цель, адресат</h3>
<ul>
<li>Цель: <span class="es">Estudio para aprender.</span></li>
<li>Получатель: <span class="es">Este regalo es para ti.</span></li>
<li>Направление: <span class="es">Salgo para Madrid.</span></li>
<li>Срок: <span class="es">Para el lunes.</span></li>
<li>Мнение: <span class="es">Para mí, es fácil.</span></li>
</ul></div>
<div><h3>POR — причина, путь, обмен</h3>
<ul>
<li>Причина: <span class="es">Gracias por tu ayuda.</span></li>
<li>Через, по: <span class="es">Paseo por el parque.</span></li>
<li>Обмен, цена: <span class="es">Lo compré por diez euros.</span></li>
<li>Время суток: <span class="es">por la mañana</span></li>
<li>Средство: <span class="es">por teléfono, por correo</span></li>
<li>Частота: <span class="es">dos veces por semana</span></li>
</ul></div>
</div>
<p class="tip">Подсказка: <b>para</b> смотрит вперёд (к цели), <b>por</b> смотрит назад (на причину) или «сквозь».</p>`,
  quiz: [
    { q: 'Gracias ___ el regalo.', options: ['por', 'para'] },
    { q: 'Este café es ___ ti.', options: ['para', 'por'] },
    { q: 'Caminamos ___ la playa.', options: ['por', 'para'] },
    { q: 'Estudio ___ ser médico.', options: ['para', 'por'] },
    { q: 'Te llamo ___ teléfono.', options: ['por', 'para'] },
    { q: 'Necesito el informe ___ mañana.', options: ['para', 'por'] },
    { q: 'Voy al gimnasio tres veces ___ semana.', options: ['por', 'para'] },
  ],
},
{
  id: 'indefinido', icon: '⏮️', level: 'A2', title: 'Прошедшее: indefinido',
  html: `
<p><b>Pretérito indefinido</b> — законченные действия в завершённом периоде прошлого: <span class="es">ayer, el año pasado, en 2010, la semana pasada</span>.</p>
<table>
<tr><th></th><th>hablar</th><th>comer / vivir</th></tr>
<tr><td>yo</td><td>habl<b>é</b></td><td>com<b>í</b> / viv<b>í</b></td></tr>
<tr><td>tú</td><td>habl<b>aste</b></td><td>com<b>iste</b></td></tr>
<tr><td>él</td><td>habl<b>ó</b></td><td>com<b>ió</b></td></tr>
<tr><td>nosotros</td><td>habl<b>amos</b></td><td>com<b>imos</b></td></tr>
<tr><td>vosotros</td><td>habl<b>asteis</b></td><td>com<b>isteis</b></td></tr>
<tr><td>ellos</td><td>habl<b>aron</b></td><td>com<b>ieron</b></td></tr>
</table>
<h3>Сильные основы (без ударения в окончаниях!)</h3>
<p><span class="es">tener → tuve, estar → estuve, poder → pude, poner → puse, saber → supe, querer → quise, venir → vine, hacer → hice (hizo), decir → dije (dijeron)</span>.</p>
<p class="tip"><span class="es">Ser</span> и <span class="es">ir</span> в indefinido совпадают: <span class="es">fui, fuiste, fue…</span> Смысл понятен из контекста: <span class="es">Fui a Roma</span> (я ездил) / <span class="es">Fue increíble</span> (было невероятно).</p>`,
  quiz: [
    { q: 'Ayer yo ___ (comer) paella.', options: ['comí', 'comé', 'comió', 'comía'] },
    { q: 'El año pasado ellos ___ (viajar) a Perú.', options: ['viajaron', 'viajieron', 'viajaban', 'viajan'] },
    { q: '¿Qué ___ (hacer) tú el sábado?', options: ['hiciste', 'haciste', 'hizo', 'hacías'] },
    { q: 'Nosotros ___ (tener) suerte.', options: ['tuvimos', 'tenimos', 'tuvemos', 'teníamos'] },
    { q: 'Ella ___ (ir) al médico.', options: ['fue', 'fui', 'iba', 'fué'] },
    { q: 'Ellos me ___ (decir) la verdad.', options: ['dijeron', 'dijieron', 'decieron', 'dicieron'] },
  ],
},
{
  id: 'imperfecto', icon: '🎞️', level: 'A2', title: 'Indefinido или imperfecto',
  html: `
<p><b>Imperfecto</b> — «декорации» прошлого: привычки, описания, процессы, возраст, время.</p>
<table>
<tr><th></th><th>hablar</th><th>comer / vivir</th></tr>
<tr><td>yo</td><td>habl<b>aba</b></td><td>com<b>ía</b></td></tr>
<tr><td>tú</td><td>habl<b>abas</b></td><td>com<b>ías</b></td></tr>
<tr><td>él</td><td>habl<b>aba</b></td><td>com<b>ía</b></td></tr>
<tr><td>nosotros</td><td>habl<b>ábamos</b></td><td>com<b>íamos</b></td></tr>
<tr><td>vosotros</td><td>habl<b>abais</b></td><td>com<b>íais</b></td></tr>
<tr><td>ellos</td><td>habl<b>aban</b></td><td>com<b>ían</b></td></tr>
</table>
<p>Только три неправильных: <span class="es">ser → era, ir → iba, ver → veía</span>.</p>
<div class="cols">
<div><h3>Imperfecto</h3><ul>
<li>Привычка: <span class="es">De niño jugaba al fútbol.</span></li>
<li>Описание: <span class="es">Hacía sol y la casa era grande.</span></li>
<li>Фон: <span class="es">Mientras cocinaba…</span></li>
</ul></div>
<div><h3>Indefinido</h3><ul>
<li>Событие: <span class="es">…sonó el teléfono.</span></li>
<li>Однократно: <span class="es">Ayer jugué al fútbol.</span></li>
<li>Ограниченный срок: <span class="es">Viví en Lima dos años.</span></li>
</ul></div>
</div>
<p class="tip">Imperfecto — по-русски несовершенный вид («делал»), indefinido — чаще совершенный («сделал»).</p>`,
  quiz: [
    { q: 'Cuando era niño, ___ (vivir) en el campo.', options: ['vivía', 'viví', 'vivió', 'vivo'] },
    { q: 'Mientras dormía, ___ (sonar) el teléfono.', options: ['sonó', 'sonaba', 'suena', 'soné'] },
    { q: 'Ayer ___ (llover) todo el día.', options: ['llovió', 'llovía', 'llueve', 'lloverá'] },
    { q: 'Mi abuela siempre ___ (cocinar) los domingos.', options: ['cocinaba', 'cocinó', 'cocina', 'cocinará'] },
    { q: '___ (Ser) las diez cuando llegamos.', options: ['Eran', 'Fueron', 'Son', 'Estaban'] },
    { q: 'De pequeños, ___ (ir) a la playa cada verano.', options: ['íbamos', 'fuimos', 'vamos', 'iremos'] },
  ],
},
{
  id: 'perfecto', icon: '✅', level: 'A2', title: 'Pretérito perfecto',
  html: `
<p><b>haber</b> (в настоящем) + <b>причастие</b>. Прошлое, связанное с настоящим: <span class="es">hoy, esta semana, este año, ya, todavía no, nunca, alguna vez</span>.</p>
<p><span class="es">he, has, ha, hemos, habéis, han</span> + <span class="es">-ado</span> (для -ar) / <span class="es">-ido</span> (для -er, -ir).</p>
<ul>
<li><span class="es">Hoy he comido mucho.</span> — Сегодня я много съел.</li>
<li><span class="es">¿Has estado alguna vez en México?</span> — Ты когда-нибудь был в Мексике?</li>
<li><span class="es">Todavía no hemos terminado.</span> — Мы ещё не закончили.</li>
</ul>
<h3>Неправильные причастия</h3>
<p><span class="es">hacer → hecho, decir → dicho, ver → visto, escribir → escrito, poner → puesto, volver → vuelto, abrir → abierto, romper → roto, morir → muerto</span>.</p>
<p class="tip">В Латинской Америке вместо perfecto часто говорят indefinido: <span class="es">Hoy comí mucho.</span></p>`,
  quiz: [
    { q: 'Hoy ___ (yo, trabajar) mucho.', options: ['he trabajado', 'trabajé', 'ha trabajado', 'he trabajo'] },
    { q: '¿___ (tú, ver) esta película?', options: ['Has visto', 'Has veído', 'Ha visto', 'Has vido'] },
    { q: 'Nunca ___ (nosotros, estar) en Cuba.', options: ['hemos estado', 'habemos estado', 'hemos estuvido', 'han estado'] },
    { q: 'Ella ya ___ (escribir) la carta.', options: ['ha escrito', 'ha escribido', 'he escrito', 'ha escrita'] },
    { q: '¿Quién ___ (romper) el vaso?', options: ['ha roto', 'ha rompido', 'han roto', 'ha rompió'] },
  ],
},
{
  id: 'futuro', icon: '🔮', level: 'A2', title: 'Будущее время',
  html: `
<h3>Ir a + инфинитив — планы</h3>
<p><span class="es">Voy a estudiar. Vamos a comer. ¿Vas a venir?</span> — самый частый способ говорить о будущем в разговоре.</p>
<h3>Futuro simple — прогнозы, обещания</h3>
<p>Окончания добавляются <b>к инфинитиву целиком</b>: <span class="es">-é, -ás, -á, -emos, -éis, -án</span>.</p>
<p><span class="es">hablaré, comerás, vivirá…</span></p>
<p>Неправильные основы (они же в condicional): <span class="es">tener → tendr-, poner → pondr-, salir → saldr-, venir → vendr-, poder → podr-, saber → sabr-, querer → querr-, hacer → har-, decir → dir-</span>.</p>
<p class="tip">Futuro также выражает предположение: <span class="es">¿Dónde estará Juan?</span> — Где бы это мог быть Хуан? <span class="es">Tendrá unos 30 años.</span> — Ему, наверное, около 30.</p>`,
  quiz: [
    { q: 'Mañana ___ (yo) a estudiar.', options: ['voy', 'iré', 'vaya', 'fui'] },
    { q: 'El año que viene ___ (nosotros, viajar) a Chile.', options: ['viajaremos', 'viajeremos', 'viajamos', 'viajaríamos'] },
    { q: 'Te lo ___ (decir) mañana.', options: ['diré', 'deciré', 'diría', 'decirá'] },
    { q: 'Ellos ___ (tener) que esperar.', options: ['tendrán', 'tenerán', 'tendrían', 'tienen'] },
    { q: '¿Qué ___ (hacer) tú en verano?', options: ['harás', 'hacerás', 'harías', 'haces a'] },
  ],
},
{
  id: 'condicional', icon: '🤔', level: 'B1', title: 'Условное наклонение',
  html: `
<p><b>Condicional</b> — «бы»: инфинитив + <span class="es">-ía, -ías, -ía, -íamos, -íais, -ían</span>. Те же неправильные основы, что у будущего.</p>
<ul>
<li>Вежливая просьба: <span class="es">¿Podría ayudarme?</span> — Не могли бы вы мне помочь?</li>
<li>Желание: <span class="es">Me gustaría viajar.</span> — Я хотел бы путешествовать.</li>
<li>Совет: <span class="es">Yo que tú, iría al médico.</span> — На твоём месте я бы пошёл к врачу.</li>
<li>Гипотеза: <span class="es">Si tuviera dinero, compraría una casa.</span></li>
</ul>
<p class="tip">В условии с <span class="es">si</span> никогда не ставится condicional: <span class="es">si tuviera</span> (subjuntivo), а не <span class="es">si tendría</span>.</p>`,
  quiz: [
    { q: 'Me ___ (gustar) visitar Japón.', options: ['gustaría', 'gustará', 'gustaba', 'guste'] },
    { q: '¿___ (poder) usted cerrar la ventana?', options: ['Podría', 'Podería', 'Pudiera', 'Puede a'] },
    { q: 'Yo que tú, no lo ___ (hacer).', options: ['haría', 'hacería', 'haré', 'hiciera'] },
    { q: 'Si tuviera tiempo, ___ (aprender) a tocar el piano.', options: ['aprendería', 'aprenderé', 'aprendiera', 'aprendo'] },
    { q: 'Nosotros ___ (salir) antes, pero llueve.', options: ['saldríamos', 'saliríamos', 'saldremos', 'salimos'] },
  ],
},
{
  id: 'subjuntivo', icon: '🌙', level: 'B1', title: 'Subjuntivo: первые шаги',
  html: `
<p><b>Presente de subjuntivo</b> выражает желание, сомнение, эмоцию, оценку — то, что не подаётся как факт.</p>
<p>Образование: форма <b>yo</b> настоящего времени без <span class="es">-o</span> + «противоположные» окончания:</p>
<ul>
<li>-ar → <span class="es">-e, -es, -e, -emos, -éis, -en</span>: <span class="es">hablar → hable</span></li>
<li>-er/-ir → <span class="es">-a, -as, -a, -amos, -áis, -an</span>: <span class="es">tener → tengo → tenga</span></li>
</ul>
<p>Неправильные: <span class="es">ser → sea, estar → esté, ir → vaya, saber → sepa, dar → dé, haber → haya</span>.</p>
<h3>Когда использовать (WEIRDO)</h3>
<ul>
<li><b>W</b>ishes: <span class="es">Quiero que vengas.</span> — Хочу, чтобы ты пришёл.</li>
<li><b>E</b>motions: <span class="es">Me alegra que estés aquí.</span></li>
<li><b>I</b>mpersonal: <span class="es">Es importante que estudies.</span></li>
<li><b>R</b>ecommendations: <span class="es">Te recomiendo que descanses.</span></li>
<li><b>D</b>oubt: <span class="es">No creo que llueva.</span></li>
<li><b>O</b>jalá: <span class="es">¡Ojalá haga sol!</span></li>
</ul>
<p class="tip">Ключ — смена подлежащего: <span class="es">Quiero ir</span> (я хочу пойти) vs <span class="es">Quiero que vayas</span> (хочу, чтобы ТЫ пошёл). <span class="es">Cuando</span> + будущее → subjuntivo: <span class="es">Cuando llegues, llámame.</span></p>`,
  quiz: [
    { q: 'Quiero que tú ___ (venir) a mi fiesta.', options: ['vengas', 'vienes', 'vendrás', 'venir'] },
    { q: 'Es importante que ___ (nosotros, estudiar).', options: ['estudiemos', 'estudiamos', 'estudiaremos', 'estudiar'] },
    { q: '¡Ojalá ___ (hacer) buen tiempo!', options: ['haga', 'hace', 'hará', 'hizo'] },
    { q: 'No creo que él ___ (ser) culpable.', options: ['sea', 'es', 'está', 'será'] },
    { q: 'Cuando ___ (llegar, tú), llámame.', options: ['llegues', 'llegas', 'llegarás', 'llegaste'] },
    { q: 'Creo que ___ (ser) una buena idea.', options: ['es', 'sea', 'fuera', 'esté'] },
  ],
},
{
  id: 'imperativo', icon: '📢', level: 'B1', title: 'Повелительное наклонение',
  html: `
<h3>Утвердительное «tú»</h3>
<p>= форма 3-го лица ед. ч. настоящего времени: <span class="es">habla, come, escribe</span>.</p>
<p>Неправильные: <span class="es">di (decir), haz (hacer), ve (ir), pon (poner), sal (salir), sé (ser), ten (tener), ven (venir)</span>.</p>
<h3>Usted / ustedes / отрицание</h3>
<p>Берутся из subjuntivo: <span class="es">hable usted, coman ustedes, no hables, no comas</span>.</p>
<h3>Местоимения</h3>
<p>В утверждении — присоединяются: <span class="es">Dímelo. Siéntate.</span> В отрицании — стоят перед глаголом: <span class="es">No me lo digas. No te sientes.</span></p>`,
  quiz: [
    { q: '¡___ (tú, venir) aquí!', options: ['Ven', 'Viene', 'Vienes', 'Venga'] },
    { q: '___ (tú, hacer) los deberes.', options: ['Haz', 'Hace', 'Haga', 'Hagas'] },
    { q: 'No ___ (tú, hablar) tan alto.', options: ['hables', 'habla', 'hablas', 'hable'] },
    { q: 'Pase y ___ (usted, sentarse).', options: ['siéntese', 'siéntate', 'se sienta', 'sentarse'] },
    { q: '___ (tú, decir + me + lo).', options: ['Dímelo', 'Dimelo', 'Me lo di', 'Dícemelo'] },
  ],
},
];
