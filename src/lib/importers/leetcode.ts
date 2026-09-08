// Standalone LeetCode scraper — lives outside the app's real import flow.
// Hits LeetCode's public GraphQL endpoint directly (self-hosted, no third-party
// intermediate API). Returns whatever LeetCode gives us so it can be inspected
// end-to-end before being wired into the import flow.
//
// THROWAWAY: delete along with src/app/api/import/test-leetcode/route.ts when
// testing is done. Nothing else in the repo imports this module.

export interface LeetCodeRecentSubmission {
  id: string
  title: string
  titleSlug: string | null
  timestamp: number
}

export interface LeetCodeSolvedCounts {
  total: number
  easy: number
  medium: number
  hard: number
}

export type LeetCodeScrapeErrorCode =
  | 'INVALID_USER'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'HTTP'
  | 'PARSE'

export interface LeetCodeScrapeSuccess {
  ok: true
  username: string
  matched: boolean
  solved: LeetCodeSolvedCounts | null
  recentAcSubmissions: LeetCodeRecentSubmission[]
  fetchedAt: string
  source: string
  /** Complete payload returned by LeetCode's GraphQL endpoint. */
  raw: unknown
}

export interface LeetCodeScrapeFailure {
  ok: false
  username: string
  code: LeetCodeScrapeErrorCode
  error: string
  fetchedAt: string
}

export type LeetCodeScrapeResult = LeetCodeScrapeSuccess | LeetCodeScrapeFailure

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

const FETCH_TIMEOUT_MS = 15000

const PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    recentAcSubmissionList(username: $username, limit: 20) {
      id
      title
      titleSlug
      timestamp
    }
  }
`

function isPlausibleUsername(username: string): boolean {
  if (username.length > 40) return false
  // LeetCode handles are trimmed, alphanumeric, may contain underscores.
  return /^[A-Za-z0-9_]+$/.test(username)
}

export async function scrapeLeetCodeUser(
  username: string,
): Promise<LeetCodeScrapeResult> {
  const trimmed = username.trim()
  const failure = (code: LeetCodeScrapeErrorCode, error: string): LeetCodeScrapeFailure => ({
    ok: false,
    username: trimmed,
    code,
    error,
    fetchedAt: new Date().toISOString(),
  })

  if (!trimmed) return failure('INVALID_USER', 'Username is empty.')
  if (!isPlausibleUsername(trimmed)) {
    return failure(
      'INVALID_USER',
      `"${trimmed}" is not a plausible LeetCode handle (expected letters, numbers, underscores).`,
    )
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': USER_AGENT,
      },
      body: JSON.stringify({
        query: PROFILE_QUERY,
        variables: { username: trimmed },
        operationName: 'getUserProfile',
      }),
      signal: controller.signal,
      cache: 'no-store',
    })
  } catch (err) {
    clearTimeout(timer)
    const aborted = err instanceof Error && err.name === 'AbortError'
    return failure(
      'NETWORK',
      aborted
        ? `Request to LeetCode timed out after ${FETCH_TIMEOUT_MS / 1000}s.`
        : `Network error talking to ${LEETCODE_GRAPHQL}: ${
            err instanceof Error ? err.message : String(err)
          }`,
    )
  }
  clearTimeout(timer)

  if (response.status === 429) {
    return failure(
      'RATE_LIMITED',
      'LeetCode rate-limited this request (HTTP 429). Try again in a minute.',
    )
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.text()
      if (body) detail = body.slice(0, 500)
    } catch {
      /* keep statusText */
    }
    return failure(
      'HTTP',
      `LeetCode responded with HTTP ${response.status}. ${detail}`,
    )
  }

  let json: unknown
  try {
    json = await response.json()
  } catch (err) {
    return failure(
      'PARSE',
      `LeetCode returned non-JSON body: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  const data = (json as { data?: Record<string, unknown> | null; errors?: unknown }).data

  if (!data) {
    return failure('PARSE', `LeetCode query failed. Raw: ${JSON.stringify(json).slice(0, 2000)}`)
  }

  const matchedUser = data.matchedUser as {
    username?: string
    submitStats?: { acSubmissionNum?: { difficulty: string; count: number }[] }
  } | null

  if (!matchedUser) {
    return failure('INVALID_USER', `No LeetCode user named "${trimmed}"`)
  }

  const ac = matchedUser.submitStats?.acSubmissionNum ?? []

  const countFor = (difficulty: string) =>
    ac.find((s) => s.difficulty === difficulty)?.count ?? 0

  const easy = countFor('Easy')
  const medium = countFor('Medium')
  const hard = countFor('Hard')
  const total = countFor('All') > 0 ? countFor('All') : easy + medium + hard

  const recentAcSubmissions: LeetCodeRecentSubmission[] = Array.isArray(
    data.recentAcSubmissionList,
  )
    ? (data.recentAcSubmissionList as {
        id?: unknown
        title?: unknown
        titleSlug?: unknown
        timestamp?: unknown
      }[]).map((s) => ({
        id: String(s.id ?? ''),
        title: s.title != null ? String(s.title) : '',
        titleSlug: s.titleSlug != null ? String(s.titleSlug) : null,
        timestamp: Number(s.timestamp) || 0,
      }))
    : []

  return {
    ok: true,
    username: trimmed,
    matched: true,
    solved: { total, easy, medium, hard },
    recentAcSubmissions,
    fetchedAt: new Date().toISOString(),
    source: LEETCODE_GRAPHQL,
    raw: json,
  }
}