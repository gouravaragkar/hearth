# HomeSpend — Product Roadmap

> Last updated: June 2026
> Live at: myhomespend.com

---

## Completed (Shipped)

- ✅ Core expense tracking — recurring + one-time expenses
- ✅ Multi-home support with member invites
- ✅ Google OAuth authentication
- ✅ Guest mode with 7-day trial and data migration
- ✅ AI Assistant — chat-based expense logging (Claude API)
- ✅ Bank statement import — PDF upload with AI extraction and categorisation
- ✅ PWA — installable on iOS and Android
- ✅ Landing page and marketing site
- ✅ Semi-annual and annual expense frequencies
- ✅ Mobile UI overhaul

---

## Near Term — v1.8.0 (Next Sprint)

### Push Notifications
- Push notifications for upcoming bills (3 days before due date)
- Budget threshold alerts (80%, 100% used)

### CSV Export
- Export expenses to CSV for a selected month or date range
- Download from Dashboard or One-Time Expenses page

---

## Medium Term — v2.0.0

### Enhanced Reporting
- Year-over-year comparison
- Custom date range reports

### Recurring Expense Improvements
- Auto-mark paid when due date passes
- Snooze a payment
- Payment history per recurring expense

---

## Long Term — Future

### Mobile Apps
- Google Play Store submission (TWA wrapper)
- Apple App Store ($99/year investment when warranted)

### Social / Community
- Anonymous spending benchmarks ("households like yours spend X on utilities")
- Referral program

### Integrations
- Open Banking API (Australia — CDR)

---

## Icebox (Parked Ideas)

- Multi-language support
- Dark mode toggle (currently system-based)
- Bill splitting / debt tracking between housemates
- Receipt scanning via camera

---

## Won't Do (Deliberately Out of Scope)

- Investment tracking (too complex, different product)
- Tax reporting (compliance risk)
- Credit card management (requires banking licence)

---

## Future — BizSpend (Separate Product Consideration)

### Principles

- Treated as a completely separate product — separate domain, separate branding
- Built on top of HomeSpend infrastructure (Supabase, React, Vercel) but isolated codebase
- Will not share UI or routes with HomeSpend — separate deployment
- Only proceed after HomeSpend reaches 200+ active users

### Proposed Name Options

- **TradeSpend** (preferred — Australian, targets tradies/sole traders)
- BizSpend
- WorkSpend

### Target Market

- Australian freelancers and sole traders
- Small trades businesses (plumbers, electricians, builders)
- Small retail and hospitality
- NOT competing with Xero/MYOB — simpler, cheaper, no accounting degree needed

### Feature Delta from HomeSpend

**Phase 1 — Minimal viable:**
- Business home type with business expense categories
- Income tracking (invoices sent, payments received)
- Simple P&L view (income minus expenses)
- GST flag on expenses (yes/no)

**Phase 2 — Growth:**
- BAS summary report (quarterly GST)
- Mileage tracking
- Receipt photo upload
- Team members with role-based access (owner, employee, accountant)

**Phase 3 — Scale:**
- Xero/MYOB export
- ATO integration
- Payroll (very long term)

### When to Start

- HomeSpend has 200+ active monthly users
- At least 10 users have organically requested business features
- Founder has bandwidth for a second product
