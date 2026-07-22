import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { MdInsertChart, MdDescription, MdCheckCircle, MdHourglassEmpty, MdCancel, MdDownload, MdTrendingUp } from 'react-icons/md'

export default function Reports() {
  const [myDocs, setMyDocs] = useState([])
  const [allApprovals, setAllApprovals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [docsRes, approvalsRes] = await Promise.all([
        api.get('/documents/my/'),
        api.get('/workflows/all/')
      ])
      setMyDocs(docsRes.data)
      setAllApprovals(approvalsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statusCounts = myDocs.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1
    return acc
  }, {})

  const categoryBreakdown = myDocs.reduce((acc, d) => {
    const name = d.category_detail?.name || 'Uncategorized'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  // Approvals this staff member has reviewed (not just submitted)
  const reviewedByMe = allApprovals.filter(a => a.reviewed_by && a.status !== 'pending')
  const avgTurnaroundHrs = (() => {
    const durations = reviewedByMe
      .filter(a => a.reviewed_at && a.created_at)
      .map(a => (new Date(a.reviewed_at) - new Date(a.created_at)) / (1000 * 60 * 60))
    if (durations.length === 0) return null
    return (durations.reduce((sum, h) => sum + h, 0) / durations.length).toFixed(1)
  })()

  const handleExportCSV = () => {
    const rows = [['Title', 'Category', 'Status', 'Uploaded At']]
    myDocs.forEach(d => {
      rows.push([
        d.title,
        d.category_detail?.name || 'Uncategorized',
        d.status,
        new Date(d.created_at).toLocaleString()
      ])
    })
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'my-document-activity.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading reports...</div>
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Your document activity and approval throughput.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
          <MdDownload /> Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Uploaded', value: myDocs.length, icon: <MdDescription />, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Approved', value: statusCounts.approved || 0, icon: <MdCheckCircle />, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Pending / Draft', value: (statusCounts.pending || 0) + (statusCounts.draft || 0), icon: <MdHourglassEmpty />, color: 'var(--warning)', bg: 'var(--warning-light)' },
          { label: 'Rejected', value: statusCounts.rejected || 0, icon: <MdCancel />, color: 'var(--danger)', bg: '#FEE2E2' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gray-900)', marginTop: 4 }}>{s.value}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Category breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}><MdInsertChart /> Documents by Category</h3>
          {Object.keys(categoryBreakdown).length === 0 ? (
            <div style={{ color: 'var(--gray-400)', fontSize: 13, padding: '12px 0' }}>No documents uploaded yet.</div>
          ) : Object.entries(categoryBreakdown).map(([category, count]) => (
            <div key={category} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--gray-700)' }}>
                <span>{category}</span>
                <span>{count} docs</span>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: 8, overflow: 'hidden', height: 8 }}>
                <div style={{
                  width: `${Math.min(100, Math.round((count / myDocs.length) * 100))}%`,
                  height: '100%', background: 'var(--primary)'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Approval throughput */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}><MdTrendingUp /> Approval Throughput</h3>
          <div style={{ display: 'flex', gap: 32, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{reviewedByMe.length}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Requests Reviewed</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success)' }}>
                {avgTurnaroundHrs !== null ? `${avgTurnaroundHrs} hrs` : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Avg. Turnaround</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 12 }}>
            Turnaround measures the time between a student's submission and your review decision.
          </p>
        </div>
      </div>
    </>
  )
}
