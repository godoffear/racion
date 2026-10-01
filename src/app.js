const APP_VERSION='4.8.1';
/* ===== Справочники ===== */
const DAYS=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const DAYS_FULL=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
const MONTHS=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const SLOTS={pre:'До тренировки',bf:'Завтрак',lunch:'Обед',snack:'Перекус',dinner:'Ужин',late:'Поздний перекус'};
const DTYPE={S:'силовая утром',W:'ходьба 45–60 мин',R:'день отдыха'};
const MEASURES={palm:['ладонь','ладони','ладоней','ладони'],cup:['чашка','чашки','чашек','чашки'],ccup:['чашка готового','чашки готового','чашек готового','чашки готового'],handful:['горсть','горсти','горстей','горсти'],scoop:['мерная ложка','мерные ложки','мерных ложек','мерной ложки'],tsp:['ч. л.','ч. л.','ч. л.','ч. л.']};
// k,p,f,c на 100 г; u — единица (г/шт); pg — вес штуки; m/mg — бытовая мера; shop — шаг округления при покупке; bulk — долгий запас
const PR={
 egg:{vi:'Trứng gà (куриные яйца)',sec:'egg',pk:'Коробка 10 шт',n:'Яйца',s:'яйца',u:'шт',pg:55,k:143,p:12.6,f:9.5,c:0.7,cat:'Белок',shop:10},
 chicken:{vi:'Ức gà phi lê (куриное филе, грудка)',sec:'meat',pk:'Лотки по 400–600 г (марки CP, 3F). Дома сразу подели на порции по 150–200 г (1½–2 ладони)',n:'Куриное филе',s:'курица',u:'г',m:'palm',mg:100,k:110,p:23,f:1.5,c:0,cat:'Белок',shop:100,how:'Курица: полосками на сковороду, средний огонь 8–10 мин. Соль, перец, куркума.'},
 thigh:{vi:'Đùi gà phi lê (филе бедра без кости)',sec:'meat',pk:'Лоток ~500 г',n:'Куриные бёдра без кости',s:'куриные бёдра',u:'г',m:'palm',mg:100,k:150,p:18,f:8.5,c:0,cat:'Белок',shop:100,how:'Бёдра: на сковороду без масла под крышку 12–15 мин, в конце 2 мин без крышки.'},
 fish:{vi:'Cá basa phi lê (филе пангасиуса) или cá rô phi phi lê (филе тилапии)',sec:'sea',pk:'Чаще замороженное, пакеты 500 г–1 кг',n:'Рыба, филе (тилапия, пангасиус)',s:'рыба',u:'г',m:'palm',mg:100,k:105,p:20,f:2.5,c:0,cat:'Белок',shop:100,how:'Рыба: по 3–4 мин с каждой стороны. Паприка, соль, лимон.'},
 shrimp:{vi:'Tôm thẻ bóc vỏ (очищенные креветки)',sec:'sea',pk:'Замороженные, пакеты 250–500 г',n:'Креветки очищенные',s:'креветки',u:'г',m:'palm',mg:100,k:85,p:20,f:0.5,c:0,cat:'Белок',shop:100,how:'Креветки: 3–4 мин на сильном огне с чесноком и чили.'},
 squid:{vi:'Mực ống (кальмар)',sec:'sea',pk:'На развес в рыбном отделе или замороженный в пакетах. Лучше брать уже почищенный',n:'Кальмар',s:'кальмар',u:'г',m:'palm',mg:100,k:92,p:16,f:1.4,c:3,cat:'Белок',shop:100,how:'Кальмар: кольцами 2 мин на сильном огне. Дольше — станет резиновым.'},
 pork:{vi:'Thăn heo (свиная вырезка)',sec:'meat',pk:'Лоток 300–500 г',n:'Свиная вырезка (thăn heo)',s:'свинина',u:'г',m:'palm',mg:100,k:120,p:21,f:3.5,c:0,cat:'Белок',shop:100,how:'Свинина: тонкими ломтиками 6–8 мин, перец и чеснок.'},
 tofu:{vi:'Đậu hũ trắng (белый тофу)',sec:'egg',pk:'Брусок 250–300 г, в холодильнике держи в воде',n:'Тофу',s:'тофу',u:'г',m:'palm',mg:100,k:100,p:10,f:6,c:2,cat:'Белок',shop:100,how:'Тофу: кубиками на сухую сковороду 5 мин, соль и перец. Можно и не жарить.'},
 sweet:{vi:'Khoai lang (батат)',sec:'veg',pk:'На развес, средний батат ≈ 200 г — взвешивай дома',n:'Батат (khoai lang)',s:'батат',u:'г',k:86,p:1.6,f:0.1,c:20,cat:'Овощи и фрукты',shop:100},
 veg:{vi:'Rau củ (овощи)',sec:'veg',n:'Овощи',s:'овощи',u:'г',m:'cup',mg:100,k:30,p:1.5,f:0.2,c:6,cat:'Овощи и фрукты',shop:500},
 banana:{vi:'Chuối (бананы)',sec:'fruit',pk:'Связка, бери немного зелёные',n:'Бананы',s:'банан',u:'шт',pg:120,k:89,p:1.1,f:0.3,c:23,cat:'Овощи и фрукты',shop:1},
 apple:{vi:'Táo (яблоки)',sec:'fruit',n:'Яблоки',s:'яблоко',u:'шт',pg:180,k:52,p:0.3,f:0.2,c:14,cat:'Овощи и фрукты',shop:1},
 cucumber:{vi:'Dưa leo (огурцы)',sec:'veg',n:'Огурцы',s:'огурец',u:'шт',pg:150,k:15,p:0.7,f:0.1,c:3.6,cat:'Овощи и фрукты',shop:1},
 tomato:{vi:'Cà chua (помидоры)',sec:'veg',pk:'На развес',n:'Помидоры',s:'помидоры',u:'г',k:18,p:0.9,f:0.2,c:3.9,cat:'Овощи и фрукты',shop:100},
 mushroom:{vi:'Nấm rơm / nấm bào ngư (грибы)',sec:'veg',pk:'Лоток 200–300 г',n:'Грибы',s:'грибы',u:'г',k:25,p:3,f:0.3,c:3.5,cat:'Овощи и фрукты',shop:100},
 ricenoodle:{vi:'Bánh phở khô (сухая рисовая лапша)',sec:'dry',pk:'Пачка 200–400 г',n:'Рисовая лапша сухая',s:'рисовая лапша',u:'г',k:360,p:6,f:0.6,c:80,cat:'Крупы',shop:100},
 // ---- 4.8.1: расширенный справочник; keep — долго хранится (консервы, сухое), остаток помнится между неделями
 beef:{vi:'Thịt bò nạc vai / đùi bò (говядина: лопатка или бедро)',sec:'meat',pk:'Лоток 300–500 г',n:'Говядина',s:'говядина',u:'г',m:'palm',mg:100,k:150,p:21,f:7,c:0,cat:'Белок',shop:100,how:'Говядина: тонкими ломтиками 2–3 мин на сильном огне, перец и чеснок.'},
 mince:{vi:'Thịt heo xay (свиной фарш)',sec:'meat',pk:'Лоток 300–500 г, бери нежирный (nạc)',n:'Свиной фарш',s:'свиной фарш',u:'г',m:'palm',mg:100,k:170,p:19,f:10,c:0,cat:'Белок',shop:100,how:'Фарш: 6–8 мин на сковороде, разбивая лопаткой. Соль, перец, чеснок.'},
 tunaw:{vi:'Cá ngừ ngâm nước (тунец в собственном соку)',sec:'can',pk:'Банка 150–185 г, без жидкости ≈ 130 г',n:'Тунец в собственном соку',s:'тунец в соку',u:'шт',pg:130,k:116,p:26,f:1,c:0,cat:'Белок',shop:1,keep:1,how:'Тунец: слить жидкость, размять вилкой — с овощами, лаймом и перцем. Готовить не нужно.'},
 tunao:{vi:'Cá ngừ ngâm dầu (тунец в масле)',sec:'can',pk:'Банка 150–185 г, масло слить — без него ≈ 130 г',n:'Тунец в масле',s:'тунец в масле',u:'шт',pg:130,k:190,p:26,f:9,c:0,cat:'Белок',shop:1,keep:1,how:'Тунец: масло слить, размять вилкой — с овощами и лаймом. Готовить не нужно.'},
 sardine:{vi:'Cá mòi sốt cà chua (сардины в томате)',sec:'can',pk:'Банка 155 г',n:'Сардины в томате',s:'сардины',u:'шт',pg:155,k:180,p:17,f:11,c:3,cat:'Белок',shop:1,keep:1,how:'Сардины: разогреть 2–3 мин на сковороде или есть холодными с овощами.'},
 yogurt:{vi:'Sữa chua không đường (йогурт без сахара)',sec:'milk',pk:'Стаканчики по 100 г, упаковка 4 шт',n:'Йогурт без сахара',s:'йогурт',u:'шт',pg:100,k:65,p:3.5,f:3.2,c:5,cat:'Молочное',shop:4},
 milk:{vi:'Sữa tươi không đường (молоко без сахара)',sec:'milk',pk:'Пакет 1 л',n:'Молоко без сахара',s:'молоко',u:'г',k:64,p:3.2,f:3.5,c:4.8,cat:'Молочное',shop:1000},
 potato:{vi:'Khoai tây (картофель)',sec:'veg',pk:'На развес',n:'Картофель',s:'картофель',u:'г',k:77,p:2,f:0.1,c:17,cat:'Овощи и фрукты',shop:100},
 pumpkin:{vi:'Bí đỏ (тыква)',sec:'veg',pk:'Кусками на развес',n:'Тыква',s:'тыква',u:'г',k:26,p:1,f:0.1,c:6.5,cat:'Овощи и фрукты',shop:100},
 corn:{vi:'Bắp ngọt (сладкая кукуруза, початок)',sec:'veg',pk:'Початки поштучно',n:'Кукуруза, початок',s:'кукуруза',u:'шт',pg:150,k:86,p:3.3,f:1.4,c:19,cat:'Овощи и фрукты',shop:1},
 corncan:{vi:'Bắp hạt đóng hộp (кукуруза консервированная)',sec:'can',pk:'Банка ≈ 400 г, без жидкости ≈ 250 г',n:'Кукуруза консервированная',s:'кукуруза из банки',u:'г',k:80,p:2.5,f:1,c:16,cat:'Крупы',shop:250,keep:1},
 glassnoodle:{vi:'Miến dong (стеклянная лапша, сухая)',sec:'dry',pk:'Пачка 200–500 г',n:'Стеклянная лапша сухая',s:'стеклянная лапша',u:'г',k:350,p:0.2,f:0,c:86,cat:'Крупы',shop:100,keep:1},
 eggnoodle:{vi:'Mì trứng khô (яичная лапша, сухая)',sec:'dry',pk:'Пачка 400–500 г',n:'Яичная лапша сухая',s:'яичная лапша',u:'г',k:380,p:13,f:3,c:75,cat:'Крупы',shop:100,keep:1},
 bread:{vi:'Bánh mì (вьетнамский багет)',sec:'bak',pk:'Поштучно в пекарне GO!',n:'Багет',s:'багет',u:'шт',pg:80,k:270,p:9,f:3,c:52,cat:'Крупы',shop:1},
 broccoli:{vi:'Bông cải xanh (брокколи)',sec:'veg',n:'Брокколи',s:'брокколи',u:'г',k:34,p:2.8,f:0.4,c:7,cat:'Овощи и фрукты',shop:100},
 cabbage:{vi:'Bắp cải (капуста)',sec:'veg',n:'Капуста',s:'капуста',u:'г',k:25,p:1.3,f:0.1,c:6,cat:'Овощи и фрукты',shop:100},
 carrot:{vi:'Cà rốt (морковь)',sec:'veg',n:'Морковь',s:'морковь',u:'г',k:41,p:0.9,f:0.2,c:10,cat:'Овощи и фрукты',shop:100},
 greens:{vi:'Rau muống (водяной шпинат)',sec:'veg',n:'Водяной шпинат',s:'водяной шпинат',u:'г',k:19,p:2.6,f:0.2,c:3,cat:'Овощи и фрукты',shop:100},
 beans:{vi:'Đậu que (стручковая фасоль)',sec:'veg',n:'Стручковая фасоль',s:'фасоль',u:'г',k:31,p:1.8,f:0.2,c:7,cat:'Овощи и фрукты',shop:100},
 bokchoy:{vi:'Cải thìa (бок-чой)',sec:'veg',n:'Бок-чой',s:'бок-чой',u:'г',k:13,p:1.5,f:0.2,c:2.2,cat:'Овощи и фрукты',shop:100},
 onion:{vi:'Hành tây (лук репчатый)',sec:'veg',n:'Лук репчатый',s:'лук',u:'г',k:40,p:1.1,f:0.1,c:9,cat:'Овощи и фрукты',shop:100},
 bellpep:{vi:'Ớt chuông (болгарский перец)',sec:'veg',n:'Болгарский перец',s:'болгарский перец',u:'г',k:26,p:1,f:0.3,c:6,cat:'Овощи и фрукты',shop:100},
 mango:{vi:'Xoài (манго)',sec:'fruit',pk:'Поштучно, мякоть ≈ 200 г',n:'Манго',s:'манго',u:'шт',pg:200,k:60,p:0.8,f:0.4,c:15,cat:'Овощи и фрукты',shop:1},
 papaya:{vi:'Đu đủ (папайя)',sec:'fruit',n:'Папайя',s:'папайя',u:'г',k:43,p:0.5,f:0.3,c:11,cat:'Овощи и фрукты',shop:100},
 pineapple:{vi:'Thơm / dứa (ананас)',sec:'fruit',pk:'Можно уже очищенный в лотке',n:'Ананас',s:'ананас',u:'г',k:50,p:0.5,f:0.1,c:13,cat:'Овощи и фрукты',shop:100},
 dragon:{vi:'Thanh long (драконий фрукт)',sec:'fruit',n:'Драконий фрукт',s:'драконий фрукт',u:'г',k:50,p:1.1,f:0.4,c:11,cat:'Овощи и фрукты',shop:100},
 watermelon:{vi:'Dưa hấu (арбуз)',sec:'fruit',n:'Арбуз',s:'арбуз',u:'г',k:30,p:0.6,f:0.2,c:7.6,cat:'Овощи и фрукты',shop:100},
 orange:{vi:'Cam (апельсины)',sec:'fruit',n:'Апельсины',s:'апельсин',u:'шт',pg:180,k:47,p:0.9,f:0.1,c:12,cat:'Овощи и фрукты',shop:1},
 pbutter:{vi:'Bơ đậu phộng không đường (арахисовая паста без сахара)',sec:'dry',pk:'Банка ≈ 340 г',n:'Арахисовая паста без сахара',s:'арахисовая паста',u:'г',k:590,p:25,f:50,c:20,cat:'Прочее',shop:340,keep:1},
 creatine:{vi:'Creatine monohydrate (креатин моногидрат) — в магазине спортпита',n:'Креатин моногидрат',s:'креатин',u:'г',k:0,p:0,f:0,c:0,bulk:'банка 300–500 г'},
 protein:{vi:'Whey protein (сывороточный протеин)',pk:'В GO! обычно нет, бери в магазине спортпита',n:'Протеин',s:'протеин',u:'г',m:'scoop',mg:30,k:390,p:78,f:6,c:8,bulk:'банка 900 г'},
 rice:{vi:'Gạo (рис)',n:'Рис',s:'рис',u:'г',m:'ccup',mg:60,k:350,p:7,f:0.7,c:77,bulk:'мешок 5 кг'},
 oats:{vi:'Yến mạch (овсянка)',n:'Овсянка',s:'овсянка',u:'г',m:'cup',mg:80,k:366,p:12.5,f:6.2,c:60,bulk:'пачка 500 г'},
 nuts:{vi:'Hạt điều (кешью) или đậu phộng rang (жареный арахис), không muối (без соли)',n:'Орехи',s:'орехи',u:'г',m:'handful',mg:20,k:600,p:18,f:53,c:16,bulk:'пачка 200–300 г'},
 oil:{vi:'Dầu ô liu (оливковое масло)',n:'Масло оливковое',s:'масло',u:'г',m:'tsp',mg:5,k:884,p:0,f:100,c:0,bulk:'бутылка 500 мл'},
 oilveg:{vi:'Dầu ăn / dầu đậu nành (растительное масло)',n:'Масло растительное (для жарки)',bulk:'бутылка 1 л'},
 salt:{vi:'Muối (соль)',n:'Соль',bulk:'пачка'},
 spice:{vi:'Tiêu (перец), ớt bột (молотый чили), bột nghệ (куркума)',n:'Специи: перец, паприка, куркума, чили',bulk:'по пакетику'},
 garlic:{vi:'Tỏi (чеснок), chanh (лайм)',n:'Чеснок и лимоны',bulk:'на неделю'}
};
const SECS=[['veg','Овощи (rau củ)'],['fruit','Фрукты (trái cây)'],['meat','Мясо (thịt)'],['sea','Рыба и морепродукты (hải sản)'],['egg','Яйца и тофу'],['milk','Молочное (sữa)'],['can','Консервы (đồ hộp)'],['dry','Лапша и сухое (đồ khô)'],['bak','Хлеб (bánh mì)']];
// примерные цены GO! Nha Trang, ₫: [цена, за сколько единиц (г или шт)]; для запасов — [цена упаковки]. Андрей правит по чеку → S.price
// часть цен — с sieuthi-go.vn (курица, яйца, креветки, свинина, говядина, рис ST25, тофу, соевое масло), остальное оценка
const PRICES={egg:[27000,10],chicken:[87000,1000],thigh:[95000,1000],fish:[90000,1000],shrimp:[170000,1000],squid:[160000,1000],pork:[133000,1000],tofu:[33000,1000],
 sweet:[30000,1000],veg:[35000,1000],banana:[3500,1],apple:[12000,1],cucumber:[4000,1],tomato:[30000,1000],mushroom:[90000,1000],ricenoodle:[60000,1000],
 beef:[330000,1000],mince:[120000,1000],tunaw:[35000,1],tunao:[38000,1],sardine:[25000,1],yogurt:[7000,1],milk:[32000,1000],potato:[30000,1000],pumpkin:[25000,1000],
 corn:[8000,1],corncan:[25000,250],glassnoodle:[80000,1000],eggnoodle:[70000,1000],bread:[5000,1],broccoli:[60000,1000],cabbage:[20000,1000],carrot:[25000,1000],
 greens:[30000,1000],beans:[40000,1000],bokchoy:[35000,1000],onion:[30000,1000],bellpep:[70000,1000],mango:[20000,1],papaya:[25000,1000],pineapple:[25000,1000],
 dragon:[35000,1000],watermelon:[18000,1000],orange:[7000,1],pbutter:[90000,340],
 rice:[189000],oats:[65000],nuts:[120000],oil:[160000],oilveg:[43000],salt:[6000],spice:[30000],garlic:[25000],protein:[1200000],creatine:[450000]};
