/** Scroll the selected learning content into view without abrupt jumps. */
export function scrollToDetail(target: HTMLElement | null | (() => HTMLElement | null)) {
  if (!target) return
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  let attempts = 0
  const scroll = () => {
    const element = typeof target === 'function' ? target() : target
    if (!element?.isConnected) return
    // Let React commit the selected panel and its layout before measuring it.
    // scrollIntoView also handles nested scroll containers, unlike window.scrollTo.
    if (element.getClientRects().length) {
      element.scrollIntoView({ behavior, block: 'start', inline: 'nearest' })
      return
    }
    attempts += 1
    if (attempts < 5) window.requestAnimationFrame(scroll)
  }
  window.requestAnimationFrame(() => window.requestAnimationFrame(scroll))
}
