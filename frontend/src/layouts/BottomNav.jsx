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
    <nav className="bnav">
      <div className="bnav-inner">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none', flex: 1 }}>
            {({ isActive }) => (
              <div className={`bnav-item ${isActive ? 'bnav-active' : ''}`}>
                {isActive && <div className="bnav-pip" />}
                <div className={`bnav-icon ${isActive ? 'bnav-icon-active' : ''}`}>
                  <Icon size={21} />
                </div>
                <span className="bnav-label">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>

      <style>{`
        .bnav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border-top: 1px solid rgba(255,255,255,0.2);
          z-index: 90;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.5);
          display: none;
          padding-bottom: max(4px, env(safe-area-inset-bottom));
        }
        .bnav-inner {
          display: flex; justify-content: space-around;
          padding: 6px 4px 0;
        }
        .bnav-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 4px 6px 7px; cursor: pointer;
          position: relative; min-height: 50px; justify-content: center;
          flex: 1; color: rgba(255,255,255,0.4);
          transition: color 0.18s;
        }
        .bnav-active { color: white; }

        /* Blue pip at top */
        .bnav-pip {
          position: absolute; top: 0; left: 50%;
          transform: translateX(-50%);
          width: 26px; height: 3px;
          background: white;
          border-radius: 0 0 4px 4px;
        }

        /* Icon pill */
        .bnav-icon {
          width: 38px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-md);
          transition: background 0.18s, transform 0.18s;
        }
        .bnav-icon-active {
          background: rgba(255,255,255,0.25);
          transform: scale(1.06);
        }
        .bnav-item:not(.bnav-active):active .bnav-icon {
          background: rgba(255,255,255,0.08);
          transform: scale(0.92);
        }

        /* Label */
        .bnav-label {
          font-family: var(--font-heading);
          font-size: 9.5px; font-weight: 500;
          letter-spacing: 0.05em; text-transform: uppercase; line-height: 1;
        }

        @media (max-width: 768px) { .bnav { display: block; } }
      `}</style>
    </nav>
  )
}