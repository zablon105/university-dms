import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import {
  MdDashboard, MdPeople, MdFolder, MdShield, MdList,
  MdChecklist, MdArchive, MdUpload, MdBarChart,
  MdMenuBook, MdAssignment, MdAccountBalance, MdShare,
  MdSettings, MdHelp, MdLogout, MdClose, MdSchool,
  MdAdd
} from 'react-icons/md'

const adminNav = [
  { to: '/admin/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: MdPeople, label: 'User Management' },
  { to: '/admin/documents', icon: MdFolder, label: 'Storage' },
  { to: '/admin/compliance', icon: MdShield, label: 'Compliance' },
  { to: '/admin/logs', icon: MdList, label: 'Audit Logs' },
]

const staffNav = [
  { to: '/staff/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/staff/approvals', icon: MdChecklist, label: 'Approval Queue' },
  { to: '/staff/archive', icon: MdArchive, label: 'Archive' },
  { to: '/staff/upload', icon: MdUpload, label: 'Upload Document' },
  { to: '/staff/reports', icon: MdBarChart, label: 'Reports' },
]

const studentNav = [
  { to: '/student/dashboard', icon: MdDashboard, label: 'My Documents' },
  { to: '/student/academic', icon: MdMenuBook, label: 'Academic Documents' },
  { to: '/student/assignments', icon: MdAssignment, label: 'Assignments' },
  { to: '/student/records', icon: MdAccountBalance, label: 'Institutional Records' },
  { to: '/student/shared', icon: MdShare, label: 'Shared Files' },
]

const portalConfig = {
  admin: { label: 'Admin Central', sub: 'System Oversight', accent: '#f59e0b' },
  staff: { label: 'Staff Portal', sub: 'Administrative Unit', accent: '#22d3ee' },
  student: { label: 'Student Portal', sub: 'Kaimosi Friends University', accent: '#a78bfa' },
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'staff' ? staffNav : studentNav
  const cfg = portalConfig[user?.role] || portalConfig.student
  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : 'U'

  const handleLogout = async () => {
    try { await api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') }) } catch { }
    logout()
    navigate('/login')
    onClose?.()
  }

  const handleNavClick = () => onClose?.()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="mobile-backdrop"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 99, display: 'none', backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          background: '#0f172a',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0,
          zIndex: 100,
          boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Logo / Brand */}
        <div style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 6,
                background: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(26,86,219,0.4)'
              }}>
                <MdSchool style={{ color: 'white', fontSize: 18 }} />
              </div>
              <div>
                <div style={{ color: 'white', fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: '0.05em' }}>
                  DocLibrary
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '0.03em' }}>KAFU Institutional</div>
              </div>
            </div>

            {/* Portal badge */}
            <div style={{
              padding: '7px 10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 5,
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: 7
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.accent, flexShrink: 0, boxShadow: `0 0 6px ${cfg.accent}` }} />
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.04em' }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                  {cfg.sub}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 5, cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              padding: '4px 6px', display: 'none', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <MdClose size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontFamily: 'Oswald, sans-serif', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 8px 6px', marginBottom: 2 }}>
            Navigation
          </div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }} onClick={handleNavClick}>
              {({ isActive }) => (
                <div
                  className="sidebar-nav-item"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 5, marginBottom: 1,
                    background: isActive ? 'rgba(26,86,219,0.25)' : 'transparent',
                    color: isActive ? '#93c5fd' : 'rgba(255,255,255,0.6)',
                    fontFamily: 'Oswald, sans-serif',
                    fontWeight: isActive ? 500 : 400,
                    fontSize: 13.5, cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    minHeight: 42,
                    position: 'relative',
                  }}
                >
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                  {isActive && (
                    <div style={{
                      position: 'absolute', right: 8,
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#3b82f6',
                    }} />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Bottom */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {/* User info card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '9px 10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 8,
            cursor: 'pointer',
            transition: 'background 0.18s',
          }}
            onClick={() => { navigate('/settings'); onClose?.() }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: 'linear-gradient(135deg, #1a56db, #60a5fa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0
            }}>
              {user?.profile_picture
                ? <img src={user.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
                {user?.role} · {user?.department || 'KAFU'}
              </div>
            </div>
          </div>

          {user?.role === 'admin' && (
            <button
              style={{
                width: '100%', padding: '8px 12px',
                background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
                color: 'white', border: 'none', borderRadius: 5,
                fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 500,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', marginBottom: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(26,86,219,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,86,219,0.45)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,86,219,0.3)'}
              onClick={() => { navigate('/admin/dashboard'); onClose?.() }}
            >
              <MdAdd size={15} /> Generate Report
            </button>
          )}

          {[
            { icon: MdSettings, label: 'Settings', onClick: () => { navigate('/settings'); onClose?.() }, },
            { icon: MdHelp, label: 'Support', onClick: () => { window.location.href = 'mailto:support@kaimu.edu?subject=DocLibrary%20Support'; onClose?.() }, },
          ].map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 5, cursor: 'pointer',
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'Oswald, sans-serif', fontSize: 12.5,
                transition: 'all 0.18s', minHeight: 36
              }}
              onClick={item.onClick}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
            >
              <item.icon size={15} /> {item.label}
            </div>
          ))}

          <div
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 5, cursor: 'pointer',
              color: '#f87171', fontFamily: 'Oswald, sans-serif',
              fontSize: 12.5, transition: 'all 0.18s', minHeight: 36
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <MdLogout size={15} /> Sign Out
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-nav-item:hover {
          background: rgba(255,255,255,0.07) !important;
          color: rgba(255,255,255,0.9) !important;
        }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.sidebar-open { transform: translateX(0); }
          .mobile-backdrop { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}