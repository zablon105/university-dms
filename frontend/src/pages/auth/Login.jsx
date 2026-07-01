import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const generateQuestion = () => {
  const ops = ['+', '-']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a = Math.floor(Math.random() * 15) + 2
  let b = Math.floor(Math.random() * 10) + 1
  if (op === '-' && b > a) [a, b] = [b, a]
  return { a, b, op, answer: op === '+' ? a + b : a - b }
}

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
      login(user, res.data.access, res.data.refresh)

      // System automatically redirects based on role
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <div style={{
        width: '45%', position: 'relative',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: 48, overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center'
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to top, rgba(5,15,40,0.95) 0%, rgba(5,15,40,0.4) 60%, rgba(5,15,40,0.1) 100%)'
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <div style={{
            position: 'absolute', top: -300, left: 0,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>🎓</div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>KAFU</span>
          </div>

          <h1 style={{
            color: 'white', fontSize: 34, fontWeight: 800,
            lineHeight: 1.2, marginBottom: 16
          }}>
            Welcome to your<br />Academic<br />Resource Hub.
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)', fontSize: 14,
            lineHeight: 1.7, marginBottom: 24
          }}>
            Access your documents, assignments, and academic records
            in a quiet, organized space designed for cognitive ease.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['🔒 Secure Access', '⚡ Instant Sync'].map(item => (
              <span key={item} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: '55%', background: 'white',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '48px 56px',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
              Sign In
            </h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              Enter your institutional credentials to access the DocLibrary portal.
            </p>
          </div>

          {/* Idle logout message */}
          {new URLSearchParams(window.location.search).get('reason') === 'idle' && (
            <div style={{
              background: '#FEF3C7', border: '1px solid #FDE68A',
              borderRadius: 8, padding: '12px 16px',
              color: '#92400E', fontSize: 13, marginBottom: 20,
              display: 'flex', gap: 8, alignItems: 'center'
            }}>
              <span>⏰</span>
              <span>You were logged out due to inactivity. Please sign in again.</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, padding: '12px 16px',
              color: '#DC2626', fontSize: 13, marginBottom: 20
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="input-group">
              <label className="input-label">Username / Registration Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15
                }}>🪪</span>
                <input
                  className="input-field"
                  style={{ paddingLeft: 38 }}
                  type="text"
                  placeholder="e.g. COM/0028/2023 or admin"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                The system will automatically detect your role
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#0047AB', fontWeight: 500 }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15
                }}>🔑</span>
                <input
                  className="input-field"
                  style={{ paddingLeft: 38, paddingRight: 44 }}
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
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16
                  }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: '#64748b', marginBottom: 20, cursor: 'pointer'
            }}>
              <input type="checkbox" style={{ width: 15, height: 15, accentColor: '#0047AB' }} />
              Remember this device for 30 days
            </label>

            {/* CAPTCHA */}
            <div style={{
              background: '#F8FAFC', border: '1.5px solid #E2E8F0',
              borderRadius: 10, padding: '16px 20px', marginBottom: 20
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
                  fontSize: 18, fontWeight: 700,
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
                  ✅ Correct!
                </div>
              )}
            </div>

            {/* Single clean login button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid white',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.8s linear infinite'
                  }} />
                  Signing in...
                </span>
              ) : 'Log In →'}
            </button>
          </form>

          {/* Sign up section */}
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
                Create New Account →
              </button>
            </Link>
          </div>

          {/* Admin login link */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/admin-login" style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              🔐 Administrator Login
            </Link>
          </div>

          {/* Footer links */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 16,
            marginTop: 20, color: '#94a3b8', fontSize: 12
          }}>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span>·</span>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span>·</span>
            <span style={{ cursor: 'pointer' }}>Support Center</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}