import { useState } from "react";
import useHostelData from "../hooks/useHostelData";
import StudentDrawer from "../components/StudentDrawer";
import RoomDrawer from "../components/RoomDrawer";

function Rooms() {
  const { data, loading, error } = useHostelData(["rooms", "students", "complaints"]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (loading) {
    return <div className="loading" style={{ padding: '100px', textAlign: 'center' }}>Analyzing room inventory...</div>;
  }

  const getStudentsInRoom = (roomId) => {
    return data.students.filter(s => s.room_id === roomId);
  };

  const getComplaintsInRoom = (roomId) => {
    return data.complaints.filter(c => c.room_id === roomId);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <header className="page-header-card" style={{ marginBottom: '48px' }}>
        <div>
          <h1 className="page-title">Room Inventory</h1>
          <p className="page-description">
            Monitor occupancy, maintenance issues, and resident details across all hostels.
          </p>
        </div>
      </header>

      {error ? <div className="badge badge-danger" style={{ marginBottom: '24px' }}>{error}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {data.rooms.map(room => {
          const roomComplaints = getComplaintsInRoom(room.room_id);

          return (
            <div 
              key={room.room_id} 
              className="card room-card"
              style={{ 
                padding: '24px', 
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '1px solid var(--border)',
                position: 'relative'
              }}
              onClick={() => setSelectedRoom(room)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Room {room.room_no}</h3>
                <span className={`badge ${room.occupancy_status === 'FULL' ? 'badge-danger' : 'badge-success'}`}>
                  {room.occupancy_status}
                </span>
              </div>
              
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                {room.hostel_name} • {room.current_occupancy}/{room.capacity} Beds
              </p>

              {roomComplaints.length > 0 && (
                <div className="alert-strip">
                  ⚠️ {roomComplaints.length} Issues
                </div>
              )}
              
              <div className="card-footer-hint">View Details ›</div>
            </div>
          );
        })}
      </div>

      <RoomDrawer 
        room={selectedRoom}
        students={selectedRoom ? getStudentsInRoom(selectedRoom.room_id) : []}
        complaints={selectedRoom ? getComplaintsInRoom(selectedRoom.room_id) : []}
        onClose={() => setSelectedRoom(null)}
        onOpenStudent={(student) => setSelectedStudent(student)}
      />

      <StudentDrawer 
        student={selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />

      <style>{`
        .room-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(26, 38, 52, 0.1);
          border-color: var(--secondary) !important;
        }
        .alert-strip {
          background: #fff5f5;
          color: #c53030;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .card-footer-hint {
          margin-top: 16px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--secondary);
          text-transform: uppercase;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

export default Rooms;
