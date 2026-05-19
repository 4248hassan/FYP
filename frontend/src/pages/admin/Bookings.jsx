import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchBookings() {
      try {
        setLoading(true)
        setError(null)
        console.debug('[admin/Bookings] requesting /admin/bookings')
        const response = await api.get('/admin/bookings')
        console.debug('[admin/Bookings] bookings response', response.data)
        if (!isMounted) return
        setBookings(response.data.bookings || [])
      } catch (err) {
        if (!isMounted) return
        console.error('[admin/Bookings] failed to load bookings:', err)
        setError('Unable to load bookings. Please try again later.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchBookings()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Review all bookings and orders from the live database.
                </p>
              </div>
              <Link to="/admin">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </div>

            {loading ? (
              <Loader label="Loading bookings..." />
            ) : error ? (
              <Card header="Error">
                <p className="text-sm text-red-600">{error}</p>
              </Card>
            ) : bookings.length === 0 ? (
              <Card>
                <div className="py-12 text-center text-slate-600">No bookings found.</div>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking._id} className="overflow-hidden">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 py-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{booking.customerId?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{booking.customerId?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Vendor</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{booking.vendorId?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{booking.vendorId?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Service</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{booking.serviceId?.name || 'Service not available'}</p>
                        <p className="text-xs text-slate-500">Amount: PKR {booking.serviceId?.basePrice || booking.escrowAmount || 0}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 border-t border-slate-200 px-4 py-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Booking Date</p>
                        <p className="mt-1 text-sm text-slate-900">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Unknown date'}</p>
                        <p className="text-xs text-slate-500">{booking.timeSlot || 'No timeslot'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                        <p className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {booking.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Created</p>
                        <p className="mt-1 text-sm text-slate-900">{new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
