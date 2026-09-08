// ── LeetCode history scraper (CONSOLE-ONLY, do-not-interrupt) ───────────────
// Standalone first pass at pulling a full, authenticated LeetCode solved list
// using the user's OWN session (the tab is logged into LeetCode). It logs
// whatever LeetCode returns to the devtools console and does nothing else:
// no popups, no backend calls, no storage writes.
//
// Primary path: LeetCode GraphQL `submissionList` (auth, paginated by lastKey
// cursor, offset fallback). Fallback: the legacy /api/submissions endpoint.
//
// THROWAWAY: delete extension/leetcode-importer.js (and its block in
// manifest.json) when the real import flow is wired up.
//
// How to test: log into LeetCode, open any /problems/* page, reload the
// extension, then open the devtools console and look for
// `[dsa-master:leetcode-import]` lines. To re-run without a fresh tab, append
// `?dsa_lc_import_rerun=1` to the URL.

const TAG = '[dsa-master:leetcode-import]'
const RUN_FLAG = 'dsa_master_lc_import_run'
const MAX_PAGES = 50
const PAGE_SIZE = 50

function log(...args) {
  console.log(TAG, ...args)
}

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? match[1] : null
}

function isAccepted(entry) {
  const display = entry.statusDisplay || entry.status_display
  return display === 'Accepted' || Number(entry.status) === 10
}

// slug -> { title, titleSlug, timestamp } keeping the EARLIEST accepted solve.
function mergeAccepted(memo, submissions) {
  for (const s of submissions) {
    if (!isAccepted(s)) continue
    const slug = s.titleSlug || s.title_slug
    if (!slug) continue
    const timestamp = Number(s.timestamp) || 0
    const existing = memo.get(slug)
    if (!existing || timestamp < existing.timestamp) {
      memo.set(slug, { title: s.title, titleSlug: slug, timestamp })
    }
  }
  return memo
}

// Primary — GraphQL submissionList. Paged via lastKey cursor; if LeetCode gives
// hasNext but no cursor, falls back to offset stepping.
async function tryGraphqlSubmissionList() {
  const csrf = getCsrfToken()
  const memo = new Map()
  let totalFetched = 0
  let lastKey = null
  let offset = 0
  let hasNext = false

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const query = `
        query submissionList($offset: Int!, $limit: Int!, $lastKey: String) {
          submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: "") {
            hasNext
            lastKey
            submissions {
              id
              title
              titleSlug
              timestamp
              statusDisplay
              lang
            }
          }
        }
      `
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
          'x-csrftoken': csrf || '',
          'x-requested-with': 'XMLHttpRequest',
          referer: window.location.href,
        },
        body: JSON.stringify({
          query,
          variables: { offset, limit: PAGE_SIZE, lastKey },
          operationName: 'submissionList',
        }),
      })
      const json = await res.json()
      if (!res.ok || json?.errors) {
        log(
          '[graphql submissionList] page',
          page + 1,
          'FAILED HTTP',
          res.status,
          json?.errors?.map((e) => e.message) ?? '',
        )
        return { ok: false, memo }
      }

      const list = json?.data?.submissionList
      const subs = Array.isArray(list?.submissions) ? list.submissions : []
      totalFetched += subs.length
      mergeAccepted(memo, subs)

      hasNext = list?.hasNext === true || list?.hasNext === 'true'
      const nextKey = typeof list?.lastKey === 'string' ? list.lastKey : null

      log(
        '[graphql submissionList] page',
        page + 1,
        'entries:',
        subs.length,
        '| hasNext:',
        hasNext,
        '| cursor:',
        nextKey !== null ? (nextKey.slice(0, 24) + '…') : 'none',
        '| unique accepted so far:',
        memo.size,
      )

      if (!hasNext) break
      if (nextKey !== null && nextKey !== lastKey) {
        lastKey = nextKey
        offset = 0
      } else {
        offset += PAGE_SIZE // cursor absent or stale → offset fallback
      }
    }
  } catch (e) {
    log('[graphql submissionList] fetch failed:', e instanceof Error ? e.message : String(e))
    return { ok: false, memo }
  }

  log('[graphql submissionList] TOTAL fetched:', totalFetched, '| UNIQUE accepted:', memo.size)
  return { ok: true, memo }
}

// Fallback — legacy /api/submissions endpoint (offset-based, no cursor).
async function tryLegacySubmissionsApi() {
  const memo = new Map()
  let totalFetched = 0

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const url =
        'https://leetcode.com/api/submissions/?offset=' +
        page * PAGE_SIZE +
        '&limit=' +
        PAGE_SIZE +
        '&lastkey='
      const res = await fetch(url, {
        credentials: 'include',
        headers: { accept: 'application/json' },
      })
      if (!res.ok) break
      const json = await res.json()
      const dump = Array.isArray(json.submissions_dump) ? json.submissions_dump : []
      if (!dump.length) break
      totalFetched += dump.length
      mergeAccepted(memo, dump)
      log(
        '[api/submissions] page',
        page + 1,
        'entries:',
        dump.length,
        '| unique accepted so far:',
        memo.size,
      )
      if (json.has_next !== true) break
    }
  } catch (e) {
    log('[api/submissions] fetch failed:', e instanceof Error ? e.message : String(e))
    return { ok: false, memo }
  }

  log('[api/submissions] TOTAL fetched:', totalFetched, '| UNIQUE accepted:', memo.size)
  return { ok: true, memo }
}

function summarize(memo, source) {
  const accepted = [...memo.values()].sort((a, b) => a.timestamp - b.timestamp)
  log(
    source,
    '— UNIQUE accepted problems:',
    accepted.length,
    '| earliest:',
    accepted[0]?.titleSlug,
    accepted[0] ? new Date(accepted[0].timestamp * 1000).toISOString() : '',
    '| latest:',
    accepted[accepted.length - 1]?.titleSlug,
    accepted[accepted.length - 1]
      ? new Date(accepted[accepted.length - 1].timestamp * 1000).toISOString()
      : '',
  )
  log(
    source,
    '— accepted problems (slug, first-solved):',
    accepted.map((a) => ({
      slug: a.titleSlug,
      timestamp: a.timestamp,
      when: new Date(a.timestamp * 1000).toISOString(),
    })),
  )
}

;(async () => {
  try {
    const forceRerun =
      new URL(window.location.href).searchParams.get('dsa_lc_import_rerun') === '1'
    if (!forceRerun && sessionStorage.getItem(RUN_FLAG)) return
    sessionStorage.setItem(RUN_FLAG, '1')
    log('running console-only import probe…')

    const graph = await tryGraphqlSubmissionList()
    if (graph.ok && graph.memo.size > 0) {
      summarize(graph.memo, '[graphql submissionList]')
      return
    }
    const legacy = await tryLegacySubmissionsApi()
    if (legacy.ok && legacy.memo.size > 0) {
      summarize(legacy.memo, '[api/submissions]')
      return
    }
    log('no data captured. Check the page logs above for errors.')
  } catch (e) {
    log('unexpected error:', e instanceof Error ? e.message : String(e))
  }
})()