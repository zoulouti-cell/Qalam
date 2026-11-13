import RecordedArabic, { recordingForTitle } from './RecordedArabic'
import KidsLibrary, { childEdition } from './KidsLibrary'
import { routeForAudience } from './audienceRouting'
import './audiencePaths.css'
import ArticleNavigation from './ArticleNavigation'
import './experience.css'
import TopicExperience from './TopicExperience'
import LearningRouteRail from './LearningRouteRail'
import { LEARNING_THEMES, themeById } from './learningRoute'
import { reconcileArticles, articleMatchesId } from './articleCollection'
import { isReplacedSpaceArticle } from './spaceArticles'
import TypewriterText from './TypewriterText'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Mi from './Mi'
import { viewContent } from './register'
import { sanitizeArticles } from './sanitize'
import ErrorBoundary from './ErrorBoundary'
import QuranText from './QuranText'
import IslamicLearning from './IslamicLearning'
import { LANGS, LANG_LABELS, UI, t, normalize, type Lang } from './i18n'
import { QUIZ, articleHasLanguage, type Article, type ArticleSource } from './data'
import { domainForArticle } from './articleDomain'
import { loadCustomArticles, loadLevel, saveLevel, loadDone, addDone } from './storage'
import {
  FACTS,
  FACTS_NEW,
  NEW_ARTICLES,
  ALL_ARTICLES_FULL,
  articleMeta,
  articleCardVisual,
  articleCardCategory,
  type Level,
} from './content'
const Library = lazy(() => import('./Library'))
import type { LabModule } from './Lab'
const TransportCommunicationsHub = lazy(() => import('./HistoryPortals').then(module=>({default:module.TransportCommunicationsHub})))
const WarPeaceHub = lazy(() => import('./HistoryPortals').then(module=>({default:module.WarPeaceHub})))
const ScienceHistoryHub = lazy(() => import('./HistoryPortals').then(module=>({default:module.ScienceHistoryHub})))
const Tutor = lazy(() => import('./Tutor'))
const Editor = lazy(() => import('./Editor'))
const ArticleMedia = lazy(() => import('./ArticleMedia'))
const KidsLearningStudio = lazy(() => import('./KidsLearningStudio'))
const FrontierExplorer = lazy(() => import('./FrontierExplorer'))
const FutureLens = lazy(() => import('./FutureLens'))
const MathAcademy = lazy(() => import('./MathAcademy'))
const HumanitiesExplorer = lazy(() => import('./HumanitiesExplorer'))
const MoroccoAcademy = lazy(() => import('./MoroccoAcademy'))
const HistoryPage = lazy(() => import('./HistoryPage'))
const ThoughtAcademy = lazy(() => import('./ThoughtAcademy'))
const CulturalJourneys = lazy(() => import('./CulturalJourneys'))
const LanguagesAcademy = lazy(() => import('./LanguagesAcademy'))
const PathPage = lazy(() => import('./PathPage'))
import LevelGate from './LevelGate'
const Generator = lazy(() => import('./Generator'))
const Atlas = lazy(() => import('./Atlas'))
const TopicPage = lazy(() => import('./TopicPage'))
const Mars3D = lazy(() => import('./Mars3D'))
const CosmosExplorer = lazy(() => import('./CosmosExplorer'))
const CosmosKids = lazy(() => import('./CosmosKids'))
const Lab = lazy(() => import('./Lab'))
const MemoryGame = lazy(() => import('./MemoryGame'))
const Profile = lazy(() => import('./Profile'))
const StoryAdventure = lazy(() => import('./StoryAdventure'))
const SlideShow = lazy(() => import('./SlideShow'))
const ListenGame = lazy(() => import('./ListenGame'))
const KnowledgeSky = lazy(() => import('./KnowledgeSky'))
import VoiceSearch from './VoiceSearch'
const LessonPlan = lazy(() => import('./LessonPlan'))
import { sectionMeta, sectionCoverStyle } from './sections'
import { sound, speak, stopSpeak } from './sound'
import { addInk, awardBadge, checkArticleBadges, useLang } from './rewards'
import { loadInk } from './storage'
import { publicUrl } from './publicUrl'

const ALL_ARTICLES = ALL_ARTICLES_FULL
const NEW_IDS = new Set(NEW_ARTICLES.map((a) => a.id))
const FULL_COLLECTION_FILES = [
  'data/collectionFr.json',
  'data/wikiArticles.json',
  'data/library_extra.json',
  'data/library_extra2.json',
  'data/library_extra3.json',
  'data/library_extra4.json',
  'data/library_extra5.json',
]
let fullCollectionRequest: Promise<Article[]> | null = null

function fetchFullCollection(): Promise<Article[]> {
  if (!fullCollectionRequest) {
    fullCollectionRequest = Promise.all(
      FULL_COLLECTION_FILES.map(async (url) => {
        const response = await fetch(publicUrl(url))
        if (!response.ok) throw new Error(`Could not load ${url}`)
        const list: unknown = await response.json()
        return Array.isArray(list) ? list as Article[] : []
      })
    ).then((packs) => {
      return packs.flat().reverse()
    }).catch((error) => {
      fullCollectionRequest = null
      throw error
    })
  }
  return fullCollectionRequest
}

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash
}

