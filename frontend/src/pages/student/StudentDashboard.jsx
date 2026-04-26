import { useMemo } from "react";
import Card from "../../components/Card";
import useStudentData from "../../hooks/useStudentData";
import {
  formatCurrency,
  getCurrentBooking,
  getRecommendedRoom,
  getStudentAlerts,
} from "../../utils/dashboardInsights";

function StudentDashboard() {
  const { data, loading, error } = useStudentData();

  const model = useMemo(() => {
    const student = data.profile;
    const bookings = data.bookings || [];
    const complaints = data.complaints || [];
    const payments = data.payments || [];
    const recommendation = getRecommendedRoom({
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
      recommendedRoom: recommendation,
    });

    return {
      student,
      bookings,
      complaints,
      payments,
      recommendation,
      alerts,
      currentBooking: getCurrentBooking(bookings),
    };
  }, [data]);

  if (loading) {
    return <p className="loading">Loading student dashboard...</p>;
  }

  const totalPaid = model.payments
    .filter((payment) => payment.payment_status === "SUCCESS")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const estimatedFee = 18000;
  const dueAmount = Math.max(estimatedFee - totalPaid, 0);
  const predictiveComplaintNote = model.complaints.some((item) => item.priority === "HIGH")
    ? "High priority due to repeated or utility-related complaints."
    : "Most of your complaints are expected to resolve in the normal support window.";

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Student Dashboard</p>
          <h1 className="page-title">Personalized hostel view</h1>
          <p className="page-description">
            This dashboard summarizes your profile, room, booking requests, payments,
            complaints, mess access, and outing alerts.
          </p>
        </div>
        <div className="dashboard-pill">
          <span>Booking status</span>
          <strong>{model.student?.booking_status || "NONE"}</strong>
        </div>
      </section>

      {error ? <div className="message message-error">{error}</div> : null}

      <div className="stats-grid">
        <Card title="My Room" value={model.currentBooking?.room_no || "--"} subtitle={model.currentBooking?.hostel_name || "Not allocated"} color="primary" />
        <Card title="Complaints" value={model.complaints.length} subtitle="Complaint history" color="danger" />
        <Card title="Payments" value={formatCurrency(totalPaid)} subtitle={`${formatCurrency(dueAmount)} due`} color="info" />
        <Card title="Outing" value="1" subtitle="Demo request slot available" color="warning" />
      </div>

      <section className="dashboard-grid dashboard-grid-wide">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Profile & identity</h2>
          </div>
          <div className="detail-grid">
            <div><span>Name</span><strong>{model.student?.full_name || "Student"}</strong></div>
            <div><span>Register No</span><strong>{model.student?.register_no || "Not available"}</strong></div>
            <div><span>College</span><strong>{model.student?.college_name || "Not available"}</strong></div>
            <div><span>Emergency Contact</span><strong>Parent / +91 98765 43210</strong></div>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Smart room recommendation</h2>
          </div>
          {model.recommendation ? (
            <div className="list-stack">
              <div className="list-row">
                Recommended room: {model.recommendation.room_no} in {model.recommendation.hostel_name}
              </div>
              {model.recommendation.reasons.map((reason) => (
                <div key={reason} className="list-row">{reason}</div>
              ))}
            </div>
          ) : (
            <div className="table-empty">No recommendation available right now.</div>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Complaint prediction</h2>
          </div>
          <div className="list-stack">
            <div className="list-row">{predictiveComplaintNote}</div>
            <div className="list-row">
              {model.complaints.some((item) => item.complaint_status !== "ASSIGNED")
                ? "This issue may take longer to resolve because it is still awaiting assignment."
                : "Assigned issues are already routed to staff."}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Personalized alerts</h2>
          </div>
          <div className="list-stack">
            {model.alerts.map((alert) => (
              <div key={alert} className="list-row">{alert}</div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Supervisor & contacts</h2>
          </div>
          <div className="list-stack">
            <div className="list-row">Warden: Resident Warden / +91 90000 22222</div>
            <div className="list-row">Maintenance: Support Desk / +91 90000 33333</div>
            <div className="list-row">Emergency: Hostel Help Line / 112</div>
          </div>
        </section>
      </section>
    </div>
  );
}

export default StudentDashboard;
