import { useState } from 'react'
import type { Lang } from './i18n'
import type { ChartItem } from './mediaData'

/* Playful, number-free visualizations for kids level. */

function Sizes({ items, lang }: { items: ChartItem[]; lang: Lang }) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)))
  const sizes = items.map((i) => 22 + Math.pow(Math.abs(i.value) / max, 0.4) * 52)
  const [sel, setSel] = useState(0)
  return (
    <div className="kid-chart sizes">
      <div className="size-stage">
        {items.map((it, i) => (
          <button
            key={i}
            className={sel === i ? 'size-bubble active' : 'size-bubble'}
            style={{ width: sizes[i], height: sizes[i], background: it.color }}
            onClick={() => setSel(i)}
          >
            {it.label[lang]}
          </button>
        ))}
      </div>
      <p className="kid-note">
        {items[sel].label[lang]}: {items[sel].value > 0 ? `👍 ${items[sel].value}` : `🥶 ${items[sel].value}`}
      </p>
    </div>
  )
}

function Cups({ items, lang }: { items: ChartItem[]; lang: Lang }) {
  const total = items.reduce((s, i) => s + i.value, 0)
  const cells: { color: string; label: string }[] = []
  items.forEach((it) => {
    const n = Math.round((it.value / total) * 20)
    for (let k = 0; k < n; k++) cells.push({ color: it.color, label: it.label[lang] })
  })
  while (cells.length < 20) cells.push({ color: '#eee', label: '' })
  return (
    <div className="kid-chart">
      <div className="cup-grid">
        {cells.map((c, i) => (
          <span key={i} className="cup-cell" style={{ background: c.color }} title={c.label} />
        ))}
      </div>
      <ul className="cup-legend">
        {items.map((it, i) => (
          <li key={i}>
            <span className="pie-dot" style={{ background: it.color }} />
            {it.label[lang]}
          </li>
        ))}
      </ul>
      <p className="kid-note">
        {lang === 'ar'
          ? 'كل مربع = جزء من 20 جزءاً. أيهما أكثر؟'
          : lang === 'fr'
            ? 'Chaque carré = une part sur 20. Lequel est le plus grand ?'
            : 'Each square = one part of 20. Which one is biggest?'}
      </p>
    </div>
  )
}

function Beat({ items, lang }: { items: ChartItem[]; lang: Lang }) {
  const [sel, setSel] = useState(0)
  const it = items[sel]
  const speed = 60 / Math.max(20, it.value)
  return (
    <div className="kid-chart beat">
      <div className="beat-stage">
        <span className="beat-heart" style={{ animationDuration: `${speed}s` }}>
          ❤️
        </span>
        <span className="beat-pulse" style={{ animationDuration: `${speed}s` }} />
      </div>
      <div className="diagram-steps">
        {items.map((x, i) => (
          <button key={i} className={sel === i ? 'step-btn active' : 'step-btn'} onClick={() => setSel(i)}>
            {x.label[lang]}
          </button>
        ))}
      </div>
      <p className="kid-note">
        {it.label[lang]} — {lang === 'ar' ? 'شاهد القلب ينبض!' : lang === 'fr' ? 'Regarde le cœur battre !' : 'Watch the heart beat!'}
      </p>
    </div>
  )
}

function Blocks({ items, lang }: { items: ChartItem[]; lang: Lang }) {
  const max = Math.max(...items.map((i) => i.value))
  return (
    <div className="kid-chart blocks">
      <div className="block-row">
        {items.map((it, i) => {
          const n = Math.max(1, Math.round((it.value / max) * 8))
          return (
            <div key={i} className="block-col">
              <div className="block-stack">
                {Array.from({ length: n }, (_, k) => (
                  <span key={k} className="block" style={{ background: it.color, opacity: 0.65 + (k / n) * 0.35 }} />
                ))}
              </div>
              <span className="block-label">{it.label[lang]}</span>
            </div>
          )
        })}
      </div>
      <p className="kid-note">
        {lang === 'ar' ? 'كل مكعب صغير = خطوة. من بنى أعلى برج؟' : lang === 'fr' ? 'Chaque petit cube = une marche. Qui a construit la plus haute tour ?' : 'Each small cube = a step. Who built the tallest tower?'}
      </p>
    </div>
  )
}

function Crowd({ items, lang }: { items: ChartItem[]; lang: Lang }) {
  const max = Math.max(...items.map((i) => i.value))
  return (
    <div className="kid-chart crowd">
      <div className="crowd-rows">
        {items.map((it, i) => {
          const n = Math.max(1, Math.round((it.value / max) * 12))
          return (
            <div key={i} className="crowd-row">
              <span className="crowd-label" style={{ color: it.color }}>
                {it.label[lang]}
              </span>
              <span className="crowd-people">
                {Array.from({ length: n }, (_, k) => (
                  <span key={k}>👤</span>
                ))}
              </span>
            </div>
          )
        })}
      </div>
      <p className="kid-note">
        {lang === 'ar' ? 'كل شخص صغير = مجموعة كبيرة من الناس. أي صف أطول؟' : lang === 'fr' ? 'Chaque petit personnage = beaucoup de gens. Quelle file est la plus longue ?' : 'Each little person = many people. Which row is longest?'}
      </p>
    </div>
  )
}

function Count({ items, lang }: { items: ChartItem[]; lang: Lang }) {
  const [sel, setSel] = useState(0)
  const it = items[sel]
  const n = Math.min(26, Math.max(1, Math.round(it.value)))
  return (
    <div className="kid-chart count">
      <div className="ball-pool">
        {Array.from({ length: n }, (_, k) => (
          <span key={k} className="ball" style={{ background: it.color, animationDelay: `${k * 0.06}s` }} />
        ))}
      </div>
      <div className="diagram-steps">
        {items.map((x, i) => (
          <button key={i} className={sel === i ? 'step-btn active' : 'step-btn'} onClick={() => setSel(i)}>
            {x.label[lang]}
          </button>
        ))}
      </div>
      <p className="kid-note">
        {it.label[lang]}: {it.value} — {lang === 'ar' ? 'عدّ الكرات بنفسك!' : lang === 'fr' ? 'Compte les balles toi-même !' : 'Count the balls yourself!'}
      </p>
    </div>
  )
}

export default function KidsCharts({
  kidsKind,
  items,
  lang,
}: {
  kidsKind: 'sizes' | 'cups' | 'beat' | 'blocks' | 'crowd' | 'count'
  items: ChartItem[]
  lang: Lang
}) {
  switch (kidsKind) {
    case 'sizes':
      return <Sizes items={items} lang={lang} />
    case 'cups':
      return <Cups items={items} lang={lang} />
    case 'beat':
      return <Beat items={items} lang={lang} />
    case 'blocks':
      return <Blocks items={items} lang={lang} />
    case 'crowd':
      return <Crowd items={items} lang={lang} />
    case 'count':
      return <Count items={items} lang={lang} />
    default:
      return null
  }
}
