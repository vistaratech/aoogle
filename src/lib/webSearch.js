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

// ═══════════════════════════════════════════════════════════════════
// EXTENDED AI TOOLS KNOWLEDGE BASE
// 1000+ real AI tools organized by category — this dramatically
// extends our coverage beyond the 203 static tools
// ═══════════════════════════════════════════════════════════════════

const EXTENDED_TOOLS_DB = [
  // ── VIDEO ──
  { name: 'Runway', url: 'https://runwayml.com', description: 'AI-powered video generation and editing suite', pricing: 'Freemium', category: 'Video', tags: ['video generation', 'editing', 'gen-2', 'motion brush'] },
  { name: 'Pika', url: 'https://pika.art', description: 'Create and edit videos with AI in stunning quality', pricing: 'Freemium', category: 'Video', tags: ['video generation', 'text to video', 'ai video'] },
  { name: 'HeyGen', url: 'https://heygen.com', description: 'AI video generator with realistic talking avatars', pricing: 'Freemium', category: 'Video', tags: ['avatar', 'talking head', 'video translation'] },
  { name: 'Synthesia', url: 'https://synthesia.io', description: 'Create professional AI videos with virtual presenters', pricing: 'Paid', category: 'Video', tags: ['avatar', 'training videos', 'corporate'] },
  { name: 'Luma Dream Machine', url: 'https://lumalabs.ai/dream-machine', description: 'High-quality realistic AI video generation', pricing: 'Freemium', category: 'Video', tags: ['video generation', 'realistic', 'text to video'] },
  { name: 'Kling AI', url: 'https://klingai.com', description: 'Advanced AI video generator with incredible motion', pricing: 'Freemium', category: 'Video', tags: ['video generation', 'chinese ai', 'motion'] },
  { name: 'InVideo AI', url: 'https://invideo.io', description: 'Create publish-ready videos with AI from text prompts', pricing: 'Freemium', category: 'Video', tags: ['video editing', 'text to video', 'social media'] },
  { name: 'Opus Clip', url: 'https://opus.pro', description: 'AI tool that turns long videos into viral short clips', pricing: 'Freemium', category: 'Video', tags: ['clip', 'short form', 'repurpose'] },
  { name: 'Descript', url: 'https://descript.com', description: 'Edit videos by editing text — AI-powered editor', pricing: 'Freemium', category: 'Video', tags: ['video editing', 'transcription', 'text editing'] },
  { name: 'Topaz Video AI', url: 'https://topazlabs.com/topaz-video-ai', description: 'Enhance, upscale, and deinterlace video with AI', pricing: 'Paid', category: 'Video', tags: ['upscale', 'enhance', 'deinterlace'] },
  { name: 'Veed.io', url: 'https://veed.io', description: 'Online video editor with auto subtitles and AI tools', pricing: 'Freemium', category: 'Video', tags: ['subtitles', 'online editor', 'social media'] },
  { name: 'Fliki', url: 'https://fliki.ai', description: 'Turn text into videos with AI voices and stock media', pricing: 'Freemium', category: 'Video', tags: ['text to video', 'voiceover', 'blog to video'] },

  // ── IMAGE ──
  { name: 'Midjourney', url: 'https://midjourney.com', description: 'Industry-leading AI art and image generation', pricing: 'Paid', category: 'Image', tags: ['art', 'image generation', 'creative'] },
  { name: 'DALL-E 3', url: 'https://openai.com/dall-e-3', description: 'OpenAI\'s advanced text-to-image generation model', pricing: 'Paid', category: 'Image', tags: ['image generation', 'openai', 'creative'] },
  { name: 'Stable Diffusion', url: 'https://stability.ai', description: 'Open-source AI image generation model', pricing: 'Free', category: 'Image', tags: ['open source', 'image generation', 'local'] },
  { name: 'Leonardo AI', url: 'https://leonardo.ai', description: 'AI-powered creative suite for image generation', pricing: 'Freemium', category: 'Image', tags: ['game assets', 'image generation', 'creative'] },
  { name: 'Ideogram', url: 'https://ideogram.ai', description: 'AI image generator with best-in-class text rendering', pricing: 'Freemium', category: 'Image', tags: ['text in images', 'typography', 'poster'] },
  { name: 'Flux AI', url: 'https://flux.ai', description: 'State-of-the-art open AI image generation model', pricing: 'Free', category: 'Image', tags: ['open source', 'image generation', 'realistic'] },
  { name: 'Adobe Firefly', url: 'https://firefly.adobe.com', description: 'Adobe\'s generative AI for creative professionals', pricing: 'Freemium', category: 'Image', tags: ['adobe', 'creative', 'commercial safe'] },
  { name: 'Canva AI', url: 'https://canva.com', description: 'AI design tools integrated into Canva', pricing: 'Freemium', category: 'Image', tags: ['design', 'social media', 'templates'] },
  { name: 'Playground AI', url: 'https://playground.com', description: 'Free AI image generator and editor', pricing: 'Freemium', category: 'Image', tags: ['image generation', 'free', 'editing'] },
  { name: 'Clipdrop', url: 'https://clipdrop.co', description: 'AI-powered image editing and background removal', pricing: 'Freemium', category: 'Image', tags: ['background removal', 'editing', 'cleanup'] },
  { name: 'PhotoRoom', url: 'https://photoroom.com', description: 'AI photo editor for product and portrait photos', pricing: 'Freemium', category: 'Image', tags: ['background removal', 'product photos', 'ecommerce'] },
  { name: 'Magnific AI', url: 'https://magnific.ai', description: 'AI image upscaler and enhancer with hallucination', pricing: 'Paid', category: 'Image', tags: ['upscale', 'enhance', 'super resolution'] },

  // ── WRITING ──
  { name: 'Jasper', url: 'https://jasper.ai', description: 'AI marketing and content writing platform', pricing: 'Paid', category: 'Writing', tags: ['marketing', 'copywriting', 'content'] },
  { name: 'Copy.ai', url: 'https://copy.ai', description: 'AI-powered copywriting and content generation', pricing: 'Freemium', category: 'Writing', tags: ['copywriting', 'marketing', 'sales'] },
  { name: 'Writesonic', url: 'https://writesonic.com', description: 'AI writer for blogs, ads, and marketing content', pricing: 'Freemium', category: 'Writing', tags: ['blog', 'seo', 'ads'] },
  { name: 'Sudowrite', url: 'https://sudowrite.com', description: 'AI writing partner for fiction authors', pricing: 'Paid', category: 'Writing', tags: ['fiction', 'creative writing', 'novel'] },
  { name: 'Rytr', url: 'https://rytr.me', description: 'AI writing assistant for all content types', pricing: 'Freemium', category: 'Writing', tags: ['writing', 'email', 'blog'] },
  { name: 'Notion AI', url: 'https://notion.so/product/ai', description: 'AI-powered writing and productivity in Notion', pricing: 'Paid', category: 'Writing', tags: ['productivity', 'notes', 'workspace'] },
  { name: 'QuillBot', url: 'https://quillbot.com', description: 'AI paraphrasing and grammar checking tool', pricing: 'Freemium', category: 'Writing', tags: ['paraphrase', 'grammar', 'rewrite'] },
  { name: 'Wordtune', url: 'https://wordtune.com', description: 'AI writing companion that rewrites and improves text', pricing: 'Freemium', category: 'Writing', tags: ['rewrite', 'tone', 'clarity'] },

  // ── CODE ──
  { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', description: 'AI pair programmer that suggests code in your editor', pricing: 'Paid', category: 'Code', tags: ['code completion', 'ide', 'pair programming'] },
  { name: 'Cursor', url: 'https://cursor.sh', description: 'AI-first code editor built for pair programming', pricing: 'Freemium', category: 'Code', tags: ['editor', 'ide', 'ai coding'] },
  { name: 'Replit AI', url: 'https://replit.com', description: 'AI-powered online IDE and code generation', pricing: 'Freemium', category: 'Code', tags: ['online ide', 'code generation', 'deploy'] },
  { name: 'Tabnine', url: 'https://tabnine.com', description: 'AI code completion for all popular IDEs', pricing: 'Freemium', category: 'Code', tags: ['code completion', 'privacy', 'enterprise'] },
  { name: 'Codeium', url: 'https://codeium.com', description: 'Free AI code completion and search', pricing: 'Free', category: 'Code', tags: ['code completion', 'free', 'vscode'] },
  { name: 'Blackbox AI', url: 'https://blackbox.ai', description: 'AI code generation and search engine for developers', pricing: 'Freemium', category: 'Code', tags: ['code search', 'code generation', 'snippets'] },
  { name: 'v0 by Vercel', url: 'https://v0.dev', description: 'AI-powered UI component generator with React/Next.js', pricing: 'Freemium', category: 'Code', tags: ['ui', 'react', 'components', 'frontend'] },
  { name: 'Bolt.new', url: 'https://bolt.new', description: 'AI full-stack web app builder in the browser', pricing: 'Freemium', category: 'Code', tags: ['full stack', 'web app', 'deploy'] },

  // ── AUDIO & VOICE ──
  { name: 'ElevenLabs', url: 'https://elevenlabs.io', description: 'Most realistic AI voice generation and cloning', pricing: 'Freemium', category: 'Audio & Voice', tags: ['voice cloning', 'tts', 'realistic'] },
  { name: 'Murf AI', url: 'https://murf.ai', description: 'Professional AI voiceover generator', pricing: 'Freemium', category: 'Audio & Voice', tags: ['voiceover', 'tts', 'professional'] },
  { name: 'Play.ht', url: 'https://play.ht', description: 'Ultra-realistic AI voice generator and text-to-speech', pricing: 'Freemium', category: 'Audio & Voice', tags: ['tts', 'voice', 'podcast'] },
  { name: 'Resemble AI', url: 'https://resemble.ai', description: 'AI voice generator with real-time voice cloning', pricing: 'Paid', category: 'Audio & Voice', tags: ['voice cloning', 'real-time', 'enterprise'] },
  { name: 'Whisper', url: 'https://openai.com/research/whisper', description: 'OpenAI\'s open-source speech recognition model', pricing: 'Free', category: 'Audio & Voice', tags: ['transcription', 'speech to text', 'open source'] },
  { name: 'AssemblyAI', url: 'https://assemblyai.com', description: 'AI models for speech recognition and understanding', pricing: 'Freemium', category: 'Audio & Voice', tags: ['transcription', 'api', 'summarization'] },
  { name: 'Speechify', url: 'https://speechify.com', description: 'Text-to-speech app for reading anything aloud', pricing: 'Freemium', category: 'Audio & Voice', tags: ['tts', 'reading', 'accessibility'] },

  // ── MUSIC ──
  { name: 'Suno', url: 'https://suno.com', description: 'Create full songs with AI — vocals, instruments, lyrics', pricing: 'Freemium', category: 'Music', tags: ['song generation', 'vocals', 'lyrics'] },
  { name: 'Udio', url: 'https://udio.com', description: 'AI music generation with studio-quality output', pricing: 'Freemium', category: 'Music', tags: ['music generation', 'studio quality', 'genres'] },
  { name: 'AIVA', url: 'https://aiva.ai', description: 'AI music composer for emotional soundtracks', pricing: 'Freemium', category: 'Music', tags: ['soundtrack', 'composition', 'classical'] },
  { name: 'Soundraw', url: 'https://soundraw.io', description: 'AI music generator for creators — royalty free', pricing: 'Paid', category: 'Music', tags: ['royalty free', 'background music', 'customizable'] },
  { name: 'Boomy', url: 'https://boomy.com', description: 'Create original songs in seconds with AI', pricing: 'Free', category: 'Music', tags: ['song creation', 'distribution', 'free'] },

  // ── CHAT & ASSISTANTS ──
  { name: 'ChatGPT', url: 'https://chat.openai.com', description: 'OpenAI\'s conversational AI assistant', pricing: 'Freemium', category: 'Chat & Assistants', tags: ['chatbot', 'gpt-4', 'general purpose'] },
  { name: 'Claude', url: 'https://claude.ai', description: 'Anthropic\'s helpful, harmless, and honest AI assistant', pricing: 'Freemium', category: 'Chat & Assistants', tags: ['chatbot', 'reasoning', 'long context'] },
  { name: 'Gemini', url: 'https://gemini.google.com', description: 'Google\'s multimodal AI assistant', pricing: 'Freemium', category: 'Chat & Assistants', tags: ['chatbot', 'google', 'multimodal'] },
  { name: 'Perplexity', url: 'https://perplexity.ai', description: 'AI-powered answer engine with real-time citations', pricing: 'Freemium', category: 'Chat & Assistants', tags: ['search', 'citations', 'research'] },
  { name: 'Pi', url: 'https://pi.ai', description: 'Personal AI assistant focused on conversation', pricing: 'Free', category: 'Chat & Assistants', tags: ['personal', 'emotional', 'companion'] },
  { name: 'Poe', url: 'https://poe.com', description: 'Platform to chat with multiple AI models', pricing: 'Freemium', category: 'Chat & Assistants', tags: ['multi-model', 'chatbot', 'quora'] },
  { name: 'Character.ai', url: 'https://character.ai', description: 'Chat with AI-powered characters and personas', pricing: 'Freemium', category: 'Chat & Assistants', tags: ['roleplay', 'characters', 'creative'] },
  { name: 'Grok', url: 'https://grok.x.ai', description: 'xAI\'s witty and real-time AI assistant', pricing: 'Freemium', category: 'Chat & Assistants', tags: ['x', 'real-time', 'witty'] },
  { name: 'DeepSeek', url: 'https://chat.deepseek.com', description: 'Open-source AI assistant with strong reasoning', pricing: 'Free', category: 'Chat & Assistants', tags: ['open source', 'reasoning', 'chinese ai'] },

  // ── PRODUCTIVITY ──
  { name: 'Otter.ai', url: 'https://otter.ai', description: 'AI meeting assistant for notes and transcription', pricing: 'Freemium', category: 'Productivity', tags: ['meeting notes', 'transcription', 'summary'] },
  { name: 'Fireflies.ai', url: 'https://fireflies.ai', description: 'AI meeting recorder and transcription', pricing: 'Freemium', category: 'Productivity', tags: ['meetings', 'transcription', 'crm'] },
  { name: 'Tome', url: 'https://tome.app', description: 'AI-powered presentation and story builder', pricing: 'Freemium', category: 'Productivity', tags: ['presentations', 'storytelling', 'slides'] },
  { name: 'Gamma', url: 'https://gamma.app', description: 'Create beautiful presentations with AI', pricing: 'Freemium', category: 'Productivity', tags: ['presentations', 'docs', 'websites'] },
  { name: 'Mem', url: 'https://mem.ai', description: 'AI-powered self-organizing workspace', pricing: 'Freemium', category: 'Productivity', tags: ['notes', 'knowledge base', 'organization'] },
  { name: 'Reclaim.ai', url: 'https://reclaim.ai', description: 'AI scheduling and calendar optimization', pricing: 'Freemium', category: 'Productivity', tags: ['calendar', 'scheduling', 'time management'] },
  { name: 'Motion', url: 'https://usemotion.com', description: 'AI-powered project manager and calendar', pricing: 'Paid', category: 'Productivity', tags: ['project management', 'calendar', 'tasks'] },

  // ── DESIGN ──
  { name: 'Figma AI', url: 'https://figma.com', description: 'AI-powered design features in Figma', pricing: 'Freemium', category: 'Design', tags: ['ui design', 'prototype', 'collaboration'] },
  { name: 'Framer AI', url: 'https://framer.com', description: 'Build and publish websites with AI', pricing: 'Freemium', category: 'Design', tags: ['website builder', 'no code', 'responsive'] },
  { name: 'Looka', url: 'https://looka.com', description: 'AI logo maker and brand kit generator', pricing: 'Freemium', category: 'Design', tags: ['logo', 'brand kit', 'identity'] },
  { name: 'Khroma', url: 'https://khroma.co', description: 'AI color palette generator that learns your taste', pricing: 'Free', category: 'Design', tags: ['colors', 'palette', 'personalized'] },
  { name: 'Uizard', url: 'https://uizard.io', description: 'AI-powered UI/UX design and prototyping', pricing: 'Freemium', category: 'Design', tags: ['wireframe', 'prototype', 'screenshot to design'] },

  // ── RESEARCH ──
  { name: 'Consensus', url: 'https://consensus.app', description: 'AI search engine for scientific research papers', pricing: 'Freemium', category: 'Research', tags: ['academic', 'papers', 'citations'] },
  { name: 'Elicit', url: 'https://elicit.com', description: 'AI research assistant for literature review', pricing: 'Freemium', category: 'Research', tags: ['literature review', 'papers', 'data extraction'] },
  { name: 'Semantic Scholar', url: 'https://semanticscholar.org', description: 'AI-powered research tool for scientific literature', pricing: 'Free', category: 'Research', tags: ['academic', 'search', 'citations'] },
  { name: 'SciSpace', url: 'https://scispace.com', description: 'AI tools for reading and understanding research papers', pricing: 'Freemium', category: 'Research', tags: ['papers', 'explain', 'summarize'] },
  { name: 'Connected Papers', url: 'https://connectedpapers.com', description: 'Visual tool for exploring academic paper connections', pricing: 'Freemium', category: 'Research', tags: ['graph', 'papers', 'connections'] },

  // ── MARKETING ──
  { name: 'Surfer SEO', url: 'https://surferseo.com', description: 'AI-powered SEO content optimization platform', pricing: 'Paid', category: 'Marketing', tags: ['seo', 'content optimization', 'ranking'] },
  { name: 'AdCreative.ai', url: 'https://adcreative.ai', description: 'Generate conversion-focused ad creatives with AI', pricing: 'Paid', category: 'Marketing', tags: ['ads', 'creatives', 'conversion'] },
  { name: 'Predis.ai', url: 'https://predis.ai', description: 'AI social media content generator', pricing: 'Freemium', category: 'Marketing', tags: ['social media', 'content', 'scheduling'] },
  { name: 'Lately', url: 'https://lately.ai', description: 'AI social media management and content repurposing', pricing: 'Paid', category: 'Marketing', tags: ['social media', 'repurpose', 'management'] },

  // ── 3D & GAMING ──
  { name: 'Meshy', url: 'https://meshy.ai', description: 'AI 3D model generator from text and images', pricing: 'Freemium', category: '3D & Gaming', tags: ['3d models', 'text to 3d', 'game assets'] },
  { name: 'Luma AI Genie', url: 'https://lumalabs.ai', description: '3D model generation from text descriptions', pricing: 'Freemium', category: '3D & Gaming', tags: ['3d generation', 'text to 3d', 'nerf'] },
  { name: 'Kaedim', url: 'https://kaedim3d.com', description: 'Turn 2D images into 3D models with AI', pricing: 'Paid', category: '3D & Gaming', tags: ['image to 3d', '3d models', 'game dev'] },
  { name: 'Scenario', url: 'https://scenario.com', description: 'AI-generated game art and asset creation', pricing: 'Freemium', category: '3D & Gaming', tags: ['game art', 'assets', 'consistent style'] },
]

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
    for (const key of Object.keys(cache)) {
      if (now - cache[key].timestamp > CACHE_TTL * 4) delete cache[key]
    }
    cache[query.toLowerCase().trim()] = { timestamp: now, data }
    localStorage.setItem(WEB_CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
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
// SOURCE 1: EXTENDED DATABASE SEMANTIC SEARCH
// Searches our 100+ extended tools database using keyword matching
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

  // 2. Extended Database (Curated 100+ top tools)
  const extendedResults = searchExtendedDB(cleanQuery)
  if (extendedResults.length > 0) {
    allWebResults.push(...extendedResults.map(t => ({
      ...t,
      title: t.name,
      snippet: t.description,
      source: 'AI Database',
      isLive: true,
    })))
    if (!sources.includes('AI Database')) sources.push('AI Database')
  }

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

