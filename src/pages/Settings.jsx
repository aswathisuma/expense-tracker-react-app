import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useTheme } from "../hooks/useTheme";
import { useSettings } from "../hooks/useSettings";
import { useExpenses } from "../hooks/useExpenses";
import { CURRENCIES } from "../constants/settings";
import { APP_NAME, APP_VERSION } from "../constants/app";
import { getCurrencySymbol } from "../utils/formatters";

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { transactions, categories, clearAllData, loadSampleData } = useExpenses();

  // null | "clear" | "sample" : which confirmation dialog is open
  const [pendingAction, setPendingAction] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  function handleConfirm() {
    if (pendingAction === "clear") {
      clearAllData();
      resetSettings();
      setStatusMessage("All data has been cleared.");
    } else {
      loadSampleData();
      setStatusMessage("Sample data loaded. Open the Dashboard to explore it.");
    }
    setPendingAction(null);
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Customise your experience" />

      <div className="settings-stack">
        <section className="card">
          <h2 className="card__title">Appearance</h2>
          <div className="settings-row">
            <div>
              <p>Theme</p>
              <p className="text-muted">Currently using {theme === "light" ? "Light" : "Dark"} mode</p>
            </div>
            <button type="button" className="btn btn--primary" onClick={toggleTheme}>
              Switch to {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Currency</h2>
          <div className="settings-row">
            <div>
              <label htmlFor="currency-select">Display currency</label>
              <p className="text-muted">Changes the symbol and number format. Amounts are not converted.</p>
            </div>
            <select
              id="currency-select"
              className="form-control settings-row__control"
              value={settings.currency}
              onChange={(event) => updateSettings({ currency: event.target.value })}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {getCurrencySymbol(currency.code)} {currency.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Data</h2>
          <p className="text-muted settings-data-summary">
            {transactions.length} transactions and {categories.length} categories are saved on the server.
          </p>
          <div className="settings-row">
            <div>
              <p>Load sample data</p>
              <p className="text-muted">Replaces your transactions and budgets with 6 months of demo data.</p>
            </div>
            <button type="button" className="btn btn--ghost" onClick={() => setPendingAction("sample")}>
              Load sample data
            </button>
          </div>
          <div className="settings-row settings-row--divided">
            <div>
              <p>Clear application data</p>
              <p className="text-muted">Deletes all transactions and budgets, and resets categories and settings.</p>
            </div>
            <button type="button" className="btn btn--danger" onClick={() => setPendingAction("clear")}>
              Clear all data
            </button>
          </div>
          {statusMessage && (
            <p className="status-message" role="status">
              {statusMessage}
            </p>
          )}
        </section>

        <section className="card">
          <h2 className="card__title">About</h2>
          <dl className="details-list">
            <div className="details-list__row">
              <dt>Application</dt>
              <dd>{APP_NAME}</dd>
            </div>
            <div className="details-list__row">
              <dt>Version</dt>
              <dd>{APP_VERSION}</dd>
            </div>
            <div className="details-list__row">
              <dt>Built with</dt>
              <dd>React, React Router, Recharts, Django REST Framework</dd>
            </div>
            <div className="details-list__row">
              <dt>Storage</dt>
              <dd>Django backend (theme and currency stay in this browser)</dd>
            </div>
          </dl>
        </section>
      </div>

      {pendingAction === "clear" && (
        <ConfirmDialog
          title="Clear all data?"
          message={`This permanently deletes ${transactions.length} transactions and all budgets, and resets categories and settings. This cannot be undone.`}
          confirmLabel="Clear everything"
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {pendingAction === "sample" && (
        <ConfirmDialog
          title="Load sample data?"
          message="Your current transactions and budgets will be replaced with demo data."
          confirmLabel="Load sample data"
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </>
  );
}

export default Settings;
