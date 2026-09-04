import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import SearchHeader from './components/SearchHeader.jsx'
import TrendingChips from './components/TrendingChips.jsx'
import CategoryIcons from './components/CategoryIcons.jsx'
import ResultCard from './components/ResultCard.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import SubmitToolModal from './components/SubmitToolModal.jsx'
import AiDecisionGuide from './components/AiDecisionGuide.jsx'
import WebSearchResults from './components/WebSearchResults.jsx'
import { PlusIcon } from './components/icons.jsx'
import { PRICING_TIERS, TOOLS } from './data/tools.js'
import { createSearchIndex, searchTools, getAutocompleteSuggestions } from './lib/search.js'
import { fetchLiveWebResults } from './lib/webSearch.js'

function App() {
  const [view, setView] = useState('home')         // 'home' | 'results'
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('') // the query that was actually searched
  const [category, setCategory] = useState('All')
  const [pricing, setPricing] = useState('All')
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  // Real-time web search state
  const [webResults, setWebResults] = useState({ tools: [], sources: [] })
  const [webLoading, setWebLoading] = useState(false)

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aoogle_theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })
  const [userTools, setUserTools] = useState(() => {
    try {
      const saved = localStorage.getItem('aoogle_user_tools')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const inputRef = useRef(null)
  const webSearchAbortRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('aoogle_theme', theme)
  }, [theme])

  useEffect(() => {
    if (view === 'results' && activeQuery) {
      document.title = `${activeQuery} — aoogle`
    } else {
      document.title = 'aoogle — find the right AI tool'
    }
  }, [view, activeQuery])

  useEffect(() => {
    try {
      localStorage.setItem('aoogle_user_tools', JSON.stringify(userTools))
    } catch (e) {
      console.error('Failed to save custom tools to localStorage', e)
    }
  }, [userTools])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // Combine user-submitted tools with default dataset (user tools first so they show up prominently)
  const allTools = useMemo(() => [...userTools, ...TOOLS], [userTools])

  // Build search index whenever allTools changes
  const searchIndex = useMemo(() => createSearchIndex(allTools), [allTools])

  // Autocomplete suggestions (live as user types)
  const suggestions = useMemo(
    () => getAutocompleteSuggestions(searchIndex, query),
    [searchIndex, query],
  )

  // Search results matching query (before pricing filter, to compute counts)
  const allCategoryResults = useMemo(
    () => searchTools({ searchIndex, tools: allTools, query: activeQuery, category, pricing: 'All' }),
    [searchIndex, allTools, activeQuery, category],
  )

  // Pricing counts for the active query
  const pricingCounts = useMemo(() => {
    const counts = { All: allCategoryResults.length, Free: 0, Freemium: 0, Paid: 0 }
    allCategoryResults.forEach((t) => {
      const p = t.pricing || 'Free'
      if (counts[p] !== undefined) {
        counts[p]++
      }
    })
    return counts
  }, [allCategoryResults])

  // Filtered results based on selected pricing
  const results = useMemo(() => {
    if (pricing === 'All') return allCategoryResults
    return allCategoryResults.filter((t) => t.pricing?.toLowerCase() === pricing.toLowerCase())
  }, [allCategoryResults, pricing])

  // ---- Real-time web search — fires when activeQuery changes ----
  useEffect(() => {
    if (!activeQuery || activeQuery.trim().length < 2) {
      setWebResults({ tools: [], sources: [] })
      setWebLoading(false)
      return
    }

    let cancelled = false
    setWebLoading(true)

    // Cancel previous in-flight request
    if (webSearchAbortRef.current) {
      webSearchAbortRef.current.cancelled = true
    }
    const thisRequest = { cancelled: false }
    webSearchAbortRef.current = thisRequest

    fetchLiveWebResults(activeQuery, allTools)
      .then((data) => {
        if (!thisRequest.cancelled && !cancelled) {
          setWebResults(data)
          setWebLoading(false)
        }
      })
      .catch(() => {
        if (!thisRequest.cancelled && !cancelled) {
          setWebResults({ tools: [], sources: [] })
          setWebLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeQuery, allTools])

  // ---- Actions ----

  function handleAddTool(newTool) {
    setUserTools((prev) => [newTool, ...prev])
  }

  function handleDeleteUserTool(id) {
    setUserTools((prev) => prev.filter((t) => t.id !== id))
  }

  function handleSearchNewTool(toolName) {
    setQuery(toolName)
    setActiveQuery(toolName)
    setCategory('All')
    setPricing('All')
    setFilterWebOnly(false)
    setView('results')
  }

  const performSearch = useCallback((mode) => {
    const q = query.trim()
    if (!q) return

    setActiveQuery(q)
    setPricing('All')
    setFilterWebOnly(false)
    setView('results')

    // "I'm Feeling Lucky" — navigate to first result
    if (mode === 'lucky') {
      const first = searchTools({ searchIndex, tools: allTools, query: q, category: 'All', pricing: 'All' })
      if (first.length > 0) {
        window.open(first[0].url, '_blank', 'noopener,noreferrer')
        return
      }
    }
  }, [query, searchIndex, allTools])

  const goHome = useCallback(() => {
    setView('home')
    setQuery('')
    setActiveQuery('')
    setCategory('All')
    setPricing('All')
    setFilterWebOnly(false)
    setWebResults({ tools: [], sources: [] })
    setWebLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  function handleChipPick(text) {
    setQuery(text)
    setActiveQuery(text)
    setCategory('All')
    setPricing('All')
    setFilterWebOnly(false)
    setView('results')
  }

  function handleCategoryPick(cat) {
    setCategory(cat)
    setPricing('All')
    setFilterWebOnly(false)
    setQuery('')
    setActiveQuery('')
    setView('results')
  }

  function handleSuggestionPick(s) {
    if (s.type === 'tool') {
      setQuery(s.tool.name)
      setActiveQuery(s.tool.name)
      setCategory('All')
      setPricing('All')
      setFilterWebOnly(false)
      setView('results')
    } else {
      setQuery(s.text)
      setActiveQuery(s.text)
      setCategory('All')
      setPricing('All')
      setFilterWebOnly(false)
      setView('results')
    }
  }

  // ---- Keyboard shortcut: "/" to focus search ----
  useEffect(() => {
    function handleGlobalKey(e) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && view === 'results' && !isSubmitModalOpen) {
        goHome()
      }
    }
    document.addEventListener('keydown', handleGlobalKey)
    return () => document.removeEventListener('keydown', handleGlobalKey)
  }, [view, goHome, isSubmitModalOpen])

  // ---- HOME VIEW ----
  if (view === 'home') {
    return (
      <div className="home">
        {/* Top bar: Submit tool & Theme toggle */}
        <div className="home__top-bar">
          <button
            type="button"
            className="btn-submit-tool"
            onClick={() => setIsSubmitModalOpen(true)}
            title="Submit a new AI tool"
          >
            <PlusIcon width={15} height={15} />
            <span>Submit AI Tool</span>
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        {/* Top spacer pushes logo block to ~35% from top */}
        <div className="home__spacer" />

        {/* Center block — logo + search + tags */}
        <div className="home__center">
          <h1
            className="logo logo--animated"
            onClick={goHome}
            title="Aoogle — Find the right AI tool"
            aria-label="Aoogle"
          >
            <span className="logo__letter-a">a</span>
            <span className="logo__rest">
              <span className="logo__char" style={{ '--i': 0 }}>o</span>
              <span className="logo__char" style={{ '--i': 1 }}>o</span>
              <span className="logo__char" style={{ '--i': 2 }}>g</span>
              <span className="logo__char" style={{ '--i': 3 }}>l</span>
              <span className="logo__char" style={{ '--i': 4 }}>e</span>
            </span>
            <span className="logo__dot" aria-hidden="true" />
          </h1>

          <SearchBar
            large
            value={query}
            onChange={setQuery}
            onSearch={performSearch}
            inputRef={inputRef}
            suggestions={suggestions}
            onSuggestionPick={handleSuggestionPick}
          />

          <div className="search-buttons">
            <button
              type="button"
              className="search-buttons__btn search-buttons__btn--primary"
              onClick={() => performSearch()}
            >
              Aoogle Search
            </button>
            <button
              type="button"
              className="search-buttons__btn search-buttons__btn--secondary"
              onClick={() => performSearch('lucky')}
            >
              I'm Feeling Lucky
            </button>
          </div>

          <div className="home__search-badges">
            <div className="home__badge">
              <span className="home__badge-dot" />
              <span>Entire Internet Search</span>
            </div>
            <div className="home__badge-sep">•</div>
            <div className="home__badge">
              <span>{allTools.length}+ Tools Indexed</span>
            </div>
            <div className="home__badge-sep">•</div>
            <div className="home__badge">
              <span>Find Any AI Tool</span>
            </div>
          </div>
        </div>

        <TrendingChips onPick={handleChipPick} />
        <CategoryIcons onCategoryPick={handleCategoryPick} />

        {/* Bottom spacer pushes footer down */}
        <div className="home__bottom-spacer" />

        <footer className="home__footer">
          <p>
            {allTools.length} tools indexed + entire internet · Powered by AI + Live Web Search
            {userTools.length > 0 && ` · ${userTools.length} community tools`} · Built by Yohesh
          </p>
        </footer>

        <SubmitToolModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmitTool={handleAddTool}
          onSearchTool={handleSearchNewTool}
        />
      </div>
    )
  }

  // ---- RESULTS VIEW (Google / Perplexity Style) ----
  const displayedTools = filterWebOnly ? webResults.tools : results

  return (
    <div className="results-view">
      <SearchHeader
        query={query}
        onQueryChange={setQuery}
        onSearch={performSearch}
        onGoHome={goHome}
        inputRef={inputRef}
        suggestions={suggestions}
        onSuggestionPick={handleSuggestionPick}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        pricing={pricing}
        onPricingChange={(p) => {
          setPricing(p)
          setFilterWebOnly(false)
        }}
        pricingCounts={pricingCounts}
        webCount={webResults.tools.length}
        filterWebOnly={filterWebOnly}
        onToggleWebOnly={setFilterWebOnly}
        totalFound={filterWebOnly ? webResults.tools.length : results.length + webResults.tools.length}
      />

      <div className="results-container">
        <main className="results-main">
          {/* Live Web Discoveries Shelf (shown at top of All tab when web results exist) */}
          {!filterWebOnly && pricing === 'All' && activeQuery && (
            <WebSearchResults
              webTools={webResults.tools}
              sources={webResults.sources}
              loading={webLoading}
              query={activeQuery}
            />
          )}

          {/* Results Feed Title / Status */}
          <div className="results-meta-bar">
            <h2 className="results-meta-bar__title">
              {filterWebOnly
                ? `Discovered on the Live Web (${webResults.tools.length})`
                : pricing !== 'All'
                  ? `${pricing} AI Tools (${results.length})`
                  : `Search Results (${results.length})`}
            </h2>
            {activeQuery && (
              <span className="results-meta-bar__query">
                for "<strong>{activeQuery}</strong>"
              </span>
            )}
          </div>

          {displayedTools.length > 0 ? (
            <div className="results-list">
              {displayedTools.map((tool, i) => (
                <ResultCard
                  key={tool.id || i}
                  tool={tool}
                  index={i}
                  onDelete={handleDeleteUserTool}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2 className="empty-state__title">
                {filterWebOnly
                  ? 'Searching the web for tools...'
                  : pricing !== 'All'
                    ? `No ${pricing} tools found`
                    : 'No tools match that yet'}
              </h2>
              <p className="empty-state__text">
                {filterWebOnly
                  ? 'Live search is querying internet sources. Please wait a moment.'
                  : pricing !== 'All'
                    ? `There are no ${pricing} tools matching "${activeQuery}". Switch back to All or check out another pricing tier.`
                    : webLoading
                      ? 'Searching the web for new tools...'
                      : webResults.tools.length > 0
                        ? `Found ${webResults.tools.length} tools from the web above!`
                        : 'Try a broader phrase, different category, or register this tool!'}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setPricing('All')
                    setFilterWebOnly(false)
                  }}
                >
                  Show All Tools ({pricingCounts.All})
                </button>
                <button
                  type="button"
                  className="empty-state__btn"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  <PlusIcon width={16} height={16} />
                  Submit a Tool
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: AI Smart Overview (Desktop Sticky, Mobile Accordion) */}
        {activeQuery && (
          <aside className="results-sidebar">
            <AiDecisionGuide
              query={activeQuery}
              matchingTools={allCategoryResults}
            />
          </aside>
        )}
      </div>

      <footer className="footer">
        <p>
          {allTools.length} indexed + entire internet search · Built by Yohesh
        </p>
      </footer>

      <SubmitToolModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitTool={handleAddTool}
        onSearchTool={handleSearchNewTool}
      />
    </div>
  )
}

export default App
