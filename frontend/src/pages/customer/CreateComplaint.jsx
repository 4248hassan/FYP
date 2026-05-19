import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Loader from '../../components/ui/Loader'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

export default function CreateComplaint() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImagePreview(null)
      return
    }
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.post('/complaints', form)
      console.log('Create complaint response:', response)

      if (response?.status === 201) {
        const message = response.data?.message || 'Complaint created successfully'
        setSuccess(message)
        setTimeout(() => navigate('/customer'), 900)
      } else {
        const message = response?.data?.message || 'Failed to create complaint. Please try again.'
        setError(message)
      }
    } catch (err) {
      console.error('Create complaint failed:', err)
      const backendMessage = err?.response?.data?.message || err?.message || 'Failed to create complaint. Please try again.'
      setError(backendMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Create New Complaint</h1>
              <p className="mt-1 text-sm text-slate-600">
                Submit a complaint with details and images to get help from vendors
              </p>
            </div>

            <Card>
              {submitting ? (
                <Loader label="Submitting complaint..." />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700" role="status">
                      {success}
                    </div>
                  )}

                  <Input
                    label="Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Leaky faucet in kitchen"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="">Select a category</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC</option>
                      <option value="appliance">Appliance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe the issue in detail..."
                      className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <Input
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Apartment 12B, Main Street, City"
                  />

                  <div className="space-y-2">
                    <label
                      htmlFor="image"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Problem Image (optional)
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-50"
                    />
                    {imagePreview ? (
                      <div className="mt-3">
                        <p className="mb-2 text-xs text-slate-500">Preview:</p>
                        <img
                          src={imagePreview}
                          alt="Selected"
                          className="h-48 w-full rounded-lg border border-slate-200 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mt-3">
                        <p className="mb-2 text-xs text-slate-500">Preview placeholder:</p>
                        <img
                          src="https://picsum.photos/seed/handyman/400/300"
                          alt="Placeholder"
                          className="h-48 w-full rounded-lg border border-slate-200 object-cover opacity-50"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate('/customer')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Submit Complaint</Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
