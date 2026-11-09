/** Explanatory captions + realistic image-generation prompts per stellar stage. */
import type { Lang } from './i18n'

export type StageKey =
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

type Fig = {
  /** Short explanatory caption shown above the image. */
  caption: Record<Lang, string>
  /** English prompt for a photoreal image generator (Midjourney / DALL·E / SDXL). */
  prompt: string
  /** Suggested asset path; when present the <img> replaces the SVG portrait. */
  file: string
}

const base = 'stellar/'

export const STAGE_FIGURES: Record<StageKey, Fig> = {
  cloud: {
    caption: {
      ar: 'سحابة جزيئية كثيفة وباردة؛ الغبار يحجب الضوء فتظهر معتمة متعرجة، وفي أجزائها الأكثف يبدأ الانهيار الجاذبي.',
      fr: 'Un nuage moléculaire dense et froid : la poussière bloque la lumière, d’où ces volutes sombres où l’effondrement gravitationnel commence.',
      en: 'A dense, cold molecular cloud: dust blocks starlight, creating dark wisps where gravitational collapse begins.',
    },
    prompt:
      'Photorealistic deep-space photograph of a giant molecular cloud, dust lanes silhouetted against faint stars, faint red and teal emission edges, Hubble-style, ultra detailed, 8k, no text',
    file: base + 'cloud.webp',
  },
  protostar: {
    caption: {
      ar: 'نجم أوليّ يلتف حوله قرص من الغاز والغبار، وتنطلق منه نفاثات متقابلة؛ الحرارة ترتفع بالانضغاط قبل اشتعال الهيدروجين.',
      fr: 'Une protoétoile entourée d’un disque de gaz et de poussière projette des jets opposés ; le cœur s’échauffe par compression avant l’hydrogène.',
      en: 'A protostar wrapped in a gas-and-dust disk, launching bipolar jets; the core heats by compression before hydrogen ignites.',
    },
    prompt:
      'Photorealistic astronomy image of a young protostar with a circumstellar accretion disk seen at an angle, biconical jets, warm orange glow, dark background, JWST style, 8k',
    file: base + 'protostar.webp',
  },
  mainSun: {
    caption: {
      ar: 'سطح الشمس حُبيبات حمل حراري متجددة، وحوافّها أبرد وأقل ضوءاً (تعتيم الطرف)؛ في اللب يندمج الهيدروجين إلى هيليوم.',
      fr: 'La surface du Soleil montre des granules de convection et un bord assombri (limb darkening) ; au cœur, l’hydrogène fusionne en hélium.',
      en: 'The Sun’s surface shows convective granulation and a darker limb; in the core, hydrogen fuses into helium.',
    },
    prompt:
      'Photorealistic close-up of the Sun’s photosphere, fine convective granulation, limb darkening, small sunspot group, golden plasma, NASA SDO style, 8k, no text',
    file: base + 'main-sun.webp',
  },
  mainMassive: {
    caption: {
      ar: 'نجم ضخم أزرق شديد الحرارة؛ سطحه أشد حرارة من الشمس بكثير، ورياحه النجمية القوية تنزع طبقاته بمرور الزمن.',
      fr: 'Une étoile massive bleue très chaude, bien plus que le Soleil ; ses vents violents arrachent ses couches au fil du temps.',
      en: 'A massive, very hot blue star, far hotter than the Sun; its strong winds strip away layers over time.',
    },
    prompt:
      'Photorealistic image of a massive blue-white O-type star, intense ultraviolet glow, stellar wind filaments, companion stars distant, Hubble style, 8k',
    file: base + 'main-massive.webp',
  },
  redGiant: {
    caption: {
      ar: 'عند نفاد الهيدروجين في اللب يتقلص وينتفخ الغلاف؛ يبرد السطح فيحمرّ اللون، وتظهر خلايا حمل عملاقة وبقع سطحية.',
      fr: 'Quand l’hydrogène du cœur s’épuise, le noyau se contracte et l’enveloppe gonfle ; la surface refroidit et rougit, avec d’énormes cellules de convection.',
      en: 'As core hydrogen runs out, the core contracts and the envelope swells; the surface cools and reddens, with huge convective cells.',
    },
    prompt:
      'Photorealistic red giant star, enormous bloated orange-red photosphere with giant convection cells and dark spots, subtle pulsation, deep space, 8k',
    file: base + 'red-giant.webp',
  },
  redSupergiant: {
    caption: {
      ar: 'عملاق عظيم أحمر تضطرم داخله طبقات اندماج متتالية كالبصل، حتى يصل اللب إلى الحديد الذي لا يمنح طاقة إضافية.',
      fr: 'Une supergéante rouge où des couches de fusion s’emboîtent comme un oignon, jusqu’à un noyau de fer qui ne libère plus d’énergie.',
      en: 'A red supergiant with onion-like burning shells, ending in an iron core that yields no more energy.',
    },
    prompt:
      'Photorealistic red supergiant, vast tenuous envelope, dust shells, faint circumstellar material, orange-red tones, Hubble/Webb composite style, 8k',
    file: base + 'red-supergiant.webp',
  },
  planetary: {
    caption: {
      ar: 'الغلاف المقذوف يتوهج بألوان الانبعاث حول قلب مكشوف حار جداً؛ هذه «السديم الكوكبي» مرحلة قصيرة بمقاييس كونية.',
      fr: 'L’enveloppe éjectée brille en raies d’émission autour d’un cœur nu très chaud : cette nébuleuse planétaire est très brève à l’échelle cosmique.',
      en: 'The ejected envelope glows in emission lines around a very hot bare core; this planetary nebula is brief on cosmic scales.',
    },
    prompt:
      'Photorealistic planetary nebula with teal and gold rings, central hot white dwarf, filamentary structure, JWST style, 8k, no text',
    file: base + 'planetary.webp',
  },
  supernova: {
    caption: {
      ar: 'انهيار اللب الحديدي في أقل من ثانية يطلق نيوترينوات وموجة صدمة؛ فينفجر النجم وينثر عناصر ثقيلة في الفضاء.',
      fr: 'L’effondrement du cœur de fer en moins d’une seconde libère des neutrinos et une onde de choc : l’étoile explose et disperse des éléments lourds.',
      en: 'The iron core collapses in under a second, releasing neutrinos and a shock wave; the star explodes and scatters heavy elements.',
    },
    prompt:
      'Photorealistic core-collapse supernova remnant, expanding shock ring, filamentary ejecta in red, blue and gold, bright central flash, Hubble style, 8k',
    file: base + 'supernova.webp',
  },
  whiteDwarf: {
    caption: {
      ar: 'قلب كثيف بحجم الأرض تقريباً وكتلة قريبة من الشمس، يدعمه ضغط تدهور الإلكترونات؛ يبرد ببطء شديد على مليارات السنين.',
      fr: 'Un cœur dense de la taille de la Terre pour une masse proche du Soleil, soutenu par la dégénérescence des électrons ; il refroidit sur des milliards d’années.',
      en: 'An Earth-sized, Sun-mass dense core held up by electron degeneracy pressure; it cools over billions of years.',
    },
    prompt:
      'Photorealistic white dwarf star, extremely small brilliant blue-white point with diffraction spikes, faint surrounding planetary nebula remnant, 8k',
    file: base + 'white-dwarf.webp',
  },
  brownDwarf: {
    caption: {
      ar: 'قزم بني: كتلته لا تكفي لإشعال الهيدروجين، فيندمج الديوتيريوم فقط؛ يبرد عبر أطياف L وT وY ويبدو ككوكب عملاق دافئ.',
      fr: 'Naine brune : trop peu massive pour allumer l’hydrogène, elle ne fusionne que le deutérium ; elle refroidit en classes L, T, Y.',
      en: 'Brown dwarf: too low-mass to ignite hydrogen, fusing only deuterium; it cools through spectral classes L, T and Y.',
    },
    prompt:
      'Photorealistic brown dwarf with banded cloudy atmosphere in magenta and dark red tones, dim glow, JWST style, 8k',
    file: base + 'brown-dwarf.webp',
  },
  neutron: {
    caption: {
      ar: 'بقايا انهيار اللب: كرة بحجم مدينة وكثافة نووية، تدور بسرعة وترسل حزم إشعاع؛ إن كانت دوارة نسميها نبّاضاً.',
      fr: 'Résidu d’effondrement : une sphère de la taille d’une ville à densité nucléaire, qui tourne vite et émet des faisceaux ; c’est un pulsar si elle est en rotation.',
      en: 'A collapse remnant: city-sized at nuclear density, spinning fast and beaming radiation; a pulsar when rotating.',
    },
    prompt:
      'Photorealistic neutron star with twin polar beams, intense magnetic field glow, accretion threads, blue-white core, 8k',
    file: base + 'neutron.webp',
  },
  blackHole: {
    caption: {
      ar: 'إذا تجاوزت البقايا الحد الأقصى لكتلة النجم النيوتروني، تنطبق الجاذبية على نفسها فتتشكل حافة لا يفلت منها الضوء: أفق الحدث.',
      fr: 'Si le résidu dépasse la masse maximale d’une étoile à neutrons, la gravité l’emporte et une limite d’où la lumière ne s’échappe pas apparaît : l’horizon.',
      en: 'If the remnant exceeds the maximum neutron-star mass, gravity wins and a boundary appears from which light cannot escape: the event horizon.',
    },
    prompt:
      'Photorealistic black hole with a bright orange accretion disk, photon ring, gravitational lensing, deep space, EHT-inspired, 8k',
    file: base + 'black-hole.webp',
  },
}
