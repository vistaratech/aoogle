/**
 * Aoogle AI Decision Engine (which AI tool is best for what)
 *
 * Provides instant executive verdicts on the best AI tools for any task or query:
 * - 🚀 Easiest & Quickest
 * - 👑 Highest Quality / Industry Standard
 * - 💰 Best Free / Open Source Alternative
 */

const CACHE_KEY = 'aoogle_decision_cache_v1'

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
    cache[query.toLowerCase().trim()] = {
      timestamp: Date.now(),
      data,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.warn('[Aoogle Decision Cache write failed]:', e)
  }
}

export async function fetchAiDecision(query, matchingTools = []) {
  const cleanQuery = query.trim()
  if (!cleanQuery) return null

  // 1. Check local cache
  const cache = getLocalCache()
  const cached = cache[cleanQuery.toLowerCase()]
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 60 * 24 * 7) {
    return cached.data
  }

  // 2. Synthesize context from matching tools in our database to help the LLM
  const contextTools = matchingTools.slice(0, 8).map((t) => ({
    name: t.name,
    url: t.url,
    pricing: t.pricing,
    desc: t.description,
    bestFor: t.bestFor || t.tags?.slice(0, 3).join(', '),
  }))

  const systemPrompt = `You are Aoogle's AI Decision Engine. Your mission is to advise the user on WHICH AI TOOL IS BEST FOR WHAT for the search query: "${cleanQuery}".
Context from our verified tools: ${JSON.stringify(contextTools)}

Analyze the user's intent and return a clean JSON object ONLY (no markdown code fence, just raw valid JSON):
{
  "summary": "1-2 sentence honest verdict comparing the top options and trade-offs.",
  "topPicks": [
    {
      "type": "quickest",
      "badge": "Easiest & Quickest",
      "name": "Tool Name",
      "url": "https://...",
      "pricing": "Free" or "Freemium",
      "reason": "Direct 1-line reason why it is easiest (e.g. no signup, 1-click result)"
    },
    {
      "type": "quality",
      "badge": "Highest Quality",
      "name": "Tool Name",
      "url": "https://...",
      "pricing": "Paid" or "Freemium",
      "reason": "Direct 1-line reason why it is the industry standard benchmark"
    },
    {
      "type": "free",
      "badge": "Best Free Alternative",
      "name": "Tool Name",
      "url": "https://...",
      "pricing": "Free",
      "reason": "Direct 1-line reason why it is the top zero-cost or open-source choice"
    }
  ]
}`

  try {
    const encodedPrompt = encodeURIComponent(systemPrompt)
    const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=searchgpt&json=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })


    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const text = await response.text()

    // Clean any markdown formatting if present
    const cleanJsonText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const parsed = JSON.parse(cleanJsonText)
    if (parsed && Array.isArray(parsed.topPicks) && parsed.topPicks.length > 0) {
      setLocalCache(cleanQuery, parsed)
      return parsed
    }
  } catch (err) {
    console.warn('[Aoogle AI Decision fetch error, using local heuristic]:', err.message)
  }

  // 3. Graceful fallback synthesized from local matching tools if API is unreachable
  if (matchingTools.length > 0) {
    const freePick = matchingTools.find((t) => t.pricing === 'Free') || matchingTools[0]
    const qualityPick = matchingTools[0]
    const fastestPick = matchingTools.length > 1 ? matchingTools[1] : matchingTools[0]

    const fallbackDecision = {
      summary: `For "${cleanQuery}", ${qualityPick.name} stands out as the primary recommendation, with ${freePick.name} offering a solid free tier.`,
      topPicks: [
        {
          type: 'quality',
          badge: 'Top Recommendation',
          name: qualityPick.name,
          url: qualityPick.url,
          pricing: qualityPick.pricing,
          reason: qualityPick.bestFor || qualityPick.description,
        },
        {
          type: 'free',
          badge: 'Best Free Option',
          name: freePick.name,
          url: freePick.url,
          pricing: freePick.pricing,
          reason: freePick.bestFor || freePick.description,
        },
        {
          type: 'quickest',
          badge: 'Alternative Pick',
          name: fastestPick.name,
          url: fastestPick.url,
          pricing: fastestPick.pricing,
          reason: fastestPick.bestFor || fastestPick.description,
        },
      ].filter((p, i, arr) => i === 0 || p.name !== arr[0].name),
    }

    setLocalCache(cleanQuery, fallbackDecision)
    return fallbackDecision
  }

  return null
}
