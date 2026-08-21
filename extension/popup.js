const API_URL = 'https://dsa-master-bice.vercel.app'

let pingInterval = null

async function pingServer(token) {
  try {
    await fetch(`${API_URL}/api/extension-ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
  } catch {}
}

async function render() {
  const content = document.getElementById('content')
  const { token } = await chrome.storage.local.get('token')

  if (token) {
    // ping immediately on open
    pingServer(token)
    // ping every 10s while popup is open
    if (pingInterval) clearInterval(pingInterval)
    pingInterval = setInterval(() => pingServer(token), 10000)

    content.innerHTML = `
      <p>Connected ✓</p>
      <button id="logout">Disconnect</button>
    `
    document.getElementById('logout').addEventListener('click', async () => {
      if (pingInterval) clearInterval(pingInterval)
      // tell server to clear token so settings shows red
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
    if (pingInterval) clearInterval(pingInterval)
    content.innerHTML = `
      <p>Paste your API token from DSA Shadow settings</p>
      <input id="tokenInput" type="text" placeholder="Paste token here..." />
      <button id="save">Connect</button>
      <div id="msg"></div>
    `
    document.getElementById('save').addEventListener('click', async () => {
      const token = document.getElementById('tokenInput').value.trim()
      if (!token) return

      // verify token works
      const res = await fetch(`${API_URL}/api/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      if (res.ok) {
        await chrome.storage.local.set({ token })
        document.getElementById('msg').className = 'success'
        document.getElementById('msg').textContent = 'Connected successfully!'
        // ping immediately after connecting
        pingServer(token)
        setTimeout(render, 1000)
      } else {
        document.getElementById('msg').className = 'error'
        document.getElementById('msg').textContent = 'Invalid token. Check your settings page.'
      }
    })
  }
}

render()
