import { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../api/axios'
import { MdFolderOpen, MdFolder, MdSave, MdDownload, MdExplore, MdEditDocument, MdInsertChart, MdDescription, MdSearch } from 'react-icons/md';

const storagePalette = [
  { label: 'Academic Records', value: 8.2, color: '#2563EB' },
  { label: 'Staff Documents', value: 3.1, color: '#1D4ED8' },
  { label: 'Student Assignments', value: 5.5, color: '#16A34A' },
  { label: 'Multimedia', value: 1.6, color: '#7C3AED' },
]

const cleanupCandidates = [
  { title: 'System Log Archives', detail: 'Expired logs and rotated activity snapshots.', size: '124 GB', tag: 'Archive' },
  { title: 'Orphaned Media Exports', detail: 'Unused event recordings from last year.', size: '82 GB', tag: 'Purge' },
  { title: 'Legacy Policy Drafts', detail: 'Outdated compliance policy documents.', size: '34 GB', tag: 'Delete' },
]

export default function AdminDocuments() {
  const [docs, setDocs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [selectedCleanup, setSelectedCleanup] = useState([0, 1])
  const [loading, setLoading] = useState(true)
  const storageUsed = 18.4
  const storageCapacity = 20

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
    if (type === 'pdf') return { icon: <MdDescription />, color: '#DC2626' }
    if (type === 'docx' || type === 'doc') return { icon: <MdEditDocument />, color: '#1D4ED8' }
    if (type === 'xlsx') return { icon: <MdInsertChart />, color: '#16A34A' }
    return { icon: <MdFolder />, color: '#6B7280' }
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
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Storage Overview</h1>
          <p className="page-subtitle">Monitor archive capacity, usage breakdown, and cleanup recommendations.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleGenerateReport}>Generate Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Capacity', value: `${storageCapacity} TB`, sub: 'Archive quota', icon: <MdExplore />, bg: '#EFF6FF' },
          { label: 'Used Space', value: `${storageUsed} TB`, sub: 'Current utilization', icon: <MdSave />, bg: '#E0F2FE' },
          { label: 'Remaining', value: `${(storageCapacity - storageUsed).toFixed(1)} TB`, sub: 'Available space', icon: <MdFolderOpen />, bg: '#ECFCCB' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gray-900)', marginTop: 8 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 6 }}>{s.sub}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Content Distribution</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '6px 0 0' }}>Storage use by document category.</p>
            </div>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Updated 2 hours ago</span>
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {storagePalette.map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--gray-700)', marginBottom: 6 }}>
                  <span>{item.label}</span>
                  <span>{item.value} TB</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (item.value / storageCapacity) * 100)}%`, height: '100%', background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Cleanup Recommendations</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '6px 0 0' }}>Safe content to prune and free up space.</p>
            </div>
            <button className="btn btn-outline btn-sm">Review</button>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {cleanupCandidates.map((item, index) => (
              <div key={item.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: 12, background: index % 2 === 0 ? '#F8FAFC' : '#FEF3F2' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{item.detail}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{item.size}</div>
                  <button className="btn btn-outline btn-xs" style={{ marginTop: 8 }} onClick={() => {
                    setSelectedCleanup(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])
                  }}>
                    {selectedCleanup.includes(index) ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 14 }}><MdSearch /></span>
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
                        <button className="btn btn-outline btn-sm"><MdDownload /></button>
                      </a>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}