import { useState, useCallback } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import Footer from './Footer'
import IdleWarningModal from '../components/IdleWarningModal'
import useIdleTimer from '../hooks/useIdleTimer'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

export default function DashboardLayout({ searchPlaceholder, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    setShowWarning(false)
    try {
      await api.post('/auth/logout/', {
        refresh: localStorage.getItem('refresh_token')
      })
    } catch { }
    logout()
    navigate('/login?reason=idle')
  }, [logout, navigate])

  const handleWarning = useCallback(() => {
    setShowWarning(true)
  }, [])

  const { resetTimer } = useIdleTimer({
    onWarning: handleWarning,
    onLogout: handleLogout,
  })

  const handleStay = useCallback(() => {
    setShowWarning(false)
    resetTimer()
  }, [resetTimer])

  return (
    <div className="app-layout">
      {showWarning && (
        <IdleWarningModal onStay={handleStay} onLogout={handleLogout} />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <TopBar
          searchPlaceholder={searchPlaceholder}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="page-body bg-mesh animate-fade-in" style={{ paddingBottom: 160 }}>
          {children || <Outlet />}
        </div>
        <Footer />
        <BottomNav />
      </div>
    </div>
  )
}