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
// `[dsa-master:leetcode-import]` lines.

const TAG = '[dsa-master:leetcode-import]'
const RUN_FLAG = 'dsa_master_lc_import_run'

function log(...args) {
  console.log(TAG, ...args)
}

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? match[1] : null
}

// Prioritized strategies. Each is tot server-side; we log every outcome so the
// working one becomes obvious from the console.
async function tryLegacySubmissionsApi() {
  try {
    const res = await fetch(
      'https://leetcode.com/api/submissions/?offset=0&limit=100',
      {
        credentials: 'include',
        headers: { accept: 'application/json' },
      },
    )
    log('[api/submissions] HTTP', res.status)
    if (!res.ok) return
    const json = await res.json()
    const dump = Array.isArray(json.submissions_dump) ? json.submissions_dump : []
    const accepted = dump.filter((s) => s.statusDisplay === 'Accepted')
    log(
      '[api/submissions] submissions in page:',
      dump.length,
      '| accepted:',
      accepted.length,
      '| hasNext:',
      !!json.hasNext,
      '| lastKey:',
      json.has_next === false ? null : json.next_key_dump || null,
    )
    log(
      '[api/submissions] accepted sample:',
      accepted.slice(0, 10).map((s) => ({
        title: s.title,
        titleSlug: s.title_slug,
        timestamp: s.timestamp,
        time: s.time,
        lang: s.lang,
      })),
    )
  } catch (e) {
    log('[api/submissions] fetch failed:', e instanceof Error ? e.message : String(e))
  }
}

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
    if (!res.ok) return
    const json = await res.json()
    log('[graphql submissionList] errors:', json.errors ?? 'none')
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

async function tryGraphqlCounts() {
  const query = `
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
    }
  `
  // detect the logged-in user (the profile banner shows it, but we can't read it —
  // matchedUser without the handle is not available unauthenticated, so we skip
  // the handle entirely and just report whether any public profile resolves for a
  // known probe). Instead, rely on the two authed strategies above; this third
  // one confirms aggregate counts still work without auth.
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username: 'neetcode' },
        operationName: 'getUserProfile',
      }),
    })
    const json = await res.json()
    log('[graphql counts] HTTP', res.status, '| probe neetcode totals:',
      json?.data?.matchedUser?.submitStats?.acSubmissionNum ?? 'n/a')
  } catch (e) {
    log('[graphql counts] fetch failed:', e instanceof Error ? e.message : String(e))
  }
}

;(async () => {
  try {
    if (sessionStorage.getItem(RUN_FLAG)) return
    sessionStorage.setItem(RUN_FLAG, '1')
    log('running console-only import probe (one tab session)…')
    await tryLegacySubmissionsApi()
    await tryGraphqlSubmissionList()
    await tryGraphqlCounts()
    log('done.')
  } catch (e) {
    log('unexpected error:', e instanceof Error ? e.message : String(e))
  }
})()