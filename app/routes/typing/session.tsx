import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router'
import TypingPrompt from '~/components/TypingPrompt'
import { useTypingSession } from '~/hooks/useTypingSession'
import { getWords, getGroups, getGroup } from '~/api/client'
import type { WordResponse, WordStatus, GroupResponse, ApiError } from '~/types'

// ---------------------------------------------------------------------------
// meta
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Typing Test – Band Pilot' },
    { name: 'description', content: 'Test your IELTS vocabulary by typing the English words' },
  ]
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SourceType = 'full' | 'group' | 'status'
type FilterOption = 'New' | 'Learning' | 'All'

// ---------------------------------------------------------------------------
// FilterScreen — source selection + sub-selection before session starts
// ---------------------------------------------------------------------------

interface FilterScreenProps {
  words: WordResponse[]
  onStart: (filtered: WordResponse[]) => void
}

function FilterScreen({ words, onStart }: FilterScreenProps) {
  const [sourceType, setSourceType] = useState<SourceType>('full')
  const [statusFilter, setStatusFilter] = useState<FilterOption>('All')
  const [groups, setGroups] = useState<GroupResponse[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [groupWords, setGroupWords] = useState<WordResponse[] | null>(null)
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [groupWordsLoading, setGroupWordsLoading] = useState(false)
  const [groupsError, setGroupsError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Fetch groups when "By Group" is selected
  useEffect(() => {
    if (sourceType !== 'group') return
    let cancelled = false
    setGroupsLoading(true)
    setGroupsError(null)
    getGroups()
      .then((data) => {
        if (!cancelled) {
          setGroups(data)
          if (data.length > 0) setSelectedGroupId(data[0].id)
        }
      })
      .catch(() => {
        if (!cancelled) setGroupsError('Failed to load groups.')
      })
      .finally(() => {
        if (!cancelled) setGroupsLoading(false)
      })
    return () => { cancelled = true }
  }, [sourceType])

  // Fetch words for the selected group
  useEffect(() => {
    if (sourceType !== 'group' || !selectedGroupId) {
      setGroupWords(null)
      return
    }
    let cancelled = false
    setGroupWordsLoading(true)
    getGroup(selectedGroupId)
      .then((data) => {
        if (!cancelled) setGroupWords(data.words)
      })
      .catch(() => {
        if (!cancelled) setGroupWords([])
      })
      .finally(() => {
        if (!cancelled) setGroupWordsLoading(false)
      })
    return () => { cancelled = true }
  }, [sourceType, selectedGroupId])

  // Derive the word count and filtered list for the current selection
  function countForStatus(filter: FilterOption): number {
    if (filter === 'All') return words.length
    return words.filter((w) => w.status === (filter as WordStatus)).length
  }

  function getFilteredByStatus(filter: FilterOption): WordResponse[] {
    if (filter === 'All') return words
    return words.filter((w) => w.status === (filter as WordStatus))
  }

  const statusFilters: FilterOption[] = ['New', 'Learning', 'All']

  // Determine ready state and word list for start
  let canStart = false
  let startWords: WordResponse[] = []
  let startCount = 0

  if (sourceType === 'full') {
    startWords = words
    startCount = words.length
    canStart = startCount > 0
  } else if (sourceType === 'status') {
    startWords = getFilteredByStatus(statusFilter)
    startCount = startWords.length
    canStart = startCount > 0
  } else if (sourceType === 'group') {
    startWords = groupWords ?? []
    startCount = startWords.length
    canStart = !groupWordsLoading && groupWords !== null && startCount > 0
  }

  function handleStart() {
    if (!canStart) return
    onStart(startWords)
  }

  // Global empty state — no words at all (Requirement 8.2)
  if (words.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center"
        data-testid="typing-empty-state"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mb-4 h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <p className="mb-2 text-lg font-medium text-gray-700">Your vocabulary list is empty</p>
        <p className="mb-4 text-sm text-gray-500">
          Add some words to your vocabulary list to start a typing test.
        </p>
        <button
          type="button"
          onClick={() => navigate('/vocabulary/add')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add your first word
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Start Typing Test</h2>
        <p className="mt-1 text-sm text-gray-500">Choose which words you want to be tested on</p>
      </div>

      {/* Step 1: Source selection cards (Requirement 8.1) */}
      <div
        className="grid w-full max-w-md grid-cols-3 gap-3"
        role="radiogroup"
        aria-label="Session source"
        data-testid="source-type-selector"
      >
        {(
          [
            { value: 'full', label: 'Full List', description: `${words.length} words` },
            { value: 'group', label: 'By Group', description: 'Pick a group' },
            { value: 'status', label: 'By Status', description: 'New / Learning' },
          ] as { value: SourceType; label: string; description: string }[]
        ).map(({ value, label, description }) => {
          const isActive = sourceType === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setSourceType(value)}
              data-testid={`source-option-${value}`}
              className={[
                'flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                isActive
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-gray-500">{description}</span>
            </button>
          )
        })}
      </div>

      {/* Step 2a: By Group — group picker */}
      {sourceType === 'group' && (
        <div className="w-full max-w-md" data-testid="group-selector-section">
          {groupsLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              Loading groups…
            </div>
          )}

          {!groupsLoading && groupsError && (
            <p role="alert" className="text-sm text-red-600">{groupsError}</p>
          )}

          {!groupsLoading && !groupsError && groups.length === 0 && (
            <div
              className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-10 text-center"
              data-testid="no-groups-message"
            >
              <p className="mb-2 text-sm font-medium text-gray-700">No groups yet.</p>
              <p className="mb-4 text-xs text-gray-500">Create a group first to filter by it.</p>
              <Link
                to="/groups"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Go to Groups
              </Link>
            </div>
          )}

          {!groupsLoading && !groupsError && groups.length > 0 && (
            <div className="flex flex-col gap-3">
              <label htmlFor="group-select" className="text-sm font-medium text-gray-700">
                Select a group
              </label>
              <select
                id="group-select"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                data-testid="group-select"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.wordCount} {g.wordCount === 1 ? 'word' : 'words'})
                  </option>
                ))}
              </select>

              {/* Group word count / loading indicator */}
              {groupWordsLoading && (
                <p className="text-xs text-gray-400">Loading group words…</p>
              )}

              {/* Zero-words guard for selected group (Requirement 8.1, 8.2) */}
              {!groupWordsLoading && groupWords !== null && groupWords.length === 0 && (
                <div
                  role="alert"
                  data-testid="group-zero-words-alert"
                  className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p>This group has no words. Add words to the group first.</p>
                </div>
              )}

              {!groupWordsLoading && groupWords !== null && groupWords.length > 0 && (
                <p className="text-xs text-gray-500">
                  {groupWords.length} {groupWords.length === 1 ? 'word' : 'words'} in this group
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2b: By Status — status filter cards */}
      {sourceType === 'status' && (
        <div className="w-full max-w-md" data-testid="status-filter-section">
          <div
            className="grid grid-cols-3 gap-3"
            role="radiogroup"
            aria-label="Session filter"
          >
            {statusFilters.map((filter) => {
              const count = countForStatus(filter)
              const isActive = statusFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setStatusFilter(filter)}
                  data-testid={`status-filter-${filter.toLowerCase()}`}
                  className={[
                    'flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span className="text-sm font-medium">{filter}</span>
                  <span
                    className={[
                      'text-2xl font-bold',
                      isActive ? 'text-indigo-700' : 'text-gray-900',
                    ].join(' ')}
                  >
                    {count}
                  </span>
                  <span className="text-xs text-gray-500">{count === 1 ? 'word' : 'words'}</span>
                </button>
              )
            })}
          </div>

          {/* Zero-words guard for status filter (Requirement 8.2) */}
          {countForStatus(statusFilter) === 0 && (
            <div
              role="alert"
              data-testid="typing-zero-words-alert"
              className="mt-4 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p>
                No <span className="font-semibold">{statusFilter}</span> words available. Add some
                words first.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Start button */}
      <button
        type="button"
        onClick={handleStart}
        disabled={!canStart}
        data-testid="start-test-button"
        className="w-full max-w-md rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Start Test
        {canStart && (
          <span className="ml-2 text-sm font-normal opacity-80">({startCount} words)</span>
        )}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ActiveSession — the typing test itself (unchanged)
// ---------------------------------------------------------------------------

interface ActiveSessionProps {
  words: WordResponse[]
}

function ActiveSession({ words }: ActiveSessionProps) {
  const session = useTypingSession(words)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  // Navigate to summary when session is complete (Requirement 8.6)
  useEffect(() => {
    if (session.isComplete) {
      navigate('/typing/summary', {
        state: {
          totalUniqueWords: session.totalUniqueWords,
          firstAttemptCorrectCount: session.firstAttemptCorrectCount,
          multipleAttemptsCount: session.multipleAttemptsCount,
          sessionResults: session.sessionResults,
        },
      })
    }
  }, [
    session.isComplete,
    session.totalUniqueWords,
    session.firstAttemptCorrectCount,
    session.multipleAttemptsCount,
    session.sessionResults,
    navigate,
  ])

  // Focus input when feedback is cleared (returning to answer state)
  useEffect(() => {
    if (session.feedback === null && inputRef.current) {
      inputRef.current.focus()
    }
  }, [session.feedback])

  if (session.isComplete) {
    return null
  }

  const currentWord = session.currentWord!
  const showingFeedback = session.feedback !== null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (showingFeedback) return
    session.submitAnswer(inputValue)
  }

  function handleNext() {
    session.nextWord()
    setInputValue('')
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Session header */}
      <div className="flex w-full max-w-lg items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Typing Test</h2>
        <span className="text-sm text-gray-500">
          {session.totalUniqueWords} word{session.totalUniqueWords !== 1 ? 's' : ''} in session
        </span>
      </div>

      {/*
        Use key={currentWord.id} to remount TypingPrompt on each new word,
        which resets the phonetic toggle state naturally.
      */}
      <div className="w-full max-w-lg">
        <TypingPrompt key={currentWord.id} word={currentWord} />
      </div>

      {/* Answer form — hidden while feedback is displayed */}
      {!showingFeedback && (
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg flex-col gap-3"
          noValidate
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="answer-input" className="sr-only">
              Type the English word
            </label>
            <input
              ref={inputRef}
              id="answer-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type the English word…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-testid="answer-input"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            {/* Empty-input validation message (Requirement 8.8) */}
            {session.validationMessage && (
              <p
                role="alert"
                data-testid="validation-message"
                className="text-sm text-red-600"
              >
                {session.validationMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
      )}

      {/* Feedback panel — shown after submission (Requirement 8.3) */}
      {showingFeedback && (
        <div className="flex w-full max-w-lg flex-col gap-4">
          {session.feedback === 'correct' ? (
            /* ---- Correct feedback ---- */
            <div
              role="status"
              aria-live="polite"
              data-testid="feedback-correct"
              className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mt-0.5 h-6 w-6 shrink-0 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-base font-semibold text-green-800">Correct!</p>
                <p className="text-sm text-green-700">Well done — moving to the next word.</p>
              </div>
            </div>
          ) : (
            /* ---- Incorrect feedback (Requirement 8.3) ---- */
            <div
              role="alert"
              data-testid="feedback-incorrect"
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mt-0.5 h-6 w-6 shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <p className="text-base font-semibold text-red-800">Incorrect</p>
                {session.correctWordRevealed && (
                  <p className="mt-1 text-sm text-red-700">
                    The correct answer is:{' '}
                    <span
                      className="font-bold"
                      data-testid="correct-word-revealed"
                    >
                      {session.correctWordRevealed}
                    </span>
                  </p>
                )}
                <p className="mt-1 text-xs text-red-600">
                  This word will appear again later in the session.
                </p>
              </div>
            </div>
          )}

          {/* Continue button */}
          <button
            type="button"
            onClick={handleNext}
            data-testid="next-button"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TypingSession — main export
// ---------------------------------------------------------------------------

export default function TypingSession() {
  const [sessionWords, setSessionWords] = useState<WordResponse[] | null>(null)
  const [allWords, setAllWords] = useState<WordResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<ApiError | null>(null)

  // Fetch all words on mount (Requirement 8.1)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFetchError(null)

    getWords()
      .then((data) => {
        if (!cancelled) setAllWords(data)
      })
      .catch((err: ApiError) => {
        if (!cancelled) setFetchError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Page header — only shown on filter screen */}
      {sessionWords === null && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Typing Test</h1>
          <p className="mt-1 text-sm text-gray-500">
            See the Vietnamese meaning and type the English word
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          className="flex flex-col items-center gap-4 py-16 text-center"
          aria-busy="true"
          aria-label="Loading vocabulary"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Loading your vocabulary…</p>
        </div>
      )}

      {/* Fetch error state */}
      {!loading && fetchError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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
            <p className="font-medium">Failed to load vocabulary</p>
            <p className="mt-0.5 text-red-600">{fetchError.message}</p>
          </div>
        </div>
      )}

      {/* Filter screen — shown when session hasn't started yet */}
      {!loading && !fetchError && sessionWords === null && (
        <FilterScreen words={allWords} onStart={setSessionWords} />
      )}

      {/* Active session — rendered once words are confirmed; hook initialised once */}
      {!loading && !fetchError && sessionWords !== null && (
        <ActiveSession words={sessionWords} />
      )}
    </div>
  )
}
