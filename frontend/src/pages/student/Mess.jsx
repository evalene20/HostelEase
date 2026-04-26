import { useMemo } from "react";
import useStudentData from "../../hooks/useStudentData";
import { fetchCollection } from "../../services/authApi";
import { useState, useEffect } from "react";

function Mess() {
  const { data, loading, error } = useStudentData();
  const [messData, setMessData] = useState([]);
  const [messLoading, setMessLoading] = useState(true);

  useEffect(() => {
    const loadMess = async () => {
      try {
        const mess = await fetchCollection("/mess");
        setMessData(mess || []);
      } catch {
        setMessData([]);
      } finally {
        setMessLoading(false);
      }
    };
    loadMess();
  }, []);

  const student = data.profile;
  const menuRows = useMemo(() => {
    if (!student?.hostel_name) {
      return messData;
    }
    return messData.filter((item) => item.hostel_name === student.hostel_name);
  }, [messData, student]);

  const isLoading = loading || messLoading;

  if (isLoading) {
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
