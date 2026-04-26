import "./StudentDrawer.css";

function StudentDrawer({ student, onClose }) {
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

          <div className="drawer-actions">
            <h3 style={{ marginBottom: '16px' }}>Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-outline" style={{ textAlign: 'left', borderColor: '#D9C5B2' }}>
                📝 Modify Enrollment
              </button>
              <button className="btn btn-outline" style={{ textAlign: 'left', borderColor: '#D9C5B2' }}>
                💳 View Payment History
              </button>
              <button className="btn btn-outline" style={{ textAlign: 'left', borderColor: '#D9C5B2' }}>
                🚩 Flag for Review
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
