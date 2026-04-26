import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import "./Layout.css";

function Layout({ session, onLogout, navItems, homePath, settingsPath }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`layout ${isCollapsed ? "collapsed" : ""}`}>
      <Navbar
        username={session.username}
        role={session.role}
        navItems={navItems}
        homePath={homePath}
        settingsPath={settingsPath}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <div className="layout-body">
        <main className="main-content">
          <Outlet context={{ session, onLogout }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;
