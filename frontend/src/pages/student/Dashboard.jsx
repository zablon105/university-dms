import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Routes, Route, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import useAuthStore from '../../store/authStore'
import api from '../../api/axios'
import useScrollReveal from '../../hooks/useScrollReveal'
import { MdInsertChart, MdChat, MdDownload, MdHourglassEmpty, MdSchool, MdDescription, MdStars, MdSearch, MdAssignment, MdBolt, MdWavingHand, MdFolderOpen, MdCalendarToday, MdUpload, MdHandshake, MdEditDocument, MdFolder } from 'react-icons/md';

// ─── Sub-pages ───────────────────
function AcademicDocuments() {
  const [docs, setDocs] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/documents/'), api.get('/categories/')]).then(([d, c]) => {
      setDocs(d.data)
      setCategories(['All', ...c.data.map(cat => cat.name)])
      setLoading(false)
    })
  }, [])

  const filtered = docs.filter(d => {
    const matchCat = activeCategory === 'All' || d.category_detail?.name === activeCategory
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Academic Documents</h1>
        <p className="page-subtitle">Browse and download course materials, syllabi, and official department resources.</p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}><MdSearch /></span>
          <input className="input-field" style={{ paddingLeft: 36 }}
            placeholder="Search documents by name or department..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                border: `1.5px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--gray-300)'}`,
                background: activeCategory === cat ? 'var(--primary)' : 'white',
                color: activeCategory === cat ? 'white' : 'var(--gray-600)',
                fontWeight: activeCategory === cat ? 600 : 400
              }}>{cat}</button>
          ))}
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
          : filtered.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>No documents found</div>
            : filtered.map((doc, i) => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-100)' : 'none',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {doc.file_type === 'pdf' ? <MdDescription /> : doc.file_type === 'docx' ? <MdEditDocument /> : <MdFolder />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-800)' }}>{doc.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, marginRight: 8 }}>
                      {doc.category_detail?.name || 'General'}
                    </span>
                    Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <a href={doc.file} target="_blank" rel="noreferrer">
                  <button className="btn btn-outline btn-sm"><MdDownload /> Download</button>
                </a>
              </div>
            ))}
      </div>
    </>
  )
}

function Assignments() {
  const [myDocs, setMyDocs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', file: null })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [docsRes, catsRes] = await Promise.all([
        api.get('/documents/my/'),
        api.get('/categories/')
      ])
      setMyDocs(docsRes.data)
      setCategories(catsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!form.file) return alert('Please select a file to upload.')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      if (form.category) formData.append('category', form.category)
      formData.append('file', form.file)
      formData.append('status', 'draft')
      formData.append('visibility', 'staff')

      await api.post('/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setForm({ title: '', description: '', category: '', file: null })
      setShowUploadForm(false)
      fetchData()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Unable to upload document. Please check the fields and try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitForReview = async (docId) => {
    if (!window.confirm('Submit this document for staff review? You won\'t be able to edit it while pending.')) return
    try {
      await api.post(`/workflows/submit/${docId}/`)
      alert('Submitted for review.')
      fetchData()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Unable to submit for review.')
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      draft: { bg: '#F1F5F9', color: '#64748B', label: 'Draft' },
      pending: { bg: '#FEF3C7', color: '#D97706', label: 'Pending Review' },
      approved: { bg: '#DCFCE7', color: '#16A34A', label: 'Approved' },
      rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    }
    const s = map[status] || map.draft
    return (
      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
        {s.label}
      </span>
    )
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Submit and track your assignment documents.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowUploadForm(true)}>
          <MdUpload /> Upload Document
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
      ) : myDocs.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}><MdEditDocument /></div>
          <p style={{ color: 'var(--gray-500)' }}>No submissions yet. Click "Upload Document" to get started.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {myDocs.map((doc, i) => (
            <div key={doc.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
              borderBottom: i < myDocs.length - 1 ? '1px solid var(--gray-100)' : 'none'
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                <MdEditDocument />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-800)' }}>{doc.title}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                  {doc.category_detail?.name || 'Uncategorized'} · {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              {getStatusBadge(doc.status)}
              {doc.status === 'draft' && (
                <button className="btn btn-primary btn-sm" onClick={() => handleSubmitForReview(doc.id)}>
                  Submit for Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showUploadForm && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 480, maxHeight: '92vh', background: 'white', borderRadius: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, margin: 0 }}>Upload Document</h2>
              <button onClick={() => setShowUploadForm(false)} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleUpload} style={{ padding: '16px 20px', display: 'grid', gap: 10 }}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select a category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">File</label>
                <input type="file" onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowUploadForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function InstitutionalRecords() {
  const navigate = useNavigate()
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Institutional Records</h1>
        <p className="page-subtitle">View and manage your official academic documents.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: <MdSchool />, title: 'Official Transcripts', sub: 'Current Cumulative GPA: 3.8', badge: 'Verified', badgeColor: '#16A34A', badgeBg: '#DCFCE7', link: '/student/records' },
          { icon: <MdAssignment />, title: 'Enrollment Letters', sub: 'Proof of current registration', badge: 'Active', badgeColor: '#0047AB', badgeBg: '#EBF2FF', link: '/student/academic' },
          { icon: <MdStars />, title: 'Degree Certificates', sub: 'Awaiting graduation clearance', badge: 'Pending', badgeColor: '#D97706', badgeBg: '#FEF3C7', link: '/student/shared' },
        ].map(item => (
          <div key={item.title} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <span style={{ background: item.badgeBg, color: item.badgeColor, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{item.badge}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{item.sub}</div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={() => navigate(item.link)}>View →</button>
          </div>
        ))}
      </div>
    </>
  )
}

