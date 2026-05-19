import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Loader from '../../components/ui/Loader'
import Button from '../../components/ui/Button'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

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
        setJobs(response.data.items || [])
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
                  <img
                    src="https://picsum.photos/seed/handyman/400/300"
                    alt="No jobs"
                    className="mx-auto w-full max-w-md h-48 object-cover rounded-lg"
                  />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">No jobs found</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {filter === 'all'
                      ? "You don't have any jobs yet."
                      : `No ${filter} jobs at the moment.`}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                  <Link key={job.id} to={`/vendor/jobs/${job.id}`} className="block">
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-200">
                        <img
                          src="https://picsum.photos/seed/handyman/400/300"
                          alt={job.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
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
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
