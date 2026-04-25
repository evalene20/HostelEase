import { Link } from "react-router-dom";

const adminSections = [
  { title: "Dashboard", description: "Analytics, alerts, and smart operational insights.", to: "/admin/dashboard" },
  { title: "Students", description: "Manage student records, history, and room assignments.", to: "/admin/students" },
  { title: "Rooms", description: "Track capacity, occupancy, and overcrowding risk.", to: "/admin/rooms" },
  { title: "Bookings", description: "Review requests and apply approval suggestions.", to: "/admin/bookings" },
  { title: "Complaints", description: "Prioritize issues and assign support staff.", to: "/admin/complaints" },
  { title: "Payments", description: "Watch revenue, dues, and payment failures.", to: "/admin/payments" },
  { title: "Staff", description: "Manage wardens, supervisors, and maintenance staff.", to: "/admin/staff" },
];

function AdminHome() {
  return (
    <div className="page-shell">
      <section className="home-hero">
        <div className="home-copy">
          <p className="eyebrow">Admin Control Center</p>
          <h1 className="hero-title">Run the hostel from one operational home.</h1>
          <p className="hero-description">
            Monitor occupancy, bookings, complaints, revenue, staff assignments,
            mess operations, and risk signals from a single admin workspace.
          </p>
          <div className="hero-actions">
            <Link to="/admin/dashboard" className="btn btn-primary">
              Open Admin Dashboard
            </Link>
          </div>
        </div>

        <div className="home-highlight">
          <div className="highlight-card">
            <span className="highlight-label">Admin novelty layer</span>
            <strong>Rules, alerts, and recommendations built into the workflow</strong>
            <p>
              Spot overcrowding, repeated complaints, payment risk, and likely booking
              approvals without leaving the dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Admin sections</h2>
            <p className="section-description">
              Kept minimal because the top navbar already gives direct access to every admin section.
            </p>
          </div>
        </div>
        <div className="chip-grid">
          {adminSections.map((section) => (
            <Link key={section.title} to={section.to} className="minimal-link">
              {section.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminHome;
