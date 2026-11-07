import Mi from './Mi'
import { useRef, useState } from 'react'
import type { Lang } from './i18n'

type Props = {
  lang: Lang
  onResult: (text: string) => void
}

const LANG_CODE: Record<Lang, string> = { ar: 'ar-MA', fr: 'fr-FR', en: 'en-US' }
const HINT: Record<Lang, string> = {
  ar: 'اسأل قلم بصوتك',
  fr: 'Demandez à Qalam à voix haute',
  en: 'Ask Qalam with your voice',
}
const LISTENING: Record<Lang, string> = {
  ar: 'أسمعك… تكلّم',
  fr: "J'écoute…",
  en: 'Listening…',
}
const UNSUPPORTED: Record<Lang, string> = {
  ar: 'البحث الصوتي غير مدعوم في هذا المتصفح',
  fr: 'Recherche vocale non prise en charge',
  en: 'Voice search not supported here',
}

export default function VoiceSearch({ lang, onResult }: Props) {
  const [listening, setListening] = useState(false)
  const [msg, setMsg] = useState('')
  const recRef = useRef<any>(null)

  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setMsg(UNSUPPORTED[lang])
      setTimeout(() => setMsg(''), 2200)
      return
    }
    try {
      const rec = new SR()
      recRef.current = rec
      rec.lang = LANG_CODE[lang]
      rec.interimResults = false
      rec.maxAlternatives = 1
      rec.onstart = () => setListening(true)
      rec.onend = () => setListening(false)
      rec.onerror = () => {
        setListening(false)
        setMsg(UNSUPPORTED[lang])
        setTimeout(() => setMsg(''), 2200)
      }
      rec.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript
        if (text) onResult(text)
      }
      rec.start()
    } catch {
      setMsg(UNSUPPORTED[lang])
      setTimeout(() => setMsg(''), 2200)
    }
  }

  return (
    <button
      type="button"
      className={listening ? 'voice-btn listening' : 'voice-btn'}
      onClick={listening ? () => recRef.current?.stop() : start}
      title={msg || (listening ? LISTENING[lang] : HINT[lang])}
      aria-label={HINT[lang]}
    >
      <Mi name={listening ? 'graphic_eq' : 'mic'} />
      {listening && <span className="voice-pulse" />}
    </button>
  )
}
