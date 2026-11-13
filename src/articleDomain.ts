import type { Article } from './data'

const RULES: { id: string; terms: RegExp }[] = [
  { id: 'space', terms: /\b(space|astronomy|astronomie|cosmos|universe|univers|planet|planete|mars|moon|solar|star|astronaut|orbit)\b|(?<![\p{L}\p{N}\p{M}])(?:ال)?(?:فضاء|فضائي(?:ة|ات|ون|ين)?|فلك(?:ي|ية)?|كون|كوكب|كواكب|مريخ|قمر|أقمار|شمس|شمسي(?:ة)?|نجم|نجوم|مدار|مجرة|مجرات)(?![\p{L}\p{N}\p{M}])/u },
  { id: 'life', terms: /\b(biology|animal|dinosaur|reptile|mammal|bird|amphibian|bacteria|virus|wildlife|plant|species|ecosystem|ecology|ecological|habitat|biodiversity)\b|(?<![\p{L}\p{N}\p{M}])(?:ال)?(?:حيوان|أحياء|احياء|ديناصور|زاحف|ثديي|طيور|برمائ|بكتير|فيروس|نبات|كائن|تنوع حيوي|نظام بيئي|نظم بيئي|علم البيئة)/u },
  { id: 'religions', terms: /\b(religion|islam|muslim|prophet|sacred|quran|buddh|christian|judaism|synagogue|mosque|church)\b|(?<![\p{L}\p{N}\p{M}])(?:ال)?(?:اديان|إسلام|اسلام|مسلم|نبي|مقدس|قرآن|قران|بوذي|مسيحي|يهود|مسجد|كنيسة)/u },
  { id: 'technology', terms: /\b(technology|computer|computing|software|informatics|artificial intelligence|quantum|internet|robot|electricity|algorithm|telecommunication|transportation)\b|(?<![\p{L}\p{N}\p{M}])(?:ال)?(?:تقنية|تكنولوجيا|حاسوب|حوسبة|برمجيات|برمجية|ذكاء\s+(?:ال)?اصطناعي|إنترنت|انترنت|روبوت|كهرباء|خوارزم|اتصالات|نقل|حوسبة كمومية|كمومي|كمومية|ميكانيكا الكم|حاسوب كمي)/u },
  { id: 'arts', terms: /\b(literature|poetry|poet|philosophy|music|painting|art|beaux[- ]arts|cinema|film|movie|novel|theatre|theater|writer|sculpture)\b|(?<![\p{L}\p{N}\p{M}])(?:ال)?(?:أدب|ادب|شعر|شاعر|فلسف|موسيقى|فنون|سينما|أفلام|فيلم|رواية|مسرح|كاتب|نحت)/u },
  { id: 'science', terms: /\b(science|mathematics|physics|chemistry|medicine|health|human body|anatomy|atom|math|laboratory|bone marrow|hematopoietic|hematopoiesis|leukemia|leukaemia|oncology|microenvironment)\b|(?<![\p{L}\p{N}\p{M}])(?:ال)?(?:فيزياء|رياضيات|كيمياء|طب(?!قه)|طبيب|أطباء|طبية|صحة|صحي|جسم|أجسام|تشريح|ذرة|ذرات|علوم|مختبر|نخاع العظم|نقي العظم|مكونة للدم|تكون الدم|سرطان الدم|ابيضاض الدم|ابيضاض|البيئة الدقيقة)/u },
  { id: 'earth', terms: /\b(geography|geology|geophysics|climate|continent|ocean|mountain|river|water|landform|earthquake|volcano|weather)\b|(?<![\p{L}\p{N}\p{M}])(?:ال)?(?:ارض|جغرافيا|جيولوجيا|جيوفيزيائي|مناخ|قاره|قارات|محيط|محيطات|جبل|جبال|نهر|انهار|ماء|مياه|زلزال|زلازل|بركان|براكين|طقس)(?![\p{L}\p{N}\p{M}])/u },
  { id: 'future', terms: /\b(future|foresight|forecast|scenario|innovation|futurism)\b|مستقبل|استشراف|تنبؤ|سيناريو|ابتكار/ },
  { id: 'human-history', terms: /\b(history|historical|war|revolution|crisis|colonial|politics|economy|economics|law|society|human|evolution|anthropology|ancestor|migration|population)\b|(?<![\p{L}\p{N}\p{M}])(?:ال)?(?:تاريخ|حرب|ثورة|أزمة|ازمة|استعمار|سياسة|اقتصاد|قانون|مجتمع|إنسان|انسان|بشر|هجرة|سكان)/u },
  { id: 'civilizations', terms: /\b(civilization|empire|dynasty|archaeology|archaeological|maya|inca|roman|pharaoh|ancient\s+(?:egypt|greece|china|rome|mesopotamia|civilization))\b|(?<![\p{L}\p{N}])(?:ال)?(?:حضار(?:ه|ات)|امبراطوريه|سلاله|اثار|مايا|انكا|فرعون|فراعنه)(?![\p{L}\p{N}])/u },
]

