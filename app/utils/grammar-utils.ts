/**
 * Shared utility functions for the Grammar Practice feature.
 */

export interface GrammarRuleMinimal {
  id: string
  title: string
  topic: string
  category: string
  band: string
  structure: string
}

/**
 * Filters grammar structures by case-insensitive substring match on
 * title, topic, or category.
 *
 * Feature: grammar-practice-ai, Property 1: Structure filter correctness
 */
export function filterStructures<T extends GrammarRuleMinimal>(
  rules: T[],
  query: string,
): T[] {
  if (!query) return rules
  const q = query.toLowerCase()
  return rules.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.topic.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q),
  )
}

/**
 * Randomly picks a structure from the list that is NOT the current one.
 * Falls back to the current structure if the list has only 1 item.
 *
 * Feature: grammar-practice-ai, Property 5: Next-structure never repeats current
 */
export function pickNextStructure<T extends GrammarRuleMinimal>(
  structures: T[],
  current: T,
): T {
  if (structures.length <= 1) return current
  const others = structures.filter((s) => s.id !== current.id)
  if (others.length === 0) return current
  return others[Math.floor(Math.random() * others.length)]
}

/**
 * Returns true iff the text contains at least one non-whitespace character.
 *
 * Feature: grammar-practice-ai, Property 3: Submit disabled for blank input
 */
export function isSubmitEnabled(text: string): boolean {
  return text.trim().length > 0
}
