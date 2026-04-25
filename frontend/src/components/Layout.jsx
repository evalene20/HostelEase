import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import "./Layout.css";

function Layout({ session, onLogout, navItems, homePath }) {
  return (
    <div className="layout">
      <Navbar
        username={session.username}
        role={session.role}
        navItems={navItems}
        homePath={homePath}
        onLogout={onLogout}
      />
      <div className="layout-body">
        <main className="main-content">
          <Outlet context={{ session }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;
