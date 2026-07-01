import { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../api/axios'

export default function AdminDocuments() {
  const [docs, setDocs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/documents/'), api.get('/categories/')]).then(([d, c]) => {
      setDocs(d.data)
      setFiltered(d.data)
      setCategories(['All Categories', ...c.data.map(cat => cat.name)])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = docs
    if (search) result = result.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'All Statuses') result = result.filter(d => d.status === statusFilter.toLowerCase())
    if (categoryFilter !== 'All Categories') result = result.filter(d => d.category_detail?.name === categoryFilter)
    setFiltered(result)
  }, [search, statusFilter, categoryFilter, docs])

  const totalDocs = docs.length
  const verified = docs.filter(d => d.status === 'approved').length
  const awaitingReview = docs.filter(d => d.status === 'pending').length

  const getStatusBadge = (status) => {
    const map = {
      approved: { bg: '#DCFCE7', color: '#16A34A', label: 'Verified' },
      pending:  { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
      draft:    { bg: '#F1F5F9', color: '#64748B', label: 'Draft' },
      rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    }
    const s = map[status] || map.draft
    return (
      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
        {s.label}
      </span>
    )
  }

  const getFileIcon = (type) => {
    if (type === 'pdf') return { icon: '📄', color: '#DC2626' }
    if (type === 'docx' || type === 'doc') return { icon: '📝', color: '#1D4ED8' }
    if (type === 'xlsx') return { icon: '📊', color: '#16A34A' }
    return { icon: '📁', color: '#6B7280' }
  }

  const handleGenerateReport = () => {
    if (!filtered.length) {
      return alert('No documents available to export.')
    }
    const csvRows = [
      ['Title', 'Submitter', 'Category', 'Status', 'Uploaded At', 'File Type']
    ]
    filtered.forEach(doc => {
      csvRows.push([
        doc.title,
        doc.uploaded_by?.username || 'Unknown',
        doc.category_detail?.name || 'Uncategorized',
        doc.status,
        new Date(doc.created_at).toLocaleString(),
        doc.file_type || 'Unknown'
      ])
    })
    const csvContent = csvRows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'kafu-document-report.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <DashboardLayout searchPlaceholder="Search documents, users, or logs...">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Document History</h1>
          <p className="page-subtitle">Review and manage the KAFU Staff Archive activity logs.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleGenerateReport}>➕ Generate Report</button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Documents', value: totalDocs, sub: '+142 this week', icon: '📁', color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Verified', value: verified, sub: `${totalDocs > 0 ? Math.round((verified / totalDocs) * 100) : 0}% of total archive`, icon: '✅', color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Awaiting Review', value: awaitingReview, sub: 'Requires attention', icon: '⏳', color: 'var(--warning)', bg: 'var(--warning-light)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--gray-900)', marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, marginTop: 4 }}>{s.sub}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filters */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 14 }}>🔍</span>
            <input className="input-field" style={{ paddingLeft: 32 }}
              placeholder="Filter by name, submitter, or category..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field" style={{ width: 'auto', minWidth: 140 }}
            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input-field" style={{ width: 'auto', minWidth: 130 }}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {['All Statuses', 'Approved', 'Pending', 'Draft', 'Rejected'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            Showing {filtered.length} of {totalDocs} entries
          </span>
        </div>

        {/* Table */}
        <table className="table">
          <thead>
            <tr>
              {['Document Name', 'Submitter', 'Category', 'Date Uploaded', 'Status', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>No documents found</td></tr>
            ) : filtered.map(doc => {
              const fi = getFileIcon(doc.file_type)
              return (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20, color: fi.color }}>{fi.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)' }}>{doc.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.file_type?.toUpperCase() || 'FILE'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>
                      {doc.uploaded_by?.first_name
                        ? `${doc.uploaded_by.first_name} ${doc.uploaded_by.last_name}`
                        : doc.uploaded_by?.username}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.uploaded_by?.department || 'KAFU'}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                      {doc.category_detail?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                    {new Date(doc.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={doc.file} target="_blank" rel="noreferrer">
                        <button className="btn btn-outline btn-sm">📥</button>
                      </a>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}