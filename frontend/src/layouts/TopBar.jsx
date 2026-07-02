import useAuthStore from '../store/authStore'

export default function TopBar({ searchPlaceholder, onMenuClick }) {
  const { user } = useAuthStore()

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() ||
      user.username?.[0]?.toUpperCase()
    : 'U'

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 12,
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="hamburger-btn"
        style={{
          background: 'none', border: 'none',
          fontSize: 22, cursor: 'pointer',
          color: 'var(--gray-600)', padding: 4,
          display: 'none', flexShrink: 0,
          minWidth: 44, minHeight: 44,
          alignItems: 'center', justifyContent: 'center',
          borderRadius: 8
        }}
      >☰</button>

      {/* Search */}
      <div style={{ flex: 1, position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 10, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--gray-400)', fontSize: 14
        }}>🔍</span>
        <input
          style={{
            width: '100%', padding: '8px 12px 8px 32px',
            border: '1px solid var(--gray-200)',
            borderRadius: 8, fontSize: 13,
            background: 'var(--gray-50)',
            color: 'var(--gray-700)', outline: 'none'
          }}
          placeholder={searchPlaceholder || 'Search...'}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Notification bell */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--gray-100)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
          fontSize: 16, position: 'relative', flexShrink: 0
        }}>
          🔔
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--danger)',
            border: '2px solid white'
          }} />
        </div>

        {/* User avatar + name — hide name on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: 'white', fontSize: 13, fontWeight: 700,
            flexShrink: 0
          }}>
            {initials}
          </div>
          <div className="user-info-text" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', whiteSpace: 'nowrap' }}>
              {user?.first_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username}
            </span>
            <span style={{
              fontSize: 11, color: 'var(--gray-500)',
              textTransform: 'capitalize', whiteSpace: 'nowrap'
            }}>
              {user?.role} · {user?.department || 'KAFU'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn {
            display: flex !important;
          }
          .user-info-text {
            display: none !important;
          }
        }
      `}</style>
    </header>
  )
}