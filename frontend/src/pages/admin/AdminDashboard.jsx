import { useMemo, useState } from "react";
import Card from "../../components/Card";
import useHostelData from "../../hooks/useHostelData";
import { formatCurrency, getAdminInsights, getAdminMetrics } from "../../utils/dashboardInsights";
import { fetchCollection } from "../../services/authApi";

function InsightList({ title, items, emptyMessage = "No alerts right now." }) {
  return (
    <section className="card">
      <h3 style={{ marginBottom: "24px", fontSize: "1.1rem" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.length ? (
          items.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "16px",
                background: "#f8fafc",
                borderRadius: "8px",
                borderLeft: "4px solid #4f46e5",
                fontSize: "0.95rem",
              }}
            >
              {item}
            </div>
          ))
        ) : (
          <div style={{ color: "#94a3b8", padding: "20px", textAlign: "center" }}>
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}

function AdminDashboard() {
  const { data, loading, error } = useHostelData();
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const metrics = useMemo(() => getAdminMetrics(data), [data]);
  const insights = useMemo(() => getAdminInsights(data), [data]);

  const handleTotalStudentsClick = async () => {
    setStudentsLoading(true);
    try {
      const data = await fetchCollection("/students");
      setStudents(data);
      setShowStudents(true);
    } catch (err) {
      console.error(err);
    } finally {
      setStudentsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p className="loading">Loading intelligent insights...</p>
      </div>
    );
  }

  const smartAlerts = [
    insights.topComplaintHostel[0]
      ? `${insights.topComplaintHostel[0]} has the highest complaints (${insights.topComplaintHostel[1]}).`
      : null,
    insights.nearFullRooms[0]
      ? `${insights.nearFullRooms[0].room_no} in ${insights.nearFullRooms[0].hostel_name} is nearing full capacity.`
      : null,
    insights.highRiskStudents[0]
      ? `${insights.highRiskStudents.length} student record(s) need risk review for complaints or payments.`
      : null,
  ].filter(Boolean);

  const bookingSuggestions = data.bookings
    .filter((booking) => booking.status === "REQUESTED")
    .map(
      (booking) =>
        `${booking.ai_booking_decision}: ${booking.full_name}'s request for ${booking.room_no}. ${booking.ai_booking_reason}`
    );

  return (
    <div className="page-container" style={{ paddingBottom: "100px" }}>
      <header
        className="section-header"
        style={{ marginBottom: "48px", flexDirection: "column", alignItems: "flex-start" }}
      >
        <h1 style={{ marginBottom: "8px" }}>Admin Overview</h1>
        <p style={{ fontSize: "1.1rem", maxWidth: "800px" }}>
          Operational analytics and intelligent alerts. Monitor room occupancy, complaint hotspots, and payment
          health in real-time.
        </p>
      </header>

      {error ? (
        <div
          className="badge badge-danger"
          style={{ marginBottom: "24px", display: "block", textAlign: "center", padding: "12px" }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        <div onClick={handleTotalStudentsClick} style={{ cursor: 'pointer' }}>
          <Card title="Total Students" value={metrics.totalStudents} subtitle="Active enrollments" color="primary" />
        </div>
        <Card title="Available Beds" value={metrics.availableBeds} subtitle={`Across ${metrics.totalRooms} rooms`} color="success" />
        <Card title="Open Issues" value={metrics.totalComplaints} subtitle="Awaiting resolution" color="danger" />
        <Card title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} subtitle="Current semester" color="info" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "32px",
          marginBottom: "48px",
        }}
      >
        <InsightList title="Smart Alerts" items={smartAlerts} />
        <InsightList title="AI Booking Recommendations" items={bookingSuggestions} emptyMessage="No pending requests." />
      </div>

      <section className="card">
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>Behavioral Risk Monitoring</h2>
          <p style={{ color: "#64748b" }}>Surfacing students with repeated complaints or payment issues.</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {insights.highRiskStudents.length ? (
            insights.highRiskStudents.map((student) => (
              <div
                key={student.student_id}
                className="badge badge-warning"
                style={{ padding: "8px 16px", fontSize: "0.9rem" }}
              >
                {student.full_name}
              </div>
            ))
          ) : (
            <p style={{ color: "#94a3b8" }}>All students are within normal behavioral parameters.</p>
          )}
        </div>
      </section>

      {/* Students List Modal */}
      {showStudents && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowStudents(false)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              minWidth: "500px",
              maxWidth: "700px",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>Student List</h3>
              <button onClick={() => setShowStudents(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>
                ×
              </button>
            </div>
            {studentsLoading ? (
              <p>Loading...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>student_id</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>full_name</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>college_name</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.student_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px" }}>{s.student_id}</td>
                      <td style={{ padding: "8px" }}>{s.full_name}</td>
                      <td style={{ padding: "8px" }}>{s.college_name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
