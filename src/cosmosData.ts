import type { Lang } from './i18n'

/* ============================================================
   Cosmos data — academic register (15+).
   Real physical values from NASA Planetary Fact Sheets, ESA Gaia,
   EHT, Planck 2018. Trilingual.
   ============================================================ */

export type BodyId =
  | 'sun' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune'
  | 'nebula' | 'galaxy' | 'comet' | 'blackhole' | 'darkmatter'

export type BodyKind =
  | 'star' | 'rocky' | 'gasGiant' | 'iceGiant' | 'moon'
  | 'nebula' | 'galaxy' | 'comet' | 'blackhole' | 'darkmatter'

export type CosmosAnnotation = {
  /** surface point for spherical bodies (degrees) */
  lat?: number
  lon?: number
  /** local-space point for deep-sky objects */
  xyz?: [number, number, number]
  title: Record<Lang, string>
  desc: Record<Lang, string>
}

export type CosmosBody = {
  id: BodyId
  kind: BodyKind
  title: Record<Lang, string>
  subtitle: Record<Lang, string>
  mass: Record<Lang, string>
  radius: Record<Lang, string>
  temp: Record<Lang, string>
  distance?: Record<Lang, string>
  density?: Record<Lang, string>
  facts: Record<Lang, string>
  /** procedural palette: [bandA, bandB, bandC] hex */
  palette: [string, string, string]
  rings?: boolean
  greatSpot?: boolean
  polarCaps?: boolean
  group: 'solar' | 'deep' | 'cosmic'
  annotations?: CosmosAnnotation[]
}

