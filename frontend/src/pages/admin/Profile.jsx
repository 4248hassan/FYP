import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import ProfileSettings from '../../components/ProfileSettings'

export default function AdminProfile() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get('/admin/stats')
        setStats(response.data)
      } catch {
        console.error('Failed to fetch stats')
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>
              <p className="mt-1 text-sm text-slate-600">Manage your admin account</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <ProfileSettings title="Admin Profile" />
              </div>

              <div className="space-y-6">
                {stats && (
                  <Card header="Platform Statistics">
                    <div className="space-y-4">
                            <div className="rounded-lg bg-sky-50 p-4">
                        <p className="text-xs text-slate-600">Total Customers</p>
                        <p className="mt-1 text-2xl font-bold text-sky-700">
                          {stats.totalCustomers}
                        </p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-xs text-slate-600">Total Vendors</p>
                        <p className="mt-1 text-2xl font-bold text-blue-700">
                          {stats.totalVendors}
                        </p>
                      </div>
                      <div className="rounded-lg bg-yellow-50 p-4">
                        <p className="text-xs text-slate-600">Open Complaints</p>
                        <p className="mt-1 text-2xl font-bold text-yellow-700">
                          {stats.openComplaints}
                        </p>
                      </div>
                      <div className="rounded-lg bg-green-50 p-4">
                        <p className="text-xs text-slate-600">Resolved Complaints</p>
                        <p className="mt-1 text-2xl font-bold text-green-700">
                          {stats.resolvedComplaints}
                        </p>
                      </div>
                      <div className="rounded-lg bg-fuchsia-50 p-4">
                        <p className="text-xs text-slate-600">Total Bookings</p>
                        <p className="mt-1 text-2xl font-bold text-fuchsia-700">
                          {stats.totalBookings}
                        </p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-4">
                        <p className="text-xs text-slate-600">Pending Bookings</p>
                        <p className="mt-1 text-2xl font-bold text-amber-700">
                          {stats.pendingBookings}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <Card header="Quick Actions">
                  <div className="space-y-2">
                    <Link to="/admin" className="block">
                      <Button className="w-full">View Dashboard</Button>
                    </Link>
                    <Link to="/admin/bookings" className="block">
                      <Button variant="secondary" className="w-full">
                        Manage Bookings
                      </Button>
                    </Link>
                    <Link to="/admin/users" className="block">
                      <Button variant="secondary" className="w-full">
                        Manage Users
                      </Button>
                    </Link>
                    <Link to="/admin/vendors" className="block">
                      <Button variant="secondary" className="w-full">
                        Manage Vendors
                      </Button>
                    </Link>
                    <Link to="/admin/complaints" className="block">
                      <Button variant="secondary" className="w-full">
                        Manage Complaints
                      </Button>
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

