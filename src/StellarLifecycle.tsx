import { useEffect, useMemo, useRef, useState } from 'react'
import Mi from './Mi'
import type { Lang } from './i18n'
import type { Level } from './content'
import StageFigure from './StageFigure'
import type { StageKey } from './stellarFigures'
import './stellar.css'

/* ============================================================
   Stellar Life Cycle — interactive scientific model
   Physics & sequence after NASA Science (stars / stellar evolution)
   and NASA Space Place; Chandrasekhar limit and mass thresholds cited.
   ============================================================ */

type PathId = 'brown' | 'sun' | 'massive8' | 'massive20'
type StageId =
  | 'cloud'
  | 'protostar'
  | 'mainSun'
  | 'mainMassive'
  | 'redGiant'
  | 'redSupergiant'
  | 'planetary'
  | 'supernova'
  | 'whiteDwarf'
  | 'brownDwarf'
  | 'neutron'
  | 'blackHole'

type Stage = {
  id: StageId
  emoji: string
  tRange: [number, number] // surface/characteristic temperature in Kelvin
  rRange: [number, number] // radius in solar radii (R☉)
  lRange: [number, number] // luminosity in L☉
  years: number // characteristic duration in years
  fusion: Record<Lang, string>
  source: Record<Lang, string>
}

const SUN_STAGES: StageId[] = ['cloud', 'protostar', 'mainSun', 'redGiant', 'planetary', 'whiteDwarf']
const MASSIVE_STAGES: StageId[] = ['cloud', 'protostar', 'mainMassive', 'redSupergiant', 'supernova', 'neutron']
const MASSIVE_BH_STAGES: StageId[] = ['cloud', 'protostar', 'mainMassive', 'redSupergiant', 'supernova', 'blackHole']
const BROWN_STAGES: StageId[] = ['cloud', 'protostar', 'brownDwarf']

const STAGES: Record<StageId, Stage> = {
  cloud: { id: 'cloud', emoji: '☁️', tRange: [10, 20], rRange: [1e6, 1e7], lRange: [0, 0], years: 1e7, fusion: {"ar":"لا اندماج · سحابة جزيئية","fr":"aucune fusion · nuage moléculaire","en":"none · molecular cloud"}, source: {"ar":"ناسا · تكوّن النجوم","fr":"NASA · formation stellaire","en":"NASA Science · Star Formation"} },
  protostar: { id: 'protostar', emoji: '🌱', tRange: [2000, 3500], rRange: [3, 10], lRange: [0.5, 50], years: 1e6, fusion: {"ar":"ديوتيريوم → هيليوم (مؤقت)","fr":"deutérium → hélium (bref)","en":"deuterium → helium (brief)"}, source: {"ar":"تلسكوب جيمس ويب · النجوم الأولية","fr":"JWST · protoétoiles","en":"NASA Webb · Protostars"} },
  mainSun: { id: 'mainSun', emoji: '☀️', tRange: [5700, 5800], rRange: [1, 1], lRange: [1, 1], years: 1e10, fusion: {"ar":"هيدروجين → هيليوم · سلسلة بروتون-بروتون","fr":"H → He · chaîne proton-proton","en":"H → He · proton–proton chain"}, source: {"ar":"ناسا · بطاقة الشمس","fr":"NASA · fiche du Soleil","en":"NASA Sun fact sheet"} },
  mainMassive: { id: 'mainMassive', emoji: '🌟', tRange: [20000, 40000], rRange: [5, 8], lRange: [1e4, 1e5], years: 1e7, fusion: {"ar":"هيدروجين → هيليوم · دورة CNO","fr":"H → He · cycle CNO","en":"H → He · CNO cycle"}, source: {"ar":"ناسا · النجوم الضخمة","fr":"NASA · étoiles massives","en":"NASA Science · Massive stars"} },
  redGiant: { id: 'redGiant', emoji: '🔴', tRange: [3200, 3500], rRange: [100, 150], lRange: [1000, 3000], years: 1e9, fusion: {"ar":"هيليوم → كربون وأوكسجين · احتراق قشري","fr":"He → C, O · combustion en coquille","en":"He → C, O · shell burning"}, source: {"ar":"ناسا · العملاق الأحمر","fr":"NASA · géante rouge","en":"NASA Space Place · Red giant"} },
  redSupergiant: { id: 'redSupergiant', emoji: '🟠', tRange: [3400, 3600], rRange: [500, 1000], lRange: [1e5, 1e6], years: 1e6, fusion: {"ar":"قشور متراكبة: He، C، Ne، O، Si → Fe","fr":"couches : He, C, Ne, O, Si → Fe","en":"onion shells: He, C, Ne, O, Si → Fe"}, source: {"ar":"ناسا · العمالقة العظام","fr":"NASA · supergéantes","en":"NASA Science · Supergiants"} },
  planetary: { id: 'planetary', emoji: '🌌', tRange: [50000, 100000], rRange: [1, 2], lRange: [1e2, 1e4], years: 1e4, fusion: {"ar":"لا اندماج · لب ساخن مكشوف","fr":"aucune fusion · cœur chaud nu","en":"none · exposed hot core"}, source: {"ar":"هابل · السدم الكوكبية","fr":"Hubble · nébuleuses planétaires","en":"NASA Hubble · Planetary nebulae"} },
  supernova: { id: 'supernova', emoji: '💥', tRange: [1e4, 1e5], rRange: [1e4, 1e5], lRange: [1e9, 1e10], years: 0.1, fusion: {"ar":"انهيار اللب · انفجار نيوترينوي","fr":"effondrement · sursaut de neutrinos","en":"core collapse · neutrino burst"}, source: {"ar":"ناسا · فيزياء المستعرات","fr":"NASA · physique des supernovae","en":"NASA · Supernova physics"} },
  whiteDwarf: { id: 'whiteDwarf', emoji: '⚪', tRange: [8000, 20000], rRange: [0.008, 0.012], lRange: [1e-3, 1e-2], years: 1e10, fusion: {"ar":"لا اندماج · ضغط تدهور الإلكترونات","fr":"aucune fusion · dégénérescence électronique","en":"none · electron degeneracy pressure"}, source: {"ar":"ناسا · الأقزام البيضاء (حد تشاندراسيخار 1.4)","fr":"NASA · naines blanches (limite 1,4 M☉)","en":"NASA · White dwarfs (Chandrasekhar 1.4 M☉)"} },
  brownDwarf: { id: 'brownDwarf', emoji: '🟤', tRange: [500, 2000], rRange: [0.09, 0.1], lRange: [1e-5, 1e-4], years: 1e12, fusion: {"ar":"نجم فاشل · ديوتيريوم فقط","fr":"étoile manquée · deutérium seul","en":"failed star · deuterium only"}, source: {"ar":"ناسا · الأقزام البنية","fr":"NASA · naines brunes","en":"NASA Science · Brown dwarfs"} },
  neutron: { id: 'neutron', emoji: '🔵', tRange: [5e5, 1e6], rRange: [1.4e-5, 1.7e-5], lRange: [0, 1e5], years: 1e9, fusion: {"ar":"لا اندماج · تدهور النيوترونات","fr":"aucune fusion · dégénérescence neutronique","en":"none · neutron degeneracy"}, source: {"ar":"ناسا · النجوم النيوترونية","fr":"NASA · étoiles à neutrons","en":"NASA · Neutron stars"} },
  blackHole: { id: 'blackHole', emoji: '⚫', tRange: [1e6, 1e7], rRange: [2.9e-5, 3e-5], lRange: [0, 1e9], years: 1e12, fusion: {"ar":"لا اندماج · أفق الحدث","fr":"aucune fusion · horizon des événements","en":"none · event horizon"}, source: {"ar":"ناسا · الثقوب السوداء (نصف قطر شفارتزشيلد)","fr":"NASA · trous noirs (rayon de Schwarzschild)","en":"NASA · Black holes (Schwarzschild radius)"} },
}

