let popupShown = false;

function getSlugFromUrl() {
  const match = window.location.pathname.match(/\/problems\/([\w-]+)/);
  return match ? match[1] : null;
}

// ── Reset editor to default code definition ────────────────────────────────
// When you open a LeetCode problem you've solved before, LeetCode restores your
// previous solution into the editor. For review sessions that defeats spaced
// repetition, so we automatically hit LeetCode's own "Reset to default code
// definition" (kebab menu → Reset) after the page loads. Nothing is destroyed —
// your submitted solutions stay in LeetCode's Submissions tab.

function getResetMenuButton() {
  const texts = ["reset", "reset code", "reset to default code definition"];
  const all = [
    ...document.querySelectorAll('[role="menu"] button, [role="menu"] div, [role="listbox"] button'),
  ];
  const exact = all.find(
    (el) =>
      el.children.length === 0 &&
      texts.includes(el.textContent?.trim().toLowerCase()),
  );
  if (exact) return exact;

  // fallback — scan any leaf element for the exact menu label
  return [...document.querySelectorAll("div, button, span")].find(
    (el) =>
      el.children.length === 0 &&
      texts.includes(el.textContent?.trim().toLowerCase()),
  );
}

function getEditorKebabButton() {
  const editor = document.querySelector("#editor");
  if (!editor) return null;
  const buttons = [...editor.querySelectorAll("button")];
  return (
    buttons.find((b) =>
      /more|code editor|menu/i.test(
        `${b.getAttribute("aria-label") || ""} ${b.getAttribute("title") || ""}`,
      ),
    ) ||
    buttons.find((b) => b.querySelectorAll("svg circle").length >= 3) ||
    null
  );
}

function getResetConfirmButton() {
  const containers = [
    ...document.querySelectorAll('[role="dialog"], [role="menu"], [role="alertdialog"]'),
  ];
  for (const c of containers) {
    if ((c.textContent || "").length > 1500) continue;
    if (!/reset/i.test(c.textContent)) continue;
    const candidates = [...c.querySelectorAll("button")].filter((b) =>
      /^reset([\s\S]*)$/i.test(b.textContent?.trim() || ""),
    );
    if (candidates.length) return candidates[candidates.length - 1];
  }
  // fallback — any button whose visible text is exactly "Reset"
  return (
    [...document.querySelectorAll("button")].find(
      (b) => b.textContent?.trim().toLowerCase() === "reset",
    ) || null
  );
}

function resetLeetCodeCode() {
  const editor = document.querySelector("#editor");
  if (!editor) return false;

  // 1) click the editor kebab ("…") button to open the menu
  const kebab = getEditorKebabButton();
  if (kebab) {
    kebab.click();
    // 2) non-blocking: after menu renders, click "Reset to default code definition"
    setTimeout(() => {
      const item = getResetMenuButton();
      if (item) {
        item.click();
        // 3) confirm the "Reset to default code definition?" modal
        setTimeout(() => {
          const confirmBtn = getResetConfirmButton();
          if (confirmBtn) confirmBtn.click();
        }, 80);
      }
    }, 120);
    return true;
  }
  return false;
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

let activeSlug = null;
let resetting = false;

function resetOnOpen(slug) {
  if (resetting) return;
  resetting = true;
  showResetButton();
  let attempts = 0;
  const t = setInterval(() => {
    attempts++;
    if (resetLeetCodeCode() || attempts >= 20) {
      clearInterval(t);
      resetting = false;
    }
  }, 600);
  // give up after 12s even if reset logic keeps returning (already reset) — stop
  setTimeout(() => {
    clearInterval(t);
    resetting = false;
  }, 12000);
}

function watchForProblemChanges() {
  setInterval(() => {
    const slug = getSlugFromUrl();
    if (slug && slug !== activeSlug) {
      activeSlug = slug;
      resetOnOpen(slug);
    }
  }, 1000);
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
        "✓ Logged! See you at next review.";
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => watchForAccepted(slug))
  } else {
    watchForAccepted(slug)
  }
}
