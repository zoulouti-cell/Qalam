/* Synthesized sound effects (Web Audio) — zero assets, offline, and text-to-speech. */
import { speakArabic, stopArabicSpeech } from './arabicSpeech'

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

export type TopicSoundKind = 'heart' | 'water' | 'nature' | 'math' | 'discovery'
/** Short illustrative sounds, started only by a learner's explicit action. */
export function playTopicSound(kind:TopicSoundKind):()=>void {
  if(muted)return()=>{}
  const context=ac();if(!context)return()=>{}
  const nodes:OscillatorNode[]=[]
  const play=(freq:number,delay:number,duration:number,end=freq)=>{
    const oscillator=context.createOscillator(),gain=context.createGain(),at=context.currentTime+delay
    oscillator.type=kind==='heart'?'sine':'triangle'
    oscillator.frequency.setValueAtTime(freq,at);oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,end),at+duration)
    gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(kind==='heart'?.065:.035,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+duration)
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start(at);oscillator.stop(at+duration+.02);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};nodes.push(oscillator)
  }
  if(kind==='heart')for(let i=0;i<3;i++){play(100,i*.8,.12,60);play(85,i*.8+.18,.1,50)}
  else if(kind==='water')for(let i=0;i<7;i++)play(700+i*45,i*.24,.12,180)
  else if(kind==='nature')for(let i=0;i<4;i++){play(1050,i*.55,.12,1500);play(1400,i*.55+.15,.13,1100)}
  else if(kind==='math')[262,330,392,523].forEach((freq,i)=>play(freq,i*.3,.22))
  else [330,440,554,660].forEach((freq,i)=>play(freq,i*.3,.25))
  return()=>{for(const oscillator of nodes){try{oscillator.stop()}catch{/* Already ended. */}}}
}

let speechCleanup: (() => void) | undefined
export function speak(
  text: string,
  lang: 'ar' | 'fr' | 'en',
  onEnd?: () => void,
  onError?: () => void,
  onStart?: () => void,
  onLoading?: (percent?: number) => void,
) {
  stopSpeak()
  if (lang === 'ar') {
    void speakArabic(text, { onEnd, onError, onStart, onLoading })
    return
  }
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
    const locale = lang === 'fr' ? 'fr-FR' : 'en-GB'
    const voice = voices.find(v => v.lang.toLowerCase() === locale.toLowerCase())
      || voices.find(v => v.lang.toLowerCase().split(/[-_]/)[0] === lang)
    // Never silently hand Arabic text to a French or English default voice.
    if (!voice) { onError?.(); return }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = locale
    utterance.rate = 0.88
    utterance.volume = 1
    if (voice) utterance.voice = voice
    let began = false
    const watchdog = window.setTimeout(() => { if (!began) { synth.cancel(); onError?.() } }, 5000)
    utterance.onstart = () => { began = true; window.clearTimeout(watchdog); onStart?.() }
    utterance.onend = () => { window.clearTimeout(watchdog); onEnd?.() }
    utterance.onerror = () => { window.clearTimeout(watchdog); onError?.() }
    speechCleanup = () => { window.clearTimeout(watchdog); utterance.onstart = null; utterance.onend = null; utterance.onerror = null }
    synth.speak(utterance)
    window.setTimeout(() => { if (synth.paused) synth.resume() }, 180)
  }
  if (synth.getVoices().length) start()
  else {
    synth.addEventListener('voiceschanged', start, { once: true })
    timer = window.setTimeout(start, 1200)
    speechCleanup = () => { window.clearTimeout(timer); synth.removeEventListener('voiceschanged', start) }
  }
}

export function stopSpeak() {
  speechCleanup?.()
  speechCleanup = undefined
  stopArabicSpeech()
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
