function makeWikiSource(page, importedAt) {
  if (!page?.url || !page?.title) return null
  const url = page.revisionId
    ? `${page.url}${page.url.includes('?') ? '&' : '?'}oldid=${page.revisionId}`
    : page.url
  return {
    name: 'Wikipedia',
    title: page.title,
    url,
    attribution: 'Wikipedia contributors',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    revisionId: page.revisionId,
    revisionTimestamp: page.revisionTimestamp,
    importedAt,
    modified: true,
  }
}

function mergeArticle(previous, incoming) {
  return {
    ...previous,
    ...incoming,
    content: { ...(previous.content ?? {}), ...(incoming.content ?? {}) },
    sources: { ...(previous.sources ?? {}), ...(incoming.sources ?? {}) },
    related: incoming.related?.length ? incoming.related : (previous.related ?? []),
  }
}

function mergeArticles(existing, updates) {
  const byId = new Map(updates.map((article) => [article.id, article]))
  const seen = new Set()
  const merged = existing.map((article) => {
    const update = byId.get(article.id)
    if (!update) return article
    seen.add(article.id)
    return mergeArticle(article, update)
  })
  merged.push(...updates.filter((article) => !seen.has(article.id)))
  return merged
}

module.exports = { makeWikiSource, mergeArticles }
