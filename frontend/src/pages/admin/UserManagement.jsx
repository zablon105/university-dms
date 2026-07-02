import { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../api/axios'
import { MdCheckCircle, MdDownload, MdFileDownload, MdAdd, MdPeople, MdSearch, MdLock, MdHourglassEmpty } from 'react-icons/md';

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [loading, setLoading] = useState(true)
  const [pendingUsers, setPendingUsers] = useState([])
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importResults, setImportResults] = useState(null)
  const [addUserForm, setAddUserForm] = useState({
    username: '', email: '', first_name: '', last_name: '', role: 'student', department: '', phone: '', password: '', password2: ''
  })
  const [importFile, setImportFile] = useState(null)

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

  const parseCSV = (text) => {
    const rows = text.trim().split(/\r?\n/).filter(line => line.trim())
    const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
    return rows.slice(1).map(line => {
      const values = []
      let field = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
          continue
        }
        if (char === ',' && !inQuotes) {
          values.push(field.trim())
          field = ''
          continue
        }
        field += char
      }
      values.push(field.trim())
      return headers.reduce((acc, header, index) => ({
        ...acc,
        [header]: (values[index] || '').replace(/^"|"$/g, '').trim()
      }), {})
    })
  }

  const handleBulkImport = () => {
    setImportFile(null)
    setImportResults(null)
    setShowImportModal(true)
  }

  const handleAddNewUser = () => {
    setAddUserForm({
      username: '', email: '', first_name: '', last_name: '', role: 'student', department: '', phone: '', password: '', password2: ''
    })
    setShowAddUserModal(true)
  }

  const handleAddUserSubmit = async (e) => {
    e.preventDefault()
    if (addUserForm.password !== addUserForm.password2) {
      return alert('Passwords do not match.')
    }
    setAddLoading(true)
    try {
      await api.post('/auth/register/', addUserForm)
      alert('User added successfully. They will appear after approval if required.')
      setShowAddUserModal(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Unable to create user. Please check the fields and try again.')
    } finally {
      setAddLoading(false)
    }
  }

  const downloadImportTemplate = () => {
    const headers = ['registration_number', 'email', 'first_name', 'last_name', 'role', 'department', 'phone', 'password']
    const rows = [
      headers,
      ['COM/0028/2023', 'jane.doe@kaimu.edu', 'Jane', 'Doe', 'student', 'Computer Science', '0712345678', 'Secret123!']
    ]
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'user-import-template.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleImportSubmit = async () => {
    if (!importFile) {
      return alert('Please select a CSV file to import.')
    }
    setImportLoading(true)
    try {
      const text = await importFile.text()
      const rows = parseCSV(text)
      if (!rows.length) {
        return alert('The CSV file is empty or invalid.')
      }

      const summary = { success: 0, failed: 0, errors: [] }
      const actions = rows.map(async (row, index) => {
        const body = {
          username: (row.username || row.registration_number || '').trim().toUpperCase(),
          email: (row.email || '').trim().toLowerCase(),
          first_name: (row.first_name || row.first || '').trim(),
          last_name: (row.last_name || row.last || '').trim(),
          role: (row.role || 'student').trim().toLowerCase(),
          department: (row.department || '').trim(),
          phone: (row.phone || '').trim(),
          password: row.password?.trim(),
        }

        const rowErrors = []
        if (!body.username) rowErrors.push('registration_number is required')
        if (!body.email) rowErrors.push('email is required')
        if (!body.password) rowErrors.push('password is required')
        if (rowErrors.length) {
          summary.failed += 1
          summary.errors.push({ row: index + 2, message: rowErrors.join(', ') })
          return
        }

        if (!['student', 'staff'].includes(body.role)) {
          body.role = 'student'
        }

        body.password2 = body.password

        try {
          await api.post('/auth/register/', body)
          summary.success += 1
        } catch (error) {
          summary.failed += 1
          summary.errors.push({
            row: index + 2,
            message: error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message
          })
        }
      })
      await Promise.all(actions)
      setImportResults(summary)
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert('Failed to import file. Please ensure the file is a valid CSV with user details.')
    } finally {
      setImportLoading(false)
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
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage access, roles, and system permissions.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={handleBulkImport}><MdDownload /> Bulk Import</button>
          <button className="btn btn-primary btn-sm" onClick={handleAddNewUser}><MdAdd /> Add New User</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: totalUsers, icon: <MdPeople />, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Active Users', value: activeUsers, icon: <MdCheckCircle />, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Pending Approval', value: pendingCount, icon: <MdHourglassEmpty />, color: 'var(--warning)', bg: 'var(--warning-light)' },
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
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 14 }}><MdSearch /></span>
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
                <MdCheckCircle /> No pending requests
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
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}><MdLock /> Role Permissions</h3>
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

      {showAddUserModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 700, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(15,23,42,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: 18, margin: 0 }}>Add New User</h2>
                <p style={{ margin: '6px 0 0', color: 'var(--gray-500)', fontSize: 13 }}>Create a staff or student account directly from the admin console.</p>
              </div>
              <button onClick={() => setShowAddUserModal(false)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleAddUserSubmit} style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Registration Number', name: 'username', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'First Name', name: 'first_name', type: 'text' },
                { label: 'Last Name', name: 'last_name', type: 'text' },
                { label: 'Role', name: 'role', type: 'select', options: ['student', 'staff'] },
                { label: 'Department', name: 'department', type: 'text' },
                { label: 'Phone', name: 'phone', type: 'text' },
                { label: 'Password', name: 'password', type: 'password' },
                { label: 'Confirm Password', name: 'password2', type: 'password' }
              ].map(field => (
                <div key={field.name} className="input-group">
                  <label className="input-label">{field.label}</label>
                  {field.type === 'select' ? (
                    <select className="input-field" value={addUserForm[field.name]} onChange={e => setAddUserForm({ ...addUserForm, [field.name]: e.target.value })}>
                      {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input
                      className="input-field"
                      type={field.type}
                      value={addUserForm[field.name]}
                      onChange={e => setAddUserForm({ ...addUserForm, [field.name]: e.target.value })}
                      required
                    />
                  )}
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addLoading}>{addLoading ? 'Creating...' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 620, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(15,23,42,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: 18, margin: 0 }}>Bulk CSV Import</h2>
                <p style={{ margin: '6px 0 0', color: 'var(--gray-500)', fontSize: 13 }}>Upload a CSV with registration_number,email,first_name,last_name,role,department,phone,password.</p>
              </div>
              <button onClick={() => setShowImportModal(false)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div className="input-group" style={{ flex: 1, minWidth: 220 }}>
                    <label className="input-label">CSV File</label>
                    <input type="file" accept=".csv" onChange={e => setImportFile(e.target.files?.[0] || null)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="button" className="btn btn-outline" onClick={downloadImportTemplate} style={{ whiteSpace: 'nowrap' }}>
                      <MdFileDownload /> Download sample CSV
                    </button>
                  </div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>CSV Template</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-700)', lineHeight: 1.5 }}>
                    Use a CSV with the exact headers below. Rows must include a registration number, email, and password.
                  </div>
                  <pre style={{ marginTop: 12, padding: 12, background: '#ffffff', borderRadius: 10, overflowX: 'auto', fontSize: 12, color: 'var(--gray-700)' }}>
registration_number,email,first_name,last_name,role,department,phone,password
                  </pre>
                </div>
              </div>
              {importResults && (
                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Import Summary</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-700)' }}>{importResults.success} users created, {importResults.failed} failed.</div>
                  {importResults.errors.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-700)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--danger)' }}>Errors</div>
                  {importResults.errors.slice(0, 5).map((error, index) => {
                    const rowLabel = typeof error === 'string' ? '' : `Row ${error.row}: `
                    const message = typeof error === 'string' ? error : error.message
                    return (
                      <div key={index} style={{ marginBottom: 8, padding: '10px 12px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>
                        <strong>{rowLabel}</strong>{message}
                      </div>
                    )
                  })}
                  {importResults.errors.length > 5 && <div style={{ marginTop: 4 }}>...and {importResults.errors.length - 5} more errors.</div>}
                </div>
              )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '18px 24px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-outline" onClick={() => setShowImportModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleImportSubmit} disabled={importLoading}>{importLoading ? 'Importing...' : 'Start Import'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}