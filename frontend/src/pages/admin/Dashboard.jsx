import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Loader from '../../components/ui/Loader'
import Button from '../../components/ui/Button'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchStats() {
    try {
      setLoading(true)
      setError(null)
      console.debug('[admin/Dashboard] requesting /admin/dashboard')
      const response = await api.get('/admin/dashboard')
      console.debug('[admin/Dashboard] dashboard response', response.data)
      setStats(response.data)
    } catch (err) {
      console.error('[admin/Dashboard] failed to load dashboard stats', err)
      const statusText = err.response ? `Status Code: ${err.response.status} (${err.response.statusText || 'N/A'})` : 'Network Error';
      const detail = err.response?.data?.message || err.message || 'Unknown error';
      setError(`Failed to retrieve stats (Endpoint: GET /admin/dashboard). ${statusText} - Detail: ${detail}`);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6">
            <div className="mx-auto max-w-6xl animate-pulse">
              <div className="mb-6">
                <div className="h-7 w-48 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-72 bg-slate-200 rounded" />
              </div>

              <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 h-24 flex flex-col justify-between">
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                    <div className="h-6 w-16 bg-slate-200 rounded mt-2" />
                  </div>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white border border-slate-200 rounded-xl p-5 h-44" />
                <div className="bg-white border border-slate-200 rounded-xl p-5 h-44" />
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 text-xl">
                ⚠️
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Dashboard</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {error}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} variant="secondary" className="text-sm">
                  Refresh Page
                </Button>
                <Button onClick={() => fetchStats()} className="text-sm">
                  Retry Connection
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    if (!stats?.chartData || stats.chartData.length === 0) {
      return <div className="py-12 text-center text-slate-400 text-sm">No data available</div>;
    }

    const data = stats.chartData;
    const maxValue = Math.max(...data.map(d => d.value), 5);
    
    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    const points = data.map((d, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.value / maxValue) * chartHeight;
      return { x, y, label: d.label, value: d.value };
    });
    
    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z` 
      : "";

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + chartHeight * ratio;
            const val = Math.round(maxValue * (1 - ratio));
            return (
              <g key={index}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  fill="#94a3b8" 
                  fontSize="10" 
                  textAnchor="end"
                  className="font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {areaD && (
            <path d={areaD} fill="url(#chartGradient)" />
          )}

          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                fill="#ffffff" 
                stroke="#0ea5e9" 
                strokeWidth="2" 
                className="hover:r-6 transition-all duration-200"
              />
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <rect 
                  x={p.x - 18} 
                  y={p.y - 25} 
                  width="36" 
                  height="18" 
                  rx="4" 
                  fill="#1e293b" 
                />
                <text 
                  x={p.x} 
                  y={p.y - 13} 
                  fill="#ffffff" 
                  fontSize="9" 
                  textAnchor="middle" 
                  className="font-bold"
                >
                  {p.value}
                </text>
              </g>
            </g>
          ))}

          {points.map((p, idx) => (
            <text 
              key={idx}
              x={p.x} 
              y={height - 10} 
              fill="#64748b" 
              fontSize="10" 
              textAnchor="middle"
              className="font-medium"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  const cards = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers ?? 0,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      icon: '👥',
    },
    {
      label: 'Total Vendors',
      value: stats.totalVendors ?? 0,
      color: 'bg-sky-50 text-sky-700 border-sky-100',
      icon: '🔧',
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings ?? 0,
      color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
      icon: '📆',
    },
    {
      label: 'Active Bookings',
      value: stats.activeBookings ?? 0,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      icon: '⚡',
    },
    {
      label: 'Completed Bookings',
      value: stats.completedBookings ?? 0,
      color: 'bg-green-50 text-green-700 border-green-100',
      icon: '✅',
    },
    {
      label: 'Pending Bookings',
      value: stats.pendingBookings ?? 0,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      icon: '⏳',
    },
    {
      label: 'Total Revenue',
      value: `PKR ${(stats.totalRevenue ?? 0).toLocaleString()}`,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: '💰',
    },
    {
      label: 'Escrow Amount',
      value: `PKR ${(stats.escrowAmount ?? 0).toLocaleString()}`,
      color: 'bg-teal-50 text-teal-700 border-teal-100',
      icon: '🔒',
    },
    {
      label: 'Total Complaints',
      value: stats.totalComplaints ?? 0,
      color: 'bg-rose-50 text-rose-700 border-rose-100',
      icon: '⚠️',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Overview of platform statistics and pending approvals
              </p>
            </div>

            <div className="mb-4 sm:mb-6 grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
              {cards.map((card) => (
                <Card key={card.label} className="overflow-hidden">
                  <div className={`${card.color} p-3 sm:p-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                          {card.label}
                        </p>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">{card.value}</p>
                      </div>
                      <span className="text-xl sm:text-2xl">{card.icon}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card header="Pending Approvals">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg bg-yellow-50 p-3 sm:p-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-900">
                          {stats.pendingVendors} vendors pending verification
                        </p>
                        <p className="text-xs text-slate-600">Requires admin approval</p>
                      </div>
                    </div>
                  </div>
                  <Link to="/admin/vendors">
                    <Button className="w-full text-sm">Manage Vendors</Button>
                  </Link>
                </div>
              </Card>

              <Card header="Recent Activity">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border border-slate-200 p-3">
                    <div className="flex-1 w-full">
                      <p className="text-xs sm:text-sm font-medium text-slate-900">
                        {stats.openComplaints} open complaints
                      </p>
                      <p className="text-xs text-slate-600">Need attention</p>
                    </div>
                  </div>
                  <Link to="/admin/complaints">
                    <Button variant="secondary" className="w-full text-sm">
                      Manage Complaints
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <Card header="📊 Platform Overview">
                <div className="p-4 bg-white rounded-xl border border-slate-100">
                  {renderChart()}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
