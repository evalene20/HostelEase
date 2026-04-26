import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchOutings, createOuting, recordOutingReturn, getErrorMessage } from "../../services/authApi";

function Outing() {
  const { session } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [formState, setFormState] = useState({
    outing_date: "",
    time_out: "",
    expected_return: "",
    purpose: "",
  });

  const loadOutings = async () => {
    try {
      const data = await fetchOutings();
      setRequests(data);
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

  const lateAlerts = useMemo(
    () => requests.filter((request) => request.computed_status === "LATE").length,
    [requests]
  );

  const pendingApprovals = useMemo(
    () => requests.filter((request) => request.status === "PENDING").length,
    [requests]
  );

  const handleChange = ({ target: { name, value } }) => {
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createOuting(formState);
      setSubmitMessage("Outing request submitted successfully.");
      setFormState({ outing_date: "", time_out: "", expected_return: "", purpose: "" });
      await loadOutings();
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to submit outing request."));
    }
  };

  const handleReturn = async (outingId) => {
    try {
      await recordOutingReturn(outingId);
      await loadOutings();
      setSubmitMessage("Return time recorded.");
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to record return."));
    }
  };

  if (loading) {
    return <p className="loading">Loading outings...</p>;
  }

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Outing</p>
          <h1 className="page-title">Outing permission and late return tracking</h1>
          <p className="page-description">
            Submit a going-out request, track approval, and see return alerts.
          </p>
        </div>
      </section>

      {error && (
        <div className="badge badge-danger" style={{ marginBottom: "16px", display: "block" }}>
          {error}
        </div>
      )}

      {submitMessage && (
        <div className="badge badge-success" style={{ marginBottom: "16px", display: "block" }}>
          {submitMessage}
        </div>
      )}

      <section className="card">
        <div className="card-header"><h2 className="card-title">Request outing</h2></div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="outing_date">Date</label>
              <input id="outing_date" name="outing_date" type="date" className="form-input" value={formState.outing_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="time_out">Time out</label>
              <input id="time_out" name="time_out" type="time" className="form-input" value={formState.time_out} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="expected_return">Expected return</label>
              <input id="expected_return" name="expected_return" type="time" className="form-input" value={formState.expected_return} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="purpose">Purpose (optional)</label>
              <input id="purpose" name="purpose" type="text" className="form-input" value={formState.purpose} onChange={handleChange} placeholder="Brief purpose of outing" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Send Request</button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Outing alerts</h2></div>
        <div className="list-stack">
          <div className="list-row">{pendingApprovals > 0 ? `${pendingApprovals} pending approval(s).` : "No pending approvals."}</div>
          <div className="list-row">{lateAlerts > 0 ? `${lateAlerts} late return alert(s).` : "No late return alerts."}</div>
        </div>
      </section>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Outing history</h2></div>
        <div className="list-stack">
          {requests.length ? requests.map((request) => (
            <div key={request.outing_id} className="list-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{request.outing_date}</strong> | Out: {request.time_out} | Return by: {request.expected_return}
                {request.purpose && <span style={{ color: "#666", marginLeft: "8px" }}>({request.purpose})</span>}
                <span className={`badge badge-${request.status?.toLowerCase()}`} style={{ marginLeft: "8px" }}>
                  {request.computed_status || request.status}
                </span>
              </div>
              {request.status === "APPROVED" && !request.actual_return && (
                <button
                  onClick={() => handleReturn(request.outing_id)}
                  className="btn btn-sm"
                  style={{ background: "#4f46e5", color: "white", border: "none", padding: "4px 12px", fontSize: "0.75rem" }}
                >
                  Mark Returned
                </button>
              )}
            </div>
          )) : <div className="table-empty">No outing requests yet.</div>}
        </div>
      </section>
    </div>
  );
}

export default Outing;
