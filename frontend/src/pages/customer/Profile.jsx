import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import ProfileSettings from '../../components/ProfileSettings'

export default function CustomerProfile() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalComplaints: 0,
    openComplaints: 0,
    resolvedComplaints: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/complaints/my')
        const data = res.data
        setStats({
          totalComplaints: data.total || 0,
          openComplaints: data.open || 0,
          resolvedComplaints: data.resolved || 0,
        })
      } catch (err) {
        console.error('Failed to fetch stats', err)
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
              <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
              <p className="mt-1 text-sm text-slate-600">Manage your account information</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <ProfileSettings title="My Profile" />
              </div>

              <div className="space-y-6">
                <Card header="Statistics">
                  <div className="space-y-4">
                    <div className="rounded-lg bg-sky-50 p-4">
                      <p className="text-xs text-slate-600">Total Complaints</p>
                      <p className="mt-1 text-2xl font-bold text-sky-700">
                        {stats.totalComplaints}
                      </p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-4">
                      <p className="text-xs text-slate-600">Open Complaints</p>
                      <p className="mt-1 text-2xl font-bold text-yellow-700">
                        {stats.openComplaints}
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                      <p className="text-xs text-slate-600">Resolved</p>
                      <p className="mt-1 text-2xl font-bold text-green-700">
                        {stats.resolvedComplaints}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card header="Quick Actions">
                  <div className="space-y-2">
                    <Link to="/customer/complaints/new" className="block">
                      <Button className="w-full">Create New Complaint</Button>
                    </Link>
                    <Link to="/customer" className="block">
                      <Button variant="secondary" className="w-full">
                        View Dashboard
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

