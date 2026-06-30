import useAuthStore from '../store/authStore'

export default function TopBar({ title, searchPlaceholder }) {
  const { user } = useAuthStore()

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : 'U'

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--gray-400)', fontSize: 14
        }}>🔍</span>
        <input
          style={{
            width: '100%', padding: '8px 12px 8px 36px',
            border: '1px solid var(--gray-200)',
            borderRadius: 8, fontSize: 13,
            background: 'var(--gray-50)',
            color: 'var(--gray-700)', outline: 'none'
          }}
          placeholder={searchPlaceholder || 'Search documents...'}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        {/* Notification bell */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--gray-100)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
          fontSize: 16, position: 'relative'
        }}>
          🔔
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--danger)',
            border: '2px solid white'
          }} />
        </div>

        {/* Refresh */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--gray-100)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', fontSize: 16
        }}>🔄</div>

        {/* User avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer'
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: 'white', fontSize: 13, fontWeight: 700
          }}>
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>
              {user?.first_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username}
            </span>
            <span style={{
              fontSize: 11, color: 'var(--gray-500)',
              textTransform: 'capitalize'
            }}>
              {user?.role} · {user?.department || 'KAFU'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}