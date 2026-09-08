// ── LeetCode history scraper (CONSOLE-ONLY, do-not-interrupt) ───────────────
// Standalone first pass at pulling a full, authenticated LeetCode solved list
// using the user's OWN session (the tab is logged into LeetCode). It logs
// whatever LeetCode returns to the devtools console and does nothing else:
// no popups, no backend calls, no storage writes.
//
// THROWAWAY: delete extension/leetcode-importer.js (and its block in
// manifest.json) when the real import flow is wired up.
//
// How to test: log into LeetCode, open any /problems/* page in the same browser,
// reload the extension first, then open the devtools console and look for
// `[dsa-master:leetcode-import]` lines. To re-run without opening a new tab, add
// `?dsa_lc_import_rerun=1` to the problem URL (or clear sessionStorage).

const TAG = '[dsa-master:leetcode-import]'
const RUN_FLAG = 'dsa_master_lc_import_run'

function log(...args) {
  console.log(TAG, ...args)
}

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? match[1] : null
}

const ACCEPTED = 10 // LeetCode numeric status for Accepted

function isAccepted(entry) {
  return (
    entry.status_display === 'Accepted' ||
    entry.statusDisplay === 'Accepted' ||
    Number(entry.status) === ACCEPTED
  )
}

// Strategy 1 — LeetCode's classic authenticated submissions API (200 OK, works).
// Paged with offset/lastkey. Logs schema + full accepted list.
async function tryLegacySubmissionsApi() {
  try {
    const MAX_PAGES = 10
    let lastKey = ''
    let totalFetched = 0
    let page = 0
    let firstKeys = null
    let hasNext = false

    const accepted = []

    do {
      const url =
        'https://leetcode.com/api/submissions/?offset=' +
        Math.min(page * 20, 200) +
        '&limit=20&lastkey=' +
        encodeURIComponent(lastKey)
      const res = await fetch(url, {
        credentials: 'include',
        headers: { accept: 'application/json' },
      })
      log('[api/submissions] page', page + 1, 'HTTP', res.status)
      if (!res.ok) break

      const json = await res.json()
      if (firstKeys === null) {
        firstKeys = Object.keys(json)
        const firstDumpEntry = json.submissions_dump?.[0]
        log(
          '[api/submissions] response keys:',
          firstKeys,
          firstDumpEntry ? '| first entry keys: ' + Object.keys(firstDumpEntry) : '',
        )
      }

      const dump = Array.isArray(json.submissions_dump) ? json.submissions_dump : []
      totalFetched += dump.length
      for (const entry of dump) {
        if (isAccepted(entry) && !accepted.some((a) => a.id === entry.id)) {
          accepted.push({
            id: entry.id,
            title: entry.title,
            titleSlug: entry.title_slug || entry.titleSlug,
            timestamp: entry.timestamp,
            status_display: entry.status_display,
            lang: entry.lang,
          })
        }
      }

      log(
        '[api/submissions] page',
        page + 1,
        'entries:',
        dump.length,
        '| accepted so far:',
        accepted.length,
      )

      lastKey = json.next_key_dump || json.hasNext_key || ''
      hasNext = json.has_next === true || json.hasNext === true
      page++
    } while (hasNext && lastKey !== '' && page < MAX_PAGES)

    log('[api/submissions] TOTAL fetched:', totalFetched, '| ACCEPTED:', accepted.length)
    log(
      '[api/submissions] accepted problems (slug, timestamp, when):',
      accepted.map((a) => ({
        title: a.title,
        slug: a.titleSlug,
        timestamp: a.timestamp,
        when: a.timestamp ? new Date(Number(a.timestamp) * 1000).toISOString() : 'n/a',
      })),
    )
  } catch (e) {
    log('[api/submissions] fetch failed:', e instanceof Error ? e.message : String(e))
  }
}

// Strategy 2 — GraphQL submissionList. Unknown signature in 2026; we log the body
// so the error is visible instead of guessing.
async function tryGraphqlSubmissionList() {
  const csrf = getCsrfToken()
  const query = `
    query submissionList($offset: Int!, $limit: Int!) {
      submissionList(offset: $offset, limit: $limit, lastKey: null, questionSlug: "") {
        hasNext
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
  try {
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
        variables: { offset: 0, limit: 100 },
        operationName: 'submissionList',
      }),
    })
    log('[graphql submissionList] HTTP', res.status)
    const text = await res.text()
    let json = null
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
    if (json?.errors) {
      log(
        '[graphql submissionList] errors:',
        json.errors.map((el) => el.message),
      )
    }
    const subs = json?.data?.submissionList?.submissions
    log('[graphql submissionList] submissions:', Array.isArray(subs) ? subs.length : 0)
    if (Array.isArray(subs)) {
      log('[graphql submissionList] sample:', subs.slice(0, 10))
    }
  } catch (e) {
    log(
      '[graphql submissionList] fetch failed:',
      e instanceof Error ? e.message : String(e),
    )
  }
}

// Strategy 3 — public counts (control; proves anonymity is not the issue).
async function tryGraphqlCounts() {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats {
          acSubmissionNum { difficulty count }
        }
      }
    }
  `
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        query,
        variables: { username: 'neetcode' },
        operationName: 'getUserProfile',
      }),
    })
    const json = await res.json()
    log(
      '[graphql counts] HTTP',
      res.status,
      '| probe neetcode totals:',
      json?.data?.matchedUser?.submitStats?.acSubmissionNum ?? 'n/a',
    )
  } catch (e) {
    log('[graphql counts] fetch failed:', e instanceof Error ? e.message : String(e))
  }
}

;(async () => {
  try {
    const forceRerun = new URL(window.location.href).searchParams.get('dsa_lc_import_rerun') === '1'
    if (!forceRerun && sessionStorage.getItem(RUN_FLAG)) return
    sessionStorage.setItem(RUN_FLAG, '1')
    log('running console-only import probe…')
    await tryLegacySubmissionsApi()
    await tryGraphqlSubmissionList()
    await tryGraphqlCounts()
    log('done.')
  } catch (e) {
    log('unexpected error:', e instanceof Error ? e.message : String(e))
  }
})()