import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { getServicePrice, formatPKR, formatDateForInput } from '../../utils'
import DatePicker from '../../components/ui/DatePicker'

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

const serviceOptions = [
  'Plumbing',
  'Electrical',
  'AC Repair',
  'Appliance Repair',
  'CCTV Installation',
  'Carpenter',
  'Painter',
  'Cleaning Service',
  'Generator Repair',
  'IT Support',
  'Smart Home Setup',
  'Home Maintenance',
  'Handyman',
  'Other'
]

export default function BookService() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    address: '',
    city: 'Lahore',
    description: '',
    optionalBudget: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services')
        setServices(response.data.services || [])
      } catch {
        setLoadError('Unable to load services. Please try again later.')
      }
    }

    fetchServices()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value }
      if (name === 'serviceId') {
        nextData.optionalBudget = value ? getServicePrice(value) : ''
      }
      return nextData
    })
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.serviceId) newErrors.serviceId = 'Please select a service'
    if (!formData.date) newErrors.date = 'Please select a date'
    if (!formData.time) newErrors.time = 'Please select a time'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const selectedOption = formData.serviceId
      const matchedService = services.find((service) => {
        const nameLower = service.name.toLowerCase()
        const catLower = (service.category || '').toLowerCase()
        const optLower = selectedOption.toLowerCase()

        if (optLower === 'plumbing') return nameLower.includes('plumbing') || catLower.includes('plumbing')
        if (optLower === 'electrical') return nameLower.includes('electr') || catLower.includes('electrical') || catLower.includes('electrician')
        if (optLower === 'ac repair') return nameLower.includes('ac') || catLower.includes('ac')
        if (optLower === 'appliance repair') return nameLower.includes('appliance') || catLower.includes('appliances')
        if (optLower === 'cctv installation') return nameLower.includes('cctv') || catLower.includes('cctv')
        if (optLower === 'carpenter') return nameLower.includes('carpenter') || nameLower.includes('carpentry') || catLower.includes('carpentry')
        if (optLower === 'painter') return nameLower.includes('paint') || catLower.includes('painting')
        if (optLower === 'cleaning service') return nameLower.includes('clean') || catLower.includes('cleaning')
        if (optLower === 'generator repair') return nameLower.includes('generator') || catLower.includes('generator')
        if (optLower === 'it support') return nameLower.includes('it support') || nameLower.includes('it') || catLower.includes('it')
        if (optLower === 'smart home setup') return nameLower.includes('smart home') || catLower.includes('smart_home')
        if (optLower === 'home maintenance') return nameLower.includes('maintenance') || catLower.includes('maintenance') || nameLower.includes('locks')
        if (optLower === 'handyman') return nameLower.includes('handyman') || catLower.includes('handyman')
        return false
      })

      const finalServiceId = matchedService ? matchedService._id : (services[0]?._id || selectedOption)

      await api.post('/bookings', {
        serviceId: finalServiceId,
        selectedService: selectedOption,
        serviceStartingPrice: getServicePrice(selectedOption),
        bookingDate: formData.date,
        timeSlot: formData.time,
        location: { address: formData.address, city: formData.city },
        description: formData.description,
        optionalBudget: formData.optionalBudget ? Number(formData.optionalBudget) : undefined,
      })

      setBookingConfirmed(true)
      setTimeout(() => {
        navigate('/customer/bookings')
      }, 1200)
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to book service. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today)
  const today = formatDateForInput(new Date())

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-0">
          <Sidebar />
          <main className="flex-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
              <p className="text-slate-600 mb-6">Your service booking has been confirmed. Redirecting to bookings...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-0">
        <Sidebar />
        <main className="flex-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Book a Service</h1>
            <p className="mt-2 text-sm text-slate-600">Select a service, choose a date and time, and confirm your booking.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Service Selection */}
              <div>
                <label htmlFor="serviceId" className="block text-sm font-medium text-slate-700 mb-2">
                  Choose a Service <span className="text-red-500">*</span>
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  className={`block w-full rounded-md border ${
                    errors.serviceId ? 'border-red-300' : 'border-slate-300'
                  } bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500`}
                >
                  <option value="">Select a service...</option>
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} - {formatPKR(getServicePrice(opt))}
                    </option>
                  ))}
                </select>
                {formData.serviceId && (
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    Starting Price: Rs. {getServicePrice(formData.serviceId).toLocaleString('en-US')}
                  </div>
                )}
                {errors.serviceId && <p className="mt-1 text-xs text-red-600">{errors.serviceId}</p>}
                {loadError && <p className="mt-1 text-xs text-red-600">{loadError}</p>}
              </div>

              {/* Date and Time Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <DatePicker
                    label={<span>Select Date <span className="text-red-500">*</span></span>}
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={today}
                    error={errors.date}
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-2">
                    Select Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`block w-full rounded-md border ${
                      errors.time ? 'border-red-300' : 'border-slate-300'
                    } bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500`}
                  >
                    <option value="">Select a time...</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                  Service Address <span className="text-red-500">*</span>
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your service address"
                  className={errors.address ? 'border-red-300' : ''}
                />
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="border-slate-300"
                />
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="optionalBudget" className="block text-sm font-medium text-slate-700 mb-2">
                  Budget (PKR) <span className="text-xs text-slate-500">(Optional)</span>
                </label>
                <Input
                  type="number"
                  id="optionalBudget"
                  name="optionalBudget"
                  value={formData.optionalBudget}
                  onChange={handleChange}
                  placeholder="Enter your budget"
                  className="border-slate-300"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the issue or service needed..."
                  className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/customer')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
