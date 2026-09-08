import { scrapeLeetCodeUser } from '@/lib/importers/leetcode'

// THROWAWAY test endpoint for validating the standalone LeetCode scraper from
// Postman. No DB reads/writes, no auth, no dedup — fetch → JSON only.
//
// GET /api/import/test-leetcode?username=<handle>
//
// Delete this file (and src/lib/importers/) when testing is done — nothing else
// imports it.

export async function GET(request: Request) {
  const url = new URL(request.url)
  const username = (url.searchParams.get('username') || '').trim()

  if (!username) {
    return Response.json(
      {
        ok: false,
        code: 'MISSING_USERNAME',
        error: 'Pass a LeetCode handle: ?username=<handle>',
        fetchedAt: new Date().toISOString(),
      },
      { status: 400 },
    )
  }

  const result = await scrapeLeetCodeUser(username)

  if (!result.ok) {
    const status =
      result.code === 'INVALID_USER'
        ? 400
        : result.code === 'RATE_LIMITED'
          ? 429
          : 502
    return Response.json(result, { status })
  }

  return Response.json(result)
}