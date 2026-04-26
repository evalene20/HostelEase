import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { getProfile, getErrorMessage } from "../../services/authApi";

function Profile() {
  const { session, onLogout } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState({
    name: session?.username || "",
    number: "+91 90000 11111",
    email: "student@hostel.edu",
    emergencyContact: "+91 98765 43210",
    hostelName: "Not allocated yet",
    room: "Pending booking",
    warden: "Joseph (Warden)",
    college: session?.collegeName || "ABC Engineering College",
    maintenance: "Ravi Kumar (Maintenance)",
    registerNo: session?.registerNo || "",
    city: "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        if (data.role === "STUDENT") {
          setProfileData(prev => ({
            ...prev,
            name: data.full_name || prev.name,
            hostelName: data.hostel_name || prev.hostelName,
            room: data.room_no || prev.room,
            college: data.college_name || prev.college,
            registerNo: data.register_no || prev.registerNo,
            city: data.city || prev.city,
          }));
        }
        setError("");
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load profile."));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p className="loading">Loading settings...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <header className="section-header" style={{ marginBottom: '48px', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1 style={{ marginBottom: '8px' }}>Settings</h1>
        <p style={{ fontSize: '1.1rem' }}>Manage your account preferences and personal profile.</p>
      </header>

      {error ? <div className="badge badge-danger" style={{ marginBottom: '24px' }}>{error}</div> : null}

      <section className="card" style={{ marginBottom: '48px', background: '#f1ede8', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--primary)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            {session.username[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ marginBottom: '4px', fontSize: '1.5rem' }}>{session.username}</h2>
            <span className="badge badge-info">{session.role === 'admin' ? 'Administrator' : 'Student Account'}</span>
          </div>
        </div>
      </section>

      <form onSubmit={handleSave}>
        <section className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '32px', color: '#1A2634' }}>Personal Profile</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                name="name" 
                className="form-input" 
                value={profileData.name} 
                onChange={handleChange} 
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                name="number" 
                className="form-input" 
                value={profileData.number} 
                onChange={handleChange} 
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                name="email" 
                type="email"
                className="form-input" 
                value={profileData.email} 
                onChange={handleChange} 
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input 
                name="emergencyContact" 
                className="form-input" 
                value={profileData.emergencyContact} 
                onChange={handleChange} 
                placeholder="Emergency number"
              />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '32px', color: '#1A2634' }}>Hostel Allocation (Read-only)</h2>
          <p style={{ color: '#5a6b5c', marginBottom: '24px', fontSize: '0.9rem' }}>These fields are managed by the administration and cannot be changed.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Register Number</label>
              <input className="form-input" value={profileData.registerNo || "Not assigned"} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">College</label>
              <input className="form-input" value={profileData.college} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Hostel Name</label>
              <input className="form-input" value={profileData.hostelName} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Room Number</label>
              <input className="form-input" value={profileData.room} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Warden</label>
              <input className="form-input" value={profileData.warden} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Maintenance Contact</label>
              <input className="form-input" value={profileData.maintenance} disabled />
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
            {isSaved && <span className="badge badge-success">Settings saved successfully!</span>}
          </div>
          
          <button 
            type="button" 
            className="btn" 
            onClick={onLogout}
            style={{ 
              background: 'transparent', 
              color: '#ef4444', 
              border: '1px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>⏻</span> Logout from Portal
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
