import {
  ImageIcon, VideoIcon, AudioIcon, WritingIcon,
  CodeIcon, DesignIcon,
} from './icons.jsx'

const ITEMS = [
  { label: 'Image', Icon: ImageIcon, query: '' },
  { label: 'Video', Icon: VideoIcon, query: '' },
  { label: 'Audio', Icon: AudioIcon, query: '' },
  { label: 'Writing', Icon: WritingIcon, query: '' },
  { label: 'Code', Icon: CodeIcon, query: '' },
  { label: 'Design', Icon: DesignIcon, query: '' },
]

// Maps display labels to actual category values
const LABEL_TO_CATEGORY = {
  'Image': 'Image',
  'Video': 'Video',
  'Audio': 'Audio & Voice',
  'Writing': 'Writing',
  'Code': 'Code',
  'Design': 'Design',
}

export default function CategoryIcons({ onCategoryPick }) {
  return (
    <div className="category-icons">
      {ITEMS.map(({ label, Icon }, i) => (
        <button
          key={label}
          type="button"
          className="category-icon stagger-enter"
          style={{ animationDelay: `${300 + i * 50}ms` }}
          onClick={() => onCategoryPick(LABEL_TO_CATEGORY[label])}
          aria-label={`Browse ${label} tools`}
        >
          <div className="category-icon__circle">
            <Icon />
          </div>
          <span className="category-icon__label">{label}</span>
        </button>
      ))}
    </div>
  )
}
