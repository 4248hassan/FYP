import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'

export default function AdminWallet() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/admin/wallet')
      setData(res.data)
    } catch (err) {
      console.error('[admin/Wallet] failed to load wallet data', err)
      setError(err.response?.data?.message || err.message || 'Failed to retrieve administrative wallet details from the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-28" />
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl h-80" />
          </div>
        </main>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 text-xl">
              👛
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Wallet</h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="secondary" className="text-sm">
                Refresh Page
              </Button>
              <Button onClick={() => load()} className="text-sm">
                Retry Connection
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )

  const commissionBalance   = data?.commissionBalance || 0
  const escrowBalance       = data?.escrowBalance || 0
  const totalReleased       = data?.totalReleased || 0
  const pendingCount        = data?.pendingCount || 0
  const pendingAmount       = data?.pendingAmount || 0
  const transactions        = data?.transactions || []

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-4xl space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">👛 Admin Wallet</h1>
                <p className="text-sm text-slate-500 mt-1">Platform commissions, escrow tracking, and financial history</p>
              </div>
              <Link to="/admin"><Button variant="ghost">← Dashboard</Button></Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-md flex flex-col justify-between">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Total Commission Earned</p>
                  <p className="text-2xl font-black tracking-tight mt-1">
                    PKR {commissionBalance.toLocaleString()}
                  </p>
                </div>
                <p className="mt-3 text-[10px] text-indigo-100 opacity-80 font-medium">5% platform service fee profit</p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Escrow Balance</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">PKR {escrowBalance.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-amber-500 mt-3 font-medium">Locked in platform escrow vaults</p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Released Payments</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">PKR {totalReleased.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-emerald-500 mt-3 font-medium">Gross payout volume completed</p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Escrow Payments</p>
                  <p className="text-2xl font-black text-indigo-650 mt-1">{pendingCount} Payment{pendingCount !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-[10px] text-indigo-500 mt-3 font-medium">Valued at PKR {pendingAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Transaction Ledger */}
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Transaction History</h2>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
                  {transactions.length} record{transactions.length !== 1 ? 's' : ''}
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="text-5xl mb-3">📊</div>
                  <p className="text-sm font-semibold">No platform transactions found</p>
                  <p className="text-xs mt-1">Commission earnings and escrow holds will be logged here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.map((tx, idx) => {
                    const isHold = tx.type === 'escrow_hold'
                    const isRelease = tx.type === 'escrow_release'
                    const isCommission = tx.type === 'commission'
                    
                    let typeBadgeColor = 'bg-slate-100 text-slate-700'
                    let amountColor = 'text-slate-800'
                    let sign = ''

                    if (isCommission) {
                      typeBadgeColor = 'bg-indigo-100 text-indigo-700 font-semibold'
                      amountColor = 'text-indigo-700'
                      sign = '+'
                    } else if (isHold) {
                      typeBadgeColor = 'bg-amber-100 text-amber-700'
                      amountColor = 'text-amber-700'
                      sign = '+'
                    } else if (isRelease) {
                      typeBadgeColor = 'bg-emerald-100 text-emerald-700'
                      amountColor = 'text-emerald-700'
                      sign = '-'
                    }

                    const booking = tx.bookingId
                    const customerName = booking?.customerId?.name || 'Unknown'
                    const vendorName = booking?.vendorId?.name || 'Unknown'
                    const bookingAmount = booking?.amount || booking?.escrowAmount || 0
                    const commission = Number((bookingAmount * 0.05).toFixed(2))
                    const vendorPayout = Number((bookingAmount * 0.95).toFixed(2))

                    return (
                      <div key={tx._id || idx} className="px-5 py-4 hover:bg-slate-50 transition-colors flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg bg-slate-100 text-slate-600`}>
                              ₨
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                {tx.description}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Date: {new Date(tx.createdAt).toLocaleDateString('en-PK', {
                                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-black ${amountColor}`}>
                              {sign} PKR {Math.abs(tx.amount)?.toLocaleString()}
                            </p>
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${typeBadgeColor}`}>
                              {tx.type?.replace(/_/g, ' ')?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {booking && (
                          <div className="ml-14 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-150 text-[11px] text-slate-600">
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Booking ID</span>
                              <span className="font-mono text-slate-800 bg-slate-200/50 px-1 py-0.5 rounded">{booking._id}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Customer / Vendor</span>
                              <span className="text-slate-800 font-semibold">{customerName}</span>
                              <span className="text-slate-400 font-normal"> → </span>
                              <span className="text-slate-800 font-semibold">{vendorName}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Booking Amount</span>
                              <span className="text-slate-800 font-medium">PKR {bookingAmount.toLocaleString()}</span>
                              <span className="text-slate-400 font-normal"> (Com 5%: </span>
                              <span className="text-indigo-600 font-bold">PKR {commission.toLocaleString()}</span>
                              <span className="text-slate-400 font-normal">)</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Vendor Payout (95%)</span>
                              <span className="text-emerald-600 font-extrabold">PKR {vendorPayout.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
