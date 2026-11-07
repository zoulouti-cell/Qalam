import type { Lang } from './i18n'
import { ARTICLES, type Article, type ArticleContent } from './data'

// Large encyclopedia packs are fetched from /data at runtime to keep the first screen light.
export const WIKI_ARTICLES: Article[] = []

/** Bilingual collection pack — loaded at runtime from /data/collectionFr.json (kept out of the bundle). */
export const COLLECTION_FR: Article[] = []


export type Level = 'kids' | 'school'

export const LEVELS: { id: Level; icon: string }[] = [
  { id: 'school', icon: 'menu_book' },
  { id: 'kids', icon: 'child_care' },
]

export function levelKey(l: Level): string {
  return { kids: 'levelKids', school: 'levelSchool' }[l]
}

export function levelLabel(l: Level, lang: Lang): string {
  const map: Record<Level, string> = {
    kids: 'levelKids',
    school: 'levelSchool',
  }
  // localized via i18n t() at call site: we return the key
  return map[l] + (lang === 'ar' ? '' : '')
}

/* ---------- simplified content for kids (existing articles) ---------- */

export const KIDS: Record<string, Record<Lang, ArticleContent>> = {
  sun: {
    ar: {
      title: 'الشمس صديقتنا الكبيرة',
      summary: 'نجمة كبيرة تعطينا الضوء والدفء كل يوم!',
      body: [
        'الشمس نجمة كبيرة جداً تلمع في السماء! تعطينا الضوء في النهار والدفء في الشتاء.',
        'هي بعيدة عنا كثيراً، لكن ضوءها يصل إلينا بسرعة. بفضلها تنمو النباتات ونلعب في الخارج.',
        'انتبه! لا تنظر إلى الشمس مباشرة حتى لا تؤذي عينيك.',
      ],
    },
    fr: {
      title: 'Le Soleil, notre grande amie',
      summary: 'Une grande étoile qui nous donne lumière et chaleur chaque jour !',
      body: [
        'Le Soleil est une très grande étoile qui brille dans le ciel ! Il nous donne la lumière le jour et la chaleur en hiver.',
        'Il est très loin de nous, mais sa lumière arrive vite. Grâce à lui, les plantes poussent et nous jouons dehors.',
        'Attention ! Ne regarde jamais le Soleil en face, cela peut faire mal aux yeux.',
      ],
    },
    en: {
      title: 'The Sun, our big friend',
      summary: 'A huge star that gives us light and warmth every day!',
      body: [
        'The Sun is a very big star shining in the sky! It gives us light in the daytime and warmth in winter.',
        'It is very far away, but its light reaches us quickly. Thanks to it, plants grow and we play outside.',
        'Careful! Never look straight at the Sun — it can hurt your eyes.',
      ],
    },
  },
  water: {
    ar: {
      title: 'الماء، سر الحياة',
      summary: 'نشربه كل يوم، وهو في كل مكان حولنا!',
      body: [
        'الماء سائل شفاف نشربه كل يوم. تسبح فيه الأسماك وتنمو به النباتات.',
        'يوجد الماء في البحار والأنهار، وينزل من السماء مطراً!',
        'لا تنسَ إغلاق الصنبور جيداً حتى لا نهدر الماء.',
      ],
    },
    fr: {
      title: "L'eau, le secret de la vie",
      summary: 'Nous la buvons chaque jour, elle est partout autour de nous !',
      body: [
        "L'eau est un liquide transparent que nous buvons chaque jour. Les poissons y nagent et les plantes poussent grâce à elle.",
        "On trouve l'eau dans les mers et les rivières, et elle tombe du ciel en pluie !",
        "N'oublie pas de bien fermer le robinet pour ne pas gaspiller l'eau.",
      ],
    },
    en: {
      title: 'Water, the secret of life',
      summary: 'We drink it every day — it is all around us!',
      body: [
        'Water is a clear liquid we drink every day. Fish swim in it and plants grow with it.',
        'Water is in seas and rivers, and it falls from the sky as rain!',
        'Do not forget to close the tap properly so we do not waste water.',
      ],
    },
  },
  pyramids: {
    ar: {
      title: 'أهرامات العمالقة',
      summary: 'جبال حجرية بناها الناس قبل آلاف السنين!',
      body: [
        'الأهرامات مبانٍ ضخمة على شكل مثلث، بناها المصريون القدماء قبل أكثر من 4500 سنة!',
        'بنوها من آلاف الكتل الحجرية الثقيلة لتكون بيوتاً أبدية لملوكهم.',
        'ما زالت واقفة حتى اليوم، ويزورها الناس من كل العالم!',
      ],
    },
    fr: {
      title: 'Les pyramides des géants',
      summary: 'Des montagnes de pierre construites par les hommes il y a des milliers d’années !',
      body: [
        "Les pyramides sont d'immenses bâtiments en forme de triangle, construits par les anciens Égyptiens il y a plus de 4 500 ans !",
        "Ils les ont bâties avec des milliers de blocs de pierre lourds, pour être les maisons éternelles de leurs rois.",
        'Elles sont encore debout aujourd’hui, et des gens du monde entier viennent les voir !',
      ],
    },
    en: {
      title: 'The pyramids of the giants',
      summary: 'Mountains of stone built by people thousands of years ago!',
      body: [
        'The pyramids are huge triangle-shaped buildings, built by the ancient Egyptians more than 4,500 years ago!',
        'They built them with thousands of heavy stone blocks, to be the eternal homes of their kings.',
        'They still stand today, and people from all over the world come to see them!',
      ],
    },
  },
  heart: {
    ar: {
      title: 'قلبك الطبل الصغير',
      summary: 'عضلة تعمل كل ثانية دون توقف!',
      body: [
        'قلبك عضلة صغيرة بحجم قبضة يدك، تنبض كل ثانية: دقّ دقّ دقّ!',
        'يضخ الدم الأحمر في جسمك كله ليحملك القوة والطاقة.',
        'عندما تركض أو تلعب، ينبض قلبك أسرع — هذا شيء جميل!',
      ],
    },
    fr: {
      title: 'Ton cœur, le petit tambour',
      summary: 'Un muscle qui travaille chaque seconde sans s’arrêter !',
      body: [
        "Ton cœur est un petit muscle de la taille de ton poing, qui bat chaque seconde : boum boum boum !",
        'Il pompe le sang rouge dans tout ton corps pour te donner force et énergie.',
        "Quand tu cours ou que tu joues, ton cœur bat plus vite — c'est une bonne chose !",
      ],
    },
    en: {
      title: 'Your heart, the little drum',
      summary: 'A muscle working every second without stopping!',
      body: [
        'Your heart is a small muscle the size of your fist, beating every second: boom boom boom!',
        'It pumps red blood all around your body to give you strength and energy.',
        'When you run or play, your heart beats faster — that is a good thing!',
      ],
    },
  },
  africa: {
    ar: {
      title: 'أفريقيا قارة الأسود',
      summary: 'قارة كبيرة فيها صحراء وغابات وحيوانات رائعة!',
      body: [
        'أفريقيا قارة كبيرة جداً، فيها الصحراء الكبرى والغابات الخضراء.',
        'يعيش فيها الأسد والزرافة والفيل، ونهر النيل الطويل!',
        'فيها أيضاً أهرامات مصر العظيمة وأكثر من خمسين دولة.',
      ],
    },
    fr: {
      title: "L'Afrique, le continent des lions",
      summary: 'Un grand continent avec désert, forêts et animaux magnifiques !',
      body: [
        "L'Afrique est un très grand continent, avec le désert du Sahara et des forêts vertes.",
        'Le lion, la girafe et l’éléphant y vivent, ainsi que le long fleuve Nil !',
        "On y trouve aussi les grandes pyramides d'Égypte et plus de cinquante pays.",
      ],
    },
    en: {
      title: 'Africa, the continent of lions',
      summary: 'A big continent with desert, forests and wonderful animals!',
      body: [
        'Africa is a very big continent, with the Sahara desert and green forests.',
        'Lions, giraffes and elephants live there, along with the long river Nile!',
        'It is also home to the great pyramids of Egypt and more than fifty countries.',
      ],
    },
  },
  atom: {
    ar: {
      title: 'الذرة، اللبنة الصغيرة',
      summary: 'كل شيء من حولك مبني من كرات صغيرة جداً!',
      body: [
        'كل شيء في العالم — الكتاب، الماء، وأنت أيضاً — مبني من كرات صغيرة جداً جداً اسمها الذرات.',
        'في قلب الذرة نواة صغيرة، وحولها تدور إلكترونات مثل الكواكب حول الشمس!',
        'لا يمكنك رؤيتها بعينيك، لكن العلماء يرونها بأجهزة خاصة.',
      ],
    },
    fr: {
      title: "L'atome, la petite brique",
      summary: 'Tout autour de toi est fait de toutes petites boules !',
      body: [
        "Tout dans le monde — le livre, l'eau, et toi aussi — est fait de toutes petites boules appelées atomes.",
        "Au cœur de l'atome, il y a un petit noyau, et autour tournent des électrons comme des planètes autour du Soleil !",
        "Tu ne peux pas les voir avec tes yeux, mais les scientifiques les observent avec des appareils spéciaux.",
      ],
    },
    en: {
      title: 'The atom, the tiny brick',
      summary: 'Everything around you is made of very tiny balls!',
      body: [
        'Everything in the world — the book, the water, and you too — is made of very, very tiny balls called atoms.',
        'At the heart of the atom there is a small nucleus, and electrons orbit around it like planets around the Sun!',
        'You cannot see them with your eyes, but scientists observe them with special devices.',
      ],
    },
  },
}