const UI = {
  ar: {
    title: 'ما مصير النجوم؟',
    sub: 'اختر كتلة النجم الأولى، ثم تابع رحلته في الزمن والمادة.',
    mass: 'الكتلة الابتدائية',
    solarMass: 'كتلة شمسية',
    fate: 'المصير المتوقع',
    fates: { brown: 'قزم بني — نجم فاشل', sun: 'قزم أبيض', neutron: 'نجم نيوتروني', blackHole: 'ثقب أسود' },
    play: 'تشغيل', pause: 'إيقاف', speed: 'السرعة',
    stage: 'المرحلة', of: 'من',
    temperature: 'درجة الحرارة', radius: 'نصف القطر', luminosity: 'اللمعان', duration: 'المدة', fusion: 'الاندماج',
    source: 'المصدر العلمي',
    kids: 'ببساطة', academic: 'تفصيل علمي',
    next: 'المرحلة التالية', prev: 'السابق',
    years: 'سنة', million: 'مليون', billion: 'مليار',
    thresholds: 'حد تشاندراسيخار (1.4 كتلة شمسية) يحدد مصير الأقزام البيضاء.',
    hint: 'اسحب المؤشر لتغيير الكتلة، وانقر مرحلة للانتقال إليها.',
    live: 'المرحلة الحالية',
    legendCore: 'اللب', legendShell: 'الغلاف', legendEnv: 'الغلاف الخارجي',
  },
  fr: {
    title: "Quel est le destin des étoiles ?",
    sub: 'Choisissez la masse initiale, puis suivez son évolution dans le temps et la matière.',
    mass: 'Masse initiale',
    solarMass: 'masse solaire',
    fate: 'Destin attendu',
    fates: { brown: 'Naine brune — étoile manquée', sun: 'Naine blanche', neutron: 'Étoile à neutrons', blackHole: 'Trou noir' },
    play: 'Lecture', pause: 'Pause', speed: 'Vitesse',
    stage: 'Étape', of: 'sur',
    temperature: 'Température', radius: 'Rayon', luminosity: 'Luminosité', duration: 'Durée', fusion: 'Fusion',
    source: 'Source scientifique',
    kids: 'En simple', academic: 'Détail scientifique',
    next: 'Étape suivante', prev: 'Précédent',
    years: 'ans', million: 'millions', billion: 'milliards',
    thresholds: 'La limite de Chandrasekhar (1,4 masse solaire) fixe le destin des naines blanches.',
    hint: 'Déplacez le curseur pour changer la masse, cliquez une étape pour y aller.',
    live: 'Étape courante',
    legendCore: 'Cœur', legendShell: 'Coquilles', legendEnv: 'Enveloppe',
  },
  en: {
    title: 'What is the fate of stars?',
    sub: 'Choose the initial mass, then follow its evolution through time and matter.',
    mass: 'Initial mass',
    solarMass: 'solar masses',
    fate: 'Expected fate',
    fates: { brown: 'Brown dwarf — failed star', sun: 'White dwarf', neutron: 'Neutron star', blackHole: 'Black hole' },
    play: 'Play', pause: 'Pause', speed: 'Speed',
    stage: 'Stage', of: 'of',
    temperature: 'Temperature', radius: 'Radius', luminosity: 'Luminosity', duration: 'Duration', fusion: 'Fusion',
    source: 'Scientific source',
    kids: 'In simple words', academic: 'Scientific detail',
    next: 'Next stage', prev: 'Previous',
    years: 'years', million: 'million', billion: 'billion',
    thresholds: 'The Chandrasekhar limit (1.4 solar masses) decides the fate of white dwarfs.',
    hint: 'Drag the slider to change mass, click a stage to jump.',
    live: 'Current stage',
    legendCore: 'Core', legendShell: 'Shells', legendEnv: 'Envelope',
  },
} as const

type Copy = { title: string; kids: string; academic: string }

