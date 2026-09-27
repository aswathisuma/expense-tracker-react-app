# Expense Tracker — Learning Guide

This guide explains how the app works and which React ideas it uses. Read it with the code open: every section points to the files involved.

---

## 1. How the app is organised

```text
src/
├── main.jsx            Entry point: wraps <App> in Router + 3 providers
├── App.jsx             Route table (lazy-loaded pages)
├── index.css           Design tokens (CSS variables) + all styles
├── pages/              One component per route
├── components/
│   ├── layout/         Layout, Navbar, Sidebar, MobileNav
│   ├── common/         Reusable building blocks (Modal, FormField, SummaryCard…)
│   ├── transactions/   TransactionForm, TransactionList, TransactionItem, FilterBar…
│   ├── categories/     CategoryCard, CategoryForm, DeleteCategoryDialog
│   ├── budgets/        BudgetCard, BudgetForm, BudgetAlerts, BudgetStatusBadge
│   ├── charts/         Recharts components + table views
│   └── dashboard/      BudgetSummary
├── context/            *Context.js (createContext) + *Provider.jsx (state + actions)
├── hooks/              useLocalStorage, useExpenses, useTheme, useSettings, useCurrency
├── services/           storageService.js — the ONLY code that touches localStorage
├── utils/              Pure functions: calculations, filters, validation, formatting
├── constants/          Fixed values: payment methods, storage keys, sort options…
└── data/               Default categories + sample data generator
```

### Changes from the originally suggested structure (and why)

| Change | Why |
|---|---|
| `components/` split into feature folders | A flat folder with 35+ files is hard to navigate. |
| `services/storageService.js` added | One place to swap localStorage for a Django API later. |
| `constants/` added | Values like payment methods are typed once, never repeated as strings. |
| Context split into `XContext.js` + `XProvider.jsx` + `hooks/useX.js` | Vite's Fast Refresh (and its ESLint rule) requires a `.jsx` file to export only components. |
| `SettingsContext` added | Currency is a user preference used on many pages, like the theme. |
| `utils/filterUtils.js`, `budgetUtils.js`, `categoryUtils.js` added | Keeps `calculations.js` focused on money maths. |

---

## 2. React concepts used — and where

| Concept | What it is | Where to look |
|---|---|---|
| **Components** | Functions that return UI | Every file in `components/` and `pages/` |
| **Props** | Inputs passed from parent to child | `SummaryCard` (`label`, `value`, `tone`), `BudgetCard` |
| **`children` prop** | Content placed between a component's tags | `PageHeader`, `EmptyState`, `Modal`, `FormField` |
| **State / `useState`** | Data that changes and triggers re-render | `TransactionForm` (`values`, `errors`), `Transactions` (`activeModal`, `filters`) |
| **Lazy initial state** | `useState(() => …)` runs the function only once | `useLocalStorage.js`, `TransactionForm.jsx` |
| **Functional updates** | `setX(previous => …)` uses the latest state | `ExpenseProvider.jsx` (every action) |
| **`useEffect`** | Sync React with something outside React | `useLocalStorage` (save to storage), `ThemeProvider` (`<html data-theme>`), `Modal` (`showModal()`), `Layout` (tab title) |
| **`useContext`** | Read shared state without prop drilling | `hooks/useExpenses.js`, `useTheme.js`, `useSettings.js` |
| **`useMemo`** | Cache an expensive calculation | `Dashboard`, `Reports`, `Budgets`, `Transactions` (filter+sort), all providers' `value` |
| **`useCallback`** | Keep a function identity stable between renders | `ExpenseProvider.jsx`, `ThemeProvider.jsx`, `SettingsProvider.jsx` |
| **`useRef`** | Direct access to a DOM element | `Modal.jsx` (`dialog.showModal()`) |
| **`useId`** | Unique id for accessibility attributes | `Modal.jsx` (`aria-labelledby`) |
| **Custom hooks** | Reusable hook logic | `useLocalStorage`, `useCurrency`, `useExpenses`… |
| **Conditional rendering** | Show UI only when a condition holds | `{error && <p>…}`, empty states, `{activeModal?.mode === "add" && <Modal>}` |
| **List rendering + keys** | `.map()` to JSX with a stable `key` | `TransactionList` (`key={transaction.id}`), `Sidebar` |
| **Controlled components** | Input `value` comes from state, `onChange` updates it | `TransactionForm`, `CategoryForm`, `BudgetForm`, `FilterBar` |
| **Form validation** | Pure functions that return `{ field: message }` | `utils/validation.js` |
| **Lifting state up** | State lives in the parent that needs it | `filters` lives in `Transactions`, not `FilterBar` |
| **Derived state** | Compute from existing state instead of storing | Every total, `selectedTransaction`, `availableCategories`, `visibleTransactions` |
| **React Router** | URL → component mapping | `App.jsx`, `Layout.jsx` (`<Outlet>`), `NavLink`, `Link`, `useLocation` |
| **`React.lazy` + `Suspense`** | Load page code on demand, show a loader meanwhile | `App.jsx`, `Layout.jsx` |
| **Error boundary** | Catch render errors, show a fallback | `components/common/ErrorBoundary.jsx` (a class component) |
| **Empty states** | Helpful UI when there's no data | `EmptyState` on every page, `ChartCard isEmpty` |
| **Loading states** | UI while something isn't ready | `Loader` shown by `Suspense` while a page downloads |

