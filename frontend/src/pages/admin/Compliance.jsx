import { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../api/axios'

export default function AdminCompliance() {
  const [documents, setDocuments] = useState([])
  const [categories, setCategories] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    try {
      const [docsRes, categoriesRes, workflowsRes] = await Promise.all([
        api.get('/documents/'),
        api.get('/categories/'),
        api.get('/workflows/all/')
      ])
      setDocuments(docsRes.data)
      setCategories(categoriesRes.data)
      setWorkflows(workflowsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const documentsPending = documents.filter(d => d.status === 'pending').length
  const documentsApproved = documents.filter(d => d.status === 'approved').length
  const documentsRejected = documents.filter(d => d.status === 'rejected').length
  const categoryCoverage = categories.length
  const approvalCoverage = workflows.length

  return (
    <DashboardLayout searchPlaceholder="Search compliance...">
      <div className="page-header">
        <h1 className="page-title">Compliance</h1>
        <p className="page-subtitle">Monitor policy status, audit findings, and control compliance for KAFU records.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Category Coverage', value: categoryCoverage, description: 'Approval categories tracked' },
          { label: 'Verified Documents', value: documentsApproved, description: 'Documents passed review' },
          { label: 'Pending Compliance', value: documentsPending, description: 'Documents awaiting review' },
          { label: 'Approval Events', value: approvalCoverage, description: 'Audit actions recorded' }
        ].map(card => (
          <div key={card.label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--gray-900)' }}>{card.value}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 6 }}>{card.description}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize: 16, margin: 0 }}>Approval & Policy Summary</h2>
            <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: 13 }}>Review document compliance by category and current status.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={loadComplianceData}>Refresh</button>
        </div>
        <div style={{ padding: 20, overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                {['Category', 'Documents', 'Approved', 'Pending', 'Rejected'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>Loading compliance data...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>No categories available</td></tr>
              ) : categories.map(cat => {
                const docsInCategory = documents.filter(d => d.category_detail?.id === cat.id)
                const approvedCount = docsInCategory.filter(d => d.status === 'approved').length
                const pendingCount = docsInCategory.filter(d => d.status === 'pending').length
                const rejectedCount = docsInCategory.filter(d => d.status === 'rejected').length
                return (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td>{docsInCategory.length}</td>
                    <td>{approvedCount}</td>
                    <td>{pendingCount}</td>
                    <td>{rejectedCount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Compliance Notes</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 16 }}>
          Documents with pending or rejected status should be reviewed by the admin team for policy and regulatory compliance.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ background: '#FEF3C7', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#9A6B04', marginBottom: 6 }}>Attention</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{documentsPending}</div>
            <div style={{ fontSize: 12, color: '#92400E' }}>Documents pending review</div>
          </div>
          <div style={{ background: '#DBEAFE', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#1D4ED8', marginBottom: 6 }}>Review Coverage</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{approvalCoverage}</div>
            <div style={{ fontSize: 12, color: '#1E40AF' }}>Approval events logged</div>
          </div>
          <div style={{ background: '#DCFCE7', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#166534', marginBottom: 6 }}>Verified</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{documentsApproved}</div>
            <div style={{ fontSize: 12, color: '#14532D' }}>Documents compliant with policy</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
