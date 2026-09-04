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
import { PlusIcon, GlobeIcon, SparklesIcon, TrophyIcon } from './components/icons.jsx'
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

  // Filter web only tab in results view
  const [filterWebOnly, setFilterWebOnly] = useState(false)

  // User-submitted custom tools (saved in localStorage)
  const [userTools, setUserTools] = useState(() => {
    try {
      const saved = localStorage.getItem('aoogle_user_tools')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Save userTools to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('aoogle_user_tools', JSON.stringify(userTools))
    } catch (e) {
      console.error('Failed to save custom tool:', e)
    }
  }, [userTools])

  // Combine builtin tools + userTools
  const allTools = useMemo(() => {
    return [...userTools, ...TOOLS]
  }, [userTools])

  // Search index built over allTools
  const searchIndex = useMemo(() => createSearchIndex(allTools), [allTools])

  // Ref to search input
  const inputRef = useRef(null)

  // Theme effect
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

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    return getAutocompleteSuggestions(searchIndex, query)
  }, [searchIndex, query])

  // Pricing counts for the active query and category
  const pricingCounts = useMemo(() => {
    const counts = { All: 0, Free: 0, Freemium: 0, Paid: 0 }
    for (const p of PRICING_TIERS) {
      counts[p] = searchTools({
        searchIndex,
        tools: allTools,
        query: activeQuery,
        category,
        pricing: p,
      }).length
    }
    counts.All = counts.Free + counts.Freemium + counts.Paid
    return counts
  }, [searchIndex, allTools, activeQuery, category])

  // Results for current query + category + pricing
  const results = useMemo(() => {
    if (view !== 'results') return []
    return searchTools({
      searchIndex,
      tools: allTools,
      query: activeQuery,
      category,
      pricing,
    })
  }, [searchIndex, allTools, activeQuery, category, pricing, view])

  // All results for current query across all pricing tiers (for AI decision guide)
  const allCategoryResults = useMemo(() => {
    if (view !== 'results') return []
    return searchTools({
      searchIndex,
      tools: allTools,
      query: activeQuery,
      category: 'All',
      pricing: 'All',
    })
  }, [searchIndex, allTools, activeQuery, view])

  // ---- Real-Time Web Search Effect ----
  useEffect(() => {
    if (!activeQuery || activeQuery.trim().length < 2) {
      setWebResults({ tools: [], sources: [] })
      setWebLoading(false)
      return
    }

    let isMounted = true
    setWebLoading(true)

    fetchLiveWebResults(activeQuery, allTools)
      .then((data) => {
        if (isMounted) {
          setWebResults(data)
          setWebLoading(false)
        }
      })
      .catch((err) => {
        console.error('Web search error:', err)
        if (isMounted) {
          setWebResults({ tools: [], sources: [] })
          setWebLoading(false)
        }
      })

    return () => {
      isMounted = false
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
    const text = s.type === 'tool' ? s.tool.name : s.text
    setQuery(text)
    setActiveQuery(text)
    setCategory('All')
    setPricing('All')
    setFilterWebOnly(false)
    setView('results')
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
        {/* Top bar: Status & Actions */}
        <header className="home__top-bar">
          <div className="home__live-badge">
            <span className="home__live-dot" />
            <span>Live Internet AI Engine</span>
          </div>

          <div className="home__top-actions">
            <button
              type="button"
              className="btn-submit-tool"
              onClick={() => setIsSubmitModalOpen(true)}
              title="Submit a new AI tool"
            >
              <PlusIcon width={14} height={14} />
              <span>Submit AI Tool</span>
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Top spacer pushes logo block nicely */}
        <div className="home__spacer" />

        {/* Center block — hero + logo + search + meta badges */}
        <div className="home__center">
          <div className="home__hero-pill">
            <SparklesIcon width={12} height={12} className="home__hero-pill-icon" />
            <span>Search 200+ Indexed Tools & Real-Time Web</span>
          </div>

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

          <p className="home__hero-subtitle">
            The intelligent AI search engine finding the right tool for any task
          </p>

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

          {/* Unified horizontal feature meta bar */}
          <div className="home__meta-bar">
            <div className="home__meta-item">
              <GlobeIcon width={12} height={12} className="home__meta-icon--green" />
              <span>Live Web Search</span>
            </div>
            <span className="home__meta-sep">•</span>
            <div className="home__meta-item">
              <SparklesIcon width={12} height={12} className="home__meta-icon--purple" />
              <span>{allTools.length}+ Tools Indexed</span>
            </div>
            <span className="home__meta-sep">•</span>
            <div className="home__meta-item">
              <TrophyIcon width={12} height={12} className="home__meta-icon--gold" />
              <span>AI Decision Engine</span>
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
