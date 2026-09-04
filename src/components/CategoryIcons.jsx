import {
  ImageIcon, VideoIcon, AudioIcon, WritingIcon,
  CodeIcon, DesignIcon,
} from './icons.jsx'

const CATEGORIES = [
  { label: 'Image', sub: 'Art, Photo & 3D', Icon: ImageIcon, cat: 'Image', color: 'indigo' },
  { label: 'Video', sub: 'Motion & Gen-AI', Icon: VideoIcon, cat: 'Video', color: 'pink' },
  { label: 'Audio', sub: 'Voice & Music', Icon: AudioIcon, cat: 'Audio & Voice', color: 'cyan' },
  { label: 'Writing', sub: 'Copy & Research', Icon: WritingIcon, cat: 'Writing', color: 'amber' },
  { label: 'Code', sub: 'Agents & Dev Tools', Icon: CodeIcon, cat: 'Code', color: 'green' },
  { label: 'Design', sub: 'UI, UX & Graphics', Icon: DesignIcon, cat: 'Design', color: 'purple' },
]

export default function CategoryIcons({ onCategoryPick }) {
  return (
    <section className="category-explorer" aria-label="Explore AI Categories">
      <div className="category-explorer__header">
        <span className="category-explorer__label">Explore Categories</span>
      </div>
      <div className="category-explorer__grid">
        {CATEGORIES.map(({ label, sub, Icon, cat, color }, i) => (
          <button
            key={label}
            type="button"
            className={`category-card category-card--${color} stagger-enter`}
            style={{ animationDelay: `${250 + i * 40}ms` }}
            onClick={() => onCategoryPick(cat)}
            aria-label={`Browse ${label} AI tools`}
          >
            <div className="category-card__icon-wrap">
              <Icon className="category-card__icon" />
            </div>
            <div className="category-card__text">
              <span className="category-card__name">{label}</span>
              <span className="category-card__sub">{sub}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

