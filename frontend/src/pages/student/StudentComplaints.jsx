import { useMemo, useState } from "react";
import useStudentData from "../../hooks/useStudentData";
import { createRecord, getErrorMessage } from "../../services/authApi";
import { getAutoPriority } from "../../utils/dashboardInsights";

function StudentComplaints() {
  const { data, loading, error, refresh } = useStudentData();
  const [formState, setFormState] = useState({
    complaint_type: "WATER",
    complaint_date: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const student = data.profile;
  const complaints = useMemo(
    () => data.complaints || [],
    [data.complaints]
  );

  if (loading) {
    return <p className="loading">Loading complaints...</p>;
  }

  const predictedPriority = getAutoPriority(
    data.complaints || [],
    student?.student_id,
    formState.complaint_type
  );

  const handleChange = ({ target: { name, value } }) => {
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createRecord("/complaints", {
        student_id: student.student_id,
        complaint_type: formState.complaint_type,
        complaint_date: formState.complaint_date,
        priority: predictedPriority,
      });

      await refresh();
      setMessage("Complaint submitted successfully.");
      setSubmitError("");
      setFormState({
        complaint_type: "WATER",
        complaint_date: "",
        description: "",
      });
    } catch (err) {
      setMessage("");
      setSubmitError(getErrorMessage(err, "Unable to submit complaint."));
    }
  };

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Complaints</p>
          <h1 className="page-title">Raise and track complaints</h1>
          <p className="page-description">
            Submit an issue, see AI-style priority suggestions, and track assignment and resolution time.
          </p>
        </div>
      </section>

      {error || submitError ? <div className="message message-error">{submitError || error}</div> : null}
      {message ? <div className="message message-success">{message}</div> : null}

      <section className="card">
        <div className="card-header"><h2 className="card-title">Raise complaint</h2></div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="complaint_type">Type</label>
              <select id="complaint_type" name="complaint_type" className="form-select" value={formState.complaint_type} onChange={handleChange}>
                <option value="WATER">Water</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="CLEANING">Cleaning</option>
                <option value="INTERNET">Internet</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="complaint_date">Date</label>
              <input id="complaint_date" name="complaint_date" type="date" className="form-input" value={formState.complaint_date} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" className="form-input form-textarea" value={formState.description} onChange={handleChange} placeholder="Explain the issue" rows="4" />
          </div>
          <div className="info-banner">
            Auto-priority suggestion: <strong>{predictedPriority}</strong>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Submit Complaint</button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Complaint history</h2></div>
        <div className="list-stack">
          {complaints.length ? complaints.map((complaint) => (
            <div key={complaint.complaint_id} className="list-row">
              {complaint.complaint_type} / {complaint.priority} / {complaint.complaint_status} / {complaint.assigned_staff || "Awaiting staff"} / {complaint.resolution_time_days} day(s)
            </div>
          )) : <div className="table-empty">No complaints yet.</div>}
        </div>
      </section>
    </div>
  );
}

export default StudentComplaints;
