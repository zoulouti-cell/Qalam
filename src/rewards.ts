import type { Lang } from './i18n'
import { PATHS, PATH_BADGES } from './content'
import {
  loadInk,
  saveInk,
  loadBadges,
  saveBadges,
  loadUsedLangs,
  saveUsedLangs,
} from './storage'

export function emitRewards() {
  window.dispatchEvent(new CustomEvent('encarta-rewards'))
}

export function addInk(n: number) {
  saveInk(loadInk() + n)
  emitRewards()
}

export function awardBadge(id: string) {
  const list = loadBadges()
  if (!list.includes(id)) {
    saveBadges([...list, id])
    emitRewards()
  }
}

export function useLang(l: Lang) {
  const list = loadUsedLangs()
  if (!list.includes(l)) {
    const next = [...list, l]
    saveUsedLangs(next)
    if (next.length >= 3) awardBadge('polyglot')
    emitRewards()
  }
}

/** Called after the done list changes. */
export function checkArticleBadges(done: string[]) {
  if (done.length >= 1) awardBadge('firstStep')
  if (done.length >= 3) awardBadge('reader')
  for (const p of PATHS) {
    if (p.topics.every((t) => done.includes(t))) {
      const badge = PATH_BADGES[p.id]
      if (badge) awardBadge(badge)
    }
  }
}
