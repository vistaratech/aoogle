import { SparklesIcon } from './icons.jsx'

const TASKS = [
  'remove a background',
  'clone a voice',
  'write a resume',
  'review my code',
  'turn text into video',
  'summarize a meeting',
  'design a logo',
  'translate a document',
]

export default function TrendingChips({ onPick }) {
  return (
    <div className="trending">
      <div className="trending__header">
        <SparklesIcon width={12} height={12} className="trending__spark" />
        <span className="trending__label">Trending Searches</span>
      </div>
      <div className="trending__list">
        {TASKS.map((task, i) => (
          <button
            key={task}
            type="button"
            className="trending__chip stagger-enter"
            style={{ animationDelay: `${i * 35}ms` }}
            onClick={() => onPick(task)}
          >
            {task}
          </button>
        ))}
      </div>
    </div>
  )
}

