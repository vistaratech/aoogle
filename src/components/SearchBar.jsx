import { useState, useEffect, useRef } from 'react'
import { SearchIcon, CloseIcon, MicIcon, SparkleIcon } from './icons.jsx'

export default function SearchBar({
  value,
  onChange,
  onSearch,
  inputRef,
  suggestions = [],
  onSuggestionPick,
  large = false,
  showButtons = false,
  showKbd = false,
}) {
  const [activeIdx, setActiveIdx] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  const hasSuggestions = suggestions.length > 0 && showSuggestions && value.trim().length >= 2

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIdx(-1)
  }, [suggestions])

  function handleInputChange(e) {
    onChange(e.target.value)
    setShowSuggestions(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown' && hasSuggestions) {
      e.preventDefault()
      setActiveIdx((i) => (i < suggestions.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp' && hasSuggestions) {
      e.preventDefault()
      setActiveIdx((i) => (i > 0 ? i - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && hasSuggestions) {
        onSuggestionPick?.(suggestions[activeIdx])
      } else {
        onSearch?.()
      }
      setShowSuggestions(false)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      if (!value) {
        inputRef?.current?.blur()
      }
    }
  }

  function handleSuggestionClick(suggestion) {
    onSuggestionPick?.(suggestion)
    setShowSuggestions(false)
  }

  function handleLucky() {
    // "I'm Feeling Lucky" — search and go to first result's URL
    onSearch?.('lucky')
  }

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className={`search-bar ${large ? 'search-bar--large' : ''}`}>
        <SearchIcon className="search-bar__icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-bar__input"
          placeholder="Search AI tools across the internet..."
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          autoComplete="off"
          spellCheck="false"
          aria-label="Search AI tools across the internet"
          aria-expanded={hasSuggestions}
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="search-bar__actions">
          {value && (
            <button
              type="button"
              className="search-bar__btn"
              onClick={() => { onChange(''); inputRef?.current?.focus() }}
              aria-label="Clear search"
            >
              <CloseIcon width={14} height={14} />
            </button>
          )}
          {value && <span className="search-bar__divider" />}
          <button
            type="button"
            className="search-bar__btn"
            aria-label="Voice search"
            title="Voice search (coming soon)"
          >
            <MicIcon width={18} height={18} />
          </button>
          {showKbd && !value && (
            <kbd className="search-bar__kbd">/</kbd>
          )}
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {hasSuggestions && (
        <div className="autocomplete" role="listbox">
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.text}`}
              type="button"
              className={`autocomplete__item ${i === activeIdx ? 'autocomplete__item--active' : ''}`}
              onClick={() => handleSuggestionClick(s)}
              role="option"
              aria-selected={i === activeIdx}
            >
              {s.type === 'tool' ? (
                <SparkleIcon className="autocomplete__icon" />
              ) : (
                <SearchIcon className="autocomplete__icon" />
              )}
              <span className="autocomplete__text">{s.text}</span>
              <span className="autocomplete__type">{s.type}</span>
            </button>
          ))}
        </div>
      )}

      {/* Search + Lucky buttons (home page only) */}
      {showButtons && (
        <div className="search-buttons">
          <button
            type="button"
            className="search-buttons__btn search-buttons__btn--primary"
            onClick={() => { onSearch?.(); setShowSuggestions(false) }}
          >
            aoogle Search
          </button>
          <button
            type="button"
            className="search-buttons__btn search-buttons__btn--secondary"
            onClick={handleLucky}
          >
            I'm Feeling Lucky
          </button>
        </div>
      )}
    </div>
  )
}
