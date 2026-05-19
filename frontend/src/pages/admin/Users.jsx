import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

export default function AdminUsers() {
  const [customers, setCustomers] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchUsers() {
      try {
        setLoading(true)
        setError(null)
        console.debug('[admin/Users] requesting /admin/users')
        const response = await api.get('/admin/users')
        console.debug('[admin/Users] users response', response.data)
        if (!isMounted) return
        setCustomers(response.data.customers || [])
        setVendors(response.data.vendors || [])
      } catch (err) {
        if (!isMounted) return
        console.error('[admin/Users] failed to load users:', err)
        setError('Unable to load users. Please refresh.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchUsers()
    return () => {
      isMounted = false
    }
  }, [])

  const handleAction = async (id, action) => {
    setActionLoading(id)
    setError(null)
    try {
      console.debug('[admin/Users] calling', `/admin/users/${id}/${action}`)
      const response = await api.patch(`/admin/users/${id}/${action}`)
      console.debug('[admin/Users] user action response', response.data)
      const updated = response.data.user
      setCustomers((prev) => prev.map((user) => (user._id === id ? updated : user)))
      setVendors((prev) => prev.map((user) => (user._id === id ? updated : user)))
    } catch (err) {
      console.error('[admin/Users] user action failed:', err)
      setError('Unable to update user at this time.')
    } finally {
      setActionLoading(null)
    }
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
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Review registered customers and vendors from the database.
                </p>
              </div>
              <Link to="/admin">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </div>

            {loading ? (
              <Loader label="Loading users..." />
            ) : error ? (
              <Card header="Error">
                <p className="text-sm text-red-600">{error}</p>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card header="Customers">
                  {customers.length === 0 ? (
                    <div className="py-12 text-center text-slate-600">
                      No customers found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customers.map((customer) => (
                        <div
                          key={customer._id}
                          className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                            <p className="text-xs text-slate-500">{customer.email}</p>
                            <p className="text-xs text-slate-500">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Customer</span>
                            <Button
                              variant="ghost"
                              onClick={() => handleAction(customer._id, customer.isBlocked ? 'unblock' : 'block')}
                              disabled={actionLoading === customer._id}
                            >
                              {customer.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card header="Vendors">
                  {vendors.length === 0 ? (
                    <div className="py-12 text-center text-slate-600">
                      No vendors found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vendors.map((vendor) => (
                        <div
                          key={vendor._id}
                          className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{vendor.name}</p>
                            <p className="text-xs text-slate-500">{vendor.email}</p>
                            <p className="text-xs text-slate-500">Joined {new Date(vendor.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${vendor.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {vendor.isVerified ? 'Verified vendor' : 'Pending verification'}
                            </span>
                            <Button
                              variant="secondary"
                              onClick={() => handleAction(vendor._id, vendor.isVerified ? 'block' : 'verify')}
                              disabled={actionLoading === vendor._id}
                            >
                              {vendor.isVerified ? (vendor.isBlocked ? 'Unblock' : 'Block') : 'Verify'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
