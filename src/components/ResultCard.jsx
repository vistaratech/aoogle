import { ExternalLinkIcon, GlobeIcon, SparklesIcon, TrashIcon } from './icons.jsx'

export default function ResultCard({ tool, index = 0, onDelete }) {
  // Extract domain from URL for display
  let displayUrl = ''
  try {
    const u = new URL(tool.url)
    displayUrl = u.hostname.replace('www.', '') + u.pathname.replace(/\/$/, '')
  } catch {
    displayUrl = tool.url
  }

  function handleDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to remove "${tool.name}" from your tools?`)) {
      onDelete?.(tool.id)
    }
  }

  return (
    <a
      className={`result-card stagger-enter ${tool.isUserSubmitted ? 'result-card--user' : ''}`}
      style={{ animationDelay: `${index * 30}ms` }}
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="result-card__top">
        <p className="result-card__url">
          <span className="result-card__url-icon">
            <GlobeIcon />
          </span>
          {displayUrl}
        </p>
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

      <h3 className="result-card__name">
        {tool.name}
        <ExternalLinkIcon className="result-card__link-icon" />
      </h3>
      <p className="result-card__description">{tool.description}</p>
      <div className="result-card__meta">
        {tool.isUserSubmitted && (
          <span className="chip chip--community">
            <SparklesIcon width={11} height={11} />
            Community
          </span>
        )}
        <span className="chip chip--category">{tool.category}</span>
        <span className={`chip chip--${tool.pricing.toLowerCase()}`}>{tool.pricing}</span>
        {tool.creator && (
          <span className="result-card__creator">by {tool.creator}</span>
        )}
      </div>
    </a>
  )
}
