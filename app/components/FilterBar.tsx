import type { WordStatus, WordType } from '../types'

interface FilterBarProps {
  wordType: WordType | ''
  onWordTypeChange: (type: WordType | '') => void
  status: WordStatus | ''
  onStatusChange: (status: WordStatus | '') => void
}

const wordTypeOptions: Array<{ value: WordType | ''; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'noun', label: 'noun' },
  { value: 'verb', label: 'verb' },
  { value: 'adjective', label: 'adjective' },
  { value: 'adverb', label: 'adverb' },
  { value: 'phrase', label: 'phrase' },
]

const statusOptions: Array<{ value: WordStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'New', label: 'New' },
  { value: 'Learning', label: 'Learning' },
  { value: 'Known', label: 'Known' },
]

const selectClassName =
  'rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

/**
 * FilterBar — two dropdowns for filtering by word type and status.
 * Validates: Requirements 2.2, 4.4
 */
export function FilterBar({ wordType, onWordTypeChange, status, onStatusChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Word Type filter */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span className="sr-only">Filter by word type</span>
        <select
          aria-label="Filter by word type"
          value={wordType}
          onChange={(e) => onWordTypeChange(e.target.value as WordType | '')}
          className={selectClassName}
        >
          {wordTypeOptions.map(({ value, label }) => (
            <option key={value === '' ? '__all_types__' : value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {/* Status filter */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span className="sr-only">Filter by status</span>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as WordStatus | '')}
          className={selectClassName}
        >
          {statusOptions.map(({ value, label }) => (
            <option key={value === '' ? '__all_statuses__' : value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
