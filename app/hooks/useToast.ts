import { createContext, useCallback, useContext, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Toast {
  id: number
  message: string
}

export interface ToastContextValue {
  toasts: Toast[]
  showToast: (message: string) => void
  dismissToast: (id: number) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const ToastContext = createContext<ToastContextValue | null>(null)

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useToast — access the global toast notification system.
 *
 * Usage:
 *   const { showToast } = useToast()
 *   showToast('Something went wrong. Please try again.')
 *
 * Must be used inside a component that is a descendant of ToastProvider.
 */
export function useToast(): Pick<ToastContextValue, 'showToast'> {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside a ToastProvider')
  }
  return { showToast: ctx.showToast }
}

// ---------------------------------------------------------------------------
// Provider factory
// ---------------------------------------------------------------------------

const TOAST_DURATION_MS = 4000

/**
 * Creates the state and handlers used by ToastProvider.
 * Exported so root.tsx can instantiate them and render both the provider
 * and the toast UI in one component.
 */
export function useToastState(): ToastContextValue {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string) => {
      const id = ++nextId.current
      setToasts((prev) => [...prev, { id, message }])
      setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
    },
    [dismissToast],
  )

  return { toasts, showToast, dismissToast }
}

// ---------------------------------------------------------------------------
// Re-export so consumers only need one import path
// ---------------------------------------------------------------------------

export type { ToastContextValue as ToastState }
