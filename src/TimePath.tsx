import Mi from './Mi'
import { useEffect, useState } from 'react'
import type { Lang } from './i18n'
import type { Level } from './content'
import type { TimelineEvent } from './timelineData'
import { t } from './i18n'

export default function TimePath({ events, lang, level }: { events: TimelineEvent[]; lang: Lang; level: Level }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const current = events[index]

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setIndex((value) => Math.min(value + 1, events.length - 1))
    }, 5200)
    return () => window.clearInterval(timer)
  }, [events.length, playing])

  useEffect(() => {
    if (playing && index >= events.length - 1) setPlaying(false)
  }, [events.length, index, playing])

  if (!current) return null

  return (
    <section className="time-path" aria-label={t(lang, 'timelineTitle')}>
      <div className="time-path-head">
        <div>
          <h3>{t(lang, 'timelineTitle')}</h3>
          <p>{t(lang, 'timelineNotScale')}</p>
        </div>
        <button
          className="ghost-btn small"
          onClick={() => {
            if (playing) setPlaying(false)
            else {
              if (index >= events.length - 1) setIndex(0)
              setPlaying(true)
            }
          }}
        >
          <Mi name={playing ? 'pause' : 'play_arrow'} />
          {playing ? t(lang, 'timelinePause') : t(lang, 'timelinePlay')}
        </button>
      </div>

      <div className="time-path-track" role="group" aria-label={t(lang, 'timelineTitle')}>
        {events.map((event, i) => (
          <button
            key={event.id}
            className={i === index ? 'time-path-stop active' : 'time-path-stop'}
            aria-pressed={i === index}
            onClick={() => {
              setIndex(i)
              setPlaying(false)
            }}
          >
            <span className="time-path-dot" />
            <span className="time-path-stop-label">{event.time[lang]}</span>
          </button>
        ))}
      </div>

      <label className="time-path-range">
        <span className="sr-only">{t(lang, 'timelineStage')}</span>
        <input
          type="range"
          min={0}
          max={events.length - 1}
          step={1}
          value={index}
          onChange={(e) => {
            setIndex(Number(e.target.value))
            setPlaying(false)
          }}
        />
        <span>{index + 1}/{events.length}</span>
      </label>

      <article className="time-path-event" aria-live="polite">
        <div className="time-path-place">
          <Mi name="public" /> {current.domain[lang]}
        </div>
        <div className="time-path-event-head">
          <span className="time-path-date">{current.time[lang]}</span>
          <h4>{current.title[lang]}</h4>
        </div>
        <p>{level === 'kids' ? current.kids[lang] : current.detail[lang]}</p>
        <a href={current.source.url} target="_blank" rel="noreferrer" className="time-path-source">
          {t(lang, 'sourceLink')}: {current.source.label}
          <Mi name="open_in_new" />
        </a>
      </article>
    </section>
  )
}
