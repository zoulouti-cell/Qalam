import Mi from './Mi'
import { useCallback, useEffect, useRef, useState } from 'react'
import { t, type Lang } from './i18n'
import { ZIM_CATALOG, kiwixReaderUrl, zimPath, listInstalledZims, type InstalledZim, type ZimPack } from './zimlib'

export default function Library({ lang, view }: { lang: Lang; view: string | null }) {
  const [installed, setInstalled] = useState<InstalledZim[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [readerState, setReaderState] = useState<'loading' | 'ready' | 'error'>('loading')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const refresh = useCallback(async () => {
    setInstalled(await listInstalledZims())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (view) {
    const pack = ZIM_CATALOG.find((p) => p.id === view)
    if (!pack) return <p className="empty">{t(lang, 'noResults')}</p>
    return (
      <div className="page-wide">
        <button className="ghost-btn" onClick={() => (window.location.hash = '#/library')}>
          ← {t(lang, 'back')}
        </button>
        <h1 className="article-title">
          {pack.title[lang]} <span className="lib-badge">{pack.lang.toUpperCase()}</span>
        </h1>
        <div className="kiwix-frame-wrap">
          {readerState !== 'ready' && (
            <div className="kiwix-loading">
              {readerState === 'error'
                ? lang === 'ar' ? 'تعذر فتح الأرشيف؛ قد يكون غير مكتمل. ارجع إلى المكتبة وأعد تنزيله.' : lang === 'fr' ? 'Impossible d’ouvrir l’archive ; elle est peut-être incomplète. Revenez à la bibliothèque et téléchargez-la de nouveau.' : 'The archive could not be opened; it may be incomplete. Return to the library and download it again.'
                : t(lang, 'downloading')}
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="kiwix-frame"
            src={kiwixReaderUrl(pack.file)}
            title={pack.title[lang]}
            style={readerState === 'ready' ? undefined : { visibility: 'hidden' }}
            onLoad={() => {
              setReaderState('loading')
              const win = iframeRef.current?.contentWindow as
                | (Window & {
                    setRemoteArchives?: (...urls: string[]) => Promise<unknown>
                    selectedArchive?: { isReady?: () => boolean } | null
                  })
                | null
              if (win && typeof win.setRemoteArchives === 'function') {
                win
                  .setRemoteArchives(zimPath(pack.file))
                  .then(() => {
                    let attempts = 0
                    const checkArchive = () => {
                      if (win.selectedArchive?.isReady?.()) setReaderState('ready')
                      else if (attempts++ >= 100) setReaderState('error')
                      else window.setTimeout(checkArchive, 300)
                    }
                    checkArchive()
                  })
                  .catch(() => setReaderState('error'))
              } else {
                setReaderState('error')
              }
            }}
          />
        </div>
      </div>
    )
  }

  // A previous interrupted download can leave a tiny .zim file behind. Do not treat it as installed.
  const isInstalled = (p: ZimPack) => installed.some((z) => z.name === p.file && (p.sizeMB === 0 || z.sizeMB >= p.sizeMB * 0.8))

  const startDownload = async (p: ZimPack) => {
    setError('')
    setProgress((pr) => ({ ...pr, [p.id]: 0 }))
    try {
      const res = await fetch(`/api/zim-download?name=${encodeURIComponent(p.file)}&url=${encodeURIComponent(p.url)}`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const total = Number(res.headers.get('content-length') || 0)
      if (!res.body) throw new Error('no body')
      const reader = res.body.getReader()
      let got = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        got += value?.length ?? 0
        if (total) setProgress((pr) => ({ ...pr, [p.id]: Math.min(99.9, (got / total) * 100) }))
      }
      setProgress((pr) => ({ ...pr, [p.id]: 100 }))
      await refresh()
    } catch (e) {
      setError(`${p.file}: ${e instanceof Error ? e.message : String(e)} — ${t(lang, 'noResults')}`)
    }
  }

  return (
    <div className="page-wide">
      <h1 className="article-title">{t(lang, 'navLibrary')}</h1>
      <p className="empty">{t(lang, 'libraryIntro')}</p>
      {error && <p className="lib-error">{error}</p>}
      <div className="cards">
        {ZIM_CATALOG.filter((p) => p.lang === lang).map((p) => {
          const ok = isInstalled(p)
          const pr = progress[p.id]
          return (
            <div key={p.id} className="card lib-card">
              <span className="card-cat">
                {p.lang.toUpperCase()} • {p.sizeMB > 0 ? `${p.sizeMB} MB` : '—'}
              </span>
              <h3 className="card-title">{p.title[lang]}</h3>
              <p className="card-summary">{p.desc[lang]}</p>
              <div className="lib-actions">
                {ok ? (
                  <button
                    className="primary-btn"
                    onClick={() => (window.location.hash = `#/library/view/${p.id}`)}
                  >
                    <Mi name="menu_book" /> {t(lang, 'openLibrary')}
                  </button>
                ) : pr !== undefined && pr < 100 ? (
                  <div className="lib-progress-wrap">
                    <div className="lib-progress">
                      <div className="lib-progress-fill" style={{ width: `${pr}%` }} />
                    </div>
                    <span className="lib-progress-label">
                      {t(lang, 'downloading')} {pr.toFixed(0)}%
                    </span>
                  </div>
                ) : (
                  <button className="primary-btn" onClick={() => void startDownload(p)}>
                    <Mi name="download" /> {t(lang, 'downloadNow')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
