import { useState } from 'react'
import { t, type Lang } from './i18n'
import { sound } from './sound'
import { addInk, awardBadge } from './rewards'

interface StoryChoice {
  text: Record<Lang, string>
  next: string
}

interface StoryNode {
  id: string
  bg: string
  emoji: string
  text: Record<Lang, string>
  ink?: number
  choices?: StoryChoice[]
  isEnd?: boolean
}

const NODES: Record<string, StoryNode> = {
  start: {
    id: 'start',
    bg: 'linear-gradient(135deg, #16293f, #2b5a8c)',
    emoji: '✒️',
    text: {
      ar: 'في صباح مشمس، استيقظ القلم الصغير في محبرته وقال: «اليوم سأكتشف العالم!» إلى أين يتجه أولاً؟',
      fr: 'Un matin ensoleillé, la petite plume se réveilla dans son encrier et dit : « Aujourd’hui, je découvrirai le monde ! » Où va-t-elle en premier ?',
      en: 'One sunny morning, the little pen woke up in its inkwell and said: "Today I will discover the world!" Where does it go first?',
    },
    choices: [
      { text: { ar: 'نحو الشمس المشرقة ☀️', fr: 'Vers le soleil levant ☀️', en: 'Towards the rising sun ☀️' }, next: 'sun' },
      { text: { ar: 'نحو النهر الجاري 💧', fr: 'Vers la rivière qui coule 💧', en: 'Towards the flowing river 💧' }, next: 'water' },
    ],
  },
  sun: {
    id: 'sun',
    bg: 'linear-gradient(135deg, #e8962b, #7a4a12)',
    emoji: '☀️',
    text: {
      ar: 'قالت الشمس بابتسامة دافئة: «أهلاً أيها القلم! أنا نجمة كبيرة أعطي الأرض الضوء والحرارة. سؤالي لك: هل تعرف كم يبعد ضوئي عن الأرض؟»',
      fr: 'Le soleil dit avec un sourire chaleureux : « Bonjour petite plume ! Je suis une grande étoile qui donne lumière et chaleur à la Terre. Sais-tu combien de temps ma lumière met pour arriver ? »',
      en: 'The Sun said with a warm smile: "Hello, little pen! I am a big star giving Earth light and warmth. Do you know how long my light takes to arrive?"',
    },
    choices: [
      { text: { ar: 'ثماني دقائق تقريباً! ⏱️', fr: 'Environ huit minutes ! ⏱️', en: 'About eight minutes! ⏱️' }, next: 'sunYes' },
      { text: { ar: 'لا أعرف… أخبريني! 🤔', fr: 'Je ne sais pas… Dis-le-moi ! 🤔', en: 'I do not know… Tell me! 🤔' }, next: 'sunTell' },
    ],
  },
  sunYes: {
    id: 'sunYes',
    bg: 'linear-gradient(135deg, #e8962b, #7a4a12)',
    emoji: '🎉',
    text: {
      ar: '«أحسنت أيها القلم الذكي! نعم، ثماني دقائق تقريباً. أنت تلميذ ممتاز!» ووهبتك شعاعاً من نورها.',
      fr: '« Bravo, plume intelligente ! Oui, environ huit minutes. Tu es un excellent élève ! » Elle t’offrit un rayon de sa lumière.',
      en: '"Well done, smart pen! Yes, about eight minutes. You are an excellent student!" She gave you a ray of her light.',
    },
    ink: 3,
    choices: [{ text: { ar: 'تابع الرحلة 🧭', fr: 'Continuer le voyage 🧭', en: 'Continue the journey 🧭' }, next: 'cross' }],
  },
  sunTell: {
    id: 'sunTell',
    bg: 'linear-gradient(135deg, #e8962b, #7a4a12)',
    emoji: '💡',
    text: {
      ar: '«ضوئي يسافر ثماني دقائق ليصل إليك! تعلّم هذا جيداً.» كتب القلم المعلومة في دفتره الصغير.',
      fr: '« Ma lumière voyage huit minutes pour t’atteindre ! Retiens-le bien. » La plume nota la leçon dans son petit carnet.',
      en: '"My light travels eight minutes to reach you! Remember it well." The pen wrote the fact in its little notebook.',
    },
    ink: 3,
    choices: [{ text: { ar: 'تابع الرحلة 🧭', fr: 'Continuer le voyage 🧭', en: 'Continue the journey 🧭' }, next: 'cross' }],
  },
  water: {
    id: 'water',
    bg: 'linear-gradient(135deg, #2f9fd8, #123a5f)',
    emoji: '💧',
    text: {
      ar: 'رقصت قطرة الماء فرحاً: «مرحباً! أنا الماء، سرّ الحياة. هل تعرف ماذا يحدث لي عندما أتجمد؟»',
      fr: 'Une goutte d’eau dansa de joie : « Bonjour ! Je suis l’eau, le secret de la vie. Sais-tu ce qui m’arrive quand je gèle ? »',
      en: 'A water drop danced with joy: "Hello! I am water, the secret of life. Do you know what happens to me when I freeze?"',
    },
    choices: [
      { text: { ar: 'تتحولين إلى جليد! 🧊', fr: 'Tu deviens de la glace ! 🧊', en: 'You become ice! 🧊' }, next: 'waterYes' },
      { text: { ar: 'تختفين؟ 🙈', fr: 'Tu disparais ? 🙈', en: 'You disappear? 🙈' }, next: 'waterTell' },
    ],
  },
  waterYes: {
    id: 'waterYes',
    bg: 'linear-gradient(135deg, #2f9fd8, #123a5f)',
    emoji: '🧊',
    text: {
      ar: '«صحيح! أتجمد عند الصفر فأصير جليداً صلباً. أنت تعرف الكثير!» ومنحتك قطرة من صفائها.',
      fr: '« Exact ! Je gèle à zéro et deviens de la glace dure. Tu en sais beaucoup ! » Elle t’offrit une goutte de sa pureté.',
      en: '"Right! I freeze at zero and become hard ice. You know a lot!" She gave you a drop of her purity.',
    },
    ink: 3,
    choices: [{ text: { ar: 'تابع الرحلة 🧭', fr: 'Continuer le voyage 🧭', en: 'Continue the journey 🧭' }, next: 'cross' }],
  },
  waterTell: {
    id: 'waterTell',
    bg: 'linear-gradient(135deg, #2f9fd8, #123a5f)',
    emoji: '📝',
    text: {
      ar: '«عند الصفر أتجمد وأصير جليداً، وعند المئة أغلي وأصير بخاراً!» دوّن القلم ذلك بحبره الأزرق.',
      fr: '« À zéro je gèle et deviens glace, à cent je bouillonne et deviens vapeur ! » La plume le nota à l’encre bleue.',
      en: '"At zero I freeze into ice, and at one hundred I boil into steam!" The pen noted it down in blue ink.',
    },
    ink: 3,
    choices: [{ text: { ar: 'تابع الرحلة 🧭', fr: 'Continuer le voyage 🧭', en: 'Continue the journey 🧭' }, next: 'cross' }],
  },
  cross: {
    id: 'cross',
    bg: 'linear-gradient(135deg, #7d5ba6, #2b2147)',
    emoji: '🛤️',
    text: {
      ar: 'وصل القلم إلى مفترق طرق: هرم ضخم يلوح في الأفق، ومختبر صغير تتلألأ أنواره. أي طريق يسلك؟',
      fr: 'La plume arriva à un carrefour : une pyramide géante se dressait à l’horizon, et un petit laboratoire scintillait. Quel chemin prendre ?',
      en: 'The pen reached a crossroads: a giant pyramid stood on the horizon, and a small laboratory was twinkling. Which way to go?',
    },
    choices: [
      { text: { ar: 'الهرم الضخم 🐪', fr: 'La pyramide géante 🐪', en: 'The giant pyramid 🐪' }, next: 'pyramid' },
      { text: { ar: 'المختبر المضيء 🧪', fr: 'Le laboratoire brillant 🧪', en: 'The shining laboratory 🧪' }, next: 'lab' },
    ],
  },
  pyramid: {
    id: 'pyramid',
    bg: 'linear-gradient(135deg, #c78f4f, #5f4526)',
    emoji: '🐪',
    text: {
      ar: 'همس حجر عجوز من الهرم: «بُنيت من ملايين الحجارة قبل 4500 سنة! وفي قلبي غرفة سرية للملك… أتجرؤ على الدخول؟»',
      fr: 'Une vieille pierre de la pyramide murmura : « J’ai été bâtie avec des millions de pierres il y a 4 500 ans ! Et dans mon cœur se cache la chambre secrète du roi… Oses-tu entrer ? »',
      en: 'An old stone of the pyramid whispered: "I was built from millions of stones 4,500 years ago! And in my heart lies the king’s secret chamber… Do you dare enter?"',
    },
    choices: [
      { text: { ar: 'أدخل الغرفة السرية! 🗝️', fr: 'Entrer dans la chambre secrète ! 🗝️', en: 'Enter the secret chamber! 🗝️' }, next: 'secret' },
      { text: { ar: 'أكمل نحو الذرة ⚛️', fr: "Continuer vers l'atome ⚛️", en: 'Continue towards the atom ⚛️' }, next: 'atom' },
    ],
  },
  secret: {
    id: 'secret',
    bg: 'linear-gradient(135deg, #8a6d3b, #3c2f1a)',
    emoji: '🗝️',
    text: {
      ar: 'وجد القلم غرفة الملك! جدرانها تروي حكايات الفراعنة وكنوزهم. خرج منها وقد امتلأ دفتره بالأسرار.',
      fr: 'La plume trouva la chambre du roi ! Ses murs racontent les histoires des pharaons et de leurs trésors. Elle ressortit le carnet plein de secrets.',
      en: 'The pen found the king’s chamber! Its walls tell the stories of the pharaohs and their treasures. It came out with a notebook full of secrets.',
    },
    ink: 5,
    choices: [{ text: { ar: 'إلى الذرة ⚛️', fr: "Vers l'atome ⚛️", en: 'Towards the atom ⚛️' }, next: 'atom' }],
  },
  lab: {
    id: 'lab',
    bg: 'linear-gradient(135deg, #2e7d32, #12331b)',
    emoji: '🧪',
    text: {
      ar: 'في المختبر، استقبله عالم مرح: «مرحباً! هنا ندرس أصغر شيء في العالم: الذرة! هل تأتي معي؟»',
      fr: 'Au laboratoire, un savant joyeux l’accueillit : « Bienvenue ! Ici nous étudions la plus petite chose du monde : l’atome ! Viens-tu avec moi ? »',
      en: 'In the lab, a cheerful scientist welcomed him: "Welcome! Here we study the smallest thing in the world: the atom! Will you come with me?"',
    },
    choices: [{ text: { ar: 'نعم! إلى الذرة ⚛️', fr: "Oui ! Vers l'atome ⚛️", en: 'Yes! To the atom ⚛️' }, next: 'atom' }],
  },
  atom: {
    id: 'atom',
    bg: 'linear-gradient(135deg, #7d5ba6, #241a3d)',
    emoji: '⚛️',
    text: {
      ar: 'قالت الذرة بفخر: «أنا في كل شيء حولك! في الماء والهواء وحتى فيك أنت. حول نواتي تدور إلكترونات مثل الكواكب حول الشمس. إلى أين الآن؟»',
      fr: 'L’atome dit fièrement : « Je suis dans tout ce qui t’entoure ! Dans l’eau, dans l’air, et même en toi. Autour de mon noyau tournent des électrons comme des planètes autour du soleil. Où vas-tu maintenant ? »',
      en: 'The atom said proudly: "I am in everything around you! In water, in air, and even inside you. Around my nucleus, electrons orbit like planets around the sun. Where to now?"',
    },
    choices: [
      { text: { ar: 'إلى المريخ الأحمر 🚀', fr: 'Vers la planète rouge 🚀', en: 'To the red planet 🚀' }, next: 'mars' },
      { text: { ar: 'العودة إلى البيت 🏠', fr: 'Rentrer à la maison 🏠', en: 'Go back home 🏠' }, next: 'home' },
    ],
  },
  mars: {
    id: 'mars',
    bg: 'linear-gradient(135deg, #d76b4f, #4a1a10)',
    emoji: '🚀',
    text: {
      ar: 'قفز القلم إلى المريخ! عالم أحمر بارد فيه أكبر بركان في المجموعة الشمسية. يا لها من مغامرة! حان وقت العودة.',
      fr: 'La plume sauta jusqu’à Mars ! Un monde rouge et froid, avec le plus grand volcan du système solaire. Quelle aventure ! Il est temps de rentrer.',
      en: 'The pen jumped to Mars! A cold red world with the biggest volcano in the solar system. What an adventure! Time to go home.',
    },
    ink: 5,
    choices: [{ text: { ar: 'العودة إلى البيت 🏠', fr: 'Rentrer à la maison 🏠', en: 'Go back home 🏠' }, next: 'home' }],
  },
  home: {
    id: 'home',
    bg: 'linear-gradient(135deg, #16293f, #1f3a5f)',
    emoji: '🏠',
    text: {
      ar: 'عاد القلم إلى محبرته سعيداً، وقد امتلأ بالمعرفة: الشمس، الماء، الهرم، والذرة. قال: «غداً سأكتشف المزيد!»',
      fr: 'La plume rentra dans son encrier, heureuse et pleine de savoir : le soleil, l’eau, la pyramide et l’atome. « Demain, je découvrirai encore plus ! » dit-elle.',
      en: 'The pen returned to its inkwell, happy and full of knowledge: the sun, the water, the pyramid and the atom. "Tomorrow I will discover even more!" it said.',
    },
    ink: 5,
    isEnd: true,
  },
}

