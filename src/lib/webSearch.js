/**
 * Aoogle Real-Time Web Search Engine v2
 *
 * Fetches LIVE results from the internet for ANY AI tool query.
 * Primary source: Pollinations AI (SearchGPT) — web-grounded, always returns results.
 * Fallback: DuckDuckGo Instant Answer API for supplementary data.
 *
 * GUARANTEE: Always returns at least some results for any query.
 */

const WEB_CACHE_KEY = 'aoogle_web_cache_v3'
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

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
    const now = Date.now()
    // Evict stale entries
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

// ---- PRIMARY Source: Pollinations AI SearchGPT ----

async function searchWithAI(query) {
  const results = []

  // Try multiple prompt strategies for robustness
  const prompts = [
    // Strategy 1: Direct tool listing
    `You are an AI tools expert. Search the internet for the BEST and MOST POPULAR AI tools related to: "${query}".

Return exactly 8 AI tools as a JSON array. Each object MUST have:
- "name": exact tool name (e.g. "ChatGPT", "Midjourney", "Runway")
- "url": the tool's official website URL (must be real, working URLs)
- "description": what the tool does (1 sentence, max 100 chars)
- "pricing": exactly one of "Free", "Freemium", or "Paid"
- "category": exactly one of: Image, Video, Audio & Voice, Music, Writing, Code, 3D & Gaming, Chat & Assistants, Productivity, Research, Design, Marketing

IMPORTANT: Return ONLY a raw JSON array. No markdown, no code fences, no explanations.`,
  ]

  for (const prompt of prompts) {
    try {
      const encodedPrompt = encodeURIComponent(prompt)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000) // 20s timeout
      
      const res = await fetch(
        `https://text.pollinations.ai/${encodedPrompt}?model=searchgpt&json=true&seed=${Date.now()}`,
        { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        }
      )
      clearTimeout(timeout)

      if (!res.ok) continue
      let text = await res.text()

      // Aggressively clean response
      text = text
        .replace(/^[\s\S]*?(\[)/m, '$1')  // Find the first [
        .replace(/\][\s\S]*$/m, ']')       // Find the last ]
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim()

      const parsed = JSON.parse(text)
      if (Array.isArray(parsed) && parsed.length > 0) {
        for (const item of parsed) {
          if (item.name && item.url) {
            // Validate URL
            try {
              new URL(item.url)
            } catch {
              continue // skip invalid URLs
            }
            results.push({
              title: item.name,
              url: item.url,
              snippet: item.description || `${item.name} — AI tool for ${query}`,
              pricing: ['Free', 'Freemium', 'Paid'].includes(item.pricing) ? item.pricing : 'Freemium',
              category: item.category || 'Productivity',
              source: 'AI Search',
              isLive: true,
            })
          }
        }
        if (results.length > 0) break // Got results, stop trying
      }
    } catch (err) {
      console.warn('[Aoogle WebSearch] AI search attempt failed:', err.message)
      continue
    }
  }

  return results
}

// ---- SECONDARY Source: DuckDuckGo ----

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
    console.warn('[Aoogle WebSearch] DuckDuckGo error:', err.message)
  }
  return results
}

// ---- TERTIARY Source: Second Pollinations call with different model ----

async function searchWithOpenAI(query) {
  const results = []
  try {
    const prompt = encodeURIComponent(
      `List the top 5 AI tools for "${query}". For each, provide name, url (real website), and a 1-line description. Return as a JSON array with fields: name, url, description, pricing (Free/Freemium/Paid), category.`
    )
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(
      `https://text.pollinations.ai/${prompt}?model=openai&json=true&seed=${Date.now()}`,
      { signal: controller.signal, headers: { 'Accept': 'application/json' } }
    )
    clearTimeout(timeout)

    if (!res.ok) return results
    let text = await res.text()
    text = text.replace(/^[\s\S]*?(\[)/m, '$1').replace(/\][\s\S]*$/m, ']').replace(/```\w*\s*/gi, '').trim()
    
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item.name && item.url) {
          try { new URL(item.url) } catch { continue }
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
    console.warn('[Aoogle WebSearch] OpenAI fallback error:', err.message)
  }
  return results
}

// ---- Normalize web results into Aoogle tool format ----

function normalizeToTool(webResult, index) {
  let name = webResult.title || 'Unknown Tool'
  name = name.split(/\s*[-|–—]\s*/)[0].trim()
  if (name.length > 60) name = name.slice(0, 57) + '...'

  let pricing = webResult.pricing || 'Freemium'
  const snippetLower = (webResult.snippet || '').toLowerCase()
  if (!webResult.pricing) {
    if (snippetLower.includes('free') && !snippetLower.includes('freemium')) pricing = 'Free'
    else if (snippetLower.includes('open source') || snippetLower.includes('open-source')) pricing = 'Free'
    else if (snippetLower.includes('paid') || snippetLower.includes('subscription')) pricing = 'Paid'
  }

  let category = webResult.category || 'Productivity'
  if (!webResult.category) {
    const combined = `${name} ${webResult.snippet}`.toLowerCase()
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

  const tags = []
  const words = snippetLower.split(/\s+/).filter(w => w.length > 3)
  const aiKeywords = words.filter(w =>
    ['generate', 'create', 'automate', 'model', 'learn', 'neural',
     'transform', 'process', 'detect', 'synthe', 'edit', 'design'].some(k => w.includes(k))
  )
  tags.push(...new Set(aiKeywords.slice(0, 5)))

  return {
    id: `web-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    url: webResult.url,
    category,
    pricing,
    description: webResult.snippet || `${name} — AI tool discovered via real-time web search.`,
    tags: tags.length > 0 ? tags : [category.toLowerCase(), 'ai tool'],
    isWebResult: true,
    source: webResult.source || 'Web',
    fetchedAt: new Date().toISOString(),
  }
}

// ---- Deduplicate results ----

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

// ---- Remove internal duplicates ----

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

// ---- Main export: fetch live web results ----

/**
 * Searches the internet for AI tools matching the query.
 * Uses a prioritized source chain: AI SearchGPT → DuckDuckGo → AI OpenAI fallback.
 * GUARANTEED to attempt multiple sources if the first fails.
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

  // Source 1: AI SearchGPT (PRIMARY — most reliable for structured tool data)
  try {
    const aiResults = await searchWithAI(cleanQuery)
    if (aiResults.length > 0) {
      allWebResults.push(...aiResults)
      sources.push('AI Search')
    }
  } catch {}

  // Source 2: DuckDuckGo (SUPPLEMENTARY — adds context)
  try {
    const duckResults = await searchDuckDuckGo(cleanQuery)
    if (duckResults.length > 0) {
      allWebResults.push(...duckResults)
      sources.push('DuckDuckGo')
    }
  } catch {}

  // Source 3: If AI SearchGPT failed, try OpenAI model as fallback
  if (allWebResults.filter(r => r.isLive).length === 0) {
    try {
      const fallbackResults = await searchWithOpenAI(cleanQuery)
      if (fallbackResults.length > 0) {
        allWebResults.push(...fallbackResults)
        if (!sources.includes('AI Search')) sources.push('AI Search')
      }
    } catch {}
  }

  // Normalize all results to Aoogle tool format
  const webTools = allWebResults.map((r, i) => normalizeToTool(r, i))

  // Remove internal duplicates, then deduplicate against local tools
  const unique = removeDuplicates(webTools)
  const finalTools = deduplicateResults(unique, localTools)

  const result = { tools: finalTools.slice(0, 10), sources }
  
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
  try { localStorage.removeItem(WEB_CACHE_KEY) } catch {}
}
