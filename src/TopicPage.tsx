import ArticleVisual, { ArticleImageCredits, topicImageArticle } from './ArticleVisual'
import { useMemo, useState } from 'react'
import Mi from './Mi'
import type { Lang } from './i18n'
import type { Level } from './content'
import type { Article } from './data'
import { contentOf } from './content'
import { topicById, TOPICS, type Topic } from './knowledgeGraph'
import { ScientificFigure } from './scientificFigure'
import { SCI_META, datumValue } from './scientificData'
import TopicViewer3D, { MODEL_FOR_TOPIC } from './TopicViewer3D'
import AnimatedChart from './AnimatedChart'
import { KID_TOPICS } from './topicKids'
import './topic.css'

const UI = {
  ar: { crumb: 'الرئيسية', branch: 'الفرع', topic: 'الموضوع', idea: 'الفكرة الكبرى', path: 'مسار التعلم', view2d: 'صورة تفاعلية', view3d: 'مجسم ثلاثي الأبعاد', chart: 'بيانات متحركة', related: 'مواضيع مرتبطة', articles: 'مقالات هذا الموضوع', open: 'افتح القسم', notFound: 'الموضوع غير موجود' },
  fr: { crumb: 'Accueil', branch: 'Branche', topic: 'Thème', idea: 'Idée majeure', path: 'Parcours', view2d: 'Image interactive', view3d: 'Modèle 3D', chart: 'Données animées', related: 'Thèmes liés', articles: 'Articles du thème', open: 'Ouvrir la rubrique', notFound: 'Thème introuvable' },
  en: { crumb: 'Home', branch: 'Branch', topic: 'Topic', idea: 'Big idea', path: 'Learning path', view2d: 'Interactive figure', view3d: '3D model', chart: 'Animated data', related: 'Related topics', articles: 'Articles in this topic', open: 'Open section', notFound: 'Topic not found' },
} as const

const BRANCH: Record<string, Record<Lang, string>> = {
  space: { ar: 'الفضاء', fr: 'Espace', en: 'Space' },
  earth: { ar: 'الأرض', fr: 'Terre', en: 'Earth' },
  life: { ar: 'الحياة', fr: 'Vie', en: 'Life' },
  chemistry: { ar: 'الكيمياء', fr: 'Chimie', en: 'Chemistry' },
  physics: { ar: 'الفيزياء', fr: 'Physique', en: 'Physics' },
  tech: { ar: 'التقنية', fr: 'Technologie', en: 'Technology' },
}

