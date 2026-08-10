import { useReducer, useMemo } from 'react'
import type { ReviewSessionWordResult, WordResponse } from '~/types'

// Feature: ielts-vocabulary-learning, Property 10: Flashcard session queue management
// Feature: ielts-vocabulary-learning, Property 11: Flashcard session summary accuracy

export interface FlashcardSessionState {
  currentWord: WordResponse | null
  isComplete: boolean
  totalUniqueWords: number
  unknownAtLeastOnceCount: number
  /** Per-word results for all session words; populated when session completes. */
  reviewResults: ReviewSessionWordResult[]
  markKnown: () => void
  markUnknown: () => void
}

interface SessionState {
  queue: WordResponse[]
  unknownAtLeastOnce: Set<string>
}

type SessionAction = { type: 'MARK_KNOWN' } | { type: 'MARK_UNKNOWN' }

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  const [current, ...rest] = state.queue

  if (!current) {
    // Queue already empty — nothing to do
    return state
  }

  switch (action.type) {
    case 'MARK_KNOWN':
      // Remove current word from front; do not re-add
      return {
        queue: rest,
        unknownAtLeastOnce: state.unknownAtLeastOnce,
      }

    case 'MARK_UNKNOWN': {
      // Move current word to end of queue; record in unknown set
      const newUnknown = new Set(state.unknownAtLeastOnce)
      newUnknown.add(current.id)
      return {
        queue: [...rest, current],
        unknownAtLeastOnce: newUnknown,
      }
    }

    default:
      return state
  }
}

/**
 * useFlashcardSession — manages the flashcard review session queue.
 *
 * - `markKnown`: removes the current word from the queue (advances to next card).
 * - `markUnknown`: re-appends the current word to the end of the queue and records
 *   it in the "unknown at least once" set.
 * - Session is complete when the queue is empty.
 * - `totalUniqueWords` is fixed at the count of deduplicated words at initialisation.
 * - `unknownAtLeastOnceCount` reflects the current size of the unknown-words set.
 */
export function useFlashcardSession(words: WordResponse[]): FlashcardSessionState {
  // Deduplicate by id and fix the initial set once (initial value pattern — avoids
  // reinitialising on every render if `words` reference changes but content does not).
  const initialState = useMemo<SessionState>(() => {
    const seen = new Set<string>()
    const unique: WordResponse[] = []
    for (const w of words) {
      if (!seen.has(w.id)) {
        seen.add(w.id)
        unique.push(w)
      }
    }
    return { queue: unique, unknownAtLeastOnce: new Set<string>() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — initialise once on mount

  const [state, dispatch] = useReducer(sessionReducer, initialState)

  // totalUniqueWords is the count at session start (does not change)
  const totalUniqueWords = initialState.queue.length

  // Build per-word results array: all session words with unknownCount 1 if in the set, else 0.
  // This is stable enough for passing to the summary on navigation.
  const reviewResults: ReviewSessionWordResult[] = initialState.queue.map((w) => ({
    wordId: w.id,
    unknownCount: state.unknownAtLeastOnce.has(w.id) ? 1 : 0,
  }))

  return {
    currentWord: state.queue[0] ?? null,
    isComplete: state.queue.length === 0,
    totalUniqueWords,
    unknownAtLeastOnceCount: state.unknownAtLeastOnce.size,
    reviewResults,
    markKnown: () => dispatch({ type: 'MARK_KNOWN' }),
    markUnknown: () => dispatch({ type: 'MARK_UNKNOWN' }),
  }
}
