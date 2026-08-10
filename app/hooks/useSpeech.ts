/**
 * useSpeech — thin wrapper around the Web Speech API (speechSynthesis).
 * Returns a `speak(text)` function that pronounces the given text in English.
 * Safe to call on browsers that don't support the API (no-op).
 */
export function useSpeech() {
  function speak(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    // Cancel any in-progress utterance
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  return { speak }
}
