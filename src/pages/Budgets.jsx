import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Modal from "../components/common/Modal";
import BudgetCard from "../components/budgets/BudgetCard";
import BudgetForm from "../components/budgets/BudgetForm";
import BudgetAlerts from "../components/budgets/BudgetAlerts";
import { useExpenses } from "../hooks/useExpenses";
import { useCurrency } from "../hooks/useCurrency";
import { getBudgetStatus, getTotalExpenses, getTransactionsForMonth } from "../utils/calculations";
import {
  getBudgetAlerts,
  getCategoryBudgetRows,
  getTotalCategoryLimits,
} from "../utils/budgetUtils";
import { getCurrentMonthKey } from "../utils/dateUtils";
import { formatMonthLabel } from "../utils/formatters";

const MONTHLY_TARGET = "monthly";

function Budgets() {
  const { transactions, categories, budgets, setMonthlyBudget, setCategoryBudget } = useExpenses();
  const { formatCurrency } = useCurrency();
  const currentMonthKey = getCurrentMonthKey();

  // Which budget is being edited: null, "monthly", or a category id.
  const [editingTarget, setEditingTarget] = useState(null);

  const { monthlyStatus, categoryRows, alerts } = useMemo(() => {
    const monthTransactions = getTransactionsForMonth(transactions, currentMonthKey);
    const monthly = getBudgetStatus(budgets.monthlyLimit, getTotalExpenses(monthTransactions));
    const rows = getCategoryBudgetRows(categories, budgets, monthTransactions);

    return {
      monthlyStatus: monthly,
      categoryRows: rows,
      alerts: getBudgetAlerts([
        { id: MONTHLY_TARGET, name: "Monthly budget", budgetStatus: monthly },
        ...rows.map(({ category, budgetStatus }) => ({
          id: category.id,
          name: category.name,
          budgetStatus,
        })),
      ]),
    };
  }, [transactions, categories, budgets, currentMonthKey]);

  const totalCategoryLimits = getTotalCategoryLimits(budgets);
  const categoryLimitsExceedMonthly =
    budgets.monthlyLimit > 0 && totalCategoryLimits > budgets.monthlyLimit;

  const editingCategory =
    editingTarget && editingTarget !== MONTHLY_TARGET
      ? categories.find((category) => category.id === editingTarget)
      : null;
  const editingAmount =
    editingTarget === MONTHLY_TARGET
      ? budgets.monthlyLimit
      : (budgets.categoryLimits[editingTarget] ?? 0);

  function closeModal() {
    setEditingTarget(null);
  }

  function saveBudget(amount) {
    if (editingTarget === MONTHLY_TARGET) {
      setMonthlyBudget(amount);
    } else {
      setCategoryBudget(editingTarget, amount);
    }
    closeModal();
  }

  return (
    <>
      <PageHeader title="Budgets" subtitle={`Spending limits for ${formatMonthLabel(currentMonthKey)}`} />

      <BudgetAlerts alerts={alerts} />

      <section className="page-section">
        <BudgetCard
          title="Monthly Budget"
          budgetStatus={monthlyStatus}
          onEdit={() => setEditingTarget(MONTHLY_TARGET)}
          isHighlighted
        />
      </section>

      <section className="page-section">
        <h2 className="section-title">Category budgets</h2>
        {categoryLimitsExceedMonthly && (
          <p className="info-note">
            Your category budgets add up to {formatCurrency(totalCategoryLimits)}, which is more than
            your monthly budget of {formatCurrency(budgets.monthlyLimit)}.
          </p>
        )}
        <div className="card-grid">
          {categoryRows.map(({ category, budgetStatus }) => (
            <BudgetCard
              key={category.id}
              title={category.name}
              budgetStatus={budgetStatus}
              onEdit={() => setEditingTarget(category.id)}
            />
          ))}
        </div>
      </section>

      {editingTarget && (
        <Modal
          title={
            editingTarget === MONTHLY_TARGET
              ? "Monthly Budget"
              : `Budget for ${editingCategory?.name ?? "category"}`
          }
          onClose={closeModal}
        >
          <BudgetForm
            initialAmount={editingAmount}
            onSubmit={saveBudget}
            onRemove={() => saveBudget(0)}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </>
  );
}

export default Budgets;
