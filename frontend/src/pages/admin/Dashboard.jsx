import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Loader from '../../components/ui/Loader'
import Button from '../../components/ui/Button'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { adminPlatformOverview } from '../../assets/images'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)
        console.debug('[admin/Dashboard] requesting /admin/stats')
        const response = await api.get('/admin/stats')
        console.debug('[admin/Dashboard] stats response', response.data)
        if (!isMounted) return
        setStats(response.data)
      } catch (err) {
        console.error('[admin/Dashboard] failed to load stats', err)
        if (!isMounted) return
        setError('Failed to load admin stats.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchStats()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Loader label="Loading admin dashboard..." />
          </main>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card header="Error">
              <p className="text-sm text-red-600">{error || 'Failed to load stats'}</p>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const cards = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      color: 'bg-sky-50 text-sky-700',
      icon: '👥',
    },
    {
      label: 'Total Vendors',
      value: stats.totalVendors,
      color: 'bg-blue-50 text-blue-700',
      icon: '🔧',
    },
    {
      label: 'Total Complaints',
      value: stats.totalComplaints,
      color: 'bg-orange-50 text-orange-700',
      icon: '📣',
    },
    {
      label: 'Open Complaints',
      value: stats.openComplaints,
      color: 'bg-yellow-50 text-yellow-700',
      icon: '⚠️',
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      color: 'bg-fuchsia-50 text-fuchsia-700',
      icon: '📆',
    },
    {
      label: 'Completed Bookings',
      value: stats.completedBookings,
      color: 'bg-emerald-50 text-emerald-700',
      icon: '✅',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Overview of platform statistics and pending approvals
              </p>
            </div>

            <div className="mb-4 sm:mb-6 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <Card key={card.label} className="overflow-hidden">
                  <div className={`${card.color} p-3 sm:p-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                          {card.label}
                        </p>
                        <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold">{card.value}</p>
                      </div>
                      <span className="text-2xl sm:text-3xl">{card.icon}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card header="Pending Approvals">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg bg-yellow-50 p-3 sm:p-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-900">
                          {stats.pendingVendors} vendors pending verification
                        </p>
                        <p className="text-xs text-slate-600">Requires admin approval</p>
                      </div>
                    </div>
                  </div>
                  <Link to="/admin/vendors">
                    <Button className="w-full text-sm">Manage Vendors</Button>
                  </Link>
                </div>
              </Card>

              <Card header="Recent Activity">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border border-slate-200 p-3">
                    <div className="flex-1 w-full">
                      <p className="text-xs sm:text-sm font-medium text-slate-900">
                        {stats.openComplaints} open complaints
                      </p>
                      <p className="text-xs text-slate-600">Need attention</p>
                    </div>
                  </div>
                  <Link to="/admin/complaints">
                    <Button variant="secondary" className="w-full text-sm">
                      Manage Complaints
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <Card header="Platform Overview">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-200">
                  <img
                    src={adminPlatformOverview}
                    alt="Platform overview"
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
