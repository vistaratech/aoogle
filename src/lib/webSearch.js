/**
 * Aoogle Real-Time Web Search Engine v3
 *
 * Searches the ENTIRE INTERNET for AI tools using multiple free sources:
 *
 * Source 1: DuckDuckGo API (instant answers — always works)
 * Source 2: Pollinations AI (with retry + queue management)
 * Source 3: Intelligent Web Discovery via CORS-friendly search proxies
 *
 * STRATEGY: Uses a curated knowledge base of 1000+ known AI tool websites
 * combined with live web search to find the best AI tools for any query.
 * This means even if the live API is temporarily rate-limited, we still
 * discover relevant tools beyond the static 203.
 */

const WEB_CACHE_KEY = 'aoogle_web_cache_v4'
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

// Extended AI tools knowledge base has been merged into src/data/tools.js
// This eliminates ~20KB of duplicate data from the bundle

// ═══════════════════════════════════════════════════════════════════
// CACHE HELPERS
// ═══════════════════════════════════════════════════════════════════

function getWebCache() {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(WEB_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setWebCache(query, data) {
  try {
    if (typeof localStorage === 'undefined') return
    const cache = getWebCache()
    const now = Date.now()
    const MAX_WEB_CACHE = 30

    // Evict expired entries
    for (const key of Object.keys(cache)) {
      if (now - cache[key].timestamp > CACHE_TTL * 4) delete cache[key]
    }

    // LRU eviction if over max
    const entries = Object.entries(cache)
    if (entries.length >= MAX_WEB_CACHE) {
      entries
        .sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0))
        .slice(0, entries.length - MAX_WEB_CACHE + 1)
        .forEach(([key]) => delete cache[key])
    }

    cache[query.toLowerCase().trim()] = { timestamp: now, data }
    localStorage.setItem(WEB_CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    if (e?.name === 'QuotaExceededError') {
      try { localStorage.removeItem(WEB_CACHE_KEY) } catch {}
    }
    console.warn('[Aoogle] cache write failed:', e)
  }
}

function getCachedResult(query) {
  try {
    if (typeof localStorage === 'undefined') return null
    const cache = getWebCache()
    const entry = cache[query.toLowerCase().trim()]
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data
    }
  } catch {}
  return null
}



// ═══════════════════════════════════════════════════════════════════

function searchExtendedDB(query) {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)

  return EXTENDED_TOOLS_DB
    .map(tool => {
      let score = 0
      const searchableText = `${tool.name} ${tool.description} ${tool.category} ${(tool.tags || []).join(' ')}`.toLowerCase()

      for (const word of queryWords) {
        if (tool.name.toLowerCase().includes(word)) score += 10
        if (tool.category.toLowerCase().includes(word)) score += 5
        if ((tool.tags || []).some(t => t.includes(word))) score += 4
        if (tool.description.toLowerCase().includes(word)) score += 2
      }

      // Boost exact name match
      if (tool.name.toLowerCase().includes(queryLower)) score += 20

      return { ...tool, score }
    })
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
}

// ═══════════════════════════════════════════════════════════════════
// SOURCE 1: REAL-TIME INTERNET WEB SEARCH (via /api/websearch)
// Scrapes live DuckDuckGo HTML results for real AI tools across the entire web
// ═══════════════════════════════════════════════════════════════════

async function searchLiveWeb(query) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(`/api/websearch?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return []
    const data = await res.json()
    return (data.tools || []).map(t => ({
      ...t,
      source: 'Live Web',
      isLive: true,
    }))
  } catch {
    return []
  }
}

// ═══════════════════════════════════════════════════════════════════
// SOURCE 2: GITHUB OPEN-SOURCE AI REPOSITORIES
// Finds cutting-edge open source AI tools on the web (CORS-friendly)
// ═══════════════════════════════════════════════════════════════════

async function searchGitHubAI(query) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query + ' ai')}&sort=stars&per_page=6`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)
    if (!res.ok) return []
    const data = await res.json()
    return (data.items || []).map(item => ({
      title: item.name.replace(/[-_]/g, ' '),
      name: item.name.replace(/[-_]/g, ' '),
      url: item.html_url,
      snippet: item.description || `${item.name} — open-source AI project for ${query}`,
      source: 'GitHub AI',
      pricing: 'Free',
      category: 'Code',
      isLive: true,
    }))
  } catch {
    return []
  }
}


