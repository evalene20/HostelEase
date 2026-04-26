import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { fetchCollection, getErrorMessage } from "../services/authApi";

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
  const [collections, setCollections] = useState({
    students: [],
    rooms: [],
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
        const [students, rooms, bookings, complaints, payments] = await Promise.all([
          fetchCollection("/students"),
          fetchCollection("/rooms"),
          fetchCollection("/bookings"),
          fetchCollection("/complaints"),
          fetchCollection("/payments"),
        ]);

        if (!isMounted) return;

        setCollections({ students, rooms, bookings, complaints, payments });
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err, "Unable to load the dashboard."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalCapacity = collections.rooms.reduce(
      (sum, room) => sum + Number(room.capacity || 0),
      0
    );
    const approvedBookings = collections.bookings.filter(
      (booking) => booking.status === "APPROVED"
    ).length;
    const occupancyRate = totalCapacity
      ? Math.round((approvedBookings / totalCapacity) * 100)
      : 0;

    return {
      students: collections.students.length,
      rooms: collections.rooms.length,
      bookings: collections.bookings.length,
      complaints: collections.complaints.length,
      payments: collections.payments.length,
      occupancyRate,
      totalCapacity,
      approvedBookings,
    };
  }, [collections]);

  const bookingChart = useMemo(() => {
    const statuses = ["REQUESTED", "APPROVED", "REJECTED", "CANCELLED"];
    return statuses.map((status) => ({
      label: status,
      value: collections.bookings.filter((booking) => booking.status === status).length,
    }));
  }, [collections.bookings]);

  const complaintChart = useMemo(() => {
    const priorities = ["HIGH", "MEDIUM", "LOW"];
    return priorities.map((priority) => ({
      label: priority,
      value: collections.complaints.filter(
        (complaint) => complaint.priority === priority
      ).length,
    }));
  }, [collections.complaints]);

  const paymentChart = useMemo(() => {
    const statuses = ["SUCCESS", "PENDING", "FAILED", "REFUNDED"];
    return statuses.map((status) => ({
      label: status,
      value: collections.payments.filter(
        (payment) => payment.payment_status === status
      ).length,
    }));
  }, [collections.payments]);

  if (loading) {
    return <p className="loading">Loading dashboard...</p>;
  }

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Track hostel activity, room usage, complaints, and payments in one place.
          </p>
        </div>
        <div className="dashboard-pill">
          <span>Occupancy</span>
          <strong>{metrics.occupancyRate}%</strong>
        </div>
      </section>

      {error ? <div className="message message-error">{error}</div> : null}

      <div className="stats-grid">
        <Card
          title="Students"
          value={metrics.students}
          subtitle="Registered residents"
          color="primary"
        />
        <Card
          title="Rooms"
          value={metrics.rooms}
          subtitle={`${metrics.totalCapacity} total beds`}
          color="success"
        />
        <Card
          title="Bookings"
          value={metrics.bookings}
          subtitle={`${metrics.approvedBookings} approved`}
          color="warning"
        />
        <Card
          title="Complaints"
          value={metrics.complaints}
          subtitle="Open issue log"
          color="danger"
        />
        <Card
          title="Payments"
          value={metrics.payments}
          subtitle="Collection entries"
          color="info"
        />
      </div>

      <section className="dashboard-grid">
        <ChartCard
          title="Booking status"
          subtitle="How current booking requests are distributed."
          items={bookingChart}
        />
        <ChartCard
          title="Complaint priority"
          subtitle="See which complaints need attention first."
          items={complaintChart}
        />
        <ChartCard
          title="Payment status"
          subtitle="Monitor payment completion at a glance."
          items={paymentChart}
          formatter={(value) => `${value} records`}
        />
      </section>

      <section className="card spotlight-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Capacity snapshot</h2>
            <p className="section-description">
              Approved bookings are measured against total room capacity.
            </p>
          </div>
        </div>
        <div className="capacity-track">
          <div
            className="capacity-fill"
            style={{ width: `${Math.min(metrics.occupancyRate, 100)}%` }}
          />
        </div>
        <div className="capacity-legend">
          <span>{metrics.approvedBookings} approved bookings</span>
          <span>{metrics.totalCapacity} total beds</span>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
