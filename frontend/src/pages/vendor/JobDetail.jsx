import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { jobDetail, jobProofPlaceholder } from '../../assets/images'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [proofPreview, setProofPreview] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchJob() {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/vendor/jobs')
        if (!isMounted) return
        const found = (response.data.items || []).find((j) => j.id === id)
        if (!found) {
          setError('Job not found.')
        } else {
          setJob(found)
        }
      } catch {
        if (!isMounted) return
        setError('Failed to load job.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchJob()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleAccept = async () => {
    if (!job) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await api.post(`/vendor/jobs/${job.id}/accept`)
      setJob(response.data.job)
    } catch {
      setError('Failed to accept job.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProofChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setProofPreview(null)
      return
    }
    setProofPreview(URL.createObjectURL(file))
  }

  const handleSubmitProof = async () => {
    if (!job || !proofPreview) return
    setSubmitting(true)
    setError(null)
    try {
      await api.post(`/vendor/jobs/${job.id}/proof`, {
        proof: proofPreview,
      })
      setJob((prev) => ({ ...prev, status: 'completed' }))
      navigate('/vendor')
    } catch {
      setError('Failed to submit proof.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Loader label="Loading job..." />
          </main>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card header="Error">
              <p className="text-sm text-red-600">{error || 'Job not found'}</p>
              <Link to="/vendor" className="mt-4 inline-block">
                <Button>Back to Dashboard</Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const canAccept = job.status === 'pending'
  const canSubmitProof = job.status === 'awaiting_proof' || job.status === 'in_progress'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                <p className="mt-1 text-sm text-slate-600">Job ID: {job.id}</p>
              </div>
              <Link to="/vendor">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card header="Job Images">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <img
                      src={jobDetail}
                      alt="Job image 1"
                      className="w-full h-48 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <img
                      src={jobDetail}
                      alt="Job image 2"
                      className="w-full h-48 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </div>
                </Card>

                <Card header="Job Details">
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="font-medium text-slate-700">Customer</dt>
                      <dd className="text-slate-900">{job.customerName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-slate-700">Status</dt>
                      <dd className="text-slate-900 capitalize">{job.status}</dd>
                    </div>
                    {job.description && (
                      <div>
                        <dt className="font-medium text-slate-700">Description</dt>
                        <dd className="mt-1 text-slate-700">{job.description}</dd>
                      </div>
                    )}
                  </dl>
                </Card>

                {canSubmitProof && (
                  <Card header="Proof of Work">
                    <p className="mb-4 text-sm text-slate-600">
                      Upload a photo or screenshot as proof of completed work.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofChange}
                      className="mb-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-50"
                    />
                    {proofPreview ? (
                      <div className="mb-4">
                        <p className="mb-2 text-xs text-slate-500">Preview:</p>
                        <img
                          src={proofPreview}
                          alt="Proof preview"
                          className="h-48 w-full rounded-lg border border-slate-200 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="mb-2 text-xs text-slate-500">Preview placeholder:</p>
                        <img
                          src={jobProofPlaceholder}
                          alt="Placeholder"
                          className="w-full h-48 rounded-lg border border-slate-200 object-cover opacity-50"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <Button
                      onClick={handleSubmitProof}
                      disabled={!proofPreview || submitting}
                      className="w-full"
                    >
                      {submitting ? 'Submitting...' : 'Submit Proof'}
                    </Button>
                    {error && (
                      <p className="mt-2 text-sm text-red-600" role="alert">
                        {error}
                      </p>
                    )}
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card header="Status">
                  <div className="mt-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        job.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : job.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </Card>

                <Card header="Actions">
                  <div className="space-y-2">
                    {canAccept && (
                      <Button
                        onClick={handleAccept}
                        disabled={submitting}
                        className="w-full"
                      >
                        Accept Job
                      </Button>
                    )}
                    <Link to="/vendor/jobs" className="block">
                      <Button variant="secondary" className="w-full">
                        View All Jobs
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
