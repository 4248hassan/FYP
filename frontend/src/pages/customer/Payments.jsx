import { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { convertUSDToPKR } from '../../utils'
import api from '../../services/api'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPayments = async () => {
      try {
          const res = await api.get('/bookings/me')
          const bookings = res.data.bookings || []
          const paymentData = bookings.map((b) => ({
            id: b._id,
            label: `${b.serviceId?.name || 'Service'} - ${b.status}`,
            amount: b.escrowAmount || 0,
            status: b.status === 'completed' ? 'Released' : b.status === 'payment_secured' ? 'Held' : 'Pending',
          }))
          setPayments(paymentData)
      } catch (err) {
        console.error('Error fetching payments:', err)
        setError('Failed to load payments')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-4 sm:gap-6 px-4 py-4 sm:py-6 lg:px-0">
          <Sidebar />
          <main className="flex-1">
            <div className="text-center">Loading...</div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-4 sm:gap-6 px-4 py-4 sm:py-6 lg:px-0">
          <Sidebar />
          <main className="flex-1">
            <div className="text-center text-red-600">{error}</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-4 sm:gap-6 px-4 py-4 sm:py-6 lg:px-0">
        <Sidebar />
        <main className="flex-1">
          <div className="rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Payments</h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">View your transactions and pending payments.</p>

            {payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No payments yet.</p>
              </div>
            ) : (
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                {payments.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border p-3 sm:p-4">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-medium text-slate-900">{p.label}</p>
                      <p className="text-xs sm:text-sm text-slate-500">{convertUSDToPKR(p.amount)}</p>
                    </div>
                    <div className={`text-xs sm:text-sm font-medium px-2 py-1 rounded ${p.status === 'Released' ? 'bg-green-100 text-green-800' : p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {p.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