const SPORT=['protein','creatine']; // покупаются не в GO!
const VEGMIX=[['Rau muống','водяной шпинат'],['Bắp cải','капуста'],['Bông cải xanh','брокколи'],['Đậu que','стручковая фасоль'],['Cà rốt','морковь']];
const BULK=['rice','oats','protein','creatine','nuts','oil','oilveg','salt','spice','garlic'];
// 4 недельных меню, дни со вторника по понедельник
const WEEKS=__WEEKS__;
const TIMES={pre:'09:30',bf_S:'11:30',bf_W:'10:00',bf_R:'10:00',lunch:'16:00',snack:'19:30',dinner:'22:30',late:'00:30'};
const NORM={k:[1900,2000],p:[160,180],f:[55,65],c:[120,150]};
const LEGACY=[["S",[["pre",[["protein",30],["creatine",5]]],["bf",[["egg",4],["oats",40],["banana",1]]],["lunch",[["thigh",200],["rice",40],["veg",200]]],["snack",[["protein",30],["cucumber",1],["apple",1]]],["dinner",[["shrimp",200],["veg",200],["oil",5]]],["late",[["egg",3]]]]],["W",[["bf",[["egg",4],["oats",60],["apple",1],["creatine",5]]],["lunch",[["chicken",200],["rice",40],["veg",200]]],["snack",[["protein",30],["banana",1],["nuts",20]]],["dinner",[["fish",200],["veg",200],["oil",5]]],["late",[["tofu",200]]]]],["S",[["pre",[["protein",30],["creatine",5]]],["bf",[["egg",4],["oats",40],["banana",1]]],["lunch",[["chicken",200],["rice",40],["veg",200]]],["snack",[["protein",30],["apple",1],["nuts",20]]],["dinner",[["squid",200],["veg",200],["oil",5]]],["late",[["egg",3]]]]],["S",[["pre",[["protein",30],["creatine",5]]],["bf",[["egg",4],["oats",40],["banana",1]]],["lunch",[["fish",200],["rice",40],["veg",200]]],["snack",[["protein",30],["apple",1],["nuts",20]]],["dinner",[["chicken",200],["veg",200],["oil",5]]],["late",[["tofu",150]]]]],["W",[["bf",[["egg",4],["oats",60],["apple",1],["creatine",5]]],["lunch",[["shrimp",200],["rice",40],["veg",200]]],["snack",[["protein",30],["cucumber",1],["banana",1],["nuts",20]]],["dinner",[["fish",200],["veg",200],["oil",5]]],["late",[["egg",3]]]]],["R",[["bf",[["egg",4],["oats",60],["banana",1],["creatine",5]]],["lunch",[["chicken",200],["rice",40],["veg",200]]],["snack",[["protein",30],["apple",1],["nuts",20]]],["dinner",[["fish",200],["veg",200],["oil",5]]],["late",[["tofu",200]]]]],["S",[["pre",[["protein",30],["creatine",5]]],["bf",[["egg",4],["oats",40],["banana",1]]],["lunch",[["chicken",200],["rice",40],["veg",200]]],["snack",[["protein",30],["apple",1],["nuts",20]]],["dinner",[["fish",200],["veg",200],["oil",5]]],["late",[["tofu",150]]]]]]; // базовое меню, по которому была закупка до 6 окт
// разовые замены приёмов по датам: {дата:{приём:[[продукт,кол-во],...]}}
const OVERRIDES={
 '2026-09-30':{dinner:[['squid',200],['veg',200],['oil',5]]},
 '2026-10-01':{dinner:[['fish',200],['veg',200],['oil',5]]}
};
const SWAPP=['chicken','thigh','fish','shrimp','squid','pork','beef','mince','tunaw','tunao','sardine','tofu'];
// Блюда из разных продуктов: [id, название, приёмы, продукты, шаги]
const RECIPES=[
 ['friedrice','Жареный рис с курицей и яйцом',['lunch'],[['chicken',120],['egg',1],['rice',40],['veg',150],['oil',5]],['Рис лучше вчерашний, из холодильника','Курицу кубиками 5 мин на сковороде','Сдвинуть, вбить яйцо, перемешать','Добавить рис и овощи, 3–4 мин на сильном огне, соль, перец']],
 ['shrimprice','Жареный рис с креветками',['lunch'],[['shrimp',150],['egg',1],['rice',40],['veg',150],['oil',5]],['Креветки 2 мин на сковороде, отложить','Яйцо на сковороду, перемешать','Рис и овощи 3–4 мин, вернуть креветки, лайм']],
 ['pho','Домашний фо с курицей',['lunch'],[['chicken',150],['ricenoodle',50],['veg',150]],['Курицу в кипящую воду 15 мин, вынуть и нарезать','В бульон соль, перец, имбирь или лук','Лапшу залить кипятком на 5 мин','Собрать в миске: лапша, курица, овощи, горячий бульон, лайм и чили']],
 ['curry','Курица с бататом, тушёная с куркумой',['lunch'],[['chicken',150],['sweet',200],['veg',150],['oil',5]],['Курицу кубиками обжарить 3 мин','Батат кубиками, ½ стакана воды, куркума, перец','Под крышкой 15 мин, в конце овощи на 3 мин']],
 ['porkstir','Свинина с овощами и рисом',['lunch'],[['pork',150],['rice',40],['veg',200],['oil',5]],['Свинину тонкими полосками 5 мин на сильном огне','Овощи туда же на 3–4 мин, чеснок, перец','С рисом из рисоварки']],
 ['tofutom','Тофу в помидорах с яйцом и рисом',['lunch'],[['tofu',200],['tomato',150],['egg',2],['rice',30]],['Помидоры кубиками 3 мин на сковороде без масла','Тофу кубиками туда же, 5 мин','Влить взбитые яйца, помешать 1 мин','С рисом']],
 ['canhchua','Кислый суп с рыбой (canh chua)',['lunch','dinner'],[['fish',200],['tomato',100],['veg',150]],['Помидоры и овощи в кипящую воду на 5 мин','Рыбу кусками на 5 мин','Соль, лайм, чили. Сахар не добавлять']],
 ['omelet','Омлет с курицей и овощами',['dinner'],[['egg',2],['chicken',100],['veg',200]],['Курицу мелко и обжарить 5 мин без масла','Овощи на 3 мин','Залить взбитыми яйцами, под крышкой 4 мин']],
 ['squidsalad','Тёплый салат с кальмаром',['dinner'],[['squid',200],['cucumber',1],['tomato',100],['oil',5]],['Кальмар кольцами в кипяток на 1 мин','Огурец и помидоры нарезать','Смешать, масло, лайм, соль, чили']],
 ['shrimpsoup','Суп с креветками, тофу и грибами',['dinner'],[['shrimp',150],['tofu',100],['veg',150],['mushroom',100]],['Грибы и овощи в кипящую воду на 5 мин','Тофу кубиками и креветки на 2–3 мин','Соль, перец, лайм']],
 ['chickmush','Курица с грибами',['dinner'],[['chicken',200],['mushroom',150],['veg',100],['oil',5]],['Курицу полосками 6 мин на сковороде','Грибы и овощи туда же на 5 мин','Соль, перец, чеснок']],
 ['fishtom','Рыба в помидорах',['dinner'],[['fish',200],['tomato',200],['veg',100],['oil',5]],['Помидоры кубиками 3 мин на сковороде','Рыбу сверху, под крышку на 8 мин','Овощи сбоку на пару минут, перец, лайм']],
 ['eggcuke','Яйца с огурцом и помидором',['late'],[['egg',3],['cucumber',1],['tomato',100]],['Яйца из запаса, овощи нарезать, соль и перец']],
 ['tofuveg','Тофу с овощами',['late'],[['tofu',150],['veg',100]],['Тофу и овощи на сухую сковороду на 5 мин']]];
const RECBY=Object.fromEntries(RECIPES.map(r=>[r[0],r]));
// Способы приготовления основного белка: [id, название, текст]
const METHODS={
 chicken:[['pan','Сковорода',''],['steam','На пару','Курица на пару: кусочками на решётку рисоварки, 20–25 мин. Соль, перец, куркума'],['stew','Тушёная','Курица тушёная: обжарить 3 мин, овощи и ½ стакана воды, под крышкой 12–15 мин'],['boil','Варёная, суп','Курица варёная: в кипящую воду 15 мин, бульон с овощами — суп']],
 thigh:[['pan','Сковорода',''],['stew','Тушёная','Бёдра тушёные с овощами: под крышкой 20 мин, ½ стакана воды'],['steam','На пару','Бёдра на пару: решётка рисоварки, 30 мин']],
 fish:[['pan','Сковорода',''],['steam','На пару','Рыба на пару: решётка рисоварки 10–12 мин, лимон и имбирь'],['soup','Суп','Рыбный суп: овощи 5 мин в кипятке, рыбу кусками на 5 мин, лайм']],
 shrimp:[['pan','Сковорода',''],['boil','Отварные','Креветки отварить 2–3 мин, лайм, перец'],['soup','Суп','Суп: овощи 5 мин в кипятке, креветки на 2 мин, лайм и чили']],
 squid:[['pan','Сковорода',''],['boil','Отварной, салат','Кальмар в кипяток на 1 мин, нарезать в салат с огурцом и лаймом']],
 pork:[['pan','Сковорода',''],['stew','Тушёная','Свинина тушёная с овощами: под крышкой 15 мин']],
 tofu:[['pan','Обжарить',''],['cold','Без жарки','Тофу кубиками, соль, перец, чили — без жарки'],['soup','В суп','Тофу в суп с овощами на 3 мин']]};
const PRESETS=[['Чипсы, пачка 50 г','Snack khoai tây',270,3,17,26],['Печенье, 3 шт','Bánh quy',160,2,7,24],['Мороженое, рожок','Kem ốc quế',250,4,12,30],['Шоколадный батончик','Thanh socola',230,3,11,30],['Кофе со сгущёнкой и льдом','Cà phê sữa đá',150,2,4,26],['Чёрный кофе','Cà phê đen',5,0,0,1],['Кокосовая вода','Nước dừa',60,1,0,14],['Фруктовый смузи','Sinh tố',220,3,5,40],['Молочный чай с тапиокой','Trà sữa',350,3,8,65],['Сок сахарного тростника','Nước mía',180,0,0,45],['Багет с мясом','Bánh mì thịt',450,18,16,55],['Суп фо с говядиной','Phở bò',450,25,10,60],['Суп фо с курицей','Phở gà',400,24,8,58],['Свинина на гриле с лапшой','Bún chả',550,25,20,65],['Острый суп с говядиной','Bún bò Huế',500,28,14,60],['Рис со свининой на гриле','Cơm tấm',650,28,22,80],['Рис с курицей','Cơm gà',600,30,18,75],['Столовая: рис и 2–3 добавки','Cơm bình dân',650,25,22,85],['Свежие роллы с креветкой, 2 шт','Gỏi cuốn',180,10,3,28],['Жареные спринг-роллы, 3 шт','Chả giò',300,9,18,26],['Клейкий рис с добавками','Xôi',400,8,8,72],['Варёное яйцо, 1 шт','Trứng luộc',78,6,5,0],['Пиво, банка 330 мл','Bia',145,1,0,12],['Кола, банка 330 мл','Coca',140,0,0,35]];
// замена белка: при разных единицах (граммы ↔ банки) пересчёт по белку, иначе количество то же
function swapQ(from,q,to){const a=PR[from],b=PR[to];if(!a||!b||a.u===b.u)return q;const pr=a.p*(a.u==='шт'?q*a.pg:q)/100;
  return b.u==="шт"?Math.max(1,Math.round(pr/(b.p*b.pg/100)+0.2)):Math.max(10,Math.round(pr/b.p*100/10)*10)}