/* ---------- quick facts for advanced/academic levels ---------- */

export const FACTS: Record<string, Record<Lang, string[]>> = {
  sun: {
    ar: [
      'تمثل الشمس 99.8% من كتلة المجموعة الشمسية كلها.',
      'يحوّل الاندماج النووي في قلبها نحو 600 مليون طن من الهيدروجين إلى هيليوم كل ثانية.',
      'سنتحول بعد نحو 5 مليارات سنة إلى عملاق أحمر يبتلع الكواكب الداخلية.',
    ],
    fr: [
      'Le Soleil représente 99,8 % de la masse totale du système solaire.',
      "La fusion nucléaire en son cœur convertit environ 600 millions de tonnes d'hydrogène en hélium chaque seconde.",
      "Dans environ 5 milliards d'années, il deviendra une géante rouge qui engloutira les planètes intérieures.",
    ],
    en: [
      'The Sun accounts for 99.8% of the entire solar system’s mass.',
      'Nuclear fusion in its core converts about 600 million tonnes of hydrogen into helium every second.',
      'In about 5 billion years it will become a red giant that swallows the inner planets.',
    ],
  },
  water: {
    ar: [
      'يتوفر أقل من 1% من ماء الأرض عذباً سائلاً صالحاً للاستعمال المباشر.',
      'للماء توتر سطحي مرتفع يسمح للحشرات بالسير عليه.',
      'الماء مذيب شامل: يذيب مواد أكثر من أي سائل آخر.',
    ],
    fr: [
      "Moins de 1 % de l'eau terrestre est douce, liquide et directement utilisable.",
      "L'eau a une tension superficielle élevée qui permet aux insectes de marcher dessus.",
      "L'eau est un solvant universel : elle dissout plus de substances que tout autre liquide.",
    ],
    en: [
      'Less than 1% of Earth’s water is fresh, liquid and directly usable.',
      'Water’s high surface tension lets insects walk on it.',
      'Water is a universal solvent: it dissolves more substances than any other liquid.',
    ],
  },
  pyramids: {
    ar: [
      'بُنيت أهرامات الجيزة ضمن مشروع ضخم استغرق عشرات الآلاف من العمال لعقود.',
      'تزن كتل الهرم الأكبر نحو 2.5 طن في المتوسط، ومنها كتل جرانيتية تزن 80 طناً.',
      'كان الهرم الأكبر مكسواً بالحجر الجيري الأبيض المصقول الذي كان يعكس ضوء الشمس.',
    ],
    fr: [
      'Les pyramides de Gizeh ont été construites dans le cadre d’un chantier géant employant des dizaines de milliers d’ouvriers pendant des décennies.',
      "Les blocs de la grande pyramide pèsent en moyenne 2,5 tonnes, certains blocs de granit atteignant 80 tonnes.",
      'La grande pyramide était recouverte de calcaire blanc poli qui reflétait la lumière du soleil.',
    ],
    en: [
      'The Giza pyramids were built in a giant project employing tens of thousands of workers for decades.',
      'The Great Pyramid’s blocks average 2.5 tonnes, with some granite blocks reaching 80 tonnes.',
      'The Great Pyramid was cased in polished white limestone that reflected sunlight.',
    ],
  },
  heart: {
    ar: [
      'يضخ القلب نحو 5 لترات من الدم كل دقيقة في الراحة.',
      'يملك القلب جهاز توجيه كهربائي ذاتي (العقدة الجيبية) يجعله ينبض حتى خارج الجسم.',
      'أول زراعة قلب ناجحة أجراها كريستيان برنارد عام 1967.',
    ],
    fr: [
      'Le cœur pompe environ 5 litres de sang par minute au repos.',
      "Le cœur possède son propre système électrique (le nœud sinusal) qui le fait battre même hors du corps.",
      'La première greffe cardiaque réussie a été réalisée par Christiaan Barnard en 1967.',
    ],
    en: [
      'The heart pumps about 5 litres of blood per minute at rest.',
      'The heart has its own electrical system (the sinus node) that keeps it beating even outside the body.',
      'The first successful heart transplant was performed by Christiaan Barnard in 1967.',
    ],
  },
  africa: {
    ar: [
      'تمرّ أفريقيا بخط الاستواء، وهي القارة الوحيدة الممتدة من المنطقة المعتدلة الشمالية إلى الجنوبية.',
      'أفريقيا هي مهد الجنس البشري: أقدم أحافير الإنسان العاقل وُجدت في إثيوبيا والمغرب.',
      'بحيرة فيكتوريا أكبر بحيراتها، ونهر الكونغو ثاني أطول أنهارها وأعمقها.',
    ],
    fr: [
      "L'Afrique est traversée par l'équateur : c'est le seul continent à s'étendre des zones tempérées du nord à celles du sud.",
      "L'Afrique est le berceau de l'humanité : les plus anciens fossiles d'Homo sapiens ont été trouvés en Éthiopie et au Maroc.",
      'Le lac Victoria est son plus grand lac, et le fleuve Congo son deuxième fleuve le plus long et le plus profond.',
    ],
    en: [
      'Africa is crossed by the equator: it is the only continent spanning from northern to southern temperate zones.',
      'Africa is the cradle of humankind: the oldest Homo sapiens fossils were found in Ethiopia and Morocco.',
      'Lake Victoria is its largest lake, and the Congo River its second-longest and deepest river.',
    ],
  },
  atom: {
    ar: [
      'قطر النواة أصغر من قطر الذرة بنحو 100000 مرة: لو كانت الذرة ملعباً لكانت النواة حبة بازلاء.',
      'تتحدد الخصائص الكيميائية للعنصر بعدد إلكترونات المدار الخارجي.',
      'يوجد 118 عنصراً معروفاً، منها 94 طبيعياً.',
    ],
    fr: [
      "Le noyau est environ 100 000 fois plus petit que l'atome : si l'atome était un stade, le noyau serait un petit pois.",
      "Les propriétés chimiques d'un élément sont déterminées par le nombre d'électrons de sa couche externe.",
      'Il existe 118 éléments connus, dont 94 naturels.',
    ],
    en: [
      'The nucleus is about 100,000 times smaller than the atom: if the atom were a stadium, the nucleus would be a pea.',
      "An element's chemical properties are determined by the number of electrons in its outer shell.",
      'There are 118 known elements, 94 of which occur naturally.',
    ],
  },
}

