import { useEffect, useMemo, useState } from 'react'
import { t, type Lang } from './i18n'
import { articleMeta, contentOf } from './content'
import { ARTICLES } from './data'
import { NEW_ARTICLES } from './content'
import { sound } from './sound'
import { addInk, awardBadge } from './rewards'

const ALL = [...NEW_ARTICLES, ...ARTICLES]

interface Card {
  id: number
  metaId: string
  emoji: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MemoryGame({ lang }: { lang: Lang }) {
  const deck = useMemo<Card[]>(() => {
    const picked = shuffle(ALL).slice(0, 6)
    const pairs: Card[] = []
    picked.forEach((a, i) => {
      const emoji = articleMeta(a.id).emoji
      pairs.push({ id: i * 2, metaId: a.id, emoji })
      pairs.push({ id: i * 2 + 1, metaId: a.id, emoji })
    })
    return shuffle(pairs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [moves, setMoves] = useState(0)

  const won = matched.length === 6

  useEffect(() => {
    if (won) {
      addInk(10)
      awardBadge('memorizer')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won])

  const flip = (card: Card) => {
    if (open.length === 2 || open.includes(card.id) || matched.includes(card.metaId)) return
    sound.pop()
    const next = [...open, card.id]
    setOpen(next)
    if (next.length === 2) {
      setMoves((m) => m + 1)
      const [c1, c2] = [deck.find((d) => d.id === next[0])!, deck.find((d) => d.id === next[1])!]
      if (c1.metaId === c2.metaId) {
        setTimeout(() => {
          setMatched((m) => [...m, c1.metaId])
          setOpen([])
          sound.success()
        }, 450)
      } else {
        setTimeout(() => setOpen([]), 900)
      }
    }
  }

  const restart = () => {
    setOpen([])
    setMatched([])
    setMoves(0)
    sound.click()
  }

  const matchedArticle = (metaId: string) => ALL.find((a) => a.id === metaId)

  return (
    <div className="page-wide game">
      <h1 className="article-title">🃏 {t(lang, 'navGame')}</h1>
      <p className="empty">{t(lang, 'gameIntro')}</p>
      <div className="game-stats">
        <span>
          {t(lang, 'gameMoves')}: <strong>{moves}</strong>
        </span>
        <span>
          {t(lang, 'gamePairs')}: <strong>{matched.length}/6</strong>
        </span>
        <button className="ghost-btn small" onClick={restart}>
          {t(lang, 'gameRestart')}
        </button>
      </div>
      {won && (
        <div className="game-win">
          <span className="game-win-emoji">🏆</span> {t(lang, 'gameWin')}
        </div>
      )}
      <div className="game-grid">
        {deck.map((card) => {
          const isOpen = open.includes(card.id) || matched.includes(card.metaId)
          const isMatched = matched.includes(card.metaId)
          return (
            <button
              key={card.id}
              className={isMatched ? 'game-card matched' : isOpen ? 'game-card open' : 'game-card'}
              onClick={() => flip(card)}
              disabled={isMatched}
            >
              <span className="game-card-face">{isOpen ? card.emoji : 'ق'}</span>
            </button>
          )
        })}
      </div>
      <div className="game-legend">
        {matched.map((m) => {
          const a = matchedArticle(m)
          if (!a) return null
          return (
            <a key={m} href={`#/article/${m}`} className="game-link" onClick={() => (window.location.hash = `#/article/${m}`)}>
              {articleMeta(m).emoji} {contentOf(a, lang).title}
            </a>
          )
        })}
      </div>
    </div>
  )
}
