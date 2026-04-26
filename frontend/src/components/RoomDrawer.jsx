import "./RoomDrawer.css";

function RoomDrawer({ room, students, complaints, onClose, onOpenStudent }) {
  if (!room) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="room-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <button className="close-drawer" onClick={onClose}>×</button>
          <h2>Room {room.room_no} Details</h2>
        </div>
        
        <div className="drawer-body">
          <div className="room-image-container">
            <img src="/room photo.jpeg" alt="Room View" className="room-hero-image" />
            <div className="room-image-overlay">
              <span className="badge badge-primary">{room.hostel_name}</span>
            </div>
          </div>

          <div className="room-specs-grid">
            <div className="spec-item">
              <label>Status</label>
              <p className={`status-text ${room.occupancy_status === 'FULL' ? 'danger' : 'success'}`}>
                {room.occupancy_status}
              </p>
            </div>
            <div className="spec-item">
              <label>Type</label>
              <p>{room.capacity > 2 ? 'AC Premium' : 'Non-AC Standard'}</p>
            </div>
            <div className="spec-item">
              <label>Occupancy</label>
              <p>{room.current_occupancy} / {room.capacity} Beds</p>
            </div>
            <div className="spec-item">
              <label>Alerts</label>
              <p>{complaints.length > 0 ? `${complaints.length} Issues` : 'Clear'}</p>
            </div>
          </div>

          <div className="drawer-section">
            <h3>Current Occupants</h3>
            <div className="occupant-list">
              {students.length > 0 ? students.map(student => (
                <div key={student.student_id} className="occupant-row" onClick={() => onOpenStudent(student)}>
                  <div className="occupant-info">
                    <div className="avatar-small">{student.full_name[0]}</div>
                    <div>
                      <div className="occupant-name">{student.full_name}</div>
                      <div className="occupant-sub">{student.register_no}</div>
                    </div>
                  </div>
                  <span className="arrow">›</span>
                </div>
              )) : <p className="empty-text">No students assigned to this room.</p>}
            </div>
          </div>

          {complaints.length > 0 && (
            <div className="drawer-section">
              <h3>Room Issues</h3>
              <div className="complaint-stack">
                {complaints.map(c => (
                  <div key={c.complaint_id} className="complaint-item">
                    <div className="complaint-desc">{c.description}</div>
                    <div className="complaint-meta">Reported on {new Date().toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="drawer-footer-actions">
            <button className="btn btn-primary" style={{ flex: 1 }}>🔧 Send Maintenance</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>🛡️ Policy Inspection</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>📦 Inventory Check</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDrawer;
