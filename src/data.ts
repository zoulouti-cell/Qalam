import type { Lang } from './i18n'

export interface ArticleContent {
  title: string
  summary: string
  body: string[]
}

export interface ArticleSource {
  name: string
  title: string
  url: string
  attribution: string
  license: string
  licenseUrl?: string
  revisionId?: number
  revisionTimestamp?: string
  importedAt?: string
  modified?: boolean
}

export interface Article {
  id: string
  cat: Record<Lang, string>
  related: string[]
  content: Record<Lang, ArticleContent>
  sources?: Partial<Record<Lang, ArticleSource[]>>
  kidsContent?: Partial<Record<Lang, ArticleContent>>
  aliases?: string[]
  editorialEdition?: { batch: string; sourceLanguage: Lang; parallel: boolean }
  subjectAliases?: Partial<Record<Lang,string[]>>
  primaryDomain?: 'space'|'earth'|'life'|'science'|'technology'|'civilizations'|'arts'|'religions'|'human-history'|'future'
}

export const ARTICLES: Article[] = [
  {
    id: 'sun',
    cat: { ar: 'علوم', fr: 'Sciences', en: 'Science' },
    related: ['atom', 'water'],
    content: {
      ar: {
        title: 'الشمس',
        summary: 'النجم الذي يقع في مركز مجموعتنا الشمسية ويمنح الأرض الضوء والحرارة.',
        body: [
          'الشمس نجم متوسط الحجم يقع في مركز مجموعتنا الشمسية، وتبلغ درجة حرارة سطحها نحو 5500 درجة مئوية.',
          'تتكون الشمس أساساً من غازي الهيدروجين والهيليوم، وتنتج طاقتها عبر اندماج نووي مستمر في قلبها.',
          'يصل ضوء الشمس إلى الأرض في حوالي ثماني دقائق، ويدور حولها ثمانية كواكب أهمها الأرض.',
          'تمدّ الشمس الأرض بالطاقة التي تجعل الحياة ممكنة: الضوء للنباتات، والحرارة للمناخ، والطاقة الشمسية للإنسان.',
        ],
      },
      fr: {
        title: 'Le Soleil',
        summary: "L'étoile au centre de notre système solaire, qui donne à la Terre lumière et chaleur.",
        body: [
          "Le Soleil est une étoile de taille moyenne située au centre de notre système solaire ; la température de sa surface atteint environ 5 500 °C.",
          "Il est composé essentiellement d'hydrogène et d'hélium, et produit son énergie par fusion nucléaire permanente dans son cœur.",
          "Sa lumière met environ huit minutes pour atteindre la Terre, autour de laquelle tournent huit planètes, dont la Terre.",
          "Le Soleil fournit l'énergie qui rend la vie possible : la lumière pour les plantes, la chaleur pour le climat et l'énergie solaire pour l'homme.",
        ],
      },
      en: {
        title: 'The Sun',
        summary: 'The star at the centre of our solar system that gives Earth light and heat.',
        body: [
          'The Sun is a medium-sized star at the centre of our solar system; its surface temperature is about 5,500 °C.',
          'It consists mainly of hydrogen and helium, and produces its energy through constant nuclear fusion in its core.',
          'Its light takes about eight minutes to reach Earth, around which eight planets orbit, Earth being the most important to us.',
          'The Sun supplies the energy that makes life possible: light for plants, warmth for the climate, and solar power for people.',
        ],
      },
    },
  },
  {
    id: 'water',
    cat: { ar: 'الطبيعة', fr: 'Nature', en: 'Nature' },
    related: ['africa', 'heart'],
    content: {
      ar: {
        title: 'الماء',
        summary: 'سائل شفاف يغطي معظم سطح الأرض وهو أساس الحياة.',
        body: [
          'الماء سائل شفاف لا لون له ولا طعم ولا رائحة، وهو المادة الأكثر شيوعاً على سطح الأرض.',
          'يغطي الماء حوالي 71% من سطح الأرض، معظمه مالح في البحار والمحيطات، وجزء صغير عذب في الأنهار والبحيرات.',
          'يتجمد الماء عند صفر درجة مئوية، ويغلي عند مئة درجة، وهو المادة الوحيدة الشائعة الموجودة في الحالات الثلاث.',
          'الماء ضروري لجميع الكائنات الحية، فجسم الإنسان يتكون من نحو 60% منه، ويستخدم في الزراعة والصناعة.',
        ],
      },
      fr: {
        title: "L'eau",
        summary: "Un liquide transparent qui couvre la majeure partie de la surface terrestre et fonde la vie.",
        body: [
          "L'eau est un liquide transparent, sans couleur, sans goût ni odeur ; c'est la substance la plus répandue à la surface de la Terre.",
          "Elle couvre environ 71 % de la surface terrestre : surtout salée dans les mers et océans, et une petite partie douce dans les rivières et les lacs.",
          "Elle gèle à 0 °C et bout à 100 °C ; c'est la seule substance courante présente sous les trois états.",
          "L'eau est indispensable à tous les êtres vivants : le corps humain en contient environ 60 %, et elle sert à l'agriculture et à l'industrie.",
        ],
      },
      en: {
        title: 'Water',
        summary: 'A transparent liquid covering most of Earth’s surface and the basis of life.',
        body: [
          'Water is a transparent liquid with no colour, taste or smell; it is the most common substance on Earth’s surface.',
          'Water covers about 71% of Earth’s surface — mostly salty in seas and oceans, with a small fresh part in rivers and lakes.',
          'It freezes at 0 °C and boils at 100 °C, and it is the only common substance found in all three states.',
          'Water is essential to all living things: the human body is about 60% water, and it is used in farming and industry.',
        ],
      },
    },
  },
  {
    id: 'pyramids',
    cat: { ar: 'تاريخ', fr: 'Histoire', en: 'History' },
    related: ['africa', 'water'],
    content: {
      ar: {
        title: 'أهرامات الجيزة',
        summary: 'من أعظم آثار مصر القديمة وواحدة من عجائب الدنيا السبع.',
        body: [
          'أهرامات الجيزة من أعظم آثار مصر القديمة، بُنيت قبل أكثر من 4500 سنة قرب نهر النيل.',
          'الهرم الأكبر (هرم خوفو) بقي أطول بناء في العالم لآلاف السنين، بارتفاع أصلي يقارب 146 متراً.',
          'بُنيت الأهرامات لتكون مقابر للفراعنة، وكان العمال يجرّون كتلاً حجرية ضخمة عبر منحدرات.',
          'ما زالت الأهرامات تجذب ملايين الزوار سنوياً وتكشف لنا أسرار الحضارة المصرية القديمة.',
        ],
      },
      fr: {
        title: 'Pyramides de Gizeh',
        summary: "Parmi les plus grands monuments de l'Égypte ancienne et l'une des sept merveilles du monde.",
        body: [
          "Les pyramides de Gizeh comptent parmi les plus grands monuments de l'Égypte ancienne ; elles furent construites il y a plus de 4 500 ans près du Nil.",
          "La grande pyramide (celle de Khéops) est restée la plus haute construction du monde pendant des millénaires, avec une hauteur initiale d'environ 146 mètres.",
          "Elles servaient de tombeaux aux pharaons ; les ouvriers tiraient d'énormes blocs de pierre le long de rampes.",
          "Les pyramides attirent encore des millions de visiteurs chaque année et révèlent les secrets de la civilisation égyptienne antique.",
        ],
      },
      en: {
        title: 'Pyramids of Giza',
        summary: 'Among the greatest monuments of ancient Egypt and one of the Seven Wonders.',
        body: [
          'The Pyramids of Giza are among the greatest monuments of ancient Egypt, built more than 4,500 years ago near the Nile.',
          'The Great Pyramid (of Khufu) remained the tallest structure in the world for millennia, with an original height of about 146 metres.',
          'They were built as tombs for the pharaohs; workers hauled enormous stone blocks along ramps.',
          'The pyramids still attract millions of visitors each year and reveal the secrets of ancient Egyptian civilisation.',
        ],
      },
    },
  },
  {
    id: 'heart',
    cat: { ar: 'أحياء', fr: 'Biologie', en: 'Biology' },
    related: ['water', 'sun'],
    content: {
      ar: {
        title: 'القلب',
        summary: 'العضلة التي تضخ الدم في الجسم وتعمل دون توقف.',
        body: [
          'القلب عضلة بحجم قبضة اليد تقع في الصدر، وتعمل مضخة تضخ الدم إلى جميع أنحاء الجسم.',
          'ينبض القلب نحو مئة ألف مرة في اليوم، أي أكثر من ملياري نبضة خلال حياة الإنسان.',
          'يدفع القلب الدم المحمّل بالأكسجين من الرئتين إلى الأعضاء، ويعيد الدم المحمّل بثاني أكسيد الكربون.',
          'ممارسة الرياضة وتناول الطعام الصحي يقوّيان عضلة القلب ويقيان من أمراضه.',
        ],
      },
      fr: {
        title: 'Le cœur',
        summary: "Le muscle qui pompe le sang dans tout le corps et travaille sans arrêt.",
        body: [
          "Le cœur est un muscle de la taille d'un poing situé dans la poitrine ; il agit comme une pompe qui envoie le sang dans tout le corps.",
          "Il bat environ cent mille fois par jour, soit plus de deux milliards de battements au cours d'une vie humaine.",
          "Il propulse le sang chargé d'oxygène des poumons vers les organes, et ramène le sang chargé de dioxyde de carbone.",
          "L'exercice physique et une alimentation saine renforcent le muscle cardiaque et le protègent des maladies.",
        ],
      },
      en: {
        title: 'The Heart',
        summary: 'The muscle that pumps blood around the body and works without stopping.',
        body: [
          'The heart is a fist-sized muscle in the chest; it acts as a pump that sends blood to every part of the body.',
          'It beats about a hundred thousand times a day — more than two billion beats in a human lifetime.',
          'It pushes oxygen-rich blood from the lungs to the organs and brings back blood carrying carbon dioxide.',
          'Exercise and healthy food strengthen the heart muscle and protect it from disease.',
        ],
      },
    },
  },
  {
    id: 'africa',
    cat: { ar: 'جغرافيا', fr: 'Géographie', en: 'Geography' },
    related: ['pyramids', 'water'],
    content: {
      ar: {
        title: 'أفريقيا',
        summary: 'ثاني أكبر قارات العالم مساحة وسكاناً، ومهد الحضارات القديمة.',
        body: [
          'أفريقيا ثاني أكبر قارات العالم مساحة وسكاناً، ويعيش فيها أكثر من مليار ونصف المليار نسمة.',
          'يمر خط الاستواء بوسطها، وتضم الصحراء الكبرى أوسع صحراء حارة في العالم.',
          'يجري فيها نهر النيل أطول أنهار العالم، وتمتد فيها غابات وسافانا وبحيرات كبرى.',
          'تضم أفريقيا أكثر من خمسين دولة، وهي مهد الحضارة المصرية القديمة وموطن تنوع ثقافي هائل.',
        ],
      },
      fr: {
        title: "L'Afrique",
        summary: "Le deuxième continent du monde par la superficie et la population, berceau de civilisations anciennes.",
        body: [
          "L'Afrique est le deuxième continent du monde par la superficie et la population ; plus d'un milliard et demi de personnes y vivent.",
          "L'équateur traverse son centre, et elle abrite le Sahara, le plus vaste désert chaud du monde.",
          "Le Nil, le plus long fleuve du monde, y coule, au milieu de forêts, de savanes et de grands lacs.",
          "L'Afrique compte plus de cinquante pays ; elle est le berceau de la civilisation égyptienne antique et d'une immense diversité culturelle.",
        ],
      },
      en: {
        title: 'Africa',
        summary: 'The world’s second-largest continent by area and population, and a cradle of ancient civilisations.',
        body: [
          'Africa is the world’s second-largest continent by area and population, home to more than one and a half billion people.',
          'The equator crosses its middle, and it contains the Sahara, the world’s largest hot desert.',
          'The Nile, the world’s longest river, flows through it, amid forests, savannas and great lakes.',
          'Africa has more than fifty countries; it is the cradle of ancient Egyptian civilisation and of immense cultural diversity.',
        ],
      },
    },
  },
  {
    id: 'atom',
    cat: { ar: 'علوم', fr: 'Sciences', en: 'Science' },
    related: ['sun', 'heart'],
    content: {
      ar: {
        title: 'الذرة',
        summary: 'أصغر وحدة في العنصر الكيميائي، ولبنة بناء كل مادة في الكون.',
        body: [
          'الذرة أصغر وحدة في العنصر الكيميائي، وكل مادة في الكون مبنية منها.',
          'تتكون الذرة من نواة تحتوي البروتونات الموجبة والنيوترونات، وتدور حولها إلكترونات سالبة.',
          'معظم حجم الذرة فراغ، ولو كبّرنا النواة إلى حجم حبة رمل لأصبحت الذرة بحجم ملعب كبير.',
          'عدد البروتونات في النواة يحدد نوع العنصر: ذرة واحدة فقط تفصل الهيدروجين عن الهيليوم.',
        ],
      },
      fr: {
        title: "L'atome",
        summary: "La plus petite unité d'un élément chimique, brique de toute la matière de l'univers.",
        body: [
          "L'atome est la plus petite unité d'un élément chimique ; toute la matière de l'univers en est construite.",
          "Il se compose d'un noyau contenant des protons positifs et des neutrons, autour duquel gravitent des électrons négatifs.",
          "L'atome est surtout du vide : si le noyau avait la taille d'un grain de sable, l'atome aurait celle d'un grand stade.",
          "Le nombre de protons du noyau détermine l'élément : un seul proton sépare l'hydrogène de l'hélium.",
        ],
      },
      en: {
        title: 'The Atom',
        summary: 'The smallest unit of a chemical element — the building block of all matter in the universe.',
        body: [
          'The atom is the smallest unit of a chemical element; all matter in the universe is built from it.',
          'It consists of a nucleus containing positive protons and neutrons, with negative electrons orbiting around it.',
          'The atom is mostly empty space: if the nucleus were the size of a grain of sand, the atom would be the size of a large stadium.',
          'The number of protons in the nucleus determines the element: a single proton separates hydrogen from helium.',
        ],
      },
    },
  },
]

