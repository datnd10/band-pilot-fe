import type {
  ApiError,
  DueWordResponse,
  EssayHistoryDetail,
  EssayHistoryItem,
  EssayScoreResponse,
  GroupRequest,
  GroupResponse,
  ImportResponse,
  ProgressResponse,
  ReviewRequest,
  ReviewResponse,
  ReviewSessionRequest,
  RoundResult,
  SessionDetail,
  SessionHistoryPage,
  SmartImportSuggestion,
  StreakResponse,
  StructuredFeedback,
  TypingSessionRequest,
  WordRequest,
  WordResponse,
} from '~/types'

const BASE_URL = (typeof window !== 'undefined' && (window as unknown as Record<string, string>).__API_BASE_URL__)
  || import.meta.env.VITE_API_BASE_URL
  || '/api/v1'

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('bp_token')
}

export function setToken(token: string): void {
  localStorage.setItem('bp_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('bp_token')
}

/**
 * Normalises a fetch Response into a typed ApiError and throws it.
 * Called when the response status indicates an error.
 */
async function throwApiError(response: Response): Promise<never> {
  let apiError: ApiError
  try {
    apiError = (await response.json()) as ApiError
  } catch {
    apiError = {
      status: response.status,
      error: response.statusText || 'Error',
      message: `Request failed with status ${response.status}`,
      timestamp: new Date().toISOString(),
    }
  }
  throw apiError
}

/**
 * Generic fetch wrapper that:
 * - Sets JSON Content-Type and Accept headers
 * - On 400/409: throws ApiError (inline form errors)
 * - On 404: throws ApiError with status 404 (not-found navigation)
 * - On 5xx / network error: throws ApiError with status 0 or 5xx (toast)
 */
async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  // Attach JWT token if available
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Only set Content-Type for JSON bodies (not FormData or when caller already set it)
  const callerHeaders = (options?.headers as Record<string, string>) ?? {}
  const hasCustomContentType = Object.keys(callerHeaders).some(
    k => k.toLowerCase() === 'content-type'
  )
  if (!(options?.body instanceof FormData) && !hasCustomContentType) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(url, { ...options, headers })
  } catch (networkError) {
    // Network / connection error
    const apiError: ApiError = {
      status: 0,
      error: 'Network Error',
      message:
        networkError instanceof Error
          ? networkError.message
          : 'A network error occurred. Please check your connection.',
      timestamp: new Date().toISOString(),
    }
    throw apiError
  }

  if (response.ok) {
    // 204 No Content — return undefined cast to T
    if (response.status === 204) {
      return undefined as T
    }
    return response.json() as Promise<T>
  }

  // 401 — token expired or invalid, redirect to login
  if (response.status === 401) {
    clearToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // Error responses
  return throwApiError(response)
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(username: string, password: string): Promise<{ token: string; username: string }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, message: (err as { message?: string }).message ?? 'Invalid credentials' }
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Words
// ---------------------------------------------------------------------------

export function getWords(params?: {
  search?: string
  type?: string
  status?: string
}): Promise<WordResponse[]> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.type) query.set('type', params.type)
  if (params?.status) query.set('status', params.status)
  const qs = query.toString()
  return apiFetch<WordResponse[]>(`/words${qs ? `?${qs}` : ''}`)
}

