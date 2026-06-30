import { useState, useEffect } from 'react'

export default function IdleWarningModal({ onStay, onLogout }) {
  const [seconds, setSeconds] = useState(120) // 2 minute countdown

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onLogout])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const urgency = seconds <= 30

  return (
    // Backdrop
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white', borderRadius: 16,
        padding: '36px 40px', maxWidth: 420, width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center', animation: 'slideUp 0.3s ease'
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: urgency ? '#FEE2E2' : '#FEF3C7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 20px'
        }}>
          {urgency ? '🚨' : '⏰'}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 20, fontWeight: 700,
          color: urgency ? '#DC2626' : '#92400E',
          marginBottom: 8
        }}>
          Session Expiring Soon
        </h2>

        <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          You have been inactive. For your security, you will be automatically
          logged out in:
        </p>

        {/* Countdown */}
        <div style={{
          fontSize: 48, fontWeight: 800,
          color: urgency ? '#DC2626' : '#D97706',
          marginBottom: 8, fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-1px'
        }}>
          {formatTime(seconds)}
        </div>

        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 28 }}>
          minutes remaining
        </p>

        {/* Progress bar */}
        <div style={{
          height: 6, background: '#F3F4F6',
          borderRadius: 3, marginBottom: 28, overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: urgency ? '#DC2626' : '#D97706',
            width: `${(seconds / 120) * 100}%`,
            transition: 'width 1s linear'
          }} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onLogout}
            style={{
              flex: 1, padding: '12px',
              borderRadius: 10, border: '1.5px solid #E5E7EB',
              background: 'white', color: '#6B7280',
              fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#DC2626'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
          >
            Logout Now
          </button>
          <button
            onClick={onStay}
            style={{
              flex: 2, padding: '12px',
              borderRadius: 10, border: 'none',
              background: 'var(--primary)', color: 'white',
              fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
          >
            ✓ Stay Logged In
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#D1D5DB', marginTop: 16 }}>
          Move your mouse or press any key to reset the timer
        </p>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}