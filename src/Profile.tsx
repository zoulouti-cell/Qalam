import { useEffect, useState } from 'react'
import { t, type Lang } from './i18n'
import { BADGES, GARDEN_PLANTS, PATHS, NEW_ARTICLES, contentOf } from './content'
import { ARTICLES } from './data'
import { loadInk, loadBadges, loadDone, loadName, saveName } from './storage'
import { sound } from './sound'
import { publicUrl } from './publicUrl'

const ALL = [...NEW_ARTICLES, ...ARTICLES]

export default function Profile({ lang }: { lang: Lang }) {
  const [ink, setInk] = useState(0)
  const [badges, setBadges] = useState<string[]>([])
  const [done, setDone] = useState<string[]>([])
  const [name, setName] = useState('')
  const [certPath, setCertPath] = useState<string | null>(null)

  const refresh = () => {
    setInk(loadInk())
    setBadges(loadBadges())
    setDone(loadDone())
    setName(loadName())
  }

  useEffect(() => {
    refresh()
    window.addEventListener('encarta-rewards', refresh)
    return () => window.removeEventListener('encarta-rewards', refresh)
  }, [])

  const completedPaths = PATHS.filter((p) => p.topics.every((tid) => done.includes(tid)))
  const cert = certPath ? PATHS.find((p) => p.id === certPath) : null

  return (
    <div className="page-wide profile">
      <h1 className="article-title">🖋 {t(lang, 'navProfile')}</h1>

      <section className="ink-hero">
        <span className="ink-pen">✒️</span>
        <span className="ink-number">{ink}</span>
        <span className="ink-label">{t(lang, 'inkPoints')}</span>
        <span className="ink-drop">💧</span>
      </section>

      <section>
        <h2 className="section-title">🎖 {t(lang, 'myBadges')}</h2>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const earned = badges.includes(b.id)
            return (
              <div key={b.id} className={earned ? 'badge earned' : 'badge locked'}>
                <span className="badge-icon">{earned ? b.icon : '🔒'}</span>
                <strong>{earned ? b.title[lang] : t(lang, 'lockedBadge')}</strong>
                <small>{b.desc[lang]}</small>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title">🌿 {t(lang, 'gardenTitle')}</h2>
        <p className="empty">{t(lang, 'gardenNote')}</p>
        <div className="garden">
          {ALL.filter((a) => GARDEN_PLANTS[a.id]).map((a) => {
            const grown = done.includes(a.id)
            return (
              <div key={a.id} className={grown ? 'garden-plot grown' : 'garden-plot'} title={contentOf(a, lang).title}>
                <span className="garden-plant">{grown ? GARDEN_PLANTS[a.id] : '🌰'}</span>
                <span className="garden-label">{contentOf(a, lang).title}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title">🏆 {t(lang, 'certificates')}</h2>
        {completedPaths.length === 0 ? (
          <p className="empty">{t(lang, 'gardenNote')}</p>
        ) : (
          <div className="cert-list">
            {completedPaths.map((p) => (
              <button key={p.id} className="primary-btn" onClick={() => (setCertPath(p.id), sound.click())}>
                {p.icon} {t(lang, 'pathCompleted')}: {p.title[lang]} — {t(lang, 'getCert')}
              </button>
            ))}
          </div>
        )}
      </section>

      {cert && (
        <div className="cert-modal" onClick={() => setCertPath(null)}>
          <div className="certificate" onClick={(e) => e.stopPropagation()}>
            <div className="cert-inner">
              <img className="cert-logo" src={publicUrl('assets/qalam-q-logo-small.png')} alt="قلم" />
              <h2>✒️ {t(lang, 'appName')}</h2>
              <p className="cert-hereby">{t(lang, 'certHereby')}</p>
              <p className="cert-path">
                {cert.icon} {cert.title[lang]}
              </p>
              <p className="cert-name">{name || '—————'}</p>
              <label className="cert-field">
                {t(lang, 'certName')}:
                <input
                  value={name}
                  onChange={(e) => (setName(e.target.value), saveName(e.target.value))}
                  placeholder="…"
                />
              </label>
              <p className="cert-ink">
                💧 {t(lang, 'certInk')}: {ink}
              </p>
              <div className="cert-seal">🖋 {t(lang, 'certSeal')}</div>
              <p className="cert-date">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US')}</p>
              <button className="primary-btn" onClick={() => window.print()}>
                🖨 {t(lang, 'printCert')}
              </button>
              <button className="ghost-btn small" onClick={() => setCertPath(null)}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
