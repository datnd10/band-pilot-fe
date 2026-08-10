import { useReducer, useMemo } from 'react'
import type { TypingSessionWordResult, WordResponse } from '~/types'

// Feature: ielts-vocabulary-learning, Property 26: Typing session queue management
// Feature: ielts-vocabulary-learning, Property 27: Typing session summary accuracy

export interface TypingSessionState {
  /** The word currently being prompted (null when session is complete). */
  currentWord: WordResponse | null
  /** True when all words have been answered correctly at least once. */
  isComplete: boolean
  /** Total number of unique words in the session (fixed at session start). */
  totalUniqueWords: number
  /** Count of words answered correctly on the first attempt. */
  firstAttemptCorrectCount: number
  /** Count of words that required more than one attempt. */
  multipleAttemptsCount: number
  /** Per-word results for the TypingSessionRequest payload. */
  sessionResults: TypingSessionWordResult[]
  /** Current feedback state; null while waiting for an answer. */
  feedback: 'correct' | 'incorrect' | null
  /** Validation message shown when an empty answer is submitted. */
  validationMessage: string | null
  /** The correct word revealed after an incorrect answer. */
  correctWordRevealed: string | null
  /** Submit an answer for the current word. */
  submitAnswer: (answer: string) => void
  /** Advance from feedback state back to the next prompt. */
  nextWord: () => void
  /** Restart the session with the original words. */
  reset: () => void
}

// ---------------------------------------------------------------------------
// Internal state shape
// ---------------------------------------------------------------------------

