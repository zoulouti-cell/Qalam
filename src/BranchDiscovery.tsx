import { useEffect, useRef, useState } from 'react'
import type { Lang } from './i18n'
import { publicUrl } from './publicUrl'
import './branchDiscovery.css'

type Copy = Record<Lang, string>
type Reading = { child: Copy; academic: Copy }
type Reflection = { child: Copy; academic: Copy }
const w = (ar: string, fr: string, en: string): Copy => ({ ar, fr, en })
const reading = (child: [string,string,string], academic: [string,string,string]): Reading => ({
  child: w(...child), academic: w(...academic),
})

const TOPICS: Record<string, [string,string,string][]> = {
  space: [['الأرض والنظام الشمسي','La Terre et le système solaire','Earth and the Solar System'],['النجوم والمجرات','Étoiles et galaxies','Stars and galaxies'],['الرصد والاستكشاف','Observation et exploration','Observation and exploration']],
  earth: [['التضاريس والمياه','Relief et eaux','Landforms and water'],['القارات والمناخ','Continents et climat','Continents and climate'],['كوكب متغير','Une planète en évolution','A changing planet']],
  life: [['الموطن','Habitat','Habitat'],['الشبكة الغذائية','Réseau trophique','Food web'],['التنوع والتكيف','Diversité et adaptation','Diversity and adaptation']],
  civilizations: [['الاستقرار والماء','Eau et peuplement','Water and settlement'],['المدينة والتبادل','Ville et échanges','Cities and exchange'],['المعرفة والمؤسسات','Savoirs et institutions','Knowledge and institutions']],
  science: [['السؤال والملاحظة','Question et observation','Question and observation'],['التجربة والقياس','Expérience et mesure','Experiment and measurement'],['النموذج والدليل','Modèle et preuve','Models and evidence']],
  'human-history': [['الهجرات والبيئة','Migrations et environnement','Migration and environment'],['المجتمع والسلطة','Société et pouvoir','Society and power'],['التحولات والتفاعل','Transformations et échanges','Change and interaction']],
  arts: [['الإبداع والتعبير','Création et expression','Creation and expression'],['الشكل والإيقاع','Forme et rythme','Form and rhythm'],['التلقي والتأويل','Réception et interprétation','Reception and interpretation']],
  religions: [['النص والسياق','Texte et contexte','Text and context'],['الأماكن والمسارات','Lieux et itinéraires','Places and routes'],['التراث والتنوع','Patrimoine et diversité','Heritage and diversity']],
  technology: [['المعلومة والإشارة','Information et signal','Information and signals'],['المعالجة والخوارزمية','Traitement et algorithme','Processing and algorithms'],['الشبكات والأثر','Réseaux et impacts','Networks and impact']],
  future: [['مؤشرات الحاضر','Signaux actuels','Present signals'],['البدائل والسيناريوهات','Options et scénarios','Options and scenarios'],['الاختيار والنتائج','Choix et conséquences','Choices and consequences']],
}

