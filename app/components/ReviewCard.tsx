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
}

/**
 * ReviewCard — animated flip card for the SRS Daily Review session.
 *
 * Front face: Vietnamese meaning (large text) + hint to reveal.
 * Back face: English word, phonetic, type badge, example sentence,
 *            SpeakButton, and Again / Good / Easy rating buttons.
 *
 * Flip is front → back only. Clicking the back face does nothing.
 * Rating buttons are only shown on the back face.
 */
export function ReviewCard({ word, flipped, onFlipRequest, onRate }: ReviewCardProps) {
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
          className="absolute inset-0 flex flex-col items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 p-8 shadow-md"
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
            {word.example?.trim() && (
              <p className="mt-1 text-center text-sm italic text-gray-600">
                &ldquo;{word.example}&rdquo;
              </p>
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
