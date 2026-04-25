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
    return <p className="loading">Loading room details...</p>;
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
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">My Room</p>
          <h1 className="page-title">Room, booking, and occupancy details</h1>
          <p className="page-description">
            View current room allocation, booking history, occupancy, and room-change suggestion.
          </p>
        </div>
      </section>
      {error ? <div className="message message-error">{error}</div> : null}

      <div className="dashboard-grid dashboard-grid-wide">
        <section className="card">
          <div className="card-header"><h2 className="card-title">Current allocation</h2></div>
          <div className="detail-grid">
            <div><span>Hostel</span><strong>{currentBooking?.hostel_name || "Not assigned"}</strong></div>
            <div><span>Room</span><strong>{currentBooking?.room_no || "--"}</strong></div>
            <div><span>Status</span><strong>{currentBooking?.status || "NONE"}</strong></div>
            <div><span>Occupancy</span><strong>{currentRoom ? `${currentRoom.current_occupancy}/${currentRoom.capacity}` : "--"}</strong></div>
          </div>
        </section>

        <section className="card">
          <div className="card-header"><h2 className="card-title">Booking history</h2></div>
          <div className="list-stack">
            {bookings.length ? bookings.map((booking) => (
              <div key={booking.booking_id} className="list-row">
                {booking.booking_date}: {booking.room_no} / {booking.hostel_name} / {booking.status}
              </div>
            )) : <div className="table-empty">No booking history yet.</div>}
          </div>
        </section>

        <section className="card">
          <div className="card-header"><h2 className="card-title">Room change request idea</h2></div>
          {recommendation ? (
            <div className="list-stack">
              <div className="list-row">Recommended room: {recommendation.room_no}</div>
              {recommendation.reasons.map((reason) => (
                <div key={reason} className="list-row">{reason}</div>
              ))}
            </div>
          ) : (
            <div className="table-empty">No upgrade suggestion available.</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MyRoom;
