// ── LeetCode history importer ──────────────────────────────────────────────
// Uses the user's OWN LeetCode session (the tab is logged in) to pull their
// full accepted history via the authenticated GraphQL `submissionList` query,
// de-dupes to first-solved per slug, looks up each problem's difficulty, then
// POSTs the list to DSA Master (`/api/import`) so rows are tracked as unreviewed
// backlog. Runs ONLY when the user clicks the "⟳ Sync to DSA Master" pill (or
// opens a problem with `?dsa_lc_sync=1`), never automatically.
//
// LeetCode caps submissionList pages (~20 rows/page regardless of limit), so
// offset steps by the rows actually returned and paging walks until hasNext
// is false (early pages, no cursor → offset stepping).

const TAG = '[dsa-master:sync]'
const API_URL = 'https://dsa-master-bice.vercel.app'
const MAX_PAGES = 120 // covers ~2,400 rows (LeetCode returns ~20/page)
const PAGE_SIZE = 50
const DIFF_CHUNK = 20 // difficulty lookups per GraphQL batch

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

// Primary — GraphQL submissionList. Paged via lastKey cursor; LeetCode has
// returned hasNext without a cursor, so we offset-step by rows actually
// returned. An opaque but non-empty lastKey resets offset (clean cursor path).
async function collectAcceptedHistory(onProgress) {
  const csrf = getCsrfToken()
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
      res = await fetch('https://leetcode.com/graphql', {
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
    if (nextKey && nextKey !== null && nextKey !== lastKey) {
      lastKey = nextKey
      offset = 0
    } else {
      offset += Math.max(subs.length, 1)
    }
  }

  return { totalFetched, accepted: [...memo.values()] }
}

// Batch difficulty lookups so imported rows carry an accurate difficulty tag,
// not a placeholder. Builds an aliased query per chunk and maps back to slugs.
async function fetchDifficulties(slugs) {
  const difficultyBySlug = new Map()
  const csrf = getCsrfToken()
  for (let i = 0; i < slugs.length; i += DIFF_CHUNK) {
    const chunk = slugs.slice(i, i + DIFF_CHUNK)
    const fields = chunk
      .map((slug, j) => `q${j}: question(titleSlug: ${JSON.stringify(slug)}) { difficulty }`)
      .join('\n')
    const query = `query { ${fields} }`
    let res
    try {
      res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
          'x-csrftoken': csrf || '',
          'x-requested-with': 'XMLHttpRequest',
          referer: window.location.href,
        },
        body: JSON.stringify({ query }),
      })
    } catch {
      continue
    }
    const json = await res.json().catch(() => null)
    const data = json?.data
    if (!data) continue
    chunk.forEach((slug, j) => {
      const diff = data[`q${j}`]?.difficulty
      if (diff) difficultyBySlug.set(slug, diff.toLowerCase())
    })
  }
  return difficultyBySlug
}

function findAstray(text) {
  return (text || '').trim()
}

function showStatus(text, color) {
  const el = document.getElementById('dsa-sync-status')
  if (!el) return
  el.textContent = text
  el.style.color = color || '#e6edf3'
  el.style.opacity = 1
  if (text.startsWith('✓') || text.startsWith('✕')) {
    setTimeout(() => { el.style.opacity = 0 }, 6000)
  }
}

async function runSync() {
  const btn = document.getElementById('dsa-sync-btn')
  if (!btn || btn.dataset.running === '1') return

  const { token } = await chrome.storage.local.get('token')
  if (!token) {
    showStatus('✕ No DSA Master token. Open the extension and connect first.', '#f87171')
    return
  }

  btn.dataset.running = '1'
  btn.textContent = '⟳ Syncing…'
  try {
    const { accepted } = await collectAcceptedHistory((page, fetched, unique) => {
      btn.textContent = `⟳ Syncing… page ${page}`
      showStatus(`Scraping LeetCode… ${fetched} submissions · ${unique} unique accepted`, '#a1a1aa')
    })

    if (accepted.length === 0) {
      showStatus('✕ No accepted submissions found on this account.', '#f87171')
      return
    }

    showStatus(`Fetching difficulties… (${accepted.length} problems)`, '#a1a1aa')
    const difficultyBySlug = await fetchDifficulties(accepted.map((a) => a.titleSlug))

    const problems = accepted.map((a) => ({
      slug: a.titleSlug,
      title: findAstray(a.title),
      timestamp: a.timestamp,
      difficulty: difficultyBySlug.get(a.titleSlug) || 'easy',
    }))

    btn.textContent = '⟳ Uploading…'
    let res
    try {
      res = await chrome.runtime.sendMessage({ type: 'dsa-import-leetcode', payload: { problems } })
    } catch (e) {
      showStatus('✕ Can’t reach DSA Master. Reload the extension.', '#f87171')
      return
    }

    if (res && res.ok) {
      const dupes = (res.duplicates || 0)
      const more = res.imported_more ? ' (partial — run again to continue)' : ''
      showStatus(
        `✓ Imported ${res.inserted} new problem${res.inserted === 1 ? '' : 's'}${dupes ? ` · ${dupes} already tracked` : ''}${more}`,
        '#34d399'
      )
      btn.textContent = '⟳ Sync to DSA Master'
    } else {
      const err =
        res?.error === 'NO_TOKEN'
          ? 'No token found. Open the extension and connect first.'
          : res?.error || 'Something went wrong. Try again.'
      showStatus('✕ ' + err, '#f87171')
    }
  } catch (e) {
    showStatus('✕ ' + (e instanceof Error ? e.message : String(e)), '#f87171')
  } finally {
    btn.textContent = '⟳ Sync to DSA Master'
    delete btn.dataset.running
  }
}

function injectSyncUI() {
  if (document.getElementById('dsa-sync-btn')) return

  const pill = document.createElement('div')
  pill.id = 'dsa-sync-btn'
  pill.textContent = '⟳ Sync to DSA Master'
  pill.style.cssText = `
    position: fixed;
    left: 16px;
    bottom: 140px;
    z-index: 99998;
    padding: 8px 14px;
    border-radius: 999px;
    background: #18181b;
    border: 1px solid #3f3f46;
    color: #d4d4d8;
    font-family: -apple-system, sans-serif;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    user-select: none;
  `
  pill.addEventListener('click', runSync)
  pill.addEventListener('mouseenter', () => (pill.style.borderColor = '#00e4b8'))
  pill.addEventListener('mouseleave', () => (pill.style.borderColor = '#3f3f46'))
  document.body.appendChild(pill)

  const status = document.createElement('div')
  status.id = 'dsa-sync-status'
  status.style.cssText = `
    position: fixed;
    left: 16px;
    bottom: 112px;
    z-index: 99997;
    max-width: 340px;
    padding: 0 4px;
    font-family: -apple-system, sans-serif;
    font-size: 11px;
    color: #e6edf3;
    opacity: 0;
    transition: opacity 0.2s;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  `
  document.body.appendChild(status)
}

function maybeAutoRun() {
  const force =
    new URL(window.location.href).searchParams.get('dsa_lc_sync') === '1'
  if (!force) return
  setTimeout(runSync, 800)
}

;(() => {
  injectSyncUI()
  maybeAutoRun()
})()