// Ролевые диалоги: собеседник говорит реплику, пользователь выбирает уместный ответ.
// В options первый вариант — правильный; why — пояснение для неправильных вариантов.

const DIALOGUES = [
{
  id: 'cafeteria', icon: '☕', level: 'A1', title: 'En la cafetería', ru: 'В кафе', npc: 'Camarero', npcIcon: '🧑‍🍳',
  turns: [
    { npc: 'Buenos días. ¿Qué le pongo?', ru: 'Доброе утро. Что вам подать?',
      options: [
        { es: 'Un café con leche, por favor.', ru: 'Кофе с молоком, пожалуйста.' },
        { es: 'Me llamo Juan.', ru: 'Меня зовут Хуан.', why: 'Официант спрашивает о заказе, а не об имени.' },
        { es: 'Estoy en la cafetería.', ru: 'Я в кафе.', why: 'Это очевидно и не отвечает на вопрос.' },
      ] },
    { npc: '¿Algo para comer?', ru: 'Что-нибудь поесть?',
      options: [
        { es: 'Sí, un cruasán, por favor.', ru: 'Да, круассан, пожалуйста.' },
        { es: 'Sí, tengo veinte años.', ru: 'Да, мне двадцать лет.', why: '«Comer» — есть, а не возраст.' },
        { es: 'No, soy de Rusia.', ru: 'Нет, я из России.', why: 'Происхождение тут ни при чём.' },
      ] },
    { npc: '¿Para tomar aquí o para llevar?', ru: 'Здесь или с собой?',
      options: [
        { es: 'Para tomar aquí.', ru: 'Здесь.' },
        { es: 'Para mañana.', ru: 'На завтра.', why: '«Para llevar» — с собой, а не «на потом».' },
        { es: 'Por favor, gracias.', ru: 'Пожалуйста, спасибо.', why: 'Нужно выбрать один из вариантов.' },
      ] },
    { npc: 'Aquí tiene. ¿Algo más?', ru: 'Вот, пожалуйста. Что-нибудь ещё?',
      options: [
        { es: 'No, gracias. ¿Cuánto es?', ru: 'Нет, спасибо. Сколько с меня?' },
        { es: 'Sí, hasta luego.', ru: 'Да, до встречи.', why: '«Sí» означает, что вы хотите ещё что-то — а потом прощаетесь.' },
        { es: 'Es un café.', ru: 'Это кофе.', why: 'Официант спрашивает, нужно ли что-то ещё.' },
      ] },
    { npc: 'Son tres euros con veinte.', ru: 'Три евро двадцать.',
      options: [
        { es: 'Aquí tiene. ¡Gracias!', ru: 'Вот, держите. Спасибо!' },
        { es: 'Tengo tres hermanos.', ru: 'У меня три брата.', why: 'Речь о деньгах.' },
        { es: 'Muy bien, ¿y usted?', ru: 'Очень хорошо, а вы?', why: 'Так отвечают на «как дела?».' },
      ] },
  ],
},
{
  id: 'presentarse', icon: '🤝', level: 'A1', title: 'Conocer a alguien', ru: 'Знакомство', npc: 'Laura', npcIcon: '👩',
  turns: [
    { npc: '¡Hola! Soy Laura. ¿Y tú, cómo te llamas?', ru: 'Привет! Я Лаура. А тебя как зовут?',
      options: [
        { es: 'Me llamo Iván. Mucho gusto.', ru: 'Меня зовут Иван. Очень приятно.' },
        { es: 'Estoy bien, gracias.', ru: 'У меня всё хорошо, спасибо.', why: 'Это ответ на «как дела?».' },
        { es: 'Tengo un perro.', ru: 'У меня есть собака.', why: 'Лаура спросила имя.' },
      ] },
    { npc: 'Encantada. ¿De dónde eres?', ru: 'Очень приятно. Откуда ты?',
      options: [
        { es: 'Soy de Moscú, en Rusia.', ru: 'Я из Москвы, в России.' },
        { es: 'Estoy de Moscú.', ru: '(ошибка)', why: 'Происхождение выражают через «ser»: soy de…' },
        { es: 'Voy a Moscú.', ru: 'Я еду в Москву.', why: 'Это про направление, а не про происхождение.' },
      ] },
    { npc: '¡Qué interesante! ¿Y qué haces aquí en Barcelona?', ru: 'Как интересно! А что ты делаешь здесь, в Барселоне?',
      options: [
        { es: 'Estoy de vacaciones.', ru: 'Я в отпуске.' },
        { es: 'Hago calor.', ru: '(ошибка)', why: 'О погоде говорят «hace calor», и это не ответ.' },
        { es: 'Soy alto.', ru: 'Я высокий.', why: 'Вопрос был о цели приезда.' },
      ] },
    { npc: '¿Te gusta la ciudad?', ru: 'Тебе нравится город?',
      options: [
        { es: '¡Sí, me encanta! Es muy bonita.', ru: 'Да, я в восторге! Он очень красивый.' },
        { es: 'Sí, me gustan.', ru: '(ошибка)', why: '«La ciudad» — ед. число, нужно «me gusta».' },
        { es: 'Sí, yo gusto la ciudad.', ru: '(ошибка)', why: 'Gustar строится как «нравиться»: me gusta la ciudad.' },
      ] },
    { npc: 'Oye, ¿quieres tomar algo mañana?', ru: 'Слушай, хочешь завтра чего-нибудь выпить?',
      options: [
        { es: '¡Claro! ¿A qué hora?', ru: 'Конечно! Во сколько?' },
        { es: 'Ayer sí.', ru: 'Вчера — да.', why: 'Laura спрашивает о завтрашнем дне.' },
        { es: 'Tomo el autobús.', ru: 'Я сажусь на автобус.', why: '«Tomar algo» — выпить чего-нибудь, а не «взять транспорт».' },
      ] },
  ],
},
{
  id: 'hotel', icon: '🏨', level: 'A2', title: 'En el hotel', ru: 'В гостинице', npc: 'Recepcionista', npcIcon: '🛎️',
  turns: [
    { npc: 'Buenas tardes, bienvenido. ¿En qué puedo ayudarle?', ru: 'Добрый день, добро пожаловать. Чем могу помочь?',
      options: [
        { es: 'Tengo una reserva a nombre de Petrov.', ru: 'У меня бронь на имя Петров.' },
        { es: 'Puedo ayudarle yo.', ru: 'Я могу вам помочь.', why: 'Это администратор предлагает помощь вам.' },
        { es: 'Buenas noches, adiós.', ru: 'Доброй ночи, до свидания.', why: 'Вы только пришли.' },
      ] },
    { npc: 'Sí, aquí está. Una habitación doble para tres noches. ¿Me deja su pasaporte?', ru: 'Да, вот она. Двухместный номер на три ночи. Дадите паспорт?',
      options: [
        { es: 'Sí, claro. Aquí tiene.', ru: 'Да, конечно. Вот, пожалуйста.' },
        { es: 'No, tres noches no.', ru: 'Нет, не три ночи.', why: 'Бронь верная — вас просят паспорт.' },
        { es: 'Mi pasaporte es azul.', ru: 'Мой паспорт синий.', why: 'Нужно его отдать, а не описать.' },
      ] },
    { npc: 'Gracias. ¿Necesita algo más?', ru: 'Спасибо. Вам нужно что-то ещё?',
      options: [
        { es: '¿A qué hora es el desayuno?', ru: 'Во сколько завтрак?' },
        { es: 'Necesito un pasaporte.', ru: 'Мне нужен паспорт.', why: 'Паспорт у вас уже есть.' },
        { es: 'Sí, gracias, adiós.', ru: 'Да, спасибо, пока.', why: '«Sí» предполагает просьбу.' },
      ] },
    { npc: 'El desayuno es de siete a diez, en el comedor.', ru: 'Завтрак с семи до десяти, в столовой.',
      options: [
        { es: 'Perfecto. ¿Hay wifi en la habitación?', ru: 'Отлично. В номере есть вайфай?' },
        { es: 'Son las diez.', ru: 'Сейчас десять.', why: 'Вас не спрашивали о времени.' },
        { es: 'Como en el comedor ahora.', ru: 'Я ем в столовой сейчас.', why: 'Неуместно — вы только заселяетесь.' },
      ] },
    { npc: 'Sí, la contraseña está en la tarjeta. Su habitación es la 305, en el tercer piso.', ru: 'Да, пароль на карточке. Ваш номер — 305, на третьем этаже.',
      options: [
        { es: 'Muchas gracias. ¿Dónde está el ascensor?', ru: 'Большое спасибо. Где лифт?' },
        { es: 'Tengo tres pisos.', ru: 'У меня три квартиры.', why: '«Piso» здесь — этаж.' },
        { es: 'No me gusta el número.', ru: 'Мне не нравится номер.', why: 'Странная реакция — и бронь уже подтверждена.' },
      ] },
  ],
},
{
  id: 'direcciones', icon: '🧭', level: 'A2', title: 'Pedir direcciones', ru: 'Как пройти?', npc: 'Señor', npcIcon: '👴',
  turns: [
    { npc: '¿Sí? ¿Necesita algo?', ru: 'Да? Вам что-то нужно?',
      options: [
        { es: 'Perdone, ¿sabe dónde está el Museo del Prado?', ru: 'Простите, вы знаете, где музей Прадо?' },
        { es: '¿Conoce dónde está el museo?', ru: '(ошибка)', why: 'Для фактов используют «saber», а не «conocer».' },
        { es: 'Yo soy el museo.', ru: 'Я — музей.', why: 'Без комментариев 🙂' },
      ] },
    { npc: 'Sí, claro. Siga todo recto y gire a la izquierda en el semáforo.', ru: 'Да, конечно. Идите прямо и поверните налево на светофоре.',
      options: [
        { es: '¿Está lejos de aquí?', ru: 'Это далеко отсюда?' },
        { es: '¿A la derecha?', ru: 'Направо?', why: 'Он сказал «a la izquierda» — налево.' },
        { es: '¿Es un semáforo grande?', ru: 'Светофор большой?', why: 'Неважная деталь.' },
      ] },
    { npc: 'No, está a unos diez minutos andando.', ru: 'Нет, минут десять пешком.',
      options: [
        { es: 'Perfecto, voy andando entonces.', ru: 'Отлично, тогда пойду пешком.' },
        { es: '¿Diez horas?', ru: 'Десять часов?', why: 'Он сказал «minutos».' },
        { es: 'No tengo coche, ¿puede andar?', ru: 'У меня нет машины, можете идти?', why: 'Бессмыслица.' },
      ] },
    { npc: 'Pero hoy es lunes… creo que el museo cierra a las siete.', ru: 'Но сегодня понедельник… кажется, музей закрывается в семь.',
      options: [
        { es: 'Ah, entonces tengo tiempo. Son las cuatro.', ru: 'А, тогда я успеваю. Сейчас четыре.' },
        { es: 'Sí, hoy es martes.', ru: 'Да, сегодня вторник.', why: 'Он сказал, что сегодня понедельник.' },
        { es: 'El museo es cerrado.', ru: '(ошибка)', why: 'Состояние — «está cerrado», и это противоречит его словам.' },
      ] },
    { npc: '¡Que lo disfrute!', ru: 'Приятно провести время!',
      options: [
        { es: '¡Muchas gracias por su ayuda!', ru: 'Большое спасибо за помощь!' },
        { es: '¡De nada!', ru: 'Не за что!', why: '«De nada» отвечают на «gracias».' },
        { es: '¡Buen provecho!', ru: 'Приятного аппетита!', why: 'Так желают хорошо поесть.' },
      ] },
  ],
},
{
  id: 'medico', icon: '🩺', level: 'A2', title: 'En el médico', ru: 'У врача', npc: 'Doctora', npcIcon: '👩‍⚕️',
  turns: [
    { npc: 'Pase, siéntese. ¿Qué le pasa?', ru: 'Проходите, садитесь. Что с вами?',
      options: [
        { es: 'Me duele mucho la garganta.', ru: 'У меня сильно болит горло.' },
        { es: 'Me duelo la garganta.', ru: '(ошибка)', why: 'Doler как gustar: me duele la garganta.' },
        { es: 'Paso bien, gracias.', ru: '(ошибка)', why: '«¿Qué le pasa?» — «Что с вами случилось?»' },
      ] },
    { npc: '¿Desde cuándo?', ru: 'С каких пор?',
      options: [
        { es: 'Desde hace tres días.', ru: 'Уже три дня.' },
        { es: 'Hasta mañana.', ru: 'До завтра.', why: 'Спрашивают о начале, а не о конце.' },
        { es: 'Desde Madrid.', ru: 'Из Мадрида.', why: 'Вопрос о времени.' },
      ] },
    { npc: '¿Tiene fiebre?', ru: 'У вас есть температура?',
      options: [
        { es: 'Sí, un poco. Treinta y ocho grados.', ru: 'Да, немного. Тридцать восемь.' },
        { es: 'Sí, estoy fiebre.', ru: '(ошибка)', why: 'Правильно: tengo fiebre.' },
        { es: 'Hace calor hoy.', ru: 'Сегодня жарко.', why: 'Вопрос о вашей температуре тела.' },
      ] },
    { npc: 'Es un resfriado. Tome este jarabe tres veces al día. ¿Es alérgico a algún medicamento?', ru: 'Это простуда. Принимайте этот сироп три раза в день. У вас есть аллергия на лекарства?',
      options: [
        { es: 'No, no tengo alergias.', ru: 'Нет, у меня нет аллергий.' },
        { es: 'Sí, tres veces.', ru: 'Да, три раза.', why: 'Спрашивают об аллергии.' },
        { es: 'Soy un resfriado.', ru: 'Я — простуда.', why: '🙂 Скажите «tengo un resfriado».' },
      ] },
    { npc: 'Muy bien. Descanse y beba mucha agua. Si no mejora, vuelva el viernes.', ru: 'Хорошо. Отдыхайте и пейте много воды. Если не станет лучше, приходите в пятницу.',
      options: [
        { es: 'De acuerdo. Muchas gracias, doctora.', ru: 'Хорошо. Большое спасибо, доктор.' },
        { es: 'Vuelvo ahora.', ru: 'Я сейчас вернусь.', why: 'Нужно вернуться в пятницу, если не станет лучше.' },
        { es: 'Bebo mucha cerveza.', ru: 'Я пью много пива.', why: 'Врач советовала воду 😉' },
      ] },
  ],
},
{
  id: 'tienda', icon: '👗', level: 'A2', title: 'En la tienda de ropa', ru: 'В магазине одежды', npc: 'Dependienta', npcIcon: '🛍️',
  turns: [
    { npc: 'Hola, ¿te puedo ayudar?', ru: 'Привет, могу помочь?',
      options: [
        { es: 'Sí, busco unos vaqueros.', ru: 'Да, я ищу джинсы.' },
        { es: 'Sí, te ayudo.', ru: 'Да, я тебе помогу.', why: 'Наоборот: помощь предлагают вам.' },
        { es: 'Busco a unos vaqueros.', ru: '(ошибка)', why: 'Личное «a» ставится только перед людьми.' },
      ] },
    { npc: '¿Qué talla usas?', ru: 'Какой у тебя размер?',
      options: [
        { es: 'La cuarenta, creo.', ru: 'Сороковой, кажется.' },
        { es: 'Uso azul.', ru: 'Ношу синий.', why: 'Спросили размер, а не цвет.' },
        { es: 'Soy alto.', ru: 'Я высокий.', why: 'Нужен конкретный размер.' },
      ] },
    { npc: 'Aquí tienes. El probador está al fondo.', ru: 'Держи. Примерочная в глубине зала.',
      options: [
        { es: 'Gracias, voy a probármelos.', ru: 'Спасибо, пойду их примерю.' },
        { es: 'Gracias, voy a comprármelo.', ru: '(ошибка)', why: '«Vaqueros» — мн. число муж. рода: los.' },
        { es: '¿Dónde está la playa?', ru: 'Где пляж?', why: 'Не по теме.' },
      ] },
    { npc: '¿Qué tal te quedan?', ru: 'Как они на тебе сидят?',
      options: [
        { es: 'Me quedan un poco grandes. ¿Tienes una talla menos?', ru: 'Немного великоваты. Есть на размер меньше?' },
        { es: 'Me quedo aquí.', ru: 'Я остаюсь здесь.', why: '«Quedar bien/mal» — сидеть (об одежде).' },
        { es: 'Están en el probador.', ru: 'Они в примерочной.', why: 'Спрашивают, как сидят.' },
      ] },
    { npc: 'Sí, toma. Y hoy tienen un veinte por ciento de descuento.', ru: 'Да, держи. И сегодня на них скидка двадцать процентов.',
      options: [
        { es: '¡Genial! Me los llevo.', ru: 'Отлично! Беру.' },
        { es: '¡Qué caro!', ru: 'Как дорого!', why: 'Странно, когда вам только что сказали о скидке.' },
        { es: 'Me lo llevo.', ru: '(ошибка)', why: 'Вы берёте джинсы (los vaqueros): me los llevo.' },
      ] },
  ],
},
{
  id: 'restaurante', icon: '🍷', level: 'B1', title: 'Una queja en el restaurante', ru: 'Жалоба в ресторане', npc: 'Camarero', npcIcon: '🤵',
  turns: [
    { npc: '¿Qué tal todo? ¿Les gusta la comida?', ru: 'Как всё? Вам нравится еда?',
      options: [
        { es: 'Perdone, pero la carne está fría y la pedí muy hecha.', ru: 'Простите, но мясо холодное, а я заказывал хорошо прожаренное.' },
        { es: 'La carne es fría.', ru: '(ошибка)', why: 'Временное состояние — estar: está fría.' },
        { es: 'Sí, me gustan la comida.', ru: '(ошибка)', why: '«La comida» — ед. число: me gusta.' },
      ] },
    { npc: 'Lo siento muchísimo. ¿Quiere que se la cambie?', ru: 'Мне очень жаль. Хотите, чтобы я её заменил?',
      options: [
        { es: 'Sí, por favor. Le agradecería que fuera rápido.', ru: 'Да, пожалуйста. Буду благодарен, если это будет быстро.' },
        { es: 'Sí, quiero que la cambia.', ru: '(ошибка)', why: 'После «quiero que» нужен subjuntivo: la cambie.' },
        { es: 'No, gracias, está perfecta.', ru: 'Нет, спасибо, оно идеально.', why: 'Вы только что пожаловались.' },
      ] },
    { npc: 'Por supuesto. Mientras tanto, ¿les traigo algo de beber?', ru: 'Конечно. А пока принести вам что-нибудь выпить?',
      options: [
        { es: 'Sí, otra botella de agua, por favor.', ru: 'Да, ещё бутылку воды, пожалуйста.' },
        { es: 'Sí, una otra agua.', ru: '(ошибка)', why: '«Otro/otra» не употребляется с un/una.' },
        { es: 'Traigo yo.', ru: 'Принесу я.', why: 'Это работа официанта.' },
      ] },
    { npc: 'Aquí tiene su plato. De nuevo, disculpe las molestias.', ru: 'Вот ваше блюдо. Ещё раз простите за неудобства.',
      options: [
        { es: 'No pasa nada. Ahora está perfecto.', ru: 'Ничего страшного. Теперь всё идеально.' },
        { es: 'De nada.', ru: 'Не за что.', why: 'На извинение отвечают «no pasa nada» / «no se preocupe».' },
        { es: 'Me molesta.', ru: 'Меня это раздражает.', why: 'Слишком грубо, когда проблема уже решена.' },
      ] },
    { npc: 'El postre corre por cuenta de la casa.', ru: 'Десерт за счёт заведения.',
      options: [
        { es: '¡Qué amable! Muchas gracias.', ru: 'Как любезно! Большое спасибо.' },
        { es: '¿Dónde está la casa?', ru: 'Где дом?', why: '«Por cuenta de la casa» — за счёт заведения.' },
        { es: 'No corro, gracias.', ru: 'Я не бегаю, спасибо.', why: '«Correr por cuenta de» — оплачиваться кем-то.' },
      ] },
  ],
},
{
  id: 'piso', icon: '🔑', level: 'B1', title: 'Alquilar un piso', ru: 'Аренда квартиры', npc: 'Propietario', npcIcon: '🧔',
  turns: [
    { npc: 'Hola, ¿llama por el anuncio del piso?', ru: 'Здравствуйте, вы звоните по объявлению о квартире?',
      options: [
        { es: 'Sí. Me gustaría saber si todavía está disponible.', ru: 'Да. Хотел бы узнать, она ещё свободна?' },
        { es: 'Sí, me gustaría saber si todavía es disponible.', ru: '(ошибка)', why: 'Доступность — состояние: está disponible.' },
        { es: 'No, llamo por el piso.', ru: 'Нет, я звоню по поводу квартиры.', why: 'Противоречие.' },
      ] },
    { npc: 'Sí, todavía está libre. Son ochocientos euros al mes, gastos incluidos.', ru: 'Да, ещё свободна. Восемьсот евро в месяц, коммунальные включены.',
      options: [
        { es: '¿Cuántas habitaciones tiene?', ru: 'Сколько в ней комнат?' },
        { es: '¿Cuánto cuesta?', ru: 'Сколько стоит?', why: 'Цену вам только что назвали.' },
        { es: 'Tengo ochocientos euros.', ru: 'У меня есть восемьсот евро.', why: 'Звучит странно; лучше уточнить детали.' },
      ] },
    { npc: 'Dos habitaciones, un baño y una terraza con vistas al mar.', ru: 'Две комнаты, ванная и терраса с видом на море.',
      options: [
        { es: '¡Suena muy bien! ¿Cuándo podría verlo?', ru: 'Звучит отлично! Когда я мог бы её посмотреть?' },
        { es: '¿Cuándo podré verla?', ru: '(ошибка)', why: '«El piso» — мужского рода: verlo.' },
        { es: 'No me gusta el mar, me quedo.', ru: 'Я не люблю море, остаюсь.', why: 'Нелогично.' },
      ] },
    { npc: 'Si le viene bien, mañana a las seis.', ru: 'Если вам удобно, завтра в шесть.',
      options: [
        { es: 'Perfecto, allí estaré. ¿Me da la dirección?', ru: 'Отлично, буду. Дадите адрес?' },
        { es: 'Me viene mal ayer.', ru: 'Мне неудобно вчера.', why: '«Ayer» — вчера.' },
        { es: 'Allí seré.', ru: '(ошибка)', why: 'Местонахождение — estar: allí estaré.' },
      ] },
    { npc: 'Calle Mayor, número doce, tercero B. Cuando llegue, llámeme.', ru: 'Улица Майор, дом двенадцать, третий этаж, квартира Б. Когда приедете — позвоните.',
      options: [
        { es: 'De acuerdo. Hasta mañana, y gracias.', ru: 'Договорились. До завтра, спасибо.' },
        { es: 'Cuando llego, le llamo.', ru: '(ошибка)', why: 'Будущее после «cuando» — subjuntivo: cuando llegue.' },
        { es: 'Hasta ayer.', ru: 'До вчера.', why: 'Встреча завтра.' },
      ] },
  ],
},
];
