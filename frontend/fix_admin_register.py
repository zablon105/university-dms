import re

with open('/home/jnolly/Desktop/zablon/university-dms/frontend/src/pages/auth/AdminRegister.jsx', 'r') as f:
    text = f.read()

# Role = 'admin' instead of useState
text = text.replace("export default function Register() {", "export default function AdminRegister() {")
text = text.replace("const [role, setRole] = useState('student')", "const role = 'admin'")

# Change navigation
text = text.replace("navigate('/login'", "navigate('/admin-login'")
text = text.replace('href="/login"', 'href="/admin-login"')

# Change Regex validation
text = text.replace(
    "const isValidRegNo = /^[A-Z]{2,4}\/\\d{3,4}\/\\d{4}$/.test(form.username)",
    "const isValidRegNo = form.username.length > 5"
)

# Fix Left Panel
left_bg = """          {/* BG image */}
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
          }} />"""

new_left_bg = """          <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url('https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=900&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 1, zIndex: 1, background: 'linear-gradient(to top, rgba(2,8,23,0.97) 0%, rgba(2,8,23,0.62) 55%, rgba(2,8,23,0.22) 100%)' }} />
          <div style={{ position: 'absolute', inset: 1, zIndex: 1, backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 40px)` }} />"""
text = text.replace(left_bg, new_left_bg)


left_content = """            <div style={{
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
              color: 'white', fontSize: 40, fontWeight: 700,
              lineHeight: 1.15, marginBottom: 16, letterSpacing: '0.02em'
            }}>
              Create Your<br />
              <span style={{ color: '#60a5fa' }}>Institutional</span><br />
              Account
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.75, marginBottom: 28, maxWidth: 360 }}>
              Join our robust document management ecosystem with full role-based access control and end-to-end security.
            </p>"""

new_left_content = """            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, padding: '4px 12px', marginBottom: 18 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 6px #f87171' }} />
              <span style={{ fontFamily: 'Oswald, sans-serif', color: '#fca5a5', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Authorized Personnel Only
              </span>
            </div>

            <h1 style={{ fontFamily: 'Oswald, sans-serif', color: 'white', fontSize: 38, fontWeight: 700, lineHeight: 1.2, marginBottom: 14, letterSpacing: '0.02em' }}>
              Admin Central:<br />
              <span style={{ color: '#93c5fd' }}>Account<br />Creation</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13.5, lineHeight: 1.75, marginBottom: 28, maxWidth: 360 }}>
              Join the institutional governance network to oversee records, compliance, and systems.
            </p>"""
text = text.replace(left_content, new_left_content)

# Remove role selector
role_selector = """            {/* Role selector */}
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
            </div>"""
text = text.replace(role_selector, "")

# Form fields changes
text = text.replace("<label className=\"input-label\">Registration Number</label>", "<label className=\"input-label\">Administrator ID</label>")
text = text.replace("{role === 'student' ? 'Degree Program' : 'Department'}", "'Department'")
text = text.replace("placeholder={role === 'student' ? \"B.Sc. Computer Science\" : \"e.g. Computer Science\"}", "placeholder=\"e.g. IT Department\"")
text = text.replace("Register Account", "Register Administrator")

form_warn = """                {form.username && !isValidRegNo && (
                  <span style={{ fontSize: 11, color: 'var(--warning)' }}><MdWarning /> Format: DEPT/NUMBER/YEAR — e.g. COM/0028/2023</span>
                )}
                {form.username && isValidRegNo && (
                  <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MdCheckCircle size={12} /> Valid format
                  </span>
                )}"""
text = text.replace(form_warn, "")

with open('/home/jnolly/Desktop/zablon/university-dms/frontend/src/pages/auth/AdminRegister.jsx', 'w') as f:
    f.write(text)

