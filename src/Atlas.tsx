import { JourneyHistoryPortals } from './HistoryPortals'
import { journeyName } from './audienceRouting'
const StellarLifecycle = lazy(() => import('./StellarLifecycle'))
import TopicExperience from './TopicExperience'
import { viewContent } from './register'
import ArticleVisual from './ArticleVisual'
import AcademicTopics from './AcademicTopics'
import CosmosExplorer from './CosmosExplorer'
import ScientificGallery from './ScientificGallery'
import type { Domain } from './scientificFigure'
import BranchDiscovery from './BranchDiscovery'
import SpaceDiscovery from './SpaceDiscovery'
import EarthDiscovery from './EarthDiscovery'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { t, type Lang } from './i18n'
import type { Article } from './data'
import { type Level } from './content'
import Mi from './Mi'
import { sound } from './sound'
import { awardBadge } from './rewards'
import { publicUrl } from './publicUrl'
import { domainForArticle } from './articleDomain'
import { scrollToDetail } from './scrollToDetail'

interface Civ {
  id: string
  lon: number
  lat: number
  start: number
  end: number
  color: string
  name: Record<Lang, string>
  link?: string
}

interface Era {
  year: number
  title: Record<Lang, string>
  text: Record<Lang, string>
}

const CIV_DETAILS: Record<string, { text: Record<Lang, string>; source: string }> = {
  sumer: { text: { ar: 'ظهرت في جنوب بلاد الرافدين مدن مثل أوروك، وتطورت فيها الكتابة المسمارية والإدارة والتجارة. كانت سومر مجموعة مدن متنافسة، لا دولة موحدة طوال تاريخها.', fr: 'Dans le sud de la Mésopotamie, des villes comme Uruk développent l’écriture cunéiforme, l’administration et le commerce. Sumer est un ensemble de cités, pas un État unifié durant toute son histoire.', en: 'Cities such as Uruk grew in southern Mesopotamia, where cuneiform writing, administration, and trade developed. Sumer was a group of competing city-states, not one unified state throughout its history.' }, source: 'https://www.metmuseum.org/toah/hd/uruk/hd_uruk.htm' },
  egypt: { text: { ar: 'وحد ملوك مصر القديمة مناطق وادي النيل في أزمنة مبكرة. تطورت مؤسسات الدولة والكتابة والعمارة، وشُيّدت الأهرامات في الدولة القديمة.', fr: 'Les souverains de l’Égypte ancienne réunissent tôt des régions de la vallée du Nil. L’État, l’écriture et l’architecture évoluent; les pyramides sont construites sous l’Ancien Empire.', en: 'Early rulers united regions along the Nile. Egyptian state institutions, writing, and architecture developed over time; the pyramids were built during the Old Kingdom.' }, source: 'https://www.metmuseum.org/essays/egypt-in-the-old-kingdom-ca-2649-2150-b-c' },
  phoenicia: { text: { ar: 'بنت مدن الساحل الفينيقي شبكات بحرية وتجارية واسعة. انتقلت عبرها سلع وأفكار وأشكال من الكتابة بين موانئ المتوسط.', fr: 'Les cités du littoral phénicien bâtissent de vastes réseaux maritimes et commerciaux. Des marchandises, des idées et des systèmes d’écriture circulent entre les ports méditerranéens.', en: 'Phoenician coastal cities built wide maritime and trade networks. Goods, ideas, and writing systems moved among Mediterranean ports.' }, source: 'https://www.britannica.com/topic/Phoenicia' },
  greece: { text: { ar: 'تكونت في اليونان القديمة مدن مستقلة، واختلفت أنظمتها السياسية. أثرت الفلسفة والرياضيات والمسرح والفنون في مجتمعات لاحقة.', fr: 'La Grèce antique est composée de cités indépendantes aux régimes variés. Sa philosophie, ses mathématiques, son théâtre et ses arts influencent des sociétés ultérieures.', en: 'Ancient Greece consisted of independent city-states with varied political systems. Its philosophy, mathematics, theatre, and arts influenced later societies.' }, source: 'https://www.metmuseum.org/toah/hd/angk/hd_angk.htm' },
  carthage: { text: { ar: 'نشأت قرطاج مدينةً فينيقية على ساحل تونس الحالية، ثم صارت قوة بحرية وتجارية كبرى في غرب المتوسط قبل أن تدمجها روما في دولتها.', fr: 'Fondée comme cité phénicienne sur le littoral de l’actuelle Tunisie, Carthage devient une grande puissance maritime et commerciale de la Méditerranée occidentale avant son intégration à Rome.', en: 'Founded as a Phoenician city on the coast of modern Tunisia, Carthage became a major maritime and trading power in the western Mediterranean before its incorporation into Rome.' }, source: 'https://www.britannica.com/place/Carthage-ancient-city-Tunisia' },
  rome: { text: { ar: 'تحولت روما من مدينة إلى جمهورية ثم إمبراطورية امتد نفوذها حول المتوسط. تفاوت الحكم بين الأقاليم، وأسهمت الطرق والمدن والقانون في وصلها.', fr: 'Rome passe d’une cité à une république puis à un empire influent autour de la Méditerranée. Les provinces sont gouvernées de façon diverse; routes, villes et droit relient les territoires.', en: 'Rome grew from a city into a republic and then an empire around the Mediterranean. Provinces varied in governance, while roads, cities, and law connected territories.' }, source: 'https://www.metmuseum.org/toah/hd/roem/hd_roem.htm' },
  umayyad: { text: { ar: 'حكمت الدولة الأموية من دمشق بين 661 و750م، وامتد نفوذها إلى مناطق واسعة من غرب آسيا وشمال أفريقيا، ثم عبر إلى الأندلس سنة 711م.', fr: 'Le califat omeyyade gouverne depuis Damas de 661 à 750. Son pouvoir s’étend dans de vastes régions d’Asie occidentale et d’Afrique du Nord, puis atteint al-Andalus en 711.', en: 'The Umayyad caliphate ruled from Damascus from 661 to 750. Its power reached across parts of western Asia and North Africa, and into al-Andalus in 711.' }, source: 'https://www.britannica.com/topic/Umayyad-dynasty-Islamic-history' },
  andalus: { text: { ar: 'الأندلس اسم لمجتمعات ودول متعددة في شبه الجزيرة الإيبيرية. تعاقبت عليها سلطات مختلفة، ونشأت فيها مدن ومراكز علم وفنون ضمن تواصل وصراع بين ضفتي المتوسط.', fr: 'Al-Andalus désigne des sociétés et États divers de la péninsule Ibérique. Plusieurs pouvoirs s’y succèdent; villes, savoirs et arts se développent dans un contexte d’échanges et de conflits méditerranéens.', en: 'Al-Andalus refers to diverse societies and states in the Iberian Peninsula. Successive powers shaped its cities, learning, and arts amid exchange and conflict across the Mediterranean.' }, source: 'https://www.britannica.com/place/Al-Andalus' },
  abbasid: { text: { ar: 'قامت الخلافة العباسية سنة 750م، واتخذت بغداد عاصمةً منذ تأسيسها. شارك علماء ومترجمون وحرفيون من أقاليم متعددة في حركة علمية وثقافية واسعة.', fr: 'Le califat abbasside commence en 750 et fait de Bagdad sa capitale après sa fondation. Savants, traducteurs et artisans de diverses régions participent à une vie intellectuelle et culturelle foisonnante.', en: 'The Abbasid caliphate began in 750 and made Baghdad its capital after the city’s foundation. Scholars, translators, and artisans from many regions contributed to its intellectual and cultural life.' }, source: 'https://www.metmuseum.org/toah/hd/abba/hd_abba.htm' },
  ghana: { text: { ar: 'ازدهرت دولة غانا التاريخية في غرب أفريقيا، واستفادت مدنها من شبكات التجارة عبر الصحراء. وهي غير دولة غانا الحديثة التي تحمل الاسم نفسه.', fr: 'Le Ghana historique prospère en Afrique de l’Ouest et ses villes profitent des routes commerciales transsahariennes. Il ne s’agit pas de l’État moderne du Ghana.', en: 'The historical Ghana state flourished in West Africa, with towns connected to trans-Saharan trade. It is distinct from the modern country of Ghana.' }, source: 'https://www.britannica.com/place/Ghana-historical-western-African-empire' },
  mali: { text: { ar: 'ازدهرت إمبراطورية مالي في غرب أفريقيا، وارتبطت مدنها بالتجارة عبر الصحراء وبمراكز المعرفة، ومنها تمبكتو. لم تكن السيطرة على الطرق ثابتة في كل عصر.', fr: 'L’empire du Mali prospère en Afrique de l’Ouest. Ses villes sont liées au commerce transsaharien et à des centres de savoir comme Tombouctou; le contrôle des routes varie selon les périodes.', en: 'The Mali Empire flourished in West Africa. Its cities connected to trans-Saharan trade and centers of learning such as Timbuktu, though control of routes changed over time.' }, source: 'https://www.britannica.com/place/Mali-historical-empire-Africa' },
  ottoman: { text: { ar: 'نشأت الدولة العثمانية في الأناضول، ثم توسعت عبر قرون إلى أجزاء من أوروبا وغرب آسيا وشمال أفريقيا. تنوعت شعوبها وإداراتها وتغيرت حدودها.', fr: 'L’État ottoman naît en Anatolie puis s’étend, au fil des siècles, dans des régions d’Europe, d’Asie occidentale et d’Afrique du Nord. Ses populations, ses administrations et ses frontières sont diverses et changeantes.', en: 'The Ottoman state emerged in Anatolia and expanded over centuries into parts of Europe, western Asia, and North Africa. Its peoples, administrations, and borders varied over time.' }, source: 'https://www.metmuseum.org/toah/hd/otto/hd_otto.htm' },
  songhai: { text: { ar: 'توسعت سونغاي حول نهر النيجر، وأصبحت من القوى البارزة في غرب أفريقيا في القرنين الخامس عشر والسادس عشر. جمعت مدنها التجارة والحكم والتعليم.', fr: 'L’empire songhaï s’étend autour du Niger et devient une puissance importante d’Afrique de l’Ouest aux XVe et XVIe siècles. Ses villes relient commerce, gouvernement et enseignement.', en: 'Songhai expanded along the Niger and became a major West African power in the 15th and 16th centuries. Its cities linked trade, government, and learning.' }, source: 'https://www.britannica.com/place/Songhai-empire' },
  independence: { text: { ar: 'استقلت دول أفريقية في موجات متتابعة خلال القرن العشرين، ولكل بلد مساره وحركته وتاريخه الخاص. يعرض المؤشر نطاقًا تقريبيًا لسنوات الاستقلال، لا تاريخًا موحدًا للقارة.', fr: 'Les pays africains deviennent indépendants par vagues au XXe siècle, chacun selon son parcours et son histoire. Le point indique une période approximative, pas une date unique pour tout le continent.', en: 'African countries gained independence in successive waves during the 20th century, each with its own movement and history. This marker indicates an approximate period, not one date for the continent.' }, source: 'https://www.britannica.com/place/Africa/Decolonization' },
  au: { text: { ar: 'تأسس الاتحاد الأفريقي عام 2002 خلفًا لمنظمة الوحدة الأفريقية. يعمل على التعاون بين الدول الأعضاء في قضايا السلم والتنمية والتكامل، وتواجه جهوده تحديات سياسية واقتصادية متعددة.', fr: 'Créée en 2002, l’Union africaine succède à l’Organisation de l’unité africaine. Elle soutient la coopération entre États membres sur la paix, le développement et l’intégration, avec des défis politiques et économiques.', en: 'Established in 2002, the African Union succeeded the Organization of African Unity. It promotes cooperation among member states on peace, development, and integration, amid varied political and economic challenges.' }, source: 'https://au.int/en/overview' },
  indus: { text: { ar: 'نشأت مدن وادي السند قبل نحو 4500 سنة. تكشف موهينجو دارو عن تخطيط للشوارع ومبانٍ من الآجر ونظام متقدم لتصريف المياه؛ ولا تزال قراءة لغتهم غير محسومة.', fr: 'Les villes de l’Indus émergent il y a environ 4 500 ans. Mohenjo-daro révèle des rues planifiées, des constructions en brique et un système élaboré de drainage; son écriture n’est pas encore déchiffrée.', en: 'Indus cities emerged about 4,500 years ago. Mohenjo-daro reveals planned streets, brick buildings, and elaborate drainage; the civilization’s script remains undeciphered.' }, source: 'https://whc.unesco.org/en/list/138' },
  china: { text: { ar: 'تطورت في الصين مجتمعات ودول وسلالات متعاقبة، لا حضارة ثابتة واحدة. تقدم آثار شانغ، مثل نقوش العظام والبرونز، شواهد مبكرة على الكتابة والسلطة.', fr: 'La Chine connaît des sociétés, États et dynasties successifs plutôt qu’une civilisation immuable. Les vestiges des Shang, dont les inscriptions sur os et les bronzes, témoignent de formes anciennes d’écriture et de pouvoir.', en: 'China saw successive societies, states, and dynasties rather than one unchanging civilization. Shang remains, including oracle-bone inscriptions and bronzes, offer early evidence of writing and political power.' }, source: 'https://www.metmuseum.org/toah/ht/03/eac' },
  persia: { text: { ar: 'أسس الأخمينيون في القرن السادس قبل الميلاد إمبراطورية واسعة ربطت أقاليم متعددة. استخدموا طرقًا وإدارات محلية، مع تنوع لغوي وثقافي كبير.', fr: 'Au VIe siècle av. J.-C., les Achéménides fondent un vaste empire reliant des régions diverses. Routes et administrations locales contribuent à son fonctionnement, dans une grande diversité linguistique et culturelle.', en: 'In the sixth century BCE, the Achaemenids built a vast empire linking diverse regions. Roads and local administrations helped govern it amid substantial linguistic and cultural diversity.' }, source: 'https://www.metmuseum.org/toah/hd/acha/hd_acha.htm' },
  maya: { text: { ar: 'لم تكن حضارة المايا إمبراطورية واحدة؛ قامت مدن مستقلة في أمريكا الوسطى، وطورت أنظمة كتابة وتقويم ومعرفة فلكية. ازدهرت مدنها في أزمنة مختلفة.', fr: 'Les Mayas ne forment pas un empire unique : des cités indépendantes d’Amérique centrale développent écriture, calendriers et savoirs astronomiques. Leurs périodes d’essor diffèrent.', en: 'The Maya were not a single empire: independent cities in Central America developed writing, calendars, and astronomical knowledge. Their periods of prominence varied.' }, source: 'https://whc.unesco.org/en/list/483/' },
  inca: { text: { ar: 'ربطت دولة الإنكا مناطق واسعة من جبال الأنديز بشبكات طرق ومدرجات زراعية ومراكز إدارية. بُني ماتشو بيتشو في القرن الخامس عشر، قبل الغزو الإسباني في القرن السادس عشر.', fr: 'L’État inca relie de vastes régions des Andes par des routes, des terrasses agricoles et des centres administratifs. Machu Picchu est construit au XVe siècle, avant la conquête espagnole du XVIe siècle.', en: 'The Inca state connected wide areas of the Andes through roads, agricultural terraces, and administrative centers. Machu Picchu was built in the 15th century, before the Spanish conquest in the 16th.' }, source: 'https://whc.unesco.org/en/list/274/' },
  mongol: { text: { ar: 'أنشأ المغول في القرن الثالث عشر أكبر إمبراطورية متصلة برًا في التاريخ. اختلف الحكم بين أقاليمها، وأسهمت طرقها في انتقال السلع والأفكار، كما رافق التوسع عنف ودمار.', fr: 'Au XIIIe siècle, les Mongols créent le plus vaste empire contigu de l’histoire. Le gouvernement varie selon les régions; les routes favorisent aussi les échanges, tandis que les conquêtes s’accompagnent de violences et de destructions.', en: 'In the 13th century, the Mongols created history’s largest contiguous land empire. Rule varied across regions; routes enabled exchange, while conquest also brought violence and destruction.' }, source: 'https://www.metmuseum.org/toah/hd/mong/hd_mong.htm' },
  mughal: { text: { ar: 'حكمت الدولة المغولية الهندية أجزاء واسعة من شبه القارة بين القرنين السادس عشر والتاسع عشر. جمعت مدنها ثقافات وفنونًا متعددة، وتغير نفوذها بمرور الزمن.', fr: 'L’empire moghol gouverne de vastes régions du sous-continent indien du XVIe au XIXe siècle. Ses villes réunissent diverses cultures et traditions artistiques; son pouvoir évolue au fil du temps.', en: 'The Mughal Empire ruled large parts of the Indian subcontinent from the 16th to the 19th century. Its cities brought together diverse cultures and arts, while its power changed over time.' }, source: 'https://www.metmuseum.org/toah/hd/mugh/hd_mugh.htm' },
}

