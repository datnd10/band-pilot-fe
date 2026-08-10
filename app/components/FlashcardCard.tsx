import { SpeakButton } from '~/components/SpeakButton'
import type { WordResponse } from '~/types'

interface FlashcardCardProps {
  word: WordResponse
  /** Controlled flip state — parent owns it */
  flipped: boolean
  /** Called when user clicks/keys the card to request a flip */
  onFlipRequest: () => void
}

/**
 * FlashcardCard — animated flip card (fully controlled).
 *
 * The parent owns `flipped` state and passes `onFlipRequest` to toggle it.
 * This lets keyboard handlers in the parent drive the flip without fighting
 * over an internal copy of the same boolean.
 *
 * Front face: English word, phonetic (if present).
 * Back face: Vietnamese meaning, word type (if present), first example (if present).
 */
export function FlashcardCard({ word, flipped, onFlipRequest }: FlashcardCardProps) {
  const firstExample = word.examples.length > 0 ? word.examples[0] : null

  return (
    <div
      className="relative h-64 w-full cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={onFlipRequest}
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Card back — click to flip to front' : 'Card front — click to reveal meaning'}
      onKeyDown={(e) => {
        // Card itself handles Enter; Space is handled at window level in parent
        if (e.key === 'Enter') {
          e.preventDefault()
          onFlipRequest()
        }
        // Prevent Space from scrolling when card is focused
        if (e.key === ' ') {
          e.preventDefault()
        }
      }}
    >
      {/* Inner flip container */}
      <div
        className="relative h-full w-full transition-transform duration-[600ms] ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-md"
          style={{ backfaceVisibility: 'hidden' }}
          aria-hidden={flipped}
        >
          <p className="text-center text-3xl font-bold text-gray-900">{word.word}</p>
          {word.phonetic?.trim() && (
            <p className="mt-2 text-center text-base text-gray-500">{word.phonetic}</p>
          )}
          {/* Speak button */}
          <div className="mt-3">
            <SpeakButton word={word.word} size="lg" />
          </div>
          <p className="mt-4 text-xs text-gray-400">Click or press Space to reveal</p>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-8 shadow-md"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          aria-hidden={!flipped}
        >
          <p className="text-center text-2xl font-semibold text-indigo-900">{word.meaning}</p>
          {word.type?.trim() && (
            <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-medium text-indigo-700">
              {word.type}
            </span>
          )}
          {firstExample && (
            <p className="mt-1 text-center text-sm italic text-gray-600">&ldquo;{firstExample}&rdquo;</p>
          )}
          <p className="mt-auto text-xs text-gray-400">Click or press Space to flip back</p>
        </div>
      </div>
    </div>
  )
}
