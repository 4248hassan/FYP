import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { formatDateDDMMYYYY, formatDateForInput } from '../../utils'
import DatePicker from '../../components/ui/DatePicker'
import { STATUS, STATUS_BADGE, STATUS_LABEL } from '../../constants/status'

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

// Status badge classes — sourced from STATUS_BADGE constants (mirrors backend STATUS enum)
const statusBadge = {
  ...STATUS_BADGE,
  // Legacy lowercase aliases for backward compat with any older bookings in DB
  booking_created: STATUS_BADGE.BOOKING_CREATED,
  offer_received: STATUS_BADGE.OFFER_RECEIVED,
  vendor_assigned: STATUS_BADGE.VENDOR_ASSIGNED,
  work_in_progress: STATUS_BADGE.WORK_IN_PROGRESS,
  awaiting_approval: STATUS_BADGE.AWAITING_APPROVAL,
  payment_pending: STATUS_BADGE.PAYMENT_PENDING,
  completed: STATUS_BADGE.COMPLETED,
  cancelled: STATUS_BADGE.CANCELLED,
  disputed: STATUS_BADGE.DISPUTED,
  revision_requested: STATUS_BADGE.REVISION_REQUESTED,
}

const EDITABLE_DELETABLE_STATUSES = [
  STATUS.BOOKING_CREATED,
  STATUS.OFFER_RECEIVED,
  'BOOKING_CREATED',
  'OFFER_RECEIVED',
  'booking_created',
  'offer_received',
  'pending_vendor_selection',
  'offers_received'
]

