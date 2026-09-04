import { GlobeIcon, ExternalLinkIcon, SparklesIcon } from './icons.jsx'

export default function WebSearchResults({ webTools, sources, loading, query }) {
  if (loading) {
    return (
      <div className="web-shelf web-shelf--loading" aria-label="Searching live web">
        <div className="web-shelf__header">
          <span className="web-shelf__badge">
            <GlobeIcon width={13} height={13} className="spin-slow" />
            <span>Scanning live web for new AI tools…</span>
          </span>
        </div>
        <div className="web-shelf__skeleton-row">
          <div className="web-skeleton-pill" />
          <div className="web-skeleton-pill" />
          <div className="web-skeleton-pill" />
        </div>
      </div>
    )
  }

  if (!webTools || webTools.length === 0) return null

  return (
    <section className="web-shelf" aria-label="Live web discoveries">
      <div className="web-shelf__header">
        <div className="web-shelf__title-wrap">
          <span className="web-shelf__badge">
            <span className="web-shelf__pulse-dot" />
            <GlobeIcon width={13} height={13} />
            <span>Live Web Discoveries</span>
          </span>
          <span className="web-shelf__subtitle">
            {webTools.length} real-time {webTools.length === 1 ? 'tool' : 'tools'} found on the internet
          </span>
        </div>

        <div className="web-shelf__sources">
          {sources.map((s) => (
            <span key={s} className="web-shelf__source-tag">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="web-shelf__cards">
        {webTools.map((tool, i) => {
          let displayUrl = ''
          let hostname = ''
          try {
            const u = new URL(tool.url)
            hostname = u.hostname
            displayUrl = u.hostname.replace('www.', '')
          } catch {
            displayUrl = tool.url
            hostname = ''
          }
          const favicon = hostname
            ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
            : null

          return (
            <a
              key={tool.id || i}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="web-card-mini"
              title={`Visit ${tool.name}`}
            >
              <div className="web-card-mini__top">
                <div className="web-card-mini__avatar">
                  {favicon ? (
                    <img
                      src={favicon}
                      alt=""
                      className="web-card-mini__favicon"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : null}
                  <span className="web-card-mini__fallback">
                    {tool.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="web-card-mini__meta">
                  <span className="web-card-mini__name">{tool.name}</span>
                  <span className="web-card-mini__url">{displayUrl}</span>
                </div>

                <span className={`chip chip--${(tool.pricing || 'freemium').toLowerCase()}`}>
                  {tool.pricing}
                </span>
              </div>

              <p className="web-card-mini__desc">{tool.description}</p>

              <div className="web-card-mini__footer">
                <span className="web-card-mini__cat">{tool.category}</span>
                <span className="web-card-mini__action">
                  <span>Visit</span>
                  <ExternalLinkIcon width={10} height={10} />
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}

