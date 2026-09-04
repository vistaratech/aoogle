// Aoogle's matching is deliberately simple: score every tool against the
// query's words and phrase, then rank. This works better than a generic
// fuzzy-string library here because the dataset's tags are hand-written
// task phrases ("remove background", "voice clone") — a query is really
// being matched against a small, curated vocabulary, not free text.

const STOPWORDS = new Set([
  'a', 'an', 'the', 'to', 'from', 'for', 'in', 'on', 'of', 'my', 'me', 'into',
  'with', 'and', 'or', 'i', 'want', 'need', 'can', 'you', 'please', 'how',
  'do', 'does', 'get', 'make', 'create', 'some', 'that', 'this', 'is',
])

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokenize(str) {
  return normalize(str)
    .split(' ')
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
}

function buildIndexEntry(tool) {
  return {
    tool,
    phraseHaystack: normalize([tool.name, ...tool.tags, tool.description, tool.category].join(' ')),
    tagHaystack: normalize(tool.tags.join(' ')),
    nameHaystack: normalize(tool.name),
    restHaystack: normalize(`${tool.description} ${tool.category}`),
  }
}

// Precomputes the per-tool haystacks once instead of on every keystroke.
export function createSearchIndex(tools) {
  return tools.map(buildIndexEntry)
}

function scoreEntry(entry, queryNorm, queryWords) {
  let score = 0

  // Big bonus for a genuine phrase match — but only for multi-word tags.
  // A single-word tag (e.g. "summarize") is too easy to find as a
  // substring of an unrelated query and would otherwise dominate.
  for (const tag of entry.tool.tags) {
    const tagNorm = tag.toLowerCase()
    if (!tagNorm.includes(' ')) continue
    if (queryNorm.includes(tagNorm) || tagNorm.includes(queryNorm)) {
      score += 10
    }
  }

  for (const word of queryWords) {
    if (entry.tagHaystack.includes(word)) score += 3
    if (entry.nameHaystack.includes(word)) score += 2
    if (entry.restHaystack.includes(word)) score += 1
  }

  return score
}

/**
 * Main search function — returns tools with relevance scores.
 * Each result has { ...tool, _score } when query is non-empty.
 */
export function searchTools({ searchIndex, tools, query, category, pricing }) {
  const trimmed = query.trim()
  let matches

  if (!trimmed) {
    matches = tools.map((t) => ({ ...t, _score: 0 }))
  } else {
    const queryNorm = normalize(trimmed)
    const queryWords = tokenize(trimmed)
    const scored = searchIndex
      .map((entry) => ({ ...entry.tool, _score: scoreEntry(entry, queryNorm, queryWords) }))
      .filter((r) => r._score > 0)

    const maxScore = scored.reduce((m, r) => Math.max(m, r._score), 0)
    const threshold = maxScore * 0.35

    matches = scored
      .filter((r) => r._score >= threshold)
      .sort((a, b) => b._score - a._score)
  }

  if (category !== 'All') {
    matches = matches.filter((t) => t.category === category)
  }
  if (pricing !== 'All') {
    matches = matches.filter((t) => t.pricing === pricing)
  }
  return matches
}

/**
 * Autocomplete suggestions — returns top matching tool names and tags.
 * Each suggestion is { text, type: 'tool'|'tag' }.
 */
export function getAutocompleteSuggestions(searchIndex, query, maxResults = 7) {
  const trimmed = query.trim()
  if (!trimmed || trimmed.length < 2) return []

  const queryNorm = normalize(trimmed)
  const suggestions = []
  const seen = new Set()

  // 1. Match tool names
  for (const entry of searchIndex) {
    if (entry.nameHaystack.includes(queryNorm)) {
      const key = `tool:${entry.tool.id}`
      if (!seen.has(key)) {
        seen.add(key)
        suggestions.push({
          text: entry.tool.name,
          type: 'tool',
          tool: entry.tool,
        })
      }
    }
  }

  // 2. Match tags
  for (const entry of searchIndex) {
    for (const tag of entry.tool.tags) {
      const tagNorm = tag.toLowerCase()
      if (tagNorm.includes(queryNorm) || queryNorm.includes(tagNorm)) {
        const key = `tag:${tagNorm}`
        if (!seen.has(key)) {
          seen.add(key)
          suggestions.push({ text: tag, type: 'tag' })
        }
      }
    }
  }

  return suggestions.slice(0, maxResults)
}
