let popupShown = false;

function getSlugFromUrl() {
  const match = window.location.pathname.match(/\/problems\/([\w-]+)/);
  return match ? match[1] : null;
}

// ── Reset editor to default code definition ────────────────────────────────
// When you open a LeetCode problem you've solved before, LeetCode restores your
// previous solution into the editor. That defeats spaced repetition on the next
// review, so once you log a submission through the DSA Master popup we hit
// LeetCode's own reset (the editor toolbar reset icon) to clear the editor.
// Nothing is destroyed — your submitted solutions stay in LeetCode's Submissions
// tab. The "⟳ Reset Code" pill also lets you reset manually anytime.
//
// Current LeetCode UI (2026): the reset control is an icon button rendered with
// FontAwesome's .fa-arrow-rotate-left in the editor toolbar. Clicking it opens a
// native confirm dialog whose confirm button is labeled "Confirm".

function getResetIconButton() {
  const selectors = [
    ".fa-arrow-rotate-left",
    'svg[data-icon="arrow-rotate-left"]',
    '[class*="arrow-rotate-left"]',
    'svg[data-icon="rotate-left"]',
    '[class*="rotate-left"]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const btn = el.closest("button") || el;
      return btn instanceof HTMLElement ? btn : null;
    }
  }
  // the reset svg may sit inside a wrapper div inside the button
  const icon = document.querySelector(".fa-arrow-rotate-left, [class*='arrow-rotate-left']");
  if (icon) {
    const btn = icon.closest("button");
    if (btn instanceof HTMLElement) return btn;
  }
  // last resort — any button whose aria-label/title mentions reset
  return (
    [...document.querySelectorAll("button")].find((b) =>
      /reset/i.test(
        `${b.getAttribute("aria-label") || ""} ${b.getAttribute("title") || ""}`,
      ),
    ) || null
  );
}

function getConfirmButton() {
  const exact = [...document.querySelectorAll("button")].find(
    (b) => b.textContent?.trim().toLowerCase() === "confirm",
  );
  if (exact) return exact;
  // fallback — last matching button inside any open dialog
  for (const d of document.querySelectorAll('[role="dialog"], [role="alertdialog"]')) {
    const buttons = [...d.querySelectorAll("button")].filter((b) =>
      /confirm|reset|yes/i.test(b.textContent?.trim() || ""),
    );
    if (buttons.length) return buttons[buttons.length - 1];
  }
  return null;
}

function getResetMenuItem() {
  const texts = [
    "reset to default code definition",
    "reset to default",
    "reset code",
    "reset",
  ];
  for (const el of document.querySelectorAll(
    '[role="menu"] button, [role="menu"] div, [role="menu"] li, [role="listbox"] button, [role="listbox"] div',
  )) {
    const txt = el.textContent?.trim().toLowerCase() || "";
    if (texts.some((t) => txt === t || txt.startsWith(t))) return el;
  }
  return null;
}

function resetLeetCodeCode() {
  const btn = getResetIconButton();
  if (!btn) return false;
  btn.click();

  // The confirm dialog (or an intermediate menu item) renders asynchronously.
  // Poll briefly and click through: menu item → confirm. Gives up silently.
  let tries = 0;
  const poll = () => {
    tries++;
    const confirm = getConfirmButton();
    if (confirm) {
      confirm.click();
      return;
    }
    const item = getResetMenuItem();
    if (item) {
      item.click();
      return;
    }
    if (tries < 30) setTimeout(poll, 200);
  };
  setTimeout(poll, 150);
  return true;
}

