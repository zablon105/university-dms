import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import {
  MdClose, MdArrowBack
  ,
  MdRefresh, MdVisibility, MdKey, MdCheck,
  MdAdminPanelSettings, MdBarChart, MdShield, MdLock, MdWarning, MdVisibilityOff
} from 'react-icons/md'

const generateQuestion = () => {
  const ops = ['+', '-']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a = Math.floor(Math.random() * 15) + 2
  let b = Math.floor(Math.random() * 10) + 1
  if (op === '-' && b > a) [a, b] = [b, a]
  return { a, b, op, answer: op === '+' ? a + b : a - b }
}

export default function AdminLogin() {
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

  const isFlipping = location.state?.fromFlip


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError(true)
      setCaptcha(generateQuestion())
      setCaptchaInput('')
      return
    }
    setCaptchaError(false); setLoading(true); setError('')
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
    } finally { setLoading(false) }
  }

  const features = [
    { icon: MdShield, text: 'Tier-3 Security Protocol' },
    { icon: MdBarChart, text: 'Real-time System Audit' },
  ]

  return (
    <div className={isFlipping ? 'flip-page-in' : ''} style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>

      {/* ── Left panel ───────────────────────────────────────── */}
      <div style={{
        width: '44%', position: 'relative',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: 48, overflow: 'hidden'
      }} className="auth-panel-left">
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url('https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=900&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(2,8,23,0.97) 0%, rgba(2,8,23,0.62) 55%, rgba(2,8,23,0.22) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 40px)` }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 36, left: 40, zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15) ', boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>
            <MdAdminPanelSettings style={{ color: 'white', fontSize: 20 }} />
          </div>
          <span style={{ color: 'white', fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: '0.06em' }}>
            KAFU Admin Central
          </span>
        </div>

        {/* Content bottom */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, padding: '4px 12px', marginBottom: 18 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 6px #f87171' }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', color: '#fca5a5', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Authorized Personnel Only
            </span>
          </div>

          <h1 style={{ fontFamily: 'Oswald, sans-serif', color: 'white', fontSize: 38, fontWeight: 700, lineHeight: 1.2, marginBottom: 14, letterSpacing: '0.02em' }}>
            Admin Central:<br />
            <span style={{ color: '#93c5fd' }}>Institutional<br />Oversight</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13.5, lineHeight: 1.75, marginBottom: 28, maxWidth: 360 }}>
            Manage institutional records, monitor compliance, and oversee system logistics from one secure dashboard.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '6px 12px' }}>
                <Icon size={14} style={{ color: '#93c5fd', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div style={{ width: '56%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px', overflowY: 'auto' }}>
        <div className="form-container" style={{ width: '100%', maxWidth: 460 }}>

          {/* Back link */}
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--gray-500)', marginBottom: 24, transition: 'color 0.18s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}
          >
            <MdArrowBack size={15} /> Back to Institutional Portal
          </Link>

          {/* Restricted badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '4px 12px', marginBottom: 18 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--danger)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Restricted Access
            </span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, letterSpacing: '0.02em' }}>
              Administrator Login
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 13.5 }}>
              Access restricted to university governance and IT staff.
            </p>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid #fca5a5', borderRadius: 5, padding: '10px 14px', color: 'var(--danger)', fontSize: 13, marginBottom: 18 }}>
              <MdWarning /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Administrator ID</label>
              <div style={{ position: 'relative' }}>
                <MdAdminPanelSettings style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                <input className="input-field" style={{ paddingLeft: 36, background: 'white' }}
                  type="text" placeholder="e.g. KAFU-ADM-0000"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>Reset Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 17 }} />
                <input className="input-field" style={{ paddingLeft: 36, paddingRight: 42, background: 'white' }}
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', transition: 'color 0.18s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gray-700)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-400)'}
                >
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray-600)', marginBottom: 18, cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: 14, height: 14, accentColor: 'var(--primary)' }} />
              Remember this workstation
            </label>

            {/* CAPTCHA */}
            <div style={{ background: 'white', border: `1.5px solid ${captchaError ? '#fca5a5' : 'var(--gray-200)'}`, borderRadius: 6, padding: '14px 16px', marginBottom: 18, transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Human Verification</span>
                <button type="button" onClick={() => { setCaptcha(generateQuestion()); setCaptchaInput(''); setCaptchaError(false) }}
                  style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'Oswald, sans-serif' }}>
                  <MdRefresh size={13} /> Refresh
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#1e3a8a', color: 'white', padding: '9px 16px', borderRadius: 5, fontFamily: 'monospace', fontSize: 19, fontWeight: 700, userSelect: 'none', letterSpacing: '0.08em' }}>
                  {captcha.a} {captcha.op} {captcha.b} = ?
                </div>
                <span style={{ color: 'var(--gray-400)', fontSize: 18 }}>→</span>
                <input type="number" value={captchaInput}
                  onChange={e => { setCaptchaInput(e.target.value); setCaptchaError(false) }}
                  placeholder="?" style={{ width: 80, padding: '9px 12px', border: `2px solid ${captchaError ? 'var(--danger)' : captchaInput && parseInt(captchaInput) === captcha.answer ? 'var(--success)' : 'var(--gray-200)'}`, borderRadius: 5, fontSize: 16, fontWeight: 700, textAlign: 'center', outline: 'none', background: captchaError ? 'var(--danger-light)' : 'white', transition: 'border-color 0.2s' }} />
              </div>
              {captchaError && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}><MdClose /> Wrong answer — new question generated.</div>}
              {captchaInput && parseInt(captchaInput) === captcha.answer && <div style={{ color: 'var(--success)', fontSize: 12, marginTop: 8 }}><MdCheck /> Correct!</div>}
            </div>

            <button type="submit" id="admin-login-btn" className="btn btn-primary btn-lg"
              disabled={loading} style={{ opacity: loading ? 0.78 : 1, background: '#1e3a8a', borderColor: '#1e3a8a' }}>
              {loading ? 'Verifying…' : <><MdAdminPanelSettings size={16} /> Access Admin Central</>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: 'var(--gray-400)', letterSpacing: '0.06em' }}>OR SECURE VIA</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Hardware key */}
          <button style={{ width: '100%', padding: '11px 16px', borderRadius: 6, border: '1.5px solid var(--gray-200)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', letterSpacing: '0.04em', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'white' }}
          >
            <MdKey size={18} /> Hardware Security Key
          </button>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>© 2025 KAFU Admin</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {['Policy', 'Support'].map(l => (
                <span key={l} style={{ fontSize: 11, color: 'var(--gray-500)', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}
                >{l}</span>
              ))}
            </div>
            <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>Node: KAFU-ARC-HQ-01</div>
          </div>
        </div>
      </div>
    </div>
  )
}