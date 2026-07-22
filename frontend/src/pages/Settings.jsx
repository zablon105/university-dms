import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: user?.phone || '',
    profile_picture: null,
  })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        department: user.department || '',
        phone: user.phone || '',
        profile_picture: null,
      })
    }
  }, [user])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = new FormData()
      data.append('username', form.username)
      data.append('first_name', form.first_name)
      data.append('last_name', form.last_name)
      data.append('email', form.email)
      data.append('department', form.department)
      data.append('phone', form.phone)
      if (form.profile_picture) {
        data.append('profile_picture', form.profile_picture)
      }

      const res = await api.patch('/auth/profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(res.data)
      alert('Profile updated successfully.')
    } catch (err) {
      console.error(err)
      alert('Unable to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return alert('New password and confirm password do not match.')
    }
    setChangingPassword(true)
    try {
      await api.post('/auth/change-password/', passwordForm)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      alert('Password changed successfully.')
    } catch (err) {
      console.error(err)
      alert('Unable to change password. Please verify your current password and try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  // Theme toggle (persistent)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    try { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme) } catch (e) {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <DashboardLayout searchPlaceholder="Search settings...">
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Update your profile, contact details, and security preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <form className="form-container" onSubmit={handleProfileSave} style={{ display: 'grid', gap: 16 }}>
          <h2 style={{ fontSize: 18, fontFamily: 'Oswald, sans-serif', marginBottom: 6, color: 'var(--gray-900)' }}>Personal Information</h2>
          {[
            { label: 'Username', name: 'username', type: 'text' },
            { label: 'First Name', name: 'first_name', type: 'text' },
            { label: 'Last Name', name: 'last_name', type: 'text' },
            { label: 'Email Address', name: 'email', type: 'email' },
            { label: 'Department', name: 'department', type: 'text' },
            { label: 'Phone', name: 'phone', type: 'text' }
          ].map(field => (
            <div key={field.name} className="input-group">
              <label className="input-label">{field.label}</label>
              <input
                className="input-field"
                type={field.type}
                value={form[field.name]}
                onChange={e => setForm({ ...form, [field.name]: e.target.value })}
              />
            </div>
          ))}
          <div className="input-group">
            <label className="input-label">Profile Picture</label>
            <input
              className="input-field"
              type="file"
              accept="image/*"
              onChange={e => setForm({ ...form, profile_picture: e.target.files?.[0] || null })}
            />
          </div>
          {form.profile_picture && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img
                src={URL.createObjectURL(form.profile_picture)}
                alt="Profile preview"
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
              />
              <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>
                Selected file will be uploaded when you save.
              </span>
            </div>
          )}
          {user?.profile_picture && !form.profile_picture && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img
                src={user.profile_picture}
                alt="Current profile"
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
              />
              <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>
                Current profile picture.
              </span>
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <form className="form-container" onSubmit={handlePasswordChange} style={{ display: 'grid', gap: 16 }}>
          <h2 style={{ fontSize: 18, fontFamily: 'Oswald, sans-serif', marginBottom: 6, color: 'var(--gray-900)' }}>Security</h2>
          {[
            { label: 'Current Password', name: 'current_password', type: 'password' },
            { label: 'New Password', name: 'new_password', type: 'password' },
            { label: 'Confirm New Password', name: 'confirm_password', type: 'password' }
          ].map(field => (
            <div key={field.name} className="input-group">
              <label className="input-label">{field.label}</label>
              <input
                className="input-field"
                type={field.type}
                value={passwordForm[field.name]}
                onChange={e => setPasswordForm({ ...passwordForm, [field.name]: e.target.value })}
              />
            </div>
          ))}
          <button className="btn btn-danger" type="submit" disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Change Password'}
          </button>

          <div style={{ marginTop: 8 }}>
            <h3 style={{ fontSize: 14, marginBottom: 8 }}>Display</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="button" className="btn" onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'dark' : 'light'} mode
              </button>
              <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>Current: {theme}</span>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