export default function TopicPage({ id, lang, level, all }: { id: string; lang: Lang; level: Level; all: Article[] }) {
  const topic = topicById(id)
  const ui = UI[lang]
  const [view, setView] = useState<'2d' | '3d'>('3d')
  const academic = level !== 'kids'

  const articles = useMemo(() => {
    if (!topic) return []
    const re = new RegExp(topic.keywords, 'i')
    return all.filter((a) => a.content[lang] && re.test(contentOf(a, lang).title + ' ' + a.cat[lang])).slice(0, 6)
  }, [topic, all, lang])

  if (!topic) {
    return (
      <div className="page">
        <p className="empty">{ui.notFound}</p>
        <a className="ghost-btn" href="#/">
          {ui.crumb}
        </a>
      </div>
    )
  }

  const related = topic.related.map((r) => topicById(r)).filter((x): x is Topic => Boolean(x))
  const model = academic ? undefined : MODEL_FOR_TOPIC[topic.id]
  const meta = SCI_META[topic.figure]

  return (
    <div className="topic-page">
      <nav className="topic-crumb" aria-label={lang === 'ar' ? 'مسار التنقل' : lang === 'fr' ? 'fil d’Ariane' : 'breadcrumb'}>
        <a href="#/">{ui.crumb}</a>
        <span>/</span>
        <a href={topic.sectionRoute}>{ui.branch}: {BRANCH[topic.branch][lang]}</a>
        <span>/</span>
        <strong>{ui.topic}: {topic.title[lang]}</strong>
      </nav>

      <header className="topic-hero">
        <ArticleVisual article={topicImageArticle(topic)} lang={lang} level={level} className="topic-subject-photo"/>
        <div>
          <h1>{topic.title[lang]}</h1>
          <p className="topic-idea">
            <b>{ui.idea}:</b> {topic.idea[lang]}
          </p>
        </div>
        <a className="topic-open" href={topic.sectionRoute}>
          {ui.open} ↗
        </a>
      </header>

      {level === 'kids' && KID_TOPICS[topic.id] && (
        <section className="kid-panel" aria-labelledby="kid-panel-title">
          <div className="kid-hook">
            <Mi name="lightbulb" />
            <p id="kid-panel-title">{KID_TOPICS[topic.id].hook[lang]}</p>
          </div>
          <div className="kid-grid">
            <div className="kid-card">
              <span className="kid-kicker">{lang === 'ar' ? 'أفهم' : lang === 'fr' ? 'Je comprends' : 'I understand'}</span>
              <p>{KID_TOPICS[topic.id].idea[lang]}</p>
            </div>
            <div className="kid-card kid-activity">
              <span className="kid-kicker">
                <Mi name="science" />
                {lang === 'ar' ? 'أجرّب' : lang === 'fr' ? 'J’expérimente' : 'I try'}
              </span>
              <p>{KID_TOPICS[topic.id].activity[lang]}</p>
            </div>
            <div className="kid-card kid-check">
              <span className="kid-kicker">
                <Mi name="help" />
                {lang === 'ar' ? 'أتحقّق' : lang === 'fr' ? 'Je vérifie' : 'I check'}
              </span>
              <p>{KID_TOPICS[topic.id].check[lang]}</p>
              <details>
                <summary>{lang === 'ar' ? 'أظهر الجواب' : lang === 'fr' ? 'Voir la réponse' : 'Show the answer'}</summary>
                <p>{KID_TOPICS[topic.id].answer[lang]}</p>
              </details>
            </div>
          </div>
        </section>
      )}

      <div className="topic-main">
        <section className="topic-visual">
          <div className="topic-switch" role="group" aria-label={ui.topic}>
            {model && <button className={view === '3d' ? 'active' : ''} aria-pressed={view === '3d'} onClick={() => setView('3d')}>
              <Mi name="view_in_ar" /> {ui.view3d}
            </button>}
            <button className={view === '2d' || !model ? 'active' : ''} aria-pressed={view === '2d' || !model} onClick={() => setView('2d')}>
              <Mi name="image" /> {ui.view2d}
            </button>
          </div>
          {view === '3d' && model ? (
            <TopicViewer3D kind={model} lang={lang} />
          ) : (
            <div className={'topic-figure' + (academic ? ' is-academic' : '')}>
              <ScientificFigure subject={topic.figure} mode={academic ? 'academic' : 'kids'} />
              <div className="topic-figure-cap">
                <span>{meta.scale[lang]}</span>
                {academic && (
                  <ol>
                    {meta.annotations.map((a, i) => (
                      <li key={i}>{a.label[lang]}</li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="topic-side">
          <h2>
            <Mi name="route" /> {ui.path}
          </h2>
          <ol className="topic-path">
            {topic.path.map((p, i) => (
              <li key={i}>
                <span className="topic-step">{i + 1}</span>
                <p>{p[lang]}</p>
              </li>
            ))}
          </ol>
          {academic && (
            <dl className="topic-data">
              {meta.data.map((d) => (
                <div key={datumValue(d.v, lang)}>
                  <dt>{d.k[lang]}</dt>
                  <dd>{datumValue(d.v, lang)}</dd>
                </div>
              ))}
            </dl>
          )}
        </aside>
      </div>

      {!['ai', 'galaxies'].includes(topic.id) && <section className="topic-chart">
        <h2>
          <Mi name="insights" /> {ui.chart}
        </h2>
        <AnimatedChart topic={topic} lang={lang} />
      </section>}

      {related.length > 0 && (
        <section className="topic-related">
          <h2>{ui.related}</h2>
          <div className="topic-chips">
            {related.map((r) => (
              <a key={r.id} className="topic-chip" href={`#/topic/${r.id}`}>
                <Mi name={r.icon} />
                {r.title[lang]}
              </a>
            ))}
            {TOPICS.filter((x) => x.id !== topic.id && !topic.related.includes(x.id))
              .slice(0, 3)
              .map((r) => (
                <a key={r.id} className="topic-chip ghost" href={`#/topic/${r.id}`}>
                  {r.title[lang]}
                </a>
              ))}
          </div>
        </section>
      )}

      <ArticleImageCredits article={topicImageArticle(topic)} lang={lang} level={level}/>
      {articles.length > 0 && (
        <section className="topic-articles">
          <h2>{ui.articles}</h2>
          <ul>
            {articles.map((a) => (
              <li key={a.id}>
                <a href={`#/article/${a.id}`}>{contentOf(a, lang).title}</a>
                <small>{a.cat[lang]}</small>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
