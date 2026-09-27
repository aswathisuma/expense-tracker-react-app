import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../constants/navItems";

function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <ul className="mobile-nav__list">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink to={item.path} end={item.path === "/"} className="mobile-nav__link">
              <span aria-hidden="true">{item.icon}</span>
              <span className="mobile-nav__label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default MobileNav;
