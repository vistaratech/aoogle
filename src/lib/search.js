// Aoogle's matching engine — scores every tool against the query's words
// and phrase, then ranks. Supports fuzzy partial matching so that ANY
// search always returns relevant tools.

const STOPWORDS = new Set([
  'a', 'an', 'the', 'to', 'from', 'for', 'in', 'on', 'of', 'my', 'me', 'into',
  'with', 'and', 'or', 'i', 'want', 'need', 'can', 'you', 'please', 'how',
  'do', 'does', 'get', 'make', 'create', 'some', 'that', 'this', 'is',
  'best', 'top', 'good', 'find', 'tool', 'tools', 'ai', 'app', 'apps',
  'what', 'which', 'use', 'using', 'like',
])

// Synonym map for common user terms → canonical search terms
const SYNONYMS = {
  'photo': 'image', 'photos': 'image', 'pic': 'image', 'pics': 'image', 'picture': 'image',
  'vid': 'video', 'vids': 'video', 'clip': 'video', 'movie': 'video',
  'song': 'music', 'beat': 'music', 'tune': 'music',
  'voiceover': 'voice', 'tts': 'text to speech', 'speech': 'voice',
  'bg': 'background', 'bkg': 'background',
  'dev': 'developer', 'coding': 'code', 'programming': 'code',
  'ppt': 'presentation', 'slides': 'presentation',
  'doc': 'document', 'docs': 'document',
  'transcribe': 'transcription', 'subtitle': 'subtitles', 'caption': 'subtitles',
  'logo': 'logo design', 'branding': 'brand',
  'upscale': 'upscale image', 'enhance': 'upscale image',
  'resume': 'write resume', 'cv': 'write resume',
}

// Simple Levenshtein distance for typo tolerance
function levenshtein(a, b) {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  if (a === b) return 0
  // Skip if length difference is too large (optimization)
  if (Math.abs(a.length - b.length) > 3) return 99

  const matrix = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  return matrix[b.length][a.length]
}

// ---- Search History ----
const HISTORY_KEY = 'aoogle_search_history'
const MAX_HISTORY = 15