function SharedFiles() {
  const [docs, setDocs] = useState([])
  useEffect(() => { api.get('/documents/').then(r => setDocs(r.data)) }, [])
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Shared Files</h1>
        <p className="page-subtitle">Files shared with you by staff and faculty.</p>
      </div>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {docs.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>No shared files yet</div>
          : docs.map((doc, i) => (
            <div key={doc.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < docs.length - 1 ? '1px solid var(--gray-100)' : 'none'
            }}>
              <span style={{ fontSize: 24 }}><MdDescription /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{doc.title}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                  Shared by {doc.uploaded_by?.username} · {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <a href={doc.file} target="_blank" rel="noreferrer">
                <button className="btn btn-outline btn-sm"><MdDownload /> Download</button>
              </a>
            </div>
          ))}
      </div>
    </>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────
function StudentHome() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [myDocs, setMyDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/documents/'),
      api.get('/documents/my/'),
    ]).then(([all, my]) => {
      setDocs(all.data)
      setMyDocs(my.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const pendingDocs = myDocs.filter(d => d.status === 'pending')
  const firstName = user?.first_name || user?.username || 'Student'

  const getFileIcon = (type) => {
    if (type === 'pdf') return { icon: <MdDescription />, bg: '#FEE2E2', color: '#DC2626' }
    if (type === 'docx' || type === 'doc') return { icon: <MdEditDocument />, bg: '#DBEAFE', color: '#1D4ED8' }
    if (type === 'xlsx') return { icon: <MdInsertChart />, bg: '#DCFCE7', color: '#16A34A' }
    return { icon: <MdFolder />, bg: '#F3F4F6', color: '#6B7280' }
  }

  const deadlines = [
    { title: 'Data Structures Essay', course: 'CS202 · Prof. Smith', time: '11:59 PM', urgency: 'today', color: '#DC2626', bg: '#FEE2E2' },
    { title: 'Lab Report 3', course: 'PHY101 · TA Johnson', time: 'Tomorrow', urgency: 'tomorrow', color: '#D97706', bg: '#FEF3C7' },
    { title: 'Weekly Quiz', course: 'MATH210', time: 'Oct 18', urgency: 'later', color: 'var(--gray-500)', bg: 'var(--gray-100)' },
  ]
  const revealRef = useScrollReveal({ stagger: false })
  const statsReveal = useScrollReveal({ stagger: true })

  return (
    <div ref={revealRef}>
      {/* Welcome banner */}
      <div className="reveal" style={{
        background: 'white', borderRadius: 12,
        border: '1px solid var(--border)',
        padding: '20px 24px', marginBottom: 20
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)' }}>
          Welcome back, {firstName} <MdWavingHand />
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>
          You have{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
            {pendingDocs.length} pending documents
          </span>{' '}
          and{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
            {docs.length} files
          </span>{' '}
          shared with you.
        </p>
      </div>

      {/* Stat cards */}
      <div ref={statsReveal} className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL DOCS', value: docs.length, sub: '+12%', icon: <MdFolder />, color: 'var(--primary)' },
          { label: 'PENDING', value: pendingDocs.length, sub: 'Due soon', icon: <MdHourglassEmpty />, color: 'var(--danger)' },
          { label: 'NEW SHARED', value: docs.filter(d => d.visibility === 'public').length, sub: 'This week', icon: <MdHandshake />, color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="reveal stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ marginTop: 8 }}>{s.value}</div>
                <div className="stat-change" style={{ color: s.color, marginTop: 4 }}>{s.sub}</div>
              </div>
              <div className="stat-icon">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Recent Documents */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent Documents</h3>
            <button onClick={() => navigate('/student/academic')}
              style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              View All
            </button>
          </div>

          {loading ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
            : docs.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--gray-400)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}><MdFolderOpen /></div>
                No documents yet
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {docs.slice(0, 4).map(doc => {
                  const fi = getFileIcon(doc.file_type)
                  return (
                    <div key={doc.id} style={{
                      padding: 14, borderRadius: 10,
                      border: '1px solid var(--gray-100)',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: fi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 8 }}>
                        {fi.icon}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                        Modified {new Date(doc.updated_at).toLocaleDateString()}
                      </div>
                      {doc.category_detail && (
                        <span style={{ display: 'inline-block', marginTop: 6, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500 }}>
                          {doc.category_detail.name}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

          {/* Download Files button */}
          <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/student/academic')}>
            <MdDownload /> Download Files
          </button>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Upcoming Deadlines */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}><MdCalendarToday /> Upcoming Deadlines</h3>
            {deadlines.map((d, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '10px 0', borderBottom: i < deadlines.length - 1 ? '1px solid var(--gray-100)' : 'none'
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 3, height: 40, background: d.color, borderRadius: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)' }}>{d.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{d.course}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: d.bg, color: d.color, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    {d.urgency === 'today' ? 'DUE TODAY' : d.urgency === 'tomorrow' ? 'TOMORROW' : d.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}><MdBolt /> Quick Actions</h3>
            {[
              { label: 'Request Transcript', icon: <MdSchool />, onClick: () => navigate('/student/records') },
              { label: 'Contact Support', icon: <MdChat />, onClick: () => window.location.href = 'mailto:support@kaimu.edu?subject=KAFU%20Support' },
            ].map(a => (
              <div key={a.label} onClick={a.onClick} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                marginBottom: 6, border: '1px solid var(--gray-200)'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--gray-700)' }}>
                  <span>{a.icon}</span>{a.label}
                </div>
                <span style={{ color: 'var(--gray-400)' }}>›</span>
              </div>
            ))}
          </div>

          {/* Drag & Drop upload */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: '2px dashed var(--gray-300)', padding: 24,
            textAlign: 'center', cursor: 'pointer'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-300)'}
            onClick={() => navigate('/student/academic')}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}><MdUpload /></div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 4 }}>
              Download Resources
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.5 }}>
              Access course materials and shared files.<br />
              View all available formats.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Router ───────────────────────────────────────────────────────
export default function StudentDashboard() {
  return (
    <DashboardLayout searchPlaceholder="Search files, records...">
      <Routes>
        <Route path="dashboard" element={<StudentHome />} />
        <Route path="academic" element={<AcademicDocuments />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="records" element={<InstitutionalRecords />} />
        <Route path="shared" element={<SharedFiles />} />
        <Route path="*" element={<StudentHome />} />
      </Routes>
    </DashboardLayout>
  )
}