import { useState } from "react";
import FormField from "../common/FormField";
import { PAYMENT_METHODS, SORT_OPTIONS, TRANSACTION_TYPE_LABELS } from "../../constants/transactions";
import {
  countActivePanelFilters,
  hasAnyFilterChanges,
  isDateRangeInvalid,
} from "../../utils/filterUtils";

// A controlled component: the filter values live in the parent page (so the
// page can filter the list), and FilterBar only reports changes upward.
function FilterBar({ filters, categories, onFilterChange, onReset, resultCount, totalCount }) {
  // Local UI state: only FilterBar cares whether the panel is open.
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const activePanelFilters = countActivePanelFilters(filters);
  const dateRangeInvalid = isDateRangeInvalid(filters);
  const sortedCategoryNames = categories.map((category) => category.name).sort();

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    onFilterChange(name, type === "checkbox" ? checked : value);
  }

  return (
    <section className="card filter-bar" aria-label="Search and filter transactions">
      <div className="filter-bar__top">
        <input
          type="search"
          name="search"
          className="form-control filter-bar__search"
          placeholder="Search description, category or payment method"
          aria-label="Search transactions"
          value={filters.search}
          onChange={handleChange}
        />
        <select
          name="sortBy"
          className="form-control filter-bar__sort"
          aria-label="Sort transactions"
          value={filters.sortBy}
          onChange={handleChange}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn--ghost"
          aria-expanded={isPanelOpen}
          aria-controls="transaction-filter-panel"
          onClick={() => setIsPanelOpen((isOpen) => !isOpen)}
        >
          Filters{activePanelFilters > 0 && ` (${activePanelFilters})`}
        </button>
      </div>

      {isPanelOpen && (
        <div id="transaction-filter-panel" className="filter-bar__panel">
          <FormField label="Type" htmlFor="filter-type">
            <select id="filter-type" name="type" className="form-control" value={filters.type} onChange={handleChange}>
              <option value="all">All types</option>
              {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Category" htmlFor="filter-category">
            <select
              id="filter-category"
              name="category"
              className="form-control"
              value={filters.category}
              onChange={handleChange}
            >
              <option value="all">All categories</option>
              {sortedCategoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Payment method" htmlFor="filter-payment">
            <select
              id="filter-payment"
              name="paymentMethod"
              className="form-control"
              value={filters.paymentMethod}
              onChange={handleChange}
            >
              <option value="all">All methods</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="From" htmlFor="filter-start-date">
            <input
              id="filter-start-date"
              type="date"
              name="startDate"
              className="form-control"
              value={filters.startDate}
              onChange={handleChange}
              disabled={filters.currentMonthOnly}
            />
          </FormField>

          <FormField
            label="To"
            htmlFor="filter-end-date"
            error={dateRangeInvalid ? "The end date is before the start date." : undefined}
          >
            <input
              id="filter-end-date"
              type="date"
              name="endDate"
              className="form-control"
              value={filters.endDate}
              onChange={handleChange}
              disabled={filters.currentMonthOnly}
              aria-invalid={dateRangeInvalid}
              aria-describedby={dateRangeInvalid ? "filter-end-date-error" : undefined}
            />
          </FormField>

          <label className="checkbox filter-bar__checkbox">
            <input
              type="checkbox"
              name="currentMonthOnly"
              checked={filters.currentMonthOnly}
              onChange={handleChange}
            />
            Current month only
          </label>
        </div>
      )}

      <div className="filter-bar__footer">
        <p className="text-muted" aria-live="polite">
          Showing {resultCount} of {totalCount} transactions
        </p>
        {hasAnyFilterChanges(filters) && (
          <button type="button" className="btn btn--link" onClick={onReset}>
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}

export default FilterBar;
