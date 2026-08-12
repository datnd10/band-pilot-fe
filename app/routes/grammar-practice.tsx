import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useBlocker } from 'react-router'
import { generateGrammarPrompt, evaluateGrammarResponse } from '~/api/client'
import type { StructuredFeedback, RoundResult } from '~/types'
import { GRAMMAR_DATA, type GrammarRule } from '~/routes/grammar'
import { filterStructures, pickNextStructure, isSubmitEnabled } from '~/utils/grammar-utils'

export function meta() {
  return [{ title: 'Grammar Practice – Band Pilot' }]
}

// ---------------------------------------------------------------------------
// State machine types
// ---------------------------------------------------------------------------

type PromptStatus = 'loading' | 'loaded' | 'error'
type EvalStatus = 'idle' | 'loading' | 'done' | 'error'

type Screen =
  | { kind: 'mode-select' }
  | { kind: 'structure-select'; mode: 'focused' | 'random' }
  | {
      kind: 'practice-round'
      mode: 'focused' | 'random'
      structure: GrammarRule
      selectedList: GrammarRule[]
      promptStatus: PromptStatus
      prompt: string
      promptError: string
      responseText: string
      evalStatus: EvalStatus
      feedback: StructuredFeedback | null
      evalError: string
    }
  | { kind: 'summary'; rounds: RoundResult[] }

// ---------------------------------------------------------------------------
// Error message helpers
// ---------------------------------------------------------------------------

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    if (e.status === 502) return 'AI service is temporarily unavailable. Please try again in a moment.'
    if (e.status === 503) return 'AI service temporarily unavailable due to quota or authentication issues.'
    if (e.status === 0) return 'Network error — check your connection and try again.'
    if (typeof e.message === 'string') return e.message
  }
  return 'An unexpected error occurred. Please try again.'
}

// ---------------------------------------------------------------------------
// ModeSelectScreen
// ---------------------------------------------------------------------------

