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

export default function Sidebar() {
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

  const handleGenerateReport = () => {
    if (user?.role === 'admin') return navigate('/admin/documents')
    if (user?.role === 'staff') return navigate('/staff/upload')
    return navigate('/student/academic')
  }

  const handleOpenSettings = () => {
    navigate('/settings')
  }

  const handleOpenSupport = () => {
    window.location.href = 'mailto:support@kaimu.edu?subject=KAFU%20Portal%20Support'
  }

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
  }

  return (
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
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 16
          }}>🎓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
              DocLibrary
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 8, padding: '8px 10px',
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

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--gray-600)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14, cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--gray-100)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        {/* Settings */}
        <div onClick={handleOpenSettings} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
          color: 'var(--gray-600)', fontSize: 13,
          marginBottom: 2
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ⚙️ Settings
        </div>

        {/* Support */}
        <div onClick={handleOpenSupport} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
          color: 'var(--gray-600)', fontSize: 13,
          marginBottom: 2
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ❓ Support
        </div>

        {/* Logout */}
        <div
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
            color: 'var(--danger)', fontSize: 13
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          🚪 Logout
        </div>
      </div>
    </aside>
  )
}