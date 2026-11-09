import type { Lang } from './i18n'

/** Scientific annotations (NASA-SVS style) anchored to each body. */
export type CosmosAnnotation = {
  lat?: number
  lon?: number
  xyz?: [number, number, number]
  title: Record<Lang, string>
  desc: Record<Lang, string>
}

const A = (lat: number | undefined, lon: number | undefined, xyz: [number, number, number] | undefined, title: Record<Lang, string>, desc: Record<Lang, string>): CosmosAnnotation => {
  const o: CosmosAnnotation = { title, desc }
  if (xyz) o.xyz = xyz
  else { o.lat = lat; o.lon = lon }
  return o
}

export const COSMOS_ANNOTATIONS: Partial<Record<string, CosmosAnnotation[]>> = {
  sun: [
    A(0, 0, undefined,
      { ar: 'اللب (15.7 مليون كلفن)', fr: 'Cœur (15,7 MK)', en: 'Core (15.7 MK)' },
      { ar: 'حيث يندمج الهيدروجين إلى هيليوم عبر سلسلة بروتون-بروتون، مصدر طاقة الشمس.', fr: 'Où l’hydrogène fusionne en hélium via la chaîne proton-proton.', en: 'Where hydrogen fuses into helium via the proton–proton chain.' }),
    A(15, 120, undefined,
      { ar: 'حُبيبات الحمل الحراري', fr: 'Granules de convection', en: 'Convection granules' },
      { ar: 'خلايا صاعدة هابطة بحجم ~1000 كم تظهر على السطح وتتجدد كل دقائق.', fr: 'Cellules ascendantes/descendantes (~1 000 km) se renouvelant en quelques minutes.', en: 'Rising/falling cells (~1,000 km) renewing every few minutes.' }),
    A(-20, 250, undefined,
      { ar: 'البقعة الشمسية', fr: 'Tache solaire', en: 'Sunspot' },
      { ar: 'منطقة أبرد وأكثر إظلاماً من مجال مغناطيسي قوي يمنع الحمل الحراري.', fr: 'Zone plus froide et sombre où un fort champ magnétique bloque la convection.', en: 'Cooler, darker region where a strong magnetic field blocks convection.' }),
  ],
  jupiter: [
    A(-20, 30, undefined,
      { ar: 'البقعة الحمراء العظيمة', fr: 'Grande Tache rouge', en: 'Great Red Spot' },
      { ar: 'إعصار مضاد للأعاصير أوسع من الأرض، مستمر منذ أكثر من 350 عاماً.', fr: 'Anticyclone plus large que la Terre, actif depuis plus de 350 ans.', en: 'An anticyclone wider than Earth, active for over 350 years.' }),
    A(0, 150, undefined,
      { ar: 'الأحزمة والمناطق', fr: 'Bandes et zones', en: 'Belts and zones' },
      { ar: 'أحزمة داكنة هابطة ومناطق فاتحة صاعدة في الغلاف الجوي.', fr: 'Bandes sombres descendantes et zones claires ascendantes.', en: 'Dark descending belts and bright rising zones.' }),
  ],
  saturn: [
    A(0, 90, undefined,
      { ar: 'الحلقات', fr: 'Les anneaux', en: 'The rings' },
      { ar: 'جليد وصخر بامتداد 282 ألف كم وسمك أمتار فقط، تحكمها أقمار راعية.', fr: 'Glace et roche sur 282 000 km pour quelques mètres d’épaisseur.', en: 'Ice and rock spanning 282,000 km but only metres thick.' }),
  ],
  earth: [
    A(0, -150, undefined,
      { ar: 'المحيط الهادئ', fr: 'Océan Pacifique', en: 'Pacific Ocean' },
      { ar: 'أكبر مسطح مائي على الأرض، يغطي نحو ثلث سطحها.', fr: 'Le plus grand océan, couvrant près d’un tiers de la surface.', en: 'The largest ocean, covering about a third of the surface.' }),
    A(31, -6, undefined,
      { ar: 'المغرب', fr: 'Maroc', en: 'Morocco' },
      { ar: 'بلد في شمال غرب إفريقيا، يطل على المحيط الأطلسي والبحر الأبيض المتوسط.', fr: 'Pays du nord-ouest de l’Afrique, entre l’Atlantique et la Méditerranée.', en: 'A country in northwest Africa, between the Atlantic and the Mediterranean.' }),
  ],
  mars: [
    A(18.65, 226.2, undefined,
      { ar: 'أوليمبوس مونس', fr: 'Olympus Mons', en: 'Olympus Mons' },
      { ar: 'أعلى بركان في المجموعة الشمسية (~21 كم) بقاعدة تزيد عن 600 كم.', fr: 'Plus haut volcan du Système solaire (~21 km), base > 600 km.', en: 'Tallest volcano in the Solar System (~21 km), base over 600 km.' }),
    A(-12, 300, undefined,
      { ar: 'وادي مارينيريس', fr: 'Valles Marineris', en: 'Valles Marineris' },
      { ar: 'نظام أخاديد بطول ~4000 كم، أطول من عرض الولايات المتحدة.', fr: 'Système de canyons de ~4 000 km.', en: 'A canyon system ~4,000 km long.' }),
  ],
  nebula: [
    A(undefined, undefined, [0, 0, 0],
      { ar: 'القلب المتأين', fr: 'Cœur ionisé', en: 'Ionized core' },
      { ar: 'نجوم فتية حارة تؤين الغاز المحيط فتجعل السديم يتوهج.', fr: 'De jeunes étoiles chaudes ionisent le gaz et font briller la nébuleuse.', en: 'Hot young stars ionize the gas and make the nebula glow.' }),
  ],
  galaxy: [
    A(undefined, undefined, [0, 0, 0],
      { ar: 'النواة المجرية — Sgr A*', fr: 'Bulbe — Sgr A*', en: 'Bulge — Sgr A*' },
      { ar: 'ثقب أسود فائق الكتلة (4.3 مليون كتلة شمسية) في مركز درب التبانة.', fr: 'Trou noir supermassif de 4,3 millions de masses solaires au centre.', en: 'A 4.3-million-solar-mass supermassive black hole at the centre.' }),
    A(undefined, undefined, [1.6, 0, 1.2],
      { ar: 'ذراع حلزوني', fr: 'Bras spiral', en: 'Spiral arm' },
      { ar: 'منطقة تشكّل نجوم تتكدس فيها النجوم الفتية والغاز المتوهج.', fr: 'Région de formation d’étoiles riches en jeunes étoiles et gaz.', en: 'A star-forming region dense with young stars and gas.' }),
  ],
  comet: [
    A(undefined, undefined, [0, 0, 0],
      { ar: 'النواة', fr: 'Noyau', en: 'Nucleus' },
      { ar: 'كرة جليد وغبار بقطر 1–10 كم، مصدر الذيلين.', fr: 'Boule de glace et poussière de 1–10 km, source des deux queues.', en: 'An ice-and-dust ball 1–10 km across, source of the tails.' }),
    A(undefined, undefined, [2.2, 0, 0],
      { ar: 'ذيل الغاز/الأيونات', fr: 'Queue de gaz/ions', en: 'Gas/ion tail' },
      { ar: 'غاز متأين تدفعه الرياح الشمسية بعيداً عن الشمس مباشرة.', fr: 'Gaz ionisé poussé directement à l’opposé du Soleil par le vent solaire.', en: 'Ionized gas pushed straight away from the Sun by the solar wind.' }),
  ],
  blackhole: [
    A(undefined, undefined, [0, 0, 0],
      { ar: 'أفق الحدث', fr: 'Horizon des événements', en: 'Event horizon' },
      { ar: 'الحد الذي لا يستطيع الضوء بعده الإفلات؛ نصف قطر شفارتزشيلد.', fr: 'La limite au-delà de laquelle la lumière ne peut s’échapper.', en: 'The boundary beyond which light cannot escape.' }),
    A(undefined, undefined, [1.3, 0, 0],
      { ar: 'قرص التراكم', fr: 'Disque d’accrétion', en: 'Accretion disk' },
      { ar: 'مادة تسخن حتى ملايين الدرجات وتصدر الأشعة السينية قبل السقوط.', fr: 'Matière chauffée à des millions de degrés émettant des rayons X.', en: 'Matter heated to millions of degrees, emitting X-rays before falling in.' }),
    A(undefined, undefined, [0.9, 0.62, 0],
      { ar: 'الانحراف الجذبي للضوء', fr: 'Courbure gravitationnelle', en: 'Gravitational lensing' },
      { ar: 'الضوء ينحني حول الثقب فترى القرص خلفه فوقه وتحته (مثل صورة M87*).', fr: 'La lumière courbée fait voir le disque arrière au-dessus et au-dessous.', en: 'Curved light shows the far side of the disk above and below (as in M87*).' }),
  ],
  darkmatter: [
    A(undefined, undefined, [0, 0, 0],
      { ar: 'المجرة المرئية', fr: 'Galaxie visible', en: 'Visible galaxy' },
      { ar: 'النجوم والغاز — نحو 5% فقط من كتلة المجرة.', fr: 'Étoiles et gaz — environ 5 % seulement de la masse.', en: 'Stars and gas — only about 5% of the galaxy’s mass.' }),
    A(undefined, undefined, [0, 2.8, 2.2],
      { ar: 'هالة المادة المظلمة', fr: 'Halo de matière noire', en: 'Dark matter halo' },
      { ar: 'كتلة غير مرئية تمتد أبعد من القرص وتفسر ثبات سرعة الدوران.', fr: 'Masse invisible s’étendant au-delà du disque, expliquant la vitesse de rotation plate.', en: 'Invisible mass extending beyond the disk, explaining the flat rotation speed.' }),
  ],
}
