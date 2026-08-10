import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { saveTypingSession } from '~/api/client'
import type { ApiError, TypingSessionWordResult } from '~/types'

// ---------------------------------------------------------------------------
// meta
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Typing Test Summary – Band Pilot' },
    { name: 'description', content: 'Your typing test session results' },
  ]
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SummaryLocationState {
  totalUniqueWords: number
  firstAttemptCorrectCount: number
  multipleAttemptsCount: number
  sessionResults: TypingSessionWordResult[]
}

// ---------------------------------------------------------------------------
// TypingSessionSummary — main export (Req 8.6, 8.7)
// ---------------------------------------------------------------------------

export default function TypingSessionSummary() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as SummaryLocationState | null

  const [saveError, setSaveError] = useState<ApiError | null>(null)
  const [saved, setSaved] = useState(false)

  // Persist the session result on mount (Requirement 8.7)
  useEffect(() => {
    if (!state?.sessionResults) return

    saveTypingSession({ results: state.sessionResults })
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
          onClick={() => navigate('/typing/session')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Start a new session
        </button>
      </div>
    )
  }

  const { totalUniqueWords, firstAttemptCorrectCount, multipleAttemptsCount } = state
  const firstPct =
    totalUniqueWords > 0
      ? Math.round((firstAttemptCorrectCount / totalUniqueWords) * 100)
      : 0

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
        <h1 className="text-2xl font-bold text-gray-900">Typing Test Complete!</h1>
        <p className="mt-1 text-sm text-gray-500">Here's how you did</p>
      </div>

      {/* Stats cards (Requirement 8.6) */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {/* Total unique words */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-gray-900">{totalUniqueWords}</p>
          <p className="mt-1 text-xs text-gray-500">
            {totalUniqueWords === 1 ? 'word' : 'words'} tested
          </p>
        </div>

        {/* First attempt correct */}
        <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-green-700">{firstAttemptCorrectCount}</p>
          <p className="mt-1 text-xs text-green-600">first attempt correct</p>
        </div>

        {/* Multiple attempts required */}
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-amber-700">{multipleAttemptsCount}</p>
          <p className="mt-1 text-xs text-amber-600">needed more attempts</p>
        </div>
      </div>

      {/* Progress bar — first-attempt accuracy */}
      {totalUniqueWords > 0 && (
        <div className="mb-8">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>{firstAttemptCorrectCount} first-try correct</span>
            <span>{firstPct}%</span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuenow={firstPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${firstPct}% of words correct on first attempt`}
          >
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${firstPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Non-blocking save error (Requirement 8.7) */}
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
          onClick={() => navigate('/typing/session')}
          className="flex-1 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