const EPOCH=new Date(2026,9,6); // вторник, 6 окт 2026 — меню 1

/* ===== Состояние ===== */
const LS='racion-v3';
function def(){return {rec:{},meth:{},dswap:{},wmenu:{},reviewed:{},v:3,done:{},skip:{},edits:{},w:[],left:{},bulk:{},chk:{},swaps:{},extra:{},excl:{},wswaps:{},treatBuy:{},grams:true,gv:2,cooked:false,stock:{},sv:0,pantry:{},price:{}}}
let S;try{S=Object.assign(def(),JSON.parse(localStorage.getItem(LS)||'null')||{})}catch(e){S=def()}
if(S.gv!==2){S.grams=true;S.gv=2}
// 4.8: отметки запасов больше не сбрасываются каждую неделю — переносим «Купить» из S.bulk
if(S.sv!==1){Object.values(S.bulk||{}).forEach(B=>Object.keys(B||{}).forEach(id=>{S.stock[id]=1}));S.sv=1}
function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){toast('Не удалось сохранить')}}

/* ===== Даты ===== */
const pad=n=>String(n).padStart(2,'0');
function appNow(){const d=new Date();if(d.getHours()<4)d.setDate(d.getDate()-1);return d}
function dkey(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function pkey(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)}
function wd(d){return (d.getDay()+6)%7}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)}
function fmtDate(d){return d.getDate()+' '+MONTHS[d.getMonth()]}
function tmin(t){const [h,m]=t.split(':').map(Number);return (h<4?h+24:h)*60+m}
function nowMin(){const d=new Date();return (d.getHours()<4?d.getHours()+24:d.getHours())*60+d.getMinutes()}
function cycleStart(d){return addDays(d,-((wd(d)-1+7)%7))} // ближайший вторник назад
function menuName(cs){const i=menuIdxOf(cs);return i<0?'базовое меню':'меню '+(i+1)+' из 4'}
function cycleIdx(cs){const n=Math.round((cs-EPOCH)/864e5/7);return ((n%4)+4)%4}
function rawDay(date){const cs=cycleStart(date),ck=dkey(cs),di=Math.round((date-cs)/864e5),wm=(S.wmenu||{})[ck];
  return (wm!=null?WEEKS[wm]:cs<EPOCH?LEGACY:WEEKS[cycleIdx(cs)])[di]}
function menuIdxOf(cs){const wm=(S.wmenu||{})[dkey(cs)];return wm!=null?wm:cs<EPOCH?-1:cycleIdx(cs)}
function dayPlan(date){
  const cs=cycleStart(date),raw=rawDay(date),type=raw[0];
  const ov=OVERRIDES[dkey(date)]||{},dk=dkey(date),ww=(S.wswaps||{})[dkey(cs)]||{};
  return {type,meals:raw[1].map(([slot,items])=>{const k=dk+'|'+slot,sw=(S.swaps||{})[k],ds=(S.dswap||{})[k];
    let src=ov[slot]||items;if(ds){const r2=rawDay(pkey(ds)),m2=r2&&r2[1].find(x=>x[0]===slot);if(m2)src=(OVERRIDES[ds]||{})[slot]||m2[1]}
    let its=src.filter(([p,q])=>q>0).map(([p,q])=>({p,q}));
    let wsw=null;
    its=its.map(i=>{const to=ww[i.p];if(to){wsw={from:i.p,to};return {p:to,q:swapQ(i.p,i.q,to)}}return i});
    if(sw&&its.some(i=>i.p===sw.from))its=its.map(i=>i.p===sw.from?{p:sw.to,q:swapQ(i.p,i.q,sw.to)}:i);
    const rc=(S.rec||{})[k];if(rc&&RECBY[rc])its=RECBY[rc][3].map(([p,q])=>({p,q}));
    const ed=(S.edits||{})[k];if(ed)its=ed.map(([p,q])=>({p,q}));
    return {slot,time:slot==='bf'?TIMES['bf_'+type]:TIMES[slot],items:its,swap:sw&&its.some(i=>i.p===sw.to)?sw:null,wswap:wsw,edited:!!ed,rec:rc&&RECBY[rc]?rc:null,meth:(S.meth||{})[k]||null,dswap:ds||null}})};
}
function mealAt(date,m){const t=tmin(m.time);return new Date(date.getFullYear(),date.getMonth(),date.getDate(),Math.floor(t/60),t%60)}

/* ===== КБЖУ и меры ===== */
function grams(i){const p=PR[i.p];return p.u==='шт'?i.q*p.pg:i.q}
function macros(items){const t={k:0,p:0,f:0,c:0};items.forEach(i=>{const p=PR[i.p],r=grams(i)/100;t.k+=p.k*r;t.p+=p.p*r;t.f+=p.f*r;t.c+=p.c*r});return t}
const r0=Math.round;
const FR=[[0,''],[0.25,'¼'],[1/3,'⅓'],[0.5,'½'],[2/3,'⅔'],[0.75,'¾'],[1,'']];
function niceNum(x){let w=Math.floor(x+1e-9),r=x-w,best=FR[0],bd=9;FR.forEach(f=>{const d=Math.abs(r-f[0]);if(d<bd){bd=d;best=f}});
  if(bd>0.06)return {s:String(Math.round(x*10)/10).replace('.',','),int:false,n:x};
  if(best[0]===1){w++;best=FR[0]}
  if(!best[1])return {s:String(w),int:true,n:w};
  return {s:(w?w:'')+best[1],int:false,n:x}}
function plural(n,f){const a=n%10,b=n%100;if(a===1&&b!==11)return f[0];if(a>=2&&a<=4&&(b<10||b>=20))return f[1];return f[2]}
function fmtMeasure(units,key){const f=MEASURES[key],nn=niceNum(units);return nn.s+' '+(nn.int?plural(nn.n,f):f[3])}
function fq(q,u){const v=Math.round(q*10)/10;return (u==='г'&&v>=1000?String(Math.round(v/100)/10)+' кг':v+' '+u).replace('.',',')}
function qtyText(i){const p=PR[i.p];if(S.grams||!p.m){if(i.p==='rice')return i.q+' г сухого';return fq(i.q,p.u)}return fmtMeasure(i.q/p.mg,p.m)}
function cap(t){return t.charAt(0).toUpperCase()+t.slice(1)}
// примерный вес в готовом виде: рис, лапша и овсянка набирают воду, мясо и рыба при жарке теряют
const COOKED={rice:2.8,ricenoodle:2.5,oats:2.5,chicken:.75,thigh:.7,pork:.75,fish:.8,shrimp:.8,squid:.7,tofu:.9};
function cookedTxt(i){const f=S.cooked&&S.grams&&COOKED[i.p];return f?` <small class="ckd">(≈ ${Math.round(i.q*f/5)*5} г)</small>`:''}
function itemsList(items){return `<ul class="il">${items.map(i=>`<li><span>${esc(cap(PR[i.p].s))}</span><b>${esc(qtyText(i))}${cookedTxt(i)}</b></li>`).join('')}</ul>`}
function itemsText(items){return items.map(i=>PR[i.p].s+' '+qtyText(i)).join(', ')}
function chips(m){return `<div class="chips"><span>${r0(m.k)} ккал</span><span class="p">Б ${r0(m.p)}</span><span class="f">Ж ${r0(m.f)}</span><span class="c">У ${r0(m.c)}</span></div>`}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ===== Подсказки по готовке ===== */
function howTo(m){
  if(m.rec)return RECBY[m.rec][4].slice();
  const has=id=>m.items.some(i=>i.p===id),main=m.items.find(i=>PR[i.p].how);
  const mt=main&&m.meth&&(METHODS[main.p]||[]).find(x=>x[0]===m.meth&&x[2]);
  if(m.slot==='pre')return m.items.some(i=>i.p==='creatine')?['Протеин и 5 г креатина в шейкере на воде','Креатин без вкуса — размешать до растворения']:['Протеин в шейкере на воде'];
  if(m.slot==='bf')return ['Яйца варёные из запаса','Овсянку залить кипятком на 5 мин'].concat(m.items.some(i=>i.p==='creatine')?['Креатин 5 г размешать в стакане воды и выпить за завтраком']:[]);
  if(m.slot==='snack')return ['Протеин на воде, фрукт и орехи — готовить ничего не нужно'];
  if(m.slot==='late')return has('egg')?['Яйца варёные из запаса']:main?[mt?mt[2]:PR[main.p].how]:[];
  const a=[];if(main)a.push(mt?mt[2]:PR[main.p].how);
  if(has('rice')){const r=m.items.find(x=>x.p==='rice').q;a.push(S.grams?'Рис из рисоварки: '+r+' г сухого ≈ '+Math.round(r*2.8/10)*10+' г варёного':'Рис из рисоварки')}
  if(has('sweet'))a.push('Батат: 20–25 мин на пару в рисоварке или в кастрюле');
  if(has('veg'))a.push(m.slot==='dinner'?'Овощи на ту же сковороду на 4–5 мин'+(has('oil')?', масло в конце':', без масла'):'Овощи: на пару в рисоварке или 4–5 мин на сковороде');
  return a;
}
function stepsList(m){const a=howTo(m);return a.length?`<ul class="steps">${a.map(t=>`<li>${esc(t.replace(/\.$/,''))}</li>`).join('')}</ul>`:''}
const nameOf=p=>p.n.replace(/\s*\(.*\)$/,'');
// заготовки: рис на 2 дня (Вт, Чт, Сб, Пн), яйца на 3–4 дня (Вт, Пт)
function prepFor(date){
  const cs=cycleStart(date),di=Math.round((date-cs)/864e5),out=[];
  const sum=(from,to,id)=>{let t=0;for(let i=from;i<=to&&i<7;i++)dayPlan(addDays(cs,i)).meals.forEach(m=>m.items.forEach(x=>{if(x.p===id)t+=x.q}));return t};
  if(di%2===0){const a=sum(di,di,'rice'),b=di<6?sum(di+1,di+1,'rice'):0,r=a+b;if(r)out.push(`Сварить рис: ${r0(r)} г сухого (≈ ${niceNum(r/150).s} мерки рисоварки) — ${a&&b?'на сегодня и завтра':a?'на сегодня':'на завтра'}. Храни в холодильнике.`)}
  if(di===0||di===3){const e=sum(di,di===0?2:6,'egg');if(e)out.push(`Сварить яйца: ${e} шт на ${di===0?'Вт–Чт':'Пт–Пн'}. В кипящую воду на 9–10 мин, потом в холодную.`)}
  return out;
}
function thawFor(date){
  const tm=addDays(date,1),twd=wd(tm);if(twd===1||twd===2)return []; // Вт и Ср — свежее с закупки
  const out=[];dayPlan(tm).meals.forEach(m=>{if(m.slot!=='lunch'&&m.slot!=='dinner')return;m.items.forEach(i=>{if(PR[i.p].how&&i.p!=='tofu'&&!PR[i.p].keep)out.push({name:PR[i.p].s,q:qtyText(i),slot:SLOTS[m.slot].toLowerCase()})})});
  return out;
}

/* ===== Покупки ===== */
function shopCycle(){return addDays(cycleStart(appNow()),7)} // следующая неделя меню
function needFor(cs){const n={};for(let i=0;i<7;i++)dayPlan(addDays(cs,i)).meals.forEach(m=>m.items.forEach(x=>{n[x.p]=(n[x.p]||0)+x.q}));return n}
function useAfter(ts,until){ // сколько уйдёт по плану с момента ts до начала следующего цикла
  const u={};let d=pkey(dkey(new Date(ts)));d=addDays(d,-1);const n=Math.min(120,Math.ceil((until-d)/864e5)+1);
  for(let i=0;i<n;i++){const day=addDays(d,i);if(day>=until)break;dayPlan(day).meals.forEach(m=>{const at=mealAt(day,m);if(at>ts&&at<until)m.items.forEach(x=>{u[x.p]=(u[x.p]||0)+x.q})})}
  return u}
// что лежит дома: консервы и сухое (keep) помнятся между неделями в S.pantry, свежее — в S.left на неделю закупки
function homeEntry(id,ck){return PR[id].keep?(S.pantry||{})[id]:(S.left[ck]||{})[id]}
function setHome(id,q){const ck=dkey(shopCycle()),B=PR[id].keep?(S.pantry=S.pantry||{}):(S.left[ck]=S.left[ck]||{});if(q>0)B[id]={q,at:Date.now()};else delete B[id]}
function shopList(){
  const cs=shopCycle(),ck=dkey(cs),need=needFor(cs),rows=[],ua={};
  Object.keys(PR).forEach(id=>{const p=PR[id],l=!p.bulk&&homeEntry(id,ck);if(p.bulk||(!need[id]&&!l))return;
    let home=0;if(l&&l.q>0){const u=(ua[l.at]=ua[l.at]||useAfter(l.at,cs))[id]||0;home=Math.max(0,l.q-u)}
    const lack=(need[id]||0)-home,buy=lack>0?Math.ceil(Math.round(lack*10)/10/p.shop)*p.shop:0;
    rows.push({id,p,need:need[id]||0,home,buy,q:l?l.q:0,extra:!need[id]})});
  const C=S.chk[ck]||{},bulk=BULK.filter(id=>S.stock[id]||C[id]);
  return {cs,ck,rows,bulk,need};
}
function priceOf(id){const o=(S.price||{})[id];return o!=null?o:(PRICES[id]||[0])[0]}
function priceUnit(id){const p=PR[id],per=(PRICES[id]||[])[1]||1;if(p.bulk)return 'за '+p.bulk;return p.u==='шт'?(per===1?'за шт':'за '+per+' шт'):(per===1000?'за кг':'за '+per+' г')}
function costOf(id,q){const p=PR[id];return p.bulk?priceOf(id):q/((PRICES[id]||[])[1]||1)*priceOf(id)}
const vnd=n=>String(Math.round(n/1000)*1000).replace(/\B(?=(\d{3})+(?!\d))/g,' ')+' ₫';
function shopCost(L){let go=0,sp=0;L.rows.forEach(r=>{if(r.buy>0)go+=costOf(r.id,r.buy)});L.bulk.forEach(id=>{if(SPORT.includes(id))sp+=costOf(id);else go+=costOf(id)});return {go,sp}}
function buyText(r){const p=r.p;if(p.m==='palm'&&!S.grams)return fq(r.buy,'г')+' ≈ '+fmtMeasure(r.buy/p.mg,'palm');if(p.u==='шт'&&r.p.shop===10)return r.buy+' шт ('+r.buy/10+' '+plural(r.buy/10,['десяток','десятка','десятков'])+')';return fq(r.buy,p.u)}
function leftStep(p){return p.m?p.mg*(p.m==='palm'?0.5:1):1}
function leftText(p,q){return p.m&&!S.grams?fmtMeasure(q/p.mg,p.m):fq(q,p.u)}
function gcal(title,days,time,details){
  if(!Array.isArray(days))days=[days];
  const [h,mi]=time.split(':').map(Number),t=new Date();let s=null;
  for(let i=0;i<8&&!s;i++){const d=addDays(t,i);if(days.includes(wd(d))){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,mi);if(x>t)s=x}}
  const e=new Date(s.getTime()+15*6e4),f=d=>d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(d.getHours())+pad(d.getMinutes())+'00';
  const BY=['MO','TU','WE','TH','FR','SA','SU'],tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Ho_Chi_Minh';
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(title)+'&dates='+f(s)+'/'+f(e)+'&ctz='+encodeURIComponent(tz)+'&recur='+encodeURIComponent(days.length===7?'RRULE:FREQ=DAILY':'RRULE:FREQ=WEEKLY;BYDAY='+days.map(d=>BY[d]).join(','))+'&details='+encodeURIComponent(details)}

