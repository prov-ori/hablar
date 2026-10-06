// Словарь по темам. Формат строк: «испанский|русский». Варианты ответа — через « / ».
// sentences — предложения для упражнений «собери фразу» и «вставь слово».

const TOPICS_RAW = [
{
  id: 'saludos', icon: '👋', title: 'Saludos', ru: 'Приветствия и основы', level: 'A1',
  words: `
hola|привет
adiós|до свидания / пока
buenos días|доброе утро / добрый день
buenas tardes|добрый день / добрый вечер
buenas noches|доброй ночи / добрый вечер
gracias|спасибо
de nada|не за что / пожалуйста
por favor|пожалуйста (просьба)
perdón|простите / извините
lo siento|мне жаль / извините
sí|да
no|нет
hasta luego|до встречи / увидимся
hasta mañana|до завтра
mucho gusto|очень приятно
¿qué tal?|как дела?
bien|хорошо
mal|плохо
más o menos|так себе
encantado|очень рад (знакомству)
bienvenido|добро пожаловать
el señor|господин / сеньор
la señora|госпожа / сеньора
el amigo|друг
la amiga|подруга
el nombre|имя
¿cómo te llamas?|как тебя зовут?
me llamo|меня зовут
¿de dónde eres?|откуда ты?
soy de|я из`,
  sentences: `
Hola, me llamo Ana.|Привет, меня зовут Ана.
Buenos días, señor García.|Доброе утро, сеньор Гарсия.
¿Cómo te llamas?|Как тебя зовут?
Mucho gusto, soy Pedro.|Очень приятно, я Педро.
Soy de Rusia.|Я из России.
¿De dónde eres tú?|Откуда ты?
Muchas gracias por todo.|Большое спасибо за всё.
Hasta mañana, amigo.|До завтра, друг.
Estoy bien, gracias.|У меня всё хорошо, спасибо.
Lo siento mucho.|Мне очень жаль.`,
},
{
  id: 'numeros', icon: '🔢', title: 'Números', ru: 'Числа', level: 'A1',
  words: `
uno|один
dos|два
tres|три
cuatro|четыре
cinco|пять
seis|шесть
siete|семь
ocho|восемь
nueve|девять
diez|десять
once|одиннадцать
doce|двенадцать
quince|пятнадцать
veinte|двадцать
treinta|тридцать
cuarenta|сорок
cincuenta|пятьдесят
cien|сто
mil|тысяча
primero|первый
segundo|второй
tercero|третий
la mitad|половина
el número|число / номер
contar|считать
muchos|много (мн.)
pocos|мало (мн.)
cero|ноль`,
  sentences: `
Tengo dos hermanos.|У меня два брата.
Mi casa es el número diez.|Мой дом — номер десять.
Hay treinta alumnos en la clase.|В классе тридцать учеников.
Tengo veinte años.|Мне двадцать лет.
El libro cuesta quince euros.|Книга стоит пятнадцать евро.
Es mi primer día aquí.|Это мой первый день здесь.
Necesito cinco minutos.|Мне нужно пять минут.
Hay mil personas en la plaza.|На площади тысяча человек.`,
},
{
  id: 'colores', icon: '🎨', title: 'Colores', ru: 'Цвета', level: 'A1',
  words: `
el color|цвет
rojo|красный
azul|синий / голубой
verde|зелёный
amarillo|жёлтый
negro|чёрный
blanco|белый
gris|серый
marrón|коричневый
naranja|оранжевый
rosa|розовый
morado|фиолетовый
claro|светлый
oscuro|тёмный
dorado|золотой
plateado|серебряный
celeste|небесно-голубой
el arcoíris|радуга
brillante|яркий / блестящий
pintar|рисовать красками`,
  sentences: `
El cielo es azul.|Небо голубое.
Mi coche es rojo.|Моя машина красная.
La hierba es verde.|Трава зелёная.
¿De qué color es tu casa?|Какого цвета твой дом?
Me gusta el color amarillo.|Мне нравится жёлтый цвет.
El gato negro duerme.|Чёрный кот спит.
Tengo una camisa blanca.|У меня белая рубашка.
El mar es azul oscuro.|Море тёмно-синее.`,
},
{
  id: 'familia', icon: '👨‍👩‍👧', title: 'La familia', ru: 'Семья', level: 'A1',
  words: `
la familia|семья
el padre|отец
la madre|мать
los padres|родители
el hermano|брат
la hermana|сестра
el hijo|сын
la hija|дочь
el abuelo|дедушка
la abuela|бабушка
el tío|дядя
la tía|тётя
el primo|двоюродный брат
la prima|двоюродная сестра
el esposo|муж
la esposa|жена
el nieto|внук
la nieta|внучка
el bebé|младенец
el novio|парень / жених
la novia|девушка / невеста
los gemelos|близнецы
el sobrino|племянник
la sobrina|племянница
el suegro|свёкор / тесть
la suegra|свекровь / тёща
mayor|старший
menor|младший
casado|женатый / замужняя
soltero|холостой / незамужняя`,
  sentences: `
Mi madre se llama Carmen.|Мою маму зовут Кармен.
Tengo una hermana menor.|У меня есть младшая сестра.
Mis abuelos viven en el campo.|Мои бабушка и дедушка живут в деревне.
Mi padre es médico.|Мой отец — врач.
¿Tienes hermanos?|У тебя есть братья или сёстры?
Mi tío tiene dos hijos.|У моего дяди двое детей.
Mi hermano mayor está casado.|Мой старший брат женат.
La familia come junta los domingos.|Семья обедает вместе по воскресеньям.
Mi abuela cocina muy bien.|Моя бабушка очень хорошо готовит.
Somos cinco en mi familia.|Нас в семье пятеро.`,
},
{
  id: 'comida', icon: '🥘', title: 'La comida', ru: 'Еда и напитки', level: 'A1',
  words: `
la comida|еда
el pan|хлеб
el agua|вода
la leche|молоко
el café|кофе
el té|чай
el zumo / el jugo|сок
el vino|вино
la cerveza|пиво
la carne|мясо
el pollo|курица
el pescado|рыба (блюдо)
el huevo|яйцо
el queso|сыр
el jamón|хамон / ветчина
el arroz|рис
la sopa|суп
la ensalada|салат
la fruta|фрукт
la manzana|яблоко
el plátano|банан
la naranja|апельсин
la fresa|клубника
el tomate|помидор
la patata / la papa|картофель
la cebolla|лук
el ajo|чеснок
la sal|соль
el azúcar|сахар
el aceite|масло (растительное)
la mantequilla|сливочное масло
el desayuno|завтрак
el almuerzo|обед
la cena|ужин
el postre|десерт
delicioso|вкусный
tener hambre|быть голодным
tener sed|хотеть пить
la cuenta|счёт (в ресторане)
el camarero|официант`,
  sentences: `
Quiero un café con leche.|Я хочу кофе с молоком.
La sopa está muy caliente.|Суп очень горячий.
No como carne.|Я не ем мясо.
Tengo mucha hambre.|Я очень голоден.
La cuenta, por favor.|Счёт, пожалуйста.
Me gusta mucho la fruta.|Мне очень нравятся фрукты.
El desayuno está en la mesa.|Завтрак на столе.
¿Tienes sed?|Ты хочешь пить?
Esta paella está deliciosa.|Эта паэлья очень вкусная.
Compro pan y queso.|Я покупаю хлеб и сыр.
Para mí, una ensalada.|Мне, пожалуйста, салат.
Cenamos a las nueve.|Мы ужинаем в девять.`,
},
{
  id: 'animales', icon: '🐾', title: 'Los animales', ru: 'Животные', level: 'A1',
  words: `
el animal|животное
el perro|собака
el gato|кот / кошка
el pájaro|птица
el pez|рыба (живая)
el caballo|лошадь
la vaca|корова
el cerdo|свинья
la oveja|овца
la gallina|курица (птица)
el ratón|мышь
el conejo|кролик
el oso|медведь
el lobo|волк
el zorro|лиса
el león|лев
el tigre|тигр
el elefante|слон
el mono|обезьяна
la jirafa|жираф
la serpiente|змея
la tortuga|черепаха
la mariposa|бабочка
la abeja|пчела
la araña|паук
el toro|бык
el burro|осёл
la ballena|кит
el delfín|дельфин
la mascota|домашний питомец`,
  sentences: `
Tengo un perro y dos gatos.|У меня собака и две кошки.
El gato duerme en el sofá.|Кот спит на диване.
Los pájaros cantan por la mañana.|Птицы поют по утрам.
El elefante es muy grande.|Слон очень большой.
¿Tienes una mascota?|У тебя есть питомец?
La tortuga camina muy despacio.|Черепаха ходит очень медленно.
El caballo come hierba.|Лошадь ест траву.
Me dan miedo las arañas.|Я боюсь пауков.`,
},
{
  id: 'cuerpo', icon: '🧍', title: 'El cuerpo', ru: 'Тело', level: 'A1',
  words: `
el cuerpo|тело
la cabeza|голова
el pelo|волосы
la cara|лицо
el ojo|глаз
la nariz|нос
la boca|рот
el diente|зуб
la oreja|ухо
el cuello|шея
el hombro|плечо
el brazo|рука (от плеча)
la mano|кисть руки / рука
el dedo|палец
el pecho|грудь
la espalda|спина
el estómago|желудок / живот
la pierna|нога
la rodilla|колено
el pie|ступня
el corazón|сердце
la sangre|кровь
la piel|кожа
el hueso|кость
la lengua|язык (орган)
los labios|губы`,
  sentences: `
Me duele la cabeza.|У меня болит голова.
Ella tiene los ojos verdes.|У неё зелёные глаза.
Lávate las manos.|Помой руки.
Tengo el pelo largo.|У меня длинные волосы.
Me duelen los pies.|У меня болят ноги (ступни).
El corazón es un músculo.|Сердце — это мышца.
Abre la boca, por favor.|Откройте рот, пожалуйста.
Me duele la espalda.|У меня болит спина.`,
},
{
  id: 'ropa', icon: '👕', title: 'La ropa', ru: 'Одежда', level: 'A1',
  words: `
la ropa|одежда
la camisa|рубашка
la camiseta|футболка
los pantalones|брюки
los vaqueros|джинсы
la falda|юбка
el vestido|платье
el abrigo|пальто
la chaqueta|куртка / пиджак
el jersey|свитер
los zapatos|туфли / обувь
las zapatillas|кроссовки / тапочки
las botas|сапоги
los calcetines|носки
el sombrero|шляпа
la gorra|кепка
la bufanda|шарф
los guantes|перчатки
el cinturón|ремень
la corbata|галстук
el bolso|сумка
el traje|костюм
el bañador|купальник / плавки
la talla|размер
llevar|носить (одежду)
ponerse|надевать
quitarse|снимать
probarse|примерять`,
  sentences: `
Llevo una camisa azul.|Я в синей рубашке.
Hace frío, ponte el abrigo.|Холодно, надень пальто.
¿Qué talla usa usted?|Какой у вас размер?
Estos zapatos son muy caros.|Эти туфли очень дорогие.
¿Puedo probarme este vestido?|Можно примерить это платье?
Me quito los zapatos en casa.|Дома я снимаю обувь.
Necesito una bufanda nueva.|Мне нужен новый шарф.
Ella lleva una falda roja.|На ней красная юбка.`,
},
{
  id: 'casa', icon: '🏠', title: 'La casa', ru: 'Дом', level: 'A1',
  words: `
la casa|дом
el piso / el apartamento|квартира
la habitación|комната
el dormitorio|спальня
la cocina|кухня
el baño|ванная / туалет
el salón|гостиная
el comedor|столовая
el jardín|сад
la puerta|дверь
la ventana|окно
la pared|стена
el suelo|пол
el techo|потолок / крыша
la escalera|лестница
la mesa|стол
la silla|стул
la cama|кровать
el sofá|диван
el armario|шкаф
la lámpara|лампа
el espejo|зеркало
la nevera|холодильник
el horno|духовка
la ducha|душ
la llave|ключ
el vecino|сосед
limpiar|убирать / чистить
alquilar|арендовать`,
  sentences: `
Mi casa tiene tres habitaciones.|В моём доме три комнаты.
La cocina es pequeña pero bonita.|Кухня маленькая, но красивая.
Abre la ventana, por favor.|Открой окно, пожалуйста.
El gato está debajo de la mesa.|Кот под столом.
Vivo en un piso en el centro.|Я живу в квартире в центре.
No encuentro las llaves.|Я не могу найти ключи.
Limpio la casa los sábados.|Я убираю дом по субботам.
La leche está en la nevera.|Молоко в холодильнике.
Quiero alquilar un apartamento.|Я хочу снять квартиру.`,
},
{
  id: 'tiempo', icon: '📅', title: 'El tiempo y el calendario', ru: 'Дни, месяцы, время', level: 'A1',
  words: `
el día|день
la semana|неделя
el mes|месяц
el año|год
lunes|понедельник
martes|вторник
miércoles|среда
jueves|четверг
viernes|пятница
sábado|суббота
domingo|воскресенье
enero|январь
febrero|февраль
marzo|март
abril|апрель
mayo|май
junio|июнь
julio|июль
agosto|август
septiembre|сентябрь
octubre|октябрь
noviembre|ноябрь
diciembre|декабрь
hoy|сегодня
mañana|завтра
ayer|вчера
la mañana|утро
la tarde|день / вечер (после обеда)
la noche|ночь / вечер
la hora|час
el minuto|минута
el fin de semana|выходные
temprano|рано
tarde|поздно`,
  sentences: `
Hoy es lunes.|Сегодня понедельник.
Mi cumpleaños es en mayo.|Мой день рождения в мае.
¿Qué hora es?|Который час?
Son las tres de la tarde.|Сейчас три часа дня.
El fin de semana voy a la playa.|На выходных я еду на пляж.
Mañana trabajo por la mañana.|Завтра я работаю утром.
Ayer llegué tarde.|Вчера я пришёл поздно.
La semana tiene siete días.|В неделе семь дней.
Me levanto temprano.|Я встаю рано.`,
},
{
  id: 'clima', icon: '🌦️', title: 'El clima', ru: 'Погода и времена года', level: 'A1',
  words: `
el clima|климат
el sol|солнце
la lluvia|дождь
la nieve|снег
el viento|ветер
la nube|облако
la tormenta|гроза / буря
la niebla|туман
el calor|жара
el frío|холод
la temperatura|температура
la primavera|весна
el verano|лето
el otoño|осень
el invierno|зима
llover|идти (о дожде)
nevar|идти (о снеге)
hace sol|солнечно
hace calor|жарко
hace frío|холодно
hace viento|ветрено
está nublado|облачно
el grado|градус
húmedo|влажный
seco|сухой`,
  sentences: `
Hoy hace mucho calor.|Сегодня очень жарко.
En invierno nieva mucho.|Зимой идёт много снега.
Está lloviendo ahora.|Сейчас идёт дождь.
¿Qué tiempo hace hoy?|Какая сегодня погода?
Me gusta el verano.|Мне нравится лето.
Hace veinte grados.|Двадцать градусов.
Mañana va a llover.|Завтра будет дождь.
En otoño hace viento.|Осенью ветрено.`,
},
{
  id: 'ciudad', icon: '🏙️', title: 'La ciudad', ru: 'Город', level: 'A2',
  words: `
la ciudad|город
el pueblo|деревня / посёлок
la calle|улица
la plaza|площадь
el parque|парк
el edificio|здание
la tienda|магазин
el supermercado|супермаркет
el mercado|рынок
el banco|банк / скамейка
la farmacia|аптека
el hospital|больница
la escuela|школа
la iglesia|церковь
el museo|музей
el cine|кинотеатр
el teatro|театр
el restaurante|ресторан
la biblioteca|библиотека
el hotel|гостиница
la estación|вокзал / станция
el aeropuerto|аэропорт
el puente|мост
el semáforo|светофор
la esquina|угол (улицы)
cerca|близко
lejos|далеко
a la derecha|направо
a la izquierda|налево
todo recto|прямо
enfrente de|напротив
al lado de|рядом с`,
  sentences: `
¿Dónde está la farmacia?|Где аптека?
El museo está cerca de la plaza.|Музей рядом с площадью.
Gire a la derecha en la esquina.|Поверните направо на углу.
Siga todo recto.|Идите прямо.
El banco está enfrente del hotel.|Банк напротив гостиницы.
Vivo lejos del centro.|Я живу далеко от центра.
Vamos al cine esta noche.|Пойдём в кино сегодня вечером.
La biblioteca cierra a las ocho.|Библиотека закрывается в восемь.
Hay un mercado en mi calle.|На моей улице есть рынок.`,
},
{
  id: 'transporte', icon: '✈️', title: 'Viajes y transporte', ru: 'Путешествия и транспорт', level: 'A2',
  words: `
el viaje|путешествие / поездка
viajar|путешествовать
el coche / el carro|машина
el autobús|автобус
el tren|поезд
el avión|самолёт
el barco|корабль / лодка
la bicicleta|велосипед
el metro|метро
el taxi|такси
el billete / el boleto|билет
el pasaporte|паспорт
la maleta|чемодан
el equipaje|багаж
la reserva|бронь
el vuelo|рейс / полёт
la salida|выход / отправление
la llegada|прибытие
el andén|платформа
la parada|остановка
el mapa|карта
el turista|турист
la playa|пляж
la montaña|гора
de ida y vuelta|туда и обратно
perder|опоздать (на транспорт) / терять
llegar|прибывать
salir|выходить / отправляться
la frontera|граница
las vacaciones|отпуск / каникулы`,
  sentences: `
Quiero un billete de ida y vuelta.|Я хочу билет туда и обратно.
¿A qué hora sale el tren?|Во сколько отправляется поезд?
El vuelo llega a las seis.|Рейс прибывает в шесть.
Voy al trabajo en metro.|Я езжу на работу на метро.
Perdí el autobús.|Я опоздал на автобус.
Tengo una reserva a nombre de López.|У меня бронь на имя Лопес.
¿Dónde está la parada de taxis?|Где стоянка такси?
Mi maleta es muy pesada.|Мой чемодан очень тяжёлый.
En verano viajamos a la playa.|Летом мы ездим на пляж.
Necesito mi pasaporte.|Мне нужен мой паспорт.`,
},
{
  id: 'profesiones', icon: '👩‍⚕️', title: 'Las profesiones', ru: 'Профессии и работа', level: 'A2',
  words: `
el trabajo|работа
trabajar|работать
el médico|врач
el enfermero|медбрат / медсестра
el profesor|учитель / преподаватель
el abogado|юрист / адвокат
el ingeniero|инженер
el cocinero|повар
el policía|полицейский
el bombero|пожарный
el conductor|водитель
el periodista|журналист
el artista|художник / артист
el músico|музыкант
el cantante|певец
el escritor|писатель
el dentista|стоматолог
el agricultor|фермер
el vendedor|продавец
el jefe|начальник
el empleado|сотрудник
la empresa|компания
la oficina|офис
el sueldo|зарплата
la reunión|совещание / встреча
el estudiante|студент
el desempleo|безработица
jubilado|на пенсии
contratar|нанимать
despedir|увольнять`,
  sentences: `
¿A qué te dedicas?|Чем ты занимаешься?
Soy profesora de matemáticas.|Я учительница математики.
Mi hermano trabaja en un hospital.|Мой брат работает в больнице.
Tengo una reunión a las diez.|У меня совещание в десять.
Mi jefe es muy simpático.|Мой начальник очень приятный.
Ella quiere ser médica.|Она хочет стать врачом.
Trabajo en una empresa grande.|Я работаю в большой компании.
Mi abuelo está jubilado.|Мой дедушка на пенсии.`,
},
{
  id: 'emociones', icon: '😊', title: 'Emociones y carácter', ru: 'Чувства и характер', level: 'A2',
  words: `
feliz|счастливый
contento|довольный
triste|грустный
enfadado / enojado|сердитый
cansado|уставший
nervioso|нервный
tranquilo|спокойный
preocupado|обеспокоенный
aburrido|скучающий / скучный
sorprendido|удивлённый
asustado|испуганный
enamorado|влюблённый
orgulloso|гордый
celoso|ревнивый
simpático|приятный / милый
antipático|неприятный
amable|любезный / добрый
tímido|застенчивый
valiente|смелый
perezoso|ленивый
trabajador|трудолюбивый
divertido|весёлый / забавный
serio|серьёзный
inteligente|умный
generoso|щедрый
el miedo|страх
la alegría|радость
el amor|любовь
la tristeza|грусть`,
  sentences: `
Estoy muy cansado hoy.|Я сегодня очень устал.
Mi hermana es muy simpática.|Моя сестра очень милая.
¿Por qué estás triste?|Почему ты грустишь?
Estamos contentos con el resultado.|Мы довольны результатом.
Él es tímido pero inteligente.|Он застенчивый, но умный.
Estoy nervioso por el examen.|Я нервничаю из-за экзамена.
Tengo miedo de los perros.|Я боюсь собак.
Ella está enamorada de Juan.|Она влюблена в Хуана.
Mis amigos son muy divertidos.|Мои друзья очень весёлые.`,
},
{
  id: 'naturaleza', icon: '🌳', title: 'La naturaleza', ru: 'Природа', level: 'A2',
  words: `
la naturaleza|природа
el árbol|дерево
la flor|цветок
la planta|растение
la hoja|лист
la hierba|трава
el bosque|лес
el río|река
el lago|озеро
el mar|море
el océano|океан
la isla|остров
la costa|побережье
el desierto|пустыня
la selva|джунгли
el volcán|вулкан
la piedra|камень
la arena|песок
el cielo|небо
la estrella|звезда
la luna|луна
la tierra|земля
el campo|поле / деревня
la cueva|пещера
la ola|волна
el medio ambiente|окружающая среда
reciclar|перерабатывать
proteger|защищать`,
  sentences: `
El río cruza la ciudad.|Река пересекает город.
Hay muchas estrellas en el cielo.|На небе много звёзд.
Me encanta pasear por el bosque.|Я обожаю гулять по лесу.
Las flores son muy bonitas.|Цветы очень красивые.
Tenemos que proteger el medio ambiente.|Мы должны защищать окружающую среду.
La isla tiene playas de arena blanca.|На острове пляжи с белым песком.
Esta noche hay luna llena.|Сегодня ночью полнолуние.
Siempre reciclo el plástico.|Я всегда сдаю пластик на переработку.`,
},
{
  id: 'escuela', icon: '🎒', title: 'La escuela', ru: 'Учёба', level: 'A2',
  words: `
el colegio|школа
la universidad|университет
la clase|урок / класс
el alumno|ученик
el libro|книга
el cuaderno|тетрадь
el lápiz|карандаш
el bolígrafo|ручка
la goma|ластик
la mochila|рюкзак
la pizarra|доска
el examen|экзамен
la nota|оценка / записка
los deberes|домашнее задание
la pregunta|вопрос
la respuesta|ответ
la palabra|слово
la frase|фраза
el idioma|язык (иностранный)
aprender|учить / учиться
estudiar|учиться / изучать
enseñar|преподавать / учить кого-то
escribir|писать
leer|читать
entender|понимать
repetir|повторять
aprobar|сдать (экзамен)
suspender|провалить (экзамен)`,
  sentences: `
Estudio español todos los días.|Я учу испанский каждый день.
No entiendo la pregunta.|Я не понимаю вопрос.
¿Puede repetir, por favor?|Можете повторить, пожалуйста?
Mañana tengo un examen.|Завтра у меня экзамен.
Saqué una buena nota.|Я получил хорошую оценку.
¿Cómo se dice esta palabra en español?|Как сказать это слово по-испански?
Hago los deberes por la tarde.|Я делаю домашнее задание днём.
La profesora escribe en la pizarra.|Учительница пишет на доске.
Aprobé el examen de historia.|Я сдал экзамен по истории.`,
},
{
  id: 'tecnologia', icon: '💻', title: 'La tecnología', ru: 'Технологии', level: 'A2',
  words: `
el ordenador / la computadora|компьютер
el portátil|ноутбук
el móvil / el celular|мобильный телефон
la pantalla|экран
el teclado|клавиатура
el ratón|мышь (компьютерная)
la contraseña|пароль
el correo electrónico|электронная почта
el mensaje|сообщение
la red|сеть
la página web|веб-страница
la aplicación|приложение
el archivo|файл
la batería|батарея
el cargador|зарядное устройство
descargar|скачивать
subir|загружать / подниматься
buscar|искать
enviar|отправлять
borrar|удалять
guardar|сохранять
la foto|фотография
el vídeo|видео
la impresora|принтер
la nube|облако
conectar|подключать`,
  sentences: `
Mi móvil no tiene batería.|У моего телефона села батарея.
¿Cuál es la contraseña del wifi?|Какой пароль от вайфая?
Te envío un mensaje luego.|Я пришлю тебе сообщение позже.
Olvidé mi contraseña.|Я забыл свой пароль.
Guarda el archivo antes de cerrar.|Сохрани файл перед закрытием.
Busco información en internet.|Я ищу информацию в интернете.
Voy a descargar la aplicación.|Я скачаю приложение.
La pantalla está rota.|Экран разбит.`,
},
{
  id: 'ocio', icon: '⚽', title: 'Deportes y ocio', ru: 'Спорт и досуг', level: 'A2',
  words: `
el deporte|спорт
el fútbol|футбол
el baloncesto|баскетбол
el tenis|теннис
la natación|плавание
correr|бегать
nadar|плавать
jugar|играть
el equipo|команда
el partido|матч
ganar|выигрывать
el gimnasio|спортзал
la pelota|мяч
la música|музыка
la película|фильм
la canción|песня
bailar|танцевать
cantar|петь
pasear|гулять
la fiesta|праздник / вечеринка
el juego|игра
el tiempo libre|свободное время
el ajedrez|шахматы
la guitarra|гитара
dibujar|рисовать
el concierto|концерт
la entrada|входной билет / вход`,
  sentences: `
Juego al fútbol los sábados.|Я играю в футбол по субботам.
¿Qué haces en tu tiempo libre?|Что ты делаешь в свободное время?
Me encanta bailar salsa.|Я обожаю танцевать сальсу.
Nuestro equipo ganó el partido.|Наша команда выиграла матч.
Voy al gimnasio tres veces por semana.|Я хожу в спортзал три раза в неделю.
Esta película es muy divertida.|Этот фильм очень смешной.
Mi hermano toca la guitarra.|Мой брат играет на гитаре.
Compré dos entradas para el concierto.|Я купил два билета на концерт.`,
},
{
  id: 'salud', icon: '🩺', title: 'La salud', ru: 'Здоровье', level: 'A2',
  words: `
la salud|здоровье
enfermo|больной
sano|здоровый
el dolor|боль
la fiebre|температура (жар)
la tos|кашель
el resfriado|простуда
la gripe|грипп
la alergia|аллергия
la herida|рана
la medicina|лекарство / медицина
la pastilla|таблетка
la receta|рецепт
la cita|приём (у врача) / свидание
la clínica|клиника
la ambulancia|скорая помощь
el seguro|страховка
doler|болеть
toser|кашлять
descansar|отдыхать
mejorar|улучшать / выздоравливать
¡socorro!|на помощь!
el paciente|пациент
grave|серьёзный (о болезни)
embarazada|беременная`,
  sentences: `
Me duele la garganta.|У меня болит горло.
Tengo fiebre y tos.|У меня температура и кашель.
Necesito una cita con el médico.|Мне нужно записаться к врачу.
Tome una pastilla cada ocho horas.|Принимайте таблетку каждые восемь часов.
Soy alérgico a la penicilina.|У меня аллергия на пенициллин.
¡Llame a una ambulancia!|Вызовите скорую!
Tienes que descansar mucho.|Тебе нужно много отдыхать.
¿Ya te sientes mejor?|Тебе уже лучше?`,
},
{
  id: 'compras', icon: '🛍️', title: 'De compras', ru: 'Покупки и деньги', level: 'A2',
  words: `
comprar|покупать
vender|продавать
pagar|платить
costar|стоить
el precio|цена
el dinero|деньги
el euro|евро
la moneda|монета / валюта
el billete|купюра / билет
la tarjeta|карта
en efectivo|наличными
barato|дешёвый
caro|дорогой
la oferta|предложение / скидка
el descuento|скидка
las rebajas|распродажа
el recibo|чек
el cliente|клиент
la caja|касса / коробка
el probador|примерочная
cambiar|менять / обменивать
devolver|возвращать
gastar|тратить
ahorrar|копить / экономить
¿cuánto cuesta?|сколько стоит?`,
  sentences: `
¿Cuánto cuesta esta camiseta?|Сколько стоит эта футболка?
Es demasiado caro.|Это слишком дорого.
¿Puedo pagar con tarjeta?|Можно оплатить картой?
Prefiero pagar en efectivo.|Я предпочитаю платить наличными.
Hay rebajas en todas las tiendas.|Во всех магазинах распродажа.
Quiero devolver estos zapatos.|Я хочу вернуть эти туфли.
¿Me da el recibo, por favor?|Дайте мне чек, пожалуйста.
Estoy ahorrando para un viaje.|Я коплю на путешествие.`,
},
{
  id: 'verbos', icon: '⚡', title: 'Verbos esenciales', ru: 'Главные глаголы', level: 'A1',
  words: `
ser|быть (сущность, характеристика)
estar|быть / находиться
tener|иметь
hacer|делать
ir|идти / ехать
venir|приходить
poder|мочь
querer|хотеть / любить
decir|говорить / сказать
hablar|говорить / разговаривать
saber|знать (факт)
conocer|знать (быть знакомым)
ver|видеть
mirar|смотреть
oír|слышать
escuchar|слушать
dar|давать
poner|класть / ставить
comer|есть
beber|пить
vivir|жить
dormir|спать
pensar|думать
creer|верить / считать
necesitar|нуждаться
abrir|открывать
cerrar|закрывать
empezar|начинать
terminar|заканчивать
ayudar|помогать
esperar|ждать / надеяться
llamar|звать / звонить
volver|возвращаться
encontrar|находить
pedir|просить / заказывать`,
  sentences: `
Quiero aprender español.|Я хочу выучить испанский.
¿Puedes ayudarme?|Ты можешь мне помочь?
No sé dónde está.|Я не знаю, где это.
Vivo en Madrid.|Я живу в Мадриде.
Necesito dormir más.|Мне нужно больше спать.
Te espero en la puerta.|Жду тебя у двери.
Conozco a tu hermano.|Я знаком с твоим братом.
Vuelvo a las siete.|Я вернусь в семь.
¿Qué piensas de esto?|Что ты думаешь об этом?
La tienda abre a las nueve.|Магазин открывается в девять.
Voy a pedir una pizza.|Я закажу пиццу.`,
},
{
  id: 'adjetivos', icon: '✨', title: 'Adjetivos', ru: 'Прилагательные', level: 'A1',
  words: `
grande|большой
pequeño|маленький
alto|высокий
bajo|низкий
largo|длинный
corto|короткий
nuevo|новый
viejo|старый
joven|молодой
bonito|красивый
feo|некрасивый
bueno|хороший
malo|плохой
fácil|лёгкий (несложный)
difícil|трудный
rápido|быстрый
lento|медленный
caliente|горячий
frío|холодный
limpio|чистый
sucio|грязный
lleno|полный
vacío|пустой
fuerte|сильный
débil|слабый
rico|богатый / вкусный
pobre|бедный
importante|важный
interesante|интересный
mismo|тот же самый
diferente|разный
mejor|лучше / лучший
peor|хуже / худший`,
  sentences: `
Es un libro muy interesante.|Это очень интересная книга.
Mi coche es viejo pero rápido.|Моя машина старая, но быстрая.
El examen fue muy difícil.|Экзамен был очень трудным.
La habitación está limpia.|Комната чистая.
Este café está frío.|Этот кофе холодный.
Mi abuelo es alto y fuerte.|Мой дедушка высокий и сильный.
Esta ciudad es más bonita.|Этот город красивее.
Es el mejor día de mi vida.|Это лучший день в моей жизни.`,
},
{
  id: 'conectores', icon: '🔗', title: 'Palabras útiles', ru: 'Наречия и связки', level: 'A2',
  words: `
y|и
o|или
pero|но
porque|потому что
¿por qué?|почему?
también|тоже / также
tampoco|тоже не
siempre|всегда
nunca|никогда
a veces|иногда
ya|уже
todavía|ещё / всё ещё
muy|очень
mucho|много / очень
poco|мало
aquí|здесь
allí|там
ahora|сейчас
después|потом / после
antes|раньше / до
luego|потом
entonces|тогда / итак
sin embargo|однако
además|кроме того
quizás|может быть
casi|почти
solo|только / один
juntos|вместе
otra vez|ещё раз
por eso|поэтому
¿cuándo?|когда?
¿dónde?|где?
¿cómo?|как?
¿qué?|что?
¿quién?|кто?
¿cuánto?|сколько?`,
  sentences: `
Siempre desayuno a las ocho.|Я всегда завтракаю в восемь.
Nunca bebo café por la noche.|Я никогда не пью кофе вечером.
Todavía no he comido.|Я ещё не ел.
Ya terminé los deberes.|Я уже закончил домашнее задание.
Yo tampoco lo sé.|Я тоже не знаю.
Me gusta, pero es caro.|Мне нравится, но это дорого.
Está lloviendo, por eso me quedo en casa.|Идёт дождь, поэтому я остаюсь дома.
A veces vamos juntos al cine.|Иногда мы вместе ходим в кино.
¿Dónde vives ahora?|Где ты сейчас живёшь?`,
},
{
  id: 'cocina', icon: '👨‍🍳', title: 'En la cocina', ru: 'Кулинария', level: 'B1',
  words: `
cocinar|готовить
la receta|рецепт
el ingrediente|ингредиент
cortar|резать
pelar|чистить (овощи)
freír|жарить
hervir|варить / кипятить
asar|запекать / жарить на гриле
mezclar|смешивать
añadir|добавлять
calentar|нагревать
la sartén|сковорода
la olla|кастрюля
el cuchillo|нож
el tenedor|вилка
la cuchara|ложка
el plato|тарелка / блюдо
el vaso|стакан
la taza|чашка
la harina|мука
la pimienta|перец (специя)
picante|острый
dulce|сладкий
salado|солёный
amargo|горький
crudo|сырой
hecho|готовый (приготовленный)`,
  sentences: `
Primero, pela las patatas.|Сначала почисти картошку.
Corta la cebolla en trozos pequeños.|Нарежь лук мелкими кусочками.
Añade un poco de sal.|Добавь немного соли.
Hierve el agua durante diez minutos.|Кипяти воду десять минут.
La salsa está demasiado picante.|Соус слишком острый.
Necesito una sartén grande.|Мне нужна большая сковорода.
Mezcla la harina con los huevos.|Смешай муку с яйцами.
Esta tortilla está muy rica.|Эта тортилья очень вкусная.`,
},
{
  id: 'sociedad', icon: '🗳️', title: 'Sociedad y opiniones', ru: 'Общество и мнения', level: 'B1',
  words: `
la sociedad|общество
el gobierno|правительство
la ley|закон
el derecho|право
la política|политика
el país|страна
el ciudadano|гражданин
la libertad|свобода
la igualdad|равенство
la cultura|культура
la historia|история
el problema|проблема
la solución|решение
la opinión|мнение
estar de acuerdo|быть согласным
en mi opinión|по моему мнению
creo que|я думаю, что
el desarrollo|развитие
la economía|экономика
la crisis|кризис
la noticia|новость
el periódico|газета
la encuesta|опрос
la mayoría|большинство
el futuro|будущее
mejorar|улучшать
cambiar|менять
votar|голосовать`,
  sentences: `
En mi opinión, es una buena idea.|По моему мнению, это хорошая идея.
No estoy de acuerdo contigo.|Я с тобой не согласен.
Creo que tienes razón.|Думаю, ты прав.
Es un problema muy serio.|Это очень серьёзная проблема.
Tenemos que buscar una solución.|Нам нужно найти решение.
Leo el periódico cada mañana.|Я читаю газету каждое утро.
La mayoría de la gente votó.|Большинство людей проголосовало.
El futuro depende de nosotros.|Будущее зависит от нас.
Es importante que todos participen.|Важно, чтобы все участвовали.`,
},
{
  id: 'expresiones', icon: '💡', title: 'Expresiones', ru: 'Разговорные выражения', level: 'B1',
  words: `
¡qué bien!|как здорово!
¡qué pena!|как жаль!
¡vale!|ладно / окей
¡claro!|конечно!
¡ojalá!|хоть бы! / дай бог!
¡no pasa nada!|ничего страшного!
¡ni idea!|понятия не имею!
¡qué va!|да ну! / ничего подобного!
¡menos mal!|слава богу! / хорошо, что…
¡anda!|да ладно! / надо же!
¡venga!|давай!
¡buen provecho!|приятного аппетита!
¡salud!|будьте здоровы! / за здоровье!
¡enhorabuena!|поздравляю!
¡feliz cumpleaños!|с днём рождения!
¡cuidado!|осторожно!
¡qué rollo!|какая скука!
¡qué guay!|как круто! (Испания)
no me importa|мне всё равно
me da igual|мне без разницы
tener ganas de|хотеть (чего-то сделать)
echar de menos|скучать (по кому-то)
dar una vuelta|прогуляться
tener prisa|торопиться
tener razón|быть правым`,
  sentences: `
Tengo ganas de ir a la playa.|Мне хочется пойти на пляж.
Te echo de menos.|Я по тебе скучаю.
¡Qué pena que no puedas venir!|Как жаль, что ты не можешь прийти!
Lo siento, tengo prisa.|Извини, я тороплюсь.
¿Damos una vuelta por el parque?|Прогуляемся по парку?
¡Ojalá haga sol mañana!|Хоть бы завтра было солнце!
Me da igual, elige tú.|Мне без разницы, выбирай ты.
¡Menos mal que llegaste!|Хорошо, что ты пришёл!
Tienes razón, lo siento.|Ты прав, извини.`,
},
];

