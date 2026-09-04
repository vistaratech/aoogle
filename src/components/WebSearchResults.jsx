import { GlobeIcon, ExternalLinkIcon, SparklesIcon } from './icons.jsx'

/**
 * Displays live web search results in a distinct "From the Web" section.
 * These are real-time results fetched from internet sources.
 */
export default function WebSearchResults({ webTools, sources, loading, query }) {
  if (loading) {
    return (
      <section className="web-results" aria-label="Live web results">
        <div className="web-results__header">
          <span className="web-results__badge">
            <GlobeIcon width={14} height={14} />
            <span>Searching the web…</span>
          </span>
        </div>
        <div className="web-results__skeleton">
          <div className="web-skeleton-card">
            <div className="web-skeleton-line web-skeleton-line--title" />
            <div className="web-skeleton-line web-skeleton-line--url" />
            <div className="web-skeleton-line web-skeleton-line--desc" />
          </div>
          <div className="web-skeleton-card">
            <div className="web-skeleton-line web-skeleton-line--title" />
            <div className="web-skeleton-line web-skeleton-line--url" />
            <div className="web-skeleton-line web-skeleton-line--desc" />
          </div>
          <div className="web-skeleton-card">
            <div className="web-skeleton-line web-skeleton-line--title" />
            <div className="web-skeleton-line web-skeleton-line--url" />
            <div className="web-skeleton-line web-skeleton-line--desc" />
          </div>
        </div>
      </section>
    )
  }

  if (!webTools || webTools.length === 0) return null

  return (
    <section className="web-results" aria-label="Live web search results">
      <div className="web-results__header">
        <span className="web-results__badge">
          <GlobeIcon width={14} height={14} />
          <span>Live from the Web</span>
        </span>
        <span className="web-results__sources">
          {sources.map((s, i) => (
            <span key={s} className="web-results__source-tag">
              {s}
            </span>
          ))}
        </span>
        <span className="web-results__count">
          {webTools.length} new {webTools.length === 1 ? 'tool' : 'tools'} discovered
        </span>
      </div>

      <div className="web-results__grid">
        {webTools.map((tool, i) => {
          let displayUrl = ''
          try {
            const u = new URL(tool.url)
            displayUrl = u.hostname.replace('www.', '')
          } catch {
            displayUrl = tool.url
          }

          return (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="web-result-card stagger-enter"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="web-result-card__top">
                <span className="web-result-card__source-badge">
                  {tool.source === 'AI Search' ? (
                    <SparklesIcon width={10} height={10} />
                  ) : (
                    <GlobeIcon width={10} height={10} />
                  )}
                  {tool.source}
                </span>
                <span className={`chip chip--${(tool.pricing || 'freemium').toLowerCase()}`}>
                  {tool.pricing}
                </span>
              </div>

              <h4 className="web-result-card__name">
                {tool.name}
                <ExternalLinkIcon className="web-result-card__link-icon" width={11} height={11} />
              </h4>

              <p className="web-result-card__url">{displayUrl}</p>

              <p className="web-result-card__desc">
                {tool.description.length > 120
                  ? tool.description.slice(0, 117) + '...'
                  : tool.description}
              </p>

              <div className="web-result-card__meta">
                <span className="chip chip--category">{tool.category}</span>
                <span className="web-result-card__live-dot" title="Real-time result" />
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
