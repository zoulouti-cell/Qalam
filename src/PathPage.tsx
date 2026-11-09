import { t, type Lang } from './i18n'
import { PATHS, contentOf } from './content'
import { ARTICLES } from './data'
import { NEW_ARTICLES } from './content'

const ALL = [...NEW_ARTICLES, ...ARTICLES]

function Ring({ pct }: { pct: number }) {
  const R = 26
  const C = 2 * Math.PI * R
  return (
    <svg viewBox="0 0 64 64" className="ring">
      <circle cx="32" cy="32" r={R} className="ring-bg" />
      <circle
        cx="32"
        cy="32"
        r={R}
        className="ring-fg"
        strokeDasharray={`${(C * pct) / 100} ${C}`}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="37" textAnchor="middle" className="ring-text">
        {pct}%
      </text>
    </svg>
  )
}

export default function PathPage({ lang, done }: { lang: Lang; done: string[] }) {
  const total = PATHS.reduce((s, p) => s + p.topics.length, 0)
  const doneCount = done.filter((id) => PATHS.some((p) => p.topics.includes(id))).length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="page-wide">
      <div className="path-head">
        <div>
          <h1 className="article-title">{t(lang, 'learningPath')}</h1>
          <p className="empty">{t(lang, 'chooseLevel')}</p>
        </div>
        <div className="path-ring-wrap">
          <Ring pct={pct} />
          <span className="path-ring-label">
            {t(lang, 'yourProgress')}: {doneCount}/{total}
          </span>
        </div>
      </div>

      {PATHS.map((p) => {
        const pDone = p.topics.filter((id) => done.includes(id)).length
        return (
          <section key={p.id} className="path-card" style={{ borderInlineStartColor: p.color }}>
            <div className="path-card-head">
              <h2 style={{ color: '#17382f' }}>
                {p.icon} {p.title[lang]}
              </h2>
              <span className="path-count">
                {pDone}/{p.topics.length}
              </span>
            </div>
            <ol className="path-topics">
              {p.topics.map((tid, i) => {
                const a = ALL.find((x) => x.id === tid)
                if (!a) return null
                const isDone = done.includes(tid)
                return (
                  <li key={tid} className={isDone ? 'topic done' : 'topic'}>
                    <span className="topic-num" style={{ background: isDone ? '#2e7d32' : p.color }}>
                      {isDone ? '✓' : i + 1}
                    </span>
                    <a href={`#/article/${tid}`} onClick={() => (window.location.hash = `#/article/${tid}`)}>
                      {contentOf(a, lang).title}
                    </a>
                    {isDone && <span className="done-badge">{t(lang, 'doneBadge')}</span>}
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
