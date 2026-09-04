import { useState, useEffect } from 'react'
import { SparklesIcon, TrophyIcon, ZapIcon, ExternalLinkIcon } from './icons.jsx'
import { fetchAiDecision } from '../lib/aiDecision.js'

export default function AiDecisionGuide({ query, matchingTools }) {
  const [decision, setDecision] = useState(null)
  const [loading, setLoading] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setDecision(null)
      return
    }

    let isMounted = true
    setLoading(true)

    fetchAiDecision(query, matchingTools)
      .then((data) => {
        if (isMounted) {
          setDecision(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [query, matchingTools])

  if (!query || (!loading && !decision)) return null

  return (
    <section className="ai-decision-card" aria-label="AI Decision Guide">
      <div className="ai-decision-card__glow" aria-hidden="true" />

      <div className="ai-decision-card__header">
        <div className="ai-decision-card__title-wrap">
          <span className="ai-decision-card__badge">
            <SparklesIcon width={14} height={14} />
            <span>AI Decision Engine</span>
          </span>
          <h2 className="ai-decision-card__title">
            Which AI tool is best for "{query}"?
          </h2>
        </div>

        <button
          type="button"
          className="ai-decision-card__toggle-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? 'Expand AI Guide' : 'Collapse AI Guide'}
        >
          {collapsed ? 'Show Advice ▾' : 'Hide ▴'}
        </button>
      </div>

      {loading && (
        <div className="ai-decision-card__skeleton">
          <div className="ai-skeleton-line ai-skeleton-line--lg" />
          <div className="ai-skeleton-grid">
            <div className="ai-skeleton-box" />
            <div className="ai-skeleton-box" />
            <div className="ai-skeleton-box" />
          </div>
        </div>
      )}

      {!loading && decision && !collapsed && (
        <div className="ai-decision-card__content">
          <p className="ai-decision-card__summary">{decision.summary}</p>

          <div className="ai-decision-card__grid">
            {decision.topPicks?.map((pick, i) => (
              <a
                key={i}
                href={pick.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`ai-pick-card ai-pick-card--${pick.type || 'default'}`}
              >
                <div className="ai-pick-card__header">
                  <span className="ai-pick-card__badge">
                    {pick.type === 'quality' ? (
                      <TrophyIcon width={13} height={13} />
                    ) : (
                      <ZapIcon width={13} height={13} />
                    )}
                    {pick.badge}
                  </span>
                  <span className={`chip chip--${(pick.pricing || 'free').toLowerCase()}`}>
                    {pick.pricing}
                  </span>
                </div>

                <h3 className="ai-pick-card__name">
                  {pick.name}
                  <ExternalLinkIcon className="ai-pick-card__icon" width={12} height={12} />
                </h3>

                <p className="ai-pick-card__reason">{pick.reason}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
