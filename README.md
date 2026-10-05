# Expense Tracker

A React app to track income and expenses, manage categories, set monthly budgets and analyse spending with charts. Data is saved by the Django backend in `expense-tracker-django`; theme and currency stay in the browser.

Built as a React learning project. See **[docs/LEARNING_GUIDE.md](docs/LEARNING_GUIDE.md)** for how everything works.

## Features

- **Dashboard** — balance, income, expenses, this month's spending, budget status, recent transactions, 3 charts
- **Transactions** — add, edit, view, delete; search; filter by type, category, payment method, date range or current month; 4 sort orders
- **Categories** — add, rename, delete (transactions are safely moved to another category first)
- **Budgets** — overall monthly budget + per-category budgets, progress bars, warnings at 80% and over 100%
- **Reports** — monthly income/expenses/savings, highest expense, average daily spending, category breakdown, 6-month comparison, 12-month trend
- **Settings** — light/dark theme, currency, load sample data, clear all data
- Responsive (sidebar on desktop, bottom navigation on phones), keyboard and screen-reader friendly

## Tech stack

React 19 · React Router 7 · Recharts 3 · Vite · plain CSS with CSS variables · Django REST Framework backend

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint     # check code style
npm run build    # production build in dist/
```

### Which backend it uses

The dev server forwards every `/api` request to the Django backend named by `BACKEND_URL` in the `.env` file (see `vite.config.js`). It is set to the hosted backend, `https://aswathiashoke.pythonanywhere.com`, so nothing else needs to be running.

To use Django on your own PC instead, create a file named `.env.local` next to `.env`:

```bash
BACKEND_URL=http://127.0.0.1:8000
```

then start Django (`python manage.py runserver` in `expense-tracker-django`) and restart `npm run dev`.

This forwarding only exists in `npm run dev` and `npm run preview`. If you host the built app (`dist/`) on another site, build it with `VITE_API_URL=https://aswathiashoke.pythonanywhere.com/api` and allow that site's address on the Django side (CORS).

Tip: on an empty app, click **Load sample data** on the Dashboard to see 6 months of demo data.