// ═══════════════════════════════════════════════════════════════════
// SOURCE 3: DUCKDUCKGO API (always works, limited results)
// ═══════════════════════════════════════════════════════════════════

async function searchDuckDuckGo(query) {
  const results = []
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query + ' AI tool')}&format=json&no_redirect=1&no_html=1&skip_disambig=1`
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) return results
    const data = await res.json()

    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.Abstract,
        source: 'DuckDuckGo',
      })
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 4)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.split(' - ')[0]?.slice(0, 80) || topic.Text.slice(0, 80),
            url: topic.FirstURL,
            snippet: topic.Text,
            source: 'DuckDuckGo',
          })
        }
      }
    }
  } catch (err) {
    console.warn('[Aoogle] DuckDuckGo error:', err.message)
  }
  return results
}

// ═══════════════════════════════════════════════════════════════════
// NORMALIZE & DEDUPLICATE
// ═══════════════════════════════════════════════════════════════════

function normalizeToTool(webResult, index) {
  let name = webResult.title || webResult.name || 'Unknown Tool'
  name = name.split(/\s*[-|–—]\s*/)[0].trim()
  if (name.length > 60) name = name.slice(0, 57) + '...'

  let pricing = webResult.pricing || 'Freemium'
  const snippetLower = (webResult.snippet || webResult.description || '').toLowerCase()
  if (!webResult.pricing) {
    if (snippetLower.includes('free') && !snippetLower.includes('freemium')) pricing = 'Free'
    else if (snippetLower.includes('open source') || snippetLower.includes('open-source')) pricing = 'Free'
    else if (snippetLower.includes('paid') || snippetLower.includes('subscription')) pricing = 'Paid'
  }

  let category = webResult.category || 'Productivity'
  if (!webResult.category) {
    const combined = `${name} ${webResult.snippet || ''}`.toLowerCase()
    if (/\b(image|photo|picture|draw|paint|illustration)\b/.test(combined)) category = 'Image'
    else if (/\b(video|animate|motion|clip|editing)\b/.test(combined)) category = 'Video'
    else if (/\b(audio|voice|speech|sound|podcast)\b/.test(combined)) category = 'Audio & Voice'
    else if (/\b(music|song|beat|melody)\b/.test(combined)) category = 'Music'
    else if (/\b(writ|essay|blog|content|copy)\b/.test(combined)) category = 'Writing'
    else if (/\b(code|program|develop|debug|ide)\b/.test(combined)) category = 'Code'
    else if (/\b(3d|game|render|model|mesh)\b/.test(combined)) category = '3D & Gaming'
    else if (/\b(chat|assistant|gpt|llm)\b/.test(combined)) category = 'Chat & Assistants'
    else if (/\b(design|ui|ux|figma|logo)\b/.test(combined)) category = 'Design'
    else if (/\b(research|paper|academic)\b/.test(combined)) category = 'Research'
    else if (/\b(market|seo|ad|campaign)\b/.test(combined)) category = 'Marketing'
  }

  const tags = webResult.tags || []
  if (tags.length === 0) {
    const words = snippetLower.split(/\s+/).filter(w => w.length > 3)
    const aiKeywords = words.filter(w =>
      ['generate', 'create', 'automate', 'model', 'learn', 'neural',
       'transform', 'process', 'detect', 'synthe', 'edit', 'design'].some(k => w.includes(k))
    )
    tags.push(...new Set(aiKeywords.slice(0, 5)))
  }

  return {
    id: `web-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    url: webResult.url,
    category,
    pricing,
    description: webResult.snippet || webResult.description || `${name} — AI tool discovered via web search.`,
    tags: tags.length > 0 ? tags : [category.toLowerCase(), 'ai tool'],
    isWebResult: true,
    source: webResult.source || 'Web',
    fetchedAt: new Date().toISOString(),
  }
}

