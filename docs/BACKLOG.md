# HomeSpend — Product Backlog

> Ideas parking lot. Everything here is unvalidated — needs sizing and prioritisation before moving to ROADMAP.
> Format: [Priority: High/Medium/Low] — Description — Source

---

## Bugs & Fixes

- [Medium] Debug console.log still present in SpendingTrend.jsx
- [Low] `<meta name="apple-mobile-web-app-capable">` deprecation warning in console

---

## Features — User Requested (Beta Feedback)

- [High] Push notifications for upcoming bills
- [Medium] Push notifications — bill due reminders 3 days before due date
- [Medium] CSV export of expenses
- [Low] Dark mode toggle
- [Low] Receipt scanning via camera

### Completed ✅
- [High] AI Assistant — chat-based expense logging ✅ Done v1.6.0
- [High] Bank statement import — PDF upload with AI categorisation ✅ Done v1.7.0
- [Medium] Guest mode ✅ Done v1.5.0
- [Medium] Annual and semi-annual frequencies ✅ Done v1.5.0
- [Medium] Landing page ✅ Done v1.4.0
- [Medium] Mobile UI overhaul ✅ Done v1.3.0

---

## Features — Founder Ideas

- [Medium] Weekly email digest — "Your HomeSpend week in review"
- [Medium] Bill payment reminders via SMS (Twilio)
- [Medium] Custom categories (user-defined)
- [Low] Recurring expense templates (common bills pre-filled)
- [Low] Currency conversion on dashboard (show everything in base currency)
- [Low] Household member spending breakdown (who spent what)

---

## UX Improvements

- [Medium] Onboarding tour for new users (first-time guided experience)
- [Medium] Empty state improvements with suggested actions
- [Low] Swipe to delete expense on mobile
- [Low] Bulk delete/edit expenses
- [Low] Drag to reorder recurring expenses

---

## Technical

- [Medium] E2E tests with Playwright
- [Medium] Error boundary components — better error handling UI
- [Low] Performance monitoring (Sentry or similar)
- [Low] Analytics (privacy-friendly, e.g. Plausible)

### Completed ✅
- [High] Automated test suite (Vitest + GitHub Actions) ✅ Done v1.6.0

---

## How to Use This File

1. Add new ideas here as they come — don't filter, just capture
2. Tag with source: Beta Feedback / Founder / User Research
3. Weekly: review and promote to ROADMAP if validated
4. Monthly: archive completed items to CHANGELOG