interface InternalState {
  queue: WordResponse[]
  /** wordId → number of attempts recorded so far */
  attemptCounts: Map<string, number>
  /** Set of wordIds that have been answered incorrectly at least once */
  incorrectWords: Set<string>
  firstAttemptCorrect: number
  multipleAttempts: number
  feedback: 'correct' | 'incorrect' | null
  validationMessage: string | null
  correctWordRevealed: string | null
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type SessionAction =
  | { type: 'SUBMIT_CORRECT'; wordId: string; wasPreviouslyIncorrect: boolean }
  | { type: 'SUBMIT_INCORRECT'; word: WordResponse }
  | { type: 'SUBMIT_EMPTY' }
  | { type: 'NEXT_WORD' }
  | { type: 'RESET'; initialQueue: WordResponse[] }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function typingSessionReducer(state: InternalState, action: SessionAction): InternalState {
  switch (action.type) {
    case 'SUBMIT_EMPTY':
      return {
        ...state,
        validationMessage: 'Please enter a word before submitting.',
        feedback: null,
        correctWordRevealed: null,
      }

    case 'SUBMIT_CORRECT': {
      const [, ...rest] = state.queue

      const newAttemptCounts = new Map(state.attemptCounts)
      const prevCount = newAttemptCounts.get(action.wordId) ?? 0
      newAttemptCounts.set(action.wordId, prevCount + 1)

      const newFirstAttemptCorrect = action.wasPreviouslyIncorrect
        ? state.firstAttemptCorrect
        : state.firstAttemptCorrect + 1

      const newMultipleAttempts = action.wasPreviouslyIncorrect
        ? state.multipleAttempts + 1
        : state.multipleAttempts

      return {
        ...state,
        queue: rest,
        attemptCounts: newAttemptCounts,
        firstAttemptCorrect: newFirstAttemptCorrect,
        multipleAttempts: newMultipleAttempts,
        feedback: 'correct',
        validationMessage: null,
        correctWordRevealed: null,
      }
    }

    case 'SUBMIT_INCORRECT': {
      const [, ...rest] = state.queue

      const newAttemptCounts = new Map(state.attemptCounts)
      const prevCount = newAttemptCounts.get(action.word.id) ?? 0
      newAttemptCounts.set(action.word.id, prevCount + 1)

      const newIncorrectWords = new Set(state.incorrectWords)
      newIncorrectWords.add(action.word.id)

      return {
        ...state,
        // Re-append word to end of queue
        queue: [...rest, action.word],
        attemptCounts: newAttemptCounts,
        incorrectWords: newIncorrectWords,
        feedback: 'incorrect',
        validationMessage: null,
        correctWordRevealed: action.word.word,
      }
    }

    case 'NEXT_WORD':
      return {
        ...state,
        feedback: null,
        correctWordRevealed: null,
        validationMessage: null,
      }

    case 'RESET':
      return buildInitialState(action.initialQueue)

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function buildInitialState(words: WordResponse[]): InternalState {
  return {
    queue: words,
    attemptCounts: new Map<string, number>(),
    incorrectWords: new Set<string>(),
    firstAttemptCorrect: 0,
    multipleAttempts: 0,
    feedback: null,
    validationMessage: null,
    correctWordRevealed: null,
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useTypingSession — manages the typing test session queue and attempt tracking.
 *
 * - `submitAnswer(answer)`: evaluates the trimmed, case-insensitive answer.
 *   - Empty input: sets a validation message without recording an attempt.
 *   - Correct on first attempt: increments firstAttemptCorrect, advances queue.
 *   - Correct after prior incorrect: increments multipleAttempts, advances queue.
 *   - Incorrect: re-appends word to end of queue, reveals correct word.
 * - `nextWord()`: clears feedback state to show the next prompt.
 * - `reset()`: restarts session with original words.
 * - Session is complete (`isComplete = true`) when queue is empty.
 */
export function useTypingSession(words: WordResponse[]): TypingSessionState {
  // Deduplicate by id and fix the initial queue once on mount
  const initialQueue = useMemo<WordResponse[]>(() => {
    const seen = new Set<string>()
    const unique: WordResponse[] = []
    for (const w of words) {
      if (!seen.has(w.id)) {
        seen.add(w.id)
        unique.push(w)
      }
    }
    return unique
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — initialise once on mount

  const [state, dispatch] = useReducer(
    typingSessionReducer,
    initialQueue,
    buildInitialState,
  )

  const totalUniqueWords = initialQueue.length

  // Build per-word results for the TypingSessionRequest payload.
  // attemptsRequired is at minimum 1 for completed words; words still in queue
  // are not included because the session is not yet complete for those words.
  // When isComplete, every word has been answered correctly, so attemptCounts
  // contains the full picture.
  const sessionResults: TypingSessionWordResult[] = initialQueue.map((w) => ({
    wordId: w.id,
    attemptsRequired: state.attemptCounts.get(w.id) ?? 1,
  }))

  const submitAnswer = (answer: string) => {
    if (!answer.trim()) {
      dispatch({ type: 'SUBMIT_EMPTY' })
      return
    }

    const currentWord = state.queue[0]
    if (!currentWord) return

    const isCorrect = answer.trim().toLowerCase() === currentWord.word.toLowerCase()

    if (isCorrect) {
      const wasPreviouslyIncorrect = state.incorrectWords.has(currentWord.id)
      dispatch({ type: 'SUBMIT_CORRECT', wordId: currentWord.id, wasPreviouslyIncorrect })
    } else {
      dispatch({ type: 'SUBMIT_INCORRECT', word: currentWord })
    }
  }

  const nextWord = () => dispatch({ type: 'NEXT_WORD' })

  const reset = () => dispatch({ type: 'RESET', initialQueue })

  return {
    currentWord: state.queue[0] ?? null,
    isComplete: state.queue.length === 0,
    totalUniqueWords,
    firstAttemptCorrectCount: state.firstAttemptCorrect,
    multipleAttemptsCount: state.multipleAttempts,
    sessionResults,
    feedback: state.feedback,
    validationMessage: state.validationMessage,
    correctWordRevealed: state.correctWordRevealed,
    submitAnswer,
    nextWord,
    reset,
  }
}

export default useTypingSession
