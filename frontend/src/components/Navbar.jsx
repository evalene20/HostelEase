import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const navItems = [
  { path: "/home", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/students", label: "Students" },
  { path: "/rooms", label: "Rooms" },
  { path: "/bookings", label: "Bookings" },
  { path: "/complaints", label: "Complaints" },
  { path: "/payments", label: "Payments" },
];

function Navbar({ username, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link to="/home" className="navbar-logo">
          <span className="logo-icon">SH</span>
          <span className="logo-text">Smart Hostel</span>
        </Link>

        <nav className="top-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `top-nav-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <span className="navbar-user">{username || "Admin"}</span>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