/* ---------- new modern articles ---------- */

export const NEW_ARTICLES: Article[] = [
  {
    id: 'ai',
    cat: { ar: 'تقنية', fr: 'Technologie', en: 'Technology' },
    related: ['energy', 'atom'],
    content: {
      ar: {
        title: 'الذكاء الاصطناعي',
        summary: 'برامج تحاكي قدرات الإنسان وتعيد تشكيل العلوم والعمل والتعليم.',
        body: [
          'الذكاء الاصطناعي فرع من علوم الحاسوب يبني برامج تحاكي قدرات الإنسان: فهم اللغة، التعرف إلى الصور والأصوات، واتخاذ القرارات.',
          'تعتمد النماذج الحديثة (نماذج اللغة الكبيرة) على التعلم الآلي من مليارات النصوص والصور، فتتوقع الخطوة التالية وتولّد إجابات متماسكة.',
          'يُستخدم اليوم في الترجمة الفورية، تشخيص الأمراض، التعليم الشخصي، الزراعة الذكية، والسيارات ذاتية القيادة.',
          'تطرح التقنية أسئلة جوهرية عن الخصوصية والتحيز وأثرها في سوق العمل، مما يجعل الاستخدام المسؤول والتشريعات ضرورة ملحة.',
        ],
      },
      fr: {
        title: "L'intelligence artificielle",
        summary: "Des programmes qui imitent les capacités humaines et transforment science, travail et éducation.",
        body: [
          "L'intelligence artificielle est une branche de l'informatique qui construit des programmes imitant les capacités humaines : comprendre la langue, reconnaître images et sons, prendre des décisions.",
          "Les modèles modernes (grands modèles de langage) reposent sur l'apprentissage automatique à partir de milliards de textes et d'images, prédisant l'étape suivante et générant des réponses cohérentes.",
          "Elle sert aujourd'hui à la traduction instantanée, au diagnostic médical, à l'éducation personnalisée, à l'agriculture intelligente et aux voitures autonomes.",
          "Cette technologie soulève des questions essentielles sur la vie privée, les biais et l'emploi : un usage responsable et des réglementations deviennent indispensables.",
        ],
      },
      en: {
        title: 'Artificial intelligence',
        summary: 'Programs that imitate human abilities and reshape science, work and education.',
        body: [
          'Artificial intelligence is a branch of computer science that builds programs imitating human abilities: understanding language, recognising images and sounds, and making decisions.',
          'Modern models (large language models) rely on machine learning from billions of texts and images, predicting the next step and generating coherent answers.',
          'It is used today for instant translation, medical diagnosis, personalised education, smart agriculture, and self-driving cars.',
          'The technology raises essential questions about privacy, bias and jobs, making responsible use and regulation urgent.',
        ],
      },
    },
  },
  {
    id: 'climate',
    cat: { ar: 'علوم', fr: 'Sciences', en: 'Science' },
    related: ['energy', 'water'],
    content: {
      ar: {
        title: 'تغير المناخ',
        summary: 'أكبر تحدٍّ علمي وبيئي في عصرنا، وأسبابه وحلوله.',
        body: [
          'تغير المناخ تغير طويل الأمد في حرارة الأرض وأنماط الطقس، تسارع بشكل غير مسبوق منذ الثورة الصناعية.',
          'السبب الرئيسي: حرق الوقود الأحفوري (فحم ونفط وغاز) الذي يطلق ثاني أكسيد الكربون، فيحبس الحرارة في الغلاف الجوي (الاحتباس الحراري).',
          'النتائج الملموسة: ذوبان الأنهار الجليدية، ارتفاع مستوى البحار، وموجات حر وجفاف وفيضانات أشد تكراراً.',
          'الحلول قائمة: الطاقة المتجددة، كفاءة الطاقة، التشجير، واتفاقيات دولية كاتفاق باريس لخفض الانبعاثات.',
        ],
      },
      fr: {
        title: 'Le changement climatique',
        summary: "Le plus grand défi scientifique et environnemental de notre époque : causes et solutions.",
        body: [
          "Le changement climatique est une modification durable de la température et des régimes météorologiques de la Terre, accélérée de façon inédite depuis la révolution industrielle.",
          "Cause principale : la combustion des énergies fossiles (charbon, pétrole, gaz) qui libère du dioxyde de carbone et piège la chaleur dans l'atmosphère (effet de serre).",
          'Conséquences visibles : fonte des glaciers, élévation du niveau des mers, canicules, sécheresses et inondations plus fréquentes.',
          'Des solutions existent : énergies renouvelables, efficacité énergétique, reforestation et accords internationaux comme celui de Paris pour réduire les émissions.',
        ],
      },
      en: {
        title: 'Climate change',
        summary: 'The greatest scientific and environmental challenge of our time — causes and solutions.',
        body: [
          'Climate change is a long-term shift in Earth’s temperature and weather patterns, accelerating unprecedentedly since the industrial revolution.',
          'Main cause: burning fossil fuels (coal, oil, gas) releases carbon dioxide, trapping heat in the atmosphere (greenhouse effect).',
          'Visible impacts: melting glaciers, rising seas, and more frequent heatwaves, droughts and floods.',
          'Solutions exist: renewable energy, energy efficiency, reforestation, and international agreements such as the Paris Agreement to cut emissions.',
        ],
      },
    },
  },
  {
    id: 'mars',
    cat: { ar: 'فضاء', fr: 'Espace', en: 'Space' },
    related: ['sun', 'atom'],
    content: {
      ar: {
        title: 'المريخ',
        summary: 'الكوكب الأحمر، الوجهة القادمة للبشرية في الفضاء.',
        body: [
          'المريخ رابع كواكب المجموعة الشمسية، ويُلقب بالكوكب الأحمر بسبب أكسيد الحديد في تربته.',
          'يومه قريب من يوم الأرض (24.6 ساعة) وسنته ضعف سنتنا تقريباً، ومتوسط حرارته 63 درجة تحت الصفر.',
          'يضم أكبر بركان في المجموعة الشمسية (أوليمبوس مونس) ووادي مارينيريس العملاق وآثار أنهار جافة توحي بماضٍ رطب.',
          'تدرس مركبات اليوم تربته بحثاً عن آثار حياة قديمة، وتخطط الوكالات لمهمات بشرية خلال الثلاثينيات.',
        ],
      },
      fr: {
        title: 'Mars',
        summary: "La planète rouge, prochaine destination de l'humanité dans l'espace.",
        body: [
          "Mars est la quatrième planète du système solaire, surnommée la planète rouge à cause de l'oxyde de fer de son sol.",
          'Sa journée ressemble à celle de la Terre (24,6 h), son année dure presque deux fois la nôtre, et sa température moyenne est de −63 °C.',
          'Elle abrite le plus grand volcan du système solaire (Olympus Mons), le canyon géant Valles Marineris et des traces de rivières asséchées évoquant un passé humide.',
          "Les rovers actuels étudient son sol à la recherche de traces de vie ancienne, et les agences préparent des missions humaines pour les années 2030.",
        ],
      },
      en: {
        title: 'Mars',
        summary: 'The red planet — humanity’s next destination in space.',
        body: [
          'Mars is the fourth planet of the solar system, nicknamed the red planet because of iron oxide in its soil.',
          'Its day is close to Earth’s (24.6 hours), its year lasts almost twice ours, and its average temperature is −63 °C.',
          'It hosts the largest volcano in the solar system (Olympus Mons), the giant canyon Valles Marineris, and dried river traces hinting at a wet past.',
          'Today’s rovers study its soil for traces of ancient life, and space agencies plan human missions for the 2030s.',
        ],
      },
    },
  },
  {
    id: 'energy',
    cat: { ar: 'فيزياء', fr: 'Physique', en: 'Physics' },
    related: ['climate', 'sun'],
    content: {
      ar: {
        title: 'الطاقة المتجددة',
        summary: 'كهرباء نظيفة من الشمس والرياح والماء — أرخص مصادر الطاقة في التاريخ.',
        body: [
          'الطاقة المتجددة تأتي من مصادر لا تنفد: الشمس، الرياح، الماء، حرارة الأرض، والكتلة الحيوية.',
          'تحول الألواح الشمسية ضوء الشمس إلى كهرباء مباشرة، وتدير الرياح عنفات تولد كهرباء نظيفة بلا انبعاثات.',
          'تكلفتها تنخفض باستمرار، حتى أصبحت الكهرباء الشمسية الأرخص في التاريخ، وتتفوق على الوقود الأحفوري اقتصادياً.',
          'التحدي الأكبر هو التخزين ليلاً وعند سكون الرياح، لذا تتطور البطاريات العملاقة والهيدروجين الأخضر بسرعة.',
        ],
      },
      fr: {
        title: 'Les énergies renouvelables',
        summary: "De l'électricité propre grâce au soleil, au vent et à l'eau — les sources d'énergie les moins chères de l'histoire.",
        body: [
          "Les énergies renouvelables proviennent de sources inépuisables : le soleil, le vent, l'eau, la chaleur de la Terre et la biomasse.",
          "Les panneaux solaires convertissent la lumière du soleil en électricité, et le vent fait tourner des éoliennes qui produisent une électricité propre, sans émissions.",
          "Leur coût baisse sans cesse : l'électricité solaire est devenue la moins chère de l'histoire, dépassant économiquement les énergies fossiles.",
          "Le grand défi reste le stockage la nuit et sans vent : batteries géantes et hydrogène vert progressent rapidement.",
        ],
      },
      en: {
        title: 'Renewable energy',
        summary: 'Clean electricity from sun, wind and water — the cheapest energy sources in history.',
        body: [
          'Renewable energy comes from inexhaustible sources: the sun, wind, water, Earth’s heat and biomass.',
          'Solar panels convert sunlight directly into electricity, and wind spins turbines generating clean, emission-free power.',
          'Costs keep falling: solar electricity has become the cheapest in history, economically beating fossil fuels.',
          'The biggest challenge is storage at night and without wind — giant batteries and green hydrogen are advancing fast.',
        ],
      },
    },
  },
]

