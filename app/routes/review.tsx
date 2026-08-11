import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ReviewCard } from '~/components/ReviewCard'
import { getSrsDueWords, submitSrsReview } from '~/api/client'
import { useSpeech } from '~/hooks/useSpeech'
import type { DueWordResponse, ReviewResponse, SrsRating, ApiError } from '~/types'

export function meta() {
  return [{ title: 'Daily Review – Band Pilot' }]
}

// ---------------------------------------------------------------------------
// ReviewSession — manages card progression and keyboard shortcuts
// ---------------------------------------------------------------------------

function ReviewSession({ words }: { words: DueWordResponse[] }) {
  const { speak } = useSpeech()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  // Rating counts
  const [againCount, setAgainCount] = useState(0)
  const [goodCount, setGoodCount] = useState(0)
  const [easyCount, setEasyCount] = useState(0)

  // Per-word review responses for the completion summary (Requirement 7.3)
  const [reviewResults, setReviewResults] = useState<Map<string, ReviewResponse>>(new Map())

  const total = words.length
  const currentWord = words[currentIndex] as DueWordResponse | undefined

  function flipCard() {
    // Front → back only; ignore if already flipped
    if (!flipped) setFlipped(true)
  }

  async function handleRate(rating: SrsRating) {
    if (!currentWord) return

    // Await the review submission and store the result for the completion summary.
    // If the call fails, still advance — fail silently for progression (Requirement 7.3).
    try {
      const result = await submitSrsReview({ wordId: currentWord.wordId, rating })
      setReviewResults(prev => {
        const next = new Map(prev)
        next.set(currentWord.wordId, result)
        return next
      })
    } catch {
      // Silently ignore — the session keeps going even if a single review fails
    }

    // Update counts
    if (rating === 'AGAIN') setAgainCount(c => c + 1)
    else if (rating === 'GOOD') setGoodCount(c => c + 1)
    else setEasyCount(c => c + 1)

    // Advance
    const nextIndex = currentIndex + 1
    if (nextIndex >= total) {
      setDone(true)
    } else {
      setCurrentIndex(nextIndex)
      setFlipped(false)
    }
  }

  // Use a ref to keep keyboard handlers fresh without re-registering
  const handlersRef = useRef({
    flipCard,
    speakCurrent: () => currentWord && speak(currentWord.word),
    flipped,
  })
  useEffect(() => {
    handlersRef.current = {
      flipCard,
      speakCurrent: () => currentWord && speak(currentWord.word),
      flipped,
    }
  })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        handlersRef.current.flipCard()
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        // Only pronounce when back face is visible
        if (handlersRef.current.flipped) {
          handlersRef.current.speakCurrent()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // register once — handlers always fresh via ref

  // ── Completion summary ──────────────────────────────────────────────────
  if (done) {
    // Build a word-lookup map for display names in the summary
    const wordMap = new Map(words.map(w => [w.wordId, w.word]))

    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900">Session complete!</h2>
        <p className="mt-2 text-sm text-gray-500">Here's how you did:</p>

        <div className="mt-6 flex justify-center gap-4">
          <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-4">
            <span className="text-2xl font-bold text-red-700">{againCount}</span>
            <span className="mt-1 text-xs font-medium text-red-600">Again</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-blue-200 bg-blue-50 px-6 py-4">
            <span className="text-2xl font-bold text-blue-700">{goodCount}</span>
            <span className="mt-1 text-xs font-medium text-blue-600">Good</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-green-200 bg-green-50 px-6 py-4">
            <span className="text-2xl font-bold text-green-700">{easyCount}</span>
            <span className="mt-1 text-xs font-medium text-green-600">Easy</span>
          </div>
        </div>

        {/* Per-word next review dates — Requirement 7.3 */}
        {reviewResults.size > 0 && (
          <div className="mt-8 text-left">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Next Review Dates
            </h3>
            <ul
              className="max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100"
              aria-label="Next review dates for rated words"
            >
              {Array.from(reviewResults.entries()).map(([wordId, result]) => (
                <li
                  key={wordId}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="font-medium text-gray-800 truncate pr-4">
                    {wordMap.get(wordId) ?? wordId}
                  </span>
                  <span className="shrink-0 text-gray-500">
                    {new Date(result.nextReviewDate + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Back to home
        </Link>
      </div>
    )
  }

  if (!currentWord) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Home
        </Link>
        <span className="text-sm font-medium text-gray-500">
          Card {currentIndex + 1} of {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <ReviewCard
        word={currentWord}
        flipped={flipped}
        onFlipRequest={flipCard}
        onRate={handleRate}
        examples={currentWord.examples}
      />

      {/* Keyboard hints */}
      <p className="mt-4 text-center text-xs text-gray-400">
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">Space</kbd>
        {' '}reveal &ensp;
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">P</kbd>
        {' '}pronounce (after reveal)
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ReviewPage — loads due words then hands off to ReviewSession
// ---------------------------------------------------------------------------

export default function ReviewPage() {
  const [dueWords, setDueWords] = useState<DueWordResponse[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    let cancelled = false
    getSrsDueWords()
      .then(words => {
        if (!cancelled) setDueWords(words)
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="mt-3 text-sm text-gray-500">Loading today's review…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600">{error.message}</p>
        <Link to="/" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    )
  }

  if (!dueWords || dueWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="text-xl font-semibold text-gray-900">All caught up!</h2>
        <p className="mt-2 text-sm text-gray-500">Come back tomorrow for more words to review.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-2 text-center">
        <h1 className="text-lg font-semibold text-gray-700">
          {dueWords.length} word{dueWords.length !== 1 ? 's' : ''} due today
        </h1>
      </div>
      <ReviewSession words={dueWords} />
    </div>
  )
}
