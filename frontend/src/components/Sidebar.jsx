import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navItems = [
    { path: "/", label: "Home", icon: "H" },
    { path: "/dashboard", label: "Dashboard", icon: "D" },
    { path: "/students", label: "Students", icon: "S" },
    { path: "/rooms", label: "Rooms", icon: "R" },
    { path: "/bookings", label: "Bookings", icon: "B" },
    { path: "/complaints", label: "Complaints", icon: "C" },
    { path: "/payments", label: "Payments", icon: "P" },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
