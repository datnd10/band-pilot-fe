// Enumerations
export type WordStatus = 'New' | 'Learning' | 'Known'
export type WordType = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase'

// Word types
export interface WordEntry {
  id: string
  word: string
  phonetic?: string
  type?: WordType
  meaning: string
  examples: string[]
  status: WordStatus
  createdAt: string
  updatedAt: string
}

export interface WordRequest {
  word: string
  phonetic?: string
  type?: WordType
  meaning: string
  examples?: string[]
}

export interface WordResponse {
  id: string
  word: string
  phonetic?: string
  type?: WordType
  meaning: string
  examples: string[]
  status: WordStatus
  createdAt: string
  updatedAt: string
}

// Group types
export interface GroupResponse {
  id: string
  name: string
  wordCount: number
}

export interface GroupRequest {
  name: string
}

// Import types
export interface SkippedRow {
  rowNumber: number
  word: string | null
  reason: 'MISSING_REQUIRED_FIELD' | 'DUPLICATE_WORD'
}

export interface ImportResponse {
  importedCount: number
  groupId: string | null
  skippedRows: SkippedRow[]
}

// Session types
export interface ReviewSessionWordResult {
  wordId: string
  unknownCount: number
}

export interface ReviewSessionRequest {
  results: ReviewSessionWordResult[]
}

export interface TypingSessionWordResult {
  wordId: string
  attemptsRequired: number
}

export interface TypingSessionRequest {
  results: TypingSessionWordResult[]
}

// Error type
export interface ApiError {
  status: number
  error: string
  message: string
  timestamp: string
}
