import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { MdMenu, MdSearch, MdNotifications, MdKeyboardArrowDown } from 'react-icons/md'

export default function TopBar({ searchPlaceholder, onMenuClick }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [notifOpen, setNotifOpen] = useState(false)

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : 'U'

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 18px', gap: 12,
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Hamburger — mobile only */}
      <button
        id="hamburger-btn"
        onClick={onMenuClick}
        className="hamburger-btn"
        style={{
          background: 'var(--gray-100)', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)', fontSize: 20,
          cursor: 'pointer', color: 'var(--gray-600)',
          display: 'none', flexShrink: 0,
          width: 38, height: 38,
          alignItems: 'center', justifyContent: 'center',
          transition: 'var(--transition)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-200)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-100)'}
      >
        <MdMenu size={20} />
      </button>

      {/* Search */}
      <div className="topbar-search" style={{ flex: 1, position: 'relative', maxWidth: 400 }}>
        <MdSearch style={{
          position: 'absolute', left: 10, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--gray-400)', fontSize: 17, pointerEvents: 'none'
        }} />
        <input
          style={{
            width: '100%', padding: '8px 12px 8px 34px',
            border: '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)', fontSize: '0.85rem',
            background: 'var(--gray-50)', color: 'var(--gray-700)',
            outline: 'none', transition: 'var(--transition)',
          }}
          placeholder={searchPlaceholder || 'Search documents, users…'}
          onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,0.08)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)'; e.target.style.boxShadow = 'none' }}
        />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Date — desktop only */}
      <div className="topbar-date" style={{ fontSize: '0.78rem', color: 'var(--gray-400)', whiteSpace: 'nowrap', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em' }}>
        {today}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Notification bell */}
        <div
          style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--gray-100)',
            border: '1px solid var(--gray-200)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            position: 'relative', flexShrink: 0,
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-200)'; e.currentTarget.style.borderColor = 'var(--gray-300)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.borderColor = 'var(--gray-200)' }}
          onClick={() => setNotifOpen(!notifOpen)}
        >
          <MdNotifications size={18} color="var(--gray-600)" />
          <span style={{
            position: 'absolute', top: 5, right: 5,
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--danger)',
            border: '1.5px solid white',
          }} />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--gray-200)' }} />

        {/* User avatar */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/settings')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/settings') }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', padding: '5px 8px',
            border: '1px solid transparent',
            borderRadius: 'var(--radius-md)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.borderColor = 'var(--gray-200)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          title="Open settings"
        >
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #1a56db 0%, #60a5fa 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 12, fontWeight: 700,
            flexShrink: 0, overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(26,86,219,0.25)',
          }}>
            {user?.profile_picture
              ? <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div className="user-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </span>
            <span style={{ fontSize: 10, color: 'var(--gray-500)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
              {user?.role} · {user?.department || 'KAFU'}
            </span>
          </div>
          <MdKeyboardArrowDown size={15} color="var(--gray-400)" className="user-info-text" />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: flex !important; }
          .user-info-text { display: none !important; }
          .topbar-date { display: none !important; }
        }
      `}</style>
    </header>
  )
}