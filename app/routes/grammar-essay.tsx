import { useState, useCallback } from 'react'
import { Link } from 'react-router'
import { scoreEssay, generateEssayQuestion } from '~/api/client'
import type { EssayScoreResponse } from '~/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function bandColor(score: number): string {
  if (score >= 7) return 'bg-green-100 text-green-800 border-green-300'
  if (score >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  return 'bg-red-100 text-red-800 border-red-300'
}

function bandBarColor(score: number): string {
  if (score >= 7) return 'bg-green-500'
  if (score >= 5) return 'bg-yellow-400'
  return 'bg-red-500'
}

// ---------------------------------------------------------------------------
// Score bar component
// ---------------------------------------------------------------------------

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 9) * 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold px-2 py-0.5 rounded border ${bandColor(score)}`}>
          {score}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${bandBarColor(score)}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={1}
          aria-valuemax={9}
          aria-label={`${label}: ${score} out of 9`}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type PageState = 'writing' | 'submitting' | 'results'

export default function GrammarEssayPage() {
  const [pageState, setPageState] = useState<PageState>('writing')
  const [topic, setTopic] = useState('')
  const [generatingQuestion, setGeneratingQuestion] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [essay, setEssay] = useState('')
  const [result, setResult] = useState<EssayScoreResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wordCount = countWords(essay)
  const canSubmit = question.trim().length > 0 && wordCount >= 50

  const handleGenerateQuestion = useCallback(async () => {
    if (!topic.trim()) return
    setGeneratingQuestion(true)
    setGenerateError(null)
    try {
      const res = await generateEssayQuestion(topic.trim())
      setQuestion(res.prompt)
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string }
      if (e.status === 502 || e.status === 503) {
        setGenerateError('AI service temporarily unavailable. Please try again.')
      } else {
        setGenerateError(e.message ?? 'Failed to generate question.')
      }
    } finally {
      setGeneratingQuestion(false)
    }
  }, [topic])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setError(null)
    setPageState('submitting')
    try {
      const res = await scoreEssay(question.trim(), essay.trim())
      setResult(res)
      setPageState('results')
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string }
      if (e.status === 502 || e.status === 503) {
        setError('AI service temporarily unavailable. Please try again.')
      } else if (e.status === 0) {
        setError('Network error — check your connection.')
      } else {
        setError(e.message ?? 'Something went wrong. Please try again.')
      }
      setPageState('writing')
    }
  }, [canSubmit, question, essay])

  const handleRetry = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  const handleReset = useCallback(() => {
    setPageState('writing')
    setResult(null)
    setError(null)
    setEssay('')
    setQuestion('')
    setTopic('')
    setGenerateError(null)
  }, [])

  // ── Results view ──────────────────────────────────────────────────────────
  if (pageState === 'results' && result) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Essay Score Results</h1>
          <p className="mt-1 text-sm text-gray-500">IELTS Writing Task 2 — AI Assessment</p>
        </div>

        {/* Overall band */}
        <div className="flex items-center gap-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-lg">
            <span className="text-3xl font-extrabold text-white">{result.overallBand}</span>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Overall Band Score</p>
            <p className="mt-1 text-gray-600 text-sm">Average of all four criteria, rounded to nearest 0.5</p>
          </div>
        </div>

        {/* 4 criteria */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Criterion Scores</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScoreBar label="Task Achievement" score={result.taskAchievement} />
            <ScoreBar label="Coherence & Cohesion" score={result.coherenceCohesion} />
            <ScoreBar label="Lexical Resource" score={result.lexicalResource} />
            <ScoreBar label="Grammatical Range & Accuracy" score={result.grammaticalRange} />
          </div>
        </div>

        {/* Strengths */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <h2 className="mb-3 text-base font-semibold text-green-800">Strengths</h2>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                <span aria-hidden="true">✅</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for improvement */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="mb-3 text-base font-semibold text-amber-800">Areas for Improvement</h2>
          <div className="space-y-4">
            {result.improvements.map((item, i) => (
              typeof item === 'string' ? (
                <div key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <span aria-hidden="true">💡</span>
                  <span>{item}</span>
                </div>
              ) : (
                <div key={i} className="rounded-lg border border-amber-200 bg-white p-4 space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Original</span>
                    <p className="mt-0.5 text-sm text-gray-800 italic">"{item.original}"</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Issue</span>
                    <p className="mt-0.5 text-sm text-amber-900">{item.issue}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Correction</span>
                    <p className="mt-0.5 text-sm text-green-900 font-medium">"{item.correction}"</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Why</span>
                    <p className="mt-0.5 text-sm text-blue-900">{item.explanation}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Improved version */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Example Improvement</h2>
          <p className="mb-2 text-xs text-gray-500">A rewritten paragraph showing how the writing could be improved:</p>
          <blockquote className="rounded-lg border-l-4 border-blue-400 bg-gray-50 px-4 py-3 text-sm text-gray-700 italic leading-relaxed">
            {result.improvedVersion}
          </blockquote>
        </div>

        {/* Encouragement */}
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 text-center">
          <p className="text-sm text-purple-800">{result.encouragement}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try Another Essay
          </button>
          <Link
            to="/grammar/essay/history"
            className="rounded-lg border border-blue-300 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            View History
          </Link>
          <Link
            to="/grammar"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            View Grammar Reference
          </Link>
        </div>

        {/* Save notice */}
        <p className="text-xs text-gray-500">✅ Your essay has been saved to your history.</p>
      </div>
    )
  }

  // ── Writing / submitting view ─────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">IELTS Writing Task 2 — Essay Practice</h1>
        <p className="mt-1 text-sm text-gray-500">
          Nhập topic muốn luyện, AI sẽ tạo câu hỏi IELTS Task 2 cho bạn
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Topic input + Generate */}
      <section>
        <label htmlFor="topic" className="mb-1.5 block text-sm font-medium text-gray-700">
          Topic <span className="text-gray-400 font-normal">(e.g. environment, technology, education, health)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateQuestion() }}
            placeholder="Nhập topic muốn ôn luyện..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleGenerateQuestion}
            disabled={!topic.trim() || generatingQuestion}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {generatingQuestion ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : (
              '✨ Generate Question'
            )}
          </button>
        </div>
        {generateError && (
          <p className="mt-1.5 text-xs text-red-600">{generateError}</p>
        )}
      </section>

      {/* Question textarea */}
      <section>
        <label htmlFor="question" className="mb-1.5 block text-sm font-medium text-gray-700">
          IELTS Task 2 Question
          <span className="ml-2 text-xs font-normal text-gray-400">— có thể chỉnh sửa sau khi generate</span>
        </label>
        <textarea
          id="question"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Câu hỏi sẽ xuất hiện ở đây sau khi generate, hoặc tự nhập câu hỏi IELTS Task 2..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </section>

      {/* Essay textarea */}
      <section>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="essay" className="block text-sm font-medium text-gray-700">
            Your Essay
          </label>
          <span className="text-xs text-gray-500">{wordCount} words</span>
        </div>
        <textarea
          id="essay"
          rows={15}
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Write your IELTS Task 2 essay here..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
        />

        {/* Word count guidance */}
        <p className={`mt-1.5 text-xs font-medium ${wordCount < 250 ? 'text-red-600' : 'text-green-600'}`}>
          IELTS Task 2 requires minimum 250 words. Current: {wordCount} word{wordCount !== 1 ? 's' : ''}
        </p>
      </section>

      {/* Submit */}
      <div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || pageState === 'submitting'}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pageState === 'submitting' ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Scoring your essay with AI...
            </>
          ) : (
            'Submit for AI Scoring'
          )}
        </button>
        {!canSubmit && essay.length > 0 && wordCount < 50 && (
          <p className="mt-1.5 text-xs text-gray-500">Write at least 50 words to enable submission.</p>
        )}
        {!canSubmit && question.trim().length === 0 && (
          <p className="mt-1.5 text-xs text-gray-500">Please generate or enter a question above.</p>
        )}
      </div>
    </div>
  )
}
