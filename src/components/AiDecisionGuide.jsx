import { useState, useEffect } from 'react'
import { SparklesIcon, TrophyIcon, ZapIcon, ExternalLinkIcon, ChevronDownIcon } from './icons.jsx'
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
    <aside className="ai-overview-panel" aria-label="AI Smart Overview">
      <div className="ai-overview-panel__ambient" aria-hidden="true" />

      <div className="ai-overview-panel__header">
        <div className="ai-overview-panel__tag">
          <SparklesIcon width={13} height={13} className="ai-overview-panel__tag-icon" />
          <span>AI Overview</span>
        </div>

        <button
          type="button"
          className="ai-overview-panel__collapse-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? 'Expand AI Overview' : 'Collapse AI Overview'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span>{collapsed ? 'Show' : 'Hide'}</span>
          <span className={`ai-overview-arrow ${collapsed ? 'ai-overview-arrow--down' : ''}`}>▾</span>
        </button>
      </div>

      <h3 className="ai-overview-panel__title">
        Top Picks for "{query}"
      </h3>

      {loading && (
        <div className="ai-overview-skeleton">
          <div className="ai-skel-bar ai-skel-bar--text" />
          <div className="ai-skel-bar ai-skel-bar--text-sub" />
          <div className="ai-skel-tiles">
            <div className="ai-skel-tile" />
            <div className="ai-skel-tile" />
            <div className="ai-skel-tile" />
          </div>
        </div>
      )}

      {!loading && decision && !collapsed && (
        <div className="ai-overview-panel__body">
          <p className="ai-overview-panel__summary">{decision.summary}</p>

          <div className="ai-overview-picks">
            {decision.topPicks?.map((pick, i) => {
              let pickHostname = ''
              try {
                pickHostname = new URL(pick.url).hostname
              } catch {
                pickHostname = ''
              }
              const pickFavicon = pickHostname
                ? `https://www.google.com/s2/favicons?domain=${pickHostname}&sz=64`
                : null

              const isBest = pick.type === 'quality'
              const isFree = pick.type === 'free'

              return (
                <a
                  key={i}
                  href={pick.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`ai-pick-tile ${isBest ? 'ai-pick-tile--highlight' : ''}`}
                >
                  <div className="ai-pick-tile__top">
                    <span className={`ai-pick-tile__role ${isBest ? 'ai-pick-tile__role--gold' : isFree ? 'ai-pick-tile__role--green' : ''}`}>
                      {isBest ? (
                        <TrophyIcon width={11} height={11} />
                      ) : isFree ? (
                        <ZapIcon width={11} height={11} />
                      ) : (
                        <SparklesIcon width={11} height={11} />
                      )}
                      <span>{pick.badge}</span>
                    </span>
                    <span className={`chip chip--${(pick.pricing || 'free').toLowerCase()}`}>
                      {pick.pricing}
                    </span>
                  </div>

                  <div className="ai-pick-tile__identity">
                    <div className="ai-pick-tile__icon-box">
                      {pickFavicon ? (
                        <img
                          src={pickFavicon}
                          alt=""
                          className="ai-pick-tile__favicon"
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
                        className="ai-pick-tile__fallback-icon"
                        style={{ display: pickFavicon ? 'none' : 'flex' }}
                      >
                        {pick.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="ai-pick-tile__meta">
                      <span className="ai-pick-tile__name">
                        {pick.name}
                        <ExternalLinkIcon width={11} height={11} className="ai-pick-tile__ext" />
                      </span>
                    </div>
                  </div>

                  <p className="ai-pick-tile__verdict">{pick.reason}</p>
                </a>
              )
            })}
          </div>

          <div className="ai-overview-panel__footer">
            <span>Verified AI Recommendation Engine</span>
          </div>
        </div>
      )}
    </aside>
  )
}