const COPY: Record<StageId, Record<Lang, Copy>> = {
  cloud: {
    ar: { title: 'سحابة جزيئية باردة', kids: 'غيمة هائلة من الغاز والغبار، باردة ومظلمة، فيها مواد النجوم القادمة.', academic: 'سحابة جزيئية عملاقة (T≈10–20 K، كثافة ~10²–10⁴ سم⁻³)؛ الانهيار الجاذبي يبدأ عند تجاوز كتلة جينز نتيجة اضطراب (موجة صدمة أو اصطدام سحابي).' },
    fr: { title: 'Nuage moléculaire froid', kids: 'Un immense nuage de gaz et de poussière, froid et sombre : la matière des futures étoiles.', academic: 'Nuage moléculaire géant (T≈10–20 K) ; l’effondrement gravitationnel démarre au-delà de la masse de Jeans après une perturbation.' },
    en: { title: 'Cold molecular cloud', kids: 'A huge cloud of gas and dust, cold and dark — the future stars’ material.', academic: 'Giant molecular cloud (T≈10–20 K); gravitational collapse begins once the Jeans mass is exceeded after a perturbation.' },
  },
  protostar: {
    ar: { title: 'نجم أوليّ', kids: 'الغيمة تنكمش وتسخن في مركزها، ويبدأ النجم الصغير بالتشكل.', academic: 'انهيار الهالة إلى قرص تراكمي مع نفاثات؛ يسخّن اللب بالانضغاط ويبدأ اندماج الديوتيريوم قبل الهيدروجين.' },
    fr: { title: 'Protoétoile', kids: 'Le nuage se contracte et chauffe au centre : la petite étoile commence à se former.', academic: 'Effondrement de l’enveloppe en disque d’accrétion avec jets ; le cœur chauffe et fusionne le deutérium avant l’hydrogène.' },
    en: { title: 'Protostar', kids: 'The cloud contracts and heats at its center; a small star begins to form.', academic: 'Envelope collapses into an accretion disk with jets; the core heats and fuses deuterium before hydrogen.' },
  },
  mainSun: {
    ar: { title: 'التسلسل الرئيسي (نجم شمسي)', kids: 'في قلب الشمس يتحول الهيدروجين إلى هيليوم، فيتوهج النجم ويضيء لسنوات طويلة جداً.', academic: 'توازن هيدروستاتيكي بين الضغط والجاذبية؛ سلسلة البروتون-بروتون تحول H→He، فيبقى اللب على ~15 مليون كلفن والسطوح ~5800 K لعشرة مليارات سنة.' },
    fr: { title: 'Séquence principale (type Soleil)', kids: 'Au cœur du Soleil, l’hydrogène devient de l’hélium : l’étoile brille très longtemps.', academic: 'Équilibre hydrostatique ; la chaîne proton-proton convertit H en He, cœur à ~15 MK, surface ~5 800 K pendant ~10 milliards d’années.' },
    en: { title: 'Main sequence (Sun-like)', kids: 'Inside the Sun hydrogen turns into helium, so the star shines for a very long time.', academic: 'Hydrostatic balance; the proton–proton chain fuses H into He — core ~15 MK, surface ~5,800 K for about 10 billion years.' },
  },
  mainMassive: {
    ar: { title: 'التسلسل الرئيسي (نجم ضخم)', kids: 'نجم أكبر وأكثر حرارة يستهلك وقوده بسرعة أكبر، لذا عمره أقصر.', academic: 'كتلة >8 كتلة شمسية تسلك دورة CNO وتفقد كتلتها بنجوم رياح قوية؛ العمر يتراوح ~10⁶–10⁷ سنة فقط.' },
    fr: { title: 'Séquence principale (étoile massive)', kids: 'Une étoile plus grosse et plus chaude consomme son carburant plus vite et vit moins longtemps.', academic: 'Au-delà de 8 masses solaires, le cycle CNO domine et les vents massifs érodent l’étoile ; durée de vie ~10⁶–10⁷ ans.' },
    en: { title: 'Main sequence (massive star)', kids: 'A bigger, hotter star burns its fuel faster, so it lives a shorter life.', academic: 'Above 8 solar masses the CNO cycle dominates and strong winds erode the star; lifetime is only ~10⁶–10⁷ years.' },
  },
  redGiant: {
    ar: { title: 'عملاق أحمر', kids: 'ينتفخ النجم ويتحول لونه إلى الأحمر، ثم يقذف طبقاته وتبقى نواته الصغيرة.', academic: 'اندماج الهيليوم في اللب (هبّة هيليوم) مع احتراق قشري للهيدروجين؛ يتضخم الغلاف إلى ~100 R☉. رصد ALMA 2024 على النجم R Doradus فقاعات حمل حراري بحجم 75 شمساً ودورة شهرية، وهو نموذج لما ستكون عليه الشمس بعد ~5 مليارات سنة.' },
    fr: { title: 'Géante rouge', kids: 'L’étoile gonfle et rougit, puis expulse ses couches et laisse un petit cœur.', academic: 'Fusion de l’hélium (flash) et combustion en coquille ; l’enveloppe atteint ~100 R☉. ALMA (2024) a suivi sur R Doradus des cellules de convection de 75 soleils, image de ce que sera le Soleil dans ~5 milliards d’années.' },
    en: { title: 'Red giant', kids: 'The star swells and reddens, then sheds its layers and leaves a small core.', academic: 'Helium fusion (flash) plus hydrogen shell burning; the envelope expands to ~100 R☉. ALMA (2024) tracked 75-solar-radius convection cells on R Doradus — a preview of the Sun in ~5 billion years.' },
  },
  redSupergiant: {
    ar: { title: 'عملاق عظيم أحمر', kids: 'طبقات متعددة تحترق مثل البصل، حتى يتحول اللب إلى حديد.', academic: 'احتراق متتالٍ في قشور: He، C، Ne، O، Si، وينتهي بلب حديدي (لا يوجد اندماج بعده) عند ~1.4 كتلة شمسية للحد.' },
    fr: { title: 'Supergéante rouge', kids: 'Plusieurs couches brûlent comme un oignon, jusqu’à un cœur de fer.', academic: 'Combustion en couches successives (He, C, Ne, O, Si) ; un cœur de fer se forme, sans fusion possible au-delà.' },
    en: { title: 'Red supergiant', kids: 'Several layers burn like an onion until the core turns to iron.', academic: 'Successive shell burning (He, C, Ne, O, Si) ends in an iron core, beyond which fusion yields no energy.' },
  },
  planetary: {
    ar: { title: 'سديم كوكبي', kids: 'النجم يطرد طبقاته الملونة في الفضاء، ويبقى قلبه الحارّ ينير الغاز.', academic: 'إطلاق الغلاف بكثافة منخفضة (سرعة ~10–30 كم/ث) حول قلب مكشوف ساخن جداً (50–100 ألف كلفن) يضيء الغاز بألوان الانبعاث.' },
    fr: { title: 'Nébuleuse planétaire', kids: 'L’étoile rejette ses couches colorées ; son cœur chaud illumine le gaz.', academic: 'Éjection de l’enveloppe (~10–30 km/s) autour d’un cœur nu très chaud (50–100 kK) qui ionise le gaz et produit des raies d’émission.' },
    en: { title: 'Planetary nebula', kids: 'The star throws its colored layers out into space, leaving a hot core that lights the gas.', academic: 'The envelope is ejected (~10–30 km/s) around a very hot exposed core (50–100 kK) that ionizes the gas, producing emission lines.' },
  },
  supernova: {
    ar: { title: 'انفجار مستعر أعظم', kids: 'اللب الحديدي ينهار فجأة، فينفجر النجم بسطوع هائل وينثر عناصره الثقيلة.', academic: 'انهيار اللب في أقل من ثانية، ارتداد نيوترينوي وموجة صدمة؛ ذروة اللمعان 10⁹–10¹⁰ L☉، ونثر عناصر CNO حتى الحديد في الوسط النجمي.' },
    fr: { title: 'Supernova', kids: 'Le cœur de fer s’effondre : l’étoile explose avec une luminosité immense et disperse ses éléments.', academic: 'Effondrement du cœur en moins d’une seconde, rebond de neutrinos et onde de choc ; pic de 10⁹–10¹⁰ L☉, dispersion des éléments lourds.' },
    en: { title: 'Supernova', kids: 'The iron core collapses; the star explodes with immense brightness and scatters heavy elements.', academic: 'The core collapses in under a second; a neutrino rebound and shock wave follow, with a peak of 10⁹–10¹⁰ L☉ distributing heavy elements.' },
  },
  whiteDwarf: {
    ar: { title: 'قزم أبيض', kids: 'يبقى قلب صغير كثيف جداً يبرد ببطء، بحجم الأرض ولكنه أثقل من الشمس.', academic: 'يتحكم بكثافته ضغط التدهور الإلكتروني؛ الكتلة ≤ 1.4 كتلة شمسية (حد تشاندراسيخار)، ثم يبرد متحولاً إلى قزم أسود نظرياً.' },
    fr: { title: 'Naine blanche', kids: 'Un petit cœur très dense refroidit lentement : taille de la Terre, masse proche du Soleil.', academic: 'La pression de dégénérescence des électrons soutient l’astre ; masse ≤ 1,4 masse solaire (limite de Chandrasekhar), puis refroidissement.' },
    en: { title: 'White dwarf', kids: 'A tiny, extremely dense core cools slowly: Earth-sized but about the Sun’s mass.', academic: 'Electron degeneracy pressure supports it; mass ≤ 1.4 solar masses (Chandrasekhar limit), then it cools toward a cold black dwarf.' },
  },
  brownDwarf: {
    ar: { title: 'قزم بني', kids: 'نجم صغير جداً لا يكفي لتشغيل الهيدروجين، فيخبو ويتبرد ببطء.', academic: 'كتلة <0.08 كتلة شمسية؛ يندمج الديوتيريوم فقط ثم يبرد ويمر بمراحل لونية (L, T, Y)؛ جسر بين الكواكب والنجوم.' },
    fr: { title: 'Naine brune', kids: 'Une étoile trop petite pour allumer l’hydrogène : elle faiblit et refroidit.', academic: 'Masse <0,08 masse solaire ; seule la fusion du deutérium se produit, puis refroidissement et classes L, T, Y.' },
    en: { title: 'Brown dwarf', kids: 'A star too small to ignite hydrogen; it fades and cools slowly.', academic: 'Mass <0.08 solar masses; only deuterium fuses, then it cools through spectral classes L, T and Y.' },
  },
  neutron: {
    ar: { title: 'نجم نيوتروني', kids: 'بقايا صغيرة بحجم مدينة، تدور بسرعة وتطلق نبضات.', academic: 'بقايا انهيار اللب: كتلة ~1.4 M☉ داخل نصف قطر ~10–12 كم، كثافة نووية، وحقول مغناطيسية هائلة؛ النبّاضات إذا كانت دوارة.' },
    fr: { title: 'Étoile à neutrons', kids: 'Un petit reste de la taille d’une ville, qui tourne vite et émet des impulsions.', academic: 'Résidu d’effondrement : ~1,4 M☉ dans ~10–12 km, densité nucléaire et champs magnétiques extrêmes ; pulsar s’il tourne.' },
    en: { title: 'Neutron star', kids: 'A tiny city-sized remnant that spins fast and sends out pulses.', academic: 'Collapse remnant: ~1.4 M☉ within ~10–12 km, nuclear density and extreme magnetic fields; a pulsar if it rotates.' },
  },
  blackHole: {
    ar: { title: 'ثقب أسود', kids: 'جاذبية قوية جداً لا يفلت منها ضوء، وله حدود تُسمى أفق الحدث.', academic: 'إذا تجاوزت بقايا اللب حد الكتلة (~2–3 M☉)، ينجرف إلى ثقب أسود؛ نصف قطر شفارتزشيلد r_s = 2GM/c² ≈ 3 كم لكل كتلة شمسية.' },
    fr: { title: 'Trou noir', kids: 'Une gravité si forte que la lumière ne s’échappe pas, avec une limite appelée horizon.', academic: 'Au-delà de ~2–3 M☉ de résidu, un trou noir se forme ; rayon de Schwarzschild r_s = 2GM/c² ≈ 3 km par masse solaire.' },
    en: { title: 'Black hole', kids: 'Gravity so strong that light cannot escape; its edge is called the event horizon.', academic: 'If the remnant exceeds ~2–3 M☉, a black hole forms; Schwarzschild radius r_s = 2GM/c² ≈ 3 km per solar mass.' },
  },
}

function pickPath(mass: number): PathId {
  if (mass < 0.08) return 'brown'
  if (mass <= 8) return 'sun'
  if (mass <= 20) return 'massive8'
  return 'massive20'
}

function stagesFor(path: PathId): StageId[] {
  if (path === 'brown') return BROWN_STAGES
  if (path === 'sun') return SUN_STAGES
  if (path === 'massive8') return MASSIVE_STAGES
  return MASSIVE_BH_STAGES
}

/** Approximate blackbody colour (Kelvin → RGB), good enough for teaching. */
function starColour(t: number): string {
  const stops: [number, [number, number, number]][] = [
    [1000, [120, 30, 10]],
    [3000, [255, 120, 60]],
    [4000, [255, 175, 110]],
    [5800, [255, 244, 214]],
    [8000, [255, 255, 255]],
    [12000, [200, 225, 255]],
    [30000, [150, 190, 255]],
    [100000, [120, 160, 255]],
  ]
  if (t <= stops[0][0]) return `rgb(${stops[0][1].join(',')})`
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1]
      const [t1, c1] = stops[i]
      const k = (t - t0) / (t1 - t0)
      const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * k))
      return `rgb(${c.join(',')})`
    }
  }
  return `rgb(${stops[stops.length - 1][1].join(',')})`
}

function fmtYears(n: number, lang: Lang, ui: (typeof UI)[Lang]): string {
  const fmt = (v: number) => new Intl.NumberFormat(lang === 'ar' ? 'ar-MA-u-nu-latn' : lang === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 0 }).format(v)
  if (n >= 1e9) return `${fmt(n / 1e9)} ${ui.billion} ${ui.years}`
  if (n >= 1e6) return `${fmt(n / 1e6)} ${ui.million} ${ui.years}`
  if (n < 1) return lang === 'ar' ? 'أيام' : lang === 'fr' ? 'jours' : 'days'
  return `${fmt(n)} ${ui.years}`
}


/* ------------------------------------------------------------------
   Latest evidence (2024–2025) — shown under the model, dated & sourced
   ------------------------------------------------------------------ */
type Fact = { date: string; ar: string; fr: string; en: string; src: string; url: string }

