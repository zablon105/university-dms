import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function AdminLogin() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const generateQuestion = () => {
    const ops = ['+', '-']
    const op = ops[Math.floor(Math.random() * ops.length)]
    let a = Math.floor(Math.random() * 15) + 2
    let b = Math.floor(Math.random() * 10) + 1
    if (op === '-' && b > a) [a, b] = [b, a]
    return { a, b, op, answer: op === '+' ? a + b : a - b }
  }

  const [captcha, setCaptcha] = useState(generateQuestion)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verify captcha
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError(true)
      setCaptcha(generateQuestion())
      setCaptchaInput('')
      return
    }
    setCaptchaError(false)
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login/', form)
      const user = res.data.user
      if (user.role !== 'admin') {
        setError('Access denied. This portal is for administrators only.')
        setLoading(false)
        setCaptcha(generateQuestion())
        setCaptchaInput('')
        return
      }
      login(user, res.data.access, res.data.refresh)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.')
      setCaptcha(generateQuestion())
      setCaptchaInput('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel — dark institutional */}
      <div style={{
        width: '45%', position: 'relative',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: 48, overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center'
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to top, rgba(2,8,23,0.97) 0%, rgba(2,8,23,0.6) 50%, rgba(2,8,23,0.3) 100%)'
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <div style={{ position: 'absolute', top: -300, left: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🏛️</span>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 16, letterSpacing: '2px' }}>KAFU ARCHIVE</span>
            </div>
          </div>
          <h1 style={{ color: 'white', fontSize: 30, fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
            Admin Central:<br />
            <span style={{ color: '#60a5fa' }}>Institutional<br />Oversight</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.7, marginBottom: 28 }}>
            Welcome to the central command for the Kaimosi Friends University digital repository.
            Manage institutional records, monitor compliance, and oversee system logistics from one secure dashboard.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { icon: '🛡️', text: 'Tier-3 Security Protocol' },
              { icon: '📊', text: 'Real-time System Audit' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: '55%', background: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>📚</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0047AB' }}>DocLibrary Admin</span>
              </div>
              <Link to="/login" style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                ← Back to Institutional Portal
              </Link>
            </div>
          </div>

          {/* Authorized badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 20, padding: '4px 12px', marginBottom: 20
          }}>
            <span style={{ fontSize: 12 }}>🔴</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', letterSpacing: '0.5px' }}>
              AUTHORIZED PERSONNEL ONLY
            </span>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Administrator Login
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>
            Access restricted to university governance and IT staff.
          </p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', color: '#DC2626', fontSize: 13, marginBottom: 18 }}>
              🚫 {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Administrator ID</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }}>🪪</span>
                <input className="input-field" style={{ paddingLeft: 38, background: 'white' }}
                  type="text" placeholder="e.g. KAFU-ADM-0000"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#0047AB', fontWeight: 500 }}>Reset Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }}>🔑</span>
                <input className="input-field" style={{ paddingLeft: 38, paddingRight: 44, background: 'white' }}
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', marginBottom: 20, cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: 15, height: 15, accentColor: '#0047AB' }} />
              Remember this workstation
            </label>

            {/* Math CAPTCHA */}
            <div style={{
              background: '#F8FAFC', border: '1.5px solid #E2E8F0',
              borderRadius: 10, padding: '16px 20px', marginBottom: 16
            }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 10
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: '0.5px' }}>
                  🤖 HUMAN VERIFICATION
                </span>
                <button type="button"
                  onClick={() => { setCaptcha(generateQuestion()); setCaptchaInput(''); setCaptchaError(false) }}
                  style={{ fontSize: 11, color: '#0047AB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  🔄 New question
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  background: '#0047AB', color: 'white',
                  padding: '10px 18px', borderRadius: 8,
                  fontSize: 18, fontWeight: 700, letterSpacing: '1px',
                  fontFamily: 'monospace', userSelect: 'none'
                }}>
                  {captcha.a} {captcha.op} {captcha.b} = ?
                </div>
                <span style={{ color: '#94A3B8', fontSize: 18 }}>→</span>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={e => { setCaptchaInput(e.target.value); setCaptchaError(false) }}
                  placeholder="Answer"
                  style={{
                    width: 90, padding: '10px 14px',
                    border: `2px solid ${captchaError ? '#DC2626' : '#E2E8F0'}`,
                    borderRadius: 8, fontSize: 16, fontWeight: 700,
                    textAlign: 'center', outline: 'none',
                    background: captchaError ? '#FEF2F2' : 'white',
                    color: captchaError ? '#DC2626' : '#0F172A'
                  }}
                />
              </div>
              {captchaError && (
                <div style={{ color: '#DC2626', fontSize: 12, marginTop: 8, fontWeight: 500 }}>
                  ❌ Wrong answer. A new question has been generated.
                </div>
              )}
              {captchaInput && parseInt(captchaInput) === captcha.answer && (
                <div style={{ color: '#16A34A', fontSize: 12, marginTop: 8, fontWeight: 500 }}>
                  ✅ Correct! You may proceed.
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, background: '#1e3a8a' }}>
              {loading ? 'Verifying...' : 'Log In to Admin Central →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>OR SECURE VIA</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Hardware key */}
          <button style={{
            width: '100%', padding: '12px', borderRadius: 10,
            border: '1.5px solid #e2e8f0', background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#0047AB'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <span style={{ fontSize: 18 }}>🔐</span>
            Hardware Security Key
          </button>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>© 2024 KAFU Admin</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {['Policy', 'Support'].map(l => (
                <span key={l} style={{ fontSize: 11, color: '#64748b', cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>⚙ System Node: KAFU-ARC-HQ-01</div>
          </div>
        </div>
      </div>
    </div>
  )
}