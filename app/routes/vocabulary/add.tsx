import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import type { WordType, WordRequest } from '~/types'
import { createWord } from '~/api/client'
import { useVocabularyApi } from '~/hooks/useVocabularyApi'

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Add Word – Band Pilot' },
    { name: 'description', content: 'Add a new word to your IELTS vocabulary list' },
  ]
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormErrors {
  word?: string
  meaning?: string
}

const WORD_TYPES: WordType[] = ['noun', 'verb', 'adjective', 'adverb', 'phrase']
const MAX_EXAMPLES = 3

// ---------------------------------------------------------------------------
// AddWord component
// ---------------------------------------------------------------------------

export default function AddWord() {
  const navigate = useNavigate()
  const { loading, inlineError, toastError, handleApiCall } = useVocabularyApi()

  // Form field state
  const [word, setWord] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [wordType, setWordType] = useState<WordType | ''>('')
  const [meaning, setMeaning] = useState('')
  const [examples, setExamples] = useState<string[]>([''])

  // Client-side validation errors
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // ---------------------------------------------------------------------------
  // Example sentence helpers
  // ---------------------------------------------------------------------------

  function handleExampleChange(index: number, value: string) {
    setExamples((prev) => prev.map((ex, i) => (i === index ? value : ex)))
  }

  function handleAddExample() {
    if (examples.length < MAX_EXAMPLES) {
      setExamples((prev) => [...prev, ''])
    }
  }

  function handleRemoveExample(index: number) {
    setExamples((prev) => prev.filter((_, i) => i !== index))
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  function validate(): FormErrors {
    const errors: FormErrors = {}

    if (!word.trim()) {
      errors.word = 'English word is required.'
    } else if (word.trim().length > 100) {
      errors.word = 'English word must be 100 characters or fewer.'
    }

    if (!meaning.trim()) {
      errors.meaning = 'Vietnamese meaning is required.'
    } else if (meaning.trim().length > 500) {
      errors.meaning = 'Vietnamese meaning must be 500 characters or fewer.'
    }

    return errors
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const errors = validate()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const filteredExamples = examples.map((ex) => ex.trim()).filter(Boolean)

    const payload: WordRequest = {
      word: word.trim(),
      meaning: meaning.trim(),
      ...(phonetic.trim() && { phonetic: phonetic.trim() }),
      ...(wordType && { type: wordType }),
      ...(filteredExamples.length > 0 && { examples: filteredExamples }),
    }

    await handleApiCall(() => createWord(payload), {
      onSuccess: () => {
        navigate('/vocabulary')
      },
    })
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function FieldError({ message }: { message?: string }) {
    if (!message) return null
    return (
      <p role="alert" className="mt-1 text-sm text-red-600">
        {message}
      </p>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <nav className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <Link
            to="/vocabulary"
            className="hover:text-gray-700 focus:outline-none focus:underline"
          >
            Vocabulary List
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-gray-900">Add Word</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Add New Word</h1>
      </div>

      {/* Toast error (5xx / network) */}
      {toastError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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
            <p className="font-medium">Something went wrong</p>
            <p className="mt-0.5 text-red-600">{toastError.message}</p>
          </div>
        </div>
      )}

      {/* Form card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* English Word */}
          <div>
            <label
              htmlFor="word"
              className="block text-sm font-medium text-gray-700"
            >
              English Word <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="word"
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              maxLength={101}
              placeholder="e.g. unprecedented"
              aria-required="true"
              aria-describedby={formErrors.word ? 'word-error' : undefined}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.word
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            <div id="word-error">
              <FieldError message={formErrors.word} />
            </div>
            <p className="mt-1 text-xs text-gray-400">{word.length}/100 characters</p>
          </div>

          {/* Phonetic */}
          <div>
            <label
              htmlFor="phonetic"
              className="block text-sm font-medium text-gray-700"
            >
              Phonetic{' '}
              <span className="text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="phonetic"
              type="text"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="e.g. /ʌnˈpresɪdentɪd/"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Word Type */}
          <div>
            <label
              htmlFor="wordType"
              className="block text-sm font-medium text-gray-700"
            >
              Word Type{' '}
              <span className="text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <select
              id="wordType"
              value={wordType}
              onChange={(e) => setWordType(e.target.value as WordType | '')}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select type —</option>
              {WORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Vietnamese Meaning */}
          <div>
            <label
              htmlFor="meaning"
              className="block text-sm font-medium text-gray-700"
            >
              Vietnamese Meaning{' '}
              <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              rows={3}
              maxLength={501}
              placeholder="e.g. chưa từng có tiền lệ"
              aria-required="true"
              aria-describedby={formErrors.meaning ? 'meaning-error' : undefined}
              className={`mt-1 block w-full resize-y rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.meaning
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            <div id="meaning-error">
              <FieldError message={formErrors.meaning} />
            </div>
            <p className="mt-1 text-xs text-gray-400">{meaning.length}/500 characters</p>
          </div>

          {/* Inline API error (400 / 409) */}
          {inlineError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
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
              <span>{inlineError.message}</span>
            </div>
          )}

          {/* Example Sentences */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700">
                Example Sentences{' '}
                <span className="text-xs font-normal text-gray-400">(optional, up to {MAX_EXAMPLES})</span>
              </legend>
              <div className="mt-2 space-y-2">
                {examples.map((ex, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ex}
                      onChange={(e) => handleExampleChange(index, e.target.value)}
                      placeholder={`Example sentence ${index + 1}`}
                      aria-label={`Example sentence ${index + 1}`}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExample(index)}
                        aria-label={`Remove example sentence ${index + 1}`}
                        className="shrink-0 rounded-md border border-red-200 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
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
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {examples.length < MAX_EXAMPLES && (
                <button
                  type="button"
                  onClick={handleAddExample}
                  className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
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
                  Add example
                </button>
              )}
            </fieldset>
          </div>

          {/* Form actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <Link
              to="/vocabulary"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {loading ? 'Saving…' : 'Save Word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