const READINGS: Record<string, Reading[]> = {
  space: [
    reading(
      ['تدور الأرض مع كواكب أخرى حول الشمس. راقب اختلاف أحجام الكواكب وبعدها، وتذكّر أن الرسم لا يعرض المسافات الحقيقية بمقياس واحد.','La Terre et les autres planètes orbitent autour du Soleil. Comparez leurs tailles et leurs distances; le dessin ne respecte pas une échelle unique.','Earth and the other planets orbit the Sun. Compare their sizes and distances; the illustration does not use one scale for both.'],
      ['تتكون المجموعة الشمسية من الشمس وأجرام مرتبطة بها بفعل الجاذبية، منها ثمانية كواكب وأقمار وكويكبات ومذنبات. تُقاس المسافات بوحدات فلكية أو بزمن انتقال الضوء، بينما تتطلب مقارنة الأحجام والمسافات مقاييس منفصلة كي لا تشوه الصورة البنية المدارية.','Le système solaire comprend le Soleil et les corps liés par sa gravité : huit planètes, des lunes, astéroïdes et comètes. Les distances se mesurent en unités astronomiques ou en temps de trajet de la lumière; tailles et distances exigent des échelles distinctes.','The Solar System includes the Sun and bodies bound by its gravity: eight planets, moons, asteroids, and comets. Distances use astronomical units or light travel time; comparing sizes and distances requires separate scales to avoid distorting orbital structure.']),
    reading(
      ['تولد النجوم داخل سحب واسعة من الغاز والغبار، وتعيش مددًا مختلفة. تجمع المجرات أعدادًا هائلة من النجوم والغاز والمادة المظلمة.','Les étoiles naissent dans de vastes nuages de gaz et de poussière et ont des durées de vie différentes. Les galaxies rassemblent étoiles, gaz et matière noire.','Stars form inside vast clouds of gas and dust and have different lifetimes. Galaxies contain enormous numbers of stars, gas, and dark matter.'],
      ['تنهار مناطق كثيفة من السحب الجزيئية لتنشأ نجوم أولية، ثم يستقر النجم حين يتوازن ضغط الاندماج مع الجاذبية. يعتمد تطوره على كتلته وتركيبه؛ أما المجرات فتتغير عبر تشكل النجوم والاندماجات والتفاعلات. تُستدل على هذه العمليات من أطياف الضوء والانزياح الأحمر والرصد متعدد الأطوال الموجية.','Des régions denses de nuages moléculaires s’effondrent et forment des protoétoiles. L’évolution dépend notamment de la masse; les galaxies changent par formation stellaire et interactions. Spectres et observations multi-longueurs d’onde servent d’indices.','Dense regions in molecular clouds collapse into protostars. Stellar evolution depends strongly on mass; galaxies change through star formation and interactions. Spectra and multiwavelength observations provide evidence for these processes.']),
    reading(
      ['تساعد التلسكوبات العلماء على جمع الضوء من أجسام بعيدة جدًا. بعضها يراقب الضوء المرئي، وبعضها يرصد موجات لا تراها أعيننا.','Les télescopes recueillent la lumière d’objets lointains. Certains observent la lumière visible, d’autres des ondes invisibles à nos yeux.','Telescopes collect light from distant objects. Some observe visible light; others detect wavelengths our eyes cannot see.'],
      ['يقيس علم الفلك الإشعاع عبر نطاقات متعددة، وتكمل المراصد الأرضية والفضائية بعضها بسبب امتصاص الغلاف الجوي والتشويش. تكشف الصور المعالجة بنية الأجرام، لكنها ليست مشاهد فوتوغرافية مباشرة بالضرورة؛ لذلك ينبغي بيان المرشحات والألوان الاصطناعية وبيانات الرصد.','L’astronomie mesure le rayonnement sur plusieurs bandes. Observatoires terrestres et spatiaux se complètent. Les images traitées révèlent des structures, mais ne sont pas toujours des photographies en couleurs naturelles; filtres et données doivent être précisés.','Astronomy measures radiation across many bands, with ground and space observatories complementing one another. Processed images reveal structure but are not always natural-color photographs; filters and data should be identified.']),
  ],
  earth: [
    reading(
      ['الجبال والسهول والوديان أشكال طبيعية على سطح الأرض. تنقل الأنهار الصخور والتربة، وتغيّر شكل الوادي ببطء.','Montagnes, plaines et vallées sont des formes du relief. Les rivières transportent roches et sols et façonnent les vallées au fil du temps.','Mountains, plains, and valleys shape Earth’s surface. Rivers carry rock and soil and slowly reshape valleys.'],
      ['ينتج التضرس عن تفاعل البنية الجيولوجية والرفع التكتوني والتعرية والترسيب. تنقل الأنهار الرواسب وفق طاقتها وانحدارها، بينما تؤثر الجليديات والأمواج والرياح في مشاهد مختلفة. تتطلب المقارنة بين الأحواض بيانات عن التصريف والحمولة الرسوبية والزمن الجيولوجي.','Le relief résulte de la structure géologique, du soulèvement tectonique, de l’érosion et du dépôt. Les rivières transportent des sédiments selon leur débit et leur pente; glaciers, vagues et vents façonnent d’autres paysages.','Relief emerges from geological structure, tectonic uplift, erosion, and deposition. Rivers transport sediment according to discharge and slope, while glaciers, waves, and wind shape other landscapes.']),
    reading(
      ['تضم الأرض قارات ومحيطات، وتختلف مناطقها في الحرارة والأمطار. يؤثر الموقع والارتفاع والبحر في المناخ المحلي.','La Terre comprend continents et océans, avec des températures et précipitations variées. Position, altitude et proximité de la mer influencent le climat.','Earth has continents and oceans with varied temperatures and rainfall. Location, elevation, and distance from the sea affect local climate.'],
      ['تتشكل أنماط المناخ من توازن الطاقة، ودوران الغلاف الجوي والمحيطات، والتضاريس، والغطاء السطحي. القارات ليست وحدات مناخية متجانسة؛ لذلك تُعرض المتوسطات والاتجاهات مع نطاقاتها الزمنية ومصادر القياس، ويُفصل المناخ طويل الأجل عن الطقس اليومي.','Le climat dépend du bilan énergétique, de la circulation atmosphérique et océanique, du relief et des surfaces. Les continents ne sont pas homogènes; les moyennes doivent préciser périodes et sources, en distinguant climat et météo.','Climate reflects energy balance, atmospheric and ocean circulation, topography, and land cover. Continents are not climatically uniform; averages need stated periods and sources, and climate must be distinguished from daily weather.']),
    reading(
      ['سطح الأرض يتغير باستمرار: تتحرك الصفائح، وتثور بعض البراكين، وتتشكل السحب والأمطار. تحدث التغييرات بسرعات مختلفة.','La surface terrestre évolue : les plaques bougent, des volcans entrent en éruption, et nuages et pluies se forment. Les changements se déroulent à des vitesses différentes.','Earth’s surface keeps changing: plates move, volcanoes erupt, and clouds and rain form. These changes happen at very different speeds.'],
      ['تتحرك الصفائح الليثوسفيرية بفعل ديناميات الوشاح، فتتكون حدود متباعدة ومتقاربة وتحويلية ترتبط بالزلازل والبراكين وبناء الجبال. وفي المقابل تعمل دورة الماء والعمليات الجوية على مقاييس زمنية أقصر. يميز التحليل بين السجل الجيولوجي والقياسات الحديثة لتفسير اتجاه التغير ومخاطره.','Les plaques lithosphériques se déplacent sous l’effet de la dynamique du manteau. Leurs limites sont associées aux séismes, volcans et chaînes de montagnes, tandis que les processus météorologiques opèrent à des échelles plus courtes.','Lithospheric plates move through mantle dynamics. Their boundaries relate to earthquakes, volcanoes, and mountain building, while weather processes operate on shorter timescales.']),
  ],
  life: [
    reading(
      ['الموطن أكثر من مكان؛ فهو الماء والضوء والغذاء والمأوى. لاحظ كيف تساعد هذه العوامل كائنًا على العيش في بيئته.',
       'Un habitat ne se réduit pas à un lieu : il comprend eau, lumière, nourriture et abri. Observez comment ces éléments permettent à un organisme d’y vivre.',
       'A habitat is more than a place: it includes water, light, food, and shelter. Notice how these conditions help an organism live there.'],
      ['يُعرّف الموطن بمجموعة الشروط الحيوية واللاحيوية التي تتيح للكائن البقاء والتكاثر. تتغير هذه الشروط مكانيًا وموسميًا، وقد يكون للكائن نطاق بيئي أوسع من موطن واحد. لا يفسر المناخ وحده التوزع؛ فالتنافس والافتراس والموارد والتاريخ التطوري عوامل متفاعلة.',
       'L’habitat réunit les conditions biotiques et abiotiques permettant la survie et la reproduction. Ces conditions varient dans l’espace et selon les saisons; la répartition dépend aussi des ressources, des interactions et de l’histoire évolutive.',
       'Habitat comprises the biotic and abiotic conditions that support survival and reproduction. These conditions vary across space and seasons; distribution also depends on resources, interactions, and evolutionary history.']),
    reading(
      ['تنتقل الطاقة من النباتات إلى الحيوانات، ثم تساعد المحللات على إعادة المواد إلى البيئة. ترتبط الكائنات في شبكة، لا في خط واحد.',
       'L’énergie passe des plantes aux animaux, puis les décomposeurs recyclent la matière. Les organismes forment un réseau, pas une seule ligne.',
       'Energy moves from plants to animals, while decomposers return nutrients to the environment. Organisms form a web, not one simple line.'],
      ['تجمع الشبكة الغذائية سلاسل متداخلة من المنتجين والمستهلكين والمحللات. تنتقل الطاقة بين المستويات مع فقد حراري، بينما تدور العناصر الكيميائية عبر النظام البيئي. لذلك قد يمتد أثر اختفاء نوع إلى علاقات متعددة، وتختلف النتيجة بحسب مرونة الشبكة والبيئة.',
       'Un réseau trophique relie producteurs, consommateurs et décomposeurs. L’énergie diminue à chaque transfert, tandis que les éléments chimiques circulent; la disparition d’une espèce peut donc modifier plusieurs relations.',
       'A food web links producers, consumers, and decomposers. Energy decreases at each transfer while chemical elements cycle; losing one species can therefore affect many relationships.']),
    reading(
      ['تختلف الكائنات في صفاتها، وقد تساعد بعض الصفات على العيش في بيئة معينة. يتغير التنوع عبر أجيال كثيرة، وليس لأن الكائن قرر التغير.',
       'Les organismes varient; certains caractères facilitent la vie dans un milieu donné. L’évolution se déroule sur de nombreuses générations, sans décision consciente.',
       'Organisms vary, and some traits can help in a particular environment. Change accumulates across generations; organisms do not choose to evolve.'],
      ['ينشأ التكيف من تغير تردد الصفات الوراثية عبر الأجيال بفعل الانتقاء الطبيعي وعمليات أخرى، ضمن قيود التطور والبيئة. لا يكون التكيف مثاليًا أو موجّهًا نحو غاية؛ كما أن التنوع الوراثي والسياق البيئي يحددان الاستجابة المحتملة.',
       'L’adaptation résulte de changements de fréquences des caractères héréditaires au fil des générations, sous l’effet de la sélection et d’autres mécanismes. Elle n’est ni parfaite ni orientée vers un but.',
       'Adaptation results from changes in inherited traits across generations through natural selection and other processes. It is neither perfect nor directed toward a predetermined goal.']),
  ],
  civilizations: [
    reading(
      ['ساعد الماء والتربة وطرق العبور على نشوء قرى ومدن في مناطق كثيرة. لكن المجتمعات بنت طرقًا مختلفة للتعامل مع البيئة.',
       'L’eau, les sols et les voies de passage ont favorisé villages et villes dans de nombreuses régions. Les sociétés ont toutefois développé des solutions différentes.',
       'Water, soils, and routes supported settlements in many regions. Societies nevertheless developed different ways of living with their environments.'],
      ['تفسر الزراعة وإدارة الماء والاستقرار عبر تفاعل البيئة والتقنية والتنظيم الاجتماعي، لا بسبب نهر أو اختراع منفرد. تُقارن مجتمعات الرافدين ووادي النيل والصين وأفريقيا والأمريكيتين مع الانتباه إلى التواريخ والأدلة المحلية، وتجنب افتراض مسار حضاري واحد.',
       'Agriculture, water management, and settlement emerged through interactions among environment, technology, and social organization. Comparing regions requires local evidence and avoids a single universal trajectory.',
       'Agriculture, water management, and settlement developed through interactions among environment, technology, and social organization. Regional comparisons require local evidence and avoid a single universal path.']),
    reading(
      ['في المدينة يلتقي الحرفيون والتجار والمسافرون. تنقل الطرق والأنهار والبحار السلع والأفكار بين المدن.',
       'Artisans, marchands et voyageurs se rencontrent en ville. Routes, fleuves et mers font circuler biens et idées.',
       'Cities bring together craftspeople, traders, and travelers. Roads, rivers, and seas move goods and ideas between them.'],
      ['تُدرس المدينة بوصفها شبكة من العمل والأسواق والسلطة والبنية التحتية والروابط الريفية والحضرية. تختلف أنماط التبادل؛ ولا يثبت التشابه المعماري وحده اتصالًا مباشرًا. تكشف المواد الأثرية والنقوش والسجلات معًا عن حركة السلع والأشخاص والمعرفة.',
       'La ville est un réseau de travail, de marchés, de pouvoir, d’infrastructures et de liens avec les campagnes. La ressemblance architecturale ne prouve pas à elle seule un contact direct.',
       'A city is a network of work, markets, power, infrastructure, and rural connections. Architectural similarities alone do not prove direct contact; artifacts, inscriptions, and records provide complementary evidence.']),
    reading(
      ['حفظت الكتابة بعض الأخبار والحسابات، وساعدت المدارس والمكتبات على مشاركة المعرفة. لكل مجتمع مؤسساته وطرقه الخاصة.',
       'L’écrit conserve certains récits et comptes; écoles et bibliothèques partagent des savoirs. Chaque société développe ses institutions.',
       'Writing preserved some records and accounts, while schools and libraries shared knowledge. Each society developed its own institutions.'],
      ['تتبع المعرفة عبر المخطوطات والتعليم والمكتبات والقانون والحرف، مع دراسة من أنتج النصوص ومن استطاع الوصول إليها. المؤسسات ليست متطابقة ولا تنمو على سلم واحد؛ وتُقارن مصادرها وسياقاتها قبل استنتاج التأثير أو الانتقال.',
       'L’histoire des savoirs passe par manuscrits, enseignement, bibliothèques, droit et métiers. Il faut étudier qui produit les textes et qui y accède, sans supposer une évolution uniforme.',
       'Knowledge history includes manuscripts, education, libraries, law, and crafts. Ask who produced texts and who could access them; institutions did not follow one uniform path.']),
  ],
  science: [
    reading(
      ['يبدأ الاكتشاف بسؤال واضح وملاحظة دقيقة. اكتب ما تراه أولًا، ثم فكّر فيما قد يفسره.',
       'Une recherche commence par une question claire et une observation. Décrivez ce que vous voyez avant de proposer une explication.',
       'Investigation begins with a clear question and careful observation. Record what you see before suggesting an explanation.'],
      ['يُصاغ السؤال بحيث يمكن فحصه، ثم تُفصل المشاهدة عن تفسيرها. ينبغي وصف الأداة والوحدة والظروف ومصادر الخطأ؛ فالملاحظة ليست محايدة تمامًا، لكنها تصبح قابلة للنقد والتكرار عندما تُوثق إجراءاتها.',
       'Une question doit pouvoir être examinée. On distingue observation et interprétation, puis on précise instruments, unités, conditions et sources d’erreur afin de rendre la démarche vérifiable.',
       'A question should be testable. Separate observation from interpretation and document instruments, units, conditions, and error sources so the method can be examined and repeated.']),
    reading(
      ['غيّر عاملًا واحدًا كل مرة إن أمكن، وقِس النتيجة أكثر من مرة. المقارنة العادلة تساعدنا على معرفة ما حدث.',
       'Si possible, ne changez qu’un facteur à la fois et répétez la mesure. Une comparaison équitable aide à comprendre le résultat.',
       'When possible, change one factor at a time and repeat measurements. Fair comparisons help explain what happened.'],
      ['يتطلب التصميم التجريبي تحديد المتغيرات والضوابط والعينة وطريقة القياس، مع تكرار مناسب وتحليل عدم اليقين. لا يكفي تزامن عاملين لإثبات السببية؛ وتحتاج النتائج إلى مراجعة مستقلة ومقارنة بتصاميم أخرى.',
       'Un protocole précise variables, témoins, échantillon, mesure et incertitude. Une corrélation ne suffit pas à établir la causalité; les résultats exigent répétitions et examen indépendant.',
       'Experimental design specifies variables, controls, samples, measurements, and uncertainty. Correlation alone does not establish causation; results require replication and independent scrutiny.']),
    reading(
      ['يساعد النموذج على شرح ما نراه وتوقع ما قد يحدث. إذا اختلف التوقع عن النتيجة، نراجع النموذج.',
       'Un modèle aide à expliquer ce que l’on observe et à prévoir un résultat. S’il échoue, on le révise.',
       'A model helps explain observations and predict outcomes. When predictions fail, the model must be reconsidered.'],
      ['النموذج تمثيل محدود يربط افتراضات بقياسات وتنبؤات. تُقاس قيمته بقدرته التفسيرية والتنبؤية ضمن مجال صلاحية معلوم، لا بكونه نسخة كاملة من الواقع. تتراكم الأدلة وتُراجع النماذج عند ظهور بيانات أقوى أو تفسير أدق.',
       'Un modèle relie hypothèses, mesures et prédictions dans un domaine de validité. Il n’est pas une copie parfaite du réel; de nouvelles données peuvent conduire à le réviser.',
       'A model links assumptions, measurements, and predictions within a known domain of validity. It is not a perfect copy of reality; stronger evidence may require revision.']),
  ],
  'human-history': [
    reading(
      ['انتقل الناس لأسباب كثيرة: البحث عن الماء والعمل والأمان أو لمّ شمل الأسرة. لا يفسر المناخ وحده كل رحلة.',
       'Les migrations ont des causes multiples : eau, travail, sécurité ou liens familiaux. Le climat n’explique pas chaque déplacement.',
       'People move for many reasons: water, work, safety, or family ties. Climate alone does not explain every migration.'],
      ['تُحلل الهجرة عبر عوامل الدفع والجذب والحدود والشبكات الأسرية والسياسات والموارد، مع التمييز بين الحركة الموسمية والنزوح واللجوء والاستيطان. تتطلب بيانات السكان والسجلات والآثار مقاربات مختلفة، وقد تُظهر نتائج متباينة عن التجربة نفسها.',
       'Les migrations dépendent de facteurs de départ et d’arrivée, des frontières, des réseaux et des politiques. Il faut distinguer mobilité saisonnière, déplacement forcé et installation, en croisant plusieurs types de sources.',
       'Migration reflects pressures and opportunities, borders, family networks, resources, and policy. Distinguish seasonal mobility, displacement, asylum, and settlement, using evidence suited to each.']),
    reading(
      ['تتشارك المجتمعات الموارد والقواعد، لكن السلطة لا تُوزع دائمًا بالتساوي. اسأل من اتخذ القرار ومن تأثر به.',
       'Les sociétés partagent ressources et règles, mais le pouvoir est inégal. Demandez qui décide et qui est concerné.',
       'Societies share resources and rules, but power is not always equal. Ask who made decisions and who was affected.'],
      ['تُدرس السلطة عبر المؤسسات والقوانين والضرائب والعمل والملكية والتمثيل، مع مقارنة خبرات الفئات داخل المجتمع. لا يكفي وصف الحاكم أو الدولة؛ ينبغي تحليل الممارسة اليومية ومصادر القرار وحدودها وأشكال المقاومة والتفاوض.',
       'Le pouvoir s’observe dans institutions, droit, fiscalité, travail, propriété et représentation. L’analyse compare les groupes et les pratiques quotidiennes, ainsi que négociation et contestation.',
       'Power operates through institutions, law, taxation, labor, property, and representation. Analysis compares social groups and everyday practices alongside negotiation and resistance.']),
    reading(
      ['تتغير المجتمعات عندما تتفاعل الأفكار والناس والتقنيات، وأحيانًا بسبب الأزمات. يحمل كل تغير مكاسب وتحديات مختلفة.',
       'Les sociétés changent avec les échanges, les idées, les techniques et les crises. Chaque transformation a des effets différents.',
       'Societies change through exchange, ideas, technologies, and crises. Each transformation brings different consequences.'],
      ['تُربط التحولات الاقتصادية والسياسية والثقافية بأسباب متعددة وآثار متفاوتة زمنيًا واجتماعيًا. يفيد تتبع شبكات التبادل والنزاع والمرض والهجرة، مع مقارنة الشهادات والسجلات الكمية، وتجنب تفسير الحدث بعامل منفرد أو رواية المنتصر فقط.',
       'Les changements économiques, politiques et culturels ont des causes multiples et des effets inégaux. Croiser témoignages et données aide à dépasser l’explication unique ou le seul récit des vainqueurs.',
       'Economic, political, and cultural changes have multiple causes and uneven effects. Combining testimony with quantitative records avoids single-cause explanations and accounts written only by victors.']),
  ],
  arts: [
    reading(
      ['قد تحكي صورة أو أغنية أو قصيدة تجربة صاحبها ومجتمعه. لاحظ شكل العمل ومتى ولمن صُنع.',
       'Image, chanson ou poème peuvent exprimer une expérience personnelle et collective. Observez la forme, l’époque et le public.',
       'An image, song, or poem can express personal and shared experience. Notice its form, period, and intended audience.'],
      ['يُقرأ العمل الفني في سياق إنتاجه ورعايته وتداوله، مع تحليل مادته وشكله وموضوعه. لا يُختزل معنى الأثر في نية الفنان وحدها؛ فالمؤسسات والجمهور والأسواق والرقابة تؤثر في إنتاجه وقراءته.',
       'L’œuvre se comprend par son contexte de production, de commande et de circulation, ainsi que par sa matière et sa forme. Institutions, publics et marchés influencent sa réception.',
       'Interpret an artwork through its production, patronage, circulation, material, and form. Institutions, audiences, markets, and censorship shape how it is made and received.']),
    reading(
      ['للألوان والإيقاع والكلمات أدوات مختلفة. جرّب أن تصف النمط أو اللحن قبل أن تفسر معناه.',
       'Couleurs, rythmes et mots utilisent des moyens différents. Décrivez d’abord le motif ou le son avant de l’interpréter.',
       'Color, rhythm, and words work differently. Describe a pattern or sound before interpreting its meaning.'],
      ['يركز التحليل على البنية: الوزن والإيقاع والمنظور والتكرار والخامة واللغة. المقارنة بين الأعمال تكشف اختيارات فنية مشتركة وفروقًا تاريخية، مع تجنب تحويل الأسلوب إلى معيار ثابت للحكم على ثقافة بأكملها.',
       'L’analyse examine rythme, perspective, répétition, matériau et langue. Comparer les œuvres révèle choix et écarts historiques, sans transformer un style en mesure universelle.',
       'Analysis examines rhythm, perspective, repetition, material, and language. Comparing works reveals artistic choices and historical differences without making one style a universal standard.']),
    reading(
      ['قد يفهم الناس العمل بطرق مختلفة، لكن التفسير الجيد يستند إلى تفاصيله وسياقه. شارك ما لاحظته واستمع لقراءات أخرى.',
       'Une œuvre peut susciter plusieurs lectures; une interprétation solide s’appuie sur ses détails et son contexte. Comparez les points de vue.',
       'People may interpret a work differently, but a strong reading uses evidence from the work and its context. Compare perspectives.'],
      ['تتعدد القراءات بتغير الجمهور والزمان، لكنها ليست اعتباطية: تُسند بالشواهد الشكلية والتاريخية والوثائقية. ينبغي التمييز بين وصف ما يظهر، وتأويله، والحكم عليه، ثم توضيح درجة اليقين والاختلاف بين الباحثين.',
       'Les lectures varient selon publics et époques, sans être arbitraires : elles s’appuient sur des indices formels et historiques. Distinguez description, interprétation et jugement.',
       'Interpretations vary across audiences and time, but are not arbitrary: they rely on formal and historical evidence. Separate description, interpretation, and judgment.']),
  ],
  religions: [
    reading(
      ['لكل دين نصوص وطرق في قراءتها. نتعلم كيف يفهم المؤمنون نصوصهم، ونميز ذلك عن دراسة تاريخها.',
       'Chaque religion possède des textes et des traditions de lecture. On distingue la foi vécue de l’étude historique des textes.',
       'Religions have texts and traditions of interpretation. Distinguish lived belief from historical study of texts.'],
      ['يبحث تاريخ الأديان في تكوين النصوص ونقلها ومناهج تفسيرها داخل جماعات متنوعة. يميز العرض الأكاديمي بين وصف المعتقد، وتحليل مصادره، والحكم الإيماني؛ كما يعترف بتعدد المدارس والممارسات داخل التقليد الواحد.',
       'L’histoire des religions étudie formation, transmission et interprétation des textes dans des communautés diverses. Elle distingue description, analyse des sources et jugement de foi.',
       'Historical study examines how texts formed, circulated, and were interpreted within diverse communities. It distinguishes description of belief, source analysis, and faith commitments.']),
    reading(
      ['تجمع الأماكن المقدسة بين الجغرافيا والذاكرة والعمارة والزيارة. تختلف قصصها ووظائفها من دين ومجتمع إلى آخر.',
       'Les lieux sacrés associent géographie, mémoire, architecture et pèlerinage. Leurs récits et usages varient selon les traditions.',
       'Sacred places connect geography, memory, architecture, and pilgrimage. Their meanings and uses vary across traditions.'],
      ['تُدرس المواقع المقدسة بوصفها أماكن مادية ورمزية تشكلها النصوص والعمارة والحج والسياسة والذاكرة. تغيّر السيطرة والزيارة والترميم معاني الموقع، وقد تختلف رواياته بين الجماعات؛ لذلك تُعرض المصادر وسياقاتها بوضوح.',
       'Les lieux sacrés sont matériels et symboliques, façonnés par textes, architecture, pèlerinage, politique et mémoire. Leurs récits peuvent varier entre communautés.',
       'Sacred sites are physical and symbolic places shaped by texts, architecture, pilgrimage, politics, and memory. Their histories may differ across communities and periods.']),
    reading(
      ['تتنوع التقاليد الدينية داخل كل دين. نتعرف إلى هذا التنوع باحترام، ومن دون رسم الأنبياء أو الشخصيات المقدسة.',
       'Les traditions religieuses sont diverses. On les présente avec respect, sans représenter les prophètes ni les figures sacrées.',
       'Religious traditions are internally diverse. We explore them respectfully without depicting prophets or sacred figures.'],
      ['يشمل التراث أعيادًا وفنونًا وعمارة وممارسات متباينة، ويُعاد تفسيره عبر الأجيال. ينبغي تمثيل هذا التنوع دون تعميم جماعة واحدة أو تسطيح الخلافات، مع صون الحساسية الدينية وعدم تجسيد الأنبياء.',
       'Le patrimoine comprend fêtes, arts, architecture et pratiques réinterprétés au fil des générations. Éviter les généralisations et respecter les sensibilités religieuses, sans représenter les prophètes.',
       'Heritage includes festivals, arts, architecture, and practices reinterpreted over time. Avoid generalizing one community and respect religious sensitivities without depicting prophets.']),
  ],
  technology: [
    reading(
      ['تحتاج الرسالة إلى إشارة يمكن إرسالها: صوت أو ضوء أو نبضة كهربائية. قد يغيّر التشويش ما يصل إلى المستقبل.',
       'Un message devient un signal transmissible : son, lumière ou impulsion électrique. Le bruit peut le modifier.',
       'A message must become a signal—sound, light, or an electrical pulse. Noise can change what the receiver gets.'],
      ['تتطلب منظومة الاتصال مصدرًا وترميزًا وقناة ومستقبلًا وفكًا للترميز. تحدد سعة القناة والضجيج والطاقة والبنية التحتية جودة النقل، وتستخدم البروتوكولات قواعد مشتركة لتقليل الالتباس.',
       'Un système de communication comporte source, codage, canal, récepteur et décodage. Capacité, bruit, énergie et protocoles déterminent la fiabilité du transfert.',
       'A communication system includes source, encoding, channel, receiver, and decoding. Capacity, noise, energy, and shared protocols shape reliability.']),
    reading(
      ['تتبع الخوارزمية خطوات محددة لمعالجة المعلومات. يعتمد الجواب على التعليمات والبيانات التي نعطيها للنظام.',
       'Un algorithme suit des étapes précises pour traiter l’information. Le résultat dépend des instructions et des données.',
       'An algorithm follows defined steps to process information. Its output depends on the instructions and data it receives.'],
      ['تحول الخوارزمية مدخلات إلى مخرجات عبر عمليات محددة، وقد تختلف الكلفة والدقة والانحياز بحسب البيانات والتصميم. في الذكاء الاصطناعي لا يساوي الأداء الجيد في مجموعة اختبار ضمانًا للسلامة أو الصلاحية في كل سياق.',
       'Un algorithme transforme des entrées en sorties. Coût, précision et biais dépendent des données et du modèle; une bonne performance de test ne garantit pas l’usage sûr dans chaque contexte.',
       'An algorithm maps inputs to outputs. Cost, accuracy, and bias depend on data and design; strong test performance does not guarantee safe use in every setting.']),
    reading(
      ['تربط الشبكات أجهزة بعيدة، وتتيح مشاركة المعرفة والعمل. لكن الوصول إليها يحتاج أجهزة وطاقة واتصالًا موثوقًا.',
       'Les réseaux relient des appareils distants et permettent échanges et apprentissage. Leur accès exige équipements, énergie et connexion fiable.',
       'Networks connect distant devices and enable shared learning and work. Access still requires equipment, power, and reliable connectivity.'],
      ['تتكون الأنظمة الرقمية من أجهزة وبرمجيات وكابلات ومراكز بيانات ومعايير ومؤسسات. تقاس آثارها بالطاقة والمواد والخصوصية والعمل وإتاحة الوصول، لا بسرعة الجهاز وحدها؛ كما تتوزع المنافع والمخاطر بين الفئات والمناطق.',
       'Les systèmes numériques associent matériel, logiciels, câbles, centres de données, normes et institutions. Leurs effets concernent énergie, matériaux, vie privée, travail et accès.',
       'Digital systems combine hardware, software, cables, data centers, standards, and institutions. Their impacts include energy, materials, privacy, labor, and access—not just speed.']),
  ],
  future: [
    reading(
      ['نبدأ بما يحدث الآن ونبحث عن مؤشرات يمكن ملاحظتها. بعض الاتجاهات واضحة، وأخرى ما زالت غير مؤكدة.',
       'On part du présent et d’indicateurs observables. Certaines tendances sont établies, d’autres restent incertaines.',
       'Start with the present and observable indicators. Some trends are clear; others remain uncertain.'],
      ['يبدأ الاستشراف بخط أساس ومؤشرات قابلة للرصد وتحديد الافتراضات. تُفصل البيانات المرصودة عن التوقعات، ويُذكر نطاق الزمن وعدم اليقين ومصادره؛ فالسيناريو ليس نبوءة ولا امتدادًا آليًا للماضي.',
       'La prospective définit un état de référence, des indicateurs et des hypothèses. Données, projections et incertitudes sont distinguées; un scénario n’est pas une prédiction certaine.',
       'Foresight establishes a baseline, indicators, and assumptions. Observations, projections, and uncertainty are separated; a scenario is not a certain prediction.']),
    reading(
      ['نرسم أكثر من احتمال للمستقبل، ونوضح ما الذي يجب أن يحدث في كل طريق. يمكن أن تساعدنا هذه القصص على الاستعداد.',
       'On explore plusieurs futurs possibles et les conditions de chacun. Ces scénarios aident à se préparer.',
       'Explore more than one possible future and state what conditions would lead to each. Scenarios can help us prepare.'],
      ['يبنى السيناريو من محركات تغيير وافتراضات مترابطة، ثم يختبر مدى اتساقها وآثارها. مقارنة سيناريوهات متعددة تكشف الخيارات ونقاط التحول، لكنها لا تعطي احتمالات دقيقة ما لم تدعمها نماذج وبيانات مناسبة.',
       'Un scénario combine facteurs et hypothèses, puis examine leur cohérence et leurs effets. La comparaison révèle des choix, sans fournir de probabilités exactes sans modèles adaptés.',
       'A scenario combines drivers and assumptions, then examines their coherence and effects. Comparing scenarios reveals choices but does not produce exact probabilities without suitable models.']),
    reading(
      ['تؤثر اختيارات الناس والمؤسسات في الطريق الذي نسلكه. يمكننا مراجعة الخطة حين تظهر معلومات جديدة.',
       'Les choix collectifs influencent les trajectoires. On peut réviser les décisions lorsque de nouvelles données apparaissent.',
       'People and institutions influence which path unfolds. Decisions can be revised when new evidence appears.'],
      ['تُقارن البدائل بحسب المنافع والمخاطر والإنصاف بين الأجيال والمناطق، مع رصد الآثار غير المقصودة. القرارات الأفضل لا تلغي عدم اليقين؛ بل تحدد مؤشرات مراجعة وخططًا قابلة للتكيف مع تطور الأدلة.',
       'Les options se comparent selon bénéfices, risques et équité entre générations et régions. Des indicateurs permettent de revoir les décisions face aux effets inattendus.',
       'Options are compared by benefits, risks, and equity across generations and regions. Monitoring indicators allow decisions to adapt when unexpected effects emerge.']),
  ],
}

