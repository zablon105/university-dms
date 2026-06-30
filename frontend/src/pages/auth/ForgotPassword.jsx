import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=email, 2=otp, 3=success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/password/request-otp/', { email })
      setMessage(res.data.message)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    // Auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit OTP.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/password/verify-otp/', {
        email,
        otp: otpCode,
        new_password: newPassword
      })
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP or request failed.')
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = {
    background: 'white', borderRadius: 16,
    padding: '40px', maxWidth: 440,
    width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #E2E8F0'
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#F1F5F9', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Step 1 — Enter email */}
        {step === 1 && (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: '#EBF2FF', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 26, margin: '0 auto 16px'
              }}>🔄</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Forgot Password
              </h2>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                Enter your institutional email address and we'll send you a 6-digit OTP to reset your password.
              </p>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit}>
              <div className="input-group">
                <label className="input-label">Institutional Email</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>✉️</span>
                  <input className="input-field" style={{ paddingLeft: 36 }}
                    type="email" placeholder="username@institution.edu"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg"
                disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending OTP...' : 'Send OTP →'}
              </button>
            </form>

            <div style={{
              marginTop: 20, padding: 14,
              background: '#F0F9FF', borderRadius: 8, border: '1px solid #BAE6FD'
            }}>
              <p style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.6 }}>
                ℹ️ For security, KAFU resets are authorized via the Student Information System.
                OTP links expire after <strong>10 minutes</strong>.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link to="/login" style={{ fontSize: 14, color: '#0047AB', fontWeight: 500 }}>
                ← Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* Step 2 — Enter OTP + new password */}
        {step === 2 && (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: '#DCFCE7', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 26, margin: '0 auto 16px'
              }}>📧</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Check Your Email
              </h2>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                {message || `We sent a 6-digit OTP to`} <br />
                <strong style={{ color: '#0047AB' }}>{email}</strong>
              </p>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleResetSubmit}>
              {/* OTP input boxes */}
              <div className="input-group">
                <label className="input-label">Enter 6-digit OTP</label>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 4 }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOTPChange(i, e.target.value)}
                      onKeyDown={e => handleOTPKeyDown(i, e)}
                      style={{
                        width: 52, height: 56,
                        textAlign: 'center', fontSize: 22,
                        fontWeight: 700, border: `2px solid ${digit ? '#0047AB' : '#E2E8F0'}`,
                        borderRadius: 10, outline: 'none',
                        background: digit ? '#EBF2FF' : 'white',
                        color: '#0047AB', transition: 'all 0.15s'
                      }}
                    />
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>OTP expires in 10 minutes · </span>
                  <button type="button"
                    onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError('') }}
                    style={{ fontSize: 12, color: '#0047AB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    Resend OTP
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="input-group">
                <label className="input-label">New Password</label>
                <input className="input-field" type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} required />
              </div>

              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input className="input-field" type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} required />
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: newPassword.length >= i * 3
                          ? i <= 1 ? '#DC2626' : i <= 2 ? '#D97706' : i <= 3 ? '#16A34A' : '#0047AB'
                          : '#E2E8F0'
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {newPassword.length < 6 ? '🔴 Too short'
                      : newPassword.length < 8 ? '🟡 Weak'
                      : newPassword.length < 12 ? '🟢 Good'
                      : '🔵 Strong'}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg"
                disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Resetting...' : '🔐 Reset Password'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#16A34A', marginBottom: 8 }}>
              Password Reset Successfully!
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              Your password has been updated. You can now log in with your new password.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              → Go to Login
            </button>
          </div>
        )}

      </div>
    </div>
  )
}