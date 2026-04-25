import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EntityPage from "../components/EntityPage";
import Table from "../components/Table";
import { createRecord, fetchCollection, getErrorMessage } from "../services/api";

const studentColumns = [
  { header: "ID", accessor: "student_id" },
  { header: "Name", accessor: "full_name" },
  { header: "Register No", accessor: "register_no" },
  { header: "College", accessor: "college_name" },
  { header: "Hostel", accessor: "hostel_name" },
  { header: "Room", accessor: "room_no" },
  { header: "Risk", accessor: "ai_student_risk" },
];

const Students = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    register_no: "",
    full_name: "",
    college_id: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const isFormOpen = searchParams.get("action") === "new";

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      try {
        const data = await fetchCollection("/students");
        if (!isMounted) return;
        setStudents(data);
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setStudents([]);
        setError(getErrorMessage(err, "Unable to load students."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStudents();

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
      await createRecord("/students", {
        ...formState,
        college_id: Number(formState.college_id),
      });

      const data = await fetchCollection("/students");
      setStudents(data);
      setFormState({
        register_no: "",
        full_name: "",
        college_id: "",
      });
      setSubmitError("");
      setSubmitMessage("Student saved successfully.");
      setSearchParams({});
    } catch (err) {
      setSubmitMessage("");
      setSubmitError(getErrorMessage(err, "Unable to save student."));
    }
  };

  if (loading) {
    return <p className="loading">Loading students...</p>;
  }

  return (
    <EntityPage
      title="Students"
      description="Manage student records and keep onboarding details ready for bookings."
      actionLabel="New Student"
      isFormOpen={isFormOpen}
      onOpenForm={openForm}
      onCloseForm={closeForm}
      formTitle="Add student"
      formDescription="Enter the student details and assign a college ID."
      message={submitError || error || submitMessage}
      messageType={submitError || error ? "error" : "success"}
      formContent={
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                className="form-input"
                value={formState.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register_no">
                Register Number
              </label>
              <input
                id="register_no"
                name="register_no"
                className="form-input"
                value={formState.register_no}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="college_id">
                College ID
              </label>
              <input
                id="college_id"
                name="college_id"
                type="number"
                min="1"
                className="form-input"
                value={formState.college_id}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Student
            </button>
          </div>
        </form>
      }
    >
      <div className="section-heading">
        <h2 className="card-title">Student list</h2>
      </div>
      <Table columns={studentColumns} data={students} />
    </EntityPage>
  );
};

export default Students;
