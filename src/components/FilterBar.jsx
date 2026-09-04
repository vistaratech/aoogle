export default function FilterBar({
  resultCount,
  category,
  pricing,
  onCategoryChange,
  onPricingChange,
  categories,
  pricingTiers,
}) {
  return (
    <div className="filter-bar">
      <p className="filter-bar__count">
        {resultCount} {resultCount === 1 ? 'tool' : 'tools'}
      </p>
      <div className="filter-bar__controls">
        <label className="filter-bar__field">
          <span>Category</span>
          <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
            <option value="All">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="filter-bar__field">
          <span>Pricing</span>
          <select value={pricing} onChange={(e) => onPricingChange(e.target.value)}>
            <option value="All">All</option>
            {pricingTiers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