const LATEST: Fact[] = [
  {
    date: '2022–2025',
    ar: 'تلسكوب جيمس ويب يرصد أقراصاً ونفاثات نجوم أوليّة في سدم مثل الثور وأوريون، ويكشف جليد الماء والمركبات العضوية في أقراص تكوّن الكواكب.',
    fr: 'Le JWST observe des disques et jets de protoétoiles (Taureau, Orion) et détecte glace d’eau et molécules organiques dans des disques protoplanétaires.',
    en: 'JWST images protostellar disks and jets (Taurus, Orion) and detects water ice and organics in planet-forming disks.',
    src: 'NASA/ESA/CSA JWST',
    url: 'https://science.nasa.gov/mission/webb/',
  },
  {
    date: '2019 · 2022',
    ar: 'مشروع أفق الحدث يصوّر ظل الثقب الأسود في M87 ثم في مركز مجرتنا Sagittarius A*، مؤكداً التنبؤ النسبي بشكل الظل.',
    fr: 'L’EHT image l’ombre du trou noir de M87* puis de Sgr A* au centre de notre Galaxie, confirmant la prédiction relativiste.',
    en: 'The EHT imaged the shadow of M87* and then Sgr A* at our Galaxy’s center, confirming the relativistic shadow prediction.',
    src: 'Event Horizon Telescope',
    url: 'https://eventhorizontelescope.org/',
  },
  {
    date: '2022',
    ar: 'مهمة غايا (DR3) تنشر دقة غير مسبوقة لـ1.8 مليار نجم، فتحسّن مواقعها على مخطط هرتزسبرونغ–راسل وحساب أعمارها.',
    fr: 'Gaia DR3 publie 1,8 milliard d’étoiles avec une précision inédite, affinant leur position dans le diagramme HR et leurs âges.',
    en: 'Gaia DR3 released 1.8 billion stars with unprecedented precision, sharpening their HR-diagram positions and ages.',
    src: 'ESA Gaia DR3',
    url: 'https://www.cosmos.esa.int/web/gaia/dr3',
  },
  {
    date: '2017',
    ar: 'موجة جاذبية من اندماج نجمين نيوترونيين (GW170817) تُرصد ضوئياً: أول دليل مباشر على تخليق العناصر الثقيلة كالذهب في كيلونوفا.',
    fr: 'Une onde gravitationnelle d’une fusion d’étoiles à neutrons (GW170817) observée en lumière : preuve directe de la nucléosynthèse des éléments lourds.',
    en: 'A gravitational wave from a neutron-star merger (GW170817) seen in light: direct evidence for heavy-element synthesis in a kilonova.',
    src: 'LIGO/Virgo · NASA',
    url: 'https://science.nasa.gov/universe/gravitational-waves/',
  },
  {
    date: '2019–2021',
    ar: '«العتامة الكبرى» لمنكب الجوزاء (بيتلجيس) فُسّرت بغبار مقذوف وتبريد سطحي مؤقت، لا بأنها مقدمة انفجار وشيك.',
    fr: 'La « Grande Obscuration » de Bételgeuse s’explique par une éjection de poussière et un refroidissement temporaire, non par une supernova imminente.',
    en: 'Betelgeuse’s “Great Dimming” is explained by ejected dust and temporary cooling, not an imminent supernova.',
    src: 'ESO · Hubble',
    url: 'https://www.eso.org/public/news/eso2109/',
  },
  {
    date: '2024',
    ar: 'رصد تفاصيل سطح نجم غير الشمس: خلايا حمل حراري عملاقة على النجم العملاق الأحمر R Doradus تكشف كيف تفقد النجوم كتلتها.',
    fr: 'Premières images détaillées de la surface d’une étoile autre que le Soleil : cellules de convection géantes sur R Doradus.',
    en: 'First detailed surface images of a star other than the Sun: giant convective cells on the red giant R Doradus.',
    src: 'ALMA/ESO 2024',
    url: 'https://www.eso.org/public/news/eso2412/',
  },
]

/* ------------------------------------------------------------------
   Interactive Hertzsprung–Russell diagram (log L vs log T)
   ------------------------------------------------------------------ */
type HrPoint = { id: StageId; label: string; t: number; l: number }

function hrPoint(stage: StageId, label: string): HrPoint | null {
  const st = STAGES[stage]
  if (st.lRange[1] <= 0) return null
  const t = Math.sqrt(st.tRange[0] * st.tRange[1])
  const l = Math.sqrt(Math.max(st.lRange[0], 1e-6) * st.lRange[1])
  return { id: stage, label, t, l }
}

function HrDiagram({
  lang,
  kids,
  active,
  points,
  comparePoints,
  onPick,
}: {
  lang: Lang
  kids: boolean
  active: number
  points: HrPoint[]
  comparePoints: HrPoint[]
  onPick: (index: number) => void
}) {
  // axis mapping: T from 60000 (left) to 2500 (right) log scale; L from 1e-6 to 1e7 (bottom→top)
  const W = 420
  const H = 250
  const pad = { l: 34, r: 12, t: 12, b: 22 }
  const x = (t: number) => {
    const v = Math.log10(Math.min(60000, Math.max(2500, t)))
    return pad.l + ((Math.log10(60000) - v) / (Math.log10(60000) - Math.log10(2500))) * (W - pad.l - pad.r)
  }
  const y = (l: number) => {
    const v = Math.log10(Math.min(1e7, Math.max(1e-6, l)))
    return H - pad.b - ((v + 6) / 13) * (H - pad.t - pad.b)
  }
  const ticksT = [50000, 20000, 8000, 5800, 3500, 2800]
  const ticksL = [1e-4, 1e-2, 1, 100, 1e4, 1e6]

  return (
    <div className="hr-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="hr-svg" role="img" aria-label={lang === 'ar' ? 'مخطط هرتزسبرونغ–راسل' : lang === 'fr' ? 'Diagramme de Hertzsprung–Russell' : 'Hertzsprung–Russell diagram'}>
        <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} fill="#07100e" rx="8" />
        {/* main sequence band */}
        <path d="M52 46 C90 86 130 118 168 146 C205 172 236 192 268 208 C300 222 330 231 360 236" stroke="#7fd4c1" strokeWidth="26" strokeOpacity="0.16" fill="none" strokeLinecap="round" />
        <text x="72" y="58" className="hr-region" fill="#7fd4c1" opacity="0.85">
          {kids
            ? (lang === 'ar' ? 'نجوم مثل شمسنا' : lang === 'fr' ? 'Étoiles comme le Soleil' : 'Stars like our Sun')
            : (lang === 'ar' ? 'التسلسل الرئيسي' : lang === 'fr' ? 'Séquence principale' : 'Main sequence')}
        </text>
        {/* giant / supergiant region */}
        <ellipse cx={x(3400)} cy={y(600)} rx="56" ry="34" fill="#f3d17e" opacity="0.13" />
        <text x={x(3400) - 34} y={y(600) - 30} className="hr-region" fill="#f3d17e" opacity="0.85">{lang === 'ar' ? 'عمالقة' : lang === 'fr' ? 'Géantes' : 'Giants'}</text>
        <ellipse cx={x(3200)} cy={y(2e5)} rx="66" ry="26" fill="#ff9d6b" opacity="0.12" />
        <text x={x(3200) - 44} y={y(2e5) - 26} className="hr-region" fill="#ff9d6b" opacity="0.85">{lang === 'ar' ? 'عمالقة عظام' : lang === 'fr' ? 'Supergéantes' : 'Supergiants'}</text>
        {/* white dwarf region */}
        <ellipse cx={x(14000)} cy={y(0.01)} rx="42" ry="22" fill="#bcd6ff" opacity="0.12" />
        <text x={x(14000) - 40} y={y(0.01) + 24} className="hr-region" fill="#bcd6ff" opacity="0.8">{lang === 'ar' ? 'أقزام بيضاء' : lang === 'fr' ? 'Naines blanches' : 'White dwarfs'}</text>

        {!kids && ticksT.map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={pad.t} x2={x(t)} y2={H - pad.b} stroke="#ffffff" strokeOpacity="0.06" />
            <text x={x(t)} y={H - 8} textAnchor="middle" className="hr-tick">{t >= 1000 ? t / 1000 + 'k' : t}</text>
          </g>
        ))}
        {!kids && ticksL.map((l) => (
          <g key={l}>
            <line x1={pad.l} y1={y(l)} x2={W - pad.r} y2={y(l)} stroke="#ffffff" strokeOpacity="0.06" />
            <text x={pad.l - 4} y={y(l) + 3} textAnchor="end" className="hr-tick">{l >= 1e4 ? '1e' + Math.log10(l) : l >= 0.01 ? l : '1e' + Math.log10(l)}</text>
          </g>
        ))}

        {comparePoints.length > 1 && (
          <polyline
            points={comparePoints.map((p) => `${x(p.t)},${y(p.l)}`).join(' ')}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.18"
            strokeWidth="2"
            strokeDasharray="4 5"
          />
        )}
        <polyline points={points.map((p) => `${x(p.t)},${y(p.l)}`).join(' ')} fill="none" stroke="#f3d17e" strokeWidth="2.5" strokeOpacity="0.85" />
        {points.map((p, i) => (
          <g key={p.id + i} onClick={() => onPick(i)} className="hr-point" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPick(i) }} aria-label={p.label}>
            <circle cx={x(p.t)} cy={y(p.l)} r={i === active ? 9 : 5} fill={i === active ? '#fff8e6' : '#f3d17e'} stroke="#0b1a16" strokeWidth="1.5" />
            {i === active && <circle cx={x(p.t)} cy={y(p.l)} r="14" fill="none" stroke="#fff8e6" strokeOpacity="0.5" strokeWidth="1.5" className="hr-pulse" />}
          </g>
        ))}
        <text x={W / 2} y={H - 2} textAnchor="middle" className="hr-axis">{lang === 'ar' ? 'درجة الحرارة (كلفن) ←' : lang === 'fr' ? 'Température (K) ←' : 'Temperature (K) ←'}</text>
      </svg>
    </div>
  )
}


