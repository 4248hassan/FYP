import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'

const STATUS_BADGE = {
  held:     'bg-amber-100 text-amber-800 border border-amber-200',
  released: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  refunded: 'bg-slate-100 text-slate-700 border border-slate-200',
}

const BOOKING_BADGE = {
  PAYMENT_PENDING: 'bg-orange-100 text-orange-800 border border-orange-200',
  COMPLETED_PENDING_RELEASE: 'bg-amber-100 text-amber-800 border border-amber-200',
  COMPLETED:       'bg-green-100 text-green-800 border border-green-200',
  CANCELLED:       'bg-red-100 text-red-700 border border-red-200',
}

export default function EscrowManagement() {
  const [escrows, setEscrows]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [filter, setFilter]         = useState('all')
  const [actionId, setActionId]     = useState(null)
  const [actionMsg, setActionMsg]   = useState('')
  const [actionError, setActionError] = useState('')
  const [showRefundModal, setShowRefundModal] = useState(null) // escrow object
  const [refundReason, setRefundReason]       = useState('')
  const [proofModal, setProofModal] = useState(null) // { urls[], notes, vendorName }
  const [showReleaseModal, setShowReleaseModal] = useState(null) // escrow object

  const fetchEscrows = async (statusFilter) => {
    setLoading(true)
    setError(null)
    try {
      let params = ''
      if (statusFilter === 'IN_ESCROW') {
        params = '?status=held'
      } else if (statusFilter && statusFilter !== 'all') {
        params = `?status=${statusFilter}`
      }
      const res = await api.get(`/admin/escrows${params}`)
      setEscrows(res.data.escrows || [])
    } catch {
      setError('Failed to load escrow payments.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewProof = async (bookingId) => {
    try {
      const res = await api.get(`/vendor/jobs/${bookingId}/proof`)
      const p = res.data.proof
      setProofModal({
        urls: p.mediaUrls || [],
        notes: p.description || 'No notes provided by vendor.',
        vendorName: p.vendorId?.name || 'Vendor'
      })
    } catch {
      alert('No proof uploaded yet or failed to fetch proof.')
    }
  }

  useEffect(() => { fetchEscrows(filter) }, [filter])

  const handleReleaseSubmit = async () => {
    if (!showReleaseModal) return
    setActionId(showReleaseModal._id)
    setActionMsg('')
    setActionError('')
    try {
      await api.post(`/admin/escrows/${showReleaseModal._id}/release`)
      setActionMsg(`✅ PKR ${showReleaseModal.amount?.toLocaleString()} released to ${showReleaseModal.vendorId?.name}`)
      setShowReleaseModal(null)
      fetchEscrows(filter)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Release failed.')
    } finally {
      setActionId(null)
    }
  }

  const handleRefundSubmit = async () => {
    if (!showRefundModal) return
    setActionId(showRefundModal._id)
    setActionMsg('')
    setActionError('')
    try {
      await api.post(`/admin/escrows/${showRefundModal._id}/refund`, { reason: refundReason })
      setActionMsg(`↩️ PKR ${showRefundModal.amount?.toLocaleString()} refunded to ${showRefundModal.customerId?.name}`)
      setShowRefundModal(null)
      setRefundReason('')
      fetchEscrows(filter)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Refund failed.')
    } finally {
      setActionId(null)
    }
  }

  const stats = {
    held:     escrows.filter(e => e.bookingId?.paymentStatus === 'IN_ESCROW' || e.status === 'held').length,
    released: escrows.filter(e => e.status === 'released').length,
    refunded: escrows.filter(e => e.status === 'refunded').length,
    totalHeld: escrows.filter(e => e.bookingId?.paymentStatus === 'IN_ESCROW' || e.status === 'held').reduce((s, e) => s + (e.amount || 0), 0),
    totalReleased: escrows.filter(e => e.status === 'released').reduce((s, e) => s + (e.amount || 0), 0),
  }

  const FILTERS = ['all', 'IN_ESCROW', 'released', 'refunded']

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">💳 Escrow Management</h1>
                <p className="text-sm text-slate-500 mt-1">Review and release/refund escrow payments</p>
              </div>
              <Link to="/admin"><Button variant="ghost">← Dashboard</Button></Link>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Held',          value: stats.held,          color: 'bg-amber-50 text-amber-700',   sub: `PKR ${stats.totalHeld.toLocaleString()}` },
                { label: 'Released',      value: stats.released,      color: 'bg-emerald-50 text-emerald-700', sub: `PKR ${stats.totalReleased.toLocaleString()}` },
                { label: 'Refunded',      value: stats.refunded,      color: 'bg-slate-50 text-slate-700',   sub: 'to customers' },
                { label: 'Total Records', value: escrows.length,      color: 'bg-indigo-50 text-indigo-700', sub: 'all time' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-current/10`}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs font-semibold mt-0.5 opacity-80">{s.label}</p>
                  <p className="text-xs opacity-60 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {actionMsg && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm font-semibold text-green-800">
                {actionMsg}
              </div>
            )}
            {actionError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {actionError}
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                    filter === f
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'IN_ESCROW' ? 'In Escrow' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Escrow List */}
            {loading ? (
              <Loader label="Loading escrows..." />
            ) : error ? (
              <Card><p className="text-sm text-red-600 p-4">{error}</p></Card>
            ) : escrows.length === 0 ? (
              <Card>
                <div className="py-16 text-center text-slate-400">
                  <div className="text-5xl mb-3">🔐</div>
                  <p className="text-sm">No escrow payments found.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {escrows
                  .filter(escrow => {
                    if (filter === 'IN_ESCROW') {
                      return escrow.bookingId?.paymentStatus === 'IN_ESCROW' || escrow.status === 'held';
                    }
                    return true;
                  })
                  .map(escrow => {
                    const booking = escrow.bookingId
                    const canRelease = booking?.paymentStatus === 'IN_ESCROW' && (booking?.status?.toUpperCase() === 'COMPLETED' || booking?.status?.toUpperCase() === 'COMPLETED_PENDING_RELEASE') && escrow.status === 'held'
                    const canRefund  = escrow.status === 'held'
                    const isActing   = actionId === escrow._id

                    const isPaid = escrow.status === 'released' || booking?.paymentStatus === 'PAID'

                    return (
                      <Card key={escrow._id} className="overflow-hidden">
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-white">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold capitalize border ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {isPaid ? '🟢 PAID' : '🟡 UNPAID'}
                            </span>
                            {booking?.status && (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${BOOKING_BADGE[booking.status] || 'bg-slate-100 text-slate-600'}`}>
                                Booking Status: {booking.status?.replace(/_/g, ' ')}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-slate-900">
                              PKR {escrow.amount?.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Payment Date: {new Date(escrow.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Card Body */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 px-5 py-4">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Booking ID</p>
                            <p className="font-mono text-xs bg-slate-100 px-2 py-1 rounded select-all inline-block">
                              {booking?._id || escrow.bookingId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Customer Name</p>
                            <p className="font-semibold text-slate-900">{escrow.customerId?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{escrow.customerId?.email}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Vendor Name</p>
                            <p className="font-semibold text-slate-900">{escrow.vendorId?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{escrow.vendorId?.email}</p>
                            <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                              Wallet: PKR {(escrow.vendorId?.walletBalance || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Service Name</p>
                            <p className="font-semibold text-slate-900">
                              {booking?.selectedService || 'Service'}
                            </p>
                            {booking?._id && (
                              <button
                                onClick={() => handleViewProof(booking._id)}
                                className="mt-2 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 border border-sky-200 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                              >
                                📸 View Work Proof
                              </button>
                            )}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Financial Breakdown</p>
                            <div className="space-y-0.5 text-xs bg-slate-50 p-2 rounded border border-slate-150">
                              <p className="flex justify-between text-slate-500"><span>Booking Amount:</span> <span className="font-semibold text-slate-700">PKR {escrow.amount?.toLocaleString()}</span></p>
                              <p className="flex justify-between text-amber-600 font-semibold"><span>Commission (5%):</span> <span>PKR {(escrow.amount * 0.05).toLocaleString()}</span></p>
                              <p className="flex justify-between text-emerald-600 font-semibold border-t border-slate-200 pt-1 mt-1"><span>Vendor Payout (95%):</span> <span>PKR {(escrow.amount * 0.95).toLocaleString()}</span></p>
                            </div>
                          </div>
                        </div>

                        {/* Current Status Row */}
                        <div className="px-5 py-2 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center text-xs">
                          <span className="text-slate-500">Current Status:</span>
                          <span className={`px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-250'
                              : 'bg-amber-100 text-amber-800 border border-amber-250'
                          }`}>
                            {isPaid ? 'PAID' : 'UNPAID'}
                          </span>
                        </div>

                        {/* Action Row */}
                        {(canRelease || canRefund) && (
                          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3 items-center">
                            {canRefund && (
                              <Button
                                onClick={() => { setShowRefundModal(escrow); setRefundReason('') }}
                                disabled={isActing}
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
                              >
                                Refund to Customer
                              </Button>
                            )}
                            {canRelease && (
                              <Button
                                onClick={() => setShowReleaseModal(escrow)}
                                disabled={isActing}
                                className="bg-green-600 hover:bg-green-700 text-white border-transparent text-sm"
                              >
                                Release Payment to Vendor
                              </Button>
                            )}
                          </div>
                        )}
                        {escrow.status === 'released' && (
                          <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-100 text-xs text-emerald-700 font-semibold space-y-1">
                            <p className="font-bold">✅ Payment released — vendor wallet credited PKR {(escrow.amount * 0.95).toLocaleString()}</p>
                            <div className="pl-4 space-y-0.5 mt-1 font-medium">
                              <p>✔ Commission Earned (5%: PKR {(escrow.amount * 0.05).toLocaleString()})</p>
                              <p>✔ Transaction Completed</p>
                            </div>
                          </div>
                        )}
                        {escrow.status === 'refunded' && (
                          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                            ↩️ Refunded to customer
                            {escrow.history?.find(h => h.action === 'refunded')?.notes && (
                              <span className="ml-2 text-slate-400">— "{escrow.history.find(h => h.action === 'refunded').notes}"</span>
                            )}
                          </div>
                        )}
                      </Card>
                    )
                  })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">↩️</span>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Refund to Customer</h3>
                <p className="text-sm text-slate-500">
                  PKR {showRefundModal.amount?.toLocaleString()} → {showRefundModal.customerId?.name}
                </p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700 mb-4">
              ⚠️ This will cancel the booking and refund the customer. This action cannot be undone.
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reason for refund</label>
              <textarea
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                placeholder="e.g. Vendor did not show up, dispute resolved in customer's favor..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-red-400 focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefundSubmit}
                disabled={!refundReason.trim() || actionId === showRefundModal._id}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent"
              >
                {actionId === showRefundModal._id ? 'Refunding...' : 'Confirm Refund'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setShowRefundModal(null); setRefundReason('') }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Release Confirmation Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏦</span>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Release Escrow Payment</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Booking ID: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-600">{showReleaseModal.bookingId?._id || showReleaseModal.bookingId}</span>
                </p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to release this payment to the vendor?
            </p>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1.5 text-xs text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Booking Amount:</span>
                <span className="font-bold text-slate-800">PKR {showReleaseModal.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-indigo-600">
                <span>Commission (5%):</span>
                <span className="font-bold">PKR {(showReleaseModal.amount * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold border-t border-slate-200 pt-1.5 mt-1.5">
                <span>Vendor Receives:</span>
                <span className="font-bold text-sm">PKR {(showReleaseModal.amount * 0.95).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleReleaseSubmit}
                disabled={actionId === showReleaseModal._id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white border-transparent text-sm"
              >
                {actionId === showReleaseModal._id ? 'Releasing...' : 'Release Payment'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowReleaseModal(null)}
                className="text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Viewer Modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setProofModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-slate-100 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">📸 Work Proof by {proofModal.vendorName}</h3>
              <button onClick={() => setProofModal(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>
            
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Completion Notes</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 italic">
                "{proofModal.notes}"
              </p>
            </div>

            {proofModal.urls.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Attached Images ({proofModal.urls.length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {proofModal.urls.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="block border border-slate-200 rounded overflow-hidden aspect-video bg-slate-100">
                      <img src={url} alt={`proof-img-${idx}`} className="w-full h-full object-cover hover:scale-105 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No proof images attached.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
