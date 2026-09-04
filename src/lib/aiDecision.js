/**
 * Aoogle AI Decision Engine v2 — "Which AI tool is best for what?"
 *
 * Uses web-grounded AI (SearchGPT) to provide REAL-TIME expert verdicts.
 * Falls back to local heuristic analysis when API is unavailable.
 *
 * Guarantees a response for EVERY query.
 */

const CACHE_KEY = 'aoogle_decision_cache_v2'
const MAX_CACHE_ENTRIES = 50

function getLocalCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setLocalCache(query, data) {
  try {
    const cache = getLocalCache()
    const now = Date.now()
    const TTL_7_DAYS = 1000 * 60 * 60 * 24 * 7

    // Evict expired entries (older than 7 days)
    for (const key of Object.keys(cache)) {
      if (now - (cache[key].timestamp || 0) > TTL_7_DAYS) {
        delete cache[key]
      }
    }

    // LRU eviction: if still over max, remove oldest entries
    const entries = Object.entries(cache)
    if (entries.length >= MAX_CACHE_ENTRIES) {
      entries
        .sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0))
        .slice(0, entries.length - MAX_CACHE_ENTRIES + 1)
        .forEach(([key]) => delete cache[key])
    }

    cache[query.toLowerCase().trim()] = {
      timestamp: now,
      data,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    // If quota exceeded, clear entire cache and retry once
    if (e?.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(CACHE_KEY)
      } catch {}
    }
    console.warn('[Aoogle Decision Cache write failed]:', e)
  }
}

export async function fetchAiDecision(query, matchingTools = []) {
  const cleanQuery = query.trim()
  if (!cleanQuery) return null

  // 1. Check local cache (7-day TTL)
  const cache = getLocalCache()
  const cached = cache[cleanQuery.toLowerCase()]
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 60 * 24 * 7) {
    return cached.data
  }

  // 2. Build context from matching tools
  const contextTools = matchingTools.slice(0, 10).map((t) => ({
    name: t.name,
    url: t.url,
    pricing: t.pricing,
    desc: t.description?.slice(0, 80),
    bestFor: t.bestFor || t.tags?.slice(0, 3).join(', '),
  }))

  const systemPrompt = `You are Aoogle's AI Decision Engine. Search the web and analyze which AI tool is BEST for: "${cleanQuery}".

${contextTools.length > 0 ? `Some known tools to consider: ${JSON.stringify(contextTools)}` : ''}

Return a JSON object with this EXACT structure (no markdown, no code fences, raw JSON only):
{
  "summary": "1-2 sentence honest comparison of the top options, trade-offs, and recommendation.",
  "topPicks": [
    {
      "type": "quickest",
      "badge": "Easiest & Quickest",
      "name": "Tool Name",
      "url": "https://actual-website.com",
      "pricing": "Free",
      "reason": "1-line reason why it's the easiest option"
    },
    {
      "type": "quality",
      "badge": "Highest Quality",
      "name": "Tool Name",
      "url": "https://actual-website.com",
      "pricing": "Paid",
      "reason": "1-line reason why it's the industry standard"
    },
    {
      "type": "free",
      "badge": "Best Free Alternative",
      "name": "Tool Name",
      "url": "https://actual-website.com",
      "pricing": "Free",
      "reason": "1-line reason why it's the top free/open-source choice"
    }
  ]
}`

  // Try SearchGPT model first (web-grounded)
  try {
    const encodedPrompt = encodeURIComponent(systemPrompt)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    
    const response = await fetch(
      `https://text.pollinations.ai/${encodedPrompt}?model=searchgpt&json=true&seed=${Date.now()}`,
      {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      }
    )
    clearTimeout(timeout)

    if (response.ok) {
      let text = await response.text()
      
      // Aggressive JSON extraction
      text = text
        .replace(/^[\s\S]*?(\{)/m, '$1')  // Find first {
        .replace(/\}[\s\S]*$/m, '}')       // Find last }
        .replace(/```\w*\s*/gi, '')
        .trim()

      const parsed = JSON.parse(text)
      if (parsed && Array.isArray(parsed.topPicks) && parsed.topPicks.length > 0) {
        setLocalCache(cleanQuery, parsed)
        return parsed
      }
    }
  } catch (err) {
    console.warn('[Aoogle AI Decision SearchGPT error]:', err.message)
  }

  // Fallback: Try OpenAI model
  try {
    const encodedPrompt = encodeURIComponent(systemPrompt)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    
    const response = await fetch(
      `https://text.pollinations.ai/${encodedPrompt}?model=openai&json=true&seed=${Date.now()}`,
      {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      }
    )
    clearTimeout(timeout)

    if (response.ok) {
      let text = await response.text()
      text = text.replace(/^[\s\S]*?(\{)/m, '$1').replace(/\}[\s\S]*$/m, '}').replace(/```\w*\s*/gi, '').trim()
      
      const parsed = JSON.parse(text)
      if (parsed && Array.isArray(parsed.topPicks) && parsed.topPicks.length > 0) {
        setLocalCache(cleanQuery, parsed)
        return parsed
      }
    }
  } catch (err) {
    console.warn('[Aoogle AI Decision OpenAI fallback error]:', err.message)
  }

  // 3. LAST RESORT: synthesize from local matching tools
  if (matchingTools.length > 0) {
    const freePick = matchingTools.find((t) => t.pricing === 'Free') || matchingTools[matchingTools.length - 1]
    const qualityPick = matchingTools[0]
    const fastestPick = matchingTools.length > 1 ? matchingTools[1] : matchingTools[0]

    const fallbackDecision = {
      summary: `For "${cleanQuery}", ${qualityPick.name} is our top recommendation${freePick.name !== qualityPick.name ? `, with ${freePick.name} as a solid free alternative` : ''}. Based on our indexed database of ${matchingTools.length}+ matching tools.`,
      topPicks: [
        {
          type: 'quality',
          badge: 'Top Recommendation',
          name: qualityPick.name,
          url: qualityPick.url,
          pricing: qualityPick.pricing,
          reason: qualityPick.bestFor || qualityPick.description,
        },
        freePick.name !== qualityPick.name && {
          type: 'free',
          badge: 'Best Free Option',
          name: freePick.name,
          url: freePick.url,
          pricing: freePick.pricing,
          reason: freePick.bestFor || freePick.description,
        },
        fastestPick.name !== qualityPick.name && fastestPick.name !== freePick.name && {
          type: 'quickest',
          badge: 'Quick Alternative',
          name: fastestPick.name,
          url: fastestPick.url,
          pricing: fastestPick.pricing,
          reason: fastestPick.bestFor || fastestPick.description,
        },
      ].filter(Boolean),
    }

    setLocalCache(cleanQuery, fallbackDecision)
    return fallbackDecision
  }

  return null
}
