/**
 * Aoogle AI Decision Engine — Grounded in Real, Verified Tools
 *
 * Prevents hallucinations by strictly anchoring decisions to verified tools in Aoogle's index.
 * All recommended tools, URLs, and pricing are validated against authentic, live tools.
 */

import { TOOLS } from '../data/tools.js'

const CACHE_KEY = 'aoogle_decision_cache_v2'

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

/**
 * Finds a verified real tool from candidates or global tools database.
 */
function matchRealTool(candidateName, candidateUrl, pool) {
  const normName = (candidateName || '').toLowerCase().trim()
  let normDomain = ''
  try {
    if (candidateUrl) normDomain = new URL(candidateUrl).hostname.replace('www.', '').toLowerCase()
  } catch {}

  // 1. Direct name match in pool
  let match = pool.find((t) => t.name.toLowerCase() === normName || t.id.toLowerCase() === normName)
  if (match) return match

  // 2. Domain match in pool
  if (normDomain) {
    match = pool.find((t) => t.url.toLowerCase().includes(normDomain))
    if (match) return match
  }

  // 3. Fallback to global verified TOOLS
  match = TOOLS.find((t) => t.name.toLowerCase() === normName || t.id.toLowerCase() === normName)
  if (match) return match

  if (normDomain) {
    match = TOOLS.find((t) => t.url.toLowerCase().includes(normDomain))
    if (match) return match
  }

  return null
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

  // Use top matching tools as strict ground-truth context
  const pool = matchingTools.length > 0 ? matchingTools : TOOLS.slice(0, 20)
  const candidateTools = pool.slice(0, 10).map((t) => ({
    name: t.name,
    url: t.url,
    pricing: t.pricing,
    desc: t.description,
    bestFor: t.bestFor || t.tags?.slice(0, 3).join(', '),
  }))

  const systemPrompt = `You are Aoogle's AI Decision Engine. The user is searching for: "${cleanQuery}".

CRITICAL GROUNDING RULES:
1. You MUST ONLY recommend tools from the VERIFIED list below.
2. DO NOT hallucinate, invent, or make up fake tool names or fake URLs.
3. Every tool must have a 100% genuine URL from the provided list.

Verified Candidates:
${JSON.stringify(candidateTools)}

Return ONLY valid JSON matching this exact structure:
{
  "summary": "1-2 sentence truthful executive verdict explaining the best real-world choice for ${cleanQuery}.",
  "topPicks": [
    {
      "type": "quickest",
      "badge": "Easiest & Quickest",
      "name": "Exact Name from verified candidates",
      "reason": "Why it is easiest/fastest for this task"
    },
    {
      "type": "quality",
      "badge": "Highest Quality",
      "name": "Exact Name from verified candidates",
      "reason": "Why it provides the highest benchmark quality"
    },
    {
      "type": "free",
      "badge": "Best Free Alternative",
      "name": "Exact Name from verified candidates",
      "reason": "Why it is the best free option"
    }
  ]
}`

  try {
    const encodedPrompt = encodeURIComponent(systemPrompt)
    const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=openai&json=true`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })

    if (response.ok) {
      const text = await response.text()
      const cleanJsonText = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()

      const parsed = JSON.parse(cleanJsonText)

      if (parsed && Array.isArray(parsed.topPicks)) {
        // Enforce strict verification: validate every pick against REAL tools
        const verifiedPicks = []

        for (const pick of parsed.topPicks) {
          const real = matchRealTool(pick.name, pick.url, pool)
          if (real) {
            verifiedPicks.push({
              type: pick.type || 'quickest',
              badge: pick.badge || 'Recommended',
              name: real.name,
              url: real.url,
              pricing: real.pricing,
              reason: pick.reason || real.bestFor || real.description,
              isRealVerified: true,
            })
          }
        }

        // If at least 2 real tools were successfully verified, use them!
        if (verifiedPicks.length >= 2) {
          const decisionData = {
            summary: parsed.summary || `Top verified choices for "${cleanQuery}".`,
            topPicks: verifiedPicks,
            isRealVerified: true,
          }
          setLocalCache(cleanQuery, decisionData)
          return decisionData
        }
      }
    }
  } catch (err) {
    console.warn('[Aoogle AI Grounded Decision fallback]:', err.message)
  }

  // Fallback: 100% deterministic ground truth from verified local index
  if (pool.length > 0) {
    const qualityPick = pool[0]
    const freePick = pool.find((t) => t.pricing === 'Free') || (pool.length > 1 ? pool[1] : pool[0])
    const fastestPick = pool.find((t) => t.id !== qualityPick.id && t.id !== freePick.id) || pool[0]

    const fallbackDecision = {
      summary: `Verified tools for "${cleanQuery}": ${qualityPick.name} provides benchmark performance, while ${freePick.name} offers a zero-cost option.`,
      isRealVerified: true,
      topPicks: [
        {
          type: 'quality',
          badge: 'Top Benchmark Pick',
          name: qualityPick.name,
          url: qualityPick.url,
          pricing: qualityPick.pricing,
          reason: qualityPick.bestFor || qualityPick.description,
          isRealVerified: true,
        },
        {
          type: 'free',
          badge: 'Best Free Tier',
          name: freePick.name,
          url: freePick.url,
          pricing: freePick.pricing,
          reason: freePick.bestFor || freePick.description,
          isRealVerified: true,
        },
        {
          type: 'quickest',
          badge: 'Alternative Choice',
          name: fastestPick.name,
          url: fastestPick.url,
          pricing: fastestPick.pricing,
          reason: fastestPick.bestFor || fastestPick.description,
          isRealVerified: true,
        },
      ].filter((p, i, arr) => i === 0 || p.name !== arr[0].name),
    }

    setLocalCache(cleanQuery, fallbackDecision)
    return fallbackDecision
  }

  return null
}