---

## 3. What each phase built

| Phase | What was added | Key files |
|---|---|---|
| 1. Setup | Routing, layout, sidebar/mobile nav, theme foundation | `App.jsx`, `components/layout/*`, `ThemeProvider.jsx` |
| 2. Transactions | Add/edit/delete/view, validation, localStorage | `ExpenseProvider.jsx`, `useLocalStorage.js`, `storageService.js`, `TransactionForm.jsx`, `Modal.jsx` |
| 3. Dashboard | Totals, month spending, budget summary, recent list | `utils/calculations.js`, `pages/Dashboard.jsx`, `SummaryCard.jsx` |
| 4. Search & filters | Search, type/category/payment/date filters, 4 sorts | `utils/filterUtils.js`, `FilterBar.jsx`, `pages/Transactions.jsx` |
| 5. Categories & budgets | Category CRUD with safe delete, monthly + category budgets, warnings | `pages/Categories.jsx`, `DeleteCategoryDialog.jsx`, `pages/Budgets.jsx`, `utils/budgetUtils.js` |
| 6. Reports & charts | 3 Recharts charts, month picker, financial summary, table views | `components/charts/*`, `pages/Reports.jsx` |
| 7. UI polish | Currency setting, clear/sample data with confirmation, error boundary, lazy loading, skip link, no theme flash | `pages/Settings.jsx`, `SettingsProvider.jsx`, `ErrorBoundary.jsx`, `index.html` |
| 8. Refactor | Memoised context values, shared amount validation, single sort function | Providers, `validation.js`, `transactionUtils.js` |

---

## 4. Component responsibilities

**Layout**
- `Layout` — page frame: skip link, sidebar, navbar, `<Outlet>` wrapped in `ErrorBoundary` + `Suspense`; sets the tab title.
- `Sidebar` / `MobileNav` — navigation built from `constants/navItems.js` (desktop vs. phone).
- `Navbar` — brand on mobile, theme toggle.

**Common (reused everywhere)**
- `PageHeader` — page title, subtitle, action buttons (`children`).
- `EmptyState` — icon, message, optional actions.
- `Modal` — native `<dialog>`: backdrop, Esc, focus trapping. Rendered only while open, so forms inside always start fresh.
- `ConfirmDialog` — "Are you sure?" built on `Modal`; replaces `window.confirm()`.
- `FormField` — label + input + hint + error, wired for screen readers.
- `SummaryCard` — one statistic tile.
- `ProgressBar` — accessible progress bar with ok/warning/exceeded colours.
- `Loader`, `ErrorBoundary` — loading and error states.

**Transactions**
- `TransactionForm` — controlled add/edit form with validation; filters categories by type.
- `TransactionList` / `TransactionItem` — the list and one row. Handlers are optional, so the Dashboard reuses it read-only.
- `TransactionDetails` — all fields + Edit/Delete.
- `FilterBar` — search, sort and the filter panel; reports changes to its parent.

**Categories** — `CategoryCard` (usage stats), `CategoryForm` (name + type with rules), `DeleteCategoryDialog` (confirm, reassign, or explain why not).

**Budgets** — `BudgetCard` (budget/spent/remaining/% + progress), `BudgetForm`, `BudgetAlerts`, `BudgetStatusBadge` (icon + text, never colour alone).

**Charts** — `IncomeExpenseChart`, `CategoryExpenseChart`, `ExpenseTrendChart`, `ChartCard`, `ChartTooltip`, plus `MonthlyTotalsTable` / `CategoryBreakdownTable` as table views.

---

## 5. State management

### Where state lives, and why