const CIVS: Civ[] = [
  { id: 'sumer', lon: 45.5, lat: 31.9, start: -3500, end: -1750, color: '#c0392b', name: { ar: 'سومر وبلاد الرافدين', fr: 'Sumer et la Mésopotamie', en: 'Sumer & Mesopotamia' } },
  { id: 'egypt', lon: 31.2, lat: 29.9, start: -3000, end: -30, color: '#c78f4f', name: { ar: 'مصر القديمة', fr: 'Égypte antique', en: 'Ancient Egypt' }, link: 'pyramids' },
  { id: 'phoenicia', lon: 35.5, lat: 33.9, start: -1200, end: -300, color: '#7d5ba6', name: { ar: 'فينيقيا', fr: 'Phénicie', en: 'Phoenicia' } },
  { id: 'greece', lon: 23.7, lat: 38, start: -800, end: -146, color: '#2f6fb3', name: { ar: 'اليونان الكلاسيكية', fr: 'Grèce classique', en: 'Classical Greece' } },
  { id: 'carthage', lon: 10.2, lat: 36.9, start: -800, end: -146, color: '#b03030', name: { ar: 'قرطاج', fr: 'Carthage', en: 'Carthage' }, link: 'africa' },
  { id: 'rome', lon: 12.5, lat: 41.9, start: -500, end: 476, color: '#8a6d3b', name: { ar: 'الإمبراطورية الرومانية', fr: 'Empire romain', en: 'Roman Empire' } },
  { id: 'umayyad', lon: 36.3, lat: 33.5, start: 661, end: 750, color: '#2e7d32', name: { ar: 'الدولة الأموية', fr: 'Califat omeyyade', en: 'Umayyad Caliphate' } },
  { id: 'andalus', lon: -4.4, lat: 37.9, start: 711, end: 1492, color: '#d9a32b', name: { ar: 'الأندلس', fr: 'Al-Andalus', en: 'Al-Andalus' } },
  { id: 'abbasid', lon: 44.4, lat: 33.3, start: 750, end: 1258, color: '#2e7d32', name: { ar: 'الدولة العباسية', fr: 'Califat abbasside', en: 'Abbasid Caliphate' } },
  { id: 'ghana', lon: -7.9, lat: 16.2, start: 700, end: 1200, color: '#d9a32b', name: { ar: 'مملكة غانا', fr: 'Empire du Ghana', en: 'Ghana Empire' }, link: 'africa' },
  { id: 'mali', lon: -8, lat: 13.5, start: 1235, end: 1600, color: '#d9a32b', name: { ar: 'إمبراطورية مالي', fr: 'Empire du Mali', en: 'Mali Empire' }, link: 'africa' },
  { id: 'ottoman', lon: 29, lat: 41, start: 1299, end: 1922, color: '#b03030', name: { ar: 'الدولة العثمانية', fr: 'Empire ottoman', en: 'Ottoman Empire' } },
  { id: 'songhai', lon: 0, lat: 16, start: 1464, end: 1591, color: '#c78f4f', name: { ar: 'إمبراطورية سونغاي', fr: 'Empire songhaï', en: 'Songhai Empire' }, link: 'africa' },
  { id: 'independence', lon: 20, lat: 2, start: 1956, end: 1965, color: '#2f9fd8', name: { ar: 'استقلالات أفريقيا', fr: 'Indépendances africaines', en: 'African independence' }, link: 'africa' },
  { id: 'au', lon: 9, lat: 9, start: 2002, end: 2026, color: '#27ae60', name: { ar: 'الاتحاد الأفريقي', fr: 'Union africaine', en: 'African Union' }, link: 'africa' },
  { id: 'indus', lon: 68.1, lat: 27.3, start: -2600, end: -1900, color: '#b87942', name: { ar: 'حضارة وادي السند', fr: 'Civilisation de l’Indus', en: 'Indus civilization' } },
  { id: 'china', lon: 113.5, lat: 34.5, start: -1600, end: -1046, color: '#bf4d45', name: { ar: 'الصين القديمة · شانغ', fr: 'Chine ancienne · Shang', en: 'Ancient China · Shang' } },
  { id: 'persia', lon: 53.5, lat: 30, start: -550, end: -330, color: '#7455a5', name: { ar: 'الإمبراطورية الأخمينية', fr: 'Empire achéménide', en: 'Achaemenid Empire' } },
  { id: 'maya', lon: -89, lat: 19.5, start: 250, end: 900, color: '#2d8f7d', name: { ar: 'مدن المايا', fr: 'Cités mayas', en: 'Maya cities' } },
  { id: 'inca', lon: -72.5, lat: -13.2, start: 1438, end: 1533, color: '#b17630', name: { ar: 'دولة الإنكا', fr: 'État inca', en: 'Inca state' } },
  { id: 'mongol', lon: 103, lat: 47, start: 1206, end: 1368, color: '#596e8c', name: { ar: 'الإمبراطورية المغولية', fr: 'Empire mongol', en: 'Mongol Empire' } },
  { id: 'mughal', lon: 77, lat: 27, start: 1526, end: 1857, color: '#548c73', name: { ar: 'الدولة المغولية الهندية', fr: 'Empire moghol', en: 'Mughal Empire' } },
]

const ERAS: Era[] = [
  { year: -3000, title: { ar: 'مدن وكتابة في عوالم متوازية', fr: 'Villes et écritures en parallèle', en: 'Cities and writing in parallel' }, text: { ar: 'تطورت المدن والكتابة في مناطق مختلفة، منها وادي النيل وبلاد الرافدين ووادي السند. لم تكن هذه المجتمعات نسخة واحدة، ولم تبدأ كلها في الوقت نفسه.', fr: 'Villes et écritures se développent dans plusieurs régions, dont le Nil, la Mésopotamie et l’Indus. Ces sociétés sont différentes et ne commencent pas toutes au même moment.', en: 'Cities and writing develop in several regions, including the Nile, Mesopotamia, and the Indus. These societies differ and do not all begin at the same time.' } },
  { year: -1200, title: { ar: 'شبكات البحر والبر', fr: 'Réseaux maritimes et terrestres', en: 'Sea and land networks' }, text: { ar: 'وصلت طرق التجارة والملاحة موانئ المتوسط والبحر الأحمر وغرب آسيا. نقلت السلع والمعارف والأفكار، وساعدت أحيانًا على انتشار اللغات والكتابة.', fr: 'Commerce et navigation relient les ports méditerranéens et ceux de la mer Rouge à l’Asie occidentale. Les routes transportent biens, savoirs et idées, et parfois langues et écritures.', en: 'Trade and sailing connect Mediterranean and Red Sea ports with western Asia. Routes carry goods, knowledge, and ideas, and sometimes languages and writing.' } },
  { year: -500, title: { ar: 'مدن ودول متعددة', fr: 'Cités et États divers', en: 'Many kinds of cities and states' }, text: { ar: 'ظهرت دول وإمبراطوريات حول المتوسط وغرب آسيا، إلى جانب مدن مستقلة. اختلفت نظم الحكم، فلا يصح وصف منطقة كاملة بنظام سياسي واحد.', fr: 'États et empires émergent autour de la Méditerranée et en Asie occidentale, à côté de cités indépendantes. Les formes de gouvernement diffèrent d’une région à l’autre.', en: 'States and empires emerge around the Mediterranean and western Asia alongside independent cities. Political systems differ from one region to another.' } },
  { year: 100, title: { ar: 'إمبراطوريات وطرق متصلة', fr: 'Empires et routes connectées', en: 'Empires and connected routes' }, text: { ar: 'امتدت إمبراطوريات مثل روما وهان في مساحات شاسعة، بينما ازدهرت ممالك ومدن أخرى. ساعدت الطرق البرية والبحرية على حركة التجار والرسل والسلع.', fr: 'Des empires comme Rome et les Han s’étendent sur de vastes territoires, tandis que d’autres royaumes et cités prospèrent. Routes terrestres et maritimes font circuler marchands, messagers et biens.', en: 'Empires such as Rome and Han China span large territories while other kingdoms and cities thrive. Land and sea routes move merchants, messengers, and goods.' } },
  { year: 750, title: { ar: 'مراكز علم وتجارة جديدة', fr: 'Nouveaux centres de savoir et d’échanges', en: 'New centers of learning and exchange' }, text: { ar: 'توسعت مدن مثل بغداد وقرطبة، ونمت شبكات الترجمة والطب والرياضيات والفلك. ازدهار العلم شاركت فيه مجتمعات وأقاليم متعددة، ولم يقتصر على مدينة أو لغة واحدة.', fr: 'Bagdad et Cordoue grandissent; traduction, médecine, mathématiques et astronomie se développent. Des sociétés et régions multiples participent à ces échanges, au-delà d’une seule ville ou langue.', en: 'Cities such as Baghdad and Córdoba grow, with translation, medicine, mathematics, and astronomy developing. Many societies and regions contribute, beyond any one city or language.' } },
  { year: 1000, title: { ar: 'قوة المدن والمعارف', fr: 'Villes puissantes et savoirs', en: 'Powerful cities and knowledge' }, text: { ar: 'أصبحت مدن في أفريقيا وآسيا وأوروبا عقدًا للتجارة والتعليم والحرف. وتطورت مراكز مثل القاهرة وفاس وتمبكتو في سياقات متباينة ومترابطة.', fr: 'Des villes d’Afrique, d’Asie et d’Europe deviennent des carrefours du commerce, de l’enseignement et de l’artisanat. Le Caire, Fès et Tombouctou évoluent dans des contextes différents mais reliés.', en: 'Cities across Africa, Asia, and Europe become hubs of trade, learning, and craft. Cairo, Fez, and Timbuktu develop in distinct yet connected contexts.' } },
  { year: 1300, title: { ar: 'الطرق العابرة للقارات', fr: 'Routes à travers les continents', en: 'Routes across continents' }, text: { ar: 'وسّعت طرق القوافل والبحر والمغول حركة الناس والبضائع بين أقاليم بعيدة. حمل الاتصال فرصًا للتعلم والتجارة، لكنه جلب أيضًا حروبًا وأوبئة واضطرابات.', fr: 'Routes caravanières, maritimes et expansion mongole intensifient les déplacements entre régions éloignées. Ces contacts favorisent échanges et apprentissages, mais aussi guerres, épidémies et bouleversements.', en: 'Caravan and sea routes, as well as Mongol expansion, increase movement between distant regions. Contact enables trade and learning, but also brings wars, epidemics, and upheaval.' } },
  { year: 1500, title: { ar: 'عالم مترابط بحريًا', fr: 'Un monde relié par les océans', en: 'A world linked by oceans' }, text: { ar: 'تغيرت شبكات التجارة بعد الرحلات البحرية الأوروبية، واشتد الاستعمار والاستعباد القسري. لا تُروى هذه المرحلة بوصفها اكتشافًا من طرف واحد؛ فقد كانت القارات مأهولة ومتصلة قبلها.', fr: 'Les voyages européens transforment le commerce océanique, avec l’expansion de la colonisation et de l’esclavage. Cette période ne se résume pas à une découverte unilatérale : les continents étaient habités et reliés auparavant.', en: 'European voyages transform oceanic trade, alongside expanding colonialism and enslavement. This period was not a one-sided “discovery”: continents were already inhabited and connected.' } },
  { year: 1800, title: { ar: 'الثورة الصناعية والتحولات العالمية', fr: 'Révolution industrielle et mutations mondiales', en: 'Industrial revolution and global change' }, text: { ar: 'غيرت الصناعة والنقل والاتصالات أشكال العمل والمدن والتجارة. ارتبط التصنيع في دول كثيرة بالاستعمار واستغلال الموارد، مع تفاوت كبير بين المجتمعات.', fr: 'Industrie, transports et communications transforment travail, villes et commerce. Dans de nombreux pays, l’industrialisation est liée à la colonisation et à l’exploitation des ressources, de manière inégale.', en: 'Industry, transport, and communication reshape work, cities, and trade. In many places industrialization is tied to colonialism and resource extraction, with unequal effects.' } },
  { year: 1900, title: { ar: 'نهاية الاستعمار وبناء الدول', fr: 'Décolonisations et construction des États', en: 'Decolonization and state-building' }, text: { ar: 'شهد القرن العشرون حروبًا عالمية وحركات تحرر واستقلال في آسيا وأفريقيا. تباينت مسارات الدول الجديدة وتحدياتها، واستمرت آثار الحدود الاستعمارية.', fr: 'Le XXe siècle connaît des guerres mondiales et des mouvements de libération et d’indépendance en Asie et en Afrique. Les trajectoires des nouveaux États diffèrent; les frontières coloniales laissent des traces.', en: 'The 20th century brings world wars and independence movements across Asia and Africa. New states follow varied paths and face different challenges; colonial borders leave lasting effects.' } },
  { year: 1960, title: { ar: 'التعاون الإقليمي', fr: 'Coopérations régionales', en: 'Regional cooperation' }, text: { ar: 'تأسست منظمات إقليمية لتنسيق التعاون بين دول مستقلة حديثًا أو متجاورة. الاتحاد الأفريقي، الذي تأسس عام 2002، خلف منظمة الوحدة الأفريقية.', fr: 'Des organisations régionales coordonnent la coopération entre États voisins ou récemment indépendants. L’Union africaine, créée en 2002, succède à l’Organisation de l’unité africaine.', en: 'Regional organizations coordinate cooperation among neighboring and newly independent states. The African Union, established in 2002, succeeded the Organization of African Unity.' } },
  { year: 2026, title: { ar: 'العالم اليوم: ترابط وتحديات', fr: 'Le monde aujourd’hui : liens et défis', en: 'Today: connections and challenges' }, text: { ar: 'تتصل المجتمعات بالهجرة والتجارة والاتصالات الرقمية والبحث العلمي، وتواجه قضايا مشتركة مثل المناخ والصحة والموارد. لكل منطقة تاريخها وتجربتها الخاصة داخل هذا العالم المترابط.', fr: 'Migration, commerce, communications numériques et recherche relient les sociétés, qui affrontent des enjeux communs comme le climat, la santé et les ressources. Chaque région garde son histoire et son expérience.', en: 'Migration, trade, digital communication, and research connect societies facing shared issues such as climate, health, and resources. Each region retains its own history and experience.' } },
]

