import { useState } from "react";

function Login({ onLogin }) {
  const [formState, setFormState] = useState({
    role: "admin",
    username: "",
    password: "",
    studentId: "1",
  });
  const [error, setError] = useState("");

  const handleChange = ({ target: { name, value } }) => {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formState.username.trim() || !formState.password.trim()) {
      setError("Enter username and password to continue.");
      return;
    }

    setError("");
    onLogin({
      role: formState.role,
      username: formState.username.trim(),
      studentId: Number(formState.studentId) || 1,
    });
  };

  return (
    <div className="login-page">
      <section className="login-card">
        <div className="login-copy">
          <p className="eyebrow">Access Portal</p>
          <h1 className="login-title">Hostel Management System</h1>
        </div>

        {error ? <div className="message message-error">{error}</div> : null}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="role-switch">
            <button
              type="button"
              className={`role-chip ${formState.role === "admin" ? "active" : ""}`}
              onClick={() => setFormState((current) => ({ ...current, role: "admin" }))}
            >
              Admin
            </button>
            <button
              type="button"
              className={`role-chip ${formState.role === "student" ? "active" : ""}`}
              onClick={() => setFormState((current) => ({ ...current, role: "student" }))}
            >
              Student
            </button>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input id="username" name="username" className="form-input" value={formState.username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="form-input" value={formState.password} onChange={handleChange} required />
          </div>

          {formState.role === "student" ? (
            <div className="form-group">
              <label className="form-label" htmlFor="studentId">Student ID</label>
              <input id="studentId" name="studentId" type="number" min="1" className="form-input" value={formState.studentId} onChange={handleChange} />
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </section>
    </div>
  );
}

export default Login;
