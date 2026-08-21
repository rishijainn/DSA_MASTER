const BG = '#0d1117'
const CARD = '#161b22'
const BORDER = '#21262d'
const TEXT = '#e6edf3'
const SUBTEXT = '#8b949e'
const BLUE = '#58a6ff'
const GOLD = '#d29922'
const GREEN = '#3fb950'
const PURPLE = '#a78bfa'

function wrapper(children: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BG};font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        ${children}
      </table>
      <p style="color:${SUBTEXT};font-size:11px;margin-top:24px;text-align:center;letter-spacing:0.05em;">
        DSA Master · LeetCode Review System
      </p>
    </td></tr>
  </table>
</body>
</html>`
}

function headerRow(title: string, subtitle: string, accent: string) {
  return `<tr><td style="padding:32px 32px 24px;border-bottom:1px solid ${BORDER};">
    <h1 style="color:${TEXT};font-size:22px;font-weight:800;margin:0 0 4px;letter-spacing:-0.3px;">${title}</h1>
    <p style="color:${SUBTEXT};font-size:13px;margin:0;font-family:monospace;">${subtitle}</p>
  </td></tr>`
}

function footerRow() {
  return `<tr><td style="padding:20px 32px;border-top:1px solid ${BORDER};">
    <p style="color:${SUBTEXT};font-size:11px;margin:0;text-align:center;">
      You're receiving this because you have an active DSA Master account.
      <br>Reviews and streaks are tracked automatically via the Chrome extension.
    </p>
  </td></tr>`
}

export function reviewReminderEmail(
  userName: string,
  dueCount: number,
  problemTitles: string[]
) {
  const list = problemTitles
    .slice(0, 8)
    .map(
      (t) =>
        `<li style="color:${TEXT};font-size:14px;padding:6px 0;border-bottom:1px solid ${BORDER};">${t}</li>`
    )
    .join('')
  const more =
    dueCount > 8
      ? `<p style="color:${SUBTEXT};font-size:13px;margin:8px 0 0;">…and ${dueCount - 8} more</p>`
      : ''

  return wrapper(`
    ${headerRow('Your reviews are waiting', `${dueCount} problem${dueCount !== 1 ? 's' : ''} due for review today`, BLUE)}
    <tr><td style="padding:28px 32px;">
      <p style="color:${TEXT};font-size:15px;margin:0 0 16px;line-height:1.6;">
        Hey ${userName}, you have <strong style="color:${BLUE}">${dueCount} problem${dueCount !== 1 ? 's' : ''}</strong> due for spaced repetition review today.
      </p>
      <p style="color:${SUBTEXT};font-size:13px;margin:0 0 16px;line-height:1.5;">
        Keeping up with reviews strengthens long-term retention. Even a quick session helps.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${CARD};border:1px solid ${BORDER};border-radius:10px;margin:16px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="color:${BLUE};font-size:10px;font-weight:700;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Due today</p>
          <ul style="list-style:none;padding:0;margin:0;">${list}</ul>
          ${more}
        </td></tr>
      </table>
      <p style="color:${SUBTEXT};font-size:13px;margin:16px 0 0;line-height:1.5;">
        Open your dashboard to start reviewing →
      </p>
    </td></tr>
    ${footerRow()}
  `)
}

export function streakNudgeEmail(userName: string, currentStreak: number) {
  return wrapper(`
    ${headerRow("Don't break your streak", `Currently at ${currentStreak} day${currentStreak !== 1 ? 's' : ''} · Risk of reset`, GOLD)}
    <tr><td style="padding:28px 32px;">
      <p style="color:${TEXT};font-size:15px;margin:0 0 16px;line-height:1.6;">
        Hey ${userName}, you haven't solved any problems today yet.
      </p>
      <p style="color:${SUBTEXT};font-size:13px;margin:0 0 20px;line-height:1.5;">
        Your current streak is <strong style="color:${GOLD}">${currentStreak} day${currentStreak !== 1 ? 's' : ''}</strong>.
        ${currentStreak > 1 ? "Solve at least one problem today to keep it going." : "Start a streak by solving at least one problem today."}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${CARD};border:1px solid ${BORDER};border-radius:10px;margin:0;">
        <tr><td style="padding:20px;text-align:center;">
          <p style="color:${GOLD};font-size:36px;font-weight:800;margin:0;font-family:monospace;">
            ${currentStreak}
          </p>
          <p style="color:${SUBTEXT};font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin:4px 0 0;">
            current streak
          </p>
        </td></tr>
      </table>
      <p style="color:${SUBTEXT};font-size:13px;margin:20px 0 0;line-height:1.5;">
        Open the extension and solve something — even an Easy counts.
      </p>
    </td></tr>
    ${footerRow()}
  `)
}

export interface WeeklyStats {
  problemsSolved: number
  reviewsCompleted: number
  currentStreak: number
  longestStreak: number
  easyCount: number
  mediumCount: number
  hardCount: number
}

export function weeklySummaryEmail(userName: string, stats: WeeklyStats) {
  return wrapper(`
    ${headerRow('Your weekly summary', 'Performance recap for the past 7 days', PURPLE)}
    <tr><td style="padding:28px 32px;">
      <p style="color:${TEXT};font-size:15px;margin:0 0 20px;line-height:1.6;">
        Hey ${userName}, here's how your week went.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        <tr>
          <td width="33%" style="padding:12px;text-align:center;background:${CARD};border:1px solid ${BORDER};border-radius:10px 0 0 10px;">
            <p style="color:${BLUE};font-size:28px;font-weight:800;margin:0;font-family:monospace;">${stats.problemsSolved}</p>
            <p style="color:${SUBTEXT};font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;margin:4px 0 0;">solved</p>
          </td>
          <td width="33%" style="padding:12px;text-align:center;background:${CARD};border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
            <p style="color:${GREEN};font-size:28px;font-weight:800;margin:0;font-family:monospace;">${stats.reviewsCompleted}</p>
            <p style="color:${SUBTEXT};font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;margin:4px 0 0;">reviews</p>
          </td>
          <td width="33%" style="padding:12px;text-align:center;background:${CARD};border:1px solid ${BORDER};border-radius:0 10px 10px 0;">
            <p style="color:${GOLD};font-size:28px;font-weight:800;margin:0;font-family:monospace;">${stats.currentStreak}</p>
            <p style="color:${SUBTEXT};font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;margin:4px 0 0;">streak</p>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${CARD};border:1px solid ${BORDER};border-radius:10px;margin:0 0 20px;">
        <tr><td style="padding:16px 20px;">
          <p style="color:${PURPLE};font-size:10px;font-weight:700;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">Breakdown</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;"><span style="color:${SUBTEXT};font-size:13px;">Easy</span></td>
              <td style="padding:4px 0;text-align:right;"><span style="color:${GREEN};font-size:13px;font-weight:700;font-family:monospace;">${stats.easyCount}</span></td>
            </tr>
            <tr>
              <td style="padding:4px 0;"><span style="color:${SUBTEXT};font-size:13px;">Medium</span></td>
              <td style="padding:4px 0;text-align:right;"><span style="color:${GOLD};font-size:13px;font-weight:700;font-family:monospace;">${stats.mediumCount}</span></td>
            </tr>
            <tr>
              <td style="padding:4px 0;"><span style="color:${SUBTEXT};font-size:13px;">Hard</span></td>
              <td style="padding:4px 0;text-align:right;"><span style="color:#f85149;font-size:13px;font-weight:700;font-family:monospace;">${stats.hardCount}</span></td>
            </tr>
          </table>
        </td></tr>
      </table>
      <p style="color:${SUBTEXT};font-size:13px;margin:0;line-height:1.5;">
        Longest streak: <strong style="color:${TEXT}">${stats.longestStreak} days</strong>. Keep pushing.
      </p>
    </td></tr>
    ${footerRow()}
  `)
}
