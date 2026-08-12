# OTP Verification Implementation Plan

## Overview
Add email OTP verification to the signup flow to verify user email addresses before account creation.

---

## Current Flow
1. User fills signup form (username, email, password, daily commitment)
2. `supabase.auth.signUp()` creates user immediately
3. User settings inserted
4. Redirect to dashboard

## New Flow
1. User fills signup form
2. Send OTP to email via Supabase
3. Show OTP verification modal/page
4. User enters 6-digit code
5. Verify OTP → complete signup
6. Insert user settings
7. Redirect to dashboard

---

## Implementation Steps

### 1. Database Changes
- No schema changes needed (Supabase Auth handles email verification)
- Ensure `user_settings` insert only happens after email verified

### 2. Backend/API Changes

#### `/api/send-otp` (POST)
- Input: `{ email: string }`
- Call `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`
- Rate limit: 1 request per 60s per email
- Return: `{ success: true }` or error

#### `/api/verify-otp` (POST)
- Input: `{ email: string, code: string, username: string, password: string, dailyCommitment: number }`
- Call `supabase.auth.verifyOtp({ email, token: code, type: 'email' })`
- On success: create user session, insert `user_settings`
- Return: `{ success: true, user }` or error

### 3. Frontend Changes

#### Signup Page (`src/app/signup/page.tsx`)
- **Step 1**: Current form (username, email, password, daily commitment)
- On submit: call `/api/send-otp` → show OTP verification UI
- **Step 2**: OTP input (6 digits, auto-focus, paste support)
- On submit: call `/api/verify-otp` with all form data
- Loading/error states for both steps
- Resend OTP button (with cooldown timer)

#### New Components
- `OTPInput` - 6 separate inputs, auto-advance, paste handling
- `CountdownTimer` - Resend cooldown display

### 4. Supabase Configuration
- Enable "Email OTP" provider in Supabase Dashboard
- Configure email template (customize if needed)
- Set OTP expiry (default 1 hour, configurable)

### 5. Error Handling
- Invalid/expired OTP → show error, allow retry
- Rate limited → show cooldown timer
- Network errors → retry logic
- Email already registered → handle gracefully

### 6. UX Considerations
- Preserve form data between steps (useState or sessionStorage)
- Clear visual indication of current step
- Accessible OTP inputs (labels, ARIA)
- Mobile-friendly number keyboard (`inputMode="numeric"`)

---

## File Changes Summary

| File | Change Type |
|------|-------------|
| `src/app/signup/page.tsx` | Major rewrite - two-step flow |
| `src/app/api/send-otp/route.ts` | New API route |
| `src/app/api/verify-otp/route.ts` | New API route |
| `src/components/OTPInput.tsx` | New component |
| `src/components/CountdownTimer.tsx` | New component (optional) |

---

## Testing Checklist
- [ ] Valid OTP completes signup
- [ ] Invalid OTP shows error
- [ ] Expired OTP shows error
- [ ] Resend OTP works after cooldown
- [ ] Rate limiting prevents spam
- [ ] Form data preserved between steps
- [ ] Keyboard navigation works
- [ ] Paste OTP works
- [ ] Mobile number keyboard appears
- [ ] Existing user flow handled
- [ ] Redirect to dashboard on success

---

## Rollback Plan
If issues arise:
1. Revert to single-step signup
2. Keep OTP APIs for future use
3. Feature flag via env variable if needed