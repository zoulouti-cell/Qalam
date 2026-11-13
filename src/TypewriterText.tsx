import { useEffect, useMemo, useState } from 'react'

/** Short entry headings are revealed character by character; full text stays accessible. */
export default function TypewriterText({
  text,
  className,
  delay = 0,
  speed = 32,
}: {
  text: string
  className?: string
  delay?: number
  speed?: number
}) {
  const chars = useMemo(() => Array.from(text), [text])
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !text) {
      setCount(chars.length)
      return
    }
    let timer: number | undefined
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => {
        setCount((current) => {
          if (current >= chars.length) {
            if (timer !== undefined) window.clearInterval(timer)
            return current
          }
          return current + 1
        })
      }, speed)
    }, delay)
    return () => {
      window.clearTimeout(start)
      if (timer !== undefined) window.clearInterval(timer)
    }
  }, [chars, delay, speed, text])

  const typing = chars.length > 0 && count < chars.length

  return (
    <span className={[className, typing ? 'is-typing' : ''].filter(Boolean).join(' ')} aria-label={text}>
      <span aria-hidden="true">{chars.slice(0, count).join('')}</span>
      <span className="sr-only">{text}</span>
    </span>
  )
}
