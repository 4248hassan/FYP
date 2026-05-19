import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

export default function Bookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/orders/user')
        const orders = response.data.orders || []
        setBookings(
          orders.map((order) => ({
            id: order._id,
            service: order.serviceId?.name || 'Service',
            date: order.date,
            time: order.date ? new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            status: order.status,
            amount: order.amount,
            address: order.address,
          })),
        )
      } catch {
        setLoadError('Unable to load your bookings. Please try again later.')
      }
    }

    fetchBookings()
  }, [])

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

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
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[b.status] || 'bg-slate-100 text-slate-800'}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
                          <span>{formatDate(b.date)}</span>
                          {b.time && (
                            <>
                              <span>•</span>
                              <span>{b.time}</span>
                            </>
                          )}
                          {b.amount && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-700">Rs {Number(b.amount).toLocaleString('en-US')}</span>
                            </>
                          )}
                        </div>
                        {b.address && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-1">{b.address}</p>
                        )}
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
    </div>
  )
}
