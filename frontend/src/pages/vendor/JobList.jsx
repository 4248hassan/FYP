import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Loader from '../../components/ui/Loader'
import Button from '../../components/ui/Button'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { getServiceImage } from '../../assets/images'

export default function JobList() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let isMounted = true

    async function fetchJobs() {
      try {
        setLoading(true)
        const response = await api.get('/vendor/jobs')
        if (!isMounted) return
        const bookings = response.data.bookings || []
        setJobs(
          bookings.map((b) => ({
            id: b._id,
            _id: b._id,
            title: b.serviceId?.name || 'Service',
            customerName: b.customerId?.name || 'Customer',
            status: b.status,
            description: b.description || '',
          })),
        )
      } catch (err) {
        console.error('Failed to load jobs')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchJobs()

    return () => {
      isMounted = false
    }
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
      case 'accepted':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const filteredJobs =
    filter === 'all'
      ? jobs
      : jobs.filter((job) => {
          if (filter === 'active') {
            return job.status === 'assigned' || job.status === 'accepted'
          }
          return job.status === filter
        })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">All Jobs</h1>
                <p className="mt-1 text-sm text-slate-600">
                  View and manage all your job assignments
                </p>
              </div>
              <Link to="/vendor">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </div>

            <div className="mb-4 flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilter('all')}
              >
                All ({jobs.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'primary' : 'secondary'}
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'pending' ? 'primary' : 'secondary'}
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'completed' ? 'primary' : 'secondary'}
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
            </div>

            {loading ? (
              <Loader label="Loading jobs..." />
            ) : filteredJobs.length === 0 ? (
              <Card>
                <div className="py-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mb-4">
                    📋
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">No jobs found</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {filter === 'all'
                      ? "You don't have any jobs yet."
                      : `No ${filter} jobs at the moment.`}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => {
                  const serviceImg = getServiceImage(job.title)
                  return (
                    <Link key={job.id} to={`/vendor/jobs/${job.id}`} className="block">
                      <Card className="h-full transition-shadow hover:shadow-md">
                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-200">
                          {serviceImg ? (
                            <img
                              src={serviceImg}
                              alt={job.title}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-slate-100 flex flex-col items-center justify-center border border-slate-200 rounded-lg">
                              <span className="text-4xl text-slate-400">🛠️</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <h3 className="font-semibold text-slate-900">{job.title}</h3>
                          <p className="mt-1 text-xs text-slate-600">
                            Customer: {job.customerName}
                          </p>
                          <div className="mt-3">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                job.status,
                              )}`}
                            >
                              {job.status}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
