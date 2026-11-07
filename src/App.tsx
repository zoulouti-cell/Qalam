import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import Mi from './Mi'
import ErrorBoundary from './ErrorBoundary'
import { LANGS, LANG_LABELS, UI, t, normalize, type Lang } from './i18n'
import { QUIZ, type Article, type ArticleSource } from './data'
import { loadCustomArticles, loadLevel, saveLevel, loadDone, addDone } from './storage'
import {
  LEVELS,
  levelKey,
  KIDS,
  KIDS_NEW,
  FACTS,
  FACTS_NEW,
  NEW_ARTICLES,
  ALL_ARTICLES_FULL,
  PATHS,
  HADYOUKNOW,
  articleMeta,
  articleIcon,
  contentOf,
  type Level,
} from './content'
const Library = lazy(() => import('./Library'))
const Tutor = lazy(() => import('./Tutor'))
const Editor = lazy(() => import('./Editor'))
const ArticleMedia = lazy(() => import('./ArticleMedia'))
const KidsLearningStudio = lazy(() => import('./KidsLearningStudio'))
const FrontierExplorer = lazy(() => import('./FrontierExplorer'))
const MathAcademy = lazy(() => import('./MathAcademy'))
const HumanitiesExplorer = lazy(() => import('./HumanitiesExplorer'))
const MoroccoAcademy = lazy(() => import('./MoroccoAcademy'))
const ThoughtAcademy = lazy(() => import('./ThoughtAcademy'))
const CulturalJourneys = lazy(() => import('./CulturalJourneys'))
const LanguagesAcademy = lazy(() => import('./LanguagesAcademy'))
const PathPage = lazy(() => import('./PathPage'))
import LevelGate from './LevelGate'
const Generator = lazy(() => import('./Generator'))
const Atlas = lazy(() => import('./Atlas'))
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
      const byId = new Map<string, Article>()
      for (const article of packs.flat()) byId.set(article.id, article)
      return [...byId.values()]
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
  const [kidMode, setKidMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('encarta.kidmode') === '1'
    } catch {
      return false
    }
  })
  const hash = useHashRoute()

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = UI[lang].appName
  }, [lang])

  useEffect(() => {
    document.body.classList.toggle('mode-kids', kidMode)
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

  const pickLevel = (l: Level) => {
    setLevel(l)
    saveLevel(l)
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

  const route = hash.replace(/^#\/?/, '')
  const articleMatch = route.match(/^article\/(.+)$/)
  const sectionMatch = route.match(/^section\/(.+)$/)
  const libraryMatch = route.match(/^library(?:\/view\/(.+))?$/)
  const showQuiz = route === 'quiz'
  const showTutor = route === 'tutor'
  const showEditor = route === 'editor'
  const showPath = route === 'path'
  const showGenerator = route === 'generate'
  const showAtlas = route === 'atlas'
  const showLab = route === 'lab'
  const showGame = route === 'game'
  const showProfile = route === 'profile'
  const showStory = route === 'story'
  const showListen = route === 'listen'
  const showMath = route === 'math'
  const showHumanities = route === 'humanities'
  const showMorocco = route === 'morocco'
  const showThought = route === 'thought'
  const showLanguages = route === 'languages'
  const journeyMatch = route.match(/^journey\/(history|literature|law)$/)

  const all = [...custom, ...collection, ...ALL_ARTICLES]
  const requestedArticle = articleMatch ? safeDecodeURIComponent(articleMatch[1]) : null
  const needsFullArticle = requestedArticle !== null && !all.some((article) => article.id === requestedArticle)
  const shouldLoadFullCollection = query.trim().length >= 2 || Boolean(sectionMatch) || showFullCollection || needsFullArticle

  useEffect(() => {
    if (!shouldLoadFullCollection || collectionLoaded) return
    let active = true
    setCollectionLoading(true)
    setCollectionError(false)
    fetchFullCollection()
      .then((articles) => {
        if (!active) return
        setCollection(articles)
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

  if (level === null || showGate) {
    return <LevelGate lang={lang} current={level} onPick={pickLevel} onLang={pickLang} />
  }

  return (
    <div className="app-shell">
      <Header
        lang={lang}
        onLang={pickLang}
        route={route}
        level={level}
        muted={muted}
        onMute={toggleMute}
        onChangeLevel={() => setShowGate(true)}
        ink={ink}
        kidMode={kidMode}
        onToggleKidMode={() => setKidMode((v) => !v)}
      />
      <div className="content-shell">
        <main className="main" key={route}>
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
            onBack={() => (window.location.hash = '#/')}
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
          <Library lang={lang} view={libraryMatch[1] ?? null} />
        ) : showPath ? (
          <PathPage lang={lang} done={done} />
        ) : showGenerator ? (
          <Generator lang={lang} onSaved={refreshCustom} />
        ) : showAtlas ? (
          <Atlas lang={lang} />
        ) : showLab ? (
          <Lab lang={lang} />
        ) : showGame ? (
          <MemoryGame lang={lang} />
        ) : showProfile ? (
          <Profile lang={lang} />
        ) : showStory ? (
          <StoryAdventure lang={lang} />
        ) : showListen ? (
          <ListenGame lang={lang} />
        ) : sectionMatch ? (
          <SectionPage
            lang={lang}
            cat={safeDecodeURIComponent(sectionMatch[1])}
            all={all}
            level={level}
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

const NAV = [
  { key: '', labelKey: 'articles', icon: 'home' },
  { key: 'path', labelKey: 'learningPath', icon: 'route' },
  { key: 'atlas', labelKey: 'navAtlas', icon: 'travel_explore' },
  { key: 'lab', labelKey: 'navLab', icon: 'science' },
  { key: 'library', labelKey: 'navLibrary', icon: 'library_books' },
  { key: 'languages', labelKey: 'navLanguages', icon: 'translate' },
  { key: 'tutor', labelKey: 'navTutor', icon: 'smart_toy' },
  { key: 'generate', labelKey: 'generator', icon: 'auto_awesome' },
  { key: 'story', labelKey: 'navStory', icon: 'menu_book' },
  { key: 'editor', labelKey: 'navEditor', icon: 'edit_note' },
  { key: 'profile', labelKey: 'navProfile', icon: 'person' },
]

function Header({
  lang,
  onLang,
  route,
  level,
  muted,
  onMute,
  onChangeLevel,
  ink,
  kidMode,
  onToggleKidMode,
}: {
  lang: Lang
  onLang: (l: Lang) => void
  route: string
  level: Level
  muted: boolean
  onMute: () => void
  onChangeLevel: () => void
  ink: number
  kidMode: boolean
  onToggleKidMode: () => void
}) {
  const current = LEVELS.find((l) => l.id === level)
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
        {NAV.map((n) => {
          const active =
            route === n.key || (n.key === '' && (route === '' || route.startsWith('article/')))
          return (
            <a
              key={n.key}
              className={active ? 'side-link active' : 'side-link'}
              href={`#/${n.key}`}
              onClick={() => (window.location.hash = `#/${n.key}`)}
            >
              <Mi name={n.icon} />
              <span>{t(lang, n.labelKey)}</span>
            </a>
          )
        })}
      </nav>

      <div className="side-actions">
        <button className="side-btn" onClick={() => (window.location.hash = '#/profile')} title={t(lang, 'inkPoints')}>
          <Mi name="ink_pen" />
          <span>{ink}</span>
          <Mi name="water_drop" />
        </button>
        <button className="side-btn level-select" onClick={onChangeLevel} title={t(lang, 'changeLevel')}>
          <Mi name={current?.icon ?? 'school'} />
          <span>{t(lang, levelKey(level))}</span>
        </button>
        <div className="side-row">
          <button className="side-icon" onClick={onMute} title={muted ? t(lang, 'unmute') : t(lang, 'mute')}>
            <Mi name={muted ? 'volume_off' : 'volume_up'} />
          </button>
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

      <div className="side-foot">
        <button className="side-foot-link" onClick={onToggleKidMode}>
          <Mi name={kidMode ? 'person' : 'child_care'} />
          {t(lang, kidMode ? 'adultMode' : 'kidsMode')}
        </button>
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
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const [factTick, setFactTick] = useState(0)
  const [visibleCount, setVisibleCount] = useState(18)

  const results = useMemo(() => {
    const q = normalize(query)
    // strict language: only articles actually available in the current language
    const available = all.filter((a) => a.content[lang])
    const catFiltered = catFilter ? available.filter((a) => a.cat[lang] === catFilter) : available
    if (!q) return catFiltered
    return catFiltered.filter((a) => {
      const c = a.content[lang]
      if (!c) return false
      const hay = normalize(c.title + ' ' + c.summary + ' ' + c.body.join(' '))
      return hay.includes(q)
    })
  }, [query, all, catFilter, lang])

  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of all) {
      if (!a.content?.[lang] || !a.cat?.[lang]) continue
      const c = a.cat[lang]
      map.set(c, (map.get(c) || 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
  }, [all, lang])

  const featured = useMemo(() => {
    const pool = all.filter((a) => a.content[lang])
    const out: Article[] = []
    const step = Math.max(1, Math.floor(pool.length / 4))
    for (let i = 0; i < pool.length && out.length < 4; i += step) out.push(pool[i])
    return out
  }, [all, lang])

  /** Curiosity layer: concentrated, surprising facts — rotated daily, illustrated. */
  const curiosities = useMemo(() => {
    const CURIOUS = /(\d{3,4}|\d+\s*(ألف|مليون|مليار)|أول|أقدم|أكبر|أصغر|أطول|أعلى|أعمق|الأكثر|وحيد|فقط|اكتشف|اخترع|انفجر|غزا|أسس|كتب|رسم|بنى)/
    const pool = all.filter((a) => {
      const c = a.content[lang]
      return c && c.summary && CURIOUS.test(c.summary)
    })
    // daily seed so the selection is stable within the day and rotates daily
    const day = new Date()
    const seed = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate()
    const pick = (i: number) => (seed + factTick * 7919 + i * 40503) % pool.length
    const seen = new Set<number>()
    const out: { id: string; title: string; fact: string; cat: string; emoji: string; color: string; img: string }[] = []
    let guard = 0
    while (out.length < 3 && guard++ < 200 && pool.length > 0) {
      const idx = Math.abs(pick(guard))
      if (seen.has(idx)) continue
      seen.add(idx)
      const a = pool[idx]
      const c = contentOf(a, lang)
      const sentence =
        c.summary
          .split(/(?<=[.!?…؟])\s+/)
          .find((s) => CURIOUS.test(s) && s.length > 40) || c.summary
      const meta = articleMeta(a.id)
      const visualTopic = normalize(`${a.id} ${a.cat[lang] || ''} ${c.title}`)
      const topicImage = meta.img || (
        /sun|solar|شمس|شمسي|soleil|solaire/.test(visualTopic) ? 'sun.gif' :
        /water|ocean|river|ماء|مياه|بحر|محيط|eau|océan|rivière/.test(visualTopic) ? 'water.jpg' :
        /mars|planet|space|universe|المريخ|كوكب|فضاء|الكون|planète|espace|univers/.test(visualTopic) ? 'mars.jpg' :
        /pyramid|egypt|pharaoh|history|تاريخ|هرم|مصر|فرعون|histoire|égypte/.test(visualTopic) ? 'pyramids.jpg' :
        /heart|body|blood|human|قلب|جسم|دم|إنسان|cœur|corps|sang/.test(visualTopic) ? 'heart.jpg' :
        /artificial|intelligence|robot|computer|ذكاء|روبوت|حاسوب|تقنية|technolog|ordinateur/.test(visualTopic) ? 'ai.jpg' :
        /atom|chemical|physics|matter|ذرة|كيمياء|فيزياء|مادة|atome|chimie|physique/.test(visualTopic) ? 'atom.png' :
        /climate|weather|environment|مناخ|طقس|بيئة|climat|météo|environnement/.test(visualTopic) ? 'climate.jpg' :
        /energy|electric|طاقة|كهرباء|énergie|électricité/.test(visualTopic) ? 'energy.jpg' :
        /africa|geograph|continent|animal|أفريقيا|جغرافيا|قارة|حيوان|géographie|afrique/.test(visualTopic) ? 'africa.jpg' :
        'brand-office-scene.webp')
      out.push({
        id: a.id,
        title: c.title,
        fact: sentence.slice(0, 240),
        cat: a.cat[lang] || '',
        emoji: meta.emoji,
        color: meta.color,
        img: topicImage,
      })
    }
    return out
  }, [all, lang, factTick])

  useEffect(() => {
    const id = setInterval(() => setDky((i) => (i + 1) % HADYOUKNOW[lang].length), 6000)
    return () => clearInterval(id)
  }, [lang])

  useEffect(() => { setVisibleCount(18) }, [query, catFilter, view, lang])

  void done

  return (
    <div className={`home mag ${level === 'kids' ? 'kids-home' : ''}`}>
      <section className="mag-hero">
        <div className="mag-hero-inner">
          <div className="mag-hero-copy">
            <span className="mag-eyebrow">
              <Mi name="menu_book" /> {t(lang, 'tagline')}
            </span>
            <h1 className="mag-title">{t(lang, 'appName')}</h1>
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
          </div>
          {featured[0] && (
            <a className="featured-card" href={`#/article/${featured[0].id}`}>
              <span className="featured-cover" data-cat={featured[0].cat[lang]}>
                <span className="featured-cat">{featured[0].cat[lang]}</span>
              </span>
              <span className="featured-body">
                <span className="featured-kicker">{t(lang, 'featured')}</span>
                <strong className="featured-title">{contentOf(featured[0], lang).title}</strong>
                <span className="featured-summary">{contentOf(featured[0], lang).summary}</span>
                <span className="featured-cta">
                  {t(lang, 'readNow')} <Mi name="arrow_forward" />
                </span>
              </span>
            </a>
          )}
        </div>
      </section>

      <section className="mag-section">
        <div className="mag-section-head">
          <h2 className="mag-h2">{t(lang, 'explore')}</h2>
          <button
            className={catFilter ? 'ghost-btn small' : 'ghost-btn small hidden-btn'}
            onClick={() => setCatFilter(null)}
          >
            <Mi name="close" /> {t(lang, 'allArticles')}
          </button>
        </div>
        <div className="section-grid">
          {categories.map(([name, count]) => {
            const meta = sectionMeta(name)
            return (
              <a
                key={name}
                className="section-tile"
                href={'#/section/' + encodeURIComponent(name)}
                style={sectionCoverStyle(meta)}
              >
                <span className="section-tile-pattern" data-pattern={meta.pattern} />
                <Mi name={meta.icon} className="section-tile-icon" />
                <span className="section-tile-name">{name}</span>
                <span className="section-tile-count">{count}</span>
              </a>
            )
          })}
        </div>
      </section>

      {level === 'kids' && (
        <Suspense fallback={null}>
          <KidsLearningStudio lang={lang} />
        </Suspense>
      )}

      <section className="dky-line">
        <span className="dky-icon">
          <Mi name="lightbulb" />
        </span>
        <span key={dky} className="dky-text">
          {HADYOUKNOW[lang][dky]}
        </span>
      </section>

      <Suspense fallback={null}>
        <FrontierExplorer lang={lang} level={level} />
      </Suspense>

      <section className="academy-portals">
        <header><span className="academy-kicker"><Mi name="explore" /> {lang === 'ar' ? 'اختر مسارك التفاعلي' : lang === 'fr' ? 'Choisissez un parcours interactif' : 'Choose an interactive path'}</span></header>
        <div className="academy-portal-grid">
          <a className="academy-portal" href="#/math"><span className="academy-portal-icon"><Mi name="functions" /></span><span><strong>{lang === 'ar' ? 'مختبر الرياضيات' : lang === 'fr' ? 'Atelier de mathématiques' : 'Mathematics lab'}</strong><small>{lang === 'ar' ? 'مساران عمريّان، ورسوم تفاعلية من الكسور إلى التفاضل.' : lang === 'fr' ? 'Deux parcours par âge, des fractions au calcul différentiel.' : 'Two age paths, with interactive visuals from fractions to calculus.'}</small></span><Mi name="arrow_forward" /></a>
          <a className="academy-portal" href="#/humanities"><span className="academy-portal-icon"><Mi name="history_edu" /></span><span><strong>{lang === 'ar' ? 'التاريخ والإنسان' : lang === 'fr' ? 'Histoire et sociétés' : 'History and society'}</strong><small>{lang === 'ar' ? 'الإسلام والمغرب، قصص الأنبياء، القانون، والشعر العربي.' : lang === 'fr' ? 'Islam et Maroc, récits des prophètes, droit et poésie arabe.' : 'Islam and Morocco, prophet narratives, law, and Arabic poetry.'}</small></span><Mi name="arrow_forward" /></a>
          <a className="academy-portal history-portal" href="#/journey/history"><span className="academy-portal-icon"><Mi name="history_edu" /></span><span><strong>{lang === 'ar' ? 'رحلات التاريخ' : lang === 'fr' ? 'Parcours historiques' : 'History journeys'}</strong><small>{lang === 'ar' ? 'أحداث ومدن وحضارات على خط زمني ومكاني تفاعلي.' : lang === 'fr' ? 'Événements, villes et civilisations sur un parcours interactif.' : 'Events, cities, and civilizations on an interactive time-space route.'}</small></span><Mi name="arrow_forward" /></a>
          <a className="academy-portal literature-portal" href="#/journey/literature"><span className="academy-portal-icon"><Mi name="auto_stories" /></span><span><strong>{lang === 'ar' ? 'رحلات الأدب' : lang === 'fr' ? 'Parcours littéraires' : 'Literature journeys'}</strong><small>{lang === 'ar' ? 'من الرواية الشفوية إلى الكتاب والطباعة والأدب الرقمي.' : lang === 'fr' ? 'De l’oralité au livre imprimé et aux écritures numériques.' : 'From oral storytelling to print and digital literature.'}</small></span><Mi name="arrow_forward" /></a>
          <a className="academy-portal law-portal" href="#/journey/law"><span className="academy-portal-icon"><Mi name="account_balance" /></span><span><strong>{lang === 'ar' ? 'رحلات القانون' : lang === 'fr' ? 'Parcours du droit' : 'Law journeys'}</strong><small>{lang === 'ar' ? 'نشأة القواعد والمؤسسات والحقوق عبر الحضارات.' : lang === 'fr' ? 'Règles, institutions et droits à travers les civilisations.' : 'Rules, institutions, and rights across civilizations.'}</small></span><Mi name="arrow_forward" /></a>
          <a className="academy-portal morocco-portal" href="#/morocco"><span className="academy-portal-icon"><Mi name="landscape" /></span><span><strong>{lang === 'ar' ? 'ملف المغرب' : lang === 'fr' ? 'Dossier Maroc' : 'Morocco dossier'}</strong><small>{lang === 'ar' ? 'جغرافيا المغرب وتاريخه ومؤسساته ومجتمعه وثقافته واقتصاده.' : lang === 'fr' ? 'Géographie, histoire, institutions, société, culture et économie du Maroc.' : 'Morocco’s geography, history, institutions, society, culture, and economy.'}</small></span><Mi name="arrow_forward" /></a>
          <a className="academy-portal thought-portal" href="#/thought"><span className="academy-portal-icon"><Mi name="psychology" /></span><span><strong>{lang === 'ar' ? 'الفكر والأدب والاقتصاد' : lang === 'fr' ? 'Pensée, littérature et économie' : 'Thought, literature, and economics'}</strong><small>{lang === 'ar' ? 'مفكرون عرب وأزمات اقتصادية وأفكار غيرت العالم.' : lang === 'fr' ? 'Traditions européennes et francophones, littérature et crises.' : 'Anglophone and American ideas, literature, and crises.'}</small></span><Mi name="arrow_forward" /></a>
          <a className="academy-portal language-portal" href="#/languages"><span className="academy-portal-icon"><Mi name="translate" /></span><span><strong>{lang === 'ar' ? 'مدرسة اللغات' : lang === 'fr' ? 'Atelier des langues' : 'Language studio'}</strong><small>{lang === 'ar' ? 'مسارات منفصلة في العربية والفرنسية والإنجليزية مع تدريب تفاعلي.' : lang === 'fr' ? 'Parcours distincts en arabe, français et anglais avec activités interactives.' : 'Separate Arabic, French, and English pathways with interactive practice.'}</small></span><Mi name="arrow_forward" /></a>
        </div>
      </section>

      {curiosities.length > 0 && (
        <section className="mag-section">
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
                  style={{ background: `linear-gradient(140deg, ${c.color}, ${c.color}88 60%, #123f3533)` }}
                >
                  {c.img && (
                    <img
                      className="curio-image"
                      src={publicUrl(`assets/img/${c.img}`)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  {level === 'kids' && <span className="curio-emoji">{c.emoji}</span>}
                  <span className="curio-cat">{c.cat}</span>
                </span>
                <span className="curio-body">
                  <strong>{c.title}</strong>
                  <p>{c.fact}</p>
                  <span className="curio-cta">
                    {lang === 'ar' ? 'اقرأ الحقيقة كاملة' : lang === 'fr' ? 'Lire la suite' : 'Read more'}
                    <Mi name="arrow_forward" />
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="mag-section">
        <div className="mag-section-head">
          <h2 className="mag-h2">{t(lang, 'featured')}</h2>
          <a className="text-link" href="#/path" onClick={() => (window.location.hash = '#/path')}>
            {t(lang, 'learningPath')} <Mi name="chevron_left" />
          </a>
        </div>
        <div className="cards featured-row">
          {featured.slice(1).map((a) => (
            <ArticleCard key={a.id} article={a} lang={lang} level={level} />
          ))}
        </div>
      </section>

      <section className="mag-section">
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
              title="Knowledge sky"
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
            {lang === 'ar' ? 'عرض ١٨ مقالاً إضافياً' : lang === 'fr' ? 'Afficher 18 articles de plus' : 'Show 18 more articles'}
            <Mi name="expand_more" />
          </button>
        )}
      </section>
    </div>
  )
}

function SectionPage({
  lang,
  cat,
  all,
  level,
}: {
  lang: Lang
  cat: string
  all: Article[]
  level: Level
}) {
  const [visibleCount, setVisibleCount] = useState(24)
  useEffect(() => { setVisibleCount(24) }, [cat, lang])
  const items = all.filter((a) => a.cat[lang] === cat && a.content[lang])
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
        <a className="section-hero-back" href="#/" onClick={() => (window.location.hash = '#/')}>
          <Mi name="arrow_back" />
          {lang === 'ar' ? 'الرئيسية' : lang === 'fr' ? 'Accueil' : 'Home'}
        </a>
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
            {lang === 'ar' ? 'عرض ٢٤ مقالاً إضافياً' : lang === 'fr' ? 'Afficher 24 articles de plus' : 'Show 24 more articles'}
            <Mi name="expand_more" />
          </button>
        )}
      </section>
    </div>
  )
}

function ArticleCard({ article, lang, level }: { article: Article; lang: Lang; level: Level }) {
  const c = contentOf(article, lang)
  const meta = articleMeta(article.id)
  const photo = level !== 'kids' && meta.img
  return (
    <a className="card" data-cat={article.cat[lang]} href={`#/article/${article.id}`}>
      {photo ? (
        <div className="card-photo">
          <img src={publicUrl(`assets/img/${meta.img}`)} alt="" loading="lazy" />
        </div>
      ) : (
        <div
          className="card-art"
          style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}99 70%)` }}
        >
          {level === 'kids' ? <span>{meta.emoji}</span> : <Mi name={articleIcon(article.id, article.cat[lang])} className="card-art-icon" />}
        </div>
      )}
      <div className="card-body">
        <span className="card-cat">{article.cat[lang]}</span>
        {NEW_IDS.has(article.id) && <span className="new-badge">{t(lang, 'newBadge')}</span>}
        <h3 className="card-title">{c.title}</h3>
        <p className="card-summary">{c.summary}</p>
      </div>
    </a>
  )
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
  const article = all.find((a) => a.id === id)
  const [speaking, setSpeaking] = useState(false)
  const [showSlides, setShowSlides] = useState(false)
  const [bannerImgOk, setBannerImgOk] = useState(true)
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
  const kidsC = isKids ? (KIDS[article.id] ?? KIDS_NEW[article.id])?.[lang] : undefined
  const c = kidsC ?? contentOf(article, lang)
  const missingLang = !article.content[lang] && !kidsC
  if (missingLang) {
    const unavailable = {
      ar: ['المقال غير متاح بهذه اللغة بعد', 'لم تكتمل ترجمته بعد، لذلك أخفينا النصوص والوسائط بلغات أخرى.'],
      fr: ['Article indisponible dans cette langue', 'Sa traduction n’est pas encore prête. Le contenu dans les autres langues reste masqué.'],
      en: ['Article not available in this language yet', 'Its translation is not ready. Content in other languages stays hidden.'],
    }[lang]
    return <div className="page"><button className="ghost-btn" onClick={onBack}>← {t(lang, 'backHome')}</button><section className="lang-unavailable"><Mi name="translate" /><h1>{unavailable[0]}</h1><p>{unavailable[1]}</p></section></div>
  }
  const facts = isHigh ? (FACTS[article.id] ?? FACTS_NEW[article.id])?.[lang] : undefined
  const related = all.filter((a) => article.related.includes(a.id))
  const sourceEntries = article.sources?.[lang] ? [[lang, article.sources[lang]!]] as [Lang, ArticleSource[]][] : []

  const path = PATHS.find((p) => p.topics.includes(article.id))
  const idx = path ? path.topics.indexOf(article.id) : -1
  const nextId = path && idx >= 0 && idx < path.topics.length - 1 ? path.topics[idx + 1] : null
  const nextArticle = nextId ? all.find((a) => a.id === nextId) : null
  const meta = articleMeta(article.id)
  const photoBanner = !isKids && meta.img !== '' && bannerImgOk

  return (
    <div className="page">
      <button className="ghost-btn" onClick={onBack}>
        ← {t(lang, 'backHome')}
      </button>
      <div
        className="article-banner"
        style={
          photoBanner
            ? undefined
            : { background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}b3 55%, #16293f 130%)` }
        }
      >
        {photoBanner && (
          <>
            <img
              className="banner-img"
              src={publicUrl(`assets/img/${meta.img}`)}
              alt=""
              onError={() => setBannerImgOk(false)}
            />
            <div className="banner-overlay" />
          </>
        )}
        {isKids ? <span className="banner-emoji">{meta.emoji}</span> : !photoBanner && <Mi name={articleIcon(article.id, article.cat[lang])} className="banner-symbol" />}
        <div className="banner-text">
          <span className="banner-cat">{article.cat[lang]}</span>
          <h1 className="banner-title">{c.title}</h1>
        </div>
      </div>
      <article className={isKids ? 'article kids-mode' : 'article'}>
        
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
        <ArticleMedia article={article} lang={lang} level={level} />
        {!isKids && <LessonPlan article={article} lang={lang} onDone={onDone} done={done} />}
        {c.body.map((p, i) => (
          <p key={i} className={i === 0 ? 'article-lead' : 'article-para'}>
            {p}
          </p>
        ))}
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
        <section className="sources-box">
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
          ) : (
            <p>{t(lang, 'sourceNotRecorded')}</p>
          )}
          <div className="article-actions">
            <button className="ghost-btn small" onClick={() => setShowSlides(true)}>
              <Mi name="present_to_all" /> {t(lang, 'presentMode')}
            </button>
            <button
              className="ghost-btn small"
              onClick={() => {
                if (speaking) {
                  stopSpeak()
                  setSpeaking(false)
                } else {
                  speak(
                    c.title + '. ' + c.body.join(' '),
                    lang,
                    () => setSpeaking(false),
                    () => setSpeaking(false),
                  )
                  setSpeaking(true)
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
            {nextArticle && (
              <button
                className="primary-btn small"
                onClick={() => (window.location.hash = `#/article/${nextArticle.id}`)}
              >
                {t(lang, 'nextInPath')}: {contentOf(nextArticle, lang).title} <Mi name="arrow_forward" />
              </button>
            )}
          </div>
        </section>
      </article>
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
