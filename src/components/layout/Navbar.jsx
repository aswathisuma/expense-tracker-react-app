import { useTheme } from "../../hooks/useTheme";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="brand-logo" aria-hidden="true">₹</span>
        <span>Expense Tracker</span>
      </div>

      <div className="navbar__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={toggleTheme}
          aria-label={`Switch to ${nextTheme} mode`}
          title={`Switch to ${nextTheme} mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