/* ===== UI ===== */
let openDone=new Set(),popKey='',shopMode=false,wakeLock=null;
const moreOpen={w:true};
let menuWeek=[6,0].includes(wd(new Date()))?1:0;
let tab='today',viewDate=dkey(appNow()),updReady=false,swapAll=false,editOpen='',ED=null,xOpen='',X={n:'',k:'',p:'',f:'',c:'',por:'1',line:''};
const ICONS={
 today:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.9"/><circle cx="12" cy="12" r="2.1"/><path d="M2.6 3v4.2a1.4 1.4 0 0 0 2.8 0V3M4 8.6V21M21.4 3v18M21.4 3c-1.6.9-2.6 3-2.6 6.2v2.6h2.6"/></svg>',
 pot:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 11h15v4.5a4.5 4.5 0 0 1-4.5 4.5H9a4.5 4.5 0 0 1-4.5-4.5z"/><path d="M2.5 11h2M19.5 11h2M9 3.5c-.9 1 .9 2 0 3.5M12 3c-.9 1 .9 2 0 3.5M15 3.5c-.9 1 .9 2 0 3.5"/></svg>',
 menu:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3M8 17h6"/></svg>',
 shop:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18l-1.6 9.2a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8z"/><path d="M8 9l3-5M16 9l-3-5M9 13v3M15 13v3"/></svg>',
 weight:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>'};
const TABS=[['today','Сегодня'],['menu','Меню'],['shop','Покупки'],['weight','Ещё']];
function shopLeftCount(){try{const L=shopList(),C=S.chk[L.ck]||{},ids=L.rows.filter(r=>r.buy>0).map(r=>r.id).concat(L.bulk);return ids.filter(id=>!C[id]).length}catch(_){return 0}}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,2200)}
function render(){
  const bd=[6,0].includes(wd(new Date()))?shopLeftCount():0;
  document.getElementById('tabs').innerHTML=TABS.map(([id,l])=>`<button data-a="tab" data-v="${id}" class="${tab===id?'on':''}" aria-current="${tab===id?'page':'false'}"><span class="ic" aria-hidden="true">${ICONS[id]}${id==='shop'&&bd?`<i class="badge">${bd}</i>`:''}</span>${l}${id==='shop'&&bd?`<span class="sr">, осталось купить ${bd}</span>`:''}</button>`).join('');
  document.getElementById('app').innerHTML=(updReady?`<div class="bar-top"><span>Вышла новая версия приложения.</span><button class="btn" data-a="upd">Обновить</button></div>`:'')+({today:vToday,menu:vMenu,shop:vShop,weight:vWeight}[tab])();
  document.body.classList.toggle('shopmode',tab==='shop'&&shopMode);
  if(popKey)setTimeout(()=>{popKey=''},600);
}
const dk_=(dk,slot)=>dk+'|'+slot;
function menuCs(){return addDays(cycleStart(appNow()),7*menuWeek)}
function vMenu(){
  const cs=menuCs(),ck=dkey(cs),tk=dkey(appNow()),mi=menuIdxOf(cs),rev=(S.reviewed||{})[ck],bought=boughtFor(ck);
  let h=`<header class="top"><h1>Меню</h1><div class="date">${fmtDate(cs)} – ${fmtDate(addDays(cs,6))} · ${menuName(cs)}</div></header>
  <div class="seg two" role="tablist"><button class="${menuWeek===0?'on':''}" data-a="mweek" data-v="0">Эта неделя</button><button class="${menuWeek===1?'on':''}" data-a="mweek" data-v="1">Следующая</button></div>`;
  if(menuWeek===1)h+=rev?`<div class="card ok small">✓ Меню проверено. Список покупок собран по нему.</div>`:`<div class="card due"><b>Проверь меню на ${fmtDate(cs)} – ${fmtDate(addDays(cs,6))}</b><div class="small muted">Не нравится блюдо или продукт — нажми на приём. Список покупок пересчитается сам.</div><div class="btns"><button class="btn pri" data-a="review">Меню ок</button></div></div>`;
  else if(bought)h+=`<div class="small muted" style="margin-bottom:10px">Продукты на эту неделю уже куплены — при правках, которые меняют продукты, приложение переспросит.</div>`;
  h+=`<details class="card" id="wkbox" ${window._openWk?'open':''}><summary><b>Вся неделя</b><span class="muted small">замены и блюда</span></summary>
  <div class="ph">Другое меню из 4</div><div class="picks">${(cs<EPOCH?[[-1,'Базовое']]:[]).concat([0,1,2,3].map(i=>[i,'Меню '+(i+1)])).map(([i,l])=>`<button class="pick ${mi===i?'on':''}" data-a="wmenu" data-v="${i}">${l}</button>`).join('')}</div>
  ${Object.keys(S.wswaps[ck]||{}).length?`<div class="ph">Замены на всю неделю</div><ul class="notes">${Object.entries(S.wswaps[ck]).map(([f,t])=>`<li>${esc(cap(PR[f].s))} → ${esc(PR[t].s)} <button class="link" data-a="wswapundo" data-d="${ck}" data-v="${f}">вернуть</button></li>`).join('')}</ul>`:''}
  <div class="ph">Разнообразить</div><div class="small muted">Подставит 4 блюда из разных продуктов: жареный рис, фо, омлет, суп и т. п. — с близкими калориями.</div>
  <div class="btns"><button class="btn sm" data-a="varied">Разнообразить неделю</button><button class="btn ghost sm" data-a="wreset">Сбросить правки недели</button></div></details>`;
  h+='<div class="days">';
  for(let i=0;i<7;i++){const d=addDays(cs,i),dk=dkey(d),pl=dayPlan(d),ms=pl.meals.slice().sort((a,b)=>tmin(a.time)-tmin(b.time)),t={k:0,p:0};
    ms.forEach(m=>{const x=macros(m.items);t.k+=x.k;t.p+=x.p});const okd=t.k>=NORM.k[0]-150&&t.k<=NORM.k[1];
    h+=`<section class="card day ${dk===tk?'istoday':''}"><div class="dh"><b>${DAYS_FULL[wd(d)]}, ${fmtDate(d)}</b><span class="${okd?'':'flag'}">${r0(t.k)} ккал · Б ${r0(t.p)}</span></div><div class="small muted">${DTYPE[pl.type]}</div><div class="dbar"><i class="${okd?'':'off'}" style="width:${Math.min(100,t.k/NORM.k[1]*100)}%"></i></div><ul class="mlist">`;
    ms.forEach(m=>{const key=dk+'|'+m.slot,ch=m.edited||m.swap||m.wswap||m.rec||m.dswap||(m.meth&&m.meth!=='pan');
      h+=`<li><button class="mrow" data-a="editopen" data-d="${dk}" data-s="${m.slot}" aria-expanded="${editOpen===key}"><span class="t">${m.time}</span><span class="grow"><b>${SLOTS[m.slot]}</b>${ch?' <span class="chg">изменено</span>':''}${mealTag(m)}<span class="sub">${esc(m.items.map(x=>cap(PR[x.p].s)+' '+qtyText(x)).join(' · '))}</span></span><span class="kcm">${r0(macros(m.items).k)}</span><span class="chev" aria-hidden="true">${editOpen===key?'▾':'▸'}</span></button>${editOpen===key?mealPanel(dk,m):''}</li>`});
    h+=`</ul></section>`}
  h+='</div>';
  return h}
function leftEntered(){const L=S.left[dkey(shopCycle())];return !!(L&&Object.keys(L).length)}
function vToday(){
  const now=appNow(),tk=dkey(now),date=pkey(viewDate),isToday=viewDate===tk,cs=cycleStart(date);
  const plan=dayPlan(date),meals=plan.meals.slice().sort((a,b)=>tmin(a.time)-tmin(b.time)),done=m=>!!S.done[dk_(viewDate,m.slot)];
  const _ek=meals.filter(m=>done(m)).reduce((a,m)=>a+macros(m.items).k,0)+((S.extra||{})[viewDate]||[]).reduce((a,x)=>a+(x.k||0),0),_st=isToday?streak():0;
  let h=`<div class="tgrid"><div class="tc1"><header class="top thead"><div><h1>${isToday?'Сегодня':DAYS_FULL[wd(date)]}</h1><div class="date">${fmtDate(date)} · ${DTYPE[plan.type]} · ${menuName(cs)}</div>${_st>=2?`<div class="streak">🔥 ${_st} ${plural(_st,['день','дня','дней'])} подряд в норме</div>`:''}</div>${ring(_ek,NORM.k[1])}</header>`;
  const twd=wd(now),hr=new Date().getHours();
  if(isToday&&((twd===6&&hr>=18)||twd===0)&&leftEntered()&&!(S.reviewed||{})[dkey(shopCycle())])h+=`<div class="card due"><b>Шаг 2 — проверь меню на следующую неделю</b><div class="small muted">Не нравится блюдо или продукт — поменяй, список покупок пересчитается.</div><div class="btns"><button class="btn pri" data-a="gomenu">Открыть меню</button></div></div>`;
  if(isToday&&((twd===6&&hr>=18)||twd===0)&&!leftEntered())h+=`<div class="card due"><b>Шаг 1 — ${twd===6?'перед ужином внеси, что осталось дома':'перед закупкой внеси, что осталось дома'}</b><div class="small muted">Тогда в список попадёт только то, чего не хватает на новую неделю. Заодно проверь запасы: рис, протеин, масло, соль.</div><div class="btns"><button class="btn pri" data-a="goleft">Внести остатки</button></div></div>`;
  if(isToday&&twd===6&&backupAge()>30)h+=`<div class="card due small"><b>Раз в месяц: сохрани копию данных</b><div class="btns"><button class="btn sm" data-a="bsave">Сохранить копию</button></div></div>`;
  if(isToday&&twd===4&&(S.cal||[]).length&&Math.round((appNow()-pkey(S.cal.slice().sort((a,b)=>a.d<b.d?-1:1).pop().d))/864e5)>=13)h+=`<div class="card due small"><b>Сегодня замер калипером</b> — живот и бок. <button class="link" data-a="tab" data-v="weight">Записать</button></div>`;
  if(isToday&&twd===0)h+=`<div class="card due"><b>Сегодня закупка</b><div class="small muted">На ${fmtDate(shopCycle())} – ${fmtDate(addDays(shopCycle(),6))}.</div><div class="btns"><button class="btn" data-a="tab" data-v="shop">Открыть список</button></div></div>`;
  if(isToday&&twd===4&&!S.w.some(x=>x.d===dkey(new Date())))h+=`<div class="card due"><b>Пятница — взвешивание</b><div class="small muted">Утром натощак, до еды и воды.</div><div class="addrow" style="margin-top:8px"><input id="w-in" inputmode="decimal" placeholder="Вес, кг" aria-label="Вес, кг"><button class="btn pri" data-a="wsave">Записать</button></div></div>`;
  if(isToday&&(twd===4||twd===5)&&S.w.some(x=>x.d>=dkey(addDays(new Date(),-(twd-4)))))h+=summaryCard();
  h+=`<div class="weeknav"><button class="iconbtn" data-a="cyc" data-v="-7" aria-label="Прошлая неделя">‹</button><span class="lbl">${fmtDate(cs)} – ${fmtDate(addDays(cs,6))}${dkey(cs)===dkey(shopCycle())?' · следующая':''}</span><button class="iconbtn" data-a="cyc" data-v="7" aria-label="Следующая неделя">›</button></div><div class="strip">`;
  for(let i=0;i<7;i++){const d=addDays(cs,i),k=dkey(d);h+=`<button data-a="pick" data-v="${k}" class="${k===viewDate?'sel':''} ${k===tk?'today':''}"><b>${DAYS[wd(d)]}</b><span>${d.getDate()}</span></button>`}
  h+='</div>';
  const skipped=m=>!!(S.skip||{})[dk_(viewDate,m.slot)];
  const next=isToday?meals.find(m=>!done(m)&&!skipped(m)):null;
  if(next){const diff=tmin(next.time)-nowMin(),eta=diff>0?'через '+(diff>=60?Math.floor(diff/60)+' ч'+(diff%60?' ':''):'')+(diff%60?(diff%60)+' мин':''):diff>-30?'сейчас':'время прошло';
    h+=`<section class="hero"><div class="hh"><div class="when">${next.time}</div><div class="what">${SLOTS[next.slot]}${mealTag(next)}</div></div>${itemsList(next.items)}<details class="howd"><summary>Как готовить</summary>${stepsList(next)}</details><div class="row"><span class="eta">${eta}</span><span class="hb"><button class="skipx hx" data-a="skip" data-s="${next.slot}" aria-label="Пропустил: ${SLOTS[next.slot]}">✕</button><button class="btn" data-a="eat" data-s="${next.slot}">Съел</button></span></div></section>`}
  else if(isToday)h+=`<div class="card"><b>Все приёмы на сегодня отмечены.</b></div>`;
  const extras=(S.extra||{})[viewDate]||[];
  {const e={k:0,p:0,f:0,c:0};meals.forEach(m=>{if(done(m)){const x=macros(m.items);['k','p','f','c'].forEach(k=>e[k]+=x[k])}});extras.forEach(x=>['k','p','f','c'].forEach(k=>e[k]+=x[k]||0));
   const cell=(k,l,cls)=>{const [lo,hi]=NORM[k],v=r0(e[k]),over=v>hi+(k==='k'?50:5);return `<div class="nt"><b class="${over?'over':''}">${v}</b><div class="nl">${l}</div><div class="nn">${lo}–${hi}</div><div class="nb"><i style="width:${Math.min(100,v/hi*100)}%;background:var(--${over?'warn':cls})"></i></div></div>`};
   h+=`<section class="card eatbox" aria-label="Съедено за день"><div class="eh">${isToday?'Съедено сегодня':'Съедено за день'}<span>«Съел» + вне плана</span></div><div class="ng">${cell('k','ккал','accent')}${cell('p','белки, г','p')}${cell('f','жиры, г','f')}${cell('c','углев., г','c')}</div></section>`}
  const prep=prepFor(date),thaw=hr>=16||!isToday?thawFor(date):[];
  if(prep.length||thaw.length)h+=`<section class="card prep"><h3>${isToday?'Заготовки сегодня':'Заготовки'}</h3>${prep.map(t=>`<p class="task">${esc(t)}</p>`).join('')}${thaw.length?`<p class="task">Вечером переложи из морозилки в холодильник на завтра:</p><ul class="il">${thaw.map(t=>`<li><span>${esc(cap(t.name))} <i>${esc(t.slot)}</i></span><b>${esc(t.q)}</b></li>`).join('')}</ul>`:''}</section>`;
  let tot={k:0,p:0,f:0,c:0};
  h+=`</div><div class="tc2"><div class="h2c"><h2>План дня</h2>${S.grams?`<button class="ckbtn ${S.cooked?'on':''}" data-a="cooked" aria-pressed="${!!S.cooked}" aria-label="Вес в готовом виде" title="Вес в готовом виде">${ICONS.pot}</button>`:''}</div><ul class="tl">`;
  // еда вне плана, добавленная через «+» у приёма, показывается внутри этого приёма
  const slotsOn=new Set(meals.map(m=>m.slot)),xin=x=>x.s&&slotsOn.has(x.s);
  const ents=meals.map(m=>({t:tmin(m.time),m})).concat(extras.filter(x=>!xin(x)).map(x=>({t:tmin(x.t),x}))).sort((a,b)=>a.t-b.t);
  const kcol=k=>`<span class="mk">${r0(k)}<small> ккал</small></span>`,gap='<span class="skipx gap" aria-hidden="true"></span>';
  const addb=m=>`<button class="addx" data-a="xopen" data-s="${m.slot}" aria-label="Съел вне плана: ${SLOTS[m.slot]}" aria-expanded="${xOpen===m.slot}">+</button>`;
  const xrows=m=>{const xs=extras.filter(x=>x.s===m.slot);return (xs.length?`<ul class="xl">${xs.map(x=>`<li><span class="grow">${esc(x.n)}</span><span class="xk">+${r0(x.k||0)} ккал</span><button class="xdel" data-a="xdel" data-id="${x.id}" aria-label="Удалить: ${esc(x.n)}">✕</button></li>`).join('')}</ul>`:'')+(xOpen===m.slot?xForm(m):'')};
  const walk=m=>plan.type==='W'&&m.slot==='snack'?`</ul><div class="walk"><b>Ходьба 45–60 мин.</b> Пульс 110–130. До ужина (закончить до 22:00) или через 1–1,5 ч после него.</div><ul class="tl">`:'';
  ents.forEach(en=>{
    if(en.x){const x=en.x;
      h+=`<li class="extra mini"><div class="mh"><span class="t">${x.t}</span><span class="name">${esc(x.n)} <small class="mut">вне плана</small></span>${kcol(x.k||0)}${gap}<button class="check xc" data-a="xdel" data-id="${x.id}" aria-label="Удалить: ${esc(x.n)}">✕</button></div></li>`;return}
    const m=en.m,e=done(m),mm=macros(m.items),key=viewDate+'|'+m.slot,sk=skipped(m);if(!sk)['k','p','f','c'].forEach(k=>tot[k]+=mm[k]);
    const chk=`<button class="check ${popKey===key?'pop':''}" data-a="eat" data-s="${m.slot}" aria-pressed="${e}" aria-label="${e?'Снять отметку':'Съел'}: ${SLOTS[m.slot]}">${e?'✓':''}</button>`;
    const skb=`<button class="skipx" data-a="skip" data-s="${m.slot}" aria-pressed="${sk}" aria-label="${sk?'Отменить пропуск':'Пропустил'}: ${SLOTS[m.slot]}">✕</button>`;
    // все приёмы свёрнуты, нажатие на название раскрывает
    if(!openDone.has(key)){h+=`<li class="${e?'eaten':''} ${sk?'skipped':''} ${next===m?'next':''} mini"><div class="mh"><span class="t">${m.time}</span>${addb(m)}<button class="name nlink" data-a="xpand" data-v="${key}" aria-expanded="false">${SLOTS[m.slot]}${sk?' <small>пропущен</small>':''}${mealTag(m)}</button>${kcol(mm.k)}${e?gap:skb}${chk}</div>${xrows(m)}</li>`+walk(m);return}
    const edl=`<div class="mact"><button class="link" data-a="editopen" data-d="${viewDate}" data-s="${m.slot}">${editOpen===key?'Скрыть':'Изменить'}</button>${m.edited?` <span class="muted">· граммы изменены</span> <button class="link" data-a="editundo" data-d="${viewDate}" data-s="${m.slot}">вернуть</button>`:m.swap||m.wswap||m.rec||m.dswap?' <span class="muted">· изменено</span>':''}</div>${editOpen===key?mealPanel(viewDate,m):''}`;
    h+=`<li class="${e?'eaten':''} ${sk?'skipped':''} ${next===m?'next':''}"><div class="mh"><span class="t">${m.time}</span>${addb(m)}<button class="name nlink" data-a="xpand" data-v="${key}" aria-expanded="true">${SLOTS[m.slot]}${sk?' <small>пропущен</small>':''}${mealTag(m)}</button>${kcol(mm.k)}${e?gap:skb}${chk}</div>${xrows(m)}${qtyList(m,viewDate)}${edl}${stepsList(m)}${chips(mm)}</li>`+walk(m)});
  h+=`</ul><div class="daytot">За день по плану: ${r0(tot.k)} ккал · Б ${r0(tot.p)} · Ж ${r0(tot.f)} · У ${r0(tot.c)}</div>`;
  h+='</div></div>';
  return h;
}
function stepOf(p){return p.u==='шт'||p===PR.creatine?1:[PR.oil,PR.nuts,PR.protein].includes(p)?5:10}
// продукты приёма с кнопками − и + : граммы меняются сразу, без «Сохранить»
function qtyList(m,dk){const D=`data-d="${dk}" data-s="${m.slot}"`;
  return `<ul class="il ql">${m.items.map((i,n)=>{const p=PR[i.p];return `<li><span>${esc(cap(p.s))}</span><span class="qv"><button class="qb" data-a="qadj" ${D} data-i="${n}" data-v="-1" aria-label="Меньше: ${esc(p.s)}">−</button><b>${esc(qtyText(i))}${cookedTxt(i)}</b><button class="qb" data-a="qadj" ${D} data-i="${n}" data-v="1" aria-label="Больше: ${esc(p.s)}">+</button></span></li>`}).join('')}</ul>`}
