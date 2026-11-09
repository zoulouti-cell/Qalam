/** Thematic backbone: every section, figure and article belongs to one topic with
    a big idea, a learning path and animated data. This is the unity layer. */
import type { Lang } from './i18n'
import type { Domain, Subject } from './scientificFigure'

export type T = Record<Lang, string>

export type Topic = {
  id: string
  branch: Domain
  icon: string
  title: T
  idea: T
  figure: Subject
  more?: Subject[]
  /** regex sources matched against article title + category */
  keywords: string
  sectionRoute: string
  path: T[]
  related: string[]
  chart: {
    title: T
    unit: T
    rows: { label: T; value: number }[]
  }
}

const t = (ar: string, fr: string, en: string): T => ({ ar, fr, en })

export const TOPICS: Topic[] = [
  {
    id: 'stars',
    branch: 'space',
    icon: 'star',
    title: t('النجوم', 'Les étoiles', 'Stars'),
    idea: t('النجم توازن بين جاذبية تضغط وضغط يدفع، ومصيره تحسمه كتلته.', 'Une étoile est un équilibre entre gravité et pression ; sa masse décide de son destin.', 'A star balances gravity against pressure; its mass decides its fate.'),
    figure: 'nebula',
    more: ['comet'],
    keywords: 'نجم|نجوم|شمس|stellaire|étoile|star|مستعر|supernova|قزم أبيض|neben',
    sectionRoute: '#/section/فضاء',
    path: [
      t('ألاحظ: لون النجم وحرارته', 'Observer : couleur et température', 'Observe: colour and temperature'),
      t('أفهم: الاندماج وتوازن الضغط', 'Comprendre : fusion et équilibre', 'Understand: fusion and balance'),
      t('أطبّق: أتوقّع مصير كتلة معطاة', 'Appliquer : prédire un destin', 'Apply: predict a fate'),
    ],
    related: ['planets', 'galaxies'],
    chart: {
      title: t('أعمار النجوم بحسب الكتلة', 'Durée de vie selon la masse', 'Lifetime by mass'),
      unit: t('مليون سنة', 'millions d’années', 'million years'),
      rows: [
        { label: t('0.5 كتلة شمسية', '0,5 M☉', '0.5 M☉'), value: 100000 },
        { label: t('1 كتلة شمسية', '1 M☉', '1 M☉'), value: 10000 },
        { label: t('8 كتل شمسية', '8 M☉', '8 M☉'), value: 100 },
        { label: t('20 كتلة شمسية', '20 M☉', '20 M☉'), value: 10 },
      ],
    },
  },
  {
    id: 'planets',
    branch: 'space',
    icon: 'public',
    title: t('الكواكب', 'Les planètes', 'Planets'),
    idea: t('الكوكب جسم يدور حول نجم، وشكله وغلافه ينتجان عن تاريخه الحراري.', 'Une planète orbite une étoile ; forme et atmosphère résultent de son histoire thermique.', 'A planet orbits a star; its shape and atmosphere come from its thermal history.'),
    figure: 'gasGiant',
    more: ['rockyPlanet'],
    keywords: 'كوكب|كواكب|planète|planet|مريخ|mars|مشتري|jupiter|زحل|saturne|أرض|terre',
    sectionRoute: '#/section/فضاء',
    path: [
      t('ألاحظ: الأحجام والمسافات', 'Observer : tailles et distances', 'Observe: sizes and distances'),
      t('أفهم: الجاذبية والغلاف الجوي', 'Comprendre : gravité et atmosphère', 'Understand: gravity and atmosphere'),
      t('أطبّق: أقارن كوكبين', 'Appliquer : comparer deux planètes', 'Apply: compare two planets'),
    ],
    related: ['stars', 'oceans'],
    chart: {
      title: t('أقطار الكواكب (بالنسبة للأرض)', 'Diamètres (Terre = 1)', 'Diameters (Earth = 1)'),
      unit: t('قطر أرضي', 'diamètres terrestres', 'Earth diameters'),
      rows: [
        { label: t('عطارد', 'Mercure', 'Mercury'), value: 0.38 },
        { label: t('المريخ', 'Mars', 'Mars'), value: 0.53 },
        { label: t('الأرض', 'Terre', 'Earth'), value: 1 },
        { label: t('المشتري', 'Jupiter', 'Jupiter'), value: 11 },
      ],
    },
  },
  {
    id: 'galaxies',
    branch: 'space',
    icon: 'auto_awesome',
    title: t('المجرات', 'Les galaxies', 'Galaxies'),
    idea: t('المجرة تجمّع نجوم وغاز وغبار يدور حول مركز، وبنيتها تحكي تاريخ اندماجها.', 'Une galaxie est un ensemble d’étoiles, gaz et poussière en rotation.', 'A galaxy is stars, gas and dust rotating around a centre.'),
    figure: 'galaxy',
    keywords: 'مجر[ةّ]|galaxie|galaxy|درب التبانة|voie lactée',
    sectionRoute: '#/section/فضاء',
    path: [
      t('ألاحظ: الشكل الحلزوني', 'Observer : la spirale', 'Observe: the spiral'),
      t('أفهم: الدوران والنجوم الفتية', 'Comprendre : rotation', 'Understand: rotation'),
      t('أطبّق: أقدّر عدد النجوم', 'Appliquer : estimer les étoiles', 'Apply: estimate star count'),
    ],
    related: ['stars'],
    chart: {
      title: t('مكوّنات المجرة', 'Composition galactique', 'Galaxy composition'),
      unit: t('نسبة %', 'pourcentage', 'percent'),
      rows: [
        { label: t('نجوم', 'Étoiles', 'Stars'), value: 5 },
        { label: t('غاز', 'Gaz', 'Gas'), value: 10 },
        { label: t('مادة مظلمة', 'Matière noire', 'Dark matter'), value: 85 },
      ],
    },
  },
  {
    id: 'volcanoes',
    branch: 'earth',
    icon: 'local_fire_department',
    title: t('البراكين', 'Les volcans', 'Volcanoes'),
    idea: t('البركان نافذة على باطن الأرض: صعود الصهارة وتحرر الغازات يحددان نوع الثوران.', 'Un volcan est une fenêtre sur l’intérieur terrestre.', 'A volcano is a window into Earth’s interior.'),
    figure: 'volcano',
    keywords: 'بركان|volcan|زلزال|séisme|صهارة|magma|حمم|lave',
    sectionRoute: '#/section/علوم',
    path: [
      t('ألاحظ: الشكل والمخروط', 'Observer : le cône', 'Observe: the cone'),
      t('أفهم: الصهارة والضغط', 'Comprendre : magma et pression', 'Understand: magma and pressure'),
      t('أطبّق: أفسّر ثوراناً هادئاً وآخر متفجراً', 'Appliquer : comparer deux éruptions', 'Apply: compare two eruptions'),
    ],
    related: ['oceans'],
    chart: {
      title: t('حرارة الحمم عند الثوران', 'Température des laves', 'Lava temperatures'),
      unit: t('درجة مئوية', '°C', '°C'),
      rows: [
        { label: t('بازلتية', 'Basaltique', 'Basaltic'), value: 1200 },
        { label: t('أنديزيتية', 'Andésitique', 'Andesitic'), value: 1000 },
        { label: t('ريوليتية', 'Rhyolitique', 'Rhyolitic'), value: 800 },
      ],
    },
  },
  {
    id: 'oceans',
    branch: 'earth',
    icon: 'water',
    title: t('المحيطات', 'Les océans', 'Oceans'),
    idea: t('المحيط ينظّم حرارة الأرض عبر تدرج حراري وملحي يحرّك الكتل المائية.', 'L’océan régule la chaleur par des gradients de température et de salinité.', 'The ocean regulates heat through temperature and salinity gradients.'),
    figure: 'oceanLayers',
    keywords: 'محيط|océan|ocean|بحر|mer|تيار بحري|courant',
    sectionRoute: '#/section/علوم إنسانية',
    path: [
      t('ألاحظ: تغيّر اللون والعمق', 'Observer : profondeur et couleur', 'Observe: depth and colour'),
      t('أفهم: الكثافة والتدرج الحراري', 'Comprendre : densité et thermocline', 'Understand: density and thermocline'),
      t('أطبّق: أفسّر التيارات', 'Appliquer : expliquer les courants', 'Apply: explain currents'),
    ],
    related: ['volcanoes', 'planets'],
    chart: {
      title: t('أعماق مرجعية توضيحية', 'Profondeurs illustratives', 'Illustrative depth levels'),
      unit: t('متر', 'mètres', 'metres'),
      rows: [
        { label: t('سطح', 'Surface', 'Surface'), value: 24 },
        { label: t('200 م', '200 m', '200 m'), value: 12 },
        { label: t('1000 م', '1 000 m', '1 000 m'), value: 4 },
        { label: t('4000 م', '4 000 m', '4 000 m'), value: 2 },
      ],
    },
  },
  {
    id: 'cells',
    branch: 'life',
    icon: 'biotech',
    title: t('الخلايا', 'Les cellules', 'Cells'),
    idea: t('الخلية وحدة الحياة: غشاء يفصل، ونواة تحفظ، وميتوكوندريا تمدّ بالطاقة.', 'La cellule est l’unité du vivant : membrane, noyau, mitochondries.', 'The cell is the unit of life: membrane, nucleus, mitochondria.'),
    figure: 'cell',
    keywords: 'خلية|cellule|cell\b|ميتوكوندريا|mitochondrie|عضية|organite',
    sectionRoute: '#/section/علوم',
    path: [
      t('ألاحظ: الحدود والبنى', 'Observer : frontières et organites', 'Observe: boundaries and organelles'),
      t('أفهم: وظيفة كل عضية', 'Comprendre : rôle de chaque organite', 'Understand: each organelle’s role'),
      t('أطبّق: أقارن خلية نباتية وحيوانية', 'Appliquer : comparer deux cellules', 'Apply: compare two cells'),
    ],
    related: ['dna', 'humanBody'],
    chart: {
      title: t('أبعاد بيولوجية', 'Échelles du vivant', 'Biological scales'),
      unit: t('ميكرومتر', 'µm', 'µm'),
      rows: [
        { label: t('فيروس', 'Virus', 'Virus'), value: 0.1 },
        { label: t('بكتيريا', 'Bactérie', 'Bacterium'), value: 2 },
        { label: t('خلية حيوانية', 'Cellule animale', 'Animal cell'), value: 20 },
        { label: t('عصبون', 'Neurone', 'Neuron'), value: 100 },
      ],
    },
  },
  {
    id: 'dna',
    branch: 'life',
    icon: 'genetics',
    title: t('الوراثة', 'L’hérédité', 'Heredity'),
    idea: t('المعلومة الوراثية محمولة في تسلسل قواعدي، ونسخها الأمين أساس استمرار الحياة.', 'L’information génétique est un texte chimique copié fidèlement.', 'Genetic information is a chemical text copied faithfully.'),
    figure: 'dna',
    keywords: 'dna|adn|جين|gène|وراثة|hérédité|كروموسوم|chromosome',
    sectionRoute: '#/section/علوم',
    path: [
      t('ألاحظ: اللولب المزدوج', 'Observer : la double hélice', 'Observe: the double helix'),
      t('أفهم: الاقتران القاعدي', 'Comprendre : appariement', 'Understand: base pairing'),
      t('أطبّق: أكمل سلسلة متممة', 'Appliquer : compléter une séquence', 'Apply: complete a sequence'),
    ],
    related: ['cells'],
    chart: {
      title: t('طول الجينوم', 'Taille des génomes', 'Genome sizes'),
      unit: t('مليون قاعدة', 'millions de paires', 'million bp'),
      rows: [
        { label: t('فيروس', 'Virus', 'Virus'), value: 0.01 },
        { label: t('بكتيريا', 'Bactérie', 'Bacterium'), value: 4.6 },
        { label: t('ذبابة', 'Mouche', 'Fruit fly'), value: 140 },
        { label: t('إنسان', 'Humain', 'Human'), value: 3000 },
      ],
    },
  },
  {
    id: 'humanBody',
    branch: 'life',
    icon: 'favorite',
    title: t('جسم الإنسان', 'Le corps humain', 'The human body'),
    idea: t('الجسم منظومة نقل وتحكم: القلب يضخ، والأعصاب تنقل الإشارة، والتنظيم يحفظ التوازن.', 'Le corps est un système de transport et de contrôle.', 'The body is a transport and control system.'),
    figure: 'heart',
    more: ['neuron'],
    keywords: 'قلب|cœur|coeur|heart|عصبون|neurone|دم|sang|دماغ|cerveau',
    sectionRoute: '#/section/علوم',
    path: [
      t('ألاحظ: الحجرات والصمامات', 'Observer : cavités et valves', 'Observe: chambers and valves'),
      t('أفهم: الدورة الدموية', 'Comprendre : circulation', 'Understand: circulation'),
      t('أطبّق: أحسب النتاج القلبي', 'Appliquer : calculer le débit', 'Apply: compute cardiac output'),
    ],
    related: ['cells', 'waves'],
    chart: {
      title: t('معدل النبض حسب الحالة', 'Fréquence cardiaque', 'Heart rate'),
      unit: t('نبضة/دقيقة', 'bpm', 'bpm'),
      rows: [
        { label: t('راحة', 'Repos', 'Rest'), value: 65 },
        { label: t('مشي', 'Marche', 'Walking'), value: 100 },
        { label: t('جري', 'Course', 'Running'), value: 160 },
      ],
    },
  },
  {
    id: 'atoms',
    branch: 'chemistry',
    icon: 'blur_on',
    title: t('الذرات', 'Les atomes', 'Atoms'),
    idea: t('الذرة نواة صغيرة وسحابة إلكترونية؛ ترتيب الإلكترونات يفسر التفاعل الكيميائي.', 'L’atome : noyau et nuage électronique ; les orbitales expliquent la réactivité.', 'An atom: nucleus and electron cloud; orbitals explain reactivity.'),
    figure: 'atom',
    more: ['crystal'],
    keywords: 'ذرة|atome|atom|إلكترون|électron|دورية|périodique',
    sectionRoute: '#/section/علوم',
    path: [
      t('ألاحظ: النواة والمدارات', 'Observer : noyau et orbitales', 'Observe: nucleus and orbitals'),
      t('أفهم: مستويات الطاقة', 'Comprendre : niveaux d’énergie', 'Understand: energy levels'),
      t('أطبّق: أتوقّع ارتباط ذرتين', 'Appliquer : prédire une liaison', 'Apply: predict a bond'),
    ],
    related: ['molecules'],
    chart: {
      title: t('نصف قطر ذري', 'Rayons atomiques', 'Atomic radii'),
      unit: t('بيكومتر', 'pm', 'pm'),
      rows: [
        { label: t('هيدروجين', 'Hydrogène', 'Hydrogen'), value: 53 },
        { label: t('كربون', 'Carbone', 'Carbon'), value: 70 },
        { label: t('أوكسجين', 'Oxygène', 'Oxygen'), value: 60 },
        { label: t('حديد', 'Fer', 'Iron'), value: 156 },
      ],
    },
  },
  {
    id: 'molecules',
    branch: 'chemistry',
    icon: 'science',
    title: t('الجزيئات', 'Les molécules', 'Molecules'),
    idea: t('الشكل الهندسي للجزيء يحدد خواصه؛ قطبية الماء مثال مركزي للحياة.', 'La géométrie moléculaire détermine les propriétés.', 'Molecular geometry determines properties.'),
    figure: 'waterMolecule',
    keywords: 'جزيء|molécule|molecule|ماء|eau|water|رابطة|liaison',
    sectionRoute: '#/section/علوم',
    path: [
      t('ألاحظ: الزوايا والروابط', 'Observer : angles et liaisons', 'Observe: angles and bonds'),
      t('أفهم: القطبية والروابط الهيدروجينية', 'Comprendre : polarité', 'Understand: polarity'),
      t('أطبّق: أفسّر التوتر السطحي', 'Appliquer : tension de surface', 'Apply: surface tension'),
    ],
    related: ['atoms', 'cells'],
    chart: {
      title: t('الحرارة النوعية', 'Chaleur massique', 'Specific heat'),
      unit: t('J/g·K', 'J/g·K', 'J/g·K'),
      rows: [
        { label: t('ماء', 'Eau', 'Water'), value: 4.18 },
        { label: t('حديد', 'Fer', 'Iron'), value: 0.45 },
        { label: t('رمل', 'Sable', 'Sand'), value: 0.83 },
      ],
    },
  },
  {
    id: 'waves',
    branch: 'physics',
    icon: 'graphic_eq',
    title: t('الموجات والضوء', 'Ondes et lumière', 'Waves and light'),
    idea: t('الموجة نقل للطاقة، وتداخلها يفسر الألوان والحيود والقياسات الدقيقة.', 'Une onde transporte de l’énergie ; ses interférences expliquent couleurs et diffraction.', 'A wave carries energy; interference explains colour and diffraction.'),
    figure: 'waveInterference',
    more: ['prism'],
    keywords: 'موجة|onde|wave|ضوء|lumière|light|طيف|spectre|ليزر|laser',
    sectionRoute: '#/section/علوم',
    path: [
      t('ألاحظ: القمم والقيعان', 'Observer : crêtes et creux', 'Observe: crests and troughs'),
      t('أفهم: الطول الموجي والتردد', 'Comprendre : λ et fréquence', 'Understand: wavelength and frequency'),
      t('أطبّق: أحسب التداخل البنّاء', 'Appliquer : condition constructive', 'Apply: constructive condition'),
    ],
    related: ['humanBody'],
    chart: {
      title: t('أطوال موجية للضوء المرئي', 'Spectre visible', 'Visible spectrum'),
      unit: t('نانومتر', 'nm', 'nm'),
      rows: [
        { label: t('بنفسجي', 'Violet', 'Violet'), value: 400 },
        { label: t('أزرق', 'Bleu', 'Blue'), value: 470 },
        { label: t('أخضر', 'Vert', 'Green'), value: 530 },
        { label: t('أحمر', 'Rouge', 'Red'), value: 700 },
      ],
    },
  },
  {
    id: 'electricity',
    branch: 'physics',
    icon: 'bolt',
    title: t('الكهرباء', 'L’électricité', 'Electricity'),
    idea: t('التيار حركة شحنات في مسار مغلق، وقانون أوم يربط الجهد بالتيار والمقاومة.', 'Le courant est un mouvement de charges ; la loi d’Ohm relie V, I et R.', 'Current is moving charge; Ohm’s law links V, I and R.'),
    figure: 'circuit',
    keywords: 'كهرباء|électricité|circuit|دارة|تيار|courant|جهد|tension',
    sectionRoute: '#/section/تقنية',
    path: [
      t('ألاحظ: المسار المغلق', 'Observer : circuit fermé', 'Observe: closed path'),
      t('أفهم: V=IR والقدرة', 'Comprendre : V=IR', 'Understand: V=IR'),
      t('أطبّق: أحسب تياراً', 'Appliquer : calculer I', 'Apply: compute I'),
    ],
    related: ['ai'],
    chart: {
      title: t('قدرة أجهزة منزلية', 'Puissance d’appareils', 'Appliance power'),
      unit: t('واط', 'watts', 'watts'),
      rows: [
        { label: t('مصباح LED', 'Lampe LED', 'LED lamp'), value: 10 },
        { label: t('حاسوب', 'Ordinateur', 'Computer'), value: 150 },
        { label: t('مكيف', 'Climatiseur', 'Air conditioner'), value: 2000 },
      ],
    },
  },
  {
    id: 'ai',
    branch: 'tech',
    icon: 'memory',
    title: t('الذكاء الاصطناعي', 'Intelligence artificielle', 'Artificial intelligence'),
    idea: t('النموذج يتعلم أنماطاً من أمثلة؛ قراره احتمال لا يقين مطلق.', 'Le modèle apprend des motifs ; sa sortie est une probabilité.', 'The model learns patterns; its output is a probability, not certainty.'),
    figure: 'neuralNet',
    more: ['chip'],
    keywords: 'ذكاء اصطناعي|intelligence artificielle|neural|شبكة عصبية|تعلم|apprentissage',
    sectionRoute: '#/section/تقنية',
    path: [
      t('ألاحظ: طبقات الشبكة', 'Observer : couches', 'Observe: layers'),
      t('أفهم: الأوزان والانتشار العكسي', 'Comprendre : poids et rétropropagation', 'Understand: weights and backprop'),
      t('أطبّق: أفحص خطأ نموذج', 'Appliquer : analyser une erreur', 'Apply: inspect an error'),
    ],
    related: ['electricity'],
    chart: {
      title: t('نمو المعاملات في النماذج', 'Croissance des paramètres', 'Parameter growth'),
      unit: t('مليون معامل', 'millions de paramètres', 'million params'),
      rows: [
        { label: t('2012', '2012', '2012'), value: 60 },
        { label: t('2018', '2018', '2018'), value: 340 },
        { label: t('2020', '2020', '2020'), value: 175000 },
        { label: t('2024', '2024', '2024'), value: 1000000 },
      ],
    },
  },
]

export const topicById = (id: string) => TOPICS.find((x) => x.id === id)

export function topicForArticle(title: string, category: string): Topic | null {
  const text = `${title} ${category}`
  for (const topic of TOPICS) {
    if (new RegExp(topic.keywords, 'i').test(text)) return topic
  }
  return null
}

export function topicsByBranch(branch: Domain): Topic[] {
  return TOPICS.filter((x) => x.branch === branch)
}

/** ordered trail for breadcrumbs / unity banner */
export function topicTrail(topic: Topic, lang: Lang): string[] {
  return [topic.title[lang], topic.path[0][lang]]
}
