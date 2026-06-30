import { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../api/axios'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [loading, setLoading] = useState(true)
  const [pendingUsers, setPendingUsers] = useState([])

  useEffect(() => { fetchUsers() }, [])

  useEffect(() => {
    let result = users
    if (search) result = result.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())
    )
    if (roleFilter !== 'All Roles') result = result.filter(u => u.role === roleFilter.toLowerCase())
    setFiltered(result)
  }, [search, roleFilter, users])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users/')
      setUsers(res.data)
      setFiltered(res.data)
      setPendingUsers(res.data.filter(u => !u.is_approved))
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId, action) => {
    try {
      await api.post(`/auth/users/${userId}/approve/`, { action })
      fetchUsers()
    } catch (err) { console.error(err) }
  }

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.is_approved).length
  const pendingCount = pendingUsers.length

  const getRoleBadge = (role) => {
    const map = {
      admin:   { bg: '#EDE9FE', color: '#7C3AED', label: 'Admin' },
      staff:   { bg: '#DBEAFE', color: '#1D4ED8', label: 'Staff' },
      student: { bg: '#DCFCE7', color: '#16A34A', label: 'Student' },
    }
    const s = map[role] || map.student
    return (
      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
        {s.label}
      </span>
    )
  }

  return (
    <DashboardLayout searchPlaceholder="Search users, roles, or departments...">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage access, roles, and system permissions.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm">📥 Bulk Import</button>
          <button className="btn btn-primary btn-sm">➕ Add New User</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: totalUsers, icon: '👥', color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Active Users', value: activeUsers, icon: '✅', color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Pending Approval', value: pendingCount, icon: '⏳', color: 'var(--warning)', bg: 'var(--warning-light)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--gray-900)', marginTop: 4 }}>{s.value}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

        {/* Users Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Filters */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 14 }}>🔍</span>
              <input className="input-field" style={{ paddingLeft: 32, marginBottom: 0 }}
                placeholder="Search users..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {['All Roles', 'Admin', 'Staff', 'Student'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                  border: `1.5px solid ${roleFilter === r ? 'var(--primary)' : 'var(--gray-300)'}`,
                  background: roleFilter === r ? 'var(--primary-light)' : 'white',
                  color: roleFilter === r ? 'var(--primary)' : 'var(--gray-600)',
                  fontWeight: roleFilter === r ? 600 : 400
                }}>{r}</button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 'auto' }}>
              Showing {filtered.length} of {totalUsers}
            </span>
          </div>

          {/* Table */}
          <table className="table">
            <thead>
              <tr>
                {['User', 'Role', 'Department', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: u.role === 'admin' ? '#EDE9FE' : u.role === 'staff' ? '#DBEAFE' : '#DCFCE7',
                        color: u.role === 'admin' ? '#7C3AED' : u.role === 'staff' ? '#1D4ED8' : '#16A34A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700
                      }}>
                        {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)' }}>
                          {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{u.department || '—'}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: u.is_approved ? 'var(--success-light)' : 'var(--warning-light)',
                      color: u.is_approved ? 'var(--success)' : 'var(--warning)'
                    }}>{u.is_approved ? 'Active' : 'Pending'}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                    {new Date(u.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    {!u.is_approved ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleAction(u.id, 'deny')}
                          style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--danger)', background: 'white', color: 'var(--danger)', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>
                          Deny
                        </button>
                        <button onClick={() => handleAction(u.id, 'approve')}
                          style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>
                          Approve
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Access Requests sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>Access Requests</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                Pending registrations awaiting administrative approval.
              </p>
            </div>
            {pendingUsers.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 13, padding: '20px 0' }}>
                ✅ No pending requests
              </div>
            ) : pendingUsers.map(u => (
              <div key={u.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)' }}>
                  {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 10 }}>
                  {u.email}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleAction(u.id, 'deny')}
                    style={{ flex: 1, padding: '7px', border: '1px solid var(--gray-300)', borderRadius: 6, fontSize: 12, color: 'var(--danger)', background: 'white', cursor: 'pointer', fontWeight: 500 }}>
                    Deny
                  </button>
                  <button onClick={() => handleAction(u.id, 'approve')}
                    style={{ flex: 1, padding: '7px', border: 'none', borderRadius: 6, fontSize: 12, color: 'white', background: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Role permissions info */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>🔐 Role Permissions</h3>
            {[
              { role: 'Admin', desc: 'Full Access: Add, Edit, Delete', color: '#7C3AED', bg: '#EDE9FE' },
              { role: 'Staff', desc: 'Management & Upload', color: '#1D4ED8', bg: '#DBEAFE' },
              { role: 'Student', desc: 'View & Download Only', color: '#16A34A', bg: '#DCFCE7' },
            ].map(r => (
              <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ background: r.bg, color: r.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {r.role}
                </span>
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}