function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
}

/** Route only well-matched items into a thematic branch; leave uncertain items in the full library. */
export function domainForArticle(article: Article): string {
  // Foresight has a curated home in FrontierExplorer; it is not a Journey domain.
  if(article.primaryDomain)return article.primaryDomain === 'future' ? 'unclassified' : article.primaryDomain
  const titles = Object.values(article.content).flatMap((entry) => entry ? [entry.title] : []).join(' ')
  const summaries = Object.values(article.content).flatMap((entry) => entry ? [entry.summary] : []).join(' ')
  const bodies = Object.values(article.content).flatMap((entry) => entry ? entry.body : []).join(' ')
  const title = normalize(`${article.id} ${titles}`)
  const introduction = normalize(summaries).slice(0, 220)
  const categories = Object.values(article.cat).filter((value): value is string => Boolean(value)).map(normalize)
  // Use the article's substance and its own field metadata to resolve ambiguous
  // words such as “star”; do not let a person's name route a biography to astronomy.
  const substance = normalize(`${summaries} ${bodies} ${categories.join(' ')}`)

  // Specific article subjects take precedence over broad import buckets such as “Qalam collection”.
  // These expressions describe labour/political institutions, not the cosmos.
  if (/\b(?:battle|battles|bataille|batailles)\b|معركه|معارك/.test(title)) return 'human-history'
  if (/مناخ اداري|administrative climate|organizational climate|organisational climate|workplace climate/.test(title)) return 'human-history'
  if (/حق الارض|droit du sol|right of soil|soil rights?/.test(title)) return 'human-history'
  if (/نقاب|كونفدرالي|كونفدراليه|\b(?:syndicat\w*|trade unions?|labou?r unions?|confederation)\b/.test(title)) return 'human-history'
  if (/\b(?:peace|peace treaty|perpetual peace|diplomacy|diplomatic|armistice)\b|سلام|معاهده|دبلوماسي|هدنه/.test(title) && !/peace lily|زنابق السلام/.test(title)) return 'human-history'
  const starInName = /(?<![\p{L}\p{N}])(?:(?:ال)?نجم(?:ة|وم)?|star|stars)(?![\p{L}\p{N}])/u.test(title)
  const humanProfileEvidence = /\b(poet|poetry|writer|author|literature|literary|physician|doctor|historian|actor|actress|singer|composer|footballer|artist|biography|born|died|rajaz)\b|شاعر|شعر|أديب|اديب|أدب|ادب|كاتب|طبيب|مؤرخ|ممثل|مغن|مطرب|فنان|ولد|توفي|راجز|رجاز/.test(substance)
  const astronomyEvidence = /\b(astronom|astrophysic|galaxy|galaxies|planet|planets|constellation|orbit|stellar|celestial|spacecraft|supernova)\b|فلك|مجرة|كوكب|كوكبي|مدار|ثقب أسود|ثقب اسود|مذنب|فضائي|مستعر أعظم|مستعر اعظم/.test(substance)
  if (starInName && humanProfileEvidence && !astronomyEvidence) {
    if (/شعر|شاعر|أدب|ادب|poet|poetry|writer|author|actor|actress|singer|composer|artist/.test(substance)) return 'arts'
    return 'human-history'
  }
  if (/اثاره كولوم|coulomb excitation|excitation de coulomb/.test(title)) return 'science'
  // A civilization's history is a historical/cultural subject, not a general religion lesson.
  if (/حضار(?:ه|ات).{0,24}اسلام|اسلام.{0,24}حضار(?:ه|ات)|\b(?:islamic civilization|civilisation islamique)\b/.test(title)) return 'civilizations'
  if (/\bdomonym\b|دومونيم|اسم بيت/.test(title)) return 'unclassified'
  if (/عماره بيوني|bionic architecture|architecture bionique/.test(title)) return 'technology'
  if (/الاثار البيئيه|environmental impacts? of (?:artificial )?intelligence|impacts? environnementaux? de l.intelligence artificielle/.test(title)) return 'technology'
  if (/\bcinq[- ]mars\b/.test(title)) return 'unclassified'
  if (/\bchamp[- ]de[- ]mars\b/.test(title)) return 'earth'
  if (/\bmars \((?:mois|divinite|mythologie)\)/.test(title)) return /divinite|mythologie/.test(title) ? 'religions' : 'unclassified'
  if (/space vector|متجه الفضا|متجهات الفضا/.test(title)) return 'technology'
  if (/بندقيه الشمس|مركز شمسي ضيا|luminescent solar concentrator|sun gun/.test(title)) return 'technology'
  if (/حدود كوكبي|limites planetaires|planetary boundaries|spaceship earth|الارض سفينه الفضاء/.test(title)) return 'earth'
  // Solar engineering belongs with technology; astronomical solar phenomena remain in space.
  if (/solar|solaire|شمس/.test(title) && /طاقه|كهرب|خلايا|خليه|الواح|لوح |محول|تدفئ|تكييف|سخان|تسخين|فرن|افران|مصباح|مظله|اضاءه|اناره|سيار|تطهير|تصميم|اكتساب حراري|كتله الهواء|ناظم|متعقب|عاكس|ضيائي|شمس الاصطناعيه|power|energy|energie|photovolta|cell|panel|heating|chauff|therm|collector|inverter|lighting|car\b/.test(title)) {
    if (new RegExp(normalize('فضائي') + '|space.based', 'u').test(title)) return 'space'
    return 'technology'
  }
  if (/(?:اوبرا|موسيقي|مسرحي|فيلم|فلم|روايه|شاعر|\b(?:opera|film|novel|poet)\b)/.test(introduction)) return 'arts'
  const titleMatch = RULES.find((rule) => new RegExp(normalize(rule.terms.source).replace(/\\p\{([lnm])\}/g, (_, property: string) => `\\p{${property.toUpperCase()}}`), 'u').test(title))
  if (titleMatch) return titleMatch.id === 'future' ? 'unclassified' : titleMatch.id

  const categoryMap: { id: string; terms: string[] }[] = [
    { id: 'space', terms: ['فضاء', 'space', 'espace', 'astronomy', 'astronomie'] },
    { id: 'earth', terms: ['جغرافيا', 'geography', 'geographie', 'geology', 'جيولوجيا'] },
    { id: 'life', terms: ['حيوانات', 'animals', 'animaux', 'نباتات', 'plants', 'plantes', 'زراعة', 'agriculture', 'biology'] },
    { id: 'religions', terms: ['اديان', 'religions', 'religion'] },
    { id: 'technology', terms: ['تقنيه', 'technology', 'technologie', 'نقل', 'transport'] },
    { id: 'arts', terms: ['ادب', 'literature', 'litterature', 'فلسفة', 'philosophy', 'philosophie', 'arts'] },
    { id: 'civilizations', terms: ['عمارة', 'architecture', 'civilization', 'civilisation', 'حضارات'] },
    { id: 'human-history', terms: ['تاريخ', 'history', 'histoire', 'سياسة', 'politics', 'politique', 'اقتصاد', 'economy', 'economie', 'علوم انسانيه', 'humanities', 'sciences humaines', 'مجتمع وثقافه', 'society and culture'] },
    { id: 'science', terms: ['علوم', 'science', 'sciences', 'فيزياء', 'physique', 'physics', 'كيمياء', 'chimie', 'chemistry', 'صحه', 'health', 'sante', 'رياضيات', 'mathematics', 'mathematiques', 'طب', 'medicine'] },
  ]
  for (const group of categoryMap) {
    const normalizedTerms = group.terms.map(normalize)
    if (categories.some((category) => normalizedTerms.includes(category))) return group.id
  }

  return 'unclassified'
}
