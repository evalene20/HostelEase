import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { fetchCollection, getErrorMessage, getProfile } from "../services/authApi";

function ChartCard({ title, subtitle, items, formatter = (value) => value }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="card chart-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">{title}</h2>
          <p className="section-description">{subtitle}</p>
        </div>
      </div>
      <div className="chart-stack">
        {items.map((item) => (
          <div key={item.label} className="chart-row">
            <div className="chart-meta">
              <span>{item.label}</span>
              <strong>{formatter(item.value)}</strong>
            </div>
            <div className="chart-bar-track">
              <div
                className="chart-bar-fill"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Dashboard() {
  const [data, setData] = useState({
    profile: null,
    bookings: [],
    complaints: [],
    payments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const profileRes = await getProfile();

        const [bookings, complaints, payments] = await Promise.all([
          fetchCollection("/bookings"),
          fetchCollection("/complaints"),
          fetchCollection("/payments"),
        ]);

        if (!isMounted) return;

        setData({
          profile: profileRes.data || profileRes,
          bookings,
          complaints,
          payments,
        });

        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err, "Unable to load the dashboard."));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const profile = data.profile || {};

    return {
      students: 1, // always 1 for student
      rooms: profile.room_no ? 1 : 0,
      bookings: data.bookings.length,
      complaints: data.complaints.length,
      payments: data.payments.length,
      occupancyRate: profile.room_no ? 100 : 0,
      totalCapacity: profile.capacity || 0,
      approvedBookings: data.bookings.filter(
        (b) => b.status === "APPROVED"
      ).length,
    };
  }, [data]);

  const bookingChart = useMemo(() => {
    const statuses = ["REQUESTED", "APPROVED", "REJECTED", "CANCELLED"];
    return statuses.map((status) => ({
      label: status,
      value: data.bookings.filter((b) => b.status === status).length,
    }));
  }, [data.bookings]);

  const complaintChart = useMemo(() => {
    const priorities = ["HIGH", "MEDIUM", "LOW"];
    return priorities.map((priority) => ({
      label: priority,
      value: data.complaints.filter((c) => c.priority === priority).length,
    }));
  }, [data.complaints]);

  const paymentChart = useMemo(() => {
    const statuses = ["SUCCESS", "PENDING", "FAILED", "REFUNDED"];
    return statuses.map((status) => ({
      label: status,
      value: data.payments.filter((p) => p.payment_status === status).length,
    }));
  }, [data.payments]);

  if (loading) {
    return <p className="loading">Loading dashboard...</p>;
  }

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Student Overview</p>
          <h1 className="page-title">
            {data.profile?.full_name || "Dashboard"}
          </h1>
          <p className="page-description">
            {data.profile?.college_name || "Student details"}
          </p>
        </div>
        <div className="dashboard-pill">
          <span>Room</span>
          <strong>{data.profile?.room_no || "--"}</strong>
        </div>
      </section>

      {error ? <div className="message message-error">{error}</div> : null}

      <div className="stats-grid">
        <Card title="My Room" value={data.profile?.room_no || "--"} subtitle={data.profile?.hostel_name || ""} color="primary" />
        <Card title="Bookings" value={metrics.bookings} subtitle={`${metrics.approvedBookings} approved`} color="success" />
        <Card title="Complaints" value={metrics.complaints} subtitle="My issues" color="danger" />
        <Card title="Payments" value={metrics.payments} subtitle="My transactions" color="info" />
      </div>

      <section className="dashboard-grid">
        <ChartCard title="Booking status" subtitle="Your requests" items={bookingChart} />
        <ChartCard title="Complaint priority" subtitle="Your complaints" items={complaintChart} />
        <ChartCard title="Payment status" subtitle="Your payments" items={paymentChart} formatter={(v) => `${v}`} />
      </section>
    </div>
  );
}

export default Dashboard;