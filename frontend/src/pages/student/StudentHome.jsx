import { Link } from "react-router-dom";
import useStudentData from "../../hooks/useStudentData";
import {
  getCurrentBooking,
  getRecommendedRoom,
  getStudentAlerts,
} from "../../utils/dashboardInsights";

const sectionLinks = [
  { title: "Profile", to: "/student/profile" },
  { title: "My Room", to: "/student/room" },
  { title: "Book Room", to: "/student/book-room" },
  { title: "Complaints", to: "/student/complaints" },
  { title: "Payments", to: "/student/payments" },
  { title: "Mess", to: "/student/mess" },
  { title: "Outing", to: "/student/outing" },
];

function StudentHome() {
  const { data, loading, error } = useStudentData();

  if (loading) {
    return <p className="loading">Loading student home...</p>;
  }

  const student = data.profile;
  const bookings = data.bookings || [];
  const complaints = data.complaints || [];
  const payments = data.payments || [];
  const currentBooking = getCurrentBooking(bookings);
  const recommendedRoom = getRecommendedRoom({
    student,
    rooms: [],
    bookings,
    complaints,
    students: [],
  });
  const alerts = getStudentAlerts({
    student,
    bookings,
    complaints,
    payments,
    recommendedRoom,
  });

  return (
    <div className="page-shell">
      <section className="home-hero">
        <div className="home-copy">
          <p className="eyebrow">Student Home</p>
          <h1 className="hero-title">Everything a resident needs in one place.</h1>
          <p className="hero-description">
            Welcome {student?.full_name || "Student"}. Check room updates,
            complaint status, payments, mess details, and outing approvals from here.
          </p>
          <div className="hero-actions">
            <Link to="/student/dashboard" className="btn btn-primary">
              Open Student Dashboard
            </Link>
          </div>
        </div>

        <div className="home-highlight">
          <div className="highlight-card">
            <span className="highlight-label">Current room</span>
            <strong>
              {currentBooking ? `${currentBooking.hostel_name} / ${currentBooking.room_no}` : "No approved room yet"}
            </strong>
            <p>
              {recommendedRoom
                ? `Recommended next option: ${recommendedRoom.room_no} because of ${recommendedRoom.reasons.join(", ")}.`
                : "A room recommendation will appear once room data is available."}
            </p>
          </div>
        </div>
      </section>

      {error ? <div className="message message-error">{error}</div> : null}

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Personalized dashboard alerts</h2>
            <p className="section-description">
              These alerts are generated from your room, booking, complaint, and payment activity.
            </p>
          </div>
        </div>
        <div className="list-stack">
          {alerts.map((alert) => (
            <div key={alert} className="list-row">{alert}</div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Student sections</h2>
            <p className="section-description">Kept compact because the top navbar already covers the full student flow.</p>
          </div>
        </div>
        <div className="chip-grid">
          {sectionLinks.map((section) => (
            <Link key={section.title} to={section.to} className="minimal-link">
              {section.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentHome;
