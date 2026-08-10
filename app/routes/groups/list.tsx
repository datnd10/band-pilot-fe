import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router'
import type { GroupResponse, ApiError } from '~/types'
import { getGroups, createGroup } from '~/api/client'
import { useDebounce } from '~/hooks/useDebounce'

// ---------------------------------------------------------------------------
// meta
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Study Sets – Band Pilot' },
    { name: 'description', content: 'Manage your vocabulary study sets' },
  ]
}

// ---------------------------------------------------------------------------
// GroupCard
// ---------------------------------------------------------------------------

interface GroupCardProps {
  group: GroupResponse
}

function GroupCard({ group }: GroupCardProps) {
  return (
    <li>
      <Link
        to={`/groups/${group.id}`}
        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label={`Open group ${group.name}`}
      >
        <span className="truncate text-base font-semibold text-gray-900">
          {group.name}
        </span>
        <span className="ml-4 shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {group.wordCount} {group.wordCount === 1 ? 'word' : 'words'}
        </span>
      </Link>
    </li>
  )
}

// ---------------------------------------------------------------------------
// GroupList
// ---------------------------------------------------------------------------

export default function GroupList() {
  // --- data state ---
  const [groups, setGroups] = useState<GroupResponse[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [toastError, setToastError] = useState<ApiError | null>(null)

  // --- search state ---
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  // --- create-group form state ---
  const [newName, setNewName] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // --- fetch groups on mount ---
  useEffect(() => {
    let cancelled = false
    setLoadingGroups(true)
    setToastError(null)

    getGroups()
      .then((data) => {
        if (!cancelled) setGroups(data)
      })
      .catch((err: ApiError) => {
        if (!cancelled) setToastError(err)
      })
      .finally(() => {
        if (!cancelled) setLoadingGroups(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // --- create group handler ---
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setInlineError(null)

    const trimmed = newName.trim()

    // Client-side validation: 1–100 chars (Req 7.2)
    if (trimmed.length === 0) {
      setClientError('Group name is required.')
      inputRef.current?.focus()
      return
    }
    if (trimmed.length > 100) {
      setClientError('Group name must be 100 characters or fewer.')
      inputRef.current?.focus()
      return
    }
    setClientError(null)

    setSubmitting(true)
    try {
      const created = await createGroup({ name: trimmed })
      // Append the new group without a full reload (Req 7.1)
      setGroups((prev) => [...prev, created])
      setNewName('')
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 409) {
        // Duplicate group name (Req 7.1)
        setInlineError('A group with this name already exists.')
        inputRef.current?.focus()
      } else if (apiError.status === 400) {
        // Validation error from API (Req 7.2)
        setInlineError(apiError.message)
        inputRef.current?.focus()
      } else {
        // Network / 5xx → toast (Req 7.1)
        setToastError(apiError)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const displayedError = clientError ?? inlineError

  // --- filtered list ---
  const filteredGroups = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    if (!term) return groups
    return groups.filter(g => g.name.toLowerCase().includes(term))
  }, [groups, debouncedSearch])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb / back link */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Sets</h1>
        <p className="mt-1 text-sm text-gray-500">
          {loadingGroups
            ? 'Loading…'
            : debouncedSearch.trim()
              ? `${filteredGroups.length} of ${groups.length} set${groups.length !== 1 ? 's' : ''}`
              : `${groups.length} set${groups.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Search bar */}
      {!loadingGroups && groups.length > 0 && (
        <div className="mb-5 relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search study sets…"
            aria-label="Search study sets"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Toast error */}
      {toastError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <div>
            <p className="font-medium">Something went wrong</p>
            <p className="mt-0.5 text-red-600">{toastError.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastError(null)}
            aria-label="Dismiss error"
            className="ml-auto shrink-0 text-red-400 hover:text-red-600 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Create-group card */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Create a new study set</h2>
        <form onSubmit={handleCreate} noValidate>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex-1">
              <label htmlFor="group-name" className="sr-only">
                Group name
              </label>
              <input
                ref={inputRef}
                id="group-name"
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  // Clear errors as the user types
                  if (clientError) setClientError(null)
                  if (inlineError) setInlineError(null)
                }}
                placeholder="Group name (1–100 characters)"
                maxLength={101} // Let client validation fire, not browser truncation
                disabled={submitting}
                aria-describedby={displayedError ? 'group-name-error' : undefined}
                aria-invalid={displayedError ? 'true' : 'false'}
                className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                  displayedError
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {displayedError && (
                <p
                  id="group-name-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {displayedError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0"
            >
              {submitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Creating…
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Groups list */}
      {loadingGroups ? (
        // Loading skeleton
        <ul className="space-y-3" aria-busy="true" aria-label="Loading groups">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="h-14 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
              aria-hidden="true"
            />
          ))}
        </ul>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mb-2 text-lg font-medium text-gray-700">No study sets yet</p>
          <p className="text-sm text-gray-500">Create your first study set using the form above.</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        // No search results
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <p className="font-medium text-gray-600">No sets match "{searchInput}"</p>
          <button
            type="button"
            onClick={() => setSearchInput('')}
            className="mt-3 text-sm font-medium text-blue-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Study sets">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </ul>
      )}
    </div>
  )
}
