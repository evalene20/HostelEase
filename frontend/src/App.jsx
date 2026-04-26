import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Staff from "./pages/admin/Staff";
import StudentDashboard from "./pages/student/StudentDashboard";
import Profile from "./pages/student/Profile";
import MyRoom from "./pages/student/MyRoom";
import BookRoom from "./pages/student/BookRoom";
import StudentComplaints from "./pages/student/StudentComplaints";
import StudentPayments from "./pages/student/StudentPayments";
import Mess from "./pages/student/Mess";
import Outing from "./pages/student/Outing";
import Students from "./pages/Students";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Complaints from "./pages/Complaints";
import Payments from "./pages/Payments";

const adminNavItems = [
  { path: "/admin/dashboard", label: "Dashboard" },
  { path: "/admin/rooms", label: "Rooms" },
  { path: "/admin/bookings", label: "Bookings" },
  { path: "/admin/complaints", label: "Complaints" },
  { path: "/admin/payments", label: "Payments" },
  { path: "/admin/staff", label: "Staff" },
];

const studentNavItems = [
  { path: "/student/dashboard", label: "Dashboard" },
  { path: "/student/room", label: "My Room" },
  { path: "/student/book-room", label: "Book Room" },
  { path: "/student/complaints", label: "Complaints" },
  { path: "/student/payments", label: "Payments" },
  { path: "/student/mess", label: "Mess" },
  { path: "/student/outing", label: "Outing" },
];

function getDefaultPath(session) {
  if (!session?.isAuthenticated) {
    return "/login";
  }

  return session.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
}

function ProtectedLayout({ session, role, onLogout }) {
  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (session.role !== role) {
    return <Navigate to={getDefaultPath(session)} replace />;
  }

  return (
    <Layout
      session={session}
      onLogout={onLogout}
      navItems={role === "admin" ? adminNavItems : studentNavItems}
      homePath={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
      settingsPath={role === "admin" ? "/admin/settings" : "/student/settings"}
    />
  );
}

function App() {
  const [session, setSession] = useState({
    isAuthenticated: false,
    role: "admin",
    username: "Admin",
    studentId: 1,
  });

  useEffect(() => {
    const stored = window.localStorage.getItem("shm-session");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem("shm-session");
      }
    }
  }, []);

  const handleLogin = (nextSession) => {
    const sessionValue = { ...nextSession, isAuthenticated: true };
    setSession(sessionValue);
    window.localStorage.setItem("shm-session", JSON.stringify(sessionValue));
  };

  const handleLogout = () => {
    const resetSession = {
      isAuthenticated: false,
      role: "admin",
      username: "Admin",
      studentId: 1,
    };
    setSession(resetSession);
    window.localStorage.removeItem("shm-session");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultPath(session)} replace />} />
        <Route
          path="/login"
          element={
            session.isAuthenticated ? (
              <Navigate to={getDefaultPath(session)} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route element={<ProtectedLayout session={session} role="admin" onLogout={handleLogout} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/rooms" element={<Rooms />} />
          <Route path="/admin/bookings" element={<Bookings />} />
          <Route path="/admin/complaints" element={<Complaints />} />
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/staff" element={<Staff />} />
          <Route path="/admin/settings" element={<Profile />} />
        </Route>

        <Route element={<ProtectedLayout session={session} role="student" onLogout={handleLogout} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/room" element={<MyRoom />} />
          <Route path="/student/book-room" element={<BookRoom />} />
          <Route path="/student/complaints" element={<StudentComplaints />} />
          <Route path="/student/payments" element={<StudentPayments />} />
          <Route path="/student/mess" element={<Mess />} />
          <Route path="/student/outing" element={<Outing />} />
          <Route path="/student/settings" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
