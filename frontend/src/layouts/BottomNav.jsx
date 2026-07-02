import { NavLink } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function BottomNav() {
  const { user } = useAuthStore()

  const adminItems = [
    { to: '/admin/dashboard', icon: '🏠', label: 'Home' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/documents', icon: '📁', label: 'Docs' },
    { to: '/admin/compliance', icon: '🛡️', label: 'Compliance' },
  ]

  const staffItems = [
    { to: '/staff/dashboard', icon: '🏠', label: 'Home' },
    { to: '/staff/approvals', icon: '✅', label: 'Queue' },
    { to: '/staff/upload', icon: '📤', label: 'Upload' },
    { to: '/staff/archive', icon: '🗄️', label: 'Archive' },
  ]

  const studentItems = [
    { to: '/student/dashboard', icon: '🏠', label: 'Home' },
    { to: '/student/academic', icon: '📚', label: 'Docs' },
    { to: '/student/assignments', icon: '📝', label: 'Tasks' },
    { to: '/student/records', icon: '🏛️', label: 'Records' },
  ]

  const items =
    user?.role === 'admin' ? adminItems :
    user?.role === 'staff' ? staffItems :
    studentItems

  return (
    <nav className="bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white',
      borderTop: '1px solid var(--border)',
      display: 'none',
      zIndex: 90,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))'
      }}>
        {items.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none', flex: 1 }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3,
                padding: '6px 4px',
                color: isActive ? 'var(--primary)' : 'var(--gray-400)',
                cursor: 'pointer',
                minHeight: 44,
                justifyContent: 'center'
              }}>
                <span style={{
                  fontSize: 20,
                  filter: isActive ? 'none' : 'grayscale(100%)',
                  transition: 'all 0.2s'
                }}>{icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 700 : 400,
                  letterSpacing: '0.2px'
                }}>{label}</span>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0,
                    width: 32, height: 3,
                    background: 'var(--primary)',
                    borderRadius: '0 0 3px 3px'
                  }} />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bottom-nav {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  )
}