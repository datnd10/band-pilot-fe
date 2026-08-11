import { useEffect, useRef } from 'react'
import { getSrsDueCount } from '~/api/client'

const CHECK_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
const STORAGE_KEY = 'bp_last_notified'
const NOTIFICATION_TAG = 'band-pilot-review-reminder'

export function getTodayVN(): string {
  return new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
}

export async function checkAndNotify(): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const today = getTodayVN()
  const lastNotified = localStorage.getItem(STORAGE_KEY)
  if (lastNotified === today) return // already notified today

  try {
    const { count } = await getSrsDueCount()
    if (count > 0) {
      const n = new Notification('Band Pilot', {
        body: `Bạn có ${count} từ cần ôn hôm nay! 📚`,
        icon: '/favicon.ico',
        tag: NOTIFICATION_TAG, // dedup: replaces previous notification with same tag
      })
      n.onclick = () => {
        window.focus()
        window.location.href = '/review'
      }
      localStorage.setItem(STORAGE_KEY, today)
    }
  } catch {
    // Silently ignore network errors
  }
}

export function useNotificationReminder(enabled: boolean): { checkAndNotify: () => Promise<void> } {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    // Check immediately on mount
    checkAndNotify()

    // Then check every 30 minutes
    intervalRef.current = setInterval(checkAndNotify, CHECK_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled])

  return { checkAndNotify }
}
