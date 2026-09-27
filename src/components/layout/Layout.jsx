import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import ErrorBoundary from "../common/ErrorBoundary";
import Loader from "../common/Loader";
import { NAV_ITEMS } from "../../constants/navItems";
import { APP_NAME } from "../../constants/app";

function Layout() {
  const { pathname } = useLocation();
  const currentPage = NAV_ITEMS.find((item) => item.path === pathname);

  // Keep the browser tab title in sync with the page, e.g. "Budgets · Expense Tracker".
  useEffect(() => {
    document.title = currentPage ? `${currentPage.label} · ${APP_NAME}` : APP_NAME;
  }, [currentPage]);

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
          <ErrorBoundary key={pathname}>
            {/* Pages are lazy-loaded; Suspense shows the Loader while one downloads */}
            <Suspense fallback={<Loader message="Loading page…" />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default Layout;
