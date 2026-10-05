// The ONLY file that talks to the Django backend.
// In development Vite forwards "/api" to Django (see vite.config.js).
// Set VITE_API_URL to use a backend that lives somewhere else.
const API_URL = import.meta.env.VITE_API_URL ?? "/api";

// Django REST Framework sends errors as { detail: "…" } or { fieldName: ["…"] }.
async function getErrorMessage(response) {
  try {
    const errorData = await response.json();
    if (typeof errorData.detail === "string") {
      return errorData.detail;
    }
    const firstMessage = Object.values(errorData).flat()[0];
    if (typeof firstMessage === "string") {
      return firstMessage;
    }
  } catch {
    // The response was not JSON (e.g. the backend is not running)
  }
  return `The server could not complete the request (error ${response.status}).`;
}

async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Could not reach the server. Is the Django backend running?");
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
  return response.status === 204 ? null : response.json(); // 204 = success with no content
}

// Changes are sent one at a time, in the order they were made. Otherwise
// "add a category" and "add a transaction that uses it" could arrive swapped.
let lastWrite = Promise.resolve();

function write(path, options) {
  const result = lastWrite.then(() => request(path, options));
  lastWrite = result.catch(() => {}); // a failed change must not block the next one
  return result;
}

// ----- Whole app data: { transactions, categories, budgets } -----
// Waits for pending changes, so it never returns data that is about to change.
export function fetchAppData() {
  return lastWrite.then(() => request("/data/"));
}

export function clearAppData() {
  return write("/data/", { method: "DELETE" });
}

export function loadSampleData() {
  return write("/data/sample/", { method: "POST" });
}

// ----- Transactions -----
export function createTransaction(transaction) {
  return write("/transactions/", { method: "POST", body: transaction });
}

export function updateTransaction(id, fields) {
  return write(`/transactions/${id}/`, { method: "PUT", body: fields });
}

export function deleteTransaction(id) {
  return write(`/transactions/${id}/`, { method: "DELETE" });
}

// ----- Categories -----
export function createCategory(category) {
  return write("/categories/", { method: "POST", body: category });
}

export function updateCategory(id, fields) {
  return write(`/categories/${id}/`, { method: "PUT", body: fields });
}

// replacementName: the category that takes over this category's transactions.
export function deleteCategory(id, replacementName = null) {
  const query = replacementName ? `?replacement=${encodeURIComponent(replacementName)}` : "";
  return write(`/categories/${id}/${query}`, { method: "DELETE" });
}

// ----- Budgets -----
// changes: { monthlyLimit } and/or { categoryLimits: { [categoryId]: amount } }.
// A limit of 0 removes that budget.
export function updateBudgets(changes) {
  return write("/budgets/", { method: "PATCH", body: changes });
}
