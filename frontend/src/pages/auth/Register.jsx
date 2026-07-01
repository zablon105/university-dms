import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    email: '', password: '', password2: '', department: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await api.post('/auth/register/', { ...form, role })
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Registration failed.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Registration Submitted!</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
          Your account is pending admin approval. You'll be notified once approved.
        </p>
        <Link to="/login"><button className="btn btn-primary btn-lg">Back to Login</button></Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <div style={{
        width: '40%', position: 'relative', overflow: 'hidden',
        background: '#0047AB',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📚</div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>DocLibrary</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>KAFU Institutional Portal</div>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.15)', marginBottom: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>🛡️</div>
            <h3 style={{ color: 'white', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Academic Integrity First</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.6 }}>
              Join the secure environment for managing your academic records, research documents, and institutional assignments with full encryption.
            </p>
          </div>
          <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '1px', fontWeight: 600 }}>● AUTHORIZED ACCESS ONLY</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
            © 2024 KAFU DocLibrary. All Institutional data is protected by the Educational Privacy Act.
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: '60%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 56px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Create Account</h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>Enter your institutional details to begin.</p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', color: '#DC2626', fontSize: 13, marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Role selector */}
          <div className="input-group">
            <label className="input-label">I am registering as</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15
              }}>👤</span>
              <select
                className="input-field"
                style={{ paddingLeft: 36, appearance: 'none', cursor: 'pointer' }}
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="student">🎓 Student — Undergraduate / Postgraduate</option>
                <option value="staff">💼 Staff Member — Faculty / Administrative</option>
              </select>
              <span style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)', color: '#94a3b8',
                pointerEvents: 'none'
              }}>▼</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Your role determines what you can access in the system
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">First Name</label>
                <input className="input-field" placeholder="Johnathan" value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Last Name</label>
                <input className="input-field" placeholder="Doe" value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Registration Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🪪</span>
                <input className="input-field" style={{ paddingLeft: 36 }}
                  placeholder="COM/0028/2023"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value.toUpperCase() })}
                  required />
              </div>
              {form.username && !/^[A-Z]{2,4}\/\d{3,4}\/\d{4}$/.test(form.username) && (
                <div style={{ fontSize: 11, color: '#D97706', marginTop: 4 }}>
                  ⚠️ Format: DEPT/NUMBER/YEAR — e.g. COM/0028/2023
                </div>
              )}
              {form.username && /^[A-Z]{2,4}\/\d{3,4}\/\d{4}$/.test(form.username) && (
                <div style={{ fontSize: 11, color: '#16A34A', marginTop: 4 }}>
                  ✅ Valid registration number format
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">University Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>✉️</span>
                <input className="input-field" style={{ paddingLeft: 36 }} type="email"
                  placeholder="j.doe@kafu.edu" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            {role === 'student' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Degree Program</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🎓</span>
                    <input className="input-field" style={{ paddingLeft: 36 }}
                      placeholder="e.g. B.Sc. Computer Science" value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Enrollment Year</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>📅</span>
                    <input className="input-field" style={{ paddingLeft: 36 }} placeholder="2024" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="input-group">
                <label className="input-label">Department</label>
                <input className="input-field" placeholder="e.g. Computer Science"
                  value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input className="input-field" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input className="input-field" type="password" placeholder="••••••••"
                  value={form.password2} onChange={e => setForm({ ...form, password2: e.target.value })} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div style={{
            marginTop: 20, padding: '16px 20px',
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 12, textAlign: 'center'
          }}>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
              Already have an account?
            </p>
            <Link to="/login">
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                🔐 Sign In Instead →
              </button>
            </Link>
          </div>

          <div style={{ marginTop: 16, padding: 14, background: '#F0F9FF', borderRadius: 8, border: '1px solid #BAE6FD' }}>
            <p style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5 }}>
              ℹ️ Registration requires a valid university email. A verification link will be sent to your inbox to activate your portal access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}