/* kids versions + facts for the new articles */

export const KIDS_NEW: Record<string, Record<Lang, ArticleContent>> = {
  ai: {
    ar: {
      title: 'الحاسوب الذكي',
      summary: 'برنامج يتعلم ويجيب مثل مساعد ذكي!',
      body: [
        'الذكاء الاصطناعي حاسوب ذكي يتعلم من الأمثلة! يجيب عن أسئلتك ويتعرف إلى الصور والأصوات.',
        'يساعد الأطباء والفلاحين والمعلمين، ويمكنك أن تسأله أنت أيضاً!',
        'لكنه يحتاج إلينا نحن البشر لنوجهه جيداً ونستخدمه بأمان.',
      ],
    },
    fr: {
      title: "L'ordinateur intelligent",
      summary: "Un programme qui apprend et répond comme un assistant malin !",
      body: [
        "L'intelligence artificielle est un ordinateur intelligent qui apprend à partir d'exemples ! Il répond à tes questions et reconnaît les images et les sons.",
        'Il aide les médecins, les agriculteurs et les enseignants — et toi aussi, tu peux lui poser des questions !',
        'Mais il a besoin de nous, les humains, pour bien le guider et l’utiliser en sécurité.',
      ],
    },
    en: {
      title: 'The smart computer',
      summary: 'A program that learns and answers like a clever assistant!',
      body: [
        'Artificial intelligence is a smart computer that learns from examples! It answers your questions and recognises images and sounds.',
        'It helps doctors, farmers and teachers — and you can ask it questions too!',
        'But it needs us humans to guide it well and use it safely.',
      ],
    },
  },
  climate: {
    ar: {
      title: 'أرضنا تحتاج مساعدتنا',
      summary: 'الجو أصبح أحر، ونحن نستطيع إصلاح ذلك!',
      body: [
        'مناخ الأرض يتغير: صار الجو أحر بسبب دخان السيارات والمصانع.',
        'نستطيع المساعدة: نزرع الأشجار، ونستخدم الشمس والرياح لإنتاج الكهرباء، ونوفر الطاقة.',
        'هكذا نحمي كوكبنا الجميل للجميع!',
      ],
    },
    fr: {
      title: 'Notre Terre a besoin de nous',
      summary: 'Il fait plus chaud, et nous pouvons y remédier !',
      body: [
        "Le climat de la Terre change : il fait plus chaud à cause de la fumée des voitures et des usines.",
        "Nous pouvons aider : planter des arbres, utiliser le soleil et le vent pour produire l'électricité, et économiser l'énergie.",
        'Ainsi, nous protégeons notre belle planète pour tous !',
      ],
    },
    en: {
      title: 'Our Earth needs our help',
      summary: 'It is getting warmer — and we can fix it!',
      body: [
        'Earth’s climate is changing: it is getting warmer because of smoke from cars and factories.',
        'We can help: plant trees, use the sun and wind to make electricity, and save energy.',
        'That is how we protect our beautiful planet for everyone!',
      ],
    },
  },
  mars: {
    ar: {
      title: 'الكوكب الأحمر',
      summary: 'عالم بعيد بجبال وجليد، يحلم البشر بزيارته!',
      body: [
        'المريخ كوكب أحمر جميل بعيد عن الأرض! لونه أحمر بسبب التراب المليء بالصدأ.',
        'فيه أكبر بركان في المجموعة الشمسية وجليد في قطبيه.',
        'ترسل المركبات صوراً مدهشة، وربما تصبح أنت رائد فضاء تزوره يوماً ما!',
      ],
    },
    fr: {
      title: 'La planète rouge',
      summary: 'Un monde lointain avec montagnes et glace, dont les humains rêvent !',
      body: [
        "Mars est une belle planète rouge, loin de la Terre ! Elle est rouge à cause d'un sol plein de rouille.",
        'Elle possède le plus grand volcan du système solaire et de la glace à ses pôles.',
        "Les robots y envoient des images incroyables — et peut-être qu'un jour, tu deviendras astronaute pour la visiter !",
      ],
    },
    en: {
      title: 'The red planet',
      summary: 'A faraway world with mountains and ice that humans dream of visiting!',
      body: [
        'Mars is a beautiful red planet, far from Earth! It is red because of rusty soil.',
        'It has the biggest volcano in the solar system and ice at its poles.',
        'Robots send amazing pictures back — and maybe one day you will become an astronaut and visit it!',
      ],
    },
  },
  energy: {
    ar: {
      title: 'كهرباء الشمس والرياح',
      summary: 'طاقة نظيفة تضيء بيوتنا دون تلويث!',
      body: [
        'الشمس والرياح تمنحاننا كهرباء نظيفة!',
        'الألواح على الأسطح تجمع أشعة الشمس، والمراوح الكبيرة تلتقط الرياح لتوليد الكهرباء.',
        'هكذا نضيء بيوتنا ونشحن أجهزتنا دون تلويث الهواء!',
      ],
    },
    fr: {
      title: "L'électricité du soleil et du vent",
      summary: 'Une énergie propre qui éclaire nos maisons sans polluer !',
      body: [
        "Le soleil et le vent nous offrent une électricité propre !",
        "Les panneaux sur les toits captent les rayons du soleil, et les grandes hélices attrapent le vent pour produire de l'électricité.",
        "Ainsi, nous éclairons nos maisons et chargeons nos appareils sans polluer l'air !",
      ],
    },
    en: {
      title: 'Electricity from sun and wind',
      summary: 'Clean energy that lights our homes without pollution!',
      body: [
        'The sun and the wind give us clean electricity!',
        'Panels on roofs collect sunlight, and big blades catch the wind to make electricity.',
        'That is how we light our homes and charge our devices without polluting the air!',
      ],
    },
  },
}