export default function Bookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [editingBooking, setEditingBooking] = useState(null)
  const [deletingBookingId, setDeletingBookingId] = useState(null)
  const [alertMessage, setAlertMessage] = useState(null)
  const [editFormData, setEditFormData] = useState({
    date: '',
    time: '',
    description: '',
    budget: '',
  })
  const [editErrors, setEditErrors] = useState({})
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const showAlert = (text, type = 'success') => {
    setAlertMessage({ text, type })
    setTimeout(() => {
      setAlertMessage(null)
    }, 4000)
  }

  const handleEditClick = (b) => {
    setActiveDropdown(null)
    setEditFormData({
      date: formatDateForInput(b.date),
      time: b.time || '',
      description: b.description || '',
      budget: b.budget || '',
    })
    setEditErrors({})
    setEditingBooking(b)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!editFormData.date) errors.date = 'Date is required'
    if (!editFormData.time) errors.time = 'Time is required'
    
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }
    
    setIsSavingEdit(true)
    try {
      const response = await api.put(`/bookings/${editingBooking.id}`, {
        bookingDate: editFormData.date,
        timeSlot: editFormData.time,
        description: editFormData.description,
        optionalBudget: editFormData.budget ? Number(editFormData.budget) : undefined,
      })
      
      const updated = response.data.booking
      
      setBookings((prev) =>
        prev.map((b) =>
          b.id === editingBooking.id
            ? {
                ...b,
                date: updated.bookingDate,
                time: updated.timeSlot,
                description: updated.description,
                budget: updated.optionalBudget,
              }
            : b
        )
      )
      
      setEditingBooking(null)
      showAlert('Booking updated successfully!', 'success')
    } catch (err) {
      setEditErrors({ submit: err.response?.data?.message || 'Failed to update booking.' })
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteClick = (bId) => {
    setActiveDropdown(null)
    setDeletingBookingId(bId)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/bookings/${deletingBookingId}`)
      setBookings((prev) => prev.filter((b) => b.id !== deletingBookingId))
      showAlert('Booking deleted successfully!', 'success')
      setDeletingBookingId(null)
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to delete booking.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-trigger') && !e.target.closest('.dropdown-menu')) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/me')
        const bookingsData = response.data.bookings || []
        // Sort bookings by newest first (using createdAt)
        const sortedBookings = [...bookingsData].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        setBookings(
          sortedBookings.map((b) => ({
            id: b._id,
            service: b.selectedService || b.serviceId?.name || 'Service',
            startingPrice: b.serviceStartingPrice !== undefined ? b.serviceStartingPrice : (b.serviceId?.basePrice || 0),
            budget: b.optionalBudget,
            date: b.bookingDate,
            time: b.timeSlot || '',
            status: b.status,
            amount: b.escrowAmount || 0,
            address: b.location?.address || '',
            description: b.description || '',
          })),
        )
      } catch {
        setLoadError('Unable to load your bookings. Please try again later.')
      }
    }

    fetchBookings()
  }, [])

  // Date formatting is handled by centralized utility function imported from utils

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-4 sm:gap-6 px-4 py-4 sm:py-6 lg:px-0">
        <Sidebar />
        <main className="flex-1">
          <div className="rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Bookings</h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-600">Your recent and upcoming bookings.</p>
              </div>
              <Button onClick={() => navigate('/customer/book-service')} className="w-full sm:w-auto">
                Book a Service
              </Button>
            </div>

            {alertMessage && (
              <div className={`mb-4 rounded-md p-4 text-sm font-semibold border ${
                alertMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {alertMessage.text}
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No bookings yet.</p>
                <Button onClick={() => navigate('/customer/book-service')}>
                  Book Your First Service
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {bookings.map((b) => (
                    <div 
                      key={b.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm sm:text-base font-semibold text-slate-900">{b.service}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusBadge[b.status] || 'bg-slate-100 text-slate-800'}`}>
                            {b.status ? b.status.replace(/_/g, ' ') : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
                          <span>{formatDateDDMMYYYY(b.date)}</span>
                          {b.time && (
                            <>
                              <span>•</span>
                              <span>{b.time}</span>
                            </>
                          )}
                          {b.startingPrice !== undefined && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-700">Starting Price: Rs {Number(b.startingPrice).toLocaleString('en-US')}</span>
                            </>
                          )}
                          {b.budget !== undefined && b.budget !== null && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-700">Budget: Rs {Number(b.budget).toLocaleString('en-US')}</span>
                            </>
                          )}
                          {b.amount ? (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-700">Escrow Held: Rs {Number(b.amount).toLocaleString('en-US')}</span>
                            </>
                          ) : null}
                        </div>
                        {b.address && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-1">{b.address}</p>
                        )}
                        {b.status === STATUS.VENDOR_ASSIGNED && (
                          <p className="mt-1 text-xs font-semibold text-blue-600">
                            👍 Vendor assigned — please secure payment
                          </p>
                        )}
                        {b.status === STATUS.WORK_IN_PROGRESS && (
                          <p className="mt-1 text-xs font-semibold text-indigo-600">
                            🛠️ Vendor is working on your request
                          </p>
                        )}
                        {b.status === STATUS.AWAITING_APPROVAL && (
                          <p className="mt-1 text-xs font-semibold text-orange-600">
                            📸 Vendor submitted proof — review needed
                          </p>
                        )}
                        {b.status === STATUS.REVISION_REQUESTED && (
                          <p className="mt-1 text-xs font-semibold text-yellow-700">
                            🔄 Revision requested — vendor reworking
                          </p>
                        )}
                        {b.status === STATUS.PAYMENT_PENDING && (
                          <p className="mt-1 text-xs font-semibold text-emerald-600">
                            ✅ Work approved — payment pending
                          </p>
                        )}
                        {b.status === STATUS.DISPUTED && (
                          <p className="mt-1 text-xs font-semibold text-red-600">
                            ⚠️ Dispute raised — admin reviewing
                          </p>
                        )}
                        {b.status === STATUS.COMPLETED && (
                          <p className="mt-1 text-xs font-semibold text-green-600">
                            🎉 Completed & paid
                          </p>
                        )}
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center gap-2 relative">
                        <Button onClick={() => navigate(`/customer/bookings/${b.id}`)} size="sm">
                          View Details
                        </Button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDropdown(activeDropdown === b.id ? null : b.id)
                            }}
                            className="dropdown-trigger p-1.5 rounded-full hover:bg-slate-200 text-slate-600 transition-colors focus:outline-none"
                            aria-label="Booking Options"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>
                          {activeDropdown === b.id && (
                            <div className="dropdown-menu absolute right-0 mt-1 w-36 rounded-md bg-white shadow-lg border border-slate-200 py-1 z-10">
                              <button
                                onClick={() => handleEditClick(b)}
                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                  EDITABLE_DELETABLE_STATUSES.includes(b.status)
                                    ? 'text-slate-700 hover:bg-slate-50'
                                    : 'text-slate-300 cursor-not-allowed'
                                }`}
                                disabled={!EDITABLE_DELETABLE_STATUSES.includes(b.status)}
                                title={!EDITABLE_DELETABLE_STATUSES.includes(b.status) ? 'Only pending bookings can be edited' : ''}
                              >
                                Edit Booking
                              </button>
                              <button
                                onClick={() => handleDeleteClick(b.id)}
                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                  EDITABLE_DELETABLE_STATUSES.includes(b.status)
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-red-300 cursor-not-allowed'
                                }`}
                                disabled={!EDITABLE_DELETABLE_STATUSES.includes(b.status)}
                                title={!EDITABLE_DELETABLE_STATUSES.includes(b.status) ? 'Only pending bookings can be deleted' : ''}
                              >
                                Delete Booking
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {loadError && (
                  <div className="mb-4 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                    {loadError}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Booking</h3>
              <button 
                onClick={() => setEditingBooking(null)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <DatePicker
                  label="Select Date *"
                  name="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  min={formatDateForInput(new Date())}
                  error={editErrors.date}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Time *</label>
                <select
                  name="time"
                  value={editFormData.time}
                  onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                  className={`block w-full rounded-md border ${
                    editErrors.time ? 'border-red-300' : 'border-slate-300'
                  } bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500`}
                >
                  <option value="">Select a time...</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {editErrors.time && <p className="mt-1 text-xs text-red-600">{editErrors.time}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Budget (PKR) (Optional)</label>
                <Input
                  type="number"
                  name="budget"
                  value={editFormData.budget}
                  onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                  placeholder="Enter your budget"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Additional Details (Optional)</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the issue..."
                  className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {editErrors.submit && (
                <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
                  {editErrors.submit}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingBooking(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBookingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 animate-scale-up">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Booking</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this booking? This action cannot be undone and will cancel your service request.
            </p>
            
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-transparent"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeletingBookingId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