/* ------------------------------------------------------------------
   Formative assessment (Brilliant/PhET style): predict → check → explain
   ------------------------------------------------------------------ */
type Quiz = {
  q: Record<Lang, string>
  options: Record<Lang, string[]>
  answer: number
  why: Record<Lang, string>
}

const QUIZ_BANK: Quiz[] = [
  {
    q: {
      ar: 'نجم كتلته 1.5 كتلة شمسية: ما مصيره الأرجح في نهاية حياته؟',
      fr: 'Une étoile de 1,5 masse solaire : quel destin final le plus probable ?',
      en: 'A 1.5-solar-mass star: what is its most likely final fate?',
    },
    options: {
      ar: ['قزم أبيض', 'ثقب أسود', 'نجم نيوتروني'],
      fr: ['Naine blanche', 'Trou noir', 'Étoile à neutrons'],
      en: ['White dwarf', 'Black hole', 'Neutron star'],
    },
    answer: 0,
    why: {
      ar: 'النجوم حتى ~8 كتل شمسية تنتهي كأقزام بيضاء بعد طرد غلافها؛ لا تكفي كتلتها لانهيار نيوتروني.',
      fr: 'Jusqu’à ~8 masses solaires, l’étoile finit en naine blanche après avoir perdu son enveloppe.',
      en: 'Stars up to ~8 solar masses end as white dwarfs after shedding their envelopes.',
    },
  },
  {
    q: {
      ar: 'ما الذي يحدد إن كان النجم سينفجر كمستعر أعظم؟',
      fr: 'Qu’est-ce qui décide si une étoile explosera en supernova ?',
      en: 'What decides whether a star will explode as a supernova?',
    },
    options: {
      ar: ['كتلته الابتدائية', 'لونه فقط', 'بُعده عن الأرض'],
      fr: ['Sa masse initiale', 'Sa couleur seule', 'Sa distance à la Terre'],
      en: ['Its initial mass', 'Its colour alone', 'Its distance from Earth'],
    },
    answer: 0,
    why: {
      ar: 'فوق ~8 كتل شمسية يكوّن اللب عناصر حتى الحديد ثم ينهار؛ الكتلة هي العامل الحاسم.',
      fr: 'Au-delà de ~8 masses solaires, le cœur forge des éléments jusqu’au fer puis s’effondre.',
      en: 'Above ~8 solar masses the core fuses elements up to iron and then collapses.',
    },
  },
  {
    q: {
      ar: 'لماذا يبقى القزم الأبيض مستقراً ولا ينهار؟',
      fr: 'Pourquoi une naine blanche reste-t-elle stable sans s’effondrer ?',
      en: 'Why does a white dwarf stay stable instead of collapsing?',
    },
    options: {
      ar: ['ضغط تدهور الإلكترونات', 'استمرار اندماج الهيدروجين', 'الجاذبية فقط'],
      fr: ['La pression de dégénérescence des électrons', 'La fusion continue de l’hydrogène', 'La gravité seule'],
      en: ['Electron degeneracy pressure', 'Ongoing hydrogen fusion', 'Gravity alone'],
    },
    answer: 0,
    why: {
      ar: 'لا اندماج في القزم الأبيض؛ ضغط تدهور الإلكترونات يقاوم الجاذبية حتى حد تشاندراسيخار 1.4 كتلة شمسية.',
      fr: 'Aucune fusion : la dégénérescence des électrons équilibre la gravité jusqu’à 1,4 masse solaire.',
      en: 'No fusion occurs: electron degeneracy balances gravity up to 1.4 solar masses.',
    },
  },
  {
    q: {
      ar: 'ماذا يحدث في قلب نجم ضخم قبل الانفجار مباشرة؟',
      fr: 'Que se passe-t-il au cœur d’une étoile massive juste avant l’explosion ?',
      en: 'What happens in a massive star’s core just before it explodes?',
    },
    options: {
      ar: ['يتحول إلى حديد ثم ينهار', 'يتحول إلى هيليوم فقط', 'يتوقف عن الدوران'],
      fr: ['Il devient du fer puis s’effondre', 'Il devient seulement de l’hélium', 'Il cesse de tourner'],
      en: ['It turns to iron and collapses', 'It becomes only helium', 'It stops rotating'],
    },
    answer: 0,
    why: {
      ar: 'الاندماج حتى الحديد لا يعطي طاقة، فينهار اللب في أقل من ثانية وتنطلق موجة صدمة ونيوترينوات.',
      fr: 'La fusion jusqu’au fer ne libère plus d’énergie : effondrement en moins d’une seconde.',
      en: 'Fusion up to iron releases no more energy, so the core collapses in under a second.',
    },
  },
  {
    q: {
      ar: 'نجم كتلته 0.05 كتلة شمسية: ماذا يكون؟',
      fr: 'Une étoile de 0,05 masse solaire : qu’est-elle ?',
      en: 'A star of 0.05 solar masses: what is it?',
    },
    options: {
      ar: ['قزم بني لا يشعل الهيدروجين', 'قزم أبيض', 'عملاق أحمر منذ البداية'],
      fr: ['Une naine brune sans fusion d’hydrogène', 'Une naine blanche', 'Une géante rouge'],
      en: ['A brown dwarf without hydrogen fusion', 'A white dwarf', 'A red giant'],
    },
    answer: 0,
    why: {
      ar: 'تحت 0.08 كتلة شمسية لا يكفي الضغط والحرارة لاندماج الهيدروجين؛ يندمج الديوتيريوم فقط.',
      fr: 'Sous 0,08 masse solaire, l’hydrogène ne s’allume pas : seule la fusion du deutérium a lieu.',
      en: 'Below 0.08 solar masses hydrogen cannot ignite; only deuterium fuses.',
    },
  },
]

function QuizGate({ lang, bank, onScore }: { lang: Lang; bank: Quiz[]; onScore: (ok: boolean) => void }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const item = bank[idx % bank.length]
  const answered = picked !== null
  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    onScore(i === item.answer)
  }
  return (
    <div className="stellar2-quiz">
      <span className="stellar2-quiz-kicker">
        {lang === 'ar' ? 'توقّع ثم تحقّق' : lang === 'fr' ? 'Prédis puis vérifie' : 'Predict, then check'}
      </span>
      <p className="stellar2-quiz-q">{item.q[lang]}</p>
      <div className="stellar2-quiz-opts">
        {item.options[lang].map((o, i) => (
          <button
            key={o}
            className={
              answered
                ? i === item.answer
                  ? 'stellar2-quiz-opt correct'
                  : i === picked
                    ? 'stellar2-quiz-opt wrong'
                    : 'stellar2-quiz-opt'
                : 'stellar2-quiz-opt'
            }
            onClick={() => pick(i)}
            aria-pressed={picked === i}
            disabled={answered}
          >
            {o}
          </button>
        ))}
      </div>
      {answered && (
        <p className={picked === item.answer ? 'stellar2-quiz-feedback ok' : 'stellar2-quiz-feedback no'}>
          {picked === item.answer ? '✓ ' : '✕ '}
          {item.why[lang]}
        </p>
      )}
      <button
        className="stellar2-quiz-next"
        onClick={() => {
          setIdx((v) => v + 1)
          setPicked(null)
        }}
        disabled={!answered}
      >
        {lang === 'ar' ? 'سؤال آخر' : lang === 'fr' ? 'Question suivante' : 'Next question'}
      </button>
    </div>
  )
}