export const FACTS_NEW: Record<string, Record<Lang, string[]>> = {
  ai: {
    ar: [
      'انطلق المجال رسمياً عام 1956 في مؤتمر دارتموث.',
      'تدرّبت النماذج اللغوية الحديثة على تريليونات الكلمات.',
      'يمكن اليوم تشغيل نماذج صغيرة كاملة على حاسوب شخصي دون إنترنت.',
    ],
    fr: [
      'Le domaine est né officiellement en 1956 à la conférence de Dartmouth.',
      'Les modèles de langage modernes ont été entraînés sur des billions de mots.',
      "Aujourd'hui, de petits modèles complets tournent sur un simple ordinateur personnel, hors ligne.",
    ],
    en: [
      'The field officially began in 1956 at the Dartmouth conference.',
      'Modern language models were trained on trillions of words.',
      'Small full models can now run on a personal computer, offline.',
    ],
  },
  climate: {
    ar: [
      'ارتفعت حرارة الأرض نحو 1.2 درجة مئوية منذ ما قبل الثورة الصناعية.',
      'كانت الأعوام 2023–2025 الأكثر حرارة في التاريخ المسجل.',
      'المحيطات امتصت أكثر من 90% من الحرارة الزائدة.',
    ],
    fr: [
      "La température de la Terre a augmenté d'environ 1,2 °C depuis l'ère préindustrielle.",
      'Les années 2023–2025 ont été les plus chaudes jamais enregistrées.',
      "Les océans ont absorbé plus de 90 % de la chaleur excédentaire.",
    ],
    en: [
      'Earth has warmed by about 1.2 °C since pre-industrial times.',
      '2023–2025 were the hottest years on record.',
      'The oceans have absorbed more than 90% of the excess heat.',
    ],
  },
  mars: {
    ar: [
      'بركان أوليمبوس مونس أعلى من قمة إفرست بنحو ثلاث مرات.',
      'تستغرق الرحلة إلى المريخ من 6 إلى 9 أشهر حسب موقع الكوكبين.',
      'تغطي عواصف الغبار أحياناً الكوكب الأحمر كله لأسابيع.',
    ],
    fr: [
      "Le volcan Olympus Mons est environ trois fois plus haut que l'Everest.",
      'Le voyage vers Mars dure de 6 à 9 mois selon la position des deux planètes.',
      'Des tempêtes de poussière couvrent parfois toute la planète rouge pendant des semaines.',
    ],
    en: [
      'Olympus Mons is about three times higher than Mount Everest.',
      'The trip to Mars takes 6–9 months depending on the planets’ positions.',
      'Dust storms sometimes cover the whole red planet for weeks.',
    ],
  },
  energy: {
    ar: [
      'انخفضت تكلفة الكهرباء الشمسية نحو 90% خلال عقد واحد.',
      'تزود مزرعة رياح بحرية واحدة ملايين المنازل بالكهرباء.',
      'الهيدروجين الأخضر مرشح ليكون وقود الصناعة الثقيلة النظيف.',
    ],
    fr: [
      "Le coût de l'électricité solaire a chuté d'environ 90 % en une décennie.",
      "Un seul parc éolien en mer alimente des millions de foyers en électricité.",
      "L'hydrogène vert est candidat pour devenir le carburant propre de l'industrie lourde.",
    ],
    en: [
      'Solar electricity costs fell by about 90% in a decade.',
      'A single offshore wind farm powers millions of homes.',
      'Green hydrogen is a candidate to become the clean fuel of heavy industry.',
    ],
  },
}

/* ---------- learning paths ---------- */

export interface LearningPath {
  id: string
  icon: string
  color: string
  title: Record<Lang, string>
  topics: string[]
}