function editBox(m,dk){dk=dk||viewDate;
  if(!ED||ED.key!==dk+'|'+m.slot)ED={key:dk+'|'+m.slot,items:m.items.map(i=>[i.p,i.q])};
  const opts=Object.keys(PR).filter(id=>PR[id].k&&!ED.items.some(x=>x[0]===id));
  const mm=macros(ED.items.map(([p,q])=>({p,q})));
  return `<div class="edbox"><ul class="list">${ED.items.map(([p,q],i)=>{const pr=PR[p];return `<li class="lrow"><div class="grow"><div class="nm">${esc(cap(pr.s))}</div><div class="sub">${pr.u==='шт'?'штук':'граммов'}${pr.u==='г'&&!S.grams&&pr.m?' · ≈ '+fmtMeasure(q/pr.mg,pr.m):''}</div></div><div class="qty"><button data-a="edq" data-d="${dk}" data-i="${i}" data-v="-1" aria-label="Меньше">−</button>${pr.u==='шт'?`<b>${q}</b>`:`<input class="gin" type="number" inputmode="numeric" min="0" step="${stepOf(pr)}" data-in="edg" data-i="${i}" value="${q}" aria-label="${esc(pr.s)}, граммов">`}<button data-a="edq" data-d="${dk}" data-i="${i}" data-v="1" aria-label="Больше">+</button></div></li>`}).join('')}</ul>
  <div class="field" style="margin-top:6px"><label for="edadd">Добавить продукт</label><select id="edadd" data-in="edadd"><option value="">— выбрать —</option>${opts.map(id=>`<option value="${id}">${esc(cap(PR[id].s))}</option>`).join('')}</select></div>
  <div class="small muted">Станет: ${r0(mm.k)} ккал · Б ${r0(mm.p)} · Ж ${r0(mm.f)} · У ${r0(mm.c)}</div>
  <div class="btns"><button class="btn pri sm" data-a="edsave" data-d="${dk}" data-s="${m.slot}">Сохранить граммы</button></div></div>`}
function mealPanel(dk,m){
  const cs=cycleStart(pkey(dk)),main=m.items.find(i=>SWAPP.includes(i.p)),base=macros(m.items).k,D=`data-d="${dk}" data-s="${m.slot}"`;
  let h=`<div class="mpanel">`;
  const recs=RECIPES.filter(r=>r[2].includes(m.slot));
  if(recs.length)h+=`<div class="ph">Блюдо</div><select data-in="recsel" ${D} aria-label="Блюдо"><option value="">По плану${m.rec?'':' ✓'}</option>${recs.map(r=>{const d=r0(macros(r[3].map(([p,q])=>({p,q}))).k-base);return `<option value="${r[0]}" ${m.rec===r[0]?'selected':''}>${esc(r[1])} (${d>0?'+':''}${d} ккал)</option>`}).join('')}</select>`;
  if(!m.rec&&main&&METHODS[main.p])h+=`<div class="ph">Как приготовить ${esc(PR[main.p].s)}</div><div class="picks">${METHODS[main.p].map(([id,l])=>`<button class="pick ${(m.meth||'pan')===id?'on':''}" data-a="meth" ${D} data-v="${id}">${esc(l)}</button>`).join('')}</div>`;
  if(!m.rec&&main){h+=`<div class="ph">Белок ${m.swap?`<span class="muted">· было: ${esc(PR[m.swap.from].s)}</span> <button class="link" data-a="swapundo" ${D}>вернуть</button>`:m.wswap?`<span class="muted">· на неделю вместо: ${esc(PR[m.wswap.from].s)}</span> <button class="link" data-a="wswapundo" data-d="${dk}" data-v="${m.wswap.from}">вернуть</button>`:''}</div>
    <div class="picks"><button class="pick all ${swapAll?'on':''}" data-a="swapall" aria-pressed="${swapAll}">${swapAll?'☑':'☐'} На всю неделю</button>${SWAPP.filter(id=>id!==main.p).map(id=>{const d=r0(macros(m.items.map(i=>i===main?{p:id,q:swapQ(i.p,i.q,id)}:i)).k-base);return `<button class="pick" data-a="swapdo" ${D} data-v="${id}">${esc(cap(PR[id].s))} <small>${d>0?'+':''}${d}</small></button>`}).join('')}</div>`}
  if(['lunch','dinner','late'].includes(m.slot)){const days=[0,1,2,3,4,5,6].map(i=>addDays(cs,i)).filter(d=>dkey(d)!==dk);
    h+=`<div class="ph">Поменять ${SLOTS[m.slot].toLowerCase()} с другим днём${m.dswap?` <span class="muted">· взят из ${DAYS[wd(pkey(m.dswap))]}</span> <button class="link" data-a="dswap" ${D} data-v="">вернуть</button>`:''}</div><div class="picks">${days.map(d=>`<button class="pick" data-a="dswap" ${D} data-v="${dkey(d)}">${DAYS[wd(d)]} ${d.getDate()}</button>`).join('')}</div>`}
  h+=`<div class="ph">Продукты и граммы${m.edited?` <span class="muted">· изменено</span> <button class="link" data-a="editundo" ${D}>вернуть</button>`:''}</div>${editBox(m,dk)}</div>`;
  return h}
function mealTag(m){return m.rec?`<div class="rtag">${esc(RECBY[m.rec][1])}</div>`:m.meth&&m.meth!=='pan'?(()=>{const main=m.items.find(i=>METHODS[i.p]);const mt=main&&METHODS[main.p].find(x=>x[0]===m.meth);return mt?`<div class="rtag">${esc(cap(PR[main.p].s))}: ${esc(mt[1].toLowerCase())}</div>`:''})():''}
function boughtFor(dk){const cs=cycleStart(pkey(dk));if(cs<=cycleStart(appNow()))return true;return Object.keys((S.chk||{})[dkey(cs)]||{}).length>=3}
function guard(dk){return !boughtFor(dk)||confirm('Продукты на эту неделю уже куплены. Всё равно изменить?')}
function xForm(m){
  return `<section class="xf xfc" aria-label="Съел вне плана: ${SLOTS[m.slot]}">
  <select data-in="xpre" aria-label="Частое"><option value="">Частое ▾</option>${PRESETS.map((p,i)=>`<option value="${i}">${esc(p[0])} — ${p[2]} ккал</option>`).join('')}</select>
  <div class="xrow"><input id="xn" data-in="xf" data-k="n" value="${esc(X.n)}" placeholder="Что съел" aria-label="Что съел"><input id="xk" class="xkc" inputmode="decimal" data-in="xf" data-k="k" value="${esc(X.k)}" placeholder="ккал" aria-label="Ккал"><button class="btn pri sm" data-a="xsave">OK</button></div>
  <details id="xmore" ${X.more?'open':''}><summary class="small muted">подробнее</summary>
  <div class="g4">${[['p','Белки'],['f','Жиры'],['c','Углев.'],['por','Порций']].map(([k,l])=>`<div class="field"><label for="x${k}">${l}</label><input id="x${k}" inputmode="decimal" data-in="xf" data-k="${k}" value="${esc(X[k])}"></div>`).join('')}</div>
  <div class="field"><label for="xl">Строка от Claude</label><textarea id="xl" rows="2" data-in="xf" data-k="line" placeholder="РАЦИОН: Phở bò | 450 | 25 | 10 | 60">${esc(X.line)}</textarea></div>
  ${navigator.clipboard&&navigator.clipboard.readText?'<button class="link small" data-a="xclip">Вставить из буфера</button>':''}</details></section>`;
}
const REM=[['Протеин до тренировки','09:30',[0,1,3,4],'Пн, Вт, Чт, Пт',0],['Завтрак','11:30',[0,1,3,4],'Пн, Вт, Чт, Пт',1],['Завтрак','10:00',[2,5,6],'Ср, Сб, Вс',1],['Обед','16:00',[0,1,2,3,4,5,6],'каждый день',1],['Перекус','19:30',[0,1,2,3,4,5,6],'каждый день',0],['Ужин','22:30',[0,1,2,3,4,5,6],'каждый день',1],['Поздний перекус','00:30',[0,1,2,3,4,5,6],'каждую ночь',1]];
function weekSummary(){
  const end=addDays(appNow(),-1),days=[];let cnt=0,ok=0,sk=0,sp=0;
  for(let i=6;i>=0;i--){const d=addDays(end,-i),k=dkey(d),pl=dayPlan(d).meals,ex=(S.extra||{})[k]||[],dn=pl.filter(m=>S.done[dk_(k,m.slot)]),skn=pl.filter(m=>(S.skip||{})[dk_(k,m.slot)]).length;
    const e={k:0,p:0};dn.forEach(m=>{const x=macros(m.items);e.k+=x.k;e.p+=x.p});ex.forEach(x=>{e.k+=x.k||0;e.p+=x.p||0});
    const full=dn.length+skn>=pl.length-1||(dn.length>=3&&ex.length>0);
    if(full){cnt++;sk+=e.k;sp+=e.p;const inN=e.k>=NORM.k[0]-100&&e.k<=NORM.k[1]+100&&e.p>=NORM.p[0]-10;if(inN)ok++}
    days.push({d,k:r0(e.k),p:r0(e.p),full,marks:dn.length+ex.length})}
  const ws=S.w.slice().sort((a,b)=>a.d<b.d?-1:1),l=ws[ws.length-1],p=ws.filter(x=>l&&x.d<=dkey(addDays(pkey(l.d),-6))).pop();
  return {days,cnt,ok,avgK:cnt?r0(sk/cnt):0,avgP:cnt?r0(sp/cnt):0,from:addDays(end,-6),to:end,w:l,wp:p}}
