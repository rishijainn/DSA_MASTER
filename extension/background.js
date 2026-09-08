const API_URL = 'https://dsa-master-bice.vercel.app'

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'log-submission' && message?.type !== 'dsa-import-leetcode') return

  ;(async () => {
    try {
      const path = message.type === 'log-submission' ? '/api/log-submission' : '/api/import'
      const res = await fetchWithToken(path, message.payload)
      sendResponse(res)
    } catch (e) {
      sendResponse({ ok: false, error: String(e) })
    }
  })()

  return true
})