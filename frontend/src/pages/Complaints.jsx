import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EntityPage from "../components/EntityPage";
import Table from "../components/Table";
import {
  fetchCollection,
  createRecord,
  getErrorMessage,
  fetchAvailableStaff,
  assignComplaint,
  unassignComplaint,
  updateComplaintPriority,
} from "../services/authApi";

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
  const [staffList, setStaffList] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [showAssignModal, setShowAssignModal] = useState(null);

  const isFormOpen = searchParams.get("action") === "new";

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const staff = await fetchAvailableStaff();
        setStaffList(staff);
      } catch {
        // Staff list is optional
      }
    };
    loadStaff();
  }, []);

  const handleAssign = async (complaintId, staffId) => {
    setActionLoading((prev) => ({ ...prev, [complaintId]: true }));
    try {
      await assignComplaint(complaintId, staffId);
      const data = await fetchCollection("/complaints");
      setComplaints(data);
      setShowAssignModal(null);
      setSubmitMessage("Staff assigned successfully.");
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to assign staff."));
    } finally {
      setActionLoading((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const handleUnassign = async (complaintId) => {
    setActionLoading((prev) => ({ ...prev, [complaintId]: true }));
    try {
      await unassignComplaint(complaintId);
      const data = await fetchCollection("/complaints");
      setComplaints(data);
      setSubmitMessage("Staff unassigned.");
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to unassign staff."));
    } finally {
      setActionLoading((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const handlePriorityUpdate = async (complaintId, priority) => {
    setActionLoading((prev) => ({ ...prev, [`priority-${complaintId}`]: true }));
    try {
      await updateComplaintPriority(complaintId, priority);
      const data = await fetchCollection("/complaints");
      setComplaints(data);
      setSubmitMessage("Priority updated.");
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update priority."));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`priority-${complaintId}`]: false }));
    }
  };

  const complaintColumns = [
    { header: "complaint_id", accessor: "complaint_id" },
    { header: "Student", accessor: "full_name" },
    { header: "Type", accessor: "complaint_type" },
    { header: "Date", accessor: "complaint_date" },
    {
      header: "Priority",
      accessor: "priority",
      render: (value, row) => (
        <select
          value={value}
          onChange={(e) => handlePriorityUpdate(row.complaint_id, e.target.value)}
          disabled={actionLoading[`priority-${row.complaint_id}`]}
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "0.8rem",
            cursor: actionLoading[`priority-${row.complaint_id}`] ? "not-allowed" : "pointer",
          }}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      ),
    },
    {
      header: "Assigned Staff",
      accessor: "assigned_staff",
      render: (value, row) => {
        if (value) {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{value}</span>
              <button
                onClick={() => handleUnassign(row.complaint_id)}
                disabled={actionLoading[row.complaint_id]}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  cursor: actionLoading[row.complaint_id] ? "not-allowed" : "pointer",
                  fontSize: "0.75rem",
                }}
                title="Unassign"
              >
                ✕
              </button>
            </div>
          );
        }
        return (
          <button
            onClick={() => setShowAssignModal(row.complaint_id)}
            disabled={actionLoading[row.complaint_id]}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "0.75rem",
              cursor: actionLoading[row.complaint_id] ? "not-allowed" : "pointer",
            }}
          >
            Assign
          </button>
        );
      },
    },
    { header: "Status", accessor: "complaint_status" },
    { header: "Days Open", accessor: "resolution_time_days" },
    { header: "AI Feedback", accessor: "ai_feedback" },
  ];

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

      {showAssignModal && (
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
          onClick={() => setShowAssignModal(null)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              minWidth: "300px",
              maxWidth: "400px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "16px" }}>Assign Staff</h3>
            <p style={{ marginBottom: "16px", color: "#666" }}>
              Select staff member to assign to complaint #{showAssignModal}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {staffList.length === 0 ? (
                <p style={{ color: "#666" }}>Loading staff...</p>
              ) : (
                staffList.map((staff) => (
                  <button
                    key={staff.staff_id}
                    onClick={() => handleAssign(showAssignModal, staff.staff_id)}
                    disabled={actionLoading[showAssignModal]}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                      background: "white",
                      cursor: actionLoading[showAssignModal] ? "not-allowed" : "pointer",
                      opacity: actionLoading[showAssignModal] ? 0.6 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{staff.staff_name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>{staff.role}</div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowAssignModal(null)}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "8px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </EntityPage>
  );
};

export default Complaints;
