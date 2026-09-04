import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import SearchHeader from './components/SearchHeader.jsx'
import TrendingChips from './components/TrendingChips.jsx'
import CategoryBar from './components/CategoryBar.jsx'
import CategoryIcons from './components/CategoryIcons.jsx'
import ResultCard from './components/ResultCard.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import SubmitToolModal from './components/SubmitToolModal.jsx'
import AiDecisionGuide from './components/AiDecisionGuide.jsx'
import { PlusIcon } from './components/icons.jsx'
import { CATEGORIES, PRICING_TIERS, TOOLS } from './data/tools.js'
import { createSearchIndex, searchTools, getAutocompleteSuggestions } from './lib/search.js'

function App() {
  const [view, setView] = useState('home')         // 'home' | 'results'
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('') // the query that was actually searched
  const [category, setCategory] = useState('All')
  const [pricing, setPricing] = useState('All')
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('aoogle_theme', theme)
  }, [theme])

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

  // Search results (only computed for the active searched query)
  const results = useMemo(
    () => searchTools({ searchIndex, tools: allTools, query: activeQuery, category, pricing }),
    [searchIndex, allTools, activeQuery, category, pricing],
  )

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
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  function handleChipPick(task) {
    setQuery(task)
    setActiveQuery(task)
    setView('results')
  }

  function handleCategoryPick(cat) {
    setCategory(cat)
    setActiveQuery('')  // show all tools in that category
    setView('results')
  }

  function handleSuggestionPick(suggestion) {
    if (suggestion.type === 'tool' && suggestion.tool) {
      setQuery(suggestion.tool.name)
      setActiveQuery(suggestion.tool.name)
    } else {
      setQuery(suggestion.text)
      setActiveQuery(suggestion.text)
    }
    setView('results')
  }

  function handleCategoryChange(cat) {
    setCategory(cat)
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

        <h1
          className="logo"
          onClick={() => inputRef.current?.focus()}
          role="banner"
        >
          aoogle<span className="logo__dot" aria-hidden="true" />
        </h1>
        <p className="tagline">Find the right AI tool for any task.</p>

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

        <TrendingChips onPick={handleChipPick} />
        <CategoryIcons onCategoryPick={handleCategoryPick} />

        <footer className="footer" style={{ marginTop: 'auto', paddingTop: '40px', borderTop: 'none' }}>
          <p>
            {allTools.length} AI tools indexed
            {userTools.length > 0 && ` (${userTools.length} community)`} · Built by Yohesh
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
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
      />

      <CategoryBar
        categories={CATEGORIES}
        active={category}
        onChange={handleCategoryChange}
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
              All
            </button>
            {PRICING_TIERS.map((p) => (
              <button
                key={p}
                type="button"
                className={`pricing-chip ${pricing === p ? 'pricing-chip--active' : ''}`}
                onClick={() => setPricing(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {activeQuery && (
            <AiDecisionGuide
              query={activeQuery}
              matchingTools={results}
            />
          )}

          <p className="results-count">
            {results.length} {results.length === 1 ? 'tool' : 'tools'} found
            {activeQuery && <> for "<strong>{activeQuery}</strong>"</>}
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
              <h2 className="empty-state__title">No tools match that yet</h2>
              <p className="empty-state__text">Try a broader phrase, different category, or register this tool!</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  <PlusIcon width={16} height={16} />
                  Submit this AI Tool
                </button>
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
          {allTools.length} AI tools indexed
          {userTools.length > 0 && ` (${userTools.length} community)`} · Built by Yohesh
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
