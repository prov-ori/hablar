// Рассказы для чтения. Каждая строка text — «испанское предложение|перевод».
// glossary — слова, которых нет в общем словаре (форма из текста → перевод).
// В questions первый вариант — правильный.

const STORIES_RAW = [
{
  id: 'cafe', level: 'A1', icon: '☕', title: 'Un café en Madrid', ru: 'Кофе в Мадриде',
  text: `
Me llamo Lucía y vivo en Madrid.|Меня зовут Лусия, и я живу в Мадриде.
Todas las mañanas voy a un café pequeño cerca de mi casa.|Каждое утро я хожу в маленькое кафе рядом с домом.
El camarero se llama Pablo y es muy simpático.|Официанта зовут Пабло, он очень приятный.
Siempre pido un café con leche y una tostada con tomate.|Я всегда заказываю кофе с молоком и тост с помидором.
Pablo ya sabe lo que quiero.|Пабло уже знает, что я хочу.
Cuando entro, él dice: «¿Lo de siempre, Lucía?»|Когда я вхожу, он говорит: «Как обычно, Лусия?»
Yo respondo: «Sí, por favor».|Я отвечаю: «Да, пожалуйста».
Leo el periódico y miro a la gente en la calle.|Я читаю газету и смотрю на людей на улице.
Después, pago la cuenta y voy al trabajo en metro.|Потом я оплачиваю счёт и еду на работу на метро.
Es mi momento favorito del día.|Это мой любимый момент дня.`,
  glossary: { tostada: 'тост', 'lo de siempre': 'как обычно', momento: 'момент', favorito: 'любимый', gente: 'люди', entro: 'вхожу', respondo: 'отвечаю', pido: 'заказываю', pago: 'плачу' },
  questions: [
    { q: '¿Dónde vive Lucía?', options: ['En Madrid', 'En Barcelona', 'En Sevilla', 'En México'] },
    { q: '¿Qué pide Lucía?', options: ['Un café con leche y una tostada', 'Un té y un pastel', 'Un zumo de naranja', 'Nada'] },
    { q: '¿Cómo va Lucía al trabajo?', options: ['En metro', 'En coche', 'A pie', 'En bicicleta'] },
  ],
},
{
  id: 'familia', level: 'A1', icon: '👪', title: 'La familia de Marco', ru: 'Семья Марко',
  text: `
Hola, soy Marco y tengo doce años.|Привет, я Марко, мне двенадцать лет.
Vivo con mis padres y mi hermana Sofía en Valencia.|Я живу с родителями и сестрой Софией в Валенсии.
Mi padre es cocinero y trabaja en un restaurante.|Мой отец — повар, он работает в ресторане.
Mi madre es profesora de inglés.|Моя мама — учительница английского.
Sofía tiene dieciséis años y le gusta mucho la música.|Софии шестнадцать, она очень любит музыку.
Ella toca la guitarra todas las tardes.|Она играет на гитаре каждый день после обеда.
Los domingos visitamos a mis abuelos en el pueblo.|По воскресеньям мы навещаем бабушку и дедушку в деревне.
Mi abuela hace una paella deliciosa.|Моя бабушка готовит очень вкусную паэлью.
Mi abuelo tiene un perro que se llama Toby.|У дедушки есть собака по кличке Тоби.
¡Me encanta mi familia!|Я обожаю свою семью!`,
  glossary: { visitamos: 'навещаем', toca: 'играет (на инструменте)', tiene: 'имеет / у него есть', hace: 'делает / готовит' },
  questions: [
    { q: '¿Cuántos años tiene Marco?', options: ['Doce', 'Dieciséis', 'Diez', 'Veinte'] },
    { q: '¿Qué hace el padre de Marco?', options: ['Es cocinero', 'Es profesor', 'Es médico', 'Es músico'] },
    { q: '¿Quién toca la guitarra?', options: ['Sofía', 'Marco', 'La abuela', 'El padre'] },
    { q: '¿Cómo se llama el perro?', options: ['Toby', 'Marco', 'Pablo', 'Rex'] },
  ],
},
{
  id: 'mercado', level: 'A1', icon: '🍅', title: 'En el mercado', ru: 'На рынке',
  text: `
Es sábado por la mañana y Carmen va al mercado.|Субботнее утро, и Кармен идёт на рынок.
Necesita comprar fruta y verdura para la semana.|Ей нужно купить фрукты и овощи на неделю.
—Buenos días. ¿Cuánto cuestan las fresas?|— Доброе утро. Сколько стоит клубника?
—Tres euros el kilo. Están muy dulces hoy.|— Три евро за кило. Сегодня она очень сладкая.
—Pues quiero un kilo, por favor. ¿Y los tomates?|— Тогда мне кило, пожалуйста. А помидоры?
—Los tomates están a dos euros.|— Помидоры по два евро.
—Medio kilo de tomates y una cebolla, por favor.|— Полкило помидоров и одну луковицу, пожалуйста.
—¿Algo más?|— Что-нибудь ещё?
—No, gracias. ¿Cuánto es todo?|— Нет, спасибо. Сколько за всё?
—Son cinco euros con cincuenta.|— Пять евро пятьдесят.
Carmen paga y vuelve a casa contenta.|Кармен платит и возвращается домой довольная.`,
  glossary: { verdura: 'овощи', kilo: 'килограмм', pues: 'ну / тогда', medio: 'половина / пол-', 'algo más': 'что-нибудь ещё', todo: 'всё', cuestan: 'стоят', paga: 'платит', vuelve: 'возвращается', necesita: 'нужно (ей)' },
  questions: [
    { q: '¿Qué día va Carmen al mercado?', options: ['El sábado', 'El lunes', 'El domingo', 'El viernes'] },
    { q: '¿Cuánto cuesta un kilo de fresas?', options: ['Tres euros', 'Dos euros', 'Cinco euros', 'Un euro'] },
    { q: '¿Cuánto paga Carmen en total?', options: ['5,50 €', '3 €', '2 €', '10 €'] },
  ],
},
{
  id: 'rutina', level: 'A2', icon: '⏰', title: 'Un día normal', ru: 'Обычный день',
  text: `
Javier se despierta a las seis y media todos los días.|Хавьер просыпается в половине седьмого каждый день.
Primero se ducha y después desayuna un café y unas galletas.|Сначала он принимает душ, а потом завтракает кофе с печеньем.
Sale de casa a las siete y cuarto para coger el autobús.|Он выходит из дома в четверть восьмого, чтобы сесть на автобус.
Trabaja en un hospital: es enfermero.|Он работает в больнице: он медбрат.
Su trabajo es difícil, pero le gusta mucho ayudar a la gente.|Его работа трудная, но ему очень нравится помогать людям.
Come a las dos con sus compañeros en la cafetería.|Он обедает в два с коллегами в кафетерии.
Por la tarde, cuando termina, va al gimnasio o pasea con su novia.|После обеда, когда заканчивает, он идёт в спортзал или гуляет с девушкой.
Cena a las nueve y media, como muchos españoles.|Ужинает в половине десятого, как многие испанцы.
Antes de dormir, lee un rato.|Перед сном он немного читает.
Se acuesta a las once, muy cansado.|Ложится спать в одиннадцать, очень уставший.`,
  glossary: { 'se despierta': 'просыпается', 'se ducha': 'принимает душ', galletas: 'печенье', coger: 'сесть (на транспорт)', compañeros: 'коллеги / товарищи', cafetería: 'кафетерий', 'un rato': 'некоторое время', 'se acuesta': 'ложится спать', españoles: 'испанцы', termina: 'заканчивает', desayuna: 'завтракает', cena: 'ужинает', come: 'ест / обедает', lee: 'читает', sale: 'выходит' },
  questions: [
    { q: '¿A qué hora se despierta Javier?', options: ['A las seis y media', 'A las siete', 'A las ocho', 'A las once'] },
    { q: '¿Dónde trabaja Javier?', options: ['En un hospital', 'En una escuela', 'En un banco', 'En un gimnasio'] },
    { q: '¿Qué hace antes de dormir?', options: ['Lee', 'Ve la tele', 'Cocina', 'Corre'] },
  ],
},
{
  id: 'viaje', level: 'A2', icon: '🗺️', title: 'Viaje a México', ru: 'Поездка в Мексику',
  text: `
El verano pasado, Elena y su amiga Rosa viajaron a México.|Прошлым летом Елена и её подруга Роса съездили в Мексику.
Llegaron a la Ciudad de México un lunes por la noche.|Они прилетели в Мехико в понедельник вечером.
Al día siguiente visitaron el centro histórico y el Museo de Antropología.|На следующий день они посетили исторический центр и Музей антропологии.
Comieron tacos en un puesto de la calle y les encantaron.|Они поели тако с уличного лотка и были в восторге.
Después fueron a Oaxaca en autobús.|Потом они поехали в Оахаку на автобусе.
Allí probaron el mole, una salsa con chocolate y chile.|Там они попробовали моле — соус с шоколадом и чили.
El último día fueron a la playa en Cancún.|В последний день они поехали на пляж в Канкуне.
El agua estaba muy caliente y el cielo, completamente azul.|Вода была очень тёплой, а небо — совершенно голубым.
Elena sacó muchísimas fotos.|Елена сделала огромное количество фотографий.
Fue el mejor viaje de su vida.|Это было лучшее путешествие в её жизни.`,
  glossary: { 'el verano pasado': 'прошлым летом', viajaron: 'путешествовали / съездили', llegaron: 'прибыли', 'al día siguiente': 'на следующий день', visitaron: 'посетили', histórico: 'исторический', comieron: 'съели', puesto: 'лоток / киоск', encantaron: 'очень понравились', fueron: 'поехали / пошли', probaron: 'попробовали', salsa: 'соус', último: 'последний', estaba: 'была', completamente: 'полностью', sacó: 'сделала (фото)', muchísimas: 'очень много', fue: 'было / был' },
  questions: [
    { q: '¿Cuándo viajaron a México?', options: ['El verano pasado', 'El invierno pasado', 'Ayer', 'Hace diez años'] },
    { q: '¿Qué es el mole?', options: ['Una salsa con chocolate y chile', 'Un tipo de taco', 'Una bebida', 'Un museo'] },
    { q: '¿Cómo fueron a Oaxaca?', options: ['En autobús', 'En avión', 'En coche', 'En tren'] },
    { q: '¿Dónde está la playa que visitaron?', options: ['En Cancún', 'En Oaxaca', 'En la Ciudad de México', 'En Madrid'] },
  ],
},
{
  id: 'perro', level: 'A2', icon: '🐕', title: 'El perro perdido', ru: 'Потерявшаяся собака',
  text: `
Una tarde de lluvia, Diego encontró un perro pequeño en la calle.|Однажды дождливым вечером Диего нашёл на улице маленькую собаку.
El perro estaba mojado, sucio y tenía mucho frío.|Собака была мокрой, грязной и очень замёрзла.
No llevaba collar, pero parecía muy tranquilo.|На ней не было ошейника, но она казалась очень спокойной.
Diego lo llevó a su casa y le dio agua y comida.|Диего отнёс её домой и дал воды и еды.
Al día siguiente, puso carteles por todo el barrio.|На следующий день он развесил объявления по всему району.
Pasaron tres días y nadie llamó.|Прошло три дня, и никто не позвонил.
Diego empezó a pensar que quizás el perro podía quedarse con él.|Диего начал думать, что, может быть, собака сможет остаться у него.
Pero el cuarto día sonó el teléfono.|Но на четвёртый день зазвонил телефон.
Era una niña que lloraba de alegría: ¡era su perro, Bruno!|Это была девочка, которая плакала от радости: это была её собака, Бруно!
Diego se puso un poco triste, pero también muy contento por la niña.|Диего немного загрустил, но и очень обрадовался за девочку.`,
  glossary: { encontró: 'нашёл', mojado: 'мокрый', collar: 'ошейник', parecía: 'казался', llevó: 'отнёс', dio: 'дал', puso: 'повесил / положил', carteles: 'объявления / плакаты', barrio: 'район', pasaron: 'прошли', nadie: 'никто', llamó: 'позвонил', empezó: 'начал', quedarse: 'остаться', cuarto: 'четвёртый', sonó: 'зазвонил', niña: 'девочка', lloraba: 'плакала', 'se puso': 'стал (о настроении)', podía: 'мог', tenía: 'имел / было (ему)', llevaba: 'носил' },
  questions: [
    { q: '¿Cómo estaba el perro?', options: ['Mojado y sucio', 'Limpio y feliz', 'Enfermo', 'Enfadado'] },
    { q: '¿Qué hizo Diego al día siguiente?', options: ['Puso carteles', 'Llevó el perro al veterinario', 'Llamó a la policía', 'Nada'] },
    { q: '¿Quién llamó por teléfono?', options: ['Una niña', 'Un policía', 'El vecino', 'Su madre'] },
    { q: '¿Cómo se llamaba el perro?', options: ['Bruno', 'Diego', 'Toby', 'No tenía nombre'] },
  ],
},
{
  id: 'abuela', level: 'B1', icon: '🍲', title: 'La receta de la abuela', ru: 'Бабушкин рецепт',
  text: `
Cuando era pequeña, pasaba todos los veranos en casa de mi abuela, en un pueblo de Andalucía.|Когда я была маленькой, я проводила каждое лето у бабушки, в деревне в Андалусии.
Hacía tanto calor que no salíamos de casa hasta que se ponía el sol.|Было так жарко, что мы не выходили из дома, пока не садилось солнце.
Mi abuela cocinaba gazpacho casi todos los días.|Бабушка готовила гаспачо почти каждый день.
Me dejaba ayudarla: yo lavaba los tomates y ella cortaba el pepino y el pimiento.|Она разрешала мне помогать: я мыла помидоры, а она резала огурец и перец.
Nunca usaba una receta escrita; lo hacía todo «a ojo».|Она никогда не пользовалась записанным рецептом; всё делала «на глаз».
Años después, cuando ella ya no estaba, intenté preparar su gazpacho.|Годы спустя, когда её уже не было, я попробовала приготовить её гаспачо.
Lo intenté diez veces, pero nunca me salía igual.|Я пробовала десять раз, но у меня никогда не получалось так же.
Un día mi madre me dijo: «El secreto no está en los ingredientes, sino en la paciencia».|Однажды мама сказала мне: «Секрет не в ингредиентах, а в терпении».
Entonces recordé que mi abuela siempre dejaba el gazpacho en la nevera toda la noche.|Тогда я вспомнила, что бабушка всегда оставляла гаспачо в холодильнике на всю ночь.
Desde ese día, mi gazpacho sabe casi como el suyo.|С того дня мой гаспачо на вкус почти как её.`,
  glossary: { pasaba: 'проводила', 'se ponía el sol': 'садилось солнце', salíamos: 'выходили', gazpacho: 'гаспачо (холодный суп)', dejaba: 'позволяла / оставляла', lavaba: 'мыла', pepino: 'огурец', pimiento: 'перец (овощ)', usaba: 'использовала', 'a ojo': 'на глаз', 'ya no estaba': 'её уже не было', intenté: 'попыталась', preparar: 'приготовить', 'me salía': 'у меня получалось', igual: 'такой же', secreto: 'секрет', sino: 'а (но)', paciencia: 'терпение', recordé: 'вспомнила', sabe: 'имеет вкус / знает', suyo: 'её / его', hacía: 'было (о погоде)' },
  questions: [
    { q: '¿Dónde vivía la abuela?', options: ['En un pueblo de Andalucía', 'En Madrid', 'En México', 'En la costa norte'] },
    { q: '¿Qué hacía la narradora para ayudar?', options: ['Lavaba los tomates', 'Cortaba el pepino', 'Compraba el pan', 'Lavaba los platos'] },
    { q: '¿Cuál era el secreto del gazpacho?', options: ['Dejarlo en la nevera toda la noche', 'Añadir más sal', 'Usar tomates verdes', 'Una receta escrita'] },
  ],
},
{
  id: 'entrevista', level: 'B1', icon: '💼', title: 'La entrevista de trabajo', ru: 'Собеседование',
  text: `
Ana llevaba meses buscando trabajo cuando por fin recibió una llamada.|Ана уже несколько месяцев искала работу, когда наконец ей позвонили.
Una empresa de diseño quería conocerla el lunes siguiente.|Дизайнерская компания хотела встретиться с ней в следующий понедельник.
Pasó el fin de semana preparándose: leyó sobre la empresa y practicó sus respuestas.|Она провела выходные в подготовке: прочитала о компании и отрепетировала ответы.
El lunes se levantó temprano, pero el metro se averió y llegó diez minutos tarde.|В понедельник она встала рано, но метро сломалось, и она опоздала на десять минут.
Estaba muy nerviosa y pensó que ya había perdido la oportunidad.|Она очень нервничала и думала, что уже упустила шанс.
Sin embargo, la directora sonrió y le dijo que no se preocupara.|Однако директор улыбнулась и сказала ей не волноваться.
Hablaron durante una hora sobre sus proyectos y sus ideas.|Они проговорили час о её проектах и идеях.
Al final, la directora le preguntó: «¿Cuándo podrías empezar?»|В конце директор спросила: «Когда ты могла бы начать?»
Ana no se lo podía creer.|Ана не могла в это поверить.
Aprendió que un pequeño error no tiene por qué arruinarlo todo.|Она поняла, что маленькая ошибка вовсе не обязательно всё портит.`,
  glossary: { llevaba: 'уже (провела какое-то время)', 'por fin': 'наконец', recibió: 'получила', llamada: 'звонок', diseño: 'дизайн', siguiente: 'следующий', preparándose: 'готовясь', leyó: 'прочитала', practicó: 'отрепетировала', 'se levantó': 'встала', 'se averió': 'сломался', 'había perdido': 'упустила', oportunidad: 'возможность', directora: 'директор (жен.)', sonrió: 'улыбнулась', 'se preocupara': 'волновалась', proyectos: 'проекты', ideas: 'идеи', 'al final': 'в конце', preguntó: 'спросила', podrías: 'могла бы', aprendió: 'поняла / усвоила', error: 'ошибка', 'no tiene por qué': 'вовсе не обязательно', arruinarlo: 'испортить это', llegó: 'прибыла', pensó: 'подумала' },
  questions: [
    { q: '¿Por qué llegó tarde Ana?', options: ['El metro se averió', 'Se despertó tarde', 'Se perdió', 'Había mucho tráfico'] },
    { q: '¿Cómo reaccionó la directora?', options: ['Sonrió y la tranquilizó', 'Se enfadó', 'Canceló la entrevista', 'No dijo nada'] },
    { q: '¿Cuál es la lección de la historia?', options: ['Un pequeño error no lo arruina todo', 'Hay que llegar siempre temprano', 'El metro es peligroso', 'No hay que prepararse'] },
  ],
},
{
  id: 'leyenda', level: 'B1', icon: '🌋', title: 'La leyenda de los volcanes', ru: 'Легенда о вулканах',
  text: `
Hace muchos siglos, en el valle de México, vivía una princesa llamada Iztaccíhuatl.|Много веков назад в долине Мехико жила принцесса по имени Истаксиуатль.
Ella estaba enamorada de Popocatépetl, un joven guerrero valiente.|Она была влюблена в Попокатепетля, молодого храброго воина.
El padre de la princesa le prometió a Popocatépetl que podría casarse con ella si volvía victorioso de la guerra.|Отец принцессы пообещал Попокатепетлю, что тот сможет на ней жениться, если вернётся с войны с победой.
El guerrero se fue a luchar y pasaron meses sin noticias.|Воин ушёл сражаться, и прошли месяцы без вестей.
Un rival celoso le dijo a la princesa que Popocatépetl había muerto.|Ревнивый соперник сказал принцессе, что Попокатепетль погиб.
Iztaccíhuatl, llena de tristeza, murió poco después.|Истаксиуатль, полная печали, вскоре умерла.
Cuando el guerrero volvió y supo lo que había pasado, llevó el cuerpo de su amada a las montañas.|Когда воин вернулся и узнал, что произошло, он отнёс тело любимой в горы.
Allí se arrodilló a su lado con una antorcha encendida para cuidarla para siempre.|Там он встал на колени рядом с ней с зажжённым факелом, чтобы вечно её охранять.
Los dioses los convirtieron en dos volcanes que todavía hoy se pueden ver desde la ciudad.|Боги превратили их в два вулкана, которые и сегодня видны из города.
Por eso, a uno lo llaman «la mujer dormida».|Поэтому один из них называют «спящей женщиной».`,
  glossary: { 'hace muchos siglos': 'много веков назад', valle: 'долина', princesa: 'принцесса', llamada: 'по имени', guerrero: 'воин', prometió: 'пообещал', casarse: 'жениться / выйти замуж', victorioso: 'победителем', guerra: 'война', 'se fue': 'ушёл', luchar: 'сражаться', noticias: 'новости / вести', rival: 'соперник', 'había muerto': 'погиб', murió: 'умерла', volvió: 'вернулся', supo: 'узнал', 'había pasado': 'произошло', amada: 'любимая', 'se arrodilló': 'встал на колени', antorcha: 'факел', encendida: 'зажжённая', cuidarla: 'охранять её', 'para siempre': 'навсегда', dioses: 'боги', convirtieron: 'превратили', mujer: 'женщина', dormida: 'спящая', llaman: 'называют', 'se pueden ver': 'можно увидеть' },
  questions: [
    { q: '¿Quién era Popocatépetl?', options: ['Un guerrero', 'Un rey', 'Un dios', 'Un rival celoso'] },
    { q: '¿Por qué murió Iztaccíhuatl?', options: ['Por tristeza, al creer que él había muerto', 'En la guerra', 'Por una enfermedad', 'Por un volcán'] },
    { q: '¿En qué se convirtieron los amantes?', options: ['En dos volcanes', 'En dos estrellas', 'En un río', 'En dos árboles'] },
  ],
},
{
  id: 'tomatina', level: 'B1', icon: '🍅', title: 'La Tomatina', ru: 'Томатина',
  text: `
Cada último miércoles de agosto, el pequeño pueblo de Buñol, en Valencia, se llena de gente de todo el mundo.|Каждую последнюю среду августа маленький городок Буньоль в Валенсии наполняется людьми со всего мира.
Vienen para participar en la Tomatina, una de las fiestas más extrañas de España.|Они приезжают, чтобы участвовать в Томатине — одном из самых странных праздников Испании.
Durante una hora, miles de personas se lanzan tomates unas a otras en las calles.|В течение часа тысячи людей бросают друг в друга помидоры на улицах.
Se dice que la tradición empezó en 1945, cuando unos jóvenes se pelearon en un desfile y usaron los tomates de un puesto de verduras.|Говорят, традиция началась в 1945 году, когда молодые люди подрались на параде и использовали помидоры с овощного лотка.
Al año siguiente, repitieron la pelea a propósito, y así nació la fiesta.|На следующий год они повторили драку нарочно — так и родился праздник.
Hoy en día hay reglas: hay que aplastar los tomates antes de tirarlos y no se puede romper la ropa de los demás.|Сегодня есть правила: нужно раздавить помидор, прежде чем бросить, и нельзя рвать чужую одежду.
Cuando suena la señal final, todos dejan de tirar tomates.|Когда звучит финальный сигнал, все перестают бросать помидоры.
Los bomberos limpian las calles con agua y, curiosamente, ¡quedan más limpias que antes!|Пожарные моют улицы водой, и, как ни странно, они становятся чище, чем были!`,
  glossary: { 'se llena': 'наполняется', mundo: 'мир', participar: 'участвовать', extrañas: 'странные', miles: 'тысячи', personas: 'люди', 'se lanzan': 'бросают друг в друга', 'unas a otras': 'друг в друга', 'se dice': 'говорят', tradición: 'традиция', jóvenes: 'молодые люди', 'se pelearon': 'подрались', desfile: 'парад', usaron: 'использовали', puesto: 'лоток', verduras: 'овощи', repitieron: 'повторили', pelea: 'драка', 'a propósito': 'нарочно', nació: 'родился', 'hoy en día': 'в наши дни', reglas: 'правила', 'hay que': 'нужно', aplastar: 'раздавить', tirarlos: 'бросать их', 'los demás': 'другие', suena: 'звучит', señal: 'сигнал', final: 'финальный', 'dejan de': 'перестают', curiosamente: 'любопытно / как ни странно', quedan: 'остаются / становятся', limpian: 'моют / чистят', 'no se puede': 'нельзя' },
  questions: [
    { q: '¿Cuándo se celebra la Tomatina?', options: ['El último miércoles de agosto', 'El primer lunes de julio', 'En Navidad', 'Cada domingo'] },
    { q: '¿Cuánto dura la batalla?', options: ['Una hora', 'Un día', 'Diez minutos', 'Una semana'] },
    { q: '¿Qué hay que hacer antes de tirar un tomate?', options: ['Aplastarlo', 'Lavarlo', 'Cortarlo', 'Pelarlo'] },
    { q: '¿Quién limpia las calles?', options: ['Los bomberos', 'Los turistas', 'Los niños', 'La policía'] },
  ],
},
];

const STORIES = STORIES_RAW.map(s => ({ ...s, lines: parseLines(s.text) }));
