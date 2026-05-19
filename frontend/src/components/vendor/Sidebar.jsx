import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/vendor/dashboard', label: 'Dashboard' },
  { to: '/vendor/requests', label: 'Job Requests' },
  { to: '/vendor/jobs', label: 'Active Jobs' },
  { to: '/vendor/earnings', label: 'Earnings' },
  { to: '/vendor/support', label: 'Messages / Support' },
  { to: '/vendor/profile', label: 'Profile' },
]

export default function VendorSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const renderNav = (onLinkClick) => (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold">V</div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Vendor</div>
          <div className="text-xs text-slate-500">Welcome back</div>
        </div>
      </div>

      <nav>
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                onClick={onLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-rose-50 text-rose-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <span className="h-6 w-6 rounded-md bg-slate-100 text-center text-xs leading-6">{it.label[0]}</span>
                <span>{it.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )

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
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold">V</div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Vendor</div>
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
            {renderNav(() => setMobileMenuOpen(false))}
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-4 text-sm md:block">
        {renderNav()}
      </aside>
    </>
  )
}
