import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Card from './ui/Card'
import Button from './ui/Button'
import Avatar from './ui/Avatar'

export default function ProfileSettings({ title }) {
  const { user, updateProfile, changePassword, uploadProfilePicture } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    postalCode: '',
    profileImage: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [storedImageUrl, setStoredImageUrl] = useState('')  // Store the actual database image URL

  if (!user) {
    return (
      <div className="min-h-[60vh] rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-700">Loading profile...</p>
      </div>
    )
  }

  useEffect(() => {
    if (!user) return
    const userImage = user.profileImage || ''
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      address: user.address || '',
      postalCode: user.postalCode || '',
      profileImage: userImage,
    })
    setStoredImageUrl(userImage)
    setPreviewUrl(userImage)
  }, [user])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setStatus({ type: '', message: '' })
  }

  const handleUploadImage = async () => {
    if (!selectedFile) {
      setStatus({ type: 'error', message: 'Select a profile photo first.' })
      return
    }

    console.log('📸 Starting file upload:', selectedFile.name, selectedFile.type, selectedFile.size)
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      console.log('📤 Calling uploadProfilePicture...')
      const updatedUser = await uploadProfilePicture(selectedFile)
      console.log('✅ Upload response:', updatedUser)
      
      const uploadedImageUrl = updatedUser.profileImage || ''
      console.log('🖼️ Image URL:', uploadedImageUrl)
      
      if (!uploadedImageUrl) {
        throw new Error('No image URL returned from server')
      }
      
      setFormData((prev) => ({ ...prev, profileImage: uploadedImageUrl }))
      setStoredImageUrl(uploadedImageUrl)
      setPreviewUrl(uploadedImageUrl)
      setSelectedFile(null)
      setStatus({ type: 'success', message: 'Profile photo uploaded successfully.' })
    } catch (error) {
      console.error('❌ Upload error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload profile image.'
      console.error('Error details:', errorMessage)
      setStatus({
        type: 'error',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      // Send all form data including profileImage to preserve it in the database
      const updatedUser = await updateProfile(formData)
      
      // Get the image URL from response, fallback to stored URL
      const imageUrl = updatedUser.profileImage || storedImageUrl || formData.profileImage || ''
      
      // Refresh form data with updated user information
      setFormData({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        city: updatedUser.city || '',
        address: updatedUser.address || '',
        postalCode: updatedUser.postalCode || '',
        profileImage: imageUrl,
      })
      
      // Store the image URL to prevent loss during state updates
      setStoredImageUrl(imageUrl)
      // Always maintain the preview URL for the image
      setPreviewUrl(imageUrl)
      
      setStatus({ type: 'success', message: 'Profile updated successfully.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to update profile.',
      })
      // Restore preview URL on error
      setPreviewUrl(storedImageUrl)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus({ type: 'error', message: 'New password and confirmation do not match.' })
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setStatus({ type: 'success', message: 'Password changed successfully.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to change password.',
      })
    } finally {
      setLoading(false)
    }
  }

  const profileImageMarkup = (
    <Avatar
      src={previewUrl}
      name={user.name}
      sizeClassName="h-28 w-28 text-3xl"
      className="border-2 border-slate-200"
    />
  )

  return (
    <div className="space-y-6">
      <Card header={title || 'Profile Settings'}>
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {profileImageMarkup}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Profile Photo</label>
                  <p className="text-xs text-slate-500">Upload a real photo from your device.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  {user.role ? user.role : 'Customer'}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-700"
                />
                <Button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={loading || !selectedFile}
                  className="w-full"
                >
                  Upload Photo
                </Button>
              </div>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Full Name
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Phone
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                City
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
            <label className="space-y-1 text-sm text-slate-600">
              Address
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Postal Code
              <input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <div className="flex flex-col gap-3 pt-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Save Profile</p>
                <p className="text-xs text-slate-500">Submit your profile changes to the backend.</p>
              </div>
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                Update Profile
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card header="Change Password">
        <form onSubmit={handleSavePassword} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-600">
              Old Password
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              New Password
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>
          <label className="space-y-1 text-sm text-slate-600">
            Confirm New Password
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <div className="flex items-center justify-between gap-4 pt-3">
            <p className="text-sm text-slate-500">Keep your account secure with a strong password.</p>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              Change Password
            </Button>
          </div>
        </form>
      </Card>

      {status.message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  )
}