function dayOk(d){const k=dkey(d),pl=dayPlan(d).meals,ex=(S.extra||{})[k]||[],dn=pl.filter(m=>S.done[dk_(k,m.slot)]),skn=pl.filter(m=>(S.skip||{})[dk_(k,m.slot)]).length;
  let kc=0,p=0;dn.forEach(m=>{const x=macros(m.items);kc+=x.k;p+=x.p});ex.forEach(x=>{kc+=x.k||0;p+=x.p||0});
  const full=dn.length+skn>=pl.length-1||(dn.length>=3&&ex.length>0);return full&&kc>=NORM.k[0]-100&&kc<=NORM.k[1]+100&&p>=NORM.p[0]-10}
function streak(){let n=0,d=pkey(dkey(appNow()));if(dayOk(d))n++;d=addDays(d,-1);for(let i=0;i<90;i++){if(!dayOk(d))break;n++;d=addDays(d,-1)}return n}
function ring(v,max){const r=22,c=2*Math.PI*r,f=Math.min(1,v/max),over=v>max;return `<div class="ring" role="img" aria-label="Съедено ${r0(v)} из ${max} ккал"><svg viewBox="0 0 56 56" width="56" height="56"><circle cx="28" cy="28" r="${r}" class="rb"/><circle cx="28" cy="28" r="${r}" class="rf ${over?'over':''}" stroke-dasharray="${(c*f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 28 28)"/></svg><span><b>${r0(v)}</b>ккал</span></div>`}
function summaryCard(){const W=weekSummary();
  return `<section class="card sum"><h3>Итог недели</h3><div class="small muted">${fmtDate(W.from)} – ${fmtDate(W.to)} · считаются дни, где отмечены почти все приёмы</div>
  <div class="sg"><div><b>${W.cnt}</b><span>из 7 дней отмечено</span></div><div><b>${W.ok}</b><span>в норме</span></div><div><b>${W.avgK||'—'}</b><span>ккал в среднем</span></div><div><b>${W.avgP||'—'}</b><span>белок, г в среднем</span></div></div>
  <div class="bars">${W.days.map(x=>`<div class="bc"><i style="height:${x.full?Math.min(100,x.k/2200*100):4}%;background:var(--${!x.full?'line':x.k>=NORM.k[0]-100&&x.k<=NORM.k[1]+100?'accent':'f'})"></i><span>${DAYS[wd(x.d)]}</span></div>`).join('')}</div>
  <ul class="notes">${W.w?`<li>Вес: ${kg(W.w.w)} кг${W.wp?` (неделю назад ${kg(W.wp.w)}, ${W.w.w-W.wp.w>0?'+':''}${kg(W.w.w-W.wp.w)} кг)`:''}</li>`:'<li>Вес ещё не записан</li>'}
  ${W.cnt<4?'<li>Отмечай приёмы кнопкой «Съел» — тогда итог будет точнее</li>':W.avgP&&W.avgP<NORM.p[0]-10?'<li>Белка меньше нормы — не пропускай перекус с протеином</li>':W.avgK>NORM.k[1]+100?'<li>Калорий больше нормы — посмотри на еду вне плана</li>':'<li>Неделя близка к плану</li>'}</ul></section>`}
