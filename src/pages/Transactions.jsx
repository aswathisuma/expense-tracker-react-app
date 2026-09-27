import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import FilterBar from "../components/transactions/FilterBar";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import TransactionDetails from "../components/transactions/TransactionDetails";
import { useExpenses } from "../hooks/useExpenses";
import { useCurrency } from "../hooks/useCurrency";
import { sortTransactions } from "../utils/transactionUtils";
import { DEFAULT_FILTERS, filterTransactions } from "../utils/filterUtils";
import { getCurrentMonthKey } from "../utils/dateUtils";

function Transactions() {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } =
    useExpenses();
  const { formatCurrency } = useCurrency();

  // Which modal is open:
  //   null                                   -> no modal
  //   { mode: "add" }                        -> add form
  //   { mode: "view" | "edit" | "delete", transactionId }
  const [activeModal, setActiveModal] = useState(null);

  // Filter state lives here (not in FilterBar) because this page uses it to
  // decide which transactions to show.
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const currentMonthKey = getCurrentMonthKey();

  // Derived list: filter first, then sort. Recalculated only when the data or
  // the filters change, not when a modal opens.
  const visibleTransactions = useMemo(
    () => sortTransactions(filterTransactions(transactions, filters, currentMonthKey), filters.sortBy),
    [transactions, filters, currentMonthKey]
  );

  // Store only the id in state, then look the transaction up. That way the
  // modal always shows the latest data (single source of truth).
  const selectedTransaction = activeModal?.transactionId
    ? transactions.find((transaction) => transaction.id === activeModal.transactionId)
    : null;

  function openModal(mode, transactionId) {
    setActiveModal({ mode, transactionId });
  }

  function closeModal() {
    setActiveModal(null);
  }

  function handleFilterChange(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function handleAdd(formValues) {
    addTransaction(formValues);
    closeModal();
  }

  function handleUpdate(formValues) {
    updateTransaction(selectedTransaction.id, formValues);
    closeModal();
  }

  function handleDelete() {
    deleteTransaction(selectedTransaction.id);
    closeModal();
  }

  const transactionCountText =
    transactions.length === 1 ? "1 transaction" : `${transactions.length} transactions`;

  function renderContent() {
    if (transactions.length === 0) {
      return (
        <EmptyState
          icon="💳"
          title="No transactions yet"
          message="Add your first income or expense to start tracking."
        >
          <button type="button" className="btn btn--primary" onClick={() => openModal("add")}>
            + Add Transaction
          </button>
        </EmptyState>
      );
    }

    return (
      <>
        <FilterBar
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          resultCount={visibleTransactions.length}
          totalCount={transactions.length}
        />

        {visibleTransactions.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No matching transactions"
            message="Try a different search, or clear the filters."
          >
            <button type="button" className="btn btn--ghost" onClick={resetFilters}>
              Clear filters
            </button>
          </EmptyState>
        ) : (
          <TransactionList
            transactions={visibleTransactions}
            onView={(id) => openModal("view", id)}
            onEdit={(id) => openModal("edit", id)}
            onDelete={(id) => openModal("delete", id)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title="Transactions" subtitle={transactionCountText}>
        <button type="button" className="btn btn--primary" onClick={() => openModal("add")}>
          + Add Transaction
        </button>
      </PageHeader>

      {renderContent()}

      {activeModal?.mode === "add" && (
        <Modal title="Add Transaction" onClose={closeModal}>
          <TransactionForm categories={categories} onSubmit={handleAdd} onCancel={closeModal} />
        </Modal>
      )}

      {activeModal?.mode === "edit" && selectedTransaction && (
        <Modal title="Edit Transaction" onClose={closeModal}>
          <TransactionForm
            transaction={selectedTransaction}
            categories={categories}
            onSubmit={handleUpdate}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {activeModal?.mode === "view" && selectedTransaction && (
        <Modal title="Transaction Details" onClose={closeModal}>
          <TransactionDetails
            transaction={selectedTransaction}
            onEdit={() => openModal("edit", selectedTransaction.id)}
            onDelete={() => openModal("delete", selectedTransaction.id)}
          />
        </Modal>
      )}

      {activeModal?.mode === "delete" && selectedTransaction && (
        <ConfirmDialog
          title="Delete transaction?"
          message={`"${selectedTransaction.description || selectedTransaction.category}" (${formatCurrency(
            selectedTransaction.amount
          )}) will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </>
  );
}

export default Transactions;
