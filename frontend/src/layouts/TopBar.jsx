import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useToast from '../hooks/useToast'
import api from '../api/axios'
import ProfileImageModal from '../components/ProfileImageModal'
import {
  MdMenu, MdSearch, MdNotifications, MdKeyboardArrowDown,
  MdLightMode, MdDarkMode,
  MdSettings, MdLogout, MdPerson, MdClose, MdInfoOutline,
  MdCheckCircleOutline, MdWarningAmber,
} from 'react-icons/md'

function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function mapNotification(n) {
  const msg = n.message.toLowerCase()
  const type = msg.includes('rejected') ? 'warning' : msg.includes('approved') ? 'success' : 'info'
  const title = n.link?.includes('/admin/users') ? 'New Registration'
    : n.link?.includes('/staff/approvals') ? 'Document Submitted'
    : n.link?.includes('/login') ? 'Account Approved'
    : 'Document Update'
  return {
    id: n.id,
    type,
    read: n.is_read,
    title,
    body: n.message,
    time: formatRelativeTime(n.created_at),
    link: n.link
  }
}

const notifIcon = { info: <MdInfoOutline size={14} />, success: <MdCheckCircleOutline size={14} />, warning: <MdWarningAmber size={14} /> }
const notifColor = {
  info: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  success: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  warning: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
}

