import type { Lang } from './i18n'
import type { StageKey } from './stellarFigures'

/** Kid register (4–15) for each stage caption — always distinct from the adult register. */
export const STAGE_CHILD: Record<StageKey, Record<Lang, string>> = {
  cloud: {
    ar: 'سحابة ضخمة من الغاز والغبار في الفضاء، باردة ومظلمة، ومنها ستولد النجوم.',
    fr: 'Un immense nuage de gaz et de poussière dans l’espace, froid et sombre : c’est là que naissent les étoiles.',
    en: 'A huge cloud of gas and dust in space, cold and dark — stars are born inside it.',
  },
  protostar: {
    ar: 'الغيمة تنضغط وتصير كرة ساخنة، ولا يزال حولها قرص من الغبار.',
    fr: 'Le nuage se serre et devient une boule chaude, entourée d’un disque de poussière.',
    en: 'The cloud squeezes into a hot ball, still wrapped in a dusty disk.',
  },
  mainSun: {
    ar: 'النجم يشتعل! في قلبه يتحول الهيدروجين إلى هيليوم فيضيء مثل شمسنا.',
    fr: 'L’étoile s’allume ! Dans son cœur, l’hydrogène devient de l’hélium : elle brille comme notre Soleil.',
    en: 'The star lights up! In its core hydrogen turns into helium, so it shines like our Sun.',
  },
  mainMassive: {
    ar: 'نجم أكبر بكثير وأشد حرارة، لونه أزرق، ويستهلك وقوده بسرعة.',
    fr: 'Une étoile bien plus grosse et plus chaude, bleue, qui brûle son carburant très vite.',
    en: 'A much bigger, hotter blue star that burns its fuel very fast.',
  },
  redGiant: {
    ar: 'النجم ينتفخ ويصبح أحمر عملاقاً، ثم يطرد طبقاته في الفضاء.',
    fr: 'L’étoile gonfle et devient une géante rouge, puis elle souffle ses couches dans l’espace.',
    en: 'The star swells into a red giant, then blows its layers into space.',
  },
  redSupergiant: {
    ar: 'عملاق ضخم جداً، داخله طبقات كثيرة تحترق واحدة تحت الأخرى.',
    fr: 'Un supergéant énorme, avec plusieurs couches qui brûlent l’une sous l’autre.',
    en: 'A huge supergiant with many layers burning one beneath another.',
  },
  planetary: {
    ar: 'الغاز المطرود يتوهج بألوان جميلة حول قلب النجم الساخن.',
    fr: 'Le gaz éjecté brille de belles couleurs autour du cœur chaud de l’étoile.',
    en: 'The ejected gas glows in beautiful colours around the star’s hot core.',
  },
  supernova: {
    ar: 'النجم ينفجر بقوة هائلة! وينثر المواد التي ستكوّن نجومًا وكواكب جديدة.',
    fr: 'L’étoile explose violemment et disperse la matière qui formera de nouvelles étoiles et planètes.',
    en: 'The star explodes powerfully, scattering the material that will make new stars and planets.',
  },
  whiteDwarf: {
    ar: 'يبقى قلب صغير جداً وكثيف، بحجم الأرض تقريباً، يبرد ببطء.',
    fr: 'Il reste un cœur minuscule et très dense, de la taille de la Terre, qui refroidit lentement.',
    en: 'A tiny, very dense core about Earth’s size remains and slowly cools.',
  },
  brownDwarf: {
    ar: 'نجم صغير جداً لم يشتعل، فيبقى دافئاً وخافتاً مثل كوكب كبير.',
    fr: 'Une étoile trop petite qui ne s’allume pas : elle reste tiède et faible, comme une grosse planète.',
    en: 'A star too small to ignite: it stays warm and faint, like a giant planet.',
  },
  neutron: {
    ar: 'بقية صغيرة جداً بحجم مدينة، لكنها ثقيلة جداً وتدور بسرعة.',
    fr: 'Un reste minuscule de la taille d’une ville, mais très lourd et qui tourne très vite.',
    en: 'A tiny city-sized remnant, but extremely heavy and spinning very fast.',
  },
  blackHole: {
    ar: 'جاذبيته قوية جداً لدرجة أن الضوء نفسه لا يستطيع الهروب منه.',
    fr: 'Sa gravité est si forte que même la lumière ne peut pas s’échapper.',
    en: 'Its gravity is so strong that even light cannot escape.',
  },
}
