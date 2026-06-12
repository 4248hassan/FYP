import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'

export default function VendorWallet() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await api.get('/vendor/wallet')
        if (mounted) setData(res.data)
      } catch {
        if (mounted) setError('Failed to load wallet data.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex"><Sidebar /><main className="flex-1 p-6"><Loader label="Loading wallet..." /></main></div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex"><Sidebar /><main className="flex-1 p-6"><Card><p className="text-red-600 p-4 text-sm">{error}</p></Card></main></div>
    </div>
  )

  const balance = data?.balance || 0
  const totalEarnings = data?.totalEarnings || 0
  const escrowPendingAmount = data?.escrowPendingAmount || 0
  const releasedPayments = data?.releasedPayments || 0
  const transactions = data?.transactions || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-4xl space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">👛 My Wallet</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your payouts and check your transaction logs</p>
              </div>
              <Link to="/vendor/dashboard"><Button variant="ghost">← Dashboard</Button></Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 text-white shadow-md flex flex-col justify-between">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Available Balance</p>
                  <p className="text-3xl font-black tracking-tight mt-1">
                    PKR {balance.toLocaleString()}
                  </p>
                </div>
                <p className="mt-3 text-[10px] text-indigo-100 opacity-80 font-medium">Ready for withdrawal</p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Earnings</p>
                  <p className="text-2xl font-black text-slate-950 mt-1">PKR {totalEarnings.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">Your 95% share of released jobs</p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Escrow Pending</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">PKR {escrowPendingAmount.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-amber-500 mt-3 font-medium">Held securely in Admin Escrow</p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Released Payments</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">PKR {releasedPayments.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-emerald-500 mt-3 font-medium">Gross released escrow amount</p>
              </div>
            </div>

            {/* Transaction History */}
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Transaction History</h2>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="text-5xl mb-3">💸</div>
                  <p className="text-sm font-semibold">No transactions found</p>
                  <p className="text-xs mt-1">Escrow payments will show here after release by Admin</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.map((tx, idx) => {
                    const isCredit = tx.type === 'credit'
                    const booking = tx.bookingId
                    return (
                      <div key={tx._id || idx} className="px-5 py-4 hover:bg-slate-50 transition-colors flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                              isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              ₨
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                {tx.description || (isCredit ? 'Payout Credit' : 'Withdrawal')}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Payment Date: {new Date(tx.createdAt).toLocaleDateString('en-PK', {
                                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-base font-black ${isCredit ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isCredit ? '+' : '-'} PKR {tx.amount?.toLocaleString()}
                            </p>
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                              isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {tx.type?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {booking && (
                          <div className="ml-14 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-[11px] text-slate-600">
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Booking ID</span>
                              <span className="font-mono text-slate-800 bg-slate-200/50 px-1.5 py-0.5 rounded">{booking._id || booking}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Amount Received</span>
                              <span className="text-emerald-600 font-extrabold text-xs">PKR {tx.amount?.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Status</span>
                              <span className="text-emerald-700 font-extrabold uppercase text-[9px] bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded inline-block">
                                {tx.status || 'Paid'}
                              </span>
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
