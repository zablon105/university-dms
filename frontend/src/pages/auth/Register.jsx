import { useState } from 'react'
import AuthLayout from '../../layouts/AuthLayout'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import {
  MdClose, MdEmail,
  MdArrowBack, MdWork, MdInfo, MdCheckCircle,
  MdShield,
  MdPerson, MdSchool, MdAppRegistration
  , MdLock, MdRefresh, MdWarning, MdBolt
} from 'react-icons/md'

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

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', password: '', password2: '', department: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [captcha, setCaptcha] = useState(generateQuestion)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)

  const isFlippingIn = location.state?.fromFlip

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Passwords do not match.'); return }
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
      await api.post('/auth/register/', { ...form, role })
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Registration failed.')
      setCaptcha(generateQuestion())
      setCaptchaInput('')
    } finally { setLoading(false) }
  }

  const handleLoginClick = (e) => {
    e.preventDefault()
    setIsFlipping(true)
    setTimeout(() => {
      navigate('/login', { state: { fromFlip: true } })
    }, 1400)
  }

  const studentPattern = /^[A-Z]{2,4}\/\d{3,4}\/\d{4}$/
  const staffPattern = /^KAFU\/(STF|EMP)\/\d{3,4}$/
  const isValidRegNo = role === 'student'
    ? studentPattern.test(form.username)
    : staffPattern.test(form.username)
  const isFormValid = form.first_name && form.last_name && form.username && form.email && form.password && form.password2 && captchaInput

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
      <div className="form-container" style={{ maxWidth: 460, width: '100%', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #bbf7d0' }}>
          <MdCheckCircle size={38} color="var(--success)" />
        </div>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: '0.02em', color: 'var(--success)' }}>Registration Submitted!</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
          Your account has been created. You can now login to access the portal.
        </p>
        <Link to="/login">
          <button className="btn btn-primary btn-lg">Back to Sign In</button>
        </Link>
      </div>
    </div>
  )

  return (
    <AuthLayout>
      <div className={`auth-layout ${isFlippingIn && !isFlipping ? 'flip-page-in' : ''} ${isFlipping ? 'flip-page-out' : ''}`.trim()} style={{ width: '100%', flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left hero panel ──────────────────────────────────── */}
        <div style={{
          width: '44%', position: 'relative',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', textAlign: 'center',
          padding: 48, overflow: 'hidden'
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

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(26,86,219,0.25)', border: '1px solid rgba(26,86,219,0.4)',
              borderRadius: 4, padding: '4px 12px', marginBottom: 18
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 6px #60a5fa' }} />
              <span style={{ fontFamily: 'Oswald, sans-serif', color: '#93c5fd', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Secure Platform
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Oswald, sans-serif',
              color: 'var(--hero-text)', fontSize: 40, fontWeight: 700,
              lineHeight: 1.15, marginBottom: 16, letterSpacing: '0.02em'
            }}>
              Create Your<br />
              <span style={{ color: '#60a5fa' }}>Institutional</span><br />
              Account
            </h1>

            <p style={{ color: 'var(--hero-muted)', fontSize: 14, lineHeight: 1.75, marginBottom: 28, maxWidth: 360 }}>
              Join our robust document management ecosystem with full role-based access control and end-to-end security.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {features.map(({ icon: Icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 4, padding: '6px 12px',
                }}>
                  <Icon size={14} style={{ color: '#93c5fd', flexShrink: 0 }} />
                  <span style={{ color: 'var(--hero-muted)', fontSize: 12, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ──────────────────────────────────── */}
        <div className="auth-panel-right" style={{ width: '56%', background: 'var(--bg-page)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 52px', overflowY: 'auto' }}>
          <div className="form-container" style={{ width: '100%', maxWidth: 540, padding: '40px 48px' }}>

            {/* Back link */}
            <a
              href="/login"
              onClick={handleLoginClick}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--gray-500)', marginBottom: 22, transition: 'color 0.18s', padding: '4px 0' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}
            >
              <MdArrowBack size={15} /> Back to Sign In
            </a>

            <div style={{ marginBottom: 26, textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 30, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Register Account
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Enter your institutional details to begin.</p>
            </div>

            {error && (
              <div style={{ background: 'var(--danger-light)', border: '1px solid #fca5a5', borderRadius: 5, padding: '10px 14px', color: 'var(--danger)', fontSize: 13, marginBottom: 18, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <MdWarning /> {error}
              </div>
            )}

            {/* Role selector */}
            <div className="form-section" style={{ padding: 18, marginBottom: 20 }}>
              <div className="form-section-title" style={{ marginBottom: 12 }}><MdPerson size={14} /> Account Type</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'student', label: 'Student', sub: 'Undergraduate or Postgrad', icon: MdSchool },
                  { value: 'staff', label: 'Staff Member', sub: 'Faculty or Admin', icon: MdWork },
                ].map(({ value, label, sub, icon: Icon }) => (
                  <div
                    key={value}
                    onClick={() => setRole(value)}
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                      border: `2px solid ${role === value ? 'var(--primary)' : 'var(--border)'}`,
                      background: role === value ? 'var(--primary-light)' : 'white',
                      transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', gap: 4
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon size={16} color={role === value ? 'var(--primary)' : 'var(--gray-400)'} />
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 600, color: role === value ? 'var(--primary)' : 'var(--gray-700)', letterSpacing: '0.03em' }}>
                        {label}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--gray-500)', paddingLeft: 22 }}>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">First Name</label>
                  <input className="input-field" placeholder="Johnathan"
                    value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Last Name</label>
                  <input className="input-field" placeholder="Doe"
                    value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">
                  {role === 'student' ? 'Registration Number' : 'Employee ID'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15
                  }}>🪪</span>
                  <input
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                    placeholder={role === 'student' ? 'COM/0028/2023' : 'KAFU/STF/001'}
                    value={form.username}
                    onChange={e => setForm({
                      ...form,
                      username: e.target.value.toUpperCase()
                    })}
                    required
                  />
                </div>
                {form.username && (() => {
                  const studentOk = studentPattern.test(form.username)
                  const staffOk = staffPattern.test(form.username)
                  const isValid = role === 'student' ? studentOk : staffOk
                  return (
                    <div style={{
                      fontSize: 11, marginTop: 4,
                      color: isValid ? '#16A34A' : '#D97706'
                    }}>
                      {isValid
                        ? '✅ Valid format'
                        : role === 'student'
                          ? '⚠️ Format: COM/0028/2023'
                          : '⚠️ Format: KAFU/STF/001'
                      }
                    </div>
                  )
                })()}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  {role === 'student'
                    ? 'Your student registration number from KAFU'
                    : 'Your employee ID — contact HR if unsure'
                  }
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">University Email</label>
                <div style={{ position: 'relative' }}>
                  <MdEmail style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                  <input className="input-field" style={{ paddingLeft: 36 }} type="email"
                    placeholder="j.doe@kafu.edu" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">{role === 'student' ? 'Degree Program' : 'Department'}</label>
                <input className="input-field" placeholder={role === 'student' ? "B.Sc. Computer Science" : "e.g. Computer Science"}
                  value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <MdLock style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                    <input className="input-field" style={{ paddingLeft: 36 }} type="password" placeholder="••••••••"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <MdLock style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                    <input className="input-field" style={{ paddingLeft: 36 }} type="password" placeholder="••••••••"
                      value={form.password2} onChange={e => setForm({ ...form, password2: e.target.value })} required />
                  </div>
                  {form.password && form.password2 && form.password !== form.password2 && (
                    <span style={{ fontSize: 11, color: 'var(--danger)' }}><MdClose /> Passwords don't match</span>
                  )}
                </div>
              </div>

              <div style={{
                background: 'var(--gray-50)', border: `1.5px solid ${captchaError ? '#fca5a5' : 'var(--gray-200)'}`,
                borderRadius: 6, padding: '12px 14px', marginBottom: 18, marginTop: 4,
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
                    padding: '7px 14px', borderRadius: 5,
                    fontFamily: 'monospace', fontSize: 16, fontWeight: 700,
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
                      width: 70, padding: '7px 10px',
                      border: `2px solid ${captchaError ? 'var(--danger)' : captchaInput && parseInt(captchaInput) === captcha.answer ? 'var(--success)' : 'var(--gray-200)'}`,
                      borderRadius: 5, fontSize: 15, fontWeight: 700,
                      textAlign: 'center', outline: 'none',
                      background: captchaError ? 'var(--danger-light)' : 'white',
                      color: captchaError ? 'var(--danger)' : 'var(--gray-900)',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>
                {captchaError && (
                  <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8, fontWeight: 500, display: 'flex', gap: 4, alignItems: 'center' }}>
                    <MdClose /> Wrong answer. Please try again.
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || !isFormValid}
                style={{ opacity: (loading || !isFormValid) ? 0.6 : 1 }}
              >
                {loading ? 'Creating account…' : <><MdAppRegistration size={16} /> Create Account</>}
              </button>
            </form>

            {/* Info notice */}
            <div style={{ marginTop: 22, padding: '12px 14px', background: 'var(--info-light)', borderRadius: 5, border: '1px solid #bae6fd', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <MdInfo size={15} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                A verification link will be sent to your institutional email. By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>

            <div style={{
              marginTop: 22, padding: '14px 18px',
              background: 'var(--gray-50)', border: '1px solid var(--border)',
              borderRadius: 6, textAlign: 'center'
            }}>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 10 }}>
                Already have an account?
              </p>
              <a href="/login" onClick={handleLoginClick}>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  Sign In Instead
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}