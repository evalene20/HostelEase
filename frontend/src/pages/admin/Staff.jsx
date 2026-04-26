import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EntityPage from "../../components/EntityPage";
import Table from "../../components/Table";
import { createRecord, fetchCollection, getErrorMessage } from "../../services/authApi";

const columns = [
  { header: "ID", accessor: "staff_id" },
  { header: "Name", accessor: "staff_name" },
  { header: "Role", accessor: "role" },
  { header: "Phone", accessor: "phone_no" },
  { header: "Assigned Complaints", accessor: "assigned_complaints" },
  { header: "AI Focus", accessor: "ai_role_focus" },
];

function Staff() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [formState, setFormState] = useState({
    staff_name: "",
    role: "WARDEN",
    phone_no: "",
  });

  const isFormOpen = searchParams.get("action") === "new";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchCollection("/staff");
        if (!mounted) return;
        setStaff(data);
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err, "Unable to load staff."));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = ({ target: { name, value } }) => {
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createRecord("/staff", formState);
      setStaff(await fetchCollection("/staff"));
      setSubmitMessage("Staff member added successfully.");
      setSubmitError("");
      setFormState({ staff_name: "", role: "WARDEN", phone_no: "" });
      setSearchParams({});
    } catch (err) {
      setSubmitMessage("");
      setSubmitError(getErrorMessage(err, "Unable to save staff member."));
    }
  };

  if (loading) {
    return <p className="loading">Loading staff...</p>;
  }

  return (
    <EntityPage
      title="Staff"
      description="Manage wardens, supervisors, maintenance, and support teams."
      actionLabel="New Staff"
      isFormOpen={isFormOpen}
      onOpenForm={() => setSearchParams({ action: "new" })}
      onCloseForm={() => setSearchParams({})}
      formTitle="Add staff member"
      formDescription="Create a staff record for complaint routing and supervision."
      message={submitError || error || submitMessage}
      messageType={submitError || error ? "error" : "success"}
      formContent={
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="staff_name">Name</label>
              <input id="staff_name" name="staff_name" className="form-input" value={formState.staff_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="role">Role</label>
              <select id="role" name="role" className="form-select" value={formState.role} onChange={handleChange}>
                <option value="WARDEN">Warden</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="HOUSEKEEPING">Housekeeping</option>
                <option value="MESS">Mess</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone_no">Phone</label>
              <input id="phone_no" name="phone_no" className="form-input" value={formState.phone_no} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Staff</button>
          </div>
        </form>
      }
    >
      <Table columns={columns} data={staff} />
    </EntityPage>
  );
}

export default Staff;
