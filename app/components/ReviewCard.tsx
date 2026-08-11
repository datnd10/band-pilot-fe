import { useState, useEffect } from 'react'
import { SpeakButton } from '~/components/SpeakButton'
import type { DueWordResponse, SrsRating } from '~/types'

interface ReviewCardProps {
  word: DueWordResponse
  /** Controlled flip state — parent owns it */
  flipped: boolean
  /** Called when user clicks the front face to request a flip */
  onFlipRequest: () => void
  /** Called when user clicks a rating button on the back face */
  onRate: (rating: SrsRating) => void
  /** Optional list of example sentences for the expand section */
  examples?: string[]
}

/**
 * ReviewCard — animated flip card for the SRS Daily Review session.
 *
 * Front face: Vietnamese meaning (large text) + hint to reveal.
 * Back face: English word, phonetic, type badge, example sentence,
 *            SpeakButton, expand toggle, and Again / Good / Easy rating buttons.
 *
 * Flip is front → back only. Clicking the back face does nothing.
 * Rating buttons are only shown on the back face.
 */
export function ReviewCard({ word, flipped, onFlipRequest, onRate, examples }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Reset expand state when the word changes
  useEffect(() => setExpanded(false), [word.wordId])

  return (
    <div
      className="relative h-72 w-full select-none"
      style={{ perspective: '1000px' }}
    >
      {/* Inner flip container */}
      <div
        className="relative h-full w-full transition-transform duration-[600ms] ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── Vietnamese meaning */}
        <div
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-md"
          style={{ backfaceVisibility: 'hidden' }}
          aria-hidden={flipped}
          onClick={onFlipRequest}
          role="button"
          tabIndex={flipped ? -1 : 0}
          aria-label="Card front — click to reveal English word"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onFlipRequest()
            }
            if (e.key === ' ') {
              e.preventDefault()
            }
          }}
        >
          <p className="text-center text-3xl font-semibold text-gray-900">{word.meaning}</p>
          <p className="mt-6 text-xs text-gray-400">
            Click or press{' '}
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">
              Space
            </kbd>{' '}
            to reveal
          </p>
        </div>

        {/* ── BACK ── English word + rating buttons */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-between overflow-y-auto rounded-2xl border border-indigo-100 bg-indigo-50 p-8 shadow-md"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          aria-hidden={!flipped}
        >
          {/* Word info */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <p className="text-center text-3xl font-bold text-indigo-900">{word.word}</p>
              <SpeakButton word={word.word} size="lg" />
            </div>
            {word.phonetic?.trim() && (
              <p className="text-center text-base text-gray-500">{word.phonetic}</p>
            )}
            {word.type?.trim() && (
              <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-medium text-indigo-700">
                {word.type}
              </span>
            )}
            {/* word.example (singular) kept for backward compatibility.
                Full examples list is shown in the Expand_Section below. */}
            {word.example?.trim() && (
              <p className="mt-1 text-center text-sm italic text-gray-600">
                &ldquo;{word.example}&rdquo;
              </p>
            )}
          </div>

          {/* Expand toggle + Expand_Section */}
          <div className="flex w-full flex-col items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              className="rounded text-xs font-medium text-indigo-600 underline hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
            >
              {expanded ? 'Hide details' : 'Show details'}
            </button>

            {expanded && (
              <div className="flex w-full flex-col items-center gap-1.5">
                {word.phonetic?.trim() && (
                  <p className="text-center text-base text-gray-500">{word.phonetic}</p>
                )}
                {word.type?.trim() && (
                  <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-medium text-indigo-700">
                    {word.type}
                  </span>
                )}
                {(word.examples ?? examples ?? []).length > 0 ? (
                  (word.examples ?? examples ?? []).map((ex, i) => (
                    <p key={i} className="text-sm italic text-gray-600">
                      &ldquo;{ex}&rdquo;
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No examples available.</p>
                )}
              </div>
            )}
          </div>

          {/* Rating buttons — only visible on back face */}
          <div className="flex w-full gap-3 pt-4">
            <button
              type="button"
              onClick={() => onRate('AGAIN')}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            >
              Again
            </button>
            <button
              type="button"
              onClick={() => onRate('GOOD')}
              className="flex-1 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
            >
              Good
            </button>
            <button
              type="button"
              onClick={() => onRate('EASY')}
              className="flex-1 rounded-xl border border-green-200 bg-green-50 py-2.5 text-sm font-semibold text-green-700 shadow-sm transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
            >
              Easy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