const REFLECTIONS: Record<string, Reflection> = {
  space: { child:w('كيف نعرف أن الجسم البعيد نجم أم كوكب؟','Comment savoir si un astre lointain est une étoile ou une planète ?','How can we tell whether a distant object is a star or a planet?'), academic:w('أي مشاهدات طيفية أو حركية تسمح بتمييز النجم عن الكوكب، وما حدود كل طريقة رصد؟','Quelles observations spectrales ou orbitales distinguent une étoile d’une planète, et quelles sont les limites de chaque méthode ?','Which spectral or orbital observations distinguish a star from a planet, and what are the limits of each method?') },
  earth: { child:w('كيف تغيّر الجبال والأنهار طريقة عيش الناس في المكان؟','Comment montagnes et cours d’eau influencent-ils la vie des habitants ?','How do mountains and rivers shape how people live in a place?'), academic:w('كيف تتفاعل التضاريس والماء والمناخ في تشكيل الموطن والاستقرار، وما البيانات التي تثبت العلاقة؟','Comment relief, eau et climat interagissent-ils dans l’organisation des habitats et des peuplements, et quelles données étayent ce lien ?','How do relief, water, and climate interact to shape habitats and settlement, and what evidence supports the relationship?') },
  life: { child:w('ماذا يمكن أن يحدث إذا اختفى كائن واحد من الشبكة الغذائية؟','Que peut-il se passer si un organisme disparaît du réseau alimentaire ?','What might happen if one organism disappeared from a food web?'), academic:w('كيف يتغير استقرار الشبكة عند فقد نوع أو تغير وفرة نوع آخر، وكيف نميز أثره عن أثر عوامل البيئة؟','Comment la perte d’une espèce ou la variation d’une population affecte-t-elle le réseau, et comment distinguer cet effet de celui du milieu ?','How does species loss or population change affect a food web, and how can that effect be separated from environmental change?') },
  civilizations: { child:w('لماذا تنشأ مدن كثيرة قرب الماء وطرق التبادل؟','Pourquoi de nombreuses villes se développent-elles près de l’eau et des routes d’échange ?','Why do many cities grow near water and exchange routes?'), academic:w('كيف تتفاعل الموارد وشبكات التبادل والمؤسسات في نشوء المدن، وما الشواهد التي تسمح بمقارنة حضارات مختلفة؟','Comment ressources, échanges et institutions participent-ils à la formation des villes, et quels indices permettent de comparer différentes civilisations ?','How do resources, trade networks, and institutions shape cities, and what evidence supports comparisons between civilizations?') },
  science: { child:w('كيف نجعل تجربة صغيرة عادلة ونغيّر فيها عاملًا واحدًا؟','Comment rendre une petite expérience équitable en ne changeant qu’un facteur ?','How can we make a small experiment fair by changing only one factor?'), academic:w('ما الفرضية والمتغيرات والضوابط والقياس الذي يجعل النتيجة قابلة للتكرار، وما مصادر عدم اليقين؟','Quelle hypothèse, quelles variables, quels contrôles et quelles mesures rendent le résultat reproductible, et quelles incertitudes subsistent ?','What hypothesis, variables, controls, and measurements make a result reproducible, and what uncertainty remains?') },
  'human-history': { child:w('كيف تساعدنا رسالة أو قطعة أثرية على معرفة حياة الناس قديمًا؟','Comment une lettre ou un objet ancien nous renseigne-t-il sur la vie passée ?','How can a letter or an artifact tell us about people’s lives in the past?'), academic:w('كيف نقارن شهادة مكتوبة بأثر مادي ومصدر شفهي، ونفحص سياق إنتاج كل مصدر وانحيازاته؟','Comment confronter un écrit, une trace matérielle et un témoignage oral en examinant leur contexte et leurs biais ?','How can written, material, and oral evidence be compared while examining each source’s context and bias?') },
  arts: { child:w('ما التفصيل الذي تلاحظه أولًا في لوحة أو قصيدة أو لحن؟','Quel détail remarquez-vous d’abord dans une image, un poème ou une mélodie ?','What detail do you notice first in a painting, poem, or melody?'), academic:w('كيف تفصل بين وصف خصائص العمل وتأويلها، ثم تربط قراءتك بسياق الإنتاج والتلقي؟','Comment distinguer la description de l’œuvre de son interprétation, puis relier cette lecture à sa production et à sa réception ?','How do you distinguish a work’s observable features from interpretation, then connect that reading to its production and reception?') },
  religions: { child:w('كيف نفرّق بين ما يؤمن به الناس وبين دراسة تاريخ النصوص والأماكن؟','Comment distinguer les croyances vécues de l’étude historique des textes et des lieux ?','How can we distinguish lived belief from the historical study of texts and places?'), academic:w('كيف يميّز البحث بين وصف الاعتقاد وتحليل مصدره وتفسيره، مع احترام تعدد الجماعات والمدارس؟','Comment distinguer description d’une croyance, analyse de ses sources et interprétation, tout en respectant la diversité des communautés et des écoles ?','How can scholarship distinguish belief, source analysis, and interpretation while respecting diversity among communities and traditions?') },
  technology: { child:w('ما الذي يجعل أداة جديدة نافعة، وما المشكلة التي قد تسببها؟','Qu’est-ce qui rend une nouvelle technique utile, et quel problème peut-elle aussi créer ?','What makes a new technology useful, and what problem might it also create?'), academic:w('كيف نقوّم التقنية عبر الأداء والكلفة والطاقة والخصوصية وإتاحة الوصول، لا عبر ميزتها التقنية وحدها؟','Comment évaluer une technologie selon ses performances, son coût, son énergie, la vie privée et l’accès, au-delà de sa seule nouveauté ?','How should a technology be assessed across performance, cost, energy, privacy, and access—not novelty alone?') },
  future: { child:w('ما الفرق بين احتمال للمستقبل ووعد مؤكد؟','Quelle différence entre un futur possible et une promesse certaine ?','What is the difference between a possible future and a certain promise?'), academic:w('ما الافتراضات والمؤشرات التي تجعل السيناريو معقولًا، وما الأدلة التي قد تدفع إلى تعديله؟','Quelles hypothèses et quels indicateurs rendent un scénario plausible, et quelles preuves pourraient conduire à le réviser ?','Which assumptions and indicators make a scenario plausible, and what evidence could require revising it?') },
}

