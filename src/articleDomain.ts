import type { Article } from './data'

const RULES: { id: string; terms: RegExp }[] = [
  { id: 'space', terms: /\b(space|astronomy|astronomie|cosmos|universe|univers|planet|planete|mars|moon|solar|star|astronaut|orbit)\b|(?<![\p{L}\p{N}\p{M}])(?:ال)?(?:فضاء|فضائي(?:ة|ات|ون|ين)?|فلك(?:ي|ية)?|كون|كوكب|كواكب|مريخ|قمر|أقمار|شمس|شمسي(?:ة)?|نجم|نجوم|مدار|مجرة|مجرات)(?![\p{L}\p{N}\p{M}])/u },
  { id: 'life', terms: /\b(biology|animal|dinosaur|reptile|mammal|bird|amphibian|bacteria|virus|wildlife|plant|species|ecosystem)\b|حيوان|أحياء|احياء|ديناصور|زاحف|ثديي|طيور|برمائ|بكتير|فيروس|نبات|كائن|تنوع حيوي/ },
  { id: 'religions', terms: /\b(religion|islam|muslim|prophet|sacred|quran|buddh|christian|judaism|synagogue|mosque|church)\b|اديان|إسلام|اسلام|مسلم|نبي|مقدس|قرآن|قران|بوذي|مسيحي|يهود|مسجد|كنيسة/ },
  { id: 'technology', terms: /\b(technology|computer|computing|artificial intelligence|quantum|internet|robot|electricity|algorithm|telecommunication|transportation)\b|تقنية|تكنولوجيا|حاسوب|حوسبة|ذكاء اصطناعي|كمي|كمّي|إنترنت|انترنت|روبوت|كهرباء|خوارزم|اتصالات|نقل/ },
  { id: 'civilizations', terms: /\b(civilization|empire|dynasty|archaeology|ancient|maya|inca|chinese|roman|pharaoh|archaeological)\b|حضارة|إمبراطورية|امبراطورية|سلالة|آثار|اثار|قديم|مايا|إنكا|انكا|صين|رومان|فرعون|فراعنة/ },
  { id: 'arts', terms: /\b(literature|poetry|poet|philosophy|music|painting|art|novel|theatre|theater|writer|sculpture)\b|أدب|شعر|شاعر|فلسف|موسيقى|فنون|رواية|مسرح|كاتب|نحت/ },
  { id: 'earth', terms: /\b(geography|geology|climate|continent|ocean|mountain|river|water|landform|earthquake|volcano|weather)\b|أرض|جغرافيا|جيولوجيا|مناخ|قارة|محيط|جبل|نهر|ماء|بيئة|زلزال|بركان|طقس/ },
  { id: 'science', terms: /\b(science|mathematics|physics|chemistry|medicine|health|human body|anatomy|atom|math|biology|laboratory)\b|فيزياء|رياضيات|كيمياء|طب|صحة|جسم|تشريح|ذرة|علوم|مختبر/ },
  { id: 'future', terms: /\b(future|foresight|forecast|scenario|innovation|futurism)\b|مستقبل|استشراف|تنبؤ|سيناريو|ابتكار/ },
  { id: 'human-history', terms: /\b(history|historical|war|revolution|crisis|colonial|politics|economy|economics|law|society|human|evolution|anthropology|ancestor|migration|population)\b|تاريخ|حرب|ثورة|أزمة|ازمة|استعمار|سياسة|اقتصاد|قانون|مجتمع|إنسان|انسان|تطور|بشر|هجرة|سكان/ },
]

function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
}

/** Route only well-matched items into a thematic branch; leave uncertain items in the full library. */
export function domainForArticle(article: Article): string {
  if(article.primaryDomain)return article.primaryDomain
  const titles = Object.values(article.content).flatMap((entry) => entry ? [entry.title] : []).join(' ')
  const summaries = Object.values(article.content).flatMap((entry) => entry ? [entry.summary] : []).join(' ')
  const title = normalize(`${article.id} ${titles}`)
  const introduction = normalize(summaries).slice(0, 220)
  const categories = Object.values(article.cat).filter((value): value is string => Boolean(value)).map(normalize)

  // Specific article subjects take precedence over broad import buckets such as “Qalam collection”.
  // These expressions describe labour/political institutions, not the cosmos.
  if (/نقاب|كونفدرالي|كونفدراليه|\b(?:syndicat\w*|trade unions?|labou?r unions?|confederation)\b/.test(title)) return 'human-history'
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
  if (titleMatch) return titleMatch.id

  const categoryMap: { id: string; terms: string[] }[] = [
    { id: 'space', terms: ['فضاء', 'space', 'espace', 'astronomy', 'astronomie'] },
    { id: 'earth', terms: ['جغرافيا', 'geography', 'geographie', 'geology', 'جيولوجيا'] },
    { id: 'life', terms: ['حيوانات', 'animals', 'animaux', 'نباتات', 'plants', 'plantes', 'زراعة', 'agriculture', 'biology'] },
    { id: 'religions', terms: ['اديان', 'religions', 'religion'] },
    { id: 'technology', terms: ['تقنية', 'technology', 'technologie', 'نقل', 'transport'] },
    { id: 'arts', terms: ['ادب', 'literature', 'litterature', 'فلسفة', 'philosophy', 'philosophie', 'arts'] },
    { id: 'civilizations', terms: ['عمارة', 'architecture', 'civilization', 'civilisation', 'حضارات'] },
    { id: 'human-history', terms: ['تاريخ', 'history', 'histoire', 'سياسة', 'politics', 'politique', 'اقتصاد', 'economy', 'economie', 'علوم انسانية', 'humanities', 'sciences humaines', 'مجتمع وثقافة', 'society and culture'] },
    { id: 'science', terms: ['علوم', 'science', 'sciences', 'صحة', 'health', 'sante', 'رياضيات', 'mathematics', 'mathematiques', 'طب', 'medicine'] },
  ]
  for (const group of categoryMap) {
    if (categories.some((category) => group.terms.includes(category))) return group.id
  }

  return 'unclassified'
}