export const PATHS: LearningPath[] = [
  {
    id: 'space',
    icon: '🔭',
    color: '#4f9dde',
    title: { ar: 'الفضاء والكون', fr: 'Espace et univers', en: 'Space & the universe' },
    topics: ['sun', 'mars', 'atom'],
  },
  {
    id: 'life',
    icon: '🌱',
    color: '#2e7d32',
    title: { ar: 'الحياة والطبيعة', fr: 'Vie et nature', en: 'Life & nature' },
    topics: ['water', 'heart', 'climate'],
  },
  {
    id: 'earth',
    icon: '🏛️',
    color: '#d9a066',
    title: { ar: 'الحضارات والأرض', fr: 'Civilisations et Terre', en: 'Civilisations & Earth' },
    topics: ['pyramids', 'africa'],
  },
  {
    id: 'tech',
    icon: '🤖',
    color: '#7d5ba6',
    title: { ar: 'التقنية الحديثة', fr: 'Technologie moderne', en: 'Modern technology' },
    topics: ['ai', 'energy'],
  },
]

export const PATH_COLORS: Record<string, string> = Object.fromEntries(
  PATHS.flatMap((p) => p.topics.map((tid) => [tid, p.color]))
)

/* ---------- visual identity per article ---------- */

export const ARTICLE_META: Record<string, { emoji: string; color: string; img: string }> = {
  sun: { emoji: '🌞', color: '#e8962b', img: 'sun.gif' },
  water: { emoji: '💧', color: '#2f9fd8', img: 'water.jpg' },
  pyramids: { emoji: '🐪', color: '#c78f4f', img: 'pyramids.jpg' },
  heart: { emoji: '❤️', color: '#c0392b', img: 'heart.jpg' },
  africa: { emoji: '🦁', color: '#2e7d32', img: 'africa.jpg' },
  atom: { emoji: '⚛️', color: '#7d5ba6', img: 'atom.png' },
  ai: { emoji: '🤖', color: '#5b6bd6', img: 'ai.jpg' },
  climate: { emoji: '🌍', color: '#27ae60', img: 'climate.jpg' },
  mars: { emoji: '🚀', color: '#d76b4f', img: 'mars.jpg' },
  energy: { emoji: '⚡', color: '#d9a32b', img: 'energy.jpg' },
}

const COLLECTION_EMOJIS = ['📖', '🌍', '🔬', '🏛', '⚖️', '🗺️', '🧭', '🎨', '🌿', '🪐', '🕰️', '🫒']
const COLLECTION_COLORS = ['#1f3a5f', '#2e5d4f', '#5a3d7a', '#7a4b2e', '#2f5d7a', '#6b2f4f', '#4a5d2f', '#3d4b7a']

/** Deterministic visual variety for imported collection/articles without meta. */
export function articleMeta(id: string): { emoji: string; color: string; img: string } {
  const known = ARTICLE_META[id]
  if (known) return known
  let h = 7
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return {
    emoji: COLLECTION_EMOJIS[h % COLLECTION_EMOJIS.length],
    color: COLLECTION_COLORS[h % COLLECTION_COLORS.length],
    img: '',
  }
}

/** Restrained line icon for academic article cards; playful emoji remain for children's views. */
export function articleIcon(id: string, category: string): string {
  const topic = `${id} ${category}`.toLowerCase()
  if (/space|planet|mars|solar|فضاء|كوكب|مريخ|espace|planète/.test(topic)) return 'travel_explore'
  if (/heart|body|blood|medicine|biology|قلب|جسم|دم|طب|أحياء|cœur|corps|santé|biologie/.test(topic)) return 'monitoring'
  if (/technology|computer|robot|ai|tech|تقنية|حاسوب|روبوت|ذكاء|technologie|ordinateur/.test(topic)) return 'memory'
  if (/history|histor|تاريخ|histoire/.test(topic)) return 'account_balance'
  if (/geography|nature|climate|water|جغرافيا|طبيعة|مناخ|ماء|géographie|nature/.test(topic)) return 'public'
  if (/physics|chem|science|فيزياء|كيمياء|علوم|physique|chimie|sciences/.test(topic)) return 'science'
  return 'hub'
}

/** Never substitute a different language: missing content gets a localized unavailable marker. */
export function contentOf(a: Article, lang: Lang): ArticleContent {
  return a.content?.[lang] ?? {
    title: lang === 'ar' ? 'المقال غير متاح بالعربية' : lang === 'fr' ? 'Article indisponible en français' : 'Article unavailable in English',
    summary: lang === 'ar' ? 'لا تتوفر ترجمة موثقة لهذا المقال بعد.' : lang === 'fr' ? 'Aucune traduction vérifiée de cet article n’est disponible pour le moment.' : 'A verified translation of this article is not available yet.',
    body: [],
  }
}

/* ---------- Did you know? ---------- */

export const HADYOUKNOW: Record<Lang, string[]> = {
  ar: [
    'هل تعلم أن قلبك ينبض أكثر من 100000 مرة كل يوم؟',
    'هل تعلم أن البرق أسخن من سطح الشمس؟',
    'هل تعلم أن الأخطبوط له ثلاثة قلوب ودم أزرق؟',
    'هل تعلم أن النحل يتواصل بالرقص ليخبر رفاقه بمكان الأزهار؟',
    'هل تعلم أن جبل إفرست يزداد ارتفاعاً بضعة مليمترات كل سنة؟',
    'هل تعلم أن بصمة لسانك فريدة مثل بصمة أصابعك؟',
  ],
  fr: [
    'Saviez-vous que votre cœur bat plus de 100 000 fois par jour ?',
    "Saviez-vous que l'éclair est plus chaud que la surface du Soleil ?",
    'Saviez-vous que la pieuvre a trois cœurs et du sang bleu ?',
    "Saviez-vous que les abeilles dansent pour indiquer où se trouvent les fleurs ?",
    "Saviez-vous que l'Everest grandit de quelques millimètres chaque année ?",
    'Saviez-vous que votre empreinte de langue est unique, comme vos empreintes digitales ?',
  ],
  en: [
    'Did you know your heart beats more than 100,000 times a day?',
    'Did you know lightning is hotter than the surface of the Sun?',
    'Did you know an octopus has three hearts and blue blood?',
    'Did you know bees dance to tell each other where the flowers are?',
    'Did you know Mount Everest grows a few millimetres every year?',
    'Did you know your tongue print is unique, like your fingerprints?',
  ],
}

/* ---------- badges & rewards ---------- */

export interface Badge {
  id: string
  icon: string
  title: Record<Lang, string>
  desc: Record<Lang, string>
}

