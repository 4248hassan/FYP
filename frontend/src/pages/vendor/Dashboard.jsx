import { useMemo, useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import VendorLayout from '../../components/vendor/VendorLayout'
import api from '../../services/api'

export default function VendorDashboard() {
  const [pendingComplaints, setPendingComplaints] = useState([])
  const [assignedBookings, setAssignedBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, earningsRes] = await Promise.all([
          api.get('/vendor/requests'),
          api.get('/vendor/earnings')
        ])
        setPendingComplaints(requestsRes.data.bookings || [])
        // For assigned bookings, perhaps fetch completed or accepted
        // For now, use earnings completedJobs
        setAssignedBookings(earningsRes.data.completedJobs || [])
      } catch (err) {
        console.error('Error fetching vendor data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statusBadge = useMemo(
    () => ({
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-700',
    }),
    [],
  )

  const handleAccept = async (id) => {
    try {
      await api.post(`/vendor/requests/${id}/respond`, { action: 'accept' })
      setPendingComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: 'accepted' } : c)),
      )
    } catch (err) {
      console.error('Error accepting request:', err)
    }
  }

  const handleReject = async (id) => {
    try {
      await api.post(`/vendor/requests/${id}/respond`, { action: 'reject' })
      setPendingComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: 'rejected' } : c)),
      )
    } catch (err) {
      console.error('Error rejecting request:', err)
    }
  }

  const updateBookingStatus = async (id, status) => {
    try {
      await api.post(`/vendor/work/${id}/status`, { status })
      setAssignedBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      )
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="text-center">Loading...</div>
      </VendorLayout>
    )
  }

  if (error) {
    return (
      <VendorLayout>
        <div className="text-center text-red-600">{error}</div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Pending Requests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
          {pendingComplaints.length === 0 ? (
            <p className="text-gray-500">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingComplaints.map((complaint) => (
                <div key={complaint._id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">{complaint.serviceId?.name || 'Service'}</p>
                    <p className="text-sm text-gray-600">Customer: {complaint.customerId?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Priority: {complaint.priority || 'Medium'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAccept(complaint._id)} className="bg-green-600 hover:bg-green-700">
                      Accept
                    </Button>
                    <Button onClick={() => handleReject(complaint._id)} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Assigned Bookings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Assigned Bookings</h2>
          {assignedBookings.length === 0 ? (
            <p className="text-gray-500">No assigned bookings</p>
          ) : (
            <div className="space-y-4">
              {assignedBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">{booking.serviceId?.name || 'Service'}</p>
                    <p className="text-sm text-gray-600">Status: <span className={`px-2 py-1 rounded text-xs ${statusBadge[booking.status] || 'bg-gray-100'}`}>{booking.status}</span></p>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'accepted' && (
                      <Button onClick={() => updateBookingStatus(booking._id, 'in_progress')} className="bg-blue-600 hover:bg-blue-700">
                        Start Work
                      </Button>
                    )}
                    {booking.status === 'in_progress' && (
                      <Button onClick={() => updateBookingStatus(booking._id, 'completed')} className="bg-green-600 hover:bg-green-700">
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </VendorLayout>
  )
}
