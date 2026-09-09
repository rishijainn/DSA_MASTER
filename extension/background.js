const API_URL = 'https://dsa-master-bice.vercel.app'
const LC_ENDPOINT = 'https://leetcode.com/graphql'
const MAX_PAGES = 120 // covers ~2,400 rows (LeetCode returns ~20/page)
const PAGE_SIZE = 50
const DIFF_CHUNK = 20 // difficulty lookups per GraphQL batch

async function fetchWithToken(path, payload) {
  const { token } = await chrome.storage.local.get('token')
  if (!token) return { ok: false, error: 'NO_TOKEN' }

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json())?.error ?? '' } catch {}
    return { ok: false, status: res.status, error: detail }
  }

  return { ok: true, ...(await res.json()) }
}

// ── LeetCode history sync (runs from the service worker) ──────────────────
// The user is logged into LeetCode in some tab; the worker reads LeetCode's
// cookies (cookies permission + host_permissions) and queries the same
// authenticated GraphQL submissionList that the old page pill used.

function getCookie(name) {
  return new Promise((resolve) => {
    chrome.cookies.get({ url: 'https://leetcode.com/', name }, (c) => {
      if (chrome.runtime.lastError) { resolve(null); return }
      resolve(c?.value ?? null)
    })
  })
}

async function lcHeaders() {
  const csrf = (await getCookie('csrftoken')) || ''
  return {
    'content-type': 'application/json',
    'x-csrftoken': csrf,
    'x-requested-with': 'XMLHttpRequest',
    referer: 'https://leetcode.com/',
  }
}

async function isLeetCodeLoggedIn() {
  return Boolean(await getCookie('LEETCODE_SESSION'))
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

// Paged submissionList. LeetCode caps pages (~20 rows regardless of limit), so
// offset steps by rows actually returned; a non-empty lastKey resets offset.
async function collectAcceptedHistory(headers, onProgress) {
  const memo = new Map()
  let totalFetched = 0
  let lastKey = null
  let offset = 0

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
    let res
    try {
      res = await fetch(LC_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          query,
          variables: { offset, limit: PAGE_SIZE, lastKey },
          operationName: 'submissionList',
        }),
      })
    } catch (e) {
      throw new Error('LeetCode request failed: ' + (e instanceof Error ? e.message : String(e)))
    }

    const json = await res.json().catch(() => null)
    if (!res.ok || !json || json.errors) {
      throw new Error(
        'LeetCode submissionList failed (HTTP ' +
          res.status +
          '): ' +
          (json?.errors?.map((er) => er.message).join('; ') || '')
      )
    }

    const list = json?.data?.submissionList
    const subs = Array.isArray(list?.submissions) ? list.submissions : []
    totalFetched += subs.length
    mergeAccepted(memo, subs)

    onProgress(page + 1, totalFetched, memo.size)

    const hasNext = list?.hasNext === true || list?.hasNext === 'true'
    if (!hasNext) break
    const nextKey = typeof list?.lastKey === 'string' ? list.lastKey : null
    if (nextKey && nextKey !== lastKey) {
      lastKey = nextKey
      offset = 0
    } else {
      offset += Math.max(subs.length, 1)
    }
  }

  return { totalFetched, accepted: [...memo.values()] }
}

// Batch difficulty lookups (aliased query per chunk) so imported rows carry a
// truthful difficulty tag instead of a placeholder.
async function fetchDifficulties(slugs, headers, onProgress) {
  const difficultyBySlug = new Map()
  for (let i = 0; i < slugs.length; i += DIFF_CHUNK) {
    const chunk = slugs.slice(i, i + DIFF_CHUNK)
    const fields = chunk
      .map((slug, j) => `q${j}: question(titleSlug: ${JSON.stringify(slug)}) { difficulty }`)
      .join('\n')
    const query = `query { ${fields} }`
    let res
    try {
      res = await fetch(LC_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ query }),
      })
    } catch {
      onProgress(i + chunk.length, slugs.length)
      continue
    }
    const json = await res.json().catch(() => null)
    const data = json?.data
    if (data) {
      chunk.forEach((slug, j) => {
        const diff = data[`q${j}`]?.difficulty
        if (diff) difficultyBySlug.set(slug, diff.toLowerCase())
      })
    }
    onProgress(i + chunk.length, slugs.length)
  }
  return difficultyBySlug
}

let syncLock = false

async function runSyncOnPort(port, reqId) {
  if (syncLock) {
    try { port.postMessage({ __reqId: reqId, type: 'sync-error', error: 'SYNC_ALREADY_RUNNING' }) } catch {}
    return
  }
  syncLock = true
  const post = (msg) => {
    try { port.postMessage({ __reqId: reqId, ...msg }) } catch {}
  }

  try {
    const { token } = await chrome.storage.local.get('token')
    if (!token) {
      post({ type: 'sync-error', error: 'NO_TOKEN' })
      return
    }

    if (!(await isLeetCodeLoggedIn())) {
      post({ type: 'sync-error', error: 'NO_LEETCODE_SESSION' })
      return
    }

    const headers = await lcHeaders()
    const { accepted } = await collectAcceptedHistory(headers, (page, fetched, unique) => {
      post({ type: 'sync-progress', stage: 'scrape', page, fetched, unique })
    })

    if (accepted.length === 0) {
      post({ type: 'sync-error', error: 'NO_ACCEPTED' })
      return
    }

    post({ type: 'sync-progress', stage: 'difficulty', done: 0, total: accepted.length })
    const difficultyBySlug = await fetchDifficulties(
      accepted.map((a) => a.titleSlug),
      headers,
      (done, total) => post({ type: 'sync-progress', stage: 'difficulty', done, total })
    )

    const problems = accepted.map((a) => ({
      slug: a.titleSlug,
      title: String(a.title || '').trim().slice(0, 200),
      timestamp: Number(a.timestamp) || 0,
      difficulty: difficultyBySlug.get(a.titleSlug) || 'easy',
    }))

    post({ type: 'sync-progress', stage: 'upload', count: problems.length })
    const res = await fetchWithToken('/api/import', { problems })

    if (res.ok) {
      post({
        type: 'sync-result',
        inserted: res.inserted || 0,
        duplicates: res.duplicates || 0,
        total: res.total || problems.length,
        imported_more: Boolean(res.imported_more),
      })
    } else {
      post({ type: 'sync-error', error: res.error === 'NO_TOKEN' ? 'NO_TOKEN' : (res.error || 'HTTP ' + (res.status || '')) })
    }
  } catch (e) {
    post({ type: 'sync-error', error: e instanceof Error ? e.message : String(e) })
  } finally {
    syncLock = false
  }
}

// Logged-in problems page → one-off submission logging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'log-submission') return

  ;(async () => {
    try {
      const res = await fetchWithToken('/api/log-submission', message.payload)
      sendResponse(res)
    } catch (e) {
      sendResponse({ ok: false, error: String(e) })
    }
  })()

  return true
})

// Long-lived bridge port from our website (content-bridge.js relays it)
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'dsa-master-bridge') return

  port.onMessage.addListener((msg) => {
    if (!msg) return

    if (msg.type === 'ping') {
      try {
        port.postMessage({ __reqId: msg.__reqId || null, type: 'pong', version: chrome.runtime.getManifest().version })
      } catch {}
      return
    }

    if (msg.type === 'start-sync') {
      runSyncOnPort(port, msg.__reqId || null)
    }
  })

  port.onDisconnect.addListener(() => {})
})