export const BADGES: Badge[] = [
  { id: 'firstStep', icon: '🐣', title: { ar: 'الخطوة الأولى', fr: 'Premier pas', en: 'First step' }, desc: { ar: 'افتح أول مقال', fr: 'Ouvrez un premier article', en: 'Open your first article' } },
  { id: 'reader', icon: '📚', title: { ar: 'القارئ', fr: 'Lecteur', en: 'Reader' }, desc: { ar: 'اقرأ 3 مقالات', fr: 'Lisez 3 articles', en: 'Read 3 articles' } },
  { id: 'quizzer', icon: '🎯', title: { ar: 'صائد النقاط', fr: 'Chasseur de points', en: 'Point hunter' }, desc: { ar: 'أنهِ اختباراً بنتيجة جيدة', fr: 'Terminez un quiz avec un bon score', en: 'Finish a quiz with a good score' } },
  { id: 'scientist', icon: '🧪', title: { ar: 'العالم الصغير', fr: 'Petit scientifique', en: 'Little scientist' }, desc: { ar: 'جرّب المختبر الافتراضي', fr: 'Essayez le laboratoire virtuel', en: 'Try the virtual lab' } },
  { id: 'memorizer', icon: '🃏', title: { ar: 'ذاكرة حديدية', fr: 'Mémoire d’acier', en: 'Iron memory' }, desc: { ar: 'افز بلعبة الذاكرة', fr: 'Gagnez au jeu de mémoire', en: 'Win the memory game' } },
  { id: 'timeTraveler', icon: '⏳', title: { ar: 'رحّالة الزمن', fr: 'Voyageur du temps', en: 'Time traveller' }, desc: { ar: 'شغّل زمن الأطلس', fr: 'Lancez le temps de l’atlas', en: 'Play the atlas time' } },
  { id: 'writer', icon: '🖋️', title: { ar: 'الكاتب', fr: 'L’écrivain', en: 'The writer' }, desc: { ar: 'ولّد مقالاً واحفظه', fr: 'Générez un article et enregistrez-le', en: 'Generate an article and save it' } },
  { id: 'polyglot', icon: '🌍', title: { ar: 'متعدد اللغات', fr: 'Polyglotte', en: 'Polyglot' }, desc: { ar: 'استعمل اللغات الثلاث', fr: 'Utilisez les trois langues', en: 'Use all three languages' } },
  { id: 'spacePioneer', icon: '🔭', title: { ar: 'رائد الفضاء', fr: 'Pionnier de l’espace', en: 'Space pioneer' }, desc: { ar: 'أكمل مسار الفضاء والكون', fr: 'Terminez le parcours Espace et univers', en: 'Finish the Space path' } },
  { id: 'naturalist', icon: '🌱', title: { ar: 'صديق الطبيعة', fr: 'Ami de la nature', en: 'Friend of nature' }, desc: { ar: 'أكمل مسار الحياة والطبيعة', fr: 'Terminez le parcours Vie et nature', en: 'Finish the Life path' } },
  { id: 'historian', icon: '🏛️', title: { ar: 'المؤرخ', fr: 'L’historien', en: 'The historian' }, desc: { ar: 'أكمل مسار الحضارات والأرض', fr: 'Terminez le parcours Civilisations et Terre', en: 'Finish the Civilisations path' } },
  { id: 'technologist', icon: '🤖', title: { ar: 'مهندس التقنية', fr: 'Ingénieur technologique', en: 'Tech engineer' }, desc: { ar: 'أكمل مسار التقنية الحديثة', fr: 'Terminez le parcours Technologie moderne', en: 'Finish the Technology path' } },
  { id: 'adventurer', icon: '🧭', title: { ar: 'مغامر القلم', fr: 'Aventurier de la plume', en: 'Pen adventurer' }, desc: { ar: 'أكمل رحلة القلم', fr: 'Terminez le voyage de la plume', en: 'Finish the pen’s journey' } },
]

export const PATH_BADGES: Record<string, string> = {
  space: 'spacePioneer',
  life: 'naturalist',
  earth: 'historian',
  tech: 'technologist',
}

export const GARDEN_PLANTS: Record<string, string> = {
  sun: '🌻',
  water: '🌸',
  pyramids: '🌵',
  heart: '🌷',
  africa: '🌴',
  atom: '🍄',
  ai: '🌺',
  climate: '🌾',
  mars: '🪴',
  energy: '🌼',
}

/* ---------- KPI stats for advanced/academic levels ---------- */

export interface StatItem {
  icon: string
  label: Record<Lang, string>
  value: Record<Lang, string>
}