const SLOTW={pre:'предтрен',bf:'завтрак',lunch:'обед',snack:'перекус',dinner:'ужин',late:'поздн'};
function parseLines(t){const out=[];String(t||'').split(/\r?\n/).forEach(line=>{const m=line.replace(/[`*]/g,'').match(/РАЦИОН(-ПЛАН)?\s*:\s*(.+)$/i);if(!m)return;
  if(m[1]){const w=m[2].toLowerCase();const sl=Object.keys(SLOTW).find(k=>w.includes(SLOTW[k]));if(sl)out.push({plan:sl});return}
  const p=m[2].split('|').map(x=>x.trim()),n=v=>Math.max(0,Math.round(parseNum(String(v||'').replace(/[^\d.,]/g,''))));
  const e={n:p[0].slice(0,80),k:n(p[1]),p:n(p[2]),f:n(p[3]),c:n(p[4])};p.slice(5).forEach(x=>{if(/^\d{1,2}:\d{2}$/.test(x))e.t=x.padStart(5,'0')});if(e.n&&e.k)out.push(e)});return out}
function vShopMode(){
  const L=shopList(),ck=L.ck,C=S.chk[ck]||{};
  const items=L.rows.filter(r=>r.buy>0).map(r=>({id:r.id,n:nameOf(r.p),q:r.p.u==='шт'&&r.p.shop===10?r.buy+' шт':fq(r.buy,r.p.u),vi:r.p.vi,sec:r.p.sec}))
    .concat(L.bulk.map(id=>({id,n:nameOf(PR[id]).replace(/:.*$/,''),q:PR[id].bulk,vi:PR[id].vi,sec:'zz'})));
  const ord=SECS.map(x=>x[0]).concat(['zz']),by=(a,b)=>ord.indexOf(a.sec)-ord.indexOf(b.sec);
  const todo=items.filter(x=>!C[x.id]).sort(by),done=items.filter(x=>C[x.id]),n=done.length;
  const li=x=>`<li class="${C[x.id]?'bought':''}"><button class="sm-row" data-a="chk" data-p="${x.id}" aria-pressed="${!!C[x.id]}"><span class="cb ${C[x.id]?'on':''} ${popKey==='s_'+x.id?'pop':''}">${C[x.id]?'✓':''}</span><span class="grow"><b>${esc(x.n)}</b><span class="vi">${esc(x.vi||'')}</span></span><span class="q">${esc(x.q)}</span></button></li>`;
  return `<header class="top thead"><div><h1>В магазине</h1><div class="date">куплено ${n} из ${items.length} · ≈ ${vnd(shopCost(L).go)}</div></div><button class="btn" data-a="shopmode">Готово</button></header>
  <div class="prog big"><i style="width:${items.length?n/items.length*100:0}%"></i></div>
  ${todo.length?`<ul class="smlist">${todo.map(li).join('')}</ul>`:'<div class="card ok"><b>Всё куплено 🎉</b><div class="small muted">Дома разложи мясо и рыбу на Чт–Пн порциями в морозилку.</div></div>'}
  ${done.length?`<h2>Уже в корзине</h2><ul class="smlist done">${done.map(li).join('')}</ul>`:''}`}
function vShop(){if(shopMode)return vShopMode();
  const L=shopList(),cs=L.cs,ck=L.ck,C=S.chk[ck]||{},lf=S.left[ck]||{};
  const shopDay=addDays(cs,-1),today=dkey(new Date());
  let h=`<header class="top"><h1>Покупки</h1><div class="date">GO! Nha Trang · ${dkey(shopDay)===today?'сегодня':'пн, '+fmtDate(shopDay)}<br>${cap(menuName(cs))} на ${fmtDate(cs)} – ${fmtDate(addDays(cs,6))} · ${(S.reviewed||{})[ck]?'<span class="okc">✓ меню проверено</span>':'<button class="link" data-a="gomenu">меню не проверено</button>'}</div></header>`;
  const items=L.rows.filter(r=>r.buy>0).map(r=>({id:r.id,r})).concat(L.bulk.map(id=>({id,bulk:true})));
  const nOn=items.filter(x=>C[x.id]).length;
  const unitLbl=p=>S.grams&&p.u==='г'?'в граммах':p.m&&!S.grams?'в '+{palm:'ладонях',cup:'чашках',ccup:'чашках',handful:'горстях',scoop:'ложках',tsp:'ложках'}[p.m]:'в штуках';
  // остатки
  const lfn=L.rows.filter(r=>r.q>0).length,openLeft=(wd(new Date())===6||wd(new Date())===0)&&!Object.keys(lf).length;
  const sug=L.rows.filter(r=>r.extra&&r.home>0&&SWAPP.includes(r.id));
  sug.forEach(r=>{h+=`<div class="card due small"><b>Дома есть: ${esc(r.p.s)} — ${leftText(r.p,r.home)}</b><div class="muted">В меню на ${fmtDate(cs)} – ${fmtDate(addDays(cs,6))} его нет.</div><div class="btns"><button class="btn sm pri" data-a="useup" data-p="${r.id}">Подставить в обеды и ужины</button></div></div>`});
  h+=`<details class="card" id="leftbox" ${openLeft||window._openLeft?'open':''}><summary><b>Что осталось дома</b><span class="muted small">${lfn?'внесено: '+lfn:'вс вечером'}</span></summary>
  <p class="small muted" style="margin-top:0">${S.grams?'Взвесь и впиши граммы, штучное — в штуках.':'Посчитай в тех же мерах.'} То, что съешь по плану до вторника, приложение вычтет само. Консервы и сухое помнятся и дальше.</p><ul class="list">`;
  L.rows.forEach(r=>{const p=r.p,q=r.q,g=S.grams&&p.u==='г';
    const val=q?(g?q:(p.m&&!S.grams?niceNum(q/p.mg).s:String(q).replace('.',','))):'0';
    h+=`<li class="lrow"><div class="grow"><div class="nm">${esc(cap(p.s))}</div><div class="sub">${r.extra?'<span class="okc">в меню нет</span> · ':''}${unitLbl(p)}${q&&r.home<q?' · к вторнику останется '+leftText(p,r.home):''}</div></div>${g?`<div class="qty"><input class="gin" type="number" inputmode="numeric" min="0" step="10" data-in="leftg" data-p="${r.id}" value="${q||''}" placeholder="0" aria-label="${esc(p.s)}, граммов дома"><span class="small muted">г</span></div>`:`<div class="qty"><button data-a="left" data-p="${r.id}" data-v="-1" aria-label="Меньше: ${esc(p.s)}">−</button><b>${val}</b><button data-a="left" data-p="${r.id}" data-v="1" aria-label="Больше: ${esc(p.s)}">+</button></div>`}</li>`});
  const shown=new Set(L.rows.map(r=>r.id)),addable=SECS.map(([sec,t])=>[t,Object.keys(PR).filter(id=>PR[id].sec===sec&&!PR[id].bulk&&!shown.has(id))]).filter(x=>x[1].length);
  h+=`</ul><div class="field" style="margin-top:6px"><label for="leftadd">+ Добавить продукт</label><select id="leftadd" data-in="leftadd"><option value="">— выбрать —</option>${addable.map(([t,ids])=>`<optgroup label="${esc(t)}">${ids.map(id=>`<option value="${id}">${esc(nameOf(PR[id]))}</option>`).join('')}</optgroup>`).join('')}</select></div>
  <div class="btns"><a class="btn" href="${gcal('🧺 Рацион: остатки и меню',6,'21:45','1) Покупки → Что осталось дома. 2) Меню → Следующая неделя → проверь и нажми «Меню ок».')}" target="_blank" rel="noopener">Напоминание по воскресеньям</a></div></details>`;
  // запасы
  h+=`<details class="card buy" ${window._openBulk?'open':''} id="bulkbox"><summary><b>Запасы</b><span class="muted small">${(n=>n?'нет дома: '+n:'всё есть')(BULK.filter(id=>S.stock[id]).length)}</span></summary><p class="small muted" style="margin-top:0">Отметки запоминаются. «Нет» — продукт попадёт в список покупок. Отметишь в магазине «Куплено» — сам вернётся на «Есть».</p><ul class="list">`;
  BULK.forEach(id=>{const p=PR[id],on=!!S.stock[id],wk=L.need[id];
    h+=`<li class="brow"><div class="bh"><span class="nm">${esc(nameOf(p).replace(/:.*$/,''))}</span><div class="tog"><button data-a="bulk" data-p="${id}" data-v="0" class="${on?'':'on'}">Есть</button><button data-a="bulk" data-p="${id}" data-v="1" class="${on?'on b':''}">Нет</button></div></div><ul class="notes">${wk?`<li>В неделю ≈ ${fq(wk,p.u)}${p.m&&!S.grams?' ('+fmtMeasure(wk/p.mg,p.m)+')':''}</li>`:''}${p.n.includes(':')?`<li>${esc(cap(p.n.split(':')[1].trim()))}</li>`:''}<li>Покупать: ${esc(p.bulk)}</li>${id==='protein'?'<li>В GO! обычно нет</li>':''}</ul></li>`});
  h+=`</ul></details>`;
  // список
  const priceLi=(id,c)=>`<li>≈ <button class="link pr" data-a="price" data-p="${id}" aria-label="Цена: ${esc(nameOf(PR[id]))}">${vnd(c)}</button> <span>(${vnd(priceOf(id))} ${priceUnit(id)}${(S.price||{})[id]!=null?', из чека':''})</span></li>`;
  const row=(id,on,name,qty,notes)=>`<li class="srow ${on?'bought':''}"><button class="cb ${on?'on':''} ${popKey==='s_'+id?'pop':''}" data-a="chk" data-p="${id}" aria-pressed="${on}" aria-label="Куплено: ${esc(name)}">${on?'✓':''}</button><div class="grow"><div class="rt"><span class="nm">${esc(name)}</span><b class="q">${qty}</b></div>${notes}</div></li>`;
  if(items.length)h+=`<button class="btn pri wide2" data-a="shopmode">🛒 Режим «В магазине»</button>`;
  h+=`<section class="card"><h3>Список${items.length?`: куплено ${nOn} из ${items.length}`:''}</h3>${items.length?`<div class="prog"><i style="width:${nOn/items.length*100}%"></i></div>`:''}`;
  if(!items.length)h+='<p class="small muted">Докупать нечего.</p>';
  SECS.forEach(([sec,title])=>{const rs=L.rows.filter(r=>r.buy>0&&r.p.sec===sec);if(!rs.length)return;
    h+=`<div class="cat">${title}</div><ul class="list">${rs.map(r=>{const p=r.p,n=[];
      n.push(`<li>На ценнике: <b>${esc(p.vi)}</b></li>`);
      if(p.m==='palm'&&!S.grams)n.push(`<li>≈ ${fmtMeasure(r.buy/p.mg,'palm')}</li>`);
      if(p.pk)n.push(`<li>${esc(p.pk)}</li>`);
      if(r.home)n.push(`<li>Дома к вторнику ≈ ${leftText(p,r.home)}, уже вычтено</li>`);
      n.push(priceLi(r.id,costOf(r.id,r.buy)));
      let extra='';if(r.id==='veg'){const each=Math.round(r.buy/VEGMIX.length/100)*100;extra=`<ul class="il sm">${VEGMIX.map(([v,ru])=>`<li><span>${esc(cap(ru))} <i>${esc(v)}</i></span><b>~${fq(each,'г')}</b></li>`).join('')}</ul><ul class="notes"><li>Можно менять на то, что свежее</li></ul>`}
      return row(r.id,!!C[r.id],nameOf(p),r.p.u==='шт'&&r.p.shop===10?r.buy+' шт':fq(r.buy,p.u),`<ul class="notes">${n.join('')}</ul>${extra}`)}).join('')}</ul>`});
  if(L.bulk.length)h+=`<div class="cat">Крупы, орехи, масло, специи</div><ul class="list">${L.bulk.map(id=>{const p=PR[id];return row(id,!!C[id],nameOf(p).replace(/:.*$/,''),esc(p.bulk),`<ul class="notes"><li>На ценнике: <b>${esc(p.vi)}</b></li>${p.pk?`<li>${esc(p.pk)}</li>`:''}${priceLi(id,costOf(id))}</ul>`)}).join('')}</ul>`;
  if(items.length){const T=shopCost(L),over=T.go>1000000;h+=`<div class="tot"><div class="tl1"><span>Примерно в GO!</span><b class="${over?'flag':''}">${vnd(T.go)}</b></div><div class="small muted">Бюджет 600 000–1 000 000 ₫${T.sp?` · спортпит отдельно ≈ ${vnd(T.sp)}`:''}. Цены примерные — нажми на цену у продукта и впиши из чека.</div></div>`}
  if(nOn)h+=`<div class="btns"><button class="btn ghost" data-a="chkreset">Снять все галочки</button></div>`;
  h+=`</section><section class="card small"><h3>В GO!</h3><ul class="notes"><li>Список идёт примерно по залу: овощи и фрукты, мясо, рыба, яйца и тофу, потом крупы и специи</li><li>Если нужного нет: бёдра ↔ филе, рыба ↔ креветки, свинина ↔ курица</li></ul></section><section class="card small"><h3>После закупки</h3><ul class="notes"><li>Мясо и рыбу на Чт–Пн разложи по пакетам порциями и убери в морозилку</li><li>На Вт и Ср — в холодильник</li><li>Что разморозить на завтра, приложение напомнит вечером</li></ul></section>`;
  return h;
}
const kg=v=>String(Math.round(v*10)/10).replace('.',',');
function spark(pts,target){
  const W=300,H=90,pd=8,vs=pts.map(p=>p.v).concat([target]);let mn=Math.min(...vs),mx=Math.max(...vs);if(mx-mn<1){mx+=.5;mn-=.5}
  const x=i=>pd+(pts.length<2?0:i*(W-2*pd)/(pts.length-1)),y=v=>pd+(mx-v)*(H-2*pd)/(mx-mn);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="График веса"><line x1="0" x2="${W}" y1="${y(target).toFixed(1)}" y2="${y(target).toFixed(1)}" class="tg"/><polyline points="${pts.map((p,i)=>x(i).toFixed(1)+','+y(p.v).toFixed(1)).join(' ')}" class="ln"/>${pts.map((p,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="3.5" class="pt"/>`).join('')}</svg><div class="small muted spk"><span>${fmtDate(pkey(pts[0].d))}</span><span>пунктир — цель 82,5</span><span>${fmtDate(pkey(pts[pts.length-1].d))}</span></div>`}
function calCard(){
  const cs=(S.cal||[]).slice().sort((a,b)=>a.d<b.d?-1:1),l=cs[cs.length-1],p=cs[cs.length-2],days=l?Math.round((appNow()-pkey(l.d))/864e5):99;
  return `<div class="big2">${l?String(l.b).replace('.',',')+' <span>ед. живот</span>':'<span>пока нет замеров</span>'}</div>
  <div class="small muted">${l?`Цель 12–13 ед.${l.b>13?', осталось '+String(Math.round((l.b-13)*10)/10).replace('.',',')+' ед.':' — достигнута'}.${p?' С прошлого замера '+(l.b-p.b>0?'+':'')+String(Math.round((l.b-p.b)*10)/10).replace('.',',')+' ед.':''}${l.s?' Бок: '+String(l.s).replace('.',',')+' ед.':''}`:'Раз в 2 недели в пятницу, утром, в одной и той же точке.'}</div>
  ${cs.length>1?spark(cs.slice(-10).map(x=>({d:x.d,v:x.b})),13).replace('цель 82,5','цель 13 ед.'):''}
  <div class="addrow" style="margin-top:10px"><input id="c-b" inputmode="decimal" placeholder="Живот, ед." aria-label="Живот, ед."><input id="c-s" inputmode="decimal" placeholder="Бок, ед." aria-label="Бок, ед."><button class="btn pri" data-a="csave">OK</button></div>
  <div class="small muted" style="margin-top:6px">${days>=13?'<span class="flag">Пора сделать замер.</span> ':'Следующий замер через '+(14-days)+' дн. '}<a class="link" href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('📏 Калипер: живот и бок')}&dates=${calStart()}&recur=${encodeURIComponent('RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=FR')}&details=${encodeURIComponent('Замер утром натощак, записать в «Рацион» → Ещё.')}" target="_blank" rel="noopener">Напоминание раз в 2 недели</a></div>
  ${cs.length?`<details style="margin-top:6px"><summary class="small muted">История замеров</summary><ul class="list">${cs.slice().reverse().slice(0,10).map(x=>`<li><div class="grow">${fmtDate(pkey(x.d))}</div><b>${String(x.b).replace('.',',')}${x.s?' / '+String(x.s).replace('.',','):''} ед.</b><button class="link" data-a="cdel" data-v="${x.d}">Удалить</button></li>`).join('')}</ul></details>`:''}`}
function calStart(){const t=new Date();let d=addDays(t,((4-wd(t)+7)%7)||7);const f=x=>x.getFullYear()+pad(x.getMonth()+1)+pad(x.getDate());return f(d)+'T090000/'+f(d)+'T091500'}
function goalCard(){const ws=S.w.slice().sort((a,b)=>a.d<b.d?-1:1),l=ws[ws.length-1];if(!l||l.w>82.5)return '';
  const c=(S.cal||[]).slice().sort((a,b)=>a.d<b.d?-1:1).pop();
  return `<section class="card ok"><h3>Цель по весу достигнута 🎯</h3><ul class="notes"><li>Дальше главный ориентир — калипер на животе: 12–13 ед.</li>${!c?'<li>Сделай замер калипером — от него зависит следующий шаг</li>':c.b>13?`<li>Живот ${String(c.b).replace('.',',')} ед. — ещё выше цели. Оставляем норму 1900–2000 ккал: вес почти не будет меняться, а жир — уходить, если держать белок и тренировки</li>`:'<li>Живот в цели — можно переходить на поддержание, около 2200 ккал</li>'}<li>Норму сам не меняю: напиши мне в проекте «Рацион», и я пересчитаю меню</li></ul></section>`}
function backupAge(){return S.lastBackup?Math.round((Date.now()-S.lastBackup)/864e5):999}
function vWeight(){
  const ws=S.w.slice().sort((a,b)=>a.d<b.d?-1:1),l=ws[ws.length-1],p=ws[ws.length-2],d=l&&p?Math.round((l.w-p.w)*10)/10:null;
  const t=new Date(),nextFri=addDays(t,((4-wd(t)+7)%7)||7),sa=matchMedia('(display-mode: standalone)').matches;
  const sec=(id,title,right,body)=>`<details class="card" id="mo-${id}" ${moreOpen[id]?'open':''}><summary><b>${title}</b><span class="muted small">${right}</span></summary>${body}</details>`;
  return `<header class="top"><h1>Ещё</h1><div class="date">вес, калипер, напоминания, настройки</div></header>
  ${goalCard()}
  ${sec('w','Вес',l?kg(l.w)+' кг':'нет записей',`<div class="big2">${l?kg(l.w)+' <span>кг</span>':'<span>пока нет записей</span>'}</div>
  <div class="small muted">${l?`Цель 82,5 кг${l.w>82.5?', осталось '+kg(l.w-82.5)+' кг':', цель достигнута'}.${d!==null?' С прошлого раза '+(d>0?'+':'')+kg(d)+' кг.':''}`:'Взвешивайся утром натощак, после туалета, до еды и воды.'}</div>
  ${ws.length>1?spark(ws.slice(-12).map(x=>({d:x.d,v:x.w})),82.5):''}
  <div class="addrow" style="margin-top:10px"><input id="w-in" inputmode="decimal" placeholder="Вес, кг" aria-label="Вес, кг"><button class="btn pri" data-a="wsave">Записать</button></div>
  <div class="small muted" style="margin-top:6px">${wd(t)===4?'Сегодня пятница.':'Следующее взвешивание: пятница, '+fmtDate(nextFri)+'.'} <a class="link" href="${gcal('⚖️ Взвешивание натощак',4,'09:05','Взвесься до еды и воды и запиши вес в «Рационе».')}" target="_blank" rel="noopener">Напоминание</a></div>
  ${ws.length?`<details style="margin-top:6px"><summary class="small muted">История веса</summary><ul class="list">${ws.slice().reverse().slice(0,12).map(x=>`<li><div class="grow">${fmtDate(pkey(x.d))}</div><b>${kg(x.w)} кг</b><button class="link" data-a="wdel" data-v="${x.d}">Удалить</button></li>`).join('')}</ul></details>`:''}`)}
  ${sec('c','Калипер',((S.cal||[]).length?String(S.cal.slice().sort((a,b)=>a.d<b.d?-1:1).pop().b).replace('.',',')+' ед.':'нет замеров'),calCard())}
  ${sec('s','Итог недели','',summaryCard().replace('<section class="card sum"><h3>Итог недели</h3>','<div class="sum">').replace(/<\/section>$/,'</div>'))}
  ${sec('r','Напоминания на телефон','7 приёмов',`<ul class="notes"><li>Нажми на приём — откроется Google Календарь с повторяющимся событием</li><li>Перед «Сохранить» нажми <b>Уведомление → за 30 минут</b> (для протеина и перекуса — «во время события»)</li><li>Samsung Календарь показывает события Google-аккаунта — напоминание придёт как обычное</li></ul>
  <ul class="list rem">${REM.map(([t,time,days,lbl,cook])=>`<li><div class="grow"><div class="nm">${cook?'🍳':'🍽'} ${t} · ${time}</div><div class="sub">${lbl}</div></div><a class="btn sm" href="${gcal((cook?'🍳 ':'🍽 ')+t+' — открой Рацион',days,time,(cook?'Через 30 минут '+t.toLowerCase()+' — начинай готовить. ':'')+'Что есть и сколько — в приложении «Рацион».')}" target="_blank" rel="noopener">Добавить</a></li>`).join('')}</ul>
  <p class="small muted" style="margin-bottom:0">Нет уведомлений? Настройки телефона → Приложения → Календарь → Батарея → «Без ограничений», и проверь, что уведомления Календаря включены.</p>`)}
  ${sec('b','Копия данных',S.lastBackup?(backupAge()>30?'<span class="flag">пора сохранить</span>':'сохранена '+fmtDate(new Date(S.lastBackup))):'ещё не делал',`<div class="small muted">Вес, калипер, отметки и правки меню хранятся только в Chrome на этом телефоне. Раз в месяц сохраняй копию — файл попадёт в «Загрузки». При смене телефона или очистке браузера загрузи её обратно.</div>
  <div class="btns"><button class="btn pri" data-a="bsave">Сохранить копию</button><label class="btn" for="bload">Загрузить копию</label><input id="bload" type="file" accept=".json,application/json" hidden data-in="bload"></div>`)}
  ${sec('o','Настройки','',`<div class="ph">Порции</div><div class="tog" style="width:max-content"><button data-a="grams" data-v="0" class="${S.grams?'':'on'}">Ладони и чашки</button><button data-a="grams" data-v="1" class="${S.grams?'on':''}">Граммы</button></div>
  <div class="small muted" style="margin-top:14px">Рацион ${APP_VERSION} · работает без интернета.<br>${sa?'':'Установить: Chrome → ⋮ → «Установить приложение». '}<button class="link" data-a="updcheck">Проверить обновление</button></div>`)}`;
}

/* ===== Действия ===== */
function parseNum(v){const n=Number(String(v).trim().replace(',','.'));return isFinite(n)?n:0}
const A={
  tab:d=>{if(shopMode&&d.v!=='shop'){shopMode=false;try{wakeLock&&wakeLock.release()}catch(_){}wakeLock=null}tab=d.v;if(tab==='today')viewDate=dkey(appNow());window._openLeft=false;window.scrollTo&&window.scrollTo(0,0)},
  pick:d=>{viewDate=d.v;xOpen=''},
  cyc:d=>{xOpen='';viewDate=dkey(addDays(cycleStart(pkey(viewDate)),Number(d.v)))},
  eat:d=>{const k=dk_(viewDate,d.s);if(S.done[k])delete S.done[k];else{S.done[k]=1;if(S.skip)delete S.skip[k];popKey=k;buzz()}
    const cut=dkey(addDays(appNow(),-30));Object.keys(S.done).forEach(x=>{if(x<cut)delete S.done[x]});save()},
  goleft:()=>{tab='shop';window._openLeft=true},
  left:d=>{const p=PR[d.p],e=homeEntry(d.p,dkey(shopCycle())),cur=(e&&e.q)||0,q=Math.max(0,Math.round((cur+Number(d.v)*leftStep(p))*10)/10);
    setHome(d.p,q);window._openLeft=true;clean();save()},
  useup:d=>{const id=d.p,cs=shopCycle(),r=shopList().rows.find(x=>x.id===id);let left=r?r.home:0,n=0;S.swaps=S.swaps||{};
    for(let i=0;i<7&&left>0;i++){const day=addDays(cs,i),slot=i%2?'dinner':'lunch',k=dkey(day)+'|'+slot;if(S.swaps[k]||(S.edits||{})[k]||(S.rec||{})[k])continue;
      const m=dayPlan(day).meals.find(x=>x.slot===slot),main=m&&m.items.find(x=>SWAPP.includes(x.p));if(!main||main.p===id)continue;
      const q=swapQ(main.p,main.q,id);if(q>left)continue;S.swaps[k]={from:main.p,to:id};left-=q;n++}
    save();toast(n?'Подставлено в '+n+' '+plural(n,['приём','приёма','приёмов'])+' — смотри «Меню» на следующую неделю':'Некуда подставить')},
  price:d=>{const id=d.p,v=prompt(nameOf(PR[id]).replace(/:.*$/,'')+': цена '+priceUnit(id)+', ₫ (из чека). Пусто — вернуть примерную',String(priceOf(id)));if(v===null)return true;
    const n=Math.round(Number(String(v).replace(/[\s.,₫]/g,'')))||0;S.price=S.price||{};if(!n)delete S.price[id];else S.price[id]=n;save();toast(n?'Цена сохранена: '+vnd(n)+' '+priceUnit(id):'Вернул примерную цену')},
  bulk:d=>{if(d.v==='1')S.stock[d.p]=1;else delete S.stock[d.p];window._openBulk=true;save()},
  chk:d=>{const ck=dkey(shopCycle()),C=S.chk[ck]=S.chk[ck]||{},bk=BULK.includes(d.p);if(C[d.p]){delete C[d.p];if(bk)S.stock[d.p]=1}else{C[d.p]=1;if(bk)delete S.stock[d.p];popKey='s_'+d.p;buzz()}clean();save()},
  chkreset:()=>{if(!confirm('Снять все галочки?'))return true;delete S.chk[dkey(shopCycle())];save()},
  wsave:()=>{const v=parseNum(document.getElementById('w-in').value);if(v<30||v>250){toast('Введи вес в кг, например 83,4');return true}
    const k=dkey(new Date());S.w=S.w.filter(x=>x.d!==k);S.w.push({d:k,w:Math.round(v*10)/10});save();toast('Вес записан: '+kg(v)+' кг')},
  wdel:d=>{if(!confirm('Удалить запись за '+fmtDate(pkey(d.v))+'?'))return true;S.w=S.w.filter(x=>x.d!==d.v);save()},
  grams:d=>{S.grams=d.v==null?!S.grams:d.v==='1';save();toast(S.grams?'Порции в граммах':'Порции в ладонях и чашках')},
  swapall:()=>{swapAll=!swapAll},
  shopmode:async()=>{shopMode=!shopMode;window.scrollTo&&window.scrollTo(0,0);
    try{if(shopMode&&navigator.wakeLock)wakeLock=await navigator.wakeLock.request('screen');else if(wakeLock){wakeLock.release();wakeLock=null}}catch(_){}render();return true},
  csave:()=>{const b=parseNum(document.getElementById('c-b').value),sd=parseNum(document.getElementById('c-s').value);if(!(b>0&&b<100)){toast('Впиши число с калипера, например 15');return true}
    const k=dkey(new Date());S.cal=(S.cal||[]).filter(x=>x.d!==k);S.cal.push({d:k,b:Math.round(b*10)/10,s:sd>0&&sd<100?Math.round(sd*10)/10:null});moreOpen.c=true;save();toast('Замер записан')},
  cdel:d=>{if(!confirm('Удалить замер?'))return true;S.cal=(S.cal||[]).filter(x=>x.d!==d.v);save()},
  bsave:()=>{S.lastBackup=Date.now();save();const b=new Blob([JSON.stringify(S)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='racion-kopiya-'+dkey(new Date())+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);moreOpen.b=true;toast('Копия сохранена в «Загрузки»')},
  xpand:d=>{if(openDone.has(d.v))openDone.delete(d.v);else openDone.add(d.v)},
  skip:d=>{const k=dk_(viewDate,d.s);S.skip=S.skip||{};if(S.skip[k])delete S.skip[k];else{S.skip[k]=1;delete S.done[k]}save()},
  editopen:d=>{const k=(d.d||viewDate)+'|'+d.s;editOpen=editOpen===k?'':k;ED=null;swapAll=false},
  editundo:d=>{const dk=d.d||viewDate;delete S.edits[dk+'|'+d.s];ED=null;save();toast('Граммы как по плану')},
  edq:d=>{const it=ED.items[+d.i],p=PR[it[0]];it[1]=Math.max(0,Math.round((it[1]+Number(d.v)*stepOf(p))*10)/10)},
  edsave:d=>{const dk=d.d||viewDate,k=dk+'|'+d.s;if(!guard(dk))return true;S.edits=S.edits||{};S.edits[k]=ED.items.filter(x=>x[1]>0);ED=null;cleanOld();save();toast('Приём изменён')},
  meth:d=>{const k=(d.d||viewDate)+'|'+d.s;S.meth=S.meth||{};if(d.v==='pan')delete S.meth[k];else S.meth[k]=d.v;save()},
  dswap:d=>{const dk=d.d||viewDate,k=dk+'|'+d.s;if(!guard(dk))return true;S.dswap=S.dswap||{};const old=S.dswap[k];
    if(old){delete S.dswap[k];if(S.dswap[old+'|'+d.s]===dk)delete S.dswap[old+'|'+d.s]}
    if(d.v){const k2=d.v+'|'+d.s,o2=S.dswap[k2];if(o2){delete S.dswap[k2];if(S.dswap[o2+'|'+d.s]===d.v)delete S.dswap[o2+'|'+d.s]}S.dswap[k]=d.v;S.dswap[k2]=dk;delete S.edits[k];delete S.edits[k2];delete S.rec[k];delete S.rec[k2];toast(SLOTS[d.s]+': '+DAYS[wd(pkey(dk))]+' ⇄ '+DAYS[wd(pkey(d.v))])}
    ED=null;save()},
  swapdo:d=>{const dk=d.d||viewDate;if(!guard(dk))return true;
    if(swapAll){const m=dayPlan(pkey(dk)).meals.find(x=>x.slot===d.s),cur=m.items.find(i=>SWAPP.includes(i.p)),ck=dkey(cycleStart(pkey(dk)));
      const W=S.wswaps[ck]=S.wswaps[ck]||{},from=m.wswap&&m.wswap.to===cur.p?m.wswap.from:cur.p;delete S.swaps[dk+'|'+d.s];
      if(d.v===from)delete W[from];else W[from]=d.v;Object.keys(W).forEach(k=>{if(W[k]===k)delete W[k]});
      swapAll=false;ED=null;save();toast(PR[from].s+' → '+PR[d.v].s+' во всех днях недели');return}
    const m=dayPlan(pkey(dk)).meals.find(x=>x.slot===d.s),k=dk+'|'+d.s,old=S.swaps[k];
    const cur=m.items.find(i=>SWAPP.includes(i.p));const from=old?old.from:cur.p;
    if(d.v===from)delete S.swaps[k];else S.swaps[k]={from,to:d.v};delete S.edits[k];ED=null;cleanOld();save();toast('Заменено: '+PR[d.v].s)},
  swapundo:d=>{delete S.swaps[(d.d||viewDate)+'|'+d.s];ED=null;save();toast('Вернул как было')},
  wswapundo:d=>{const ck=dkey(cycleStart(pkey(d.d||viewDate))),W=S.wswaps[ck]||{};delete W[d.v];if(!Object.keys(W).length)delete S.wswaps[ck];ED=null;save();toast('Вернул как было на всю неделю')},
  gomenu:()=>{tab='menu';menuWeek=1;editOpen='';window.scrollTo&&window.scrollTo(0,0)},
  mweek:d=>{menuWeek=+d.v;editOpen=''},
  wmenu:d=>{const ck=dkey(menuCs());if(!guard(ck))return true;S.wmenu=S.wmenu||{};const base=pkey(ck)<EPOCH?-1:cycleIdx(pkey(ck));if(+d.v===base)delete S.wmenu[ck];else S.wmenu[ck]=+d.v;save();toast('Неделя: '+menuName(pkey(ck)))},
  varied:()=>{const cs=menuCs();if(!guard(dkey(cs)))return true;let n=0;S.rec=S.rec||{};const ds=[0,1,2,3,4,5,6].map(i=>dkey(addDays(cs,i))),used=new Set(Object.entries(S.rec).filter(([k])=>ds.includes(k.split('|')[0])).map(([,v])=>v)),dayUsed=new Set();
    ['lunch','dinner'].forEach(slot=>{const pool=RECIPES.filter(r=>r[2].includes(slot));let c=0;
      for(let i=1;i<7&&c<2;i+=2){const d=addDays(cs,(i+(slot==='dinner'?1:0))%7),dk=dkey(d);if(dayUsed.has(dk))continue;const m=dayPlan(d).meals.find(x=>x.slot===slot);if(!m||m.rec||m.edited)continue;
        const base=macros(m.items).k,r=pool.filter(r=>!used.has(r[0])).sort((a,b)=>Math.abs(macros(a[3].map(([p,q])=>({p,q}))).k-base)-Math.abs(macros(b[3].map(([p,q])=>({p,q}))).k-base))[0];
        if(r){S.rec[dk+'|'+slot]=r[0];used.add(r[0]);dayUsed.add(dk);c++;n++}}});
    save();toast(n?'Добавлено блюд: '+n:'Подходящих мест не нашлось')},
  wreset:()=>{const cs=menuCs();if(!confirm('Сбросить все правки этой недели?'))return true;const ds=[0,1,2,3,4,5,6].map(i=>dkey(addDays(cs,i)));
    ['edits','swaps','rec','meth','dswap'].forEach(n=>Object.keys(S[n]||{}).forEach(k=>{if(ds.includes(k.split('|')[0]))delete S[n][k]}));delete S.wswaps[dkey(cs)];if(S.wmenu)delete S.wmenu[dkey(cs)];save();toast('Неделя как по плану')},
  review:()=>{S.reviewed=S.reviewed||{};S.reviewed[dkey(menuCs())]=1;save();toast('Меню на неделю проверено')},
  xopen:d=>{if(xOpen===d.s){xOpen='';return}const m=dayPlan(pkey(viewDate)).meals.find(x=>x.slot===d.s);xOpen=d.s;X={n:'',k:'',p:'',f:'',c:'',por:'1',line:'',s:d.s,t:m?m.time:''}},
  xclose:()=>{xOpen=''},
  qadj:d=>{const dk=d.d||viewDate,m=dayPlan(pkey(dk)).meals.find(x=>x.slot===d.s);if(!m)return true;
    const its=m.items.map(i=>[i.p,i.q]),it=its[+d.i];if(!it)return true;const st=stepOf(PR[it[0]]);
    it[1]=Math.max(st,Math.round((it[1]+Number(d.v)*st)*10)/10);S.edits=S.edits||{};S.edits[dk+'|'+d.s]=its;ED=null;cleanOld();save()},
  cooked:()=>{S.cooked=!S.cooked;save();toast(S.cooked?'В скобках — вес в готовом виде':'Вес в сыром и сухом виде')},
  xclip:async()=>{try{X.line=await navigator.clipboard.readText()||'';X.more=true;render()}catch(_){toast('Нет доступа к буферу — вставь долгим нажатием')}return true},
  xsave:()=>{const L=S.extra[viewDate]=S.extra[viewDate]||[],now=viewDate===dkey(appNow())?pad(new Date().getHours())+':'+pad(new Date().getMinutes()):'13:00';let n=0;
    const lines=parseLines(X.line);
    lines.forEach(x=>{if(x.plan){S.done[dk_(viewDate,x.plan)]=1;n++;return}L.push({id:Date.now().toString(36)+n,n:x.n,k:x.k,p:x.p,f:x.f,c:x.c,t:x.t||X.t||now,s:X.s});n++});
    if(!lines.length){const por=parseNum(X.por)||1,k=parseNum(X.k);if(!X.n.trim()||!k){toast('Нужны название и калории');return true}
      L.push({id:Date.now().toString(36),n:X.n.trim()+(por!==1?' ×'+String(por).replace('.',','):''),k:r0(k*por),p:r0(parseNum(X.p)*por),f:r0(parseNum(X.f)*por),c:r0(parseNum(X.c)*por),t:X.t||now,s:X.s});n=1}
    if(!L.length)delete S.extra[viewDate];xOpen='';cleanOld();save();toast('Добавлено: '+n)},
  xdel:d=>{const L=(S.extra[viewDate]||[]).filter(x=>x.id!==d.id);if(L.length)S.extra[viewDate]=L;else delete S.extra[viewDate];save()},
  upd:()=>{doUpdate();return true},
  updcheck:()=>{checkUpdate(true);return true}
};
function buzz(){try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}}
function cleanOld(){const cut=dkey(addDays(appNow(),-60));['skip','edits','rec','meth','dswap'].forEach(n=>Object.keys(S[n]||{}).forEach(k=>{if(k<cut)delete S[n][k]}));Object.keys(S.swaps).forEach(k=>{if(k<cut)delete S.swaps[k]});Object.keys(S.extra).forEach(k=>{if(k<cut)delete S.extra[k]})}
function clean(){const keep=dkey(addDays(shopCycle(),-14));['left','bulk','chk'].forEach(n=>Object.keys(S[n]).forEach(k=>{if(k<keep)delete S[n][k]}))}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]');if(!el)return;const fn=A[el.dataset.a];if(!fn)return;
  const r=fn(el.dataset,el,e);if(r!==true)render();
});
let tsx=0,tsy=0,tsok=false;
document.addEventListener('touchstart',e=>{if(tab!=='today'||e.touches.length!==1){tsok=false;return}const t=e.target;tsok=!t.closest('input,select,textarea,.mpanel,.picks,.strip,.weeknav,details');tsx=e.touches[0].clientX;tsy=e.touches[0].clientY},{passive:true});
document.addEventListener('touchend',e=>{if(!tsok)return;tsok=false;const t=e.changedTouches[0],dx=t.clientX-tsx,dy=t.clientY-tsy;
  if(Math.abs(dx)>70&&Math.abs(dy)<Math.abs(dx)*0.5){viewDate=dkey(addDays(pkey(viewDate),dx<0?1:-1));editOpen='';xOpen='';const app=document.getElementById('app');app.classList.remove('sl','sr');render();void app.offsetWidth;app.classList.add(dx<0?'sl':'sr')}},{passive:true});
document.addEventListener('toggle',e=>{if(e.target.id&&e.target.id.startsWith('mo-'))moreOpen[e.target.id.slice(3)]=e.target.open;if(e.target.id==='wkbox')window._openWk=e.target.open;if(e.target.id==='xmore')X.more=e.target.open;if(e.target.id==='leftbox')window._openLeft=e.target.open;if(e.target.id==='bulkbox')window._openBulk=e.target.open},true);
document.addEventListener('input',e=>{const el=e.target,k=el.dataset&&el.dataset.in;if(k==='xf')X[el.dataset.k]=el.value;
  if(k==='recsel'){const dk=el.dataset.d,key=dk+'|'+el.dataset.s;if(!guard(dk)){render();return}S.rec=S.rec||{};if(el.value)S.rec[key]=el.value;else delete S.rec[key];delete S.edits[key];delete S.swaps[key];ED=null;save();render();toast(el.value?'Блюдо: '+RECBY[el.value][1]:'По плану')}
  if(k==='edg'&&ED){ED.items[+el.dataset.i][1]=Math.max(0,parseNum(el.value))}
  if(k==='edadd'&&ED&&el.value){const p=PR[el.value];ED.items.push([el.value,p.u==='шт'?1:(el.value==='oil'?5:el.value==='protein'?30:100)]);render()}
  if(k==='xpre'&&el.value!==''){const p=PRESETS[+el.value];Object.assign(X,{n:p[0]+' ('+p[1]+')',k:String(p[2]),p:String(p[3]),f:String(p[4]),c:String(p[5])});render()}});
document.addEventListener('change',e=>{const el=e.target;
  if(el.dataset&&el.dataset.in==='bload'){const f=el.files&&el.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x||typeof x!=='object'||!('done' in x))throw 0;if(!confirm('Заменить текущие данные копией?'))return;S=Object.assign(def(),x);save();render();toast('Копия загружена')}catch(_){toast('Это не копия «Рациона»')}};r.readAsText(f);return}if(el.dataset&&el.dataset.in==='edg'){render();return}if(el.dataset&&el.dataset.in==='leftg'){setHome(el.dataset.p,Math.max(0,Math.round(parseNum(el.value))));window._openLeft=true;clean();save();render()}
  if(el.dataset&&el.dataset.in==='leftadd'&&el.value){const p=PR[el.value];setHome(el.value,p.u==='шт'?1:p.shop||100);window._openLeft=true;save();render();toast('Добавлено: '+p.s+' — поправь количество')}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='w-in'){A.wsave();render()}});

/* ===== Офлайн и обновления ===== */
async function checkUpdate(manual){
  if(!navigator.onLine){if(manual)toast('Нет интернета');return}
  try{const r=await fetch('index.html?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const m=(await r.text()).match(/APP_VERSION='([^']+)'/);
    if(m&&m[1]!==APP_VERSION){updReady=true;render();if(manual)toast('Есть версия '+m[1])}else if(manual)toast('У тебя последняя версия')}catch(_){if(manual)toast('Не получилось проверить')}
}
async function doUpdate(){
  try{const r=await fetch('index.html?v='+Date.now(),{cache:'no-store'});if(r.ok&&window.caches){for(const k of await caches.keys()){const c=await caches.open(k);await c.put(new URL('index.html',location.href).href,r.clone())}}}catch(_){}
  try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg)await reg.update()}catch(_){}
  location.reload();
}
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(shopMode&&navigator.wakeLock)navigator.wakeLock.request('screen').then(w=>wakeLock=w).catch(()=>{});if(tab==='today')viewDate=dkey(appNow());if(!document.activeElement.matches('input'))render()}});
setInterval(()=>{if(tab==='today'&&!document.activeElement.matches('input'))render()},60000);
setTimeout(()=>checkUpdate(false),2000);
render();
