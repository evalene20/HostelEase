import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Create booking",
    description: "Reserve a room for a student and capture the booking date.",
    to: "/admin/bookings?action=new",
  },
  {
    title: "Register student",
    description: "Add a student profile before assigning rooms or taking payments.",
    to: "/admin/students?action=new",
  },
  {
    title: "Log complaint",
    description: "Record hostel issues quickly so staff can respond faster.",
    to: "/admin/complaints?action=new",
  },
  {
    title: "Record payment",
    description: "Add a payment entry and track its settlement status.",
    to: "/admin/payments?action=new",
  },
];

function AdminHome() {
  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <section style={{ 
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '80px 48px',
        borderRadius: '24px',
        color: 'white',
        marginBottom: '60px',
        boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <span style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '6px 16px', 
            borderRadius: '20px', 
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '24px',
            display: 'inline-block'
          }}>HostelEase Administrator Portal</span>
          <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '24px', lineHeight: '1.2' }}>
            Manage your daily hostel operations with ease.
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: '0.9', marginBottom: '40px' }}>
            A unified platform for student onboarding, room allocation, issue tracking, and financial monitoring.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/admin/dashboard" className="btn btn-outline" style={{ background: 'white', border: 'none' }}>
              Launch Dashboard
            </Link>
            <Link to="/admin/bookings?action=new" className="btn" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.4)' }}>
              Quick Booking
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <h2>Quick Actions</h2>
          <p style={{ color: '#64748b' }}>Start a task and jump straight into record entry.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {quickActions.map((action) => (
            <Link key={action.title} to={action.to} className="card" style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              transition: 'transform 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span style={{ color: '#4f46e5', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Shortcut</span>
              <h3 style={{ marginBottom: '8px' }}>{action.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminHome;