const REFLECTION_ANSWERS: Record<string, Reflection> = {
  space: { child:w('النجم يُصدر ضوءه وحرارته من داخله، أما الكوكب فلا يصنع ضوءًا مرئيًا مثل النجم، بل يعكس ضوءه. نعرف المزيد بقياس الضوء، ومتابعة حركة الجسم، والبحث عن دورانه حول نجم.','Une étoile produit sa propre lumière et sa chaleur. Une planète réfléchit la lumière d’une étoile. On les distingue aussi en mesurant leur lumière et leur mouvement autour d’un astre.','A star produces its own light and heat. A planet reflects a star’s light. We can also compare the object’s light and track its motion around a star.'), academic:w('تُظهر أطياف النجوم إشعاعًا صادرًا عن غلافها، بينما تُرصد الكواكب غالبًا بضوء منعكس أو بآثارها على ضوء النجم: العبور الدوري يخفض السطوع، والسرعة الشعاعية تكشف تمايل النجم بفعل الجاذبية. تساعد الكتلة واللمعان والطيف والحركة على التصنيف، مع بقاء حدود الرصد مهمة للأجرام البعيدة.','Le spectre stellaire révèle un rayonnement émis par l’étoile. Les planètes sont souvent détectées par lumière réfléchie ou par leurs effets : un transit périodique atténue l’étoile et la vitesse radiale mesure son mouvement gravitationnel. Masse, luminosité, spectre et orbite contribuent à l’identification, avec des limites instrumentales.','Stellar spectra reveal radiation emitted by the star. Planets are often detected through reflected light or their effects: periodic transits dim the star, while radial velocity detects its gravitational wobble. Mass, luminosity, spectrum, and orbit help classify an object, subject to observational limits.') },
  earth: { child:w('الماء يسهّل الشرب والزراعة والتنقل، والجبال قد تحمي مكانًا أو تجعل عبوره أصعب. لذلك ينظر الناس إلى شكل الأرض ومصادر الماء عند اختيار مكان السكن.','L’eau facilite la vie, l’agriculture et les déplacements. Les montagnes peuvent protéger un lieu ou rendre son accès difficile. Le relief et l’eau influencent donc les choix d’habitat.','Water supports drinking, farming, and travel. Mountains can protect a place or make it harder to reach. People consider landforms and water when choosing where to live.'), academic:w('تؤثر الأحواض المائية والانحدارات والمناخ في الزراعة والموارد والمخاطر وإمكان الاتصال. لكن الاستقرار لا يفسره الوسط الطبيعي وحده؛ فالتقنية والسياسة والتبادل والهجرة عوامل وسيطة، ويُختبر الترابط بمقارنة خرائط السكان والماء والتضاريس عبر الزمن.','Bassins, pentes et climat influencent agriculture, ressources, risques et mobilité. Mais l’environnement ne suffit pas à expliquer le peuplement : techniques, politiques, échanges et migrations interviennent. On confronte cartes et données à plusieurs périodes.','Watersheds, slopes, and climate affect farming, resources, hazards, and mobility. Environment alone does not explain settlement: technology, politics, exchange, and migration mediate it. Compare population, water, and terrain data over time.') },
  life: { child:w('إذا اختفى كائن، قد يقل غذاء كائنات أخرى أو تزداد كائنات كان يأكلها. تتغير الشبكة، لكن أثر ذلك يعتمد على نوع الكائن وبقية العلاقات.','Si une espèce disparaît, certains animaux peuvent perdre une source de nourriture et d’autres devenir plus nombreux. L’effet dépend des liens du réseau.','If one organism disappears, others may lose food while some may become more numerous. The effect depends on how the food web is connected.'), academic:w('قد يُحدث فقد النوع تغيرات متسلسلة في الوفرة والتنافس والتدفق الطاقي، لكن شدة الأثر تتوقف على موقع النوع ووجود بدائل وظروف النظام. يلزم فصل العلاقة السببية عن التزامن باستخدام الرصد والتجارب والنماذج، مع تحديد المقاييس المكانية والزمنية.','La perte d’une espèce peut modifier abondances, compétition et flux d’énergie. L’effet dépend de son rôle, des espèces redondantes et du contexte. Suivi, expériences et modèles aident à distinguer causalité et corrélation.','Species loss can alter abundance, competition, and energy flow. Its effect depends on the species’ role, redundancy, and context. Monitoring, experiments, and models help distinguish causation from correlation.') },
  civilizations: { child:w('قرب الماء يسهل الشرب والزراعة، والطرق تساعد الناس على تبادل الطعام والأفكار. لذلك كبرت مدن كثيرة في أماكن تجمع بين الماء وسهولة التنقل.','L’eau facilite la vie et l’agriculture, tandis que les routes favorisent les échanges. De nombreuses villes se sont développées là où ces avantages se rencontraient.','Water supports life and farming; routes help people exchange goods and ideas. Many cities grew where these advantages met.'), academic:w('قدّمت الأنهار والموانئ موارد ونقلًا، وربطت طرق التجارة المنتجين والأسواق. وتُظهر الآثار والكتابات ومخلفات الغذاء كيف تفاعلت البيئة والمؤسسات والتقنية؛ لا تكفي المجاورة وحدها لإثبات سبب نشوء المدينة.','Fleuves et ports ont fourni ressources et transport, tandis que les routes reliaient producteurs et marchés. Archéologie, écrits et restes alimentaires éclairent ces interactions; la proximité seule ne prouve pas une causalité.','Rivers and ports provided resources and transport, while trade routes linked producers and markets. Archaeology, texts, and food remains help reconstruct these interactions; proximity alone does not prove causation.') },
  science: { child:w('غيّر شيئًا واحدًا فقط، مثل نوع الورق، وأبقِ الأشياء الأخرى متشابهة. كرّر التجربة أكثر من مرة وسجّل ما حدث حتى تعرف هل كان الفرق بسبب ما غيّرته.','Ne changez qu’un facteur, comme le type de papier, et gardez les autres conditions semblables. Répétez et notez les résultats pour voir si le changement explique la différence.','Change only one factor, such as paper type, and keep the other conditions alike. Repeat and record the results to see whether that change explains the difference.'), academic:w('تُحدّد الفرضية والمتغير المستقل والتابع والعوامل المضبوطة مسبقًا، مع تكرار كافٍ وأداة قياس مناسبة. تُعرض البيانات والتشتت وحدود القياس، ويُعاد الإجراء كي يستطيع آخرون فحص النتيجة؛ فالضبط يقلل التفسيرات البديلة ولا يلغي كل عدم يقين.','Définissez hypothèse, variables, contrôles, répétitions et instruments avant l’essai. Présentez données, dispersion et incertitudes; la réplication permet l’examen indépendant. Le contrôle réduit les explications alternatives sans supprimer toute incertitude.','Specify the hypothesis, variables, controls, repetitions, and instruments in advance. Report data, variation, and uncertainty; replication enables independent scrutiny. Controls reduce alternative explanations but do not remove all uncertainty.') },
  'human-history': { child:w('تخبرنا القطعة الأثرية كيف صُنعت أو استُعملت، وقد تخبرنا الرسالة بما كتبه شخص. نسأل دائمًا: من صنعها؟ ومتى؟ وما الذي لا تخبرنا به؟','Un objet renseigne sur sa fabrication ou son usage; une lettre révèle ce qu’une personne a écrit. Demandons qui l’a produit, quand, et ce qu’il ne nous apprend pas.','An artifact can show how something was made or used; a letter records what someone wrote. Ask who made it, when, and what it cannot tell us.'), academic:w('يُفحص كل مصدر بسياقه وتاريخه وغرضه وجمهوره وما بقي منه. تُقارن المصادر المستقلة بحثًا عن التوافق والتعارض، مع الانتباه إلى أن الصمت في الأرشيف لا يعني غياب الفئات الأقل تمثيلًا.','Chaque source s’analyse selon sa date, son contexte, son objectif et son public. La confrontation de sources indépendantes révèle accords et divergences; le silence des archives ne signifie pas absence des groupes peu représentés.','Assess each source’s date, context, purpose, and audience. Comparing independent evidence exposes agreement and conflict; archival silence does not prove that underrepresented groups were absent.') },
  arts: { child:w('ابدأ بوصف ما تراه أو تسمعه، مثل لون أو إيقاع. ثم أخبرنا بما جعلك تشعر به، وميّز بين ما لاحظته وما تخيلته.','Décrivez d’abord une couleur ou un rythme, puis dites ce que cela vous fait ressentir. Distinguez ce que vous observez de ce que vous imaginez.','First describe a color or rhythm, then say how it makes you feel. Separate what you observe from what you imagine.'), academic:w('يبدأ التحليل بوصف السمات الشكلية، ثم يبني تأويلًا معللًا يربط الشكل بالسياق التاريخي والاجتماعي وبطرق التلقي. يمكن تعدد التأويلات، لكن ينبغي أن تستند إلى شواهد من العمل ومصادر موثوقة.','L’analyse décrit d’abord les formes, puis propose une interprétation argumentée liée au contexte et à la réception. Plusieurs lectures sont possibles, mais elles doivent s’appuyer sur l’œuvre et des sources fiables.','Analysis first describes formal features, then offers an interpretation grounded in historical context and reception. Multiple readings are possible, but they should cite evidence from the work and reliable sources.') },
  religions: { child:w('الإيمان هو ما يعتقده الناس ويتعبدون به. أما دراسة التاريخ فتسأل متى كُتب النص وكيف عاشت الجماعات في أزمنة مختلفة. نتحدث باحترام ونوضح الفرق بينهما.','La foi correspond aux croyances et pratiques des personnes. L’étude historique demande quand les textes ont été écrits et comment les communautés ont vécu. Les deux approches se distinguent et se respectent.','Faith concerns people’s beliefs and practices. Historical study asks when texts were written and how communities lived. These approaches are distinct and should be discussed respectfully.'), academic:w('يحدد الباحث نطاق السؤال ومنهجه: وصف العقيدة من داخل التقليد يختلف عن تحليل التاريخ النصي أو الممارسة الاجتماعية. تُنسب الآراء إلى مصادرها ومدارسها، ويُميّز بين الوقائع الموثقة والتفسير اللاهوتي مع احترام التنوع الداخلي.','Le chercheur précise question et méthode : décrire une doctrine dans sa tradition diffère d’analyser l’histoire textuelle ou les pratiques sociales. Les positions sont attribuées à leurs sources et écoles, en distinguant faits et interprétations théologiques.','Researchers specify question and method: describing a doctrine within its tradition differs from analyzing textual history or social practice. Views are attributed to sources and schools, distinguishing documented history from theological interpretation.') },
  technology: { child:w('الأداة النافعة تحل مشكلة حقيقية بأمان، مثل تسهيل التواصل. لكن علينا أيضًا أن نسأل: هل تعمل للجميع؟ وهل تحمي معلوماتنا؟','Une technologie utile répond à un besoin réel et sans danger. Demandons aussi si elle est accessible à tous et si elle protège nos données.','A useful technology solves a real problem safely. We should also ask whether it works for everyone and protects our information.'), academic:w('يُقاس نفع التقنية بأداء قابل للتكرار، وتكلفة دورة الحياة، والطاقة والمواد، وإتاحة الوصول، والخصوصية، والآثار الاجتماعية. تقارن هذه المعايير بخط أساس واضح، وتُعلن المفاضلات بدل اختزال التقييم في الجدة أو السرعة.','Évaluez performance reproductible, coût du cycle de vie, énergie, matériaux, accessibilité, vie privée et effets sociaux par rapport à une référence claire. Rendez visibles les compromis au lieu de réduire l’évaluation à la nouveauté.','Assess reproducible performance, lifecycle cost, energy, materials, accessibility, privacy, and social effects against a clear baseline. Make trade-offs visible instead of equating novelty with value.') },
  future: { child:w('الاحتمال فكرة قد تحدث إذا توافرت شروط، أما الوعد المؤكد فيقول إنها ستحدث حتمًا. نبحث عن دليل ونسأل ما الذي قد يغير التوقع.','Une possibilité peut se réaliser si certaines conditions sont réunies. Une certitude promet qu’elle arrivera. Cherchons les preuves et ce qui pourrait changer la prévision.','A possibility may happen if conditions are met. A certainty promises it will happen. Look for evidence and ask what could change the forecast.'), academic:w('يُبنى السيناريو على افتراضات معلنة ومحركات تغيير ومؤشرات يمكن متابعتها، لا على استقراء خطي وحده. تُقارن سيناريوهات متعددة ويُختبر حساسيتها، ثم تُراجع عند ظهور بيانات أو سياسات جديدة؛ ولا يمثل السيناريو تنبؤًا مؤكدًا.','Un scénario explicite hypothèses, facteurs de changement et indicateurs observables. On compare plusieurs trajectoires et teste leur sensibilité; de nouvelles données imposent parfois une révision. Un scénario n’est pas une prédiction certaine.','A scenario states assumptions, drivers, and observable indicators. Compare alternatives and test sensitivity; new data may require revision. A scenario is not a certain prediction.') },
}

