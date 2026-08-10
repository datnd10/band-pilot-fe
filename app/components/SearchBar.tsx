interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * SearchBar — a controlled search input.
 * The parent is responsible for debouncing via useDebounce (300 ms recommended).
 * Validates: Requirements 2.1
 */
export function SearchBar({ value, onChange, placeholder = 'Search words…' }: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      {/* Search icon */}
      <span className="pointer-events-none absolute left-3 text-gray-400" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </span>
      <input
        type="search"
        role="searchbox"
        aria-label="Search vocabulary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}
