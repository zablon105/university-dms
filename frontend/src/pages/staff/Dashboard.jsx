import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import useAuthStore from '../../store/authStore'
import api from '../../api/axios'
import Reports from './Reports'

// ─── Upload Document Page ─────────────────────────────────────────
function UploadDocument() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', category: '', visibility: 'staff', status: 'draft' })
  const [file, setFile] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [recentUploads, setRecentUploads] = useState([])

  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data))
    api.get('/documents/my/').then(r => setRecentUploads(r.data.slice(0, 4)))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return alert('Please select a file')
    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      data.append('file', file)
      await api.post('/documents/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuccess(true)
    } catch (err) {
      alert('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <DashboardLayout searchPlaceholder="Search archives...">
      <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
        <div className="card">
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
            Document Successfully Uploaded
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>
            Your file has been securely transmitted to the KAFU Staff Archive.
          </p>
          <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 16, marginBottom: 24, textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>📄</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{form.title}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                  Verification Status: <span style={{ color: 'var(--warning)', fontWeight: 600 }}>● Awaiting Review</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/staff/archive')}>
              👁️ View Document in Archive
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => { setSuccess(false); setForm({ title: '', description: '', category: '', visibility: 'staff', status: 'draft' }); setFile(null) }}>
              📤 Upload Another Document
            </button>
            <button style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: 13, cursor: 'pointer', marginTop: 4 }}
              onClick={() => navigate('/staff/dashboard')}>
              🏠 Go to Staff Dashboard
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout searchPlaceholder="Search archives...">
      <div className="page-header">
        <h1 className="page-title">Staff Document Submission</h1>
        <p className="page-subtitle">Archive official records, syllabi, and departmental notices to the central KAFU repository.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Document Title</label>
              <input className="input-field" placeholder="e.g. 2024 Computer Science Curriculum Review"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Department</label>
                <select className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}>
                  <option>Science</option>
                  <option>Arts & Humanities</option>
                  <option>Mathematics</option>
                  <option>Computer Science</option>
                  <option>Engineering</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Document Type / Category</label>
                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Visibility Settings</label>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>Control who can access this document in the archive.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ val: 'staff', label: 'Departmental' }, { val: 'public', label: 'Public' }, { val: 'admin', label: 'Private' }].map(v => (
                  <button key={v.val} type="button" onClick={() => setForm({ ...form, visibility: v.val })}
                    style={{
                      padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
                      border: `1.5px solid ${form.visibility === v.val ? 'var(--primary)' : 'var(--gray-300)'}`,
                      background: form.visibility === v.val ? 'var(--primary-light)' : 'white',
                      color: form.visibility === v.val ? 'var(--primary)' : 'var(--gray-600)',
                      fontWeight: form.visibility === v.val ? 600 : 400, fontSize: 13
                    }}>{v.label}</button>
                ))}
              </div>
            </div>
            {/* File Upload */}
            <div className="input-group">
              <label className="input-label">File Upload</label>
              <div
                onClick={() => document.getElementById('file-input').click()}
                style={{
                  border: `2px dashed ${file ? 'var(--primary)' : 'var(--gray-300)'}`,
                  borderRadius: 10, padding: '32px 20px', textAlign: 'center',
                  cursor: 'pointer', background: file ? 'var(--primary-light)' : 'var(--gray-50)',
                  transition: 'all 0.2s'
                }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]) }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{file ? '✅' : '☁️'}</div>
                {file ? (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-600)' }}>
                      Drag and drop your file here
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4 }}>or browse files from your computer</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>PDF, DOCX, XLSX · Max 25MB</div>
                  </div>
                )}
                <input id="file-input" type="file" style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc,.xlsx,.xls"
                  onChange={e => setFile(e.target.files[0])} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setForm({ ...form, status: 'draft' })}>
                💾 Save as Draft
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                disabled={loading}>
                {loading ? 'Uploading...' : '📤 Publish to Archive'}
              </button>
            </div>
          </form>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>Recent Submissions</h3>
              <span style={{ fontSize: 12, cursor: 'pointer', color: 'var(--primary)' }}>🔄</span>
            </div>
            {recentUploads.length === 0
              ? <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No recent uploads</p>
              : recentUploads.map(doc => (
                <div key={doc.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', flex: 1, marginRight: 8 }}>
                      {doc.title}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: doc.status === 'approved' ? 'var(--success-light)' : doc.status === 'pending' ? 'var(--warning-light)' : 'var(--gray-100)',
                      color: doc.status === 'approved' ? 'var(--success)' : doc.status === 'pending' ? 'var(--warning)' : 'var(--gray-500)'
                    }}>{doc.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3 }}>
                    {(doc.file_size / 1024).toFixed(0)} KB · {doc.category_detail?.name || 'Uncategorized'}
                  </div>
                </div>
              ))}
          </div>
          <div style={{
            borderRadius: 12, padding: 20,
            background: 'linear-gradient(135deg, #0047AB, #003580)',
            color: 'white', textAlign: 'center'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💾</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Storage Usage</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>64% of 500GB Used</div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, height: 6, marginTop: 10 }}>
              <div style={{ background: 'white', width: '64%', height: '100%', borderRadius: 6 }} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── Approval Queue Page ──────────────────────────────────────────
