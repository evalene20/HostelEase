import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import useHostelData from "../../hooks/useHostelData";
import { getStudentRecord } from "../../utils/dashboardInsights";

function Mess() {
  const { session } = useOutletContext();
  const { data, loading, error } = useHostelData(["students", "mess"]);

  const student = useMemo(
    () => getStudentRecord(data.students, session.studentId),
    [data.students, session.studentId]
  );
  const menuRows = useMemo(() => {
    if (!student?.hostel_name) {
      return data.mess;
    }

    return data.mess.filter((item) => item.hostel_name === student.hostel_name);
  }, [data.mess, student]);

  if (loading) {
    return <p className="loading">Loading mess details...</p>;
  }

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Mess & Food</p>
          <h1 className="page-title">Weekly menu and meal timings</h1>
          <p className="page-description">
            View the current mess schedule and meal windows for your hostel.
          </p>
        </div>
      </section>
      {error ? <div className="message message-error">{error}</div> : null}

      <section className="card">
        <div className="detail-grid">
          <div><span>Breakfast</span><strong>7:30 AM - 9:00 AM</strong></div>
          <div><span>Lunch</span><strong>12:30 PM - 2:00 PM</strong></div>
          <div><span>Dinner</span><strong>7:30 PM - 9:00 PM</strong></div>
          <div><span>Feedback</span><strong>Optional feedback window enabled</strong></div>
        </div>
      </section>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Weekly menu</h2></div>
        <div className="list-stack">
          {menuRows.length ? menuRows.map((item, index) => (
            <div key={`${item.day_of_week}-${item.meal_type}-${index}`} className="list-row">
              {item.day_of_week} / {item.meal_type} / {item.items}
            </div>
          )) : <div className="table-empty">No menu data available.</div>}
        </div>
      </section>
    </div>
  );
}

export default Mess;