| State | Lives in | Why there |
|---|---|---|
| transactions, categories, budgets | `ExpenseProvider` (context) | Needed by almost every page |
| theme | `ThemeProvider` | Needed by Navbar and Settings; applied to `<html>` |
| settings (currency) | `SettingsProvider` | Needed by every component that shows money |
| form values + errors | Each form component | Only the form cares until it's submitted |
| which modal is open | The page (`Transactions`, `Categories`, `Budgets`) | The page decides what to show |
| filters | `Transactions` page | The page filters the list; `FilterBar` just edits them |
| filter panel open/closed | `FilterBar` | Pure UI detail, nobody else needs it |

**Rule of thumb:** put state in the lowest component that contains everything that needs it.

### What is NOT stored

Balance, totals, remaining budget, chart data, the filtered list: all **derived** on each render (cached with `useMemo`). If they were stored, they could disagree with the transactions they came from.

### How Context is used

```text
main.jsx
└─ <ThemeProvider>            value: { theme, toggleTheme }
   └─ <SettingsProvider>      value: { settings, updateSettings, resetSettings }
      └─ <ExpenseProvider>    value: { transactions, categories, budgets, add/update/delete… }
         └─ <App />
```

1. `context/ExpenseContext.js` creates the "channel": `createContext(null)`.
2. `ExpenseProvider.jsx` holds the state and **all actions that change it**, and publishes them with `<ExpenseContext.Provider value={…}>`.
3. Any component calls `useExpenses()` to read data and call actions.
4. `useExpenses()` throws a clear error if used outside the provider.
5. The `value` object is wrapped in `useMemo` and the actions in `useCallback`, so components re-render only when the data really changes.

Components never call `setTransactions` directly — they call `addTransaction(formValues)`. That keeps business rules (like "renaming a category renames it in every transaction") in one place.

---

## 6. LocalStorage persistence

```text
Component ─► useExpenses().addTransaction() ─► setTransactions()      (React state)
                                                      │
                               useLocalStorage's useEffect sees the change
                                                      ▼
                                storageService.writeToStorage(key, value)  ─► localStorage
```

- **Saving** — `useLocalStorage` has a `useEffect` with `[key, value]` dependencies. Every time the value changes, it is written with `JSON.stringify`.
- **Loading** — on the very first render, `useState(() => readFromStorage(…))` reads and `JSON.parse`s the stored value once.
- **Updates** — components update React state only; saving happens automatically as a side effect.
- **Persistence** — localStorage survives refreshes and browser restarts (per browser, per site).
- **Safety** — `readFromStorage` returns the default value when the key is missing, when `JSON.parse` throws (corrupted text), or when a validator (`isValidTransactionList`, `isValidBudgets`…) rejects the shape. Writing is wrapped in `try/catch` for full/blocked storage.

| Key | Contents |
|---|---|
| `expense-tracker:transactions` | `[{ id, type, amount, category, date, paymentMethod, description, createdAt }]` |
| `expense-tracker:categories` | `[{ id, name, type: "expense" \| "income" \| "both" }]` |
| `expense-tracker:budgets` | `{ monthlyLimit: 40000, categoryLimits: { "cat-food": 6000 } }` |
| `expense-tracker:settings` | `{ currency: "INR" }` |
| `expense-tracker:theme` | `"light"` or `"dark"` |

