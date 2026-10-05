import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import EmptyState from "../common/EmptyState";
import ErrorBoundary from "../common/ErrorBoundary";
import Loader from "../common/Loader";
import { useExpenses } from "../../hooks/useExpenses";
import { NAV_ITEMS } from "../../constants/navItems";
import { APP_NAME, DATA_STATUS } from "../../constants/app";

function Layout() {
  const { pathname } = useLocation();
  const { status, errorMessage, dismissError } = useExpenses();
  const currentPage = NAV_ITEMS.find((item) => item.path === pathname);

  // Keep the browser tab title in sync with the page, e.g. "Budgets · Expense Tracker".
  useEffect(() => {
    document.title = currentPage ? `${currentPage.label} · ${APP_NAME}` : APP_NAME;
  }, [currentPage]);

  // Pages need the data from the backend, so they render only once it has loaded.
  function renderPage() {
    if (status === DATA_STATUS.LOADING) {
      return <Loader message="Loading your data…" />;
    }

    if (status === DATA_STATUS.ERROR) {
      return (
        <EmptyState icon="⚠️" title="Could not load your data" message={errorMessage}>
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Try again
          </button>
        </EmptyState>
      );
    }

    return (
      <>
        {errorMessage && (
          <div className="alert alert--exceeded sync-error" role="alert">
            <span className="alert__icon" aria-hidden="true">
              ✕
            </span>
            <span>
              <strong>Your last change was not saved.</strong> {errorMessage}
            </span>
            <button type="button" className="btn btn--ghost btn--small" onClick={dismissError}>
              Dismiss
            </button>
          </div>
        )}
        {/* Pages are lazy-loaded; Suspense shows the Loader while one downloads */}
        <Suspense fallback={<Loader message="Loading page…" />}>
          <Outlet />
        </Suspense>
      </>
    );
  }

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main id="main-content" className="page-content" tabIndex={-1}>
          {/* key={pathname}: moving to another page resets a crashed boundary */}
          <ErrorBoundary key={pathname}>{renderPage()}</ErrorBoundary>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default Layout;
