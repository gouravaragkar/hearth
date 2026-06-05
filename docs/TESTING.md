# HomeSpend — Testing Strategy

> Last updated: June 2026

---

## Testing Philosophy

HomeSpend is a personal finance app — data integrity and correctness matter more than pixel-perfect UI. Our testing priority:

```
1. Core calculations (highest risk if wrong)
2. Data mutations (expenses, homes, invites)
3. Auth flows (guest, Google, invite)
4. UI components (lowest risk)
```

---

## Test Stack

| Layer | Tool | Status |
|---|---|---|
| Unit tests | Vitest | ✅ Set up |
| Component tests | React Testing Library | ✅ Set up |
| E2E tests | Playwright | ⏳ Planned |
| CI pipeline | GitHub Actions | ✅ Set up |

---

## What We Test

### Unit Tests (src/test/)

**utils.test.js** — Core calculation functions
- `getMonthlyEquivalent` — all 6 frequencies (weekly, fortnightly, monthly, quarterly, semi-annual, annual)
- `getNextDueDate` — next due date calculations

**currencies.test.js** — Currency formatting
- `formatCurrency` — AUD, INR, USD formatting
- `getCurrency` — currency lookup
- Edge cases: zero, negative, large numbers

### Planned Tests

**SpendingTrend.test.js**
- Recurring expenses only show from their start_date onwards
- Timezone handling (Australia UTC+10 edge cases)

**MonthHistoryModal.test.js**
- Recurring expenses filtered by month
- Budget calculations

**Auth flow tests**
- Guest mode sign in
- Google OAuth redirect
- Invite flow redirect to /homes

---

## CI Pipeline

Every push to `main` triggers GitHub Actions:

```yaml
1. npm ci          — install dependencies
2. npm run lint    — check code style
3. npm run test    — run Vitest suite
4. npm run build   — verify production build
```

If any step fails, Vercel deployment is blocked.

---

## Running Tests Locally

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file save)
npm run test:watch

# Run with UI (visual test runner)
npm run test:ui
```

---

## Test Coverage Goals

| Area | Target | Current |
|---|---|---|
| Utility functions | 90% | ~60% |
| Currency functions | 90% | ~60% |
| Components | 40% | 0% |
| E2E flows | Key paths | 0% |

---

## Manual Test Checklist (Before Major Releases)

Run through this before every significant release:

### Auth
- [ ] Google sign in works
- [ ] Guest mode sign in works
- [ ] Guest banner shows with correct days remaining
- [ ] Guest upgrade to Google preserves data
- [ ] Invite email received
- [ ] Invite link redirects to Homes tab
- [ ] Invite approval adds shared home

### Expenses
- [ ] Add recurring expense (all frequencies)
- [ ] Add one-time expense
- [ ] Edit expense
- [ ] Delete expense (with confirmation)
- [ ] Mark recurring as paid
- [ ] Calendar shows expenses correctly

### Homes
- [ ] Create home
- [ ] Edit home
- [ ] Delete home
- [ ] Switch between homes
- [ ] Multi-currency display

### Dashboard
- [ ] Monthly summary shows correct totals
- [ ] Budget tracking works
- [ ] Upcoming payments shows correct bills
- [ ] Spending trend chart accurate
- [ ] Month history correct

### Mobile (iPhone Safari)
- [ ] App installs as PWA
- [ ] All tabs navigable
- [ ] Forms work correctly
- [ ] No layout overflow issues

---

## Known Gaps

- No E2E tests yet — Playwright setup planned for v2.0
- No Supabase integration tests — mocking strategy needed
- No visual regression tests

---

## How to Add a New Test

1. Create file in `src/test/` matching the module you're testing
2. Follow existing patterns in `utils.test.js`
3. Run `npm test` to verify it passes
4. Commit with message `test: add tests for X`
