const API_URL = 'https://dsa-master-bice.vercel.app'

function updateFooter(connected) {
  const dot = document.getElementById('footerDot')
  const text = document.getElementById('footerText')
  dot.className = 'footer-dot ' + (connected ? 'green' : 'red')
  text.textContent = connected ? 'Connected' : 'Not connected'
}

async function render() {
  const content = document.getElementById('content')
  const { token } = await chrome.storage.local.get('token')

  if (token) {
    updateFooter(true)
    content.innerHTML = `
      <div class="connected-card">
        <div class="status-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="status-label">Connected</div>
        <div class="status-sub">Extension is active</div>
        <button class="btn-disconnect" id="logout">Disconnect</button>
      </div>
    `
    document.getElementById('logout').addEventListener('click', async () => {
      try {
        await fetch(`${API_URL}/api/extension-disconnect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch {}
      await chrome.storage.local.remove('token')
      render()
    })
  } else {
    updateFooter(false)
    content.innerHTML = `
      <div class="connect-form">
        <div class="input-wrap">
          <div class="input-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <input id="tokenInput" type="text" placeholder="Paste your API token..." />
        </div>
        <button class="btn-connect" id="save">Connect</button>
        <div class="msg" id="msg"></div>
      </div>
    `
    document.getElementById('save').addEventListener('click', async () => {
      const token = document.getElementById('tokenInput').value.trim()
      if (!token) return

      const btn = document.getElementById('save')
      btn.textContent = 'Connecting...'
      btn.style.opacity = '0.7'

      const res = await fetch(`${API_URL}/api/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      if (res.ok) {
        await chrome.storage.local.set({ token })
        // tell server we connected
        try {
          await fetch(`${API_URL}/api/extension-connect`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          })
        } catch {}
        const msg = document.getElementById('msg')
        msg.className = 'msg success'
        msg.textContent = 'Connected!'
        setTimeout(render, 800)
      } else {
        const msg = document.getElementById('msg')
        msg.className = 'msg error'
        msg.textContent = 'Invalid token'
        btn.textContent = 'Connect'
        btn.style.opacity = '1'
      }
    })
  }
}

render()
