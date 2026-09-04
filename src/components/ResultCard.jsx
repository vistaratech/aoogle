import { ExternalLinkIcon, GlobeIcon, SparklesIcon, TrashIcon, TrophyIcon } from './icons.jsx'

export default function ResultCard({ tool, index = 0, onDelete }) {
  // Extract domain and hostname from URL for favicon & display
  let displayUrl = ''
  let hostname = ''
  try {
    const u = new URL(tool.url)
    hostname = u.hostname
    displayUrl = u.hostname.replace('www.', '') + u.pathname.replace(/\/$/, '')
  } catch {
    displayUrl = tool.url
    hostname = tool.url
  }

  const faviconUrl = hostname
    ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    : null

  function handleDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to remove "${tool.name}" from your tools?`)) {
      onDelete?.(tool.id)
    }
  }

  // Derive "Best for" highlight text
  const bestForText = tool.bestFor || (tool.tags && tool.tags.length > 0 ? tool.tags.slice(0, 2).join(' • ') : '')

  return (
    <a
      className={`result-card stagger-enter ${tool.isUserSubmitted ? 'result-card--user' : ''} ${tool.isWebResult ? 'result-card--web' : ''}`}
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="result-card__header-row">
        <div className="result-card__identity">
          <div className="result-card__avatar">
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                className="result-card__favicon"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex'
                  }
                }}
              />
            ) : null}
            <span
              className="result-card__fallback-icon"
              style={{ display: faviconUrl ? 'none' : 'flex' }}
            >
              {tool.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="result-card__titles">
            <div className="result-card__url-row">
              <span className="result-card__domain">{displayUrl}</span>
              <span className="result-card__dot-sep">•</span>
              <span className="result-card__category-badge">{tool.category}</span>
              {tool.isWebResult && (
                <span className="result-card__web-pill">
                  <GlobeIcon width={10} height={10} />
                  <span>Live Web</span>
                </span>
              )}
            </div>
            <h3 className="result-card__name">
              <span>{tool.name}</span>
              <ExternalLinkIcon className="result-card__link-icon" />
            </h3>
          </div>
        </div>

        <div className="result-card__top-actions">
          <span className={`chip chip--${(tool.pricing || 'free').toLowerCase()}`}>
            {tool.pricing}
          </span>
          {tool.isUserSubmitted && onDelete && (
            <button
              type="button"
              className="result-card__delete-btn"
              onClick={handleDelete}
              title="Delete this custom tool"
              aria-label={`Delete ${tool.name}`}
            >
              <TrashIcon width={14} height={14} />
            </button>
          )}
        </div>
      </div>

      {bestForText && (
        <div className="result-card__best-for">
          <span className="best-for-badge">
            <TrophyIcon width={12} height={12} />
            <span className="best-for-badge__label">Best for:</span>
            <span className="best-for-badge__val">{bestForText}</span>
          </span>
        </div>
      )}

      <p className="result-card__description">{tool.description}</p>

      <div className="result-card__footer-row">
        <div className="result-card__tags">
          {tool.isUserSubmitted && (
            <span className="chip chip--community">
              <SparklesIcon width={11} height={11} />
              Community
            </span>
          )}
          {tool.source && tool.isWebResult && (
            <span className="result-card__source-tag">via {tool.source}</span>
          )}
          {tool.tags && tool.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">#{tag}</span>
          ))}
          {tool.creator && (
            <span className="result-card__creator">by {tool.creator}</span>
          )}
        </div>

        <span className="result-card__visit-hint">
          Visit Website <ExternalLinkIcon width={11} height={11} />
        </span>
      </div>
    </a>
  )
}
