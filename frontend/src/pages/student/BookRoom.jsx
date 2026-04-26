import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useHostelData from "../../hooks/useHostelData";
import { createRecord, getErrorMessage } from "../../services/api";
import { getRecommendedRoom, getStudentRecord } from "../../utils/dashboardInsights";

function BookRoom() {
  const { session } = useOutletContext();
  const { data, loading, error, refresh } = useHostelData();
  const [roomId, setRoomId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const student = useMemo(
    () => getStudentRecord(data.students, session.studentId),
    [data.students, session.studentId]
  );

  const recommendation = useMemo(
    () =>
      getRecommendedRoom({
        student,
        rooms: data.rooms,
        bookings: data.bookings,
        complaints: data.complaints,
        students: data.students,
      }),
    [data, student]
  );

  if (loading) {
    return <p className="loading">Loading room booking options...</p>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createRecord("/bookings", {
        student_id: student.student_id,
        room_id: Number(roomId),
        booking_date: bookingDate,
      });

      await refresh();
      setMessage("Booking request submitted successfully.");
      setSubmitError("");
      setRoomId("");
      setBookingDate("");
    } catch (err) {
      setMessage("");
      setSubmitError(getErrorMessage(err, "Unable to submit booking request."));
    }
  };

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Book Room</p>
          <h1 className="page-title">Apply for room booking</h1>
          <p className="page-description">
            Choose a room, submit a request, and review occupancy before applying.
          </p>
        </div>
      </section>

      {error || submitError ? <div className="message message-error">{submitError || error}</div> : null}
      {message ? <div className="message message-success">{message}</div> : null}

      <section className="card">
        <div className="card-header"><h2 className="card-title">Recommended room for you</h2></div>
        {recommendation ? (
          <div className="list-stack">
            <div className="list-row">
              {recommendation.room_no} in {recommendation.hostel_name}
            </div>
            {recommendation.reasons.map((reason) => (
              <div key={reason} className="list-row">{reason}</div>
            ))}
          </div>
        ) : (
          <div className="table-empty">No smart recommendation available.</div>
        )}
      </section>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Submit booking request</h2></div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="room_id">Room</label>
              <select id="room_id" className="form-select" value={roomId} onChange={(event) => setRoomId(event.target.value)} required>
                <option value="">Select a room</option>
                {data.rooms.map((room) => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.hostel_name} / {room.room_no} / {room.current_occupancy}-{room.capacity} / {room.occupancy_status}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="booking_date">Booking date</label>
              <input id="booking_date" type="date" className="form-input" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Apply Now</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default BookRoom;
