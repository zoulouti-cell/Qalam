import { useEffect, useState } from 'react'
import { t, type Lang } from './i18n'
import { sound } from './sound'
import { awardBadge } from './rewards'

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

export default function Atlas({ lang }: { lang: Lang }) {
  const [year, setYear] = useState(-2500)
  const [playing, setPlaying] = useState(false)
  const [sel, setSel] = useState<Civ | null>(null)
  const [paths, setPaths] = useState<{ d: string }[]>([])
  const [err, setErr] = useState(false)

  useEffect(() => {
    let live = true
    void fetch('/assets/ne_110m_admin_0_countries.geojson')
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
      <h1 className="article-title">🗺 {t(lang, 'navAtlas')}</h1>
      <p className="empty">{lang === 'ar' ? 'خط زمني عالمي تفاعلي: حرّك السنة، ثم اختر نقطة على الخريطة لقراءة نبذة عن المجتمع أو الدولة.' : lang === 'fr' ? 'Chronologie mondiale interactive : déplacez l’année puis sélectionnez un point pour découvrir une société ou un État.' : 'Interactive world timeline: move the year, then select a point to learn about a society or state.'}</p>

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