export default function BranchDiscovery({id,lang,academic,title}:{id:string;lang:Lang;academic:boolean;title:Copy}){
 const [step,setStep]=useState(0)
 const tabs=useRef<Array<HTMLButtonElement|null>>([])
 useEffect(()=>{setStep(0)},[id,lang,academic])
 const topics=TOPICS[id], readings=READINGS[id]
 if(!topics||!readings)return null
 const languageIndex=lang==='ar'?0:lang==='fr'?1:2
 const audience=academic?'academic':'kids'
 const image=publicUrl(`assets/img/journey-discovery-${id}-${audience}-v1.jpg`)
 const rtl=lang==='ar'
 const lensPosition=rtl?[82,50,18]:[18,50,82]
 const lensZoom=[0,50,100]
 const select=(i:number)=>setStep(i)
 const selectAtScene=(event:React.MouseEvent<HTMLDivElement>)=>{
  const bounds=event.currentTarget.getBoundingClientRect()
  const physicalX=Math.max(0,Math.min(.999,(event.clientX-bounds.left)/bounds.width))
  const learningX=rtl?1-physicalX:physicalX
  select(Math.floor(learningX*topics.length))
 }
 const selectByKey=(event:React.KeyboardEvent<HTMLElement>)=>{
  const forward=rtl?'ArrowLeft':'ArrowRight',backward=rtl?'ArrowRight':'ArrowLeft'
  if(event.key==='Home'||event.key==='End'||event.key===forward||event.key===backward){
   event.preventDefault()
   const next=event.key==='Home'?0:event.key==='End'?topics.length-1:(step+(event.key===forward?1:-1)+topics.length)%topics.length
   select(next);tabs.current[next]?.focus()
  }
 }
 const reading=readings[step][academic?'academic':'child']
 const reflection=REFLECTIONS[id]
 return <section dir={rtl?'rtl':'ltr'} className={`branch-discovery ${rtl?'branch-rtl':'branch-ltr'} branch-scene-${id} ${academic?'branch-academic':'branch-kids'}`}>
  <header><span>{lang==='ar'?'استكشاف بصري تفاعلي':lang==='fr'?'Exploration visuelle interactive':'Interactive visual exploration'}</span><h3>{title[lang]}</h3></header>
  <nav className="branch-step-list" role="tablist" aria-orientation="horizontal" aria-label={lang==='ar'?'مراحل الاستكشاف':lang==='fr'?'Étapes de découverte':'Discovery stages'}>{topics.map((topic,i)=><button key={topic[2]} ref={node=>{tabs.current[i]=node}} id={`branch-tab-${id}-${i}`} type="button" role="tab" aria-selected={step===i} aria-controls={`branch-panel-${id}`} tabIndex={step===i?0:-1} className={step===i?'active':''} onClick={()=>select(i)} onKeyDown={selectByKey}><span className="branch-step-number">{String(i+1).padStart(2,'0')}</span><span className="branch-step-title">{topic[languageIndex]}</span><span className="branch-step-state">{step===i?(lang==='ar'?'المشهد الحالي':lang==='fr'?'Étape actuelle':'Current scene'):(lang==='ar'?'انتقل إلى المشهد':lang==='fr'?'Voir cette étape':'View this scene')}</span></button>)}</nav>
  <div className="branch-lens-scene" id={`branch-panel-${id}`} role="tabpanel" aria-labelledby={`branch-tab-${id}-${step}`} aria-live="polite" tabIndex={0} onKeyDown={selectByKey} onClick={selectAtScene} aria-label={lang==='ar'?'انقر على جزء من الصورة أو استخدم الأسهم للتنقل بين المحطات':lang==='fr'?'Cliquez sur l’image ou utilisez les flèches pour parcourir les étapes':'Click the image or use arrow keys to move between stages'}>
   <div className="branch-discovery-panorama"><img src={image} alt={topics[step][languageIndex]} loading="lazy" decoding="async"/></div>
   <span className="branch-lens-caption">{lang==='ar'?'انقر على المشهد أو استخدم الأسهم لتحريك عدسة قلم':lang==='fr'?'Cliquez sur la scène ou utilisez les flèches pour déplacer la lentille':'Click the scene or use arrow keys to move the Qalam lens'}</span>
   <div className="branch-lens" style={{'--lens-position':`${lensPosition[step]}%`} as React.CSSProperties} aria-hidden="true"><div className="branch-lens-glass" style={{backgroundImage:`url("${image}")`,backgroundPosition:`${lensZoom[step]}% 50%`}}/><span className="branch-lens-glint"/></div>
  </div>
  <article className="branch-reading" key={`${id}-${step}-${audience}-${lang}`}><div className="branch-reading-index">{lang==='ar'?`المحطة ${step+1} من 3`:lang==='fr'?`Étape ${step+1} sur 3`:`Stage ${step+1} of 3`}</div><h4>{topics[step][languageIndex]}</h4><p>{reading[lang]}</p></article>
  {reflection&&<aside className="branch-reflection"><span>{lang==='ar'?'انقل الفكرة إلى سؤال جديد':lang==='fr'?'Transférer l’idée à une nouvelle question':'Take the idea further'}</span><h4>{lang==='ar'?'فكّر واستكشف':lang==='fr'?'Réfléchir et explorer':'Think and explore'}</h4><p>{reflection[academic?'academic':'child'][lang]}</p><details><summary>{lang==='ar'?'كيف أبني إجابة جيدة؟':lang==='fr'?'Comment construire une réponse ?':'How can I build a strong answer?'}</summary><p>{academic?(lang==='ar'?'حدّد المفاهيم والدليل المناسب، وبيّن ما لا تسمح المعطيات باستنتاجه.':lang==='fr'?'Définissez les concepts, mobilisez des preuves pertinentes et précisez ce que les données ne permettent pas de conclure.':'Define the concepts, identify relevant evidence, and state what the data cannot establish.'):(lang==='ar'?'ابدأ بما تلاحظه، ثم اربطه بما تعلمته، واذكر مثالًا من المشهد.':lang==='fr'?'Commencez par une observation, reliez-la à ce que vous avez appris et donnez un exemple de la scène.':'Start with an observation, connect it to what you learned, and give an example of the scene.')}</p></details>{REFLECTION_ANSWERS[id]&&<details className="branch-answer"><summary>{lang==='ar'?'اكشف إجابة مشروحة':lang==='fr'?'Voir une réponse expliquée':'Reveal an explained answer'}</summary><p>{REFLECTION_ANSWERS[id][academic?'academic':'child'][lang]}</p></details>}</aside>}
 </section>
}
