import { Component } from "react";
import EmptyState from "./EmptyState";

// Catches errors thrown while rendering any child component and shows a
// friendly message instead of a blank white screen.
// Error boundaries must be class components: there is no hook version yet.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Something went wrong while rendering:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          icon="⚠️"
          title="Something went wrong"
          message="This page could not be displayed. Your saved data is safe."
        >
          <div className="button-row">
            <button type="button" className="btn btn--primary" onClick={this.handleRetry}>
              Try again
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </EmptyState>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
