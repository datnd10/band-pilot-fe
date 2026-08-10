import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router'
import type { GroupResponse, ImportResponse, ApiError } from '~/types'
import { getGroups, importCsv } from '~/api/client'

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: 'Import CSV – Band Pilot' },
    { name: 'description', content: 'Bulk import vocabulary words from a CSV file' },
  ]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB
const ACCEPTED_MIME = new Set(['text/csv', 'application/vnd.ms-excel'])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidCsvFile(file: File): string | null {
  const hasValidExtension = file.name.toLowerCase().endsWith('.csv')
  const hasValidMime = ACCEPTED_MIME.has(file.type)

  // Accept if extension is .csv (MIME can be empty on some OSes)
  if (!hasValidExtension && !hasValidMime) {
    return 'Only CSV files are accepted (.csv extension or text/csv MIME type).'
  }
  if (!hasValidExtension) {
    return 'File must have a .csv extension.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum allowed size is 1 MB.`
  }
  return null
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SpinnerIcon() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
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

function CheckCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 text-green-500"
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

// ---------------------------------------------------------------------------
// ImportSummary
// ---------------------------------------------------------------------------

interface ImportSummaryProps {
  result: ImportResponse
  groupName: string | null
  onReset: () => void
}

function ImportSummary({ result, groupName, onReset }: ImportSummaryProps) {
  const missingField = result.skippedRows.filter((r) => r.reason === 'MISSING_REQUIRED_FIELD')
  const duplicates = result.skippedRows.filter((r) => r.reason === 'DUPLICATE_WORD')
  const allSkipped = result.skippedRows.length

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Success header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <CheckCircleIcon />
        <h2 className="mt-3 text-xl font-bold text-gray-900">Import Complete</h2>
        <p className="mt-1 text-sm text-gray-500">
          {result.importedCount === 0
            ? 'No new words were imported.'
            : `${result.importedCount} word${result.importedCount !== 1 ? 's' : ''} imported successfully.`}
        </p>
        {groupName && result.groupId && (
          <p className="mt-1 text-sm text-blue-600 font-medium">
            Added to group: <span className="font-semibold">{groupName}</span>
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{result.importedCount}</p>
          <p className="mt-0.5 text-xs text-gray-500 font-medium uppercase tracking-wide">Imported</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{allSkipped}</p>
          <p className="mt-0.5 text-xs text-gray-500 font-medium uppercase tracking-wide">Skipped</p>
        </div>
        <div className="col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center sm:col-span-1">
          <p className="text-2xl font-bold text-gray-700">{result.importedCount + allSkipped}</p>
          <p className="mt-0.5 text-xs text-gray-500 font-medium uppercase tracking-wide">Total rows</p>
        </div>
      </div>

      {/* Skipped rows by category */}
      {allSkipped === 0 ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          All rows were imported successfully. No rows were skipped.
        </div>
      ) : (
        <div className="space-y-4">
          {missingField.length > 0 && (
            <section aria-labelledby="missing-field-heading">
              <h3
                id="missing-field-heading"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700"
              >
                <AlertIcon className="h-4 w-4 shrink-0 text-red-500" />
                Missing Required Field ({missingField.length} row{missingField.length !== 1 ? 's' : ''})
              </h3>
              <div className="overflow-hidden rounded-md border border-red-200">
                <table className="min-w-full divide-y divide-red-100 text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left font-medium text-red-700">Row</th>
                      <th scope="col" className="px-4 py-2 text-left font-medium text-red-700">Word</th>
                      <th scope="col" className="px-4 py-2 text-left font-medium text-red-700">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 bg-white">
                    {missingField.map((row) => (
                      <tr key={row.rowNumber}>
                        <td className="px-4 py-2 text-gray-700">{row.rowNumber}</td>
                        <td className="px-4 py-2 text-gray-500 italic">{row.word ?? '—'}</td>
                        <td className="px-4 py-2 text-red-600">Missing required field</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {duplicates.length > 0 && (
            <section aria-labelledby="duplicate-word-heading">
              <h3
                id="duplicate-word-heading"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700"
              >
                <AlertIcon className="h-4 w-4 shrink-0 text-amber-500" />
                Duplicate Word ({duplicates.length} row{duplicates.length !== 1 ? 's' : ''})
              </h3>
              <div className="overflow-hidden rounded-md border border-amber-200">
                <table className="min-w-full divide-y divide-amber-100 text-sm">
                  <thead className="bg-amber-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left font-medium text-amber-700">Row</th>
                      <th scope="col" className="px-4 py-2 text-left font-medium text-amber-700">Word</th>
                      <th scope="col" className="px-4 py-2 text-left font-medium text-amber-700">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 bg-white">
                    {duplicates.map((row) => (
                      <tr key={row.rowNumber}>
                        <td className="px-4 py-2 text-gray-700">{row.rowNumber}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{row.word ?? '—'}</td>
                        <td className="px-4 py-2 text-amber-700">Already exists in vocabulary</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
        <Link
          to="/vocabulary"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Vocabulary List
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Import Another File
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CsvImport (main component)
// ---------------------------------------------------------------------------

export default function CsvImport() {
  // --- groups ---
  const [groups, setGroups] = useState<GroupResponse[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)

  // --- file selection ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- group selection ---
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

  // --- upload state ---
  const [uploading, setUploading] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [toastError, setToastError] = useState<ApiError | null>(null)

  // --- result ---
  const [importResult, setImportResult] = useState<ImportResponse | null>(null)

  // ---------------------------------------------------------------------------
  // Fetch groups on mount (Req 6.2)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false
    setLoadingGroups(true)

    getGroups()
      .then((data) => {
        if (!cancelled) setGroups(data)
      })
      .catch(() => {
        // Non-fatal: groups dropdown just won't populate
        if (!cancelled) setGroups([])
      })
      .finally(() => {
        if (!cancelled) setLoadingGroups(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // ---------------------------------------------------------------------------
  // File handling helpers
  // ---------------------------------------------------------------------------

  const applyFile = useCallback((file: File) => {
    const error = isValidCsvFile(file)
    if (error) {
      setFileError(error)
      setSelectedFile(null)
    } else {
      setFileError(null)
      setSelectedFile(file)
    }
    setInlineError(null)
  }, [])

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) applyFile(file)
    // Reset input value so re-selecting the same file triggers onChange
    e.target.value = ''
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) applyFile(file)
  }

  function handleClearFile() {
    setSelectedFile(null)
    setFileError(null)
    setInlineError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ---------------------------------------------------------------------------
  // Submit (Req 6.1, 6.2, 6.5, 6.6)
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInlineError(null)
    setToastError(null)

    // Client-side gate (Req 6.6)
    if (!selectedFile) {
      setFileError('Please select a CSV file to import.')
      return
    }

    const validationError = isValidCsvFile(selectedFile)
    if (validationError) {
      setFileError(validationError)
      return
    }

    setUploading(true)
    try {
      const groupId = selectedGroupId || undefined
      const result = await importCsv(selectedFile, groupId)
      setImportResult(result)
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 400 || apiError.status === 409) {
        setInlineError(apiError.message)
      } else {
        setToastError(apiError)
      }
    } finally {
      setUploading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Reset form
  // ---------------------------------------------------------------------------

  function handleReset() {
    setSelectedFile(null)
    setFileError(null)
    setInlineError(null)
    setToastError(null)
    setImportResult(null)
    setSelectedGroupId('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null

  // ---------------------------------------------------------------------------
  // Render: result summary
  // ---------------------------------------------------------------------------

  if (importResult) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <nav className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <Link
              to="/"
              className="hover:text-gray-700 focus:outline-none focus:underline"
            >
              Home
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-gray-900">Import CSV</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Import CSV</h1>
        </div>
        <ImportSummary
          result={importResult}
          groupName={selectedGroup?.name ?? null}
          onReset={handleReset}
        />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render: upload form
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <Link
            to="/"
            className="hover:text-gray-700 focus:outline-none focus:underline"
          >
            Home
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-gray-900">Import CSV</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Import from CSV</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV file (columns: word, phonetic, type, meaning, example) to import up to 500 words at once.
        </p>
      </div>

      {/* Toast error */}
      {toastError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-medium">Something went wrong</p>
            <p className="mt-0.5 text-red-600">{toastError.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastError(null)}
            aria-label="Dismiss error"
            className="ml-auto shrink-0 text-red-400 hover:text-red-600 focus:outline-none"
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
        </div>
      )}

      {/* Form card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Drop zone (Req 6.6 client-side validation) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV File <span className="text-red-500" aria-hidden="true">*</span>
            </label>

            {selectedFile ? (
              /* Selected file display */
              <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 shrink-0 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  aria-label="Remove selected file"
                  className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-green-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              </div>
            ) : (
              /* Drop zone */
              <div
                role="button"
                tabIndex={0}
                aria-label="Drop zone: drag and drop a CSV file here, or press Enter to browse"
                aria-describedby={fileError ? 'file-error' : 'file-hint'}
                aria-invalid={fileError ? 'true' : 'false'}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : fileError
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`mb-3 h-10 w-10 ${isDragOver ? 'text-blue-400' : 'text-gray-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  {isDragOver ? 'Drop the file here' : 'Drag & drop your CSV file here'}
                </p>
                <p className="mt-1 text-xs text-gray-500">or</p>
                <span className="mt-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                  Browse files
                </span>
                <p id="file-hint" className="mt-3 text-xs text-gray-400">
                  .csv format only · max 1 MB · up to 500 rows
                </p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              onChange={handleFileInputChange}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />

            {/* File validation error */}
            {fileError && (
              <p id="file-error" role="alert" className="mt-1.5 text-sm text-red-600">
                {fileError}
              </p>
            )}
          </div>

          {/* Group selection (Req 6.2) */}
          <div>
            <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">
              Target Group{' '}
              <span className="text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <select
              id="group-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={loadingGroups || uploading}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">No group (global import)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.wordCount} {g.wordCount === 1 ? 'word' : 'words'})
                </option>
              ))}
            </select>
            {loadingGroups && (
              <p className="mt-1 text-xs text-gray-400">Loading groups…</p>
            )}
          </div>

          {/* Inline API error (400 / 409) */}
          {inlineError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>{inlineError}</span>
            </div>
          )}

          {/* Format hint */}
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            <p className="font-medium mb-1">Expected CSV format</p>
            <p className="font-mono">word, phonetic, type, meaning, example</p>
            <p className="mt-1 text-blue-600">
              Columns <span className="font-semibold">word</span> and <span className="font-semibold">meaning</span> are required. All others are optional.
            </p>
          </div>

          {/* Form actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <Link
              to="/"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              aria-busy={uploading}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading && <SpinnerIcon />}
              {uploading ? 'Importing…' : 'Import CSV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
