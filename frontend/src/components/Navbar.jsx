import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar({ navItems, homePath, settingsPath, isCollapsed, toggleSidebar }) {
  if (isCollapsed) {
    return (
      <button className="collapsed-sidebar-btn" onClick={toggleSidebar} title="Expand Menu">
        HE
      </button>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to={homePath} className="sidebar-logo">
          <div className="logo-icon">HE</div>
          <span className="logo-text">HostelEase</span>
        </Link>
        <button className="sidebar-toggle" onClick={toggleSidebar} title="Collapse Menu">
          ←
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.label[0]}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to={settingsPath}
          className={({ isActive }) => `nav-link settings-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">⚙</span>
          <span className="nav-label">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Navbar;
