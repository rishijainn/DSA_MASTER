// ── DSA Master bridge ──────────────────────────────────────────────────────
// Runs on the DSA Master website. Relays messages between the page (via
// window.postMessage) and the extension background (via a long-lived port),
// so Settings can trigger a LeetCode history sync and stream live progress.
// It deliberately does NOT know the extension's id — content scripts always
// talk to their own extension through chrome.runtime.

const FROM_SITE = 'dsa-master-extension' // page → extension
const TO_SITE = 'dsa-master-site' // extension → page

let port = null
let announced = false

function announce(available) {
  announced = true
  window.postMessage({ target: TO_SITE, payload: { type: 'bridge-status', available } }, '*')
}

function connectPort() {
  if (port) return
  try {
    port = chrome.runtime.connect({ name: 'dsa-master-bridge' })
  } catch (e) {
    announce(false)
    return
  }

  port.onMessage.addListener((msg) => {
    // Relay background responses + progress straight to the page.
    window.postMessage({ target: TO_SITE, payload: msg }, '*')
  })

  port.onDisconnect.addListener(() => {
    port = null
    announce(false)
  })

  announce(true)
}

window.addEventListener('message', (e) => {
  if (e.source !== window) return
  const data = e.data
  if (!data || data.target !== FROM_SITE || !data.payload) return
  connectPort()
  if (!port) return
  try {
    port.postMessage(data.payload)
  } catch (err) {
    announce(false)
  }
})

// Ask the background to keep the port warm, so syncs can start right away.
connectPort()