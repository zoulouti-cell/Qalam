import Mi from './Mi'
import { useMemo, useState } from 'react'
import type { Lang } from './i18n'
import type { Article } from './data'
import { contentOf } from './content'

type Props = {
  article: Article
  lang: Lang
  onDone: (id: string) => void
  done: boolean
}

const T = {
  ar: {
    plan: 'خطة الدرس',
    competency: 'الكفاية المستهدفة',
    competencyText: (t: string) => `أن يشرح المتعلم مفهوم «${t}» بلغته ويستدل عليه بأمثلة.`,
    objectives: 'أهداف التعلم',
    phase1: 'مرحلة الاستكشاف',
    phase2: 'مرحلة الفهم',
    phase3: 'مرحلة التطبيق',
    phase4: 'مرحلة التوسّع',
    explore: (t: string) => `انظر إلى عنوان «${t}»: ماذا تتوقع أن يشرح لك؟ مدّعماً بمعرفتك السابقة.`,
    understand: 'اقرأ الملخص وأجب: ما الفكرة الأساسية؟ وما دليلها؟',
    apply: (t: string) => `اشرح «${t}» لزميلك في ثلاثة أسطر، ثم دوّن سؤالاً يتحدى فهمه.`,
    extend: 'اربط الموضوع بمادة أخرى: ما العلاقة مع ما درسته في التاريخ/الجغرافيا/العلوم؟',
    assess: 'التقويم الذاتي',
    a1: 'أستطيع شرح الفكرة الأساسية بلغتي.',
    a2: 'أستطيع تقديم مثال أو دليل على الفكرة.',
    a3: 'أستطيع ربطها بمادة دراسية أخرى.',
    complete: 'أتممت الدرس — أحسنت!',
    markDone: '+5 حبر',
    score: 'نتيجتك',
    points: 'نقاط',
  },
  fr: {
    plan: 'Plan de leçon',
    competency: 'Compétence cible',
    competencyText: (t: string) => `Expliquer le concept de « ${t} » avec ses propres mots et l’illustrer par des exemples.`,
    objectives: 'Objectifs d’apprentissage',
    phase1: 'Explore',
    phase2: 'Comprendre',
    phase3: 'Appliquer',
    phase4: 'Élargir',
    explore: (t: string) => `À partir du titre « ${t} », formule une hypothèse sur ce que l’article va expliquer.`,
    understand: 'Lis le résumé : quelle est l’idée clé ? Quelle preuve l’appuie ?',
    apply: (t: string) => `Explique « ${t} » à un camarade en trois phrases, puis écris une question qui le fera réfléchir.`,
    extend: 'Relie le sujet à une autre matière : quelle est le lien avec l’histoire, la géographie ou les sciences ?',
    assess: 'Auto-évaluation',
    a1: 'Je peux expliquer l’idée principale dans mes propres mots.',
    a2: 'Je peux donner un exemple ou une preuve.',
    a3: 'Je peux le relier à une autre matière.',
    complete: 'Leçon terminée — bravo !',
    markDone: '+5 encre',
    score: 'Ton résultat',
    points: 'points',
  },
  en: {
    plan: 'Lesson plan',
    competency: 'Target competency',
    competencyText: (t: string) => `Explain the concept of “${t}” in your own words and support it with examples.`,
    objectives: 'Learning objectives',
    phase1: 'Explore',
    phase2: 'Understand',
    phase3: 'Apply',
    phase4: 'Extend',
    explore: (t: string) => `From the title “${t}”, predict what the article will explain.`,
    understand: 'Read the summary: what is the key idea, and what evidence supports it?',
    apply: (t: string) => `Explain “${t}” to a classmate in three sentences, then write a question that challenges their understanding.`,
    extend: 'Connect it to another subject: how does it relate to history, geography or science?',
    assess: 'Self-assessment',
    a1: 'I can explain the main idea in my own words.',
    a2: 'I can provide an example or piece of evidence.',
    a3: 'I can connect it to another school subject.',
    complete: 'Lesson complete — well done!',
    markDone: '+5 ink',
    score: 'Your score',
    points: 'pts',
  },
} as const

export default function LessonPlan({ article, lang, onDone, done }: Props) {
  const t = T[lang]
  const title = contentOf(article, lang).title
  const summary = contentOf(article, lang).summary
  const [checks, setChecks] = useState<boolean[]>([false, false, false])
  const [open, setOpen] = useState(true)

  const objectives = useMemo(() => {
    const sentences = (summary + '. ' + (contentOf(article, lang).body[0] || ''))
      .split(/(?<=[.!?…؟])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25)
    const out = [sentences[0] || summary]
    if (sentences[1]) out.push(sentences[1])
    out.push(t.a3)
    return out.slice(0, 3)
  }, [article, lang, summary, t])

  const doneCount = checks.filter(Boolean).length
  const pct = Math.round((doneCount / checks.length) * 100)

  const toggle = (i: number) => {
    const next = checks.map((v, k) => (k === i ? !v : v))
    setChecks(next)
    if (next.every(Boolean) && !done) onDone(article.id)
  }

  return (
    <section className="lesson-plan">
      <button className="lesson-head" onClick={() => setOpen((v) => !v)}>
        <Mi name="school" />
        <strong>{t.plan}</strong>
        <span className="lesson-score">{doneCount}/3</span>
        <Mi name={open ? 'expand_less' : 'expand_more'} className="lesson-caret" />
      </button>

      {open && (
        <div className="lesson-body">
          <div className="lesson-comp">
            <span className="lesson-label">{t.competency}</span>
            <p>{t.competencyText(title)}</p>
          </div>

          <div className="lesson-block">
            <span className="lesson-label">
              <Mi name="flag" /> {t.objectives}
            </span>
            <ul className="lesson-objectives">
              {objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>

          <div className="lesson-phases">
            <div className="lesson-phase" data-phase="1">
              <span className="phase-num">1</span>
              <div>
                <strong>{t.phase1}</strong>
                <p>{t.explore(title)}</p>
              </div>
            </div>
            <div className="lesson-phase" data-phase="2">
              <span className="phase-num">2</span>
              <div>
                <strong>{t.phase2}</strong>
                <p>{t.understand}</p>
              </div>
            </div>
            <div className="lesson-phase" data-phase="3">
              <span className="phase-num">3</span>
              <div>
                <strong>{t.phase3}</strong>
                <p>{t.apply(title)}</p>
              </div>
            </div>
            <div className="lesson-phase" data-phase="4">
              <span className="phase-num">4</span>
              <div>
                <strong>{t.phase4}</strong>
                <p>{t.extend}</p>
              </div>
            </div>
          </div>

          <div className="lesson-assess">
            <span className="lesson-label">
              <Mi name="fact_check" /> {t.assess}
            </span>
            {[t.a1, t.a2, t.a3].map((q, i) => (
              <label key={i} className={checks[i] ? 'assess-row checked' : 'assess-row'}>
                <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} />
                <span>{q}</span>
              </label>
            ))}
            <div className="lesson-progress">
              <div className="lesson-bar">
                <span style={{ width: `${pct}%` }} />
              </div>
              <span className="lesson-pct">
                {pct}% {doneCount === 3 ? '✓' : ''}
              </span>
            </div>
            {doneCount === 3 && (
              <p className="lesson-cheer">
                <Mi name="emoji_events" /> {t.complete}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