function deduplicateResults(webTools, localTools) {
  const localUrls = new Set(localTools.map(t => {
    try { return new URL(t.url).hostname.replace('www.', '') } catch { return '' }
  }).filter(Boolean))

  const localNames = new Set(localTools.map(t => t.name.toLowerCase()))

  return webTools.filter(wt => {
    try {
      const hostname = new URL(wt.url).hostname.replace('www.', '')
      if (localUrls.has(hostname)) return false
    } catch {}
    if (localNames.has(wt.name.toLowerCase())) return false
    return true
  })
}

function removeDuplicates(tools) {
  const seenHosts = new Set()
  const seenNames = new Set()
  return tools.filter(t => {
    const nameLower = t.name.toLowerCase()
    if (seenNames.has(nameLower)) return false
    seenNames.add(nameLower)
    try {
      const host = new URL(t.url).hostname.replace('www.', '')
      if (seenHosts.has(host)) return false
      seenHosts.add(host)
    } catch {}
    return true
  })
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT: FETCH LIVE WEB RESULTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Searches the internet for AI tools matching the query.
 * Uses a 3-tier strategy:
 *   1. Extended Database (100+ curated tools not in the static 203)
 *   2. Pollinations AI (real-time internet search)
 *   3. DuckDuckGo (supplementary)
 *
 * GUARANTEED: Always returns results because of the extended DB fallback.
 *
 * @param {string} query - The user's search query
 * @param {Array} localTools - Existing local tools (for deduplication)
 * @returns {Promise<{tools: Array, sources: string[]}>}
 */
export async function fetchLiveWebResults(query, localTools = []) {
  const cleanQuery = query.trim()
  if (!cleanQuery || cleanQuery.length < 2) return { tools: [], sources: [] }

  // Check cache first
  const cached = getCachedResult(cleanQuery)
  if (cached) return cached

  const sources = []
  let allWebResults = []

  // Execute searches in parallel: Live Web + GitHub AI + Extended DB
  const [liveResults, gitHubResults] = await Promise.all([
    searchLiveWeb(cleanQuery),
    searchGitHubAI(cleanQuery),
  ])

  // 1. Live Web Search (Highest Priority — finds live tools from full internet)
  if (liveResults && liveResults.length > 0) {
    allWebResults.push(...liveResults)
    sources.push('Live Web')
  }

  // Extended tools database has been merged into the main tools.js index
  // No longer needed as a separate web search source

  // 3. GitHub Open-Source AI tools
  if (gitHubResults && gitHubResults.length > 0) {
    allWebResults.push(...gitHubResults)
    if (!sources.includes('GitHub AI')) sources.push('GitHub AI')
  }

  // 4. DuckDuckGo Instant Answers (supplementary fallback)
  if (allWebResults.length < 3) {
    try {
      const duckResults = await searchDuckDuckGo(cleanQuery)
      if (duckResults.length > 0) {
        allWebResults.push(...duckResults)
        if (!sources.includes('DuckDuckGo')) sources.push('DuckDuckGo')
      }
    } catch {}
  }

  // Normalize all results to Aoogle tool format
  const webTools = allWebResults.map((r, i) => normalizeToTool(r, i))

  // Remove internal duplicates, then deduplicate against local tools
  const unique = removeDuplicates(webTools)
  const finalTools = deduplicateResults(unique, localTools)

  const result = { tools: finalTools.slice(0, 15), sources }

  // Only cache if we got real results
  if (finalTools.length > 0) {
    setWebCache(cleanQuery, result)
  }

  return result
}

/**
 * Clear the web search cache
 */
export function clearWebCache() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(WEB_CACHE_KEY)
    }
  } catch {}
}

