import { useState, useEffect } from 'react'
import { CATEGORIES, PRICING_TIERS } from '../data/tools.js'
import { CloseIcon, PlusIcon, CheckIcon, SparklesIcon } from './icons.jsx'

export default function SubmitToolModal({ isOpen, onClose, onSubmitTool, onSearchTool }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0] || 'Image')
  const [pricing, setPricing] = useState('Freemium')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [creator, setCreator] = useState('')
  const [errors, setErrors] = useState({})
  const [submittedTool, setSubmittedTool] = useState(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setUrl('')
      setCategory(CATEGORIES[0] || 'Image')
      setPricing('Freemium')
      setDescription('')
      setTagsInput('')
      setCreator('')
      setErrors({})
      setSubmittedTool(null)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Live parsed tags preview
  const parsedTags = tagsInput
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  function validate() {
    const errs = {}
    if (!name.trim()) {
      errs.name = 'Tool name is required.'
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.'
    }

    if (!url.trim()) {
      errs.url = 'Website URL is required.'
    } else if (!/^https?:\/\//i.test(url.trim())) {
      errs.url = 'URL must start with http:// or https://'
    }

    if (!description.trim()) {
      errs.description = 'Description is required.'
    } else if (description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters.'
    }

    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const cleanName = name.trim()
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const id = `user-${slug}-${Date.now().toString(36)}`

    // Build tags list, including the tool's category and name keywords
    const finalTags = Array.from(
      new Set([
        ...parsedTags,
        cleanName.toLowerCase(),
        category.toLowerCase(),
      ])
    )

    const newTool = {
      id,
      name: cleanName,
      url: url.trim(),
      category,
      pricing,
      description: description.trim(),
      tags: finalTags,
      creator: creator.trim() || undefined,
      isUserSubmitted: true,
      createdAt: Date.now(),
    }

    onSubmitTool(newTool)
    setSubmittedTool(newTool)
  }

  function handleTestSearch() {
    if (submittedTool && onSearchTool) {
      onSearchTool(submittedTool.name)
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <CloseIcon width={16} height={16} />
        </button>

        {submittedTool ? (
          <div className="modal-success">
            <div className="modal-success__icon">
              <CheckIcon width={32} height={32} />
            </div>
            <h2 className="modal-title">Tool Registered Successfully!</h2>
            <p className="modal-desc">
              <strong>{submittedTool.name}</strong> is now live on Aoogle! It has been indexed and can be searched by task, name, or category.
            </p>

            <div className="modal-success__actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleTestSearch}
              >
                Search "{submittedTool.name}" on Aoogle
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-header__badge">
                <SparklesIcon width={14} height={14} />
                <span>Submit Your AI Tool</span>
              </div>
              <h2 id="modal-title" className="modal-title">
                Register an AI Tool
              </h2>
              <p className="modal-desc">
                Have an AI tool you built? Add it to Aoogle's index so users can discover and search for it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              {/* Tool Name */}
              <div className="form-group">
                <label htmlFor="tool-name" className="form-label">
                  Tool Name <span className="form-req">*</span>
                </label>
                <input
                  id="tool-name"
                  type="text"
                  className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                  placeholder="e.g. TamilVoice AI, PhotoSculpt..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  autoFocus
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              {/* Website URL */}
              <div className="form-group">
                <label htmlFor="tool-url" className="form-label">
                  Website / Launch URL <span className="form-req">*</span>
                </label>
                <input
                  id="tool-url"
                  type="url"
                  className={`form-input ${errors.url ? 'form-input--error' : ''}`}
                  placeholder="https://your-ai-tool.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (errors.url) setErrors((prev) => ({ ...prev, url: '' }))
                  }}
                />
                {errors.url && <span className="form-error">{errors.url}</span>}
              </div>

              {/* Category & Pricing in 2 columns */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tool-category" className="form-label">
                    Category <span className="form-req">*</span>
                  </label>
                  <select
                    id="tool-category"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tool-pricing" className="form-label">
                    Pricing Tier <span className="form-req">*</span>
                  </label>
                  <select
                    id="tool-pricing"
                    className="form-select"
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value)}
                  >
                    {PRICING_TIERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="tool-desc" className="form-label">
                  Description <span className="form-req">*</span>
                </label>
                <textarea
                  id="tool-desc"
                  rows={3}
                  className={`form-textarea ${errors.description ? 'form-input--error' : ''}`}
                  placeholder="What does this AI tool do? (e.g. Generate high quality tamil voiceovers from plain text scripts in seconds.)"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }))
                  }}
                />
                {errors.description && (
                  <span className="form-error">{errors.description}</span>
                )}
              </div>

              {/* Tags / Tasks */}
              <div className="form-group">
                <label htmlFor="tool-tags" className="form-label">
                  Tasks & Keywords (comma separated)
                </label>
                <input
                  id="tool-tags"
                  type="text"
                  className="form-input"
                  placeholder="e.g. text to speech, voice clone, dubbing, tamil"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
                <span className="form-hint">
                  Helps users find your tool when searching for specific tasks.
                </span>

                {parsedTags.length > 0 && (
                  <div className="form-tags-preview">
                    {parsedTags.map((tag, idx) => (
                      <span key={idx} className="form-tag-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Creator handle */}
              <div className="form-group">
                <label htmlFor="tool-creator" className="form-label">
                  Creator / Team (optional)
                </label>
                <input
                  id="tool-creator"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Yohesh or @yohesh"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <PlusIcon width={16} height={16} />
                  Register AI Tool
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
