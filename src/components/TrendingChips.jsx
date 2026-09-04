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
      <span className="trending__label">Trending</span>
      <div className="trending__list">
        {TASKS.map((task, i) => (
          <button
            key={task}
            type="button"
            className="trending__chip stagger-enter"
            style={{ animationDelay: `${i * 40}ms` }}
            onClick={() => onPick(task)}
          >
            {task}
          </button>
        ))}
      </div>
    </div>
  )
}
