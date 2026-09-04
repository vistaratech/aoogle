/**
 * Aoogle Real-Time Web Search Engine
 *
 * Fetches LIVE results from the internet for any AI tool query.
 * Uses multiple free, no-API-key-required search sources:
 *  1. DuckDuckGo Instant Answer API (structured data)
 *  2. Google Custom Search (if key provided)
 *  3. Fallback: SearXNG public instances
 *
 * Returns normalized results compatible with Aoogle's tool format.
 */

const WEB_CACHE_KEY = 'aoogle_web_cache_v2'
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes — real-time but not hammering APIs

// ---- Cache helpers ----

function getWebCache() {
  try {
    const raw = localStorage.getItem(WEB_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setWebCache(query, data) {
  try {
    const cache = getWebCache()
    // Evict stale entries to keep localStorage clean
    const now = Date.now()
    for (const key of Object.keys(cache)) {
      if (now - cache[key].timestamp > CACHE_TTL * 4) delete cache[key]
    }
    cache[query.toLowerCase().trim()] = { timestamp: now, data }
    localStorage.setItem(WEB_CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.warn('[Aoogle WebSearch] cache write failed:', e)
  }
}

function getCachedResult(query) {
  const cache = getWebCache()
  const entry = cache[query.toLowerCase().trim()]
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data
  }
  return null
}

// ---- Source 1: DuckDuckGo Instant Answer ----

async function searchDuckDuckGo(query) {
  const results = []
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query + ' AI tool')}&format=json&no_redirect=1&no_html=1&skip_disambig=1`
    const res = await fetch(url)
    if (!res.ok) return results
    const data = await res.json()

    // Abstract (main answer)
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.Abstract,
        source: 'DuckDuckGo',
      })
    }

    // Related topics
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.split(' - ')[0]?.slice(0, 80) || topic.Text.slice(0, 80),
            url: topic.FirstURL,
            snippet: topic.Text,
            source: 'DuckDuckGo',
          })
        }
        // Handle subcategories
        if (topic.Topics) {
          for (const sub of topic.Topics.slice(0, 3)) {
            if (sub.FirstURL && sub.Text) {
              results.push({
                title: sub.Text.split(' - ')[0]?.slice(0, 80) || sub.Text.slice(0, 80),
                url: sub.FirstURL,
                snippet: sub.Text,
                source: 'DuckDuckGo',
              })
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Aoogle WebSearch] DuckDuckGo error:', err.message)
  }
  return results
}

// ---- Source 2: SearXNG public instance ----

async function searchSearXNG(query) {
  const results = []
  // Use multiple public SearXNG instances as fallback
  const instances = [
    'https://search.sapti.me',
    'https://searx.be',
    'https://search.bus-hit.me',
  ]

  for (const instance of instances) {
    try {
      const url = `${instance}/search?q=${encodeURIComponent(query + ' AI tool')}&format=json&categories=general&language=en`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) continue
      const data = await res.json()

      if (data.results && data.results.length > 0) {
        for (const r of data.results.slice(0, 8)) {
          results.push({
            title: r.title || '',
            url: r.url || '',
            snippet: r.content || '',
            source: 'Web',
          })
        }
        break // success — stop trying other instances
      }
    } catch {
      continue // try next instance
    }
  }
  return results
}

// ---- Source 3: Pollinations AI for web-grounded recommendations ----

async function searchWithAI(query) {
  const results = []
  try {
    const prompt = encodeURIComponent(
      `Search the internet and list the top 6 most popular and current AI tools for: "${query}".
For EACH tool, provide ONLY a valid JSON array. Each element must have:
- "name": the tool's actual name
- "url": the tool's real official website URL
- "description": 1-sentence description of what it does
- "pricing": "Free", "Freemium", or "Paid"
- "category": one of: Image, Video, Audio & Voice, Music, Writing, Code, 3D & Gaming, Chat & Assistants, Productivity, Research, Design, Marketing

Return ONLY the JSON array, no markdown fences, no extra text.`
    )

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(
      `https://text.pollinations.ai/${prompt}?model=searchgpt&json=true`,
      { signal: controller.signal, headers: { 'Accept': 'application/json' } }
    )
    clearTimeout(timeout)

    if (!res.ok) return results
    let text = await res.text()

    // Clean markdown code fences if present
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item.name && item.url) {
          results.push({
            title: item.name,
            url: item.url,
            snippet: item.description || '',
            pricing: item.pricing || 'Freemium',
            category: item.category || 'Productivity',
            source: 'AI Search',
            isLive: true,
          })
        }
      }
    }
  } catch (err) {
    console.warn('[Aoogle WebSearch] AI search error:', err.message)
  }
  return results
}

// ---- Normalize web results into Aoogle tool format ----

