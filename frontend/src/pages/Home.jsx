import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Create booking",
    description: "Reserve a room for a student and capture the booking date.",
    to: "/bookings?action=new",
  },
  {
    title: "Register student",
    description: "Add a student profile before assigning rooms or taking payments.",
    to: "/students?action=new",
  },
  {
    title: "Log complaint",
    description: "Record hostel issues quickly so staff can respond faster.",
    to: "/complaints?action=new",
  },
  {
    title: "Record payment",
    description: "Add a payment entry and track its settlement status.",
    to: "/payments?action=new",
  },
];

function Home() {
  return (
    <div className="page-shell">
      <section className="home-hero">
        <div className="home-copy">
          <p className="eyebrow">Smart Hostel Management</p>
          <h1 className="hero-title">A cleaner home page for daily hostel operations.</h1>
          <p className="hero-description">
            Use this space as the starting point for bookings, student onboarding,
            complaints, payments, and room planning.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-primary">
              View Dashboard
            </Link>
            <Link to="/bookings?action=new" className="btn btn-secondary">
              New Booking
            </Link>
          </div>
        </div>

        <div className="home-highlight">
          <div className="highlight-card">
            <span className="highlight-label">Today&apos;s focus</span>
            <strong>Move from quick links to guided actions</strong>
            <p>
              Every major action now opens the right page in create mode so staff can
              start entering details immediately.
            </p>
          </div>
          <div className="highlight-grid">
            <div className="mini-stat">
              <span>Students</span>
              <strong>Profiles & onboarding</strong>
            </div>
            <div className="mini-stat">
              <span>Bookings</span>
              <strong>Room allocation flow</strong>
            </div>
            <div className="mini-stat">
              <span>Payments</span>
              <strong>Collection tracking</strong>
            </div>
            <div className="mini-stat">
              <span>Complaints</span>
              <strong>Issue reporting</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="home-actions card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Start a task</h2>
            <p className="section-description">
              Pick an action and the page opens ready for data entry.
            </p>
          </div>
        </div>

        <div className="action-grid">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.to} className="action-tile">
              <span className="action-kicker">Open page</span>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
