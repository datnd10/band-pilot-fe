import { Link, useLocation, useNavigate, useParams } from 'react-router'

export function meta() {
  return [{ title: 'Flashcard Summary – Band Pilot' }]
}

interface SummaryState {
  totalUniqueWords: number
  groupId: string
  groupName: string
}

export default function FlashcardSummary() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as SummaryState | null

  if (!state || typeof state.totalUniqueWords !== 'number') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">No session data.</p>
        <Link to={`/groups/${id}`} className="text-blue-600 hover:underline text-sm">← Back to set</Link>
      </div>
    )
  }

  const { totalUniqueWords, groupName } = state

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {/* Icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">You've reviewed all cards!</h1>
      <p className="mt-2 text-gray-500">{groupName} · {totalUniqueWords} terms</p>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => navigate(`/groups/${id}/flashcard`)}
          className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Study again
        </button>
        <Link
          to={`/groups/${id}`}
          className="rounded-xl border border-gray-300 bg-white px-8 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back to set
        </Link>
      </div>
    </div>
  )
}
