import { useState, useCallback } from 'react'
import type { ApiError } from '~/types'
import * as api from '~/api/client'

export type { ApiError }

/**
 * Distinguishes between inline errors (400 / 409 — form-level feedback)
 * and toast errors (5xx / network 0 / 404 — global notification).
 */
export function isInlineError(error: ApiError): boolean {
  return error.status === 400 || error.status === 409
}

export function isToastError(error: ApiError): boolean {
  return error.status === 0 || error.status === 404 || error.status >= 500
}

export interface ApiCallState<T> {
  data: T | null
  loading: boolean
  /** Inline errors (400/409) for form display */
  inlineError: ApiError | null
  /** Toast errors (5xx/network/404) for global notification */
  toastError: ApiError | null
}

export function useVocabularyApi() {
  const [loading, setLoading] = useState(false)
  const [inlineError, setInlineError] = useState<ApiError | null>(null)
  const [toastError, setToastError] = useState<ApiError | null>(null)

  /**
   * Wraps any API call with loading state and categorised error capture.
   * Returns the result or null if an error occurred.
   */
  const handleApiCall = useCallback(
    async <T>(
      call: () => Promise<T>,
      options?: {
        onSuccess?: (data: T) => void
        onInlineError?: (error: ApiError) => void
        onToastError?: (error: ApiError) => void
      },
    ): Promise<T | null> => {
      setLoading(true)
      setInlineError(null)
      setToastError(null)

      try {
        const result = await call()
        options?.onSuccess?.(result)
        return result
      } catch (err) {
        const apiError = err as ApiError
        if (isInlineError(apiError)) {
          setInlineError(apiError)
          options?.onInlineError?.(apiError)
        } else {
          setToastError(apiError)
          options?.onToastError?.(apiError)
        }
        return null
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    // State
    loading,
    inlineError,
    toastError,

    // Utility
    handleApiCall,
    isInlineError,
    isToastError,

    // Re-exported API functions
    ...api,
  }
}
