import Mi from './Mi'
import { useState } from 'react'
import { t, type Lang } from './i18n'
import type { Article } from './data'
import { MEDIA, type ChartItem } from './mediaData'
import { simplifyArticle, quizMeArticle } from './ai'
import type { Level } from './content'
import Scene3D from './Scenes3D'
import { BarChart, PieChart, Diagram } from './Diagrams'
import KidsCharts from './KidsCharts'
import TimePath from './TimePath'
import PyramidBuilder from './PyramidBuilder'

export default function ArticleMedia({
  article,
  lang,
  level,
}: {
  article: Article
  lang: Lang
  level: Level
}) {
  const m = MEDIA[article.id]
  const [tab, setTab] = useState<string>('')
  const [aiText, setAiText] = useState('')
  const [aiKind, setAiKind] = useState<'simplify' | 'quiz' | ''>('')
  const [aiErr, setAiErr] = useState('')

  if (!m) return null

  const tabs: { id: string; icon: string; label: string }[] = []
  if (m.scene) tabs.push({ id: 'scene', icon: 'view_in_ar', label: t(lang, 'mediaScene') })
  if (m.diagram) tabs.push({ id: 'diagram', icon: 'hub', label: t(lang, 'mediaDiagram') })
  if (m.charts && m.charts.length > 0) tabs.push({ id: 'charts', icon: 'monitoring', label: t(lang, 'mediaCharts') })
  if (m.timeline && m.timeline.length > 0) tabs.push({ id: 'timeline', icon: 'timeline', label: t(lang, 'mediaTimeline') })
  // Start with a light 2D view so opening an article does not fetch the 3D engine.
  const firstLightTab = tabs.find((x) => x.id !== 'scene')?.id
  const activeTab = tabs.some((x) => x.id === tab) ? tab : (firstLightTab ?? tabs[0]?.id ?? '')

  const runAi = async (kind: 'simplify' | 'quiz') => {
    setAiKind(kind)
    setAiErr('')
    setAiText('')
    const out =
      kind === 'simplify'
        ? await simplifyArticle(article, lang, setAiErr)
        : await quizMeArticle(article, lang, setAiErr)
    setAiText(out)
    setAiKind('')
  }

  const toItem = (c: ChartItem) => ({ label: c.label[lang], value: c.value, color: c.color })

  return (
    <section className="media-zone">
      <div className="media-tabs" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            className={activeTab === tb.id ? 'media-tab active' : 'media-tab'}
            onClick={() => setTab(tb.id)}
          >
            <Mi name={tb.icon} /> {tb.label}
          </button>
        ))}
        <span className="media-ai">
          <button className="ai-btn" disabled={aiKind !== ''} onClick={() => void runAi('simplify')}>
            <Mi name="auto_awesome" />{' '}
            {aiKind === 'simplify' ? t(lang, 'simplifying') : t(lang, 'simplify')}
          </button>
          <button className="ai-btn" disabled={aiKind !== ''} onClick={() => void runAi('quiz')}>
            <Mi name="quiz" /> {aiKind === 'quiz' ? t(lang, 'generating') : t(lang, 'quizMe')}
          </button>
        </span>
      </div>

      {article.id === 'pyramids' && <PyramidBuilder lang={lang} level={level} />}

      {activeTab === 'scene' && m.scene && <Scene3D kind={m.scene} lang={lang} />}
      {activeTab === 'timeline' && m.timeline && <TimePath events={m.timeline} lang={lang} level={level} />}
      {activeTab === 'diagram' && m.diagram && (
        <Diagram kind={m.diagram} lang={lang} title={article.content[lang].title} />
      )}
      {activeTab === 'charts' && m.charts && (
        <div className="charts-grid">
          {m.charts.map((c, i) =>
            level === 'kids' && c.kidsKind ? (
              <div key={i} className="chart-card">
                <h4 className="chart-title">{c.title[lang]}</h4>
                <KidsCharts kidsKind={c.kidsKind} items={c.items} lang={lang} />
              </div>
            ) : c.type === 'bar' ? (
              <BarChart key={i} title={c.title[lang]} items={c.items.map(toItem)} lang={lang} />
            ) : (
              <PieChart key={i} title={c.title[lang]} items={c.items.map(toItem)} />
            )
          )}
        </div>
      )}

      {aiErr && <p className="lib-error">{aiErr}</p>}
      {aiText && (
        <div className="ai-answer">
          <strong>✨ {t(lang, 'aiAnswer')}</strong>
          <p>{aiText}</p>
        </div>
      )}
    </section>
  )
}
