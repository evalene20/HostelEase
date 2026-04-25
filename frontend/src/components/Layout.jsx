import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import "./Layout.css";

function Layout({ username, onLogout }) {
  return (
    <div className="layout">
      <Navbar username={username} onLogout={onLogout} />
      <div className="layout-body">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
