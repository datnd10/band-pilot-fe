import { useSpeech } from '~/hooks/useSpeech'

interface SpeakButtonProps {
  word: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * SpeakButton — plays the English pronunciation via Web Speech API.
 */
export function SpeakButton({ word, size = 'md', className = '' }: SpeakButtonProps) {
  const { speak } = useSpeech()

  const sizeClasses = { sm: 'h-6 w-6 p-1', md: 'h-8 w-8 p-1.5', lg: 'h-10 w-10 p-2' }
  const iconSize = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' }

  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); speak(word) }}
      aria-label={`Pronounce "${word}"`}
      title="Pronounce"
      className={`inline-flex items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${sizeClasses[size]} ${className}`}
    >
      {/* Speaker / volume icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className={iconSize[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
      </svg>
    </button>
  )
}
