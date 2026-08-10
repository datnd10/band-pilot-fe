import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import type { WordResponse, GroupResponse, WordType, WordRequest, ImportResponse, ApiError } from '~/types'
import { getGroup, updateGroup, deleteGroup, removeWordFromGroup, createWordInGroup, importTextToGroup } from '~/api/client'
import { SpeakButton } from '~/components/SpeakButton'

export function meta() {
  return [{ title: 'Study Set – Band Pilot' }]
}

// ---------------------------------------------------------------------------
// Toast helper
// ---------------------------------------------------------------------------
function ToastError({ error, onDismiss }: { error: ApiError; onDismiss: () => void }) {
  return (
    <div role="alert" className="mb-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
      <div className="flex-1"><p className="font-medium">Something went wrong</p><p className="mt-0.5 text-red-600">{error.message}</p></div>
      <button type="button" onClick={onDismiss} className="text-red-400 hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// WordRow — 2-column Quizlet-style
// ---------------------------------------------------------------------------
function WordRow({ word, onRemove, removing }: { word: WordResponse; onRemove: (id: string, t: string) => void; removing: boolean }) {
  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="w-1/3 shrink-0 border-r border-gray-200 px-4 py-3">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-gray-900">{word.word}</p>
          <SpeakButton word={word.word} size="sm" />
        </div>
        {word.phonetic && <p className="mt-0.5 font-mono text-xs text-gray-400">{word.phonetic}</p>}
        {word.type && <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 italic">{word.type}</span>}
      </div>
      <div className="flex-1 px-4 py-3">
        <p className="text-sm text-gray-700">{word.meaning}</p>
        {word.examples?.[0] && <p className="mt-1 text-xs text-gray-400 italic">"{word.examples[0]}"</p>}
      </div>
      <div className="shrink-0 flex items-center gap-1 px-3">
        <Link to={`/vocabulary/${word.id}`} className="rounded p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </Link>
        <button type="button" onClick={() => onRemove(word.id, word.word)} disabled={removing} title="Remove from set"
          className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RenameControl
// ---------------------------------------------------------------------------
function RenameControl({ groupId, currentName, onRenamed }: { groupId: string; currentName: string; onRenamed: (g: GroupResponse) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpen() { setName(currentName); setError(null); setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Name is required.'); return }
    if (trimmed.length > 100) { setError('Max 100 characters.'); return }
    setSubmitting(true)
    try {
      const updated = await updateGroup(groupId, { name: trimmed })
      onRenamed(updated); setOpen(false)
    } catch (err) {
      const e = err as ApiError
      setError(e.status === 409 ? 'Name already exists.' : e.message)
      inputRef.current?.focus()
    } finally { setSubmitting(false) }
  }

  if (!open) return (
    <button type="button" onClick={handleOpen} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Rename</button>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="flex gap-2">
      <div>
        <input ref={inputRef} type="text" value={name} onChange={e => { setName(e.target.value); setError(null) }} maxLength={101} disabled={submitting}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">Save</button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// AddWordForm — inline form to create a new word directly in the set
// ---------------------------------------------------------------------------
const WORD_TYPES: WordType[] = ['noun', 'verb', 'adjective', 'adverb', 'phrase']

function AddWordForm({ groupId, onAdded }: { groupId: string; onAdded: (w: WordResponse) => void }) {
  const [word, setWord] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [type, setType] = useState<WordType | ''>('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ word?: string; meaning?: string; api?: string }>({})
  const wordRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!word.trim()) errs.word = 'Required'
    if (!meaning.trim()) errs.meaning = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    const payload: WordRequest = {
      word: word.trim(), meaning: meaning.trim(),
      ...(phonetic.trim() && { phonetic: phonetic.trim() }),
      ...(type && { type }),
      ...(example.trim() && { examples: [example.trim()] }),
    }
    try {
      const created = await createWordInGroup(groupId, payload)
      onAdded(created)
      setWord(''); setPhonetic(''); setType(''); setMeaning(''); setExample('')
      wordRef.current?.focus()
    } catch (err) {
      const e = err as ApiError
      setErrors({ api: e.status === 409 ? `"${word.trim()}" already exists.` : e.message })
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <input ref={wordRef} type="text" value={word} onChange={e => { setWord(e.target.value); setErrors(p => ({ ...p, word: undefined })) }}
            placeholder="English word *" maxLength={101}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.word ? 'border-red-400' : 'border-gray-300'}`} />
          {errors.word && <p className="mt-0.5 text-xs text-red-600">{errors.word}</p>}
        </div>
        <div>
          <input type="text" value={meaning} onChange={e => { setMeaning(e.target.value); setErrors(p => ({ ...p, meaning: undefined })) }}
            placeholder="Vietnamese meaning *" maxLength={501}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.meaning ? 'border-red-400' : 'border-gray-300'}`} />
          {errors.meaning && <p className="mt-0.5 text-xs text-red-600">{errors.meaning}</p>}
        </div>
        <input type="text" value={phonetic} onChange={e => setPhonetic(e.target.value)} placeholder="Phonetic (optional)"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <select value={type} onChange={e => setType(e.target.value as WordType | '')}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">— Word type —</option>
          {WORD_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      <input type="text" value={example} onChange={e => setExample(e.target.value)} placeholder="Example sentence (optional)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      {errors.api && <p role="alert" className="text-sm text-red-600">{errors.api}</p>}
      <button type="submit" disabled={submitting}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {submitting ? 'Adding…' : '+ Add Term'}
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// ImportTextPanel — paste pipe-delimited text to import into the set
// ---------------------------------------------------------------------------

function ImportTextPanel({ groupId, onImported }: { groupId: string; onImported: (r: ImportResponse) => void }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResponse | null>(null)

  const lineCount = text.split('\n').filter(l => l.trim()).length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) { setError('Please enter at least one line.'); return }
    setError(null); setSubmitting(true)
    try {
      const res = await importTextToGroup(groupId, text.trim())
      setResult(res); onImported(res)
    } catch (err) {
      setError((err as ApiError).message)
    } finally { setSubmitting(false) }
  }

  if (result) return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
      <p className="font-semibold">Import complete!</p>
      <p className="mt-1">{result.importedCount} words imported · {result.skippedRows.length} skipped</p>
      {result.skippedRows.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-green-700">
          {result.skippedRows.map(r => (
            <li key={r.rowNumber}>Line {r.rowNumber}: "{r.word}" — {r.reason === 'DUPLICATE_WORD' ? 'already exists' : 'missing required field'}</li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => { setResult(null); setText('') }} className="mt-3 text-xs text-green-700 underline hover:no-underline">
        Import more
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      {/* Format hint */}
      <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <p className="font-semibold mb-1">Format: one word per line</p>
        <p className="font-mono">word|meaning|phonetic|type|example</p>
        <p className="mt-1 text-amber-700">Only <span className="font-semibold">word</span> and <span className="font-semibold">meaning</span> are required. Other fields are optional.</p>
        <p className="mt-1 font-mono text-amber-600 text-xs">Example:<br />ubiquitous|có mặt khắp nơi|/juːˈbɪkwɪtəs/|adjective|Smartphones are ubiquitous.</p>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError(null) }}
          placeholder={'ubiquitous|có mặt khắp nơi|/juːˈbɪkwɪtəs/|adjective\nabnormal|bất thường|||'}
          rows={8}
          disabled={submitting}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 shadow-sm placeholder:text-gray-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:bg-gray-50"
          spellCheck={false}
        />
        {lineCount > 0 && (
          <span className="absolute bottom-2 right-3 text-xs text-gray-400">{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

      <button type="submit" disabled={submitting || !text.trim()}
        className="w-full rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60">
        {submitting ? 'Importing…' : `Import${lineCount > 0 ? ` ${lineCount} term${lineCount !== 1 ? 's' : ''}` : ''}`}
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// GroupDetail — main
// ---------------------------------------------------------------------------
type AddMode = 'form' | 'import' | null

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [group, setGroup] = useState<(GroupResponse & { words: WordResponse[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [toastError, setToastError] = useState<ApiError | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [removingWordId, setRemovingWordId] = useState<string | null>(null)
  const [addMode, setAddMode] = useState<AddMode>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    getGroup(id)
      .then(data => { if (!cancelled) setGroup(data) })
      .catch((err: ApiError) => {
        if (!cancelled) { if (err.status === 404) navigate('/groups', { replace: true }); else setToastError(err) }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, navigate])

  async function handleRemoveWord(wordId: string, wordText: string) {
    if (!id || !window.confirm(`Remove "${wordText}" from this set?`)) return
    setRemovingWordId(wordId)
    try {
      await removeWordFromGroup(id, wordId)
      setGroup(prev => prev ? { ...prev, words: prev.words.filter(w => w.id !== wordId), wordCount: prev.wordCount - 1 } : prev)
    } catch (err) { setToastError(err as ApiError) }
    finally { setRemovingWordId(null) }
  }

  async function handleDeleteGroup() {
    if (!id || !group || !window.confirm(`Delete "${group.name}"? Words will NOT be deleted.`)) return
    setDeleting(true)
    try { await deleteGroup(id); navigate('/groups', { replace: true }) }
    catch (err) { setToastError(err as ApiError); setDeleting(false) }
  }

  if (loading) return (
    <div className="mx-auto max-w-4xl px-4 py-8" aria-busy="true">
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="mb-4 h-32 animate-pulse rounded-xl bg-gray-200" />
      {[1,2,3].map(i => <div key={i} className="mb-3 h-16 animate-pulse rounded-lg bg-gray-100" />)}
    </div>
  )

  if (!group) return null

  const words = group.words ?? []
  const canStudy = words.length > 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/groups" className="hover:text-gray-700">Study Sets</Link>
        <span>›</span>
        <span className="font-medium text-gray-900">{group.name}</span>
      </nav>

      {toastError && <ToastError error={toastError} onDismiss={() => setToastError(null)} />}

      {/* Hero card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{words.length} {words.length === 1 ? 'term' : 'terms'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RenameControl groupId={group.id} currentName={group.name} onRenamed={updated => setGroup(prev => prev ? { ...prev, name: updated.name } : prev)} />
            <button type="button" onClick={handleDeleteGroup} disabled={deleting}
              className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50">
              {deleting ? 'Deleting…' : 'Delete Set'}
            </button>
          </div>
        </div>

        {/* Study buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link to={canStudy ? `/groups/${id}/flashcard` : '#'} onClick={e => { if (!canStudy) e.preventDefault() }}
            className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 transition-colors ${canStudy ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            <div><p className="text-sm font-semibold">Flashcards</p><p className="text-xs opacity-70">Flip & review</p></div>
          </Link>
          <Link to={canStudy ? `/groups/${id}/typing` : '#'} onClick={e => { if (!canStudy) e.preventDefault() }}
            className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 transition-colors ${canStudy ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700' : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <div><p className="text-sm font-semibold">Typing Test</p><p className="text-xs opacity-70">Type the answer</p></div>
          </Link>
        </div>
        {!canStudy && <p className="mt-3 text-center text-xs text-gray-400">Add words to start studying</p>}
      </div>

      {/* Add terms section */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Terms in this set</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAddMode(m => m === 'form' ? null : 'form')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${addMode === 'form' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add term
          </button>
          <button type="button" onClick={() => setAddMode(m => m === 'import' ? null : 'import')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${addMode === 'import' ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            Import CSV
          </button>
        </div>
      </div>

      {/* Add word form */}
      {addMode === 'form' && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="mb-3 text-sm font-semibold text-blue-800">Add a new term</p>
          <AddWordForm groupId={group.id} onAdded={word => {
            setGroup(prev => prev ? { ...prev, words: [...prev.words, word], wordCount: prev.wordCount + 1 } : prev)
          }} />
        </div>
      )}

      {/* Import text panel */}
      {addMode === 'import' && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm font-semibold text-amber-800">Paste words to import</p>
          <ImportTextPanel groupId={group.id} onImported={async () => {
            const updated = await getGroup(id!)
            setGroup(updated)
          }} />
        </div>
      )}

      {/* Word list */}
      {words.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
          <p className="font-medium text-gray-600">No terms yet</p>
          <p className="mt-1 text-sm text-gray-400">Use "Add term" or "Import CSV" above</p>
        </div>
      ) : (
        <div className="space-y-2">
          {words.map(word => (
            <WordRow key={word.id} word={word} onRemove={handleRemoveWord} removing={removingWordId === word.id} />
          ))}
        </div>
      )}
    </div>
  )
}