/* ---- kid register quiz bank (short, concrete) ---- */
const QUIZ_KIDS: Quiz[] = [
  {
    q: { ar: 'أي نجم يعيش أطول؟', fr: 'Quelle étoile vit le plus longtemps ?', en: 'Which star lives longer?' },
    options: { ar: ['الشمس', 'نجم أضخم منها', 'كلاهما نفسه'], fr: ['Le Soleil', 'Une étoile plus massive', 'Les deux pareil'], en: ['The Sun', 'A more massive star', 'Both the same'] },
    answer: 0,
    why: { ar: 'النجم الأصغر يستهلك وقوده ببطء فيعيش ملايين السنين أكثر.', fr: 'L’étoile plus petite brûle son carburant lentement et vit plus longtemps.', en: 'The smaller star burns fuel slowly and lives longer.' },
  },
  {
    q: { ar: 'ماذا يبقى بعد انفجار نجم ضخم جداً؟', fr: 'Que reste-t-il après l’explosion d’une très grosse étoile ?', en: 'What is left after a very massive star explodes?' },
    options: { ar: ['نجم نيوتروني أو ثقب أسود', 'كوكب', 'سحابة ماء'], fr: ['Une étoile à neutrons ou un trou noir', 'Une planète', 'Un nuage d’eau'], en: ['A neutron star or black hole', 'A planet', 'A water cloud'] },
    answer: 0,
    why: { ar: 'يبقى قلب شديد الكثافة: نجم نيوتروني، أو ثقب أسود إن كان أثقل.', fr: 'Il reste un cœur très dense : étoile à neutrons, ou trou noir s’il est plus lourd.', en: 'A very dense core remains: a neutron star, or a black hole if heavier.' },
  },
  {
    q: { ar: 'لماذا يلمع النجم؟', fr: 'Pourquoi une étoile brille-t-elle ?', en: 'Why does a star shine?' },
    options: { ar: ['لأنه يحوّل الهيدروجين إلى هيليوم', 'لأنه يعكس ضوء الشمس', 'لأنه بارد جداً'], fr: ['Parce qu’il transforme l’hydrogène en hélium', 'Parce qu’il réfléchit la lumière', 'Parce qu’il est très froid'], en: ['Because it turns hydrogen into helium', 'Because it reflects light', 'Because it is very cold'] },
    answer: 0,
    why: { ar: 'في القلب يحصل اندماج نووي ينتج طاقة تصل إلينا كضوء وحرارة.', fr: 'Dans le cœur, la fusion nucléaire produit l’énergie qui nous arrive en lumière et chaleur.', en: 'Nuclear fusion in the core releases the energy that reaches us as light and heat.' },
  },
]

/* ------------------------------------------------------------------
   Layers explorer: click an onion shell to read its physics
   ------------------------------------------------------------------ */
type Layer = { key: string; name: Record<Lang, string>; temp: string; fusion: Record<Lang, string>; color: string }

const LAYERS: Partial<Record<StageId, Layer[]>> = {
  redSupergiant: [
    { key: 'h', name: { ar: 'غلاف الهيدروجين', fr: 'Coquille d’hydrogène', en: 'Hydrogen shell' }, temp: '~20 000 K', fusion: { ar: 'H → He', fr: 'H → He', en: 'H → He' }, color: '#ffd29a' },
    { key: 'he', name: { ar: 'غلاف الهيليوم', fr: 'Coquille d’hélium', en: 'Helium shell' }, temp: '~200 000 K', fusion: { ar: 'He → C, O', fr: 'He → C, O', en: 'He → C, O' }, color: '#ffb36b' },
    { key: 'c', name: { ar: 'غلاف الكربون', fr: 'Coquille de carbone', en: 'Carbon shell' }, temp: '~800 000 K', fusion: { ar: 'C → Ne, Mg', fr: 'C → Ne, Mg', en: 'C → Ne, Mg' }, color: '#ff9d5c' },
    { key: 'o', name: { ar: 'غلاف الأوكسجين', fr: 'Coquille d’oxygène', en: 'Oxygen shell' }, temp: '~1.5×10⁹ K', fusion: { ar: 'O → Si, S', fr: 'O → Si, S', en: 'O → Si, S' }, color: '#ff8a4d' },
    { key: 'si', name: { ar: 'غلاف السيليكون', fr: 'Coquille de silicium', en: 'Silicon shell' }, temp: '~2.5×10⁹ K', fusion: { ar: 'Si → Fe (حديد)', fr: 'Si → Fe (fer)', en: 'Si → Fe' }, color: '#ff7040' },
    { key: 'fe', name: { ar: 'لب حديدي', fr: 'Cœur de fer', en: 'Iron core' }, temp: '>10⁹ K', fusion: { ar: 'لا اندماج — ينهار', fr: 'Aucune fusion — effondrement', en: 'No fusion — collapse' }, color: '#cfd8e6' },
  ],
  redGiant: [
    { key: 'env', name: { ar: 'غلاف الهيدروجين', fr: 'Enveloppe d’hydrogène', en: 'Hydrogen envelope' }, temp: '~3 400 K', fusion: { ar: 'لا اندماج هنا', fr: 'Aucune fusion ici', en: 'No fusion here' }, color: '#ffc9a0' },
    { key: 'shell', name: { ar: 'قشرة احتراق الهيدروجين', fr: 'Coquille H', en: 'H shell' }, temp: '~3×10⁷ K', fusion: { ar: 'H → He', fr: 'H → He', en: 'H → He' }, color: '#ffb36b' },
    { key: 'he', name: { ar: 'لب الهيليوم', fr: 'Cœur d’hélium', en: 'Helium core' }, temp: '~10⁸ K', fusion: { ar: 'He → C, O', fr: 'He → C, O', en: 'He → C, O' }, color: '#cfe4ff' },
  ],
  mainMassive: [
    { key: 'core', name: { ar: 'اللب (دورة CNO)', fr: 'Cœur (cycle CNO)', en: 'Core (CNO cycle)' }, temp: '~3×10⁷ K', fusion: { ar: 'H → He عبر CNO', fr: 'H → He via CNO', en: 'H → He via CNO' }, color: '#e6f0ff' },
    { key: 'rad', name: { ar: 'المنطقة الإشعاعية', fr: 'Zone radiative', en: 'Radiative zone' }, temp: '~10⁷ K', fusion: { ar: 'نقل إشعاعي', fr: 'Transport radiatif', en: 'Radiative transport' }, color: '#bcd6ff' },
    { key: 'conv', name: { ar: 'الغلاف الحمل الحراري', fr: 'Enveloppe convective', en: 'Convective envelope' }, temp: '~20 000 K', fusion: { ar: 'رياح نجمية قوية', fr: 'Vents violents', en: 'Strong winds' }, color: '#ffd6a8' },
  ],
}

function LayersExplorer({ stageId, lang }: { stageId: StageId; lang: Lang }) {
  const layers = LAYERS[stageId]
  const [active, setActive] = useState(0)
  if (!layers) return null
  const sel = layers[Math.min(active, layers.length - 1)]
  return (
    <div className="stellar2-layers">
      <div className="stellar2-layers-head">
        <h5>{lang === 'ar' ? 'مستكشف الطبقات' : lang === 'fr' ? 'Explorateur de couches' : 'Layers explorer'}</h5>
        <span>{lang === 'ar' ? 'انقر طبقة لقراءة فيزيائها' : lang === 'fr' ? 'Cliquez une couche' : 'Click a layer'}</span>
      </div>
      <div className="stellar2-layers-body">
        <svg viewBox="0 0 200 200" className="stellar2-layers-svg" role="group" aria-label={lang === 'ar' ? 'طبقات النجم' : lang === 'fr' ? 'Couches stellaires' : 'Stellar layers'}>
          {layers.map((l, i) => {
            const r = 92 - i * (78 / layers.length)
            return (
              <circle
                key={l.key}
                cx="100"
                cy="100"
                r={r}
                fill={l.color}
                fillOpacity={i === active ? 0.95 : 0.55}
                stroke="#0b1a16"
                strokeWidth="1.5"
                tabIndex={0}
                role="button"
                aria-label={l.name[lang]}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActive(i)
                }}
                style={{ cursor: 'pointer' }}
              />
            )
          })}
        </svg>
        <div className="stellar2-layers-info">
          <strong>{sel.name[lang]}</strong>
          <dl>
            <dt>{lang === 'ar' ? 'الحرارة' : lang === 'fr' ? 'Température' : 'Temperature'}</dt>
            <dd>{sel.temp}</dd>
            <dt>{lang === 'ar' ? 'الاندماج/الدور' : lang === 'fr' ? 'Fusion / rôle' : 'Fusion / role'}</dt>
            <dd>{sel.fusion[lang]}</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}


/* ---- kid register one-liners per stage ---- */
const KID_NOTE: Partial<Record<StageId, Record<Lang, string>>> = {
  redSupergiant: {
    ar: 'تخيّلها بصلة كبيرة: كل طبقة تحترق وتصنع عناصر جديدة حتى الحديد.',
    fr: 'Imagine un gros oignon : chaque couche brûle et fabrique de nouveaux éléments jusqu’au fer.',
    en: 'Picture a giant onion: each layer burns and makes new elements, up to iron.',
  },
  redGiant: {
    ar: 'مثل بالون ينتفخ: النجم يكبر ويبرد ويصبح أحمر.',
    fr: 'Comme un ballon qui gonfle : l’étoile grossit, refroidit et devient rouge.',
    en: 'Like an inflating balloon: the star grows, cools and turns red.',
  },
  mainMassive: {
    ar: 'نجم «شره»: أكبر وأسخن، لكنه يستهلك وقوده بسرعة كبيرة.',
    fr: 'Une étoile « gourmande » : plus grosse et plus chaude, mais elle épuise vite son carburant.',
    en: 'A “greedy” star: bigger and hotter, but it uses up fuel very quickly.',
  },
}