function usePreviousAppHash() {
  const previous = useRef<string | null>(null)
  const current = useRef(window.location.hash)
  useEffect(() => {
    const onHash = () => {
      const next = window.location.hash
      if (next !== current.current) {
        previous.current = current.current
        current.current = next
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return previous
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export default function App() {
  const [lang, setLang] = useState<Lang>('ar')
  const [query, setQuery] = useState('')
  const [custom, setCustom] = useState<Article[]>(() => loadCustomArticles())
  const [level, setLevel] = useState<Level | null>(() => loadLevel())
  const [showGate, setShowGate] = useState(false)
  const [muted, setMuted] = useState(sound.isMuted())
  const [done, setDone] = useState<string[]>(() => loadDone())
  const [ink, setInkState] = useState(() => loadInk())
  const [collection, setCollection] = useState<Article[]>([])
  const [collectionLoaded, setCollectionLoaded] = useState(false)
  const [collectionLoading, setCollectionLoading] = useState(false)
  const [collectionError, setCollectionError] = useState(false)
  const [showFullCollection, setShowFullCollection] = useState(false)
  const [collectionRequestKey, setCollectionRequestKey] = useState(0)
  const kidMode = level === 'kids'
  const hash = useHashRoute()
  const previousAppHash = usePreviousAppHash()

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = UI[lang].appName
  }, [lang])

  useEffect(() => {
    try {
      localStorage.setItem('encarta.kidmode', kidMode ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [kidMode])

  useEffect(() => {
    const f = () => setInkState(loadInk())
    window.addEventListener('encarta-rewards', f)
    return () => window.removeEventListener('encarta-rewards', f)
  }, [])

  const pickLang = (l: Lang) => {
    setLang(l)
    useLang(l)
  }

  const refreshCustom = () => setCustom(loadCustomArticles())

  const pickLevel = (l: Level, destination?: 'home'|'time'|'place') => {
    setLevel(l)
    saveLevel(l)
    const audience = l === 'kids' ? 'kids' : 'academic'
    if (/^#\/explorer\/(kids|academic)/.test(window.location.hash)) window.location.hash = window.location.hash.replace(/^(#\/explorer\/)(kids|academic)/, `$1${audience}`)
    else if (/\?audience=(kids|academic)/.test(window.location.hash)) window.location.hash = window.location.hash.replace(/\?audience=(kids|academic)/, `?audience=${audience}`)
    if(destination)window.location.hash=destination==='home'?'#/':`#/journey/${destination}`
    setShowGate(false)
  }

  const toggleMute = () => {
    sound.toggleMute()
    setMuted(sound.isMuted())
    if (!sound.isMuted()) sound.click()
  }

  const markDone = (id: string) => {
    const prev = loadDone()
    if (!prev.includes(id)) {
      addDone(id)
      const next = loadDone()
      setDone(next)
      addInk(5)
      checkArticleBadges(next)
    } else {
      setDone(loadDone())
    }
  }

  const rawRoute = hash.replace(/^#\/?/, '')
  const route = routeForAudience(rawRoute,level)
  useEffect(()=>{if(rawRoute!==route)window.history.replaceState(null,'',`#/${route}`)},[rawRoute,route])
  const articleMatch = route.match(/^article\/([^?]+)(?:\?audience=(kids|academic))?$/)
  useEffect(() => {
    if (articleMatch) window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [articleMatch?.[1]])
  const returnToPreviousPage = (fallback = '#/') => {
    if (previousAppHash.current?.startsWith('#/')) window.history.back()
    else window.location.hash = fallback
  }
  const sectionMatch = route.match(/^section\/(.+)$/)
  useEffect(() => {
    if (!sectionMatch) return
    requestAnimationFrame(() => document.querySelector('.section-hero')?.scrollIntoView({ behavior: 'auto', block: 'start' }))
  }, [route])
  const libraryMatch = route.match(/^library(?:\/view\/(.+))?$/)
  const showQuiz = route === 'quiz'
  const showTutor = route === 'tutor'
  const showEditor = route === 'editor'
  const pathMatch = route.match(/^path(?:\/([a-z-]+))?(?:\?step=check)?$/)
  const showPath = Boolean(pathMatch)
  const showGenerator = route === 'generate'
  const journeyAxisMatch=route.match(/^journey(?:\/(time|place))?$/)
  const showAtlas = route === 'atlas' || Boolean(journeyAxisMatch)
  const explorerMatch = route.match(/^explorer\/(kids|academic)(?:\/([a-z-]+))?(?:\/(time|place))?$/)
  useEffect(() => {
    // Preserve old bookmarks while keeping foresight content in its single home.
    if (explorerMatch?.[2] === 'future') window.location.hash = '#/future'
  }, [explorerMatch?.[2]])
  const showExplorer = Boolean(explorerMatch) || showAtlas
  const futureMatch = route.match(/^future(?:\/([a-z-]+))?(?:\?theme=[a-z-]+)?$/)
  const showFuture = Boolean(futureMatch)
  const futureLensMatch = route.match(/^future-lens(?:\/([a-z-]+))?$/)
  const futureTopic = futureMatch?.[1]
  useEffect(()=>{if(futureTopic==='stellar-life')window.location.hash=`#/explorer/${level==='kids'?'kids':'academic'}/space/time`},[futureTopic,level])
  const labMatch = route.match(/^lab(?:\/(math|chemistry|physics|body|earth|human|technology|space)(?:\/(blackholes))?)?(?:\?theme=[a-z-]+)?$/)
  const showLab = Boolean(labMatch)
  const requestedLabTheme = route.match(/[?&]theme=([a-z-]+)/)?.[1]
  const labTheme = requestedLabTheme && themeById(requestedLabTheme)?.lab === labMatch?.[1] ? requestedLabTheme : undefined
  const showGame = route === 'game'
  const showProfile = route === 'profile'
  const showStory = route === 'story'
  const showListen = route === 'listen'
  const showLearningHub = route === 'learning'
  const showIslamicLearning = route === 'islamic-learning'
  const showPlayHub = route === 'play'
  const showMath = route === 'math'
  const showHumanities = route === 'humanities'
  const showMorocco = route === 'morocco'
  const showThought = route === 'thought'
  const showLanguages = route === 'languages'
  const journeyMatch = route.match(/^journey\/(history|literature|law)$/)
  const galleryMatch = route.match(/^figures$/)
  const historyMatch = route.match(/^history\/(medicine|transport|communications|mathematics|chemistry|physics|war|peace)$/)
  const topicMatch = route.match(/^topic\/([a-z]+)$/)
  const cosmosMatch = route.match(/^cosmos$/)
  const marsMatch = route.match(/^mars$/)

  const all = useMemo(() => reconcileArticles([...custom, ...ALL_ARTICLES, ...collection]).filter(a => !isReplacedSpaceArticle(a)), [custom, collection])
  const requestedArticle = articleMatch ? safeDecodeURIComponent(articleMatch[1]) : null
  const needsFullArticle = requestedArticle !== null && !all.some((article) => articleMatchesId(article, requestedArticle))
  const shouldLoadFullCollection = query.trim().length >= 2 || Boolean(sectionMatch) || showFullCollection || needsFullArticle || (showExplorer && Boolean(explorerMatch?.[2]))

  useEffect(() => {
    if (!route.startsWith('window/')) return
    const target = route.endsWith('/today') ? 'today-facts-cards' : route.endsWith('/future') ? 'window-future' : 'editor-picks'
    requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [route])

  useEffect(() => {
    if (!shouldLoadFullCollection || collectionLoaded) return
    let active = true
    setCollectionLoading(true)
    setCollectionError(false)
    fetchFullCollection()
      .then((articles) => {
        if (!active) return
        setCollection((prev) => [...prev, ...sanitizeArticles(articles)])
        setCollectionLoaded(true)
      })
      .catch(() => {
        if (active) setCollectionError(true)
      })
      .finally(() => {
        if (active) setCollectionLoading(false)
      })
    return () => { active = false }
  }, [shouldLoadFullCollection, collectionLoaded, collectionRequestKey])

  const visualAudience = level === 'kids' ? 'kids' : 'academic'

  useEffect(() => { document.body.classList.toggle('mode-kids', visualAudience === 'kids') }, [visualAudience])

  if (level === null || showGate) {
    return <LevelGate lang={lang} current={level} onPick={pickLevel} onLang={pickLang} />
  }

  return (
    <div className="app-shell" data-audience={visualAudience} onClickCapture={event => { if (visualAudience === 'kids' && (event.target as Element).closest('a.card,a.section-hub-card,a.side-card-link')) sound.pop() }}>
      <Header
        lang={lang}
        onLang={pickLang}
        route={route}
        level={level}
        muted={muted}
        onMute={toggleMute}
        onChangeLevel={() => setShowGate(true)}
        ink={ink}
        onChooseLevel={pickLevel}
      />
      <div className="content-shell">
        <div className="context-strip" role="status" aria-live="polite">
          <span className="ctx-item">
            <Mi name="translate" />
            {lang === 'ar' ? 'العربية' : lang === 'fr' ? 'Français' : 'English'}
          </span>
          <span className="ctx-sep">·</span>
          <span className="ctx-path-label"><Mi name={level==='kids'?'child_care':'school'}/>{lang==='ar'?(level==='kids'?'مسار الصغار':'مسار الكبار'):lang==='fr'?(level==='kids'?'Parcours enfants':'Parcours adultes'):(level==='kids'?'Children’s path':'Adult path')}</span>
          <span className="ctx-sep">·</span>
          <span className="ctx-item ctx-note">
            {lang === 'ar'
              ? 'تُعرض المواد المتاحة بالعربية لهذا المستوى'
              : lang === 'fr'
                ? 'Les contenus disponibles en français sont adaptés à ce niveau'
                : 'Available English content is adapted to this level'}
          </span>
        </div>
        <main className="main" key={level+':'+route.replace(/^(explorer\/(?:kids|academic)\/[a-z-]+)\/(?:time|place)$/, '$1')}>
        <LearningRouteRail route={route} lang={lang} level={level}/>
        <ErrorBoundary lang={lang}>
        <Suspense fallback={
          <div className="lazy-loading" role="status" aria-live="polite">
            <Mi name="progress_activity" />
            {lang === 'ar' ? 'جارٍ تجهيز هذا الركن…' : lang === 'fr' ? 'Préparation de cette rubrique…' : 'Preparing this section…'}
          </div>
        }>
        {articleMatch ? (
          <ArticlePage
            id={safeDecodeURIComponent(articleMatch[1])}
            lang={lang}
            level={level}
            all={all}
            done={done.includes(safeDecodeURIComponent(articleMatch[1]))}
            onDone={markDone}
            onBack={returnToPreviousPage}
          />
        ) : showQuiz ? (
          <QuizPage lang={lang} onBack={() => (window.location.hash = '#/')} />
        ) : showMath ? (
          <MathAcademy lang={lang} level={level} />
        ) : showHumanities ? (
          <HumanitiesExplorer lang={lang} level={level} />
        ) : showMorocco ? (
          <MoroccoAcademy lang={lang} level={level} />
        ) : showThought ? (
          <ThoughtAcademy lang={lang} level={level} />
        ) : showLanguages ? (
          <LanguagesAcademy lang={lang} level={level} />
        ) : journeyMatch ? (
          <CulturalJourneys lang={lang} level={level} domain={journeyMatch[1] as 'history' | 'literature' | 'law'} />
        ) : showTutor ? (
          <Tutor lang={lang} />
        ) : showEditor ? (
          <Editor lang={lang} onChanged={refreshCustom} />
        ) : libraryMatch ? (
          level==='kids'?<KidsLibrary articles={all} lang={lang}/>:<Library lang={lang} view={libraryMatch[1] ?? null} />
        ) : showPath ? (
          <PathPage lang={lang} done={done} level={level} themeId={pathMatch?.[1]} focusCheck={route.endsWith('?step=check')} />
        ) : showGenerator ? (
          <Generator lang={lang} onSaved={refreshCustom} />
        ) : showExplorer ? (
          <>
            <Atlas lang={lang} level={level} audience={level === 'kids' ? 'kids' : 'academic'} initialDomain={explorerMatch?.[2]} initialAxis={explorerMatch?.[3] === 'place' || journeyAxisMatch?.[1] === 'place' ? 'place' : 'time'} articles={all} collectionLoading={collectionLoading} collectionError={collectionError} onRetry={() => { setShowFullCollection(true); setCollectionRequestKey((key) => key + 1) }} />
            {level === 'kids' && !explorerMatch?.[2] && <KidsLearningStudio lang={lang} />}
          </>
        ) : futureLensMatch ? (
          <FutureLens lang={lang} level={level} id={futureLensMatch[1]} />
        ) : showFuture ? (
          <>
            <FrontierExplorer lang={lang} level={level} initialId={futureMatch?.[1]} />
          </>
        ) : showLab ? (
          <Lab lang={lang} level={level} kidMode={kidMode} initialModule={labMatch?.[1] as LabModule | undefined} initialSpaceTopic={labMatch?.[2]} themeId={labTheme} />
        ) : showLearningHub ? (
          <ContentCardHub lang={lang} section="learning" level={level} />
        ) : showIslamicLearning ? (
          <IslamicLearning lang={lang} level={level} />
        ) : showPlayHub ? (
          <ContentCardHub lang={lang} section="play" level={level} />
        ) : showGame ? (
          <MemoryGame lang={lang} />
        ) : showProfile ? (
          <Profile lang={lang} />
        ) : showStory ? (
          <StoryAdventure lang={lang} />
        ) : showListen ? (
          <ListenGame lang={lang} />
        ) : cosmosMatch ? (
          level !== 'kids' ? <div className="page"><CosmosExplorer lang={lang} /></div> : <div className="page"><CosmosKids lang={lang} /></div>
        ) : marsMatch ? (
          <div className="page"><Mars3D lang={lang} /></div>
        ) : route === 'war-peace' ? (
          <WarPeaceHub lang={lang} level={level} />
        ) : route === 'transport' ? (
          <TransportCommunicationsHub lang={lang} level={level} />
        ) : route === 'science-history' ? (
          <ScienceHistoryHub lang={lang} level={level} />
        ) : historyMatch ? (
          <HistoryPage id={historyMatch[1]} lang={lang} level={level} />
        ) : topicMatch ? (
          <TopicPage id={topicMatch[1]} lang={lang} level={level} all={all} />
        ) : galleryMatch ? (
          <Atlas lang={lang} level={level} audience={level === 'kids' ? 'kids' : 'academic'} articles={all} />
        ) : sectionMatch ? (
          <SectionPage
            lang={lang}
            cat={safeDecodeURIComponent(sectionMatch[1])}
            all={all}
            level={level}
            onBack={() => returnToPreviousPage('#/')}
          />
        ) : (
          <HomePage
            lang={lang}
            query={query}
            onQuery={setQuery}
            all={all}
            level={level}
            done={done}
            collectionLoaded={collectionLoaded}
            collectionLoading={collectionLoading}
            collectionError={collectionError}
            onLoadFullCollection={() => {
              setShowFullCollection(true)
              setCollectionRequestKey((key) => key + 1)
            }}
          />
        )}
        </Suspense>
        </ErrorBoundary>
        </main>
        <footer className="footer">
          <p>{t(lang, 'footer')}</p>
          <p className="footer-license">{t(lang, 'licenseNote')}</p>
        </footer>
      </div>
    </div>
  )
}

type NavEntry = { key: string; label: Record<Lang, string>; icon: string }
const NAV_SECTIONS: NavEntry[] = [
  { key: '', label: { ar: 'نافذة قلم', fr: 'Fenêtre Qalam', en: 'Qalam Window' }, icon: 'home' },
  { key: 'journey', label: { ar: 'رحلة قلم', fr: 'Parcours Qalam', en: 'Qalam Journey' }, icon: 'explore' },
  { key: 'lab', label: { ar: 'المختبر العلمي', fr: 'Laboratoire scientifique', en: 'Science Lab' }, icon: 'science' },
  { key: 'future', label: { ar: 'عالم الغد', fr: 'Monde de demain', en: 'Tomorrow’s World' }, icon: 'auto_awesome' },
  { key: 'learning', label: { ar: 'التعلم والمراجع', fr: 'Apprentissage et ressources', en: 'Learning and resources' }, icon: 'library_books' },
  { key: 'play', label: { ar: 'تعلم والعب', fr: 'Apprendre et jouer', en: 'Learn & Play' }, icon: 'sports_esports' },
]

type HubCard = { key: string; title: Record<Lang, string>; description: Record<Lang, string>; icon: string; image: string; childImage: string; color: string; kidsOnlyImage?: boolean }
const HUB_CARDS: Record<'future' | 'learning' | 'play', HubCard[]> = {
  future: [
    { key: 'future/quantum', title: { ar: 'الكميات والحوسبة', fr: 'Quantique et informatique', en: 'Quantum and computing' }, description: { ar: 'من سلوك الجسيمات إلى الحواسيب والخوارزميات التي تغيّر المعرفة.', fr: 'Des particules aux ordinateurs et algorithmes qui transforment le savoir.', en: 'From particle behavior to computers and algorithms reshaping knowledge.' }, icon: 'memory', image: 'quantum-academic.jpg', childImage: 'quantum-kids.jpg', color: '#3d5cb3' },
    { key: 'future/ai', title: { ar: 'الذكاء الاصطناعي', fr: 'Intelligence artificielle', en: 'Artificial intelligence' }, description: { ar: 'كيف تتعلم النماذج، وما الذي تستطيع فعله، وأين تقف حدودها؟', fr: 'Comment les modèles apprennent-ils, et quelles sont leurs limites ?', en: 'How do models learn, what can they do, and where are their limits?' }, icon: 'smart_toy', image: 'ai-future-academic.jpg', childImage: 'ai-future-kids.jpg', color: '#5d50a8' },
    { key: 'future/energy', title: { ar: 'الكهرباء والطاقة', fr: 'Électricité et énergie', en: 'Electricity and energy' }, description: { ar: 'استكشف انتقال الطاقة من مصادرها إلى الشبكات والمدن.', fr: 'Explorez l’énergie, de ses sources aux réseaux et aux villes.', en: 'Explore energy from its sources to grids and cities.' }, icon: 'electric_bolt', image: 'energy-future-academic.jpg', childImage: 'energy-future-kids.jpg', color: '#b87428' },
    { key: 'future/space-tech', title: { ar: 'هندسة استكشاف الفضاء', fr: 'Ingénierie spatiale', en: 'Space exploration engineering' }, description: { ar: 'تقنيات المركبات والاتصال والحماية الكوكبية؛ علوم الكون في رحلة قلم.', fr: 'Véhicules, communications et défense planétaire ; cosmologie dans le parcours Qalam.', en: 'Vehicles, communications and planetary defense; cosmology belongs in Qalam’s journey.' }, icon: 'travel_explore', image: 'space-future-academic.jpg', childImage: 'space-future-kids.jpg', color: '#554b96' },
  ],
  learning: [
    { key: 'path', title: { ar: 'مسارات التعلم', fr: 'Parcours d’apprentissage', en: 'Learning routes' }, description: { ar: 'ابدأ بمعلومة، تتبع تاريخها، افحصها في المختبر، ثم اختبر فهمك في نهاية المسار.', fr: 'Partez d’un fait, retracez son histoire, explorez-le au laboratoire et vérifiez votre compréhension.', en: 'Start with a fact, trace its history, explore it in the lab, then check your understanding.' }, icon: 'route', image: 'learning-path-academic.jpg', childImage: 'learning-path-kids.jpg', color: '#428376' },
    { key: 'islamic-learning', title: { ar: 'التعلم الديني', fr: 'Études islamiques', en: 'Islamic learning' }, description: { ar: 'مساران متدرجان: إيمان وعبادات وأخلاق للصغار، وفقه الأسرة والمعاملات ومصادره للكبار.', fr: 'Deux parcours adaptés : foi, pratiques et éthique pour les enfants ; famille, transactions et sources pour les adultes.', en: 'Two age-aware paths: faith, worship, and character for children; family life, transactions, and sources for adults.' }, icon: 'menu_book', image: 'islamic-learning-adult-v1.png', childImage: 'islamic-learning-kids-v1.png', color: '#376b55' },
    { key: 'library', title: { ar: 'المكتبة الشاملة', fr: 'Bibliothèque complète', en: 'Complete library' }, description: { ar: 'ابحث بين المقالات والموضوعات، ثم تابع القراءة من حيث توقفت.', fr: 'Recherchez des articles et reprenez votre lecture à tout moment.', en: 'Search articles and topics, then continue where you left off.' }, icon: 'library_books', image: 'library-academic.jpg', childImage: 'library-kids.jpg', color: '#47705c' },
    { key: 'languages', title: { ar: 'مدرسة اللغات', fr: 'École des langues', en: 'Language school' }, description: { ar: 'تعلم تدريجي بالاستماع والقراءة والمحادثة والتدريب.', fr: 'Progressez par l’écoute, la lecture, la conversation et la pratique.', en: 'Build skills through listening, reading, conversation, and practice.' }, icon: 'translate', image: 'languages-academic.jpg', childImage: 'languages-kids.jpg', color: '#397b82' },
    { key: 'tutor', title: { ar: 'المعلم الذكي', fr: 'Tuteur intelligent', en: 'Smart tutor' }, description: { ar: 'اسأل، اطلب مثالًا، أو اطلب شرحًا يتدرج مع مستواك.', fr: 'Posez une question et obtenez une explication adaptée à votre niveau.', en: 'Ask for examples or explanations adapted to your level.' }, icon: 'psychology', image: 'tutor-academic.jpg', childImage: 'tutor-kids.jpg', color: '#4c64a4' },
    { key: 'generate', title: { ar: 'اصنع درسًا', fr: 'Créer une leçon', en: 'Create a lesson' }, description: { ar: 'حوّل سؤالًا أو فكرة إلى مادة تعليمية قابلة للتخصيص.', fr: 'Transformez une question en ressource pédagogique personnalisée.', en: 'Turn a question or idea into a customizable learning resource.' }, icon: 'auto_awesome', image: 'lesson-create-academic.jpg', childImage: 'lesson-create-kids.jpg', color: '#946b31' },
    { key: 'editor', title: { ar: 'أدوات المعلم', fr: 'Outils de l’enseignant', en: 'Teacher tools' }, description: { ar: 'أنشئ مواد تعليمية ونظّمها وخصصها لمتعلمينك.', fr: 'Créez, organisez et adaptez des ressources pour vos élèves.', en: 'Create, organize, and adapt resources for learners.' }, icon: 'edit_note', image: 'teacher-tools-academic.jpg', childImage: 'teacher-tools-kids.jpg', color: '#8a6d3a' },
    { key: 'profile', title: { ar: 'ملفي ورحلتي', fr: 'Mon profil et mon parcours', en: 'My profile and progress' }, description: { ar: 'تابع ما أنجزته وشاراتك والموضوعات التي تود استكشافها.', fr: 'Suivez vos progrès, vos badges et vos prochains sujets.', en: 'Track progress, badges, and topics you want to explore next.' }, icon: 'person', image: 'profile-academic.jpg', childImage: 'profile-kids.jpg', color: '#536c75' },
  ],
  play: [
    { key: 'story', title: { ar: 'قصة تفاعلية', fr: 'Récit interactif', en: 'Interactive story' }, description: { ar: 'اختر المسار، واكتشف كيف تغير قراراتك مجرى الحكاية.', fr: 'Choisissez un chemin et voyez vos décisions transformer le récit.', en: 'Choose a path and see how decisions change the story.' }, icon: 'auto_stories', image: 'story-academic.jpg', childImage: 'story-kids.jpg', color: '#89613c' },
    { key: 'quiz', title: { ar: 'اختبر معرفتك', fr: 'Tester ses connaissances', en: 'Test your knowledge' }, description: { ar: 'تحديات قصيرة تعطيك تغذية راجعة وتشرح الإجابة.', fr: 'Des défis courts avec retours et explications.', en: 'Short challenges with feedback and explanations.' }, icon: 'quiz', image: 'quiz-academic.jpg', childImage: 'quiz-kids.jpg', color: '#5265a2' },
    { key: 'game', title: { ar: 'لعبة الذاكرة', fr: 'Jeu de mémoire', en: 'Memory game' }, description: { ar: 'طابق الصور والمفاهيم، واستدع المعلومات بطريقة مرحة.', fr: 'Associez images et concepts pour mémoriser en jouant.', en: 'Match images and concepts to remember through play.' }, icon: 'extension', image: 'memory-academic.jpg', childImage: 'memory-kids.jpg', color: '#b55061' },
    { key: 'listen', title: { ar: 'لعبة الاستماع', fr: 'Jeu d’écoute', en: 'Listening game' }, description: { ar: 'أنصت للصوت، التقط الإشارة، ثم اختر الإجابة أو الكلمة المناسبة.', fr: 'Écoutez, repérez les indices et choisissez la bonne réponse.', en: 'Listen for clues, then choose the right answer or word.' }, icon: 'graphic_eq', image: 'listen-academic.jpg', childImage: 'listen-kids.jpg', color: '#34868a' },
  ],
}

function ContentCardHub({ lang, section, level }: { lang: Lang; section: 'future' | 'learning' | 'play'; level: Level }) {
  const headings = {
    future: { ar: ['عالم الغد', 'منجزات قائمة، وأبحاث جارية، وسيناريوهات مستقبلية مشروطة بالدليل'], fr: ['Monde de demain', 'Réalisations, recherches en cours et scénarios futurs étayés par des preuves'], en: ['Tomorrow’s World', 'Current achievements, active research, and evidence-based future scenarios'] },
    learning: { ar: ['التعلم والمراجع', 'مسارات متدرجة تربط المعلومة بتاريخها وتجربتها وسؤالها المستقبلي، ثم تتيح التحقق من الفهم.'], fr: ['Apprentissage et ressources', 'Des parcours relient les faits à leur histoire, leur exploration et leurs perspectives, puis vérifient la compréhension.'], en: ['Learning and resources', 'Guided routes connect facts to history, exploration, and future questions, then check understanding.'] },
    play: { ar: ['تعلم والعب', 'أنشطة مبنية على مفاهيم الموسوعة: جرّب الفكرة في قصة، ثم استدعها في اختبار أو لعبة.'], fr: ['Apprendre et jouer', 'Des activités ancrées dans les sujets de l’encyclopédie : explorez une idée en récit, puis retrouvez-la dans un jeu ou un quiz.'], en: ['Learn and play', 'Activities build on encyclopedia topics: explore an idea in a story, then recall it in a quiz or game.'] },
  }
  const [title, intro] = headings[section][lang]
  return <section className="page-wide section-card-hub"><header className="section-card-hub-head"><span className="material-symbols-rounded">{section === 'future' ? 'auto_awesome' : section === 'play' ? 'sports_esports' : 'school'}</span><div><small>{lang === 'ar' ? 'اختر بابًا للمتابعة' : lang === 'fr' ? 'Choisissez un domaine' : 'Choose a path'}</small><h1>{title}</h1><p>{intro}</p></div></header><div className="section-hub-grid">{HUB_CARDS[section].map((card) => <a className="section-hub-card" href={`#/${card.key}`} key={card.key} style={{ '--hub-accent': card.color } as React.CSSProperties}><div className="section-hub-image">{!(card.kidsOnlyImage && level !== 'kids') && <img src={publicUrl(`assets/img/${level === 'kids' ? card.childImage : card.image}`)} alt="" loading="lazy" decoding="async"/>}<span className="section-hub-icon material-symbols-rounded">{card.icon}</span></div><div className="section-hub-copy"><h2>{card.title[lang]}</h2><p>{card.description[lang]}</p><span>{lang === 'ar' ? 'افتح هذا المسار' : lang === 'fr' ? 'Ouvrir ce parcours' : 'Open this path'} <Mi name="arrow_forward"/></span></div></a>)}</div></section>
}

function Header({
  lang,
  onLang,
  route,
  level,
  muted,
  onMute,
  onChangeLevel,
  ink,
  onChooseLevel,
}: {
  lang: Lang
  onLang: (l: Lang) => void
  route: string
  level: Level
  muted: boolean
  onMute: () => void
  onChangeLevel: () => void
  ink: number
  onChooseLevel: (level:Level) => void
}) {
  const isActiveRoute = (key: string) => (key === 'journey' && (route === 'transport' || route === 'war-peace' || /^history\/(transport|war|peace)$/.test(route))) || route === key || (key !== '' && route.startsWith(`${key}/`)) || (key === '' && (route === '' || route.startsWith('article/') || route.startsWith('window/')))
  return (
    <aside className="sidebar">
      <a className="side-brand" href="#/" onClick={() => (window.location.hash = '#/')}>
        <span className="side-brand-mark">
          <img src={publicUrl('assets/qalam-q-logo-small.png')} alt="قلم" />
        </span>
        <span className="side-brand-text">
          <strong>{t(lang, 'appName')}</strong>
          <small>{t(lang, 'tagline')}</small>
        </span>
      </a>

      <nav className="side-nav">
        {NAV_SECTIONS.map((item) => <a key={item.key || 'qalam-home'} className={isActiveRoute(item.key) || (item.key === 'journey' && (route === 'atlas' || route.startsWith('explorer/'))) ? 'side-card-link active' : 'side-card-link'} href={`#/${item.key}`} onClick={() => { window.location.hash = `#/${item.key}` }}><Mi name={item.icon}/><span>{item.label[lang]}</span></a>)}
      </nav>

      <div className="side-actions">
        <button className="side-btn" onClick={() => (window.location.hash = '#/profile')} title={t(lang, 'inkPoints')}>
          <Mi name="ink_pen" />
          <span>{ink}</span>
          <Mi name="water_drop" />
        </button>
        <div className="side-row">
          <button className="side-icon" onClick={onMute} title={muted ? t(lang, 'unmute') : t(lang, 'mute')}>
            <Mi name={muted ? 'volume_off' : 'volume_up'} />
          </button>
          <button className="side-icon audience-edit" onClick={onChangeLevel} title={lang==='ar'?'تعديل المسار':lang==='fr'?'Modifier le parcours':'Edit path'} aria-label={lang==='ar'?'تعديل المسار':lang==='fr'?'Modifier le parcours':'Edit path'}><Mi name="edit_note"/></button>
          <div className="side-langs" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l}
                className={l === lang ? 'side-lang active' : 'side-lang'}
                onClick={() => onLang(l)}
                title={LANG_LABELS[l]}
              >
                {l === 'ar' ? 'ع' : l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="side-foot side-audience-paths" role="group" aria-label={lang==='ar'?'مسارا الموسوعة':lang==='fr'?'Parcours de l’encyclopédie':'Encyclopedia paths'}>
        {(['kids','school'] as const).map(path=><button key={path} className={path===level?'active':''} aria-pressed={path===level} onClick={()=>onChooseLevel(path)}><Mi name={path==='kids'?'child_care':'school'}/><strong>{lang==='ar'?(path==='kids'?'الصغار':'الكبار'):lang==='fr'?(path==='kids'?'Enfants':'Adultes'):(path==='kids'?'Children':'Adults')}</strong></button>)}
      </div>
    </aside>
  )
}

function HomePage({
  lang,
  query,
  onQuery,
  all,
  level,
  done,
  collectionLoaded,
  collectionLoading,
  collectionError,
  onLoadFullCollection,
}: {
  lang: Lang
  query: string
  onQuery: (q: string) => void
  all: Article[]
  level: Level
  done: string[]
  collectionLoaded: boolean
  collectionLoading: boolean
  collectionError: boolean
  onLoadFullCollection: () => void
}) {
  const [dky, setDky] = useState(0)
  const [view, setView] = useState<'sky' | 'grid'>('grid')
  const [factTick, setFactTick] = useState(0)
  const [visibleCount, setVisibleCount] = useState(18)

  const results = useMemo(() => {
    const q = normalize(query)
    // strict language: only articles actually available in the current language
    const available = all.filter((a) => articleHasLanguage(a,lang))
    if (!q) return available
    return available.filter((a) => {
      const c = a.content[lang]
      if (!c) return false
      const hay = normalize(c.title + ' ' + c.summary + ' ' + c.body.join(' '))
      return hay.includes(q)
    })
  }, [query, all, lang])

  const featured = useMemo(() => ['pyramids','mars','africa'].map(id => all.find(article => article.id===id && articleHasLanguage(article,lang))).filter((article):article is Article=>Boolean(article)), [all, lang])
  const routeHighlights = LEARNING_THEMES.filter(theme => ['space','earth','life','mathematics'].includes(theme.id))
  const routeImages: Record<string,[string,string]> = {
    space:['journey-discovery-space-kids-v1.jpg','journey-discovery-space-academic-v1.jpg'],
    earth:['journey-discovery-earth-kids-v1.jpg','journey-discovery-earth-academic-v1.jpg'],
    life:['qalam-medical-history-kids-v1.jpg','qalam-medical-history-academic-v1.jpg'],
    mathematics:['qalam-history-mathematics-proof-kids-v1.jpg','qalam-history-mathematics-proof-academic-v1.jpg'],
  }
  const leadTheme = LEARNING_THEMES[0]

  /** Curated introductory facts with a known subject, rather than unreviewed extracted claims. */
  const curiosities = useMemo(() => {
    const visual:Record<string,[string,string]>={
      space:['atlas-route-space-kids-v1.jpg','atlas-route-space-academic-v1.jpg'],
      earth:['water-kids-v1.jpg','water.jpg'],
      life:['heart-kids-v1.jpg','heart.jpg'],
      science:['atom-kids-v1.jpg','atom.png'],
      technology:['ai-kids-editorial-v1.jpg','ai-future-academic.jpg'],
    }
    const pool=LEARNING_THEMES.filter(theme=>theme.windowArticle && visual[theme.id] && all.some(article=>article.id===theme.windowArticle && articleHasLanguage(article,lang)))
    return Array.from({length:Math.min(3,pool.length)},(_,index)=>pool[(factTick+index)%pool.length]).map(theme=>({id:theme.windowArticle!,title:all.find(article=>article.id===theme.windowArticle)!.content[lang]!.title,fact:level==='kids'?theme.hook[lang]:`${theme.hook[lang]} ${theme.question[lang]}`,cat:theme.title[lang],img:visual[theme.id][level==='kids'?0:1],route:theme.id}))
  }, [all, lang, level, factTick])

  useEffect(() => { setVisibleCount(18) }, [query, view, lang])

  void done

  return (
    <div className={`home mag ${level === 'kids' ? 'kids-home' : ''}`}>
      <section className="mag-hero" id="qalam-window">
        <div className="mag-hero-inner">
          <div className="mag-hero-copy">
            <span className="mag-eyebrow">
              <Mi name="auto_stories" /> {lang==='ar'?'موسوعة بصرية للتعلّم والاكتشاف':lang==='fr'?'Une encyclopédie visuelle à explorer':'A visual encyclopedia to explore'}
            </span>
            <h1 className="mag-title">{lang === 'ar' ? 'نافذة قلم' : lang === 'fr' ? 'Fenêtre Qalam' : 'Qalam Window'}</h1>
            <p className="mag-hero-description">{level==='kids' ? (lang === 'ar' ? 'ابدأ بمعلومة، تتبّع قصتها في رحلة قلم، جرّبها في المختبر، ثم تخيّل ما قد يتغير واختبر فهمك.' : lang === 'fr' ? 'Pars d’une découverte, suis son histoire, essaie une expérience, imagine demain et vérifie ce que tu as compris.' : 'Start with a discovery, follow its story, try an experiment, imagine tomorrow, and check what you learned.') : (lang === 'ar' ? 'انطلق من سؤال، تتبّع شواهده عبر الزمن والمكان، افحص آلياته في المختبر، ثم قيّم السيناريوهات والأدلة وحدود المعرفة.' : lang === 'fr' ? 'Partez d’une question, retracez ses sources dans le temps et l’espace, examinez ses mécanismes, puis évaluez preuves, scénarios et limites.' : 'Start with a question, trace its sources through time and place, examine its mechanisms, then assess evidence, scenarios, and limits.')}</p>
            <div className="mag-search">
              <Mi name="search" />
              <input
                type="search"
                value={query}
                placeholder={t(lang, 'search')}
                onChange={(e) => onQuery(e.target.value)}
              />
              <VoiceSearch lang={lang} onResult={(text) => onQuery(text)} />
            </div>
            <div className="mag-quick">
              {({ ar: ['الجاذبية', 'الشمس', 'المغرب', 'الفضاء', 'الرياضيات', 'التاريخ'], fr: ['Gravité', 'Soleil', 'Maroc', 'Espace', 'Mathématiques', 'Histoire'], en: ['Gravity', 'Sun', 'Morocco', 'Space', 'Mathematics', 'History'] }[lang]).map((q2) => (
                <button key={q2} className="quick-chip" onClick={() => onQuery(q2)}>
                  {q2}
                </button>
              ))}
            </div>
            <nav className="qalam-window-guide" aria-label={lang==='ar'?'خطوات التعلم في قلم':lang==='fr'?'Étapes de Qalam':'Qalam learning steps'}>
              {[
                {href:'#/journey',icon:'travel_explore',ar:'الرحلة',fr:'Voyage',en:'Journey'},
                {href:'#/lab',icon:'science',ar:'الاكتشاف',fr:'Découverte',en:'Discovery'},
                {href:'#/future',icon:'rocket_launch',ar:'المستقبل',fr:'Avenir',en:'Future'},
                {href:'#/path',icon:'school',ar:'التعلم',fr:'Apprendre',en:'Learning'},
              ].map((step,index)=><a href={step.href} key={step.href}><span>{String(index+1).padStart(2,'0')}</span><Mi name={step.icon}/>{step[lang]}</a>)}
            </nav>
          </div>
          <a className="qalam-window-feature" href={`#/path/${leadTheme.id}`}>
            <img src={publicUrl('assets/img/qalam-intro-library-v1.jpg')} alt="" decoding="async"/>
            <span className="qalam-window-feature-copy"><small>{lang==='ar'?'سؤال يفتح رحلة':lang==='fr'?'Une question ouvre le voyage':'One question opens a journey'}</small><strong>{leadTheme.question[lang]}</strong><span>{lang==='ar'?'ابدأ الاستكشاف':lang==='fr'?'Commencer à explorer':'Start exploring'} <Mi name="arrow_forward"/></span></span>
          </a>
        </div>
      </section>

      <section className="mag-section" aria-label={lang==='ar'?'اختر مسار معلومة':lang==='fr'?'Choisir un sujet relié':'Choose a connected topic'}>
        <div className="mag-section-head"><h2 className="mag-h2">{lang==='ar'?'من المعلومة إلى الفهم':lang==='fr'?'Du fait à la compréhension':'From fact to understanding'}</h2><a className="text-link" href="#/path">{lang==='ar'?'كل المسارات':lang==='fr'?'Tous les parcours':'All routes'} <Mi name="arrow_forward"/></a></div>
        <div className="learning-route-grid qalam-window-routes">{routeHighlights.map(theme=><a key={theme.id} className="learning-route-card qalam-window-route" href={`#/path/${theme.id}`}><img src={publicUrl(`assets/img/${routeImages[theme.id][level==='kids'?0:1]}`)} alt="" loading="lazy" decoding="async"/><small>{theme.title[lang]}</small><strong>{level==='kids'?theme.hook[lang]:theme.question[lang]}</strong><span>{lang==='ar'?'تتبّع هذه الفكرة':lang==='fr'?'Suivre cette idée':'Follow this idea'} <Mi name="arrow_forward"/></span></a>)}</div>
      </section>

      <section className="dky-line" id="today-facts">
        <span className="dky-icon">
          <Mi name="lightbulb" />
        </span>
        <span key={dky} className="dky-text">
          {LEARNING_THEMES[dky%LEARNING_THEMES.length].hook[lang]}
        </span><a className="dky-route-link" href={`#/path/${LEARNING_THEMES[dky%LEARNING_THEMES.length].id}`}>{lang==='ar'?'تتبّع المعلومة':lang==='fr'?'Suivre cette idée':'Follow this idea'} <Mi name="arrow_forward"/></a><button className="ghost-btn small" onClick={() => setDky(i => (i + 1) % LEARNING_THEMES.length)}>{lang==='ar'?'معلومة أخرى':lang==='fr'?'Autre découverte':'Another discovery'}</button>
      </section>

      <section className="mag-section qalam-future-window" id="window-future">
        <div className="mag-section-head">
          <h2 className="mag-h2">{lang === 'ar' ? 'نافذة المستقبل' : lang === 'fr' ? 'Fenêtre sur l’avenir' : 'A Window on the Future'}</h2>
        </div>
        <div className="future-window-note">
          <div><strong>{lang === 'ar' ? 'إشارة واحدة، وسياقها' : lang === 'fr' ? 'Un signal, remis en contexte' : 'One signal, placed in context'}</strong>
            <p>{lang === 'ar' ? 'سؤال العدد: ما الذي يجعل اختراعًا واعدًا قابلًا للاستخدام فعلًا؟ الفكرة هنا مدخل قصير؛ أما فحص التقنيات والأدلة والعقبات والسيناريوهات فيجري داخل «عالم الغد».' : lang === 'fr' ? 'Question du moment : qu’est-ce qui rend une invention prometteuse réellement utilisable ? Ici, une courte ouverture ; l’étude des technologies, preuves, obstacles et scénarios se poursuit dans « Monde de demain ».' : 'Question of the moment: what makes a promising invention usable in practice? This is a short editorial prompt; technologies, evidence, barriers, and scenarios are examined in “Tomorrow’s World.”'}</p>
          </div>
          <a className="primary-btn small" href="#/future" onClick={() => { window.location.hash = '#/future' }}>
            {lang === 'ar' ? 'افتح عالم الغد' : lang === 'fr' ? 'Explorer le Monde de demain' : 'Explore Tomorrow’s World'} <Mi name="arrow_forward" />
          </a>
        </div>
      </section>

      {curiosities.length > 0 && (
        <section className="mag-section" id="today-facts-cards">
          <div className="mag-section-head">
            <h2 className="mag-h2">
              <Mi name="auto_awesome" style={{ color: 'var(--gold)' }} />{' '}
              {lang === 'ar' ? 'حقائق تُدهش — اليوم' : lang === 'fr' ? 'Faits étonnants — du jour' : 'Surprising facts — daily'}
            </h2>
            <button className="ghost-btn small" onClick={() => setFactTick((v) => v + 1)}>
              <Mi name="refresh" />{' '}
              {lang === 'ar' ? 'حقيقة أخرى' : lang === 'fr' ? 'Autre fait' : 'Another fact'}
            </button>
          </div>
          <div className="curio-grid">
            {curiosities.map((c) => (
              <a key={c.id} className="curio-card" href={`#/article/${c.id}`}>
                <span
                  className="curio-cover"
                >
                  {c.img && (
                    <img
                      className="curio-image"
                      src={publicUrl(`assets/img/${c.img}`)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        const image = event.currentTarget
                        image.style.display = 'none'
                        image.closest('.curio-cover')?.classList.add('curio-image-missing')
                      }}
                    />
                  )}
                  <span className="curio-cat">{c.cat}</span>
                </span>
                <span className="curio-body">
                  <strong>{c.title}</strong>
                  <p>{c.fact}</p>
                  <span className="curio-cta">
                    {lang === 'ar' ? 'اقرأ ثم واصل الرحلة' : lang === 'fr' ? 'Lire et poursuivre' : 'Read and continue'}
                    <Mi name="arrow_forward" />
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="mag-section" id="editor-picks">
        <div className="mag-section-head">
          <h2 className="mag-h2">{t(lang, 'featured')}</h2>
          <a className="text-link" href="#/path" onClick={() => (window.location.hash = '#/path')}>
            {t(lang, 'learningPath')} <Mi name="chevron_left" />
          </a>
        </div>
        <div className="cards featured-row">
          {featured.map((a) => (
            <ArticleCard key={a.id} article={a} lang={lang} level={level} />
          ))}
        </div>
      </section>

      {query.trim() && <section className="mag-section">
        <div className="mag-section-head">
          <h2 className="mag-h2">
            {query ? `${t(lang, 'articles')} — ${query}` : t(lang, 'articles')}{' '}
            <span className="count-badge">{results.length}</span>
          </h2>
          <span className="seg">
            <button
              className={view === 'grid' ? 'seg-btn active' : 'seg-btn'}
              onClick={() => setView('grid')}
              title={t(lang, 'articles')}
            >
              <Mi name="grid_view" />
            </button>
            <button
              className={view === 'sky' ? 'seg-btn active' : 'seg-btn'}
              onClick={() => setView('sky')}
              title={lang === 'ar' ? 'سماء المعرفة' : lang === 'fr' ? 'Ciel du savoir' : 'Knowledge sky'}
            >
              <Mi name="auto_awesome" />
            </button>
          </span>
        </div>
        {!collectionLoaded && !query.trim() && (
          <div className="collection-prompt">
            <button className="ghost-btn small" onClick={onLoadFullCollection} disabled={collectionLoading}>
              <Mi name={collectionLoading ? 'progress_activity' : collectionError ? 'refresh' : 'library_books'} />
              {collectionLoading
                ? (lang === 'ar' ? 'جارٍ تجهيز بقية الموسوعة…' : lang === 'fr' ? 'Chargement de l’encyclopédie…' : 'Loading the full encyclopedia…')
                : collectionError
                  ? (lang === 'ar' ? 'تعذّر التحميل — أعد المحاولة' : lang === 'fr' ? 'Échec — réessayer' : 'Could not load — try again')
                  : (lang === 'ar' ? 'استكشف بقية الموسوعة' : lang === 'fr' ? 'Explorer toute l’encyclopédie' : 'Explore the full encyclopedia')}
            </button>
            {!collectionLoading && !collectionError && (
              <span>{lang === 'ar' ? 'تُحمّل المقالات الإضافية عند طلبها فقط' : lang === 'fr' ? 'Les articles complets sont chargés à la demande' : 'The full article collection loads only when requested'}</span>
            )}
          </div>
        )}
        {collectionLoading && query.trim() && (
          <p className="collection-status" role="status">
            {lang === 'ar' ? 'جارٍ توسيع البحث ليشمل الموسوعة كاملة…' : lang === 'fr' ? 'Recherche dans toute l’encyclopédie…' : 'Searching the full encyclopedia…'}
          </p>
        )}
        {collectionError && query.trim() && <p className="collection-status" role="alert">{lang === 'ar' ? 'تعذّر تحميل بقية المقالات. امسح البحث وأعد المحاولة.' : lang === 'fr' ? 'Impossible de charger les autres articles. Réessayez.' : 'Could not load the remaining articles. Please retry.'}</p>}
        {results.length === 0 ? (
          <p className="empty">{t(lang, 'noResults')}</p>
        ) : view === 'sky' ? (
          <KnowledgeSky
            articles={results.slice(0, 180)}
            lang={lang}
            query={query}
            onOpen={(id: string) => (window.location.hash = `#/article/${id}`)}
          />
        ) : (
          <div className="cards">
            {results.slice(0, visibleCount).map((a) => (
              <ArticleCard key={a.id} article={a} lang={lang} level={level} />
            ))}
          </div>
        )}
        {view === 'grid' && results.length > visibleCount && (
          <button className="ghost-btn small load-more" onClick={() => setVisibleCount((n) => n + 18)}>
            {lang === 'ar' ? 'عرض 18 مقالاً إضافياً' : lang === 'fr' ? 'Afficher 18 articles de plus' : 'Show 18 more articles'}
            <Mi name="expand_more" />
          </button>
        )}
      </section>}
    </div>
  )
}

function SectionPage({
  lang,
  cat,
  all,
  level,
  onBack,
}: {
  lang: Lang
  cat: string
  all: Article[]
  level: Level
  onBack: () => void
}) {
  const [visibleCount, setVisibleCount] = useState(24)
  useEffect(() => { setVisibleCount(24) }, [cat, lang])
  const items = all.filter((a) => a.cat[lang] === cat && articleHasLanguage(a,lang))
  const meta = sectionMeta(cat)
  return (
    <div className={`home mag ${level === 'kids' ? 'kids-home' : ''}`}>
      <section className="section-hero" style={sectionCoverStyle(meta)}>
        <span className="section-hero-pattern" data-pattern={meta.pattern} />
        <Mi name={meta.icon} className="section-hero-icon" />
        <div className="section-hero-body">
          <h2>{cat}</h2>
          <p>
            {items.length}{' '}
            {lang === 'ar' ? 'مقالًا في هذا الفرع' : lang === 'fr' ? 'articles dans cette rubrique' : 'articles in this section'}
          </p>
        </div>
        <button className="section-hero-back" type="button" onClick={onBack}>
          <Mi name="arrow_back" />
          {lang === 'ar' ? 'الرئيسية' : lang === 'fr' ? 'Accueil' : 'Home'}
        </button>
      </section>
      <section className="mag-section">
        {items.length === 0 ? (
          <p className="empty">{lang === 'ar' ? 'لا توجد مقالات بعد في هذا القسم.' : lang === 'fr' ? 'Aucun article dans cette section.' : 'No articles in this section yet.'}</p>
        ) : (
          <div className="cards">
            {items.slice(0, visibleCount).map((a) => (
              <ArticleCard key={a.id} article={a} lang={lang} level={level} />
            ))}
          </div>
        )}
        {items.length > visibleCount && (
          <button className="ghost-btn small load-more" onClick={() => setVisibleCount((n) => n + 24)}>
            {lang === 'ar' ? 'عرض 24 مقالاً إضافياً' : lang === 'fr' ? 'Afficher 24 articles de plus' : 'Show 24 more articles'}
            <Mi name="expand_more" />
          </button>
        )}
      </section>
    </div>
  )
}

function ArticleCard({ article, lang, level }: { article: Article; lang: Lang; level: Level }) {
  const c = viewContent(article, lang, level)
  const visual = articleCardVisual(article)
  return (
    <a className="card article-card-minimal" data-cat={article.cat[lang]} href={`#/article/${article.id}`}>
      <div className="card-body">
        <span className={`article-card-mark ${level === 'kids' ? 'article-card-mark-kids' : 'article-card-mark-academic'}`} style={{ color: visual.color }} aria-hidden="true">
          {level === 'kids' ? visual.emoji : <Mi name={visual.icon} />}
        </span>
        <div className="article-card-copy">
          <span className="card-cat">{articleCardCategory(article, lang, visual)}</span>
          {NEW_IDS.has(article.id) && <span className="new-badge">{t(lang, 'newBadge')}</span>}
          <h3 className="card-title">{c.title}</h3>
        </div>
      </div>
    </a>
  )
}

const CURIOSITY_PROMPTS: Record<string, Record<'kids' | 'academic', Record<Lang, string[]>>> = {
  space: {
    kids: { ar: ['لو زرنا {title}، ماذا سنرى؟', 'ما السر الذي يخفيه {title} في الفضاء؟', 'كيف نكتشف {title} من بعيد؟'], fr: ['Que verrions-nous en explorant {title} ?', 'Quel secret {title} cache-t-il dans l’espace ?', 'Comment observons-nous {title} de loin ?'], en: ['What might we see if we explored {title}?', 'What space secret does {title} hold?', 'How can we observe {title} from far away?'] },
    academic: { ar: ['ما الرصد أو النموذج الذي يفسر {title}؟', 'ما الأدلة المتاحة، وأين تقف حدود معرفتنا بـ{title}؟', 'كيف غيّرت دراسة {title} فهمنا للكون؟'], fr: ['Quelles observations ou quels modèles expliquent {title} ?', 'Quelles preuves avons-nous, et quelles sont les limites de notre connaissance de {title} ?', 'Comment l’étude de {title} a-t-elle changé notre compréhension de l’Univers ?'], en: ['Which observations or models explain {title}?', 'What evidence do we have, and where are the limits of our knowledge of {title}?', 'How has studying {title} changed our view of the Universe?'] },
  },
  earth: {
    kids: { ar: ['ما القوى التي رسمت شكل {title}؟', 'كيف يؤثر {title} في حياة الناس والكائنات؟', 'ماذا يتغير في {title} مع مرور الزمن؟'], fr: ['Quelles forces ont façonné {title} ?', 'Comment {title} influence-t-il la vie des humains et des êtres vivants ?', 'Que change le temps dans {title} ?'], en: ['What forces shaped {title}?', 'How does {title} affect people and other living things?', 'What changes in {title} over time?'] },
    academic: { ar: ['ما العمليات الطبيعية التي شكّلت {title}؟', 'كيف نقيس تغيرات {title} ونفسر أسبابها؟', 'ما الصلة بين {title} والأنظمة البيئية أو المناخية المحيطة؟'], fr: ['Quels processus naturels ont façonné {title} ?', 'Comment mesurer et expliquer les changements de {title} ?', 'Quels liens relient {title} aux systèmes écologiques ou climatiques voisins ?'], en: ['Which natural processes shaped {title}?', 'How can changes in {title} be measured and explained?', 'How does {title} connect to surrounding ecological or climate systems?'] },
  },
  life: {
    kids: { ar: ['كيف يعيش {title} ويتكيف مع بيئته؟', 'ما الذي يحتاج إليه {title} كي ينمو؟', 'ما الدور الذي يؤديه {title} في الطبيعة؟'], fr: ['Comment {title} vit-il et s’adapte-t-il à son milieu ?', 'De quoi {title} a-t-il besoin pour grandir ?', 'Quel rôle {title} joue-t-il dans la nature ?'], en: ['How does {title} live and adapt to its environment?', 'What does {title} need to grow?', 'What role does {title} play in nature?'] },
    academic: { ar: ['ما الآليات الحيوية التي تفسر {title}؟', 'كيف تقاس الأدلة المتعلقة بـ{title}، وما حدودها؟', 'كيف يرتبط {title} بالتطور والبيئة والصحة؟'], fr: ['Quels mécanismes biologiques expliquent {title} ?', 'Comment évaluer les preuves relatives à {title}, et quelles sont leurs limites ?', 'Quels liens relient {title} à l’évolution, à l’environnement et à la santé ?'], en: ['Which biological mechanisms explain {title}?', 'How should evidence about {title} be evaluated, and what are its limits?', 'How is {title} connected to evolution, ecology, and health?'] },
  },
  science: {
    kids: { ar: ['ماذا يحدث لو جرّبنا تغيير شيء في {title}؟', 'كيف تساعدنا {title} على تفسير ما نراه؟', 'أين نلتقي بـ{title} في حياتنا اليومية؟'], fr: ['Que se passerait-il si nous changions un élément de {title} ?', 'Comment {title} nous aide-t-il à expliquer ce que nous observons ?', 'Où rencontrons-nous {title} dans la vie quotidienne ?'], en: ['What happens if we change one part of {title}?', 'How does {title} help explain what we observe?', 'Where do we encounter {title} in everyday life?'] },
    academic: { ar: ['ما الفرضية أو النظرية التي تفسر {title}؟', 'كيف نختبر الادعاءات المتعلقة بـ{title}؟', 'ما النماذج والبيانات التي تساعد على فهم {title}؟'], fr: ['Quelle hypothèse ou théorie explique {title} ?', 'Comment tester les affirmations concernant {title} ?', 'Quels modèles et quelles données permettent de comprendre {title} ?'], en: ['Which hypothesis or theory explains {title}?', 'How can claims about {title} be tested?', 'Which models and data help us understand {title}?'] },
  },
  technology: {
    kids: { ar: ['كيف تساعدنا {title} على حل مشكلة؟', 'ما الفكرة التي تجعل {title} يعمل؟', 'كيف يمكن أن تغيّر {title} حياتنا؟'], fr: ['Comment {title} nous aide-t-il à résoudre un problème ?', 'Quelle idée permet à {title} de fonctionner ?', 'Comment {title} pourrait-il changer notre quotidien ?'], en: ['How can {title} help solve a problem?', 'What idea makes {title} work?', 'How might {title} change everyday life?'] },
    academic: { ar: ['كيف تعمل {title}، وما حدودها العملية؟', 'ما البنية العلمية والهندسية وراء {title}؟', 'ما آثار {title} الاجتماعية والأخلاقية والاقتصادية؟'], fr: ['Comment fonctionne {title}, et quelles sont ses limites pratiques ?', 'Quels principes scientifiques et techniques fondent {title} ?', 'Quels effets sociaux, éthiques et économiques entraîne {title} ?'], en: ['How does {title} work, and what are its practical limits?', 'Which scientific and engineering principles underpin {title}?', 'What social, ethical, and economic effects does {title} have?'] },
  },
  civilizations: {
    kids: { ar: ['كيف عاش الناس وبنوا مجتمعهم في {title}؟', 'ما الأثر الذي تركته {title} في العالم؟', 'ما الذي يمكن أن تخبرنا به آثار {title}؟'], fr: ['Comment vivait-on et construisait-on une société dans {title} ?', 'Quelle empreinte {title} a-t-elle laissée dans le monde ?', 'Que nous apprennent les vestiges de {title} ?'], en: ['How did people live and build society in {title}?', 'What mark did {title} leave on the world?', 'What can the remains of {title} tell us?'] },
    academic: { ar: ['ما المصادر الأثرية والنصية التي تتيح دراسة {title}؟', 'كيف تفاعلت السلطة والاقتصاد والثقافة في {title}؟', 'ما التحولات التي قادت إلى نشوء {title} وأفولها؟'], fr: ['Quelles sources archéologiques et textuelles permettent d’étudier {title} ?', 'Comment pouvoir, économie et culture interagissaient-ils dans {title} ?', 'Quelles transformations ont conduit à l’essor puis au déclin de {title} ?'], en: ['Which archaeological and written sources illuminate {title}?', 'How did power, economy, and culture interact in {title}?', 'Which transformations shaped the rise and decline of {title}?'] },
  },
  human: {
    kids: { ar: ['كيف غيّر الناس مجرى {title}؟', 'ما الذي عاشه الناس في زمن {title}؟', 'ما الصلات التي تجمع {title} بما حوله؟'], fr: ['Comment les personnes ont-elles changé le cours de {title} ?', 'Comment vivait-on à l’époque de {title} ?', 'Quels liens relient {title} à son contexte ?'], en: ['How did people shape the course of {title}?', 'What was life like during {title}?', 'How is {title} connected to its wider context?'] },
    academic: { ar: ['ما السياق التاريخي والأدلة التي تفسر {title}؟', 'كيف تفاعلت البنى الاجتماعية والسياسية في {title}؟', 'ما وجهات النظر المختلفة حول {title}، وما مصادرها؟'], fr: ['Quels contextes et quelles sources expliquent {title} ?', 'Comment les structures sociales et politiques interagissaient-elles dans {title} ?', 'Quelles interprétations de {title} s’appuient sur quelles sources ?'], en: ['Which historical contexts and sources explain {title}?', 'How did social and political structures interact in {title}?', 'Which interpretations of {title} rely on which sources?'] },
  },
  arts: {
    kids: { ar: ['ما الفكرة أو الصورة التي ستكتشفها في {title}؟', 'كيف يجعلنا {title} نرى العالم بطريقة جديدة؟', 'ما الحكاية التي يرويها {title}؟'], fr: ['Quelle idée ou quelle image découvrirez-vous dans {title} ?', 'Comment {title} nous fait-il voir le monde autrement ?', 'Quelle histoire {title} raconte-t-il ?'], en: ['What idea or image will you discover in {title}?', 'How does {title} help us see the world differently?', 'What story does {title} tell?'] },
    academic: { ar: ['كيف يصوغ السياق والفكر معنى {title}؟', 'ما الأدوات الجمالية والحجاجية في {title}؟', 'كيف استقبل الجمهور {title}، وكيف تغير تأويله؟'], fr: ['Comment le contexte et les idées façonnent-ils le sens de {title} ?', 'Quels procédés esthétiques et argumentatifs structurent {title} ?', 'Comment la réception de {title} et son interprétation ont-elles évolué ?'], en: ['How do context and ideas shape the meaning of {title}?', 'Which aesthetic and argumentative methods structure {title}?', 'How has the reception and interpretation of {title} changed?'] },
  },
  religions: {
    kids: { ar: ['ما الفكرة التي يعرضها {title}؟', 'ما الكلمات أو المعاني التي تلفت انتباهك في {title}؟', 'ما السؤال الذي تريد استكشافه حول {title}؟'], fr: ['Quelle idée présente {title} ?', 'Quels mots ou idées de {title} attirent ton attention ?', 'Quelle question aimerais-tu explorer au sujet de {title} ?'], en: ['What idea does {title} present?', 'Which words or ideas in {title} catch your attention?', 'What question would you like to explore about {title}?'] },
    academic: { ar: ['ما المصادر والسياقات التي تساعد على دراسة {title}؟', 'كيف نميز في دراسة {title} بين النص وتأويله وسياقه التاريخي؟', 'ما حدود الاستنتاج من {title} قبل الرجوع إلى مصادره وشروحه؟'], fr: ['Quelles sources et quels contextes permettent d’étudier {title} ?', 'Comment distinguer le texte, ses interprétations et son contexte historique ?', 'Quelles conclusions ne peut-on tirer de {title} sans consulter ses sources et commentaires ?'], en: ['Which sources and contexts help us study {title}?', 'How can we distinguish the text, its interpretations, and its historical context?', 'What conclusions should not be drawn from {title} without consulting its sources and commentaries?'] },
  },
  default: {
    kids: { ar: ['ما المفاجأة التي تخبئها {title}؟', 'كيف ترتبط {title} بالعالم من حولنا؟', 'ما السؤال الجديد الذي يفتحُه {title}؟'], fr: ['Quelle surprise {title} nous réserve-t-il ?', 'Comment {title} se relie-t-il au monde qui nous entoure ?', 'Quelle nouvelle question {title} fait-il naître ?'], en: ['What surprise does {title} hold?', 'How is {title} connected to the world around us?', 'What new question does {title} raise?'] },
    academic: { ar: ['ما الإشكال الذي تطرحه {title}، وكيف ندرسه؟', 'ما المفاهيم والأدلة اللازمة لفهم {title}؟', 'كيف تطور فهم {title}، وما الأسئلة المفتوحة؟'], fr: ['Quelle question {title} soulève-t-il, et comment l’étudier ?', 'Quels concepts et quelles preuves permettent de comprendre {title} ?', 'Comment la compréhension de {title} a-t-elle évolué, et quelles questions restent ouvertes ?'], en: ['Which question does {title} raise, and how can it be studied?', 'Which concepts and evidence are needed to understand {title}?', 'How has our understanding of {title} evolved, and what questions remain open?'] },
  },
}

function curiosityFor(article: Article, title: string, domain: string, level: 'kids' | 'academic', lang: Lang): string {
  if (article.id === 'black-holes-guide') {
    const prompts = {
      kids: {
        ar: ['ماذا يحدث للضوء عند أفق الحدث؟', 'لماذا قد نرى غازًا مضيئًا حول الثقب الأسود؟', 'كيف نعرف بوجود ثقب أسود لا نراه مباشرة؟'],
        fr: ['Que devient la lumière à l’horizon des événements ?', 'Pourquoi du gaz peut-il briller autour d’un trou noir ?', 'Comment détecter un trou noir sans le voir directement ?'],
        en: ['What happens to light at the event horizon?', 'Why can gas glow around a black hole?', 'How can we detect a black hole we cannot see directly?'],
      },
      academic: {
        ar: ['ما الأدلة الرصدية التي تكشف وجود الثقب الأسود؟', 'كيف يحدد أفق الحدث حدود الإشارات القابلة للرصد؟', 'ما الذي تقيسه صورة الظل، وما الذي لا تصوره؟'],
        fr: ['Quelles observations révèlent la présence d’un trou noir ?', 'Comment l’horizon limite-t-il les signaux observables ?', 'Que mesure l’image de l’ombre, et que ne montre-t-elle pas ?'],
        en: ['Which observations reveal a black hole?', 'How does the event horizon limit observable signals?', 'What does an image of the shadow measure, and what does it not show?'],
      },
    }
    const options = prompts[level][lang]
    const seed = Array.from(article.id).reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return options[seed % options.length]
  }
  if (domain === 'religions') {
    const fullText = Object.values(article.content).flatMap((entry) => entry ? [entry.title, entry.summary, ...entry.body] : []).join(' ')
    const isQuranVerse = /﴿|\bqur'?anic verse\b|\bayah\b|\bverse of (?:the )?quran\b|آية|اية|الآيات/u.test(`${title} ${fullText}`)
    if (isQuranVerse) {
      const prompts = {
        kids: {
          ar: ['ما التوجيه الذي تعرضه هذه الآية؟', 'ما الكلمة أو الفكرة التي لفتت انتباهك في الآية؟', 'ما السؤال الذي تود طرحه لفهم سياق الآية؟'],
          fr: ['Quel enseignement cette ayah présente-t-elle ?', 'Quel mot ou quelle idée de cette ayah retient ton attention ?', 'Quelle question poserais-tu pour comprendre le contexte de cette ayah ?'],
          en: ['What guidance does this verse present?', 'Which word or idea in the verse caught your attention?', 'What question would help you understand the verse’s context?'],
        },
        academic: {
          ar: ['ما سياق هذه الآية، وما المصادر التفسيرية التي تشرحها؟', 'كيف نميز بين نص الآية وتفسيرها والاجتهاد المبني عليها؟', 'ما الذي يمكن إثباته من نص الآية، وما الذي يحتاج إلى مراجعة مصادر أخرى؟'],
          fr: ['Quel est le contexte de cette ayah et quelles sources exégétiques l’éclairent ?', 'Comment distinguer le texte de l’ayah, son exégèse et le raisonnement juridique qui s’y appuie ?', 'Que permet d’établir le texte, et que faut-il vérifier dans d’autres sources ?'],
          en: ['What is the context of this verse, and which exegetical sources discuss it?', 'How do we distinguish the verse itself, its exegesis, and legal reasoning based on it?', 'What can the verse establish, and what requires checking against other sources?'],
        },
      }
      const promptsForLevel = prompts[level][lang]
      const seed = Array.from(article.id).reduce((sum, char) => sum + char.charCodeAt(0), 0)
      return promptsForLevel[seed % promptsForLevel.length]
    }
  }
  const key = domain === 'human-history' ? 'human' : domain
  const prompts = (CURIOSITY_PROMPTS[key] ?? CURIOSITY_PROMPTS.default)[level][lang]
  const seed = Array.from(article.id).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return prompts[seed % prompts.length].replace('{title}', title)
}

function ArticlePage({
  id,
  lang,
  level,
  all,
  onDone,
  onBack,
  done,
}: {
  id: string
  lang: Lang
  level: Level
  all: Article[]
  onDone: (id: string) => void
  onBack: () => void
  done: boolean
}) {
  const article = all.find((a) => articleMatchesId(a, id))
  const [speaking, setSpeaking] = useState(false)
  const [showSlides, setShowSlides] = useState(false)
  const [speechError, setSpeechError] = useState(false)
  const [speechLoading, setSpeechLoading] = useState('')
  useEffect(() => {
    if (article) onDone(article.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id])

  useEffect(() => () => stopSpeak(), [])

  if (!article) {
    return (
      <div className="page">
        <button className="ghost-btn" onClick={onBack}>
          ← {t(lang, 'backHome')}
        </button>
        <p className="empty">{t(lang, 'noResults')}</p>
      </div>
    )
  }
  const isKids = level === 'kids'
  const isHigh = level === 'school'
  const kidsC = isKids ? (childEdition(article,lang)) : undefined
  const c = kidsC ?? viewContent(article, lang, level)
  const missingLang = !articleHasLanguage(article,lang) && !kidsC
  if (missingLang) {
    const unavailable = {
      ar: ['المقال غير متاح بهذه اللغة بعد', 'لم تكتمل ترجمته بعد، لذلك أخفينا النصوص والوسائط بلغات أخرى.'],
      fr: ['Article indisponible dans cette langue', 'Sa traduction n’est pas encore prête. Le contenu dans les autres langues reste masqué.'],
      en: ['Article not available in this language yet', 'Its translation is not ready. Content in other languages stays hidden.'],
    }[lang]
    return <div className="page"><button className="ghost-btn" onClick={onBack}>← {t(lang, 'backHome')}</button><section className="lang-unavailable"><Mi name="translate" /><h1>{unavailable[0]}</h1><p>{unavailable[1]}</p></section></div>
  }
  const facts = isHigh && !article.editorialEdition ? (FACTS[article.id] ?? FACTS_NEW[article.id])?.[lang] : undefined
  const articleDomain = domainForArticle(article)
  const entryTheme = LEARNING_THEMES.find(theme => theme.windowArticle === article.id)
  const related = all.filter((a) => article.related.includes(a.id) && domainForArticle(a) === articleDomain && articleHasLanguage(a,lang))
  const sourceEntries = article.sources?.[lang] ? [[lang, article.sources[lang]!]] as [Lang, ArticleSource[]][] : []

  const meta = articleMeta(article.id)
  const explanationParagraphs = (c.body ?? []).filter((paragraph) => paragraph.trim())
  if (!explanationParagraphs.length && c.summary?.trim()) explanationParagraphs.push(c.summary.trim())
  const curiosityTitle = curiosityFor(article, c.title, articleDomain, isKids ? 'kids' : 'academic', lang)

  return (
    <div className="page">
      <button className="ghost-btn" onClick={onBack}>
        ← {t(lang, 'backHome')}
      </button>
      <div
        id="article-visual"
        className="article-banner"
        style={{ background: `linear-gradient(135deg, ${meta.color}, #16293f)` }}
      >
        <div className="banner-text">
          <span className="banner-cat">{article.cat[lang]}</span>
          <h1 className="banner-title"><TypewriterText className="typewriter-text" key={`${article.id}-${level}-${lang}`} text={c.title} /></h1>
          <h2 className="article-curiosity-title"><TypewriterText className="typewriter-text" key={`curiosity-${article.id}-${level}-${lang}`} text={curiosityTitle} delay={Math.min(Array.from(c.title).length * 32, 1200)} speed={25} /></h2>
        </div>
      </div>
      {isKids&&!kidsC&&<p className="article-intro-note" role="note">{lang==='ar'?'هذا عرض تمهيدي موجز من المادة المتاحة؛ قد تحتاج بعض المفاهيم إلى شرح أو نشاط إضافي.':lang==='fr'?'Aperçu introductif abrégé ; certains concepts peuvent nécessiter une explication ou une activité guidée.':'Short introductory view; some concepts may need further explanation or a guided activity.'}</p>}
      <ArticleNavigation key={article.id+level} lang={lang} kids={isKids}/>
      <article className={isKids ? 'article kids-mode' : 'article'}>
        <section id="article-explanation" className="article-explanation" aria-label={lang==='ar'?'شرح الموضوع':lang==='fr'?'Explication':'Explanation'}>
          <h2 className="article-text-heading">{lang==='ar'?'عن هذا الموضوع':lang==='fr'?'À propos de ce sujet':'About this topic'}</h2>
          {explanationParagraphs.length ? explanationParagraphs.map((p, i) => (
            <p key={i} className={i === 0 ? 'article-lead' : 'article-para'}><QuranText text={p} lang={lang}/></p>
          )) : <p className="article-para">{lang==='ar'?'يجري إعداد نص هذا المقال باللغة المختارة.':lang==='fr'?'Le texte de cet article dans la langue choisie est en préparation.':'The article text in the selected language is being prepared.'}</p>}
        </section>
        {isKids && <TopicExperience lang={lang} title={c.title} explanation={[c.summary,...(c.body ?? []).slice(0,2)].join(' ')} subject={`${article.id} ${articleDomain}`}/>}
        {article.id === 'black-holes-guide' && !isKids && <a className="article-lab-link" href="#/lab/space/blackholes" onClick={() => { window.location.hash = '#/lab/space/blackholes' }}><Mi name="science"/>{lang === 'ar' ? 'جرّب واستكشف في مختبر الفضاء' : lang === 'fr' ? 'Essayez et explorez dans le laboratoire spatial' : 'Try and explore in the Space Lab'}<Mi name="arrow_forward"/></a>}
        {lang === 'ar' && <RecordedArabic key={article.id} topic={recordingForTitle(c.title)}/>}
        <ArticleMedia article={article} lang={lang} level={level} />
        {facts && (
          <section className="facts-box">
            <h3>⚡ {t(lang, 'factsTitle')}</h3>
            <ul>
              {facts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </section>
        )}
        <section id="article-practice" className="article-practice">
        {isKids && (
          <Suspense fallback={null}>
            <KidsLearningStudio
              lang={lang}
              articleId={article.id}
              articleTitle={c.title}
              category={article.cat[lang]}
            />
          </Suspense>
        )}
        {!isKids && <details open><summary>{lang==='ar'?'أسئلة وتطبيقات ومسار للتعمق':lang==='fr'?'Questions, applications et approfondissement':'Questions, applications and further study'}</summary><LessonPlan article={article} lang={lang} onDone={onDone} done={done}/></details>}
        </section>
        <section id="article-sources" className="sources-box">
          <h3>{t(lang, 'sourcesTitle')}</h3>
          {sourceEntries.length > 0 ? (
            <ul className="source-list">
              {sourceEntries.flatMap(([sourceLang, references]) =>
                references.map((source, index) => (
                  <li className="source-item" key={`${sourceLang}-${source.url}-${index}`}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.name}: {source.title}
                    </a>
                    <span>
                      {LANG_LABELS[sourceLang]} · {source.attribution} ·{' '}
                      {source.licenseUrl ? (
                        <a href={source.licenseUrl} target="_blank" rel="noreferrer">{source.license}</a>
                      ) : source.license}
                      {source.revisionTimestamp
                        ? ` · ${t(lang, 'sourceRevision')} ${new Date(source.revisionTimestamp).toLocaleDateString(lang)}`
                        : ''}
                    </span>
                    {source.modified && <small>{t(lang, 'sourceAdapted')}</small>}
                  </li>
                ))
              )}
            </ul>
          ) : entryTheme ? (
            <p><a href={entryTheme.source.url} target="_blank" rel="noreferrer">{lang==='ar'?'مرجع للتحقق من المعلومة':lang==='fr'?'Référence pour vérifier le fait':'Reference for checking the fact'}: {entryTheme.source.label[lang]} ↗</a></p>
          ) : (
            <p>{t(lang, 'sourceNotRecorded')}</p>
          )}
          {speechError && <p role="status">{lang==='ar'?'تعذر تجهيز القارئ العربي داخل المتصفح. تحقق من الاتصال بالإنترنت ثم أعد المحاولة.':lang==='fr'?'Voix indisponible sur cet appareil.':'No compatible voice is available on this device.'}</p>}{speechLoading&&<p className="speech-loading" role="status" aria-live="polite">{speechLoading}</p>}<div className="article-actions">
            <button className="ghost-btn small" onClick={() => setShowSlides(true)}>
              <Mi name="present_to_all" /> {t(lang, 'presentMode')}
            </button>
            <button
              className="ghost-btn small"
              onClick={() => {
                if (speaking) {
                  stopSpeak()
                  setSpeaking(false)
                  setSpeechLoading('')
                } else {
                  setSpeaking(true)
                  setSpeechError(false)
                  setSpeechLoading(lang==='ar'?'جارٍ إعداد القارئ العربي داخل المتصفح لأول مرة…':'')
                  speak(
                    c.title + '. ' + (c.body.length ? c.body.join(' ') : c.summary),
                    lang,
                    () => { setSpeaking(false); setSpeechLoading('') },
                    () => { setSpeaking(false); setSpeechLoading(''); setSpeechError(true) },
                    () => setSpeechLoading(''),
                    (percent) => setSpeechLoading(percent===undefined?'جارٍ إعداد القارئ العربي داخل المتصفح لأول مرة…':`جارٍ تجهيز القارئ العربي · ${percent}٪`),
                  )
                }
              }}
            >
              <Mi name={speaking ? 'stop' : 'volume_up'} />{' '}
              {speaking ? t(lang, 'stopListen') : t(lang, 'listen')}
            </button>
            {isHigh && (
              <button className="ghost-btn small" onClick={() => (window.location.hash = '#/library')}>
                <Mi name="menu_book" /> {t(lang, 'readInLibrary')}
              </button>
            )}
            {false && (
              <button className="ghost-btn small" onClick={() => (window.location.hash = '#/tutor')}>
                <Mi name="forum" /> {t(lang, 'discussWithTutor')}
              </button>
            )}
          </div>
        </section>
      </article>
      <section className="article-learning-next"><div><small>{lang==='ar'?'واصل من المعلومة إلى الفهم':lang==='fr'?'Du fait à la compréhension':'From fact to understanding'}</small><h3>{entryTheme?entryTheme.title[lang]:lang==='ar'?'اختر مسارًا مرتبطًا باهتمامك':lang==='fr'?'Choisissez un parcours lié à votre intérêt':'Choose a route connected to your interest'}</h3><p>{lang==='ar'?'تتبّع التاريخ، افحص التجربة، واسأل عن المستقبل قبل اختبار فهمك.':lang==='fr'?'Retracez l’histoire, explorez le mécanisme et examinez l’avenir avant de vérifier vos acquis.':'Trace the history, explore the mechanism, and examine the future before checking your understanding.'}</p></div><a className="learning-route-link" href={entryTheme?`#/path/${entryTheme.id}`:'#/path'}>{lang==='ar'?'افتح مسار التعلم':lang==='fr'?'Ouvrir le parcours':'Open the learning route'} <Mi name="arrow_forward"/></a></section>
      {related.length > 0 && (
        <section className="related">
          <h3>{t(lang, 'related')}</h3>
          <div className="cards">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} lang={lang} level={level} />
            ))}
          </div>
        </section>
      )}
      {showSlides && (
        <SlideShow article={article} lang={lang} level={level} onClose={() => setShowSlides(false)} />
      )}
    </div>
  )
}

const TOTAL = 6

function QuizPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [ability, setAbility] = useState(0.5)
  const [used, setUsed] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [step, setStep] = useState(0)
  const [sel, setSel] = useState<number | null>(null)

  const remaining = useMemo(() => QUIZ.filter((q) => !used.includes(q.id)), [used])
  const current = useMemo(() => {
    if (remaining.length === 0) return null
    const target = ability * 3
    return [...remaining].sort(
      (a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target)
    )[0]
  }, [remaining, ability])

  const done = step >= TOTAL || (remaining.length === 0 && sel !== null)

  useEffect(() => {
    if (done && score / TOTAL >= 0.66) {
      awardBadge('quizzer')
      addInk(3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  if (!current && !done) return null

  const answer = (idx: number) => {
    if (sel !== null || !current) return
    const correct = idx === current.content[lang].correct
    if (correct) {
      sound.success()
      addInk(2)
    } else {
      sound.fail()
    }
    const p = 1 / (1 + Math.exp(current.difficulty - ability * 3))
    const delta = correct ? 1 - p : -p
    setAbility(Math.min(1, Math.max(0, ability + 0.18 * delta)))
    setScore((s) => s + (correct ? 1 : 0))
    setSel(idx)
    setUsed((u) => [...u, current.id])
  }

  const next = () => {
    setSel(null)
    setStep((s) => s + 1)
  }

  if (done) {
    const pct = score / TOTAL
    const verdict =
      pct >= 0.8 ? t(lang, 'excellent') : pct >= 0.5 ? t(lang, 'good') : t(lang, 'keepPracticing')
    return (
      <div className="page quiz-done">
        <h1 className="article-title">{t(lang, 'yourScore')}</h1>
        <p className="big-score">
          {score} / {TOTAL}
        </p>
        <p className="verdict">{verdict}</p>
        <div className="quiz-actions">
          <button
            className="primary-btn"
            onClick={() => {
              setAbility(0.5)
              setUsed([])
              setScore(0)
              setStep(0)
              setSel(null)
            }}
          >
            {t(lang, 'restart')}
          </button>
          <button className="ghost-btn" onClick={onBack}>
            {t(lang, 'backHome')}
          </button>
        </div>
      </div>
    )
  }

  const q = current!.content[lang]
  return (
    <div className="page">
      <div className="quiz-toprow">
        <button className="ghost-btn" onClick={onBack}>
          ← {t(lang, 'backHome')}
        </button>
        <button className="ghost-btn small" onClick={() => (window.location.hash = '#/game')}>
          <Mi name="extension" /> {t(lang, 'navGame')}
        </button>
      </div>
      <div className="quiz-head">
        <span className="quiz-progress">
          {t(lang, 'question')} {step + 1} / {TOTAL}
        </span>
        <span className="quiz-score">
          {t(lang, 'score')}: {score}
        </span>
      </div>
      <h2 className="quiz-q">{q.q}</h2>
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let cls = 'option'
          if (sel !== null) {
            if (i === q.correct) cls += ' correct'
            else if (i === sel) cls += ' wrong'
          }
          return (
            <button key={i} className={cls} disabled={sel !== null} onClick={() => answer(i)}>
              {opt}
            </button>
          )
        })}
      </div>
      {sel !== null && (
        <div className="quiz-feedback">
          <p className={sel === q.correct ? 'fb-good' : 'fb-bad'}>
            {sel === q.correct ? t(lang, 'correct') : t(lang, 'wrong')}
          </p>
          <button className="primary-btn" onClick={next}>
            {step + 1 >= TOTAL ? t(lang, 'finish') : t(lang, 'next')}
          </button>
        </div>
      )}
    </div>
  )
}