export interface QuestionContent {
  q: string
  options: string[]
  correct: number
}

export interface Question {
  id: number
  difficulty: number // 1 = easy, 2 = medium, 3 = hard
  content: Record<Lang, QuestionContent>
}

export const QUIZ: Question[] = [
  {
    id: 1,
    difficulty: 1,
    content: {
      ar: { q: 'ما النجم الذي يقع في مركز مجموعتنا الشمسية؟', options: ['الشمس', 'القمر', 'المريخ', 'المشتري'], correct: 0 },
      fr: { q: 'Quelle étoile se trouve au centre de notre système solaire ?', options: ['Le Soleil', 'La Lune', 'Mars', 'Jupiter'], correct: 0 },
      en: { q: 'Which star is at the centre of our solar system?', options: ['The Sun', 'The Moon', 'Mars', 'Jupiter'], correct: 0 },
    },
  },
  {
    id: 2,
    difficulty: 2,
    content: {
      ar: { q: 'كم يستغرق ضوء الشمس للوصول إلى الأرض؟', options: ['ثانية واحدة', 'حوالي 8 دقائق', 'ساعة واحدة', 'سنة كاملة'], correct: 1 },
      fr: { q: 'Combien de temps la lumière du Soleil met-elle pour atteindre la Terre ?', options: ['Une seconde', 'Environ 8 minutes', 'Une heure', 'Une année'], correct: 1 },
      en: { q: 'How long does sunlight take to reach Earth?', options: ['One second', 'About 8 minutes', 'One hour', 'A full year'], correct: 1 },
    },
  },
  {
    id: 3,
    difficulty: 1,
    content: {
      ar: { q: 'عند أي درجة حرارة يتجمد الماء؟', options: ['صفر درجة', 'مئة درجة', 'خمسين درجة', 'عشر درجات تحت الصفر'], correct: 0 },
      fr: { q: "À quelle température l'eau gèle-t-elle ?", options: ['0 °C', '100 °C', '50 °C', '−10 °C'], correct: 0 },
      en: { q: 'At what temperature does water freeze?', options: ['0 °C', '100 °C', '50 °C', '−10 °C'], correct: 0 },
    },
  },
  {
    id: 4,
    difficulty: 2,
    content: {
      ar: { q: 'ما النسبة التقريبية لسطح الأرض المغطاة بالماء؟', options: ['71%', '50%', '30%', '10%'], correct: 0 },
      fr: { q: "Quelle part de la surface terrestre est couverte d'eau environ ?", options: ['71 %', '50 %', '30 %', '10 %'], correct: 0 },
      en: { q: 'Roughly how much of Earth’s surface is covered by water?', options: ['71%', '50%', '30%', '10%'], correct: 0 },
    },
  },
  {
    id: 5,
    difficulty: 1,
    content: {
      ar: { q: 'أين تقع أهرامات الجيزة؟', options: ['مصر', 'اليونان', 'الصين', 'المكسيك'], correct: 0 },
      fr: { q: 'Où se trouvent les pyramides de Gizeh ?', options: ['Égypte', 'Grèce', 'Chine', 'Mexique'], correct: 0 },
      en: { q: 'Where are the Pyramids of Giza located?', options: ['Egypt', 'Greece', 'China', 'Mexico'], correct: 0 },
    },
  },
  {
    id: 6,
    difficulty: 2,
    content: {
      ar: { q: 'كم مرة ينبض القلب في اليوم تقريباً؟', options: ['مئة ألف مرة', 'ألف مرة', 'عشرة آلاف مرة', 'مليون مرة'], correct: 0 },
      fr: { q: 'Combien de fois le cœur bat-il par jour environ ?', options: ['100 000 fois', '1 000 fois', '10 000 fois', 'Un million de fois'], correct: 0 },
      en: { q: 'Roughly how many times does the heart beat per day?', options: ['100,000', '1,000', '10,000', 'One million'], correct: 0 },
    },
  },
  {
    id: 7,
    difficulty: 2,
    content: {
      ar: { q: 'ما أطول أنهار العالم؟', options: ['النيل', 'الأمازون', 'المسيسيبي', 'الفرات'], correct: 0 },
      fr: { q: 'Quel est le plus long fleuve du monde ?', options: ['Le Nil', "L'Amazone", 'Le Mississippi', "L'Euphrate"], correct: 0 },
      en: { q: 'What is the world’s longest river?', options: ['The Nile', 'The Amazon', 'The Mississippi', 'The Euphrates'], correct: 0 },
    },
  },
  {
    id: 8,
    difficulty: 3,
    content: {
      ar: { q: 'ما الجسيمات التي تحدد نوع العنصر الكيميائي؟', options: ['البروتونات', 'الإلكترونات', 'النيوترونات', 'الفوتونات'], correct: 0 },
      fr: { q: "Quelles particules déterminent l'élément chimique ?", options: ['Les protons', 'Les électrons', 'Les neutrons', 'Les photons'], correct: 0 },
      en: { q: 'Which particles determine the chemical element?', options: ['Protons', 'Electrons', 'Neutrons', 'Photons'], correct: 0 },
    },
  },
]
