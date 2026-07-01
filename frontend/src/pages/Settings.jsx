import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: user?.phone || ''
  })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        department: user.department || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.patch('/auth/profile/', form)
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

  return (
    <DashboardLayout searchPlaceholder="Search settings...">
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Update your profile, contact details, and security preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 18 }}>Personal Information</h2>
          <form onSubmit={handleProfileSave} style={{ display: 'grid', gap: 16 }}>
            {[
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
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 18 }}>Security</h2>
          <form onSubmit={handlePasswordChange} style={{ display: 'grid', gap: 16 }}>
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
            <button className="btn btn-secondary" type="submit" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
