import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewCard } from './ReviewCard'
import type { DueWordResponse } from '~/types'

// Minimal mock for SpeakButton (uses browser speech API not available in jsdom)
vi.mock('~/components/SpeakButton', () => ({
  SpeakButton: () => null,
}))

const BASE_WORD: DueWordResponse = {
  wordId: 'word-1',
  word: 'ephemeral',
  meaning: 'Tồn tại trong thời gian ngắn',
  phonetic: '/ɪˈfem.ər.əl/',
  type: 'adjective',
  example: 'Fame is ephemeral.',
  examples: ['Fame is ephemeral.', 'An ephemeral moment of happiness.'],
}

describe('ReviewCard', () => {
  it('renders front face with Vietnamese meaning when not flipped', () => {
    render(
      <ReviewCard
        word={BASE_WORD}
        flipped={false}
        onFlipRequest={vi.fn()}
        onRate={vi.fn()}
      />
    )
    expect(screen.getByText('Tồn tại trong thời gian ngắn')).toBeTruthy()
  })

  it('shows expand toggle button on back face when flipped', () => {
    render(
      <ReviewCard
        word={BASE_WORD}
        flipped={true}
        onFlipRequest={vi.fn()}
        onRate={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /show details/i })).toBeTruthy()
  })

  it('expands details section when toggle is clicked', () => {
    render(
      <ReviewCard
        word={BASE_WORD}
        flipped={true}
        onFlipRequest={vi.fn()}
        onRate={vi.fn()}
      />
    )
    const toggle = screen.getByRole('button', { name: /show details/i })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /hide details/i })).toBeTruthy()
    // "Fame is ephemeral." appears twice: once in backward-compat word.example area
    // and once in the expanded section. getAllByText confirms at least one match.
    const fameElements = screen.getAllByText(/Fame is ephemeral\./)
    expect(fameElements.length).toBeGreaterThanOrEqual(1)
    // Second example sentence only in expanded section
    expect(screen.getByText(/An ephemeral moment of happiness\./)).toBeTruthy()
  })

  it('shows "No examples available." when examples is empty', () => {
    const word: DueWordResponse = { ...BASE_WORD, examples: [], example: undefined }
    render(
      <ReviewCard
        word={word}
        flipped={true}
        onFlipRequest={vi.fn()}
        onRate={vi.fn()}
      />
    )
    const toggle = screen.getByRole('button', { name: /show details/i })
    fireEvent.click(toggle)
    expect(screen.getByText('No examples available.')).toBeTruthy()
  })

  it('renders rating buttons on back face', () => {
    render(
      <ReviewCard
        word={BASE_WORD}
        flipped={true}
        onFlipRequest={vi.fn()}
        onRate={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /again/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /good/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /easy/i })).toBeTruthy()
  })

  it('calls onRate with correct rating when a rating button is clicked', () => {
    const onRate = vi.fn()
    render(
      <ReviewCard
        word={BASE_WORD}
        flipped={true}
        onFlipRequest={vi.fn()}
        onRate={onRate}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /good/i }))
    expect(onRate).toHaveBeenCalledWith('GOOD')
  })

  it('calls onFlipRequest when front face is clicked', () => {
    const onFlipRequest = vi.fn()
    render(
      <ReviewCard
        word={BASE_WORD}
        flipped={false}
        onFlipRequest={onFlipRequest}
        onRate={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /card front/i }))
    expect(onFlipRequest).toHaveBeenCalledTimes(1)
  })
})
