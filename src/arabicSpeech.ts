type NabraEngine = {
  generate: (text: string) => Promise<{ audio: Float32Array; sampleRate: number }>
}
type NabraModule = {
  NabraTTS: {
    load: (options: { dtype: 'fp16'; onProgress?: (progress: { loaded: number; total: number }) => void }) => Promise<NabraEngine>
  }
}

let enginePromise: Promise<NabraEngine> | undefined
let currentRun = 0
let activeSource: AudioBufferSourceNode | undefined
let activeContext: AudioContext | undefined
let cancelWait: (() => void) | undefined

function sentences(text: string, limit = 250) {
  const result: string[] = []
  for (const sentence of text.split(/(?<=[.!?؟؛])\s+/u)) {
    let line = ''
    for (const word of sentence.split(/\s+/u)) {
      if (!word) continue
      if (line && (line.length + word.length + 1) > limit) {
        result.push(line)
        line = ''
      }
      line += `${line ? ' ' : ''}${word}`
    }
    if (line) result.push(line)
  }
  return result
}

function getEngine(onProgress?: (percent: number) => void) {
  if (!enginePromise) {
    enginePromise = (async () => {
      const { NabraTTS } = await import('nabra-tts') as NabraModule
      return NabraTTS.load({
        dtype: 'fp16',
        onProgress: ({ loaded, total }) => { if (total > 0) onProgress?.(Math.min(100, Math.round(loaded / total * 100))) },
      })
    })().catch((error) => {
      enginePromise = undefined
      throw error
    })
  }
  return enginePromise
}

export function stopArabicSpeech() {
  currentRun++
  cancelWait?.()
  cancelWait = undefined
  try { activeSource?.stop() } catch { /* It may already have ended. */ }
  activeSource = undefined
  if (activeContext && activeContext.state !== 'closed') void activeContext.close()
  activeContext = undefined
}

export async function speakArabic(
  text: string,
  callbacks: {
    onLoading?: (percent?: number) => void
    onStart?: () => void
    onEnd?: () => void
    onError?: () => void
  } = {},
) {
  stopArabicSpeech()
  const run = currentRun
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) { callbacks.onError?.(); return }

  // Resume the audio context during the user's click, before model loading,
  // so browser autoplay policies do not block speech after the first download.
  const context = new AudioContextClass()
  activeContext = context
  void context.resume()
  callbacks.onLoading?.()

  try {
    const engine = await getEngine((percent) => {
      if (run === currentRun) callbacks.onLoading?.(percent)
    })
    if (run !== currentRun) return
    const chunks = sentences(text).filter(Boolean)
    for (const chunk of chunks) {
      const { audio, sampleRate } = await engine.generate(chunk)
      if (run !== currentRun) return
      const buffer = context.createBuffer(1, audio.length, sampleRate)
      buffer.copyToChannel(audio, 0)
      const source = context.createBufferSource()
      source.buffer = buffer
      source.connect(context.destination)
      activeSource = source
      callbacks.onStart?.()
      await new Promise<void>((resolve) => {
        let done = false
        const finish = () => { if (done) return; done = true; cancelWait = undefined; resolve() }
        cancelWait = finish
        source.onended = finish
        source.start()
      })
      if (run !== currentRun) return
    }
    callbacks.onEnd?.()
  } catch (error) {
    console.error('Arabic browser reader failed:', error)
    if (run === currentRun) callbacks.onError?.()
  } finally {
    if (run === currentRun) {
      activeSource = undefined
      if (activeContext === context) activeContext = undefined
      if (context.state !== 'closed') void context.close()
    }
  }
}
