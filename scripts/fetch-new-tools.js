/**
 * Aoogle Automated AI Tools Ingestion Script
 *
 * Runs automatically via GitHub Actions (or manually via `node scripts/fetch-new-tools.js`).
 * Queries open developer APIs (HuggingFace Spaces, GitHub AI repositories) to discover
 * new AI tools, normalizes their metadata, and appends unique tools to `src/data/tools.js`.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const toolsFilePath = path.resolve(__dirname, '../src/data/tools.js')

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function detectCategory(name, desc) {
  const text = `${name} ${desc}`.toLowerCase()
  if (text.includes('music') || text.includes('song') || text.includes('audio track') || text.includes('soundtrack')) return 'Music'
  if (text.includes('video') || text.includes('animation') || text.includes('clip') || text.includes('avatar') || text.includes('lip sync')) return 'Video'
  if (text.includes('3d') || text.includes('mesh') || text.includes('game') || text.includes('spline')) return '3D & Gaming'
  if (text.includes('code') || text.includes('developer') || text.includes('terminal') || text.includes('ide') || text.includes('programming') || text.includes('compiler')) return 'Code'
  if (text.includes('voice') || text.includes('speech') || text.includes('audio') || text.includes('transcribe') || text.includes('sound')) return 'Audio & Voice'
  if (text.includes('image') || text.includes('photo') || text.includes('drawing') || text.includes('art') || text.includes('sketch')) return 'Image'
  if (text.includes('meeting') || text.includes('transcription') || text.includes('call notes')) return 'Meetings'
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('wireframe') || text.includes('figma')) return 'Design'
  if (text.includes('paper') || text.includes('scientific') || text.includes('academic') || text.includes('research') || text.includes('pdf')) return 'Research'
  if (text.includes('write') || text.includes('copy') || text.includes('article') || text.includes('essay') || text.includes('paraphrase')) return 'Writing'
  if (text.includes('translate') || text.includes('translation') || text.includes('language')) return 'Translation'
  if (text.includes('slide') || text.includes('presentation') || text.includes('pitch deck')) return 'Presentations'
  if (text.includes('agent') || text.includes('workflow') || text.includes('productivity') || text.includes('automate') || text.includes('task')) return 'Productivity'
  return 'Chat & Assistants'
}

function extractTags(name, desc, category) {
  const text = `${name} ${desc}`.toLowerCase()
  const candidateKeywords = [
    'text to image', 'image editing', 'ai art', 'photorealism',
    'text to video', 'video editing', 'ai film', 'animation',
    'text to speech', 'voice clone', 'voice generator', 'transcription',
    'ai music', 'generate song', 'background music',
    'ai code editor', 'copilot', 'autocomplete', 'debugging', 'react', 'python',
    'text to 3d', '3d modeling', 'game assets',
    'literature review', 'pdf summary', 'research paper', 'data analysis',
    'autonomous agent', 'automation', 'workflow',
    'slide deck', 'presentation', 'website builder', 'ui design', 'figma',
    'translation', 'grammar checker', 'paraphrasing',
  ]

  const matched = candidateKeywords.filter((kw) => text.includes(kw))
  if (matched.length === 0) {
    matched.push(category.toLowerCase(), name.toLowerCase().slice(0, 20))
  }
  return Array.from(new Set(matched)).slice(0, 6)
}

async function fetchHuggingFaceSpaces() {
  try {
    const res = await fetch('https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=25', {
      headers: { 'User-Agent': 'Aoogle-Crawler' },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data
      .filter((item) => item.id && item.author)
      .map((item) => {
        const rawName = item.id.split('/')[1] || item.id
        const formattedName = rawName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        const desc = item.cardData?.title || `Popular open-source AI space by ${item.author}.`
        const category = detectCategory(formattedName, desc)
        return {
          id: slugify(item.id),
          name: formattedName,
          url: `https://huggingface.co/spaces/${item.id}`,
          category,
          pricing: 'Free',
          description: desc.slice(0, 140),
          tags: extractTags(formattedName, desc, category),
          isAutoDiscovered: true,
        }
      })
  } catch (err) {
    console.warn('[HuggingFace Fetch Skipped]:', err.message)
    return []
  }
}

async function fetchGitHubTrending() {
  try {
    const res = await fetch('https://api.github.com/search/repositories?q=topic:ai+topic:llm+stars:>1000&sort=stars&order=desc&per_page=25', {
      headers: { 'User-Agent': 'Aoogle-Crawler' },
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!data.items) return []
    return data.items.map((repo) => {
      const name = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      const desc = repo.description || 'Open-source AI tool and repository.'
      const category = detectCategory(name, desc)
      return {
        id: slugify(repo.full_name),
        name,
        url: repo.html_url,
        category,
        pricing: 'Free',
        description: desc.slice(0, 140),
        tags: extractTags(name, desc, category),
        isAutoDiscovered: true,
      }
    })
  } catch (err) {
    console.warn('[GitHub Fetch Skipped]:', err.message)
    return []
  }
}

async function main() {
  console.log('🚀 [Aoogle Auto-Crawler] Starting discovery for new AI tools...')

  if (!fs.existsSync(toolsFilePath)) {
    console.error('❌ Cannot find tools.js at:', toolsFilePath)
    process.exit(1)
  }

  const content = fs.readFileSync(toolsFilePath, 'utf8')

  // Find existing IDs and URLs to avoid duplicates
  const existingIds = new Set()
  const existingUrls = new Set()

  const idMatches = content.matchAll(/id:\s*['"]([^'"]+)['"]/g)
  for (const m of idMatches) existingIds.add(m[1].toLowerCase())

  const urlMatches = content.matchAll(/url:\s*['"]([^'"]+)['"]/g)
  for (const m of urlMatches) {
    try {
      const parsed = new URL(m[1])
      existingUrls.add((parsed.hostname + parsed.pathname).toLowerCase().replace(/\/$/, ''))
    } catch {
      existingUrls.add(m[1].toLowerCase())
    }
  }

  console.log(`📊 Found ${existingIds.size} existing tools in index.`)

  // Fetch from multiple sources concurrently
  const [hfTools, ghTools] = await Promise.all([
    fetchHuggingFaceSpaces(),
    fetchGitHubTrending(),
  ])

  const candidates = [...hfTools, ...ghTools]
  const newTools = []

  for (const tool of candidates) {
    let cleanUrlKey = tool.url
    try {
      const u = new URL(tool.url)
      cleanUrlKey = (u.hostname + u.pathname).toLowerCase().replace(/\/$/, '')
    } catch {}

    if (!existingIds.has(tool.id.toLowerCase()) && !existingUrls.has(cleanUrlKey)) {
      existingIds.add(tool.id.toLowerCase())
      existingUrls.add(cleanUrlKey)
      newTools.push(tool)
    }
  }

  if (newTools.length === 0) {
    console.log('✅ Index is already completely up to date! No new tools to append today.')
    return
  }

  console.log(`✨ Discovered ${newTools.length} brand new AI tools to add!`)

  // Prepare code strings to append before the closing `]` of TOOLS array
  const formattedNewTools = newTools
    .map((t) => {
      const tagsStr = JSON.stringify(t.tags)
      const cleanDesc = t.description.replace(/'/g, "\\'")
      return `  { id: '${t.id}', name: '${t.name}', url: '${t.url}', category: '${t.category}', pricing: '${t.pricing}', description: '${cleanDesc}', tags: ${tagsStr}, isAutoDiscovered: true },`
    })
    .join('\n')

  const lastBracketIndex = content.lastIndexOf(']')
  if (lastBracketIndex === -1) {
    console.error('❌ Could not find closing bracket in tools.js')
    process.exit(1)
  }

  const updatedContent =
    content.slice(0, lastBracketIndex) +
    `  // ---------- Auto-Discovered (${new Date().toISOString().split('T')[0]}) ----------\n` +
    formattedNewTools +
    '\n' +
    content.slice(lastBracketIndex)

  fs.writeFileSync(toolsFilePath, updatedContent, 'utf8')
  console.log(`🎉 Successfully appended ${newTools.length} new tools to src/data/tools.js!`)
}

main().catch((err) => {
  console.error('❌ Crawler error:', err)
  process.exit(0) // Exit with 0 so workflow doesn't fail on transient network issues
})
