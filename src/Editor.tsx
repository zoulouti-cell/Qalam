import { useRef, useState } from 'react'
import { LANGS, LANG_LABELS, t, type Lang } from './i18n'
import { articleHasLanguage, type Article } from './data'
import { isArticleRecord, loadCustomArticles, saveCustomArticles } from './storage'
import { translateText } from './ai'

interface Draft {
  title: string
  summary: string
  body: string
}

type DraftMap = Record<Lang, Draft>

const EMPTY_DRAFT: DraftMap = {
  ar: { title: '', summary: '', body: '' },
  fr: { title: '', summary: '', body: '' },
  en: { title: '', summary: '', body: '' },
}

export default function Editor({ lang, onChanged }: { lang: Lang; onChanged: () => void }) {
  const [draft, setDraft] = useState<DraftMap>(EMPTY_DRAFT)
  const [translating, setTranslating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const [importError, setImportError] = useState(false)
  const [custom, setCustom] = useState<Article[]>(() => loadCustomArticles())
  const fileRef = useRef<HTMLInputElement>(null)

  const setField = (l: Lang, f: keyof Draft, v: string) =>
    setDraft((d) => ({ ...d, [l]: { ...d[l], [f]: v } }))

  const sourceLang = (): Lang | null => {
    for (const l of LANGS) {
      if (draft[l].title.trim() || draft[l].body.trim()) return l
    }
    return null
  }

  const autoTranslate = async () => {
    const src = sourceLang()
    if (!src || translating) return
    setTranslating(true)
    const targets = LANGS.filter((l) => l !== src)
    const next: DraftMap = { ...draft }
    for (const to of targets) {
      const srcDraft = draft[src]
      const pieces: { field: keyof Draft; text: string }[] = [
        { field: 'title', text: srcDraft.title },
        { field: 'summary', text: srcDraft.summary },
        { field: 'body', text: srcDraft.body },
      ]
      for (const { field, text } of pieces) {
        if (!text.trim()) continue
        const out = await translateText(text, src, to)
        if (out) next[to][field] = out
      }
    }
    setDraft(next)
    setTranslating(false)
  }

  const save = () => {
    const src = sourceLang()
    if (!src) return
    const content = {} as Article['content']
    for (const l of LANGS) {
      const unavailable = l === 'ar' ? 'ترجمة غير متوفرة' : l === 'fr' ? 'Traduction indisponible' : 'Translation unavailable'
      content[l] = {
        title: draft[l].title.trim() || unavailable,
        summary: draft[l].summary.trim(),
        body: draft[l].body
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean),
      }
    }
    const article: Article = {
      id: 'custom-' + Date.now(),
      cat: { ar: 'مقالاتي', fr: 'Mes articles', en: 'My articles' },
      related: [],
      content,
      availableLanguages: LANGS.filter((l) => Boolean(draft[l].title.trim() && (draft[l].summary.trim() || draft[l].body.trim()))),
    }
    const next = [article, ...custom]
    setCustom(next)
    saveCustomArticles(next)
    onChanged()
    setDraft(EMPTY_DRAFT)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const remove = (id: string) => {
    const next = custom.filter((a) => a.id !== id)
    setCustom(next)
    saveCustomArticles(next)
    onChanged()
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(custom, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'encarta-articles.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = async (file: File) => {
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('file too large')
      const parsed: unknown = JSON.parse(await file.text())
      if (!Array.isArray(parsed)) throw new Error('not an article list')
      const list = parsed.filter(isArticleRecord)
      if (list.length === 0) throw new Error('no valid articles')
      const seen = new Set<string>()
      const merged = [...list, ...custom].filter((article) => {
        if (seen.has(article.id)) return false
        seen.add(article.id)
        return true
      })
      setCustom(merged)
      saveCustomArticles(merged)
      onChanged()
      setImportError(false)
      setImportDone(true)
      setTimeout(() => setImportDone(false), 2000)
    } catch {
      setImportDone(false)
      setImportError(true)
    }
  }

  return (
    <div className="page-wide editor">
      <h1 className="article-title">{t(lang, 'navEditor')}</h1>
      <p className="empty">{t(lang, 'editorIntro')}</p>

      <div className="editor-grid">
        {LANGS.map((l) => (
          <div key={l} className="editor-col" dir={l === 'ar' ? 'rtl' : 'ltr'}>
            <h3 className="editor-lang">{LANG_LABELS[l]}</h3>
            <label className="field">
              <span>{t(lang, 'fieldTitle')}</span>
              <input value={draft[l].title} onChange={(e) => setField(l, 'title', e.target.value)} />
            </label>
            <label className="field">
              <span>{t(lang, 'fieldSummary')}</span>
              <input value={draft[l].summary} onChange={(e) => setField(l, 'summary', e.target.value)} />
            </label>
            <label className="field">
              <span>{t(lang, 'fieldBody')}</span>
              <textarea
                rows={7}
                value={draft[l].body}
                onChange={(e) => setField(l, 'body', e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="editor-actions">
        <button className="primary-btn" onClick={() => void autoTranslate()} disabled={!sourceLang() || translating}>
          {translating ? t(lang, 'translating') : t(lang, 'translateAuto')}
        </button>
        <button className="primary-btn" onClick={save} disabled={!sourceLang()}>
          {t(lang, 'saveArticle')}
        </button>
        <button className="ghost-btn" onClick={exportJson}>
          {t(lang, 'exportJson')}
        </button>
        <button className="ghost-btn" onClick={() => fileRef.current?.click()}>
          {t(lang, 'importJson')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void importJson(f)
            e.target.value = ''
          }}
        />
        {saved && <span className="saved-note">{t(lang, 'articleSaved')}</span>}
        {importDone && <span className="saved-note">{t(lang, 'importDone')}</span>}
        {importError && <span className="lib-error" role="alert">{lang === 'ar' ? 'تعذر الاستيراد: الملف ليس قائمة مقالات صالحة أو يتجاوز 5 ميغابايت.' : lang === 'fr' ? 'Import impossible : fichier invalide ou supérieur à 5 Mo.' : 'Import failed: invalid article file or larger than 5 MB.'}</span>}
      </div>

      <h2 className="section-title">{t(lang, 'myArticles')}</h2>
      {custom.length === 0 ? (
        <p className="empty">{t(lang, 'noCustom')}</p>
      ) : (
        <div className="my-articles">
          {custom.map((a) => (
            <div key={a.id} className="my-article">
              <span className="my-article-title">{articleHasLanguage(a,lang)?a.content[lang].title:(lang==='ar'?'غير متاح بهذه اللغة':lang==='fr'?'Indisponible dans cette langue':'Unavailable in this language')}</span>
              <button className="ghost-btn small" onClick={() => remove(a.id)}>
                ✕ {t(lang, 'deleteArticle')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
