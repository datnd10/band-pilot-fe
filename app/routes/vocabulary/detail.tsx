import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import type { WordResponse, ApiError } from '~/types'
import { getWord } from '~/api/client'
import { StatusBadge } from '~/components/StatusBadge'

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Word Detail – Band Pilot' },
    { name: 'description', content: 'View vocabulary word detail' },
  ]
}

// ---------------------------------------------------------------------------
// WordDetail component
// ---------------------------------------------------------------------------

export default function WordDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [word, setWord] = useState<WordResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)

    getWord(id)
      .then((data) => {
        if (!cancelled) setWord(data)
      })
      .catch((err: ApiError) => {
        if (!cancelled) {
          if (err.status === 404) {
            // Word not found — navigate back to the list
            navigate('/vocabulary', { replace: true })
          } else {
            setError(err)
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, navigate])

  // -------------------------------------------------------------------------
  // Loading skeleton
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8" aria-busy="true" aria-label="Loading word detail">
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-gray-200" aria-hidden="true" />
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" aria-hidden="true" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" aria-hidden="true" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" aria-hidden="true" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" aria-hidden="true" />
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Error state (non-404 errors)
  // -------------------------------------------------------------------------

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <nav className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <Link
            to="/vocabulary"
            className="hover:text-gray-700 focus:outline-none focus:underline"
          >
            Vocabulary List
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-gray-900">Word Detail</span>
        </nav>
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
            <p className="font-medium">Failed to load word</p>
            <p className="mt-0.5 text-red-600">{error.message}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link
            to="/vocabulary"
            className="text-sm font-medium text-blue-600 hover:underline focus:outline-none"
          >
            ← Back to Vocabulary List
          </Link>
        </div>
      </div>
    )
  }

  if (!word) return null

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const hasPhonetic = Boolean(word.phonetic?.trim())
  const hasType = Boolean(word.type?.trim())
  const hasMeaning = Boolean(word.meaning?.trim())
  const hasExamples = word.examples.length > 0

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link
          to="/vocabulary"
          className="hover:text-gray-700 focus:outline-none focus:underline"
        >
          Vocabulary List
        </Link>
        <span aria-hidden="true">›</span>
        <span className="truncate text-gray-900">{word.word}</span>
      </nav>

      {/* Detail card */}
      <article
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        aria-label={`Word detail: ${word.word}`}
      >
        {/* Header row: word + status badge */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{word.word}</h1>
          <StatusBadge status={word.status} />
        </div>

        {/* Meta row: phonetic + type — only rendered when present (Requirements 5.3, 5.4) */}
        {(hasPhonetic || hasType) && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* Phonetic — omit entirely if absent (Requirement 5.3) */}
            {hasPhonetic && (
              <span
                aria-label="Phonetic transcription"
                className="font-mono text-base text-gray-500"
              >
                {word.phonetic}
              </span>
            )}
            {/* Word type — omit entirely if absent (Requirement 5.4) */}
            {hasType && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-600 italic">
                {word.type}
              </span>
            )}
          </div>
        )}

        {/* Vietnamese meaning — omit entirely if absent (Requirement 5.4) */}
        {hasMeaning && (
          <div className="mb-6">
            <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Meaning
            </dt>
            <dd className="text-base text-gray-800">{word.meaning}</dd>
          </div>
        )}

        {/* Divider */}
        <hr className="mb-5 border-gray-100" />

        {/* Example sentences — show all if present; otherwise prompt (Requirements 5.1, 5.5) */}
        <section aria-labelledby="examples-heading">
          <h2
            id="examples-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400"
          >
            Example Sentences
          </h2>

          {hasExamples ? (
            <ol className="space-y-2 pl-4" aria-label="Example sentences list">
              {word.examples.map((sentence, index) => (
                <li
                  key={index}
                  className="text-sm leading-relaxed text-gray-700"
                >
                  {sentence}
                </li>
              ))}
            </ol>
          ) : (
            /* No examples: visible message + actionable control (Requirement 5.5) */
            <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-amber-300 bg-amber-50 px-4 py-4">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 shrink-0 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z"
                  />
                </svg>
                <span>
                  No example sentences yet. Adding examples helps reinforce your memory of this word.
                </span>
              </div>
              <Link
                to={`/vocabulary/${word.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                aria-label={`Add example sentences for ${word.word}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Example Sentences
              </Link>
            </div>
          )}
        </section>

        {/* Divider */}
        <hr className="mt-5 mb-5 border-gray-100" />

        {/* Review Schedule — Requirements 7.1, 7.2 */}
        <section aria-labelledby="review-schedule-heading">
          <h2
            id="review-schedule-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400"
          >
            Review Schedule
          </h2>

          {word.nextReviewDate != null ? (
            <dl className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <dt className="text-xs font-medium text-gray-400">Next Review</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-800">
                  {new Date(word.nextReviewDate + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <dt className="text-xs font-medium text-gray-400">Interval</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-800">
                  {word.interval} day{word.interval !== 1 ? 's' : ''}
                </dd>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <dt className="text-xs font-medium text-gray-400">Repetitions</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-800">{word.repetitions}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-400 italic" aria-label="No review schedule">
              Not scheduled
            </p>
          )}
        </section>
      </article>

      {/* Action row */}
      <div className="mt-5 flex items-center justify-between">
        <Link
          to="/vocabulary"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:underline"
        >
          ← Back to Vocabulary List
        </Link>
        <Link
          to={`/vocabulary/${word.id}/edit`}
          className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Edit Word
        </Link>
      </div>
    </div>
  )
}