const W = 780
const H = 560
const px = (lon: number) => ((lon + 180) / 360) * W
const py = (lat: number) => ((85 - lat) / 145) * H

function fmtYear(y: number, lang: Lang): string {
  if (y < 0) {
    return lang === 'ar' ? `${-y} ق.م` : lang === 'fr' ? `${-y} av. J.-C.` : `${-y} BCE`
  }
  return String(y)
}

function CivilizationsTimeline({ lang }: { lang: Lang }) {
  const [year, setYear] = useState(-2500)
  const [playing, setPlaying] = useState(false)
  const [sel, setSel] = useState<Civ | null>(null)
  const [paths, setPaths] = useState<{ d: string }[]>([])
  const [err, setErr] = useState(false)

  useEffect(() => {
    let live = true
    void fetch(publicUrl('assets/ne_110m_admin_0_countries.geojson'))
      .then((r) => r.json())
      .then((data: { features: any[] }) => {
        if (!live) return
        const out: { d: string }[] = []
        for (const f of data.features) {
          const polys: any[][][] = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
          for (const poly of polys) {
            const ring = poly[0] as [number, number][]
            if (!ring || ring.length < 4) continue
            let d = ''
            ring.forEach(([lon, lat], i) => {
              d += `${i === 0 ? 'M' : 'L'} ${px(lon).toFixed(1)} ${py(lat).toFixed(1)} `
            })
            out.push({ d: d + 'Z' })
          }
        }
        setPaths(out)
      })
      .catch(() => live && setErr(true))
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setYear((y) => {
        if (y >= 2026) {
          setPlaying(false)
          return y
        }
        return Math.min(2026, y + 50)
      })
    }, 260)
    return () => clearInterval(id)
  }, [playing])

  const era = [...ERAS].reverse().find((e) => e.year <= year) ?? ERAS[0]
  const active = CIVS.filter((c) => c.start <= year && c.end >= year)
  const selectedInfo = sel ? CIV_DETAILS[sel.id] : undefined

  const pickCiv = (c: Civ) => {
    setSel(c)
    sound.pop()
  }

  return (
    <div className="page-wide atlas">
      <h2 className="atlas-map-title">{lang === 'ar' ? 'خريطة الحضارات عبر الزمن' : lang === 'fr' ? 'Carte des civilisations à travers le temps' : 'Civilizations through time'}</h2>
      <p className="empty">{lang === 'ar' ? 'حرّك الزمن، ثم اختر نقطة على الخريطة لاستكشاف مجتمع أو دولة ومصادرها.' : lang === 'fr' ? 'Déplacez le curseur temporel, puis choisissez un point pour explorer une société, un État et ses sources.' : 'Move through time, then select a point to explore a society, state, and its sources.'}</p>

      <div className="atlas-controls">
        <button
          className="primary-btn"
          onClick={() => {
            if (!playing) awardBadge('timeTraveler')
            setPlaying(!playing)
            sound.click()
          }}
        >
          {playing ? `⏸ ${t(lang, 'atlasPause')}` : `▶ ${t(lang, 'atlasPlay')}`}
        </button>
        <label className="scene-slider atlas-year">
          {t(lang, 'atlasYear')}: <strong>{fmtYear(year, lang)}</strong>
          <input
            type="range"
            min={-3000}
            max={2026}
            step={25}
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value))
              setPlaying(false)
            }}
          />
        </label>
        <span className="atlas-active-count">
          ⭐ {t(lang, 'atlasActive')}: {active.length}
        </span>
      </div>

      <div className="atlas-layout">
        <div className="atlas-map-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} className="atlas-svg" role="img">
            <defs>
              <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bfe0f5" />
                <stop offset="100%" stopColor="#8fc3e8" />
              </linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#sea)" />
            {paths.map((p, i) => (
              <path key={i} d={p.d} fill="#e8dfc4" stroke="#b9a87f" strokeWidth="1" />
            ))}
            {CIVS.map((c) => {
              const on = c.start <= year && c.end >= year
              if (!on) return null
              return (
                <g key={c.id} className="civ-point" onClick={() => pickCiv(c)}>
                  <circle cx={px(c.lon)} cy={py(c.lat)} r="15" fill={c.color} opacity="0.25">
                    <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={px(c.lon)} cy={py(c.lat)} r="8" fill={c.color} stroke="#fff" strokeWidth="2" />
                  <text x={px(c.lon)} y={py(c.lat) + 24} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#16293f">
                    {c.name[lang]}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <aside className="atlas-panel">
          <div className="era-card" style={{ borderInlineStartColor: '#c8a24a' }}>
            <h3>{era.title[lang]}</h3>
            <p>{era.text[lang]}</p>
          </div>
          {sel && (
            <div className="civ-card" style={{ borderInlineStartColor: sel.color }}>
              <h4>{sel.name[lang]}</h4>
              <p>
                {fmtYear(sel.start, lang)} → {fmtYear(sel.end, lang)}
              </p>
              {selectedInfo && <p>{selectedInfo.text[lang]}</p>}
              {sel.link && (
                <button className="ghost-btn small" onClick={() => (window.location.hash = `#/article/${sel.link}`)}>
                  📖 {t(lang, 'articles')}
                </button>
              )}
              {selectedInfo && <a className="ghost-btn small" href={selectedInfo.source} target="_blank" rel="noreferrer">{lang === 'ar' ? 'مصدر تاريخي ↗' : lang === 'fr' ? 'Source ↗' : 'Reference ↗'}</a>}
            </div>
          )}
          {!sel && (
            <div className="civ-card muted">
              <p>{t(lang, 'atlasClick')}</p>
            </div>
          )}
        </aside>
      </div>
      {err && <p className="empty">Map unavailable</p>}
    </div>
  )
}

type Localized = Record<Lang, string>
type AtlasDomain = {
  id: string
  icon: string
  color: string
  title: Localized
  summary: Localized
  child: Localized
  academic: Localized
  time: Localized[]
  timeDates: Localized[]
  place: Localized[]
  source: { label: Localized; url: string }
}

const DOMAINS: AtlasDomain[] = [
  {
    id: 'space', icon: 'public', color: '#5865d8',
    title: { ar: 'الفضاء والكون', fr: 'Espace et Univers', en: 'Space & Universe' },
    summary: { ar: 'من المجرات والنجوم إلى الكواكب والأقمار واستكشاف الفضاء.', fr: 'Des galaxies et étoiles aux planètes, lunes et missions spatiales.', en: 'From galaxies and stars to planets, moons, and space exploration.' },
    child: { ar: 'الكون واسع جدًا: فيه مجرات كثيرة، وفي مجرتنا نجوم وكواكب. تدور الأرض حول الشمس، وأرسل البشر مركبات وروبوتات لاستكشاف عوالم بعيدة.', fr: 'L’Univers est immense : il contient de nombreuses galaxies. Dans la nôtre, des étoiles et des planètes; la Terre tourne autour du Soleil et des robots explorent d’autres mondes.', en: 'The Universe is enormous and contains many galaxies. Our galaxy has stars and planets; Earth orbits the Sun, and robots explore distant worlds.' },
    academic: { ar: 'يعرض هذا المسار البنية الكونية على مقاييس متعاقبة: من النظام الشمسي إلى مجرة درب التبانة، فالمجرات المرصودة وبنية الكون واسعة النطاق. يميز بين ما قيس مباشرةً، وما يُستنتج من الضوء والطيف والانزياح الأحمر، وما يزال نموذجًا قابلًا للاختبار. ويصل التطور الزمني للكون بتطور أدوات الرصد، من التلسكوبات الأرضية إلى المراصد الفضائية والمسابير.', fr: 'Ce parcours relie plusieurs échelles : système solaire, Voie lactée, galaxies observées et structure à grande échelle. Il distingue les mesures directes, les inférences tirées de la lumière et du décalage spectral, et les modèles encore testables. L’histoire cosmique est mise en regard de l’évolution des instruments, des télescopes terrestres aux observatoires spatiaux et aux sondes.', en: 'This route connects scales from the Solar System and Milky Way to observed galaxies and large-scale structure. It distinguishes direct measurements, inferences from light and spectral redshift, and models that remain testable. Cosmic history is linked to the changing instruments used to study it, from ground telescopes to space observatories and probes.' },
    time: [{ ar: 'الكون المبكر', fr: 'Univers primordial', en: 'Early Universe' }, { ar: 'ولادة النجوم والمجرات', fr: 'Naissance des étoiles et galaxies', en: 'Stars and galaxies form' }, { ar: 'النظام الشمسي', fr: 'Système solaire', en: 'Solar System' }, { ar: 'استكشاف الفضاء اليوم', fr: 'Exploration spatiale actuelle', en: 'Space exploration today' }],
    timeDates: [{ ar: 'بداية التمدد الكوني · قبل 13.8 مليار سنة', fr: 'Début de l’expansion · il y a 13,8 milliards d’années', en: 'Expansion begins · 13.8 billion years ago' }, { ar: 'الكون المبكر · أكثر من 13 مليار سنة', fr: 'Univers jeune · il y a plus de 13 milliards d’années', en: 'Early Universe · over 13 billion years ago' }, { ar: 'تكوّن النظام الشمسي · قبل 4.6 مليار سنة', fr: 'Formation du système solaire · il y a 4,6 milliards d’années', en: 'Solar System forms · 4.6 billion years ago' }, { ar: 'القرن العشرون إلى اليوم', fr: 'Du XXe siècle à aujourd’hui', en: '20th century to today' }],
    place: [{ ar: 'الكون المرصود', fr: 'Univers observable', en: 'Observable Universe' }, { ar: 'مجرة درب التبانة', fr: 'Voie lactée', en: 'Milky Way' }, { ar: 'النظام الشمسي', fr: 'Système solaire', en: 'Solar System' }, { ar: 'الأرض والقمر', fr: 'Terre et Lune', en: 'Earth and Moon' }],
    source: { label: { ar: 'ناسا: استكشاف الكون', fr: 'NASA : explorer l’Univers', en: 'NASA: Universe exploration' }, url: 'https://science.nasa.gov/universe/' },
  },
  {
    id: 'earth', icon: 'terrain', color: '#178a79',
    title: { ar: 'الأرض والجغرافيا والمناخ', fr: 'Terre, géographie et climat', en: 'Earth, Geography & Climate' },
    summary: { ar: 'تكوّن الأرض، القارات والمحيطات، المناخ، والأنظمة التي تغيّر سطح الكوكب.', fr: 'Formation terrestre, continents, océans, climat et systèmes qui transforment la surface.', en: 'Earth’s formation, continents, oceans, climate, and the systems reshaping the planet.' },
    child: { ar: 'سطح الأرض يتحرك ببطء شديد؛ لذلك تتباعد القارات أو تقترب عبر ملايين السنين. وتغيّر المياه والرياح والجليد شكل الجبال والوديان، بينما يصف المناخ أنماط الطقس على مدى طويل.', fr: 'La surface terrestre bouge très lentement : les continents s’éloignent ou se rapprochent sur des millions d’années. L’eau, le vent et la glace sculptent montagnes et vallées; le climat décrit les tendances météorologiques de longue durée.', en: 'Earth’s surface moves very slowly, so continents drift apart or meet over millions of years. Water, wind, and ice shape mountains and valleys; climate describes long-term patterns of weather.' },
    academic: { ar: 'يجمع المسار بين الزمن الجيولوجي ودينامية النظام الأرضي. تُقرأ الصفائح التكتونية بوصفها إطارًا لتفسير توزع الزلازل والبراكين وبناء الأحواض والجبال، مع تمييز حركة الصفائح عن التغيرات السطحية السريعة. ويربط المناخ بين ميزانية الطاقة، ودوران الغلافين الجوي والمحيطي، ودورات الكربون والماء؛ أما خرائط الماضي فتستند إلى أدلة صخرية ومستحاثية ومغناطيسية، لا إلى إسقاط الحاضر ببساطة على الماضي.', fr: 'Le parcours associe temps géologique et dynamique du système terrestre. La tectonique des plaques explique la distribution des séismes et volcans ainsi que la formation de bassins et de chaînes, tout en la distinguant des processus de surface plus rapides. Le climat relie bilan énergétique, circulations atmosphérique et océanique, et cycles du carbone et de l’eau. Les cartes du passé reposent sur des indices géologiques, fossiles et magnétiques.', en: 'This route connects geological time with Earth-system dynamics. Plate tectonics helps explain the distribution of earthquakes and volcanoes and the formation of basins and mountains, while remaining distinct from faster surface processes. Climate links the energy budget, atmospheric and ocean circulation, and carbon and water cycles. Maps of past Earth rely on geological, fossil, and magnetic evidence rather than simply projecting the present backward.' },
    time: [{ ar: 'تكوّن الأرض', fr: 'Formation de la Terre', en: 'Earth forms' }, { ar: 'تجمّع القارات وتفككها', fr: 'Assemblage et fragmentation des continents', en: 'Continents assemble and break apart' }, { ar: 'العصور الجليدية والمناخ', fr: 'Glaciations et climat', en: 'Ice ages and climate' }, { ar: 'الأرض المعاصرة', fr: 'Terre actuelle', en: 'Earth today' }],
    timeDates: [{ ar: 'قبل 4.54 مليار سنة', fr: 'Il y a 4,54 milliards d’années', en: '4.54 billion years ago' }, { ar: 'مليارات السنين', fr: 'Sur des milliards d’années', en: 'Across billions of years' }, { ar: 'آخر 2.6 مليون سنة', fr: 'Depuis 2,6 millions d’années', en: 'Past 2.6 million years' }, { ar: 'القرن العشرون إلى اليوم', fr: 'Du XXe siècle à aujourd’hui', en: '20th century to today' }],
    place: [{ ar: 'الكون والنظام الشمسي', fr: 'Univers et système solaire', en: 'Universe and Solar System' }, { ar: 'الأرض من المدار', fr: 'Terre vue de l’orbite', en: 'Earth from orbit' }, { ar: 'القارات والمحيطات', fr: 'Continents et océans', en: 'Continents and oceans' }, { ar: 'المناخ والأقاليم والبيئات', fr: 'Climats, régions et milieux', en: 'Climates, regions, and environments' }],
    source: { label: { ar: 'هيئة المسح الجيولوجي الأمريكية: علم الأرض', fr: 'USGS : sciences de la Terre', en: 'USGS: Earth science' }, url: 'https://www.usgs.gov/programs/earthquake-hazards/science' },
  },
  {
    id: 'life', icon: 'biotech', color: '#38a16d',
    title: { ar: 'الحياة والتنوع الحيوي', fr: 'Vie et biodiversité', en: 'Life & Biodiversity' },
    summary: { ar: 'الحياة في البر والبحر والماء العذب: الزواحف والطيور والثدييات والبرمائيات، وسؤال الحياة خارج الأرض.', fr: 'Vie terrestre, marine et d’eau douce : reptiles, oiseaux, mammifères, amphibiens et question de la vie ailleurs.', en: 'Land, ocean, and freshwater life: reptiles, birds, mammals, amphibians, and the search for life beyond Earth.' },
    child: { ar: 'الحيوانات ليست كلها متشابهة: لكل مجموعة صفات تساعدها على العيش. للديناصورات تاريخ طويل، والطيور الحديثة تنتمي إلى فرع من الديناصورات؛ أما البحث عن حياة خارج الأرض فيحتاج إلى دليل قابل للفحص.', fr: 'Les animaux ont des caractéristiques adaptées à leurs milieux. Les dinosaures ont une longue histoire et les oiseaux actuels appartiennent à une branche de dinosaures. Chercher la vie ailleurs exige des preuves vérifiables.', en: 'Animal groups have traits suited to different habitats. Dinosaurs have a long history, and living birds belong to one dinosaur branch. Searching for life elsewhere requires evidence that can be tested.' },
    academic: { ar: 'ينظم هذا الباب التنوع الحيوي عبر القرابة التطورية والوظيفة البيئية، لا عبر قوائم أسماء فقط. تُمثّل مجموعات الفقاريات وأقاربها ضمن أشجار نسب قابلة للمراجعة مع ظهور أدلة جديدة، وتُقرأ الانقراضات الجماعية بوصفها تحولات في تركيب النظم البيئية. في الأحياء الفلكية، تُفصل قابلية السكن عن إثبات الحياة: وجود الماء أو مركب عضوي لا يكفي وحده، لذلك تُعرض البصمات الحيوية المحتملة ومصادر الالتباس وطرق التحقق.', fr: 'La biodiversité est organisée selon les parentés évolutives et les fonctions écologiques, et non comme une simple liste. Les arbres phylogénétiques sont révisables à mesure que les preuves évoluent; les extinctions massives sont étudiées comme des transformations des écosystèmes. En astrobiologie, l’habitabilité ne vaut pas preuve de vie : eau ou molécule organique ne suffisent pas; indices possibles, faux positifs et méthodes de vérification sont distingués.', en: 'Biodiversity is organized through evolutionary relationships and ecological function, not merely as a list. Phylogenetic trees are revised as evidence changes, and mass extinctions are treated as ecosystem transformations. In astrobiology, habitability is not proof of life: water or an organic molecule alone is insufficient, so possible biosignatures, false positives, and verification methods are distinguished.' },
    time: [{ ar: 'أقدم آثار الحياة', fr: 'Premières traces de vie', en: 'Earliest traces of life' }, { ar: 'تنوع الحياة في البحار', fr: 'Diversification de la vie marine', en: 'Life diversifies in oceans' }, { ar: 'الحياة على اليابسة', fr: 'Vie sur les continents', en: 'Life on land' }, { ar: 'الطيور والثدييات والبحث الكوني', fr: 'Oiseaux, mammifères et recherche cosmique', en: 'Birds, mammals, and astrobiology' }],
    timeDates: [{ ar: 'نحو 3.5–3.8 مليار سنة (أدلة مبكرة)', fr: 'Env. 3,5–3,8 milliards d’années (traces anciennes)', en: 'About 3.5–3.8 billion years (early evidence)' }, { ar: 'منذ نحو 541 مليون سنة', fr: 'Depuis environ 541 millions d’années', en: 'Since about 541 million years ago' }, { ar: 'مئات ملايين السنين', fr: 'Depuis des centaines de millions d’années', en: 'Hundreds of millions of years ago' }, { ar: 'آخر 66 مليون سنة إلى اليوم', fr: 'Des 66 derniers millions d’années à aujourd’hui', en: 'Past 66 million years to today' }],
    place: [{ ar: 'المحيطات العميقة', fr: 'Océans profonds', en: 'Deep ocean' }, { ar: 'المياه العذبة والأراضي الرطبة', fr: 'Eaux douces et zones humides', en: 'Freshwater and wetlands' }, { ar: 'الغابات والسهول', fr: 'Forêts et plaines', en: 'Forests and grasslands' }, { ar: 'عوالم خارج الأرض', fr: 'Mondes extraterrestres', en: 'Worlds beyond Earth' }],
    source: { label: { ar: 'متحف التاريخ الطبيعي: التطور والحياة', fr: 'Muséum d’histoire naturelle : évolution', en: 'Natural History Museum: evolution' }, url: 'https://www.nhm.ac.uk/discover/what-is-evolution.html' },
  },
  {
    id: 'civilizations', icon: 'account_balance', color: '#bd8a36',
    title: { ar: 'الحضارات والمجتمعات', fr: 'Civilisations et sociétés', en: 'Civilizations & Societies' },
    summary: { ar: 'المدن والطرق والدول والمعرفة عبر أقاليم العالم، مع تجنب اختزال التاريخ في حضارة واحدة.', fr: 'Villes, routes, États et savoirs dans différentes régions du monde, sans réduire l’histoire à une seule civilisation.', en: 'Cities, routes, states, and knowledge across regions, without reducing history to one civilization.' },
    child: { ar: 'لم تكن الحضارات قصة مكان واحد: نشأت مدن وإمبراطوريات في الصين وأفريقيا وأوروبا والأمريكيتين، وازدهرت حضارات إسلامية في مدن كثيرة. ونتساءل أيضًا: هل توجد حضارات في الفضاء؟ حتى الآن لم نعثر على دليل مؤكد على اتصالها بنا.', fr: 'Les civilisations ne se résument pas à une région : villes et empires se développent en Chine, en Afrique, en Europe et dans les Amériques, ainsi que des sociétés musulmanes dans de nombreuses villes. Existe-t-il des civilisations dans l’espace ? Aucun contact confirmé n’a été découvert.', en: 'Civilizations arose in many places: cities and empires grew in China, Africa, Europe, and the Americas, alongside Islamic societies across many cities. Could civilizations exist in space? No confirmed contact has been found.' },
    academic: { ar: 'يُبنى المسار على المقارنة الإقليمية والتاريخ المتصل، مع وحدات صريحة للصين وأفريقيا وأوروبا والأمريكيتين والعالم الإسلامي، إلى جانب أوقيانوسيا وجنوب آسيا. تُدرس شبكات التجارة والهجرة والترجمة والتنافس، والمؤسسات والبيئة والموارد، من دون تقديم «الحضارة» كسُلّم تفاضلي أو اختزالها في الآثار الملكية. وفي محور الحياة الذكية خارج الأرض، نميز بين سؤال الإمكان العلمي، وبرامج البحث عن الإشارات، والتفسيرات الأثرية المدعومة بالأدلة، وبين ادعاءات الاتصال القديم التي لا تسندها أدلة قابلة للتحقق. التشابه بين مبنيين أو رمزَين وحده لا يثبت اتصالًا عابرًا للكواكب.', fr: 'Le parcours compare les régions et leurs connexions, avec des séquences consacrées à la Chine, à l’Afrique, à l’Europe, aux Amériques et aux sociétés islamiques, ainsi qu’à l’Océanie et à l’Asie du Sud. Échanges, migrations, traductions, institutions, environnements et ressources sont étudiés sans hiérarchiser les peuples ni réduire la civilisation aux monuments royaux. Pour l’intelligence extraterrestre, on distingue la possibilité scientifique, la recherche de signaux, les interprétations archéologiques étayées et les affirmations de contacts anciens sans preuve vérifiable. Une ressemblance entre deux monuments ou symboles ne démontre pas un contact interplanétaire.', en: 'The route compares regions and their connections, with dedicated sequences on China, Africa, Europe, the Americas, and Islamic societies, alongside Oceania and South Asia. Trade, migration, translation, institutions, environments, and resources are studied without ranking peoples or reducing civilization to royal monuments. The question of extraterrestrial intelligence distinguishes scientific possibility, signal searches, evidence-based archaeological interpretation, and unsupported claims of ancient contact. Similarity between structures or symbols alone cannot establish interplanetary contact.' },
    time: [{ ar: 'القرى والمدن الأولى', fr: 'Premiers villages et villes', en: 'Early villages and cities' }, { ar: 'الدول والطرق التجارية', fr: 'États et routes commerciales', en: 'States and trade routes' }, { ar: 'مراكز العلم والفن', fr: 'Centres de savoir et d’art', en: 'Centers of learning and art' }, { ar: 'العالم المترابط', fr: 'Monde interconnecté', en: 'Interconnected world' }],
    timeDates: [{ ar: 'منذ نحو 10 آلاف سنة', fr: 'Depuis env. 10 000 ans', en: 'Since about 10,000 years ago' }, { ar: 'الألفيات 4–1 ق.م.', fr: 'IVe–Ier millénaires av. J.-C.', en: '4th–1st millennia BCE' }, { ar: 'من القرن 7م فصاعدًا', fr: 'À partir du VIIe siècle', en: 'From the 7th century CE onward' }, { ar: 'من القرن 15م إلى اليوم', fr: 'Du XVe siècle à aujourd’hui', en: '15th century to today' }],
    place: [{ ar: 'الصين وجنوب آسيا', fr: 'Chine et Asie du Sud', en: 'China and South Asia' }, { ar: 'أفريقيا وأوروبا', fr: 'Afrique et Europe', en: 'Africa and Europe' }, { ar: 'الأمريكيتان والحضارات الأصلية', fr: 'Amériques et civilisations autochtones', en: 'The Americas and Indigenous civilizations' }, { ar: 'العالم الإسلامي وأوقيانوسيا', fr: 'Monde islamique et Océanie', en: 'Islamic world and Oceania' }, { ar: 'الفضاء: هل نحن وحدنا؟', fr: 'Espace : sommes-nous seuls ?', en: 'Space: are we alone?' }],
    source: { label: { ar: 'اليونسكو: التراث العالمي', fr: 'UNESCO : patrimoine mondial', en: 'UNESCO: World Heritage' }, url: 'https://whc.unesco.org/' },
  },
  {
    id: 'science', icon: 'science', color: '#397eb5',
    title: { ar: 'العلوم والرياضيات والطب', fr: 'Sciences, mathématiques et médecine', en: 'Science, Mathematics & Medicine' },
    summary: { ar: 'الأفكار والتجارب والأدوات التي تشرح الطبيعة؛ من الرياضيات والفيزياء إلى الطب والجسم والميكروبات.', fr: 'Idées, expériences et outils pour comprendre la nature : mathématiques, physique, médecine, corps et microbes.', en: 'Ideas, experiments, and tools for understanding nature: mathematics, physics, medicine, the body, and microbes.' },
    child: { ar: 'العلم طريقة لطرح سؤال ثم جمع أدلة واختبار تفسير. تساعد الرياضيات على وصف الأنماط، وتشرح الفيزياء الحركة والطاقة، ويبحث الطب كيف نحافظ على الصحة.', fr: 'La science pose des questions, recueille des preuves et teste des explications. Les mathématiques décrivent des régularités, la physique étudie mouvement et énergie, et la médecine cherche à protéger la santé.', en: 'Science asks questions, gathers evidence, and tests explanations. Mathematics describes patterns, physics studies motion and energy, and medicine works to protect health.' },
    academic: { ar: 'يربط المسار تاريخ المفاهيم بمناهج التحقق الحديثة. في الرياضيات، تُعرض البراهين بوصفها استدلالًا مضبوطًا؛ وفي الفيزياء، تُفصل النماذج عن القياسات وحدود صلاحيتها. أما الطب فيُقرأ عبر مستويات الجزيء والخلية والجسم والسكان، مع تمييز الارتباط عن السببية، والدليل السريري عن الآلية المقترحة. وستتضمن الرحلات التشريحية والميكروبية نماذج تفاعلية معنونة، مع شرح المقياس والتبسيطات العلمية.', fr: 'Le parcours relie histoire des concepts et méthodes actuelles de validation. En mathématiques, une preuve est un raisonnement rigoureux; en physique, modèles, mesures et domaines de validité sont distingués. La médecine est abordée du niveau moléculaire à celui des populations, en différenciant corrélation et causalité, preuve clinique et mécanisme proposé. Les explorations anatomiques et microbiennes préciseront échelle et simplifications des modèles.', en: 'This route connects conceptual history with current methods of validation. In mathematics, proofs are rigorous arguments; in physics, models, measurements, and domains of validity are distinguished. Medicine is examined from molecular and cellular levels to bodies and populations, separating correlation from causation and clinical evidence from proposed mechanisms. Interactive anatomy and microbial journeys will label scale and scientific simplifications.' },
    time: [{ ar: 'العدّ والهندسة', fr: 'Calcul et géométrie', en: 'Counting and geometry' }, { ar: 'تجارب الطبيعة', fr: 'Expériences sur la nature', en: 'Experiments on nature' }, { ar: 'المختبر والطب الحديث', fr: 'Laboratoire et médecine moderne', en: 'Laboratory and modern medicine' }, { ar: 'علوم البيانات والطب الدقيق', fr: 'Données et médecine de précision', en: 'Data science and precision medicine' }],
    timeDates: [{ ar: 'من العصور القديمة', fr: 'Depuis l’Antiquité', en: 'Since antiquity' }, { ar: 'من القرنين 9–17م', fr: 'Du IXe au XVIIe siècle', en: '9th–17th centuries CE' }, { ar: 'من القرن 19م', fr: 'À partir du XIXe siècle', en: 'From the 19th century' }, { ar: 'القرن 21م', fr: 'XXIe siècle', en: '21st century' }],
    place: [{ ar: 'الفضاء والقياس', fr: 'Espace et mesure', en: 'Space and measurement' }, { ar: 'المادة والطاقة', fr: 'Matière et énergie', en: 'Matter and energy' }, { ar: 'الخلية والجسم', fr: 'Cellule et corps', en: 'Cell and body' }, { ar: 'المجتمع والصحة العامة', fr: 'Société et santé publique', en: 'Society and public health' }],
    source: { label: { ar: 'منظمة الصحة العالمية: الصحة والعلوم', fr: 'OMS : santé et sciences', en: 'WHO: health and science' }, url: 'https://www.who.int/health-topics' },
  },
  {
    id: 'human-history', icon: 'history_edu', color: '#ad5d47',
    title: { ar: 'الإنسان والتاريخ والمجتمعات', fr: 'Humanité, histoire et sociétés', en: 'Humanity, History & Societies' },
    summary: { ar: 'من تطور الإنسان والهجرات إلى نشوء المجتمعات والدول والحروب والتحولات المعاصرة.', fr: 'De l’évolution humaine et des migrations à la formation des sociétés, des États et aux mutations contemporaines.', en: 'From human evolution and migration to societies, states, wars, and contemporary change.' },
    child: { ar: 'تعرف كيف عاش البشر الأوائل، وكيف تنقلت الجماعات، ثم ظهرت القرى والمدن والدول. نستخدم الآثار والرسائل والصور لنفهم الحروب والتغيرات وحياة الناس.', fr: 'Découvrez les premiers humains, leurs migrations, puis l’apparition des villages, villes et États. Les vestiges, lettres et images éclairent les conflits et la vie quotidienne.', en: 'Explore early humans, migrations, and the rise of villages, cities, and states. Evidence helps us understand conflicts and everyday life.' },
    academic: { ar: 'يعامل هذا المسار التاريخ بوصفه بحثًا في التغير والاستمرار وتوزع القوة، لا قائمةً للحكام والمعارك. تُقرأ الحروب مع شروطها المادية والسياسية وتجارب المدنيين، وتُحلل الثورات والأزمات من خلال البنية والفاعلين والنتائج غير المقصودة. وتُقارن المصادر الأولية والسرديات اللاحقة، مع بيان موقع المؤرخ والفجوات التي خلفها الأرشيف، وإدراج التاريخ الاجتماعي والاقتصادي والثقافي إلى جانب التاريخ السياسي.', fr: 'L’histoire est étudiée comme analyse du changement, des continuités et des rapports de pouvoir, et non comme une liste de souverains et de batailles. Guerres, révolutions et crises sont examinées par leurs conditions, acteurs et effets parfois imprévus, y compris l’expérience des civils. Sources primaires et récits ultérieurs sont comparés; position de l’historien et lacunes des archives sont explicitées, avec histoire sociale, économique et culturelle.', en: 'History is treated as inquiry into change, continuity, and power rather than a list of rulers and battles. Wars, revolutions, and crises are examined through their conditions, actors, and unintended outcomes, including civilian experience. Primary sources and later narratives are compared, with attention to historians’ perspectives and archival gaps alongside political, social, economic, and cultural history.' },
    time: [{ ar: 'مجتمعات ما قبل الكتابة', fr: 'Sociétés avant l’écriture', en: 'Pre-literate societies' }, { ar: 'الدول والإمبراطوريات', fr: 'États et empires', en: 'States and empires' }, { ar: 'الثورات والصناعة', fr: 'Révolutions et industrialisation', en: 'Revolutions and industry' }, { ar: 'الحروب والأزمات الراهنة', fr: 'Guerres et crises contemporaines', en: 'Modern wars and crises' }],
    timeDates: [{ ar: 'قبل نحو 3400 ق.م.', fr: 'Avant env. 3400 av. J.-C.', en: 'Before about 3400 BCE' }, { ar: 'الألفيات 3 ق.م.–15م', fr: 'IIIe millénaire av. J.-C.–XVe siècle', en: '3rd millennium BCE–15th century CE' }, { ar: 'من القرن 18م', fr: 'À partir du XVIIIe siècle', en: 'From the 18th century' }, { ar: 'القرنان 20 و21م', fr: 'XXe et XXIe siècles', en: '20th and 21st centuries' }],
    place: [{ ar: 'المجتمعات المحلية', fr: 'Sociétés locales', en: 'Local societies' }, { ar: 'طرق الإمبراطوريات', fr: 'Routes impériales', en: 'Imperial routes' }, { ar: 'مدن الثورة الصناعية', fr: 'Villes industrielles', en: 'Industrial cities' }, { ar: 'شبكات العالم الحديث', fr: 'Réseaux du monde moderne', en: 'Modern world networks' }],
    source: { label: { ar: 'مكتبة الكونغرس: مصادر التاريخ', fr: 'Library of Congress : sources historiques', en: 'Library of Congress: historical sources' }, url: 'https://www.loc.gov/classroom-materials/' },
  },
  {
    id: 'arts', icon: 'auto_stories', color: '#a55283',
    title: { ar: 'الأدب والفكر والفنون', fr: 'Littérature, idées et arts', en: 'Literature, Ideas & Arts' },
    summary: { ar: 'الفلسفة والشعر والسرد والموسيقى والفنون في ثقافات العالم وتفاعلها.', fr: 'Philosophie, poésie, récits, musique et arts dans les cultures du monde et leurs échanges.', en: 'Philosophy, poetry, storytelling, music, and arts across world cultures and exchanges.' },
    child: { ar: 'تحكي القصائد والقصص والأغاني كيف رأى الناس العالم، وتسمح لنا اللوحات والموسيقى باكتشاف أفكار ومشاعر من أزمنة وثقافات مختلفة.', fr: 'Poèmes, récits et chansons montrent comment les gens perçoivent le monde. Peintures et musiques ouvrent une fenêtre sur d’autres époques et cultures.', en: 'Poems, stories, and songs show how people see the world. Paintings and music let us explore ideas and feelings across cultures and times.' },
    academic: { ar: 'يقارن هذا الباب الأشكال الأدبية والفنية ضمن سياقات اللغة والرعاية والمؤسسة والتقنية والتبادل. لا تُعرض الثقافات في خانات مغلقة؛ بل تُتتبع الترجمة والاقتباس والهجرة والتأثير المتبادل، مع إبراز خصوصية التقاليد العربية والأمازيغية والأفريقية والأوروبية والآسيوية وغيرها. ويجمع التحليل بين قراءة الشكل والعمل، وسياق إنتاجه وتلقيه، دون اختزال التعدد الثقافي إلى قائمة «أعلام».', fr: 'Ce domaine compare formes artistiques et littéraires selon les langues, le mécénat, les institutions, les techniques et les échanges. Les cultures ne sont pas cloisonnées : traduction, emprunt, migration et influences réciproques sont suivis, en valorisant les traditions arabes, amazighes, africaines, européennes, asiatiques et autres. L’analyse associe forme, contexte de production et réception.', en: 'This field compares literary and artistic forms through language, patronage, institutions, technology, and exchange. Cultures are not sealed boxes: translation, adaptation, migration, and reciprocal influence are traced, while Arab, Amazigh, African, European, Asian, and other traditions retain their specificity. Analysis connects form with production and reception contexts.' },
    time: [{ ar: 'الحكاية والإنشاد', fr: 'Récit oral et chant', en: 'Oral storytelling and song' }, { ar: 'الكتابة والمدارس الفكرية', fr: 'Écriture et courants de pensée', en: 'Writing and schools of thought' }, { ar: 'الطباعة والمشهد الفني', fr: 'Imprimerie et scènes artistiques', en: 'Print and art movements' }, { ar: 'الفنون الرقمية والتشاركية', fr: 'Arts numériques et participatifs', en: 'Digital and participatory arts' }],
    timeDates: [{ ar: 'من أقدم المجتمعات', fr: 'Des premières sociétés', en: 'From early societies' }, { ar: 'من الألفية 3 ق.م.', fr: 'À partir du IIIe millénaire av. J.-C.', en: 'From the 3rd millennium BCE' }, { ar: 'من القرن 15م', fr: 'À partir du XVe siècle', en: 'From the 15th century' }, { ar: 'القرنان 20 و21م', fr: 'XXe et XXIe siècles', en: '20th and 21st centuries' }],
    place: [{ ar: 'البيت والساحة', fr: 'Maison et place publique', en: 'Home and public square' }, { ar: 'المكتبات والبلاطات', fr: 'Bibliothèques et cours', en: 'Libraries and courts' }, { ar: 'المسارح والمتاحف', fr: 'Théâtres et musées', en: 'Theatres and museums' }, { ar: 'المنصات العالمية', fr: 'Plateformes mondiales', en: 'Global platforms' }],
    source: { label: { ar: 'اليونسكو: تنوع التعبير الثقافي', fr: 'UNESCO : diversité des expressions culturelles', en: 'UNESCO: cultural expressions' }, url: 'https://www.unesco.org/en/diversity-cultural-expressions' },
  },
  {
    id: 'religions', icon: 'temple_buddhist', color: '#92763c',
    title: { ar: 'الأديان وتاريخ الأفكار الدينية', fr: 'Religions et histoire des idées religieuses', en: 'Religions & Religious Thought' },
    summary: { ar: 'تقاليد دينية متعددة، نصوصها وممارساتها وأماكنها المقدسة ضمن سياقات تاريخية وجغرافية.', fr: 'Traditions religieuses diverses, textes, pratiques et lieux sacrés dans leurs contextes historiques et géographiques.', en: 'Religious traditions, texts, practices, and sacred places in historical and geographic context.' },
    child: { ar: 'تختلف أديان العالم في قصصها وكتبها وطقوسها، ويعيش أتباعها بطرق متنوعة. نتعلم عنها باحترام، ونفرّق بين ما يقوله المؤمنون وما يدرسه المؤرخون.', fr: 'Les religions du monde ont des récits, textes et pratiques variés. On les étudie avec respect en distinguant les croyances des fidèles des analyses historiques.', en: 'Religions have varied stories, texts, and practices. We study them respectfully, distinguishing believers’ accounts from historical analysis.' },
    academic: { ar: 'يعتمد المسار مقاربة تاريخية مقارنة، ويفصل بين الوصف الأكاديمي والإيمان الداخلي لكل تقليد. تُدرس النصوص في تاريخ تدوينها وتفسيرها وانتقالها، والأماكن المقدسة عبر الجغرافيا والذاكرة والعمارة والحج. وتُعرض قصص الأنبياء كما ترويها مصادر كل دين، مع احترام الاختلافات العقدية، وتجنب تمثيل الأنبياء بصريًا. أما تاريخ الإسلام فيُتتبع ضمن سياقات المشرق وشمال أفريقيا والأندلس والمغرب، لا كسرد خطي وحيد.', fr: 'L’approche historique comparée distingue description académique et foi vécue. Les textes sont étudiés selon leur transmission, leur rédaction et leurs interprétations; les lieux sacrés, par leur géographie, leur mémoire, leur architecture et les pèlerinages. Les récits prophétiques sont présentés selon les sources de chaque tradition, dans le respect des différences doctrinales, sans représentation visuelle des prophètes. L’histoire de l’islam est replacée dans ses contextes du Proche-Orient, d’Afrique du Nord, d’al-Andalus et du Maroc.', en: 'A comparative historical approach distinguishes academic description from lived faith. Texts are studied through transmission, composition, and interpretation; sacred places through geography, memory, architecture, and pilgrimage. Prophetic narratives follow each tradition’s sources, respect doctrinal differences, and avoid visual depictions of prophets. Islamic history is situated across the Middle East, North Africa, al-Andalus, and Morocco rather than told as one linear account.' },
    time: [{ ar: 'التقاليد الشفوية الأولى', fr: 'Premières traditions orales', en: 'Early oral traditions' }, { ar: 'النصوص والمؤسسات', fr: 'Textes et institutions', en: 'Texts and institutions' }, { ar: 'الانتشار والتفاعل', fr: 'Diffusion et échanges', en: 'Expansion and interaction' }, { ar: 'التنوع الديني اليوم', fr: 'Diversité religieuse actuelle', en: 'Religious diversity today' }],
    timeDates: [{ ar: 'أزمنة وتقاليد متنوعة', fr: 'Époques et traditions diverses', en: 'Diverse periods and traditions' }, { ar: 'الألفيات 1 ق.م.–1م', fr: 'Ier millénaire av. J.-C.–Ier siècle', en: '1st millennium BCE–1st century CE' }, { ar: 'من القرن 7م فصاعدًا', fr: 'À partir du VIIe siècle', en: 'From the 7th century CE onward' }, { ar: 'العصر الحديث إلى اليوم', fr: 'Époque moderne à aujourd’hui', en: 'Modern era to today' }],
    place: [{ ar: 'المشرق', fr: 'Proche-Orient', en: 'Middle East' }, { ar: 'أفريقيا وآسيا', fr: 'Afrique et Asie', en: 'Africa and Asia' }, { ar: 'المغرب والأندلس', fr: 'Maroc et al-Andalus', en: 'Morocco and al-Andalus' }, { ar: 'المجتمعات العالمية', fr: 'Sociétés mondiales', en: 'Global communities' }],
    source: { label: { ar: 'موسوعة الدين: جامعة هارفارد', fr: 'Encyclopédie de la religion : Harvard', en: 'Harvard: Religion encyclopedia' }, url: 'https://rpl.hds.harvard.edu/what-we-do/our-approach/core-research-areas/religious-literacy' },
  },
  {
    id: 'technology', icon: 'memory', color: '#3c8494',
    title: { ar: 'التكنولوجيا وأثرها', fr: 'Technologie et société', en: 'Technology & Its Impact' },
    summary: { ar: 'من الأدوات والكتابة إلى الحوسبة والذكاء الاصطناعي، مع آثار التقنية الاجتماعية والبيئية.', fr: 'Des outils et de l’écriture au calcul et à l’IA, avec leurs effets sociaux et environnementaux.', en: 'From tools and writing to computing and AI, including social and environmental effects.' },
    child: { ar: 'التكنولوجيا أدوات وأفكار يصنعها الناس لحل مشكلات. قد تجعل العمل أسهل، لكنها قد تغيّر الوظائف والخصوصية والبيئة؛ لذلك نسأل دائمًا: من يستفيد؟', fr: 'La technologie rassemble des outils et des idées conçus pour résoudre des problèmes. Elle peut faciliter le travail mais aussi transformer emplois, vie privée et environnement : qui en bénéficie ?', en: 'Technology combines tools and ideas people make to solve problems. It can help, but also change jobs, privacy, and environments; we should ask who benefits.' },
    academic: { ar: 'يُدرس التطور التقني ضمن منظومات تجمع المعرفة والطاقة والمواد والعمل والمؤسسات، لا بوصفه سلسلة اختراعات منفصلة. يوازن التحليل بين المنفعة والكلفة والتوزيع: من يصل إلى التقنية، ومن يتحمل آثارها؟ وفي الذكاء الاصطناعي تُفصل قدرات النظام عن ادعاءات الوعي، وتُناقش البيانات والتحيز والموثوقية والحقوق وسياقات الاستخدام. وتربط الخريطة التقنية بالموارد وسلاسل الإمداد والانبعاثات والبنية التحتية.', fr: 'L’évolution technique est étudiée comme un système associant savoir, énergie, matériaux, travail et institutions, non comme une suite d’inventions isolées. L’analyse met en balance bénéfices, coûts et répartition : qui accède aux technologies et qui en supporte les effets ? Pour l’IA, capacités observables et affirmations de conscience sont distinguées; données, biais, fiabilité, droits et usages sont examinés avec ressources, chaînes d’approvisionnement, émissions et infrastructures.', en: 'Technology is studied as a system of knowledge, energy, materials, labor, and institutions rather than a string of isolated inventions. Analysis weighs benefits, costs, and distribution: who gets access and who bears consequences? For AI, system capabilities are separated from claims of consciousness, while data, bias, reliability, rights, and use contexts are examined alongside resources, supply chains, emissions, and infrastructure.' },
    time: [{ ar: 'الأدوات والنار', fr: 'Outils et feu', en: 'Tools and fire' }, { ar: 'الزراعة والكتابة', fr: 'Agriculture et écriture', en: 'Farming and writing' }, { ar: 'الآلة والكهرباء', fr: 'Machines et électricité', en: 'Machines and electricity' }, { ar: 'الشبكات والذكاء الاصطناعي', fr: 'Réseaux et intelligence artificielle', en: 'Networks and artificial intelligence' }],
    timeDates: [{ ar: 'منذ أكثر من مليوني سنة', fr: 'Depuis plus de 2 millions d’années', en: 'Over 2 million years ago' }, { ar: 'منذ نحو 10 آلاف سنة', fr: 'Depuis env. 10 000 ans', en: 'Since about 10,000 years ago' }, { ar: 'من القرن 18م', fr: 'À partir du XVIIIe siècle', en: 'From the 18th century' }, { ar: 'القرن 21م', fr: 'XXIe siècle', en: '21st century' }],
    place: [{ ar: 'المنزل والورشة', fr: 'Maison et atelier', en: 'Home and workshop' }, { ar: 'المدينة والمصنع', fr: 'Ville et usine', en: 'City and factory' }, { ar: 'المختبر ومركز البيانات', fr: 'Laboratoire et centre de données', en: 'Lab and data center' }, { ar: 'الشبكة العالمية', fr: 'Réseau mondial', en: 'Global network' }],
    source: { label: { ar: 'اليونسكو: أخلاقيات الذكاء الاصطناعي', fr: 'UNESCO : éthique de l’IA', en: 'UNESCO: AI ethics' }, url: 'https://www.unesco.org/en/artificial-intelligence/recommendation-ethics' },
  },
  {
    id: 'future', icon: 'rocket_launch', color: '#6056a4',
    title: { ar: 'عالم الغد والسيناريوهات', fr: 'Monde de demain et scénarios', en: 'Tomorrow & Scenarios' },
    summary: { ar: 'استشراف قائم على الأدلة والاحتمالات: المناخ والمدن والصحة والطاقة والفضاء.', fr: 'Prospective fondée sur les preuves et les probabilités : climat, villes, santé, énergie et espace.', en: 'Evidence-based futures: climate, cities, health, energy, and space.' },
    child: { ar: 'لا يعرف أحد المستقبل بدقة، لكننا نستطيع تخيل احتمالات مختلفة وبناء قرارات أفضل. تساعدنا السيناريوهات على السؤال: ماذا يحدث إذا اخترنا طريقًا دون غيره؟', fr: 'Personne ne connaît exactement l’avenir, mais plusieurs futurs sont possibles. Les scénarios aident à demander ce qui pourrait arriver selon nos choix.', en: 'No one knows the future exactly, but several futures are possible. Scenarios help us ask what might happen under different choices.' },
    academic: { ar: 'يُفصل الاستشراف عن التنبؤ الحتمي. السيناريو أداة متماسكة لاستكشاف مسارات مشروطة، لا ادعاء بمعرفة ما سيقع. يُجمع بين اتجاهات قابلة للقياس، ومحركات عدم اليقين، ونماذج ذات حدود معلنة؛ وتُقارن السيناريوهات مع مؤشرات الرصد التي يمكن أن تدعمها أو تضعفها. يشمل المسار انتقال الطاقة والتكيف المناخي والمدن والصحة والحوكمة الرقمية واستكشاف الفضاء، ويعرض العدالة بين الأجيال والتفاوت بين المناطق ضمن كل خيار.', fr: 'La prospective est distinguée de la prédiction déterministe. Un scénario explore un chemin cohérent sous conditions; il ne prétend pas annoncer l’avenir. Tendances mesurables, incertitudes et limites des modèles sont articulées, puis comparées à des indicateurs susceptibles de renforcer ou d’affaiblir chaque scénario. Énergie, adaptation climatique, villes, santé, gouvernance numérique et exploration spatiale sont abordées avec les enjeux d’équité entre générations et régions.', en: 'Foresight is distinguished from deterministic prediction. A scenario explores a coherent conditional pathway; it does not claim to know the future. Measurable trends, uncertainties, and model limits are combined, then compared with indicators that could support or weaken each scenario. Energy transitions, climate adaptation, cities, health, digital governance, and space exploration are considered alongside equity across generations and regions.' },
    time: [{ ar: 'اتجاهات مرصودة', fr: 'Tendances observées', en: 'Observed trends' }, { ar: 'اختيارات هذا العقد', fr: 'Choix de la décennie', en: 'Choices of this decade' }, { ar: 'سيناريوهات منتصف القرن', fr: 'Scénarios à mi-siècle', en: 'Mid-century scenarios' }, { ar: 'آفاق بعيدة غير يقينية', fr: 'Horizons lointains incertains', en: 'Distant uncertain horizons' }],
    timeDates: [{ ar: 'البيانات الحالية', fr: 'Données actuelles', en: 'Current evidence' }, { ar: 'حتى 2030', fr: 'Jusqu’en 2030', en: 'Through 2030' }, { ar: 'نحو 2050', fr: 'Vers 2050', en: 'Around 2050' }, { ar: 'ما بعد 2100: احتمالات', fr: 'Après 2100 : possibilités', en: 'After 2100: possibilities' }],
    place: [{ ar: 'الأحياء والمدن', fr: 'Quartiers et villes', en: 'Neighborhoods and cities' }, { ar: 'الأقاليم والبلدان', fr: 'Régions et pays', en: 'Regions and countries' }, { ar: 'الأرض كنظام مشترك', fr: 'Terre, système partagé', en: 'Earth as a shared system' }, { ar: 'البيئة الكوكبية والفضاء', fr: 'Environnement planétaire et espace', en: 'Planetary environment and space' }],
    source: { label: { ar: 'الهيئة الحكومية الدولية المعنية بتغير المناخ', fr: 'GIEC : rapports d’évaluation', en: 'IPCC: assessment reports' }, url: 'https://www.ipcc.ch/reports/' },
  },
]

const DOMAIN_IMAGES: Record<string, { academic: string; child: string }> = {
  space: { academic: 'space-observatory.jpg', child: 'atlas-space-kids.jpg' },
  earth: { academic: 'earth-orbit.jpg', child: 'atlas-earth-kids.jpg' },
  'human-history': { academic: 'human-origins.jpg', child: 'atlas-human-history-kids.jpg' },
  life: { academic: 'biodiversity.jpg', child: 'atlas-life-kids.jpg' },
  civilizations: { academic: 'civilizations-ruins.jpg', child: 'atlas-civilizations-kids.jpg' },
  science: { academic: 'science-lab.jpg', child: 'atlas-science-kids.jpg' },
  arts: { academic: 'literature-library.jpg', child: 'atlas-arts-kids.jpg' },
  religions: { academic: 'sacred-architecture.jpg', child: 'atlas-religions-kids.jpg' },
  technology: { academic: 'artificial-intelligence.jpg', child: 'atlas-technology-kids.jpg' },
  future: { academic: 'renewable-energy.jpg', child: 'world-future-kids.jpg' },
}

const AXES = {
  time: { ar: 'المسار الزمني', fr: 'Parcours temporel', en: 'Time journey' },
  place: { ar: 'المسار المكاني', fr: 'Parcours spatial', en: 'Space journey' },
}

const ATLAS_TREASURES: Record<string, { child: Localized; academic: Localized }> = {
  space: { child: { ar: 'ضوء الشمس يحتاج نحو 8 دقائق و20 ثانية ليصل إلى الأرض؛ لذلك نرى الشمس كما كانت قبل دقائق.', fr: 'La lumière du Soleil met environ 8 minutes et 20 secondes à nous parvenir : nous le voyons donc tel qu’il était quelques minutes plus tôt.', en: 'Sunlight takes about 8 minutes and 20 seconds to reach Earth, so we see the Sun as it was minutes ago.' }, academic: { ar: 'المسافة الفلكية تجعل الرصد نافذةً إلى الماضي: زمن وصول الضوء جزء من تفسير الصور والقياسات الكونية.', fr: 'La distance astronomique fait de l’observation une fenêtre sur le passé : le temps de propagation de la lumière compte dans l’interprétation des mesures.', en: 'Astronomical distance makes observation a view into the past: light travel time matters when interpreting measurements.' } },
  earth: { child: { ar: 'تتحرك الصفائح الأرضية ببطء يقارب نمو الأظافر، لكن تراكم الحركة عبر ملايين السنين يصنع محيطات وجبالًا.', fr: 'Les plaques avancent à peu près à la vitesse de pousse des ongles; sur des millions d’années, ce lent mouvement façonne océans et montagnes.', en: 'Tectonic plates move about as fast as fingernails grow, yet millions of years of motion reshape oceans and mountains.' }, academic: { ar: 'تقاس حركة الصفائح بالسنتيمترات سنويًا، وتختلف السرعة والاتجاه من صفيحة إلى أخرى؛ وتُختبر القياسات اليوم بأدوات تحديد المواقع.', fr: 'Les plaques se déplacent de quelques centimètres par an, à des vitesses et directions différentes, mesurées notamment par géodésie satellitaire.', en: 'Plate motion is measured in centimeters per year, with different speeds and directions; satellite geodesy helps quantify it.' } },
  life: { child: { ar: 'الطيور التي نراها اليوم هي فرع حي من الديناصورات؛ فالأحفوريات تكشف صلاتها بأقاربها القدماء.', fr: 'Les oiseaux d’aujourd’hui sont une branche vivante des dinosaures; les fossiles révèlent leurs liens avec leurs anciens parents.', en: 'Today’s birds are a living branch of dinosaurs; fossils reveal their links to ancient relatives.' }, academic: { ar: 'تدعم الصفات التشريحية والسجل الأحفوري إدراج الطيور ضمن الديناصورات الثيروبودية، مع بقاء معظم السلالات غير الطيرية منقرضة.', fr: 'Les caractères anatomiques et les fossiles situent les oiseaux parmi les dinosaures théropodes; les lignées non aviennes ont, elles, disparu.', en: 'Anatomical traits and fossils place birds within theropod dinosaurs; the non-avian lineages went extinct.' } },
  'human-history': { child: { ar: 'أقدم حفريات معروفة للإنسان العاقل عُثر عليها في المغرب، ويعود عمرها إلى نحو 300 ألف سنة.', fr: 'Les plus anciens fossiles connus d’Homo sapiens ont été découverts au Maroc et datent d’environ 300 000 ans.', en: 'Some of the oldest known Homo sapiens fossils were found in Morocco and date to about 300,000 years ago.' }, academic: { ar: 'تُظهر حفريات جبل إيغود أن نشأة الإنسان العاقل كانت أفريقية واسعة جغرافيًا، ولا تختزل في نقطة واحدة أو هجرة منفردة.', fr: 'Les fossiles de Jebel Irhoud éclairent une émergence africaine géographiquement étendue, plutôt qu’un point unique ou une migration isolée.', en: 'Jebel Irhoud fossils support a geographically widespread African emergence, rather than a single point or isolated migration.' } },
  civilizations: { child: { ar: 'المدن القديمة لم تعش منعزلة: سافرت السلع والحكايات والاختراعات معها عبر الطرق والبحار.', fr: 'Les villes anciennes n’étaient pas isolées : marchandises, récits et techniques circulaient par les routes et les mers.', en: 'Ancient cities were connected: goods, stories, and technologies traveled along roads and seas.' }, academic: { ar: 'تُفهم الحضارات عبر شبكات الاتصال والتبادل والاقتباس، إلى جانب المؤسسات والبيئات المحلية؛ فالتشابه وحده لا يثبت اتصالًا مباشرًا.', fr: 'Les civilisations se comprennent aussi par les réseaux d’échange et d’emprunt, en plus des institutions et milieux locaux; la ressemblance seule ne prouve pas un contact direct.', en: 'Civilizations are shaped by exchange networks as well as local institutions and environments; resemblance alone does not prove direct contact.' } },
  science: { child: { ar: 'العلم لا يبدأ دائمًا بإجابة؛ أحيانًا يبدأ بملاحظة صغيرة وسؤال جيد وتجربة يمكن تكرارها.', fr: 'La science ne commence pas toujours par une réponse : parfois, une observation, une bonne question et une expérience reproductible ouvrent la voie.', en: 'Science does not always begin with an answer; a small observation, a good question, and a repeatable test can start the journey.' }, academic: { ar: 'قوة التفسير العلمي تأتي من توافق الأدلة، ووضوح المنهج، وإمكان إعادة الفحص؛ والنموذج يظل قابلًا للتعديل مع بيانات جديدة.', fr: 'La solidité d’une explication dépend de la convergence des preuves, de méthodes explicites et de la possibilité de réexamen; un modèle évolue avec les données.', en: 'Scientific explanations gain strength from converging evidence, explicit methods, and reproducibility; models remain open to revision.' } },
  arts: { child: { ar: 'يمكن للحكاية واللحن والصورة أن تحفظ ذاكرة مجتمع، وأن تنقلها إلى أناس لم يعيشوا زمنها.', fr: 'Un récit, une mélodie ou une image peut conserver la mémoire d’une société et la transmettre à ceux qui n’ont pas vécu son époque.', en: 'A story, melody, or image can preserve a society’s memory and share it with people from another time.' }, academic: { ar: 'يُقرأ العمل الأدبي والفني ضمن لغته وشروط إنتاجه وجمهوره، مع الانتباه إلى اختلاف التأويل بين الأزمنة والثقافات.', fr: 'Une œuvre se lit dans sa langue, ses conditions de production et son public, en tenant compte des interprétations changeantes selon les époques et cultures.', en: 'Literary and artistic works are read through language, production, and audience, while recognizing interpretations shift across eras and cultures.' } },
  religions: { child: { ar: 'تساعد الخرائط والخطوط الزمنية على فهم كيف انتقلت الأفكار الدينية بين المجتمعات، مع احترام اختلاف المعتقدات.', fr: 'Cartes et frises aident à comprendre la circulation des idées religieuses entre sociétés, dans le respect des croyances diverses.', en: 'Maps and timelines help explain how religious ideas traveled among societies while respecting different beliefs.' }, academic: { ar: 'تاريخ الأديان مجال مقارن يميز بين النصوص والممارسات والمؤسسات والسياقات، وبين الوصف التاريخي والإيمان الذي يعيشه أتباع كل دين.', fr: 'L’histoire comparée des religions distingue textes, pratiques, institutions et contextes, ainsi que la description historique de la foi vécue.', en: 'Comparative religious history distinguishes texts, practices, institutions, and contexts, as well as historical description from lived faith.' } },
  technology: { child: { ar: 'كل تقنية جديدة تغيّر طريقة إنجاز مهمة، لكنها تفتح أيضًا أسئلة عن الأمان والإنصاف وأثرها في الناس.', fr: 'Chaque technologie transforme une tâche, mais soulève aussi des questions de sécurité, d’équité et d’effets sur les personnes.', en: 'Every new technology changes how a task is done and raises questions about safety, fairness, and its effects on people.' }, academic: { ar: 'تُحلل التقنية كنظام اجتماعي ومادي يشمل التصميم والطاقة والبيانات والعمل والتنظيم، لا كأداة منفصلة عن آثارها.', fr: 'La technologie s’analyse comme un système social et matériel — conception, énergie, données, travail et gouvernance — et non comme un outil isolé.', en: 'Technology is analyzed as a social and material system of design, energy, data, labor, and governance, not as an isolated tool.' } },
  future: { child: { ar: 'المستقبل ليس صورة واحدة جاهزة؛ نستكشف احتمالات متعددة ونسأل كيف تؤثر اختياراتنا اليوم.', fr: 'L’avenir n’est pas une image unique déjà écrite : on explore plusieurs possibilités et l’effet de nos choix présents.', en: 'The future is not one fixed picture; we explore possibilities and ask how today’s choices shape them.' }, academic: { ar: 'السيناريو أداة شرطية لاستكشاف نتائج ممكنة، وليس تنبؤًا مؤكدًا؛ تُراجع افتراضاته بمؤشرات وأدلة جديدة.', fr: 'Un scénario explore des conséquences possibles sous certaines conditions; ce n’est pas une prédiction certaine et ses hypothèses se réévaluent.', en: 'A scenario explores possible outcomes under stated conditions; it is not a firm prediction, and its assumptions can be reassessed.' } },
}

function AtlasJourney({ lang, domain, axis, academic }: { lang: Lang; domain: AtlasDomain; axis: 'time' | 'place'; academic: boolean }) {
  const steps = domain[axis]
  const [active, setActive] = useState(0)
  useEffect(() => setActive(0), [domain.id, axis])
  const axisTitle = AXES[axis][lang]
  return (
    <section className="atlas-journey" aria-label={axisTitle}>
      <div className={`atlas-route-visual ${axis}`}>
        <div className="atlas-route-heading">
          <span className="material-symbols-rounded">{axis === 'time' ? 'timeline' : 'travel_explore'}</span>
          <div><small>{axisTitle}</small><h3>{domain.title[lang]}</h3></div>
          <span className="atlas-route-counter">{String(active + 1).padStart(2, '0')} / {steps.length}</span>
        </div>
        <div className="atlas-route-track" role="tablist" aria-label={axisTitle}>
          {steps.map((step, i) => (
            <button key={i} role="tab" aria-selected={active === i} className={`atlas-route-stop ${active === i ? 'active' : ''}`} onClick={() => { setActive(i); sound.click() }}>
              <span className="atlas-route-node"><span>{axis === 'time' ? ['◷', '◴', '◵', '◶', '◷'][i % 5] : ['◎', '◉', '◌', '◍', '✦'][i % 5]}</span></span>
              <span className="atlas-route-label">{axis === 'time' && <small className="atlas-route-date">{domain.timeDates[i]?.[lang]}</small>}<span>{step[lang]}</span></span>
            </button>
          ))}
        </div>
        <div className="atlas-route-caption" key={`${domain.id}-${axis}-${active}`}>
          <span className="atlas-route-index">{axis === 'time' ? domain.timeDates[active]?.[lang] : (lang === 'ar' ? 'مستوى مكاني' : lang === 'fr' ? 'Échelle spatiale' : 'Spatial scale')}</span>
          <strong>{steps[active][lang]}</strong>
          <p>{axis === 'time' ? (lang === 'ar' ? 'تتبّع ترتيب المحطات لمقارنة التحولات عبر الزمن؛ التواريخ تقريبية حين يعتمد العلم على تقديرات.' : lang === 'fr' ? 'Suivez l’ordre des étapes pour comparer les transformations; les dates sont approximatives lorsque les sciences reposent sur des estimations.' : 'Follow the sequence to compare change through time; dates are approximate where science relies on estimates.') : (lang === 'ar' ? 'انتقل بين المستويات المكانية؛ كل محطة تكشف زاوية مختلفة لفهم هذا المجال.' : lang === 'fr' ? 'Passez d’une échelle spatiale à l’autre : chaque étape apporte un angle différent.' : 'Move between spatial scales; each stop offers a different perspective on this field.')}</p>
        </div>
      </div>
      <div className={`atlas-reading ${academic ? 'academic' : 'child'}`}>
        <div className="atlas-reading-heading"><span className="material-symbols-rounded">{academic ? 'school' : 'explore'}</span><div><small>{academic ? (lang === 'ar' ? 'قراءة أكاديمية' : lang === 'fr' ? 'Lecture académique' : 'Academic reading') : (lang === 'ar' ? 'اكتشف الفكرة' : lang === 'fr' ? 'Comprendre simplement' : 'Explore the idea')}</small><h3>{steps[active][lang]}</h3></div></div>
        <p>{academic ? domain.academic[lang] : domain.child[lang]}</p>
        <div className="atlas-source"><span>{lang === 'ar' ? 'مصدر للاستكشاف' : lang === 'fr' ? 'Pour approfondir' : 'Explore a source'}</span><a href={domain.source.url} target="_blank" rel="noreferrer">{domain.source.label[lang]} ↗</a></div>
      </div>
      <details className={`atlas-treasure ${academic ? 'academic' : 'child'}`}>
        <summary><span className="material-symbols-rounded">auto_awesome</span><span><small>{lang === 'ar' ? 'كنز معرفي' : lang === 'fr' ? 'Le saviez-vous ?' : 'A knowledge gem'}</small><strong>{lang === 'ar' ? 'افتح نافذة اكتشاف' : lang === 'fr' ? 'Ouvrir la découverte' : 'Reveal an insight'}</strong></span><span className="material-symbols-rounded atlas-treasure-chevron">expand_more</span></summary>
        <p>{ATLAS_TREASURES[domain.id][academic ? 'academic' : 'child'][lang]}</p>
      </details>
    </section>
  )
}

export default function Atlas({ lang, audience = 'academic', articles = [], initialDomain, initialAxis = 'time', initialQuery = '', compact = false, collectionLoading = false, collectionError = false, onRetry }: { lang: Lang; level?: Level; audience?: 'kids' | 'academic'; articles?: Article[]; initialDomain?: string; initialAxis?: 'time' | 'place'; initialQuery?: string; compact?: boolean; collectionLoading?: boolean; collectionError?: boolean; onRetry?: () => void }) {
  const featureRef = useRef<HTMLDivElement>(null)
  const journeyRef = useRef<HTMLDivElement>(null)
  const branchOpen = Boolean(initialDomain) || compact
  const [selectedId, setSelectedId] = useState(initialDomain === 'human' || initialDomain === 'history' ? 'human-history' : initialDomain ?? 'space')
  const [axis, setAxis] = useState<'time' | 'place'>(initialAxis)
  const academic = audience === 'academic'
  const [showCivilizations, setShowCivilizations] = useState(false)
  const [articleQuery, setArticleQuery] = useState(initialQuery)
  const [articleLimit, setArticleLimit] = useState(24)
  useEffect(() => setAxis(initialAxis), [initialAxis])
  useEffect(() => { if (initialDomain) { const normalized = initialDomain === 'human' || initialDomain === 'history' ? 'human-history' : initialDomain; if (DOMAINS.some((domain) => domain.id === normalized)) setSelectedId(normalized) } }, [initialDomain])
  useEffect(() => { setArticleQuery(initialQuery) }, [initialQuery])
  useEffect(() => setArticleLimit(24), [selectedId, lang, articleQuery])
  const selected = DOMAINS.find((domain) => domain.id === selectedId) ?? DOMAINS[0]
  const topicArticles = useMemo(() => articles
    .filter((article) => article.content[lang]?.title)
    .filter((article) => domainForArticle(article) === selected.id)
    .filter((article) => !articleQuery.trim() || normalizeAtlas(`${article.content[lang].title} ${article.content[lang].summary} ${article.cat[lang]}`).includes(normalizeAtlas(articleQuery.trim())))
    .sort((a, b) => a.content[lang].title.localeCompare(b.content[lang].title, lang)), [articles, lang, selected.id, articleQuery])
  const labels = {
    eyebrow: { ar: 'أطلس المعرفة التفاعلي', fr: 'Atlas interactif des savoirs', en: 'Interactive Knowledge Atlas' },
    heading: { ar: 'رحلتان لاستكشاف العالم', fr: 'Deux parcours pour explorer le monde', en: 'Two journeys through knowledge' },
    intro: { ar: 'اختر بابًا، ثم تنقّل عبر الزمن من بدايات الكون إلى احتمالات الغد، أو عبر المكان من الفضاء إلى الأرض ومجتمعاتها.', fr: 'Choisissez un domaine, puis voyagez du début de l’Univers vers les futurs possibles, ou de l’espace vers la Terre et ses sociétés.', en: 'Choose a field, then travel through time from the early Universe toward possible futures, or through space from the cosmos to Earth and its societies.' },
    child: { ar: 'المستكشف الصغير', fr: 'Petit explorateur', en: 'Young Explorer' },
    adult: { ar: 'الرحالة الكبير', fr: 'Grand voyageur', en: 'Great Voyager' },
    map: { ar: 'افتح خريطة الحضارات التفاعلية', fr: 'Ouvrir la carte interactive des civilisations', en: 'Open the interactive civilizations map' },
    sourceNote: { ar: 'مصادر مختارة في أسفل الأطلس', fr: 'Sources sélectionnées en bas de l’atlas', en: 'Selected sources at the bottom of the atlas' },
  }
  return (
    <div className="page-wide atlas atlas-hub">
      <header className="atlas-hero">
        <div className="atlas-hero-copy"><h1>{(branchOpen ? selected.title[lang] : journeyName(academic?'school':'kids',lang))}</h1><p>{branchOpen ? selected.summary[lang] : labels.intro[lang]}</p></div>
        <div className="atlas-hero-orbit" aria-hidden="true"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><span className="orbit-core"><span className="material-symbols-rounded">travel_explore</span></span><i/><b/></div>
      </header>
      <div className="atlas-mode-bar">{branchOpen&&<strong className="journey-path-name">{journeyName(academic?'school':'kids',lang)}</strong>}
        <div className="atlas-axis-toggle" role="tablist" aria-label={lang === 'ar' ? 'نوع الرحلة' : lang === 'fr' ? 'Type de parcours' : 'Journey type'}>
          {(['time', 'place'] as const).map((key) => <button key={key} className={axis === key ? 'active' : ''} role="tab" aria-selected={axis === key} onClick={() => { setAxis(key); if (!compact) window.location.hash = initialDomain ? `#/explorer/${academic ? 'academic' : 'kids'}/${selected.id}/${key}` : `#/journey/${key}`; scrollToDetail(() => journeyRef.current) }}><span className="material-symbols-rounded">{key === 'time' ? 'timeline' : 'public'}</span>{AXES[key][lang]}</button>)}
        </div>
      </div>
      {!compact && !branchOpen && <section className="atlas-domains" aria-label={labels.eyebrow[lang]}>
        {DOMAINS.map((domain) => <button key={domain.id} className={`atlas-domain-card ${selected.id === domain.id ? 'selected' : ''}`} style={{ '--domain-color': domain.color } as React.CSSProperties} onClick={() => { window.location.hash = `#/explorer/${academic ? 'academic' : 'kids'}/${domain.id}/${axis}`; sound.pop() }} aria-pressed={selected.id === domain.id}>
          <span className="atlas-domain-image"><img src={publicUrl(`assets/img/${DOMAIN_IMAGES[domain.id][academic ? 'academic' : 'child']}`)} alt="" loading="lazy" decoding="async"/><span className="atlas-domain-icon material-symbols-rounded">{domain.icon}</span><span className="atlas-domain-check material-symbols-rounded" aria-hidden="true">{selected.id === domain.id ? 'check_circle' : ''}</span></span><span className="atlas-domain-copy"><strong>{domain.title[lang]}</strong><small>{domain.summary[lang]}</small></span>
        </button>)}
      </section>}
      {!compact && !branchOpen && <JourneyHistoryPortals lang={lang} level={academic ? 'school' : 'kids'} />}
      {branchOpen && <>
      <div className={`atlas-feature ${branchOpen ? 'atlas-feature-expanded' : ''}`} data-domain={selected.id} ref={featureRef} tabIndex={-1} style={{ '--domain-color': selected.color } as React.CSSProperties}>
        {branchOpen && <><button type="button" className="ghost-btn atlas-back" onClick={() => { window.location.hash = '#/journey' }}>{lang === 'ar' ? 'العودة إلى جميع الفروع' : lang === 'fr' ? 'Tous les domaines' : 'All branches'}</button></>}
        <div className="atlas-feature-top"><span className="atlas-feature-icon material-symbols-rounded">{selected.icon}</span><div><span>{axis === 'time' ? AXES.time[lang] : AXES.place[lang]}</span><h2>{selected.title[lang]}</h2><p>{selected.summary[lang]}</p></div></div>
        {!academic && <TopicExperience lang={lang} title={selected.title[lang]} explanation={selected.child[lang]} subject={selected.id}/>}
        {!['space','earth'].includes(selected.id) && <BranchDiscovery id={selected.id} lang={lang} academic={academic} title={selected.title} child={selected.child} adult={selected.academic}/>}
        {selected.id === 'space' && (<>
          {academic ? <CosmosExplorer lang={lang}/> : <SpaceDiscovery lang={lang} academic={false}/>}
          <section id="stellar-lab" className="frontier-lab"><h2>{lang==='ar'?'دورة حياة النجوم':lang==='fr'?'Cycle de vie des étoiles':'Stellar life cycle'}</h2><Suspense fallback={<p>{lang==='ar'?'جار تحميل مختبر النجوم…':lang==='fr'?'Chargement du laboratoire stellaire…':'Loading the stellar lab…'}</p>}><StellarLifecycle lang={lang} level={academic?'school':'kids'}/></Suspense></section>
          {false && <a className="atlas-cosmos-link" href="#/cosmos"><span className="mi">view_in_ar</span>{lang === 'ar' ? 'استكشف المجسم ثلاثي الأبعاد للكون' : lang === 'fr' ? 'Explorer le cosmos en 3D' : 'Explore the 3D cosmos'}</a>}
        </>)}
        {selected.id === 'earth' && <EarthDiscovery lang={lang} academic={academic}/>}
        <div ref={journeyRef} className="atlas-journey-target" tabIndex={-1}><AtlasJourney key={`${selected.id}-${axis}-${academic}`} lang={lang} domain={selected} axis={axis} academic={academic}/></div>
        {selected.id === 'civilizations' && <div className="atlas-civilizations-toggle"><button className="ghost-btn" onClick={() => { setShowCivilizations((value) => !value); if (!showCivilizations) awardBadge('timeTraveler') }}><span className="material-symbols-rounded">map</span>{showCivilizations ? (lang === 'ar' ? 'أخفِ خريطة الحضارات' : lang === 'fr' ? 'Masquer la carte des civilisations' : 'Hide civilization map') : labels.map[lang]}</button></div>}
      </div>
      {(['space','earth','life','science','technology'].includes(selected.id)) && (academic ? <AcademicTopics domain={selected.id} lang={lang}/> : <ScientificGallery key={selected.id} lang={lang} level={academic ? 'academic' : 'kids'} domains={({space:['space'],earth:['earth'],life:['life'],science:['chemistry','physics'],technology:['tech']} as Record<string, Domain[]>)[selected.id]}/> )}
      <section className="atlas-article-library" aria-label={selected.title[lang]}>
        <header className="atlas-article-head"><div><span className="atlas-eyebrow dark"><span className="material-symbols-rounded">auto_stories</span>{lang === 'ar' ? 'مكتبة هذا الفرع' : lang === 'fr' ? 'Bibliothèque de ce domaine' : 'Articles in this field'}</span><h2>{selected.title[lang]}</h2><p>{lang === 'ar' ? `تُعرض المقالات المطابقة لهذا الموضوع فقط · ${topicArticles.length} مقالًا` : lang === 'fr' ? `${topicArticles.length} articles associés à ce domaine` : `${topicArticles.length} articles matched to this field`}</p></div><label className="atlas-article-search"><Mi name="search"/><input type="search" value={articleQuery} onChange={(e) => setArticleQuery(e.target.value)} placeholder={lang === 'ar' ? 'ابحث داخل هذا الفرع' : lang === 'fr' ? 'Rechercher dans ce domaine' : 'Search this field'} /></label></header>
        {collectionLoading && <p className="collection-status" role="status">{lang === 'ar' ? 'جارٍ جلب المقالات وتصنيفها ضمن هذا الفرع…' : lang === 'fr' ? 'Chargement et classement des articles de ce domaine…' : 'Loading and organizing articles for this field…'}</p>}
        {collectionError && <p className="collection-status" role="alert">{lang === 'ar' ? 'تعذر جلب بقية المكتبة. المقالات المحلية ما زالت متاحة.' : lang === 'fr' ? 'Impossible de charger toute la bibliothèque. Les articles locaux restent disponibles.' : 'The full library could not be loaded. Local articles are still available.'} {onRetry && <button className="text-link" onClick={onRetry}>{lang === 'ar' ? 'أعد المحاولة' : lang === 'fr' ? 'Réessayer' : 'Retry'}</button>}</p>}
        {topicArticles.length === 0 ? <p className="empty">{lang === 'ar' ? 'لا توجد مقالات مطابقة لهذا الفرع باللغة المختارة حتى الآن.' : lang === 'fr' ? 'Aucun article correspondant dans la langue choisie pour le moment.' : 'No articles in this field are available in the selected language yet.'}</p> : <div className="cards atlas-article-cards">{topicArticles.slice(0, articleLimit).map((article) => <AtlasArticleCard key={article.id} article={article} lang={lang} level={academic ? 'school' : 'kids'} audience={academic ? 'academic' : 'kids'}/>)}</div>}
        {topicArticles.length > articleLimit && <button className="ghost-btn small load-more" onClick={() => setArticleLimit((limit) => limit + 24)}>{lang === 'ar' ? 'عرض ٢٤ مقالًا إضافيًا' : lang === 'fr' ? 'Afficher 24 articles de plus' : 'Show 24 more articles'} <Mi name="expand_more"/></button>}
      </section>
      {selected.id === 'civilizations' && showCivilizations && <div className="atlas-civilization-map"><CivilizationsTimeline lang={lang}/></div>}
      <footer className="atlas-sources"><h2>{lang === 'ar' ? 'مصادر موثوقة لمتابعة الاستكشاف' : lang === 'fr' ? 'Sources fiables pour poursuivre' : 'Trusted sources to explore further'}</h2><p>{labels.sourceNote[lang]}</p><div><a href={selected.source.url} target="_blank" rel="noreferrer"><span className="material-symbols-rounded">{selected.icon}</span><span><small>{selected.title[lang]}</small><strong>{selected.source.label[lang]}</strong></span><span className="material-symbols-rounded">open_in_new</span></a></div></footer>
      </>}
    </div>
  )
}

function normalizeAtlas(value: string): string {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
}

function AtlasArticleCard({ article, lang, level, audience }: { article: Article; lang: Lang; level: Level; audience: 'kids' | 'academic' }) {
  const content = viewContent(article, lang, level)
  return (
    <a className="card" data-cat={article.cat[lang]} href={`#/article/${article.id}?audience=${audience}`}>
      <div className="card-photo"><ArticleVisual article={article} lang={lang} level={level}/></div>
      <div className="card-body"><span className="card-cat">{article.cat[lang]}</span><h3 className="card-title">{content.title}</h3><p className="card-summary">{content.summary}</p></div>
    </a>
  )
}
