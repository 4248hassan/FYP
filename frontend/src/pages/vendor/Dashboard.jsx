import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import VendorLayout from '../../components/vendor/VendorLayout'
import api from '../../services/api'
import { STATUS, STATUS_LABEL, STATUS_BADGE } from '../../constants/status'

// Statuses that belong to "active assigned jobs" for this vendor
const ACTIVE_JOB_STATUSES = [
  STATUS.VENDOR_ASSIGNED,
  STATUS.WORK_IN_PROGRESS,
  STATUS.AWAITING_APPROVAL,
  STATUS.PAYMENT_PENDING,
  STATUS.REVISION_REQUESTED,
  STATUS.DISPUTED,
]

export default function VendorDashboard() {
  const [pendingRequests, setPendingRequests] = useState([])
  const [assignedJobs, setAssignedJobs]       = useState([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState('')
  const [actionLoading, setActionLoading]     = useState(null) // bookingId being acted on

  // ─── Load Data ───────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const [requestsRes, jobsRes] = await Promise.all([
        api.get('/vendor/requests'),
        api.get('/vendor/jobs'),
      ])
      setPendingRequests(requestsRes.data.bookings || [])
      const active = (jobsRes.data.bookings || []).filter(
        (b) => ACTIVE_JOB_STATUSES.includes(b.status)
      )
      setAssignedJobs(active)
    } catch (err) {
      console.error('Error fetching vendor data:', err)
      setError('Failed to load dashboard data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ─── Accept Request ────────────────────────────────────────────────────
  const handleAccept = async (id) => {
    setActionLoading(id)
    try {
      await api.post(`/vendor/requests/${id}/respond`, { action: 'accept' })
      setPendingRequests((prev) => prev.filter((r) => r._id !== id))
      // Refresh active jobs to show newly accepted booking
      const jobsRes = await api.get('/vendor/jobs')
      const active = (jobsRes.data.bookings || []).filter(
        (b) => ACTIVE_JOB_STATUSES.includes(b.status)
      )
      setAssignedJobs(active)
    } catch (err) {
      console.error('Error accepting request:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Reject Request ────────────────────────────────────────────────────
  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      await api.post(`/vendor/requests/${id}/respond`, { action: 'reject' })
      setPendingRequests((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      console.error('Error rejecting request:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Start Work (VENDOR_ASSIGNED → WORK_IN_PROGRESS) ──────────────────
  const handleStartWork = async (id) => {
    setActionLoading(id)
    try {
      await api.post(`/vendor/work/${id}/status`, { status: STATUS.WORK_IN_PROGRESS })
      setAssignedJobs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: STATUS.WORK_IN_PROGRESS } : b))
      )
    } catch (err) {
      console.error('Error starting work:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Submit Proof (WORK_IN_PROGRESS → AWAITING_APPROVAL) ──────────────
  const handleSubmitProof = async (id) => {
    setActionLoading(id)
    try {
      await api.post(`/vendor/work/${id}/status`, { status: STATUS.AWAITING_APPROVAL })
      setAssignedJobs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: STATUS.AWAITING_APPROVAL } : b))
      )
    } catch (err) {
      console.error('Error submitting proof:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading dashboard…</p>
          </div>
        </div>
      </VendorLayout>
    )
  }

  if (error) {
    return (
      <VendorLayout>
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700 border border-red-200">
          {error}
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <div className="space-y-8">

        {/* ── Stats Strip ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Open Requests',  value: pendingRequests.length, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Active Jobs',    value: assignedJobs.filter(b => b.status === STATUS.WORK_IN_PROGRESS).length, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Awaiting Review', value: assignedJobs.filter(b => b.status === STATUS.AWAITING_APPROVAL).length, color: 'text-orange-600 bg-orange-50' },
            { label: 'Payment Pending', value: assignedJobs.filter(b => b.status === STATUS.PAYMENT_PENDING).length, color: 'text-emerald-600 bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-current/10`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Pending Requests ─────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Open Requests</h2>
            <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2.5 py-1 rounded-full">
              {pendingRequests.length} pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="text-3xl mb-2">📋</div>
              No open requests available right now
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {pendingRequests.map((req) => (
                <div key={req._id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {req.serviceId?.name || req.selectedService || 'Service Request'}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Customer: <span className="font-medium text-slate-700">{req.customerId?.name || 'Unknown'}</span>
                    </p>
                    {req.location?.city && (
                      <p className="text-xs text-slate-400 mt-0.5">📍 {req.location.city}</p>
                    )}
                    {req.optionalBudget && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        Budget: PKR {req.optionalBudget.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => handleAccept(req._id)}
                      disabled={actionLoading === req._id}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4"
                    >
                      {actionLoading === req._id ? '…' : '✓ Accept'}
                    </Button>
                    <Button
                      onClick={() => handleReject(req._id)}
                      disabled={actionLoading === req._id}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 text-sm px-4"
                    >
                      ✕ Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Assigned Jobs ────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">My Active Jobs</h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-1 rounded-full">
              {assignedJobs.length} job{assignedJobs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {assignedJobs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="text-3xl mb-2">🛠️</div>
              No active jobs — accept a request to get started
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {assignedJobs.map((job) => (
                <div key={job._id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {job.serviceId?.name || job.selectedService || 'Job'}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Customer: <span className="font-medium text-slate-700">{job.customerId?.name || 'Unknown'}</span>
                    </p>
                    <div className="mt-1.5">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[job.status] || 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABEL[job.status] || job.status}
                      </span>
                    </div>
                    {job.escrowAmount > 0 && (
                      <p className="text-xs text-sky-600 font-medium mt-1">
                        💰 Escrow: PKR {job.escrowAmount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    {/* VENDOR_ASSIGNED → Start Work */}
                    {job.status === STATUS.VENDOR_ASSIGNED && (
                      <Button
                        onClick={() => handleStartWork(job._id)}
                        disabled={actionLoading === job._id}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        {actionLoading === job._id ? 'Starting…' : '▶ Start Work'}
                      </Button>
                    )}

                    {/* WORK_IN_PROGRESS → Submit Proof */}
                    {job.status === STATUS.WORK_IN_PROGRESS && (
                      <Link to={`/vendor/jobs/${job._id}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
                          📸 Submit Proof
                        </Button>
                      </Link>
                    )}

                    {/* REVISION_REQUESTED → Re-submit */}
                    {job.status === STATUS.REVISION_REQUESTED && (
                      <Link to={`/vendor/jobs/${job._id}`}>
                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm">
                          🔄 Resubmit Proof
                        </Button>
                      </Link>
                    )}

                    {/* AWAITING_APPROVAL → waiting */}
                    {job.status === STATUS.AWAITING_APPROVAL && (
                      <span className="inline-flex items-center text-xs text-orange-600 font-semibold bg-orange-50 px-3 py-1.5 rounded border border-orange-200">
                        ⏳ Awaiting Customer Review
                      </span>
                    )}

                    {/* PAYMENT_PENDING */}
                    {job.status === STATUS.PAYMENT_PENDING && (
                      <span className="inline-flex items-center text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                        💳 Awaiting Payment Release
                      </span>
                    )}

                    {/* View Details (always available) */}
                    <Link to={`/vendor/jobs/${job._id}`}>
                      <Button variant="ghost" className="text-sm text-slate-600">
                        View →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </VendorLayout>
  )
}
