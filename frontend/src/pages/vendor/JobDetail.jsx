import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { STATUS, STATUS_LABEL, STATUS_BADGE } from '../../constants/status'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob]               = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [proofPreview, setProofPreview] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  // ─── Fetch Job ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get(`/vendor/jobs/${id}`)
        if (mounted) setJob(res.data.booking || res.data)
      } catch {
        if (mounted) setError('Failed to load job details.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  // ─── Start Work ─────────────────────────────────────────────────────────
  const handleStartWork = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.post(`/vendor/work/${job._id}/status`, {
        status: STATUS.WORK_IN_PROGRESS,
      })
      setJob(res.data.booking)
      setSuccessMsg('Work started! Upload your proof of work when complete.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start work.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── File input handler ─────────────────────────────────────────────────
  const handleProofChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) { setProofPreview(null); return }
    setProofPreview(URL.createObjectURL(file))
  }

  // ─── Submit Proof ───────────────────────────────────────────────────────
  const handleSubmitProof = async () => {
    if (!proofPreview) return
    setSubmitting(true)
    setError(null)
    try {
      const fileInput = document.querySelector('input[type="file"]')
      const file = fileInput?.files?.[0]
      if (!file) {
        setError('Please select an image file')
        setSubmitting(false)
        return
      }

      // Step 1: Upload image to Cloudinary via the dedicated upload endpoint
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      const uploadRes = await api.post('/uploads/image', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const imageUrl = uploadRes.data?.url
      if (!imageUrl) throw new Error('Image upload failed — no URL returned')

      // Step 2: Submit proof as JSON with the Cloudinary URL
      await api.post(`/vendor/jobs/${job._id}/proof`, {
        bookingId: job._id,
        mediaUrls: [imageUrl],
        description: `Proof of work for booking ${job._id}`,
      })

      setJob((prev) => ({ ...prev, status: STATUS.AWAITING_APPROVAL }))
      setSuccessMsg('✅ Proof submitted! Awaiting customer review.')
      setProofPreview(null)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit proof.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Loading / Error States ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6"><Loader label="Loading job details…" /></main>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card header="Error">
              <p className="text-sm text-red-600">{error}</p>
              <Link to="/vendor" className="mt-4 inline-block">
                <Button>Back to Dashboard</Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  // ─── Derived State ──────────────────────────────────────────────────────
  const canStartWork    = job.status === STATUS.VENDOR_ASSIGNED
  const canSubmitProof  = job.status === STATUS.WORK_IN_PROGRESS || job.status === STATUS.REVISION_REQUESTED
  const isWaiting       = job.status === STATUS.AWAITING_APPROVAL
  const isPaymentDue    = job.status === STATUS.PAYMENT_PENDING
  const isCompleted     = job.status === STATUS.COMPLETED
  const isDisputed      = job.status === STATUS.DISPUTED

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {job.selectedService || job.serviceId?.name || 'Job Details'}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">Booking ID: {job._id}</p>
              </div>
              <Link to="/vendor">
                <Button variant="ghost">← Back</Button>
              </Link>
            </div>

            {/* Success / Error Alerts */}
            {successMsg && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm font-semibold text-green-700 border border-green-200">
                {successMsg}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">

              {/* Left Column */}
              <div className="md:col-span-2 space-y-6">

                {/* Job Details */}
                <Card header="Job Details">
                  <dl className="space-y-3 text-sm p-2">
                    <div className="flex justify-between">
                      <dt className="font-medium text-slate-500">Customer</dt>
                      <dd className="text-slate-900 font-semibold">{job.customerId?.name || 'Unknown'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-slate-500">Service</dt>
                      <dd className="text-slate-900">{job.selectedService || job.serviceId?.name || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-slate-500">Starting Price</dt>
                      <dd className="text-sky-700 font-bold">
                        {job.serviceStartingPrice !== undefined
                          ? `PKR ${job.serviceStartingPrice.toLocaleString()}`
                          : job.serviceId?.basePrice
                          ? `PKR ${job.serviceId.basePrice.toLocaleString()}`
                          : 'N/A'}
                      </dd>
                    </div>
                    {job.escrowAmount > 0 && (
                      <div className="flex justify-between">
                        <dt className="font-medium text-slate-500">Escrow Amount</dt>
                        <dd className="text-emerald-700 font-bold">PKR {job.escrowAmount.toLocaleString()}</dd>
                      </div>
                    )}
                    {job.location?.address && (
                      <div className="flex justify-between">
                        <dt className="font-medium text-slate-500">Location</dt>
                        <dd className="text-slate-900">{job.location.address}, {job.location.city}</dd>
                      </div>
                    )}
                    {job.description && (
                      <div>
                        <dt className="font-medium text-slate-500 mb-1">Description</dt>
                        <dd className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-line">
                          {job.description}
                        </dd>
                      </div>
                    )}
                    {job.revisionNotes && (
                      <div>
                        <dt className="font-medium text-yellow-600 mb-1">⚠️ Revision Notes from Customer</dt>
                        <dd className="text-slate-700 bg-yellow-50 p-2 rounded border border-yellow-200 whitespace-pre-line">
                          {job.revisionNotes}
                        </dd>
                      </div>
                    )}
                  </dl>
                </Card>

                {/* Customer Attachments */}
                {job.attachments?.length > 0 && (
                  <Card header="Customer Uploaded Photos">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
                      {job.attachments.map((url, idx) => (
                        <a href={url} target="_blank" rel="noreferrer" key={idx}
                          className="block rounded border border-slate-200 overflow-hidden aspect-video bg-slate-100">
                          <img src={url} alt={`attachment-${idx}`} className="w-full h-full object-cover hover:scale-105 transition-all" />
                        </a>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Proof of Work Upload */}
                {canSubmitProof && (
                  <Card header={job.status === STATUS.REVISION_REQUESTED ? '🔄 Resubmit Proof of Work' : '📸 Submit Proof of Work'}>
                    {job.status === STATUS.REVISION_REQUESTED && (
                      <div className="mb-4 mx-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                        <strong>Revision requested.</strong> Please fix the issues noted above and resubmit proof.
                      </div>
                    )}
                    <div className="p-2 space-y-3">
                      <p className="text-sm text-slate-500">
                        Upload a clear photo or screenshot as evidence of completed work.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofChange}
                        className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-50"
                      />
                      {proofPreview && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Preview:</p>
                          <img
                            src={proofPreview}
                            alt="Proof preview"
                            className="h-48 w-full rounded-lg border border-slate-200 object-cover"
                          />
                        </div>
                      )}
                      <Button
                        onClick={handleSubmitProof}
                        disabled={!proofPreview || submitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        {submitting ? 'Submitting…' : 'Submit Proof'}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Awaiting Approval notice */}
                {isWaiting && (
                  <Card>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                      <p className="text-2xl mb-2">⏳</p>
                      <p className="font-bold text-orange-800">Proof Submitted</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Your proof is under review by the customer. You'll be notified once they respond.
                      </p>
                    </div>
                  </Card>
                )}

                {/* Payment Pending notice */}
                {isPaymentDue && (
                  <Card>
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                      <p className="text-2xl mb-2">💳</p>
                      <p className="font-bold text-emerald-800">Work Approved!</p>
                      <p className="text-sm text-emerald-700 mt-1">
                        The customer has approved your work. Payment will be made shortly.
                      </p>
                    </div>
                  </Card>
                )}

                {/* Awaiting Release notice */}
                {job.status === 'COMPLETED_PENDING_RELEASE' && (
                  <Card>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                      <p className="text-2xl mb-2">⏳</p>
                      <p className="font-bold text-amber-800">Payment Awaiting Release</p>
                      <div className="text-sm text-amber-700 mt-2 space-y-1 text-left inline-block">
                        <p>✔ Payment Received</p>
                        <p>✔ Funds Held in Escrow</p>
                        <p>✔ Awaiting Admin Release</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Disputed */}
                {isDisputed && (
                  <Card>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                      <p className="text-2xl mb-2">⚠️</p>
                      <p className="font-bold text-red-800">Dispute Raised</p>
                      <p className="text-sm text-red-700 mt-1">
                        The customer has raised a dispute. Admin has been notified for arbitration.
                      </p>
                    </div>
                  </Card>
                )}

                {/* Completed */}
                {isCompleted && (
                  <Card>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-2xl mb-2">🎉</p>
                      <p className="font-bold text-green-800">Job Completed!</p>
                      <div className="text-sm text-green-700 mt-2 space-y-1 text-left inline-block">
                        <p>✔ Payment Received</p>
                        <p>✔ Funds Added To Wallet</p>
                      </div>
                    </div>
                  </Card>
                )}

              </div>

              {/* Right Column — Status + Actions */}
              <div className="space-y-6">

                <Card header="Current Status">
                  <div className="p-2">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold ${STATUS_BADGE[job.status] || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABEL[job.status] || job.status}
                    </span>
                  </div>
                </Card>

                <Card header="Actions">
                  <div className="p-2 space-y-2">
                    {/* VENDOR_ASSIGNED → Start Work */}
                    {canStartWork && (
                      <Button
                        onClick={handleStartWork}
                        disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {submitting ? 'Starting…' : '▶ Start Work'}
                      </Button>
                    )}

                    <Link to="/vendor/jobs" className="block">
                      <Button variant="secondary" className="w-full">View All Jobs</Button>
                    </Link>
                    <Link to="/vendor" className="block">
                      <Button variant="ghost" className="w-full">Dashboard</Button>
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
