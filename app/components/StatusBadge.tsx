import type { WordStatus } from '../types'

interface StatusBadgeProps {
  status: WordStatus
}

const statusStyles: Record<WordStatus, string> = {
  New: 'bg-blue-100 text-blue-800',
  Learning: 'bg-amber-100 text-amber-800',
  Known: 'bg-green-100 text-green-800',
}

/**
 * StatusBadge — pill badge displaying a word's learning status.
 * Validates: Requirements 4.3, 4.4
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Word status: ${status}`}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}
