import type { HistoryData } from './historyTypes'
export const MATHEMATICS_HISTORY:HistoryData={
  "id": "mathematics",
  "title": {
    "ar": "تاريخ الرياضيات",
    "fr": "Histoire des mathématiques",
    "en": "History of mathematics"
  },
  "intro": {
    "ar": "من العد والقياس إلى البرهان والحوسبة: أفكار تبني بعضها فوق بعض، عبر ثقافات متعددة.",
    "fr": "Du nombre au calcul et à la preuve : des idées construites entre plusieurs cultures.",
    "en": "From counting and measurement to proof and computation: ideas built across cultures."
  },
  "regions": [],
  "onlyTimeline": true,
  "sources": {
    "math": {
      "name": "University of St Andrews · MacTutor history of mathematics",
      "url": "https://mathshistory.st-andrews.ac.uk/"
    },
    "zero": {
      "name": "MacTutor · Brahmagupta",
      "url": "https://mathshistory.st-andrews.ac.uk/Biographies/Brahmagupta/"
    },
    "lavoisier": {
      "name": "American Chemical Society · Lavoisier",
      "url": "https://www.acs.org/education/whatischemistry/landmarks/lavoisier.html"
    },
    "periodic": {
      "name": "Royal Society of Chemistry · Development of the periodic table",
      "url": "https://periodic-table.rsc.org/about"
    },
    "green": {
      "name": "American Chemical Society · Green chemistry principles",
      "url": "https://www.acs.org/green-chemistry-sustainability/principles/12-principles-of-green-chemistry.html"
    },
    "optics": {
      "name": "UNESCO · Ibn al-Haytham and the history of optics",
      "url": "https://www.unesco.org/en/articles/ibn-al-haythams-scientific-method"
    },
    "physics": {
      "name": "American Institute of Physics · History",
      "url": "https://history.aip.org/"
    },
    "higgs": {
      "name": "CERN · The Higgs boson",
      "url": "https://home.cern/science/physics/higgs-boson"
    },
    "ligo": {
      "name": "LIGO · First detection of gravitational waves",
      "url": "https://www.ligo.caltech.edu/news/ligo20160211"
    }
  },
  "events": [
    {
      "id": "counts",
      "year": -1800,
      "date": {
        "ar": "نحو 1800 ق.م.",
        "fr": "Vers 1800 av. n.è.",
        "en": "Around 1800 BCE"
      },
      "title": {
        "ar": "حين أصبح العدد كتابة",
        "fr": "Quand le nombre devient écriture",
        "en": "When numbers became writing"
      },
      "child": {
        "ar": "سجّل كتّاب في بلاد الرافدين ومصر كميات الحبوب ومساحات الأرض. جرّب تقسيم مستطيل إلى مربعات: أنت تقيس كما فعل الناس قديمًا.",
        "fr": "En Mésopotamie et en Égypte, des scribes comptent récoltes et surfaces. Partage un rectangle en carrés : tu mesures à ton tour.",
        "en": "Scribes in Mesopotamia and Egypt recorded grain and land areas. Divide a rectangle into squares: you are measuring too."
      },
      "adult": {
        "ar": "تكشف الألواح البابلية والبرديات المصرية عن حسابات للمقادير والمساحات ومسائل تدريبية. استعملت التقاليد البابلية نظامًا ستينيًا ذا قيمة موضعية، بينما اختلفت طرائق الكتابة والحساب المصرية. هذه شواهد مكتوبة محفوظة وليست بداية العد لدى البشر؛ فقد سبقتها ممارسات لا نملك عنها السجل نفسه.",
        "fr": "Tablettes babyloniennes et papyrus égyptiens documentent mesures et problèmes. Les traditions babyloniennes utilisent une numération positionnelle sexagésimale ; les procédés égyptiens diffèrent. Ces traces conservées ne marquent pas le commencement du comptage humain.",
        "en": "Babylonian tablets and Egyptian papyri document measurement and training problems. Babylonian traditions used sexagesimal place value; Egyptian notation and procedures differed. These surviving records are evidence of written mathematics, not the beginning of human counting."
      },
      "refs": [
        "math"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-mathematics-counts"
    },
    {
      "id": "proof",
      "year": -300,
      "date": {
        "ar": "نحو 300 ق.م.",
        "fr": "Vers 300 av. n.è.",
        "en": "Around 300 BCE"
      },
      "title": {
        "ar": "لماذا تكون القاعدة صحيحة؟",
        "fr": "Pourquoi une règle est-elle vraie ?",
        "en": "Why is a rule true?"
      },
      "child": {
        "ar": "جمع إقليدس أفكارًا هندسية في سلسلة من البراهين. رسم مثلث قد يقنع العين؛ البرهان يشرح لماذا تنطبق النتيجة على كل مثلث تنطبق عليه الشروط.",
        "fr": "Euclide organise des démonstrations géométriques. Un dessin aide ; une preuve explique pourquoi le résultat vaut sous certaines conditions.",
        "en": "Euclid organized geometric proofs. A drawing helps us see; a proof explains why a result holds whenever its conditions hold."
      },
      "adult": {
        "ar": "نظمت العناصر التعريفات والمسلّمات والنتائج في بناء استدلالي مؤثر، دون أن تكون الهندسة اختراع فرد واحد. ينبغي فصل البرهان عن القياس التجريبي: توافق أطوال رسم واحد لا يثبت قضية عامة. وتتيح مقارنة تقاليد الهندسة والحساب، ومنها الصينية، فهم تنوع طرائق حل المسائل وتنظيم المعرفة.",
        "fr": "Les Éléments organisent définitions, postulats et propositions ; la géométrie n’est pas l’invention d’un seul auteur. Mesurer une figure ne démontre pas une proposition générale. La comparaison avec d’autres traditions, notamment chinoises, montre la diversité des méthodes et des formes de justification.",
        "en": "The Elements organized definitions, postulates, and propositions; geometry was not one person’s invention. Measuring one drawing cannot prove a general proposition. Comparing other traditions, including Chinese mathematics, reveals different methods of calculation and justification."
      },
      "refs": [
        "math"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-mathematics-proof"
    },
    {
      "id": "zero",
      "year": 628,
      "date": {
        "ar": "628 م",
        "fr": "628",
        "en": "628 CE"
      },
      "title": {
        "ar": "الصفر ليس فراغًا في الفكرة",
        "fr": "Le zéro est une idée",
        "en": "Zero is an idea"
      },
      "child": {
        "ar": "في العدد 205 يحفظ الصفر مكان العشرات. كتب براهماغوبتا قواعد للحساب بالصفر والأعداد السالبة. لكن القسمة على صفر ليست عملية مسموحة في الحساب المعتاد.",
        "fr": "Dans 205, le zéro garde la place des dizaines. Brahmagupta étudie zéro et nombres négatifs ; diviser par zéro reste impossible en calcul ordinaire.",
        "en": "In 205, zero holds the tens place. Brahmagupta studied zero and negative numbers; division by zero is undefined in ordinary arithmetic."
      },
      "adult": {
        "ar": "في سنة 628 تناول براهماغوبتا الصفر ضمن قواعد حسابية في تقليد هندي أوسع. يختلف الصفر بوصفه حافظ مكان عن معاملته عددًا له عمليات. بعض قواعد القسمة التاريخية لا توافق الصياغة الحديثة؛ لذلك لا ننقل كل قاعدة قديمة بوصفها صحيحة اليوم. وانتقلت طرائق الترقيم عبر الترجمات والتجارة والتعليم وتبدلت رموزها.",
        "fr": "En 628, Brahmagupta formule des règles sur le zéro dans une tradition indienne plus vaste. Le zéro de position et le zéro comme nombre ne sont pas identiques historiquement. Certaines règles anciennes de division ne sont pas valables aujourd’hui ; traductions et échanges ont ensuite diffusé et transformé les notations.",
        "en": "In 628 Brahmagupta formulated rules for zero within a wider Indian tradition. A placeholder and zero treated as a number are historically distinct. Some historical division rules do not match modern arithmetic. Translation, commerce, and teaching later spread and transformed numeral systems."
      },
      "refs": [
        "zero",
        "math"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-mathematics-zero"
    },
    {
      "id": "algebra",
      "year": 820,
      "date": {
        "ar": "القرن التاسع",
        "fr": "IXe siècle",
        "en": "Ninth century"
      },
      "title": {
        "ar": "المجهول يصبح قابلًا للحساب",
        "fr": "Calculer une inconnue",
        "en": "Calculating an unknown"
      },
      "child": {
        "ar": "نريد معرفة طول مجهول من معلومات نعرفها. نظّم الخوارزمي طرائق لحل مسائل من هذا النوع. الجبر يربط كميات، ثم يساعدنا على العثور على المجهول.",
        "fr": "Al-Khwarizmi organise des méthodes pour trouver des quantités inconnues. L’algèbre relie ce que nous savons à ce que nous cherchons.",
        "en": "Al-Khwarizmi organized methods for finding unknown quantities. Algebra links what we know to what we want to find."
      },
      "adult": {
        "ar": "نظم كتاب الجبر والمقابلة مسائل المعادلات بصياغة لفظية وأمثلة عملية وبراهين هندسية، قبل الرمزية الجبرية الحديثة. نشأ العمل في بيئة علمية متعددة اللغات في بغداد وتفاعل مع معارف أقدم. ارتبط اسم الخوارزمي لاحقًا بمصطلح الخوارزمية، لكن الإجراءات الحسابية تسبقه ولا يصح نسبتها جميعًا إليه.",
        "fr": "Le traité d’algèbre expose verbalement des équations et leurs justifications géométriques, avant la notation symbolique moderne. Il appartient au milieu savant multilingue de Bagdad et s’appuie sur des savoirs antérieurs. Le mot algorithme dérive du nom d’Al-Khwarizmi, sans faire de lui l’inventeur de toute procédure de calcul.",
        "en": "The algebra treatise expressed equations verbally and justified procedures geometrically, before modern symbolic notation. It belonged to multilingual scholarship in Baghdad and drew on earlier knowledge. The word algorithm derives from Al-Khwarizmi’s name, but computational procedures existed long before him."
      },
      "refs": [
        "math"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-mathematics-algebra"
    },
    {
      "id": "calculus",
      "year": 1680,
      "date": {
        "ar": "القرن السابع عشر",
        "fr": "XVIIe siècle",
        "en": "Seventeenth century"
      },
      "title": {
        "ar": "حساب التغير والتراكم",
        "fr": "Calculer variation et accumulation",
        "en": "Calculating change and accumulation"
      },
      "child": {
        "ar": "السرعة تخبرنا كيف تتغير المسافة، والمساحة تحت منحنى السرعة تساعد على حساب المسافة. طوّر نيوتن ولايبنتس أدوات لهذا النوع من الأسئلة.",
        "fr": "La vitesse décrit la variation d’une distance ; l’aire sous sa courbe permet de retrouver une distance. Newton et Leibniz développent ces outils.",
        "en": "Speed describes how distance changes; the area under a speed graph helps recover distance. Newton and Leibniz developed tools for these questions."
      },
      "adult": {
        "ar": "بنى نيوتن ولايبنتس حساب التفاضل والتكامل على أعمال سابقة في المماسات والمساحات والمتسلسلات. تربط النظرية الأساسية بين الاشتقاق والتكامل ضمن شروط محددة، ثم صيغت مفاهيم النهاية والاستمرارية بدقة أكبر في القرون التالية. استفادت الميكانيكا والفلك من هذه اللغة، ولم يكن انتقالها من الحدس إلى الصرامة حدثًا واحدًا.",
        "fr": "Newton et Leibniz prolongent les recherches sur tangentes, aires et séries. Le théorème fondamental relie dérivation et intégration sous des hypothèses précises. Les notions de limite et de continuité seront affinées ensuite : l’efficacité en mécanique a précédé certaines formalisations rigoureuses.",
        "en": "Newton and Leibniz built on earlier work on tangents, areas, and series. The fundamental theorem connects differentiation and integration under stated conditions. Limits and continuity were later formalized more rigorously; usefulness in mechanics preceded some of that foundational work."
      },
      "refs": [
        "math"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-mathematics-calculus"
    },
    {
      "id": "computing",
      "year": 1936,
      "date": {
        "ar": "القرنان العشرون والحادي والعشرون",
        "fr": "XXe–XXIe siècles",
        "en": "Twentieth–twenty-first centuries"
      },
      "title": {
        "ar": "من البنية إلى الحاسوب",
        "fr": "Des structures aux ordinateurs",
        "en": "From structures to computers"
      },
      "child": {
        "ar": "الخوارزمية خطوات واضحة لحل مسألة. يستطيع الحاسوب تنفيذ خطوات كثيرة، لكن جوابًا سريعًا ليس دائمًا جوابًا صحيحًا: نختبر ونشرح ونتحقق.",
        "fr": "Un algorithme suit des étapes précises. Un ordinateur va vite, mais sa réponse doit être testée et expliquée.",
        "en": "An algorithm follows precise steps. Computers work quickly, but their answers still need testing and explanation."
      },
      "adult": {
        "ar": "وسعت الرياضيات الحديثة دراسة البنى والاحتمال والمنطق. ساعدت أعمال إيمي نويثر على تطوير الجبر المجرد، وقدمت أعمال تورنغ سنة 1936 نموذجًا للحساب وحدودًا لما يمكن إجراؤه خوارزميًا. تختلف المحاكاة العددية والتخمين الذي تنتجه أداة ذكاء اصطناعي عن البرهان؛ وقد تساعد أدوات التحقق الصوري على فحص خطوات ضمن نظام منطقي محدد.",
        "fr": "Algèbre abstraite, probabilités et logique élargissent le domaine. Emmy Noether transforme l’étude des structures ; Turing propose en 1936 un modèle du calcul et de ses limites. Simulation numérique, conjecture produite par IA et démonstration sont distinctes. Les assistants de preuve vérifient des étapes dans un cadre logique explicite.",
        "en": "Abstract algebra, probability, and logic expanded the subject. Emmy Noether transformed the study of algebraic structures; Turing’s 1936 work modeled computation and its limits. Numerical simulation and an AI-generated conjecture differ from proof. Formal proof assistants check steps within an explicit logical framework."
      },
      "refs": [
        "math"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-mathematics-computing"
    }
  ]
}
export const CHEMISTRY_HISTORY:HistoryData={
  "id": "chemistry",
  "title": {
    "ar": "تاريخ الكيمياء",
    "fr": "Histoire de la chimie",
    "en": "History of chemistry"
  },
  "intro": {
    "ar": "من تحويل المواد بالنار إلى تفسير الذرات وتصميم مواد أقل أثرًا على البيئة.",
    "fr": "Des transformations par le feu à l’étude des atomes et à la conception de matériaux moins polluants.",
    "en": "From transforming materials with heat to understanding atoms and designing lower-impact materials."
  },
  "regions": [],
  "onlyTimeline": true,
  "sources": {
    "math": {
      "name": "University of St Andrews · MacTutor history of mathematics",
      "url": "https://mathshistory.st-andrews.ac.uk/"
    },
    "zero": {
      "name": "MacTutor · Brahmagupta",
      "url": "https://mathshistory.st-andrews.ac.uk/Biographies/Brahmagupta/"
    },
    "lavoisier": {
      "name": "American Chemical Society · Lavoisier",
      "url": "https://www.acs.org/education/whatischemistry/landmarks/lavoisier.html"
    },
    "periodic": {
      "name": "Royal Society of Chemistry · Development of the periodic table",
      "url": "https://periodic-table.rsc.org/about"
    },
    "green": {
      "name": "American Chemical Society · Green chemistry principles",
      "url": "https://www.acs.org/green-chemistry-sustainability/principles/12-principles-of-green-chemistry.html"
    },
    "optics": {
      "name": "UNESCO · Ibn al-Haytham and the history of optics",
      "url": "https://www.unesco.org/en/articles/ibn-al-haythams-scientific-method"
    },
    "physics": {
      "name": "American Institute of Physics · History",
      "url": "https://history.aip.org/"
    },
    "higgs": {
      "name": "CERN · The Higgs boson",
      "url": "https://home.cern/science/physics/higgs-boson"
    },
    "ligo": {
      "name": "LIGO · First detection of gravitational waves",
      "url": "https://www.ligo.caltech.edu/news/ligo20160211"
    }
  },
  "events": [
    {
      "id": "materials",
      "year": -3000,
      "date": {
        "ar": "الألفيات القديمة",
        "fr": "Millénaires anciens",
        "en": "Ancient millennia"
      },
      "title": {
        "ar": "النار تغيّر المادة",
        "fr": "Le feu transforme la matière",
        "en": "Heat transforms matter"
      },
      "child": {
        "ar": "يصير الطين فخارًا، ويستخرج الناس معادن من خامات. نتعلم أن بعض التغيرات تصنع مادة بخصائص جديدة، ولا نجرب الأفران أو المواد الخطرة وحدنا.",
        "fr": "Argile cuite et métaux montrent que transformer une matière peut changer ses propriétés. Ces procédés exigent des adultes et des équipements adaptés.",
        "en": "Fired clay and extracted metals show that processing matter changes its properties. These processes need trained adults and suitable equipment."
      },
      "adult": {
        "ar": "نشأت تقنيات الفخار والزجاج والصباغة والتعدين في أزمنة وبيئات متعددة. سبقت الخبرة العملية تفسير الروابط والذرات بآلاف السنين، ولا يساوي نجاح الصنعة امتلاك نظرية كيميائية حديثة. تساعد الآثار وتحليل المواد على إعادة بناء درجات الحرارة والموارد وشبكات التبادل مع بقاء حدود في تفسير نية الصانع.",
        "fr": "Céramique, verre, teintures et métallurgie se développent dans plusieurs régions. Le savoir-faire précède de beaucoup les théories atomiques modernes. L’analyse des vestiges éclaire températures, ressources et échanges, sans permettre de reconstruire avec certitude toutes les intentions des artisans.",
        "en": "Ceramics, glass, dyes, and metallurgy developed across several regions. Practical expertise long preceded modern atomic and bonding theories. Material analysis helps reconstruct temperatures, resources, and exchange networks, while leaving limits on what we can infer about craftspeople’s intentions."
      },
      "refs": [
        "lavoisier"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-chemistry-materials"
    },
    {
      "id": "alchemy",
      "year": 900,
      "date": {
        "ar": "القرون الوسطى",
        "fr": "Moyen Âge",
        "en": "Medieval period"
      },
      "title": {
        "ar": "الأدوات والوصفات تتراكم",
        "fr": "Outils et procédés s’accumulent",
        "en": "Tools and procedures accumulate"
      },
      "child": {
        "ar": "استعمل الباحثون التقطير والترشيح لفصل مواد. تناقلت الكتب معارف وتجارب بين لغات ومدن؛ بعض الأفكار صححها العلم لاحقًا.",
        "fr": "Distillation et filtration séparent des matières. Les livres transmettent des procédés entre villes et langues ; certaines théories seront corrigées.",
        "en": "Distillation and filtration separate materials. Books carried procedures between cities and languages; later science corrected some theories."
      },
      "adult": {
        "ar": "جمعت تقاليد الخيمياء معارف صيدلانية ومعدنية وتفسيرات فلسفية لا تتطابق مع الكيمياء الحديثة. حفظت نصوص عربية ولاتينية أوصافًا للتقطير والتسامي وأدوات العمل. وتتطلب نسبة المجموعات المنسوبة إلى جابر بن حيان حذرًا، لأن تاريخ التأليف وهوية المؤلفين موضع بحث، فلا تُختزل قرون من العمل في مخترع واحد.",
        "fr": "Les traditions alchimiques mêlent pharmacie, métallurgie et théories philosophiques distinctes de la chimie actuelle. Des textes arabes et latins décrivent distillation et sublimation. L’attribution du corpus dit de Jabir reste discutée ; des siècles de pratiques ne doivent pas être réduits à un inventeur unique.",
        "en": "Alchemical traditions combined pharmacy, metallurgy, and philosophical explanations unlike modern chemistry. Arabic and Latin texts described distillation and sublimation. Attribution of the Jabirian corpus remains debated; centuries of practice cannot be reduced to a single inventor."
      },
      "refs": [
        "lavoisier"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-chemistry-alchemy"
    },
    {
      "id": "measurement",
      "year": 1789,
      "date": {
        "ar": "القرنان السابع عشر والثامن عشر",
        "fr": "XVIIe–XVIIIe siècles",
        "en": "Seventeenth–eighteenth centuries"
      },
      "title": {
        "ar": "الميزان يحسم السؤال",
        "fr": "La balance tranche une question",
        "en": "The balance tests an explanation"
      },
      "child": {
        "ar": "إذا غيّرنا مواد داخل وعاء مغلق ووزنّاه قبل التغير وبعده، نقارن الكتلة. ساعد القياس لافوازييه وغيره على فهم الاحتراق بطريقة أدق.",
        "fr": "Peser un système fermé avant et après une réaction permet de comparer sa masse. Lavoisier et d’autres utilisent la mesure pour mieux expliquer la combustion.",
        "en": "Weighing a closed system before and after a reaction lets us compare mass. Lavoisier and others used measurement to explain combustion more accurately."
      },
      "adult": {
        "ar": "ساهم بويل في نقد تصورات المواد، ثم جعل لافوازييه القياس الكمي وتفسير الاحتراق بالأكسجين محورًا لإعادة تنظيم الكيمياء. في التفاعل الكيميائي العادي داخل نظام مغلق تُحفظ الكتلة إلى الدقة المعتادة، أما خروج الغاز فيوهم بنقصها. تغيير المصطلحات وأدوات الوزن وشبكات التعاون كان جزءًا من التحول، لا تجربة منفردة.",
        "fr": "Boyle critique certaines conceptions de la matière ; Lavoisier privilégie mesure quantitative et rôle de l’oxygène dans la combustion. Pour une réaction chimique ordinaire en système fermé, la masse se conserve à la précision habituelle. Une fuite de gaz fausse l’interprétation. Instruments, nomenclature et collaboration participent au changement.",
        "en": "Boyle criticized prevailing accounts of matter; Lavoisier emphasized quantitative measurement and oxygen’s role in combustion. In ordinary chemical reactions in a closed system, mass is conserved to usual measurement precision. Escaping gas can mislead the observer. Instruments, nomenclature, and collaboration all mattered."
      },
      "refs": [
        "lavoisier"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-chemistry-measurement"
    },
    {
      "id": "periodic",
      "year": 1869,
      "date": {
        "ar": "1803–1913",
        "fr": "1803–1913",
        "en": "1803–1913"
      },
      "title": {
        "ar": "ترتيب العناصر يكشف نمطًا",
        "fr": "Classer révèle une régularité",
        "en": "Classification reveals a pattern"
      },
      "child": {
        "ar": "رتب مندلييف عناصر بخصائص متشابهة وترك فراغات لعناصر لم تكن معروفة. يرتب الجدول الحديث العناصر بالعدد الذري، وهو عدد البروتونات.",
        "fr": "Mendeleïev classe les éléments et laisse des places pour certains inconnus. Le tableau actuel suit le numéro atomique, nombre de protons.",
        "en": "Mendeleev classified elements and left gaps for unknown ones. Today’s table follows atomic number: the number of protons."
      },
      "adult": {
        "ar": "قدمت نظرية دالتون الذرية إطارًا لتفسير نسب الاتحاد الكيميائي. نظم مندلييف جدوله سنة 1869 بالكتل الذرية والخواص مع استثناءات وتنبؤات. أظهر عمل موزلي سنة 1913 أهمية العدد الذري في الترتيب الحديث؛ لذلك لا يصح القول إن جدول 1869 بُني أصلًا على أعداد البروتونات. النماذج الذرية نفسها تطورت لاحقًا.",
        "fr": "La théorie de Dalton explique des rapports de combinaison. En 1869, Mendeleïev ordonne masses et propriétés, avec exceptions et prédictions. Les travaux de Moseley en 1913 établissent le rôle du numéro atomique : le classement initial n’était donc pas fondé sur le nombre de protons. Les modèles atomiques évoluent également.",
        "en": "Dalton’s atomic theory explained combining proportions. Mendeleev’s 1869 table organized atomic weights and properties, with exceptions and predictions. Moseley’s 1913 work established the importance of atomic number. The original table therefore was not based on proton counts; atomic models also continued to change."
      },
      "refs": [
        "periodic"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-chemistry-periodic"
    },
    {
      "id": "bonding",
      "year": 1920,
      "date": {
        "ar": "القرن العشرون",
        "fr": "XXe siècle",
        "en": "Twentieth century"
      },
      "title": {
        "ar": "لماذا ترتبط الذرات؟",
        "fr": "Pourquoi les atomes se lient-ils ?",
        "en": "Why do atoms bond?"
      },
      "child": {
        "ar": "الذرات لا تتجمع بالطريقة نفسها دائمًا. تساعدنا النماذج على فهم اختلاف الماء والملح والبلاستيك. كرات النموذج رموز وليست صورًا مكبرة لذرات حقيقية.",
        "fr": "Les atomes s’assemblent de différentes façons. Les modèles expliquent eau, sel et plastique ; leurs boules sont des symboles, pas des photographies.",
        "en": "Atoms combine in different ways. Models help explain water, salt, and plastics; their balls are symbols, not photographs of atoms."
      },
      "adult": {
        "ar": "ربطت نماذج الإلكترونات والتكافؤ، ثم ميكانيكا الكم، البنية بالروابط والخواص. نستخدم وصفًا أيونيًا أو تساهميًا أو فلزيًا بحسب السؤال، ولا تطابق كرة وعصا توزيع الكثافة الإلكترونية. توظف الكيمياء التحليل الطيفي والقياس والبنية المجهرية لتفسير المواد والأدوية؛ النتيجة تُختبر تجريبيًا ولا تستنتج من شكل رسم فقط.",
        "fr": "Électrons de valence et mécanique quantique relient structures, liaisons et propriétés. Les descriptions ionique, covalente ou métallique sont des modèles ; une boule et un bâton ne représentent pas la densité électronique réelle. Spectroscopie et mesures testent les explications des matériaux et des molécules.",
        "en": "Valence-electron models and quantum mechanics connected structure, bonding, and properties. Ionic, covalent, and metallic descriptions serve different questions; ball-and-stick drawings do not show actual electron density. Spectroscopy and measurement test accounts of materials and drug molecules."
      },
      "refs": [
        "periodic",
        "physics"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-chemistry-bonding"
    },
    {
      "id": "green",
      "year": 2000,
      "date": {
        "ar": "القرنان العشرون والحادي والعشرون",
        "fr": "XXe–XXIe siècles",
        "en": "Twentieth–twenty-first centuries"
      },
      "title": {
        "ar": "نصمم المادة ونحسب أثرها",
        "fr": "Concevoir et évaluer les impacts",
        "en": "Designing and assessing impacts"
      },
      "child": {
        "ar": "قد تساعد بطارية جديدة أو مادة قابلة لإعادة الاستعمال الناس. نسأل أيضًا: من أين جاءت موادها؟ كم تحتاج من طاقة؟ وماذا يحدث لها بعد الاستخدام؟",
        "fr": "Une batterie ou un matériau réutilisable peut aider. Mais d’où viennent ses matières ? Quelle énergie utilise-t-il ? Que devient-il ensuite ?",
        "en": "A battery or reusable material can help people. Where do its materials come from, how much energy does it use, and what happens after use?"
      },
      "adult": {
        "ar": "تسعى الكيمياء الخضراء إلى تقليل الخطر والنفايات منذ التصميم بدل الاكتفاء بمعالجة التلوث بعد حدوثه. تُقارن المواد بسمّيتها وكفاءة تصنيعها واستهلاك الطاقة والموارد وإمكان الاسترجاع. لا تعني صفة حيوي أو جديد أو قابل للتحلل انعدام الأثر؛ تقييم دورة الحياة وشروط الاستعمال والبيانات المستقلة ضرورية للمقارنة.",
        "fr": "La chimie verte vise à réduire dangers et déchets dès la conception. Toxicité, rendement, énergie, ressources et récupération doivent être comparés. Les mots biosourcé, nouveau ou biodégradable ne garantissent pas une absence d’impact ; les conditions d’usage et l’analyse du cycle de vie comptent.",
        "en": "Green chemistry seeks to reduce hazards and waste at the design stage. Comparisons include toxicity, yield, energy, resources, and recovery. Bio-based, new, or biodegradable does not mean impact-free; life-cycle assessment, conditions of use, and independent evidence matter."
      },
      "refs": [
        "green"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-chemistry-green"
    }
  ]
}
export const PHYSICS_HISTORY:HistoryData={
  "id": "physics",
  "title": {
    "ar": "تاريخ الفيزياء",
    "fr": "Histoire de la physique",
    "en": "History of physics"
  },
  "intro": {
    "ar": "كيف اختبرنا الحركة والضوء والطاقة؟ نماذج تتسع عندما تكشف القياسات حدودها.",
    "fr": "Mouvement, lumière et énergie : des modèles éprouvés et élargis par les mesures.",
    "en": "Motion, light, and energy: models tested and extended by measurement."
  },
  "regions": [],
  "onlyTimeline": true,
  "sources": {
    "math": {
      "name": "University of St Andrews · MacTutor history of mathematics",
      "url": "https://mathshistory.st-andrews.ac.uk/"
    },
    "zero": {
      "name": "MacTutor · Brahmagupta",
      "url": "https://mathshistory.st-andrews.ac.uk/Biographies/Brahmagupta/"
    },
    "lavoisier": {
      "name": "American Chemical Society · Lavoisier",
      "url": "https://www.acs.org/education/whatischemistry/landmarks/lavoisier.html"
    },
    "periodic": {
      "name": "Royal Society of Chemistry · Development of the periodic table",
      "url": "https://periodic-table.rsc.org/about"
    },
    "green": {
      "name": "American Chemical Society · Green chemistry principles",
      "url": "https://www.acs.org/green-chemistry-sustainability/principles/12-principles-of-green-chemistry.html"
    },
    "optics": {
      "name": "UNESCO · Ibn al-Haytham and the history of optics",
      "url": "https://www.unesco.org/en/articles/ibn-al-haythams-scientific-method"
    },
    "physics": {
      "name": "American Institute of Physics · History",
      "url": "https://history.aip.org/"
    },
    "higgs": {
      "name": "CERN · The Higgs boson",
      "url": "https://home.cern/science/physics/higgs-boson"
    },
    "ligo": {
      "name": "LIGO · First detection of gravitational waves",
      "url": "https://www.ligo.caltech.edu/news/ligo20160211"
    }
  },
  "events": [
    {
      "id": "mechanics",
      "year": -250,
      "date": {
        "ar": "القرن الثالث ق.م.",
        "fr": "IIIe siècle av. n.è.",
        "en": "Third century BCE"
      },
      "title": {
        "ar": "الرافعة والطفو",
        "fr": "Levier et flottabilité",
        "en": "Levers and buoyancy"
      },
      "child": {
        "ar": "تساعد الرافعة على تحريك حمل، ويطفو جسم عندما يوازن دفع الماء وزنه. درس أرخميدس هذه العلاقات؛ لا يتوقف الطفو على كون الجسم خفيفًا وحده.",
        "fr": "Un levier aide à déplacer une charge ; un objet flotte lorsque la poussée équilibre son poids. Archimède étudie ces relations.",
        "en": "A lever helps move a load; an object floats when buoyancy balances its weight. Archimedes studied these relationships."
      },
      "adult": {
        "ar": "طورت أعمال أرخميدس صيغًا رياضية للاتزان والهيدروستاتيكا ضمن تقاليد ميكانيكية أقدم. يتعلق اتزان الرافعة بالعزم، والطفو بوزن السائل المزاح وشروط الاتزان. ينبغي التفريق بين نتيجة قابلة للبرهنة والقصص الشهيرة عن لحظة الاكتشاف التي وصلتنا بروايات لاحقة.",
        "fr": "Archimède formalise équilibre et hydrostatique à partir de traditions plus anciennes. Le levier dépend des moments ; la poussée, du poids du fluide déplacé. Les résultats démontrables se distinguent des récits célèbres d’une découverte transmis par des auteurs ultérieurs.",
        "en": "Archimedes formalized equilibrium and hydrostatics within earlier mechanical traditions. Levers depend on moments; buoyancy depends on the weight of displaced fluid and equilibrium conditions. Demonstrable results differ from famous discovery stories transmitted by later writers."
      },
      "refs": [
        "physics",
        "math"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-physics-mechanics"
    },
    {
      "id": "optics",
      "year": 1020,
      "date": {
        "ar": "القرن الحادي عشر",
        "fr": "XIe siècle",
        "en": "Eleventh century"
      },
      "title": {
        "ar": "الضوء يدخل العين",
        "fr": "La lumière entre dans l’œil",
        "en": "Light enters the eye"
      },
      "child": {
        "ar": "نرى لأن ضوءًا يصل إلى أعيننا. درس ابن الهيثم الظلال والانعكاس والرؤية باستخدام الملاحظة والحجج والتجارب. فتحة صغيرة قد تصنع صورة مقلوبة في غرفة مظلمة.",
        "fr": "Nous voyons parce que la lumière entre dans nos yeux. Ibn al-Haytham étudie ombres, réflexion et vision ; un petit trou forme une image inversée.",
        "en": "We see because light reaches our eyes. Ibn al-Haytham studied shadows, reflection, and vision; a small opening can form an inverted image."
      },
      "adult": {
        "ar": "جمع كتاب المناظر بين الهندسة ودراسة الإدراك واختبارات الضوء، ونقد تصورات خروج الشعاع من العين. استفاد من تقاليد سابقة وأثر في قراءات عربية ولاتينية لاحقة. لا تُنسب إليه كل معرفة بالغرفة المظلمة، ولا تختزل البصريات الحديثة في تجربة واحدة؛ توضح المرحلة قيمة الجمع بين النمذجة والتحقق.",
        "fr": "Le Livre de l’optique articule géométrie, perception et essais sur la lumière, en critiquant l’émission de rayons par l’œil. Il prolonge des traditions antérieures et nourrit des lectures arabes et latines. La chambre noire ne lui doit pas toute son histoire ; cette étape montre le dialogue entre modèle et épreuve.",
        "en": "The Book of Optics combined geometry, perception, and tests of light, challenging rays emitted by the eye. It drew on earlier traditions and influenced later Arabic and Latin scholarship. The camera obscura’s entire history cannot be attributed to him; the episode illustrates modeling tested against observation."
      },
      "refs": [
        "optics",
        "physics"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-physics-optics"
    },
    {
      "id": "motion",
      "year": 1687,
      "date": {
        "ar": "القرن السابع عشر؛ 1687",
        "fr": "XVIIe siècle ; 1687",
        "en": "Seventeenth century; 1687"
      },
      "title": {
        "ar": "قوانين تربط الأرض والسماء",
        "fr": "Des lois de la Terre au ciel",
        "en": "Laws linking Earth and sky"
      },
      "child": {
        "ar": "درس غاليليو الحركة، وصاغ نيوتن قوانين تساعد على حساب سقوط جسم وحركة القمر. القانون نموذج له شروط؛ لا يعني غياب الدفع أن الجسم يتوقف فورًا.",
        "fr": "Galilée étudie le mouvement ; Newton relie chute et orbites. Sans force résultante, un objet conserve son mouvement rectiligne uniforme.",
        "en": "Galileo studied motion; Newton linked falling objects and orbits. Without a net force, an object maintains uniform straight-line motion."
      },
      "adult": {
        "ar": "قدمت المبادئ الرياضية سنة 1687 قوانين الحركة والجذب العام في بناء رياضي يستند إلى أعمال وقياسات سابقة. تتطلب مسائل الحركة تحديد القوى والإطار والشروط الابتدائية. تظل الميكانيكا النيوتنية تقريبًا بالغ النجاح للأجسام الكبيرة البطيئة قياسًا بسرعة الضوء؛ تظهر حدودها عند السرعات العالية والجاذبية الشديدة والمقاييس الذرية.",
        "fr": "Les Principia de 1687 organisent mouvement et gravitation en s’appuyant sur des travaux antérieurs. Il faut préciser forces, référentiel et conditions initiales. La mécanique newtonienne reste très efficace à l’échelle macroscopique et aux faibles vitesses ; relativité et physique quantique éclairent ses limites.",
        "en": "The 1687 Principia organized motion and universal gravitation using earlier scholarship and measurements. Problems require forces, a reference frame, and initial conditions. Newtonian mechanics remains highly effective for large objects at low speeds; relativity and quantum physics explain its limits."
      },
      "refs": [
        "physics",
        "math"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-physics-motion"
    },
    {
      "id": "electromagnetism",
      "year": 1865,
      "date": {
        "ar": "القرن التاسع عشر",
        "fr": "XIXe siècle",
        "en": "Nineteenth century"
      },
      "title": {
        "ar": "المغناطيس والكهرباء والضوء",
        "fr": "Aimants, électricité et lumière",
        "en": "Magnets, electricity, and light"
      },
      "child": {
        "ar": "قد يولد تغير المجال المغناطيسي تيارًا في دائرة. جمع ماكسويل الكهرباء والمغناطيسية في وصف واحد، وأظهر أن الضوء موجة كهرومغناطيسية. لا نجرب كهرباء المنزل.",
        "fr": "Un champ magnétique variable peut induire un courant. Maxwell réunit électricité et magnétisme et décrit la lumière comme onde électromagnétique.",
        "en": "A changing magnetic field can induce current. Maxwell united electricity and magnetism and described light as an electromagnetic wave. Never experiment with mains electricity."
      },
      "adult": {
        "ar": "ربطت تجارب فاراداي في الحث بين تغير المجال والاستجابة الكهربائية، ثم وحدت معادلات ماكسويل الظواهر الكهربائية والمغناطيسية وتنبأت بموجات كهرومغناطيسية. لا يكفي وجود مغناطيس ثابت لتيار مستمر في أي حلقة؛ تغير الفيض وبنية الدائرة عاملان حاسمان. تطورت الاتصالات والمحركات والتصوير الطبي باستعمال هذه العلاقات.",
        "fr": "L’induction de Faraday et les équations de Maxwell relient champs et phénomènes électriques, avec prédiction des ondes électromagnétiques. Un aimant immobile ne suffit pas à produire un courant permanent dans toute boucle : variation du flux et circuit importent. Communications, moteurs et imagerie exploitent ces relations.",
        "en": "Faraday’s induction experiments and Maxwell’s equations connected electric and magnetic fields and predicted electromagnetic waves. A stationary magnet does not automatically create continuous current in any loop; changing flux and circuit conditions matter. Communications, motors, and medical imaging developed from these relationships."
      },
      "refs": [
        "physics"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-physics-electromagnetism"
    },
    {
      "id": "quantum",
      "year": 1900,
      "date": {
        "ar": "1900–1930 وما بعدها",
        "fr": "1900–1930 et après",
        "en": "1900–1930 and beyond"
      },
      "title": {
        "ar": "عندما تتغير مقاييسنا",
        "fr": "Quand les échelles changent",
        "en": "When our scales change"
      },
      "child": {
        "ar": "لا تتصرف الذرات مثل كرات صغيرة تمامًا، ولا يمر الزمن بالطريقة نفسها في كل الظروف. جاءت نظريات جديدة لأن القياسات طرحت أسئلة لم تكفِ النماذج القديمة لحلها.",
        "fr": "Les atomes ne sont pas de simples billes ; le temps dépend aussi des conditions physiques. De nouvelles mesures demandent de nouveaux modèles.",
        "en": "Atoms are not simply tiny balls, and time depends on physical conditions. New measurements required new models."
      },
      "adult": {
        "ar": "انطلقت صياغات الكم مع بلانك وتفسير أينشتاين للتأثير الكهروضوئي ثم ميكانيكا الكم في عشرينيات القرن العشرين. ميزت النسبية الخاصة والعامة بين وصف الحركة والجاذبية في أطر أوسع. هذه نظريات مختلفة لا تعني أن كل ادعاء غريب صحيح؛ لكل نموذج معادلات وتنبؤات واختبارات وحدود تطبيق.",
        "fr": "Planck puis l’explication de l’effet photoélectrique par Einstein précèdent la mécanique quantique des années 1920. Relativités restreinte et générale élargissent les cadres de mouvement et de gravitation. Ces théories distinctes n’autorisent pas toute affirmation étrange : chacune possède des prédictions, des tests et un domaine de validité.",
        "en": "Planck’s work and Einstein’s photoelectric explanation preceded 1920s quantum mechanics. Special and general relativity expanded accounts of motion and gravity. These are distinct theories, not permission to accept any strange claim: each has equations, testable predictions, and a domain of validity."
      },
      "refs": [
        "physics"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-physics-quantum"
    },
    {
      "id": "detectors",
      "year": 2015,
      "date": {
        "ar": "2012–2016 وما بعدها",
        "fr": "2012–2016 et après",
        "en": "2012–2016 and beyond"
      },
      "title": {
        "ar": "أجهزة ترى آثارًا دقيقة",
        "fr": "Détecter des traces minuscules",
        "en": "Detecting subtle traces"
      },
      "child": {
        "ar": "رصدت فرق كبيرة آثار جسيم هيغز وموجات الجاذبية بأجهزة شديدة الحساسية. نقارن الإشارة بالضجيج ونعيد الفحص؛ العلم عمل جماعي يحتاج وقتًا.",
        "fr": "De grandes équipes détectent le boson de Higgs et des ondes gravitationnelles. Il faut distinguer signal et bruit et vérifier les résultats.",
        "en": "Large teams detected the Higgs boson and gravitational waves. Scientists distinguish signals from noise and check results carefully."
      },
      "adult": {
        "ar": "أُعلن اكتشاف جسيم متوافق مع هيغز في CERN سنة 2012. سجل LIGO أول إشارة مباشرة لموجات جاذبية في سبتمبر 2015 وأعلنها في فبراير 2016؛ تاريخ الرصد غير تاريخ الإعلان. تعتمد هذه النتائج على معايرة أجهزة ونمذجة رياضية وتحليل احتمالي وفرق متعددة، وليست صورًا فوتوغرافية عادية للجسيم أو الموجة.",
        "fr": "Le CERN annonce en 2012 un boson compatible avec celui de Higgs. LIGO enregistre un premier signal direct d’ondes gravitationnelles en septembre 2015 et l’annonce en février 2016 : observation et publication diffèrent. Étalonnage, modèles et statistiques sont essentiels ; il ne s’agit pas de photographies ordinaires.",
        "en": "CERN announced a Higgs-compatible boson in 2012. LIGO recorded the first direct gravitational-wave signal in September 2015 and announced it in February 2016: observation and announcement dates differ. Calibration, mathematical modeling, statistics, and large collaborations underpin these results, which are not ordinary photographs."
      },
      "refs": [
        "higgs",
        "ligo"
      ],
      "regions": [],
      "symbol": "book",
      "visual": "qalam-history-physics-detectors"
    }
  ]
}

CHEMISTRY_HISTORY.sources.materials={name:"Ministère de la Culture · Métallurgie en Mésopotamie",url:"https://archeologie.culture.gouv.fr/mari/en/glossary/metallurgy"};
CHEMISTRY_HISTORY.sources.alchemy={name:"NLM · Arabic alchemical manuscripts and attribution",url:"https://www.nlm.nih.gov/hmd/arabic/alchemy10.html"};
CHEMISTRY_HISTORY.events[0].refs=["materials"];CHEMISTRY_HISTORY.events[1].refs=["alchemy"];

for(const data of [MATHEMATICS_HISTORY,CHEMISTRY_HISTORY,PHYSICS_HISTORY]){const used=new Set([...data.events,...data.spatialEvents||[]].flatMap(e=>e.refs));data.sources=Object.fromEntries(Object.entries(data.sources).filter(([key])=>used.has(key)))}
