import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

function loadRequests(studentId) {
  try {
    return JSON.parse(window.localStorage.getItem(`outing-${studentId}`) || "[]");
  } catch {
    return [];
  }
}

function Outing() {
  const { session } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [formState, setFormState] = useState({
    date: "",
    time_out: "",
    expected_return: "",
  });

  useEffect(() => {
    setRequests(loadRequests(session.studentId));
  }, [session.studentId]);

  const lateAlerts = useMemo(
    () => requests.filter((request) => request.status === "LATE").length,
    [requests]
  );

  const handleChange = ({ target: { name, value } }) => {
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextRequest = {
      ...formState,
      id: Date.now(),
      status: requests.length % 2 === 0 ? "APPROVED" : "PENDING",
    };
    const nextRequests = [nextRequest, ...requests];
    setRequests(nextRequests);
    window.localStorage.setItem(`outing-${session.studentId}`, JSON.stringify(nextRequests));
    setFormState({ date: "", time_out: "", expected_return: "" });
  };

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Outing</p>
          <h1 className="page-title">Outing permission and late return tracking</h1>
          <p className="page-description">
            Submit a going-out request, track approval, and see return alerts. This uses a local demo flow until outing tables are added.
          </p>
        </div>
      </section>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Request outing</h2></div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input id="date" name="date" type="date" className="form-input" value={formState.date} onChange={handleChange} required />
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
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Send Request</button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Outing alerts</h2></div>
        <div className="list-stack">
          <div className="list-row">Approval status tracking is enabled for all requests.</div>
          <div className="list-row">{lateAlerts ? `${lateAlerts} late return alert(s) recorded.` : "No late return alerts right now."}</div>
        </div>
      </section>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Outing history</h2></div>
        <div className="list-stack">
          {requests.length ? requests.map((request) => (
            <div key={request.id} className="list-row">
              {request.date} / {request.time_out} - {request.expected_return} / {request.status}
            </div>
          )) : <div className="table-empty">No outing requests yet.</div>}
        </div>
      </section>
    </div>
  );
}

export default Outing;
