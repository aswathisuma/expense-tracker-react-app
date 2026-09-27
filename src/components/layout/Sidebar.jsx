import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../constants/navItems";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="brand-logo" aria-hidden="true">₹</span>
        <span>Expense Tracker</span>
      </div>

      <nav aria-label="Main navigation">
        <ul className="sidebar__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              {/* "end" stops "/" from matching every route */}
              <NavLink to={item.path} end={item.path === "/"} className="nav-link">
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
