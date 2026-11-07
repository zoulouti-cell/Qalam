import { useEffect, useRef, useState, type FormEvent } from 'react'
import Mi from './Mi'
import { t, type Lang } from './i18n'

type SearchPage = {
  id: number
  key: string
  title: string
  description?: string
  excerpt?: string
  thumbnail?: { url: string; width?: number; height?: number } | null
}

type SearchResponse = { pages?: SearchPage[] }

const WIKIPEDIA: Record<Lang, string> = {
  ar: 'ar',
  fr: 'fr',
  en: 'en',
}

const EXAMPLES: Record<Lang, string[]> = {
  ar: ['المغرب', 'الثقب الأسود', 'ابن بطوطة', 'الذكاء الاصطناعي'],
  fr: ['Maroc', 'Trou noir', 'Ibn Battûta', 'Intelligence artificielle'],
  en: ['Morocco', 'Black hole', 'Ibn Battuta', 'Artificial intelligence'],
}

function plainText(value = ''): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export default function Library(props: { lang: Lang; view: string | null }) {
  const { lang } = props
  const [query, setQuery] = useState('')
  const [pages, setPages] = useState<SearchPage[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const activeRequest = useRef<AbortController | null>(null)

  useEffect(() => () => activeRequest.current?.abort(), [])

  const search = async (term: string) => {
    const clean = term.trim()
    if (!clean) return
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    setQuery(clean)
    setLoading(true)
    setSearched(true)
    setError('')
    try {
      const endpoint = `https://${WIKIPEDIA[lang]}.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(clean)}&limit=12`
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json() as SearchResponse
      setPages(Array.isArray(data.pages) ? data.pages : [])
    } catch {
      setPages([])
      setError(t(lang, 'libraryOnlineError'))
    } finally {
      window.clearTimeout(timeout)
      if (activeRequest.current === controller) activeRequest.current = null
      setLoading(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void search(query)
  }

  return (
    <div className="page-wide online-library" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="online-library-hero">
        <span className="online-library-icon"><Mi name="travel_explore" /></span>
        <div>
          <span className="online-library-eyebrow"><Mi name="public" /> {t(lang, 'libraryOnlineLabel')}</span>
          <h1 className="article-title">{t(lang, 'navLibrary')}</h1>
          <p>{t(lang, 'libraryIntro')}</p>
        </div>
      </header>

      <form className="online-library-search" onSubmit={submit} role="search">
        <Mi name="search" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(lang, 'librarySearchPlaceholder')}
          aria-label={t(lang, 'librarySearchPlaceholder')}
          required
        />
        <button className="primary-btn" type="submit" disabled={loading || !query.trim()}>
          <Mi name="search" /> {t(lang, 'librarySearchButton')}
        </button>
      </form>

      {!searched && (
        <div className="online-library-suggestions">
          <span>{t(lang, 'librarySearchHint')}</span>
          {EXAMPLES[lang].map((example) => (
            <button className="quick-chip" key={example} onClick={() => void search(example)} type="button">
              {example}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="online-library-state" role="status"><span className="loading-spinner" />{t(lang, 'libraryOnlineLoading')}</div>}
      {error && <div className="online-library-error" role="alert"><Mi name="wifi_off" />{error}</div>}
      {!loading && !error && searched && pages.length === 0 && (
        <div className="online-library-state"><Mi name="search_off" />{t(lang, 'libraryOnlineEmpty')}</div>
      )}

      {!loading && pages.length > 0 && (
        <>
          <div className="online-library-results-head">
            <h2>{t(lang, 'libraryOnlineResults')} <span>{pages.length}</span></h2>
            <span>{lang === 'ar' ? 'ويكيبيديا العربية' : lang === 'fr' ? 'Wikipédia en français' : 'English Wikipedia'}</span>
          </div>
          <div className="online-library-grid">
            {pages.map((page) => {
              const href = `https://${WIKIPEDIA[lang]}.wikipedia.org/wiki/${encodeURIComponent(page.key || page.title.replaceAll(' ', '_'))}`
              return (
                <a className="online-article-card" href={href} key={page.id} target="_blank" rel="noreferrer">
                  {page.thumbnail?.url ? (
                    <img className="online-article-image" src={page.thumbnail.url} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="online-article-placeholder"><Mi name="menu_book" /></span>
                  )}
                  <span className="online-article-content">
                    <strong>{page.title}</strong>
                    {page.description && <span className="online-article-description">{page.description}</span>}
                    <span className="online-article-excerpt">{plainText(page.excerpt || page.description) || t(lang, 'libraryOnlineNoExcerpt')}</span>
                    <span className="online-article-link">{t(lang, 'libraryOpenSource')} <Mi name="open_in_new" /></span>
                  </span>
                </a>
              )
            })}
          </div>
        </>
      )}

      <footer className="online-library-attribution">
        <Mi name="info" />
        <span>{t(lang, 'librarySourceNote')} <a href={`https://${WIKIPEDIA[lang]}.wikipedia.org/`} target="_blank" rel="noreferrer">Wikipedia</a> · CC BY-SA</span>
      </footer>
    </div>
  )
}
