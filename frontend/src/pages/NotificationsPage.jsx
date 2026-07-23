import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../api/axios'

function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function mapNotification(n) {
  const msg = n.message.toLowerCase()
  const type = msg.includes('rejected') ? 'warning' : msg.includes('approved') ? 'success' : 'info'
  const title = n.link?.includes('/admin/users') ? 'New Registration'
    : n.link?.includes('/staff/approvals') ? 'Document Submitted'
    : n.link?.includes('/login') ? 'Account Approved'
    : 'Document Update'

  return {
    id: n.id,
    type,
    read: n.is_read,
    title,
    body: n.message,
    time: formatRelativeTime(n.created_at),
    link: n.link
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/')
        setNotifications((res.data || []).map(mapNotification))
      } catch (err) {
        console.error('Failed to load notifications', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleOpen = async (id, link) => {
    const existing = notifications.find(n => n.id === id)
    if (!existing?.read) {
      try {
        await api.post(`/notifications/${id}/read/`)
        setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
      } catch (err) {
        console.error('Failed to mark notification as read', err)
      }
    }

    if (link) navigate(link)
  }

  return (
    <DashboardLayout searchPlaceholder="Search notifications...">
      <div style={{ display: 'grid', gap: 18 }}>
        <div className="page-header">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Review the latest updates from the system and open the linked page when needed.</p>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            {loading ? (
              <div style={{ color: 'var(--text-secondary)' }}>Loading notifications…</div>
            ) : notifications.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>No notifications yet.</div>
            ) : notifications.map(item => (
              <button
                key={item.id}
                onClick={() => handleOpen(item.id, item.link)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: '1px solid var(--border)',
                  background: item.read ? 'var(--bg-card)' : 'rgba(14,165,233,0.06)',
                  borderRadius: 12,
                  padding: 14,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{item.body}</div>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12, whiteSpace: 'nowrap' }}>{item.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
