import { useEffect, useRef, useCallback } from 'react'

const IDLE_TIMEOUT = 15 * 60 * 1000      // 15 minutes
const WARNING_TIME = 13 * 60 * 1000      // warn at 13 minutes

export default function useIdleTimer({ onWarning, onLogout }) {
  const idleTimer = useRef(null)
  const warningTimer = useRef(null)
  const warned = useRef(false)

  const resetTimer = useCallback(() => {
    // Clear existing timers
    clearTimeout(idleTimer.current)
    clearTimeout(warningTimer.current)
    warned.current = false

    // Set warning timer — fires at 13 mins
    warningTimer.current = setTimeout(() => {
      warned.current = true
      onWarning()
    }, WARNING_TIME)

    // Set logout timer — fires at 15 mins
    idleTimer.current = setTimeout(() => {
      onLogout()
    }, IDLE_TIMEOUT)
  }, [onWarning, onLogout])

  useEffect(() => {
    const events = [
      'mousemove', 'mousedown', 'keypress',
      'touchstart', 'scroll', 'click'
    ]

    const handleActivity = () => {
      if (!warned.current) resetTimer()
    }

    // Start timer on mount
    resetTimer()

    // Attach activity listeners
    events.forEach(e => window.addEventListener(e, handleActivity))

    return () => {
      clearTimeout(idleTimer.current)
      clearTimeout(warningTimer.current)
      events.forEach(e => window.removeEventListener(e, handleActivity))
    }
  }, [resetTimer])

  return { resetTimer }
}