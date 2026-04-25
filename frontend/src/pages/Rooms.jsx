import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EntityPage from "../components/EntityPage";
import Table from "../components/Table";
import { createRecord, fetchCollection, getErrorMessage } from "../services/api";

const roomColumns = [
  { header: "ID", accessor: "room_id" },
  { header: "Room No", accessor: "room_no" },
  { header: "Capacity", accessor: "capacity" },
  { header: "Hostel", accessor: "hostel_name" },
  { header: "Occupancy", accessor: "current_occupancy" },
  { header: "Status", accessor: "occupancy_status" },
  { header: "Alert", accessor: "ai_room_alert" },
];

const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    hostel_id: "",
    room_no: "",
    capacity: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const isFormOpen = searchParams.get("action") === "new";

  useEffect(() => {
    let isMounted = true;

    const loadRooms = async () => {
      try {
        const data = await fetchCollection("/rooms");
        if (!isMounted) return;
        setRooms(data);
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setRooms([]);
        setError(getErrorMessage(err, "Unable to load rooms."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRooms();

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
      await createRecord("/rooms", {
        ...formState,
        hostel_id: Number(formState.hostel_id),
        capacity: Number(formState.capacity),
      });

      const data = await fetchCollection("/rooms");
      setRooms(data);
      setFormState({
        hostel_id: "",
        room_no: "",
        capacity: "",
      });
      setSubmitError("");
      setSubmitMessage("Room saved successfully.");
      setSearchParams({});
    } catch (err) {
      setSubmitMessage("");
      setSubmitError(getErrorMessage(err, "Unable to save room."));
    }
  };

  if (loading) {
    return <p className="loading">Loading rooms...</p>;
  }

  return (
    <EntityPage
      title="Rooms"
      description="Track room inventory and add new rooms with their hostel and capacity."
      actionLabel="New Room"
      isFormOpen={isFormOpen}
      onOpenForm={openForm}
      onCloseForm={closeForm}
      formTitle="Add room"
      formDescription="Enter the hostel ID, room number, and supported capacity."
      message={submitError || error || submitMessage}
      messageType={submitError || error ? "error" : "success"}
      formContent={
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="hostel_id">
                Hostel ID
              </label>
              <input
                id="hostel_id"
                name="hostel_id"
                type="number"
                min="1"
                className="form-input"
                value={formState.hostel_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="room_no">
                Room Number
              </label>
              <input
                id="room_no"
                name="room_no"
                className="form-input"
                value={formState.room_no}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="capacity">
                Capacity
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                max="8"
                className="form-input"
                value={formState.capacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Room
            </button>
          </div>
        </form>
      }
    >
      <div className="section-heading">
        <h2 className="card-title">Room list</h2>
      </div>
      <Table columns={roomColumns} data={rooms} />
    </EntityPage>
  );
};

export default Rooms;
