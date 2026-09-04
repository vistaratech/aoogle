import { ExternalLinkIcon } from './icons.jsx'

export default function ResultRow({ tool }) {
  return (
    <a
      className="result-row"
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="result-row__tick" aria-hidden="true" />
      <div className="result-row__body">
        <div className="result-row__heading">
          <h3 className="result-row__name">{tool.name}</h3>
          <ExternalLinkIcon className="result-row__link-icon" width={13} height={13} />
        </div>
        <p className="result-row__description">{tool.description}</p>
        <div className="result-row__tags">
          <span className="chip chip--category">{tool.category}</span>
          <span className={`chip chip--pricing chip--${tool.pricing.toLowerCase()}`}>{tool.pricing}</span>
        </div>
      </div>
    </a>
  )
}
