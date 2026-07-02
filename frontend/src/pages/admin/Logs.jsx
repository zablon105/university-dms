import { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../api/axios'

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await api.get('/workflows/all/')
      setLogs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = statusFilter === 'All'
    ? logs
    : logs.filter(log => log.status === statusFilter.toLowerCase())

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Logs</h1>
        <p className="page-subtitle">Review audit history, approval decisions, and user activity.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Total Entries</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{logs.length}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Approved</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{logs.filter(l => l.status === 'approved').length}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Pending</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{logs.filter(l => l.status === 'pending').length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, margin: 0 }}>Approval Activity</h2>
            <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: 13 }}>All workflow events captured from the document review pipeline.</p>
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-300)', minWidth: 160 }}
          >
            {['All', 'Approved', 'Pending', 'Rejected'].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              {['Request', 'Document', 'Requested By', 'Reviewer', 'Status', 'Requested At', 'Reviewed At'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>Loading logs...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>No logs found</td></tr>
            ) : filteredLogs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {log.document_detail?.title || 'Unknown document'}
                </td>
                <td>{log.requested_by?.username || 'Unknown'}</td>
                <td>{log.reviewed_by?.username || 'Pending'}</td>
                <td>{log.status}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.reviewed_at ? new Date(log.reviewed_at).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