export default function StellarLifecycle({ lang, level }: { lang: Lang; level: Level }) {
  const ui = UI[lang]
  const [mass, setMass] = useState(1)
  const [stageIdx, setStageIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showDetail, setShowDetail] = useState(level !== 'kids')
  const [compare, setCompare] = useState(false)
  const [factsOpen, setFactsOpen] = useState(false)
  const [score, setScore] = useState({ ok: 0, total: 0 })
  const audience: 'kids' | 'academic' = level === 'kids' ? 'kids' : 'academic'
  const academic = audience === 'academic'
  const timer = useRef<number | null>(null)

  const path = pickPath(mass)
  const stageIds = useMemo(() => stagesFor(path), [path])
  const stage = STAGES[stageIds[Math.min(stageIdx, stageIds.length - 1)]]
  const copy = COPY[stage.id][lang]
  const fate = ui.fates[path === 'brown' ? 'brown' : path === 'sun' ? 'sun' : path === 'massive8' ? 'neutron' : 'blackHole']

  const lifetime = useMemo(() => {
    if (mass < 0.08) return '> 10¹²'
    const gyr = 10 * Math.pow(Math.max(mass, 0.15), -2.5)
    return gyr >= 1 ? gyr.toFixed(1) : (gyr * 1000).toFixed(0)
  }, [mass])

  const hrPoints = useMemo(
    () => stageIds.map((id) => hrPoint(id, COPY[id][lang].title)).filter((p): p is HrPoint => p !== null),
    [stageIds, lang]
  )
  const hrCompare = useMemo(() => {
    if (!compare) return []
    const other = path === 'sun' ? MASSIVE_STAGES : SUN_STAGES
    return other.map((id) => hrPoint(id, COPY[id][lang].title)).filter((p): p is HrPoint => p !== null)
  }, [compare, path, lang])

  const goTo = (index: number) => {
    const next = (index + stageIds.length) % stageIds.length
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doc.startViewTransition(() => setStageIdx(next))
    } else {
      setStageIdx(next)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') goTo(stageIdx + 1)
    if (e.key === 'ArrowLeft') goTo(stageIdx - 1)
    if (e.key === ' ') {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return
      e.preventDefault()
      setPlaying((v) => !v)
    }
  }


  useEffect(() => {
    setStageIdx(0)
    setPlaying(false)
  }, [path])

  useEffect(() => {
    if (!playing) {
      if (timer.current) window.clearInterval(timer.current)
      return
    }
    timer.current = window.setInterval(() => {
      setStageIdx((i) => (i + 1) % stageIds.length)
    }, Math.max(1600, 3200 / speed))
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [playing, speed, stageIds.length])

  // visual scale: log radius mapped to 8..140 px
  const radiusPx = (() => {
    const r = Math.sqrt(stage.rRange[0] * stage.rRange[1])
    const v = Math.log10(Math.max(r, 1e-6))
    const px = 12 + ((v + 6) / 12) * 128
    return Math.min(150, Math.max(8, px))
  })()
  const colour = starColour((stage.tRange[0] + stage.tRange[1]) / 2)
  const isExplosion = stage.id === 'supernova'
  const isRemnant = stage.id === 'whiteDwarf' || stage.id === 'neutron' || stage.id === 'blackHole' || stage.id === 'brownDwarf'

  return (
    <section className="stellar2" aria-labelledby="stellar2-title" onKeyDown={onKey}>
      <header className="stellar2-head">
        <div>
          <h3 id="stellar2-title">{ui.title}</h3>
          <p>{ui.sub}</p>
        </div>
        <div className="stellar2-register-badge" data-register={audience}>
          <Mi name={audience === 'kids' ? 'child_care' : 'school'} />
          {audience === 'kids'
            ? (lang === 'ar' ? 'نسخة الطفل — يتحكم بها الإعداد العام' : lang === 'fr' ? 'Version enfant — réglage global' : 'Child version — global setting')
            : (lang === 'ar' ? 'نسخة الكبار — يتحكم بها الإعداد العام' : lang === 'fr' ? 'Version adulte — réglage global' : 'Adult version — global setting')}
        </div>
        <div className="stellar2-chips">
          <span className="stellar2-chip">
            {lang === 'ar' ? 'العمر الكلي ≈' : lang === 'fr' ? 'Durée de vie ≈' : 'Lifetime ≈'}{' '}
            <b>
              {lifetime} {mass < 0.08 ? (lang === 'ar' ? 'سنة' : lang === 'fr' ? 'ans' : 'yr') : Number(lifetime) >= 1 ? (lang === 'ar' ? 'مليار سنة' : lang === 'fr' ? 'Ga' : 'Gyr') : (lang === 'ar' ? 'مليون سنة' : lang === 'fr' ? 'Ma' : 'Myr')}
            </b>
          </span>
          <span className="stellar2-chip">
            {lang === 'ar' ? 'نتيجة التوقع' : lang === 'fr' ? 'Score' : 'Score'} <b>{score.ok}/{score.total}</b>
          </span>
        </div>
        <span className="stellar2-fate" data-path={path}>
          {ui.fate}: <b>{fate}</b>
        </span>
      </header>

      <div className="stellar2-mass">
        <label htmlFor="stellar2-mass">
          {ui.mass}: <b>{mass.toFixed(2)}</b> {ui.solarMass}
        </label>
        <input
          id="stellar2-mass"
          type="range"
          min={0.02}
          max={40}
          step={0.01}
          value={mass}
          onChange={(e) => setMass(Number(e.target.value))}
          aria-valuetext={`${mass.toFixed(2)} ${ui.solarMass}`}
        />
        <div className="stellar2-marks" aria-hidden="true">
          <span style={{ left: '0.2%' }}>0.08</span>
          <span style={{ left: '19%' }}>8 M☉</span>
          <span style={{ left: '49%' }}>20 M☉</span>
          <span style={{ left: '98%' }}>40 M☉</span>
        </div>
        <p className="stellar2-hint">{ui.hint}</p>
      </div>

      <div className="stellar2-hr">
        <div className="stellar2-hr-head">
          <h5>{lang === 'ar' ? 'موقع النجم على مخطط هرتزسبرونغ–راسل' : lang === 'fr' ? 'Position dans le diagramme HR' : 'Position on the HR diagram'}</h5>
          <label className="stellar2-compare">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
            {lang === 'ar' ? 'قارن مع المسار الآخر' : lang === 'fr' ? 'Comparer les parcours' : 'Compare paths'}
          </label>
        </div>
        <HrDiagram lang={lang} kids={audience === 'kids'} active={Math.min(stageIdx, hrPoints.length - 1)} points={hrPoints} comparePoints={hrCompare} onPick={(i) => goTo(i)} />
      </div>

      <div className="stellar2-body">
        <div className={`stellar2-scene${isExplosion ? ' is-explosion' : ''}`} aria-live="polite">
          <svg viewBox="0 0 320 300" role="img" aria-label={copy.title}>
            <defs>
              <radialGradient id="st2-glow">
                <stop offset="0%" stopColor={colour} stopOpacity="0.95" />
                <stop offset="55%" stopColor={colour} stopOpacity="0.35" />
                <stop offset="100%" stopColor={colour} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="st2-env">
                <stop offset="60%" stopColor={colour} stopOpacity="0.55" />
                <stop offset="100%" stopColor={colour} stopOpacity="0.06" />
              </radialGradient>
            </defs>

            {/* molecular cloud */}
            {stage.id === 'cloud' && (
              <g opacity="0.85">
                {[[90, 90, 46], [190, 120, 60], [140, 200, 52], [235, 205, 38]].map(([x, y, r], i) => (
                  <circle key={i} cx={x} cy={y} r={r} fill="url(#st2-env)" opacity={0.5} />
                ))}
                <circle cx="160" cy="150" r="90" fill="none" stroke={colour} strokeOpacity="0.25" strokeDasharray="4 8" />
              </g>
            )}

            {/* protostar: cocoon + disk */}
            {stage.id === 'protostar' && (
              <g>
                <ellipse cx="160" cy="155" rx="120" ry="26" fill="#8fb3a0" opacity="0.35" />
                <ellipse cx="160" cy="155" rx="120" ry="26" fill="none" stroke="#cfe3d4" strokeOpacity="0.5" strokeDasharray="3 6" />
                <circle cx="160" cy="152" r={radiusPx * 0.9} fill="url(#st2-glow)" />
                <path d="M160 60v-26M160 60l-14-18M160 60l14-18" stroke={colour} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              </g>
            )}

            {/* main sequence, giants, supergiants: layered star */}
            {(['mainSun', 'mainMassive', 'redGiant', 'redSupergiant', 'brownDwarf'] as StageId[]).includes(stage.id) && (
              <g>
                <circle cx="160" cy="150" r={radiusPx * 1.45} fill="url(#st2-glow)" />
                <circle cx="160" cy="150" r={radiusPx} fill="url(#st2-env)" stroke={colour} strokeOpacity="0.7" strokeWidth="1.5">
                  <animate attributeName="r" values={`${radiusPx};${radiusPx * 1.03};${radiusPx}`} dur="7s" repeatCount="indefinite" />
                </circle>
                <circle cx="160" cy="150" r={radiusPx * 0.62} fill={colour} opacity="0.25" />
                <circle cx="160" cy="150" r={Math.max(6, radiusPx * 0.32)} fill={colour} opacity="0.9" />
                {stage.id === 'redSupergiant' && (
                  <g stroke={colour} strokeOpacity="0.45" strokeWidth="1">
                    <circle cx="160" cy="150" r={radiusPx * 0.78} fill="none" strokeDasharray="2 6" />
                    <circle cx="160" cy="150" r={radiusPx * 0.9} fill="none" strokeDasharray="1 9" />
                  </g>
                )}
              </g>
            )}

            {/* planetary nebula */}
            {stage.id === 'planetary' && (
              <g>
                <circle cx="160" cy="150" r={radiusPx * 1.6} fill="url(#st2-glow)" />
                {[0.6, 0.85, 1.1].map((k, i) => (
                  <ellipse key={i} cx="160" cy="150" rx={radiusPx * 2.4 * k} ry={radiusPx * 1.7 * k} fill="none" stroke={i % 2 ? '#f3d17e' : '#9ec2d4'} strokeOpacity={0.55 - i * 0.12} strokeWidth="2" />
                ))}
                <circle cx="160" cy="150" r="10" fill="#fff6df" />
              </g>
            )}

            {/* supernova */}
            {stage.id === 'supernova' && (
              <g className="st2-blast">
                <circle cx="160" cy="150" r="130" fill="url(#st2-glow)" opacity="0.5" />
                {[0, 1, 2].map((i) => (
                  <circle key={i} cx="160" cy="150" r={40 + i * 30} fill="none" stroke="#ffd97a" strokeOpacity={0.8 - i * 0.22} strokeWidth={3 - i * 0.6}>
                    <animate attributeName="r" values={`${30 + i * 10};${135};${30 + i * 10}`} dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.9;0;0.9" dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                  </circle>
                ))}
                <circle cx="160" cy="150" r="18" fill="#fff2c4" />
              </g>
            )}

            {/* remnants */}
            {stage.id === 'whiteDwarf' && (
              <g>
                <circle cx="160" cy="150" r="46" fill="url(#st2-glow)" opacity="0.55" />
                <circle cx="160" cy="150" r="12" fill="#f4f8ff" />
                <circle cx="160" cy="150" r="20" fill="none" stroke="#dbe7ff" strokeOpacity="0.5" />
              </g>
            )}
            {stage.id === 'neutron' && (
              <g>
                <circle cx="160" cy="150" r="30" fill="url(#st2-glow)" opacity="0.6" />
                <circle cx="160" cy="150" r="6" fill="#bfe8ff" />
                <path d="M160 96v108M108 150h104" stroke="#8fd4ff" strokeOpacity="0.5" strokeWidth="1.5">
                  <animateTransform attributeName="transform" type="rotate" from="0 160 150" to="360 160 150" dur="4s" repeatCount="indefinite" />
                </path>
              </g>
            )}
            {stage.id === 'blackHole' && (
              <g>
                <ellipse cx="160" cy="150" rx="96" ry="24" fill="none" stroke="#ffb86b" strokeOpacity="0.7" strokeWidth="6" />
                <ellipse cx="160" cy="150" rx="72" ry="16" fill="none" stroke="#ff9d4d" strokeOpacity="0.5" strokeWidth="3" />
                <circle cx="160" cy="150" r="34" fill="#05070c" stroke="#2a3340" strokeWidth="2" />
              </g>
            )}
            {isRemnant && <text x="160" y="262" textAnchor="middle" className="st2-scale">≈ {stage.rRange[0].toExponential(1)} R☉</text>}
          </svg>
          <div className="stellar2-readout">
            <span>
              <small>{ui.temperature}</small>
              <b>{Math.round(stage.tRange[0] / 1000) || '<1'}k – {Math.round(stage.tRange[1] / 1000) || '<1'}k</b>
            </span>
            <span>
              <small>{ui.radius}</small>
              <b>{stage.rRange[0].toExponential(1)} – {stage.rRange[1].toExponential(1)} R☉</b>
            </span>
            <span>
              <small>{ui.luminosity}</small>
              <b>{stage.lRange[1] === 0 ? '—' : `${stage.lRange[0].toExponential(0)}–${stage.lRange[1].toExponential(0)} L☉`}</b>
            </span>
            <span>
              <small>{ui.duration}</small>
              <b>{fmtYears(stage.years, lang, ui)}</b>
            </span>
          </div>
        </div>

        <div className="stellar2-panel">
          <span className="stellar2-step">
            {ui.stage} {Math.min(stageIdx + 1, stageIds.length)} {ui.of} {stageIds.length}
          </span>
          <h4>{copy.title}</h4>
          <p className="stellar2-copy">{academic ? copy.academic : copy.kids}</p>
          <StageFigure stageId={stage.id as StageKey} lang={lang} audience={audience} />
          {audience === 'kids' && KID_NOTE[stage.id] && <p className="stellar2-kidnote">{KID_NOTE[stage.id]![lang]}</p>}
          <LayersExplorer stageId={stage.id} lang={lang} />
          <QuizGate
            lang={lang}
            bank={audience === 'kids' ? QUIZ_KIDS : QUIZ_BANK}
            onScore={(ok) => setScore((v) => ({ ok: v.ok + (ok ? 1 : 0), total: v.total + 1 }))}
          />
          {academic && (
            <button className="stellar2-toggle" onClick={() => setShowDetail((v) => !v)} aria-expanded={showDetail}>
              {showDetail ? ui.kids : ui.academic}
            </button>
          )}
          {academic && showDetail && (
            <dl className="stellar2-detail">
              <dt>{ui.fusion}</dt>
              <dd>{stage.fusion[lang]}</dd>
              <dt>{ui.live}</dt>
              <dd>
                {stage.tRange[0].toLocaleString('en-US')}–{stage.tRange[1].toLocaleString('en-US')} K
              </dd>
            </dl>
          )}
          <a className="stellar2-source" href="https://science.nasa.gov/universe/stars/" target="_blank" rel="noreferrer">
            {ui.source}: {stage.source[lang]} ↗
          </a>
          {path !== 'brown' && <p className="stellar2-threshold">{ui.thresholds}</p>}
        </div>
      </div>

      <div className="stellar2-controls">
        <button className="stellar2-play" onClick={() => setPlaying((v) => !v)} aria-pressed={playing}>
          {playing ? `⏸ ${ui.pause}` : `▶ ${ui.play}`}
        </button>
        <label className="stellar2-speed">
          {ui.speed}
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label={ui.speed}>
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </label>
      </div>

      <ol className="stellar2-track" role="list" aria-label={ui.stage}>
        {stageIds.map((id, i) => {
          const s = STAGES[id]
          const c = COPY[id][lang]
          return (
            <li key={id}>
              <button
                className={i === stageIdx ? 'stellar2-track-btn active' : 'stellar2-track-btn'}
                onClick={() => setStageIdx(i)}
                aria-current={i === stageIdx ? 'step' : undefined}
              >
                <span className="stellar2-dot" aria-hidden="true">
                  {s.emoji}
                </span>
                <span>{c.title}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="stellar2-progress" aria-hidden="true">
        <span style={{ animationDuration: `${Math.max(1600, 3200 / speed)}ms`, animationPlayState: playing ? 'running' : 'paused' }} />
      </div>

      <div className="stellar2-latest">
        <button className="stellar2-latest-head" onClick={() => setFactsOpen((v) => !v)} aria-expanded={factsOpen}>
          <span>✦ {lang === 'ar' ? 'أحدث ما نعرفه' : lang === 'fr' ? 'Dernières découvertes' : 'Latest discoveries'}</span>
          <small>{lang === 'ar' ? '2024–2025 · مصادر مؤسسية' : lang === 'fr' ? '2024–2025 · sources institutionnelles' : '2024–2025 · institutional sources'}</small>
          <Mi name={factsOpen ? 'expand_less' : 'expand_more'} />
        </button>
        {factsOpen && (
          <ul className="stellar2-facts">
            {LATEST.map((f) => (
              <li key={f.date + f.src}>
                <b>{f.date}</b>
                <p>{audience === 'kids' ? (f as Fact & { kid?: Record<Lang, string> }).kid?.[lang] ?? f[lang].split('. ')[0] : f[lang]}</p>
                <a href={f.url} target="_blank" rel="noreferrer">
                  {f.src} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
