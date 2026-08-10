import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { saveReviewSession } from '~/api/client'
import type { ApiError, ReviewSessionWordResult } from '~/types'

// ---------------------------------------------------------------------------
// meta
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Session Summary – Band Pilot' },
    { name: 'description', content: 'Your flashcard session results' },
  ]
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SummaryLocationState {
  totalUniqueWords: number
  unknownAtLeastOnceCount: number
  reviewResults: ReviewSessionWordResult[]
}

// ---------------------------------------------------------------------------
// SessionSummary — main export (Req 3.5, 4.1)
// ---------------------------------------------------------------------------

export default function SessionSummary() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as SummaryLocationState | null

  const [saveError, setSaveError] = useState<ApiError | null>(null)
  const [saved, setSaved] = useState(false)

  // Persist the session result on mount (Requirement 4.1)
  useEffect(() => {
    if (!state?.reviewResults) return

    saveReviewSession({ results: state.reviewResults })
      .then(() => setSaved(true))
      .catch((err: ApiError) => setSaveError(err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount

  // Guard: direct navigation without session state
  if (!state || typeof state.totalUniqueWords !== 'number') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="mb-4 text-gray-600">No session data found.</p>
        <button
          type="button"
          onClick={() => navigate('/flashcard/session')}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start a new session
        </button>
      </div>
    )
  }

  const { totalUniqueWords, unknownAtLeastOnceCount } = state
  const knownCount = totalUniqueWords - unknownAtLeastOnceCount
  const knownPct = totalUniqueWords > 0 ? Math.round((knownCount / totalUniqueWords) * 100) : 0

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {/* Heading */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Session Complete!</h1>
        <p className="mt-1 text-sm text-gray-500">Here's how you did</p>
      </div>

      {/* Stats cards (Requirement 3.5) */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        {/* Total unique words */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-gray-900">{totalUniqueWords}</p>
          <p className="mt-1 text-sm text-gray-500">
            {totalUniqueWords === 1 ? 'word' : 'words'} reviewed
          </p>
        </div>

        {/* Unknown at least once */}
        <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-red-700">{unknownAtLeastOnceCount}</p>
          <p className="mt-1 text-sm text-red-600">
            {unknownAtLeastOnceCount === 1 ? 'word' : 'words'} marked unknown
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {totalUniqueWords > 0 && (
        <div className="mb-8">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>{knownCount} known</span>
            <span>{knownPct}%</span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuenow={knownPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${knownPct}% of words known`}
          >
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${knownPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Non-blocking save error (Requirement 4.1) */}
      {saveError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
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
          <div>
            <p className="font-medium">Could not save session results</p>
            <p className="mt-0.5 text-amber-700">{saveError.message}</p>
          </div>
        </div>
      )}

      {/* Subtle save confirmation */}
      {saved && !saveError && (
        <p className="mb-6 text-center text-xs text-gray-400">Session results saved.</p>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate('/flashcard/session')}
          className="flex-1 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          New session
        </button>
        <button
          type="button"
          onClick={() => navigate('/vocabulary')}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Back to vocabulary
        </button>
      </div>
    </div>
  )
}
