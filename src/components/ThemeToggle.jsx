import { SunIcon, MoonIcon } from './icons.jsx'

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {theme === 'dark' ? (
            <MoonIcon width={14} height={14} />
          ) : (
            <SunIcon width={14} height={14} />
          )}
        </span>
      </span>
    </button>
  )
}
