const API_URL = 'http://localhost:3000' // change this to your deployed URL or localhost

async function render() {
  const content = document.getElementById('content')
  const { token } = await chrome.storage.local.get('token')

  if (token) {
    content.innerHTML = `
      <p>Connected ✓</p>
      <button id="logout">Disconnect</button>
    `
    document.getElementById('logout').addEventListener('click', async () => {
      await chrome.storage.local.remove('token')
      render()
    })
  } else {
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
        setTimeout(render, 1000)
      } else {
        document.getElementById('msg').className = 'error'
        document.getElementById('msg').textContent = 'Invalid token. Check your settings page.'
      }
    })
  }
}

render()