function showResetButton() {
  if (document.getElementById("dsa-reset-btn")) return;

  const btn = document.createElement("div");
  btn.id = "dsa-reset-btn";
  btn.textContent = "⟳ Reset Code";
  btn.style.cssText = `
    position: fixed;
    left: 16px;
    bottom: 90px;
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
  `;
  btn.addEventListener("click", () => {
    let attempts = 0;
    const t = setInterval(() => {
      attempts++;
      if (resetLeetCodeCode() || attempts >= 6) {
        clearInterval(t);
        btn.textContent = "⟳ Reset Code";
      }
    }, 500);
    btn.textContent = "⟳ Resetting…";
  });
  btn.addEventListener("mouseenter", () => (btn.style.borderColor = "#7c3aed"));
  btn.addEventListener("mouseleave", () => (btn.style.borderColor = "#3f3f46"));
  document.body.appendChild(btn);
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getLeetCodeDifficulty() {
  const el =
    document.querySelector("[diff]") ||
    [...document.querySelectorAll("*")].find(
      (el) =>
        ["Easy", "Medium", "Hard"].includes(el.textContent?.trim()) &&
        el.children.length === 0,
    );
  const text = el?.textContent?.trim().toLowerCase();
  if (["easy", "medium", "hard"].includes(text)) return text;
  return "medium";
}

function createPopup(slug) {
  const existing = document.getElementById("dsa-shadow-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "dsa-shadow-popup";
  popup.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 300px;
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 16px;
    padding: 20px;
    z-index: 99999;
    font-family: -apple-system, sans-serif;
    color: white;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  `;

  popup.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <p style="font-size:14px;font-weight:700">DSA Master</p>
      <button id="dsa-close" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:16px">✕</button>
    </div>
    <p style="font-size:13px;color:#a1a1aa;margin-bottom:16px">Nice solve! Log <strong style="color:white">${titleFromSlug(slug)}</strong> to your tracker?</p>

    <p style="font-size:12px;color:#71717a;margin-bottom:6px">Did you use a hint or AI?</p>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button class="dsa-hint" data-val="true" style="flex:1;padding:8px;border-radius:8px;border:1px solid #3f3f46;background:#27272a;color:#a1a1aa;cursor:pointer;font-size:12px">Yes</button>
      <button class="dsa-hint" data-val="false" style="flex:1;padding:8px;border-radius:8px;border:1px solid #3f3f46;background:#27272a;color:#a1a1aa;cursor:pointer;font-size:12px">No</button>
    </div>

    <p style="font-size:12px;color:#71717a;margin-bottom:6px">How did it feel?</p>
    <div style="display:flex;gap:6px;margin-bottom:16px">
      <button class="dsa-felt" data-val="easy" style="flex:1;padding:8px;border-radius:8px;border:1px solid #3f3f46;background:#27272a;color:#a1a1aa;cursor:pointer;font-size:11px">Easy</button>
      <button class="dsa-felt" data-val="medium" style="flex:1;padding:8px;border-radius:8px;border:1px solid #3f3f46;background:#27272a;color:#a1a1aa;cursor:pointer;font-size:11px">Medium</button>
      <button class="dsa-felt" data-val="hard" style="flex:1;padding:8px;border-radius:8px;border:1px solid #3f3f46;background:#27272a;color:#a1a1aa;cursor:pointer;font-size:11px">Hard</button>
      <button class="dsa-felt" data-val="forgot" style="flex:1;padding:8px;border-radius:8px;border:1px solid #3f3f46;background:#27272a;color:#a1a1aa;cursor:pointer;font-size:11px">Forgot</button>
    </div>

    <div style="display:flex;gap:8px">
      <button id="dsa-skip" style="flex:1;padding:10px;border-radius:8px;border:1px solid #3f3f46;background:transparent;color:#71717a;cursor:pointer;font-size:13px">Skip</button>
      <button id="dsa-save" style="flex:1;padding:10px;border-radius:8px;border:none;background:#7c3aed;color:white;cursor:pointer;font-size:13px;font-weight:500">Save</button>
    </div>
    <div id="dsa-msg" style="margin-top:10px;font-size:12px;text-align:center"></div>
  `;

  document.body.appendChild(popup);

  let hintUsed = null;
  let feltDifficulty = null;

  // close
  document
    .getElementById("dsa-close")
    .addEventListener("click", () => popup.remove());
  document
    .getElementById("dsa-skip")
    .addEventListener("click", () => popup.remove());

  // hint buttons
  popup.querySelectorAll(".dsa-hint").forEach((btn) => {
    btn.addEventListener("click", () => {
      hintUsed = btn.dataset.val === "true";
      popup.querySelectorAll(".dsa-hint").forEach((b) => {
        b.style.background = "#27272a";
        b.style.color = "#a1a1aa";
        b.style.borderColor = "#3f3f46";
      });
      btn.style.background = "#7c3aed";
      btn.style.color = "white";
      btn.style.borderColor = "#7c3aed";
    });
  });

  // felt buttons
  popup.querySelectorAll(".dsa-felt").forEach((btn) => {
    btn.addEventListener("click", () => {
      feltDifficulty = btn.dataset.val;
      popup.querySelectorAll(".dsa-felt").forEach((b) => {
        b.style.background = "#27272a";
        b.style.color = "#a1a1aa";
        b.style.borderColor = "#3f3f46";
      });
      btn.style.background = "#7c3aed";
      btn.style.color = "white";
      btn.style.borderColor = "#7c3aed";
    });
  });

  // save
  document.getElementById("dsa-save").addEventListener("click", async () => {
    if (hintUsed === null) {
      document.getElementById("dsa-msg").style.color = "#f87171";
      document.getElementById("dsa-msg").textContent =
        "Please answer both questions";
      return;
    }
    if (!feltDifficulty) {
      document.getElementById("dsa-msg").style.color = "#f87171";
      document.getElementById("dsa-msg").textContent =
        "Please answer both questions";
      return;
    }

    const { token } = await chrome.storage.local.get("token");
    if (!token) {
      document.getElementById("dsa-msg").style.color = "#f87171";
      document.getElementById("dsa-msg").textContent =
        "No token found. Open extension and connect first.";
      return;
    }

    document.getElementById("dsa-save").textContent = "Saving...";

    const payload = {
      slug: slug,
      url: window.location.href,
      title: titleFromSlug(slug),
      hint_used: hintUsed,
      felt_difficulty: feltDifficulty,
      difficulty: getLeetCodeDifficulty(),
    };

    let res;
    try {
      res = await chrome.runtime.sendMessage({
        type: "log-submission",
        payload,
      });
    } catch (e) {
      document.getElementById("dsa-msg").style.color = "#f87171";
      document.getElementById("dsa-msg").textContent =
        "Can't reach DSA Master. Reload the extension.";
      document.getElementById("dsa-save").textContent = "Save";
      return;
    }

    if (res && res.ok) {
      document.getElementById("dsa-msg").style.color = "#34d399";
      document.getElementById("dsa-msg").textContent =
        "✓ Logged! Code reset for next time.";
      resetLeetCodeCode();
      setTimeout(() => popup.remove(), 2000);
    } else {
      document.getElementById("dsa-msg").style.color = "#f87171";
      document.getElementById("dsa-msg").textContent =
        res?.error === "NO_TOKEN"
          ? "No token found. Open extension and connect first."
          : "Something went wrong. Try again.";
      document.getElementById("dsa-save").textContent = "Save";
    }
  });
}

function watchForAccepted(slug) {
  const observer = new MutationObserver(() => {
    if (popupShown) return;

    const elements = document.querySelectorAll(
      '[data-e2e-locator="submission-result"]',
    );
    for (const el of elements) {
      if (el.textContent?.trim() === "Accepted") {
        popupShown = true;
        observer.disconnect();
        setTimeout(() => createPopup(slug), 1000);
        return;
      }
    }

    // fallback — look for Accepted text in known result containers
    const allEls = document.querySelectorAll("span, p, div");
    for (const el of allEls) {
      if (
        el.children.length === 0 &&
        el.textContent?.trim() === "Accepted" &&
        el.closest('[class*="result"]', el.closest('[class*="submit"]'))
      ) {
        popupShown = true;
        observer.disconnect();
        setTimeout(() => createPopup(slug), 1000);
        return;
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

const slug = getSlugFromUrl()
if (slug) {
  showResetButton();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => watchForAccepted(slug))
  } else {
    watchForAccepted(slug)
  }
}
