import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Support', to: '/support' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to logout?')
      if (!confirmed) return
    }
    logout()
    navigate('/auth/login')
    setMobileMenuOpen(false)
  }

  const dashboardPath =
    (user?.role === 'customer' && '/customer') ||
    (user?.role === 'vendor' && '/vendor') ||
    (user?.role === 'admin' && '/admin') ||
    null

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-50 rounded-md bg-sky-600 px-3 py-2 text-xs font-semibold text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900" aria-label="ResolveIt home">
          ResolveIt
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex" aria-label="Main navigation">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)
              return (
                <li key={link.to} className="list-none">
                  <Link
                    to={link.to}
                    aria-current={isActive ? 'page' : undefined}
                    className={`pb-1 text-sm transition hover:text-sky-700 inline-block cursor-pointer pointer-events-auto ${
                      isActive ? 'border-b-2 border-sky-600 text-sky-700' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <>
                <Link
                  to="/auth/login"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                >
                  Login
                </Link>
                <Link to="/auth/register">
                  <Button className="h-9 rounded-full px-4 text-sm">Register</Button>
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                {dashboardPath && (
                  <Link
                    to={dashboardPath}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-xs text-slate-700 hover:text-sky-700"
                  >
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4" aria-label="Mobile navigation">
            <ul className="space-y-3">
              {navLinks.map((link) => {
                const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                  >
                    Login
                  </Link>
                  <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  {dashboardPath && (
                    <Link
                      to={dashboardPath}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-md border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full text-slate-700 hover:text-sky-700"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