function parseLines(text) {
  return text.trim().split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const [es, ru] = l.split('|');
    return { es: es.trim(), ru: ru.trim() };
  });
}

const TOPICS = TOPICS_RAW.map(t => ({
  ...t,
  words: parseLines(t.words),
  sentences: parseLines(t.sentences),
}));

// Первый вариант испанского слова (до « / ») — каноническая форма для отображения и озвучки
function primaryEs(es) { return es.split('/')[0].trim(); }

const ALL_WORDS = TOPICS.flatMap(t => t.words.map(w => ({ ...w, topic: t.id })));

const WORDS_PER_LESSON = 7;

// Учебный путь: каждая тема — юнит; слова разбиты на уроки + итоговое повторение
const UNITS = TOPICS.map(t => {
  const chunks = [];
  for (let i = 0; i < t.words.length; i += WORDS_PER_LESSON) chunks.push(t.words.slice(i, i + WORDS_PER_LESSON));
  // слишком маленький хвост присоединяем к предыдущему уроку
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 4) {
    const tail = chunks.pop();
    chunks[chunks.length - 1] = chunks[chunks.length - 1].concat(tail);
  }
  const lessons = chunks.map((words, i) => ({ title: 'Урок ' + (i + 1), words, review: false }));
  lessons.push({ title: 'Повторение', words: t.words, review: true });
  return { ...t, lessons };
});

// Словарь для подсказок при чтении: форма без артикля -> перевод
const LOOKUP = (() => {
  const map = new Map();
  for (const w of ALL_WORDS) {
    for (const variant of w.es.split('/')) {
      const key = stripAccents(stripArticle(normalizeAnswer(variant)));
      if (key && !map.has(key)) map.set(key, w.ru);
    }
  }
  return map;
})();
