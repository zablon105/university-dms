import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useScrollReveal from '../../hooks/useScrollReveal'
import { MdInsertChart, MdHourglassEmpty, MdWarning, MdDescription, MdPeople, MdStorage, MdSave, MdCalendarToday, MdShield, MdEditDocument, MdFolder } from 'react-icons/md';

export default function AdminDashboard() {
  const navigate = useNavigate()
  const revealRef = useScrollReveal({ stagger: false })
  const statsReveal = useScrollReveal({ stagger: true })
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    categories: 0,
    complianceRate: 0,
    storageUsed: 18.4,
    storageCapacity: 20
  })
  const [documents, setDocuments] = useState([])
  const [departmentActivity, setDepartmentActivity] = useState([])
  const [workflowActions, setWorkflowActions] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [selectedType, setSelectedType] = useState('All Types')
  const [selectedRange, setSelectedRange] = useState('Last 30 Days')

  const recentActivity = documents
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6)

  const handleExportLogs = async () => {
    try {
      const res = await api.get('/workflows/all/')
      if (!res.data.length) {
        return alert('No workflow logs available to export.')
      }
      const csvRows = [
        ['Request ID', 'Document', 'Requested By', 'Status', 'Reviewed By', 'Requested At', 'Reviewed At']
      ]
      res.data.forEach(item => {
        csvRows.push([
          item.id,
          item.document_detail?.title || 'Unknown',
          item.requested_by?.username || 'Unknown',
          item.status,
          item.reviewed_by?.username || 'Unassigned',
          new Date(item.created_at).toLocaleString(),
          item.reviewed_at ? new Date(item.reviewed_at).toLocaleString() : 'N/A'
        ])
      })
      const csvContent = csvRows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', 'kafu-approval-logs.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
      alert('Unable to export logs. Please try again later.')
    }
  }

  const handleSystemBackup = async () => {
    try {
      const [usersRes, docsRes, workflowsRes, categoriesRes] = await Promise.all([
        api.get('/auth/users/'),
        api.get('/documents/'),
        api.get('/workflows/all/'),
        api.get('/categories/')
      ])
      const backup = {
        generatedAt: new Date().toISOString(),
        users: usersRes.data,
        documents: docsRes.data,
        workflows: workflowsRes.data,
        categories: categoriesRes.data,
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', `kafu-backup-${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
      alert('Unable to generate backup. Please try again later.')
    }
  }

  const handleClearFilters = () => {
    setSelectedDepartment('All Departments')
    setSelectedType('All Types')
    setSelectedRange('Last 30 Days')
  }

  const handleViewAllActivity = () => {
    navigate('/admin/documents')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const [docsRes, usersRes, approvalsRes, categoriesRes, workflowsRes] = await Promise.all([
        api.get('/documents/'),
        api.get('/auth/users/'),
        api.get('/workflows/pending/'),
        api.get('/categories/'),
        api.get('/workflows/all/')
      ])
      const documents = docsRes.data
      const users = usersRes.data
      const workflows = workflowsRes.data
      const approvedDocuments = documents.filter(d => d.status === 'approved').length
      const complianceRate = documents.length ? Math.round((approvedDocuments / documents.length) * 1000) / 10 : 0

      setDocuments(documents)
      setStats({
        totalUsers: users.length,
        totalDocuments: documents.length,
        activeUsers: users.filter(u => u.is_approved).length,
        pendingApprovals: approvalsRes.data.length,
        categories: categoriesRes.data.length,
        complianceRate,
        storageUsed: 18.4,
        storageCapacity: 20
      })

      const departmentCounts = documents.reduce((acc, doc) => {
        const department = doc.uploaded_by?.department || doc.department || 'General'
        acc[department] = (acc[department] || 0) + 1
        return acc
      }, {})
      setDepartmentActivity(Object.entries(departmentCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([department, count]) => ({ department, count }))
      )

      setWorkflowActions(workflows.slice(0, 5).map(item => ({
        id: item.id,
        actor: item.reviewed_by?.username || item.requested_by?.username || 'System',
        description: item.document_detail?.title
          ? `Updated document ${item.document_detail.title}`
          : item.status === 'approved'
            ? 'Approved workflow request'
            : 'Processed system event',
        target: item.document_detail?.title || item.requested_by?.username || 'Record',
        status: item.status,
        timestamp: item.reviewed_at || item.created_at,
        documentTitle: item.document_detail?.title || 'Archive Record'
      })))

      setPendingUsers(users.filter(u => !u.is_approved).slice(0, 3))
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
      label: 'Institutional Capacity',
      value: `${stats.totalDocuments} Items`,
      sub: 'Total registered documents',
      icon: <MdStorage />,
      color: '#0047AB',
      bg: '#EBF2FF'
    },
    {
      label: 'Storage Used',
      value: '18.4 TB',
      sub: 'of 20 TB used',
      icon: <MdSave />,
      color: '#1D4ED8',
      bg: '#DBEAFE'
    },
    {
      label: 'Global Compliance',
      value: '98.2%',
      sub: 'Policy status',
      icon: <MdShield />,
      color: '#047857',
      bg: '#DCFCE7'
    },
    {
      label: 'Active Users',
      value: `${stats.activeUsers} Active`,
      sub: 'Verified access',
      icon: <MdPeople />,
      color: '#16A34A',
      bg: '#DCFCE7'
    },
  ]

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return <MdDescription />
    if (fileType === 'docx' || fileType === 'doc') return <MdEditDocument />
    if (fileType === 'xlsx' || fileType === 'xls') return <MdInsertChart />
    return <MdFolder />
  }

  const getStatusBadge = (status) => {
    const map = {
      approved: { bg: '#DCFCE7', color: '#16A34A', label: 'Verified' },
      pending: { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
      draft: { bg: '#F1F5F9', color: '#64748B', label: 'Draft' },
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
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}><MdHourglassEmpty /></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    </>
  )

  return (
    <div ref={revealRef}>
      <div className="page-header reveal" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Monitor institutional archive health and approval workflows.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={handleExportLogs}>Generate Report</button>
        </div>
      </div>
      {/* Filters row */}
      <div className="reveal" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))',
        gap: 12, marginTop: 16
      }}>
        <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{
          padding: '10px 14px', borderRadius: 12,
          border: '1px solid var(--gray-200)',
          fontSize: 13, color: 'var(--gray-700)',
          background: 'var(--bg-card)', cursor: 'pointer'
        }}>
          {['All Departments', 'Science', 'Arts & Humanities', 'Mathematics', 'Computer Science', 'Engineering'].map(option => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{
          padding: '10px 14px', borderRadius: 12,
          border: '1px solid var(--gray-200)',
          fontSize: 13, color: 'var(--gray-700)',
          background: 'var(--bg-card)', cursor: 'pointer'
        }}>
          {['All Types', 'Reports', 'Policies', 'Forms', 'Archives'].map(option => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select value={selectedRange} onChange={e => setSelectedRange(e.target.value)} style={{
          padding: '10px 14px', borderRadius: 12,
          border: '1px solid var(--gray-200)',
          fontSize: 13, color: 'var(--gray-700)',
          background: 'var(--bg-card)', cursor: 'pointer'
        }}>
          {['Last 30 Days', 'Last 7 Days', 'Last 90 Days', 'Year to Date'].map(option => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <button onClick={handleClearFilters} style={{
          padding: '10px 14px', borderRadius: 12,
          border: '1px solid var(--primary)',
          fontSize: 13, color: 'var(--primary)',
          background: 'var(--bg-card)', cursor: 'pointer', fontWeight: 600
        }}>Reset Filters</button>
      </div>

      {/* Stat cards */}
      <div ref={statsReveal} className="stagger-children" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 24, marginTop: 16
      }}>
        {statCards.map((card) => (
          <div key={card.label} className="reveal stat-card">
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

      {/* Department & storage summary */}
      <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Departmental Activity</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '6px 0 0' }}>Track document submissions by department.</p>
            </div>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Updated now</span>
          </div>
          {departmentActivity.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)' }}>No department data available</div>
          ) : departmentActivity.map((dept) => (
            <div key={dept.department} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--gray-700)' }}>
                <span>{dept.department}</span>
                <span>{dept.count} docs</span>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: 8, overflow: 'hidden', height: 10 }}>
                <div style={{ width: `${Math.min(100, Math.round((dept.count / Math.max(...departmentActivity.map(d => d.count))) * 100))}%`, height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Active Storage Infrastructure</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '6px 0 0' }}>Usage across primary archive nodes.</p>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>92%</div>
          </div>
          <div style={{ height: 14, borderRadius: 10, background: '#F1F5F9', marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #2563EB, #9333EA)' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
            {stats.storageUsed} TB / {stats.storageCapacity} TB Used
          </div>
          <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            {[
              { label: 'Storage Critical', detail: 'Cloud server “Storage-A1” is reaching 92% capacity.', type: 'danger' },
              { label: 'Compliance Audit', detail: 'New Q3 Compliance Audit required for Medical Faculty.', type: 'info' },
              { label: 'Maintenance', detail: 'Scheduled downtime for DB Optimization on Oct 24.', type: 'muted' }
            ].map(alert => (
              <div key={alert.label} style={{
                padding: 14, borderRadius: 12,
                border: `1px solid ${alert.type === 'danger' ? '#FECACA' : alert.type === 'info' ? '#DBEAFE' : '#E5E7EB'}`,
                background: alert.type === 'danger' ? '#FEF2F2' : alert.type === 'info' ? '#EFF6FF' : '#F9FAFB'
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{alert.label}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{alert.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Left: Recent Documents */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12,
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
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
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
            background: 'var(--bg-card)', borderRadius: 12,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)', padding: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}><MdWarning /></span>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Compliance Alerts</h3>
            </div>
            <div style={{
              padding: '12px', borderRadius: 8,
              background: '#FEF2F2', border: '1px solid #FECACA',
              marginBottom: 10
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#991B1B' }}>
                  <MdDescription /> Missing Signatures
                </div>
                <span style={{
                  background: '#DC2626', color: 'var(--hero-text)',
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
                  <MdCalendarToday /> Expiring Certifications
                </div>
                <span style={{
                  background: '#D97706', color: 'var(--hero-text)',
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
            background: 'var(--bg-card)', borderRadius: 12,
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
                      color: 'var(--danger)', background: 'var(--bg-card)',
                      cursor: 'pointer', fontWeight: 500
                    }}>Deny</button>
                  <button
                    onClick={() => handleApproveUser(u.id)}
                    style={{
                      flex: 1, padding: '6px 0',
                      border: 'none', borderRadius: 6,
                      fontSize: 12, color: 'var(--hero-text)',
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
                background: 'var(--bg-card)', cursor: 'pointer', fontWeight: 500
              }}>View All Requests →</button>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)', padding: 20
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 14
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent Activity</h3>
              <button onClick={handleViewAllActivity} style={{
                fontSize: 12, color: 'var(--primary)',
                background: 'none', border: 'none', cursor: 'pointer'
              }}>View All</button>
            </div>
            {workflowActions.slice(0, 3).map((item) => (
              <div key={item.id} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                marginBottom: 14
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--primary)', marginTop: 5, flexShrink: 0
                }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>
                    <strong>{item.actor}</strong> {item.description}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                    {new Date(item.timestamp).toLocaleTimeString('en-KE', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            {workflowActions.length === 0 && (
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No recent activity</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}