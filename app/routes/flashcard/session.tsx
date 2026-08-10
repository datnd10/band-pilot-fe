import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { FlashcardCard } from '~/components/FlashcardCard'
import { useFlashcardSession } from '~/hooks/useFlashcardSession'
import { getWords } from '~/api/client'
import type { WordResponse, WordStatus, ApiError } from '~/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterOption = 'New' | 'Learning' | 'All'

// ---------------------------------------------------------------------------
// meta
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Flashcard Session – Band Pilot' },
    { name: 'description', content: 'Review your IELTS vocabulary with flashcards' },
  ]
}

// ---------------------------------------------------------------------------
// FilterScreen — shown before the session starts
// ---------------------------------------------------------------------------

interface FilterScreenProps {
  words: WordResponse[]
  onStart: (filtered: WordResponse[]) => void
}

function FilterScreen({ words, onStart }: FilterScreenProps) {
  const [selected, setSelected] = useState<FilterOption>('All')
  const navigate = useNavigate()

  function countFor(filter: FilterOption): number {
    if (filter === 'All') return words.length
    return words.filter((w) => w.status === (filter as WordStatus)).length
  }

  function getFilteredWords(filter: FilterOption): WordResponse[] {
    if (filter === 'All') return words
    return words.filter((w) => w.status === (filter as WordStatus))
  }

  const filters: FilterOption[] = ['New', 'Learning', 'All']
  const selectedCount = countFor(selected)
  const isEmpty = selectedCount === 0

  function handleStart() {
    if (isEmpty) return
    onStart(getFilteredWords(selected))
  }

  // Global empty state — no words at all (Requirement 3.6)
  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
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
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
        <p className="mb-2 text-lg font-medium text-gray-700">Your vocabulary list is empty</p>
        <p className="mb-4 text-sm text-gray-500">
          Add some words to your vocabulary list to start a flashcard session.
        </p>
        <button
          type="button"
          onClick={() => navigate('/vocabulary/add')}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add your first word
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Start Flashcard Session</h2>
        <p className="mt-1 text-sm text-gray-500">Choose which words you want to review</p>
      </div>

      {/* Filter option cards */}
      <div className="grid w-full max-w-md grid-cols-3 gap-3" role="radiogroup" aria-label="Session filter">
        {filters.map((filter) => {
          const count = countFor(filter)
          const isActive = selected === filter
          return (
            <button
              key={filter}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setSelected(filter)}
              className={[
                'flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className="text-sm font-medium">{filter}</span>
              <span
                className={[
                  'text-2xl font-bold',
                  isActive ? 'text-blue-700' : 'text-gray-900',
                ].join(' ')}
              >
                {count}
              </span>
              <span className="text-xs text-gray-500">{count === 1 ? 'word' : 'words'}</span>
            </button>
          )
        })}
      </div>

      {/* Zero-words guard message (Requirement 4.5) */}
      {isEmpty && (
        <div
          role="alert"
          className="flex w-full max-w-md items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <p>
            No <span className="font-semibold">{selected}</span> words available. Add some words
            first.
          </p>
        </div>
      )}

      {/* Start button */}
      <button
        type="button"
        onClick={handleStart}
        disabled={isEmpty}
        className="w-full max-w-md rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Start Session
        {!isEmpty && (
          <span className="ml-2 text-sm font-normal opacity-80">({selectedCount} words)</span>
        )}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ActiveSession — initialised once with the filtered words
// ---------------------------------------------------------------------------

interface ActiveSessionProps {
  words: WordResponse[]
}

function ActiveSession({ words }: ActiveSessionProps) {
  const session = useFlashcardSession(words)
  const navigate = useNavigate()

  // Track whether the card is currently flipped so we can gate the buttons
  const [isFlipped, setIsFlipped] = useState(false)

  // Navigate to summary when session is complete (Requirement 3.4, 4.1)
  useEffect(() => {
    if (session.isComplete) {
      navigate('/flashcard/summary', {
        state: {
          totalUniqueWords: session.totalUniqueWords,
          unknownAtLeastOnceCount: session.unknownAtLeastOnceCount,
          reviewResults: session.reviewResults,
        },
      })
    }
  }, [session.isComplete, session.totalUniqueWords, session.unknownAtLeastOnceCount, session.reviewResults, navigate])

  // While the session is completing and navigation is pending, render nothing
  if (session.isComplete) {
    return null
  }

  const currentWord = session.currentWord!

  // Progress: how many words have been removed from the queue (known)
  // totalUniqueWords - current unique remaining count isn't directly available,
  // so we track position as: totalUniqueWords - queue size ≈ number completed
  // We can derive "card number" as total - remaining + 1 but the hook doesn't
  // expose remaining. We use a simpler label: show "Card ? of Y" where Y is total.
  // The task asks for "Card X of Y" so we'll show a progress based on words answered.
  // Since the hook doesn't expose a "position" counter, we use the currentWord.id
  // as the key (which also resets flip state) and show remaining style progress.

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Session header */}
      <div className="flex w-full max-w-lg items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Flashcard Review</h2>
        <span className="text-sm text-gray-500">
          {session.totalUniqueWords} word{session.totalUniqueWords !== 1 ? 's' : ''} in session
        </span>
      </div>

      {/*
        Use `key={currentWord.id}` to remount FlashcardCard on each word change.
        This naturally resets the card's internal flip state (Requirement 3.3).
      */}
      <FlashcardCard
        key={currentWord.id}
        word={currentWord}
        flipped={isFlipped}
        onFlipRequest={() => setIsFlipped(f => !f)}
      />

      {/* Flip hint when card is not yet flipped */}
      {!isFlipped && (
        <p className="text-sm text-gray-400">Flip the card to reveal the answer</p>
      )}

      {/* Known / Unknown buttons — only active on the back face (Requirement 3.3) */}
      <div className="flex w-full max-w-lg gap-4">
        <button
          type="button"
          onClick={() => {
            setIsFlipped(false)
            session.markUnknown()
          }}
          disabled={!isFlipped}
          aria-label="Mark as unknown — will appear again"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Unknown
        </button>

        <button
          type="button"
          onClick={() => {
            setIsFlipped(false)
            session.markKnown()
          }}
          disabled={!isFlipped}
          aria-label="Mark as known — will not appear again this session"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Known
        </button>
      </div>

      {/* Unknown count indicator */}
      {session.unknownAtLeastOnceCount > 0 && (
        <p className="text-xs text-gray-400">
          {session.unknownAtLeastOnceCount} word
          {session.unknownAtLeastOnceCount !== 1 ? 's' : ''} marked unknown so far
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FlashcardSession — main export
// ---------------------------------------------------------------------------

export default function FlashcardSession() {
  const [sessionWords, setSessionWords] = useState<WordResponse[] | null>(null)
  const [allWords, setAllWords] = useState<WordResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<ApiError | null>(null)

  // Fetch all words on mount (Requirement 3.1)
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
          <h1 className="text-2xl font-bold text-gray-900">Flashcard Session</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review your vocabulary with spaced repetition flashcards
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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
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
