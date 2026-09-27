import { Link } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";

function NotFound() {
  return (
    <EmptyState
      icon="🧭"
      title="Page not found"
      message="The page you are looking for does not exist."
    >
      <Link to="/" className="btn btn--primary">
        Go to Dashboard
      </Link>
    </EmptyState>
  );
}

export default NotFound;
