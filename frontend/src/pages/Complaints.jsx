import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EntityPage from "../components/EntityPage";
import Table from "../components/Table";
import { createRecord, fetchCollection, getErrorMessage } from "../services/api";

const complaintColumns = [
  { header: "ID", accessor: "complaint_id" },
  { header: "Student", accessor: "full_name" },
  { header: "Type", accessor: "complaint_type" },
  { header: "Date", accessor: "complaint_date" },
  { header: "Assigned Staff", accessor: "assigned_staff" },
  { header: "Status", accessor: "complaint_status" },
  { header: "Resolution Days", accessor: "resolution_time_days" },
  {
    header: "Priority",
    accessor: "priority",
    render: (value) => <span className={`badge badge-${value?.toLowerCase()}`}>{value}</span>,
  },
  { header: "AI Feedback", accessor: "ai_feedback" },
];

const Complaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    student_id: "",
    complaint_type: "WATER",
    complaint_date: "",
    priority: "MEDIUM",
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const isFormOpen = searchParams.get("action") === "new";

  useEffect(() => {
    let isMounted = true;

    const loadComplaints = async () => {
      try {
        const data = await fetchCollection("/complaints");
        if (!isMounted) return;
        setComplaints(data);
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setComplaints([]);
        setError(getErrorMessage(err, "Unable to load complaints."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      isMounted = false;
    };
  }, []);

  const openForm = () => {
    setSearchParams({ action: "new" });
    setSubmitMessage("");
    setSubmitError("");
  };

  const closeForm = () => {
    setSearchParams({});
    setSubmitError("");
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createRecord("/complaints", {
        ...formState,
        student_id: Number(formState.student_id),
      });

      const data = await fetchCollection("/complaints");
      setComplaints(data);
      setFormState({
        student_id: "",
        complaint_type: "WATER",
        complaint_date: "",
        priority: "MEDIUM",
      });
      setSubmitError("");
      setSubmitMessage("Complaint saved successfully.");
      setSearchParams({});
    } catch (err) {
      setSubmitMessage("");
      setSubmitError(getErrorMessage(err, "Unable to save complaint."));
    }
  };

  if (loading) {
    return <p className="loading">Loading complaints...</p>;
  }

  return (
    <EntityPage
      title="Complaints"
      description="Register maintenance issues and keep an eye on their priority levels."
      actionLabel="New Complaint"
      isFormOpen={isFormOpen}
      onOpenForm={openForm}
      onCloseForm={closeForm}
      formTitle="File complaint"
      formDescription="Choose the student, issue type, date, and priority."
      message={submitError || error || submitMessage}
      messageType={submitError || error ? "error" : "success"}
      formContent={
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="student_id">
                Student ID
              </label>
              <input
                id="student_id"
                name="student_id"
                type="number"
                min="1"
                className="form-input"
                value={formState.student_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="complaint_type">
                Complaint Type
              </label>
              <select
                id="complaint_type"
                name="complaint_type"
                className="form-select"
                value={formState.complaint_type}
                onChange={handleChange}
              >
                <option value="WATER">Water</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="CLEANING">Cleaning</option>
                <option value="INTERNET">Internet</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formState.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="complaint_date">
                Complaint Date
              </label>
              <input
                id="complaint_date"
                name="complaint_date"
                type="date"
                className="form-input"
                value={formState.complaint_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Complaint
            </button>
          </div>
        </form>
      }
    >
      <div className="section-heading">
        <h2 className="card-title">Complaint list</h2>
      </div>
      <Table columns={complaintColumns} data={complaints} />
    </EntityPage>
  );
};

export default Complaints;
