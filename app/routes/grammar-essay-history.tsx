import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { getEssayHistory, getEssayDetail } from '~/api/client'
import type { EssayHistoryItem, EssayHistoryDetail } from '~/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function bandColor(score: number): string {
  if (score >= 7) return 'bg-green-100 text-green-800 border-green-300'
  if (score >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  return 'bg-red-100 text-red-800 border-red-300'
}

function bandBarColor(score: number): string {
  if (score >= 7) return 'bg-green-500'
  if (score >= 5) return 'bg-yellow-400'
  return 'bg-red-500'
}

// ---------------------------------------------------------------------------
// ScoreBar
// ---------------------------------------------------------------------------

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 9) * 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${bandColor(score)}`}>
          {score}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div
          className={`h-1.5 rounded-full ${bandBarColor(score)}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={1}
          aria-valuemax={9}
          aria-label={`${label}: ${score} out of 9`}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DetailPanel — expanded accordion content
// ---------------------------------------------------------------------------

function DetailPanel({ detail }: { detail: EssayHistoryDetail }) {
  return (
    <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
      {/* Full question */}
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Question</h3>
        <p className="text-sm text-gray-800 leading-relaxed">{detail.question}</p>
      </div>

      {/* Full essay */}
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Your Essay</h3>
        <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-200">
          {detail.essay}
        </p>
      </div>

      {/* Strengths */}
      {detail.strengths.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-green-800">Strengths</h3>
          <ul className="space-y-1.5">
            {detail.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                <span aria-hidden="true">✅</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {detail.improvements.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-amber-800">Areas for Improvement</h3>
          <ul className="space-y-1.5">
            {detail.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span aria-hidden="true">💡</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved version */}
      {detail.improvedVersion && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">Example Improvement</h3>
          <blockquote className="rounded-lg border-l-4 border-blue-400 bg-gray-50 px-3 py-2 text-sm text-gray-700 italic leading-relaxed">
            {detail.improvedVersion}
          </blockquote>
        </div>
      )}

      {/* Encouragement */}
      {detail.encouragement && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm text-purple-800">{detail.encouragement}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// EssayCard — a single history item with accordion expand
// ---------------------------------------------------------------------------

function EssayCard({ item }: { item: EssayHistoryItem }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<EssayHistoryDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggle() {
    if (expanded) {
      setExpanded(false)
      return
    }
    setExpanded(true)
    if (detail) return // already loaded

    setLoading(true)
    setError(null)
    try {
      const d = await getEssayDetail(item.id)
      setDetail(d)
    } catch {
      setError('Failed to load detail. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Card header — always visible */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Date */}
            <p className="text-xs text-gray-500 mb-1">{formatDate(item.submittedAt)}</p>
            {/* Question preview */}
            <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">{item.question}</p>
          </div>

          {/* Overall band badge */}
          <div className="flex shrink-0 flex-col items-center">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-extrabold text-lg ${bandColor(item.overallBand)}`}>
              {item.overallBand}
            </div>
            <span className="mt-1 text-xs text-gray-500">Band</span>
          </div>
        </div>

        {/* 4 criterion bars */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <ScoreBar label="Task Achievement" score={item.taskAchievement} />
          <ScoreBar label="Coherence & Cohesion" score={item.coherenceCohesion} />
          <ScoreBar label="Lexical Resource" score={item.lexicalResource} />
          <ScoreBar label="Grammatical Range" score={item.grammaticalRange} />
        </div>

        {/* Expand indicator */}
        <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
          <svg
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? 'Hide detail' : 'View full feedback'}
        </div>
      </button>

      {/* Accordion content */}
      {expanded && (
        <div>
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading detail…
            </div>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
          {detail && !loading && (
            <DetailPanel detail={detail} />
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function GrammarEssayHistoryPage() {
  const [items, setItems] = useState<EssayHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getEssayHistory()
      .then(setItems)
      .catch(() => setError('Failed to load essay history. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Essay History</h1>
          <p className="mt-1 text-sm text-gray-500">Your past IELTS Writing Task 2 submissions</p>
        </div>
        <Link
          to="/grammar/essay"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Write New Essay
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading history…
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-gray-500 mb-4">You haven't submitted any essays yet.</p>
          <Link
            to="/grammar/essay"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Write Your First Essay
          </Link>
        </div>
      )}

      {/* List */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <EssayCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
