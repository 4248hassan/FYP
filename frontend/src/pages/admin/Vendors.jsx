import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

export default function AdminVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submittingId, setSubmittingId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchVendors() {
      try {
        setLoading(true)
        setError(null)
        console.debug('[admin/Vendors] requesting /admin/vendors')
        const response = await api.get('/admin/vendors')
        console.debug('[admin/Vendors] vendors response', response.data)
        if (!isMounted) return
        setVendors(response.data.vendors || [])
      } catch (err) {
        if (!isMounted) return
        console.error('[admin/Vendors] failed to load vendors:', err)
        setError('Failed to load vendors.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchVendors()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAction = async (vendor) => {
    const id = vendor._id
    const action = vendor.isVerified ? (vendor.isBlocked ? 'unblock' : 'block') : 'verify'
    setSubmittingId(id)
    setError(null)
    try {
      console.debug('[admin/Vendors] calling', `/admin/vendors/${id}/${action}`)
      const response = await api.post(`/admin/vendors/${id}/${action}`)
      console.debug('[admin/Vendors] action response', response.data)
      const updated = response.data.user
      setVendors((prev) => prev.map((v) => (v._id === id ? { ...v, ...updated } : v)))
    } catch (err) {
      console.error('[admin/Vendors] failed to update vendor:', err)
      setError('Failed to update vendor.')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleReject = async (id) => {
    setSubmittingId(id)
    setError(null)
    try {
      console.debug('[admin/Vendors] calling block for vendor', id)
      const response = await api.post(`/admin/vendors/${id}/block`)
      console.debug('[admin/Vendors] block response', response.data)
      const updated = response.data.user
      setVendors((prev) => prev.map((v) => (v._id === id ? { ...v, ...updated } : v)))
    } catch (err) {
      console.error('[admin/Vendors] failed to block vendor:', err)
      setError('Failed to block vendor.')
    } finally {
      setSubmittingId(null)
    }
  }

  const getStatusColor = (vendor) => {
    if (vendor.isBlocked) return 'bg-red-100 text-red-800'
    if (vendor.isVerified) return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusLabel = (vendor) => {
    if (vendor.isBlocked) return 'Blocked'
    if (vendor.isVerified) return 'Verified'
    return 'Pending verification'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Review and approve vendor applications
                </p>
              </div>
              <Link to="/admin">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </div>

            {loading ? (
              <Loader label="Loading vendors..." />
            ) : error ? (
              <Card header="Error">
                <p className="text-sm text-red-600">{error}</p>
              </Card>
            ) : vendors.length === 0 ? (
              <Card>
                <div className="py-12 text-center">
                  <img
                    src="https://picsum.photos/seed/handyman/400/300"
                    alt="No vendors"
                    className="mx-auto w-full max-w-md h-48 object-cover rounded-lg"
                  />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">No vendors found</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    There are no vendors to manage at the moment.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vendors.map((vendor) => (
                  <Card key={vendor._id} className="overflow-hidden">
                    <div className="aspect-video w-full overflow-hidden bg-slate-200">
                      <img
                        src="https://picsum.photos/seed/handyman/400/300"
                        alt={vendor.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <img
                          src={`https://i.pravatar.cc/150?u=${vendor.name}`}
                          alt={vendor.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{vendor.name}</h3>
                          <p className="text-xs text-slate-600">
                            {vendor.totalJobs || 0} jobs completed
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            vendor,
                          )}`}
                        >
                          {getStatusLabel(vendor)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleAction(vendor)}
                          disabled={submittingId === vendor._id}
                          className="flex-1"
                        >
                          {submittingId === vendor._id
                            ? 'Saving...'
                            : vendor.isVerified
                            ? vendor.isBlocked
                              ? 'Unblock'
                              : 'Block'
                            : 'Verify'}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleReject(vendor._id)}
                          disabled={vendor.isBlocked}
                          className="flex-1"
                        >
                          Block
                        </Button>
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
