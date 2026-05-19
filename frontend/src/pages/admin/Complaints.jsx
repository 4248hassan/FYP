import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [selectedComplaintId, setSelectedComplaintId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  const selectedComplaint = complaints.find((c) => c._id === selectedComplaintId)

  useEffect(() => {
    let isMounted = true

    async function fetchComplaints() {
      try {
        setLoading(true)
        setError(null)
        const query = filterStatus ? `?status=${encodeURIComponent(filterStatus)}` : ''
        console.debug('[admin/Complaints] requesting', `/admin/complaints${query}`)
        const response = await api.get(`/admin/complaints${query}`)
        console.debug('[admin/Complaints] complaints response', response.data)
        if (!isMounted) return
        setComplaints(response.data.complaints || [])
      } catch (err) {
        if (!isMounted) return
        console.error('[admin/Complaints] failed to load complaints:', err)
        setError('Unable to load complaints. Please try again.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchComplaints()
    return () => {
      isMounted = false
    }
  }, [filterStatus])

  const handleStatusChange = async (status) => {
    if (!selectedComplaint) return
    setUpdating(true)
    try {
      console.debug('[admin/Complaints] updating complaint status', {
        complaintId: selectedComplaint._id,
        status,
      })
      const response = await api.put(`/admin/complaints/${selectedComplaint._id}/status`, { status })
      console.debug('[admin/Complaints] status update response', response.data)
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === selectedComplaint._id ? response.data.complaint : complaint,
        ),
      )
    } catch (err) {
      console.error('[admin/Complaints] failed to update complaint status:', err)
      setError('Unable to update complaint status. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Complaint Management</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Review complaint details, customer info and update statuses in real time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-slate-700">Filter status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="">All statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Link to="/admin">
                  <Button variant="ghost">Back to Dashboard</Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card header="All Complaints">
                  {loading ? (
                    <Loader label="Loading complaints..." />
                  ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                  ) : complaints.length === 0 ? (
                    <div className="py-12 text-center text-slate-600">
                      No complaints found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {complaints.map((complaint) => (
                        <button
                          key={complaint._id}
                          type="button"
                          onClick={() => setSelectedComplaintId(complaint._id)}
                          className={`w-full rounded-lg border p-4 text-left transition-colors ${
                            selectedComplaintId === complaint._id
                              ? 'border-sky-500 bg-sky-50'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{complaint.title}</p>
                              <p className="mt-1 text-xs text-slate-600">{complaint.category}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {complaint.user?.name || 'Unknown customer'}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                complaint.status,
                              )}`}
                            >
                              {complaint.status}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">
                            {complaint.description?.slice(0, 120) || 'No description available.'}
                          </p>
                          <p className="mt-3 text-xs text-slate-400">
                            Created {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              <div>
                <Card header="Complaint Details">
                  {!selectedComplaint ? (
                    <div className="py-12 text-center text-slate-600">
                      Select a complaint to view details and update status.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Title</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{selectedComplaint.title}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Submitted by</p>
                        <p className="mt-1 text-sm text-slate-900">{selectedComplaint.user?.name}</p>
                        <p className="text-xs text-slate-500">{selectedComplaint.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Category</p>
                        <p className="mt-1 text-sm text-slate-900">{selectedComplaint.category}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
                        <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{selectedComplaint.description}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Current Status</p>
                        <p className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {selectedComplaint.status}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="status" className="block text-xs font-medium text-slate-700">
                          Update status
                        </label>
                        <select
                          id="status"
                          value={selectedComplaint.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                          disabled={updating}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedComplaint.resolution && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Resolution notes</p>
                          <p className="mt-1 text-sm text-slate-600">{selectedComplaint.resolution}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
