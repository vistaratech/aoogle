import SearchBar from './SearchBar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { PlusIcon, GlobeIcon, SparklesIcon } from './icons.jsx'

export default function SearchHeader({
  query,
  onQueryChange,
  onSearch,
  onGoHome,
  inputRef,
  suggestions,
  onSuggestionPick,
  theme,
  onToggleTheme,
  onOpenSubmitModal,
  pricing,
  onPricingChange,
  pricingCounts,
  webCount = 0,
  filterWebOnly = false,
  onToggleWebOnly,
  totalFound = 0,
}) {
  return (
    <header className="search-header">
      <div className="search-header__top">
        <button
          type="button"
          className="logo logo--small"
          onClick={onGoHome}
          aria-label="Go to Aoogle home"
        >
          aoogle<span className="logo__dot" aria-hidden="true" />
        </button>

        <SearchBar
          value={query}
          onChange={onQueryChange}
          onSearch={onSearch}
          inputRef={inputRef}
          suggestions={suggestions}
          onSuggestionPick={onSuggestionPick}
        />

        <div className="search-header__actions">
          {onOpenSubmitModal && (
            <button
              type="button"
              className="btn-header-submit"
              onClick={onOpenSubmitModal}
              title="Submit a new AI tool"
            >
              <PlusIcon width={14} height={14} />
              <span>Submit Tool</span>
            </button>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>

      {/* Google-Style Sub-Navigation Tab Bar */}
      {pricingCounts && (
        <nav className="search-header__subnav" aria-label="Search filter tabs">
          <div className="search-header__tabs">
            <button
              type="button"
              className={`search-tab ${!filterWebOnly && pricing === 'All' ? 'search-tab--active' : ''}`}
              onClick={() => {
                if (filterWebOnly && onToggleWebOnly) onToggleWebOnly(false)
                onPricingChange('All')
              }}
            >
              <span>All</span>
              <span className="search-tab__count">({(pricingCounts.All || 0) + webCount})</span>
            </button>

            <button
              type="button"
              className={`search-tab ${!filterWebOnly && pricing === 'Free' ? 'search-tab--active' : ''}`}
              onClick={() => {
                if (filterWebOnly && onToggleWebOnly) onToggleWebOnly(false)
                onPricingChange('Free')
              }}
            >
              <span>Free</span>
              <span className="search-tab__count">({pricingCounts.Free || 0})</span>
            </button>

            <button
              type="button"
              className={`search-tab ${!filterWebOnly && pricing === 'Freemium' ? 'search-tab--active' : ''}`}
              onClick={() => {
                if (filterWebOnly && onToggleWebOnly) onToggleWebOnly(false)
                onPricingChange('Freemium')
              }}
            >
              <span>Freemium</span>
              <span className="search-tab__count">({pricingCounts.Freemium || 0})</span>
            </button>

            <button
              type="button"
              className={`search-tab ${!filterWebOnly && pricing === 'Paid' ? 'search-tab--active' : ''}`}
              onClick={() => {
                if (filterWebOnly && onToggleWebOnly) onToggleWebOnly(false)
                onPricingChange('Paid')
              }}
            >
              <span>Paid</span>
              <span className="search-tab__count">({pricingCounts.Paid || 0})</span>
            </button>

            {webCount > 0 && (
              <button
                type="button"
                className={`search-tab search-tab--web ${filterWebOnly ? 'search-tab--active' : ''}`}
                onClick={() => onToggleWebOnly && onToggleWebOnly(!filterWebOnly)}
              >
                <GlobeIcon width={13} height={13} className="search-tab__web-icon" />
                <span>Live Web</span>
                <span className="search-tab__live-pill">+{webCount}</span>
              </button>
            )}
          </div>

          <div className="search-header__meta-stat">
            <span className="search-header__live-dot" />
            <span>{totalFound} results · Live Internet Search</span>
          </div>
        </nav>
      )}
    </header>
  )
}

