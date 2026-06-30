import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import IdleWarningModal from '../components/IdleWarningModal'
import useIdleTimer from '../hooks/useIdleTimer'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

export default function DashboardLayout({ children, searchPlaceholder }) {
  const [showWarning, setShowWarning] = useState(false)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    setShowWarning(false)
    try {
      await api.post('/auth/logout/', {
        refresh: localStorage.getItem('refresh_token')
      })
    } catch {}
    logout()
    navigate('/login?reason=idle')
  }, [logout, navigate])

  const handleWarning = useCallback(() => {
    setShowWarning(true)
  }, [])

  const handleStay = useCallback(() => {
    setShowWarning(false)
    resetTimer()
  }, [])

  const { resetTimer } = useIdleTimer({
    onWarning: handleWarning,
    onLogout: handleLogout,
  })

  return (
    <div className="app-layout">
      {/* Idle warning modal */}
      {showWarning && (
        <IdleWarningModal
          onStay={handleStay}
          onLogout={handleLogout}
        />
      )}

      <Sidebar />
      <div className="main-content">
        <TopBar searchPlaceholder={searchPlaceholder} />
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  )
}