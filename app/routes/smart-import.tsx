import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import type { GroupResponse, SmartImportSuggestion, ApiError, WordType } from '~/types'
import { analyzeTextForImport, createWord, getGroups } from '~/api/client'

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Smart Import – Band Pilot' },
    { name: 'description', content: 'Paste English text and import vocabulary with AI-powered suggestions' },
  ]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_TEXT_LENGTH = 5000

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? 'h-4 w-4'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'h-6 w-6'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'h-12 w-12'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'h-5 w-5'}
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
  )
}

// ---------------------------------------------------------------------------
// Type badge helper
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  noun:      'bg-blue-100 text-blue-700',
  verb:      'bg-green-100 text-green-700',
  adjective: 'bg-purple-100 text-purple-700',
  adverb:    'bg-amber-100 text-amber-700',
}

function TypeBadge({ type }: { type?: string }) {
  if (!type) return null
  const colors = TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colors}`}>
      {type}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Text Input
// ---------------------------------------------------------------------------

interface Step1Props {
  text: string
  onTextChange: (v: string) => void
  analyzing: boolean
  error: string | null
  onAnalyze: () => void
}

function Step1({ text, onTextChange, analyzing, error, onAnalyze }: Step1Props) {
  const remaining = MAX_TEXT_LENGTH - text.length
  const tooLong = remaining < 0

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="smart-text" className="block text-sm font-medium text-gray-700">
          Paste English text
        </label>
        <p className="mt-0.5 text-xs text-gray-500">
          We'll detect vocabulary words worth learning — with definitions and phonetics.
        </p>
        <div className="relative mt-2">
          <textarea
            id="smart-text"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={10}
            placeholder="Paste any English article, IELTS reading passage, textbook excerpt..."
            className={`block w-full resize-y rounded-lg border px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
              tooLong
                ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                : 'border-gray-300 focus:border-purple-400 focus:ring-purple-200'
            }`}
            disabled={analyzing}
            aria-describedby="char-count"
          />
        </div>
        <p
          id="char-count"
          className={`mt-1 text-right text-xs ${tooLong ? 'text-red-600 font-medium' : 'text-gray-400'}`}
        >
          {text.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
          {tooLong && ` (${Math.abs(remaining)} over limit)`}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing || !text.trim() || tooLong}
          aria-busy={analyzing}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {analyzing ? (
            <>
              <SpinnerIcon />
              Analyzing…
            </>
          ) : (
            <>
              <SparkleIcon className="h-4 w-4" />
              Analyze Text
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Word Selection
// ---------------------------------------------------------------------------

interface Step2Props {
  suggestions: SmartImportSuggestion[]
  selectedWords: Set<string>
  meanings: Record<string, string>
  selectedGroupId: string
  groups: GroupResponse[]
  loadingGroups: boolean
  onToggleWord: (word: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onMeaningChange: (word: string, meaning: string) => void
  onGroupChange: (id: string) => void
  onImport: () => void
  onBack: () => void
}

function Step2({
  suggestions,
  selectedWords,
  meanings,
  selectedGroupId,
  groups,
  loadingGroups,
  onToggleWord,
  onSelectAll,
  onDeselectAll,
  onMeaningChange,
  onGroupChange,
  onImport,
  onBack,
}: Step2Props) {
  const newWords = suggestions.filter((s) => !s.alreadyExists)
  const existingCount = suggestions.filter((s) => s.alreadyExists).length
  const selectedCount = [...selectedWords].filter(
    (w) => suggestions.find((s) => s.word === w && !s.alreadyExists)
  ).length

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-purple-100 bg-purple-50 px-4 py-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="font-semibold text-purple-900">
            {newWords.length} new word{newWords.length !== 1 ? 's' : ''} found
          </span>
          {existingCount > 0 && (
            <span className="text-purple-600">
              {existingCount} already in vocabulary
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            Select All
          </button>
          <span className="text-purple-300">|</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="rounded px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Group selector */}
      <div>
        <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">
          Import into group{' '}
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <select
          id="group-select"
          value={selectedGroupId}
          onChange={(e) => onGroupChange(e.target.value)}
          disabled={loadingGroups}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-50"
        >
          <option value="">No group (global vocabulary)</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.wordCount} {g.wordCount === 1 ? 'word' : 'words'})
            </option>
          ))}
        </select>
        {loadingGroups && <p className="mt-1 text-xs text-gray-400">Loading groups…</p>}
      </div>

      {/* Word list */}
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <SuggestionRow
            key={suggestion.word}
            suggestion={suggestion}
            checked={selectedWords.has(suggestion.word)}
            meaning={meanings[suggestion.word] ?? ''}
            onToggle={() => onToggleWord(suggestion.word)}
            onMeaningChange={(v) => onMeaningChange(suggestion.word, v)}
          />
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onImport}
          disabled={selectedCount === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Import Selected ({selectedCount})
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Suggestion Row
// ---------------------------------------------------------------------------

interface SuggestionRowProps {
  suggestion: SmartImportSuggestion
  checked: boolean
  meaning: string
  onToggle: () => void
  onMeaningChange: (v: string) => void
}

function SuggestionRow({ suggestion, checked, meaning, onToggle, onMeaningChange }: SuggestionRowProps) {
  const disabled = suggestion.alreadyExists

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        disabled
          ? 'border-gray-200 bg-gray-50 opacity-70'
          : checked
          ? 'border-purple-200 bg-purple-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          disabled={disabled}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:cursor-not-allowed"
          aria-label={`Select word: ${suggestion.word}`}
        />

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Word + phonetic + type + already-exists badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900">{suggestion.word}</span>
            {suggestion.phonetic && (
              <span className="text-xs text-gray-500 font-mono">{suggestion.phonetic}</span>
            )}
            <TypeBadge type={suggestion.type} />
            {suggestion.alreadyExists && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                ✓ Already in vocabulary
              </span>
            )}
          </div>

          {/* English definition */}
          {suggestion.definition && (
            <p className="text-xs text-gray-500 leading-relaxed">{suggestion.definition}</p>
          )}

          {/* Example sentence */}
          {suggestion.example && (
            <p className="text-xs text-gray-400 italic">"{suggestion.example}"</p>
          )}

          {/* Vietnamese meaning input (only for non-existing, checked words) */}
          {!disabled && (
            <input
              type="text"
              value={meaning}
              onChange={(e) => onMeaningChange(e.target.value)}
              placeholder="Nhập nghĩa tiếng Việt..."
              disabled={!checked}
              className="mt-1 block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Import Progress & Summary
// ---------------------------------------------------------------------------

interface Step3Props {
  importing: boolean
  progress: { done: number; total: number; failed: number }
  onStartOver: () => void
}

function Step3({ importing, progress, onStartOver }: Step3Props) {
  const imported = progress.done - progress.failed
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  if (importing) {
    return (
      <div className="space-y-6 py-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <SpinnerIcon className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">Importing words…</p>
          <p className="mt-1 text-sm text-gray-500">
            {progress.done} / {progress.total} done
            {progress.failed > 0 && ` · ${progress.failed} failed`}
          </p>
        </div>
        {/* Progress bar */}
        <div className="mx-auto max-w-sm">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-gray-400">{pct}%</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircleIcon className="h-10 w-10 text-green-500" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">Import Complete!</p>
        <p className="mt-2 text-sm text-gray-500">
          <span className="font-semibold text-green-600">{imported}</span> word{imported !== 1 ? 's' : ''} imported successfully
          {progress.failed > 0 && (
            <> · <span className="font-semibold text-red-500">{progress.failed}</span> failed</>
          )}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/vocabulary"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          View Vocabulary
        </Link>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <SparkleIcon className="h-4 w-4" />
          Start Over
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { current: 'input' | 'select' | 'done' }) {
  const steps = [
    { key: 'input', label: 'Paste Text' },
    { key: 'select', label: 'Select Words' },
    { key: 'done', label: 'Import' },
  ] as const

  const currentIndex = steps.findIndex((s) => s.key === current)

  return (
    <nav aria-label="Import progress" className="mb-8">
      <ol className="flex items-center gap-0">
        {steps.map((step, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <li key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    done
                      ? 'bg-purple-600 text-white'
                      : active
                      ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span
                  className={`mt-1 text-xs font-medium ${
                    active ? 'text-purple-700' : done ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${i < currentIndex ? 'bg-purple-600' : 'bg-gray-200'}`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SmartImportPage() {
  const [step, setStep] = useState<'input' | 'select' | 'done'>('input')

  // Step 1 state
  const [text, setText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  // Step 2 state
  const [suggestions, setSuggestions] = useState<SmartImportSuggestion[]>([])
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [meanings, setMeanings] = useState<Record<string, string>>({})
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [groups, setGroups] = useState<GroupResponse[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)

  // Step 3 state
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, failed: 0 })

  // Load groups once when entering step 2
  useEffect(() => {
    if (step !== 'select') return
    let cancelled = false
    setLoadingGroups(true)
    getGroups()
      .then((data) => { if (!cancelled) setGroups(data) })
      .catch(() => { if (!cancelled) setGroups([]) })
      .finally(() => { if (!cancelled) setLoadingGroups(false) })
    return () => { cancelled = true }
  }, [step])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleAnalyze() {
    if (!text.trim()) return
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const result = await analyzeTextForImport(text)
      setSuggestions(result)
      // Pre-select all non-existing words
      setSelectedWords(new Set(result.filter((s) => !s.alreadyExists).map((s) => s.word)))
      // Initialise meanings map
      const initMeanings: Record<string, string> = {}
      result.forEach((s) => { initMeanings[s.word] = '' })
      setMeanings(initMeanings)
      setStep('select')
    } catch (err) {
      const apiErr = err as ApiError
      setAnalyzeError(apiErr.message ?? 'An error occurred while analyzing the text.')
    } finally {
      setAnalyzing(false)
    }
  }

  function handleToggleWord(word: string) {
    setSelectedWords((prev) => {
      const next = new Set(prev)
      if (next.has(word)) next.delete(word)
      else next.add(word)
      return next
    })
  }

  function handleSelectAll() {
    setSelectedWords(new Set(suggestions.filter((s) => !s.alreadyExists).map((s) => s.word)))
  }

  function handleDeselectAll() {
    setSelectedWords(new Set())
  }

  function handleMeaningChange(word: string, meaning: string) {
    setMeanings((prev) => ({ ...prev, [word]: meaning }))
  }

  async function handleImport() {
    const wordsToImport = suggestions.filter(
      (s) => selectedWords.has(s.word) && !s.alreadyExists
    )
    if (wordsToImport.length === 0) return

    setImporting(true)
    setImportProgress({ done: 0, total: wordsToImport.length, failed: 0 })
    setStep('done')

    let done = 0
    let failed = 0

    for (const suggestion of wordsToImport) {
      try {
        await createWord({
          word: suggestion.word,
          phonetic: suggestion.phonetic,
          type: suggestion.type as WordType | undefined,
          meaning: meanings[suggestion.word] || suggestion.definition || 'See definition',
          examples: suggestion.example ? [suggestion.example] : [],
        })
        done++
      } catch {
        failed++
        done++
      }
      setImportProgress({ done, total: wordsToImport.length, failed })
    }

    setImporting(false)
  }

  function handleStartOver() {
    setText('')
    setSuggestions([])
    setSelectedWords(new Set())
    setMeanings({})
    setSelectedGroupId('')
    setImportProgress({ done: 0, total: 0, failed: 0 })
    setAnalyzeError(null)
    setStep('input')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-700 focus:outline-none focus:underline">
          Home
        </Link>
        <span aria-hidden="true">›</span>
        <span className="text-gray-900">Smart Import</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Smart Import</h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste any English text and we'll detect vocabulary worth learning — complete with
          definitions and phonetics.
        </p>
      </div>

      <StepIndicator current={step} />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {step === 'input' && (
          <Step1
            text={text}
            onTextChange={setText}
            analyzing={analyzing}
            error={analyzeError}
            onAnalyze={handleAnalyze}
          />
        )}

        {step === 'select' && (
          <Step2
            suggestions={suggestions}
            selectedWords={selectedWords}
            meanings={meanings}
            selectedGroupId={selectedGroupId}
            groups={groups}
            loadingGroups={loadingGroups}
            onToggleWord={handleToggleWord}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onMeaningChange={handleMeaningChange}
            onGroupChange={setSelectedGroupId}
            onImport={handleImport}
            onBack={() => setStep('input')}
          />
        )}

        {step === 'done' && (
          <Step3
            importing={importing}
            progress={importProgress}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  )
}
