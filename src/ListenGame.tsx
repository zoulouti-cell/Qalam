import { useMemo, useState } from 'react'
import { t, type Lang } from './i18n'
import { ARTICLES } from './data'
import { NEW_ARTICLES, articleMeta, contentOf } from './content'
import { speak, sound } from './sound'
import { addInk } from './rewards'
import type { Article } from './data'

const ALL = [...NEW_ARTICLES, ...ARTICLES]

interface Round {
  article: Article
  options: Article[]
}

export default function ListenGame({ lang }: { lang: Lang }) {
  const [seed, setSeed] = useState(0)
  const rounds = useMemo<Round[]>(() => {
    const pool = [...ALL].sort(() => Math.random() - 0.5).slice(0, 6)
    return pool.map((a) => {
      const distractors = ALL.filter((x) => x.id !== a.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
      return { article: a, options: [a, ...distractors].sort(() => Math.random() - 0.5) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, seed])

  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  const round = rounds[Math.min(i, rounds.length - 1)]

  const pick = (id: string) => {
    if (picked) return
    setPicked(id)
    if (id === round.article.id) {
      setScore((s) => s + 1)
      addInk(2)
      sound.success()
    } else {
      sound.fail()
    }
    setTimeout(() => {
      if (i + 1 >= rounds.length) setDone(true)
      else {
        setI(i + 1)
        setPicked(null)
      }
    }, 1100)
  }

  const restart = () => {
    setSeed((s) => s + 1)
    setI(0)
    setScore(0)
    setDone(false)
    setPicked(null)
    sound.click()
  }

  if (done) {
    return (
      <div className="page-wide listen">
        <h1 className="article-title">🎧 {t(lang, 'listenGame')}</h1>
        <div className="quiz-done">
          <p className="big-score">
            {score} / {rounds.length}
          </p>
          <p className="verdict">{score >= rounds.length * 0.7 ? t(lang, 'excellent') : t(lang, 'good')}</p>
          <div className="quiz-actions">
            <button className="primary-btn" onClick={restart}>
              {t(lang, 'gameRestart')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wide listen">
      <h1 className="article-title">🎧 {t(lang, 'listenGame')}</h1>
      <p className="empty">{t(lang, 'listenIntro')}</p>
      <div className="listen-head">
        <span className="listen-progress">
          {i + 1}/{rounds.length}
        </span>
        <span className="listen-score">
          {t(lang, 'listenScore')}: {score}
        </span>
        <button className="primary-btn small" onClick={() => speak(contentOf(round.article, lang).title, lang)}>
          {t(lang, 'listenPlay')}
        </button>
      </div>
      <div className="listen-options">
        {round.options.map((a) => {
          let cls = 'listen-option'
          if (picked) {
            if (a.id === round.article.id) cls += ' correct'
            else if (a.id === picked) cls += ' wrong'
          }
          return (
            <button key={a.id} className={cls} onClick={() => pick(a.id)} disabled={picked !== null}>
              <span className="listen-emoji">{articleMeta(a.id).emoji}</span>
              <span>{contentOf(a, lang).title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
