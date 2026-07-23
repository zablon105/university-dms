import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useToast from '../hooks/useToast'
import api from '../api/axios'
import {
  MdDashboard, MdPeople, MdFolder, MdShield, MdList,
  MdChecklist, MdArchive, MdUpload, MdBarChart,
  MdMenuBook, MdAssignment, MdAccountBalance, MdShare,
  MdSettings, MdHelp, MdLogout, MdClose, MdSchool,
  MdAdd, MdChevronRight,
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
  { to: '/staff/requests', icon: MdAssignment, label: 'Document Requests' },
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
  admin: { label: 'Admin Central', sub: 'System Oversight', accent: '#fbbf24' },
  staff: { label: 'Staff Portal', sub: 'Administrative Unit', accent: '#34d399' },
  student: { label: 'Student Portal', sub: 'Kaimosi Friends University', accent: '#a78bfa' },
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [loggingOut, setLoggingOut] = useState(false)

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'staff' ? staffNav : studentNav
  const cfg = portalConfig[user?.role] || portalConfig.student
  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : 'U'

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') }) } catch { }
    toast.success('Signed out successfully')
    setTimeout(() => { logout(); navigate('/login'); onClose?.() }, 900)
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="mobile-backdrop"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, display: 'none', backdropFilter: 'blur(3px)' }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>

        {/* ── Brand header ── */}
        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-logo"><MdSchool style={{ color: 'white', fontSize: 18 }} /></div>
            <div>
              <div className="sb-app-name">DocLibrary</div>
              <div className="sb-app-sub">KAFU Institutional</div>
            </div>
          </div>
          <button onClick={onClose} className="sidebar-close-btn" aria-label="Close sidebar">
            <MdClose size={15} />
          </button>
        </div>

        {/* ── Portal badge ── */}
        <div className="sb-portal-badge">
          <div className="sb-portal-dot" style={{ background: cfg.accent, boxShadow: `0 0 7px ${cfg.accent}` }} />
          <div>
            <div className="sb-portal-label">{cfg.label}</div>
            <div className="sb-portal-sub">{cfg.sub}</div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="sb-nav">
          <div className="sb-nav-group-title">Main Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }} onClick={() => onClose?.()}>
              {({ isActive }) => (
                <div className={`sb-nav-item ${isActive ? 'sb-nav-active' : ''}`}>
                  <div className="sb-nav-icon"><Icon size={17} /></div>
                  <span className="sb-nav-label">{label}</span>
                  {isActive && <MdChevronRight size={14} className="sb-nav-chevron" />}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="sb-footer">

          {user?.role === 'admin' && (
            <button className="sb-action-btn" onClick={() => { navigate('/admin/dashboard'); onClose?.() }}>
              <MdAdd size={15} /> Generate Report
            </button>
          )}

          {/* User info card */}
          <div
            className="sb-user-card"
            onClick={() => { navigate('/settings'); onClose?.() }}
            role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && (navigate('/settings'), onClose?.())}
          >
            <div className="sb-user-avatar">
              {user?.profile_picture
                ? <img src={user.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                : initials}
            </div>
            <div className="sb-user-info">
              <div className="sb-user-name">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</div>
              <div className="sb-user-role">{user?.role} · {user?.department || 'KAFU'}</div>
            </div>
            <MdChevronRight size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          </div>

          {/* Util row */}
          <div className="sb-util-row">
            {[
              { icon: MdSettings, label: 'Settings', onClick: () => { navigate('/settings'); onClose?.() } },
              { icon: MdHelp, label: 'Support', onClick: () => { window.location.href = 'mailto:support@kafu.ac.ke'; onClose?.() } },
            ].map(item => (
              <button key={item.label} className="sb-util-btn" onClick={item.onClick}>
                <item.icon size={14} /> <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Logout */}
          <button className="sb-logout-btn" onClick={handleLogout} disabled={loggingOut}>
            <MdLogout size={15} />
            <span>{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
          </button>

          {/* Status bar */}
          <div className="sb-status">
            <div className="sb-status-dot" />
            <span className="sb-status-text">All systems operational</span>
          </div>
        </div>
      </aside>

      <style>{`
        /* ═══ SIDEBAR — RICH BLUE THEME ═════════════════════════ */
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          background: linear-gradient(180deg, #050d1f 0%, #0d1b3e 40%, #0a1832 100%);
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; z-index: 100;
          box-shadow: 4px 0 32px rgba(0,0,0,0.5);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }

        /* Header */
        .sb-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 14px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          flex-shrink: 0;
        }
        .sb-brand { display: flex; align-items: center; gap: 9px; }
        .sb-logo {
          width: 34px; height: 34px; border-radius: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(59,130,246,0.5); flex-shrink: 0;
        }
        .sb-app-name {
          font-family: var(--font-heading);
          font-size: 15px; font-weight: 700; color: white;
          letter-spacing: 0.05em;
        }
        .sb-app-sub { font-size: 10px; color: rgba(255,255,255,0.35); margin-top: 1px; }

        .sidebar-close-btn {
          display: none; align-items: center; justify-content: center;
          width: 26px; height: 26px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 5px; cursor: pointer;
          color: rgba(255,255,255,0.6); transition: var(--transition-fast);
        }
        .sidebar-close-btn:hover { background: rgba(255,255,255,0.16); color: white; }

        /* Portal badge */
        .sb-portal-badge {
          display: flex; align-items: center; gap: 8px;
          margin: 10px 12px;
          padding: 9px 11px;
          background: rgba(59,130,246,0.12);
          border-radius: 7px;
          border: 1px solid rgba(59,130,246,0.25);
          flex-shrink: 0;
        }
        .sb-portal-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .sb-portal-label {
          font-family: var(--font-heading);
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.92); letter-spacing: 0.04em;
        }
        .sb-portal-sub { font-size: 10px; color: rgba(255,255,255,0.38); margin-top: 1px; }

        /* Navigation */
        .sb-nav { flex: 1; padding: 6px 10px 4px; overflow-y: auto; }
        .sb-nav-group-title {
          font-family: var(--font-heading);
          font-size: 9.5px; font-weight: 700;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 8px 8px 6px; margin-bottom: 2px;
        }
        .sb-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 7px; margin-bottom: 2px;
          color: rgba(255,255,255,0.55);
          font-family: var(--font-heading); font-size: 13px; font-weight: 400;
          cursor: pointer;
          transition: all 0.18s ease;
          border-left: 3px solid transparent;
          min-height: 42px;
          letter-spacing: 0.02em;
        }
        .sb-nav-item:hover {
          background: rgba(59,130,246,0.18) !important;
          color: #93c5fd !important;
          transform: translateX(2px);
          border-left-color: rgba(59,130,246,0.4) !important;
        }
        .sb-nav-active {
          background: rgba(59,130,246,0.25) !important;
          color: #bfdbfe !important;
          font-weight: 600;
          border-left-color: #60a5fa !important;
        }
        .sb-nav-icon { display: flex; align-items: center; flex-shrink: 0; width: 18px; }
        .sb-nav-label { flex: 1; }
        .sb-nav-chevron { color: rgba(147,197,253,0.6); flex-shrink: 0; }

        /* Footer */
        .sb-footer {
          padding: 10px 12px;
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,0,0,0.15);
          display: flex; flex-direction: column; gap: 5px; flex-shrink: 0;
        }

        /* Admin action btn */
        .sb-action-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%; padding: 8px 12px;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white; border: none; border-radius: 6px;
          font-family: var(--font-heading); font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(37,99,235,0.4);
          transition: var(--transition); margin-bottom: 3px;
        }
        .sb-action-btn:hover { box-shadow: 0 4px 16px rgba(37,99,235,0.6); transform: translateY(-1px); }

        /* User info card */
        .sb-user-card {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 10px;
          background: rgba(59,130,246,0.1);
          border-radius: 7px;
          border: 1px solid rgba(59,130,246,0.2);
          cursor: pointer; transition: background 0.18s;
        }
        .sb-user-card:hover { background: rgba(59,130,246,0.2); }
        .sb-user-avatar {
          width: 32px; height: 32px; border-radius: 6px;
          background: linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%);
          display: flex; align-items: center; justify-content: center;
          color: #0d1b3e; font-size: 12px; font-weight: 800;
          flex-shrink: 0; overflow: hidden;
        }
        .sb-user-info { flex: 1; min-width: 0; }
        .sb-user-name {
          font-family: var(--font-heading); font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.92); letter-spacing: 0.02em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-user-role { font-size: 10px; color: rgba(255,255,255,0.42); text-transform: capitalize; }

        /* Util row */
        .sb-util-row { display: flex; gap: 4px; }
        .sb-util-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 7px 8px;
          background: transparent;
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 5px;
          color: rgba(255,255,255,0.45);
          font-family: var(--font-body); font-size: 11px;
          cursor: pointer; transition: all 0.18s;
        }
        .sb-util-btn:hover {
          background: rgba(59,130,246,0.15);
          color: #93c5fd;
          border-color: rgba(59,130,246,0.4);
        }

        /* Logout */
        .sb-logout-btn {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 8px 10px;
          background: transparent;
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 5px; color: #f87171;
          font-family: var(--font-body); font-size: 12.5px; font-weight: 500;
          cursor: pointer; transition: all 0.18s;
        }
        .sb-logout-btn:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.4);
          color: #ef4444;
        }
        .sb-logout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Status bar */
        .sb-status { display: flex; align-items: center; gap: 6px; padding: 4px 2px 0; }
        .sb-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #34d399; box-shadow: 0 0 5px #34d399;
          flex-shrink: 0;
          animation: sb-pulse 2.5s ease-in-out infinite;
        }
        @keyframes sb-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 5px #34d399; }
          50%       { opacity: 0.55; box-shadow: 0 0 12px #34d399; }
        }
        .sb-status-text { font-size: 10px; color: rgba(255,255,255,0.28); font-family: var(--font-body); }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.sidebar-open { transform: translateX(0); }
          .sidebar-close-btn { display: flex !important; }
          .mobile-backdrop { display: block !important; }
        }
      `}</style>
    </>
  )
}