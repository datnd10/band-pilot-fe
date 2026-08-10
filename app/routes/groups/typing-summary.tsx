import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { saveTypingSession } from '~/api/client'
import type { ApiError, TypingSessionWordResult } from '~/types'

export function meta() {
  return [{ title: 'Typing Test Summary – Band Pilot' }]
}

interface SummaryState {
  totalUniqueWords: number
  firstAttemptCorrectCount: number
  multipleAttemptsCount: number
  sessionResults: TypingSessionWordResult[]
  groupId: string
  groupName: string
}

export default function TypingSummary() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as SummaryState | null

  const [saveError, setSaveError] = useState<ApiError | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!state?.sessionResults) return
    saveTypingSession({ results: state.sessionResults })
      .then(() => setSaved(true))
      .catch((err: ApiError) => setSaveError(err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!state || typeof state.totalUniqueWords !== 'number') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">No session data.</p>
        <Link to={`/groups/${id}`} className="text-blue-600 hover:underline text-sm">← Back to set</Link>
      </div>
    )
  }

  const { totalUniqueWords, firstAttemptCorrectCount, multipleAttemptsCount, groupName } = state
  const firstPct = totalUniqueWords > 0 ? Math.round((firstAttemptCorrectCount / totalUniqueWords) * 100) : 0

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link to={`/groups/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← {groupName}</Link>

      <div className="mb-8 mt-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Test complete!</h1>
        <p className="mt-1 text-sm text-gray-500">{groupName}</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalUniqueWords}</p>
          <p className="mt-1 text-xs text-gray-500">tested</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{firstAttemptCorrectCount}</p>
          <p className="mt-1 text-xs text-green-600">first try</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{multipleAttemptsCount}</p>
          <p className="mt-1 text-xs text-amber-600">needed help</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>{firstAttemptCorrectCount} first-try correct</span><span>{firstPct}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuenow={firstPct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${firstPct}%` }} />
        </div>
      </div>

      {saveError && <p className="mb-4 text-center text-xs text-amber-600">Could not save: {saveError.message}</p>}
      {saved && <p className="mb-4 text-center text-xs text-gray-400">Session saved.</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate(`/groups/${id}/typing`)}
          className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Test again
        </button>
        <Link
          to={`/groups/${id}`}
          className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back to set
        </Link>
      </div>
    </div>
  )
}
