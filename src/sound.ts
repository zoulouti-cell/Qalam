/* Synthesized sound effects (Web Audio) — zero assets, offline, and text-to-speech. */

let ctx: AudioContext | null = null
let muted = (() => {
  try {
    return localStorage.getItem('encarta.muted') === '1'
  } catch {
    return false
  }
})()

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.1, delay = 0) {
  if (muted) return
  const c = ac()
  if (!c) return
  const t = c.currentTime + delay
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export const sound = {
  pop: () => tone(520, 0.09, 'sine', 0.09),
  click: () => tone(340, 0.06, 'triangle', 0.07),
  whoosh: () => tone(880, 0.28, 'sine', 0.045),
  success: () => {
    tone(523, 0.12, 'sine', 0.11)
    tone(659, 0.12, 'sine', 0.11, 0.1)
    tone(784, 0.22, 'sine', 0.11, 0.2)
  },
  fail: () => {
    tone(220, 0.16, 'sawtooth', 0.05)
    tone(155, 0.24, 'sawtooth', 0.05, 0.13)
  },
  toggleMute(): boolean {
    muted = !muted
    try {
      localStorage.setItem('encarta.muted', muted ? '1' : '0')
    } catch {
      /* ignore */
    }
    return muted
  },
  isMuted: () => muted,
}

export function speak(
  text: string,
  lang: 'ar' | 'fr' | 'en',
  onEnd?: () => void,
  onError?: () => void,
  onStart?: () => void,
) {
  if (!('speechSynthesis' in window)) { onError?.(); return }
  const synth = window.speechSynthesis
  synth.cancel()
  synth.resume()
  let started = false
  let timer = 0
  const start = () => {
    if (started) return
    started = true
    window.clearTimeout(timer)
    const voices = synth.getVoices()
    const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-GB'
    const voice = voices.find(v => v.lang.toLowerCase() === locale.toLowerCase())
      || voices.find(v => v.lang.toLowerCase().startsWith(`${lang}-`))
      || voices.find(v => v.default)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = locale
    utterance.rate = 0.88
    utterance.volume = 1
    if (voice) utterance.voice = voice
    utterance.onstart = () => onStart?.()
    utterance.onend = () => onEnd?.()
    utterance.onerror = () => onError?.()
    synth.speak(utterance)
    window.setTimeout(() => { if (synth.paused) synth.resume() }, 180)
  }
  if (synth.getVoices().length) start()
  else {
    synth.addEventListener('voiceschanged', start, { once: true })
    timer = window.setTimeout(start, 450)
  }
}

export function stopSpeak() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
