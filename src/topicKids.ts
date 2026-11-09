import type { Lang } from './i18n'

/** Hand-authored child register (4–15) for every topic: a hook, a plain explanation,
    a safe hands-on activity, and a check question with its answer. */
export type KidTopic = {
  hook: Record<Lang, string>
  idea: Record<Lang, string>
  activity: Record<Lang, string>
  check: Record<Lang, string>
  answer: Record<Lang, string>
}

const t = (ar: string, fr: string, en: string) => ({ ar, fr, en })

export const KID_TOPICS: Record<string, KidTopic> = {
  stars: {
    hook: t('لماذا تلمع الشمس ولا تنطفئ؟', 'Pourquoi le Soleil brille-t-il sans s’éteindre ?', 'Why does the Sun shine without going out?'),
    idea: t(
      'الشمس نجم. في قلبها يتحوّل الهيدروجين إلى هيليوم، فيتولّد ضوء وحرارة. النجوم الأكبر تستهلك وقودها أسرع فتعيش أقل.',
      'Le Soleil est une étoile. Dans son cœur, l’hydrogène devient de l’hélium et libère lumière et chaleur. Les étoiles plus grosses brûlent leur carburant plus vite et vivent moins longtemps.',
      'The Sun is a star. In its core hydrogen turns into helium and gives off light and heat. Bigger stars burn fuel faster and live shorter lives.'
    ),
    activity: t(
      'انظر إلى السماء ليلاً: هل كل النجوم بنفس اللون؟ اللون الأحمر يعني نجماً أبرد، والأزرق نجماً أسخن.',
      'Regarde le ciel la nuit : les étoiles ont-elles toutes la même couleur ? Le rouge est plus froid, le bleu plus chaud.',
      'Look at the night sky: are all stars the same colour? Red means cooler, blue means hotter.'
    ),
    check: t('ما الذي يجعل الشمس تلمع؟', 'Qu’est-ce qui fait briller le Soleil ?', 'What makes the Sun shine?'),
    answer: t('اندماج الهيدروجين في قلبها.', 'La fusion de l’hydrogène dans son cœur.', 'Hydrogen fusion in its core.'),
  },
  planets: {
    hook: t('لماذا الكواكب كروية؟', 'Pourquoi les planètes sont-elles rondes ?', 'Why are planets round?'),
    idea: t(
      'الجاذبية تشدّ المادة نحو المركز، فتأخذ شكل كرة. الكواكب الصخرية صغيرة وقريبة من الشمس، والغازية كبيرة وبعيدة.',
      'La gravité attire la matière vers le centre : cela donne une boule. Les planètes rocheuses sont petites et proches du Soleil, les gazeuses grandes et lointaines.',
      'Gravity pulls matter toward the centre, making a ball. Rocky planets are small and close to the Sun; gas giants are big and far.'
    ),
    activity: t(
      'خذ قطعة عجين واضغطها من كل الجهات بيديك: ستصبح كرة. هذه هي الجاذبية.',
      'Prends de la pâte et presse-la de tous les côtés : elle devient une boule. C’est la gravité.',
      'Take some dough and press it from all sides: it becomes a ball. That is gravity.'
    ),
    check: t('أي كوكب أكبر: الأرض أم المشتري؟', 'Quelle planète est la plus grande : la Terre ou Jupiter ?', 'Which is bigger: Earth or Jupiter?'),
    answer: t('المشتري، بنحو 11 ضعف قطر الأرض.', 'Jupiter, environ 11 fois la Terre.', 'Jupiter, about 11 times Earth’s diameter.'),
  },
  galaxies: {
    hook: t('كم نجمة في السماء؟', 'Combien d’étoiles dans le ciel ?', 'How many stars are in the sky?'),
    idea: t(
      'المجرة تجمّع ضخم من النجوم والغاز. مجرّتنا اسمها درب التبانة وفيها مئات مليارات النجوم، والشمس واحدة منها.',
      'Une galaxie est un immense ensemble d’étoiles et de gaz. La nôtre, la Voie lactée, contient des centaines de milliards d’étoiles.',
      'A galaxy is a huge collection of stars and gas. Our Milky Way holds hundreds of billions of stars.'
    ),
    activity: t(
      'املأ كأس ماء وأضف لمعاناً (سكراً) وحرّكه: كل حبة صغيرة تشبه نجماً في مجرة.',
      'Remplis un verre d’eau, ajoute des paillettes (sucre) et remue : chaque point ressemble à une étoile.',
      'Fill a glass with water, add glitter (or sugar) and stir: each dot is like a star.'
    ),
    check: t('ما اسم مجرّتنا؟', 'Comment s’appelle notre galaxie ?', 'What is our galaxy called?'),
    answer: t('درب التبانة.', 'La Voie lactée.', 'The Milky Way.'),
  },
  volcanoes: {
    hook: t('ماذا يوجد تحت أقدامنا؟', 'Que trouve-t-on sous nos pieds ?', 'What is under our feet?'),
    idea: t(
      'تحت القشرة الأرضية صخور منصهرة اسمها صهارة. عندما ترتفع عبر شقوق تخرج حمماً، وقد تنحبس غازات فتنفجر.',
      'Sous la croûte, des roches fondues : le magma. Quand il monte par des fissures, il devient lave ; des gaz peuvent exploser.',
      'Under the crust there is melted rock: magma. When it rises through cracks it becomes lava; trapped gases can explode.'
    ),
    activity: t(
      'في كأس: صودا الخبز مع قليل من الخل. الفقاعات غاز يدفع الخليط للأعلى — هكذا يعمل ضغط البركان.',
      'Dans un verre : bicarbonate + vinaigre. Les bulles de gaz poussent le mélange vers le haut, comme la pression d’un volcan.',
      'In a glass: baking soda + vinegar. Gas bubbles push the mix up — like volcanic pressure.'
    ),
    check: t('لماذا ينفجر البركان أحياناً؟', 'Pourquoi un volcan explose-t-il parfois ?', 'Why does a volcano sometimes explode?'),
    answer: t('لأن الغازات المحبوسة تزيد الضغط.', 'Les gaz piégés augmentent la pression.', 'Trapped gases build up pressure.'),
  },
  oceans: {
    hook: t('لماذا ماء البحر مالح؟', 'Pourquoi l’eau de mer est-elle salée ?', 'Why is sea water salty?'),
    idea: t(
      'الماء يذيب أملاح الصخور ويحملها إلى البحر عبر ملايين السنين. والمحيط يخزّن حرارة الأرض وينظّم مناخها.',
      'L’eau dissout les sels des roches et les porte à la mer pendant des millions d’années. L’océan stocke la chaleur de la Terre.',
      'Water dissolves salts from rocks and carries them to the sea over millions of years. The ocean stores Earth’s heat.'
    ),
    activity: t(
      'ضع بيضة في ماء عذب: تغرق. ثم في ماء مالح: تطفو. الملح يجعل الماء أثقل.',
      'Mets un œuf dans l’eau douce : il coule. Dans l’eau salée : il flotte. Le sel rend l’eau plus dense.',
      'Put an egg in fresh water: it sinks. In salt water: it floats. Salt makes water denser.'
    ),
    check: t('أين أبرد: سطح المحيط أم أعماقه؟', 'Où fait-il plus froid : en surface ou en profondeur ?', 'Where is colder: the surface or the deep?'),
    answer: t('في الأعماق.', 'En profondeur.', 'In the deep.'),
  },
  cells: {
    hook: t('من ماذا يتكوّن جسمك؟', 'De quoi ton corps est-il fait ?', 'What is your body made of?'),
    idea: t(
      'جسمك مبني من خلايا صغيرة جداً لا تُرى بالعين. لكل خلية غشاء يحميها، ونواة تحفظ التعليمات، ومصنع طاقة.',
      'Ton corps est fait de cellules minuscules invisibles à l’œil. Chacune a une membrane, un noyau et une centrale d’énergie.',
      'Your body is made of tiny cells you cannot see. Each has a membrane, a nucleus and a power plant.'
    ),
    activity: t(
      'افحص ورقة نبات بمكبّر: الخطوط الصغيرة خلايا. قارنها بجلد يدك.',
      'Observe une feuille à la loupe : les petits traits sont des cellules.',
      'Look at a leaf with a magnifier: the small lines are cells.'
    ),
    check: t('ما وظيفة النواة؟', 'À quoi sert le noyau ?', 'What does the nucleus do?'),
    answer: t('تحفظ تعليمات الخلية.', 'Elle garde les instructions.', 'It stores the cell’s instructions.'),
  },
  dna: {
    hook: t('لماذا تشبه والديك؟', 'Pourquoi ressembles-tu à tes parents ?', 'Why do you look like your parents?'),
    idea: t(
      'في كل خلية كتاب تعليمات اسمه DNA. نصفه من الأم ونصفه من الأب، ولهذا تشبه كليهما قليلاً.',
      'Chaque cellule a un livre d’instructions : l’ADN. La moitié vient de la mère, l’autre du père.',
      'Every cell has an instruction book: DNA. Half comes from your mother, half from your father.'
    ),
    activity: t(
      'اصنع سلسلة من حبات ملونة بنمط (أحمر-أزرق-أخضر). ثم اقلب النمط: هذه فكرة النسخ المتمم.',
      'Fais une suite de perles colorées puis recopie-la à l’inverse : c’est l’idée d’une copie complémentaire.',
      'Make a pattern of coloured beads, then copy it mirrored: that is a complementary copy.'
    ),
    check: t('كم نسخة من تعليماتك تحمل؟', 'Combien de copies de tes instructions portes-tu ?', 'How many copies of your instructions do you carry?'),
    answer: t('نسختان: واحدة من كل والد.', 'Deux : une de chaque parent.', 'Two: one from each parent.'),
  },
  humanBody: {
    hook: t('كم مرة يدق قلبك في اليوم؟', 'Combien de fois ton cœur bat-il par jour ?', 'How many times does your heart beat a day?'),
    idea: t(
      'القلب مضخة عضلية. يدق نحو 100 ألف مرة يومياً ويدفع الدم ليحمل الأكسجين والغذاء إلى كل الجسم.',
      'Le cœur est une pompe musculaire. Il bat environ 100 000 fois par jour pour envoyer oxygène et nutriments partout.',
      'The heart is a muscular pump. It beats about 100,000 times a day, sending oxygen and food everywhere.'
    ),
    activity: t(
      'عدّ نبضك 15 ثانية ثم اضرب في 4. قارن النتيجة وأنت جالس، ثم بعد القفز.',
      'Compte ton pouls 15 s puis multiplie par 4. Compare assis puis après avoir sauté.',
      'Count your pulse for 15 seconds, then multiply by 4. Compare resting and after jumping.'
    ),
    check: t('ماذا يحمل الدم إلى الخلايا؟', 'Que transporte le sang vers les cellules ?', 'What does blood carry to cells?'),
    answer: t('الأكسجين والغذاء.', 'Oxygène et nutriments.', 'Oxygen and nutrients.'),
  },
  atoms: {
    hook: t('ما أصغر شيء في العالم؟', 'Quelle est la plus petite chose du monde ?', 'What is the smallest thing in the world?'),
    idea: t(
      'كل شيء حولك مبني من ذرات. الذرة نواة صغيرة في الوسط، وإلكترونات تدور حولها. الذرات لا تُرى بالعين.',
      'Tout est fait d’atomes. Un atome a un petit noyau au centre et des électrons autour. Ils sont invisibles.',
      'Everything is made of atoms. An atom has a tiny nucleus and electrons around it. They are invisible.'
    ),
    activity: t(
      'قارن الحجم: كرة قدم بالنسبة لنملة، مثل حجم النملة بالنسبة للذرة. الذرة أصغر بكثير.',
      'Compare : un ballon de foot face à une fourmi, c’est comme une fourmi face à un atome.',
      'Compare: a football to an ant is like an ant to an atom.'
    ),
    check: t('ما شحنة نواة الذرة؟', 'Quelle est la charge du noyau ?', 'What charge has the nucleus?'),
    answer: t('موجبة، لأنها تحوي بروتونات.', 'Positive, car elle contient des protons.', 'Positive, because it contains protons.'),
  },
  molecules: {
    hook: t('لماذا يتبخّر الماء؟', 'Pourquoi l’eau s’évapore-t-elle ?', 'Why does water evaporate?'),
    idea: t(
      'الماء جزيء من ذرتي هيدروجين وذرة أوكسجين. عند التسخين تتحرك الجزيئات أسرع فتهرب من السطح بخاراً.',
      'L’eau est une molécule : deux hydrogènes et un oxygène. En chauffant, les molécules bougent plus vite et s’échappent.',
      'Water is a molecule: two hydrogens and one oxygen. When heated, molecules move faster and escape as vapour.'
    ),
    activity: t(
      'ضع قطرة ماء على يدك ولوّح بها: تختفي أسرع من قطرة في صحن.',
      'Une goutte sur ta main s’évapore plus vite que dans une assiette.',
      'A drop on your hand evaporates faster than one in a dish.'
    ),
    check: t('كم ذرة في جزيء الماء؟', 'Combien d’atomes dans une molécule d’eau ?', 'How many atoms are in a water molecule?'),
    answer: t('ثلاث ذرات.', 'Trois atomes.', 'Three atoms.'),
  },
  waves: {
    hook: t('كيف يصل صوتك إلى أذن صديقك؟', 'Comment ta voix arrive-t-elle à ton ami ?', 'How does your voice reach your friend?'),
    idea: t(
      'الصوت موجة تهتز في الهواء. الضوء أيضاً موجة، لكنه يستطيع السفر في الفضاء حيث لا هواء.',
      'Le son est une onde qui vibre dans l’air. La lumière est aussi une onde, mais elle voyage dans le vide.',
      'Sound is a wave vibrating in air. Light is also a wave, but it travels through empty space.'
    ),
    activity: t(
      'شدّ حبلاً وحرّك طرفه: ترى موجة تنتقل. جرّب سرعات مختلفة.',
      'Tends une corde et secoue une extrémité : une onde se propage.',
      'Stretch a rope and shake one end: a wave travels along it.'
    ),
    check: t('أيهما أسرع: الضوء أم الصوت؟', 'Qui est le plus rapide : la lumière ou le son ?', 'Which is faster: light or sound?'),
    answer: t('الضوء أسرع بكثير.', 'La lumière, beaucoup plus vite.', 'Light, far faster.'),
  },
  electricity: {
    hook: t('من أين يأتي ضوء المصباح؟', 'D’où vient la lumière de la lampe ?', 'Where does the lamp’s light come from?'),
    idea: t(
      'الكهرباء شحنات تسير في مسار مغلق اسمه دارة. إذا انقطع المسار توقف التيار وانطفأ المصباح.',
      'L’électricité est un déplacement de charges dans un circuit fermé. Si le circuit s’ouvre, la lampe s’éteint.',
      'Electricity is charge moving in a closed circuit. If the path breaks, the lamp goes out.'
    ),
    activity: t(
      'ببطارية ومصباح صغير وسلكين: أغلق الدارة ثم افتحها ولاحظ الفرق.',
      'Avec une pile, une petite lampe et deux fils : ferme puis ouvre le circuit.',
      'With a battery, a small lamp and two wires: close then open the circuit.'
    ),
    check: t('لماذا لا يضيء المصباح أحياناً؟', 'Pourquoi la lampe ne s’allume-t-elle pas parfois ?', 'Why does the lamp sometimes not light?'),
    answer: t('لأن الدارة مفتوحة أو البطارية فارغة.', 'Le circuit est ouvert ou la pile est vide.', 'The circuit is open or the battery is empty.'),
  },
  ai: {
    hook: t('كيف يتعلّم الحاسوب؟', 'Comment un ordinateur apprend-il ?', 'How does a computer learn?'),
    idea: t(
      'نعطي الحاسوب أمثلة كثيرة فيكتشف الأنماط. لكنه قد يخطئ، لأن نتيجته احتمال وليست يقيناً.',
      'On donne beaucoup d’exemples à l’ordinateur et il repère des motifs. Il peut se tromper : son résultat est une probabilité.',
      'We give the computer many examples and it finds patterns. It can be wrong: its answer is a probability.'
    ),
    activity: t(
      'علّم صديقاً التعرّف على صور القطط بأمثلة، ثم اعرض صورة غريبة: هل يخطئ؟',
      'Apprends à un ami à reconnaître des chats avec des exemples, puis montre une image bizarre.',
      'Teach a friend to recognise cats with examples, then show a strange picture.'
    ),
    check: t('هل إجابة الذكاء الاصطناعي دائماً صحيحة؟', 'La réponse d’une IA est-elle toujours juste ?', 'Is an AI answer always correct?'),
    answer: t('لا، إنها احتمال وقد تخطئ.', 'Non, c’est une probabilité, elle peut se tromper.', 'No, it is a probability and can be wrong.'),
  },
}
