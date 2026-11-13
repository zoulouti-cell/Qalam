import type { Article, ArticleContent } from './data'
import type { Lang } from './i18n'

const text = (title:string, summary:string, ...body:string[]):ArticleContent => ({title,summary,body})
const refs = (urls:string[]) => Object.fromEntries((['ar','fr','en'] as Lang[]).map(lang=>[lang,urls.map(url=>({name:url.includes('eso.org')?'ESO':url.includes('esahubble.org')?'ESA/Hubble':'NASA',title:lang==='ar'?'المرجع العلمي للموضوع':lang==='fr'?'Référence scientifique':'Scientific reference',url,attribution:lang==='ar'?'صياغة تعليمية أصلية اعتمادًا على المرجع':lang==='fr'?'Synthèse pédagogique originale':'Original educational synthesis',license:lang==='ar'?'نص تحريري أصلي؛ حقوق الصور موضحة على حدة':lang==='fr'?'Texte original ; droits des images indiqués séparément':'Original text; image rights listed separately'}))]))

export const SPACE_ARTICLES:Article[] = [{
  id:'hubble-space-telescope',primaryDomain:'space',cat:{ar:'الفضاء',fr:'Espace',en:'Space'},related:['black-holes-guide','sun','mars'],
  editorialEdition:{batch:'parallel-space-01',sourceLanguage:'ar',parallel:true},subjectAliases:{ar:['تلسكوب هابل','مرصد هابل الفضائي'],fr:['Télescope spatial Hubble'],en:['Hubble Space Telescope']},
  content:{
    ar:text('تلسكوب هابل الفضائي','كيف يحوّل مرصد فوق الغلاف الجوي الضوء إلى قياسات تكشف تاريخ الكون؟',
      'هابل مرصد فضائي مشترك بين ناسا ووكالة الفضاء الأوروبية، أُطلق في 24 أبريل 1990. تجمع مرآته الرئيسية، بقطر 2.4 متر، الضوء وتوجّهه إلى أدوات تصوير وتحليل طيفي. وجوده فوق معظم الغلاف الجوي يحدّ من اضطراب الصور وامتصاص بعض الأطوال الموجية.',
      'يرصد هابل الأشعة فوق البنفسجية والضوء المرئي وجزءًا من الأشعة تحت الحمراء. الصورة العلمية قياس رقمي يُعايَر لإزالة أثر الكاشف؛ وقد تُركّب الألوان من مرشحات متعددة لتمييز البنى أو العناصر. لذلك ينبغي قراءة وصف كل صورة قبل تفسير ألوانها.',
      'كشف خلل في شكل المرآة بعد الإطلاق أن جودة المرصد تعتمد على دقة القياس والتصنيع. ركّبت بعثة الصيانة سنة 1993 وسائل تصحيح بصري وأداة تصوير جديدة. تبرز القصة دور اختبار الأدوات وإعادة معايرتها، لا مجرد إطلاقها.',
      'تساعد مقارنة السطوع والأطياف والمسافات على دراسة النجوم والمجرات. وعند النظر إلى مجرة بعيدة نرصد الضوء الذي غادرها قديمًا؛ لا يصنع التلسكوب آلة سفر إلى الماضي، بل يستقبل سجلًا ضوئيًا تأخر وصوله. تتوقف الاستنتاجات على نماذج ومعايرة ومقادير عدم يقين.'),
    fr:text('Télescope spatial Hubble','Du rayonnement reçu à la mesure : comment un observatoire spatial étudie-t-il le cosmos ?',
      'Observatoire commun de la NASA et de l’ESA, Hubble a été lancé le 24 avril 1990. Son miroir principal de 2,4 mètres dirige la lumière vers des instruments d’imagerie et de spectroscopie. Au-dessus de l’essentiel de l’atmosphère, il évite une grande partie de la turbulence et de l’absorption atmosphériques.',
      'Il observe l’ultraviolet, le visible et une partie du proche infrarouge. Une image est une mesure numérique calibrée ; des filtres peuvent être associés à différentes couleurs pour distinguer des structures. Sa légende précise ce que représentent ces couleurs.',
      'Un défaut de forme du miroir a dégradé les premières images. La maintenance de 1993 a installé une correction optique et une nouvelle caméra. Cet épisode montre pourquoi essais, étalonnage et réparation font partie de la démarche scientifique.',
      'La lumière des galaxies lointaines a voyagé longtemps : nous observons leur état ancien. Ce regard vers le passé n’est pas un voyage temporel. Les conclusions reposent sur des mesures, des modèles et des incertitudes explicites.'),
    en:text('Hubble Space Telescope','From incoming light to calibrated evidence: how an orbital observatory studies the cosmos.',
      'A joint NASA–ESA observatory, Hubble launched on April 24, 1990. Its 2.4-metre primary mirror directs light to imaging and spectroscopic instruments. Operating above most of the atmosphere reduces atmospheric blurring and absorption.',
      'Hubble observes ultraviolet, visible and some near-infrared light. Scientific images are calibrated detector measurements; multiple filters may be assigned colours to distinguish structures. Read the caption before interpreting those colours.',
      'A mirror-shape error degraded the first images. The 1993 servicing mission installed corrective optics and a new camera. Testing, calibration and repair are therefore part of the science, alongside launch and observation.',
      'Light from distant galaxies left them long ago, so we observe earlier states rather than travel into the past. Brightness, spectra and distance estimates constrain models, with measurement uncertainties that must remain visible.'),
  },
  kidsContent:{
    ar:text('هابل: عين تراقب الفضاء','مرآة كبيرة تجمع الضوء لنكتشف نجومًا ومجرات بعيدة.',
      'هابل تلسكوب يدور حول الأرض. أُطلق سنة 1990، ويحمل مرآة عرضها 2.4 متر تجمع الضوء، بدل أن ينظر بعين مثلنا.',
      'تمنحه الألواح الشمسية الكهرباء. وتحوّل أدواته الضوء إلى بيانات يرسلها إلى العلماء على الأرض.',
      'حين تكون المجرة بعيدة، يحتاج ضوؤها وقتًا طويلًا ليصل. نشاهدها كما كانت عندما انطلق الضوء منها.',
      'جرّب: اختر المرآة ثم الألواح ثم الكاميرا في الشرح المصوّر. ما الجزء الذي يجمع الضوء، وما الجزء الذي يمدّ الجهاز بالطاقة؟'),
    fr:text('Hubble : un œil sur l’espace','Un grand miroir pour découvrir des étoiles et des galaxies.',
      'Hubble tourne autour de la Terre depuis son lancement en 1990. Son miroir de 2,4 mètres collecte la lumière.',
      'Ses panneaux solaires fournissent l’électricité. Ses instruments transforment la lumière en données envoyées aux scientifiques.',
      'La lumière d’une galaxie lointaine met longtemps à nous parvenir : nous voyons son passé.',
      'Explore le miroir, les panneaux et la caméra. Quelle pièce collecte la lumière et laquelle fournit l’énergie ?'),
    en:text('Hubble: an eye on space','A large mirror helps us discover distant stars and galaxies.',
      'Hubble orbits Earth. Launched in 1990, it uses a 2.4-metre mirror to collect light.',
      'Solar panels supply electricity. Instruments turn incoming light into data sent to scientists.',
      'Light from a distant galaxy takes a long time to arrive, so we see how it looked in the past.',
      'Explore the mirror, panels and camera. Which part collects light, and which part supplies power?'),
  },sources:refs(['https://science.nasa.gov/mission/hubble/observatory/','https://science.nasa.gov/mission/hubble/overview/the-history-of-hubble/','https://science.nasa.gov/mission/hubble/observatory/design/optics/hubbles-mirror-flaw/','https://esahubble.org/about/history/timeline/']),
},{
  id:'black-holes-guide',primaryDomain:'space',cat:{ar:'الفضاء',fr:'Espace',en:'Space'},related:['hubble-space-telescope','sun'],
  editorialEdition:{batch:'parallel-space-01',sourceLanguage:'ar',parallel:true},subjectAliases:{ar:['ثقب أسود'],fr:['Trou noir'],en:['Black hole','Black holes']},
  content:{
    ar:text('الثقوب السوداء','أفق الحدث والضوء والقرص المتراكم: ما الذي نرصده فعلًا؟',
      'الثقب الأسود منطقة في الزمكان لا يمكن للضوء أو الإشارات الإفلات من داخل أفق حدثها. الأفق حد سببي، لا قشرة صلبة ولا بوابة مثبتة إلى مكان آخر. انحناء الضوء حوله نتيجة الجاذبية كما تصفها النسبية العامة، وليس انثناء سطح مادي.',
      'في الحالة المثالية غير الدوارة، نصف قطر شوارزشيلد يساوي 2GM/c²؛ حيث G ثابت الجذب وM الكتلة وc سرعة الضوء. تربط الصيغة الكتلة بحجم الأفق، ولا تصف جاذبية نيوتن داخل الثقب. أما الدوران فيغيّر هندسة الزمكان المحيط.',
      'القرص المتراكم، إن وُجد، مادة ساخنة خارج الأفق. ما نرصده من إشعاع يأتي من هذه المادة أو البيئة المحيطة، لا من داخل الثقب. ولا تملك جميع الثقوب أقراصًا مضيئة؛ يكشف بعضها من حركة النجوم أو أثره في محيطه.',
      'أُعلنت صورة ظل الثقب في مجرة مسييه 87 سنة 2019، وصورة القوس أ* في مجرتنا سنة 2022. جُمعت القياسات الراديوية من مراصد موزّعة وأعيد بناء الصورة حسابيًا؛ ليست لقطة ضوئية عادية ولا صورة للتفرّد.',
      'الثقب الأسود ليس مكنسة تبتلع كل شيء من أي مسافة؛ يمكن للأجسام أن تدور حوله دون عبور الأفق. ويظل وصف المركز الكامل مسألة مفتوحة؛ التفرّد في النسبية العامة ينبه إلى حدود النظرية، ولا يثبت بوابة زمنية قابلة للسفر.'),
    fr:text('Trou noir','Horizon, accrétion et observation : distinguer mesure et représentation.',
      'Un trou noir est une région de l’espace-temps dont aucune lumière ne peut s’échapper après franchissement de l’horizon. Cet horizon est une frontière causale, pas une coque solide ni un passage vers un autre lieu. La courbure de la lumière est décrite par la relativité générale.',
      'Pour un modèle non tournant, le rayon de Schwarzschild vaut 2GM/c². G est la constante gravitationnelle, M la masse et c la vitesse de la lumière. La rotation modifie la géométrie environnante.',
      'Un disque d’accrétion éventuel contient du gaz chaud extérieur à l’horizon. Nous détectons cette matière, pas de lumière provenant de l’intérieur. Tous les trous noirs ne possèdent pas de disque lumineux.',
      'L’image de l’ombre de M87* a été annoncée en 2019, celle de Sagittarius A* en 2022. Ce sont des reconstructions à partir de mesures radio obtenues par plusieurs observatoires, pas des photographies de la singularité.',
      'Un trou noir n’aspire pas tout à n’importe quelle distance : des orbites sont possibles. La singularité théorique signale les limites de notre description ; elle ne prouve pas l’existence d’un passage temporel utilisable.'),
    en:text('Black hole','Event horizons, accretion and observation: separating evidence from analogy.',
      'A black hole is a region of spacetime from which light cannot escape after crossing its event horizon. The horizon is a causal boundary, not a solid shell or a passage to another place. Gravity bends light, as described by general relativity.',
      'For a non-rotating idealisation, the Schwarzschild radius is 2GM/c², where G is the gravitational constant, M the mass and c the speed of light. Rotation changes the surrounding geometry.',
      'An accretion disk, when present, contains hot matter outside the horizon. Its radiation comes from that material, not the black hole’s interior. Some black holes lack bright disks and require other detection methods.',
      'The M87* shadow image was announced in 2019 and Sagittarius A* in 2022. These are reconstructions from radio measurements across an observatory network, not ordinary photographs or views of a singularity.',
      'Black holes do not vacuum up everything at every distance: stable distant orbits are possible. A theoretical singularity exposes limits in our description, rather than demonstrating a usable time-travel portal.'),
  },
  kidsContent:{
    ar:text('الثقب الأسود: لماذا لا يستطيع الضوء الإفلات؟','حدّ لا يستطيع الضوء العودة من داخله، وقد تتوهّج مادة تحيط به.',
      'للثقب الأسود حد اسمه أفق الحدث. إذا عبره الضوء إلى الداخل، لا يستطيع الرجوع إلى الخارج.',
      'قد نرى غازًا ساخنًا يحيط ببعض الثقوب السوداء. هذا الغاز خارج أفق الحدث؛ الضوء الذي نرصده لا يأتي من داخل الثقب، وبعض الثقوب لا يحيط بها قرص لامع.',
      'الثقب الأسود لا يبتلع الكون كله. يمكن لنجم بعيد أن يدور حوله، مثلما تدور الأرض حول الشمس.',
      'في مختبر الفضاء يمكنك تغيير شكل نموذج تعليمي لانحناء الزمكان. تذكّر أن الفضاء ليس بساطًا ماديًا، ولا يوجد «أسفل» يسقط الثقب الأسود نحوه.'),
    fr:text('Trou noir : pourquoi la lumière ne ressort-elle pas ?','Une frontière que la lumière ne peut plus franchir vers l’extérieur.',
      'La limite s’appelle l’horizon des événements. La lumière qui le traverse vers l’intérieur ne peut plus revenir.',
      'Du gaz chaud peut entourer certains trous noirs. Il se trouve à l’extérieur de l’horizon : la lumière observée ne vient pas de l’intérieur. Certains trous noirs n’ont pas de disque brillant.',
      'Un trou noir n’avale pas tout l’Univers. Une étoile assez éloignée peut rester en orbite autour de lui.',
      'Dans le laboratoire spatial, vous pouvez modifier une représentation pédagogique de la courbure. L’espace n’est pas un tissu matériel et il n’existe pas de direction vers laquelle tomberait le trou noir.'),
    en:text('Black holes: why can’t light get out?','A boundary light cannot cross back out from.',
      'The boundary is called the event horizon. Once light crosses inward, it cannot come back out.',
      'Hot gas may surround some black holes. It lies outside the horizon; observed light does not come from inside. Some black holes have no bright disk.',
      'A black hole does not swallow the whole Universe. A distant star can stay in orbit around it.',
      'In the Space Lab, you can change an educational model of curvature. Space is not a material sheet, and there is no downward direction into which a black hole falls.'),
  },sources:refs(['https://science.nasa.gov/universe/black-holes/anatomy/','https://science.nasa.gov/universe/black-holes/','https://www.eso.org/public/news/eso2208-eht-mw/','https://www.eso.org/public/images/eso1907a/']),
}]

/** Keep the complete, age-specific editions instead of duplicate imported stubs. */
export function isReplacedSpaceArticle(article:Article) {
  if(SPACE_ARTICLES.some(a=>a.id===article.id))return false
  return Object.values(article.content).some(c=>c && /^(?:ثقب أسود|الثقوب السوداء|trou noir|black holes?|تلسكوب هابل(?: الفضائي)?|مرصد هابل الفضائي|hubble space telescope|télescope spatial hubble)$/i.test(c.title.trim()))
}
