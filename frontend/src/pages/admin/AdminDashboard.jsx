import { useMemo } from "react";
import Card from "../../components/Card";
import useHostelData from "../../hooks/useHostelData";
import { formatCurrency, getAdminInsights, getAdminMetrics } from "../../utils/dashboardInsights";

function InsightList({ title, items, emptyMessage = "No alerts right now." }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="list-stack">
        {items.length ? (
          items.map((item) => (
            <div key={item} className="list-row">
              {item}
            </div>
          ))
        ) : (
          <div className="table-empty">{emptyMessage}</div>
        )}
      </div>
    </section>
  );
}

function AdminDashboard() {
  const { data, loading, error } = useHostelData();

  const metrics = useMemo(() => getAdminMetrics(data), [data]);
  const insights = useMemo(() => getAdminInsights(data), [data]);

  if (loading) {
    return <p className="loading">Loading admin dashboard...</p>;
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
    .slice(0, 3)
    .map((booking) => {
      const room = data.rooms.find((candidate) => Number(candidate.room_id) === Number(booking.room_id));
      return room?.occupancy_status === "FULL"
        ? `Reject suggestion: ${booking.full_name}'s request for ${booking.room_no} because the room is full.`
        : `Approve suggestion: ${booking.full_name}'s request for ${booking.room_no} because capacity is still available.`;
    });

  const predictiveMaintenance = insights.nearFullRooms.slice(0, 4).map((room) => {
    return `${room.room_no} (${room.hostel_name}) should be monitored for overcrowding risk.`;
  });

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1 className="page-title">Operational analytics and intelligent alerts</h1>
          <p className="page-description">
            This dashboard combines room occupancy, complaint hotspots, payment
            health, and decision support for approvals and maintenance.
          </p>
        </div>
        <div className="dashboard-pill">
          <span>Occupancy</span>
          <strong>{metrics.occupancyRate}%</strong>
        </div>
      </section>

      {error ? <div className="message message-error">{error}</div> : null}

      <div className="stats-grid">
        <Card title="Students" value={metrics.totalStudents} subtitle="Active student records" color="primary" />
        <Card title="Rooms" value={metrics.totalRooms} subtitle={`${metrics.availableBeds} beds available`} color="success" />
        <Card title="Complaints" value={metrics.totalComplaints} subtitle="Issues under monitoring" color="danger" />
        <Card title="Revenue" value={formatCurrency(metrics.totalRevenue)} subtitle="Successful collections" color="info" />
      </div>

      <section className="dashboard-grid dashboard-grid-wide">
        <InsightList title="Smart Alerts" items={smartAlerts} />
        <InsightList title="Booking Recommendations" items={bookingSuggestions} emptyMessage="No pending booking requests right now." />
        <InsightList title="Predictive Maintenance" items={predictiveMaintenance} emptyMessage="No room is close to overcrowding right now." />
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">High-risk students</h2>
            <p className="section-description">
              Repeated complaints or payment issues are surfaced here for admin review.
            </p>
          </div>
        </div>
        <div className="chip-grid">
          {insights.highRiskStudents.length ? (
            insights.highRiskStudents.map((student) => (
              <span key={student.student_id} className="info-chip">
                {student.full_name}
              </span>
            ))
          ) : (
            <div className="table-empty">No high-risk student patterns detected.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
