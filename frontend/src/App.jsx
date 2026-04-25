import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Complaints from "./pages/Complaints";
import Payments from "./pages/Payments";

function ProtectedLayout({ isAuthenticated, username, onLogout }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout username={username} onLogout={onLogout} />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("Admin");

  useEffect(() => {
    const savedUser = window.localStorage.getItem("shm-auth-user");
    if (savedUser) {
      setIsAuthenticated(true);
      setUsername(savedUser);
    }
  }, []);

  const handleLogin = (nextUsername) => {
    setIsAuthenticated(true);
    setUsername(nextUsername);
    window.localStorage.setItem("shm-auth-user", nextUsername);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("Admin");
    window.localStorage.removeItem("shm-auth-user");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          element={
            <ProtectedLayout
              isAuthenticated={isAuthenticated}
              username={username}
              onLogout={handleLogout}
            />
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/payments" element={<Payments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
