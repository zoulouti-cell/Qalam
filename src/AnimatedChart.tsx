import { useEffect, useRef, useState } from 'react'
import type { Lang } from './i18n'
import type { Topic } from './knowledgeGraph'

/** Animated bar chart (count-up + growth), accessible & reduced-motion aware. */
export default function AnimatedChart({ topic, lang }: { topic: Topic; lang: Lang }) {
  const [inView, setInView] = useState(false)
  const [progress, setProgress] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const chart = topic.chart
  const max = Math.max(...chart.rows.map((r) => r.value), 1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true)
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setProgress(1)
      return
    }
    let raf = 0
    const start = performance.now()
    const dur = 1100
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - k, 3)
      setProgress(eased)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, topic.id])

  const fmt = (v: number) => new Intl.NumberFormat(lang === 'ar' ? 'ar-MA-u-nu-latn' : lang === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 }).format(v)

  return (
    <div className="anim-chart" ref={ref} role="group" aria-label={`${chart.title[lang]} — ${chart.unit[lang]}`}>
      <div className="anim-chart-head">
        <h4>{chart.title[lang]}</h4>
        <span>{chart.unit[lang]}</span>
      </div>
      <p className="chart-provenance" role="note">{lang === 'ar' ? 'قيم تقريبية توضيحية للمقارنة التعليمية؛ لم تستكمل مراجعتها مرجعًا مرجعًا، ولا تمثل بيانات رصد آنية.' : lang === 'fr' ? 'Valeurs approximatives et illustratives : validation source par source encore nécessaire, pas de données en temps réel.' : 'Approximate illustrative values: source-by-source validation is pending; these are not live observations.'}</p>
      <ul className="anim-chart-rows">
        {chart.rows.map((r, i) => {
          const pct = Math.max(0, (r.value / max) * 100 * progress)
          return (
            <li key={r.label[lang]}>
              <span className="anim-chart-label">{r.label[lang]}</span>
              <span className="anim-chart-bar">
                <span
                  style={{ width: `${pct}%`, transitionDelay: `${i * 60}ms` }}
                  data-index={i}
                />
              </span>
              <span className="anim-chart-value">{fmt(r.value)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
