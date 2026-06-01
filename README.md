
# 🏡 HomeSpend
 
> Track home expenses, recurring bills, and shared costs — all in one place.
 
**Live app:** [newhearths.com](https://newhearths.com)
 
---
 
## About
 
HomeSpend is a home expense tracker built for households who want clarity over their finances without the complexity of spreadsheets. Whether you're managing bills solo, splitting costs with a partner, or tracking expenses across multiple homes in different countries — HomeSpend keeps everything in one clean, simple place.
 
---
 
## Features
 
- **Dashboard** — Monthly summary, upcoming bills due in the next 7 days, and a category spend breakdown at a glance
- **Recurring Expenses** — Log rent, utilities, subscriptions, and insurance once; HomeSpend tracks weekly, fortnightly, monthly, and quarterly schedules
- **One-Time Expenses** — Quickly log any spend across 10 categories
- **Calendar View** — See all bills and expenses laid out on a monthly calendar
- **Shared Homes** — Invite your partner, housemates, or family to a shared Home; everyone sees the same expenses, budget, and activity log
- **Multiple Homes** — Manage finances across multiple properties or countries, each with its own currency (AUD, INR, USD, GBP, and 30+ more)
- **Monthly Budget** — Set a budget and track it with a live progress bar
- **Insights & Reports** — Spending by category (donut chart), 6-month trend, and downloadable monthly PDF reports
- **AI Assistant** — Chat-based expense logging; just say "log $120 for electricity" and it's done
- **Activity Log** — Every change to a shared Home is recorded so you always know who did what
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend / Database | Base44 |
| Auth | Base44 Auth |
| AI Agent | Base44 Agents |
| Hosting | Base44 + Custom Domain |
 
---
 
## Local Development
 
### Prerequisites
- Node.js 18+
- A Base44 account with access to this app
### Setup
 
1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```
 
2. Install dependencies
```bash
npm install
```
 
3. Create a `.env.local` file in the root directory with your Base44 credentials
```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
```
 
4. Start the development server
```bash
npm run dev
```
 
The app will be available at `http://localhost:5173`
 
---
 
## Deployment
 
This app is deployed via Base44. To publish changes:
 
1. Push your changes to this GitHub repository
2. Base44 automatically picks up the changes and redeploys
Or publish directly from the Base44 dashboard.
 
---
 
## Project Structure
 
```
├── base44/
│   ├── entities/          # Data models (Expense, Home, Budget, etc.)
│   ├── functions/         # Backend serverless functions
│   └── agents/            # AI assistant configuration
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # App pages (Dashboard, Calendar, etc.)
│   ├── context/           # React context (HomeContext)
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and helpers
├── index.html
└── vite.config.js
```
 
---
 
## Data Entities
 
| Entity | Description |
|---|---|
| `Home` | A household with name, country, currency, and emoji |
| `Expense` | A one-time expense with category, amount, and date |
| `RecurringExpense` | A recurring bill with frequency and next due date |
| `Budget` | A monthly budget target per home |
| `HomeInvite` | An invitation to share a home with another user |
| `HomeActivity` | An audit log of all changes made to a shared home |
 
---
 
## License
 
Private — All rights reserved.
 
---
 
*Built with ❤️ using Base44 and React*
