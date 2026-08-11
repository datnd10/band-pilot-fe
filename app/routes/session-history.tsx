import { useState, useEffect, useCallback } from 'react'
import type { SessionSummary, SessionDetail, ApiError } from '~/types'
import { getSessionHistory, getSessionDetail } from '~/api/client'

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const VN_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function formatVietnamDate(isoString: string): string {
  try {
    return VN_FORMATTER.format(new Date(isoString))
  } catch {
    return isoString
  }
}

function formatDuration(startedAt: string, completedAt: string): string {
  const startMs = new Date(startedAt).getTime()
  const endMs = new Date(completedAt).getTime()
  const diffSeconds = Math.max(0, Math.round((endMs - startMs) / 1000))
  const minutes = Math.floor(diffSeconds / 60)
  const seconds = diffSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

// ---------------------------------------------------------------------------
// Rating badge
// ---------------------------------------------------------------------------

type Rating = 'EASY' | 'GOOD' | 'AGAIN'

const RATING_STYLES: Record<Rating, string> = {
  EASY:  'bg-green-100 text-green-700',
  GOOD:  'bg-blue-100 text-blue-700',
  AGAIN: 'bg-red-100 text-red-700',
}

function RatingBadge({ rating }: { rating: Rating }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${RATING_STYLES[rating]}`}
    >
      {rating}
    </span>
  )
}

// ---------------------------------------------------------------------------
// SessionRow
// ---------------------------------------------------------------------------

interface SessionRowProps {
  session: SessionSummary
  isSelected: boolean
  onSelect: () => void
}

function SessionRow({ session, isSelected, onSelect }: SessionRowProps) {
  const baseClass =
    'cursor-pointer rounded-lg border px-4 py-3 transition-colors hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400'
  const selectedClass = 'border-blue-500 bg-blue-50 shadow-sm'
  const normalClass = 'border-gray-200 bg-white'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isSelected}
      aria-label={`Session on ${formatVietnamDate(session.completedAt)}`}
      className={`${baseClass} ${isSelected ? selectedClass : normalClass}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Date/time */}
        <div className="min-w-[150px]">
          <p className="text-sm font-medium text-gray-900">
            {formatVietnamDate(session.completedAt)}
          </p>
          <p className="text-xs text-gray-500">
            {formatDuration(session.startedAt, session.completedAt)}
          </p>
        </div>

        {/* Word count */}
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <span className="font-semibold">{session.totalUniqueWords}</span>
          <span className="text-gray-500">từ</span>
        </div>

        {/* Rating breakdown */}
        <div className="flex items-center gap-2 ml-auto">
          {session.easyCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                Easy {session.easyCount}
              </span>
            </span>
          )}
          {session.goodCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">
                Good {session.goodCount}
              </span>
            </span>
          )}
          {session.againCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">
                Again {session.againCount}
              </span>
            </span>
          )}
          {/* Chevron */}
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isSelected ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SessionDetailPanel
// ---------------------------------------------------------------------------

interface SessionDetailPanelProps {
  sessionId: string
  onClose: () => void
}

function SessionDetailPanel({ sessionId, onClose }: SessionDetailPanelProps) {
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)

    getSessionDetail(sessionId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data)
          setLoading(false)
        }
      })
      .catch((err: ApiError) => {
        if (!cancelled) {
          setError(err?.message ?? 'Không thể tải chi tiết session.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [sessionId])

  return (
    <div className="mt-1 rounded-lg border border-blue-200 bg-white shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-800">Chi tiết session</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng panel chi tiết"
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg
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

      <div className="px-4 py-3">
        {loading && (
          <div className="flex items-center justify-center py-6" role="status" aria-label="Đang tải">
            <svg
              className="h-6 w-6 animate-spin text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {detail && !loading && (
          <>
            {/* Summary strip */}
            <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-600">
              <span>📅 {formatVietnamDate(detail.completedAt)}</span>
              <span>⏱ {formatDuration(detail.startedAt, detail.completedAt)}</span>
              <span>📝 {detail.totalUniqueWords} từ</span>
              {detail.easyCount > 0 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                  Easy {detail.easyCount}
                </span>
              )}
              {detail.goodCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">
                  Good {detail.goodCount}
                </span>
              )}
              {detail.againCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">
                  Again {detail.againCount}
                </span>
              )}
            </div>

            {/* Word list */}
            <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50" role="list">
              {detail.wordResults.map((wr) => (
                <li
                  key={wr.wordId}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm font-medium text-gray-800">{wr.word}</span>
                  <RatingBadge rating={wr.rating as Rating} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SessionHistoryPage (default export)
// ---------------------------------------------------------------------------

export default function SessionHistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const fetchHistory = useCallback(() => {
    setLoading(true)
    setError(null)
    getSessionHistory(0, 50)
      .then((data) => {
        setSessions(data.content)
        setLoading(false)
      })
      .catch((err: ApiError) => {
        setError(err?.message ?? 'Không thể tải lịch sử session.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  function handleSelectSession(sessionId: string) {
    // Toggle: click same row → close; click different row → open new
    setSelectedSessionId((prev) => (prev === sessionId ? null : sessionId))
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-20"
        role="status"
        aria-label="Đang tải lịch sử"
      >
        <svg
          className="h-8 w-8 animate-spin text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="ml-3 text-gray-500">Đang tải lịch sử...</span>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-red-600">{error}</p>
        <button
          type="button"
          onClick={fetchHistory}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <p className="text-lg font-medium text-gray-700">Bạn chưa có buổi review nào</p>
        <p className="text-sm text-gray-500">
          Hãy bắt đầu review SRS để xem lịch sử học tập của bạn tại đây.
        </p>
      </div>
    )
  }

  // ── List state ─────────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Lịch sử Review</h1>

      <div className="space-y-2">
        {sessions.map((session) => (
          <div key={session.id}>
            <SessionRow
              session={session}
              isSelected={selectedSessionId === session.id}
              onSelect={() => handleSelectSession(session.id)}
            />
            {selectedSessionId === session.id && (
              <SessionDetailPanel
                sessionId={session.id}
                onClose={() => setSelectedSessionId(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
