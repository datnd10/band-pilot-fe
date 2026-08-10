import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import type { WordResponse, WordType, WordStatus, ApiError } from '~/types'
import { getWords } from '~/api/client'
import { StatusBadge } from '~/components/StatusBadge'
import { SearchBar } from '~/components/SearchBar'
import { FilterBar } from '~/components/FilterBar'
import { useDebounce } from '~/hooks/useDebounce'
import { SpeakButton } from '~/components/SpeakButton'

// ---------------------------------------------------------------------------
// WordCard — read-only, no delete button
// ---------------------------------------------------------------------------

function WordCard({ word }: { word: WordResponse }) {
  return (
    <article
      className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      aria-label={`Vocabulary entry: ${word.word}`}
    >
      {/* Left: word info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-base font-semibold text-gray-900">{word.word}</span>
          <SpeakButton word={word.word} size="sm" />
          {word.phonetic && (
            <span className="font-mono text-sm text-gray-500">{word.phonetic}</span>
          )}
          {word.type && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 italic">
              {word.type}
            </span>
          )}
          <StatusBadge status={word.status} />
        </div>
        <p className="truncate text-sm text-gray-700">{word.meaning}</p>
      </div>

      {/* Right: view + edit only */}
      <div className="flex shrink-0 items-center gap-2">
        <Link
          to={`/vocabulary/${word.id}`}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          View
        </Link>
        <Link
          to={`/vocabulary/${word.id}/edit`}
          className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Edit
        </Link>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// WordList
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Dictionary – Band Pilot' },
    { name: 'description', content: 'Look up all IELTS vocabulary words' },
  ]
}

export default function WordList() {
  const [words, setWords] = useState<WordResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<ApiError | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [wordTypeFilter, setWordTypeFilter] = useState<WordType | ''>('')
  const [statusFilter, setStatusFilter] = useState<WordStatus | ''>('')

  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFetchError(null)
    getWords()
      .then(data => { if (!cancelled) setWords(data) })
      .catch((err: ApiError) => { if (!cancelled) setFetchError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filteredWords = useMemo(() => {
    return words.filter(w => {
      if (debouncedSearch.trim()) {
        const term = debouncedSearch.trim().toLowerCase()
        if (!w.word.toLowerCase().includes(term) && !w.meaning.toLowerCase().includes(term)) return false
      }
      if (wordTypeFilter && w.type !== wordTypeFilter) return false
      if (statusFilter && w.status !== statusFilter) return false
      return true
    })
  }, [words, debouncedSearch, wordTypeFilter, statusFilter])

  const hasActiveFilters = debouncedSearch.trim() !== '' || wordTypeFilter !== '' || statusFilter !== ''

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dictionary</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading…' : `${words.length} word${words.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        {/* Guide users to create words via Study Sets */}
        <Link
          to="/groups"
          className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add words via Study Sets
        </Link>
      </div>

      {/* Error */}
      {fetchError && (
        <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load: {fetchError.message}
        </div>
      )}

      {/* Search + filter */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Search by word or meaning…" />
        </div>
        <FilterBar
          wordType={wordTypeFilter}
          onWordTypeChange={setWordTypeFilter}
          status={statusFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      {/* Content */}
      {loading ? (
        <ul className="space-y-3" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-16 animate-pulse rounded-lg border border-gray-200 bg-gray-100" aria-hidden="true" />
          ))}
        </ul>
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="font-medium text-gray-600">No words yet</p>
          <p className="mt-1 text-sm text-gray-400">Create a study set and add words from there.</p>
          <Link to="/groups" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Go to Study Sets
          </Link>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <p className="font-medium text-gray-600">No matching words</p>
          <p className="mt-1 text-sm text-gray-400">
            {hasActiveFilters ? 'Try adjusting your search or filters.' : 'No words match.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setWordTypeFilter(''); setStatusFilter('') }}
              className="mt-3 text-sm font-medium text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Vocabulary list">
          {filteredWords.map(word => (
            <li key={word.id}><WordCard word={word} /></li>
          ))}
        </ul>
      )}

      {!loading && words.length > 0 && hasActiveFilters && filteredWords.length > 0 && (
        <p className="mt-4 text-right text-sm text-gray-500">
          Showing {filteredWords.length} of {words.length} words
        </p>
      )}
    </div>
  )
}
