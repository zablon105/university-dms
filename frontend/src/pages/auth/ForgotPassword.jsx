import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import {
  MdEmail, MdLock, MdRefresh, MdArrowBack,
  MdCheckCircle, MdInfo, MdSend, MdLockReset
} from 'react-icons/md'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=email, 2=otp+reset, 3=success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/password/request-otp/', { email })
      setMessage(res.data.message)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to send OTP.')
    } finally { setLoading(false) }
  }

  const handleOTPChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp)
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus()
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length < 6) { setError('Enter the complete 6-digit OTP.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/auth/password/verify-otp/', { email, otp: otpCode, new_password: newPassword })
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP or request failed.')
    } finally { setLoading(false) }
  }

  const cardStyle = {
    // using form-container class instead
  }

  const strengthBars = (pw) => {
    const len = pw.length
    return [
      len >= 3 ? (len < 6 ? '#ef4444' : '#f59e0b') : '#e2e8f0',
      len >= 6 ? (len < 10 ? '#f59e0b' : '#22c55e') : '#e2e8f0',
      len >= 10 ? '#22c55e' : '#e2e8f0',
      len >= 14 ? '#1a56db' : '#e2e8f0',
    ]
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', padding: 24,
      flexDirection: 'column', gap: 20
    }}>
      {/* Brand header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg,#1a56db,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,86,219,0.3)' }}>
          <MdLockReset style={{ color: 'white', fontSize: 18 }} />
        </div>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--gray-800)', letterSpacing: '0.06em' }}>
          DocLibrary — Password Reset
        </span>
      </div>

      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* ── Step 1 — Enter email ────────────────────────── */}
        {step === 1 && (
          <div className="form-container">
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '2px solid #bfdbfe' }}>
                <MdEmail size={28} color="var(--primary)" />
              </div>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, letterSpacing: '0.03em' }}>
                Forgot Password
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 14, lineHeight: 1.65 }}>
                Enter your institutional email and we'll send you a 6-digit OTP.
              </p>
            </div>

            {error && (
              <div style={{ background: 'var(--danger-light)', border: '1px solid #fca5a5', borderRadius: 5, padding: '10px 14px', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit}>
              <div className="input-group">
                <label className="input-label">Institutional Email</label>
                <div style={{ position: 'relative' }}>
                  <MdEmail style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                  <input className="input-field" style={{ paddingLeft: 36 }}
                    type="email" placeholder="username@institution.edu"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ opacity: loading ? 0.78 : 1 }}>
                {loading ? 'Sending OTP…' : <><MdSend size={15} /> Send OTP</>}
              </button>
            </form>

            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--info-light)', borderRadius: 5, border: '1px solid #bae6fd', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <MdInfo size={15} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                OTP links expire after <strong>10 minutes</strong>. Check your spam folder if not received.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--gray-500)', transition: 'color 0.18s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}
              >
                <MdArrowBack size={15} /> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* ── Step 2 — OTP + new password ─────────────────── */}
        {step === 2 && (
          <div className="form-container">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '2px solid #bbf7d0' }}>
                <MdEmail size={28} color="var(--success)" />
              </div>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, letterSpacing: '0.03em' }}>
                Check Your Email
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 14, lineHeight: 1.65 }}>
                {message || 'We sent a 6-digit OTP to'}<br />
                <strong style={{ color: 'var(--primary)' }}>{email}</strong>
              </p>
            </div>

            {error && (
              <div style={{ background: 'var(--danger-light)', border: '1px solid #fca5a5', borderRadius: 5, padding: '10px 14px', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleResetSubmit}>
              {/* OTP boxes */}
              <div className="input-group">
                <label className="input-label">6-Digit OTP Code</label>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 6 }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i} id={`otp-${i}`}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOTPChange(i, e.target.value)}
                      onKeyDown={e => handleOTPKeyDown(i, e)}
                      style={{
                        width: 50, height: 54, textAlign: 'center',
                        fontSize: 22, fontWeight: 700,
                        border: `2px solid ${digit ? 'var(--primary)' : 'var(--gray-200)'}`,
                        borderRadius: 6, outline: 'none',
                        background: digit ? 'var(--primary-light)' : 'white',
                        color: 'var(--primary)', transition: 'all 0.15s',
                        cursor: 'text',
                      }}
                    />
                  ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>OTP expires in 10 min · </span>
                  <button type="button"
                    onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError('') }}
                    style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <MdRefresh size={12} /> Resend
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <MdLock style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                  <input className="input-field" style={{ paddingLeft: 36 }} type="password"
                    placeholder="Min 8 characters" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} required />
                </div>
                {newPassword && (
                  <div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
                      {strengthBars(newPassword).map((c, i) => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: c, transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                      {newPassword.length < 6 ? 'Too short' : newPassword.length < 10 ? 'Weak' : newPassword.length < 14 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <MdLock style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                  <input className="input-field" style={{ paddingLeft: 36 }} type="password"
                    placeholder="Repeat new password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span style={{ fontSize: 11, color: 'var(--danger)' }}>✗ Passwords don't match</span>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ opacity: loading ? 0.78 : 1 }}>
                {loading ? 'Resetting…' : <><MdLockReset size={15} /> Reset Password</>}
              </button>
            </form>
          </div>
        )}

        {/* ── Step 3 — Success ─────────────────────────────── */}
        {step === 3 && (
          <div className="form-container" style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #bbf7d0' }}>
              <MdCheckCircle size={38} color="var(--success)" />
            </div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 700, color: 'var(--success)', marginBottom: 8, letterSpacing: '0.02em' }}>
              Password Reset!
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
              Your password has been updated. You can now log in with your new credentials.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}