export default function StoryAdventure({ lang }: { lang: Lang }) {
  const [nodeId, setNodeId] = useState('start')
  const node = NODES[nodeId]
  const [flash, setFlash] = useState(0)

  const go = (next: string, ink?: number) => {
    sound.pop()
    if (ink) {
      addInk(ink)
      setFlash((f) => f + 1)
    }
    if (NODES[next].isEnd) {
      addInk(NODES[next].ink ?? 0)
      awardBadge('adventurer')
      sound.success()
    }
    setNodeId(next)
  }

  return (
    <div className="page-wide story">
      <h1 className="article-title">🧭 {t(lang, 'navStory')}</h1>
      <div className="story-card" style={{ background: node.bg }} key={node.id}>
        <span className="story-emoji">{node.emoji}</span>
        <p className="story-text">{node.text[lang]}</p>
        {node.choices && (
          <div className="story-choices">
            {node.choices.map((c, i) => (
              <button key={i} className="story-choice" onClick={() => go(c.next, node.ink)}>
                {c.text[lang]}
              </button>
            ))}
          </div>
        )}
        {node.isEnd && (
          <div className="story-end">
            <p className="story-end-text">🎉 {t(lang, 'storyEnd')}</p>
            <button className="primary-btn" onClick={() => (setNodeId('start'), sound.click())}>
              {t(lang, 'storyStart')} ↺
            </button>
            <button
              className="ghost-btn small"
              onClick={() => (window.location.hash = `#/article/${'sun'}`)}
            >
              📖 {t(lang, 'articles')}
            </button>
          </div>
        )}
        {flash > 0 && <span key={flash} className="story-ink-flash">+💧</span>}
      </div>
      {!node.isEnd && (
        <button className="ghost-btn small" onClick={() => setNodeId('start')}>
          ↺ {t(lang, 'storyStart')}
        </button>
      )}
    </div>
  )
}
