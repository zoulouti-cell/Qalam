/** Scroll the selected learning content into view without abrupt jumps. */
export function scrollToDetail(target: HTMLElement | null | (() => HTMLElement | null)) {
  if (!target) return
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  window.requestAnimationFrame(() => {
    const element = typeof target === 'function' ? target() : target
    element?.scrollIntoView({ behavior, block: 'start' })
  })
}
