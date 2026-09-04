import SearchBar from './SearchBar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { ArrowLeftIcon, PlusIcon } from './icons.jsx'

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
  onOpenSubmit,
}) {
  return (
    <header className="search-header">
      <div className="search-header__top-row">
        <button
          type="button"
          className="search-header__back-btn"
          onClick={onGoHome}
          aria-label="Back to home"
          title="Back to home"
        >
          <ArrowLeftIcon width={18} height={18} />
        </button>

        <button
          type="button"
          className="logo logo--small"
          onClick={onGoHome}
          aria-label="Go to Aoogle home"
        >
          aoogle<span className="logo__dot" aria-hidden="true" />
        </button>

        {/* Mobile top-row actions */}
        <div className="search-header__actions search-header__actions--mobile">
          {onOpenSubmit && (
            <button
              type="button"
              className="btn-submit-tool btn-submit-tool--header"
              onClick={onOpenSubmit}
              title="Submit AI Tool"
              aria-label="Submit AI Tool"
            >
              <PlusIcon width={15} height={15} />
              <span className="btn-submit-tool__text">Submit</span>
            </button>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>

      <div className="search-header__search-row">
        <SearchBar
          value={query}
          onChange={onQueryChange}
          onSearch={onSearch}
          inputRef={inputRef}
          suggestions={suggestions}
          onSuggestionPick={onSuggestionPick}
        />
      </div>

      {/* Desktop right-aligned actions */}
      <div className="search-header__actions search-header__actions--desktop">
        {onOpenSubmit && (
          <button
            type="button"
            className="btn-submit-tool btn-submit-tool--header"
            onClick={onOpenSubmit}
            title="Submit AI Tool"
            aria-label="Submit AI Tool"
          >
            <PlusIcon width={15} height={15} />
            <span className="btn-submit-tool__text">Submit AI Tool</span>
          </button>
        )}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}

