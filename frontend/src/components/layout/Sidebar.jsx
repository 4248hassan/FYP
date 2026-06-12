import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const customerLinks = [
    { to: '/customer', label: 'Dashboard' },
    { to: '/customer/book-service', label: 'Book a Service' },
    { to: '/customer/bookings', label: 'My Bookings' },
    { to: '/customer/payments', label: 'Payments' },
    { to: '/customer/support', label: 'Messages / Support' },
    { to: '/customer/profile', label: 'Profile' },
  ]

  const renderCustomerNav = (onLinkClick) => (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold">RI</div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Customer</div>
          <div className="text-xs text-slate-500">Welcome back</div>
        </div>
      </div>

      <nav>
        <ul className="space-y-2">
          {customerLinks.map((it) => (
            <li key={it.to}>
              <Link
                to={it.to}
                onClick={onLinkClick}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive(it.to) ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="h-6 w-6 rounded-md bg-slate-100 text-center text-xs leading-6">{it.label[0]}</span>
                <span>{it.label}</span>
              </Link>
            </li>
          ))}

          <li>
            <button
              onClick={() => {
                logout()
                navigate('/auth/login')
                if (onLinkClick) onLinkClick()
              }}
              className="mt-4 w-full rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </>
  )

  if (user?.role === 'customer') {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed left-4 top-[73px] z-30 rounded-md bg-white p-2 shadow-lg border border-slate-200 md:hidden"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6 text-slate-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-72 shrink-0 border-r border-slate-200 bg-white p-4 text-sm shadow-xl md:hidden">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold">RI</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Customer</div>
                    <div className="text-xs text-slate-500">Welcome back</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {renderCustomerNav(() => setMobileMenuOpen(false))}
            </aside>
          </>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-4 text-sm md:block">
          {renderCustomerNav()}
        </aside>
      </>
    )
  }

  const vendorLinks = [
    { to: '/vendor/dashboard', label: 'Dashboard' },
    { to: '/vendor/jobs', label: 'All Jobs' },
    { to: '/vendor/wallet', label: '👛 My Wallet' },
    { to: '/vendor/profile', label: 'Profile' },
  ]

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/escrow', label: '💳 Escrow' },
    { to: '/admin/wallet', label: '👛 Admin Wallet' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/vendors', label: 'Vendors' },
    { to: '/admin/complaints', label: 'Complaints' },
    { to: '/admin/profile', label: 'Profile' },
  ]

  const renderVendorNav = (onLinkClick) => (
    <>
      <div className="mb-6 font-semibold text-slate-900">Navigation</div>
      <ul className="space-y-2">
        {vendorLinks.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              onClick={onLinkClick}
              className={`block rounded-md px-3 py-2 ${
                isActive(link.to)
                  ? 'bg-sky-100 text-sky-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )

  const renderAdminNav = (onLinkClick) => (
    <>
      <div className="mb-6 font-semibold text-slate-900">Navigation</div>
      <ul className="space-y-2">
        {adminLinks.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              onClick={onLinkClick}
              className={`block rounded-md px-3 py-2 ${
                isActive(link.to)
                  ? 'bg-sky-100 text-sky-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )

  if (user?.role === 'vendor') {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed left-4 top-[73px] z-30 rounded-md bg-white p-2 shadow-lg border border-slate-200 md:hidden"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6 text-slate-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-64 shrink-0 border-r border-slate-200 bg-slate-50 p-4 text-sm shadow-xl md:hidden">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-semibold text-slate-900">Navigation</div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {renderVendorNav(() => setMobileMenuOpen(false))}
            </aside>
          </>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200 bg-slate-50 p-4 text-sm md:block">
          {renderVendorNav()}
        </aside>
      </>
    )
  }

  if (user?.role === 'admin') {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed left-4 top-[73px] z-30 rounded-md bg-white p-2 shadow-lg border border-slate-200 md:hidden"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6 text-slate-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-64 shrink-0 border-r border-slate-200 bg-slate-50 p-4 text-sm shadow-xl md:hidden">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-semibold text-slate-900">Navigation</div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {renderAdminNav(() => setMobileMenuOpen(false))}
            </aside>
          </>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200 bg-slate-50 p-4 text-sm md:block">
          {renderAdminNav()}
        </aside>
      </>
    )
  }

  return null
}
