import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import TypingPrompt from '~/components/TypingPrompt'
import { useTypingSession } from '~/hooks/useTypingSession'
import { getGroup } from '~/api/client'
import type { WordResponse, ApiError } from '~/types'

export function meta() {
  return [{ title: 'Typing Test – Band Pilot' }]
}

// ---------------------------------------------------------------------------
// Active session
// ---------------------------------------------------------------------------

function ActiveSession({ words, groupId, groupName }: { words: WordResponse[]; groupId: string; groupName: string }) {
  const session = useTypingSession(words)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (session.isComplete) {
      navigate(`/groups/${groupId}/typing/summary`, {
        state: {
          totalUniqueWords: session.totalUniqueWords,
          firstAttemptCorrectCount: session.firstAttemptCorrectCount,
          multipleAttemptsCount: session.multipleAttemptsCount,
          sessionResults: session.sessionResults,
          groupId,
          groupName,
        },
      })
    }
  }, [session.isComplete, session.totalUniqueWords, session.firstAttemptCorrectCount, session.multipleAttemptsCount, session.sessionResults, navigate, groupId, groupName])

  useEffect(() => {
    if (session.feedback === null && inputRef.current) inputRef.current.focus()
  }, [session.feedback])

  if (session.isComplete) return null

  const currentWord = session.currentWord!
  const showingFeedback = session.feedback !== null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (showingFeedback) return
    session.submitAnswer(inputValue)
  }

  function handleNext() {
    session.nextWord()
    setInputValue('')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to={`/groups/${groupId}`} className="text-sm text-gray-500 hover:text-gray-700">← {groupName}</Link>
          <h1 className="mt-1 text-xl font-bold text-gray-900">Typing Test</h1>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
          {session.totalUniqueWords} terms
        </span>
      </div>

      {/* Prompt */}
      <div className="mb-5">
        <TypingPrompt key={currentWord.id} word={currentWord} />
      </div>

      {/* Answer form */}
      {!showingFeedback && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type the English word…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-testid="answer-input"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {session.validationMessage && (
            <p role="alert" className="text-sm text-red-600">{session.validationMessage}</p>
          )}
          <button type="submit" className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700">
            Submit
          </button>
        </form>
      )}

      {/* Feedback */}
      {showingFeedback && (
        <div className="flex flex-col gap-4">
          {session.feedback === 'correct' ? (
            <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <p className="font-semibold text-green-800">Correct!</p>
            </div>
          ) : (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              <div>
                <p className="font-semibold text-red-800">Incorrect</p>
                {session.correctWordRevealed && (
                  <p className="mt-1 text-sm text-red-700">Answer: <span className="font-bold">{session.correctWordRevealed}</span></p>
                )}
              </div>
            </div>
          )}
          <button type="button" onClick={handleNext} className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700">
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shuffle helper
// ---------------------------------------------------------------------------
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function GroupTyping() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [originalWords, setOriginalWords] = useState<WordResponse[] | null>(null)
  const [sessionWords, setSessionWords] = useState<WordResponse[] | null>(null)
  const [shuffled, setShuffled] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  function handleShuffle() {
    if (!originalWords) return
    setSessionWords(shuffleArray(originalWords))
    setShuffled(true)
    setSessionKey(k => k + 1)
  }

  function handleUnshuffle() {
    if (!originalWords) return
    setSessionWords([...originalWords])
    setShuffled(false)
    setSessionKey(k => k + 1)
  }

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getGroup(id)
      .then(data => {
        if (cancelled) return
        if (data.words.length === 0) {
          navigate(`/groups/${id}`, { replace: true })
          return
        }
        setGroupName(data.name)
        setOriginalWords(data.words)
        setSessionWords(data.words)
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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="mt-3 text-sm text-gray-500">Loading test…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-red-600">{error.message}</p>
        <Link to={`/groups/${id}`} className="mt-3 inline-block text-sm text-blue-600 hover:underline">← Back to set</Link>
      </div>
    )
  }

  if (!sessionWords) return null

  return (
    <div>
      {/* Shuffle bar — shown above session */}
      <div className="mx-auto max-w-2xl px-4 pt-6 flex justify-end">
        <button
          type="button"
          onClick={shuffled ? handleUnshuffle : handleShuffle}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            shuffled
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4M4 12h4m8 0h4M12 4v4m0 8v4" />
          </svg>
          {shuffled ? 'Shuffled ✓' : 'Shuffle'}
        </button>
      </div>
      <ActiveSession key={sessionKey} words={sessionWords} groupId={id!} groupName={groupName} />
    </div>
  )
}
