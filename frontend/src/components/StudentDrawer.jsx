import { useState, useEffect } from "react";
import "./StudentDrawer.css";
import { toggleStudentFlag, fetchStudentPayments, getErrorMessage } from "../services/authApi";

function StudentDrawer({ student, onClose }) {
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (student?.student_id) {
      loadPayments();
    }
  }, [student?.student_id]);

  const loadPayments = async () => {
    if (!student?.student_id) return;
    setPaymentsLoading(true);
    try {
      const data = await fetchStudentPayments(student.student_id);
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleToggleFlag = async () => {
    setFlagLoading(true);
    try {
      const newFlagged = !flagged;
      await toggleStudentFlag(student.student_id, newFlagged, newFlagged ? "Flagged for review" : "");
      setFlagged(newFlagged);
      setMessage(newFlagged ? "Student flagged for review" : "Flag removed");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to toggle flag"));
    } finally {
      setFlagLoading(false);
    }
  };

  if (!student) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="student-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <button className="close-drawer" onClick={onClose}>×</button>
          <h2>Student Details</h2>
        </div>
        
        <div className="drawer-body">
          <div className="student-avatar-large">
            {student.full_name[0].toUpperCase()}
          </div>
          
          <div className="detail-section">
            <label>Full Name</label>
            <p>{student.full_name}</p>
          </div>
          
          <div className="detail-section">
            <label>Register Number</label>
            <p>{student.register_no}</p>
          </div>

          <div className="detail-section">
            <label>College</label>
            <p>{student.college_name || "N/A"}</p>
          </div>

          <div className="detail-section">
            <label>Hostel / Room</label>
            <p>{student.hostel_name} - {student.room_no}</p>
          </div>

          {message && (
            <div style={{ padding: "12px", background: "#f0fdf4", color: "#166534", borderRadius: "6px", marginBottom: "16px" }}>
              {message}
            </div>
          )}

          <div className="drawer-actions">
            <h3 style={{ marginBottom: '16px' }}>Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="btn btn-outline"
                style={{ textAlign: 'left', borderColor: '#D9C5B2' }}
                onClick={() => setShowPayments(!showPayments)}
              >
                � {showPayments ? "Hide" : "View"} Payment History
              </button>

              {showPayments && (
                <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "6px" }}>
                  {paymentsLoading ? (
                    <p>Loading payments...</p>
                  ) : payments.length > 0 ? (
                    <table style={{ width: "100%", fontSize: "0.875rem" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "4px" }}>ID</th>
                          <th style={{ textAlign: "left", padding: "4px" }}>Amount</th>
                          <th style={{ textAlign: "left", padding: "4px" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.payment_id}>
                            <td style={{ padding: "4px" }}>{p.payment_id}</td>
                            <td style={{ padding: "4px" }}>{p.amount}</td>
                            <td style={{ padding: "4px" }}>{p.payment_status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "#64748b" }}>No payments found</p>
                  )}
                </div>
              )}

              <button
                className="btn btn-outline"
                style={{ textAlign: 'left', borderColor: flagged ? '#ef4444' : '#D9C5B2', color: flagged ? '#ef4444' : 'inherit' }}
                onClick={handleToggleFlag}
                disabled={flagLoading}
              >
                {flagLoading ? "..." : flagged ? "🚩 Unflag Student" : "🚩 Flag for Review"}
              </button>

              <button className="btn btn-primary" style={{ background: '#ef4444', border: 'none' }}>
                🚫 Revoke Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDrawer;
