import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { FlashcardCard } from '~/components/FlashcardCard'
import { getGroup } from '~/api/client'
import { useSpeech } from '~/hooks/useSpeech'
import type { WordResponse, ApiError } from '~/types'

export function meta() {
  return [{ title: 'Flashcards – Band Pilot' }]
}

// ---------------------------------------------------------------------------
// ActiveSession — Quizlet-style browse mode
// Space = flip, ← → = navigate between cards
// ---------------------------------------------------------------------------

function ActiveSession({ words: initialWords, groupId, groupName }: {
  words: WordResponse[]
  groupId: string
  groupName: string
}) {
  const navigate = useNavigate()
  const { speak } = useSpeech()
  const [words, setWords] = useState(initialWords)
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffled, setShuffled] = useState(false)

  function shuffle() {
    const arr = [...words]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setWords(arr)
    setIndex(0)
    setIsFlipped(false)
    setShuffled(true)
  }

  function unshuffle() {
    setWords(initialWords)
    setIndex(0)
    setIsFlipped(false)
    setShuffled(false)
  }

  const total = words.length
  const currentWord = words[index]
  const isFirst = index === 0
  const isLast = index === total - 1

  function goNext() {
    if (isLast) {
      navigate(`/groups/${groupId}/flashcard/summary`, {
        state: { totalUniqueWords: total, groupId, groupName },
      })
      return
    }
    setIsFlipped(false)
    setIndex(i => i + 1)
  }

  function goPrev() {
    if (isFirst) return
    setIsFlipped(false)
    setIndex(i => i - 1)
  }

  function flipCard() {
    setIsFlipped(f => !f)
  }

  // Use a ref to hold latest handlers so the event listener never goes stale
  const handlersRef = useRef({ goNext, goPrev, flipCard, speakCurrent: () => speak(words[index].word) })
  useEffect(() => {
    handlersRef.current = { goNext, goPrev, flipCard, speakCurrent: () => speak(words[index].word) }
  })
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't steal keys from input elements
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes((e.target as HTMLElement).tagName)) {
        // Allow Space/arrows even when a button is focused — blur it first
        if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          (e.target as HTMLElement).blur()
        } else {
          return
        }
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        handlersRef.current.flipCard()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handlersRef.current.goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlersRef.current.goPrev()
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        handlersRef.current.speakCurrent()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // register once — handlers always fresh via ref

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link to={`/groups/${groupId}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {groupName}
        </Link>
        <div className="flex items-center gap-3">
          {/* Shuffle toggle */}
          <button
            type="button"
            onClick={shuffled ? unshuffle : shuffle}
            title={shuffled ? 'Back to original order' : 'Shuffle cards'}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              shuffled
                ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h5l2 2H4V4zm15 0v5l-2-2v-3h-5l-2-2h7zM4 20v-5l2 2v3h5l2 2H4zm15 0h-5l-2-2h7v-3l2 2v3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l4 4-4 4M8 8L4 12l4 4" />
            </svg>
            {shuffled ? 'Shuffled' : 'Shuffle'}
          </button>
          <span className="text-sm font-medium text-gray-500">{index + 1} / {total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* Card — parent controls flip state directly */}
      <FlashcardCard word={currentWord} flipped={isFlipped} onFlipRequest={flipCard} />

      {/* Hint */}
      <p className="mt-4 text-center text-xs text-gray-400">
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">Space</kbd>
        {' '}flip &ensp;
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">←</kbd>
        {' '}prev &ensp;
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">→</kbd>
        {' '}next &ensp;
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">P</kbd>
        {' '}pronounce
      </p>

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          aria-label="Previous card"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Centre: flip button */}
        <button
          type="button"
          onClick={flipCard}
          className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
        >
          {isFlipped ? 'Show front' : 'Flip card'}
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label={isLast ? 'Finish' : 'Next card'}
          className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition-colors ${
            isLast
              ? 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700'
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isLast ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function GroupFlashcard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [words, setWords] = useState<WordResponse[] | null>(null)
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getGroup(id)
      .then(data => {
        if (cancelled) return
        if (data.words.length === 0) { navigate(`/groups/${id}`, { replace: true }); return }
        setGroupName(data.name)
        setWords(data.words)
      })
      .catch((err: ApiError) => {
        if (!cancelled) {
          if (err.status === 404) navigate('/groups', { replace: true })
          else setError(err)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, navigate])

  if (loading) return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      <p className="mt-3 text-sm text-gray-500">Loading flashcards…</p>
    </div>
  )

  if (error) return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-center">
      <p className="text-red-600">{error.message}</p>
      <Link to={`/groups/${id}`} className="mt-3 inline-block text-sm text-blue-600 hover:underline">← Back to set</Link>
    </div>
  )

  if (!words) return null
  return <ActiveSession words={words} groupId={id!} groupName={groupName} />
}
