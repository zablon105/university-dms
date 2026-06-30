import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

function StudentStaffLogin() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [tab, setTab] = useState('student')
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // ── CAPTCHA state ──────────────────────────────────────────────
  const generateQuestion = () => {
    const ops = ['+', '-']
    const op = ops[Math.floor(Math.random() * ops.length)]
    let a = Math.floor(Math.random() * 15) + 2
    let b = Math.floor(Math.random() * 10) + 1
    if (op === '-' && b > a) [a, b] = [b, a] // avoid negatives
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
      if (tab === 'student' && user.role !== 'student') {
        setError('This login is for students only.')
        setLoading(false)
        setCaptcha(generateQuestion())
        setCaptchaInput('')
        return
      }
      if (tab === 'staff' && user.role !== 'staff') {
        setError('This login is for staff only.')
        setLoading(false)
        setCaptcha(generateQuestion())
        setCaptchaInput('')
        return
      }
      login(user, res.data.access, res.data.refresh)
      if (user.role === 'staff') navigate('/staff/dashboard')
      else navigate('/student/dashboard')
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
      {/* Left — university photo panel */}
      <div style={{
        width: '45%', position: 'relative',
        background: 'linear-gradient(160deg, #0a1628 0%, #1a3a6b 50%, #0d2451 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 48,
        overflow: 'hidden'
      }}>
        {/* Background image overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.35
        }} />
        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to top, rgba(5,15,40,0.95) 0%, rgba(5,15,40,0.4) 60%, rgba(5,15,40,0.2) 100%)'
        }} />
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <div style={{ position: 'absolute', top: -280, left: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>KAFU</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Welcome to your<br />Academic<br />Resource Hub.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Access your documents, assignments, and academic records in a quiet, organized space designed for cognitive ease.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['🔒 Secure Access', '⚡ Instant Sync'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div style={{
        width: '55%', background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Sign In</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
            Enter your institutional credentials to access the DocLibrary portal.
          </p>

          {/* Idle logout message */}
          {new URLSearchParams(window.location.search).get('reason') === 'idle' && (
            <div style={{
              background: '#FEF3C7', border: '1px solid #FDE68A',
              borderRadius: 8, padding: '12px 16px',
              color: '#92400E', fontSize: 13, marginBottom: 20,
              display: 'flex', gap: 8, alignItems: 'center'
            }}>
              <span>⏰</span>
              <span>You were automatically logged out due to inactivity. Please sign in again.</span>
            </div>
          )}

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: '#f1f5f9', borderRadius: 10,
            padding: 4, marginBottom: 24, gap: 4
          }}>
            {['student', 'staff'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? '#0047AB' : '#64748b',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                }}>
                {t === 'student' ? '🎓 Student Login' : '📋 Staff Login'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', color: '#DC2626', fontSize: 13, marginBottom: 18 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">
                Institutional ID {tab === 'student' ? '(Student)' : '(Staff)'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }}>🪪</span>
                <input className="input-field" style={{ paddingLeft: 38 }}
                  type="text" name="username"
                  placeholder={tab === 'student' ? 'e.g. STU-123456' : 'e.g. STF-001'}
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="input-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#0047AB', fontWeight: 500 }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }}>🔑</span>
                <input className="input-field" style={{ paddingLeft: 38, paddingRight: 44 }}
                  type={showPassword ? 'text' : 'password'} name="password"
                  placeholder="••••••••"
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
              Remember this device for 30 days
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
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : `Log In to ${tab === 'student' ? 'Student' : 'Staff'} Portal →`}
            </button>
          </form>

          <div style={{
            marginTop: 24, padding: '16px 20px',
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 12, textAlign: 'center'
          }}>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
              Don't have an account yet?
            </p>
            <Link to="/register">
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                👤 Create New Account →
              </button>
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/admin-login" style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              🔐 Administrator Login
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24, color: '#94a3b8', fontSize: 12 }}>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span>·</span>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span>·</span>
            <span style={{ cursor: 'pointer' }}>Support Center</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentStaffLogin