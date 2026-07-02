import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

const adminNav = [
  { to: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/admin/users', icon: '👥', label: 'User Management' },
  { to: '/admin/documents', icon: '🗄️', label: 'Storage' },
  { to: '/admin/compliance', icon: '🛡️', label: 'Compliance' },
  { to: '/admin/logs', icon: '📋', label: 'Logs' },
]

const staffNav = [
  { to: '/staff/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/staff/approvals', icon: '✅', label: 'Approval Queue' },
  { to: '/staff/archive', icon: '🗄️', label: 'Archive' },
  { to: '/staff/upload', icon: '📤', label: 'Upload Document' },
  { to: '/staff/reports', icon: '📊', label: 'Reports' },
]

const studentNav = [
  { to: '/student/dashboard', icon: '🏠', label: 'My Documents' },
  { to: '/student/academic', icon: '📚', label: 'Academic Documents' },
  { to: '/student/assignments', icon: '📝', label: 'Assignments' },
  { to: '/student/records', icon: '🏛️', label: 'Institutional Records' },
  { to: '/student/shared', icon: '🤝', label: 'Shared Files' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const navItems =
    user?.role === 'admin' ? adminNav :
    user?.role === 'staff' ? staffNav :
    studentNav

  const portalLabel =
    user?.role === 'admin' ? 'Admin Central' :
    user?.role === 'staff' ? 'Staff Portal' :
    'Student Portal'

  const portalSub =
    user?.role === 'admin' ? 'System Oversight' :
    user?.role === 'staff' ? 'Administrative Unit' :
    'Kaimosi Friends University'

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/', {
        refresh: localStorage.getItem('refresh_token')
      })
    } catch {}
    logout()
    navigate('/login')
    onClose?.()
  }

  const handleNavClick = () => {
    onClose?.() // close drawer on mobile after clicking
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
            display: 'none'
          }}
          className="mobile-backdrop"
        />
      )}

      <aside style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.3s ease',
      }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16
              }}>🎓</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
                DocLibrary
              </div>
            </div>
            <div style={{
              padding: '8px 10px',
              background: 'var(--primary-light)',
              borderRadius: 8
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                {portalLabel}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>
                {portalSub}
              </div>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none', border: 'none',
              fontSize: 20, cursor: 'pointer',
              color: 'var(--gray-500)', padding: 4,
              display: 'none'
            }}
          >✕</button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }} onClick={handleNavClick}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 12px', borderRadius: 8, marginBottom: 2,
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--gray-600)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minHeight: 44  // touch friendly
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--gray-100)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                  <span>{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <button style={{
            width: '100%', padding: '10px',
            background: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: 8, fontSize: 13,
            fontWeight: 600, cursor: 'pointer', marginBottom: 8,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6,
            minHeight: 44
          }}>
            📊 Generate Report
          </button>

          {[
            { icon: '⚙️', label: 'Settings' },
            { icon: '❓', label: 'Support' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 10px', borderRadius: 8, cursor: 'pointer',
              color: 'var(--gray-600)', fontSize: 13, minHeight: 44
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.icon} {item.label}
            </div>
          ))}

          <div onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 10px', borderRadius: 8, cursor: 'pointer',
            color: 'var(--danger)', fontSize: 13, minHeight: 44
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            🚪 Logout
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .mobile-backdrop {
            display: block !important;
          }
          .sidebar-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  )
}