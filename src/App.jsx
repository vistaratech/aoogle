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
import { PlusIcon, ArrowUpIcon } from './components/icons.jsx'
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
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    setView('results')
  }

  const performSearch = useCallback((mode) => {
    const q = query.trim()
    if (!q) return

    setActiveQuery(q)
    setPricing('All')
    setView('results')
    window.scrollTo({ top: 0, behavior: 'instant' })

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
    setWebResults({ tools: [], sources: [] })
    setWebLoading(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  function handleChipPick(task) {
    setQuery(task)
    setActiveQuery(task)
    setPricing('All')
    setView('results')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function handleCategoryPick(cat) {
    setCategory(cat)
    setActiveQuery('')  // show all tools in that category
    setPricing('All')
    setView('results')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function handleSuggestionPick(suggestion) {
    if (suggestion.type === 'tool' && suggestion.tool) {
      setQuery(suggestion.tool.name)
      setActiveQuery(suggestion.tool.name)
    } else {
      setQuery(suggestion.text)
      setActiveQuery(suggestion.text)
    }
    setPricing('All')
    setView('results')
    window.scrollTo({ top: 0, behavior: 'instant' })
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
        <header className="home__top-bar">
          <button
            type="button"
            className="btn-submit-tool"
            onClick={() => setIsSubmitModalOpen(true)}
            title="Register your custom AI tool"
          >
            <PlusIcon width={16} height={16} />
            <span>Submit AI Tool</span>
          </button>

          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        {/* Spacer to push content to ~35% from top like Google */}
        <div className="home__spacer" />

        <main className="home__content">
          <div className="home__center">
            <h1
              className="logo"
              onClick={() => inputRef.current?.focus()}
              role="banner"
            >
              aoogle<span className="logo__dot" aria-hidden="true" />
            </h1>

            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={performSearch}
              inputRef={inputRef}
              suggestions={suggestions}
              onSuggestionPick={handleSuggestionPick}
              large
              showButtons
              showKbd
            />

            {/* Feature badges — compact inline below search */}
            <div className="home__badges">
              <div className="home-badge home-badge--globe">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span>Searches Entire Internet</span>
              </div>
              <div className="home-badge home-badge--lightning">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>AI-Powered Results</span>
              </div>
              <div className="home-badge home-badge--sparkle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                <span>Find Any AI Tool</span>
              </div>
            </div>
          </div>

          <TrendingChips onPick={handleChipPick} />
          <CategoryIcons onCategoryPick={handleCategoryPick} />
        </main>

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

  // ---- RESULTS VIEW ----
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
      />

      <div className="results-container">
        <main className="results-main">
          {/* Pricing filter chips */}
          <div className="pricing-filter">
            <span className="pricing-filter__label">Pricing:</span>
            <button
              type="button"
              className={`pricing-chip ${pricing === 'All' ? 'pricing-chip--active' : ''}`}
              onClick={() => setPricing('All')}
            >
              All <span className="pricing-chip__count">({pricingCounts.All})</span>
            </button>
            {PRICING_TIERS.map((p) => (
              <button
                key={p}
                type="button"
                className={`pricing-chip ${pricing === p ? 'pricing-chip--active' : ''}`}
                onClick={() => setPricing(p)}
              >
                {p} <span className="pricing-chip__count">({pricingCounts[p] || 0})</span>
              </button>
            ))}
          </div>

          {activeQuery && (
            <AiDecisionGuide
              query={activeQuery}
              matchingTools={allCategoryResults}
            />
          )}

          {/* Real-time web search results */}
          {activeQuery && (
            <WebSearchResults
              webTools={webResults.tools}
              sources={webResults.sources}
              loading={webLoading}
              query={activeQuery}
            />
          )}

          <p className="results-count">
            {results.length} {results.length === 1 ? 'tool' : 'tools'} found
            {webResults.tools.length > 0 && (
              <span className="results-count__web">
                {' '}+ {webResults.tools.length} from web
              </span>
            )}
            {activeQuery && <> for "<strong>{activeQuery}</strong>"</>}
            {pricing !== 'All' && <span className="results-count__filter"> · Filtered by {pricing}</span>}
          </p>

          {results.length > 0 ? (
            <div className="results-list">
              {results.map((tool, i) => (
                <ResultCard
                  key={tool.id}
                  tool={tool}
                  index={i}
                  onDelete={handleDeleteUserTool}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2 className="empty-state__title">
                {pricing !== 'All' ? `No ${pricing} tools found` : 'No tools match that yet'}
              </h2>
              <p className="empty-state__text">
                {pricing !== 'All'
                  ? `There are no ${pricing} tools matching "${activeQuery}". Switch back to All or check out another pricing tier.`
                  : webLoading
                    ? 'Searching the web for new tools...'
                    : webResults.tools.length > 0
                      ? `Found ${webResults.tools.length} tools from the web above!`
                      : 'Try a broader phrase, different category, or register this tool!'
                }
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                {pricing !== 'All' ? (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setPricing('All')}
                  >
                    Show All Tools ({pricingCounts.All})
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setIsSubmitModalOpen(true)}
                  >
                    <PlusIcon width={16} height={16} />
                    Submit this AI Tool
                  </button>
                )}
                <button type="button" className="empty-state__btn" onClick={goHome}>
                  Back to home
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="footer">
        <p>
          {allTools.length} indexed + internet search
          {webResults.tools.length > 0 && ` · ${webResults.tools.length} live results`}
          {userTools.length > 0 && ` · ${userTools.length} community`} · Built by Yohesh
        </p>
      </footer>

      <SubmitToolModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitTool={handleAddTool}
        onSearchTool={handleSearchNewTool}
      />

      {showScrollTop && (
        <button
          type="button"
          className="mobile-fab"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
          title="Back to top"
        >
          <ArrowUpIcon width={20} height={20} />
        </button>
      )}
    </div>
  )
}

export default App