export function createWord(data: WordRequest): Promise<WordResponse> {
  return apiFetch<WordResponse>('/words', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getWord(id: string): Promise<WordResponse> {
  return apiFetch<WordResponse>(`/words/${id}`)
}

export function updateWord(
  id: string,
  data: WordRequest,
): Promise<WordResponse> {
  return apiFetch<WordResponse>(`/words/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteWord(id: string): Promise<void> {
  return apiFetch<void>(`/words/${id}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export function getGroups(): Promise<GroupResponse[]> {
  return apiFetch<GroupResponse[]>('/groups')
}

export function createGroup(data: GroupRequest): Promise<GroupResponse> {
  return apiFetch<GroupResponse>('/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getGroup(
  id: string,
): Promise<GroupResponse & { words: WordResponse[] }> {
  return apiFetch<GroupResponse & { words: WordResponse[] }>(`/groups/${id}`)
}

export function updateGroup(
  id: string,
  data: GroupRequest,
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteGroup(id: string): Promise<void> {
  return apiFetch<void>(`/groups/${id}`, { method: 'DELETE' })
}

export function addWordToGroup(
  groupId: string,
  data: { wordId: string },
): Promise<void> {
  return apiFetch<void>(`/groups/${groupId}/words`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function createWordInGroup(
  groupId: string,
  data: WordRequest,
): Promise<WordResponse> {
  return apiFetch<WordResponse>(`/groups/${groupId}/words/new`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function importCsvToGroup(groupId: string, file: File): Promise<ImportResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch<ImportResponse>(`/groups/${groupId}/import`, {
    method: 'POST',
    body: formData,
  })
}

export function importTextToGroup(groupId: string, text: string): Promise<ImportResponse> {
  return apiFetch<ImportResponse>(`/groups/${groupId}/import/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: text,
  })
}

export function removeWordFromGroup(
  groupId: string,
  wordId: string,
): Promise<void> {
  return apiFetch<void>(`/groups/${groupId}/words/${wordId}`, {
    method: 'DELETE',
  })
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export function saveReviewSession(data: ReviewSessionRequest): Promise<void> {
  return apiFetch<void>('/sessions/review', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function saveTypingSession(data: TypingSessionRequest): Promise<void> {
  return apiFetch<void>('/sessions/typing', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

export function importCsv(file: File, groupId?: string): Promise<ImportResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const qs = groupId ? `?groupId=${encodeURIComponent(groupId)}` : ''
  return apiFetch<ImportResponse>(`/import/csv${qs}`, {
    method: 'POST',
    body: formData,
  })
}

// ---------------------------------------------------------------------------
// Smart Import
// ---------------------------------------------------------------------------

export function analyzeTextForImport(text: string): Promise<SmartImportSuggestion[]> {
  return apiFetch<SmartImportSuggestion[]>('/import/analyze', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

// ---------------------------------------------------------------------------
// SRS (Spaced Repetition System)
// ---------------------------------------------------------------------------

export function getSrsDueWords(): Promise<DueWordResponse[]> {
  return apiFetch<DueWordResponse[]>('/srs/due')
}

export function submitSrsReview(data: ReviewRequest): Promise<ReviewResponse> {
  return apiFetch<ReviewResponse>('/srs/review', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getSrsDueCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/srs/due-count')
}

export function getSrsProgress(): Promise<ProgressResponse> {
  return apiFetch<ProgressResponse>('/srs/progress')
}

// ---------------------------------------------------------------------------
// Session History
// ---------------------------------------------------------------------------

export function getSessionHistory(page = 0, size = 20): Promise<SessionHistoryPage> {
  return apiFetch<SessionHistoryPage>(`/sessions/history?page=${page}&size=${size}`)
}

export function getSessionDetail(id: string): Promise<SessionDetail> {
  return apiFetch<SessionDetail>(`/sessions/history/${id}`)
}

export function getStreak(): Promise<StreakResponse> {
  return apiFetch<StreakResponse>('/sessions/streak')
}

// ---------------------------------------------------------------------------
// Grammar Practice (AI)
// ---------------------------------------------------------------------------

export function generateGrammarPrompt(
  structureId: string,
  structureTitle: string,
): Promise<{ prompt: string }> {
  return apiFetch<{ prompt: string }>('/grammar/prompt', {
    method: 'POST',
    body: JSON.stringify({ structureId, structureTitle }),
  })
}

export function evaluateGrammarResponse(
  structureId: string,
  structureTitle: string,
  prompt: string,
  userResponse: string,
): Promise<StructuredFeedback> {
  return apiFetch<StructuredFeedback>('/grammar/evaluate', {
    method: 'POST',
    body: JSON.stringify({ structureId, structureTitle, prompt, userResponse }),
  })
}

export function scoreEssay(question: string, essay: string): Promise<EssayScoreResponse> {
  return apiFetch<EssayScoreResponse>('/grammar/essay/score', {
    method: 'POST',
    body: JSON.stringify({ question, essay }),
  })
}

export function generateEssayQuestion(topic: string): Promise<{ prompt: string }> {
  return apiFetch<{ prompt: string }>('/grammar/essay/generate-question', {
    method: 'POST',
    body: JSON.stringify({ topic }),
  })
}

export function getEssayHistory(): Promise<EssayHistoryItem[]> {
  return apiFetch<EssayHistoryItem[]>('/grammar/essay/history')
}

export function getEssayDetail(id: string): Promise<EssayHistoryDetail> {
  return apiFetch<EssayHistoryDetail>(`/grammar/essay/history/${id}`)
}
