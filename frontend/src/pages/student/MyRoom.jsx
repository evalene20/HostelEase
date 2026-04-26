import { useOutletContext } from "react-router-dom";
import useHostelData from "../../hooks/useHostelData";
import {
  getRecommendedRoom,
  getStudentBookings,
  getStudentRecord,
} from "../../utils/dashboardInsights";

function MyRoom() {
  const { session } = useOutletContext();
  const { data, loading, error } = useHostelData();

  if (loading) {
    return <div className="loading" style={{ padding: '100px', textAlign: 'center' }}>Retrieving room details...</div>;
  }

  const student = getStudentRecord(data.students, session.studentId);
  const bookings = getStudentBookings(data.bookings, student?.student_id);
  const currentBooking = bookings.find((item) => item.status === "APPROVED") || bookings[0];
  const currentRoom = data.rooms.find((room) => Number(room.room_id) === Number(currentBooking?.room_id));
  const recommendation = getRecommendedRoom({
    student,
    rooms: data.rooms,
    bookings: data.bookings,
    complaints: data.complaints,
    students: data.students,
  });

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <header className="page-header-card" style={{ marginBottom: '48px' }}>
        <div>
          <h1 className="page-title">My Room</h1>
          <p className="page-description">
            Your current living space, occupancy details, and history.
          </p>
        </div>
      </header>

      {error ? <div className="badge badge-danger" style={{ marginBottom: '24px' }}>{error}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img 
              src="/room photo.jpeg" 
              alt="Room" 
              style={{ width: '100%', height: '300px', objectFit: 'cover' }} 
            />
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Room {currentBooking?.room_no || "TBD"}</h2>
                <span className="badge badge-success">{currentBooking?.hostel_name || "Unassigned"}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Occupancy</label>
                  <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                    {currentRoom ? `${currentRoom.current_occupancy} / ${currentRoom.capacity}` : "0 / 0"} Beds
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Room Type</label>
                  <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                    {currentRoom?.capacity > 2 ? 'AC Premium' : 'Non-AC Standard'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="card" style={{ marginTop: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Room Change Suggestion</h3>
            {recommendation ? (
              <div style={{ padding: '20px', background: '#fdfcfb', borderRadius: '12px', border: '1px solid #D9C5B2' }}>
                <p style={{ fontWeight: '700', marginBottom: '12px' }}>Recommended: Room {recommendation.room_no}</p>
                <ul style={{ paddingLeft: '20px', color: '#5a6b5c' }}>
                  {recommendation.reasons.map((reason, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>{reason}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>You are in the best available room for your profile.</p>
            )}
          </section>
        </div>

        <div>
          <section className="card">
            <h3 style={{ marginBottom: '24px' }}>Booking History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookings.length ? bookings.map((booking) => (
                <div key={booking.booking_id} style={{ 
                  padding: '16px', 
                  border: '1px solid #f1ede8', 
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>{booking.hostel_name} - Room {booking.room_no}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Requested on {booking.booking_date}</div>
                  </div>
                  <span className={`badge ${booking.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                    {booking.status}
                  </span>
                </div>
              )) : <p style={{ color: '#94a3b8' }}>No booking records found.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default MyRoom;
