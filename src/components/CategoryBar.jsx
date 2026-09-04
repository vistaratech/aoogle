import {
  ImageIcon, VideoIcon, AudioIcon, WritingIcon,
  CodeIcon, DesignIcon, ChatIcon, ProductivityIcon,
  ResearchIcon, MarketingIcon, MeetingsIcon,
  PresentationIcon, TranslationIcon, SparklesIcon,
} from './icons.jsx'

const CATEGORY_ICON_MAP = {
  'Image': ImageIcon,
  'Video': VideoIcon,
  'Audio & Voice': AudioIcon,
  'Writing': WritingIcon,
  'Code': CodeIcon,
  'Chat & Assistants': ChatIcon,
  'Productivity': ProductivityIcon,
  'Research': ResearchIcon,
  'Design': DesignIcon,
  'Marketing': MarketingIcon,
  'Meetings': MeetingsIcon,
  'Presentations': PresentationIcon,
  'Translation': TranslationIcon,
}

// Short labels for the tab bar
const SHORT_LABELS = {
  'Audio & Voice': 'Audio',
  'Chat & Assistants': 'Chat',
}

export default function CategoryBar({ categories, active, onChange }) {
  return (
    <nav className="category-tabs" aria-label="Filter by category">
      <button
        type="button"
        className={`category-tab ${active === 'All' ? 'category-tab--active' : ''}`}
        onClick={() => onChange('All')}
      >
        <SparklesIcon width={13} height={13} className="category-tab__icon" />
        <span>All</span>
      </button>
      {categories.map((cat) => {
        const Icon = CATEGORY_ICON_MAP[cat]
        return (
          <button
            key={cat}
            type="button"
            className={`category-tab ${active === cat ? 'category-tab--active' : ''}`}
            onClick={() => onChange(cat)}
          >
            {Icon && <Icon width={13} height={13} className="category-tab__icon" />}
            <span>{SHORT_LABELS[cat] || cat}</span>
          </button>
        )
      })}
    </nav>
  )
}

// Also export the icon map for CategoryIcons
export { CATEGORY_ICON_MAP }