export default function TopBar({ searchPlaceholder, onMenuClick }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const toast = useToast()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [searchVal, setSearchVal] = useState('')
  const [activeImage, setActiveImage] = useState(null)

  const notifRef = useRef(null)
  const userRef = useRef(null)
  const unread = notifications.filter(n => !n.read).length

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    try { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme) } catch (e) {}
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))
  const openImageViewer = (src) => setActiveImage(src)
  const closeImageViewer = () => setActiveImage(null)

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/')
        setNotifications((res.data || []).map(mapNotification))
      } catch (err) {
        console.error('Failed to load notifications', err)
      }
    }
    fetchNotifications()
  }, [])

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : 'U'

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/')
      setNotifications(ns => ns.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (err) {
      console.error('Failed to mark all notifications as read', err)
    }
  }

  const handleMarkRead = async (id, link) => {
    const existing = notifications.find(n => n.id === id)
    if (existing?.read) {
      if (link) {
        navigate(link)
        setNotifOpen(false)
      }
      return
    }

    try {
      await api.post(`/notifications/${id}/read/`)
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }

    if (link) {
      navigate(link)
      setNotifOpen(false)
    }
  }

  const handleLogout = async () => {
    setUserMenuOpen(false)
    try { await api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') }) } catch { }
    toast.success('Signed out successfully')
    setTimeout(() => { logout(); navigate('/login') }, 900)
  }

  return (
    <header className="topbar animate-fade-in-down">

      {/* Hamburger — mobile only */}
      <button id="hamburger-btn" onClick={onMenuClick} className="hamburger-btn tb-icon-btn" aria-label="Open navigation">
        <MdMenu size={20} />
      </button>

      {/* Brand pill — mobile only */}
      <div className="tb-brand-mobile">
        <span className="tb-brand-text">DocLibrary</span>
      </div>

      {/* Search */}
      <div className="tb-search-wrap">
        <MdSearch className="tb-search-icon" />
        <input
          className="tb-search-input"
          placeholder={searchPlaceholder || 'Search documents, users…'}
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && setSearchVal('')}
        />
        {searchVal && (
          <button className="tb-search-clear" onClick={() => setSearchVal('')} aria-label="Clear">
            <MdClose size={13} />
          </button>
        )}
      </div>

      <div className="tb-spacer" />

      {/* Date */}
      <div className="tb-date">{today}</div>

      {/* Right actions */}
      <div className="tb-actions">

        {/* Theme toggle */}
        <button
          className="tb-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <MdDarkMode size={19} /> : <MdLightMode size={19} />}
        </button>

        {/* Notification bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="tb-icon-btn" onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false) }} aria-label="Notifications">
            <MdNotifications size={19} />
            {unread > 0 && <span className="tb-badge">{unread}</span>}
          </button>

          {notifOpen && (
            <div className="tb-dropdown notif-dd animate-scale-in">
              <div className="dd-head">
                <span className="dd-title">Notifications</span>
                {unread > 0 && <button className="dd-mark-btn" onClick={handleMarkAllRead}>Mark all read</button>}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet.</div>
                ) : notifications.map(n => {
                  const c = notifColor[n.type]
                  return (
                    <div key={n.id} className={`notif-item ${n.read ? 'notif-read' : ''}`} onClick={() => handleMarkRead(n.id, n.link)}>
                      <div className="notif-icon" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                        {notifIcon[n.type]}
                      </div>
                      <div className="notif-body">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-text">{n.body}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                      {!n.read && <div className="notif-dot" />}
                    </div>
                  )
                })}
              </div>
              <div className="dd-foot">
                <button className="dd-foot-btn" onClick={() => { setNotifOpen(false); navigate('/notifications') }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        <div className="tb-divider" />

        {/* User menu */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button className="tb-user-btn" onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false) }} aria-label="User menu">
            <div className="tb-avatar">
              {user?.profile_picture
                ? <img
                    src={user.profile_picture}
                    alt="Profile"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      openImageViewer(user.profile_picture)
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  />
                : initials}
            </div>
            <div className="tb-user-info user-info-text">
              <span className="tb-user-name">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</span>
              <span className="tb-user-role">{user?.role} · {user?.department || 'KAFU'}</span>
            </div>
            <MdKeyboardArrowDown size={15} className={`user-info-text tb-chevron ${userMenuOpen ? 'tb-chevron-open' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="tb-dropdown user-dd animate-scale-in">
              <div className="dd-user-head">
                <div className="dd-user-avatar">{initials}</div>
                <div>
                  <div className="dd-user-name">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</div>
                  <div className="dd-user-email">{user?.email || (user?.role + '@kafu.ac.ke')}</div>
                </div>
              </div>
              <div className="dd-sep" />
              <button className="dd-item" onClick={() => { navigate('/settings'); setUserMenuOpen(false) }}><MdPerson size={15} /> Profile & Settings</button>
              <button className="dd-item" onClick={() => { navigate('/settings'); setUserMenuOpen(false) }}><MdSettings size={15} /> Preferences</button>
              <div className="dd-sep" />
              <button className="dd-item dd-item-danger" onClick={handleLogout}><MdLogout size={15} /> Sign Out</button>
            </div>
          )}
        </div>
      </div>

      <ProfileImageModal isOpen={!!activeImage} imageSrc={activeImage} onClose={closeImageViewer} />

      <style>{`
        /* ═══ TOPBAR — SKY BLUE THEME ═══════════════════════════════ */
        .topbar {
          height: var(--topbar-height);
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border-bottom: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center;
          padding: 0 20px; gap: 12px;
          position: sticky; top: 0; z-index: 50;
          box-shadow: 0 2px 16px rgba(2,132,199,0.25), 0 1px 4px rgba(2,132,199,0.15);
        }

        /* Icon buttons */
        .tb-icon-btn {
          position: relative;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: var(--radius-md);
          cursor: pointer; color: rgba(255,255,255,0.85);
          transition: var(--transition); flex-shrink: 0;
        }
        .tb-icon-btn:hover {
          background: rgba(255,255,255,0.2);
          color: white;
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        /* Badge */
        .tb-badge {
          position: absolute; top: -4px; right: -4px;
          min-width: 17px; height: 17px;
          background: #f87171; color: white;
          border-radius: 10px; font-size: 0.6rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #0284c7; padding: 0 3px;
          font-family: var(--font-body);
        }

        /* Search */
        .tb-search-wrap {
          position: relative; flex: 1; max-width: 630px;
        }
        .tb-search-icon {
          position: absolute; left: 11px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.45); font-size: 17px; pointer-events: none;
        }
        .tb-search-input {
          width: 100%;
          padding: 9px 34px 9px 36px;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: var(--radius-md);
          font-size: 0.845rem;
          background: rgba(255,255,255,0.1);
          color: white;
          transition: var(--transition);
          font-family: var(--font-body);
        }
        .tb-search-input::placeholder { color: rgba(255,255,255,0.4); }
        .tb-search-input:focus {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.18);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.1);
          outline: none;
        }
        .tb-search-clear {
          position: absolute; right: 9px; top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.2);
          border: none; border-radius: 50%;
          width: 18px; height: 18px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.8);
          transition: var(--transition-fast); padding: 0;
        }
        .tb-search-clear:hover { background: rgba(255,255,255,0.35); }

        /* Spacer / date */
        .tb-spacer { flex: 1; }
        .tb-date {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
          font-family: var(--font-heading);
          letter-spacing: 0.04em;
        }

        /* Actions row */
        .tb-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .tb-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.18); margin: 0 4px; }

        /* User button */
        .tb-user-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 10px 5px 5px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          cursor: pointer; transition: var(--transition);
        }
        .tb-user-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
        }
        .tb-avatar {
          width: 32px; height: 32px;
          border-radius: var(--radius-md);
          background: white;
          display: flex; align-items: center; justify-content: center;
          color: #0284c7; font-size: 14px; font-weight: 800;
          flex-shrink: 0; overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .tb-user-info { display: flex; flex-direction: column; text-align: left; }
        .tb-user-name {
          font-family: var(--font-heading);
          font-size: 13px; font-weight: 600;
          color: white; white-space: nowrap; letter-spacing: 0.03em;
        }
        .tb-user-role {
          font-size: 10px; color: rgba(255,255,255,0.55);
          text-transform: capitalize; white-space: nowrap;
        }
        .tb-chevron { color: rgba(255,255,255,0.5); transition: transform 0.2s; }
        .tb-chevron-open { transform: rotate(180deg); }

        /* Mobile brand */
        .tb-brand-mobile { display: none; align-items: center; flex-shrink: 0; }
        .tb-brand-text {
          font-family: var(--font-heading);
          font-size: 16px; font-weight: 700;
          color: white; letter-spacing: 0.06em; text-transform: uppercase;
        }

        /* ── Dropdown shell ── */
        .tb-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: 0 24px 60px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.1);
          z-index: 200; overflow: hidden;
        }

        /* Notification dropdown */
        .notif-dd { width: 360px; }
        .dd-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px 10px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .dd-title {
          font-family: var(--font-heading);
          font-size: 12px; font-weight: 700;
          color: white; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .dd-mark-btn {
          font-size: 11.5px; color: #93c5fd;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: var(--radius-sm);
          cursor: pointer; font-family: var(--font-body); font-weight: 500;
          padding: 3px 9px; transition: background 0.15s;
        }
        .dd-mark-btn:hover { background: rgba(255,255,255,0.2); }
        .notif-list { max-height: 320px; overflow-y: auto; }
        .notif-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 11px 16px; cursor: pointer;
          transition: background 0.15s; position: relative;
          border-bottom: 1px solid var(--gray-50);
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: var(--gray-50); }
        .notif-read { opacity: 0.6; }
        .notif-icon {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .notif-body { flex: 1; min-width: 0; }
        .notif-title { font-size: 12.5px; font-weight: 600; color: var(--gray-800); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .notif-text  { font-size: 11.5px; color: var(--gray-500); line-height: 1.4; }
        .notif-time  { font-size: 10.5px; color: var(--gray-400); margin-top: 3px; }
        .notif-dot   { width: 7px; height: 7px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; margin-top: 6px; }
        .dd-foot {
          border-top: 1px solid var(--gray-100);
          padding: 10px 16px;
        }
        .dd-foot-btn {
          width: 100%; padding: 8px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border: none; border-radius: var(--radius-md);
          font-size: 12px; color: white;
          font-family: var(--font-body); cursor: pointer; font-weight: 500;
          transition: opacity 0.15s;
        }
        .dd-foot-btn:hover { opacity: 0.85; }

        /* User dropdown */
        .user-dd { width: 240px; }
        .dd-user-head {
          display: flex; align-items: center; gap: 10px; padding: 14px 16px 12px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .dd-user-avatar {
          width: 36px; height: 36px; border-radius: var(--radius-md);
          background: white;
          display: flex; align-items: center; justify-content: center;
          color: #0284c7; font-size: 15px; font-weight: 800; flex-shrink: 0;
        }
        .dd-user-name { font-family: var(--font-heading); font-size: 13px; font-weight: 600; color: white; letter-spacing: 0.03em; }
        .dd-user-email { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
        .dd-sep { height: 1px; background: var(--gray-100); margin: 4px 0; }
        .dd-item {
          display: flex; align-items: center; gap: 9px;
          width: 100%; padding: 9px 16px;
          background: none; border: none; cursor: pointer;
          font-size: 13px; font-family: var(--font-body);
          color: var(--gray-700); text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .dd-item:hover { background: #eff6ff; color: #1d4ed8; }
        .dd-item-danger { color: var(--danger) !important; }
        .dd-item-danger:hover { background: #fef2f2 !important; color: #b91c1c !important; }

        /* Hamburger hidden on desktop */
        .hamburger-btn { display: none !important; }

        @media (max-width: 768px) {
          .hamburger-btn { display: flex !important; }
          .tb-brand-mobile { display: flex !important; }
          .tb-date { display: none !important; }
          .user-info-text { display: none !important; }
          .tb-search-wrap { max-width: none; }
        }
        @media (max-width: 480px) {
          .topbar { padding: 0 12px; gap: 8px; }
          .tb-search-wrap { display: none; }
        }
      `}</style>
    </header>
  )
}