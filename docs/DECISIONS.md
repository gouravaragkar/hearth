# HomeSpend — Architecture & Decision Log

> Why we built it this way. Future reference for anyone (including future-you) wondering why certain choices were made.

---

## ADR-001 — Started with Base44, migrated to Supabase + Vercel

**Date:** June 2026
**Status:** Completed

**Context:**
App was initially built using Base44 AI app builder for speed. After launch, data ownership and platform dependency became concerns.

**Decision:**
Migrate to Supabase (database + auth + edge functions) + Vercel (hosting) stack.

**Reasons:**
- Full ownership of code and data
- No ongoing platform lock-in
- Supabase free tier generous enough for early stage
- Vercel integrates directly with GitHub for auto-deploy
- Both platforms have strong free tiers

**Trade-offs:**
- Significant migration effort (~2 weeks)
- Lost Base44's built-in AI agent (now building replacement)
- Had to rebuild auth, backend functions manually

---

## ADR-002 — Google OAuth only (no email/password)

**Date:** June 2026
**Status:** Active

**Context:**
Needed authentication. Options were email/password, Google OAuth, or magic links.

**Decision:**
Google OAuth only.

**Reasons:**
- Lowest friction for users — one tap sign in
- No password management overhead
- No email verification flow needed
- Most target users (households, families) have Google accounts
- Supabase makes it trivial to implement

**Trade-offs:**
- Users without Google accounts can't sign up (mitigated by guest mode)
- Dependency on Google's OAuth service

---

## ADR-003 — Supabase Row Level Security for data isolation

**Date:** June 2026
**Status:** Active

**Context:**
Multi-tenant app where users must only see their own data, and shared home data must be visible to all members.

**Decision:**
Use Supabase RLS policies on every table.

**Reasons:**
- Security enforced at database level — no accidental data leaks
- Works automatically with Supabase client — no manual filtering needed
- Scales well as user base grows

**Trade-offs:**
- RLS policies are complex — caused several bugs during development
- Invite flow required careful policy design (pending vs approved states)
- Some operations need security definer functions to bypass RLS legitimately

---

## ADR-004 — Supabase Edge Functions for server-side operations

**Date:** June 2026
**Status:** Active

**Context:**
Some operations need elevated database access (invite migration, guest data cleanup, email sending) that can't run client-side.

**Decision:**
Use Supabase Edge Functions (Deno-based serverless functions).

**Reasons:**
- Runs close to the database
- Uses SUPABASE_SECRET_KEYS automatically
- No separate backend server needed
- Free tier includes generous invocations

**Functions built:**
- `send-invite-email` — sends Resend emails for home invitations
- `migrate-guest-data` — migrates anonymous user data to Google account
- `cleanup_guest_data` — pg_cron scheduled function, deletes expired guest data

---

## ADR-005 — PWA instead of native app

**Date:** June 2026
**Status:** Active

**Context:**
Needed mobile app experience. Options: native iOS/Android, React Native, PWA.

**Decision:**
PWA (Progressive Web App).

**Reasons:**
- Works on both iPhone and Android from one codebase
- No app store fees or approval process
- Instant updates — no app store submission needed
- Already a React app — PWA is just a manifest + service worker
- Apple App Store costs $99/year; Google Play costs $25 one-time

**Trade-offs:**
- Slightly less native feel than true native apps
- iOS PWA support is decent but not as good as Android
- No App Store discoverability (mitigated by direct URL sharing)

---

## ADR-006 — Resend for transactional email

**Date:** June 2026
**Status:** Active

**Context:**
Need to send invite emails to users.

**Decision:**
Resend.com via Supabase Edge Function.

**Reasons:**
- Free tier: 3,000 emails/month
- Simple API — single fetch call
- Good deliverability
- Easy domain verification
- Developer-friendly

**Domain:** invites@myhomespend.com

---

## ADR-007 — Guest mode with anonymous Supabase auth

**Date:** June 2026
**Status:** Active

**Context:**
Beta feedback showed users wanted to try the app before signing up.

**Decision:**
Supabase anonymous sign-in for guest mode.

**Reasons:**
- Built into Supabase — no custom implementation needed
- RLS works automatically with anonymous users
- Can be upgraded to real account (preserving data) via migration edge function
- 7-day expiry with pg_cron auto-cleanup

**Trade-offs:**
- Data migration on upgrade requires custom edge function
- Guest users can't receive home invites (no email)
- Supabase `linkIdentity` not available on free tier — workaround needed

---

## How to Use This File

Add a new entry whenever you make a significant technical decision:
- Choosing a library or service
- Changing an architecture pattern
- Deliberately NOT doing something and why
- Fixing a major bug with a non-obvious solution

Format: ADR-XXX — Title, Date, Status, Context, Decision, Reasons, Trade-offs
