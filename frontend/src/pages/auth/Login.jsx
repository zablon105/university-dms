import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { MdClose, 
MdRefresh, MdSchool
, MdVisibility, MdCheck, 
MdPerson, MdShield, MdLogin, MdLock, MdWarning, MdVisibilityOff, MdBolt } from 'react-icons/md'

const generateQuestion = () => {
  const ops = ['+', '-']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a = Math.floor(Math.random() * 15) + 2
  let b = Math.floor(Math.random() * 10) + 1
  if (op === '-' && b > a) [a, b] = [b, a]
  return { a, b, op, answer: op === '+' ? a + b : a - b }
}

const features = [
  { icon: MdShield, text: 'Encrypted & Secure' },
  { icon: MdBolt, text: 'Instant Access' },
  { icon: MdSchool, text: 'KAFU Institutional' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState(generateQuestion)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)

  const isFlippingIn = location.state?.fromFlip
  const isIdle = new URLSearchParams(window.location.search).get('reason') === 'idle'

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      login(user, res.data.access, res.data.refresh)
      if (user.role === 'admin') navigate('/admin/dashboard')
      else if (user.role === 'staff') navigate('/staff/dashboard')
      else navigate('/student/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.')
      setCaptcha(generateQuestion())
      setCaptchaInput('')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminClick = (e) => {
    e.preventDefault()
    setIsFlipping(true)
    setTimeout(() => {
      navigate('/admin-login', { state: { fromFlip: true } })
    }, 1400) // Delay to let the page flip animation complete
  }

  const handleRegisterClick = (e) => {
    e.preventDefault()
    setIsFlipping(true)
    setTimeout(() => {
      navigate('/register', { state: { fromFlip: true } })
    }, 1400)
  }

  return (
    <div className={`${isFlippingIn && !isFlipping ? 'flip-page-in' : ''} ${isFlipping ? 'flip-page-out' : ''}`.trim()} style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── Left hero panel ──────────────────────────────────── */}
      <div style={{
        width: '44%', position: 'relative',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: 48, overflow: 'hidden'
      }} className="auth-panel-left">
        {/* BG image */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        {/* gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to top, rgba(5,15,40,0.97) 0%, rgba(5,15,40,0.55) 55%, rgba(5,15,40,0.18) 100%)'
        }} />
        {/* pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 40px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 40px)`,
        }} />

        {/* Logo top */}
        <div style={{ position: 'absolute', top: 36, left: 40, zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 6,
            background: 'linear-gradient(135deg, #1a56db, #60a5fa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(26,86,219,0.4)'
          }}>
            <MdSchool style={{ color: 'white', fontSize: 20 }} />
          </div>
          <span style={{ color: 'white', fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 16, letterSpacing: '0.08em' }}>
            DocLibrary
          </span>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(26,86,219,0.25)', border: '1px solid rgba(26,86,219,0.4)',
            borderRadius: 4, padding: '4px 12px', marginBottom: 18
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 6px #60a5fa' }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', color: '#93c5fd', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Secure Portal
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Oswald, sans-serif',
            color: 'white', fontSize: 40, fontWeight: 700,
            lineHeight: 1.15, marginBottom: 16, letterSpacing: '0.02em'
          }}>
            Welcome to Your<br />
            <span style={{ color: '#60a5fa' }}>Academic</span><br />
            Resource Hub
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.75, marginBottom: 28, maxWidth: 360 }}>
            Access your documents, assignments, and academic records in a secure, organized space designed for cognitive ease.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 4, padding: '6px 12px',
              }}>
                <Icon size={14} style={{ color: '#93c5fd', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div style={{
        width: '56%', background: 'var(--bg-page)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '48px 56px',
        overflowY: 'auto'
      }}>
        <div className="form-container" style={{ width: '100%', maxWidth: 460 }}>

          {/* Header */}
          <div style={{ marginBottom: 30 }}>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 30, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, letterSpacing: '0.02em' }}>
              Sign In
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, lineHeight: 1.6 }}>
              Enter your institutional credentials to access the DocLibrary portal.
            </p>
          </div>

          {/* Idle message */}
          {isIdle && (
            <div style={{
              background: '#fef3c7', border: '1px solid #fde68a',
              borderRadius: 5, padding: '10px 14px',
              color: '#92400e', fontSize: 13, marginBottom: 18,
              display: 'flex', gap: 8, alignItems: 'center'
            }}>
              <MdLock size={15} />
              You were signed out due to inactivity. Please sign in again.
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--danger-light)', border: '1px solid #fca5a5',
              borderRadius: 5, padding: '10px 14px',
              color: 'var(--danger)', fontSize: 13, marginBottom: 18,
              display: 'flex', gap: 8, alignItems: 'center'
            }}>
              <MdWarning /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="input-group">
              <label className="input-label">Username / Registration Number</label>
              <div style={{ position: 'relative' }}>
                <MdPerson style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: 36 }}
                  type="text"
                  placeholder="e.g. COM/0028/2023 or admin"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>The system will automatically detect your role</span>
            </div>

            {/* Password */}
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: 36, paddingRight: 42 }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 11, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--gray-400)',
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.18s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gray-700)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-400)'}
                >
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray-600)', marginBottom: 18, cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: 14, height: 14, accentColor: 'var(--primary)' }} />
              Remember this device for 30 days
            </label>

            {/* CAPTCHA */}
            <div style={{
              background: 'var(--gray-50)', border: `1.5px solid ${captchaError ? '#fca5a5' : 'var(--gray-200)'}`,
              borderRadius: 6, padding: '14px 16px', marginBottom: 18,
              transition: 'border-color 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Human Verification
                </span>
                <button
                  type="button"
                  onClick={() => { setCaptcha(generateQuestion()); setCaptchaInput(''); setCaptchaError(false) }}
                  style={{
                    fontSize: 12, color: 'var(--primary)', background: 'none',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em'
                  }}
                >
                  <MdRefresh size={14} /> Refresh
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  background: 'var(--primary)', color: 'white',
                  padding: '9px 16px', borderRadius: 5,
                  fontFamily: 'monospace', fontSize: 19, fontWeight: 700,
                  userSelect: 'none', letterSpacing: '0.08em',
                  boxShadow: '0 2px 8px rgba(26,86,219,0.25)'
                }}>
                  {captcha.a} {captcha.op} {captcha.b} = ?
                </div>
                <span style={{ color: 'var(--gray-400)', fontSize: 18 }}>→</span>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={e => { setCaptchaInput(e.target.value); setCaptchaError(false) }}
                  placeholder="?"
                  style={{
                    width: 80, padding: '9px 12px',
                    border: `2px solid ${captchaError ? 'var(--danger)' : captchaInput && parseInt(captchaInput) === captcha.answer ? 'var(--success)' : 'var(--gray-200)'}`,
                    borderRadius: 5, fontSize: 16, fontWeight: 700,
                    textAlign: 'center', outline: 'none',
                    background: captchaError ? 'var(--danger-light)' : 'white',
                    color: captchaError ? 'var(--danger)' : 'var(--gray-900)',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>
              {captchaError && (
                <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8, fontWeight: 500, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <MdClose /> Wrong answer — a new question has been generated.
                </div>
              )}
              {captchaInput && parseInt(captchaInput) === captcha.answer && (
                <div style={{ color: 'var(--success)', fontSize: 12, marginTop: 8, fontWeight: 500, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <MdCheck /> Correct!
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              id="login-submit-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.78 : 1 }}
            >
              {loading ? (
                <>
                  <span className="animate-spin" style={{
                    width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%', display: 'inline-block'
                  }} />
                  Signing in…
                </>
              ) : (
                <><MdLogin size={16} /> Sign In</>
              )}
            </button>
          </form>

          {/* Register link */}
          <div style={{
            marginTop: 22, padding: '14px 18px',
            background: 'var(--gray-50)', border: '1px solid var(--border)',
            borderRadius: 6, textAlign: 'center'
          }}>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 10 }}>
              Don't have an account yet?
            </p>
            <a href="/register" onClick={handleRegisterClick}>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Create New Account
              </button>
            </a>
          </div>

          {/* Admin link + footer */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/admin-login" onClick={handleAdminClick} style={{ fontSize: 12, color: 'var(--gray-400)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MdShield size={13} /> Administrator Login
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 18, color: 'var(--gray-400)', fontSize: 11.5 }}>
            {['Terms of Service', 'Privacy Policy', 'Support Center'].map((t, i) => (
              <span key={t} style={{ display: 'inline-flex', gap: 14, alignItems: 'center' }}>
                {i > 0 && <span style={{ color: 'var(--gray-200)' }}>·</span>}
                <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-400)'}
                >{t}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}