import SearchBar from './SearchBar.jsx'
import ThemeToggle from './ThemeToggle.jsx'

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
}) {
  return (
    <header className="search-header">
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
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
