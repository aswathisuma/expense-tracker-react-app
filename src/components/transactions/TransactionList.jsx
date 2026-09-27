import TransactionItem from "./TransactionItem";

function TransactionList({ transactions, onView, onEdit, onDelete }) {
  return (
    <ul className="transaction-list">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default TransactionList;
