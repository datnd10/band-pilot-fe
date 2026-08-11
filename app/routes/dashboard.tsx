import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { getSrsProgress } from '~/api/client'
import type { ProgressResponse, ApiError } from '~/types'

export function meta() {
  return [{ title: 'Dashboard – Band Pilot' }]
}

// ---------------------------------------------------------------------------
// StatCard — inline sub-component
// ---------------------------------------------------------------------------

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm text-center">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProgressBar — inline sub-component
// ---------------------------------------------------------------------------

function ProgressBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DashboardPage — main exported component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [data, setData] = useState<ProgressResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  // Incrementing fetchKey triggers a re-run of the useEffect for retry
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getSrsProgress()
      .then(res => { if (!cancelled) setData(res) })
      .catch((err: ApiError) => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fetchKey])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="mt-3 text-sm text-gray-500">Loading progress…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600">{error.message}</p>
        <button
          type="button"
          onClick={() => setFetchKey(k => k + 1)}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Learning Progress</h1>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Words" value={data.totalWords} />
        <StatCard label="Learned" value={data.learnedWords} />
        <StatCard label="Mature" value={data.matureWords} />
        <StatCard label="Due Today" value={data.dueToday} />
      </div>

      {/* Progress bars */}
      <ProgressBar label="Learned" value={data.learnedWords} total={data.totalWords} />
      <ProgressBar label="Mature" value={data.matureWords} total={data.totalWords} />

      {/* Start Review link */}
      <Link
        to="/review"
        className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        Start Review
      </Link>
    </div>
  )
}
