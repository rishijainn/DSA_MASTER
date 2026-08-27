const API_URL = 'https://dsa-master-bice.vercel.app'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'log-submission') return

  ;(async () => {
    try {
      const { token } = await chrome.storage.local.get('token')
      if (!token) {
        sendResponse({ ok: false, error: 'NO_TOKEN' })
        return
      }

      const res = await fetch(`${API_URL}/api/log-submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(message.payload),
      })

      if (!res.ok) {
        let detail = ''
        try { detail = (await res.json())?.error ?? '' } catch {}
        sendResponse({ ok: false, status: res.status, error: detail })
        return
      }

      const data = await res.json()
      sendResponse({ ok: true, ...data })
    } catch (e) {
      sendResponse({ ok: false, error: String(e) })
    }
  })()

  return true
})