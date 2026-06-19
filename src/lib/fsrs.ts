export type FeltDifficulty = 'easy' | 'medium' | 'hard' | 'forgot'

interface FSRSInput {
  stability: number
  feltDifficulty: FeltDifficulty
  hintUsed: boolean
}

interface FSRSOutput {
  newStability: number
  nextReviewDate: string
}

export function calculateNextReview({ stability, feltDifficulty, hintUsed }: FSRSInput): FSRSOutput {
  let newStability = stability

  if (feltDifficulty === 'forgot') {
    newStability = 1
  } else if (feltDifficulty === 'hard') {
    newStability = Math.max(1, stability * 1.2)
  } else if (feltDifficulty === 'medium') {
    newStability = stability * 1.8
  } else if (feltDifficulty === 'easy') {
    newStability = stability * 2.5
  }

  if (hintUsed) {
    newStability = Math.max(1, newStability * 0.6)
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + Math.round(newStability))

  return {
    newStability,
    nextReviewDate: nextReviewDate.toISOString().split('T')[0]
  }
}