Budgets are keyed by **category id**, so renaming a category keeps its budget. Transactions store the category **name** (as the spec's data model shows), so a rename is copied into transactions by `updateCategory`.

---

## 7. Routing

| Path | Page | Notes |
|---|---|---|
| `/` | Dashboard | `index` route |
| `/transactions` | Transactions | list, filters, add/edit/view/delete modals |
| `/categories` | Categories | grouped by type |
| `/budgets` | Budgets | current month |
| `/reports` | Reports | month picker |
| `/settings` | Settings | theme, currency, data, about |
| `*` | NotFound | any unknown URL |

All routes are children of `<Route element={<Layout />}>`, so the sidebar/navbar render once and only `<Outlet />` changes. `NavLink` adds the `active` class automatically; `end` on `/` stops it matching every route. Pages are loaded with `React.lazy`, so Recharts (the largest dependency) is only downloaded when a chart page opens.

---

## 8. How chart data is built

Charts never read raw transactions. Pure functions in `utils/calculations.js` turn transactions into small arrays, and `useMemo` caches them:

| Chart | Function | Output shape |
|---|---|---|
| Income vs Expense | `getMonthlyTotals(transactions, getRecentMonthKeys(6, month))` | `[{ monthKey: "2026-09", income, expenses, savings }]` |
| Expense by Category | `getExpensesByCategory(monthTransactions)` (+ `limitCategoryRows` on the dashboard) | `[{ category: "Food", amount, percentage }]` sorted largest first |
| Monthly Trend | `getMonthlyTotals(…12 months…)` | same as above, `expenses` plotted |

- `getMonthlyTotals` groups in **one pass** with a `Map`, and includes empty months as 0; `trimLeadingEmptyMonths` drops months before tracking began.
- Month keys are `"YYYY-MM"` strings; `formatShortMonthLabel` turns them into axis labels.
- Colours are CSS variables (`--chart-income` blue, `--chart-expense` orange), so charts follow dark mode. Blue/orange was chosen over green/red because it stays distinguishable for colour-blind users.
- Every chart has a tooltip; Reports also offers the data as tables.

---

## 9. Future Django integration

Target architecture:

```text
React  ──fetch/JSON──►  Django REST Framework  ──ORM──►  PostgreSQL
```

### What stays the same
All of `components/`, `pages/`, `utils/` (calculations, filters, formatters, validation), `constants/`. Components only know `useExpenses()`; they don't care where data comes from.

### What changes

1. **`services/` becomes an API client** (e.g. `services/api.js`):
   ```js
   const API_URL = import.meta.env.VITE_API_URL;

   export async function fetchTransactions() {
     const response = await fetch(`${API_URL}/transactions/`, { headers: authHeaders() });
     if (!response.ok) throw new Error("Could not load transactions");
     return response.json();
   }
   export async function createTransaction(data) { /* POST */ }
   export async function updateTransaction(id, data) { /* PATCH */ }
   export async function deleteTransaction(id) { /* DELETE */ }
   ```

2. **`ExpenseProvider` loads data asynchronously** instead of `useLocalStorage`:
   ```js
   const [transactions, setTransactions] = useState([]);
   const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"

   useEffect(() => {
     fetchTransactions()
       .then((data) => { setTransactions(data); setStatus("ready"); })
       .catch(() => setStatus("error"));
   }, []);

   const addTransaction = useCallback(async (formValues) => {
     const saved = await api.createTransaction(toTransactionFields(formValues));
     setTransactions((previous) => [saved, ...previous]); // server returns id + createdAt
   }, []);
   ```
   Expose `status` so pages can show `<Loader />` / an error `EmptyState` — the loading and error UI already exists.

3. **Forms await the action** and show server errors (e.g. `catch` → `setErrors(serverErrors)`); disable the submit button while saving.

4. **IDs and timestamps** come from Django (`id`, `created_at`) — `generateId()` and `createdAt` generation are removed from `transactionUtils.js`.

5. **Categories become a foreign key.** In Django, `Transaction.category = models.ForeignKey(Category, on_delete=models.PROTECT)`. The frontend stores `categoryId`; renames no longer need to touch transactions, and `PROTECT` enforces the "can't delete a used category" rule on the server.

6. **Authentication** — add login (e.g. JWT via `djangorestframework-simplejwt`), an `AuthContext`, and a protected route wrapper. Each user sees only their own data (`queryset = Transaction.objects.filter(user=request.user)`).

7. **Heavy reports can move server-side** — e.g. `GET /api/reports/monthly-totals/?months=12` using Django's `TruncMonth` + `Sum` aggregation. The chart components stay the same because the response has the same shape.

8. **Settings/theme** can stay in localStorage (device preference) or move to a user profile endpoint.

Suggested Django models:

```python
class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=30)
    type = models.CharField(max_length=10, choices=[("expense", "Expense"), ("income", "Income"), ("both", "Both")])

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=[("expense", "Expense"), ("income", "Income")])
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    date = models.DateField()
    payment_method = models.CharField(max_length=20)
    description = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.CASCADE)  # null = overall monthly budget
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2)
```

Note: use `DecimalField` for money on the server — floating point numbers can't represent values like 0.1 exactly. (The frontend rounds to paise in `calculations.js` for the same reason.)

---

## 10. Ideas for practice

Good next exercises, each touching one concept:

- **Export/import JSON** — a Settings button that downloads `transactions` (Blob + `URL.createObjectURL`).
- **Recurring transactions** — a `recurring: "monthly"` field and a function that generates due entries.
- **Filters in the URL** — use `useSearchParams` so a filtered view can be bookmarked.
- **Unit tests** — `utils/` are pure functions; try Vitest (`npm i -D vitest`) on `calculations.js`.
- **Toast notifications** — a small `ToastContext` showing "Transaction added".
