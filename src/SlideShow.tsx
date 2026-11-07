import Mi from './Mi'
import { useEffect, useState } from 'react'
import { t, type Lang } from './i18n'
import type { Article } from './data'
import { articleMeta, articleIcon, FACTS, FACTS_NEW, KIDS, KIDS_NEW, contentOf, type Level } from './content'
import { sound } from './sound'

interface Slide {
  kind: 'cover' | 'text' | 'facts' | 'end'
  text?: string
}

export default function SlideShow({
  article,
  lang,
  level,
  onClose,
}: {
  article: Article
  lang: Lang
  level: Level
  onClose: () => void
}) {
  const isKids = level === 'kids'
  const kidsC = isKids ? (KIDS[article.id] ?? KIDS_NEW[article.id])?.[lang] : undefined
  const c = kidsC ?? contentOf(article, lang)
  const facts = (FACTS[article.id] ?? FACTS_NEW[article.id])?.[lang]
  const meta = articleMeta(article.id)

  const slides: Slide[] = [
    { kind: 'cover' },
    ...c.body.map((p) => ({ kind: 'text' as const, text: p })),
    ...(facts && facts.length > 0 ? [{ kind: 'facts' as const }] : []),
    { kind: 'end' },
  ]

  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') setI((x) => Math.min(slides.length - 1, x + 1))
      else if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length, onClose])

  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setI((x) => (x >= slides.length - 1 ? 0 : x + 1)), 6500)
    return () => clearInterval(id)
  }, [auto, slides.length])

  const s = slides[i]

  return (
    <div className="slideshow">
      <div className="slideshow-top">
        <span className="slideshow-count">
          {t(lang, 'slideWord')} {i + 1}/{slides.length}
        </span>
        <button className="ghost-btn small" onClick={() => (setAuto(!auto), sound.click())}>
          <Mi name={auto ? 'pause' : 'play_arrow'} /> {t(lang, 'presentAutoplay')}
        </button>
        <button className="ghost-btn small" onClick={onClose}>
          <Mi name="close" /> {t(lang, 'presentExit')}
        </button>
      </div>
      <div className="slideshow-stage" key={i}>
        {s.kind === 'cover' && (
          <div className="slide-cover" style={{ background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}cc 60%, #16293f 130%)` }}>
            {isKids ? <span className="slide-emoji">{meta.emoji}</span> : <Mi name={articleIcon(article.id, article.cat[lang])} className="slide-emoji academic-slide-icon" />}
            <h1>{c.title}</h1>
            <p>{article.cat[lang]}</p>
          </div>
        )}
        {s.kind === 'text' && (
          <div className="slide-text">
            <p>{s.text}</p>
          </div>
        )}
        {s.kind === 'facts' && (
          <div className="slide-facts">
            <h2>⚡ {t(lang, 'factsTitle')}</h2>
            <ul>
              {facts!.map((f, k) => (
                <li key={k}>{f}</li>
              ))}
            </ul>
          </div>
        )}
        {s.kind === 'end' && (
          <div className="slide-end">
            {isKids ? <span className="slide-emoji">🎓</span> : <Mi name="check_circle" className="slide-emoji academic-slide-icon" />}
            <h2>{c.title}</h2>
            <button className="primary-btn" onClick={() => (window.location.hash = '#/quiz')}>
              {t(lang, 'quiz')}
            </button>
          </div>
        )}
      </div>
      <div className="slideshow-nav">
        <button className="ghost-btn" onClick={() => setI((x) => Math.max(0, x - 1))}>
          ←
        </button>
        <button className="ghost-btn" onClick={() => setI((x) => Math.min(slides.length - 1, x + 1))}>
          →
        </button>
      </div>
    </div>
  )
}
