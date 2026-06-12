import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { formatDateDDMMYYYY, formatDateTime } from '../../utils'
import api from '../../services/api'
import Avatar from '../../components/ui/Avatar'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Loader from '../../components/ui/Loader'
import Input from '../../components/ui/Input'
import { STATUS, STATUS_LABEL, STATUS_BADGE, WORKFLOW_STEPS, WORKFLOW_STEP_INDEX } from '../../constants/status'

export default function CustomerBookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [offers, setOffers] = useState([])
  const [proof, setProof] = useState(null)
  const [chats, setChats] = useState([])
  const [chatMessage, setChatMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form states
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState('')
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [submittingResponse, setSubmittingResponse] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')
  
  // Payment modal state
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  // Work done state
  const [showWorkDoneModal, setShowWorkDoneModal] = useState(false)

  // Proof lightbox
  const [lightbox, setLightbox] = useState({ open: false, urls: [], idx: 0 })

  const chatEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Fetch Booking Details & Conditional Data
  const fetchData = async () => {
    try {
      setError(null)
      const res = await api.get(`/bookings/${id}`)
      const bk = res.data.booking
      setBooking(bk)

      // 1. Fetch offers if open
      const openStatuses = [STATUS.BOOKING_CREATED, STATUS.OFFER_RECEIVED]
      if (openStatuses.includes(bk.status)) {
        const offersRes = await api.get(`/offers/booking/${id}`)
        setOffers(offersRes.data.offers || [])
      }

      // 2. Fetch proof of work if awaiting approval / revision / disputed / completed
      const proofStatuses = [STATUS.AWAITING_APPROVAL, STATUS.REVISION_REQUESTED, STATUS.DISPUTED, STATUS.PAYMENT_PENDING, STATUS.COMPLETED]
      if (proofStatuses.includes(bk.status)) {
        try {
          const proofRes = await api.get(`/vendor/jobs/${id}/proof`)
          setProof(proofRes.data.proof)
        } catch (err) {
          console.debug('No proof found yet:', err)
        }
      }

      // 3. Fetch chat history if vendor assigned
      if (bk.vendorId) {
        const conversationId = [bk.customerId._id, bk.vendorId._id].sort().join('-')
        try {
          const chatRes = await api.get(`/chat/conversation/${conversationId}`)
          setChats(chatRes.data.chats || [])
        } catch (err) {
          console.error('Failed to load chat history:', err)
        }
      }
    } catch (err) {
      console.error('Fetch booking details error:', err)
      setError('Failed to load booking details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Scroll window to top on mount
    window.scrollTo(0, 0)
  }, [id])

  // Scroll chat container log to bottom without scrolling window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chats])

  // Chat Polling
  useEffect(() => {
    if (!booking?.vendorId) return
    const interval = setInterval(async () => {
      const conversationId = [booking.customerId._id, booking.vendorId._id].sort().join('-')
      try {
        const chatRes = await api.get(`/chat/conversation/${conversationId}`)
        setChats(chatRes.data.chats || [])
      } catch (err) {
        console.debug('Failed to sync chats:', err)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [booking])

  const handleSelectVendor = async (offerId) => {
    setLoading(true)
    try {
      await api.post(`/offers/${offerId}/accept`)
      setActionSuccess('Vendor selected successfully!')
      setTimeout(() => {
        setActionSuccess('')
        fetchData()
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign vendor.')
      setLoading(false)
    }
  }

  const handleEscrowPayment = async (e) => {
    e.preventDefault()
    setIsPaying(true)
    setError(null)
    try {
      await api.post('/escrow', {
        bookingId: booking._id,
        amount: booking.escrowAmount,
        paymentMethod,
        transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      })
      setActionSuccess('Payment secured in Escrow! Vendor notified.');
      setTimeout(() => {
        setActionSuccess('')
        fetchData()
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.')
    } finally {
      setIsPaying(false)
    }
  }

  const handleSendChatMessage = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) return
    try {
      const res = await api.post('/chat/send', {
        receiverId: booking.vendorId._id,
        message: chatMessage,
        relatedBookingId: booking._id,
      })
      setChats((prev) => [...prev, res.data.chat])
      setChatMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleCustomerDecision = async (action) => {
    setSubmittingResponse(true)
    setError(null)
    try {
      await api.post(`/bookings/${booking._id}/respond`, {
        action,
        revisionNotes: action !== 'approve' ? revisionNotes : undefined,
      })
      const successMessages = {
        approve: '✅ Work approved! Payment will be released to the vendor.',
        revision: '🔄 Revision requested. Vendor has been notified.',
        dispute: '⚠️ Dispute raised. Admin has been notified for arbitration.',
      }
      setActionSuccess(successMessages[action] || 'Response submitted!')
      setShowRevisionForm(false)
      setShowDisputeForm(false)
      setRevisionNotes('')
      setTimeout(() => {
        setActionSuccess('')
        fetchData()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit response.')
    } finally {
      setSubmittingResponse(false)
    }
  }

  const handleConfirmWorkDone = async () => {
    setShowWorkDoneModal(false)
    await handleCustomerDecision('approve')
  }

  const handleFinalPayment = async (e) => {
    e.preventDefault()
    setIsSubmittingPayment(true)
    setError(null)
    try {
      // POST /bookings/:id/pay → secures payment in admin escrow and marks booking COMPLETED
      await api.post(`/bookings/${booking._id}/pay`, {
        paymentMethod,
        cardNumber,
        cardExpiry,
        cardCvv,
      })
      setActionSuccess('🎉 Payment successful! Funds secured in Escrow.')
      setShowPaymentForm(false)
      setTimeout(() => {
        setActionSuccess('')
        fetchData()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.')
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const getStatusStep = () => {
    if (!booking?.status) return -1
    if (booking.status === STATUS.REVISION_REQUESTED) return WORKFLOW_STEP_INDEX[STATUS.WORK_IN_PROGRESS] ?? 3
    if (booking.status === STATUS.DISPUTED) return WORKFLOW_STEP_INDEX[STATUS.AWAITING_APPROVAL] ?? 4
    if (booking.status === STATUS.CANCELLED) return -1
    return WORKFLOW_STEP_INDEX[booking.status] ?? -1
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Loader label="Loading booking details..." />
          </main>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card header="Error">
              <p className="text-sm text-red-600">{error}</p>
              <Link to="/customer/bookings" className="mt-4 inline-block">
                <Button>Back to Bookings</Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-4 sm:gap-6 px-4 py-4 sm:py-6 lg:px-0">
        <Sidebar />
        <main className="flex-1 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{booking.selectedService || booking.serviceId?.name || 'Booking details'}</h1>
              <p className="text-sm text-slate-600">ID: {booking._id}</p>
            </div>
            <Link to="/customer/bookings">
              <Button variant="ghost">Back to List</Button>
            </Link>
          </div>

          {/* Action Success Alerts */}
          {actionSuccess && (
            <div className="rounded-lg bg-green-50 p-4 text-sm font-semibold text-green-700 shadow-sm border border-green-200">
              {actionSuccess}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Progress Timeline */}
          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Workflow Progress</h3>
            {booking.status === STATUS.CANCELLED && (
              <div className="py-3 px-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-semibold">
                ❌ This booking has been cancelled.
              </div>
            )}
            {booking.status !== STATUS.CANCELLED && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {WORKFLOW_STEPS.map((step, idx) => (
                  <div key={step.status} className="flex items-center w-full md:w-auto flex-1">
                    <div className="flex flex-col items-center mx-auto">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                        getStatusStep() >= idx ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {getStatusStep() > idx ? '✓' : idx + 1}
                      </div>
                      <span className="text-xs text-slate-600 mt-2 text-center whitespace-nowrap">{step.label}</span>
                    </div>
                    {idx < WORKFLOW_STEPS.length - 1 && (
                      <div className={`hidden md:block h-0.5 flex-1 mx-2 ${getStatusStep() > idx ? 'bg-sky-600' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Special status indicators below timeline */}
            {booking.status === STATUS.REVISION_REQUESTED && (
              <div className="mt-3 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 font-semibold">
                🔄 Revision requested — vendor is reworking
              </div>
            )}
            {booking.status === STATUS.DISPUTED && (
              <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-semibold">
                ⚠️ Dispute raised — admin is reviewing
              </div>
            )}
          </Card>

          {/* Details & Info */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              
              {/* Core Booking Details */}
              <Card header="Booking Details">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 p-4 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-500">Service Name</dt>
                    <dd className="mt-1 text-slate-900 font-semibold">{booking.selectedService || booking.serviceId?.name || 'Predefined Service'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Starting Price</dt>
                    <dd className="mt-1 text-slate-900 font-semibold text-sky-700">
                      {booking.serviceStartingPrice !== undefined ? `PKR ${booking.serviceStartingPrice.toLocaleString()}` : (booking.serviceId?.basePrice ? `PKR ${booking.serviceId.basePrice.toLocaleString()}` : 'N/A')}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Scheduled Date & Time</dt>
                    <dd className="mt-1 text-slate-900">
                      {booking.bookingDate ? formatDateDDMMYYYY(booking.bookingDate) : 'N/A'} • {booking.timeSlot || 'Any slot'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Location Address</dt>
                    <dd className="mt-1 text-slate-900">
                      {booking.location?.address}, {booking.location?.city}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Estimated Budget</dt>
                    <dd className="mt-1 text-slate-900 font-medium text-emerald-700">
                      {booking.optionalBudget ? `PKR ${booking.optionalBudget.toLocaleString()}` : 'Not Specified'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-semibold text-slate-500">Problem Description</dt>
                    <dd className="mt-1 text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">
                      {booking.description || 'No description provided.'}
                    </dd>
                  </div>
                  {booking.attachments?.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="font-semibold text-slate-500 mb-2">Customer Uploaded Photos</dt>
                      <dd className="grid grid-cols-3 gap-2">
                        {booking.attachments.map((url, idx) => (
                          <a href={url} target="_blank" rel="noreferrer" key={idx} className="block border border-slate-200 rounded overflow-hidden aspect-video bg-slate-100">
                            <img src={url} alt={`customer-upload-${idx}`} className="w-full h-full object-cover hover:scale-105 transition-all" />
                          </a>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>

              {/* Offer Selection Panel */}
              {(booking.status === STATUS.BOOKING_CREATED || booking.status === STATUS.OFFER_RECEIVED) && (
                <Card header={`Received Offers (${offers.length})`}>
                  {offers.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-sm">
                      Awaiting offers from verified vendors. You'll receive real-time updates.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {offers.map((offer) => (
                        <div key={offer._id} className="p-4 flex flex-col sm:flex-row gap-4 items-start justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex gap-3 items-start">
                            <Avatar
                              src={offer.vendorId?.profileImage}
                              name={offer.vendorId?.name}
                              sizeClassName="w-12 h-12 text-sm"
                              className="border border-slate-200"
                            />
                            <div>
                              <h4 className="font-bold text-slate-900">{offer.vendorId?.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                <span className="text-yellow-500 font-semibold">★ {offer.vendorId?.rating || '5.0'}</span>
                                <span>•</span>
                                <span>{offer.vendorId?.completedJobs || '0'} completed jobs</span>
                              </div>
                              <p className="mt-2 text-sm text-slate-700 bg-white p-2 rounded border border-slate-100 italic">
                                "{offer.message || 'I would like to help with this service request.'}"
                              </p>
                            </div>
                          </div>
                          
                          <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-4">
                            <div>
                              <p className="text-xl font-bold text-sky-700">PKR {offer.estimatedCost?.toLocaleString()}</p>
                              <p className="text-xs text-slate-500">Completion: {offer.estimatedTime || 'N/A'}</p>
                            </div>
                            <Button onClick={() => handleSelectVendor(offer._id)} size="sm">
                              Select Vendor
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Proof of Work Review */}
              {booking.status === STATUS.AWAITING_APPROVAL && proof && (
                <Card header="📸 Review Proof of Work">
                  <div className="p-4 space-y-4 text-sm">
                    <div className="bg-sky-50 p-4 rounded-lg border border-sky-100 text-sky-900">
                      <p className="font-bold text-base">Vendor has completed the job!</p>
                      <p className="mt-1">Review the proof below and make a decision. Click any image to view full size.</p>
                    </div>

                    {proof.vendorId && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-semibold">Vendor:</span> {proof.vendorId?.name || booking.vendorId?.name}
                        {proof.createdAt && (
                          <span className="text-slate-400">• Submitted {new Date(proof.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-slate-700">Completion Notes:</h4>
                      <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                        {proof.description || 'No notes provided by vendor.'}
                      </p>
                    </div>

                    {proof.mediaUrls?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-700 mb-2">Proof Images ({proof.mediaUrls.length}):</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {proof.mediaUrls.map((url, idx) => (
                            <button
                              key={idx}
                              onClick={() => setLightbox({ open: true, urls: proof.mediaUrls, idx })}
                              className="block rounded-lg border-2 border-slate-200 overflow-hidden aspect-video bg-slate-100 hover:border-sky-400 hover:scale-105 transition-all group relative"
                            >
                              <img src={url} alt={`proof-${idx}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold transition-opacity">🔍 View</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!showRevisionForm && !showDisputeForm ? (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                        <Button onClick={() => handleCustomerDecision('approve')} className="bg-green-600 hover:bg-green-700 flex-1">
                          ✅ Approve Work
                        </Button>
                        <Button onClick={() => setShowRevisionForm(true)} variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 flex-1">
                          Request Revision
                        </Button>
                        <Button onClick={() => setShowDisputeForm(true)} variant="outline" className="border-red-400 text-red-700 hover:bg-red-50 flex-1">
                          Raise Dispute
                        </Button>
                      </div>
                    ) : showRevisionForm ? (
                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <h4 className="font-bold text-slate-700">Revision Notes</h4>
                        <textarea
                          rows={3}
                          value={revisionNotes}
                          onChange={(e) => setRevisionNotes(e.target.value)}
                          placeholder="Describe what needs to be fixed..."
                          className="block w-full rounded border border-slate-300 p-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleCustomerDecision('revision')} disabled={submittingResponse || !revisionNotes.trim()} className="bg-yellow-600 hover:bg-yellow-700 flex-1">
                            {submittingResponse ? 'Submitting...' : 'Submit Revision Request'}
                          </Button>
                          <Button onClick={() => setShowRevisionForm(false)} variant="secondary">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <h4 className="font-bold text-slate-700">Describe the Dispute</h4>
                        <textarea
                          rows={3}
                          value={revisionNotes}
                          onChange={(e) => setRevisionNotes(e.target.value)}
                          placeholder="Describe the complaint in detail for Admin arbitration..."
                          className="block w-full rounded border border-slate-300 p-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleCustomerDecision('dispute')} disabled={submittingResponse || !revisionNotes.trim()} className="bg-red-600 hover:bg-red-700 flex-1">
                            {submittingResponse ? 'Submitting...' : 'Submit Dispute'}
                          </Button>
                          <Button onClick={() => setShowDisputeForm(false)} variant="secondary">Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Escrow payment secures */}
              {booking.status === STATUS.VENDOR_ASSIGNED && (
                <Card header="Secure Payment in Escrow">
                  <form onSubmit={handleEscrowPayment} className="p-4 space-y-4 text-sm">
                    <div className="bg-amber-50 text-amber-900 border border-amber-100 rounded-lg p-4">
                      <p className="font-bold">Total Payable: PKR {booking.escrowAmount?.toLocaleString()}</p>
                      <p className="mt-1 text-xs">
                        ResolveIt utilizes a secure escrow model. Your payment is secured by our system and is only released to the vendor once you verify and approve their final proof of work.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { id: 'credit_card', label: 'Credit Card' },
                        { id: 'debit_card', label: 'Debit Card' },
                        { id: 'wallet', label: 'ResolveIt Wallet' },
                      ].map((method) => (
                        <label key={method.id} className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-colors ${
                          paymentMethod === method.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-sky-600"
                          />
                          <span className="font-medium text-slate-900">{method.label}</span>
                        </label>
                      ))}
                    </div>

                    {paymentMethod !== 'wallet' && (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Card Number</label>
                          <Input
                            placeholder="4000 1234 5678 9010"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry / CVV</label>
                          <div className="flex gap-2">
                            <Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} required />
                            <Input placeholder="CVV" value={cardCvv} type="password" maxLength="3" onChange={(e) => setCardCvv(e.target.value)} required />
                          </div>
                        </div>
                      </div>
                    )}

                    <Button type="submit" disabled={isPaying} className="w-full bg-sky-600 hover:bg-sky-700">
                      {isPaying ? 'Securing Funds...' : `Pay PKR ${booking.escrowAmount?.toLocaleString()} to Escrow`}
                    </Button>
                  </form>
                </Card>
              )}

              {/* Chat Widget (Assigned vendors only) */}
              {booking.vendorId && (
                <Card header={`Chat with ${booking.vendorId.name}`}>
                  <div className="flex flex-col h-[400px] border border-slate-100 rounded-b-lg">
                    {/* Log window */}
                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                      {chats.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs py-8">
                          No messages yet. Send a message to start the conversation!
                        </div>
                      ) : (
                        chats.map((c) => {
                          const isMe = String(c.senderId._id || c.senderId) === String(booking.customerId._id)
                          return (
                            <div key={c._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                                isMe ? 'bg-sky-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                              }`}>
                                <p className="font-semibold text-[10px] opacity-75 mb-0.5">{isMe ? 'You' : booking.vendorId.name}</p>
                                <p>{c.message}</p>
                                <span className="block text-right text-[9px] opacity-60 mt-1">
                                  {formatDateTime(c.createdAt)}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat inputs */}
                    <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
                      />
                      <Button type="submit" size="sm" className="bg-sky-600">
                        Send
                      </Button>
                    </form>
                  </div>
                </Card>
              )}

            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              
              {/* Sidebar Booking Status card */}
              <Card header="Status & Billing">
                <dl className="p-4 space-y-4 text-sm">
                  <div>
                    <dt className="text-slate-500 text-xs uppercase font-semibold">Booking Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                        STATUS_BADGE[booking.status] || 'bg-slate-100 text-slate-700'
                      }`}>
                        {STATUS_LABEL[booking.status] || booking.status?.replace(/_/g, ' ')}
                      </span>

                      {/* Status-specific messages */}
                      {booking.status === STATUS.VENDOR_ASSIGNED && (
                        <p className="mt-2 text-xs font-semibold text-blue-600">
                          👍 A vendor has been assigned. Please secure payment to begin work.
                        </p>
                      )}
                      {booking.status === STATUS.WORK_IN_PROGRESS && (
                        <p className="mt-2 text-xs font-semibold text-indigo-600">
                          🛠️ Vendor is working on your request.
                        </p>
                      )}
                      {booking.status === STATUS.AWAITING_APPROVAL && (
                        <p className="mt-2 text-xs font-semibold text-orange-600">
                          📸 Vendor has submitted proof. Please review below.
                        </p>
                      )}
                      {booking.status === STATUS.REVISION_REQUESTED && (
                        <p className="mt-2 text-xs font-semibold text-yellow-600">
                          🔄 Revision requested. Vendor is reworking.
                        </p>
                      )}
                      {booking.status === STATUS.DISPUTED && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          ⚠️ Dispute raised. Admin is reviewing.
                        </p>
                      )}
                      {booking.status === STATUS.PAYMENT_PENDING && (
                        <div className="mt-3">
                          <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                            <p className="text-xs font-semibold text-amber-800">✅ Work approved!</p>
                            <p className="text-xs text-amber-600 mt-1">Please proceed to payment to secure the funds in Admin Escrow.</p>
                          </div>
                        </div>
                      )}
                      {booking.status === 'COMPLETED_PENDING_RELEASE' && (
                        <div className="mt-3">
                          <div className="mb-2 rounded-lg bg-green-50 border border-green-200 p-3">
                            <p className="text-xs font-semibold text-green-800">🎉 Work Approved & Paid!</p>
                            <p className="text-xs text-green-600 mt-1">Funds are secured in Escrow pending admin release.</p>
                          </div>
                        </div>
                      )}
                      {booking.status === STATUS.COMPLETED && (
                        <div className="mt-3">
                          <div className="mb-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                            <p className="text-xs font-semibold text-blue-800">🎉 Service Completed</p>
                            <p className="text-xs text-blue-600 mt-1">Payment successfully released to vendor.</p>
                          </div>
                        </div>
                      )}
                      {booking.status === STATUS.CANCELLED && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          ❌ This booking was cancelled.
                        </p>
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500 text-xs uppercase font-semibold">Escrow Held Amount</dt>
                    <dd className="mt-1 font-bold text-lg text-slate-800">
                      PKR {booking.escrowAmount ? booking.escrowAmount.toLocaleString() : '0'}
                    </dd>
                  </div>

                  {booking.vendorId && (
                    <div className="pt-4 border-t border-slate-100">
                      <dt className="text-slate-500 text-xs uppercase font-semibold mb-2">Assigned Vendor</dt>
                      <dd className="flex items-center gap-3">
                        <Avatar
                          src={booking.vendorId.profileImage}
                          name={booking.vendorId.name}
                          sizeClassName="w-10 h-10 text-xs"
                          className="border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{booking.vendorId.name}</p>
                          <p className="text-xs text-slate-500">{booking.vendorId.phone || 'No phone'}</p>
                        </div>
                      </dd>
                    </div>
                  )}

                  {/* Actions & Status details below Assigned Vendor */}
                  {booking.status === STATUS.AWAITING_APPROVAL && (
                    <div className="pt-4 border-t border-slate-100">
                      <Button
                        onClick={() => setShowWorkDoneModal(true)}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded text-center shadow-sm"
                      >
                        👉 Work Done
                      </Button>
                    </div>
                  )}

                  {booking.status === STATUS.PAYMENT_PENDING && (
                    <div className="pt-4 border-t border-slate-100">
                      <Button
                        onClick={() => setShowPaymentForm(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded text-center shadow-sm animate-pulse"
                      >
                        👉 PAY NOW
                      </Button>
                    </div>
                  )}

                  {booking.status === 'COMPLETED_PENDING_RELEASE' && (
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-800 text-xs font-semibold space-y-1.5 shadow-sm">
                        <p className="flex items-center gap-1.5 text-green-700">✔ Payment Received</p>
                        <p className="flex items-center gap-1.5 text-green-700">✔ Funds Secured in Escrow</p>
                        <p className="flex items-center gap-1.5 text-slate-500 font-medium">✔ Awaiting Admin Release</p>
                      </div>
                    </div>
                  )}

                  {booking.status === STATUS.COMPLETED && (
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-blue-800 text-xs font-semibold space-y-1.5 shadow-sm">
                        <p className="flex items-center gap-1.5 text-blue-700">✔ Service Completed</p>
                        <p className="flex items-center gap-1.5 text-blue-700">✔ Payment Released</p>
                      </div>
                    </div>
                  )}
                </dl>
              </Card>

            </div>
          </div>

        </main>
      {/* Work Done Confirmation Modal */}
      {showWorkDoneModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-100 animate-scale-up">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Work Done</h3>
            <p className="text-sm text-slate-600 mb-6">
              Have you reviewed the work and are you satisfied with the service?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleConfirmWorkDone}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
              >
                Yes, Continue
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowWorkDoneModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Now Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-100 overflow-y-auto max-h-[90vh] animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Payment Screen</h3>
              <button 
                onClick={() => setShowPaymentForm(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Service Name</span>
                <span className="font-semibold text-slate-900">{booking.selectedService || booking.serviceId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Vendor Name</span>
                <span className="font-semibold text-slate-900">{booking.vendorId?.name || 'Assigned Vendor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Booking ID</span>
                <span className="font-mono text-xs font-semibold text-slate-900">{booking._id}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-base">
                <span className="text-slate-700">Total Amount</span>
                <span className="text-sky-700 font-black">PKR {(booking.escrowAmount || booking.serviceStartingPrice)?.toLocaleString()}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-200/60 pt-2">
                🔒 <strong>Escrow Information:</strong> Payment goes into Admin Escrow. Funds are secured by ResolveIt and only released to the vendor upon final admin verification.
              </div>
            </div>

            <form onSubmit={handleFinalPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Select Payment Method</label>
                <div className="grid gap-2 grid-cols-2">
                  {[
                    { id: 'credit_card', label: 'Credit Card' },
                    { id: 'debit_card', label: 'Debit Card' },
                    { id: 'wallet', label: 'ResolveIt Wallet' },
                    { id: 'upi', label: 'UPI' }
                  ].map((method) => (
                    <label key={method.id} className={`flex items-center gap-2 border rounded-lg p-2.5 cursor-pointer transition-colors text-xs ${
                      paymentMethod === method.id ? 'border-sky-500 bg-sky-50 font-bold text-sky-700' : 'border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-sky-600"
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Card Number</label>
                    <Input
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date</label>
                      <Input 
                        placeholder="MM/YY" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(e.target.value)} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">CVV</label>
                      <Input 
                        placeholder="123" 
                        value={cardCvv} 
                        type="password" 
                        maxLength="3" 
                        onChange={(e) => setCardCvv(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                >
                  {isSubmittingPayment ? 'Processing...' : '👉 PAY NOW'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>

      {/* Proof Lightbox Modal */}
      {lightbox.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(lb => ({ ...lb, open: false }))}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light z-10"
            onClick={() => setLightbox(lb => ({ ...lb, open: false }))}
          >
            ✕
          </button>

          {lightbox.urls.length > 1 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white text-4xl font-light z-10 px-4 py-8"
              onClick={(e) => { e.stopPropagation(); setLightbox(lb => ({ ...lb, idx: (lb.idx - 1 + lb.urls.length) % lb.urls.length })) }}
            >
              ‹
            </button>
          )}

          <div className="relative max-w-4xl max-h-[90vh] w-full px-16" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.urls[lightbox.idx]}
              alt={`proof-fullsize-${lightbox.idx}`}
              className="max-h-[85vh] w-full object-contain rounded-lg shadow-2xl"
            />
            <div className="text-center text-white/60 text-xs mt-2">
              {lightbox.idx + 1} / {lightbox.urls.length}
            </div>
          </div>

          {lightbox.urls.length > 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white text-4xl font-light z-10 px-4 py-8"
              onClick={(e) => { e.stopPropagation(); setLightbox(lb => ({ ...lb, idx: (lb.idx + 1) % lb.urls.length })) }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}