function normalizeToTool(webResult, index) {
  // Try to extract a clean tool name from title
  let name = webResult.title || 'Unknown Tool'
  // Remove common suffixes like "- Official Site", "| Best AI", etc.
  name = name.split(/\s*[-|–—]\s*/)[0].trim()
  if (name.length > 60) name = name.slice(0, 57) + '...'

  // Try to determine pricing from snippet
  let pricing = webResult.pricing || 'Freemium'
  const snippetLower = (webResult.snippet || '').toLowerCase()
  if (!webResult.pricing) {
    if (snippetLower.includes('free') && !snippetLower.includes('freemium')) pricing = 'Free'
    else if (snippetLower.includes('open source') || snippetLower.includes('open-source')) pricing = 'Free'
    else if (snippetLower.includes('paid') || snippetLower.includes('subscription') || snippetLower.includes('pricing')) pricing = 'Paid'
  }

  // Determine category from content
  let category = webResult.category || 'Productivity'
  if (!webResult.category) {
    const combined = `${name} ${webResult.snippet}`.toLowerCase()
    if (/\b(image|photo|picture|draw|paint|illustration)\b/.test(combined)) category = 'Image'
    else if (/\b(video|animate|motion|clip)\b/.test(combined)) category = 'Video'
    else if (/\b(audio|voice|speech|sound|podcast)\b/.test(combined)) category = 'Audio & Voice'
    else if (/\b(music|song|beat|melody)\b/.test(combined)) category = 'Music'
    else if (/\b(writ|essay|blog|content|copy|text)\b/.test(combined)) category = 'Writing'
    else if (/\b(code|program|develop|debug|ide|github)\b/.test(combined)) category = 'Code'
    else if (/\b(3d|game|render|model|mesh)\b/.test(combined)) category = '3D & Gaming'
    else if (/\b(chat|assistant|gpt|llm|convers)\b/.test(combined)) category = 'Chat & Assistants'
    else if (/\b(design|ui|ux|figma|logo|brand)\b/.test(combined)) category = 'Design'
    else if (/\b(research|paper|academic|study|analys)\b/.test(combined)) category = 'Research'
    else if (/\b(market|seo|ad|campaign|social)\b/.test(combined)) category = 'Marketing'
  }

  // Build tags from snippet keywords
  const tags = []
  const words = snippetLower.split(/\s+/).filter(w => w.length > 3)
  const aiKeywords = words.filter(w =>
    ['ai', 'tool', 'generate', 'create', 'automate', 'model', 'deep', 'learn', 'neural',
     'gpt', 'llm', 'machine', 'transform', 'process', 'detect', 'recogn', 'synthe'].some(k => w.includes(k))
  )
  tags.push(...new Set(aiKeywords.slice(0, 5)))

  return {
    id: `web-${Date.now()}-${index}`,
    name,
    url: webResult.url,
    category,
    pricing,
    description: webResult.snippet || `${name} — discovered via real-time web search.`,
    tags: tags.length > 0 ? tags : [category.toLowerCase(), 'ai tool'],
    isWebResult: true,
    source: webResult.source || 'Web',
    fetchedAt: new Date().toISOString(),
  }
}

// ---- Deduplicate results (prefer local tools over web results) ----

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

// ---- Main export: fetch live web results ----

/**
 * Searches the internet for AI tools matching the query.
 * Returns an array of tool objects compatible with Aoogle's format.
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

  // Run all sources in parallel for speed
  const [duckResults, searxResults, aiResults] = await Promise.allSettled([
    searchDuckDuckGo(cleanQuery),
    searchSearXNG(cleanQuery),
    searchWithAI(cleanQuery),
  ])

  // Collect all web results
  const allWebResults = [
    ...(aiResults.status === 'fulfilled' ? aiResults.value : []),
    ...(duckResults.status === 'fulfilled' ? duckResults.value : []),
    ...(searxResults.status === 'fulfilled' ? searxResults.value : []),
  ]

  // Track which sources returned data
  const sources = []
  if (aiResults.status === 'fulfilled' && aiResults.value.length > 0) sources.push('AI Search')
  if (duckResults.status === 'fulfilled' && duckResults.value.length > 0) sources.push('DuckDuckGo')
  if (searxResults.status === 'fulfilled' && searxResults.value.length > 0) sources.push('SearXNG')

  // Normalize to Aoogle tool format
  const webTools = allWebResults.map((r, i) => normalizeToTool(r, i))

  // Deduplicate against local tools
  const uniqueWebTools = deduplicateResults(webTools, localTools)

  // Remove internal duplicates (by URL hostname)
  const seenHosts = new Set()
  const finalTools = uniqueWebTools.filter(t => {
    try {
      const host = new URL(t.url).hostname.replace('www.', '')
      if (seenHosts.has(host)) return false
      seenHosts.add(host)
      return true
    } catch {
      return true
    }
  })

  const result = { tools: finalTools.slice(0, 10), sources }
  setWebCache(cleanQuery, result)
  return result
}

/**
 * Clear the web search cache
 */
export function clearWebCache() {
  try { localStorage.removeItem(WEB_CACHE_KEY) } catch {}
}
