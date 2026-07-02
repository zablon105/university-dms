import { NavLink } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import {
  MdDashboard, MdPeople, MdFolder, MdShield,
  MdChecklist, MdUpload, MdArchive,
  MdMenuBook, MdAssignment, MdAccountBalance,
} from 'react-icons/md'

const adminItems = [
  { to: '/admin/dashboard', icon: MdDashboard, label: 'Home' },
  { to: '/admin/users', icon: MdPeople, label: 'Users' },
  { to: '/admin/documents', icon: MdFolder, label: 'Docs' },
  { to: '/admin/compliance', icon: MdShield, label: 'Compliance' },
]

const staffItems = [
  { to: '/staff/dashboard', icon: MdDashboard, label: 'Home' },
  { to: '/staff/approvals', icon: MdChecklist, label: 'Queue' },
  { to: '/staff/upload', icon: MdUpload, label: 'Upload' },
  { to: '/staff/archive', icon: MdArchive, label: 'Archive' },
]

const studentItems = [
  { to: '/student/dashboard', icon: MdDashboard, label: 'Home' },
  { to: '/student/academic', icon: MdMenuBook, label: 'Docs' },
  { to: '/student/assignments', icon: MdAssignment, label: 'Tasks' },
  { to: '/student/records', icon: MdAccountBalance, label: 'Records' },
]

export default function BottomNav() {
  const { user } = useAuthStore()

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
      boxShadow: '0 -2px 16px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        padding: '6px 0 max(6px, env(safe-area-inset-bottom))'
      }}>
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none', flex: 1 }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2,
                padding: '5px 4px',
                color: isActive ? 'var(--primary)' : 'var(--gray-400)',
                cursor: 'pointer', minHeight: 44,
                justifyContent: 'center',
                position: 'relative',
                transition: 'color 0.2s',
              }}>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 28, height: 2,
                    background: 'var(--primary)',
                    borderRadius: '0 0 2px 2px'
                  }} />
                )}
                <Icon size={20} />
                <span style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 10, fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.04em', textTransform: 'uppercase'
                }}>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bottom-nav { display: block !important; }
        }
      `}</style>
    </nav>
  )
}