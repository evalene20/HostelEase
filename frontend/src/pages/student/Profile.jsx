import { useOutletContext } from "react-router-dom";
import useHostelData from "../../hooks/useHostelData";
import { getStudentRecord } from "../../utils/dashboardInsights";

const profileExtras = {
  default: {
    phone: "+91 90000 11111",
    email: "student@hostel.edu",
    emergencyContact: "Parent / +91 98765 43210",
  },
};

function Profile() {
  const { session } = useOutletContext();
  const { data, loading, error } = useHostelData(["students"]);

  if (loading) {
    return <p className="loading">Loading profile...</p>;
  }

  const student = getStudentRecord(data.students, session.studentId);
  const extras = profileExtras.default;

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Profile</p>
          <h1 className="page-title">Student profile and identity</h1>
          <p className="page-description">
            Personal details, contact information, emergency support, and hostel allocation.
          </p>
        </div>
      </section>
      {error ? <div className="message message-error">{error}</div> : null}
      <section className="card">
        <div className="detail-grid">
          <div><span>Full name</span><strong>{student?.full_name || session.username}</strong></div>
          <div><span>Register number</span><strong>{student?.register_no || "--"}</strong></div>
          <div><span>College</span><strong>{student?.college_name || "--"}</strong></div>
          <div><span>Phone</span><strong>{extras.phone}</strong></div>
          <div><span>Email</span><strong>{extras.email}</strong></div>
          <div><span>Emergency contact</span><strong>{extras.emergencyContact}</strong></div>
          <div><span>Hostel</span><strong>{student?.hostel_name || "Not allocated yet"}</strong></div>
          <div><span>Room</span><strong>{student?.room_no || "Pending booking"}</strong></div>
          <div><span>Warden</span><strong>Resident Warden / +91 90000 22222</strong></div>
          <div><span>Maintenance</span><strong>Maintenance Desk / +91 90000 33333</strong></div>
          <div><span>Emergency</span><strong>Hostel Help Desk / 112</strong></div>
        </div>
      </section>
    </div>
  );
}

export default Profile;
