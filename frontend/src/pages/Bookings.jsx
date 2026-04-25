import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EntityPage from "../components/EntityPage";
import Table from "../components/Table";
import { createRecord, fetchCollection, getErrorMessage } from "../services/api";

const bookingColumns = [
  { header: "ID", accessor: "booking_id" },
  { header: "Student", accessor: "full_name" },
  { header: "Room", accessor: "room_no" },
  { header: "Hostel", accessor: "hostel_name" },
  { header: "Date", accessor: "booking_date" },
  {
    header: "Status",
    accessor: "status",
    render: (value) => <span className={`badge badge-${value?.toLowerCase()}`}>{value}</span>,
  },
  { header: "AI Suggestion", accessor: "ai_booking_reason" },
];

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    student_id: "",
    room_id: "",
    booking_date: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const isFormOpen = searchParams.get("action") === "new";

  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        const data = await fetchCollection("/bookings");
        if (!isMounted) return;
        setBookings(data);
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setBookings([]);
        setError(getErrorMessage(err, "Unable to load bookings."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBookings();

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
      await createRecord("/bookings", {
        ...formState,
        student_id: Number(formState.student_id),
        room_id: Number(formState.room_id),
      });

      const data = await fetchCollection("/bookings");
      setBookings(data);
      setFormState({
        student_id: "",
        room_id: "",
        booking_date: "",
      });
      setSubmitError("");
      setSubmitMessage("Booking submitted successfully.");
      setSearchParams({});
    } catch (err) {
      setSubmitMessage("");
      setSubmitError(getErrorMessage(err, "Unable to save booking."));
    }
  };

  if (loading) {
    return <p className="loading">Loading bookings...</p>;
  }

  return (
    <EntityPage
      title="Bookings"
      description="Create room requests and monitor the latest booking statuses."
      actionLabel="New Booking"
      isFormOpen={isFormOpen}
      onOpenForm={openForm}
      onCloseForm={closeForm}
      formTitle="Add booking"
      formDescription="Enter the student, room, and booking date to create a new request."
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
              <label className="form-label" htmlFor="room_id">
                Room ID
              </label>
              <input
                id="room_id"
                name="room_id"
                type="number"
                min="1"
                className="form-input"
                value={formState.room_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="booking_date">
                Booking Date
              </label>
              <input
                id="booking_date"
                name="booking_date"
                type="date"
                className="form-input"
                value={formState.booking_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Booking
            </button>
          </div>
        </form>
      }
    >
      <div className="section-heading">
        <h2 className="card-title">Booking list</h2>
      </div>
      <Table columns={bookingColumns} data={bookings} />
    </EntityPage>
  );
};

export default Bookings;
