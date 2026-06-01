# HomeSpend — Technology Stack Reference
 
A quick reference for anyone asking about the technologies, languages,
and infrastructure behind HomeSpend (newhearths.com).
 
---
 
## Plain English Summary
 
HomeSpend is a web app built with modern JavaScript technologies.
The frontend is React — the same technology used by Facebook and
Instagram. The backend and database are managed by Base44, an AI
app-building platform. It is hosted in the cloud and works on any
phone or browser without needing to download anything.
 
---
 
## Frontend
 
| Layer              | Technology                                      |
|--------------------|-------------------------------------------------|
| Language           | JavaScript (JSX)                                |
| Framework          | React 18                                        |
| Build Tool         | Vite                                            |
| Styling            | Tailwind CSS                                    |
| Component Library  | shadcn/ui (built on Radix UI primitives)        |
| Animations         | Framer Motion                                   |
| Charts             | Recharts                                        |
| Routing            | React Router v6                                 |
| State Management   | TanStack Query (React Query)                    |
 
---
 
## Backend
 
| Layer              | Technology                                      |
|--------------------|-------------------------------------------------|
| Platform           | Base44 (managed backend)                        |
| Backend Functions  | TypeScript serverless functions                 |
| Authentication     | Base44 Auth (JWT-based)                         |
| API Style          | REST                                            |
| AI Agent           | Base44 Agents (powered by Claude by Anthropic)  |
 
---
 
## Database
 
| Layer              | Technology                                      |
|--------------------|-------------------------------------------------|
| Type               | NoSQL / Document store (managed by Base44)      |
| Access Control     | Row Level Security (RLS) — data scoped per      |
|                    | user and per home                               |
| Hosting            | Base44 managed cloud infrastructure             |
 
Note: Base44 abstracts the underlying database engine (similar to
how Firebase abstracts Firestore). If asked, describe it as a
managed NoSQL document store with row-level security.
 
---
 
## Infrastructure
 
| Layer              | Technology                                      |
|--------------------|-------------------------------------------------|
| Hosting            | Base44 cloud + custom domain                    |
| Domain             | newhearths.com                                  |
| SSL                | HTTPS enforced                                  |
| Deployment         | GitHub to Base44 auto-deploy pipeline           |
 
---
 
## Data Entities (Database Models)
 
| Entity             | Description                                     |
|--------------------|-------------------------------------------------|
| Home               | A household with name, country, currency, emoji |
| Expense            | A one-time expense with category, amount, date  |
| RecurringExpense   | A recurring bill with frequency and due date    |
| Budget             | A monthly budget target per home                |
| HomeInvite         | An invitation to share a home with another user |
| HomeActivity       | Audit log of all changes made to a shared home  |
 
---
 
## One-Liner for Pitches / LinkedIn
 
"HomeSpend is a React + Vite web app with a TypeScript serverless
backend, NoSQL database with row-level security, and an AI assistant
powered by Claude — all deployed via Base44 on a custom domain."
 
---
 
## Frequently Asked Questions
 
Q: What language is it written in?
A: JavaScript (React/JSX) on the frontend, TypeScript on the backend.
 
Q: What database does it use?
A: A managed NoSQL document store provided by Base44, with row-level
   security to scope data per user and per home.
 
Q: Is it a mobile app or web app?
A: It is a web app that is fully mobile-optimised and installable as
   a Progressive Web App (PWA) — no app store required.
 
Q: Where is it hosted?
A: On Base44's cloud infrastructure, accessible at newhearths.com.
 
Q: What powers the AI assistant?
A: Base44 Agents, which is built on top of Claude by Anthropic.
 
Q: Is the code open source?
A: No. The code is privately hosted on GitHub.
 
---
 
Last updated: June 2026
