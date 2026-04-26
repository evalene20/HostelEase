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
      setError("Please enter both username and password.");
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '48px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: '16px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
          }}>HE</div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Welcome back</h1>
          <p style={{ color: '#64748b' }}>Access the HostelEase portal</p>
        </div>

        {error ? (
          <div className="badge badge-danger" style={{
            display: 'block',
            padding: '12px',
            marginBottom: '24px',
            textAlign: 'center',
            borderRadius: '8px',
            textTransform: 'none'
          }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '32px'
          }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                background: formState.role === "admin" ? 'white' : 'transparent',
                color: formState.role === "admin" ? '#4f46e5' : '#64748b',
                boxShadow: formState.role === "admin" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
              onClick={() => setFormState((current) => ({ ...current, role: "admin" }))}
            >
              Administrator
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                background: formState.role === "student" ? 'white' : 'transparent',
                color: formState.role === "student" ? '#4f46e5' : '#64748b',
                boxShadow: formState.role === "student" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
              onClick={() => setFormState((current) => ({ ...current, role: "student" }))}
            >
              Student
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Username</label>
            <input
              name="username"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              value={formState.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Password</label>
            <input
              name="password"
              type="password"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                outline: 'none'
              }}
              value={formState.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {formState.role === "student" ? (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Student ID</label>
              <input
                name="studentId"
                type="number"
                min="1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
                value={formState.studentId}
                onChange={handleChange}
              />
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
