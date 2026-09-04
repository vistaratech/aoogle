import SearchBar from './SearchBar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { PlusIcon } from './icons.jsx'

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
        <button
          type="button"
          className="btn-submit-tool btn-submit-tool--header"
          onClick={onOpenSubmitModal}
          title="Submit your AI tool to Aoogle"
        >
          <PlusIcon width={14} height={14} />
          <span>Submit AI Tool</span>
        </button>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
