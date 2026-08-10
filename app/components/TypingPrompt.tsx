import { useState } from 'react'
import type { WordResponse } from '~/types'

interface TypingPromptProps {
  word: WordResponse
}

/**
 * TypingPrompt — displays the prompt for a typing test session.
 *
 * Always shows: Vietnamese meaning (required field).
 * Conditionally shows: word type hint — only if type is non-null/non-empty.
 * Conditionally shows: phonetic toggle button — only if phonetic is non-null/non-empty;
 *   the phonetic transcription is hidden by default and toggled on demand.
 *
 * Validates: Requirements 8.1
 * Property 24: For any WordEntry, the typing prompt SHALL display the Vietnamese meaning;
 *   it SHALL display the word type if and only if the type field is non-null/non-empty;
 *   it SHALL show a phonetic toggle control if and only if the phonetic transcription is
 *   non-null/non-empty.
 */
export default function TypingPrompt({ word }: TypingPromptProps) {
  const [phoneticVisible, setPhoneticVisible] = useState(false)

  // Derive presence flags — treat null, undefined, and empty/whitespace as absent
  const hasType = Boolean(word.type && word.type.trim() !== '')
  const hasPhonetic = Boolean(word.phonetic && word.phonetic.trim() !== '')

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
      {/* Vietnamese meaning — always displayed prominently */}
      <p
        className="text-center text-3xl font-bold text-gray-900"
        data-testid="typing-prompt-meaning"
      >
        {word.meaning}
      </p>

      {/* Word type hint — rendered only when type is present */}
      {hasType && (
        <span
          className="rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-700"
          data-testid="typing-prompt-type"
        >
          {word.type}
        </span>
      )}

      {/* Phonetic section — rendered only when phonetic is present */}
      {hasPhonetic && (
        <div className="flex flex-col items-center gap-2">
          {/* Toggle button — always visible when phonetic is present */}
          <button
            type="button"
            onClick={() => setPhoneticVisible((v) => !v)}
            className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
            aria-expanded={phoneticVisible}
            aria-controls="typing-prompt-phonetic"
            data-testid="typing-prompt-phonetic-toggle"
          >
            {phoneticVisible ? 'Hide phonetic' : 'Show phonetic'}
          </button>

          {/* Phonetic transcription — hidden by default, revealed on toggle */}
          {phoneticVisible && (
            <p
              id="typing-prompt-phonetic"
              className="text-center text-base text-gray-500"
              data-testid="typing-prompt-phonetic"
            >
              {word.phonetic}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