export function getSearchHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addToSearchHistory(query) {
  const trimmed = query.trim()
  if (!trimmed || trimmed.length < 2) return
  try {
    let history = getSearchHistory()
    // Remove duplicate, add to front
    history = history.filter(h => h.toLowerCase() !== trimmed.toLowerCase())
    history.unshift(trimmed)
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {}
}

export function clearSearchHistory() {
  try { localStorage.removeItem(HISTORY_KEY) } catch {}
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function expandSynonyms(words) {
  const expanded = []
  for (const word of words) {
    expanded.push(word)
    if (SYNONYMS[word]) {
      expanded.push(...SYNONYMS[word].split(' '))
    }
  }
  return [...new Set(expanded)]
}

function tokenize(str) {
  const words = normalize(str)
    .split(' ')
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
  return expandSynonyms(words)
}

function buildIndexEntry(tool) {
  // Build a comprehensive haystack including all searchable text
  const allText = [tool.name, ...tool.tags, tool.description, tool.category, tool.bestFor || ''].join(' ')
  return {
    tool,
    phraseHaystack: normalize(allText),
    tagHaystack: normalize(tool.tags.join(' ')),
    nameHaystack: normalize(tool.name),
    categoryHaystack: normalize(tool.category),
    restHaystack: normalize(`${tool.description} ${tool.category} ${tool.bestFor || ''}`),
  }
}

// Precomputes the per-tool haystacks once instead of on every keystroke.
export function createSearchIndex(tools) {
  return tools.map(buildIndexEntry)
}

function scoreEntry(entry, queryNorm, queryWords) {
  let score = 0

  // Exact phrase match in the full haystack (strongest signal)
  if (queryNorm.length > 2 && entry.phraseHaystack.includes(queryNorm)) {
    score += 15
  }

  // Multi-word tag phrase match
  for (const tag of entry.tool.tags) {
    const tagNorm = tag.toLowerCase()
    if (tagNorm.includes(' ')) {
      if (queryNorm.includes(tagNorm) || tagNorm.includes(queryNorm)) {
        score += 10
      }
    } else {
      // Single-word tag match (still useful, just weighted less)
      if (queryNorm.includes(tagNorm) || tagNorm.includes(queryNorm)) {
        score += 4
      }
    }
  }

  // Category match (if query matches a category name)
  if (entry.categoryHaystack.includes(queryNorm) || queryNorm.includes(entry.categoryHaystack)) {
    score += 6
  }

  for (const word of queryWords) {
    // Exact word matches
    if (entry.nameHaystack.includes(word)) score += 4
    if (entry.tagHaystack.includes(word)) score += 3
    if (entry.restHaystack.includes(word)) score += 1

    // Partial/fuzzy matches (word starts with or contains query word)
    if (word.length >= 3) {
      const tagWords = entry.tagHaystack.split(' ')
      const nameWords = entry.nameHaystack.split(' ')
      for (const tw of tagWords) {
        if (tw.startsWith(word) || word.startsWith(tw)) score += 1.5
        // Typo tolerance: Levenshtein distance <= 2 for words of similar length
        else if (tw.length >= 4 && levenshtein(word, tw) <= 2) score += 1
      }
      for (const nw of nameWords) {
        if (nw.startsWith(word) || word.startsWith(nw)) score += 1
        else if (nw.length >= 4 && levenshtein(word, nw) <= 2) score += 0.8
      }
    }
  }

  return score
}

// ---- Semantic category mapping for "smart" search ----
// When user types "photo", we should also match "Image" category tools etc.
const CATEGORY_ALIASES = {
  'image': ['photo', 'picture', 'draw', 'paint', 'illustration', 'art', 'graphic', 'visual', 'poster', 'banner', 'logo'],
  'video': ['clip', 'movie', 'film', 'animate', 'animation', 'motion', 'reel', 'short', 'editing'],
  'audio & voice': ['audio', 'voice', 'speech', 'sound', 'podcast', 'tts', 'text to speech', 'voiceover', 'dubbing'],
  'music': ['song', 'beat', 'melody', 'tune', 'compose', 'instrument', 'soundtrack', 'remix'],
  'writing': ['write', 'essay', 'blog', 'content', 'copy', 'copywriting', 'article', 'email', 'story', 'novel', 'script', 'grammar'],
  'code': ['coding', 'programming', 'developer', 'debug', 'ide', 'github', 'software', 'api', 'web', 'website', 'frontend', 'backend'],
  '3d & gaming': ['3d', 'game', 'gaming', 'render', 'model', 'mesh', 'unity', 'unreal', 'blender', 'texture'],
  'chat & assistants': ['chat', 'chatbot', 'assistant', 'gpt', 'llm', 'conversational', 'bot', 'agent'],
  'productivity': ['productivity', 'workflow', 'automation', 'automate', 'schedule', 'organize', 'note', 'document', 'pdf', 'spreadsheet'],
  'research': ['research', 'paper', 'academic', 'study', 'analysis', 'data', 'science', 'journal', 'citation'],
  'design': ['design', 'ui', 'ux', 'figma', 'prototype', 'mockup', 'wireframe', 'brand', 'branding', 'creative'],
  'marketing': ['marketing', 'seo', 'ad', 'ads', 'advertising', 'campaign', 'social media', 'analytics', 'growth'],
  'meetings': ['meeting', 'zoom', 'call', 'conference', 'transcribe', 'transcript', 'notes'],
  'presentations': ['presentation', 'slides', 'powerpoint', 'deck', 'pitch', 'keynote'],
  'translation': ['translate', 'translation', 'language', 'multilingual', 'localize', 'interpreter'],
}

function getSemanticCategories(queryNorm) {
  const matched = []
  for (const [category, aliases] of Object.entries(CATEGORY_ALIASES)) {
    for (const alias of aliases) {
      if (queryNorm.includes(alias) || alias.includes(queryNorm)) {
        matched.push(category)
        break
      }
    }
  }
  return matched
}

/**
 * Main search function — returns tools with relevance scores.
 * GUARANTEED to return results for any query (falls back to category or "top tools").
 */
export function searchTools({ searchIndex, tools, query, category, pricing }) {
  const trimmed = query.trim()
  let matches

  if (!trimmed) {
    matches = tools.map((t) => ({ ...t, _score: 0 }))
  } else {
    const queryNorm = normalize(trimmed)
    const queryWords = tokenize(trimmed)

    // Score all tools
    let scored = searchIndex
      .map((entry) => ({ ...entry.tool, _score: scoreEntry(entry, queryNorm, queryWords) }))
      .filter((r) => r._score > 0)

    // If keyword search found results, use them with a gentle threshold
    if (scored.length > 0) {
      const maxScore = scored.reduce((m, r) => Math.max(m, r._score), 0)
      const threshold = maxScore * 0.2 // Much more lenient — include more results
      matches = scored
        .filter((r) => r._score >= threshold)
        .sort((a, b) => b._score - a._score)
    } else {
      matches = []
    }

    // If still no matches, try semantic category matching
    if (matches.length === 0) {
      const semanticCategories = getSemanticCategories(queryNorm)
      if (semanticCategories.length > 0) {
        matches = tools
          .filter((t) => semanticCategories.includes(t.category.toLowerCase()))
          .map((t) => ({ ...t, _score: 2 }))
      }
    }

    // LAST RESORT: if STILL no matches, show top tools (users should never see empty results)
    if (matches.length === 0) {
      matches = tools.slice(0, 20).map((t) => ({ ...t, _score: 0.1 }))
    }
  }

  if (category && category !== 'All') {
    matches = matches.filter((t) => t.category.toLowerCase() === category.toLowerCase())
  }
  if (pricing && pricing !== 'All') {
    matches = matches.filter((t) => t.pricing.toLowerCase() === pricing.toLowerCase())
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

  // 1. Match tool names (exact and partial)
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

  // 3. Match categories as suggestions
  const semanticCategories = getSemanticCategories(queryNorm)
  for (const cat of semanticCategories) {
    const key = `cat:${cat}`
    if (!seen.has(key)) {
      seen.add(key)
      suggestions.push({ text: cat, type: 'tag' })
    }
  }

  return suggestions.slice(0, maxResults)
}