function ApprovalQueue() {
  const [approvals, setApprovals] = useState([])
  const [allApprovals, setAllApprovals] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchApprovals() }, [])

  const fetchApprovals = async () => {
    try {
      const [pending, all] = await Promise.all([
        api.get('/workflows/pending/'),
        api.get('/workflows/all/'),
      ])
      setApprovals(pending.data)
      setAllApprovals(all.data)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, action) => {
    try {
      await api.post(`/workflows/review/${id}/`, {
        action, review_note: action === 'approve' ? 'Approved by staff.' : 'Rejected by staff.'
      })
      fetchApprovals()
    } catch (err) { console.error(err) }
  }

  const displayed = activeTab === 'pending' ? approvals : allApprovals

  return (
    <DashboardLayout searchPlaceholder="Search staff queue...">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Approval Queue</h1>
          <p className="page-subtitle">Review and process student document submissions for the current semester.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pending', 'all'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13,
                border: `1.5px solid ${activeTab === tab ? 'var(--primary)' : 'var(--gray-300)'}`,
                background: activeTab === tab ? 'var(--primary)' : 'white',
                color: activeTab === tab ? 'white' : 'var(--gray-600)',
                fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer',
                textTransform: 'capitalize'
              }}>{tab === 'pending' ? 'Pending' : 'All Requests'}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Avg. Wait Time', value: '14.2 hrs', sub: '↓ 2.4 hrs from last week', color: 'var(--success)' },
          { label: 'Total Pending', value: approvals.length, sub: 'Awaiting review', color: 'var(--warning)' },
          { label: 'Total Processed', value: allApprovals.length, sub: 'All time', color: 'var(--primary)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gray-900)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.color, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-500)' }}>
            Documents Awaiting Review
          </h3>
          <select style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--gray-300)', fontSize: 12, color: 'var(--gray-600)' }}>
            <option>Sort: Newest First</option>
          </select>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            No {activeTab} requests
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {['Student', 'Document', 'Type', 'Submitted', 'Status', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(ap => (
                <tr key={ap.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700
                      }}>
                        {ap.requested_by?.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{ap.requested_by?.username}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{ap.requested_by?.department || 'KAFU'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 180 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ap.document_detail?.title}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {ap.document_detail?.category_detail?.name || 'General'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                    {new Date(ap.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: ap.status === 'approved' ? 'var(--success-light)' : ap.status === 'rejected' ? 'var(--danger-light)' : 'var(--warning-light)',
                      color: ap.status === 'approved' ? 'var(--success)' : ap.status === 'rejected' ? 'var(--danger)' : 'var(--warning)'
                    }}>{ap.status}</span>
                  </td>
                  <td>
                    {ap.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleAction(ap.id, 'approve')}
                          style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                          ✅ Approve
                        </button>
                        <button onClick={() => handleAction(ap.id, 'reject')}
                          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--danger)', background: 'white', color: 'var(--danger)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── Archive Page ─────────────────────────────────────────────────
function Archive() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/documents/').then(r => { setDocs(r.data); setLoading(false) })
  }, [])

  return (
    <DashboardLayout searchPlaceholder="Search archive...">
      <div className="page-header">
        <h1 className="page-title">Document Archive</h1>
        <p className="page-subtitle">Browse and manage all departmental documents.</p>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>{['Document', 'Uploaded By', 'Category', 'Date', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</td></tr>
            ) : docs.map(doc => (
              <tr key={doc.id}>
                <td>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>{doc.file_type === 'pdf' ? '📄' : '📝'}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.file_type?.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 13 }}>{doc.uploaded_by?.username}</td>
                <td style={{ fontSize: 13 }}>{doc.category_detail?.name || '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                  {new Date(doc.created_at).toLocaleDateString()}
                </td>
                <td>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: doc.status === 'approved' ? 'var(--success-light)' : doc.status === 'pending' ? 'var(--warning-light)' : 'var(--gray-100)',
                    color: doc.status === 'approved' ? 'var(--success)' : doc.status === 'pending' ? 'var(--warning)' : 'var(--gray-600)'
                  }}>{doc.status}</span>
                </td>
                <td>
                  <a href={doc.file} target="_blank" rel="noreferrer">
                    <button className="btn btn-outline btn-sm">📥 Download</button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

// ─── Staff Home Dashboard ─────────────────────────────────────────
function StaffHome() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/documents/my/'),
      api.get('/workflows/pending/'),
    ]).then(([d, p]) => {
      setDocs(d.data)
      setPending(p.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const recentUploads = docs.slice(0, 2)
  const actionRequired = docs.filter(d => d.status === 'pending' || d.status === 'draft').slice(0, 3)

  const departments = [
    { name: 'Science Dept', count: 42, icon: '🔬' },
    { name: 'Arts & Humanities', count: 18, icon: '🎭' },
    { name: 'Mathematics', count: 29, icon: '📐' },
  ]

  return (
    <DashboardLayout searchPlaceholder="Search documents...">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>KAFU Staff Workflow</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>
              Manage submissions, curriculum files, and departmental resources.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Inbox', 'My Files', 'Shared', 'Archive'].map(tab => (
              <button key={tab}
                onClick={() => {
                  if (tab === 'Archive') return navigate('/staff/archive')
                  return navigate('/staff/dashboard')
                }}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 13,
                  border: '1px solid var(--gray-300)',
                  background: 'white', color: 'var(--gray-600)',
                  cursor: 'pointer', fontWeight: 500
                }}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 20 }}>

        {/* Workflow Efficiency */}
        <div className="card">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📈</div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Workflow Efficiency</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                You're currently processing documents 15% faster than last semester.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>{docs.length}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Docs Processed</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--warning)' }}>{pending.length}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Awaiting Review</div>
            </div>
          </div>
        </div>

        {/* Bulk Upload */}
        <div style={{
          border: '2px dashed var(--gray-300)', borderRadius: 12,
          padding: 24, textAlign: 'center', cursor: 'pointer',
          background: 'white', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'white' }}
          onClick={() => navigate('/staff/upload')}
        >
          <div style={{ fontSize: 28 }}>☁️</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>Bulk Upload</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.5 }}>
            Drag and drop curriculum files, rubrics, or departmental notices here.
          </div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 4 }} onClick={() => navigate('/staff/upload')}>Select Files</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Action Required */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>📋 Action Required</h3>
            <button onClick={() => navigate('/staff/approvals')}
              style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              View All
            </button>
          </div>
          {loading ? <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>Loading...</div>
            : actionRequired.length === 0 ? (
              <div style={{ color: 'var(--gray-400)', fontSize: 13, padding: '12px 0' }}>
                ✅ No pending actions
              </div>
            ) : actionRequired.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--gray-100)'
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18 }}>📄</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)' }}>{doc.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                      {doc.uploaded_by?.username} · {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: doc.status === 'pending' ? 'var(--warning-light)' : 'var(--gray-100)',
                  color: doc.status === 'pending' ? 'var(--warning)' : 'var(--gray-500)'
                }}>{doc.status === 'pending' ? 'DUE SOON' : doc.status.toUpperCase()}</span>
              </div>
            ))}
        </div>

        {/* Recent Uploads */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>🕐 Recent Uploads</h3>
          </div>
          {recentUploads.length === 0
            ? <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>No uploads yet</div>
            : recentUploads.map(doc => (
              <div key={doc.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  📄
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                  <span style={{
                    display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                    background: doc.status === 'approved' ? 'var(--success-light)' : 'var(--warning-light)',
                    color: doc.status === 'approved' ? 'var(--success)' : 'var(--warning)'
                  }}>{doc.status === 'approved' ? 'APPROVED' : 'AWAITING REVIEW'}</span>
                </div>
              </div>
            ))}
          <button className="btn btn-outline btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/staff/upload')}>
            + Upload New Document
          </button>
        </div>
      </div>

      {/* My Departments */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>🏫 My Departments</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {departments.map(dept => (
            <div key={dept.name} style={{
              padding: '14px 16px', borderRadius: 10,
              border: '1px solid var(--gray-200)',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {dept.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{dept.name}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{dept.count} Active Files</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── Router ───────────────────────────────────────────────────────
export default function StaffDashboard() {
  return (
    <Routes>
      <Route path="dashboard" element={<StaffHome />} />
      <Route path="approvals" element={<ApprovalQueue />} />
      <Route path="upload" element={<UploadDocument />} />
      <Route path="archive" element={<Archive />} />
      <Route path="reports" element={<Reports />} />
      <Route path="*" element={<StaffHome />} />
    </Routes>
  )
}