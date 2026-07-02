import { MdInsertChart } from 'react-icons/md';

export default function Reports() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate staff activity and document archive insights.</p>
      </div>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}><MdInsertChart /></div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Reports are coming soon.</div>
        <div style={{ color: 'var(--gray-500)', fontSize: 14, lineHeight: 1.6 }}>
          Create exportable performance summaries, approval throughput, and file metrics here.
        </div>
      </div>
    </>
  )
}
