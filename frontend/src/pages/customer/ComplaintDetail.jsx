import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { formatDateTime } from '../../utils'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Loader from '../../components/ui/Loader'
import Button from '../../components/ui/Button'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { complaintProblem, getAvatarUrl } from '../../assets/images'
import Avatar from '../../components/ui/Avatar'

export default function ComplaintDetail() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchComplaint() {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get(`/complaints/${id}`)
        if (!isMounted) return
        setComplaint(response.data)
      } catch {
        if (!isMounted) return
        setError('Failed to load complaint.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchComplaint()

    return () => {
      isMounted = false
    }
  }, [id])

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Loader label="Loading complaint..." />
          </main>
        </div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card header="Error">
              <p className="text-sm text-red-600">
                {error || 'Complaint not found'}
              </p>
              <Link to="/customer" className="mt-4 inline-block">
                <Button>Back to Dashboard</Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const assignedVendor = complaint.assignedVendor || {
    name: 'Not yet assigned',
    email: '',
    phone: '',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{complaint.title}</h1>
                <p className="mt-1 text-sm text-slate-600">Complaint ID: {complaint.id}</p>
              </div>
              <Link to="/customer">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card header="Problem Images">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <img
                      src={complaintProblem}
                      alt="Problem image 1"
                      className="w-full h-48 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <img
                      src={complaintProblem}
                      alt="Problem image 2"
                      className="w-full h-48 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </div>
                </Card>

                <Card header="Description">
                  <p className="text-sm text-slate-700">
                    {complaint.description || 'No description provided.'}
                  </p>
                </Card>

                <Card header="Location">
                  <p className="text-sm text-slate-700">
                    {complaint.location || 'Location not specified'}
                  </p>
                </Card>
              </div>

              <div className="space-y-6">
                <Card header="Status">
                  <div className="mt-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                        complaint.status,
                      )}`}
                    >
                      {complaint.status}
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">
                    Created:{' '}
                    {complaint.createdAt
                      ? formatDateTime(complaint.createdAt)
                      : 'Unknown'}
                  </p>
                </Card>

                <Card header="Assigned Vendor">
                  {assignedVendor.name !== 'Not yet assigned' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={assignedVendor.profileImage}
                          name={assignedVendor.name}
                          sizeClassName="h-12 w-12 text-sm"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{assignedVendor.name}</p>
                          <p className="text-xs text-slate-500">{assignedVendor.email}</p>
                        </div>
                      </div>
                      {assignedVendor.phone && (
                        <p className="text-sm text-slate-600">Phone: {assignedVendor.phone}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      Waiting for vendor assignment...
                    </p>
                  )}
                </Card>

                <Card header="Actions">
                  <div className="space-y-2">
                    <Link to={`/customer/complaints/${complaint.id}/chat`} className="block">
                      <Button className="w-full">Open Chat</Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
