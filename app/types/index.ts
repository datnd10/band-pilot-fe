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
  // SRS fields (null when no SRS record exists for this word)
  nextReviewDate?: string | null
  interval?: number | null
  repetitions?: number | null
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

// Session History types
export type SessionRating = 'EASY' | 'GOOD' | 'AGAIN'

export interface SessionSummary {
  id: string
  startedAt: string       // ISO-8601
  completedAt: string     // ISO-8601
  totalUniqueWords: number
  easyCount: number
  goodCount: number
  againCount: number
}

export interface SessionWordResult {
  wordId: string
  word: string
  rating: SessionRating
}

export interface SessionDetail extends SessionSummary {
  wordResults: SessionWordResult[]
}

export interface SessionHistoryPage {
  content: SessionSummary[]
  totalElements: number
  totalPages: number
  number: number   // current page (0-indexed)
  size: number
}

// Error type
export interface ApiError {
  status: number
  error: string
  message: string
  timestamp: string
}

// SRS types
export type SrsRating = 'AGAIN' | 'GOOD' | 'EASY'

export interface DueWordResponse {
  wordId: string
  word: string
  meaning: string
  phonetic?: string
  type?: string
  example?: string
  examples?: string[]
}

export interface ProgressResponse {
  totalWords: number
  dueToday: number
  learnedWords: number
  matureWords: number
}

export interface ReviewRequest {
  wordId: string
  rating: SrsRating
}

export interface ReviewResponse {
  wordId: string
  nextReviewDate: string
  interval: number
  easeFactor: number
  repetitions: number
}

// Streak & Gamification types
export interface StreakResponse {
  currentStreak: number
  longestStreak: number
  activeDaysLast30: number
  badges: string[]  // e.g. ["STREAK_3", "STREAK_7"]
}

// Smart Import types
export interface SmartImportSuggestion {
  word: string
  phonetic?: string
  type?: string
  meaning: string       // always "" from backend — user fills in before import
  definition?: string   // English definition from Free Dictionary API
  example?: string
  alreadyExists: boolean
}
