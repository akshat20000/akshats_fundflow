export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-xs pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="ff-input pl-9 pr-4 rounded-full text-sm"
        style={{ minWidth: '200px' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary-text
            bg-transparent border-none cursor-pointer text-xs transition-colors"
          aria-label="Clear search"
        >
          <i className="fas fa-times" />
        </button>
      )}
    </div>
  );
}