function ModeSelectScreen({ onSelect }: { onSelect: (mode: 'focused' | 'random') => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/grammar" className="text-sm text-indigo-600 hover:underline">
          ← Back to Grammar Reference
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Grammar Practice with AI</h1>
      <p className="text-gray-600 mb-8">
        Choose a practice mode to start improving your IELTS Writing grammar.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Focused Practice */}
        <button
          type="button"
          onClick={() => onSelect('focused')}
          className="text-left rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Focused Practice</h2>
          <p className="text-sm text-gray-600">
            Select one grammar structure and practise it in depth with an AI-generated IELTS prompt and detailed feedback.
          </p>
        </button>

        {/* Random Practice Session */}
        <button
          type="button"
          onClick={() => onSelect('random')}
          className="text-left rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Random Practice Session</h2>
          <p className="text-sm text-gray-600">
            Select multiple grammar structures and the system will randomly assign one each round, keeping your session varied and challenging.
          </p>
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StructureSelectScreen
// ---------------------------------------------------------------------------

function StructureSelectScreen({
  mode,
  onBack,
  onStart,
}: {
  mode: 'focused' | 'random'
  onBack: () => void
  onStart: (selected: GrammarRule[]) => void
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [validationMsg, setValidationMsg] = useState('')

  const filtered = filterStructures(GRAMMAR_DATA, query)

  // Group by band
  const bands = Array.from(new Set(GRAMMAR_DATA.map((r) => r.band)))
  const filteredBands = bands.filter((b) => filtered.some((r) => r.band === b))

  function toggleStructure(rule: GrammarRule) {
    if (mode === 'focused') {
      setSelected(new Set([rule.id]))
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(rule.id)) next.delete(rule.id)
        else next.add(rule.id)
        return next
      })
    }
    setValidationMsg('')
  }

  function selectAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      filtered.forEach((r) => next.add(r.id))
      return next
    })
  }

  function clearAll() {
    setSelected(new Set())
  }

  function handleStart() {
    const selectedRules = GRAMMAR_DATA.filter((r) => selected.has(r.id))
    if (mode === 'random' && selectedRules.length < 2) {
      setValidationMsg('Select at least 2 structures to start a random session.')
      return
    }
    if (mode === 'focused' && selectedRules.length === 0) return
    onStart(selectedRules)
  }

  const canStart =
    mode === 'focused' ? selected.size === 1 : selected.size >= 2

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/grammar" className="text-sm text-indigo-600 hover:underline">
          ← Back to Grammar Reference
        </Link>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'focused' ? 'Focused Practice' : 'Random Practice Session'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {mode === 'focused'
              ? 'Select one grammar structure to practise.'
              : 'Select 2 or more structures for your session.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          ← Back
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by title, topic, or category…"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label="Filter grammar structures"
        />
      </div>

      {/* Select All / Clear — random only */}
      {mode === 'random' && (
        <div className="mb-3 flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            {selected.size} structure{selected.size !== 1 ? 's' : ''} selected
          </span>
          <button type="button" onClick={selectAll} className="text-indigo-600 hover:underline">
            Select All
          </button>
          <button type="button" onClick={clearAll} className="text-gray-500 hover:underline">
            Clear
          </button>
        </div>
      )}

      {/* Validation message */}
      {validationMsg && (
        <p role="alert" className="mb-3 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700 border border-amber-200">
          {validationMsg}
        </p>
      )}

      {/* Grouped list */}
      <div className="space-y-6 mb-6 max-h-[60vh] overflow-y-auto pr-1">
        {filteredBands.length === 0 ? (
          <p className="py-10 text-center text-gray-400">No structures match your filter.</p>
        ) : (
          filteredBands.map((band) => (
            <div key={band}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Band {band}
              </h3>
              <div className="space-y-1">
                {filtered
                  .filter((r) => r.band === band)
                  .map((rule) => {
                    const isSelected = selected.has(rule.id)
                    return (
                      <label
                        key={rule.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                          isSelected
                            ? 'border-indigo-300 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-indigo-200'
                        }`}
                      >
                        <input
                          type={mode === 'focused' ? 'radio' : 'checkbox'}
                          name="structure-select"
                          checked={isSelected}
                          onChange={() => toggleStructure(rule)}
                          className="mt-0.5 accent-indigo-600"
                          aria-label={rule.title}
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{rule.title}</span>
                          <span className="ml-2 text-xs text-gray-400">{rule.category}</span>
                          <p className="mt-0.5 text-xs text-gray-500 font-mono">{rule.structure}</p>
                        </div>
                      </label>
                    )
                  })}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={handleStart}
        disabled={!canStart}
        className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {mode === 'focused' ? 'Start Practice' : 'Start Session'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PracticeRoundScreen
// ---------------------------------------------------------------------------

function PracticeRoundScreen({
  screen,
  rounds,
  onRegenerate,
  onSubmit,
  onTryAgain,
  onChooseAnother,
  onNextStructure,
  onEndSession,
  onResponseChange,
}: {
  screen: Extract<Screen, { kind: 'practice-round' }>
  rounds: RoundResult[]
  onRegenerate: () => void
  onSubmit: () => void
  onTryAgain: () => void
  onChooseAnother: () => void
  onNextStructure: () => void
  onEndSession: () => void
  onResponseChange: (text: string) => void
}) {
  const MAX_CHARS = 800
  const { structure, promptStatus, prompt, promptError, responseText, evalStatus, feedback, evalError, mode } = screen

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onChooseAnother} className="hover:text-indigo-600">
          {mode === 'focused' ? 'Focused Practice' : 'Random Session'}
        </button>
        <span>›</span>
        <span className="text-gray-900 font-medium">{structure.title}</span>
        {mode === 'random' && rounds.length > 0 && (
          <span className="ml-auto text-xs text-gray-400">Round {rounds.length + 1}</span>
        )}
      </div>

      {/* Structure hint */}
      <div className="mb-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Target structure</p>
        <p className="text-sm font-medium text-gray-900">{structure.title}</p>
        <p className="mt-1 text-xs text-gray-500 font-mono">{structure.structure}</p>
      </div>

      {/* Prompt card */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Writing Prompt</p>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={promptStatus === 'loading' || evalStatus === 'loading'}
            className="flex items-center gap-1 rounded-md px-3 py-1 text-xs text-indigo-600 border border-indigo-200 hover:bg-indigo-50 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
        </div>

        {promptStatus === 'loading' && (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        )}
        {promptStatus === 'loaded' && (
          <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{prompt}</p>
        )}
        {promptStatus === 'error' && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{promptError}</p>
            <button
              type="button"
              onClick={onRegenerate}
              className="mt-2 text-xs text-red-600 font-medium hover:underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Response textarea */}
      <div className="mb-4">
        <label htmlFor="user-response" className="mb-2 block text-sm font-medium text-gray-700">
          Your Response
        </label>
        <textarea
          id="user-response"
          value={responseText}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              onResponseChange(e.target.value)
            }
          }}
          disabled={evalStatus === 'loading'}
          maxLength={MAX_CHARS}
          rows={5}
          placeholder="Write 1–3 sentences using the target grammar structure…"
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
          aria-describedby="char-counter"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400" id="char-counter">
          <span>{responseText.length === MAX_CHARS ? 'Maximum length reached' : ''}</span>
          <span className={responseText.length >= MAX_CHARS ? 'text-red-500 font-medium' : ''}>
            {responseText.length} / {MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Eval error */}
      {evalStatus === 'error' && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{evalError}</p>
          <button
            type="button"
            onClick={onSubmit}
            className="mt-2 text-xs text-red-600 font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Submit button */}
      {evalStatus !== 'done' && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isSubmitEnabled(responseText) || promptStatus !== 'loaded' || evalStatus === 'loading'}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {evalStatus === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Evaluating…
            </span>
          ) : (
            'Submit for Feedback'
          )}
        </button>
      )}

      {/* Feedback panel */}
      {evalStatus === 'done' && feedback && (
        <FeedbackPanel
          feedback={feedback}
          mode={mode}
          selectedListSize={screen.selectedList.length}
          onTryAgain={onTryAgain}
          onChooseAnother={onChooseAnother}
          onNextStructure={onNextStructure}
          onEndSession={onEndSession}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FeedbackPanel
// ---------------------------------------------------------------------------

function FeedbackPanel({
  feedback,
  mode,
  selectedListSize,
  onTryAgain,
  onChooseAnother,
  onNextStructure,
  onEndSession,
}: {
  feedback: StructuredFeedback
  mode: 'focused' | 'random'
  selectedListSize: number
  onTryAgain: () => void
  onChooseAnother: () => void
  onNextStructure: () => void
  onEndSession: () => void
}) {
  const scoreColors = ['', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700']

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <h2 className="text-base font-semibold text-gray-900">Feedback</h2>

      {/* Score badge */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${scoreColors[feedback.score] ?? 'bg-gray-100 text-gray-700'}`}
          aria-label={`Score: ${feedback.score} out of 5`}
        >
          {feedback.score}
        </span>
        <span className="text-sm text-gray-600">/ 5</span>

        {/* Structure used indicator */}
        <span
          className={`ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            feedback.structure_used
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
          aria-label={feedback.structure_used ? 'Structure used correctly' : 'Structure not detected'}
        >
          {feedback.structure_used ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Structure used
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
              </svg>
              Structure not detected
            </>
          )}
        </span>
      </div>

      {/* Errors */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Errors</p>
        {feedback.errors.length === 0 ? (
          <p className="text-sm text-green-700 font-medium">No errors found — well done!</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {feedback.errors.map((err, i) => (
              <li key={i} className="text-sm text-red-700">{err}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Suggestions */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Suggestions</p>
        {feedback.suggestions.length === 0 ? (
          <p className="text-sm text-gray-500">No further suggestions.</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {feedback.suggestions.map((sug, i) => (
              <li key={i} className="text-sm text-gray-700">{sug}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Model sentence */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Model Sentence</p>
        <blockquote className="rounded-lg bg-indigo-50 border-l-4 border-indigo-400 px-4 py-3 text-sm text-indigo-900 italic">
          {feedback.model_sentence}
        </blockquote>
      </div>

      {/* Encouragement */}
      <p className="text-sm text-gray-700 font-medium">{feedback.encouragement}</p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        {mode === 'focused' ? (
          <>
            <button
              type="button"
              onClick={onTryAgain}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onChooseAnother}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Choose Another Structure
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onNextStructure}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {selectedListSize <= 1 ? 'Practice Again' : 'Next Structure'}
            </button>
            <button
              type="button"
              onClick={onEndSession}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              End Session
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SessionSummaryScreen
// ---------------------------------------------------------------------------

function SessionSummaryScreen({
  rounds,
  onPracticeAgain,
}: {
  rounds: RoundResult[]
  onPracticeAgain: () => void
}) {
  const avgScore = rounds.length > 0 ? Math.round((rounds.reduce((s, r) => s + r.score, 0) / rounds.length) * 10) / 10 : 0

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h1>
      <p className="text-gray-600 mb-6">
        You completed <strong>{rounds.length}</strong> round{rounds.length !== 1 ? 's' : ''} with an average score of <strong>{avgScore}</strong> / 5.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Structure</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rounds.map((r, i) => (
              <tr key={i}>
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{r.structureTitle}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {r.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onPracticeAgain}
        className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        Practice Again
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GrammarPractice() {
  const [screen, setScreen] = useState<Screen>({ kind: 'mode-select' })
  const [rounds, setRounds] = useState<RoundResult[]>([])

  // Track if a practice session is in progress (for blocker)
  const isInSession = screen.kind === 'practice-round' || screen.kind === 'summary'

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isInSession && currentLocation.pathname !== nextLocation.pathname,
  )

  // Confirm navigation away
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('Your session will be discarded. Continue?')) {
        blocker.proceed()
      } else {
        blocker.reset()
      }
    }
  }, [blocker])

  // ─── Prompt loader ──────────────────────────────────────────────────────────

  const loadPrompt = useCallback(
    async (structure: GrammarRule, mode: 'focused' | 'random', selectedList: GrammarRule[]) => {
      setScreen({
        kind: 'practice-round',
        mode,
        structure,
        selectedList,
        promptStatus: 'loading',
        prompt: '',
        promptError: '',
        responseText: '',
        evalStatus: 'idle',
        feedback: null,
        evalError: '',
      })
      try {
        const { prompt } = await generateGrammarPrompt(structure.id, structure.title)
        setScreen((prev) =>
          prev.kind === 'practice-round' && prev.structure.id === structure.id
            ? { ...prev, promptStatus: 'loaded', prompt }
            : prev,
        )
      } catch (err) {
        setScreen((prev) =>
          prev.kind === 'practice-round' && prev.structure.id === structure.id
            ? { ...prev, promptStatus: 'error', promptError: getErrorMessage(err) }
            : prev,
        )
      }
    },
    [],
  )

  const reloadPrompt = useCallback(async () => {
    if (screen.kind !== 'practice-round') return
    const { structure, mode, selectedList } = screen
    setScreen((prev) =>
      prev.kind === 'practice-round'
        ? { ...prev, promptStatus: 'loading', prompt: '', promptError: '', responseText: '', evalStatus: 'idle', feedback: null, evalError: '' }
        : prev,
    )
    try {
      const { prompt } = await generateGrammarPrompt(structure.id, structure.title)
      setScreen((prev) =>
        prev.kind === 'practice-round'
          ? { ...prev, promptStatus: 'loaded', prompt }
          : prev,
      )
    } catch (err) {
      setScreen((prev) =>
        prev.kind === 'practice-round'
          ? { ...prev, promptStatus: 'error', promptError: getErrorMessage(err) }
          : prev,
      )
    }
  }, [screen])

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleModeSelect(mode: 'focused' | 'random') {
    setScreen({ kind: 'structure-select', mode })
    setRounds([])
  }

  function handleBack() {
    setScreen({ kind: 'mode-select' })
  }

  function handleStart(selected: GrammarRule[]) {
    if (screen.kind !== 'structure-select') return
    const { mode } = screen
    const first =
      mode === 'random'
        ? selected[Math.floor(Math.random() * selected.length)]
        : selected[0]
    loadPrompt(first, mode, selected)
  }

  async function handleSubmit() {
    if (screen.kind !== 'practice-round') return
    if (screen.evalStatus === 'loading') return
    const { structure, prompt, responseText, mode, selectedList } = screen
    setScreen((prev) =>
      prev.kind === 'practice-round' ? { ...prev, evalStatus: 'loading', evalError: '' } : prev,
    )
    try {
      const feedback = await evaluateGrammarResponse(
        structure.id,
        structure.title,
        prompt,
        responseText,
      )
      setScreen((prev) =>
        prev.kind === 'practice-round'
          ? { ...prev, evalStatus: 'done', feedback }
          : prev,
      )
    } catch (err) {
      setScreen((prev) =>
        prev.kind === 'practice-round'
          ? { ...prev, evalStatus: 'error', evalError: getErrorMessage(err) }
          : prev,
      )
    }
  }

  function handleTryAgain() {
    reloadPrompt()
  }

  function handleChooseAnother() {
    if (screen.kind !== 'practice-round') return
    setScreen({ kind: 'structure-select', mode: screen.mode })
  }

  function handleNextStructure() {
    if (screen.kind !== 'practice-round') return
    const { structure, selectedList, mode, feedback } = screen
    // Record the completed round
    if (feedback) {
      setRounds((prev) => [
        ...prev,
        { structureId: structure.id, structureTitle: structure.title, score: feedback.score },
      ])
    }
    const next = pickNextStructure(selectedList, structure)
    loadPrompt(next, mode, selectedList)
  }

  function handleEndSession() {
    if (screen.kind !== 'practice-round') return
    const { structure, feedback } = screen
    const newRounds = feedback
      ? [...rounds, { structureId: structure.id, structureTitle: structure.title, score: feedback.score }]
      : rounds
    setRounds(newRounds)
    setScreen({ kind: 'summary', rounds: newRounds })
  }

  function handleResponseChange(text: string) {
    setScreen((prev) =>
      prev.kind === 'practice-round' ? { ...prev, responseText: text } : prev,
    )
  }

  function handlePracticeAgain() {
    setScreen({ kind: 'mode-select' })
    setRounds([])
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (screen.kind === 'mode-select') {
    return <ModeSelectScreen onSelect={handleModeSelect} />
  }

  if (screen.kind === 'structure-select') {
    return (
      <StructureSelectScreen
        mode={screen.mode}
        onBack={handleBack}
        onStart={handleStart}
      />
    )
  }

  if (screen.kind === 'practice-round') {
    return (
      <PracticeRoundScreen
        screen={screen}
        rounds={rounds}
        onRegenerate={reloadPrompt}
        onSubmit={handleSubmit}
        onTryAgain={handleTryAgain}
        onChooseAnother={handleChooseAnother}
        onNextStructure={handleNextStructure}
        onEndSession={handleEndSession}
        onResponseChange={handleResponseChange}
      />
    )
  }

  if (screen.kind === 'summary') {
    return <SessionSummaryScreen rounds={screen.rounds} onPracticeAgain={handlePracticeAgain} />
  }

  return null
}
