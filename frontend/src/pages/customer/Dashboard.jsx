import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Navbar from '../../components/layout/Navbar'
// TopNav removed to keep header minimal per design
import { useAuth } from '../../hooks/useAuth'
import Sidebar from '../../components/layout/Sidebar'
import UpcomingBookings from '../../components/dashboard/UpcomingBookings'
import { convertUSDToPKR } from '../../utils'
import api from '../../services/api'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/user')
        setOrders(res.data.orders || [])
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Calculate stats from orders
  const stats = useMemo(() => {
    const activeBookings = orders.filter(order => ['pending', 'accepted'].includes(order.status)).length
    const completedServices = orders.filter(order => order.status === 'completed').length
    const pendingPayments = orders.filter(order => order.status === 'pending').length
    const totalSpent = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.amount || 0), 0)

    return { activeBookings, completedServices, pendingPayments, totalSpent }
  }, [orders])

  const handleBookService = () => {
    navigate('/customer/book-service')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center">Loading...</div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center text-red-600">{error}</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Customer'}!</h1>
            <p className="text-gray-600">Here's an overview of your service bookings.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Bookings</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.activeBookings}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">Completed Services</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completedServices}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayments}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
              <p className="text-3xl font-bold text-purple-600">PKR {convertUSDToPKR(stats.totalSpent)}</p>
            </Card>
          </div>

          {orders.length === 0 ? (
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">No bookings yet</h2>
              <p className="text-gray-600 mb-6">Book your first service to get started!</p>
              <Button onClick={handleBookService}>Book Service</Button>
            </Card>
          ) : (
            <UpcomingBookings orders={orders} />
          )}
        </main>
      </div>
    </div>
  )
}
