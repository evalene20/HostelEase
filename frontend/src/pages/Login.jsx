import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    username: "",
    password: "",
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

    onLogin(formState.username.trim());
    navigate("/home", { replace: true });
  };

  return (
    <div className="login-page">
      <section className="login-card">
        <div className="login-copy">
          <p className="eyebrow">Welcome Back</p>
          <h1 className="login-title">Login to Smart Hostel Management</h1>
          <p className="login-description">
            Sign in first, then you will land on the home page and can move to the
            dashboard from the top navigation.
          </p>
        </div>

        {error ? <div className="message message-error">{error}</div> : null}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              className="form-input"
              value={formState.username}
              onChange={handleChange}
              placeholder="admin"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={formState.password}
              onChange={handleChange}
              placeholder="password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
      </section>
    </div>
  );
}

export default Login;
