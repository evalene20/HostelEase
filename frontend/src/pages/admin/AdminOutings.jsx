import { useEffect, useMemo, useState } from "react";
import { fetchOutings, updateOutingStatus, getErrorMessage } from "../../services/authApi";

function AdminOutings() {
  const [outings, setOutings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState("");

  const loadOutings = async () => {
    try {
      setLoading(true);
      const data = await fetchOutings();
      setOutings(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load outings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutings();
  }, []);

  const handleStatusUpdate = async (outingId, status) => {
    setActionLoading((prev) => ({ ...prev, [outingId]: true }));
    try {
      await updateOutingStatus(outingId, status);
      setMessage(`Outing ${status.toLowerCase()} successfully.`);
      await loadOutings();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err, `Unable to ${status.toLowerCase()} outing.`));
    } finally {
      setActionLoading((prev) => ({ ...prev, [outingId]: false }));
    }
  };

  const stats = useMemo(() => {
    const requested = outings.filter((o) => o.status === "REQUESTED").length;
    const pending = outings.filter((o) => o.status === "PENDING").length;
    const approved = outings.filter((o) => o.status === "APPROVED").length;
    const rejected = outings.filter((o) => o.status === "REJECTED").length;
    const late = outings.filter((o) => o.computed_status === "LATE").length;
    return { requested, pending, approved, rejected, late, total: outings.length };
  }, [outings]);

  if (loading) {
    return <p className="loading">Loading outings...</p>;
  }

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Outing Management</p>
          <h1 className="page-title">Review and approve outing requests</h1>
          <p className="page-description">
            Manage student outing permissions, track late returns, and monitor approval status.
          </p>
        </div>
      </section>

      {error && (
        <div className="badge badge-danger" style={{ marginBottom: "16px", display: "block" }}>
          {error}
        </div>
      )}

      {message && (
        <div className="badge badge-success" style={{ marginBottom: "16px", display: "block" }}>
          {message}
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#4f46e5" }}>{stats.requested + stats.pending}</div>
          <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Pending Requests</div>
        </div>
        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#16a34a" }}>{stats.approved}</div>
          <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Approved</div>
        </div>
        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#dc2626" }}>{stats.rejected}</div>
          <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Rejected</div>
        </div>
        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ea580c" }}>{stats.late}</div>
          <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Late Returns</div>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">All Outing Requests ({stats.total})</h2>
        </div>
        <div className="list-stack">
          {outings.length ? (
            outings.map((outing) => (
              <div
                key={outing.outing_id}
                className="list-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                    {outing.full_name || `Student #${outing.student_id}`}
                    {outing.register_no && <span style={{ color: "#64748b", marginLeft: "8px" }}>({outing.register_no})</span>}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "4px" }}>
                    <strong>Date:</strong> {outing.outing_date} | <strong>Out:</strong> {outing.time_out} | <strong>Return by:</strong> {outing.expected_return}
                  </div>
                  {outing.purpose && (
                    <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "4px" }}>
                      <strong>Purpose:</strong> {outing.purpose}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <span
                      className={`badge badge-${outing.status?.toLowerCase()}`}
                      style={{
                        padding: "4px 12px",
                        fontSize: "0.75rem",
                        background:
                          outing.status === "APPROVED"
                            ? "#dcfce7"
                            : outing.status === "REJECTED"
                            ? "#fee2e2"
                            : outing.computed_status === "LATE"
                            ? "#ffedd5"
                            : "#e0e7ff",
                        color:
                          outing.status === "APPROVED"
                            ? "#16a34a"
                            : outing.status === "REJECTED"
                            ? "#dc2626"
                            : outing.computed_status === "LATE"
                            ? "#ea580c"
                            : "#4f46e5",
                      }}
                    >
                      {outing.computed_status || outing.status}
                    </span>
                    {outing.actual_return && (
                      <span className="badge" style={{ padding: "4px 12px", fontSize: "0.75rem", background: "#f1f5f9" }}>
                        Returned: {outing.actual_return}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(outing.status === "REQUESTED" || outing.status === "PENDING") && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(outing.outing_id, "APPROVED")}
                        disabled={actionLoading[outing.outing_id]}
                        className="btn btn-sm"
                        style={{
                          background: "#16a34a",
                          color: "white",
                          border: "none",
                          padding: "6px 16px",
                          fontSize: "0.875rem",
                          opacity: actionLoading[outing.outing_id] ? 0.6 : 1,
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(outing.outing_id, "REJECTED")}
                        disabled={actionLoading[outing.outing_id]}
                        className="btn btn-sm"
                        style={{
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "6px 16px",
                          fontSize: "0.875rem",
                          opacity: actionLoading[outing.outing_id] ? 0.6 : 1,
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="table-empty">No outing requests found.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminOutings;
