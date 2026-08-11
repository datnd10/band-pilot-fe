import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { getSrsProgress, getStreak } from '~/api/client'
import { useNotificationReminder } from '~/hooks/useNotificationReminder'
import type { ProgressResponse, StreakResponse, ApiError } from '~/types'

export function meta() {
  return [{ title: 'Dashboard – Band Pilot' }]
}

// ---------------------------------------------------------------------------
// Badge label mapping
// ---------------------------------------------------------------------------

const BADGE_LABELS: Record<string, string> = {
  STREAK_3:   '3 ngày',
  STREAK_7:   '7 ngày',
  STREAK_14:  '14 ngày',
  STREAK_30:  '30 ngày',
  STREAK_60:  '60 ngày',
  STREAK_100: '100 ngày',
}

// ---------------------------------------------------------------------------
// NotificationBanner — inline sub-component
// ---------------------------------------------------------------------------

function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    return Notification.permission
  })
  const { checkAndNotify } = useNotificationReminder(permission === 'granted')

  async function requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      checkAndNotify() // check immediately after granting
    }
  }

  if (permission === 'unsupported' || permission === 'denied') return null

  if (permission === 'granted') {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
        <span aria-hidden="true">✅</span>
        <span>Thông báo nhắc ôn tập đã bật</span>
      </div>
    )
  }

  // permission === 'default'
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-blue-800">
        <span aria-hidden="true">🔔</span>
        <span>Bật nhắc nhở để không quên ôn tập hàng ngày</span>
      </div>
      <button
        type="button"
        onClick={requestPermission}
        className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Bật thông báo
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StreakCard — inline sub-component
// ---------------------------------------------------------------------------

function StreakCard({ streak }: { streak: StreakResponse }) {
  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50 p-5 mb-6">
      {/* Streak numbers row */}
      <div className="flex items-start gap-6 mb-4 flex-wrap">
        {/* Current streak */}
        <div className="text-center min-w-[80px]">
          <p className="text-3xl font-bold text-orange-600">
            🔥 {streak.currentStreak}
          </p>
          <p className="text-sm text-gray-500 mt-1">Ngày liên tục</p>
          {streak.currentStreak === 0 && (
            <p className="text-xs text-orange-400 mt-1">
              Hôm nay chưa học — bắt đầu nào!
            </p>
          )}
        </div>

        {/* Longest streak */}
        <div className="text-center min-w-[80px]">
          <p className="text-2xl font-semibold text-gray-700">
            {streak.longestStreak}
          </p>
          <p className="text-sm text-gray-500 mt-1">Kỷ lục</p>
        </div>

        {/* Active days last 30 */}
        <div className="text-center min-w-[80px]">
          <p className="text-2xl font-semibold text-gray-700">
            {streak.activeDaysLast30}
          </p>
          <p className="text-sm text-gray-500 mt-1">30 ngày qua</p>
        </div>
      </div>

      {/* Badge chips */}
      {streak.badges.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Milestone badges">
          {streak.badges.map(badge => (
            <span
              key={badge}
              className="rounded-full bg-orange-200 px-3 py-1 text-xs font-medium text-orange-800"
            >
              🏅 {BADGE_LABELS[badge] ?? badge}
            </span>
          ))}
        </div>
      )}
    </div>
  )
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
  const [streak, setStreak] = useState<StreakResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  // Incrementing fetchKey triggers a re-run of the useEffect for retry
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([getSrsProgress(), getStreak()])
      .then(([progress, streakData]) => {
        if (!cancelled) {
          setData(progress)
          setStreak(streakData)
        }
      })
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

      {/* Notification reminder banner */}
      <NotificationBanner />

      {/* Streak card */}
      {streak && <StreakCard streak={streak} />}

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
