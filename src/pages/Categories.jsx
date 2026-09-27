import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Modal from "../components/common/Modal";
import CategoryCard from "../components/categories/CategoryCard";
import CategoryForm from "../components/categories/CategoryForm";
import DeleteCategoryDialog from "../components/categories/DeleteCategoryDialog";
import { useExpenses } from "../hooks/useExpenses";
import { CATEGORY_TYPES, CATEGORY_TYPE_LABELS } from "../constants/categories";
import {
  getCategoryUsage,
  getCategoryUsageMap,
  getReplacementCategories,
} from "../utils/categoryUtils";

function Categories() {
  const { transactions, categories, addCategory, updateCategory, deleteCategory } = useExpenses();

  // null | { mode: "add" } | { mode: "edit" | "delete", categoryId }
  const [activeModal, setActiveModal] = useState(null);

  // How many transactions use each category, computed once per data change.
  const usageByName = useMemo(() => getCategoryUsageMap(transactions), [transactions]);

  const selectedCategory = activeModal?.categoryId
    ? categories.find((category) => category.id === activeModal.categoryId)
    : null;
  const selectedUsage = selectedCategory ? getCategoryUsage(usageByName, selectedCategory.name) : null;
  const canDeleteCategories = categories.length > 1;

  function openModal(mode, categoryId) {
    setActiveModal({ mode, categoryId });
  }

  function closeModal() {
    setActiveModal(null);
  }

  function handleAdd(values) {
    addCategory(values);
    closeModal();
  }

  function handleUpdate(values) {
    updateCategory(selectedCategory.id, values);
    closeModal();
  }

  function handleDelete(replacementName) {
    deleteCategory(selectedCategory.id, replacementName);
    closeModal();
  }

  // Group the cards by type: Expense, Income, then Income & Expense.
  const groups = CATEGORY_TYPES.map((type) => ({
    type,
    items: categories.filter((category) => category.type === type),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <PageHeader title="Categories" subtitle={`${categories.length} categories`}>
        <button type="button" className="btn btn--primary" onClick={() => openModal("add")}>
          + Add Category
        </button>
      </PageHeader>

      {groups.map((group) => (
        <section key={group.type} className="page-section">
          <h2 className="section-title">{CATEGORY_TYPE_LABELS[group.type]}</h2>
          <div className="card-grid">
            {group.items.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                usage={getCategoryUsage(usageByName, category.name)}
                canDelete={canDeleteCategories}
                onEdit={(id) => openModal("edit", id)}
                onDelete={(id) => openModal("delete", id)}
              />
            ))}
          </div>
        </section>
      ))}

      {activeModal?.mode === "add" && (
        <Modal title="Add Category" onClose={closeModal}>
          <CategoryForm
            categories={categories}
            usage={getCategoryUsage(usageByName, "")}
            onSubmit={handleAdd}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {activeModal?.mode === "edit" && selectedCategory && (
        <Modal title="Edit Category" onClose={closeModal}>
          <CategoryForm
            category={selectedCategory}
            categories={categories}
            usage={selectedUsage}
            onSubmit={handleUpdate}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {activeModal?.mode === "delete" && selectedCategory && (
        <DeleteCategoryDialog
          category={selectedCategory}
          usage={selectedUsage}
          replacementOptions={getReplacementCategories(categories, selectedCategory, selectedUsage)}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </>
  );
}

export default Categories;
