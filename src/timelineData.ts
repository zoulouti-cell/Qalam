import type { Lang } from './i18n'

export interface TimelineEvent {
  id: string
  time: Record<Lang, string>
  domain: Record<Lang, string>
  title: Record<Lang, string>
  kids: Record<Lang, string>
  detail: Record<Lang, string>
  source: { label: string; url: string }
}

/** A first time-and-space learning path, sourced from NASA science pages. */
export const COSMIC_HISTORY: TimelineEvent[] = [
  {
    id: 'universe',
    time: { ar: 'قبل نحو 13.8 مليار سنة', fr: 'Il y a environ 13,8 milliards d’années', en: 'About 13.8 billion years ago' },
    domain: { ar: 'الكون', fr: 'Univers', en: 'Universe' },
    title: { ar: 'بداية تمدد الكون', fr: 'Début de l’expansion de l’Univers', en: 'The universe begins expanding' },
    kids: { ar: 'بدأ الكون من حالة شديدة الحرارة والكثافة، ثم أخذ يتمدّد ويبرد.', fr: 'L’Univers était extrêmement chaud et dense, puis il a commencé à s’étendre et à refroidir.', en: 'The universe was extremely hot and dense, then it began to expand and cool.' },
    detail: { ar: 'يصف نموذج الانفجار العظيم تطور الكون من حالة مبكرة حارة وكثيفة. ما الذي أطلق التمدد الأول؟ لا نعرف ذلك بعد.', fr: 'Le modèle du Big Bang décrit l’évolution de l’Univers depuis un état initial très chaud et dense. La cause de l’expansion initiale reste inconnue.', en: 'The Big Bang model describes the universe evolving from an early hot, dense state. What triggered the initial expansion is still unknown.' },
    source: { label: 'NASA · Hubble Big Bang', url: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-big-bang/' },
  },
  {
    id: 'cmb',
    time: { ar: 'بعد البداية بنحو 380 ألف سنة', fr: 'Environ 380 000 ans après le début', en: 'About 380,000 years after the beginning' },
    domain: { ar: 'الكون المرصود', fr: 'Univers observable', en: 'Observable universe' },
    title: { ar: 'انطلاق أقدم ضوء نرصده', fr: 'La plus ancienne lumière observable', en: 'The oldest light we can observe' },
    kids: { ar: 'صار الضوء قادرًا على السفر عبر الكون. نرصد بقاياه اليوم على هيئة إشعاع خافت في كل الاتجاهات.', fr: 'La lumière a pu voyager dans l’Univers. Nous en observons encore une faible lueur dans toutes les directions.', en: 'Light could travel through the universe. We still detect its faint afterglow in every direction.' },
    detail: { ar: 'عندما برد الكون بما يكفي لتتكوّن الذرات، تحرر الضوء الذي نرصده اليوم بوصفه إشعاع الخلفية الكونية الميكروي.', fr: 'Quand l’Univers s’est suffisamment refroidi pour former des atomes, la lumière s’est libérée. Nous la détectons aujourd’hui comme le fond diffus cosmologique.', en: 'As the universe cooled enough for atoms to form, light was released. We detect it today as the cosmic microwave background.' },
    source: { label: 'NASA · Big Bang and the evolution of the universe', url: 'https://science.nasa.gov/astrophysics/programs/physics-of-the-cosmos/big-bang-and-the-evolution-of-the-universe/' },
  },
  {
    id: 'galaxies',
    time: { ar: 'خلال أول مليار سنة', fr: 'Pendant le premier milliard d’années', en: 'During the first billion years' },
    domain: { ar: 'النجوم والمجرات الأولى', fr: 'Premières étoiles et galaxies', en: 'First stars and galaxies' },
    title: { ar: 'تكوّن النجوم والمجرات الأولى', fr: 'Formation des premières étoiles et galaxies', en: 'The first stars and galaxies form' },
    kids: { ar: 'تجمّع الغاز بفعل الجاذبية، فاشتعلت نجوم صغيرة وبدأت المجرات تظهر.', fr: 'La gravité a rassemblé le gaz : les premières étoiles se sont allumées et les galaxies ont commencé à apparaître.', en: 'Gravity gathered gas into the first stars, and galaxies began to appear.' },
    detail: { ar: 'تبحث التلسكوبات عن حقبة الفجر الكوني؛ ويُقدّر أنها امتدت تقريبًا من عشرات ملايين السنين إلى نحو مليار سنة بعد بداية الكون.', fr: 'Les télescopes étudient l’aube cosmique, une période estimée entre quelques dizaines de millions d’années et environ un milliard d’années après le début de l’Univers.', en: 'Telescopes study cosmic dawn, estimated to span from tens of millions to about a billion years after the universe began.' },
    source: { label: 'NASA · Early Universe', url: 'https://science.nasa.gov/mission/webb/early-universe/' },
  },
  {
    id: 'solar-system',
    time: { ar: 'قبل نحو 4.6 مليار سنة', fr: 'Il y a environ 4,6 milliards d’années', en: 'About 4.6 billion years ago' },
    domain: { ar: 'مجرة درب التبانة · النظام الشمسي', fr: 'Voie lactée · Système solaire', en: 'Milky Way · Solar System' },
    title: { ar: 'ولادة الشمس والنظام الشمسي', fr: 'Naissance du Soleil et du système solaire', en: 'The Sun and Solar System take shape' },
    kids: { ar: 'انهارت سحابة من الغاز والغبار. تجمّع معظمها في الشمس، والتحمت بقاياها لتصنع الكواكب.', fr: 'Un nuage de gaz et de poussière s’est effondré. Le Soleil s’est formé au centre et les restes ont bâti les planètes.', en: 'A cloud of gas and dust collapsed. Most formed the Sun; the remaining material joined to make planets.' },
    detail: { ar: 'تشير الأدلة إلى أن النظام الشمسي تكوّن من سحابة بين نجمية انهارت إلى قرص دوّار؛ ثم تراكمت المواد في الشمس والكواكب وأجسام أصغر.', fr: 'Les indices suggèrent qu’un nuage interstellaire s’est effondré en disque rotatif ; la matière s’est ensuite accumulée dans le Soleil, les planètes et de plus petits corps.', en: 'Evidence indicates an interstellar cloud collapsed into a rotating disk; material then accumulated into the Sun, planets, and smaller bodies.' },
    source: { label: 'NASA · Solar System: Facts', url: 'https://science.nasa.gov/solar-system/solar-system-facts/' },
  },
  {
    id: 'earth',
    time: { ar: 'قبل نحو 4.5 مليار سنة', fr: 'Il y a environ 4,5 milliards d’années', en: 'About 4.5 billion years ago' },
    domain: { ar: 'الأرض · الكوكب الثالث من الشمس', fr: 'Terre · troisième planète du Soleil', en: 'Earth · third planet from the Sun' },
    title: { ar: 'تشكّل الأرض', fr: 'Formation de la Terre', en: 'Earth forms' },
    kids: { ar: 'تجمّعت الصخور والغبار حول الشمس حتى أصبحت الأرض كوكبًا. كانت الأرض الأولى شديدة الحرارة.', fr: 'Des roches et de la poussière se sont assemblées autour du Soleil pour former la Terre, alors très chaude.', en: 'Rock and dust gathered around the Sun to form Earth, which was extremely hot at first.' },
    detail: { ar: 'تصف ناسا تشكّل الأرض قبل نحو 4.5 مليار سنة، حين جذبت الجاذبية الغاز والغبار الدوّارين إلى الكوكب الثالث من الشمس.', fr: 'La NASA situe la formation de la Terre il y a environ 4,5 milliards d’années, lorsque la gravité a rassemblé le gaz et la poussière en troisième planète du Soleil.', en: 'NASA places Earth’s formation about 4.5 billion years ago, as gravity pulled swirling gas and dust into the third planet from the Sun.' },
    source: { label: 'NASA · Facts About Earth', url: 'https://science.nasa.gov/earth/facts/' },
  },
  {
    id: 'life',
    time: { ar: 'أقدم الأحافير المعروفة: نحو 3.5 مليار سنة', fr: 'Plus anciens fossiles connus : environ 3,5 milliards d’années', en: 'Oldest known fossils: about 3.5 billion years old' },
    domain: { ar: 'الأرض · البيئات القديمة', fr: 'Terre · environnements anciens', en: 'Earth · ancient environments' },
    title: { ar: 'أدلة مبكرة على الحياة', fr: 'Premières traces connues de vie', en: 'Early evidence of life' },
    kids: { ar: 'عاشت كائنات بسيطة جدًا على الأرض منذ زمن بعيد. الأحافير تساعد العلماء على معرفة ذلك.', fr: 'De minuscules êtres vivants existaient sur Terre il y a très longtemps. Les fossiles aident les scientifiques à le découvrir.', en: 'Very simple living things existed on Earth long ago. Fossils help scientists investigate this history.' },
    detail: { ar: 'تعود أقدم الأحافير المعروفة إلى نحو 3.5 مليار سنة، وقد تشير أدلة أخرى إلى نشاط حيوي أقدم؛ أما نشأة الحياة نفسها فما زالت سؤالًا بحثيًا.', fr: 'Les plus anciens fossiles connus datent d’environ 3,5 milliards d’années. D’autres indices pourraient signaler une activité plus ancienne ; l’origine de la vie reste étudiée.', en: 'The oldest known fossils date to about 3.5 billion years ago. Other evidence may point to earlier biological activity; life’s origin remains an open research question.' },
    source: { label: 'NASA/JPL · Life on Earth', url: 'https://cneos.jpl.nasa.gov/about/life_on_earth.html' },
  },
]