const BODIES: CosmosBody[] = [
  {
    id: 'sun', kind: 'star', group: 'solar',
    title: { ar: 'الشمس', fr: 'Le Soleil', en: 'The Sun' },
    subtitle: { ar: 'نجم قزم أصفر — G2V', fr: 'Naine jaune — G2V', en: 'Yellow dwarf — G2V' },
    mass: { ar: '1.989 × 10³⁰ كغ', fr: '1,989 × 10³⁰ kg', en: '1.989 × 10³⁰ kg' },
    radius: { ar: '696 340 كم', fr: '696 340 km', en: '696,340 km' },
    temp: { ar: '5 778 كلفن (السطح) · 15.7 مليون كلفن (اللب)', fr: '5 778 K (surface) · 15,7 MK (cœur)', en: '5,778 K (surface) · 15.7 MK (core)' },
    distance: { ar: '149.6 مليون كم عن الأرض', fr: '149,6 M km de la Terre', en: '149.6 M km from Earth' },
    density: { ar: '1.408 غ/سم³', fr: '1,408 g/cm³', en: '1.408 g/cm³' },
    facts: {
      ar: 'يضم 99.86% من كتلة المجموعة الشمسية. يندمج في لبه 600 مليون طن هيدروجين كل ثانية عبر سلسلة بروتون-بروتون، وينبعث طاقته كفوتونات تستغرق ~100 ألف سنة لتصل السطح.',
      fr: 'Il concentre 99,86 % de la masse du système solaire. Son cœur fusionne 600 millions de tonnes d’hydrogène par seconde via la chaîne proton-proton.',
      en: 'It holds 99.86% of the Solar System’s mass. Its core fuses 600 million tonnes of hydrogen per second via the proton–proton chain.',
    },
    palette: ['#ffd98a', '#ffb347', '#e8893c'],
  },
  {
    id: 'mercury', kind: 'rocky', group: 'solar',
    title: { ar: 'عطارد', fr: 'Mercure', en: 'Mercury' },
    subtitle: { ar: 'أقرب الكواكب وأصغرها', fr: 'La plus petite et proche', en: 'Smallest, closest planet' },
    mass: { ar: '3.30 × 10²³ كغ', fr: '3,30 × 10²³ kg', en: '3.30 × 10²³ kg' },
    radius: { ar: '2 440 كم', fr: '2 440 km', en: '2,440 km' },
    temp: { ar: '−173 إلى +427 °م', fr: '−173 à +427 °C', en: '−173 to +427 °C' },
    distance: { ar: '57.9 مليون كم', fr: '57,9 M km', en: '57.9 M km' },
    density: { ar: '5.43 غ/سم³', fr: '5,43 g/cm³', en: '5.43 g/cm³' },
    facts: {
      ar: 'لا غلاف جوي تقريباً، فالحرارة تقفز بين ليل ونهار. لبه الحديدي يمثل ~85% من نصف قطره، وهو أشد الكواكب كثافة بعد الأرض.',
      fr: 'Presque sans atmosphère, la température bascule entre jour et nuit. Son noyau de fer occupe ~85 % de son rayon.',
      en: 'Almost no atmosphere, so temperature swings wildly. Its iron core is ~85% of its radius.',
    },
    palette: ['#b8b0a8', '#8f8a84', '#6f6a66'],
  },
  {
    id: 'venus', kind: 'rocky', group: 'solar',
    title: { ar: 'الزهرة', fr: 'Vénus', en: 'Venus' },
    subtitle: { ar: 'الكوكب الأشد حرارة', fr: 'La planète la plus chaude', en: 'The hottest planet' },
    mass: { ar: '4.87 × 10²⁴ كغ', fr: '4,87 × 10²⁴ kg', en: '4.87 × 10²⁴ kg' },
    radius: { ar: '6 052 كم', fr: '6 052 km', en: '6,052 km' },
    temp: { ar: '464 °م (متوسط)', fr: '464 °C (moyenne)', en: '464 °C (mean)' },
    distance: { ar: '108.2 مليون كم', fr: '108,2 M km', en: '108.2 M km' },
    density: { ar: '5.24 غ/سم³', fr: '5,24 g/cm³', en: '5.24 g/cm³' },
    facts: {
      ar: 'غلافه من CO₂ كثيف (ضغط 92 ضعف الأرض) يسبب احتباساً حرارياً جامحاً. يدور عكسياً (شمسه تشرق من الغرب) ويدور حول نفسه أبطأ من سنته.',
      fr: 'Son atmosphère de CO₂ (92 fois la pression terrestre) provoque un effet de serre extrême. Rotation rétrograde.',
      en: 'Its dense CO₂ atmosphere (92× Earth’s pressure) drives a runaway greenhouse effect. Retrograde rotation.',
    },
    palette: ['#e8c48a', '#d4a45e', '#a9773b'],
  },
  {
    id: 'earth', kind: 'rocky', group: 'solar',
    title: { ar: 'الأرض', fr: 'La Terre', en: 'Earth' },
    subtitle: { ar: 'الكوكب الوحيد المؤكّد للحياة', fr: 'La seule planète à vie confirmée', en: 'The only confirmed living planet' },
    mass: { ar: '5.97 × 10²⁴ كغ', fr: '5,97 × 10²⁴ kg', en: '5.97 × 10²⁴ kg' },
    radius: { ar: '6 371 كم', fr: '6 371 km', en: '6,371 km' },
    temp: { ar: '15 °م (متوسط)', fr: '15 °C (moyenne)', en: '15 °C (mean)' },
    distance: { ar: '149.6 مليون كم عن الشمس', fr: '149,6 M km du Soleil', en: '149.6 M km from the Sun' },
    density: { ar: '5.51 غ/سم³ (الأعلى)', fr: '5,51 g/cm³ (max)', en: '5.51 g/cm³ (highest)' },
    facts: {
      ar: 'غلاف جوي 78% نيتروجين و21% أكسجين، ومحيطات تغطي 71% من السطح، ومجال مغناطيسي يصد الرياح الشمسية. اللب الداخلي حديدي صلب يدور داخل لب خارجي سائل.',
      fr: 'Atmosphère 78 % N₂ / 21 % O₂, océans à 71 %, champ magnétique protecteur. Noyau interne solide dans un noyau externe liquide.',
      en: '78% N₂ / 21% O₂ atmosphere, 71% oceans, a protective magnetic field. Solid inner core within a liquid outer core.',
    },
    palette: ['#3f7fd8', '#2f6ab0', '#1f4f88'],
    polarCaps: true,
  },
  {
    id: 'moon', kind: 'moon', group: 'solar',
    title: { ar: 'القمر', fr: 'La Lune', en: 'The Moon' },
    subtitle: { ar: 'تابع الأرض', fr: 'Satellite de la Terre', en: 'Earth’s satellite' },
    mass: { ar: '7.35 × 10²² كغ', fr: '7,35 × 10²² kg', en: '7.35 × 10²² kg' },
    radius: { ar: '1 737 كم', fr: '1 737 km', en: '1,737 km' },
    temp: { ar: '−20 °م (متوسط)', fr: '−20 °C (moyenne)', en: '−20 °C (mean)' },
    distance: { ar: '384 400 كم عن الأرض', fr: '384 400 km de la Terre', en: '384,400 km from Earth' },
    density: { ar: '3.34 غ/سم³', fr: '3,34 g/cm³', en: '3.34 g/cm³' },
    facts: {
      ar: 'نشأ غالباً من اصطدام عملاق بالأرض المبكرة. مقيد مدّياً (يواجه الأرض بوجه واحد). المدّ الذي يسببه يبطئ دوران الأرض تدريجياً.',
      fr: 'Formée probablement par un impact géant. Verrouillée en rotation synchrone ; ses marées ralentissent la rotation terrestre.',
      en: 'Likely formed by a giant impact. Tidally locked; its tides slowly lengthen Earth’s day.',
    },
    palette: ['#cfc9c0', '#a8a39c', '#7e7a75'],
  },
  {
    id: 'mars', kind: 'rocky', group: 'solar',
    title: { ar: 'المريخ', fr: 'Mars', en: 'Mars' },
    subtitle: { ar: 'الكوكب الأحمر', fr: 'La planète rouge', en: 'The red planet' },
    mass: { ar: '6.42 × 10²³ كغ', fr: '6,42 × 10²³ kg', en: '6.42 × 10²³ kg' },
    radius: { ar: '3 390 كم', fr: '3 390 km', en: '3,390 km' },
    temp: { ar: '−63 °م (متوسط)', fr: '−63 °C (moyenne)', en: '−63 °C (mean)' },
    distance: { ar: '227.9 مليون كم عن الشمس', fr: '227,9 M km du Soleil', en: '227.9 M km from the Sun' },
    density: { ar: '3.93 غ/سم³', fr: '3,93 g/cm³', en: '3.93 g/cm³' },
    facts: {
      ar: 'يضم أوليمبوس مونس (أعلى بركان، 21 كم) ووادي مارينيريس (4000 كم). مياه جليدية قطبية وآثار أنهار قديمة، مع غلاف CO₂ رقيق.',
      fr: 'Olympus Mons (plus haut volcan, 21 km) et Valles Marineris (4 000 km). Calottes de glace et traces d’anciennes rivières.',
      en: 'Olympus Mons (tallest volcano, 21 km) and Valles Marineris (4,000 km). Polar ice and ancient river traces.',
    },
    palette: ['#c1440e', '#a3552a', '#7a3f22'],
    polarCaps: true,
  },
  {
    id: 'jupiter', kind: 'gasGiant', group: 'solar',
    title: { ar: 'المشتري', fr: 'Jupiter', en: 'Jupiter' },
    subtitle: { ar: 'أضخم الكواكب', fr: 'La plus massive', en: 'The most massive planet' },
    mass: { ar: '1.898 × 10²⁷ كغ (318 أرضاً)', fr: '1,898 × 10²⁷ kg (318 Terres)', en: '1.898 × 10²⁷ kg (318 Earths)' },
    radius: { ar: '69 911 كم', fr: '69 911 km', en: '69,911 km' },
    temp: { ar: '−110 °م (أعلى الغيوم)', fr: '−110 °C (sommet des nuages)', en: '−110 °C (cloud tops)' },
    distance: { ar: '778.5 مليون كم', fr: '778,5 M km', en: '778.5 M km' },
    density: { ar: '1.33 غ/سم³', fr: '1,33 g/cm³', en: '1.33 g/cm³' },
    facts: {
      ar: 'غلاف هيدروجين/هيليوم بأحزمة حمل حراري. البقعة الحمراء العظيمة إعصار مضاد أوسع من الأرض مستمر منذ قرون. 95 قمراً مؤكداً.',
      fr: 'Atmosphère H/He avec bandes convectives. La Grande Tache rouge est un anticyclone plus large que la Terre. 95 lunes confirmées.',
      en: 'H/He atmosphere with convective bands. The Great Red Spot is an anticyclone wider than Earth, active for centuries. 95 moons.',
    },
    palette: ['#e8cfa8', '#c99a63', '#a9743f'],
    greatSpot: true,
  },
  {
    id: 'saturn', kind: 'gasGiant', group: 'solar',
    title: { ar: 'زحل', fr: 'Saturne', en: 'Saturn' },
    subtitle: { ar: 'سيد الحلقات', fr: 'Le seigneur des anneaux', en: 'The ringed planet' },
    mass: { ar: '5.68 × 10²⁶ كغ', fr: '5,68 × 10²⁶ kg', en: '5.68 × 10²⁶ kg' },
    radius: { ar: '58 232 كم', fr: '58 232 km', en: '58,232 km' },
    temp: { ar: '−140 °م', fr: '−140 °C', en: '−140 °C' },
    distance: { ar: '1.43 مليار كم', fr: '1,43 G km', en: '1.43 G km' },
    density: { ar: '0.687 غ/سم³ (أقل من الماء)', fr: '0,687 g/cm³ (moins que l’eau)', en: '0.687 g/cm³ (less than water)' },
    facts: {
      ar: 'حلقاته من جليد وصخر (بسمك أمتار وامتداد 282 ألف كم) تحكمها أقمار راعية. كثافته أقل من الماء. 146 قمراً.',
      fr: 'Anneaux de glace et roche (282 000 km de large, quelques mètres d’épaisseur). Densité inférieure à l’eau. 146 lunes.',
      en: 'Rings of ice and rock (282,000 km wide, metres thick) shepherded by moons. Density less than water. 146 moons.',
    },
    palette: ['#e8d9a8', '#cbb57e', '#a08a52'],
    rings: true,
  },
  {
    id: 'uranus', kind: 'iceGiant', group: 'solar',
    title: { ar: 'أورانوس', fr: 'Uranus', en: 'Uranus' },
    subtitle: { ar: 'الكوكب المائل', fr: 'La planète inclinée', en: 'The tilted planet' },
    mass: { ar: '8.68 × 10²⁵ كغ', fr: '8,68 × 10²⁵ kg', en: '8.68 × 10²⁵ kg' },
    radius: { ar: '25 362 كم', fr: '25 362 km', en: '25,362 km' },
    temp: { ar: '−195 °م', fr: '−195 °C', en: '−195 °C' },
    distance: { ar: '2.87 مليار كم', fr: '2,87 G km', en: '2.87 G km' },
    density: { ar: '1.27 غ/سم³', fr: '1,27 g/cm³', en: '1.27 g/cm³' },
    facts: {
      ar: 'محوره مائل 97.8° فيدور «على جنبه». غلاف ميثان يمنحه لوناً أزرق-أخضر. أبرد غلاف جوي كوكبي.',
      fr: 'Axe incliné à 97,8° : il roule « sur le côté ». Le méthane lui donne sa teinte cyan.',
      en: 'Axis tilted 97.8°, rolling on its side. Methane gives it a cyan tint; coldest planetary atmosphere.',
    },
    palette: ['#9fd8d8', '#7fc4c8', '#5aa8b0'],
  },
  {
    id: 'neptune', kind: 'iceGiant', group: 'solar',
    title: { ar: 'نبتون', fr: 'Neptune', en: 'Neptune' },
    subtitle: { ar: 'أبعد الكواكب وأسرعها رياحاً', fr: 'La plus lointaine, vents extrêmes', en: 'Most distant, fastest winds' },
    mass: { ar: '1.024 × 10²⁶ كغ', fr: '1,024 × 10²⁶ kg', en: '1.024 × 10²⁶ kg' },
    radius: { ar: '24 622 كم', fr: '24 622 km', en: '24,622 km' },
    temp: { ar: '−200 °م', fr: '−200 °C', en: '−200 °C' },
    distance: { ar: '4.5 مليار كم', fr: '4,5 G km', en: '4.5 G km' },
    density: { ar: '1.64 غ/سم³', fr: '1,64 g/cm³', en: '1.64 g/cm³' },
    facts: {
      ar: 'رياح تبلغ 2 100 كم/س (الأسرع في المجموعة). بقع داكنة عواصف عابرة. أُكملت أول دورة حول الشمس منذ اكتشافه عام 1846 في 2011.',
      fr: 'Vents à 2 100 km/h (les plus rapides). Taches sombres éphémères. Première révolution complète observée en 2011.',
      en: 'Winds reach 2,100 km/h (fastest). Transient dark storms. First full orbit since 1846 discovery completed in 2011.',
    },
    palette: ['#5f8fd8', '#3f6fb8', '#2a4f8f'],
  },
  {
    id: 'nebula', kind: 'nebula', group: 'deep',
    title: { ar: 'السديم', fr: 'La nébuleuse', en: 'The nebula' },
    subtitle: { ar: 'مهد النجوم', fr: 'La pouponnière stellaire', en: 'Stellar nursery' },
    mass: { ar: '~700 كتلة شمسية (سديم أوريون)', fr: '~700 masses solaires (Orion)', en: '~700 solar masses (Orion)' },
    radius: { ar: '~24 سنة ضوئية', fr: '~24 années-lumière', en: '~24 light-years' },
    temp: { ar: '~10 000 كلفن (الغاز المتأين)', fr: '~10 000 K (gaz ionisé)', en: '~10,000 K (ionized gas)' },
    facts: {
      ar: 'غاز (غالباً هيدروجين) وغبار يتوهج بخطوط انبعاث تحت أشعة النجوم الفتية. هنا تنهار الكتل الكثيفة وتولد النجوم.',
      fr: 'Gaz (surtout hydrogène) et poussière émettant en raies sous le rayonnement UV des jeunes étoiles.',
      en: 'Gas (mostly hydrogen) and dust glowing in emission lines under young stars’ UV light. Dense cores collapse into stars.',
    },
    palette: ['#8f5bd8', '#d85b7d', '#3f8fd8'],
  },
  {
    id: 'galaxy', kind: 'galaxy', group: 'deep',
    title: { ar: 'المجرّة', fr: 'La galaxie', en: 'The galaxy' },
    subtitle: { ar: 'درب التبانة', fr: 'La Voie lactée', en: 'The Milky Way' },
    mass: { ar: '~1.5 × 10¹² كتلة شمسية (شاملة المادة المظلمة)', fr: '~1,5 × 10¹² M☉ (avec matière noire)', en: '~1.5 × 10¹² M☉ (incl. dark matter)' },
    radius: { ar: '~100 000 سنة ضوئية', fr: '~100 000 al', en: '~100,000 ly' },
    temp: { ar: '~10⁷ كلفن (الغاز البينجمي الساخن)', fr: '~10⁷ K (gaz interstellaire)', en: '~10⁷ K (hot interstellar gas)' },
    facts: {
      ar: 'أذرع حلزونية من نجوم فتية وغاز تدور حول نواة. نحو 10¹¹ نجماً، وفي مركزها الثقب الأسود Sgr A* (4.3 مليون كتلة شمسية).',
      fr: 'Bras spiraux de jeunes étoiles et de gaz autour d’un bulbe. ~10¹¹ étoiles et un trou noir central Sgr A* de 4,3 M M☉.',
      en: 'Spiral arms of young stars and gas around a bulge. ~10¹¹ stars and a central black hole Sgr A* of 4.3 million M☉.',
    },
    palette: ['#9fc2ff', '#ffe2b8', '#7fa0e0'],
  },
  {
    id: 'comet', kind: 'comet', group: 'deep',
    title: { ar: 'المذنّب', fr: 'La comète', en: 'The comet' },
    subtitle: { ar: 'زائر جليدي', fr: 'Le visiteur glacé', en: 'Icy visitor' },
    mass: { ar: '~10¹³–10¹⁴ كغ', fr: '~10¹³–10¹⁴ kg', en: '~10¹³–10¹⁴ kg' },
    radius: { ar: 'نواة 1–10 كم', fr: 'noyau 1–10 km', en: 'nucleus 1–10 km' },
    temp: { ar: '~−100 إلى −200 °م (النواة)', fr: '~−100 à −200 °C (noyau)', en: '~−100 to −200 °C (nucleus)' },
    facts: {
      ar: 'كرة «ثلج متسخ» من جليد ماء وCO₂ وغبار. عند الاقتراب من الشمس يتصعّد الجليد فيتشكل ذيلان: غاز/أيونات وغبار. نشأت في حزام كايبر أو سحابة أورت.',
      fr: 'Boule de glace d’eau, CO₂ et poussière. Près du Soleil, la glace se sublime et forme deux queues : gaz/ions et poussière.',
      en: 'A “dirty snowball” of water ice, CO₂ and dust. Near the Sun the ice sublimates, forming gas/ion and dust tails.',
    },
    palette: ['#dff0ff', '#8fd4ff', '#5aa8d0'],
  },
  {
    id: 'blackhole', kind: 'blackhole', group: 'deep',
    title: { ar: 'الثقب الأسود', fr: 'Le trou noir', en: 'The black hole' },
    subtitle: { ar: 'أفق الحدث', fr: 'L’horizon des événements', en: 'The event horizon' },
    mass: { ar: '4.3 × 10⁶ كتلة شمسية (Sgr A*)', fr: '4,3 × 10⁶ M☉ (Sgr A*)', en: '4.3 × 10⁶ M☉ (Sgr A*)' },
    radius: { ar: '~12.7 مليون كم (شفارتزشيلد)', fr: '~12,7 M km (Schwarzschild)', en: '~12.7 M km (Schwarzschild)' },
    temp: { ar: '~10¹⁰ كلفن (القرص التراكمي الداخلي)', fr: '~10¹⁰ K (disque interne)', en: '~10¹⁰ K (inner accretion disk)' },
    facts: {
      ar: 'منطقة تنحني عندها الجاذبية حتى لا يفلت الضوء. صُوّر ظله لأول مرة (M87* 2019، ثم Sgr A* 2022) بمشروع أفق الحدث، مؤكداً النسبية العامة.',
      fr: 'Région où la gravité courbe l’espace-temps au point que la lumière ne s’échappe pas. Ombre imagée par l’EHT (M87* 2019, Sgr A* 2022).',
      en: 'A region where gravity bends spacetime so light cannot escape. Its shadow was imaged by the EHT (M87* 2019, Sgr A* 2022).',
    },
    palette: ['#ffb36b', '#ff7a3d', '#0a0a12'],
  },
  {
    id: 'darkmatter', kind: 'darkmatter', group: 'cosmic',
    title: { ar: 'المادة المظلمة', fr: 'La matière noire', en: 'Dark matter' },
    subtitle: { ar: 'الكتلة الخفية للكون', fr: 'La masse cachée de l’Univers', en: 'The Universe’s hidden mass' },
    mass: { ar: '~26.8% من كثافة طاقة الكون', fr: '~26,8 % de la densité d’énergie', en: '~26.8% of the Universe’s energy density' },
    radius: { ar: 'هالة تمتد أبعد من المجرات', fr: 'halo s’étendant au-delà des galaxies', en: 'halo extending beyond galaxies' },
    temp: { ar: '«باردة» (غير نسبية) في النموذج القياسي', fr: '« froide » (non relativiste) dans le modèle standard', en: '“cold” (non-relativistic) in the standard model' },
    facts: {
      ar: 'لا تُرى ولا تصدر ضوءاً، نستدل عليها من منحنيات دوران المجرات (تبقى السرعة ثابتة خارج القرص)، وعدسات الجاذبية، وعنقود الرصاص. مرشحوها WIMPs وaxions؛ ولم يُرصد تفاعل مباشر بعد (بلانك 2018).',
      fr: 'Invisible, déduite des courbes de rotation, des lentilles gravitationnelles et de l’amas du Boulet. Candidats : WIMPs, axions. Pas de détection directe (Planck 2018).',
      en: 'Invisible; inferred from flat rotation curves, gravitational lensing and the Bullet Cluster. Candidates WIMPs/axions; no direct detection yet (Planck 2018).',
    },
    palette: ['#7a5bd8', '#4a2f8a', '#2a1f4a'],
  },
]

export const COSMOS_BODIES = BODIES
export const bodyById = (id: string) => BODIES.find((b) => b.id === id)

/** ordered cosmos trail: from nebula → … → dark matter */
export const COSMOS_TRAIL: BodyId[] = [
  'nebula', 'sun', 'mercury', 'venus', 'earth', 'moon', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'comet', 'galaxy', 'blackhole', 'darkmatter',
]
