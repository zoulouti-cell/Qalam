import Mi from './Mi'
import { useState } from 'react'
import { LANGS, t, type Lang } from './i18n'
import type { Article } from './data'
import { loadCustomArticles, saveCustomArticles, loadLevel } from './storage'
import { generateArticle, translateText } from './ai'
import { sound } from './sound'
import { addInk, awardBadge } from './rewards'

export default function Generator({ lang, onSaved }: { lang: Lang; onSaved: () => void }) {
  const [topic, setTopic] = useState('')
  const [busy, setBusy] = useState(false)
  const [gen, setGen] = useState<Article | null>(null)
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState(false)

  const run = async () => {
    const q = topic.trim()
    if (!q || busy) return
    sound.whoosh()
    setBusy(true)
    setErr('')
    setGen(null)
    setSaved(false)
    const level = loadLevel() ?? 'school'
    const base = await generateArticle(q, lang, level, setErr)
    if (!base) {
      setBusy(false)
      sound.fail()
      return
    }
    const content = { ar: base, fr: base, en: base } as Article['content']
    for (const l of LANGS) {
      if (l === lang) continue
      const title = await translateText(base.title, lang, l)
      const summary = await translateText(base.summary, lang, l)
      const body = await translateText(base.body.join('\n\n'), lang, l)
      content[l] = {
        title: title ?? base.title,
        summary: summary ?? base.summary,
        body: body ? body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) : base.body,
      }
    }
    setGen({
      id: 'gen-' + Date.now(),
      cat: { ar: 'مولّد', fr: 'Généré', en: 'Generated' },
      related: [],
      content,
    })
    setBusy(false)
    sound.success()
  }

  const save = () => {
    if (!gen) return
    const next = [gen, ...loadCustomArticles()]
    saveCustomArticles(next)
    onSaved()
    setSaved(true)
    addInk(15)
    awardBadge('writer')
    sound.success()
  }

  return (
    <div className="page-wide generator">
      <h1 className="article-title">🪄 {t(lang, 'generator')}</h1>
      <p className="empty">{t(lang, 'generatorIntro')}</p>
      <div className="gen-form">
        <input
          className="search-input"
          value={topic}
          placeholder={t(lang, 'genPlaceholder')}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void run()
          }}
        />
        <button className="primary-btn" disabled={busy || !topic.trim()} onClick={() => void run()}>
          {busy ? t(lang, 'generating') : <><Mi name="auto_awesome" /> {t(lang, 'genButton')}</>}
        </button>
      </div>

      {err && <p className="lib-error">{t(lang, 'genError')}</p>}

      {gen && (
        <article className="article gen-result">
          <span className="card-cat">{gen.cat[lang]}</span>
          <h2 className="article-title">{gen.content[lang].title}</h2>
          <p className="article-lead">{gen.content[lang].summary}</p>
          {gen.content[lang].body.map((p, i) => (
            <p key={i} className="article-para">
              {p}
            </p>
          ))}
          <div className="article-actions">
            <button className="primary-btn" onClick={save} disabled={saved}>
              {saved ? t(lang, 'generatedSaved') : `💾 ${t(lang, 'saveGenerated')}`}
            </button>
          </div>
        </article>
      )}
    </div>
  )
}
