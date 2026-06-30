import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../api/axios'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalDocuments: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    categories: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [docsRes, usersRes, approvalsRes, categoriesRes] = await Promise.all([
        api.get('/documents/'),
        api.get('/auth/users/'),
        api.get('/workflows/pending/'),
        api.get('/categories/'),
      ])
      setStats({
        totalDocuments: docsRes.data.length,
        activeUsers: usersRes.data.filter(u => u.is_approved).length,
        pendingApprovals: approvalsRes.data.length,
        categories: categoriesRes.data.length,
      })
      setRecentActivity(docsRes.data.slice(0, 5))
      setPendingUsers(usersRes.data.filter(u => !u.is_approved).slice(0, 3))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId) => {
    try {
      await api.post(`/auth/users/${userId}/approve/`, { action: 'approve' })
      fetchDashboardData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDenyUser = async (userId) => {
    try {
      await api.post(`/auth/users/${userId}/approve/`, { action: 'deny' })
      fetchDashboardData()
    } catch (err) {
      console.error(err)
    }
  }

  const statCards = [
    {
      label: 'Total Storage',
      value: stats.totalDocuments,
      sub: 'documents uploaded',
      icon: '🗄️',
      color: '#0047AB',
      bg: '#EBF2FF'
    },
    {
      label: 'Active Users',
      value: stats.activeUsers,
      sub: '● Online',
      icon: '👥',
      color: '#16A34A',
      bg: '#DCFCE7'
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      sub: 'files awaiting review',
      icon: '📋',
      color: '#D97706',
      bg: '#FEF3C7'
    },
    {
      label: 'System Uptime',
      value: '99.9%',
      sub: 'last 30 days',
      icon: '✅',
      color: '#16A34A',
      bg: '#DCFCE7'
    },
  ]

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return '📄'
    if (fileType === 'docx' || fileType === 'doc') return '📝'
    if (fileType === 'xlsx' || fileType === 'xls') return '📊'
    return '📁'
  }

  const getStatusBadge = (status) => {
    const map = {
      approved: { bg: '#DCFCE7', color: '#16A34A', label: 'Verified' },
      pending:  { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
      draft:    { bg: '#F1F5F9', color: '#64748B', label: 'Draft' },
      rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    }
    const s = map[status] || map.draft
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: '3px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 600
      }}>{s.label}</span>
    )
  }

  if (loading) return (
    <DashboardLayout searchPlaceholder="Search records...">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout searchPlaceholder="Search records...">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)' }}>
              System Overview
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>
              All systems operational. Monitoring {stats.activeUsers} active users across departments.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline btn-sm">📤 Export Logs</button>
            <button className="btn btn-primary btn-sm">💾 System Backup</button>
          </div>
        </div>

        {/* Filters row */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 16,
          flexWrap: 'wrap', alignItems: 'center'
        }}>
          {['All Departments', 'All Types', 'Last 30 Days'].map(f => (
            <select key={f} style={{
              padding: '7px 12px', borderRadius: 8,
              border: '1px solid var(--gray-300)',
              fontSize: 13, color: 'var(--gray-700)',
              background: 'white', cursor: 'pointer'
            }}>
              <option>{f}</option>
            </select>
          ))}
          <button style={{
            padding: '7px 14px', borderRadius: 8,
            border: '1px solid var(--gray-300)',
            fontSize: 13, color: 'var(--primary)',
            background: 'white', cursor: 'pointer'
          }}>✕ Clear Filters</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 24
      }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: 'white', borderRadius: 12,
            border: '1px solid var(--border)',
            padding: '20px', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--gray-500)', textTransform: 'uppercase',
                  letterSpacing: '0.5px', marginBottom: 8
                }}>{card.label}</div>
                <div style={{
                  fontSize: 30, fontWeight: 700,
                  color: 'var(--gray-900)'
                }}>{card.value}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                  {card.sub}
                </div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: card.bg,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18
              }}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Left: Recent Documents */}
        <div style={{
          background: 'white', borderRadius: 12,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent Documents</h3>
            <button
              onClick={() => navigate('/admin/documents')}
              style={{
                fontSize: 13, color: 'var(--primary)',
                background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500
              }}>View All</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                {['Document Name', 'Uploaded By', 'Category', 'Date', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600,
                    color: 'var(--gray-500)', textTransform: 'uppercase',
                    letterSpacing: '0.4px', borderBottom: '1px solid var(--border)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    padding: 32, textAlign: 'center',
                    color: 'var(--gray-400)', fontSize: 14
                  }}>No documents yet</td>
                </tr>
              ) : recentActivity.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--gray-100)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{getFileIcon(doc.file_type)}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)' }}>
                          {doc.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                          {doc.file_type?.toUpperCase() || 'FILE'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--gray-600)' }}>
                    {doc.uploaded_by?.username || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--gray-600)' }}>
                    {doc.category_detail?.name || 'Uncategorized'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--gray-500)' }}>
                    {new Date(doc.created_at).toLocaleDateString('en-KE', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(doc.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Compliance Alerts */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)', padding: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Compliance Alerts</h3>
            </div>
            <div style={{
              padding: '12px', borderRadius: 8,
              background: '#FEF2F2', border: '1px solid #FECACA',
              marginBottom: 10
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#991B1B' }}>
                  📄 Missing Signatures
                </div>
                <span style={{
                  background: '#DC2626', color: 'white',
                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700
                }}>Critical</span>
              </div>
              <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 4 }}>
                Student Records require immediate attention.
              </div>
            </div>
            <div style={{
              padding: '12px', borderRadius: 8,
              background: '#FFFBEB', border: '1px solid #FDE68A'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>
                  📅 Expiring Certifications
                </div>
                <span style={{
                  background: '#D97706', color: 'white',
                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700
                }}>Warning</span>
              </div>
              <div style={{ fontSize: 12, color: '#B45309', marginTop: 4 }}>
                Faculty certs expiring in &lt; 30 days.
              </div>
            </div>
          </div>

          {/* Pending User Approvals */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)', padding: 20
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 14
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Access Requests</h3>
              <span style={{
                background: 'var(--warning-light)', color: 'var(--warning)',
                padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600
              }}>{pendingUsers.length} pending</span>
            </div>

            {pendingUsers.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 13, padding: '16px 0' }}>
                No pending registrations
              </div>
            ) : pendingUsers.map((u) => (
              <div key={u.id} style={{
                padding: '12px 0',
                borderBottom: '1px solid var(--gray-100)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)' }}>
                  {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 8 }}>
                  {u.email} · {u.role}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleDenyUser(u.id)}
                    style={{
                      flex: 1, padding: '6px 0',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 6, fontSize: 12,
                      color: 'var(--danger)', background: 'white',
                      cursor: 'pointer', fontWeight: 500
                    }}>Deny</button>
                  <button
                    onClick={() => handleApproveUser(u.id)}
                    style={{
                      flex: 1, padding: '6px 0',
                      border: 'none', borderRadius: 6,
                      fontSize: 12, color: 'white',
                      background: 'var(--primary)',
                      cursor: 'pointer', fontWeight: 500
                    }}>Approve</button>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/admin/users')}
              style={{
                width: '100%', marginTop: 12, padding: '8px',
                border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 13, color: 'var(--primary)',
                background: 'white', cursor: 'pointer', fontWeight: 500
              }}>View All Requests →</button>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)', padding: 20
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 14
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent Activity</h3>
              <button style={{
                fontSize: 12, color: 'var(--primary)',
                background: 'none', border: 'none', cursor: 'pointer'
              }}>View All</button>
            </div>
            {recentActivity.slice(0, 3).map((doc) => (
              <div key={doc.id} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                marginBottom: 14
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--primary)', marginTop: 5, flexShrink: 0
                }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>
                    <strong>{doc.uploaded_by?.username}</strong> uploaded{' '}
                    <span style={{ color: 'var(--primary)' }}>{doc.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                    {new Date(doc.created_at).toLocaleTimeString('en-KE', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No recent activity</p>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}