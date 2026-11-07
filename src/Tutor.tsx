import Mi from './Mi'
import { useRef, useState } from 'react'
import { t, type Lang } from './i18n'
import { askTutor } from './ai'
import { loadTutorSettings, saveTutorSettings, type TutorSettings } from './storage'

interface Msg {
  role: 'user' | 'assistant'
  text: string
}

export default function Tutor({ lang }: { lang: Lang }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<TutorSettings>(() => loadTutorSettings())
  const [saved, setSaved] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const send = async () => {
    const q = input.trim()
    if (!q || busy) return
    setInput('')
    setErr('')
    setBusy(true)
    const next: Msg[] = [...messages, { role: 'user', text: q }]
    setMessages(next)
    requestAnimationFrame(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight))
    const answer = await askTutor(q, lang, setErr)
    setMessages([...next, { role: 'assistant', text: answer }])
    setBusy(false)
    requestAnimationFrame(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight))
  }

  const saveSettings = () => {
    saveTutorSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-wide tutor">
      <div className="tutor-top">
        <h1 className="article-title">{t(lang, 'navTutor')}</h1>
        <div className="tutor-top-btns">
          <button className="ghost-btn" onClick={() => (window.location.hash = '#/listen')}>
            <Mi name="hearing" /> {t(lang, 'listenGame')}
          </button>
          <button className="ghost-btn" onClick={() => setShowSettings((s) => !s)}>
            <Mi name="settings" /> {t(lang, 'settings')}
          </button>
        </div>
      </div>
      <p className="empty">{t(lang, 'tutorIntro')}</p>

      {showSettings && (
        <div className="tutor-settings">
          <label className="field">
            <span>{t(lang, 'engineLabel')}</span>
            <select
              value={settings.engine}
              onChange={(e) => setSettings({ ...settings, engine: e.target.value as TutorSettings['engine'] })}
            >
              <option value="offline">{t(lang, 'engineOffline')}</option>
              <option value="ollama">{t(lang, 'engineOllama')}</option>
              <option value="api">{t(lang, 'engineApi')}</option>
            </select>
          </label>
          {settings.engine !== 'offline' && (
            <>
              <label className="field">
                <span>{t(lang, 'baseUrl')}</span>
                <input
                  value={settings.baseUrl}
                  onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                  placeholder={settings.engine === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com/v1'}
                />
              </label>
              <label className="field">
                <span>{t(lang, 'modelLabel')}</span>
                <input
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  placeholder="gpt-4o-mini / deepseek-chat / llama3.2"
                />
              </label>
              {settings.engine === 'api' && (
                <label className="field">
                  <span>{t(lang, 'apiKey')}</span>
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  />
                </label>
              )}
            </>
          )}
          <button className="primary-btn" onClick={saveSettings}>
            {t(lang, 'save')}
          </button>
          {saved && <span className="saved-note">{t(lang, 'settingsSaved')}</span>}
        </div>
      )}

      <div className="chat" ref={listRef}>
        {messages.length === 0 && <p className="chat-hint">{t(lang, 'tutorIntro')}</p>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'bubble user' : 'bubble assistant'}>
            {m.text}
          </div>
        ))}
        {busy && <div className="bubble assistant thinking">{t(lang, 'thinking')}</div>}
        {err && <p className="lib-error">{err}</p>}
      </div>

      <div className="chat-input-row">
        <input
          className="search-input"
          value={input}
          placeholder={t(lang, 'typeQuestion')}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void send()
          }}
        />
        <button className="primary-btn" onClick={() => void send()} disabled={busy || !input.trim()}>
          {t(lang, 'send')}
        </button>
      </div>
    </div>
  )
}
