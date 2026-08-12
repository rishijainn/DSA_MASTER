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

// finds the first date from idealDate onwards that has fewer than dailyCommitment problems
export async function findAvailableDate(
  idealDate: string,
  userId: string,
  dailyCommitment: number,
  supabase: any,
  excludeProblemId?: string
): Promise<string> {
  let date = new Date(idealDate)

  for (let i = 0; i < 30; i++) {
    const dateStr = date.toISOString().split('T')[0]

    let query = supabase
      .from('problems')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('next_review_date', dateStr)

    if (excludeProblemId) {
      query = query.neq('id', excludeProblemId)
    }

    const { count } = await query

    if ((count ?? 0) < dailyCommitment) {
      return dateStr
    }

    date.setDate(date.getDate() + 1)
  }

  // fallback — return idealDate if no slot found in 30 days
  return idealDate
}