export const STATS: Record<string, StatItem[]> = {
  sun: [
    { icon: '🌡️', label: { ar: 'حرارة السطح', fr: 'Température de surface', en: 'Surface temperature' }, value: { ar: '5500 °م', fr: '5500 °C', en: '5500 °C' } },
    { icon: '⚖️', label: { ar: 'من كتلة المجموعة الشمسية', fr: 'De la masse du système', en: 'Of the solar system mass' }, value: { ar: '99.8%', fr: '99,8 %', en: '99.8%' } },
    { icon: '⏱️', label: { ar: 'وصول الضوء إلى الأرض', fr: 'Lumière jusqu’à la Terre', en: 'Light to Earth' }, value: { ar: '8 دقائق', fr: '8 minutes', en: '8 minutes' } },
  ],
  water: [
    { icon: '🌊', label: { ar: 'يغطي سطح الأرض', fr: 'Couvre la surface terrestre', en: 'Covers Earth’s surface' }, value: { ar: '71%', fr: '71 %', en: '71%' } },
    { icon: '🧊', label: { ar: 'نقطة التجمد', fr: 'Point de congélation', en: 'Freezing point' }, value: { ar: '0 °م', fr: '0 °C', en: '0 °C' } },
    { icon: '💧', label: { ar: 'عذب صالح للاستعمال', fr: 'Douce utilisable', en: 'Usable fresh water' }, value: { ar: '< 1%', fr: '< 1 %', en: '< 1%' } },
  ],
  pyramids: [
    { icon: '📏', label: { ar: 'ارتفاع خوفو الأصلي', fr: 'Hauteur initiale de Khéops', en: 'Khufu’s original height' }, value: { ar: '146 م', fr: '146 m', en: '146 m' } },
    { icon: '⏳', label: { ar: 'عمرها', fr: 'Âge', en: 'Age' }, value: { ar: '+4500 سنة', fr: '+4500 ans', en: '4500+ years' } },
    { icon: '🪨', label: { ar: 'كتل الهرم الأكبر', fr: 'Blocs de la grande pyramide', en: 'Great Pyramid blocks' }, value: { ar: '~2.3 مليون', fr: '~2,3 millions', en: '~2.3 million' } },
  ],
  heart: [
    { icon: '💓', label: { ar: 'نبضات يومياً', fr: 'Battements par jour', en: 'Beats per day' }, value: { ar: '~100000', fr: '~100 000', en: '~100,000' } },
    { icon: '🩸', label: { ar: 'الضخ في الراحة', fr: 'Pompage au repos', en: 'Pumping at rest' }, value: { ar: '5 ل/دقيقة', fr: '5 l/min', en: '5 l/min' } },
    { icon: '🔋', label: { ar: 'نبض كهربائي ذاتي', fr: 'Battement électrique autonome', en: 'Self-generated beat' }, value: { ar: 'العقدة الجيبية', fr: 'Nœud sinusal', en: 'Sinus node' } },
  ],
  africa: [
    { icon: '🌍', label: { ar: 'مساحة القارة', fr: 'Superficie', en: 'Area' }, value: { ar: '30.4 م كم²', fr: '30,4 M km²', en: '30.4 M km²' } },
    { icon: '👥', label: { ar: 'عدد السكان', fr: 'Population', en: 'Population' }, value: { ar: '+1.5 مليار', fr: '+1,5 milliard', en: '1.5+ billion' } },
    { icon: '🗣️', label: { ar: 'عدد الدول', fr: 'Nombre de pays', en: 'Countries' }, value: { ar: '54', fr: '54', en: '54' } },
  ],
  atom: [
    { icon: '🔬', label: { ar: 'نسبة قطر النواة للذرة', fr: 'Noyau / atome', en: 'Nucleus / atom ratio' }, value: { ar: '1/100000', fr: '1/100 000', en: '1/100,000' } },
    { icon: '🧬', label: { ar: 'عناصر معروفة', fr: 'Éléments connus', en: 'Known elements' }, value: { ar: '118', fr: '118', en: '118' } },
    { icon: '⚛️', label: { ar: 'تحدد الخصائص الكيميائية', fr: 'Déterminent les propriétés', en: 'Determine properties' }, value: { ar: 'إلكترونات المدار الخارجي', fr: 'Électrons externes', en: 'Outer electrons' } },
  ],
  ai: [
    { icon: '🤖', label: { ar: 'انطلاق المجال', fr: 'Naissance du domaine', en: 'Field born' }, value: { ar: '1956', fr: '1956', en: '1956' } },
    { icon: '📚', label: { ar: 'تدريب النماذج الحديثة', fr: 'Entraînement des modèles', en: 'Model training' }, value: { ar: 'تريليونات كلمات', fr: 'Des billions de mots', en: 'Trillions of words' } },
    { icon: '💻', label: { ar: 'نماذج محلية اليوم', fr: 'Modèles locaux aujourd’hui', en: 'Local models today' }, value: { ar: 'تعمل دون إنترنت', fr: 'Hors ligne', en: 'Offline' } },
  ],
  climate: [
    { icon: '🌡️', label: { ar: 'ارتفاع الحرارة', fr: 'Réchauffement', en: 'Warming' }, value: { ar: '+1.2 °م', fr: '+1,2 °C', en: '+1.2 °C' } },
    { icon: '🏭', label: { ar: 'المسبب الرئيسي', fr: 'Cause principale', en: 'Main cause' }, value: { ar: 'الوقود الأحفوري', fr: 'Énergies fossiles', en: 'Fossil fuels' } },
    { icon: '🌊', label: { ar: 'امتصت المحيطات', fr: 'Absorbé par les océans', en: 'Oceans absorbed' }, value: { ar: '> 90% من الحرارة', fr: '> 90 % de la chaleur', en: '> 90% of heat' } },
  ],
  mars: [
    { icon: '🌡️', label: { ar: 'متوسط الحرارة', fr: 'Température moyenne', en: 'Average temperature' }, value: { ar: '-63 °م', fr: '−63 °C', en: '−63 °C' } },
    { icon: '🗻', label: { ar: 'أعلى بركان', fr: 'Plus haut volcan', en: 'Tallest volcano' }, value: { ar: 'أوليمبوس مونس', fr: 'Olympus Mons', en: 'Olympus Mons' } },
    { icon: '🚀', label: { ar: 'مدة الرحلة', fr: 'Durée du voyage', en: 'Trip duration' }, value: { ar: '6–9 أشهر', fr: '6–9 mois', en: '6–9 months' } },
  ],
  energy: [
    { icon: '📉', label: { ar: 'هبوط تكلفة الشمسية', fr: 'Baisse du coût solaire', en: 'Solar cost drop' }, value: { ar: '~90% خلال عقد', fr: '~90 % en 10 ans', en: '~90% in a decade' } },
    { icon: '🌬️', label: { ar: 'مزرعة رياح واحدة تزود', fr: 'Un parc éolien alimente', en: 'One wind farm powers' }, value: { ar: 'ملايين المنازل', fr: 'Des millions de foyers', en: 'Millions of homes' } },
    { icon: '💚', label: { ar: 'وقود المستقبل النظيف', fr: 'Carburant propre du futur', en: 'Future clean fuel' }, value: { ar: 'الهيدروجين الأخضر', fr: 'Hydrogène vert', en: 'Green hydrogen' } },
  ],
}

/* ---------- combined list for search, tutor, games ---------- */

export const ALL_ARTICLES_FULL: Article[] = [...COLLECTION_FR, ...NEW_ARTICLES, ...ARTICLES]

/* ---------- monthly news ---------- */

export interface NewsItem {
  icon: string
  date: Record<Lang, string>
  title: Record<Lang, string>
  text: Record<Lang, string>
}

export const NEWS: NewsItem[] = [
  {
    icon: '🤖',
    date: { ar: 'نوفمبر 2026', fr: 'Novembre 2026', en: 'November 2026' },
    title: {
      ar: 'نماذج ذكاء اصطناعي محلية تعمل دون إنترنت',
      fr: "Des modèles d'IA locaux qui fonctionnent hors ligne",
      en: 'Local AI models that work offline',
    },
    text: {
      ar: 'أصبحت نماذج لغوية صغيرة تشتغل على الحواسيب الشخصية دون اتصال، مما يفتح باب التعليم الذكي في المناطق النائية.',
      fr: 'De petits modèles de langage tournent désormais sur des ordinateurs personnels sans connexion, ouvrant la voie à une éducation intelligente dans les zones isolées.',
      en: 'Small language models now run on personal computers without a connection, opening the door to smart education in remote areas.',
    },
  },
  {
    icon: '🌍',
    date: { ar: 'نوفمبر 2026', fr: 'Novembre 2026', en: 'November 2026' },
    title: {
      ar: 'الأعوام الأكثر حرارة في التاريخ المسجل',
      fr: 'Les années les plus chaudes jamais enregistrées',
      en: 'The hottest years on record',
    },
    text: {
      ar: 'تواصل درجات الحرارة العالمية تحطيم الأرقام القياسية، مع تسارع الاستثمار في الطاقة المتجددة التي أصبحت المصدر الأسرع نمواً.',
      fr: 'Les températures mondiales continuent de battre des records, tandis que les investissements dans les énergies renouvelables accélèrent, en devenant la source à la croissance la plus rapide.',
      en: 'Global temperatures keep breaking records, while renewable-energy investment accelerates as the fastest-growing power source.',
    },
  },
  {
    icon: '🚀',
    date: { ar: 'نوفمبر 2026', fr: 'Novembre 2026', en: 'November 2026' },
    title: {
      ar: 'مهمات المريخ تستعد لإحضار عينات التربة',
      fr: 'Les missions martiennes se préparent à rapporter des échantillons',
      en: 'Mars missions prepare to return soil samples',
    },
    text: {
      ar: 'تقترب مهمات إعادة عينات من المريخ من التنفيذ، وقد تحمل أدلة عن حياة قديمة على الكوكب الأحمر.',
      fr: 'Les missions de retour d’échantillons martiens approchent de leur réalisation et pourraient ramener des preuves d’une vie ancienne sur la planète rouge.',
      en: 'Mars sample-return missions are nearing launch and could bring back evidence of ancient life on the red planet.',
    },
  },
]
